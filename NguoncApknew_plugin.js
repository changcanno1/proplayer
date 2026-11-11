// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
/* =============================================================================
   NGUONC DIRECT SCRAPE — GHI CHÚ KỸ THUẬT (cập nhật 2026-10)

   LUỒNG ĐANG DÙNG (không cần WebView, không cần hook crypto):
   1) POST <embed.php?hash=...>
      body: {
        action:"bootstrap",
        referrer:"https://embed.streamc.xyz/",   // referer tin cậy => turnstileEnabled=false
        frame_origins:["https://embed.streamc.xyz"],
        request_grant:true,
        playlist_format:"hls",                   // "hls" trả playlist RÕ, không mã hóa
        bootstrap_format:"json",                 // tránh envelope AES-GCM của bootstrap
        pretty_url:true, path_chunks:true
      }
      -> { bootstrap, video, turnstileEnabled, api, ... }

   2) POST cùng URL
      body: {
        action:"issue", bootstrap:<token>, turnstile_response:"",
        playlist_format:"hls", pretty_url:true, path_chunks:true,
        frame_origins:["https://embed.streamc.xyz"]
      }
      -> { playlist:"https://embedN.streamc.xyz/<token>" }

   3) GET playlist (kèm Referer/Origin = origin của embed)
      -> #EXTM3U rõ; segment thường là .png nhưng thực chất là MPEG-TS.

   4) Trả về:
      - m3u8Content: playlist đã chuyển URL tương đối thành tuyệt đối (cho ExoPlayer/VAAPP).
      - url: blob URL của chính playlist nếu môi trường có Blob/URL.createObjectURL
             (cho WebView/web player dùng HLS.js). Native QuickJS không có Blob nên bỏ qua.

   CÁC ĐIỂM CẦN SỬA NHANH KHI WEB ĐỔI:
   - Lỗi 403 {"error":"verification_required"}:
       Server đang bật Turnstile. Thử đổi referrer trong refs[] (embed.streamc.xyz,
       phim.nguonc.com) hoặc bổ sung origin mới vào frame_origins.
   - Playlist có #ENC-AESGCM:
       Server ép định dạng aesgcm-v2. Khi đó:
         key = HMAC-SHA256("stream-derive-v1", videoHash)
         iv  = giá trị sau "#ENC-AESGCM;iv="
         data= các dòng sau "#EXT-X-B65" (base64, 16 byte cuối là GCM tag)
       Giải mã AES-GCM rồi mới trả m3u8.
   - Bootstrap trả {"format":"aesgcm-v1","iv","data"}:
       Đang bị ép envelope. Đổi bootstrap_format về "json"; nếu vẫn lỗi thì giải mã
       AES-GCM với key = SHA256("stream-bootstrap-v1\n" + apiUrl), AAD = chuỗi đó.
   - Segment trả 403:
       Referer phải đúng origin của embed (vd: https://embed15.streamc.xyz/),
       không dùng origin của CDN hay phim.nguonc.com.
   - Playlist 404 / hết hạn:
       Token issue có TTL ngắn; gọi lại bootstrap + issue, không cache playlist quá lâu.
   - Đổi domain player:
       Chỉ cần thay NGUONC_REF và danh sách refs[]; logic còn lại giữ nguyên.
   - WebView vẫn mở iframe dù plugin đã direct:
       Hook cũ (hookplugin.js bản cũ) đang ghi đè parseDetailResponse.
       Plugin tự khoá parseDetailResponse ở cuối file để hook không ghi đè được,
       đồng thời tự xoá __HTTP_CACHE__ và tự fallback embed khi direct lỗi.
============================================================================= */
var popuphtml = "";
function getManifest() {
    return JSON.stringify({
        "id": "nguoncnew",
        "name": "Phim NguonC VIP",
        "version": "3.2",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/nguoncnew.png",
        "isEnabled": true,
        "type": "MOVIE",
        "popup_html": popuphtml,
        "author": "Alokillgtv",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'the-loai' },
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'phim-moi-cap-nhat' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'TV Shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'updated' },
            { name: 'Mới nhất', value: 'new' },
            { name: 'Lượt xem', value: 'view' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "updated"; // updated, view, year

        // Handle "Phim Mới Cập Nhật" specially if no filter
        if (slug === 'phim-moi-cap-nhat' && !filters.category && !filters.country && !filters.year) {
            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + page;
        }

        // Priority 1: Category Support //v1/api/the-loai/{slug}
        if (filters.category) {
            return "https://phim.nguonc.com/api/films/the-loai/" + filters.category + "?page=" + page + "&sort=" + sort;
        }

        // Priority 2: Country Support //v1/api/quoc-gia/{slug}
        if (filters.country) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + filters.country + "?page=" + page + "&sort=" + sort;
        }

        // Priority 3: Year Support //v1/api/nam-phat-hanh/{year}
        if (filters.year) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + filters.year + "?page=" + page + "&sort=" + sort;
        }

        // --- Slug-based Logic (if no active filter) ---

        // Handle Years (4 digits)
        if (/^\d{4}$/.test(slug)) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + slug + "?page=" + page + "&sort=" + sort;
        }

        // Handle specific Lists (Danh sách)
        var listSlugs = ['phim-le', 'phim-bo', 'phim-dang-chieu', 'tv-shows', 'subteam'];
        // Note: 'hoat-hinh' is sometimes a list, sometimes a category. 
        // On NguonC, 'hoat-hinh' is usually in 'the-loai' but let's check standard lists.
        // NguonC commonly puts 'phim-hoat-hinh' in lists or 'hoat-hinh' in genres.

        if (listSlugs.indexOf(slug) >= 0) {
            // If slug is 'hoat-hinh', prefer 'the-loai' logic unless we know it's a list
            if (slug !== 'hoat-hinh') {
                return "https://phim.nguonc.com/api/films/danh-sach/" + slug + "?page=" + page + "&sort=" + sort;
            }
        }

        // Handle Countries (Fallback if slug matches country list)
        var countrySlugs = [
            'au-my', 'anh', 'trung-quoc', 'indonesia', 'viet-nam', 'phap', 'hong-kong',
            'han-quoc', 'nhat-ban', 'thai-lan', 'dai-loan', 'nga', 'ha-lan',
            'philippines', 'an-do', 'quoc-gia-khac'
        ];
        if (countrySlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + slug + "?page=" + page + "&sort=" + sort;
        }

        // Default to Genres (Thể loại)
        return "https://phim.nguonc.com/api/films/the-loai/" + slug + "?page=" + page + "&sort=" + sort;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword) + "&page=1";
    }
}


function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return "https://phim.nguonc.com/api/film/" + slug;
}

// Just returning the home page to trigger the parser, which will return hardcoded data
function getUrlCategories() { return "https://phim.nguonc.com"; }
function getUrlCountries() { return "https://phim.nguonc.com"; }
function getUrlYears() { return "https://phim.nguonc.com"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson, url) {
    console.log("List\n" + url)
    try {
        var response = JSON.parse(apiResponseJson);
        // Handle NguonC structure: sometimes data is array directly (search), sometimes an object (list)
        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        }

        // Handle NguonC 'paginate' structure
        // User provided: "paginate": { "current_page": 1, ... }
        var paginate = response.paginate || response.pagination || (data.params && data.params.pagination) || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                // Handle different field names for current episode
                episode_current: item.current_episode || item.episode_current || "",
                // Handle different field names for language
                lang: item.language || item.lang || ""
            };
        });

        // Determine pagination values
        var currentPage = paginate.current_page || paginate.currentPage || 1;
        var totalItems = paginate.total_items || paginate.totalItems || 0;
        var itemsPerPage = paginate.items_per_page || paginate.itemsPerPage || paginate.totalItemsPerPage || 24;

        // Calculate total pages if not provided directly
        var totalPages = paginate.total_page || paginate.totalPages || 0;
        if (totalPages === 0 && itemsPerPage > 0) {
            totalPages = Math.ceil(totalItems / itemsPerPage);
        }
        if (totalPages === 0) totalPages = 1;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        // Normalize movie object (supports standard and potential variants)
        var movie = response.movie || (response.data && response.data.item) || response.data || {};

        // Normalize episodes
        var rawEpisodes = movie.episodes || response.episodes
            || (response.data && response.data.item && response.data.item.episodes) || [];

        var servers = [];
        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function (server) {
                var episodes = [];
                var serverItems = server.items || server.server_data || [];

                if (Array.isArray(serverItems)) {
                    serverItems.forEach(function (ep) {
                        var embed = ep.embed || ep.link_embed || "";
                        var m3u8 = ep.m3u8 || ep.link_m3u8 || "";

                        // Use Embed URL as ID to allow scraping Referer/M3u8 details
                        // If no embed, use m3u8 directly.
                        var link = embed || m3u8;

                        if (link) {
                            episodes.push({
                                id: link,
                                name: ep.name || ep.episode_name || "",
                                slug: ep.slug || ep.episode_slug || ""
                            });
                        }
                    });
                }

                if (episodes.length > 0) {
                    servers.push({
                        name: server.server_name || server.name || "Server",
                        episodes: episodes
                    });
                }
            });
        }

        // Helper to extract category/country/year
        // Handles both { "1": { group: ..., list: [...] } } AND typical arrays
        var extractGroup = function (categoryObj, groupName) {
            if (!categoryObj) return "";

            // If it's an object with keys "1", "2"...
            for (var key in categoryObj) {
                var group = categoryObj[key];
                if (group && group.group && group.group.name === groupName && group.list && group.list.length > 0) {
                    return group.list.map(function (item) { return item.name; }).join(", ");
                }
            }
            return "";
        };

        var extractedYear = extractGroup(movie.category, "Năm");

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description: (movie.description || movie.content || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year || extractedYear) || 0,
            rating: parseFloat(movie.view) || 0,
            quality: movie.quality || "",
            servers: servers,
            episode_current: movie.current_episode || movie.episode_current || "",
            lang: movie.language || movie.lang || "",
            casts: movie.casts || movie.actor || "", // Fallback to 'actor' if casts is missing
            director: movie.director || "",
            category: extractGroup(movie.category, "Thể loại"),
            country: extractGroup(movie.category, "Quốc gia"),
            view: parseInt(movie.view) || 0,
            status: movie.status || ""
        });
    } catch (error) {
        return "{}";
    }
}


var NGUONC_UA = "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
var NGUONC_REF = "https://embed.streamc.xyz/";

function nguoncOrigin(url) {
    var m = /^(https?:\/\/[^\/]+)/i.exec(String(url || ""));
    return m ? m[1] : "";
}

function nguoncPostJson(api, payload, referer) {
    return httpRequest(api, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
            "User-Agent": NGUONC_UA,
            "Referer": referer || NGUONC_REF,
            "Origin": nguoncOrigin(api)
        },
        body: JSON.stringify(payload)
    });
}

function nguoncBootstrap(api, referer) {
    var frameOrigin = String(referer || NGUONC_REF).replace(/\/+$/, "");
    var res = nguoncPostJson(api, {
        action: "bootstrap",
        referrer: referer || NGUONC_REF,
        frame_origins: [frameOrigin],
        request_grant: true,
        playlist_format: "hls",
        pretty_url: true,
        path_chunks: true,
        bootstrap_format: "json"
    }, referer);
    if (!res || res.status !== 200) throw new Error("bootstrap HTTP " + (res ? res.status : "?"));
    return JSON.parse(res.body);
}

function nguoncAbsoluteUrl(base, rel) {
    rel = String(rel || "").trim();
    if (!rel) return rel;
    if (/^(https?:|data:|blob:)/i.test(rel)) return rel;
    if (rel.indexOf("//") === 0) {
        var pm = /^(https?:)/i.exec(base);
        return pm ? pm[1] + rel : rel;
    }
    if (rel.charAt(0) === "/") return nguoncOrigin(base) + rel;
    if (rel.charAt(0) === "#") return base + rel;
    if (rel.charAt(0) === "?") return base.split("?")[0] + rel;
    var i = base.lastIndexOf("/");
    return (i > base.indexOf("://") + 2 ? base.substring(0, i + 1) : base + "/") + rel;
}

function nguoncAbsolutizePlaylist(m3u8, base) {
    var lines = String(m3u8 || "").split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
        var t = lines[i].trim();
        if (!t) continue;
        if (t.charAt(0) !== "#") {
            lines[i] = nguoncAbsoluteUrl(base, t);
            continue;
        }
        lines[i] = lines[i].replace(/URI="([^"]+)"/g, function (m, u) {
            return 'URI="' + nguoncAbsoluteUrl(base, u) + '"';
        });
    }
    return lines.join("\n");
}

function nguoncResolve(embedUrl) {
    var api = String(embedUrl || "").split("|")[0];
    if (!/^https?:\/\//i.test(api)) throw new Error("URL embed không hợp lệ");

    var refs = [NGUONC_REF, "https://phim.nguonc.com/"];
    var boot = null;
    var lastError = null;
    for (var i = 0; i < refs.length; i++) {
        try {
            var candidate = nguoncBootstrap(api, refs[i]);
            if (!candidate.turnstileEnabled && candidate.bootstrap) {
                boot = candidate;
                break;
            }
            lastError = new Error("Turnstile bật với referer " + refs[i]);
        } catch (e) {
            lastError = e;
        }
    }
    if (!boot) throw (lastError || new Error("Không lấy được bootstrap"));

    var requestApi = boot.api || api;
    var frameOrigin = NGUONC_REF.replace(/\/+$/, "");
    var issueRes = nguoncPostJson(requestApi, {
        action: "issue",
        bootstrap: boot.bootstrap,
        turnstile_response: "",
        playlist_format: "hls",
        pretty_url: true,
        path_chunks: true,
        frame_origins: [frameOrigin]
    }, NGUONC_REF);
    if (!issueRes || issueRes.status !== 200) throw new Error("issue HTTP " + (issueRes ? issueRes.status : "?"));
    var issue = JSON.parse(issueRes.body);
    if (!issue.playlist) throw new Error("issue không trả playlist");

    var apiOrigin = nguoncOrigin(requestApi);
    var playlistOrigin = nguoncOrigin(issue.playlist) || apiOrigin;
    var plRes = httpRequest(issue.playlist, {
        method: "GET",
        headers: {
            "Accept": "*/*",
            "User-Agent": NGUONC_UA,
            "Referer": NGUONC_REF,
            "Origin": apiOrigin
        }
    });
    if (!plRes || plRes.status !== 200) throw new Error("playlist HTTP " + (plRes ? plRes.status : "?"));
    var m3u8 = String(plRes.body || "").replace(/^\uFEFF/, "").trim();
    if (m3u8.indexOf("#EXTM3U") !== 0) throw new Error("Playlist không hợp lệ");
    m3u8 = nguoncAbsolutizePlaylist(m3u8, issue.playlist);

    var result = {
        m3u8Content: m3u8,
        baseUrl: issue.playlist,
        url: issue.playlist,
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: {
            "User-Agent": NGUONC_UA,
            "Referer": playlistOrigin + "/",
            "Origin": playlistOrigin,
            "Accept": "*/*"
        },
        subtitles: []
    };

    try {
        if (typeof Blob !== "undefined" && typeof URL !== "undefined" && URL.createObjectURL) {
            result.url = URL.createObjectURL(new Blob([m3u8], { type: "application/vnd.apple.mpegurl" })) + "#.m3u8";
        }
    } catch (e) {
        console.log("NguonC blob URL error: " + (e && e.message ? e.message : e));
    }

    return result;
}

function nguoncEmbedResult(url) {
    var api = String(url || "").split("|")[0];
    return {
        url: api,
        mimeType: "text/html",
        isEmbed: true,
        headers: {
            "Referer": NGUONC_REF,
            "Origin": NGUONC_REF,
            "User-Agent": NGUONC_UA,
            "Accept": "*/*",
            "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7"
        },
        subtitles: []
    };
}

function parseDetailResponse(html, url) {
    var api = String(url || html || "").split("|")[0];
    try {
        /* WebView: httpRequest() cache theo URL, prefetch có thể đã lưu HTML embed.
           Xoá cache để POST bootstrap/issue chạy thật. */
        try {
            if (typeof window !== "undefined" && window.__HTTP_CACHE__ && api) {
                delete window.__HTTP_CACHE__[api];
            }
        } catch (cacheErr) {}

        var result = nguoncResolve(api);
        console.log("NguonC direct: " + nguoncOrigin(result.baseUrl) + " (" + result.m3u8Content.split(/\r?\n/).length + " dòng, url=" + (result.url.indexOf("blob:") === 0 ? "blob" : "playlist") + ")");
        return JSON.stringify(result);
    } catch (e) {
        console.log("NguonC direct error: " + (e && e.message ? e.message : e) + " → fallback embed");
        return JSON.stringify(nguoncEmbedResult(api));
    }
}



// Hardcoded Categories (Genres)
function parseCategoriesResponse(apiResponseJson) {
    var genres = [
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "Hài", slug: "phim-hai" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Giả Tưởng", slug: "gia-tuong" },
        { name: "Lịch Sử", slug: "lich-su" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Nhạc", slug: "phim-nhac" },
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Lãng Mạn", slug: "lang-man" },
        { name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong" },
        { name: "Gây Cấn", slug: "gay-can" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Miền Tây", slug: "mien-tay" },
        { name: "Phim 18+", slug: "phim-18" }
    ];
    return JSON.stringify(genres);
}

// Hardcoded Countries
function parseCountriesResponse(apiResponseJson) {
    var countries = [
        { name: "Âu Mỹ", value: "au-my" },
        { name: "Anh", value: "anh" },
        { name: "Trung Quốc", value: "trung-quoc" },
        { name: "Indonesia", value: "indonesia" },
        { name: "Việt Nam", value: "viet-nam" },
        { name: "Pháp", value: "phap" },
        { name: "Hồng Kông", value: "hong-kong" },
        { name: "Hàn Quốc", value: "han-quoc" },
        { name: "Nhật Bản", value: "nhat-ban" },
        { name: "Thái Lan", value: "thai-lan" },
        { name: "Đài Loan", value: "dai-loan" },
        { name: "Nga", value: "nga" },
        { name: "Hà Lan", value: "ha-lan" },
        { name: "Philippines", value: "philippines" },
        { name: "Ấn Độ", value: "an-do" },
        { name: "Quốc gia khác", value: "quoc-gia-khac" }
    ];
    return JSON.stringify(countries);
}

// Hardcoded Years
function parseYearsResponse(apiResponseJson) {
    var years = [];
    for (var i = 2026; i >= 2004; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    // Base image URL for NguonC
    return "https://img.phimapi.com/" + path;
}

/* WebView: chặn hook cũ ghi đè parseDetailResponse và ép iframe.
   Plugin tự lo cache + fallback embed nên không cần hook nguoncnew nữa. */
(function () {
    try {
        if (typeof window === "undefined" || typeof document === "undefined" || typeof window.parseDetailResponse !== "function") return;
        Object.defineProperty(window, "parseDetailResponse", {
            value: window.parseDetailResponse,
            configurable: false,
            writable: false
        });
        console.log("[NGUONC] parseDetailResponse locked (direct)");
    } catch (e) {
        console.log("[NGUONC] lock parseDetailResponse fail: " + (e && e.message ? e.message : e));
    }
})();
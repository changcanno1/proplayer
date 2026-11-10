BASEURL = "https://clbphimxua.com";
BASESOURCE = "";
var D1_API = "https://data.drivepcthuan.workers.dev"; // D1 Worker Master API

function getManifest() {
    return JSON.stringify({
        "id": "clbpxVIP",
        "name": "CLB Phim Xưa VIP",
        "version": "2.3.1",
        "info": "Tăng tốc siêu nhanh khi duyệt phim.",
        "BASEURL": "https://clbphimxua.com",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/clbpxVIP.png",
        "headers": {
            "Referer": "https://clbphimxua.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        "isEnabled": true,
        "isAdult": false,
        "adblock": false,
        "type": "MOVIE",
        "author": "alokillgtv",
        "playerType": "exoplayer"
    });
}
function getHomeSections() {
    return JSON.stringify([{
        slug: 'home',
        title: 'Mới Cập Nhật',
        type: 'Grid',
        path: ''
    }]);
}

function getPrimaryCategories() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem("SVDATA")) {
        localStorage.removeItem("SVDATA");
    }
    return JSON.stringify([{
            name: 'Kiếm Hiệp',
            slug: 'phim-bo-kiem-hiep-co-trang'
        },
        {
            name: 'Tiên Hiệp',
            slug: 'tien-hiep-ngon-tinh'
        },
        {
            name: 'Tâm Lý',
            slug: 'tlhd'
        },
        {
            name: 'Ma Kinh Dị',
            slug: 'ma-kinh-di'
        },
        {
            name: 'Điện Ảnh Châu Á',
            slug: 'phim-hk-tk'
        },
        {
            name: 'Điện Ảnh Âu Mỹ',
            slug: 'dien-anh-tay'
        },
        {
            name: 'Hàn Quốc',
            slug: 'drama-hq-nb'
        },
        {
            name: 'Anime',
            slug: 'phim-hoat-hinh'
        },
        {
            name: 'TV Series',
            slug: 'phim-tv'
        },
        {
            name: 'Thập Niên 60',
            slug: 'thap-nien-60'
        },
        {
            name: 'Thập Niên 70',
            slug: 'thap-nien-70'
        },
        {
            name: 'Thập Niên 80',
            slug: 'thap-nien-80'
        },
        {
            name: 'Thập Niên 90',
            slug: 'thap-nien-90'
        },
        {
            name: 'Thập Niên 2000',
            slug: 'thap-nien-2000'
        }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [{
                name: 'Cũ nhất',
                value: 'oldest'
            },
            {
                name: 'Mới nhất',
                value: 'newest'
            }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var cat = (slug === '' || slug === 'home') ? 'home' : slug;

    // Trỏ thẳng về API D1 List để lấy cực nhanh
    var d1ListUrl = D1_API + "/api/list?plugin=clbpx&category=" + encodeURIComponent(cat) + "&page=" + page;
    console.log("[CLBPX-D1] getUrlList -> " + d1ListUrl);
    return d1ListUrl;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    if (page > 1) {
        return BASEURL + "/page/" + page + "/?s=" + encodeURIComponent(keyword);
    }
    return BASEURL + "/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug, datasend) {
    if (!slug) return "";
    
    // ⭐ KỸ THUẬT 0ms: Nếu item đã có sẵn full chi tiết trong datasend (do D1 list trả về)
    if (datasend && datasend.indexOf('"servers"') > -1) {
        console.log("[CLBPX-D1] getUrlDetail -> Có sẵn datasend 0ms cho slug: " + slug);
        return datasend;
    }

    // Nếu slug đã là URL hoàn chỉnh của clbphimxua
    if (slug.indexOf("http") === 0 && slug.indexOf("drivepcthuan.workers.dev") === -1) {
        return slug;
    }

    // Trả về API D1 Detail URL để App/Webview fetch JSON
    return D1_API + "/api/detail?plugin=clbpx&slug=" + encodeURIComponent(slug);
}

function parseCategoriesResponse(apiResponseJson) {
    return getPrimaryCategories();
}

function getUrlCategories() {
    return "";
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

// =============================================================================
// PARSERS
// =============================================================================

function checkAndSyncNewFilmsAsync() {
    try {
        console.log("[CLBPX-D1] Đang quét ngầm web gốc để cập nhật phim mới...");
        var webRes = httpRequest(BASEURL + "/");
        if (!webRes || !webRes.isSuccessful || !webRes.body) return;

        var regex = /<article.*?id="post-(\d+)".*?<a href="([^"]+)".*?<img.*?src="([^"]+)".*?alt="([^"]+)"/gi;
        var match;
        var metaRecords = [];

        while ((match = regex.exec(webRes.body)) !== null) {
            var pId = parseInt(match[1], 10);
            var link = match[2];
            var thumb = match[3];
            var title = match[4].replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").trim();
            var sMatch = link.match(/clbphimxua\.com\/([^\/]+)\/?/);
            var slug = sMatch ? sMatch[1] : "";

            if (slug) {
                metaRecords.push({
                    plugin: "clbpx",
                    slug: slug,
                    post_id: pId,
                    title: title,
                    poster: thumb,
                    category: "home",
                    has_detail: 0
                });
            }
        }

        if (metaRecords.length > 0) {
            httpRequest(D1_API + "/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sync-Key": "vax_auto_sync" },
                body: JSON.stringify(metaRecords)
            });
            console.log("[CLBPX-D1] Đã sync ngầm " + metaRecords.length + " metadata phim mới lên D1!");
        }
    } catch(err) {
        console.log("[CLBPX-D1] checkAndSyncNewFilmsAsync err: " + err);
    }
}

function parseListResponse(htmlResponse, url) {
    console.log("[CLBPX-D1] parseListResponse URL: " + url + " | length: " + (htmlResponse ? htmlResponse.length : 0));

    // 1. Nếu response từ D1 API (đã là JSON chuẩn { items, pagination })
    try {
        var d1Data = JSON.parse(htmlResponse);
        if (d1Data && d1Data.items && Array.isArray(d1Data.items) && d1Data.items.length > 0) {
            console.log("[CLBPX-D1] Trả về " + d1Data.items.length + " phim trực tiếp từ D1 Master!");
            return htmlResponse;
        }
    } catch(e) {
        console.log("[CLBPX-D1] parseListResponse JSON.parse err: " + e);
    }

    // 2. Nếu fallback là HTML từ web gốc
    var items = [];
    var regex = /<article.*?id="post-[^>]+>[\s\S]*?<a href="([^"]+)".*?>\s*<figure[\s\S]*?<img.*?src="([^"]+)".*?alt="([^"]+)".*?>/gi;
    var match;

    while ((match = regex.exec(htmlResponse)) !== null) {
        var link = match[1] || "";
        var thumb = match[2] || "";
        var title = match[3] || "";

        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");

        var slugMatch = link.match(/clbphimxua\.com\/([^\/]+)\/?/);
        var slug = slugMatch ? slugMatch[1] : link;
        var year = 0;
        var yearMatch = title.match(/19\d{2}|20\d{2}/);
        if (yearMatch) {
            year = parseInt(yearMatch[0], 10);
        }

        items.push({
            id: slug,
            title: title.trim(),
            posterUrl: thumb,
            backdropUrl: thumb,
            year: year
        });
    }

    var totalPages = 1;
    var currentPage = 1;
    var pageRegex = /<a class="page-numbers".*?>(\d+)<\/a>/gi;
    var pm;
    while ((pm = pageRegex.exec(htmlResponse)) !== null) {
        if (parseInt(pm[1]) > totalPages) {
            totalPages = parseInt(pm[1]);
        }
    }
    var curPageMatch = htmlResponse.match(/<span aria-current="page" class="page-numbers current">(\d+)<\/span>/i);
    if (curPageMatch) {
        currentPage = parseInt(curPageMatch[1]);
        if (currentPage > totalPages) totalPages = currentPage;
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages
        }
    });
}

function parseSearchResponse(htmlResponse) {
    return parseListResponse(htmlResponse);
}

function extractVideoId(url) {
    if (!url) return "";
    var match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : url;
}

function BASE64ENCODE(str) {
    try {
        if (!str) return "";

        var utf8Bytes = [];
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            if (code < 128) {
                utf8Bytes.push(code);
            } else if (code < 2048) {
                utf8Bytes.push((code >> 6) | 192, (code & 63) | 128);
            } else if (
                (code & 0xfc00) === 0xd800 &&
                i + 1 < str.length &&
                (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00
            ) {
                code =
                    0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
                utf8Bytes.push(
                    (code >> 18) | 240,
                    ((code >> 12) & 63) | 128,
                    ((code >> 6) & 63) | 128,
                    (code & 63) | 128,
                );
            } else {
                utf8Bytes.push(
                    (code >> 12) | 224,
                    ((code >> 6) & 63) | 128,
                    (code & 63) | 128,
                );
            }
        }

        var chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var encoded = "";
        var byte1, byte2, byte3;
        var b1, b2, b3, b4;

        for (var j = 0; j < utf8Bytes.length; j += 3) {
            byte1 = utf8Bytes[j];
            byte2 = j + 1 < utf8Bytes.length ? utf8Bytes[j + 1] : NaN;
            byte3 = j + 2 < utf8Bytes.length ? utf8Bytes[j + 2] : NaN;

            b1 = byte1 >> 2;
            b2 = ((byte1 & 3) << 4) | (isNaN(byte2) ? 0 : byte2 >> 4);
            b3 = isNaN(byte2) ?
                64 :
                ((byte2 & 15) << 2) | (isNaN(byte3) ? 0 : byte3 >> 6);
            b4 = isNaN(byte3) ? 64 : byte3 & 63;

            encoded +=
                chars.charAt(b1) +
                chars.charAt(b2) +
                chars.charAt(b3) +
                chars.charAt(b4);
        }

        return encoded;
    } catch (e) {
        console.log("[BASE64ENCODE Error]:", e.message || e);
        return "";
    }
}

function parseMovieDetail(htmlResponse, url, datasend) {
    try {
        // ⭐ 1. Nếu htmlResponse vốn là JSON MovieDetail từ D1 trả về (từ getUrlDetail 0ms)
        if (htmlResponse && typeof htmlResponse === 'string' && htmlResponse.indexOf('{"id":') === 0 && htmlResponse.indexOf('"servers"') > -1) {
            console.log("[CLBPX-D1] parseMovieDetail -> Sử dụng trực tiếp JSON từ D1 (0ms)!");
            return htmlResponse;
        }

        var id = "";
        var title = "";
        var posterUrl = "";
        var description = "";
        var saveSV = [];
        var nameMV = "";
        var slugMatch = htmlResponse.match(/<link rel="canonical" href="([^"]+)"/i);
        if (slugMatch) {
            var canonicalUrl = slugMatch[1];
            var parts = canonicalUrl.split('/');
            id = parts[parts.length - 2] || parts[parts.length - 1] || "unknown_movie";
        } else {
            id = "movie_" + new Date().getTime();
        }

        var titleMatch = htmlResponse.match(/<h1 class="single-title">([^<]+)<\/h1>/i);
        if (titleMatch) title = titleMatch[1].trim();
        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");
        nameMV = title;
        var posterMatch = htmlResponse.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i);
        if (!posterMatch) {
            posterMatch = htmlResponse.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*wp-post-image[^"]*"/i);
        }
        if (!posterMatch) {
            posterMatch = htmlResponse.match(/<article[^>]*>[\s\S]*?<figure>\s*<img[^>]*src="([^"]+)"/i);
        }
        if (posterMatch) posterUrl = posterMatch[1];
        else {
            var ogImg = htmlResponse.match(/<meta property="og:image" content="([^"]+)"/i);
            if (ogImg) posterUrl = ogImg[1];
        }

        var descMatch = htmlResponse.match(/<div class="sigle-post-content-area">([\s\S]*?)<a href/i);
        if (descMatch) {
            description = descMatch[1].replace(/<[^>]+>/g, '').trim();
        }

        var year = 0;
        var yearMatch = title.match(/(19\d{2}|20\d{2})/);
        if (yearMatch) year = parseInt(yearMatch[1], 10);

        var servers = [];
        var contentArea = "";
        var contentMatch = htmlResponse.match(/<div class="sigle-post-content-area">([\s\S]*?)<\/div>/i);
        contentArea = contentMatch ? contentMatch[1] : htmlResponse;

        var serverPatterns = [{
                pattern: /\(L\u1ed3ng Ti\u1ebfng\)/gi,
                name: "Lồng Tiếng"
            },
            {
                pattern: /\(L&#7891;ng Ti&#7871;ng\)/gi,
                name: "Lồng Tiếng"
            },
            {
                pattern: /\(Ph\u1ee5 \u0110\u1ec1\)/gi,
                name: "Phụ Đề"
            },
            {
                pattern: /\(Ph&#7909; &#272;&#7873;\)/gi,
                name: "Phụ Đề"
            },
            {
                pattern: /\(Thuy\u1ebft Minh\)/gi,
                name: "Thuyết Minh"
            },
            {
                pattern: /\(Thuy&#7871;t Minh\)/gi,
                name: "Thuyết Minh"
            }
        ];

        var boldSections = [];
        var boldRegex = /<b[^>]*>([\s\S]*?)<\/b>/gi;
        var bMatch;
        while ((bMatch = boldRegex.exec(contentArea)) !== null) {
            boldSections.push(bMatch[1]);
        }

        // ✅ Chuẩn hóa URL bằng Regex cực kỳ an toàn
        function normalizeEpUrl(rawUrl) {
            if (!rawUrl) return "";
            var pathAndQuery = rawUrl.replace(/^https?:\/\/[^\/]+/i, '');
            if (!pathAndQuery.startsWith('/')) {
                pathAndQuery = '/' + pathAndQuery;
            }
            return "https://example.com" + pathAndQuery;
        }

        if (boldSections.length > 0) {
            for (var si = 0; si < boldSections.length; si++) {
                var section = boldSections[si];
                var serverName = "";

                for (var pi = 0; pi < serverPatterns.length; pi++) {
                    serverPatterns[pi].pattern.lastIndex = 0;
                    if (serverPatterns[pi].pattern.test(section)) {
                        serverName = serverPatterns[pi].name;
                        break;
                    }
                }

                if (!serverName) {
                    var headerMatch = section.match(/^\s*\(([^)]+)\)/);
                    if (headerMatch) serverName = headerMatch[1].trim();
                }

                var sectionEpisodes = [];
                var sectionLinkRegex = /<a href="([^"]*clbpx(?:\.html)?\?v=[a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
                var slMatch;
                var saveEp = [];

                while ((slMatch = sectionLinkRegex.exec(section)) !== null) {
                    var epUrl = normalizeEpUrl(slMatch[1]);
                    var epLabel = slMatch[2].replace(/<[^>]+>/g, '').trim();

                    if (!epLabel || /^\s*$/.test(epLabel) || /<img/i.test(slMatch[2])) {
                        epLabel = sectionEpisodes.length === 0 && boldSections.length === 1 ? "Xem phim" : "Tập " + (sectionEpisodes.length + 1);
                    }

                    var vMatch = epUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                    var videoId = vMatch ? vMatch[1] : "";
                    if (videoId) saveEp.push(videoId);
                    sectionEpisodes.push({
                        id: epUrl,
                        name: epLabel,
                        slug: epUrl
                    });
                }

                if (sectionEpisodes.length > 0) {
                    var finalServerName = serverName || ("Server " + (servers.length + 1));
                    saveSV.push({
                        nameMV: nameMV,
                        name: finalServerName,
                        episodes: saveEp
                    });
                    servers.push({
                        name: finalServerName,
                        episodes: sectionEpisodes
                    });
                }
            }
        }

        if (servers.length === 0) {
            var episodes = [];
            var fallbackSaveEp = [];
            var allLinksRegex = /<a href="([^"]*clbpx(?:\.html)?\?v=[a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            var lMatch;

            while ((lMatch = allLinksRegex.exec(htmlResponse)) !== null) {
                var epUrl = normalizeEpUrl(lMatch[1]);
                var epLabel = lMatch[2].replace(/<[^>]+>/g, '').trim();

                if (!epLabel || /^\s*$/.test(epLabel) || /<img/i.test(lMatch[2])) {
                    epLabel = "Tập " + (episodes.length + 1);
                }

                var vMatch = epUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                var videoId = vMatch ? vMatch[1] : "";
                if (videoId) fallbackSaveEp.push(videoId);
                episodes.push({
                    id: epUrl,
                    name: epLabel,
                    slug: epUrl
                });
            }

            if (episodes.length > 0) {
                saveSV.push({
                    nameMV: nameMV,
                    name: "Thuyết Minh",
                    episodes: fallbackSaveEp
                });
                servers.push({
                    name: "Thuyết Minh",
                    episodes: episodes
                });
            }
        }

        var $return = JSON.stringify({
            id: id,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            rating: 0,
            quality: "HD",
            servers: servers,
            category: "",
            country: "",
            director: "",
            casts: "",
            datasend: ""
        });

        // ⭐ 2. LAZY SYNC: Tự động gửi Full Detail này lên D1 lưu lại cho những người sau!
        try {
            var sMatch = (url || "").match(/clbphimxua\.com\/([^\/]+)\/?/);
            var realSlug = sMatch ? sMatch[1] : id;
            if (realSlug && servers.length > 0) {
                console.log("[CLBPX-D1] Tự động sync Full Detail lên D1 cho slug: " + realSlug);
                httpRequest(D1_API + "/api/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Sync-Key": "vax_auto_sync" },
                    body: JSON.stringify([{
                        plugin: "clbpx",
                        slug: realSlug,
                        title: title,
                        poster: posterUrl,
                        year: year,
                        has_detail: 1,
                        detail_json: $return
                    }])
                });
            }
        } catch(syncErr) {
            console.log("[CLBPX-D1] Lazy sync err: " + syncErr);
        }

        console.log("return parseMovie\n" + $return);
        return $return;

    } catch (error) {
        console.error("parseMovieDetail error: ", error);
        return "null";
    }
}



function parseDetailResponse(htmlResponse, fallbackUrl, datasend) {
    try {
        console.log("Detailt:\n" + fallbackUrl)
        var vMatch = fallbackUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        var videoId = vMatch ? vMatch[1] : "";
        var stream = "https://abysscdn.com/?v=" + videoId;
      console.log("Stream:\n" + stream)
        return JSON.stringify({
            url: stream,
            mimeType: "video/mp4",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            }
        });
    } catch (error) {
        console.log("Lỗi parseDetail\n" + error);
    return JSON.stringify({ 
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
      mimeType: "video/mp4", 
      isEmbed: false, headers: {}, subtitles: [] 
    });
    }
}

// =============================================================================
// CẤU HÌNH DOMAIN VICDN - TỐI ƯU HÓA BỞI JS EXPERT
// =============================================================================
var BASEURL = "https://vicdn.cc"; 
var BASEAPI = BASEURL + "/api";

function getManifest() {
    return JSON.stringify({
        id: "vicdn",
        name: "ViCDN Pro",
        description: "Bản Master: Tối ưu hoá EmbedToPlay, hỗ trợ lấy trực tiếp Master M3U8 để chọn Thuyết Minh/Vietsub trên Native Player.",
        version: "7.5.0",
        baseUrl: BASEURL,
        iconUrl: BASEURL + "/vicdn.png",
        isEnabled: true,
        adblock: false,
        type: "MOVIE",
        playerType: "embedtoplay" // Vẫn giữ nguyên chế độ bắt link Native
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[Vicdn] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[Vicdn] " + msg);
    }
}

// -----------------------------------------------------------------------------
// MENU TRANG CHỦ & DANH MỤC
// -----------------------------------------------------------------------------
function getHomeSections() {
    var listurl = [
        { "link": "/update/", "name": "Phim Mới Cập Nhật", "type": "Grid" },
        { "link": "/type/hanh-dong/", "name": "Hành Động", "type": "Horizontal" },
        { "link": "/type/hoat-hinh/", "name": "Hoạt Hình", "type": "Horizontal" },
        { "link": "/type/vien-tuong/", "name": "Viễn Tưởng", "type": "Horizontal" },
        { "link": "/type/hinh-su/", "name": "Hình Sự", "type": "Horizontal" }
    ];
    var menulist = [];
    for (var i = 0; i < listurl.length; i++) {
        menulist.push({
            slug: listurl[i].link,
            title: listurl[i].name,
            type: listurl[i].type
        });
    }
    return JSON.stringify(menulist);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới Cập Nhật', slug: '/update/' },
        { name: 'Hành Động', slug: '/type/hanh-dong/' },
        { name: 'Hoạt Hình', slug: '/type/hoat-hinh/' },
        { name: 'Viễn Tưởng', slug: '/type/vien-tuong/' },
        { name: 'Hình Sự', slug: '/type/hinh-su/' },
        { name: 'Hài Hước', slug: '/type/hai-huoc/' },
        { name: 'Tình Cảm', slug: '/type/tinh-cam/' },
        { name: 'Chính Kịch', slug: '/type/chinh-kich/' },
        { name: 'Kinh Dị', slug: '/type/kinh-di/' }
    ]);
}

function getFilterConfig() { return JSON.stringify({}); }

// -----------------------------------------------------------------------------
// URL GENERATOR
// -----------------------------------------------------------------------------
function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try { page = parseInt(JSON.parse(fixedJson).page) || 1; } catch (e) {}
        }
        return BASEAPI + slug + page;
    } catch(e) { return BASEAPI + slug; }
}

function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/?q=" + encodeURIComponent(keyword.trim());
}

function getUrlDetail(slug) {
    return BASEAPI + "/info/" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// -----------------------------------------------------------------------------
// PARSER DANH SÁCH (ĐỌC TỪ API JSON)
// -----------------------------------------------------------------------------
function parseListResponse(html) {
    try {
        var json = typeof html === 'string' ? JSON.parse(html) : html;
        var data = json.data || [];
        var items = [];

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var pUrl = item.poster || "";
            if (pUrl && pUrl.indexOf("http") === -1) pUrl = "https://image.tmdb.org/t/p/w300/" + pUrl + ".jpg";
            var bUrl = item.banner || "";
            if (bUrl && bUrl.indexOf("http") === -1) bUrl = "https://image.tmdb.org/t/p/w533_and_h300_face/" + bUrl + ".jpg";

            items.push({
                "id": item.slug, 
                "title": item.vname || item.ename,
                "posterUrl": pUrl,
                "backdropUrl": bUrl,
                "quality": item.type ? item.type.toUpperCase() : "HD",
                "episode_current": "Tập " + item.stt + "/" + item.total
            });
        }

        var totalPages = json.pagination ? parseInt(json.pagination.total_pages) : 1;
        var currentPage = json.pagination ? parseInt(json.pagination.current_page) : 1;

        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": currentPage, "totalPages": totalPages }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

// -----------------------------------------------------------------------------
// PARSER TÌM KIẾM
// -----------------------------------------------------------------------------
function parseSearchResponse(html, url) {
    try {
        var startTag = "const allData = [";
        var startIdx = html.indexOf(startTag);
        
        if (startIdx === -1) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
        
        var jsonStart = startIdx + "const allData = ".length;
        var endIdx = html.indexOf("];let filteredData", jsonStart);
        if (endIdx === -1) endIdx = html.indexOf("];", jsonStart);
        if (endIdx === -1) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
        
        var jsonString = html.substring(jsonStart, endIdx + 1);
        var allData = JSON.parse(jsonString);
        var items = [];
        
        for (var i = 0; i < allData.length; i++) {
            var item = allData[i];
            var pUrl = item.poster || "";
            if (pUrl && pUrl.indexOf("http") === -1) pUrl = "https://image.tmdb.org/t/p/w300/" + pUrl + ".jpg";
            var bUrl = item.banner || "";
            if (bUrl && bUrl.indexOf("http") === -1) bUrl = "https://image.tmdb.org/t/p/w533_and_h300_face/" + bUrl + ".jpg";

            items.push({
                "id": item.slug, 
                "title": item.vname || item.ename,
                "posterUrl": pUrl,
                "backdropUrl": bUrl,
                "quality": item.type ? item.type.toUpperCase() : "HD",
                "episode_current": "Tập " + item.stt + "/" + item.total
            });
        }
        return JSON.stringify({ "items": items, "pagination": { "currentPage": 1, "totalPages": 1 } });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

// -----------------------------------------------------------------------------
// BÓC TÁCH CHI TIẾT VÀ DANH SÁCH TẬP
// -----------------------------------------------------------------------------
function parseMovieDetail(html, url) {
    try {
        var json = typeof html === 'string' ? JSON.parse(html) : html;
        var data = json.data;
        
        var limg = data.banner || data.poster || "";
        if (limg && limg.indexOf("http") === -1) limg = "https://image.tmdb.org/t/p/w533_and_h300_face/" + limg + ".jpg";
        
        var lname = data.vname || data.ename || "Đang cập nhật...";
        var ldes = data.content || "Không có mô tả.";
        var lactor = (data.cast || []).join(" - ");
        var lduran = data.duration ? data.duration + " phút" : "";
        var status = "Tập " + data.stt + "/" + data.total;
        var category = (data.genre || []).join(" - ");
        
        var episodes = [];
        if (data.list_episodes && data.list_episodes.length > 0) {
            for (var j = 0; j < data.list_episodes.length; j++) {
                var itemEpi = data.list_episodes[j];
                var splitEpi = itemEpi.split("|");
                if(splitEpi.length >= 2) {
                    episodes.push({
                        id: splitEpi[1].trim(), 
                        name: "Tập " + splitEpi[0].trim(),
                        slug: "tap-" + splitEpi[0].trim()
                    });
                }
            }
        } else if (data.mkv) {
            episodes.push({ id: data.mkv.trim(), name: "Xem Ngay", slug: "full" });
        }
        
        if (episodes.length === 0) episodes.push({ id: url, name: "Phim chưa có link", slug: "error" });
        
        return JSON.stringify({
            id: url, title: lname, posterUrl: limg, backdropUrl: limg, description: ldes,
            quality: (data.type || "HD").toUpperCase(), year: data.year || 2026, rating: 8.5,
            status: status, category: category, episode_current: "Tập " + data.stt,
            servers: [{ name: "VIP Server", episodes: episodes }],
            duration: lduran, casts: lactor
        });
    } catch (e) {
        return JSON.stringify({ id: url, title: "Lỗi tải dữ liệu", servers: [] });
    }
}

// -----------------------------------------------------------------------------
// [CẬP NHẬT] BẮT MASTER M3U8 ĐỂ GIỮ NGUYÊN AUDIO TRACKS
// -----------------------------------------------------------------------------
function parseDetailResponse(html, url) {
    try {
        // 1. Cố gắng trích xuất trực tiếp link M3U8 từ HTML
        // Mục đích: Ép phát trực tiếp file Master chứa Audio Tracks mà không qua Sniffer
        var m3u8 = "";
        var m3u8Match = html.match(/(?:file|source|url|src|link)\s*["':=]+\s*["']?(https?:\/\/[^"'\s>]+\.m3u8[^"'\s>]*)/i);
        if (!m3u8Match) m3u8Match = html.match(/(https?:\/\/[^"'\s>]+\.m3u8[^"'\s>]*)/i);
        
        if (m3u8Match && m3u8Match[1]) {
            m3u8 = m3u8Match[1];
            
            // Trích xuất thêm Subtitles VTT (nếu web dùng sub rời)
            var subtitles = [];
            var tracksMatch = html.match(/tracks\s*:\s*(\[[\s\S]*?\])/);
            if (tracksMatch) {
                try {
                    // Xử lý chuỗi JSON không chuẩn
                    var tracksStr = tracksMatch[1].replace(/'/g, '"').replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
                    var tracks = JSON.parse(tracksStr);
                    for (var i = 0; i < tracks.length; i++) {
                        var t = tracks[i];
                        if (t.file && (t.kind === 'captions' || t.kind === 'subtitles')) {
                            subtitles.push({ lang: t.label || "Vietsub", url: t.file });
                        }
                    }
                } catch (e) {}
            }

            return JSON.stringify({
                url: m3u8,
                isEmbed: false, // QUAN TRỌNG: false để ngắt sniffer, đưa thẳng Master M3U8 cho Native
                mimeType: "application/x-mpegURL",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Referer": "https://vicdn.cc/"
                },
                subtitles: subtitles
            });
        }

        // 2. Nếu web giấu kỹ link, dùng CustomJS can thiệp XHR/Fetch để ép bắt đúng file Master M3U8 đầu tiên
        var customJS = `
            (function() {
                try { if (window.devtoolsDetector) window.devtoolsDetector.isOpen = false; } catch(e) {}
                
                var checkJWP = setInterval(function() {
                    try {
                        if (typeof jwplayer === 'function') {
                            var p = jwplayer();
                            if (p && p.getState && p.getState() !== 'playing' && p.getState() !== 'buffering') p.play();
                        }
                        var skip = document.querySelector('.jw-skip');
                        if (skip) skip.click();
                    } catch(e) {}
                }, 1000);
                
                // Hàm đánh chặn mạng để tóm gọn m3u8 ngay từ khâu request
                var sniffToApp = function(m3u8Url) {
                    if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
                        window.SnifferBridge.play(m3u8Url, "https://vicdn.cc/");
                    }
                };

                // Đánh chặn XHR
                var origOpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function(method, requestUrl) {
                    if (typeof requestUrl === 'string' && requestUrl.indexOf('.m3u8') !== -1) sniffToApp(requestUrl);
                    return origOpen.apply(this, arguments);
                };

                // Đánh chặn Fetch
                var origFetch = window.fetch;
                window.fetch = function() {
                    var requestUrl = arguments[0];
                    if (typeof requestUrl === 'string' && requestUrl.indexOf('.m3u8') !== -1) sniffToApp(requestUrl);
                    return origFetch.apply(this, arguments);
                };
            })();
        `;

        return JSON.stringify({
            url: url,
            isEmbed: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Referer": "https://vicdn.cc/",
                "Custom-Js": customJS.replace(/\s+/g, ' ').trim()
            },
            subtitles: []
        });
    } catch (e) {
        return JSON.stringify({ url: url, isEmbed: true, headers: {} });
    }
}

function parseEmbedResponse(htmlContent, url) {
    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

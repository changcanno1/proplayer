// =============================================================================
// CẤU HÌNH DOMAIN VICDN - FIX LỖI MÀN HÌNH ĐEN WEBVIEW
// =============================================================================
var BASEURL = "https://vicdn.cc"; 
var BASEAPI = BASEURL + "/api"; 

function getManifest() { 
    return JSON.stringify({ 
        id: "vicdn", 
        name: "ViCDN Pro", 
        description: "Mở trực tiếp Webview trang gốc để hỗ trợ Vietsub & Thuyết minh.", 
        version: "7.4.2", 
        baseUrl: BASEURL, 
        iconUrl: BASEURL + "/vicdn.png", 
        isEnabled: true, 
        adblock: false, 
        type: "MOVIE", 
        playerType: "embed" // [BẮT BUỘC]
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
    return JSON.stringify(listurl.map(function(item) {
        return { slug: item.link, title: item.name, type: item.type };
    }));
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
// PARSER DANH SÁCH & TÌM KIẾM
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
        return JSON.stringify({ "items": items, "pagination": { "currentPage": currentPage, "totalPages": totalPages } }); 
    } catch (e) { 
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } }); 
    }
} 

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
// BÓC TÁCH CHI TIẾT
// -----------------------------------------------------------------------------
function parseMovieDetail(html, url) { 
    try { 
        var json = typeof html === 'string' ? JSON.parse(html) : html; 
        var data = json.data || {}; 
        
        var limg = data.banner || data.poster || ""; 
        if (limg && limg.indexOf("http") === -1) { 
            limg = "https://image.tmdb.org/t/p/w533_and_h300_face/" + limg + ".jpg"; 
        } 
        var lname = data.vname || data.ename || "Đang cập nhật..."; 
        var ldes = data.content || "Không có mô tả."; 
        var lactor = (data.cast || []).join(" - "); 
        var lduran = data.duration ? data.duration + " phút" : ""; 
        var status = "Tập " + (data.stt || "?") + "/" + (data.total || "?"); 
        var category = (data.genre || []).join(" - "); 
        var year = data.year || 2026; 
        
        // Trích xuất slug chuẩn xác để ghép link. Nếu web dùng /phim/slug, bạn có thể thêm vào.
        var movieSlug = data.slug || url.split('/').pop();
        var webviewUrl = BASEURL + "/" + movieSlug; 

        var episodes = []; 
        episodes.push({ 
            id: webviewUrl, 
            name: "Mở Trang Phim (Chọn Tập & Vietsub)", 
            slug: "webview_mode" 
        }); 

        return JSON.stringify({ 
            id: url, 
            title: lname, 
            posterUrl: limg, 
            backdropUrl: limg, 
            description: ldes, 
            quality: (data.type || "HD").toUpperCase(), 
            year: year, 
            rating: 8.5, 
            status: status, 
            category: category, 
            episode_current: "Tập " + (data.stt || "1"), 
            servers: [{ name: "VIP Server (Webview Gốc)", episodes: episodes }], 
            duration: lduran, 
            casts: lactor 
        }); 
    } catch (e) { 
        log("Lỗi parseMovieDetail: " + e); 
        return JSON.stringify({ id: url, title: "Lỗi tải dữ liệu", servers: [] }); 
    }
} 

// -----------------------------------------------------------------------------
// KHỞI CHẠY WEBVIEW (ĐÃ XÓA CUSTOM-JS GÂY LỖI)
// -----------------------------------------------------------------------------
function parseDetailResponse(html, url) { 
    try { 
        // Trả về trực tiếp URL web gốc, không ép thêm JS để tránh crash WebView
        return JSON.stringify({ 
            url: url, 
            isEmbed: true, 
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Referer": BASEURL
            }, 
            subtitles: [] 
        }); 
    } catch (e) { 
        log("Lỗi parseDetailResponse: " + e); 
        return JSON.stringify({ url: "", isEmbed: true, headers: {} }); 
    }
} 

function parseEmbedResponse(htmlContent, url) { 
    return JSON.stringify({ url: "", isEmbed: false });
} 

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

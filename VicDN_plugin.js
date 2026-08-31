// =============================================================================
// CẤU HÌNH DOMAIN VICDN - TỐI ƯU HÓA BỞI JS EXPERT
// =============================================================================
var BASEURL = "https://vicdn.cc"; 
var BASEAPI = BASEURL + "/api"; 

function getManifest() { 
    return JSON.stringify({ 
        id: "vicdn", 
        name: "ViCDN Pro", 
        description: "Bản Master: Fix dứt điểm Search, lấy dữ liệu thẳng từ server. Kèm tự động bắt Vietsub.", 
        version: "7.3.1", 
        baseUrl: BASEURL, 
        iconUrl: BASEURL + "/vicdn.png", 
        isEnabled: true, 
        adblock: false, 
        type: "MOVIE", 
        playerType: "embed" // [BẮT BUỘC] Dùng embed để mở Webview kèm CustomJS
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
    // Gọi thẳng vào giao diện tìm kiếm của website
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
        log("Lỗi parseListResponse: " + e); 
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } }); 
    } 
} 

// -----------------------------------------------------------------------------
// [FIX DỨT ĐIỂM] PARSER TÌM KIẾM TỪ HTML
// -----------------------------------------------------------------------------
function parseSearchResponse(html, url) { 
    try { 
        var startTag = "const allData = ["; 
        var startIdx = html.indexOf(startTag); 
        
        if (startIdx === -1) { 
            log("Không tìm thấy biến allData trong HTML Tìm Kiếm."); 
            return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } }); 
        } 
        
        var jsonStart = startIdx + "const allData = ".length; 
        var endIdx = html.indexOf("];let filteredData", jsonStart); 
        if (endIdx === -1) { 
            endIdx = html.indexOf("];", jsonStart); 
        } 
        
        if (endIdx === -1) { 
            return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } }); 
        } 
        
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
        
        log("Tìm kiếm thành công, số phim nhận từ Server: " + items.length); 
        
        return JSON.stringify({ 
            "items": items, 
            "pagination": { "currentPage": 1, "totalPages": 1 } 
        }); 
        
    } catch (e) { 
        log("Lỗi parseSearchResponse: " + e.message); 
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } }); 
    } 
} 

// -----------------------------------------------------------------------------
// BÓC TÁCH CHI TIẾT VÀ DANH SÁCH TẬP NATIVE
// -----------------------------------------------------------------------------
function parseMovieDetail(html, url) { 
    try { 
        var json = typeof html === 'string' ? JSON.parse(html) : html; 
        var data = json.data; 
        
        var limg = data.banner || data.poster || ""; 
        if (limg && limg.indexOf("http") === -1) { 
            limg = "https://image.tmdb.org/t/p/w533_and_h300_face/" + limg + ".jpg"; 
        } 
        
        var lname = data.vname || data.ename || "Đang cập nhật..."; 
        var ldes = data.content || "Không có mô tả."; 
        var lactor = (data.cast || []).join(" - "); 
        var lduran = data.duration ? data.duration + " phút" : ""; 
        var status = "Tập " + data.stt + "/" + data.total; 
        var category = (data.genre || []).join(" - "); 
        var year = data.year || 2026; 
        
        var episodes = []; 
        
        if (data.list_episodes && data.list_episodes.length > 0) { 
            for (var j = 0; j < data.list_episodes.length; j++) { 
                var itemEpi = data.list_episodes[j]; 
                var splitEpi = itemEpi.split("|"); 
                if(splitEpi.length >= 2) { 
                    episodes.push({ 
                        id: splitEpi[1].trim(), // Lấy thẳng link Player làm ID
                        name: "Tập " + splitEpi[0].trim(), 
                        slug: "tap-" + splitEpi[0].trim() 
                    }); 
                } 
            } 
        } else if (data.mkv) { 
            episodes.push({ 
                id: data.mkv.trim(), 
                name: "Xem Ngay", 
                slug: "full" 
            }); 
        } 
        
        if (episodes.length === 0) { 
            episodes.push({ id: url, name: "Phim chưa có link", slug: "error" }); 
        } 
        
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
            episode_current: "Tập " + data.stt, 
            servers: [{ name: "VIP Server", episodes: episodes }], 
            duration: lduran, 
            casts: lactor 
        }); 

    } catch (e) { 
        log("Lỗi parseMovieDetail: " + e); 
        return JSON.stringify({ id: url, title: "Lỗi tải dữ liệu", servers: [] }); 
    } 
} 

// -----------------------------------------------------------------------------
// INJECT CUSTOM-JS XỬ LÝ JWPLAYER MÃ HÓA & FIX TÌM KIẾM VIETSUB
// -----------------------------------------------------------------------------
function parseDetailResponse(html, url) { 
    try { 
        var streamLink = url; 
        var subs = [];

        // 1. Tách link Phụ đề (Vietsub/English) truyền cho Native Player (nếu App hỗ trợ)
        try {
            var trackRegex = /file["']?\s*:\s*["']([^"']*\.(vtt|srt|css)[^"']*)["']/gi;
            var match;
            while ((match = trackRegex.exec(html)) !== null) {
                var trackUrl = match[1];
                if (!subs.some(s => s.url === trackUrl)) {
                    var tLang = (trackUrl.toLowerCase().includes("eng") || trackUrl.toLowerCase().includes("/e")) ? "English" : "Vietsub";
                    subs.push({ url: trackUrl, lang: tLang, label: tLang });
                }
            }

            var regexApi = /https?:\/\/[a-zA-Z0-9.-]+\/api\/subtitle\/[^"']+/gi;
            var matchApi = html.match(regexApi);
            if (matchApi) {
                for (var k = 0; k < matchApi.length; k++) {
                    var sUrl = matchApi[k];
                    if (!subs.some(s => s.url === sUrl)) {
                        var langLabel = sUrl.includes("/e") ? "English" : "Vietsub";
                        subs.push({ url: sUrl, lang: langLabel, label: langLabel });
                    }
                }
            }
        } catch (ex) {
            log("Lỗi Regex bắt Subtitle: " + ex);
        }

        // 2. Ép Webview hiển thị và tự động chạy Vietsub
        var customJS = `
            try {
                if (window.devtoolsDetector) {
                    window.devtoolsDetector.launch = function(){};
                    window.devtoolsDetector.addListener = function(){};
                    window.devtoolsDetector.isOpen = false;
                }
                
                var s = document.createElement('style');
                s.innerHTML = 'html, body { margin:0!important; padding:0!important; width:100vw!important; height:100vh!important; overflow:hidden!important; background:#000!important; } ' +
                              '#ssPlay { position:fixed!important; top:0!important; left:0!important; width:100vw!important; height:100vh!important; z-index:1!important; display:flex!important; } ' +
                              '#sub-vi-overlay, #sub-en-overlay { z-index: 99999 !important; font-size: 20px !important; display: block !important; } ' + 
                              '#sub-cfg-modal { z-index: 100000 !important; } ' + 
                              'header, footer, nav, .container-fluid { display:none!important; pointer-events:none!important; }';
                document.head.appendChild(s);
                
                var checkJWP = setInterval(function() {
                    if (typeof jwplayer === 'function') {
                        var player = jwplayer();
                        if (player.getState) {
                            var state = player.getState();
                            if (state !== 'playing' && state !== 'buffering') {
                                player.play();
                            }
                            
                            // Tự động bật track phụ đề (Captions) nếu đang bị tắt (Dành cho webview)
                            try {
                                var tracks = player.getCaptionsList();
                                if (tracks && tracks.length > 1 && player.getCurrentCaptions() === 0) {
                                    var viIndex = 1;
                                    for (var i = 0; i < tracks.length; i++) {
                                        if (tracks[i].label && tracks[i].label.toLowerCase().includes('vi')) {
                                            viIndex = i;
                                            break;
                                        }
                                    }
                                    player.setCurrentCaptions(viIndex);
                                }
                            } catch(err) {}
                        }
                    }
                    
                    // Tự động ấn nút Skip (Bỏ qua Intro)
                    var skip = document.querySelector('.jw-skip, #jw-custom-skip-intro');
                    if (skip && skip.style.display !== 'none') skip.click();
                }, 1000);
            } catch(e) {}
        `;
        
        return JSON.stringify({ 
            url: streamLink, 
            isEmbed: true, 
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36", 
                "Referer": "https://vicdn.cc/", 
                "Custom-Js": customJS.replace(/\s+/g, ' ').trim() 
            }, 
            subtitles: subs // Chứa mảng phụ đề đã phân tích
        }); 
    } catch (e) { 
        log("Lỗi parseDetailResponse: " + e); 
        return JSON.stringify({ url: "", isEmbed: true, headers: {}, subtitles: [] }); 
    } 
} 

function parseEmbedResponse(htmlContent, url) { 
    return JSON.stringify({ url: "", isEmbed: false }); 
} 

function parseCategoriesResponse(html) { return "[]"; } 
function parseCountriesResponse(html) { return "[]"; } 
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// CẤU HÌNH DOMAIN VICDN - BẢN FINAL MASTER (FIX NATIVE SUBTITLE)
// =============================================================================
var BASEURL = "https://vicdn.cc"; 
var BASEAPI = BASEURL + "/api"; 

function getManifest() { 
    return JSON.stringify({ 
        id: "vicdn", 
        name: "ViCDN Pro", 
        description: "Bản Master: Search API trực tiếp, Giải mã AES chèn Phụ đề thẳng vào Native Player.", 
        version: "8.0.0", 
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
    return JSON.stringify([ 
        { "link": "/update/", "name": "Phim Mới Cập Nhật", "type": "Grid" }, 
        { "link": "/type/hanh-dong/", "name": "Hành Động", "type": "Horizontal" }, 
        { "link": "/type/hoat-hinh/", "name": "Hoạt Hình", "type": "Horizontal" }, 
        { "link": "/type/vien-tuong/", "name": "Viễn Tưởng", "type": "Horizontal" }, 
        { "link": "/type/hinh-su/", "name": "Hình Sự", "type": "Horizontal" } 
    ]); 
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
// PARSER TÌM KIẾM TỪ HTML
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
// BÓC TÁCH CHI TIẾT
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
        var year = data.year || 2026; 
        
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
        
        if (episodes.length === 0) { episodes.push({ id: url, name: "Phim chưa có link", slug: "error" }); } 
        
        return JSON.stringify({ 
            id: url, title: lname, posterUrl: limg, backdropUrl: limg, 
            description: ldes, quality: (data.type || "HD").toUpperCase(), 
            year: year, rating: 8.5, status: status, category: category, 
            episode_current: "Tập " + data.stt, servers: [{ name: "VIP Server", episodes: episodes }], 
            duration: lduran, casts: lactor 
        }); 
    } catch (e) { 
        return JSON.stringify({ id: url, title: "Lỗi tải dữ liệu", servers: [] }); 
    } 
} 

// -----------------------------------------------------------------------------
// INJECT CUSTOM-JS XỬ LÝ JWPLAYER MÃ HÓA & CƯỚP QUYỀN HIỂN THỊ PHỤ ĐỀ
// -----------------------------------------------------------------------------
function parseDetailResponse(html, url) {
    try {
        var customJS = `
            try {
                // 1. Tắt chặn Devtools để không bị kẹt player
                if (window.devtoolsDetector) {
                    window.devtoolsDetector.isOpen = false;
                    window.devtoolsDetector.launch = function(){};
                    window.devtoolsDetector.addListener = function(){};
                }
                
                // 2. CSS tối ưu giao diện, giấu khung web rác, chừa lại bảng Cài đặt Thuyết Minh của Web
                var s = document.createElement('style');
                s.innerHTML = 'header, footer, nav, .container-fluid { display:none!important; pointer-events:none!important; } ' +
                              'html, body { background: #000 !important; margin: 0!important; padding: 0!important; } ' +
                              '#ssPlay { position:fixed!important; top:0!important; left:0!important; width:100vw!important; height:100vh!important; z-index:1!important; }';
                document.head.appendChild(s);

                // 3. HOOK KINH ĐIỂN: Tóm File Phụ đề VTT ngay khi Web giải mã xong
                // Sau đó nhét nó vào thẻ <video> dưới dạng <track> để Native App của bạn đọc được
                var origDecode = TextDecoder.prototype.decode;
                var trackAdded = {};
                TextDecoder.prototype.decode = function() {
                    var text = origDecode.apply(this, arguments);
                    if (text && text.indexOf('WEBVTT') !== -1) {
                        
                        var isVi = text.indexOf('Ngôn ngữ: Tiếng Việt') !== -1 || text.indexOf('Vietsub') !== -1 || !trackAdded['vi'];
                        var langCode = isVi ? 'vi' : 'en';
                        var langLabel = isVi ? 'Vietsub' : 'English';
                        
                        if (!trackAdded[langCode]) {
                            trackAdded[langCode] = true;
                            
                            // Bọc Text sạch thành Data URI
                            var dataUri = 'data:text/vtt;charset=utf-8,' + encodeURIComponent(text);
                            
                            var attachTimer = setInterval(function() {
                                var video = document.querySelector('video');
                                if (video) {
                                    clearInterval(attachTimer);
                                    
                                    // Bơm <track> vào video, App sẽ tự bắt được nút Subtitle
                                    var track = document.createElement('track');
                                    track.src = dataUri;
                                    track.kind = 'captions';
                                    track.srclang = langCode;
                                    track.label = langLabel;
                                    if (langCode === 'vi') track.default = true;
                                    video.appendChild(track);
                                    
                                    // Ẩn phụ đề bằng thẻ DIV của Web đi để nhường sân cho Native Sub
                                    var overlayVi = document.getElementById('sub-vi-overlay');
                                    if (overlayVi) overlayVi.style.display = 'none';
                                    var overlayEn = document.getElementById('sub-en-overlay');
                                    if (overlayEn) overlayEn.style.display = 'none';
                                }
                            }, 500);
                        }
                    }
                    return text;
                };

                // 4. Auto Play & Auto Skip
                setInterval(function() {
                    if (typeof jwplayer === 'function') {
                        var player = jwplayer();
                        if (player.getState && player.getState() !== 'playing' && player.getState() !== 'buffering') {
                            player.play();
                        }
                    }
                    var skip = document.querySelector('.jw-skip, #jw-custom-skip-intro');
                    if (skip && skip.style.display !== 'none') skip.click();
                }, 1000);
                
            } catch(e) {}
        `;

        return JSON.stringify({
            url: url,
            isEmbed: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Referer": "https://vicdn.cc/",
                "Custom-Js": customJS.replace(/\s+/g, ' ').trim()
            },
            subtitles: [] // Để mảng rỗng. App sẽ TỰ ĐỘNG CÓ PHỤ ĐỀ nhờ Kỹ thuật Hook bơm track ở trên!
        });
    } catch (e) {
        log("Lỗi parseDetailResponse: " + e);
        return JSON.stringify({ url: "", isEmbed: true, headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(htmlContent, url) { return JSON.stringify({ url: "", isEmbed: false }); } 
function parseCategoriesResponse(html) { return "[]"; } 
function parseCountriesResponse(html) { return "[]"; } 
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// CẤU HÌNH DOMAIN VICDN - TỐI ƯU HÓA BỞI JS EXPERT
// =============================================================================
var BASEURL = "https://vicdn.cc"; 
var BASEAPI = BASEURL + "/api";

function getManifest() {
    return JSON.stringify({
        id: "vicdn",
        name: "ViCDN Pro",
        description: "Bản Master: Chia sẵn Server Vietsub & Thuyết Minh. Tự động bóc m3u8 để phát Native.",
        version: "7.6.0",
        baseUrl: BASEURL,
        iconUrl: BASEURL + "/vicdn.png",
        isEnabled: true,
        adblock: false,
        type: "MOVIE",
        playerType: "embedtoplay"
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
        
        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
        
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

// -----------------------------------------------------------------------------
// [CẬP NHẬT] TÁCH 2 FOLDER VIETSUB & THUYẾT MINH RÕ RÀNG
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
        
        // Tạo 2 mảng chứa tập riêng biệt
        var episodesVietsub = [];
        var episodesThuyetMinh = [];
        
        if (data.list_episodes && data.list_episodes.length > 0) {
            for (var j = 0; j < data.list_episodes.length; j++) {
                var itemEpi = data.list_episodes[j];
                var splitEpi = itemEpi.split("|");
                
                if(splitEpi.length >= 2) {
                    var epNum = splitEpi[0].trim();
                    var epLink = splitEpi[1].trim();
                    var separator = epLink.indexOf("?") !== -1 ? "&" : "?";
                    
                    // Gắn cờ vietsub vào ID link
                    episodesVietsub.push({
                        id: epLink + separator + "play=vietsub", 
                        name: "Tập " + epNum,
                        slug: "tap-" + epNum + "-vs"
                    });
                    
                    // Gắn cờ thuyet-minh vào ID link
                    episodesThuyetMinh.push({
                        id: epLink + separator + "play=thuyet-minh", 
                        name: "Tập " + epNum,
                        slug: "tap-" + epNum + "-tm"
                    });
                }
            }
        } else if (data.mkv) {
            var epLink = data.mkv.trim();
            var separator = epLink.indexOf("?") !== -1 ? "&" : "?";
            
            episodesVietsub.push({
                id: epLink + separator + "play=vietsub",
                name: "Xem Ngay",
                slug: "full-vs"
            });
            episodesThuyetMinh.push({
                id: epLink + separator + "play=thuyet-minh",
                name: "Xem Ngay",
                slug: "full-tm"
            });
        }
        
        var servers = [];
        if (episodesVietsub.length > 0) {
            servers.push({ name: "Vietsub", episodes: episodesVietsub });
            servers.push({ name: "Thuyết Minh", episodes: episodesThuyetMinh });
        } else {
            servers.push({ name: "Lỗi", episodes: [{ id: url, name: "Phim chưa có link", slug: "error" }] });
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
            servers: servers, // Trả ra 2 Folder Server tại đây
            duration: lduran,
            casts: lactor
        });

    } catch (e) {
        log("Lỗi parseMovieDetail: " + e);
        return JSON.stringify({ id: url, title: "Lỗi tải dữ liệu", servers: [] });
    }
}

// -----------------------------------------------------------------------------
// TRẢ VỀ LINK ĐỂ APP SNIFF BẰNG EMBEDTOPLAY KÈM THEO JS KÍCH HOẠT THUYẾT MINH
// -----------------------------------------------------------------------------
function parseDetailResponse(html, url) {
    try {
        // Kiểm tra xem user đang bấm vào link ở folder nào (Vietsub hay Thuyết Minh)
        var isThuyetMinh = url.indexOf("play=thuyet-minh") !== -1;
        
        // JS để can thiệp vào Webview ẩn của app, tự động click nút Thuyết Minh nếu có
        var customJS = `
            try {
                if (window.devtoolsDetector) window.devtoolsDetector.isOpen = false;
                
                var isTM = ${isThuyetMinh};
                var checkPlayer = setInterval(function() {
                    // Tự động Play để lấy link m3u8
                    if (typeof jwplayer === 'function') {
                        var p = jwplayer();
                        if (p && p.getState && p.getState() !== 'playing' && p.getState() !== 'buffering') p.play();
                    }
                    var skip = document.querySelector('.jw-skip');
                    if (skip) skip.click();
                    
                    // Nếu là Thuyết Minh, tìm và bấm vào nút đổi luồng âm thanh/server trên web
                    if (isTM) {
                        var tmButtons = document.querySelectorAll('button, a, div.server-item');
                        for(var i = 0; i < tmButtons.length; i++) {
                            var btnText = tmButtons[i].innerText || "";
                            if(btnText.toLowerCase().indexOf('thuyết minh') !== -1 || btnText.toLowerCase().indexOf('lồng tiếng') !== -1) {
                                tmButtons[i].click();
                                break;
                            }
                        }
                    }
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
            subtitles: []
        });
    } catch (e) {
        log("Lỗi parseDetailResponse: " + e);
        return JSON.stringify({ url: url, isEmbed: true, headers: {} });
    }
}

function parseEmbedResponse(htmlContent, url) {
    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

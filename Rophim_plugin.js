var iddomain = "rophim";
var BASEURL = "https://www.rophim.soy";
var BASEAPI = "https://rophim.alokillgtv.workers.dev";
var BASELINK = BASEAPI;
var NEWDOMAIN = true;
var popup_html = "";

// ===== CẤU HÌNH & METADATA =====
function getManifest() {
    try {
        return JSON.stringify({
            "id": "rophim",
            "name": "RP Mới [MOVIE]",
            "version": "3.8",
            "author": "Alokillgtv",
            "baseUrl": BASEURL,
            "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/rophim.png",
            "isEnabled": true,
            "isAdult": false,
            "adblock": true,
            "type": "MOVIE",
            "layoutType": "VERTICAL",
            "subtitleCat": false,
            "popup_html": popup_html,
            "playerType": "auto"
        });
    } catch (e) {
        return JSON.stringify({
            "id": "loiapp",
            "name": "Plugin bị lỗi cài đặt",
            "version": "2.0",
            "info": "Plugin đang bị lỗi: \n" + e,
            "baseUrl": "http://vkey.vn/",
            "iconUrl": "https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/novahd.png",
            "isEnabled": true,
            "type": "MOVIE",
            "playerType": "auto"
        });
    }
}

if (NEWDOMAIN) {
    if (typeof httpRequest === "function") {
        var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {
            method: "POST"
        });
        if (res && res.isSuccessful) {
            var resobj = JSON.parse(res.body);
            if (resobj[iddomain] && resobj[iddomain].new) {
                BASEURL = resobj[iddomain].new;
            }
        }
    }
}
console.log("BASEURL " + BASEURL);

function log(msg) {
    console.log(msg);
}

// Helper bóc tách dữ liệu
function getPipeData(rawUrl) {
    if (!rawUrl) return "";
    var idx = rawUrl.indexOf("|");
    if (idx < 0) return "";
    var s = rawUrl.substring(idx + 1).replace(/^\s+/, "");
    if (s.toLowerCase().indexOf("data:") === 0) {
        s = s.substring(5);
    }
    return s;
}

// ===== HÀM MENU LIST =====
function getHomeSections() {
    localStorage.clear();
    return JSON.stringify([
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=1&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Chiếu Rạp", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=completed&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Trọn Bộ", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=1&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Phim Lẻ", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=2&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Phim Bộ", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=4&rating=&networks=&productions=&sort=release_date", "title": "Thuyết Minh", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=2&rating=&networks=&productions=&sort=release_date", "title": "Lồng Tiếng", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Phim Mới", "type": "Grid"}
    ]);
}

function getLISTmenu() {
    try {
        return `[
            {"link": "/api/v1/movie/filterV2?genres=jwVGrXo2&sort=release_date", "name": "Âm Nhạc"},
            {"link": "/api/v1/movie/filterV2?genres=8EVM6e0Y&sort=release_date", "name": "Anime"},
            {"link": "/api/v1/movie/filterV2?genres=PLeAbJ90&sort=release_date", "name": "Báo Thù"}
        ]`;
    } catch (e) {
        return `[{"link":"/","name":"Đang lỗi"}]`;
    }
}

// ===== HÀM TẠO URL =====
function getUrlList(slug, filtersJson) {
    var paramPage = "&page=";
    try {
        if (slug && slug.indexOf("http") > -1) return slug;
        var page = 1, path = slug || "";
        if (filtersJson) {
            var fixedJson2 = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson2);
                page = parseInt(filters.page) || 1;
                if (filters.category) path = Array.isArray(filters.category) ? filters.category[0].slug : filters.category;
            } catch (e) { }
        }
        var resultUrl = BASELINK + (path.indexOf("/") === 0 ? "" : "/") + path;
        if (page > 0 && resultUrl.indexOf("page=") === -1) resultUrl += paramPage + page;
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        return BASEURL;
    }
}

function getUrlSearch(keyword, filtersJson) {
    var paramSearch = "/api/v1/movie/filterV2?q=";
    var paramPage = "&page=";
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (e) {}
        }
        var encodedKeyword = encodeURIComponent(keyword || "");
        var resultUrl = BASELINK + paramSearch + encodedKeyword;
        if (page > 1) resultUrl += paramPage + page;
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        return BASEURL;
    }
}

// ===== HÀM TẠO KHỐI LIST PHIM =====
function parseListResponse(html, $url) {
    try {
        var $data = JSON.parse(html);
        var items = [];

        $data.result.items.forEach(function(item) {
            var type = item.type;
            var rawId = type == 2 ? BASEAPI + "/api/v1/movie/seasons?mId=" + item._id : BASEAPI + "/api/v1/movie/gallery/" + item._id;
            var idWithPipe = rawId + "|data:" + encodeURIComponent(JSON.stringify(item));

            var poster = (item.images && item.images.posters[0]) ? "https://1testcode.alokillgtv.workers.dev/https://static.rophim.stream/vimg/400-0/" + item.images.posters[0].path : "";
            var background = (item.images && item.images.backdrops[0]) ? "https://1testcode.alokillgtv.workers.dev/https://static.rophim.stream/vimg/400-0/" + item.images.backdrops[0].path : poster;
            var namelang = "Vietsub";
            for (var key in item.latest_episode) {
                if (key == 2) namelang += "/Lồng Tiếng";
                if (key == 3) namelang += "/Thuyết Minh [MB]";
                if (key == 4) namelang += "/Thuyết Minh [MN]";
            }
            var textstas = (item.status || "").replace(/on going/i, "Đang Ra").replace(/released/i, "Hoàn Thành").replace(/upcoming/i, "Sắp Ra");

            if ((item.title || "").length > 1) {
                items.push({
                    "id": idWithPipe,
                    "title": item.title,
                    "quality": item.quality ? item.quality.toUpperCase() : "HD",
                    "episode_current": textstas,
                    "posterUrl": poster,
                    "backdropUrl": background,
                    "year": item.year || "",
                    "lang": namelang,
                    "isCategory": false,
                    "isFolder": false,
                    "datasend": JSON.stringify(item)
                });
            }
        });

        return JSON.stringify({ "items": items, "pagination": { "currentPage": 1, "totalPages": 9999 } });
    } catch (e) {
        return JSON.stringify({ "items": [{"id": $url || "error", "title": "Lỗi", "posterUrl": "", "backdropUrl": ""}], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

// ===== HÀM TẠO KHỐI CHI TIẾT PHIM =====
function parseMovieDetail(html, url, datasend) {
    try {
        var cleanUrl = (url || "").split("|")[0];
        var rawData = datasend || getPipeData(url);
        if (rawData && rawData.indexOf("%7B") === 0) rawData = decodeURIComponent(rawData);
        var item = JSON.parse(rawData || "{}");

        var posterUrl = (item.images && item.images.posters[0]) ? "https://static.rp-cdn.net/vimg/300-0/" + item.images.posters[0].path : "";
        var backdropUrl = (item.images && item.images.backdrops[0]) ? "https://static.rp-cdn.net/vimg/1920-0/" + item.images.backdrops[0].path : posterUrl;
        var category = (item.genres && Array.isArray(item.genres)) ? item.genres.map(function(box) { return "[" + box.name + "](/api/v1/movie/filterV2?genres=" + box._id + "&sort=release_date)"; }).join(", ") : "";
        var country = (item.countries && Array.isArray(item.countries)) ? item.countries.map(function(c) { return c.name; }).join(", ") : "";
        var servers = [];

        if (item.type == 1) {
            var typeEpi = item.latest_episode || { "1": 1 };
            for (var key in typeEpi) {
                var namesv = key == 2 ? "Lồng Tiếng" : key == 3 ? "Thuyết Minh [MB]" : key == 4 ? "Thuyết Minh [MN]" : "Vietsub";
                servers.push({
                    name: namesv,
                    episodes: [{ id: "https://api.rophim.stream/player/embed?id=" + item._id + "&ver=" + key + "&version=" + key + "|data:ver=" + key, name: "Full (" + namesv + ")", slug: "phim-le-sv-" + key }]
                });
            }
        } else {
            var seasonMV = JSON.parse(html);
            if (seasonMV && seasonMV.result && Array.isArray(seasonMV.result)) {
                var serverMap = {};
                var movieId = item._id || cleanUrl.replace(BASEAPI + "/api/v1/movie/seasons?mId=", "");
                seasonMV.result.forEach(function(season) {
                    (season.episodes || []).forEach(function(ep) {
                        (ep.versions || []).forEach(function(verObj) {
                            if (!serverMap[verObj.type]) serverMap[verObj.type] = [];
                            serverMap[verObj.type].push({
                                id: "https://api.rophim.stream/player/embed?id=" + movieId + "&episode=" + ep.episode_number + "&season=" + ep.season_number + "&version=" + verObj.type + "&ver=" + verObj.type + "|data:ver=" + verObj.type,
                                name: "[Mùa " + ep.season_number + "] Tập " + ep.episode_number,
                                slug: "mua-" + ep.season_number + "-tap-" + ep.episode_number + "-sv-" + verObj.type
                            });
                        });
                    });
                });
                for (var verKey in serverMap) {
                    servers.push({
                        name: verKey == 2 ? "Lồng Tiếng" : verKey == 3 ? "Thuyết Minh [MB]" : verKey == 4 ? "Thuyết Minh [MN]" : "Vietsub",
                        episodes: serverMap[verKey]
                    });
                }
            }
        }

        return JSON.stringify({
            id: cleanUrl, title: item.title || "", posterUrl: posterUrl, backdropUrl: backdropUrl, description: item.overview || "", quality: item.quality ? item.quality.toUpperCase() : "HD", year: item.year || "", rating: item.rating || "", status: "", category: category, episode_current: "", servers: servers, duration: "", casts: "", director: "", country: country, extra: ""
        });
    } catch (e) {
        return JSON.stringify({ id: "error", title: "error", description: url + "\n" + e, servers: [] });
    }
}

// ===== HÀM TẠO XỬ LÝ STREAM PHIM =====
function parseDetailResponse(html, url, datasend) {
    try {
        var cleanUrl = (url || "").split("|")[0];
        return JSON.stringify({
            url: cleanUrl,
            isEmbed: true, 
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                "Referer": BASEURL + "/",
                "Origin": BASEURL,
                "Block-Ads": "true",
                "Block-Redirects": "true",
                "Block-Sniffer": "true",
                "Custom-Js": webviewPerfectUIHelperJS()
            },
            subtitles: []
        });
    } catch (e) {
        return JSON.stringify({ url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", mimeType: "video/mp4", isEmbed: false, headers: {}, subtitles: [] });
    }
}

// CỐ ĐỊNH XOAY NGANG VÀ THU NHỎ BẰNG DOM TRANSFORM
function webviewPerfectUIHelperJS() {
    return `(function() {
        'use strict';
        if (window.__ROPHIM_WEBVIEW_PERFECT_INIT__) return;
        window.__ROPHIM_WEBVIEW_PERFECT_INIT__ = true;

        var meta = document.createElement('meta');
        meta.charset = 'UTF-8';
        (document.head || document.documentElement).appendChild(meta);

        // CSS: Dùng rotate(90deg) để xoay ngang DOM và đảo ngược width/height (100vh / 100vw)
        var style = document.createElement('style');
        style.textContent = 'html, body { margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; background: #000 !important; overflow: hidden !important; display: flex !important; justify-content: center !important; align-items: center !important; } ' +
                            '.jwplayer, #player, .player-wrapper { position: absolute !important; width: 100vh !important; height: 100vw !important; transform: rotate(90deg) scale(0.9) !important; transform-origin: center center !important; } ' +
                            'video { width: 100% !important; height: 100% !important; object-fit: contain !important; transform: none !important; } ' +
                            '.jw-captions, .jw-text-track-display { bottom: 12% !important; z-index: 9999 !important; }';
        (document.head || document.documentElement).appendChild(style);

        // Giữ API App (nếu được hỗ trợ)
        function forceLandscapeOrientation() {
            try { if (window.SnifferBridge && typeof window.SnifferBridge.setOrientation === 'function') window.SnifferBridge.setOrientation('landscape'); } catch (e) {}
            try { if (screen && screen.orientation && typeof screen.orientation.lock === 'function') screen.orientation.lock('landscape').catch(function() {}); } catch (e) {}
        }
        
        forceLandscapeOrientation();

        var checkCount = 0;
        var timer = setInterval(function() {
            checkCount++;
            if (checkCount > 60) { clearInterval(timer); return; }
            if (typeof window.jwplayer === 'function') {
                try {
                    var player = window.jwplayer();
                    if (player && typeof player.on === 'function') {
                        clearInterval(timer);
                        var autoSetupPlayer = function() {
                            try {
                                forceLandscapeOrientation();
                                var v = document.querySelector('video');
                                if (v) { v.setAttribute('playsinline', 'true'); v.setAttribute('webkit-playsinline', 'true'); }
                                
                                var tracks = player.getCaptionsList ? player.getCaptionsList() : [];
                                if (tracks && tracks.length > 1) {
                                    var viIndex = -1;
                                    for (var i = 0; i < tracks.length; i++) {
                                        var label = (tracks[i].label || '').toLowerCase();
                                        if (label.indexOf('việt') !== -1 || label.indexOf('viet') !== -1 || label.indexOf('vi') !== -1) { viIndex = i; break; }
                                    }
                                    if (viIndex === -1) viIndex = 1;
                                    if (player.getCurrentCaptions && player.getCurrentCaptions() !== viIndex) player.setCurrentCaptions(viIndex);
                                }
                            } catch (err) {}
                        };
                        player.on('ready', autoSetupPlayer);
                        player.on('firstFrame', autoSetupPlayer);
                        player.on('captionsList', autoSetupPlayer);
                        player.on('play', autoSetupPlayer);
                    }
                } catch (e) {}
            }
        }, 300);
    })();`;
}

// ==== HIDEMENU ====
{
    function getUrlDetail(slug) {
        try { return slug && slug.indexOf('http') === 0 ? slug : (slug ? BASEURL + "/" + slug : ""); } catch (e) { return ""; }
    }
    function getUrlCategories() { return BASEURL; }
    function getUrlCountries() { return ""; }
    function getUrlYears() { return ""; }
    function parseCategoriesResponse(apiResponseJson) { return JSON.stringify(buildMenu(getLISTmenu())); }
    function parseCountriesResponse(html) { return "[]"; }
    function parseYearsResponse(html) { return "[]"; }
    function parseSearchResponse(html, url) { return parseListResponse(html, url); }
    function getPrimaryCategories() { return JSON.stringify(buildMenu(getLISTmenu())); }
    function getFilterConfig() { return JSON.stringify({ category: buildMenu(getLISTmenu()) }); }
    function buildMenu(menuStr, type) {
        var menuArray = JSON.parse(menuStr), menulist = [];
        if (!menuArray || !Array.isArray(menuArray)) return menulist;
        var typeStr = type !== undefined ? String(type).trim() : undefined;
        for (var i = 0; i < menuArray.length; i++) {
            var item = menuArray[i];
            if (!item || !item.link || !item.name) continue;
            var link = String(item.link).trim(), name = String(item.name).trim();
            menulist.push(typeStr === "false" ? { "slug": link, "title": name, "type": "Horizontal" } : typeStr === "true" ? { "slug": link, "title": name, "type": "Grid" } : { "slug": link, "name": name });
        }
        return menulist;
    }
}
// ==== HIDEMENU ====

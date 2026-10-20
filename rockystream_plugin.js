// =============================================================================
// AniDoki Plugin for VAAPP (vaxplayer)
// Nguồn: https://anidoki.com  (anime vietsub)
// API mở (JSON thuần) tại https://anidoki.com/api
// =============================================================================

var WEB = "https://anidoki.com";
var API = WEB + "/api";
var BASEURL = WEB;
var BASELINK = WEB;
var popup_html = "";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function log(msg) {
    try { if (typeof console !== "undefined" && console.log) console.log("[anidoki] " + msg); } catch (e) {}
}

function getManifest() {
    try {
        return JSON.stringify({
            "id": "anidoki",
            "name": "AniDoki [ANIME]",
            "version": "1.0",
            "author": "alokillgtv",
            "info": "Kho anime vietsub Full HD, cập nhật nhanh.\nNguồn tổng hợp Anime47 / AniDoki, có phụ đề AI tiếng Việt.",
            "baseUrl": WEB,
            "iconUrl": "https://anidoki.com/favicon-192x192.png",
            "isEnabled": true,
            "isAdult": false,
            "adblock": false,
            "type": "ANIME",
            "layoutType": "VERTICAL",
            "subtitleCat": false,
            "playerType": "exoplayer",
            "headers": {
                "Referer": WEB + "/",
                "Origin": WEB
            },
            "debug": true,
            "popup_html": popup_html
        });
    } catch (e) {
        return JSON.stringify({
            "id": "loianidoki",
            "name": "Plugin AniDoki bị lỗi",
            "version": "1.0",
            "info": "Lỗi khởi tạo: " + e,
            "baseUrl": WEB,
            "isEnabled": true,
            "type": "MOVIE",
            "playerType": "embed"
        });
    }
}

// =============================================================================
// HOME SECTIONS + MENU
// =============================================================================
function getHomeSections() {
    return JSON.stringify([
        { "slug": "trending", "title": "Thịnh Hành", "type": "Horizontal" },
        { "slug": "recent", "title": "Mới Cập Nhật", "type": "Grid" }
    ]);
}

function getLISTmenu() {
    return `[
        {"link":"genre:hanh-dong","name":"Hành Động"},
        {"link":"genre:phieu-luu","name":"Phiêu Lưu"},
        {"link":"genre:hai-huoc","name":"Hài Hước"},
        {"link":"genre:kinh-di","name":"Kinh Dị"},
        {"link":"genre:hoc-duong","name":"Học Đường"},
        {"link":"genre:tinh-cam","name":"Tình Cảm"},
        {"link":"genre:vien-tuong","name":"Viễn Tưởng"},
        {"link":"genre:chinh-kich","name":"Chính Kịch"},
        {"link":"genre:co-trang","name":"Cổ Trang"},
        {"link":"genre:chien-tranh","name":"Chiến Tranh"},
        {"link":"genre:am-nhac","name":"Âm Nhạc"},
        {"link":"genre:bi-an","name":"Bí Ẩn"},
        {"link":"genre:the-thao","name":"Thể Thao"},
        {"link":"genre:vo-thuat","name":"Võ Thuật"},
        {"link":"genre:tam-ly","name":"Tâm Lý"},
        {"link":"genre:than-thoai","name":"Thần Thoại"}
    ]`;
}

function buildMenu(menuStr, type) {
    var menuArray = [];
    try { menuArray = JSON.parse(menuStr); } catch (e) { return []; }
    var menulist = [];
    if (!menuArray || !Array.isArray(menuArray)) return menulist;
    var typeStr = type !== undefined ? String(type).trim() : undefined;
    for (var i = 0; i < menuArray.length; i++) {
        var item = menuArray[i];
        if (!item) continue;
        var link = item.link ? String(item.link).trim() : "";
        var name = item.name ? String(item.name).trim() : "";
        if (!link || !name) continue;
        var menuItem;
        if (typeStr === "false") menuItem = { "slug": link, "title": name, "type": "Horizontal" };
        else if (typeStr === "true") menuItem = { "slug": link, "title": name, "type": "Grid" };
        else if (typeStr === "filter") menuItem = { "value": link, "name": name };
        else menuItem = { "slug": link, "name": name };
        menulist.push(menuItem);
    }
    return menulist;
}

function getPrimaryCategories() {
    try { return JSON.stringify(buildMenu(getLISTmenu())); } catch (e) { return JSON.stringify([]); }
}
function getFilterConfig() {
    try { return JSON.stringify({ category: buildMenu(getLISTmenu(), "filter") }); } catch (e) { return JSON.stringify({ category: [] }); }
}

// =============================================================================
// URL GENERATION
// =============================================================================
function withHeaders(url) {
    if (!url || url.indexOf("|") > -1) return url;
    return url + "|Referer=" + WEB + "/";
}

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) return slug;

        var page = 1;
        var path = slug || "recent";
        if (filtersJson) {
            var fixed = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixed);
                page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) path = filters.category[0].slug || filters.category[0].value || path;
                    else if (typeof filters.category === "string") path = filters.category;
                }
            } catch (e) { log("getUrlList filters: " + e); }
        }

        var url;
        if (path.indexOf("genre:") === 0) {
            var g = path.substring(6);
            url = API + "/anime/by-genres?categories=" + encodeURIComponent(g) + "&page=" + page + "&limit=24";
        } else if (path === "trending") {
            url = API + "/anime/trending?page=" + page + "&limit=24";
        } else if (path === "seasonal") {
            url = API + "/anime/seasonal?page=" + page;
        } else if (path === "movies") {
            url = API + "/anime/movies?page=" + page + "&limit=24";
        } else {
            url = API + "/anime/recently-updated?page=" + page + "&limit=24";
        }
        return withHeaders(url);
    } catch (e) {
        log("getUrlList err: " + e);
        return withHeaders(API + "/anime/recently-updated?page=1&limit=24");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixed = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try { page = parseInt(JSON.parse(fixed).page) || 1; } catch (e) {}
        }
        return withHeaders(API + "/search?q=" + encodeURIComponent(keyword || "") + "&page=" + page);
    } catch (e) {
        return withHeaders(API + "/search?q=" + encodeURIComponent(keyword || ""));
    }
}

function getUrlDetail(slug) {
    try {
        if (!slug) return "";
        var clean = String(slug).split("|")[0];
        if (clean.indexOf("http") === 0) return clean;
        return WEB + "/api/anime/" + encodeURIComponent(clean);
    } catch (e) {
        return "";
    }
}

function getUrlCategories() { return withHeaders(API + "/genre-options"); }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// LIST PARSERS
// =============================================================================
function pickTitle(t) {
    if (!t) return "";
    if (typeof t === "string") return t;
    return t.vietnamese || t.english || t.romaji || "";
}

function buildListItems(obj) {
    var items = [];
    var list = (obj && obj.data) ? obj.data : [];
    if (!Array.isArray(list)) list = [];
    for (var i = 0; i < list.length; i++) {
        var it = list[i];
        if (!it || !it.id) continue;
        var title = pickTitle(it.title);
        var poster = it.coverImage || it.bannerImage || "";
        var epCur = "";
        if (it.isMovie) epCur = "Full";
        else if (it.currentEpisode) epCur = "Tập " + it.currentEpisode;
        else if (it.totalEpisodes) epCur = it.totalEpisodes + " tập";
        items.push({
            "id": it.id,
            "title": title,
            "posterUrl": poster,
            "backdropUrl": it.bannerImage || poster,
            "quality": it.format || "",
            "episode_current": epCur,
            "year": it.year || "",
            "lang": it.language || "Vietsub",
            "score": it.score || ""
        });
    }
    return items;
}

function parseListResponse(body) {
    try {
        var obj = JSON.parse(body);
        var items = buildListItems(obj);
        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 9999,
                "totalItems": items.length,
                "itemsPerPage": items.length || 24
            }
        });
    } catch (e) {
        log("parseListResponse err: " + e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(body) { return parseListResponse(body); }

function parseCategoriesResponse(body) {
    try {
        var obj = JSON.parse(body);
        var list = (obj && obj.data) ? obj.data : [];
        var menu = [];
        for (var i = 0; i < list.length; i++) {
            var g = list[i];
            if (!g || !g.slug) continue;
            menu.push({ "slug": "genre:" + g.slug, "name": g.name });
        }
        return JSON.stringify(menu);
    } catch (e) { return "[]"; }
}
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

// =============================================================================
// MOVIE DETAIL
// =============================================================================
function parseMovieDetail(body, apiUrl) {
    log("parseMovieDetail: " + apiUrl);
    try {
        var obj = JSON.parse(body);
        var d = obj.data || obj;
        var animeId = d.id || "";

        var title = pickTitle(d.title);
        var poster = d.coverImage || d.bannerImage || "";

        var genres = "";
        if (d.genres && d.genres.length) {
            var gs = [];
            for (var i = 0; i < d.genres.length; i++) gs.push(d.genres[i]);
            genres = gs.join(", ");
        }

        var eps = [];
        var list = d.episodes || [];
        if (list.length) {
            for (var k = 0; k < list.length; k++) {
                var ep = list[k];
                var num = ep.number;
                var epName = "Tập " + num;
                if (d.isMovie) epName = "Full";
                eps.push({
                    "id": WEB + "/api/anime/" + animeId + "?ep=" + num + "|data:" + num,
                    "name": epName,
                    "slug": "ep-" + num
                });
            }
        } else {
            eps.push({
                "id": WEB + "/api/anime/" + animeId + "?ep=1|data:1",
                "name": "Full",
                "slug": "ep-1"
            });
        }

        var servers = [{ "name": "AniDoki", "episodes": eps }];

        return JSON.stringify({
            "id": animeId,
            "title": title,
            "originName": d.title && d.title.romaji ? d.title.romaji : title,
            "posterUrl": poster,
            "backdropUrl": d.bannerImage || poster,
            "description": d.description || "",
            "quality": d.format || "HD",
            "year": d.year || "",
            "rating": d.score || "",
            "status": d.status || "",
            "category": genres,
            "episode_current": d.isMovie ? "Full" : (d.currentEpisode ? ("Tập " + d.currentEpisode) : (list.length ? list.length + " tập" : "")),
            "servers": servers,
            "duration": d.duration || "",
            "casts": "",
            "director": "",
            "country": ""
        });
    } catch (e) {
        log("parseMovieDetail err: " + e);
        return JSON.stringify({ "id": apiUrl || "error", "title": "Lỗi AniDoki", "description": String(e), "servers": [] });
    }
}

// =============================================================================
// STREAM / PLAY
// =============================================================================
function abs(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    return WEB + (path.indexOf("/") === 0 ? "" : "/") + path;
}

function resolveStream(episodeId, datasend) {
    var raw = String(episodeId || "");
    var clean = raw.split("|")[0];

    // Nếu đã là link stream trực tiếp
    if (/\.(m3u8|mp4|mkv)(\?|$)/i.test(clean)) {
        return JSON.stringify({
            "url": clean,
            "mimeType": clean.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4",
            "isEmbed": false,
            "headers": { "User-Agent": UA, "Referer": WEB + "/", "Origin": WEB },
            "subtitles": []
        });
    }

    // Lấy animeId + số tập
    var animeId = "";
    var m = clean.match(/\/api\/anime\/([^\/|?]+)/);
    if (m) animeId = decodeURIComponent(m[1]);

    var ep = "";
    var em = clean.match(/[?&]ep=([0-9.]+)/);
    if (em) ep = em[1];
    if (!ep && datasend) ep = datasend;
    if (!ep) {
        var mm = raw.match(/\|data:?([^|]*)/);
        if (mm) ep = mm[1];
    }
    ep = String(ep).replace(/[^0-9.]/g, "");
    if (!animeId) throw new Error("Thiếu animeId trong: " + episodeId);
    if (!ep) ep = "1";

    var payload = JSON.stringify({
        "anime_id": animeId,
        "episode_number": parseInt(ep, 10) || 1,
        "language": "Vietsub",
        "provider": "AniDoki"
    });

    var res = httpRequest(WEB + "/api/watch/sources", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Referer": WEB + "/",
            "Origin": WEB,
            "User-Agent": UA
        },
        body: payload
    });

    if (!res || !res.isSuccessful) throw new Error("watch/sources fail status=" + (res && res.status));
    var data = JSON.parse(res.body);
    if (!data || !data.success) throw new Error(data && data.message ? data.message : "Không có nguồn phát");

    var stream = abs(data.stream_url || "");
    var isHls = (data.type === "hls") || (stream.indexOf(".m3u8") > -1);

    var subs = [];
    if (data.subtitles && data.subtitles.length) {
        for (var i = 0; i < data.subtitles.length; i++) {
            var s = data.subtitles[i];
            if (s && s.file) subs.push({ "lang": s.label || ("Sub " + (i + 1)), "url": abs(s.file), "mimeType": "text/vtt" });
        }
    }
    log("stream: " + stream);

    return JSON.stringify({
        "url": stream,
        "mimeType": isHls ? "application/x-mpegURL" : "video/mp4",
        "isEmbed": false,
        "headers": {
            "User-Agent": UA,
            "Referer": WEB + "/",
            "Origin": WEB
        },
        "subtitles": subs
    });
}

function getStreamLink(episodeId, datasend) {
    try { return resolveStream(episodeId, datasend); }
    catch (e) {
        log("getStreamLink err: " + e);
        return "";
    }
}

function parseDetailResponse(body, apiUrl, datasend) {
    log("parseDetailResponse: " + apiUrl);
    try { return resolveStream(apiUrl, datasend); }
    catch (e) {
        log("parseDetailResponse err: " + e);
        return JSON.stringify({ "url": "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", "mimeType": "video/mp4", "isEmbed": false, "headers": {}, "subtitles": [] });
    }
}

function parseEmbedResponse(body, url, datasend) {
    return parseDetailResponse(body, url, datasend);
}
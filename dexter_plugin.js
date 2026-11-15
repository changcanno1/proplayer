var DEXTER_BASE = "https://dexter.pw";
var DEXTER_API = DEXTER_BASE + "/api";
var DEXTER_UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
var DEXTER_IMG = "https://image.tmdb.org/t/p/";
var DEXTER_HEADERS = {
    "User-Agent": DEXTER_UA,
    "Accept": "application/json, text/plain, */*",
    "Referer": DEXTER_BASE + "/"
};
var DX_MASTER_CACHE = {};
var DX_SUB_WORKER = "https://getsubtitle.alokillgtv.workers.dev/";
var DX_GENRES = [
    { id: 28, slug: "hanh-dong", name: "Hành động", aliases: ["action"] },
    { id: 12, slug: "phieu-luu", name: "Phiêu lưu", aliases: ["adventure"] },
    { id: 16, slug: "hoat-hinh", name: "Hoạt hình", aliases: ["animation"] },
    { id: 35, slug: "hai", name: "Hài", aliases: ["comedy"] },
    { id: 80, slug: "toi-pham", name: "Tội phạm", aliases: ["crime"] },
    { id: 99, slug: "tai-lieu", name: "Tài liệu", aliases: ["documentary"] },
    { id: 18, slug: "chinh-kich", name: "Chính kịch", aliases: ["drama"] },
    { id: 10751, slug: "gia-dinh", name: "Gia đình", aliases: ["family"] },
    { id: 14, slug: "gia-tuong", name: "Giả tưởng", aliases: ["fantasy"] },
    { id: 36, slug: "lich-su", name: "Lịch sử", aliases: ["history"] },
    { id: 27, slug: "kinh-di", name: "Kinh dị", aliases: ["horror"] },
    { id: 10402, slug: "am-nhac", name: "Âm nhạc", aliases: ["music"] },
    { id: 9648, slug: "bi-an", name: "Bí ẩn", aliases: ["mystery"] },
    { id: 10749, slug: "lang-man", name: "Lãng mạn", aliases: ["romance"] },
    { id: 878, slug: "khoa-hoc-vien-tuong", name: "Khoa học viễn tưởng", aliases: ["science-fiction", "sci-fi"] },
    { id: 53, slug: "giat-gan", name: "Giật gân", aliases: ["thriller"] },
    { id: 10752, slug: "chien-tranh", name: "Chiến tranh", aliases: ["war"] },
    { id: 37, slug: "vien-tay", name: "Viễn Tây", aliases: ["western"] }
];

function dxLog(step, msg) {
    try { console.log("[DEXTER] " + step + " | " + msg); } catch (e) {}
}

function dxTrim(s) {
    return String(s === undefined || s === null ? "" : s).replace(/^\s+|\s+$/g, "");
}

function dxAscii(s) {
    return String(s || "").toLowerCase()
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
        .replace(/[èéẹẻẽêềếệểễ]/g, "e")
        .replace(/[ìíịỉĩ]/g, "i")
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
        .replace(/[ùúụủũưừứựửữ]/g, "u")
        .replace(/[ỳýỵỷỹ]/g, "y")
        .replace(/đ/g, "d");
}

function dxSafeJson(s) {
    try {
        if (!s) return null;
        var text = String(s).replace(/^\uFEFF/, "").replace(/^\s+/, "");
        if (text.charAt(0) !== "{" && text.charAt(0) !== "[") return null;
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}

function dxBody(res) {
    if (!res) return "";
    if (res.body !== undefined && res.body !== null) return String(res.body);
    if (res.data !== undefined && res.data !== null) return String(res.data);
    if (res.text !== undefined && res.text !== null) return String(res.text);
    return "";
}

function dxOk(res) {
    if (!res) return false;
    var code = parseInt(res.status, 10);
    return res.isSuccessful === true || code >= 200 && code < 300;
}

function dxHttp(url, label, timeout, headers) {
    if (!url) return null;
    try {
        dxLog("HTTP", label + " -> " + url);
        if (typeof httpRequest !== "function") {
            dxLog("HTTP", "httpRequest khong ton tai");
            return null;
        }
        var res = httpRequest(url, { method: "GET", headers: headers || DEXTER_HEADERS, timeout: timeout || 15000 });
        var body = dxBody(res);
        dxLog("HTTP", label + " <- status=" + (res ? res.status : "null") + " bytes=" + body.length);
        return res;
    } catch (e) {
        dxLog("HTTP", label + " LOI " + (e && e.message ? e.message : e) + " | " + url);
        return null;
    }
}

function dxGetJson(url, label, timeout) {
    var res = dxHttp(url, label, timeout);
    var body = dxBody(res);
    var data = dxSafeJson(body);
    if (!data) {
        dxLog("JSON", label + " khong phai JSON | body=" + body.slice(0, 160).replace(/\s+/g, " "));
    }
    return data;
}

function dxGetMaster(url) {
    url = dxAbs(url);
    if (!url) return "";
    if (DX_MASTER_CACHE[url]) return DX_MASTER_CACHE[url];
    var res = dxHttp(url, "MASTER", 15000);
    var body = dxBody(res);
    if (dxOk(res) && body.indexOf("#EXTM3U") >= 0) {
        DX_MASTER_CACHE[url] = body;
        return body;
    }
    return "";
}

function dxAbs(u) {
    u = dxTrim(u);
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (u.indexOf("//") === 0) return "https:" + u;
    return DEXTER_BASE + (u.charAt(0) === "/" ? u : "/" + u);
}

function dxImg(path, size) {
    path = dxTrim(path);
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return DEXTER_IMG + (size || "w500") + (path.charAt(0) === "/" ? path : "/" + path);
}

function dxStripPipe(u) {
    u = String(u || "");
    var i = u.indexOf("|");
    if (i >= 0) u = u.substring(0, i);
    u = u.replace(/#.*$/, "");
    return dxTrim(u);
}

function dxIdFromUrl(u) {
    u = dxStripPipe(u);
    var m = u.match(/\/(?:movie|show|watch)\/(?:show\/)?([A-Za-z0-9]+)/);
    if (m) return m[1];
    m = u.match(/\/(\d+)(?:-|\/|$)/);
    return m ? m[1] : "";
}

function dxMovieApi(u) {
    var id = dxIdFromUrl(u);
    return id ? DEXTER_API + "/movie/" + id : "";
}

function dxShowApi(u) {
    var id = dxIdFromUrl(u);
    return id ? DEXTER_API + "/tv/" + id : "";
}

function dxEpisodeApi(u) {
    u = dxStripPipe(u);
    var m = u.match(/\/api\/tv\/(\d+)\/episode\/(\d+)\/(\d+)/i);
    if (m) return DEXTER_API + "/tv/" + m[1] + "/episode/" + m[2] + "/" + m[3];
    m = u.match(/\/watch\/show\/(\d+)\/(\d+)\/(\d+)/i);
    if (m) return DEXTER_API + "/tv/" + m[1] + "/episode/" + m[2] + "/" + m[3];
    m = u.match(/\/show\/(\d+)/i);
    if (m) {
        var s = (u.match(/[#?&](?:s|season)=(\d+)/i) || [])[1] || "1";
        var e = (u.match(/[#?&](?:e|episode)=(\d+)/i) || [])[1] || "1";
        return DEXTER_API + "/tv/" + m[1] + "/episode/" + s + "/" + e;
    }
    if (/\/api\/movie\/\d+/i.test(u) || /\/movie\/\d+/i.test(u) || /\/watch\/\d+/i.test(u)) {
        return dxMovieApi(u);
    }
    return u;
}

function dxDetailApi(u) {
    u = dxStripPipe(u);
    if (/\/api\/tv\/\d+\/episode\//i.test(u) || /\/watch\/show\/\d+\/\d+\/\d+/i.test(u)) return dxEpisodeApi(u);
    if (/\/api\/movie\/\d+/i.test(u) || /\/api\/tv\/\d+/i.test(u)) return u;
    if (/\/show\//i.test(u)) return dxShowApi(u);
    if (/\/movie\//i.test(u) || /\/watch\//i.test(u)) return dxMovieApi(u);
    return dxEpisodeApi(u);
}

function dxPad(n) {
    n = parseInt(n, 10) || 0;
    return n < 10 ? "0" + n : String(n);
}

function dxClean(s) {
    return String(s || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .replace(/^\s+|\s+$/g, "");
}

function dxLang(code) {
    var c = dxTrim(code);
    var map = {
        "vi": "Tiếng Việt", "en": "English", "ar": "العربية", "pt-BR": "Português (Brasil)",
        "pt": "Português", "es": "Español", "fr": "Français", "de": "Deutsch",
        "it": "Italiano", "ru": "Русский", "ja": "日本語", "ko": "한국어",
        "zh": "中文", "zh-CN": "中文 (简体)", "zh-TW": "中文 (繁體)", "id": "Indonesia",
        "th": "ไทย", "tr": "Türkçe", "pl": "Polski", "nl": "Nederlands",
        "sv": "Svenska", "da": "Dansk", "fi": "Suomi", "no": "Norsk",
        "cs": "Čeština", "hu": "Magyar", "ro": "Română", "el": "Ελληνικά",
        "he": "עברית", "hi": "हिन्दी", "fa": "فارسی", "uk": "Українська",
        "ms": "Melayu", "sr": "Српски", "hr": "Hrvatski", "bg": "Български",
        "sk": "Slovenčina", "sl": "Slovenščina", "lt": "Lietuvių", "lv": "Latviešu",
        "et": "Eesti", "sq": "Shqip", "mk": "Македонски", "bs": "Bosanski",
        "ca": "Català", "eu": "Euskara", "gl": "Galego", "af": "Afrikaans",
        "sw": "Kiswahili", "tl": "Tagalog", "fil": "Filipino", "bn": "বাংলা",
        "ta": "தமிழ்", "te": "తెలుగు", "ml": "മലയാളം", "ur": "اردو",
        "yue": "粵語"
    };
    return map[c] || c || "Unknown";
}

function dxSubGroup(code) {
    var c = dxTrim(code).toLowerCase();
    if (c === "vi" || c === "vie" || c.indexOf("vi-") === 0) return "vi";
    if (c === "en" || c === "eng" || c.indexOf("en-") === 0) return "en";
    if (c === "zh" || c === "zho" || c === "chi" || c === "cn" || c === "yue" || c.indexOf("zh-") === 0) return "zh";
    return "";
}

function getManifest() {
    var m = {
        id: "dexter",
        name: "Dexter",
        version: "1.3.0",
        description: "Nguồn phim nước ngoài có chất lượng cao, 4K xem mượt. Phụ đề việt.",
        BASEURL: DEXTER_BASE,
        iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/icon/dexter.png",
        referrer: DEXTER_BASE + "/",
        isEnabled: true,
        isAdult: false,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "exoplayer",
        subtitleCat: true,
        debug: true
    };
    dxLog("MANIFEST", "version=" + m.version + " | playerType=" + m.playerType);
    return JSON.stringify(m);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "home", title: "Mới & Nổi bật", type: "Horizontal" },
        { slug: "tv", title: "Phim bộ", type: "Horizontal" },
        { slug: "movies", title: "Phim lẻ", type: "Grid" },
    ]);
}

function dxGenreKey(value) {
    var key = dxTrim(String(value || "").split("|")[0]);
    try { key = decodeURIComponent(key); } catch (e) {}
    key = dxAscii(key).replace(/^the-loai\s*\/?\s*/, "");
    key = key.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return key.replace(/^the-loai-/, "").replace(/^-+|-+$/g, "");
}

function dxGenreById(id) {
    id = String(id || "");
    for (var i = 0; i < DX_GENRES.length; i++) {
        if (String(DX_GENRES[i].id) === id) return DX_GENRES[i];
    }
    return null;
}

function dxGenreByKey(key) {
    key = dxGenreKey(key);
    if (!key) return null;
    for (var i = 0; i < DX_GENRES.length; i++) {
        var g = DX_GENRES[i];
        if (g.slug === key || String(g.id) === key) return g;
        for (var j = 0; j < g.aliases.length; j++) {
            if (g.aliases[j] === key) return g;
        }
    }
    return null;
}

function getPrimaryCategories() {
    var out = [
        { name: "Phim lẻ", slug: "movies" },
        { name: "Phim bộ", slug: "tv" }
    ];
    for (var i = 0; i < DX_GENRES.length; i++) {
        out.push({ name: DX_GENRES[i].name, slug: DX_GENRES[i].slug });
    }
    return JSON.stringify(out);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [] });
}

function getUrlList(slug, filtersJson) {
    var f = {};
    try { f = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = parseInt(f.page, 10) || parseInt(f.pageNumber, 10) || 1;
    var key = dxTrim(slug).replace(/^\/+|\/+$/g, "").toLowerCase();
    var type = String(f.type || "").toLowerCase() === "tv" || String(f.type || "").toLowerCase() === "show" ? "tv" : "movie";
    var genre = dxGenreByKey(key) || dxGenreByKey(f.category) || dxGenreByKey(f.genre);
    var url;
    if (key === "movies" || key === "movie" || key === "phim-le") {
        url = DEXTER_API + "/browse?type=movie" + (genre ? "&genre=" + genre.id : "") + "&page=" + page;
    } else if (key === "tv" || key === "shows" || key === "phim-bo") {
        url = DEXTER_API + "/browse?type=tv" + (genre ? "&genre=" + genre.id : "") + "&page=" + page;
    } else if (genre) {
        url = DEXTER_API + "/browse?type=" + type + "&genre=" + genre.id + "&page=" + page;
    } else if (!key || key === "home" || key === "trang-chu") {
        url = DEXTER_API + "/home";
    } else {
        dxLog("LIST-URL", "khong nhan dien the loai | " + key);
        url = DEXTER_API + "/browse?type=movie&page=" + page;
    }
    dxLog("LIST-URL", "slug=" + (slug || "home") + " genre=" + (genre ? genre.slug : "") + " page=" + page + " -> " + url);
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var f = {};
    try { f = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = parseInt(f.page, 10) || 1;
    var url = DEXTER_API + "/search?q=" + encodeURIComponent(keyword || "") + "&page=" + page;
    dxLog("SEARCH-URL", "q=" + keyword + " page=" + page + " -> " + url);
    return url;
}

function getUrlDetail(slug) {
    var api = dxDetailApi(slug);
    dxLog("DETAIL-URL", "slug=" + slug + " -> " + api);
    return api;
}

function getUrlCategories() {
    return DEXTER_API + "/home";
}

function parseCategoriesResponse(apiResponseJson) {
    var data = apiResponseJson;
    if (typeof apiResponseJson === "string") data = dxSafeJson(apiResponseJson);
    var out = [];
    var seen = {};
    function add(g) {
        if (!g) return;
        var def = dxGenreById(g.id) || dxGenreByKey(g.slug) || dxGenreByKey(g.name);
        if (!def || seen[def.slug]) return;
        seen[def.slug] = true;
        out.push({ name: def.name, slug: def.slug });
    }
    if (data && data.shelves) {
        for (var i = 0; i < data.shelves.length; i++) {
            var shelf = data.shelves[i] || {};
            if (shelf.kind !== "genres" || !shelf.genres) continue;
            for (var j = 0; j < shelf.genres.length; j++) add(shelf.genres[j]);
        }
    }
    if (data && data.genres) {
        for (var k = 0; k < data.genres.length; k++) add(data.genres[k]);
    }
    if (!out.length) {
        for (var m = 0; m < DX_GENRES.length; m++) {
            out.push({ name: DX_GENRES[m].name, slug: DX_GENRES[m].slug });
        }
    }
    dxLog("CATEGORIES", "items=" + out.length + (out.length ? " | first=" + out[0].name : ""));
    return JSON.stringify(out);
}

function dxItem(x) {
    if (!x) return null;
    var type = x.type === "tv" ? "show" : "movie";
    var id = x.id ? DEXTER_BASE + "/" + type + "/" + x.id : "";
    if (!id && x.url) id = dxAbs(x.url);
    var poster = dxImg(x.poster || x.portrait || x.backdrop, "w500");
    var backdrop = dxImg(x.backdrop || x.poster, "w1280");
    return {
        id: id,
        title: dxClean(x.title || x.name || ""),
        posterUrl: poster,
        backdropUrl: backdrop,
        description: dxClean(x.overview || x.description || ""),
        year: parseInt(x.year, 10) || 0,
        rating: x.rating || 0,
        quality: "HD",
        lang: "EN"
    };
}

function dxMapItems(arr) {
    var out = [];
    if (!arr || !arr.length) return out;
    for (var i = 0; i < arr.length; i++) {
        var it = dxItem(arr[i]);
        if (it && it.id) out.push(it);
    }
    return out;
}

function dxParseHtmlItems(html) {
    var out = [];
    var seen = {};
    var re = /<a[^>]+href=["'](\/(?:movie|show)\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var m;
    while ((m = re.exec(String(html || ""))) !== null) {
        if (seen[m[1]]) continue;
        seen[m[1]] = true;
        var title = dxClean(m[2]);
        var year = (title.match(/\((\d{4})\)/) || [])[1] || "";
        title = title.replace(/\s*\(\d{4}\)\s*$/, "");
        out.push({
            id: DEXTER_BASE + m[1],
            title: title || m[1],
            posterUrl: "",
            backdropUrl: "",
            year: parseInt(year, 10) || 0,
            quality: "HD",
            lang: "EN"
        });
    }
    return out;
}

function parseListResponse(html, apiUrl) {
    var data = dxSafeJson(html);
    var source = "app-body";
    if (!data) {
        dxLog("LIST", "body khong phai JSON, thu tai lai bang httpRequest");
        data = dxGetJson(apiUrl, "LIST-RETRY", 20000);
        source = "httpRequest";
    }
    if (data && data.items && data.pagination) {
        dxLog("LIST", "nhan lai JSON cua plugin | items=" + data.items.length);
        return JSON.stringify(data);
    }
    var items = [];
    if (data && data.hero) {
        items = dxMapItems(data.hero);
        if (!items.length && data.shelves) {
            for (var s = 0; s < data.shelves.length; s++) {
                items = dxMapItems(data.shelves[s].items);
                if (items.length) break;
            }
        }
    } else if (data && data.results) {
        items = dxMapItems(data.results);
    } else {
        items = dxParseHtmlItems(html);
    }
    var page = 1;
    var totalPages = 1;
    var totalItems = items.length;
    if (data) {
        page = parseInt(data.page, 10) || 1;
        totalPages = parseInt(data.totalPages, 10) || 1;
        totalItems = parseInt(data.totalResults, 10) || totalItems;
    }
    dxLog("LIST", "source=" + source + " items=" + items.length + " page=" + page + "/" + totalPages + " total=" + totalItems);
    if (items.length) {
        dxLog("LIST", "first=" + items[0].title + " | poster=" + items[0].posterUrl);
    }
    return JSON.stringify({
        items: items,
        pagination: { currentPage: page, totalPages: totalPages, totalItems: totalItems, itemsPerPage: items.length || 20 }
    });
}

function parseSearchResponse(html, apiUrl) {
    return parseListResponse(html, apiUrl);
}

function dxSeasonServers(showId) {
    var show = dxGetJson(DEXTER_API + "/tv/" + showId, "SHOW-DETAIL", 20000);
    if (!show) return { show: {}, servers: [] };
    dxLog("SHOW", "title=" + show.title + " | seasons=" + show.seasons + " | seasonList=" + (show.seasonList ? show.seasonList.length : 0));
    var list = show.seasonList || [];
    var seasons = [];
    for (var i = 0; i < list.length; i++) {
        var sn = parseInt(list[i].number, 10);
        if (!isNaN(sn)) seasons.push(sn);
    }
    if (!seasons.length) {
        for (var n = 1; n <= (parseInt(show.seasons, 10) || 1); n++) seasons.push(n);
    }
    seasons.sort(function (a, b) {
        if (a === 0) return 1;
        if (b === 0) return -1;
        return a - b;
    });
    var requests = [];
    for (var q = 0; q < seasons.length; q++) {
        requests.push({
            url: DEXTER_API + "/tv/" + showId + "/season/" + seasons[q],
            method: "GET",
            headers: DEXTER_HEADERS,
            timeout: 20000
        });
    }
    var responses = null;
    try {
        if (typeof fetchAll === "function") {
            dxLog("SEASONS", "fetchAll " + requests.length + " season");
            responses = fetchAll(requests);
        }
    } catch (e) {
        dxLog("SEASONS", "fetchAll loi " + (e && e.message ? e.message : e));
    }
    var servers = [];
    for (var r = 0; r < seasons.length; r++) {
        var seasonData = null;
        if (responses && responses[r]) {
            seasonData = dxSafeJson(dxBody(responses[r]));
            dxLog("SEASON", "S" + seasons[r] + " status=" + (responses[r].status) + " bytes=" + dxBody(responses[r]).length);
        } else {
            seasonData = dxGetJson(DEXTER_API + "/tv/" + showId + "/season/" + seasons[r], "SEASON-S" + seasons[r], 20000);
        }
        if (!seasonData || !seasonData.episodes) {
            dxLog("SEASON", "S" + seasons[r] + " khong co episodes");
            continue;
        }
        var eps = [];
        for (var e = 0; e < seasonData.episodes.length; e++) {
            var ep = seasonData.episodes[e];
            var sn2 = parseInt(ep.season, 10);
            var en = parseInt(ep.episode, 10);
            if (isNaN(sn2)) sn2 = seasons[r];
            if (isNaN(en)) continue;
            eps.push({
                id: DEXTER_API + "/tv/" + showId + "/episode/" + sn2 + "/" + en,
                name: "S" + dxPad(sn2) + "E" + dxPad(en) + " · " + dxClean(ep.title || ""),
                slug: "s" + sn2 + "e" + en,
                thumb: dxImg(ep.still, "w300")
            });
        }
        dxLog("SEASON", "S" + seasons[r] + " episodes=" + eps.length);
        if (eps.length) {
            servers.push({ name: "Season " + seasons[r], episodes: eps });
        }
    }
    return { show: show, servers: servers };
}

function parseMovieDetail(html, pageUrl, datasend) {
    var data = dxSafeJson(html);
    if (data && data.servers) {
        dxLog("DETAIL", "nhan lai JSON cua plugin | servers=" + data.servers.length);
        return JSON.stringify(data);
    }
    var api = dxDetailApi(pageUrl);
    dxLog("DETAIL", "page=" + pageUrl + " | api=" + api);
    if (!data || !data.type && !data.sources) {
        data = dxGetJson(api, "DETAIL-API", 20000);
    }
    if (!data) {
        dxLog("DETAIL", "khong lay duoc du lieu API");
        return JSON.stringify({ id: pageUrl, title: "Dexter", servers: [] });
    }
    if (data.show && data.episode) {
        data = data.show;
    }
    var isShow = data.type === "tv" || /\/tv\//i.test(api) || /\/show\//i.test(pageUrl);
    var title = dxClean(data.title || data.name || "Dexter");
    var poster = dxImg(data.poster || data.portrait, "w500");
    var backdrop = dxImg(data.backdrop || data.poster, "w1280");
    var servers = [];
    if (isShow) {
        var ss = dxSeasonServers(data.id);
        servers = ss.servers;
        if (!servers.length) {
            servers = [{ name: "Dexter", episodes: [{ id: DEXTER_API + "/tv/" + data.id + "/episode/1/1", name: "S01E01", slug: "s1e1" }] }];
        }
    } else {
        servers = dxMovieServers(data, DEXTER_API + "/movie/" + data.id);
        if (!servers.length) {
            servers = [{ name: "Dexter", episodes: [{ id: DEXTER_API + "/movie/" + data.id, name: "Full · 4K", slug: "full" }] }];
        }
    }
    var casts = [];
    if (data.cast) {
        for (var c = 0; c < data.cast.length && c < 12; c++) casts.push(data.cast[c].name);
    }
    var directors = [];
    if (data.directors) {
        for (var d = 0; d < data.directors.length; d++) directors.push(data.directors[d].name);
    }
    var out = {
        id: data.id ? String(data.id) : pageUrl,
        title: title,
        posterUrl: poster,
        backdropUrl: backdrop,
        description: dxClean(data.overview || ""),
        year: parseInt(data.year, 10) || 0,
        rating: data.rating || 0,
        quality: "4K",
        lang: "EN",
        casts: casts.join(", "),
        director: directors.join(", "),
        category: (data.genres || []).join(", "),
        status: data.status || "",
        duration: data.runtime ? data.runtime + " phút" : "",
        servers: servers
    };
    var count = 0;
    for (var i = 0; i < servers.length; i++) count += servers[i].episodes.length;
    dxLog("DETAIL", "title=" + title + " | show=" + isShow + " | servers=" + servers.length + " | episodes=" + count + " | poster=" + poster);
    return JSON.stringify(out);
}

function dxResolveApi(pageUrl) {
    var u = dxStripPipe(pageUrl);
    if (/\/api\/tv\/\d+\/episode\//i.test(u) || /\/watch\/show\/\d+\/\d+\/\d+/i.test(u)) return dxEpisodeApi(u);
    if (/\/api\/movie\/\d+/i.test(u)) return u;
    if (/\/show\//i.test(u)) return dxEpisodeApi(u);
    return dxDetailApi(u);
}

function dxSourceCandidates(data) {
    var out = [];
    if (!data || !data.sources) return out;
    for (var i = 0; i < data.sources.length; i++) {
        var s = data.sources[i] || {};
        if (s.kind === "hls" && s.url) out.push(s);
    }
    for (var j = 0; j < data.sources.length; j++) {
        var e = data.sources[j] || {};
        if (e.kind === "embed" && e.url) out.push(e);
    }
    return out;
}

function dxParseMaster(text, baseUrl) {
    var lines = String(text || "").split(/\r?\n/);
    var variants = [];
    var media = [];
    for (var i = 0; i < lines.length; i++) {
        var line = dxTrim(lines[i]);
        if (line.indexOf("#EXT-X-STREAM-INF") === 0) {
            var uri = "";
            for (var j = i + 1; j < lines.length; j++) {
                var next = dxTrim(lines[j]);
                if (!next) continue;
                if (next.charAt(0) !== "#") { uri = next; break; }
            }
            if (!uri) continue;
            var res = line.match(/RESOLUTION=(\d+)x(\d+)/i);
            var bw = line.match(/(?:AVERAGE-)?BANDWIDTH=(\d+)/i);
            variants.push({
                url: dxAbs(uri),
                uri: uri,
                line: line,
                start: i,
                uriIndex: j,
                width: res ? parseInt(res[1], 10) : 0,
                height: res ? parseInt(res[2], 10) : 0,
                bandwidth: bw ? parseInt(bw[1], 10) : 0
            });
        } else if (line.indexOf("#EXT-X-MEDIA:") === 0 && /TYPE=SUBTITLES/i.test(line)) {
            var uriM = line.match(/URI="([^"]+)"/i);
            if (!uriM) continue;
            media.push({
                url: dxAbs(uriM[1]),
                lang: (line.match(/LANGUAGE="([^"]+)"/i) || [])[1] || "und",
                label: (line.match(/NAME="([^"]+)"/i) || [])[1] || ""
            });
        }
    }
    return { variants: variants, media: media };
}

function dxPickVariants(variants) {
    var best = null;
    for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        if (!v.url) continue;
        if (!best ||
            v.height > best.height ||
            v.height === best.height && v.width > best.width ||
            v.height === best.height && v.width === best.width && v.bandwidth > best.bandwidth) {
            best = v;
        }
    }
    return best || (variants.length ? variants[0] : null);
}

function dxBetterVariant(a, b) {
    if (!b) return !!a;
    if (!a) return false;
    if (a.height !== b.height) return a.height > b.height;
    if (a.width !== b.width) return a.width > b.width;
    return a.bandwidth > b.bandwidth;
}

function dxPickAtHeight(variants, height) {
    height = parseInt(height, 10) || 0;
    if (!height) return dxPickVariants(variants);
    var exact = null;
    var below = null;
    var above = null;
    for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        if (!v.url || !v.height) continue;
        if (v.height === height) {
            if (!exact || v.bandwidth > exact.bandwidth) exact = v;
        } else if (v.height < height) {
            if (!below || v.height > below.height || v.height === below.height && v.bandwidth > below.bandwidth) below = v;
        } else {
            if (!above || v.height < above.height || v.height === above.height && v.bandwidth < above.bandwidth) above = v;
        }
    }
    return exact || below || above || dxPickVariants(variants);
}

function dxQualityLabel(v) {
    var w = parseInt(v.width, 10) || 0;
    var h = parseInt(v.height, 10) || 0;
    if (w >= 3800 || h >= 2000) return "4K";
    if (h >= 1400) return "2K";
    if (h >= 1000) return "1080p";
    if (h >= 700) return "720p";
    return (h || w || 0) + "p";
}

function dxBuildMaster(text, chosen) {
    if (!text || text.indexOf("#EXTM3U") < 0) return "";
    if (!chosen) return text;
    var lines = String(text).split(/\r?\n/);
    var out = [];
    for (var i = 0; i < lines.length; i++) {
        var line = dxTrim(lines[i]);
        if (!line) continue;
        if (i === chosen.start) {
            out.push(line);
            if (chosen.uri) out.push(chosen.uri);
            continue;
        }
        if (i === chosen.uriIndex) continue;
        if (line.indexOf("#EXT-X-MEDIA:") === 0) {
            if (/TYPE=AUDIO/i.test(line)) out.push(line);
            continue;
        }
        if (line.indexOf("#EXT-X-I-FRAME-STREAM-INF") === 0) continue;
        if (line.indexOf("#EXT-X-STREAM-INF") === 0) {
            while (i + 1 < lines.length) {
                i++;
                var nxt = dxTrim(lines[i]);
                if (!nxt) continue;
                if (nxt.charAt(0) === "#") continue;
                break;
            }
            continue;
        }
        if (line.charAt(0) === "#") out.push(line);
    }
    return out.join("\n");
}

function dxPlayOptions(datasend) {
    var raw = String(datasend || "");
    var pipe = raw.indexOf("|");
    if (pipe >= 0) raw = raw.substring(pipe + 1);
    raw = raw.replace(/^\s*data:/i, "");
    var out = {};
    if (!raw) return out;
    if (raw.charAt(0) === "{") {
        var obj = dxSafeJson(raw);
        if (obj) return obj;
    }
    try { raw = decodeURIComponent(raw); } catch (e) {}
    var re = /(?:^|[?&;])(src|s|h|w)=([^&;]*)/g;
    var m;
    while ((m = re.exec(raw)) !== null) out[m[1]] = m[2];
    if (out.s && !out.src) out.src = out.s;
    if (out.h) out.h = parseInt(out.h, 10) || 0;
    if (out.w) out.w = parseInt(out.w, 10) || 0;
    return out;
}

function dxMovieServers(data, api) {
    var ids = [];
    var sources = data && data.sources ? data.sources : [];
    var hlsIndex = 0;
    for (var i = 0; i < sources.length; i++) {
        var s = sources[i] || {};
        if (s.kind !== "hls" || !s.url || s.sealed) continue;
        var index = hlsIndex++;
        var masterUrl = dxAbs(s.url);
        var body = dxGetMaster(masterUrl);
        if (!body) continue;
        var parsed = dxParseMaster(body, masterUrl);
        if (!parsed.variants.length) continue;
        var arr = parsed.variants.slice();
        arr.sort(function (a, b) {
            if (a.height !== b.height) return b.height - a.height;
            if (a.width !== b.width) return b.width - a.width;
            return b.bandwidth - a.bandwidth;
        });
        var serverName = s.label || ("Server " + (i + 1));
        var seen = {};
        for (var j = 0; j < arr.length; j++) {
            var v = arr[j];
            if (!v.url || !v.height) continue;
            var key = v.width + "x" + v.height;
            if (seen[key]) continue;
            seen[key] = true;
            var ds = "src=" + index + "&h=" + v.height + "&w=" + v.width;
            ids.push({
                name: serverName + " · " + dxQualityLabel(v) + " (" + key + ")",
                url: api + "|data:" + ds,
                datasend: ds,
                _h: v.height,
                _w: v.width,
                _bw: v.bandwidth
            });
        }
    }
    ids.sort(function (a, b) {
        if (a._h !== b._h) return b._h - a._h;
        if (a._w !== b._w) return b._w - a._w;
        return b._bw - a._bw;
    });
    for (var k = 0; k < ids.length; k++) {
        delete ids[k]._h;
        delete ids[k]._w;
        delete ids[k]._bw;
    }
    if (!ids.length) return [];
    return [{
        name: "Nguồn Phim",
        episodes: [{
            id: ids[0].url,
            name: "Full",
            slug: "full",
            ids: ids
        }]
    }];
}

function dxOnlineSub(data, mediaKey) {
    var imdb = data && data.imdbId || "";
    var type = "movie";
    var title = data && data.title || "";
    var year = data && data.year || "";
    var season = 0;
    var episode = 0;
    if (data && data.show) {
        type = "tv";
        imdb = data.show.imdbId || imdb;
        title = data.show.title || title;
        year = data.show.year || year;
        season = data.episode && data.episode.season || 0;
        episode = data.episode && data.episode.episode || 0;
    }
    if (type === "tv" && (!season || !episode)) {
        var m = String(mediaKey || "").match(/^tv\/\d+\/(\d+)\/(\d+)/);
        if (m) {
            season = parseInt(m[1], 10) || 0;
            episode = parseInt(m[2], 10) || 0;
        }
    }
    if (!imdb) return null;
    var url = DX_SUB_WORKER + "?type=" + type + "&imdb=" + encodeURIComponent(imdb);
    if (type === "tv") url += "&season=" + season + "&episode=" + episode;
    var res = dxHttp(url, "SUBS-ONLINE", 20000, {
        "User-Agent": DEXTER_UA,
        "Accept": "application/json, text/plain, */*",
        "X-VAX-YB": "deo_co_gi_de_coi"
    });
    var list = dxSafeJson(dxBody(res));
    if (list && list.subtitles) list = list.subtitles;
    if (!list || !list.length) {
        dxLog("SUBS", "online khong co ket qua | imdb=" + imdb);
        return null;
    }
    function norm(v) {
        return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/^\s+|\s+$/g, "");
    }
    function pad(n) {
        n = parseInt(n, 10) || 0;
        return n < 10 ? "0" + n : String(n);
    }
    var words = norm(title).split(" ");
    var epTag = "s" + pad(season) + "e" + pad(episode);
    var best = null;
    var bestScore = -999;
    for (var i = 0; i < list.length; i++) {
        var item = list[i] || {};
        if (!item.url) continue;
        var text = [item.name, item.filename, item.label, item.lang, item.type].join(" ").toLowerCase();
        if (!/viet|vietsub|vietnamese|\bvi\b|\bvie\b/.test(text)) continue;
        var score = 20;
        if (type === "tv") {
            if (text.indexOf(epTag) >= 0) score += 50;
            else if (/\bs\d{1,2}\s*e\d{1,3}\b/.test(text)) score -= 30;
        }
        if (year && text.indexOf(String(year)) >= 0) score += 15;
        var hits = 0;
        for (var w = 0; w < words.length; w++) {
            if (words[w].length > 2 && text.indexOf(words[w]) >= 0) hits++;
        }
        score += Math.min(hits, 4) * 4;
        if (/extras|trailer|sample|featurette|deleted|commentary|behind the scenes/.test(text)) score -= 100;
        if (/\.vtt(?:[?#]|$)/i.test(item.url)) score += 3;
        if (score > bestScore) {
            bestScore = score;
            best = item;
        }
    }
    if (!best || bestScore <= 0) {
        dxLog("SUBS", "online khong co sub phu hop | imdb=" + imdb);
        return null;
    }
    dxLog("SUBS", "online chon=" + (best.name || best.filename || "") + " | score=" + bestScore);
    return {
        url: best.url,
        mimeType: best.mimetype || best.mimeType || "text/vtt",
        name: best.name || best.filename || "Vietsub Online"
    };
}

function dxSubEntries(data, media, mediaKey) {
    var out = [];
    var seen = {};
    var haveGroup = {};
    function add(lang, label, url, mimeType) {
        url = dxAbs(url);
        var group = dxSubGroup(lang);
        if (!group || !url || seen[url] || haveGroup[group]) return;
        seen[url] = true;
        haveGroup[group] = true;
        out.push({ lang: label || dxLang(lang), url: url, mimeType: mimeType || "text/vtt", _g: group });
    }
    function finish() {
        out.sort(function (a, b) {
            var pa = a._g === "vi" ? 0 : a._g === "en" ? 1 : 2;
            var pb = b._g === "vi" ? 0 : b._g === "en" ? 1 : 2;
            return pa - pb;
        });
        for (var i = 0; i < out.length; i++) delete out[i]._g;
        return out;
    }
    if (data && data.subtitles) {
        for (var s = 0; s < data.subtitles.length; s++) {
            var st = data.subtitles[s] || {};
            add(st.lang || st.language || "und", st.label || dxLang(st.lang || st.language), st.url || st.file || st.src);
        }
    }
    if (media) {
        for (var m = 0; m < media.length; m++) {
            add(media[m].lang, media[m].label || dxLang(media[m].lang), media[m].url);
        }
    }
    if (mediaKey) {
        var listUrl = DEXTER_API + "/subs/list/" + mediaKey;
        var list = dxGetJson(listUrl, "SUBS-LIST", 20000);
        if (!list || !list.files) {
            dxLog("SUBS", "khong co danh sach phu de | pending=" + (list && list.pending ? "true" : "false"));
        } else {
            dxLog("SUBS", "files=" + list.files.length + " | pending=" + (list.pending ? "true" : "false"));
            var groups = {};
            for (var i = 0; i < list.files.length; i++) {
                var f = list.files[i] || {};
                if (!f.id) continue;
                var group = dxSubGroup(f.lang);
                if (!group) continue;
                if (!groups[group]) groups[group] = [];
                groups[group].push(f);
            }
            var picked = [];
            var pickedIds = [];
            var order = ["vi", "en", "zh"];
            for (var g = 0; g < order.length; g++) {
                var key = order[g];
                if (haveGroup[key]) continue;
                var arr = groups[key] || [];
                if (!arr.length) continue;
                var chosen = arr[0];
                var url = chosen.url || (DEXTER_API + "/subs/file/" + mediaKey + "/" + chosen.id + ".vtt");
                add(chosen.lang, dxLang(chosen.lang) + (chosen.hi ? " (HI)" : ""), url);
                picked.push(key);
                pickedIds.push(chosen.id);
            }
            dxLog("SUBS", "chon=" + picked.join(",") + " | files=" + pickedIds.join(","));
        }
    }
    if (!haveGroup.vi) {
        var online = dxOnlineSub(data, mediaKey);
        if (online) add("vi", "Tiếng Việt (Online)", online.url, online.mimeType);
    }
    return finish();
}

function dxMediaKey(data, pageUrl) {
    if (data && data.show && data.episode) {
        return "tv/" + data.show.id + "/" + data.episode.season + "/" + data.episode.episode;
    }
    if (data && data.type === "movie" && data.id) return "movie/" + data.id;
    var u = dxStripPipe(pageUrl);
    var m = u.match(/\/api\/tv\/(\d+)\/episode\/(\d+)\/(\d+)/i) || u.match(/\/watch\/show\/(\d+)\/(\d+)\/(\d+)/i);
    if (m) return "tv/" + m[1] + "/" + m[2] + "/" + m[3];
    m = u.match(/\/api\/movie\/(\d+)/i) || u.match(/\/movie\/(\d+)/i) || u.match(/\/watch\/(\d+)/i);
    if (m) return "movie/" + m[1];
    return "";
}

function parseDetailResponse(html, pageUrl, datasend) {
    var direct = dxSafeJson(html);
    if (direct && direct.url && direct.headers) {
        dxLog("STREAM", "nhan lai JSON cua plugin | url=" + direct.url);
        return JSON.stringify(direct);
    }
    var api = dxResolveApi(pageUrl);
    dxLog("STREAM", "page=" + pageUrl + " | api=" + api);
    var data = direct;
    if (!data || !data.sources) {
        data = dxGetJson(api, "STREAM-API", 20000);
    }
    if (!data) {
        dxLog("STREAM", "khong lay duoc API stream");
        return JSON.stringify({ url: "", isEmbed: true, headers: { "Referer": DEXTER_BASE + "/" }, subtitles: [] });
    }
    var mediaKey = dxMediaKey(data, pageUrl);
    dxLog("STREAM", "mediaKey=" + mediaKey + " | title=" + (data.title || (data.show && data.show.title) || "") + " | sources=" + (data.sources ? data.sources.length : 0));
    var options = dxPlayOptions(datasend || pageUrl);
    var wantSrc = options.src !== undefined && options.src !== "" ? parseInt(options.src, 10) : -1;
    var wantH = parseInt(options.h, 10) || 0;
    if (isNaN(wantSrc)) wantSrc = -1;
    if (wantSrc >= 0 || wantH) dxLog("PLAY", "chon src=" + wantSrc + " | " + wantH + "p");
    var candidates = dxSourceCandidates(data);
    var selected = null;
    var selectedIndex = -1;
    var masterUrl = "";
    var masterText = "";
    var masterMedia = [];
    var bestVariant = null;
    var hlsIndex = 0;
    for (var i = 0; i < candidates.length; i++) {
        var src = candidates[i];
        if (src.kind !== "hls") continue;
        var srcIndex = hlsIndex++;
        if (src.sealed) {
            dxLog("SOURCE", "bo qua source sealed | " + src.label);
            continue;
        }
        var u = dxAbs(src.url);
        dxLog("SOURCE", "thu " + (src.label || src.id) + " | " + u);
        var body = dxGetMaster(u);
        if (body) {
            var parsed = dxParseMaster(body, u);
            var variant = wantH ? dxPickAtHeight(parsed.variants, wantH) : dxPickVariants(parsed.variants);
            dxLog("MASTER", (src.label || src.id) + " variants=" + parsed.variants.length + " | best=" + (variant ? variant.width + "x" + variant.height : "media") + " | subtitleTracks=" + parsed.media.length);
            var isWanted = wantSrc >= 0 && srcIndex === wantSrc;
            if (!selected || isWanted || wantSrc < 0 && dxBetterVariant(variant, bestVariant)) {
                selected = src;
                selectedIndex = srcIndex;
                masterUrl = u;
                masterText = body;
                masterMedia = parsed.media;
                bestVariant = variant;
            }
            if (isWanted) break;
        } else {
            dxLog("SOURCE", "that bai hoac cache trong | " + u);
        }
    }
    if (!selected) {
        var embed = null;
        for (var e = 0; e < candidates.length; e++) {
            if (candidates[e].kind === "embed") { embed = candidates[e]; break; }
        }
        if (embed) {
            dxLog("SOURCE", "khong co HLS, fallback embed | " + embed.url);
            return JSON.stringify({
                url: dxAbs(embed.url),
                isEmbed: true,
                headers: { "Referer": DEXTER_BASE + "/", "Origin": DEXTER_BASE, "User-Agent": DEXTER_UA },
                subtitles: []
            });
        }
        dxLog("SOURCE", "khong co source HLS/embed");
        return JSON.stringify({ url: "", isEmbed: true, headers: { "Referer": DEXTER_BASE + "/" }, subtitles: [] });
    }
    var chosen = bestVariant;
    dxLog("SOURCE", "chon " + (selected.label || selected.id) + " src=" + selectedIndex + " | " + (chosen ? chosen.width + "x" + chosen.height + " | bw=" + chosen.bandwidth : "media playlist") + " | subtitleTracks=" + masterMedia.length);
    var finalUrl = chosen ? chosen.url : masterUrl;
    var m3u8Content = dxBuildMaster(masterText, chosen);
    if (chosen) {
        dxLog("VARIANT", "chon=" + chosen.width + "x" + chosen.height + " | bw=" + chosen.bandwidth + " | " + finalUrl);
        var vres = dxHttp(finalUrl, "VARIANT", 15000);
        var vbody = dxBody(vres);
        if (!dxOk(vres) || vbody.indexOf("#EXTM3U") < 0) {
            dxLog("VARIANT", "variant loi, dung master | status=" + (vres ? vres.status : "null"));
            finalUrl = masterUrl;
            m3u8Content = masterText;
        }
    } else {
        dxLog("VARIANT", "master la media playlist, dung truc tiep");
    }
    var hasAudio = /#EXT-X-MEDIA:[^\n]*TYPE=AUDIO/i.test(m3u8Content);
    dxLog("CONTENT", "lines=" + m3u8Content.split(/\r?\n/).length + " | audioGroup=" + (hasAudio ? "yes" : "no"));
    var subs = dxSubEntries(data, masterMedia, mediaKey);
    dxLog("STREAM", "DONE url=" + finalUrl + " | subs=" + subs.length);
    return JSON.stringify({
        url: masterUrl,
        m3u8Content: m3u8Content,
        baseUrl: masterUrl,
        isEmbed: false,
        mimeType: "application/x-mpegURL",
        headers: {
            "User-Agent": DEXTER_UA,
            "Referer": DEXTER_BASE + "/",
            "Origin": DEXTER_BASE,
            "Accept": "*/*"
        },
        subtitles: subs
    });
}

function parseEmbedResponse(html, url, datasend) {
    return parseDetailResponse(html, url, datasend);
}

var globalThis = typeof globalThis !== "undefined" ? globalThis : this;
globalThis.getManifest = getManifest;
globalThis.getHomeSections = getHomeSections;
globalThis.getPrimaryCategories = getPrimaryCategories;
globalThis.getFilterConfig = getFilterConfig;
globalThis.getUrlList = getUrlList;
globalThis.getUrlSearch = getUrlSearch;
globalThis.getUrlDetail = getUrlDetail;
globalThis.getUrlCategories = getUrlCategories;
globalThis.parseCategoriesResponse = parseCategoriesResponse;
globalThis.parseListResponse = parseListResponse;
globalThis.parseSearchResponse = parseSearchResponse;
globalThis.parseMovieDetail = parseMovieDetail;
globalThis.parseDetailResponse = parseDetailResponse;
globalThis.parseEmbedResponse = parseEmbedResponse;
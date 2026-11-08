/* ═══════════════════════════════════════════════════════════════════════
   FILM4K PLUGIN v2.0 — Fix 3 bugs
   ─────────────────────────────────────────────────────────────────────
   Bug fixes:
   1. parseDetailResponse: fetch lại /api/title/<slug> → src mới (fix expire)
   2. getTicket: TTL cache + fallback vax.local (cookie device)
   3. parseMovieDetail: encode slug + season + ep vào episode.id
   
   Toggle log: window.__F4K_LOG__ = false (mặc định: BẬT)
   ═══════════════════════════════════════════════════════════════════════ */

function _f4kLog() {
    try { console.log.apply(console, ['[film4k]'].concat([].slice.call(arguments))); } catch(e){}
}
function _f4kWarn() {
    try { console.warn.apply(console, ['[film4k]'].concat([].slice.call(arguments))); } catch(e){}
}

var SITE = "https://film4k.net";
var BASEURL = "https://film4k.net";
var API = SITE + "/api";
var UA = "Mozilla/5.0 (Linux; Android 13; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

var HEADERS = {
    "User-Agent": UA,
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
    "Referer": SITE + "/",
    "Origin": SITE
};

/* ⭐ Token cache với TTL */
var PT_TOKEN = "";
var PT_EXP = 0;
var PT_TTL_MS = 5 * 60 * 1000;   /* 5 phút default */

// ---------- Manifest ----------
function getManifest() {
    return JSON.stringify({
        "id": "film4k",
        "name": "Film4K",
        "version": "2.1",
        "author": "alokillgtv",
        "info": "Film4K — fix src expire + ticket TTL + vax.local fallback.",
        "baseUrl": SITE,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/film4k.png",
        "isEnabled": true,
        "isAdult": false,
        "adblock": false,
        "type": "MOVIE",
        "orientation": "auto",
        "subtitleCat": false,
        "debug": true,
        "playerType": "exoplayer"
    });
}

// ---------- Helpers ----------
function fix(u) {
    if (!u) return "";
    if (u.indexOf("//") === 0) return "https:" + u;
    if (u.indexOf("http") === 0) return u;
    if (u.indexOf("/") === 0) return SITE + u;
    return SITE + "/" + u;
}

function pad2(n) { n = parseInt(n, 10) || 0; return n < 10 ? "0" + n : String(n); }

function encB64(s) {
    var str = String(s), out = "";
    try { if (typeof btoa !== "undefined") out = btoa(unescape(encodeURIComponent(str))); } catch (e) { out = ""; }
    if (!out) {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        for (var block, charCode, idx = 0, map = chars;
            str.charAt(idx | 0) || (map = "=", idx % 1);
            out += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
            charCode = str.charCodeAt(idx += 3 / 4);
            block = block << 8 | charCode;
        }
    }
    return out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decB64(s) {
    s = String(s).replace(/-/g, "+").replace(/_/g, "/");
    try { if (typeof atob !== "undefined") return decodeURIComponent(escape(atob(s))); } catch (e) {}
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    s = s.replace(/=+$/, "");
    for (var bc = 0, bs, buffer, idx = 0;
        buffer = s.charAt(idx++);
        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) { buffer = chars.indexOf(buffer); }
    return output;
}

function req(url, method, headers) {
    var h = {};
    for (var k in HEADERS) h[k] = HEADERS[k];
    if (headers) for (var k2 in headers) h[k2] = headers[k2];
    var res = httpRequest(url, { method: method || "GET", headers: h });
    return res && res.body ? String(res.body) : "";
}

function getJSON(url) {
    try { return JSON.parse(req(url)); } catch (e) { _f4kWarn('getJSON err ' + url + ': ' + e); return null; }
}

/* ═══════════════════════════════════════════════════════════
   _callVaxLocal — MỚI: gọi vax.local để dùng cookie device
   ─────────────────────────────────────────────────────────
   - vax.local dùng IP + cookie của device (native bridge)
   - Worker proxy là server riêng → không có cookie login
   - Trả body thuần (unwrap {data:"..."} nếu có)
   ═══════════════════════════════════════════════════════════ */
function _callVaxLocal(targetUrl, method, headers, body) {
    try {
        var payload = {
            url: targetUrl,
            method: method || "GET",
            headers: headers || {},
            body: body || null,
            sessionId: "vaxpl_film4k",
            via: "direct"
        };
        var b64 = encB64(JSON.stringify(payload));
        if (!b64) return "";
        var vaxUrl = "https://vax.local/p?d=" + b64;
        var r = httpRequest(vaxUrl, { method: "GET" });
        if (r && r.body) {
            try {
                var j = JSON.parse(r.body);
                if (j && typeof j.data === "string") return j.data;
            } catch(e) {}
            return r.body;
        }
    } catch(e) {
        _f4kWarn('_callVaxLocal err: ' + e.message);
    }
    return "";
}

/* ═══════════════════════════════════════════════════════════
   getTicket v2 — SỬA: TTL cache + vax.local fallback
   ═══════════════════════════════════════════════════════════ */
function getTicket() {
    /* Check cache với TTL */
    if (PT_TOKEN && Date.now() < PT_EXP) {
        _f4kLog('getTicket: cache HIT | exp in ' + Math.round((PT_EXP - Date.now())/1000) + 's');
        return PT_TOKEN;
    }

    if (PT_TOKEN) {
        _f4kLog('getTicket: cache EXPIRED → re-fetch');
        PT_TOKEN = "";
        PT_EXP = 0;
    }

    var hdr = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Referer": SITE + "/",
        "Origin": SITE
    };

    /* Try 1: httpRequest (worker/direct) */
    try {
        var r1 = httpRequest(API + "/play-ticket", { method: "POST", headers: hdr, body: "{}" });
        var body1 = (r1 && r1.body) ? String(r1.body) : "";
        _f4kLog('getTicket[worker]: ' + body1.substring(0, 100));
        var j1 = JSON.parse(body1);
        if (j1 && j1.token) {
            PT_TOKEN = j1.token;
            var _ttl = j1.expiresIn || j1.expires_in || 300;
            PT_EXP = Date.now() + (_ttl * 1000);
            _f4kLog('getTicket: ✅ worker token | TTL=' + _ttl + 's');
            return PT_TOKEN;
        }
        if (j1 && j1.signedIn === false) {
            _f4kLog('getTicket: worker signedIn=false → thử vax.local');
        }
    } catch(e) {
        _f4kWarn('getTicket[worker] err: ' + e.message);
    }

    /* Try 2: vax.local (cookie device) */
    var body2 = _callVaxLocal(API + "/play-ticket", "POST", hdr, "{}");
    if (body2) {
        _f4kLog('getTicket[vax]: ' + body2.substring(0, 100));
        try {
            var j2 = JSON.parse(body2);
            if (j2 && j2.token) {
                PT_TOKEN = j2.token;
                var _ttl2 = j2.expiresIn || j2.expires_in || 300;
                PT_EXP = Date.now() + (_ttl2 * 1000);
                _f4kLog('getTicket: ✅ vax.local token | TTL=' + _ttl2 + 's');
                return PT_TOKEN;
            }
            if (j2 && j2.signedIn === false) {
                _f4kLog('getTicket: vax.local cũng signedIn=false → user chưa login film4k');
            }
        } catch(e) {}
    }

    /* Try 3: GET last resort */
    try {
        var r3 = httpRequest(API + "/play-ticket", { method: "GET", headers: { "Accept": "application/json", "User-Agent": UA, "Referer": SITE + "/", "Origin": SITE } });
        var body3 = (r3 && r3.body) ? String(r3.body) : "";
        var j3 = JSON.parse(body3);
        if (j3 && j3.token) {
            PT_TOKEN = j3.token;
            PT_EXP = Date.now() + 300 * 1000;
            return PT_TOKEN;
        }
    } catch(e) {}

    _f4kWarn('getTicket: ❌ tất cả cách fail → trả rỗng');
    return "";
}

// ---------- Categories / Sections ----------
function catelist() {
    return JSON.stringify([
        { id: "/home",  title: "Mới cập nhật", quality: "", episode_current: "Thể loại", posterUrl: "", backdropUrl: "", isFolder: true, year: "", lang: "" },
        { id: "/movie", title: "lẻ",       quality: "", episode_current: "Thể loại", posterUrl: "", backdropUrl: "", isFolder: true, year: "", lang: "" },
        { id: "/tv",    title: "bộ",       quality: "", episode_current: "Thể loại", posterUrl: "", backdropUrl: "", isFolder: true, year: "", lang: "" }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/movie", "title": "Phim Lẻ", "type": "Horizontal" },
        { "slug": "/tv",    "title": "Phim Bộ", "type": "Horizontal" },
        { "slug": "/home",  "title": "Phim Mới", "type": "Grid" }
    ]);
}

function getLISTmenu() {
    try{
      return `[{
    "link": "/?browse=1",
    "name": "Tất cả"
}, {
    "link": "/?browse=1",
    "name": "Action & Adventure"
}, {
    "link": "/?genre=Ch%C6%B0%C6%A1ng+Tr%C3%ACnh+Truy%E1%BB%81n+H%C3%ACnh&browse=1",
    "name": "Chương Trình"
}, {
    "link": "/?genre=Kids&browse=1",
    "name": "Kids"
}, {
    "link": "/?genre=Phim+B%C3%AD+%E1%BA%A8n&browse=1",
    "name": "Bí Ẩn"
}, {
    "link": "/?genre=Phim+Chi%E1%BA%BFn+Tranh&browse=1",
    "name": "Chiến Tranh"
}, {
    "link": "/?genre=Phim+Ch%C3%ADnh+K%E1%BB%8Bch&browse=1",
    "name": "Chính Kịch"
}, {
    "link": "/?genre=Phim+Gia+%C4%90%C3%ACnh&browse=1",
    "name": "Gia Đình"
}, {
    "link": "/?genre=Phim+Gi%E1%BA%A3+T%C6%B0%E1%BB%A3ng&browse=1",
    "name": "Giả Tượng"
}, {
    "link": "/?genre=Phim+G%C3%A2y+C%E1%BA%A5n&browse=1",
    "name": "Gây Cấn"
}, {
    "link": "/?genre=Phim+Ho%E1%BA%A1t+H%C3%ACnh&browse=1",
    "name": "Hoạt Hình"
}, {
    "link": "/?genre=Phim+H%C3%A0i&browse=1",
    "name": "Hài"
}, {
    "link": "/?genre=Phim+H%C3%A0nh+%C4%90%E1%BB%99ng&browse=1",
    "name": "Hành Động"
}, {
    "link": "/?genre=Phim+H%C3%ACnh+S%E1%BB%B1&browse=1",
    "name": "Hình Sự"
}, {
    "link": "/?genre=Phim+Khoa+H%E1%BB%8Dc+Vi%E1%BB%85n+T%C6%B0%E1%BB%9Fng&browse=1",
    "name": "Viễn Tưởng"
}, {
    "link": "/?genre=Phim+Kinh+D%E1%BB%8B&browse=1",
    "name": "Kinh Dị"
}, {
    "link": "/?genre=Phim+L%C3%A3ng+M%E1%BA%A1n&browse=1",
    "name": "Lãng Mạn"
}, {
    "link": "/?genre=Phim+L%E1%BB%8Bch+S%E1%BB%AD&browse=1",
    "name": "Lịch Sử"
}, {
    "link": "/?genre=Phim+Mi%E1%BB%81n+T%C3%A2y&browse=1",
    "name": "Miền Tây"
}, {
    "link": "/?genre=Phim+Nh%E1%BA%A1c&browse=1",
    "name": "Nhạc"
}, {
    "link": "/?genre=Phim+Phi%C3%AAu+L%C6%B0u&browse=1",
    "name": "Phiêu Lưu"
}, {
    "link": "/?genre=Phim+T%C3%A0i+Li%E1%BB%87u&browse=1",
    "name": "Tài Liệu"
}, {
    "link": "/?genre=Reality&browse=1",
    "name": "Reality"
}, {
    "link": "/?genre=Sci-Fi+%26+Fantasy&browse=1",
    "name": "Fantasy"
}, {
    "link": "/?genre=Soap&browse=1",
    "name": "Soap"
}, {
    "link": "/?genre=Talk&browse=1",
    "name": "Talk"
}, {
    "link": "/?genre=War+%26+Politics&browse=1",
    "name": "War"
}]`;
    } catch(e){
      _f4kWarn("getLISTmenu[err]: " + e);
      return `[{"link":"/","name":"Đang lỗi getLISTmenu()"}]`;
    }
}

function getPrimaryCategories() {
    try { return JSON.stringify(buildMenu(getLISTmenu())); }
    catch (e) { _f4kWarn("getPrimaryCategories[err]: " + e); return JSON.stringify([]); }
}

function getFilterConfig() {
    try { return JSON.stringify({ category: buildMenu(getLISTmenu(), "filter") }); }
    catch (e) { _f4kWarn("getFilterConfig[err]: " + e); return JSON.stringify({ category: [] }); }
}

// ---------- Build list URL ----------
function getUrlList(slug, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var f = JSON.parse(filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'));
            page = parseInt(f.page) || 1;
            if (f.category) {
                if (Array.isArray(f.category) && f.category.length > 0) slug = f.category[0].slug;
                else if (typeof f.category === "string") slug = f.category;
            }
        } catch (e) {}
    }

    var s = slug || "/home";
    if (s.indexOf("/") !== 0) s = "/" + s;

    var url = API + "/home";
    var parts = [];

    if (s.indexOf("/?") === 0) {
        var qs = s.substring(2);
        if (qs) parts.push(qs);
    }
    else if (s.indexOf("/genre/") === 0) {
        var genre = s.substring(7);
        if (genre) parts.push("genre=" + encodeURIComponent(decodeURIComponent(genre)));
    }
    else if (s === "/movie") {
        parts.push("type=movie");
    } else if (s === "/tv") {
        parts.push("type=tv");
    }

    if (page > 1) parts.push("page=" + page);
    if (parts.length) url += "?" + parts.join("&");

    _f4kLog("[getUrlList] slug=\"" + s + "\" → " + url);
    return url;
}

// ---------- Parse list ----------
function itemToCard(it) {
    var title = (it.title && (it.title.vi || it.title.en)) || "";
    var poster = (it.poster && (it.poster.vi || it.poster.en)) || it.backdrop || "";
    var isTv = it.mediaType === "tv";
    return {
        "id": SITE + "/api/title/" + it.slug,
        "title": title,
        "quality": it.maxRes || (it.epTotal ? (it.epTotal + " tập") : ""),
        "episode_current": isTv ? "Playlist" : "Video",
        "posterUrl": poster,
        "backdropUrl": it.backdrop || poster,
        "year": it.year ? String(it.year) : "",
        "lang": (it.country && (it.country.vi || it.country.en)) || ""
    };
}

function parseListResponse(html, url) {
    try {
        var j = JSON.parse(html);
        var list = (j && j.list) ? j.list : [];
        var items = [];
        for (var i = 0; i < list.length; i++) items.push(itemToCard(list[i]));
        var total = j && j.total ? j.total : items.length;
        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": (j && j.page) || 1, "totalPages": Math.max(1, Math.ceil(total / 60)) }
        });
    } catch (e) {
        _f4kWarn("parseListResponse[err]: " + e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

// ---------- Detail ----------
function getUrlDetail(slug, datasend) {
    if (slug && slug.indexOf("http") === 0) {
        var i = slug.indexOf("|data:");
        return i !== -1 ? slug.slice(0, i) : slug;
    }
    return "";
}

/* ⭐ parseMovieDetail v2 — SỬA: encode slug + season + ep vào episode.id */
function parseMovieDetail(html, url) {
    try {
        var j = JSON.parse(html);
        var m = j.movie || {};
        var title = (m.title && (m.title.vi || m.title.en)) || "";
        var description = (m.overview && (m.overview.vi || m.overview.en)) || "";
        var poster = (m.poster && (m.poster.vi || m.poster.en)) || m.backdrop || "";
        var eps = j.episodes || [];

        /* ⭐ Extract slug từ url (url = API + "/title/" + slug) */
        var _slugMatch = String(url || "").match(/\/title\/([^?#]+)/);
        var _slug = _slugMatch ? _slugMatch[1] : (m.slug || "");
        _f4kLog("parseMovieDetail: slug=" + _slug + " | eps=" + eps.length);

        var epItems = [];
        var multiSeason = false;
        for (var s = 0; s < eps.length; s++) if ((eps[s].season || 1) > 1) multiSeason = true;

        for (var k = 0; k < eps.length; k++) {
            var e = eps[k];
            var src = (e.sources && e.sources[0] && e.sources[0].url) ? e.sources[0].url : "";
            if (!src) continue;
            var name;
            if (eps.length > 1) name = multiSeason ? ("S" + pad2(e.season) + "E" + pad2(e.episode)) : ("Tập " + e.episode);
            else name = "Xem Ngay";

            /* ⭐ v2: encode slug + season + ep vào episode.id để parseDetailResponse có thể refresh */
            var link = "https://example.com?url=" + encB64(src)
                     + "&slug=" + encodeURIComponent(_slug)
                     + "&season=" + (e.season || 1)
                     + "&ep=" + (e.episode || 1)
                     + "&server=1";
            epItems.push({ id: link, name: name, slug: "tap-" + (k + 1), ids: [{ name: "Server 1", url: link }] });
        }

        if (!epItems.length && m.hlsUrl) {
            var link2 = "https://example.com?url=" + encB64(m.hlsUrl)
                      + "&slug=" + encodeURIComponent(_slug)
                      + "&season=1&ep=1&server=1";
            epItems.push({ id: link2, name: "Xem Ngay", slug: "tap-1", ids: [{ name: "Server 1", url: link2 }] });
        }

        return JSON.stringify({
            id: url,
            title: title,
            originName: (m.title && m.title.en) || "",
            posterUrl: poster,
            backdropUrl: m.backdrop || poster,
            description: description,
            quality: m.maxRes || "",
            year: m.year ? String(m.year) : "",
            rating: m.score ? String(m.score) : "",
            status: m.epTotal ? (m.epTotal + " tập") : "",
            category: (m.genres && m.genres.vi) ? m.genres.vi.join(", ") : "",
            episode_current: "",
            servers: [{ name: "Server", episodes: epItems }],
            duration: "",
            casts: "",
            director: "",
            country: (m.country && m.country.vi) || "",
            lang: "",
            extra: ""
        });
    } catch (e) {
        _f4kWarn("parseMovieDetail[err]: " + e);
        return JSON.stringify({ id: url, title: "Lỗi", description: String(e), servers: [] });
    }
}

/* ⭐ parseDetailResponse v2 — SỬA: fetch lại API để lấy src mới */
function parseDetailResponse(html, url) {
    try {
        var mUrl = url.match(/[?&]url=([^&]+)/);
        if (!mUrl) throw new Error("Thiếu url");
        var hlsPath = decB64(mUrl[1]);
        if (!hlsPath) throw new Error("Decode rỗng");
        var stream = fix(hlsPath);
        _f4kLog("parseDetailResponse: orig src len=" + stream.length);

        /* ⭐ v2: Nếu có slug + season + ep → fetch lại API lấy src mới (tránh expire) */
        var mSlug = url.match(/[?&]slug=([^&]+)/);
        var mSeason = url.match(/[?&]season=([^&]+)/);
        var mEp = url.match(/[?&]ep=([^&]+)/);

        if (mSlug && mSlug[1]) {
            var slug = decodeURIComponent(mSlug[1]);
            var targetSeason = mSeason ? parseInt(mSeason[1]) || 1 : 1;
            var targetEp = mEp ? parseInt(mEp[1]) || 1 : 1;

            _f4kLog("refresh src từ API | slug=" + slug + " s=" + targetSeason + " e=" + targetEp);
            try {
                var freshJson = getJSON(API + "/title/" + slug);
                if (freshJson && freshJson.episodes) {
                    var found = false;
                    for (var i = 0; i < freshJson.episodes.length; i++) {
                        var fe = freshJson.episodes[i];
                        if ((fe.season || 1) === targetSeason && (fe.episode || 1) === targetEp) {
                            var freshSrc = (fe.sources && fe.sources[0] && fe.sources[0].url) ? fe.sources[0].url : "";
                            if (freshSrc) {
                                stream = fix(freshSrc);
                                _f4kLog("✅ fresh src len=" + stream.length);
                                found = true;
                            }
                            break;
                        }
                    }
                    if (!found) {
                        _f4kLog("⚠️ không match episode " + targetSeason + ":" + targetEp + " → dùng src cũ");
                    }
                }
            } catch(e) {
                _f4kWarn("refresh src err: " + e.message + " → dùng src cũ");
            }
        } else {
            _f4kLog("⚠️ URL cũ không có slug → dùng src cũ (có thể expire)");
        }

        var token = getTicket();
        _f4kLog("play " + stream.substring(0, 100) + " (ticket=" + (token ? "ok" : "none") + ")");

        return JSON.stringify({
            url: stream,
            mimeType: "application/x-mpegURL",
            isEmbed: false,
            headers: {
                "User-Agent": UA,
                "Referer": SITE + "/",
                "Origin": SITE,
                "X-F4K-PT": token || ""
            },
            subtitles: []
        });
    } catch (e) {
        _f4kWarn("parseDetailResponse[err]: " + e.message);
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}

// ---------- Search ----------
function getUrlSearch(keyword, filtersJson) {
    return API + "/search/suggest?q=" + encodeURIComponent(keyword);
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

// ---------- Stubs ----------
function getUrlCategories() { return "https://example.com"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }
function parseCategoriesResponse(apiResponseJson) {
    try { return JSON.stringify(buildMenu(getLISTmenu())); }
    catch (e) { _f4kWarn("parseCategoriesResponse[err]: " + e); return JSON.stringify([]); }
}
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

/* ⭐ buildMenu — giữ nguyên */
function buildMenu(menuStr, type) {
    var menuArray = JSON.parse(menuStr);
    let menulist = [];
    if (!menuArray || !Array.isArray(menuArray)) return menulist;
    var typeStr = type !== undefined ? String(type).trim() : undefined;
    for (var i = 0; i < menuArray.length; i++) {
        var item = menuArray[i];
        if (!item) continue;
        var link = item.link ? String(item.link).trim() : "";
        var name = item.name ? String(item.name).trim() : "";
        if (!link || !name) continue;
        var menuItem = {};
        if (typeStr === "false") {
            menuItem = { "slug": link, "title": name, "type": "Horizontal" };
        } else if (typeStr === "true") {
            menuItem = { "slug": link, "title": name, "type": "Grid" };
        } else {
            menuItem = { "slug": link, "name": name };
        }
        menulist.push(menuItem);
    }
    return menulist;
}
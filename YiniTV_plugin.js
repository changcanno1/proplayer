// =============================================================================
// YiniTV Plugin for VAAPP (vaxplayer) — v1.1.0  [NATIVE AES VERSION]
// Nguồn: https://yini.tv  (short drama / phim ngắn)
// API: https://mkjbdsapp.nws876.top/api
//
// ⭐ THAY ĐỔI SO VỚI v1.0.1:
//   - Bỏ toàn bộ AES-256-CBC pure JS (~150 dòng) → dùng AesDecrypt native.
//   - Gọi: AesDecrypt(AES_KEY, base64Combined) → plaintext JSON.
//   - Self-test khi load xác nhận native AesDecrypt khả dụng.
//   - Loại bỏ các hàm trùng lặp ở cuối file (getUrlCategories, buildMenu,
//     parseCategoriesResponse, getPrimaryCategories, getFilterConfig bị khai 2 lần).
// =============================================================================

var WEB = "https://yini.tv";
var API = "https://mkjbdsapp.nws876.top/api";
var AES_KEY = "7acb10e7608baa8800d9eadbb540dbe7726018d484cb73bb097e6c876e85a8d2";

var BASEURL = WEB;
var BASELINK = WEB;
var popup_html = "";

// =============================================================================
// LOG
// =============================================================================
function log(msg) {
    try {
        if (typeof console !== "undefined" && console.log) console.log("[yini] " + msg);
    } catch (e) {}
}

// =============================================================================
// MANIFEST
// =============================================================================
function getManifest() {
    try {
        return JSON.stringify({
            "id": "yini",
            "name": "YiniTV [SHORT]",
            "version": "1.1.1",
            "author": "alokillgtv",
            "info": "Nguồn phim ngắn (short drama) YiniTV.\nHỗ trợ thuyết minh/phụ đề đa ngôn ngữ.\nBản 1.1.0 dùng native AesDecrypt của App.",
            "baseUrl": WEB,
            "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/yini.png",
            "isEnabled": true,
            "isAdult": false,
            "adblock": false,
            "type": "shortfilm",
            "layoutType": "VERTICAL",
            "subtitleCat": false,
            "playerType": "exoplayer",
            "headers": {
                "Accept-Language": "vi",
                "Referer": WEB + "/",
                "Origin": WEB
            },
            "debug": true,
            "popup_html": popup_html
        });
    } catch (e) {
        return JSON.stringify({
            "id": "loiyini",
            "name": "Plugin YiniTV bị lỗi",
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
// AES-256-CBC — DÙNG NATIVE AesDecrypt(keyHex, cipherBase64)  ⭐ THAY ĐỔI CHÍNH
// =============================================================================
// Cipher Yini: [16 bytes IV][ciphertext] đóng gói trong 1 chuỗi base64.
// App đã expose sẵn AesDecrypt native → không cần pure JS nữa.
// Nếu cipher tách IV riêng: AesDecrypt(keyHex, ctB64, ivB64).

function yiniDecrypt(b64) {
    if (typeof AesDecrypt !== "function") {
        throw new Error("AesDecrypt native KHÔNG khả dụng trong engine QuickJS");
    }
    var t0 = Date.now();
    var plain = AesDecrypt(AES_KEY, b64);
    log("AesDecrypt native OK: " + (Date.now() - t0) + "ms, len=" + (plain ? String(plain).length : 0));
    return plain;
}

function decodeApi(body) {
    if (!body) return null;
    var j = null;
    try { j = JSON.parse(body); } catch (e) { return null; }
    if (j && typeof j._e === "string") {
        try {
            var text = yiniDecrypt(j._e);
            return JSON.parse(text);
        } catch (e) {
            log("decodeApi decrypt err: " + (e.message || e));
            return null;
        }
    }
    return j;
}

function withHeaders(url) {
    if (!url || url.indexOf("|") > -1) return url;
    return url + "|Accept-Language=vi&Referer=" + WEB + "/";
}

// =============================================================================
// MD5 (pure JS) — chỉ dùng cho signHls khi USE_SIGN=true
// =============================================================================
function yiniMd5(str) {
    function rl(n, c) { return (n << c) | (n >>> (32 - c)); }
    function au(x, y) { var l = (x & 0xFFFF) + (y & 0xFFFF); return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xFFFF); }
    function cmn(q, a, b, x, s, t) { return au(rl(au(au(a, q), au(x, t)), s), b); }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var ch = str.charCodeAt(i);
        if (ch < 128) bytes.push(ch);
        else if (ch < 2048) bytes.push(192 | (ch >> 6), 128 | (ch & 63));
        else bytes.push(224 | (ch >> 12), 128 | ((ch >> 6) & 63), 128 | (ch & 63));
    }
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (var k = 0; k < 4; k++) bytes.push((bitLen >>> (8 * k)) & 0xFF);
    for (k = 0; k < 4; k++) bytes.push(0);
    var x = [];
    for (i = 0; i < bytes.length; i += 4) x.push(bytes[i] | (bytes[i+1] << 8) | (bytes[i+2] << 16) | (bytes[i+3] << 24));
    var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (i = 0; i < x.length; i += 16) {
        var oa = a, ob = b, oc = c, od = d;
        a = ff(a,b,c,d,x[i+0],7,-680876936);  d = ff(d,a,b,c,x[i+1],12,-389564586);
        c = ff(c,d,a,b,x[i+2],17,606105819);  b = ff(b,c,d,a,x[i+3],22,-1044525330);
        a = ff(a,b,c,d,x[i+4],7,-176418897);  d = ff(d,a,b,c,x[i+5],12,1200080426);
        c = ff(c,d,a,b,x[i+6],17,-1473231341);b = ff(b,c,d,a,x[i+7],22,-45705983);
        a = ff(a,b,c,d,x[i+8],7,1770035416);  d = ff(d,a,b,c,x[i+9],12,-1958414417);
        c = ff(c,d,a,b,x[i+10],17,-42063);    b = ff(b,c,d,a,x[i+11],22,-1990404162);
        a = ff(a,b,c,d,x[i+12],7,1804603682); d = ff(d,a,b,c,x[i+13],12,-40341101);
        c = ff(c,d,a,b,x[i+14],17,-1502002290);b = ff(b,c,d,a,x[i+15],22,1236535329);
        a = gg(a,b,c,d,x[i+1],5,-165796510);  d = gg(d,a,b,c,x[i+6],9,-1069501632);
        c = gg(c,d,a,b,x[i+11],14,643717713); b = gg(b,c,d,a,x[i+0],20,-373897302);
        a = gg(a,b,c,d,x[i+5],5,-701558691);  d = gg(d,a,b,c,x[i+10],9,38016083);
        c = gg(c,d,a,b,x[i+15],14,-660478335);b = gg(b,c,d,a,x[i+4],20,-405537848);
        a = gg(a,b,c,d,x[i+9],5,568446438);   d = gg(d,a,b,c,x[i+14],9,-1019803690);
        c = gg(c,d,a,b,x[i+3],14,-187363961); b = gg(b,c,d,a,x[i+8],20,1163531501);
        a = gg(a,b,c,d,x[i+13],5,-1444681467);d = gg(d,a,b,c,x[i+2],9,-51403784);
        c = gg(c,d,a,b,x[i+7],14,1735328473); b = gg(b,c,d,a,x[i+12],20,-1926607734);
        a = hh(a,b,c,d,x[i+5],4,-378558);     d = hh(d,a,b,c,x[i+8],11,-2022574463);
        c = hh(c,d,a,b,x[i+11],16,1839030562);b = hh(b,c,d,a,x[i+14],23,-35309556);
        a = hh(a,b,c,d,x[i+1],4,-1530992060); d = hh(d,a,b,c,x[i+4],11,1272893353);
        c = hh(c,d,a,b,x[i+7],16,-155497632); b = hh(b,c,d,a,x[i+10],23,-1094730640);
        a = hh(a,b,c,d,x[i+13],4,681279174);  d = hh(d,a,b,c,x[i+0],11,-358537222);
        c = hh(c,d,a,b,x[i+3],16,-722521979); b = hh(b,c,d,a,x[i+6],23,76029189);
        a = hh(a,b,c,d,x[i+9],4,-640364487);  d = hh(d,a,b,c,x[i+12],11,-421815835);
        c = hh(c,d,a,b,x[i+15],16,530742520); b = hh(b,c,d,a,x[i+2],23,-995338651);
        a = ii(a,b,c,d,x[i+0],6,-198630844);  d = ii(d,a,b,c,x[i+7],10,1126891415);
        c = ii(c,d,a,b,x[i+14],15,-1416354905);b = ii(b,c,d,a,x[i+5],21,-57434055);
        a = ii(a,b,c,d,x[i+12],6,1700485571); d = ii(d,a,b,c,x[i+3],10,-1894986606);
        c = ii(c,d,a,b,x[i+10],15,-1051523);  b = ii(b,c,d,a,x[i+1],21,-2054922799);
        a = ii(a,b,c,d,x[i+8],6,1873313359);  d = ii(d,a,b,c,x[i+15],10,-30611744);
        c = ii(c,d,a,b,x[i+6],15,-1560198380);b = ii(b,c,d,a,x[i+13],21,1309151649);
        a = ii(a,b,c,d,x[i+4],6,-145523070);  d = ii(d,a,b,c,x[i+11],10,-1120210379);
        c = ii(c,d,a,b,x[i+2],15,718787259);  b = ii(b,c,d,a,x[i+9],21,-343485551);
        a = au(a, oa); b = au(b, ob); c = au(c, oc); d = au(d, od);
    }
    var hex = "0123456789abcdef";
    function w2h(n) {
        var s = "";
        for (var i = 0; i < 4; i++) s += hex.charAt((n >>> (i * 8 + 4)) & 0xF) + hex.charAt((n >>> (i * 8)) & 0xF);
        return s;
    }
    return w2h(a) + w2h(b) + w2h(c) + w2h(d);
}

// =============================================================================
// SITE SETTINGS + signHls
// =============================================================================
var SITE = null;
try {
    if (typeof httpRequest === "function") {
        var _sr = httpRequest(API + "/site-settings", {
            method: "GET",
            headers: { "Accept-Language": "vi", "Referer": WEB + "/" }
        });
        if (_sr && _sr.isSuccessful && _sr.body) SITE = JSON.parse(_sr.body);
    }
} catch (e) { log("site-settings err: " + e); }

var HLS_BASE = (SITE && SITE.hls_base_url) || "https://back_only.ffkm25.com/";
var HLS_ENC_BASE = (SITE && SITE.encrypt_hls_base_url) || "https://yini.jksngo2hosjsa.top/mm/videos/m3u8/";
var HLS_KEY = (SITE && SITE.encrypt_hls_key) || "D7hGKHnWThaECaQ3ji4XyAF3MfYKJ53M";
log("SETTINGS: " + (SITE ? "OK" : "FAIL(null)") + " | HLS_BASE=" + HLS_BASE + " | ENC_BASE=" + HLS_ENC_BASE + " | KEY=" + (HLS_KEY ? HLS_KEY.substring(0, 6) + "..." : "(none)"));

var WORKER = "https://yini.alokillgtv06.workers.dev";
var USE_SIGN = false;

function signHls(playUrl) {
    try {
        if (!playUrl) return playUrl;
        var base = String(HLS_BASE).replace(/\/+$/, "");
        var enc = String(HLS_ENC_BASE).replace(/\/+$/, "");
        var o = playUrl;
        if (base && playUrl.indexOf(base) === 0) o = enc + playUrl.substring(base.length);

        if (WORKER) {
            var rel = o;
            if (enc && o.indexOf(enc) === 0) {
                rel = o.substring(enc.length);
            } else {
                var wm = o.match(/^https?:\/\/[^\/]+(\/.*)$/i);
                rel = wm ? wm[1] : o;
            }
            rel = rel.replace(/^\/+/, "");
            return String(WORKER).replace(/\/+$/, "") + "/" + rel;
        }

        if (!USE_SIGN || !HLS_KEY) return o;

        var m = o.match(/^(https?:\/\/[^\/]+)(\/[^?#]*)?/i);
        var origin = m ? m[1] : "";
        var path = (m && m[2]) ? m[2] : "/";
        if (!origin) return o;
        var t = Math.floor(new Date().getTime() / 1000) + 7200;
        var secret = yiniMd5(String(HLS_KEY) + path + t);
        return origin + path + "?wsSecret=" + secret + "&wsTime=" + t;
    } catch (e) {
        log("signHls err: " + e);
        return playUrl;
    }
}

// =============================================================================
// HOME + MENU
// =============================================================================
function getHomeSections() {
    return JSON.stringify([
        { "slug": "all", "title": "Mới Nhất", "type": "Grid" }
    ]);
}

function getLISTmenu() {
    return `[
        {"link":"cat_16","name":"Truyện Sảng Nam"},
        {"link":"cat_14","name":"Tổng Tài Hào Môn"},
        {"link":"cat_15","name":"Nữ Chính Lội Ngược Dòng"},
        {"link":"cat_17","name":"Ngọt Sủng"},
        {"link":"cat_18","name":"Ngược Tình"},
        {"link":"cat_8","name":"Trùng Sinh"},
        {"link":"cat_19","name":"Phim Chuyển Thể Truyện Tranh"},
        {"link":"all","name":"Tất Cả"}
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
    try { return JSON.stringify(buildMenu(getLISTmenu())); }
    catch (e) { return JSON.stringify([]); }
}

function getFilterConfig() {
    try {
        return JSON.stringify({ category: buildMenu(getLISTmenu(), "filter") });
    } catch (e) { return JSON.stringify({ category: [] }); }
}

// =============================================================================
// URL GENERATION
// =============================================================================
function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) return slug;

        var page = 1;
        var path = slug || "all";
        if (filtersJson) {
            var fixed = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixed);
                page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) path = filters.category[0].slug || filters.category[0].value || path;
                    else if (typeof filters.category === "string") path = filters.category;
                }
            } catch (e) { log("getUrlList parse filters: " + e); }
        }

        var url = API + "/videos?page=" + page + "&per_page=24";
        if (/^cat_\d+$/.test(path)) {
            url += "&category_id=" + path.replace("cat_", "");
        } else if (/^tag_\d+$/.test(path)) {
            url += "&tag_id=" + path.replace("tag_", "");
        }
        return withHeaders(url);
    } catch (e) {
        log("getUrlList err: " + e);
        return withHeaders(API + "/videos?page=1&per_page=24");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixed = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try { page = parseInt(JSON.parse(fixed).page) || 1; } catch (e) {}
        }
        var url = API + "/videos?keyword=" + encodeURIComponent(keyword || "") + "&page=" + page + "&per_page=24";
        return withHeaders(url);
    } catch (e) {
        return withHeaders(API + "/videos?keyword=" + encodeURIComponent(keyword || ""));
    }
}

function getUrlDetail(slug) {
    try {
        if (!slug) return "";
        if (slug.indexOf("http") === 0) return withHeaders(slug);
        if (slug.indexOf("s/") === 0) return withHeaders(API + "/series/" + slug.substring(2));
        if (slug.indexOf("v/") === 0) return withHeaders(API + "/videos/" + slug.substring(2));
        if (/^\d+$/.test(slug)) return withHeaders(API + "/videos/" + slug);
        return withHeaders(API + "/videos/slug/" + encodeURIComponent(slug));
    } catch (e) {
        log("getUrlDetail err: " + e);
        return "";
    }
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// LIST PARSERS
// =============================================================================
function buildListItems(obj) {
    var items = [];
    if (!obj || !obj.data || !Array.isArray(obj.data)) return items;
    for (var i = 0; i < obj.data.length; i++) {
        var it = obj.data[i];
        if (!it) continue;
        var isSeries = it.type === "series";
        var id = (isSeries ? "s/" : "v/") + it.id;
        var title = it.title || it.name || "";
        var poster = it.cover_url || "";
        var episodeCurrent = isSeries ? (it.episode_count ? it.episode_count + " tập" : "") : "Full";
        items.push({
            "id": id,
            "title": title,
            "posterUrl": poster,
            "backdropUrl": poster,
            "quality": it.is_vip ? "VIP" : "HD",
            "episode_current": episodeCurrent,
            "lang": "Vietsub",
            "year": ""
        });
    }
    return items;
}

function parseListResponse(body, apiUrl) {
    log("parseListResponse: " + apiUrl);
    try {
        var obj = decodeApi(body);
        var items = buildListItems(obj);
        var currentPage = (obj && obj.current_page) || 1;
        var totalPages = (obj && obj.last_page) || 1;
        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "totalItems": (obj && obj.total) || items.length,
                "itemsPerPage": (obj && obj.per_page) || 24
            }
        });
    } catch (e) {
        log("parseListResponse err: " + e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(body, apiUrl) {
    return parseListResponse(body, apiUrl);
}

function parseCategoriesResponse() {
    try { return JSON.stringify(buildMenu(getLISTmenu(), "filter")); }
    catch (e) { return "[]"; }
}
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

// =============================================================================
// MOVIE DETAIL
// =============================================================================
function parseMovieDetail(body, apiUrl, datasend) {
    log("parseMovieDetail: " + apiUrl);
    try {
        var obj = decodeApi(body);
        if (!obj) throw new Error("Không giải mã được dữ liệu");

        var title = obj.title || obj.series_title || "";
        var poster = obj.cover_url || obj.series_cover_url || "";
        var description = obj.description || "";

        var catName = (obj.category && obj.category.name) ? obj.category.name : "";
        var tags = "";
        if (obj.tags && obj.tags.length) {
            var tn = [];
            for (var t = 0; t < obj.tags.length; t++) tn.push(obj.tags[t].name || obj.tags[t]);
            tags = tn.join(", ");
        }

        var servers = [];
        var episode_current = "Full";

        if (obj.episodes && obj.episodes.length) {
            var eps = [];
            for (var i = 0; i < obj.episodes.length; i++) {
                var ep = obj.episodes[i];
                eps.push({
                    "id": "v/" + ep.id,
                    "name": ep.title || ("Tập " + (ep.ep_no || (i + 1))),
                    "slug": ep.slug || ("ep-" + (ep.ep_no || (i + 1)))
                });
            }
            servers.push({ "name": "YiniTV", "episodes": eps });
            episode_current = obj.episodes.length + " tập";
        } else {
            servers.push({
                "name": "YiniTV",
                "episodes": [{
                    "id": "v/" + obj.id,
                    "name": "Xem Ngay",
                    "slug": obj.slug || ("v-" + obj.id)
                }]
            });
        }

        var result = {
            "id": obj.slug || String(obj.id || ""),
            "title": title,
            "originName": title,
            "posterUrl": poster,
            "backdropUrl": poster,
            "description": description,
            "quality": obj.is_vip ? "VIP" : "HD",
            "year": "",
            "rating": "",
            "status": "",
            "category": catName + (tags ? (catName ? " - " : "") + tags : ""),
            "episode_current": episode_current,
            "servers": servers,
            "duration": obj.duration ? Math.round(obj.duration / 60) + " phút" : "",
            "casts": "",
            "director": "",
            "country": "",
            "lang": "Vietsub"
        };
        return JSON.stringify(result);
    } catch (e) {
        log("parseMovieDetail err: " + e);
        return JSON.stringify({
            "id": apiUrl || "error",
            "title": "Lỗi YiniTV",
            "description": String(e),
            "servers": []
        });
    }
}

// =============================================================================
// STREAM / PLAY
// =============================================================================
function parseDetailResponse(body, apiUrl, datasend) {
    log("parseDetailResponse: " + apiUrl);
    try {
        var obj = decodeApi(body);
        if (!obj) throw new Error("Không giải mã được dữ liệu");

        log("play_url raw: " + obj.play_url);
        var stream = signHls(obj.play_url || "");
        log("play_url signed: " + stream);
        var isHls = (obj.play_type === "hls") || (stream.indexOf(".m3u8") > -1);
        var mime = isHls ? "application/x-mpegURL" : "video/mp4";

        var subs = [];
        if (obj.subtitles && obj.subtitles.length) {
            for (var i = 0; i < obj.subtitles.length; i++) {
                var s = obj.subtitles[i];
                if (s && s.url) {
                    subs.push({
                        "lang": s.label || s.language_code || ("Sub " + (i + 1)),
                        "url": s.url,
                        "mimeType": "text/vtt"
                    });
                }
            }
        }

        return JSON.stringify({
            "url": stream,
            "mimeType": mime,
            "isEmbed": false,
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": WEB + "/",
                "Origin": WEB,
                "Accept-Language": "vi"
            },
            "subtitles": subs
        });
    } catch (e) {
        log("parseDetailResponse err: " + e);
        return JSON.stringify({
            "url": "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            "mimeType": "video/mp4",
            "isEmbed": false,
            "headers": {},
            "subtitles": []
        });
    }
}

function parseEmbedResponse(body, url) {
    return parseDetailResponse(body, url);
}

// =============================================================================
// SELF-TEST: Kiểm tra AesDecrypt native khi load plugin
// =============================================================================
(function yiniSelfTest() {
    var hasNative = (typeof AesDecrypt === "function");
    log("===================================================");
    log("SELF-TEST | AesDecrypt native: " + (hasNative ? "✅ CÓ" : "❌ KHÔNG"));
    if (hasNative && typeof AesDecrypt.length === "number") {
        log("SELF-TEST | AesDecrypt.length (số tham số): " + AesDecrypt.length);
    }
    log("===================================================");
})();

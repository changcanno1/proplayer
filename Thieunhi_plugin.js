// =============================================================================
// Thiếu Nhi [ANIME] — Plugin VAAPP / VAX Player
// Kho thiếu nhi FPT Play (/trang/children), token VIP qua Worker.
// =============================================================================

// =============================================================================
// TOKEN VIP qua Worker (Cloudflare) — token lưu ở Worker KV, userscript tự cập nhật.
// QuickJS không có storage bền nên KHÔNG tự lưu token; mỗi lần cần thì hỏi Worker.
// =============================================================================
var WORKER_URL = "https://tokenvip.alokillgtv04.workers.dev"; // Worker lưu token
var WORKER_KEY = "deo_co_gi_de_coi";                          // header X-VAX-YB

var API_HOST   = "https://api.fptplay.net";
var API_VER    = "v7.1_w";           // "v7.1_dapp" nếu chạy trong Tauri app
var API_BASE   = API_HOST + "/api/" + API_VER;
var SIGN_SECRET = "6ea6d2a4e2d3a4bd5e275401aa086d";
var WEB        = "https://fptplay.vn";
var ANIME_PAGE_ID = "6a28e2611bd34e6814d33f44"; // page "children" (Trang/Thiếu nhi)
var DEVICE = "web(version:19.3.0)";
var popup_html = "";
var UA = "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

// Token đang dùng trong RAM (mỗi phiên). Không lưu bền — lấy lại từ Worker khi cần.
var AUTH_TOKEN = "";
// Đánh dấu token đã được kiểm tra sống trong phiên này chưa
var _tokenChecked = false;

function log(m) { try { console.log("[thieunhi] " + m); } catch (e) {} }

try {
    console.log("[thieunhi] ===== FILE ĐÃ NẠP & THỰC THI (top-level) =====");
    console.log("[thieunhi] typeof httpRequest=" + (typeof httpRequest));
} catch (e) {}

// =============================================================================
// TOKEN WORKER
// =============================================================================
// Gọi Worker lấy token. Trả { ok, token } | { ok:false, reason }
function fetchTokenFromWorker() {
    var u = WORKER_URL.replace(/\/+$/, "") + "/token";
    var res = httpRequest(u, {
        method: "GET",
        headers: { "Accept": "application/json", "X-VAX-YB": WORKER_KEY }
    });
    try {
        var j = JSON.parse((res && res.body) || "{}");
        if (j && j.ok && j.token) return { ok: true, token: String(j.token) };
        return { ok: false, reason: j.error || "no_token" };
    } catch (e) {
        return { ok: false, reason: "parse:" + e };
    }
}

// Lấy token (1 lần/phiên). Có cache RAM.
function ensureToken() {
    if (AUTH_TOKEN) return AUTH_TOKEN;
    var r = fetchTokenFromWorker();
    if (r.ok) {
        AUTH_TOKEN = r.token;
        log("Lấy token từ Worker OK len=" + AUTH_TOKEN.length);
        return AUTH_TOKEN;
    }
    log("Worker không có token: " + r.reason);
    return "";
}

// Toast (native có thể có toast(); web có UI.toast). Fallback console.
function vaxToast(msg, ms) {
    try {
        if (typeof toast === "function") { toast(msg, ms || 3000); return; }
    } catch (e) {}
    try {
        if (typeof window !== "undefined" && window.VaxMovieUI && window.VaxMovieUI.UI && window.VaxMovieUI.UI.toast) {
            window.VaxMovieUI.UI.toast(msg, ms || 3000); return;
        }
    } catch (e) {}
    log("[TOAST] " + msg);
}
// =============================================================================
// PURE-JS MD5 (portable: chạy được cả QuickJS native lẫn WebView)
// =============================================================================
function md5(str) {
    function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }

    function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }
    function md5blk(s) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) +
                (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }
    function rhex(n) {
        var s = "", j;
        for (j = 0; j < 4; j++) s += ("0" + ((n >> (j * 8)) & 0xFF).toString(16)).slice(-2);
        return s;
    }
    var i, n = str.length, state = [1732584193, -271733879, -1732584194, 271733878], tail;
    for (i = 64; i <= n; i += 64) md5cycle(state, md5blk(str.substring(i - 64, i)));
    str = str.substring(i - 64);
    tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < str.length; i++) tail[i >> 2] |= str.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) { md5cycle(state, tail); tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state.map(rhex).join("");
}

function md5Bytes(str) {
    var hex = md5(str), bytes = [];
    for (var i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
    return bytes;
}

function base64UrlFromBytes(bytes) {
    var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    var out = "", i;
    for (i = 0; i < bytes.length; i += 3) {
        var b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
        out += B64.charAt(b0 >> 2);
        out += B64.charAt(((b0 & 3) << 4) | ((b1 === undefined ? 0 : b1) >> 4));
        if (b1 === undefined) break;
        out += B64.charAt(((b1 & 15) << 2) | ((b2 === undefined ? 0 : b2) >> 6));
        if (b2 === undefined) break;
        out += B64.charAt(b2 & 63);
    }
    return out;
}

// =============================================================================
// HTTP HELPERS
// =============================================================================
function hh3Headers(extra) {
    var h = {
        "User-Agent": UA,
        "Referer": WEB + "/",
        "Origin": WEB,
        "Accept": "application/json, text/plain, */*"
    };
    if (AUTH_TOKEN) h["Authorization"] = "Bearer " + AUTH_TOKEN;
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
}

// Tạo URL API ĐÃ KÝ (st/e/device/drm/version). Trả chuỗi URL đầy đủ.
// Native sẽ tự fetch URL này; plugin cũng dùng lại cho apiGet.
function buildUrl(path, extraParams) {
    var T = path.charAt(0) === "/" ? path.substring(1) : path;
    if (T.indexOf("?") > -1) T = T.split("?")[0];
    var e = Math.floor(Date.now() / 1000) + 3600;
    var w = "/api/" + API_VER + "/";
    var signStr = SIGN_SECRET + e + w + T;
    var st = base64UrlFromBytes(md5Bytes(signStr));

    var params = { st: st, e: e, device: DEVICE, drm: 1, version: API_VER };
    if (extraParams) for (var k in extraParams) params[k] = extraParams[k];

    var qs = [];
    for (var key in params) {
        if (params[key] === undefined || params[key] === null) continue;
        qs.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
    }
    var sep = path.indexOf("?") > -1 ? "&" : "?";
    return API_BASE + "/" + path + sep + qs.join("&");
}

// Gọi API có ký st/e (dùng httpRequest trực tiếp).
function apiGet(path, extraParams) {
    var url = buildUrl(path, extraParams);
    try {
        if (typeof httpRequest !== "function") {
            console.log("[thieunhi] ❌ httpRequest KHÔNG phải function (typeof=" + (typeof httpRequest) + ")");
            return { isSuccessful: false, body: "", status: 0 };
        }
        var _hdrs = hh3Headers();
        try { console.log("[thieunhi] > httpRequest " + url.slice(0, 100) + " | Auth=" + (_hdrs.Authorization ? (_hdrs.Authorization.slice(0, 20) + "...") : "(KHÔNG CÓ)")); } catch (e0) {}
        var res = httpRequest(url, { method: "GET", headers: _hdrs });
        try {
            console.log("[thieunhi] < status=" + (res ? res.status : "null") +
                " ok=" + (res ? res.isSuccessful : "null") +
                " len=" + (res && res.body ? String(res.body).length : 0) +
                " head=" + (res && res.body ? String(res.body).slice(0, 80).replace(/\n/g, " ") : ""));
        } catch (e2) {}
        return res;
    } catch (e) {
        console.log("[thieunhi] ❌ httpRequest THROW: " + e);
        return { isSuccessful: false, body: "", status: 0 };
    }
}

function parseJson(res, allowError) {
    try {
        if (!res || !res.body) return null;
        // Mặc định chỉ nhận 2xx; allowError=true cho phép đọc cả 401/403 (trailer nằm trong body)
        if (!res.isSuccessful && !allowError) return null;
        var b = String(res.body).replace(/^\uFEFF/, "").trim();
        return JSON.parse(b);
    } catch (e) { log("parseJson err: " + e); return null; }
}

// =============================================================================
// MANIFEST
// =============================================================================
function getManifest() {
    try { console.log("[thieunhi] >>> getManifest() được gọi"); } catch (e) {}
    try {
        return JSON.stringify({
            "id": "thieunhi",
            "name": "Thiếu Nhi [ANIME]",
            "version": "1.0.0",
            "author": "alokillgtv",
            "info": "Kho phim thiếu nhi: hoạt hình, ca nhạc, kể chuyện, học tiếng Anh cho bé. Server nhanh, mượt.",
            BASEURL: WEB,
            "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/thieunhi.png",
            "isEnabled": true,
            "isAdult": false,
            "adblock": false,
            "type": "ANIME",
            "subtitleCat": false,
            "playerType": "exoplayer",
            "headers": { "Referer": WEB + "/", "Origin": WEB },
            "debug": true
        });
    } catch (e) {
        return JSON.stringify({
            "id": "thieunhi", "name": "Thiếu Nhi bị lỗi", "version": "1.0",
            "info": "Lỗi khởi tạo: " + e, "baseUrl": WEB, "isEnabled": true,
            "type": "ANIME", "playerType": "embedtoexoplay"
        });
    }
}

// =============================================================================
// HOME SECTIONS
// =============================================================================
// Các block "chủ đạo" cho trang chủ (slug = block id, data_type truyền kèm qua |data:)
// Tổng kho (block lớn nhất ~256 phim) — render CUỐI CÙNG dạng Grid
/* Block lớn nhất (~871 phim) → Grid "Tổng kho" đặt CUỐI */
var TOTAL_BLOCK = { id: "575e33f817dc135ea10d1c14", type: "highlight", title: "📚 Tổng Kho Thiếu Nhi" };

var HOME_BLOCKS = [
    { id: "top10trending_children", type: "recommend", title: "🏆 Top 10 Thiếu Nhi" },
    { id: "6a1c6ee7fd4707bf73fcc8ac", type: "highlight", title: "🎬 Bé Mê Phim" },
    { id: "69d8f0ed90ed5a5310cc4482", type: "highlight", title: "🐻 Gấu Boonie" },
    { id: "676e58370c81ab0660e2064c", type: "highlight", title: "🌈 Tuổi Thơ Muôn Màu" },
    { id: "635a08c02089bd029a1fafcf", type: "highlight", title: "🎞️ Phim" },
    { id: "635a08d52089bd02b21fafcc", type: "highlight", title: "🎵 Ca Nhạc" },
    { id: "635a08e72089bd02b41fafcc", type: "highlight", title: "📖 Kể Chuyện" },
    { id: "635a08f82089bd02a91fafd6", type: "highlight", title: "🔤 Học Tiếng Anh" },
    { id: "635a090b2089bd02b21fafce", type: "highlight", title: "💡 Học Điều Hay" },
    { id: "68ca85d48c1515e237b0c6fb", type: "highlight", title: "🐷 Chú Heo Điệp Viên" },
    { id: "63edc654c570c304d54aae79", type: "highlight", title: "🦊 Pinkfong" },
    { id: "63edc528c570c304d54aae6d", type: "highlight", title: "🍉 Thế Giới Âm Nhạc" }
];

function getHomeSections() {
    try { console.log("[thieunhi] >>> getHomeSections() được gọi"); } catch (e) {}
    var arr = [];
    // Các mục thể loại/nổi bật dạng Horizontal
    for (var i = 0; i < HOME_BLOCKS.length; i++) {
        var b = HOME_BLOCKS[i];
        arr.push({ slug: "blk:" + b.id + "|data:" + b.type, title: b.title, type: "Horizontal", path: "children" });
    }
    // Tổng kho (nhiều phim nhất) đặt CUỐI, dạng Grid để duyệt toàn bộ
    arr.push({ slug: "blk:" + TOTAL_BLOCK.id + "|data:" + TOTAL_BLOCK.type, title: TOTAL_BLOCK.title, type: "Grid", path: "children" });
    return JSON.stringify(arr);
}

// Thể loại thiếu nhi (từ quick_tabs trang children; fallback hardcode nếu lỗi)
var ANIME_GENRES = [
    { name: "Phim", id: "54fe562817dc136161a0cefc" },
    { name: "Ca nhạc", id: "54fe551717dc136164a0cf04" },
    { name: "Kể chuyện", id: "597875825583206af4bbe7e7" },
    { name: "Học tiếng Anh", id: "62f247072089bd003cea67b5" },
    { name: "Học điều hay", id: "54fe55a917dc136162a0cf65" }
];

function getPrimaryCategories() {
    var arr = [{ name: "Tổng Hợp Thiếu Nhi", slug: "home" }];
    // Thể loại (category_vod, phân trang đầy đủ)
    for (var i = 0; i < ANIME_GENRES.length; i++) {
        arr.push({ name: "📁 " + ANIME_GENRES[i].name, slug: "cat:" + ANIME_GENRES[i].id });
    }
    // Các block nổi bật
    for (var j = 0; j < HOME_BLOCKS.length; j++) {
        arr.push({ name: HOME_BLOCKS[j].title, slug: "blk:" + HOME_BLOCKS[j].id + "|data:" + HOME_BLOCKS[j].type });
    }
    return JSON.stringify(arr);
}

// URL để lấy danh sách thể loại (native tự fetch rồi gọi parseCategoriesResponse)
function getUrlCategories() {
    return buildUrl("navigation/page/children");
}

function parseCategoriesResponse(html, apiUrl) {
    try {
        // ưu tiên body native, không có thì tự fetch
        var data = null;
        if (html && String(html).length > 2) {
            try { data = JSON.parse(String(html).replace(/^\uFEFF/, "")); } catch (e) { data = null; }
        }
        if (!data || !data.data) data = parseJson(apiGet("navigation/page/children"));
        var tabs = (data && data.data && data.data.quick_tabs) || [];
        var out = [];
        for (var i = 0; i < tabs.length; i++) {
            var t = tabs[i];
            if (!t || t.type !== "block" || t.data_type !== "category_vod" || !t.target_id) continue;
            out.push({ name: t.title || "?", slug: "cat:" + t.target_id });
        }
        if (!out.length) {
            // fallback hardcode
            for (var k = 0; k < ANIME_GENRES.length; k++) out.push({ name: ANIME_GENRES[k].name, slug: "cat:" + ANIME_GENRES[k].id });
        }
        return JSON.stringify(out);
    } catch (e) { log("parseCategoriesResponse err: " + e); return "[]"; }
}


// =============================================================================
// URL GENERATION
// =============================================================================
// Bóc thông tin từ slug: "home" | "blk:<id>|data:<type>"
function parseSlug(slug) {
    slug = String(slug || "");
    if (slug.indexOf("cat:") === 0) {
        return { kind: "cat", id: slug.substring(4) };
    }
    if (slug.indexOf("blk:") === 0) {
        var s = slug.substring(4);
        var type = "highlight";
        var p = s.split("|");
        var id = p[0];
        if (p[1]) type = p[1].replace(/^data:/, "");
        return { kind: "block", id: id, type: type };
    }
    return { kind: "home" };
}

function getUrlList(slug, filtersJson) {
    try { console.log("[thieunhi] >>> getUrlList() slug=" + slug + " filters=" + filtersJson); } catch (e) {}
    var f = {};
    try { f = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = parseInt(f.page, 10) || 1;
    var info = parseSlug(slug);

    if (info.kind === "cat") {
        var uc = buildUrl("navigation/block/category_vod/" + info.id, {
            page_id: ANIME_PAGE_ID, page: page, page_size: 50, block_type: "category_vod"
        });
        try { console.log("[thieunhi] getUrlList category=" + info.id + " page=" + page); } catch (e) {}
        return uc;
    }
    if (info.kind === "block") {
        // Trả URL ĐÃ KÝ của block, phân trang bằng param page
        var u = buildUrl("navigation/block/" + info.type + "/" + info.id, {
            page_id: ANIME_PAGE_ID,
            page: page,
            page_size: 50,
            block_type: info.type
        });
        try { console.log("[thieunhi] getUrlList block=" + info.id + " page=" + page); } catch (e) {}
        return u;
    }
    // home: trang tổng hợp (chỉ page 1, không phân trang sâu)
    var uh = buildUrl("navigation/page/children");
    return uh;
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    try { page = parseInt(JSON.parse(filtersJson || "{}").page, 10) || 1; } catch (e) {}
    // URL ảo kiểu vaxtv: native fetch được (200) rồi gọi parser; keyword nhồi trong query
    var kw = encodeURIComponent(keyword || "");
    return "https://example.com/?q=" + kw + "&page=" + page + "|data:k=" + kw + "&p=" + page;
}

function getUrlDetail(slug) {
    try { console.log("[thieunhi] >>> getUrlDetail() slug=" + slug); } catch (e) {}
    var vid = extractVodId(slug);
    return buildUrl("content/vod/" + vid);
}

// =============================================================================
// PARSERS — LIST
// =============================================================================
function mapItemToMovie(it) {
    var img = it.image || {};
    var poster = img.portrait || img.portrait_mobile || img.landscape || "";
    var backdrop = img.landscape || img.landscape_title || poster;
    var detail = it.detail || {};
    return {
        id: it.id,
        title: it.title || "",
        posterUrl: poster,
        backdropUrl: backdrop,
        description: detail.short_description || detail.description || "",
        year: "",
        quality: it.is_vip ? "VIP" : "",
        episode_current: "",
        lang: "",
        isAdult: false
    };
}

// Lấy items của 1 block
function fetchBlockItems(block, pageId, pageIndex, pageSize) {
    var bt = block.data_type || block.block_type || "highlight";
    var bid = block.id;
    var ep = { page_id: pageId, page_index: pageIndex || 1, page_size: pageSize || 12 };
    var data = parseJson(apiGet("navigation/block/" + bt + "/" + bid, ep));
    if (data && data.data && data.data.items) return data.data.items;
    // fallback thử block_type khác
    if (bt !== "highlight") {
        data = parseJson(apiGet("navigation/block/highlight/" + bid, ep));
        if (data && data.data && data.data.items) return data.data.items;
    }
    return [];
}


// Nếu url là search ảo của ta → trả {kw,page}, ngược lại null
function parseSearchUrl(url) {
    var u = String(url || "");
    if (u.indexOf("example.com") === -1) return null;
    var kw = "", page = 1;
    var km = u.match(/[?&]q=([^&|]+)/); if (km) kw = decodeURIComponent(km[1]);
    var pm = u.match(/[?&]page=(\d+)/); if (pm) page = parseInt(pm[1], 10) || 1;
    var dm = u.match(/\|data:k=([^&|]*)/); if (dm && !kw) kw = decodeURIComponent(dm[1]);
    var dpm = u.match(/[&|]p=(\d+)/); if (dpm && pm === 1) page = parseInt(dpm[1], 10) || 1;
    if (!kw) return null;
    return { kw: kw, page: page };
}

// Gọi mnemosyne POST search thật, trả movie items
// =============================================================================
// BLACKLIST: phim lỗi / DRM lưu trên Worker, ẩn khỏi list cho mọi người
// =============================================================================
var _blacklist = null;        // {} id->true (cache phiên)
var _blacklistTs = 0;
var _blacklistReported = {};  // đã báo trong phiên (tránh spam)

function getBlacklist() {
    // cache 5 phút
    if (_blacklist && (Date.now() - _blacklistTs) < 5 * 60 * 1000) return _blacklist;
    var map = {};
    try {
        var u = WORKER_URL.replace(/\/+$/, "") + "/blacklist";
        var res = httpRequest(u, { method: "GET", headers: { "Accept": "application/json", "X-VAX-YB": WORKER_KEY } });
        var j = JSON.parse((res && res.body) || "{}");
        if (j && j.ok && j.ids) {
            for (var i = 0; i < j.ids.length; i++) {
                var it = j.ids[i];
                if (it && it.id) map[String(it.id)] = true;
            }
        }
    } catch (e) { log("getBlacklist err: " + e); }
    _blacklist = map; _blacklistTs = Date.now();
    log("blacklist loaded: " + Object.keys(map).length + " phim");
    return map;
}

function isBlacklisted(id) {
    try { return !!getBlacklist()[String(id)]; } catch (e) { return false; }
}

// Báo 1 phim vào blacklist (chỉ 1 lần/phiên)
function reportBlacklist(id, reason) {
    try {
        id = String(id || "");
        if (!id || _blacklistReported[id]) return;
        _blacklistReported[id] = true;
        if (_blacklist) _blacklist[id] = true;   // cập nhật cache local
        var u = WORKER_URL.replace(/\/+$/, "") + "/blacklist";
        httpRequest(u, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-VAX-YB": WORKER_KEY },
            body: JSON.stringify({ ids: [id], reason: reason || "unknown" })
        });
        log("reportBlacklist: " + id + " (" + (reason || "") + ")");
    } catch (e) { log("reportBlacklist err: " + e); }
}

function doSearch(kw, page) {
    var body = {
        block_id: "search2", query_str: kw, page_index: page || 1, page_size: 31,
        page_id: "search", block_type: "horizontal_slider",
        watching_version: "v1", handle_event: 1, search_version: "v2", type_search: "manual_search"
    };
    var url = buildUrl("mnemosyne/v1/search");
    var res = httpRequest(url, { method: "POST", headers: hh3Headers({ "Content-Type": "application/json" }), body: JSON.stringify(body) });
    var data = parseJson(res, true);
    var list = (data && (data.data || data.result || data.items)) || [];
    // structure_id của các nhóm thiếu nhi (Phim/Ca nhạc/Kể chuyện/Học TA/Học điều hay)
    var KID_STRUCTS = {
        "54fe562817dc136161a0cefc": 1, "54fe551717dc136164a0cf04": 1,
        "597875825583206af4bbe7e7": 1, "62f247072089bd003cea67b5": 1,
        "54fe55a917dc136162a0cf65": 1
    };
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
        var it = list[i];
        if (!it || !it.id) continue;
        if (it.type && it.type !== "vod") continue;
        var isKid = (it.category === "Thiếu nhi");
        if (!isKid && Array.isArray(it.structure_id)) {
            for (var si = 0; si < it.structure_id.length; si++) {
                if (KID_STRUCTS[it.structure_id[si]]) { isKid = true; break; }
            }
        }
        if (!isKid) continue;
        filtered.push(it);
    }
    return { movies: mapItems(filtered), rawCount: filtered.length, totalCount: list.length };
}
function parseListResponse(html, apiUrl) {
    try { console.log("[thieunhi] >>> parseListResponse() html.len=" + (html ? String(html).length : 0) + " url=" + apiUrl); } catch (e) {}
    // ⭐ Nếu là search ảo (getUrlSearch) → POST mnemosyne
    try {
        var sq = parseSearchUrl(apiUrl);
        if (sq) {
            var sr = doSearch(sq.kw, sq.page);
            var tp = (sr.rawCount >= 20) ? (sq.page + 1) : sq.page;
            log("parseList(search) kw=" + sq.kw + " n=" + sr.movies.length);
            return JSON.stringify({ items: sr.movies, pagination: { currentPage: sq.page, totalPages: tp } });
        }
    } catch (eS) { log("parseList search err: " + eS); }
    try {
        var info = parseSlugFromUrl(apiUrl);   // đoán home hay block từ URL đã fetch
        var page = 1;
        try { page = parseInt((String(apiUrl).match(/[?&]page=(\d+)/) || [])[1], 10) || 1; } catch (e) {}

        // Parse body native đưa vào
        var data = null;
        if (html && String(html).length > 2) {
            try { data = JSON.parse(String(html).replace(/^\uFEFF/, "").trim()); } catch (pe) { data = null; }
        }

        // ── Trường hợp BLOCK: body là {data:{items:[...]}} ──
        if (info.kind === "block" || info.kind === "cat" || (data && data.data && Array.isArray(data.data.items) && !data.data.blocks)) {
            if (!data || !data.data) {
                // tự fetch lại nếu native không đưa body
                data = parseJson(apiGet(blockPathFromUrl(apiUrl) || ("navigation/block/highlight/" + info.id), listParamsFromUrl(apiUrl)));
            }
            var items = (data && data.data && data.data.items) || [];
            var movies = mapItems(items);
            // Phân trang: nếu trang này có đủ item (>=20) thì còn trang sau
            var totalPages = (items.length >= 50) ? (page + 1) : page;
            log("parseList block items=" + movies.length + " page=" + page + " totalPages~" + totalPages);
            return JSON.stringify({
                items: movies,
                pagination: { currentPage: page, totalPages: totalPages }
            });
        }

        // ── Trường hợp HOME: body là navigation/page với blocks ──
        if (!data || !data.data || !data.data.blocks) {
            log("parseList home: body rỗng/lỗi → tự fetch");
            data = parseJson(apiGet("navigation/page/children"));
        }
        if (!data || !data.data) {
            return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
        }
        var pid = data.data.id || ANIME_PAGE_ID;
        var blocks = data.data.blocks || [];
        var seen = {}, all = [];
        var bl = getBlacklist();
        var maxBlocks = Math.min(blocks.length, 10);
        for (var b = 0; b < maxBlocks; b++) {
            var blk = blocks[b];
            if (!blk || !blk.id) continue;
            if (blk.data_type === "watching") continue; // bỏ "Đang xem"
            var its = fetchBlockItems(blk, pid, 1, 12);
            for (var i = 0; i < its.length; i++) {
                var it = its[i];
                if (!it || !it.id || seen[it.id]) continue;
                if (it.type && it.type !== "vod") continue;
                if (bl[String(it.id)]) continue;   // blacklist
                seen[it.id] = 1;
                var mv = mapItemToMovie(it);
                mv.blockTitle = blk.title || "";
                all.push(mv);
            }
        }
        log("parseList home blocks=" + blocks.length + " movies=" + all.length);
        return JSON.stringify({ items: all, pagination: { currentPage: 1, totalPages: 1 } });
    } catch (e) {
        log("parseListResponse err: " + e);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

// Map mảng item -> movie
function mapItems(items) {
    var out = [];
    if (!items) return out;
    var bl = getBlacklist();   // ẩn phim lỗi/DRM đã báo trước đó
    for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it || !it.id) continue;
        if (it.type && it.type !== "vod") continue;
        if (bl[String(it.id)]) continue;   // bị blacklist → bỏ
        out.push(mapItemToMovie(it));
    }
    return out;
}

// Đoán kind (home/block) từ URL đã fetch: có "/navigation/block/" => block
function parseSlugFromUrl(url) {
    var u = String(url || "");
    var m = u.match(/\/navigation\/block\/([^\/]+)\/([^?]+)/);
    if (m) return { kind: m[1] === "category_vod" ? "cat" : "block", type: m[1], id: m[2] };
    return { kind: "home" };
}
function blockPathFromUrl(url) {
    var u = String(url || "");
    var m = u.match(/(navigation\/block\/[^?]+)/);
    return m ? m[1] : null;
}
function listParamsFromUrl(url) {
    var u = String(url || "");
    var p = { page_id: ANIME_PAGE_ID };
    var pg = u.match(/[?&]page=(\d+)/); if (pg) p.page = parseInt(pg[1], 10);
    var ps = u.match(/[?&]page_size=(\d+)/); if (ps) p.page_size = parseInt(ps[1], 10);
    var bt = u.match(/[?&]block_type=([^&]+)/); if (bt) p.block_type = decodeURIComponent(bt[1]);
    return p;
}

function parseSearchResponse(html, apiUrl) {
    try {
        var sq = parseSearchUrl(apiUrl);
        var kw = sq ? sq.kw : "", page = sq ? sq.page : 1;
        if (!kw) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
        var sr = doSearch(kw, page);
        var tp = (sr.rawCount >= 20) ? (page + 1) : page;
        log("parseSearch: kw=" + kw + " page=" + page + " n=" + sr.movies.length);
        return JSON.stringify({ items: sr.movies, pagination: { currentPage: page, totalPages: tp } });
    } catch (e) {
        log("parseSearchResponse err: " + e);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

// =============================================================================
// PARSERS — DETAIL
// =============================================================================
// Chuẩn hoá 1 trường có thể là string | mảng string | mảng object -> "a, b, c"
function joinField(v) {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) {
        var out = [];
        for (var i = 0; i < v.length; i++) {
            var x = v[i];
            if (x == null) continue;
            out.push(typeof x === "string" ? x : (x.name || x.title || ""));
        }
        return out.join(", ");
    }
    if (typeof v === "object") return v.name || v.title || "";
    return String(v);
}

function extractVodId(apiUrl) {
    if (!apiUrl) return "";
    var s = String(apiUrl);
    var i = s.indexOf("/content/vod/");
    if (i > -1) s = s.substring(i + "/content/vod/".length);
    if (s.indexOf("?") > -1) s = s.split("?")[0];
    if (s.indexOf("|") > -1) s = s.split("|")[0];
    return s.replace(/\/+$/, "");
}


// Kiểm tra 1 tập có phát được không (gọi stream API + thử tải m3u8 tập đó).
// Trả true nếu OK, false nếu 404/chỉ-DRM/không có link.
function isDrmUrl(u){u=String(u||"");return /-drm-|\/dash_drm\/|\/hls_drm\/|_drm\//i.test(u);}

function checkEpisodeAlive(vodId, epId) {
    // Trả: "ok" | "drm" | "dead" (link chết thật 404/410) | "unknown" (token hết hạn/lỗi mạng → KHÔNG blacklist)
    try {
        var res = apiGet("stream/vod/" + vodId + "/" + (epId != null ? epId : "0") + "/adaptive_bitrate?stream_profile=1");
        var status = (res && res.status) ? Number(res.status) : 0;
        var j = parseJson(res, true);
        var d = (j && j.data && typeof j.data === "object") ? j.data : j;

        // ⚠️ Không có data hoặc lỗi KHÁC 200 → không xác định được (token hết hạn/lỗi mạng), KHÔNG kết luận chết
        if (!d) {
            // chỉ khi stream API chính nó trả 404/410 mới coi chết
            if (status === 404 || status === 410) return "dead";
            return "unknown";
        }

        // Không login / token hết hạn → KHÔNG blacklist (lỗi tạm thời)
        if ((j && j.logged_in_fplay === 0) || (d && d.is_logged_in === 0)) return "unknown";

        // Chỉ có DRM → bản quyền (report drm)
        var noDrm = d.url || d.url_hls_h265 || d.url_hls_av1 || d.url_dash_no_drm || d.url_dash_h265 || d.url_dash_av1 || "";
        if (!noDrm) {
            var onlyDrm = d.url_hls_drm || d.url_dash_drm || d.url_hls_drm_h265 || d.url_dash_drm_h265;
            if (onlyDrm) return "drm";
            return "unknown";   // không có link nhưng cũng không rõ → không blacklist
        }

        // Thử tải m3u8/mpd. CHỈ coi chết khi 404/410. Lỗi khác (timeout/403/mạng) → unknown.
        var u = String(noDrm);
        var mime = /\.mpd(\?|$)/i.test(u) ? "application/dash+xml" : "application/x-mpegURL";
        var r2 = httpRequest(u, { method: "GET", headers: hh3Headers() });
        var st2 = (r2 && r2.status) ? Number(r2.status) : 0;
        var body = (r2 && r2.body) ? String(r2.body) : "";
        if (st2 === 404 || st2 === 410) {
            log("checkEpisodeAlive: link chết (status " + st2 + ")");
            return "dead";
        }
        if (!r2 || !r2.isSuccessful) {
            log("checkEpisodeAlive: không tải được m3u8 (status " + st2 + ") → unknown (KHÔNG blacklist)");
            return "unknown";
        }
        if (mime === "application/x-mpegURL" && body.indexOf("#EXTM3U") === -1) {
            log("checkEpisodeAlive: m3u8 không hợp lệ → unknown");
            return "unknown";
        }
        return "ok";
    } catch (e) { log("checkEpisodeAlive err: " + e); return "unknown"; }
}

function parseMovieDetail(html, apiUrl) {
    try { console.log("[thieunhi] >>> parseMovieDetail() url=" + apiUrl); } catch (e) {}
    try {
        var vid = extractVodId(apiUrl);
        var data = null;
        if (html && String(html).length > 2) {
            try { data = JSON.parse(String(html).replace(/^\uFEFF/, "").trim()); } catch (pe) { data = null; }
        }
        if (!data || !data.data) {
            log("parseMovieDetail: body native rỗng/lỗi → tự fetch");
            data = parseJson(apiGet("content/vod/" + vid));
        }
        if (!data || !data.data) {
            return JSON.stringify({ id: vid, title: "Lỗi tải chi tiết", servers: [] });
        }
        var d = data.data;
        var img = d.image || {};
        var poster = img.portrait || img.portrait_mobile || img.landscape || "";
        var backdrop = img.landscape || img.landscape_title || poster;

        var episodes = d.episodes || [];
        var eps = [];
        for (var i = 0; i < episodes.length; i++) {
            var ep = episodes[i];
            var epId = (ep.id !== undefined && ep.id !== null && ep.id !== "") ? ep.id : String(i);
            var contentKey = d.id + "|data:" + epId;   // vod | episode index
            eps.push({
                id: contentKey,
                name: ep.title || ("Tập " + (i + 1)),
                slug: "ep-" + epId
            });
        }

        // ⭐ Kiểm tra tập 1 phát được không → nếu lỗi thì chặn luôn (không render tập)
        var status = "ok";
        if (eps.length > 0 && episodes.length > 0) {
            var firstEpId = (episodes[0].id !== undefined && episodes[0].id !== null && episodes[0].id !== "") ? episodes[0].id : "0";
            status = checkEpisodeAlive(d.id, firstEpId);
        }
        var servers;
        if (status === "drm") {
            log("parseMovieDetail: phim DRM → chặn render tập (không blacklist)");
            vaxToast("Phim này là bản quyền, chỉ xem được trên ứng dụng chính thức. Vui lòng xem phim khác.", 5000);
            servers = [{ name: "Phim bản quyền (không hỗ trợ)", episodes: [] }];
        } else if (status === "dead") {
            log("parseMovieDetail: phim lỗi/bị xoá → chặn render tập");
            reportBlacklist(d.id, "dead");
            vaxToast("Phim lỗi hoặc bị xoá do bản quyền, bạn hãy xem phim khác nhé.", 5000);
            servers = [{ name: "Phim lỗi hoặc bị xoá", episodes: [] }];
        } else {
            servers = [{ name: "Thiếu Nhi", episodes: eps }];
        }

        return JSON.stringify({
            id: d.id,
            title: d.title_vie || d.title || "",
            originName: d.title_origin || "",
            posterUrl: poster,
            backdropUrl: backdrop,
            description: (d.description || d.short_description || "").replace(/<[^>]*>/g, ""),
            year: "",
            rating: 0,
            quality: d.is_vip ? "VIP" : "",
            duration: d.duration || "",
            category: joinField(d.genres),
            country: joinField(d.countries),
            episode_current: d.episode_current || "",
            status: "",
            servers: servers
        });
    } catch (e) {
        log("parseMovieDetail err: " + e);
        return JSON.stringify({ id: "", title: "Error", servers: [] });
    }
}

// =============================================================================
// PARSERS — STREAM
// =============================================================================

// Build header "custom-data" cho Sigma DRM license (base64 JSON từ field session của stream API).
// userId: lấy từ JWT token (sub), hoặc hằng; deviceInfo cố định kiểu web Firefox.
function buildSigmaDrmHeaders(d) {
    try {
        var sess = d.session || d.streaming_session || "";
        if (!sess) return {};
        // userId: decode JWT payload.sub
        var uid = "0";
        try {
            var part = String(AUTH_TOKEN).split(".")[1];
            if (part) {
                var b64 = part.replace(/-/g, "+").replace(/_/g, "/");
                while (b64.length % 4) b64 += "=";
                var payload = JSON.parse(decodeB64Utf8(b64));
                if (payload && payload.sub) uid = String(payload.sub);
            }
        } catch (e) {}
        var deviceInfo = JSON.stringify({
            deviceId: "1993a9f5-e46d-841c-ec8a-6970c2c2e8a8",
            packageName: "DRMPacker", packageId: "fptplay.vn", appVersionCode: "1.0.5",
            layout: "Gecko", platform: "web", name: "Firefox", version: "160.0",
            description: "Firefox 160.0 on Linux 64-bit"
        });
        var extraData = encodeB64Utf8(JSON.stringify({ playerVersion: "Shaka_4.15.8", osDevice: "Linux" }));
        var obj = {
            userId: uid,
            sessionId: sess,
            merchantId: "fptplay",
            appId: "sigma",
            reqId: genUuid(),
            deviceInfo: deviceInfo,
            extraData: extraData
        };
        return {
            "custom-data": encodeB64Utf8(JSON.stringify(obj)),
            "Origin": "https://fptplay.vn",
            "Referer": "https://fptplay.vn/",
            "User-Agent": UA
        };
    } catch (e) { log("buildSigmaDrmHeaders err: " + e); return {}; }
}

// base64 utf8 helpers (portable)
function encodeB64Utf8(str) {
    try { return btoa(unescape(encodeURIComponent(str))); }
    catch (e) {
        // fallback thủ công cho QuickJS không có btoa
        return base64EncodeBytes(utf8ToBytes(str));
    }
}
function decodeB64Utf8(b64) {
    try { return decodeURIComponent(escape(atob(b64))); }
    catch (e) {
        return '';
    }
}
function utf8ToBytes(str) {
    var bytes = [], i, c;
    for (i = 0; i < str.length; i++) {
        c = str.charCodeAt(i);
        if (c < 0x80) bytes.push(c);
        else if (c < 0x800) { bytes.push(0xC0 | (c >> 6), 0x80 | (c & 63)); }
        else if (c < 0xD800 || c >= 0xE000) { bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
        else { i++; c = 0x10000 + (((c & 0x3FF) << 10) | (str.charCodeAt(i) & 0x3FF)); bytes.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
    }
    return bytes;
}
function base64EncodeBytes(bytes) {
    var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "", i;
    for (i = 0; i < bytes.length; i += 3) {
        var b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
        out += B64.charAt(b0 >> 2);
        out += B64.charAt(((b0 & 3) << 4) | ((b1 === undefined ? 0 : b1) >> 4));
        out += (b1 === undefined) ? "=" : B64.charAt(((b1 & 15) << 2) | ((b2 === undefined ? 0 : b2) >> 6));
        out += (b2 === undefined) ? "=" : B64.charAt(b2 & 63);
    }
    return out;
}
function genUuid() {
    try {
        var b = [], i;
        for (i = 0; i < 16; i++) b.push(Math.floor(Math.random() * 256));
        b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
        var h = "";
        for (i = 0; i < 16; i++) { h += ("0" + b[i].toString(16)).slice(-2); if (i === 3 || i === 5 || i === 7 || i === 9) h += "-"; }
        return h;
    } catch (e) { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); }); }
}

function parseDetailResponse(html, apiUrl, datasend) {
    try { console.log("[thieunhi] >>> parseDetailResponse() url=" + apiUrl + " datasend=" + datasend); } catch (e) {}
    var _retried = false;
    try {
        // apiUrl ở đây là URL detail ĐÃ FETCH (vd: https://.../content/vod/ID?st=...)
        // hoặc có thể là "ID|data:0". datasend = "data:0" (ep index).
        var rawUrl = String(apiUrl || "");
        // Bóc epId từ nhiều nguồn: datasend, hoặc phần sau | trong rawUrl
        var epId = "";
        if (datasend) epId = String(datasend).replace(/^data:/, "").trim();
        if (!epId && rawUrl.indexOf("|") > -1) {
            epId = rawUrl.split("|")[1].replace(/^data:/, "").trim();
        }
        if (epId === "" || epId == null) epId = "0";

        // Bóc vodId: nếu rawUrl là URL đầy đủ → extractVodId; nếu là ID trần → giữ nguyên
        var vodId = extractVodId(rawUrl);
        if (!vodId) vodId = rawUrl.split("|")[0].replace(/[?#].*$/, "").replace(/\/+$/, "");

        try { console.log("[thieunhi] stream parse: vodId=" + vodId + " epId=" + epId); } catch (e) {}

        // Lấy auto_profile từ detail nếu cần — mặc định adaptive_bitrate
        var autoProfile = "adaptive_bitrate";

        // Lấy token từ Worker (nếu chưa có trong phiên)
        ensureToken();

        var path = "stream/vod/" + vodId + "/" + (epId !== "" ? epId : "0") + "/" + autoProfile + "?stream_profile=1";
        var res = apiGet(path);
        var data = parseJson(res, true);   // đọc cả body 401

        var _needLogin = (!data) || (data.logged_in_fplay === 0) ||
            (data.data && data.data.is_logged_in === 0);

        // ⭐ Token chết / chưa có → thử làm mới 1 lần từ Worker, rồi báo lỗi + khoá
        if (_needLogin) {
            if (!_retried) {
                _retried = true;
                AUTH_TOKEN = "";               // buộc lấy lại
                ensureToken();
                if (AUTH_TOKEN) {
                    res = apiGet(path);
                    data = parseJson(res, true);
                    _needLogin = (!data) || (data.logged_in_fplay === 0) ||
                        (data.data && data.data.is_logged_in === 0);
                }
            }
        }

        if (_needLogin) {
            log("Token VIP không hợp lệ / hết hạn → KHOÁ tập phim");
            vaxToast("⚠️ Token VIP đã hết hạn.\nMở trang nguồn trên trình duyệt rồi bấm nút cập nhật token để xem tiếp.", 6000);
            return JSON.stringify({
                url: "",
                mimeType: "",
                isEmbed: false,
                headers: {},
                error: "token_invalid",
                _lockEpisodes: true   // cờ gợi ý UI khoá tập
            });
        }

        if (!data) {
            return JSON.stringify({
                url: "", mimeType: "application/x-mpegURL", isEmbed: false,
                headers: hh3Headers(), error: "Không parse được stream"
            });
        }

        // ── Cấu trúc ĐÃ login (200): { status:1, data:{ url, url_dash_no_drm, name, ... } } ──
        // (có thể data nằm trực tiếp hoặc trong data.data tùy gateway)
        var d = (data.data && typeof data.data === "object") ? data.data : data;

        // Ưu tiên HLS (ExoPlayer/hls.js phát tốt nhất), rồi DASH
        var cands = [d.url, d.url_hls_h265, d.url_hls_av1, d.url_dash_no_drm, d.url_dash_h265, d.url_pack];
        var streamUrl = "";
        for (var cI = 0; cI < cands.length; cI++) {
            if (cands[cI] && !isDrmUrl(cands[cI])) { streamUrl = cands[cI]; break; }
        }
        var mime = /\.mpd(\?|$)/i.test(streamUrl) ? "application/dash+xml" : "application/x-mpegURL";
        var isDrm = false;

        // ⭐ Nếu CHỈ có bản DRM (không có bản không-DRM) → phim bản quyền, KHÔNG phát được trên app.
        var hasDrmOnly = (!streamUrl) && !!(d.url_hls_drm || d.url_dash_drm || d.url_hls_drm_h265 || d.url_dash_drm_h265 || d.url_hls_drm_av1 || d.url_dash_drm_av1);
        // (vẫn cho phép fallback stream_profiles / trailer phía dưới nếu có)

        // Fallback cấu trúc cũ (stream_profiles)
        if (!streamUrl && (d.stream_profiles || data.stream_profiles)) {
            var profiles = d.stream_profiles || data.stream_profiles || [];
            var chosen = null;
            for (var i = 0; i < profiles.length; i++) {
                var p = profiles[i];
                if (p && (p.url || p.playback_url || p.manifest)) chosen = p;
            }
            if (!chosen && profiles.length) chosen = profiles[profiles.length - 1];
            if (chosen) streamUrl = chosen.url || chosen.playback_url || chosen.manifest || "";
        }
        if (!streamUrl && (data.trailer_url || d.trailer_url)) streamUrl = data.trailer_url || d.trailer_url;

        // ⭐ Phim chỉ có DRM: native chưa hỗ trợ Widevine license → chặn + báo
        if (!streamUrl && hasDrmOnly) {
            log("Phim DRM → native chưa hỗ trợ widevine → chặn");
            vaxToast("Phim này là bản quyền, chỉ xem được trên ứng dụng chính thức. Vui lòng xem phim khác.", 5000);
            return JSON.stringify({
                url: "", mimeType: "", isEmbed: false, headers: {},
                error: "drm_protected", _lockEpisodes: true
            });
        }

        // Phụ đề (nếu có)
        var subs = [];
        var rawSubs = d.subs || d.sub || d.subtitles;
        if (rawSubs && rawSubs.length) {
            for (var s = 0; s < rawSubs.length; s++) {
                var sb = rawSubs[s];
                if (!sb) continue;
                var sUrl = sb.url || sb.src || sb.file || sb.link;
                if (!sUrl) continue;
                subs.push({ lang: sb.lang || sb.language || sb.code || "vi", url: sUrl });
            }
        }

        // ⚠️ Header stream tới CDN KHÔNG được kèm Authorization (CDN trả 401).
        // Chỉ license mới dùng Authorization/custom-data.
        var streamHeaders = {
            "User-Agent": UA,
            "Referer": WEB + "/",
            "Origin": WEB
        };
        var out = {
            url: streamUrl,
            mimeType: mime,
            isEmbed: false,
            headers: streamHeaders,
            subtitles: subs
        };

        // (không còn nhánh DRM phát trực tiếp — phim DRM đã bị chặn ở trên)

        // Skip intro/outro (giây)
        var skipTimes = [];
        try {
            if (d.intro_from != null && d.start_content != null) {
                var a = parseInt(d.intro_from, 10), b2 = parseInt(d.start_content, 10);
                if (isFinite(a) && isFinite(b2) && b2 > a) skipTimes.push({ start: a, end: b2, type: "intro" });
            }
            if (d.end_content != null && d.sum != null) {
                var c3 = parseInt(d.end_content, 10), d4 = parseInt(d.sum, 10);
                if (isFinite(c3) && isFinite(d4) && d4 > c3) skipTimes.push({ start: c3, end: d4, type: "outro" });
            }
        } catch (e5) {}
        if (skipTimes.length) out.skipTimes = skipTimes;

        try { console.log("[thieunhi] stream OK name=" + (d.name || "?") + " drm=" + isDrm + " url=" + (streamUrl ? streamUrl.slice(0, 90) : "(rỗng)")); } catch (e6) {}
        return JSON.stringify(out);
    } catch (e) {
        log("parseDetailResponse err: " + e);
        return JSON.stringify({
            url: "", mimeType: "application/x-mpegURL", isEmbed: false,
            headers: hh3Headers(), error: String(e)
        });
    }
}

function parseEmbedResponse(html, url) { return "{}"; }

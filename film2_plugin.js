// =============================================================================
// HH3D Plugin - Hoạt Hình 3D (hoathinh3d.pw)
// Hỗ trợ tự động cập nhật domain, bóc tách và giải mã trực tiếp m3u8 stream.
// =============================================================================

var iddomain = "hh3d";
var BASEURL = "https://hoathinh3d.pw";
var DEFAULT_URL = "https://hoathinh3d.pw";

if (typeof httpRequest === "function") {
    try {
        var resDomain = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=" + Date.now(), { method: "GET", headers: { Accept: "application/json" } });
        if (resDomain && resDomain.isSuccessful && resDomain.body) {
            var domObj = JSON.parse(resDomain.body);
            if (domObj[iddomain] && domObj[iddomain].new) {
                BASEURL = domObj[iddomain].new;
            } else {
                // vkey.vn/hh3d là domain fallback cũ, hiện trả 403.
                // Khi domain.json chưa có key hh3d, giữ domain chính đang hoạt động.
                BASEURL = DEFAULT_URL;
            }
        } else {
            BASEURL = DEFAULT_URL;
        }
    } catch (eDom) {
        BASEURL = DEFAULT_URL;
    }
} else {
    BASEURL = DEFAULT_URL;
}

log("BASEURL=" + BASEURL);

// Phải khớp UA với WebView đã nhận cf_clearance; nếu dùng UA Windows khác
// với UA Android của WebView, Cloudflare thường trả lại challenge 403.
var HH3D_UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36";
var HH3D_STREAM_PROXY = "https://streamfile.alokillgtv04.workers.dev/proxy";
var HH3D_SEG_OFFSET = 70; // Byte offset nơi bắt đầu TS stream (sau IEND PNG 70 bytes)

function hh3dCookie() {
    try {
        if (typeof getCookie === "function") {
            var c = getCookie(BASEURL);
            return c && String(c).trim() ? String(c).trim() : "";
        }
    } catch (e) {
        log("getCookie lỗi: " + e.message);
    }
    return "";
}

function log(msg) {
    var str = "[hh3d] " + msg;
    if (typeof nativeLog !== "undefined") {
        nativeLog(str);
    }
    if (typeof console !== "undefined" && console.log) {
        console.log(str);
    }
}

function toast(msg) {
    if (typeof nativeToast !== "undefined") {
        nativeToast(msg);
    } else if (typeof SnifferBridge !== "undefined" && SnifferBridge.toast) {
        SnifferBridge.toast(msg, 2000);
    }
}

function getManifest() {
    return JSON.stringify({
        "id": "hh3d",
        "name": "Hoạt Hình 3D [ANIME]",
        "description": "Xem phim hoạt hình 3D Trung Quốc chất lượng cao.",
        "info": "Xem phim hoạt hình 3D trung hay nhất.",
        "version": "1.6.2",
        "baseUrl": BASEURL,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/hh3d.png",
        "isEnabled": true,
        "author": "Alokillgtv",
        "type": "ANIME",
        "playerType": "exoplayer",
        "popup_html": "<p>Nguồn HH3D có Cloudflare; plugin tự gắn header và thử nhiều User-Agent nên không cần mở WebView để lấy cookie.</p>"
    });
}

// =============================================================================
// CRYPTO HELPERS (Pure JS Fallback + AES-256-GCM / CTR)
// =============================================================================

var AES_SBOX = [
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
];
var AES_RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

function b64ToBytes(input) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var map = {};
    for (var c = 0; c < chars.length; c++) map[chars.charAt(c)] = c;
    var str = String(input || "").replace(/-/g, "+").replace(/_/g, "/").replace(/[^A-Za-z0-9+/=]/g, "");
    var out = [];
    var acc = 0, bits = 0;
    for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        if (ch === "=") break;
        acc = (acc << 6) | (map[ch] || 0);
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            out.push((acc >> bits) & 255);
        }
    }
    return out;
}

function bytesToB64(bytes) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "";
    var i = 0;
    while (i < bytes.length) {
        var b0 = bytes[i++];
        var b1 = i < bytes.length ? bytes[i++] : NaN;
        var b2 = i < bytes.length ? bytes[i++] : NaN;
        out += chars.charAt(b0 >> 2);
        if (isNaN(b1)) {
            out += chars.charAt((b0 & 3) << 4) + "==";
        } else if (isNaN(b2)) {
            out += chars.charAt(((b0 & 3) << 4) | (b1 >> 4)) + chars.charAt((b1 & 15) << 2) + "=";
        } else {
            out += chars.charAt(((b0 & 3) << 4) | (b1 >> 4)) + chars.charAt(((b1 & 15) << 2) | (b2 >> 6)) + chars.charAt(b2 & 63);
        }
    }
    return out;
}

function bytesToUtf8(bytes) {
    var out = "", i = 0;
    while (i < bytes.length) {
        var c = bytes[i++];
        if (c < 128) {
            out += String.fromCharCode(c);
        } else if (c < 224) {
            out += String.fromCharCode(((c & 31) << 6) | (bytes[i++] & 63));
        } else if (c < 240) {
            out += String.fromCharCode(((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63));
        } else {
            var cp = ((c & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63) - 0x10000;
            out += String.fromCharCode(0xD800 + (cp >> 10), 0xDC00 + (cp & 1023));
        }
    }
    return out;
}

function aesSubWord(w) {
    return ((AES_SBOX[(w >>> 24) & 255] << 24) | (AES_SBOX[(w >>> 16) & 255] << 16) | (AES_SBOX[(w >>> 8) & 255] << 8) | AES_SBOX[w & 255]) >>> 0;
}

function aesExpandKey(key) {
    var w = [], i;
    for (i = 0; i < 8; i++) {
        w[i] = ((key[4 * i] << 24) | (key[4 * i + 1] << 16) | (key[4 * i + 2] << 8) | key[4 * i + 3]) >>> 0;
    }
    for (i = 8; i < 60; i++) {
        var t = w[i - 1];
        if (i % 8 === 0) {
            t = (aesSubWord(((t << 8) | (t >>> 24)) >>> 0) ^ ((AES_RCON[i / 8 - 1] || 0) << 24)) >>> 0;
        } else if (i % 8 === 4) {
            t = aesSubWord(t);
        }
        w[i] = (w[i - 8] ^ t) >>> 0;
    }
    return w;
}

function aesEncryptBlock(block, roundKeys) {
    var st = block.slice();
    function addRoundKey(r) {
        for (var c = 0; c < 4; c++) {
            var k = roundKeys[4 * r + c];
            st[4 * c] ^= (k >>> 24) & 255;
            st[4 * c + 1] ^= (k >>> 16) & 255;
            st[4 * c + 2] ^= (k >>> 8) & 255;
            st[4 * c + 3] ^= k & 255;
        }
    }
    function subBytes() { for (var i = 0; i < 16; i++) st[i] = AES_SBOX[st[i]]; }
    function shiftRows() {
        var t1 = st[1], t2 = st[2], t3 = st[3];
        st[1] = st[5]; st[5] = st[9]; st[9] = st[13]; st[13] = t1;
        st[2] = st[10]; st[10] = t2;
        t1 = st[6]; st[6] = st[14]; st[14] = t1;
        st[3] = st[15]; st[15] = st[11]; st[11] = st[7]; st[7] = t3;
    }
    function xtime(x) { return ((x << 1) ^ (((x >> 7) & 1) * 0x11b)) & 255; }
    function mixColumns() {
        for (var c = 0; c < 4; c++) {
            var i = 4 * c, a0 = st[i], a1 = st[i + 1], a2 = st[i + 2], a3 = st[i + 3];
            var t = a0 ^ a1 ^ a2 ^ a3;
            var u0 = a0 ^ a1, u1 = a1 ^ a2, u2 = a2 ^ a3, u3 = a3 ^ a0;
            st[i] ^= xtime(u0) ^ t;
            st[i + 1] ^= xtime(u1) ^ t;
            st[i + 2] ^= xtime(u2) ^ t;
            st[i + 3] ^= xtime(u3) ^ t;
        }
    }
    addRoundKey(0);
    for (var r = 1; r < 14; r++) { subBytes(); shiftRows(); mixColumns(); addRoundKey(r); }
    subBytes(); shiftRows(); addRoundKey(14);
    return st;
}

function decryptAesGcm(keyB64, ivB64, payloadB64) {
    // 1. Thử gọi Native Decryptor nếu có (_vaCrypto / AppCrypto)
    var nativeDecrypt = null;
    if (typeof _vaCrypto !== "undefined" && typeof _vaCrypto.decryptAesGcm === "function") {
        nativeDecrypt = _vaCrypto.decryptAesGcm;
    } else if (typeof AppCrypto !== "undefined" && typeof AppCrypto.decryptAesGcm === "function") {
        nativeDecrypt = AppCrypto.decryptAesGcm;
    }
    if (nativeDecrypt) {
        try {
            var res = nativeDecrypt(keyB64, ivB64, payloadB64);
            if (res && res.length > 0) return String(res);
        } catch (eNative) {
            log("[AES-GCM] Native decrypt err: " + eNative);
        }
    }

    // 2. Thử Node.js crypto nếu chạy môi trường test/node
    if (typeof require === "function") {
        try {
            var crypto = require("crypto");
            var keyBuf = Buffer.from(keyB64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
            var ivBuf = Buffer.from(ivB64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
            var pBuf = Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
            var tag = pBuf.slice(pBuf.length - 16);
            var cipher = pBuf.slice(0, pBuf.length - 16);
            var decipher = crypto.createDecipheriv("aes-256-gcm", keyBuf, ivBuf);
            decipher.setAuthTag(tag);
            return Buffer.concat([decipher.update(cipher), decipher.final()]).toString("utf8");
        } catch (eNode) {}
    }

    // 3. Fallback Pure JS AES-CTR decryption (AES-256)
    try {
        var keyBytes = b64ToBytes(keyB64);
        var ivBytes = b64ToBytes(ivB64);
        var allBytes = b64ToBytes(payloadB64);
        if (keyBytes.length !== 32 || ivBytes.length !== 12 || allBytes.length <= 16) {
            return "";
        }
        var cipherBytes = allBytes.slice(0, allBytes.length - 16);
        var roundKeys = aesExpandKey(keyBytes);
        var counter = ivBytes.concat([0, 0, 0, 1]);
        var plain = [];
        for (var off = 0; off < cipherBytes.length; off += 16) {
            var n = (((counter[12] << 24) | (counter[13] << 16) | (counter[14] << 8) | counter[15]) + 1) >>> 0;
            counter[12] = (n >>> 24) & 255;
            counter[13] = (n >>> 16) & 255;
            counter[14] = (n >>> 8) & 255;
            counter[15] = n & 255;
            var stream = aesEncryptBlock(counter, roundKeys);
            for (var i = 0; i < 16 && off + i < cipherBytes.length; i++) {
                plain.push(cipherBytes[off + i] ^ stream[i]);
            }
        }
        return bytesToUtf8(plain).trim();
    } catch (ePure) {
        log("[AES-GCM] Pure JS decrypt err: " + ePure);
        return "";
    }
}

function generateHalimClient() {
    var hex = "";
    for (var i = 0; i < 24; i++) {
        var b = Math.floor(Math.random() * 256).toString(16);
        hex += (b.length < 2 ? "0" : "") + b;
    }
    return hex;
}

// =============================================================================
// STREAM HELPER (BYTERANGE & PROXY)
// =============================================================================

function hh3dProxySeg(segUrl) {
    return HH3D_STREAM_PROXY
        + "?url=" + encodeURIComponent(segUrl)
        + "&referer=" + encodeURIComponent("https://scontent.ibytedance.net/")
        + "&origin=" + encodeURIComponent("https://scontent.ibytedance.net")
        + "&ua=" + encodeURIComponent(HH3D_UA)
        + "&mime=video%2Fmp2t";
}

function hh3dRangeM3u8(manifestText) {
    if (!manifestText || manifestText.indexOf("#EXTM3U") < 0) return manifestText;
    if (manifestText.indexOf("#EXT-X-STREAM-INF") > -1) return manifestText;

    var lines = String(manifestText).replace(/\r/g, "").split("\n");
    var out = [];
    for (var j = 0; j < lines.length; j++) {
        var l = lines[j];
        if (l.indexOf("#EXT-X-VERSION") === 0) {
            out.push("#EXT-X-VERSION:4");
            continue;
        }
        if (l && l.charAt(0) !== "#" && /^https?:/i.test(l)) {
            var segUrl = l.replace(/\s+$/, "");
            out.push("#EXT-X-BYTERANGE:20000000@" + HH3D_SEG_OFFSET);
            out.push(hh3dProxySeg(segUrl));
            continue;
        }
        out.push(l);
    }
    var res = out.join("\n");
    if (res.indexOf("#EXT-X-VERSION") < 0) {
        res = res.replace("#EXTM3U", "#EXTM3U\n#EXT-X-VERSION:4");
    }
    return res;
}

// =============================================================================
// SECTIONS & MENU
// =============================================================================

function buildMenu(listurl) {
    var list = listurl.trim().split("\n");
    var menulist = [];
    for (var i = 0; i < list.length; i++) {
        var item = list[i].trim();
        if (!item) continue;
        var parts = item.split("@@");
        var slug = parts[0];
        var title = parts[1] || "";
        var isGrid = (parts[2] === "true");
        menulist.push({
            "slug": slug,
            "title": title,
            "name": title,
            "type": isGrid ? "Grid" : "Horizontal"
        });
    }
    return menulist;
}

function getHomeSections() {
    try {
        var listurl = `
/@@Mới Cập Nhật@@true
/phim-dang-chieu@@Đang Chiếu@@false
/phim-hoan-thanh@@Hoàn Thành@@false
`;
        return JSON.stringify(buildMenu(listurl));
    } catch (e) {
        log("getHomeSections err: " + e);
        return JSON.stringify([]);
    }
}

function getPrimaryCategories() {
    try {
        var listurl = `
/@@Phim Mới
/phim-dang-chieu@@Đang Chiếu
/phim-hoan-thanh@@Hoàn Thành
/phim-hoat-hinh-3d-le@@Phim Lẻ
/huyen-huyen@@Huyền Huyễn
/tien-hiep@@Tiên Hiệp
/trung-sinh@@Trùng Sinh
/xuyen-khong@@Xuyên Không
/co-trang@@Cổ Trang
/kiem-hiep@@Kiếm Hiệp
/hai-huoc@@Hài Hước
/hien-dai@@Hiện Đại
/bang-xep-hang-hoat-hinh-trung-quoc@@Bảng Xếp Hạng
/hh3d-danh-gia-cao@@Đánh Giá Cao
`;
        return JSON.stringify(buildMenu(listurl));
    } catch (e) {
        log("getPrimaryCategories err: " + e);
        return JSON.stringify([]);
    }
}

// plugin-loader (WebView) gọi parseCategoriesResponse khi lấy danh mục.
// Native app đọc getPrimaryCategories trực tiếp, hàm này để WebView dùng chung.
function parseCategoriesResponse(raw) {
    try {
        var j = (typeof raw === "string") ? JSON.parse(raw) : raw;
        var arr = null;
        if (Array.isArray(j)) arr = j;
        else if (j && Array.isArray(j.category)) arr = j.category;
        else if (j && Array.isArray(j.items)) arr = j.items;
        if (!arr) return "[]";
        var out = [];
        for (var i = 0; i < arr.length; i++) {
            out.push({
                slug: arr[i].slug || "",
                name: arr[i].name || arr[i].title || ""
            });
        }
        return JSON.stringify(out);
    } catch (e) {
        return "[]";
    }
}

function getFilterConfig() {
    try {
        return JSON.stringify({
            category: JSON.parse(getPrimaryCategories())
        });
    } catch (e) {
        return JSON.stringify({ category: [] });
    }
}

// Header set giống request WebView để Cloudflare không trả challenge 403.
// Đã kiểm chứng: thiếu các header này → 403 "Just a moment", đủ → 200 JSON.
function hh3dApiHeaders() {
    var out = [
        ["User-Agent", HH3D_UA],
        ["Accept", "application/json, text/plain, */*"],
        ["Accept-Language", "vi-VN,vi;q=0.9,en-US;q=0.8"],
        ["Referer", BASEURL + "/"],
        ["Origin", BASEURL],
        ["Sec-Fetch-Dest", "empty"],
        ["Sec-Fetch-Mode", "cors"],
        ["Sec-Fetch-Site", "same-origin"],
        ["X-Requested-With", "XMLHttpRequest"]
    ];
    try {
        var cookie = hh3dCookie();
        if (cookie) out.push(["Cookie", cookie]);
    } catch (eCookie) {}
    return out;
}

function hh3dHeaderObject() {
    var obj = {};
    var list = hh3dApiHeaders();
    for (var i = 0; i < list.length; i++) obj[list[i][0]] = list[i][1];
    return obj;
}

// Cú pháp pipe của VAAPP: "url|Key=Value&Key2=Value2" → app gắn thành HTTP header.
// Value được encode để dấu '&', '|', ';', '=' trong Cookie/UA không phá cú pháp.
function hh3dPipeHeaders(url) {
    var headers = hh3dApiHeaders();
    var parts = [];
    for (var i = 0; i < headers.length; i++) {
        parts.push(encodeURIComponent(headers[i][0]) + "=" + encodeURIComponent(headers[i][1]));
    }
    return url + "|" + parts.join("&");
}

// WebView: movie-module nhận JSON trực tiếp (fetch nội bộ kèm cookie, tránh CORS).
// Native: chỉ chấp nhận URL string → trả URL + pipe header để OkHttp tự fetch.
function hh3dDirectList(url) {
    try {
        log("direct list request=" + url);
        // WebView: XHR không set được User-Agent nên phải để hh3dFetchTrying
        // thử UA tối giản qua Worker proxy (try2) thay vì UA Android (try1 → 403).
        var res = hh3dFetchTrying(url, "GET", hh3dHeaderObject(), null, false);
        var body = res && res.body ? String(res.body) : "";
        if (body && !hh3dLooksBlocked(body)) {
            var parsedList = parseListResponse(body, url);
            try {
                var parsedObj = JSON.parse(parsedList);
                log("direct list parsed items=" + ((parsedObj.items || []).length)
                    + " pages=" + ((parsedObj.pagination && parsedObj.pagination.totalPages) || 1));
            } catch (eParse) { log("direct list parse output lỗi=" + eParse.message); }
            return parsedList;
        }
        log("direct list bị Cloudflare hoặc body rỗng");
    } catch (e) {
        log("direct list lỗi=" + e.message);
    }
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
}

function hh3dListRequest(url) {
    // Native QuickJS KHÔNG có `window`; WebView thì có (kể cả khi chạy on-device
    // với vax.local nên __VAX_WEB_MODE__ có thể false). Vì vậy chỉ cần check window.
    var isWeb = (typeof window !== "undefined");
    if (isWeb && typeof httpRequest === "function") return hh3dDirectList(url);
    var piped = hh3dPipeHeaders(url);
    log("getUrlList native pipe=" + piped.substring(0, 200));
    return piped;
}

// Trang HTML (chi tiết / xem phim / tìm kiếm) trên native cũng phải gắn header.
// WebView trả URL sạch vì movie-module WebView không xử lý pipe header.
function hh3dHtmlUrl(cleanUrl) {
    var isWeb = (typeof window !== "undefined");
    if (isWeb) return cleanUrl;
    return hh3dPipeHeaders(cleanUrl);
}

// URL danh sách dạng HTML (trang chủ / thể loại / tìm kiếm):
// - Native: trả URL + pipe header để OkHttp fetch.
// - WebView: tự fetch bằng httpRequest rồi trả JSON {"items":...} để movie-module
//   dùng nhánh "JSON trực tiếp", tránh CORS và header mặc định của Worker.
function hh3dListUrl(cleanUrl) {
    var isWeb = (typeof window !== "undefined");
    if (isWeb && typeof httpRequest === "function") return hh3dDirectList(cleanUrl);
    return hh3dPipeHeaders(cleanUrl);
}

// =============================================================================
// URL BUILDERS & LIST / SEARCH PARSERS
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            try {
                var filters = (typeof filtersJson === "string") ? JSON.parse(filtersJson) : filtersJson;
                if (filters && filters.page) page = parseInt(filters.page, 10) || 1;
            } catch (eF) {}
        }
        var s = String(slug || "").replace(BASEURL, "").replace(/^\/+|\/+$/g, "");

        // Các mục có API JSON riêng của theme halim
        if (s === "phim-dang-chieu") {
            var ongoingUrl = BASEURL + "/wp-json/halim/v1/ongoing?page=" + page + "&per_page=20";
            log("getUrlList ongoing=" + ongoingUrl);
            return hh3dListRequest(ongoingUrl);
        }
        if (s === "phim-hoan-thanh") {
            var completedUrl = BASEURL + "/wp-json/halim/v1/completed?page=" + page + "&per_page=20";
            log("getUrlList completed=" + completedUrl);
            return hh3dListRequest(completedUrl);
        }
        if (s === "phim-hoat-hinh-3d-le") {
            var movieUrl = BASEURL + "/wp-json/halim/v1/movies?page=" + page + "&per_page=20";
            log("getUrlList movies=" + movieUrl);
            return hh3dListRequest(movieUrl);
        }
        if (s === "hh3d-danh-gia-cao") {
            var topUrl = BASEURL + "/wp-json/halim/v1/top-rated?page=" + page + "&per_page=20";
            log("getUrlList top-rated=" + topUrl);
            return hh3dListRequest(topUrl);
        }

        // Trang chủ (mới cập nhật) và các thể loại: trang HTML taxonomy
        if (!s) {
            var homeUrl = BASEURL + (page > 1 ? "/page/" + page : "/");
            log("getUrlList home=" + homeUrl);
            return hh3dListUrl(homeUrl);
        }
        var catUrl = BASEURL + "/" + s + (page > 1 ? "/page/" + page : "");
        log("getUrlList category=" + catUrl);
        return hh3dListUrl(catUrl);
    } catch (e) {
        log("getUrlList err: " + e);
        return BASEURL + "/" + slug;
    }
}

function parseListResponse(html, url) {
    try {
        var items = [];
        var totalPages = 99;
        var currentPage = 1;

        if (url) {
            var pM = url.match(/page[\/=](\d+)/i);
            if (pM) currentPage = parseInt(pM[1], 10);
        }

        var trimmed = String(html || "").trim();
        log("parseListResponse url=" + (url || "") + " len=" + trimmed.length
            + " head=" + trimmed.substring(0, 80).replace(/[\r\n]+/g, " "));
        if (/just a moment|cf-chl-|challenge-platform|cloudflare/i.test(trimmed.substring(0, 4096))) {
            log("CLOUDFLARE BLOCK: domain trả challenge 403, thử fetch lại bằng httpRequest");
            // App fetch bằng OkHttp default không đủ header → tự fetch lại kèm header WebView.
            try {
                if (typeof httpRequest === "function") {
                    var hhHeaders = hh3dHeaderObject();
                    var cleanUrl = String(url || "").split("|")[0];
                    var retryRes = httpRequest(cleanUrl, { method: "GET", headers: hhHeaders });
                    var retryBody = retryRes && retryRes.body ? String(retryRes.body) : "";
                    log("parseListResponse refetch status=" + (retryRes && retryRes.status)
                        + " len=" + retryBody.length);
                    if (retryBody && !/just a moment|cf-chl-|challenge-platform/i.test(retryBody.substring(0, 4096))) {
                        trimmed = retryBody.trim();
                    }
                }
            } catch (eRetry) {
                log("parseListResponse refetch lỗi=" + eRetry.message);
            }
            if (/just a moment|cf-chl-|challenge-platform|cloudflare/i.test(trimmed.substring(0, 4096))) {
                log("CLOUDFLARE BLOCK: fetch lại vẫn challenge, không phải lỗi parser");
                return JSON.stringify({ items: [], pagination: { currentPage: currentPage, totalPages: 1 }, error: "cloudflare" });
            }
        }

        // 1. Trường hợp API JSON của theme halim
        if (trimmed.charAt(0) === "{" && (trimmed.indexOf('"items"') > -1 || trimmed.indexOf('"items_html"') > -1)) {
            var data = JSON.parse(trimmed);

            // /latest-updates trả items_html (HTML danh sách) → chuyển sang nhánh parse HTML
            if (data && data.items_html && !data.items) {
                trimmed = String(data.items_html).trim();
                if (data.total_pages) totalPages = parseInt(data.total_pages, 10) || totalPages;
                if (data.page) currentPage = parseInt(data.page, 10) || currentPage;
                log("parseListResponse dùng items_html len=" + trimmed.length
                    + " page=" + currentPage + "/" + totalPages);
            } else if (data && data.items && Array.isArray(data.items)) {
                // JSON của halim API (permalink/poster_url) hoặc JSON do chính
                // parseListResponse trả về trước đó (id/posterUrl) — WebView gọi
                // parser 2 lần nên phải đọc được cả hai dạng.
                if (data.page) currentPage = parseInt(data.page, 10) || currentPage;
                if (data.total_pages) {
                    totalPages = parseInt(data.total_pages, 10) || totalPages;
                } else if (data.pagination && data.pagination.totalPages) {
                    totalPages = parseInt(data.pagination.totalPages, 10) || totalPages;
                    if (data.pagination.currentPage) {
                        currentPage = parseInt(data.pagination.currentPage, 10) || currentPage;
                    }
                } else if (data.total && data.per_page) {
                    totalPages = Math.ceil(data.total / data.per_page);
                } else if (data.has_more) {
                    totalPages = currentPage + 1;
                }
                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i];
                    var itemPoster = item.poster_url || item.posterUrl || "";
                    items.push({
                        id: item.permalink || item.id || "",
                        title: item.title || "",
                        posterUrl: itemPoster,
                        backdropUrl: item.poster_url || item.backdropUrl || itemPoster,
                        datasend: item.poster_url || item.datasend || itemPoster,
                        description: item.latest_episode || item.description
                            || ("Đánh giá: " + (item.average_rating || "3D")),
                        episode_current: item.latest_episode || item.episode_current || ""
                    });
                }
                return JSON.stringify({
                    items: items,
                    page: currentPage,
                    total_pages: totalPages,
                    pagination: {
                        currentPage: currentPage,
                        totalPages: totalPages
                    }
                });
            }
        }

        // 2. Trường hợp HTML danh sách (trang chủ hoặc category)
        var pageM = trimmed.match(/class=["'][^"']*page-numbers current["'][^>]*>(\d+)</i);
        if (pageM) currentPage = parseInt(pageM[1], 10);

        var lastPageM = trimmed.match(/href=["'][^"']*\/page\/(\d+)["']/gi);
        if (lastPageM && lastPageM.length > 0) {
            var lastNum = currentPage;
            for (var lp = 0; lp < lastPageM.length; lp++) {
                var numM = lastPageM[lp].match(/\/page\/(\d+)/i);
                if (numM) {
                    var n = parseInt(numM[1], 10);
                    if (n > lastNum) lastNum = n;
                }
            }
            totalPages = lastNum;
        }

        var regex = /<article[^>]*class=["'][^"']*thumb[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi;
        var match;
        var used = {};
        while ((match = regex.exec(trimmed)) !== null) {
            var block = match[1];
            var hrefM = block.match(/href=["'](https?:\/\/[^"']+)["']/i);
            var titleM = block.match(/title=["']([^"']+)["']/i) || block.match(/alt=["']([^"']+)["']/i);
            var imgM = block.match(/src=["'](https?:\/\/[^"']+)["']/i);
            var epM = block.match(/<span[^>]*class=["'][^"']*episode[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
                      block.match(/<span[^>]*class=["'][^"']*status[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);

            if (hrefM && titleM) {
                var link = hrefM[1].trim();
                if (used[link]) continue;
                used[link] = true;

                var epStr = epM ? epM[1].replace(/<[^>]+>/g, "").trim() : "";
                var poster = imgM ? imgM[1].trim() : "";
                var titleText = titleM[1].trim();

                items.push({
                    id: link,
                    title: titleText,
                    posterUrl: poster,
                    backdropUrl: poster,
                    datasend: poster,
                    description: epStr,
                    episode_current: epStr
                });
            }
        }

        return JSON.stringify({
            items: items,
            page: currentPage,
            total_pages: totalPages,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages
            }
        });
    } catch (e) {
        log("parseListResponse err: " + e);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function getUrlSearch(query, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            try {
                var f = (typeof filtersJson === "string") ? JSON.parse(filtersJson) : filtersJson;
                if (f && f.page) page = parseInt(f.page, 10) || 1;
            } catch (e) {}
        }
        var q = encodeURIComponent(query || "").replace(/%20/g, "+");
        if (page > 1) {
            return hh3dListUrl(BASEURL + "/search/" + q + "/page/" + page);
        }
        return hh3dListUrl(BASEURL + "/search/" + q);
    } catch (e) {
        return hh3dListUrl(BASEURL + "/?s=" + encodeURIComponent(query || ""));
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function getUrlDetail(id, datasend) {
    if (!id) return "";
    var parts = String(id).trim().split("|");
    var clean = parts[0];
    if (clean.indexOf("http") !== 0) {
        clean = BASEURL + (clean.charAt(0) === "/" ? "" : "/") + clean;
    }

    // episode.id dạng "href|postId|serverId|episodeSlug" (dạng data cũ).
    // App có thể truyền nguyên id hoặc tách data sang datasend → chấp nhận cả hai.
    var dataStr = "";
    if (parts.length >= 4 && /^\d+$/.test(parts[1] || "")) {
        dataStr = parts.slice(1, 4).join("|");
    } else if (datasend && /^\d+\|\d+\|/.test(String(datasend))) {
        dataStr = String(datasend);
    }
    if (dataStr) {
        var dp = dataStr.split("|");
        clean += (clean.indexOf("?") > -1 ? "&" : "?")
            + "hhpid=" + encodeURIComponent(dp[0] || "0")
            + "&hhsid=" + encodeURIComponent(dp[1] || "1")
            + "&hhep=" + encodeURIComponent(dp[2] || "");
    }

    // Trang chi tiết (không phải tập): tự tải rồi trả JSON MovieDetail để app
    // bỏ qua HTTP fetch. Dùng hh3dFetchTrying vì Cloudflare có thể chặn UA Android
    // (native) hoặc XHR WebView không set được UA → cần biến thể "Mozilla/5.0".
    if (!dataStr && typeof httpRequest === "function") {
        try {
            var dres = hh3dFetchTrying(clean, "GET", hh3dHeaderObject(), null, false);
            var dbody = dres && dres.body ? String(dres.body) : "";
            log("getUrlDetail direct status=" + (dres && dres.status) + " len=" + dbody.length
                + " head=" + dbody.substring(0, 70).replace(/[\r\n]+/g, " "));
            if (dbody && !hh3dLooksBlocked(dbody)) {
                var detailJson = parseMovieDetail(dbody, clean, datasend);
                log("getUrlDetail trả JSON MovieDetail len=" + detailJson.length);
                return detailJson;
            }
            log("getUrlDetail direct bị challenge → fallback URL");
        } catch (eDetail) {
            log("getUrlDetail direct lỗi=" + eDetail.message);
        }
    }

    var out = hh3dHtmlUrl(clean);
    log("getUrlDetail pipe=" + out.substring(0, 180));
    return out;
}

// =============================================================================
// MOVIE DETAIL PARSER
// =============================================================================

function parseMovieDetail(html, url, datasend) {
    try {
        var page = String(html || "");

        // WebView: getUrlDetail đã trả JSON MovieDetail, nhưng movie-module vẫn
        // gọi tiếp Adapter.parseDetail(raw, url) → plugin-loader gọi lại hàm này
        // với raw là JSON. Nếu parse như HTML sẽ ra 0 server → mất danh sách tập.
        var _trim = page.replace(/^\s+/, "");
        if (_trim.charAt(0) === "{") {
            try {
                var _j = JSON.parse(_trim);
                if (_j && (_j.servers || _j.title)) {
                    log("parseMovieDetail passthrough JSON (servers="
                        + ((_j.servers || []).length) + ")");
                    return JSON.stringify(_j);
                }
            } catch (eJson) {}
        }

        log("parseMovieDetail len=" + page.length
            + " head=" + page.substring(0, 70).replace(/[\r\n]+/g, " "));
        if (/just a moment|cf-chl-|challenge-platform/i.test(page.substring(0, 4096))
            && typeof httpRequest === "function") {
            try {
                var retryDetail = httpRequest(String(url || "").split("|")[0],
                    { method: "GET", headers: hh3dHeaderObject() });
                var retryDetailBody = retryDetail && retryDetail.body ? String(retryDetail.body) : "";
                log("parseMovieDetail refetch status=" + (retryDetail && retryDetail.status)
                    + " len=" + retryDetailBody.length);
                if (retryDetailBody && !/just a moment|cf-chl-|challenge-platform/i.test(retryDetailBody.substring(0, 4096))) {
                    page = retryDetailBody;
                }
            } catch (eRetryDetail) {
                log("parseMovieDetail refetch lỗi=" + eRetryDetail.message);
            }
        }
        var ogTitleM = page.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
        var titleM = page.match(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                     page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = ogTitleM ? ogTitleM[1].replace(/Next Tập.*$/i, "").replace(/\[Việt Sub\].*$/i, "").replace(/\|.*$/i, "").trim()
                             : (titleM ? titleM[1].replace(/<[^>]+>/g, "").trim() : "");

        var ogImgM = page.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        var imgM = page.match(/<img[^>]*class=["'][^"']*info-v2-poster-img[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
                   page.match(/<img[^>]*class=["'][^"']*movie-thumb[^"']*["'][^>]*src=["']([^"']+)["']/i);
        var poster = ogImgM ? ogImgM[1].trim() : (imgM ? imgM[1].trim() : (datasend || ""));

        var ogDescM = page.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
        var descM = page.match(/<div[^>]*class=["'][^"']*film-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                    page.match(/<div[^>]*class=["'][^"']*item-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        var desc = ogDescM ? ogDescM[1].trim() : (descM ? descM[1].replace(/<[^>]+>/g, "").trim() : "");

        // Parse Servers & Episodes
        var servers = [];
        var serverMap = {};

        // Regex quét các nút halim-btn tập phim trong cả trang detail lẫn trang watch
        var epRegex = /<li[^>]*class=["'][^"']*halim-episode[^"']*["'][^>]*>[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<span[^>]*class=["'][^"']*halim-btn[^"']*["'][^>]*data-post-id=["'](\d+)["'][^>]*data-server=["'](\d+)["'][^>]*data-episode-slug=["']([^"']+)["'][^>]*>([\s\S]*?)<\/span>/gi;
        var epMatch;

        while ((epMatch = epRegex.exec(page)) !== null) {
            var epHref = epMatch[1].trim();
            var postId = epMatch[2];
            var sId = epMatch[3];
            var epSlug = epMatch[4];
            var epName = epMatch[5].replace(/<[^>]+>/g, "").trim();

            if (epHref.indexOf("http") !== 0) {
                epHref = BASEURL + (epHref.charAt(0) === "/" ? "" : "/") + epHref;
            }

            var svKey = "Server " + sId;
            if (!serverMap[svKey]) {
                serverMap[svKey] = [];
            }
            serverMap[svKey].push({
                name: (/^\d+/.test(epName) ? ("Tập " + epName) : epName) || epSlug,
                slug: epSlug,
                url: epHref,
                id: epHref + "|" + postId + "|" + sId + "|" + epSlug
            });
        }

        // Fallback regex nếu thẻ a bao quanh thẻ span không nằm trong <li>
        if (Object.keys(serverMap).length === 0) {
            var fbRegex = /href=["']([^"']*\/xem-phim-[^"']+)["'][^>]*>[\s\S]*?<span[^>]*class=["'][^"']*halim-btn[^"']*["'][^>]*data-post-id=["'](\d+)["'][^>]*data-server=["'](\d+)["'][^>]*data-episode-slug=["']([^"']+)["'][^>]*>([\s\S]*?)<\/span>/gi;
            var fbM;
            while ((fbM = fbRegex.exec(page)) !== null) {
                var fbHref = fbM[1].trim();
                var fbPostId = fbM[2];
                var fbSId = fbM[3];
                var fbEpSlug = fbM[4];
                var fbEpName = fbM[5].replace(/<[^>]+>/g, "").trim();

                if (fbHref.indexOf("http") !== 0) {
                    fbHref = BASEURL + (fbHref.charAt(0) === "/" ? "" : "/") + fbHref;
                }

                var fbSvKey = "Server " + fbSId;
                if (!serverMap[fbSvKey]) serverMap[fbSvKey] = [];
                serverMap[fbSvKey].push({
                    name: (/^\d+/.test(fbEpName) ? ("Tập " + fbEpName) : fbEpName) || fbEpSlug,
                    slug: fbEpSlug,
                    url: fbHref,
                    id: fbHref + "|" + fbPostId + "|" + fbSId + "|" + fbEpSlug
                });
            }
        }

        for (var k in serverMap) {
            if (serverMap.hasOwnProperty(k)) {
                var epList = serverMap[k];
                // Sắp xếp tăng dần theo số tập
                epList.sort(function(a, b) {
                    var nA = parseFloat(String(a.slug).replace(/[^\d.]/g, ""));
                    var nB = parseFloat(String(b.slug).replace(/[^\d.]/g, ""));
                    if (isNaN(nA)) return 0;
                    if (isNaN(nB)) return 0;
                    return nA - nB;
                });
                servers.push({
                    name: k,
                    episodes: epList
                });
            }
        }

        var _epCount = 0;
        for (var _si = 0; _si < servers.length; _si++) _epCount += (servers[_si].episodes || []).length;
        log("parseMovieDetail OK title=" + title + " servers=" + servers.length + " episodes=" + _epCount);

        return JSON.stringify({
            id: url || "",
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: desc,
            servers: servers,
            quality: "HD",
            status: "Đang cập nhật"
        });
    } catch (e) {
        log("parseMovieDetail err: " + e);
        return JSON.stringify({
            id: url || "",
            title: "",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: []
        });
    }
}

// =============================================================================
// STREAM RESOLVER (STAGE 1 & STAGE 2 AES-256-GCM / XOR)
// =============================================================================

function fetchWithHeaders(url, opts) {
    if (typeof httpRequest === "function") {
        opts = opts || {};
        opts.headers = opts.headers || {};
        var cookie = opts.noCookie ? "" : hh3dCookie();
        if (cookie && !opts.headers.Cookie) opts.headers.Cookie = cookie;
        return httpRequest(url, opts);
    }
    return null;
}

function hh3dLooksBlocked(body) {
    var b = String(body || "");
    if (!b) return true;
    return /just a moment|cf-chl-|challenge-platform|cf-mitigated/i.test(b.substring(0, 4096));
}

// Cloudflare chặn theo UA/fingerprint: UA Android có thể bị challenge ở player.php
// trong khi UA đơn giản "Mozilla/5.0" lại qua. Thử lần lượt 2 bộ header.
function hh3dFetchTrying(url, method, headers, body, expectJson) {
    // 3 biến thể: header của plugin, UA tối giản, UA tối giản + bỏ cookie WebView.
    // Cloudflare có thể challenge UA Android hoặc cookie cf_clearance lệch UA.
    // WebView + host hoathinh3d: UA Android luôn 403 (XHR còn bị CORS) → bỏ qua
    // biến thể 1 để không mất ~1.4s mỗi request khi chuyển tập.
    var isWeb = (typeof window !== "undefined");
    var isHh3dHost = /hoathinh3d\./i.test(String(url || ""));
    var startVi = (isWeb && isHh3dHost) ? 1 : 0;
    for (var vi = startVi; vi < 3; vi++) {
        var h = {};
        for (var k in headers) {
            if (headers.hasOwnProperty(k)) h[k] = headers[k];
        }
        if (vi >= 1) {
            h["User-Agent"] = "Mozilla/5.0";
            h["Accept"] = "*/*";
        }
        if (vi === 2) {
            delete h["Cookie"];
            delete h["cookie"];
        }
        var opts = { method: method, headers: h, noCookie: (vi === 2) };
        if (body !== null && typeof body !== "undefined") opts.body = body;

        var res = null;
        try {
            res = fetchWithHeaders(url, opts);
        } catch (eFetch) {
            log("fetchTrying lỗi: " + eFetch.message);
        }
        var respBody = res && res.body ? String(res.body) : "";
        var st = res && res.status ? Number(res.status) : 0;
        var stOk = (!st || (st >= 200 && st < 300));
        var ok = stOk && !hh3dLooksBlocked(respBody)
            && (!expectJson || respBody.replace(/^\s+/, "").charAt(0) === "{");
        log("fetchTrying " + String(url).split("?")[0].split("/").pop()
            + " try" + (vi + 1) + " status=" + st
            + " len=" + respBody.length + " ok=" + ok);
        if (ok) return res;
    }
    return null;
}

function parseDetailResponse(html, url, datasend) {
    try {
        log("[hh3d] parseDetailResponse url: " + url);

        var watchUrl = String(url || "").split("|")[0];
        var postId = "", serverId = "1", episodeSlug = "";

        // Thông tin tập được nhét vào query bởi getUrlDetail (để URL vẫn gắn được header pipe).
        var qPid = watchUrl.match(/[?&]hhpid=(\d+)/i);
        var qSid = watchUrl.match(/[?&]hhsid=(\d+)/i);
        var qEp = watchUrl.match(/[?&]hhep=([^&]*)/i);
        if (qPid) {
            postId = qPid[1];
            serverId = (qSid && qSid[1]) || "1";
            episodeSlug = qEp ? decodeURIComponent(qEp[1]) : "";
        } else if (url.indexOf("|") > -1) {
            // Tương thích id cũ dạng "href|postId|serverId|slug"
            var parts = url.split("|");
            if (/^\d+$/.test(parts[1] || "")) {
                postId = parts[1] || "";
                serverId = parts[2] || "1";
                episodeSlug = parts[3] || "";
            }
        }
        if (!postId && datasend && /^\d+\|\d+\|/.test(String(datasend))) {
            var dparts = String(datasend).split("|");
            postId = dparts[0];
            serverId = dparts[1] || "1";
            episodeSlug = dparts[2] || "";
        }

        // Nếu thiếu thông tin tập, parse từ HTML xem phim
        if (!postId || !episodeSlug) {
            var btnM = html.match(/data-post-id=["'](\d+)["'][^>]*data-server=["'](\d+)["'][^>]*data-episode-slug=["']([^"']+)["']/i);
            if (btnM) {
                postId = btnM[1];
                serverId = btnM[2];
                episodeSlug = btnM[3];
            } else {
                var urlM = watchUrl.match(/\/xem-phim-[^\/]+\/(tap-[^\-]+)-sv(\d+)\.html/i);
                if (urlM) {
                    episodeSlug = urlM[1];
                    serverId = urlM[2];
                }
            }
        }

        if (!postId) {
            var postM = html.match(/data-post_id=["'](\d+)["']/i) || html.match(/post-(\d+)/i);
            if (postM) postId = postM[1];
        }

        log("[hh3d] Target episode: post=" + postId + ", server=" + serverId + ", slug=" + episodeSlug);

        // ---------------------------------------------------------------------
        // Bước 1: Gọi player.php để lấy session cookie và payload mã hóa
        // ---------------------------------------------------------------------
        var clientId = generateHalimClient();
        var playerPhpUrl = BASEURL + "/wp-content/themes/halimmovies/player.php?episode_slug="
            + encodeURIComponent(episodeSlug) + "&server_id=" + serverId + "&subsv_id=&post_id="
            + postId + "&pe=embed";

        var phpRes = hh3dFetchTrying(playerPhpUrl, "GET", {
            "User-Agent": HH3D_UA,
            "X-Requested-With": "XMLHttpRequest",
            "X-Halim-Client": clientId,
            "Referer": watchUrl
        }, null, true);

        if (!phpRes || !phpRes.body) {
            log("[hh3d] Gọi player.php thất bại");
            throw new Error("Không lấy được player.php");
        }

        var sessCookie = "";
        var setCookie = phpRes.headers ? (phpRes.headers["set-cookie"] || phpRes.headers["Set-Cookie"]) : null;
        if (!setCookie && phpRes.setCookies) setCookie = phpRes.setCookies;
        if (setCookie) {
            var cookieStr = Array.isArray(setCookie) ? setCookie.join("; ") : String(setCookie);
            var mCookie = cookieStr.match(/halim_pk_sess=([^;]+)/);
            if (mCookie) sessCookie = "halim_pk_sess=" + mCookie[1];
        }

        var encPlayer = JSON.parse(phpRes.body);
        if (!encPlayer.kid || !encPlayer.payload) {
            log("[hh3d] player.php payload không hợp lệ");
            throw new Error("Dữ liệu player.php không đúng chuẩn");
        }

        // ---------------------------------------------------------------------
        // Bước 2: Gọi /player-key để lấy key giải mã Stage 1
        // ---------------------------------------------------------------------
        var keyUrl = BASEURL + "/wp-json/halim/v1/player-key";
        var keyHeaders = {
            "User-Agent": HH3D_UA,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Halim-Client": clientId,
            "Referer": watchUrl,
            "Origin": BASEURL
        };
        if (sessCookie) keyHeaders["Cookie"] = sessCookie;

        var keyRes = hh3dFetchTrying(keyUrl, "POST", keyHeaders,
            JSON.stringify({ key_id: encPlayer.kid }), true);

        if (!keyRes || !keyRes.body) {
            log("[hh3d] Gọi /player-key thất bại");
            throw new Error("Không lấy được player-key");
        }

        var keyObj = JSON.parse(keyRes.body);
        if (!keyObj.success || !keyObj.key) {
            log("[hh3d] player-key trả về lỗi: " + keyRes.body);
            throw new Error("Key player không hợp lệ");
        }

        // ---------------------------------------------------------------------
        // Bước 3: Giải mã AES-256-GCM lấy embed_url
        // ---------------------------------------------------------------------
        var stage1Text = decryptAesGcm(keyObj.key, encPlayer.iv, encPlayer.payload);
        if (!stage1Text) {
            throw new Error("Giải mã Stage 1 thất bại");
        }
        var stage1Data = JSON.parse(stage1Text);
        var embedUrl = stage1Data.embed_url;
        log("[hh3d] Embed URL: " + embedUrl);

        // ---------------------------------------------------------------------
        // Bước 4: Tải Embed HTML, bóc tách data-p và data-m, giải mã XOR
        // ---------------------------------------------------------------------
        var embedRes = hh3dFetchTrying(embedUrl, "GET", {
            "User-Agent": HH3D_UA,
            "Referer": watchUrl
        }, null, false);

        if (!embedRes || !embedRes.body) {
            throw new Error("Không tải được embed player HTML");
        }

        var pMatch = embedRes.body.match(/data-p=["']([^"']+)["']/i);
        var mMatch = embedRes.body.match(/data-m=["']([^"']+)["']/i);
        if (!pMatch || !mMatch) {
            throw new Error("Không tìm thấy data-p hoặc data-m trong embed player");
        }

        var revM = mMatch[1].split("").reverse().join("");
        var mBytes = b64ToBytes(revM);
        var pBytes = b64ToBytes(pMatch[1]);
        var outXor = [];
        for (var xi = 0; xi < pBytes.length; xi++) {
            outXor.push(pBytes[xi] ^ mBytes[xi % mBytes.length]);
        }
        var embedConfig = JSON.parse(bytesToUtf8(outXor));
        log("[hh3d] Embed config URI: " + embedConfig.c);

        // ---------------------------------------------------------------------
        // Bước 5: Tải Manifest mã hóa và giải mã AES-256-GCM ra m3u8 thuần
        // ---------------------------------------------------------------------
        var manifestEncUrl = "https://scontent.ibytedance.net" + embedConfig.c;
        var manifestRes = hh3dFetchTrying(manifestEncUrl, "GET", {
            "User-Agent": HH3D_UA,
            "Referer": "https://scontent.ibytedance.net/",
            "Origin": BASEURL
        }, null, false);

        if (!manifestRes || !manifestRes.body) {
            throw new Error("Không tải được manifest mã hóa");
        }

        var rawPlaylist = decryptAesGcm(embedConfig.k, embedConfig.i, manifestRes.body.trim());
        if (!rawPlaylist || rawPlaylist.indexOf("#EXTM3U") < 0) {
            throw new Error("Giải mã manifest thất bại hoặc không phải m3u8");
        }

        log("[hh3d] Manifest giải mã thành công! Độ dài: " + rawPlaylist.length);

        // ---------------------------------------------------------------------
        // Bước 6: Chèn Range offset 70 cho các segment PNG và đóng gói trả về
        // ---------------------------------------------------------------------
        var rangedPlaylist = hh3dRangeM3u8(rawPlaylist);

        return JSON.stringify({
            url: manifestEncUrl,
            m3u8Content: rangedPlaylist,
            baseUrl: manifestEncUrl,
            mimeType: "application/x-mpegURL",
            isEmbed: false,
            headers: {
                "Referer": "https://scontent.ibytedance.net/",
                "Origin": "https://scontent.ibytedance.net",
                "User-Agent": HH3D_UA,
                "Accept-Encoding": "identity"
            }
        });

    } catch (e) {
        log("[hh3d] parseDetailResponse LỖI: " + e);
        toast("Link tập phim đang xử lý, vui lòng thử lại hoặc chọn tập khác");
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            isEmbed: false,
            mimeType: "video/mp4",
            headers: {}
        });
    }
}
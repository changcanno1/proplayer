// =============================================================================
// PHIMNET.ONLINE PLUGIN — VAX / VMOAPP
// - Hỗ trợ xem 720p miễn phí không cần đăng nhập
// - Hỗ trợ lấy Cookie từ WebView (getCookie) để mở khóa nguồn 1080p / 2160p
// - Thông báo POPUP_HTML hướng dẫn đăng nhập giống Xem20
// =============================================================================
var BASEURL = "https://phimnet.online";
var API = BASEURL + "/api";
var UA = "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36";
var LOCALE = "vi";

var POPUP_HTML = '<div style="' +
    'display: flex;' +
    'flex-direction: column;' +
    'justify-content: center;' +
    'align-items: stretch;' +
    'min-height: 100%;' +
    'padding: 8px 4px;' +
    'box-sizing: border-box;' +
    'text-align: left;' +
    'line-height: 1.65;' +
    'font-size: 14px;' +
    'gap: 14px;' +
'">' +
    '<p style="margin: 0;">' +
        'Nguồn <b>Phimnet.online</b> cho phép xem trực tuyến chất lượng <b style="color:#22c55e">720p miễn phí ngay lập tức</b> mà không cần tài khoản.' +
    '</p>' +
    '<p style="margin: 0;">' +
        'Để mở khóa các nguồn chất lượng cao <b style="color:#f43f5e">1080p Full HD</b> (và các tập phim bộ chỉ có bản 1080p), bạn hãy vào trang cài đặt plugin và nhấn vào <b style="color:#38bdf8">Đăng nhập</b> (hoặc cuộn xuống bên dưới để mở trình duyệt WebView và đăng nhập tài khoản Google miễn phí).' +
    '</p>' +
    '<p style="margin: 0;">' +
        'Sau khi đăng nhập thành công trên WebView, ứng dụng sẽ tự động lấy Cookie phiên đăng nhập để phát trực tiếp các nguồn <b style="color:#a78bfa">1080p / 2160p</b> trên ExoPlayer.' +
    '</p>' +
'</div>';

function log(msg) {
    try { console.log("[Phimnet] " + msg); } catch (e) {}
}

function notifyUser(msg) {
    try {
        if (typeof toast === "function") toast(msg);
    } catch (e) {}
}

// =============================================================================
// COOKIE NATIVE (Giống Xem20)
// =============================================================================

var BLANK_VIDEO = "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4";

function _getNativeCookie() {
    try {
        if (typeof getCookie === "function") {
            var ck = getCookie(BASEURL);
            if (!ck || String(ck).trim().length === 0) {
                ck = getCookie(BASEURL + "/vi/");
            }
            if (!ck || String(ck).trim().length === 0) {
                ck = getCookie(BASEURL + "/");
            }
            if (ck && String(ck).trim().length > 0) {
                return String(ck).trim();
            }
        }
    } catch (e) {
        log("getCookie err: " + e);
    }
    return "";
}

function _hasSessionCookieStr(ck) {
    if (!ck) return false;
    // Bỏ qua các cookie phụ luôn có ở khách chưa đăng nhập (phimnet_locale, phimnet_oauth)
    var cleaned = String(ck)
        .replace(/phimnet_locale=[^;]+;?\s*/gi, "")
        .replace(/phimnet_oauth=[^;]+;?\s*/gi, "")
        .replace(/_ga[^=]*=[^;]+;?\s*/gi, "")
        .trim();
    return cleaned.length > 3 && cleaned.indexOf("=") !== -1;
}

var isLogin = false;
var activePopupHtml = POPUP_HTML;

function _checkLoginState(htmlSample) {
    var ck = _getNativeCookie();
    if (htmlSample) {
        var s = String(htmlSample);
        if (s.indexOf("user-chip") !== -1 || (s.indexOf("site-header") !== -1 && s.indexOf("/auth/google/start") === -1)) {
            isLogin = true;
            activePopupHtml = "";
            return true;
        }
        if (s.indexOf("/auth/google/start") !== -1 && !_hasSessionCookieStr(ck)) {
            isLogin = false;
            activePopupHtml = POPUP_HTML;
            return false;
        }
    }
    if (_hasSessionCookieStr(ck)) {
        try {
            if (typeof httpRequest === "function") {
                var meRes = httpRequest(API + "/tv/v1/me", {
                    method: "GET",
                    headers: { "User-Agent": UA, "Cookie": ck }
                });
                if (meRes && meRes.body && String(meRes.body).indexOf('"signed_in":true') !== -1) {
                    isLogin = true;
                    activePopupHtml = "";
                    return true;
                }
            }
        } catch (eMe) {}
    }
    return isLogin;
}

// Kiểm tra nhanh lúc nạp plugin giống Xem20
try {
    var initCk = _getNativeCookie();
    var initHeaders = { "User-Agent": UA };
    if (initCk) initHeaders["Cookie"] = initCk;
    if (typeof httpRequest === "function") {
        var initRes = httpRequest(API + "/tv/v1/me", { method: "GET", headers: initHeaders });
        if (initRes && initRes.body && String(initRes.body).indexOf('"signed_in":true') !== -1) {
            isLogin = true;
            activePopupHtml = "";
            log("Đã đăng nhập Phimnet");
        } else {
            isLogin = false;
            activePopupHtml = POPUP_HTML;
            log("Chưa đăng nhập Phimnet");
        }
    }
} catch (eInit) {}

// =============================================================================
// HELPERS CHUNG
// =============================================================================

function decodeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&quot;/g, '"')
        .replace(/&#34;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
}

function stripTags(str) {
    if (!str) return "";
    return decodeHtml(String(str).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
}

function getPage(filtersJson, apiUrl) {
    try {
        var f = JSON.parse(filtersJson || "{}");
        if (f && f.page) {
            var p = parseInt(f.page, 10);
            if (p > 0) return p;
        }
    } catch (e) {}
    try {
        var m = String(apiUrl || "").match(/[?&]page=([0-9]+)/);
        if (m && m[1]) return parseInt(m[1], 10) || 1;
    } catch (e2) {}
    return 1;
}

function getPipeData(apiUrl) {
    if (!apiUrl) return "";
    var s = String(apiUrl);
    var i = s.indexOf("|");
    if (i < 0) return "";
    var sub = s.substring(i + 1).replace(/^\s+/, "");
    if (sub.toLowerCase().indexOf("data:") === 0) {
        sub = sub.substring(5);
    }
    return sub;
}

// =============================================================================
// 1. CONFIG & METADATA
// =============================================================================

function manifest() {
    _checkLoginState();
    return {
        id: "phimnet",
        name: "Phimnet",
        version: "1.2.1",
        author: "alokillgtv",
        description: "Xem phim lẻ, phim bộ Vietsub tại phimnet.online (Đăng nhập để mở khóa 1080p & Phim bộ)",
        info: "Phim lẻ 720p xem miễn phí ngay. Để xem chất lượng 1080p Full HD và các tập Phim bộ (chỉ có 1080p), hãy vào cài đặt plugin nhấn Đăng nhập bằng tài khoản Google trên WebView.",
        baseUrl: BASEURL + "/vi/link",
        loginUrl: BASEURL + "/auth/google/start?next=%2Fvi%2F",
        fallbackUrls: ["https://phimnet.online"],
        referrer: BASEURL + "/",
        imageReferer: BASEURL + "/",
        iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/icon/phimnet.png",
        isEnabled: true,
        isAdult: false,
        debug: false,
        adblock: true,
        layoutType: "VERTICAL",
        type: "MOVIE",
        playerType: "exoplayer",
        subtitleCat: false,
        popup_html: activePopupHtml
    };
}

function getManifest() {
    return JSON.stringify(manifest());
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "subtitle=vi", title: "Phim Lẻ Vietsub Mới", type: "Grid" }
    ]);
}

function getLISTmenu() {
    return JSON.stringify([
        { link: "type=movie", name: "Phim lẻ" },
        { link: "type=tv", name: "Phim bộ" },
        { link: "subtitle=vi", name: "Vietsub mới" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim Lẻ Vietsub", slug: "subtitle=vi" },
        { name: "Phim Lẻ", slug: "type=movie" },
        { name: "Phim Bộ", slug: "type=tv" },
        { name: "Hành Động", slug: "genre=28" },
        { name: "Phiêu Lưu", slug: "genre=12" },
        { name: "Gây Cấn", slug: "genre=53" },
        { name: "Hình Sự", slug: "genre=80" },
        { name: "Kinh Dị", slug: "genre=27" },
        { name: "Khoa Học Viễn Tưởng", slug: "genre=878" },
        { name: "Hoạt Hình", slug: "genre=16" },
        { name: "Hài", slug: "genre=35" },
        { name: "Chính Kịch", slug: "genre=18" },
        { name: "Lãng Mạn", slug: "genre=10749" },
        { name: "Gia Đình", slug: "genre=10751" },
        { name: "Giả Tưởng", slug: "genre=14" },
        { name: "Bí Ẩn", slug: "genre=9648" },
        { name: "Chiến Tranh", slug: "genre=10752" },
        { name: "Lịch Sử", slug: "genre=36" },
        { name: "Tài Liệu", slug: "genre=99" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        category: [
            { name: "Hành Động", value: "28" },
            { name: "Phiêu Lưu", value: "12" },
            { name: "Gây Cấn", value: "53" },
            { name: "Hình Sự", value: "80" },
            { name: "Kinh Dị", value: "27" },
            { name: "Khoa Học Viễn Tưởng", value: "878" },
            { name: "Hoạt Hình", value: "16" },
            { name: "Hài", value: "35" },
            { name: "Chính Kịch", value: "18" },
            { name: "Lãng Mạn", value: "10749" },
            { name: "Gia Đình", value: "10751" },
            { name: "Giả Tưởng", value: "14" },
            { name: "Bí Ẩn", value: "9648" },
            { name: "Chiến Tranh", value: "10752" },
            { name: "Lịch Sử", value: "36" },
            { name: "Tài Liệu", value: "99" }
        ]
    });
}

// =============================================================================
// 2. URL GENERATORS
// =============================================================================

function getUrlList(slug, filtersJson) {
    var s = String(slug || "").trim();
    if (s.indexOf("http") === 0) return s;

    var page = getPage(filtersJson, "");
    var cat = "";
    try {
        var f = JSON.parse(filtersJson || "{}");
        if (f && f.category) cat = String(f.category);
    } catch (e) {}

    var params = [];
    if (cat) {
        params.push("genre=" + encodeURIComponent(cat));
    } else if (s && s !== "__home__" && s !== "home") {
        s = s.replace(/^\/?vi\/?\??/, "");
        if (s.indexOf("=") >= 0) {
            params.push(s);
        } else if (/^[0-9]+$/.test(s)) {
            params.push("genre=" + s);
        }
    }

    if (page > 1) {
        params.push("page=" + page);
    }

    return BASEURL + "/vi/" + (params.length ? "?" + params.join("&") : "");
}

function getUrlSearch(keyword, filtersJson) {
    var page = getPage(filtersJson, "");
    var kw = String(keyword || "").trim();
    var url = BASEURL + "/vi/?q=" + encodeURIComponent(kw);
    if (page > 1) url += "&page=" + page;
    return url;
}

function getUrlDetail(slug, datasend) {
    if (!slug) return "";
    var s = String(slug).trim();

    if (s.indexOf("http://") === 0 || s.indexOf("https://") === 0) {
        return s;
    }

    if (s.indexOf("PN|") === 0 || s.indexOf("PNPRE|") === 0) {
        var parts = s.split("|");
        var vId = parts[1] || "";
        return BASEURL + "/vi/|data:vid=" + vId;
    }
    if (/^[0-9]+$/.test(s)) {
        return BASEURL + "/vi/|data:vid=" + s;
    }

    if (s.charAt(0) === "/") {
        return BASEURL + s;
    }

    return BASEURL + "/vi/titles/" + encodeURIComponent(s);
}

function getUrlCategories() { return BASEURL + "/vi/"; }
function getUrlCountries() { return BASEURL + "/vi/"; }
function getUrlYears() { return BASEURL + "/vi/"; }

// =============================================================================
// 3. HELPERS CHO STREAM & SUBTITLES (CÓ DÙNG COOKIE NATIVE)
// =============================================================================

function extractJsonAttr(html, attrName) {
    if (!html) return [];
    try {
        var re1 = new RegExp(attrName + '="([^"]+)"', "i");
        var m1 = html.match(re1);
        if (m1 && m1[1]) {
            return JSON.parse(decodeHtml(m1[1]));
        }
    } catch (e) {}
    try {
        var re2 = new RegExp(attrName + "='([^']+)'", "i");
        var m2 = html.match(re2);
        if (m2 && m2[1]) {
            return JSON.parse(decodeHtml(m2[1]));
        }
    } catch (e2) {}
    return [];
}

function extractDataVideos(html) {
    var list = extractJsonAttr(html, "data-videos");
    return Array.isArray(list) ? list : [];
}

function extractDataSubs(html) {
    var list = extractJsonAttr(html, "data-subs");
    if (!Array.isArray(list)) return [];
    var subs = [];
    for (var i = 0; i < list.length; i++) {
        var s = list[i];
        if (!s || !s.id) continue;
        var langCode = String(s.language || "vi").toLowerCase();
        var label = langCode === "vi" ? "Tiếng Việt" : langCode.toUpperCase();
        if (s.name) label += " (" + s.name + ")";
        subs.push({
            lang: label,
            url: API + "/subtitles/" + s.id + "/file#.vtt"
        });
    }
    return subs;
}

function extractMeta(html, prop) {
    if (!html) return "";
    try {
        var re1 = new RegExp('<meta[^>]+property=["\']' + prop + '["\'][^>]+content=["\']([^"\']+)["\']', "i");
        var m1 = html.match(re1);
        if (m1 && m1[1]) return decodeHtml(m1[1]);
        var re2 = new RegExp('<meta[^>]+name=["\']' + prop + '["\'][^>]+content=["\']([^"\']+)["\']', "i");
        var m2 = html.match(re2);
        if (m2 && m2[1]) return decodeHtml(m2[1]);
    } catch (e) {}
    return "";
}

function formatSize(bytes) {
    var b = Number(bytes) || 0;
    if (b <= 0) return "";
    var gb = b / (1024 * 1024 * 1024);
    if (gb >= 1) return gb.toFixed(1) + "GB";
    var mb = b / (1024 * 1024);
    return Math.round(mb) + "MB";
}

function fetchSync(url, options) {
    var ck = _getNativeCookie();
    var headers = {
        "User-Agent": UA,
        "Referer": BASEURL + "/",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8"
    };
    if (ck) headers["Cookie"] = ck;

    var opts = options || { method: "GET", headers: headers };
    if (!opts.headers) opts.headers = headers;
    else if (ck && !opts.headers["Cookie"]) opts.headers["Cookie"] = ck;

    try {
        if (typeof httpRequest === "function") {
            var r = httpRequest(url, opts);
            if (r) {
                var b = r.body || (typeof r.text === "function" ? r.text() : "");
                return { status: r.status || 200, headers: r.headers || {}, body: String(b || "") };
            }
        }
    } catch (e) {
        log("httpRequest err: " + e);
    }
    try {
        if (typeof fetch === "function") {
            var r2 = fetch(url, opts);
            if (r2) {
                var b2 = r2.body;
                if (!b2 && typeof r2.text === "function") {
                    try { b2 = r2.text(); } catch (e3) {}
                }
                return { status: r2.status || 200, headers: r2.headers || {}, body: String(b2 || "") };
            }
        }
    } catch (e2) {
        log("fetch err: " + e2);
    }
    return { status: 0, headers: {}, body: "" };
}

function detectStreamMimeAndWarm(streamUrl) {
    var mime = "video/mp4";
    try {
        var probe = fetchSync(streamUrl, {
            method: "GET",
            headers: {
                "Range": "bytes=0-4095",
                "User-Agent": UA,
                "Referer": BASEURL + "/",
                "Origin": BASEURL
            }
        });
        if (probe) {
            var h = probe.headers || {};
            var ct = String(h["content-type"] || h["Content-Type"] || "").toLowerCase();
            var sample = String(probe.body || "").slice(0, 128).toLowerCase();
            if (ct.indexOf("matroska") !== -1 || sample.indexOf("matroska") !== -1) {
                mime = "video/x-matroska";
            } else if (ct.indexOf("webm") !== -1 || sample.indexOf("webm") !== -1) {
                mime = "video/webm";
            }
            if (probe.status >= 400) {
                return { ok: false, mimeType: mime };
            }
        }
    } catch (e) {
        log("probe err: " + e);
    }
    return { ok: true, mimeType: mime };
}

function prepareStream(videoId) {
    try {
        var vid = String(videoId || "").replace(/[^0-9]/g, "");
        if (!vid) return { url: "", mimeType: "video/mp4", status: 0, error: "" };

        var ck = _getNativeCookie();
        var reqHeaders = {
            "Content-Type": "application/json",
            "X-Phimnet-Locale": LOCALE,
            "User-Agent": UA,
            "Referer": BASEURL + "/",
            "Origin": BASEURL,
            "Accept": "application/json"
        };
        if (ck) {
            reqHeaders["Cookie"] = ck;
            log("prepareStream vid=" + vid + " (có Cookie len=" + ck.length + ")");
        } else {
            log("prepareStream vid=" + vid + " (không có Cookie)");
        }

        var res = fetchSync(API + "/sources/" + vid + "/prepare", {
            method: "POST",
            headers: reqHeaders,
            body: "{}"
        });

        if (!res || !res.body) return { url: "", mimeType: "video/mp4", status: res ? res.status : 0, error: "" };

        var data = {};
        try { data = JSON.parse(res.body); } catch (eJson) {}

        if (data && data.infoHash) {
            var streamer = String(data.streamerPublicURL || "https://stream.phimnet.online").replace(/\/+$/, "");
            var fileIndex = typeof data.fileIndex === "number" ? data.fileIndex : 0;
            // Bắt buộc thêm ?raw=1 để lấy trực tiếp file gốc (MP4/MKV) với HTTP 206 Range trong ~250ms,
            // tránh bị server giữ kết nối chạy FFmpeg remux làm ExoPlayer quay vòng mãi
            var streamUrl = streamer + "/api/torrents/" + data.infoHash + "/files/" + fileIndex + "/stream?raw=1";

            // Gửi heartbeat giữ phiên torrent active trên server
            try {
                var hbHeaders = {
                    "Content-Type": "application/json",
                    "User-Agent": UA,
                    "Referer": BASEURL + "/",
                    "Origin": BASEURL
                };
                if (ck) hbHeaders["Cookie"] = ck;
                fetchSync(API + "/watch/heartbeat", {
                    method: "POST",
                    headers: hbHeaders,
                    body: JSON.stringify({ infoHash: data.infoHash, sessionID: "vax-" + Date.now() })
                });
            } catch (eHb) {}

            // Đánh thức stats torrent
            for (var sTry = 0; sTry < 3; sTry++) {
                try {
                    var stRes = fetchSync(streamer + "/api/torrents/" + data.infoHash + "/stats", {
                        method: "GET",
                        headers: { "User-Agent": UA, "Referer": BASEURL + "/" }
                    });
                    if (stRes && stRes.body) {
                        var stData = JSON.parse(stRes.body);
                        if (stData && stData.totalBytes > 0) break;
                    }
                } catch (eStats) {}
            }

            // Mồi 4KB đầu tiên và tự động phát hiện định dạng thực tế (video/x-matroska cho 1080p MKV hoặc video/mp4)
            var probeInfo = detectStreamMimeAndWarm(streamUrl);
            log("Stream ready: " + streamUrl + " | mime=" + probeInfo.mimeType);

            return { url: streamUrl, mimeType: probeInfo.mimeType, status: 200, error: "" };
        }

        return {
            url: "",
            mimeType: "video/mp4",
            status: res.status || 400,
            error: data && data.error ? String(data.error) : ""
        };
    } catch (e) {
        log("prepareStream error: " + e);
        return { url: "", mimeType: "video/mp4", status: 0, error: String(e) };
    }
}

// =============================================================================
// 4. PARSERS (LIST, DETAIL, STREAM)
// =============================================================================

function parseListResponse(html, apiUrl) {
    var items = [];
    var seen = {};
    var body = String(html || "");
    _checkLoginState(body);

    try {
        var re = /<button[^>]+data-bm-toggle[^>]*>/gi;
        var m;
        while ((m = re.exec(body)) !== null) {
            var tag = m[0];
            var hrefM = tag.match(/data-bm-href="([^"]+)"/i);
            var titleM = tag.match(/data-bm-title="([^"]+)"/i);
            var origM = tag.match(/data-bm-original="([^"]*)"/i);
            var posterM = tag.match(/data-bm-poster="([^"]+)"/i);
            var yearM = tag.match(/data-bm-year="([^"]*)"/i);
            var typeM = tag.match(/data-bm-type="([^"]*)"/i);
            var subM = tag.match(/data-bm-subtitle="([^"]*)"/i);
            var scoreM = tag.match(/data-bm-score="([^"]*)"/i);

            if (!hrefM || !titleM) continue;
            var slug = hrefM[1].replace(/^.*\/titles\//, "").replace(/\?.*$/, "").trim();
            if (!slug || seen[slug]) continue;
            seen[slug] = true;

            var year = yearM && yearM[1] ? parseInt(yearM[1], 10) || 0 : 0;
            var isTv = typeM && typeM[1] === "tv";
            var hasSub = subM && subM[1] === "true";
            var score = scoreM && scoreM[1] ? scoreM[1] : "";

            items.push({
                id: slug,
                title: decodeHtml(titleM[1]),
                origin_name: origM && origM[1] ? decodeHtml(origM[1]) : "",
                posterUrl: posterM && posterM[1] ? decodeHtml(posterM[1]) : "",
                backdropUrl: posterM && posterM[1] ? decodeHtml(posterM[1]).replace("/w342/", "/w780/") : "",
                year: year,
                quality: score ? ("TMDB " + score) : "HD",
                lang: hasSub ? "Vietsub" : "",
                episode_current: isTv ? "Phim bộ" : "Full"
            });
        }
    } catch (e) {
        log("parseListResponse err: " + e);
    }

    var page = getPage(null, apiUrl);
    var totalPages = page;
    try {
        var pageMatches = body.match(/[?&]page=([0-9]+)/g) || [];
        for (var i = 0; i < pageMatches.length; i++) {
            var pNum = parseInt(pageMatches[i].replace(/[^0-9]/g, ""), 10);
            if (pNum > totalPages) totalPages = pNum;
        }
    } catch (e2) {}

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: items.length,
            itemsPerPage: 24
        }
    });
}

function parseSearchResponse(html, apiUrl) {
    return parseListResponse(html, apiUrl);
}

function buildSourceServers(videos, watchPageUrl, poster, loggedIn) {
    var servers = [];
    if (!Array.isArray(videos) || videos.length === 0) return servers;

    var cleanWatchUrl = String(watchPageUrl || "").split("|")[0];
    if (!cleanWatchUrl || cleanWatchUrl.indexOf("http") !== 0) {
        cleanWatchUrl = BASEURL + "/vi/";
    }

    var freeEps = [];
    var memberEps = [];

    for (var i = 0; i < videos.length; i++) {
        var v = videos[i];
        if (!v || v.id === undefined || v.id === null) continue;

        var resLabel = v.resolution || "HD";
        var sizeLabel = formatSize(v.file_size);
        var lockType = String(v.lock || "");
        var isFree = (!lockType && v.available !== false);

        if (isFree) {
            var freeName = resLabel + (sizeLabel ? " (" + sizeLabel + ")" : "");
            if (freeEps.length > 0) freeName += " #" + (freeEps.length + 1);
            freeEps.push({
                name: freeName,
                slug: "free-" + v.id,
                thumb: poster || "",
                id: cleanWatchUrl + "|data:vid=" + v.id
            });
        } else {
            // Nguồn 1080p / 2160p cần đăng nhập (hoặc gói nâng cấp)
            if (resLabel === "2160p" && v.available === false && lockType !== "member") continue;
            var vipName = resLabel + (sizeLabel ? " (" + sizeLabel + ")" : "");
            if (!loggedIn) vipName += " [Cần Đ.Nhập]";
            if (memberEps.length > 0) vipName += " #" + (memberEps.length + 1);
            memberEps.push({
                name: vipName,
                slug: "vip-" + v.id,
                thumb: poster || "",
                id: cleanWatchUrl + "|data:vid=" + v.id
            });
        }
    }

    // Nếu đã đăng nhập, đưa Server 1080p lên đầu để tiện chọn
    if (loggedIn && memberEps.length > 0) {
        servers.push({ name: "Phimnet VIP (1080p/4K)", episodes: memberEps });
    }
    if (freeEps.length > 0) {
        servers.push({ name: "Phimnet Miễn Phí (720p)", episodes: freeEps });
    }
    if (!loggedIn && memberEps.length > 0) {
        servers.push({ name: "Phimnet 1080p (Đăng nhập WebView để mở)", episodes: memberEps });
    }

    return servers;
}

function parseMovieDetail(html, apiUrl, datasend) {
    var body = String(html || "");
    var currentUrl = String(apiUrl || "").split("|")[0];
    var loggedIn = _checkLoginState(body);

    var title = extractMeta(body, "og:title") || "";
    title = title.replace(/\s*\([0-9]{4}\)\s*$/, "").trim();
    if (!title) {
        var h1M = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        if (h1M && h1M[1]) {
            title = stripTags(h1M[1].replace(/<span class="year">[\s\S]*?<\/span>/i, ""));
        }
    }

    var origTitle = "";
    var origM = body.match(/<p class="original-title">([\s\S]*?)<\/p>/i);
    if (origM && origM[1]) origTitle = stripTags(origM[1]);

    var backdrop = extractMeta(body, "og:image") || "";
    var poster = "";
    var posterM = body.match(/<div class="detail-poster">\s*<img[^>]+src="([^"]+)"/i) || body.match(/data-bm-poster="([^"]+)"/i);
    if (posterM && posterM[1]) poster = decodeHtml(posterM[1]);
    if (!poster) poster = backdrop;
    if (!backdrop) backdrop = poster;

    var desc = "";
    var overM = body.match(/<p class="overview">([\s\S]*?)<\/p>/i);
    if (overM && overM[1]) desc = stripTags(overM[1]);
    if (!desc) desc = extractMeta(body, "og:description") || extractMeta(body, "description") || "";

    var year = 0;
    var yearM = body.match(/data-bm-year="([0-9]{4})"/i) || body.match(/<span class="year">\((\d{4})\)<\/span>/i);
    if (yearM && yearM[1]) year = parseInt(yearM[1], 10) || 0;

    var rating = 0;
    var scoreM = body.match(/data-bm-score="([0-9.]+)"/i);
    if (scoreM && scoreM[1]) rating = parseFloat(scoreM[1]) || 0;

    var genres = [];
    var genreRe = /<span class="genre-chip">([\s\S]*?)<\/span>/gi;
    var gm;
    while ((gm = genreRe.exec(body)) !== null) {
        var gName = stripTags(gm[1]);
        if (gName) genres.push(gName);
    }

    var servers = [];

    // Trường hợp 1: Trang hiện tại đã là trang xem (/watch/movie/... hoặc /watch/episode/...)
    var videos = extractDataVideos(body);
    if (videos.length > 0) {
        servers = buildSourceServers(videos, currentUrl, poster, loggedIn);
    }

    // Trường hợp 2: Trang /vi/titles/... của Phim Bộ (có <section class="seasons">)
    if (servers.length === 0 && body.indexOf('class="seasons"') >= 0) {
        var seasonRe = /<details class="season"[^>]*>([\s\S]*?)<\/details>/gi;
        var sm;
        var sIdx = 1;
        var freeSeasons = [];
        var memberSeasons = [];
        var specialSeasons = [];
        var emptySeasons = [];

        while ((sm = seasonRe.exec(body)) !== null) {
            var sBlock = sm[1];
            var sNameM = sBlock.match(/<summary class="season-head">\s*<span>([\s\S]*?)<\/span>/i);
            var sName = sNameM && sNameM[1] ? stripTags(sNameM[1]) : ("Phần " + sIdx);
            sIdx++;

            var sEps = [];
            var firstEpId = "";
            var epRe = /<div class="episode">[\s\S]*?<span class="ep-num">([\s\S]*?)<\/span>[\s\S]*?<div class="ep-title">([\s\S]*?)<\/div>[\s\S]*?<a[^>]+href="([^"]+)"/gi;
            var em;
            while ((em = epRe.exec(sBlock)) !== null) {
                var epNum = stripTags(em[1]);
                var epTitle = stripTags(em[2]);
                var epHref = decodeHtml(em[3]);
                var fullEpUrl = epHref.indexOf("http") === 0 ? epHref : (BASEURL + epHref);
                var epSlug = epHref.replace(/^.*\/episode\//, "").replace(/[^a-zA-Z0-9_-]/g, "") || ("ep-" + epNum);
                if (!firstEpId) {
                    var mEpId = epHref.match(/-([0-9]+)$/);
                    if (mEpId && mEpId[1]) firstEpId = mEpId[1];
                }
                sEps.push({
                    name: "Tập " + epNum + (epTitle ? ": " + epTitle : ""),
                    slug: epSlug,
                    thumb: poster,
                    id: fullEpUrl
                });
            }

            if (sEps.length > 0) {
                var isSpecial = /special|phần 0|mùa 0|season 0/i.test(sName);
                var hasAnyVideo = true;
                var hasFree720 = false;

                if (firstEpId) {
                    try {
                        var checkEpRes = fetchSync(API + "/tv/v1/watch/episode/" + firstEpId);
                        var checkEpData = checkEpRes && checkEpRes.body ? JSON.parse(checkEpRes.body) : null;
                        if (checkEpData && Array.isArray(checkEpData.videos)) {
                            var epVids = checkEpData.videos;
                            hasAnyVideo = epVids.length > 0;
                            for (var vi = 0; vi < epVids.length; vi++) {
                                if (epVids[vi] && (!epVids[vi].lock || epVids[vi].lock === "") && epVids[vi].available !== false) {
                                    hasFree720 = true;
                                    break;
                                }
                            }
                        }
                    } catch (eCheckEp) {}
                }

                if (!hasAnyVideo) {
                    emptySeasons.push({ name: sName + " (Chưa có nguồn)", episodes: sEps });
                } else if (hasFree720) {
                    freeSeasons.push({ name: sName + " (720p/1080p)", episodes: sEps });
                } else if (isSpecial) {
                    specialSeasons.push({ name: sName + (!loggedIn ? " [1080p - Cần Đ.Nhập]" : " (1080p)"), episodes: sEps });
                } else {
                    memberSeasons.push({ name: sName + (!loggedIn ? " [1080p - Cần Đ.Nhập]" : " (1080p)"), episodes: sEps });
                }
            }
        }

        // Nếu đã đăng nhập: xếp Season 1, 2... theo thứ tự bình thường, Specials ở dưới
        // Nếu chưa đăng nhập: ưu tiên Season có 720p miễn phí lên đầu tiên để bấm là xem được ngay
        if (loggedIn) {
            servers = memberSeasons.concat(freeSeasons).concat(specialSeasons);
        } else {
            servers = freeSeasons.concat(memberSeasons).concat(specialSeasons);
        }
        // Chỉ giữ emptySeasons nếu toàn bộ các mùa đều chưa có nguồn
        if (servers.length === 0 && emptySeasons.length > 0) {
            servers = emptySeasons;
        }
    }

    // Trường hợp 3: Trang /vi/titles/... của Phim Lẻ
    if (servers.length === 0) {
        var watchBtnM = body.match(/href="(\/[a-z-]+\/watch\/movie\/[^"]+)"/i);
        var watchUrl = "";
        if (watchBtnM && watchBtnM[1]) {
            watchUrl = BASEURL + decodeHtml(watchBtnM[1]);
        } else if (currentUrl.indexOf("/titles/") >= 0) {
            watchUrl = currentUrl.replace("/titles/", "/watch/movie/");
        }

        if (watchUrl) {
            var watchRes = fetchSync(watchUrl);
            var watchHtml = watchRes.body || "";
            if (watchHtml) loggedIn = _checkLoginState(watchHtml);
            var watchVideos = extractDataVideos(watchHtml);
            servers = buildSourceServers(watchVideos, watchUrl, poster, loggedIn);

            if (servers.length === 0) {
                servers.push({
                    name: "Phimnet",
                    episodes: [{
                        name: "Full HD",
                        slug: "full",
                        thumb: poster,
                        id: watchUrl
                    }]
                });
            }
        }
    }

    // Nếu chưa đăng nhập, thêm dòng nhắc đăng nhập 1080p giống Xem20 ở cuối danh sách server
    if (!loggedIn) {
        servers.push({
            name: "Chưa đăng nhập 1080p (Vào cài đặt Plugin -> Đăng nhập)",
            episodes: [{
                name: "Vào phần cài đặt plugin để đăng nhập lấy 1080p",
                slug: "login-guide",
                thumb: poster,
                id: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4"
            }]
        });
    }

    var movieId = "";
    var slugM = currentUrl.match(/\/(?:titles|movie)\/([^/?#]+)/);
    if (slugM && slugM[1]) movieId = slugM[1];

    return JSON.stringify({
        id: movieId,
        title: title || "Phimnet",
        origin_name: origTitle,
        posterUrl: poster,
        backdropUrl: backdrop,
        description: desc,
        year: year,
        rating: rating,
        quality: loggedIn ? "1080p VIP" : "720p HD",
        lang: "Vietsub",
        category: genres.join(", "),
        genres: genres.join(", "),
        servers: servers
    });
}

function parseDetailResponse(html, apiUrl, datasend) {
    var body = String(html || "");
    var rawUrl = String(apiUrl || "");
    var cleanUrl = rawUrl.split("|")[0];
    var pipeData = String(datasend || getPipeData(rawUrl) || "");
    var loggedIn = _checkLoginState(body);

    // Nếu bấm vào tập thông báo hướng dẫn đăng nhập
    if (cleanUrl.indexOf("blankvd.mp4") !== -1) {
        notifyUser("Vui lòng vào phần Cài đặt Plugin -> nhấn Đăng nhập trên WebView để mở khóa nguồn 1080p & Phim bộ!");
        return JSON.stringify({
            url: BLANK_VIDEO,
            isEmbed: false,
            mimeType: "video/mp4",
            headers: {},
            subtitles: []
        });
    }

    var vid = "";
    var mVid = pipeData.match(/vid=([0-9]+)/i) || rawUrl.match(/vid=([0-9]+)/i) || rawUrl.match(/PN(?:PRE)?\|([0-9]+)/i);
    if (mVid && mVid[1]) {
        vid = mVid[1];
    }

    var videos = extractDataVideos(body);
    var subtitles = extractDataSubs(body);

    // Nếu là tập Phim bộ (/watch/episode/...-{epId}) mà HTML chưa có data-videos, gọi trực tiếp API episode
    var epIdMatch = cleanUrl.match(/\/episode\/[^/?#]*?-([0-9]+)(?:[/?#]|$)/i) || cleanUrl.match(/\/episode\/([0-9]+)(?:[/?#]|$)/i);
    if (epIdMatch && epIdMatch[1] && videos.length === 0) {
        try {
            var epRes = fetchSync(API + "/tv/v1/watch/episode/" + epIdMatch[1]);
            var epData = epRes && epRes.body ? JSON.parse(epRes.body) : null;
            if (epData) {
                if (Array.isArray(epData.videos) && epData.videos.length > 0) {
                    videos = epData.videos;
                }
                if (subtitles.length === 0 && Array.isArray(epData.subtitles)) {
                    for (var sIdx = 0; sIdx < epData.subtitles.length; sIdx++) {
                        var subItem = epData.subtitles[sIdx];
                        if (subItem && (subItem.url || subItem.id)) {
                            var sUrl = subItem.url ? String(subItem.url) : (API + "/subtitles/" + subItem.id + "/file#.vtt");
                            if (sUrl.charAt(0) === "/") sUrl = BASEURL + sUrl;
                            var isVi = subItem.lang === "vi" || subItem.language === "vi" || /viet|việt/i.test(subItem.label || subItem.name || "");
                            subtitles.push({
                                url: sUrl,
                                lang: subItem.label || (isVi ? "Tiếng Việt" : (subItem.lang || subItem.language || "Sub"))
                            });
                        }
                    }
                }
            }
        } catch (eEpApi) {}
    }

    // Nếu tập này hoàn toàn chưa có nguồn video trên Phimnet.online
    if (!vid && videos.length === 0) {
        notifyUser("Tập phim này hiện chưa có nguồn video trên Phimnet.online!");
        return JSON.stringify({
            url: BLANK_VIDEO,
            isEmbed: false,
            mimeType: "video/mp4",
            headers: {},
            subtitles: subtitles
        });
    }

    // Nếu chưa chỉ định vid (như khi chọn tập Phim bộ):
    // - Đã đăng nhập: ưu tiên chọn 1080p trước, rồi tới 720p
    // - Chưa đăng nhập: ưu tiên chọn nguồn miễn phí (lock == "") trước
    if (!vid && videos.length > 0) {
        if (loggedIn) {
            for (var k = 0; k < videos.length; k++) {
                var vk = videos[k];
                if (vk && vk.id && vk.resolution === "1080p") {
                    vid = String(vk.id);
                    break;
                }
            }
        }
        if (!vid) {
            for (var i = 0; i < videos.length; i++) {
                var v = videos[i];
                if (v && v.id && (!v.lock || v.lock === "") && v.available !== false) {
                    vid = String(v.id);
                    break;
                }
            }
        }
        if (!vid && videos[0] && videos[0].id) {
            vid = String(videos[0].id);
        }
    }

    var needLogin401 = false;

    // Gọi prepareStream cho nguồn đã chọn
    if (vid) {
        var prep = prepareStream(vid);
        if (prep.url && prep.url.indexOf("http") === 0) {
            return JSON.stringify({
                url: prep.url,
                isEmbed: false,
                mimeType: prep.mimeType || "video/mp4",
                headers: {
                    "User-Agent": UA,
                    "Referer": BASEURL + "/",
                    "Origin": BASEURL
                },
                subtitles: subtitles
            });
        }

        if (prep.status === 401 || (prep.error && prep.error.indexOf("Đăng nhập") !== -1)) {
            needLogin401 = true;
        } else if (prep.status === 402) {
            notifyUser("Nguồn 4K yêu cầu nâng cấp tài khoản trên phimnet.online. Đang chuyển sang nguồn khả dụng...");
        }
    }

    // Fallback: thử lần lượt các nguồn còn lại trong danh sách (ưu tiên nguồn miễn phí 720p)
    if (videos.length > 0) {
        for (var j = 0; j < videos.length; j++) {
            var vj = videos[j];
            if (!vj || !vj.id || String(vj.id) === vid) continue;
            if (vj.lock && String(vj.lock) !== "" && !_hasSessionCookieStr(_getNativeCookie())) continue;
            if (vj.available === false && vj.lock !== "member") continue;

            var fbPrep = prepareStream(vj.id);
            if (fbPrep.url && fbPrep.url.indexOf("http") === 0) {
                if (needLogin401) {
                    notifyUser("Chưa đăng nhập 1080p! Đang tự động phát bản 720p miễn phí...");
                }
                return JSON.stringify({
                    url: fbPrep.url,
                    isEmbed: false,
                    mimeType: fbPrep.mimeType || "video/mp4",
                    headers: {
                        "User-Agent": UA,
                        "Referer": BASEURL + "/",
                        "Origin": BASEURL
                    },
                    subtitles: subtitles
                });
            }
        }
    }

    if (needLogin401) {
        notifyUser("Tập phim này chỉ có bản 1080p (yêu cầu đăng nhập). Vui lòng vào Cài đặt Plugin -> nhấn Đăng nhập trên WebView!");
    } else {
        notifyUser("Không thể khởi tạo luồng phát cho tập này. Vui lòng thử tập/nguồn khác!");
    }

    return JSON.stringify({
        url: BLANK_VIDEO,
        isEmbed: false,
        mimeType: "video/mp4",
        headers: {},
        subtitles: subtitles
    });
}

function parseCategoriesResponse(html, apiUrl) {
    return getPrimaryCategories();
}

function parseCountriesResponse(html, apiUrl) {
    return "[]";
}

function parseYearsResponse(html, apiUrl) {
    return "[]";
}

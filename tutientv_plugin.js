// ========================================================
// TUTIÊN TV VAAPP PLUGIN
// Chuyển hoá từ CloudStream TuTienTV.cs3 (recloudstream.TuTienTvProvider)
// API: https://api.tutien.com.vn | CDN: https://x3.tutien.com.vn | Site: https://tutien.com.vn
// ========================================================

var TT_SITE = "https://tutien.com.vn";
var TT_API = "https://api.tutien.com.vn";
var TT_CDN = "https://x3.tutien.com.vn";
var TT_IMG = "https://img.tutien.com.vn";
var TT_UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36";
var TT_PAGE_SIZE = 30;

function ttLog(msg) {
    try { console.log("[TuTienTV] " + msg); } catch (e) {}
}

function getManifest() {
    return JSON.stringify({
        id: "tutientv",
        name: "TuTiênTV",
        version: "1.0.1",
        author: "alokillgtv",
        description: "Phim tu tiên, huyền huyễn, tiên hiệp từ tutien.com.vn",
        baseUrl: TT_SITE,
        imageReferer: TT_SITE + "/",
        iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/icon/tutientv.png",
        isEnabled: true,
        isAdult: false,
        type: "MOVIE",
        playerType: "exoplayer",
        subtitleCat: false,
        adblock: true,
        debug: true
    });
}

// ========================================================
// HELPERS
// ========================================================

function ttHeaders() {
    return {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "vi-VN,vi;q=0.9",
        "User-Agent": TT_UA,
        "Origin": TT_SITE,
        "Referer": TT_SITE + "/"
    };
}

function ttGet(url) {
    if (typeof httpRequest !== "function") return "";
    try {
        var r = httpRequest(url, { method: "GET", headers: ttHeaders(), timeout: 20000 });
        if (r && (r.isSuccessful || r.ok) && r.body) return String(r.body);
        ttLog("get fail " + url + " status=" + (r && r.status));
    } catch (e) { ttLog("get err: " + e.message); }
    return "";
}

function ttJson(raw) {
    try { return JSON.parse(String(raw || "{}")); } catch (e) { return {}; }
}

function ttImg(path) {
    var p = String(path || "").trim();
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    return TT_IMG + (p.charAt(0) === "/" ? "" : "/") + p;
}

function ttAbsolute(base, rel) {
    var r = String(rel || "").trim();
    if (!r) return "";
    if (/^https?:\/\//i.test(r)) return r;
    if (r.indexOf("//") === 0) return "https:" + r;
    var origin = (String(base).match(/^(https?:\/\/[^\/]+)/i) || [])[1] || TT_CDN;
    if (r.charAt(0) === "/") return origin + r;
    var dir = String(base).replace(/[?#].*$/, "");
    dir = dir.substring(0, dir.lastIndexOf("/") + 1);
    return dir + r;
}

function ttFromNumber(n) {
    var v = Number(n);
    return isFinite(v) ? v : 0;
}

function ttPage(filtersJson) {
    try {
        var f = filtersJson && typeof filtersJson === "object" ? filtersJson : ttJson(filtersJson || "{}");
        var p = parseInt(f.page, 10) || parseInt(f.pageNumber, 10) || 1;
        return p > 0 ? p : 1;
    } catch (e) { return 1; }
}

function ttCategory(filtersJson) {
    try {
        var f = filtersJson && typeof filtersJson === "object" ? filtersJson : ttJson(filtersJson || "{}");
        var c = f.category;
        if (Array.isArray(c) && c.length) return c[0].slug || c[0];
        if (typeof c === "string") return c;
    } catch (e) {}
    return "";
}

// ========================================================
// HOME / CATEGORY
// ========================================================

var TT_GENRES = [
    "Linh Dị", "Huyền Huyễn", "Tiên Hiệp", "Cổ Trang", "Kiếm Hiệp",
    "Hài Hước", "Hiện Đại", "Trùng Sinh", "Xuyên Không", "Tu Tiên", "Đô Thị"
];

function getHomeSections() {
    return JSON.stringify([
        { slug: "ranking", title: "Xem nhiều tuần này", type: "Horizontal" },
        { slug: "genre:Huyền Huyễn", title: "Huyền Huyễn", type: "Horizontal" },
        { slug: "genre:Tiên Hiệp", title: "Tiên Hiệp", type: "Horizontal" },
        { slug: "newest", title: "Mới cập nhật", type: "Grid" }
    ]);
}

function getPrimaryCategories() {
    var out = [
        { name: "Mới cập nhật", slug: "newest" },
        { name: "Xem nhiều tuần này", slug: "ranking" }
    ];
    for (var i = 0; i < TT_GENRES.length; i++) {
        out.push({ name: TT_GENRES[i], slug: "genre:" + TT_GENRES[i] });
    }
    return JSON.stringify(out);
}

function getFilterConfig() { return JSON.stringify({}); }
function getUrlCategories() { return TT_SITE; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }
function parseCategoriesResponse() { return getPrimaryCategories(); }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

function getUrlList(slug, filtersJson) {
    var s = String(slug || "newest");
    return ttListUrl(s, ttPage(filtersJson));
}

function ttListUrl(slug, page) {
    var offset = (page - 1) * TT_PAGE_SIZE;
    if (slug === "newest" || slug === "home") {
        return TT_API + "/movies?page=" + page + "&sort=updated&limit=" + TT_PAGE_SIZE + "&offset=" + offset;
    }
    if (slug === "ranking") {
        return TT_API + "/rankings/views-weekly?limit=" + TT_PAGE_SIZE + "&offset=" + offset;
    }
    if (slug.indexOf("genre:") === 0) {
        var genre = encodeURIComponent(slug.substring(6));
        return TT_API + "/movies?page=" + page + "&sort=rating&genre=" + genre + "&limit=" + TT_PAGE_SIZE + "&offset=" + offset;
    }
    return TT_API + "/movies?page=" + page + "&sort=updated&limit=" + TT_PAGE_SIZE + "&offset=" + offset;
}

function getUrlSearch(keyword, filtersJson) {
    var q = encodeURIComponent(String(keyword || ""));
    return TT_API + "/search-movies?q=" + q;
}

function getUrlDetail(slug) {
    var s = String(slug || "").trim();
    if (!s) return "";
    if (s.indexOf("newest") === 0 || s.indexOf("ranking") === 0 || s.indexOf("genre:") === 0) {
        return ttListUrl(s, 1);
    }
    return TT_API + "/movie/" + encodeURIComponent(s);
}

// ========================================================
// PARSE
// ========================================================

function ttCard(m) {
    if (!m || !m.slug) return null;
    return {
        id: m.slug,
        title: m.title || m.slug,
        posterUrl: ttImg(m.thumbnailUrl2 || m.thumbnailUrl1),
        backdropUrl: ttImg(m.thumbnailUrl1 || m.thumbnailUrl2),
        description: m.description || "",
        quality: m.complete ? "Full" : "Đang chiếu",
        episode_current: m.episodeCount ? (m.episodeCount + " tập") : "",
        year: m.year ? String(m.year) : "",
        lang: "Vietsub"
    };
}

function ttListFrom(raw, slug) {
    var j = ttJson(raw);
    var list = [];
    if (Array.isArray(j)) list = j;
    else if (Array.isArray(j.data)) list = j.data;
    else if (j.data && Array.isArray(j.data.movies)) list = j.data.movies;
    else if (Array.isArray(j.movies)) list = j.movies;

    var items = [];
    for (var i = 0; i < list.length; i++) {
        var c = ttCard(list[i]);
        if (c) items.push(c);
    }
    var hasMore = items.length >= TT_PAGE_SIZE || list.length >= TT_PAGE_SIZE;
    var p = 1;
    var m = String(slug || "").match(/page=(\d+)/);
    if (m) p = parseInt(m[1], 10) || 1;
    return JSON.stringify({
        items: items,
        pagination: { currentPage: p, totalPages: hasMore ? p + 1 : p }
    });
}

function parseListResponse(raw, url) {
    try { return ttListFrom(raw, url); }
    catch (e) {
        ttLog("parseList err: " + e.message);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(raw, url) {
    try { return ttListFrom(raw, url); }
    catch (e) {
        ttLog("parseSearch err: " + e.message);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseMovieDetail(raw, url) {
    try {
        var j = ttJson(raw);
        var data = j.data || j;
        if (!data || !data.slug) {
            ttLog("detail thiếu dữ liệu slug=" + url);
            return JSON.stringify({ id: "", title: "", servers: [] });
        }
        var eps = Array.isArray(data.episodes) ? data.episodes : [];
        var out = [];
        for (var i = 0; i < eps.length; i++) {
            var ep = eps[i] || {};
            var num = ep.episodeNumber || ep.title || (i + 1);
            var ed = {
                seriesId: data.slug,
                episodeId: ep.uuid || "",
                index: ttFromNumber(num),
                m3u8Url2: ep.m3u8Url2 || "",
                m3u8Url: ep.m3u8Url || "",
                movieUuid: data.uuid || "",
                episodeUuid: ep.uuid || ""
            };
            out.push({
                id: data.slug + "#" + (ep.uuid || ("ep" + num)),
                slug: "tap-" + num,
                name: "Tập " + num,
                datasend: JSON.stringify(ed),
                thumb: ttImg(data.thumbnailUrl2 || data.thumbnailUrl1)
            });
        }
        // Sắp xếp tăng dần theo số tập
        out.sort(function (a, b) {
            var x = parseFloat(String(a.slug).replace("tap-", ""));
            var y = parseFloat(String(b.slug).replace("tap-", ""));
            if (isNaN(x)) x = 1e9;
            if (isNaN(y)) y = 1e9;
            return x - y;
        });
        ttLog("detail " + data.slug + " | episodes=" + out.length);
        return JSON.stringify({
            id: data.slug,
            title: data.title || data.slug,
            posterUrl: ttImg(data.thumbnailUrl2 || data.thumbnailUrl1),
            backdropUrl: ttImg(data.thumbnailUrl1 || data.thumbnailUrl2),
            description: data.description || "",
            quality: data.complete ? "Full" : "Đang chiếu",
            year: data.year ? String(data.year) : "",
            status: data.complete ? "Hoàn tất" : "Đang chiếu",
            lang: "Vietsub",
            servers: [{ name: "TuTiênTV", episodes: out }]
        });
    } catch (e) {
        ttLog("parseMovieDetail err: " + e.message);
        return JSON.stringify({ id: "", title: "", servers: [] });
    }
}

// ========================================================
// STREAM
// ========================================================

function ttPlayUrl(ed) {
    var u2 = String(ed.m3u8Url2 || "").trim();
    if (u2) return u2;
    var u1 = String(ed.m3u8Url || "").trim();
    if (u1) {
        if (/^https?:\/\//i.test(u1)) return u1;
        return TT_CDN + "/" + u1.replace(/^\/+/, "");
    }
    // Fallback: dựng từ slug phim + số tập
    var slug = String(ed.seriesId || "");
    if (slug && ed.index) {
        return TT_CDN + "/movie/" + slug.replace(/-/g, "") + "/" + ed.index + "/playlist.m3u8";
    }
    return "";
}

// Tách subtitle từ master m3u8: URI là playlist con trỏ tới file .vtt
function ttSubtitles(masterUrl, masterBody) {
    var subs = [];
    if (!masterBody || masterBody.indexOf("TYPE=SUBTITLES") < 0) return subs;
    var lines = String(masterBody).split(/\r?\n/);
    var re = /(?:LANGUAGE|NAME)="([^"]*)"/gi;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf("#EXT-X-MEDIA") < 0) continue;
        if (line.toUpperCase().indexOf("TYPE=SUBTITLES") < 0) continue;
        var uriM = line.match(/URI="([^"]+)"/i);
        if (!uriM) continue;
        var langM = line.match(/LANGUAGE="([^"]*)"/i);
        var nameM = line.match(/NAME="([^"]*)"/i);
        var lang = (langM && langM[1]) || "vie";
        var label = (nameM && nameM[1]) || lang;
        var subUrl = ttAbsolute(masterUrl, uriM[1]);
        // URI thường là playlist m3u8 con trỏ tới 1 file .vtt → resolve ra .vtt thật
        if (/\.m3u8(\?|#|$)/i.test(subUrl)) {
            var subBody = ttGet(subUrl);
            var vttRel = "";
            var subLines = String(subBody || "").split(/\r?\n/);
            for (var s = 0; s < subLines.length; s++) {
                var sl = subLines[s].trim();
                if (sl && sl.charAt(0) !== "#") { vttRel = sl; break; }
            }
            if (vttRel) {
                var vttUrl = ttAbsolute(subUrl, vttRel);
                if (/\.vtt(\?|#|$)/i.test(vttUrl)) subUrl = vttUrl;
            }
        }
        subs.push({ lang: lang, language: lang, label: label, url: subUrl });
    }
    return subs;
}

function parseDetailResponse(raw, url, datasend) {
    try {
        var d = datasend;
        if (typeof d === "string") { try { d = JSON.parse(d); } catch (e) { d = null; } }
        if (!d || typeof d !== "object") d = {};

        // Parse từ id dạng "slug#uuid" nếu thiếu datasend
        if (!d.m3u8Url2 && !d.m3u8Url) {
            var idStr = String(url || "");
            var parts = idStr.split("#");
            if (parts.length === 2) {
                d.seriesId = parts[0];
                d.episodeUuid = parts[1];
            }
        }

        var play = ttPlayUrl(d);
        // Thiếu m3u8Url2 (khi chỉ có slug#uuid từ datasend rỗng) → tra lại detail
        if (!play && d.seriesId) {
            try {
                var detailRaw = ttGet(TT_API + "/movie/" + encodeURIComponent(d.seriesId));
                var dj = ttJson(detailRaw);
                var data = dj.data || dj;
                var eps = Array.isArray(data.episodes) ? data.episodes : [];
                var want = String(d.episodeUuid || "").toLowerCase();
                var wantIdx = d.index ? Number(d.index) : 0;
                for (var ei = 0; ei < eps.length; ei++) {
                    var e = eps[ei] || {};
                    var matchUuid = want && String(e.uuid || "").toLowerCase() === want;
                    var matchIdx = wantIdx && Number(e.episodeNumber) === wantIdx;
                    if (matchUuid || matchIdx) {
                        d.m3u8Url2 = e.m3u8Url2 || "";
                        d.m3u8Url = e.m3u8Url || "";
                        d.index = Number(e.episodeNumber) || wantIdx || (ei + 1);
                        play = ttPlayUrl(d);
                        ttLog("re-detail ep match=" + (e.episodeNumber || ei + 1) + " play=" + !!play);
                        break;
                    }
                }
            } catch (er) { ttLog("re-detail err: " + er.message); }
        }
        if (!play) throw new Error("Không xác định được link phát");

        var masterBody = ttGet(play);
        var subs = ttSubtitles(play, masterBody);

        ttLog("play " + play.slice(0, 110) + " | subs=" + subs.length);
        return JSON.stringify({
            url: play,
            mimeType: "application/x-mpegURL",
            isEmbed: false,
            headers: {
                "User-Agent": TT_UA,
                "Referer": TT_SITE + "/",
                "Origin": TT_SITE
            },
            subtitles: subs
        });
    } catch (e) {
        ttLog("parseDetailResponse err: " + e.message);
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}

function parseEmbedResponse(raw, sourceUrl, datasend) {
    return parseDetailResponse(raw, sourceUrl, datasend);
}

function getStreamLink(id, datasend) {
    ttLog("getStreamLink id=" + id);
    var d = datasend;
    if (typeof d === "string") { try { d = JSON.parse(d); } catch (e) { d = {}; } }
    if (!d || typeof d !== "object") d = {};
    if (!d.seriesId && String(id || "").indexOf("#") > -1) {
        var p = String(id).split("#");
        d.seriesId = p[0];
        d.episodeUuid = p[1];
    }
    return parseDetailResponse("", id, JSON.stringify(d));
}

function getUrlSearchSuggest(keyword) {
    return getUrlSearch(keyword, "{}");
}
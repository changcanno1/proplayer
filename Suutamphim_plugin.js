// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN
// Site đã chuyển sang WordPress + theme sieutamphim (player OK/abyss)
// Xem chi tiết luồng lấy link + lỗi thường gặp: ./sieutamphim_GHI_CHU.md
// ========================================================

var iddomain = "sieutamphim";
NEWDOMAIN = true;

var BASE_URL = "https://www.sieutamphim.top";
var popup_html = "";

// UA desktop/mobile dùng chung
var STP_UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

function getManifest() {
    return JSON.stringify({
        "id": "sieutamphim",
        "name": "Sưu Tầm Phim",
        "version": "3.2",
        "baseUrl": BASE_URL,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/sieutamphim.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[STPhim] " + msg);
    }
}

if (NEWDOMAIN) {
    if (typeof httpRequest === "function") {
        try {
            var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {
                method: "POST"
            });
            if (res && res.isSuccessful) {
                var resobj = JSON.parse(res.body);
                if (resobj[iddomain] && resobj[iddomain].new) {
                    BASE_URL = String(resobj[iddomain].new).replace(/\/+$/, "");
                }
            }
        } catch (e) { log("domain err: " + e.message); }
    }
}
console.log("[STPhim] BASEURL " + BASE_URL);

// ========================================================
// HELPERS
// ========================================================

function stpAbs(u) {
    if (!u) return "";
    u = String(u).trim();
    if (/^https?:/i.test(u)) return u;
    if (u.indexOf("//") === 0) return "https:" + u;
    return BASE_URL + (u.charAt(0) === "/" ? "" : "/") + u;
}

function stpSlug(url) {
    var s = String(url || "").split("?")[0].split("#")[0].replace(/\/+$/, "");
    return s.substring(s.lastIndexOf("/") + 1);
}

function stpB64Decode(str) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var s = String(str || "").replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
    s = s.replace(/=+$/, "");
    var out = "", i = 0;
    while (i < s.length) {
        var c1 = chars.indexOf(s.charAt(i++));
        var c2 = chars.indexOf(s.charAt(i++));
        var c3 = i < s.length ? chars.indexOf(s.charAt(i++)) : -1;
        var c4 = i < s.length ? chars.indexOf(s.charAt(i++)) : -1;
        if (c1 < 0 || c2 < 0) break;
        var b1 = (c1 << 2) | (c2 >> 4);
        out += String.fromCharCode(b1 & 255);
        if (c3 >= 0) {
            var b2 = ((c2 & 15) << 4) | (c3 >> 2);
            out += String.fromCharCode(b2 & 255);
        }
        if (c4 >= 0) {
            var b3 = ((c3 & 3) << 6) | c4;
            out += String.fromCharCode(b3 & 255);
        }
    }
    return out;
}

function stpRot13(s) {
    return String(s || "").replace(/[a-zA-Z]/g, function (c) {
        var base = c <= "Z" ? 90 : 122;
        var x = c.charCodeAt(0) + 13;
        return String.fromCharCode(base >= x ? x : x - 26);
    });
}

// Player abyss: short.ink / abyssplayer → abysscdn
function stpAbyssCdn(u) {
    return String(u || "").replace(
        /https?:\/\/(short\.ink|short\.icu|abyssplayer\.com|player\.abyssplayer\.com|play\.abyssplayer\.com)\//gi,
        "https://abysscdn.com/"
    );
}

// Custom-JS: bắt link media trong iframe abysscdn → player native
function buildSnifferJs() {
    return "(function(){"
        + "if(window.__stpSniff)return;window.__stpSniff=1;"
        + "function post(u){try{window.parent.postMessage({__vaxCmd:'url',url:u},'*')}catch(e){}}"
        + "var seen={};"
        + "function grab(u){try{if(!u)return;u=String(u);if(seen[u])return;"
        + "if(!/\\.(mp4|m3u8)(\\?|#|$)/i.test(u))return;seen[u]=1;"
        + "console.log('[STP-SNIFF] '+u.slice(0,160));post(u);}catch(e){}}"
        + "try{var of=window.fetch;window.fetch=function(){try{var a=arguments[0];grab(typeof a==='string'?a:(a&&a.url));}catch(e){}return of.apply(this,arguments);};}catch(e){}"
        + "try{var oo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){try{grab(u);}catch(e){}return oo.apply(this,arguments);};}catch(e){}"
        + "var n=0,iv=setInterval(function(){"
        + "try{if(window.jwplayer){var p=window.jwplayer();var it=p&&p.getPlaylistItem&&p.getPlaylistItem();"
        + "if(it){if(it.file)grab(it.file);if(it.sources)for(var i=0;i<it.sources.length;i++)grab(it.sources[i].file);}}}catch(e){}"
        + "try{var vs=document.querySelectorAll('video,source');for(var j=0;j<vs.length;j++){grab(vs[j].src||vs[j].currentSrc);}}catch(e){}"
        + "if(++n>120)clearInterval(iv);},500);"
        + "})();";
}

// ========================================================
// HOME / CATEGORY
// ========================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: "tat-ca-phim", title: "Tất Cả Phim", type: "Grid" },
        { slug: "tu-khoa/phim-bo", title: "Phim Bộ Mới", type: "Horizontal" },
        { slug: "tu-khoa/phim-le", title: "Phim Lẻ Mới", type: "Horizontal" },
        { slug: "tu-khoa/series", title: "Series", type: "Horizontal" },
        { slug: "tu-khoa/movie", title: "Movie", type: "Horizontal" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Tất Cả Phim", slug: "tat-ca-phim" },
        { name: "Phim Bộ", slug: "tu-khoa/phim-bo" },
        { name: "Phim Lẻ", slug: "tu-khoa/phim-le" },
        { name: "Series", slug: "tu-khoa/series" },
        { name: "Movie", slug: "tu-khoa/movie" },
        { name: "Vietsub", slug: "tu-khoa/vietsub" },
        { name: "Lồng Tiếng", slug: "tu-khoa/dubbing" },
        { name: "Thuyết Minh", slug: "tu-khoa/voice-over" },
        { name: "Phim Việt Nam", slug: "tu-khoa/phim-viet-nam" },
        { name: "Phim Hàn Quốc", slug: "tu-khoa/phim-han-quoc" },
        { name: "Phim Trung Quốc", slug: "tu-khoa/phim-trung-quoc" },
        { name: "Phim Nhật Bản", slug: "tu-khoa/phim-nhat-ban" },
        { name: "Phim Mỹ", slug: "tu-khoa/phim-my" },
        { name: "Phim Thái Lan", slug: "tu-khoa/phim-thai-lan" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

function getUrlList(slug, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = parseInt(filters.page, 10) || 1;
    var s = String(slug || "").replace(/^\/+|\/+$/g, "");
    if (!s) s = "tat-ca-phim";
    var url = BASE_URL + "/" + s + "/";
    if (page > 1) url += "page/" + page + "/";
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    return BASE_URL + "/?s=" + encodeURIComponent(keyword || "");
}

function getUrlDetail(id) {
    if (!id) return "";
    var s = String(id);
    if (/^https?:/i.test(s)) return s;
    if (/\/tap-[^\/]+-[a-z0-9]+-server/i.test(s)) return stpAbs(s);
    var slug = s.replace(/^play-/, "").split("?")[0].replace(/^\/+|\/+$/g, "");
    if (!slug) return "";
    return BASE_URL + "/xem-phim/" + slug + "/";
}

// ========================================================
// PARSE LIST
// ========================================================

function parseListResponse(html) {
    try {
        var items = [];
        var used = {};
        var chunks = String(html || "").split('class="item"');
        for (var i = 1; i < chunks.length; i++) {
            var block = chunks[i];
            var um = block.match(/href="([^"]*\/xem-phim\/[^"]+)"/i);
            if (!um) continue;
            var url = stpAbs(um[1]);
            if (used[url]) continue;
            used[url] = true;

            var tm = block.match(/class="title"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i)
                || block.match(/alt="([^"]+)"/i);
            var title = tm ? decodeHtmlEntities(tm[1].replace(/<[^>]*>/g, "").trim()) : "Unknown";

            var pm = block.match(/data-src="([^"]+)"/i) || block.match(/src="([^"]+)"/i);
            var poster = pm ? stpAbs(pm[1]) : "";

            items.push({
                id: url,
                title: title,
                posterUrl: poster,
                datasend: poster
            });
        }

        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 999 }
        });
    } catch (e) {
        log("parseList error: " + e.message);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// ========================================================
// PARSE DETAIL
// ========================================================

// Gom toàn bộ link /tap-...-server trong trang watch
function stpParseServers(html) {
    var servers = [];
    var index = {};
    var order = [];
    var seen = {};
    var re = /href="([^"]*\/xem-phim\/[^"\/]+\/tap-([^"\/]+)-([a-z0-9]+)-server\/?)"/gi;
    // fallback regex riêng cho URL tương đối
    var m;
    while ((m = re.exec(html)) !== null) {
        var full = stpAbs(m[1]);
        if (seen[full]) continue;
        seen[full] = true;
        var name = m[2];
        var srv = m[3];
        if (!index[srv]) {
            index[srv] = { name: srv.toUpperCase(), episodes: [] };
            order.push(srv);
        }
        index[srv].episodes.push({
            id: full,
            name: /^full$/i.test(name) ? "Full" : ("Tập " + name),
            slug: "tap-" + name
        });
    }

    // URL tương đối (không có domain)
    var re2 = /href="(\/xem-phim\/[^"\/]+\/tap-([^"\/]+)-([a-z0-9]+)-server\/?)"/gi;
    while ((m = re2.exec(html)) !== null) {
        var full2 = stpAbs(m[1]);
        if (seen[full2]) continue;
        seen[full2] = true;
        var name2 = m[2], srv2 = m[3];
        if (!index[srv2]) {
            index[srv2] = { name: srv2.toUpperCase(), episodes: [] };
            order.push(srv2);
        }
        index[srv2].episodes.push({
            id: full2,
            name: /^full$/i.test(name2) ? "Full" : ("Tập " + name2),
            slug: "tap-" + name2
        });
    }

    for (var i = 0; i < order.length; i++) {
        var eps = index[order[i]].episodes;
        eps.sort(function (a, b) {
            var x = parseFloat(String(a.slug).replace(/^tap-/, ""));
            var y = parseFloat(String(b.slug).replace(/^tap-/, ""));
            if (isNaN(x)) x = -1;
            if (isNaN(y)) y = -1;
            return x - y;
        });
        servers.push(index[order[i]]);
    }
    return servers;
}

function parseMovieDetail(html, url, datasend) {
    try {
        var page = String(html || "");
        var movieUrl = (page.match(/<meta property="og:url" content="([^"]+)"/i) || [])[1] || url;
        var servers = stpParseServers(page);
        var epTotal = 0;
        for (var si = 0; si < servers.length; si++) epTotal += servers[si].episodes.length;

        // Trang detail chỉ có 1 link tập → tải trang watch để lấy đủ tập + server
        if (epTotal <= 1) {
            var firstEp = page.match(/href="([^"]*\/xem-phim\/[^"\/]+\/tap-[^"]*?-server\/?)"/i);
            if (firstEp) {
                var watchUrl = stpAbs(firstEp[1]);
                log("detail → watch: " + watchUrl);
                if (typeof httpRequest === "function") {
                    try {
                        var wres = httpRequest(watchUrl, {
                            method: "GET",
                            headers: { "User-Agent": STP_UA, "Referer": BASE_URL + "/" }
                        });
                        if (wres && wres.isSuccessful && wres.body && wres.body.indexOf("/tap-") > -1) {
                            page = wres.body;
                            servers = stpParseServers(page);
                        }
                    } catch (e) { log("watch fetch err: " + e.message); }
                }
            }
        }

        var title = (page.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] || "";
        title = decodeHtmlEntities(title)
            .replace(/^Xem Phim\s+/i, "")
            .replace(/\s*Mới Nhất\s*$/i, "")
            .replace(/\s*-\s*Siêu Tầm Phim\s*$/i, "")
            .trim();

        var poster = (page.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) || [])[1]
            || (page.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i) || [])[1]
            || "";
        if (!poster) {
            var img = page.match(/class="poster-details"[\s\S]*?<img[^>]+(?:src|data-src)="([^"]+)"/i)
                || page.match(/<img[^>]+(?:src|data-src)="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
            poster = img ? img[1] : "";
        }
        if (!poster && datasend) poster = datasend;
        poster = stpAbs(poster);

        var description = (page.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] || "";
        description = decodeHtmlEntities(description);

        if (!servers.length) {
            log("No server found: " + movieUrl);
        }

        var out = JSON.stringify({
            id: "",
            title: title || decodeHtmlEntities(stpSlug(movieUrl)),
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: servers,
            quality: "HD",
            status: "Hoàn tất"
        });
        log("detail: " + (title || movieUrl) + " | servers=" + servers.length);
        return out;
    } catch (e) {
        log("parseMovieDetail error: " + e.message);
        return JSON.stringify({ servers: [] });
    }
}

// ========================================================
// PARSE STREAM
// ========================================================

// Giải mã entity/html-escape trong JSON của OK.ru
function stpUnescape(s) {
    return String(s || "")
        .replace(/\\u0026/gi, "&").replace(/\\u003d/gi, "=").replace(/\\u002F/gi, "/")
        .replace(/&quot;/g, '"').replace(/&#34;/g, '"').replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&").replace(/\\\//g, "/");
}

// Tìm link phát trong dữ liệu OKVideo (hlsManifestUrl hoặc videos[name=full])
function stpExtractOk(html) {
    var s = stpUnescape(html);
    var m = s.match(/"hlsManifestUrl"\s*:\s*"([^"]+)"/i);
    if (m && m[1]) return { kind: "hls", url: m[1] };
    m = s.match(/"name"\s*:\s*"full"\s*,\s*"url"\s*:\s*"([^"]+)"/i)
        || s.match(/"url"\s*:\s*"(https?:\/\/vd\d+\.okcdn\.ru\/[^"]+)"/i);
    if (m && m[1]) return { kind: "mp4", url: m[1] };
    return null;
}

// Tải trang ok.ru/videoembed → lấy HLS đã ký (expires/sig)
function stpResolveOk(url) {
    if (!/ok\.ru|odnoklassniki/i.test(url)) return null;
    try {
        var r = httpRequest(url, {
            method: "GET",
            headers: {
                "User-Agent": STP_UA,
                "Referer": "https://ok.ru/",
                "Accept": "text/html,application/xhtml+xml,*/*"
            }
        });
        if (!r || !r.isSuccessful || !r.body) { log("ok fetch fail status=" + (r && r.statusCode)); return null; }
        var ok = stpExtractOk(r.body);
        if (ok) log("ok " + ok.kind + ": " + ok.url.slice(0, 140));
        else log("ok: không thấy hlsManifestUrl");
        return ok;
    } catch (e) { log("ok err: " + e.message); return null; }
}

// Bóc embed.php → embed → player-payload → OK/abyss player
function stpResolvePlayer(watchHtml, watchUrl) {
    try {
        // Một số trang nhúng OKVideo trực tiếp
        var direct = stpExtractOk(watchHtml);
        if (direct) return direct;

        var em = watchHtml.match(/var\s+encodedUrl\s*=\s*"([^"]+)"/i);
        if (!em) em = watchHtml.match(/encodedUrl\s*[:=]\s*"([A-Za-z0-9+\/=_-]+)"/i);
        if (!em) { log("không thấy encodedUrl"); return null; }

        var path = stpB64Decode(em[1]);
        var embedUrl = stpAbs(path);
        log("embed: " + embedUrl.slice(0, 140));

        var refs = [watchUrl, BASE_URL + "/"];
        var embedHtml = "";
        for (var i = 0; i < refs.length && !embedHtml; i++) {
            try {
                var r = httpRequest(embedUrl, {
                    method: "GET",
                    headers: {
                        "User-Agent": STP_UA,
                        "Referer": refs[i],
                        "Accept": "text/html,application/xhtml+xml,*/*"
                    }
                });
                if (r && r.isSuccessful && r.body && r.body.length > 200) embedHtml = r.body;
                else log("embed fetch fail status=" + (r && r.statusCode));
            } catch (e) { log("embed err: " + e.message); }
        }
        if (!embedHtml) return null;

        var inEmbed = stpExtractOk(embedHtml);
        if (inEmbed && !/short\.ink|abyss/i.test(inEmbed.url)) {
            return inEmbed;
        }

        var pm = embedHtml.match(/name="player-payload"\s+content="([^"]+)"/i);
        if (!pm) { log("không thấy player-payload"); return null; }

        var payload = stpRot13(stpB64Decode(pm[1]));
        log("payload: " + payload.slice(0, 140));

        var ok = stpResolveOk(payload);
        if (ok) return ok;

        return { kind: "embed", url: stpAbyssCdn(payload) };
    } catch (e) {
        log("resolve error: " + e.message);
        return null;
    }
}

function stpStreamJson(url) {
    var isM3u8 = /\.m3u8(\?|#|$)/i.test(url);
    return JSON.stringify({
        url: url,
        isEmbed: !isM3u8,
        mimeType: isM3u8 ? "application/x-mpegURL" : "text/html",
        headers: {
            "User-Agent": STP_UA,
            "Referer": BASE_URL + "/",
            "Origin": BASE_URL,
            "Custom-Js": buildSnifferJs()
        },
        subtitles: []
    });
}

function stpDirectJson(url, kind) {
    var isHls = kind === "hls" || /\.m3u8(\?|#|$)/i.test(url);
    return JSON.stringify({
        url: url,
        mimeType: isHls ? "application/x-mpegURL" : "video/mp4",
        isEmbed: false,
        headers: {
            "User-Agent": STP_UA,
            "Referer": "https://ok.ru/",
            "Origin": "https://ok.ru"
        },
        subtitles: []
    });
}

function parseDetailResponse(html, url) {
    log("stream for: " + url);
    try {
        var page = String(html || "");

        // 1) watch page → embed.php → payload → OK / abyss player
        var pl = stpResolvePlayer(page, url);
        if (pl) {
            log("→ " + pl.kind + ": " + pl.url.slice(0, 140));
            if (pl.kind === "hls" || pl.kind === "mp4") return stpDirectJson(pl.url, pl.kind);
            return stpStreamJson(pl.url);
        }

        // 2) Trang có iframe trực tiếp
        var im = page.match(/<iframe[^>]+src="([^"]+)"/i);
        if (im && im[1] && im[1].length > 5 && im[1].indexOf(url) === -1) {
            var iu = stpAbs(im[1]);
            log("iframe: " + iu.slice(0, 120));
            return stpStreamJson(iu);
        }

        // 3) m3u8 trực tiếp
        var mm = page.match(/(https?:\/\/[^"'\\\s]+\.m3u8[^"'\\\s]*)/i);
        if (mm && /video\.m3u8\?cmd=videoPlayerCdn/i.test(mm[1]) && !/[?&]sig=/i.test(mm[1])) {
            log("bỏ m3u8 thiếu chữ ký: " + mm[1].slice(0, 120));
            mm = null;
        }
        if (mm) {
            log("m3u8: " + mm[1].slice(0, 120));
            return JSON.stringify({
                url: mm[1],
                mimeType: "application/x-mpegURL",
                isEmbed: false,
                headers: { "User-Agent": STP_UA, "Referer": BASE_URL + "/", "Origin": BASE_URL }
            });
        }

        log("No stream found, fallback URL");
        return JSON.stringify({
            url: url,
            isEmbed: true,
            headers: { "Referer": BASE_URL + "/", "Origin": BASE_URL }
        });
    } catch (e) {
        log("parseDetailResponse error: " + e.message);
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}

function parseEmbedResponse(html, sourceUrl, datasend) {
    try {
        return parseDetailResponse(html, sourceUrl);
    } catch (e) {
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}

// ========================================================
// HELPERS
// ========================================================

function decodeHtmlEntities(str) {
    if (!str) return "";
    return String(str)
        .replace(/&#8211;/g, "-").replace(/&#8212;/g, "-")
        .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
        .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
        .replace(/&#038;/g, "&").replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ").trim();
}

function parseCategoriesResponse(raw) {
    try {
        var j = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(j) && j.length) {
            return JSON.stringify(j.map(function (c) {
                return { slug: c.slug || c.value || '', name: c.name || c.title || '' };
            }));
        }
        return "[]";
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
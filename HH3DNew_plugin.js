// https://bilutv.asia
//BASEURL = "http://vkey.vn/yanhh3d";
// https://bilutv.asia
//BASEURL = "http://vkey.vn/yanhh3d";
var iddomain = "yanhh3d"
BASEURL = "https://vkey.vn/" + iddomain;
var popup_html = "";
function getManifest() {
    return JSON.stringify({
        "id": "yanhh3d",
        "name": "Yanhh3d [ANIME]",
        "description": "Trang xem phim Hoạt Hình siêu hay.",
      	"info":"Update 3.4 fix lỗi không xem được phim.",
        "version": "3.4",
        "baseUrl": BASEURL,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/yanhh3d.png",
        "isEnabled": true,
        "layoutType": "HORIZONTAL",
        "author": "Alokillgtv",
        popup_html: popup_html,
        "type": "ANIME",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog(msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log(msg);
    }
}

// =============================================================================
// GHI CHÚ SỰ CỐ (fix 2026-10-21) - đọc trước khi sửa luồng lấy stream
// -----------------------------------------------------------------------------
// 1. Các link server trong trang tập (data-src) KHÔNG phải m3u8 thật. URL dạng
//    https://scontent-sin2-X-xx.streamrpt1.site/o2/.../<uuid>.m3u8
//    thực chất trả về trang HTML player (~1715B) chứa <div id="player" data-obf="...">.
//    data-obf (base64 JSON) có: sU = playlist mã hóa #ENC-AESGCM (bỏ), pU = playlist thật
//    dạng .../<uuid>.m3u8/stream-plain?t=<token>.
//
// 2. httpRequest trực tiếp tới URL .m3u8 trả HTTP 200 nhưng res.body RỖNG
//    (app can thiệp URL stream / không giải nén được zstd). vax.local/fetch và
//    vax.local/p cũng rỗng trong thực tế -> đừng chỉ dựa vào chúng.
//
// 3. streamfile worker /proxy cũng hỏng với URL chứa ".m3u8": worker nhảy vào
//    nhánh rewrite playlist, đọc stream 1 lần rồi trả "ReadableStream disturbed".
//    Cách né: mask ".m3u8" -> "%2Em3u8" trong chuỗi url= (server vẫn hiểu đúng
//    path sau khi decode, worker thì không match ".m3u8" nữa) -> nhận nguyên HTML.
//    Đây là đường duy nhất hoạt động trên máy thật (log: "worker ok len=1715").
//
// 4. pU (stream-plain) fetch trực tiếp được (log: "direct ok len=..."), KHÔNG cần mask.
//
// 5. Segment trong playlist pU không phải TS thuần: mỗi file .png =
//    120B PNG (1x1) + 151B header + TS thật, TS bắt đầu ở offset 271 (hằng số,
//    đã kiểm tra nhiều segment). ExoPlayer đọc từ byte 0 nên sniff fail.
//    Fix: chèn #EXT-X-BYTERANGE:<len>@271 và đẩy segment qua streamfile /proxy
//    với mime=video/mp2t; worker forward header Range nên trả 206 + TS sạch.
//    (đã test: 206, content-type video/mp2t, bytes 47 40 ...)
//
// 6. Trả m3u8Content + baseUrl để app phát qua local server 127.0.0.1 (không dùng
//    Custom-Js). headers phải có Referer/Origin/User-Agent/Accept-Encoding=identity.
//
// Log chẩn đoán: [yanFetch] direct/vax/p/worker ok len=..., [resolve] data-obf ->,
// [verify] m3u8, [yanRange] đã chèn BYTERANGE@271, [playlist] m3u8Content len=...
// =============================================================================
var YAN_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var YAN_REF = "https://yanhh3d.mom";

function yanFetchPage(target, referer) {
    var ref = referer || YAN_REF;
    var origin = ref.replace(/\/+$/, "");
    var r = null;
    try {
        r = httpRequest(target, {
            method: "GET",
            headers: {
                "Referer": ref,
                "Origin": origin,
                "User-Agent": YAN_UA,
                "Accept-Encoding": "identity"
            }
        });
    } catch (e) {
        log("[yanFetch] direct err: " + e);
    }
    if (r && r.body && String(r.body).length > 0) {
        log("[yanFetch] direct ok len=" + String(r.body).length);
        return String(r.body);
    }
    log("[yanFetch] direct body rỗng -> vax.local");
    try {
        var payload = {
            url: target,
            headers: {
                "Referer": ref,
                "Origin": origin,
                "User-Agent": YAN_UA,
                "Accept-Encoding": "identity"
            },
            fallback: true
        };
        var b64 = BASE64.encode(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        var vx = "https://vax.local/p?d=" + b64;
        var r2 = httpRequest(vx, { method: "GET" });
        if (r2 && r2.body && String(r2.body).length > 0) {
            log("[yanFetch] vax/p ok len=" + String(r2.body).length);
            return String(r2.body);
        }
        log("[yanFetch] vax/p body rỗng");
    } catch (e2) {
        log("[yanFetch] vax err: " + e2);
    }
    // 3) Worker proxy: mask ".m3u8" -> "%2Em3u8" để worker không rơi vào nhánh rewrite playlist
    try {
        var masked = target.replace(/\.m3u8/gi, "%2Em3u8");
        var wp = "https://streamfile.alokillgtv04.workers.dev/proxy?url=" + encodeURIComponent(masked)
            + "&referer=" + encodeURIComponent(ref)
            + "&origin=" + encodeURIComponent(origin)
            + "&ua=" + encodeURIComponent(YAN_UA);
        var r3 = httpRequest(wp, { method: "GET" });
        if (r3 && r3.body && String(r3.body).length > 0) {
            log("[yanFetch] worker ok len=" + String(r3.body).length);
            return String(r3.body);
        }
        log("[yanFetch] worker body rỗng");
    } catch (e3) {
        log("[yanFetch] worker err: " + e3);
    }
    return "";
}

// Segment .png của yanhh3d = 120-byte PNG + 151-byte header + TS thật (offset 271).
// Offset 271 là HẰNG SỐ cho mọi segment (đã verify 5 segment: 1,2,10,50,100).
// Dùng EXT-X-BYTERANGE để ExoPlayer tự Range từ 271 -> đọc được TS nguyên vẹn.
// Segment được đẩy qua streamfile worker để có Content-Type video/mp2t (worker forward Range).
// LƯU Ý: nếu sau này CDN đổi định dạng, kiểm tra lại bằng cách tải 1 segment:
//   byte 0..7 = 89 50 4E 47 0D 0A 1A 0A (PNG), tìm offset có 0x47 lặp mỗi 188B.
var YAN_SEG_OFFSET = 271;
var YAN_STREAM_PROXY = "https://streamfile.alokillgtv04.workers.dev/proxy";

function yanProxySeg(seg) {
    return YAN_STREAM_PROXY
        + "?url=" + encodeURIComponent(seg)
        + "&referer=" + encodeURIComponent(YAN_REF + "/")
        + "&origin=" + encodeURIComponent(YAN_REF)
        + "&ua=" + encodeURIComponent(YAN_UA)
        + "&mime=video%2Fmp2t";
}

function yanRangeM3u8(txt) {
    if (!txt || txt.indexOf("#EXTM3U") < 0) return txt;
    if (txt.indexOf("#EXT-X-STREAM-INF") > -1) {
        log("[yanRange] master playlist, giữ nguyên");
        return txt;
    }
    var lines = String(txt).replace(/\r/g, "").split("\n");
    if (!/\.png([\s?#%]|$)/i.test(txt)) {
        log("[yanRange] segment không phải .png, giữ nguyên");
        return txt;
    }
    var out = [];
    for (var j = 0; j < lines.length; j++) {
        var l = lines[j];
        if (l.indexOf("#EXT-X-VERSION") === 0) { out.push("#EXT-X-VERSION:4"); continue; }
        if (l && l.charAt(0) !== "#" && /^https?:/i.test(l)) {
            var segUrl = l.replace(/\s+$/, "");
            var mMatch = segUrl.match(/[?&]url=([^&]+)/);
            if (segUrl.indexOf("vax.local") > -1 && mMatch) {
                try { segUrl = decodeURIComponent(mMatch[1]); } catch (eSeg) {}
            }
            out.push("#EXT-X-BYTERANGE:20000000@" + YAN_SEG_OFFSET);
            out.push(yanProxySeg(segUrl));
            continue;
        }
        out.push(l);
    }
    var res = out.join("\n");
    if (res.indexOf("#EXT-X-VERSION") < 0) res = res.replace("#EXTM3U", "#EXTM3U\n#EXT-X-VERSION:4");
    log("[yanRange] đã chèn BYTERANGE@" + YAN_SEG_OFFSET + " cho segment png");
    return res;
}


if (typeof httpRequest === "function") {
  var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {method: "POST"});
  if (res && res.isSuccessful) {
    var resobj = JSON.parse(res.body);
    BASEURL = resobj[iddomain].new;   
  } else {
    BASEURL = "https://vkey.vn/" + iddomain;
  }
} else {
  BASEURL = "https://vkey.vn/" + iddomain;
}
BASELINK = BASEURL;
console.log("BASEURL " + BASEURL);

// https://yanhh3d.ac/moi-cap-nhat?page=2
// https://yanhh3d.ac/moi-cap-nhat?page=2
function getHomeSections() {
    try {
        var listurl = `
/hoan-thanh@@Full Bộ@@false
/hoat-hinh-2d@@Hoạt Hình 2D@@false
/hoat-hinh-3d@@Hoạt Hình 3D@@false
/moi-cap-nhat@@Phim Mới@@true
`;
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        log("getHomeSections[err]:\n " + e);
        return JSON.stringify([]);
    }
}

function getPrimaryCategories() {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        log("getPrimaryCategories[err]:\n " + e);
        return JSON.stringify([]);
    }
}

// ĐÃ SỬA: Lỗi cú pháp khai báo biến trong JSON.stringify
function getFilterConfig() {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify({
            category: menulist
        });
    } catch (e) {
        log("getFilterConfig[err]:\n " + e);
        return JSON.stringify({ category: [] });
    }
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        log("getUrlList[url]: \n" + slug);

        // 1. Kiểm tra nếu slug là link tuyệt đối (chứa http) và không có bộ lọc thì trả về luôn
        if ((slug && slug.indexOf("http") > -1) || (slug && slug.indexOf("search") > -1)) {
            // thường là link search sẽ bị trả về ở đây
            return slug;
        }
        let page = 1;
        let path = slug || "";

        // 2. Xử lý an toàn filtersJson nếu có truyền vào
        if (filtersJson) {
            // Nếu có số trang hoặc có menu categ
            // Sửa lỗi nếu JSON thiếu dấu ngoặc kép ở key hoặc sai cú pháp cơ bản
            let fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                let filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;

                // Nếu có category trong JSON, ưu tiên lấy category làm đường dẫn (path)
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        // 5. Nối chuỗi URL kết quả
        let resultUrl = BASEURL;
        if (path) {
            resultUrl += path;
        }

        if (page > 1) {
            resultUrl += "?page=" + page;
        }

        // Trả về kết quả, chỉ gộp dấu // ở phần path, giữ nguyên https://
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        log("getUrlList[err]:\n " + e);
        // Trả về URL gốc an toàn nếu có lỗi
        let fallback = BASEURL + (slug ? "/" + slug : "");
        var resFallback = fallback.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + resFallback);
        return resFallback;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        var path = "";

        // 2. Xử lý an toàn filtersJson nếu có truyền vào
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}

            if (page > 1) {
                var resUrlPage = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword) + "&page=" + page;
                log("getUrlSearch[url]: \n" + resUrlPage);
                return resUrlPage;
            }
        }
        var resUrl = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword);
        log("getUrlSearch[url]: \n" + resUrl);
        return resUrl;

    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        var fallbackUrl = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword || "");
        log("getUrlSearch[url]: \n" + fallbackUrl);
        return fallbackUrl;
    }
}

function getUrlDetail(slug) {
    try {
        log("getUrlDetail[url]: \n" + slug);
        if (!slug) return "";
        if (slug.indexOf('http') === 0) return slug;
        var resUrl = BASEURL + "/" + slug;
        log("getUrlDetail[url]: \n" + resUrl);
        return resUrl;
    } catch (e) {
        log("getUrlDetail[err]:\n " + e);
        return "";
    }
}

function getUrlCategories() {
    try {
        log("getUrlCategories[url]: \n" + BASEURL);
        return BASEURL;
    } catch (e) {
        log("getUrlCategories[err]:\n " + e);
        return "";
    }
}

function getUrlCountries() {
    try {
        return "";
    } catch (e) {
        log("getUrlCountries[err]:\n " + e);
        return "";
    }
}

function getUrlYears() {
    try {
        return "";
    } catch (e) {
        log("getUrlYears[err]:\n " + e);
        return "";
    }
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, $url) {
    try {
        log("parseListResponse[url]: \n" + $url);
        var items = [];

        _$(html).find(".flw-item").each(function () {
            var year = "";
            var lang = "";
            var current = this.find(".tick-rate").text();
            var href = this.find("a").attr("href");
            var quality = this.find(".tick-dub").text();
            var title = this.find("a").attr("title");
            var src = this.find("img").attr("src");
            if (src.indexOf("http") == -1) {
                src = BASEURL + src;
            }

            if (href && href.indexOf("http") > -1) {
                var cleanThumb = src.replace(/&amp;/g, '&');

                items.push({
                    "id": href,
                    "title": title.trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality,
                    "episode_current": current
                });
            }
        });

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 999
            }
        });

    } catch (e) {
        log("parseListResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [{
                "id": $url,
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseSearchResponse(html) {
    try {
        return parseListResponse(html);
    } catch (e) {
        log("parseSearchResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseMovieDetail(htmlContent, url) {
    try {
        log("parseMovieDetail[url]: \n" + url);

        // === BƯỚC 1: ĐỒNG NHẤT ID ===
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
        var id = idMatch ? idMatch[1] : (url || "");

        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/_.]+)/.exec(htmlContent);
            slug = slugMatch2 ? slugMatch2[1] : "";
        }

        // === BƯỚC 2: TRÍCH XUẤT THÔNG TIN PHIM ===
        var lurl = "", limg = "", lname = "Đang cập nhật...", ldes = "Không có mô tả.";
        var ldirec = "", lactor = "", lduran = "", status = "", category = "", episode_current = "", year = "";

        var rmatch = htmlContent.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lurl = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="video:duration"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lduran = rmatch[1];

        status = _$(htmlContent).find("span:content('Trạng thái:')").next().text();
        year = _$(htmlContent).find("span:content('Năm:')").next().text();
        category = _$(htmlContent).find("span:content('Thể loại:')").parent().text(", ").replace('Thể loại:, ', '');
        episode_current = _$(htmlContent).find("span:content('Tập mới nhất:')").next().text();

        // ================================================================
        // BƯỚC 3: HELPERS
        // ================================================================

        // Chuẩn hoá tên base server (bỏ hậu tố [4K], [1080+], ...)
        function getBaseServerName(nameServer) {
            return String(nameServer)
                .replace(/\s*\[4K\]\s*/gi, " ")
                .replace(/\s*\[2160p?\]\s*/gi, " ")
                .replace(/\s*\[1080\+\]\s*/gi, " ")
                .replace(/\s*\[1080-\]\s*/gi, " ")
                .replace(/\s*\[1080p\]\s*/gi, " ")
                .replace(/\s*\(4K\)\s*/gi, " ")
                .replace(/\s*\(2160p?\)\s*/gi, " ")
                .replace(/\s*\(1080\+\)\s*/gi, " ")
                .replace(/\s*\(1080-\)\s*/gi, " ")
                .replace(/\s*\(1080p\)\s*/gi, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        // Phân loại quality từ tên server
        function classifyQuality(nameServer) {
            var s = String(nameServer).toLowerCase();
            if (/\b4k\b|2160/.test(s))  return "4K";
            if (/1080\s*\+/.test(s))    return "1080+";
            if (/1080\s*-/.test(s))     return "1080-";
            if (/1080/.test(s))         return "1080+"; // mặc định 1080 -> 1080+
            return "Khác";
        }

        // Số tập từ tên
        function getEpisodeNumber(name) {
            var m = String(name).match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
        }

        // Thêm query vào href
        function appendQuery(href, qs) {
            if (!qs) return href;
            return href + (href.indexOf("?") > -1 ? "&" : "?") + qs;
        }

        // ================================================================
        // BƯỚC 4: GOM TẬP THEO BASE SERVER
        // ================================================================
        // serverMap[baseName].episodes[epNum] = { name, qualities: { "4K": href, ... } }
        var serverMap  = {};
        var serverOrder = [];

        var $parent = _$(htmlContent).find('.detail-infor-content');
        var $child  = $parent.find("li");

        $child.find("a").each(function() {
            var nameServer = this.text().trim();
            var idserver   = this.attr("href");
            if (!idserver || idserver.charAt(0) !== "#") return;

            var baseName = getBaseServerName(nameServer);
            var quality  = classifyQuality(nameServer);
            if (!baseName) return;

            if (!serverMap[baseName]) {
                serverMap[baseName] = { episodes: {} };
                serverOrder.push(baseName);
            }

            // Duyệt từng tập trong server này
            $parent.find(idserver).find("a").each(function() {
                var epName = this.find("div").text().trim();
                var epHref = this.attr("href");
                var epNum  = getEpisodeNumber(epName);

                if (!epNum || !epHref) return;

                if (!serverMap[baseName].episodes[epNum]) {
                    serverMap[baseName].episodes[epNum] = {
                        name: epName,
                        qualities: {}
                    };
                }

                // Append query để phân biệt quality
                var finalHref = epHref;
                if (quality === "4K") {
                    finalHref = appendQuery(epHref, "type=4k");
                } else if (quality === "1080-") {
                    finalHref = appendQuery(epHref, "type=1080m");
                } else if (quality === "Khác") {
                    finalHref = appendQuery(epHref, "type=other");
                }
                // 1080+ không cần query (default)

                serverMap[baseName].episodes[epNum].qualities[quality] = finalHref;
            });
        });

        // ================================================================
        // BƯỚC 5: BUILD SERVERS VỚI IDS[]
        // ================================================================
        // ================================================================
        // BƯỚC 5: BUILD SERVERS VỚI IDS[] — LUÔN ĐỦ 4 OPTION
        // ================================================================
        var servers = [];
        var QUALITY_ORDER = ["4K", "1080+", "1080-", "Khác"];

        // Map quality -> query string
        function qualityToQuery(q) {
            if (q === "4K")    return "4k";
            if (q === "1080-") return "1080m";
            if (q === "Khác")  return "other";
            return ""; // 1080+ default, không cần query
        }

        // Bỏ mọi ?type=xxx khỏi URL để lấy base
        function stripTypeQuery(href) {
            return String(href)
                .replace(/([?&])type=[^&]*/g, "$1")
                .replace(/[?&]$/, "")
                .replace(/\?&/, "?");
        }

        serverOrder.forEach(function(baseName) {
            var epMap  = serverMap[baseName].episodes;
            var epNums = Object.keys(epMap).map(Number).sort(function(a, b){ return a - b; });

            var episodes = [];

            epNums.forEach(function(epNum, idx) {
                var epData    = epMap[epNum];
                var qualities = epData.qualities;

                // Tìm base URL từ bất kỳ quality nào có sẵn
                var baseHref = null;
                for (var qi = 0; qi < QUALITY_ORDER.length; qi++) {
                    if (qualities[QUALITY_ORDER[qi]]) {
                        baseHref = stripTypeQuery(qualities[QUALITY_ORDER[qi]]);
                        break;
                    }
                }
                if (!baseHref) return;

                // Build ĐỦ 4 option
                var ids = [];
                QUALITY_ORDER.forEach(function(q) {
                    var url;
                    if (qualities[q]) {
                        url = qualities[q]; // có link thật
                    } else {
                        // Link giả: base + ?type= để parseDetailResponse biết user chọn gì
                        var qs = qualityToQuery(q);
                        url = qs ? appendQuery(baseHref, "type=" + qs) : baseHref;
                    }
                    ids.push({ name: q, url: url });
                });

                episodes.push({
                    name: epData.name,
                    slug: "tap-" + (idx + 1),
                    id:   ids[0].url,   // fallback cho app cũ
                    ids:  ids
                });
            });

            if (episodes.length > 0) {
                servers.push({
                    name: baseName,
                    episodes: episodes
                });
            }
        });

        // ================================================================
        // BƯỚC 6: EXTRA (nút play)
        // ================================================================
        var extra = "";
        var isPlayPage = /\/tap-/.test(id);
        if (!isPlayPage) {
            var playBtnMatch = _$(htmlContent).find(".film-buttons").find("a").attr("href");
            if (playBtnMatch) extra = playBtnMatch;
        }

        return JSON.stringify({
            id:              id,
            title:           lname,
            posterUrl:       limg,
            backdropUrl:     limg,
            description:     ldes,
            quality:         "HD",
            year:            year,
            rating:          8.5,
            status:          status,
            category:        category,
            episode_current: episode_current,
            servers:         servers,
            duration:        lduran || "",
            casts:           lactor || "",
            director:        ldirec || "",
            extra:           extra
        });

    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: slug || url || "error",
            title: "error",
            servers: []
        });
    }
}
/*
function parseDetailResponse(html, url) {
    try {
        log("parseDetailResponse[url]: \n" + url);
        var allLink = [];
        _$(html).find('div[class*="list-severs"]').find("a").each(function() {
            var name = this.text();
            var link = this.attr("data-src");
            allLink.push({ link: link, name: name });
        });

        let selectedLink = null;
        const pool = { k4: null, hd: null, anyM3u8: null, anyEmbed: null };
        allLink.forEach((item) => {
            if (item.name.match(/4k/i) && item.link.endsWith('.m3u8')) {
                pool.k4 = item.link;
            } else if (item.name.match(/1080/i) && item.link.endsWith('.m3u8')) {
                pool.hd = item.link;
            } else if (item.link.endsWith('.m3u8')) {
                pool.anyM3u8 = item.link;
            } else if (item.link.includes('abyss')) {
                pool.anyEmbed = item.link;
            }
        });

        selectedLink = pool.hd || pool.k4 || pool.anyM3u8 || pool.anyEmbed;
        if (url.indexOf("type=4k") > -1) {
            selectedLink = pool.k4 || pool.hd || pool.anyM3u8 || pool.anyEmbed;
            log("parseDetailResponse[url]: \nĐã chọn 4K: " + selectedLink);
        }

        var streamlink = selectedLink ? selectedLink.replace(/(https?:\/\/[^\/]+)\/[^]+?\/([^\/]+\.m3u8)$/, '$1/stream/m3u8/$2') : "";
        var isEmbed = false;
        console.log("StreamLink\n" + streamlink);
        var css = "*"
        if(streamlink.indexOf("abysscdn") > -1){
          console.log("Link hydrax:\n" + streamlink)
          var idvd = streamlink.replace("https://abysscdn.com/","");
          var link = "https://abysscdn.com/?v=" + idvd;
          url = "https://iframe.alokillgtv.workers.dev/?url=" + link;
          css = "";
        }
        return JSON.stringify({
            "url": url,
            "isEmbed": isEmbed,
            "headers": {
                "Referer": "https://yanhh3d.mom",
                "Origin": "https://yanhh3d.mom",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Custom-Js": customJS(streamlink),
              "Block-Css": css
            }
        });

    } catch (e) {
        log("parseDetailResponse[err]:\n " + e);
        return JSON.stringify({ "url": "", "headers": {} });
    }
}
*/
function parseDetailResponse(html, url) {
    try {
        log("parseDetailResponse[url]: \n" + url);

        // ================================================================
        // [1] Xác định quality user đã chọn từ URL
        // ================================================================
        var userQuality = "1080+"; // default
        if (url.indexOf("type=4k") > -1)          userQuality = "4K";
        else if (url.indexOf("type=1080m") > -1)  userQuality = "1080-";
        else if (url.indexOf("type=other") > -1)  userQuality = "Khác";

        log("[user] Quality chọn: " + userQuality);

        // ================================================================
        // [2] Parse list server
        // ================================================================
        var allLink = [];
        _$(html).find('div[class*="list-severs"]').find("a").each(function() {
            var name = this.text();
            var link = this.attr("data-src");
            allLink.push({ link: link, name: name });
        });

        function classifyQualityFromName(name) {
            var s = String(name).toLowerCase();
            if (/\b4k\b|2160/.test(s))  return "4K";
            if (/1080\s*\+/.test(s))    return "1080+";
            if (/1080\s*-/.test(s))     return "1080-";
            if (/1080/.test(s))         return "1080+";
            return "Khác";
        }

        // ================================================================
        // [3] Phân pool theo quality
        // ================================================================
        var pool = { "4K": [], "1080+": [], "1080-": [], "Khác": [], abyss: [] };

        allLink.forEach(function(item) {
            if (!item.link) return;
            if (item.link.indexOf('abysscdn') > -1 || item.link.indexOf('abyss') > -1) {
                pool.abyss.push(item.link);
                return;
            }
            if (!item.link.endsWith('.m3u8')) return;
            var q = classifyQualityFromName(item.name);
            pool[q].push(item.link);
        });

        log("[pool] 4K=" + pool["4K"].length
            + " | 1080+=" + pool["1080+"].length
            + " | 1080-=" + pool["1080-"].length
            + " | Khác=" + pool["Khác"].length
            + " | abyss=" + pool.abyss.length);

        // ================================================================
        // [4] Build thứ tự ưu tiên theo quality user chọn
        // ================================================================
        var priorityOrder;
        if (userQuality === "4K") {
            priorityOrder = ["4K", "1080+", "1080-", "Khác"];
        } else if (userQuality === "1080+") {
            priorityOrder = ["1080+", "1080-", "4K", "Khác"];
        } else if (userQuality === "1080-") {
            priorityOrder = ["1080-", "Khác", "1080+", "4K"];
        } else {
            priorityOrder = ["Khác", "1080-", "1080+", "4K"];
        }
        log("[priority] " + priorityOrder.join(" > "));

        var orderedCandidates = [];
        var seenLink = {};
        priorityOrder.forEach(function(q) {
            pool[q].forEach(function(l) {
                if (!seenLink[l]) {
                    seenLink[l] = true;
                    orderedCandidates.push({ link: l, quality: q });
                }
            });
        });

        if (orderedCandidates.length === 0 && pool.abyss.length === 0) {
            log("[fallback] Không có link nào trong pool");
            toast("Link stream tập này toàn bộ bị lỗi, vui lòng xem tập khác");
            return JSON.stringify({
                url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
                isEmbed: false,
                mimeType: "video/mp4",
                headers: {}
            });
        }

        // ================================================================
        // [5] Helper: resolve link (decode data-obf / var cccc)
        // ================================================================
        function resolveLink(candidateLink) {
            var page = yanFetchPage(candidateLink, YAN_REF);
            if (!page) {
                log("[resolve] body rỗng (cả vax.local)");
                return null;
            }
            var body = page;

            var resolved = candidateLink;

            if (body.indexOf("body") > -1) {
                if (body.indexOf("data-obf") > -1) {
                    var $doc = _$(body);
                    var key = $doc.find("#player").attr("data-obf");
                    if (key) {
                        try {
                            var decode = BASE64.decode(key);
                            var $data = JSON.parse(decode);
                            if ($data && $data.pU) {
                                resolved = $data.pU;
                                log("[resolve] data-obf -> " + resolved);
                            }
                        } catch (eDecode) {
                            log("[resolve] data-obf decode fail: " + eDecode);
                        }
                    }
                }

                if (body.indexOf("var cccc") > -1) {
                    var match = body.match(/var cccc[^'"]+["']([^'"]+)["']/i);
                    if (match && match[1]) {
                        resolved = match[1];
                        log("[resolve] var cccc -> " + resolved);
                    }
                }
            }

            // Verify m3u8
            try {
                var vbody = yanFetchPage(resolved, YAN_REF);
                if (!vbody) {
                    log("[verify] body rỗng: " + resolved);
                    return null;
                }

                var bodyTrim = vbody.trim();

                if (bodyTrim.indexOf("#EXTM3U") > -1) {
                    log("[verify] ✅ m3u8: " + resolved + " len=" + vbody.length);
                    return resolved;
                }

                log("[verify] ❌ Không phải m3u8: " + bodyTrim.substring(0, 120));
                return null;
            } catch (eV) {
                log("[verify] fetch fail: " + eV);
                return null;
            }
        }

        // ================================================================
        // [6] Loop candidates theo priority
        // ================================================================
        var finalStream = null;

        for (var i = 0; i < orderedCandidates.length; i++) {
            var candidate = orderedCandidates[i];
            log("[try] #" + (i + 1) + "/" + orderedCandidates.length
                + " [" + candidate.quality + "]: " + candidate.link);

            var resolved = resolveLink(candidate.link);
            if (resolved) {
                finalStream = resolved;
                if (i > 0) {
                    toast("Link stream bạn chọn đang lỗi, sẽ chuyển sang link stream khác của tập này để phát");
                }
                break;
            }
            log("[try] ❌ fail, thử tiếp...");
        }

        // ================================================================
        // [7] Fallback abyss (transform sang ?v=)
        // ================================================================
        if (!finalStream && pool.abyss.length > 0) {
            log("[fallback] m3u8 hết, chuyển sang abyss...");

            for (var j = 0; j < pool.abyss.length; j++) {
                var abyssOrig = pool.abyss[j];
                var m = abyssOrig.match(/^https?:\/\/abysscdn\.com\/([A-Za-z0-9]+)\/?$/i);
                var abyssLink = (m && m[1])
                    ? "https://abysscdn.com/?v=" + m[1]
                    : abyssOrig;

                log("[abyss] " + abyssOrig + " -> " + abyssLink);
                toast("Link stream bạn chọn đang lỗi, sẽ chuyển sang link stream khác của tập này để phát");

                return JSON.stringify({
                    url: abyssLink,
                    mimeType: "video/mp4",
                    isEmbed: false,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                });
            }
        }

        // ================================================================
        // [8] Tất cả fail
        // ================================================================
        if (!finalStream) {
            log("[fallback] ❌ Toàn bộ link đều fail");
            toast("Link stream tập này toàn bộ bị lỗi, vui lòng xem tập khác");
            return JSON.stringify({
                url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
                isEmbed: false,
                mimeType: "video/mp4",
                headers: {}
            });
        }

        // ================================================================
        // [9] Return m3u8 OK
        // ================================================================
        log("[OK] streamlink cuối: " + finalStream);

        var rawPl = "";
        try { rawPl = yanFetchPage(finalStream, YAN_REF); } catch (ePl) { log("[playlist] err: " + ePl); }
        var rangedPl = rawPl ? yanRangeM3u8(rawPl) : "";
        if (rangedPl) log("[playlist] m3u8Content len=" + rangedPl.length);

        var out = {
            "url": finalStream,
            mimeType: "application/x-mpegURL",
            "isEmbed": false,
            "headers": {
                "Referer": YAN_REF + "/",
                "Origin": YAN_REF,
                "User-Agent": YAN_UA,
                "Accept-Encoding": "identity"
            }
        };
        if (rangedPl && rangedPl.indexOf("#EXTM3U") > -1) {
            out["m3u8Content"] = rangedPl;
            out["baseUrl"] = finalStream;
        }
        return JSON.stringify(out);

    } catch (e) {
        log("parseDetailResponse[err]:\n " + e);
        toast("Link stream tập này toàn bộ bị lỗi, vui lòng xem tập khác");
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            isEmbed: false,
            mimeType: "video/mp4",
            headers: {}
        });
    }
}


function parseEmbedResponse(html, url, datasend) {
 // console.log("embed Raw:\n" + html)
  try {
      var $data = JSON.parse(html);
      var stream = $data.streams[0].url;
      return JSON.stringify({
        url: stream + "#.m3u8" || url,
        isEmbed: false, // STOP đệ quy - Trả kết quả cho App phát Video
        mimeType: "video/mp4",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      
  } catch (e) {
    console.log("[Lỗi parseEmbedResponse]", e);
    return JSON.stringify({ url: "", isEmbed: false, headers: {} });
  }
}


function customJS(initialLink) {
  return `
(function () {
    'use strict';

    // Biến trạng thái
    let baseM3u8Url = null;
    let hasSentToBridge = false;
    let fallbackTimer = null;

    // Lưu lại hàm fetch gốc ngay từ đầu để dùng nội bộ, tránh bị hook vòng lặp
    const rawFetch = window.fetch;
    const rawXHROpen = XMLHttpRequest.prototype.open;
    const rawSetAttribute = Element.prototype.setAttribute;

    // ==========================================
    // 1. HỆ THỐNG TOAST MINI
    // ==========================================
    function injectToastStyles() {
        if (document.getElementById('ts-toast-styles')) return;
        const style = document.createElement('style');
        style.id = 'ts-toast-styles';
        style.textContent = \`
            #ts-toast-container { position: fixed; top: 15px; right: 15px; z-index: 999999999; display: flex; flex-direction: column; gap: 8px; max-width: 420px; pointer-events: none; font-family: monospace; }
            .ts-toast { background: #1e1e2e; color: #cdd6f4; border-left: 4px solid #a6e3a1; padding: 10px 14px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); font-size: 11px; line-height: 1.4; pointer-events: auto; word-break: break-all; animation: tsSlideIn 0.25s ease-out, tsFadeOut 0.5s ease 9.5s forwards; }
            .ts-toast-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .ts-toast-title { font-weight: bold; color: #a6e3a1; }
            .ts-toast-time { font-size: 10px; color: #a6adc8; }
            .ts-toast-body { max-height: 120px; overflow-y: auto; white-space: pre-wrap; background: #11111b; padding: 6px; border-radius: 4px; }
            @keyframes tsSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes tsFadeOut { from { opacity: 1; } to { opacity: 0; } }
        \`;
        (document.head || document.documentElement).appendChild(style);
    }

    function showToast(title, content) {
        try {
            injectToastStyles();
            let container = document.getElementById('ts-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'ts-toast-container';
                (document.body || document.documentElement).appendChild(container);
            }
            const toast = document.createElement('div');
            toast.className = 'ts-toast';
            const timeStr = new Date().toLocaleTimeString();
            const contentFormatted = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
            toast.innerHTML = \`<div class="ts-toast-header"><span class="ts-toast-title">\${title}</span><span class="ts-toast-time">\${timeStr}</span></div><div class="ts-toast-body">\${contentFormatted}</div>\`;
            container.appendChild(toast);
            setTimeout(() => toast && toast.remove(), 10000);
        } catch (e) { console.error('Toast error:', e); }
    }

    // ==========================================
    // 2. LOGIC NATIVE BRIDGE & STREAM ANALYSIS
    // ==========================================

    function isTargetUrl(url) {
        if (!url || typeof url !== 'string') return false;
        return url.includes('.m3u8') || url.includes('.mpd');
    }

    function hasToken(url) {
        if (!url.includes('?')) return false;
        const queryString = url.split('?')[1] || '';
        return queryString.length > 15 || queryString.includes('token') || queryString.includes('oh=') || queryString.includes('bytestart');
    }

    function sendToNativeBridge(playUrl, isTokenUrl) {
        if (hasSentToBridge) return; // Tránh gửi đúp
        hasSentToBridge = true;
        
        if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }

        const pageUrl = window.location.href;
        if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
            try {
                window.SnifferBridge.play(playUrl, pageUrl);
                showToast(isTokenUrl ? '🚀 Gửi Native: Link Có Token' : '⚡ Gửi Native: Link Gốc Trực Tiếp', { playUrl, pageUrl });
            } catch (err) {
                showToast('❌ Lỗi SnifferBridge.play', err.message);
            }
        } else {
            showToast('⚠️ SnifferBridge Chưa Sẵn Sàng', \`Link: \${playUrl}\`);
        }
    }

    async function verifyAndProcessRawM3u8(url) {
        try {
            showToast('🔍 Đang fetch thử link gốc...', url);
            // Dùng rawFetch để không bị lặp vô hạn vào hook của chính mình
            const response = await rawFetch(url);
            
            if (response.ok) {
                const text = await response.text();
                // Kiểm tra xem file trả về có đúng chuẩn M3U8 không
                if (text.includes('#EXTM3U')) {
                    if (!hasSentToBridge) {
                        showToast('✅ Link gốc phát được ngay (Không cần token)', 'Gửi tới Native lập tức!');
                        sendToNativeBridge(url, false);
                    }
                    return;
                }
            }
            throw new Error(\`Status \${response.status} hoặc không phải M3U8 chuẩn.\`);
        } catch (error) {
            // Lỗi 403, 401 hoặc CORS -> Cần token
            showToast('⏳ Link gốc bị khóa. Bắt đầu chờ Iframe/Network lấy Token...', error.message);
            
            // Cài đặt hàng chờ 20s (nếu không lấy được token nào thì gửi tạm link gốc)
            if (!fallbackTimer && !hasSentToBridge) {
                fallbackTimer = setTimeout(() => {
                    if (!hasSentToBridge && baseM3u8Url) {
                        showToast('⏳ Hết 20s không thấy Token', 'Kích hoạt Fallback gửi link gốc.');
                        sendToNativeBridge(baseM3u8Url, false);
                    }
                }, 20000);
            }
        }
    }

    function processDetectedUrl(url) {
        if (!isTargetUrl(url)) return;
        if (hasSentToBridge) return; // Nếu đã gửi rồi thì bỏ qua mọi link sau đó

        const isToken = hasToken(url);

        if (isToken) {
            sendToNativeBridge(url, true);
        } else {
            // Chỉ lưu và test link gốc lần đầu tiên
            if (!baseM3u8Url) {
                baseM3u8Url = url;
                verifyAndProcessRawM3u8(url);
            }
        }
    }

    // ==========================================
    // 3. HOOK NETWORK & DOM
    // ==========================================

    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
        processDetectedUrl(url);
        return rawFetch.apply(this, args);
    };

    XMLHttpRequest.prototype.open = function (method, url) {
        processDetectedUrl(url);
        return rawXHROpen.apply(this, arguments);
    };

    Element.prototype.setAttribute = function (name, value) {
        if (this.tagName === 'IFRAME' && this.closest && this.closest('#video-player')) {
            processDetectedUrl(value);
        }
        return rawSetAttribute.apply(this, arguments);
    };

    const domObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const iframes = node.tagName === 'IFRAME' ? [node] : node.querySelectorAll('#video-player iframe');
                    iframes.forEach(iframe => {
                        processDetectedUrl(iframe.src);
                    });
                }
            });
        });
    });

    domObserver.observe(document.documentElement, { childList: true, subtree: true });

})();
`;
}
function sortEpisodesByName(data) {
    try {
        data.forEach(server => {
            if (server.episodes && Array.isArray(server.episodes)) {
                server.episodes.sort((a, b) => {
                    const matchA = a.name.match(/Tập\s*(\d+)/i);
                    const matchB = b.name.match(/Tập\s*(\d+)/i);

                    const numA = matchA ? parseInt(matchA[1], 10) : 0;
                    const numB = matchB ? parseInt(matchB[1], 10) : 0;

                    return numA - numB;
                });
            }
        });
        return data;
    } catch (e) {
        log("sortEpisodesByName[err]:\n " + e);
        return data;
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        log("parseCategoriesResponse[err]:\n " + e);
        return JSON.stringify([]);
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
// https://k8s.onflixcdn.com/api/movies?sort=year_desc&limit=24&category=chien-tranh
function getLISTmenu() {
    return `
/the-loai/huyen-huyen@@Huyền Huyễn
/the-loai/xuyen-khong@@Xuyên Không
/the-loai/trung-sinh@@Trùng Sinh
/the-loai/tien-hiep@@Tiên Hiệp
/the-loai/co-trang@@Cổ Trang
/the-loai/hai-huoc@@Hài Hước
/the-loai/kiem-hiep@@Kiếm Hiệp
/the-loai/hien-dai@@Hiện Đại
`
}

function buildMenu(listurl){let menulist=[];if (!listurl)return menulist;let lines=listurl.split('\n');for (let i=0;i < lines.length;i++){let line=lines[i].trim();if (!line||line.indexOf('@@')===-1)continue;let parts=line.split('@@');let link=parts[0]?parts[0].trim():"";let name=parts[1]?parts[1].trim():"";let check=parts[2]?parts[2].trim():undefined;if (!link||!name)continue;let item={};if (check==="false"){item={"slug":link,"title":name,"type":"Horizontal"};}else if (check==="true"){item={"slug":link,"title":name,"type":"Grid"};}else{item={"slug":link,"name":name};}menulist.push(item);}return menulist;}
function _$(htmlOrBlock){if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) {return htmlOrBlock;} var instance = {sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),find: function (selector) {if (selector.indexOf(',') !== -1) {var results = [];var selectors = selector.split(',').map(function (s) {return s.trim();});for (var s = 0;s < selectors.length;s++) {if (selectors[s] === "") continue;var subInstance = this.find(selectors[s]);for (var r = 0;r < subInstance.elements.length;r++) {var element = subInstance.elements[r];if (results.indexOf(element) === -1) {results.push(element);}}} var multiInstance = _$(results);multiInstance.sourceHtml = this.sourceHtml;return multiInstance;} var results = [];var contentFilter = "";if (selector.indexOf(":content(") !== -1) {var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch) {contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || "";selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}} var attrNameFilter = "";var attrValueFilter = "";var attrOperator = "=";var hasAttrFilter = false;var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if (attrMatch) {hasAttrFilter = true;attrNameFilter = attrMatch[1];attrOperator = attrMatch[2];attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || "";selector = selector.replace(/\[.*?\]/,"");} var notSelector = "";if (selector.indexOf(":not(") !== -1) {var notMatch = selector.match(/:not\(([^)]+)\)/);if (notMatch) {notSelector = notMatch[1];selector = selector.replace(/:not\([^)]+\)/,"");}} var isFirstFilter = selector.indexOf(":first") !== -1;var isLastFilter = selector.indexOf(":last") !== -1;selector = selector.replace(/:first|:last/g,"");var targetTagName = "";var targetId = "";var targetClasses = [];var selectorToParse = selector.trim();if (selectorToParse !== "") {var idIndex = selectorToParse.indexOf('#');if (idIndex !== -1) {var afterId = selectorToParse.substring(idIndex + 1);var nextDot = afterId.indexOf('.');targetId = nextDot === -1 ? afterId : afterId.substring(0,nextDot);selectorToParse = selectorToParse.substring(0,idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1));} var classParts = selectorToParse.split('.');var possibleTag = classParts.shift();if (possibleTag) {targetTagName = possibleTag.toLowerCase();} targetClasses = classParts.filter(function (c) {return c.length > 0;});} for (var i = 0;i < this.elements.length;i++) {var currentHtml = this.elements[i];var pos = 0;var subResults = [];while ((pos = currentHtml.indexOf('<',pos)) !== -1) {if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') {pos++;continue;} var endOpenTag = -1;var insideQuote = false;var quoteChar = '';for (var j = pos + 1;j < currentHtml.length;j++) {var char = currentHtml.charAt(j);if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') {if (!insideQuote) {insideQuote = true;quoteChar = char;} else if (char === quoteChar) {insideQuote = false;}} if (char === '>' && !insideQuote) {endOpenTag = j;break;}} if (endOpenTag === -1) break;var fullOpenTag = currentHtml.substring(pos,endOpenTag + 1);var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/);var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : "";var isMatched = true;if (targetTagName && targetTagName !== currentTagName) {isMatched = false;} var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : "";var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : "";if (isMatched && targetId && idMatchStr !== targetId) {isMatched = false;} if (isMatched && targetClasses.length > 0) {if (classMatchStr) {var currentClasses = classMatchStr.trim().split(/\s+/);for (var c = 0;c < targetClasses.length;c++) {if (currentClasses.indexOf(targetClasses[c]) === -1) {isMatched = false;break;}}} else {isMatched = false;}} if (isMatched && hasAttrFilter) {var actualValue = "";if (attrNameFilter === "class") {actualValue = classMatchStr;} else if (attrNameFilter === "id") {actualValue = idMatchStr;} else {var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : "";} var attrExists = fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=','i')) !== -1;if (!attrExists) {isMatched = false;} else {if (attrOperator === "=") {if (attrNameFilter === "class") {var classes = actualValue.trim().split(/\s+/);if (classes.indexOf(attrValueFilter) === -1) isMatched = false;} else if (actualValue !== attrValueFilter) {isMatched = false;}} else if (attrOperator === "*=") {if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false;} else if (attrOperator === "^=") {if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false;} else if (attrOperator === "$=") {if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false;}}} if (isMatched) {var startTagPos = pos;var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {var depth = 1;var scanPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && scanPos < currentHtml.length) {var nextOpen = currentHtml.indexOf(openStr,scanPos);var nextClose = currentHtml.indexOf(closeStr,scanPos);if (nextClose === -1) {scanPos = currentHtml.length;break;} if (nextOpen !== -1 && nextOpen < nextClose) {depth++;scanPos = nextOpen + openStr.length;} else {depth--;scanPos = nextClose + closeStr.length;if (depth === 0) endTagPos = nextClose + closeStr.length;}}} var foundBlock = currentHtml.substring(startTagPos,endTagPos);if (contentFilter) {var pureText = foundBlock.replace(/<[^>]+>/g,"").trim();if (pureText.indexOf(contentFilter) === -1) {pos = endTagPos;continue;}} if (notSelector) {var isNotClass = notSelector.indexOf('.') === 0;var isNotId = notSelector.indexOf('#') === 0;var notValue = notSelector.substring(1);var hasNot = false;if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true;if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true;if (!hasNot) subResults.push(foundBlock);} else {subResults.push(foundBlock);} pos = endTagPos;} else {pos++;}} if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]];if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]];results = results.concat(subResults);} var newInstance = _$(results);newInstance.sourceHtml = this.sourceHtml || currentHtml;return newInstance;},each: function (callback) {for (var i = 0;i < this.elements.length;i++) {var childInstance = _$(this.elements[i]);childInstance.sourceHtml = this.sourceHtml;callback.call(childInstance,i,this.elements[i]);} return this;},eq: function (index) {if (index < 0) index = this.elements.length + index;var matchedElement = this.elements[index];this.elements = matchedElement ? [matchedElement] : [];return this;},attr: function (attrName) {if (this.elements.length === 0) return "";var elem = this.elements[0];var getAttr = elem.match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : "";},html: function () {if (this.elements.length === 0) return "";var elem = this.elements[0];var start = elem.indexOf('>') + 1;var end = elem.lastIndexOf('</');if (start > 0 && end > start) return elem.substring(start,end);return "";},text: function (separator) {if (this.elements.length === 0) return "";var elem = this.elements[0];var start = elem.indexOf('>') + 1;var end = elem.lastIndexOf('</');if (start > 0 && end > start) {var content = elem.substring(start,end);var pureText = content.replace(/<\/?[^>]+(>|$)/g,"");if (typeof separator === 'string') {return pureText .split('\n') .map(function (item) {return item.trim();}) .filter(function (item) {return item !== '';}) .join(separator);} return pureText.trim();} return "";},next: function () {var results = [];if (!this.sourceHtml) return this;for (var i = 0;i < this.elements.length;i++) {var elem = this.elements[i];var idx = this.sourceHtml.indexOf(elem);if (idx === -1) continue;var scanPos = idx + elem.length;var nextOpen = this.sourceHtml.indexOf('<',scanPos);if (nextOpen !== -1) {if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue;var endOpenTag = this.sourceHtml.indexOf('>',nextOpen);if (endOpenTag === -1) continue;var fullOpenTag = this.sourceHtml.substring(nextOpen,endOpenTag + 1);var spacePos = fullOpenTag.indexOf(' ');var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1,fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1,spacePos).toLowerCase();var startTagPos = nextOpen;var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {var depth = 1;var sPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && sPos < this.sourceHtml.length) {var nOpen = this.sourceHtml.indexOf(openStr,sPos);var nClose = this.sourceHtml.indexOf(closeStr,sPos);if (nClose === -1) break;if (nOpen !== -1 && nOpen < nClose) {depth++;sPos = nOpen + openStr.length;} else {depth--;sPos = nClose + closeStr.length;if (depth === 0) endTagPos = nClose + closeStr.length;}}} results.push(this.sourceHtml.substring(startTagPos,endTagPos));}} var nextInstance = _$(results);nextInstance.sourceHtml = this.sourceHtml;this.elements = results;return this;},parent: function () {var results = [];if (!this.sourceHtml) return this;for (var i = 0;i < this.elements.length;i++) {var elem = this.elements[i];var idx = this.sourceHtml.indexOf(elem);if (idx <= 0) continue;var scanPos = idx - 1;while (scanPos >= 0) {var openTagPos = this.sourceHtml.lastIndexOf('<',scanPos);if (openTagPos === -1) break;if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this.sourceHtml.charAt(openTagPos + 1) !== '!') {var endOpenTag = this.sourceHtml.indexOf('>',openTagPos);if (endOpenTag !== -1 && endOpenTag > openTagPos) {var fullOpenTag = this.sourceHtml.substring(openTagPos,endOpenTag + 1);var spacePos = fullOpenTag.indexOf(' ');var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1,fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1,spacePos).toLowerCase();var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {var depth = 1;var sPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && sPos < this.sourceHtml.length) {var nOpen = this.sourceHtml.indexOf(openStr,sPos);var nClose = this.sourceHtml.indexOf(closeStr,sPos);if (nClose === -1) break;if (nOpen !== -1 && nOpen < nClose) {depth++;sPos = nOpen + openStr.length;} else {depth--;sPos = nClose + closeStr.length;if (depth === 0) endTagPos = nClose + closeStr.length;}}} if (endTagPos >= idx + elem.length) {var parentBlock = this.sourceHtml.substring(openTagPos,endTagPos);if (results.indexOf(parentBlock) === -1) results.push(parentBlock);break;}}} scanPos = openTagPos - 1;}} var parentInstance = _$(results);parentInstance.sourceHtml = this.sourceHtml;this.elements = results;return this;},closest: function (selector) {var results = [];if (!this.sourceHtml || this.elements.length === 0) return _$([]);for (var i = 0;i < this.elements.length;i++) {var currentElem = this.elements[i];var currentObj = _$(currentElem);currentObj.sourceHtml = this.sourceHtml;var selfCheck = _$(this.sourceHtml).find(selector);var isSelfMatched = false;for (var s = 0;s < selfCheck.elements.length;s++) {if (selfCheck.elements[s] === currentElem) {isSelfMatched = true;break;}} if (isSelfMatched) {if (results.indexOf(currentElem) === -1) results.push(currentElem);continue;} var parentObj = currentObj.parent();while (parentObj.elements.length > 0) {var parentElem = parentObj.elements[0];var checkMatch = _$(this.sourceHtml).find(selector);var isMatched = false;for (var j = 0;j < checkMatch.elements.length;j++) {if (checkMatch.elements[j] === parentElem) {isMatched = true;break;}} if (isMatched) {if (results.indexOf(parentElem) === -1) results.push(parentElem);break;} parentObj = parentObj.parent();}} var closestInstance = _$(results);closestInstance.sourceHtml = this.sourceHtml;return closestInstance;}};return instance;}
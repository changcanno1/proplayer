// =============================================================================
// PLUGIN ZOPHIM - VAAPP
// Nguồn: https://api-zophim.blogspot.com  (Blogger) + API JSON https://anisrc.top
//  - Danh sách/trang chủ: Blogger feeds (label / q) + API update/search (NDJSON)
//  - Chi tiết: API /api/v1/list/<slug>  -> mỗi tập có 2 URL (vs = Vietsub, tm = Thuyết Minh)
//  - Phát: ssplay.net player -> giải mã (Dean Edwards packer) lấy m3u8, hoặc HY -> abysscdn
//  - 2 server: Vietsub + Thuyết Minh, tự dò sub-server (SU/SG/ST/CF/HY...) + fallback khi lỗi
// =============================================================================

var SITE   = "https://api-zophim.blogspot.com";
var API    = "https://anisrc.top/api/v1";
var SSPLAY = "https://ssplay.net";
var PAGE   = 24;

// key ASCII (dùng trong slug) -> tên thể loại thật (dùng khi search)
var GENRE_MAP = {
  "vien-tuong": "Viễn Tưởng", "hanh-dong": "Hành Động", "co-trang": "Cổ Trang",
  "tinh-yeu": "Tình Yêu", "kinh-di": "Kinh Dị", "hoat-hinh": "Hoạt Hình",
  "phieu-luu": "Phiêu Lưu", "hai-huoc": "Hài Hước", "tam-ly": "Tâm Lý",
  "vo-thuat": "Võ Thuật", "tai-lieu": "Tài Liệu", "gia-dinh": "Gia Đình",
  "hinh-su": "Hình Sự", "bi-an": "Bí Ẩn", "than-thoai": "Thần Thoại",
  "co-dien": "Cổ Điển", "chien-tranh": "Chiến Tranh", "am-nhac": "Âm Nhạc",
  "the-thao": "Thể Thao", "hoc-duong": "Học Đường", "thanh-xuan": "Thanh Xuân"
};

var UA = "Mozilla/5.0 (Linux; Android 13; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
var WINUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ---------- Log ----------
function logIt(m) { try { log("[zophim] " + m); } catch (e) {} }

// ---------- HTTP ----------
function httpGet(url, extra) {
  var h = { "User-Agent": UA, "Accept": "*/*" };
  if (extra) { for (var k in extra) { h[k] = extra[k]; } }
  try {
    var r = httpRequest(url, { method: "GET", headers: h });
    return (r && r.body) ? String(r.body) : "";
  } catch (e) { logIt("httpGet err " + url + " : " + e); return ""; }
}

// =============================================================================
// MANIFEST
// =============================================================================
function getManifest() {
  return JSON.stringify({
    "id": "zophim",
    "name": "Zophim",
    "version": "1.0",
    "author": "alokillgtv",
    "info": "Zophim — tổng hợp phim (Vietsub / Thuyết Minh), tự dò server khi phát.",
    "baseUrl": SITE,
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/zophim.png",
    "isEnabled": true,
    "isAdult": false,
    "type": "MOVIE",
    "layoutType": "VERTICAL",
    "orientation": "auto",
    "debug": true,
    "playerType": "exoplayer"
  });
}

// =============================================================================
// HOME / MENU
// =============================================================================
function getHomeSections() {
  return JSON.stringify([
    { slug: "cat_Series",        title: "Phim Bộ",           type: "Horizontal" },
    { slug: "cat_Movie",         title: "Phim Lẻ",           type: "Horizontal" },
    { slug: "phim-moi",          title: "Phim Mới Cập Nhật", type: "Grid" },
  ]);
}

function getPrimaryCategories() {
  var out = [];
  for (var key in GENRE_MAP) {
    out.push({ name: GENRE_MAP[key], slug: "genre_" + key });
  }
  return JSON.stringify(out);
}

function getFilterConfig() {
  try { return JSON.stringify({ category: JSON.parse(getPrimaryCategories()) }); }
  catch (e) { return JSON.stringify({ category: [] }); }
}

// =============================================================================
// URL BUILDERS
// =============================================================================
function feedUrl(label, page) {
  var start = (page - 1) * PAGE + 1;
  var path = label === null ? "/feeds/posts/default" : "/feeds/posts/default/-/" + encodeURIComponent(label);
  return SITE + path + "?alt=json&max-results=" + PAGE + "&start-index=" + start;
}

function getUrlList(slug, filtersJson) {
  var page = 1;
  try { page = parseInt(JSON.parse(filtersJson || "{}").page, 10) || 1; } catch (e) {}
  slug = String(slug || "");

  if (slug === "phim-moi" || slug === "home" || slug === "") {
    return feedUrl(null, page);
  }
  if (slug.indexOf("cat_") === 0) {
    return feedUrl(slug.substring(4), page);
  }
  if (slug.indexOf("genre_") === 0) {
    var key = slug.substring(6);
    var term = GENRE_MAP[key] || key;
    console.log("Thể Loại URL\n" + API + "/search/" + encodeURIComponent(term) + "/" + page)
    return "https://example.com?theloai=" + encodeURIComponent(term) + "&page=" + page
    //return API + "/search/" + encodeURIComponent(term) + "/" + page;
  }
  // mặc định coi như từ khoá
  return API + "/search/" + encodeURIComponent(slug) + "/" + page;
}

function getUrlSearch(keyword, filtersJson) {
  var page = 1;
  try { page = parseInt(JSON.parse(filtersJson || "{}").page, 10) || 1; } catch (e) {}
  return API + "/search/" + encodeURIComponent(String(keyword || "")) + "/" + page;
}

function getUrlDetail(slug, datasend) {
  // slug có thể là URL tập phim (ssplay) hoặc slug phim
  if (slug && String(slug).indexOf("http") === 0) { return String(slug); }
  // chi tiết: đọc trực tiếp Blogger feed theo tiêu đề (ổn định, không qua proxy)
  return SITE + "/feeds/posts/default?alt=json&max-results=10&q=" + encodeURIComponent(String(slug || ""));
}

function getUrlCategories() {
  // URL nhẹ (app chỉ cần fetch cho có, parseCategoriesResponse mới là nơi trả thể loại)
  return feedUrl(null, 1);
}

// =============================================================================
// LIST / SEARCH PARSER
// =============================================================================
function extractPoster(content) {
  var m = String(content || "").match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1].replace(/&amp;/g, "&") : "";
}
function extractName(content, fallback) {
  var m = String(content || "").match(/<font[^>]*color=["']?limegreen["']?[^>]*>([^<]+)</i);
  return m ? m[1].trim() : fallback;
}

function pageFromUrl(apiUrl) {
  var m = String(apiUrl || "").match(/start-index=(\d+)/);
  if (m) { return Math.floor((parseInt(m[1], 10) - 1) / PAGE) + 1; }
  m = String(apiUrl || "").match(/\/(\d+)\s*$/);
  if (m) { return parseInt(m[1], 10) || 1; }
  return 1;
}

function parseListResponse(html, apiUrl) {
  console.log("ListUrl\n" + apiUrl);
  if(apiUrl.indexOf("theloai") > -1){
    var theloai = getparam(apiUrl,"theloai");
    var page = getparam(apiUrl,"page");
    var link = API + "/search/" + encodeURIComponent(theloai) + "/" + page;
    var res = httpRequest(link, {
    method: "GET"
    });
    console.log("HTML của trang thể loại\n" + res.body.slice(0,500));
    html = res.body
  }
  var items = [];
  var curPage = pageFromUrl(apiUrl);
  var totalPages = curPage + 1;
  var text = String(html || "");

  try {
    if (text.indexOf("openSearch$totalResults") !== -1) {
      // ---- Blogger feed JSON ----
      var j = JSON.parse(text);
      var entries = (j.feed && j.feed.entry) ? j.feed.entry : [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        var slug = e.title ? e.title.$t : "";
        var c = e.content ? e.content.$t : (e.summary ? e.summary.$t : "");
        var name = extractName(c, slug);
        var poster = extractPoster(c);
        items.push({
          id: slug,
          title: name,
          posterUrl: poster,
          backdropUrl: poster,
          quality: "HD",
          datasend: JSON.stringify({ slug: slug, title: name, posterUrl: poster })
        });
      }
      var tr = j.feed && j.feed.openSearch$totalResults ? parseInt(j.feed.openSearch$totalResults.$t, 10) : 0;
      totalPages = tr > 0 ? Math.ceil(tr / PAGE) : curPage;
    } else {
      // ---- anisrc NDJSON ----
      var lines = text.split("\n");
      for (var li = 0; li < lines.length; li++) {
        var ln = lines[li].trim();
        if (!ln) { continue; }
        var o;
        try { o = JSON.parse(ln); } catch (e2) { continue; }
        if (!o || !o.slug) { continue; }
        items.push({
          id: o.slug,
          title: o.ten_phim || o.slug,
          posterUrl: o.poster || "",
          backdropUrl: o.poster || "",
          description: o.noi_dung || "",
          year: o.nam_chieu || "",
          quality: "HD",
          episode_current: o.trang_thai || "",
          datasend: JSON.stringify({
            slug: o.slug, title: o.ten_phim || o.slug,
            posterUrl: o.poster || "", description: o.noi_dung || "",
            year: o.nam_chieu || "", category: o.the_loai || "",
            status: o.trang_thai || ""
          })
        });
      }
      totalPages = items.length > 0 ? (curPage + 1) : curPage;
    }
  } catch (e) {
    logIt("parseListResponse err: " + e);
  }

  return JSON.stringify({
    items: items,
    pagination: { currentPage: curPage, totalPages: totalPages, totalItems: items.length, itemsPerPage: PAGE }
  });
}

function parseSearchResponse(html, apiUrl) { return parseListResponse(html, apiUrl); }

// =============================================================================
// DETAIL
// =============================================================================
// Lấy danh sách tập {tap,vs,tm} từ nội dung 1 entry Blogger (bảng server list)
function episodesFromContent(content) {
  var c = String(content || "");
  var m = c.match(/<td[^>]*class="[^"]*ALL[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
  var seg = m ? m[1] : c;
  var rawLines = seg.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").split("\n");
  var eps = [];
  for (var k = 0; k < rawLines.length; k++) {
    var t = rawLines[k].trim();
    if (!t) { continue; }
    var parts = t.split("|");
    if (parts.length < 2) { continue; }
    var tap = parts[0].trim();
    if (!/^[A-Za-z0-9]+$/.test(tap)) { continue; }
    eps.push({ tap: tap, vs: (parts[1] || "").trim(), tm: (parts[2] || "").trim() });
  }
  return eps.length ? eps : null;
}

// Ưu tiên entry có tiêu đề === slug; nếu không có thì entry đầu tiên parse được
function parseFeedEpisodes(html, slug) {
  var j;
  try { j = JSON.parse(html); } catch (e) { return null; }
  if (!j || !j.feed || !j.feed.entry) { return null; }
  var entries = j.feed.entry, first = null;
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var c = e.content ? e.content.$t : (e.summary ? e.summary.$t : "");
    var eps = episodesFromContent(c);
    if (!eps) { continue; }
    if (slug && e.title && e.title.$t === slug) { return eps; }
    if (!first) { first = eps; }
  }
  return first;
}

// NDJSON anisrc: mỗi dòng là {tap,vs,tm} (URL sẵn)
function parseNdjsonEpisodes(html) {
  var eps = [];
  var lines = String(html || "").split("\n");
  for (var j = 0; j < lines.length; j++) {
    var ln = lines[j].trim();
    if (!ln) { continue; }
    var o;
    try { o = JSON.parse(ln); } catch (e) { continue; }
    if (!o || o.tap === undefined) { continue; }
    if ((o.vs && o.vs.indexOf("http") === 0) || (o.tm && o.tm.indexOf("http") === 0)) {
      eps.push({ tap: o.tap, vs: o.vs || "", tm: o.tm || "" });
    }
  }
  return eps.length ? eps : null;
}

function slugFromUrl(apiUrl) {
  var s = String(apiUrl || "");
  var m = s.match(/[?&]q=([^&]+)/);
  if (m) { try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; } }
  m = s.match(/\/list\/([^\/\?]+)/);
  if (m) { return m[1]; }
  return "";
}

// Chuẩn hoá id tập về URL ssplay (feed trả id trần, anisrc trả URL sẵn)
function playUrl(v) {
  if (!v || v === "-") { return ""; }
  return v.indexOf("http") === 0 ? v : (SSPLAY + "/v/" + v + ".html");
}

function parseMovieDetail(html, apiUrl, datasend) {
  console.log("MovieUrl\n" + apiUrl)
  var meta = {};
  try { if (datasend) { meta = JSON.parse(datasend); } } catch (e) {}

  var text = String(html || "");
  var slug = meta.slug || slugFromUrl(apiUrl) || "";

  var rawEps = parseFeedEpisodes(text, slug);
  if (!rawEps) { rawEps = parseNdjsonEpisodes(text); }
  if (!rawEps && slug) {
    // dự phòng: gọi thẳng API list
    var lb = httpGet(API + "/list/" + encodeURIComponent(slug));
    rawEps = parseNdjsonEpisodes(lb);
  }
  if (!rawEps) { rawEps = []; }

  var vs = [], tm = [];
  for (var i = 0; i < rawEps.length; i++) {
    var p = rawEps[i];
    var epName = /^\d+$/.test(String(p.tap)) ? ("Tập " + p.tap) : String(p.tap);
    var v = playUrl(p.vs), t = playUrl(p.tm);
    if (v) { vs.push({ id: v, name: epName, slug: "vs-" + p.tap }); }
    if (t) { tm.push({ id: t, name: epName, slug: "tm-" + p.tap }); }
  }

  var servers = [];
  if (vs.length > 0) { servers.push({ name: "Vietsub", episodes: vs }); }
  if (tm.length > 0) { servers.push({ name: "Thuyết Minh", episodes: tm }); }

  var title = meta.title || slug;
  var id = meta.slug || slug;
  const data = JSON.parse(html);           // ✅ parse JSON → tự decode \u003C, \u003E, \/
  const htmlentry = data.feed.entry[0].content.$t;
  
  // Regex tách "Nội Dung"
  const regex = /Nội Dung:\s*<\/b><\/font>\s*([\s\S]*?)<\/td>/i;
  const match = htmlentry.match(regex);
  const noiDung = match ? match[1].trim() : null;


  
  return JSON.stringify({
    id: id,
    title: title,
    posterUrl: meta.posterUrl || "",
    backdropUrl: meta.posterUrl || "",
    description: noiDung || "",
    year: meta.year || "",
    quality: "HD",
    status: meta.status || "",
    category: meta.category || "",
    servers: servers
  });
}

// =============================================================================
// PLAYER  —  Dean Edwards unpacker (chạy thuần JS, không dùng eval)
// =============================================================================
function deanUnpack(p, a, c, k) {
  function enc(x) {
    return (x < a ? "" : enc(parseInt(x / a, 10))) +
           ((x = x % a) > 35 ? String.fromCharCode(x + 29) : x.toString(36));
  }
  while (c--) {
    if (k[c]) { p = p.replace(new RegExp("\\b" + enc(c) + "\\b", "g"), k[c]); }
  }
  return p;
}

function unescapePct(s) {
  return String(s).replace(/%([0-9A-Fa-f]{2})/g, function (m, h) {
    return String.fromCharCode(parseInt(h, 16));
  });
}

function unescapeJs(s) {
  return String(s).replace(/\\(.)/g, function (m, c) {
    if (c === "n") { return "\n"; }
    if (c === "r") { return "\r"; }
    if (c === "t") { return "\t"; }
    return c;
  });
}

function unpackAll(html) {
  var out = "";
  var re = /eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?\}\('((?:[^'\\]|\\.)*)',(\d+),(\d+),'((?:[^'\\]|\\.)*)'\.split\('\|'\)/g;
  var m;
  while ((m = re.exec(html))) {
    try {
      var p = unescapeJs(m[1]);
      var r = deanUnpack(p, parseInt(m[2], 10), parseInt(m[3], 10), m[4].split("|"));
      var um = r.match(/unescape\('([\s\S]*?)'\)/);
      if (um) { r = unescapePct(um[1]); }
      out += r + "\n";
    } catch (e) { logIt("unpack block err: " + e); }
  }
  return out;
}

function extractSourceFile(all) {
  var sm = all.match(/sources\s*:\s*\[\s*\{([\s\S]*?)\}\s*\]/);
  var hay = sm ? sm[1] : all;
  var m = hay.match(/["']?file["']?\s*[:=]\s*["']([^"']+)["']/);
  return m ? m[1].replace(/&amp;/g, "&") : "";
}

function extractAbyssId(txt) {
  var m = String(txt || "").match(/abyssplayer\.com\/([A-Za-z0-9]+)/);
  return m ? m[1] : "";
}

function extractCodes(html) {
  var codes = [], seen = {};
  var block = String(html || "");
  var bm = block.match(/list-server-items[\s\S]*?<\/ul>/i);
  if (bm) { block = bm[0]; }
  var re = /[?&]s=([A-Za-z]{1,4})\b/g, m;
  while ((m = re.exec(block))) {
    var c = m[1].toUpperCase();
    if (!seen[c]) { seen[c] = 1; codes.push(c); }
  }
  return codes;
}

// Thử 1 trang player -> trả {kind:"m3u8"|"abyss", ...} hoặc null
function tryCandidate(html, referer, allowAbyss) {
  try {
    if (!html) { return null; }
    var ab = extractAbyssId(html);
    if (ab && allowAbyss) { return { kind: "abyss", id: ab }; }

    var all = unpackAll(html);
    var ab2 = extractAbyssId(all);
    if (ab2 && allowAbyss) { return { kind: "abyss", id: ab2 }; }

    var f = extractSourceFile(all);
    if (!f) { return null; }

    var full = f.indexOf("http") === 0 ? f : (SSPLAY + (f.charAt(0) === "/" ? "" : "/") + f);
    var body = httpGet(full, { "Referer": referer, "Origin": SSPLAY });
    if (body && body.indexOf("#EXTM3U") === 0 && body.length > 40) {
      return { kind: "m3u8", url: full, referer: referer };
    }
    return null;
  } catch (e) { logIt("tryCandidate err: " + e); return null; }
}

function resolvePlay(id, prefetchedHtml, prefetchedUrl) {
  if (!id) { return null; }
  var ssplayUrl = SSPLAY + "/v/" + id + ".html";

  // 1. Trang mặc định (app đã fetch sẵn)
  var r = tryCandidate(prefetchedHtml, prefetchedUrl || ssplayUrl, true);
  if (r) { return r; }

  // 2. Dò từng sub-server trong danh sách
  var codes = extractCodes(prefetchedHtml);
  if (!codes.length) { codes = ["SU", "SG", "ST", "CF"]; }
  logIt("sub-servers: " + codes.join(","));
  for (var i = 0; i < codes.length; i++) {
    var code = codes[i];
    var pageUrl = ssplayUrl + "?s=" + code;
    var html = httpGet(pageUrl, { "Referer": ssplayUrl });
    var rr = tryCandidate(html, pageUrl, code === "HY");
    if (rr) { return rr; }
  }

  // 3. Dự phòng cuối: thử HY nếu chưa có
  if (codes.indexOf("HY") < 0) {
    var hyUrl = ssplayUrl + "?s=HY";
    var hyHtml = httpGet(hyUrl, { "Referer": ssplayUrl });
    var ab = extractAbyssId(hyHtml) || extractAbyssId(unpackAll(hyHtml));
    if (ab) { return { kind: "abyss", id: ab }; }
  }
  return null;
}

function parseDetailResponse(html, apiUrl, datasend) {
  var url = String(apiUrl || "");
  var id = "";
  var m = url.match(/ssplay\.net\/v\/(\d+)/);
  if (m) { id = m[1]; }
  if (!id) { var m2 = url.match(/\/(\d+)\.html/); if (m2) { id = m2[1]; } }

  var cleanUrl = url.replace(/\|.*$/, "");
  logIt("play id=" + id);

  var res = resolvePlay(id, html, cleanUrl);

  if (res && res.kind === "abyss") {
    logIt("=> abysscdn " + res.id);
    return JSON.stringify({
      url: "https://abysscdn.com/?v=" + res.id,
      mimeType: "video/mp4",
      isEmbed: false,
      headers: { "User-Agent": WINUA },
      subtitles: []
    });
  }
  if (res && res.kind === "m3u8") {
    logIt("=> m3u8 " + res.url);
    return JSON.stringify({
      url: res.url,
      mimeType: "application/x-mpegURL",
      isEmbed: false,
      headers: { "User-Agent": UA, "Referer": res.referer, "Origin": SSPLAY },
      subtitles: []
    });
  }

  logIt("KHÔNG resolve được link id=" + id);
  return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
}

// =============================================================================
// CÁC HÀM TÙY CHỌN (để app không báo thiếu)
// =============================================================================
function parseCategoriesResponse(apiResponseJson) { return getPrimaryCategories(); }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

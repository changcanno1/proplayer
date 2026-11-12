// =============================================================================
// VAAPP Plugin - Tu Tiên TV (tutien.com.vn)
// Type: MOVIE / playerType: exoplayer
// API: api.tutien.com.vn  |  Ảnh: img.tutien.com.vn  |  Stream: x*.tutien.com.vn
// =============================================================================

var BASE = "https://tutien.com.vn";
var API = "https://api.tutien.com.vn";
var IMG = "https://img.tutien.com.vn";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
var PAGE_SIZE = 30;

// Thể loại: slug dùng nội bộ, name là giá trị API `genre` yêu cầu
var GENRES = [
  { slug: "co-trang", name: "Cổ Trang" },
  { slug: "tien-hiep", name: "Tiên Hiệp" },
  { slug: "kiem-hiep", name: "Kiếm Hiệp" },
  { slug: "huyen-huyen", name: "Huyền Huyễn" },
  { slug: "tu-tien", name: "Tu Tiên" },
  { slug: "trung-sinh", name: "Trùng Sinh" },
  { slug: "xuyen-khong", name: "Xuyên Không" },
  { slug: "do-thi", name: "Đô Thị" },
  { slug: "hien-dai", name: "Hiện Đại" },
  { slug: "hai-huoc", name: "Hài Hước" },
  { slug: "linh-di", name: "Linh Dị" }
];

function log(msg) {
  try { console.log("[tutien] " + msg); } catch (e) {}
}

function getManifest() {
  return JSON.stringify({
    id: "hoathinh1",
    name: "Hoạt Hình 1 [ANIME]",
    version: "1.0.4",
    author: "alokillgtv",
    description: "Hoạt hình tiên hiệp, kiếm hiệp Trung Quốc - Vietsub, thuyết minh",
    BASEURL: API,
    referrer: BASE + "/",
    iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/icon/hoathinh1.png",
    info: "Nguồn phim hoạt hình đa chất lượng 480p-4K, có Vietsub.",
    isEnabled: true,
    isAdult: false,
    adblock: true,
    type: "ANIME",
    playerType: "exoplayer",
    subtitleCat: false
  });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "danh-gia", title: "Đánh Giá Cao", type: "Horizontal" },
    { slug: "xem-nhieu", title: "Xem Nhiều Tuần", type: "Horizontal" },
    { slug: "moi-cap-nhat", title: "Mới Cập Nhật", type: "Grid" }
  ]);
}

function getPrimaryCategories() {
  var out = [{ slug: "all", name: "Tất cả" }];
  for (var i = 0; i < GENRES.length; i++) {
    out.push({ slug: GENRES[i].slug, name: GENRES[i].name });
  }
  return JSON.stringify(out);
}

function getFilterConfig() {
  var sort = [
    { name: "Mới nhất", value: "newest" },
    { name: "Đánh giá cao", value: "rating" }
  ];
  var genre = [];
  for (var i = 0; i < GENRES.length; i++) {
    genre.push({ name: GENRES[i].name, value: GENRES[i].slug });
  }
  return JSON.stringify({ sort: sort, genre: genre });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFilters(filtersJson) {
  var t = String(filtersJson == null ? "" : filtersJson).trim();
  if (!t) return {};
  if (t.charAt(0) !== "{" && t.charAt(0) !== "[") return { page: t };
  try { return JSON.parse(t) || {}; } catch (e) {}
  try {
    t = t.replace(/([{,])\s*([A-Za-z0-9_]+)\s*:/g, '$1"$2":').replace(/,\s*[}\]]/g, function (m) { return m.charAt(m.length - 1) === "}" ? "}" : "]"; });
    return JSON.parse(t) || {};
  } catch (e) { return {}; }
}

function pipeData(apiUrl) {
  var s = String(apiUrl || "");
  var i = s.indexOf("|");
  if (i < 0) return "";
  s = s.substring(i + 1);
  if (s.indexOf("data:") === 0) s = s.substring(5);
  var j = s.search(/[&#]/);
  if (j >= 0) s = s.substring(0, j);
  return s;
}

function urlParam(url, key) {
  var re = new RegExp("[?&]" + key + "=([^&#|]*)", "gi");
  var s = String(url || ""), m, v = "";
  while ((m = re.exec(s)) !== null) v = m[1];
  return v ? decodeURIComponent(v.replace(/\+/g, " ")) : "";
}

function pageOf(filters, apiUrl) {
  var p = parseInt(filters.page, 10);
  if (!(p > 0)) p = parseInt(filters.pageIndex, 10);
  if (!(p > 0)) p = parseInt(filters.p, 10);
  if (!(p > 0)) p = parseInt(filters.offset, 10) >= 0 ? Math.floor(parseInt(filters.offset, 10) / (parseInt(filters.limit, 10) || 20)) + 1 : NaN;
  if (!(p > 0)) p = parseInt(urlParam(apiUrl, "page"), 10);
  if (!(p > 0)) {
    var dm = /[|:&?]page=(\d+)/.exec(String(apiUrl || ""));
    if (dm) p = parseInt(dm[1], 10);
  }
  if (!(p > 0)) {
    var off = parseInt(urlParam(apiUrl, "offset"), 10);
    var lim = parseInt(urlParam(apiUrl, "limit"), 10) || 20;
    if (off >= 0) p = Math.floor(off / lim) + 1;
  }
  return p > 0 ? p : 1;
}

function absImg(p) {
  if (!p) return "";
  p = String(p);
  if (/^https?:\/\//i.test(p)) return p;
  return IMG + (p.charAt(0) === "/" ? p : "/" + p);
}

function absUrl(p) {
  if (!p) return "";
  p = String(p);
  if (/^https?:\/\//i.test(p)) return p;
  return BASE + (p.charAt(0) === "/" ? p : "/" + p);
}

function genreOf(x) {
  var s = String(x || "").toLowerCase();
  if (!s) return "";
  for (var i = 0; i < GENRES.length; i++) {
    if (GENRES[i].slug === s || GENRES[i].name.toLowerCase() === s) return GENRES[i].name;
  }
  return "";
}

function movieItem(m) {
  if (!m || !m.slug) return null;
  var ep = m.episodeCount ? ("Tập " + m.episodeCount) : (m.complete ? "Full" : "Đang chiếu");
  var desc = m.genre || "";
  if (m.year) desc += (desc ? " • " : "") + m.year;
  return {
    id: m.slug,
    title: m.title || "",
    posterUrl: absImg(m.thumbnailUrl1 || m.thumbnailUrl2),
    backdropUrl: absImg(m.thumbnailUrl2 || m.thumbnailUrl1),
    description: desc,
    year: m.year || "",
    quality: "HD",
    episode_current: ep,
    lang: "Vietsub"
  };
}

function packList(items, page, totalPages) {
  page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
  totalPages = parseInt(totalPages, 10) > 0 ? parseInt(totalPages, 10) : page;
  return JSON.stringify({
    items: items || [],
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalItems: (items || []).length,
      itemsPerPage: PAGE_SIZE
    }
  });
}

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

function getUrlList(slug, filtersJson, filtersArg) {
  var f = parseFilters(filtersJson);
  if (!f.page && filtersArg) {
    var f2 = parseFilters(filtersArg);
    for (var k in f2) if (f2.hasOwnProperty(k)) f[k] = f2[k];
  }
  var s = String(slug || "");
  var page = pageOf(f, s);
  if (s.indexOf("http") !== 0 && s.indexOf("|") >= 0) {
    if (!f.page) page = pageOf({}, s);
    s = s.split("|")[0];
  }

  var mode = "", sort = f.sort || "", genre = f.genre || "";
  if (s.indexOf("http") === 0) {
    mode = pipeData(s);
    if (!sort) sort = urlParam(s, "sort");
    if (!genre) genre = urlParam(s, "genre");
    if (s.indexOf("/rankings/") >= 0) mode = "rank";
  }

  if (mode === "search") {
    return API + "/search-movies?q=" + encodeURIComponent(f.q || urlParam(s, "q")) + "|data:search";
  }

  if (mode === "rank" || s === "xem-nhieu") {
    return API + "/rankings/views-weekly?limit=20&offset=" + ((page - 1) * 20) + "|data:rank";
  }

  if (!sort) sort = "newest";
  if (s === "danh-gia") sort = "rating";

  var g = genreOf(genre);
  if (!g && s && !mode && s !== "all" && s !== "latest" && s !== "moi-cap-nhat" && s !== "danh-gia") {
    g = genreOf(s);
  }

  var out = g
    ? API + "/movies?page=" + page + "&sort=" + encodeURIComponent(sort) + "&genre=" + encodeURIComponent(g) + "|data:genre"
    : API + "/movies?page=" + page + "&sort=" + encodeURIComponent(sort) + "|data:list";
  log("list p=" + page + " f=" + String(filtersJson).slice(0, 90) + " -> " + out.slice(0, 120));
  return out;
}

function getUrlSearch(keyword, filtersJson) {
  var kw = String(keyword || "");
  return API + "/search-movies?q=" + encodeURIComponent(kw) + "|data:search";
}

function getUrlDetail(slug, datasend) {
  var s = String(slug || "");
  if (!s) return "";
  if (s.indexOf("http") === 0) return s;
  return API + "/movie/" + encodeURIComponent(s);
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseListResponse(html, apiUrl) {
  var page = pageOf({}, apiUrl);
  var mode = pipeData(apiUrl);
  if (!mode) {
    var u = String(apiUrl || "");
    if (u.indexOf("/rankings/") >= 0) mode = "rank";
    else if (u.indexOf("/search-movies") >= 0) mode = "search";
    else if (u.indexOf("genre=") >= 0) mode = "genre";
    else if (u.indexOf("/movies") >= 0) mode = "list";
  }
  var items = [];
  var totalPages = page;
  try {
    var d = JSON.parse(html);
    var list = null;
    if (Array.isArray(d)) {
      list = d;
    } else if (d && d.success && d.data && Array.isArray(d.data.movies)) {
      list = d.data.movies;
      if (Number(d.data.totalPages) > 0) totalPages = Number(d.data.totalPages);
    } else if (d && d.success && Array.isArray(d.data)) {
      list = d.data;
      if (Number(d.totalPages) > 0) totalPages = Number(d.totalPages);
    } else if (d && Array.isArray(d.data)) {
      list = d.data;
    } else if (d && Array.isArray(d.items)) {
      list = d.items;
    }
    if (list) {
      for (var i = 0; i < list.length; i++) {
        var it = movieItem(list[i]);
        if (it) items.push(it);
      }
      if (mode === "list" || mode === "rank") {
        var size = mode === "rank" ? 20 : PAGE_SIZE;
        if (totalPages === page && list.length >= size) totalPages = page + 1;
      }
    }
  } catch (e) {
    log("list parse err: " + e + " | url=" + String(apiUrl || "").slice(0, 140) + " | len=" + String(html || "").length + " | head=" + String(html || "").slice(0, 140).replace(/\s+/g, " "));
  }
  if (!items.length) log("list p=" + page + " empty | totalPages=" + totalPages);
  else log("list p=" + page + "/" + totalPages + " items=" + items.length);
  return packList(items, page, totalPages);
}

function parseSearchResponse(html, apiUrl) {
  var items = [];
  try {
    var d = JSON.parse(html);
    var list = Array.isArray(d) ? d : (d && (d.data || d.movies || d.items)) || [];
    if (!Array.isArray(list)) list = [];
    for (var i = 0; i < list.length; i++) {
      var it = movieItem(list[i]);
      if (it) {
        it.episode_current = list[i].episodeCount ? ("Tập " + list[i].episodeCount) : it.episode_current;
        items.push(it);
      }
    }
  } catch (e) {
    log("search parse err: " + e + " | url=" + String(apiUrl || "").slice(0, 140) + " | head=" + String(html || "").slice(0, 120).replace(/\s+/g, " "));
  }
  return packList(items, 1, 1);
}

function parseMovieDetail(html, apiUrl, datasend) {
  try {
    var d = JSON.parse(html);
    var m = d.data || d.movie || d;
    if (!m || !m.slug) throw new Error("no movie");
    var eps = (m.episodes || []).slice().sort(function (a, b) {
      return (Number(a.episodeNumber) || 0) - (Number(b.episodeNumber) || 0);
    });
    var list = [];
    for (var i = 0; i < eps.length; i++) {
      var e = eps[i];
      var n = Number(e.episodeNumber) || 0;
      list.push({
        id: API + "/movie/" + encodeURIComponent(m.slug) + "?ep=" + n + "|data:ep=" + n,
        name: "Tập " + n,
        slug: e.episode_slug_2 || ("tap-" + n)
      });
    }
    return JSON.stringify({
      id: m.slug,
      title: m.title || "",
      posterUrl: absImg(m.thumbnailUrl1 || m.thumbnailUrl2),
      backdropUrl: absImg(m.thumbnailUrl2 || m.thumbnailUrl1),
      description: m.description || "",
      year: m.year || "",
      rating: m.rating || 0,
      quality: "HD",
      lang: "Vietsub",
      category: m.genre || "",
      status: m.complete ? "Hoàn thành" : ("Đang chiếu" + (m.scheduleTime ? " • " + m.scheduleTime : "")),
      duration: (m.episodeCount || list.length) + " tập",
      casts: "",
      director: "",
      servers: [{ name: "Vietsub", episodes: list }]
    });
  } catch (e) {
    log("movie detail err: " + e + " | url=" + String(apiUrl || "").slice(0, 140) + " | head=" + String(html || "").slice(0, 120).replace(/\s+/g, " "));
    return JSON.stringify({ id: "", title: "", servers: [] });
  }
}

function episodeOf(apiUrl, datasend) {
  var s = String(datasend || "");
  var m = /ep=(\d+)/.exec(s);
  if (m) return parseInt(m[1], 10);
  var t = String(apiUrl || "");
  var i = t.indexOf("|data:");
  if (i >= 0) t = t.substring(i + 6);
  m = /ep=(\d+)/.exec(t);
  return m ? parseInt(m[1], 10) : 0;
}

function parseDetailResponse(html, apiUrl, datasend) {
  try {
    var d = JSON.parse(html);
    var m = d.data || d.movie || d;
    if (!m) throw new Error("no data");
    var n = episodeOf(apiUrl, datasend);
    var eps = m.episodes || [];
    var e = null;
    for (var i = 0; i < eps.length; i++) {
      if (Number(eps[i].episodeNumber) === n) { e = eps[i]; break; }
    }
    if (!e && eps.length) e = eps[eps.length - 1];
    if (!e) throw new Error("no episode " + n);

    var url = e.m3u8Url2 || e.m3u8Url;
    if (!url) throw new Error("no m3u8");

    var out = {
      url: String(url),
      mimeType: "application/x-mpegURL",
      isEmbed: false,
      headers: { "User-Agent": UA, "Referer": BASE + "/" },
      subtitles: []
    };

    if (e.subtitle) {
      out.subtitles.push({ lang: "Vietsub", url: absUrl(e.subtitle) });
    }

    var sk = [];
    var intro = Number(e.introEndTime) || 0;
    var outro = Number(e.outroStartTime) || 0;
    if (intro > 0 && intro < 300) sk.push({ start: 0, end: intro, type: "intro" });
    if (outro > 0) sk.push({ start: outro, end: outro + 600, type: "outro" });
    if (sk.length) out.skipTimes = sk;

    log("stream ep=" + n + " -> " + String(url).slice(0, 90));
    return JSON.stringify(out);
  } catch (e) {
    log("stream err: " + e);
    return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
  }
}

function parseEmbedResponse(html, url) {
  return parseDetailResponse(html, url, "");
}
/* VipPhim API plugin for VAX TV WebView.
 * API endpoints verified from vipphim.net's live Next.js chunks and payloads.
 */
var VIPPHIM_API = "https://api.vipphim.net/api";
var VIPPHIM_SITE = "https://vipphim.net";
var VIPPHIM_AES_KEY = "12345678901234567890123456789012";
var VIPPHIM_GENRES = [
  ["Hành động", "hanh-dong"], ["Kinh dị", "kinh-di"], ["Tình cảm", "tinh-cam"],
  ["Hài hước", "hai-huoc"], ["Hình sự - Tội phạm", "hinh-su-toi-pham"],
  ["Tâm lý", "tam-ly"], ["Gia đình", "gia-dinh"], ["Phiêu lưu - Gay cấn", "phieu-luu-gay-can"],
  ["Khoa học - Viễn tưởng", "khoa-hoc-vien-tuong"], ["Phép thuật - Thần thoại", "phep-thuat-than-thoai"],
  ["Cổ trang", "co-trang"], ["Võ thuật", "vo-thuat"], ["Chiếu rạp", "chieu-rap"],
  ["Hoạt hình", "hoat-hinh"], ["Âm nhạc - Nhạc kịch", "am-nhac-nhac-kich"], ["Chính kịch", "chinh-kich"]
];
function _vlog() {
  try {
    var a = [].slice.call(arguments); a.unshift("[VipPhim]");
    if (typeof console !== "undefined" && console.log) console.log.apply(console, a);
  } catch (e) {}
}
function _vwarn() {
  try {
    var a = [].slice.call(arguments); a.unshift("[VipPhim]");
    if (typeof console !== "undefined" && console.warn) console.warn.apply(console, a);
  } catch (e) {}
}

function getManifest() {
  return JSON.stringify({
    id: "film3",
    name: "Film 3",
    version: "1.1.1",
    baseUrl: VIPPHIM_SITE,
    iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/icon/film3.png",
    isEnabled: true,
    author: "alokillgtv",
    info: "Nguồn phim mới, khá nhiều phim hay và chất lượng cao.",
    type: "MOVIE", 
    playerType: "exoplayer", 
    subtitleCat: false
  });
}
function getHomeSections() {
  return JSON.stringify([
    { slug: "/films/active?type=odd&pageSize=20&pageIndex=0", title: "Phim lẻ", type: "Horizontal" },
    { slug: "/films/active?type=series&pageSize=20&pageIndex=0", title: "Phim bộ", type: "Horizontal" },
    { slug: "/films/latest?pageSize=20&pageIndex=0", title: "Phim mới", type: "Grid" }
  ]);
}
function getPrimaryCategories() {
  var out = [
    { name: "Phim mới", slug: "/films/latest" }, { name: "Phim lẻ", slug: "/films/active?type=odd" },
    { name: "Phim bộ", slug: "/films/active?type=series" }, { name: "Hàn Quốc", slug: "/films/active?country=Hàn%20Quốc" }
  ];
  VIPPHIM_GENRES.forEach(function (g) { out.push({ name: g[0], slug: "/films/active?category=" + encodeURIComponent(g[1]) }); });
  return JSON.stringify(out);
}
function getFilterConfig() {
  return JSON.stringify({
    category: VIPPHIM_GENRES.map(function (g) { return { name: g[0], value: g[1] }; }),
    type: [{ name: "Tất cả", value: "" }, { name: "Phim lẻ", value: "odd" }, { name: "Phim bộ", value: "series" }]
  });
}
function getUrlList(slug, filtersJson) {
  var f = {}; try { f = JSON.parse(filtersJson || "{}"); } catch (e) {}
  if (slug && /^https?:\/\//i.test(slug)) return slug;
  var path = slug || "/films/latest", page = Math.max(1, Number(f.page || 1));
  var u = path.indexOf("/films/") === 0 ? VIPPHIM_API + path : VIPPHIM_API + "/films/latest";
  if (f.category && u.indexOf("category=") < 0) u += (u.indexOf("?") < 0 ? "?" : "&") + "category=" + encodeURIComponent(f.category);
  if (f.type && u.indexOf("type=") < 0) u += (u.indexOf("?") < 0 ? "?" : "&") + "type=" + encodeURIComponent(f.type);
  if (u.indexOf("pageSize=") < 0) u += (u.indexOf("?") < 0 ? "?" : "&") + "pageSize=20&pageIndex=" + (page - 1);
  else u = u.replace(/pageIndex=\d+/, "pageIndex=" + (page - 1));
  return u;
}
function getUrlSearch(keyword, filtersJson) {
  var f = {}; try { f = JSON.parse(filtersJson || "{}"); } catch (e) {}
  return VIPPHIM_API + "/films/active?searchKeyword=" + encodeURIComponent(keyword || "") + "&pageSize=20&pageIndex=" + (Math.max(1, Number(f.page || 1)) - 1);
}
function getUrlDetail(slug) {
  var s = String(slug || "");
  if (/^https?:\/\//i.test(s)) return s;
  s = s.replace(/^\//, "").replace(/^films\/film-by-slug\//, "");
  return VIPPHIM_API + "/films/film-by-slug/" + encodeURIComponent(s);
}
function _json(raw) {
  try {
    if (raw && typeof raw === "object") {
      /* proxyFetch/httpRequest có thể truyền thẳng response wrapper */
      if (raw.body !== undefined) return _json(raw.body);
      return raw;
    }
    var s = String(raw || "").trim();
    if (!s) return null;
    var j = JSON.parse(s);
    return j && j.body && typeof j.body === "string" ? JSON.parse(j.body) : j;
  } catch (e) {
    /* Một số proxy trả HTML/JSON lẫn nhau; thử lấy đoạn JSON ngoài cùng. */
    try { var m = String(raw || "").match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch (e2) { return null; }
  }
}
function _body(raw) {
  var j = _json(raw);
  if (!j) return null;
  if (j.data && typeof j.data === "object") return j.data;
  if (j.result && typeof j.result === "object") return j.result;
  return j;
}
function _findValue(obj, key) {
  if (!obj || typeof obj !== "object") return "";
  if (obj[key]) return obj[key];
  for (var k in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
    if (obj[k] && typeof obj[k] === "object") {
      var found = _findValue(obj[k], key);
      if (found) return found;
    }
  }
  return "";
}
function _abs(s) { return s || ""; }
function _request(url) {
  if (typeof httpRequest !== "function") return "";
  try {
    _vlog("httpRequest", String(url).slice(0, 180));
    var r = httpRequest(url, { method: "GET", headers: {
      Accept: "application/json,*/*", "User-Agent": "Mozilla/5.0",
      Referer: VIPPHIM_SITE + "/", Origin: VIPPHIM_SITE
    } });
    if (!r) { _vwarn("httpRequest empty response"); return ""; }
    var out = r.body !== undefined ? String(r.body) : String(r);
    _vlog("httpRequest result len=" + out.length + " status=" + (r.status || r.statusCode || "?"));
    return out;
  } catch (e) { _vwarn("httpRequest exception", e && e.message || e); return ""; }
}
function _item(v) {
  if (!v) return null;
  var cats = v.filmCategories || v.categories || [];
  if (!Array.isArray(cats)) cats = [];
  return { id: v.slugUrl || v.originalSlugUrl || v._id || v.video_id, title: v.title || v.title_eng || "",
    posterUrl: _abs(v.thumbnail || v.thumbnail_url), backdropUrl: _abs(v.coverImage || v.thumbnail || v.thumbnail_url),
    year: Number(v.movie_release || v.year || 0), quality: v.quality || "", lang: v.country || "",
    category: cats.map(function (x) { return typeof x === "string" ? x : (x.name || x.slug || ""); }).filter(Boolean).join(", "),
    episode_current: v.type === "series" ? (v.priority ? "Tập " + v.priority : "Phim bộ") : "Full" };
}
function parseListResponse(raw) {
  var d = _body(raw), a = d && (d.data || d.items || d.results); if (!Array.isArray(a)) a = [];
  var p = d || {}; return JSON.stringify({ items: a.map(_item).filter(Boolean), pagination: {
    currentPage: Number(p.page || 1), totalPages: Number(p.totalPage || 1), totalItems: Number(p.count || a.length), itemsPerPage: Number(p.pageSize || 20)
  }});
}
function parseSearchResponse(raw) { return parseListResponse(raw); }
function _serverIds(slug) {
  var base = getUrlDetail(slug);
  return [1, 2, 3].map(function (serverNo) {
    return { name: "Server " + serverNo, url: base + "?sv=" + serverNo };
  });
}
function _episodes(v) {
  var out = [];
  /* Phim lẻ chỉ có đúng một tập. Không gọi list-sesson ở đây vì API có thể
   * trả danh sách phim/tập liên quan khi parent_id rỗng. */
  if (v && (v.type === "odd" || v.is_movie === true || (!v.parent_id && v.type !== "series"))) {
    var singleSlug = v.originalSlugUrl || v.slugUrl;
    if (singleSlug) {
      var singleIds = _serverIds(singleSlug);
      out.push({ id: singleIds[0].url, slug: singleSlug + "-full", name: "Full", ids: singleIds });
    }
    return out;
  }
  var parentId = v && (v.parent_id || v._id);
  if (!parentId) return out;
  var d = _body(_request(VIPPHIM_API + "/films/list-sesson/" + encodeURIComponent(parentId)));
  var roots = d && d.parent || []; var seasons = roots[0] && roots[0].seasons || [];
  if (!seasons.length && v.originalSlugUrl) seasons = [v];
  for (var i = 0; i < seasons.length; i++) {
    var e = seasons[i], slug = e.originalSlugUrl || e.slugUrl || v.originalSlugUrl || v.slugUrl;
    var ids = _serverIds(slug);
    var id = ids[0].url;
    /* Truyền encryptedUrl của đúng tập qua pipe; parser không cần gọi lại API. */
    if (e.encryptedUrl) id += "|data:" + encodeURIComponent(e.encryptedUrl);
    out.push({ id: id, slug: slug + "-ep-" + (e.priority || i + 1), name: "Tập " + (e.priority || i + 1), ids: ids });
  }
  return out;
}
function parseMovieDetail(raw) {
  var d = _body(raw), v = d && (d.video || d); if (!v) return "null";
  _vlog("parseMovieDetail title=" + (v.title || "") + " id=" + (v._id || ""));
  var eps = _episodes(v); if (!eps.length) eps = [{ id: getUrlDetail(v.originalSlugUrl || v.slugUrl), slug: v.originalSlugUrl || v.slugUrl, name: "Full" }];
  return JSON.stringify({ id: v.slugUrl || v.originalSlugUrl || v._id, title: v.title || v.title_eng || "", posterUrl: v.thumbnail || v.thumbnail_url || "", backdropUrl: v.coverImage || v.thumbnail || "", description: v.description || "", year: Number(v.movie_release || 0), rating: Number(v.rate || 0), quality: v.quality || "", lang: v.country || "", country: v.country || "", casts: v.stars || "", category: (v.filmCategories || []).map(function (x) { return x.name; }).join(", "), episode_current: v.type === "series" ? "Phim bộ" : "Full", servers: [{ name: "FILM 3", episodes: eps }] });
}
function _decrypt(value) {
  var m = String(value || "").split(":"); if (m.length !== 2) return "";
  try {
    /* Native xử lý trước: App không đảm bảo có CryptoJS trong scope plugin.
     * encryptedUrl có dạng base64(iv):base64(ciphertext), còn AesDecrypt
     * nhận key HEX + ciphertext base64 + IV base64. */
    if (typeof AesDecrypt === "function") {
      var keyHex = "";
      for (var kh = 0; kh < VIPPHIM_AES_KEY.length; kh++) {
        var hc = VIPPHIM_AES_KEY.charCodeAt(kh).toString(16);
        keyHex += hc.length < 2 ? "0" + hc : hc;
      }
      var nativeOut = String(AesDecrypt(keyHex, m[1], m[0]) || "");
      _vlog("AesDecrypt native result=" + (nativeOut ? nativeOut.slice(0, 180) : "EMPTY"));
      if (nativeOut) return nativeOut;
    } else {
      _vwarn("AesDecrypt native không tồn tại");
    }
    var C = null;
    try { C = CryptoJS; } catch (e0) {}
    if (!C) { try { C = window.CryptoJS; } catch (e1) {} }
    if (!C) { _vwarn("CryptoJS không tồn tại"); return ""; }
    var iv = C.enc.Base64.parse(m[0]);
    var cipher = C.lib.CipherParams.create({ ciphertext: C.enc.Base64.parse(m[1]) });
    var out = C.AES.decrypt(cipher, C.enc.Utf8.parse(VIPPHIM_AES_KEY), { iv: iv, mode: C.mode.CBC, padding: C.pad.Pkcs7 }).toString(C.enc.Utf8);
    _vlog("decrypt result=" + (out ? out.slice(0, 180) : "EMPTY"));
    return out;
  } catch (e) { _vwarn("decrypt exception", e && e.message || e); }
  return "";
}
function parseDetailResponse(raw, pageUrl, datasend) {
  _vlog("parseDetailResponse url=" + String(pageUrl || "").slice(0, 220) + " rawType=" + typeof raw + " rawLen=" + String(raw || "").length + " datasendLen=" + String(datasend || "").length);
  var d = _body(raw), v = d && (d.video || d);
  var encrypted = _findValue(d, "encryptedUrl") || (v && v.encryptedUrl);
  _vlog("payload parsed=" + !!d + " video=" + !!v + " encrypted=" + (encrypted ? "YES len=" + String(encrypted).length : "NO"));
  /* Giữ encryptedUrl theo từng episode để không phụ thuộc vào response của proxy. */
  if (!encrypted && datasend) {
    var ds = String(datasend);
    if (ds.indexOf("data:") === 0) ds = ds.slice(5);
    try { encrypted = decodeURIComponent(ds); } catch (e0) { encrypted = ds; }
  }
  var u = _decrypt(encrypted);
  _vlog("first decrypt url=" + (u || "EMPTY"));
  /* Khi proxy trả response rỗng/không phải JSON, đọc lại URL tập bằng
   * httpRequest; đây là đường fallback đồng bộ dành cho plugin parser. */
  if (!u && pageUrl && /^https?:\/\/api\.vipphim\.net\//i.test(String(pageUrl))) {
    var retry = _body(_request(String(pageUrl).split("|")[0]));
    var rv = retry && (retry.video || retry);
    encrypted = _findValue(retry, "encryptedUrl") || (rv && rv.encryptedUrl);
    v = rv || v;
    u = _decrypt(encrypted);
  }
  /* parseDetailResponse is normally called with the episode URL, not the
   * already fetched detail JSON. Fetch the live detail endpoint here so the
   * encryptedUrl payload is available to the loader. */
  if (!u && v && (v.slugUrl || v.originalSlugUrl)) {
    var fresh = _body(_request(getUrlDetail(v.originalSlugUrl || v.slugUrl)));
    v = fresh && (fresh.video || fresh) || v;
    encrypted = _findValue(fresh, "encryptedUrl") || v.encryptedUrl;
    u = _decrypt(encrypted);
  }
  if (!u && pageUrl) {
    var pm = String(pageUrl).match(/[|]data:([^|]+)/i);
    if (pm) { try { u = _decrypt(decodeURIComponent(pm[1])); } catch (e1) { u = _decrypt(pm[1]); } }
  }
  if (!u) { _vwarn("STREAM EMPTY after all fallbacks"); return JSON.stringify({ url: "", isEmbed: false, mimeType: "application/x-mpegURL", headers: {}, subtitles: [] }); }
  _vlog("STREAM OK " + u);
  var subs = []; if (v.subtitle) subs.push({ lang: "Vi", url: v.subtitle, mimeType: "text/vtt" });
  return JSON.stringify({ url: u, isEmbed: false, mimeType: /\.mp4(?:\?|$)/i.test(u) ? "video/mp4" : "application/x-mpegURL", headers: { Referer: VIPPHIM_SITE + "/", Origin: VIPPHIM_SITE }, subtitles: subs });
}
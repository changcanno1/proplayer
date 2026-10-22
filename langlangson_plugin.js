/* ============================================================================
 * LANGSON PLUGIN v3.2 — cache localStorage + query params
 * ============================================================================ */

var SOURCE_BASE     = "https://langlangson.xyz";
var SOURCE_REFERER  = SOURCE_BASE + "/";
var BOOTSTRAP_URL   = SOURCE_BASE + "/api/bootstrap?lite=2";
var MOVIE_URL       = SOURCE_BASE + "/api/movie";
var UA              = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                      "AppleWebKit/537.36 (KHTML, like Gecko) " +
                      "Chrome/120.0.0.0 Safari/537.36";
var PLACEHOLDER     = "https://example.com/";
var CUSTOMJS_URL    = "https://vaxplugin.alokillgtv02.workers.dev/youtube/custom.js";
var YT_TRENDING_URL = "https://youtube.alokillgtv02.workers.dev/?chart=trending&version=1&page=1";

// Cache bootstrap: localStorage (lâu dài) + RAM (nhanh)
var _bootstrapCache = null;
var _bootstrapTime  = 0;
var _lastFetchTry   = 0;
var _COOLDOWN       = 90 * 1000; // 90s sau fail
var _CACHE_STORAGE   = "langson_bootstrap_v33";   // đổi v3 → v33
var _SESSION_STORAGE = "langson_session_v33";

var _session = null;

function log(msg) {
  try { console.log("[LangSon] " + msg); } catch (e) {}
}

/* ============================================================================
 * BOOTSTRAP CACHE — LOCALSTORAGE + RAM
 * ============================================================================ */
function _loadBootstrapFromStorage() {
  try {
    var raw = localStorage.getItem(_CACHE_STORAGE);
    if (!raw) return false;
    var obj = JSON.parse(raw);
    if (obj && obj.data && obj.ts) {
      _bootstrapCache = obj.data;
      _bootstrapTime  = obj.ts;
      log("cache: loaded from localStorage age=" +
          ((Date.now() - obj.ts) / 60000).toFixed(1) + "m, movies=" +
          (_bootstrapCache.state ? "yes" : "no"));
      return true;
    }
  } catch (e) { log("cache load ERR: " + (e.message || e)); }
  return false;
}

function _saveBootstrapToStorage(data) {
  try {
    localStorage.setItem(_CACHE_STORAGE, JSON.stringify({
      ts:   Date.now(),
      data: data
    }));
    log("cache: saved to localStorage");
  } catch (e) { log("cache save ERR: " + (e.message || e)); }
}
function _parseBootstrapPayload(text) {
  if (!text) return null;
  text = String(text).trim();
  if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);

  // ---------- Case 1: JSON thuần ----------
  if (text.charAt(0) === "{") {
    try {
      var data = JSON.parse(text);
      if (data && data.ok === true && data.state) {
        if (typeof data.state === "string") {
          try { data.state = JSON.parse(data.state); }
          catch (e) { return null; }
        }
        var keys = Object.keys(data.state || {});
        log("parse: state keys=" + keys.join(","));
        if (data.cataloglessTest === true) {
          log("parse: ⚠️ cataloglessTest=true — server KHÔNG trả movies");
        }
        return data;
      }
      log("parse: JSON no ok/state, keys=" +
          (data && typeof data === "object" ? Object.keys(data).join(",") : "?"));
    } catch (e) {
      log("parse: JSON.parse ERR " + (e.message || e));
    }
  }

  // ---------- Case 2: HTML có __INITIAL_STATE__ / __NEXT_DATA__ ----------
  log("parse: try HTML/script extract");
  var markers = ["window.__INITIAL_STATE__", "__INITIAL_STATE__", "__NEXT_DATA__"];
  for (var mi = 0; mi < markers.length; mi++) {
    var marker = markers[mi];
    var pos = text.indexOf(marker);
    if (pos < 0) continue;
    log("parse: found marker \"" + marker + "\" at " + pos);

    var eq = text.indexOf("=", pos + marker.length);
    if (eq < 0 || eq - pos > 500) continue;
    var braceStart = text.indexOf("{", eq + 1);
    if (braceStart < 0 || braceStart - eq > 1000) continue;

    var depth = 0, inStr = false, strCh = "", esc = false, endPos = -1;
    for (var i = braceStart; i < text.length; i++) {
      var ch = text.charAt(i);
      if (esc) { esc = false; continue; }
      if (inStr) {
        if (ch === "\\") { esc = true; continue; }
        if (ch === strCh) inStr = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") { inStr = true; strCh = ch; continue; }
      if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) { endPos = i; break; } }
    }
    if (endPos < 0) continue;

    try {
      var obj = JSON.parse(text.substring(braceStart, endPos + 1));
      if (obj && obj.state) {
        if (typeof obj.state === "string") obj.state = JSON.parse(obj.state);
        log("parse: HTML extract OK");
        return { ok: true, state: obj.state };
      }
    } catch (e) {
      log("parse: extract ERR " + (e.message || e));
    }
  }

  log("parse: ALL SHAPES FAIL, preview: " +
      text.substring(0, 200).replace(/\s+/g, " "));
  return null;
}
var BOOTSTRAP_URLS = [
  SOURCE_BASE + "/api/bootstrap",            // FULL, không lite
  SOURCE_BASE + "/api/bootstrap?lite=0",     // explicit full
  SOURCE_BASE + "/api/bootstrap?lite=1",
  SOURCE_BASE + "/api/bootstrap?catalog=1",  // ép include catalog
  SOURCE_BASE + "/api/bootstrap?lite=2"      // fallback cuối
];

function _tryFetchOne(url, cookie) {
  try {
    log("fetch: " + url);
    var headers = {
      "User-Agent":      UA,
      "Accept":          "application/json, text/plain, */*",
      "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
      "Referer":         SOURCE_REFERER
    };
    if (cookie) headers["Cookie"] = cookie;
    var res = httpRequest(url, { method: "GET", headers: headers });
    log("fetch: HTTP " + (res ? res.status : "?") +
        ", bodyLen=" + String(res && res.body || "").length);
    if (!res || !res.isSuccessful) {
      if (res && res.body) {
        log("fetch: fail preview: " +
            String(res.body).substring(0, 200).replace(/\s+/g, " "));
      }
      return null;
    }
    var text = String(res.body || "").trim();
    if (text.charAt(0) === "{") {
      try { return JSON.parse(text); }
      catch (e) { log("fetch: JSON ERR " + (e.message || e)); }
    }
    if (text.charAt(0) === "[") {
      try { return JSON.parse(text); } catch (e) {}
    }
    log("fetch: not-JSON preview: " + text.substring(0, 200).replace(/\s+/g, " "));
    return null;
  } catch (e) {
    log("fetch: EXC " + (e.message || e));
    return null;
  }
}

function _findMoviesInState(state) {
  if (!state || typeof state !== "object") return null;
  var keys = Object.keys(state);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i], v = state[k];

    if (typeof v === "string" && v.length > 20 && v.trim().charAt(0) === "[") {
      try {
        var arr = JSON.parse(v);
        if (Array.isArray(arr) && arr.length > 0 && arr[0] && arr[0].id) {
          log('findMovies: ✓ "' + k + '" (string) count=' + arr.length);
          return arr;
        }
      } catch (e) {}
    }
    if (Array.isArray(v) && v.length > 0 && v[0] && v[0].id) {
      log('findMovies: ✓ "' + k + '" (array) count=' + v.length);
      return v;
    }
  }
  return null;
}
function _sleep(ms) {
  var t = Date.now();
  while (Date.now() - t < ms) {}
}

function _fetchAllMoviesPages() {
  var all  = [];
  var seen = {};
  var maxPages   = 15;   // ~300 phim
  var emptyCount = 0;

  for (var p = 1; p <= maxPages; p++) {
    try {
      log("movies: fetch page " + p);
      var res = _tryFetchOne(
        SOURCE_BASE + "/api/movies?page=" + p + "&limit=20",
        null
      );

      if (!res) {
        log("movies: page " + p + " FAIL");
        emptyCount++;
        if (emptyCount >= 2) { log("movies: 2 fail liên tiếp → dừng"); break; }
        _sleep(600);
        continue;
      }

      var items = null;
      if (Array.isArray(res)) items = res;
      else if (Array.isArray(res.items)) items = res.items;
      else if (res.data && Array.isArray(res.data.items)) items = res.data.items;

      if (!items || items.length === 0) {
        log("movies: page " + p + " EMPTY");
        emptyCount++;
        if (emptyCount >= 2) break;
        _sleep(600);
        continue;
      }

      emptyCount = 0;
      var added = 0;
      for (var i = 0; i < items.length; i++) {
        var m = items[i];
        if (m && m.id && !seen[m.id]) {
          seen[m.id] = true;
          all.push(m);
          added++;
        }
      }
      log("movies: page " + p + " +" + added + " (total " + all.length + ")");

      if (added === 0) { log("movies: page trùng hoàn toàn → dừng"); break; }
      _sleep(350);  // tránh rate limit
    } catch (e) {
      log("movies: page " + p + " EXC " + (e.message || e));
      emptyCount++;
      if (emptyCount >= 2) break;
      _sleep(600);
    }
  }

  log("movies: DONE — " + all.length + " movies / " + maxPages + " pages");
  return all;
}
function _fetchBootstrapNoCookie() {
  var all = _fetchAllMoviesPages();
  if (all.length > 0) {
    log("bootstrap: ✓ " + all.length + " movies");
    return {
      ok: true,
      state: { langson_movies_v1: JSON.stringify(all) }
    };
  }
  return null;
}

function _fetchBootstrapWithCookie() {
  // /api/movies không cần cookie nên dùng luôn no-cookie flow
  return _fetchBootstrapNoCookie();
}

function _getBootstrap() {
  // 1. RAM cache < 5 phút → dùng luôn
  if (_bootstrapCache && Date.now() - _bootstrapTime < 5 * 60 * 1000) {
    log("bootstrap: RAM cache hit");
    return _bootstrapCache;
  }

  // 2. Chưa có RAM cache → thử localStorage
  if (!_bootstrapCache) _loadBootstrapFromStorage();

  // 3. Có cache (kể cả cũ) → dùng, chỉ refresh nếu quá cũ
  if (_bootstrapCache) {
    var age = Date.now() - _bootstrapTime;
    log("bootstrap: using cache age=" + (age / 60000).toFixed(1) + "m");

    // Nếu cache > 10 phút + đã hết cooldown → refresh ngầm
    if (age > 10 * 60 * 1000 && Date.now() - _lastFetchTry > _COOLDOWN) {
      _lastFetchTry = Date.now();
      var fresh = _fetchBootstrapNoCookie() || _fetchBootstrapWithCookie();
      if (fresh) {
        _bootstrapCache = fresh;
        _bootstrapTime  = Date.now();
        _saveBootstrapToStorage(fresh);
        log("bootstrap: refreshed OK");
      }
    }
    return _bootstrapCache;
  }

  // 4. Chưa có gì + trong cooldown → trả null
  if (Date.now() - _lastFetchTry < _COOLDOWN) {
    log("bootstrap: in cooldown (" +
        Math.ceil((_COOLDOWN - (Date.now() - _lastFetchTry)) / 1000) +
        "s left), return null");
    return null;
  }

  // 5. Fetch mới
  _lastFetchTry = Date.now();
  var b = _fetchBootstrapNoCookie() || _fetchBootstrapWithCookie();
  if (b) {
    _bootstrapCache = b;
    _bootstrapTime  = Date.now();
    _saveBootstrapToStorage(b);
    log("bootstrap: fetched OK");
  } else {
    log("bootstrap: ALL FAIL → cooldown " + (_COOLDOWN / 1000) + "s");
  }
  return b;
}

/* ============================================================================
 * SESSION — persist cookie localStorage
 * ============================================================================ */
function _cookieToString(map) {
  var p = [];
  for (var k in map) {
    if (map.hasOwnProperty(k) && map[k] && map[k] !== "deleted") {
      p.push(k + "=" + map[k]);
    }
  }
  return p.join("; ");
}

function _applySetCookie(map, sc) {
  if (!sc) return;
  var first = String(sc).split(";")[0].trim();
  var eq = first.indexOf("=");
  if (eq < 0) return;
  var name  = first.substring(0, eq).trim();
  var value = first.substring(eq + 1).trim();
  var lower = String(sc).toLowerCase();
  var expired = false;
  var ma = lower.match(/max-age\s*=\s*(-?\d+)/);
  if (ma && parseInt(ma[1], 10) <= 0) expired = true;
  var em = String(sc).match(/expires=([^;]+)/i);
  if (em) {
    var d = new Date(em[1]);
    if (!isNaN(d.getTime()) && d.getTime() < Date.now()) expired = true;
  }
  if (value === "deleted" || value === "" || value === "null") expired = true;
  if (expired) delete map[name];
  else         map[name] = value;
}

function _applySetCookies(map, arr) {
  if (!arr) return;
  if (typeof arr === "string") arr = [arr];
  for (var i = 0; i < arr.length; i++) _applySetCookie(map, arr[i]);
}

function _loadSessionFromStorage() {
  try {
    var raw = localStorage.getItem(_SESSION_STORAGE);
    if (!raw) return null;
    var obj = JSON.parse(raw);
    if (obj && obj.cookie && obj.expiresAt > Date.now() + 60000) {
      log("session: loaded from localStorage, cookieLen=" + obj.cookie.length);
      return obj;
    }
  } catch (e) {}
  return null;
}

function _saveSessionToStorage(sess) {
  try {
    localStorage.setItem(_SESSION_STORAGE, JSON.stringify(sess));
  } catch (e) {}
}

function _getSession(forceRefresh) {
  if (!forceRefresh && _session && _session.expiresAt > Date.now() + 60000) {
    return _session;
  }
  if (!forceRefresh) {
    var cached = _loadSessionFromStorage();
    if (cached) { _session = cached; return cached; }
  }

  var deviceId  = "dev_" + Math.random().toString(36).substring(2, 15) +
                  Date.now().toString(36);
  var cookieMap = {};

  try {
    var res1 = httpRequest(SOURCE_BASE + "/api/user/quick-session", {
      method: "POST",
      headers: {
        "Content-Type":    "application/json",
        "Accept":          "application/json, text/plain, */*",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
        "User-Agent":      UA,
        "Origin":          SOURCE_BASE,
        "Referer":         SOURCE_REFERER
      },
      body: JSON.stringify({ deviceId: deviceId })
    });
    if (res1 && res1.isSuccessful) {
      _applySetCookies(cookieMap, res1.setCookies);
      cookieMap["ls_device_id_v1"] = deviceId;
      log("session: quick-session OK cookies=" + Object.keys(cookieMap).join(","));
    } else {
      log("session: quick-session fail HTTP " + (res1 ? res1.status : "?"));
    }
  } catch (e) {
    log("session: quick-session EXC " + (e.message || e));
  }

  var cookieStr = _cookieToString(cookieMap);
  var expiresAt = Date.now() + 6 * 3600000;
  var m = cookieStr.match(/ls_catalog_pass=(\d+)/);
  if (m) {
    var ts = parseInt(m[1], 10);
    if (ts > 1700000000 && ts < 2100000000) expiresAt = ts * 1000;
  }

  _session = { cookie: cookieStr, expiresAt: expiresAt };
  _saveSessionToStorage(_session);
  log("session: ready cookieLen=" + cookieStr.length +
      ", hasCatalogPass=" + !!cookieMap["ls_catalog_pass"]);
  return _session;
}

/* ============================================================================
 * PIPE / QUERY HELPERS
 * ============================================================================ */
function _parseQueryParams(apiUrl) {
  var params = {};
  if (!apiUrl) return params;

  // Bỏ phần pipe nếu có (đề phòng)
  var clean = String(apiUrl).split("|")[0];

  var qi = clean.indexOf("?");
  if (qi < 0) return params;

  var qs = clean.substring(qi + 1);
  // Bỏ hash
  var hi = qs.indexOf("#");
  if (hi > -1) qs = qs.substring(0, hi);

  qs.split("&").forEach(function (pair) {
    if (!pair) return;
    var eq = pair.indexOf("=");
    if (eq < 0) return;
    var k = pair.substring(0, eq);
    var v = pair.substring(eq + 1);
    try { v = decodeURIComponent(v); } catch (e) {}
    params[k] = v;
  });
  return params;
}

/* ============================================================================
 * MOVIE FETCH
 * ============================================================================ */
function _fetchMovieDetailRaw(id) {
  var url = MOVIE_URL + "?id=" + encodeURIComponent(id);

  // Thử no-cookie trước
  try {
    log("movie: no-cookie id=" + id);
    var res = httpRequest(url, {
      method: "GET",
      headers: {
        "User-Agent":      UA,
        "Accept":          "application/json, text/plain, */*",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
        "Origin":          SOURCE_BASE,
        "Referer":         SOURCE_REFERER
      }
    });
    log("movie: no-cookie HTTP " + (res ? res.status : "?") +
        ", bodyLen=" + String(res && res.body || "").length);
    if (res && res.isSuccessful) {
      var data = JSON.parse(res.body);
      if (data && data.ok !== false) return data;
    }
  } catch (e) {
    log("movie: no-cookie EXC " + (e.message || e));
  }

  // Thử có cookie
  try {
    log("movie: with-cookie id=" + id);
    var sess = _getSession();
    var res2 = httpRequest(url, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Accept":     "application/json, text/plain, */*",
        "Origin":     SOURCE_BASE,
        "Referer":    SOURCE_REFERER,
        "Cookie":     sess.cookie
      }
    });
    log("movie: with-cookie HTTP " + (res2 ? res2.status : "?"));
    if (res2 && res2.isSuccessful) {
      var data2 = JSON.parse(res2.body);
      if (data2 && data2.ok !== false) return data2;
    }
  } catch (e) {
    log("movie: with-cookie EXC " + (e.message || e));
  }

  throw new Error("All movie fetch attempts failed");
}

/* ============================================================================
 * EMBED HELPERS
 * ============================================================================ */
function _isEmbedUrl(url) {
  if (!url) return false;
  return url.indexOf("m.yout-ube.com") > -1 ||
         url.indexOf("youtube.com/embed") > -1 ||
         url.indexOf("youtube-nocookie.com") > -1 ||
         url.indexOf("facebook.com/plugins/") > -1;
}

function _convertToEmbed(url) {
  if (!url || typeof url !== "string") return "";
  url = url.trim();
  if (_isEmbedUrl(url)) return url;
  var yt = url.match(
    /(?:youtube\.com\/watch\?[^#]*?\bv=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/
  );
  if (yt && yt[1]) return "https://m.yout-ube.com/watch?v=" + yt[1];
  if (url.indexOf("facebook.com") > -1) {
    var baseUrl = url.split("?")[0];
    return "https://www.facebook.com/plugins/video.php?href=" +
           encodeURIComponent(baseUrl) + "&show_text=false&width=1280";
  }
  return "";
}

function _extractYoutubeId(url) {
  if (!url) return "";
  var s = String(url).trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  var pats = [
    /youtube\.com\/watch\?[^#]*?\bv=([A-Za-z0-9_-]{11})/i,
    /youtu\.be\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i,
    /youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]{11})/i,
    /m\.yout-ube\.com\/watch\?v=([A-Za-z0-9_-]{11})/i
  ];
  for (var i = 0; i < pats.length; i++) {
    var m = s.match(pats[i]);
    if (m && m[1]) return m[1];
  }
  return "";
}

function _getCustomJS() {
  try {
    var res = httpRequest(CUSTOMJS_URL + "?t=" + Date.now(), { method: "GET" });
    if (res && res.isSuccessful && res.body) return res.body;
    log("customjs: HTTP " + (res ? res.status : "?"));
    return "";
  } catch (e) {
    log("customjs: EXC " + (e.message || e));
    return "";
  }
}

function _removeAccents(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/* ============================================================================
 * MANIFEST
 * ============================================================================ */
function getManifest() {
  return JSON.stringify({
    id:           "langlangson",
    name:         "Lãng Lãng Sơn [SHORT]",
    description:  "Phim ngắn review từ Facebook / YouTube",
    version:      "3.2.1",
    author:       "Alokillgtv",
    baseUrl:      SOURCE_BASE,
    imageReferer: SOURCE_REFERER,
    iconUrl:      "https://vaxplugin.alokillgtv02.workers.dev/img/langlangson.png",
    isEnabled:    true,
    isAdult:      false,
    type:         "MOVIE",
    layoutType:   "HORIZONTAL",
    playerType:   "embed",
    subtitleCat:  false,
    debug:        true
  });
}

/* ============================================================================
 * HOME / CATEGORIES
 * ============================================================================ */
function getHomeSections() {
  log("getHomeSections called");

  // PREWARM bootstrap 1 lần duy nhất khi vào plugin
  try {
    var b = _getBootstrap();
    if (b) {
      log("prewarm: OK, movies=" +
          (function () {
            try { return JSON.parse(b.state.langson_movies_v1).length; }
            catch (e) { return "?"; }
          })());
    } else {
      log("prewarm: FAIL (sẽ thử lại sau cooldown)");
    }
  } catch (e) {
    log("prewarm EXC: " + (e.message || e));
  }

  return JSON.stringify([
    { slug: "latest",            title: "Mới Cập Nhật", type: "Horizontal" },
    { slug: "all",               title: "Tất Cả Phim",  type: "Grid" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Mới Cập Nhật",   slug: "latest" },
    { name: "Nữ Chính",       slug: "genre:Nữ Chính" },
    { name: "Nam Chính",      slug: "genre:Nam Chính" },
    { name: "Tu Tiên",        slug: "genre:Tu Tiên" },
    { name: "Vả Mặt",         slug: "genre:Vả Mặt" },
    { name: "Xuyên Không",    slug: "genre:Xuyên Không" },
    { name: "Hài Hước",       slug: "genre:Hài Hước" },
    { name: "Tình Cảm",       slug: "genre:Tình Cảm" },
    { name: "Main Có Não",    slug: "genre:Main Có Não" },
    { name: "Nghịch Tập",     slug: "genre:Nghịch Tập" },
    { name: "Hệ Thống",       slug: "genre:Hệ Thống" },
    { name: "Hiện Đại",       slug: "genre:Hiện Đại" },
    { name: "Trọng Sinh",     slug: "genre:Trọng Sinh" }
  ]);
}

function getFilterConfig() {
  var cats = JSON.parse(getPrimaryCategories()).map(function (c) {
    return { name: c.name, value: c.slug };
  });
  return JSON.stringify({ category: cats });
}

function parseCategoriesResponse() { return getPrimaryCategories(); }
function parseCountriesResponse()  { return "[]"; }
function parseYearsResponse()      { return "[]"; }
function getUrlCategories()        { return PLACEHOLDER + "?cate=1"; }
function getUrlCountries()         { return ""; }
function getUrlYears()             { return ""; }

/* ============================================================================
 * URL BUILDERS — query string (pipe bị app cắt nên bỏ)
 * ============================================================================ */
function getUrlList(slug, filtersJson) {
  var page = 1;
  try {
    var fixed = (filtersJson || "{}")
      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/:,/g, ":");
    var f = JSON.parse(fixed);
    page = parseInt(f.page) || 1;
    if (f.category) {
      if (Array.isArray(f.category) && f.category.length > 0) {
        slug = f.category[0].slug || f.category[0].value || slug;
      } else if (typeof f.category === "string") {
        slug = f.category;
      }
    }
  } catch (e) {}

  var genre = "";
  if (slug && slug.indexOf("genre:") === 0) genre = slug.substring(6);

  var url = PLACEHOLDER + "?type=list&page=" + page +
            "&genre=" + encodeURIComponent(genre);
  log("getUrlList → " + url);
  return url;
}

function getUrlSearch(keyword, filtersJson) {
  var page = 1;
  try {
    var fixed = (filtersJson || "{}")
      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/:,/g, ":");
    var f = JSON.parse(fixed);
    page = parseInt(f.page) || 1;
  } catch (e) {}

  return PLACEHOLDER + "?type=search&page=" + page +
         "&q=" + encodeURIComponent(keyword || "");
}

/* ============================================================================
 * LIST PARSER
 * ============================================================================ */
function _buildListFromBootstrap(bootstrapData, params) {
  var state  = bootstrapData.state || {};
  var movies = _findMoviesInState(state) || [];

  if (movies.length === 0) {
    log("buildList: ⚠️ 0 movies in state. Dump state keys:");
    var ks = Object.keys(state);
    for (var ki = 0; ki < ks.length; ki++) {
      var k = ks[ki];
      var v = state[k];
      var vlen = (typeof v === "string") ? v.length : (Array.isArray(v) ? v.length + " (arr)" : typeof v);
      log("  state." + k + " = " + vlen);
    }
  }

  log("buildList: total=" + movies.length +
      ", genre=" + (params.genre || "(all)") +
      ", q=" + (params.q || "(none)"));

  if (params.genre) {
    var gNorm = String(params.genre).toLowerCase();
    movies = movies.filter(function (m) {
      if (m.genre && String(m.genre).toLowerCase() === gNorm) return true;
      if (Array.isArray(m.genres)) {
        return m.genres.some(function (g) { return (g || "").toLowerCase() === gNorm; });
      }
      return false;
    });
  }

  if (params.q) {
    var qNorm = _removeAccents(String(params.q).toLowerCase());
    movies = movies.filter(function (m) {
      return _removeAccents(String(m.title || "").toLowerCase()).indexOf(qNorm) > -1;
    });
  }

  movies.sort(function (a, b) {
    return (b.latestEpisodeAt || 0) - (a.latestEpisodeAt || 0);
  });

  var page       = params.page || 1;
  var limit      = 20;
  var total      = movies.length;
  var totalPages = Math.ceil(total / limit) || 1;
  var start      = (page - 1) * limit;
  var paged      = movies.slice(start, start + limit);

  log("buildList: after filter=" + total + " → " + paged.length + " items");

  return {
    items: paged.map(function (m) {
      return {
        id:              m.id,
        title:           m.title || "",
        posterUrl:       m.poster || "",
        backdropUrl:     m.poster || "",
        quality:         "",
        year:            0,
        episode_current: (m.totalSeasons || 1) + " Mùa",
        lang:            ""
      };
    }),
    pagination: { page: page, limit: limit, total: total, totalPages: totalPages }
  };
}

function parseListResponse(html, apiUrl) {
  log("parseListResponse apiUrl=" + (apiUrl || "").substring(0, 200));

  try {
    var params = _parseQueryParams(apiUrl);
    log("params=" + JSON.stringify(params));

    var bootstrap = _getBootstrap();
    if (!bootstrap) {
      log("parseListResponse: NO BOOTSTRAP → return empty");
      return JSON.stringify({
        items: [],
        pagination: { currentPage: 1, totalPages: 1 }
      });
    }

    var result = _buildListFromBootstrap(bootstrap, {
      page:  parseInt(params.page) || 1,
      genre: params.genre || "",
      q:     params.q || ""
    });
    log("parseListResponse: " + result.items.length + " items returned");

    return JSON.stringify({
      items: result.items,
      pagination: {
        currentPage:  result.pagination.page,
        totalPages:   result.pagination.totalPages,
        totalItems:   result.pagination.total,
        itemsPerPage: result.pagination.limit
      }
    });
  } catch (e) {
    log("parseListResponse FATAL: " + (e.message || e));
    return JSON.stringify({
      items: [],
      pagination: { currentPage: 1, totalPages: 1 }
    });
  }
}

function parseSearchResponse(html, apiUrl) {
  return parseListResponse(html, apiUrl);
}

/* ============================================================================
 * MOVIE DETAIL
 * ============================================================================ */
function _buildMovieDetail(movie, fallbackId) {
  var seasons     = movie.seasons || [];
  var multiSeason = seasons.length > 1;
  var episodes    = [];
  var idx         = 0;

  seasons.forEach(function (season, sIdx) {
    (season.episodes || []).forEach(function (ep, eIdx) {
      var video = ep.video || "";
      var embed = _convertToEmbed(video);
      if (!embed) return;

      idx++;
      var epName = multiSeason
        ? (season.name || ("Mùa " + (sIdx + 1))) + " - " +
          (ep.name || ("Tập " + (eIdx + 1)))
        : (ep.name || ("Tập " + (eIdx + 1)));

      episodes.push({ id: embed, name: epName, slug: "ep-" + idx });
    });
  });

  var servers = [];
  if (episodes.length > 0) {
    servers.push({ name: "Langson", episodes: episodes });
  }

  var categoryMd = "";
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    categoryMd = movie.genres.map(function (g) {
      return "[" + g + "](genre:" + g + ")";
    }).join(", ");
  }

  var castsStr = "";
  if (movie.youtubeChannelName) {
    castsStr = movie.youtubeChannelUrl
      ? "[" + movie.youtubeChannelName + "](" + movie.youtubeChannelUrl + ")"
      : movie.youtubeChannelName;
  }

  return {
    id:              movie.id || fallbackId || "",
    title:           movie.title || "",
    posterUrl:       movie.poster || "",
    backdropUrl:     movie.poster || "",
    description:     movie.description || "",
    quality:         "HD",
    year:            0,
    status:          (movie.season || seasons.length || 1) + " Mùa",
    category:        categoryMd,
    episode_current: "",
    servers:         servers,
    duration:        movie.duration || "",
    casts:           castsStr,
    director:        "",
    country:         ""
  };
}

function getUrlDetail(slug, datasend) {
  log("getUrlDetail slug=" + (slug || "").substring(0, 200));
  if (!slug) return "";

  if (_isEmbedUrl(slug)) {
    return JSON.stringify(_buildEmbedResponse(slug));
  }

  try {
    var data  = _fetchMovieDetailRaw(slug);
    var movie = data.movie || (data.data && data.data.movie) || data;
    var det   = _buildMovieDetail(movie, slug);
    log("getUrlDetail: OK " + det.servers.length + " servers");
    return JSON.stringify(det);
  } catch (e) {
    log("getUrlDetail FATAL: " + (e.message || e));
    return JSON.stringify({
      id:          slug,
      title:       "Lỗi tải phim",
      description: (e.message || ""),
      servers:     []
    });
  }
}

function parseMovieDetail(html, apiUrl, datasend) {
  try {
    var data  = JSON.parse(html);
    var movie = data.movie || (data.data && data.data.movie) || data;
    return JSON.stringify(_buildMovieDetail(movie, apiUrl));
  } catch (e) {
    return JSON.stringify({
      id:      apiUrl || "error",
      title:   "Lỗi",
      servers: []
    });
  }
}

/* ============================================================================
 * STREAM
 * ============================================================================ */
function getStreamLink(episodeId, datasend) {
  if (!episodeId) return "";
  var url = episodeId.split("|")[0];
  if (_isEmbedUrl(url)) {
    log("getStreamLink: embed " + url.substring(0, 100));
    return JSON.stringify(_buildEmbedResponse(url));
  }
  return "";
}

function parseDetailResponse(html, apiUrl, datasend) {
  var realUrl = (apiUrl || "").split("|")[0];
  if (!realUrl) return JSON.stringify({ url: "", isEmbed: false });
  if (_isEmbedUrl(realUrl)) return JSON.stringify(_buildEmbedResponse(realUrl));
  return JSON.stringify({
    url:     realUrl,
    isEmbed: false,
    headers: { "Referer": SOURCE_REFERER, "User-Agent": UA }
  });
}

function parseEmbedResponse(html, url) {
  return JSON.stringify({
    url:       "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
    mimeType:  "video/mp4",
    isEmbed:   false,
    headers:   {},
    subtitles: []
  });
}

function _buildEmbedResponse(stream) {
  if (!stream) return { url: "", isEmbed: false };

  var isFacebook = stream.indexOf("facebook") > -1;
  var rawSC;

  if (isFacebook) {
    rawSC = _facebookPatchJS() + "\n" + _rawJS();
  } else {
    var videoId = _extractYoutubeId(stream);
    var remote  = _getCustomJS();

    var cleanupJs =
      "(function(){try{" +
      'localStorage.removeItem("yt_watch_history");' +
      'localStorage.removeItem("yt_bookmarks_v2");' +
      "}catch(e){}})();";

    rawSC =
      "window.CONSOLE=false;" +
      "window.CURRENT_VD=" + JSON.stringify(videoId) + ";" +
      "window.LIST_URL="  + JSON.stringify(YT_TRENDING_URL) + ";" +
      "window.LASTSAVE=true;" +
      cleanupJs +
      remote;
  }

  return {
    url:       stream,
    isEmbed:   false,
    autoClick: false,
    headers: {
      "Referer":         SOURCE_REFERER,
      "Origin":          SOURCE_REFERER,
      "User-Agent":      UA,
      "Block-Ads":       false,
      "Block-AutoClick": "true",
      "Sniffer":         false,
      "Custom-Js":       rawSC
    }
  };
}

/* ============================================================================
 * FB PATCH + RAW JS
 * ============================================================================ */
function _facebookPatchJS() {
  return [
    "(function(){",
    '  if (window.__vaxFbPatched) return;',
    "  window.__vaxFbPatched = true;",
    "  var origRemove = Element.prototype.remove;",
    "  Element.prototype.remove = function(){",
    "    var p = this.parentNode;",
    "    if (p === document.body || p === document.head) return;",
    "    return origRemove.call(this);",
    "  };",
    "  var origRemoveChild = Node.prototype.removeChild;",
    "  Node.prototype.removeChild = function(child){",
    "    if (this === document.body || this === document.head) return child;",
    "    return origRemoveChild.call(this, child);",
    "  };",
    '  var css = document.createElement("style");',
    "  css.textContent = [",
    '    "html,body{background:#000!important;overflow:hidden!important;margin:0!important;padding:0!important;width:100%!important;height:100%!important;}",',
    '    "video{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;object-fit:contain!important;z-index:999998!important;}"',
    '  ].join("");',
    "  if (document.head) document.head.appendChild(css);",
    "})();"
  ].join("\n");
}

function _rawJS() {
  return `
(function(){
  function runVideo(){
    var video = document.querySelector('video');
    if (!video) { return; }
    video.controls = true;
    video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000;';
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:999999;';
    wrapper.appendChild(video);
    document.body.innerHTML = '';
    document.body.appendChild(wrapper);
    if (video.paused) video.play().catch(function(){ video.muted = true; video.play(); });
  }
  var seconds = 0;
  var timer = setInterval(function(){
    seconds++;
    if (document.querySelector('video')) { clearInterval(timer); runVideo(); return; }
    if (seconds > 20) { clearInterval(timer); runVideo(); }
  }, 1000);
})();
`;
}


/*
# 📘 Sổ Tay Fix Plugin VAAPP — Nguồn có WAF / Cloudflare / Rate Limit

> Kinh nghiệm thực chiến từ việc fix plugin **Lãng Lãng Sơn** (langlangson.xyz) —
> nguồn bị Cloudflare WAF chặn IP Worker, đổi API, rate limit.
> Áp dụng cho mọi plugin VAAPP gặp tình huống tương tự.

---

## 🎯 Khi nào dùng sổ tay này

Khi viết plugin VAAPP cho một website nguồn phim/truyện mà:

- Website dùng **Cloudflare WAF** hoặc **nginx** chặn IP/header lạ
- Worker proxy trả **403 Forbidden** (bị WAF chặn dải IP Cloudflare)
- App fetch URL của plugin trả **403/404** → danh sách rỗng
- Server trả **429 Catalog rate limit** khi gọi liên tục
- Server đổi API, bỏ field cũ (như `langson_movies_v1`)
- Log trống trơn, không biết lỗi ở đâu

---

## 📋 Mục lục

1. Tổng hợp 12 lỗi thường gặp
2. Checklist debug 6 bước
3. 6 Pattern tái sử dụng
4. 10 Nguyên tắc vàng
5. Cấu trúc file plugin chuẩn
6. Bảng tra cứu nhanh

---

## 🔥 Tổng hợp 12 lỗi thường gặp

### Lỗi 1: Worker trả 403 — quick-session HTTP 403

**Triệu chứng:**

```json
{
  "ok": false,
  "error": "Proxy movie failed",
  "message": "quick-session HTTP 403 — <html>...403 Forbidden...</html>"
}
```

**Nguyên nhân:** IP Cloudflare Worker bị nginx/WAF của nguồn chặn. Header `CF-Worker` tự động thêm cũng là dấu hiệu bị block.

**Cách fix:** Bỏ Worker, chuyển sang `httpRequest` native của VAAPP.

```javascript
// TRƯỚC: fetch qua Worker
var res = await fetch(WORKER_BASE + "/api/movie?id=" + id);

// SAU: gọi thẳng nguồn bằng httpRequest native
var res = httpRequest("https://langlangson.xyz/api/movie?id=" + id, {
  method: "GET",
  headers: {
    "User-Agent": UA,
    "Referer": "https://langlangson.xyz/"
  }
});
```

**Vì sao hoạt động:**

| Worker | httpRequest native |
|---|---|
| IP Cloudflare | IP 4G/WiFi của user |
| Header `CF-Worker` | Không có header lạ |
| Rate limit chung dải IP | Mỗi user 1 IP |
| Dễ bị WAF chặn | User vẫn mở web bằng Chrome → IP sạch |

---

### Lỗi 2: Không lấy được danh sách phim — nhầm plugin

**Triệu chứng:** Log ghi tag `[vaxtv]` chứ không phải `[langlangson]`. Danh sách toàn `VAX MOVIE`, `VAX ANIME`, `VAX TV`...

**Nguyên nhân:** Chưa cài / chưa bật đúng plugin. App đang chạy plugin khác.

**Cách fix:**

1. Mở app → **Cài đặt → Quản lý Plugin**
2. Tìm plugin có **id đúng** (vd `langlangson`)
3. Nếu chưa có → bấm dấu **+** dán code vào
4. Nếu có rồi → **xoá cũ, cài lại**
5. Vào Home chọn đúng plugin
6. Kiểm tra log tag **phải khớp id**

**Mẹo:** Đặt `log()` có prefix riêng ngay từ đầu:

```javascript
function log(msg) { console.log("[MyPlugin] " + msg); }
```

---

### Lỗi 3: Log trống trơn — App không gọi parseListResponse

**Triệu chứng:**

```text
[12:00:53] getHomeSections called
[12:00:53] getUrlList → https://langlangson.xyz/api/movies
(không có "parseListResponse called")
```

**Nguyên nhân:** `getUrlList` trả URL của nguồn (bị WAF 403/404). App fetch fail → **bỏ luôn, không gọi parser**.

**Cách fix:** Trả **URL placeholder** để app fetch luôn 200, rồi parse mới làm việc thật.

```javascript
var PLACEHOLDER = "https://example.com/";

function getUrlList(slug, filtersJson) {
  // Ép app fetch placeholder để nó LUÔN gọi parseListResponse
  return PLACEHOLDER + "?type=list&page=1&genre=" + encodeURIComponent(genre);
}

function parseListResponse(html, apiUrl) {
  // Bỏ qua html của example.com
  // Dùng httpRequest lấy data thật từ nguồn
  var real = httpRequest("https://langlangson.xyz/api/movies?...", {
    method: "GET",
    headers: { "User-Agent": UA, "Referer": "https://langlangson.xyz/" }
  });
  // ... parse real.body ...
}
```

**Vì sao hoạt động:** App fetch `example.com/?...` → 200 → **chắc chắn gọi** `parseListResponse` → parser lấy data thật qua `httpRequest`.

---

### Lỗi 4: Placeholder trả 404 — dùng path con thay vì root

**Triệu chứng:** Đã dùng placeholder nhưng vẫn không gọi parse. Log chỉ có `getUrlList`, không có `parseListResponse`.

**Nguyên nhân:** URL là `https://example.com/langson?type=list` (path `/langson`) → example.com trả **404** → app bỏ.

**Cách fix:** Dùng path gốc `/`:

```javascript
// SAI — path /langson trả 404
var PLACEHOLDER = "https://example.com/langson";

// ĐÚNG — path / trả 200
var PLACEHOLDER = "https://example.com/";
```

**Mẹo:** Luôn giữ query string ở gốc, không thêm path con:

```text
https://example.com/?type=list&page=1&genre=...   OK
https://example.com/foo?type=list&page=1          SAI
```

---

### Lỗi 5: Pipe data bị app cắt — params rỗng

**Triệu chứng:**

```text
parseListResponse apiUrl=https://example.com/?list=1
params={}                                          <-- RỖNG!
```

Thay vì `params={"page":1,"genre":"Tu Tiên"}`.

**Nguyên nhân:** App version này **cắt bỏ phần `|data:...`** trước khi truyền `apiUrl` cho parser (khác với doc mô tả). Nên `_getPipeData(apiUrl)` trả rỗng.

**Cách fix:** Dùng **query string** thay vì pipe.

```javascript
// SAI — pipe bị app cắt
return "https://example.com/?list=1|data:" +
       encodeURIComponent(JSON.stringify(params));

// ĐÚNG — query string vẫn còn trong apiUrl
return "https://example.com/?type=list&page=" + page +
       "&genre=" + encodeURIComponent(genre);
```

Helper parse query:

```javascript
function _parseQueryParams(apiUrl) {
  var params = {};
  var clean = String(apiUrl).split("|")[0];    // bỏ pipe nếu có
  var qi = clean.indexOf("?");
  if (qi < 0) return params;
  clean.substring(qi + 1).split("&").forEach(function (pair) {
    var eq = pair.indexOf("=");
    if (eq < 0) return;
    var k = pair.substring(0, eq);
    var v = pair.substring(eq + 1);
    try { v = decodeURIComponent(v); } catch (e) {}
    params[k] = v;
  });
  return params;
}
```

---

### Lỗi 6: HTTP 429 — Catalog rate limit

**Triệu chứng:**

```text
bootstrap: HTTP 429, body: {"ok":false,"error":"Catalog rate limit"}
```

Xảy ra khi App gọi `parseListResponse` **7 lần liên tiếp** (1 home + 6 genre section), mỗi lần đều fetch.

**Nguyên nhân:** Server giới hạn N request/phút. 7 request trong 1 giây → hit limit ngay.

**Cách fix 2 lớp:**

**Lớp 1: Cache bootstrap trong localStorage** — chỉ fetch 1 lần, dùng mãi:

```javascript
var _bootstrapCache = null;
var _bootstrapTime  = 0;
var _CACHE_KEY      = "plugin_bootstrap_v1";   // tăng version khi sửa code
var _COOLDOWN       = 90 * 1000;               // 90s sau fail
var _lastFetchTry   = 0;

function _loadCache() {
  try {
    var raw = localStorage.getItem(_CACHE_KEY);
    if (!raw) return false;
    var obj = JSON.parse(raw);
    if (obj && obj.data && obj.ts) {
      _bootstrapCache = obj.data;
      _bootstrapTime  = obj.ts;
      return true;
    }
  } catch (e) {}
  return false;
}

function _saveCache(data) {
  try {
    localStorage.setItem(_CACHE_KEY,
      JSON.stringify({ ts: Date.now(), data: data }));
  } catch (e) {}
}

function _getBootstrap() {
  // 1. RAM cache < 5 phút
  if (_bootstrapCache && Date.now() - _bootstrapTime < 5 * 60 * 1000) {
    return _bootstrapCache;
  }
  // 2. Load từ localStorage
  if (!_bootstrapCache) _loadCache();
  if (_bootstrapCache) return _bootstrapCache;

  // 3. Cooldown sau fail
  if (Date.now() - _lastFetchTry < _COOLDOWN) return null;

  // 4. Fetch mới
  _lastFetchTry = Date.now();
  var data = _fetchReal();
  if (data) {
    _bootstrapCache = data;
    _bootstrapTime  = Date.now();
    _saveCache(data);
  }
  return data;
}
```

**Lớp 2: Prewarm trong `getHomeSections`** — chạy 1 lần trước khi parse:

```javascript
function getHomeSections() {
  try { _getBootstrap(); } catch (e) {}   // prewarm 1 lần
  return JSON.stringify([
    // ... sections ...
  ]);
}
```

**Kết quả:** 7 lần parse sau đó dùng cache, không fetch → không 429.

---

### Lỗi 7: Server đổi API — state không có movies

**Triệu chứng:**

```text
parse: state keys=langson_settings_v1,langson_home_music_v612,
                  langson_genres_v1,langson_donate_v1,langson_analytics_v1
parse: cataloglessTest=true — server KHÔNG trả movies
```

Trước đây có `langson_movies_v1`, giờ không còn.

**Nguyên nhân:** Server bật chế độ `cataloglessTest=true` — bootstrap **không còn trả movies**. Movies chuyển sang endpoint riêng (`/api/movies`).

**Cách fix:** Fetch nhiều endpoint, lấy cái nào trả movies thì dùng:

```javascript
var MOVIE_ENDPOINTS = [
  SOURCE_BASE + "/api/movies?page=1&limit=20",
  SOURCE_BASE + "/api/catalog",
  SOURCE_BASE + "/api/list"
];

function _fetchMovies() {
  for (var i = 0; i < MOVIE_ENDPOINTS.length; i++) {
    var res = _tryFetchOne(MOVIE_ENDPOINTS[i], null);
    if (!res) continue;
    var arr = null;
    if (Array.isArray(res)) arr = res;
    else if (Array.isArray(res.items)) arr = res.items;
    else if (res.data && Array.isArray(res.data.items)) arr = res.data.items;
    if (arr && arr.length > 0 && arr[0].id) return arr;
  }
  return null;
}
```

**Quan trọng:** Dump keys của state để biết server trả gì:

```javascript
var ks = Object.keys(boot.state);
for (var i = 0; i < ks.length; i++) {
  var v = boot.state[ks[i]];
  log("  state." + ks[i] + " = " +
      (typeof v === "string" ? "string len=" + v.length :
       Array.isArray(v) ? "array len=" + v.length : typeof v));
}
```

**Cách tìm endpoint đúng (không cần đoán):**

1. Mở **Chrome** trên máy tính → `https://langlangson.xyz/`
2. **F12** → tab **Network** → **Ctrl+R** reload
3. Filter `api` → tìm request **200** response **>50KB** có `"title"`, `"poster"`, `"phim-"`
4. Copy **URL + Response preview 200 ký tự** → thêm vào `MOVIE_ENDPOINTS`

---

### Lỗi 8: _findMoviesInState is not defined

**Triệu chứng:**

```text
bootstrap: EXC '_findMoviesInState' is not defined
```

**Nguyên nhân:** Gọi hàm chưa define (thường do copy thiếu block).

**Cách fix:** Đảm bảo hàm được define TRƯỚC khi gọi. Đặt ngay dưới `log()`:

```javascript
function _findMoviesInState(state) {
  if (!state || typeof state !== "object") return null;
  var keys = Object.keys(state);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i], v = state[k];
    if (typeof v === "string" && v.length > 20 &&
        v.trim().charAt(0) === "[") {
      try {
        var arr = JSON.parse(v);
        if (Array.isArray(arr) && arr.length > 0 && arr[0].id) return arr;
      } catch (e) {}
    }
    if (Array.isArray(v) && v.length > 0 && v[0].id) return v;
  }
  return null;
}
```

**Mẹo phòng tránh:** Test nhanh trong console VAAPP:

```javascript
typeof _findMoviesInState   // phải ra "function"
```

---

### Lỗi 9: Chỉ có 20 phim — không phân trang, không đủ genre

**Triệu chứng:**

```text
movies: page=1&limit=20 → 20 movies
buildList: total=20, genre="Vả Mặt" → 0 items
```

Các genre ít phổ biến trả 0 phim. Không có page 2.

**Nguyên nhân:** Chỉ fetch **1 page duy nhất** `/api/movies?page=1&limit=20`.

**Cách fix:** Fetch nhiều page tuần tự (an toàn) hoặc song song (nhanh).

**Cách 1: Tuần tự + sleep chống 429**

```javascript
function _sleep(ms) {
  var t = Date.now();
  while (Date.now() - t < ms) {}
}

function _fetchAllMoviesPages() {
  var all = [], seen = {}, emptyCount = 0;
  var maxPages = 15;   // ~300 phim

  for (var p = 1; p <= maxPages; p++) {
    var res = _tryFetchOne(
      SOURCE_BASE + "/api/movies?page=" + p + "&limit=20", null);
    if (!res) {
      emptyCount++;
      if (emptyCount >= 2) break;
      _sleep(600);
      continue;
    }
    var items = Array.isArray(res) ? res :
                Array.isArray(res.items) ? res.items :
                (res.data && Array.isArray(res.data.items)) ? res.data.items : [];
    if (items.length === 0) {
      emptyCount++;
      if (emptyCount >= 2) break;
      _sleep(600);
      continue;
    }
    emptyCount = 0;
    var added = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id && !seen[items[i].id]) {
        seen[items[i].id] = true;
        all.push(items[i]);
        added++;
      }
    }
    log("page " + p + " +" + added + " (total " + all.length + ")");
    if (added === 0) break;
    _sleep(350);   // tránh rate limit
  }
  return all;
}
```

**Cách 2: Song song bằng fetchAll (nhanh hơn ~10x)**

```javascript
function _fetchAllMoviesPages() {
  var urls = [];
  for (var p = 1; p <= 15; p++) {
    urls.push(SOURCE_BASE + "/api/movies?page=" + p + "&limit=20");
  }
  var all = [], seen = {};
  try {
    var responses = fetchAll(urls, {
      headers: { "User-Agent": UA, "Accept": "application/json" }
    });
    for (var i = 0; i < responses.length; i++) {
      var r = responses[i];
      if (!r || !r.isSuccessful) continue;
      var obj = null;
      try { obj = JSON.parse(r.body); } catch (e) { continue; }
      var items = Array.isArray(obj) ? obj :
                  Array.isArray(obj.items) ? obj.items :
                  (obj.data && Array.isArray(obj.data.items)) ? obj.data.items : [];
      for (var j = 0; j < items.length; j++) {
        if (items[j].id && !seen[items[j].id]) {
          seen[items[j].id] = true;
          all.push(items[j]);
        }
      }
    }
  } catch (e) { log("fetchAll EXC: " + e.message); }
  return all;
}
```

**Khuyến nghị:** Thử `fetchAll` trước. Nếu log 429 → quay lại tuần tự + `_sleep`.

---

### Lỗi 10: hasCatalogPass=false — không ảnh hưởng

**Triệu chứng:**

```text
session: ready cookieLen=180, hasCatalogPass=false
```

**Nguyên nhân:** Thiếu cookie `ls_catalog_pass` (do flow login 4 bước không hoàn tất).

**Cách xử lý:** **KHÔNG CẦN FIX** nếu:

- `/api/movies` là public (log có `movie: no-cookie HTTP 200`)
- `/api/movie?id=` là public

Chỉ fix nếu:

- Log ghi `HTTP 401` hoặc `HTTP 403` khi gọi `/api/movie`
- Server trả `{ok:false, error:"catalog required"}`

**Khi cần fix:** Thêm kick request sau bootstrap:

```javascript
if (!cookieMap["ls_catalog_pass"]) {
  var res = httpRequest(SOURCE_BASE + "/api/movie?id=phim-xxx", {
    method: "GET",
    headers: { "Cookie": cookieStr, "Referer": SOURCE_REFERER }
  });
  _applySetCookies(cookieMap, res && res.setCookies);
}
```

---

### Lỗi 11: CustomJS SyntaxError — không phải plugin mình

**Triệu chứng:**

```text
[CustomJS][ERROR] Uncaught SyntaxError: missing ) after argument list
[CustomJS][WARN] No available adapters.
```

**Nguyên nhân:** File `custom.js` remote (vd YouTube Ultimate từ `vaxplugin...workers.dev`) có lỗi cú pháp. **Không phải plugin của bạn.**

**Cách xử lý:**

- **Bỏ qua** nếu video vẫn phát (`Player V3 init currentId=...`, `[Scale] applied: contain`)
- **Kiểm tra:** `Custom-Js` trong `parseDetailResponse` có import file remote không

```javascript
function _getCustomJS() {
  try {
    var res = httpRequest(CUSTOMJS_URL, { method: "GET" });
    if (res && res.isSuccessful) return res.body;
  } catch (e) {}
  return "";   // fallback không Custom-Js
}
```

**Nếu muốn fix tận gốc:** Vào file `custom.js` remote sửa lỗi cú pháp (thường do template string bị cắt).

---

### Lỗi 12: JSON lẫn HTML — contentType text/html

**Triệu chứng:**

```text
bootstrap: HTTP 200, bodyLen=240351, contentType=text/html
parse: JSON.parse ERR unexpected token <
```

**Nguyên nhân:** Server trả HTML (SPA shell) chứa `<script>window.__INITIAL_STATE__={...}</script>` thay vì JSON thuần.

**Cách fix:** Parser đa năng — thử JSON, rồi HTML.

```javascript
function _parsePayload(text) {
  if (!text) return null;
  text = String(text).trim();
  if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);

  // Case 1: JSON thuần
  if (text.charAt(0) === "{") {
    try {
      var data = JSON.parse(text);
      if (data && data.ok === true && data.state) return data;
    } catch (e) {}
  }

  // Case 2: HTML có __INITIAL_STATE__ / __NEXT_DATA__
  var markers = ["window.__INITIAL_STATE__", "__INITIAL_STATE__", "__NEXT_DATA__"];
  for (var mi = 0; mi < markers.length; mi++) {
    var pos = text.indexOf(markers[mi]);
    if (pos < 0) continue;
    var eq = text.indexOf("=", pos + markers[mi].length);
    if (eq < 0) continue;
    var bs = text.indexOf("{", eq + 1);
    if (bs < 0) continue;

    var depth = 0, inStr = false, strCh = "", esc = false, endPos = -1;
    for (var i = bs; i < text.length; i++) {
      var ch = text.charAt(i);
      if (esc) { esc = false; continue; }
      if (inStr) {
        if (ch === "\\") { esc = true; continue; }
        if (ch === strCh) inStr = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = true; strCh = ch; continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) { endPos = i; break; } }
    }
    if (endPos < 0) continue;
    try {
      var obj = JSON.parse(text.substring(bs, endPos + 1));
      if (obj && obj.state) return { ok: true, state: obj.state };
    } catch (e) {}
  }

  // Case 3: Regex bắt thẳng langson_movies_v1 = "..."
  var m = text.match(/"langson_movies_v1"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (m) {
    return { ok: true, state: {
      langson_movies_v1: m[1].replace(/\\"/g, '"')
    }};
  }

  return null;
}
```

---

## 🚑 Checklist debug 6 bước

Khi plugin mới bị lỗi, chạy qua checklist theo thứ tự:

### Bước 1: Xác định plugin có được load đúng không

```text
Log có tag [MyPlugin] chưa?
└─ Nếu không: cài lại, chọn đúng plugin
```

### Bước 2: Kiểm tra parseListResponse có được gọi không

```text
Log có "parseListResponse called" chưa?
├─ KHÔNG → Lỗi 3/4: URL placeholder không trả 200
└─ CÓ   → Sang bước 3
```

### Bước 3: Kiểm tra params có parse đúng không

```text
Log params={...} có data chưa?
├─ RỖNG  → Lỗi 5: pipe bị cắt, đổi sang query string
└─ CÓ    → Sang bước 4
```

### Bước 4: Kiểm tra fetch data thật

```text
Log HTTP status?
├─ 403 → Lỗi 1: IP/WAF, cần VPN hoặc đổi domain
├─ 429 → Lỗi 6: rate limit, cache + cooldown
├─ 200 nhưng body rỗng/không phải data → Lỗi 7: server đổi API
└─ 200 có data → Sang bước 5
```

### Bước 5: Kiểm tra parse shape

```text
Log state keys có movies không?
├─ KHÔNG → Lỗi 7: dùng /api/movies riêng
└─ CÓ    → Sang bước 6
```

### Bước 6: Kiểm tra filter

```text
Log "after filter=X items"
├─ 0 items do filter → dữ liệu ít, cần Lỗi 9: fetch nhiều page
└─ > 0 items → OK, danh sách đã chạy
```

---

## 🧰 6 Pattern tái sử dụng

### Pattern 1: Placeholder URL để ép app gọi parser

```javascript
var PLACEHOLDER = "https://example.com/";

function getUrlList(slug, filters) {
  return PLACEHOLDER + "?type=list&page=" + page +
         "&genre=" + encodeURIComponent(genre);
}
```

**Dùng khi:** URL nguồn bị WAF chặn 403, app không gọi parser.

### Pattern 2: Cache localStorage chống rate limit

```javascript
var _CACHE_KEY = "plugin_data_v1";   // tăng version khi sửa code
function _getCached() {  load từ localStorage  }
function _setCached(d) {  save vào localStorage  }
```

**Dùng khi:** Server trả 429 khi gọi liên tục.

### Pattern 3: Fallback nhiều endpoint

```javascript
var ENDPOINTS = [url1, url2, url3];
function _tryAll() {
  for (var i = 0; i < ENDPOINTS.length; i++) {
    var r = _tryFetchOne(ENDPOINTS[i], null);
    if (r && _isValidShape(r)) return r;
  }
  return null;
}
```

**Dùng khi:** Không chắc server dùng endpoint nào sau khi đổi API.

### Pattern 4: Log đầy đủ ở mọi bước

```javascript
function log(msg) { try { console.log("[Plugin] " + msg); } catch (e) {} }

log("getManifest called");
log("getUrlList → " + url);
log("parseListResponse apiUrl=" + apiUrl);
log("fetch HTTP " + res.status + ", bodyLen=" + body.length);
log("parse state keys=" + keys.join(","));
log("buildList: " + total + " → " + paged.length + " items");
```

**Dùng khi:** Lúc nào cũng nên. Log đầy đủ = fix nhanh gấp 10 lần.

### Pattern 5: Dump state khi fail

```javascript
if (!movies || movies.length === 0) {
  log("0 movies. Dump state:");
  var ks = Object.keys(state);
  for (var i = 0; i < ks.length; i++) {
    var v = state[ks[i]];
    log("  " + ks[i] + " = " +
        (typeof v === "string" ? "str len=" + v.length :
         Array.isArray(v) ? "arr len=" + v.length : typeof v));
  }
}
```

**Dùng khi:** Parser trả 0 items mà không biết tại sao.

### Pattern 6: Xử lý shape linh hoạt

```javascript
function _extractItems(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (res.state) return _findMoviesInState(res.state);
  return [];
}
```

**Dùng khi:** Server có thể trả `{items:[]}` / `{data:{items:[]}}` / `[]` / `{state:{...}}`.

---

## 📌 10 Nguyên tắc vàng khi viết plugin cho nguồn khó

1. **Log trước, sửa sau** — Không log = mù. Luôn log 6 bước: manifest → list → fetch → parse → filter → return.

2. **Fetch bằng `httpRequest`, không fetch qua Worker** — Trừ khi user cần proxy vượt địa lý, còn lại native luôn nhanh và ít bị chặn hơn.

3. **Placeholder URL thay vì URL nguồn** — Nếu nguồn có WAF, dùng `https://example.com/` để ép app gọi parser.

4. **Cache localStorage** — Bất kỳ API nào có rate limit đều phải cache. Tăng version key khi sửa code.

5. **Query string thay pipe** — Pipe có thể bị app cắt ở version mới. Query string an toàn hơn.

6. **Fallback đa tầng** — Khi server đổi API: bootstrap → /api/movies → /api/catalog. Thử lần lượt.

7. **Dump state khi fail** — Không đoán. Log keys + độ dài value, đọc là biết.

8. **Test bằng Chrome F12 song song** — Không đoán endpoint. Mở web = biết server gọi gì.

9. **Không spam request** — Nếu 429, phải sleep hoặc cooldown. Spam chỉ bị block lâu hơn.

10. **Mỗi lỗi 1 note** — Gặp lỗi mới → ghi vào sổ này → lần sau tra 30 giây thay vì 3 tiếng.

---

## 📁 Cấu trúc file plugin chuẩn (dễ maintain)

```text
1.  Header comment + version
2.  Constants (URL, UA, cache keys)
3.  log()
4.  Cookie/session helpers
5.  Cache helpers (localStorage)
6.  Fetch helpers (httpRequest wrapper)
7.  Parse helpers (JSON/HTML/query)
8.  Manifest
9.  getHomeSections + getPrimaryCategories + getFilterConfig
10. getUrlList + getUrlSearch
11. parseListResponse + parseSearchResponse
12. getUrlDetail + parseMovieDetail
13. getStreamLink + parseDetailResponse + parseEmbedResponse
14. Custom-Js builders (YouTube/FB)
15. Helpers cuối (removeAccents, sleep, v.v.)
```

Giữ thứ tự này để khi có lỗi, biết ngay tìm ở section nào.

---

## 🎯 Bảng tra cứu nhanh

| Triệu chứng | Lỗi | Fix |
|---|---|---|
| Worker 403 quick-session | 1 | Bỏ Worker → httpRequest native |
| Log tag sai plugin | 2 | Cài lại đúng plugin |
| Không có parseListResponse trong log | 3 | Placeholder URL example.com |
| Có getUrlList, không có parse | 4 | Placeholder path gốc / không có path con |
| params={} rỗng | 5 | Query string thay pipe |
| HTTP 429 | 6 | Cache localStorage + cooldown |
| state keys không có movies | 7 | Fetch /api/movies riêng |
| _findMoviesInState is not defined | 8 | Define hàm trước khi gọi |
| Chỉ 20 phim, genre 0 items | 9 | Fetch nhiều page (15 page) |
| hasCatalogPass=false | 10 | Bỏ qua nếu API public |
| CustomJS SyntaxError | 11 | Không phải lỗi plugin mình |
| JSON parse lỗi unexpected < | 12 | Parser đa năng JSON+HTML |

---

## 📝 Log mẫu của plugin chạy THÀNH CÔNG

```text
[LangSon] getManifest called
[LangSon] getHomeSections called
[LangSon] bootstrap: RAM cache hit
[LangSon] getUrlList → https://example.com/?type=list&page=1&genre=
[LangSon] parseListResponse apiUrl=https://example.com/?type=list&page=1&genre=
[LangSon] params={"type":"list","page":"1","genre":""}
[LangSon] findMovies: langson_movies_v1 (string) count=300
[LangSon] buildList: total=300, genre=(all), q=(none)
[LangSon] buildList: after filter=300 → 20 items
[LangSon] parseListResponse: 20 items returned
[LangSon] getUrlDetail slug=phim-xxx
[LangSon] movie: no-cookie HTTP 200, bodyLen=832
[LangSon] getUrlDetail: OK 1 servers
[LangSon] getStreamLink: embed https://m.yout-ube.com/watch?v=xxx
```

Nếu log của bạn không giống mẫu trên → tra bảng phía trên để biết lỗi nào.

---

Chúc bạn code vui. Gặp lỗi mới → mở sổ này → tra theo triệu chứng → fix trong 5 phút.**
*/
var BASEURL = "https://danet.vn";
var API = BASEURL + "/api";
var DEVICE_ID = "vax-danet-avod";
var UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36";

function danetLog(message) {
  try { console.log("[DANET] " + message); } catch (e) {}
}

function getManifest() {
  return JSON.stringify({
    id: "danet",
    name: "DANET Phim",
    version: "1.0.0",
    author: "VAX",
    description: "Xem các phim miễn phí từ Danet",
    baseUrl: BASEURL,
    iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/danet.png",
    imageReferer: BASEURL + "/",
    isEnabled: true,
    isAdult: false,
    adblock: false,
    type: "MOVIE",
    layoutType: "HORIZONTAL",
    playerType: "auto",
    subtitleCat: false,
    debug: true
  });
}

function danetRequest(url, method, body) {
  if (typeof httpRequest !== "function") return "";
  try {
    var response = httpRequest(url, {
      method: method || "GET",
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Accept": "application/json, text/html, */*",
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Referer": BASEURL + "/avod",
        "x-device-id": DEVICE_ID,
        "x-device-model": "VAX Mobile",
        "x-device-os": "Android 13"
      }
    });
    if (!response || !response.isSuccessful) {
      danetLog("HTTP " + (response ? response.status : "none") + " " + url);
      return "";
    }
    return String(response.body || "");
  } catch (e) {
    danetLog("request failed " + (e && e.message ? e.message : e));
    return "";
  }
}

function danetJson(raw) {
  try { return JSON.parse(String(raw || "{}")); }
  catch (e) { return {}; }
}

function filtersPage(filtersJson) {
  try {
    var filters = typeof filtersJson === "string" ? JSON.parse(filtersJson || "{}") : (filtersJson || {});
    return Math.max(1, parseInt(filters.page, 10) || 1);
  } catch (e) {
    return 1;
  }
}

function isAvod(item) {
  if (!item) return false;
  if (item.is_playable === false) return false;
  var packages = item.movie_packages || item.packages || [];
  if (!packages.length) return !!item.uid;
  for (var i = 0; i < packages.length; i++) {
    if (String(packages[i] && packages[i].code || "").toLowerCase() === "avod") return true;
  }
  return false;
}

function mapMovie(item) {
  if (!item || !item.uid || item.is_playable === false) return null;
  var packages = item.movie_packages || item.packages;
  if (packages && packages.length && !isAvod(item)) return null;
  return {
    id: String(item.uid),
    title: item.title || item.title_en || "DANET",
    posterUrl: item.poster || "",
    backdropUrl: item.banner || item.poster || "",
    description: item.summary || item.story || "",
    year: item.release_year || "",
    quality: item.quality || "HD",
    episode_current: item.total_episodes ? String(item.total_episodes) + " tập" : "",
    lang: item.movie_language && item.movie_language.name || "Tiếng Việt",
    type: item.series_id ? "tv" : "movie"
  };
}

function queryValue(url, key, fallback) {
  var match = String(url || "").match(new RegExp("[?&]" + key + "=([^&]+)"));
  if (!match) return fallback;
  try { return decodeURIComponent(match[1]); } catch (e) { return match[1]; }
}

function parseApiMovieList(raw, url) {
  var data = danetJson(raw);
  var source = data.results || [];
  var items = [];
  for (var i = 0; i < source.length; i++) {
    var item = mapMovie(source[i]);
    if (item) items.push(item);
  }
  var page = parseInt(queryValue(url, "page", "1"), 10) || 1;
  var limit = parseInt(queryValue(url, "limit", "20"), 10) || 20;
  var found = parseInt(data.num_found, 10) || items.length;
  var pages = Math.max(page, Math.ceil(found / limit));
  danetLog("AVOD list page=" + page + " items=" + items.length + "/" + found);
  return JSON.stringify({
    items: items,
    pagination: { currentPage: page, totalPages: pages, totalItems: found, itemsPerPage: limit }
  });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "playlist:133", title: "Top 10 trong ngày", type: "Horizontal" },
    { slug: "playlist:84", title: "Mới nhất trên DANET", type: "Grid" },
    { slug: "playlist:16", title: "Drama hàng đầu", type: "Horizontal" },
    { slug: "playlist:49", title: "Anime mới nhất", type: "Horizontal" },
    { slug: "avod", title: "Tất cả phim miễn phí", type: "Grid" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Phim miễn phí AVOD", slug: "avod" },
    { name: "Top 10 trong ngày", slug: "playlist:133" },
    { name: "Mới nhất trên DANET", slug: "playlist:84" },
    { name: "Drama hàng đầu", slug: "playlist:16" },
    { name: "Anime mới nhất", slug: "playlist:49" },
    { name: "Phim thuyết minh Trung Quốc", slug: "playlist:26" },
    { name: "Anime thịnh hành", slug: "playlist:52" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({});
}

function getUrlList(slug, filtersJson) {
  var page = filtersPage(filtersJson);
  var value = String(slug || "avod");
  var limit = 20;
  if (value.indexOf("playlist:") === 0) {
    var playlistId = value.substring(8).replace(/[^0-9]/g, "");
    if (!playlistId) return "";
    return API + "/movie-playlists/" + playlistId + "/movies?module_id=2&limit=" + limit + "&page=" + page;
  }
  return API + "/movies?module_id=2&limit=" + limit + "&page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
  var page = filtersPage(filtersJson);
  return API + "/movies?module_id=2&limit=20&page=" + page + "&q=" + encodeURIComponent(String(keyword || "").slice(0, 100));
}

function getUrlDetail(id) {
  var value = String(id || "");
  if (/^https?:\/\//i.test(value)) return value;
  if (/^\d+$/.test(value)) return API + "/movies/" + value;
  return "";
}

function parseListResponse(raw, url) {
  return parseApiMovieList(raw, url);
}

function parseSearchResponse(raw, url) {
  return parseApiMovieList(raw, url);
}

function parseMovieDetail(raw, url, datasend) {
  var movie = danetJson(raw);
  var uid = String(movie.uid || (String(url || "").match(/\/movies\/(\d+)/) || [])[1] || (String(url || "").match(/\/movie-playlists\/\d+\/movies\/([^/?]+)/) || [])[1] || "");
  if (!uid || !isAvod(movie)) {
    danetLog("detail rejected: not AVOD or missing uid=" + uid);
    return JSON.stringify({ id: uid, title: movie.title || "DANET", servers: [{ name: "AVOD", episodes: [] }] });
  }

  var episodes = [];
  var episodeData = danetJson(danetRequest(API + "/movies/" + uid + "/episodes?limit=100&page=1"));
  var rows = episodeData.results || [];
  for (var i = 0; i < rows.length; i++) {
    var ep = rows[i];
    if (!ep || !ep.uid || ep.is_playable === false) continue;
    episodes.push({
      id: API + "/movies/" + uid + "/episodes/" + ep.uid + "/locations"
        + "|data:" + uid + ":" + ep.uid,
      name: ep.sequence ? "Tập " + ep.sequence + " - " + (ep.title || "") : (ep.title || "Tập " + (i + 1)),
      slug: "episode-" + ep.uid,
      thumb: ep.screenshot || ""
    });
  }

  return JSON.stringify({
    id: uid,
    title: movie.title || movie.title_en || uid,
    posterUrl: movie.poster || "",
    backdropUrl: movie.banner || movie.poster || "",
    description: movie.summary || movie.story || "",
    year: movie.release_year || "",
    quality: movie.quality || "HD",
    type: movie.series_id ? "tv" : "movie",
    episode_current: movie.total_episodes ? String(movie.total_episodes) + " tập" : "",
    servers: [{ name: "DANET AVOD", episodes: episodes }]
  });
}

function parseDetailResponse(raw, url, datasend) {
  var value = String(datasend || "");
  var result = danetJson(raw);
  if (result.statusCode !== 200) {
    danetLog("locations failed status=" + result.statusCode + " url=" + url);
    return JSON.stringify({ url: "", isEmbed: false, mimeType: "application/x-mpegURL", headers: {}, subtitles: [] });
  }
  var streams = result.streams || [];
  var stream = "";
  var fileType = "";
  for (var i = 0; i < streams.length; i++) {
    if (streams[i] && streams[i].file_location) {
      stream = streams[i].file_location;
      fileType = String(streams[i].file_type || "").toLowerCase();
      break;
    }
  }
  var subtitles = [];
  var tracks = result.subtitles || [];
  for (var j = 0; j < tracks.length; j++) {
    var track = tracks[j];
    if (!track) continue;
    var subUrl = track.file_location || track.url || track.src;
    if (subUrl) subtitles.push({ lang: track.language || track.lang || "Tiếng Việt", url: subUrl });
  }

  danetLog("stream=" + (stream ? "ok" : "empty") + " type=" + fileType + " subtitles=" + subtitles.length);
  return JSON.stringify({
    url: stream,
    isEmbed: false,
    mimeType: fileType === "mp4" ? "video/mp4" : "application/x-mpegURL",
    headers: { "User-Agent": UA, "Referer": BASEURL + "/avod" },
    subtitles: subtitles
  });
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }
function parseCategoriesResponse() { return "[]"; }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }
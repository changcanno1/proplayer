var SITE = "https://film4k.net";
var BASEURL = "https://film4k.net";
var API = SITE + "/api";
var UA = "Mozilla/5.0 (Linux; Android 13; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

var HEADERS = {
    "User-Agent": UA,
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
    "Referer": SITE + "/",
    "Origin": SITE
};

// token play-ticket (cache trong phiên)
var PT_TOKEN = "";
var PT_EXP = 0;

// ---------- Manifest ----------
function getManifest() {
    return JSON.stringify({
        "id": "film4k",
        "name": "Film4K",
        "version": "1.0",
        "author": "alokillgtv",
        "info": "Film4K — phim lẻ & phim bộ (API JSON, metadata tiếng Việt sẵn).",
        "baseUrl": SITE,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/film4k.png",
        "isEnabled": true,
        "isAdult": false,
        "adblock": false,
        "type": "MOVIE",
        "orientation": "auto",
        "subtitleCat": false,
        "debug": true,
        "playerType": "exoplayer"
    });
}

// ---------- Helpers ----------
function fix(u) {
    if (!u) return "";
    if (u.indexOf("//") === 0) return "https:" + u;
    if (u.indexOf("http") === 0) return u;
    if (u.indexOf("/") === 0) return SITE + u;
    return SITE + "/" + u;
}

function pad2(n) { n = parseInt(n, 10) || 0; return n < 10 ? "0" + n : String(n); }

// Base64 URL-safe: che các chuỗi "hls"/"m3u8" để app không tự phát thẳng
function encB64(s) {
    var str = String(s), out = "";
    try { if (typeof btoa !== "undefined") out = btoa(unescape(encodeURIComponent(str))); } catch (e) { out = ""; }
    if (!out) {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        for (var block, charCode, idx = 0, map = chars;
            str.charAt(idx | 0) || (map = "=", idx % 1);
            out += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
            charCode = str.charCodeAt(idx += 3 / 4);
            block = block << 8 | charCode;
        }
    }
    return out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decB64(s) {
    s = String(s).replace(/-/g, "+").replace(/_/g, "/");
    try { if (typeof atob !== "undefined") return decodeURIComponent(escape(atob(s))); } catch (e) {}
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    s = s.replace(/=+$/, "");
    for (var bc = 0, bs, buffer, idx = 0;
        buffer = s.charAt(idx++);
        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) { buffer = chars.indexOf(buffer); }
    return output;
}

function req(url, method, headers) {
    var h = {};
    for (var k in HEADERS) h[k] = HEADERS[k];
    if (headers) for (var k2 in headers) h[k2] = headers[k2];
    var res = httpRequest(url, { method: method || "GET", headers: h });
    return res && res.body ? String(res.body) : "";
}

function getJSON(url) {
    try { return JSON.parse(req(url)); } catch (e) { log("getJSON err " + url + ": " + e); return null; }
}

function getTicket() {
    if (PT_TOKEN) return PT_TOKEN;
    var hdr = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Referer": SITE + "/",
        "Origin": SITE
    };
    // Thử lần lượt: POST có body {}/rỗng, rồi GET dự phòng
    var tries = [
        { method: "POST", headers: hdr, body: "{}" },
        { method: "POST", headers: hdr, body: "" },
        { method: "GET", headers: { "Accept": "application/json", "User-Agent": UA, "Referer": SITE + "/", "Origin": SITE } }
    ];
    for (var i = 0; i < tries.length; i++) {
        try {
            var r = httpRequest(API + "/play-ticket", tries[i]);
            var body = (r && r.body) ? String(r.body) : "";
            log("ticket raw[" + i + "]: " + body.substring(0, 120));
            var j = JSON.parse(body);
            if (j && j.token) { PT_TOKEN = j.token; return PT_TOKEN; }
        } catch (e) { log("getTicket try[" + i + "] err: " + e); }
    }
    return PT_TOKEN;
}

// ---------- Categories / Sections ----------
function catelist() {
    var items = [
        { id: "/home",  title: "Mới cập nhật", quality: "", episode_current: "Thể loại", posterUrl: "", backdropUrl: "", isFolder: true, year: "", lang: "" },
        { id: "/movie", title: "Phim lẻ",       quality: "", episode_current: "Thể loại", posterUrl: "", backdropUrl: "", isFolder: true, year: "", lang: "" },
        { id: "/tv",    title: "Phim bộ",       quality: "", episode_current: "Thể loại", posterUrl: "", backdropUrl: "", isFolder: true, year: "", lang: "" }
    ];
    return JSON.stringify(items);
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/movie", "title": "Phim lẻ",       "type": "Horizontal" },
        { "slug": "/tv",    "title": "Phim bộ",       "type": "Horizontal" },
        { "slug": "/home",  "title": "Mới cập nhật",        "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    try { return JSON.stringify(buildMenu(getLISTmenu())); }
    catch (e) { return JSON.stringify([]); }
}

function getFilterConfig() {
    try {
        return JSON.stringify({ category: buildMenu(getLISTmenu(), "filter") });
    } catch (e) { return JSON.stringify({ category: [] }); }
}

function getLISTmenu() {
    try{
      return `[{
    "link": "/?browse=1",
    "name": "Tất cả"
}, {
    "link": "/?browse=1",
    "name": "Action & Adventure"
}, {
    "link": "/?genre=Ch%C6%B0%C6%A1ng+Tr%C3%ACnh+Truy%E1%BB%81n+H%C3%ACnh&browse=1",
    "name": "Chương Trình Truyền Hình"
}, {
    "link": "/?genre=Kids&browse=1",
    "name": "Kids"
}, {
    "link": "/?genre=Phim+B%C3%AD+%E1%BA%A8n&browse=1",
    "name": "Phim Bí Ẩn"
}, {
    "link": "/?genre=Phim+Chi%E1%BA%BFn+Tranh&browse=1",
    "name": "Phim Chiến Tranh"
}, {
    "link": "/?genre=Phim+Ch%C3%ADnh+K%E1%BB%8Bch&browse=1",
    "name": "Phim Chính Kịch"
}, {
    "link": "/?genre=Phim+Gia+%C4%90%C3%ACnh&browse=1",
    "name": "Phim Gia Đình"
}, {
    "link": "/?genre=Phim+Gi%E1%BA%A3+T%C6%B0%E1%BB%A3ng&browse=1",
    "name": "Phim Giả Tượng"
}, {
    "link": "/?genre=Phim+G%C3%A2y+C%E1%BA%A5n&browse=1",
    "name": "Phim Gây Cấn"
}, {
    "link": "/?genre=Phim+Ho%E1%BA%A1t+H%C3%ACnh&browse=1",
    "name": "Phim Hoạt Hình"
}, {
    "link": "/?genre=Phim+H%C3%A0i&browse=1",
    "name": "Phim Hài"
}, {
    "link": "/?genre=Phim+H%C3%A0nh+%C4%90%E1%BB%99ng&browse=1",
    "name": "Phim Hành Động"
}, {
    "link": "/?genre=Phim+H%C3%ACnh+S%E1%BB%B1&browse=1",
    "name": "Phim Hình Sự"
}, {
    "link": "/?genre=Phim+Khoa+H%E1%BB%8Dc+Vi%E1%BB%85n+T%C6%B0%E1%BB%9Fng&browse=1",
    "name": "Phim Khoa Học Viễn Tưởng"
}, {
    "link": "/?genre=Phim+Kinh+D%E1%BB%8B&browse=1",
    "name": "Phim Kinh Dị"
}, {
    "link": "/?genre=Phim+L%C3%A3ng+M%E1%BA%A1n&browse=1",
    "name": "Phim Lãng Mạn"
}, {
    "link": "/?genre=Phim+L%E1%BB%8Bch+S%E1%BB%AD&browse=1",
    "name": "Phim Lịch Sử"
}, {
    "link": "/?genre=Phim+Mi%E1%BB%81n+T%C3%A2y&browse=1",
    "name": "Phim Miền Tây"
}, {
    "link": "/?genre=Phim+Nh%E1%BA%A1c&browse=1",
    "name": "Phim Nhạc"
}, {
    "link": "/?genre=Phim+Phi%C3%AAu+L%C6%B0u&browse=1",
    "name": "Phim Phiêu Lưu"
}, {
    "link": "/?genre=Phim+T%C3%A0i+Li%E1%BB%87u&browse=1",
    "name": "Phim Tài Liệu"
}, {
    "link": "/?genre=Reality&browse=1",
    "name": "Reality"
}, {
    "link": "/?genre=Sci-Fi+%26+Fantasy&browse=1",
    "name": "Sci-Fi & Fantasy"
}, {
    "link": "/?genre=Soap&browse=1",
    "name": "Soap"
}, {
    "link": "/?genre=Talk&browse=1",
    "name": "Talk"
}, {
    "link": "/?genre=War+%26+Politics&browse=1",
    "name": "War & Politics"
}]`;
    } catch(e){
      log("getLISTmenu[err]:\n " + e);
      return `[
        {"link":"/","name":"Đang lỗi getLISTmenu()"},
      ]`;
    }
  }

// ---------- Build list URL ----------
function getUrlList(slug, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var f = JSON.parse(filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'));
            page = parseInt(f.page) || 1;
            if (f.category) {
                if (Array.isArray(f.category) && f.category.length > 0) slug = f.category[0].slug;
                else if (typeof f.category === "string") slug = f.category;
            }
        } catch (e) {}
    }

    var s = slug || "/home";
    if (s.indexOf("/") !== 0) s = "/" + s;

    var url = API + "/home";
    var parts = [];

    /* ⭐ V2: Xử lý slug dạng "/?..." từ menu category */
    if (s.indexOf("/?") === 0) {
        var qs = s.substring(2);
        if (qs) parts.push(qs);
    }
    else if (s.indexOf("/genre/") === 0) {
        var genre = s.substring(7);
        if (genre) parts.push("genre=" + encodeURIComponent(decodeURIComponent(genre)));
    }
    else if (s === "/movie") {
        parts.push("type=movie");
    } else if (s === "/tv") {
        parts.push("type=tv");
    }

    if (page > 1) parts.push("page=" + page);
    if (parts.length) url += "?" + parts.join("&");

    log("[getUrlList-V2] slug=\"" + s + "\" → " + url);
    return url;
}

// ---------- Parse list ----------
function itemToCard(it) {
    var title = (it.title && (it.title.vi || it.title.en)) || "";
    var poster = (it.poster && (it.poster.vi || it.poster.en)) || it.backdrop || "";
    var isTv = it.mediaType === "tv";
    return {
        "id": SITE + "/api/title/" + it.slug,
        "title": title,
        "quality": it.maxRes || (it.epTotal ? (it.epTotal + " tập") : ""),
        "episode_current": isTv ? "Playlist" : "Video",
        "posterUrl": poster,
        "backdropUrl": it.backdrop || poster,
        "year": it.year ? String(it.year) : "",
        "lang": (it.country && (it.country.vi || it.country.en)) || ""
    };
}

function parseListResponse(html, url) {
    try {
        var j = JSON.parse(html);
        var list = (j && j.list) ? j.list : [];
        var items = [];
        for (var i = 0; i < list.length; i++) items.push(itemToCard(list[i]));
        var total = j && j.total ? j.total : items.length;
        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": (j && j.page) || 1, "totalPages": Math.max(1, Math.ceil(total / 60)) }
        });
    } catch (e) {
        log("parseListResponse[err]: " + e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

// ---------- Detail ----------
function getUrlDetail(slug, datasend) {
    if (slug && slug.indexOf("http") === 0) {
        var i = slug.indexOf("|data:");
        return i !== -1 ? slug.slice(0, i) : slug;
    }
    return "";
}

function parseMovieDetail(html, url) {
    try {
        var j = JSON.parse(html);
        var m = j.movie || {};
        var title = (m.title && (m.title.vi || m.title.en)) || "";
        var description = (m.overview && (m.overview.vi || m.overview.en)) || "";
        var poster = (m.poster && (m.poster.vi || m.poster.en)) || m.backdrop || "";
        var eps = j.episodes || [];

        var epItems = [];
        var multiSeason = false;
        for (var s = 0; s < eps.length; s++) if ((eps[s].season || 1) > 1) multiSeason = true;

        for (var k = 0; k < eps.length; k++) {
            var e = eps[k];
            var src = (e.sources && e.sources[0] && e.sources[0].url) ? e.sources[0].url : "";
            if (!src) continue;
            var name;
            if (eps.length > 1) name = multiSeason ? ("S" + pad2(e.season) + "E" + pad2(e.episode)) : ("Tập " + e.episode);
            else name = "Xem Ngay";
            var link = "https://example.com?url=" + encB64(src) + "&server=1";
            epItems.push({ id: link, name: name, slug: "tap-" + (k + 1), ids: [{ name: "Server 1", url: link }] });
        }

        // fallback: movie.hlsUrl (nếu có)
        if (!epItems.length && m.hlsUrl) {
            var link2 = "https://example.com?url=" + encB64(m.hlsUrl) + "&server=1";
            epItems.push({ id: link2, name: "Xem Ngay", slug: "tap-1", ids: [{ name: "Server 1", url: link2 }] });
        }

        return JSON.stringify({
            id: url,
            title: title,
            originName: (m.title && m.title.en) || "",
            posterUrl: poster,
            backdropUrl: m.backdrop || poster,
            description: description,
            quality: m.maxRes || "",
            year: m.year ? String(m.year) : "",
            rating: m.score ? String(m.score) : "",
            status: m.epTotal ? (m.epTotal + " tập") : "",
            category: (m.genres && m.genres.vi) ? m.genres.vi.join(", ") : "",
            episode_current: "",
            servers: [{ name: "Server", episodes: epItems }],
            duration: "",
            casts: "",
            director: "",
            country: (m.country && m.country.vi) || "",
            lang: "",
            extra: ""
        });
    } catch (e) {
        log("parseMovieDetail[err]: " + e);
        return JSON.stringify({ id: url, title: "Lỗi", description: String(e), servers: [] });
    }
}

// ---------- Stream ----------
function parseDetailResponse(html, url) {
    try {
        var m = url.match(/[?&]url=([^&]+)/);
        if (!m) throw new Error("Thiếu url");
        var hlsPath = decB64(m[1]);
        if (!hlsPath) throw new Error("Decode rỗng");
        var stream = fix(hlsPath);
        var token = getTicket();
        log("[film4k] play " + stream + " (ticket=" + (token ? "ok" : "none") + ")");

        return JSON.stringify({
            url: stream,
            mimeType: "application/x-mpegURL",
            isEmbed: false,
            headers: {
                "User-Agent": UA,
                "Referer": SITE + "/",
                "Origin": SITE,
                "X-F4K-PT": token
            },
            subtitles: []
        });
    } catch (e) {
        log("parseDetailResponse[err]: " + e);
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}

// ---------- Search ----------
function getUrlSearch(keyword, filtersJson) {
    return API + "/search/suggest?q=" + encodeURIComponent(keyword);
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

// ---------- Stubs ----------
function getUrlCategories() { 
      try {
          log("getUrlCategories[url]: \n" + BASEURL);
          return "https://example.com"; 
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
  function parseCountriesResponse(html) {
      try {
          return "[]";
      } catch (e) {
          log("parseCountriesResponse[err]:\n " + e);
          return "[]";
      }
  }
  function parseYearsResponse(html) {
      try {
          return "[]";
      } catch (e) {
          log("parseYearsResponse[err]:\n " + e);
          return "[]";
      }
  }
  function parseSearchResponse(html, url) {
      try {
          log("parseSearchResponse[url]: \n" + url);
          return parseListResponse(html, url);
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
  // Tạo thẻ chủ đè ở menu home lấy dữ liệu ben dưới
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
  // Tạo thẻ chủ đề filter..
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
  // Hàm chuyển đổi text html %20 sang text thuần
  function buildMenu(menuStr, type) { 
      var menuArray = JSON.parse(menuStr); 
      let menulist = []; 
      if (!menuArray || !Array.isArray(menuArray)) return menulist; 
      var typeStr = type !== undefined ? String(type).trim() : undefined; 
      for (var i = 0; i < menuArray.length; i++) { 
          var item = menuArray[i]; 
          if (!item) continue; 
          var link = item.link ? String(item.link).trim() : ""; 
          var name = item.name ? String(item.name).trim() : ""; 
          if (!link || !name) continue; 
          var menuItem = {}; 
          if (typeStr === "false") { 
              menuItem = { "slug": link, "title": name, "type": "Horizontal" }; 
          } else if (typeStr === "true") { 
              menuItem = { "slug": link, "title": name, "type": "Grid" }; 
          } else { 
              menuItem = { "slug": link, "name": name }; 
          } 
          menulist.push(menuItem); 
      } 
      return menulist; 
  }

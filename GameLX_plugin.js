/* VAX GAME - plugin native WebView (Tối ưu tải 10 game trang chủ & Hỗ trợ Google OAuth) */
var GAME_LIST_URL = "https://raw.githubusercontent.com/changcanno1/proplayer/refs/heads/main/list.txt";
var GAME_CACHE = [];

function getPipeData(raw) {
    if (!raw) return "";
    var i = String(raw).indexOf("|");
    if (i < 0) return "";
    var s = String(raw).substring(i + 1).replace(/^\s+/, "");
    if (s.toLowerCase().indexOf("data:") === 0) s = s.substring(5);
    return s;
}

function getManifest() {
    return JSON.stringify({
        id: "game",
        name: "GAME [LX]",
        version: "1.0.2",
        baseUrl: GAME_LIST_URL,
        iconUrl: "https://vaxplugin.alokillgtv02.workers.dev/img/icon/vaxgame.png",
        isEnabled: true,
        isAdult: false,
        adblock: false,
        type: "VIDEO",
        layoutType: "HORIZONTAL",
        playerType: "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "Game Tiếng Việt", title: "Game Tiếng Việt", type: "Horizontal" },
        { slug: "Chơi Online", title: "Chơi Online", type: "Horizontal" },
        { slug: "Hành Động", title: "Hành Động", type: "Horizontal" },
        { slug: "Chiến Thuật", title: "Chiến Thuật", type: "Horizontal" },
        { slug: "Giải Đố", title: "Giải Đố", type: "Horizontal" },
        { slug: "Thể Thao", title: "Thể Thao", type: "Horizontal" },
        { slug: "Bắn Súng", title: "Bắn Súng", type: "Horizontal" },
        { slug: "Trí Tuệ", title: "Trí Tuệ", type: "Horizontal" },
        { slug: "Bài Bạc", title: "Bài Bạc", type: "Horizontal" },
        { slug: "Chơi Cờ", title: "Chơi Cờ", type: "Horizontal" },
        { slug: "Giải Trí", title: "Giải Trí", type: "Horizontal" },
        { slug: "Mô Phỏng", title: "Mô Phỏng", type: "Horizontal" }
    ]);
}

function getLISTmenu() {
    try {
        return `[
            { "link": "Game Tiếng Việt", "name": "Game Tiếng Việt"},
            { "link": "Chơi Online", "name": "Chơi Online"},
            { "link": "Hành Động", "name": "Hành Động"},
            { "link": "Chiến Thuật", "name": "Chiến Thuật"},
            { "link": "Giải Đố", "name": "Giải Đố"},
            { "link": "Thể Thao", "name": "Thể Thao"},
            { "link": "Bắn Súng", "name": "Bắn Súng"},
            { "link": "Trí Tuệ", "name": "Trí Tuệ"},
            { "link": "Bài Bạc", "name": "Bài Bạc"},
            { "link": "Chơi Cờ", "name": "Chơi Cờ"},
            { "link": "Giải Trí", "name": "Giải Trí"},
            { "link": "Mô Phỏng", "name": "Mô Phỏng"}
        ]`;
    } catch (e) {
        return `[{"link":"/","name":"Đang lỗi getLISTmenu()"}]`;
    }
}

function getPrimaryCategories() {
    try { return JSON.stringify(JSON.parse(getLISTmenu())); }
    catch (e) { return JSON.stringify([]); }
}

function getFilterConfig() {
    try { return JSON.stringify({ category: JSON.parse(getLISTmenu()) }); }
    catch (e) { return JSON.stringify({ category: [] }); }
}

function getUrlList(slug, filtersJson) {
    var category = String(slug || "all");
    var page = 1;
    if (filtersJson) {
        try {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            var f = JSON.parse(fixedJson);
            page = parseInt(f.page) || 1;
            if (f.category) {
                if (Array.isArray(f.category) && f.category.length > 0) {
                    category = f.category[0].slug || category;
                } else if (typeof f.category === "string") {
                    category = f.category;
                }
            }
        } catch (e) {}
    }
    var payload = "page=" + page + (category !== "all" ? "&category=" + encodeURIComponent(category) : "");
    return GAME_LIST_URL + "|data:" + payload;
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            var f = JSON.parse(fixedJson);
            page = parseInt(f.page) || 1;
        } catch (e) {}
    }
    var payload = "page=" + page + "&q=" + encodeURIComponent(keyword || "");
    return GAME_LIST_URL + "|data:" + payload;
}

function getUrlDetail(slug, datasend) {
    var cleanUrl = String(slug || "").split("|")[0];
    var data = datasend || getPipeData(slug);
    return data ? (cleanUrl + "|data:" + data) : cleanUrl;
}

function parseGames(raw) {
    try {
        var data = JSON.parse(String(raw || ""));
        return Array.isArray(data) ? data : (data.games || data.items || data.list || []);
    } catch (e) { return []; }
}

function cleanGame(game) {
    if (!game || !game.name || !game.url) return null;
    var cleanUrl = String(game.url).split("|")[0];
    var meta = encodeURIComponent(JSON.stringify({
        title: String(game.name),
        posterUrl: String(game.image || ""),
        description: String(game.desc || "")
    }));
    return {
        id: cleanUrl + "|data:" + meta,
        title: String(game.name),
        originName: String(game.category || game.tag || ""),
        posterUrl: String(game.image || ""),
        backdropUrl: String(game.image || ""),
        description: String(game.desc || ""),
        quality: String(game.category || "GAME"),
        lang: "HTML5",
        category: String(game.category || game.tag || ""),
        url: cleanUrl,
        datasend: meta
    };
}

function filterGames(raw, category) {
    var games = parseGames(raw);
    var out = [];
    GAME_CACHE = [];
    for (var i = 0; i < games.length; i++) {
        if (category && String(games[i].category || games[i].tag || "") !== category) continue;
        var item = cleanGame(games[i]);
        if (item) {
            out.push(item);
            GAME_CACHE.push(item);
        }
    }
    return out;
}

function parseListResponse(raw, apiUrl, datasend) {
    var dataStr = String(datasend || getPipeData(apiUrl) || "");
    var catMatch = dataStr.match(/(?:^|&)category=([^&]+)/i) || String(apiUrl || "").match(/[?&]category=([^&|]+)/i);
    var category = catMatch ? decodeURIComponent(catMatch[1]) : "";

    var allItems = filterGames(raw, category);

    var page = 1;
    var pageMatch = dataStr.match(/(?:^|&)page=(\d+)/i);
    if (pageMatch) {
        page = parseInt(pageMatch[1], 10) || 1;
    }

    var pageSize = page > 1 ? 20 : 10;
    var totalItems = allItems.length;
    var totalPages = Math.ceil(totalItems / pageSize) || 1;
    var startIndex = (page - 1) * pageSize;
    var pagedItems = allItems.slice(startIndex, startIndex + pageSize);

    return JSON.stringify({
        items: pagedItems,
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: pageSize
        }
    });
}

function parseSearchResponse(raw, apiUrl, datasend) {
    var dataStr = String(datasend || getPipeData(apiUrl) || "");
    var all = filterGames(raw, "");

    var qMatch = dataStr.match(/(?:^|&)q=([^&]+)/i) || String(apiUrl || "").match(/[?&]q=([^&|]+)/i);
    var q = qMatch ? decodeURIComponent(qMatch[1]).toLowerCase() : "";
    if (q) {
        all = all.filter(function (g) {
            return (g.title + " " + g.description + " " + g.category).toLowerCase().indexOf(q) >= 0;
        });
    }

    var page = 1;
    var pageMatch = dataStr.match(/(?:^|&)page=(\d+)/i);
    if (pageMatch) {
        page = parseInt(pageMatch[1], 10) || 1;
    }

    var pageSize = 20;
    var totalPages = Math.ceil(all.length / pageSize) || 1;
    var pagedItems = all.slice((page - 1) * pageSize, page * pageSize);

    return JSON.stringify({
        items: pagedItems,
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: all.length,
            itemsPerPage: pageSize
        }
    });
}

function parseMovieDetail(html, apiUrl, datasend) {
    var cleanUrl = String(apiUrl || "").split("|")[0];
    var data = datasend || getPipeData(apiUrl);
    var found = null;

    if (data) {
        try { found = JSON.parse(decodeURIComponent(data)); } catch (e) {}
    }
    if (!found) {
        for (var i = 0; i < GAME_CACHE.length; i++) {
            if (GAME_CACHE[i].url === cleanUrl) {
                found = GAME_CACHE[i];
                break;
            }
        }
    }

    var epId = data ? (cleanUrl + "|data:" + data) : cleanUrl;
    return JSON.stringify({
        id: cleanUrl,
        title: found ? found.title : "VAX GAME",
        posterUrl: found ? found.posterUrl : "",
        backdropUrl: found ? found.posterUrl : "",
        description: found ? found.description : "",
        servers: [{ name: "WebView", episodes: [{ id: epId, name: "Chơi ngay", slug: "play-1" }] }]
    });
}

function getJS(apiUrl) {
    if (String(apiUrl || "").indexOf("crazygames.com") > -1) {
        return crazyJS();
    }
    return "";
}

function crazyJS() {
    return `
(function () {
  'use strict';
  if (window.__GLS_INIT) { return; }
  window.__GLS_INIT = true;

  var STYLE_ID = '__gls_loader_style';
  var IFRAME_SEL = 'iframe#game-iframe, iframe.GameContainerMobile_gameIframe__kYvt0, iframe.bs-GameContainer--game';
  var AUTO_HIDE_MS = 3000;

  var LOADER_CSS = ''
    + 'html::before{content:"ĐANG TẢI GAME";'
    + 'white-space:pre-wrap;position:fixed;top:0;left:0;right:0;bottom:0;'
    + 'text-align:center;padding-top:40vh;box-sizing:border-box;'
    + 'background:#0f0f14;color:#fff;'
    + 'font:700 22px/1.7 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;'
    + 'z-index:2147483647;pointer-events:auto;}'
    + 'html::after{content:"";position:fixed;top:62%;left:50%;'
    + 'width:46px;height:46px;margin:-23px 0 0 -23px;'
    + 'border:4px solid rgba(255,255,255,.15);border-top-color:#9b6dff;border-radius:50%;'
    + 'animation:__gls_spin .85s linear infinite;z-index:2147483647;pointer-events:auto;}'
    + '@keyframes __gls_spin{to{transform:rotate(360deg)}}';

  function injectLoaderStyle() {
    if (document.getElementById(STYLE_ID)) { return true; }
    var parent = document.head || document.documentElement;
    if (!parent) { return false; }
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = LOADER_CSS;
    parent.appendChild(s);
    return true;
  }

  if (!injectLoaderStyle()) {
    document.addEventListener('DOMContentLoaded', function () {
      injectLoaderStyle();
    }, { once: true });
  }

  var hidden = false;
  function hideLoader() {
    if (hidden) return;
    hidden = true;
    try {
      var s = document.getElementById(STYLE_ID);
      if (s && s.parentNode) { s.parentNode.removeChild(s); }
    } catch (e) {}
  }

  var autoHideTimer = setTimeout(function () { hideLoader(); }, AUTO_HIDE_MS);

  var swapped = false;
  var watching = false;
  var mo = null, pollId = 0;
  function findIframe() { try { return document.querySelector(IFRAME_SEL); } catch (e) { return null; } }

  function stopWatching() {
    if (mo) { try { mo.disconnect(); } catch (e) {} mo = null; }
    if (pollId) { clearInterval(pollId); pollId = 0; }
    watching = false;
  }

  function doSwap(iframe) {
    if (swapped || !iframe) return;
    swapped = true;
    stopWatching();
    clearTimeout(autoHideTimer);
    hideLoader();

    // Phóng to iframe đè lên trên nhưng GIỮ NGUYÊN DOM và SDK để Google OAuth postMessage/popup hoạt động
    try {
      iframe.style.cssText = 'position:fixed !important;top:0 !important;left:0 !important;'
        + 'width:100vw !important;height:100vh !important;border:0 !important;'
        + 'margin:0 !important;padding:0 !important;z-index:2147483640 !important;background:#000 !important;';

      var d = document.documentElement.style;
      d.margin='0'; d.padding='0'; d.overflow='hidden'; d.width='100%'; d.height='100%';
      if (document.body) {
        var b = document.body.style;
        b.margin='0'; b.padding='0'; b.overflow='hidden'; b.width='100%'; b.height='100%';
      }
    } catch (e) {}
  }

  function startWatching() {
    if (watching || swapped) return;
    watching = true;

    var f = findIframe();
    if (f) { doSwap(f); return; }

    try {
      mo = new MutationObserver(function () {
        var el = findIframe();
        if (el) doSwap(el);
      });
      mo.observe(document.documentElement || document, { childList: true, subtree: true });
    } catch (e) {}

    pollId = setInterval(function () {
      var el = findIframe();
      if (el) doSwap(el);
    }, 300);
  }

  if (document.documentElement) { startWatching(); }
  else {
    document.addEventListener('DOMContentLoaded', function () {
      startWatching();
    }, { once: true });
  }
})();
    `;
}

function parseDetailResponse(html, apiUrl, datasend) {
    var cleanUrl = String(apiUrl || "").split("|")[0];
    var rawJS = getJS(cleanUrl);
    var referer = cleanUrl.indexOf("crazygames.com") > -1
        ? "https://www.crazygames.com/"
        : "https://vaxplugins.alokillgtv05.workers.dev/";

    return JSON.stringify({
        url: cleanUrl,
        isEmbed: false,
        orientation: "auto",
        headers: {
            "Referer": referer,
            "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
            "Sniffer": false,
            "Block-AutoClick": "false",
            "Block-Redirects": "false",
            "Block-Ads": "false",
            "Block-Css": "",
            "Custom-Js": rawJS
        },
        subtitles: []
    });
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }
function parseCategoriesResponse() { return "[]"; }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

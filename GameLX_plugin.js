/* VAX GAME - plugin native WebView (Tối ưu tải 10 game trang chủ) */
var GAME_LIST_URL = "https://raw.githubusercontent.com/changcanno1/proplayer/refs/heads/main/list.txt";
var GAME_CACHE = [];

function getManifest() {
    return JSON.stringify({
        id: "game",
        name: "GAME [LX]",
        version: "1.0.1",
        BASEURL: GAME_LIST_URL,
        iconUrl: "https://vaxplugin.alokillgtv02.workers.dev/img/icon/vaxgame.png",
        isEnabled: true,
        isAdult: false,
        type: "VIDEO",
        layoutType: "Horizontal",
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
    } catch(e) {
        return `[{"link":"/","name":"Đang lỗi getLISTmenu()"}]`;
    }
}

function getPrimaryCategories() {
    try { return JSON.stringify(JSON.parse(getLISTmenu())); }
    catch (e) { return JSON.stringify([]); }
}

function getUrlList(slug, filtersJson) {
    var category = String(slug || "all");
    var page = 1;
    if (filtersJson) {
        try {
            var f = JSON.parse(filtersJson);
            page = parseInt(f.page) || 1;
        } catch (e) {}
    }
    // Gắn |data:page=... để parseListResponse biết trang hiện tại mà không gửi rác lên server
    var url = GAME_LIST_URL + (category !== "all" ? "?category=" + encodeURIComponent(category) : "");
    return url + "|data:page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var f = JSON.parse(filtersJson);
            page = parseInt(f.page) || 1;
        } catch (e) {}
    }
    return GAME_LIST_URL + "?q=" + encodeURIComponent(keyword || "") + "|data:page=" + page;
}

function getUrlDetail(slug) {
    return String(slug || "");
}

function parseGames(raw) {
    try {
        var data = JSON.parse(String(raw || ""));
        return Array.isArray(data) ? data : (data.games || data.items || data.list || []);
    } catch (e) { return []; }
}

function cleanGame(game) {
    if (!game || !game.name || !game.url) return null;
    return {
        id: String(game.url),
        title: String(game.name),
        originName: String(game.category || game.tag || ""),
        posterUrl: String(game.image || ""),
        backdropUrl: String(game.image || ""),
        description: String(game.desc || ""),
        quality: String(game.category || "GAME"),
        lang: "HTML5",
        category: String(game.category || game.tag || ""),
        url: String(game.url)
    };
}

function filterGames(raw, apiUrl) {
    var games = parseGames(raw);
    var query = String(apiUrl || "");
    var match = query.match(/[?&]category=([^&|]+)/i);
    var category = match ? decodeURIComponent(match[1]) : "";
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
    var allItems = filterGames(raw, apiUrl);
    
    // Đọc số trang từ datasend hoặc apiUrl
    var page = 1;
    var dataStr = String(datasend || "");
    if (!dataStr && apiUrl && apiUrl.indexOf("|") > -1) {
        dataStr = apiUrl.substring(apiUrl.indexOf("|") + 1);
    }
    var pageMatch = dataStr.match(/page=(\d+)/i);
    if (pageMatch) {
        page = parseInt(pageMatch[1], 10) || 1;
    }

    var pageSize = 10; // Trang chủ chỉ load 10 game đầu cho nhẹ
    if (page > 1) {
        pageSize = 20; // Khi vào Xem Thêm (Category) tải 20 game mỗi trang
    }

    var totalItems = allItems.length;
    var totalPages = Math.ceil(totalItems / pageSize) || 1;
    
    // Cắt lát danh sách game theo trang
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
    var all = filterGames(raw, apiUrl);
    var q = ((String(apiUrl || "").match(/[?&]q=([^&|]+)/i) || [])[1] || "");
    q = decodeURIComponent(q).toLowerCase();
    if (q) {
        all = all.filter(function (g) {
            return (g.title + " " + g.description + " " + g.category).toLowerCase().indexOf(q) >= 0;
        });
    }

    var page = 1;
    var dataStr = String(datasend || "");
    if (!dataStr && apiUrl && apiUrl.indexOf("|") > -1) {
        dataStr = apiUrl.substring(apiUrl.indexOf("|") + 1);
    }
    var pageMatch = dataStr.match(/page=(\d+)/i);
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

function parseMovieDetail(html, apiUrl) {
    var url = String(apiUrl || "");
    var found = null;
    for (var i = 0; i < GAME_CACHE.length; i++) {
        if (GAME_CACHE[i].url === url) {
            found = GAME_CACHE[i];
            break;
        }
    }
    return JSON.stringify({
        id: url,
        title: found ? found.title : "VAX GAME",
        posterUrl: found ? found.posterUrl : "",
        backdropUrl: found ? found.backdropUrl : "",
        description: found ? found.description : "",
        servers: [{ name: "WebView", episodes: [{ id: url, name: "Chơi ngay", slug: url }] }]
    });
}

function getJS(apiUrl){
    if (apiUrl.indexOf("https://www.crazygames.com") > -1){
        return crazyJS();
    }
}

function crazyJS(){
    return `
(function () {
  'use strict';
  if (window.__GLS_INIT) { return; }
  window.__GLS_INIT = true;

  var TAG = '[GLS]';
  var STYLE_ID = '__gls_loader_style';
  var ROOT_ID = '__gls_iframe_root';
  var IFRAME_SEL = 'iframe#game-iframe, iframe.GameContainerMobile_gameIframe__kYvt0, iframe.bs-GameContainer--game';
  var AUTO_HIDE_MS = 3000;

  function log() { try { var a=[].slice.call(arguments); a.unshift(TAG); console.log.apply(console,a); } catch(e){} }
  function warn() { try { var a=[].slice.call(arguments); a.unshift(TAG); console.warn.apply(console,a); } catch(e){} }
  function error() { try { var a=[].slice.call(arguments); a.unshift(TAG); console.error.apply(console,a); } catch(e){} }

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
  function hideLoader(reason) {
    if (hidden) return;
    hidden = true;
    try {
      var s = document.getElementById(STYLE_ID);
      if (s && s.parentNode) { s.parentNode.removeChild(s); }
    } catch (e) {}
  }

  var autoHideTimer = setTimeout(function () { hideLoader('auto-30s'); }, AUTO_HIDE_MS);

  var swapped = false;
  var watching = false;
  var mo = null, pollId = 0, heartbeatId = 0;
  function findIframe() { try { return document.querySelector(IFRAME_SEL); } catch (e) { return null; } }

  function stopWatching() {
    if (mo) { try { mo.disconnect(); } catch (e) {} mo = null; }
    if (pollId) { clearInterval(pollId); pollId = 0; }
    if (heartbeatId) { clearInterval(heartbeatId); heartbeatId = 0; }
    watching = false;
  }

  function doSwap(iframe) {
    if (swapped || !iframe) return;
    swapped = true;
    stopWatching();
    clearTimeout(autoHideTimer);

    try { hideLoader('swap-pre-hide'); } catch (e) {}

    var root = null;
    try {
      root = document.getElementById(ROOT_ID);
      if (!root) {
        root = document.createElement('div');
        root.id = ROOT_ID;
        root.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;'
          + 'width:100vw;height:100vh;margin:0;padding:0;border:0;'
          + 'background:#000;z-index:2147483646;overflow:hidden;';
        document.documentElement.appendChild(root);
      }
    } catch (e) {}

    if (root) {
      try {
        root.appendChild(iframe);
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;'
          + 'border:0;margin:0;padding:0;display:block;';
      } catch (e) {}
    }

    try {
      if (document.body) { document.body.innerHTML = ''; }
    } catch (e) {}

    try {
      var head = document.head;
      if (head) {
        var scripts = head.querySelectorAll('script');
        for (var i = 0; i < scripts.length; i++) {
          try { var sc = scripts[i]; if (sc.parentNode) sc.parentNode.removeChild(sc); } catch (e2) {}
        }
      }
    } catch (e) {}

    try {
      var d = document.documentElement.style;
      d.margin='0'; d.padding='0'; d.overflow='hidden'; d.width='100%'; d.height='100%'; d.background='#000';
      if (document.body) {
        var b = document.body.style;
        b.margin='0'; b.padding='0'; b.overflow='hidden'; b.width='100%'; b.height='100%'; b.background='#000';
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

function parseDetailResponse(html, apiUrl) {
    var rawJS = getJS(apiUrl);
    return JSON.stringify({
        url: apiUrl,
        isEmbed: false,
        orientation: "auto",
        headers: {
            "Referer": "https://vaxplugins.alokillgtv05.workers.dev/",
            "User-Agent": "Mozilla/5.0",
            "Sniffer": false,
            "Block-AutoClick": "true",
            "Block-Ads": false,
            "Block-Css": "",
            "Custom-Js": rawJS
        },
        subtitles: []
    });
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

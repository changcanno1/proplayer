/* VAX GAME - plugin native WebView */
var GAME_LIST_URL = "https://vaxplugins.alokillgtv05.workers.dev/tv/game/list.txt";
var GAME_CACHE = [];

function getManifest() {
    return JSON.stringify({
        id: "game",
        name: "GAME [LX]",
        version: "1.0.0",
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
    try{
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
    } catch(e){
      log("getLISTmenu[err]:\n " + e);
      return `[
        {"link":"/","name":"Đang lỗi getLISTmenu()"},
      ]`;
    }
  }


function getPrimaryCategories() {
    try { return JSON.stringify(buildMenu(getLISTmenu())); }
    catch (e) { return JSON.stringify([]); }
}

function getUrlList(slug, filtersJson) {
    var category = String(slug || "all");
    return GAME_LIST_URL + (category !== "all" ? "?category=" + encodeURIComponent(category) : "");
}

function getUrlSearch(keyword, filtersJson) {
    return GAME_LIST_URL + "?q=" + encodeURIComponent(keyword || "");
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
    var match = query.match(/[?&]category=([^&]+)/i);
    var category = match ? decodeURIComponent(match[1]) : "";
    var out = [];
    GAME_CACHE = [];
    for (var i = 0; i < games.length; i++) {
        if (category && String(games[i].category || games[i].tag || "") !== category) continue;
        var item = cleanGame(games[i]);
        if (item) { out.push(item); GAME_CACHE.push(item); }
    }
    return out;
}

function parseListResponse(raw, apiUrl) {
    var items = filterGames(raw, apiUrl);
    return JSON.stringify({
        items: items,
        pagination: { currentPage: 1, totalPages: 1 }
    });
}

function parseSearchResponse(raw, apiUrl) {
    var all = filterGames(raw, apiUrl);
    var q = ((String(apiUrl || "").match(/[?&]q=([^&]+)/i) || [])[1] || "");
    q = decodeURIComponent(q).toLowerCase();
    if (q) all = all.filter(function (g) {
        return (g.title + " " + g.description + " " + g.category).toLowerCase().indexOf(q) >= 0;
    });
    return JSON.stringify({ items: all, pagination: { currentPage: 1, totalPages: 1 } });
}

function parseMovieDetail(html, apiUrl) {
    var url = String(apiUrl || "");
    var found = null;
    for (var i = 0; i < GAME_CACHE.length; i++) {
        if (GAME_CACHE[i].url === url) { found = GAME_CACHE[i]; break; }
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
  if(apiUrl.indexOf("https://www.crazygames.com") > -1){
    return crazyJS()
  }
}

function crazyJS(){
  return `
(function () {
  'use strict';
  if (window.__GLS_INIT) { return; }
  window.__GLS_INIT = true;

  var TAG        = '[GLS]';
  var STYLE_ID   = '__gls_loader_style';
  var ROOT_ID    = '__gls_iframe_root';
  var IFRAME_SEL = 'iframe#game-iframe, iframe.GameContainerMobile_gameIframe__kYvt0, iframe.bs-GameContainer--game';
  var AUTO_HIDE_MS = 3000;

  function log()   { try { var a=[].slice.call(arguments); a.unshift(TAG); console.log.apply(console,a); } catch(e){} }
  function warn()  { try { var a=[].slice.call(arguments); a.unshift(TAG); console.warn.apply(console,a); } catch(e){} }
  function error() { try { var a=[].slice.call(arguments); a.unshift(TAG); console.error.apply(console,a); } catch(e){} }

  log('boot v3, readyState=' + document.readyState);

  /* ---------- Loader qua CSS pseudo-element (KHÔNG chèn DOM) ---------- */
  var LOADER_CSS = ''
    + 'html::before{content:"ĐANG TẢI GAME\\n Xin vui lòng chờ chút nhé.";'
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
    if (document.getElementById(STYLE_ID)) { log('loader: style already present'); return true; }
    var parent = document.head || document.documentElement;
    if (!parent) { warn('loader: no parent yet'); return false; }
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = LOADER_CSS;
    parent.appendChild(s);
    log('loader: style injected into ' + parent.tagName);
    return true;
  }

  if (!injectLoaderStyle()) {
    document.addEventListener('DOMContentLoaded', function () {
      log('loader: retry style inject on DOMContentLoaded');
      injectLoaderStyle();
    }, { once: true });
  }

  var hidden = false;
  function hideLoader(reason) {
    if (hidden) { log('loader: HIDE skipped (already), reason=' + reason); return; }
    hidden = true;
    log('loader: HIDE begin, reason=' + reason);
    try {
      var s = document.getElementById(STYLE_ID);
      if (s && s.parentNode) { s.parentNode.removeChild(s); log('loader: style removed from DOM'); }
      else { warn('loader: style element NOT FOUND'); }
    } catch (e) { error('loader: hide threw', e); }
    log('loader: HIDE end');
  }

  var autoHideTimer = setTimeout(function () { hideLoader('auto-30s'); }, AUTO_HIDE_MS);

  /* ---------- Watch & Swap ---------- */
  var swapped = false;
  var watching = false;
  var mo = null, pollId = 0, heartbeatId = 0;
  var startTime = Date.now();
  function elapsed() { return Date.now() - startTime; }
  function findIframe() { try { return document.querySelector(IFRAME_SEL); } catch (e) { return null; } }

  function stopWatching(reason) {
    log('watch: STOP, reason=' + reason);
    if (mo) { try { mo.disconnect(); } catch (e) {} mo = null; }
    if (pollId) { clearInterval(pollId); pollId = 0; }
    if (heartbeatId) { clearInterval(heartbeatId); heartbeatId = 0; }
    watching = false;
  }

  function doSwap(iframe) {
    if (swapped) { return; }
    if (!iframe) { return; }
    swapped = true;
    log('swap: BEGIN at +' + elapsed() + 'ms, iframe.src=' + String(iframe.src || '').slice(0, 100));
    stopWatching('swap-start');
    clearTimeout(autoHideTimer);

    /* A. Ẩn loading NGAY (bất chấp các bước sau có lỗi hay không) */
    try { hideLoader('swap-pre-hide'); } catch (e) { error('swap A threw', e); }

    /* B. Tạo root container fullscreen */
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
        log('swap B: root CREATED');
      } else {
        log('swap B: root exists');
      }
    } catch (e) { error('swap B threw', e); }

    /* C. Move iframe sang root */
    if (root) {
      try {
        root.appendChild(iframe);
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;'
          + 'border:0;margin:0;padding:0;display:block;';
        log('swap C: iframe MOVED into root, src=' + String(iframe.src || '').slice(0, 100));
      } catch (e) { error('swap C threw', e); }
    } else {
      error('swap C: SKIPPED (no root)');
    }

    /* D. Xoá sạch body */
    try {
      if (document.body) {
        var n = document.body.childElementCount;
        document.body.innerHTML = '';
        log('swap D: body WIPED (removed ' + n + ' children)');
      } else { warn('swap D: no body'); }
    } catch (e) { error('swap D threw', e); }

    /* E. Xoá <script> trong <head> (giữ <style>) */
    try {
      var head = document.head;
      if (head) {
        var scripts = head.querySelectorAll('script');
        var removed = 0;
        for (var i = 0; i < scripts.length; i++) {
          try { var sc = scripts[i]; if (sc.parentNode) { sc.parentNode.removeChild(sc); removed++; } } catch (e2) {}
        }
        log('swap E: removed ' + removed + '/' + scripts.length + ' head scripts');
      }
    } catch (e) { error('swap E threw', e); }

    /* F. Reset html/body: không viền, không cuộn */
    try {
      var d = document.documentElement.style;
      d.margin='0'; d.padding='0'; d.overflow='hidden'; d.width='100%'; d.height='100%'; d.background='#000';
      if (document.body) {
        var b = document.body.style;
        b.margin='0'; b.padding='0'; b.overflow='hidden'; b.width='100%'; b.height='100%'; b.background='#000';
      }
      log('swap F: style reset OK');
    } catch (e) { error('swap F threw', e); }

    /* G. Thử fullscreen (bọc kỹ) */
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        var p = document.documentElement.requestFullscreen();
        if (p && typeof p.then === 'function') {
          p.then(function () { log('swap G: fullscreen OK'); })
           .catch(function (err) { warn('swap G: fullscreen REJECTED: ' + (err && err.message)); });
        }
      } else if (document.fullscreenElement) { log('swap G: already fullscreen'); }
      else { warn('swap G: fullscreen API missing'); }
    } catch (e) { warn('swap G threw', e); }

    /* H. Verify sau 1s và 5s */
    setTimeout(function () {
      var okIframe    = !!findIframe();
      var styleGone   = !document.getElementById(STYLE_ID);
      var bodyEmpty   = !!(document.body && document.body.childElementCount === 0);
      var rootOk      = !!document.getElementById(ROOT_ID);
      log('verify+1s: iframe=' + okIframe + ' styleGone=' + styleGone
          + ' bodyEmpty=' + bodyEmpty + ' rootOk=' + rootOk);
      if (!styleGone) {
        warn('verify+1s: style STILL PRESENT — force removing');
        try { var s2 = document.getElementById(STYLE_ID); if (s2 && s2.parentNode) s2.parentNode.removeChild(s2); } catch (e) {}
      }
    }, 1000);

    setTimeout(function () {
      log('verify+5s: iframe=' + !!findIframe()
          + ' styleGone=' + !document.getElementById(STYLE_ID)
          + ' loaderHidden=' + hidden);
    }, 5000);

    log('swap: DONE (sync portion)');
  }

  function startWatching(reason) {
    if (watching || swapped) { log('watch: skip, reason=' + reason); return; }
    watching = true;
    log('watch: START reason=' + reason + ', readyState=' + document.readyState);

    var f = findIframe();
    if (f) { log('watch: iframe already present'); doSwap(f); return; }

    try {
      mo = new MutationObserver(function () {
        var el = findIframe();
        if (el) { log('watch: iframe FOUND via MutationObserver'); doSwap(el); }
      });
      mo.observe(document.documentElement || document, { childList: true, subtree: true });
      log('watch: MutationObserver attached');
    } catch (e) { error('watch: MO setup threw', e); }

    pollId = setInterval(function () {
      var el = findIframe();
      if (el) { log('watch: iframe FOUND via polling'); doSwap(el); }
    }, 300);
    log('watch: poll every 300ms started');

    heartbeatId = setInterval(function () {
      if (swapped) { return; }
      log('watch: heartbeat +' + elapsed() + 'ms, iframe=' + (findIframe() ? 'FOUND' : 'waiting'));
    }, 2000);
    log('watch: heartbeat every 2s started');
  }

  if (document.documentElement) { startWatching('immediate'); }
  else {
    document.addEventListener('DOMContentLoaded', function () {
      startWatching('domcontentloaded');
    }, { once: true });
  }
})();
  `
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

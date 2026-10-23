var BASEURL = "https://vicdn.cc"; 
var BASEAPI = BASEURL + "/api";
var DEV = true;
var popup_html = "";

function getManifest() {
  return JSON.stringify({
    id: "vicdn",
    name: "Nguồn Vicdn",
    description: "Nguồn phim Vicdn.",
    version: "2.4",
    info: "Nguồn phim vietsub và thuyết minh mới.\n\n Hỗ trợ lồng tiếng và có tốc độ phát rất nhanh.",
    baseUrl: "https://vicdn.cc",
    iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/icon/vicdn.png",
    isEnabled: true,
    adblock: false,
    type: "MOVIE",
    author: "Alokillgtv",
    playerType: "embedtoexoplay"
  });
}

function log(msg) {
  console.log(msg);
}

function getHomeSections() {
    return JSON.stringify([
        {"slug": "/update/","title": "Phim Mới","type": "Grid"}
    ]);
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

function getUrlList(slug, filtersJson) {
    try {
        log("getUrlList[url]: \n" + slug);

        if (slug && slug.indexOf("http") > -1) {
            if (slug.indexOf("search") > -1 && filtersJson) {
                var fixedJson1 = filtersJson
                    .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    .replace(/:,/g, ':');
                try {
                    var filtersSearch = JSON.parse(fixedJson1);
                    var pageSearch = parseInt(filtersSearch.page) || 1;

                    if (pageSearch > 1 && slug.indexOf("page=") === -1) {
                        var sepSearch = slug.indexOf("?") > -1 ? "&" : "?";
                        var resSearch = slug + sepSearch + "page=" + pageSearch;
                        log("getUrlList[url]: \n" + resSearch);
                        return resSearch;
                    }
                } catch (jsonErr) {}
            }
            log("getUrlList[url]: \n" + slug);
            return slug;
        }

        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson2 = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                var filters = JSON.parse(fixedJson2);
                page = parseInt(filters.page) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        var resultUrl = BASEAPI;
        if (path) {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }

        if (page > 0 && resultUrl.indexOf("page=") === -1) {
            resultUrl += page;
        }

        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        log("getUrlList[err]:\n " + e);
        if (slug && slug.indexOf("http") > -1) {
            log("getUrlList[url]: \n" + slug);
            return slug;
        }
        var fallback = BASEAPI + (slug ? (slug.indexOf("/") === 0 ? slug : "/" + slug) : "");
        var finalFallback = fallback.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + finalFallback);
        return finalFallback;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;

        if (filtersJson) {
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        var encodedKeyword = encodeURIComponent(keyword || "");
        var resultUrl = BASEURL + "/?q=" + encodedKeyword;

        if (page > 1) {
            resultUrl += "&page=" + page;
        }

        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlSearch[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        var fallback = BASEURL + "/?q=" + encodeURIComponent(keyword || "");
        var finalFallback = fallback.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlSearch[url]: \n" + finalFallback);
        return finalFallback;
    }
}

function getUrlDetail(slug) {
    try {
        log("getUrlDetail[url]: \n" + slug);
        if (!slug) return "";
        if (slug.indexOf('http') === 0) return slug;
        var detailUrl = BASEURL + "/" + slug;
        log("getUrlDetail[url]: \n" + detailUrl);
        return detailUrl;
    } catch (e) {
        log("getUrlDetail[err]:\n " + e);
        return "";
    }
}

function getUrlCategories() { 
    try { return BASEURL; } catch (e) { return ""; }
}
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function parseListResponse(html, $url) {
    try {
        log("parseListResponse[url]: \n" + $url);
        if ($url.indexOf("/?q=") > -1) {
            var script = _$(html).find("script:content('const|allData')").html();
            var $obj = script.match(/\[\s*\{[\s\S]*?\}\s*\]/i);
            if ($obj) {
                var $data = JSON.parse($obj[0]);
                return domfetch($data, $url);
            }
        } else {
            var $allData = JSON.parse(html);
            return domfetch($allData.data, $url);
        }
    } catch (e) {
        log("parseListResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [{
                "id": $url || "error_url",
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function domfetch($data, $url) {
    var items = [];
    for (var $j = 0; $j < $data.length; $j++) {
        var item = $data[$j];
        items.push({
            "id": BASEAPI + "/info/" + item.slug,
            "title": item.vname,
            "posterUrl": "https://image.tmdb.org/t/p/w130_and_h195_face/" + item.poster + ".jpg",
            "backdropUrl": "https://image.tmdb.org/t/p/w533_and_h300_face/" + item.banner + ".jpg",
            "quality": item.type.toUpperCase(),
            "episode_current": "Tập " + item.stt + "/" + item.total
        });
    }
    return JSON.stringify({
        "items": items,
        "pagination": { "currentPage": 1, "totalPages": 999 }
    });
}

function parseSearchResponse(html, url) {
    try {
        return parseListResponse(html, url);
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function decodeHTMLEntities(str) {
    try {
        if (!str) return "";
        // Đã thay thế Arrow Function bằng hàm ẩn danh tiêu chuẩn ES5 tương thích iOS
        return str.replace(/&#(\d+);|&#x([0-9a-fA-F]+);/g, function(match, dec, hex) {
            if (dec) { return String.fromCharCode(parseInt(dec, 10)); }
            if (hex) { return String.fromCharCode(parseInt(hex, 16)); }
            return match;
        });
    } catch (e) {
        log("decodeHTMLEntities[err]:\n " + e);
    }
}

function parseMovieDetail(html, url) {
    try {
        log("parseMovieDetail[url]: \n" + url);
        var $jsdata = JSON.parse(html);
        var $data = $jsdata.data;
        var limg = $data.banner;
        var lname = $data.vname;
        var ldes = $data.content;
        var lactor = $data.cast.join(" - ");
        var lduran = $data.duration + " phút";
        var status = "Tập " + $data.stt + "/" + $data.total;
        var category = $data.genre.join(" - ");
        var episode_current = "Tập " + $data.stt;
        var year = $data.year;
        var servers = [];
        var episodes = [];

        for (var $j = 0; $j < $data.list_episodes.length; $j++) {
            var item = $data.list_episodes[$j];
            var split = item.split("|");
            episodes.push({
                id: url + "?current=" + split[0] + "&tm=raw",
                name: "Tập " + split[0],
                slug: "tap-" + split[0],
                ids: [{
                  url: url + "?current=" + split[0] + "&tm=raw",
                  name: "Vietsub (Âm Thanh Gốc)"
                },{
                  url: url + "?current=" + split[0] + "&tm=tm1",
                  name: "Vietsub (Thuyết Minh Nữ)"
                },{
                  url: url + "?current=" + split[0] + "&tm=tm2",
                  name: "Vietsub (Thuyết Minh Nam)"
                }]
            });
        }
        servers.push({ name: "Server", episodes: episodes });

        return JSON.stringify({
            id: url,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "HD",
            year: year,
            rating: 8.5,
            status: status,
            category: category,
            episode_current: episode_current,
            servers: servers,
            duration: lduran || "",
            casts: lactor || "",
            director: "",
            extra: ""
        });
    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({ id: url || "error", title: "error", servers: [] });
    }
}

function checkRaw(scriptStr, returnFixed) {
  try {
    if (!scriptStr || typeof scriptStr !== 'string') return scriptStr || "";
    var lines = scriptStr.split('\n');
    var fixedLines = [];
    var hasError = false;

    for (var i = 0; i < lines.length; i++) {
      var currentLine = lines[i];
      if (/([^\\]|^)(\r\n|\r|\n)/.test(currentLine)) hasError = true;
      if (/\t/.test(currentLine) && !/\\t/.test(currentLine)) hasError = true;
      
      var fixedLine = currentLine;
      if (returnFixed) {
        fixedLine = fixedLine.replace(/\r/g, "").replace(/\t/g, "  ");
      }
      fixedLines.push(fixedLine);
    }

    try { new Function(scriptStr); } catch (syntaxErr) { hasError = true; }
    return returnFixed ? fixedLines.join('\n') : scriptStr;
  } catch (e) {
    return scriptStr;
  }
}

function parseDetailResponse(html, url) {
  try {
    var $jsdata = JSON.parse(html);
    var $data = $jsdata.data;
    var current = url.match(/current=(\d+)/i)[1];
    var stream = url;
    current = Number(current);
    for (var $j = 0; $j < $data.list_episodes.length; $j++) {
        var item = $data.list_episodes[$j];
        var split = item.split("|");
        if(Number(split[0]) == current){
              stream = split[1] + "?episodes=" + url;
        }
    }
    var epi = url.match(/current=(\d+)&tm=(\w+)/i);
    var sub = "https://vicdn.cc/vtt/" + (url.match(/^https:\/\/vicdn\.cc\/api\/info\/([^\?]+)/i)[1]) + "-" + epi[1] + "-vi.vtt";
    var subeng = "https://vicdn.cc/vtt/" + (url.match(/^https:\/\/vicdn\.cc\/api\/info\/([^\?]+)/i)[1]) + "-" + epi[1] + "-en.vtt";
    
    return JSON.stringify({
      url: stream,
      isEmbed: false,
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
        Referer: BASEURL,
        "Block-Ads": false,
        "Custom-Js": rawJS(BASEURL, epi[2])
      },
      subtitles: [{
        url: sub, lang: "Vietsub", mimeType: "text/vtt"
      },{
        url: subeng, lang: "English", mimeType: "text/vtt"
      }],
    });
  } catch (e) {
    log("parseDetailResponse[err]:\n " + e);
    return JSON.stringify({ 
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
      mimeType: "video/mp4", 
      isEmbed: false, headers: {}, subtitles: [] 
    });
  }
}

function rawJS(referer, tm) {
return \`
(function ensureHls(){
  if (typeof window.hls !== 'undefined' || typeof window.Hls !== 'undefined') return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
  s.onload = function(){ try { if (window.Hls && !window.hls) window.hls = window.Hls; } catch(e){} };
  (document.head || document.documentElement).appendChild(s);
})();

function bridgeLog(msg, check) {
    try {
      if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
        window.SnifferBridge.log(msg);
        if (check === true && typeof window.SnifferBridge.toast === 'function') {
          window.SnifferBridge.toast(msg, 1000);
        }
      } else if (typeof console !== 'undefined' && console.log) {
        console.log(msg);
      }
    } catch(e) {}
}

var __vaxMode = null;
var __modeTimer = setTimeout(function() {
  if (__vaxMode === null) {
    __vaxMode = 'native';
    bridgeLog('Mode: native (default timeout)');
  }
}, 800);

try { window.parent.postMessage({ type: 'vax_ready' }, '*'); } catch(e){}

window.addEventListener('message', function(ev) {
  var d = ev.data || {};
  if (!d || !d.vaxCmd) return;
  if (d.vaxCmd === 'setMode') {
    __vaxMode = d.mode || 'web';
    clearTimeout(__modeTimer);
    bridgeLog('Mode set by parent: ' + __vaxMode);
    if (__vaxMode === 'web') bindJwCtrl();
    return;
  }
  if (__vaxMode === 'web') {
    jwCmd(d.vaxCmd, d.val);
  } else {
    var v = document.querySelector('video');
    if (!v) return;
    if (d.vaxCmd === 'toggle') { if (v.paused) v.play().catch(function(){}); else v.pause(); }
    else if (d.vaxCmd === 'seek+5') { try { v.currentTime = Math.min(v.duration, v.currentTime + 5); } catch(e){} }
    else if (d.vaxCmd === 'seek-5') { try { v.currentTime = Math.max(0, v.currentTime - 5); } catch(e){} }
    else if (d.vaxCmd === 'vol+') { v.volume = Math.min(1, v.volume + 0.1); v.muted = false; }
    else if (d.vaxCmd === 'vol-') { v.volume = Math.max(0, v.volume - 0.1); v.muted = false; }
    else if (d.vaxCmd === 'blur') { try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); window.blur(); } catch(e){} }
  }
}, false);

(function injectCSS() {
  try {
    var cssStyle = 'html,body{margin:0!important;padding:0!important;background:#000!important;overflow:hidden!important;width:100%!important;height:100%!important}#ssPlay,.jw-wrapper{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;z-index:9!important}';
    var s = document.createElement('style');
    s.type = 'text/css';
    s.setAttribute('data-injected-by', 'custom-script');
    if (s.styleSheet) s.styleSheet.cssText = cssStyle;
    else s.appendChild(document.createTextNode(cssStyle));
    var t = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    if (t) t.appendChild(s);
  } catch (e) { bridgeLog('CSS err: ' + e.message); }
})();

try {
  var _fakeDtd = { launch:function(){}, addListener:function(){}, on:function(){}, isOpen:function(){ return false; } };
  Object.defineProperty(window, 'devtoolsDetector', {
    configurable: true,
    get: function(){ return _fakeDtd; },
    set: function(){}
  });
} catch(e) {}

(function initLocalBlobSniffer() {
  if (window.__BLOB_SNIFFER_INITIALIZED__) return;
  window.__BLOB_SNIFFER_INITIALIZED__ = 1;

  var hasDispatchedAny = 0;
  var isFinished = 0;
  var timeoutTimer = null;

  bridgeLog("Đang tìm link Video...", true);
  timeoutTimer = setTimeout(function() {
    if (hasDispatchedAny === 0 && isFinished === 0 && __vaxMode !== 'web') {
      isFinished = 1;
      if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
        window.SnifferBridge.play("https://google.com", "");
      }
    }
  }, 20000);

  function stopTimeout() {
    if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }
  }

  function isValidM3U8(content) {
    if (typeof content !== 'string') return false;
    var t = content.trim();
    return t.indexOf('#EXTM3U') === 0 && (t.indexOf('#EXTINF') !== -1 || t.indexOf('#EXT-X-STREAM-INF') !== -1);
  }

  function getServerMapping() {
    var mapping = {};
    try {
      var rawHtml = document.documentElement.outerHTML || document.body.innerHTML || "";
      var all = rawHtml.match(/x\\d{2,4}/gi) || [];
      for (var i = 0; i < all.length; i++) {
        var code = all[i].toLowerCase();
        if (/^x30\\d/i.test(code)) { mapping['tm2'] = code; mapping['nam'] = code; }
        else if (/^x20\\d/i.test(code)) { mapping['tm1'] = code; mapping['nu'] = code; }
        else if (/^x10\\d/i.test(code)) { mapping['raw'] = code; mapping['origin'] = code; }
      }
    } catch (e) {}
    return mapping;
  }

  function processAndReplaceM3u8Server(m3u8Content, requestedTm) {
    if (!requestedTm) return m3u8Content;
    var mapping = getServerMapping();
    var targetServerCode = mapping[requestedTm.toLowerCase()];
    if (!targetServerCode) return m3u8Content;
    return m3u8Content.replace(/(x\\d+)(\\.vicdn\\.cc)/gi, targetServerCode + '$2');
  }

  function dispatchM3u8ToApp(m3u8Content) {
    if (__vaxMode === 'web') return;
    if (!m3u8Content || hasDispatchedAny === 1) return;
    hasDispatchedAny = 1;
    isFinished = 1;
    stopTimeout();
    var requestedTm = "\${tm || 'raw'}";
    var finalM3u8 = processAndReplaceM3u8Server(m3u8Content, requestedTm);
    try {
      SnifferBridge.playM3u8Content(finalM3u8, JSON.stringify({"Origin":"https://phim.nguonc.com","Referer":"\${referer}"}));
    } catch(e) {}
  }

  try {
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      var origCOU = URL.createObjectURL;
      URL.createObjectURL = function(blob) {
        var blobUrl = origCOU.apply(this, arguments);
        if (isFinished === 0 && blob && (blob instanceof Blob || blob instanceof File)) {
          var proc = function(content) {
            if (isValidM3U8(content)) dispatchM3u8ToApp(content);
          };
          if (typeof blob.text === 'function') {
            blob.text().then(proc).catch(function(){});
          } else {
            var r = new FileReader();
            r.onload = function(e){ proc(e.target.result); };
            r.readAsText(blob);
          }
        }
        return blobUrl;
      };
    }
  } catch (e) {}
})();

(function initProxyFetch() {
  if (window.__VAX_PROXY_FETCH__) return;
  window.__VAX_PROXY_FETCH__ = 1;

  var PROXY = 'https://streamfile.alokillgtv04.workers.dev/proxy';
  var REF = 'https://vicdn.cc';

  function shouldProxy(u) {
    if (!u || typeof u !== 'string') return false;
    if (!/vicdn\\.cc\\//i.test(u)) return false;
    if (/\\.(js|mjs|css|json|png|jpg|jpeg|gif|webp|svg|woff2?|ttf)(\\?|#|$)/i.test(u)) return false;
    if (/vicdn\\.cc\\/hls\\/[^?#]+\\.html/i.test(u))     return true;
    if (/vicdn\\.cc\\/subtitle\\/[^?#]+\\.html/i.test(u)) return true;
    if (/vicdn\\.cc\\/vtt\\/[^?#]+\\.vtt/i.test(u))      return true;
    return false;
  }
  function toProxy(u) {
    return PROXY + '?url=' + encodeURIComponent(u) + '&referer=' + REF;
  }

  try {
    var rawFetch = window.fetch;
    window.fetch = function(input, init) {
      var u = typeof input === 'string' ? input : (input && input.url);
      if (shouldProxy(u)) {
        var newU = toProxy(u);
        if (typeof input === 'string') return rawFetch.call(this, newU, init);
        try { return rawFetch.call(this, new Request(newU, input)); }
        catch(e) { return rawFetch.call(this, newU, init); }
      }
      return rawFetch.apply(this, arguments);
    };
  } catch(e) {}

  try {
    var rawOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      if (shouldProxy(url)) {
        arguments[1] = toProxy(url);
      }
      return rawOpen.apply(this, arguments);
    };
  } catch(e) {}
})();

var __jwPlayer = null;
var __jwBound = false;

function bindJwCtrl() {
  if (__jwBound) return true;
  if (!window.jwplayer) return false;
  var p;
  try { p = window.jwplayer(); } catch(e) { return false; }
  if (!p || !p.on) return false;
  __jwPlayer = p;
  __jwBound = true;

  function post(type, d) { try { window.parent.postMessage(Object.assign({type:type}, d||{}), '*'); } catch(e){} }

  p.on('time', function(e) { post('NGUONC_TIME', { time: e.position || 0, duration: e.duration || 0 }); });
  p.on('play', function() { post('NGUONC_STATE', { paused:false }); });
  p.on('pause', function() { post('NGUONC_STATE', { paused:true }); });
  p.on('seek', function(e) { post('NGUONC_TIME', { offset: e.offset || 0, duration: p.getDuration() || 0 }); });
  return true;
}

function jwCmd(c, val) {
  if (!__jwPlayer) {
    if (!bindJwCtrl()) return;
  }
  var p = __jwPlayer;
  if (!p) return;
  try {
    if (c === 'toggle') { if (p.getState() === 'playing') p.pause(); else p.play(); }
    else if (c === 'seek+5') { var d = p.getDuration() || 0; p.seek(Math.min(d, (p.getPosition()||0) + 5)); }
    else if (c === 'seek-5') { p.seek(Math.max(0, (p.getPosition()||0) - 5)); }
    else if (c === 'vol+') { p.setVolume(Math.min(100, (p.getVolume()||0) + 10)); }
    else if (c === 'vol-') { p.setVolume(Math.max(0, (p.getVolume()||0) - 10)); }
    else if (c === 'blur') { try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); window.blur(); } catch(e){} }
  } catch(e) {}
}
\`;
}

function sortEpisodesByName(data) {
    try {
        if (data && Array.isArray(data)) {
            data.forEach(function(server) {
                if (server.episodes && Array.isArray(server.episodes)) {
                    server.episodes.sort(function(a, b) {
                        var matchA = a.name.match(/Tập\s*(\d+)/i);
                        var matchB = b.name.match(/Tập\s*(\d+)/i);
                        var numA = matchA ? parseInt(matchA[1], 10) : 0;
                        var numB = matchB ? parseInt(matchB[1], 10) : 0;
                        return numA - numB;
                    });
                }
            });
        }
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
        return JSON.stringify([]);
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return '[{"link":"/type/hoat-hinh/","name":"Hoạt Hình"},{"link":"/type/vien-tuong/","name":"Viễn Tưởng"},{"link":"/type/hinh-su/","name":"Hình Sự"},{"link":"/type/bi-an/","name":"Bí Ẩn"},{"link":"/type/hanh-dong/","name":"Hành Động"}]';
}

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

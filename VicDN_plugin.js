var BASEURL = "https://vicdn.cc"; 
var BASEAPI = BASEURL + "/api";
var DEV = true;

function getManifest() {
  return JSON.stringify({
    id: "vicdn",
    name: "Nguồn Vicdn",
    description: "Nguồn phim Vicdn.",
    "version": "2.1",
    info: "Nguồn phim vietsub và thuyết minh mới.\n\n Hỗ trợ lồng tiếng và có tốc độ phát rất nhanh.",
    baseUrl: "https://vicdn.cc",
    iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/vicdn.png",
    isEnabled: true,
    "adblock": false,
    type: "MOVIE",
    "author": "Alokillgtv",
    playerType: "embed"
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

// =============================================================================
// HELPER: CURSOR BASE64 ENCODE / DECODE
// =============================================================================
function getUrlList(slug, filtersJson) {
    try {
        log("getUrlList[url]: \n" + slug);

        // 1. Kiểm tra nếu slug là link tuyệt đối (chứa http)
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

        // 2. Xử lý an toàn filtersJson cho link tương đối
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

        // 3. Ghép URL an toàn với BASEURL
        var resultUrl = BASEAPI;
        if (path) {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }

        // 4. Ghép tham số phân trang page (tự động nhận biết ? hay &)
        if (page > 0 && resultUrl.indexOf("page=") === -1) {
            resultUrl += page;
        }

        // 5. Làm sạch dấu // thừa ở path (giữ nguyên https://)
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

        // 1. Giải mã filtersJson lấy trang đúng chuẩn hàm gốc
        if (filtersJson) {
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        // 2. Khởi tạo URL tìm kiếm kèm cấu trúc /search?lang=vi-VN&q=
        var encodedKeyword = encodeURIComponent(keyword || "");
        var resultUrl = BASEURL + "/?q=" + encodedKeyword;

        // 3. Nếu page > 1 thì nối thêm &page=
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
    try {
        log("getUrlCategories[url]: \n" + BASEURL);
        return BASEURL; 
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

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, $url) {
    try {
        log("parseListResponse[url]: \n" + $url);
        if ($url.indexOf("/?q=") > -1) {
            var script = _$(html).find("script:content('const|allData')").html()

            var $obj = script.match(/\[\s*\{[\s\S]*?\}\s*\]/i);
            if ($obj) {
                $data = JSON.parse($obj[0]);
                return domfetch($data, $url);
            }
        } else {
            var $allData = JSON.parse(html)

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
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseJSDataIsolated(str) {
    const code = str.replace(/^(const|let|var)\s+\w+\s*=\s*/, '');
    return new Function(`"use strict"; return (${code});`)();
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
        "pagination": {
            "currentPage": 1,
            "totalPages": 999
        }
    });

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

function decodeHTMLEntities(str) {
    try {
        if (!str) return "";
        return str.replace(/&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, dec, hex) => {
            if (dec) {
                return String.fromCharCode(parseInt(dec, 10));
            }
            if (hex) {
                return String.fromCharCode(parseInt(hex, 16));
            }
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
        // === BƯỚC 2: TRÍCH XUẤT THÔNG TIN PHIM ===
        var lurl = "";
        var limg = "";
        var lname = "Đang cập nhật...";
        var ldes = "Không có mô tả.";
        var ldirec = "";
        var lactor = "";
        var lduran = "";
        var status = "";
        var category = "";
        var episode_current = "";
        var year = 2026;
        var extra = "";
        limg = $data.banner;
        lname = $data.vname;
        ldes = $data.content;
        lactor = $data.cast.join(" - ");
        lduran = $data.duration + " phút";
        status = "Tập " + $data.stt + "/" + $data.total;
        category = $data.genre.join(" - ");
        episode_current = "Tập " + $data.stt;
        year = $data.year;
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
            })
        }
        servers.push({
            name: "Server",
            episodes: episodes
        })
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
            director: ldirec || "",
            extra: extra
        });

    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: url || url || "error",
            title: "error",
            servers: []
        });
    }
}

function checkRaw(scriptStr, returnFixed) {
  try {
    if (!scriptStr || typeof scriptStr !== 'string') {
      console.log("[Lỗi escape runJS]\r\n\t Dữ liệu đầu vào không phải là chuỗi hợp lệ!");
      return scriptStr || "";
    }

    var lines = scriptStr.split('\n');
    var fixedLines = [];
    var hasError = false;

    for (var i = 0; i < lines.length; i++) {
      var currentLine = lines[i];
      var lineNum = i + 1;
      var lineErrorFound = false;

      // 1. Kiểm tra lỗi escape newline/tab nguy hiểm nằm trần trong chuỗi quote
      if (/([^\\]|^)(\r\n|\r|\n)/.test(currentLine)) {
        console.log("[Lỗi escape runJS]\r\n\t Phát hiện xuống dòng chưa escape ở Dòng " + lineNum + ": " + currentLine.trim());
        lineErrorFound = true;
      }

      // 2. Kiểm tra lỗi quên escape ký tự Tab trần không hợp lệ
      if (/\t/.test(currentLine) && !/\\t/.test(currentLine)) {
        console.log("[Lỗi escape runJS]\r\n\t Phát hiện ký tự Tab trần ở Dòng " + lineNum + ": " + currentLine.trim());
        lineErrorFound = true;
      }

      // 3. Kiểm tra dấu xược ngược single trailing backlash ở cuối dòng (dễ làm gãy chuỗi)
      if (/([^\\])\\$/.test(currentLine)) {
        console.log("[Lỗi escape runJS]\r\n\t Dấu Backslash (\\) cô đơn ở cuối Dòng " + lineNum + ": " + currentLine.trim());
        lineErrorFound = true;
      }

      if (lineErrorFound) {
        hasError = true;
      }

      // Tiến hành SỬA LỖI tự động nếu tham số returnFixed = true
      var fixedLine = currentLine;
      if (returnFixed) {
        fixedLine = fixedLine
          .replace(/\r/g, "")
          .replace(/\t/g, "  "); // Thay Tab trần bằng 2 khoảng trắng cho an toàn
      }

      fixedLines.push(fixedLine);
    }

    // 4. Kiểm tra cú pháp nhanh xem toàn bộ chuỗi có parse được JS không
    try {
      new Function(scriptStr);
    } catch (syntaxErr) {
      hasError = true;
      console.log("[Lỗi escape runJS]\r\n\t 💥 LỖI CÚ PHÁP (SyntaxError) toàn cục: " + syntaxErr.message);
    }

    if (!hasError) {
      console.log("[checkRaw] 🟢 Chuỗi Raw JS hoàn toàn sạch lỗi!");
    }

    return returnFixed ? fixedLines.join('\n') : scriptStr;

  } catch (e) {
    console.log("[Lỗi escape runJS]\r\n\t Lỗi ngoại lệ trong hàm checkRaw: " + e.message);
    return scriptStr; 
  }
}

function parseDetailResponse(html, url) {
  try {
    var $jsdata = JSON.parse(html);
    var $data = $jsdata.data;
    var servers = [];
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
    var customJS = checkRaw(rawJS(stream),true);

    var idvd = url.match(/^https:\/\/vicdn\.cc\/api\/info\/([^\?]+)/i)
    var epi = url.match(/current=(\d+)&tm=(\w+)/i);
    sub = "https://vicdn.cc/vtt/" + idvd[1] + "-" + epi[1] + "-vi.vtt"
    subeng = "https://vicdn.cc/vtt/" + idvd[1] + "-" + epi[1] + "-en.vtt"
    console.log("TM: "+epi[2]+" sub\n" + sub)    
    log("Embed: " + stream)
    return JSON.stringify({
      url: stream,
      isEmbed: false,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: BASEURL,
        "Block-Ads": false,
        "Custom-Js": rawJS(BASEURL,epi[2])
      },
      subtitles: [{
        url: sub,
        lang: "Vietsub",
        mimeType: "text/vtt"
      },{
        url: subeng,
        lang: "English",
        mimeType: "text/vtt"
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
return `
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

/* ═══ MODE: null = chưa biết, 'web' = parent web, 'native' = parent native ═══ */
var __vaxMode = null;
var __modeTimer = setTimeout(function() {
  if (__vaxMode === null) {
    __vaxMode = 'native';
    bridgeLog('Mode: native (default timeout)');
  }
}, 800);

/* Báo parent biết mình ready */
try { window.parent.postMessage({ type: 'vax_ready' }, '*'); } catch(e){}

/* Lắng nghe lệnh từ parent */
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
  /* JW control commands — chỉ khi web mode */
  if (__vaxMode === 'web') {
    jwCmd(d.vaxCmd, d.val);
  } else {
    /* native mode: cho phép toggle/seek/etc điều khiển <video> như cũ */
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

/* CSS: chỉ che nhẹ để JW hiện được */
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

/* ⭐ Block devtoolsDetector (nếu không bị block sẽ redirect about:blank) */
try {
  var _fakeDtd = { launch:function(){}, addListener:function(){}, on:function(){}, isOpen:function(){ return false; } };
  Object.defineProperty(window, 'devtoolsDetector', {
    configurable: true,
    get: function(){ return _fakeDtd; },
    set: function(){}
  });
  bridgeLog('🚫 devtoolsDetector blocked');
} catch(e) { bridgeLog('dtd block fail: ' + e.message); }

/* ═══════════════════════════════════════════════════════════════
   SNIFFER — giữ nguyên logic cũ cho native
   Chỉ dispatch khi mode === 'native' (hoặc chưa biết → default native)
   ═══════════════════════════════════════════════════════════════ */
(function initLocalBlobSniffer() {
  if (window.__BLOB_SNIFFER_INITIALIZED__) return;
  window.__BLOB_SNIFFER_INITIALIZED__ = 1;

  var hasDispatchedAny = 0;
  var isFinished = 0;
  var timeoutTimer = null;

  bridgeLog("Đang tiến hành tìm link Video, xin chờ....", true);

  timeoutTimer = setTimeout(function() {
    if (hasDispatchedAny === 0 && isFinished === 0 && __vaxMode !== 'web') {
      isFinished = 1;
      bridgeLog("❌ [TIMEOUT] không tìm thấy Blob M3U8!", false);
      bridgeLog("Không tìm thấy link video (Hết thời gian 20s).", true);
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
    return t.indexOf('#EXTM3U') === 0 &&
          (t.indexOf('#EXTINF') !== -1 || t.indexOf('#EXT-X-STREAM-INF') !== -1);
  }

  function getServerMapping() {
    var mapping = {};
    try {
      var rawHtml = document.documentElement.outerHTML || document.body.innerHTML || "";
      var matches = rawHtml.match(/\\bx\\d{3}\\b/gi) || [];
      for (var i = 0; i < matches.length; i++) {
        var code = matches[i].toLowerCase();
        if (/^x30/i.test(code)) { mapping['tm2'] = code; mapping['nam'] = code; }
        else if (/^x20/i.test(code)) { mapping['tm1'] = code; }
        else if (/^x10/i.test(code)) { mapping['raw'] = code; mapping['origin'] = code; }
      }
    } catch (e) { bridgeLog('MAP err: ' + e.message); }
    return mapping;
  }

  function processAndReplaceM3u8Server(m3u8Content, requestedTm) {
    if (!requestedTm) return m3u8Content;
    var mapping = getServerMapping();
    var targetKey = requestedTm.toLowerCase();
    var targetServerCode = mapping[targetKey];
    bridgeLog('MAP: ' + JSON.stringify(mapping));
    if (!targetServerCode) {
      bridgeLog('Không tìm thấy server khớp "' + requestedTm + '"');
      return m3u8Content;
    }
    var currentMatch = m3u8Content.match(/(x\\d+)\\.vicdn\\.cc/i);
    var currentServerCode = currentMatch ? currentMatch[1] : null;
    if (currentServerCode) {
      bridgeLog('🔄 Đổi: ' + currentServerCode + ' ➡️ ' + targetServerCode + ' (' + requestedTm + ')');
    }
    return m3u8Content.replace(/(x\\d+)(\\.vicdn\\.cc)/gi, targetServerCode + '$2');
  }

  function dispatchM3u8ToApp(m3u8Content) {
    /* ⭐ Chỉ dispatch khi native (web giữ iframe JW điều khiển) */
    if (__vaxMode === 'web') {
      bridgeLog('Web mode → bỏ qua sniffer dispatch');
      return;
    }
    if (!m3u8Content || hasDispatchedAny === 1) return;
    hasDispatchedAny = 1;
    isFinished = 1;
    stopTimeout();
    bridgeLog('🎯 [LOCAL-DISPATCH] Bắt M3U8! Đổi server...');
    var requestedTm = "${tm || 'raw'}";
    var finalM3u8 = processAndReplaceM3u8Server(m3u8Content, requestedTm);
    bridgeLog("🎯 Đang gửi native...", true);
    try {
      SnifferBridge.playM3u8Content(finalM3u8, JSON.stringify({"Origin":"https://phim.nguonc.com","Referer":"${referer}"}));
    } catch(e) { bridgeLog('❌ dispatch err: ' + e.message); }
  }

  /* Hook URL.createObjectURL */
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
      bridgeLog('🚀 Hook URL.createObjectURL OK');
    }
  } catch (e) { bridgeLog('INIT err: ' + e.message); }
})();
/* ═══════════════════════════════════════════════════════════════
   PROXY FETCH — bypass CORS cho file mã hóa .html
   Player fetch vicdn.cc/hls/*.html và /subtitle/*.html để decrypt.
   Từ iframe sandbox → CORS block. Rewrite qua worker proxy.
   ═══════════════════════════════════════════════════════════════ */
(function initProxyFetch() {
  if (window.__VAX_PROXY_FETCH__) return;
  window.__VAX_PROXY_FETCH__ = 1;

  var PROXY = 'https://streamfile.alokillgtv04.workers.dev/proxy';
  var REF = 'https://vicdn.cc';

  function shouldProxy(u) {
    if (!u || typeof u !== 'string') return false;
    return /vicdn\.cc\/(hls|subtitle|vtt)\//i.test(u);
  }
  function toProxy(u) {
    return PROXY + '?url=' + encodeURIComponent(u) + '&referer=' + REF;
  }

  /* Hook fetch */
  try {
    var rawFetch = window.fetch;
    window.fetch = function(input, init) {
      var u = typeof input === 'string' ? input : (input && input.url);
      if (shouldProxy(u)) {
        var newU = toProxy(u);
        bridgeLog('🌐 [PROXY-FETCH] ' + u.slice(-70));
        if (typeof input === 'string') return rawFetch.call(this, newU, init);
        try { return rawFetch.call(this, new Request(newU, input)); }
        catch(e) { return rawFetch.call(this, newU, init); }
      }
      return rawFetch.apply(this, arguments);
    };
    bridgeLog('🚀 [PROXY] Hook fetch OK');
  } catch(e) { bridgeLog('❌ proxy fetch hook: ' + e.message); }

  /* Hook XHR */
  try {
    var rawOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      if (shouldProxy(url)) {
        var newU = toProxy(url);
        bridgeLog('🌐 [PROXY-XHR] ' + url.slice(-70));
        arguments[1] = newU;
      }
      return rawOpen.apply(this, arguments);
    };
    bridgeLog('🚀 [PROXY] Hook XHR OK');
  } catch(e) { bridgeLog('❌ proxy xhr hook: ' + e.message); }
})();


/* ═══════════════════════════════════════════════════════════════
   JW PLAYER CONTROL — chỉ bật khi web mode
   ═══════════════════════════════════════════════════════════════ */
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
  bridgeLog('✅ Bound JW Player (web mode)', true);

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
    else if (c === 'scale') { /* no-op cho JW */ }
  } catch(e) { bridgeLog('jwCmd err: ' + e.message); }
}

/* Nếu vì lý do nào đó parent không gửi setMode nhưng đã web (window.parent có VaxSub)
   thì vẫn bind JW sau timeout dự phòng */
setTimeout(function() {
  if (__vaxMode === 'web' && !__jwBound) {
    var tries = 0;
    var iv = setInterval(function() {
      if (bindJwCtrl() || ++tries > 50) clearInterval(iv);
    }, 200);
  }
}, 1500);
  `
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

function getLISTmenu() {
    return `[{\"link\":\"/type/hoat-hinh/\",\"name\":\"Hoạt Hình\"},{\"link\":\"/type/vien-tuong/\",\"name\":\"Viễn Tưởng\"},{\"link\":\"/type/hinh-su/\",\"name\":\"Hình Sự\"},{\"link\":\"/type/bi-an/\",\"name\":\"Bí Ẩn\"},{\"link\":\"/type/hanh-dong/\",\"name\":\"Hành Động\"}]`;
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


function _$(param) {
    // -------------------------------------------------------------
    // 1. HELPER PARSER & UTILS
    // -------------------------------------------------------------
    function parseHTML(htmlString) {
        let nodes = [];
        let root = { id: 0, tag: "ROOT", attrs: {}, childrenIds: [], parentId: null };
        nodes.push(root);

        try {
            let html = (htmlString || "").trim();
            if (!html) return { root, nodes };

            const VOID_TAGS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
            let stack = [0];
            let tagRegex = /<(?:\/([a-zA-Z0-9_-]+)|([a-zA-Z0-9_-]+)([^>]*?)(\/)?)\s*>/g;
            
            let lastIndex = 0;
            let match;
            let maxIter = 50000;
            let iter = 0;

            while ((match = tagRegex.exec(html)) !== null && iter++ < maxIter) {
                let textBefore = html.slice(lastIndex, match.index).trim();
                let parentId = stack[stack.length - 1];

                if (textBefore) {
                    let textId = nodes.length;
                    nodes.push({ id: textId, tag: "#text", text: textBefore, attrs: {}, childrenIds: [], parentId: parentId });
                    nodes[parentId].childrenIds.push(textId);
                }

                lastIndex = tagRegex.lastIndex;
                let isCloseTag = !!match[1];
                let tagName = (match[1] || match[2] || "").toLowerCase();
                let attrStr = match[3] || "";
                let isSelfClosing = !!match[4] || VOID_TAGS.has(tagName);

                if (isCloseTag) {
                    for (let i = stack.length - 1; i > 0; i--) {
                        if (nodes[stack[i]].tag === tagName) {
                            stack.splice(i);
                            break;
                        }
                    }
                } else {
                    let attrs = {};
                    let attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
                    let attrMatch;
                    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
                        attrs[attrMatch[1].toLowerCase()] = attrMatch[2] || attrMatch[3] || attrMatch[4] || "";
                    }

                    let nodeId = nodes.length;
                    let node = { id: nodeId, tag: tagName, attrs: attrs, childrenIds: [], parentId: parentId };
                    nodes.push(node);
                    nodes[parentId].childrenIds.push(nodeId);

                    if (!isSelfClosing) {
                        stack.push(nodeId);
                    }
                }
            }

            let remainingText = html.slice(lastIndex).trim();
            if (remainingText && stack.length > 0) {
                let parentId = stack[stack.length - 1];
                let textId = nodes.length;
                nodes.push({ id: textId, tag: "#text", text: remainingText, attrs: {}, childrenIds: [], parentId: parentId });
                nodes[parentId].childrenIds.push(textId);
            }
        } catch (err) {
            if (typeof window !== "undefined" && window.log) window.log("parseHTML error: " + err.message);
        }
        return { root, nodes };
    }

    function getNodeText(node, nodes, depth) {
        if (!node || (depth || 0) > 20) return "";
        if (node.tag === "#text") return node.text || "";
        let text = "";
        if (node.childrenIds) {
            for (let cid of node.childrenIds) {
                text += getNodeText(nodes[cid], nodes, (depth || 0) + 1) + " ";
            }
        }
        return text.trim();
    }

    // -------------------------------------------------------------
    // 2. QUERY ENGINE & SELECTOR MATCHING
    // -------------------------------------------------------------
    function matchSingleSelector(node, sel, nodes) {
        if (!node || node.tag === "#text" || node.tag === "ROOT") return false;

        let cleanSel = sel;
        
        // 1. Tách pseudo positional (:first, :last, :eq)
        cleanSel = cleanSel.replace(/:first|:last|:eq\([0-9]+\)/gi, "").trim();

        // 2. Tách pseudo :content(...)
        let pseudoContentArg = null;
        let contentMatch = cleanSel.match(/:content\((['"]?)(.*?)\1\)/i);
        if (contentMatch) {
            pseudoContentArg = contentMatch[2];
            cleanSel = cleanSel.replace(contentMatch[0], "").trim();
        }

        // 3. Khớp Selector gốc
        if (cleanSel && cleanSel !== "*") {
            let tagMatch = cleanSel.match(/^[a-zA-Z0-9_-]+/);
            if (tagMatch && node.tag !== tagMatch[0].toLowerCase()) return false;

            let idMatch = cleanSel.match(/#([a-zA-Z0-9_-]+)/);
            if (idMatch && (!node.attrs || node.attrs.id !== idMatch[1])) return false;

            // Class matching (hỗ trợ Tailwind)
            let classMatches = cleanSel.match(/\.([a-zA-Z0-9_\-\/\\:]+)/g);
            if (classMatches) {
                if (!node.attrs || !node.attrs.class) return false;
                let elClasses = node.attrs.class.split(/\s+/);
                for (let c of classMatches) {
                    let targetClass = c.substring(1);
                    if (!elClasses.includes(targetClass)) return false;
                }
            }

            let attrMatch = cleanSel.match(/\[([a-zA-Z0-9_-]+)(?:=['"]?(.*?)['"]?)?\]/);
            if (attrMatch) {
                let attrName = attrMatch[1].toLowerCase();
                let attrVal = attrMatch[2];
                if (!node.attrs || !(attrName in node.attrs)) return false;
                if (attrVal !== undefined && node.attrs[attrName] !== attrVal) return false;
            }
        }

        if (pseudoContentArg !== null) {
            let fullText = getNodeText(node, nodes, 0);
            let keywords = pseudoContentArg.split("|").map(k => k.trim().toLowerCase());
            let found = keywords.some(kw => fullText.toLowerCase().includes(kw));
            if (!found) return false;
        }

        return true;
    }

    function querySelectorAllSingleLevel(startNode, selector, nodes) {
        let results = [];
        function search(currentId, depth) {
            if (depth > 50) return;
            let current = nodes[currentId];
            if (!current) return;

            if (current.tag !== "ROOT" && current.tag !== "#text" && current.id !== startNode.id) {
                if (matchSingleSelector(current, selector, nodes)) {
                    results.push(current);
                }
            }
            if (current.childrenIds) {
                for (let cid of current.childrenIds) {
                    search(cid, depth + 1);
                }
            }
        }
        search(startNode.id, 0);

        if (selector.indexOf(":first") !== -1) return results.slice(0, 1);
        if (selector.indexOf(":last") !== -1) return results.slice(-1);
        
        let eqMatch = selector.match(/:eq\(([0-9]+)\)/i);
        if (eqMatch) {
            let idx = parseInt(eqMatch[1], 10);
            return results[idx] ? [results[idx]] : [];
        }

        return results;
    }

    function querySelectorAll(startNode, selector, nodes) {
        try {
            if (!startNode || !selector) return [];

            if (selector.indexOf(',') !== -1) {
                let groupSelectors = selector.split(',').map(s => s.trim());
                let resMap = new Map();
                for (let gSel of groupSelectors) {
                    let subRes = querySelectorAll(startNode, gSel, nodes);
                    for (let r of subRes) resMap.set(r.id, r);
                }
                return Array.from(resMap.values());
            }

            let spaceParts = selector.trim().split(/\s+/);
            if (spaceParts.length > 1) {
                let currentNodes = [startNode];
                for (let part of spaceParts) {
                    let nextLevelNodes = [];
                    let addedIds = new Set();
                    for (let cNode of currentNodes) {
                        let subResults = querySelectorAllSingleLevel(cNode, part, nodes);
                        for (let r of subResults) {
                            if (!addedIds.has(r.id)) {
                                addedIds.add(r.id);
                                nextLevelNodes.push(r);
                            }
                        }
                    }
                    currentNodes = nextLevelNodes;
                    if (currentNodes.length === 0) break;
                }
                return currentNodes;
            }

            return querySelectorAllSingleLevel(startNode, selector, nodes);
        } catch (err) {
            return [];
        }
    }

    // -------------------------------------------------------------
    // 3. MINIJQ CLASS CONSTRUCTOR & PROTOTYPE
    // -------------------------------------------------------------
    function MiniJQ(elements, nodesStore) {
        this.elements = Array.isArray(elements) ? elements : (elements ? [elements] : []);
        this.nodes = nodesStore || [];
        this.length = this.elements.length;
    }

    MiniJQ.prototype = {
        find: function(selector) {
            if (this.elements.length === 0) return new MiniJQ([], this.nodes);
            let matched = [];
            let addedIds = new Set();
            for (let el of this.elements) {
                let res = querySelectorAll(el, selector, this.nodes);
                for (let r of res) {
                    if (!addedIds.has(r.id)) {
                        addedIds.add(r.id);
                        matched.push(r);
                    }
                }
            }
            return new MiniJQ(matched, this.nodes);
        },

        text: function() {
            if (this.elements.length === 0) return "";
            return getNodeText(this.elements[0], this.nodes, 0);
        },

        html: function() {
            if (this.elements.length === 0) return "";
            let self = this;
            let serialize = function(nodeId, depth) {
                if (depth > 20) return "";
                let node = self.nodes[nodeId];
                if (!node) return "";
                if (node.tag === "#text") return node.text || "";
                let attrs = Object.entries(node.attrs || {}).map(([k, v]) => ` ${k}="${v}"`).join("");
                let childrenHTML = (node.childrenIds || []).map(cid => serialize(cid, depth + 1)).join("");
                return `<${node.tag}${attrs}>${childrenHTML}</${node.tag}>`;
            };
            return (this.elements[0].childrenIds || []).map(cid => serialize(cid, 0)).join("");
        },

        attr: function(name, value) {
            if (value !== undefined) {
                for (let el of this.elements) {
                    if (el && el.tag !== "#text") {
                        if (!el.attrs) el.attrs = {};
                        el.attrs[name] = value;
                    }
                }
                return this;
            }
            if (this.elements.length === 0 || !this.elements[0].attrs) return "";
            return this.elements[0].attrs[name] || "";
        },

        each: function(callback) {
            if (typeof callback !== 'function') return this;
            this.elements.forEach((el, index) => {
                let jqEl = new MiniJQ([el], this.nodes);
                callback.call(jqEl, index, jqEl);
            });
            return this;
        },

        textAll: function(delimiter) {
            if (delimiter === undefined) delimiter = " ";
            let texts = [];
            for (let el of this.elements) {
                texts.push(getNodeText(el, this.nodes, 0));
            }
            return texts.join(delimiter);
        },

        first: function() {
            return new MiniJQ(this.elements.length > 0 ? [this.elements[0]] : [], this.nodes);
        },

        last: function() {
            return new MiniJQ(this.elements.length > 0 ? [this.elements[this.elements.length - 1]] : [], this.nodes);
        },

        eq: function(index) {
            return new MiniJQ(this.elements[index] ? [this.elements[index]] : [], this.nodes);
        },

        parent: function() {
            let parents = [];
            let addedIds = new Set();
            for (let el of this.elements) {
                if (el && el.parentId !== null && el.parentId !== 0) {
                    let pNode = this.nodes[el.parentId];
                    if (pNode && !addedIds.has(pNode.id)) {
                        addedIds.add(pNode.id);
                        parents.push(pNode);
                    }
                }
            }
            return new MiniJQ(parents, this.nodes);
        },

        next: function() {
            let nexts = [];
            for (let el of this.elements) {
                if (!el || el.parentId === null) continue;
                let pNode = this.nodes[el.parentId];
                if (!pNode) continue;

                let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
                let idx = siblings.findIndex(s => s.id === el.id);
                if (idx !== -1 && idx + 1 < siblings.length) {
                    nexts.push(siblings[idx + 1]);
                }
            }
            return new MiniJQ(nexts, this.nodes);
        },

        before: function() {
            let befores = [];
            for (let el of this.elements) {
                if (!el || el.parentId === null) continue;
                let pNode = this.nodes[el.parentId];
                if (!pNode) continue;

                let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
                let idx = siblings.findIndex(s => s.id === el.id);
                if (idx > 0) {
                    befores.push(siblings[idx - 1]);
                }
            }
            return new MiniJQ(befores, this.nodes);
        },

        after: function() {
            return this.next();
        },

        closest: function(selector) {
            let matched = [];
            let addedIds = new Set();
            for (let el of this.elements) {
                let currParentId = el.parentId;
                let depth = 0;
                while (currParentId !== null && currParentId !== 0 && depth++ < 30) {
                    let curr = this.nodes[currParentId];
                    if (!curr) break;
                    if (matchSingleSelector(curr, selector, this.nodes)) {
                        if (!addedIds.has(curr.id)) {
                            addedIds.add(curr.id);
                            matched.push(curr);
                        }
                        break;
                    }
                    currParentId = curr.parentId;
                }
            }
            return new MiniJQ(matched, this.nodes);
        }
    };

    // -------------------------------------------------------------
    // 4. MAIN ENTRY POINT LOGIC FOR _$
    // -------------------------------------------------------------
    try {
        if (!param) return new MiniJQ([], []);
        if (param instanceof MiniJQ) return param;
        if (typeof param === "string") {
            let parsed = parseHTML(param);
            return new MiniJQ(parsed.root, parsed.nodes);
        }
        return new MiniJQ(param, []);
    } catch (err) {
        return new MiniJQ([], []);
    }
}

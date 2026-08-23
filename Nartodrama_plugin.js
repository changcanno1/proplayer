var BASEURL = "https://nartodrame.alokillgtv.workers.dev"; 
var DEV = false;

function getManifest() {
    return JSON.stringify({
        "id": "nartodrama",
        "name": "Phim Ngắn Narto",
        "description": "Phim Ngắn lồng tiếng vietsub hay",
        "version": "1.1.9",
        "info": "Nguồn phim ngắn siêu hay, một vài bộ phim nên xem theo chiều dọc. App có hỗ trợ nhé. Hãy nhấn thử lại nếu không tải được video.",
        "baseUrl": "https://nartodrame.alokillgtv.workers.dev",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/nartodrama.png",
        "isEnabled": true,
        "author": "Alokillgtv",
        "type": "shortfilm",
        "playerType": "exoplayer",
        "subtitleCat": true
    })
};

function log(msg) {
  	if(DEV){
      if (typeof nativeLog !== 'undefined') {
          nativeconsole.log("[" + BASEURL.replace(/^(https?:\/\/)?(www\.)?/, "") + "]: " + msg);
      } else if (typeof console !== 'undefined' && console.log) {
          console.log("[" + BASEURL.replace(/^(https?:\/\/)?(www\.)?/, "") + "]: " + msg);
      }
    }
}

function getHomeSections() {
    try {
        // Lấy danh sách các thể loại từ getLISTmenu
        var listCategoryStr = getLISTmenu();
        var listCategory = JSON.parse(listCategoryStr);
        
        // Thêm mục Phim Mới vào đầu danh sách để hiện trên cùng ở Trang Chủ
        listCategory.unshift({
            "link": "/?lang=vi-VN",
            "name": "Phim Mới"
        });
        
        // Build menu dưới dạng Grid (true)
        var menulist = buildMenu(JSON.stringify(listCategory), true);
        return JSON.stringify(menulist);
    } catch (e) {
        console.log("getHomeSections[err]:\n " + e);
        return JSON.stringify([]);
    }
}

function getPrimaryCategories() {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        console.log("getPrimaryCategories[err]:\n " + e);
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
        console.log("getFilterConfig[err]:\n " + e);
        return JSON.stringify({ category: [] });
    }
}

// =============================================================================
// HELPER: CURSOR BASE64 ENCODE / DECODE
// =============================================================================
function getUrlList(slug, filtersJson) {
    try {
        console.log("getUrlList[url]: \n" + slug);

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
                        console.log("getUrlList[url]: \n" + resSearch);
                        return resSearch;
                    }
                } catch (jsonErr) {}
            }
            console.log("getUrlList[url]: \n" + slug);
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

        var resultUrl = BASEURL;
        if (path) {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }

        if (page > 1 && resultUrl.indexOf("page=") === -1) {
            var separator = resultUrl.indexOf("?") > -1 ? "&" : "?";
            resultUrl += separator + "page=" + page;
        }

        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        console.log("getUrlList[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        console.log("getUrlList[err]:\n " + e);
        if (slug && slug.indexOf("http") > -1) {
            console.log("getUrlList[url]: \n" + slug);
            return slug;
        }
        var fallback = BASEURL + (slug ? (slug.indexOf("/") === 0 ? slug : "/" + slug) : "");
        var finalFallback = fallback.replace(/([^:]\/)\/+/g, "$1");
        console.log("getUrlList[url]: \n" + finalFallback);
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
        var resultUrl = BASEURL + "/search?lang=vi-VN&q=" + encodedKeyword;

        if (page > 1) {
            resultUrl += "&page=" + page;
        }

        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        console.log("getUrlSearch[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        console.log("getUrlSearch[err]:\n " + e);
        var fallback = BASEURL + "/search?lang=vi-VN&q=" + encodeURIComponent(keyword || "");
        var finalFallback = fallback.replace(/([^:]\/)\/+/g, "$1");
        console.log("getUrlSearch[url]: \n" + finalFallback);
        return finalFallback;
    }
}

function getUrlDetail(slug) {
    try {
        console.log("getUrlDetail[url]: \n" + slug);
        if (!slug) return "";
        if (slug.indexOf('http') === 0) return slug;
        var detailUrl = BASEURL + "/" + slug;
        console.log("getUrlDetail[url]: \n" + detailUrl);
        return detailUrl;
    } catch (e) {
        console.log("getUrlDetail[err]:\n " + e);
        return "";
    }
}

function getUrlCategories() { 
    try {
        console.log("getUrlCategories[url]: \n" + BASEURL);
        return BASEURL; 
    } catch (e) {
        console.log("getUrlCategories[err]:\n " + e);
        return "";
    }
}

function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================
function decodeHTMLtext(str) {
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
          console.log("decodeHTMLEntities[err]:\n " + e);
      }
  }

function parseListResponse(html, $url) {
    try {
        console.log("parseListResponse[url]: \n" + $url);
        var items = [];
        _$(html).find("article[class*='card']").each(function() {
            var href = this.attr("data-watch-url");
            if (href.indexOf("http") == -1) {
                href = BASEURL + href;
            }
            href = href.replace(/(^[\s\S]*?)\?[\s\S]*$/i,"$1/1?lang=vi-VN");
            var title = decodeHTMLtext(this.attr("data-movie-title"));
            if(!title){
              title = decodeHTMLtext(this.attr("data-search-title"));
            }
            var src = this.find("img").attr("src");
            if (src.indexOf("http") == -1) {
                src = BASEURL + src;
            }
            var episode_current = this.find(".episode-badge").text();
            if (href && href.indexOf("http") > -1 && href.indexOf("watch/") > -1 ) {
                var cleanThumb = src.replace(/&amp;/g, '&');
                items.push({
                    "id": href,
                    "title": title.trim().replace(/dubbing|dubbed/i, "Lồng Tiếng").replace("&quot;",""),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": "",
                    "lang": "",
                    "episode_current": episode_current
                });
            }
        });
        
        var $return = JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 999
            }
        });
      console.log("return1:\n" + $return)
      return $return
    } catch (e) {
        console.log("parseListResponse[err]:\n " + e);
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

function parseSearchResponse(html, url) {
    try {
        console.log("parseSearchResponse[url]: \n" + url);
        return parseListResponse(html, url);
    } catch (e) {
        console.log("parseSearchResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseMovieDetail(html, url) {
    try {
        console.log("parseMovieDetail[url]: \n" + url);
        
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        var id = idMatch ? idMatch[1] : (url || "");

        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/_.]+)/.exec(html);
            slug = slugMatch2 ? slugMatch2[1] : "";
        }

        console.log("Lượt 1 lấy thông tin");
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
  
        var rmatch = html.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lurl = rmatch[1];
  
        rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];
  
        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = decodeHTMLtext(rmatch[1]);
        lname = lname.replace(/dubbing|dubbed/i, "Lồng Tiếng").replace("&quot;","");
        
        rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = decodeHTMLtext(rmatch[1]);
        
        var year = 2026;
        category = _$(html).find(".movie-tag-pill").textAll(" - ");
        episode_current = _$(html).find(".movie-sub").text();
        
        var rawScript = _$(html).find('script:content("episodeItemsRaw = [{")').html();
        var $objepi = [];
        var episodes = rawScript ? rawScript.match(/(?:const|let|var)\s+episodeItemsRaw\s*=\s*(\[[\s\S]*?\])(?:;|\n|$)/i) : null;
        
        if (episodes && episodes[1]) {
            try {
                $objepi = JSON.parse(episodes[1]);
            } catch(err) {}
        }
        
        var matchMax = url.match(/maxfile=(\d+)/i);
        var maxEpi = $objepi.length > 0 ? $objepi.length : (matchMax ? parseInt(matchMax[1], 10) : 1);

        var servers = [];

        var urlmatch = "";
        if (id.indexOf("/detail/watch/") > -1) {
            urlmatch = id.match(/(?<=\/watch\/)[^/]+/i);
            urlmatch[0] = "watch/" + urlmatch[0].replace(/\/(\d+)$/g, "");
        } else {
            urlmatch = id.match(/(?<=\/detail\/)[^?]+/i);
            urlmatch[0] = urlmatch[0].replace(/\/(\d+)$/g, "");
        }
        var slugVal = urlmatch[0];
        
        var items = [];
        var linkFull = "https://edge.narto-drama.com/e/rs/detail/" + slugVal + "/1/refresh-source?lang=vi-VN&rs_sid=hgsleaj5&force=1" + "&fulltap=true&maxfile=" + maxEpi + "&slug=" + slugVal;
        
        // Chỉ để lại lựa chọn "Nối Thành 1 Tập"
        servers.push({
            name: "Server 1 Tập",
            episodes: [{
                name: "Nối Thành 1 Tập",
                id: linkFull ,
                slug: "tap-full"
            }]
        });
        
        for (var $j = 0; $j < maxEpi; $j++) {
            var $number = ($j + 1);
            var link = "https://edge.narto-drama.com/e/rs/detail/" + slugVal + "/" + $number + "/refresh-source?lang=vi-VN&force=1&rs_sid=hgsleaj5";

            items.push({
                id: link,
                name: "Tập " + $number,
                slug: "Tap-" + $number
            });
        }
        
        servers.push({
            name: "Server Chia Tập",
            episodes: items
        });
        
        var $return = JSON.stringify({
            id: id,
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
            extra: ""
        });
        
        console.log("Return Success:\n" + $return);
        return $return;
        
    } catch (e) {
        console.log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: slug || url || "error",
            title: "error",
            servers: []
        });
    }
}

function htmlload(videosrc, subtitle, linkpost, postbody, customHeaders = {}, rawbackup = "") {
  console.log("Stream html:\n" + videosrc);
  const mergedHeaders = Object.assign({
    'Referer': 'https://nartodrama.com/',
    'Origin': 'https://nartodrama.com/'
  }, customHeaders);

  const isMp4 = !videosrc.includes('.m3u8') && (videosrc.includes('.mp4') || !videosrc.includes('m3u'));

  if (isMp4) {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>MP4 Player</title>
    <style>
        *{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif}
        body{background:#000;height:100vh;display:flex;justify-content:center;align-items:center;color:#f8fafc;overflow:hidden}
        .black-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:5;transition:opacity 0.5s ease}
        .black-overlay.hidden{opacity:0;pointer-events:none;display:none}
        .card{background:rgba(15,23,42,0.98);border:1px solid rgba(56,189,248,0.3);padding:30px 24px;border-radius:20px;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.9);z-index:10;max-width:440px;width:90%;transition:opacity 0.5s ease,transform 0.5s ease}
        .card.hidden{opacity:0;transform:scale(0.95);pointer-events:none;display:none}
        .videoplayer{width:100vw;height:100vh;position:fixed;top:0;left:0;right:0;bottom:0;background:#000;display:flex;justify-content:center;align-items:center;z-index:1;overflow:hidden}
        .videoplayer video{width:100%;height:100%;object-fit:fill}
        video::-webkit-media-controls-fullscreen-button { display: none !important; }
        .spinner{width:45px;height:45px;border:4px solid rgba(255,255,255,0.1);border-top:4px solid #38bdf8;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 15px auto}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        .loading-title{font-size:17px;font-weight:600;color:#fff;margin-bottom:10px}
        .loading-desc{font-size:13px;color:#cbd5e1;line-height:1.5}
        .loading-progress{margin-top:15px;font-size:14px;color:#38bdf8;font-weight:600}
    </style>
</head>
<body>
    <div class="black-overlay" id="blackOverlay"></div>
    <div class="card" id="loadingCard">
        <div class="spinner"></div>
        <div class="loading-title">Thông báo</div>
        <div class="loading-desc">Phim dùng định dạng MP4 trực tiếp.<br>Đang chuẩn bị phát...</div>
        <div class="loading-progress" id="text">Đang chuẩn bị... 0%</div>
    </div>
    <div class="videoplayer" id="playerContainer">
      <video id="myVideo" controls playsinline webkit-playsinline disablepictureinpicture controlsList="nofullscreen nodownload" preload="auto">Trình duyệt không hỗ trợ thẻ video.</video>
    </div>
    <script>
        const video = document.getElementById('myVideo');
        const loadingCard = document.getElementById('loadingCard');
        const blackOverlay = document.getElementById('blackOverlay');
        const textEl = document.getElementById('text');

        video.requestFullscreen = function() {};
        if (video.webkitRequestFullscreen) video.webkitRequestFullscreen = function() {};
        if (video.webkitEnterFullscreen) video.webkitEnterFullscreen = function() {};

        const mainSrc = ${JSON.stringify(videosrc)};
        const backupSrc = ${JSON.stringify(rawbackup)};
        let currentSrc = mainSrc;
        let isBackupTried = false;
        let progress = 0;
        let isAllowedToPlay = false;

        function loadVideoSource(src) {
            video.src = src;
            video.load();
        }

        video.addEventListener('error', function() {
            if (!isBackupTried && backupSrc && backupSrc !== mainSrc) {
                isBackupTried = true;
                currentSrc = backupSrc;
                loadVideoSource(backupSrc);
            }
        });

        const watchdog = setInterval(() => {
            if (!isAllowedToPlay && !video.paused) {
                video.pause();
                video.currentTime = 0;
            }
        }, 50);

        const progressInterval = setInterval(() => {
            if (progress < 100) {
                progress += 1;
                textEl.innerText = "Đang chuẩn bị phát... " + progress + "%";
            }
        }, 100);

        loadVideoSource(mainSrc);

        setTimeout(() => {
            clearInterval(progressInterval);
            clearInterval(watchdog);
            isAllowedToPlay = true;
            loadingCard.classList.add('hidden');
            blackOverlay.classList.add('hidden');
            video.play().catch(e => {});
        }, 10000);
    </script>
</body>
</html>`;
  }
}

function parseDetailResponse(html, url) {
    try {
        console.log("parseDetailResponse[url]: \n" + url);
        
        if (!html || typeof html !== 'string') {
            throw new Error("Phản hồi từ server bị trống hoặc không hợp lệ");
        }

        if(url.indexOf("fulltap") > -1 && url.indexOf("play=true") == -1){
            var slug = url.match(/slug=([^&]+)/i)[1];
            var maxfile = url.match(/maxfile=([^&]+)/i)[1];
            var data = [slug, maxfile];   
            var postbody = BASE64.encode(JSON.stringify(data));
            var clear = "";
            if(url.indexOf("clear=true") > -1){
              clear = "&clear=true"
            }
            var linkpost = "https://script.google.com/macros/s/AKfycbyen58UYqBbf_j2dS55R0yWCQThRL25YhGIoZmY5KRFF131U0HeqVfPb4DJsa4Tlp13/exec?film_url=" + encodeURIComponent(slug) + "&maxfile=" + maxfile + "&slug=" + slug + clear;
            
            var $objmv = JSON.parse(html);
            var rawStream = $objmv.direct_play_url || $objmv.play_url || "";
            var rawbackup = $objmv.play_url || "";
            var $subtitle = $objmv.direct_subtitle_url || "";
            var encode = BASE64.encode(htmlload(rawStream, $subtitle, linkpost, postbody,rawbackup));
            
            var base64 = `https://base64html.alokillgtv.workers.dev/?url=data:text/html;base64,${encode}`;
            console.log("link Post:\n" + linkpost);
            
            var isEmbed = true;
            if(rawStream.includes('mp4')){
              linkpost = base64;
              isEmbed = false;
            }

            var $return = JSON.stringify({
                "url": linkpost,
                "isEmbed": isEmbed,
                "mimeType": "text/html",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                "subtitles": [{
                  lang: "Vietsub",
                  type: "text/vtt",
                  url: linkpost + "&subtitle=true"
                }],
                datasend: encodeURIComponent(linkpost)
            });
            return $return;
        }
        if(url.indexOf("play=true") > -1){
            var slug = url.match(/slug=([^&]+)/i)[1];
            var maxfile = url.match(/maxfile=([^&]+)/i)[1];
            var linkpost = "https://script.google.com/macros/s/AKfycbyen58UYqBbf_j2dS55R0yWCQThRL25YhGIoZmY5KRFF131U0HeqVfPb4DJsa4Tlp13/exec?film_url=" + encodeURIComponent(slug) + "&maxfile=" + maxfile + "&slug=" + slug;
            return JSON.stringify({
                "url": linkpost + "&m3u8=true#.m3u8",
                "isEmbed": false,
                "mimeType": "application/x-mpegURL",
                "headers": {
                    "Referer": typeof BASEURL !== 'undefined' ? BASEURL : "https://edge.narto-drama.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Custom-Js": `SnifferBridge.play("${finalStreamUrl}#.m3u8");SnifferBridge.log("Sniffer: ${finalStreamUrl}")`
                },
                "subtitles": [{
                  lang: "Vietsub",
                  url: linkpost + "&subtitle=true",
                  mimeType: "text/vtt"
                }]
            });
        }
        else {
            var $objmv = JSON.parse(html);
            var rawStream = $objmv.play_url || $objmv.play_url || "";
            var $subtitle = $objmv.direct_subtitle_url || "";
            
            if (!rawStream) {
                throw new Error("Không tìm thấy link stream");
            }
  
            var lowerStream = rawStream.toLowerCase();
            var mimeType = "application/x-mpegURL";
            var finalStreamUrl = rawStream;
            
            if (lowerStream.includes(".mp4") || finalStreamUrl.indexOf("dramabox-stream.narto-drama.com") > -1) {
                mimeType = "video/mp4";
                if (!finalStreamUrl.endsWith("#.m3u8")) {
                    finalStreamUrl += "#.m3u8";
                }
            } 
            else if (lowerStream.includes(".m3u8")) {
                mimeType = "application/x-mpegURL";
            } 
            else {
                mimeType = "application/x-mpegURL";
                if (!finalStreamUrl.endsWith("#.m3u8")) {
                    finalStreamUrl += "#index.m3u8";
                }
            }
  
            var listsub = [];
            if ($subtitle) {
                if (!$subtitle.startsWith("http://") && !$subtitle.startsWith("https://")) {
                    if (!$subtitle.startsWith("/")) {
                        $subtitle = "/" + $subtitle;
                    }
                    $subtitle = BASEURL + $subtitle;
                }
  
                listsub.push({
                    "lang": "Subtitle",
                    "url": $subtitle,
                    "mimeType": "text/vtt"
                });
            }
  
            console.log("parseDetailResponse[url]: \n" + finalStreamUrl);
            return JSON.stringify({
                "url": finalStreamUrl + "#.m3u8",
                "isEmbed": false,
                "mimeType": mimeType,
                "headers": {
                    "Referer": typeof BASEURL !== 'undefined' ? BASEURL : "https://edge.narto-drama.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Custom-Js": `SnifferBridge.play("${finalStreamUrl}#.m3u8");SnifferBridge.log("Sniffer: ${finalStreamUrl}")`
                },
                "subtitles": listsub
            });
          
        }
        
    } catch (e) {
        console.log("parseDetailResponse[err]:\n " + e.message);
        return JSON.stringify({
            "url": "",
            "headers": {}
        });
    }
}

function parseEmbedResponse(html, url, datasend) {
    console.log("Kết quả:\n" + html);
    if (typeof log === "function") log("parseEmbedResponse [url]: " + url);

    try {
        if (!html) {
            throw new Error("Dữ liệu HTML/JSON nhận về bị rỗng");
        }

        var result = {};
        try {
            result = (typeof html === 'object') ? html : JSON.parse(html);
        } catch (jsonErr) {
            throw new Error("Chuỗi HTML không phải là JSON hợp lệ: " + jsonErr.message);
        }

        var link = result.direct_play_url || result.url || result.play_url || result.stream_url || "";
        if (!link) {
            throw new Error("Không tìm thấy đường dẫn video trong phản hồi");
        }

        var decode = "";
        if (datasend) {
            try {
                decode = decodeURIComponent(datasend);
            } catch (uriErr) {
                decode = datasend; 
            }
        }

        var isMp4 = (result.type === "mp4_not_supported") || 
                    (result.status === "error") || 
                    (link.toLowerCase().indexOf(".mp4") > -1);

        var mimeType = "application/x-mpegURL";
        var finalUrl = link;

        if (isMp4 || link.indexOf("dramabox-stream.narto-drama.com") > -1) {
            mimeType = "video/mp4";
            finalUrl = link + "#.m3u8"; 
        } else {
            mimeType = "application/x-mpegURL";
            if (!finalUrl.endsWith("#.m3u8")) {
                finalUrl += "#.m3u8";
            }
        }

        var subtitles = [];
        var subUrl = result.subtitle || result.sub || "";
        if (typeof subUrl === 'string' && subUrl.trim() !== "") {
            subtitles.push({
                lang: "Vietsub",
                url: subUrl.trim(),
                mimeType: "text/vtt"
            });
        }

        var refererHeader = typeof BASEURL !== 'undefined' ? BASEURL : "https://edge.narto-drama.com/";

        var returnObj = {
            url: finalUrl,
            mimeType: mimeType,
            isEmbed: false,
            headers: {
                "Referer": refererHeader,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            subtitles: subtitles
        };

        var $return = JSON.stringify(returnObj);
        console.log("Return Embed:\n" + $return);
        return $return;

    } catch (e) {
        console.log("[Lỗi parseEmbedResponse]: " + (e.message || e));
        return JSON.stringify({ 
            url: "", 
            isEmbed: false, 
            mimeType: "application/x-mpegURL",
            headers: {},
            subtitles: []
        });
    }
}

BASE64 = {
  encode: function (str) {
    try {
      if (!str) return "";

      var utf8Bytes = [];
      for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code < 128) {
          utf8Bytes.push(code);
        } else if (code < 2048) {
          utf8Bytes.push((code >> 6) | 192, (code & 63) | 128);
        } else if (
          (code & 0xfc00) === 0xd800 &&
          i + 1 < str.length &&
          (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00
        ) {
          code =
            0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
          utf8Bytes.push(
            (code >> 18) | 240,
            ((code >> 12) & 63) | 128,
            ((code >> 6) & 63) | 128,
            (code & 63) | 128
          );
        } else {
          utf8Bytes.push(
            (code >> 12) | 224,
            ((code >> 6) & 63) | 128,
            (code & 63) | 128
          );
        }
      }

      var chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var encoded = "";
      var byte1, byte2, byte3;
      var b1, b2, b3, b4;

      for (var j = 0; j < utf8Bytes.length; j += 3) {
        byte1 = utf8Bytes[j];
        byte2 = j + 1 < utf8Bytes.length ? utf8Bytes[j + 1] : NaN;
        byte3 = j + 2 < utf8Bytes.length ? utf8Bytes[j + 2] : NaN;

        b1 = byte1 >> 2;
        b2 = ((byte1 & 3) << 4) | (isNaN(byte2) ? 0 : byte2 >> 4);
        b3 = isNaN(byte2)
          ? 64
          : ((byte2 & 15) << 2) | (isNaN(byte3) ? 0 : byte3 >> 6);
        b4 = isNaN(byte3) ? 64 : byte3 & 63;

        encoded +=
          chars.charAt(b1) +
          chars.charAt(b2) +
          chars.charAt(b3) +
          chars.charAt(b4);
      }

      return encoded;
    } catch (e) {
      console.log("[BASE64.encode Error]:", e.message || e);
      return "";
    }
  },

  decode: function (base64String) {
    try {
      if (!base64String) return "";

      var str = decodeURIComponent(base64String.trim());
      str = str.replace(/-/g, "+").replace(/_/g, "/");

      var chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var output = [];
      var buffer = 0,
        bits = 0;

      for (var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if (char === "=") break; 
        var index = chars.indexOf(char);
        if (index === -1) continue; 

        buffer = (buffer << 6) | index;
        bits += 6;

        if (bits >= 8) {
          bits -= 8;
          output.push((buffer >> bits) & 0xff);
        }
      }

      var result = "";
      var j = 0;
      while (j < output.length) {
        var c = output[j++];
        if (c < 128) {
          result += String.fromCharCode(c);
        } else if (c > 191 && c < 224) {
          var c2 = output[j++];
          result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        } else if (c > 223 && c < 240) {
          var c2 = output[j++];
          var c3 = output[j++];
          result += String.fromCharCode(
            ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
          );
        } else if (c >= 240) {
          var c2 = output[j++];
          var c3 = output[j++];
          var c4 = output[j++];
          var u =
            (((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
            0x10000;
          result += String.fromCharCode(0xd800 + (u >> 10), 0xdc00 + (u & 0x3ff));
        }
      }

      return result;
    } catch (e) {
      console.log("[BASE64.decode Error]:", e.message || e);
      return "";
    }
  }
};

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
        console.log("sortEpisodesByName[err]:\n " + e);
        return data;
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        console.log("parseCategoriesResponse[err]:\n " + e);
        return JSON.stringify([]);
    }
}

function parseCountriesResponse(html) {
    return "[]";
}

function parseYearsResponse(html) {
    return "[]";
}

// Chứa toàn bộ các category bạn yêu cầu
function getLISTmenu() {
    return `[{\"link\":"${BASEURL}/search?lang=vi-VN&q=l%E1%BB%93ng+ti%E1%BA%BFng\",\"name\":\"Lồng Tiếng\"},{\"link\":\"${BASEURL}/search?lang=vi-VN&q=kinh+d%E1%BB%8B\",\"name\":\"Kinh Dị\"},{\"link\":\"${BASEURL}/tag/bi-an-than-phan?lang=vi-VN&tab-provider=bibishort\",\"name\":\"Thân Phận Bí Ẩn\"},{\"link\":\"${BASEURL}/tag/hien-dai?lang=vi-VN&tab-provider=bibishort\",\"name\":\"Hiện Đại\"},{\"link\":\"${BASEURL}/tag/bao-thu?lang=vi-VN&tab-provider=bibishort\",\"name\":\"Báo Thù\"},{\"link\":\"${BASEURL}/tag/co-trang?lang=vi-VN&tab-provider=bibishort\",\"name\":\"Cổ Trang\"},{\"link\":\"${BASEURL}/tag/tinh-cam?lang=vi-VN&tab-provider=bibishort\",\"name\":\"Tình Cảm\"},{\"link\":\"${BASEURL}/tag/xuyen-khong?lang=vi-VN&tab-provider=bibishort\",\"name\":\"Xuyên Không\"},{\"link\":\"${BASEURL}/search?lang=vi-VN&q=t%E1%BB%95ng+t%C3%A0i\",\"name\":\"Tổng Tài\"}]`;
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

function _$(htmlOrBlock){ if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) { return htmlOrBlock; } var instance = { sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '', elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []), length: 0, find: function (selector) { if (selector.indexOf(',') !== -1) { var results = []; var selectors = selector.split(',').map(function (s) { return s.trim(); }); for (var s = 0; s < selectors.length; s++) { if (selectors[s] === "") continue; var subInstance = this.find(selectors[s]); for (var r = 0; r < subInstance.elements.length; r++) { var element = subInstance.elements[r]; if (results.indexOf(element) === -1) { results.push(element); } } } var multiInstance = _$(results); multiInstance.sourceHtml = this.sourceHtml; return multiInstance; } var results = []; var contentFilter = ""; if (selector.indexOf(":content(") !== -1) { var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/); if (contentMatch) { contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || ""; selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/, ""); } } var attrNameFilter = ""; var attrValueFilter = ""; var attrOperator = "="; var hasAttrFilter = false; var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/); if (attrMatch) { hasAttrFilter = true; attrNameFilter = attrMatch[1]; attrOperator = attrMatch[2]; attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || ""; selector = selector.replace(/\[.*?\]/, ""); } var notSelector = ""; if (selector.indexOf(":not(") !== -1) { var notMatch = selector.match(/:not\(([^)]+)\)/); if (notMatch) { notSelector = notMatch[1]; selector = selector.replace(/:not\([^)]+\)/, ""); } } var isFirstFilter = selector.indexOf(":first") !== -1; var isLastFilter = selector.indexOf(":last") !== -1; selector = selector.replace(/:first|:last/g, ""); var targetTagName = ""; var targetId = ""; var targetClasses = []; var selectorToParse = selector.trim(); if (selectorToParse !== "") { var idIndex = selectorToParse.indexOf('#'); if (idIndex !== -1) { var afterId = selectorToParse.substring(idIndex + 1); var nextDot = afterId.indexOf('.'); targetId = nextDot === -1 ? afterId : afterId.substring(0, nextDot); selectorToParse = selectorToParse.substring(0, idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1)); } var classParts = selectorToParse.split('.'); var possibleTag = classParts.shift(); if (possibleTag) { targetTagName = possibleTag.toLowerCase(); } targetClasses = classParts.filter(function (c) { return c.length > 0; }); } for (var i = 0; i < this.elements.length; i++) { var currentHtml = this.elements[i]; var pos = 0; var subResults = []; while ((pos = currentHtml.indexOf('<', pos)) !== -1) { if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') { pos++; continue; } var endOpenTag = -1; var insideQuote = false; var quoteChar = ''; for (var j = pos + 1; j < currentHtml.length; j++) { var char = currentHtml.charAt(j); if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') { if (!insideQuote) { insideQuote = true; quoteChar = char; } else if (char === quoteChar) { insideQuote = false; } } if (char === '>' && !insideQuote) { endOpenTag = j; break; } } if (endOpenTag === -1) break; var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1); var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/); var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : ""; var isMatched = true; if (targetTagName && targetTagName !== currentTagName) { isMatched = false; } var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : ""; var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : ""; if (isMatched && targetId && idMatchStr !== targetId) { isMatched = false; } if (isMatched && targetClasses.length > 0) { if (classMatchStr) { var currentClasses = classMatchStr.trim().split(/\s+/); for (var c = 0; c < targetClasses.length; c++) { if (currentClasses.indexOf(targetClasses[c]) === -1) { isMatched = false; break; } } } else { isMatched = false; } } if (isMatched && hasAttrFilter) { var actualValue = ""; if (attrNameFilter === "class") { actualValue = classMatchStr; } else if (attrNameFilter === "id") { actualValue = idMatchStr; } else { var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : ""; } var attrExists = fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=', 'i')) !== -1; if (!attrExists) { isMatched = false; } else { if (attrOperator === "=") { if (attrNameFilter === "class") { var classes = actualValue.trim().split(/\s+/); if (classes.indexOf(attrValueFilter) === -1) isMatched = false; } else if (actualValue !== attrValueFilter) { isMatched = false; } } else if (attrOperator === "*=") { if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false; } else if (attrOperator === "^=") { if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false; } else if (attrOperator === "$=") { if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false; } } } if (isMatched) { var startTagPos = pos; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var closeRegex = new RegExp('</' + currentTagName + '\\s*>', 'i'); var subHtml = currentHtml.substring(endOpenTag + 1); var matchClose = subHtml.match(closeRegex); if (matchClose) { endTagPos = endOpenTag + 1 + matchClose.index + matchClose[0].length; } else { endTagPos = currentHtml.length; } } var foundBlock = currentHtml.substring(startTagPos, endTagPos); if (contentFilter) { var pureText = ""; if (currentTagName === "script" || currentTagName === "style") { var innerStart = foundBlock.indexOf('>') + 1; var innerEnd = foundBlock.search(/<\/(?:script|style)/i); pureText = innerEnd !== -1 ? foundBlock.substring(innerStart, innerEnd) : foundBlock.substring(innerStart); } else { pureText = foundBlock.replace(/<[^>]+>/g, "").trim(); } var keywords = contentFilter.split('|'); var isContentMatched = false; for (var k = 0; k < keywords.length; k++) { if (pureText.indexOf(keywords[k].trim()) !== -1) { isContentMatched = true; break; } } if (!isContentMatched) { pos = endTagPos; continue; } } if (notSelector) { var isNotClass = notSelector.indexOf('.') === 0; var isNotId = notSelector.indexOf('#') === 0; var notValue = notSelector.substring(1); var hasNot = false; if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true; if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true; if (!hasNot) subResults.push(foundBlock); } else { subResults.push(foundBlock); } pos = endTagPos; } else { pos++; } } if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]]; if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]]; results = results.concat(subResults); } var newInstance = _$(results); newInstance.sourceHtml = this.sourceHtml || currentHtml; return newInstance; }, each: function (callback) { for (var i = 0; i < this.elements.length; i++) { var childInstance = _$(this.elements[i]); childInstance.sourceHtml = this.sourceHtml; callback.call(childInstance, i, this.elements[i]); } return this; }, eq: function (index) { if (index < 0) index = this.elements.length + index; var matchedElement = this.elements[index]; this.elements = matchedElement ? [matchedElement] : []; this.length = this.elements.length; return this; }, attr: function (attrName) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var getAttr = elem.match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : ""; }, html: function () { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var matchClose = elem.match(/<\/([a-zA-Z0-9_-]+)\s*>\s*$/i); if (matchClose) { var end = elem.lastIndexOf(matchClose[0]); if (start > 0 && end >= start) return elem.substring(start, end); } return start > 0 ? elem.substring(start) : ""; }, text: function (separator) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); if (typeof separator === 'string') { return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(separator); } return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); } return ""; }, textAll: function (separator) { if (this.elements.length === 0) return ""; var sep = typeof separator === 'string' ? separator : " "; var allTexts = []; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); var cleanText = pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); if (cleanText !== '') { allTexts.push(cleanText); } } } return allTexts.join(sep); }, next: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx === -1) continue; var scanPos = idx + elem.length; var nextOpen = this.sourceHtml.indexOf('<', scanPos); if (nextOpen !== -1) { if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue; var endOpenTag = this.sourceHtml.indexOf('>', nextOpen); if (endOpenTag === -1) continue; var fullOpenTag = this.sourceHtml.substring(nextOpen, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var startTagPos = nextOpen; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var closeRegex = new RegExp('</' + currentTagName + '\\s*>', 'i'); var subHtml = this.sourceHtml.substring(endOpenTag + 1); var matchClose = subHtml.match(closeRegex); if (matchClose) { endTagPos = endOpenTag + 1 + matchClose.index + matchClose[0].length; } else { endTagPos = this.sourceHtml.length; } } results.push(this.sourceHtml.substring(startTagPos, endTagPos)); } } var nextInstance = _$(results); nextInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, parent: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx <= 0) continue; var scanPos = idx - 1; while (scanPos >= 0) { var openTagPos = this.sourceHtml.lastIndexOf('<', scanPos); if (openTagPos === -1) break; if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this.sourceHtml.charAt(openTagPos + 1) !== '!') { var endOpenTag = this.sourceHtml.indexOf('>', openTagPos); if (endOpenTag !== -1 && endOpenTag > openTagPos) { var fullOpenTag = this.sourceHtml.substring(openTagPos, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var closeRegex = new RegExp('</' + currentTagName + '\\s*>', 'i'); var subHtml = this.sourceHtml.substring(endOpenTag + 1); var matchClose = subHtml.match(closeRegex); if (matchClose) { endTagPos = endOpenTag + 1 + matchClose.index + matchClose[0].length; } else { endTagPos = this.sourceHtml.length; } } if (endTagPos >= idx + elem.length) { var parentBlock = this.sourceHtml.substring(openTagPos, endTagPos); if (results.indexOf(parentBlock) === -1) results.push(parentBlock); break; } } } scanPos = openTagPos - 1; } } var parentInstance = _$(results); parentInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, closest: function (selector) { var results = []; if (!this.sourceHtml || this.elements.length === 0) return _$([]); for (var i = 0; i < this.elements.length; i++) { var currentElem = this.elements[i]; var currentObj = _$(currentElem); currentObj.sourceHtml = this.sourceHtml; var selfCheck = _$(this.sourceHtml).find(selector); var isSelfMatched = false; for (var s = 0; s < selfCheck.elements.length; s++) { if (selfCheck.elements[s] === currentElem) { isSelfMatched = true; break; } } if (isSelfMatched) { if (results.indexOf(currentElem) === -1) results.push(currentElem); continue; } var parentObj = currentObj.parent(); while (parentObj.elements.length > 0) { var parentElem = parentObj.elements[0]; var checkMatch = _$(this.sourceHtml).find(selector); var isMatched = false; for (var j = 0; j < checkMatch.elements.length; j++) { if (checkMatch.elements[j] === parentElem) { isMatched = true; break; } } if (isMatched) { if (results.indexOf(parentElem) === -1) results.push(parentElem); break; } parentObj = parentObj.parent(); } } var closestInstance = _$(results); closestInstance.sourceHtml = this.sourceHtml; return closestInstance; } }; instance.length = instance.elements.length; return instance; };

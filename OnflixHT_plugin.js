BASEURL = "https://onflix.lat";
BASEAPI = "https://k8s.onflixcdn.com/api";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>"
function getManifest() {
	return JSON.stringify({
		"id": "onflix",
		"name": "Onflix",
		"description": "Trang xem phim siêu hay.",
		"version": "1.9.8",
		"baseUrl": "https://onflix.lat",
    "info": "",
		"iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/onflix.png",
		"isEnabled": true,
		"type": "MOVIE",
    "author": "Alokillgtv",
		"playerType": "auto"
	});
}
//     popup_html: popup_html,
function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("["+BASEURL+"] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("["+BASEURL+"] " + msg);
    }
}

// https://onflix.lat/kham-pha?page=2
// https://onflix.lat/kham-pha?page=2
// https://k8s.onflixcdn.com/api/movies?type=phim-le&sort=newest&page=2&limit=24
function getHomeSections() {
    try {
// /movies?type=chieu_rap&sort=newest&page=2&limit=24
        var listurl = `
/movies?type=chieu_rap&sort=newest&limit=24@@Phim Chiêú Rạp@@false
/movies?type=phim-bo&sort=newest&limit=24@@Phim Bộ@@false
/movies?type=phim-le&sort=newest&limit=24@@Phim Lẻ@@false
/movies?sort=newest&limit=24@@Phim Mới@@true
`;
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        log("getHomeSections[err]:\n " + e);
        return JSON.stringify([]);
    }
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

// ĐÃ SỬA: Lỗi cú pháp khai báo biến trong JSON.stringify
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

        var api = (typeof BASEAPI !== "undefined" && BASEAPI) ? BASEAPI : "https://k8s.onflixcdn.com/api";
        var page = 1;
        var path = slug || "";

        // 1. Kiểm tra nếu slug là link tuyệt đối (http://...)
        if (path && path.indexOf("http") === 0) {
            if (filtersJson) {
                var fixedJson1 = filtersJson
                    .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    .replace(/:,/g, ':');
                try {
                    var filtersSearch = JSON.parse(fixedJson1);
                    var pageSearch = parseInt(filtersSearch.page) || 1;

                    if (pageSearch > 1 && path.indexOf("page=") === -1) {
                        var sepSearch = path.indexOf("?") > -1 ? "&" : "?";
                        var resUrl1 = (path + sepSearch + "page=" + pageSearch).replace(/([^:]\/)\/+/g, "$1");
                        log("getUrlList[url]: \n" + resUrl1);
                        return resUrl1;
                    }
                } catch (jsonErr) {}
            }
            log("getUrlList[url]: \n" + path);
            return path;
        }

        // 2. Xử lý an toàn filtersJson lấy page và category
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

        if (path && path.indexOf("/") !== 0) {
            path = "/" + path;
        }

        var resultUrl = api + path;

        if (page > 1 && resultUrl.indexOf("page=") === -1) {
            var separator = resultUrl.indexOf("?") > -1 ? "&" : "?";
            resultUrl += separator + "page=" + page;
        }

        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        log("getUrlList[err]:\n " + e);
        var fallbackApi = (typeof BASEAPI !== "undefined" && BASEAPI) ? BASEAPI : "https://k8s.onflixcdn.com/api";
        var safePath = slug ? (slug.indexOf("/") === 0 ? slug : "/" + slug) : "";
        var resFallback = (fallbackApi + safePath).replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + resFallback);
        return resFallback;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var api = (typeof BASEAPI !== "undefined" && BASEAPI) ? BASEAPI : "https://k8s.onflixcdn.com/api";
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
        // Chuẩn hóa theo cấu trúc: /search?q=keyword&page=1
        var resultUrl = api + "/search?q=" + encodedKeyword + "&page=" + page;

        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlSearch[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        var fallbackApi = (typeof BASEAPI !== "undefined" && BASEAPI) ? BASEAPI : "https://k8s.onflixcdn.com/api";
        var resFallback = (fallbackApi + "/search?q=" + encodeURIComponent(keyword || "") + "&page=1").replace(/([^:]\/)\/+/g, "$1");
        log("getUrlSearch[url]: \n" + resFallback);
        return resFallback;
    }
}

function getUrlDetail(slug) {
    try {
        log("getUrlDetail[url]: \n" + slug);
        var domain = (typeof BASEURL !== "undefined" && BASEURL) ? BASEURL : "https://onflix.lat";
        if (!slug) return "";
        if (slug.indexOf('http') === 0) return slug;
        var resUrl = (domain + "/phim/" + slug).replace(/([^:]\/)\/+/g, "$1");
        log("getUrlDetail[url]: \n" + resUrl);
        return resUrl;
    } catch (e) {
        log("getUrlDetail[err]:\n " + e);
        return "";
    }
}

function getUrlCategories() { 
    try {
        var domain = (typeof BASEURL !== "undefined" && BASEURL) ? BASEURL : "https://onflix.lat";
        log("getUrlCategories[url]: \n" + domain);
        return domain;
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
    log("parseListResponse[url]: \n" + $url);
    try {
        var safeUrl = $url || "";
        var domain = (typeof BASEURL !== "undefined" && BASEURL) ? BASEURL : "https://onflix.lat";

        var items = [];
        var videoData = typeof html === "string" ? JSON.parse(html) : html;

        if (!videoData) {
            return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
        }

        // Ưu tiên đọc mảng movies (cho Search API) hoặc data (cho Danh sách)
        var rawList = [];
        if (Array.isArray(videoData.movies)) {
            rawList = videoData.movies;
        } else if (Array.isArray(videoData.data)) {
            rawList = videoData.data;
        } else if (videoData.data && Array.isArray(videoData.data.items)) {
            rawList = videoData.data.items;
        } else if (Array.isArray(videoData)) {
            rawList = videoData;
        }

        // Đọc thông tin phân trang an toàn (API Search không trả về pagination)
        var currentpg = 1;
        var total_pages = 1;

        if (videoData.pagination) {
            currentpg = parseInt(videoData.pagination.current_page || videoData.pagination.currentPage) || 1;
            total_pages = parseInt(videoData.pagination.total_pages || videoData.pagination.totalPages) || 1;
        } else if (rawList.length >= 24) {
            // Nếu có từ 24 item trở lên, cho phép phân trang tiếp
            total_pages = currentpg + 1;
        }

        // Lặp bóc tách thông tin từng phim
        for (var j = 0; j < rawList.length; j++) {
            var block = rawList[j];
            var movieSlug = block.slug || "";
            var itemUrl = domain + "/phim/" + movieSlug;
            var poster = block.poster_url;
            var backdrop = block.thumb_url;
            if(!block.episode_current.match(/sắp|chiếu/)){
              if(poster && poster.indexOf("ophim") > -1 || backdrop && backdrop.indexOf("ophim") > -1){
                // https://img.ophim.live
                poster = poster.replace("https://img.ophim.live","https://ophim1.com");
                backdrop = backdrop.replace("https://img.ophim.live","https://ophim1.com");
              }
              items.push({
                  "id": itemUrl,
                  "title": (block.title || block.name || "").trim(),
                  "posterUrl": poster || "",
                  "backdropUrl": backdrop || "",
                  "year": block.year || "",
                  "quality": block.quality || "",
                  "episode_current": block.episode_current || "",
                  "lang": block.lang || ""
              });
            }
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentpg,
                "totalPages": total_pages
            }
        });

    } catch (e) {
        log("parseListResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function parserFind(html, $url) {
    try {
        log("parserFind[url]: \n" + $url);
        return parseListResponse(html, $url);
    } catch (e) {
        log("parserFind[err]:\n " + e);
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function parseSearchResponse(html) {
    try {
        return parseListResponse(html);
    } catch (e) {
        log("parseSearchResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function parseNextPayload(raw) {
    try {
        // Tách lấy mảng tham số truyền vào push() bằng regex
        const match = raw.match(/self\.__next_f\.push\((.*)\)/);
        if (!match) return null;

        // Parse phần mảng chứa ID và Payload string
        const pushArgs = JSON.parse(match[1]); // pushArgs sẽ là [1, "1b:[...]\n"]
        const rawString = pushArgs[1];

        // Loại bỏ tiền tố nhận diện của RSC (ví dụ "1b:") và ký tự xuống dòng "\n" ở cuối
        const cleanJsonStr = rawString.replace(/^\w+:/, '').replace(/\n$/, '');

        // Parse chuỗi đã làm sạch thành Array/Object JS
        return JSON.parse(cleanJsonStr);
    } catch (e) {
        log("parseNextPayload[err]:\n " + e);
        return null;
    }
}

function extractCleanData(data) {
    try {
        let result = {
            movie: null,
            episodes: [],
            related: [],
            collection: []
        };

        // Hàm đệ quy để duyệt mọi ngóc ngách của mảng/object
        function traverse(node) {
            if (!node) return;

            // Nếu là Object, kiểm tra xem có chứa các key cần tìm không
            if (typeof node === 'object' && !Array.isArray(node)) {
                if (node.movie && typeof node.movie === 'object') {
                    result.movie = node.movie;
                }
                if (Array.isArray(node.episodes)) {
                    result.episodes = node.episodes;
                }
                if (Array.isArray(node.related)) {
                    result.related = node.related;
                }
                if (Array.isArray(node.collection)) {
                    result.collection = node.collection;
                }

                // Tiếp tục duyệt các thuộc tính bên trong Object này
                for (let key in node) {
                    if (node.hasOwnProperty(key)) {
                        traverse(node[key]);
                    }
                }
            } 
            // Nếu là Mảng, duyệt qua từng phần tử của mảng
            else if (Array.isArray(node)) {
                for (let i = 0; i < node.length; i++) {
                    traverse(node[i]);
                }
            }
        }

        traverse(data);
        return result;
    } catch (e) {
        log("extractCleanData[err]:\n " + e);
        return { movie: null, episodes: [], related: [], collection: [] };
    }
}

// https://motchille.cx/baseapi/episodes?movie_id=76981
function parseMovieDetail(html, $url) {
    log("parseMovieDetail[url]: \n" + $url);
    try {
        // 3. Gán vào biến dataVD
        var script = _$(html).find("script:content('original_name')").text();
        if (!script) {
            script = _$(html).find("script:content('episode_current')").text();
        }
        var rawVD = parseNextPayload(script);
        var dataVD = extractCleanData(rawVD);
        var movie = dataVD.movie;
        var actors = "";
        
        if (movie && movie.actors) {
            movie.actors.forEach(actor => {
                actors += actor.name + ", ";
            });
        }

        var scriptEmbed = _$(html).find("script:content('\"link_embed\\\":\\\"http')").text();
        if (!scriptEmbed) {
            scriptEmbed = _$(html).find("script:content('\"link_m3u8\\\":\\\"http')").text();
        }
        var rawVDEmbed = parseNextPayload(scriptEmbed);
        dataVD = extractCleanData(rawVDEmbed);
        
        var $listEpi = dataVD.episodes;
        var servers = [];

        // Xử lý danh sách tập phim nếu tồn tại
        if ($listEpi) {
            $listEpi.forEach(episode => {
                // 1. Tìm xem server này đã tồn tại trong mảng servers chưa
                let server = servers.find(s => s.name === episode.server_name);

                // 2. Nếu chưa tồn tại, tạo mới server và đẩy vào mảng servers
                if (!server) {
                    var serverName = episode.server_name;
                    server = {
                        name: serverName,
                        episodes: []
                    };
                    servers.push(server);
                }

                // 3. Đẩy thông tin tập phim được format lại vào mảng episodes của server tương ứng
                var streamLink = episode.link_m3u8;
                if (episode.link_m3u8.indexOf("https://ss.onflixstream.site/playlist?url") > -1) {
                    streamLink = episode.link_embed;
                }
                server.episodes.push({
                    id: streamLink,            // URL lấy từ link_m3u8
                    name: "Tập " + episode.slug,      // Tập + slug (ví dụ: Tập 1)
                    slug: "tap-" + episode.slug       // tap-slug (ví dụ: tap-1)
                });
            });
        }

        // Hàm đổi tên server
        function renameServer(originalName) {
            let newName = originalName;
            if (originalName.includes("PA")) {
                newName = originalName.replace("PA", "KK Phim");
            } else if (originalName.includes("OP")) {
                newName = originalName.replace("OP", "Ổ Phim");
            } else if (originalName.includes("NC")) {
                newName = originalName.replace("NC", "Nguồn C");
            }
            return newName;
        }

        // 2. Chạy vòng lặp đổi tên cho toàn bộ server trước
        servers.forEach(server => {
            server.name = renameServer(server.name);
        });

        // 3. Sắp xếp lại danh sách theo tên mới đã được đổi
        servers.sort((a, b) => {
            const getPriority = (name) => {
                if (name.includes("KK Phim")) return 1;  // KK Phim (PA cũ) lên đầu
                if (name.includes("Ổ Phim")) return 2;   // Ổ Phim (OP cũ) xếp thứ hai
                if (name.includes("Nguồn C")) return 4;  // Nguồn C (NC cũ) xuống cuối cùng
                return 3;                                // Các nguồn còn lại (SN, v.v.) nằm giữa
            };

            return getPriority(a.name) - getPriority(b.name);
        });

        // Trả về kết quả JSON
        return JSON.stringify({
            id: $url,
            title: movie ? movie.title : "",
            posterUrl: movie ? movie.poster_url : "",
            backdropUrl: movie ? movie.poster_url : "",
            description: movie ? movie.content : "",
            servers: servers,
            quality: movie ? movie.quality : "HD",
            year: movie ? movie.year : "",
            status: movie ? movie.episode_status : "",
            duration: movie ? movie.time : "",
            casts: actors,
            director: movie ? movie.directors : "",
            category: (movie && movie.categories && movie.categories[0]) ? movie.categories[0].name : "",
            lang: movie ? movie.lang : "",
            country: (movie && movie.countries && movie.countries[0]) ? movie.countries[0].name : ""
        });
    } 
    catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: $url,
            title: "Lỗi rồi bạn ơi. Tên miền đã bị đổi",
            posterUrl: "",
            backdropUrl: "",
            description: e.message || e,
            servers: [],
            quality: "HD",
            year: 2030,
            status: "",
            duration: "",
            casts: "",
            director: ""
        });
    }
}

function parseDetailResponse(html, url) {
    log("parseDetailResponse[url]: \n" + url);
    try {
        var $stream = "";
        var $type = "application/x-mpegURL";
        if(url.indexOf("embed") > -1){
            $stream = url;
            $type = "";
        }
        var customjs = runJS(BASEURL);
        return JSON.stringify({
            "url": $stream,
            "mimeType": $type,
            "headers": {
                "Referer": BASEURL,
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                "Sec-Ch-Ua-Mobile": "?1",
                "Sec-Ch-Ua-Platform": '"Android"',
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "X-Requested-With": "com.android.chrome",
                "Block-Ads": false,
                "Custom-Js": customjs.trim()
            },
            "subtitles": []
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

function sortEpisodesByName(data) {
    try {
        data.forEach(server => {
            if (server.episodes && Array.isArray(server.episodes)) {
                server.episodes.sort((a, b) => {
                    const matchA = a.name.match(/Tập\s*(\d+)/i);
                    const matchB = b.name.match(/Tập\s*(\d+)/i);
                    
                    const numA = matchA ? parseInt(matchA[1], 10) : 0;
                    const numB = matchB ? parseInt(matchB[1], 10) : 0;
                    
                    return numA - numB;
                });
            }
        });
        return data;
    } catch (e) {
        log("sortEpisodesByName[err]:\n " + e);
        return data;
    }
}


function runJS(referer) {
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

(function injectCSS() {
  try {
    const cssStyle = "body,html,*{display:none!important;background:black!important;opacity:0!important;z-index:-999999}";
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.setAttribute('data-injected-by', 'custom-script');

    if (styleElement.styleSheet) {
      styleElement.styleSheet.cssText = cssStyle;
    } else {
      styleElement.appendChild(document.createTextNode(cssStyle));
    }

    const targetNode = document.head || document.getElementsByTagName('head')[0] || document.documentElement;

    if (targetNode) {
      targetNode.appendChild(styleElement);
      bridgeLog("Chèn css ẩn trang thành công.");
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        (document.head || document.documentElement).appendChild(styleElement);
      });
    }
  } catch (error) {
    bridgeLog('Không thể chèn CSS:', error);
  }
})();

(function initCryptoHookSniffer() {
  if (window.__CRYPTO_SNIFFER_INITIALIZED__) return;
  window.__CRYPTO_SNIFFER_INITIALIZED__ = 1;

  var hasDispatchedAny = 0;
  var isFinished = 0;
  var timeoutTimer = null;

  bridgeLog("Đang tiến hành giải mã & bắt link M3U8, xin chờ....", true);

  // 1. Timeout 20 giây bảo vệ
  timeoutTimer = setTimeout(function() {
    if (hasDispatchedAny === 0 && isFinished === 0) {
      isFinished = 1;
      bridgeLog("❌ [TIMEOUT] Đã quá 20 giây nhưng không bắt được dữ liệu giải mã!", false);
      bridgeLog("Không tìm thấy link video (Hết thời gian 20s).", true);
      
      if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
        window.SnifferBridge.play("https://google.com", "");
      }
    }
  }, 20000);

  function stopTimeout() {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
  }

  // 2. Kiểm tra M3U8 hợp lệ
  function isValidM3U8(content) {
    if (typeof content !== 'string') return false;
    var trimmed = content.trim();
    return trimmed.indexOf('#EXTM3U') === 0 && 
          (trimmed.indexOf('#EXTINF') !== -1 || trimmed.indexOf('#EXT-X-STREAM-INF') !== -1);
  }

  // 3. Chuyển M3U8 về App
  function dispatchM3u8ToApp(m3u8Content) {
    if (!m3u8Content || hasDispatchedAny === 1) return;
    hasDispatchedAny = 1;
    isFinished = 1;
    stopTimeout();

    bridgeLog('🎯 [CRYPTO-HOOK] Giải mã thành công M3U8! Đang gửi lên App...');
    bridgeLog("🎯 Bắt link thành công! Đang xử lý video...", true);

    try {
      if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
        window.SnifferBridge.log("M3U8\\n" + m3u8Content);
      }
      bridgeLog('🎯 Đang bắn m3u8 cho native');
      SnifferBridge.playM3u8Content(m3u8Content, JSON.stringify({"Origin":"https://phim.nguonc.com","Referer":"${referer}"}));
    } catch(e) {
      bridgeLog('❌ [DISPATCH ERROR]: ' + e.message);
    }
  }

  // 4. HOOK TRỰC TIẾP VÀO WEB CRYPTO API (crypto.subtle.decrypt)
  try {
    if (window.crypto && window.crypto.subtle && window.crypto.subtle.decrypt) {
      const originalDecrypt = window.crypto.subtle.decrypt;

      window.crypto.subtle.decrypt = async function() {
        // Thực thi hàm giải mã gốc của trình duyệt
        const decryptedBuffer = await originalDecrypt.apply(this, arguments);

        if (isFinished === 0 && decryptedBuffer) {
          try {
            // Chuyển kết quả vừa giải mã từ ArrayBuffer sang chuỗi Text
            const textDecoder = new TextDecoder("utf-8");
            const decodedText = textDecoder.decode(decryptedBuffer);

            // Kiểm tra xem dữ liệu sau khi giải mã có phải là file M3U8 không
            if (isValidM3U8(decodedText)) {
              dispatchM3u8ToApp(decodedText);
            }
          } catch (err) {
            // Bỏ qua các dữ liệu giải mã không phải text (ví dụ giải mã mảng byte hình ảnh/audio)
          }
        }

        return decryptedBuffer;
      };

      bridgeLog('🚀 [INIT] Hook Crypto.subtle.decrypt thành công!');
    } else {
      bridgeLog('❌ Web Crypto API không khả dụng trên WebView này!');
    }
  } catch (e) {
    bridgeLog('❌ [HOOK ERROR]: ' + e.message);
  }

})();
  `;
}


function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
// https://k8s.onflixcdn.com/api/movies?sort=year_desc&limit=24&category=chien-tranh
function getLISTmenu() {
    return `
/themes/de-xuat-cho-ban@@Đề Xuất
/themes/dang-chieu-phat@@Đang Chiếu
/movies?sort=year_desc&limit=24&category=kinh-di@@Kinh Dị
/movies?sort=year_desc&limit=24&category=co-trang@@Cổ Trang
/movies?sort=year_desc&limit=24&category=18-plus@@Phim 18+
/themes/phim-chat-luong-cao-va-phu-de-song-ngu@@Song Ngữ
/themes/hoat-hinh-chon-loc@@Hoạt hình
/themes/phieu-luu-mao-hiem@@Phiêu Lưu
/themes/phim-truyen-hinh-trung-quoc-dai-luc@@Phim Trung Quốc
/themes/tinh-yeu-la-nhung-gi-trai-tim-muon@@Tình Yêu
/themes/phim-han-quoc@@Hàn Quốc
/themes/thanh-xuan@@Thanh xuân
/themes/phim-chua-lanh-tam-hon@@Phim Chữa Lành
/themes/phim-chuyen-the-tu-tac-pham-van-hoc@@Phim Chuyển Thể
/themes/phim-4 k@@Phim 4 K
/themes/phim-cong-so@@Phim Công Sở
/themes/hinh-su-toi-pham-han-quoc@@Hình Sự
/themes/dien-anh-au-my@@Âu Mỹ
/movies?sort=year_desc&limit=24&category=action-&-adventure@@Action & Adventure
/movies?sort=year_desc&limit=24&category=am-nhac@@Âm Nhạc
/movies?sort=year_desc&limit=24&category=bi-an@@Bí Ẩn
/movies?sort=year_desc&limit=24&category=chien-tranh@@Chiến Tranh
/movies?sort=year_desc&limit=24&category=chinh-kich@@Chính Kịch
/movies?sort=year_desc&limit=24&category=chuong-trinh-truyen-hinh@@Chương Trình Truyền Hình
/movies?sort=year_desc&limit=24&category=chuyen-the@@Chuyển Thể
/movies?sort=year_desc&limit=24&category=dang-cap-nhat@@Đang cập nhật
/movies?sort=year_desc&limit=24&category=gay-can@@Gây Cấn
/movies?sort=year_desc&limit=24&category=gia-dinh@@Gia Đình
/movies?sort=year_desc&limit=24&category=gia-tuong@@Giả Tưởng
/movies?sort=year_desc&limit=24&category=hai-huoc@@Hài Hước
/movies?sort=year_desc&limit=24&category=hanh-dong@@Hành Động
/movies?sort=year_desc&limit=24&category=hinh-su@@Hình Sự
/movies?sort=year_desc&limit=24&category=hoat-hinh@@Hoạt Hình
/movies?sort=year_desc&limit=24&category=hoc-duong@@Học Đường
/movies?sort=year_desc&limit=24&category=huyen-huyen@@Huyền Huyễn
/movies?sort=year_desc&limit=24&category=khoa-hoc@@Khoa Học
/movies?sort=year_desc&limit=24&category=kinh-dien@@Kinh Điển
/movies?sort=year_desc&limit=24&category=lang-man@@Lãng Mạn
/movies?sort=year_desc&limit=24&category=lgbt@@LGBT
/movies?sort=year_desc&limit=24&category=lich-su@@Lịch Sử
/movies?sort=year_desc&limit=24&category=mien-tay@@Miền Tây
/movies?sort=year_desc&limit=24&category=phieu-luu@@Phiêu Lưu
/movies?sort=year_desc&limit=24&category=hai@@Phim Hài
/movies?sort=year_desc&limit=24&category=ngan@@Phim Ngắn
/movies?sort=year_desc&limit=24&category=nhac@@Phim Nhạc
/movies?sort=year_desc&limit=24&category=sci-fi-&-fantasy@@Sci-Fi & Fantasy
/movies?sort=year_desc&limit=24&category=short-drama@@Short Drama
/movies?sort=year_desc&limit=24&category=sitcom@@Sitcom
/movies?sort=year_desc&limit=24&category=soap@@Soap
/movies?sort=year_desc&limit=24&category=tai-lieu@@Tài Liệu
/movies?sort=year_desc&limit=24&category=talk@@Talk
/movies?sort=year_desc&limit=24&category=tam-ly@@Tâm Lý
/movies?sort=year_desc&limit=24&category=than-thoai@@Thần Thoại
/movies?sort=year_desc&limit=24&category=than-tuong@@Thần Tượng
/movies?sort=year_desc&limit=24&category=thanh-xuan@@Thanh Xuân
/movies?sort=year_desc&limit=24&category=the-thao@@Thể Thao
/movies?sort=year_desc&limit=24&category=thuong-truong@@Thương Trường
/movies?sort=year_desc&limit=24&category=tien-hiep@@Tiên Hiệp
/movies?sort=year_desc&limit=24&category=tinh-cam@@Tình Cảm
/movies?sort=year_desc&limit=24&category=tinh-tiet@@Tình Tiết
/movies?sort=year_desc&limit=24&category=tinh-yeu-ngot-ngao@@Tình Yêu Ngọt Ngào
/movies?sort=year_desc&limit=24&category=toi-pham@@Tội Phạm
/movies?sort=year_desc&limit=24&category=tre-em@@Trẻ Em
/movies?sort=year_desc&limit=24&category=vien-tuong@@Viễn Tưởng
/movies?sort=year_desc&limit=24&category=vo-thuat@@Võ Thuật
`
}

function buildMenu(listurl){let menulist=[];if (!listurl)return menulist;let lines=listurl.split('\n');for (let i=0;i < lines.length;i++){let line=lines[i].trim();if (!line||line.indexOf('@@')===-1)continue;let parts=line.split('@@');let link=parts[0]?parts[0].trim():"";let name=parts[1]?parts[1].trim():"";let check=parts[2]?parts[2].trim():undefined;if (!link||!name)continue;let item={};if (check==="false"){item={"slug":link,"title":name,"type":"Horizontal"};}else if (check==="true"){item={"slug":link,"title":name,"type":"Grid"};}else{item={"slug":link,"name":name};}menulist.push(item);}return menulist;}
function _$(htmlOrBlock){if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) {return htmlOrBlock;} var instance = {sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),find: function (selector) {if (selector.indexOf(',') !== -1) {var results = [];var selectors = selector.split(',').map(function (s) {return s.trim();});for (var s = 0;s < selectors.length;s++) {if (selectors[s] === "") continue;var subInstance = this.find(selectors[s]);for (var r = 0;r < subInstance.elements.length;r++) {var element = subInstance.elements[r];if (results.indexOf(element) === -1) {results.push(element);}}} var multiInstance = _$(results);multiInstance.sourceHtml = this.sourceHtml;return multiInstance;} var results = [];var contentFilter = "";if (selector.indexOf(":content(") !== -1) {var contentMatch = selector.match( /:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch) {contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[ 3] || "";selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}} var attrNameFilter = "";var attrValueFilter = "";var attrOperator = "=";var hasAttrFilter = false;var attrMatch = selector.match( /\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/ );if (attrMatch) {hasAttrFilter = true;attrNameFilter = attrMatch[1];attrOperator = attrMatch[2];attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || "";selector = selector.replace(/\[.*?\]/,"");} var notSelector = "";if (selector.indexOf(":not(") !== -1) {var notMatch = selector.match(/:not\(([^)]+)\)/);if (notMatch) {notSelector = notMatch[1];selector = selector.replace(/:not\([^)]+\)/,"");}} var isFirstFilter = selector.indexOf(":first") !== -1;var isLastFilter = selector.indexOf(":last") !== -1;selector = selector.replace(/:first|:last/g,"");var targetTagName = "";var targetId = "";var targetClasses = [];var selectorToParse = selector.trim();if (selectorToParse !== "") {var idIndex = selectorToParse.indexOf('#');if (idIndex !== -1) {var afterId = selectorToParse.substring(idIndex + 1);var nextDot = afterId.indexOf('.');targetId = nextDot === -1 ? afterId : afterId.substring(0,nextDot);selectorToParse = selectorToParse.substring(0,idIndex) + ( nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1));} var classParts = selectorToParse.split('.');var possibleTag = classParts.shift();if (possibleTag) {targetTagName = possibleTag.toLowerCase();} targetClasses = classParts.filter(function (c) {return c.length > 0;});} var isAttrOnly = (selector === "" && hasAttrFilter);for (var i = 0;i < this.elements.length;i++) {var currentHtml = this.elements[i];var pos = 0;var subResults = [];while ((pos = currentHtml.indexOf('<',pos)) !== -1) {if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') {pos++;continue;} var endOpenTag = currentHtml.indexOf('>',pos);if (endOpenTag === -1) break;var fullOpenTag = currentHtml.substring(pos,endOpenTag + 1);var spacePos = fullOpenTag.indexOf(' ');var currentTagName = "";if (spacePos === -1) {currentTagName = fullOpenTag.substring(1,fullOpenTag.length - 1).toLowerCase();} else {currentTagName = fullOpenTag.substring(1,spacePos) .toLowerCase();} var isMatched = true;if (targetTagName && targetTagName !== currentTagName) {isMatched = false;} if (isMatched && targetId) {var idMatchStr = "";var idPos = fullOpenTag.indexOf('id="');if (idPos !== -1) {var startQuote = idPos + 4;idMatchStr = fullOpenTag.substring(startQuote,fullOpenTag .indexOf('"',startQuote));} else {idPos = fullOpenTag.indexOf("id='");if (idPos !== -1) {var startQuote = idPos + 4;idMatchStr = fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}} if (idMatchStr !== targetId) {isMatched = false;}} if (isMatched && targetClasses.length > 0) {var classMatchStr = "";var classPos = fullOpenTag.indexOf('class="');if (classPos !== -1) {var startQuote = classPos + 7;classMatchStr = fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));} else {classPos = fullOpenTag.indexOf("class='");if (classPos !== -1) {var startQuote = classPos + 7;classMatchStr = fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}} if (classMatchStr) {var currentClasses = classMatchStr.trim().split(/\s+/);for (var c = 0;c < targetClasses.length;c++) {if (currentClasses.indexOf(targetClasses[c]) === -1) {isMatched = false;break;}}} else {isMatched = false;}} if (isMatched && hasAttrFilter) {var actualValue = "";var attrPos = fullOpenTag.indexOf(attrNameFilter + '="');if (attrPos !== -1) {var startQuote = attrPos + attrNameFilter.length + 2;actualValue = fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));} else {attrPos = fullOpenTag.indexOf(attrNameFilter + "='");if (attrPos !== -1) {var startQuote = attrPos + attrNameFilter.length + 2;actualValue = fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}} if (attrPos === -1) {isMatched = false;} else {if (attrOperator === "=") {if (attrNameFilter === "class") {var classes = actualValue.trim().split(/\s+/);if (classes.indexOf(attrValueFilter) === -1) isMatched = false;} else if (actualValue !== attrValueFilter) {isMatched = false;}} else if (attrOperator === "*=") {if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false;} else if (attrOperator === "^=") {if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false;} else if (attrOperator === "$=") {if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false;}}} if (isMatched) {var startTagPos = pos;var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta' ];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {var depth = 1;var scanPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && scanPos < currentHtml.length) {var nextOpen = currentHtml.indexOf(openStr,scanPos);var nextClose = currentHtml.indexOf(closeStr,scanPos);if (nextClose === -1) {scanPos = currentHtml.length;break;} if (nextOpen !== -1 && nextOpen < nextClose) {depth++;scanPos = nextOpen + openStr.length;} else {depth--;scanPos = nextClose + closeStr.length;if (depth === 0) endTagPos = nextClose + closeStr .length;}}} var foundBlock = currentHtml.substring(startTagPos,endTagPos);if (contentFilter) {var pureText = foundBlock.replace(/<[^>]+>/g,"").trim();if (pureText.indexOf(contentFilter) === -1) {pos = endTagPos;continue;}} if (notSelector) {var isNotClass = notSelector.indexOf('.') === 0;var isNotId = notSelector.indexOf('#') === 0;var notValue = notSelector.substring(1);var hasNot = false;if (isNotClass && fullOpenTag.indexOf('class="') !== -1 && fullOpenTag.indexOf(notValue) !== -1) hasNot = true;if (isNotId && fullOpenTag.indexOf('id="') !== -1 && fullOpenTag.indexOf(notValue) !== -1) hasNot = true;if (!hasNot) subResults.push(foundBlock);} else {subResults.push(foundBlock);} pos = endTagPos;} else {pos++;}} if (isFirstFilter && subResults.length > 0) subResults = [subResults[ 0]];if (isLastFilter && subResults.length > 0) subResults = [subResults[ subResults.length - 1]];results = results.concat(subResults);} var newInstance = _$(results);newInstance.sourceHtml = this.sourceHtml || currentHtml;return newInstance;},each: function (callback) {for (var i = 0;i < this.elements.length;i++) {var childInstance = _$(this.elements[i]);childInstance.sourceHtml = this.sourceHtml;callback.call(childInstance,i,this.elements[i]);} return this;},eq: function (index) {if (index < 0) index = this.elements.length + index;var matchedElement = this.elements[index];this.elements = matchedElement ? [matchedElement] : [];return this;},attr: function (attrName) {if (this.elements.length === 0) return "";var elem = this.elements[0];var searchStr = attrName + '="';var pos = elem.indexOf(searchStr);if (pos === -1) {searchStr = attrName + "='";pos = elem.indexOf(searchStr);} if (pos === -1) return "";var start = pos + searchStr.length;var quoteType = elem.charAt(start - 1);var end = elem.indexOf(quoteType,start);return end === -1 ? "" : elem.substring(start,end);},html: function () {if (this.elements.length === 0) return "";var elem = this.elements[0];var start = elem.indexOf('>') + 1;var end = elem.lastIndexOf('</');if (start > 0 && end > start) return elem.substring(start,end);return "";},text: function () {if (this.elements.length === 0) return "";var elem = this.elements[0];var start = elem.indexOf('>') + 1;var end = elem.lastIndexOf('</');if (start > 0 && end > start) {var content = elem.substring(start,end);return content.replace(/<\/?[^>]+(>|$)/g,"").trim();} return "";},next: function () {var results = [];if (!this.sourceHtml) return this;for (var i = 0;i < this.elements.length;i++) {var elem = this.elements[i];var idx = this.sourceHtml.indexOf(elem);if (idx === -1) continue;var scanPos = idx + elem.length;var nextOpen = this.sourceHtml.indexOf('<',scanPos);if (nextOpen !== -1) {if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue;var endOpenTag = this.sourceHtml.indexOf('>',nextOpen);if (endOpenTag === -1) continue;var fullOpenTag = this.sourceHtml.substring(nextOpen,endOpenTag + 1);var spacePos = fullOpenTag.indexOf(' ');var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1,fullOpenTag.length - 1).toLowerCase() : fullOpenTag .substring(1,spacePos).toLowerCase();var startTagPos = nextOpen;var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta' ];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag .indexOf('/>') === -1) {var depth = 1;var sPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && sPos < this.sourceHtml.length) {var nOpen = this.sourceHtml.indexOf(openStr,sPos);var nClose = this.sourceHtml.indexOf(closeStr,sPos);if (nClose === -1) break;if (nOpen !== -1 && nOpen < nClose) {depth++;sPos = nOpen + openStr.length;} else {depth--;sPos = nClose + closeStr.length;if (depth === 0) endTagPos = nClose + closeStr.length;}}} results.push(this.sourceHtml.substring(startTagPos,endTagPos));}} var nextInstance = _$(results);nextInstance.sourceHtml = this.sourceHtml;this.elements = results;return this;},parent: function () {var results = [];if (!this.sourceHtml) return this;for (var i = 0;i < this.elements.length;i++) {var elem = this.elements[i];var idx = this.sourceHtml.indexOf(elem);if (idx <= 0) continue;var scanPos = idx - 1;while (scanPos >= 0) {var openTagPos = this.sourceHtml.lastIndexOf('<',scanPos);if (openTagPos === -1) break;if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this .sourceHtml.charAt(openTagPos + 1) !== '!') {var endOpenTag = this.sourceHtml.indexOf('>',openTagPos);if (endOpenTag !== -1 && endOpenTag > openTagPos) {var fullOpenTag = this.sourceHtml.substring(openTagPos,endOpenTag + 1);var spacePos = fullOpenTag.indexOf(' ');var currentTagName = (spacePos === -1) ? fullOpenTag .substring(1,fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1,spacePos).toLowerCase();var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta' ];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {var depth = 1;var sPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && sPos < this.sourceHtml.length) {var nOpen = this.sourceHtml.indexOf(openStr,sPos);var nClose = this.sourceHtml.indexOf(closeStr,sPos);if (nClose === -1) break;if (nOpen !== -1 && nOpen < nClose) {depth++;sPos = nOpen + openStr.length;} else {depth--;sPos = nClose + closeStr.length;if (depth === 0) endTagPos = nClose + closeStr .length;}}} if (endTagPos >= idx + elem.length) {var parentBlock = this.sourceHtml.substring(openTagPos,endTagPos);if (results.indexOf(parentBlock) === -1) results.push( parentBlock);break;}}} scanPos = openTagPos - 1;}} var parentInstance = _$(results);parentInstance.sourceHtml = this.sourceHtml;this.elements = results;return this;},closest: function (selector) {var results = [];if (!this.sourceHtml || this.elements.length === 0) return _$([]);for (var i = 0;i < this.elements.length;i++) {var currentElem = this.elements[i];var currentObj = _$(currentElem);currentObj.sourceHtml = this.sourceHtml;var selfCheck = _$(this.sourceHtml).find(selector);var isSelfMatched = false;for (var s = 0;s < selfCheck.elements.length;s++) {if (selfCheck.elements[s] === currentElem) {isSelfMatched = true;break;}} if (isSelfMatched) {if (results.indexOf(currentElem) === -1) results.push(currentElem);continue;} var parentObj = currentObj.parent();while (parentObj.elements.length > 0) {var parentElem = parentObj.elements[0];var checkMatch = _$(this.sourceHtml).find(selector);var isMatched = false;for (var j = 0;j < checkMatch.elements.length;j++) {if (checkMatch.elements[j] === parentElem) {isMatched = true;break;}} if (isMatched) {if (results.indexOf(parentElem) === -1) results.push( parentElem);break;} parentObj = parentObj.parent();}} var closestInstance = _$(results);closestInstance.sourceHtml = this.sourceHtml;return closestInstance;}};return instance;};
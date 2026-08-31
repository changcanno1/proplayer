var BASEURL = "https://www.vn2c.my";
var BASEAPI = "https://www.vn2c.my";
var BASELINK = BASEURL;

// https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/phimchill.ico
function getManifest() {
  try{
    return JSON.stringify({
      "id": "vn2c",
      "name": "Nguồn VN2C",
      "version": "1.3",
      "author": "Alokillgtv",
      "info": "",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/vn2c.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "type": "MOVIE",
      "subtitleCat": false,
      "playerType": "embedtoexoplay"
    });
  }
  catch(e){
    // VERTICAL
    return JSON.stringify({
      "id": "loiapp",
      "name": "Plugin bị lỗi cài đặt",
      "version": "1.0",
      "info": "Plugin đang bị lỗi: \n" + e,
      "baseUrl": "http://vkey.vn/",
      "iconUrl": "https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/novahd.png",
      "isEnabled": true,
      "type": "MOVIE",
      "playerType": "auto"
     });
  }
}

// ===== HÀM MENU LIST BEGIN ======
{
// Tạo List phim ở menu Home
  function getHomeSections() {
      localStorage.clear();
      return JSON.stringify([
          {"slug": "/phim-hay-vn2-duoc-xem-nhieu/top","title": "Xem Nhiều","type": "Horizontal"},
          {"slug": "/the-loai/phim-le-33","title": "Phim Lẻ","type": "Horizontal"},
          {"slug": "/danh-muc/phim-folder","title": "Phim Folder","type": "Horizontal"},
          {"slug": "/danh-muc/phim-group","title": "Phim Trong Group","type": "Horizontal"},
          {"slug": "/the-loai2/hoat-hinh-anime-29","title": "Phim Hoạt Hình","type": "Horizontal"},
          {"slug": "/the-loai3/top-drama-youtube-35","title": "Phim Ngắn","type": "Horizontal"},
          {"slug": "/danh-sach-phim/","title": "Phim Mới","type": "Grid"}
      ]);
  }
  
  // Hàm khởi tạo thẻ chủ đề
  function getLISTmenu() {
    try{
      return `[{"link":"/the-loai/hanh-dong-1","name":"Hành Động"},{"link":"/the-loai/tinh-cam-19","name":"Tình Cảm"},{"link":"/the-loai/co-trang-tong-hop-26","name":"Cổ Trang Tổng Hợp"},{"link":"/the-loai/ngon-tinh-xuyen-khong-4","name":"Ngôn Tình Xuyên Không"},{"link":"/the-loai/tinh-cam-hai-huoc-20","name":"Tình Cảm Hài Hước"},{"link":"/the-loai/tinh-cam-hanh-dong-5","name":"Tình cảm Hành động"},{"link":"/the-loai/co-bac-xa-hoi-den-16","name":"Cờ Bạc Xã Hội Đen"},{"link":"/the-loai/hanh-dong-hinh-su-22","name":"Hành Động Hình Sự"},{"link":"/the-loai/hanh-dong-hai-huoc-24","name":"Hành động Hài Hước"},{"link":"/the-loai/vo-thuat-17","name":"Võ Thuật"},{"link":"/the-loai/vo-thuat-kiem-hiep-6","name":"Võ Thuật Kiếm Hiệp"},{"link":"/the-loai/bi-an-kinh-di-27","name":"Bí ẩn - Kinh dị"},{"link":"/the-loai/phim-le-hay-31","name":"Phim Lẻ Hay"},{"link":"/the-loai/phim-le-33","name":"Phim Lẻ"},{"link":"/the-loai/hoat-hinh-anime-29","name":"HOẠT HÌNH - ANIME"},{"link":"/the-loai/ca-nhac-32","name":"Ca Nhạc"},{"link":"/the-loai3/top-drama-youtube-35","name":"TOP Drama YOUTUBE"},{"link":"/danh-muc/trung-quoc-7","name":"Trung Quốc"},{"link":"/danh-muc/han-quoc-10","name":"Hàn Quốc"},{"link":"/danh-muc/thai-lan-8","name":"Thái Lan"},{"link":"/danh-muc/hong-kong-9","name":"Hồng Kông"},{"link":"/danh-muc/my-2","name":"Mỹ"},{"link":"/danh-muc/viet-nam-1","name":"Việt Nam"},{"link":"/danh-muc/nhat-ban-11","name":"Nhật Bản"},{"link":"/danh-muc/nhieu-quoc-gia-17","name":"Nhiều quốc gia"},{"link":"/danh-muc/chieu-rap-23","name":"Chiếu rạp"},{"link":"/danh-muc/le-de-cu-20","name":"Lẻ Đề Cử"},{"link":"/danh-muc/le-tong-hop-16","name":"LẺ Tổng Hợp"},{"link":"/danh-muc/ca-nhac-hai-cuoi-21","name":"Ca Nhạc - Hài Cười"},{"link":"/danh-muc/thieu-nhi-kinh-phat-26","name":"Thiếu nhi - Kinh Phật"},{"link":"/danh-muc2/phim-drama-tiktok-19","name":"Phim Drama TikTok"},{"link":"/danh-muc2/top-ca-nhac-28","name":"TOP CA NHẠC"}]`;
    } catch(e){
      log("getLISTmenu[err]:\n " + e);
      return `[
        {"link":"/","name":"Đang lỗi getLISTmenu()"},
      ]`;
    }
  }
} // getHomeSections(), getLISTmenu()
// ===== HÀM MENU LIST END ======

// ===== HÀM TẠO URL BEGIN ======
{
  // /trang-10
  // https://www.vn2c.my/danh-sach-phim/trang-16
  // https://www.vn2c.my/the-loai/hanh-dong-1-trang-5
  function getUrlList(slug, filtersJson) {
      
      var paramPage = "trang-";
      try {
          //log("getUrlList[url]: \n" + slug);
          if (slug && slug.indexOf("http") > -1) {
              return slug;
          }
          var page = 1;
          var path = slug || "";
          if (filtersJson) {
              var fixedJson2 = filtersJson
                  .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
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
              } catch (e) {log("getUrlList():\n" + e)}
          }
          var resultUrl = BASELINK;
          if (path) {
              resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
          }
          if (page > 0 && resultUrl.indexOf("page=") === -1) {
              
              if(resultUrl.indexOf("danh-sach-phim") > -1){
                paramPage = "/" + paramPage;
              }
              else{
                paramPage = "-" + paramPage;
              }
              resultUrl += paramPage + page;
          }
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          return finalUrl;
      } catch (e) {
          log("getUrlList[err]:\n " + e);
          return BASEURL;
      }
  }
  
 // Hàm chuyển đổi chuỗi tiếng Việt có dấu thành Slug không dấu
function toSlug(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFD") // Tách chữ cái và dấu thanh
        .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu thanh
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
        .trim()
        .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu -
        .replace(/-+/g, "-"); // Xóa dấu - trùng lặp
}

function getUrlSearch(keyword, filtersJson) {
    var paramSearch = "/tim-kiem/";
    var paramPage = "trang-";
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (e) {
                log("getUrlList():\n" + e);
            }
        }

        // Chuyển keyword từ "Xuyên Không" -> "xuyen-khong"
        var slugKeyword = toSlug(keyword || "");
        
        var resultUrl = BASELINK + paramSearch + slugKeyword;
        if (page > 1) {
            if (resultUrl.indexOf("danh-sach-phim") > -1) {
                paramPage = "/" + paramPage;
            } else {
                paramPage = "-" + paramPage;
            }
            resultUrl += paramPage + page;
        }

        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        
        log("getUrlSearch[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        return BASEURL;
    }
}
}  // getUrlList, getUrlSearch
// http://vkey.vn/animevv
// /quoc-gia/M%E1%BB%B9
// /top
//filtersJson = "{page:5}"
//getUrlList("/top", filtersJson)
//getUrlSearch("girl", filtersJson)
// ===== HÀM TẠO URL END ======

// ===== HÀM TẠO KHỐI LIST PHIM BEGIN ======
function timkiem(html, url) {
    var items = [];
    var $doc = _$(html);
    $doc.find(".boxtk").each(function() {
            var id = BASEURL + this.find("a").attr("href");
            var title = this.find("a").attr("title");
            var poster = this.find("img").attr("src");
                var background = poster;
                var quality = this.find(".taptk").text().replace("Tập phim ", "");
                var episode_current = ""
                var year = "";
                var lang = this.find(".fontf2").text();;
                if (title.length > 1 && poster.length > 5) {
                    items.push({
                        "id": id || "",
                        "title": title || "",
                        "quality": quality || "Full",
                        "episode_current": episode_current || "",
                        "posterUrl": poster || "",
                        "backdropUrl": background || "",
                        "year": year || "",
                        "lang": lang || ""
                    });
                }
            }) 
    
    return items
}

function listbox(html,url){
 var items = [];
    var $doc = _$(html);
    $doc.find(".Form2").each(function() {
            var id = BASEURL + this.find("a").attr("href");
            var title = this.find("a").attr("title");
            var poster = this.find("img").attr("src");
                var background = poster;
                var quality = this.find(".boxtt_tap").text().replace("Tập phim ", "");
                var episode_current = ""
                var year = "";
                var lang = this.find(".infoquuocgia").text();;
                if (title.length > 1 && poster.length > 5) {
                    items.push({
                        "id": id || "",
                        "title": title || "",
                        "quality": quality || "Full",
                        "episode_current": episode_current || "",
                        "posterUrl": poster || "",
                        "backdropUrl": background || "",
                        "year": year || "",
                        "lang": lang || ""
                    });
                }
            }) 
    
    return items
}

function parseListResponse(html, $url) {
    try {
      if($url.indexOf("tim-kiem") > -1){
          var items = timkiem(html, $url)
      }
      else{
          var items = listbox(html, $url)
      }
      //console.log("List item ["+$url+"]: \n" + JSON.stringify(items))
      var $return = JSON.stringify({
          "items": items,
          "pagination": {
              "currentPage": 1,
              "totalPages": 9999
          }
      });
      console.log("Return List:\n" + $return)
      return $return
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

//html = sourceHTML;
//$data = parseJSDataIsolated(script);
// ===== HÀM TẠO KHỐI LIST PHIM END ======

// ===== HÀM TẠO KHỐI CHI TIẾT PHIM BEGIN ======
function parseMovieDetail(html, url) {
    log("parseMovieDetail[url]: \n" + url);
    try {
        // === BƯỚC 2: TRÍCH XUẤT THÔNG TIN PHIM ===  
        var $doc = _$(html);
        var id = url;
        var posterUrl = $doc.find(".fixtop2b img").attr("src");
        var backdropUrl = posterUrl;
        var title = $doc.find(".header-title").text();
        var originName = title;
        var description = $doc.find(".boxblack").text();
        var director = "";
        var casts = $doc.find("span:content('DIỄN|VIÊN|PHIM')").next().text();
        var category = $doc.find("h2:content('THỂ|LOẠI') span").text();;
        // menu category
        var duration = $doc.find("h3:content('THỜI|LƯỢNG')").text().replace("THỜI LƯỢNG: ~", "");
        var status = "";
        var episode_current = "";
        var year = "";
        var quality = "";
        var rating = "";
        var country = "";
        var lang = "";
        var extra = "";
        var servers = [];
        var episodes = [];

        $doc.find(".num_film").each(function() {
    // Lấy tên nhóm (Ví dụ: "Thuyết minh:", "VietSub:")
          var rawTitle = this.find(".box_film_title").text().trim().replace(/:$/, ""); 
          var serverGroupName = rawTitle || "Server Main";
      
          var listEpisodes = [];
      
          this.find("a").each(function() {
              var rawHref = this.attr("href");
              if (!rawHref) return;
      
              var number = this.text().trim();
              var slug = "tap-" + number;
              var name = "Tập " + number;
      
              // Tách link theo dạng -id-
              var match = rawHref.match(/(.*?)-id-(\d+)/);
              var linkServer1, linkServer2, linkServer3;
      
              if (match) {
                  var basePath = match[1];
                  var filmId = match[2];
      
                  linkServer1 = BASEURL + basePath + "-id-" + filmId + "?server=1";
                  linkServer2 = BASEURL + basePath + "-vn2-id-" + filmId + "?server=2";
                  linkServer3 = BASEURL + basePath + "-vn2-sv3-id-" + filmId + "?server=3";
              } else {
                  var link = BASEURL + rawHref;
                  linkServer1 = link + "?server=1";
                  linkServer2 = link + "?server=2";
                  linkServer3 = link + "?server=3";
              }
      
              // Tạo 3 server con cho mỗi tập
              listEpisodes.push({
                  id: linkServer1,
                  name: name,
                  slug: slug,
                  ids: [{
                      url: linkServer1,
                      name: "Server 1"
                  }, {
                      url: linkServer2,
                      name: "Server 2"
                  }, {
                      url: linkServer3,
                      name: "Server 3"
                  }]
              });
          });
      
          // Chỉ push vào mảng episodes nếu có tập bên trong
          if (listEpisodes.length > 0) {
              // Tự động gán tên server lớn (Thuyết minh / VietSub / Full...)
              servers.push({
                  name: serverGroupName,
                  episodes: listEpisodes
              });
          }
      });

        var $return = JSON.stringify({
            id: url || "",
            title: title || "",
            originName: originName || "",
            posterUrl: posterUrl || "",
            backdropUrl: backdropUrl || "",
            description: description || "",
            quality: quality || "",
            year: year || "",
            rating: rating || "",
            status: status || "",
            category: category || "",
            episode_current: episode_current || "",
            servers: servers || "",
            duration: duration || "",
            casts: casts || "",
            director: director || "",
            country: country || "",
            lang: lang || "",
            extra: extra || ""
        });
        console.log("Return Movie:\n" + $return)
        return $return
    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: "error",
            title: "error",
            description: url + "\n" + e,
            servers: []
        });
    }
}
//var url = "https://novahd.cc/api/show/1413"
//var url = "http://vkey.vn/novahd/api/show/1413"
// https://novahd.cc/api/shows/1413
//var html = sourceHTML;
//JSON.parse(parseMovieDetail(sourceHTML, url))
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM END ======

// ===== HÀM TẠO XỬ LÝ STREAM PHIM BEGIN ======
{
  function parseDetailResponse(html, url) {
     console.log("parseDetailResponse dang xu ly: " + url);
    try {
      var stream = url;
      // Mimetype application/x-mpegURL video/mp4
      console.log("parseDetailResponse fetch\n" + stream);
      var $return = JSON.stringify({
        url: stream,
        mimeType: "text/html",
        isEmbed: false,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://novahd.cc",
          "Origin": "https://novahd.cc",
          "Block-Ads": false,
          "Block-Css": "",
          "Custom-Js": customJS()
        },
        subtitles: [{
          lang: "",
          url: ""
        }],
        
      });
      console.log("Return Parse:\n" + $return)
      return $return
    } catch (e) {
      console.log("parseDetailResponse[err]:\n " + e);
      return JSON.stringify({ 
        url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
        mimeType: "video/mp4", 
        isEmbed: false, headers: {}, subtitles: [] 
      });
    }
  }
  
  function parseEmbedResponse(html, url) {
    log("parseEmbedResponse [url]: " + url); //console.log("parseEmbedResponse [Raw]: " + html);
    try {
      var stream = "";
      var customJS = clearJS(rawJS);
      // Mimetype application/x-mpegURL video/mp4
      console.log("parseEmbedResponse fetch\n" + stream);
  
      var $return = JSON.stringify({
        url: stream,
        mimeType: "",
        isEmbed: false,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://novahd.cc",
          "Origin": "https://novahd.cc",
          "Block-Ads": false,
          "Block-Css": "",
          "Custom-Js": customJS
        },
        subtitles: [{
          lang: "",
          url: ""
        }],      
      });
      console.log("Return Embed:\n" + $return)
      return $return
    } catch (e) {
      console.log("[Lỗi parseEmbedResponse]", e);
      return JSON.stringify({ 
        url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
        mimeType: "video/mp4", 
        isEmbed: false, headers: {}, subtitles: [] 
      });
    }
  }
} // parseDetailResnse, parseEmbedResponse
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HÀM TẠO CUSTOMpo SCRIPT BEGIN ====
function customJS(initialLink) {
  return `
  (function () {
      'use strict';
      
      const IS_TOP = (window.top === window.self);
      const CONTEXT_TAG = IS_TOP ? "[TOP-WINDOW]" : "[IFRAME-WINDOW]";
      
      console.log(CONTEXT_TAG + " 🚀 CustomJS Script initialized at: " + window.location.href);

      let hasSentToBridge = false;

      const rawFetch = window.fetch;
      const rawXHROpen = XMLHttpRequest.prototype.open;

      // ==========================================
      // 1. KIỂM TRA LINK STREAM THỰC TẾ
      // ==========================================
      function isDirectStreamUrl(url) {
        if (!url || typeof url !== 'string') return false;
        if (url.startsWith('blob:') || url.startsWith('data:')) return false;

        // Chỉ nhận diện link media thực sự, BỎ QUA link embed/player như play.php
        const cleanUrl = url.split('?')[0].toLowerCase();
        return cleanUrl.endsWith('.m3u8') || cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mpd') || url.includes('.m3u8?') || url.includes('.mp4?');
      }

      function sendToNativeBridge(playUrl) {
        if (hasSentToBridge) return;

        // Nếu phát hiện ở IFRAME, chuyển tin nhắn ra TOP-WINDOW
        if (!IS_TOP) {
            console.log(CONTEXT_TAG + " 📤 Sending STREAM from IFRAME to TOP:", playUrl);
            try {
                window.top.postMessage({ type: 'TS_STREAM_FOUND', playUrl: playUrl }, '*');
            } catch(e) {}
            hasSentToBridge = true;
            return;
        }

        hasSentToBridge = true;
        const pageUrl = window.location.href;
        console.log(CONTEXT_TAG + " 🎯 [FINAL STREAM FOUND] Calling SnifferBridge.play():", playUrl);

        if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
          try {
            window.SnifferBridge.play(playUrl, pageUrl);
          } catch (err) {
            console.error(CONTEXT_TAG + ' ❌ Error SnifferBridge.play:', err);
          }
        }
      }

      function processDetectedUrl(url, sourceName) {
        if (!url || hasSentToBridge) return;

        try {
            url = new URL(url, window.location.href).href;
        } catch(e) {}

        if (isDirectStreamUrl(url)) {
            console.log(CONTEXT_TAG + \` 💡 Direct Media URL captured via [\${sourceName}]:\`, url);
            sendToNativeBridge(url);
        }
      }

      // ==========================================
      // 2. RECEIVER AT TOP WINDOW
      // ==========================================
      if (IS_TOP) {
          window.addEventListener('message', function (event) {
              if (event.data && event.data.type === 'TS_STREAM_FOUND') {
                  console.log(CONTEXT_TAG + " 📥 Received stream link FROM IFRAME:", event.data.playUrl);
                  sendToNativeBridge(event.data.playUrl);
              }
          });
      }

      // ==========================================
      // 3. HOOK HTML5 MEDIA ELEMENT (Dành cho MP4/M3U8 nạp qua Video Tag)
      // ==========================================
      try {
          const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
          if (originalSrcDescriptor && originalSrcDescriptor.set) {
              Object.defineProperty(HTMLMediaElement.prototype, 'src', {
                  set: function (val) {
                      processDetectedUrl(val, 'HTMLMediaElement.src');
                      return originalSrcDescriptor.set.call(this, val);
                  },
                  get: function () {
                      return originalSrcDescriptor.get.call(this);
                  }
              });
          }
      } catch(e) {}

      // ==========================================
      // 4. HOOK NETWORK (FETCH & XHR)
      // ==========================================
      window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
        processDetectedUrl(url, 'Fetch');
        return rawFetch.apply(this, args);
      };

      XMLHttpRequest.prototype.open = function (method, url) {
        processDetectedUrl(url, 'XHR');
        return rawXHROpen.apply(this, arguments);
      };

      // ==========================================
      // 5. SCAN DOM & IFRAME INTERNAL
      // ==========================================
      function scanDOM() {
          if (hasSentToBridge) return;

          // Quét thẻ video / source
          document.querySelectorAll('video, source, object, embed').forEach(el => {
              const src = el.src || el.getAttribute('src');
              if (src) processDetectedUrl(src, 'DOM-Video');
          });

          // Thử đi xuyên vào DOM của Iframe (Nếu Same-Origin hoặc WebView mở cấp quyền)
          document.querySelectorAll('iframe').forEach(iframe => {
              try {
                  if (iframe.contentDocument) {
                      iframe.contentDocument.querySelectorAll('video, source').forEach(el => {
                          const src = el.src || el.getAttribute('src');
                          if (src) processDetectedUrl(src, 'Iframe-Deep-DOM');
                      });
                  }
              } catch(e) {
                  // Cross-Origin sẽ bị chặn ở đây nếu WebView không cho phép
              }
          });
      }

      const domObserver = new MutationObserver(() => scanDOM());
      domObserver.observe(document.documentElement, { childList: true, subtree: true });

      // Quét định kỳ bổ sung
      setInterval(scanDOM, 1000);

  })();
  `;
}
// ==== HÀM TẠO CUSTOM SCRIPT END ====


// ==== HIDEMENU ====
{
// ## Hàm Hỗ Trợ. Hide function
function iframe64(url){
  var html = `
  <html><style>body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }iframe { width: 100%; height: 100%; object-fit: contain; }</style><body style='margin:0;padding:0;background:#000;'><iframe id='player' src='${url}' scrolling='no' frameborder='0' class='openloadvideo lab-pinned-child' allowfullscreen='true' webkitallowfullscreen='true' mozallowfullscreen='true' name='watch'></iframe></body></html>
  `;
  return "data:text/html;base64," + BASE64.encode(html);
  
}
  
  function getUrlDetail(slug) {
      try {
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
                  if (!node.attrs || node.attrs.class) return false;
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
  function log(msg) {console.log(msg);}
  
BASE64 = {
  encode: function (str) {
    try {
      if (!str) return "";

      // 1. Encode String ra mảng UTF-8 Bytes trước
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
          // Ký tự Surrogate Pair
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

      // 2. Chuyển mảng UTF-8 Bytes thành chuỗi Base64
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

      // 1. Dọn dẹp chuỗi & xử lý nếu URL-encoded (ví dụ: %2B, %2F)
      var str = decodeURIComponent(base64String.trim());

      // Chuyển URL-safe base64 về base64 chuẩn
      str = str.replace(/-/g, "+").replace(/_/g, "/");

      // Bảng ký tự Base64
      var chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var output = [];
      var buffer = 0,
        bits = 0;

      // 2. Decode Base64 thành Mảng Byte
      for (var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if (char === "=") break; // Bỏ qua padding
        var index = chars.indexOf(char);
        if (index === -1) continue; // Bỏ qua ký tự không hợp lệ

        buffer = (buffer << 6) | index;
        bits += 6;

        if (bits >= 8) {
          bits -= 8;
          output.push((buffer >> bits) & 0xff);
        }
      }

      // 3. Decode UTF-8 từ mảng Byte ra String
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

  function checkRaw(scriptStr, returnFixed) {
    try {
      if (!scriptStr || typeof scriptStr !== "string") {
        console.log(
          "[Lỗi escape runJS]\r\n\t Dữ liệu đầu vào không phải là chuỗi hợp lệ!",
        );
        return scriptStr || "";
      }
  
      var lines = scriptStr.split("\n");
      var fixedLines = [];
      var hasError = false;
  
      for (var i = 0; i < lines.length; i++) {
        var currentLine = lines[i];
        var lineNum = i + 1;
        var lineErrorFound = false; // 1. Kiểm tra lỗi escape newline/tab nguy hiểm nằm trần trong chuỗi quote
        // Trường hợp chưa được escape dạng '\\n' hoặc '\\t' trong chuỗi ghép
  
        if (/([^\\]|^)(\r\n|\r|\n)/.test(currentLine)) {
          console.log(
            "[Lỗi escape runJS]\r\n\t Phát hiện xuống dòng chưa escape ở Dòng " +
              lineNum +
              ": " +
              currentLine.trim(),
          );
          lineErrorFound = true;
        } // 2. Kiểm tra lỗi quên escape ký tự Tab trần không hợp lệ
  
        if (/\t/.test(currentLine) && !/\\t/.test(currentLine)) {
          console.log(
            "[Lỗi escape runJS]\r\n\t Phát hiện ký tự Tab trần ở Dòng " +
              lineNum +
              ": " +
              currentLine.trim(),
          );
          lineErrorFound = true;
        } // 3. Kiểm tra dấu xược ngược single trailing backlash ở cuối dòng (dễ làm gãy chuỗi)
  
        if (/([^\\])\\$/.test(currentLine)) {
          console.log(
            "[Lỗi escape runJS]\r\n\t Dấu Backslash (\\) cô đơn ở cuối Dòng " +
              lineNum +
              ": " +
              currentLine.trim(),
          );
          lineErrorFound = true;
        }
  
        if (lineErrorFound) {
          hasError = true;
        } // Tiến hành SỬA LỖI tự động nếu tham số returnFixed = true
  
        var fixedLine = currentLine;
        if (returnFixed) {
          // Chuẩn hóa ký tự xuống dòng và tab đặc biệt
          fixedLine = fixedLine.replace(/\r/g, "").replace(/\t/g, "  "); // Thay Tab trần bằng 2 khoảng trắng cho an toàn
        }
  
        fixedLines.push(fixedLine);
      } // 4. Kiểm tra cú pháp nhanh xem toàn bộ chuỗi có parse được JS không
  
      try {
        new Function(scriptStr);
      } catch (syntaxErr) {
        hasError = true;
        console.log(
          "[Lỗi escape runJS]\r\n\t 💥 LỖI CÚ PHÁP (SyntaxError) toàn cục: " +
            syntaxErr.message,
        );
      }
  
      if (!hasError) {
        console.log("[checkRaw] 🟢 Chuỗi Raw JS hoàn toàn sạch lỗi!");
      } // Trả về bản đã fix hoặc bản gốc theo tham số returnFixed
  
      return returnFixed ? fixedLines.join("\n") : scriptStr;
    } catch (e) {
      console.log(
        "[Lỗi escape runJS]\r\n\t Lỗi ngoại lệ trong hàm checkRaw: " + e.message,
      );
      return scriptStr; // Luôn an toàn: Fallback trả về chuỗi gốc chứ không làm sập script
    }
  }
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
          log("decodeHTMLEntities[err]:\n " + e);
      }
  }
  function clearJS(func) {
      if (typeof func !== "function") return "";
      
      // Lấy toàn bộ mã nguồn của hàm dưới dạng string
      var funcStr = func.toString();
      
      // Dùng Regex bóc tách lấy nội dung bên trong cặp ngoặc nhọn {} đầu tiên và cuối cùng
      var match = funcStr.match(/\{([\s\S]*)\}/);
      if (!match) return "";
      
      var innerCode = match[1].trim();
      
      // (Tùy chọn) Bạn có thể tận dụng luôn hàm checkRaw sẵn có trong template của bạn 
      // để nó tự động rà soát và fix các ký tự xuống dòng/tab nguy hiểm cho an toàn tuyệt đối:
      var safeCode = checkRaw(innerCode, true);
      
      return safeCode;
  }
}
// ==== HIDEMENU ====

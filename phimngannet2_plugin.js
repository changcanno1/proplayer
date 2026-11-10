var BASEURL = "https://phimngan.net";
// ===== CẤU HÌNH & METADATA =====

function getManifest() {
    return JSON.stringify({
        "id": "phimngan",
        "name": "Phim Ngắn [SHORT]",
        "version": "2.8",
        "info": "Update 2.8: Sửa triệt để trích xuất link xem và tránh fallback url rỗng",
        "author": "Alokillgtv",
        "headers": {
          "Referer": BASEURL,
          "Origin": BASEURL,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        },
        "baseUrl": BASEURL,
        "iconUrl": "https://vaxplugin.alokillgtv02.workers.dev/img/phimngan.png",
        "isEnabled": true,
        "isAdult": false,
        "adblock": false,
        "type": "shortfilm",
        "subtitleCat": false,
        "playerType": "exoplayer"
    });
}


function fetchHtml(url){
  var res = httpRequest(url, {
    method: "GET",
    "headers": {
          "Referer": BASEURL,
          "Origin": BASEURL,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        },
  });
  return res.body
}



function getHomeSections() {
    return JSON.stringify([
        { "slug": "/", "title": "Đề Xuất & Mới Cập Nhật", "type": "Grid" },
        { "slug": "/phim-ai", "title": "Phim AI", "type": "Grid" },
        { "slug": "/xuong-phim", "title": "Phim Người Đóng", "type": "Grid" },
        { "slug": "/phim-ngan-trung-quoc", "title": "Phim Ngắn Trung Quốc", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Ngôn Tình", "slug": "/genres/ngon-tinh" },
        { "name": "Tổng Tài", "slug": "/genres/tong-tai" },
        { "name": "Cổ Trang", "slug": "/genres/co-trang" },
        { "name": "Thể Loại Khác", "slug": "/genres|data:isCategory=1" },
        { "name": "Tâm Trạng", "slug": "/moods|data:isCategory=1" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}


// ===== HÀM TẠO URL =====
function getUrlList(slug, filtersJson) {
    var paramPage = "?page=";
    try {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var page = 1;
        var path = slug || "/";
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
        var resultUrl = "https://phimngan.net";
        if (path) {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }
        if (page > 0 && resultUrl.indexOf("page") === -1) {
            resultUrl += paramPage + page;
        }
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        return finalUrl
        //return "https://example.com?linkfetch=" + encodeURI(finalUrl);
    } catch (e) {
        log("getUrlList[err]:\n " + e);
        return "https://phimngan.net";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var paramSearch = "search?q=";
    var paramPage = "&page=";
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (e) {log("getUrlList():\n" + e)}
        }
        var encodedKeyword = encodeURIComponent(keyword || "");
        var resultUrl = "https://phimngan.net" + paramSearch + encodedKeyword;
        if (page > 1) {
            resultUrl += paramPage + page;
        }
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        //return "https://example.com?linkfetch=" + encodeURI(finalUrl);
        log("getUrlSearch[url]: \n" + finalUrl);
        return finalUrl
    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        return "https://phimngan.net";
    }
}

function parseListResponse(html, $url) {
    console.log("listURL\n" + $url);
    try {
        //var linkfetch = $url.match(/linkfetch=([\s\S]+)/i)[1];
        //var html = fetchHtml(linkfetch);
      
        var $doc = _$(html);
        var items = [];
        
        // Trang list hiện dùng /phim/<slug>; đây là trang chi tiết, không phải /watch/
        $doc.find(".grid a[href^='/phim/']").each(function() {
            var href = this.attr("href") || '';
            // Lấy title từ thẻ cha hoặc từ text
            var title = this.text().trim() || this.attr("title") || "";
            // Tìm poster gần nhất
            console.log(href);
            var poster = "";
            var img = this.find("img");
            if (img.length > 0) {
                poster = img.attr("src") || img.attr("data-src") || "";
            }
            // Nếu không có img, tìm trong thẻ cha
            if (!poster) {
                var parent = this.parent();
                var parentImg = parent.find("img");
                if (parentImg.length > 0) {
                    poster = parentImg.attr("src") || parentImg.attr("data-src") || "";
                }
            }
            // Xử lý poster URL (Next.js image)
            if (poster && poster.indexOf("/_next/image") !== -1) {
                // Tìm giá trị nằm sau "url=" cho đến khi gặp dấu "&" hoặc kết thúc chuỗi
                var match = poster.match(/[?&]url=([^&]+)/);
                if (match && match[1]) {
                    poster = decodeURIComponent(match[1]);
                }
            }

            // Lấy slug từ href
            var id = href;
            if(href.indexOf("http") == -1){
              id = BASEURL + href;
            };
            
            if (title.length > 1 && (href.indexOf("/phim/") > -1 || href.indexOf("/watch/") > -1)) {
                items.push({
                    "id": id || "",
                    "title": title || "",
                    "quality": "HD",
                    "episode_current": "Full",
                    "posterUrl": poster || "",
                    "backdropUrl": poster || "",
                    "year": "2026",
                    "lang": "Vietsub"
                });
            }
        });
        
        var $return = JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 9999
            }
        });
        return $return;
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

function parseMovieDetail(html, url) {
    log("parseMovieDetail[url]: \n" + url);
    try {
        var $doc = _$(html);
        var watchPart = url.split("/watch/")[1];
        var id = (watchPart ? watchPart.split("?")[0] : "") || url;
        id = id.replace(/\/+$/, '');
        
        // Lấy title
        var title = $doc.find("h1").text().trim() || $doc.find("title").text().trim();
        // Lấy poster
        var posterUrl = "";
        var metaImage = $doc.find('meta[property="og:image"]').attr("content");
        if (metaImage) {
            posterUrl = metaImage;
        } else {
            var img = $doc.find("img[src*='poster']");
            if (img.length > 0) {
                posterUrl = img.attr("src");
            }
        }
        // Xử lý poster URL
            if (posterUrl && posterUrl.indexOf("/_next/image") !== -1) {
                // Tìm giá trị nằm sau "url=" cho đến khi gặp dấu "&" hoặc kết thúc chuỗi
                var match = posterUrl.match(/[?&]url=([^&]+)/);
                if (match && match[1]) {
                    posterUrl = decodeURIComponent(match[1]);
                }
            }

      
        var backdropUrl = posterUrl;
        
        // Lấy description
        var description = "";
        var descElement = $doc.find(".description, .synopsis, .summary");
        if (descElement.length > 0) {
            description = descElement.text().trim();
        }
        if (!description) {
            var metaDesc = $doc.find('meta[name="description"]').attr("content");
            if (metaDesc) description = metaDesc;
        }
        
        // Lấy thông tin khác
        var year = "2026";
        var yearMatch = description.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) year = yearMatch[0];
        
        var category = "";
        var tags = $doc.find(".tags a, .genres a");
        if (tags.length > 0) {
            var catList = [];
            tags.each(function() {
                var name = this.text().trim();
                if (name) catList.push(name);
            });
            category = catList.join(", ");
        }
        
        // Lấy danh sách phần/tập từ trang chi tiết /phim/<slug>
        var servers = [];
        var episodes = [];
        var _seenParts = {};
        
        // 1. Quét các thẻ link có đường dẫn /watch/ để tìm các phần (Phần 1, Phần 2...)
        var aRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var aMatch;
        while ((aMatch = aRegex.exec(html)) !== null) {
            var aHref = aMatch[1] || "";
            if (aHref.indexOf("/watch/") === -1) continue;
            if (aHref === "/watch" || aHref === "/watch/" || _seenParts[aHref]) continue;
            var aText = aMatch[2].replace(/<[^>]+>/g, "").trim();
            var partMatch = aText.match(/Phần\s*\d+/i);
            if (partMatch) {
                _seenParts[aHref] = 1;
                var watchPartUrl = aHref.indexOf("http") === 0 ? aHref : BASEURL + (aHref.indexOf("/") === 0 ? aHref : "/" + aHref);
                episodes.push({
                    id: watchPartUrl + "?type=thuyet_minh",
                    name: partMatch[0],
                    slug: "part-" + (episodes.length + 1),
                    ids: [
                        { name: "Thuyết Minh", url: watchPartUrl + "?type=thuyet_minh" },
                        { name: "Vietsub", url: watchPartUrl + "?type=vietsub" }
                    ]
                });
            }
        }
        
        // 2. Nếu không có danh sách nhiều phần (phim 1 tập hoặc chỉ có nút Xem phim chung)
        if (!episodes.length) {
            var _watchHref = "";
            var watchHrefMatch = html.match(/href=["'](\/watch\/[^"'\s#?]+|https?:\/\/[^"'\s#?]*\/watch\/[^"'\s#?]+)["']/i) ||
                                 html.match(/"target"\s*:\s*["']([^"']*\/watch\/[^"'\s#?]+)["']/i);
            if (watchHrefMatch && watchHrefMatch[1]) {
                var candidate = watchHrefMatch[1];
                if (candidate !== "/watch" && candidate !== "/watch/" && !candidate.endsWith("/watch") && !candidate.endsWith("/watch/")) {
                    _watchHref = candidate;
                }
            }
            if (!_watchHref) {
                var slugMatch = url.match(/\/(?:phim|watch)\/([^\/?#]+)/);
                if (slugMatch && slugMatch[1]) {
                    _watchHref = "/watch/" + slugMatch[1];
                }
            }
            var _watchUrl = "";
            if (_watchHref) {
                _watchUrl = _watchHref.indexOf("http") === 0 ? _watchHref : BASEURL + (_watchHref.indexOf("/") === 0 ? _watchHref : "/" + _watchHref);
            } else if (url.indexOf("/watch/") !== -1) {
                _watchUrl = url;
            } else {
                var fallbackSlug = String(url).replace(/^.*\/phim\//, "").replace(/\/+$/, "");
                _watchUrl = BASEURL + "/watch/" + fallbackSlug;
            }
            episodes.push({
                id: _watchUrl + "?type=thuyet_minh",
                name: "Xem ngay",
                slug: "full",
                ids: [
                    { name: "Thuyết Minh", url: _watchUrl + "?type=thuyet_minh" },
                    { name: "Vietsub", url: _watchUrl + "?type=vietsub" }
                ]
            });
        }
        servers.push({ name: "Server", episodes: episodes });
       
        
        var $return = JSON.stringify({
            id: url || "",
            title: title || "",
            originName: title || "",
            posterUrl: posterUrl || "",
            backdropUrl: backdropUrl || "",
            description: description || "",
            quality: "HD",
            year: year || "",
            rating: "",
            status: "Hoàn Thành",
            category: category || "",
            episode_current: "Full",
            servers: servers || [],
            duration: "",
            casts: "",
            director: "",
            country: "",
            lang: "Vietsub",
            extra: ""
        });
        return $return;
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

// ===== HÀM TẠO XỬ LÝ STREAM PHIM =====
function parseDetailResponse(html, url) {
    console.log("parseDetailResponse dang xu ly: " + url);
    try {
        var $doc = _$(html);
        var type = getparam(url, "type") || "thuyet_minh";
        var idvd = $doc.find("div[data-video-id]:first").attr("data-video-id");
        var referer = BASEURL + "/";
        var origin = BASEURL;
        var mimetype = "video/mp4";
        var stream = "";
        if (idvd && idvd.indexOf("gamo") > -1) {
            var link = "https://api.phimngan.net/api/v1/video/direct/capability?id=" + idvd + "&audio=" + type;
            console.log("linktoken\n" + link)
            var res = httpRequest(link, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Referer": BASEURL + "/",
                    "Origin": BASEURL
                }
            })
            console.log(res.body);
            if (res.body) {
                var data = JSON.parse(res.body);
                var token = data.token;
                stream = link + "&token=" + token
            } else {
                console.log("post lỗi")
            }
            stream = stream.replace("capability", "")
            var res = httpRequest(stream, {
                method: "GET",
                headers: {
                    "Referer": BASEURL + "/",
                    "Origin": BASEURL
                }
            })
            console.log(JSON.stringify(res.url));
            stream = res.url;
            if (stream.indexOf("gamomephim.com") > -1) {
                referer = "https://gamomephim.com/";
                origin = "https://gamomephim.com"
            }
            console.log("stream:\n" + stream);
        } else {
            // https://api.phimngan.net/api/v1/video/playlist?id=tg-1954&audio=thuyet_minh
            stream = "https://api.phimngan.net/api/v1/video/playlist?id=" + idvd + "&audio=" + type;
            mimetype = "application/x-mpegURL"

            // Không httpRequest trực tiếp: API chỉ cho CORS origin phimngan.
            // Trả URL cho app bỏ qua CORS bằng vax.local/proxy.

        }
        console.log("stream:\n" + stream)
        return JSON.stringify({
            url: stream,
            mimeType: mimetype,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": referer,
                "Origin": origin
            }
        });

    } catch (e) {
        console.log("parseDetailResponse[err]:\n " + e);
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}



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
          var s = String(slug).trim();
          if (s.indexOf('http') === 0) {
              // URL đầy đủ: giữ nguyên /phim/ hoặc /watch/
              log("getUrlDetail[url]: \n" + s);
              return s;
          }
          // Chặn trường hợp chỉ nhận param query lỗi ví dụ ?type=thuyet_minh
          if (s.indexOf('?') === 0) {
              log("getUrlDetail invalid query only: " + s);
              return "";
          }
          s = s.replace(/^\/+/, '');
          // slug rút gọn từ parseMovieDetail.id
          if (s.indexOf('watch/') === 0 || s.indexOf('phim/') === 0) {
              return BASEURL + '/' + s;
          }
          var detailUrl = BASEURL + '/phim/' + s;
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
  
}
// ==== HIDEMENU ====

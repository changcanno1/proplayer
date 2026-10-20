var iddomain = "anime47"
BASEURL = "https://anime47.love" + iddomain;

var BASEAPI = "https://animevui.com/api"
var BASEHOST = "https://anime47.alokillgtv.workers.dev/api";
var BASELINK = BASEAPI;
var popup_html = "";
NEWDOMAIN = false;
// https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/phimchill.ico
function getManifest() {
  try{
    return JSON.stringify({
      "id": "anime47",
      "name": "Anime47 [ANIME]",
      "description": "Nguồn phim Anime47",
      "version": "2.1",
      "author": "Alokillgtv",
      "info": "Nguồn phim Anime của VN.\nNguồn có server riêng nên xem video rất nhanh và mượt.",
      "baseUrl": "https://anime47.best",
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/anime47.png",
      "playerType": "exoplayer",
      "type": "ANIME",
      "isEnabled": true,
      "isAdult": false,
      "adblock": true,
      "subtitleCat": false
      
    });
  }
  catch(e){
    return JSON.stringify({
      "id": "loiapp",
      "name": "Plugin bị lỗi cài đặt",
      "version": "2.0",
      "info": "Plugin đang bị lỗi: \n" + e,
      "baseUrl": "http://vkey.vn/",
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/anime47.png",
      "isEnabled": true,
      "type": "MOVIE",
      "playerType": "exoplayer"
     });
  }
}

if (NEWDOMAIN) {
    if (typeof httpRequest === "function") {
        var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {
            method: "POST"
        });
        if (res && res.isSuccessful) {
            var resobj = JSON.parse(res.body);
            if (resobj[iddomain]) {
                BASEURL = resobj[iddomain].new;
            }
        } 
    } 
} 

console.log("BASEURL " + BASEURL);


// "popup_html": popup_html
// ===== HÀM MENU LIST BEGIN ======
{
// Tạo List phim ở menu Home
  // https://anime47.best/filter/trang-1?sort=latest
  // https://anime47.love/api/search/full/?lang=vi&keyword=naruto&page=1
  // https://anime47.love/api/anime/filter?lang=vi&sort=latest&page=5
  // https://anime47.love/api/genres/action/anime?lang=vi&page=1
  // https://anime47.love/api/list/dang/tv-series?lang=vi&page=1
  function getHomeSections() {
      localStorage.clear();
      return JSON.stringify([
          {"slug": "/list/dang/specials?lang=vi","title": "Đặc Biệt","type": "Horizontal"},
          {"slug": "/list/dang/ova-series?lang=vi","title": "Ova Series","type": "Horizontal"},
          {"slug": "/list/dang/movies?lang=vi","title": "Anime Movies","type": "Horizontal"},
          {"slug": "/list/dang/tv-series?lang=vi","title": "Anime Bộ","type": "Horizontal"},
          {"slug": "/anime/filter?lang=vi&sort=latest","title": "Anime Mới","type": "Grid"},
      ]);
  }
  // https://anime47.love/api/anime/filter?lang=vi&page=5&sort=latest
  
  // Hàm khởi tạo thẻ chủ đề
  function getLISTmenu(){
    try{
      return `[
        {"link": "/genres/action/anime?lang=vi", "name": "Hành Động"},
        {"link": "/genres/adventure/anime?lang=vi", "name": "Phiêu Lưu"},
        {"link": "/genres/comedy/anime?lang=vi", "name": "Hài Hước"},
        {"link": "/genres/drama/anime?lang=vi", "name": "Tâm Lý"},
        {"link": "/genres/fantasy/anime?lang=vi", "name": "Huyền Ảo"},
        {"link": "/genres/horror/anime?lang=vi", "name": "Kinh Dị"},
        {"link": "/genres/mystery/anime?lang=vi", "name": "Bí Ẩn"},
        {"link": "/genres/romance/anime?lang=vi", "name": "Tình Cảm"},
        {"link": "/genres/scifi/anime?lang=vi", "name": "Viễn Tưởng"},
        {"link": "/genres/slice-of-slice/anime?lang=vi", "name": "Đời Thường"},
        {"link": "/genres/sports/anime?lang=vi", "name": "Thể Thao"},
        {"link": "/genres/supernatural/anime?lang=vi", "name": "Siêu Nhiên"}
      ]
`;
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
  function getUrlList(slug, filtersJson) {
      var paramPage = "&page=";
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
                resultUrl += paramPage + page;        
          }
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          return finalUrl;
      } catch (e) {
          log("getUrlList[err]:\n " + e);
          return BASEURL;
      }
  }
  // https://anime47.love/api/search/full/?lang=vi&keyword=naruto&page=1
  function getUrlSearch(keyword, filtersJson) {
      var paramSearch = "/search/full/?lang=vi&keyword=";
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
          
          var resultUrl = BASELINK + paramSearch + encodedKeyword;
          if (page > 1) {
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
} // getUrlList, getUrlSearch
// http://vkey.vn/animevv
// /quoc-gia/M%E1%BB%B9
// /
//filtersJson = "{page:5}"
//getUrlList("/top", filtersJson)
//getUrlSearch("girl", filtersJson)
// ===== HÀM TẠO URL END ======

// ===== HÀM TẠO KHỐI LIST PHIM BEGIN ======
function parseListResponse(html, $url) {
    try {
        var $data = JSON.parse(html);
        var check = "";
        if($url.indexOf("search") > -1){
          var $list = $data.results;
          check = true;
        }
        else{
          var $list = $data.data.posts;
          check = false;
        }
        var items = [];
        $list.forEach(function(item) {
            var id = BASEHOST + "/anime/info/" + item.id + "?lang=vi";
            var title = item.title;         
            if(check == true){
              var poster = item.image;
            }
            else{
              var poster = item.poster;
            }
            var background = poster;
            var quality = item.type;
            var status = item.status;
            if (item.status) {
                status = status.replace(/Ongoing/, "Đang Ra").replace(/Completed/, "Hoàn Thành").replace(/Upcoming/, "Sắp Ra");
            }
            var episode_current = "Tập " + item.current_episode;
            var year = item.year;
            var lang = status;
            if (title.length > 1 && poster.length > 5) {
                items.push({
                    "id": id || "",
                    "title": title || "",
                    "quality": quality || "",
                    "episode_current": episode_current || "",
                    "posterUrl": poster || "",
                    "backdropUrl": background || "",
                    "year": year || "",
                    "lang": lang || ""
                });
            }
        })

        //console.log("List item ["+$url+"]: \n" + JSON.stringify(items))
        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 9999
            }
        });
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
        var $data = JSON.parse(html);
        var extra = "";
        var servers = [];
        var episodes = [];
        if (!$data.teams) {
            // https://black-dew-dda7.alokillgtv03.workers.dev/api/anime/9585/episodes?lang=vi         
            var item = $data.data;
            var extra = BASEHOST + "/anime/" + item.id + "/episodes?lang=vi";
            var id = BASEHOST + "/anime/info/" + item.id + "?lang=vi";;
            var posterUrl = item.poster;
            var backdropUrl = item.poster;
            var title = item.title;
            var description = item.description;
            var director = "r";
            var casts = "";
            var category = "";
            // menu category
            var duration = item.duration === "Unknown" ? "" : item.duration;
            var status = item.status != null ? item.status.replace(/Ongoing/, "Đang Ra").replace(/Completed/, "Hoàn Thành").replace(/Upcoming/, "Sắp Ra") : item.status;
            var episode_current = "Tập " + item.episodes.total;
            var year = item.year;
            var quality = item.quality;
            var rating = item.rating;
            var country = "";
            if (item.genres.length > 0) {
                var merge = [];
                // https://anime47.love/api/genres/action/anime?lang=vi&page=1
                item.genres.forEach(function(box) {
                    var link = "";
                    if (box.link) {
                        link = box.link.replace("the-loai", "genres") + "/anime?lang=vi";
                    }
                    merge.push("[" + box.name + "](" + link + ")");
                })
                category = merge.join(", ");
            }
            
    
    
            if (item.characters.length > 0) {
                var merge = [];
                // https://anime47.love/api/genres/action/anime?lang=vi&page=1
                item.characters.forEach(function(box) {
                    var role = box.role;
                    if (role) {
                        role = role.replace("main", "Chính").replace("supporting", "Phụ");
                    }
                    var name = box.name + " [" + role + "]"
                    merge.push(name);
                })
                casts = merge.join(", ");
            }
            
    
            if (item.producers.length > 0) {
                var merge = [];
                // https://anime47.love/api/genres/action/anime?lang=vi&page=1
                item.producers.forEach(function(box) {
                    var link = box.link + "/anime?lang=vi";
                    var name = box.title;
                    if (name) {
                        name.join(" - ");
                    }
                    merge.push(name);
                })
                director = merge.join(", ");
            }
            
        } else {
            var episodes = [];
            $data.teams.forEach(function(box, index) {
                if (box.groups) {
                    box.groups.forEach(function(parent) {
                        if (parent.episodes) {
                            parent.episodes.forEach(function(child) {
                                episodes.push({
                                    id: BASEHOST + "/anime/watch/episode/" + child.id + "?lang=vi",
                                    name: "Tập " + child.number,
                                    slug: "tap-" + child.number
                                })
                            })
                        }
                    })
                }
                servers.push({
                    name: "Server " + (index + 1),
                    episodes: episodes
                })
            })

        }

        return JSON.stringify({
            id: url || "",
            title: title || "",
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
            extra: extra || ""
        });

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
        var stream = "";
        var customJS = "";
        var data = JSON.parse(html);
        
        // 1. Lọc và ưu tiên stream (Thuyết minh/Lồng tiếng > Phụ đề)
        var streams = data.streams || [];
        var selectedStream = streams.find(function(s) {
            return s.server_name && s.server_name.toLowerCase() !== "phụ đề";
        }) || streams[0];

        var streamUrl = selectedStream ? selectedStream.url : "";

        // 2. Lưu link stream vào localStorage và xoay vòng (round-robin)
      
        // 3. Lấy phụ đề tiếng Việt và tiếng Anh, kèm mimeType chuẩn
        var subtitles = (selectedStream && selectedStream.subtitles) || [];
        var targetLangs = ["Tiếng Việt", "English"];

        var subsObject = [];
        subtitles.forEach(function(sub) {
            var langUpper = "";
            if (sub.label === "Tiếng Việt") {
                langUpper = "Việt";
            } else if (sub.label === "English") {
                langUpper = "ENG";
            }

            if (targetLangs.indexOf(sub.label) !== -1) {
                var mimeType = "text/vtt";
                if (sub.file.indexOf(".srt") !== -1) {
                    mimeType = "application/x-subrip";
                }

                subsObject.push({
                    url: sub.file,
                    lang: langUpper,
                    mimeType: mimeType
                });
            }
        });

        // --- BỔ SUNG: Lưu danh sách phụ đề vào localStorage theo ID nội dung ---
        if (data.id) {
            var subStorageKey = "subtitles_" + data.id;
            localStorage.setItem(subStorageKey, JSON.stringify(subsObject));
            // Lưu thêm một key toàn cục phòng trường hợp ở hàm embed không có ID
            localStorage.setItem("latest_subtitles", JSON.stringify(subsObject));
        }

        console.log("parseDetailResponse fetch\n" + streamUrl);
        return JSON.stringify({
            url: streamUrl,
            mimeType: "application/x-mpegURL",
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://anime47.best/",
                "Origin": "https://anime47.best",
            },
            subtitles: subsObject
        });
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
    log("parseEmbedResponse [url]: " + url);
    try {
        var customJS = clearJS(rawJS);
        var m3u8Content = html;

        // 1. Tách lấy đường dẫn /m3u8/... từ nội dung html
        var parts = m3u8Content.split(/\s+/);
        var targetPath = "";
        for (var i = 0; i < parts.length; i++) {
            var item = parts[i].trim();
            if (item.indexOf("/m3u8/") === 0 || item.indexOf("http") === 0) {
                targetPath = item;
                break;
            }
        }

        // 2. Tạo link full m3u8 HTTP
        var realM3u8Url = targetPath.indexOf("http") === 0 ? targetPath : "https://pl.vlogphim.net" + targetPath;

        // --- BỔ SUNG: Đọc danh sách phụ đề từ localStorage ---
        var subsObject = [];
        try {
            // Thử trích xuất ID từ URL embed nếu có (ví dụ: .../file/8a93...)
            var urlMatch = url.match(/\/file\/([a-zA-Z0-9]+)/);
            var fileId = urlMatch ? urlMatch[1] : "";
            
            var savedSubs = null;
            if (fileId) {
                savedSubs = localStorage.getItem("subtitles_" + fileId);
            }
            
            // Nếu không tìm thấy theo ID, lấy từ key phụ đề mới nhất
            if (!savedSubs) {
                savedSubs = localStorage.getItem("latest_subtitles");
            }

            if (savedSubs) {
                subsObject = JSON.parse(savedSubs);
            }
        } catch (subErr) {
            console.log("[Lỗi đọc subtitles từ localStorage]:", subErr);
        }

        console.log("Link stream HTTP gửi Player:", realM3u8Url);

        // 3. Trả về JSON hoàn chỉnh kèm phụ đề đã lưu
        return JSON.stringify({
            url: realM3u8Url,
            mimeType: "application/x-mpegURL",
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                "Referer": "https://anime47.best/",
                "Origin": "https://anime47.best",
                "Accept-Language": "vi-VN",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "cross-site",
                "Block-Ads": false,
                "Block-Css": "",
                "Custom-Js": customJS
            },
            subtitles: subsObject
        });
    } catch (e) {
        console.log("[Lỗi parseEmbedResponse]", e);
        return JSON.stringify({ 
          url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
          mimeType: "video/mp4", 
          isEmbed: false, headers: {}, subtitles: [] 
        });
    }
}



} // parseDetailResponse, parseEmbedResponse
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HÀM TẠO CUSTOM SCRIPT BEGIN ====
function rawJS(){
 function LOG(msg, check) {
    var logMsg = msg;
    if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
      window.SnifferBridge.log(logMsg);
      if (check === true) {
        window.SnifferBridge.toast(logMsg, 1000);
      }
    } else if (typeof console !== 'undefined' && console.log) {
      console.log(logMsg);
    }
  }
  try{
    LOG("Test");
  } catch(e){
    LOG("Lỗi CUSTOMJS: \n" + e);
  }
}
// ==== HÀM TẠO CUSTOM SCRIPT END ====


// ==== HIDEMENU ====
{
// ## Hàm Hỗ Trợ. Hide function
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
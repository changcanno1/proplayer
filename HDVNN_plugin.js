var BASEURL = "https://hdvnn.xyz";
var BASEAPI = "http://vkey.vn/novahd/api";
var BASELINK = BASEURL;

function getManifest() {
  try{
    return JSON.stringify({
      "id": "hdvnn",
      "name": "Nguồn HDVNN",
      "version": "1.3.1",
      "author": "Alokillgtv",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/hdvnn.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "type": "MOVIE",
      "subtitleCat": false,
      "playerType": "auto"
    });
  }
  catch(e){
    return JSON.stringify({
      "id": "loiapp",
      "name": "Plugin bị lỗi cài đặt",
      "version": "1.0",
      "info": "Plugin đang bị lỗi: \n" + e,
      "baseUrl": "http://vkey.vn/",
      "iconUrl": "https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/novahd.png",
      "isEnabled": true,
      "type": "MOVIE",
      "playerType": "exoplayer"
     });
  }
}

{
  function getHomeSections() {
      localStorage.clear();
      return JSON.stringify([
          {"slug": "/loc-phim/W1tdLFtdLFsxXSxbXV0=","title": "Phim Lẻ","type": "Horizontal"},
          {"slug": "/loc-phim/W1tdLFtdLFsyXSxbXV0=","title": "Phim Bộ","type": "Horizontal"},
          {"slug": "/the-loai/phim-chieu-rap.html","title": "Phim Chiếu Rạp","type": "Horizontal"},
          {"slug": "/phim-moi-cap-nhap.html","title": "Phim Mới Cập Nhật","type": "Grid"},
      ]);
  }
  
  function getLISTmenu() {
    try{
      return `[{"link":"/phim-moi-cap-nhap.html","name":"Phim Mới"},{"link":"/the-loai/phim-han-quoc.html","name":"Phim Hàn Quốc"},{"link":"/the-loai/phim-trung-quoc.html","name":"Phim Trung Quốc"},{"link":"/the-loai/phim-chau-a.html","name":"Phim Châu Á"},{"link":"/the-loai/phim-au-my.html","name":"Phim Âu-Mỹ"},{"link":"/the-loai/hh-trung-quoc.html","name":"HH Trung Quốc"},{"link":"/the-loai/anime-nhat-ban.html","name":"Anime Nhật Bản"},{"link":"/the-loai/phim-chieu-rap.html","name":"Phim Chiếu Rạp"},{"link":"/loc-phim/W1tdLFtdLFsxXSxbXV0=","name":"Phim Lẻ"},{"link":"/loc-phim/W1tdLFtdLFsyXSxbXV0=","name":"Phim Bộ"}]`;
    } catch(e){
      log("getLISTmenu[err]:\n " + e);
      return `[
        {"link":"/","name":"Đang lỗi getLISTmenu()"},
      ]`;
    }
  }
}

{
  function getUrlList(slug, filtersJson) {
      var paramPage = "?p=";
      try {
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
  
  function getUrlSearch(keyword, filtersJson) {
      var paramSearch = "/tim-kiem/";
      var paramPage = "?p=";
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
          
          var resultUrl = BASELINK + paramSearch + encodedKeyword + ".html";
          if (page > 1) {
              resultUrl += paramPage + page;
          }
  
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          return finalUrl;
  
      } catch (e) {
          log("getUrlSearch[err]:\n " + e);
          return BASEURL;
      }
  }
}

function parseListResponse(html, $url) {
    try {
      var $doc = _$(html);
      var items = [];
      $doc.find(".movie-item").each(function() {
          var id = this.find("a").attr("href");
          var title = this.find("a").attr("title");;
          var poster = this.find("img").attr("src");
          var background = poster;
          var quality = this.find(".score").text();
          var episode_current = this.find(".episode-latest").text();
          var year = "";
          var lang = "";
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
      var $return = JSON.stringify({
          "items": items,
          "pagination": {
              "currentPage": 1,
              "totalPages": 9999
          }
      });
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

function parseMovieDetail(html, url) {
    log("parseMovieDetail[url]: \n" + url);
    try {
        var $doc = _$(html);
        var id = url;
        var posterUrl = $doc.find(".head img").attr("src");
        var backdropUrl = posterUrl;
        var title = $doc.find(".name_other div:last").text();
        var originName = $doc.find("h1").text();
        var description = $doc.find("h2:content('Nội|dung')").closest(".desc").find("p:last").text();
        var director = "";
        var casts = "";
        var merge = [];
        $doc.find(".list_cate:content('Thể|loại:')").find("a").each(function() {
            merge.push("[" + this.text() + "](" + this.attr("href") + ")");
        })
        var category = merge.join(", ");
        var duration = "";
        var status = $doc.find(".status div:last").text();
        var episode_current = "Tập " + $doc.find(".duration:content('Thới|lượng') div:last").text();
        var year = $doc.find(".update_time div:last").text();;
        var quality = "";
        var lang = $doc.find(".duration:content('Ngôn|ngữ') div:last").text();
        var rating = "";
        var country = "";
        var extra = "";
        var servers = [];
        var episodes = [];
        if($doc.find(".list-item-episode a").length == 1){
          var link = $doc.find(".list-item-episode a").attr("href");
          episodes.push({
                id: link + "?server=1",
                name: "Google",
                slug: "full"
          },{
                id: link + "?server=2",
                name: "Dự Phòng",
                slug: "full"
          },{
                id: link + "?server=3",
                name: "Embed",
                slug: "full"
          });
          servers.push({
                name: "Server",
                episodes: episodes
          })  
        }
        else{
          $doc.find(".list-item-episode a").each(function() {
            episodes.push({
                id: this.attr("href") + "?server=1",
                name: "Tập " + this.attr("title"),
                slug: "tap-" + this.attr("title")
            })
          })
          
          // Đã sửa lại cú pháp ES6 (arrow functions và spread operator) thành ES5 chuẩn cho iOS
          var episodes2 = episodes.map(function(item) {
            return {
                id: item.id.replace("server=1", "server=2"),
                name: item.name,
                slug: item.slug
            };
          });
          var episodes3 = episodes.map(function(item) {
             return {
                 id: item.id.replace("server=1", "server=3"),
                 name: item.name,
                 slug: item.slug
             };
          });
            
          servers.push({
              name: "Google",
              episodes: episodes
          }, {
              name: "Dự Phòng",
              episodes: episodes2
          }, {
              name: "Embed",
              episodes: episodes3
          });
          servers = sortEpisodesByName(servers);
        }
        
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
            extra: extra || ""
        });
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

function parseDetailResponse(html, url) {
  try {
    var $doc = _$(html);
    var movieID = $doc.find('input[name="movie_id"]').attr("value");
    var epID = $doc.find('input[name="Episode_id"]').attr("value");
    var referer = url.replace(/([\s\S]*)\?server=\d/i, "$1");
    var server = url.replace(/[\s\S]*\?server=(\d)/i, "$1");

    var $return = JSON.stringify({
      url: "https://hdvnn.xyz/server/ajax/player",
      isEmbed: true,
      postBody: "MovieID=" + movieID + "&EpisodeID=" + epID,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Referer": referer,
        "Origin": "https://hdvnn.xyz",
        "x-requested-with": "XMLHttpRequest"
      },
      datasend: JSON.stringify({ run: 1, server: String(server) })
    });

    return $return;
  } catch (e) {
    return JSON.stringify({ 
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
      mimeType: "video/mp4", 
      isEmbed: false, headers: {}, subtitles: [] 
    });
  }
}

function parseEmbedResponse(html, url, datare) {
  try {    
    var datasend = {};
    if (typeof datare === "string") {
      var cleanDatare = datare
        .replace(/'/g, '"')
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      datasend = JSON.parse(cleanDatare);
    } else if (typeof datare === "object" && datare !== null) {
      datasend = datare;
    }

    if (datasend.run == 1 || datasend.run == "1") {
      var $data = typeof html === "string" ? JSON.parse(html) : (html || {});

      // SERVER 1 - Đã sửa isEmbed thành true cho iOS
      if (datasend.server == "1") {
        if ($data.src_pt || $data.src_go) {
          var embedUrl = $data.src_pt || $data.src_go;
          return JSON.stringify({
            url: embedUrl, 
            mimeType: "text/html",
            isEmbed: true, 
            headers: {
              "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
              "Origin": "https://hdvnn.xyz"
            },
            datasend: JSON.stringify({ run: 2 })
          });
        }
      }

      // SERVER 2
      if (datasend.server == "2") {
        if ($data.src_vnn_1 || $data.src_vnn_2) {
          var link = $data.src_vnn_1 ? $data.src_vnn_1 : $data.src_vnn_2;
          return JSON.stringify({
            url: link, 
            isEmbed: true, 
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Origin": "https://hdvnn.xyz"
            },
            datasend: JSON.stringify({ run: 2 })
          });
        } 
      } 

      // SERVER 3 - Đã sửa isEmbed thành true cho iOS
      if (datasend.server == "3") {
        var embedUrl =  $data.src_hy || $data.src_ok || $data.src_vk;
        if (embedUrl) {
          if(embedUrl.indexOf("abyss") > -1){
            var path =  embedUrl.replace("https://player.abyssplayer.com/","");
            embedUrl = "https://abysscdn.com/?v=" + path;
          }
          
          return JSON.stringify({
            url: "https://iframe.alokillgtv.workers.dev/?url=" + embedUrl, 
            mimeType: "text/html",
            isEmbed: true, 
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Origin": "https://hdvnn.xyz"
            },
            datasend: JSON.stringify({ run: 2 })
          });
        }
      }
    }

    if (datasend.run == 2 || datasend.run == "2") {
      var streamUrl = getLinkHTML(html);
      if (streamUrl) {
        return JSON.stringify({
          url: streamUrl, 
          mimeType: "video/mp4",
          isEmbed: false, 
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Origin": "https://hdvnn.xyz"
          },
          datasend: JSON.stringify({ run: 3 })
        });
      }
    }

    return JSON.stringify({ url: "", isEmbed: false, headers: {} });

  } catch (e) {
    return JSON.stringify({ 
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
      mimeType: "video/mp4", 
      isEmbed: false, headers: {}, subtitles: [] 
    });
  }
}

// Đã loại bỏ hoàn toàn const/let/arrow function để tránh crash cú pháp trên iOS
function getLinkHTML(inputContent, domain) {
    if (!domain) domain = 'https://cdn.hdvideo.homes';
    var code = inputContent;

    var unpackRegex = /eval\s*\(\s*function\s*\([^\)]*\)\s*\{[\s\S]*?\}\s*\(\s*'((?:\\.|[^'])*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:\\.|[^'])*)'\.split\('\|'\)/;
    var match = inputContent.match(unpackRegex);
    if (match) {
        var rawP = match[1];
        var rawA = match[2];
        var rawC = match[3];
        var rawK = match[4];
        var p = rawP.replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        var a = parseInt(rawA, 10), c = parseInt(rawC, 10), k = rawK.split('|');
        function e(c) { return (c < a ? '' : e(Math.floor(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)); }
        var dict = {};
        while (c--) { var key = e(c); dict[key] = k[c] !== '' ? k[c] : key; }
        code = p.replace(/\b\w+\b/g, function(token) { return dict[token] !== undefined ? dict[token] : token; });
    }

    var sourceRegex = /['"]?label['"]?\s*:\s*['"](\d+)p['"][\s\S]*?['"]?file['"]?\s*:\s*['"]([^'"]+)['"]/g;
    var sourceMatch;
    var maxRes = -1;
    var bestPath = "";

    while ((sourceMatch = sourceRegex.exec(code)) !== null) {
        var res = parseInt(sourceMatch[1], 10);
        if (res > maxRes) {
            maxRes = res;
            bestPath = sourceMatch[2];
        }
    }

    if (!bestPath) return "";
    bestPath = bestPath.replace(/\/stream\/\d+\//, '/stream/' + maxRes + '/');
    return domain + bestPath;
}

{
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
          return detailUrl;
      } catch (e) {
          return "";
      }
  }
  function getUrlCategories() { 
      try {
          return BASEURL; 
      } catch (e) {
          return "";
      }
  }
  function getUrlCountries() { 
      try {
          return ""; 
      } catch (e) {
          return "";
      }
  }
  function getUrlYears() { 
      try {
          return ""; 
      } catch (e) {
          return "";
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
  function parseCountriesResponse(html) {
      try {
          return "[]";
      } catch (e) {
          return "[]";
      }
  }
  function parseYearsResponse(html) {
      try {
          return "[]";
      } catch (e) {
          return "[]";
      }
  }
  function parseSearchResponse(html, url) {
      try {
          return parseListResponse(html, url);
      } catch (e) {
          return JSON.stringify({
              "items": [],
              "pagination": {
                  "currentPage": 1,
                  "totalPages": 1
              }
          });
      }
  }
  
  function getPrimaryCategories() {
      try {
          var listurl = getLISTmenu();
          var menulist = buildMenu(listurl);
          return JSON.stringify(menulist);
      } catch (e) {
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
          return JSON.stringify({ category: [] });
      }
  }
  
  function buildMenu(menuStr, type) { 
      var menuArray = JSON.parse(menuStr); 
      var menulist = []; 
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

  function log(msg) {console.log(msg);}
  
  function sortEpisodesByName(data) {
      try {
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
          return data;
      } catch (e) {
          return data;
      }
  }
}

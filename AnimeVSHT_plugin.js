BASEURL = "https://animevietsub.vc"
BASELINK = BASEURL;
BASESOURCE = "";

function getManifest() {
    return JSON.stringify({
        "id": "animevietsubvip",
        "name": "Nguồn Animevietsub Vip",
        "version": "1.6.7",
        "info": "",
        "BASEURL": "https://clbpx.alokillgtv.workers.dev",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/animevietsubvip.png",
        "isEnabled": true,
        "isAdult": false,
        "adblock": false,
        "type": "ANIME",
        "author":"alokillgtv",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'anime-bo', title: 'Anime Bộ', type: 'Horizontal', path: 'anime-bo' },
        { slug: 'anime-le', title: 'Anime Lẻ/Movie', type: 'Horizontal', path: 'anime-le' },
        { slug: 'hoat-hinh-trung-quoc', title: 'HH Trung Quốc', type: 'Horizontal', path: 'hoat-hinh-trung-quoc' },
        { slug: 'anime-sap-chieu', title: 'Anime Sắp Chiếu', type: 'Horizontal', path: 'anime-sap-chieu' },
        { slug: 'anime-moi', title: 'Anime Mới Cập Nhật', type: 'Grid', path: '/' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Anime Bộ', slug: 'anime-bo' },
        { name: 'Anime Lẻ', slug: 'anime-le' },
        { name: 'HH Trung Quốc', slug: 'hoat-hinh-trung-quoc' },
        { name: 'Anime Sắp Chiếu', slug: 'anime-sap-chieu' },
        { name: 'Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Phiêu Lưu', slug: 'the-loai/phieu-luu' },
        { name: 'Hài Hước', slug: 'the-loai/hai-huoc' },
        { name: 'Phép Thuật', slug: 'the-loai/phep-thuat' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'latest' },
            { name: 'Lượt xem', value: 'view' },
            { name: 'Bình chọn', value: 'rating' }
        ]
    });
}

// Helper log
function log(msg) {
    if (typeof console !== 'undefined' && console.log) {
        console.log("[AnimeVsubPlugin] " + msg);
    }
}

// =============================================================================
// URL GENERATION
// =============================================================================

{
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
              
              if(resultUrl.indexOf("?") > -1){
                paramPage = "/" + paramPage;
              }
              else{
                paramPage = "/" + paramPage;
              }
              resultUrl += paramPage + page;
          }
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          return finalUrl  + ".html";
      } catch (e) {
          log("getUrlList[err]:\n " + e);
          return BASEURL;
      }
  }
  
  function getUrlSearch(keyword, filtersJson) {
      var paramSearch = "/tim-kiem/";
      var paramPage = "trang-";
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
          if (page > 0) {
            if(resultUrl.indexOf("?") > -1){
                paramPage = "/" + paramPage;
              }
              else{
                paramPage = "/" + paramPage;
              }
              resultUrl += paramPage + page;
          }
  
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          
          log("getUrlSearch[url]: \n" + finalUrl);
          return finalUrl + ".html";
  
      } catch (e) {
          log("getUrlSearch[err]:\n " + e);
          return BASEURL;
      }
  }
} 

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    // Clean slug
    var cleanSlug = slug;
    if (cleanSlug.startsWith("/")) cleanSlug = cleanSlug.substring(1);
    if (cleanSlug.startsWith("phim/")) cleanSlug = cleanSlug.substring(5);
    
    return BASEURL + "/phim/" + cleanSlug;
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return BASEURL; }
function getUrlYears() { return BASEURL; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlContent, url) {
    try {
        console.log(url);
        var movies = [];
        var seen = {};
        
        // Helper: extract movie from card HTML
        function extractMovie(cardHtml) {
            var linkMatch = /<a\s+[^>]*href="([^"]*\/phim\/[^"]+)"[^>]*(?:title="([^"]+)")?/i.exec(cardHtml);
            if (!linkMatch) {
                linkMatch = /<a\s+href="([^"]+)"\s+title="([^"]+)"/i.exec(cardHtml);
            }
            if (!linkMatch) return null;

            var href = linkMatch[1];
            var slug = href;
            var slugMatch = /\/phim\/([^/]+)/.exec(href);
            if (slugMatch) {
                slug = slugMatch[1];
            } else {
                slug = href.substring(href.lastIndexOf('/') + 1) || href;
            }
            // Loại bỏ trailing slash
            slug = slug.replace(/\/$/, '');
            if (seen[slug]) return null;
            seen[slug] = true;
            
            var epMatch = /<span class="mli-eps">[\s\S]*?<i>([^<]+)<\/i>/i.exec(cardHtml);
            var episode_current = epMatch ? "Tập " + epMatch[1].trim() : "";

            var imgMatch = /<img[^>]*(?:src|data-src)="([^"]+)"/i.exec(cardHtml);
            var posterUrl = imgMatch ? imgMatch[1] : "";

            // Title: h2.Title hoặc div.Title hoặc fallback title attribute
            var titleMatch = /<h2[^>]*class="Title"[^>]*>([\s\S]*?)<\/h2>/i.exec(cardHtml)
                || /<div class="Title">([\s\S]*?)<\/div>/i.exec(cardHtml);
            var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : (linkMatch[2] || "");

            var year = 0;
            var yearMatch = /<span class="Date[^"]*">\s*(\d{4})\s*<\/span>/i.exec(cardHtml)
                || /\((\d{4})\)/.exec(title);
            if (yearMatch) year = parseInt(yearMatch[1]);

            return {
                id: slug + "/xem-phim.html",
                title: title,
                posterUrl: posterUrl,
                backdropUrl: posterUrl,
                year: year,
                quality: "FHD",
                episode_current: episode_current,
                lang: "Vietsub"
            };
        }

        // Pattern 1: <article class="TPost C ..."> (trang danh mục)
        var articlePattern = /<article class="TPost[^"]*">[\s\S]*?<\/article>/gi;
        var match;
        while ((match = articlePattern.exec(htmlContent)) !== null) {
            var movie = extractMovie(match[0]);
            if (movie) movies.push(movie);
        }

        // Pattern 2: <li> trong <ul class="MovieList Newepisode"> (trang chủ)
        if (movies.length === 0) {
            var listBlock = /<ul class="MovieList Newepisode">[\s\S]*?<\/ul>/i.exec(htmlContent);
            if (listBlock) {
                var liPattern = /<li>[\s\S]*?<\/li>/gi;
                while ((match = liPattern.exec(listBlock[0])) !== null) {
                    var movie = extractMovie(match[0]);
                    if (movie) movies.push(movie);
                }
            }
        }

        // Pattern 3: Fallback - <div class="TPost B"> (sidebar cards)
        if (movies.length === 0) {
            var divPattern = /<div class="TPost[^"]*">[\s\S]*?<\/div>\s*<\/div>/gi;
            while ((match = divPattern.exec(htmlContent)) !== null) {
                var movie = extractMovie(match[0]);
                if (movie) movies.push(movie);
            }
        }

        // Parse phân trang
        var totalPages = 1;
        var lastPageMatch = /href="[^"]*trang-(\d+)\.html"[^>]*>Trang Cuối<\/a>/i.exec(htmlContent);
        if (lastPageMatch) {
            totalPages = parseInt(lastPageMatch[1]);
        } else {
            var pagePattern = /class="page[^"]*">(\d+)<\/a>/gi;
            var pMatch;
            while ((pMatch = pagePattern.exec(htmlContent)) !== null) {
                var pNum = parseInt(pMatch[1]);
                if (pNum > totalPages) totalPages = pNum;
            }
        }

        var currentPage = 1;
        var curPageMatch = /class="[^"]*current[^"]*">(\d+)<\/span>/i.exec(htmlContent);
        if (curPageMatch) currentPage = parseInt(curPageMatch[1]);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages
            }
        });
    } catch (e) {
        log("parseListResponse error: " + e.message);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(htmlContent) {
    return parseListResponse(htmlContent);
}

function parseMovieDetail(htmlContent, url) {
    try {
        var $doc = _$(htmlContent);
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) || /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
        var id = idMatch ? idMatch[1] : "";

        var titleMatch = /<h1[^>]* itemprop="name">([\s\S]*?)<\/h1>/i.exec(htmlContent) || /<h1 class="title">([\s\S]*?)<\/h1>/i.exec(htmlContent);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : "";
        var description = $doc.find(".Description").text()
        var posterUrl = $doc.find(".attachment-img-mov-md").attr("src");

        var genres = [];
        var genreBlockMatch = /<li>\s*<span class="info-title">Thể loại:<\/span>([\s\S]*?)<\/li>/i.exec(htmlContent) || /Thể loại:([\s\S]*?)(?:<br|<\/li>)/i.exec(htmlContent);
        if (genreBlockMatch) {
            var genreMatch;
            var genrePattern = /<a[^>]*>([^<]+)<\/a>/gi;
            while ((genreMatch = genrePattern.exec(genreBlockMatch[1])) !== null) {
                genres.push(genreMatch[1].trim());
            }
        }

        var countries = [];
        var countryBlockMatch = /<li>\s*<span class="info-title">Quốc gia:<\/span>([\s\S]*?)<\/li>/i.exec(htmlContent);
        if (countryBlockMatch) {
            var countryMatch;
            var countryPattern = /<a[^>]*>([^<]+)<\/a>/gi;
            while ((countryMatch = countryPattern.exec(countryBlockMatch[1])) !== null) {
                countries.push(countryMatch[1].trim());
            }
        }

        var year = $doc.find(".Date a").text();
        var status = $doc.find(".latest_eps").text()

        var episode_current = $doc.find(".AAIco-adjust:content('Thời|lượng')").text().replace("Thời lượng: ","Tập ")
        //console.log($doc.find(".server").html());
        
        // Parse danh sách tập phim
        var servers = [];
        var episodes = [];
        $doc.find(".list-episode").each(function(indexparent){
            this.find("li").each(function(numberRun){
                var check = this.find("a").length;
                var id = this.find("a").attr("href");
                var name = this.find("a").attr("title");
                var slug = "tap-" + (Number(numberRun) + 1);
                if(check == 0){
                    id = url;
                    name = "Tập" + (Number(numberRun) + 1);
                    slug = "tap-" +  (Number(numberRun) + 1);
                }
                episodes.push({
                    id: id,
                    name: name,
                    slug: slug
                })
            })
          episodes.sort(function(a, b) {
              var epA = parseInt(a.name) || 0;
              var epB = parseInt(b.name) || 0;
              return epA - epB;
          });
            servers.push({
                name: "Server " + (Number(indexparent) + 1),
                episodes: episodes
            })
        })

        // Sắp xếp các tập phim theo thứ tự tăng dần (ví dụ Tập 1 -> Tập 13
          
          // 2. Loại bỏ các Server rỗng không có tập phim
          servers = servers.filter(function(server) {
            return server.episodes && server.episodes.length > 0;
          });
          
          // 3. Sắp xếp giảm dần: Server có số lượng episodes lớn hơn sẽ nhảy lên ĐẦU (Index 0)
          servers.sort(function(a, b) {
            var countA = a.episodes ? a.episodes.length : 0;
            var countB = b.episodes ? b.episodes.length : 0;
            return countB - countA; 
          });



        // Trích xuất slug từ canonical URL hoặc og:url (id)
        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/]+)/.exec(htmlContent);
            slug = slugMatch2 ? slugMatch2[1] : "";
        }

        // Tạo extra url để tải đầy đủ tập từ trang xem-phim
        // Kiểm tra bằng canonical URL (biến id) thay vì search toàn HTML vì trang
        // detail có nav link chứa chuỗi "xem-phim" gây nhận nhầm.
      /*
        var extra = "";
        var isPlayPage = (id && id.indexOf("xem-phim") > -1) || htmlContent.indexOf("window.PLAYER_DATA") > -1;
        if (!isPlayPage && slug && slug !== "error") {
            extra = BASEURL + "/phim/" + slug + "/xem-phim.html";
        }
*/
        return JSON.stringify({
            id: slug,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            servers: servers,
            episode_current: episode_current,
            lang: "Vietsub",
            quality: "FHD",
            category: genres.join(", "),
            country: countries.join(", "),
            status: status
        });
    } catch (e) {
        log("parseMovieDetail error: " + e.message);
        return JSON.stringify({ id: "error", title: "", servers: [] });
    }
}

function parseDetailResponse(html, url) {
  console.log("parseDetailResponse [Tầng 1]: " + url);
  try {
    var id = html.match(/error-episode-id["'][^"']value=["'](\d+)["']/i)[1];
    var datasend = [1,url];
          return JSON.stringify({
            url: BASEURL + "/ajax/player",
            isEmbed: true, // Bật isEmbed để App tiếp tục chuỗi Fetch
            "postBody": "episodeId=" + id + "&backup=1",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "Referer": url,
              "Origin": BASEURL,
              "x-requested-with": "XMLHttpRequest"
            },
            datasend: JSON.stringify(datasend)
          });


  } catch (e) {
    console.log("[Lỗi parseDetailResponse]", e);
    return JSON.stringify({ url: "", isEmbed: false, headers: {} });
  }
}

// =========================================================
// TẦNG 2: NHẬN TOKEN TỪ APP -> DỰNG LINK STREAM BITLUNA
// =========================================================
function parseEmbedResponse(html, url, datasend) {
  try {
    // Ép kiểu datasend về Array an toàn (dù App truyền vào là String hay Array)
    var parsedDatasend = datasend;
    if (typeof datasend === 'string') {
      try { parsedDatasend = JSON.parse(datasend); } catch(e) {}
    }

    // =========================================================
    // LƯỢT 1 (datasend[0] == 1): Nhận HTML danh sách server
    // -> Bóc token và yêu cầu App POST tới /ajax/player
    // =========================================================
    if (parsedDatasend && parsedDatasend[0] == 1) {
      // 1. Trích xuất thẻ <a> có data-play="embed"
      var embedMatch = html.match(/<a[^>]*data-play=\\?["']embed\\?["'][^>]*>/i);
      var post = "";

      if (embedMatch) {
        var tagStr = embedMatch[0];
        var idMatch = tagStr.match(/data-id=\\?["'](\d+)\\?["']/i);
        var hrefMatch = tagStr.match(/data-href=\\?["']([^"'\\]+)\\?["']/i);

        if (idMatch && hrefMatch) {
          post = "link=" + encodeURIComponent(hrefMatch[1]) + "&play=embed&id=" + idMatch[1] + "&backuplinks=1";
        }
      }

      console.log("[EMBED LƯỢT 1] Generated POST:\n" + post);
      var playerUrl = BASEURL.replace(/\/+$/, "") + "/ajax/player";

      return JSON.stringify({
        url: playerUrl,
        isEmbed: true, // Yêu cầu App fetch tiếp lượt 2
        postBody: post,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Referer": parsedDatasend[1],
          "Origin": BASEURL.replace(/\/+$/, ""),
          "X-Requested-With": "XMLHttpRequest"
        },
        // BẮT BUỘC JSON.stringify để App không làm mất dữ liệu mảng ở lượt 2
        datasend: JSON.stringify([2, parsedDatasend[1]]) 
      });
    }

    // =========================================================
    // LƯỢT 2 (datasend[0] == 2): Nhận kết quả JSON từ /ajax/player
    // -> Trích xuất Link Video/Embed cuối cùng
    // =========================================================
    if (parsedDatasend && parsedDatasend[0] == 2) {
     // console.log("[EMBED LƯỢT 2] RAW Response:\n" + html);

      var $data = JSON.parse(html);
      var link = $data.link;
      var id = link.replace("https://abyssplayer.com/","");
      var stream = "https://sc.k-20.xyz/stream/series/clbpx:lo2b09rr074-2q1390mfi:" + id + ".json";
      console.log("stream Lượt 2:\n" + stream);
      return JSON.stringify({
        url: stream,
        isEmbed: true, // STOP đệ quy - Trả kết quả cho App phát Video
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        datasend: JSON.stringify([3, "2132"]) 
      });
    }
    if(parsedDatasend && parsedDatasend[0] == 3){
      //console.log("[EMBED LƯỢT 2] RAW Response:\n" + html);
      var $data = JSON.parse(html);
      var stream = $data.streams[0].url;
      return JSON.stringify({
        url: stream + "#.m3u8" || url,
        isEmbed: false, // STOP đệ quy - Trả kết quả cho App phát Video
        mimeType: "video/mp4",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
    }

  } catch (e) {
    console.log("[Lỗi parseEmbedResponse]", e);
    return JSON.stringify({ url: "", isEmbed: false, headers: {} });
  }
}




function parseCategoriesResponse(htmlContent) {
    try {
        var categories = [];
        // Parse menu thể loại từ trang chủ
        var menuBlock = /<ul class="sub-menu[^"]*">([\s\S]*?)<\/ul>/i.exec(htmlContent);
        if (menuBlock) {
            var catPattern = /<a\s+href="[^"]*\/the-loai\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
            var catMatch;
            while ((catMatch = catPattern.exec(menuBlock[1])) !== null) {
                var catSlug = catMatch[1].replace(/\//g, "");
                var catName = catMatch[2].trim();
                if (catSlug && catName) {
                    categories.push({ name: catName, slug: "the-loai/" + catSlug });
                }
            }
        }
        // Fallback: quét toàn trang nếu không tìm thấy trong submenu
        if (categories.length === 0) {
            var fallbackPattern = /<a\s+href="[^"]*\/the-loai\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
            var fbMatch;
            while ((fbMatch = fallbackPattern.exec(htmlContent)) !== null) {
                var fbSlug = fbMatch[1].replace(/\//g, "");
                var fbName = fbMatch[2].trim();
                var exists = false;
                for (var i = 0; i < categories.length; i++) {
                    if (categories[i].slug === fbSlug) { exists = true; break; }
                }
                if (!exists && fbSlug && fbName) {
                    categories.push({ name: fbName, slug: "the-loai/" + fbSlug });
                }
            }
        }
        return JSON.stringify(categories);
    } catch (e) {
        log("parseCategoriesResponse error: " + e.message);
        return "[]";
    }
}

function parseCountriesResponse(htmlContent) { return "[]"; }
function parseYearsResponse(htmlContent) { return "[]"; }
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

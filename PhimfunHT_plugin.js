var BASEURL = "https://phimfun.net";
  var DEV = "";
  
  // https://www.whoreshub.com/categories/4k-porn/
  function getManifest() {
    return JSON.stringify({
      id: "phimfun",
      name: "Nguồn Phim Fun",
      description: "Nguồn phim mới.",
      "version": "1.1.7",
      info: "Nguồn phim dự phòng, có server riêng có thể sơ cưa khi những nguồn khác bị lỗi. Có cơ chế lưu lại tập vừa xem và có thể chuyển tập không cần quay lại menu phim.",
      baseUrl: "https://phimfun.net",
      iconUrl: "https://phimfun.net/Content/PhimFun/Imgs/phimfun.png",
      isEnabled: true,
      debug: true,
      "layoutType": "HORIZONTAL",
      type: "MOVIE",
      playerType: "exoplayer",
    });
  }
  
  function log(msg) {
    if (DEV && typeof console !== "undefined" && console.log) {
      console.log(
        "[" + BASEURL.replace(/^(https?:\/\/)?(www\.)?/, "") + "]: " + msg,
      );
    }
  }
  
  function getHomeSections() {
      return JSON.stringify([
         {
              "slug": "/the-loai/phim-chieu-rap-1",
              "title": "Phim Lẻ",
              "type": "Horizontal"
          },
         {
              "slug": "/the-loai/phim-le-1",
              "title": "Phim Bộ",
              "type": "Horizontal"
          },
          {
              "slug": "/the-loai/phim-bo-1",
              "title": "Thuyét Minh",
              "type": "Horizontal"
          },
          {
              "slug": "/the-loai/phim-cap-nhat-1",
              "title": "Phim Mới",
              "type": "Grid"
          }
      ]);
  }
  
  
  function getPrimaryCategories() {
    try {
      var listurl = getLISTmenu();
      var menulist = buildMenu(listurl);
      return JSON.stringify(menulist);
    } catch (e) {
      log("getPrimaryCategories[err]:\n " + e);
    }
  }
  
  function getFilterConfig() {
    try {
      var listurl = getLISTmenu();
      var menulist = buildMenu(listurl, "filter");
      return JSON.stringify({
        category: menulist,
      });
    } catch (e) {
      log("getFilterConfig[err]:\n " + e);
    }
  }
  
  // =============================================================================
  // HELPER: CURSOR BASE64 ENCODE / DECODE
  // =============================================================================
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
  
  function getUrlList(slug, filtersJson) {
    try {
      if (slug && slug.indexOf("http") > -1) {
        log("getUrlList[url]: \n" + slug);
        return slug;
      }
  
      var page = 1;
      var path = slug || "";
  
      if (filtersJson) {
        var fixedJson2 = filtersJson
          .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          .replace(/:,/g, ":");
        try {
          var filters = JSON.parse(fixedJson2);
          page = parseInt(filters.page) || 1;
          if (filters.category) {
            if (Array.isArray(filters.category) && filters.category.length > 0) {
              path = filters.category[0].slug;
            } else if (typeof filters.category === "string") {
              path = filters.category;
            }
          }
        } catch (jsonErr) {}
      }
  
      var resultUrl = BASEURL;
      if (path) {
        resultUrl += path;
      }
      if (page > 1) {
        resultUrl = resultUrl.replace(/(\d+)$/i, "");
        resultUrl += page;
      }
  
      var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
      log("getUrlList[url]: \n" + finalUrl);
      return finalUrl;
    } catch (e) {
      log("getUrlList[err]:\n " + e);
      if (slug && slug.indexOf("http") > -1) {
        return slug;
      }
      var fallback = BASEURL + (slug ? "/" + slug : "");
      return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
  }
  
  function getUrlSearch(keyword, filtersJson) {
    try {
      var resultUrl = "";
      if (filtersJson) {
        var fixedJson = filtersJson
          .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          .replace(/:,/g, ":");
        try {
          var filters = JSON.parse(fixedJson);
          var page = parseInt(filters.page) || 1;
          if (page > 1) {
            resultUrl =
              BASEURL +
              "/search?k=" +
              encodeURIComponent(keyword) +
              "&page=" +
              page;
          } else {
            resultUrl = BASEURL + "/search?k=" + encodeURIComponent(keyword);
          }
        } catch (jsonErr) {
          resultUrl = BASEURL + "/search?k=" + encodeURIComponent(keyword);
        }
      } else {
        resultUrl = BASEURL + "/search?k=" + encodeURIComponent(keyword);
      }
  
      log("getUrlSearch[url]: \n" + resultUrl);
      return resultUrl;
    } catch (e) {
      log("getUrlSearch[err]:\n " + e);
    }
  }
  
  function getUrlDetail(slug) {
    try {
      if (!slug) return "";
      var resultUrl = slug.indexOf("http") === 0 ? slug : BASEURL + "/" + slug;
      log("getUrlDetail[url]: \n" + resultUrl);
      return resultUrl;
    } catch (e) {
      log("getUrlDetail[err]:\n " + e);
    }
  }
  
  function getUrlCategories() {
    try {
      log("getUrlCategories[url]: \n" + BASEURL);
      return BASEURL;
    } catch (e) {
      log("getUrlCategories[err]:\n " + e);
    }
  }
  
  function getUrlCountries() {
    try {
      return "";
    } catch (e) {
      log("getUrlCountries[err]:\n " + e);
    }
  }
  
  function getUrlYears() {
    try {
      return "";
    } catch (e) {
      log("getUrlYears[err]:\n " + e);
    }
  }
  
  // =============================================================================
  // PARSERS
  // =============================================================================
  
  function fixHref(href) {
    try {
      if (!href) return "";
  
      let cleanHref = href.trim();
      const ignorePattern =
        /^(#|https?:\/\/|\/\/|mailto:|tel:|javascript:|data:|blob:)/i;
  
      if (ignorePattern.test(cleanHref)) {
        return cleanHref;
      }
  
      if (cleanHref.startsWith("/")) {
        try {
          const urlObj = new URL(BASEURL);
          return urlObj.origin + cleanHref;
        } catch (e) {
          return BASEURL + cleanHref;
        }
      }
  
      return BASEURL + cleanHref;
    } catch (e) {
      log("fixHref[err]:\n " + e);
    }
  }
  
  function parseListResponse(html, $url) {
    try {
      if ($url) log("parseListResponse[url]: \n" + $url);
  
      var quality = "";
      var items = [];
      _$(html)
        .find(".MovieList")
        .find("li")
        .each(function () {
          var href = this.find("a").attr("href");
          href = fixHref(href);
          href = href.replace("/phim/", "/xem-phim/");
          var title = this.find("img").attr("alt");
          title = decodeHTMLEntities(title);
          var src = this.find("img").attr("src");
          if (src.indexOf("base64") > -1) {
            src = this.find("img").attr("data-src");
          }
          src = fixHref(src);
  
          var episode_current = this.find(".mc__ep-badge").text().trim();
  
          function isValidMediaUrl(url) {
            if (!url || typeof url !== "string") return false;
  
            var cleanUrl = url.trim();
  
            if (
              cleanUrl.indexOf("_spEsc") > -1 ||
              cleanUrl.indexOf("'+") > -1 ||
              cleanUrl.indexOf("+'") > -1 ||
              cleanUrl.indexOf("${") > -1 ||
              cleanUrl.indexOf("javascript:") > -1
            ) {
              return false;
            }
  
            var httpPattern = /^https?:\/\/[^\s"'<>+]+$/i;
            return httpPattern.test(cleanUrl);
          }
  
          if (isValidMediaUrl(href)) {
            var cleanThumb = (src || "").replace(/&amp;/g, "&").trim();
  
            if (cleanThumb && cleanThumb.indexOf("http") !== 0) {
              cleanThumb = "https:" + cleanThumb;
            }
  
            items.push({
              id: href.trim(),
              title: (title || "").trim(),
              posterUrl: cleanThumb,
              backdropUrl: cleanThumb,
              quality: quality || "",
              lang: "",
              episode_current: episode_current || "",
            });
          }
        });
  
      return JSON.stringify({
        items: items,
        pagination: {
          currentPage: 1,
          totalPages: 999,
        },
      });
    } catch (e) {
      log("parseListResponse[err]:\n " + e);
      return JSON.stringify({
        items: [
          {
            id: $url || "error_url",
            title: "Lỗi: " + e,
            posterUrl: "",
            backdropUrl: "",
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
        },
      });
    }
  }
  
  
  
  function parseSearchResponse(html, url) {
    try {
      if (url) log("parseSearchResponse[url]: \n" + url);
      return parseListResponse(html, url);
    } catch (e) {
      log("parseSearchResponse[err]:\n " + e);
    }
  }
  
  function parseMovieDetail(html, url) {
    try {
      if (url) log("parseMovieDetail[url]: \n" + url);
  
      var idMatch =
        /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
        /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
      var id = idMatch ? idMatch[1] : url || "";
  
      var slug = "";
      if (id) {
        var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
        slug = slugMatch ? slugMatch[1] : id;
      }
      if (!slug) {
        var slugMatch2 = /\/phim\/([^/_.]+)/.exec(html);
        slug = slugMatch2 ? slugMatch2[1] : "";
      }
  
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
  
      if (limg.indexOf("//") === 0) {
        limg = "https:" + limg;
      } else if (limg.indexOf("http") === -1) {
        limg = BASEURL + limg;
      }
      lname = _$(html).find("h1").text();
      lname = decodeHTMLEntities(lname);
      var ldes = _$(html).find("h2:content('Thông tin về phim')").next().text();
      ldes = decodeHTMLEntities(ldes);
      var year = 2026;
      var extra = "";
  
      var rawText = _$(html).find(".Date").text();
      var match = rawText.match(/\b(19|20)\d{2}\b/);
  
      if (match) {
        year = parseInt(match[0], 10);
      }
  
      if (isNaN(year)) {
        year = 2026;
      }
      status = _$(html)
        .find(".aim-hero__meta")
        .find(".aim-status--airing")
        .text();
  
      var categoryResult = [];
      _$(html)
        .find(".Description")
        .find(".Genre")
        .find("a")
        .each(function () {
          var link = this.attr("href") || this.find("a").attr("href");
          var name = this.text().replace(/\s+/g, " ").trim();
          name = decodeHTMLEntities(name);
  
          if (name && link) {
            var slug = typeof getSlug === "function" ? getSlug(link) : link;
            categoryResult.push("[" + name + "](" + slug + ")");
          }
        });
  
      category = categoryResult.join(", ");
      var actorResult = [];
      _$(html)
        .find(".Description")
        .find(".Cast")
        .find("a")
        .each(function () {
          var link = this.attr("href") || this.find("a").attr("href");
          var name = this.text().replace(/\s+/g, " ").trim();
          name = decodeHTMLEntities(name);
  
          if (name && link) {
            var slug = typeof getSlug === "function" ? getSlug(link) : link;
            actorResult.push("[" + name + "](" + slug + ")");
          }
        });
  
      lactor = actorResult.join(", ");
  
      quality = _$(html).find("span.Time").text();
      episode_current = _$(html).find(".aim-hero__meta").find("span:last").text();
      rating = _$(html).find(".post-ratings").text();
      rating = parseInt(rating, 10);
      var servers = [];
      stastus = 0;
      numSV = 0;
      $listSV = _$(html)
        .find(".SeasonBx:content('Danh sách máy chủ')")
        .find("a")
        .each(function () {
          numSV++;
          var nameSV = "Server " + numSV;
          var items = [];
          _$(html)
            .find(".SeasonBx:content('Danh sách tập')")
            .find("#halim-list-server")
            .find("a")
            .each(function () {
              var link = this.attr("href");
              link = fixHref(link);
              if (numSV > 1) {
                link = link + "?sv" + numSV + "=true";
              }
              var name = this.attr("title");
              items.push({
                id: link,
                name: name,
                slug: name.replace(/[\s\S]*?(\d+)/, "tap-$1"),
              });
              stastus++;
            });
          servers.push({
            name: nameSV,
            episodes: items,
          });
          servers = sortEpisodesByName(servers);
        });
      episode_current = "Đang có: " + status;
  
      return JSON.stringify({
        id: id,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes,
        quality: quality,
        year: year,
        rating: rating,
        status: status,
        category: category,
        episode_current: episode_current,
        servers: servers,
        duration: lduran || "",
        casts: lactor || "",
        director: ldirec || "",
        extra: extra,
      });
    } catch (e) {
      log("parseMovieDetail[err]:\n " + e);
      return JSON.stringify({
        id: slug || url || "error",
        title: "error",
        servers: [],
      });
    }
  }
  
  function sortEpisodesByName(data) {
    try {
      if (!Array.isArray(data)) return data;
  
      data.forEach(function (server) {
        if (server.episodes && Array.isArray(server.episodes)) {
          server.episodes.sort(function (a, b) {
            var nameA = a.name || "";
            var nameB = b.name || "";
  
            var matchA = nameA.match(/\d+(\.\d+)?/);
            var matchB = nameB.match(/\d+(\.\d+)?/);
  
            var numA = matchA ? parseFloat(matchA[0]) : null;
            var numB = matchB ? parseFloat(matchB[0]) : null;
  
            if (numA !== null && numB !== null) {
              if (numA !== numB) {
                return numA - numB;
              }
            }
  
            if (numA !== null) return -1;
            if (numB !== null) return 1;
  
            return nameA.localeCompare(nameB, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });
        }
      });
  
      return data;
    } catch (e) {
      log("sortEpisodesByName[err]:\n " + e);
    }
  }

function parseDetailResponse(html, url) {
  console.log("parseDetailResponse [Tầng 1]: " + url);
  try {

// Bắt thẻ <iframe ... id="iframeStream" ... src="..."
const regex = /<iframe\b[^>]*\bid=["']iframeStream["'][^>]*\bsrc=["']([^"']+)["']/i;

const match = html.match(regex);
const src = match ? match[1] : null;

console.log(src);
// Kết quả: https://moviking.neuronix.sbs/embed?id=0979bf3465cb4047ad3e36e05dff77d7&amp;web=phimfun.net&amp;lang=vi      
         return JSON.stringify({
          url: src,
          isEmbed: true, // Bật isEmbed để App tiếp tục chuỗi Fetch
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://moviking.neuronix.sbs/",
            "Origin": "https://moviking.neuronix.sbs"
          },
          datasend: 1
        });

  } catch (e) {
    console.log("[Lỗi parseDetailResponse]", e);
      return JSON.stringify({ 
        url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
        mimeType: "video/mp4", 
        isEmbed: false, headers: {}, subtitles: [] 
      });
  }
}

// =========================================================
// TẦNG 2: NHẬN TOKEN TỪ APP -> DỰNG LINK STREAM BITLUNA
// =========================================================
function parseEmbedResponse(html, url, datasend) {
  console.log("datasend: " + datasend)
  try {
  if(datasend == 1){
    // 1. Bóc các biến từ HTML gốc bằng Regex (Thuần JS)
    var videoIdMatch = html.match(/var\s+videoId\s*=\s*['"]([^'"]+)['"]/i);
    var videoId = videoIdMatch ? videoIdMatch[1] : "";

    if (!videoId) {
      var urlIdMatch = url.match(/[?&]id=([^&]+)/i);
      videoId = urlIdMatch ? urlIdMatch[1] : "";
    }

    var subIdMatch = html.match(/var\s+subId\s*=\s*['"]([^'"]*)['"]/i);
    var subId = subIdMatch ? subIdMatch[1] : "";

    var webMatch = html.match(/var\s+web\s*=\s*['"]([^'"]+)['"]/i);
    var web = webMatch ? webMatch[1] : "faphimtv.com";

    var cdnMatch = html.match(/var\s+cdn\s*=\s*['"]([^'"]+)['"]/i);
    var cdn = cdnMatch ? cdnMatch[1] : "https://cdn4.bitluna.shop";

    var langMatch = html.match(/var\s+lang\s*=\s*['"]([^'"]+)['"]/i);
    var lang = langMatch ? langMatch[1] : "vi";

    if (!videoId) {
      console.log("❌ Lỗi: Không bóc được videoId!");
      return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }

    var domainMatch = url.match(/^(https?:\/\/[^\/]+)/);
    var targetDomain = "https://moviking.neuronix.sbs";

    // 2. MẸO: Đóng gói metadata vào Query String để Tầng 2 đọc lại
    var nextUrl = targetDomain + "/geturl" + 
                  "?cdn=" + encodeURIComponent(cdn) + 
                  "&videoId=" + encodeURIComponent(videoId) + 
                  "&subId=" + encodeURIComponent(subId) + 
                  "&web=" + encodeURIComponent(web) + 
                  "&lang=" + encodeURIComponent(lang);

    var postBody = "renderer=" + encodeURIComponent("ANGLE (Software, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0)") +
                   "&id=" + encodeURIComponent(videoId) +
                   "&videoId=" + encodeURIComponent(videoId) +
                   "&domain=" + encodeURIComponent(url);

    console.log("🚀 Yêu cầu App POST lên /geturl:", nextUrl);

    // 3. Trả về isEmbed = true để App gọi POST /geturl
    return JSON.stringify({
      url: nextUrl,
      isEmbed: true, // Bật isEmbed để App tiếp tục chuỗi Fetch
      postBody: postBody,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://moviking.neuronix.sbs/",
        "Origin": "https://moviking.neuronix.sbs",
         "X-Requested-With": "XMLHttpRequest"
      },
      datasend: 2
    });
  }
    
   if(datasend == 2){
    console.log("parseEmbedResponse [Tầng 3]: " + url);

    // Helper bóc Query Param từ `url` trong QuickJS
    function getParam(param, searchUrl) {
      var match = searchUrl.match(new RegExp('[?&]' + param + '=([^&]*)'));
      return match ? decodeURIComponent(match[1]) : '';
    }

    // 1. Đọc lại các biến từ URL đã đóng gói ở Tầng 1
    var cdn = getParam("cdn", url) || "https://cdn4.bitluna.shop";
    var videoId = getParam("videoId", url);
    var subId = getParam("subId", url);
    var web = getParam("web", url) || "faphimtv.com";
    var lang = getParam("lang", url) || "vi";

    // 2. `html` ở đây chính là chuỗi Token (token1=...&token2=...) do App POST /geturl trả về
    var tokenData = (html || "").trim();

    if (!tokenData || tokenData.indexOf("<html") !== -1) {
      console.log("❌ Lỗi: App lấy Token từ /geturl thất bại!");
      return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
    // 3. Ghép thành link Bitluna m3u8 hoàn chỉnh
    var finalStreamUrl = cdn + "/streaming?id=" + videoId + 
                         "&subId=" + subId + 
                         "&web=" + web + 
                         "&" + tokenData + 
                         "&cdn=" + encodeURIComponent(cdn) + 
                         "&lang=" + lang;

    console.log("🎯 Final Stream Bitluna URL:", finalStreamUrl);

    // 4. Mã Interceptor chèn vào WebView/Player của App để sửa file M3U8
    
    // 5. Trả về isEmbed: false -> Báo App dừng chuỗi Fetch và đưa link cho Player phát!

      return JSON.stringify({
        url: finalStreamUrl,
        isEmbed: true,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://moviking.neuronix.sbs/",
          "Origin": "https://moviking.neuronix.sbs"
        },
        datasend: 3
      });
    }
    else{
      console.log("parseEmbedResponse [Tầng 4]: " + url);
      console.log("parseEmbedResponse [Tầng 4]: raw" + html);
      var result = extractMediaInfo(html, url);
      console.log("Link stream: " + result.link)
      console.log("Link sub: " + result.sub);
      // mimeType: "application/x-mpegURL",
      return JSON.stringify({
        url: result.link,
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://moviking.neuronix.sbs/",
          "Origin": "https://moviking.neuronix.sbs",
          "Block-Ads": true,
          "Block-Css": ""
        },
        subtitles: [{
          lang: "Vietnamese",
          url: result.sub,
          mimeType: "text/vtt"
        }]
      });
    }
  } catch (e) {
    console.log("[Lỗi parseEmbedResponse]", e);
    return JSON.stringify({ 
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
      mimeType: "video/mp4", 
      isEmbed: false, headers: {}, subtitles: [] 
    });
  }
}
function extractMediaInfo(htmlString, baseUrl) {
    // 1. Bóc tách tất cả các biến JS (var, let, const) trong HTML vào Map
    var varsMap = {};
    var varRegex = /(?:var|let|const)\s+([a-zA-Z0-9_]+)\s*=\s*["']([^"']*)["']/g;
    var vMatch;
    while ((vMatch = varRegex.exec(htmlString)) !== null) {
        varsMap[vMatch[1]] = vMatch[2];
    }

    // 2. ƯU TIÊN LẤY CDN TỪ BIẾN 'var cdn = ...' TRONG HTML
    var targetCdn = "";
    if (varsMap["cdn"]) {
        targetCdn = varsMap["cdn"].trim();
        // Nếu CDN thiếu protocol (vd: "cdn4.bitluna.shop") -> Bổ sung https://
        if (!/^https?:\/\//i.test(targetCdn)) {
            targetCdn = "https://" + targetCdn;
        }
        // Xóa dấu / ở cuối CDN nếu có
        targetCdn = targetCdn.replace(/\/+$/, "");
    } else if (baseUrl) {
        // Dự phòng nếu HTML không có var cdn -> Lấy Domain từ baseUrl
        var originMatch = baseUrl.match(/^(https?:\/\/[^\/]+)/i);
        targetCdn = originMatch ? originMatch[1] : "";
    }

    // 3. Trích xuất biểu thức 'var url = ...' trong HTML
    var rawLink = "";
    var urlLineMatch = htmlString.match(/var\s+url\s*=\s*([^;\r\n]+)/);

    if (urlLineMatch) {
        var expr = urlLineMatch[1];
        var parts = expr.split("+");
        var assembled = "";

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i].trim();
            // Nếu là chuỗi hằng số ('https://No/segment/'...)
            var strMatch = part.match(/^["']([^"']*)["']$/);
            if (strMatch) {
                assembled += strMatch[1];
            } else if (varsMap[part] !== undefined) {
                // Nếu là tên biến (videoId, token1, token3...)
                assembled += varsMap[part];
            }
        }
        rawLink = assembled;
    }

    // 4. GỘP CDN: Thay thế 'https://No', 'http://No', '//No' bằng targetCdn
    var finalStreamUrl = "";
    if (rawLink) {
        finalStreamUrl = rawLink.replace(/^(https?:)?\/\/(No|undefined|null)(?=\/|$)/i, targetCdn);

        // Trường hợp link là đường dẫn tương đối (/segment/...)
        if (/^\//.test(finalStreamUrl)) {
            finalStreamUrl = targetCdn + finalStreamUrl;
        }
    }

    // 5. Trích xuất Subtitle Tiếng Việt nếu có
    var tracksMatch = htmlString.match(/tracks:\s*(\[[\s\S]*?\])\s*,/);
    var rawSub = "";
    if (tracksMatch) {
        try {
            var tracks = JSON.parse(tracksMatch[1]);
            var viTrack = tracks.find(function(t) { 
                return t && (t.label === "Vietnamese" || t.language === "vi"); 
            });
            if (viTrack && viTrack.file) rawSub = viTrack.file;
        } catch (e) {}
    }

    // Bù Domain CDN cho Subtitle
    if (rawSub && !/^https?:\/\//i.test(rawSub)) {
        rawSub = rawSub.replace(/^(https?:)?\/\/(No|undefined|null)(?=\/|$)/i, "");
        if (rawSub.startsWith("/")) {
            rawSub = targetCdn + rawSub;
        } else {
            rawSub = targetCdn + "/" + rawSub;
        }
    }

    return {
        link: finalStreamUrl,
        sub: rawSub,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://moviking.neuronix.sbs/",
            "Origin": "https://moviking.neuronix.sbs"
        }
    };
}



//JSON.parse(parseDetailResponse(sourceHTML, "https://phimfun.net/xem-phim/musafir-cafe-20273/tap-1"))


/*

BASEURL = "https://animehay09.site";
var html = sourceHTML;
//JSON.parse(parseDetailResponse(sourceHTML, BASEURL))
JSON.parse(parseEmbedResponse(sourceHTML, BASEURL))
// 'AHS': 'https://ahay.stream/embed-jw/75913'

*/

function parseCategoriesResponse(apiResponseJson) {
  var listurl = getLISTmenu();
  var menulist = buildMenu(listurl);
  return JSON.stringify(menulist);
}

function parseCountriesResponse(html) {
  return "[]";
}
function parseYearsResponse(html) {
  return "[]";
}

/*
{\"link\":\"/the-loai/phim-cap-nhat-1\",\"name\":\"Phim Mới\"},
{\"link\":\"/the-loai/phim-le-1\",\"name\":\"Phim Lẻ\"},
{\"link\":\"/the-loai/phim-bole-1\",\"name\":\"Phim Bộ\"},
{\"link\":\"/tuyen-tap-1\",\"name\":\"Loạt Phim\"},
 */
function getLISTmenu() {
  return `[{\"link\":\"/the-loai/phim-cap-nhat-1\",\"name\":\"Phim Mới\"},{\"link\":\"/the-loai/phim-le-1\",\"name\":\"Phim Lẻ\"},{\"link\":\"/the-loai/phim-bo-1\",\"name\":\"Phim Bộ\"},{\"link\":\"/the-loai/than-thoai-co-trang-1\",\"name\":\"Cổ trang\"},{\"link\":\"/the-loai/hanh-dong-1\",\"name\":\"Hành động\"},{\"link\":\"/the-loai/tam-ly-1\",\"name\":\"Tâm lý\"},{\"link\":\"/the-loai/chien-tranh-1\",\"name\":\"Chiến tranh\"},{\"link\":\"/the-loai/vo-thuat-kiem-hiep-1\",\"name\":\"Võ thuật - Kiếm hiệp\"},{\"link\":\"/the-loai/nhac-kich-1\",\"name\":\"Nhạc kịch\"},{\"link\":\"/the-loai/kinh-di-1\",\"name\":\"Kinh dị\"},{\"link\":\"/the-loai/toi-pham-hinh-su-1\",\"name\":\"Tội phạm - Hình sự\"},{\"link\":\"/the-loai/phieu-luu-1\",\"name\":\"Phiêu lưu\"},{\"link\":\"/the-loai/hai-huoc-1\",\"name\":\"Hài hước\"},{\"link\":\"/the-loai/vien-tuong-1\",\"name\":\"Viễn tưởng\"},{\"link\":\"/the-loai/khoa-hoc-tai-lieu-1\",\"name\":\"Khoa học - Tài liệu\"},{\"link\":\"/the-loai/hoat-hinh-1\",\"name\":\"Hoạt hình\"},{\"link\":\"/the-loai/the-thao-1\",\"name\":\"Thể thao\"},{\"link\":\"/the-loai/tinh-cam-lang-man-1\",\"name\":\"Tình cảm - Lãng mạn\"},{\"link\":\"/the-loai/ky-ao-1\",\"name\":\"Kỳ ảo\"},{\"link\":\"/the-loai/giat-gan-1\",\"name\":\"Giật gân\"},{\"link\":\"/the-loai/gia-dinh-1\",\"name\":\"Gia đình\"},{\"link\":\"/the-loai/bi-an-1\",\"name\":\"Bí ẩn\"},{\"link\":\"/the-loai/lich-su-1\",\"name\":\"Lịch sử\"},{\"link\":\"/the-loai/vien-tay-1\",\"name\":\"Viễn Tây\"},{\"link\":\"/the-loai/tieu-su-1\",\"name\":\"Tiểu sử\"},{\"link\":\"/the-loai/chuong-trinh-truyen-hinh-1\",\"name\":\"GameShow\"},{\"link\":\"/the-loai/dramatv-1\",\"name\":\"DramaTV\"}]`;
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
      menuItem = { slug: link, title: name, type: "Horizontal" };
    } else if (typeStr === "true") {
      menuItem = { slug: link, title: name, type: "Grid" };
    } else if (typeStr === "filter") {
      menuItem = { value: link, name: name };
    } else {
      menuItem = { slug: link, name: name };
    }
    menulist.push(menuItem);
  }
  return menulist;
}

function _$(htmlOrBlock) {
  if (htmlOrBlock && typeof htmlOrBlock === "object" && htmlOrBlock.elements) {
    return htmlOrBlock;
  }
  var instance = {
    sourceHtml: typeof htmlOrBlock === "string" ? htmlOrBlock : "",
    elements: Array.isArray(htmlOrBlock)
      ? htmlOrBlock
      : htmlOrBlock
        ? [htmlOrBlock]
        : [],
    length: 0,
    find: function (selector) {
      if (selector.indexOf(",") !== -1) {
        var results = [];
        var selectors = selector.split(",").map(function (s) {
          return s.trim();
        });
        for (var s = 0; s < selectors.length; s++) {
          if (selectors[s] === "") continue;
          var subInstance = this.find(selectors[s]);
          for (var r = 0; r < subInstance.elements.length; r++) {
            var element = subInstance.elements[r];
            if (results.indexOf(element) === -1) {
              results.push(element);
            }
          }
        }
        var multiInstance = _$(results);
        multiInstance.sourceHtml = this.sourceHtml;
        return multiInstance;
      }
      var results = [];
      var contentFilter = "";
      if (selector.indexOf(":content(") !== -1) {
        var contentMatch = selector.match(
          /:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/,
        );
        if (contentMatch) {
          contentFilter =
            contentMatch[1] || contentMatch[2] || contentMatch[3] || "";
          selector = selector.replace(
            /:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,
            "",
          );
        }
      }
      var attrNameFilter = "";
      var attrValueFilter = "";
      var attrOperator = "=";
      var hasAttrFilter = false;
      var attrMatch = selector.match(
        /\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/,
      );
      if (attrMatch) {
        hasAttrFilter = true;
        attrNameFilter = attrMatch[1];
        attrOperator = attrMatch[2];
        attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || "";
        selector = selector.replace(/\[.*?\]/, "");
      }
      var notSelector = "";
      if (selector.indexOf(":not(") !== -1) {
        var notMatch = selector.match(/:not\(([^)]+)\)/);
        if (notMatch) {
          notSelector = notMatch[1];
          selector = selector.replace(/:not\([^)]+\)/, "");
        }
      }
      var isFirstFilter = selector.indexOf(":first") !== -1;
      var isLastFilter = selector.indexOf(":last") !== -1;
      selector = selector.replace(/:first|:last/g, "");
      var targetTagName = "";
      var targetId = "";
      var targetClasses = [];
      var selectorToParse = selector.trim();
      if (selectorToParse !== "") {
        var idIndex = selectorToParse.indexOf("#");
        if (idIndex !== -1) {
          var afterId = selectorToParse.substring(idIndex + 1);
          var nextDot = afterId.indexOf(".");
          targetId = nextDot === -1 ? afterId : afterId.substring(0, nextDot);
          selectorToParse =
            selectorToParse.substring(0, idIndex) +
            (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1));
        }
        var classParts = selectorToParse.split(".");
        var possibleTag = classParts.shift();
        if (possibleTag) {
          targetTagName = possibleTag.toLowerCase();
        }
        targetClasses = classParts.filter(function (c) {
          return c.length > 0;
        });
      }
      for (var i = 0; i < this.elements.length; i++) {
        var currentHtml = this.elements[i];
        var pos = 0;
        var subResults = [];
        while ((pos = currentHtml.indexOf("<", pos)) !== -1) {
          if (
            currentHtml.charAt(pos + 1) === "/" ||
            currentHtml.charAt(pos + 1) === "!"
          ) {
            pos++;
            continue;
          }
          var endOpenTag = -1;
          var insideQuote = false;
          var quoteChar = "";
          for (var j = pos + 1; j < currentHtml.length; j++) {
            var char = currentHtml.charAt(j);
            if (
              (char === '"' || char === "'") &&
              currentHtml.charAt(j - 1) !== "\\"
            ) {
              if (!insideQuote) {
                insideQuote = true;
                quoteChar = char;
              } else if (char === quoteChar) {
                insideQuote = false;
              }
            }
            if (char === ">" && !insideQuote) {
              endOpenTag = j;
              break;
            }
          }
          if (endOpenTag === -1) break;
          var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1);
          var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/);
          var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : "";
          var isMatched = true;
          if (targetTagName && targetTagName !== currentTagName) {
            isMatched = false;
          }
          var getClassAttr = fullOpenTag.match(
            /class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
          );
          var classMatchStr = getClassAttr
            ? getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || ""
            : "";
          var getIdAttr = fullOpenTag.match(
            /id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
          );
          var idMatchStr = getIdAttr
            ? getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || ""
            : "";
          if (isMatched && targetId && idMatchStr !== targetId) {
            isMatched = false;
          }
          if (isMatched && targetClasses.length > 0) {
            if (classMatchStr) {
              var currentClasses = classMatchStr.trim().split(/\s+/);
              for (var c = 0; c < targetClasses.length; c++) {
                if (currentClasses.indexOf(targetClasses[c]) === -1) {
                  isMatched = false;
                  break;
                }
              }
            } else {
              isMatched = false;
            }
          }
          if (isMatched && hasAttrFilter) {
            var actualValue = "";
            if (attrNameFilter === "class") {
              actualValue = classMatchStr;
            } else if (attrNameFilter === "id") {
              actualValue = idMatchStr;
            } else {
              var getAnyAttr = fullOpenTag.match(
                new RegExp(
                  attrNameFilter +
                    "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))",
                  "i",
                ),
              );
              actualValue = getAnyAttr
                ? getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || ""
                : "";
            }
            var attrExists =
              fullOpenTag.search(new RegExp(attrNameFilter + "\\s*=", "i")) !==
              -1;
            if (!attrExists) {
              isMatched = false;
            } else {
              if (attrOperator === "=") {
                if (attrNameFilter === "class") {
                  var classes = actualValue.trim().split(/\s+/);
                  if (classes.indexOf(attrValueFilter) === -1)
                    isMatched = false;
                } else if (actualValue !== attrValueFilter) {
                  isMatched = false;
                }
              } else if (attrOperator === "*=") {
                if (actualValue.indexOf(attrValueFilter) === -1)
                  isMatched = false;
              } else if (attrOperator === "^=") {
                if (actualValue.indexOf(attrValueFilter) !== 0)
                  isMatched = false;
              } else if (attrOperator === "$=") {
                if (
                  actualValue.slice(-attrValueFilter.length) !== attrValueFilter
                )
                  isMatched = false;
              }
            }
          }
          if (isMatched) {
            var startTagPos = pos;
            var endTagPos = endOpenTag + 1;
            var selfClosingTags = [
              "img",
              "source",
              "input",
              "br",
              "hr",
              "link",
              "meta",
            ];
            if (
              selfClosingTags.indexOf(currentTagName) === -1 &&
              fullOpenTag.indexOf("/>") === -1
            ) {
              var depth = 1;
              var tagRegex = new RegExp(
                "<(/?)" + currentTagName + "(?:\\s+[^>]*|\\s*>)",
                "gi",
              );
              tagRegex.lastIndex = endOpenTag + 1;
              var match;
              while ((match = tagRegex.exec(currentHtml)) !== null) {
                var isClose = match[1] === "/";
                var fullMatched = match[0];
                if (isClose) {
                  depth--;
                } else if (fullMatched.indexOf("/>") === -1) {
                  depth++;
                }
                if (depth === 0) {
                  endTagPos = tagRegex.lastIndex;
                  break;
                }
              }
              if (depth > 0) {
                endTagPos = currentHtml.length;
              }
            }
            var foundBlock = currentHtml.substring(startTagPos, endTagPos);
            if (contentFilter) {
              var pureText = "";
              if (currentTagName === "script" || currentTagName === "style") {
                var innerStart = foundBlock.indexOf(">") + 1;
                var innerEnd = foundBlock.search(/<\/(?:script|style)/i);
                pureText =
                  innerEnd !== -1
                    ? foundBlock.substring(innerStart, innerEnd)
                    : foundBlock.substring(innerStart);
              } else {
                pureText = foundBlock.replace(/<[^>]+>/g, "").trim();
              }
              var keywords = contentFilter.split("|");
              var isContentMatched = false;
              for (var k = 0; k < keywords.length; k++) {
                if (pureText.indexOf(keywords[k].trim()) !== -1) {
                  isContentMatched = true;
                  break;
                }
              }
              if (!isContentMatched) {
                pos = endTagPos;
                continue;
              }
            }
            if (notSelector) {
              var isNotClass = notSelector.indexOf(".") === 0;
              var isNotId = notSelector.indexOf("#") === 0;
              var notValue = notSelector.substring(1);
              var hasNot = false;
              if (isNotClass && classMatchStr.indexOf(notValue) !== -1)
                hasNot = true;
              if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true;
              if (!hasNot) subResults.push(foundBlock);
            } else {
              subResults.push(foundBlock);
            }
            pos = endTagPos;
          } else {
            pos++;
          }
        }
        if (isFirstFilter && subResults.length > 0)
          subResults = [subResults[0]];
        if (isLastFilter && subResults.length > 0)
          subResults = [subResults[subResults.length - 1]];
        results = results.concat(subResults);
      }
      var newInstance = _$(results);
      newInstance.sourceHtml = this.sourceHtml || currentHtml;
      return newInstance;
    },
    each: function (callback) {
      for (var i = 0; i < this.elements.length; i++) {
        var childInstance = _$(this.elements[i]);
        childInstance.sourceHtml = this.sourceHtml;
        callback.call(childInstance, i, this.elements[i]);
      }
      return this;
    },
    eq: function (index) {
      if (index < 0) index = this.elements.length + index;
      var matchedElement = this.elements[index];
      this.elements = matchedElement ? [matchedElement] : [];
      this.length = this.elements.length;
      return this;
    },
    attr: function (attrName) {
      if (this.elements.length === 0) return "";
      var elem = this.elements[0];
      var getAttr = elem.match(
        new RegExp(
          attrName + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))",
          "i",
        ),
      );
      return getAttr ? getAttr[1] || getAttr[2] || getAttr[3] || "" : "";
    },
    html: function () {
      if (this.elements.length === 0) return "";
      var elem = this.elements[0];
      var start = elem.indexOf(">") + 1;
      var matchClose = elem.match(/<\/([a-zA-Z0-9_-]+)\s*>\s*$/i);
      if (matchClose) {
        var end = elem.lastIndexOf(matchClose[0]);
        if (start > 0 && end >= start) return elem.substring(start, end);
      }
      return start > 0 ? elem.substring(start) : "";
    },
    text: function (separator) {
      if (this.elements.length === 0) return "";
      var elem = this.elements[0];
      var start = elem.indexOf(">") + 1;
      var end = elem.lastIndexOf("</");
      if (start > 0 && end > start) {
        var content = elem.substring(start, end);
        var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n");
        if (typeof separator === "string") {
          return pureText
            .split("\n")
            .map(function (item) {
              return item.trim();
            })
            .filter(function (item) {
              return item !== "";
            })
            .join(separator);
        }
        return pureText
          .split("\n")
          .map(function (item) {
            return item.trim();
          })
          .filter(function (item) {
            return item !== "";
          })
          .join(" ");
      }
      return "";
    },
    textAll: function (separator) {
      if (this.elements.length === 0) return "";
      var sep = typeof separator === "string" ? separator : " ";
      var allTexts = [];
      for (var i = 0; i < this.elements.length; i++) {
        var elem = this.elements[i];
        var start = elem.indexOf(">") + 1;
        var end = elem.lastIndexOf("</");
        if (start > 0 && end > start) {
          var content = elem.substring(start, end);
          var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n");
          var cleanText = pureText
            .split("\n")
            .map(function (item) {
              return item.trim();
            })
            .filter(function (item) {
              return item !== "";
            })
            .join(" ");
          if (cleanText !== "") {
            allTexts.push(cleanText);
          }
        }
      }
      return allTexts.join(sep);
    },
    next: function () {
      var results = [];
      if (!this.sourceHtml) return this;
      for (var i = 0; i < this.elements.length; i++) {
        var elem = this.elements[i];
        var idx = this.sourceHtml.indexOf(elem);
        if (idx === -1) continue;
        var scanPos = idx + elem.length;
        var nextOpen = this.sourceHtml.indexOf("<", scanPos);
        if (nextOpen !== -1) {
          if (this.sourceHtml.charAt(nextOpen + 1) === "/") continue;
          var endOpenTag = this.sourceHtml.indexOf(">", nextOpen);
          if (endOpenTag === -1) continue;
          var fullOpenTag = this.sourceHtml.substring(nextOpen, endOpenTag + 1);
          var spacePos = fullOpenTag.indexOf(" ");
          var currentTagName =
            spacePos === -1
              ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase()
              : fullOpenTag.substring(1, spacePos).toLowerCase();
          var startTagPos = nextOpen;
          var endTagPos = endOpenTag + 1;
          var selfClosingTags = [
            "img",
            "source",
            "input",
            "br",
            "hr",
            "link",
            "meta",
          ];
          if (
            selfClosingTags.indexOf(currentTagName) === -1 &&
            fullOpenTag.indexOf("/>") === -1
          ) {
            var depth = 1;
            var tagRegex = new RegExp(
              "<(/?)" + currentTagName + "(?:\\s+[^>]*|\\s*>)",
              "gi",
            );
            tagRegex.lastIndex = endOpenTag + 1;
            var match;
            while ((match = tagRegex.exec(this.sourceHtml)) !== null) {
              if (match[1] === "/") depth--;
              else if (match[0].indexOf("/>") === -1) depth++;
              if (depth === 0) {
                endTagPos = tagRegex.lastIndex;
                break;
              }
            }
          }
          results.push(this.sourceHtml.substring(startTagPos, endTagPos));
        }
      }
      var nextInstance = _$(results);
      nextInstance.sourceHtml = this.sourceHtml;
      this.elements = results;
      this.length = results.length;
      return this;
    },
    parent: function () {
      var results = [];
      if (!this.sourceHtml) return this;
      for (var i = 0; i < this.elements.length; i++) {
        var elem = this.elements[i];
        var idx = this.sourceHtml.indexOf(elem);
        if (idx <= 0) continue;
        var scanPos = idx - 1;
        while (scanPos >= 0) {
          var openTagPos = this.sourceHtml.lastIndexOf("<", scanPos);
          if (openTagPos === -1) break;
          if (
            this.sourceHtml.charAt(openTagPos + 1) !== "/" &&
            this.sourceHtml.charAt(openTagPos + 1) !== "!"
          ) {
            var endOpenTag = this.sourceHtml.indexOf(">", openTagPos);
            if (endOpenTag !== -1 && endOpenTag > openTagPos) {
              var fullOpenTag = this.sourceHtml.substring(
                openTagPos,
                endOpenTag + 1,
              );
              var spacePos = fullOpenTag.indexOf(" ");
              var currentTagName =
                spacePos === -1
                  ? fullOpenTag
                      .substring(1, fullOpenTag.length - 1)
                      .toLowerCase()
                  : fullOpenTag.substring(1, spacePos).toLowerCase();
              var endTagPos = endOpenTag + 1;
              var selfClosingTags = [
                "img",
                "source",
                "input",
                "br",
                "hr",
                "link",
                "meta",
              ];
              if (
                selfClosingTags.indexOf(currentTagName) === -1 &&
                fullOpenTag.indexOf("/>") === -1
              ) {
                var depth = 1;
                var tagRegex = new RegExp(
                  "<(/?)" + currentTagName + "(?:\\s+[^>]*|\\s*>)",
                  "gi",
                );
                tagRegex.lastIndex = endOpenTag + 1;
                var match;
                while ((match = tagRegex.exec(this.sourceHtml)) !== null) {
                  if (match[1] === "/") depth--;
                  else if (match[0].indexOf("/>") === -1) depth++;
                  if (depth === 0) {
                    endTagPos = tagRegex.lastIndex;
                    break;
                  }
                }
              }
              if (endTagPos >= idx + elem.length) {
                var parentBlock = this.sourceHtml.substring(
                  openTagPos,
                  endTagPos,
                );
                if (results.indexOf(parentBlock) === -1)
                  results.push(parentBlock);
                break;
              }
            }
          }
          scanPos = openTagPos - 1;
        }
      }
      var parentInstance = _$(results);
      parentInstance.sourceHtml = this.sourceHtml;
      this.elements = results;
      this.length = results.length;
      return this;
    },
    closest: function (selector) {
      var results = [];
      if (!this.sourceHtml || this.elements.length === 0) return _$([]);
      for (var i = 0; i < this.elements.length; i++) {
        var currentElem = this.elements[i];
        var currentObj = _$(currentElem);
        currentObj.sourceHtml = this.sourceHtml;
        var selfCheck = _$(this.sourceHtml).find(selector);
        var isSelfMatched = false;
        for (var s = 0; s < selfCheck.elements.length; s++) {
          if (selfCheck.elements[s] === currentElem) {
            isSelfMatched = true;
            break;
          }
        }
        if (isSelfMatched) {
          if (results.indexOf(currentElem) === -1) results.push(currentElem);
          continue;
        }
        var parentObj = currentObj.parent();
        while (parentObj.elements.length > 0) {
          var parentElem = parentObj.elements[0];
          var checkMatch = _$(this.sourceHtml).find(selector);
          var isMatched = false;
          for (var j = 0; j < checkMatch.elements.length; j++) {
            if (checkMatch.elements[j] === parentElem) {
              isMatched = true;
              break;
            }
          }
          if (isMatched) {
            if (results.indexOf(parentElem) === -1) results.push(parentElem);
            break;
          }
          parentObj = parentObj.parent();
        }
      }
      var closestInstance = _$(results);
      closestInstance.sourceHtml = this.sourceHtml;
      return closestInstance;
    },
  };
  instance.length = instance.elements.length;
  return instance;
}

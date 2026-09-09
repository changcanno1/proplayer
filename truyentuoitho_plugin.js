var iddomain = "truyentuoitho";
BASEURL = "https://truyentuoitho.com";
var NEWDOMAIN = false;

var popup_html = "<div class='donate-container'>...</div>";

function getManifest() {
  try {
    return JSON.stringify({
      "id": "truyentuoitho",
      "name": "[MANGA] Truyện Tuổi Thơ",
      "version": "1.0",
      "author": "Alokillgtv",
      "info": "Đọc truyện tranh, manga, manhwa, manhua miễn phí tại Truyện Tuổi Thơ",
      "headers": {
        "Referer": BASEURL,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/truyentuoitho.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "orientation": "auto",
      "type": "MANGA",
      "subtitleCat": false,
      "playerType": "embed"
    });
  } catch (e) {
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

if (NEWDOMAIN) {
  if (typeof httpRequest === "function") {
    var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {
      method: "POST"
    });
    if (res && res.isSuccessful) {
      var resobj = JSON.parse(res.body);
      if (resobj[iddomain]) {
        BASEURL = resobj[iddomain].new;
      } else {
        BASEURL = "https://truyentuoitho.com";
      }
    } else {
      BASEURL = "https://truyentuoitho.com";
    }
  } else {
    BASEURL = "https://truyentuoitho.com";
  }
} else {
  BASEURL = "https://truyentuoitho.com";
  console.log("BASEURL " + BASEURL);
}

// ===== DANH MỤC TRANG CHỦ =====
function getHomeSections() {
  return JSON.stringify([
    { "slug": "/", "title": "Truyện Mới", "type": "Grid" }
  ]);
}

// ===== DANH SÁCH THỂ LOẠI (Hardcode từ menu) =====
function getLISTmenu() {
  try {
    return `[
      {"link":"/manga-genre/action/","name":"Action"},
      {"link":"/manga-genre/adult/","name":"Adult"},
      {"link":"/manga-genre/adventure/","name":"Adventure"},
      {"link":"/manga-genre/anime/","name":"Anime"},
      {"link":"/manga-genre/comedy/","name":"Comedy"},
      {"link":"/manga-genre/comic/","name":"Comic"},
      {"link":"/manga-genre/cooking/","name":"Cooking"},
      {"link":"/manga-genre/drama/","name":"Drama"},
      {"link":"/manga-genre/fantasy/","name":"Fantasy"},
      {"link":"/manga-genre/harem/","name":"Harem"},
      {"link":"/manga-genre/historical/","name":"Historical"},
      {"link":"/manga-genre/horror/","name":"Horror"},
      {"link":"/manga-genre/josei/","name":"Josei"},
      {"link":"/manga-genre/live-action/","name":"Live action"},
      {"link":"/manga-genre/manga/","name":"Manga"},
      {"link":"/manga-genre/manhua/","name":"Manhua"},
      {"link":"/manga-genre/manhwa/","name":"Manhwa"},
      {"link":"/manga-genre/martial-arts/","name":"Martial Arts"},
      {"link":"/manga-genre/mature/","name":"Mature"},
      {"link":"/manga-genre/mecha/","name":"Mecha"},
      {"link":"/manga-genre/mystery/","name":"Mystery"},
      {"link":"/manga-genre/one-shot/","name":"One shot"},
      {"link":"/manga-genre/psychological/","name":"Psychological"},
      {"link":"/manga-genre/romance/","name":"Romance"},
      {"link":"/manga-genre/school-life/","name":"School Life"},
      {"link":"/manga-genre/sci-fi/","name":"Sci-fi"},
      {"link":"/manga-genre/seinen/","name":"Seinen"},
      {"link":"/manga-genre/shoujo/","name":"Shoujo"},
      {"link":"/manga-genre/shounen/","name":"Shounen"},
      {"link":"/manga-genre/slice-of-life/","name":"Slice of Life"},
      {"link":"/manga-genre/sports/","name":"Sports"},
      {"link":"/manga-genre/thieu-nhi/","name":"Thiếu Nhi"},
      {"link":"/manga-genre/webtoon/","name":"Webtoon"}
    ]`;
  } catch (e) {
    log("getLISTmenu[err]:\n " + e);
    return `[{"link":"/","name":"Đang lỗi getLISTmenu()"}]`;
  }
}

// ===== TẠO URL DANH SÁCH =====
function getUrlList(slug, filtersJson) {
  try {
    if (slug && slug.indexOf("http") > -1) return slug;
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
      } catch (e) { log("getUrlList():\n" + e) }
    }
    var resultUrl = BASEURL + (path.indexOf("/") === 0 ? "" : "/") + path;

    if (page > 1) {
      if (resultUrl.indexOf("?") > -1) {
        resultUrl += "/page/" + page;
      } else {
        if (resultUrl.indexOf("/manga/") !== -1 && !resultUrl.endsWith("/")) {
          resultUrl += "/page/" + page;
        } else {
          resultUrl += "/page/" + page;
        }
      }
    }
    var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
    log("getUrlList[url]: " + finalUrl);
    return finalUrl;
  } catch (e) {
    log("getUrlList[err]:\n " + e);
    return BASEURL;
  }
}

// ===== TẠO URL TÌM KIẾM =====
function getUrlSearch(keyword, filtersJson) {
  try {
    var page = 1;
    if (filtersJson) {
      var fixedJson = filtersJson
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
      try {
        var filters = JSON.parse(fixedJson);
        page = parseInt(filters.page) || 1;
      } catch (e) { log("getUrlSearch parse err:" + e) }
    }
    var encodedKeyword = encodeURIComponent(keyword || "");
    var resultUrl = BASEURL + "/?s=" + encodedKeyword + "&post_type=wp-manga";
    if (page > 1) {
      resultUrl += "&paged=" + page;
    }
    log("getUrlSearch[url]: " + resultUrl);
    return resultUrl;
  } catch (e) {
    log("getUrlSearch[err]:\n " + e);
    return BASEURL;
  }
}
function parseListResponse(html, url) {
  console.log("Listurl\n" + url);
  try {
    var $doc = _$(html);
    var items = [];

    // Chỉ cần selector duy nhất cho mọi loại trang
    $doc.find(".page-item-detail,.c-tabs-item__content").each(function() {
      var $el = this;

      // Link truyện
      var link = $el.find(".item-thumb a,.post-title a").attr("href");
      if (link && link.indexOf("http") === -1) link = BASEURL + link;

      // Tiêu đề
      var title = $el.find(".post-title h3 a").text().trim();
      if (!title) title = $el.find("img").attr("alt") || "";

      // Ảnh bìa
      var img = $el.find(".item-thumb img").attr("src");
      if (!img) img = $el.find("img").attr("src");
      if (img && img.indexOf("http") === -1) img = BASEURL + img;
      if (img && img.indexOf("default") > -1) img = "";

      var proxy = "";
      var poster = img;
      if (proxy) {
        proxy = "https://proxyimg.alokillgtv.workers.dev/?referer=" + BASEURL + "&url=";
        poster = proxy + encodeURIComponent(img);
      }
      
      // Chapter mới nhất
      var latestChap = $el.find(".list-chapter .chapter-item:first .chapter a").text().trim();
      // Thời gian
      var lang = $el.find(".list-chapter .chapter-item:first .post-on").text().trim();

      if (title && poster) {
        items.push({
          "id": link || "",
          "title": title || "",
          "quality": latestChap || "",
          "episode_current": "",
          "posterUrl": poster || "",
          "backdropUrl": poster || "",
          "year": "",
          "lang": lang || ""
        });
      }
    });

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
        "id": url || "error_url",
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

function getChapterList(storyUrl) {
    // Đảm bảo URL kết thúc bằng dấu /
    if (!storyUrl.endsWith('/')) {
        storyUrl += '/';
    }

    var userAgent = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

    // 1. GET trang chi tiết truyện để thu thập Cookie
    var htmlRes = httpRequest(storyUrl, {
        method: "GET",
        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "vi-VN,vi;q=0.9"
        }
    });

    if (!htmlRes) {
        console.log("Lỗi: Không thể kết nối tới trang truyện");
        return null;
    }

    // 2. Tách và tổng hợp tất cả Cookie trả về từ Server
    var cookieHeader = "";
    if (htmlRes.headers) {
        var setCookie = htmlRes.headers["set-cookie"] || htmlRes.headers["Set-Cookie"];
        if (Array.isArray(setCookie)) {
            cookieHeader = setCookie.map(c => c.split(';')[0]).join('; ');
        } else if (typeof setCookie === 'string') {
            cookieHeader = setCookie.split(';')[0];
        }
    }

    console.log(`-> Cookie thu được: ${cookieHeader || "Không có cookie"}`);

    // 3. Chuẩn bị Request Headers cho AJAX Call
    var apiUrl = storyUrl + "ajax/chapters/?t=1";
    var headers = {
        "User-Agent": userAgent,
        "Accept": "*/*",
        "Accept-Language": "vi-VN",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://truyentuoitho.com",
        "Referer": storyUrl,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    };

    if (cookieHeader) {
        headers["Cookie"] = cookieHeader;
    }

    // 4. Gửi request POST không có body (Content-Length: 0)
    var apiRes = httpRequest(apiUrl, {
        method: "POST",
        headers: headers,
        body: ""
    });

    return apiRes ? apiRes.body : null;
}

// Gọi thử nghiệm:
// var result = getChapterList("https://truyentuoitho.com/manga/nhoc-miko/");

// ===== PARSE CHI TIẾT TRUYỆN =====
function parseMovieDetail(html, url) {
  try {
    var $doc = _$(html);
    var id = url;

    // 1. Tiêu đề
    var title = $doc.find(".post-title h1").text().trim();
    if (!title) title = $doc.find("h1").text().trim();

    // 2. Ảnh bìa
    var img = $doc.find(".summary_image img").attr("src");
    if (!img) img = $doc.find(".thumb-cover img").attr("src");
    if (img && img.indexOf("http") === -1) img = BASEURL + img;
    var proxy = "https://proxyimg.alokillgtv.workers.dev/?referer=" + BASEURL + "&url=";
    var posterUrl = proxy + encodeURIComponent(img);
    posterUrl = img
    var backdropUrl = posterUrl;

    // 3. Mô tả
    var description = $doc.find(".summary__content p").text().trim();
    if (!description) description = $doc.find(".description-summary .summary__content").text().trim();

    // 4. Tác giả
    var author = "Đang cập nhật";
    $doc.find(".post-content_item .summary-heading h5:contains('Tác giả')").each(function() {
      var $parent = this.closest(".post-content_item");
      if ($parent.length) {
        var val = $parent.find(".summary-content").text().trim();
        if (val) author = val;
      }
    });

    // 5. Trạng thái
    var status = "Đang tiến hành";
    $doc.find(".post-content_item .summary-heading h5:contains('Trạng thái')").each(function() {
      var $parent = this.closest(".post-content_item");
      if ($parent.length) {
        var val = $parent.find(".summary-content").text().trim();
        if (val) status = val;
      }
    });

    // 6. Thể loại
    var category = "";
    $doc.find(".genres-content a").each(function() {
      var cat = this.text().trim();
      if (cat) category += (category ? ", " : "") + "[" + cat + "](" + this.attr("href") + ")";
    });
      
    var htmlajax = getChapterList(url);
    var chapterContainer = _$(htmlajax);
    // 7. Danh sách chương (tập)
    var list_array = [];
    // Lấy từ container chapters
    
    if (chapterContainer.length) {
      // Nếu đã render, lấy từ .chapter-item a
      chapterContainer.find("a").each(function() {
        var link = this.attr("href");
        if (link && link.indexOf("http") === -1) link = BASEURL + link;
        var name = this.text().trim();
        if (link && name) {
          list_array.push({ url: link, name: name });
        }
      });
    }
    // Nếu không có, thử lấy từ các li trong danh sách chương
    
    // Sắp xếp chương (tăng dần)
    list_array.sort(function(a, b) {
      var valA = parseValue(a);
      var valB = parseValue(b);
      if (!valA.hasNum && !valB.hasNum) return valA.rawName.localeCompare(valB.rawName);
      if (!valA.hasNum) return -1;
      if (!valB.hasNum) return 1;
      if (valA.mainNum !== valB.mainNum) return valA.mainNum - valB.mainNum;
      return valA.subNum - valB.subNum;
    });

    var list_encode = BASE64.encode(JSON.stringify(list_array));
    var slug = encodeURIComponent(url);
    var target = "truyentuoitho";
    // Selector ảnh trong trang đọc (thường là .reading-content img)
    var element = encodeURIComponent(".reading-content img, .chapter-content img, .page-chapter img, #images_container img");
    var namechapter = encodeURIComponent(title);
    var domain = encodeURIComponent(BASEURL);
    var tester = "&status=false";
    var onproxy = "&proxy=false";
    var servers = [];
    var episodes = [];
    for (var i = 0; i < list_array.length; i++) {
      var startchapter = i;
      var linkStream = "https://manga.alokillgtv.workers.dev/?target=" + target + "&namechapter=" + namechapter + "&maxchapter=" + list_array.length + "&slug=" + slug + "&startchapter=" + startchapter + "&domain=" + domain + "&element=" + element + tester + onproxy;
      var chapName = list_array[i].name;
      var chapNumber = i + 1;
      var matchNum = chapName.match(/\d+/);
      if (matchNum) chapNumber = matchNum[0];
      episodes.push({
        id: linkStream,
        name: chapName,
        slug: "chuong-" + chapNumber
      });
    }

    servers.push({
      name: "Đọc Truyện",
      episodes: episodes
    });

    return JSON.stringify({
      id: url || "",
      title: title || "",
      originName: title || "",
      posterUrl: posterUrl || "",
      backdropUrl: backdropUrl || "",
      description: description || "",
      quality: "",
      year: "",
      rating: "",
      status: status || "",
      category: category || "",
      episode_current: "",
      servers: servers,
      duration: "",
      casts: author || "",
      director: "",
      country: "",
      lang: "",
      extra: "",
      datasend: list_encode
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

// ===== HÀM HỖ TRỢ PARSE VALUE (Sắp xếp chapter) =====
function parseValue(item) {
  var str = typeof item === 'object' && item !== null ? String(item.name || '') : String(item);
  var matches = str.match(/\d+/g);
  if (!matches) {
    return { hasNum: false, mainNum: 0, subNum: 0, rawName: str };
  }
  return {
    hasNum: true,
    mainNum: Number(matches[0]) || 0,
    subNum: Number(matches[1]) || 0,
    rawName: str
  };
}

//var url = "https://novahd.cc/api/show/1413"
//var url = "http://vkey.vn/novahd/api/show/1413"
// https://novahd.cc/api/shows/1413
//var html = sourceHTML;
//JSON.parse(parseMovieDetail(sourceHTML, url))
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM END ======

// ===== HÀM TẠO XỬ LÝ STREAM PHIM BEGIN ======

  function parseDetailResponse(html, url, list_encode) {
     //console.log("parseDetailResponse dang xu ly: " + url);
     //console.log("Datasend: \n" + list_encode);
    
    try {
      var stream = url.replace("&status=false","")
      var $return = JSON.stringify({
        url: stream,
        isEmbed: false,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Block-Ads": "false",
          "Custom-Js": `LIST_CHAPTER = "${list_encode}"`
        }     
      });
      //console.log("Return Parse:\n" + $return)
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
    //console.log(html);
   // log("parseEmbedResponse [url]: " + url); //console.log("parseEmbedResponse [Raw]: " + html);
    try {
      var $return = JSON.stringify({
        url: url,
        isEmbed: false,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": BASEURL,
          "Origin": BASEURL
        },  
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
 // parseDetailResnse, parseEmbedResponse
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HÀM TẠO CUSTOMpo SCRIPT BEGIN ====

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


function getparam(url, param) {
  var escapedparam = param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var regex = new RegExp('[?&]' + escapedparam + '=([^&#]*)');
  var match = url.match(regex);
  
  if (match) {
    return decodeURIComponent(match[1]);
  }
  
  return null;
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
  function log(msg) {console.log(msg);}
  
}
// ==== HIDEMENU ====

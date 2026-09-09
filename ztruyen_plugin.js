var iddomain = "zettruyen";
BASEURL = "https://www.zettruyen1.com";
var NEWDOMAIN = false;

function getManifest() {
  try {
    return JSON.stringify({
      "id": "zettruyen",
      "name": "[MANGA] ZetTruyen",
      "version": "1.1",
      "author": "Alokillgtv",
      "info": "Đọc truyện tranh manga, manhwa, manhua online miễn phí tại ZetTruyen",
      "imageReferer": "https://www.zettruyen1.com",
      "headers": {
        "Referer": BASEURL,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/zettruyen.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "orientation": "auto",
      "type": "MANGA",
      "subtitleCat": false
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
        BASEURL = "https://www.zettruyen1.com";
      }
    } else {
      BASEURL = "https://www.zettruyen1.com";
    }
  } else {
    BASEURL = "https://www.zettruyen1.com";
  }
} else {
  BASEURL = "https://www.zettruyen1.com";
  BASELINK = BASEURL;
  console.log("BASEURL " + BASEURL);
}

// ===== DANH MỤC TRANG CHỦ =====
function getHomeSections() {
  return JSON.stringify([
    { "slug": "/tim-kiem-nang-cao?genres=&status=Ho%C3%A0n%20th%C3%A0nh&type=all&sort=latest&chapterRange=all&name=", "title": "Truyện Full", "type": "Horizontal" },
    { "slug": "/tim-kiem-nang-cao?genres=&status=all&type=all&sort=rating&chapterRange=all&name=", "title": "Đánh Giá Cao", "type": "Horizontal" },
    { "slug": "/", "title": "Mới Cập Nhật", "type": "Grid" },
  ]);
}

// ===== DANH SÁCH THỂ LOẠI (Hardcode từ menu) =====
function getLISTmenu() {
  try {
    return `[
      {"link":"/the-loai/action","name":"Action"},
      {"link":"/the-loai/adventure","name":"Adventure"},
      {"link":"/the-loai/anime","name":"Anime"},
      {"link":"/the-loai/chuyen-sinh","name":"Chuyển Sinh"},
      {"link":"/the-loai/co-dai","name":"Cổ Đại"},
      {"link":"/the-loai/comedy","name":"Comedy"},
      {"link":"/the-loai/comic","name":"Comic"},
      {"link":"/the-loai/cooking","name":"Cooking"},
      {"link":"/the-loai/dam-my","name":"Đam Mỹ"},
      {"link":"/the-loai/doujinshi","name":"Doujinshi"},
      {"link":"/the-loai/drama","name":"Drama"},
      {"link":"/the-loai/fantasy","name":"Fantasy"},
      {"link":"/the-loai/gender-bender","name":"Gender Bender"},
      {"link":"/the-loai/historical","name":"Historical"},
      {"link":"/the-loai/horror","name":"Horror"},
      {"link":"/the-loai/live-action","name":"Live action"},
      {"link":"/the-loai/manga","name":"Manga"},
      {"link":"/the-loai/manhua","name":"Manhua"},
      {"link":"/the-loai/manhwa","name":"Manhwa"},
      {"link":"/the-loai/martial-arts","name":"Martial Arts"},
      {"link":"/the-loai/mecha","name":"Mecha"},
      {"link":"/the-loai/mystery","name":"Mystery"},
      {"link":"/the-loai/ngon-tinh","name":"Ngôn Tình"},
      {"link":"/the-loai/psychological","name":"Psychological"},
      {"link":"/the-loai/romance","name":"Romance"},
      {"link":"/the-loai/school-life","name":"School Life"},
      {"link":"/the-loai/sci-fi","name":"Sci-fi"},
      {"link":"/the-loai/shoujo","name":"Shoujo"},
      {"link":"/the-loai/shoujo-ai","name":"Shoujo Ai"},
      {"link":"/the-loai/shounen","name":"Shounen"},
      {"link":"/the-loai/shounen-ai","name":"Shounen Ai"},
      {"link":"/the-loai/slice-of-life","name":"Slice of Life"},
      {"link":"/the-loai/sports","name":"Sports"},
      {"link":"/the-loai/supernatural","name":"Supernatural"},
      {"link":"/the-loai/thieu-nhi","name":"Thiếu Nhi"},
      {"link":"/the-loai/tragedy","name":"Tragedy"},
      {"link":"/the-loai/trinh-tham","name":"Trinh Thám"},
      {"link":"/the-loai/truyen-mau","name":"Truyện Màu"},
      {"link":"/the-loai/truyen-scan","name":"Truyện scan"},
      {"link":"/the-loai/tu-tien","name":"Tu Tiên"},
      {"link":"/the-loai/webtoon","name":"Webtoon"},
      {"link":"/the-loai/xuyen-khong","name":"Xuyên Không"}
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
        resultUrl += "&page=" + page;
      } else {
        resultUrl += "?page=" + page;
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
    var resultUrl = BASEURL + "/tim-kiem-nang-cao?keyword=" + encodedKeyword;
    if (page > 1) {
      resultUrl += "&page=" + page;
    }
    log("getUrlSearch[url]: " + resultUrl);
    return resultUrl;
  } catch (e) {
    log("getUrlSearch[err]:\n " + e);
    return BASEURL;
  }
}

// ===== PARSE DANH SÁCH TRUYỆN (Hỗ trợ cả trang chủ, thể loại, tìm kiếm) =====

function parseListResponse(html, url) {
  console.log("Listurl\n" + url)
  try {
    var $doc = _$(html);
    var items = [];

    // --- PHÂN LOẠI TRANG ---
    var isHome = false;
    var isCategory = false;
    var isSearch = false;

    if (url === BASEURL || url === BASEURL + "/" || url.indexOf("/?page=") > -1) {
      isHome = true;
    } else if (url.indexOf("/the-loai/") !== -1) {
      isCategory = true;
    } else if (url.indexOf("/tim-kiem-nang-cao") !== -1) {
      isSearch = true;
    }

    // ============================================================
    // KHỐI 1: TRANG CHỦ
    // ============================================================
    if (isHome) {
      $doc.find(".w-full.p-1").each(function() {
        var $el = this;
        var link = $el.find("img").closest("a").attr("href");
        if (link && link.indexOf("http") === -1) link = BASEURL + link;

        var title = $el.find("img").attr("alt");

        var img = $el.find("img").attr("src");
        if (img && img.indexOf("http") === -1) img = BASEURL + img;
        var poster = "https://proxyimg.alokillgtv03.workers.dev/?referer=" + BASELINK + "&url=" + img || "";
        var boxtime = $el.find(".chapter-link").closest(".flex-row");
        var latestChap = boxtime.find(".truncate").text(); 
        var lang = boxtime.find("span:last").text();

        if (title && poster) {
          items.push({
            "id": link || "",
            "title": title,
            "quality": latestChap || "",
            "episode_current": "",
            "posterUrl": poster,
            "backdropUrl": poster,
            "year": "",
            "lang": lang || ""
          });
        }
      });
    }

    // ============================================================
    // KHỐI 2: TRANG THỂ LOẠI (/the-loai/)
    // ============================================================
    else if (isCategory) {
      $doc.find(".grid a").each(function() {
        var $el = this;
        // Bản thân là thẻ a
        var link = $el.attr("href");
        if (link && link.indexOf("http") === -1) link = BASEURL + link;

        var title = $el.find(".font-bold").text().trim();
        if (!title) title = $el.find(".post-title a").text().trim();
        if (!title) title = $el.find("img").attr("alt") || "";

        var img = $el.find("img").attr("src");
        if (img && img.indexOf("http") === -1) img = BASEURL + img;
        var poster = "https://proxyimg.alokillgtv03.workers.dev/?referer=" + BASELINK + "&url=" + img || "";
        poster = img;
        var latestChap = $el.find(".text-txt-secondary.truncate").text().trim();
        if (!latestChap) latestChap = $el.find(".chapter-item a").text().trim();

        var lang = $el.find(".text-[#D9D9D9]").text().trim();

        if (title && poster) {
          items.push({
            "id": link || "",
            "title": title,
            "quality": latestChap || "",
            "episode_current": "",
            "posterUrl": poster,
            "backdropUrl": poster,
            "year": "",
            "lang": lang || ""
          });
        }
      });
    }

    // ============================================================
    // KHỐI 3: TRANG TÌM KIẾM (/tim-kiem-nang-cao)
    // ============================================================
    else if (isSearch) {
      $doc.find(".grid a").each(function() {
        var $el = this;
        var link = $el.attr("href");
        if (link && link.indexOf("http") === -1) link = BASEURL + link;

        var title = $el.find(".font-bold").text().trim();
        if (!title) title = $el.find(".post-title a").text().trim();
        if (!title) title = $el.find("img").attr("alt") || "";

        var img = $el.find("img").attr("src");
        if (img && img.indexOf("http") === -1) img = BASEURL + img;
        var poster = "https://proxyimg.alokillgtv03.workers.dev/?referer=" + BASELINK + "&url=" + img || "";

        var latestChap = $el.find(".text-txt-secondary.truncate").text().trim();
        if (!latestChap) latestChap = $el.find(".chapter-item a").text().trim();

        var lang = $el.find(".text-[#D9D9D9]").text().trim();

        if (title && poster) {
          items.push({
            "id": link || "",
            "title": title,
            "quality": latestChap || "",
            "episode_current": "",
            "posterUrl": poster,
            "backdropUrl": poster,
            "year": "",
            "lang": lang || ""
          });
        }
      });
    }

    // ============================================================
    // PHÂN TRANG (chung cho cả 3, nhưng có thể tùy chỉnh)
    // ============================================================
    var totalPages = 1;
    var nextLink = $doc.find("a:contains('Sau'), a:contains('Trang sau'), a:contains('Next')").attr("href");
    if (nextLink) {
      var match = nextLink.match(/[?&]page=(\d+)/);
      if (match) totalPages = parseInt(match[1]);
    }
    var lastPageLink = $doc.find(".pagination li:last-child a, .flex.items-center a:last-child").attr("href");
    if (lastPageLink) {
      var m = lastPageLink.match(/[?&]page=(\d+)/);
      if (m && parseInt(m[1]) > totalPages) totalPages = parseInt(m[1]);
    }

    return JSON.stringify({
      "items": items,
      "pagination": {
        "currentPage": 1,
        "totalPages": 99999
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

// ===== PARSE CHI TIẾT TRUYỆN =====
function parseMovieDetail(html, url) {
    try {
        var $doc = _$(html);
        var id = url;

        // 1. Tiêu đề
        var title = $doc.find("h1").text().trim();
        if (!title) title = $doc.find(".post-title h1").text().trim();

        // 2. Ảnh bìa
        var img = $doc.find(".summary_image img, .col-image img").attr("src");
        if (!img) img = $doc.find(".thumb-cover img").attr("src");
        if (img && img.indexOf("http") === -1) img = BASEURL + img;
        var proxy = "https://proxyimg.alokillgtv.workers.dev/?referer=" + BASEURL + "&url=";
        var posterUrl = proxy + encodeURIComponent(img);
        posterUrl = img;
        var backdropUrl = posterUrl;

        // 3. Mô tả
        var description = $doc.find(".comic-content").text().trim();
        if (!description) description = $doc.find(".description-summary .summary__content").text().trim();

        // 4. Tác giả (nếu có)
        var author = "Đang cập nhật";
        $doc.find(".summary-content:contains('Tác giả')").each(function() {
            author = this.text().replace(/Tác giả/i, "").trim();
        });

        // 5. Trạng thái
        var status = "";
        $doc.find(".post-status .summary-content, .status .summary-content").each(function() {
            var txt = this.text().trim();
            if (txt.indexOf("Ongoing") > -1 || txt.indexOf("Đang") > -1) status = "Đang tiến hành";
            else if (txt.indexOf("Hoàn") > -1 || txt.indexOf("Full") > -1) status = "Hoàn thành";
            else if (txt) status = txt;
        });
        if (!status) status = "Đang cập nhật";

        // 6. Thể loại
        var category = "";
        $doc.find(".space-y-1:content('Thể|loại') a").each(function() {
            var cat = this.text().trim();
            if (cat) category += (category ? ", " : "") + "[" + cat + "](" + this.attr("href") + ")";
        });

        // 7. Danh sách chương
        var chapname = $doc.find(".grid a:content('Đọc|chương|cuối')").parent().find("a:last").attr("title")
        var chapnum = chapname.match(/(\d+)/i)[1];
        var list_array = [];
        for (var $d = 0; $d < chapnum; $d++) {
            var link = url + "/chuong-" + ($d + 1)
            list_array.push({
                url: link,
                name: "Chương " + ($d + 1)
            });
        }
        // Nếu không có, thử lấy từ container chapters (có thể load bằng AJAX nhưng nếu đã render sẵn thì có thể bắt)
        if (list_array.length === 0) {
            $doc.find("#chapters-list-container .chapter-item a, #list_chapter li a").each(function() {
                var link = this.attr("href");
                if (link && link.indexOf("http") === -1) link = BASEURL + link;
                var name = this.text().trim();
                if (link && name) {
                    list_array.push({
                        url: link,
                        name: name
                    });
                }
            });
        }

        // Sắp xếp chapter (tăng dần)
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
        var target = "all";
        var element = encodeURIComponent(".chapter-images-container img");
        var namechapter = encodeURIComponent(title);
        var domain = encodeURIComponent(BASEURL);
        var tester = "&status=false";
        var onproxy = "&proxy=true";
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
                id: list_array[i].url,
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
        return {
            hasNum: false,
            mainNum: 0,
            subNum: 0,
            rawName: str
        };
    }
    return {
        hasNum: true,
        mainNum: Number(matches[0]) || 0,
        subNum: Number(matches[1]) || 0,
        rawName: str
    };
}


 function parseDetailResponse(html, url, list_encode) {
     //console.log("parseDetailResponse dang xu ly: " + url);
     //console.log("Datasend: \n" + list_encode);
    
    try {
      const adPatterns = [
        /quang-cao/i,/quangcao/i,/qcao/i,/banner/i,/logo/i,/avatar/i,/popup/i,/advert/i,/sponsor/i,/khuyen-mai/i,/promo/i,/ad_/i,/adv_/i,/quangcao/i,/quang_cao/i,/banner_/i,/popup_/i,/sponsor_/i,/nettruyenviet1\.png/i,/\/0\.jpg/i, /data:image/i,
        /no-img/i,
        /\/0_/i
      ];
      const BLOCKED_DOMAINS = [
        "sv1.otruyencdn.com",
      ];
      var images = [];
      var $doc = _$(html);
      $doc.find(".chapter-images-container img").each(function(index) {
  var $img = this;

  // 1. Lấy danh sách URL ứng viên theo thứ tự
  var candidates = [
    $img.attr("data-original"),
    $img.attr("data-src"),
    $img.attr("src"),
    $img.attr("data-cdn")
  ];

  // Tìm URL đầu tiên bắt đầu bằng http
  var src = candidates.find(function(url) {
    return url && url.toLowerCase().trim().indexOf("http") === 0;
  }) || "";

  if (!src) return; // Không có URL hợp lệ thì bỏ qua

  var cleanSrc = src.trim();
  var lower = cleanSrc.toLowerCase();

  // 2. BỘ LỌC QUẢNG CÁO (isAdImage)
  // Lọc data:image, base64...
  if (lower.indexOf("data:") === 0) return;

  // Lọc link không đúng định dạng web
  if (!cleanSrc.match(/^https?:\/\//i) && lower.indexOf("//") !== 0) return;

  // Lọc danh sách Regex Patterns
  var isAd = adPatterns.some(function(pattern) {
    return pattern.test(lower);
  });
  if (isAd) return;

  // Lọc theo tên file (sau dấu / cuối cùng)
  var fileName = lower.split("/").pop();
  var isAdFile = adPatterns.some(function(pattern) {
    return pattern.test(fileName);
  });
  if (isAdFile) return;

  // 3. BỘ LỌC DOMAIN BỊ CHẶN (BLOCKED_DOMAINS)
  var domain = null;
  try {
    domain = new URL(cleanSrc).hostname.toLowerCase();
  } catch (e) {}

  if (domain && BLOCKED_DOMAINS.indexOf(domain) !== -1) {
    console.log("Bỏ qua ảnh thuộc domain bị chặn:", cleanSrc);
    return;
  }

  // 4. Nếu vượt qua tất cả bộ lọc thì lấy
  console.log(index + " - Link hợp lệ: " + cleanSrc);
  images.push(cleanSrc);
});


      var $return = JSON.stringify({
        url: url,
        isEmbed: false,
        images: images,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
           "Block-Ads": "false",
          "Referer": BASEURL
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

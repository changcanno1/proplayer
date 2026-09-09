var iddomain = "fastscans"
BASEURL = "https://vkey.vn/" + iddomain;
//BASEURL = "https://goctruyentranhvui31.com";

var NEWDOMAIN = false;
function getManifest() {
  try{
    return JSON.stringify({
      "id": "fastscans",
      "name": "[MANGA] Fastscans",
      "version": "1.1",
      "author": "Alokillgtv",
      "info": "",
      "headers": {
        "Referer": BASEURL,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/fastscans.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "orientation": "auto",
      "type": "MANGA",
      "subtitleCat": false
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
                BASEURL = "https://vkey.vn/" + iddomain;
            }
        } else {
            BASEURL = "https://vkey.vn/" + iddomain;
        }
    } else {
        BASEURL = "https://vkey.vn/" + iddomain;
    }
} else {
    BASEURL = "https://fastscans.org"
    BASELINK = BASEURL;
    console.log("BASEURL " + BASEURL);
}

////https://abtruyen1.com/reload-comic-home?type=view

//https://abtruyen1.com/reload-comic-home?type=point

//https://abtruyen1.com/reload-comic-home?type=date
// https://abtruyen1.com/tim-kiem
// Tạo List phim ở menu Home
function getHomeSections() {
      return JSON.stringify([
          {"slug": "/danh-sach/truyen-yeu-thich","title": "Xem Nhiều","type": "Horizontal"},
          {"slug": "/danh-sach/truyen-full","title": "Truyện Hoàn Thành","type": "Horizontal"},
          {"slug": "/danh-sach/truyen-moi-cap-nhat","title": "Truyện Mới","type": "Grid"}
      ]);
  }
  
  // Hàm khởi tạo thẻ chủ đề
function getLISTmenu() {
    try{
      return `[{"link":"/the-loai/action","name":"Action"},{"link":"/the-loai/comedy","name":"Comedy"},{"link":"/the-loai/manga","name":"Manga"},{"link":"/the-loai/school-life","name":"School Life"},{"link":"/the-loai/shounen","name":"Shounen"},{"link":"/the-loai/manhwa","name":"Manhwa"},{"link":"/the-loai/ngon-tinh","name":"Ngôn Tình"},{"link":"/the-loai/romance","name":"Romance"},{"link":"/the-loai/truyen-mau","name":"Truyện Màu"},{"link":"/the-loai/webtoon","name":"Webtoon"},{"link":"/the-loai/xuyen-khong","name":"Xuyên Không"},{"link":"/the-loai/manhua","name":"Manhua"},{"link":"/the-loai/mystery","name":"Mystery"},{"link":"/the-loai/sci-fi","name":"Sci-fi"},{"link":"/the-loai/dam-my","name":"Đam Mỹ"},{"link":"/the-loai/gender-bender","name":"Gender Bender"},{"link":"/the-loai/seinen","name":"Seinen"},{"link":"/the-loai/slice-of-life","name":"Slice of Life"},{"link":"/the-loai/comic","name":"Comic"},{"link":"/the-loai/fantasy","name":"Fantasy"},{"link":"/the-loai/supernatural","name":"Supernatural"},{"link":"/the-loai/chuyen-sinh","name":"Chuyển Sinh"},{"link":"/the-loai/co-dai","name":"Cổ Đại"},{"link":"/the-loai/adventure","name":"Adventure"},{"link":"/the-loai/martial-arts","name":"Martial Arts"},{"link":"/the-loai/ecchi","name":"Ecchi"},{"link":"/the-loai/horror","name":"Horror"},{"link":"/the-loai/psychological","name":"Psychological"},{"link":"/the-loai/smut","name":"Smut"},{"link":"/the-loai/harem","name":"Harem"},{"link":"/the-loai/mature","name":"Mature"},{"link":"/the-loai/historical","name":"Historical"},{"link":"/the-loai/drama","name":"Drama"},{"link":"/the-loai/trong-sinh","name":"Trọng Sinh"},{"link":"/the-loai/shoujo","name":"Shoujo"},{"link":"/the-loai/josei","name":"Josei"},{"link":"/the-loai/adult","name":"Adult"},{"link":"/the-loai/one-shot","name":"One Shot"},{"link":"/the-loai/tragedy","name":"Tragedy"},{"link":"/the-loai/huyen-huyen","name":"Huyền Huyễn"},{"link":"/the-loai/anime","name":"Anime"},{"link":"/the-loai/yuri","name":"Yuri"},{"link":"/the-loai/isekai","name":"Isekai"},{"link":"/the-loai/sports","name":"Sports"},{"link":"/the-loai/doujinshi","name":"Doujinshi"},{"link":"/the-loai/yaoi","name":"Yaoi"},{"link":"/the-loai/he-thong","name":"Hệ Thống"},{"link":"/the-loai/soft-yaoi","name":"Soft Yaoi"},{"link":"/the-loai/boylove","name":"BoyLove"},{"link":"/the-loai/detective","name":"Detective"},{"link":"/the-loai/magic","name":"Magic"},{"link":"/the-loai/mafia","name":"Mafia"},{"link":"/the-loai/mecha","name":"Mecha"},{"link":"/the-loai/trinh-tham","name":"Trinh Thám"},{"link":"/the-loai/shounen-ai","name":"Shounen Ai"},{"link":"/the-loai/demons","name":"Demons"},{"link":"/the-loai/18","name":"18+"},{"link":"/the-loai/soft-yuri","name":"Soft Yuri"},{"link":"/the-loai/shoujo-ai","name":"Shoujo Ai"},{"link":"/the-loai/16","name":"16+"},{"link":"/the-loai/live-action","name":"Live action"},{"link":"/the-loai/military","name":"Military"}]
`;
    } catch(e){
      log("getLISTmenu[err]:\n " + e);
      return `[
        {"link":"/","name":"Đang lỗi getLISTmenu()"},
      ]`;
    }
  }
 // getHomeSections(), getLISTmenu()
// ===== HÀM MENU LIST END ======

// ===== HÀM TẠO URL BEGIN ======

// https://truyenggvn.com/truyen-hoan-thanh/trang-3.html?status=2
// https://truyenggvn.com/tim-kiem/trang-3.html?q=c%C3%B4%20g%C3%A1i

function getUrlList(slug, filtersJson) {
    var paramPage = "page=";
    var charparam = true; // Flag bật/tắt ghép dấu (? hoặc &)
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
            } catch (e) { log("getUrlList():\n" + e) }
        }
        var resultUrl = BASELINK;
        if (path) {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }

        if (page > 0) {
            // Chỉ khi charparam = true MỚI tiến hành ghép ? hoặc &
            if (charparam === true) {
                var prefix = resultUrl.indexOf("?") > -1 ? "&" : "?";
                resultUrl += prefix + paramPage + page;
            } else {
                // Khi charparam = false: Ghép trực tiếp không có ? hay &
                resultUrl += paramPage + page;
            }
        }
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        return finalUrl;
    } catch (e) {
        log("getUrlList[err]:\n " + e);
        return BASEURL;
    }
}
// https://truyenggvn.com/tim-kiem/trang-3.html?q=c%C3%B4%20g%C3%A1i
function getUrlSearch(keyword, filtersJson) {
      var paramSearch = "/tim-kiem?q=";
      var charsearch = ""
      var paramPage = "";
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
          
          var resultUrl = BASELINK + paramSearch  +  charsearch + encodedKeyword + "&page=" + page;
  
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          
          log("getUrlSearch[url]: \n" + finalUrl);
          return finalUrl;
  
      } catch (e) {
          log("getUrlSearch[err]:\n " + e);
          return BASEURL;
      }
  }
 // getUrlList, getUrlSearch
// http://vkey.vn/animevv
// /quoc-gia/M%E1%BB%B9
// /top
//filtersJson = "{page:5}"
//getUrlList("/top", filtersJson)
//getUrlSearch("girl", filtersJson)
// ===== HÀM TẠO URL END ======

// ===== HÀM TẠO KHỐI LIST PHIM BEGIN ======

function formatToCompactNumber(text) {
    const regex = /(\d{1,3}(?:[.,]\d{3})+|\d{4,})/g;

    return text.replace(regex, (match) => {
        const cleanNum = match.replace(/[.,]/g, '');
        const num = parseFloat(cleanNum);
        const len = cleanNum.length;

        // Hàng triệu (>= 7 chữ số)
        if (len >= 7) {
            const millions = num / 1_000_000;
            return `${parseFloat(millions.toFixed(2))} Tr`;
        }

        // Hàng nghìn (4 đến 6 chữ số)
        if (len >= 4) {
            const thousands = num / 1_000;
            return `${parseFloat(thousands.toFixed(2))}K`;
        }

        return match;
    });
}


function parseRelativeToYear(timeStr) {
    const match = timeStr.match(/^(\d+)\s*(năm|tháng|tuần|ngày|giờ|phút)\s*trước$/i);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    const now = new Date();

    switch (unit) {
        case 'năm':
            now.setFullYear(now.getFullYear() - value);
            break;
        case 'tháng':
            now.setMonth(now.getMonth() - value);
            break;
        case 'tuần':
            now.setDate(now.getDate() - (value * 7));
            break;
        case 'ngày':
            now.setDate(now.getDate() - value);
            break;
        case 'giờ':
            now.setHours(now.getHours() - value);
            break;
        case 'phút':
            now.setMinutes(now.getMinutes() - value);
            break;
    }

    return now.getFullYear();
}
function parseValue(item) {
    // Lấy chuỗi name từ item (xử lý được cả khi truyền Object {name: ...} hoặc chuỗi)
    const str = typeof item === 'object' && item !== null ? String(item.name || '') : String(item);

    // Tìm tất cả các chuỗi số
    const matches = str.match(/\d+/g);

    // Nếu không chứa số
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
function parseListResponse(html, url) {
    console.log("list: " + url)
    try {
        var items = [];

        var $doc = _$(html)
        var items = [];
        $doc.find(".list_grid li").each(function() {
            var id = this.find("a").attr("href");
            if (id.indexOf("http") == -1) {
                id = BASELINK + id;
            }
            var title = decodeHTMLtext(this.find("img").attr("alt"));
            var linksrc = this.find("img").attr("data-src");
            if (linksrc.indexOf("http") == -1) {
                linksrc = BASELINK + linksrc;
            }
            var proxy = "";
            if (proxy) {
                proxy = "https://proxyimg.alokillgtv.workers.dev/?referer=" + BASELINK + "&url="
            }

            var poster = proxy + linksrc;
            //console.log(poster)
            var background = poster;
            // https://nettruyen.gg/assets/images/thumb-default.jpg
            var split = "";
            var quality =  this.find(".last_chapter").text().replace(/chapter|chương/i,"Chap");
            var episode_current = "";
            /*
            if(split && split[1]){
                quality = "👁️ " + formatToCompactNumber(split[1]);
                episode_current = "❤️ " + formatToCompactNumber(split[0]);
            }
            */
            var year = "";
            var lang =this.find(".time-ago").text();
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
        var $return = JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 9999
            }
        });
        // console.log("Return List:\n" + $return)
        return $return
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

function parseMovieDetail(html, url) {
    console.log("parseMovieDetail[url]: \n" + url);
    try {
        // === BƯỚC 2: TRÍCH XUẤT THÔNG TIN PHIM ===  
        var $doc = _$(html)
        var id = url;
        var $box = $doc.find(".book_detail");
        var linkimg = $box.find("img").attr("src");
        if (linkimg.indexOf("http") == -1) {
            linkimg = BASELINK + linkimg;
        }
        var proxy = "";
        if(proxy){
            proxy = "https://proxyimg.alokillgtv.workers.dev/?referer=" + BASELINK + "&url="
        }
        var posterUrl = proxy + linkimg;
        var backdropUrl = posterUrl;
        var title = decodeHTMLtext($box.find("h1").text())
        var originName = title
        var description = decodeHTMLtext($doc.find(`.story-detail-info`).text());
        var director = "";
        var casts = "";
        1
        // menu category
        var duration = "";
        var status = "Cập Nhật: " + $box.find(`.status p:last`).text();
        var episode_current = "";
        var year = "";
        var quality = "";
        var rating = "";
        var country = "";
        var lang = "";
        var extra = "";
        var merge = [];
        $doc.find(".list01 a").each(function() {
            merge.push("[" + this.text() + "](" + this.attr("href") + ")");
        })
        var category = merge.join(", ");
        var list_array = [];
// 
        $doc.find(".list_chapter a").each(function() {
            var href = this.attr("href");
            if(href.indexOf("http") == -1){
              href = BASELINK + href
            }
            var name = this.text().trim() || href; // lấy text làm tên
            list_array.push({
                url: href,
                name: name
            });
        });

        // Sắp xếp theo logic mới
        list_array.sort((a, b) => {
            const valA = parseValue(a);
            const valB = parseValue(b);

            if (!valA.hasNum && !valB.hasNum) {
                return valA.rawName.localeCompare(valB.rawName);
            }
            if (!valA.hasNum) return -1;
            if (!valB.hasNum) return 1;

            if (valA.mainNum !== valB.mainNum) {
                return valA.mainNum - valB.mainNum;
            }
            return valA.subNum - valB.subNum;
        });


        // Mã hóa base64 và gửi POST lên worker
        var list_encode = BASE64.encode(JSON.stringify(list_array));

        var slug = encodeURIComponent(url);
        var testcode = false;
        var tester = "&status=false"
        if (testcode == true) {
            var res = httpRequest(
                "https://manga.alokillgtv.workers.dev/?postslug=true&slug=" + slug, c = {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain"
                    },
                    body: list_encode
                }
            );
            if (res.isSuccessful) {
                console.log("Đã lưu thành công, response:", res.body);
                tester = "&getslug=true"
            } else {
                console.error("Lỗi khi lưu:", res.status, res.body);
            }
        }


        // Tạo episodes và servers
        var servers = [];
        var episodes = [];
        var target = "all"; // giữ nguyên target
        var element = encodeURIComponent("#images_container img");
        var maxchapter = list_array.length;
        var namechapter = encodeURIComponent(title);
        var domain = encodeURIComponent(BASELINK);
        var logger = "";
        if (logger) {
            logger = "&console=true"
        }
        for (var $j = 0; $j < maxchapter; $j++) {
            var startchapter = $j;
            var linkStream = `https://manga.alokillgtv.workers.dev/?target=${target}&namechapter=${namechapter}&maxchapter=${maxchapter}&slug=${slug}&startchapter=${startchapter}&domain=${domain}&element=${element}${logger}${tester}`;

            // Lấy tên chương từ object và trích số để đặt slug
            var chapName = list_array[$j].name;
            var chapNumber = $j + 1; // mặc định
            var matchNum = chapName.match(/\d+/);
            if (matchNum) {
                chapNumber = matchNum[0];
            } else {
                // thử tìm trong url (dạng chapter-xxx)
                var urlMatch = list_array[$j].url.match(/chapter[-_]?(\d+)/i);
                if (urlMatch) chapNumber = urlMatch[1];
            }
            var namepg = "Chương " + chapNumber;

            episodes.push({
                id: list_array[$j].url,
                name: chapName,
                slug: "chuong-" + chapNumber
            });
        }

        servers.push({
            name: "Đọc Truyện",
            episodes: episodes
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
            extra: extra || "",
            datasend: list_encode
        });
        //console.log("Return Movie:\n" + $return)
        return $return
    } catch (e) {
        console.log("parseMovieDetail[err]:\n " + e);
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
      $doc.find("#images_container img").each(function(index) {
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

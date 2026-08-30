var iddomain = "truyenqqvn"
BASEURL = "https://vkey.vn/" + iddomain;
var popup_html = "";
// https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/phimchill.ico
function getManifest() {
  try{
    return JSON.stringify({
      "id": "truyenqqvn",
      "name": "Nguồn TruyệnQQVN",
      "version": "1.0",
      "author": "Alokillgtv",
      "info": "",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/truyenqq.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "type": "ANIME",
      "subtitleCat": false,
      "playerType": "embed"
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
/*
if (typeof httpRequest === "function") {
  var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {method: "POST"});
  if (res && res.isSuccessful) {
    var resobj = JSON.parse(res.body);
    BASEURL = resobj[iddomain].new;   
  } else {
    BASEURL = "https://vkey.vn/" + iddomain;
  }
} else {
  BASEURL = "https://vkey.vn/" + iddomain;
}
*/
BASEURL = "https://truyenqq.com.vn";
BASELINK = "https://truyenqq.com.vn";
console.log("BASEURL " + BASEURL);



// ===== HÀM MENU LIST BEGIN ======
function decodeHTMLtext(str) {
      try {
          if (!str) return "";
          
          // Bảng ánh xạ các tên thực thể HTML phổ biến
          const entities = {
              '&amp;': '&',
              '&lt;': '<',
              '&gt;': '>',
              '&quot;': '"',
              '&apos;': "'",
              '&nbsp;': ' '
          };

          // Thay thế cả mã số (dec/hex) lẫn tên thực thể
          return str.replace(/&#(\d+);|&#x([0-9a-fA-F]+);|&[a-zA-Z0-9#]+;/g, (match, dec, hex) => {
              if (dec) {
                  return String.fromCharCode(parseInt(dec, 10));
              }
              if (hex) {
                  return String.fromCharCode(parseInt(hex, 16));
              }
              // Nếu là dạng tên như &amp;, &lt;...
              if (entities[match]) {
                  return entities[match];
              }
              
              // Fallback dùng trình duyệt nếu có hỗ trợ môi trường DOM, ngược lại giữ nguyên
              if (typeof document !== 'undefined') {
                  const doc = new DOMParser().parseFromString(match, 'text/html');
                  return doc.documentElement.textContent || match;
              }
              
              return match;
          });
      } catch (e) {
          // Đảm bảo hàm log tồn tại hoặc thay bằng console.log
          if (typeof log === 'function') {
              log("decodeHTMLEntities[err]:\n " + e);
          } else {
              console.error("decodeHTMLEntities[err]:\n ", e);
          }
          return str;
      }
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
// Tạo List phim ở menu Home
function getHomeSections() {

      return JSON.stringify([
          {"slug": "/the-loai/horror","title": "Kinh Dị","type": "Horizontal"},
          {"slug": "/the-loai/manhwa","title": "Manwa","type": "Horizontal"},
          {"slug": "/the-loai/manhua","title": "Manhua","type": "Horizontal"},
          {"slug": "/the-loai/manga","title": "Manga","type": "Horizontal"},
          {"slug": "/truyen-moi","title": "Truyện Mới","type": "Grid"}
      ]);
  }
  
  // Hàm khởi tạo thẻ chủ đề
function getLISTmenu() {
    try{
      return `[{
    "link": "/the-loai/ngon-tinh",
    "name": "Ngôn Tình"
}, {
    "link": "/the-loai/dam-my",
    "name": "Đam Mỹ"
}, {
    "link": "/the-loai/huyen-huyen",
    "name": "Huyền Huyễn"
}, {
    "link": "/the-loai/xuyen-khong",
    "name": "Xuyên Không"
}, {
    "link": "/the-loai/trong-sinh",
    "name": "Trọng Sinh"
}, {
    "link": "/the-loai/trinh-tham",
    "name": "Trinh Thám"
}, {
    "link": "/the-loai/co-dai",
    "name": "Cổ Đại"
}, {
    "link": "/the-loai/chuyen-sinh",
    "name": "Chuyển Sinh"
}, {
    "link": "/the-loai/manhwa",
    "name": "Manhwa"
}, {
    "link": "/the-loai/truyen-mau",
    "name": "Truyện Màu"
}, {
    "link": "/the-loai/comedy",
    "name": "Comedy"
}, {
    "link": "/the-loai/manhua",
    "name": "Manhua"
}, {
    "link": "/the-loai/romance",
    "name": "Romance"
}, {
    "link": "/the-loai/school-life",
    "name": "School Life"
}, {
    "link": "/the-loai/action",
    "name": "Action"
}, {
    "link": "/the-loai/ecchi",
    "name": "Ecchi"
}, {
    "link": "/the-loai/manga",
    "name": "Manga"
}, {
    "link": "/the-loai/mystery",
    "name": "Mystery"
}, {
    "link": "/the-loai/seinen",
    "name": "Seinen"
}, {
    "link": "/the-loai/smut",
    "name": "Smut"
}, {
    "link": "/the-loai/supernatural",
    "name": "Supernatural"
}, {
    "link": "/the-loai/tragedy",
    "name": "Tragedy"
}, {
    "link": "/the-loai/drama",
    "name": "Drama"
}, {
    "link": "/the-loai/adventure",
    "name": "Adventure"
}, {
    "link": "/the-loai/fantasy",
    "name": "Fantasy"
}, {
    "link": "/the-loai/isekai",
    "name": "Isekai"
}, {
    "link": "/the-loai/horror",
    "name": "Horror"
}, {
    "link": "/the-loai/shounen",
    "name": "Shounen"
}, {
    "link": "/the-loai/gender-bender",
    "name": "Gender Bender"
}, {
    "link": "/the-loai/psychological",
    "name": "Psychological"
}, {
    "link": "/the-loai/slice-of-life",
    "name": "Slice of Life"
}, {
    "link": "/the-loai/mecha",
    "name": "Mecha"
}, {
    "link": "/the-loai/martial-arts",
    "name": "Martial Arts"
}, {
    "link": "/the-loai/harem",
    "name": "Harem"
}, {
    "link": "/the-loai/shoujo",
    "name": "Shoujo"
}, {
    "link": "/the-loai/historical",
    "name": "Historical"
}, {
    "link": "/the-loai/webtoon",
    "name": "Webtoon"
}, {
    "link": "/the-loai/sci-fi",
    "name": "Sci-fi"
}, {
    "link": "/the-loai/josei",
    "name": "Josei"
}, {
    "link": "/the-loai/adult",
    "name": "Adult"
}, {
    "link": "/the-loai/mature",
    "name": "Mature"
}, {
    "link": "/the-loai/sports",
    "name": "Sports"
}, {
    "link": "/the-loai/anime",
    "name": "Anime"
}, {
    "link": "/the-loai/comic",
    "name": "Comic"
}, {
    "link": "/the-loai/cooking",
    "name": "Cooking"
}, {
    "link": "/the-loai/one-shot",
    "name": "One shot"
}, {
    "link": "/the-loai/doujinshi",
    "name": "Doujinshi"
}, {
    "link": "/the-loai/magic",
    "name": "Magic"
}, {
    "link": "/the-loai/live-action",
    "name": "Live action"
}, {
    "link": "/the-loai/soft-yuri",
    "name": "Soft Yuri"
}, {
    "link": "/the-loai/yuri",
    "name": "Yuri"
}, {
    "link": "/the-loai/shoujo-ai",
    "name": "Shoujo Ai"
}, {
    "link": "/the-loai/demons",
    "name": "Demons"
}, {
    "link": "/the-loai/shounen-ai",
    "name": "Shounen Ai"
}, {
    "link": "/the-loai/thieu-nhi",
    "name": "Thiếu Nhi"
}, {
    "link": "/the-loai/soft-yaoi",
    "name": "Soft Yaoi"
}, {
    "link": "/the-loai/yaoi",
    "name": "Yaoi"
}, {
    "link": "/the-loai/detective",
    "name": "Detective"
}, {
    "link": "/the-loai/khac",
    "name": "Khác"
}]`;
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

        if (page > 0 && resultUrl.indexOf("page=") === -1) {
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
 
function getUrlSearch(keyword, filtersJson) {
      var paramSearch = "/tim-kiem?s=";
      var charsearch = ""
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
          
          var resultUrl = BASELINK + paramSearch + encodedKeyword +  paramPage + page;
  
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

function parseListResponse(html, url) {
    try {
        var $doc = _$(html)
        var items = [];
        $doc.find(".item").each(function() {
            var id = this.find("a").attr("href");
            if (id.indexOf("http") == -1) {
                id = BASELINK + id;
            }
            var title = decodeHTMLtext(this.find("h3 a").text());
            var linksrc = this.find("img").attr("src");
            if (linksrc.indexOf("http") == -1) {
                linksrc = BASELINK + linksrc;
            }
            var poster = linksrc;
            var background = poster;
            // https://nettruyen.gg/assets/images/thumb-default.jpg
            var split = this.find(".view").text()
            var quality = "👁️ " + "(" + formatToCompactNumber(split) + ")";
            var match = this.find(".line:content('Số|chương')").text().replace("Số chương","Chap")
            var year = "";
            var episode_current = decodeHTMLtext(match);

            var lang = this.find(".line:content('Thể|loại')").text();
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

function parseValue(item) {
    // Chuyển đổi phần tử thành chuỗi để xử lý
    const str = String(item);
    // Tách phần số chính và phần số phụ dựa vào dấu gạch ngang (-)
    const parts = str.split("-");
    const mainNum = Number(parts[0]);
    // Nếu có phần phụ (vd: "-2"), chuyển thành số, nếu không thì mặc định là 0
    const subNum = parts[1] !== undefined ? Number(parts[1]) : 0;

    return {
        mainNum,
        subNum
    };
}

function parseMovieDetail(html, url) {
    log("parseMovieDetail[url]: \n" + url);
    try {
        // === BƯỚC 2: TRÍCH XUẤT THÔNG TIN PHIM ===  
        var $doc = _$(html)
        var id = url;
        var $box = $doc.find(".book-info");
        var linkimg = $box.find("img").attr("src");
        if (linkimg.indexOf("http") == -1) {
            linkimg = BASELINK + linkimg;
        }
        var posterUrl = linkimg;
        var backdropUrl = posterUrl;
        var title = decodeHTMLtext($box.find("h1").text())
        var originName = title;
        var description = decodeHTMLtext($doc.find('div[itemprop="description"]').text());
        var director = $box.find(".title:content('Tác|giả')").next().text();
        var casts = "";
        // menu category
        var duration = "";
        var status = $box.find(".line-content:content('Cập|nhật')").text();
        var episode_current = "";
        var year = "";
        var quality = "";
        var rating = "";
        var country = "";
        var lang = "";
        var extra = ""; //BASEAPI + "/sources?type="+tags+"&tmdbId=" + $data.tmdbId;

        // menu casts
        var merge = [];
        $doc.find(".line-content:content('Thể|loại')").parent().find("a").each(function() {
            merge.push("[" + this.text() + "](" + this.attr("href") + ")");
        })
        var category = merge.join(", ");

        var list_array = [];
        var servers = [];
        var episodes = [];
        $doc.find(".reading-list a").each(function() {
            var href = this.attr("href");
            var match = href.match(/chapter\-(.*)$/i);
            var number = "";
            if (match && match[1]) {
                number = match[1];
            }
            list_array.push(number)
        })
        list_array.sort((a, b) => {
            const valA = parseValue(a);
            const valB = parseValue(b);

            // So sánh số chính trước
            if (valA.mainNum !== valB.mainNum) {
                return valA.mainNum - valB.mainNum;
            }
            // Nếu số chính bằng nhau, so sánh số phụ (phần sau dấu -)
            return valA.subNum - valB.subNum;
        });
        var list_encode = BASE64.encode(JSON.stringify(list_array));
        var list_chapter = encodeURIComponent(list_encode)

        // https://manga.alokillgtv.workers.dev/?startchapter=1&target=nettruyen&slug=https%3A%2F%2Fnettruyen.alokillgtv02.workers.dev%2Ftruyen-tranh%2Fdo-de-cua-ta-deu-la-dai-phan-phai%2F&maxchapter=500&namechapter=%C4%90%E1%BB%93%20%C4%91%E1%BB%87%20c%E1%BB%A7a%20ta%20%C4%91%E1%BB%81u%20l%C3%A0%20%C4%91%E1%BA%A1i%20ph%E1%BA%A3n%20ph%C3%A1i
        var target = "truyenqqvn";
        var maxchapter = ($doc.find(".reading-list a").length + 1);
        var namechapter = encodeURIComponent(title);
        var slug = encodeURIComponent(url.replace("https://nettruyen.alokillgtv.workers.dev", "https://nettruyen.gg")) + "/";
        var domain = encodeURIComponent(BASELINK);
        for (var $j = 1; $j < maxchapter; $j++) {
            var startchapter = $j;
            var linkStream = `https://manga.alokillgtv.workers.dev/?target=${target}&namechapter=${namechapter}&maxchapter=${maxchapter}&slug=${slug}&startchapter=${startchapter}&domain=${domain}&list_chapter=${list_chapter}&iframe=true`;
            episodes.push({
                id: linkStream,
                name: "Chương " + $j,
                slug: "chuong-" + $j
            })
        }
        servers.push({
            name: "Đọc Truyện",
            episodes: episodes
        })
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
        //console.log("Return Movie:\n" + $return)
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

  function parseDetailResponse(html, url) {
     console.log("parseDetailResponse dang xu ly: " + url);
    try {
      var $return = JSON.stringify({
        url: url,
        isEmbed: false,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Block-Ads": false,
          "Referer": BASEURL,
          "Origin": BASEURL,
        }     
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
          "Referer": BASEURL,
          "Origin": BASEURL,
          "Block-Ads": "false",
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
          fixedLine = fixedLine.replace(/\r/g, "").replace(/\t/g, "  "); // Thay Tab trần bằng 2 khoảng trắng cho an toàn
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

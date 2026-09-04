var iddomain = "1phim"
BASEURL = "https://vkey.vn/" + iddomain;
var BASELINK = BASEURL;
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>"
// https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/phimchill.ico
function getManifest() {
  try{
    return JSON.stringify({
      "id": "phimlongtieng",
      "name": "[MOVIE] Phim Lồng Tiếng",
      "version": "1.1.6",
      "author": "Alokillgtv",
      "info": "",
      "baseUrl": "https://www.1phim23.com",
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/phimlongtieng.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "type": "MOVIE",
      "subtitleCat": false,
      "playerType": "exoplayer"
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

// ===== HÀM MENU LIST BEGIN ======
{
// Tạo List phim ở menu Home
  function getHomeSections() {
      localStorage.clear();
      return JSON.stringify([
          {"slug": "/index.php?do=phim&act=searchs&year=2026&phim_group=1","title": "Phim Lẻ","type": "Horizontal"},
          {"slug": "/index.php?do=phim&act=searchs&year=2026&phim_group=2","title": "Phim Bộ","type": "Horizontal"},
          {"slug": "/search/ffvn/","title": "Lồng Tiếng FFVN","type": "Horizontal"},
          {"slug": "/search/uslt/","title": "Lồng Tiếng US","type": "Horizontal"},
          {"slug": "/phim-moi","title": "Phim Mới","type": "Grid"}
      ]);
  }


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

BASELINK = BASEURL;
console.log("BASEURL " + BASEURL);

  
  // Hàm khởi tạo thẻ chủ đề
  function getLISTmenu() {
    try{
      return `[
  {
    "link": "/index.php?do=phim&act=searchs&year=2026&phim_group=1",
    "name": "Phim Lẻ"
  },
    {
    "link": "/index.php?do=phim&act=searchs&year=2026&phim_group=2",
    "name": "Phim Bộ"
  },
    {
    "link": "/search/ffvn/",
    "name": "Lồng Tiếng FFVN"
  },
    {
    "link": "/search/uslt/",
    "name": "Lồng Tiếng US"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=phim-hanh-dong",
    "name": "Phim Hành Động"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=phim-vo-thuat",
    "name": "Phim Võ Thuật"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=phim-tam-ly",
    "name": "Phim Tâm Lý"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=phim-hai-huoc",
    "name": "Phim Hài Hước"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=phim-hoat-hinh",
    "name": "Phim Hoạt Hình"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=phim-phieu-luu",
    "name": "Phim Phiêu Lưu"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=phim-kinh-di",
    "name": "Phim Kinh Dị"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=phim-hinh-su",
    "name": "Phim Hình Sự"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=phim-chien-tranh",
    "name": "Phim Chiến Tranh"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=the-loai/phim-than-thoai",
    "name": "Phim Thần Thoại"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=the-loai/phim-vien-tuong",
    "name": "Phim Viễn Tưởng"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=the-loai/phim-co-trang",
    "name": "Phim Cổ Trang"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=the-loai/am-nhac",
    "name": "Âm Nhạc"
  },
  {
    "link": "/index.php?do=phim&act=searchs&phim_theloai=the-loai/tv-show/",
    "name": "TV Show"
  }
]`;
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
      var paramPage = "page=";
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
          if (page > 0 && resultUrl.indexOf("page") === -1 && resultUrl.indexOf("phim-moi") == -1 && resultUrl.indexOf("search") == -1) {
              
              if(resultUrl.indexOf("?") > -1){
                paramPage = "&" + paramPage;
              }
              else{
                paramPage = "?" + paramPage;
              }
              resultUrl += paramPage + page;
          }
          if (page > 0 && resultUrl.indexOf("phim-moi") > -1) {
              resultUrl += "-" + paramPage.replace("=","") + "-" + page + "/";
          }
          if (page > 0 && resultUrl.indexOf("search") > -1) {
              resultUrl += page + "/";
          }
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          return finalUrl;
      } catch (e) {
          log("getUrlList[err]:\n " + e);
          return BASEURL;
      }
  }
  
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
    var paramSearch = "/search/";
    var paramPage = "/";
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

        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1") + "/";
        
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
function parseListResponse(html, $url) {
    console.log("listMV\n" + $url)
    try {
        var $doc = _$(html);
        var items = [];
        $doc.find(".list-film li").each(function() {
            var id = this.find("a").attr("href");
            var title = this.find("a").attr("title");
            //console.log("listMV " + title)
            var poster = this.find("img").attr("src");
            var background = poster;
            var quality = this.find(".HD").text();
            var episode_current = this.find(".status").text();
            var match = this.find(".name").text();
            var year = 2026
            if (match) {
                year = match.match(/(\d+)$/)[0]
            }
            var lang = episode_current.replace(/\d+\/\d+/, "");

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
            //console.log("List item ["+$url+"]: \n" + JSON.stringify(items))

        })
        //console.log("List item ["+$url+"]: \n" + JSON.stringify(items))
        var $return = JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 9999
            }
        });
        //console.log("Return List:\n" + $return)
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
        var posterUrl = $doc.find('meta[property="og:image"]').attr("content");
        var backdropUrl = posterUrl;
        var title = $doc.find('meta[property="og:title"]').attr("content");;
        var originName = title;
        var description = decodeHTMLtext($doc.find('.detail-content-main').text());
        var director = "";
        var casts = "";
        var category = $doc.find("dt:content('Genre:')").next().text();;
        // menu category
        var duration = "";
        var status = $doc.find("dt:content('Status:')").next().text();
        var episode_current = "episode_current";
        var year = $doc.find("dt:content('Year:')").next().text();
        var quality = "";
        var rating = "";
        var country = $doc.find("dt:content('Country:')").next().text();
        var lang = $doc.find("dt:content('Episode:')").next().text();
        var extra = ""; //BASEAPI + "/sources?type="+tags+"&tmdbId=" + $data.tmdbId;
        /*
        // menu casts
        var merge = [];
        $doc.find("#extras:content('Diễn|viên:')").find("a").each(function(){
        merge.push("[" + this.attr("title") + "](" + this.attr("href") + ")");
        })
        var casts = merge.join(", ");
        */

        // menu casts
        /*
        // menu category
        var merge = [];
        $doc.find("#extras:content('Thể|loại:')").find("a").each(function(){
        merge.push("[" + this.attr("title") + "](" + this.attr("href") + ")");
        })
        var category = merge.join(", ");
        */
        var servers = [];
        var episodes = [];
        var typeVD = $doc.find('.page-tap li:first a').attr("href");

        $doc.find(".page-tap li").each(function(index, box) {
            if (typeVD.indexOf("-full") > -1) {
                var name = this.find("a").text();
                var slug = "tap-full";
            } else {
                var name = "Tập " + this.find("a").text();
                var slug = "tap-" + (index + 1);
            }
            var href = this.find("a").attr("href") || "";
            var fullUrl = href.indexOf("http") === 0 ? href : (BASELINK + (href.indexOf("/") === 0 ? "" : "/") + href);
            episodes.push({
                name: name,
                slug: slug,
                id: fullUrl + "?server=1",
                ids: [{
                    name: "Server 1",
                    url: fullUrl + "?server=1"
                }, {
                    name: "Server 2",
                    url: fullUrl + "?server=2"
                }, {
                    name: "Server 3",
                    url: fullUrl + "?server=3"
                }, {
                    name: "Server 4",
                    url: fullUrl + "?server=4"
                }]
            })

        })
        servers.push({
            name: "Server",
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
{
  function parseDetailResponse(html, url) {
  console.log("parseDetailResponse dang xu ly: " + url);
  try {
    var sourceHTML = html;
    var $doc = _$(sourceHTML);
    var stream = "";
    var mimeType = "video/mp4";
    var isEmbed = true;

    // 1. Thử giải mã trực tiếp nếu trang chứa mã hóa CryptoJSAesDecrypt
    var decryptedUrl = extractAndDecryptM3u8(sourceHTML);
    if (decryptedUrl && decryptedUrl.indexOf("http") === 0) {
      if (decryptedUrl.indexOf(".m3u8") > -1) {
        stream = decryptedUrl;
        isEmbed = false;
        mimeType = "application/x-mpegURL";
      } else if (decryptedUrl.indexOf("hash=") > -1) {
        var hashParam = getparam(decryptedUrl, "hash");
        var m3u8Url = hashParam ? BASE64.decode(hashParam) : "";
        if (m3u8Url && m3u8Url.indexOf("http") === 0) {
          stream = m3u8Url;
          isEmbed = false;
          mimeType = "application/x-mpegURL";
        } else {
          stream = decryptedUrl;
          isEmbed = true;
        }
      } else {
        // Trang embed trung gian (vd: vpm.php)
        stream = decryptedUrl;
        isEmbed = true;
      }
    }

    // 2. Nếu không có CryptoJSAesDecrypt, tìm trong #vb_server_list (cho các nguồn player khác)
    if (!stream) {
      var serverMatch = url.match(/server=(\d+)/i);
      var server = serverMatch ? parseInt(serverMatch[1], 10) : 1;

      var links = [];
      $doc.find("#vb_server_list span").each(function() {
        var string = this.attr("onclick") || "";
        var match = string.match(/["'](https?:\/\/[^"']+)["']/i);
        if (match && match[1]) {
          links.push(match[1]);
        }
      });

      function processLink(linkUrl) {
        if (!linkUrl) return "";
        if (linkUrl.indexOf("player-cdn.com") !== -1) {
          var vMatch = linkUrl.match(/[?&]v=([^&]+)/i);
          if (vMatch && vMatch[1]) {
            return "https://sc.k-20.xyz/stream/series/clbpx:lo2b09rr074-2q1390mfi:" + vMatch[1] + ".json";
          }
        }
        return linkUrl;
      }

      function getPriorityLink(linkArray) {
        if (!linkArray || linkArray.length === 0) return "";
        var p1 = linkArray.find(function(l) { return l.indexOf("1phim23.com") !== -1 || l.indexOf("1phim25.com") !== -1; });
        var p2 = linkArray.find(function(l) { return l.indexOf("cdn.loadvid.com") !== -1; });
        var p3 = linkArray.find(function(l) { return l.indexOf("player-cdn.com") !== -1; });
        if (p1) return p1;
        if (p2) return p2;
        if (p3) return p3;
        return linkArray[0];
      }

      if (server === 1) {
        var primelink = $doc.find("#vb_server_list .activelive").attr("data-url");
        if (primelink) {
          stream = processLink(primelink.replace(/&amp;/g, "&"));
        } else {
          stream = processLink(getPriorityLink(links));
        }
      } else {
        var targetIndex = server - 1;
        if (links.length > targetIndex && links[targetIndex]) {
          stream = processLink(links[targetIndex]);
        } else {
          stream = processLink(getPriorityLink(links));
        }
      }
    }

    if (!stream) {
      stream = url;
    }

    console.log("parseDetailResponse fetch\n" + stream);

    var $return = JSON.stringify({
      url: stream,
      mimeType: mimeType,
      isEmbed: isEmbed,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": BASEURL + "/",
        "Origin": BASEURL
      }
    });

    console.log("Return Parse:\n" + $return);
    return $return;

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

function extractAndDecryptM3u8(htmlString) {
  try {
    if (!htmlString || typeof htmlString !== "string") return "";
    var regex = /CryptoJSAesDecrypt\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*[`'"]?\s*(\{[\s\S]*?"ciphertext"[\s\S]*?\})\s*[`'"]?\s*\)/i;
    var match = htmlString.match(regex);
    if (!match) return "";

    var passphrase = match[1];
    var encryptedJsonStr = match[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    return CryptoJSAesDecrypt(passphrase, encryptedJsonStr);
  } catch (e) {
    console.error("Lỗi extractAndDecryptM3u8:", e);
    return "";
  }
}
  
function parseEmbedResponse(html, url) {
  console.log("parseEmbedResponse [url]: " + url);
  try {
    var stream = "";
    var mimeType = "application/x-mpegURL";
    var referer = BASEURL;

    // 1. Thử giải mã trực tiếp nếu trang chứa mã hóa CryptoJSAesDecrypt
    var decryptedUrl = extractAndDecryptM3u8(html);
    if (decryptedUrl && decryptedUrl.indexOf("http") === 0) {
      if (decryptedUrl.indexOf(".m3u8") > -1) {
        stream = decryptedUrl;
        mimeType = "application/x-mpegURL";
      } else if (decryptedUrl.indexOf("hash=") > -1) {
        var hashParam = getparam(decryptedUrl, "hash");
        var m3u8Url = hashParam ? BASE64.decode(hashParam) : "";
        if (m3u8Url && m3u8Url.indexOf("http") === 0) {
          stream = m3u8Url;
          mimeType = "application/x-mpegURL";
        } else {
          stream = decryptedUrl;
        }
      } else {
        stream = decryptedUrl;
      }
      console.log("👉 Đã giải mã link M3U8 trực tiếp:\n", stream);
    }
    // 2. Xử lý nguồn cdn.loadvid.com
    else if (url.indexOf("cdn.loadvid.com") > -1) {
      stream = url;
      mimeType = "application/x-mpegURL";
      referer = "https://cdn.loadvid.com";
    } 
    // 3. Xử lý nguồn k-20 (JSON stream)
    else if (url.indexOf("k-20") > -1) {
      var $data = typeof html === "string" ? JSON.parse(html) : html;
      if ($data && $data.streams && $data.streams.length > 0) {
        stream = $data.streams[0].url;
      }
      mimeType = "video/mp4";
    } 
    // Dự phòng cho các nguồn khác
    else {
      stream = url;
    }

    console.log("parseEmbedResponse fetch\n" + stream);

    var $return = JSON.stringify({
      url: stream,
      mimeType: mimeType,
      isEmbed: false,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": referer + "/",
        "Origin": referer
      }
    });

    console.log("Return Embed:\n" + $return);
    return $return;

  } catch (e) {
    console.log("[Lỗi parseEmbedResponse]", e);
    return JSON.stringify({ 
      url: "", 
      mimeType: "", 
      isEmbed: false, 
      headers: {}, 
      subtitles: [] 
    });
  }
}
} // parseDetailResponse, parseEmbedResponse
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======



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
  function log(msg) {console.log(msg);}
}
// ==== HIDEMENU ====

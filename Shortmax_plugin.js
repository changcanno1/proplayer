var BASEURL = "https://www.shorttv.live";
var BASEAPI = "http://vkey.vn/novahd/api";
var BASELINK = BASEURL;

// https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/phimchill.ico
function getManifest() {
  try{
    return JSON.stringify({
      "id": "shortmax",
      "name": "Nguồn Shortmax",
      "version": "1.1",
      "author": "Alokillgtv",
      "info": "Nguồn phim ngắn của shortmax",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/shortmax.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "layoutType": "HORIZONTAL",
      "type": "shortfilm",
      "subtitleCat": false,
      "debug": true,
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
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/novahd.png",
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
           {"slug": "/vi/dramas","title": "Phim Mới","type": "Grid"}
      ]);
  }
  
  // Hàm khởi tạo thẻ chủ đề
  function getLISTmenu() {
    try{
      return `[{
    "link": "/vi/genres/hi%E1%BB%87n-%C4%91%E1%BA%A1i-200052",
    "name": "Hiện đại"
  },
  {
    "link": "/vi/genres/c%E1%BB%95-%C4%91%E1%BA%A1i-200053",
    "name": "Cổ đại"
  },
  {
    "link": "/vi/genres/t%C6%B0%C6%A1ng-lai-200054",
    "name": "Tương lai"
  },
  {
    "link": "/vi/genres/em-b%C3%A9-d%E1%BB%85-th%C6%B0%C6%A1ng-200055",
    "name": "Em bé dễ thương"
  },
  {
    "link": "/vi/genres/t%C3%ACnh-y%C3%AAu-ng%C6%B0%E1%BB%A3c-200056",
    "name": "Tình yêu ngược"
  },
  {
    "link": "/vi/genres/c%C6%B0%E1%BB%9Bi-tr%C6%B0%E1%BB%9Bc-y%C3%AAu-sau-200057",
    "name": "Cưới trước yêu sau"
  },
  {
    "link": "/vi/genres/t%C3%ACnh-m%E1%BB%99t-%C4%91%C3%AAm-200058",
    "name": "Tình một đêm"
  },
  {
    "link": "/vi/genres/k%E1%BA%BFt-h%C3%B4n-th%E1%BA%BF-th%C3%A2n-200059",
    "name": "Kết hôn thế thân"
  },
  {
    "link": "/vi/genres/th%E1%BA%BF-th%C3%A2n-200060",
    "name": "Thế thân"
  },
  {
    "link": "/vi/genres/th%E1%BB%9Di-h%E1%BB%8Dc-sinh-200061",
    "name": "Thời học sinh"
  },
  {
    "link": "/vi/genres/b%C3%A1o-th%C3%B9-200062",
    "name": "Báo thù"
  },
  {
    "link": "/vi/genres/tr%E1%BB%8Dng-sinh-200063",
    "name": "Trọng sinh"
  },
  {
    "link": "/vi/genres/t%E1%BB%95ng-t%C3%A0i-200064",
    "name": "Tổng tài"
  },
  {
    "link": "/vi/genres/h%E1%BB%A3p-%C4%91%E1%BB%93ng-h%C3%B4n-nh%C3%A2n-200065",
    "name": "Hợp đồng hôn nhân"
  },
  {
    "link": "/vi/genres/t%E1%BB%AB-th%C3%B9-th%C3%A0nh-y%C3%AAu-200066",
    "name": "Từ thù thành yêu"
  },
  {
    "link": "/vi/genres/%C4%91a-t%C3%ACnh-200067",
    "name": "Đa tình"
  },
  {
    "link": "/vi/genres/thanh-xu%C3%A2n-200068",
    "name": "Thanh xuân"
  },
  {
    "link": "/vi/genres/vi%E1%BB%85n-t%C6%B0%E1%BB%9Fng-200070",
    "name": "Viễn tưởng"
  },
  {
    "link": "/vi/genres/ng%C6%B0%E1%BB%9Di-s%C3%B3i-200071",
    "name": "Người sói"
  },
  {
    "link": "/vi/genres/si%C3%AAu-n%C4%83ng-l%E1%BB%B1c-200073",
    "name": "Siêu năng lực"
  },
  {
    "link": "/vi/genres/k%C3%AC-b%C3%AD-200074",
    "name": "Kì bí"
  },
  {
    "link": "/vi/genres/huy%E1%BB%81n-huy%E1%BB%85n-200075",
    "name": "Huyền huyễn"
  },
  {
    "link": "/vi/genres/tu%E1%BB%95i-m%E1%BB%9Bi-l%E1%BB%9Bn-200076",
    "name": "Tuổi mới lớn"
  },
  {
    "link": "/vi/genres/gia-%C4%91%C3%ACnh-200077",
    "name": "Gia đình"
  },
  {
    "link": "/vi/genres/ngu%E1%BB%B5-trang-200079",
    "name": "Nguỵ trang"
  },
  {
    "link": "/vi/genres/x%C3%A3-h%E1%BB%99i-%C4%91en-200080",
    "name": "Xã hội đen"
  },
  {
    "link": "/vi/genres/c%C3%B4ng-s%E1%BB%9F-200081",
    "name": "Công sở"
  },
  {
    "link": "/vi/genres/h%C3%A0o-m%C3%B4n-200082",
    "name": "Hào môn"
  },
  {
    "link": "/vi/genres/kinh-d%E1%BB%8B-200083",
    "name": "Kinh dị"
  },
  {
    "link": "/vi/genres/gi%E1%BA%ADt-g%C3%A2n-200084",
    "name": "Giật gân"
  },
  {
    "link": "/vi/genres/n%E1%BB%AF-c%C6%B0%E1%BB%9Dng-200085",
    "name": "Nữ cường"
  },
  {
    "link": "/vi/genres/th%C3%B9ng-r%C3%A1c-c%E1%BA%A3m-x%C3%BAc-200086",
    "name": "Thùng rác cảm xúc"
  },
  {
    "link": "/vi/genres/h%C3%A0nh-%C4%91%E1%BB%99ng-200087",
    "name": "Hành động"
  },
  {
    "link": "/vi/genres/xuy%C3%AAn-kh%C3%B4ng-200088",
    "name": "Xuyên không"
  },
  {
    "link": "/vi/genres/l%C3%A3ng-m%E1%BA%A1n-200089",
    "name": "Lãng mạn"
  },
  {
    "link": "/vi/genres/tr%E1%BA%A3-th%C3%B9-200090",
    "name": "Trả thù"
  },
  {
    "link": "/vi/genres/t%C3%ACnh-%C4%91%E1%BA%AFng-cay-200091",
    "name": "Tình đắng cay"
  },
  {
    "link": "/vi/genres/t%E1%BA%A7ng-l%E1%BB%9Bp-th%E1%BA%A5p-200092",
    "name": "Tầng lớp thấp"
  },
  {
    "link": "/vi/genres/n%E1%BB%99i-tr%E1%BB%A3-200093",
    "name": "Nội trợ"
  },
  {
    "link": "/vi/genres/%E1%BB%9F-r%E1%BB%83-200094",
    "name": "Ở rể"
  },
  {
    "link": "/vi/genres/ho%C3%A0ng-t%E1%BB%AD-200095",
    "name": "Hoàng tử"
  },
  {
    "link": "/vi/genres/c%C3%B4ng-ch%C3%BAa-200096",
    "name": "Công chúa"
  },
  {
    "link": "/vi/genres/b%C3%A1c-s%C4%A9-200098",
    "name": "Bác sĩ"
  },
  {
    "link": "/vi/genres/b%E1%BA%A3o-v%E1%BB%87-200100",
    "name": "Bảo vệ"
  },
  {
    "link": "/vi/genres/thi%E1%BA%BFu-gia-200101",
    "name": "Thiếu gia"
  },
  {
    "link": "/vi/genres/thi%C3%AAn-kim-th%E1%BA%ADt-gi%E1%BA%A3-200102",
    "name": "Thiên kim thật giả"
  },
  {
    "link": "/vi/genres/c%C6%B0%E1%BB%9Bi-ch%E1%BB%9Bp-nho%C3%A1ng-200103",
    "name": "Cưới Chớp Nhoáng"
  },
  {
    "link": "/vi/genres/th%E1%BA%BF-gi%E1%BB%9Bi-h%C6%B0-c%E1%BA%A5u-200104",
    "name": "Thế giới hư cấu"
  },
  {
    "link": "/vi/genres/%C4%91o%C3%A0n-t%E1%BB%A5-200105",
    "name": "Đoàn tụ"
  },
  {
    "link": "/vi/genres/ng%C6%B0%E1%BB%9Di-th%E1%BB%ABa-k%E1%BA%BF-200106",
    "name": "Người thừa kế"
  },
  {
    "link": "/vi/genres/k%E1%BB%B9-n%C4%83ng-y-t%E1%BA%BF-200107",
    "name": "Kỹ năng y tế"
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
    var paramPage = "/";
    var charparam = false; // Flag bật/tắt ghép dấu (? hoặc &)
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
      var paramSearch = "/vi/search/";
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
          
          var resultUrl = BASELINK + paramSearch + charsearch + encodedKeyword;
  
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
// /top
//filtersJson = "{page:5}"
//getUrlList("/top", filtersJson)
//getUrlSearch("girl", filtersJson)
// ===== HÀM TẠO URL END ======

// ===== HÀM TẠO KHỐI LIST PHIM BEGIN ======
function parseListResponse(html, url) {
    try {
        var $doc = _$(html);
        var items = [];
        var classname = ".drama-card";
        var classtitle = ".card-title-layout";
        var check = $doc.find(classname).length;
        if(check == 0){
            classname = ".cards-list-card";
            check = $doc.find(classname).length;
            classtitle = ".cards-list-card-content-title"
            if(check == 0){
                classname = ".search-card";
                classtitle = ".search-card-title"
            }
        }
        console.log(classname)
        $doc.find(classname).each(function() {
            var id = this.find(".card-title-layout").attr("href");
            if (id.indexOf("http") == -1) {
                id = BASEURL + id;
            }
            var name = this.find(classtitle).text().trim();
            const regex = /^(?:\[(.*?)\]\s*)?(.*)$/i;
            const [, group1 = "", group2 = name] = name.match(regex) || [];
            var title = group2
            var poster = this.find("img").attr("src");
            var background = poster;
            var quality = group1;;

            var episode_current = "";
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
        //console.log("List item ["+$url+"]: \n" + JSON.stringify(items))
        var $return = JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 9999
            }
        });
        console.log("Return List:\n" + $return)
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
        var posterUrl = $doc.find('.main-content img').attr("src") || "";
        var backdropUrl = posterUrl;
        var title = $doc.find('h1').text() || "";
        var originName = title;
        var description = $doc.find(".description-clamp").text() || "";
        var director = "";
        var casts = "";
        var category = "";
        var duration = "";
        var maxEpi = $doc.find(".episodes-row a").length;
        var status = "Tập " + maxEpi;
        var episode_current = "";
        var year = "";
        var quality = "";
        var rating = "";
        var country = "";
        var lang = "";
        var extra = "";

        // Tách ID Video
        // Tách ID Video
        var match = url.match(/-(\d+)(?:-ep-\d+)?(?:[?#]|$)/);
        var idvideo = match ? match[1] : "";

        if (!idvideo) {
            throw new Error("Không thể trích xuất ID video từ URL: " + url);
        }


        var servers = [];
        for (var $h = 1; $h < 2; $h++) {
            var episodes = [];
            // Chú ý: dùng <= maxEpi để lấy đủ tập cuối cùng
            for (var $j = 1; $j <= maxEpi; $j++) {
                var streamApiUrl = url + "?idvideo=" + idvideo + "&ep=" + $j;
                var name = "Tập " + $j;
                var slug = "tap-" + $j;

                var mainUrl = streamApiUrl + "&sv=" + $h + "&eq=1";
                episodes.push({
                    id: mainUrl,
                    name: name,
                    slug: slug
                });
            }

            servers.push({
                name: "Server Chia Tập " + $h,
                episodes: episodes
            });
        }
        servers.push({
            name: "Server Full",
            episodes: [{
              name: "Gộp 1 Tập Full",
              id: url + "?idvideo=" + idvideo + "&ep=1&sv=1&eq=1&join=full",
              slug: "tap-full"       
            }]
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
            servers: servers || [],
            duration: duration || "",
            casts: casts || "",
            director: director || "",
            country: country || "",
            lang: lang || "",
            extra: extra || ""
        });
        //console.log("Return Movie:\n" + $return);
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

//var url = "https://novahd.cc/api/show/1413"
//var url = "http://vkey.vn/novahd/api/show/1413"
// https://novahd.cc/api/shows/1413
//var html = sourceHTML;
//JSON.parse(parseMovieDetail(sourceHTML, url))
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM END ======

// ===== HÀM TẠO XỬ LÝ STREAM PHIM BEGIN ======
{
 function parseDetailResponse(html, url) {
    log("parseDetailResponse [url]: " + url); 
    //log("parseEmbedResponse raw: " + html); 
  //console.log("parseEmbedResponse [Raw]: " + html);
    try {
    
    function getQueryParam(url, param) {
        var match = url.match(new RegExp("[?&]" + param + "=([^&]*)", "i"));
        return match ? decodeURIComponent(match[1]) : "";
    }

    var idvideo = getQueryParam(url, "idvideo"); // "41000102839"
    var ep = getQueryParam(url, "ep");           // "11"
    var sv = getQueryParam(url, "sv");           // "2"
    var eq = getQueryParam(url, "eq");           // "1"
    var join = "";
    var clear = "";
    if(url.indexOf("join=full") > -1){
      join = "&join=full"
    }
    if(url.indexOf("clear=true") > -1){
      clear = "&clear=true"
    }
      // https://cdn-netshort.dramafren.org/index.php?action=resolve_watch&id=2087124383822565377&ep=28&server=1&_=1787627634991&lang=vi
      var stream = "https://shortmax.alokillgtv.workers.dev/?id="+idvideo+"&ep="+ep+"&lang=vi&sv="+sv+"&eq=" + eq + "&server=server" + sv + join + clear;
        
      // Mimetype application/x-mpegURL video/mp4
      console.log("parseDetailResponse fetch\n" + stream);
  
      var $return = JSON.stringify({
        url: stream,
        isEmbed: true,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://shortmaxv3.dramafren.org",
          "Origin": "https://shortmaxv3.dramafren.org"        },
        subtitles: [{
          lang: "",
          url: ""
        }],      
      });
      console.log("Return Detail:\n" + $return)
      return $return
    } catch (e) {
      console.log("[Lỗi parseDetailResponse]", e);
      return JSON.stringify({ 
        url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
        mimeType: "video/mp4", 
        isEmbed: false, headers: {}, subtitles: [] 
      });
    }
  }
    
 function parseEmbedResponse(html, url) {
    console.log("parseEmbed dang xu ly: " + url);
    try {
        if(url.indexOf("join=full") > -1){
          console.log("nối tập\n" + html);
          var responseData = JSON.parse(html);
          if(responseData.status == "success"){
              var subtitles = []
              if(responseData.subtitle){
                subtitles = responseData.subtitle
              }
              return JSON.stringify({
                  url: responseData.url,
                  mimeType: "application/x-mpegURL",
                  isEmbed: false,
                  headers: {
                      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                      "Referer": BASEURL,
                      "Origin": BASEURL
                  },
                  subtitles: subtitles
              });
          }
          else{
            loivideo
          }
        }
        else{
          var responseData = JSON.parse(html);

          // Xử lý cấu trúc: worker bọc dữ liệu trong 'data'
          var serverPayload = responseData;
          if (responseData.data && responseData.data.server) {
              serverPayload = responseData.data; // lấy object gốc bên trong
          }
  
          var serverData = serverPayload.server || responseData.server || {};
          console.log("Server data type:", typeof serverData);
          console.log("Server data keys:", Object.keys(serverData));
  
          // Trích xuất tham số
          var epMatch = url.match(/[?&]ep=(\d+)/i);
          var eqMatch = url.match(/[?&]eq=(\d+)/i);
          var episodeNo = epMatch ? parseInt(epMatch[1], 10) : 1;
          var qualityIndex = eqMatch ? parseInt(eqMatch[1], 10) : 1;
          console.log(`EpisodeNo: ${episodeNo}, QualityIndex (eq): ${qualityIndex}`);
  
          function getMimeType(targetUrl) {
              if (!targetUrl) return "video/mp4";
              var cleanUrl = targetUrl.split("?")[0].toLowerCase();
              if (cleanUrl.endsWith(".m3u8")) return "application/x-mpegURL";
              if (cleanUrl.endsWith(".mpd")) return "application/dash+xml";
              if (cleanUrl.endsWith(".vtt")) return "text/vtt";
              if (cleanUrl.endsWith(".srt")) return "application/x-subrip";
              return "video/mp4";
          }
  
          function extractQuality(qualityObj) {
              if (!qualityObj) return "";
              return qualityObj.proxyUrl || qualityObj.proxyPlayUrl || qualityObj.url || qualityObj.playUrl || "";
          }
  
          // Lấy episode data
          var episodeVideos = (serverData.episodeVideos) || {};
          var episodeKey = String(episodeNo);
          var episodeData = episodeVideos[episodeKey];
          console.log(`Episode data for ${episodeKey}:`, episodeData ? "found" : "not found");
  
          // Lấy qualities
          var episodeQualities = [];
          if (episodeData && Array.isArray(episodeData.qualities) && episodeData.qualities.length > 0) {
              episodeQualities = episodeData.qualities.slice();
              console.log("Using episode qualities, count:", episodeQualities.length);
          } else if (serverData && Array.isArray(serverData.qualities) && serverData.qualities.length > 0) {
              episodeQualities = serverData.qualities.slice();
              console.log("Using server-level qualities, count:", episodeQualities.length);
          } else {
              console.log("No qualities found, will fallback to playUrl/proxyUrl");
          }
  
          // Sắp xếp theo độ phân giải giảm dần
          episodeQualities.sort(function(a, b) {
              var resA = parseInt((a.quality && a.quality.match(/(\d+)p/)) ? a.quality.match(/(\d+)p/)[1] : 0, 10);
              var resB = parseInt((b.quality && b.quality.match(/(\d+)p/)) ? b.quality.match(/(\d+)p/)[1] : 0, 10);
              return resB - resA;
          });
  
          var stream = "";
          if (episodeQualities.length > 0) {
              // eq=1 -> index 0 (cao nhất), eq=2 -> index 1, ...
              var targetIndex = Math.max(0, Math.min(qualityIndex - 1, episodeQualities.length - 1));
              var chosenQuality = episodeQualities[targetIndex];
              console.log(`Chosen quality at index ${targetIndex}:`, chosenQuality);
              stream = extractQuality(chosenQuality);
          }
  
          // Nếu không lấy được stream từ qualities, fallback
          if (!stream) {
              console.log("Fallback to episode-level or server-level URLs");
              stream = (episodeData && (episodeData.proxyUrl || episodeData.proxyPlayUrl || episodeData.playUrl)) ||
                       (serverData && (serverData.proxyUrl || serverData.proxyPlayUrl || serverData.playUrl)) ||
                       "";
          }
  
          if (!stream) {
              console.error("No stream URL found in response data");
              throw new Error("Không tìm thấy URL stream hợp lệ");
          }
  
          var mimeType = getMimeType(stream);
          // Nếu URL là proxy_video, chắc chắn là m3u8
          if (stream.indexOf("action=proxy_video") !== -1 || stream.indexOf(".m3u8") !== -1) {
              mimeType = "application/x-mpegURL";
          }
  
          // Lấy subtitles nếu có
          var subtitles = [];
          if (episodeData && Array.isArray(episodeData.subtitles) && episodeData.subtitles.length > 0) {
              subtitles = episodeData.subtitles.map(function(sub) {
                  var subUrl = sub.proxyUrl || sub.proxyPlayUrl || sub.fileUrl || sub.url || "";
                  return {
                      url: subUrl,
                      language: sub.label || sub.language || "",
                      mimeType: getMimeType(subUrl)
                  };
              }).filter(function(sub) { return sub.url; });
              console.log(`Found ${subtitles.length} subtitles for episode`);
          }
  
          var baseReferer = typeof BASEURL !== "undefined" ? BASEURL : "https://shortmaxv3.dramafren.org/";
        }
        

        return JSON.stringify({
            url: stream,
            mimeType: mimeType,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": baseReferer,
                "Origin": baseReferer
            },
            subtitles: subtitles
        });

    } catch (e) {
        console.log("parseEmbedResponse[err]:\n " + e);
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}
} // parseDetailResnse, parseEmbedResponse
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HÀM TẠO CUSTOMpo SCRIPT BEGIN ====
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
          fixedLine = fixedLine.replace(/\r/g, "").replace(/\t/g, "  "); // Thay Tab trần bằng 2 khoảng trắng cho an toàn
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
  function decodeHTMLtext(str) {
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

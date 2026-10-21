var iddomain = "cityphim"
BASEURL = "https://chill.phim.city/";
NEWDOMAIN = true;
var popup_html = "";
// https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/phimchill.ico
function getManifest() {
  try{
    return JSON.stringify({
      "id": "cityphim",
      "name": "City Phim [MOVIE]",
      "version": "1.0",
      "author": "Alokillgtv",
      "info": "Nguồn phim mới ra, cũng khá nhiều phim và servers dự phòng.",
      "baseUrl": BASEURL,
      "headers":{
          "X-VAX-YB": "deo_co_gi_de_coi"
      },
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/cityphim.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "type": "MOVIE",
      "subtitleCat": false,
      popup_html: popup_html,
      "debug": true,
      "playerType": "exoplayer"
    });
  }
  catch(e){
    // VERTICAL
    return JSON.stringify({
      "id": "loiapp",
      "name": "Plugin bị lỗi cài đặt",
      "version": "2.0",
      "info": "Plugin đang bị lỗi: \n" + e,
      "baseUrl": "http://vkey.vn/",
      "iconUrl": "https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/novahd.png",
      "isEnabled": true,
      "type": "MOVIE",
      "playerType": "exoplayer"
     });
  }
}
function getFlink(link){
    if(link && link.indexOf("http") == -1){
        return BASEURL + link
    }
    else{
        return link
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
BASELINK = BASEURL;
console.log("BASEURL " + BASEURL);

// ===== HÀM MENU LIST BEGIN ======

function getHomeSections() {

      return JSON.stringify([
          {"slug": "/top-imdb","title": "Top Đầu","type": "Horizontal"},
          {"slug": "/phim-le","title": "Phim Lẻ","type": "Horizontal"},
          {"slug": "/phim-bo","title": "Phim Bộ","type": "Horizontal"},
          {"slug": "/xu-huong","title": "Xu Hướng","type": "Horizontal"},
          {"slug": "/duyet-phim","title": "Phim Mới","type": "Grid"},
      ]);
  }

/*
var $doc = _$(html);
var list = []
$doc.find('.absolute:content("Vietsub") a').each(function(){
 var obj = {}
obj.link = this.attr("href")
obj.name = this.text()
list.push(obj)
})
JSON.stringify(list)
*/
  // Hàm khởi tạo thẻ chủ đề

function getLISTmenu() {
    try{
      return `[
  {"link": "/the-loai/hanh-dong", "name": "Hành Động"},
  {"link": "/the-loai/tinh-cam", "name": "Tình Cảm"},
  {"link": "/the-loai/hai-huoc", "name": "Hài Hước"},
  {"link": "/the-loai/co-trang", "name": "Cổ Trang"},
  {"link": "/the-loai/tam-ly", "name": "Tâm Lý"},
  {"link": "/the-loai/hinh-su", "name": "Hình Sự"},
  {"link": "/the-loai/chien-tranh", "name": "Chiến Tranh"},
  {"link": "/the-loai/the-thao", "name": "Thể Thao"},
  {"link": "/the-loai/vo-thuat", "name": "Võ Thuật"},
  {"link": "/the-loai/vien-tuong", "name": "Viễn Tưởng"},
  {"link": "/the-loai/phieu-luu", "name": "Phiêu Lưu"},
  {"link": "/the-loai/khoa-hoc", "name": "Khoa Học"},
  {"link": "/the-loai/kinh-di", "name": "Kinh Dị"},
  {"link": "/the-loai/am-nhac", "name": "Âm Nhạc"},
  {"link": "/the-loai/than-thoai", "name": "Thần Thoại"},
  {"link": "/the-loai/tai-lieu", "name": "Tài Liệu"},
  {"link": "/the-loai/gia-dinh", "name": "Gia Đình"},
  {"link": "/the-loai/chinh-kich", "name": "Chính kịch"},
  {"link": "/the-loai/bi-an", "name": "Bí ẩn"},
  {"link": "/the-loai/hoc-duong", "name": "Học Đường"},
  {"link": "/the-loai/kinh-dien", "name": "Kinh Điển"},
  {"link": "/the-loai/phim-18", "name": "Phim 18+"},
  {"link": "/the-loai/thuc-te", "name": "Thực tế"},
  {"link": "/the-loai/hoat-hinh", "name": "Hoạt Hình"},
  {"link": "/the-loai/anime", "name": "Anime"},
  {"link": "/the-loai/lgbt", "name": "LGBT"}
]`;
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
      var paramSearch = BASELINK + "/tim-kiem/";
      var charsearch = "?search="
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
          
           var resultUrl = paramSearch + encodedKeyword + charsearch + encodedKeyword + paramPage + page;
  
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          
          log("getUrlSearch[url]: \n" + finalUrl);
          return finalUrl;
  
      } catch (e) {
          log("getUrlSearch[err]:\n " + e);
          return BASEURL;
      }
  }

function parseListResponse(html, url) {
    try {    

            var totalPages = 9999;
            var $doc = _$(html);
            var items = [];
            $doc.find(".custom-container .grid .relative").each(function() {
                var id = this.find("a").attr("href");
                id = getFlink(id);
                var title = this.find("img").attr("alt");
                var poster = this.find("img").attr("src");
                poster = getFlink(poster);
                var background = poster;
                var quality = this.find("span:first").text();
                var episode_current = this.find(".pt-4 span:eq(3)").text()
                var year = "";
                var lang = this.find(".pt-4 span:eq(1)").text() + " - " + this.find(".pt-4 span:eq(0)").text().replace("Trọn bộ phút", "Full Bộ");
                if (title.length > 1 && id.indexOf("http") > -1) {
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
                "totalPages": totalPages
            }
        });
        //console.log("Return List:\n" + $return)
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
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM BEGIN ======
function parseMovieDetail(html, url) {
    log("parseMovieDetail[url]: \n" + url);
    try {
        var detailUrl = url.split("|")[0];
        var iframePageUrl = detailUrl;

        // Chuyển /phim-bo/ → /tap-phim/.../1-1
        if (detailUrl.indexOf('/phim-bo/') > -1) {
            var slug = detailUrl.split('/phim-bo/')[1];
            if (slug) {
                iframePageUrl = "https://chill.phim.city/tap-phim/" + slug + "/1-1";
            }
        }

        log("[parseMovieDetail] Fetching page for iframe: " + iframePageUrl);

        // ========== FETCH PAGE ==========
        var fetchRes = httpRequest(iframePageUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "X-VAX-YB": "deo_co_gi_de_coi"
            }
        });

        if (!fetchRes || !fetchRes.isSuccessful) {
            var status = fetchRes ? fetchRes.status : 0;
            var errMsg = (status === 404)
                ? "Phim này chưa có dữ liệu hoặc đã bị xóa khỏi hệ thống."
                : "Không thể kết nối tới server. Vui lòng thử lại sau. (HTTP " + status + ")";
            log("[parseMovieDetail] Fetch fail HTTP " + status);
            return JSON.stringify({
                id: detailUrl,
                title: (status === 404) ? "Phim chưa có dữ liệu" : "Lỗi kết nối",
                posterUrl: "",
                description: errMsg,
                servers: []
            });
        }

        var pageHtml = fetchRes.body;

        // ========== BÓC IFRAME 123EMBED ==========
        var iframeMatch = pageHtml.match(/<iframe[^>]+src="([^"]*play\.123embed\.net[^"]*)"/i) ||
                          pageHtml.match(/data-src="([^"]*play\.123embed\.net[^"]*)"/i);

        if (!iframeMatch || !iframeMatch[1]) {
            var fallbackMatch = pageHtml.match(/(https:\/\/play\.123embed\.net\/[^\s"']+)/i);
            if (fallbackMatch) {
                iframeMatch = [null, fallbackMatch[1]];
            } else {
                log("[parseMovieDetail] Không tìm thấy iframe 123embed");
                return JSON.stringify({
                    id: detailUrl,
                    title: "Không có nguồn phát",
                    posterUrl: "",
                    description: "Phim chưa có nguồn phát hoặc đang được cập nhật.",
                    servers: []
                });
            }
        }

        var embedUrl = iframeMatch[1];
        log("[parseMovieDetail] Found embed URL: " + embedUrl);

        // ========== TRÍCH TMDB ID + TYPE ==========
        var tmdbId = null;
        var mediaType = null;
        var seasonNumber = 1;

        var tvMatch = embedUrl.match(/\/tv\/(\d+)-S(\d+)\/(\d+)/i);
        if (tvMatch) {
            tmdbId = tvMatch[1];
            mediaType = "tv";
            seasonNumber = tvMatch[2];
        } else {
            var mvMatch = embedUrl.match(/\/mv\/(\d+)/i);
            if (mvMatch) {
                tmdbId = mvMatch[1];
                mediaType = "movie";
            }
        }

        if (!tmdbId || !mediaType) {
            log("[parseMovieDetail] Không trích được TMDB ID từ: " + embedUrl);
            return JSON.stringify({
                id: detailUrl,
                title: "Không đọc được nguồn phát",
                posterUrl: "",
                description: "Link phát phim không hợp lệ.",
                servers: []
            });
        }

        log("[parseMovieDetail] Extracted TMDB ID: " + tmdbId + ", Type: " + mediaType);

        // ========== GỌI WORKER MOVIEDB ==========
        var endpoint = (mediaType === "tv" ? "tv/" : "movie/") + tmdbId;
        var workerUrl = "https://moviedb.alokillgtv.workers.dev/api/themoviedb"
                      + "?endpoint=" + encodeURIComponent(endpoint)
                      + "&language=vi-VN";

        log("[parseMovieDetail] Calling worker: " + workerUrl);

        var workerRes = httpRequest(workerUrl, {
            headers: {
                "X-VAX-YB": "deo_co_gi_de_coi",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });

        if (!workerRes || !workerRes.isSuccessful) {
            log("[parseMovieDetail] Worker fail HTTP " + (workerRes ? workerRes.status : 0));
            // Vẫn trả server với 1 tập để user xem được
            return JSON.stringify({
                id: detailUrl,
                title: "Phim (không có metadata)",
                posterUrl: "",
                description: "Không lấy được thông tin chi tiết. Bấm Xem Ngay để phát.",
                servers: [{
                    name: "123Embed",
                    episodes: [{
                        id: embedUrl,
                        name: "Xem Ngay",
                        slug: "full"              
                    }]
                }]
            });
        }

        var movieData = JSON.parse(workerRes.body);
        log("[parseMovieDetail] Worker keys: " + Object.keys(movieData).join(","));
        log("[parseMovieDetail] seasons count: " + (movieData.seasons ? movieData.seasons.length : "undefined"));

        // ========== XÂY DỰNG KẾT QUẢ ==========
        var title = movieData.title || movieData.name || movieData.english_title || "Unknown";
        var posterUrl = movieData.poster_path
            ? ("https://image.tmdb.org/t/p/w500" + movieData.poster_path) : "";
        var backdropUrl = movieData.backdrop_path
            ? ("https://image.tmdb.org/t/p/w780" + movieData.backdrop_path) : posterUrl;
        var description = movieData.overview || "Đang cập nhật nội dung...";
        var year = (movieData.release_date || movieData.first_air_date || "").split('-')[0];
        var rating = movieData.vote_average ? movieData.vote_average.toFixed(1) : "";
        var duration = movieData.runtime ? (movieData.runtime + " phút") : "";

        var category = "";
        if (Array.isArray(movieData.genres)) {
            category = movieData.genres.map(function(g) { return g.name; }).join(", ");
        }

        var country = "";
        if (Array.isArray(movieData.production_countries)) {
            country = movieData.production_countries.map(function(c) { return c.name; }).join(", ");
        }

        // ========== SERVERS / EPISODES ==========
        var servers = [];

        if (mediaType === "tv") {
            var allEpisodes = [];

            // Ưu tiên mảng seasons chi tiết
            if (Array.isArray(movieData.seasons) && movieData.seasons.length > 0) {
                movieData.seasons.forEach(function(season) {
                    if (season.season_number === 0) return;
                    var seasonNum = season.season_number;
                    var episodeCount = season.episode_count || 0;
                    for (var ep = 1; ep <= episodeCount; ep++) {
                        allEpisodes.push({
                            id: "https://play.123embed.net/tv/" + tmdbId + "-S" + seasonNum + "/" + ep,
                            name: "[Mùa " + seasonNum + "] Tập " + ep,
                            slug: "s" + seasonNum + "e" + ep,
                            ids:[{
                                url: embedUrl + "?sv=1",
                                name: "Server 1"
                              },{
                                url: embedUrl + "?sv=2",
                                name: "Server 2"
                              },{
                                url: embedUrl + "?sv=3",
                                name: "Server 3"
                              },{
                                url: embedUrl + "?sv=4",
                                name: "Server 4"
                              },{
                                url: embedUrl + "?sv=5",
                                name: "Server 5"
                              },{
                                url: embedUrl + "?sv=6",
                                name: "Server 6"
                              },{
                                url: embedUrl + "?sv=7",
                                name: "Server 7"
                              },{
                                url: embedUrl + "?sv=8",
                                name: "Server 8"
                              },{
                                url: embedUrl + "?sv=9",
                                name: "Server 9"
                              },{
                                url: embedUrl + "?sv=10",
                                name: "Server 10"
                              }]
                        });
                    }
                });
            }

            // Fallback: gọi từng season endpoint nếu không có mảng seasons
            if (allEpisodes.length === 0 && movieData.number_of_seasons > 0) {
                for (var s = 1; s <= movieData.number_of_seasons; s++) {
                    var sUrl = "https://moviedb.alokillgtv.workers.dev/api/themoviedb"
                             + "?endpoint=" + encodeURIComponent("tv/" + tmdbId + "/season/" + s)
                             + "&language=vi-VN";
                    var sRes = httpRequest(sUrl, { headers: { "X-VAX-YB": "deo_co_gi_de_coi" } });
                    if (sRes && sRes.isSuccessful) {
                        try {
                            var sData = JSON.parse(sRes.body);
                            (sData.episodes || []).forEach(function(epObj) {
                                var epNum = epObj.episode_number;
                                if (!epNum) return;
                                allEpisodes.push({
                                    id: "https://play.123embed.net/tv/" + tmdbId + "-S" + s + "/" + epNum,
                                    name: "[Mùa " + s + "] Tập " + epNum,
                                    slug: "s" + s + "e" + epNum,
                                    ids:[{
                                      url: embedUrl + "?sv=1",
                                      name: "Server 1"
                                    },{
                                      url: embedUrl + "?sv=2",
                                      name: "Server 2"
                                    },{
                                      url: embedUrl + "?sv=3",
                                      name: "Server 3"
                                    },{
                                      url: embedUrl + "?sv=4",
                                      name: "Server 4"
                                    },{
                                      url: embedUrl + "?sv=5",
                                      name: "Server 5"
                                    },{
                                      url: embedUrl + "?sv=6",
                                      name: "Server 6"
                                    },{
                                      url: embedUrl + "?sv=7",
                                      name: "Server 7"
                                    },{
                                      url: embedUrl + "?sv=8",
                                      name: "Server 8"
                                    },{
                                      url: embedUrl + "?sv=9",
                                      name: "Server 9"
                                    },{
                                      url: embedUrl + "?sv=10",
                                      name: "Server 10"
                                    }]
                                });
                            });
                        } catch (ex) {
                            log("[parseMovieDetail] Parse season " + s + " fail: " + ex.message);
                        }
                    }
                }
            }

            // Fallback cuối: 1 tập
            if (allEpisodes.length === 0) {
                allEpisodes.push({
                    id: embedUrl,
                    name: "Tập 1" + "?sv=1",
                    slug: "tap-1",
                    ids:[{
                        url: embedUrl + "?sv=1",
                        name: "Server 1"
                      },{
                        url: embedUrl + "?sv=2",
                        name: "Server 2"
                      },{
                        url: embedUrl + "?sv=3",
                        name: "Server 3"
                      },{
                        url: embedUrl + "?sv=4",
                        name: "Server 4"
                      },{
                        url: embedUrl + "?sv=5",
                        name: "Server 5"
                      },{
                        url: embedUrl + "?sv=6",
                        name: "Server 6"
                      },{
                        url: embedUrl + "?sv=7",
                        name: "Server 7"
                      },{
                        url: embedUrl + "?sv=8",
                        name: "Server 8"
                      },{
                        url: embedUrl + "?sv=9",
                        name: "Server 9"
                      },{
                        url: embedUrl + "?sv=10",
                        name: "Server 10"
                      }]
                });
            }

            servers.push({ name: "123Embed", episodes: allEpisodes });

        } else {
            servers.push({
                name: "123Embed",
                episodes: [{
                    id: embedUrl + "?sv=1",
                    name: "Xem Ngay",
                    slug: "full",
                    ids:[{
                      url: embedUrl + "?sv=1",
                      name: "Server 1"
                    },{
                      url: embedUrl + "?sv=2",
                      name: "Server 2"
                    },{
                      url: embedUrl + "?sv=3",
                      name: "Server 3"
                    },{
                      url: embedUrl + "?sv=4",
                      name: "Server 4"
                    },{
                      url: embedUrl + "?sv=5",
                      name: "Server 5"
                    },{
                      url: embedUrl + "?sv=6",
                      name: "Server 6"
                    },{
                      url: embedUrl + "?sv=7",
                      name: "Server 7"
                    },{
                      url: embedUrl + "?sv=8",
                      name: "Server 8"
                    },{
                      url: embedUrl + "?sv=9",
                      name: "Server 9"
                    },{
                      url: embedUrl + "?sv=10",
                      name: "Server 10"
                    }]
                }]
            });
        }

        var result = {
            id: detailUrl,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: backdropUrl,
            description: description,
            year: year,
            rating: rating,
            duration: duration,
            category: category,
            country: country,
            episode_current: (mediaType === "tv") ? "Phim Bộ" : "Phim Lẻ",
            servers: servers
        };

        //log("[parseMovieDetail] Success. Servers: " + servers.length);
        return JSON.stringify(result);

    } catch (e) {
        log("[parseMovieDetail] ERROR: " + e.message);
        return JSON.stringify({
            id: url || "error",
            title: "Lỗi tải chi tiết",
            posterUrl: "",
            description: "Đã xảy ra lỗi khi tải thông tin phim.\n" + e.message,
            servers: []
        });
    }
}
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM END ======

function parseDetailResponse(html, url) {
    console.log("=== parseDetailResponse ===");
    console.log("URL: " + url);

    try {
        var $doc = _$(html);
        var cleanUrl = url.split("|")[0];

        // Detect TV vs Movie
        var isTV = /\/tv\/\d+-S\d+\/\d+/.test(cleanUrl);
        var endpointType = isTV ? "serie" : "movie";
        console.log("Detect: " + (isTV ? "TV (serie)" : "Movie"));

        // Quét server
        var serverList = [];
        $doc.find(".btn-sv").each(function(index) {
            var onjs = this.attr("onclick") || "";
            var match = onjs.match(/["']([^"']+)["']/g);
            if (match && match.length >= 2) {
                var id = match[0].replace(/["']+/g, "");
                var provider = match[1].replace(/["']+/g, "");
                var ajaxUrl = isTV
                    ? "https://play.123embed.net/ajax/serie/get_sources/" + id + "/1/" + provider
                    : "https://play.123embed.net/ajax/movie/get_sources/" + id + "/" + provider;
                serverList.push({
                    number: index + 1,
                    url: ajaxUrl,
                    provider: provider
                });
                console.log("  Server " + (index + 1) + " [" + provider + "]");
            }
        });

        if (serverList.length === 0) {
            console.log("Không có .btn-sv → fallback URL gốc");
            return JSON.stringify({
                url: cleanUrl, isEmbed: true, headers: {}
            });
        }

        // Ưu tiên server user chọn (?sv=), sau đó các server khác
        var sv = parseInt(getparam(url, "sv") || "1", 10);
        if (isNaN(sv) || sv < 1 || sv > serverList.length) sv = 1;

        var candidates = [serverList[sv - 1]];
        for (var i = 0; i < serverList.length; i++) {
            if (i !== sv - 1) candidates.push(serverList[i]);
        }

        // Headers đúng theo curl
        var reqHeaders = {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "vi-VN",
            "Referer": cleanUrl,
            "X-Requested-With": "XMLHttpRequest",
            "Origin": "https://play.123embed.net"
        };

        var streamfile = "", mime = "", subtitle = [], usedServer = null;

        // Loop thử từng server
        for (var ci = 0; ci < candidates.length; ci++) {
            var srv = candidates[ci];
            console.log("--- Thử #" + srv.number + " [" + srv.provider + "] ---");

            var res = httpRequest(srv.url, { headers: reqHeaders });

            if (!res) {
                console.log("  null response");
                continue;
            }
            console.log("  HTTP " + res.status + " | len=" + (res.body ? res.body.length : 0));

            if (!res.isSuccessful) {
                console.log("  body: " + (res.body || "").slice(0, 200));
                continue;
            }

            var body = (res.body || "").trim();
            if (body.charAt(0) !== "{") {
                console.log("  Không phải JSON: " + body.slice(0, 150));
                continue;
            }

            var data;
            try { data = JSON.parse(body); }
            catch (e) { console.log("  parse fail: " + e.message); continue; }

            var sources = data.sources, tracks = data.tracks;
            if (typeof sources === "string") { try { sources = JSON.parse(sources); } catch(e) { sources = []; } }
            if (typeof tracks === "string")  { try { tracks  = JSON.parse(tracks);  } catch(e) { tracks = []; } }

            if (!sources || !sources.length || !sources[0].file) {
                // ⭐ IN RA BODY ĐỂ XEM SERVER TRẢ VỀ GÌ
                console.log("  [Server " + srv.number + "] Không có source[0].file | body: " + body.slice(0, 500));
                continue;
            }

            streamfile = sources[0].file;
            mime = sources[0].type || "hls";
            if (mime.indexOf("mkv") > -1) mime = "video/x-matroska";
            else if (mime.indexOf("mp4") > -1) mime = "video/mp4";
            else mime = "application/x-mpegURL";

            console.log("  ✓ Stream: " + streamfile);
            console.log("  ✓ Mime: " + mime);

            // Subtitle
            subtitle = [];
            if (Array.isArray(tracks)) {
                tracks.forEach(function(item) {
                    var f = item.file || "";
                    if (!f) return;
                    var label = String(item.label || "").toLowerCase();
                    var isViet = /viet|việt|\bvi\b|vie/.test(label);
                    var isEng  = /english|\beng\b|\ben\b/.test(label);
                    if (!isViet && !isEng) return;
                    var sm = "text/vtt";
                    if (f.indexOf(".srt") > -1) sm = "application/x-subrip";
                    else if (f.indexOf(".ass") > -1 || f.indexOf(".ssa") > -1) sm = "text/x-ssa";
                    subtitle.push({
                        lang: isViet ? "Tiếng Việt" : "English",
                        url: f,
                        mimeType: sm
                    });
                });
                subtitle.sort(function(a, b) {
                    return (a.lang === "Tiếng Việt" ? 0 : 1) - (b.lang === "Tiếng Việt" ? 0 : 1);
                });
            }

            usedServer = srv;
            break;
        }

        // Kết quả
        if (streamfile) {
            console.log("=== OK | #" + usedServer.number + " [" + usedServer.provider + "] | subs=" + subtitle.length + " ===");
            return JSON.stringify({
                url: streamfile,
                mimeType: mime,
                isEmbed: false,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                    "Referer": "https://play.123embed.net/",
                    "Origin": "https://play.123embed.net"
                },
                subtitles: subtitle
            });
        }

        // Tất cả fail → fallback WebView
        console.log("!!! Tất cả fail → fallback WebView embed");
        return JSON.stringify({
            url: cleanUrl,
            isEmbed: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                "Referer": "https://play.123embed.net/",
                "Block-Ads": "true",
                "Block-Redirects": "true"
            }
        });

    } catch (e) {
        console.log("parseDetailResponse ERR: " + e.message);
        return JSON.stringify({
            url: "", mimeType: "", isEmbed: false,
            headers: {}, subtitles: [], error: e.message
        });
    }
}
function parseEmbedResponse(html, url) {
    console.log("=== parseEmbedResponse ===");
    console.log("URL: " + url);

    try {
        // html = body JSON trả về từ AJAX
        var data = (typeof html === "string") ? JSON.parse(html) : html;

        var sources = data.sources;
        var tracks = data.tracks;

        if (typeof sources === "string") { try { sources = JSON.parse(sources); } catch(e) { sources = []; } }
        if (typeof tracks === "string") { try { tracks = JSON.parse(tracks); } catch(e) { tracks = []; } }

        if (!sources || !sources.length || !sources[0].file) {
            console.log("Không có sources[0].file");
            return JSON.stringify({
                url: "", mimeType: "", isEmbed: false,
                headers: {}, subtitles: []
            });
        }

        var streamUrl = sources[0].file;
        var mime = sources[0].type || "hls";

        if (mime.indexOf("mkv") > -1) mime = "video/x-matroska";
        else if (mime.indexOf("mp4") > -1) mime = "video/mp4";
        else if (mime.indexOf("hls") > -1 || mime.indexOf("m3u8") > -1) mime = "application/x-mpegURL";
        else mime = "application/x-mpegURL";

        console.log("✓ Stream: " + streamUrl);
        console.log("✓ Mime: " + mime);

        // Subtitle
        var subs = [];
        if (Array.isArray(tracks)) {
            console.log("Có " + tracks.length + " tracks");
            tracks.forEach(function(item) {
                var f = item.file || "";
                if (!f) return;

                var label = String(item.label || "").toLowerCase();
                var isViet = /viet|việt|\bvi\b|vie/.test(label);
                var isEng  = /english|\beng\b|\ben\b/.test(label);
                if (!isViet && !isEng) return;

                var sm = "text/vtt";
                if (f.indexOf(".srt") > -1) sm = "application/x-subrip";
                else if (f.indexOf(".ass") > -1 || f.indexOf(".ssa") > -1) sm = "text/x-ssa";

                subs.push({
                    lang: isViet ? "Tiếng Việt" : "English",
                    url: f,
                    mimeType: sm
                });
            });

            subs.sort(function(a, b) {
                return (a.lang === "Tiếng Việt" ? 0 : 1) - (b.lang === "Tiếng Việt" ? 0 : 1);
            });
            console.log("Tổng sub: " + subs.length);
        }

        var result = JSON.stringify({
            url: streamUrl,
            mimeType: mime,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                "Referer": "https://play.123embed.net/",
                "Origin": "https://play.123embed.net"
            },
            subtitles: subs
        });

        console.log("Return:\n" + result);
        return result;

    } catch (e) {
        console.log("parseEmbedResponse ERR: " + e.message);
        return JSON.stringify({
            url: "", mimeType: "", isEmbed: false,
            headers: {}, subtitles: [], error: e.message
        });
    }
}


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
  
}

// ==== HIDEMENU ====

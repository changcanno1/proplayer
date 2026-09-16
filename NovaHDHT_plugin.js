var BASEURL = "https://moviedb.alokillgtv.workers.dev";
var BASEAPI = "https://vaxplayer.vercel.app";
var BASESV = "fluxtv";
var BASELINK = BASEURL;
function getManifest() {
  try{
    return JSON.stringify({
      "id": "4kmovie",
      "name": "[MOVIE] 4K Movie",
      "description": "Nguồn phim 4K Movie",
      "version": "2.2",
      "author": "Alokillgtv",
      "headers":{
          "X-VAX-YB": "deo_co_gi_de_coi"
      },
      "BASEURL": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/4kmovie.png",
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
  //           {"slug": "/api/themoviedb?endpoint=tv/top_rated&language=vi-VN","title": "TV SHOW Hot","type": "Horizontal"},
  //           {"slug": "/api/themoviedb?endpoint=trending/movie/day&language=vi-VN","title": "Phim Mới","type": "Grid"}
  function getHomeSections() {
      localStorage.clear();
      return JSON.stringify([
          {"slug": "/api/themoviedb?endpoint=movie/now_playing&language=vi-VN","title": "Phim Chiếu Rạp","type": "Horizontal"},
          {"slug": "/api/themoviedb?endpoint=tv/top_rated&language=vi-VN","title": "TV SHOW Hot","type": "Horizontal"},
          {"slug": "/api/themoviedb?endpoint=movie/top_rated&language=vi-VN","title": "Phim Lẻ Hot","type": "Horizontal"},
           {"slug": "/api/themoviedb?endpoint=trending/movie/day&language=vi-VN","title": "Phim Mới","type": "Grid"},
      ]);
  }
  
  // Hàm khởi tạo thẻ chủ đề
 function getLISTmenu() {
    try {
        return `[
            { "name": "Phim Thịnh Hành", "link": "/api/themoviedb?endpoint=trending/movie/day&language=vi-VN" },
            { "name": "Phim Đang Chiếu Rạp", "link": "/api/themoviedb?endpoint=movie/now_playing&language=vi-VN" },
            { "name": "Phim Lẻ Đánh Giá Cao", "link": "/api/themoviedb?endpoint=movie/top_rated&language=vi-VN" },
            { "name": "TV Show Thịnh Hành", "link": "/api/themoviedb?endpoint=trending/tv/day&language=vi-VN" },
            { "name": "TV Show Đang Phát Sóng", "link": "/api/themoviedb?endpoint=tv/on_the_air&language=vi-VN" },
            { "name": "TV Show Đánh Giá Cao", "link": "/api/themoviedb?endpoint=tv/top_rated&language=vi-VN" },
            { "name": "Phim Hành Động", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=28&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Phiêu Lưu", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=12&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Hoạt Hình", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=16&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Hài Hước", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=35&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Hình Sự", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=80&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Tài Liệu", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=99&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Chính Kịch", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=18&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Gia Đình", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=10751&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Cổ Trang / Khai Phá", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=36&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Kinh Dị", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=27&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Âm Nhạc", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=10402&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Bí Ẩn / Trinh Thám", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=9648&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Lãng Mạn", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=10749&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Viễn Tưởng (Sci-Fi)", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=878&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Giật Gân / Gián Điệp", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=53&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Chiến Tranh", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=10752&sort_by=popularity.desc&language=vi-VN" },
            { "name": "Phim Miền Tây (Western)", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=37&sort_by=popularity.desc&language=vi-VN" }
        ]`;
    } catch (e) {
        if (typeof log === "function") log("getLISTmenu[err]:\n " + e);
        return `[{"link":"/","name":"Đang lỗi getLISTmenu()"}]`;
    }
}



} // getHomeSections(), getLISTmenu()
// ===== HÀM MENU LIST END ======

// ===== HÀM TẠO URL BEGIN ======
{
function getUrlList(slug, filtersJson) {
    var paramPage = "&page=";
    try {
        log("getUrlList[url]: \n" + slug);
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

        // Kiểm tra xem đã có dấu ? hay chưa để nối &page= hoặc ?page=
        if (page > 0 && resultUrl.indexOf("page=") === -1) {
            var hasQuery = resultUrl.indexOf("?") > -1;
            resultUrl += (hasQuery ? "&page=" : "?page=") + page;
        }

        // CHỈ làm sạch // ở phần Domain, không đụng vào phần query string (?)
        var parts = resultUrl.split("?");
        parts[0] = parts[0].replace(/([^:]\/)\/+/g, "$1");
        var finalUrl = parts.join("?");

        return finalUrl;
    } catch (e) {
        log("getUrlList[err]:\n " + e);
        return BASEURL;
    }
}
  
  function getUrlSearch(keyword, filtersJson) {
      var paramSearch = "/api/themoviedb?endpoint=search/multi&language=vi-VN&query=";
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
          
          var resultUrl = BASELINK + paramSearch + encodedKeyword;
          if (page > 1) {
              resultUrl += paramPage + page;
          }
  
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
function parseListResponse(html, $url) {
    log("ListGetURL:\n" + $url);
    try {
        if (!html) {
            return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
        }

        var $data = (typeof html === 'object') ? html : JSON.parse(html);
        var items = [];

        var isTVList = false;
        if ($url && ($url.indexOf('endpoint=tv/') > -1 || $url.indexOf('endpoint=trending/tv') > -1 || $url.indexOf('discover/tv') > -1)) {
            isTVList = true;
        }

        var results = $data.results || $data.data || [];

        if (Array.isArray(results)) {
            results.forEach(function(item) {
                if (!item) return;

                var idvd = item.id + "&server="+BASESV+"&getsv=true";
                
                var isTV = isTVList || item.media_type === "tv" || item.first_air_date !== undefined || item.name !== undefined;
                var mediaType = isTV ? "tv" : "movie";

                // TMDB: Movie dùng 'title', TV Show dùng 'name'
                var title = item.name || item.title || item.original_name || item.original_title || ""; 
                
                var poster = item.poster_path ? ("https://image.tmdb.org/t/p/w500" + item.poster_path) : "";
                var background = item.backdrop_path ? ("https://image.tmdb.org/t/p/w780" + item.backdrop_path) : "";
                
                var releaseDate = item.first_air_date || item.release_date || "";
                var year = releaseDate ? releaseDate.split('-')[0] : "";
                var quality = year || "HD";
                var lang = item.original_language ? item.original_language.toUpperCase() : "";

                // ĐỂ PATH TƯƠNG ĐỐI (Không cộng BASELINK ở đây)
                var id = "/api/themoviedb?endpoint=" + mediaType + "/" + idvd + "&language=vi-VN";

                if (title && idvd) {
                    items.push({
                        "id": id,
                        "title": title,
                        "quality": quality,
                        "episode_current": isTV ? "Phim Bộ" : "Phim Lẻ",
                        "posterUrl": poster,
                        "backdropUrl": background,
                        "year": year,
                        "lang": lang
                    });
                }
            });
        }

        log("parseListResponse parsed count: " + items.length + " for " + $url);

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": $data.page || 1,
                "totalPages": $data.total_pages || 1
            }
        });
    } catch (e) {
        log("parseListResponse[err]:\n " + e + "\nURL: " + $url);
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}
// ===== HÀM TẠO KHỐI LIST PHIM END ======

// Bảng ánh xạ ID thể loại TMDB
var GENRE_MAP = {
  28: { name: "Hành Động", slug: "28" },
  12: { name: "Phiêu Lưu", slug: "12" },
  16: { name: "Hoạt Hình", slug: "16" },
  35: { name: "Hài Hước", slug: "35" },
  80: { name: "Hình Sự", slug: "80" },
  99: { name: "Tài Liệu", slug: "99" },
  18: { name: "Chính Kịch", slug: "18" },
  10751: { name: "Gia Đình", slug: "10751" },
  14: { name: "Phép Thuật / Kỳ Bào", slug: "14" },
  36: { name: "Lịch Sử", slug: "36" },
  27: { name: "Kinh Dị", slug: "27" },
  10402: { name: "Âm Nhạc", slug: "10402" },
  9648: { name: "Bí Ẩn / Trinh Thám", slug: "9648" },
  10749: { name: "Lãng Mạn", slug: "10749" },
  878: { name: "Viễn Tưởng", slug: "878" },
  10770: { name: "Phim Truyền Hình", slug: "10770" },
  53: { name: "Giật Gân", slug: "53" },
  10752: { name: "Chiến Tranh", slug: "10752" },
  37: { name: "Miền Tây", slug: "37" },
  // Thể loại dành riêng cho TV Show
  10759: { name: "Hành Động & Phiêu Lưu", slug: "10759" },
  10762: { name: "Trẻ Em", slug: "10762" },
  10763: { name: "Tin Tức", slug: "10763" },
  10764: { name: "Thực Tế", slug: "10764" },
  10765: { name: "Viễn Tưởng & Thần Thoại", slug: "10765" },
  10766: { name: "Phim Truyền Kỳ (Soap)", slug: "10766" },
  10767: { name: "Trò Truyện", slug: "10767" },
  10768: { name: "Chính Trị & Chiến Tranh", slug: "10768" }
};

/**
 * Chuyển mảng genre IDs thành chuỗi Markdown [tên](url)
 * @param {Array<number>} ids - Mảng chứa các ID thể loại
 * @param {string} baseUrl - Đường dẫn API gốc (mặc định trỏ về vercel endpoint)
 * @returns {string} Chuỗi danh sách thể loại phân cách bằng dấu phẩy
 */
function getGenres(ids = [], baseUrl = '/api/themoviedb?endpoint=discover/movie&with_genres=') {
  if (!Array.isArray(ids)) return '';

  return ids
    .map(id => {
      const genre = GENRE_MAP[id];
      if (!genre) return null;
      
      const url = `${baseUrl}${genre.slug}&sort_by=popularity.desc&language=vi-VN`;
      return `[${genre.name}](${url})`;
    })
    .filter(Boolean)
    .join(', ');
}

// --- VÍ DỤ SỬ DỤNG ---
//const input = [28, 80, 18, 53];
//const result = getGenres(input);

//console.log(result);



// ===== HÀM TẠO KHỐI CHI TIẾT PHIM BEGIN ======
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM BEGIN ======
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM BEGIN ======
function parseMovieDetail(html, url) {
    log("============================================");
    log("[parseMovieDetail] START - URL: " + (url || "EMPTY"));
    try {        
        var errorServers = [{
            name: "Đã có lỗi xảy ra",
            episodes: [{
                id: "",
                name: "Phim chưa chiếu hoặc tập phim đã bị lỗi.",
                slug: ""
            }]
        }];

        // =========================================================
        // KIỂM TRA LƯỢT EXTRA: NHẬN BIẾT BẰNG URL TỪ WORKER / FREAKYNIKI / ID
        // =========================================================
        var isExtraStep = url && (
            url.indexOf("fetchvideo.alokillgtv.workers.dev") > -1 || 
            url.indexOf("freakyniki") > -1 || 
            url.indexOf("id=") > -1 || 
            url.indexOf("tmdb_id=") > -1
        );

        if (isExtraStep) {
            log("[parseMovieDetail] Executing EXTRA flow...");
            
            var $data = null;
            try {
                $data = (typeof html === "object") ? html : JSON.parse(html);
            } catch (errJson) {
                log("[parseMovieDetail] EXTRA ERR: JSON Parse Failed -> Returning ERROR SERVERS");
            }

            // Bóc tách mảng stream từ response mới
            var rawStreams = ($data && Array.isArray($data.data)) ? $data.data : (($data && Array.isArray($data.streams)) ? $data.streams : null);
            
            var tmdbIdMatch = url.match(/[?&](?:id|tmdb|tmdb_id)=(\d+)/i);
            var tmdbId = tmdbIdMatch ? tmdbIdMatch[1] : "";

            var imdbMatch = url.match(/[?&]imdb_id=([^&]+)/i);
            var rawImdbFromUrl = imdbMatch ? decodeURIComponent(imdbMatch[1]) : "";

            var ttIdMatch = url.match(/[?&]ttid=([^&]+)/i);
            var rawTtFromUrl = ttIdMatch ? decodeURIComponent(ttIdMatch[1]) : "";

            // Định dạng chuẩn ttid (thêm 'tt' nếu chưa có)
            var finalImdbId = rawImdbFromUrl ? (rawImdbFromUrl.indexOf("tt") === 0 ? rawImdbFromUrl : "tt" + rawImdbFromUrl) : "";
            var finalTtId = rawTtFromUrl ? (rawTtFromUrl.indexOf("tt") === 0 ? rawTtFromUrl : "tt" + rawTtFromUrl) : finalImdbId;

            var titleMatch = url.match(/[?&]title=([^&]+)/i);
            var movieTitle = $data.english_title;

            var isTV = url.indexOf("type=tv") > -1 || url.indexOf("seasons_data=") > -1 || url.indexOf("season=") > -1;

            var finalServers = [];

            // KIỂM TRA NẾU SERVER KHÔNG CÓ STREAMS / LỖI DỮ LIỆU
            if (!rawStreams || rawStreams.length === 0) {
                log("[parseMovieDetail] EXTRA RESULT: NO STREAMS / EMPTY -> Returning ERROR SERVERS");
                finalServers = errorServers;
            } else {
                log("[parseMovieDetail] EXTRA RESULT: STREAMS VALID (" + rawStreams.length + " streams)");

                // =========================================================
                // PHÂN LOẠI STREAM: VIDNEST (ĐẦU) -> THƯỜNG (GIỮA) -> HDGHAR (CUỐI)
                // =========================================================
                var vidnestStreams = [];
                var normalStreams = [];
                var hdgharStreams = [];

                rawStreams.forEach(function(stream) {
                    var provider = String(stream.provider || "").toLowerCase();
                    if (provider.indexOf("vidnest") > -1) {
                        vidnestStreams.push(stream);
                    } else if (provider.indexOf("hdghar") > -1) {
                        stream.provider = "Server Tiếng Ấn";
                        hdgharStreams.push(stream);
                    } else {
                        normalStreams.push(stream);
                    }
                });

                // Hàm sắp xếp ưu tiên: MP4 > HLS, 4K > 1080P > 720P
                var sortFn = function(a, b) {
                    var getFormatScore = function(item) {
                        var mime = String(item.mimeType || "").toLowerCase();
                        var urlStr = String(item.streamUrl || item.url || "").toLowerCase();
                        if (mime.indexOf("mp4") > -1 || urlStr.indexOf(".mp4") > -1) return 2;
                        return 1;
                    };

                    var getQualityScore = function(item) {
                        var q = (String(item.quality || "") + " " + String(item.provider || "")).toLowerCase();
                        if (q.indexOf("4k") > -1 || q.indexOf("2160") > -1) return 4;
                        if (q.indexOf("1080") > -1) return 3;
                        if (q.indexOf("720") > -1) return 2;
                        if (q.indexOf("480") > -1 || q.indexOf("360") > -1) return 1;
                        return 0;
                    };

                    var formatDiff = getFormatScore(b) - getFormatScore(a);
                    if (formatDiff !== 0) return formatDiff;

                    return getQualityScore(b) - getQualityScore(a);
                };

                // Sắp xếp riêng từng nhóm
                vidnestStreams.sort(sortFn);
                normalStreams.sort(sortFn);
                hdgharStreams.sort(sortFn);

                // Ghép mảng theo thứ tự: VidNest -> Thường -> HDGhar (Ấn)
                rawStreams = vidnestStreams.concat(normalStreams).concat(hdgharStreams);

                if (isTV) {
                    // -----------------------------------------------------
                    // PHIM BỘ (TV SHOW): TẠO CỐ ĐỊNH 10 TAB SERVER (TỪ SERVER 1 ĐẾN 10)
                    // -----------------------------------------------------
                    var seasonsDataMatch = url.match(/seasons_data=([^&]+)/);
                    var seasonsStr = seasonsDataMatch ? decodeURIComponent(seasonsDataMatch[1]) : "";
                    
                    var baseEpisodes = [];
                    if (seasonsStr) {
                        var seasonPairs = seasonsStr.split(',');
                        seasonPairs.forEach(function(pair) {
                            var parts = pair.split(':');
                            var sNum = parseInt(parts[0], 10);
                            var epCount = parseInt(parts[1], 10);

                            for (var ep = 1; ep <= epCount; ep++) {
                                baseEpisodes.push({
                                    season: sNum,
                                    episode: ep,
                                    name: "[Mùa " + sNum + "] Tập " + ep,
                                    slug: "mua-" + sNum + "-tap-" + ep
                                });
                            }
                        });
                    }

                    if (baseEpisodes.length === 0) {
                        baseEpisodes.push({ season: 1, episode: 1, name: "[Mùa] 1 Tập 1", slug: "mua-1-tap-1" });
                    }

                    // Đánh dấu đủ 10 Server
                    for (var srvNum = 1; srvNum <= 1; srvNum++) {
                        var targetStreamIdx = (srvNum - 1) % rawStreams.length;
                        var matchedStream = rawStreams[targetStreamIdx];

                        var providerName = matchedStream.provider ? String(matchedStream.provider) : "";
                        var noteStr = "";
                        if (providerName === "Server Tiếng Ấn") {
                            noteStr = " (Tiếng Ấn)";
                        } else if (providerName.toLowerCase().indexOf("vidnest") > -1) {
                            noteStr = " (VidNest)";
                        }

                        var serverName = "Server " + srvNum + noteStr;

                        var serverEpisodes = baseEpisodes.map(function(ep) {
                            var realServerParam = targetStreamIdx + 1;
                            var epUrl = "https://pengu.alokillgtv.workers.dev/?type=tv&id=" + tmdbId +
                                        (finalImdbId ? ("&imdb_id=" + encodeURIComponent(finalImdbId)) : "") +
                                        (finalTtId ? ("&ttid=" + encodeURIComponent(finalTtId)) : "") +
                                        "&title=" + encodeURIComponent(movieTitle) +
                                        "&season=" + ep.season + "&episode=" + ep.episode
                                    
                            return {
                                id: epUrl + "&server=1",
                                name: ep.name,
                                slug: ep.slug,
                                ids: [{
                                  url: epUrl + "&server=1",
                                  name: "Server 1"
                                },{
                                  url: epUrl + "&server=2",
                                  name: "Server 2"
                                },{
                                  url: epUrl + "&server=3",
                                  name: "Server 3"
                                },{
                                  url: epUrl + "&server=4",
                                  name: "Server 4"
                                },{
                                  url: epUrl + "&server=5",
                                  name: "Server 5"
                                }]
                            };
                        }); 
                    }

                    finalServers.push({
                       name: "Server",
                       episodes: serverEpisodes
                   });
                } else {
                    // -----------------------------------------------------
                    // PHIM LẺ (MOVIE): 1 TAB SERVER CHỨA CÁC STREAM LÀM NÚT TẬP
                    // -----------------------------------------------------
                    var linkfetch = "https://pengu.alokillgtv.workers.dev/?type=movie&id=" + tmdbId +
                                    (finalImdbId ? ("&imdb_id=" + encodeURIComponent(finalImdbId)) : "") +
                                    (finalTtId ? ("&ttid=" + encodeURIComponent(finalTtId)) : "") +
                                    "&title=" + encodeURIComponent(movieTitle)
                    var movieEpisodes = rawStreams.map(function(stream, idx) {
                        var srvNum = idx + 1;
                        var providerStr = stream.provider ? String(stream.provider) : ("SERVER " + srvNum);
                        var qualityStr = stream.quality ? "[" + stream.quality + "]" : "";
                        var epName = providerStr + (qualityStr ? " " + qualityStr : "");

                        var epUrl = linkfetch + "&server=" + srvNum;

                        return {
                            id: epUrl,
                            name: epName,
                            slug: "server-" + srvNum
                        };
                    });
                    movieEpisodes.push({
                      id: linkfetch + "&server=1&cache=false",
                      name: "Làm Mới Link Stream",
                      slug: "server-new"
                    })
                    finalServers.push({
                        name: "Server",
                        episodes: movieEpisodes
                    });
                }
            }

            return JSON.stringify({
                id: url || tmdbId || "extra",
                title: ($data && $data.title) ? $data.title : (movieTitle || "Chi tiết phim"),
                posterUrl: ($data && $data.poster_path) ? ("https://image.tmdb.org/t/p/w500" + $data.poster_path) : "",
                backdropUrl: "",
                description: ($data && $data.overview) ? $data.overview : "",
                servers: finalServers,
                extra: ""
            });
        }

        // =========================================================
        // LƯỢT 1: PARSE DỮ LIỆU TỪ DỮ LIỆU PHIM CHI TIẾT
        // =========================================================
        log("[parseMovieDetail] Executing FIRST flow (Detail Response)...");
        var $data = JSON.parse(html);
        if (!$data) throw new Error("Empty JSON response from Detail API");

        var id = url || "";
        var title = $data.title || $data.name || $data.original_title || $data.original_name || "";
        var description = $data.overview || "Đang cập nhật nội dung...";
        
        var posterUrl = $data.poster_path ? ("https://image.tmdb.org/t/p/w500" + $data.poster_path) : "";
        var backdropUrl = $data.backdrop_path ? ("https://image.tmdb.org/t/p/w780" + $data.backdrop_path) : "";
        
        var releaseDate = $data.release_date || $data.first_air_date || "";
        var year = releaseDate ? releaseDate.split('-')[0] : "";
        var duration = $data.runtime ? ($data.runtime + " phút") : ($data.episode_run_time && $data.episode_run_time.length > 0 ? $data.episode_run_time[0] + " phút/tập" : "");
        
        var rating = $data.vote_average ? $data.vote_average.toFixed(1) : "0.0";
        var status = $data.status || "Hoàn thành";
        var quality = "HD";

        var isTV = (url && url.indexOf("endpoint=tv/") > -1) || $data.first_air_date !== undefined || $data.number_of_episodes !== undefined;
        var episode_current = isTV ? ($data.number_of_episodes ? ($data.number_of_episodes + " Tập") : "Phim Bộ") : "Phim Lẻ";

        // Thể loại (Genres)
        var category = "";
        if ($data.genres && Array.isArray($data.genres)) {
            category = $data.genres.map(function(g) {
                var searchEndpoint = isTV ? "discover/tv" : "discover/movie";
                return "[" + g.name + "](/api/themoviedb?endpoint=" + searchEndpoint + "&with_genres=" + g.id + "&sort_by=popularity.desc&language=vi-VN)";
            }).join(", ");
        }

        // Quốc gia
        var country = "";
        if ($data.production_countries && Array.isArray($data.production_countries)) {
            country = $data.production_countries.map(function(c) { return c.name; }).join(", ");
        }

        // Đạo diễn & Diễn viên
        var director = "";
        var casts = "";
        if ($data.credits) {
            if ($data.credits.crew) {
                var directors = $data.credits.crew.filter(function(person) { return person.job === "Director"; });
                director = directors.map(function(d) { return d.name; }).join(", ");
            }
            if ($data.credits.cast) {
                casts = $data.credits.cast.slice(0, 5).map(function(c) { return c.name; }).join(", ");
            }
        }

        var tmdbId = $data.id || "";

        // Trích xuất IMDb / TT ID gốc từ dữ liệu
        var rawImdb = $data.imdb_id || ($data.external_ids ? $data.external_ids.imdb_id : "") || $data.ttid || $data.tt_id || "";
        
        // Chuẩn hóa tự động: Nếu có chuỗi ID mà chưa chứa "tt" ở đầu thì tự gắn thêm "tt"
        var formattedTtId = "";
        if (rawImdb) {
            var cleanStr = String(rawImdb).trim();
            formattedTtId = cleanStr.indexOf("tt") === 0 ? cleanStr : ("tt" + cleanStr);
        }

        var extraUrl = "";

        if (tmdbId) {
            var typeParam = isTV ? "tv" : "movie";
            var baseWorkerUrl = "https://pengu.alokillgtv.workers.dev/?type=" + typeParam +
                                "&id=" + tmdbId +
                                (formattedTtId ? ("&imdb_id=" + encodeURIComponent(formattedTtId)) : "") +
                                (formattedTtId ? ("&ttid=" + encodeURIComponent(formattedTtId)) : "") +
                                "&title=" + encodeURIComponent(title);

            if (isTV && $data.seasons && Array.isArray($data.seasons)) {
                var seasonsList = [];
                $data.seasons.forEach(function(item) {
                    var seasonNum = item.season_number !== undefined ? item.season_number : item.seasonNumber;
                    if (seasonNum === 0) return;

                    var totalEpisodes = item.episode_count || (item.episodes ? item.episodes.length : 0);
                    if (totalEpisodes > 0) {
                        seasonsList.push(seasonNum + ":" + totalEpisodes);
                    }
                });

                var seasonsDataStr = seasonsList.join(',');
                extraUrl = baseWorkerUrl + "&season=1&episode=1&seasons_data=" + encodeURIComponent(seasonsDataStr);
            } else {
                extraUrl = baseWorkerUrl;
            }
        }

        var moviedata = JSON.stringify({
            id: id,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: backdropUrl,
            description: description,
            quality: quality,
            year: year,
            rating: rating,
            status: status,
            category: category,
            episode_current: episode_current,
            servers: [], 
            duration: duration,
            casts: casts,
            director: director,
            country: country,
            extra: extraUrl
        });

        log("[parseMovieDetail] FIRST FLOW DONE - Extra URL: " + extraUrl);
        return moviedata;

    } catch (e) {
        log("[parseMovieDetail] ERR: " + e);
        return JSON.stringify({
            id: url || "error",
            title: "Lỗi tải chi tiết",
            posterUrl: "",
            description: (url || "extra") + "\n" + e,
            servers: errorServers,
            extra: ""
        });
    }
}


// ===== HÀM BÓC TÁCH THAM SỐ URL =====
function getParam(url) {
    var params = {
        type: "",
        id: "",
        imdb_id: "",
        ttid: "",
        title: "",
        season: "",
        episode: "",
        server: ""
    };

    if (!url || typeof url !== "string") return params;

    var queryString = url.indexOf("?") > -1 ? url.split("?")[1] : url;
    var pairs = queryString.split("&");

    pairs.forEach(function(pair) {
        if (!pair) return;

        var match = pair.match(/^([^=]+)=(.*)$/);
        if (match) {
            var key = match[1].trim();
            var rawValue = match[2].trim();

            var value = "";
            try {
                value = decodeURIComponent(rawValue);
            } catch (e) {
                value = rawValue;
            }

            if (params.hasOwnProperty(key)) {
                params[key] = value;
            }
        }
    });

    return params;
}

// ===== HÀM TẠO XỬ LÝ STREAM PHIM =====
function parseDetailResponse(html, url) {
  try {
    console.log("parseDetailResponse đang xử lý: " + url);
    if (!html) {
      throw new Error("Dữ liệu html rỗng hoặc không hợp lệ");
    }

    var $data = (typeof html === "object") ? html : JSON.parse(html);
    var streams = ($data && Array.isArray($data.data)) ? $data.data : (($data && Array.isArray($data.streams)) ? $data.streams : []);

    if (!Array.isArray(streams) || streams.length === 0) {
      throw new Error("Không tìm thấy bất kỳ stream nào trong dữ liệu Server");
    }
    
    // Tự động đồng bộ lại thứ tự ưu tiên stream (MP4 > HLS, 4K > 1080 > 720)
    streams.sort(function(a, b) {
        var getFormatScore = function(item) {
            var mime = String(item.mimeType || "").toLowerCase();
            var urlStr = String(item.streamUrl || item.url || "").toLowerCase();
            if (mime.indexOf("mp4") > -1 || urlStr.indexOf(".mp4") > -1) return 2;
            return 1;
        };

        var getQualityScore = function(item) {
            var q = (String(item.quality || "") + " " + String(item.provider || "")).toLowerCase();
            if (q.indexOf("4k") > -1 || q.indexOf("2160") > -1) return 4;
            if (q.indexOf("1080") > -1) return 3;
            if (q.indexOf("720") > -1) return 2;
            if (q.indexOf("480") > -1 || q.indexOf("360") > -1) return 1;
            return 0;
        };

        var formatDiff = getFormatScore(b) - getFormatScore(a);
        if (formatDiff !== 0) return formatDiff;

        return getQualityScore(b) - getQualityScore(a);
    });

    // 1. Trích xuất tham số server (1-based)
    var serverMatch = url.match(/[?&]server=(\d+)/i);
    var requestedServerIdx = serverMatch ? (parseInt(serverMatch[1], 10) - 1) : 0;
    
    var serverIdx = requestedServerIdx % streams.length;
    if (serverIdx < 0) serverIdx = 0;

    // 2. Trích xuất tham số thông tin phim bằng getParam
    var objparam = getParam(url);
    var tmdbMatch = url.match(/[?&](?:id|tmdb|tmdb_id)=(\d+)/i);
    
    var tmdbId = objparam.id || (tmdbMatch ? tmdbMatch[1] : "");
    var season = objparam.season || "";
    var episode = objparam.episode || "";

    var isTV = (season !== "" && episode !== "") || (objparam.type === "tv") || (url.indexOf("type=tv") > -1) || (url.indexOf("seasons_data=") > -1);

    // 3. TỰ ĐỘNG CHUYỂN SERVER KHI RELOAD 2 LẦN TRONG 60 GIÂY (CHỈ ÁP DỤNG TVSHOW)
    var effectiveServerIdx = serverIdx;
    if (isTV && tmdbId) {
      try {
        var trackKey = "reload_track_" + tmdbId + "_s" + season + "_e" + episode;
        var now = Date.now();
        var trackData = null;

        if (typeof localStorage !== "undefined") {
          trackData = JSON.parse(localStorage.getItem(trackKey) || "null");
        } else if (typeof globalThis !== "undefined" && globalThis._reloadTrack) {
          trackData = globalThis._reloadTrack[trackKey];
        }

        if (!trackData || (now - trackData.time > 60000)) {
          trackData = { time: now, count: 1 };
        } else {
          trackData.count += 1;
          trackData.time = now;
        }

        if (trackData.count >= 2) {
          var shift = Math.floor(trackData.count / 2);
          effectiveServerIdx = (serverIdx + shift) % streams.length;
          console.log("▶ Tự động chuyển server từ " + (serverIdx + 1) + " sang " + (effectiveServerIdx + 1) + " do reload " + trackData.count + " lần trong 60s.");
        }

        if (typeof localStorage !== "undefined") {
          localStorage.setItem(trackKey, JSON.stringify(trackData));
        } else if (typeof globalThis !== "undefined") {
          globalThis._reloadTrack = globalThis._reloadTrack || {};
          globalThis._reloadTrack[trackKey] = trackData;
        }
      } catch (eTrack) {
        console.log("Lỗi theo dõi reload: " + eTrack);
      }
    }

    var selectedStream = streams[effectiveServerIdx] || streams[0];
    var rawStreamUrl = selectedStream.streamUrl || selectedStream.url || "";
    var rawMimeType = selectedStream.mimeType || "application/x-mpegURL";
    var rawFormat = selectedStream.provider || selectedStream.quality || selectedStream.format || "HLS";

    // =====================================================================
    // ★ SOI CONTENT ĐỂ XÁC ĐỊNH MIME CHÍNH XÁC ★
    // =====================================================================
    var _content = String(selectedStream.content || "").replace(/^\uFEFF/, "").trim();
    if (_content.length > 0) {
      var _head = _content.slice(0, 512);
      if (/^#EXTM3U/i.test(_head) || /#EXT-X-/i.test(_head)) {
        rawMimeType = "application/x-mpegURL";
      } else if (/<MPD[\s>]/i.test(_content.slice(0, 4096))) {
        rawMimeType = "application/dash+xml";
      } else if (/^<!doctype\s+html/i.test(_head) || /^<html[\s>]/i.test(_head)) {
        rawMimeType = "text/html";
      } else if (_content.indexOf("ftyp") > -1 && _content.indexOf("ftyp") < 64) {
        rawMimeType = "video/mp4";
      } else if (/matroska/i.test(_content.slice(0, 2048))) {
        rawMimeType = "video/x-matroska";
      } else if (/webm/i.test(_content.slice(0, 2048))) {
        rawMimeType = "video/webm";
      }
      console.log("▶ Mime detect từ content: " + rawMimeType + " | Mime gốc server: " + (selectedStream.mimeType || "N/A"));
    }
    // =====================================================================

    if (!rawStreamUrl) {
      throw new Error("Stream được chọn không có URL hợp lệ");
    }

    // 4. Bóc tách headers kèm theo
    var customHeaders = {
      "User-Agent": selectedStream.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };
    if (selectedStream.referer) customHeaders["Referer"] = selectedStream.referer;
    if (selectedStream.origin) customHeaders["Origin"] = selectedStream.origin;

    // 5. Đóng gói payload chứa stream & headers, sau đó Encode BASE64
    var payload = {
      url: rawStreamUrl,
      mime: rawMimeType,
      format: rawFormat,
      headers: customHeaders
    };
    var encodedStream = BASE64.encode(JSON.stringify(payload));

    var subApiUrl = "";
    var itemId = objparam.id || tmdbId || "";
    var imdbId = objparam.imdb_id || objparam.ttid || "";

    // ★★★ GẮN THÊM &mime= vào URL để parseEmbedResponse tách trực tiếp ★★★
    var mimeParam = "&mime=" + encodeURIComponent(rawMimeType);

    if (isTV) {
      subApiUrl = "https://getsubtitle.alokillgtv.workers.dev/?id=" + itemId + "&imdb_id=" + imdbId + "&type=tv&tmdb=" + tmdbId + "&season=" + (season || "1") + "&episode=" + (episode || "1") + mimeParam + "&stream=" + encodeURIComponent(encodedStream);
    } else {
      subApiUrl = "https://getsubtitle.alokillgtv.workers.dev/?id=" + itemId + "&imdb_id=" + imdbId + "&type=movie&tmdb=" + tmdbId + mimeParam + "&stream=" + encodeURIComponent(encodedStream);
    }

    console.log("▶ Format: " + rawFormat + " | Stream (Server " + (effectiveServerIdx + 1) + "): " + rawStreamUrl);
    console.log("▶ Mime gửi đi: " + rawMimeType);
    console.log("▶ Chuyển tiếp sang lấy Subtitle: " + subApiUrl);

    return JSON.stringify({
      url: subApiUrl,
      "headers":{
          "X-VAX-YB": "deo_co_gi_de_coi"
      },
      isEmbed: true
    });

  } catch (e) {
    console.log("parseDetailResponse[err]:\n " + e);
    return JSON.stringify({ 
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
      mimeType: "video/mp4", 
      isEmbed: false, headers: {}, subtitles: [] 
    });
  }
}

// ===== HÀM TẠO XỬ LÝ SUBTITLE PHIM =====
function parseEmbedResponse(html, url) {
    console.log("parseEmbedResponse [url]: " + url);
    try {
        if (!html) {
            throw new Error("Dữ liệu Subtitle html/JSON rỗng");
        }

        // 1. Trích xuất và Decode Base64 stream từ URL
        var streamMatch = url.match(/[?&]stream=([^&]+)/i);
        var streamUrl = "";
        var mimeType = "application/x-mpegURL";
        var customHeaders = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "X-VAX-YB": "deo_co_gi_de_coi",
            "Referer": "https://pengu.uk/",
            "Origin": "https://pengu.uk"
        };

        // ★★★ TÁCH MIME TRỰC TIẾP TỪ URL (do parseDetailResponse gắn vào) ★★★
        var mimeMatch = url.match(/[?&]mime=([^&]+)/i);
        if (mimeMatch) {
            mimeType = decodeURIComponent(mimeMatch[1]);
            console.log("▶ Mime tách từ URL: " + mimeType);
        }
        // ★★★ KẾT THÚC ★★★

        if (streamMatch) {
            var encodedStream = decodeURIComponent(streamMatch[1]);
            var decodedData = BASE64.decode(encodedStream);
            
            // Xử lý decode tương thích cả JSON Object và chuỗi Format|URL cũ
            try {
                var parsedPayload = JSON.parse(decodedData);
                if (parsedPayload && parsedPayload.url) {
                    streamUrl = parsedPayload.url;
                    // Nếu URL không có mime thì mới lấy từ payload
                    if (!mimeMatch && parsedPayload.mime) mimeType = parsedPayload.mime;
                    if (parsedPayload.headers) {
                        for (var key in parsedPayload.headers) {
                            customHeaders[key] = parsedPayload.headers[key];
                        }
                    }
                }
            } catch (eJson) {
                var pipeIdx = decodedData.indexOf('|');
                if (pipeIdx > -1) {
                    var streamFormat = decodedData.substring(0, pipeIdx);
                    streamUrl = decodedData.substring(pipeIdx + 1);
                    if (!mimeMatch && streamFormat.toUpperCase().indexOf("MP4") > -1) mimeType = "video/mp4";
                } else {
                    streamUrl = decodedData;
                }
            }
        }

        // Nhận diện lại MimeType nếu streamUrl có đuôi MP4 trực tiếp
        // (chỉ áp dụng khi URL không truyền mime sang)
        if (!mimeMatch && streamUrl && streamUrl.split('?')[0].toLowerCase().endsWith(".mp4")) {
            mimeType = "video/mp4";
        }

        console.log("▶ MimeType: " + mimeType + " | Link Stream decoded: " + streamUrl);

        // 2. Parse dữ liệu phụ đề từ Worker
        var rawParsed = null;
        try {
            rawParsed = (typeof html === "object") ? html : JSON.parse(html);
        } catch (eJson) {
            console.log("Không thể parse JSON Subtitles:", eJson);
        }

        var subtitlesData = [];
        if (Array.isArray(rawParsed)) {
            subtitlesData = rawParsed;
        } else if (rawParsed && Array.isArray(rawParsed.subtitles)) {
            subtitlesData = rawParsed.subtitles;
        } else if (rawParsed && Array.isArray(rawParsed.subs)) {
            subtitlesData = rawParsed.subs;
        }

        // 3. Map danh sách phụ đề
        var subtitleList = [];
        subtitlesData.forEach(function(item) {
            var itemUrl = item.url || item.file || item.src || "";
            if (!itemUrl) return;

            subtitleList.push({
                lang: item.name || item.display || item.label || "Subtitle",
                url: itemUrl,
                mimeType: item.mimetype || item.mimeType || "text/vtt"
            });
        });

        // 4. Sắp xếp ưu tiên phụ đề
        function getSubtitlePriority(langName) {
            var str = String(langName || "").toUpperCase();

            if (str.indexOf("VAX") > -1 && str.indexOf("ENGLISH") === -1) return 1;
            if (str.indexOf("WYZIE") > -1 && str.indexOf("ENGLISH") === -1) return 2;
            if ((str.indexOf("OPENSUB") > -1 || str.indexOf("SHEGUST") > -1) && str.indexOf("AI") === -1 && str.indexOf("ENGLISH") === -1) return 3;
            if (str.indexOf("AI") > -1) return 4;
            if (str.indexOf("ENGLISH") > -1 || str.indexOf("ENG") > -1) return 5;

            return 6;
        }

        subtitleList.sort(function(a, b) {
            return getSubtitlePriority(a.lang) - getSubtitlePriority(b.lang);
        });

        console.log("▶ Đã nhận và sắp xếp " + subtitleList.length + " phụ đề từ Worker.");

        // 5. Proxy M3U8 nếu gặp link đặc thù
        if (streamUrl.indexOf("resolve/cj/tmdb") > -1) {
            streamUrl = "https://proxym3u8.alokillgtv.workers.dev/?url=" + encodeURIComponent(streamUrl);
        }

        var $return = JSON.stringify({
            url: streamUrl,
            mimeType: mimeType,
            isEmbed: false,
            headers: customHeaders,
            skipTimes: [
                { start: 0, end: 32, type: "ad" }
            ],
            subtitles: subtitleList
        });

        console.log("streamdata embed:\n" + $return);
        return $return;

    } catch (e) {
        console.log("[Lỗi parseEmbedResponse]", e);
        return JSON.stringify({ 
          url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
          mimeType: "video/mp4", 
          isEmbed: false, headers: {}, subtitles: [] 
        });
    }
}


// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======
 // parseDetailResponse, parseEmbedResponse
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HÀM TẠO CUSTOM SCRIPT BEGIN ====
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
          return "https://subtitles.shegu.st/subtitles?type=movie&tmdb=96968"; 
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

function buildMenu(menuStr, type) { 
    try {
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
    } catch (e) {
        if (typeof log === "function") log("buildMenu[err]:\n " + e);
        return [];
    }
}




function getPrimaryCategories() {
    try {
        var rawList = getLISTmenu();
        var menulist = buildMenu(rawList);
        return JSON.stringify(menulist);
    } catch (e) {
        if (typeof log === "function") log("getPrimaryCategories[err]:\n " + e);
        return JSON.stringify([]);
    }
}

// Tạo thẻ chủ đề filter cho App/Extension
function getFilterConfig() {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify({
            category: menulist
        });
    } catch (e) {
        if (typeof log === "function") log("getFilterConfig[err]:\n " + e);
        return JSON.stringify({ category: [] });
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        if (typeof log === "function") log("parseCategoriesResponse[err]:\n " + e);
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
}
// ==== HIDEMENU ====
function hexToString(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

function sha256(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    var k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength) | 0;
    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16);
        var oldHash = hash.slice(0);
        for (i = 0; i < 64; i++) {
            var w15 = w[i - 15], w2 = w[i - 2];
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                + ((e & hash[5]) ^ ((~e) & hash[6]))
                + k[i]
                + (w[i] = (i < 16) ? w[i] : (
                    w[i - 16]
                    + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                    + w[i - 7]
                    + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                ) | 0
                );
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
            hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
        }
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }
    for (i = 0; i < 8; i++) {
        for (j = 3; j >= 0; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? '0' : '') + b.toString(16);
        }
    }
    return result;
}

function hmacSHA256(message, secret) {
    var blocksize = 64;
    var key = secret;
    if (key.length > blocksize) {
        key = hexToString(sha256(key));
    }
    while (key.length < blocksize) {
        key += '\x00';
    }
    var ipad = '', opad = '';
    for (var i = 0; i < blocksize; i++) {
        ipad += String.fromCharCode(key.charCodeAt(i) ^ 0x36);
        opad += String.fromCharCode(key.charCodeAt(i) ^ 0x5c);
    }
    return sha256(opad + hexToString(sha256(ipad + message)));
}

var BASEURL = "https://apip4k.dpdns.org";
var BASEAPI = "https://apip4k.dpdns.org/rest-api";
var BASELINK = BASEURL;
var API_KEY = "bbbb411dea44849";
var HMAC_SECRET = "5e8d1b4f9c2a6e730b1f8d4a92c5e3d1";

// https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/phimchill.ico
function getManifest() {
  try{
    return JSON.stringify({
      "id": "hdvietnam",
      "name": "Nguồn Hdvietnam",
      "version": "1.1",
      "author": "Alokillgtv",
      "BASEURL": BASEURL,
      "baseUrl": BASEURL,
      "headers": {
        "API-KEY": API_KEY,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/hdvietnam.png",
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
          {"slug": "/rest-api/v130/movies","title": "Phim Lẻ","type": "Horizontal"},
          {"slug": "/rest-api/v130/tvseries","title": "TV Show","type": "Horizontal"},
          {"slug": "/rest-api/v130/top_views?period=day&type=all&limit=20","title": "Phim Mới","type": "Grid"},
      ]);
  }
  
  // Hàm khởi tạo thẻ chủ đề
  function getLISTmenu() {
    try{
      return `[{
    "link": "/rest-api/v130/content_by_genre_id?id=1",
    "name": "Hành Động"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=2",
    "name": "Phiêu Lưu"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=3",
    "name": "Tội Phạm"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=5",
    "name": "Lịch Sử"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=6",
    "name": "Chiến Tranh"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=7",
    "name": "Âm Nhạc"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=8",
    "name": "Hài Hước"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=9",
    "name": "Chính Kịch"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=11",
    "name": "Khoa Học Viễn Tưởng"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=12",
    "name": "Bí Ẩn"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=13",
    "name": "Hoạt Hình"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=14",
    "name": "Gia Đình"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=15",
    "name": "Kinh Dị"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=18",
    "name": "Phim Truyền Hình"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=43",
    "name": "Drama"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=75",
    "name": "Hình Sự"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=83",
    "name": "TVB"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=130",
    "name": "Action & Adventure"
}, {
    "link": "/rest-api/v130/content_by_genre_id?id=138",
    "name": "Kinh Dị"
}]`;
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
          if (page > 0 && resultUrl.indexOf("page=") === -1) {
              
              if(resultUrl.indexOf("?") > -1){
                paramPage = "&" + paramPage;
              }
              else{
                paramPage = "?" + paramPage;
              }
              resultUrl += paramPage + page;
          }
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          return finalUrl;
      } catch (e) {
          log("getUrlList[err]:\n " + e);
          return BASEURL;
      }
  }
  
  function getUrlSearch(keyword, filtersJson) {
      // https://apip4k.dpdns.org/rest-api/v130/search?q=k%E1%BA%BB&page=1&type=movieserieslive
      var paramSearch = "/rest-api/v130/search?type=movieserieslive&q=";
      var paramPage = "page=";
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
                paramPage = "&" + paramPage;
              }
              else{
                paramPage = "?" + paramPage;
              }
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
    console.log("ListURL:\n" + $url);
    try {
        var $data = JSON.parse(html);
        var $listMV = [];
        if (Array.isArray($data)) {
            $listMV = $data;
        } else if ($data && Array.isArray($data.movie)) {
            $listMV = $data.movie;
        } else if ($data && Array.isArray($data.tvseries)) {
            $listMV = $data.tvseries;
        } else if ($data && Array.isArray($data.movies)) {
            $listMV = $data.movies;
        } else if ($data && Array.isArray($data.items)) {
            $listMV = $data.items;
        } else if ($data && typeof $data === 'object') {
            $listMV = $data.movie || $data.tvseries || [];
        }
        
        var items = [];
        
        $listMV.forEach(function(item) {
            var id = (item.is_tvseries == 1 || $url.indexOf("tvseries") > -1) 
                ? "/rest-api/v130/single_details?type=tvseries&id=" + item.videos_id
                : "/rest-api/v130/single_details?type=movie&id=" + item.videos_id;

            var title = item.title;
            var poster = item.poster_url;
            var background = item.thumbnail_url;
            var quality = item.video_quality;
            var episode_current = "";
            var year = item.release;
            var lang = "";

            if (title && title.length > 1 && poster && poster.length > 5) {
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
        });

        // --- XÁO TRỘN NGẪU NHIÊN DANH SÁCH (Fisher-Yates Shuffle) ---
        for (var i = items.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = items[i];
            items[i] = items[j];
            items[j] = temp;
        }

        var $return = JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 9999
            }
        });
        console.log("List\n" + $return)
        return $return;

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

// Helper 1: Đồng bộ tên tập phim (fmEpi)
function fmEpi(filename, hasMultipleSeasons) {
    if (!filename) return "";
    let clean = filename.replace(/\.(mkv|mp4|avi|flv|webm|ts|m3u8)$/i, "").trim();

    // 1. Dạng S01E02 / S1E2 / S01.E02
    const seMatch = clean.match(/S(\d+)[\s._-]*E(\d+)/i);
    if (seMatch) {
        var sNum = parseInt(seMatch[1], 10);
        var eNum = parseInt(seMatch[2], 10);
        return hasMultipleSeasons ? `Mùa ${sNum} Tập ${eNum}` : `Tập ${eNum}`;
    }

    // 2. Dạng E01.Revised / E01 / EP01 / Ep.01 / Tập 01
    const epMatch = clean.match(/(?:EP|Tập|Ep|E)[\s._-]*(\d{1,4})/i);
    if (epMatch) {
        var epVal = parseInt(epMatch[1], 10);
        return hasMultipleSeasons ? `Mùa 1 Tập ${epVal}` : `Tập ${epVal}`;
    }

    // 3. Dạng Season trọn bộ
    const seasonOnlyMatch = clean.match(/\b(?:S|Season\s*)(\d{1,2})\b/i);
    if (seasonOnlyMatch && !clean.match(/E\d+/i)) {
        return `Mùa ${parseInt(seasonOnlyMatch[1], 10)} (Trọn bộ)`;
    }

    // 4. Số đứng đầu tên file (Ví dụ: 127TVP, 127P...)
    const leadNumMatch = clean.match(/^(\d{1,4})/);
    if (leadNumMatch) {
        var leadVal = parseInt(leadNumMatch[1], 10);
        return hasMultipleSeasons ? `Mùa 1 Tập ${leadVal}` : `Tập ${leadVal}`;
    }

    // 5. Lọc từ rác & lấy số tập bất kỳ
    let cleanName = clean
        .replace(/(\d+)V\d+/gi, "$1")
        .replace(/[._-]/g, " ")
        .replace(/\b(2160p|1080p|720p|4k|50fps|60fps|25fps|x265|x264|h264|h265|hevc|10bit|hdr|hdr10|sdr|aac|ac3|dts|truehd|atmos|bluray|remux|web-dl|webrip|hdtv|vietsub|thuyetminh|engsub)\b/ig, "");

    const numMatch = cleanName.match(/\b(\d{1,4})\b/);
    if (numMatch) {
        var numVal = parseInt(numMatch[1], 10);
        return hasMultipleSeasons ? `Mùa 1 Tập ${numVal}` : `Tập ${numVal}`;
    }

    return clean;
}

// Helper 2: Đồng bộ tên Server/Bản phim (Hàm gốc của bạn)
function formatLabelName(rawName, prefix, counts) {
    const raw = rawName || "";

    let is4K = /4k|uhd|2160p/i.test(raw);
    let is2K = /2k|1440p|qhd/i.test(raw);
    let is1080 = /1080p?/i.test(raw);
    let isRemux = /remux/i.test(raw);

    const fpsMatch = raw.match(/(\d+\s*fps)/i);
    const fpsStr = fpsMatch ? ` ${fpsMatch[1].toUpperCase()}` : "";

    const hdrMatch = raw.match(/\b(SDR|HDR10\+|HDR10|HDR|DV|Dolby\s*Vision)\b/i);
    const hdrStr = hdrMatch ? ` ${hdrMatch[1].toUpperCase()}` : "";

    let typeLabel = "";
    let versionNum = 0;
    let priority = 99;

    if (isRemux) {
        counts.numRemux++;
        typeLabel = "Remux";
        versionNum = counts.numRemux;
        priority = 1;
    } else if (is4K) {
        counts.num4k++;
        typeLabel = "4K";
        versionNum = counts.num4k;
        priority = 1;
    } else if (is2K) {
        counts.num2k++;
        typeLabel = "2K";
        versionNum = counts.num2k;
        priority = 2;
    } else if (is1080) {
        counts.num1080++;
        typeLabel = "1080p";
        versionNum = counts.num1080;
        priority = 3;
    } else {
        counts.numOther++;
        typeLabel = "Khác";
        versionNum = counts.numOther;
        priority = 4;
    }

    const formattedName = `${prefix}${typeLabel} [V${versionNum}]${fpsStr}${hdrStr}`.trim();
    return { name: formattedName, priority: priority };
}

// Hàm chính: parseMovieDetail
function parseMovieDetail(html, url) {
    log("parseMovieDetail[url]:" + url);
    try {
        var $data = JSON.parse(html);
        var posterUrl = $data.poster_url;
        var backdropUrl = $data.thumbnail_url;
        var title = $data.title;
        var originName = title;
        var description = $data.description;

        var director = ($data.director || []).map(function(box) {
            return "[" + box.name + "](/rest-api/v130/content_by_country_id?id=" + box.star_id + ")";
        }).join(", ");

        var casts = ($data.cast || []).map(function(box) {
            return "[" + box.name + "](/rest-api/v130/search_by_actor?q=" + box.name + ")";
        }).join(", ");

        var category = ($data.genre || []).map(function(box) {
            return "[" + box.name + "](/rest-api/v130/content_by_genre_id?id=" + box.genre_id + ")";
        }).join(", ");

        var duration = $data.runtime;
        var status = "";
        var episode_current = "";
        var year = $data.release;
        var quality = $data.video_quality;
        var rating = "";
        var country = "";
        var lang = "";
        var extra = "";
        var servers = [];

        function parseSeasonAndEpisode(epName) {
            var s = 1, e = 0;
            var seasonMatch = epName.match(/(?:Mùa|Season|S)\s*(\d+)/i);
            if (seasonMatch) s = parseInt(seasonMatch[1], 10);

            var epMatch = epName.match(/(?:Tập|Episode|EP|Ep|E)\s*(\d+)/i);
            if (epMatch) {
                e = parseInt(epMatch[1], 10);
            } else {
                var fallbackMatch = epName.match(/\d+/);
                if (fallbackMatch) e = parseInt(fallbackMatch[0], 10);
            }
            return { season: s, episode: e, key: "S" + s + "E" + e };
        }

        if ($data.is_tvseries == 1) {
            var rawSeasons = $data.season || [];
            
            // 1. Nhận diện phim có nhiều mùa
            var hasMultipleSeasons = rawSeasons.length > 1;
            if (!hasMultipleSeasons) {
                rawSeasons.forEach(function(box) {
                    var sMatch = (box.seasons_name || "").match(/(?:Mùa|Season|S)\s*(\d+)/i);
                    if (sMatch && parseInt(sMatch[1], 10) > 1) hasMultipleSeasons = true;
                    
                    (box.episodes || []).forEach(function(ep) {
                        if (/(?:Mùa|Season|S)\s*([2-9]|\d{2,})/i.test(ep.episodes_name || "")) {
                            hasMultipleSeasons = true;
                        }
                    });
                });
            }

            var pool4k = [];
            var pool1080 = [];
            var poolKhac = [];

            // 2. Thu thập và làm sạch tên tập ngay từ nguồn
            rawSeasons.forEach(function(box) {
                var rawName = (box.seasons_name || "").toLowerCase();
                
                var tag = "Khác";
                if (rawName.indexOf("4k") !== -1 || rawName.indexOf("2160") !== -1) {
                    tag = "4K";
                } else if (/1080|1080p/i.test(rawName)) {
                    tag = "1080p";
                }

                (box.episodes || []).forEach(function(parent) {
                    var $obj = {};
                    var idurl = parent.file_url || "";
                    $obj.file_url = idurl;
                    $obj.key = idurl.replace("https://cdn.phim4k.lol/", "");
                    $obj.type = parent.file_type;
                    var nameEpi = parent.episodes_name;
                    
                    var nameClean = fmEpi(nameEpi, hasMultipleSeasons);

                    if (!$obj.type && nameEpi.indexOf('.') !== -1) {
                        $obj.type = nameEpi.match(/\.([^.]+)$/)[1];
                    }
                    $obj.sub = parent.subtitle;

                    var encode = BASE64.encode(JSON.stringify($obj));
                    var nameEPI = nameClean.replace("Mùa", "Season").replace("Tập", "Episode");
                    var search = nameClean + "|" + title + nameEPI;
                    var find64 = BASE64.encode(search);
                    var link = BASEURL + "/stream?setData=" + encode;

                    var parsed = parseSeasonAndEpisode(nameClean);

                    var epObj = { 
                        name: nameClean,
                        id: link,
                        _cleanName: nameClean,
                        _uniqueKey: parsed.key,
                        _season: parsed.season,
                        _episode: parsed.episode,
                        _tag: tag
                    };

                    if (tag === "4K") {
                        pool4k.push(epObj);
                    } else if (tag === "1080p") {
                        pool1080.push(epObj);
                    } else {
                        poolKhac.push(epObj);
                    }
                });
            });

            var srv1_4k_main = [];
            var srv2_1080_main = [];
            var srv3_4k_sub = [];
            var srv4_1080_sub = [];
            var srv5_khac = [];

            // 3. Phân bổ tập vào các Server
            pool4k.forEach(function(ep) {
                if (!srv1_4k_main.some(function(item) { return item._uniqueKey === ep._uniqueKey; })) {
                    srv1_4k_main.push(ep);
                } else if (!srv3_4k_sub.some(function(item) { return item._uniqueKey === ep._uniqueKey; })) {
                    srv3_4k_sub.push(ep);
                } else {
                    srv5_khac.push(ep);
                }
            });

            pool1080.forEach(function(ep) {
                if (!srv2_1080_main.some(function(item) { return item._uniqueKey === ep._uniqueKey; })) {
                    srv2_1080_main.push(ep);
                } else if (!srv4_1080_sub.some(function(item) { return item._uniqueKey === ep._uniqueKey; })) {
                    srv4_1080_sub.push(ep);
                } else {
                    srv5_khac.push(ep);
                }
            });

            poolKhac.forEach(function(ep) {
                srv5_khac.push(ep);
            });

            // Gọi formatLabelName để đặt nhãn Server nếu cần
            var labelCounts = { numRemux: 0, num4k: 0, num2k: 0, num1080: 0, numOther: 0 };

            var rawServers = [
                { name: "Server 4K", episodes: srv1_4k_main, priority: 1, isOther: false },
                { name: "Server 1080p", episodes: srv2_1080_main, priority: 2, isOther: false },
                { name: "Server 4K (Phụ)", episodes: srv3_4k_sub, priority: 3, isOther: false },
                { name: "Server 1080p (Phụ)", episodes: srv4_1080_sub, priority: 4, isOther: false },
                { name: "Server Khác", episodes: srv5_khac, priority: 99, isOther: true }
            ];

            // 4. Lọc bỏ server rỗng
            var activeServers = rawServers.filter(function(srv) {
                return srv.episodes.length > 0;
            });

            // 5. Sắp xếp Server (Server Khác luôn ở cuối)
            activeServers.sort(function(a, b) {
                if (a.isOther !== b.isOther) {
                    return a.isOther ? 1 : -1;
                }
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                return b.episodes.length - a.episodes.length;
            });

            // 6. Định dạng tên [V2] và Sort tập theo từng Phiên bản trước
            activeServers.forEach(function(srv) {
                var epList = srv.episodes;
                var nameTracker = {};

                epList.forEach(function(ep) {
                    if (srv.name === "Server Khác") {
                        nameTracker[ep.name] = (nameTracker[ep.name] || 0) + 1;
                        var vCount = nameTracker[ep.name];
                        ep._vNum = vCount;
                        if (vCount > 1) {
                            ep.name = "[V" + vCount + "] " + ep.name;
                        }
                    } else {
                        ep._vNum = 1;
                    }
                });

                // Ưu tiên gom V1 lên trước, rồi tới V2, V3... Sau đó mới xếp Mùa -> Tập
                epList.sort(function(a, b) {
                    if (a._vNum !== b._vNum) return a._vNum - b._vNum;
                    if (a._season !== b._season) return a._season - b._season;
                    return a._episode - b._episode;
                });

                epList.forEach(function(ep, epIdx) {
                    ep.slug = "tap-" + (epIdx + 1);

                    delete ep._cleanName;
                    delete ep._uniqueKey;
                    delete ep._season;
                    delete ep._episode;
                    delete ep._tag;
                    delete ep._vNum;
                });

                servers.push({
                    name: srv.name,
                    episodes: epList
                });
            });

       } else {
            // Phim lẻ (Movie) - Áp dụng formatLabelName chuẩn chỉnh
            var episodes = [];
            var labelCounts = { numRemux: 0, num4k: 0, num2k: 0, num1080: 0, numOther: 0 };

            $data.videos.forEach(function(box, index) {
                var $obj = {};
                var idurl = box.file_url || "";
                $obj.file_url = idurl;
                $obj.key = idurl.replace("https://cdn.phim4k.lol/", "");
                $obj.type = box.file_type;
                var nameEpi = box.episodes_name || "";
                var rawLabel = box.label || nameEpi;

                if (!$obj.type && nameEpi.indexOf('.') !== -1) {
                    $obj.type = nameEpi.match(/\.([^.]+)$/)[1];
                }
                $obj.sub = box.subtitle;

                var formatted = formatLabelName(rawLabel, "Xem Bản ", labelCounts);

                var encode = BASE64.encode(JSON.stringify($obj));
                var search = rawLabel + "|" + title;
                var find64 = BASE64.encode(search);
                var link = BASEURL + "/stream?setData=" + encode;

                episodes.push({
                    name: formatted.name,
                    id: link,
                    slug: "full-" + (index + 1)
                });
            });

            servers.push({
                name: "Server 1",
                episodes: episodes
            });
        }

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
function getStreamLink(slug, datasend) {
    try {
        log("getStreamLink slug: " + slug + " | datasend: " + datasend);
        var payload = {};
        var dataStr = datasend || "";
        if (!dataStr && slug && slug.indexOf("setData=") > -1) {
            var match = slug.match(/setData=([^&]*)/i);
            if (match && match[1]) dataStr = match[1];
        }
        if (dataStr) {
            var decoded = BASE64.decode(dataStr);
            payload = JSON.parse(decoded);
        }

        var streamKey = payload.key || payload.stream_key || "";
        var stream = "https://svgcl.gboiz7.workers.dev/" + streamKey + "?4k=68381687";
        var videoToken = hmacSHA256(streamKey || stream, HMAC_SECRET);

        var videoMimeType = "video/mp4";
        var videoType = (payload.type || "").toLowerCase();
        if (videoType === "mkv") videoMimeType = "video/x-matroska";
        else if (videoType === "m3u8") videoMimeType = "application/x-mpegURL";

        var subtitles = [];
        if (payload.sub && payload.sub.length > 0) {
            for (var i = 0; i < payload.sub.length; i++) {
                var subItem = payload.sub[i];
                if (!subItem || !subItem.url) continue;
                var langLower = (subItem.language || "").toLowerCase();
                var isVi = langLower.indexOf("vietnam") !== -1 || (subItem.srclang || "") === "vi";
                subtitles.push({
                    lang: isVi ? "Vietsub (VIP)" : (subItem.language || "Subtitle"),
                    url: subItem.url,
                    mimeType: "text/vtt"
                });
            }
        }

        var result = JSON.stringify({
            url: stream,
            mimeType: videoMimeType,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "API-KEY": API_KEY,
                "Authorization": videoToken,
                "X-Token": videoToken,
                "Referer": BASEURL + "/",
                "Origin": BASEURL
            },
            subtitles: subtitles
        });
        log("getStreamLink result: " + result);
        return result;
    } catch (e) {
        log("getStreamLink[err]: " + e);
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseDetailResponse(html, url, datasend) {
    log("parseDetailResponse: " + url);
    return getStreamLink(url, datasend);
}

function parseEmbedResponse(html, url, datasend) {
    log("parseEmbedResponse: " + url);
    return getStreamLink(url, datasend);
}
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HÀM TẠO CUSTOM SCRIPT BEGIN ====

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
      
      var safeCode = checkRaw(innerCode, true);
      
      return safeCode;
  }
}
// ==== HIDEMENU =====

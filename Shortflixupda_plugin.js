// =============================================================================
// CẤU HÌNH DOMAIN (CHỈ CẦN SỬA TÊN MIỀN Ở ĐÂY NẾU WEB CÓ THAY ĐỔI)
// =============================================================================
var MAIN_DOMAIN = "www.shortflix.net"; 
var BASEURL = "https://" + MAIN_DOMAIN; 
var BASEAPI = "https://" + MAIN_DOMAIN + "/api/search?limit=100&language=vi_VN&lang=vi_VN";
var popup_html = "";

// =============================================================================
// GLOBAL CURSOR CACHE (BỘ NHỚ LƯU CURSOR ĐỘNG TRONG BỘ NHỚ RAM)
// =============================================================================
var CURSOR_CACHE = {};
var URL_TO_PAGE_MAP = {};
var URL_TO_PATH_MAP = {};
var DEV = false;

function getManifest() {
    return JSON.stringify({
        "id": "shortflix",
        "name": "Phim Ngắn Shortflix",
        "description": "Phim Ngắn lồng tiếng vietsub hay",
        "version": "1.3",
        "info": "",
        "baseUrl": BASEURL,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/shortflix.png",
        "author": "Alokillgtv",
        "popup_html": popup_html,
        "type": "shortfilm",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if(DEV){
      if (typeof nativeLog !== 'undefined') {
          nativeLog("[" + BASEURL.replace(/^(https?:\/\/)?(www\.)?/, "") + "]: " + msg);
      } else if (typeof console !== 'undefined' && console.log) {
          console.log("[" + BASEURL.replace(/^(https?:\/\/)?(www\.)?/, "") + "]: " + msg);
      }
    }
}

// =============================================================================
// CHỈ ĐỂ 5 MỤC NỔI BẬT Ở TRANG CHỦ THEO YÊU CẦU
// =============================================================================
function getHomeSections() {
    return JSON.stringify([
        { "slug": "&sortBy=last_episode_at", "title": "Phim Mới Cập Nhật", "type": "Grid" },
        { "slug": "&genre=tong-tai", "title": "Phim Tổng Tài", "type": "Horizontal" },
        { "slug": "&genre=co-dai", "title": "Phim Cổ Đại", "type": "Horizontal" },
        { "slug": "&genre=ngon-tinh", "title": "Phim Ngôn Tình", "type": "Horizontal" },
        { "slug": "&q=l%E1%BB%93ng+ti%E1%BA%BFng", "title": "Phim Lồng Tiếng", "type": "Horizontal" }
    ]);
}

// =============================================================================
// ĐẨY TOÀN BỘ DANH MỤC VÀO MENU PRIMARY CATEGORIES
// =============================================================================
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

// =============================================================================
// HELPER: CURSOR BASE64 ENCODE / DECODE
// =============================================================================

function encodeBase64(str) {
    try {
        if (typeof btoa !== 'undefined') {
            try { return btoa(str); } catch (e) {}
        }
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var output = '';
        for (var block, charCode, idx = 0, map = chars;
            str.charAt(idx | 0) || (map = '=', idx % 1);
            output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
            charCode = str.charCodeAt(idx += 3/4);
            block = block << 8 | charCode;
        }
        return output;
    } catch (e) {
        log("encodeBase64[err]:\n " + e);
        return "";
    }
}

function decodeBase64(str) {
    try {
        if (typeof atob !== 'undefined') {
            try { return atob(str); } catch (e) {}
        }
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var output = '';
        str = String(str).replace(/=+$/, '');
        for (var bc = 0, bs, buffer, idx = 0;
            buffer = str.charAt(idx++);
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            buffer = chars.indexOf(buffer);
        }
        return output;
    } catch (e) {
        log("decodeBase64[err]:\n " + e);
        return "";
    }
}

function parseCursor(cursorBase64) {
    try {
        if (!cursorBase64) return null;
        var jsonStr = decodeBase64(cursorBase64);
        return JSON.parse(jsonStr);
    } catch (e) {
        log("parseCursor[err]:\n " + e);
        return null;
    }
}

function createCursor(lastItem) {
    try {
        if (!lastItem) return "";
        var rawOrder = lastItem.orderValue || lastItem.updatedAt || lastItem.publishedAt || lastItem.last_episode_at || 0;
        var orderVal = Number(rawOrder);
        
        if (isNaN(orderVal) && typeof rawOrder === 'string') {
            var dateParsed = Date.parse(rawOrder);
            orderVal = !isNaN(dateParsed) ? dateParsed : 0;
        }

        var cursorObj = {
            id: String(lastItem.id || ""),
            timestamp: 0,
            orderValue: orderVal || 0
        };
        
        return encodeBase64(JSON.stringify(cursorObj));
    } catch (e) {
        log("createCursor[err]:\n " + e);
        return "";
    }
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        log("getUrlList[url]: \n" + slug);
        
        var page = 1;
        var path = slug || "";
        var cursor = "";

        // Parse filtersJson từ App
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                cursor = filters.cursor || ""; 
                
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        // Tạo Base URL
        var resultUrl = "";
        if (path && path.indexOf("http") === 0) {
            resultUrl = path;
        } else {
            resultUrl = BASEAPI + (path ? path : "");
        }

        // Nếu là trang > 1 và App chưa truyền cursor, tự lấy từ CURSOR_CACHE trong bộ nhớ
        if (page > 1 && !cursor) {
            var cacheKey = path + "_page_" + page;
            cursor = CURSOR_CACHE[cacheKey] || "";
            log("Fetch cursor from CACHE [" + cacheKey + "]: " + cursor);
        }

        // Gắn Cursor vào URL
        if (cursor) {
            var separator = resultUrl.indexOf("?") > -1 ? "&" : "?";
            resultUrl += separator + "cursor=" + encodeURIComponent(cursor);
        }

        resultUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");

        // Lưu vết MAPPING URL để parseListResponse nhận diện đúng Trang hiện tại
        URL_TO_PAGE_MAP[resultUrl] = page;
        URL_TO_PATH_MAP[resultUrl] = path;

        log("getUrlList[url]: \n" + resultUrl);
        return resultUrl;

    } catch (e) {
        log("getUrlList[err]:\n " + e);
        var fallback = slug || BASEAPI;
        log("getUrlList[url]: \n" + fallback);
        return fallback;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var searchUrl = BASEAPI + "&q=" + encodeURIComponent(keyword || "");
        log("getUrlSearch[url]: \n" + searchUrl);
        return searchUrl;
    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        var fallbackUrl = BASEAPI + "&q=" + encodeURIComponent(keyword || "");
        log("getUrlSearch[url]: \n" + fallbackUrl);
        return fallbackUrl;
    }
}

function getUrlDetail(slug) {
    try {
        log("getUrlDetail[url]: \n" + slug);
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

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, $url) {
    try {
        log("parseListResponse[url]: \n" + $url);
        var items = [];
        var $data = JSON.parse(html);
        var nextCursor = "";
        
        if ($data && $data.items && $data.items.length > 0) {
            for (var $j = 0; $j < $data.items.length; $j++) {
                var $item = $data.items[$j];
                var year = "";
                var lang = "";
                var current = $item.status ? $item.status.replace("PUBLISHED", "Hoàn Thành") : "";
                
                var itemSlug = $item.slug || $item.id || "";
                var href = BASEURL + "/vi/videos/" + itemSlug;
                
                var quality = "HD";
                var title = $item.title || "";
                var src = $item.thumbnailUrl || "";

                if (href) {
                    var cleanThumb = src.replace(/&amp;/g, '&');

                    items.push({
                        "id": href,
                        "title": title.trim(),
                        "posterUrl": cleanThumb,
                        "backdropUrl": cleanThumb,
                        "quality": quality,
                        "lang": lang,
                        "episode_current": current
                    });
                }
            }

            // 1. Lấy Cursor cho trang kế tiếp từ API hoặc tự tạo từ item cuối cùng
            if ($data.nextCursor) {
                nextCursor = $data.nextCursor;
            } else {
                var lastRawItem = $data.items[$data.items.length - 1];
                nextCursor = createCursor(lastRawItem);
            }

            // 2. Tra cứu trang hiện tại và lưu cursor vào CACHE cho trang sau
            var currentPage = URL_TO_PAGE_MAP[$url] || 1;
            var currentPath = URL_TO_PATH_MAP[$url] || "";
            var nextPage = currentPage + 1;

            if (nextCursor) {
                var cacheKey = currentPath + "_page_" + nextPage;
                CURSOR_CACHE[cacheKey] = nextCursor;
                log("Saved Cursor for [" + cacheKey + "]: " + nextCursor);
            }
        }

        log("Generated nextCursor: " + nextCursor);

        return JSON.stringify({
            "items": items,
            "nextCursor": nextCursor,
            "pagination": {
                "currentPage": 1,
                "totalPages": 999,
                "nextCursor": nextCursor
            }
        });

    } catch (e) {
        log("parseListResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [{
                "id": $url,
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "nextCursor": "",
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
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
            "nextCursor": "",
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseScript(rawScript) {
    var result = {
        success: false,
        data: {},
        embedHtml: ''
    };
    
    if (!rawScript || typeof rawScript !== 'string') {
        return result;
    }
    
    try {
        var cleaned = rawScript.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        cleaned = cleaned.replace(/[\r\n]+/g, ' ');
        
        var videoKey = '"video":{';
        var videoIndex = cleaned.indexOf(videoKey);
        
        if (videoIndex !== -1) {
            var startIndex = videoIndex + videoKey.length - 1;
            var braceCount = 0;
            var endIndex = -1;
            
            for (var i = startIndex; i < cleaned.length; i++) {
                if (cleaned[i] === '{') {
                    braceCount++;
                } else if (cleaned[i] === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        endIndex = i + 1;
                        break;
                    }
                }
            }
            
            if (endIndex !== -1) {
                var videoJsonStr = cleaned.substring(startIndex, endIndex);
                result.data = JSON.parse(videoJsonStr);
                result.success = true;
                return result;
            }
        }
        
        var regexMatch = cleaned.match(/"video"\s*:\s*(\{[\s\S]*?\})\s*,\s*"tags"/);
        if (regexMatch && regexMatch[1]) {
            result.data = JSON.parse(regexMatch[1]);
            result.success = true;
        }
        
    } catch (error) {
        log("parseScript[err]:\n " + error);
    }
    
    return result;
}

function parseMovieDetail(html, url) {
    try {
        log("parseMovieDetail[url]: \n" + url);
        var id = url;
        var lname = "Đang cập nhật...";
        var limg = "";
        var ldes = "Không có mô tả.";
        var category = "";
        var episode_current = "";
        var quality = "";
        var year = 2026;
        var rating = 0;
        var servers = [];
        var extra = "";
        var lactor = "";
        var ldirec = "";
        var lduran = "";
        var status = "";
        
        lname = _$(html).find("h1").text();
        limg = _$(html).find('meta[property="og:image"]').attr("content");
        ldes = _$(html).find(".order-6:content('Giới thiệu')").text();
        category = _$(html).find(".text-sm:content('Thể loại:')").parent().text(" - ").replace("Thể loại - : - ", "");
        episode_current = _$(html).find("span:content('Tập mới nhất:')").parent().text().trim().replace("Tập mới nhất:", "");
        quality = "HD";
        year = _$(html).find("span:content('Thời gian xuất bản:')").parent().text().trim().replace("Thời gian xuất bản:", "");
        year = Number(year);
        lactor = _$(html).find("span:content('Diễn viên:')").parent().text().trim().replace("Diễn viên:", "");
        ldirec = _$(html).find("span:content('Đạo diễn:')").parent().text().trim().replace("Đạo diễn:", "");
        lduran = _$(html).find("span:content('Thời lượng:')").parent().text().trim().replace("Thời lượng:", "");
        status = _$(html).find("span:content('Trạng thái:')").parent().text().trim().replace("Trạng thái:", "");
        rating = _$(html).find("span:content('Điểm IMDB:')").parent().text().trim().replace("Điểm IMDB:", "");
        
        var script = _$(html).find("script:content('.m3u8')").html();
        if (!script) {
            script = _$(html).find("script:content('episodes')").html();
        }
        var $dataVD = parseScript(script);
        var servers = [];
        var $listepi = $dataVD.data.episodes || [];
        var $items = [];
        for (var $j = 0; $j < $listepi.length; $j++) {
            var $epinumber = $listepi[$j].episodeNumber;
            var $nameepi = "Tập " + $epinumber;
            var $item = {
                id: url + "?tap=" + $epinumber,
                name: $nameepi,
                slug: "tap-" + $epinumber
            };
            $items.push($item);
        }
        
        servers.push({
            name: "Danh sách tập",
            episodes: $items
        });
        
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
            extra: extra
        });
    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: url || "error",
            title: "Lỗi tải thông tin chi tiết",
            servers: []
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        log("parseDetailResponse[url]: \n" + url);
        var tap = url.match(/tap=(\d+)/i);
        var tapVal = tap && tap[1] !== undefined ? tap[1] : "1";
        
        var script = _$(html).find("script:content('.m3u8')").html();
        var $subtitle = "";
        var $dataVD = parseScript(script);
        var $episodes = $dataVD.data.episodes || [];
        var tapcurrent = $episodes.findIndex(function(ep) {
            return ep.name == tapVal || ep.slug == tapVal || ep.episode == tapVal;
        });

        if (tapcurrent === -1) {
            var tapNum = Number(tapVal);
            tapcurrent = tapNum > 0 ? tapNum - 1 : 0;
        }

        if (tapcurrent < 0) tapcurrent = 0;
        if (tapcurrent >= $episodes.length) tapcurrent = $episodes.length - 1;

        var $epicurrent = $episodes[tapcurrent];
        if (!$epicurrent) throw new Error("Episode not found");

        var $video = $epicurrent.versions[0];
        var $linkstream = $video.videoUrl;
        var $hardsub = $video.hardSub;
        
        if ($hardsub === false && $video.subtitles && $video.subtitles.length > 0) {
            $subtitle = $video.subtitles[0].fileUrl;
        }
        
        return JSON.stringify({
            "url": $linkstream,
            "isEmbed": false,
            "mimeType": "application/x-mpegURL",
            "headers": {
                "Referer": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": [{
                "lang": "vi",
                "url": $subtitle
            }]
        });

    } catch (e) {
        log("parseDetailResponse[err]:\n " + e);
        return JSON.stringify({
            "url": "",
            "headers": {}
        });
    }
}

function parseEmbedResponse(html, url, datasend) {
    console.log("Kết quả:\n" + html)
    log("parseEmbedResponse [url]: " + url);
    try {
      var decode = decodeURIComponent(datasend)
      console.log("embed:\n" + decode)
      var $return = JSON.stringify({
        url: decode + "&m3u8=true" ,
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        subtitles: [{
          lang: "Vietsub",
          url: decode + "&subtitle=true",
          mimeType: "text/vtt"
        }]     
      });
      console.log("Return Embed:\n" + $return)
      return $return
    } catch (e) {
      console.log("[Lỗi parseEmbedResponse]", e);
      return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

function sortEpisodesByName(data) {
    try {
        if (data && Array.isArray(data)) {
            data.forEach(function(server) {
                if (server.episodes && Array.isArray(server.episodes)) {
                    server.episodes.sort(function(a, b) {
                        var matchA = a.name.match(/Tập\s*(\d+)/i);
                        var matchB = b.name.match(/Tập\s*(\d+)/i);
                        var numA = matchA ? parseInt(matchA[1], 10) : 0;
                        var numB = matchB ? parseInt(matchB[1], 10) : 0;
                        return numA - numB;
                    });
                }
            });
        }
        return data;
    } catch (e) {
        log("sortEpisodesByName[err]:\n " + e);
        return data;
    }
}

BASE64 = {
  encode: function (str) {
    try {
      if (!str) return "";
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
      var str = decodeURIComponent(base64String.trim());
      str = str.replace(/-/g, "+").replace(/_/g, "/");
      var chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var output = [];
      var buffer = 0,
        bits = 0;

      for (var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if (char === "=") break; 
        var index = chars.indexOf(char);
        if (index === -1) continue; 

        buffer = (buffer << 6) | index;
        bits += 6;

        if (bits >= 8) {
          bits -= 8;
          output.push((buffer >> bits) & 0xff);
        }
      }

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

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return `[{\"link\":\"&q=l%E1%BB%93ng+ti%E1%BA%BFng\",\"name\":\"Lồng Tiếng\"},{\"link\":\"&genre=tong-tai\",\"name\":\"Tổng tài\"},{\"link\":\"&genre=co-dai\",\"name\":\"Cổ đại\"},{\"link\":\"&genre=tam-ly\",\"name\":\"Tâm lý\"},{\"link\":\"&genre=ngon-tinh\",\"name\":\"Ngôn tình\"},{\"link\":\"&genre=hai-huoc\",\"name\":\"Hài hước\"},{\"link\":\"&genre=nu-cuong\",\"name\":\"Nữ cường\"},{\"link\":\"&genre=huyen-huyen\",\"name\":\"Huyền huyễn\"},{\"link\":\"&genre=toi-pham\",\"name\":\"Tội phạm\"},{\"link\":\"&genre=xuyen-khong\",\"name\":\"Xuyên không\"},{\"link\":\"&genre=thanh-xuan\",\"name\":\"Thanh xuân\"},{\"link\":\"&genre=hanh-dong\",\"name\":\"Hành động\"},{\"link\":\"&genre=kinh-di\",\"name\":\"Kinh dị\"},{\"link\":\"&genre=gia-dinh\",\"name\":\"Gia Đình\"},{\"link\":\"&genre=bi-an\",\"name\":\"Bí ẩn\"},{\"link\":\"&genre=dan-quoc\",\"name\":\"Dân quốc\"},{\"link\":\"&genre=trong-sinh\",\"name\":\"Trọng sinh\"},{\"link\":\"&genre=cuoi-truoc-yeu-sau\",\"name\":\"Cưới trước yêu sau\"},{\"link\":\"&genre=khoa-hoc-vien-tuong\",\"name\":\"Khoa học viễn tưởng\"},{\"link\":\"&genre=hanh-dong-ly-ky\",\"name\":\"Hành động ly kỳ\"},{\"link\":\"&genre=hien-dai\",\"name\":\"Hiện đại\"},{\"link\":\"&genre=bao-thu\",\"name\":\"Báo thù\"},{\"link\":\"&genre=the-thao\",\"name\":\"Thể thao\"},{\"link\":\"&genre=em-be\",\"name\":\"Em bé\"},{\"link\":\"&genre=nguoc-luyen\",\"name\":\"Ngược luyến\"},{\"link\":\"&genre=sung-ngot\",\"name\":\"Sủng ngọt\"},{\"link\":\"&genre=hieu-lam\",\"name\":\"Hiểu lầm\"},{\"link\":\"&genre=khac\",\"name\":\"Khác\"},{\"link\":\"&genre=hao-mon\",\"name\":\"Hào môn\"},{\"link\":\"&genre=tim-nguoi-than\",\"name\":\"Tìm người thân\"},{\"link\":\"&genre=quan-phiet\",\"name\":\"Quân phiệt\"},{\"link\":\"&genre=vuon-len-tu-so-khong\",\"name\":\"Vươn lên từ số không\"},{\"link\":\"&genre=tai-hop\",\"name\":\"Tái hợp\"},{\"link\":\"&genre=su-tro-lai\",\"name\":\"Sự trở lại\"},{\"link\":\"&genre=tam-ly-tinh-cam\",\"name\":\"Tâm lý tình cảm\"},{\"link\":\"&genre=truong-thanh\",\"name\":\"Trưởng thành\"}]`;
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

function _$(htmlOrBlock){ 
	if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) { return htmlOrBlock; } var instance = { sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '', elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []), length: 0, find: function (selector) { if (selector.indexOf(',') !== -1) { var results = []; var selectors = selector.split(',').map(function (s) { return s.trim(); }); for (var s = 0; s < selectors.length; s++) { if (selectors[s] === "") continue; var subInstance = this.find(selectors[s]); for (var r = 0; r < subInstance.elements.length; r++) { var element = subInstance.elements[r]; if (results.indexOf(element) === -1) { results.push(element); } } } var multiInstance = _$(results); multiInstance.sourceHtml = this.sourceHtml; return multiInstance; } var results = []; var contentFilter = ""; if (selector.indexOf(":content(") !== -1) { var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/); if (contentMatch) { contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || ""; selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/, ""); } } var attrNameFilter = ""; var attrValueFilter = ""; var attrOperator = "="; var hasAttrFilter = false; var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/); if (attrMatch) { hasAttrFilter = true; attrNameFilter = attrMatch[1]; attrOperator = attrMatch[2]; attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || ""; selector = selector.replace(/\[.*?\]/, ""); } var notSelector = ""; if (selector.indexOf(":not(") !== -1) { var notMatch = selector.match(/:not\(([^)]+)\)/); if (notMatch) { notSelector = notMatch[1]; selector = selector.replace(/:not\([^)]+\)/, ""); } } var isFirstFilter = selector.indexOf(":first") !== -1; var isLastFilter = selector.indexOf(":last") !== -1; selector = selector.replace(/:first|:last/g, ""); var targetTagName = ""; var targetId = ""; var targetClasses = []; var selectorToParse = selector.trim(); if (selectorToParse !== "") { var idIndex = selectorToParse.indexOf('#'); if (idIndex !== -1) { var afterId = selectorToParse.substring(idIndex + 1); var nextDot = afterId.indexOf('.'); targetId = nextDot === -1 ? afterId : afterId.substring(0, nextDot); selectorToParse = selectorToParse.substring(0, idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1)); } var classParts = selectorToParse.split('.'); var possibleTag = classParts.shift(); if (possibleTag) { targetTagName = possibleTag.toLowerCase(); } targetClasses = classParts.filter(function (c) { return c.length > 0; }); } for (var i = 0; i < this.elements.length; i++) { var currentHtml = this.elements[i]; var pos = 0; var subResults = []; while ((pos = currentHtml.indexOf('<', pos)) !== -1) { if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') { pos++; continue; } var endOpenTag = -1; var insideQuote = false; var quoteChar = ''; for (var j = pos + 1; j < currentHtml.length; j++) { var char = currentHtml.charAt(j); if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') { if (!insideQuote) { insideQuote = true; quoteChar = char; } else if (char === quoteChar) { insideQuote = false; } } if (char === '>' && !insideQuote) { endOpenTag = j; break; } } if (endOpenTag === -1) break; var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1); var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/); var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : ""; var isMatched = true; if (targetTagName && targetTagName !== currentTagName) { isMatched = false; } var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : ""; var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : ""; if (isMatched && targetId && idMatchStr !== targetId) { isMatched = false; } if (isMatched && targetClasses.length > 0) { if (classMatchStr) { var currentClasses = classMatchStr.trim().split(/\s+/); for (var c = 0; c < targetClasses.length; c++) { if (currentClasses.indexOf(targetClasses[c]) === -1) { isMatched = false; break; } } } else { isMatched = false; } } if (isMatched && hasAttrFilter) { var actualValue = ""; if (attrNameFilter === "class") { actualValue = classMatchStr; } else if (attrNameFilter === "id") { actualValue = idMatchStr; } else { var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : ""; } var attrExists = fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=', 'i')) !== -1; if (!attrExists) { isMatched = false; } else { if (attrOperator === "=") { if (attrNameFilter === "class") { var classes = actualValue.trim().split(/\s+/); if (classes.indexOf(attrValueFilter) === -1) isMatched = false; } else if (actualValue !== attrValueFilter) { isMatched = false; } } else if (attrOperator === "*=") { if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false; } else if (attrOperator === "^=") { if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false; } else if (attrOperator === "$=") { if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false; } } } if (isMatched) { var startTagPos = pos; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var depth = 1; var scanPos = endOpenTag + 1; var openStr = '<' + currentTagName; var closeStr = '</' + currentTagName + '>'; while (depth > 0 && scanPos < currentHtml.length) { var nextOpen = currentHtml.indexOf(openStr, scanPos); var nextClose = currentHtml.indexOf(closeStr, scanPos); if (nextClose === -1) { scanPos = currentHtml.length; break; } if (nextOpen !== -1 && nextOpen < nextClose) { depth++; scanPos = nextOpen + openStr.length; } else { depth--; scanPos = nextClose + closeStr.length; if (depth === 0) endTagPos = nClose = nextClose + closeStr.length; } } } var foundBlock = currentHtml.substring(startTagPos, endTagPos); if (contentFilter) { var pureText = foundBlock.replace(/<[^>]+>/g, "").trim(); var keywords = contentFilter.split('|'); var isContentMatched = false; for (var k = 0; k < keywords.length; k++) { if (pureText.indexOf(keywords[k].trim()) !== -1) { isContentMatched = true; break; } } if (!isContentMatched) { pos = endTagPos; continue; } } if (notSelector) { var isNotClass = notSelector.indexOf('.') === 0; var isNotId = notSelector.indexOf('#') === 0; var notValue = notSelector.substring(1); var hasNot = false; if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true; if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true; if (!hasNot) subResults.push(foundBlock); } else { subResults.push(foundBlock); } pos = endTagPos; } else { pos++; } } if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]]; if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]]; results = results.concat(subResults); } var newInstance = _$(results); newInstance.sourceHtml = this.sourceHtml || currentHtml; return newInstance; }, each: function (callback) { for (var i = 0; i < this.elements.length; i++) { var childInstance = _$(this.elements[i]); childInstance.sourceHtml = this.sourceHtml; callback.call(childInstance, i, this.elements[i]); } return this; }, eq: function (index) { if (index < 0) index = this.elements.length + index; var matchedElement = this.elements[index]; this.elements = matchedElement ? [matchedElement] : []; this.length = this.elements.length; return this; }, attr: function (attrName) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var getAttr = elem.match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : ""; }, html: function () { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) return elem.substring(start, end); return ""; }, text: function (separator) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); if (typeof separator === 'string') { return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(separator); } return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); } return ""; }, textAll: function (separator) { if (this.elements.length === 0) return ""; var sep = typeof separator === 'string' ? separator : " "; var allTexts = []; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); var cleanText = pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); if (cleanText !== '') { allTexts.push(cleanText); } } } return allTexts.join(sep); }, next: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx === -1) continue; var scanPos = idx + elem.length; var nextOpen = this.sourceHtml.indexOf('<', scanPos); if (nextOpen !== -1) { if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue; var endOpenTag = this.sourceHtml.indexOf('>', nextOpen); if (endOpenTag === -1) continue; var fullOpenTag = this.sourceHtml.substring(nextOpen, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var startTagPos = nextOpen; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var depth = 1; var sPos = endOpenTag + 1; var openStr = '<' + currentTagName; var closeStr = '</' + currentTagName + '>'; while (depth > 0 && sPos < this.sourceHtml.length) { var nOpen = this.sourceHtml.indexOf(openStr, sPos); var nClose = this.sourceHtml.indexOf(closeStr, sPos); if (nClose === -1) break; if (nOpen !== -1 && nOpen < nClose) { depth++; sPos = nOpen + openStr.length; } else { depth--; sPos = nClose + closeStr.length; if (depth === 0) endTagPos = nClose + closeStr.length; } } } results.push(this.sourceHtml.substring(startTagPos, endTagPos)); } } var nextInstance = _$(results); nextInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, parent: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx <= 0) continue; var scanPos = idx - 1; while (scanPos >= 0) { var openTagPos = this.sourceHtml.lastIndexOf('<', scanPos); if (openTagPos === -1) break; if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this.sourceHtml.charAt(openTagPos + 1) !== '!') { var endOpenTag = this.sourceHtml.indexOf('>', openTagPos); if (endOpenTag !== -1 && endOpenTag > openTagPos) { var fullOpenTag = this.sourceHtml.substring(openTagPos, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var depth = 1; var sPos = endOpenTag + 1; var openStr = '<' + currentTagName; var closeStr = '</' + currentTagName + '>'; while (depth > 0 && sPos < this.sourceHtml.length) { var nOpen = this.sourceHtml.indexOf(openStr, sPos); var nClose = this.sourceHtml.indexOf(closeStr, sPos); if (nClose === -1) break; if (nOpen !== -1 && nOpen < nClose) { depth++; sPos = nOpen + openStr.length; } else { depth--; sPos = nClose + closeStr.length; if (depth === 0) endTagPos = nClose + closeStr.length; } } } if (endTagPos >= idx + elem.length) { var parentBlock = this.sourceHtml.substring(openTagPos, endTagPos); if (results.indexOf(parentBlock) === -1) results.push(parentBlock); break; } } } scanPos = openTagPos - 1; } } var parentInstance = _$(results); parentInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, closest: function (selector) { var results = []; if (!this.sourceHtml || this.elements.length === 0) return _$([]); for (var i = 0; i < this.elements.length; i++) { var currentElem = this.elements[i]; var currentObj = _$(currentElem); currentObj.sourceHtml = this.sourceHtml; var selfCheck = _$(this.sourceHtml).find(selector); var isSelfMatched = false; for (var s = 0; s < selfCheck.elements.length; s++) { if (selfCheck.elements[s] === currentElem) { isSelfMatched = true; break; } } if (isSelfMatched) { if (results.indexOf(currentElem) === -1) results.push(currentElem); continue; } var parentObj = currentObj.parent(); while (parentObj.elements.length > 0) { var parentElem = parentObj.elements[0]; var checkMatch = _$(this.sourceHtml).find(selector); var isMatched = false; for (var j = 0; j < checkMatch.elements.length; j++) { if (checkMatch.elements[j] === parentElem) { isMatched = true; break; } } if (isMatched) { if (results.indexOf(parentElem) === -1) results.push(parentElem); break; } parentObj = parentObj.parent(); } } var closestInstance = _$(results); closestInstance.sourceHtml = this.sourceHtml; return closestInstance; } }; instance.length = instance.elements.length; return instance; };

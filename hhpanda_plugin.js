//var BASEURL = "https://hhpanda.st"; 
var iddomain = "hhpanda"
BASEURL = "https://vkey.vn/" + iddomain;
var LOGGER = false;
// https://www.whoreshub.com/categories/4k-porn/
function getManifest() {
    return JSON.stringify({
      "id": "hhpanda",
      "name": "[ANIME] HHPanda",
      "description": "Anime siêu hay.",
      "version": "1.6.4",
      "info": "",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/hhpanda.png",
      "isEnabled": true,
      "adblock": false,
      "type": "ANIME",
      "playerType": "embed"
    })
};

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


function log(msg) {
  	if(LOGGER == "true"){
			if (typeof console !== 'undefined' && console.log) {
          console.log("[" + BASEURL.replace(/^(https?:\/\/)?(www\.)?/, "") + "]: " + msg);
      }
    }
}

function getHomeSections() {
    return JSON.stringify([
       {
            "slug": "/hoan-thanh",
            "title": "Phim Hoàn Thành",
            "type": "Horizontal"
        },
       {
            "slug": "/most-viewed",
            "title": "Phim Xem Nhiều",
            "type": "Horizontal"
        },
        {
            "slug": "/the-loai/tu-tien",
            "title": "Tu Tiên",
            "type": "Horizontal"
        },
        {
            "slug": "/the-loai/do-thi",
            "title": "Đô thị",
            "type": "Horizontal"
        },
        {
            "slug": "/moi-cap-nhat/",
            "title": "Phim Mới",
            "type": "Grid"
        }
    ]);
}

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
        var menulist = buildMenu(listurl, "filter");
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
function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) {
            log("getUrlList[url]: \n" + slug);
            return slug;
        }

        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson2 = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
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
            } catch (jsonErr) {}
        }

        var resultUrl = BASEURL;
        if (path) {
            resultUrl += path;
        }
        if (page > 1) {
            resultUrl += "/page/" + page;
        }
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + finalUrl);
        return finalUrl;
    } catch (e) {
        log("getUrlList[err]:\n " + e);
        if (slug && slug.indexOf("http") > -1) {
            log("getUrlList[url]: \n" + slug);
            return slug;
        }
        var fallback = BASEURL + (slug ? "/" + slug : "");
        var finalFallback = fallback.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + finalFallback);
        return finalFallback;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var resUrl = "";
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                var page = parseInt(filters.page) || 1;
                if (page > 1) {
                    resUrl = BASEURL + "/page/" + page + "?s=" + encodeURIComponent(keyword);
                } else {
                    resUrl = BASEURL + "?s=" + encodeURIComponent(keyword);
                }
            } catch (jsonErr) {
                resUrl = BASEURL + "?s=" + encodeURIComponent(keyword);
            }
        } else {
            resUrl = BASEURL + "?s=" + encodeURIComponent(keyword);
        }
        log("getUrlSearch[url]: \n" + resUrl);
        return resUrl;
    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        var fallbackUrl = BASEURL + "?s=" + encodeURIComponent(keyword || "");
        log("getUrlSearch[url]: \n" + fallbackUrl);
        return fallbackUrl;
    }
}

function getUrlDetail(slug) {
    try {
        if (!slug) {
            log("getUrlDetail[url]: \n");
            return "";
        }
        if (slug.indexOf('http') === 0) {
            log("getUrlDetail[url]: \n" + slug);
            return slug;
        }
        var resUrl = BASEURL + "/" + slug;
        log("getUrlDetail[url]: \n" + resUrl);
        return resUrl;
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
        log("getUrlCountries[url]: \n");
        return "";
    } catch (e) {
        log("getUrlCountries[err]:\n " + e);
        return "";
    }
}

function getUrlYears() {
    try {
        log("getUrlYears[url]: \n");
        return "";
    } catch (e) {
        log("getUrlYears[err]:\n " + e);
        return "";
    }
}

// =============================================================================
// PARSERS
// =============================================================================

function fixHref(href) {
    try {
        if (!href) return '';

        // 1. Loại bỏ khoảng trắng thừa ở đầu và cuối
        let cleanHref = href.trim();

        // 2. Các mẫu đường dẫn cần bỏ qua (không gắn thêm BASEURL)
        const ignorePattern = /^(#|https?:\/\/|\/\/|mailto:|tel:|javascript:|data:|blob:)/i;

        if (ignorePattern.test(cleanHref)) {
            return cleanHref;
        }

        // 3. Xử lý trường hợp đường dẫn bắt đầu bằng dấu / (server-relative path)
        if (cleanHref.startsWith('/')) {
            try {
                const urlObj = new URL(BASEURL);
                return urlObj.origin + cleanHref;
            } catch (e) {
                return BASEURL + cleanHref;
            }
        }

        // 4. Đường dẫn tương đối thông thường
        return BASEURL + cleanHref;
    } catch (e) {
        log("fixHref[err]:\n " + e);
        return href || '';
    }
}

function isValidMediaUrl(url) {
    try {
        if (!url || typeof url !== 'string') return false;

        var cleanUrl = url.trim();

        // 1. Loại bỏ nếu dính chuỗi nối code JS, biến hoặc hàm (như _spEsc, +, ', ${...)
        if (cleanUrl.indexOf('_spEsc') > -1 ||
            cleanUrl.indexOf("'+") > -1 ||
            cleanUrl.indexOf("+'") > -1 ||
            cleanUrl.indexOf("${") > -1 ||
            cleanUrl.indexOf("javascript:") > -1) {
            return false;
        }

        // 2. Kiểm tra định dạng URL http/https hợp lệ (không chứa khoảng trắng, ngoặc đơn/kép, dấu +)
        var httpPattern = /^https?:\/\/[^\s"'<>+]+$/i;
        return httpPattern.test(cleanUrl);
    } catch (e) {
        log("isValidMediaUrl[err]:\n " + e);
        return false;
    }
}

function parseListResponse(html, $url) {
    try {
        var items = [];
        var $doc = _$(html);
        $doc.find("article").each(function() {
            var href = this.find("a").attr("href");
            href = fixHref(href);
            var title = this.find("a").attr("title");
            var src = this.find("img").attr("src");
            src = fixHref(src);

            var episode_current = this.find(".status").text().trim();
            var quality = this.find(".mc__score").text().trim();

            if (isValidMediaUrl(href)) {
                var cleanThumb = (src || "").replace(/&amp;/g, '&').trim();

                // Đảm bảo cleanThumb cũng là link ảnh hợp lệ, nếu không có thì fallback
                if (cleanThumb && cleanThumb.indexOf('http') !== 0) {
                    cleanThumb = 'https:' + cleanThumb;
                }

                items.push({
                    "id": href.trim(),
                    "title": (title || "").trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality || "",
                    "lang": "",
                    "episode_current": episode_current || ""
                });
            }
        });

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 999
            }
        });
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

function parseSearchResponse(html, url) {
    try {
        return parseListResponse(html, url);
    } catch (e) {
        log("parseSearchResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function parseMovieDetail(html, url) {
    try {
        // === BƯỚC 1: ĐỒNG NHẤT ID PHIM BẰNG REGEX META (Y hệt tác giả) ===
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        var id = idMatch ? idMatch[1] : (url || "");
        var $doc = _$(html);
        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/_.]+)/.exec(html);
            slug = slugMatch2 ? slugMatch2[1] : "";
        }

        // === BƯỚC 2: TRÍCH XUẤT THÔNG TIN PHIM ===
        var lurl = "";
        var limg = "";
        var lname = "Đang cập nhật...";
        var ldes = "Không có mô tả.";
        var ldirec = "";
        var lactor = "";
        var lduran = "";
        var status = "";
        var category = "";
        var episode_current = "";
        var rating = 5;
        var rmatch = html.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lurl = rmatch[1];

        rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];

        if (limg.indexOf("//") === 0) {
            limg = "https:" + limg;
        } else if (limg.indexOf("http") === -1) {
            limg = BASEURL + limg;
        }
        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];

        var ldes = $doc.find(".video-item").find("article").text();
        var year = 2026;
        var extra = "";

        status = $doc.find(".hh3d-info").find("span").parent().text(" - ");

        var categoryResult = [];
        $doc.find(".list_cate").find("a").each(function() {
            var link = this.attr("href") || this.find("a").attr("href");
            var name = this.text().replace(/\s+/g, ' ').trim();

            if (name && link) {
                var slug = typeof getSlug === 'function' ? getSlug(link) : link;
                slug = slug.replace(BASEURL, "");
                categoryResult.push("[" + name + "](" + slug + ")");
            }
        });

        category = categoryResult.join(", ");
        episode_current = $doc.find("span.new-ep").text();

        var servers = [];

        $doc.find("#halim-list-server").find(".halim-server").each(function() {
            var $namesv = this.find(".halim-server-name").text();
            var items = [];
            this.find(".halim-list-eps").each(function() {
                this.find("a").each(function() {
                    var id = this.attr("href");
                    var name = this.attr("title");
                    var slug = this.attr("data-ep");
                    items.push({
                        id: id,
                        name: name,
                        slug: slug
                    });
                });
            });
            servers.push({
                name: $namesv,
                episodes: items
            });
        });
        servers = sortEpisodesByName(servers);

        // === BƯỚC 5: TRẢ VỀ KẾT QUẢ ĐỒNG NHẤT ID ===
        return JSON.stringify({
            id: id,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "HD",
            year: year,
            rating: rating,
            status: status,
            category: category,
            episode_current: episode_current,
            servers: servers,
            duration: lduran || "",
            casts: lactor || "",
            director: ldirec || "",
            datasend: lname,
            extra: extra
        });

    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: slug || url || "error",
            title: "error",
            servers: []
        });
    }
}

function sortEpisodesByName(data) {
    try {
        if (!Array.isArray(data)) return data;

        data.forEach(function(server) {
            if (server.episodes && Array.isArray(server.episodes)) {
                server.episodes.sort(function(a, b) {
                    var nameA = a.name || '';
                    var nameB = b.name || '';

                    var matchA = nameA.match(/\d+(\.\d+)?/);
                    var matchB = nameB.match(/\d+(\.\d+)?/);

                    var numA = matchA ? parseFloat(matchA[0]) : null;
                    var numB = matchB ? parseFloat(matchB[0]) : null;

                    if (numA !== null && numB !== null) {
                        if (numA !== numB) {
                            return numA - numB;
                        }
                    }

                    if (numA !== null) return -1;
                    if (numB !== null) return 1;

                    return nameA.localeCompare(nameB, undefined, {
                        numeric: true,
                        sensitivity: 'base'
                    });
                });
            }
        });

        return data;
    } catch (e) {
        log("sortEpisodesByName[err]:\n " + e);
        return data;
    }
}
function checkRaw(scriptStr, returnFixed) {
  try {
    if (!scriptStr || typeof scriptStr !== 'string') {
      console.log("[Lỗi escape runJS]\r\n\t Dữ liệu đầu vào không phải là chuỗi hợp lệ!");
      return scriptStr || "";
    }

    var lines = scriptStr.split('\n');
    var fixedLines = [];
    var hasError = false;

    for (var i = 0; i < lines.length; i++) {
      var currentLine = lines[i];
      var lineNum = i + 1;
      var lineErrorFound = false;

      // 1. Kiểm tra lỗi escape newline/tab nguy hiểm nằm trần trong chuỗi quote
      // Trường hợp chưa được escape dạng '\\n' hoặc '\\t' trong chuỗi ghép
      if (/([^\\]|^)(\r\n|\r|\n)/.test(currentLine)) {
        console.log("[Lỗi escape runJS]\r\n\t Phát hiện xuống dòng chưa escape ở Dòng " + lineNum + ": " + currentLine.trim());
        lineErrorFound = true;
      }

      // 2. Kiểm tra lỗi quên escape ký tự Tab trần không hợp lệ
      if (/\t/.test(currentLine) && !/\\t/.test(currentLine)) {
        console.log("[Lỗi escape runJS]\r\n\t Phát hiện ký tự Tab trần ở Dòng " + lineNum + ": " + currentLine.trim());
        lineErrorFound = true;
      }

      // 3. Kiểm tra dấu xược ngược single trailing backlash ở cuối dòng (dễ làm gãy chuỗi)
      if (/([^\\])\\$/.test(currentLine)) {
        console.log("[Lỗi escape runJS]\r\n\t Dấu Backslash (\\) cô đơn ở cuối Dòng " + lineNum + ": " + currentLine.trim());
        lineErrorFound = true;
      }

      if (lineErrorFound) {
        hasError = true;
      }

      // Tiến hành SỬA LỖI tự động nếu tham số returnFixed = true
      var fixedLine = currentLine;
      if (returnFixed) {
        // Chuẩn hóa ký tự xuống dòng và tab đặc biệt
        fixedLine = fixedLine
          .replace(/\r/g, "")
          .replace(/\t/g, "  "); // Thay Tab trần bằng 2 khoảng trắng cho an toàn
      }

      fixedLines.push(fixedLine);
    }

    // 4. Kiểm tra cú pháp nhanh xem toàn bộ chuỗi có parse được JS không
    try {
      new Function(scriptStr);
    } catch (syntaxErr) {
      hasError = true;
      console.log("[Lỗi escape runJS]\r\n\t 💥 LỖI CÚ PHÁP (SyntaxError) toàn cục: " + syntaxErr.message);
    }

    if (!hasError) {
      console.log("[checkRaw] 🟢 Chuỗi Raw JS hoàn toàn sạch lỗi!");
    }

    // Trả về bản đã fix hoặc bản gốc theo tham số returnFixed
    return returnFixed ? fixedLines.join('\n') : scriptStr;

  } catch (e) {
    console.log("[Lỗi escape runJS]\r\n\t Lỗi ngoại lệ trong hàm checkRaw: " + e.message);
    return scriptStr; // Luôn an toàn: Fallback trả về chuỗi gốc chứ không làm sập script
  }
}

function parseDetailResponse(html, pageUrl, datasend) {
    console.log("parseDetail:\n" + pageUrl)
    try {
        var $doc = _$(html);
        var currentlink = $doc.find("meta[property='og:url']").attr("content");
        var matchC = currentlink.match(/sv(\d+)/i);
        var currentserver = 1;
        var currenttap = 1;
        var matchA = currentlink.match(/(tap-\d+)/i);
        if (matchC && matchC[1]) {
            currentserver = matchC[1];
        }
        if (matchA && matchA[1]) {
            currenttap = matchA[1];
        }
        if(currentlink.indexOf("-full") > -1){
          currenttap = "tap-full";
        }
        var currentid = $doc.find("#main-contents").attr("data-id");
        var typecurrent = $doc.find("#halim-ajax-list-server").find("span:first").attr("data-type");
        var framelink = `https://hhpanda.st/player/player.php?action=dox_ajax_player&post_id=${currentid}&chapter_st=${currenttap}&type=${typecurrent}&sv=${currentserver}`;
        var $dataSv = {};
        $dataSv.movieid = currentid;
        $dataSv.serverhientai = currentserver;
        $dataSv.hqhientai = typecurrent;
        $dataSv.taphientai = currenttap;

        var servers = [];
        $doc.find(".halim-server").each(function() {
            var $namesv = this.find(".halim-server-name").text();
            var items = [];
            var type = 1;
            var maxEpi = 1;
            maxEpi = this.find(".halim-episode").find("a").length;

            this.find(".halim-episode").each(function() {
                type = this.find("a:first").attr("data-sv");
            });

            servers.push({
                name: $namesv,
                type: type,
                maxEpi: maxEpi
            });
        });
        $dataSv.servers = servers;
        $dataSv.name = datasend;
        console.log("datasend: " + datasend)
        var serverHQ = [];
        $doc.find("#halim-ajax-list-server").find("span").each(function() {
            var name = this.text();
            var type = this.attr("data-type");
            serverHQ.push({
                nname: name,
                type: type
            });
        });
        $dataSv.HQ = serverHQ;

        var bypassJs = checkRaw(customJS($dataSv),true);
        console.log("parseDetailResponse[url]: \n" + framelink + "\ndataSv:\n" + JSON.stringify($dataSv));
        
        var $return = JSON.stringify({
            url: framelink,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": pageUrl,
                "Block-Ads": false,
                "Custom-Js": bypassJs
            },
            subtitles: []
        });
     // console.log("Return Data:\n" + $return)
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

/*

BASEURL = "https://animehay09.site";
var html = sourceHTML;
//JSON.parse(parseDetailResponse(sourceHTML, BASEURL))
JSON.parse(parseEmbedResponse(sourceHTML, BASEURL))
// 'AHS': 'https://ahay.stream/embed-jw/75913'

*/
function customJS(config) {
    const configStr = JSON.stringify(config);

    return `
(function() {
    const IS_IN_IFRAME = (window.self !== window.top);
    const CONFIG = ${configStr};

    // ==========================================
    // 0. LOGGER MODULE
    // ==========================================
    const LoggerModule = {
        log: function(msg, showToast = true) {
            console.log(msg);
            if (IS_IN_IFRAME) {
                try {
                    window.top.postMessage({ type: 'PHIMHDCS_CROSS_LOG', msg: msg, showToast: showToast }, '*');
                } catch(e) {}
            } else {
                try {
                    if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
                        window.SnifferBridge.log(msg);
                    }
                } catch (e) {}
                if (showToast) this.showToast(msg);
            }
        },
        showToast: function(msg) {
            if (IS_IN_IFRAME || !document.body) return;
            let container = document.getElementById('v-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'v-toast-container';
                container.style.cssText = 'position: fixed; bottom: 20px; left: 20px; z-index: 9999999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
                document.body.appendChild(container);
            }

            const toastItem = document.createElement('div');
            toastItem.style.cssText = 'background: rgba(15, 15, 15, 0.9); color: #fff; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; border-left: 4px solid #e50914; opacity: 1; transition: all 0.25s ease;';
            toastItem.textContent = msg;
            container.appendChild(toastItem);

            setTimeout(() => {
                toastItem.style.opacity = '0';
                setTimeout(() => { if (toastItem.parentNode) toastItem.parentNode.removeChild(toastItem); }, 300);
            }, 4000);
        }
    };

    // ==========================================
    // 1. LỚP 2 (IFRAME PLAYER)
    // ==========================================
    if (IS_IN_IFRAME) {
        const style = document.createElement('style');
        style.textContent = 'html, body { width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: #000 !important; } .jwplayer, #player, video, iframe { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; object-fit: contain !important; }';
        (document.head || document.documentElement).appendChild(style);

        // HÀM KÍCH HOẠT FULLSCREEN
        function triggerFullScreen() {
            const el = document.documentElement || document.body;
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(() => {});
            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen().catch(() => {});
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen().catch(() => {});
            } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen().catch(() => {});
            }
        }

        // KIỂM SOÁT JWPLAYER & ÉP PLAY / FULLSCREEN KHI PLAY
        let isFullScreenTriggered = false;
        let playerCheckInterval = setInterval(() => {
            try {
                if (typeof window.jwplayer === 'function') {
                    const playerInstance = window.jwplayer();
                    if (playerInstance && typeof playerInstance.getState === 'function') {
                        const state = playerInstance.getState();
                        
                        // Nếu chưa play hoặc đang dừng, ép Play
                        if (state === 'paused' || state === 'idle') {
                            playerInstance.play(true);
                        }

                        // Khi phát hiện video đang phát ngon lành -> bật Fullscreen
                        if (state === 'playing' && !isFullScreenTriggered) {
                            isFullScreenTriggered = true;
                            triggerFullScreen();
                        }

                        // Đăng ký listener sự kiện play của jwplayer
                        playerInstance.on('play', function() {
                            if (!isFullScreenTriggered) {
                                isFullScreenTriggered = true;
                                triggerFullScreen();
                            }
                        });

                        // Giữ trạng thái luôn play nếu bị pause ngoài ý muốn trong 1 phút đầu
                        playerInstance.on('pause', function() {
                            playerInstance.play(true);
                        });
                        
                        clearInterval(playerCheckInterval);
                    }
                }
            } catch(e) {}
        }, 1000);

        // Tự động dừng check sau 60 giây
        setTimeout(() => { clearInterval(playerCheckInterval); }, 10000);

        window.addEventListener('keydown', function(e) {
            if (e.keyCode === 33) { e.preventDefault(); window.top.postMessage({ type: 'PHIMHDCS_CHANGE_EP', dir: -1 }, '*'); }
            if (e.keyCode === 34) { e.preventDefault(); window.top.postMessage({ type: 'PHIMHDCS_CHANGE_EP', dir: 1 }, '*'); }
            if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 8) { e.preventDefault(); window.top.postMessage({ type: 'PHIMHDCS_FOCUS_HOST', dir: (e.keyCode === 38 ? 'UP' : 'DOWN') }, '*'); }
        }, true);

        return;
    }

    // ==========================================
    // 2. LỚP 1 (TRANG MẸ - HOST PAGE)
    // ==========================================
    function initPhimHDCS(oldIframe) {
        if (window.__PHIMHDCS_INITED__) return;
        window.__PHIMHDCS_INITED__ = true;

        // Bơm CSS UI
        const style = document.createElement('style');
        style.textContent = \`
            html, body { overflow: hidden !important; margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; background: #000 !important; }
            #v-player-wrapper { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; background-color: #000; z-index: 999; }
            .v-styled-iframe { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; border: none !important; }
            
            /* Lớp bọc UI để hỗ trợ hiệu ứng ẩn/hiện tự động */
            #v-ui-layer { transition: opacity 0.3s ease; opacity: 1; pointer-events: auto; }
            #v-ui-layer.v-hidden { opacity: 0 !important; pointer-events: none !important; }

            #v-title-badge { position: absolute; top: 12px; left: 12px; z-index: 9999; background: rgba(0,0,0,0.8); color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 14px; font-weight: bold; }
            #v-control-bar { position: absolute; top: 12px; right: 12px; z-index: 9999; display: flex; gap: 8px; background: rgba(0,0,0,0.8); padding: 6px 12px; border-radius: 6px; }
            .v-nav-btn { position: absolute; top: 50%; z-index: 9999; transform: translateY(-50%); background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.2); width: 46px; height: 46px; border-radius: 50%; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .v-nav-btn:hover, .v-btn:hover, .v-grid-item:hover, .v-btn:focus, .v-grid-item:focus { background: #e50914 !important; border-color: #fff !important; }
            #v-prev-ep { left: 2%; } #v-next-ep { right: 2%; }
            .v-btn { background: #2a2a2a; color: #fff; border: 1px solid #444; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: bold; }
            #v-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100000; display: none; align-items: center; justify-content: center; }
            .v-dialog { background: #181818; border: 1px solid #333; border-radius: 8px; width: 90%; max-width: 520px; max-height: 80vh; padding: 16px; display: none; flex-direction: column; color: #fff; }
            .v-dialog-header { font-size: 16px; font-weight: bold; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 8px; }
            .v-grid { display: flex; flex-wrap: wrap; gap: 10px; overflow-y: auto; max-height: 60vh; padding: 4px; }
            .v-grid-item { padding: 8px 16px; border-radius: 6px; text-align: center; font-weight: bold; cursor: pointer; background: #2a2a2a; color: #fff; font-size: 13px; border: 1px solid #444; }
            .v-grid-item.active { background: #e50914 !important; }
        \`;
        document.head.appendChild(style);

        let currentTapNum = parseInt(String(CONFIG.taphientai || 1).replace(/[^0-9]/g, ''), 10) || 1;
        let currentServerIndex = CONFIG.servers ? (parseInt(CONFIG.serverhientai || 1, 10) - 1) : 0;
        if (currentServerIndex < 0) currentServerIndex = 0;

        const movieName = CONFIG.name || "Đang xem phim";
        let currentIframe = oldIframe;

        const wrapper = document.createElement("div");
        wrapper.id = "v-player-wrapper";
        oldIframe.parentNode.insertBefore(wrapper, oldIframe);
        wrapper.appendChild(oldIframe);

        currentIframe.id = "v-main-frame";
        currentIframe.classList.add("v-styled-iframe");
        currentIframe.setAttribute("scrolling", "no");

        const getCleanSvName = (idx) => {
            if (!CONFIG.servers || !CONFIG.servers[idx]) return "Server " + (idx + 1);
            let name = CONFIG.servers[idx].name || CONFIG.servers[idx].title || ("Server " + (idx + 1));
            return name.replace(/^#/, '').replace(/:$/, '').trim();
        };

        // BỌC CÁC PHẦN TỬ CONTROL TRONG THẺ #v-ui-layer
        const uiControls = document.createElement("div");
        uiControls.id = "v-ui-layer";
        uiControls.innerHTML = \`
            <div id="v-title-badge">\${movieName} - Tập \${currentTapNum} (\${getCleanSvName(currentServerIndex)})</div>
            <div id="v-control-bar">
                <button class="v-btn" id="v-remote-detail" title="Tự động đổi Server">Chi tiết 🔄</button>
                <button class="v-btn" id="v-server-trigger">\${getCleanSvName(currentServerIndex)} ▼</button>
                <button class="v-btn" id="v-ep-trigger">Tập \${currentTapNum} ▼</button>
            </div>
            <button class="v-nav-btn" id="v-prev-ep">❮</button>
            <button class="v-nav-btn" id="v-next-ep">❯</button>

            <div id="v-modal-overlay">
                <div class="v-dialog" id="v-dialog-ep">
                    <div class="v-dialog-header"><span>Danh Sách Tập</span><button class="v-btn" id="v-close-ep">✕</button></div>
                    <div class="v-grid" id="v-grid-ep"></div>
                </div>

                <div class="v-dialog" id="v-dialog-sv">
                    <div class="v-dialog-header"><span>Chọn Server</span><button class="v-btn" id="v-close-sv">✕</button></div>
                    <div class="v-grid" id="v-grid-sv"></div>
                </div>
            </div>
        \`;
        wrapper.appendChild(uiControls);

        // ==========================================
        // QUẢN LÝ TỰ ĐỘNG ẨN/HIỆN UI SAU 10 GiÂY
        // ==========================================
        let uiHideTimeout = null;
        const uiLayer = document.getElementById("v-ui-layer");
        const overlay = document.getElementById("v-modal-overlay");

        function resetUiTimeout() {
            uiLayer.classList.remove("v-hidden");
            clearTimeout(uiHideTimeout);
            uiHideTimeout = setTimeout(() => {
                // Không ẩn UI nếu bảng Modal đang mở
                if (overlay.style.display !== "flex") {
                    uiLayer.classList.add("v-hidden");
                }
            }, 10000);
        }

        // Bắt sự kiện tương tác để hiện UI và tính lại 10s
        ['mousemove', 'touchstart', 'click', 'keydown'].forEach(evtType => {
            window.addEventListener(evtType, resetUiTimeout, { passive: true });
        });
        resetUiTimeout();

        function updateTitleBadge() {
            const svName = getCleanSvName(currentServerIndex);
            document.getElementById("v-title-badge").textContent = \`\${movieName} - Tập \${currentTapNum} (\${svName})\`;
            document.getElementById("v-ep-trigger").textContent = \`Tập \${currentTapNum} ▼\`;
            document.getElementById("v-server-trigger").textContent = \`\${svName} ▼\`;
        }

        const dialogEp = document.getElementById("v-dialog-ep");
        const dialogSv = document.getElementById("v-dialog-sv");

        function openModal(type) {
            overlay.style.display = "flex";
            if (type === "ep") {
                renderEpList();
                dialogEp.style.display = "flex";
                dialogSv.style.display = "none";
            } else {
                renderSvList();
                dialogSv.style.display = "flex";
                dialogEp.style.display = "none";
            }
        }

        function closeModal() {
            overlay.style.display = "none";
            dialogEp.style.display = "none";
            dialogSv.style.display = "none";
            resetUiTimeout();
        }

        function renderEpList() {
            const grid = document.getElementById("v-grid-ep");
            grid.innerHTML = "";
            let maxEpi = (CONFIG.servers && CONFIG.servers[currentServerIndex] && CONFIG.servers[currentServerIndex].maxEpi) ? parseInt(CONFIG.servers[currentServerIndex].maxEpi, 10) : 40;

            for (let i = 1; i <= maxEpi; i++) {
                const item = document.createElement("div");
                item.className = "v-grid-item" + (i === currentTapNum ? " active" : "");
                item.textContent = "Tập " + i;
                item.onclick = () => { closeModal(); changeEpisode(i); };
                grid.appendChild(item);
            }
        }

        function renderSvList() {
            const grid = document.getElementById("v-grid-sv");
            grid.innerHTML = "";
            if (!CONFIG.servers) return;

            CONFIG.servers.forEach((sv, idx) => {
                const item = document.createElement("div");
                item.className = "v-grid-item" + (idx === currentServerIndex ? " active" : "");
                item.textContent = getCleanSvName(idx);
                item.onclick = () => { closeModal(); changeServer(idx); };
                grid.appendChild(item);
            });
        }

        document.getElementById("v-ep-trigger").onclick = () => openModal("ep");
        document.getElementById("v-server-trigger").onclick = () => openModal("sv");
        document.getElementById("v-close-ep").onclick = closeModal;
        document.getElementById("v-close-sv").onclick = closeModal;

        // XỬ LÝ SỰ KIỆN NÚT REMOTE DETAIL
        document.getElementById("v-remote-detail").onclick = () => {
            if (!CONFIG.servers || CONFIG.servers.length <= 1) {
                LoggerModule.log('⚠️ Không có server khác để chuyển đổi!');
                return;
            }
            let nextServerIndex = (currentServerIndex + 1) % CONFIG.servers.length;
            changeServer(nextServerIndex);
        };

        // HÀM TẠO URL PLAYER CHUẨN API HHPANDA
        function buildPlayerUrl(targetEp, svIndex) {
            let postId = CONFIG.movieid || CONFIG.post_id || CONFIG.id || "";
            let typeQuality = CONFIG.hqhientai || "pro";
            
            let svVal = (svIndex + 1);
            if (CONFIG.servers && CONFIG.servers[svIndex]) {
                svVal = CONFIG.servers[svIndex].sv || CONFIG.servers[svIndex].type || (svIndex + 1);
            }

            return \`https://hhpanda.st/player/player.php?action=dox_ajax_player&post_id=\${postId}&chapter_st=tap-\${targetEp}&type=\${typeQuality}&sv=\${svVal}\`;
        }

        // CHUYỂN TẬP
        function changeEpisode(targetEp) {
            currentTapNum = targetEp;
            updateTitleBadge();

            let newUrl = buildPlayerUrl(currentTapNum, currentServerIndex);
            LoggerModule.log('⏭️ Đổi Tập ' + targetEp);
            currentIframe.src = newUrl;
        }

        // CHUYỂN SERVER
        function changeServer(svIndex) {
            if (!CONFIG.servers || !CONFIG.servers[svIndex]) return;
            currentServerIndex = svIndex;
            updateTitleBadge();

            let newUrl = buildPlayerUrl(currentTapNum, currentServerIndex);
            LoggerModule.log('🔄 [Remote Detail] Đang đổi sang Server: ' + getCleanSvName(svIndex));
            currentIframe.src = newUrl;
        }

        document.getElementById("v-prev-ep").onclick = () => changeEpisode(currentTapNum - 1);
        document.getElementById("v-next-ep").onclick = () => changeEpisode(currentTapNum + 1);

        window.addEventListener('message', function(event) {
            if (!event.data) return;
            if (event.data.type === 'PHIMHDCS_CROSS_LOG') {
                LoggerModule.log(event.data.msg, event.data.showToast);
            } else if (event.data.type === 'PHIMHDCS_CHANGE_EP') {
                changeEpisode(currentTapNum + event.data.dir);
            }
        });
    }

    function findAndWrapIframe() {
        const existingIframe = document.querySelector('iframe');
        if (existingIframe) {
            initPhimHDCS(existingIframe);
            return;
        }
        const observer = new MutationObserver((mutations, obs) => {
            const iframeFound = document.querySelector('iframe');
            if (iframeFound) {
                obs.disconnect();
                initPhimHDCS(iframeFound);
            }
        });
        observer.observe(document.documentElement || document, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', findAndWrapIframe, { once: true });
    } else {
        findAndWrapIframe();
    }
})();
    `;
}








function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// https://hhpanda.st/moi-cap-nhat/page/3
// {\"link\":\"/moi-cap-nhat/\",\"name\":\"Phim Mới\"},
function getLISTmenu() {
    return `[{\"link\":\"/moi-cap-nhat/\",\"name\":\"Phim Mới\"},{\"link\":\"/the-loai/tu-tien\",\"name\":\"Tu Tiên\"},{\"link\":\"/the-loai/kiem-hiep\",\"name\":\"Kiếm Hiệp\"},{\"link\":\"/the-loai/co-trang\",\"name\":\"Cổ Trang\"},{\"link\":\"/the-loai/huyen-huyen\",\"name\":\"Huyền Huyễn\"},{\"link\":\"/the-loai/khoa-huyen\",\"name\":\"Khoa Huyễn\"},{\"link\":\"/the-loai/ky-ao\",\"name\":\"Kỳ Ảo\"},{\"link\":\"/the-loai/huyen-nghi\",\"name\":\"Huyền Nghi\"},{\"link\":\"/the-loai/canh-ky\",\"name\":\"Cạnh Kỹ\"},{\"link\":\"/the-loai/da-su\",\"name\":\"Dã Sử\"},{\"link\":\"/the-loai/do-thi\",\"name\":\"Đô Thị\"},{\"link\":\"/the-loai/dong-nhan\",\"name\":\"Đồng Nhân\"}]`  
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
        } else if(typeStr === "filter"){
          	menuItem = { "value": link, "name": name}; 
        }
        
        else { 
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

// https://bilutv.asia
//BASEURL = "http://vkey.vn/yanhh3d";
BASEURL = "https://yanhh3d.mom";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>"

function getManifest() {
    return JSON.stringify({
        "id": "yanhh3d",
        "name": "Yanhh3d",
        "description": "Trang xem phim Hoạt Hình siêu hay.",
        "info": "",
        "version": "1.3.8",
        "baseUrl": BASEURL,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/yanhh3d.png",
        "isEnabled": true,
        "layoutType": "HORIZONTAL",
        "author": "Alokillgtv",
        popup_html: popup_html,
        "type": "ANIME",
        "playerType": "embedtoexoplay"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog(msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log(msg);
    }
}

// https://yanhh3d.ac/moi-cap-nhat?page=2
// https://yanhh3d.ac/moi-cap-nhat?page=2
function getHomeSections() {
    try {
        var listurl = `
/hoan-thanh@@Full Bộ@@false
/hoat-hinh-2d@@Hoạt Hình 2D@@false
/hoat-hinh-3d@@Hoạt Hình 3D@@false
/moi-cap-nhat@@Phim Mới@@true
`;
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        log("getHomeSections[err]:\n " + e);
        return JSON.stringify([]);
    }
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

// ĐÃ SỬA: Lỗi cú pháp khai báo biến trong JSON.stringify
function getFilterConfig() {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify({
            category: menulist
        });
    } catch (e) {
        log("getFilterConfig[err]:\n " + e);
        return JSON.stringify({
            category: []
        });
    }
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        log("getUrlList[url]: \n" + slug);

        // 1. Kiểm tra nếu slug là link tuyệt đối (chứa http) và không có bộ lọc thì trả về luôn
        if ((slug && slug.indexOf("http") > -1) || (slug && slug.indexOf("search") > -1)) {
            // thường là link search sẽ bị trả về ở đây
            return slug;
        }
        let page = 1;
        let path = slug || "";

        // 2. Xử lý an toàn filtersJson nếu có truyền vào
        if (filtersJson) {
            // Nếu có số trang hoặc có menu categ
            // Sửa lỗi nếu JSON thiếu dấu ngoặc kép ở key hoặc sai cú pháp cơ bản
            let fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                let filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;

                // Nếu có category trong JSON, ưu tiên lấy category làm đường dẫn (path)
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        // 5. Nối chuỗi URL kết quả
        let resultUrl = BASEURL;
        if (path) {
            resultUrl += path;
        }

        if (page > 1) {
            resultUrl += "?page=" + page;
        }

        // Trả về kết quả, chỉ gộp dấu // ở phần path, giữ nguyên https://
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        log("getUrlList[err]:\n " + e);
        // Trả về URL gốc an toàn nếu có lỗi
        let fallback = BASEURL + (slug ? "/" + slug : "");
        var resFallback = fallback.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + resFallback);
        return resFallback;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        var path = "";

        // 2. Xử lý an toàn filtersJson nếu có truyền vào
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}

            if (page > 1) {
                var resUrlPage = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword) + "&page=" + page;
                log("getUrlSearch[url]: \n" + resUrlPage);
                return resUrlPage;
            }
        }
        var resUrl = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword);
        log("getUrlSearch[url]: \n" + resUrl);
        return resUrl;

    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        var fallbackUrl = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword || "");
        log("getUrlSearch[url]: \n" + fallbackUrl);
        return fallbackUrl;
    }
}

function getUrlDetail(slug) {
    try {
        log("getUrlDetail[url]: \n" + slug);
        if (!slug) return "";
        if (slug.indexOf('http') === 0) return slug;
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

        _$(html).find(".flw-item").each(function() {
            var year = "";
            var lang = "";
            var current = this.find(".tick-rate").text();
            var href = this.find("a").attr("href");
            var quality = this.find(".tick-dub").text();
            var title = this.find("a").attr("title");
            var src = this.find("img").attr("src");
            if (src.indexOf("http") == -1) {
                src = BASEURL + src;
            }

            if (href && href.indexOf("http") > -1) {
                var cleanThumb = src.replace(/&amp;/g, '&');

                items.push({
                    "id": href,
                    "title": title.trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality,
                    "episode_current": current
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
                "id": $url,
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

function parseSearchResponse(html) {
    try {
        return parseListResponse(html);
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

function parseMovieDetail(htmlContent, url) {
    try {
        log("parseMovieDetail[url]: \n" + url);

        // === BƯỚC 1: ĐỒNG NHẤT ID PHIM BẰNG REGEX META (Y hệt tác giả) ===
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
        var id = idMatch ? idMatch[1] : (url || "");

        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/_.]+)/.exec(htmlContent);
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
        var year = "";

        var rmatch = htmlContent.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lurl = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="video:duration"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lduran = rmatch[1];

        status = _$(htmlContent).find("span:content('Trạng thái:')").next().text();
        year = _$(htmlContent).find("span:content('Năm:')").next().text();
        category = _$(htmlContent).find("span:content('Thể loại:')").parent().text(", ").replace('Thể loại:, ', '');
        episode_current = _$(htmlContent).find("span:content('Tập mới nhất:')").next().text();

        var servers = [];
        var $parent = _$(htmlContent).find('.detail-infor-content');
        var $child = $parent.find("li");
        $child.find("a").each(function() {
            var nameServer = this.text();
            var idserver = this.attr("href");
            var items = [];
            var items4k = [];
            $parent.find(idserver).find("a").each(function() {
                var name = this.find("div").text();
                var item = {
                    id: this.attr("href"),
                    name: name,
                    slug: "tap-" + name.replace(/\s/, "-")
                };
                items.push(item);

                var item4k = {
                    id: this.attr("href") + "?type=4k",
                    name: name,
                    slug: "tap-" + name.replace(/\s/, "-")
                };
                items4k.push(item4k);
            });
            servers.push({
                name: nameServer,
                episodes: items
            });
            servers.push({
                name: nameServer + " [4K]",
                episodes: items4k
            });
        });

        function getEpisodeNumber(name) {
            const match = name.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
        }

        // Duyệt qua từng server để sort mảng episodes bên trong
        servers.forEach(server => {
            if (server.episodes && Array.isArray(server.episodes)) {
                server.episodes.sort((a, b) => {
                    return getEpisodeNumber(a.name) - getEpisodeNumber(b.name);
                });
            }
        });

        var extra = "";
        var isPlayPage = /\/tap-/.test(id);

        if (!isPlayPage) {
            var playBtnMatch = _$(htmlContent).find(".film-buttons").find("a").attr("href");
            if (playBtnMatch) {
                extra = playBtnMatch;
            }
        }

        return JSON.stringify({
            id: id,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "HD",
            year: year,
            rating: 8.5,
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
            id: slug || url || "error",
            title: "error",
            servers: []
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        log("parseDetailResponse[url]: \n" + url);
        var allLink = [];
        _$(html).find('div[class*="list-severs"]').find("a").each(function() {
            var name = this.text();
            var link = this.attr("data-src");
            allLink.push({
                link: link,
                name: name
            });
        });

        let selectedLink = null;
        const pool = {
            k4: null,
            hd: null,
            anyM3u8: null,
            anyEmbed: null
        };
        allLink.forEach((item) => {
            if (item.name.match(/4k/i) && item.link.endsWith('.m3u8')) {
                pool.k4 = item.link;
            } else if (item.name.match(/1080/i) && item.link.endsWith('.m3u8')) {
                pool.hd = item.link;
            } else if (item.link.endsWith('.m3u8')) {
                pool.anyM3u8 = item.link;
            } else if (item.link.includes('abyss')) {
                pool.anyEmbed = item.link;
            }
        });

        selectedLink = pool.hd || pool.k4 || pool.anyM3u8 || pool.anyEmbed;
        if (url.indexOf("type=4k") > -1) {
            selectedLink = pool.k4 || pool.hd || pool.anyM3u8 || pool.anyEmbed;
            log("parseDetailResponse[url]: \nĐã chọn 4K: " + selectedLink);
        }

        var streamlink = selectedLink ? selectedLink.replace(/(https?:\/\/[^\/]+)\/[^]+?\/([^\/]+\.m3u8)$/, '$1/stream/m3u8/$2') : "";

        console.log("StreamLink\n" + streamlink)
        return JSON.stringify({
            "url": url,
            "isEmbed": false,
            "headers": {
                "Referer": "https://yanhh3d.mom",
                "Origin": "https://yanhh3d.mom",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Custom-Js": customJS(streamlink),
            }
        });

    } catch (e) {
        log("parseDetailResponse[err]:\n " + e);
        return JSON.stringify({
            "url": "",
            "headers": {}
        });
    }
}
/*
function parseEmbedResponse(html, url, datasend) {
  console.log("embed Raw:\n" + html)
  try {
      if(html.indexOf("html") > -1){
          console.log("Mở sniffer tìm link m3u8")
          return JSON.stringify({
              url: url,
              isEmbed: false,
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": BASEURL,
                "Origin": BASEURL
              },
              "Custom-Js": runJS(),
          });
      }
      else{
          console.log("parseEmbedResponse link m3u8 " + url);
            return JSON.stringify({
              url: url,
              mimeType: "application/x-mpegURL",
              isEmbed: false,
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": BASEURL,
                "Origin": BASEURL
              }
            });
      }
      
  } catch (e) {
    console.log("[Lỗi parseEmbedResponse]", e);
    return JSON.stringify({ url: "", isEmbed: false, headers: {} });
  }
}
*/

function customJS(initialLink) {
    return `
(function () {
    'use strict';

    // Biến trạng thái
    let baseM3u8Url = null;
    let hasSentToBridge = false;
    let fallbackTimer = null;

    // Lưu lại hàm fetch gốc ngay từ đầu để dùng nội bộ, tránh bị hook vòng lặp
    const rawFetch = window.fetch;
    const rawXHROpen = XMLHttpRequest.prototype.open;
    const rawSetAttribute = Element.prototype.setAttribute;

    // ==========================================
    // 1. HỆ THỐNG TOAST MINI
    // ==========================================
    function injectToastStyles() {
        if (document.getElementById('ts-toast-styles')) return;
        const style = document.createElement('style');
        style.id = 'ts-toast-styles';
        style.textContent = \`
            #ts-toast-container { position: fixed; top: 15px; right: 15px; z-index: 999999999; display: flex; flex-direction: column; gap: 8px; max-width: 420px; pointer-events: none; font-family: monospace; }
            .ts-toast { background: #1e1e2e; color: #cdd6f4; border-left: 4px solid #a6e3a1; padding: 10px 14px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); font-size: 11px; line-height: 1.4; pointer-events: auto; word-break: break-all; animation: tsSlideIn 0.25s ease-out, tsFadeOut 0.5s ease 9.5s forwards; }
            .ts-toast-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .ts-toast-title { font-weight: bold; color: #a6e3a1; }
            .ts-toast-time { font-size: 10px; color: #a6adc8; }
            .ts-toast-body { max-height: 120px; overflow-y: auto; white-space: pre-wrap; background: #11111b; padding: 6px; border-radius: 4px; }
            @keyframes tsSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes tsFadeOut { from { opacity: 1; } to { opacity: 0; } }
        \`;
        (document.head || document.documentElement).appendChild(style);
    }

    function showToast(title, content) {
        try {
            injectToastStyles();
            let container = document.getElementById('ts-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'ts-toast-container';
                (document.body || document.documentElement).appendChild(container);
            }
            const toast = document.createElement('div');
            toast.className = 'ts-toast';
            const timeStr = new Date().toLocaleTimeString();
            const contentFormatted = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
            toast.innerHTML = \`<div class="ts-toast-header"><span class="ts-toast-title">\${title}</span><span class="ts-toast-time">\${timeStr}</span></div><div class="ts-toast-body">\${contentFormatted}</div>\`;
            container.appendChild(toast);
            setTimeout(() => toast && toast.remove(), 10000);
        } catch (e) { console.error('Toast error:', e); }
    }

    // ==========================================
    // 2. LOGIC NATIVE BRIDGE & STREAM ANALYSIS
    // ==========================================

    function isTargetUrl(url) {
        if (!url || typeof url !== 'string') return false;
        return url.includes('.m3u8') || url.includes('.mpd');
    }

    function hasToken(url) {
        if (!url.includes('?')) return false;
        const queryString = url.split('?')[1] || '';
        return queryString.length > 15 || queryString.includes('token') || queryString.includes('oh=') || queryString.includes('bytestart');
    }

    function sendToNativeBridge(playUrl, isTokenUrl) {
        if (hasSentToBridge) return; // Tránh gửi đúp
        hasSentToBridge = true;
        
        if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }

        const pageUrl = window.location.href;
        if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
            try {
                window.SnifferBridge.play(playUrl, pageUrl);
                showToast(isTokenUrl ? '🚀 Gửi Native: Link Có Token' : '⚡ Gửi Native: Link Gốc Trực Tiếp', { playUrl, pageUrl });
            } catch (err) {
                showToast('❌ Lỗi SnifferBridge.play', err.message);
            }
        } else {
            showToast('⚠️ SnifferBridge Chưa Sẵn Sàng', \`Link: \${playUrl}\`);
        }
    }

    async function verifyAndProcessRawM3u8(url) {
        try {
            showToast('🔍 Đang fetch thử link gốc...', url);
            // Dùng rawFetch để không bị lặp vô hạn vào hook của chính mình
            const response = await rawFetch(url);
            
            if (response.ok) {
                const text = await response.text();
                // Kiểm tra xem file trả về có đúng chuẩn M3U8 không
                if (text.includes('#EXTM3U')) {
                    if (!hasSentToBridge) {
                        showToast('✅ Link gốc phát được ngay (Không cần token)', 'Gửi tới Native lập tức!');
                        sendToNativeBridge(url, false);
                    }
                    return;
                }
            }
            throw new Error(\`Status \${response.status} hoặc không phải M3U8 chuẩn.\`);
        } catch (error) {
            // Lỗi 403, 401 hoặc CORS -> Cần token
            showToast('⏳ Link gốc bị khóa. Bắt đầu chờ Iframe/Network lấy Token...', error.message);
            
            // Cài đặt hàng chờ 20s (nếu không lấy được token nào thì gửi tạm link gốc)
            if (!fallbackTimer && !hasSentToBridge) {
                fallbackTimer = setTimeout(() => {
                    if (!hasSentToBridge && baseM3u8Url) {
                        showToast('⏳ Hết 20s không thấy Token', 'Kích hoạt Fallback gửi link gốc.');
                        sendToNativeBridge(baseM3u8Url, false);
                    }
                }, 20000);
            }
        }
    }

    function processDetectedUrl(url) {
        if (!isTargetUrl(url)) return;
        if (hasSentToBridge) return; // Nếu đã gửi rồi thì bỏ qua mọi link sau đó

        const isToken = hasToken(url);

        if (isToken) {
            sendToNativeBridge(url, true);
        } else {
            // Chỉ lưu và test link gốc lần đầu tiên
            if (!baseM3u8Url) {
                baseM3u8Url = url;
                verifyAndProcessRawM3u8(url);
            }
        }
    }

    // ==========================================
    // 3. HOOK NETWORK & DOM
    // ==========================================

    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
        processDetectedUrl(url);
        return rawFetch.apply(this, args);
    };

    XMLHttpRequest.prototype.open = function (method, url) {
        processDetectedUrl(url);
        return rawXHROpen.apply(this, arguments);
    };

    Element.prototype.setAttribute = function (name, value) {
        if (this.tagName === 'IFRAME' && this.closest && this.closest('#video-player')) {
            processDetectedUrl(value);
        }
        return rawSetAttribute.apply(this, arguments);
    };

    const domObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const iframes = node.tagName === 'IFRAME' ? [node] : node.querySelectorAll('#video-player iframe');
                    iframes.forEach(iframe => {
                        processDetectedUrl(iframe.src);
                    });
                }
            });
        });
    });

    domObserver.observe(document.documentElement, { childList: true, subtree: true });

})();
`;
}

function sortEpisodesByName(data) {
    try {
        data.forEach(server => {
            if (server.episodes && Array.isArray(server.episodes)) {
                server.episodes.sort((a, b) => {
                    const matchA = a.name.match(/Tập\s*(\d+)/i);
                    const matchB = b.name.match(/Tập\s*(\d+)/i);

                    const numA = matchA ? parseInt(matchA[1], 10) : 0;
                    const numB = matchB ? parseInt(matchB[1], 10) : 0;

                    return numA - numB;
                });
            }
        });
        return data;
    } catch (e) {
        log("sortEpisodesByName[err]:\n " + e);
        return data;
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
    return "[]";
}

function parseYearsResponse(html) {
    return "[]";
}
// https://k8s.onflixcdn.com/api/movies?sort=year_desc&limit=24&category=chien-tranh
function getLISTmenu() {
    return `
/the-loai/huyen-huyen@@Huyền Huyễn
/the-loai/xuyen-khong@@Xuyên Không
/the-loai/trung-sinh@@Trùng Sinh
/the-loai/tien-hiep@@Tiên Hiệp
/the-loai/co-trang@@Cổ Trang
/the-loai/hai-huoc@@Hài Hước
/the-loai/kiem-hiep@@Kiếm Hiệp
/the-loai/hien-dai@@Hiện Đại
`
}

function buildMenu(listurl) {
    let menulist = [];
    if (!listurl) return menulist;
    let lines = listurl.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.indexOf('@@') === -1) continue;
        let parts = line.split('@@');
        let link = parts[0] ? parts[0].trim() : "";
        let name = parts[1] ? parts[1].trim() : "";
        let check = parts[2] ? parts[2].trim() : undefined;
        if (!link || !name) continue;
        let item = {};
        if (check === "false") {
            item = {
                "slug": link,
                "title": name,
                "type": "Horizontal"
            };
        } else if (check === "true") {
            item = {
                "slug": link,
                "title": name,
                "type": "Grid"
            };
        } else {
            item = {
                "slug": link,
                "name": name
            };
        }
        menulist.push(item);
    }
    return menulist;
}

function _$(htmlOrBlock) {
    if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) {
        return htmlOrBlock;
    }
    var instance = {
        sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',
        elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),
        find: function(selector) {
            if (selector.indexOf(',') !== -1) {
                var results = [];
                var selectors = selector.split(',').map(function(s) {
                    return s.trim();
                });
                for (var s = 0; s < selectors.length; s++) {
                    if (selectors[s] === "") continue;
                    var subInstance = this.find(selectors[s]);
                    for (var r = 0; r < subInstance.elements.length; r++) {
                        var element = subInstance.elements[r];
                        if (results.indexOf(element) === -1) {
                            results.push(element);
                        }
                    }
                }
                var multiInstance = _$(results);
                multiInstance.sourceHtml = this.sourceHtml;
                return multiInstance;
            }
            var results = [];
            var contentFilter = "";
            if (selector.indexOf(":content(") !== -1) {
                var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);
                if (contentMatch) {
                    contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || "";
                    selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/, "");
                }
            }
            var attrNameFilter = "";
            var attrValueFilter = "";
            var attrOperator = "=";
            var hasAttrFilter = false;
            var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);
            if (attrMatch) {
                hasAttrFilter = true;
                attrNameFilter = attrMatch[1];
                attrOperator = attrMatch[2];
                attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || "";
                selector = selector.replace(/\[.*?\]/, "");
            }
            var notSelector = "";
            if (selector.indexOf(":not(") !== -1) {
                var notMatch = selector.match(/:not\(([^)]+)\)/);
                if (notMatch) {
                    notSelector = notMatch[1];
                    selector = selector.replace(/:not\([^)]+\)/, "");
                }
            }
            var isFirstFilter = selector.indexOf(":first") !== -1;
            var isLastFilter = selector.indexOf(":last") !== -1;
            selector = selector.replace(/:first|:last/g, "");
            var targetTagName = "";
            var targetId = "";
            var targetClasses = [];
            var selectorToParse = selector.trim();
            if (selectorToParse !== "") {
                var idIndex = selectorToParse.indexOf('#');
                if (idIndex !== -1) {
                    var afterId = selectorToParse.substring(idIndex + 1);
                    var nextDot = afterId.indexOf('.');
                    targetId = nextDot === -1 ? afterId : afterId.substring(0, nextDot);
                    selectorToParse = selectorToParse.substring(0, idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1));
                }
                var classParts = selectorToParse.split('.');
                var possibleTag = classParts.shift();
                if (possibleTag) {
                    targetTagName = possibleTag.toLowerCase();
                }
                targetClasses = classParts.filter(function(c) {
                    return c.length > 0;
                });
            }
            for (var i = 0; i < this.elements.length; i++) {
                var currentHtml = this.elements[i];
                var pos = 0;
                var subResults = [];
                while ((pos = currentHtml.indexOf('<', pos)) !== -1) {
                    if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') {
                        pos++;
                        continue;
                    }
                    var endOpenTag = -1;
                    var insideQuote = false;
                    var quoteChar = '';
                    for (var j = pos + 1; j < currentHtml.length; j++) {
                        var char = currentHtml.charAt(j);
                        if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') {
                            if (!insideQuote) {
                                insideQuote = true;
                                quoteChar = char;
                            } else if (char === quoteChar) {
                                insideQuote = false;
                            }
                        }
                        if (char === '>' && !insideQuote) {
                            endOpenTag = j;
                            break;
                        }
                    }
                    if (endOpenTag === -1) break;
                    var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1);
                    var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/);
                    var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : "";
                    var isMatched = true;
                    if (targetTagName && targetTagName !== currentTagName) {
                        isMatched = false;
                    }
                    var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
                    var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : "";
                    var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
                    var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : "";
                    if (isMatched && targetId && idMatchStr !== targetId) {
                        isMatched = false;
                    }
                    if (isMatched && targetClasses.length > 0) {
                        if (classMatchStr) {
                            var currentClasses = classMatchStr.trim().split(/\s+/);
                            for (var c = 0; c < targetClasses.length; c++) {
                                if (currentClasses.indexOf(targetClasses[c]) === -1) {
                                    isMatched = false;
                                    break;
                                }
                            }
                        } else {
                            isMatched = false;
                        }
                    }
                    if (isMatched && hasAttrFilter) {
                        var actualValue = "";
                        if (attrNameFilter === "class") {
                            actualValue = classMatchStr;
                        } else if (attrNameFilter === "id") {
                            actualValue = idMatchStr;
                        } else {
                            var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
                            actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : "";
                        }
                        var attrExists = fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=', 'i')) !== -1;
                        if (!attrExists) {
                            isMatched = false;
                        } else {
                            if (attrOperator === "=") {
                                if (attrNameFilter === "class") {
                                    var classes = actualValue.trim().split(/\s+/);
                                    if (classes.indexOf(attrValueFilter) === -1) isMatched = false;
                                } else if (actualValue !== attrValueFilter) {
                                    isMatched = false;
                                }
                            } else if (attrOperator === "*=") {
                                if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false;
                            } else if (attrOperator === "^=") {
                                if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false;
                            } else if (attrOperator === "$=") {
                                if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false;
                            }
                        }
                    }
                    if (isMatched) {
                        var startTagPos = pos;
                        var endTagPos = endOpenTag + 1;
                        var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta'];
                        if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {
                            var depth = 1;
                            var scanPos = endOpenTag + 1;
                            var openStr = '<' + currentTagName;
                            var closeStr = '</' + currentTagName + '>';
                            while (depth > 0 && scanPos < currentHtml.length) {
                                var nextOpen = currentHtml.indexOf(openStr, scanPos);
                                var nextClose = currentHtml.indexOf(closeStr, scanPos);
                                if (nextClose === -1) {
                                    scanPos = currentHtml.length;
                                    break;
                                }
                                if (nextOpen !== -1 && nextOpen < nextClose) {
                                    depth++;
                                    scanPos = nextOpen + openStr.length;
                                } else {
                                    depth--;
                                    scanPos = nextClose + closeStr.length;
                                    if (depth === 0) endTagPos = nextClose + closeStr.length;
                                }
                            }
                        }
                        var foundBlock = currentHtml.substring(startTagPos, endTagPos);
                        if (contentFilter) {
                            var pureText = foundBlock.replace(/<[^>]+>/g, "").trim();
                            if (pureText.indexOf(contentFilter) === -1) {
                                pos = endTagPos;
                                continue;
                            }
                        }
                        if (notSelector) {
                            var isNotClass = notSelector.indexOf('.') === 0;
                            var isNotId = notSelector.indexOf('#') === 0;
                            var notValue = notSelector.substring(1);
                            var hasNot = false;
                            if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true;
                            if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true;
                            if (!hasNot) subResults.push(foundBlock);
                        } else {
                            subResults.push(foundBlock);
                        }
                        pos = endTagPos;
                    } else {
                        pos++;
                    }
                }
                if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]];
                if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]];
                results = results.concat(subResults);
            }
            var newInstance = _$(results);
            newInstance.sourceHtml = this.sourceHtml || currentHtml;
            return newInstance;
        },
        each: function(callback) {
            for (var i = 0; i < this.elements.length; i++) {
                var childInstance = _$(this.elements[i]);
                childInstance.sourceHtml = this.sourceHtml;
                callback.call(childInstance, i, this.elements[i]);
            }
            return this;
        },
        eq: function(index) {
            if (index < 0) index = this.elements.length + index;
            var matchedElement = this.elements[index];
            this.elements = matchedElement ? [matchedElement] : [];
            return this;
        },
        attr: function(attrName) {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var getAttr = elem.match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
            return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : "";
        },
        html: function() {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var start = elem.indexOf('>') + 1;
            var end = elem.lastIndexOf('</');
            if (start > 0 && end > start) return elem.substring(start, end);
            return "";
        },
        text: function(separator) {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var start = elem.indexOf('>') + 1;
            var end = elem.lastIndexOf('</');
            if (start > 0 && end > start) {
                var content = elem.substring(start, end);
                var pureText = content.replace(/<\/?[^>]+(>|$)/g, "");
                if (typeof separator === 'string') {
                    return pureText.split('\n').map(function(item) {
                        return item.trim();
                    }).filter(function(item) {
                        return item !== '';
                    }).join(separator);
                }
                return pureText.trim();
            }
            return "";
        },
        next: function() {
            var results = [];
            if (!this.sourceHtml) return this;
            for (var i = 0; i < this.elements.length; i++) {
                var elem = this.elements[i];
                var idx = this.sourceHtml.indexOf(elem);
                if (idx === -1) continue;
                var scanPos = idx + elem.length;
                var nextOpen = this.sourceHtml.indexOf('<', scanPos);
                if (nextOpen !== -1) {
                    if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue;
                    var endOpenTag = this.sourceHtml.indexOf('>', nextOpen);
                    if (endOpenTag === -1) continue;
                    var fullOpenTag = this.sourceHtml.substring(nextOpen, endOpenTag + 1);
                    var spacePos = fullOpenTag.indexOf(' ');
                    var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase();
                    var startTagPos = nextOpen;
                    var endTagPos = endOpenTag + 1;
                    var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta'];
                    if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {
                        var depth = 1;
                        var sPos = endOpenTag + 1;
                        var openStr = '<' + currentTagName;
                        var closeStr = '</' + currentTagName + '>';
                        while (depth > 0 && sPos < this.sourceHtml.length) {
                            var nOpen = this.sourceHtml.indexOf(openStr, sPos);
                            var nClose = this.sourceHtml.indexOf(closeStr, sPos);
                            if (nClose === -1) break;
                            if (nOpen !== -1 && nOpen < nClose) {
                                depth++;
                                sPos = nOpen + openStr.length;
                            } else {
                                depth--;
                                sPos = nClose + closeStr.length;
                                if (depth === 0) endTagPos = nClose + closeStr.length;
                            }
                        }
                    }
                    results.push(this.sourceHtml.substring(startTagPos, endTagPos));
                }
            }
            var nextInstance = _$(results);
            nextInstance.sourceHtml = this.sourceHtml;
            this.elements = results;
            return this;
        },
        parent: function() {
            var results = [];
            if (!this.sourceHtml) return this;
            for (var i = 0; i < this.elements.length; i++) {
                var elem = this.elements[i];
                var idx = this.sourceHtml.indexOf(elem);
                if (idx <= 0) continue;
                var scanPos = idx - 1;
                while (scanPos >= 0) {
                    var openTagPos = this.sourceHtml.lastIndexOf('<', scanPos);
                    if (openTagPos === -1) break;
                    if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this.sourceHtml.charAt(openTagPos + 1) !== '!') {
                        var endOpenTag = this.sourceHtml.indexOf('>', openTagPos);
                        if (endOpenTag !== -1 && endOpenTag > openTagPos) {
                            var fullOpenTag = this.sourceHtml.substring(openTagPos, endOpenTag + 1);
                            var spacePos = fullOpenTag.indexOf(' ');
                            var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase();
                            var endTagPos = endOpenTag + 1;
                            var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta'];
                            if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {
                                var depth = 1;
                                var sPos = endOpenTag + 1;
                                var openStr = '<' + currentTagName;
                                var closeStr = '</' + currentTagName + '>';
                                while (depth > 0 && sPos < this.sourceHtml.length) {
                                    var nOpen = this.sourceHtml.indexOf(openStr, sPos);
                                    var nClose = this.sourceHtml.indexOf(closeStr, sPos);
                                    if (nClose === -1) break;
                                    if (nOpen !== -1 && nOpen < nClose) {
                                        depth++;
                                        sPos = nOpen + openStr.length;
                                    } else {
                                        depth--;
                                        sPos = nClose + closeStr.length;
                                        if (depth === 0) endTagPos = nClose + closeStr.length;
                                    }
                                }
                            }
                            if (endTagPos >= idx + elem.length) {
                                var parentBlock = this.sourceHtml.substring(openTagPos, endTagPos);
                                if (results.indexOf(parentBlock) === -1) results.push(parentBlock);
                                break;
                            }
                        }
                    }
                    scanPos = openTagPos - 1;
                }
            }
            var parentInstance = _$(results);
            parentInstance.sourceHtml = this.sourceHtml;
            this.elements = results;
            return this;
        },
        closest: function(selector) {
            var results = [];
            if (!this.sourceHtml || this.elements.length === 0) return _$([]);
            for (var i = 0; i < this.elements.length; i++) {
                var currentElem = this.elements[i];
                var currentObj = _$(currentElem);
                currentObj.sourceHtml = this.sourceHtml;
                var selfCheck = _$(this.sourceHtml).find(selector);
                var isSelfMatched = false;
                for (var s = 0; s < selfCheck.elements.length; s++) {
                    if (selfCheck.elements[s] === currentElem) {
                        isSelfMatched = true;
                        break;
                    }
                }
                if (isSelfMatched) {
                    if (results.indexOf(currentElem) === -1) results.push(currentElem);
                    continue;
                }
                var parentObj = currentObj.parent();
                while (parentObj.elements.length > 0) {
                    var parentElem = parentObj.elements[0];
                    var checkMatch = _$(this.sourceHtml).find(selector);
                    var isMatched = false;
                    for (var j = 0; j < checkMatch.elements.length; j++) {
                        if (checkMatch.elements[j] === parentElem) {
                            isMatched = true;
                            break;
                        }
                    }
                    if (isMatched) {
                        if (results.indexOf(parentElem) === -1) results.push(parentElem);
                        break;
                    }
                    parentObj = parentObj.parent();
                }
            }
            var closestInstance = _$(results);
            closestInstance.sourceHtml = this.sourceHtml;
            return closestInstance;
        }
    };
    return instance;
}

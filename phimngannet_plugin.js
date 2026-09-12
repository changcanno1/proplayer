// =============================================================================
// PLUGIN VAAPP: PHIMNGAN.NET (Network Sniffer Style HH3D + Fix Load Trang Chủ)
// =============================================================================

var BASEURL = "https://phimngan.net";

function getManifest() {
    return JSON.stringify({
        "id": "phimngan_net",
        "name": "Phim Ngắn Net",
        "version": "2.0.0",
        "baseUrl": BASEURL,
        "iconUrl": BASEURL + "/icons/icon-512x512.png",
        "isEnabled": true,
        "type": "shortfilm", // Kích hoạt giao diện Short Drama vuốt dọc
        "playerType": "embedtoexoplay", // Ép mở Webview ngầm để chạy CustomJS Sniffer
        "author": "VAAPP Expert"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/", "title": "Đề Xuất & Mới Cập Nhật", "type": "Grid" },
        { "slug": "/phim-ai", "title": "Phim AI", "type": "Grid" },
        { "slug": "/xuong-phim", "title": "Phim Người Đóng", "type": "Grid" },
        { "slug": "/phim-ngan-trung-quoc", "title": "Phim Ngắn Trung Quốc", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Ngôn Tình", "slug": "/genres/ngon-tinh" },
        { "name": "Tổng Tài", "slug": "/genres/tong-tai" },
        { "name": "Cổ Trang", "slug": "/genres/co-trang" },
        { "name": "Thể Loại Khác", "slug": "/genres|data:isCategory=1" },
        { "name": "Tâm Trạng", "slug": "/moods|data:isCategory=1" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var filters = JSON.parse(filtersJson);
            page = parseInt(filters.page) || 1;
        }
        var path = slug.split("|")[0]; 
        var separator = path.indexOf("?") !== -1 ? "&" : "?";
        var url = path.startsWith("http") ? path : BASEURL + (path.startsWith("/") ? path : "/" + path);
        
        if (page > 1) {
            url += separator + "page=" + page;
        }
        return url;
    } catch (e) {
        return BASEURL;
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var filters = JSON.parse(filtersJson);
            page = parseInt(filters.page) || 1;
        } catch(e) {}
    }
    return BASEURL + "/search?q=" + encodeURIComponent(keyword) + (page > 1 ? "&page=" + page : "");
}

function getUrlDetail(slug) {
    return slug.startsWith("http") ? slug : BASEURL + (slug.startsWith("/") ? slug : "/" + slug);
}

function getUrlCategories() { return BASEURL + "/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// Helper lấy Data từ chuỗi URL
function getPipeData(raw) {
    if (!raw) return "";
    var i = raw.indexOf("|");
    if (i < 0) return "";
    var s = raw.substring(i + 1).replace(/^\s+/, "");
    if (s.toLowerCase().indexOf("data:") === 0) s = s.substring(5);
    return s;
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, apiUrl) {
    var items = [];
    try {
        var $doc = _$(html);
        var isCategoryPage = apiUrl.indexOf("isCategory=1") !== -1;

        if (isCategoryPage) {
            $doc.find("a.group").each(function() {
                var href = this.attr("href");
                var title = this.find("span.font-black").text().trim();
                if (href && title) {
                    items.push({
                        "id": href,
                        "title": title,
                        "isCategory": true
                    });
                }
            });
        } else {
            // FIX LỖI TRANG CHỦ: Dùng hàm duyệt "a" an toàn thay vì CSS selector phức tạp
            $doc.find("a").each(function() {
                var href = this.attr("href");
                if (href && (href.indexOf("/watch/") > -1 || href.indexOf("/phim/") > -1)) {
                    var title = this.find("h3").text().trim();
                    if (!title) return; // Lọc bỏ các thẻ a rác không có tiêu đề

                    var imgTag = this.find("img");
                    var posterUrl = imgTag.attr("src") || imgTag.attr("data-src") || "";
                    var srcSet = imgTag.attr("srcset") || imgTag.attr("imageSrcSet");
                    
                    if (srcSet) {
                        var sources = srcSet.split(",");
                        var bestSource = sources[sources.length - 1].trim().split(" ")[0];
                        if (bestSource) posterUrl = bestSource;
                    }

                    if (posterUrl && posterUrl.indexOf("/_next/image") > -1) {
                        var encodedUrl = posterUrl.match(/url=([^&]+)/);
                        if (encodedUrl && encodedUrl[1]) {
                            posterUrl = decodeURIComponent(encodedUrl[1]);
                        } else {
                            posterUrl = BASEURL + posterUrl;
                        }
                    }
                    if (posterUrl && !posterUrl.startsWith("http")) {
                        posterUrl = BASEURL + posterUrl;
                    }

                    var quality = this.find("span.uppercase").first().text().trim() || "Full"; 
                    var episode_current = this.find("p.truncate").text().trim(); 

                    items.push({
                        "id": href.startsWith("http") ? href : BASEURL + href,
                        "title": title,
                        "posterUrl": posterUrl,
                        "quality": quality,
                        "episode_current": episode_current
                    });
                }
            });
        }

        var hasNext = html.indexOf('aria-label="Next page"') !== -1 || html.indexOf('rel="next"') !== -1;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": hasNext ? 99 : 1
            }
        });
    } catch(e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html, apiUrl) {
    return parseListResponse(html, apiUrl);
}

function parseMovieDetail(html, apiUrl) {
    try {
        var $doc = _$(html);
        var realUrl = apiUrl.split("|")[0];
        
        var title = $doc.find('meta[property="og:title"]').attr("content") || $doc.find("h1").text().trim();
        title = title.replace(" - PhimNgan.Net", "").trim();
        var posterUrl = $doc.find('meta[property="og:image"]').attr("content") || "";
        var description = $doc.find('meta[property="og:description"]').attr("content") || "";

        // Phân 2 Server Vietsub / Thuyết Minh, dán cờ nhận diện qua |data:
        var servers = [
            {
                "name": "Vietsub",
                "episodes": [
                    { "id": realUrl + "|data:vietsub", "name": "Tập Full", "slug": "full-vs" }
                ]
            },
            {
                "name": "Thuyết Minh",
                "episodes": [
                    { "id": realUrl + "|data:thuyetminh", "name": "Tập Full", "slug": "full-tm" }
                ]
            }
        ];

        return JSON.stringify({
            "id": realUrl,
            "title": title,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "servers": servers
        });
    } catch (e) {
        return JSON.stringify({ id: apiUrl, title: "Lỗi tải phim", servers: [] });
    }
}

function parseDetailResponse(html, apiUrl, datasend) {
    // Đọc data mode (vietsub / thuyetminh) truyền từ parseMovieDetail
    var mode = datasend || getPipeData(apiUrl) || "vietsub";
    var cleanUrl = apiUrl.split("|")[0];

    // =========================================================================
    // SCRIPT HH3D STYLE: Hook Network (Fetch, XHR, Blob) & Auto-Click Nút
    // =========================================================================
    var customJsCode = `
        (function() {
            if (window._vaapp_sniffer_v2) return;
            window._vaapp_sniffer_v2 = true;
            
            var hasSent = false;
            var targetMode = "${mode}";

            // 1. Gửi link sang App
            function sendToNativeBridge(playUrl) {
                if (hasSent || !playUrl || typeof playUrl !== 'string') return;
                var lowerUrl = playUrl.toLowerCase();
                
                // Bắt m3u8 hoặc mp4 thực tế (không phải blob)
                if (lowerUrl.indexOf('.m3u8') > -1 || (lowerUrl.indexOf('.mp4') > -1 && lowerUrl.indexOf('blob:') === -1)) {
                    hasSent = true;
                    var headers = JSON.stringify({
                        "Referer": window.location.href,
                        "User-Agent": navigator.userAgent
                    });
                    if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
                        window.SnifferBridge.log("Sniffed Network URL: " + playUrl);
                        window.SnifferBridge.play(playUrl, headers);
                    }
                }
            }

            // 2. Tự động tìm và bấm chọn Vietsub hoặc Thuyết Minh
            function autoSelectAudio() {
                var buttons = document.querySelectorAll('button, a, span');
                for (var i = 0; i < buttons.length; i++) {
                    var txt = (buttons[i].innerText || "").toLowerCase();
                    if (targetMode === "vietsub" && txt.indexOf("vietsub") > -1) {
                        buttons[i].click(); 
                        break;
                    }
                    if (targetMode === "thuyetminh" && (txt.indexOf("thuyết minh") > -1 || txt.indexOf("lồng tiếng") > -1)) {
                        buttons[i].click(); 
                        break;
                    }
                }
            }
            
            // Web dùng React nên gọi delay vài lần đợi nút xuất hiện
            setTimeout(autoSelectAudio, 500);
            setTimeout(autoSelectAudio, 1500);

            // 3. Hook Fetch
            var rawFetch = window.fetch;
            window.fetch = async function (...args) {
                var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                sendToNativeBridge(url);
                return rawFetch.apply(this, args);
            };

            // 4. Hook XHR
            var rawXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (method, url) {
                sendToNativeBridge(url);
                return rawXHROpen.apply(this, arguments);
            };

            // 5. Hook DOM (Phòng hờ trường hợp web chèn thẻ <source> trực tiếp)
            var observer = new MutationObserver(function(mutations) {
                if(hasSent) return;
                var v = document.querySelector('video');
                if (v && v.src && v.src.indexOf('blob:') === -1) {
                    sendToNativeBridge(v.src);
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });

            // 6. Hook URL.createObjectURL để bắt M3U8 thô nếu web ẩn link bằng Blob
            if (typeof URL !== 'undefined' && URL.createObjectURL) {
                var origCreateObjectURL = URL.createObjectURL;
                URL.createObjectURL = function(blob) {
                    if (!hasSent && blob && (blob instanceof Blob || blob instanceof File)) {
                        if (typeof blob.text === 'function') {
                            blob.text().then(function(content) {
                                if (content && content.indexOf('#EXTM3U') === 0) {
                                    hasSent = true;
                                    if (window.SnifferBridge && typeof window.SnifferBridge.playM3u8Content === 'function') {
                                        window.SnifferBridge.log("Sniffed Blob M3U8 Content");
                                        window.SnifferBridge.playM3u8Content(content, window.location.href);
                                    }
                                }
                            }).catch(function(){});
                        }
                    }
                    return origCreateObjectURL.apply(this, arguments);
                };
            }
        })();
    `;

    return JSON.stringify({
        "url": cleanUrl,
        "isEmbed": true,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASEURL,
            "Block-Ads": "true", // Giúp sniffer sạch hơn
            "Custom-Js": customJsCode.replace(/\n/g, " ").trim()
        }
    });
}

function parseEmbedResponse() { return "{}"; }
function parseCategoriesResponse() { return "[]"; }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }
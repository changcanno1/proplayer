// =============================================================================
// PLUGIN VAAPP: PHIMNGAN.NET (Tối ưu Bắt Link Động XHR/Fetch & Chia Server)
// =============================================================================

var BASEURL = "https://phimngan.net";

function getManifest() {
    return JSON.stringify({
        "id": "phimngan_net",
        "name": "Phim Ngắn Net",
        "version": "1.2.0",
        "baseUrl": BASEURL,
        "iconUrl": BASEURL + "/icons/icon-512x512.png",
        "isEnabled": true,
        "type": "shortfilm", // Kích hoạt giao diện Short Drama vuốt dọc
        "playerType": "embedtoexoplay", // Dùng Sniffer WebView để tóm link XHR
        "author": "VAAPP Coder"
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

// Helper bóc data từ chuỗi |data:
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
            // Tối ưu selector cho _$(html): Tìm thẳng các thẻ a có chứa link phim
            $doc.find("a").each(function() {
                var href = this.attr("href");
                if (href && (href.indexOf("/watch/") > -1 || href.indexOf("/phim/") > -1)) {
                    var title = this.find("h3").text().trim();
                    if (!title) return;

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

                    var quality = this.find("span.uppercase").first().text().trim() || "Full"; 
                    var episode_current = this.find("p.truncate").text().trim() || "Cập nhật"; 

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

        // Phim ngắn trên trang này thường play ngay tại URL gốc
        var epId = realUrl;
        
        // Chia 2 Server để App truyền datasend báo cho Sniffer biết nên click nút nào
        var servers = [
            {
                "name": "Vietsub (Ưu tiên âm thanh gốc)",
                "episodes": [
                    { "id": epId + "|data:vietsub", "name": "Full", "slug": "full-vs" }
                ]
            },
            {
                "name": "Thuyết Minh",
                "episodes": [
                    { "id": epId + "|data:thuyetminh", "name": "Full", "slug": "full-tm" }
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
    // Ưu tiên đọc datasend, nếu rỗng thì bóc từ apiUrl
    var mode = datasend || getPipeData(apiUrl) || "vietsub";
    var cleanUrl = apiUrl.split("|")[0];

    // Script Sniffer mạng + DOM Observer cực mạnh (tham khảo HH3D)
    // Tự động tìm và click nút Vietsub / Thuyết minh để web nạp đúng file âm thanh
    var customJsCode = `
        (function() {
            if (window._vaapp_sniffer_v2) return;
            window._vaapp_sniffer_v2 = true;
            
            var hasSent = false;
            var mode = "${mode}";

            // 1. Hàm tự động chọn Audio (Vietsub hoặc Thuyết Minh) trên giao diện
            function autoSelectAudio() {
                var buttons = document.querySelectorAll('button, a, span');
                for(var i=0; i<buttons.length; i++) {
                    var txt = (buttons[i].innerText || "").toLowerCase();
                    if(mode === "vietsub" && txt.indexOf("vietsub") > -1) {
                        buttons[i].click(); break;
                    }
                    if(mode === "thuyetminh" && (txt.indexOf("thuyết minh") > -1 || txt.indexOf("lồng tiếng") > -1)) {
                        buttons[i].click(); break;
                    }
                }
            }
            // Gọi click liên tục vài lần để đối phó với React delay
            setTimeout(autoSelectAudio, 500);
            setTimeout(autoSelectAudio, 1500);

            // 2. Hàm gửi link về Native App
            function checkAndSend(url) {
                if (hasSent || !url || typeof url !== 'string') return;
                var lowerUrl = url.toLowerCase();
                
                // Nếu bắt được luồng m3u8 hoặc mp4 (không phải blob) -> Gửi cho ExoPlayer
                if (lowerUrl.indexOf('.m3u8') > -1 || (lowerUrl.indexOf('.mp4') > -1 && lowerUrl.indexOf('blob:') === -1)) {
                    hasSent = true;
                    var headers = JSON.stringify({
                        "Referer": window.location.href,
                        "User-Agent": navigator.userAgent
                    });
                    if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
                        window.SnifferBridge.play(url, headers);
                    }
                }
            }

            // 3. Hook Network Fetch & XHR (Trọng tâm)
            var rawFetch = window.fetch;
            var rawXHROpen = XMLHttpRequest.prototype.open;

            window.fetch = async function (...args) {
                var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                checkAndSend(url);
                return rawFetch.apply(this, args);
            };

            XMLHttpRequest.prototype.open = function (method, url) {
                checkAndSend(url);
                return rawXHROpen.apply(this, arguments);
            };

            // 4. Hook DOM Video Tag (Phòng hờ web chèn trực tiếp mp4)
            var observer = new MutationObserver(function(mutations) {
                if(hasSent) return;
                var v = document.querySelector('video');
                if (v && v.src && v.src.indexOf('blob:') === -1) {
                    checkAndSend(v.src);
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });

            // 5. Hook URL.createObjectURL để bắt M3U8 thô nếu web dùng hls.js ẩn link
            if (typeof URL !== 'undefined' && URL.createObjectURL) {
                var origCreateObjectURL = URL.createObjectURL;
                URL.createObjectURL = function(blob) {
                    if (!hasSent && blob && (blob instanceof Blob || blob instanceof File)) {
                        if (typeof blob.text === 'function') {
                            blob.text().then(function(content) {
                                if (content && content.indexOf('#EXTM3U') === 0) {
                                    hasSent = true;
                                    if (window.SnifferBridge && typeof window.SnifferBridge.playM3u8Content === 'function') {
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
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Referer": BASEURL,
            "Custom-Js": customJsCode.replace(/\n/g, " ").trim(),
            "Block-Ads": "true" 
        }
    });
}

function parseEmbedResponse() { return "{}"; }
function parseCategoriesResponse() { return "[]"; }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

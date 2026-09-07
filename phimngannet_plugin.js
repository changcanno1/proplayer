// =============================================================================
// PLUGIN VAAPP: PHIMNGAN.NET (Bản Chuẩn - Load Siêu Tốc & Sạch Lỗi)
// =============================================================================

var BASEURL = "https://phimngan.net";

function getManifest() {
    return JSON.stringify({
        "id": "phimngan_net",
        "name": "PhimNgan.Net",
        "description": "Nền tảng xem phim ngắn, phim dọc người thật đóng và phim AI.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": BASEURL + "/icons/icon-512x512.png",
        "isEnabled": true,
        "type": "shortfilm", // Bật giao diện vuốt phim ngắn TikTok
        "layoutType": "VERTICAL",
        "playerType": "embedtoexoplay", // Dùng sniffer ngầm tóm link video động
        "author": "VAAPP Expert"
    });
}

// =============================================================================
// MENU & TRANG CHỦ
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/", "title": "Mới Cập Nhật & Đề Xuất", "type": "Grid" },
        { "slug": "/phim-ai", "title": "Phim AI", "type": "Horizontal" },
        { "slug": "/xuong-phim", "title": "Phim Người Đóng", "type": "Horizontal" },
        { "slug": "/phim-ngan-trung-quoc", "title": "Phim Ngắn Trung Quốc", "type": "Horizontal" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Ngôn Tình", "slug": "/genres/ngon-tinh" },
        { "name": "Tổng Tài", "slug": "/genres/tong-tai" },
        { "name": "Cổ Trang", "slug": "/genres/co-trang" },
        { "name": "Phim AI", "slug": "/phim-ai" },
        { "name": "Danh Mục Thể Loại", "slug": "/genres|data:isCategory=1" },
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
        
        var path = slug.split("|")[0]; // Cắt bỏ phần data nếu có
        var url = path.indexOf("http") === 0 ? path : BASEURL + (path.indexOf("/") === 0 ? path : "/" + path);
        
        // Next.js phân trang bằng tham số ?page=
        if (page > 1) {
            url += (url.indexOf("?") !== -1 ? "&" : "?") + "page=" + page;
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
    if (!slug) return BASEURL;
    return slug.indexOf("http") === 0 ? slug : BASEURL + (slug.indexOf("/") === 0 ? slug : "/" + slug);
}

function getUrlCategories() { return BASEURL + "/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS (Sử dụng _$(html) mini-JQ)
// =============================================================================

function parseListResponse(html, apiUrl) {
    var items = [];
    try {
        var $doc = _$(html);
        
        // Nhận diện nếu đang bấm vào Trang Danh mục mẹ (Để hiển thị Thư mục con)
        if (apiUrl.indexOf("isCategory=1") !== -1) {
            $doc.find("a.group.rounded-2xl").each(function() {
                var href = this.attr("href");
                var title = this.find("span.text-base").text().trim();
                if (href && title) {
                    items.push({
                        "id": href,
                        "title": title,
                        "isCategory": true // Chỉ thị App đây là thư mục, bấm vào mở List chứ không mở Detail
                    });
                }
            });
        } else {
            // Parse phim tiêu chuẩn
            $doc.find("a").each(function() {
                var href = this.attr("href");
                
                // Chỉ bắt các link phim hợp lệ
                if (href && (href.indexOf("/watch/") > -1 || href.indexOf("/phim/") > -1)) {
                    var title = this.find("h3.text-white").text().trim();
                    if (!title) return; // Bỏ qua thẻ a rác

                    // Lấy ảnh bìa
                    var imgTag = this.find("img");
                    var posterUrl = imgTag.attr("src") || imgTag.attr("data-src") || "";
                    var srcSet = imgTag.attr("srcset") || imgTag.attr("imageSrcSet");
                    
                    if (srcSet) {
                        var sources = srcSet.split(",");
                        var bestSource = sources[sources.length - 1].trim().split(" ")[0];
                        if (bestSource) posterUrl = bestSource;
                    }

                    // Giải mã URL từ Next.js Image Optimizer
                    if (posterUrl.indexOf("/_next/image") > -1) {
                        var encodedUrl = posterUrl.match(/url=([^&]+)/);
                        if (encodedUrl && encodedUrl[1]) {
                            posterUrl = decodeURIComponent(encodedUrl[1]);
                        }
                    }
                    if (posterUrl && posterUrl.indexOf("http") === -1) {
                        posterUrl = BASEURL + posterUrl;
                    }

                    var quality = this.find("span.uppercase").first().text().trim() || "HD";
                    var currentEp = this.find("p.truncate").text().trim(); // Lấy Hashtag làm mô tả phụ

                    items.push({
                        "id": href.indexOf("http") === 0 ? href : BASEURL + href,
                        "title": title,
                        "posterUrl": posterUrl,
                        "quality": quality,
                        "episode_current": currentEp
                    });
                }
            });
        }
        
        // Kiểm tra Next Page
        var hasNextPage = html.indexOf('aria-label="Next page"') !== -1 || html.indexOf('rel="next"') !== -1;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": hasNextPage ? 99 : 1 // Tự động load vô tận
            }
        });
    } catch(e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html, apiUrl) {
    return parseListResponse(html, apiUrl);
}

function parseMovieDetail(html, apiUrl, datasend) {
    try {
        var $doc = _$(html);
        var title = $doc.find('meta[property="og:title"]').attr("content") || $doc.find("h1").text().trim();
        title = title.replace(" - PhimNgan.Net", "").trim();
        
        var posterUrl = $doc.find('meta[property="og:image"]').attr("content") || "";
        var description = $doc.find('meta[property="og:description"]').attr("content") || "";

        var episodes = [];
        var epSet = {};
        
        // Thử tìm danh sách tập nếu đây là một bộ phim có nhiều phần (series)
        $doc.find("a").each(function() {
            var epHref = this.attr("href");
            var epName = this.text().trim();
            
            if (epHref && epHref.indexOf("/watch/") > -1 && epName.match(/(Phần|Tập)\s*\d+/i)) {
                var fullUrl = epHref.indexOf("http") === 0 ? epHref : BASEURL + epHref;
                if (!epSet[fullUrl]) {
                    epSet[fullUrl] = true;
                    episodes.push({
                        "id": fullUrl,
                        "name": epName,
                        "slug": "tap-" + epHref.split("/").pop()
                    });
                }
            }
        });

        // Phim ngắn nếu không có list tập -> tự coi URL hiện tại là tập duy nhất
        if (episodes.length === 0) {
            episodes.push({
                "id": apiUrl,
                "name": "Xem Ngay",
                "slug": "tap-full"
            });
        }

        return JSON.stringify({
            "id": apiUrl,
            "title": title,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "servers": [
                {
                    "name": "Server Chính",
                    "episodes": episodes
                }
            ]
        });
    } catch(e) {
        return JSON.stringify({ id: apiUrl, title: "Lỗi Tải Phim", servers: [] });
    }
}

// Hàm này được gọi bởi trình tóm link (Sniffer WebView)
function parseDetailResponse(html, apiUrl, datasend) {
    // Kịch bản Custom-Js nhúng thẳng vào webview ngầm
    // Chờ thẻ <video> được React sinh ra và bắt link .mp4 / .m3u8
    var customJsCode = `
        (function() {
            if (window._vaapp_sniffer) return;
            window._vaapp_sniffer = true;

            function checkVideo() {
                var v = document.querySelector('video');
                // Nếu thẻ video xuất hiện và có link (Bỏ qua link blob vì không play native được)
                if (v && v.src && v.src.indexOf('blob:') === -1) {
                    var headers = JSON.stringify({
                        "Referer": window.location.href,
                        "User-Agent": navigator.userAgent
                    });
                    SnifferBridge.play(v.src, headers);
                    return true;
                }
                
                // Trường hợp web dùng <video><source src="..."></video>
                var source = document.querySelector('video source');
                if (source && source.src) {
                    var headers = JSON.stringify({
                        "Referer": window.location.href,
                        "User-Agent": navigator.userAgent
                    });
                    SnifferBridge.play(source.src, headers);
                    return true;
                }
                return false;
            }

            if (!checkVideo()) {
                var observer = new MutationObserver(function() {
                    if (checkVideo()) observer.disconnect(); // Tóm được link thì tắt quan sát
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
            }
        })();
    `;

    return JSON.stringify({
        "url": apiUrl,
        "isEmbed": true, // Bắt buộc true để App gọi WebView chạy Custom-Js
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASEURL,
            "Custom-Js": customJsCode.replace(/\\n/g, " ").trim(),
            "Block-Ads": "true" // Tự động chặn qc rác cản trở quá trình tóm link
        }
    });
}

function parseEmbedResponse() { return "{}"; }
function parseCategoriesResponse() { return "[]"; }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

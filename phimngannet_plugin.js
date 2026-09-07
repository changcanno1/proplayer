// =============================================================================
// PLUGIN VAAPP - PhimNgan.Net
// =============================================================================

var BASEURL = "https://phimngan.net";

function getManifest() {
    return JSON.stringify({
        "id": "phimngan_net",
        "name": "Phim Ngắn Net",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": BASEURL + "/icons/icon-512x512.png",
        "isEnabled": true,
        "type": "shortfilm", // Kích hoạt giao diện Short Drama vuốt dọc
        "playerType": "embedtoexoplay", // Dùng Sniffer để bắt link video
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
        var path = slug.split("|")[0]; // Bỏ phần |data: nếu có
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

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, apiUrl, datasend) {
    var items = [];
    var $doc = _$(html);

    // Kiểm tra xem có phải trang danh mục cha không
    var isCategoryPage = apiUrl.indexOf("isCategory=1") !== -1;

    if (isCategoryPage) {
        // Parse các nhóm thể loại (Ví dụ: /genres hoặc /moods)
        $doc.find("a.group.rounded-2xl").each(function() {
            var href = this.attr("href");
            var title = this.find("span.text-base.font-black").text().trim();
            if (href && title) {
                items.push({
                    "id": href,
                    "title": title,
                    "isCategory": true // Chỉ định mở danh sách con
                });
            }
        });
    } else {
        // Parse danh sách phim lưới
        $doc.find("a.group.relative.block.aspect-\\[9\\/16\\]").each(function() {
            var href = this.attr("href");
            var title = this.find("h3.text-white").text().trim();
            
            // Xử lý ảnh: ưu tiên lấy từ URL trực tiếp hoặc srcset
            var imgTag = this.find("img");
            var posterUrl = imgTag.attr("src") || imgTag.attr("data-src") || "";
            var srcSet = imgTag.attr("srcset") || imgTag.attr("imageSrcSet");
            
            if (srcSet) {
                var sources = srcSet.split(",");
                // Lấy ảnh độ phân giải cao nhất ở cuối mảng srcset
                var bestSource = sources[sources.length - 1].trim().split(" ")[0];
                if (bestSource) posterUrl = bestSource;
            }

            if (posterUrl && posterUrl.startsWith("/_next/image")) {
                // Sửa URL của Next.js Image Optimization
                var encodedUrl = posterUrl.match(/url=([^&]+)/);
                if (encodedUrl && encodedUrl[1]) {
                    posterUrl = decodeURIComponent(encodedUrl[1]);
                } else {
                    posterUrl = BASEURL + posterUrl;
                }
            }

            // Tags / Trạng thái
            var quality = this.find("span.uppercase").first().text().trim(); 
            var episode_current = this.find("p.truncate").text().trim(); 

            if (href && title) {
                items.push({
                    "id": href,
                    "title": title,
                    "posterUrl": posterUrl,
                    "quality": quality,
                    "episode_current": episode_current
                });
            }
        });
    }

    // Phân trang
    var hasNext = html.indexOf('aria-label="Next page"') !== -1 || html.indexOf('rel="next"') !== -1;
    var totalPages = hasNext ? 99 : 1;

    return JSON.stringify({
        "items": items,
        "pagination": {
            "currentPage": 1,
            "totalPages": totalPages
        }
    });
}

function parseSearchResponse(html, apiUrl) {
    return parseListResponse(html, apiUrl);
}

function parseMovieDetail(html, apiUrl, datasend) {
    var $doc = _$(html);
    var title = $doc.find("h1").text().trim() || $doc.find("title").text().replace("| PhimNgan.Net", "").trim();
    var posterUrl = $doc.find('meta[property="og:image"]').attr("content") || "";
    var description = $doc.find('meta[property="og:description"]').attr("content") || "";

    // Phim ngắn thường được phát thẳng hoặc chia tập trong Player
    var episodes = [];
    var epSet = {};
    
    // Tìm các thẻ chứa link tập phim
    $doc.find("a[href*='/watch/'], a[href*='/phim/']").each(function() {
        var epName = this.text().trim();
        var epHref = this.attr("href");
        
        // Lọc bớt các link không phải là tập (như phim đề xuất)
        if (epHref && epName && epName.match(/tập|phần|\d+/i)) {
            var fullUrl = epHref.startsWith("http") ? epHref : BASEURL + epHref;
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

    // Nếu không tìm thấy list tập, lấy luôn URL hiện tại làm tập duy nhất
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
                "name": "Nguồn Phát",
                "episodes": episodes
            }
        ]
    });
}

function parseDetailResponse(html, apiUrl, datasend) {
    // Custom JS chèn vào WebView để bắt link video thẻ <video> của web
    var customJsCode = `(function() {
        if (window._vaapp_sniffer) return;
        window._vaapp_sniffer = true;

        function checkVideo() {
            var v = document.querySelector('video');
            if (v && v.src && v.src.startsWith('http')) {
                var headers = JSON.stringify({
                    "Referer": window.location.href,
                    "User-Agent": navigator.userAgent
                });
                SnifferBridge.play(v.src, headers);
                return true;
            }
            return false;
        }

        if (!checkVideo()) {
            var observer = new MutationObserver(function() {
                if (checkVideo()) observer.disconnect();
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    })();`;

    return JSON.stringify({
        "url": apiUrl,
        "isEmbed": true,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASEURL,
            "Custom-Js": customJsCode,
            "Block-Ads": "true"
        }
    });
}

// Bỏ qua các API không dùng
function parseCategoriesResponse() { return "[]"; }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

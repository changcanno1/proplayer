// =============================================================================
// VAAPP Plugin: Xoilac TV (Cập nhật giao diện Đa thể thao, Fix Embed)
// =============================================================================

var BASEURL = "https://xoilaczzf.cc";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV-Xoilac",
        "name": "ThethaoTV-Xoilac",
        "version": "1.0.5",
        "baseUrl": BASEURL,
        "iconUrl": "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "embed" // Chạy bằng trình duyệt nhúng (WebView)
    });
}

// =============================================================================
// MENU & GIAO DIỆN CHÍNH
// =============================================================================
function getHomeSections() {
    return JSON.stringify([
        { slug: 'football', title: 'Trận Đấu Đang Live', type: 'Grid', path: '' },
        { slug: 'basketball', title: 'Bóng Rổ', type: 'Horizontal', path: '' },
        { slug: 'tennis', title: 'Tennis', type: 'Horizontal', path: '' },
        { slug: 'badminton', title: 'Cầu Lông', type: 'Horizontal', path: '' },
        { slug: 'volleyball', title: 'Bóng Chuyền', type: 'Horizontal', path: '' },
        { slug: 'esports', title: 'Esports', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Trận Đấu Đang Live', slug: 'football' },
        { name: 'Bóng Rổ', slug: 'basketball' },
        { name: 'Tennis', slug: 'tennis' },
        { name: 'Cầu Lông', slug: 'badminton' },
        { name: 'Bóng Chuyền', slug: 'volleyball' },
        { name: 'Esports', slug: 'esports' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    if (slug && slug.indexOf('http') === 0) return slug;
    var targetSlug = (slug === '/' || !slug) ? 'football' : slug;
    
    return BASEURL + "/|data:" + targetSlug;
}

function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// Helper đọc dữ liệu nội bộ sau dấu |
function getPipeData(apiUrl) {
    if (!apiUrl) return "";
    var i = apiUrl.indexOf("|");
    if (i < 0) return "";
    var s = apiUrl.substring(i + 1).replace(/^\s+/, "");
    if (s.toLowerCase().indexOf("data:") === 0) s = s.substring(5);
    return s;
}

// =============================================================================
// BÓC TÁCH DANH SÁCH THEO MÔN THỂ THAO
// =============================================================================
function parseListResponse(html, apiUrl) {
    try {
        var sportSlug = getPipeData(apiUrl) || "football";
        var $doc = _$(html);
        var items = [];
        
        var tabSelector = "#" + sportSlug;

        $doc.find(tabSelector).find(".grid-matches__item").each(function() {
            var a = this.find("a.redirectPopup");
            var href = a.attr("href");
            var title = a.attr("title");
            
            var league = this.find(".gmd-match-league span.text-ellipsis").text();
            var time = this.find(".time").attr("data-time") || "";
            var homeLogo = this.find(".gmd-home_team img").attr("src");
            
            if (href && title) {
                var fullHref = href.indexOf('http') === 0 ? href : BASEURL + href;
                items.push({
                    id: fullHref,
                    title: title.trim(),
                    posterUrl: homeLogo || "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
                    quality: time, 
                    episode_current: league
                });
            }
        });
        
        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 1 }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

// =============================================================================
// BÓC TÁCH TRANG CHI TIẾT
// =============================================================================
function parseMovieDetail(html, url) {
    try {
        var $doc = _$(html);
        var title = $doc.find("title").text().split("-")[0].trim() || "Trực Tiếp Thể Thao";
        
        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
            backdropUrl: "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
            description: "Đang phát trực tiếp trên Xôi Lạc TV. (Hệ thống sẽ tự động bắt luồng phát)",
            servers: [
                {
                    name: "Phòng Live",
                    episodes: [
                        { id: url, name: "Xem Trực Tiếp", slug: "live-1" }
                    ]
                }
            ],
            quality: "LIVE",
            year: new Date().getFullYear(),
            status: "Đang diễn ra"
        });
    } catch(e) {
        return JSON.stringify({ id: url, title: "Lỗi", servers: [] });
    }
}

// =============================================================================
// BẮT LINK VÀ PHÁT BẰNG WEBVIEW (EMBED)
// =============================================================================
function parseDetailResponse(html, url) {
    var playUrl = url;
    
    // Tìm kiếm iframe chứa video player trong mã HTML
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
        var src = iframeMatch[1];
        // Xử lý các dạng link iframe tương đối (//domain.com)
        if (src.indexOf('//') === 0) {
            src = 'https:' + src;
        }
        if (src.indexOf('http') === 0) {
            playUrl = src;
        }
    }

    var cssHide = "header, footer, nav, .sidebar, .chat-box, .comments, .banner, .ads, iframe[src*='ads'], .matches-section, .footer-menu { display: none !important; }";
    
    return JSON.stringify({
        url: playUrl,
        isEmbed: true, // QUAN TRỌNG: Phải đặt true để VAAPP đẩy vào WebView
        headers: {
            "Referer": BASEURL + "/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Block-Css": cssHide // (Nếu client của bạn hỗ trợ inject CSS)
        },
        subtitles: []
    });
}

function parseEmbedResponse(html, url) {
    return JSON.stringify({ url: url, isEmbed: true });
}

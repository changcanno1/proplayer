// =============================================================================
// VAAPP Plugin: Xoilac TV (Chuẩn phong cách Rophim - Thuần WebView 100%)
// =============================================================================

var BASEURL = "https://xoilaczzb.cc";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV-Xoilac",
        "name": "ThethaoTV-Xoilac",
        "version": "1.1.3",
        "baseUrl": BASEURL,
        "iconUrl": "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "embed" // Ép sử dụng WebView Player
    });
}

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

function getFilterConfig() { return JSON.stringify({ sort: [], category: [] }); }
function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

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

function getPipeData(apiUrl) {
    if (!apiUrl) return "";
    var i = apiUrl.indexOf("|");
    if (i < 0) return "";
    var s = apiUrl.substring(i + 1).replace(/^\s+/, "");
    if (s.toLowerCase().indexOf("data:") === 0) s = s.substring(5);
    return s;
}

// =============================================================================
// BÓC TÁCH DANH SÁCH (Giữ nguyên)
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
        return JSON.stringify({ items: items, pagination: { currentPage: 1, totalPages: 1 } });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html, url) { return parseListResponse(html, url); }

function parseMovieDetail(html, url) {
    try {
        var $doc = _$(html);
        var title = $doc.find("title").text().split("-")[0].trim() || "Trực Tiếp Thể Thao";
        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
            backdropUrl: "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
            description: "Chế độ WebView Thuần: Giữ nguyên luồng trực tiếp, tự động ẩn rác.",
            servers: [{
                name: "Phòng Live",
                episodes: [{ id: url, name: "Xem Trực Tiếp", slug: "live-1" }]
            }],
            quality: "LIVE",
            year: new Date().getFullYear(),
            status: "Đang diễn ra"
        });
    } catch(e) {
        return JSON.stringify({ id: url, title: "Lỗi", servers: [] });
    }
}

// =============================================================================
// BƯỚC 1: TRUYỀN THẲNG TRANG WEB VÀO WEBVIEW (KHÔNG BÓC TÁCH)
// =============================================================================
function parseDetailResponse(html, url) {
    // 1. CSS Hủy diệt: Ẩn tất cả mọi thứ rườm rà trên giao diện
    var cssHide = "header, footer, nav, aside, .sidebar, .chat-box, .comments, .banner, .ads, .footer-menu, .match-detail-top, .matches-section, iframe[src*='sbobet'], iframe[src*='vnsport'], iframe[src*='7m'], iframe[src*='score'] { display: none !important; opacity: 0 !important; visibility: hidden !important; width: 0 !important; height: 0 !important; }";
    
    // 2. JS Hỗ trợ: Ép bảng tỷ số (Sbobet) bay màu ngay lập tức nếu nó load sau, đồng thời tự động bấm Play video
    var jsAction = "setInterval(function(){ " +
                   "  document.querySelectorAll('iframe').forEach(function(f){ " +
                   "    if(f.src.match(/sbobet|vnsport|bongdainfo|score|7m|bet/i)) { f.remove(); } " +
                   "  }); " +
                   "  var v = document.querySelector('video'); " +
                   "  if(v && v.paused) { v.play(); } " +
                   "}, 1000);";

    // 3. Truyền đúng URL của trang chi tiết vào WebView
    return JSON.stringify({
        url: url,
        isEmbed: true, // Kích hoạt Webview
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Block-Css": cssHide,
            "Inject-Js": jsAction
        }
    });
}

// =============================================================================
// BƯỚC 2: BỎ QUA BÓC TÁCH NHÚNG
// =============================================================================
function parseEmbedResponse(html, url) {
    // Chỉ đơn giản là nhận URL từ Bước 1 và yêu cầu App mở nó bằng WebView
    return JSON.stringify({
        url: url,
        isEmbed: true
    });
}

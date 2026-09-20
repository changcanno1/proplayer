// =============================================================================
// VAAPP Plugin: Xoilac TV (Bản sửa dứt điểm lỗi ngắt 10-15s)
// =============================================================================

var BASEURL = "https://xoilaczzb.cc";
var MOBILE_UA = "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV-Xoilac",
        "name": "ThethaoTV-Xoilac",
        "version": "1.0.6",
        "baseUrl": BASEURL,
        "iconUrl": "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "embed"
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

function getPipeData(apiUrl) {
    if (!apiUrl) return "";
    var i = apiUrl.indexOf("|");
    if (i < 0) return "";
    var s = apiUrl.substring(i + 1).replace(/^\s+/, "");
    if (s.toLowerCase().indexOf("data:") === 0) s = s.substring(5);
    return s;
}

// =============================================================================
// BÓC TÁCH DANH SÁCH
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
            description: "Đang phát trực tiếp trên Xôi Lạc TV.",
            servers: [
                {
                    name: "Phòng Live Chính",
                    episodes: [
                        { id: url, name: "Xem Trực Tiếp (Full HD)", slug: "live-1" }
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
// BẮT LINK VÀ ÉP TOÀN BỘ VÀO CHẾ ĐỘ NGUYÊN BẢN (KHÔNG CHẶN TOKEN)
// =============================================================================
function parseDetailResponse(html, url) {
    // 1. Tìm iframe embed nếu có
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    var playUrl = url;
    var isIframe = false;

    if (iframeMatch && iframeMatch[1] && iframeMatch[1].indexOf('http') === 0) {
        playUrl = iframeMatch[1];
        isIframe = true;
    }

    // 2. CSS tối ưu: CHỈ ẩn khung thừa, TUYỆT ĐỐI KHÔNG display:none lên container của video
    // (Vì nếu ẩn trúng container hoặc wrapper cha, WebView sẽ tự động suspend/ngắt luồng sau 15s)
    var cssHide = "header, footer, nav, .sidebar, .chat-box, .comments, .banner, .footer-menu { display: none !important; }";

    // 3. Script giữ phiên (Keep-Alive): Tự động click play & bypass các popup tạm dừng
    var jsKeepAlive = "setInterval(function(){ var v = document.querySelector('video'); if(v && v.paused) { v.play(); } }, 3000);";

    return JSON.stringify({
        url: playUrl,
        // ÉP CHẠY THẲNG TRONG WEBVIEW (isEmbed = false để app không chạy tiếp vào parseEmbedResponse)
        isEmbed: false,
        headers: {
            "Referer": BASEURL + "/",
            "Origin": BASEURL,
            "User-Agent": MOBILE_UA,
            "Block-Ads": "true",
            "Block-Redirects": "false", // BẮT BUỘC ĐỂ FALSE: Nhiều link live cần redirect để cấp token
            "Block-Css": isIframe ? "" : cssHide,
            "Inject-Js": jsKeepAlive
        },
        subtitles: []
    });
}

// =============================================================================
// PARSE EMBED: NẾU BỊ GỌI, LUÔN TRẢ VỀ RỖNG ĐỂ CHẶN APP KHÔNG GỌI LẶP LÀM SẬP PLAYER
// =============================================================================
function parseEmbedResponse(html, url) {
    return JSON.stringify({ 
        url: "", 
        isEmbed: false 
    });
}

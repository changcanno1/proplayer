// =============================================================================
// VAAPP Plugin: Xoilac TV (Fix lỗi không play được trận đấu)
// =============================================================================

var BASEURL = "https://xoilaczzf.cc";

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

function parseMovieDetail(html, url) {
    try {
        var $doc = _$(html);
        var title = $doc.find("title").text().split("-")[0].trim() || "Trực Tiếp Thể Thao";
        
        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
            backdropUrl: "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
            description: "Đang phát trực tiếp trên hệ thống Xôi Lạc TV.",
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
// BẮT LINK CHUẨN: TÌM M3U8 -> TÌM IFRAME -> WEBVIEW
// =============================================================================
function parseDetailResponse(html, url) {
    var playUrl = url;
    var userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    
    // 1. Thử quét tìm trực tiếp luồng stream (.m3u8) trong mã nguồn
    // Xoilac thường xuyên giấu link luồng trực tiếp vào các biến JavaScript
    var m3u8Match = html.match(/(https?:\/\/[^"']+\.m3u8[^"']*)/i);
    if (m3u8Match && m3u8Match[1]) {
        return JSON.stringify({
            url: m3u8Match[1],
            isEmbed: false, // Phát thẳng luôn bằng Native Player, siêu mượt
            headers: {
                "Referer": BASEURL + "/",
                "User-Agent": userAgent
            },
            subtitles: []
        });
    }

    // 2. Nếu không có m3u8, thử tìm iframe nhúng (player bên thứ 3)
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    var isIframe = false;
    
    if (iframeMatch && iframeMatch[1]) {
        var src = iframeMatch[1];
        if (src.indexOf('//') === 0) src = 'https:' + src;
        if (src.indexOf('http') === 0) {
            playUrl = src;
            isIframe = true;
        }
    }

    // 3. Fallback: Phát bằng WebView (Trang web Xoilac / iframe)
    // ĐÃ FIX: Chỉ ẩn quảng cáo, header, footer. KHÔNG ẨN CÁC THẺ MÙ QUÁNG để tránh ẩn luôn khung video
    var cssHide = ".header, #header, .footer, #footer, .sidebar, .chat-box, #chat-room, .banner-ads, .ads { display: none !important; }";
    
    return JSON.stringify({
        url: playUrl,
        isEmbed: true,
        headers: {
            "Referer": BASEURL + "/",
            "User-Agent": userAgent,
            "Block-Css": isIframe ? "" : cssHide // Chỉ chèn CSS nếu mở cả trang
        },
        subtitles: []
    });
}

function parseEmbedResponse(html, url) {
    // Nếu App chuyển tiếp link iframe qua hàm này, quét lại m3u8 một lần nữa
    var m3u8Match = html.match(/(https?:\/\/[^"']+\.m3u8[^"']*)/i);
    if (m3u8Match && m3u8Match[1]) {
        return JSON.stringify({
            url: m3u8Match[1],
            isEmbed: false,
            headers: { "Referer": BASEURL + "/" }
        });
    }
    
    // Nếu vẫn không có m3u8, bắt buộc chạy dạng embed
    return JSON.stringify({ 
        url: url, 
        isEmbed: true,
        headers: { "Referer": BASEURL + "/" }
    });
}

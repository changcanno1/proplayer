// =============================================================================
// VAAPP Plugin: Xoilac TV (Bắt link m3u8 trực tiếp - Phong cách HH3D)
// =============================================================================

var BASEURL = "https://xoilaczzb.cc";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV-Xoilac",
        "name": "ThethaoTV-Xoilac",
        "version": "1.0.8",
        "baseUrl": BASEURL,
        "iconUrl": "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "embed" // Kích hoạt chuỗi bóc tách iframe
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

function parseMovieDetail(html, url) {
    try {
        var $doc = _$(html);
        var title = $doc.find("title").text().split("-")[0].trim() || "Trực Tiếp Thể Thao";
        
        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
            backdropUrl: "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
            description: "Live Xoilac. Sử dụng thuật toán bắt link trực tiếp m3u8 (Anti 15s).",
            servers: [
                {
                    name: "Phòng Live Chính",
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
// BƯỚC 1: BẮT LINK IFRAME TỪ TRANG CHI TIẾT (Giống cách làm của web HH3D)
// =============================================================================
function parseDetailResponse(html, url) {
    var iframeUrl = "";
    
    // Dùng Cheerio để bắt iframe (data-src hoặc src)
    try {
        var $doc = _$(html);
        iframeUrl = $doc.find("iframe").attr("src") || $doc.find("iframe").attr("data-src") || "";
    } catch(e) {}

    // Fallback: Dùng Regex quét toàn bộ HTML nếu Cheerio trượt
    if (!iframeUrl) {
        var match = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (match && match[1]) {
            iframeUrl = match[1];
        }
    }

    if (iframeUrl) {
        // Chuẩn hóa đường dẫn
        if (iframeUrl.indexOf('//') === 0) {
            iframeUrl = "https:" + iframeUrl;
        } else if (iframeUrl.indexOf('/') === 0) {
            iframeUrl = BASEURL + iframeUrl;
        }

        // Báo isEmbed: true để app tiếp tục nhảy sang hàm parseEmbedResponse
        return JSON.stringify({
            url: iframeUrl,
            isEmbed: true
        });
    }

    // Nếu không tìm thấy iframe nào, gửi thẳng url web gốc vào chế độ WebView
    return JSON.stringify({
        url: url,
        isEmbed: true 
    });
}

// =============================================================================
// BƯỚC 2: BÓC LINK M3U8 TỪ TRONG IFRAME VÀ CHÈN HEADER (Sửa lỗi ngắt 15s)
// =============================================================================
function parseEmbedResponse(html, url) {
    var playUrl = "";

    // 1. Quét tìm trực tiếp link có đuôi .m3u8 (kèm theo token phía sau nếu có)
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
        playUrl = m3u8Match[1];
    }

    // 2. Nếu không thấy m3u8, tìm các file config (file: "...", source: "...")
    if (!playUrl) {
        var fileMatch = html.match(/file\s*:\s*["'](https?:\/\/[^"']+)["']/i) || 
                        html.match(/source\s*:\s*["'](https?:\/\/[^"']+)["']/i);
        if (fileMatch) {
            playUrl = fileMatch[1];
        }
    }

    // NẾU TÌM THẤY LINK VIDEO M3U8/MP4 TRỰC TIẾP:
    if (playUrl) {
        // Lấy domain gốc của iframe để làm Origin
        var domainOrigin = url.split('/').slice(0, 3).join('/');
        
        return JSON.stringify({
            url: playUrl,
            isEmbed: false, // Báo false để app phát bằng Trình phát Video mượt mà, không dùng WebView nữa
            headers: {
                "Referer": url, // QUAN TRỌNG: Phải trỏ Referer về cái iframe thì mới không bị ngắt 15s
                "Origin": domainOrigin,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    }

    // ==========================================
    // FALLBACK: NẾU BỊ MÃ HOÁ QUÁ MẠNH KHÔNG TÌM THẤY M3U8
    // Ép iframe chạy WebView, ẩn rác để chống cháy
    // ==========================================
    var cssHide = "header, footer, nav, .chat-box, .banner, .ads { display: none !important; }";
    return JSON.stringify({
        url: url,
        isEmbed: true, 
        headers: {
            "Referer": BASEURL + "/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Block-Css": cssHide
        }
    });
}

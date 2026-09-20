// =============================================================================
// VAAPP Plugin: Xoilac TV (Bản Siêu Quét Đa Tầng - Fix lỗi không bắt được link)
// =============================================================================

var BASEURL = "https://xoilaczzb.cc";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV-Xoilac",
        "name": "ThethaoTV-Xoilac",
        "version": "1.1.5",
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
// GIAO DIỆN & DANH MỤC
// =============================================================================
function getHomeSections() {
    return JSON.stringify([
        { slug: 'football', title: 'Trận Đấu Đang Live', type: 'Grid', path: '' },
        { slug: 'basketball', title: 'Bóng Rổ', type: 'Horizontal', path: '' },
        { slug: 'tennis', title: 'Tennis', type: 'Horizontal', path: '' },
        { slug: 'badminton', title: 'Cầu Lông', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Trận Đấu Đang Live', slug: 'football' },
        { name: 'Bóng Rổ', slug: 'basketball' },
        { name: 'Tennis', slug: 'tennis' },
        { name: 'Cầu Lông', slug: 'badminton' }
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
            description: "Hệ thống Siêu Quét Đa Tầng - Tự động lọc Sbobet & Chống ngắt 15s.",
            servers: [{
                name: "Phòng Live Chính",
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
// CÁC HÀM TIỆN ÍCH LỌC RÁC & GIẢI MÃ
// =============================================================================
function decodeB64(str) {
    try { if (typeof window !== 'undefined' && window.atob) return window.atob(str); } catch(e) {}
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var output = '';
    str = String(str).replace(/=+$/, '');
    for (var bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

function isTrash(url) {
    if (!url) return true;
    var s = url.toLowerCase();
    // Danh sách đen: Hễ dính từ khóa này là loại bỏ iframe ngay
    var arr = ['sbobet', 'vnsport', 'bongdainfo', 'bongda', 'score', '7m', 'nowgoal', 'bet', 'chat', 'ads', 'banner'];
    for (var i = 0; i < arr.length; i++) {
        if (s.indexOf(arr[i]) !== -1) return true;
    }
    return false;
}

function findM3u8(html) {
    var cleanHtml = html.replace(/\\/g, "").replace(/u0026/g, "&");
    var m3u8Match = cleanHtml.match(/(https?:\/\/[^"'\s<>]*\.m3u8[^"'\s<>]*)/i);
    if (m3u8Match) return m3u8Match[1];
    
    // Tìm m3u8 bị giấu trong chuỗi Base64
    var b64Tokens = cleanHtml.match(/["'](aHR0cHM6[A-Za-z0-9+/=]+)["']/gi);
    if (b64Tokens) {
        for (var i = 0; i < b64Tokens.length; i++) {
            var dec = decodeB64(b64Tokens[i].replace(/["']/g, ""));
            if (dec.indexOf(".m3u8") !== -1) return dec;
        }
    }
    return "";
}

function findIframe(html) {
    var iframeUrl = "";
    try {
        var $doc = _$(html);
        $doc.find("iframe").each(function() {
            var src = _$(this).attr("src") || _$(this).attr("data-src") || "";
            if (src && !isTrash(src)) {
                iframeUrl = src;
                // Nếu iframe có allowfullscreen, chắc chắn 100% nó là player, break luôn
                if (_$(this).attr("allowfullscreen") !== undefined) return false; 
            }
        });
    } catch(e) {}
    
    if (!iframeUrl) {
        // Fallback: Quét Regex thô bạo nếu DOM bị hỏng
        var matches = html.match(/<iframe[^>]+(?:src|data-src)\s*=\s*["']([^"']+)["']/gi);
        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                var srcMatch = matches[i].match(/(?:src|data-src)\s*=\s*["']([^"']+)["']/i);
                if (srcMatch && srcMatch[1] && !isTrash(srcMatch[1])) {
                    iframeUrl = srcMatch[1];
                    break;
                }
            }
        }
    }
    return iframeUrl;
}

// =============================================================================
// BƯỚC 1: XỬ LÝ TRANG CHỦ TRẬN ĐẤU
// =============================================================================
function parseDetailResponse(html, url) {
    // 1. Quét tìm m3u8 trực tiếp (Lớp 1)
    var directM3u8 = findM3u8(html);
    if (directM3u8) {
        return JSON.stringify({
            url: directM3u8,
            isEmbed: false, // Phát trình phát Native siêu mượt
            headers: {
                "Referer": url,
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    }

    // 2. Nếu không thấy m3u8, tìm Iframe chuẩn (Lớp 2)
    var iframeUrl = findIframe(html);
    if (iframeUrl) {
        if (iframeUrl.indexOf('//') === 0) iframeUrl = "https:" + iframeUrl;
        else if (iframeUrl.indexOf('/') === 0) iframeUrl = BASEURL + iframeUrl;
        else if (iframeUrl.indexOf('http') !== 0) iframeUrl = BASEURL + "/" + iframeUrl;

        return JSON.stringify({
            url: iframeUrl,
            isEmbed: true // Báo app lấy link này vứt qua hàm parseEmbedResponse bên dưới
        });
    }

    // 3. Nếu xui xẻo nhất, web chặn 100%, ép mở trang web gốc qua WebView
    return JSON.stringify({ url: url, isEmbed: true });
}

// =============================================================================
// BƯỚC 2: XỬ LÝ IFRAME
// =============================================================================
function parseEmbedResponse(html, url) {
    // Quét tìm m3u8 bên trong iframe
    var playUrl = findM3u8(html);
    
    if (playUrl) {
        var domainOrigin = url.split('/').slice(0, 3).join('/');
        return JSON.stringify({
            url: playUrl,
            isEmbed: false, 
            headers: {
                "Referer": url, // VŨ KHÍ CHỐNG NGẮT 15s: Referer phải là link của Iframe
                "Origin": domainOrigin,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    }

    // Nếu Iframe mã hóa quá sâu không nhả m3u8, dùng WebView phát nguyên cái Iframe
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

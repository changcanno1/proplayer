// =============================================================================
// VAAPP Plugin: Xoilac TV (Bản triệt tiêu bảng tỷ số VNSport/Sbobet)
// =============================================================================

var BASEURL = "https://xoilaczzb.cc";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV-Xoilac",
        "name": "ThethaoTV-Xoilac",
        "version": "1.1.1",
        "baseUrl": BASEURL,
        "iconUrl": "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "embed"
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
            description: "Đã hủy diệt bảng tỷ số Sbobet/VNSport.",
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

// =============================================================================
// BƯỚC 1: BẮT ĐÚNG IFRAME PLAYER - NÉ BẢNG TỶ SỐ
// =============================================================================
function parseDetailResponse(html, url) {
    var iframeUrl = "";
    
    try {
        var $doc = _$(html);
        
        // CÁCH 1: Tìm đích danh iframe nằm trong khu vực player hoặc có allowfullscreen
        var $playerIframe = $doc.find(".video-player iframe, .embed-responsive iframe, #player iframe, iframe[allowfullscreen]").first();
        
        if ($playerIframe.length > 0) {
            iframeUrl = $playerIframe.attr("src") || $playerIframe.attr("data-src") || "";
        } else {
            // CÁCH 2: Nếu không có class, quét toàn bộ iframe và loại trừ mạnh tay
            $doc.find("iframe").each(function() {
                var src = _$(this).attr("src") || _$(this).attr("data-src") || "";
                var s = src.toLowerCase();
                
                // LỌC RÁC: Xóa sổ các iframe bảng tỷ số, Sbobet, Vnsport
                if (s && s.indexOf('sbobet') === -1 && s.indexOf('vnsport') === -1 && 
                    s.indexOf('bongdainfo') === -1 && s.indexOf('score') === -1 && 
                    s.indexOf('7m') === -1 && s.indexOf('nowgoal') === -1 && 
                    s.indexOf('bet') === -1 && s.indexOf('ads') === -1 && s.indexOf('chat') === -1) {
                    iframeUrl = src;
                    return false; // Thoát vòng lặp khi tìm thấy iframe sạch đầu tiên
                }
            });
        }
    } catch(e) {}

    if (iframeUrl) {
        if (iframeUrl.indexOf('//') === 0) iframeUrl = "https:" + iframeUrl;
        else if (iframeUrl.indexOf('/') === 0) iframeUrl = BASEURL + iframeUrl;
        else if (iframeUrl.indexOf('http') !== 0) iframeUrl = BASEURL + "/" + iframeUrl;
        
        return JSON.stringify({
            url: iframeUrl,
            isEmbed: true 
        });
    }
    
    // =====================================================================
    // FALLBACK WEBVIEW: Nếu bóc lỗi, ép chạy trang gốc và dùng JS dọn rác
    // =====================================================================
    var cssHide = "header, footer, nav, .sidebar, .chat-box, .comments, .banner, .ads, .footer-menu, .match-detail-top { display: none !important; }";
    var jsHideScoreboard = "setInterval(function(){ document.querySelectorAll('iframe').forEach(function(f){ if(f.src.match(/sbobet|vnsport|bongdainfo|score|7m|bet|chat/i)) { f.remove(); } }); }, 1000);";

    return JSON.stringify({
        url: url,
        isEmbed: true,
        headers: {
            "Referer": BASEURL + "/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Block-Ads": "true",
            "Block-Css": cssHide,
            "Inject-Js": jsHideScoreboard
        }
    });
}

// =============================================================================
// BƯỚC 2: GIẢI MÃ M3U8 TỪ IFRAME (CHỐNG NGẮT 15 GIÂY)
// =============================================================================
function parseEmbedResponse(html, url) {
    var playUrl = "";
    var cleanHtml = html.replace(/\\/g, "").replace(/u0026/g, "&");

    var m3u8Match = cleanHtml.match(/(https?:\/\/[^"'\s<>]*\.m3u8[^"'\s<>]*)/i);
    if (m3u8Match) playUrl = m3u8Match[1];

    if (!playUrl) {
        var b64Tokens = cleanHtml.match(/["'](aHR0cHM6[A-Za-z0-9+/=]+)["']/gi);
        if (b64Tokens) {
            for (var i = 0; i < b64Tokens.length; i++) {
                var dec = decodeB64(b64Tokens[i].replace(/["']/g, ""));
                if (dec.indexOf(".m3u8") !== -1) {
                    playUrl = dec;
                    break;
                }
            }
        }
    }

    if (!playUrl) {
        var srcMatch = cleanHtml.match(/(?:file|source|url|src)["']?\s*[:=]\s*["'](https?:\/\/[^"'\s<>]+)["']/i);
        if (srcMatch && srcMatch[1].indexOf(".m3u8") !== -1) playUrl = srcMatch[1];
    }

    if (playUrl) {
        var domainOrigin = url.split('/').slice(0, 3).join('/');
        return JSON.stringify({
            url: playUrl,
            isEmbed: false, 
            headers: {
                "Referer": url, 
                "Origin": domainOrigin,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    }

    // Nếu không giải mã được m3u8, duy trì iframe qua WebView & Xóa rác
    var cssHide = "header, footer, nav, .chat-box, .banner, .ads { display: none !important; }";
    var jsHideScoreboard = "setInterval(function(){ document.querySelectorAll('iframe').forEach(function(f){ if(f.src.match(/sbobet|vnsport|bongdainfo|score|7m|bet|chat/i)) { f.remove(); } }); }, 1000);";

    return JSON.stringify({
        url: url,
        isEmbed: true, 
        headers: {
            "Referer": BASEURL + "/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Block-Css": cssHide,
            "Inject-Js": jsHideScoreboard
        }
    });
}

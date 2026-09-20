// =============================================================================
// VAAPP Plugin: Xoilac TV (Bắt link Iframe Video + Ép phát WebView)
// =============================================================================

var BASEURL = "https://xoilaczzb.cc";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV-Xoilac",
        "name": "ThethaoTV-Xoilac",
        "version": "1.1.2",
        "baseUrl": BASEURL,
        "iconUrl": "https://cdn.xoilacxba.tv/2025/05/xoilac365-tv.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "embed" // Luôn để embed để dùng WebView
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
            description: "Chế độ: Bắt Iframe Video + Trình diễn Webview thuần.",
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
// BƯỚC 1: BẮT LINK - LỌC VÀ LẤY CHÍNH XÁC IFRAME TRÌNH PHÁT VIDEO
// =============================================================================
function parseDetailResponse(html, url) {
    var iframeUrl = "";
    
    // Tìm toàn bộ thẻ iframe trong trang
    var iframes = html.match(/<iframe[^>]+(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/gi);
    
    if (iframes) {
        for (var i = 0; i < iframes.length; i++) {
            var iframeTag = iframes[i];
            var srcMatch = iframeTag.match(/(?:src|data-src)\s*=\s*["']([^"']+)["']/i);
            
            if (srcMatch && srcMatch[1]) {
                var src = srcMatch[1].toLowerCase();
                
                // BỘ LỌC TỪ KHÓA: Né ngay lập tức các iframe bảng tỷ số và quảng cáo
                if (src.indexOf('sbobet') > -1 || 
                    src.indexOf('vnsport') > -1 || 
                    src.indexOf('bongdainfo') > -1 || 
                    src.indexOf('score') > -1 || 
                    src.indexOf('7m') > -1 || 
                    src.indexOf('nowgoal') > -1 || 
                    src.indexOf('bet') > -1 || 
                    src.indexOf('ads') > -1 || 
                    src.indexOf('chat') > -1) {
                    continue; // Bỏ qua, xét iframe tiếp theo
                }
                
                // Iframe đầu tiên vượt qua được bộ lọc trên chính là Iframe Video
                iframeUrl = srcMatch[1];
                break; 
            }
        }
    }

    // Nếu bắt được link iframe video, trả về để App tiếp tục xử lý
    if (iframeUrl) {
        if (iframeUrl.indexOf('//') === 0) iframeUrl = "https:" + iframeUrl;
        else if (iframeUrl.indexOf('/') === 0) iframeUrl = BASEURL + iframeUrl;
        else if (iframeUrl.indexOf('http') !== 0) iframeUrl = BASEURL + "/" + iframeUrl;
        
        return JSON.stringify({
            url: iframeUrl,
            isEmbed: true // Chuyển luồng sang hàm parseEmbedResponse
        });
    }
    
    // Nếu trang mã hóa quá kỹ không tìm thấy iframe, truyền nguyên URL trang web
    return JSON.stringify({ url: url, isEmbed: true });
}

// =============================================================================
// BƯỚC 2: WEBVIEW - ÉP MỞ LINK IFRAME TRONG TRÌNH DUYỆT CỦA APP
// =============================================================================
function parseEmbedResponse(html, url) {
    // App sẽ ném đường link iframe bắt được ở Bước 1 vào biến `url` tại đây.
    // Chúng ta KHÔNG bóc tiếp m3u8 để tránh mất token, mà BÁO APP MỞ LUÔN WEBVIEW (isEmbed: true)
    
    // CSS ẩn đi những thành phần rác (nếu link bị lỗi lọt vào nguyên trang)
    var cssHide = "header, footer, nav, .sidebar, .chat-box, .comments, .banner, .ads, .match-detail-top, iframe[src*='sbobet'] { display: none !important; }";
    
    // JS phụ trợ: Tự động click play (nếu video bị pause do chính sách trình duyệt)
    var jsAutoPlay = "setTimeout(function(){ var v = document.querySelector('video'); if(v) { v.play(); } }, 2000);";

    return JSON.stringify({
        url: url, // Chính là link của Iframe trình phát sạch sẽ
        isEmbed: true, // Báo app sử dụng WebView
        headers: {
            "Referer": BASEURL + "/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Block-Ads": "true",
            "Block-Css": cssHide,
            "Inject-Js": jsAutoPlay
        }
    });
}

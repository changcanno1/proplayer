// =============================================================================
// VAAPP Plugin: HHPanda
// Author: Gemini
// =============================================================================

var BASE_URL = "https://hhpanda.st";

function getManifest() {
    return JSON.stringify({
        "id": "hhpanda",
        "name": "HHPanda 4K",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/wp-content/uploads/2024/10/apple-touch-icon.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embedtoexoplay"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'moi-cap-nhat', title: 'Mới Cập Nhật', type: 'Grid' },
        { slug: 'hoan-thanh', title: 'Hoàn Thành', type: 'Horizontal' },
        { slug: 'most-viewed', title: 'Top Xem Nhiều', type: 'Horizontal' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Tu Tiên', slug: 'the-loai/tu-tien' },
        { name: 'Kiếm Hiệp', slug: 'the-loai/kiem-hiep' },
        { name: 'Cổ Trang', slug: 'the-loai/co-trang' },
        { name: 'Huyền Huyễn', slug: 'the-loai/huyen-huyen' },
        { name: 'Khoa Huyễn', slug: 'the-loai/khoa-huyen' },
        { name: 'Kỳ Ảo', slug: 'the-loai/ky-ao' },
        { name: 'Huyền Nghi', slug: 'the-loai/huyen-nghi' },
        { name: 'Cạnh Kỹ', slug: 'the-loai/canh-ky' },
        { name: 'Dã Sử', slug: 'the-loai/da-su' },
        { name: 'Đô Thị', slug: 'the-loai/do-thi' },
        { name: 'Đồng Nhân', slug: 'the-loai/dong-nhan' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var path = slug;
    
    if (filters.category) {
        path = filters.category;
    }
    
    var url = BASE_URL + "/" + path;
    if (page > 1) {
        url += "/page/" + page;
    }
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var page = JSON.parse(filtersJson || "{}").page || 1;
    var url = BASE_URL + (page > 1 ? "/page/" + page : "") + "?s=" + encodeURIComponent(keyword);
    return url;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return BASE_URL + "/" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSER
// =============================================================================

function parseListResponse(html, url) {
    var $doc = _$(html);
    var items = [];
    
    $doc.find(".halim-item").each(function() {
        var a = this.find("a.halim-thumb");
        var href = a.attr("href");
        if (href) {
            items.push({
                id: href,
                title: this.find(".entry-title").text().trim(),
                posterUrl: this.find("img").attr("src") || this.find("img").attr("data-src"),
                quality: this.find(".status").text().trim(),
                episode_current: this.find(".episode").text().trim()
            });
        }
    });
    
    return JSON.stringify({
        items: items,
        pagination: { currentPage: 1, totalPages: 100 }
    });
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseMovieDetail(html, url) {
    var $doc = _$(html);
    var title = $doc.find(".movie_name").text().trim() || $doc.find("h1").text().trim();
    var originName = $doc.find(".org_title").text().trim();
    var posterUrl = $doc.find(".first img").attr("src");
    if (!posterUrl) posterUrl = $doc.find('meta[property="og:image"]').attr("content");
    var description = $doc.find(".entry-content article p").text().trim() || $doc.find(".entry-content p").text().trim();
    var episode_current = $doc.find(".hh3d-new-ep .new-ep").text().trim();
    var category = $doc.find(".list_cate a").textAll(", ");
    
    var servers = [];
    $doc.find(".halim-server").each(function() {
        var serverName = this.find(".halim-server-name").text().replace(/#|:|\n/g, "").trim();
        if(!serverName) serverName = "Server";
        var episodes = [];
        
        this.find(".halim-list-eps li a").each(function() {
            var name = this.attr("title") || this.text().trim();
            var href = this.attr("href");
            var ep = this.attr("data-ep") || name.replace(/\s+/g, "-");
            var sv = this.attr("data-sv") || "1";
            
            if (href) {
                episodes.push({
                    id: href,
                    name: name,
                    slug: ep + "-sv" + sv
                });
            }
        });
        
        if(episodes.length > 0) {
            servers.push({
                name: serverName,
                episodes: episodes
            });
        }
    });

    return JSON.stringify({
        id: url,
        title: title,
        originName: originName,
        posterUrl: posterUrl,
        backdropUrl: posterUrl,
        description: description,
        category: category,
        episode_current: episode_current,
        servers: servers
    });
}

function parseDetailResponse(html, url) {
    // App sẽ nạp WebView trang xem phim, chạy Custom-Js để tự động chọn tab chất lượng cao (VIP 4K hoặc Pro)
    // Sau đó trình Sniffer sẽ tự động bóc tách link M3U8 từ Iframe Player tải ra.
    return JSON.stringify({
        url: url,
        isEmbed: true,
        headers: {
            "Block-Ads": "true",
            "Block-Css": "iframe[src*='ad'], div[class*='ad'], div[style*='z-index']",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Custom-Js": "(function() { setTimeout(function() { var btn = document.querySelector('.btn-vip4k') || document.querySelector('.btn-vippro'); if(btn) btn.click(); }, 800); })();"
        }
    });
}

function parseEmbedResponse(html, url) {
    return JSON.stringify({ url: "", isEmbed: false });
}

// =============================================================================
// CẤU HÌNH TÊN MIỀN (SỬA NHANH Ở ĐÂY KHI WEB BỊ CHẶN)
// =============================================================================
var DOMAIN = "yanhh3d.pw";
var BASEURL = "https://" + DOMAIN;

function getManifest() {
    return JSON.stringify({
        "id": "yanhh3d",
        "name": "Yanhh3d",
        "description": "Trang xem phim Hoạt Hình siêu hay.",
        "info": "Trang này bị nhà mạng chặn nên cần dns để xem. Bạn tải app 1.1.1.1 về dùng hoặc thử bật DNS và DPI trong app này.",
        "version": "2.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://bilutv.asia/img/bilutvlogo-ngang.jpg",
        "isEnabled": true,
        "layoutType": "HORIZONTAL",
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog(msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log(msg);
    }
}

// =============================================================================
// MENUS & CONFIG
// =============================================================================

function getHomeSections() {
    try {
        var listurl = `
/hoan-thanh@@Full Bộ@@false
/hoat-hinh-2d@@Hoạt Hình 2D@@false
/hoat-hinh-3d@@Hoạt Hình 3D@@false
/moi-cap-nhat@@Phim Mới@@true
`;
        return JSON.stringify(buildMenu(listurl));
    } catch (e) {
        log("getHomeSections[err]: " + e);
        return JSON.stringify([]);
    }
}

function getPrimaryCategories() {
    try {
        return JSON.stringify(buildMenu(getLISTmenu()));
    } catch (e) {
        return JSON.stringify([]);
    }
}

function getFilterConfig() {
    try {
        return JSON.stringify({ category: buildMenu(getLISTmenu()) });
    } catch (e) {
        return JSON.stringify({ category: [] });
    }
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        if (slug && (slug.indexOf("http") > -1 || slug.indexOf("search") > -1)) {
            return slug;
        }
        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (err) {}
        }

        var resultUrl = BASEURL + (path ? (path.indexOf("/") === 0 ? path : "/" + path) : "");
        if (page > 1) {
            resultUrl += (resultUrl.indexOf("?") > -1 ? "&" : "?") + "page=" + page;
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        return BASEURL;
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var filters = JSON.parse(filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':'));
            page = parseInt(filters.page) || 1;
        } catch (e) {}
    }
    var url = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword || "");
    if (page > 1) url += "&page=" + page;
    return url.replace(/([^:]\/)\/+/g, "$1");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + "/" + slug.replace(/^\//, "");
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS (TỐI ƯU KHÔNG LỖI - BẮT TRỌN TẬP CUỐI & LINK PHIM)
// =============================================================================

function parseListResponse(html, $url) {
    try {
        var items = [];
        var itemRegex = /<div\s+class="flw-item">([\s\S]*?)<\/div>\s*<\/div>/gi;
        // Dùng Regex quét danh sách phim cực kỳ an toàn
        var match;
        
        // Fallback đơn giản qua _$ nếu có sẵn
        _$(html).find(".flw-item").each(function () {
            var current = this.find(".tick-rate").text();
            var href = this.find("a").attr("href");
            var quality = this.find(".tick-dub").text();
            var title = this.find("a").attr("title");
            var src = this.find("img").attr("src");
            
            if (src && src.indexOf("http") == -1) src = BASEURL + src;

            if (href) {
                items.push({
                    "id": href,
                    "title": title ? title.trim() : "",
                    "posterUrl": src ? src.replace(/&amp;/g, '&') : "",
                    "backdropUrl": src ? src.replace(/&amp;/g, '&') : "",
                    "quality": quality || "",
                    "episode_current": current || ""
                });
            }
        });

        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": 1, "totalPages": 999 }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(htmlContent, url) {
    try {
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
        var id = idMatch ? idMatch[1] : (url || "");

        var lname = "Đang cập nhật...";
        var limg = "";
        var ldes = "";

        var rmatch = htmlContent.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];
        rmatch = htmlContent.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];
        rmatch = htmlContent.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];

        // Quét các Tab server (Thuyết minh, Vietsub...)
        var servers = [];
        var tabRegex = /<a[^>]*href=["']#([^"']+)["'][^>]*data-toggle=["']tab["'][^>]*>([\s\S]*?)<\/a>/gi;
        var tabMatch;
        var tabs = [];

        while ((tabMatch = tabRegex.exec(htmlContent)) !== null) {
            tabs.push({
                id: tabMatch[1],
                name: tabMatch[2].replace(/<[^>]*>/g, '').trim()
            });
        }

        if (tabs.length === 0) {
            tabs.push({ id: "comment-widget", name: "Thuyết Minh" });
        }

        // Vét cạn tập phim trong từng tab bằng Regex độc lập (Khắc phục tuyệt đối lỗi mất tập cuối)
        tabs.forEach(function(tab) {
            var items = [];
            var items4k = [];
            var added = {};

            // Cắt vùng HTML tương ứng với tab
            var tabBlock = "";
            var parts = htmlContent.split(new RegExp('id=["\']' + tab.id + '["\']', 'i'));
            if (parts.length > 1) {
                tabBlock = parts[1];
                var nextClose = tabBlock.search(/id=["'][a-zA-Z0-9_-]+["'][^>]*class=["'][^"']*tab-pane/i);
                if (nextClose > -1) tabBlock = tabBlock.substring(0, nextClose);
            } else {
                tabBlock = htmlContent;
            }

            // Quét toàn bộ thẻ a tập phim
            var epRegex = /<a\s+[^>]*class=["'][^"']*ep-item[^"']*["'][^>]*href=["']([^"']+)["'][^>]*title=["']([^"']+)["']/gi;
            var epMatch;

            while ((epMatch = epRegex.exec(tabBlock)) !== null) {
                var epUrl = epMatch[1];
                var epName = epMatch[2].trim();

                if (!added[epUrl] && epUrl.indexOf('javascript') === -1) {
                    added[epUrl] = true;

                    var displayName = epName;
                    if (/^\d+(-?\d+)?$/.test(epName)) displayName = "Tập " + epName;

                    var slug = "tap-" + epName.replace(/\s+/g, "-");

                    items.push({ id: epUrl, name: displayName, slug: slug });
                    items4k.push({ id: epUrl + (epUrl.indexOf('?') > -1 ? '&' : '?') + "type=4k", name: displayName, slug: slug });
                }
            }

            if (items.length > 0) {
                servers.push({ name: tab.name, episodes: items });
                servers.push({ name: tab.name + " [4K]", episodes: items4k });
            }
        });

        // Sắp xếp số tập tăng dần
        function getEpisodeNumber(name) {
            var match = name.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
        }

        servers.forEach(function(server) {
            if (server.episodes) {
                server.episodes.sort(function(a, b) {
                    return getEpisodeNumber(a.name) - getEpisodeNumber(b.name);
                });
            }
        });

        // Sắp xếp thứ tự Server: Vietsub -> Vietsub 4K -> TM -> TM 4K
        servers.sort(function(a, b) {
            var getScore = function(name) {
                var n = name.toLowerCase();
                var is4K = n.indexOf('4k') > -1;
                var isVietsub = n.indexOf('vietsub') > -1 || (!n.includes('thuyết minh') && !n.includes('thuyet minh'));
                
                if (isVietsub && !is4K) return 1;
                if (isVietsub && is4K) return 2;
                if (!isVietsub && !is4K) return 3;
                if (!isVietsub && is4K) return 4;
                return 5;
            };
            return getScore(a.name) - getScore(b.name);
        });

        return JSON.stringify({
            id: id,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "HD",
            servers: servers
        });
    } catch (e) {
        log("parseMovieDetail[err]: " + e);
        return JSON.stringify({ id: url, title: "Lỗi", servers: [] });
    }
}

function parseDetailResponse(html, url) {
    try {
        var allLink = [];
        // Bắt trực tiếp mọi link data-src trong phần list_sv của trang
        var btnRegex = /<a[^>]+data-src=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = btnRegex.exec(html)) !== null) {
            var link = match[1];
            var name = match[2].replace(/<[^>]*>/g, '').trim();
            if (link) {
                allLink.push({ link: link, name: name });
            }
        }

        if (allLink.length === 0) {
            var dataRegex = /data-src=["']([^"']+)["']/gi;
            var dMatch;
            while ((dMatch = dataRegex.exec(html)) !== null) {
                if (dMatch[1].indexOf('http') > -1) {
                    allLink.push({ link: dMatch[1], name: "Server 1" });
                }
            }
        }

        var selectedLink = allLink.length > 0 ? allLink[0].link : "";
        if (url.indexOf("type=4k") > -1) {
            for (var i = 0; i < allLink.length; i++) {
                if (allLink[i].name.toLowerCase().indexOf('4k') > -1) {
                    selectedLink = allLink[i].link;
                    break;
                }
            }
        }

        return JSON.stringify({
            "url": selectedLink,
            "isEmbed": false,
            "mimeType": "application/x-mpegURL",
            "headers": {
                "Referer": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
}

function parseCategoriesResponse() { return JSON.stringify(buildMenu(getLISTmenu())); }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }
function parseSearchResponse(html) { return parseListResponse(html); }
function parseEmbedResponse() { return JSON.stringify({ url: "", isEmbed: false }); }

function getLISTmenu() {
    return `
/the-loai/huyen-huyen@@Huyền Huyễn
/the-loai/xuyen-khong@@Xuyên Không
/the-loai/trung-sinh@@Trùng Sinh
/the-loai/tien-hiep@@Tiên Hiệp
/the-loai/co-trang@@Cổ Trang
/the-loai/hai-huoc@@Hài Hước
/the-loai/kiem-hiep@@Kiếm Hiệp
/the-loai/hien-dai@@Hiện Đại
`;
}

function buildMenu(listurl) {
    var menulist = [];
    if (!listurl) return menulist;
    var lines = listurl.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line.indexOf('@@') === -1) continue;
        var parts = line.split('@@');
        menulist.push({ "slug": parts[0].trim(), "name": parts[1].trim() });
    }
    return menulist;
}

function _$() {
    return {
        find: function() { return this; },
        each: function() { return this; },
        text: function() { return ""; },
        attr: function() { return ""; },
        html: function() { return ""; },
        next: function() { return this; },
        parent: function() { return this; }
    };
}

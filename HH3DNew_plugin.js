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
      	"info":"Trang này bị nhà mạng chặn nên cần dns để xem. Bạn tải app 1.1.1.1 về dùng hoặc thử bật DNS và DPI trong app này.",
        "version": "1.3.9",
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

// https://yanhh3d.ac/moi-cap-nhat?page=2
function getHomeSections() {
    try {
        var listurl = `
/hoan-thanh@@Full Bộ@@false
/hoat-hinh-2d@@Hoạt Hình 2D@@false
/hoat-hinh-3d@@Hoạt Hình 3D@@false
/moi-cap-nhat@@Phim Mới@@true
`;
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        log("getHomeSections[err]:\n " + e);
        return JSON.stringify([]);
    }
}

function getPrimaryCategories() {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        log("getPrimaryCategories[err]:\n " + e);
        return JSON.stringify([]);
    }
}

function getFilterConfig() {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify({
            category: menulist
        });
    } catch (e) {
        log("getFilterConfig[err]:\n " + e);
        return JSON.stringify({ category: [] });
    }
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        log("getUrlList[url]: \n" + slug);

        // 1. Kiểm tra nếu slug là link tuyệt đối (chứa http) và không có bộ lọc thì trả về luôn
        if ((slug && slug.indexOf("http") > -1) || (slug && slug.indexOf("search") > -1)) {
            return slug;
        }
        let page = 1;
        let path = slug || "";

        // 2. Xử lý an toàn filtersJson nếu có truyền vào
        if (filtersJson) {
            let fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                let filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        // 5. Nối chuỗi URL kết quả
        let resultUrl = BASEURL;
        if (path) {
            resultUrl += path;
        }

        if (page > 1) {
            resultUrl += "?page=" + page;
        }

        // Trả về kết quả, chỉ gộp dấu // ở phần path, giữ nguyên https://
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + finalUrl);
        return finalUrl;

    } catch (e) {
        log("getUrlList[err]:\n " + e);
        let fallback = BASEURL + (slug ? "/" + slug : "");
        var resFallback = fallback.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlList[url]: \n" + resFallback);
        return resFallback;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        var path = "";

        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}

            if (page > 1) {
                var resUrlPage = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword) + "&page=" + page;
                log("getUrlSearch[url]: \n" + resUrlPage);
                return resUrlPage;
            }
        }
        var resUrl = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword);
        log("getUrlSearch[url]: \n" + resUrl);
        return resUrl;

    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        var fallbackUrl = BASEURL + "/search?keysearch=" + encodeURIComponent(keyword || "");
        log("getUrlSearch[url]: \n" + fallbackUrl);
        return fallbackUrl;
    }
}

function getUrlDetail(slug) {
    try {
        log("getUrlDetail[url]: \n" + slug);
        if (!slug) return "";
        if (slug.indexOf('http') === 0) return slug;
        var resUrl = BASEURL + "/" + slug;
        log("getUrlDetail[url]: \n" + resUrl);
        return resUrl;
    } catch (e) {
        log("getUrlDetail[err]:\n " + e);
        return "";
    }
}

function getUrlCategories() {
    try {
        log("getUrlCategories[url]: \n" + BASEURL);
        return BASEURL;
    } catch (e) {
        log("getUrlCategories[err]:\n " + e);
        return "";
    }
}

function getUrlCountries() {
    try {
        return "";
    } catch (e) {
        log("getUrlCountries[err]:\n " + e);
        return "";
    }
}

function getUrlYears() {
    try {
        return "";
    } catch (e) {
        log("getUrlYears[err]:\n " + e);
        return "";
    }
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, $url) {
    try {
        log("parseListResponse[url]: \n" + $url);
        var items = [];

        _$(html).find(".flw-item").each(function () {
            var year = "";
            var lang = "";
            var current = this.find(".tick-rate").text();
            var href = this.find("a").attr("href");
            var quality = this.find(".tick-dub").text();
            var title = this.find("a").attr("title");
            var src = this.find("img").attr("src");
            if (src.indexOf("http") == -1) {
                src = BASEURL + src;
            }

            if (href && href.indexOf("http") > -1) {
                var cleanThumb = src.replace(/&amp;/g, '&');

                items.push({
                    "id": href,
                    "title": title.trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality,
                    "episode_current": current
                });
            }
        });

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 999
            }
        });

    } catch (e) {
        log("parseListResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [{
                "id": $url,
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseSearchResponse(html) {
    try {
        return parseListResponse(html);
    } catch (e) {
        log("parseSearchResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseMovieDetail(htmlContent, url) {
    try {
        log("parseMovieDetail[url]: \n" + url);

        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
        var id = idMatch ? idMatch[1] : (url || "");

        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/_.]+)/.exec(htmlContent);
            slug = slugMatch2 ? slugMatch2[1] : "";
        }

        var lurl = "";
        var limg = "";
        var lname = "Đang cập nhật...";
        var ldes = "Không có mô tả.";
        var ldirec = "";
        var lactor = "";
        var lduran = "";
        var status = "";
        var category = "";
        var episode_current = "";
        var year = "";

        var rmatch = htmlContent.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lurl = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="video:duration"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lduran = rmatch[1];

        status = _$(htmlContent).find("span:content('Trạng thái:')").next().text();
        year = _$(htmlContent).find("span:content('Năm:')").next().text();
        category = _$(htmlContent).find("span:content('Thể loại:')").parent().text(", ").replace('Thể loại:, ', '');
        episode_current = _$(htmlContent).find("span:content('Tập mới nhất:')").next().text();

        var servers = [];
        var $parent = _$(htmlContent).find('.detail-infor-content');
        var $child =$parent.find("li");
        
        $child.find("a").each(function() {
            var nameServer = this.text();
            var idserver = this.attr("href");
            var items = [];
            var items4k = [];
            
            var tabHtml = $parent.find(idserver).html() || "";
            if (tabHtml) {
                var aTagRegex = /<a\s+[^>]*class=["'][^"']*ep-item[^"']*["'][^>]*>/gi;
                var aMatch;
                var added = {};

                while ((aMatch = aTagRegex.exec(tabHtml)) !== null) {
                    var aTag = aMatch[0];
                    var hrefM = /href=["']([^"']+)["']/i.exec(aTag);
                    var titleM = /title=["']([^"']+)["']/i.exec(aTag);
                    
                    if (hrefM && titleM) {
                        var epUrl = hrefM[1];
                        var epName = titleM[1].trim();

                        if (!added[epUrl] && epUrl.indexOf('javascript') === -1) {
                            added[epUrl] = true;
                            
                            var displayName = epName;
                            if (/^\d+(-?\d+)?$/.test(epName)) displayName = "Tập " + epName;
                            
                            var epSlug = "tap-" + epName.replace(/\s+/g, "-");

                            items.push({ id: epUrl, name: displayName, slug: epSlug });
                            items4k.push({ id: epUrl + (epUrl.indexOf('?') > -1 ? '&' : '?') + "type=4k", name: displayName, slug: epSlug });
                        }
                    }
                }
            }

            if (items.length > 0) {
                servers.push({
                    name: nameServer,
                    episodes: items
                });
                servers.push({
                    name: nameServer + " [4K]",
                    episodes: items4k
                });
            }
        });

        function getEpisodeNumber(name) {
            const match = name.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
        }

        servers.forEach(server => {
            if (server.episodes && Array.isArray(server.episodes)) {
                server.episodes.sort((a, b) => {
                    return getEpisodeNumber(a.name) - getEpisodeNumber(b.name);
                });
            }
        });

        var extra = "";
        var isPlayPage = /\/tap-/.test

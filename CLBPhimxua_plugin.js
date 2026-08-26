var BASEURL = "https://sc.k-20.xyz";
var BASESOURCE = "";

function getManifest() {
    return JSON.stringify({
        "id": "clbpxVIP",
        "name": "CLB Phim Xưa VIP",
        "version": "1.2.3",
        "info": "Fix lỗi load link trên iOS",
        "BASEURL": "https://clbpx.alokillgtv.workers.dev",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/clbpxVIP.png",
        "isEnabled": true,
        "isAdult": false,
        "adblock": false,
        "type": "MOVIE",
        "author":"alokillgtv",
        "playerType": "exoplayer", 
        "layoutType": "HORIZONTAL",
        popup_html: popup_html
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'series/home', title: 'Phim Bộ Mới', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem("SVDATA")) {
        localStorage.removeItem("SVDATA");
    }
    return JSON.stringify([
        { name: 'Kiếm Hiệp', slug: 'Kiếm Hiệp' },
        { name: 'Tiên Hiệp', slug: 'Tiên Hiệp' },
        { name: 'Tâm Lý', slug: 'Tâm Lý' },
        { name: 'Ma Kinh Dị', slug: 'Ma Kinh Dị' },
        { name: 'Điện Ảnh Châu Á', slug: 'Điện Ảnh Châu Á' },
        { name: 'Điện Ảnh Âu Mỹ', slug: 'Điện Ảnh Âu Mỹ' },
        { name: 'Hàn Quốc', slug: 'Hàn Quốc' },
        { name: 'Anime', slug: 'Anime' },
        { name: 'TV Series', slug: 'TV Series' },
        { name: 'Thập Niên 60', slug: 'Thập Niên 60' },
        { name: 'Thập Niên 70', slug: 'Thập Niên 70' },
        { name: 'Thập Niên 80', slug: 'Thập Niên 80' },
        { name: 'Thập Niên 90', slug: 'Thập Niên 90' },
        { name: 'Thập Niên 2000', slug: 'Thập Niên 2000' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'newest' },
            { name: 'Cũ nhất', value: 'oldest' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var skip = (page - 1) * 20;

    var type = "series";
    var catalogId = "clbpx-series";

    if (slug && slug.indexOf("movie") === 0) {
        type = "movie";
        catalogId = "clbpx-movie";
    }

    var cleanSlug = slug ? slug.replace(/^(series|movie)\/?/, "") : "";
    var path = "/catalog/" + type + "/" + catalogId;

    if (cleanSlug && cleanSlug !== "home" && cleanSlug !== "") {
        path += "/genre=" + encodeURIComponent("Thể loại: " + cleanSlug);
    }

    if (skip > 0) {
        path += "/skip=" + skip;
    }

    return BASEURL + path + ".json";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var skip = (page - 1) * 20;

    var path = "/catalog/series/clbpx-series/search=" + encodeURIComponent(keyword);
    if (skip > 0) {
        path += "/skip=" + skip;
    }
    return BASEURL + path + ".json";
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;

    if (slug.indexOf("/") !== -1) {
        return BASEURL + "/meta/" + slug + ".json";
    }
    return BASEURL + "/meta/series/" + slug + ".json";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(jsonResponse, url) {
    var items = [];
    var currentPage = 1;

    try {
        var data = JSON.parse(jsonResponse);
        var metas = data.metas || [];

        for (var i = 0; i < metas.length; i++) {
            var item = metas[i];
            var itemType = item.type || "series";
            var fullId = itemType + "/" + item.id;

            var year = 0;
            if (item.year) {
                year = parseInt(item.year, 10);
            } else if (item.releaseInfo) {
                var yMatch = (item.releaseInfo + "").match(/\d{4}/);
                if (yMatch) year = parseInt(yMatch[0], 10);
            }

            items.push({
                id: fullId,
                title: item.name || "",
                posterUrl: item.poster || "",
                backdropUrl: item.background || item.poster || "",
                year: year
            });
        }
    } catch (e) {
        console.error("parseListResponse error: " + e);
    }

    var skipMatch = url.match(/skip=(\d+)/);
    if (skipMatch) {
        currentPage = Math.floor(parseInt(skipMatch[1], 10) / 20) + 1;
    }

    var totalPages = items.length >= 20 ? currentPage + 1 : currentPage;

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages
        }
    });
}

function parseSearchResponse(jsonResponse, url) {
    return parseListResponse(jsonResponse, url);
}

function parseMovieDetail(jsonResponse) {
    try {
        var data = JSON.parse(jsonResponse);
        var meta = data.meta || {};

        var id = meta.id || "";
        var title = meta.name || "";
        var posterUrl = meta.poster || "";
        var backdropUrl = meta.background || posterUrl;
        var description = meta.description || "";
        var type = meta.type || "series";

        var year = 0;
        if (meta.year) {
            year = parseInt(meta.year, 10);
        } else if (meta.releaseInfo) {
            var yMatch = (meta.releaseInfo + "").match(/\d{4}/);
            if (yMatch) year = parseInt(yMatch[0], 10);
        }

        var servers = [];
        var videos = meta.videos || [];

        if (videos.length > 0) {
            var episodes = [];
            for (var i = 0; i < videos.length; i++) {
                var v = videos[i];
                var epId = v.id;
                var epName = v.title || v.name || ("Tập " + (v.episode || (i + 1)));
                var streamApiUrl = BASEURL + "/stream/" + type + "/" + epId + ".json";

                episodes.push({
                    id: streamApiUrl,
                    name: epName,
                    slug: epId
                });
            }

            servers.push({
                name: "Server Standard",
                episodes: episodes
            });
        } else {
            var movieStreamUrl = BASEURL + "/stream/" + type + "/" + id + ".json";
            servers.push({
                name: "Server Standard",
                episodes: [{
                    id: movieStreamUrl,
                    name: "Xem phim",
                    slug: id
                }]
            });
        }

        return JSON.stringify({
            id: id,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: backdropUrl,
            description: description,
            year: year,
            rating: 0,
            quality: "HD",
            servers: servers,
            category: (meta.genres || []).join(", "),
            country: "",
            director: "",
            casts: ""
        });

    } catch (error) {
        console.error("parseMovieDetail error: " + error);
        return "null";
    }
}

function parseDetailResponse(jsonResponse, fallbackUrl, datasend) {
    try {
        var data = JSON.parse(jsonResponse);
        var streams = data.streams || [];

        if (streams.length > 0) {
            var streamObj = streams[0];
            var streamUrl = streamObj.url || "";
            
            // 1. Giả lập User-Agent của Mac/iOS Safari để tránh bị server chặn (403)
            var headers = streamObj.headers || {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15"
            };

            // 2. Tự động nhận diện định dạng file/link
            var isEmbed = false;
            var mimeType = "video/mp4"; // Mặc định
            
            if (streamUrl.indexOf(".m3u8") !== -1) {
                mimeType = "application/x-mpegURL"; 
            } else if (streamUrl.indexOf(".mp4") === -1 && streamUrl.indexOf(".mkv") === -1 && streamUrl.indexOf("http") === 0) {
                // Nếu link trả về là một webpage nhúng iframe thay vì file mp4/m3u8 trực tiếp
                isEmbed = true;
                mimeType = "text/html";
            }

            // Ghi đè isEmbed nếu có config rõ ràng từ API trả về
            if (typeof streamObj.isEmbed !== 'undefined') {
                isEmbed = streamObj.isEmbed;
            }

            return JSON.stringify({
                url: streamUrl,
                mimeType: mimeType,
                isEmbed: isEmbed,
                headers: headers
            });
        }

        throw new Error("No streams available");
    } catch (error) {
        console.error("Lỗi parseDetail: " + error);
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}

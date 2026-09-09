// =============================================================================
// NGUONC TỐI ƯU iOS (NATIVE EXOPLAYER + PIPE DATA)
// =============================================================================
var popuphtml = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé.</p></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;color:#fff}</style>";

function getManifest() {
    return JSON.stringify({
        "id": "nguoncvip",
        "name": "Phim NguonC VIP",
        "version": "2.0",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/nguoncnew.png",
        "isEnabled": true,
        "type": "MOVIE",
        "popup_html": popuphtml,
        "author": "Alokillgtv",
        "playerType": "exoplayer" // Dùng Native Player, loại bỏ WebView ngầm
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'the-loai' },
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'phim-moi-cap-nhat' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'TV Shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'updated' },
            { name: 'Mới nhất', value: 'new' },
            { name: 'Lượt xem', value: 'view' }
        ]
    });
}

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "updated";

        if (slug === 'phim-moi-cap-nhat' && !filters.category && !filters.country && !filters.year) {
            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + page;
        }

        if (filters.category) return "https://phim.nguonc.com/api/films/the-loai/" + filters.category + "?page=" + page + "&sort=" + sort;
        if (filters.country) return "https://phim.nguonc.com/api/films/quoc-gia/" + filters.country + "?page=" + page + "&sort=" + sort;
        if (filters.year) return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + filters.year + "?page=" + page + "&sort=" + sort;
        if (/^\d{4}$/.test(slug)) return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + slug + "?page=" + page + "&sort=" + sort;

        var listSlugs = ['phim-le', 'phim-bo', 'phim-dang-chieu', 'tv-shows', 'subteam'];
        if (listSlugs.indexOf(slug) >= 0 && slug !== 'hoat-hinh') {
            return "https://phim.nguonc.com/api/films/danh-sach/" + slug + "?page=" + page + "&sort=" + sort;
        }

        var countrySlugs = ['au-my', 'anh', 'trung-quoc', 'indonesia', 'viet-nam', 'phap', 'hong-kong', 'han-quoc', 'nhat-ban', 'thai-lan', 'dai-loan', 'nga', 'ha-lan', 'philippines', 'an-do', 'quoc-gia-khac'];
        if (countrySlugs.indexOf(slug) >= 0) return "https://phim.nguonc.com/api/films/quoc-gia/" + slug + "?page=" + page + "&sort=" + sort;

        return "https://phim.nguonc.com/api/films/the-loai/" + slug + "?page=" + page + "&sort=" + sort;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = JSON.parse(filtersJson || "{}").page || 1;
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword) + "&page=1";
    }
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return "https://phim.nguonc.com/api/film/" + slug;
}

function getUrlCategories() { return "https://phim.nguonc.com"; }
function getUrlCountries() { return "https://phim.nguonc.com"; }
function getUrlYears() { return "https://phim.nguonc.com"; }

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = Array.isArray(data) ? data : (Array.isArray(response.items) ? response.items : (data.items || []));
        var paginate = response.paginate || response.pagination || (data.params && data.params.pagination) || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                episode_current: item.current_episode || item.episode_current || "",
                lang: item.language || item.lang || ""
            };
        });

        var currentPage = paginate.current_page || paginate.currentPage || 1;
        var itemsPerPage = paginate.items_per_page || paginate.itemsPerPage || paginate.totalItemsPerPage || 24;
        var totalItems = paginate.total_items || paginate.totalItems || 0;
        var totalPages = paginate.total_page || paginate.totalPages || (itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 1);

        return JSON.stringify({
            items: movies,
            pagination: { currentPage: currentPage, totalPages: totalPages === 0 ? 1 : totalPages, totalItems: totalItems, itemsPerPage: itemsPerPage }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || (response.data && response.data.item) || response.data || {};
        var rawEpisodes = movie.episodes || response.episodes || (response.data && response.data.item && response.data.item.episodes) || [];

        var servers = [];
        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function (server) {
                var episodes = [];
                var serverItems = server.items || server.server_data || [];

                if (Array.isArray(serverItems)) {
                    serverItems.forEach(function (ep) {
                        var embed = ep.embed || ep.link_embed || "";
                        var m3u8 = ep.m3u8 || ep.link_m3u8 || "";
                        
                        // Ưu tiên m3u8 để phát native không qua WebView
                        var streamLink = m3u8 || embed;

                        if (streamLink) {
                            // Tuân thủ quy tắc |data: để nhét link trực tiếp vào bộ nhớ tạm[cite: 9]
                            var pipeId = "https://phim.nguonc.com/api/film/" + (movie.slug || "") + "|data:" + streamLink;
                            episodes.push({
                                id: pipeId,
                                name: ep.name || ep.episode_name || "",
                                slug: ep.slug || ep.episode_slug || ""
                            });
                        }
                    });
                }
                if (episodes.length > 0) {
                    servers.push({ name: server.server_name || server.name || "Server", episodes: episodes });
                }
            });
        }

        var extractGroup = function (catObj, groupName) {
            if (!catObj) return "";
            for (var key in catObj) {
                var group = catObj[key];
                if (group && group.group && group.group.name === groupName && group.list && group.list.length > 0) {
                    return group.list.map(function (item) { return item.name; }).join(", ");
                }
            }
            return "";
        };

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description: (movie.description || movie.content || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year || extractGroup(movie.category, "Năm")) || 0,
            rating: parseFloat(movie.view) || 0,
            quality: movie.quality || "",
            servers: servers,
            episode_current: movie.current_episode || movie.episode_current || "",
            lang: movie.language || movie.lang || "",
            casts: movie.casts || movie.actor || "",
            director: movie.director || "",
            category: extractGroup(movie.category, "Thể loại"),
            country: extractGroup(movie.category, "Quốc gia"),
            view: parseInt(movie.view) || 0,
            status: movie.status || ""
        });
    } catch (error) {
        return "{}";
    }
}

// Hàm này nhận datasend từ quy tắc |data: cấu hình bên trên[cite: 9]
function parseDetailResponse(html, apiUrl, datasend) {
    try {
        var streamLink = datasend || ""; 
        var isEmbed = streamLink.indexOf(".m3u8") === -1 && streamLink.indexOf("embed") > -1;
        var mimeType = isEmbed ? "" : "application/x-mpegURL";

        return JSON.stringify({
            "url": streamLink,
            "isEmbed": isEmbed,
            "mimeType": mimeType,
            "headers": {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
                "Referer": "https://phim.nguonc.com/",
                "Origin": "https://phim.nguonc.com/"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
}

function parseCategoriesResponse(apiResponseJson) {
    return JSON.stringify([
        { name: "Hành Động", slug: "hanh-dong" }, { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" }, { name: "Hài", slug: "phim-hai" },
        { name: "Hình Sự", slug: "hinh-su" }, { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Chính Kịch", slug: "chinh-kich" }, { name: "Kinh Dị", slug: "kinh-di" }
    ]);
}

function parseCountriesResponse(apiResponseJson) {
    return JSON.stringify([
        { name: "Âu Mỹ", value: "au-my" }, { name: "Anh", value: "anh" },
        { name: "Trung Quốc", value: "trung-quoc" }, { name: "Hàn Quốc", value: "han-quoc" },
        { name: "Nhật Bản", value: "nhat-ban" }, { name: "Thái Lan", value: "thai-lan" }
    ]);
}

function parseYearsResponse(apiResponseJson) {
    var years = [];
    for (var i = 2026; i >= 2004; i--) years.push({ name: i.toString(), value: i.toString() });
    return JSON.stringify(years);
}

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    return "https://img.phimapi.com/" + path;
}

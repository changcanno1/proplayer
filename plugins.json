// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguoncnew",
        "name": "Phim NguonC VIP",
        "version": "1.7",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/nguoncnew.png",
        "isEnabled": true,
        "type": "MOVIE",
        "author": "Alokillgtv",
        "playerType": "embedtoexoplay"
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

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "updated";

        if (slug === 'phim-moi-cap-nhat' && !filters.category && !filters.country && !filters.year) {
            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + page;
        }

        if (filters.category) {
            return "https://phim.nguonc.com/api/films/the-loai/" + filters.category + "?page=" + page + "&sort=" + sort;
        }

        if (filters.country) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + filters.country + "?page=" + page + "&sort=" + sort;
        }

        if (filters.year) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + filters.year + "?page=" + page + "&sort=" + sort;
        }

        if (/^\d{4}$/.test(slug)) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + slug + "?page=" + page + "&sort=" + sort;
        }

        var listSlugs = ['phim-le', 'phim-bo', 'phim-dang-chieu', 'tv-shows', 'subteam'];

        if (listSlugs.indexOf(slug) >= 0) {
            if (slug !== 'hoat-hinh') {
                return "https://phim.nguonc.com/api/films/danh-sach/" + slug + "?page=" + page + "&sort=" + sort;
            }
        }

        var countrySlugs = [
            'au-my', 'anh', 'trung-quoc', 'indonesia', 'viet-nam', 'phap', 'hong-kong',
            'han-quoc', 'nhat-ban', 'thai-lan', 'dai-loan', 'nga', 'ha-lan',
            'philippines', 'an-do', 'quoc-gia-khac'
        ];
        if (countrySlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + slug + "?page=" + page + "&sort=" + sort;
        }

        return "https://phim.nguonc.com/api/films/the-loai/" + slug + "?page=" + page + "&sort=" + sort;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
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

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson, url) {
    try {
        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        }

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
        var totalItems = paginate.total_items || paginate.totalItems || 0;
        var itemsPerPage = paginate.items_per_page || paginate.itemsPerPage || paginate.totalItemsPerPage || 24;

        var totalPages = paginate.total_page || paginate.totalPages || 0;
        if (totalPages === 0 && itemsPerPage > 0) {
            totalPages = Math.ceil(totalItems / itemsPerPage);
        }
        if (totalPages === 0) totalPages = 1;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
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
        var dataItem = (response.data && response.data.item) ? response.data.item : null;
        var movie = response.movie || dataItem || response.data || {};

        var dataEpisodes = (response.data && response.data.item && response.data.item.episodes) ? response.data.item.episodes : null;
        var rawEpisodes = movie.episodes || response.episodes || dataEpisodes || [];

        var servers = [];
        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function (server) {
                var episodes = [];
                var serverItems = server.items || server.server_data || [];

                if (Array.isArray(serverItems)) {
                    serverItems.forEach(function (ep) {
                        var embed = ep.embed || ep.link_embed || "";
                        var m3u8 = ep.m3u8 || ep.link_m3u8 || "";
                        var link = embed || m3u8;

                        if (link) {
                            episodes.push({
                                id: link,
                                name: ep.name || ep.episode_name || "",
                                slug: ep.slug || ep.episode_slug || ""
                            });
                        }
                    });
                }

                if (episodes.length > 0) {
                    servers.push({
                        name: server.server_name || server.name || "Server",
                        episodes: episodes
                    });
                }
            });
        }

        var extractGroup = function (categoryObj, groupName) {
            if (!categoryObj) return "";
            for (var key in categoryObj) {
                var group = categoryObj[key];
                if (group && group.group && group.group.name === groupName && group.list && group.list.length > 0) {
                    return group.list.map(function (item) { return item.name; }).join(", ");
                }
            }
            return "";
        };

        var extractedYear = extractGroup(movie.category, "Năm");

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description: (movie.description || movie.content || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year || extractedYear) || 0,
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

function parseDetailResponse(html, url) {
    try {
        var customjs = runJS(url);
        return JSON.stringify({
            "url": url,
            "isEmbed": true,
            "headers": {
                "Referer": "https://embed.streamc.xyz/",
                "Origin": "https://embed.streamc.xyz",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": '"Windows"',
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "Block-Ads": "true",
                "Block-Css": "",
                "Custom-Js": customjs.trim()
            },
            "subtitles": []
        });
        
    } catch (e) {
      return JSON.stringify({ "url": "", "headers": {} });
    }
}

function parseEmbedResponse(htmlContent, url) {
    return JSON.stringify({ url: "", isEmbed: false });
}

function runJS(refererUrl) {
    return `
function bridgeLog(msg, check) {
    try {
        if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
            window.SnifferBridge.log(msg);
            if (check === true && typeof window.SnifferBridge.toast === 'function') {
                window.SnifferBridge.toast(msg, 1000);
            }
        } else if (typeof console !== 'undefined' && console.log) {
            console.log(msg);
        }
    } catch(e) {}
}

(function injectCSS() {
    try {
        const cssStyle = "body,html,*{display:none!important;background:black!important;opacity:0!important;z-index:-999999}";
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.setAttribute('data-injected-by', 'custom-script');
        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = cssStyle;
        } else {
            styleElement.appendChild(document.createTextNode(cssStyle));
        }
        const targetNode = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
        if (targetNode) {
            targetNode.appendChild(styleElement);
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                (document.head || document.documentElement).appendChild(styleElement);
            });
        }
    } catch (error) {}
})();

(function initDualSniffer() {
    if (window.__DUAL_SNIFFER_INITIALIZED__) return;
    window.__DUAL_SNIFFER_INITIALIZED__ = 1;

    var hasDispatchedAny = 0;
    var isFinished = 0;
    var timeoutTimer = null;
    var refUrl = "${refererUrl}" || window.location.href;

    bridgeLog("Đang tiến hành tìm link Video (Hỗ trợ Android & iOS), xin chờ....", true);

    timeoutTimer = setTimeout(function() {
        if (hasDispatchedAny === 0 && isFinished === 0) {
            isFinished = 1;
            bridgeLog("❌ [TIMEOUT] Đã quá 20 giây nhưng không tìm thấy link M3U8!", false);
            if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
                window.SnifferBridge.play("https://google.com", "");
            }
        }
    }, 20000);

    function stopTimeout() {
        if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
        }
    }

    // =========================================================================
    // CƠ CHẾ 1: BLOB SNIFFER (Chuyên trị Android hỗ trợ MSE)
    // =========================================================================
    function isValidM3U8(content) {
        if (typeof content !== 'string') return false;
        var trimmed = content.trim();
        return trimmed.indexOf('#EXTM3U') === 0 && 
              (trimmed.indexOf('#EXTINF') !== -1 || trimmed.indexOf('#EXT-X-STREAM-INF') !== -1);
    }

    function dispatchBlobM3u8ToApp(m3u8Content) {
        if (!m3u8Content || hasDispatchedAny === 1) return;
        hasDispatchedAny = 1;
        isFinished = 1;
        stopTimeout();

        bridgeLog('🎯 [BLOB-DISPATCH] (Dành cho Android) Đã tìm thấy M3U8! Đang gửi lên App...');
        bridgeLog("🎯 Bắt link thành công! Đang xử lý video...", true);

        try {
            if (window.SnifferBridge && typeof window.SnifferBridge.playM3u8Content === 'function') {
                SnifferBridge.playM3u8Content(m3u8Content, JSON.stringify({"Origin": "https://embed.streamc.xyz", "Referer": refUrl}));
            }
        } catch(e) {
            bridgeLog('❌ [BLOB-ERROR]: ' + e.message);
        }
    }

    try {
        if (typeof URL !== 'undefined' && URL.createObjectURL) {
            var originalCreateObjectURL = URL.createObjectURL;
            URL.createObjectURL = function(blob) {
                var blobUrl = originalCreateObjectURL.apply(this, arguments);

                if (isFinished === 0 && blob && (blob instanceof Blob || blob instanceof File)) {
                    var processContent = function(content) {
                        if (isValidM3U8(content)) {
                            dispatchBlobM3u8ToApp(content);
                        }
                    };

                    if (typeof blob.text === 'function') {
                        blob.text().then(processContent).catch(function(){});
                    } else {
                        var reader = new FileReader();
                        reader.onload = function(e) { processContent(e.target.result); };
                        reader.readAsText(blob);
                    }
                }
                return blobUrl;
            };
        }
    } catch (e) {}

    // =========================================================================
    // CƠ CHẾ 2: URL NETWORK SNIFFER (Chuyên trị iOS do thiếu MSE)
    // =========================================================================
    function isDirectStreamUrl(url) {
        if (!url || typeof url !== 'string') return false;
        if (url.startsWith('blob:') || url.startsWith('data:')) return false;
        const cleanUrl = url.split('?')[0].toLowerCase();
        return cleanUrl.endsWith('.m3u8') || cleanUrl.endsWith('.mp4');
    }

    function dispatchUrlToApp(playUrl) {
        if (hasDispatchedAny === 1) return;
        hasDispatchedAny = 1;
        isFinished = 1;
        stopTimeout();

        bridgeLog('🎯 [NETWORK-DISPATCH] (Dành cho iOS) Đã bắt được M3U8 trực tiếp!');
        bridgeLog("🎯 Bắt link thành công! Đang phát...", true);

        try {
            var headersJson = JSON.stringify({
                "Origin": "https://embed.streamc.xyz",
                "Referer": refUrl
            });
            if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
                window.SnifferBridge.play(playUrl, headersJson);
            }
        } catch(err) {
            bridgeLog('❌ [NETWORK-ERROR]: ' + err.message);
        }
    }

    function processDetectedUrl(url) {
        if (!url || hasDispatchedAny === 1) return;
        try { url = new URL(url, window.location.href).href; } catch(e) {}
        if (isDirectStreamUrl(url)) {
            dispatchUrlToApp(url);
        }
    }

    // 1. Hook Fetch
    const rawFetch = window.fetch;
    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
        processDetectedUrl(url);
        return rawFetch.apply(this, args);
    };

    // 2. Hook XHR
    const rawXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        processDetectedUrl(url);
        return rawXHROpen.apply(this, arguments);
    };

    // 3. Hook HTMLMediaElement (Thẻ Video gốc của Safari)
    try {
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
        if (originalSrcDescriptor && originalSrcDescriptor.set) {
            Object.defineProperty(HTMLMediaElement.prototype, 'src', {
                set: function (val) {
                    processDetectedUrl(val);
                    return originalSrcDescriptor.set.call(this, val);
                },
                get: function () {
                    return originalSrcDescriptor.get.call(this);
                }
            });
        }
    } catch(e) {}

    // 4. Scan DOM fallback cho thẻ <video src> hoặc <source>
    function scanDOM() {
        if (hasDispatchedAny === 1) return;
        var elements = document.querySelectorAll('video, source');
        for (var i = 0; i < elements.length; i++) {
            var src = elements[i].src || elements[i].getAttribute('src');
            if (src) processDetectedUrl(src);
        }
    }
    
    const domObserver = new MutationObserver(scanDOM);
    domObserver.observe(document.documentElement, { childList: true, subtree: true });
    setInterval(scanDOM, 1000);

})();
    `;
}

function parseCategoriesResponse(apiResponseJson) {
    var genres = [
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "Hài", slug: "phim-hai" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Giả Tưởng", slug: "gia-tuong" },
        { name: "Lịch Sử", slug: "lich-su" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Nhạc", slug: "phim-nhac" },
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Lãng Mạn", slug: "lang-man" },
        { name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong" },
        { name: "Gây Cấn", slug: "gay-can" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Miền Tây", slug: "mien-tay" },
        { name: "Phim 18+", slug: "phim-18" }
    ];
    return JSON.stringify(genres);
}

function parseCountriesResponse(apiResponseJson) {
    var countries = [
        { name: "Âu Mỹ", value: "au-my" },
        { name: "Anh", value: "anh" },
        { name: "Trung Quốc", value: "trung-quoc" },
        { name: "Indonesia", value: "indonesia" },
        { name: "Việt Nam", value: "viet-nam" },
        { name: "Pháp", value: "phap" },
        { name: "Hồng Kông", value: "hong-kong" },
        { name: "Hàn Quốc", value: "han-quoc" },
        { name: "Nhật Bản", value: "nhat-ban" },
        { name: "Thái Lan", value: "thai-lan" },
        { name: "Đài Loan", value: "dai-loan" },
        { name: "Nga", value: "nga" },
        { name: "Hà Lan", value: "ha-lan" },
        { name: "Philippines", value: "philippines" },
        { name: "Ấn Độ", value: "an-do" },
        { name: "Quốc gia khác", value: "quoc-gia-khac" }
    ];
    return JSON.stringify(countries);
}

function parseYearsResponse(apiResponseJson) {
    var years = [];
    for (var i = 2026; i >= 2004; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    return "https://img.phimapi.com/" + path;
}

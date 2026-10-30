// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "phimhdcs",
        "name": "PhimHDCS",
        "version": "1.2.1",
        "baseUrl": "https://phimhdcss.com",
        "iconUrl": "https://phimhdcss.com/favicon.ico",
        "isEnabled": true,
        "playerType": "exoplayer",
        "type": "MOVIE"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[PhimHDCS] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[PhimHDCS] " + msg);
    }
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'top-phim-ngay', title: 'Top Phim Ngày', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'bang-xep-hang', title: 'Phim Đề Cử', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-ngan', title: 'Phim Ngắn', type: 'Horizontal', path: 'the-loai' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'the-loai' },
        { slug: 'phim-moi', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi' },
        { name: 'Top phim ngày', slug: 'top-phim-ngay' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' },
        { name: 'Phim ngắn', slug: 'phim-ngan' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Sắp xếp', value: '' },
            { name: 'Mới cập nhật', value: 'update' },
            { name: 'Thời gian đăng', value: 'create' },
            { name: 'Năm sản xuất', value: 'year' },
            { name: 'Lượt xem', value: 'view' }
        ],
        type: [
            { name: 'Phim bộ', value: 'series' },
            { name: 'Phim lẻ', value: 'single' }
        ],
        category: [
            { name: 'Thể loại', value: '' },
            { name: 'Âm Nhạc', value: '16' }, { name: 'Báo Thù', value: '52' }, { name: 'Bí ẩn', value: '13' },
            { name: 'Boyloves', value: '29' }, { name: 'Chiến Tranh', value: '18' }, { name: 'Chính kịch', value: '1' },
            { name: 'Chuyển Thể', value: '28' }, { name: 'Cổ Trang', value: '15' }, { name: 'Dân Quốc', value: '30' },
            { name: 'Đô Thị', value: '35' }, { name: 'Gây Cấn', value: '44' }, { name: 'Gia Đình', value: '3' },
            { name: 'Giả Tưởng', value: '43' }, { name: 'Hài Hước', value: '5' }, { name: 'Hành Động', value: '10' },
            { name: 'Hệ Thống', value: '51' }, { name: 'Hiện Đại', value: '36' }, { name: 'Hình Sự', value: '37' },
            { name: 'Hoạt Hình', value: '4' }, { name: 'Học Đường', value: '20' }, { name: 'Huyền Huyễn', value: '25' },
            { name: 'Khoa Học', value: '17' }, { name: 'Khoa Học Viễn Tưởng', value: '42' }, { name: 'Kinh Di Đồ', value: '12' },
            { name: 'Kỳ Ảo', value: '53' }, { name: 'Lãng Mạn', value: '40' }, { name: 'Lịch Sử', value: '46' },
            { name: 'Netflix', value: '48' }, { name: 'Ngôn Tình', value: '32' }, { name: 'Ngọt Sủng', value: '54' },
            { name: 'Phá Án', value: '11' }, { name: 'Phiêu Lưu', value: '9' }, { name: 'Phim 18+', value: '24' },
            { name: 'Phim ngắn', value: '38' }, { name: 'Tâm Lý', value: '6' }, { name: 'Thần Thoại', value: '23' },
            { name: 'Tiên Hiệp', value: '26' }, { name: 'Tình Cảm', value: '2' }, { name: 'Tội Phạm', value: '39' },
            { name: 'Trọng Sinh', value: '56' }, { name: 'TV Shows', value: '8' }, { name: 'Viễn Tưởng', value: '14' },
            { name: 'Võ Thuật', value: '21' }, { name: 'Xuyên Không', value: '27' }, { name: 'Xuyên Sách', value: '50' },
            { name: 'Y Khoa', value: '31' }
        ],
        country: [
            { name: 'Quốc gia', value: '' },
            { name: 'Thái Lan', value: '1' }, { name: 'Trung Quốc', value: '5' }, { name: 'Hàn Quốc', value: '6' },
            { name: 'Nhật Bản', value: '4' }, { name: 'Âu Mỹ', value: '2' }, { name: 'Hồng Kông', value: '26' },
            { name: 'Đài Loan', value: '22' }, { name: 'Việt Nam', value: '34' }, { name: 'Ấn Độ', value: '8' },
            { name: 'Anh', value: '7' }, { name: 'Pháp', value: '10' }, { name: 'Đức', value: '23' },
            { name: 'Tây Ban Nha', value: '12' }, { name: 'Thổ Nhĩ Kỳ', value: '3' }, { name: 'Nga', value: '18' },
            { name: 'Úc', value: '17' }, { name: 'Canada', value: '13' }, { name: 'Brazil', value: '28' },
            { name: 'Singapore', value: '45' }, { name: 'Philippines', value: '20' }, { name: 'Indonesia', value: '16' }
        ],
        language: [
            { name: 'Ngôn ngữ', value: '' },
            { name: 'Vietsub', value: 'Vietsub' },
            { name: 'Thuyết Minh', value: 'Thuyết Minh' },
            { name: 'Vietsub + Thuyết Minh', value: 'Vietsub + Thuyết Minh' },
            { name: 'Lồng Tiếng', value: 'Lồng Tiếng' }
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
        var baseUrl = "https://phimhdcss.com";

        var hasFilter = filters.sort || filters.category || filters.country || filters.year || filters.type || filters.language;

        if (hasFilter) {
            var params = [];
            if (filters.sort) params.push("filter[sort]=" + filters.sort);
            if (filters.type) params.push("filter[type]=" + filters.type);
            if (filters.category) params.push("filter[category]=" + filters.category);
            if (filters.country) params.push("filter[region]=" + filters.country);
            if (filters.year) params.push("filter[year]=" + filters.year);
            if (filters.language) params.push("filter[language]=" + encodeURIComponent(filters.language));
            if (page > 1) params.push("page=" + page);

            return baseUrl + "/?" + params.join("&");
        }

        var path = "";
        if (slug === 'phim-de-cu') {
            path = "/danh-sach/bang-xep-hang";
        } else if (slug === 'bang-xep-hang' || slug === 'top-phim-ngay' || slug === 'phim-chieu-rap' || slug === 'phim-moi') {
            path = "/danh-sach/" + slug;
        } else {
            path = "/the-loai/" + slug;
        }

        var url = baseUrl + path;
        if (page > 1) {
            url += "?page=" + page;
        }

        return url;
    } catch (e) {
        return "https://phimhdcss.com/danh-sach/phim-moi";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var url = "https://phimhdcss.com/?search=" + encodeURIComponent(keyword).replace(/%20/g, "+");
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    var path = slug.startsWith("/") ? slug.substring(1) : slug;
    return "https://phimhdcss.com/" + path;
}

function getUrlCategories() {
    return "https://phimhdcss.com/the-loai";
}

function getUrlCountries() {
    return "https://phimhdcss.com/quoc-gia";
}

function getUrlYears() {
    return "https://phimhdcss.com/nam";
}

// =============================================================================
// HTML PARSERS
// =============================================================================

function parseDynamicFilters(html) {
    var result = {};
    try {
        var parseSelect = function (namePattern) {
            var list = [];
            var selectMatch = new RegExp('<select[^>]+name="' + namePattern + '"[\\s\\S]*?>([\\s\\S]*?)<\\/select>', 'i').exec(html);
            if (selectMatch) {
                var optionsHtml = selectMatch[1];
                var optionPattern = /<option\s+value="([^"]*)"[^>]*>\s*([\s\S]*?)\s*<\/option>/gi;
                var optMatch;
                while ((optMatch = optionPattern.exec(optionsHtml)) !== null) {
                    var val = optMatch[1];
                    var name = optMatch[2].replace(/<[^>]*>/g, "").trim();
                    if (val && name) list.push({ name: name, value: val });
                }
            }
            return list;
        };

        result.category = parseSelect('filter\\[category\\]');
        result.country = parseSelect('filter\\[region\\]');
        result.language = parseSelect('filter\\[language\\]');
        result.year = parseSelect('filter\\[year\\]');
        result.sort = parseSelect('filter\\[sort\\]');
        result.type = parseSelect('filter\\[type\\]');
    } catch (e) { }
    return result;
}

function parseListResponse(htmlContent) {
    try {
        var movies = [];
        var itemPattern = /<li\s+class="item[^"]*">\s*<span\s+class="label">([^<]+)<\/span>\s*<a\s+href="https:\/\/phimhdcss\.com\/([^"]+)"\s+title="([^"]+)">\s*<img[^>]+src="([^"]+)"[^>]*\/?>[\s\S]*?<div\s+class="name">[\s\S]*?<a[^>]+title="([^"]+)">([^<]+)<\/a>/gi;
        var match;

        while ((match = itemPattern.exec(htmlContent)) !== null) {
            var label = match[1].trim();
            var slug = match[2];
            var title = match[3];
            var posterUrl = match[4];
            var fullTitle = match[5];

            var year = 0;
            var yearMatch = /(\d{4})/.exec(fullTitle);
            if (yearMatch) year = parseInt(yearMatch[1]);

            var episode_current = "";
            var epMatch = /(Tập \d+|Hoàn [tT]ất \(\d+\/\d+\)|Hoàn Tất \(\d+\/\d+\)|Full)/i.exec(label);
            if (epMatch) episode_current = epMatch[1];

            var lang = "";
            var langPart = label.replace(episode_current, "").trim();
            if (langPart.indexOf("+") === 0) langPart = langPart.substring(1).trim();
            lang = langPart || "";

            var quality = "";
            if (label.indexOf('Full') > -1) quality = "Full";
            else if (label.indexOf('HD') > -1) quality = "HD";

            movies.push({
                id: slug,
                title: title,
                posterUrl: posterUrl.indexOf('http') === 0 ? posterUrl : 'https://phimhdcss.com' + posterUrl,
                backdropUrl: posterUrl.indexOf('http') === 0 ? posterUrl : 'https://phimhdcss.com' + posterUrl,
                year: year,
                quality: quality,
                episode_current: episode_current,
                lang: lang
            });
        }

        var totalPages = 1;
        var pagePattern = /<li><a\s+href="[^"]+page=(\d+)">(\d+)<\/a><\/li>/gi;
        var match2;
        while ((match2 = pagePattern.exec(htmlContent)) !== null) {
            var pageNum = parseInt(match2[2]);
            if (pageNum > totalPages) totalPages = pageNum;
        }

        var currentPage = 1;
        var currentPageMatch = /<li><a\s+href="javascript:void\(0\)"\s+class="current">(\d+)<\/a><\/li>/i.exec(htmlContent);
        if (currentPageMatch) currentPage = parseInt(currentPageMatch[1]);

        var filterOptions = parseDynamicFilters(htmlContent);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalPages * 20,
                itemsPerPage: 20
            },
            filterOptions: filterOptions
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 } });
    }
}

function parseSearchResponse(htmlContent) {
    return parseListResponse(htmlContent);
}

function parseMovieDetail(htmlContent) {
    try {
        var title = "";
        var titleMatch = /<span\s+class="title"\s+itemprop="name">([^<]+)<\/span>/i.exec(htmlContent);
        if (titleMatch) title = titleMatch[1].trim();

        var originalTitle = "";
        var origMatch = /<span\s+class="real-name">([^<]+)<\/span>/i.exec(htmlContent);
        if (origMatch) originalTitle = origMatch[1].trim();

        var posterUrl = "";
        var posterMatch = /<img\s+itemprop="image"\s+src="([^"]+)"/i.exec(htmlContent);
        if (posterMatch) posterUrl = posterMatch[1];
        if (posterUrl && posterUrl.indexOf('http') !== 0) posterUrl = 'https://phimhdcss.com' + (posterUrl.startsWith('/') ? '' : '/') + posterUrl;

        var description = "";
        var descMatch = /<div\s+class="tab">[\s\S]*?<div\s+style="text-align:\s+justify;">([\s\S]*?)<\/div>/i.exec(htmlContent);
        if (!descMatch) descMatch = /<div\s+style="text-align:\s*justify;">([\s\S]*?)<\/div>/i.exec(htmlContent);
        if (descMatch) description = descMatch[1].replace(/<[^>]*>/g, "").trim();

        function extractInfo(label) {
            var regex = new RegExp('<dt>' + label + ':<\/dt>\\s*<dd>([\\s\\S]*?)<\/dd>', 'i');
            var match = regex.exec(htmlContent);
            if (match) {
                return match[1].replace(/<[^>]*>/g, "").trim();
            }
            return "";
        }

        var director = extractInfo("Đạo diễn");
        var duration = extractInfo("Thời lượng");
        var totalEpisodes = extractInfo("Số tập");
        var statusInfo = extractInfo("Tình trạng");
        var language = extractInfo("Ngôn ngữ");
        var prodYear = extractInfo("Năm sản xuất");
        var countryTag = extractInfo("Quốc gia");

        var year = 0;
        if (prodYear) year = parseInt(prodYear);
        if (!year) {
            var yearMatch = /(\d{4})/.exec(originalTitle);
            if (yearMatch) year = parseInt(yearMatch[1]);
        }

        var rating = 0;
        var ratingMatch = /<span\s+class="average"\s+id="average"\s+itemprop="ratingValue">([^<]+)<\/span>/i.exec(htmlContent);
        if (ratingMatch) rating = parseFloat(ratingMatch[1]);

        var episode_current = "";
        var statusMatch = /<dd\s+class="film-status">[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i.exec(htmlContent);
        if (statusMatch) episode_current = statusMatch[1].replace(/<[^>]*>/g, "").trim();
        if (!episode_current) episode_current = statusInfo;

        var categories = [];
        var catPattern = /<a\s+href="https:\/\/phimhdcss\.com\/the-loai\/[^"]+"\s+tite="([^"]+)">/gi;
        var match;
        while ((match = catPattern.exec(htmlContent)) !== null) categories.push(match[1].trim());
        if (categories.length === 0) {
            catPattern = /<a\s+href="https:\/\/phimhdcss\.com\/the-loai\/[^"]+"\s+title="([^"]+)">/gi;
            while ((match = catPattern.exec(htmlContent)) !== null) categories.push(match[1].trim());
        }

        var countries = [];
        var countryPattern = /<a\s+href="https:\/\/phimhdcss\.com\/quoc-gia\/[^"]+"\s+tite="([^"]+)">/gi;
        while ((match = countryPattern.exec(htmlContent)) !== null) countries.push(match[1].trim());
        if (countries.length === 0 && countryTag) countries.push(countryTag);

        var actors = [];
        var actorPattern = /<a\s+href="https:\/\/phimhdcss\.com\/dien-vien\/[^"]+"\s+tite="Diễn viên ([^"]+)">/gi;
        while ((match = actorPattern.exec(htmlContent)) !== null) actors.push(match[1].trim());
        if (actors.length === 0) {
            actorPattern = /<a\s+href="https:\/\/phimhdcss\.com\/dien-vien\/[^"]+"\s+title="Diễn viên ([^"]+)">/gi;
            while ((match = actorPattern.exec(htmlContent)) !== null) actors.push(match[1].trim());
        }

        // =====================================================================
        // SERVER TABS: Gộp các block cùng ngôn ngữ thành 1 tab duy nhất
        // VD: 2 block "Vietsub" (TikTok + HDC) → 1 tab "Vietsub"
        // Mỗi tập có ids[] để user chọn server khi bấm
        // =====================================================================
        var servers = [];
        var serverMap = {};
        var serverOrder = [];
        var serverPattern = /<div[^>]*class="server-episode-block"[^>]*>[\s\S]*?Danh sách\s*(?:Sever)?\s*([^:]+):[\s\S]*?<div[^>]*class="list-episode[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;

        while ((match = serverPattern.exec(htmlContent)) !== null) {
            var serverName = match[1].trim()
                .replace(/^Server\s+/i, '')
                .replace(/^z/i, '')
                .replace(/\s*#\d+$/, '')
                .trim();
            var episodesHtml = match[2];
            var rawEps = [];
            var epPattern = /<a\s+href="([^"]+)"\s+id=['"]no-link['"][\s\S]*?title="([^"]+)"/gi;
            var epMatch;
            while ((epMatch = epPattern.exec(episodesHtml)) !== null) {
                var epUrl = epMatch[1];
                if (epUrl.indexOf('http') !== 0) epUrl = 'https://phimhdcss.com' + (epUrl.startsWith('/') ? '' : '/') + epUrl;
                rawEps.push({ url: epUrl, name: epMatch[2].trim() });
            }
            if (rawEps.length > 0) {
                var firstNum = /Tập\s+(\d+)/i.exec(rawEps[0].name);
                var lastNum = /Tập\s+(\d+)/i.exec(rawEps[rawEps.length - 1].name);
                if (firstNum && lastNum) {
                    if (parseInt(firstNum[1]) > parseInt(lastNum[1])) rawEps.reverse();
                } else {
                    rawEps.reverse();
                }

                if (!serverMap[serverName]) {
                    serverMap[serverName] = [];
                    serverOrder.push(serverName);
                }
                for (var ei = 0; ei < rawEps.length; ei++) {
                    var isDup = false;
                    for (var si = 0; si < serverMap[serverName].length; si++) {
                        if (serverMap[serverName][si].name === rawEps[ei].name) { isDup = true; break; }
                    }
                    if (!isDup) serverMap[serverName].push(rawEps[ei]);
                }
            }
        }

        for (var oi = 0; oi < serverOrder.length; oi++) {
            var sName = serverOrder[oi];
            var mergedEps = serverMap[sName];
            var episodes = [];
            for (var mi = 0; mi < mergedEps.length; mi++) {
                var ep = mergedEps[mi];
                episodes.push({
                    id: ep.url + "|data:server:auto",
                    name: ep.name,
                    slug: ep.url,
                    ids: [
                        { name: "Tự động", url: ep.url + "|data:server:auto" },
                        { name: "StreamXemPhimHD", url: ep.url + "|data:server:hdc" },
                        { name: "TikTok", url: ep.url + "|data:server:tiktok" },
                        { name: "Dự phòng (StreamC)", url: ep.url + "|data:server:streamc" }
                    ]
                });
            }
            servers.push({ name: sName, episodes: episodes });
        }

        var slug = "";
        var slugMatch = /<link\s+rel="canonical"\s+href="https:\/\/phimhdcss\.com\/([^"\/]+)"/i.exec(htmlContent);
        if (slugMatch) slug = slugMatch[1];

        // Nút Xem Phim (phim lẻ)
        var extraUrl = "";
        var btnPlayMatch = /<a\s+class="btn-see btn btn-danger btn-stream-link"\s+href="([^"]+)"/i.exec(htmlContent);
        if (btnPlayMatch) extraUrl = btnPlayMatch[1];
        if (extraUrl && extraUrl.indexOf('http') !== 0) extraUrl = 'https://phimhdcss.com' + (extraUrl.startsWith('/') ? '' : '/') + extraUrl;

        // Fallback phim lẻ không có block tập phim
        if (servers.length === 0 && extraUrl) {
            servers.push({
                name: "Server #1",
                episodes: [{
                    id: extraUrl + "|data:server:auto",
                    name: "Full",
                    slug: extraUrl,
                    ids: [
                        { name: "Tự động", url: extraUrl + "|data:server:auto" },
                        { name: "StreamXemPhimHD", url: extraUrl + "|data:server:hdc" },
                        { name: "TikTok", url: extraUrl + "|data:server:tiktok" },
                        { name: "Dự phòng (StreamC)", url: extraUrl + "|data:server:streamc" }
                    ]
                }]
            });
        }

        var fullDesc = description;
        if (duration) fullDesc += "\nThời lượng: " + duration;
        if (totalEpisodes) fullDesc += "\nSố tập: " + totalEpisodes;
        if (statusInfo) fullDesc += "\nTình trạng: " + statusInfo;

        return JSON.stringify({
            id: slug,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: fullDesc,
            year: year,
            rating: rating,
            quality: "",
            servers: servers,
            episode_current: episode_current,
            lang: language,
            category: categories.join(", "),
            country: countries.join(", "),
            director: director,
            casts: actors.join(", "),
            extra: extraUrl
        });
    } catch (error) {
        return "null";
    }
}

// =============================================================================
// STREAM RESOLUTION
// =============================================================================

function _decodeBase64(str) {
    try {
        var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var result = '';
        str = String(str).replace(/[^A-Za-z0-9+\/=]/g, '');
        var len = str.length;
        for (var i = 0; i < len; i += 4) {
            var a = lookup.indexOf(str.charAt(i));
            var b = i + 1 < len ? lookup.indexOf(str.charAt(i + 1)) : 0;
            var c = i + 2 < len ? lookup.indexOf(str.charAt(i + 2)) : -1;
            var d = i + 3 < len ? lookup.indexOf(str.charAt(i + 3)) : -1;
            result += String.fromCharCode((a << 2) | (b >> 4));
            if (c !== -1) result += String.fromCharCode(((b & 15) << 4) | (c >> 2));
            if (d !== -1) result += String.fromCharCode(((c & 3) << 6) | d);
        }
        return result;
    } catch (e) { return null; }
}

function _decodeChunksWithSalt(chunks, saltString) {
    var revBase64 = chunks.join('');
    var base64 = revBase64.split('').reverse().join('');
    if (saltString) base64 = base64.replace(saltString, '');
    return _decodeBase64(base64);
}

function _decodeOxData(htmlContent) {
    var saltMatch = /(?:const|let|var)\s+_0xS\s*=\s*["']([^"']+)["']/.exec(htmlContent);
    var salt = saltMatch ? saltMatch[1] : "";

    var oxData = null;
    var realObjMatch = /(?:const|let|var)\s+realObj\s*=\s*JSON\.parse\(\s*atob\(\s*["']([^"']+)["']\s*\)\s*\)/i.exec(htmlContent);
    if (realObjMatch) {
        try {
            var decoded = _decodeBase64(realObjMatch[1]);
            if (decoded) oxData = JSON.parse(decoded);
        } catch (e) {}
    }
    if (!oxData) {
        var dataMatch = /(?:const|let|var)\s+_0xData\s*=\s*(\{[\s\S]*?\})\s*;/.exec(htmlContent);
        if (dataMatch) {
            try {
                var startIdx = dataMatch.index + dataMatch[0].indexOf('{');
                var braceCount = 0, jsonEnd = -1;
                for (var j = startIdx; j < htmlContent.length && j < startIdx + 100000; j++) {
                    if (htmlContent[j] === '{') braceCount++;
                    else if (htmlContent[j] === '}') {
                        braceCount--;
                        if (braceCount === 0) { jsonEnd = j + 1; break; }
                    }
                }
                if (jsonEnd > 0) oxData = JSON.parse(htmlContent.substring(startIdx, jsonEnd));
            } catch (e) {}
        }
    }

    if (!oxData) {
        var embeddedMatch = /\.dataset\.link\s*=\s*["']([^"']+)["']/i.exec(htmlContent);
        if (embeddedMatch) oxData = { fallback: [embeddedMatch[1]] };
    }
    return { oxData: oxData, salt: salt };
}

function _decodeStreamServer(value) {
    var candidate = String(value || "");
    if (candidate.indexOf("http") === 0) return candidate;
    var decoded = _decodeBase64(candidate.split("").reverse().join(""));
    return decoded && decoded.indexOf("http") === 0 ? decoded : "";
}

var _phcsSessionCache = {};

function _phcsGetSession(seedKey) {
    var k = String(seedKey || "default");
    if (_phcsSessionCache[k]) return _phcsSessionCache[k];
    var chars = "0123456789abcdef";
    function genHex(len) {
        var out = "";
        for (var i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
        return out;
    }
    var raw = genHex(32);
    var uuid = raw.substring(0, 8) + "-" + raw.substring(8, 12) + "-4" + raw.substring(13, 16) + "-a" + raw.substring(17, 20) + "-" + raw.substring(20);
    _phcsSessionCache[k] = {
        t: Date.now(),
        sid: genHex(16),
        secret: genHex(32),
        pw: uuid
    };
    return _phcsSessionCache[k];
}

function _phcsBase64Encode(str) {
    try {
        if (typeof btoa === "function") return btoa(str);
    } catch (e) {}
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var i = 0;
    str = String(str || "");
    while (i < str.length) {
        var chr1 = str.charCodeAt(i++);
        var chr2 = i < str.length ? str.charCodeAt(i++) : NaN;
        var chr3 = i < str.length ? str.charCodeAt(i++) : NaN;
        var enc1 = chr1 >> 2;
        var enc2 = ((chr1 & 3) << 4) | (isNaN(chr2) ? 0 : (chr2 >> 4));
        var enc3 = isNaN(chr2) ? 64 : (((chr2 & 15) << 2) | (isNaN(chr3) ? 0 : (chr3 >> 6)));
        var enc4 = isNaN(chr3) ? 64 : (chr3 & 63);
        output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
    }
    return output;
}

function _phcsJsonRequest(url, method, body, headers) {
    if (typeof httpRequest !== "function") return "";
    try {
        var response = httpRequest(url, {
            method: method || "GET",
            body: body || undefined,
            headers: headers || { "User-Agent": "Mozilla/5.0", "Accept": "application/json,*/*" }
        });
        return response && response.isSuccessful ? String(response.body || "") : "";
    } catch (e) { return ""; }
}

function _phcsAbsolutizeUrl(baseUrl, rel) {
    rel = String(rel || "").trim();
    if (!rel) return "";
    if (/^https?:\/\//i.test(rel)) return rel;
    if (rel.indexOf("//") === 0) return "https:" + rel;
    var m = String(baseUrl || "").match(/^(https?:\/\/[^\/]+)(\/[^?#]*)?/i);
    if (!m) return rel;
    var origin = m[1];
    var path = m[2] || "/";
    if (rel.charAt(0) === "/") return origin + rel;
    var dir = path.substring(0, path.lastIndexOf("/") + 1);
    return origin + dir + rel;
}

function _phcsRewriteManifestUrls(manifestText, baseUrl) {
    var lines = String(manifestText || "").split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
        var raw = lines[i].trim();
        if (!raw) continue;
        if (raw.charAt(0) === "#") {
            if (raw.indexOf('URI="') !== -1) {
                lines[i] = raw.replace(/URI="([^"]+)"/g, function(_, u) {
                    return 'URI="' + _phcsAbsolutizeUrl(baseUrl, u) + '"';
                });
            }
            continue;
        }
        lines[i] = _phcsAbsolutizeUrl(baseUrl, raw);
    }
    return lines.join("\n");
}

function _phcsMergeSubtitles(primarySubs, extraSubs) {
    var result = [];
    var seen = {};
    var lists = [primarySubs || [], extraSubs || []];
    for (var li = 0; li < lists.length; li++) {
        var arr = lists[li];
        for (var i = 0; i < arr.length; i++) {
            var s = arr[i];
            if (!s || !s.url) continue;
            var key = String(s.lang || "").toLowerCase() + "|" + String(s.url);
            if (seen[key]) continue;
            seen[key] = true;
            result.push({
                lang: s.lang || "Vi",
                url: s.url,
                mimeType: s.mimeType || (/\.vtt([?#]|$)/i.test(s.url) ? "text/vtt" : "application/x-subrip"),
                isAutoTranslated: !!s.isAutoTranslated
            });
        }
    }
    return result;
}

function _phcsExtractHdcSubtitlesFromHtml(htmlContent) {
    var subtitles = [];
    var seenLang = {};
    var html = String(htmlContent || "");

    // 1. Parse window.streamxDualSubtitleTracks = [...]
    var dualMatch = html.match(/window\.streamxDualSubtitleTracks\s*=\s*(\[[\s\S]*?\])\s*;/i);
    if (dualMatch) {
        try {
            var tracks = JSON.parse(dualMatch[1]);
            for (var i = 0; i < tracks.length; i++) {
                var tr = tracks[i];
                if (tr && tr.url) {
                    var langName = String(tr.label || tr.lang || "Sub").trim();
                    if (!seenLang[langName]) {
                        seenLang[langName] = true;
                        subtitles.push({
                            lang: langName,
                            url: String(tr.url).trim(),
                            mimeType: "application/x-subrip",
                            isAutoTranslated: false
                        });
                    }
                }
            }
        } catch (e) {}
    }

    // 2. Parse [Label]https://... pattern (playerjsSubtitle)
    var subRe = /\[([^\]]+)\](https?:\/\/[^"',;\s\\]+)/g;
    var sm;
    while ((sm = subRe.exec(html)) !== null) {
        var label = sm[1].trim();
        var sUrl = sm[2].trim();
        if (!seenLang[label]) {
            seenLang[label] = true;
            subtitles.push({
                lang: label,
                url: sUrl,
                mimeType: "application/x-subrip",
                isAutoTranslated: false
            });
        }
    }
    return subtitles;
}

function _phcsFetchHdcSubtitlesOnly(hdcUrl) {
    if (!hdcUrl) return [];
    var ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var html = _phcsJsonRequest(hdcUrl, "GET", "", {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://phimhdcss.com/",
        "Sec-Fetch-Dest": "iframe",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site"
    });
    return _phcsExtractHdcSubtitlesFromHtml(html);
}

// Bóc trực tiếp m3u8Content + subtitles từ play.streamxemphimhd.site
function _phcsResolveHdcDirect(hdcUrl, pageRef) {
    if (!hdcUrl) return null;
    var idMatch = String(hdcUrl).match(/\/video\/([a-zA-Z0-9_-]+)/i);
    var videoId = idMatch ? idMatch[1] : "";
    if (!videoId) return null;

    var origin = "https://play.streamxemphimhd.site";
    var ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    // Bước 1: Tải trang iframe để lấy danh sách phụ đề SRT
    var subtitles = _phcsFetchHdcSubtitlesOnly(hdcUrl);

    var sess = _phcsGetSession("hdc_" + videoId);
    var srvMs = sess.t;

    // Bước 2: Gọi guard_issue.php với fp_runtime, fp_sid, fp_context
    var fpParts = [srvMs, "play.streamxemphimhd.site", "/video/" + videoId, "1920x1080", "vi-VN", 450];
    var fpRuntime = _phcsBase64Encode(fpParts.join("|")).replace(/=+$/g, "");
    var guardBody = "t=" + encodeURIComponent(String(srvMs))
        + "&fp_runtime=" + encodeURIComponent(fpRuntime)
        + "&id=" + encodeURIComponent(videoId)
        + "&fp_sid=" + encodeURIComponent(sess.sid)
        + "&fp_context=" + encodeURIComponent(sess.secret);

    var guardRaw = _phcsJsonRequest(origin + "/player/guard_issue.php", "POST", guardBody, {
        "User-Agent": ua,
        "Accept": "*/*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Referer": hdcUrl,
        "Origin": origin,
        "X-Requested-With": "XMLHttpRequest",
        "X-FP-Runtime": fpRuntime,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    });

    var guardToken = "";
    try { guardToken = JSON.parse(guardRaw).token || ""; } catch (e) {}
    if (!guardToken) {
        log("PHIMHDCS_DEBUG HDC guard_issue empty token, subtitles=" + subtitles.length);
        return { subtitlesOnly: true, subtitles: subtitles };
    }

    // Bước 3: Gọi do=getVideo với X-FP-Guard & X-FP-Context
    var getVideoUrl = origin + "/player/index.php?data=" + encodeURIComponent(videoId) + "&do=getVideo&fp_sid=" + encodeURIComponent(sess.sid);
    var getVideoBody = "hash=" + encodeURIComponent(videoId)
        + "&r=" + encodeURIComponent("https://phimhdcss.com/")
        + "&fp_guard=" + encodeURIComponent(guardToken);

    var videoRaw = _phcsJsonRequest(getVideoUrl, "POST", getVideoBody, {
        "User-Agent": ua,
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Referer": hdcUrl,
        "Origin": origin,
        "X-Requested-With": "XMLHttpRequest",
        "X-FP-Guard": guardToken,
        "X-FP-Context": sess.secret,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    });

    var securedLink = "";
    try {
        var vJson = JSON.parse(videoRaw);
        securedLink = vJson.securedLink || vJson.videoSource || (vJson.videoSources && vJson.videoSources[0] ? vJson.videoSources[0].file : "");
    } catch (e) {}

    if (!securedLink) {
        log("PHIMHDCS_DEBUG HDC getVideo no securedLink, subtitles=" + subtitles.length);
        return { subtitlesOnly: true, subtitles: subtitles };
    }

    var masterUrl = _phcsAbsolutizeUrl(origin, securedLink);
    if (masterUrl.indexOf("fp_sid=") === -1) {
        masterUrl += (masterUrl.indexOf("?") === -1 ? "?" : "&") + "fp_sid=" + encodeURIComponent(sess.sid);
    }

    var m3u8Headers = {
        "User-Agent": ua,
        "Accept": "*/*",
        "Referer": hdcUrl,
        "Origin": origin,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    };

    // Bước 4: Tải master.m3u8 và variant playlist
    var masterText = _phcsJsonRequest(masterUrl, "GET", "", m3u8Headers);
    if (!masterText || masterText.indexOf("#EXTM3U") === -1) {
        return {
            url: masterUrl,
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: {
                "User-Agent": ua,
                "Referer": hdcUrl,
                "Origin": origin
            },
            subtitles: subtitles
        };
    }

    var variantUrl = "";
    var mLines = masterText.split(/\r?\n/);
    for (var mi = 0; mi < mLines.length; mi++) {
        var ml = mLines[mi].trim();
        if (!ml || ml.charAt(0) === "#") continue;
        variantUrl = _phcsAbsolutizeUrl(masterUrl, ml);
        break;
    }

    if (variantUrl) {
        if (variantUrl.indexOf("fp_sid=") === -1) {
            variantUrl += (variantUrl.indexOf("?") === -1 ? "?" : "&") + "fp_sid=" + encodeURIComponent(sess.sid);
        }
        var variantText = _phcsJsonRequest(variantUrl, "GET", "", m3u8Headers);
        if (variantText && variantText.indexOf("#EXTM3U") !== -1) {
            var rewrittenVariant = _phcsRewriteManifestUrls(variantText, variantUrl);
            var safeVariantUrl = variantUrl.indexOf(".m3u8") !== -1 ? variantUrl : (variantUrl + "#.m3u8");
            return {
                url: safeVariantUrl,
                baseUrl: variantUrl,
                m3u8Content: rewrittenVariant,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "User-Agent": ua,
                    "Referer": hdcUrl,
                    "Origin": origin
                },
                subtitles: subtitles
            };
        }
    }

    var rewrittenMaster = _phcsRewriteManifestUrls(masterText, masterUrl);
    return {
        url: masterUrl,
        baseUrl: masterUrl,
        m3u8Content: rewrittenMaster,
        isEmbed: false,
        mimeType: "application/x-mpegURL",
        headers: {
            "User-Agent": ua,
            "Referer": hdcUrl,
            "Origin": origin
        },
        subtitles: subtitles
    };
}

// Bóc thông tin key & phụ đề VTT rời từ tiktok.phimhdc.com
function _phcsResolveTikTokInfo(tiktokUrl) {
    if (!tiktokUrl) return null;
    var origin = "https://tiktok.phimhdc.com";
    var ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    var embedHtml = _phcsJsonRequest(tiktokUrl, "GET", "", {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://phimhdcss.com/",
        "Sec-Fetch-Dest": "iframe",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site"
    });
    var decodedHtml = String(embedHtml || "").replace(/&amp;/gi, "&");
    var keyMatch = decodedHtml.match(/edgeplayer\.html[^"']*[?&]key=([a-zA-Z0-9_-]+)/i)
        || decodedHtml.match(/[?&]key=([a-zA-Z0-9_-]+)/i)
        || String(tiktokUrl).match(/\/embed\/([a-zA-Z0-9_-]+)/i);
    var key = keyMatch ? keyMatch[1] : "";
    if (!key) return null;

    var edgePage = origin + "/edgeplayer.html?pv=22&key=" + encodeURIComponent(key) + "&delivery=raw";
    var guardRaw = _phcsJsonRequest(origin + "/api/js-token?name=play_guard&jobId=" + encodeURIComponent(key), "GET", "", {
        "User-Agent": ua,
        "Accept": "application/json",
        "Referer": edgePage,
        "Origin": origin,
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    });
    var guard = "";
    try { guard = JSON.parse(guardRaw).token || ""; } catch (e) {}

    var subtitles = [];
    if (guard) {
        var subMetaRaw = _phcsJsonRequest(origin + "/video/" + encodeURIComponent(key) + "/subtitles.json?v=20261016-submeta1", "GET", "", {
            "User-Agent": ua,
            "Accept": "application/json,*/*",
            "Referer": edgePage,
            "Origin": origin,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        });
        try {
            var subMeta = JSON.parse(subMetaRaw);
            var tracks = (subMeta && subMeta.tracks) ? subMeta.tracks : [];
            for (var i = 0; i < tracks.length; i++) {
                var t = tracks[i];
                if (!t || !t.id) continue;
                var vttUrl = origin + "/video/" + encodeURIComponent(key) + "/subtitles/" + encodeURIComponent(t.id) + ".vtt?pg=" + encodeURIComponent(guard) + "&line=84&subenc=0";
                subtitles.push({
                    lang: String(t.label || t.lang || t.id).trim(),
                    url: vttUrl,
                    mimeType: "text/vtt",
                    isAutoTranslated: false
                });
            }
        } catch (e) {}
    }

    return {
        key: key,
        guard: guard,
        edgeUrl: edgePage,
        subtitles: subtitles
    };
}

// Giải mã trực tiếp embed.streamc.xyz (học từ nguoncnew_plugin.js)
function _phcsResolveStreamcDirect(embedUrl, subtitles) {
    if (!embedUrl || embedUrl.indexOf("streamc.xyz") === -1) return null;
    var originMatch = String(embedUrl).match(/^https?:\/\/[^\/]+/i);
    if (!originMatch) return null;
    var origin = originMatch[0];
    var ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36";

    var bootBody = JSON.stringify({
        action: "bootstrap",
        referrer: "https://embed.streamc.xyz/",
        frame_origins: ["https://embed.streamc.xyz"],
        request_grant: true,
        playlist_format: "hls",
        pretty_url: true,
        path_chunks: true,
        bootstrap_format: "json"
    });

    var bootRaw = _phcsJsonRequest(embedUrl, "POST", bootBody, {
        "User-Agent": ua,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": origin,
        "Referer": embedUrl
    });

    var bootData = null;
    try { bootData = JSON.parse(bootRaw); } catch (e) {}
    if (!bootData || bootData.turnstileEnabled) return null;

    var rawPlaylist = (bootData.preissued && bootData.preissued.playlist) ? bootData.preissued.playlist : "";
    if (!rawPlaylist && bootData.bootstrap) {
        var requestApi = bootData.api || embedUrl;
        var issueBody = JSON.stringify({
            action: "issue",
            bootstrap: bootData.bootstrap,
            turnstile_response: "",
            playlist_format: "hls",
            pretty_url: true,
            path_chunks: true,
            frame_origins: ["https://embed.streamc.xyz"]
        });

        var issueRaw = _phcsJsonRequest(requestApi, "POST", issueBody, {
            "User-Agent": ua,
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Origin": origin,
            "Referer": "https://embed.streamc.xyz/"
        });

        var issueData = null;
        try { issueData = JSON.parse(issueRaw); } catch (e) {}
        if (issueData && issueData.playlist) rawPlaylist = issueData.playlist;
    }
    if (!rawPlaylist) return null;

    var playlistUrl = _phcsAbsolutizeUrl(embedUrl, rawPlaylist);
    var manifestText = _phcsJsonRequest(playlistUrl, "GET", "", {
        "User-Agent": ua,
        "Accept": "*/*",
        "Origin": origin,
        "Referer": "https://embed.streamc.xyz/"
    });
    if (!manifestText || manifestText.indexOf("#EXTM3U") === -1) return null;

    var rewritten = _phcsRewriteManifestUrls(manifestText, playlistUrl);
    var safePlaylistUrl = playlistUrl.indexOf(".m3u8") !== -1 ? playlistUrl : (playlistUrl + "#.m3u8");
    return {
        url: safePlaylistUrl,
        baseUrl: playlistUrl,
        m3u8Content: rewritten,
        isEmbed: false,
        mimeType: "application/x-mpegURL",
        headers: {
            "User-Agent": ua,
            "Referer": origin + "/",
            "Origin": origin
        },
        subtitles: subtitles || []
    };
}

function parseDetailResponse(htmlContent, pageUrl, datasend) {
    try {
        // Xác định user chọn server nào từ ids[]
        var requested = "";
        if (typeof datasend !== 'undefined' && datasend) {
            requested = String(datasend).toLowerCase().trim();
            if (requested.indexOf("data:") === 0) requested = requested.substring(5);
        }
        if (!requested && pageUrl) {
            var pl = String(pageUrl).toLowerCase();
            if (pl.indexOf("server:hdc") !== -1) requested = "server:hdc";
            else if (pl.indexOf("server:tiktok") !== -1) requested = "server:tiktok";
            else if (pl.indexOf("server:streamc") !== -1) requested = "server:streamc";
            else if (pl.indexOf("server:auto") !== -1) requested = "server:auto";
        }
        if (!requested) requested = "server:auto";

        log('PHIMHDCS_DEBUG parseDetailResponse requested=' + requested);

        var decoded = _decodeOxData(htmlContent);
        var oxData = decoded.oxData;
        var salt = decoded.salt;

        if (oxData) {
            // Phân loại tất cả server URLs
            var tiktokCandidate = null;
            var hdcCandidate = null;
            var directCandidate = null;
            var streamcCandidate = null;
            var otherCandidate = null;

            for (var k in oxData) {
                if (oxData.hasOwnProperty(k)) {
                    var candidateUrl = Array.isArray(oxData[k])
                        ? _decodeChunksWithSalt(oxData[k], salt)
                        : _decodeStreamServer(oxData[k]);
                    if (!candidateUrl || candidateUrl.indexOf("http") !== 0) continue;

                    // Unwrap player.php?link= wrapper
                    if (candidateUrl.indexOf("player.php?") !== -1) {
                        var linkParam = /[?&](?:link|url)=([^&]+)/.exec(candidateUrl);
                        if (linkParam) candidateUrl = decodeURIComponent(linkParam[1]);
                    }

                    log('PHIMHDCS_DEBUG server [' + k + ']: ' + candidateUrl);

                    if (candidateUrl.indexOf("tiktok") !== -1 || candidateUrl.indexOf("tk.") !== -1) {
                        if (!tiktokCandidate) tiktokCandidate = { id: k, url: candidateUrl };
                    } else if (candidateUrl.indexOf("streamxemphimhd") !== -1) {
                        if (!hdcCandidate) hdcCandidate = { id: k, url: candidateUrl };
                    } else if (candidateUrl.indexOf("streamc.xyz") !== -1) {
                        if (!streamcCandidate) streamcCandidate = { id: k, url: candidateUrl };
                    } else if (candidateUrl.indexOf("kvp") !== -1 || candidateUrl.indexOf(".m3u8") !== -1 || candidateUrl.indexOf(".mp4") !== -1 || candidateUrl.indexOf("master.txt") !== -1) {
                        if (!directCandidate) directCandidate = { id: k, url: candidateUrl };
                    } else {
                        if (!otherCandidate) otherCandidate = { id: k, url: candidateUrl };
                    }
                }
            }

            // 1. Nếu có link trực tiếp KVP (.m3u8 / .mp4) và user chọn auto
            if (directCandidate && (requested === "server:auto" || (!hdcCandidate && !tiktokCandidate && !streamcCandidate))) {
                var dUrl = directCandidate.url;
                var extraSubs = hdcCandidate ? _phcsFetchHdcSubtitlesOnly(hdcCandidate.url) : [];
                return JSON.stringify({
                    url: dUrl,
                    isEmbed: false,
                    mimeType: dUrl.indexOf(".mp4") !== -1 ? "video/mp4" : "application/x-mpegURL",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer": "https://phimhdcss.com/"
                    },
                    subtitles: extraSubs
                });
            }

            // 2. Nếu user chọn Dự phòng (StreamC)
            if (requested === "server:streamc" && streamcCandidate) {
                var scSubs = hdcCandidate ? _phcsFetchHdcSubtitlesOnly(hdcCandidate.url) : [];
                if (scSubs.length === 0 && tiktokCandidate) {
                    var tkResForSub = _phcsResolveTikTokInfo(tiktokCandidate.url);
                    if (tkResForSub && tkResForSub.subtitles) scSubs = _phcsMergeSubtitles(scSubs, tkResForSub.subtitles);
                }
                var streamcDirect = _phcsResolveStreamcDirect(streamcCandidate.url, scSubs);
                if (streamcDirect && streamcDirect.url) {
                    log("PHIMHDCS_DEBUG StreamC resolved direct HLS with " + scSubs.length + " subtitles");
                    return JSON.stringify(streamcDirect);
                }
                return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: scSubs });
            }

            // 3. Nếu user chọn TikTok
            var sharedSubtitles = [];
            var tkInfo = null;
            if (requested === "server:tiktok" && tiktokCandidate) {
                tkInfo = _phcsResolveTikTokInfo(tiktokCandidate.url);
                if (tkInfo && tkInfo.subtitles) {
                    sharedSubtitles = _phcsMergeSubtitles(sharedSubtitles, tkInfo.subtitles);
                }
                // Vì segment của TikTok mã hóa PNG steganography (chunk stEg) không phát trực tiếp trên ExoPlayer được,
                // thử lấy stream HLS chuẩn từ StreamXemPhimHD hoặc StreamC kết hợp với phụ đề TikTok
                if (hdcCandidate) {
                    var hdcForTk = _phcsResolveHdcDirect(hdcCandidate.url, pageUrl);
                    if (hdcForTk && hdcForTk.url && !hdcForTk.subtitlesOnly) {
                        hdcForTk.subtitles = _phcsMergeSubtitles(hdcForTk.subtitles, sharedSubtitles);
                        log("PHIMHDCS_DEBUG TikTok mode -> resolved playable HLS via HDC + subtitles (" + hdcForTk.subtitles.length + ")");
                        return JSON.stringify(hdcForTk);
                    }
                    if (hdcForTk && hdcForTk.subtitles) {
                        sharedSubtitles = _phcsMergeSubtitles(hdcForTk.subtitles, sharedSubtitles);
                    }
                }
                if (streamcCandidate) {
                    var scForTk = _phcsResolveStreamcDirect(streamcCandidate.url, sharedSubtitles);
                    if (scForTk && scForTk.url) {
                        log("PHIMHDCS_DEBUG TikTok mode -> resolved playable HLS via StreamC + TikTok subtitles (" + sharedSubtitles.length + ")");
                        return JSON.stringify(scForTk);
                    }
                }
                // Nếu chỉ có duy nhất TikTok, mở edgeplayer.html trong WebView kèm Custom-JS chống redirect về trang chủ
                var targetTkUrl = (tkInfo && tkInfo.edgeUrl) ? tkInfo.edgeUrl : tiktokCandidate.url;
                return JSON.stringify({
                    url: targetTkUrl,
                    isEmbed: true,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Referer": "https://phimhdcss.com/",
                        "Custom-Js": _buildSnifferJs(),
                        "Block-Ads": "true"
                    },
                    subtitles: sharedSubtitles
                });
            }

            // 4. Luồng chính: StreamXemPhimHD (server:auto hoặc server:hdc) -> fallback sang StreamC -> fallback WebView
            if (hdcCandidate) {
                var hdcResolved = _phcsResolveHdcDirect(hdcCandidate.url, pageUrl);
                if (hdcResolved) {
                    if (hdcResolved.subtitles && hdcResolved.subtitles.length > 0) {
                        sharedSubtitles = _phcsMergeSubtitles(sharedSubtitles, hdcResolved.subtitles);
                    }
                    if (hdcResolved.url && !hdcResolved.subtitlesOnly) {
                        // Bổ sung thêm phụ đề từ TikTok nếu HDC chưa có phụ đề
                        if (sharedSubtitles.length === 0 && tiktokCandidate) {
                            var tkSubInfo = _phcsResolveTikTokInfo(tiktokCandidate.url);
                            if (tkSubInfo && tkSubInfo.subtitles) {
                                sharedSubtitles = _phcsMergeSubtitles(sharedSubtitles, tkSubInfo.subtitles);
                            }
                        }
                        hdcResolved.subtitles = sharedSubtitles;
                        log("PHIMHDCS_DEBUG HDC direct HLS resolved, subtitles=" + sharedSubtitles.length);
                        return JSON.stringify(hdcResolved);
                    }
                }
            }

            // Nếu HDC chưa lấy được hoặc chỉ có TikTok/StreamC: lấy thêm phụ đề từ TikTok nếu có
            if (sharedSubtitles.length === 0 && tiktokCandidate) {
                tkInfo = tkInfo || _phcsResolveTikTokInfo(tiktokCandidate.url);
                if (tkInfo && tkInfo.subtitles) {
                    sharedSubtitles = _phcsMergeSubtitles(sharedSubtitles, tkInfo.subtitles);
                }
            }

            // Fallback sang StreamC (NguonC) trực tiếp kèm phụ đề rời đã bóc từ HDC/TikTok
            if (streamcCandidate) {
                var scResolved = _phcsResolveStreamcDirect(streamcCandidate.url, sharedSubtitles);
                if (scResolved && scResolved.url) {
                    log("PHIMHDCS_DEBUG Fallback to StreamC direct HLS succeeded, subtitles=" + sharedSubtitles.length);
                    return JSON.stringify(scResolved);
                }
            }

            // Fallback cuối cùng: mở WebView kèm Custom-JS chống redirect về trang chủ và bắt stream
            var fallbackCandidate = hdcCandidate || tiktokCandidate || otherCandidate;
            if (fallbackCandidate && fallbackCandidate.url) {
                var fbUrl = fallbackCandidate.url;
                if (fallbackCandidate === tiktokCandidate && tkInfo && tkInfo.edgeUrl) {
                    fbUrl = tkInfo.edgeUrl;
                }
                return JSON.stringify({
                    url: fbUrl,
                    isEmbed: true,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Referer": "https://phimhdcss.com/",
                        "Stream-Regex": ".*(\\.m3u8|\\.mp4|/hls/|master\\.txt).*",
                        "Custom-Js": _buildSnifferJs(),
                        "Block-Ads": "true"
                    },
                    subtitles: sharedSubtitles
                });
            }

            log("PHIMHDCS_DEBUG: No suitable server found");
            return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
        }

        // Fallback: iframe trực tiếp
        var iframeMatch = htmlContent.match(/<iframe[^>]*src="([^"]+)"/i);
        if (iframeMatch) {
            var embedUrl = iframeMatch[1];
            if (embedUrl.indexOf('//') === 0) embedUrl = "https:" + embedUrl;
            if (embedUrl && embedUrl !== pageUrl && embedUrl.length > 5) {
                if (embedUrl.indexOf("streamxemphimhd") !== -1) {
                    var iframeHdc = _phcsResolveHdcDirect(embedUrl, pageUrl);
                    if (iframeHdc && iframeHdc.url && !iframeHdc.subtitlesOnly) {
                        return JSON.stringify(iframeHdc);
                    }
                }
                if (embedUrl.indexOf("streamc.xyz") !== -1) {
                    var iframeSc = _phcsResolveStreamcDirect(embedUrl, []);
                    if (iframeSc && iframeSc.url) {
                        return JSON.stringify(iframeSc);
                    }
                }
                return JSON.stringify({
                    url: embedUrl,
                    isEmbed: true,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer": "https://phimhdcss.com/",
                        "Custom-Js": _buildSnifferJs(),
                        "Block-Ads": "true"
                    },
                    subtitles: []
                });
            }
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    } catch (error) {
        log("PHIMHDCS_ERROR parseDetailResponse: " + error);
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

// =============================================================================
// EMBED RESPONSE HANDLER
// =============================================================================

function parseEmbedResponse(htmlContent, url, datasend) {
    try {
        log("parseEmbedResponse url: " + url);

        // --- STREAMXEMPHIMHD ---
        if (url && url.indexOf("streamxemphimhd") !== -1 && url.indexOf("/video/") !== -1) {
            var hdcDirect = _phcsResolveHdcDirect(url, "https://phimhdcss.com/");
            if (hdcDirect && hdcDirect.url && !hdcDirect.subtitlesOnly) {
                return JSON.stringify(hdcDirect);
            }
        }

        // --- STREAMC.XYZ ---
        if (url && url.indexOf("streamc.xyz") !== -1) {
            var scDirect = _phcsResolveStreamcDirect(url, []);
            if (scDirect && scDirect.url) {
                return JSON.stringify(scDirect);
            }
        }

        // --- TIKTOK EMBED ---
        if (url && url.indexOf("tiktok.phimhdc") !== -1) {
            log("parseEmbedResponse: TikTok embed");
            var tkInfo = _phcsResolveTikTokInfo(url);
            if (tkInfo && tkInfo.edgeUrl) {
                return JSON.stringify({
                    url: tkInfo.edgeUrl,
                    isEmbed: true,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Referer": "https://phimhdcss.com/",
                        "Custom-Js": _buildSnifferJs(),
                        "Block-Ads": "true"
                    },
                    subtitles: tkInfo.subtitles || []
                });
            }
            return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
        }

        // --- STREAMXEMPHIMHD: getVideo JSON response ---
        if (url.indexOf("do=getVideo") !== -1 || (htmlContent && htmlContent.indexOf("securedLink") !== -1 && htmlContent.indexOf("hls") !== -1)) {
            log("parseEmbedResponse: getVideo JSON");
            var jData = JSON.parse(htmlContent);
            var streamUrl = jData.securedLink || jData.videoSource || (jData.videoSources && jData.videoSources.length > 0 ? jData.videoSources[0].file : "");

            var subtitles = [];
            if (datasend) {
                try {
                    var state = JSON.parse(datasend);
                    if (state.subtitles) subtitles = state.subtitles;
                } catch(e) {}
            }

            if (streamUrl) {
                log("parseEmbedResponse: stream → " + streamUrl);
                return JSON.stringify({
                    url: streamUrl,
                    isEmbed: false,
                    mimeType: "application/x-mpegURL",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Referer": "https://play.streamxemphimhd.site/",
                        "Origin": "https://play.streamxemphimhd.site"
                    },
                    subtitles: subtitles
                });
            }
            return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
        }

        // --- GENERIC EMBED: tìm iframe lồng hoặc stream link ---
        var iframeMatch = String(htmlContent || "").match(/<iframe[^>]*src="([^"]+)"/i);
        if (iframeMatch) {
            var iUrl = iframeMatch[1];
            if (iUrl.indexOf('//') === 0) iUrl = "https:" + iUrl;
            if (iUrl && iUrl !== url && iUrl.length > 5) {
                return JSON.stringify({
                    url: iUrl,
                    isEmbed: true,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer": url,
                        "Custom-Js": _buildSnifferJs()
                    },
                    subtitles: []
                });
            }
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    } catch (e) {
        log("parseEmbedResponse error: " + e);
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

// =============================================================================
// CATEGORIES / COUNTRIES / YEARS PARSERS
// =============================================================================

function parseCategoriesResponse(htmlContent) {
    try {
        var filters = parseDynamicFilters(htmlContent);
        if (filters.category && filters.category.length > 0) return JSON.stringify(filters.category);
        var categories = [];
        var catPattern = /<a[^>]+href="https:\/\/phimhdcss\.com\/the-loai\/([^"]+)">([^<]+)<\/a>/gi;
        var match;
        while ((match = catPattern.exec(htmlContent)) !== null) {
            var exists = false;
            for (var i = 0; i < categories.length; i++) { if (categories[i].value === match[1]) { exists = true; break; } }
            if (!exists) categories.push({ name: match[2].trim(), value: match[1] });
        }
        return JSON.stringify(categories);
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(htmlContent) {
    try {
        var filters = parseDynamicFilters(htmlContent);
        if (filters.country && filters.country.length > 0) return JSON.stringify(filters.country);
        var countries = [];
        var pattern = /<a[^>]+href="https:\/\/phimhdcss\.com\/quoc-gia\/([^"]+)">([^<]+)<\/a>/gi;
        var match;
        while ((match = pattern.exec(htmlContent)) !== null) {
            var exists = false;
            for (var i = 0; i < countries.length; i++) { if (countries[i].value === match[1]) { exists = true; break; } }
            if (!exists) countries.push({ name: match[2].trim(), value: match[1] });
        }
        return JSON.stringify(countries);
    } catch (e) { return "[]"; }
}

function parseYearsResponse(htmlContent) {
    try {
        var filters = parseDynamicFilters(htmlContent);
        if (filters.year && filters.year.length > 0) return JSON.stringify(filters.year);
        var years = [];
        for (var y = 2026; y >= 2000; y--) years.push({ name: y.toString(), value: y.toString() });
        return JSON.stringify(years);
    } catch (e) { return "[]"; }
}

// =============================================================================
// WEBVIEW SNIFFER JS — Inject vào WebView để bắt stream từ StreamXemPhimHD
// Cloudflare chặn OkHttp → phải load trong WebView → hook fetch/XHR/video tag
// =============================================================================

function _buildSnifferJs() {
    return [
        "(function() {",
        "  'use strict';",
        "  if (window.__SNIFFER_INIT__) return;",
        "  window.__SNIFFER_INIT__ = true;",
        "",
        "  // Giả lập chạy trong iframe để chặn check: if (window.parent === window) location.replace('https://phimhdc.com/')",
        "  try {",
        "    var fakeParent = { frames: [], postMessage: function(){}, location: { href: 'https://phimhdcss.com/' } };",
        "    if (window.parent === window) {",
        "      try { Object.defineProperty(window, 'parent', { get: function() { return fakeParent; }, configurable: true }); } catch(e) {}",
        "    }",
        "    if (window.top === window) {",
        "      try { Object.defineProperty(window, 'top', { get: function() { return fakeParent; }, configurable: true }); } catch(e) {}",
        "    }",
        "    try { Object.defineProperty(document, 'referrer', { get: function() { return 'https://phimhdcss.com/'; }, configurable: true }); } catch(e) {}",
        "  } catch(e) {}",
        "",
        "  // Block redirect về trang chủ phimhdc.com / phimhdcss.com và popup ads",
        "  try {",
        "    var allow = function(u) {",
        "      if (!u) return false;",
        "      var s = String(u).toLowerCase().trim();",
        "      if (/^https?:\\/\\/(www\\.)?phimhdc(ss)?\\.com\\/?([?#].*)?$/.test(s)) return false;",
        "      return s.indexOf('streamxemphimhd') !== -1 || s.indexOf('tiktok.phimhdc') !== -1 ||",
        "             s.indexOf('edgeplayer.html') !== -1 || s.indexOf('cloudflare') !== -1 ||",
        "             s.indexOf('blob:') === 0 || s.indexOf('data:') === 0;",
        "    };",
        "    window.open = function(u) { return allow(u) ? window : null; };",
        "    var oa = window.location.assign;",
        "    window.location.assign = function(u) { if (allow(u) && oa) oa.call(window.location, u); };",
        "    var or = window.location.replace;",
        "    window.location.replace = function(u) { if (allow(u) && or) or.call(window.location, u); };",
        "  } catch(e) {}",
        "",
        "  // Dark background",
        "  try {",
        "    var st = document.createElement('style');",
        "    st.textContent = 'html,body{background:#000!important;color:#fff!important}';",
        "    (document.head || document.documentElement).appendChild(st);",
        "  } catch(e) {}",
        "",
        "  var done = false;",
        "  function dispatch(url, hdrs) {",
        "    if (!url || done) return;",
        "    var s = String(url).trim();",
        "    if (s.indexOf('.m3u8') === -1 && s.indexOf('/hls/') === -1 && s.indexOf('master.txt') === -1 && s.indexOf('.mp4') === -1) return;",
        "    done = true;",
        "    try {",
        "      if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {",
        "        window.SnifferBridge.play(s, hdrs ? JSON.stringify(hdrs) : '');",
        "      }",
        "    } catch(e) {}",
        "  }",
        "",
        "  // Hook fetch",
        "  try {",
        "    if (window.fetch) {",
        "      var of = window.fetch;",
        "      window.fetch = function() {",
        "        var a = arguments;",
        "        var ru = (typeof a[0] === 'string') ? a[0] : (a[0] && a[0].url ? a[0].url : '');",
        "        if (ru) dispatch(ru);",
        "        return of.apply(this, a).then(function(res) {",
        "          try {",
        "            if (ru.indexOf('do=getVideo') !== -1 && res && res.clone) {",
        "              res.clone().text().then(function(t) {",
        "                try {",
        "                  var d = JSON.parse(t);",
        "                  var u = d.securedLink || d.videoSource || (d.videoSources && d.videoSources[0] ? d.videoSources[0].file : '');",
        "                  if (u) dispatch(u);",
        "                } catch(e) {}",
        "              }).catch(function(){});",
        "            }",
        "          } catch(e) {}",
        "          return res;",
        "        });",
        "      };",
        "    }",
        "  } catch(e) {}",
        "",
        "  // Hook XMLHttpRequest",
        "  try {",
        "    if (typeof XMLHttpRequest !== 'undefined') {",
        "      var oo = XMLHttpRequest.prototype.open;",
        "      var os = XMLHttpRequest.prototype.send;",
        "      XMLHttpRequest.prototype.open = function(m, u) {",
        "        this._ru = u;",
        "        if (u) dispatch(u);",
        "        return oo.apply(this, arguments);",
        "      };",
        "      XMLHttpRequest.prototype.send = function() {",
        "        var self = this;",
        "        var prev = self.onreadystatechange;",
        "        self.onreadystatechange = function() {",
        "          try {",
        "            if (self.readyState === 4 && self.status === 200 && self._ru && self._ru.indexOf('do=getVideo') !== -1) {",
        "              var d = JSON.parse(self.responseText);",
        "              var u = d.securedLink || d.videoSource || (d.videoSources && d.videoSources[0] ? d.videoSources[0].file : '');",
        "              if (u) dispatch(u);",
        "            }",
        "          } catch(e) {}",
        "          if (prev) return prev.apply(this, arguments);",
        "        };",
        "        return os.apply(this, arguments);",
        "      };",
        "    }",
        "  } catch(e) {}",
        "",
        "  // Scan video elements",
        "  var sc = 0;",
        "  var tm = setInterval(function() {",
        "    if (done || sc++ > 30) { clearInterval(tm); return; }",
        "    try {",
        "      var vs = document.querySelectorAll('video');",
        "      for (var i = 0; i < vs.length; i++) {",
        "        if (vs[i].src) dispatch(vs[i].src);",
        "        var ss = vs[i].querySelectorAll('source');",
        "        for (var j = 0; j < ss.length; j++) { if (ss[j].src) dispatch(ss[j].src); }",
        "      }",
        "    } catch(e) {}",
        "  }, 500);",
        "",
        "})();"
    ].join("\n");
}

try {
    if (typeof window !== "undefined") {
        Object.defineProperty(window, "parseDetailResponse", {
            value: parseDetailResponse,
            writable: false,
            configurable: false
        });
    }
} catch (e) {}
// =============================================================================
// PLUGIN VAX: TINHLAGI TV (FIX LỖI CHẠY LINK KÊNH LẺ + TẮT XOAY NGANG)
// =============================================================================

var BASEURL = "https://tinhlagi.pro/sport";
var DEFAULT_POSTER = "https://tinhlagi.pro/sport/sanbong.jpg";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV",
        "name": "TV - Thể Thao Pro",
        "description": "Tâm điểm gộp kênh, Folder lẻ lọc đúng kênh, Tắt tự xoay ngang, Direct Play.",
        "version": "3.2.0",
        "baseUrl": BASEURL,
        "isEnabled": true,
        "layoutType": "LIST",
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') nativeLog("[TinhlagiTV] " + msg);
    else if (typeof console !== 'undefined' && console.log) console.log("[TinhlagiTV] " + msg);
}

function decodeEntities(str) {
    if (!str) return "";
    return str.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function parseDataFromHash(url) {
    try {
        var hashIdx = url.indexOf("#data=");
        if (hashIdx !== -1) {
            return JSON.parse(decodeURIComponent(url.substring(hashIdx + 6)));
        }
    } catch (e) { log("Lỗi decode Hash: " + e); }
    return null;
}

function cleanMatchTitle(rawTitle) {
    if (!rawTitle) return "Trực tiếp Bóng Đá";
    return rawTitle.replace(/🏆/g, '').replace(/\[[^\]]*\]/g, '').replace(/LIVE/gi, '').replace(/\s+/g, ' ').trim();
}

// =============================================================================
// NHÓM 1: CẤU HÌNH FOLDER & DANH MỤC KÊNH
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: 'live_group', title: '🔥 Tâm Điểm Đang Live', type: 'List' },
        { slug: 'gio-vang-tv', title: '🔴 Giờ Vàng TV', type: 'List' },
        { slug: 'phao-hoa-tv', title: '🔴 Pháo Hoa TV', type: 'List' },
        { slug: 'cola-tv', title: '🔴 Cola TV', type: 'List' },
        { slug: 'chuoi-chien-tv', title: '🔴 Chuối Chiên TV', type: 'List' },
        { slug: 'vua-san-co-tv', title: '🔴 Vua Sân Cỏ TV', type: 'List' },
        { slug: 'xoi-lac-tv', title: '🔴 Xôi Lạc TV', type: 'List' },
        { slug: 'bia-om-tv', title: '🔴 Bia Ôm TV', type: 'List' },
        { slug: 'socolive', title: '🔴 Socolive TV', type: 'List' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: '🔥 Đang Live', slug: 'live_group' },
        { name: '🔴 Giờ Vàng TV', slug: 'gio-vang-tv' },
        { name: '🔴 Pháo Hoa TV', slug: 'phao-hoa-tv' },
        { name: '🔴 Cola TV', slug: 'cola-tv' },
        { name: '🔴 Chuối Chiên TV', slug: 'chuoi-chien-tv' },
        { name: '🔴 Vua Sân Cỏ TV', slug: 'vua-san-co-tv' },
        { name: '🔴 Xôi Lạc TV', slug: 'xoi-lac-tv' },
        { name: '🔴 Bia Ôm TV', slug: 'bia-om-tv' },
        { name: '🔴 Socolive', slug: 'socolive' }
    ]);
}

function getFilterConfig() { return JSON.stringify({}); }
function getUrlList(slug, filtersJson) { return BASEURL + "/?channel=" + slug; }
function getUrlSearch(keyword, filtersJson) { return ""; }
function getUrlDetail(slug) { return slug; }
function getUrlCategories() { return BASEURL + "/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSE DANH SÁCH & PHÂN LUỒNG DỮ LIỆU
// =============================================================================

function parseListResponse(html, url) {
    try {
        var currentSlug = "live_group";
        if (url.indexOf("channel=") !== -1) {
            currentSlug = url.split("channel=")[1].split("&")[0];
        }

        var slugToKeyword = {
            "gio-vang-tv": "GIỜ VÀNG",
            "phao-hoa-tv": "PHÁO HOA",
            "cola-tv": "COLA",
            "chuoi-chien-tv": "CHUỖI CHIÊN",
            "vua-san-co-tv": "VUA SÂN CỎ",
            "xoi-lac-tv": "XÔI LẠC",
            "bia-om-tv": "BIA ÔM",
            "socolive": "SOCOLIVE"
        };
        var filterKeyword = slugToKeyword[currentSlug] || "";

        var liveItems = [];
        var addedUrls = {}; 
        
        var itemRegex = /<(button|article)([^>]*js-match-btn[^>]*)>([\s\S]*?)<\/\1>/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var attrBlock = match[2];
            var innerContent = match[3];

            var titleMatch = attrBlock.match(/data-title="([^"]*)"/i);
            var rawTitle = titleMatch ? decodeEntities(titleMatch[1]).trim() : "";
            var cleanTitle = cleanMatchTitle(rawTitle);

            if (!cleanTitle || cleanTitle.indexOf("Cập Nhật") !== -1 || cleanTitle.indexOf("Địa Chỉ IP") !== -1 || cleanTitle.indexOf("Chào Khách") !== -1) {
                continue;
            }

            var isFinished = innerContent.indexOf('Đã xong') !== -1 || innerContent.indexOf('status-ended') !== -1;
            if (isFinished) continue;

            var isLive = innerContent.indexOf('🟢 Live') !== -1 || innerContent.indexOf('status-live') !== -1;
            if (!isLive) continue;

            var urlMatch = attrBlock.match(/data-url="([^"]*)"/i);
            var streamUrl = urlMatch ? decodeEntities(urlMatch[1]).trim() : BASEURL;
            
            if (!streamUrl || addedUrls[streamUrl]) continue;
            addedUrls[streamUrl] = true;

            var scoreMatch = attrBlock.match(/data-score="([^"]*)"/i);
            var minuteMatch = attrBlock.match(/data-minute="([^"]*)"/i);
            var timeMatch = attrBlock.match(/data-time="([^"]*)"/i);
            var sourcesMatch = attrBlock.match(/data-sources="([^"]*)"/i);

            var score = scoreMatch && scoreMatch[1] ? decodeEntities(scoreMatch[1]).trim() : "";
            var minute = minuteMatch ? decodeEntities(minuteMatch[1]).trim() : "";
            var time = timeMatch ? decodeEntities(timeMatch[1]).trim() : "";

            var parsedSources = [];
            if (sourcesMatch) {
                try { parsedSources = JSON.parse(decodeEntities(sourcesMatch[1])); } catch (e) {}
            }

            var finalSources = [];

            if (filterKeyword !== "") {
                // ĐANG Ở FOLDER KÊNH LẺ: Chỉ lấy đúng link thuộc kênh đó
                for (var i = 0; i < parsedSources.length; i++) {
                    if (parsedSources[i].name && parsedSources[i].name.toUpperCase().indexOf(filterKeyword) !== -1) {
                        finalSources.push({
                            name: parsedSources[i].name,
                            link: parsedSources[i].link || parsedSources[i].url || streamUrl
                        });
                    }
                }
                if (finalSources.length === 0) continue; 
            } else {
                // ĐANG Ở TÂM ĐIỂM: Gom tất cả link vào chung
                var limit = Math.min(parsedSources.length, 12);
                for (var j = 0; j < limit; j++) {
                    finalSources.push({
                        name: parsedSources[j].name || ("Kênh " + (j + 1)),
                        link: parsedSources[j].link || parsedSources[j].url || streamUrl
                    });
                }
            }

            // Tạo bìa bảng tỉ số điện tử
            var lineScore = score ? score : "ĐANG LIVE";
            var lineTime = time ? time : "---";
            var textOverlay = encodeURIComponent("───── ⚽ ─────\n\n" + lineScore + "\n\n" + lineTime + "\n\n──────────────");
            var dynamicPoster = "https://placehold.co/400x600/0f172a/f8fafc.png?text=" + textOverlay;

            var payload = { 
                title: cleanTitle, 
                sources: finalSources,
                posterUrl: dynamicPoster
            };
            var itemUrl = BASEURL + "#data=" + encodeURIComponent(JSON.stringify(payload));

            var episodeParts = ["🔴 LIVE"];
            if (minute) episodeParts.push(minute + "'");
            if (score) episodeParts.push(score);
            if (time) episodeParts.push(time);
            
            liveItems.push({
                "id": itemUrl,
                "title": cleanTitle,
                "posterUrl": dynamicPoster,
                "backdropUrl": DEFAULT_POSTER,
                "quality": "ĐANG LIVE",
                "episode_current": episodeParts.join(" | ")
            });
        }

        return JSON.stringify({
            "items": liveItems,
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });

    } catch (e) {
        log("Lỗi parseListResponse: " + e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html) { 
    return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } }); 
}

// =============================================================================
// CHI TIẾT KÊNH (TẠO DANH SÁCH SERVER CHO TÂM ĐIỂM / KÊNH LẺ)
// =============================================================================

function parseMovieDetail(html, url) {
    try {
        var data = parseDataFromHash(url);
        var title = data && data.title ? data.title : "Trực Tiếp Bóng Đá";
        var episodes = [];
        var targetSources = (data && data.sources) ? data.sources : [];

        if (targetSources.length === 0) {
            episodes.push({ id: BASEURL + "|error", name: "⚠️ Không có link", slug: "no-link" });
        } else {
            for (var i = 0; i < targetSources.length; i++) {
                var s = targetSources[i];
                episodes.push({
                    id: s.link + "|channel-" + i,
                    name: "📺 " + s.name,
                    slug: "channel-" + i
                });
            }
        }

        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: data.posterUrl || DEFAULT_POSTER,
            backdropUrl: DEFAULT_POSTER,
            description: "🌟 HỆ THỐNG TRỰC TIẾP TỐC ĐỘ CAO (Đã ép màn hình dọc). Vui lòng chọn nguồn phát bên dưới.",
            servers: [{ name: "Danh Sách Kênh", episodes: episodes }]
        });
    } catch (e) {
        return JSON.stringify({ id: url, title: "Trực Tiếp Bóng Đá", servers: [] });
    }
}

// =============================================================================
// CHẠY TRỰC TIẾP EXOPLAYER (ĐÃ ÉP CỜ TẮT XOAY NGANG)
// =============================================================================

function parseDetailResponse(html, apiUrl) {
    try {
        var streamUrl = apiUrl;
        if (apiUrl.indexOf("|") !== -1) {
            streamUrl = apiUrl.split("|")[0];
        }

        var cleanUrl = streamUrl.split('#')[0];
        if (!cleanUrl) cleanUrl = BASEURL;

        return JSON.stringify({
            isEmbed: false,
            url: cleanUrl,
            mimeType: cleanUrl.indexOf(".flv") !== -1 ? "video/x-flv" : "application/x-mpegURL",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                "Referer": "https://tinhlagi.pro/",
                "Origin": "https://tinhlagi.pro/"
            },
            // ÉP MÀN HÌNH DỌC (TẮT TỰ ĐỘNG XOAY NGANG)
            isLandscape: false, 
            isPortrait: true,
            isRotate: false,
            
            subtitles: []
        });
    } catch (error) {
        return "{}";
    }
}

function parseEmbedResponse(html, url) { return parseDetailResponse(html, url); }
function parseCategoriesResponse(apiResponseJson) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

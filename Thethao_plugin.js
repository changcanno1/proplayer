// =============================================================================
// PLUGIN VAX: TINHLAGI TV (CHỈ LẤY GIỜ VÀNG & PHÁO HOA - SIÊU ỔN ĐỊNH)
// =============================================================================

var BASEURL = "https://tinhlagi.pro/sport";
var DEFAULT_POSTER = "https://tinhlagi.pro/sport/sanbong.jpg";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV",
        "name": "TV - Thể Thao Pro",
        "description": "Lọc sạch link lỗi. Chỉ lấy luồng phát ổn định của Giờ Vàng và Pháo Hoa TV.",
        "version": "3.4.0",
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
// NHÓM 1: CẤU HÌNH FOLDER (ĐÃ XÓA SẠCH LINK LỖI)
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: 'live_group', title: '🔥 Tâm Điểm Đang Live', type: 'List' },
        { slug: 'gio-vang-tv', title: '🔴 Giờ Vàng TV', type: 'List' },
        { slug: 'phao-hoa-tv', title: '🔴 Pháo Hoa TV', type: 'List' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: '🔥 Đang Live', slug: 'live_group' },
        { name: '🔴 Giờ Vàng TV', slug: 'gio-vang-tv' },
        { name: '🔴 Pháo Hoa TV', slug: 'phao-hoa-tv' }
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
// PARSE DANH SÁCH & BỘ LỌC KÊNH NGHIÊM NGẶT
// =============================================================================

function parseListResponse(html, url) {
    try {
        var currentSlug = "live_group";
        if (url.indexOf("channel=") !== -1) {
            currentSlug = url.split("channel=")[1].split("&")[0];
        }

        var slugToKeyword = {
            "gio-vang-tv": "GIỜ VÀNG",
            "phao-hoa-tv": "PHÁO HOA"
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

            // CHỈ GIỮ LẠI DUY NHẤT "GIỜ VÀNG" VÀ "PHÁO HOA" BẤT KỂ LÀ Ở MỤC NÀO
            for (var i = 0; i < parsedSources.length; i++) {
                var sName = parsedSources[i].name ? parsedSources[i].name.toUpperCase() : "";
                
                // Nếu không phải Giờ Vàng và cũng không phải Pháo Hoa -> XÓA
                if (sName.indexOf("GIỜ VÀNG") === -1 && sName.indexOf("PHÁO HOA") === -1) {
                    continue; 
                }

                // Nếu đang ở trong một Folder kênh cụ thể (ví dụ Giờ Vàng) thì loại nốt kênh kia
                if (filterKeyword !== "" && sName.indexOf(filterKeyword) === -1) {
                    continue;
                }

                finalSources.push({
                    name: parsedSources[i].name,
                    link: parsedSources[i].link || parsedSources[i].url || streamUrl
                });
            }

            // Nếu trận đấu này đã bị xóa sạch link (vì toàn Cola/Xôi Lạc) -> ẨN LUÔN TRẬN ĐẤU ĐÓ KHỎI LIST
            if (finalSources.length === 0) continue; 

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
// CHI TIẾT KÊNH
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
            description: "🌟 HỆ THỐNG TRỰC TIẾP TỐC ĐỘ CAO (Màn hình dọc). Hệ thống đã tự động lọc để chỉ giữ lại các link M3U8 ổn định nhất.",
            servers: [{ name: "Danh Sách Kênh", episodes: episodes }]
        });
    } catch (e) {
        return JSON.stringify({ id: url, title: "Trực Tiếp Bóng Đá", servers: [] });
    }
}

// =============================================================================
// BÓC TÁCH LINK PROXY VÀ CHẠY EXOPLAYER (QUAN TRỌNG NHẤT)
// =============================================================================

function parseDetailResponse(html, apiUrl) {
    try {
        var streamUrl = apiUrl;
        if (apiUrl.indexOf("|") !== -1) {
            streamUrl = apiUrl.split("|")[0];
        }

        var cleanUrl = streamUrl.split('#')[0];
        if (!cleanUrl) cleanUrl = BASEURL;

        var realUrl = cleanUrl;
        var referer = "https://tinhlagi.pro/";

        // Lọc thông số từ URL chứa proxy
        var urlMatch = cleanUrl.match(/[?&]url=([^&]+)/);
        if (urlMatch && urlMatch[1]) {
            realUrl = decodeURIComponent(urlMatch[1]);
        }
        var refMatch = cleanUrl.match(/[?&]referer=([^&]+)/);
        if (refMatch && refMatch[1]) {
            referer = decodeURIComponent(refMatch[1]);
        }

        return JSON.stringify({
            isEmbed: false,
            url: realUrl, 
            mimeType: realUrl.indexOf(".flv") !== -1 ? "video/x-flv" : "application/x-mpegURL",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                "Referer": referer, 
                "Origin": referer
            },
            // Ép cờ dọc cho video player
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

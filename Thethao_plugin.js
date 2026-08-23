// =============================================================================
// PLUGIN VAX: TINHLAGI TV (CHỈ LIVE + PHÂN LOẠI KÊNH THEO FOLDER)
// =============================================================================

var BASEURL = "https://tinhlagi.pro/sport";
var DEFAULT_POSTER = "https://tinhlagi.pro/sport/sanbong.jpg";

var NO_SIGNAL_LINK = "https://tinhlagi.pro/sport/proxy.php?hash=e84b78ac552063d85e51a15f251ff2c60ace92f9e978c2b716556cafe8c6ece2&referer=https%3A%2F%2Ffreem3u.xyz%2F&url=https%3A%2F%2Ffreem3u.xyz%2Fstatic%2Fno-signal%2Flow.m3u8";

function getManifest() {
    return JSON.stringify({
        "id": "ThethaoTV",
        "name": "TV - Thể Thao Pro",
        "description": "Bỏ Sắp Diễn Ra, Thêm Folder chia theo Kênh BLV, Giữ nguyên Bảng tỉ số.",
        "version": "2.0.0",
        "baseUrl": BASEURL,
        "isEnabled": true,
        "layoutType": "LIST",
        "type": "MOVIE",
        "playerType": "embed"
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

function getUrlList(slug, filtersJson) { 
    return BASEURL + "/?channel=" + slug; 
}
function getUrlSearch(keyword, filtersJson) { return ""; }
function getUrlDetail(slug) { return slug; }
function getUrlCategories() { return BASEURL + "/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSE DANH SÁCH & BỘ LỌC KÊNH
// =============================================================================

function parseListResponse(html, url) {
    try {
        var currentSlug = "live_group";
        if (url.indexOf("channel=") !== -1) {
            currentSlug = url.split("channel=")[1].split("&")[0];
        }

        // Bảng từ khóa để tìm kiếm trong danh sách sources
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

            if (!cleanTitle || 
                cleanTitle.indexOf("Cập Nhật") !== -1 || 
                cleanTitle.indexOf("Địa Chỉ IP") !== -1 || 
                cleanTitle.indexOf("Chào Khách Lạ") !== -1) {
                continue;
            }

            var isFinished = innerContent.indexOf('Đã xong') !== -1 || innerContent.indexOf('status-ended') !== -1;
            if (isFinished) continue;

            // CHỈ LẤY CÁC TRẬN ĐANG LIVE (Đã loại bỏ isUpcoming)
            var isLive = innerContent.indexOf('🟢 Live') !== -1 || innerContent.indexOf('status-live') !== -1;
            if (!isLive) continue;

            var urlMatch = attrBlock.match(/data-url="([^"]*)"/i);
            var streamUrl = urlMatch ? decodeEntities(urlMatch[1]).trim() : BASEURL;
            
            if (!streamUrl || addedUrls[streamUrl]) continue;
            addedUrls[streamUrl] = true;

            var scoreMatch = attrBlock.match(/data-score="([^"]*)"/i);
            var minuteMatch = attrBlock.match(/data-minute="([^"]*)"/i);
            var timeMatch = attrBlock.match(/data-time="([^"]*)"/i);
            var leagueMatch = attrBlock.match(/data-league="([^"]*)"/i);
            var sourcesMatch = attrBlock.match(/data-sources="([^"]*)"/i);

            var league = leagueMatch ? decodeEntities(leagueMatch[1]).trim() : "Giải đấu khác";
            var score = scoreMatch && scoreMatch[1] ? decodeEntities(scoreMatch[1]).trim() : "";
            var minute = minuteMatch ? decodeEntities(minuteMatch[1]).trim() : "";
            var time = timeMatch ? decodeEntities(timeMatch[1]).trim() : "";

            var parsedSources = [];
            if (sourcesMatch) {
                try { parsedSources = JSON.parse(decodeEntities(sourcesMatch[1])); } catch (e) {}
            }

            // --- LỌC KÊNH THEO FOLDER CHỈ ĐỊNH ---
            if (filterKeyword !== "") {
                var hasChannel = false;
                for (var i = 0; i < parsedSources.length; i++) {
                    if (parsedSources[i].name && parsedSources[i].name.toUpperCase().indexOf(filterKeyword) !== -1) {
                        hasChannel = true;
                        break;
                    }
                }
                // Nếu trận đấu này không có kênh được chọn thì bỏ qua không hiển thị vào folder
                if (!hasChannel) continue; 
            }

            // --- TẠO BÌA ĐIỆN TỬ ---
            var lineScore = score ? score : "ĐANG LIVE";
            var lineTime = time ? time : "---";
            var textOverlay = encodeURIComponent("───── ⚽ ─────\n\n" + lineScore + "\n\n" + lineTime + "\n\n──────────────");
            var dynamicPoster = "https://placehold.co/400x600/0f172a/f8fafc.png?text=" + textOverlay;

            var episodeParts = [];
            var payload = { title: cleanTitle, league: league, mainUrl: streamUrl, sources: parsedSources, isLive: true };
            var itemUrl = BASEURL + "#data=" + encodeURIComponent(JSON.stringify(payload));

            episodeParts.push("🔴 LIVE");
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
// CHI TIẾT & BẮT FALLBACK NO SIGNAL
// =============================================================================

function parseMovieDetail(html, url) {
    try {
        var data = parseDataFromHash(url);
        var title = data && data.title ? data.title : "Trực Tiếp Bóng Đá";
        if (data && data.league) title = "[" + data.league + "] " + title;

        var episodes = [];
        var hasSources = data && data.sources && data.sources.length > 0;
        var mainUrl = data && data.mainUrl ? data.mainUrl : BASEURL;

        if (!hasSources) {
            episodes.push({
                id: NO_SIGNAL_LINK + "#embed_play",
                name: "⚠️ Đang chờ tín hiệu / Trận đấu kết thúc",
                slug: "no-signal"
            });
        } else {
            for (var i = 0; i < data.sources.length; i++) {
                var s = data.sources[i];
                episodes.push({
                    id: (s.link || mainUrl) + "#embed_play",
                    name: "🌐 " + (s.name || ("Kênh " + (i + 1))),
                    slug: "channel-" + i
                });
            }
        }

        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: DEFAULT_POSTER,
            backdropUrl: DEFAULT_POSTER,
            description: "Hệ thống trực tiếp thể thao. Tự động chuyển Màn hình chờ sau 7s nếu lỗi tín hiệu.",
            servers: [{ name: "Danh Sách Kênh Phát Sóng", episodes: episodes }]
        });
    } catch (e) {
        return JSON.stringify({
            id: url,
            title: "Trực Tiếp Bóng Đá",
            servers: [{ name: "Server", episodes: [{ id: NO_SIGNAL_LINK + "#embed_play", name: "⚠️ Lỗi dữ liệu", slug: "error" }] }]
        });
    }
}

function parseDetailResponse(html, url) {
    var cleanUrl = url.split('#')[0];
    if (!cleanUrl || cleanUrl.indexOf('http') !== 0) cleanUrl = BASEURL;

    var fallbackScript = "setTimeout(function(){var b=document.querySelector('button, .play, .vjs-big-play-button, .jw-display-icon-display');if(b)b.click();},1000);setTimeout(function(){var v=document.querySelector('video');var fail=false;if(!v)fail=true;else if(v.error)fail=true;else if(v.networkState===3)fail=true;else if(v.readyState===0)fail=true;if(fail){window.location.replace('" + NO_SIGNAL_LINK + "');}},7000);";

    if (cleanUrl.indexOf("freem3u.xyz") !== -1 || cleanUrl.indexOf("no-signal") !== -1) {
        fallbackScript = "";
    }

    return JSON.stringify({
        url: cleanUrl,
        isEmbed: true,
        headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/605.1.15",
            "Referer": "https://tinhlagi.pro/"
        },
        script: fallbackScript,
        subtitles: []
    });
}

function parseEmbedResponse(html, url) { return parseDetailResponse(html, url); }
function parseCategoriesResponse(apiResponseJson) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// PLUGIN VAX: TINHLAGI TV (M3U PARSER - DIRECT PLAY SIÊU ỔN ĐỊNH)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        id: "tinhlagisports",
        name: "TV - Thể Thao Pro",
        version: "3.0.0",
        baseUrl: BASE_URL,
        iconUrl: "https://i.ibb.co/FPQzZM1/tinhlagi-logo.jpg",
        isEnabled: true,
        isAdult: false,
        type: "IPTV",
        layoutType: "LIST",
        playerType: "exoplayer",
        debug: true
    });
}

// =============================================================================
// NHÓM 1: CẤU HÌNH FOLDER & DANH MỤC KÊNH
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: "live_group", title: "🔥 Tâm Điểm Đang Live", type: "List" },
        { slug: "gio-vang-tv", title: "🔴 Giờ Vàng TV", type: "List" },
        { slug: "phao-hoa-tv", title: "🔴 Pháo Hoa TV", type: "List" },
        { slug: "cola-tv", title: "🔴 Cola TV", type: "List" },
        { slug: "chuoi-chien-tv", title: "🔴 Chuối Chiên TV", type: "List" },
        { slug: "vua-san-co-tv", title: "🔴 Vua Sân Cỏ TV", type: "List" },
        { slug: "xoi-lac-tv", title: "🔴 Xôi Lạc TV", type: "List" },
        { slug: "bia-om-tv", title: "🔴 Bia Ôm TV", type: "List" },
        { slug: "socolive", title: "🔴 Socolive TV", type: "List" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "🔥 Đang Live", slug: "live_group" },
        { name: "🔴 Giờ Vàng TV", slug: "gio-vang-tv" },
        { name: "🔴 Pháo Hoa TV", slug: "phao-hoa-tv" },
        { name: "🔴 Cola TV", slug: "cola-tv" },
        { name: "🔴 Chuối Chiên TV", slug: "chuoi-chien-tv" },
        { name: "🔴 Vua Sân Cỏ TV", slug: "vua-san-co-tv" },
        { name: "🔴 Xôi Lạc TV", slug: "xoi-lac-tv" },
        { name: "🔴 Bia Ôm TV", slug: "bia-om-tv" },
        { name: "🔴 Socolive", slug: "socolive" }
    ]);
}

function getFilterConfig() { return JSON.stringify({ sort: [], category: [] }); }

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

function getUrlList(slug, filtersJson) { return `${BASE_URL}?category=${slug}`; }
function getUrlSearch(keyword = "", filtersJson) { return `${BASE_URL}?search=${encodeURIComponent(keyword?.trim())}`; }
function getUrlDetail(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    return `${BASE_URL}${path}`;
}
function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER DỮ LIỆU & LOẠI BỎ "SẮP DIỄN RA"
// =============================================================================

function parseListResponse(html, apiUrl) {
    try {
        const items = [];
        let channels = [];

        if (channelList.length === 0) channelList = parseM3U(html);
        const category = extractParamFromUrl(apiUrl, "category");
        const keyword = extractParamFromUrl(apiUrl, "search");

        if (category === "live_group") {
            channels = channelList; // Tâm điểm lấy tất cả
        } else if (category) {
            channels = filterChannels(channelList, ["category", category]);
        } else if (keyword) {
            channels = filterChannels(channelList, ["search", keyword]);
        }

        channels.forEach((channel) => {
            const matchInfo = parseChannelName(channel.name);
            
            // CHỈ LẤY CÁC TRẬN ĐANG LIVE (LỌC BỎ SẮP DIỄN RA)
            if (matchInfo.dateTime && !isLive(matchInfo.dateTime)) {
                return; // Bỏ qua item này
            }

            // GIAO DIỆN BẢNG ĐIỆN TỬ ĐỒNG ĐỀU
            var lineScore = "ĐANG LIVE";
            var lineTime = matchInfo.dateTime ? matchInfo.dateTime.replace("-", " ") : "---";
            var textOverlay = encodeURIComponent("───── ⚽ ─────\n\n" + lineScore + "\n\n" + lineTime + "\n\n──────────────");
            var dynamicPoster = "https://placehold.co/400x600/0f172a/f8fafc.png?text=" + textOverlay;

            items.push({
                id: "?channelId=" + channel.channelId,
                title: matchInfo.title ? matchInfo.title : channel.name,
                description: `Kênh phát sóng trực tiếp từ ${channel.tvgGroup || "Hệ thống"}`,
                posterUrl: dynamicPoster,
                backdropUrl: channel.tvgLogo || "https://tinhlagi.pro/sport/sanbong.jpg",
                quality: "LIVE",
                episode_current: channel.url.includes(".m3u8") ? "HLS" : "FLV"
            });
        });

        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 1 }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html, apiUrl) { return parseListResponse(html, apiUrl); }

// =============================================================================
// CHI TIẾT & CHẠY TRỰC TIẾP EXOPLAYER
// =============================================================================

function parseDetailResponse(html, apiUrl) {
    try {
        if (apiUrl.indexOf("|") > 0) apiUrl = apiUrl.split("|")[0];
        const channelId = extractParamFromUrl(apiUrl, "channelId");
        
        const channelData = getChannel(channelList, channelId);
        if (!channelData || !channelData.url) {
             return "{}";
        }

        const {
            url,
            props: {
                "http-user-agent": userAgent,
                "http-referrer": referrer,
                "http-origin": origin
            }
        } = channelData;

        // Trả về luồng phát trực tiếp (M3U8 hoặc FLV) cho ExoPlayer chạy native
        return JSON.stringify({
            isEmbed: false, // Bắt buộc false để chạy ExoPlayer
            url: url,
            mimeType: url.includes(".flv") ? "video/x-flv" : "application/x-mpegURL",
            headers: {
                "User-Agent": userAgent || "Dalvik/2.1.0",
                Referer: referrer || "https://tinhlagi.pro/",
                Origin: origin || "https://tinhlagi.pro/"
            },
            subtitles: []
        });
    } catch (error) {
        return "{}";
    }
}

// Bắt buộc cho chuẩn cũ
function parseMovieDetail(html, url) { return ""; }
function parseEmbedResponse(html, url) { return parseDetailResponse(html, url); }
function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// NHÓM 4: HELPERS (XỬ LÝ M3U)
// =============================================================================

const BASE_URL = "https://tinhlagi.pro/s.m3u";
let channelList = [];

const GROUP_MAP = {
    "🔴 cola tv": "🔴 Cola TV",
    "🔴 chuối chiên tv": "🔴 Chuối Chiên TV",
    "🔴 vua sân cỏ tv": "🔴 Vua Sân Cỏ TV",
    "🔴 xôi lạc z tv": "🔴 Xôi Lạc TV",
    "🔴 xôi lạc tv": "🔴 Xôi Lạc TV",
    "🔴 bia ôm tv": "🔴 Bia Ôm TV",
    "🔴 socolive tv": "🔴 Socolive TV",
    "🔴 giờ vàng tv": "🔴 Giờ Vàng TV",
    "🔴 nấu xôi tv": "🔴 Nấu Xôi TV",
    "🔴 pháo hoa tv": "🔴 Pháo Hoa TV",
    "🔴 sp tv (china)": "🔴 SP TV (CHINA)",
};

const CATEGORY_MAP = {
    "cola-tv": "🔴 Cola TV",
    "chuoi-chien-tv": "🔴 Chuối Chiên TV",
    "vua-san-co-tv": "🔴 Vua Sân Cỏ TV",
    "xoi-lac-tv": "🔴 Xôi Lạc TV",
    "bia-om-tv": "🔴 Bia Ôm TV",
    "socolive": "🔴 Socolive TV",
    "gio-vang-tv": "🔴 Giờ Vàng TV",
    "nau-xoi-tv": "🔴 Nấu Xôi TV",
    "phao-hoa-tv": "🔴 Pháo Hoa TV",
    "sp-tv-china": "🔴 SP TV (CHINA)",
};

function extractParamFromUrl(url, param) {
    if (!url) return "";
    var match = url.match(new RegExp("[?&]" + param + "=([^&]+)"));
    return match ? decodeURIComponent(match[1]) : "";
}

function filterChannels(channels, [filterKey, filterValue]) {
    if (filterValue && filterKey === "category") {
        return channels.filter((channel) => CATEGORY_MAP[filterValue] === channel.tvgGroup);
    }
    if (filterValue && filterKey === "search") {
        return channels.filter((channel) => {
            const name = channel.name.toLowerCase();
            return name.indexOf(filterValue.toLowerCase()) >= 0;
        });
    }
}

function getChannel(channels, channelId) {
    if (channelId === undefined || channelId === null || channelId === "") return {};
    return channels.find((channel) => String(channel.channelId) === String(channelId)) || {};
}

function parseM3U(text) {
    const lines = text.split("\n");
    const channels = [];
    let currentChannel = null;
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.toUpperCase().includes("EXTINF:")) {
            currentChannel = {
                name: "No Name",
                tvgLogo: "",
                tvgGroup: "No Group",
                url: "",
                channelId: count++,
                props: {}
            };

            const commaIndex = line.lastIndexOf(`",`);
            if (commaIndex !== -1)
                currentChannel.name = line.substring(commaIndex + 2).trim() || "No Name";

            const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
            if (logoMatch && logoMatch[1]) currentChannel.tvgLogo = logoMatch[1];

            const groupMatch = line.match(/group-title="([^"]+)"/i);
            if (groupMatch && groupMatch[1])
                currentChannel.tvgGroup = GROUP_MAP[groupMatch[1].toLowerCase()] ? GROUP_MAP[groupMatch[1].toLowerCase()] : groupMatch[1];

        } else if (line.toUpperCase().startsWith("#KODIPROP:") || line.toUpperCase().startsWith("#EXTVLCOPT:")) {
            if (currentChannel) {
                const propLine = line.substring(line.indexOf(":") + 1).trim();
                const equalIdx = propLine.indexOf("=");
                if (equalIdx !== -1) {
                    const key = propLine.substring(0, equalIdx).trim();
                    const val = propLine.substring(equalIdx + 1).trim();
                    currentChannel.props[key] = val;
                }
            }
        } else if (line !== "" && !line.startsWith("#")) {
            if (currentChannel) {
                currentChannel.url = line;
                channels.push(currentChannel);
                currentChannel = null;
            }
        }
    }
    return channels;
}

function parseChannelName(channelName) {
    const match = channelName.trim().match(/^(?:🟢\s*)?(\d{1,2}:\d{2})\s+(\d{1,2}\/\d{2})\s+(.+)$/);
    if (!match) {
        return { dateTime: null, title: channelName.trim() };
    }
    return {
        dateTime: `${match[1]}-${match[2]}`,
        title: match[3].trim(),
    };
}

function isLive(dateTime) {
    var match = /^(\d{1,2}):(\d{2})-(\d{1,2})\/(\d{1,2})$/.exec(dateTime);
    if (!match) return false;
    
    var hour = Number(match[1]);
    var minute = Number(match[2]);
    var day = Number(match[3]);
    var month = Number(match[4]);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }
    
    var now = new Date();
    var year = now.getUTCFullYear();
    var eventTimestamp = Date.UTC(year, month - 1, day, hour - 7, minute, 0, 0);

    return eventTimestamp <= Date.now();
}

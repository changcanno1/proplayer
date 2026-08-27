// =============================================================================
// PLUGIN VAX: TINHLAGI TV (TỐI ƯU FOLDER & BÌA TRẬN ĐẤU DYNAMIC)
// =============================================================================

var BASE_URL = "https://tinhlagi.pro/s.m3u";
var FALLBACK_POSTER_URL = "https://tinhlagi.pro/sport/sanbong.jpg";

function getManifest() {
    return JSON.stringify({
        id: "ThethaoTV_TinhLaGi_Pro",
        name: "TV - Thể Thao Pro",
        description: "Rút gọn danh mục kênh, xếp Giờ Vàng lên đầu. Tích hợp ảnh bìa trận đấu tự động siêu nhẹ.",
        version: "6.0.0",
        baseUrl: BASE_URL,
        isEnabled: true,
        layoutType: "LIST",
        type: "MOVIE", 
        playerType: "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "tam-diem-dang-live", title: "🔥 Tâm Điểm Đang Live", type: "List" },
        { slug: "gio-vang-tv", title: "🔴 Giờ Vàng TV", type: "List" },
        { slug: "cola-tv", title: "🔴 Cola TV", type: "List" },
        { slug: "bia-om-tv", title: "🔴 Bia Ôm TV", type: "List" },
        { slug: "phao-hoa-tv", title: "🔴 Pháo Hoa TV", type: "List" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "🔥 Tâm Điểm Đang Live", slug: "tam-diem-dang-live" },
        { name: "🔴 Giờ Vàng TV", slug: "gio-vang-tv" },
        { name: "🔴 Cola TV", slug: "cola-tv" },
        { name: "🔴 Bia Ôm TV", slug: "bia-om-tv" },
        { name: "🔴 Pháo Hoa TV", slug: "phao-hoa-tv" }
    ]);
}

function getFilterConfig() { return JSON.stringify({}); }
function getUrlList(slug, filtersJson) { return `${BASE_URL}?category=${slug}`; }
function getUrlSearch(keyword = "", filtersJson) { return `${BASE_URL}?search=${encodeURIComponent(keyword?.trim())}`; }
function getUrlDetail(path) { return path; }
function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// HELPERS
// =============================================================================

let channelList = [];
const CATEGORY_MAP = {
    "gio-vang-tv": "🔴 Giờ Vàng TV",
    "cola-tv": "🔴 Cola TV",
    "bia-om-tv": "🔴 Bia Ôm TV",
    "phao-hoa-tv": "🔴 Pháo Hoa TV"
};

const RX_LOGO = /tvg-logo="([^"]+)"/i;
const RX_GROUP = /group-title="([^"]+)"/i;
const RX_CHANNEL_NAME = /^(?:🟢\s*)?(\d{1,2}):(\d{2})\s+(\d{2})\/(\d{2})\s+(.+)$/;

function parseM3U(text) {
    const lines = text.split("\n");
    const channels = [];
    let currentChannel = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith("#EXTINF:")) {
            currentChannel = {
                name: "No Name",
                tvgLogo: "",
                tvgGroup: "No Group",
                url: "",
                props: {}
            };

            const commaIndex = line.lastIndexOf(",");
            if (commaIndex !== -1) currentChannel.name = line.substring(commaIndex + 1).trim() || "No Name";

            const logoMatch = RX_LOGO.exec(line);
            if (logoMatch) currentChannel.tvgLogo = logoMatch[1];

            const groupMatch = RX_GROUP.exec(line);
            if (groupMatch) currentChannel.tvgGroup = groupMatch[1];

        } else if (line.startsWith("#KODIPROP:") || line.startsWith("#EXTVLCOPT:")) {
            if (currentChannel) {
                const equalIdx = line.indexOf("=");
                if (equalIdx !== -1) {
                    const keyStr = line.startsWith("#KODIPROP:") ? 10 : 11;
                    const key = line.substring(keyStr, equalIdx).trim();
                    const val = line.substring(equalIdx + 1).trim();
                    currentChannel.props[key] = val;
                }
            }
        } else if (!line.startsWith("#")) {
            if (currentChannel) {
                currentChannel.url = line;
                if (line.toLowerCase().indexOf('.flv') === -1) {
                    channels.push(currentChannel);
                }
                currentChannel = null;
            }
        }
    }
    return channels;
}

function processChannelTitle(channelName, nowMs, currentYear) {
    const match = RX_CHANNEL_NAME.exec(channelName.trim());
    if (!match) {
        return { title: channelName.trim(), isLive: false, timeStr: "" };
    }
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const month = parseInt(match[4], 10);
    
    const eventTimestamp = Date.UTC(currentYear, month - 1, day, hour - 7, minute, 0, 0);
    
    return {
        title: match[5].trim(),
        isLive: eventTimestamp <= nowMs,
        timeStr: match[1] + ":" + match[2] + " - " + match[3] + "/" + match[4]
    };
}

// =============================================================================
// PARSE LIST VÀ TẠO BÌA TRẬN ĐẤU (DYNAMIC POSTER)
// =============================================================================

function parseListResponse(html, apiUrl) {
    try {
        if (channelList.length === 0) channelList = parseM3U(html);
        
        let category = "";
        let searchMatch = apiUrl.match(/[?&]category=([^&]+)/);
        if (searchMatch) category = decodeURIComponent(searchMatch[1]);
        
        const nowMs = Date.now();
        const currentYear = new Date().getUTCFullYear();

        let filteredChannels = channelList;

        if (category) {
            if (category === "tam-diem-dang-live") {
                filteredChannels = channelList.filter(c => processChannelTitle(c.name, nowMs, currentYear).isLive);
            } else {
                const targetGroup = CATEGORY_MAP[category] ? CATEGORY_MAP[category].toLowerCase() : category.toLowerCase();
                filteredChannels = channelList.filter(c => c.tvgGroup.toLowerCase().includes(targetGroup));
            }
        }

        const items = [];
        for (let i = 0; i < filteredChannels.length; i++) {
            const channel = filteredChannels[i];
            const matchInfo = processChannelTitle(channel.name, nowMs, currentYear);
            
            // TẠO ẢNH BÌA THEO CODE 2
            const timeDisplay = matchInfo.isLive ? "ĐANG LIVE" : matchInfo.timeStr;
            const textOverlay = encodeURIComponent("───── ⚽ ─────\n\n" + matchInfo.title + "\n\n" + timeDisplay + "\n\n──────────────");
            const dynamicPoster = "https://placehold.co/400x600/0f172a/f8fafc.png?text=" + textOverlay;

            const payload = {
                title: matchInfo.title,
                // Ưu tiên truyền logo từ M3U sang Detail Screen, nếu không có lấy Dynamic Poster
                logo: channel.tvgLogo || dynamicPoster, 
                url: channel.url,
                group: channel.tvgGroup,
                userAgent: channel.props["http-user-agent"] || "",
                referer: channel.props["http-referrer"] || ""
            };
            
            const itemUrl = BASE_URL + "#data=" + encodeURIComponent(JSON.stringify(payload));

            items.push({
                id: itemUrl,
                title: matchInfo.title,
                posterUrl: dynamicPoster, // Bìa ngoài list áp dụng chuẩn Code 2
                backdropUrl: channel.tvgLogo || FALLBACK_POSTER_URL,
                quality: matchInfo.isLive ? "🔴 LIVE" : matchInfo.timeStr,
                episode_current: channel.tvgGroup
            });
        }

        return JSON.stringify({ items: items, pagination: { currentPage: 1, totalPages: 1 } });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html, apiUrl) { return parseListResponse(html, apiUrl); }

// =============================================================================
// CHI TIẾT KÊNH & EXOPLAYER
// =============================================================================

function parseMovieDetail(html, url) {
    try {
        let data = null;
        const hashIdx = url.indexOf("#data=");
        if (hashIdx !== -1) {
            data = JSON.parse(decodeURIComponent(url.substring(hashIdx + 6)));
        }

        if (!data) return "{}";

        const episodes = [{
            id: data.url + "|headers=" + encodeURIComponent(JSON.stringify({ ua: data.userAgent, ref: data.referer })),
            name: "📺 " + (data.group || "Xem Ngay"),
            slug: "link-1"
        }];

        return JSON.stringify({
            id: url,
            title: data.title,
            posterUrl: data.logo, // Trả lại logo chuẩn khi vào màn hình Detail
            backdropUrl: data.logo,
            description: "🌟 HỆ THỐNG TRỰC TIẾP TỐC ĐỘ CAO.\nHệ thống đã tự động lọc để chỉ giữ lại các link M3U8 ổn định nhất.",
            servers: [{ name: "Danh sách tập", episodes: episodes }]
        });
    } catch (e) {
        return JSON.stringify({ id: url, title: "Trực Tiếp Bóng Đá", servers: [] });
    }
}

function parseDetailResponse(html, apiUrl) {
    try {
        const parts = apiUrl.split("|headers=");
        const streamUrl = parts[0];
        
        let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
        let referer = "https://tinhlagi.pro/";

        if (parts.length > 1) {
            const h = JSON.parse(decodeURIComponent(parts[1]));
            if (h.ua) userAgent = h.ua;
            if (h.ref) referer = h.ref;
        }

        return JSON.stringify({
            isEmbed: false,
            url: streamUrl, 
            mimeType: "application/x-mpegURL",
            headers: {
                "User-Agent": userAgent,
                "Referer": referer, 
                "Origin": referer
            }
        });
    } catch (error) {
        return "{}";
    }
}

function parseEmbedResponse(html, url) { return parseDetailResponse(html, url); }
function parseCategoriesResponse(apiResponseJson) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

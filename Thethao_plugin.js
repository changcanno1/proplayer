// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
  return JSON.stringify({
    id: "tinhlagisports",
    name: "TinhLaGiSports",
    version: "2.0.0",
    description: "Phiên bản tối ưu tốc độ cao. Lọc tự động các kênh M3U8, loại bỏ FLV và gom trận đang Live không gây lag.",
    baseUrl: BASE_URL,
    iconUrl: "https://i.ibb.co/FPQzZM1/tinhlagi-logo.jpg",
    isEnabled: true,
    isAdult: false,
    type: "IPTV",
    layoutType: "HORIZONTAL",
    playerType: "exoplayer",
    debug: true
  });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "tam-diem-dang-live", title: "🔥 Tâm Điểm Đang Live", type: "Horizontal", path: "" },
    { slug: "cola-tv", title: "🔴 Cola TV", type: "Horizontal", path: "" },
    { slug: "chuoi-chien-tv", title: "🔴 Chuối Chiên TV", type: "Horizontal", path: "" },
    { slug: "vua-san-co-tv", title: "🔴 Vua Sân Cỏ TV", type: "Horizontal", path: "" },
    { slug: "xoi-lac-z-tv", title: "🔴 Xôi Lạc Z TV", type: "Horizontal", path: "" },
    { slug: "bia-om-tv", title: "🔴 Bia Ôm TV", type: "Horizontal", path: "" },
    { slug: "socolive-tv", title: "🔴 Socolive TV", type: "Horizontal", path: "" },
    { slug: "gio-vang-tv", title: "🔴 Giờ Vàng TV", type: "Horizontal", path: "" },
    { slug: "nau-xoi-tv", title: "🔴 Nấu Xôi TV", type: "Horizontal", path: "" },
    { slug: "phao-hoa-tv", title: "🔴 Pháo Hoa TV", type: "Horizontal", path: "" },
    { slug: "sp-tv-china", title: "🔴 SP TV (CHINA)", type: "Horizontal", path: "" },
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "🔥 Tâm Điểm Đang Live", slug: "tam-diem-dang-live" },
    { name: "Cola TV", slug: "cola-tv" },
    { name: "Chuối Chiên TV", slug: "chuoi-chien-tv" },
    { name: "Vua Sân Cỏ TV", slug: "vua-san-co-tv" },
    { name: "Xôi Lạc Z TV", slug: "xoi-lac-z-tv" },
    { name: "Bia Ôm TV", slug: "bia-om-tv" },
    { name: "Socolive TV", slug: "socolive-tv" },
    { name: "Giờ Vàng TV", slug: "gio-vang-tv" },
    { name: "Nấu Xôi TV", slug: "nau-xoi-tv" },
    { name: "Pháo Hoa TV", slug: "phao-hoa-tv" },
    { name: "SP TV (CHINA)", slug: "sp-tv-china" },
  ]);
}

function getFilterConfig() {
  return JSON.stringify({ sort: [], category: [] });
}

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
// PARSER (ĐÃ TỐI ƯU HÓA TỐC ĐỘ, CHỐNG LAG)
// =============================================================================

function parseListResponse(html, apiUrl) {
  try {
    // Phân tích M3U 1 lần duy nhất để lưu cache
    if (channelList.length === 0) channelList = parseM3U(html);
    
    const category = extractParamFromUrl(apiUrl, "category");
    const keyword = extractParamFromUrl(apiUrl, "search");
    
    // Tính toán thời gian 1 lần duy nhất thay vì lặp hàng ngàn lần
    const nowMs = Date.now();
    const currentYear = new Date().getUTCFullYear();

    let filteredChannels = channelList;

    // LỌC THEO THỂ LOẠI HOẶC TÌM KIẾM
    if (category) {
        if (category === "tam-diem-dang-live") {
            filteredChannels = channelList.filter(channel => processChannelTitle(channel.name, nowMs, currentYear).isLive);
        } else {
            const targetGroup = CATEGORY_MAP[category];
            filteredChannels = channelList.filter(channel => channel.tvgGroup === targetGroup);
        }
    } else if (keyword) {
        const kw = keyword.toLowerCase();
        filteredChannels = channelList.filter(channel => channel.name.toLowerCase().indexOf(kw) !== -1);
    }

    const items = [];
    // Vòng lặp map mảng dữ liệu cực nhanh
    for (let i = 0; i < filteredChannels.length; i++) {
        const channel = filteredChannels[i];
        const matchInfo = processChannelTitle(channel.name, nowMs, currentYear);
        
        items.push({
            id: "?channelId=" + channel.channelId,
            title: matchInfo.title,
            description: "Hệ thống tự động lọc các trận đang LIVE và loại bỏ link FLV để chạy mượt mà nhất.",
            posterUrl: channel.tvgLogo || FALLBACK_POSTER_URL,
            backdropUrl: channel.tvgLogo || FALLBACK_POSTER_URL,
            quality: matchInfo.isLive ? "🔴 LIVE" : matchInfo.timeStr,
            episode_current: channel.url.indexOf(".m3u8") !== -1 ? "HLS" : "OTHER"
        });
    }

    return JSON.stringify({
      items: items,
      pagination: { currentPage: 1, totalPages: 1 }
    });
  } catch (error) {
    console.error("⛔ ERROR in parseListResponse: ", error);
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(html, apiUrl) {
  return parseListResponse(html, apiUrl);
}

function parseDetailResponse(html, apiUrl) {
  try {
    if (apiUrl.indexOf("|") > 0) apiUrl = apiUrl.split("|")[0];
    const channelId = extractParamFromUrl(apiUrl, "channelId");
    const channel = getChannel(channelList, channelId);
    
    if (!channel || !channel.url) return "{}";

    const url = channel.url;
    const userAgent = channel.props["http-user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    const referrer = channel.props["http-referrer"] || url;
    const origin = channel.props["http-origin"] || url;

    return JSON.stringify({
      isEmbed: false,
      url: url,
      mimeType: "application/x-mpegURL",
      headers: {
        "User-Agent": userAgent,
        "Referer": referrer,
        "Origin": origin
      },
      // Thêm thông số từ code 2 giúp ExoPlayer nhận diện chuẩn hơn
      isLandscape: false, 
      isPortrait: true,
      isRotate: false
    });
  } catch (error) {
    console.error("⛔ ERROR in parseDetailResponse: ", error);
    return "{}";
  }
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// HELPERS (BIẾN & HÀM BỔ TRỢ)
// =============================================================================

const BASE_URL = "https://tinhlagi.pro/s.m3u";
const FALLBACK_POSTER_URL = "https://tinhlagi.pro/sport/sanbong.jpg";
let channelList = [];

const GROUP_MAP = {
  "🔴 cola tv": "🔴 Cola TV",
  "🔴 chuối chiên tv": "🔴 Chuối Chiên TV",
  "🔴 vua sân cỏ tv": "🔴 Vua Sân Cỏ TV",
  "🔴 xôi lạc z tv": "🔴 Xôi Lạc Z TV",
  "🔴 bia ôm tv": "🔴 Bia Ôm TV",
  "🔴 socolive tv": "🔴 Socolive TV",
  "🔴 giờ vàng tv": "🔴 Giờ Vàng TV",
  "🔴 nấu xôi tv": "🔴 Nấu Xôi TV",
  "🔴 pháo hoa tv": "🔴 Pháo Hoa TV",
  "🔴 sp tv (china)": "🔴 SP TV (CHINA)"
};

const CATEGORY_MAP = {
  "cola-tv": "🔴 Cola TV",
  "chuoi-chien-tv": "🔴 Chuối Chiên TV",
  "vua-san-co-tv": "🔴 Vua Sân Cỏ TV",
  "xoi-lac-z-tv": "🔴 Xôi Lạc Z TV",
  "bia-om-tv": "🔴 Bia Ôm TV",
  "socolive-tv": "🔴 Socolive TV",
  "gio-vang-tv": "🔴 Giờ Vàng TV",
  "nau-xoi-tv": "🔴 Nấu Xôi TV",
  "phao-hoa-tv": "🔴 Pháo Hoa TV",
  "sp-tv-china": "🔴 SP TV (CHINA)"
};

// Regex định nghĩa 1 lần để tái sử dụng cực nhanh
const RX_LOGO = /tvg-logo="([^"]+)"/i;
const RX_GROUP = /group-title="([^"]+)"/i;
const RX_CHANNEL_NAME = /^(?:🟢\s*)?(\d{1,2}):(\d{2})\s+(\d{2})\/(\d{2})\s+(.+)$/;

function extractParamFromUrl(url, param) {
  if (!url) return "";
  var match = url.match(new RegExp("[?&]" + param + "=([^&]+)"));
  return match ? decodeURIComponent(match[1]) : "";
}

function getChannel(channels, channelId) {
  if (!channelId) return {};
  for (let i = 0; i < channels.length; i++) {
      if (String(channels[i].channelId) === String(channelId)) return channels[i];
  }
  return {};
}

function parseM3U(text) {
  const lines = text.split("\n");
  const channels = [];
  let currentChannel = null;
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      currentChannel = {
        name: "No Name",
        tvgLogo: "",
        tvgGroup: "No Group",
        url: "",
        channelId: count++,
        props: {}
      };

      const commaIndex = line.lastIndexOf(",");
      if (commaIndex !== -1) {
        currentChannel.name = line.substring(commaIndex + 1).trim() || "No Name";
      }

      const logoMatch = RX_LOGO.exec(line);
      if (logoMatch) currentChannel.tvgLogo = logoMatch[1];

      const groupMatch = RX_GROUP.exec(line);
      if (groupMatch) {
        const rawGroup = groupMatch[1].toLowerCase();
        currentChannel.tvgGroup = GROUP_MAP[rawGroup] ? GROUP_MAP[rawGroup] : groupMatch[1];
      }
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
        
        // GIẢM LAG Ở ĐÂY: Vứt bỏ ngay link FLV ngay khi đọc file, máy sẽ nhẹ đi 50%
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
    
    // GMT+7 -> Tính theo chuẩn UTC
    const eventTimestamp = Date.UTC(currentYear, month - 1, day, hour - 7, minute, 0, 0);
    
    return {
        title: match[5].trim(),
        isLive: eventTimestamp <= nowMs,
        timeStr: match[1] + ":" + match[2] + " - " + match[3] + "/" + match[4]
    };
}

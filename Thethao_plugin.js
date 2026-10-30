// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
  return JSON.stringify({
    id: "ThethaoTV",
    name: "[SPORT] ThethaoTV",
    version: "1.0.4",
    baseUrl: BASE_URL,
    iconUrl: "https://i.ibb.co/cSrQ5y7K/ththethao-logo.png",
    isEnabled: true,
    isAdult: false,
    type: "IPTV",
    playerType: "exoplayer",
    debug: true
  });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "gio-vang-tv", title: "Giờ Vàng TV", type: "Grid", path: "" },
    { slug: "khan-dai-tv", title: "Khán Đài TV", type: "Horizontal", path: "" },
    { slug: "s8-tv", title: "S8 TV", type: "Horizontal", path: "" },
    { slug: "sao-ke-tv", title: "Sao Kê TV", type: "Horizontal", path: "" },
    { slug: "sut-bong-tv", title: "Sút Bóng TV", type: "Horizontal", path: "" },
    { slug: "ga-vang-tv", title: "Gà Vàng TV", type: "Horizontal", path: "" },
    { slug: "pha-lang-tv", title: "Phá Làng TV", type: "Horizontal", path: "" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Giờ Vàng TV", slug: "gio-vang-tv" },
    { name: "Khán Đài TV", slug: "khan-dai-tv" },
    { name: "S8 TV", slug: "s8-tv" },
    { name: "Sao Kê TV", slug: "sao-ke-tv" },
    { name: "Sút Bóng TV", slug: "sut-bong-tv" },
    { name: "Gà Vàng TV", slug: "ga-vang-tv" },
    { name: "Phá Làng TV", slug: "pha-lang-tv" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({ sort: [], category: [] });
}

// =============================================================================
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
// =============================================================================

function getUrlList(slug, filtersJson) {
  return `${BASE_URL}?category=${slug}`;
}

function getUrlSearch(keyword = "", filtersJson) {
  return `${BASE_URL}?search=${encodeURIComponent(keyword?.trim() || "")}`;
}

function getUrlDetail(path) {
  if (!path) return "";
  if (path.indexOf("http") === 0) return path;
  return `${BASE_URL}${path}`;
}

function getUrlCategories() {
  return "";
}
function getUrlCountries() {
  return "";
}
function getUrlYears() {
  return "";
}

// =============================================================================
// NHÓM 3: PARSER (App fetch URL xong → ném HTML/JSON thô vào đây → bạn parse)
// =============================================================================

function parseListResponse(html, apiUrl) {
  try {
    const items = [];
    let channels = [];

    if (channelList.length === 0 && html) {
      channelList = parseM3U(html);
    }
    
    const category = extractParamFromUrl(apiUrl, "category");
    const keyword = extractParamFromUrl(apiUrl, "search");

    if (category) {
      channels = filterChannels(channelList, ["category", category]);
    } else if (keyword) {
      channels = filterChannels(channelList, ["search", keyword]);
    } else {
      channels = channelList;
    }

    channels.forEach((channel) => {
      const matchInfo = parseChannelName(channel.name);
      const isFlv = /\.flv(\?|$)/i.test(channel.url) || channel.url.toLowerCase().includes(".flv");

      items.push({
        id: "?channelId=" + channel.channelId,
        title: matchInfo.title ? matchInfo.title : channel.name,
        description: `Channel "${channel.name}" is hosted on server THTheThao.`,
        posterUrl: channel.tvgLogo || FALLBACK_POSTER_URL,
        backdropUrl: channel.tvgLogo || FALLBACK_POSTER_URL,
        quality: isLive(matchInfo.dateTime) ? "LIVE" : (matchInfo.dateTime || "LIVE"),
        episode_current: isFlv ? "FLV" : "HLS"
      });
    });

    return JSON.stringify({
      items: items,
      pagination: { currentPage: 1, totalPages: 1 }
    });
  } catch (error) {
    console.error(
      "⛔ [parseListResponse in ththethao_plugin.js] ERROR MESSAGE: ",
      error
    );
    return JSON.stringify({
      items: [],
      pagination: { currentPage: 1, totalPages: 1 }
    });
  }
}

function parseSearchResponse(html, apiUrl) {
  return parseListResponse(html, apiUrl);
}

function parseDetailResponse(html, apiUrl) {
  try {
    if (channelList.length === 0 && html) {
      channelList = parseM3U(html);
    }

    if (apiUrl.indexOf("|") > 0) apiUrl = apiUrl.split("|")[0];
    const channelId = extractParamFromUrl(apiUrl, "channelId");
    const channel = getChannel(channelList, channelId);

    if (!channel || !channel.url) {
      return "{}";
    }

    const {
      url,
      name,
      props = {}
    } = channel;

    const userAgent = props["http-user-agent"];
    const referrer = props["http-referrer"] || props["referrer"];
    const origin = props["http-origin"];

    const isFlv = /\.flv(\?|$)/i.test(url) || url.toLowerCase().includes(".flv");

    console.log("ℹ️ [parseDetailResponse in ththethao_plugin.js] Name: ", name);
    console.log("ℹ️ [parseDetailResponse in ththethao_plugin.js] URL: ", url);

    if (isFlv) {
      console.log("ℹ️ [parseDetailResponse in ththethao_plugin.js] Manifest type: FLV");
      return JSON.stringify({
        isEmbed: false,
        url: url,
        mimeType: "video/x-flv",
        headers: {
          "User-Agent": userAgent || "Dalvik/2.1.0",
          Referer: referrer || url,
          Origin: origin || url
        }
      });
    } else {
      console.log("ℹ️ [parseDetailResponse in ththethao_plugin.js] Manifest type: HLS (M3U8)");
      return JSON.stringify({
        isEmbed: false,
        url: url,
        mimeType: "application/x-mpegURL",
        headers: {
          "User-Agent": userAgent || "Dalvik/2.1.0",
          Referer: referrer || url,
          Origin: origin || url
        }
      });
    }
  } catch (error) {
    console.error(
      "⛔ [parseDetailResponse in ththethao_plugin.js] ERROR MESSAGE: ",
      error
    );
    return "{}";
  }
}

function parseCategoriesResponse(html) {
  return "[]";
}
function parseCountriesResponse(html) {
  return "[]";
}
function parseYearsResponse(html) {
  return "[]";
}

// =============================================================================
// NHÓM 4: HELPERS
// =============================================================================

const BASE_URL = "https://thtt.pages.dev/tttt.m3u";
const FALLBACK_POSTER_URL = "https://i.ibb.co/rKHf363x/fallback-thumbnail.webp";
let channelList = [];

const GROUP_MAP = {
  "giờ vàng tv": "Giờ Vàng TV",
  "khán đài tv": "Khán Đài TV",
  "s8 tv": "S8 TV",
  "sao kê tv": "Sao Kê TV",
  "sút bóng tv": "Sút Bóng TV",
  "gà vàng tv": "Gà Vàng TV",
  "phá làng tv": "Phá Làng TV"
};

const CATEGORY_MAP = {
  "gio-vang-tv": "Giờ Vàng TV",
  "khan-dai-tv": "Khán Đài TV",
  "s8-tv": "S8 TV",
  "sao-ke-tv": "Sao Kê TV",
  "sut-bong-tv": "Sút Bóng TV",
  "ga-vang-tv": "Gà Vàng TV",
  "pha-lang-tv": "Phá Làng TV"
};

function extractParamFromUrl(url, param) {
  if (!url) return "";
  var match = url.match(new RegExp("[?&]" + param + "=([^&]+)"));
  return match ? decodeURIComponent(match[1]) : "";
}

function filterChannels(channels, [filterKey, filterValue]) {
  if (!channels || !Array.isArray(channels)) return [];

  if (filterValue && filterKey === "category") {
    return channels.filter(
      (channel) => CATEGORY_MAP[filterValue] === channel.tvgGroup
    );
  }
  if (filterValue && filterKey === "search") {
    const keyword = filterValue.toLowerCase();
    return channels.filter((channel) => {
      const name = (channel.name || "").toLowerCase();
      return name.indexOf(keyword) >= 0;
    });
  }
  return channels;
}

function getChannel(channels, channelId) {
  if (channelId === undefined || channelId === null || channelId === "")
    return {};
  return (
    channels.find(
      (channel) => String(channel.channelId) === String(channelId)
    ) || {}
  );
}

function parseM3U(text) {
  if (!text) return [];
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
        tvgId: "",
        channelId: count++,
        props: {}
      };

      const commaIndex = line.lastIndexOf(",");
      if (commaIndex !== -1) {
        currentChannel.name =
          line.substring(commaIndex + 1).trim() || "No Name";
      }

      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      if (logoMatch && logoMatch[1]) currentChannel.tvgLogo = logoMatch[1];

      const groupMatch = line.match(/group-title="([^"]+)"/i);
      if (groupMatch && groupMatch[1]) {
        const groupKey = groupMatch[1].toLowerCase().trim();
        currentChannel.tvgGroup = GROUP_MAP[groupKey]
          ? GROUP_MAP[groupKey]
          : groupMatch[1].trim();
      }

      const idMatch = line.match(/tvg-id="([^"]+)"/i);
      if (idMatch && idMatch[1]) currentChannel.tvgId = idMatch[1];

      const catchupMatch = line.match(/catchup="([^"]+)"/i);
      if (catchupMatch) currentChannel.props.catchup = catchupMatch[1];

      const catchupDaysMatch = line.match(/catchup-days="([^"]+)"/i);
      if (catchupDaysMatch)
        currentChannel.props.catchupDays = catchupDaysMatch[1];

      const catchupSourceMatch = line.match(/catchup-source="([^"]+)"/i);
      if (catchupSourceMatch)
        currentChannel.props.catchupSource = catchupSourceMatch[1];
    } else if (line.toUpperCase().startsWith("#KODIPROP:")) {
      if (currentChannel) {
        const propLine = line.substring(10).trim();
        const equalIdx = propLine.indexOf("=");
        if (equalIdx !== -1) {
          const key = propLine.substring(0, equalIdx).trim();
          const val = propLine.substring(equalIdx + 1).trim();
          currentChannel.props[key] = val;
        }
      }
    } else if (line.toUpperCase().startsWith("#EXTVLCOPT:")) {
      if (currentChannel) {
        const optLine = line.substring(11).trim();
        const equalIdx = optLine.indexOf("=");
        if (equalIdx !== -1) {
          const key = optLine.substring(0, equalIdx).trim();
          const val = optLine.substring(equalIdx + 1).trim();
          currentChannel.props[key] = val;
        }
      }
    } else if (line !== "" && !line.startsWith("#")) {
      // Giữ lại toàn bộ URL (bao gồm cả .flv và .m3u8)
      if (currentChannel) {
        currentChannel.url = line;
        channels.push(currentChannel);
        currentChannel = null;
      } else {
        channels.push({
          name: line.split("/").pop().toUpperCase() || "No Name",
          tvgLogo: "",
          tvgGroup: "No Group",
          url: line,
          channelId: count++,
          props: {}
        });
      }
    }
  }
  return channels;
}

function base64ToHex(base64) {
  if (!base64) return "";
  let b64 = base64.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  try {
    const raw = atob(b64);
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      const hex = raw.charCodeAt(i).toString(16);
      result += hex.length === 2 ? hex : "0" + hex;
    }
    return result.toLowerCase();
  } catch (e) {
    console.error("Lỗi giải mã Base64:", e);
    return "";
  }
}

function atob(input) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let str = String(input).replace(/[\t\n\f\r ]/g, "");

  let output = "";
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === "=") break;

    const index = chars.indexOf(str[i]);
    if (index === -1) {
      throw new Error("Invalid base64 character");
    }

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

function parseChannelName(channelName) {
  if (!channelName) return { dateTime: null, title: "No Name" };
  const match = channelName.trim().match(
    /^(?:🟢\s*)?(\d{1,2}:\d{2})\s+(\d{2}\/\d{2})\s+(.+)$/
  );
  if (!match) {
    return {
      dateTime: null,
      title: channelName.trim()
    };
  }
  return {
    dateTime: `${match[1]}-${match[2]}`,
    title: match[3].trim()
  };
}

function isLive(dateTime) {
  if (!dateTime) return false;
  var match = /^(\d{1,2}):(\d{2})-(\d{2})\/(\d{2})$/.exec(dateTime);

  if (!match) {
    return false;
  }
  var hour = Number(match[1]);
  var minute = Number(match[2]);
  var day = Number(match[3]);
  var month = Number(match[4]);

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return false;
  }
  var now = new Date();
  var year = now.getUTCFullYear();
  var eventTimestamp = Date.UTC(year, month - 1, day, hour - 7, minute, 0, 0);

  return eventTimestamp <= Date.now();
}

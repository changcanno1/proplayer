// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
  return JSON.stringify({
    id: "Truyền hình",
    name: "Truyền hình",
    version: "1.0.2",
    baseUrl: BASE_URL,
    iconUrl: "https://i.ibb.co/KjVv0WRP/tvpub-logo.jpg",
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
    { slug: "vtv", title: "VTV ⭐", type: "Horizontal", path: "" },
    { slug: "vtvcab", title: "VTVcab 💎", type: "Horizontal", path: "" },
    { slug: "htv-htvc", title: "HTV x HTVC 🧬", type: "Horizontal", path: "" },
    { slug: "sctv", title: "SCTV 🎫", type: "Horizontal", path: "" },
    { slug: "local", title: "Địa Phương 📺", type: "Horizontal", path: "" },
    { slug: "radio", title: "Radio 📻", type: "Horizontal", path: "" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "VTV", slug: "vtv" },
    { name: "VTVcab", slug: "vtvcab" },
    { name: "HTV x HTVC", slug: "htv-htvc" },
    { name: "SCTV", slug: "sctv" },
    { name: "Địa Phương", slug: "local" },
    { name: "Radio", slug: "radio" }
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
  return `${BASE_URL}?search=${encodeURIComponent(keyword?.trim())}`;
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

    if (channelList.length === 0) channelList = parseM3U(html);
    const category = extractParamFromUrl(apiUrl, "category");
    const keyword = extractParamFromUrl(apiUrl, "search");

    if (category)
      channels = filterChannels(channelList, ["category", category]);
    else if (keyword) channels = filterChannels(channelList, ["search", keyword]);

    channels.forEach((channel) => {
      const {
        props: {
          "inputstream.adaptive.manifest_type": manifestType,
          "inputstream.adaptive.license_type": licenseType,
          "inputstream.adaptive.license_key": licenseKey
        }
      } = channel;

      items.push({
        id: licenseKey ? licenseKey + "&channelId=" + channel.channelId + `|User-Agent=Dalvik/2.1.0&Referer=${BASE_URL}` : "?channelId=" + channel.channelId,
        title: channel.name,
        description: `Channel "${channel.name}" is hosted on server TVPub.`,
        posterUrl: channel.tvgLogo || FALLBACK_POSTER_URL,
        backdropUrl: channel.tvgLogo || FALLBACK_POSTER_URL,
        quality: "LIVE",
        episode_current: manifestType ? `DASH - ${licenseType.toUpperCase()}` : "HLS"
      });
    });

    return JSON.stringify({
      items: items,
      pagination: { currentPage: 1, totalPages: 1 }
    });
  } catch (error) {
    console.error("⛔ [parseDetailResponse in tvpub_plugin.js] ERROR MESSAGE: ", error);
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
    if (apiUrl.indexOf("|") > 0) apiUrl = apiUrl.split("|")[0];
    const channelId = extractParamFromUrl(apiUrl, "channelId");
    const {
      url,
      name,
      props: {
        "http-user-agent": userAgent,
        "http-referrer": referrer,
        "http-origin": origin,
        "inputstream.adaptive.manifest_type": manifestType,
        "inputstream.adaptive.license_type": licenseType,
        "inputstream.adaptive.license_key": licenseKey
      }
    } = getChannel(channelList, channelId);
    
    console.log("ℹ️ [parseDetailResponse in tvpub_plugin.js] Name: ", name);
    // Handle license_type and manifest_type
    // Value manifest_type = dash or mdp
    // Value license_type = clearkey
    if (licenseType === "clearkey") {
      const clearKey = getClearKey(html, licenseKey);
    
      console.log(`ℹ️ [parseDetailResponse in tvpub_plugin.js] Manifest type DASH (MPD) - ClearKey: `, clearKey);
      console.log("ℹ️ [parseDetailResponse in tvpub_plugin.js] URL:", url);
      return JSON.stringify({
        isEmbed: false,
        url: url,
        mimeType: "application/dash+xml",
        drmType: "clearkey",
        drmKid: clearKey.drmKid,
        drmKey: clearKey.drmKey,
        headers: {
          "User-Agent": userAgent || "Dalvik/2.1.0",
          Referer: referrer || url,
          Origin: origin || url
        }
      });
    }
    else if (licenseType === "widevine") { // Value manifest_type = dash or mdp, Value license_type = widevine
      const licenseUrl = apiUrl.substring(0, apiUrl.indexOf("&channelId"));
      
      console.log(`ℹ️ [parseDetailResponse in tvpub_plugin.js] Manifest type DASH (MPD) - Widevine: `, apiUrl);
      console.log("ℹ️ [parseDetailResponse in tvpub_plugin.js] URL:", url);
      return JSON.stringify({
        isEmbed: false,
        url: url,
        mimeType: "application/dash+xml",
        drmType: "widevine",
        licenseUrl: licenseUrl,
        headers: {
          "User-Agent": userAgent || "Dalvik/2.1.0",
          Referer: referrer || url,
          Origin: origin || url
        }
      });
    }
    else { // No manifest_type and licenseType, Normal HLS (m3u8)
      console.log(`ℹ️ [parseDetailResponse in tvpub_plugin.js] Manifest type HLS (M3U8)`);
      console.log("ℹ️ [parseDetailResponse in tvpub_plugin.js] URL:", url);
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
    console.error("⛔ [parseDetailResponse in tvpub_plugin.js] ERROR MESSAGE: ", error);
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

// ======================================
// VARIABLES
// ======================================

const BASE_URL = "https://raw.githubusercontent.com/quanlehong539/TVPub/refs/heads/main/TVPub%20IPTV";
const FALLBACK_POSTER_URL = "https://i.ibb.co/rKHf363x/fallback-thumbnail.webp";
let channelList = [];
// Use GROUP_MAP to rename and merge the channel into tvg-group.
const GROUP_MAP = {
  vtv: "VTV ⭐",
  "thời sự": "VTV ⭐",
  vtvcab: "VTVcab 💎",
  htv: "HTV x HTVC 🧬",
  sctv: "SCTV 🎫",
  "địa phương": "Địa Phương 📺",
  "kênh địa phương": "Địa Phương 📺",
  "thvl": "Địa Phương 📺",
  "dự phòng": "Backup 📌",
  "sự kiện vtvprime": "VTVPrime 🛰️",
  "thiết yếu": "VTV ⭐",
  "🌐| thiết yếu": "VTV ⭐",
  "htv/c": "HTV x HTVC 🧬",
  "asean huyndai cup 2026": "🔴 ASEAN HUYNDAI CUP 2026",
  "live events 🔴": "VOD 🎞️",
  "sự kiện fpt play": "FPTPlay 🏷️",
  "radio": "Radio 📻",
  "phát thanh": "Radio 📻",
  "🇬🇧 uk radio": "Radio 📻",
  "israel": "Israel 🌐",
  "🇰🇷| hàn quốc": "Hàn Quốc 🌐",
  "🇨🇳| trung quốc": "Trung Quốc 🌐",
  "cctv": "Trung Quốc 🌐"
};
// Use CATEGORY_MAP to convert the slug to tvg-group.
const CATEGORY_MAP = {
  vtv: "VTV ⭐",
  antvhd: "VTV ⭐",
  vietnamtoday: "VTV ⭐",
  qpvnhd: "VTV ⭐",
  vtvcab: "VTVcab 💎",
  on: "VTVcab 💎",
  vtvprime: "VTVPrime 🛰️",
  "htv-htvc": "HTV x HTVC 🧬",
  sctv: "SCTV 🎫",
  local: "Địa Phương 📺",
  backup: "Backup 📌",
  "event": "🔴 ASEAN HUYNDAI CUP 2026",
  "vod": "VOD 🎞️",
  "fptplay": "FPTPlay 🏷️",
  "radio": "Radio 📻",
  "israel": "Israel 🌐",
  "korea": "Hàn Quốc 🌐",
  "china": "Trung Quốc 🌐"
};

// ======================================
// FUNCTIONS
// ======================================

function extractParamFromUrl(url, param) {
  if (!url) return "";
  var match = url.match(new RegExp("[?&]" + param + "=([^&]+)"));
  return match ? decodeURIComponent(match[1]) : "";
}

function filterChannels(channels, [filterKey, filterValue]) {
  // filter channels by category
  if (filterValue && filterKey === "category") {
    return channels.filter(
      (channel) => CATEGORY_MAP[filterValue] === channel.tvgGroup
    );
  }
  if (filterValue && filterKey === "search") {
    return channels.filter((channel) => {
      const name = channel.name.toLowerCase();
      filterValue = filterValue.toLowerCase();
      return name.indexOf(filterValue) >= 0;
    });
  }
}

function getChannel(channels, channelId) {
  if (channelId === undefined || channelId === null || channelId === "") return {};
  const numId = parseInt(channelId, 10);
  return channels.find(channel => String(channel.channelId) === String(channelId)) || {};
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
        tvgId: "",
        channelId: count++,
        props: {}
      };

      const commaIndex = line.lastIndexOf(",");
      if (commaIndex !== -1)
        currentChannel.name =
          line.substring(commaIndex + 1).trim() || "No Name";

      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      if (logoMatch && logoMatch[1]) currentChannel.tvgLogo = logoMatch[1];

      const idMatch = line.match(/tvg-id="([^"]+)"/i);
      if (idMatch && idMatch[1]) currentChannel.tvgId = idMatch[1];

      const groupMatch = line.match(/group-title="([^"]+)"/i);
      if (groupMatch && groupMatch[1]) {
        if(groupMatch[1] === "ĐỊA PHƯƠNG" || groupMatch[1] === "PHÁT THANH")
          currentChannel.tvgGroup = GROUP_MAP[groupMatch[1].toLowerCase()]
            ? GROUP_MAP[groupMatch[1].toLowerCase()]
            : groupMatch[1];
        else {
          for (const key in CATEGORY_MAP) {
            if(startsWithRegex(currentChannel.tvgId, (key === "htv-htvc" ? "htv" : key))) {
              currentChannel.tvgGroup = CATEGORY_MAP[key];
              break;
            }
          }
        }
      }

      // Capture all catchup attributes
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

function startsWithRegex(str, prefix) {
  const regex = new RegExp("^" + prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return regex.test(str);
}

// Convert Base64/Base64Url to Hex for ClearKey
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

// A handmade atob function for QuickJS
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

// The getClearKey function is used for multiple IPTV sources.
function getClearKey(html, licenseKey) {
  const clearKey = {}
  try { // clearKey needs to be fetched.
    // JSON format {"keys":[{"kid":"...","k":"..."}]}
    const keyData = JSON.parse(html);
    console.log("ℹ️ [getClearKey in tvpub_plugin.js] clearKey NEEDS to be fetched - ", keyData);
    if (keyData.keys && Array.isArray(keyData.keys)) {
      keyData.keys.forEach((k) => {
        clearKey.drmKid = base64ToHex(k.kid);
        clearKey.drmKey = base64ToHex(k.k);
      });
    } else if (keyData.kid && keyData.k) { // JSON format {"kid":"...","k":"..."}
      clearKey.drmKid = base64ToHex(keyData.kid);
      clearKey.drmKey = base64ToHex(keyData.k);
    }
  } catch (error) { // clearKey does not require fetching.
    console.log("ℹ️ [getClearKey in tvpub_plugin.js] clearKey does NOT require fetching - ", licenseKey);
    // Hex format "KID:KEY" (e.g. license_key=aabb...:ccdd...)
    if (licenseKey && licenseKey.includes(":") && licenseKey.split(":").length === 2) {
      const parts = licenseKey.split(":");

      if (
        /^[0-9a-fA-F]+$/.test(parts[0]) &&
        /^[0-9a-fA-F]+$/.test(parts[1])
      ) {
        clearKey.drmKid = parts[0].toLowerCase();
        clearKey.drmKey = parts[1].toLowerCase();
      }
    }
    else {
      const keyData = JSON.parse(licenseKey);
      // JSON format {"keys":[{"kid":"...","k":"..."}]}
      if (keyData.keys && Array.isArray(keyData.keys)) {
      keyData.keys.forEach((k) => {
        clearKey.drmKid = base64ToHex(k.kid);
        clearKey.drmKey = base64ToHex(k.k);
      });
      } else if (keyData.kid && keyData.k) { // JSON format {"kid":"...","k":"..."}
        clearKey.drmKid = base64ToHex(keyData.kid);
        clearKey.drmKey = base64ToHex(keyData.k);
      }
    }
  }

  return clearKey
}

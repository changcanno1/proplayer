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
    { slug: "sao-ke-tv", title: "Sao Kê TV", type: "Horizontal", path: "" },
    { slug: "s8-tv", title: "S8 TV", type: "Horizontal", path: "" },
    { slug: "sut-bong-tv", title: "Sút Bóng TV", type: "Horizontal", path: "" },
    { slug: "pha-lang-tv", title: "Phá Làng TV", type: "Horizontal", path: "" },
    { slug: "ga-vang-24h", title: "Gà Vàng 24h", type: "Horizontal", path: "" },
    { slug: "ga-vang-33", title: "Gà Vàng 33", type: "Horizontal", path: "" },
    { slug: "kho-ga-tv", title: "Khô Gà TV", type: "Horizontal", path: "" },
    { slug: "bia-om-tv", title: "Bia Ôm TV", type: "Horizontal", path: "" },
    { slug: "chuoi-chien-tv", title: "Chuối Chiên TV", type: "Horizontal", path: "" },
    { slug: "cola-tv", title: "Cola TV", type: "Horizontal", path: "" },
    { slug: "vua-san-co-tv", title: "Vua Sân Cỏ TV", type: "Horizontal", path: "" },
    { slug: "xoi-gac-tv", title: "Xôi Gấc TV", type: "Horizontal", path: "" },
    { slug: "xoi-lac-z-tv", title: "Xôi Lạc Z TV", type: "Horizontal", path: "" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Giờ Vàng TV", slug: "gio-vang-tv" },
    { name: "Sao Kê TV", slug: "sao-ke-tv" },
    { name: "S8 TV", slug: "s8-tv" },
    { name: "Sút Bóng TV", slug: "sut-bong-tv" },
    { name: "Phá Làng TV", slug: "pha-lang-tv" },
    { name: "Gà Vàng 24h", slug: "ga-vang-24h" },
    { name: "Gà Vàng 33", slug: "ga-vang-33" },
    { name: "Khô Gà TV", slug: "kho-ga-tv" },
    { name: "Bia Ôm TV", slug: "bia-om-tv" },
    { name: "Chuối Chiên TV", slug: "chuoi-chien-tv" },
    { name: "Cola TV", slug: "cola-tv" },
    { name: "Vua Sân Cỏ TV", slug: "vua-san-co-tv" },
    { name: "Xôi Gấc TV", slug: "xoi-gac-tv" },
    { name: "Xôi Lạc Z TV", slug: "xoi-lac-z-tv" }
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
    else if (keyword)
      channels = filterChannels(channelList, ["search", keyword]);

    channels.forEach((channel) => {
      const matchInfo = parseChannelName(channel.name);
      items.push({
        id: "?channelId=" + channel.channelId,
        title: matchInfo.title ? matchInfo.title : channel.name,
        description: `Channel "${channel.name}" is hosted on server THTheThao.`,
        posterUrl: channel.tvgLogo || FALLBACK_POSTER_URL,
        backdropUrl: channel.tvgLogo || FALLBACK_POSTER_URL,
        quality: isLive(matchInfo.dateTime) ? "LIVE" : matchInfo.dateTime,
        episode_current: channel.url.includes(".m3u8") ? "HSL" : "FLV"
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
    if (apiUrl.indexOf("|") > 0) apiUrl = apiUrl.split("|")[0];
    const channelId = extractParamFromUrl(apiUrl, "channelId");
    const {
      url,
      name,
      props: {
        "http-user-agent": userAgent,
        "http-referrer": referrer,
        "http-origin": origin
      }
    } = getChannel(channelList, channelId);

    console.log("ℹ️ [parseDetailResponse in ththethao_plugin.js] Name: ", name);
      if (url.includes(".flv")) {
      // FLV (flv)
      console.log(
        `ℹ️ [parseDetailResponse in ththethao_plugin.js] Manifest type FLV`
      );
      console.log("ℹ️ [parseDetailResponse in ththethao_plugin.js] URL:", url);
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
      // HLS (m3u8)
      console.log(
        `ℹ️ [parseDetailResponse in ththethao_plugin.js] Manifest type HLS (M3U8)`
      );
      console.log("ℹ️ [parseDetailResponse in ththethao_plugin.js] URL:", url);
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

// ======================================
// VARIABLES
// ======================================

const BASE_URL = "

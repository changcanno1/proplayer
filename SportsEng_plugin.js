// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
  return JSON.stringify({
    id: "streamed",
    name: "Streamed",
    version: "1.4.1",
    baseUrl: BASE_DOMAIN,
    iconUrl: "https://i.ibb.co/N2mkkD4N/streamed-logo.png",
    isEnabled: true,
    isAdult: false,
    type: "MOVIE",
    layoutType: "HORIZONTAL",
    playerType: "embedtoexoplay",
    debug: false
  });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "live/popular-viewcount", title: "🔴 LIVE (popular by viewers)", type: "Horizontal", path: "" },
    { slug: "live/popular", title: "🔴 LIVE", type: "Horizontal", path: "" },
    { slug: "fight", title: "Fight (Boxing, MMA, ...v.v) 🥊", type: "Horizontal", path: "" },
    { slug: "football", title: "Football ⚽", type: "Horizontal", path: "" },
    { slug: "motor-sports", title: "Motor Sports 🏁", type: "Horizontal", path: "" },
    { slug: "baseball", title: "Baseball ⚾", type: "Horizontal", path: "" },
    { slug: "basketball", title: "Basketball 🏀", type: "Horizontal", path: "" },
    { slug: "american-football", title: "American Football 🏈", type: "Horizontal", path: "" },
    { slug: "golf", title: "Golf 🚩", type: "Horizontal", path: "" },
    { slug: "tennis", title: "Tennis 🎾", type: "Horizontal", path: "" },
    { slug: "billiards", title: "Billiards 🎱", type: "Horizontal", path: "" },
    { slug: "cricket", title: "Cricket 🏏", type: "Horizontal", path: "" },
    { slug: "afl", title: "AFL 🏈", type: "Horizontal", path: "" },
    { slug: "darts", title: "Darts 🎯", type: "Horizontal", path: "" },
    { slug: "hockey", title: "Hockey 🏒", type: "Horizontal", path: "" },
    { slug: "rugby", title: "Rugby 🏉", type: "Horizontal", path: "" },
    { slug: "other", title: "Other 🏳️‍🌈", type: "Horizontal", path: "" },
    { slug: "all-today", title: "All Matches 📋", type: "Grid", path: "" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Fight", slug: "fight" },
    { name: "Football", slug: "football" },
    { name: "Basketball", slug: "basketball" },
    { name: "American Football", slug: "american-football" },
    { name: "Motor Sports", slug: "motor-sports" },
    { name: "Tennis", slug: "tennis" },
    { name: "Golf", slug: "golf" },
    { name: "Baseball", slug: "baseball" },
    { name: "Cricket", slug: "cricket" },
    { name: "Billiards", slug: "billiards" },
    { name: "AFL", slug: "afl" },
    { name: "Darts", slug: "darts" },
    { name: "Hockey", slug: "hockey" },
    { name: "Rugby", slug: "rugby" },
    { name: "Other", slug: "other" },
    { name: "All Matches", slug: "all" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({ sort: [], category: [] });
}

// =============================================================================
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
// =============================================================================

function getUrlList(slug, filtersJson) {
  return `${BASE_API_URL}/matches/${slug}`;
}

function getUrlSearch(keyword = "", filtersJson) {
  return `${BASE_API_URL}/matches/all?search=${encodeURIComponent(keyword.trim())}`;
}

function getUrlDetail(path) {
  if (!path) return "";
  if (path.indexOf("http") === 0) return path;
  return BASE_API_URL + path;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER (App fetch URL xong → ném HTML/JSON thô vào đây → bạn parse)
// =============================================================================

function parseListResponse(html, apiUrl) {
  try {
    let streams = JSON.parse(html);
    const items = [];
    const keyword = extractParamFromUrl(apiUrl, "search");
    streams = filterStreams(streams, keyword);

    streams.forEach((stream) => {
      const title = stream.title?.trim();
      const posterUrl = getPosterUrl(stream);
      const category = stream.category?.toUpperCase();

      for (const item of stream.sources) {
        const serverName = item.source?.toUpperCase();
        if (serverName === "ECHO") continue;
        const description = `Event "${title}" is hosted on server ${serverName}.`;
        const encodedData = encodeURIComponent(JSON.stringify({ title, posterUrl, category, description }));

        items.push({
          id: `/stream/${item.source}/${item.id}`,
          datasend: encodedData,
          title,
          posterUrl,
          backdropUrl: posterUrl,
          quality: Date.now() >= stream.date ? "LIVE" : formatDateTime(stream.date),
          episode_current: serverName,
          lang: category
        });
      }
    });

    return JSON.stringify({
      items: items,
      pagination: { currentPage: 1, totalPages: 1 }
    });
  } catch (error) {
      return JSON.stringify({
        items: [],
        pagination: { currentPage: 1, totalPages: 1 }
      });
  }
}

function parseSearchResponse(html, apiUrl) {
  return parseListResponse(html, apiUrl);
}

function parseMovieDetail(html, apiUrl, datasend) {
  try {
    const stream = JSON.parse(html);
    if (!Array.isArray(stream) || stream.length === 0) return EMPTY_MOVIE_DETAIL;
      
    const data = JSON.parse(decodeURIComponent(datasend));
    const episodes = [];
    const serverName = stream[0].source?.toUpperCase();

    stream.forEach((item, index) => {
      const quality = item.hd ? "HD" : "SD";
      const viewers = formatViewerCount(item.viewers);

      episodes.push({
        id: item.embedUrl,
        name: `${quality}${viewers ? " - 🔴 " + viewers : ""}${item.language ? " - " + item.language : ""}`,
        slug: `${item.id.split("?")[0]}-${index + 1}`
      });
    });

    return JSON.stringify({
      id: getPath(apiUrl, `/stream/`),
      title: data.title,
      posterUrl: data.posterUrl,
      backdropUrl: data.posterUrl,
      lang: serverName,
      description: data.description + SELECTION_GUIDE,
      quality: data.category,
      servers: [{ name: serverName, episodes: episodes }]
    });
  } catch (error) {
      return EMPTY_MOVIE_DETAIL;
  }
}

function parseDetailResponse(html, embedUrl) {
  try {
    return JSON.stringify({
      url: embedUrl,
      headers: {
        Referer: embedUrl,
        Origin: embedUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Block-Ads": "true",
        "Custom-Js": getSnifferJS()
      },
      isEmbed: true
    });
  } catch (error) {
      return "{}";
  }
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// NHÓM 4: HELPERS
// =============================================================================

const BACKUP_DOMAINS = "https://strmd.link";
const BASE_DOMAIN = "https://streamed.pk";
const BASE_API_URL = "https://streamed.pk/api";
const FALLBACK_POSTER_URL = "https://i.ibb.co/rKHf363x/fallback-thumbnail.webp";
const EMPTY_MOVIE_DETAIL = JSON.stringify({
  id: "",
  title: "⚠️ Stream Link Not Found!",
  posterUrl: FALLBACK_POSTER_URL,
  backdropUrl: FALLBACK_POSTER_URL,
  servers: []
});
const SELECTION_GUIDE = `\n\n✅The format of each live event link is: [VideoQuality - ConcurrentViewers].\n✅Video quality: Prefer at least HD.\n✅Concurrent viewers: higher is better, 1N = 1000 concurrent viewers.`;

function getPosterUrl(stream) {
  if (stream?.poster) return BASE_API_URL + stream.poster.substring(stream.poster.indexOf("/api/") + 4);
  const teams = stream.teams;
  
  if(!teams) return FALLBACK_POSTER_URL;
  const homeTeamLogoSlug = teams.home?.badge;
  const awayTeamLogoSlug = teams.away?.badge;

  if (homeTeamLogoSlug && awayTeamLogoSlug) 
    return `${BASE_API_URL}/images/poster/${homeTeamLogoSlug}/${awayTeamLogoSlug}.webp`;
  return FALLBACK_POSTER_URL;
}

function formatDateTime(timestamp) {
  if (timestamp == null) return "";
  if (timestamp < 1e12) timestamp *= 1000;
  const date = new Date(timestamp);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const MM = String(date.getMonth() + 1).padStart(2, "0");

  return `${hh}:${mm}-${dd}/${MM}`;
}

function formatViewerCount(viewerCount) {
  if (!viewerCount) return 0;
  return /^\d+$/.test(viewerCount)
    ? +viewerCount < 1000
      ? viewerCount
      : String(Math.floor(+viewerCount / 1000)) + "N"
    : viewerCount;
}

function extractParamFromUrl(url, param) {
  if (!url) return "";
  var match = url.match(new RegExp("[?&]" + param + "=([^&]+)"));
  return match ? decodeURIComponent(match[1]) : "";
}

function filterStreams(streams, keyword) {
  if (keyword) {
    streams = streams.filter((stream) => {
      return (stream.title?.toLowerCase()?.indexOf(keyword.toLowerCase() || "") >= 0);
    });
  }
  return streams;
}

function getPath(apiUrl, keyword) {
  const index = apiUrl.indexOf(keyword);
  if (!keyword || index === -1) return "";
  return apiUrl.substring(index);
}

// =============================================================================
// SNIFFER: XỬ LÝ BẮT LINK CHỐNG LAG XOAY MÀN HÌNH
// =============================================================================
function getSnifferJS() {
  return `
  (function () {
      'use strict';
      let hasSentToBridge = false;
      const rawFetch = window.fetch;
      const rawXHROpen = XMLHttpRequest.prototype.open;

      function isDirectStreamUrl(url) {
          if (!url || typeof url !== 'string') return false;
          const cleanUrl = url.split('?')[0].toLowerCase();
          return cleanUrl.endsWith('.m3u8') || cleanUrl.endsWith('.mp4') || url.includes('.m3u8?');
      }

      function sendToNativeBridge(playUrl) {
          if (hasSentToBridge) return;
          hasSentToBridge = true;
          if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
              window.SnifferBridge.play(playUrl, window.location.href);
          }
      }

      function processDetectedUrl(url) {
          if (!url || hasSentToBridge) return;
          if (isDirectStreamUrl(url)) {
              sendToNativeBridge(url);
          }
      }

      window.fetch = async function (...args) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
          processDetectedUrl(url);
          return rawFetch.apply(this, args);
      };

      XMLHttpRequest.prototype.open = function (method, url) {
          processDetectedUrl(url);
          return rawXHROpen.apply(this, arguments);
      };

      setInterval(() => {
          if (hasSentToBridge) return;
          document.querySelectorAll('video, source').forEach(el => {
              if (el.src) processDetectedUrl(el.src);
          });
      }, 1000);
  })();
  `;
}

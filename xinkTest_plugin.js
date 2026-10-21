/* =============================================================================
 * XINK PLUGIN cho VAAPP
 * Nguồn: https://api.xink.pro
 * Loại:  MOVIE — Player: embed (WebView)
 * ============================================================================= */

var BASEURL = "https://api.xink.pro";
var BASEAPI = BASEURL;
var BASELINK = BASEURL;
var UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 " +
         "(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

var EMBED_REF = "https://playembed.vip/";
var ONFLIX_XOR_KEY = "onflix_secure_stream_v2_2026";
// =============================================================================
// MANIFEST
// =============================================================================
function getManifest() {
  return JSON.stringify({
    id:          "xinkTest",
    name:        "Xink [MOVIE]",
    description: "Phim HD tổng hợp",
    version:     "1.0.0",
    author:      "Community",
    baseUrl:     BASEURL,
    iconUrl:     "https://vaxplugin.alokillgtv.workers.dev/img/icon/xink.png",
    isEnabled:   true,
    isAdult:     false,
    type:        "MOVIE",
    layoutType:  "VERTICAL",
    playerType:  "exoplayer",
    subtitleCat: false,
  });
}

// =============================================================================
// HOME SECTIONS
// =============================================================================
function getHomeSections() {
  return JSON.stringify([
    { slug: "list:phim-bo",            title: "Phim Bộ",             type: "Horizontal" },
    { slug: "list:phim-le",            title: "Phim Lẻ",             type: "Horizontal" },
    { slug: "list:phim-chieu-rap",     title: "Phim Chiếu Rạp",      type: "Horizontal" },
    { slug: "list:phim-moi-cap-nhat",  title: "Phim Mới Cập Nhật",  type: "Grid" }
  ]);
}

// =============================================================================
// PRIMARY CATEGORIES
// =============================================================================
function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Phim Mới",       slug: "list:phim-moi-cap-nhat" },
    { name: "Đang Chiếu",     slug: "list:phim-dang-chieu" },
    { name: "Phim Bộ",        slug: "list:phim-bo" },
    { name: "Phim Lẻ",        slug: "list:phim-le" },
    { name: "Chiếu Rạp",      slug: "list:phim-chieu-rap" },
    { name: "Hành Động",      slug: "genre:hanh-dong" },
    { name: "Tình Cảm",       slug: "genre:tinh-cam" },
    { name: "Kinh Dị",        slug: "genre:kinh-di" },
    { name: "Hài Hước",       slug: "genre:hai-huoc" },
    { name: "Cổ Trang",       slug: "genre:co-trang" },
    { name: "Viễn Tưởng",     slug: "genre:vien-tuong" },
    { name: "Hoạt Hình",      slug: "genre:hoat-hinh" },
    { name: "Học Đường",      slug: "genre:hoc-duong" },
    { name: "Lãng Mạn",       slug: "genre:lang-man" },
    { name: "Phiêu Lưu",      slug: "genre:phieu-luu" },
    { name: "Khoa Học",       slug: "genre:khoa-hoc" }
  ]);
}

// =============================================================================
// FILTER CONFIG
// =============================================================================
function getFilterConfig() {
  var cats = JSON.parse(getPrimaryCategories()).map(function (c) {
    return { name: c.name, value: c.slug };
  });

  var countries = [
    { name: "Việt Nam",     value: "viet-nam" },
    { name: "Trung Quốc",   value: "trung-quoc" },
    { name: "Hàn Quốc",     value: "han-quoc" },
    { name: "Nhật Bản",     value: "nhat-ban" },
    { name: "Thái Lan",     value: "thai-lan" },
    { name: "Âu Mỹ",        value: "au-my" },
    { name: "Hồng Kông",    value: "hong-kong" },
    { name: "Đài Loan",     value: "dai-loan" },
    { name: "Ấn Độ",        value: "an-do" },
    { name: "Anh",          value: "anh" },
    { name: "Pháp",         value: "phap" },
    { name: "Đức",          value: "duc" }
  ];

  var years = [];
  for (var y = 2026; y >= 2000; y--) {
    years.push({ name: String(y), value: String(y) });
  }

  return JSON.stringify({
    category: cats,
    country:  countries,
    year:     years
  });
}

// =============================================================================
// URL BUILDERS
// =============================================================================
function getUrlList(slug, filtersJson) {
  var page = 1;
  var filterCategory = "";
  var filterCountry  = "";
  var filterYear     = "";

  try {
    var fixed = (filtersJson || "{}")
      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/:,/g, ":");
    var f = JSON.parse(fixed);
    page = parseInt(f.page) || 1;

    if (f.category) {
      filterCategory = (typeof f.category === "string")
        ? f.category
        : (Array.isArray(f.category) && f.category[0]
            ? (f.category[0].value || f.category[0].slug || "")
            : "");
    }
    if (f.country) {
      filterCountry = (typeof f.country === "string")
        ? f.country
        : (Array.isArray(f.country) && f.country[0]
            ? (f.country[0].value || f.country[0].slug || "")
            : "");
    }
    if (f.year) {
      filterYear = (typeof f.year === "string")
        ? f.year
        : (Array.isArray(f.year) && f.year[0]
            ? (f.year[0].value || f.year[0].slug || "")
            : "");
    }
  } catch (e) { /* ignore */ }

  // ⭐ Ưu tiên filter > slug
  if (filterCategory || filterCountry || filterYear) {
    // Áp dụng filter cho list mặc định (phim mới)
    var listType = "phim-moi-cap-nhat";
    // Nếu có category → dùng genre
    if (filterCategory) {
      var url = BASEURL + "/api/content/the-loai/" + encodeURIComponent(filterCategory)
              + "?page=" + page + "&limit=24";
      if (filterCountry) url += "&country=" + encodeURIComponent(filterCountry);
      if (filterYear)    url += "&year=" + encodeURIComponent(filterYear);
      return url;
    }
    // Chỉ có country
    if (filterCountry) {
      var url2 = BASEURL + "/api/content/quoc-gia/" + encodeURIComponent(filterCountry)
               + "?page=" + page + "&limit=24";
      if (filterYear) url2 += "&year=" + encodeURIComponent(filterYear);
      return url2;
    }
    // Chỉ có year
    if (filterYear) {
      return BASEURL + "/api/content/nam/" + encodeURIComponent(filterYear)
           + "?page=" + page + "&limit=24";
    }
  }

  // ⭐ Xử lý slug
  if (!slug) {
    return BASEURL + "/api/content/phim-moi-cap-nhat/page/" + page + "?limit=24";
  }

  if (slug.indexOf("list:") === 0) {
    var listSlug = slug.substring(5);
    return BASEURL + "/api/content/" + listSlug + "/page/" + page + "?limit=24";
  }

  if (slug.indexOf("genre:") === 0) {
    var g = slug.substring(6);
    return BASEURL + "/api/content/the-loai/" + encodeURIComponent(g)
         + "?page=" + page + "&limit=24";
  }

  if (slug.indexOf("country:") === 0) {
    var c = slug.substring(8);
    return BASEURL + "/api/content/quoc-gia/" + encodeURIComponent(c)
         + "?page=" + page + "&limit=24";
  }

  if (slug.indexOf("year:") === 0) {
    var y = slug.substring(5);
    return BASEURL + "/api/content/nam/" + encodeURIComponent(y)
         + "?page=" + page + "&limit=24";
  }

  // Fallback
  return BASEURL + "/api/content/phim-moi-cap-nhat/page/" + page + "?limit=24";
}

function getUrlSearch(keyword, filtersJson) {
  var page = 1;
  try {
    var fixed = (filtersJson || "{}")
      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/:,/g, ":");
    var f = JSON.parse(fixed);
    page = parseInt(f.page) || 1;
  } catch (e) { /* ignore */ }

  return BASEURL + "/api/content/tim-kiem?keyword=" + encodeURIComponent(keyword || "")
       + "&page=" + page + "&limit=24";
}

function getUrlDetail(slug, datasend) {
    try {
        if (!slug) return "";
        if (slug.indexOf('http') === 0) {
            log("getUrlDetail[url]: \n" + slug);
            return slug;
        }
        var detailUrl = BASEURL + "/api/content/phim/" + slug;
        log("getUrlDetail[url]: \n" + detailUrl);
        return detailUrl;
    } catch (e) {
        log("getUrlDetail[err]:\n " + e);
        return "";
    }
}
// =============================================================================
// PARSER: LIST
// =============================================================================
function parseListResponse(html, apiUrl) {
  try {
    var data  = JSON.parse(html);
    var items = [];
    var list  = data.items || [];

    list.forEach(function (it) {
      items.push({
        id:              it.slug || "",
        title:           it.name || "",
        posterUrl:       it.poster_url || it.thumb_url || "",
        backdropUrl:     it.thumb_url  || it.poster_url || "",
        quality:         it.quality || "HD",
        year:            parseInt(it.year) || 0,
        episode_current: it.episode_current || "",
        lang:            it.sub || it.lang || ""
      });
    });

    var pag = data.pagination || {};
    return JSON.stringify({
      items: items,
      pagination: {
        currentPage:  pag.currentPage || pag.current_page || 1,
        totalPages:   pag.totalPages || pag.total_pages || 1,
        totalItems:   pag.totalItems || pag.total_items || items.length,
        itemsPerPage: pag.totalItemsPerPage || pag.items_per_page || 24
      }
    });
  } catch (e) {
    return JSON.stringify({
      items: [],
      pagination: { currentPage: 1, totalPages: 1 }
    });
  }
}

function parseSearchResponse(html, url) {
  return parseListResponse(html, url);
}

// =============================================================================
// PARSER: MOVIE DETAIL
// =============================================================================
function parseMovieDetail(html, apiUrl, datasend) {
  try {
    var data  = JSON.parse(html);
    var movie = data.movie || {};

    if (!movie.slug) {
      return JSON.stringify({
        id:          apiUrl || "error",
        title:       "Không có dữ liệu",
        description: "Response thiếu trường movie.slug",
        servers:     []
      });
    }

    // ⭐ Servers: [ { server_name, server_data: [ { episode_id, name, slug, filename, link_embed } ] } ]
    var rawServers = data.episodes || [];
    var servers    = [];

    rawServers.forEach(function (srv, sIdx) {
      var srvName = srv.server_name || ("Server " + (sIdx + 1));
      var srvEps  = srv.server_data || [];
      var episodes = [];

      srvEps.forEach(function (ep, eIdx) {
        var link = ep.link_embed || "";
        if (!link) return;

        var epName = ep.filename || ("Tập " + (ep.name || (eIdx + 1)));
        // ⭐ Slug unique: kèm server index để tránh trùng "1", "2" giữa các server
        var epSlug = "s" + (sIdx + 1) + "-e" + (eIdx + 1) + "-" + (ep.slug || ep.name || "");

        episodes.push({
          id:   "https://example.com?stream=" + encodeURI(link),                 // URL embed
          name: epName,
          slug: epSlug
        });
      });

      if (episodes.length > 0) {
        servers.push({ name: srvName, episodes: episodes });
      }
    });

    // Category (markdown link)
    var categoryMd = "";
    if (Array.isArray(movie.category) && movie.category.length > 0) {
      categoryMd = movie.category.map(function (c) {
        return "[" + (c.name || "").trim() + "](genre:" + (c.slug || "") + ")";
      }).join(", ");
    }

    // Country
    var countryMd = "";
    if (Array.isArray(movie.country) && movie.country.length > 0) {
      countryMd = movie.country.map(function (c) {
        return "[" + (c.name || "").trim() + "](country:" + (c.slug || "") + ")";
      }).join(", ");
    }

    // Casts / Director
    var castsStr = "";
    if (Array.isArray(movie.actor) && movie.actor.length > 0) {
      castsStr = movie.actor.join(", ");
    }
    var dirStr = "";
    if (Array.isArray(movie.director) && movie.director.length > 0) {
      dirStr = movie.director.join(", ");
    }

    return JSON.stringify({
      id:              movie.slug || "",
      title:           movie.name || "",
      originName:      movie.origin_name || "",
      posterUrl:       movie.poster_url || movie.thumb_url || "",
      backdropUrl:     movie.thumb_url  || movie.poster_url || "",
      description:     (movie.content || "").replace(/<[^>]*>/g, "").trim(),
      quality:         movie.quality || "HD",
      year:            parseInt(movie.year) || 0,
      rating:          movie.tmdb && movie.tmdb.vote_average
                         ? String(movie.tmdb.vote_average) : "",
      status:          movie.episode_current || movie.status || "",
      category:        categoryMd,
      country:         countryMd,
      episode_current: movie.episode_current || "",
      servers:         servers,
      duration:        movie.time || "",
      casts:           castsStr,
      director:        dirStr,
      lang:            movie.lang || ""
    });
  } catch (e) {
    return JSON.stringify({
      id:          apiUrl || "error",
      title:       "Lỗi tải chi tiết",
      description: e.message || String(e),
      servers:     []
    });
  }
}

// =============================================================================
// PARSER: DETAIL RESPONSE (fallback nếu App không bỏ qua fetch)
// =============================================================================
function rawJS() {
  return `
  (function() {
  'use strict';

  // ═══ Guard: chỉ cài 1 lần ═══
  if (window.__onflix_sniffer_installed) {
    console.log('[ONFLIX] already installed');
    return;
  }
  window.__onflix_sniffer_installed = true;

  // ═══ Logger: ưu tiên SnifferBridge nếu có, fallback console ═══
  function log(msg) {
    try {
      console.log('[ONFLIX] ' + msg);
      if (window.SnifferBridge && typeof SnifferBridge.log === 'function') {
        SnifferBridge.log('[ONFLIX] ' + msg);
      }
    } catch(e) {
      console.log('[ONFLIX-ERR] ' + (e.message || e));
    }
  }

  // ═══ Filter: chỉ bắt request có dạng "*.onflixcdn.com/?url=..." ═══
  function isTargetUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.indexOf('onflixcdn.com') === -1) return false;
    if (url.indexOf('url=') === -1) return false;
    return true;
  }

  // ═══ Xử lý response: parse JSON và bóc các trường ═══
  function processResponse(text, sourceUrl) {
    if (!text || text.length < 10) return;

    var data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      log('❌ JSON parse fail: ' + e.message);
      return;
    }

    // Chỉ xử lý khi là dạng "media" (có play_vid)
    if (!data || typeof data !== 'object') return;
    if (!data.play_vid && !data.sub) return;

    log('═══════════════════════════════════════════');
    log('🎯 CAPTURED from: ' + sourceUrl.substring(0, 120) + '...');
    log('   ├─ id:          ' + (data.id || ''));
    log('   ├─ quality:     ' + (data.quality || ''));
    log('   ├─ resolution:  ' + (data.resolution || ''));
    log('   ├─ bandwidth:   ' + (data.bandwidth || ''));
    log('   ├─ codecs:      ' + (data.codecs || ''));
    log('   ├─ sub:         ' + (data.sub || '(none)'));
    log('   ├─ thumbvtt:    ' + (data.thumbvtt || '(none)'));
    log('   ├─ hasPlayVid:  ' + !!data.play_vid);
    log('   └─ play_vid len: ' + (data.play_vid ? data.play_vid.length : 0));
    log('═══════════════════════════════════════════');

    // In preview m3u8 (200 ký tự đầu)
    if (data.play_vid) {
      var preview = data.play_vid.substring(0, 200).replace(/\\n/g, '\\\\n');
      log('📺 M3U8 preview:\\n' + preview + '...');
    }

    // ═══ Lưu vào window để dùng về sau ═══
    window.__onflix_last_data = data;

    // ═══ Gửi cho App (SnifferBridge) — optional ═══
    try {
      if (window.SnifferBridge) {
        // Nếu có API playM3u8Content → gửi luôn
        if (typeof SnifferBridge.playM3u8Content === 'function' && data.play_vid) {
          var headers = JSON.stringify({
            'Referer': 'https://playembed.vip/',
            'User-Agent': navigator.userAgent,
            'Origin': 'https://playembed.vip'
          });
          SnifferBridge.playM3u8Content(data.play_vid, sourceUrl, headers);
          log('▶️ Sent m3u8 to player via SnifferBridge');
        }
        // Thông báo App qua toast
        if (typeof SnifferBridge.toast === 'function') {
          SnifferBridge.toast('✅ Đã bắt link: ' + (data.quality || 'media'), 2000);
        }
      }
    } catch(e) {
      log('SnifferBridge send err: ' + (e.message || e));
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 1. HOOK XMLHttpRequest
  // ═══════════════════════════════════════════════════════════
  var OrigXHROpen = XMLHttpRequest.prototype.open;
  var OrigXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    try {
      this.__onflix_url = url;
      this.__onflix_is_target = isTargetUrl(url);
      if (this.__onflix_is_target) {
        log('🔍 XHR open → ' + url.substring(0, 120) + '...');
      }
    } catch(e) {}
    return OrigXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    var self = this;
    if (this.__onflix_is_target) {
      this.addEventListener('readystatechange', function() {
        try {
          if (self.readyState === 4) {
            if (self.status === 200 && self.responseText) {
              processResponse(self.responseText, self.__onflix_url);
            } else {
              log('⚠️ XHR status=' + self.status + ' for ' + (self.__onflix_url || '').substring(0, 100));
            }
          }
        } catch(e) {
          log('xhr read err: ' + (e.message || e));
        }
      });
    }
    return OrigXHRSend.apply(this, arguments);
  };

  // ═══════════════════════════════════════════════════════════
  // 2. HOOK fetch
  // ═══════════════════════════════════════════════════════════
  if (typeof window.fetch === 'function') {
    var OrigFetch = window.fetch;
    window.fetch = function(input, init) {
      var url = '';
      try {
        url = (typeof input === 'string') ? input : (input && input.url);
      } catch(e) {}

      var isTarget = isTargetUrl(url);
      if (isTarget) {
        log('🔍 fetch → ' + url.substring(0, 120) + '...');
      }

      var p = OrigFetch.apply(this, arguments);

      if (isTarget) {
        p = p.then(function(response) {
          try {
            var cloned = response.clone();
            cloned.text().then(function(text) {
              processResponse(text, url);
            }).catch(function(e) {
              log('fetch clone read err: ' + (e.message || e));
            });
          } catch(e) {
            log('fetch clone err: ' + (e.message || e));
          }
          return response;
        });
      }

      return p;
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 3. HOOK WebSocket (nếu có) — một số player dùng WS để nhận m3u8
  // ═══════════════════════════════════════════════════════════
  if (typeof window.WebSocket === 'function') {
    var OrigWS = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      var ws = new OrigWS(url, protocols);
      try {
        ws.addEventListener('message', function(evt) {
          try {
            if (typeof evt.data === 'string' && evt.data.indexOf('play_vid') > -1) {
              log('🔍 WS message has play_vid → parsing');
              processResponse(evt.data, url);
            }
          } catch(e) {}
        });
      } catch(e) {}
      return ws;
    };
    // copy constants
    try { window.WebSocket.CONNECTING = OrigWS.CONNECTING; } catch(e) {}
    try { window.WebSocket.OPEN       = OrigWS.OPEN; }       catch(e) {}
    try { window.WebSocket.CLOSING    = OrigWS.CLOSING; }    catch(e) {}
    try { window.WebSocket.CLOSED     = OrigWS.CLOSED; }     catch(e) {}
    window.WebSocket.prototype = OrigWS.prototype;
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API — gọi tay từ Console để xem data đã bắt
  // ═══════════════════════════════════════════════════════════
  window.__onflix_dump = function() {
    if (window.__onflix_last_data) {
      console.log('=== ONFLIX LAST DATA ===');
      console.log(JSON.stringify(window.__onflix_last_data, null, 2));
      return window.__onflix_last_data;
    } else {
      console.log('No data captured yet.');
      return null;
    }
  };

  window.__onflix_clear = function() {
    window.__onflix_last_data = null;
    log('🗑️ Cleared');
  };

  log('✅ ONFLIX sniffer installed (XHR + fetch + WS hooks)');
})();
`;
}

// =============================================================================
// Bóc subtitle từ source HTML của playembed.vip
// =============================================================================
function extractOnflixSubtitles(html) {
    var subs = [];
    if (!html) return subs;

    // ⭐ Unescape Next.js RSC: \" → " ; \u0026 → & ; \\/ → /
    var src = String(html)
        .replace(/\\u0026/g, "&")
        .replace(/\\u003d/gi, "=")
        .replace(/\\\//g, "/")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");

    // ═══ 1. Sub tiếng Việt + đa ngôn ngữ (initialSubtitles) ═══
    var initMatch = src.match(/"initialSubtitles"\s*:\s*\[([\s\S]*?)\]\s*[,}]/);
    if (initMatch) {
        var arrStr = initMatch[1];
        var itemRe = /\{[^{}]*"language"\s*:\s*"([^"]+)"[^{}]*"subtitle_file"\s*:\s*"([^"]+)"[^{}]*\}/g;
        var m;
        while ((m = itemRe.exec(arrStr)) !== null) {
            if (m[1] && m[2]) {
                subs.push({ lang: m[1], url: m[2] });
            }
        }
    }

    // ═══ 2. Thumb.vtt (preview khi tua) ═══
    var vttMatch = src.match(/"vtt"\s*:\s*"(https?:[^"]+\.vtt[^"]*)"/);
    if (vttMatch && vttMatch[1]) {
        subs.push({ lang: "Thumbnails Preview", url: vttMatch[1] });
    }

    // ═══ 3. Sub gốc (extras) ═══
    var subMatch = src.match(/"sub"\s*:\s*"(https?:[^"]+)"/);
    if (subMatch && subMatch[1]) {
        subs.push({ lang: "Sub gốc (extras)", url: subMatch[1] });
    }

    log("Bóc được " + subs.length + " sub:");
    subs.forEach(function (s) {
        log("  - " + s.lang + " → " + s.url);
    });

    return subs;
}

// Giải mã chuỗi enc_XXX (hex XOR key lặp) — copy nguyên logic web (hàm d3)
function onflixDecodeEnc(enc) {
  if (!enc) return "";
  if (enc.indexOf("enc_") !== 0) return enc;
  var hex = enc.substring(4);
  var out = "";
  try {
    for (var i = 0; i < hex.length; i += 2) {
      var b = parseInt(hex.substr(i, 2), 16) ^ ONFLIX_XOR_KEY.charCodeAt((i / 2) % ONFLIX_XOR_KEY.length);
      out += String.fromCharCode(b);
    }
    return decodeURIComponent(out);
  } catch (e) {
    log("onflixDecodeEnc err: " + e);
    return "";
  }
}

// Bóc chuỗi enc_ trong HTML trang player Next.js (RSC payload escape \\")
function onflixExtractEnc(html) {
  if (!html) return "";
  var m = html.match(/initialM3u8[\\":\s]*(enc_[0-9a-fA-F]+)/);
  if (m && m[1]) return m[1];
  // Fallback: tìm bất kỳ enc_ dài (hex) nào trong payload
  m = html.match(/(enc_[0-9a-fA-F]{40,})/);
  return (m && m[1]) ? m[1] : "";
}


function parseDetailResponse(html, apiUrl, datasend) {
  try{
    console.log("apiUrl\n" + apiUrl);
    var streamfile = getparam(apiUrl,"stream")
   // var stream = getparam(apiUrl,"link")
    //console.log("Stream\n" + stream)
    //var subs = extractOnflixSubtitles(html);
    // https://playembed.vip/player/450b35b04eef068ce25f8b580aaab013/extra
    // https://gota.edgecontent.site/450b35b04eef068ce25f8b580aaab013/extras

    var lnksub = streamfile.replace("/sub","/extras").replace("https://playembed.vip/player/","https://gota.edgecontent.site/");
    
    console.log("linksub\n" + lnksub)
    var res = httpRequest(lnksub, {
      method: "GET",
      headers: {
        "accept": "*/*",
        "priority": "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0"
      }
    }
    );
    
    
    console.log(res.body)
    var subs = []
    try{
      var $data = JSON.parse(res.body);
      
      $data.subtitles.forEach(function(item){
        subs.push({
          lang: item.name,
          url: item.url,
          mimeType: "text/vtt"
        })
      })
    } catch(e){
      console.log("Lỗi parse Sub\n" + e)
    }


    
    console.log("stream\n" + streamfile);
    var res = httpRequest(streamfile, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "priority": "u=1, i",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "user-agent": "Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0"
        }
      }
    );
    console.log("streambody\n" + res.body);



    var html = res.body;
    //var subs = extractOnflixSubtitles(html);
    console.log("RwHTML\n" + html)
    try {
      // ── 1. Bóc enc_ rồi giải mã ra URL master ──
      var enc = onflixExtractEnc(html);
      if (!enc) {
        log("parseDetailResponse: không tìm thấy initialM3u8 trong HTML");
        return JSON.stringify({
          url: "", isEmbed: false,
          headers: { "User-Agent": UA, "Referer": EMBED_REF },
          subtitles: subs
        });
      }
  
      var masterUrl = onflixDecodeEnc(enc);
      log("masterUrl: " + masterUrl);
      if (!masterUrl || masterUrl.indexOf("http") !== 0) {
        log("parseDetailResponse: giải mã enc_ thất bại");
        return JSON.stringify({
          url: "", isEmbed: false,
          headers: { "User-Agent": UA, "Referer": EMBED_REF },
          subtitles: subs
        });
      }
  
      // ── 2. Chọn qid (0=1080p, 1=720p, 2=480p) — mặc định cao nhất ──
      var wantQid = -1;
      try {
        var ds = datasend || "";
        var qm = ds.match(/qid=(\d+)/);
        if (qm) wantQid = parseInt(qm[1]);
      } catch (e) {}
  
      // ── 3. Fetch master JSON ──
      var mRes = httpRequest(masterUrl, {
        method: "GET",
        headers: { "User-Agent": UA, "Referer": EMBED_REF }
      });
      if (!mRes || !mRes.isSuccessful || !mRes.body) {
        log("fetch master fail: " + (mRes ? mRes.status : "null"));
        return JSON.stringify({
          url: masterUrl, isEmbed: false,
          mimeType: "application/x-mpegURL",
          headers: { "User-Agent": UA, "Referer": EMBED_REF },
          subtitles: subs
        });
      }
  
      var master = JSON.parse(mRes.body);
      var mediaUrl = masterUrl;
      var playVid = "";
  
      if (master && master.type === "master" && Array.isArray(master.qualities) && master.qualities.length > 0) {
        // Sort giảm dần theo số trong tên quality (1080p > 720p > 480p) — như web
        var quals = master.qualities.slice().sort(function (a, b) {
          var ra = parseInt(String(a.quality || "").replace(/\D/g, ""), 10) || a.bandwidth || 0;
          var rb = parseInt(String(b.quality || "").replace(/\D/g, ""), 10) || b.bandwidth || 0;
          return rb - ra;
        });
  
        var pick = quals[0];
        if (wantQid >= 0) {
          for (var qi = 0; qi < quals.length; qi++) {
            if (quals[qi].qid === wantQid) { pick = quals[qi]; break; }
          }
        }
        log("Chọn quality: " + pick.quality + " (qid=" + pick.qid + ")");
  
        mediaUrl = masterUrl + "&q=" + pick.qid;
        var medRes = httpRequest(mediaUrl, {
          method: "GET",
          headers: { "User-Agent": UA, "Referer": EMBED_REF }
        });
        if (medRes && medRes.isSuccessful && medRes.body) {
          var media = JSON.parse(medRes.body);
          if (media && media.play_vid) {
            playVid = media.play_vid;
            log("media OK — play_vid len=" + playVid.length);
          }
          // Sub từ media JSON (nếu có)
          if (media && media.sub && !subs.length) {
            subs.push({ lang: "Sub gốc (extras)", url: media.sub });
          }
        } else {
          log("fetch media fail: " + (medRes ? medRes.status : "null"));
        }
      } else if (master && master.play_vid) {
        // Đã là media JSON trực tiếp
        playVid = master.play_vid;
        log("master đã là media — play_vid len=" + playVid.length);
      }

      console.log("playm3u8\n" + playVid.slice(0,1000))
      // ── 4. Trả về m3u8Content cho ExoPlayer ──
      if (playVid) {
        return JSON.stringify({
          m3u8Content: playVid,
          baseUrl:     "http://content.jwplatform.com/manifests/vM7nH0Kl.m3u8",
          url:         "http://content.jwplatform.com/manifests/vM7nH0Kl.m3u8",
          mimeType:    "application/x-mpegURL",
          isEmbed:     false,
          headers: {
            "User-Agent":   UA,
            "Referer":      EMBED_REF,
            "Origin":       "https://playembed.vip"
          },
          subtitles: subs
        });
      }
  
      // Fallback: trả URL media (App tự fetch)
      return JSON.stringify({
        url:      "http://content.jwplatform.com/manifests/vM7nH0Kl.m3u8",
        mimeType: "application/x-mpegURL",
        isEmbed:  false,
        headers: {
          "User-Agent": UA,
          "Referer":    EMBED_REF
        },
        subtitles: subs
      });
    } catch (e) {
      log("parseDetailResponse error: " + e);
      return JSON.stringify({
        url: "", isEmbed: false,
        headers: { "User-Agent": UA, "Referer": EMBED_REF },
        subtitles: subs
      });
    }
  } catch(e){
    console.log("Lỗi detail:\n" + e)
  }
}



// =============================================================================
// CATEGORIES / COUNTRIES / YEARS
// =============================================================================
function parseCategoriesResponse(apiResponseJson) {
  return getPrimaryCategories();
}

function parseCountriesResponse(html) {
  var cfg = JSON.parse(getFilterConfig());
  return JSON.stringify(cfg.country || []);
}

function parseYearsResponse(html) {
  var cfg = JSON.parse(getFilterConfig());
  return JSON.stringify(cfg.year || []);
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries()  { return ""; }
function getUrlYears()      { return ""; }

// =============================================================================
// LOG helper
// =============================================================================
function log(msg) {
  if (typeof console !== "undefined" && console.log) {
    console.log("[Xink] " + msg);
  }
}

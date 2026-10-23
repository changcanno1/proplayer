/* =============================================================================
 * XINK PLUGIN cho VAAPP
 * Nguồn: https://api.xink.pro
 * Loại:  MOVIE — Player: embed (WebView)
 * ============================================================================= */

var BASEURL = "https://api.xink.pro";
var SITEURL = "https://xink.pro";
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
    id:          "xink",
    name:        "Xink [MOVIE]",
    description: "Phim HD tổng hợp",
    version:     "1.0.14",
    author:      "Community",
    baseUrl:     BASEURL,
    iconUrl:     "https://vaxplugin.alokillgtv.workers.dev/img/icon/xink.png",
    isEnabled:   true,
    isAdult:     false,
    type:        "MOVIE",
    layoutType:  "VERTICAL",
    playerType:  "embedtoexoplay",
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
        var epId  = ep.episode_id || xinkExtractId(link);
        var watch = epId ? (SITEURL + "/xem-phim/" + movie.slug + "?ep=" + epId) : link;
        // ⭐ Slug unique: kèm server index để tránh trùng "1", "2" giữa các server
        var epSlug = "s" + (sIdx + 1) + "-e" + (eIdx + 1) + "-" + (ep.slug || ep.name || "");

        episodes.push({
          id:   watch,                                                           // trang xem phim (chứa iframe)
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
function rawJS(playerUrl) {
  var _purl = "";
  try { _purl = JSON.stringify(String(playerUrl || "")); } catch (e) { _purl = '""'; }
  return `
  (function() {
  'use strict';

  // ═══ Guard: chỉ cài 1 lần ═══
  if (window.__onflix_sniffer_installed) {
    console.log('[ONFLIX] already installed');
    return;
  }
  window.__onflix_sniffer_installed = true;
  var PLAYER_URL = ` + _purl + `;

  // ═══ Nhận m3u8 từ iframe player (cross-origin) → đẩy cho App ═══
  window.addEventListener('message', function (ev) {
    var d = ev && ev.data;
    if (!d || d.__vaxCmd !== 'm3u8' || !d.content) return;
    xSend(d.content, d.referer, d.headers);
  });

  // ═══ Logger: ưu tiên SnifferBridge nếu có, fallback console ═══
  function log(msg) {
    try {
      console.log('[ONFLIX] ' + msg);
      if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
        window.SnifferBridge.log('[ONFLIX] ' + msg);
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

    // ═══ Lưu baseUrl cho playlist giải mã (blob/segment tương đối) ═══
    if (data.play_vid) window.__onflix_media_url = sourceUrl;

    // ═══ CHỈ gửi khi play_vid thực sự là m3u8 thô ═══
    // play_vid của onflix là blob base64url đã mã hoá → gửi thẳng sẽ hỏng
    // video (và có thể khiến App đóng WebView trước khi kịp bắt blob).
    if (data.play_vid) {
      if (data.play_vid.indexOf('#EXTM3U') === 0) {
        xSend(data.play_vid, sourceUrl);
      } else {
        log('🔒 play_vid mã hoá → thử giải mã...');
        if (!xTryPlayVid(data.play_vid)) log('🔒 chờ playlist giải mã từ player (blob/m3u8) | head=' + JSON.stringify(String(data.play_vid).slice(0, 70)));
      }
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
    this.addEventListener('readystatechange', function() {
      try {
        if (self.readyState !== 4) return;

        // Bắt playlist m3u8 (kể cả blob: URL do player tạo sau khi giải mã)
        var txt = '';
        try {
          var rt = self.responseType;
          if (self.status === 200 && (!rt || rt === 'text')) {
            txt = self.responseText || '';
            if (txt.indexOf('#EXTM3U') > -1) xTryM3u8(txt, self.__onflix_url);
          }
        } catch(e0) {}

        if (self.__onflix_is_target) {
          if (self.status === 200 && txt) {
            processResponse(txt, self.__onflix_url);
          } else {
            log('⚠️ XHR status=' + self.status + ' for ' + (self.__onflix_url || '').substring(0, 100));
          }
        }
      } catch(e) {
        log('xhr read err: ' + (e.message || e));
      }
    });
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
      var isM3u8 = (url.indexOf('blob:') === 0) || /\\.m3u8(\\?|$)/i.test(url);
      if (isTarget) {
        log('🔍 fetch → ' + url.substring(0, 120) + '...');
      }

      var p = OrigFetch.apply(this, arguments);

      if (isTarget || isM3u8) {
        p = p.then(function(response) {
          try {
            var cloned = response.clone();
            cloned.text().then(function(text) {
              if (text && text.indexOf('#EXTM3U') > -1) xTryM3u8(text, url);
              if (isTarget) processResponse(text, url);
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
  // 2a. HOOK atob / TextDecoder / crypto.subtle.decrypt
  //     Nếu player tự giải mã play_vid → bắt plaintext m3u8
  // ═══════════════════════════════════════════════════════════
  if (window.atob) {
    var _atob = window.atob;
    window.atob = function (s) {
      var r = _atob.apply(window, arguments);
      try { if (r && r.indexOf('#EXTM3U') > -1) xTryM3u8(r, window.__onflix_media_url, false); } catch (e) {}
      return r;
    };
  }
  if (window.TextDecoder && TextDecoder.prototype && TextDecoder.prototype.decode) {
    var _td = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function () {
      var r = _td.apply(this, arguments);
      try {
        if (r && r.indexOf('#EXTM3U') > -1 && r.indexOf('#EXTINF') > -1) {
          log('🔓 TextDecoder playtext len=' + r.length);
          xTryM3u8(r, window.__onflix_media_url, false);
        }
      } catch (e) {}
      return r;
    };
  }
  try {
    if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.decrypt === 'function') {
      var _cd = window.crypto.subtle.decrypt.bind(window.crypto.subtle);
      window.crypto.subtle.decrypt = function () {
        var pr = _cd.apply(null, arguments);
        try {
          pr.then(function (buf) {
            try {
              var dec = new TextDecoder('utf-8');
              var t = dec.decode(buf);
              if (t && t.indexOf('#EXTM3U') > -1) {
                log('🔓 crypto.subtle plaintext playlist len=' + t.length);
                xTryM3u8(t, window.__onflix_media_url, false);
              }
            } catch (e2) {}
          }).catch(function () {});
        } catch (e3) {}
        return pr;
      };
    }
  } catch (e4) {}

  // ═══════════════════════════════════════════════════════════
  // 2b. HOOK URL.createObjectURL — bắt playlist ĐÃ giải mã
  //     Player (ArtPlayer/hls.js) tạo blob từ play_vid mã hoá;
  //     đọc blob này mới ra m3u8 thật.
  // ═══════════════════════════════════════════════════════════
  if (window.URL && typeof window.URL.createObjectURL === 'function') {
    var OrigCOU = window.URL.createObjectURL;
    window.URL.createObjectURL = function(obj) {
      var blobUrl = OrigCOU.apply(window.URL, arguments);
      try {
        if (obj && typeof Blob !== 'undefined' && obj instanceof Blob) {
          var mime = String(obj.type || '');
          if (obj.size < 4 * 1024 * 1024 &&
              (/mpegurl|m3u8/i.test(mime) || mime === '' || /text\\/plain/i.test(mime))) {
            var fr = new FileReader();
            fr.onload = function() {
              try {
                var txt = String(fr.result || '');
                if (txt.indexOf('#EXTM3U') > -1) {
                  log('🧩 blob playlist len=' + txt.length);
                  xTryM3u8(txt, window.__onflix_media_url || (window.__onflix_master && window.__onflix_master.base) || location.href, true);
                }
              } catch(e) {}
            };
            fr.readAsText(obj);
          }
        }
      } catch(e) {}
      return blobUrl;
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

  // ═══════════════════════════════════════════════════════════
  // 4. ACTIVE DECODE — Cloudflare chặn OkHttp nhưng WebView qua được:
  //    đọc DOM → enc_ → master → media → SnifferBridge/Web parent
  // ═══════════════════════════════════════════════════════════
  var XKEY = 'onflix_secure_stream_v2_2026';
  var __xOrigin = (location.origin && location.origin !== 'null') ? location.origin : 'https://playembed.vip';
  var HDR = {
    'Referer': __xOrigin + '/',
    'Origin': __xOrigin,
    'User-Agent': navigator.userAgent
  };
  var __xDone = false;

  function xDecode(enc) {
    if (!enc || enc.indexOf('enc_') !== 0) return '';
    var hex = enc.substring(4), out = '';
    try {
      for (var i = 0; i < hex.length; i += 2) {
        out += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ XKEY.charCodeAt((i / 2) % XKEY.length));
      }
      try { return decodeURIComponent(out); } catch (e) { return out; }
    } catch (e) { return ''; }
  }

  // ═══ Thử giải mã play_vid (base64url + XOR key) ═══
  function xB64UrlToBytes(str) {
    var s = String(str).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function xTryPlayVid(pid) {
    if (!pid || typeof pid !== 'string' || pid.length < 32) return false;
    try {
      var bytes = xB64UrlToBytes(pid);
      log('🧪 play_vid decoded bytes=' + bytes.length);

      // (a) base64url thuần → có thể là m3u8 luôn
      var raw = '';
      try { raw = new TextDecoder('utf-8').decode(bytes); } catch (e0) { raw = ''; }
      if (raw && raw.indexOf('#EXTM3U') > -1) {
        log('🎉 play_vid base64 thuần là playlist');
        return xTryM3u8(raw, window.__onflix_media_url, false);
      }

      // (b) XOR với key onflix
      var xb = new Uint8Array(bytes.length);
      for (var j = 0; j < bytes.length; j++) {
        xb[j] = bytes[j] ^ XKEY.charCodeAt(j % XKEY.length);
      }
      var txt = '';
      try { txt = new TextDecoder('utf-8').decode(xb); } catch (e1) { txt = ''; }
      if (txt && txt.indexOf('#EXTM3U') > -1) {
        log('🎉 play_vid XOR key OK len=' + txt.length);
        return xTryM3u8(txt, window.__onflix_media_url, false);
      }
      log('🧪 xor key fail, head=' + JSON.stringify(String(txt).slice(0, 60)));
    } catch (e) {
      log('🧪 play_vid decode err: ' + (e.message || e));
    }
    return false;
  }

  // ═══ Dự phòng: dò code player để tìm hàm giải mã play_vid ═══
  function xProbePlayerJS() {
    if (window.__xProbe) return;
    window.__xProbe = true;
    try {
      var urls = [];
      try {
        var es = performance.getEntriesByType('resource') || [];
        for (var i = 0; i < es.length; i++) {
          var n = es[i].name || '';
          if (/\\.js(\\?|$)/i.test(n) && urls.indexOf(n) < 0) urls.push(n);
        }
      } catch (e0) {}
      try {
        var sc = document.scripts || [];
        for (var k = 0; k < sc.length; k++) {
          var src = sc[k].src || '';
          if (src && urls.indexOf(src) < 0) urls.push(src);
        }
      } catch (e1) {}
      var tried = 0;
      for (var u = 0; u < urls.length && tried < 3; u++) {
        (function (url) {
          tried++;
          fetch(url, { credentials: 'include' })
            .then(function (r) { return r.text(); })
            .then(function (txt) {
              if (!txt) return;
              var idx = txt.indexOf('play_vid');
              if (idx < 0) return;
              var snip = txt.slice(Math.max(0, idx - 220), idx + 420).replace(/\\s+/g, ' ');
              log('📜 JS ' + url.slice(-46) + ' :: ' + snip);
            })
            .catch(function () {});
        })(urls[u]);
      }
      log('🔎 probe scripts=' + urls.length);
    } catch (e) {}
  }

  function xFindEnc() {
    var html = '';
    try { html = document.documentElement.innerHTML; } catch (e) {}
    var m = html.match(/initialM3u8[\\s\\S]{0,40}?(enc_[0-9a-fA-F]{20,})/);
    if (m) return m[1];
    m = html.match(/(enc_[0-9a-fA-F]{40,})/);
    return m ? m[1] : '';
  }

  function xTryM3u8(text, base, fromBlob) {
    if (!text) return false;
    var t = String(text).replace(/^\\uFEFF/, '').replace(/^\\s+/, '');
    if (t.indexOf('#EXTM3U') !== 0) return false;

    var isMedia  = /#EXTINF:|#EXT-X-TARGETDURATION|#EXT-X-MAP|#EXT-X-ENDLIST/i.test(t);
    var isMaster = /#EXT-X-STREAM-INF|#EXT-X-MEDIA:/i.test(t);

    window.__xPlCount = (window.__xPlCount || 0) + 1;
    if (window.__xPlCount <= 4) {
      log('🎞️ playlist len=' + t.length + ' media=' + isMedia + ' master=' + isMaster +
          ' base=' + String(base || '').substring(0, 90) + (fromBlob ? ' [blob]' : ''));
      log('📄 ' + t.substring(0, 420).replace(/\\s+/g, ' '));
    }

    if (isMaster && !isMedia) {
      if (!window.__onflix_master) {
        window.__onflix_master = { content: t, base: base || '' };
        log('⏳ master playlist → chờ media playlist (#EXTINF)');
      }
      return false;
    }

    if (fromBlob) {
      setTimeout(function () { xSend(t, base); }, 400);
      return true;
    }
    return xSend(t, base);
  }

  // ═══ Gán URL (segment/key/sub-playlist) qua vax.local/p ═══
  // WebView hls.js và ExoPlayer đều gọi được vax.local; Native chèn
  // Referer/Origin/UA từ payload nên segment soracdn không còn 403.
  function xVaxB64(s) {
    try {
      return btoa(unescape(encodeURIComponent(s))).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
    } catch (e) { return ''; }
  }
  function xWrapUrl(u) {
    if (!u || typeof u !== 'string') return u;
    if (u.indexOf('vax.local') > -1 || u.indexOf('data:') === 0 || u.indexOf('blob:') === 0) return u;
    var d = xVaxB64(JSON.stringify({
      url: u,
      headers: { 'Referer': 'https://playembed.vip/', 'Origin': 'https://playembed.vip', 'User-Agent': navigator.userAgent }
    }));
    return d ? ('https://vax.local/p?d=' + d) : u;
  }
  function xAbsUrl(u, base) {
    if (/^https?:\\/\\//i.test(u)) return u;
    try { return new URL(u, base).href; } catch (e) { return u; }
  }
  function xRewrite(text, base) {
    var ls = String(text).split('\\n'), out = [], n = 0;
    for (var i = 0; i < ls.length; i++) {
      var raw = ls[i], l = raw.trim();
      if (!l) { out.push(raw); continue; }
      if (l.charAt(0) === '#') {
        var m = l.match(/URI="([^"]+)"/);
        if (m && m[1] && m[1].indexOf('vax.local') < 0 && m[1].indexOf('data:') !== 0) {
          var w = xWrapUrl(xAbsUrl(m[1], base));
          if (w !== m[1]) { out.push(l.replace('URI="' + m[1] + '"', 'URI="' + w + '"')); n++; continue; }
        }
        out.push(raw);
        continue;
      }
      if (l.indexOf('vax.local') > -1) { out.push(raw); continue; }
      var abs = xAbsUrl(l, base);
      if (/^https?:\\/\\//i.test(abs)) {
        var w2 = xWrapUrl(abs);
        if (w2 !== abs) { out.push(w2); n++; continue; }
      }
      out.push(raw);
    }
    if (n) log('🔗 vax.local wrap ' + n + ' URL');
    return out.join('\\n');
  }

  function xSend(content, base, hdrs) {
    if (!content || __xDone) return false;
    var body = String(content).replace(/^\\uFEFF/, '').replace(/^\\s+/, '');
    if (body.indexOf('#EXTM3U') !== 0) return false;
    try { if (window.top && window.top !== window && window.top.__xDoneGlobal) return false; } catch (e) {}
    // blob: URL không dùng làm baseUrl được → ưu tiên link media thật
    var b = String(base || '');
    if (!b || b.indexOf('blob:') === 0) {
      b = window.__onflix_media_url || (window.__onflix_master && window.__onflix_master.base) || location.href;
    }
    var _h2 = 5381;
    for (var hi = 0; hi < body.length; hi++) _h2 = ((_h2 * 33) ^ body.charCodeAt(hi)) >>> 0;
    try {
      var _k = '__onflix_sent_' + _h2;
      if (window.localStorage && localStorage.getItem(_k)) { log('↩️ playlist đã gửi (bỏ trùng)'); return false; }
      if (window.localStorage) localStorage.setItem(_k, String(Date.now()));
    } catch (e) {}
    __xDone = true;
    try { if (window.top) window.top.__xDoneGlobal = true; } catch (e) {}
    var _h = (hdrs && typeof hdrs === 'object') ? hdrs : HDR;
    window.__onflix_sent = true;
    log('✅ M3U8 len=' + body.length + ' base=' + b.substring(0, 80));

    // ═══ WebView + Native: gán segment/key qua vax.local/p (kèm Referer) ═══
    var _wrapped = body;
    try { _wrapped = xRewrite(body, b); } catch (e) { log('rewrite err: ' + (e.message || e)); }

    try {
      if (window.SnifferBridge && typeof window.SnifferBridge.playM3u8Content === 'function') {
        // Bridge của player (WebView) hoặc Native — đều nhận playlist đã wrap.
        // Không postMessage thêm để tránh player nhận 2 lần (closeEmbed giữa chừng).
        window.SnifferBridge.playM3u8Content(_wrapped, b, JSON.stringify(_h));
        log('▶️ playM3u8Content → vax.local');
      } else {
        var msg = { __vaxCmd: 'm3u8', content: _wrapped, referer: b,
                    headers: _h, subtitles: window.__onflix_subs || [] };
        if (window.parent !== window) window.parent.postMessage(msg, '*');
        if (window.top !== window && window.top !== window.parent) window.top.postMessage(msg, '*');
      }
    } catch (e) { log('bridge err: ' + (e.message || e)); }
    return true;
  }

  // ═══ Phát qua worker: m3u8set (lưu playlist) + streamfile (proxy segment kèm Referer) ═══
  var M3U8SET  = 'https://m3u8set.alokillgtv02.workers.dev';
  var STREAMSF = 'https://streamfile.alokillgtv04.workers.dev/proxy';

  function xPlayViaWorker(text) {
    if (window.__xWorkerSent) return;
    window.__xWorkerSent = true;
    try {
      var h = 5381, L = text.length;
      for (var i = 0; i < L; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
      var slug = 'xk' + h.toString(36) + L.toString(36);
      fetch(M3U8SET + '/?slug=' + slug, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: text
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j || !j.ok) throw new Error('store failed');
        var inner = M3U8SET + '/?slug=' + encodeURIComponent(slug) + '&m3u8=true&file.m3u8';
        var proxyPl = STREAMSF +
          '?url=' + encodeURIComponent(inner) +
          '&referer=' + encodeURIComponent('https://playembed.vip/') +
          '&origin=' + encodeURIComponent('https://playembed.vip') +
          '&ua=' + encodeURIComponent(navigator.userAgent) +
          '&file.m3u8';
        log('🚀 proxy playlist slug=' + slug);
        fetch(proxyPl, { credentials: 'omit' }).then(function (r) {
          if (!r.ok) throw new Error('proxy HTTP ' + r.status);
          return r.text();
        }).then(function (txt) {
          if (!txt || txt.indexOf('#EXTM3U') !== 0) throw new Error('proxy body không phải m3u8');
          var _n = txt.length;
          txt = txt.split('/fetch?').join('/proxy?');
          var _ls = txt.split('\\n'), _out = [];
          for (var _i = 0; _i < _ls.length; _i++) {
            var _l = _ls[_i];
            if (_l.indexOf('http') === 0 && _l.indexOf('/proxy?') > 0 && _l.indexOf('mime=') < 0) {
              _l = _l + '&mime=video%2Fmp2t';
            }
            _out.push(_l);
          }
          txt = _out.join('\\n');
          log('📥 playlist proxy len=' + txt.length + ' (gốc ' + _n + ', seg→mp2t)');
          var _fakeBase = M3U8SET + '/' + slug + '.m3u8';
          log('🎬 playM3u8Content base=' + _fakeBase);
          if (window.SnifferBridge && typeof window.SnifferBridge.playM3u8Content === 'function') {
            window.SnifferBridge.playM3u8Content(txt, _fakeBase, JSON.stringify(HDR));
            log('▶️ playM3u8Content → content proxy + base .m3u8');
          } else if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
            window.SnifferBridge.play(proxyPl, JSON.stringify(HDR));
            log('▶️ play → proxy playlist');
          }
          if (typeof window.SnifferBridge.toast === 'function') {
            window.SnifferBridge.toast('✅ Đã bắt link phim', 2000);
          }
        }).catch(function (e2) {
          log('❌ proxy playlist fail: ' + (e2.message || e2) + ' → fallback vax.local');
          try {
            window.SnifferBridge.play('https://vax.local/fetch?url=' + encodeURIComponent(inner) +
              '&referer=' + encodeURIComponent('https://playembed.vip/') +
              '&origin=' + encodeURIComponent('https://playembed.vip') +
              '&ua=' + encodeURIComponent(navigator.userAgent), JSON.stringify(HDR));
            log('▶️ fallback vax.local');
          } catch (e3) { log('vax fallback err: ' + (e3.message || e3)); }
        });
      }).catch(function (e) {
        log('❌ store fail: ' + (e.message || e) + ' → fallback playM3u8Content raw');
        try { window.SnifferBridge.playM3u8Content(text, window.__onflix_media_url || location.href, JSON.stringify(HDR)); } catch (e2) {}
      });
    } catch (e) {
      log('worker err: ' + (e.message || e));
    }
  }

  function xGetJson(u) {
    return window.fetch(u, { headers: HDR, credentials: 'omit' }).then(function (r) { return r.json(); });
  }

  var __xActiveDone = false;
  function xActive() {
    if (__xDone || __xActiveDone) return;
    var enc = xFindEnc();
    if (!enc) return;
    var masterUrl = xDecode(enc);
    if (!masterUrl || masterUrl.indexOf('http') !== 0) {
      log('active: decode fail');
      return;
    }
    log('🔓 ACTIVE master=' + masterUrl.substring(0, 90));
    xGetJson(masterUrl).then(function (master) {
      if (master && master.type === 'master' && master.qualities && master.qualities.length) {
        var q = master.qualities.slice().sort(function (a, b) {
          var ra = parseInt(String(a.quality || '').replace(/[^0-9]/g, ''), 10) || a.bandwidth || 0;
          var rb = parseInt(String(b.quality || '').replace(/[^0-9]/g, ''), 10) || b.bandwidth || 0;
          return rb - ra;
        })[0];
        var mediaUrl = masterUrl + '&q=' + q.qid;
        log('active quality=' + q.quality + ' qid=' + q.qid);
        return xGetJson(mediaUrl).then(function (media) {
          __xActiveDone = true;
          if (!media || !media.play_vid) return;
          window.__onflix_media_url = mediaUrl;
          if (media.sub) window.__onflix_subs = [{ lang: 'vi', url: media.sub, mimeType: 'text/vtt' }];
          if (media.play_vid.indexOf('#EXTM3U') === 0) xSend(media.play_vid, mediaUrl);
          else {
            log('🔒 active play_vid mã hoá len=' + media.play_vid.length + ' head=' + JSON.stringify(String(media.play_vid).slice(0, 60)));
            xTryPlayVid(media.play_vid);
          }
        });
      }
      __xActiveDone = true;
      if (master && master.play_vid && master.play_vid.indexOf('#EXTM3U') === 0) xSend(master.play_vid, masterUrl);
    }).catch(function (e) { log('active err: ' + (e.message || e)); });
  }

  // ═══ Nếu trang xem phim không render iframe player → tự chèn ═══
  var __xInjected = false;
  function xEnsureIframe() {
    if (!PLAYER_URL || __xInjected) return;
    if (location.hostname.indexOf('playembed.vip') > -1) return;
    if (!/xink\\.pro$/i.test(location.hostname)) return;
    var fs = document.querySelectorAll('iframe');
    for (var i = 0; i < fs.length; i++) {
      if ((fs[i].src || '').indexOf('playembed.vip') > -1) return;
    }
    __xInjected = true;
    try {
      var f = document.createElement('iframe');
      f.src = PLAYER_URL;
      f.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
      f.setAttribute('allowfullscreen', '');
      f.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483646;background:#000';
      (document.body || document.documentElement).appendChild(f);
      log('🖼️ injected player iframe');
    } catch (e) { log('iframe err: ' + (e.message || e)); }
  }

  setTimeout(xActive, 300);
  document.addEventListener('DOMContentLoaded', xActive);
  setTimeout(xEnsureIframe, 3500);
  setInterval(function () { xActive(); }, 800);

  setTimeout(function () {
    if (!window.__onflix_sent) {
      log('⏱️ 9s chưa bắt được media playlist → dò code player');
      xProbePlayerJS();
    }
  }, 9000);

  log('✅ ONFLIX sniffer v1.0.12 installed (XHR + fetch + WS + blob hooks)');
})();
`;
}

// =============================================================================
// SUBTITLE — nguồn chính: extras API (gota.edgecontent.site), phụ: scrape HTML
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
            if (m[1] && m[2]) subs.push({ lang: m[1], url: m[2], mimeType: "text/vtt" });
        }
    }

    // ═══ 2. Thumb.vtt (preview khi tua) ═══
    var vttMatch = src.match(/"vtt"\s*:\s*"(https?:[^"]+\.vtt[^"]*)"/);
    if (vttMatch && vttMatch[1]) subs.push({ lang: "Thumbnails Preview", url: vttMatch[1], mimeType: "text/vtt" });

    // ═══ 3. Sub gốc (extras) ═══
    var subMatch = src.match(/"sub"\s*:\s*"(https?:[^"]+)"/);
    if (subMatch && subMatch[1]) subs.push({ lang: "Sub gốc (extras)", url: subMatch[1], mimeType: "text/vtt" });

    log("Scrape HTML: " + subs.length + " sub");
    return subs;
}

// Giải mã chuỗi enc_XXX (hex XOR key lặp) — hàm d3 gốc của web
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
    try { return decodeURIComponent(out); } catch (e) { return out; }
  } catch (e) {
    log("onflixDecodeEnc err: " + e);
    return "";
  }
}

// Bóc enc_ trong HTML Next.js (kể cả dạng escape RSC \"...\")
// Bóc enc_ trong HTML Next.js (kể cả dạng escape RSC \"...\", &quot;, \u0022)
function onflixExtractEnc(html) {
  if (!html) return "";
  var src = String(html);
  var m = src.match(/initialM3u8[\s\S]{0,40}?(enc_[0-9a-fA-F]{20,})/);
  if (m && m[1]) return m[1];
  m = src.match(/(enc_[0-9a-fA-F]{40,})/);
  return (m && m[1]) ? m[1] : "";
}

// ═══════════════════════════════════════════════════════════════
// HTML PLAYER — native httpRequest + vax.local để vượt Cloudflare
// ═══════════════════════════════════════════════════════════════
function xinkGetCookie(u) {
  try { if (typeof getCookie === "function") return String(getCookie(u) || ""); } catch (e) {}
  return "";
}

function xinkPageHeaders(cookie) {
  var h = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": EMBED_REF,
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1"
  };
  if (cookie) h["Cookie"] = cookie;
  return h;
}

// Trang thật? (loại trang challenge của Cloudflare)
function xinkIsRealPage(b) {
  if (!b || b.length < 512) return false;
  var head = b.slice(0, 4096);
  if (/just a moment|cf-browser-verification|checking your browser|enable javascript and cookies|attention required|access denied|ddos-guard/i.test(head)) return false;
  return true;
}

function xinkFetchHtml(streamUrl) {
  var best = "";

  function take(r, tag) {
    var b = "";
    if (!r) return "";
    if (typeof r === "string") b = r;
    else if (r.body) b = String(r.body);
    if (!b) { log(tag + ": empty"); return ""; }
    log(tag + ": status=" + (r.status || "?") + " len=" + b.length);
    if (b.length > best.length) best = b;
    if (onflixExtractEnc(b)) { log(tag + ": enc_ OK"); return b; }
    if (xinkIsRealPage(b)) { log(tag + ": page OK"); return b; }
    return "";
  }

  // 1) httpRequest trực tiếp (native OkHttp — IP thiết bị) + cookie WebView
  try {
    var got = take(httpRequest(streamUrl, { method: "GET", headers: xinkPageHeaders(xinkGetCookie(streamUrl)) }), "page#1 httpRequest");
    if (got) return got;
  } catch (e) { log("page#1 err: " + e); }

  // 2) Làm ấm cookie (cf_clearance) rồi thử lại
  try {
    if (typeof getSetCookie === "function") getSetCookie(EMBED_REF, { "User-Agent": UA });
    var got2 = take(httpRequest(streamUrl, { method: "GET", headers: xinkPageHeaders(xinkGetCookie(streamUrl)) }), "page#2 httpRequest+cookie");
    if (got2) return got2;
  } catch (e) { log("page#2 err: " + e); }

  // 3) Proxy nội bộ native vax.local/fetch
  try {
    var fUrl = "https://vax.local/fetch?url=" + encodeURIComponent(streamUrl) +
               "&referer=" + encodeURIComponent(EMBED_REF) +
               "&ua=" + encodeURIComponent(UA);
    var ck = xinkGetCookie(streamUrl);
    if (ck) fUrl += "&cookie=" + encodeURIComponent(ck);
    var got3 = take(httpRequest(fUrl, { method: "GET" }), "page#3 vax.local/fetch");
    if (got3) return got3;
  } catch (e) { log("page#3 err: " + e); }

  // 4) vax.local/px → gateway httprequest.net (vượt Cloudflare)
  try {
    var payload = { url: streamUrl, headers: xinkPageHeaders(xinkGetCookie(streamUrl)), fallback: true };
    var b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    var got4 = take(httpRequest("https://vax.local/px?d=" + b64, { method: "GET" }), "page#4 vax.local/px");
    if (got4) return got4;
  } catch (e) { log("page#4 err: " + e); }

  log("page: tất cả cách đều fail (Cloudflare)");
  return best;
}

// ═══════════════════════════════════════════════════════════════
// EXTRAS SUBTITLE — nguồn chính (id playembed → gota.edgecontent.site)
// ═══════════════════════════════════════════════════════════════
function xinkExtractId(s) {
  var m = String(s || "").match(/\/(?:player|embed)\/([A-Za-z0-9]{16,})/i);
  if (m) return m[1];
  m = String(s || "").match(/[?&](?:ep|episode_id|id)=([A-Za-z0-9]{16,})/i);
  return m ? m[1] : "";
}

function xinkPlayerUrl(s) {
  var id = xinkExtractId(s);
  return id ? ("https://playembed.vip/player/" + id + "/sub") : "";
}

function xinkResolveStreamUrl(apiUrl) {
  var s = String(apiUrl || "");
  var p = "";
  try { if (typeof getparam === "function") p = getparam(s, "stream"); } catch (e) {}
  if (p) return p;
  var m = s.match(/[?&]stream=([^&]+)/i);
  if (m) { try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; } }
  return s;
}

function xinkExtrasUrl(streamUrl) {
  var id = xinkExtractId(streamUrl);
  if (!id) return "";
  return "https://gota.edgecontent.site/" + id + "/extras";
}

function xinkFetchExtrasSubs(streamUrl) {
  var subs = [];
  var url = xinkExtrasUrl(streamUrl);
  if (!url) return subs;
  try {
    log("extras: " + url);
    var res = httpRequest(url, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": UA
      }
    });
    if (!res || !res.isSuccessful || !res.body) { log("extras fetch fail"); return subs; }
    var data = JSON.parse(res.body);
    var arr = (data && data.subtitles) || [];
    var seen = {};
    for (var i = 0; i < arr.length; i++) {
      var it = arr[i] || {};
      var slug = String(it.slug || "").toLowerCase();
      var name = String(it.name || "");
      var lang = (slug === "tieng-viet" || /việt|vietnamese/i.test(name)) ? "vi"
               : (slug === "tieng-anh" || /english/i.test(name)) ? "en" : "";
      if (!lang || !it.url || seen[lang]) continue;
      seen[lang] = 1;
      subs.push({ lang: lang, name: name || lang, url: it.url, mimeType: "text/vtt" });
    }
    if (!subs.length) {
      for (var j = 0; j < arr.length; j++) {
        var x = arr[j] || {};
        if (x.url) subs.push({ lang: String(x.slug || "sub"), name: x.name || "", url: x.url, mimeType: "text/vtt" });
      }
    }
    log("extras subs: " + subs.length);
  } catch (e) {
    log("extras err: " + e);
  }
  return subs;
}

// ═══════════════════════════════════════════════════════════════
// Rewrite segment qua vax.local (kèm Referer) cho WebView / HLS.js
// ═══════════════════════════════════════════════════════════════
function xinkWrapSeg(u) {
  try {
    if (typeof window !== "undefined" && window.__VAX_LOCAL_OK !== true) return u;
    var payload = {
      url: u,
      headers: {
        "User-Agent": UA,
        "Accept": "*/*",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8",
        "Referer": EMBED_REF,
        "Origin": "https://playembed.vip"
      },
      fallback: false
    };
    var b = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    b = b.split("+").join("-").split("/").join("_");
    while (b.charAt(b.length - 1) === "=") b = b.slice(0, -1);
    return "https://vax.local/p?d=" + b;
  } catch (e) { return u; }
}

function xinkRewriteM3u8(m3u8, base) {
  var lines = String(m3u8 || "").split("\n"), out = [];
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i].trim();
    if (!l) { out.push(lines[i]); continue; }
    if (l.charAt(0) === "#") {
      var m = l.match(/URI="([^"]+)"/);
      if (m && m[1]) {
        var u = m[1];
        if (u.indexOf("http") !== 0 && base) { try { u = new URL(u, base).href; } catch (e) {} }
        if (u.indexOf("http") === 0) out.push(lines[i].replace(/URI="[^"]+"/, 'URI="' + xinkWrapSeg(u) + '"'));
        else out.push(lines[i]);
      } else out.push(lines[i]);
    } else {
      var u2 = l;
      if (u2.indexOf("http") !== 0 && base) { try { u2 = new URL(u2, base).href; } catch (e) {} }
      out.push(u2.indexOf("http") === 0 ? xinkWrapSeg(u2) : u2);
    }
  }
  return out.join("\n");
}

// =============================================================================
// PARSER: DETAIL RESPONSE (episode → stream)
// =============================================================================
function parseDetailResponse(html, apiUrl, datasend) {
  var subs = [];
  var streamUrl = "";
  try {
    streamUrl = xinkResolveStreamUrl(apiUrl);
    var playerUrl = xinkPlayerUrl(streamUrl);
    var isWatchPage = /xink\.pro\/xem-phim\//i.test(streamUrl);
    log("stream: " + streamUrl);
    if (playerUrl) log("player: " + playerUrl);

    // ── 1. Sub: extras là nguồn chính ──
    subs = xinkFetchExtrasSubs(streamUrl);

    // ── 2. HTML player: html App đã fetch, hoặc tự lấy qua httpRequest/vax.local ──
    var pageHtml = (typeof html === "string") ? html : "";
    if (!onflixExtractEnc(pageHtml) && !isWatchPage) {
      log("page(loader): len=" + pageHtml.length);
      var gotHtml = xinkFetchHtml(playerUrl || streamUrl);
      if (gotHtml && (onflixExtractEnc(gotHtml) || gotHtml.length > pageHtml.length)) pageHtml = gotHtml;
    }

    // Sub scrape HTML chỉ là phụ
    if (!subs.length) subs = extractOnflixSubtitles(pageHtml);

    // ── 3. enc_ → master → media ──
    var enc = onflixExtractEnc(pageHtml);
    var masterUrl = enc ? onflixDecodeEnc(enc) : "";
    var playVid = "", mediaUrl = masterUrl;
    log("enc=" + (enc ? enc.slice(0, 14) + "…" : "NONE") + " | master=" + (masterUrl ? masterUrl.slice(0, 80) : "EMPTY"));

    if (masterUrl && masterUrl.indexOf("http") === 0) {
      log("masterUrl: " + masterUrl.slice(0, 120));
      try {
        var mRes = httpRequest(masterUrl, { method: "GET", headers: { "User-Agent": UA, "Referer": EMBED_REF } });
        var master = (mRes && mRes.isSuccessful && mRes.body) ? JSON.parse(mRes.body) : null;

        if (master && master.type === "master" && Array.isArray(master.qualities) && master.qualities.length) {
          var wantQid = -1;
          var qm = String(datasend || "").match(/qid=(\d+)/);
          if (qm) wantQid = parseInt(qm[1], 10);
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
          log("quality: " + pick.quality + " (qid=" + pick.qid + ")");
          mediaUrl = masterUrl + "&q=" + pick.qid;
          var medRes = httpRequest(mediaUrl, { method: "GET", headers: { "User-Agent": UA, "Referer": EMBED_REF } });
          var media = (medRes && medRes.isSuccessful && medRes.body) ? JSON.parse(medRes.body) : null;
          if (media && media.play_vid) { playVid = media.play_vid; log("play_vid len=" + playVid.length); }
          if (media && media.sub) {
            var has = false;
            for (var si = 0; si < subs.length; si++) { if (subs[si].url === media.sub) { has = true; break; } }
            if (!has) subs.push({ lang: "vi", name: "Sub gốc (extras)", url: media.sub, mimeType: "text/vtt" });
          }
        } else if (master && master.play_vid) {
          playVid = master.play_vid;
          log("master đã là media — play_vid len=" + playVid.length);
        }
      } catch (e) {
        log("master/media err: " + e);
      }
    } else {
      log("decode enc_ thất bại (HTML thiếu enc_ / bị Cloudflare)");
    }

    if (playVid && playVid.indexOf("#EXTM3U") !== 0) {
      log("play_vid mã hoá (" + playVid.length + " ký tự) → chuyển sang embed + Custom-Js");
    }

    // ── 4. Có m3u8 thô → trả về (m3u8Content cho native + blob URL cho WebView) ──
    //    play_vid mã hoá (base64url) KHÔNG dùng được → rơi xuống nhánh embed,
    //    Custom-Js sẽ bắt playlist đã giải mã từ player.
    if (playVid && playVid.indexOf("#EXTM3U") === 0) {
      var out = {
        m3u8Content: playVid,
        baseUrl: mediaUrl,
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: {
          "User-Agent": UA,
          "Referer": EMBED_REF,
          "Origin": "https://playembed.vip"
        },
        subtitles: subs
      };
      try {
        if (typeof window !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined" && URL.createObjectURL) {
          var rewritten = xinkRewriteM3u8(playVid, mediaUrl);
          out.url = URL.createObjectURL(new Blob([rewritten], { type: "application/vnd.apple.mpegurl" }));
        }
      } catch (e) { log("blob err: " + e); }
      if (!out.url) out.url = mediaUrl;
      return JSON.stringify(out);
    }

    // ── 5. Fallback: ưu tiên playembed (whitelist của WebView player) ──
    var embedUrl = playerUrl || streamUrl;
    var embRef   = playerUrl ? "https://playembed.vip/" : (isWatchPage ? "https://xink.pro/" : EMBED_REF);
    log("→ embed: " + embedUrl);
    return JSON.stringify({
      url: embedUrl,
      isEmbed: false,
      mimeType: "text/html",
      headers: {
        "User-Agent": UA,
        "Referer": embRef,
        "Origin": playerUrl ? EMBED_REF : (isWatchPage ? "https://xink.pro" : "https://playembed.vip"),
        "Sniffer": "true",
        "Block-Ads": false,
        "Custom-Js": rawJS(playerUrl || xinkPlayerUrl(streamUrl))
      },
      subtitles: subs
    });
  } catch (e) {
    log("parseDetailResponse error: " + e);
    return JSON.stringify({
      url: streamUrl || "",
      isEmbed: false,
      mimeType: "application/x-mpegURL",
      headers: { "User-Agent": UA, "Referer": EMBED_REF, "Custom-Js": rawJS(xinkPlayerUrl(streamUrl)) },
      subtitles: subs || []
    });
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

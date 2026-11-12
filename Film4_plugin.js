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
    id:          "film4",
    name:        "Film 4 [MOVIE]",
    description: "Phim HD tổng hợp",
    info: "Nguồn phim siêu chất lượng, subtitle rời đầy đủ.",
    version:     "1.0.22",
    author:      "Alokillgtv",
    BASEURL:     BASEURL,
    iconUrl:     "https://vaxplugin.alokillgtv.workers.dev/img/icon/film4.png",
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
        // ⭐ Native: mở thẳng trang player playembed (cùng origin với Custom-Js)
        //    thay vì trang xem-phim xink.pro (iframe cross-origin → sniffer không thấy mạng).
        var watch = link || (epId ? (SITEURL + "/xem-phim/" + movie.slug + "?ep=" + epId) : "");
        if (watch && watch.indexOf("http") !== 0) {
          watch = "https://playembed.vip" + (watch.charAt(0) === "/" ? "" : "/") + watch;
        }
        // ⭐ Slug unique: kèm server index để tránh trùng "1", "2" giữa các server
        var epSlug = "s" + (sIdx + 1) + "-e" + (eIdx + 1) + "-" + (ep.slug || ep.name || "");

        episodes.push({
          id:   watch,                                                           // trang player playembed
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

  // ═══ WASM decrypt nhúng sẵn (base64) — không fetch tới playembed/Cloudflare ═══
  var XK_WASM_B64 = "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IAZBCmoiByAJQQF0IgwtALysQDoAACAEQQNrIgJBCkkNASACQQpBhK7AABBMAAsgBEEEa0EKQYSuwAAQTAALIAdBAWogDEG9rMAAai0AADoAACAEQQJrQQpJBEAgB0ECaiALIAlB5ABsa0EBdEH+/wdxIgItALysQDoAACAEQQFrQQpPDQIgB0EDaiACQb2swABqLQAAOgAAIAZBBGshBiADQQRrIQMgAUH/rOIESyAAIQFFDQMMAQsLIARBAmtBCkGErsAAEEwACyAEQQFrQQpBhK7AABBMAAsgA0EKaiECCwJAIABBCU0EQCAAIQMgAiEBDAELIABB//8DcUHkAG4hAwJAIAJBAmsiAUEKSQRAIAEgBWogACADQeQAbGtB//8DcUEBdCIALQC8rEA6AAAgAkEBayICQQpPDQEgAiAFaiAAQb2swABqLQAAOgAADAILIAFBCkGErsAAEEwACyACQQpBhK7AABBMAAsCQEEAIAogAxtFBEAgAUEBayIBQQpPDQEgASAFaiADQQF0LQC9rEA6AAALIAEMAQsgAUEKQYSuwAAQTAALIgAgBWpBCiAAaxAPIAhBEGokAAttAQN/IAAoAgAiACgCDARAIABBDGoiASgCACECIAEoAgQiASgCACIDBEAgAiADEQQACyABKAIEIgMEQCACIAMgASgCCBB+CwsCQCAAQX9GDQAgACAAKAIEQQFrIgI2AgQgAg0AIABBGEEEEH4LCzwBAn8jAEEQayIBJAAgAEEIayIAIAAoAgBBAWsiAjYCACABIAA2AgwgAkUEQCABQQxqEFILIAFBEGokAAs/AQF/IwBBIGsiAyQAIAMgAjYCHCADIAE2AhggAyACNgIUIANBCGogA0EUahA7IAAgAykDCDcDACADQSBqJAALRgECfyABKAIEIQIgASgCACEDQQhBBBCEASIBRQRAQQRBCBCJAQALIAEgAjYCBCABIAM2AgAgAEHgp8AANgIEIAAgATYCAAv+AQACQCAAIAJNBEAgACABTSABIAJLcg0BIwBBIGsiAiQAIAIgATYCDCACIAA2AgggAiACQQxqrUKAgICA8ASENwMYIAIgAkEIaq1CgICAgPAEhDcDEEHjgMAAIAJBEGogAxBXAAsjAEEgayIBJAAgASACNgIMIAEgADYCCCABIAFBDGqtQoCAgIDwBIQ3AxggASAB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ACAANgIQIAQgAEEQakGcoMAAKAIAEQAADQEgACgCEEGUrsAAQQIgACgCFCgCDBEBAA0BCyABKAIAQZmuwABBASABKAIEKAIMEQEAIQULIABBIGokACACQRBqJAAgBQslAAJAIANFIAEgAxBzRXINACAAIAEgAyACEHkiAEUNACAADwsAC8QDAQl/IwBBEGsiAyQAIwBBQGoiAiQAIAIgATYCGCACIAA2AhQgAiACQT9qIgA2AjQgAiAANgIwIAIgAkEYajYCLCACIAJBFGo2AigjAEEQayIBJAAgAUEIaiACQShqIgAoAgAoAgAgACgCBCgCABBUIAJBHGohBSABKAIIIgkhBCABKAIMIQYjAEEgayIAJAAgACAEIAZBAUEAQQAgABAHIABBBGohBAJAIAAoAgBBAUYEQCAAQRhqIARBCGooAgAiCjYCACAAIAQpAgA3AxAgACgCFCAKEI0BIQQgAEEQahA2IAVBgICAgHg2AgAgBSAENgIEDAELIAUgBCkCADcCACAFQQhqIARBCGooAgA2AgALIABBIGokACAGBEAgCSAGQQEQfgsgAUEQaiQAAn8gAigCHEGAgICAeEYEQEEBIQAgAigCICEHQQAMAQsgAkEwaiACQSRqKAIANgIAIAIgAikCHDcDKCACQQhqIAJBKGoQOyACKAIMIQhBACEAIAIoAggLIQEgAyAANgIMIAMgBzYCCCADIAg2AgQgAyABNgIAIAJBQGskACADKAIAIAMoAgQgAygCCCADKAIMIANBEGokAAswAQF/IAFBCGsiAiACKAIAQQFqIgI2AgAgAkUEQAALIAAgATYCBCAAQZSfwAA2AgALZgAgASADRgRAIAEEQCAAIAIgAfwKAAALDwsjAEEgayIAJAAgACABNgIMIAAgAzYCCCAAIABBDGqtQoCAgIDwBIQ3AxggACAAQQhqrUKAgICA8ASENwMQQZiQwAAgAEEQaiAEEFcACyUBAX8jAEEQayIBJAAgASAAQQhrNgIMIAFBDGoQPiABQRBqJAALJwAgAEIANwAAIABBGGpCADcAACAAQRBqQgA3AAAgAEEIakIANwAACx4AIAAEQCAAIAIgAyAEIAUgASgCEBEQAA8LEIYBAAscACAABEAgACACIAMgBCABKAIQERoADwsQhgEACxwAIAAEQCAAIAIgAyAEIAEoAhARBgAP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wAAoAgBBAWo2AgBBpLHAACgCACAJQRBqJAAgAWoMAQsACyIAIBImASAACwkAIABBADYCAAsCAAsLoy8MAEGAgMAAC8EfwAE6wAAaaW52YWxpZCB1dGYtOCBzZXF1ZW5jZSBvZiDAEiBieXRlcyBmcm9tIGluZGV4IMAAKmluY29tcGxldGUgdXRmLTggYnl0ZSBzZXF1ZW5jZSBmcm9tIGluZGV4IMAAFnNsaWNlIGluZGV4IHN0YXJ0cyBhdCDADSBidXQgZW5kcyBhdCDAACBpbmRleCBvdXQgb2YgYm91bmRzOiB0aGUgbGVuIGlzIMASIGJ1dCB0aGUgaW5kZXggaXMgwAAScmFuZ2Ugc3RhcnQgaW5kZXggwCIgb3V0IG9mIHJhbmdlIGZvciBzbGljZSBvZiBsZW5ndGggwAAQcmFuZ2UgZW5kIGluZGV4IMAiIG91dCBvZiByYW5nZSBmb3Igc2xpY2Ugb2YgbGVuZ3RoIMAAIUdlbmVyaWNBcnJheTo6ZnJvbV9pdGVyIHJlY2VpdmVkIMAXIGVsZW1lbnRzIGJ1dCBleHBlY3RlZCDAABRVVEYtOCBkZWNvZGUgZXJyb3I6IMAAE1BLQ1M3IHVucGFkIGVycm9yOiDAABZJbnZhbGlkIGlucHV0IGxlbmd0aDogwAAqaW50ZXJuYWwgZXJyb3I6IGVudGVyZWQgdW5yZWFjaGFibGUgY29kZTogwAAWQmFzZTY0IGRlY29kZSBmYWlsZWQ6IMAAwAI6IMAAL1VzZXJzL3BoYW1uZ3V5ZW4yMDA0Ly5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvYmFzZTY0LTAuMjIuMS9zcmMvZW5naW5lL2dlbmVyYWxfcHVycG9zZS9kZWNvZGVfc3VmZml4LnJzAGxpYnJhcnkvYWxsb2Mvc3JjL2ZtdC5ycwAvVXNlcnMvcGhhbW5ndXllbjIwMDQvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9zaGEyLTAuMTAuOS9zcmMvc2hhMjU2L3NvZnQucnMAL3J1c3RjLzI1NGI1OTYwN2Q0NDE3ZTlkZmZiYzMwNzEzOGFlNWM4NjI4MGZlNGMvbGlicmFyeS9jb3JlL3NyYy9zbGljZS9pdGVyLnJzAGxpYnJhcnkvY29yZS9zcmMvZm10L251bS5ycwAvVXNlcnMvcGhhbW5ndXllbjIwMDQvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9qcy1zeXMtMC4zLjEwNi9zcmMvZnV0dXJlcy9qc3BpLnJzAC9Vc2Vycy9waGFtbmd1eWVuMjAwNC8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL3NoYTItMC4xMC45L3NyYy9jb3JlX2FwaS5ycwAvVXNlcnMvcGhhbW5ndXllbjIwMDQvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9kaWdlc3QtMC4xMC43L3NyYy9jb3JlX2FwaS9jdF92YXJpYWJsZS5ycwAvVXNlcnMvcGhhbW5ndXllbjIwMDQvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9iYXNlNjQtMC4yMi4xL3NyYy9lbmdpbmUvZ2VuZXJhbF9wdXJwb3NlL2RlY29kZS5ycwAvVXNlcnMvcGhhbW5ndXllbjIwMDQvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9iYXNlNjQtMC4yMi4xL3NyYy9lbmdpbmUvbW9kLnJzAGxpYnJhcnkvYWxsb2Mvc3JjL3Jhd192ZWMvbW9kLnJzAC9ydXN0L2RlcHMvZGxtYWxsb2MtMC4yLjExL3NyYy9kbG1hbGxvYy5ycwBsaWJyYXJ5L3N0ZC9zcmMvYWxsb2MucnMAL1VzZXJzL3BoYW1uZ3V5ZW4yMDA0Ly5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvZ2VuZXJpYy1hcnJheS0wLjE0Ljcvc3JjL2xpYi5ycwAvVXNlcnMvcGhhbW5ndXllbjIwMDQvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9ibG9jay1idWZmZXItMC4xMC40L3NyYy9saWIucnMAL1VzZXJzL3BoYW1uZ3V5ZW4yMDA0Ly5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvaG1hYy0wLjEyLjEvc3JjL2xpYi5ycwAvVXNlcnMvcGhhbW5ndXllbjIwMDQvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9hZXMtMC44LjQvc3JjL3NvZnQvZml4c2xpY2UzMi5ycwAVbWVtb3J5IGFsbG9jYXRpb24gb2YgwA0gYnl0ZXMgZmFpbGVkABRJbnZhbGlkIGxhc3Qgc3ltYm9sIMAJLCBvZmZzZXQgwAEuAA9JbnZhbGlkIHN5bWJvbCDACSwgb2Zmc2V0IMABLgAmY29weV9mcm9tX3NsaWNlOiBzb3VyY2Ugc2xpY2UgbGVuZ3RoICjAKykgZG9lcyBub3QgbWF0Y2ggZGVzdGluYXRpb24gc2xpY2UgbGVuZ3RoICjAASkACQMQAE4AAAANCAAAEQAAAEkEEAB0AAAAfAAAACQAAAB3BhAAaQAAAKQAAAAgAAAAdwYQAGkAAACuAAAAGgAAAHcGEABpAAAAnQAAACUAAAB3BhAAaQAAADgBAAAeAAAAdwYQAGkAAAA1AQAAGAAAADgHEAAKAAAALQAAAAkAAAA1NDw2MyI9MzszNzspLig/OzcsPygzKTU0I0VYVE0zVXsAAAJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OS1f////////////////////////////////////////////////////////////Pv//NDU2Nzg5Ojs8Pf////////8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGf////8//xobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIz/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wEAAUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5LV////////////////////////////////////////////////////////////8+//80NTY3ODk6Ozw9/////////wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZ/////z//GhscHR4fICEiIyQlJicoKSorLC0uLzAxMjP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAACQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL/////////////////////////////////////////////////////////8+////PzQ1Njc4OTo7PD3/////////AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBn///////8aGxwdHh8gISIjJCUmJygpKissLS4vMDEyM/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8BAAFBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsv/////////////////////////////////////////////////////////z7///8/NDU2Nzg5Ojs8Pf////////8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGf///////xobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIz/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////0VtcHR5IGlucHV0RGVjcnlwdGlvbiBmYWlsZWQ6IG5laXRoZXIgZHluYW1pYyA1LW1pbiBrZXkgbm9yIGZhbGxiYWNrIGtleSBtYXRjaGVkQ2lwaGVydGV4dCBsZW5ndGggbm90IG11bHRpcGxlIG9mIDE2UGF5bG9hZCB0b28gc2hvcnQAADgHEAAKAAAAfgAAABwAAAA4BxAACgAAAIoAAAAcAAAAU3RhdGljIGRlY3J5cHRpb24gZmFpbGVk4QYQAGEAAAB8AAAAIwAAAOEGEABhAAAAcwAAAB4AAABWZWMgaXMgc2l6ZWQgY29uc2VydmF0aXZlbHkA/A4QABsAAAA8BRAAagAAAAEBAAAZAAAA4gMQAGYAAABCAAAAEwAAAGfmCWqFrme7cvNuPDr1T6V/Ug5RjGgFm6vZgx8ZzeBbY2xvc3VyZSBpbnZva2VkIHJlY3Vyc2l2ZWx5IG9yIGFmdGVyIGJlaW5nIGRyb3BwZWQAACEAAAAiAAAAIwAAACQAAAB0AxAAbQAAAMIAAAAsAAAAdAMQAG0AAAC1AAAAIABBzJ/AAAvRCQEAAAAlAAAAY2FsbGVkIGBSZXN1bHQ6OnVud3JhcCgpYCBvbiBhbiBgRXJyYCB2YWx1ZQCfAhAAaQAAANUAAAA2AAAAAAAAAAQAAAAEAAAAJgAAAFRyeUZyb21TbGljZUVycm9yAAAACQMQAE4AAABxBwAAEQAAAEludmFsaWQgcGFkZGluZwABAhAAhAAAAFQAAAAJAAAAvgQQAH0AAAA4AAAAJgAAAL4EEAB9AAAAXgAAAC4AAAC+BBAAfQAAAGEAAAANAAAAvgQQAH0AAABlAAAAOAAAAL4EEAB9AAAAPQAAACcAAAC+BBAAfQAAACcBAAARAAAAvgQQAH0AAAD5AAAAEQAAAL4EEAB9AAAAjQAAABkAAABDBxAAawAAABQFAAAiAAAAQwcQAGsAAAAUBQAACQAAAEMHEABrAAAAiQQAABIAAABDBxAAawAAAIkEAAA9AAAAQwcQAGsAAAD+BAAAGwAAAEMHEABrAAAA/wQAABsAAABDBxAAawAAAAAFAAAb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";

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

  function xToast(m) {
    try {
      if (window.top && window.top !== window) return;
      if (window.SnifferBridge && typeof window.SnifferBridge.toast === 'function') {
        window.SnifferBridge.toast(String(m || '').slice(0, 90), 3000);
      }
    } catch(e) {}
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
      var isStreamApi = url && url.indexOf('/api/stream') > -1;
      var streamToken = '';
      if (isStreamApi) {
        try { streamToken = xHdrGet(init && init.headers, 'X-Turnstile-Session'); } catch(e) {}
        log('🔍 fetch /api/stream → ' + url.substring(0, 120));
      }
      if (isTarget) {
        log('🔍 fetch → ' + url.substring(0, 120) + '...');
      }

      var p = OrigFetch.apply(this, arguments);

      if (isStreamApi) {
        p = p.then(function(response) {
          try {
            var cloned = response.clone();
            cloned.text().then(function(text) {
              try { xHandleStreamJson(JSON.parse(text), url, streamToken); } catch(e0) {}
            }).catch(function(e) {
              log('api/stream read err: ' + (e.message || e));
            });
          } catch(e) {
            log('api/stream clone err: ' + (e.message || e));
          }
          return response;
        });
      } else if (isTarget || isM3u8) {
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

  // ═══ Đọc header từ object hoặc Headers ═══
  function xHdrGet(h, name) {
    if (!h) return '';
    try { if (typeof h.get === 'function') return h.get(name) || ''; } catch (e) {}
    try {
      for (var k in h) {
        if (String(k).toLowerCase() === String(name).toLowerCase()) return h[k] || '';
      }
    } catch (e2) {}
    return '';
  }

  // ═══ Giải mã payload/iv AES-GCM (giống player: key = SHA-256(session token)) ═══
  function xDecryptStream(payload, ivHex, token) {
    return new Promise(function (resolve, reject) {
      try {
        var subtle = window.crypto && window.crypto.subtle;
        if (!subtle || !payload || !ivHex || !token) return reject(new Error('missing params'));
        var enc = new TextEncoder().encode(token);
        var iv = new Uint8Array((ivHex.match(/.{1,2}/g) || []).map(function (h) { return parseInt(h, 16); }));
        var bin = atob(payload);
        var buf = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        subtle.digest('SHA-256', enc).then(function (hash) {
          return subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);
        }).then(function (key) {
          return subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, buf);
        }).then(function (plain) {
          resolve(new TextDecoder('utf-8').decode(plain));
        }).catch(reject);
      } catch (e) { reject(e); }
    });
  }

  // ═══ Tải URL m3u8 trực tiếp và gửi cho App ═══
  function xTryUrlStream(u, ref) {
    if (!u || typeof u !== 'string' || !/^https?:\\/\\//i.test(u)) return;
    try {
      fetch(u, {
        headers: { 'Referer': ref || HDR.Referer, 'Origin': __xOrigin, 'User-Agent': navigator.userAgent },
        credentials: 'include'
      }).then(function (r) { return r.text(); }).then(function (t) {
        if (t && t.indexOf('#EXTM3U') > -1) xTryM3u8(t, u, false);
      }).catch(function (e) { log('url stream err: ' + (e.message || e)); });
    } catch (e) {}
  }

  // ═══ Xử lý JSON /api/stream (streamUrl hoặc payload mã hoá) ═══
  function xHandleStreamJson(data, reqUrl, token) {
    if (!data || typeof data !== 'object') return;
    if (typeof data.streamUrl === 'string' && data.streamUrl) {
      log('🔓 /api/stream streamUrl → ' + data.streamUrl.slice(0, 100));
      xTryUrlStream(data.streamUrl, reqUrl);
      return;
    }
    if (data.encrypted && data.payload && data.iv) {
      var tk = token || window.__onflix_session_token || '';
      log('🔐 /api/stream encrypted | iv=' + String(data.iv).slice(0, 12) + ' | token=' + (tk ? 'YES' : 'NO'));
      xDecryptStream(data.payload, data.iv, tk).then(function (txt) {
        txt = String(txt || '').trim();
        if (txt.indexOf('#EXTM3U') > -1) { xTryM3u8(txt, reqUrl, false); return; }
        if (/^https?:\\/\\//i.test(txt)) { xTryUrlStream(txt, reqUrl); return; }
        log('decrypt /api/stream không phải m3u8/URL | head=' + JSON.stringify(txt.slice(0, 80)));
      }).catch(function (e) {
        log('❌ decrypt /api/stream: ' + (e.message || e));
      });
    }
  }

  // ═══ GIẢI MÃ TRỰC TIẾP play_vid bằng WASM (không phụ thuộc Turnstile) ═══
  function xVodFetchJson(u) {
    return fetch(u, { headers: { 'Accept': 'application/json' }, credentials: 'omit', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function xVodWasmBytes() {
    try {
      if (typeof XK_WASM_B64 === 'string' && XK_WASM_B64.length > 1000) {
        var bin = atob(XK_WASM_B64);
        var u = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        return Promise.resolve(u);
      }
    } catch (e) {}
    return fetch('/wasm/vod_decryptor_bg.wasm', { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('wasm HTTP ' + r.status); return r.arrayBuffer(); })
      .then(function (b) { return new Uint8Array(b); });
  }

  function xVodDecryptPlayVid(pid, id) {
    return xVodWasmBytes()
      .then(function (buf) {
        var EXP = null;
        var TD = new TextDecoder('utf-8');
        var TE = new TextEncoder();
        function dec(p, l) {
          try { return TD.decode(new Uint8Array(EXP.memory.buffer, p, l)); } catch (e) { return ''; }
        }
        var imports = { './vod_decryptor_bg.js': {
          __wbg_now_aa4ccb83129e9e55: function () { return Date.now(); },
          __wbg___wbindgen_throw_41e9ee4f547fc59a: function (p, l) { throw new Error(dec(p, l)); },
          __wbg_Error_30c8987f7c2ed4e2: function (p, l) { return new Error(dec(p, l)); },
          __wbindgen_init_externref_table: function () {
            var t = EXP.__wbindgen_externrefs;
            var n = t.grow(4);
            t.set(0, undefined);
            t.set(n + 0, undefined);
            t.set(n + 1, null);
            t.set(n + 2, true);
            t.set(n + 3, false);
          }
        } };
        return WebAssembly.instantiate(buf, imports).then(function (res) {
          var e = res.instance.exports;
          EXP = e;
          try { e.__wbindgen_start(); } catch (es) {}
          function put(s) {
            var b = TE.encode(s);
            var p = e.__wbindgen_malloc(b.length, 1);
            new Uint8Array(e.memory.buffer, p, b.length).set(b);
            return [p, b.length];
          }
          var a = put(String(pid));
          var b = put(String(id));
          var out = '';
          try {
            var r = e.decrypt_play_vid_with_id(a[0], a[1], b[0], b[1]);
            if (r && r.length) {
              if (r[3]) {
                var ev = null;
                try { ev = e.__wbindgen_externrefs.get(r[2]); } catch (ex) {}
                try { e.__externref_table_dealloc(r[2]); } catch (ex2) {}
                throw (ev || new Error('wasm decrypt failed'));
              }
              out = TD.decode(new Uint8Array(e.memory.buffer, r[0], r[1]));
              try { e.__wbindgen_free(r[0], r[1], 1); } catch (f0) {}
            }
          } finally {
            try { e.__wbindgen_free(a[0], a[1], 1); } catch (f1) {}
            try { e.__wbindgen_free(b[0], b[1], 1); } catch (f2) {}
          }
          return out;
        });
      });
  }

  function xVodPick(master, sourceUrl, depth) {
    if (!master) return Promise.reject(new Error('master rỗng'));
    if (master.play_vid) return Promise.resolve({ media: master, mediaUrl: sourceUrl || master.link_m3u8 || '' });
    if (master.type === 'master' && master.qualities && master.qualities.length) {
      var base = master.link_m3u8 || sourceUrl || '';
      if (!base) return Promise.reject(new Error('thiếu base master'));
      var quals = master.qualities.slice().sort(function (a, b) {
        var ra = parseInt(String(a.quality || '').replace(/[^0-9]/g, ''), 10) || a.bandwidth || 0;
        var rb = parseInt(String(b.quality || '').replace(/[^0-9]/g, ''), 10) || b.bandwidth || 0;
        return rb - ra;
      });
      var pick = quals[0];
      var sep = base.indexOf('?') >= 0 ? '&' : '?';
      var mediaUrl = base + sep + 'q=' + pick.qid;
      log('⚡ direct master OK | quality=' + pick.quality + ' qid=' + pick.qid);
      return xVodFetchJson(mediaUrl).then(function (media) {
        return { media: media, mediaUrl: mediaUrl };
      });
    }
    if (master.link_m3u8 && depth) {
      log('⚡ direct: theo link_m3u8 để lấy master');
      var nextUrl = master.link_m3u8;
      return xVodFetchJson(nextUrl).then(function (next) {
        return xVodPick(next, nextUrl, depth - 1);
      });
    }
    return Promise.reject(new Error('master không có qualities'));
  }

  function xDirectVod() {
    if (window.__xDirectTried || __xDone) return;
    window.__xDirectTried = true;
    var src = String(location.pathname || '') + ' ' + String(PLAYER_URL || '');
    var m = src.match(/\\/player\\/([a-f0-9]{16,})/i);
    if (!m) { log('direct: không thấy episode id'); return; }
    var id = m[1];
    log('⚡ direct: id=' + id);
    xVodFetchJson('https://gota.edgecontent.site/public/' + id + '/stream.m3u8')
      .then(function (first) { return xVodPick(first, 'https://gota.edgecontent.site/public/' + id + '/stream.m3u8', 2); })
      .then(function (sel) {
        var media = sel.media, mediaUrl = sel.mediaUrl;
        if (!media || !media.play_vid) throw new Error('thiếu play_vid');
        log('⚡ direct media OK | play_vid len=' + media.play_vid.length);
        return xVodDecryptPlayVid(media.play_vid, id).then(function (txt) {
          if (!txt || txt.indexOf('#EXTM3U') !== 0) throw new Error('giải mã fail len=' + (txt ? txt.length : 0));
          log('⚡ DIRECT DECRYPT OK | playlist len=' + txt.length);
          window.__onflix_media_url = mediaUrl;
          if (media.sub) window.__onflix_subs = [{ lang: 'vi', url: media.sub, mimeType: 'text/vtt' }];
          xSend(txt, mediaUrl, JSON.stringify(HDR));
        });
      })
      .catch(function (e) {
        log('⚡ direct fail: ' + (e && e.message ? e.message : e));
       // xToast('XINK FAIL: ' + (e && e.message ? e.message : e));
      });
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

    // ═══ Native: gửi playlist RAW, để App tự rewrite + gắn header ═══
    // (vax.local chỉ có trong WebView tv/; native EmbedSniffer dùng
    //  playM3u8Content(content, base, headers) và tự phục vụ 127.0.0.1)
    var _bridge = (window.SnifferBridge && typeof window.SnifferBridge.playM3u8Content === 'function') ? window.SnifferBridge : null;
    var _wrapped = body;
    try { if (!_bridge) _wrapped = xRewrite(body, b); } catch (e) { log('rewrite err: ' + (e.message || e)); }

    try {
      if (_bridge) {
        // Segments của Xink là MPEG-TS thật nhưng đặt đuôi .m4s + content-type video/mp4.
        // ExoPlayer sẽ chọn FragmentedMp4Extractor → NoDeclaredBrand. Đổi đuôi .m4s → .ts
        // (CDN soracdn bỏ qua phần đuôi, đã kiểm chứng trả cùng bytes) để HLS dùng TsExtractor.
        var _play = body;
        if (body.indexOf('soracdn.com') > -1 && body.indexOf('.m4s') > -1) {
          _play = body.replace(/\.m4s(?=[^a-zA-Z0-9]|$)/gi, '.ts');
          if (_play !== body) log('🔁 segment .m4s → .ts (MPEG-TS thật)');
        }
        _bridge.playM3u8Content(_play, b, JSON.stringify(_h));
        log('▶️ playM3u8Content raw → ExoPlayer');
        //xToast('XINK direct OK (' + body.length + ')');
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

  setTimeout(xDirectVod, 200);
  document.addEventListener('DOMContentLoaded', xDirectVod);
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

  log('✅ ONFLIX sniffer v1.0.20 installed (embedded WASM, m4s→ts, isEmbed:false)');
  //xToast('XINK v1.0.20 JS OK');
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

    // ── 3b. play_vid là URL CDN trực tiếp → native phát được ngay (không cần sniffer) ──
    if (playVid && /^https?:\/\//i.test(playVid)) {
      log("play_vid là URL trực tiếp: " + playVid.slice(0, 100));
      return JSON.stringify({
        url: playVid,
        isEmbed: false,
        mimeType: "application/x-mpegURL",
        headers: {
          "User-Agent": UA,
          "Referer": EMBED_REF,
          "Origin": "https://playembed.vip"
        },
        subtitles: subs
      });
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
    // ⭐ isEmbed=false để App chạy Custom-Js trong EmbedSniffer (playerType
    //    embedtoexoplay). isEmbed=true sẽ khiến Custom-Js KHÔNG được thực thi.
    return JSON.stringify({
      url: embedUrl,
      isEmbed: false,
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
    var _fallbackPlayer = xinkPlayerUrl(streamUrl) || streamUrl || "";
    return JSON.stringify({
      url: _fallbackPlayer,
      isEmbed: false,
      headers: { "User-Agent": UA, "Referer": EMBED_REF, "Custom-Js": rawJS(_fallbackPlayer) },
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
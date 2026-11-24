// ===== TOPCARTOONS.TV VAX PLUGIN v3.0 (NATIVE) =====
// Lý do viết lại:
//  - Certificate của site CHỈ hợp lệ cho apex `topcartoons.tv`, KHÔNG có `www`.
//    Toàn bộ HTML/link/poster dùng `www.topcartoons.tv` → OkHttp native fail TLS.
//  - `/serie/` và trang detail trả 301 sang `www...` → cũng fail TLS.
//  - `www...` còn bị Cloudflare chặn khi gọi từ worker (error 1102).
// Giải pháp: chỉ dùng endpoint 200 trực tiếp trên apex:
//  - WP REST API:  /wp-json/wp/v2/posts?...  (list, search, detail phim lẻ)
//  - Sitemap:      /vid_series-sitemap.xml (danh sách series)
//                  /sitemap_index.xml → video-sitemap*.xml (tập của series + mp4)
//  - Stream mp4:   ww.topcartoons.tv (cert riêng hợp lệ, không cần Referer)
// Không dùng `_$()`/scrape HTML để tránh phụ thuộc domain www.

var iddomain = "topcartoons";
BASEURL = "https://topcartoons.tv";
NEWDDOMAIN = false;
var popup_html = "";

var CT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var CT_PER_PAGE = 24;
var CT_VIDEO_CACHE_TTL = 6 * 3600 * 1000;

function CT_LOG() {
  try { console.log.apply(console, ['[CartoonPlugin]'].concat([].slice.call(arguments))); } catch (e) {}
  try { if (typeof log === 'function') log('[CartoonPlugin] ' + [].slice.call(arguments).join(' ')); } catch (e) {}
}

CT_LOG("===== PLUGIN v3.0 LOADED =====", BASEURL);

// =============================================================================
// HTTP
// =============================================================================
function _ctGet(url) {
  try {
    var clean = String(url || "").split('|')[0];
    if (!/^https?:/i.test(clean)) clean = BASEURL + (clean.charAt(0) === '/' ? '' : '/') + clean;
    var res = httpRequest(clean, {
      method: "GET",
      headers: {
        "User-Agent": CT_UA,
        "Accept": "application/json, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (res && res.isSuccessful && res.body) return String(res.body);
    if (res && res.deferred) CT_LOG("_ctGet deferred:", clean);
    else CT_LOG("_ctGet fail:", clean, "status=" + (res && res.status));
    return "";
  } catch (e) {
    CT_LOG("_ctGet err:", e && e.message || e);
    return "";
  }
}

function _ctJson(text) {
  if (!text) return null;
  var s = String(text).replace(/^\uFEFF/, "").trim();
  var a = s.indexOf('['), o = s.indexOf('{');
  if (a === -1 && o === -1) return null;
  if (a !== -1 && (o === -1 || a < o)) s = s.substring(a, s.lastIndexOf(']') + 1);
  else s = s.substring(o, s.lastIndexOf('}') + 1);
  try { return JSON.parse(s); } catch (e) { return null; }
}

// =============================================================================
// HELPERS
// =============================================================================
function _ctDecode(s) {
  try {
    if (typeof decodeHTMLtext === 'function') return decodeHTMLtext(String(s || ''));
  } catch (e) {}
  return String(s || '')
    .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(parseInt(d, 10)); })
    .replace(/&#x([0-9a-f]+);/gi, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#0?39;/g, "'");
}

function _ctStripTags(s) {
  return _ctDecode(String(s || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// Chuẩn hoá tên để so slug ↔ tag sitemap ("What’s New, Scooby-Doo?" == whats-new-scooby-doo)
function _ctNorm(s) {
  s = String(s || '').toLowerCase();
  s = s.replace(/[\u00e0-\u00e5\u0103\u0102\u00e2\u00c2]/g, 'a')
       .replace(/[\u00e8-\u00eb\u0113]/g, 'e')
       .replace(/[\u00ec-\u00ef]/g, 'i')
       .replace(/[\u00f2-\u00f6\u01a1]/g, 'o')
       .replace(/[\u00f9-\u00fc\u01b0]/g, 'u')
       .replace(/[\u00fd\u1ef3]/g, 'y')
       .replace(/[\u0111]/g, 'd');
  return s.replace(/[^a-z0-9]/g, '');
}

function _ctSlugOf(url) {
  var s = String(url || '').split('?')[0].split('#')[0].replace(/\/+$/, '');
  var p = s.split('/');
  return p[p.length - 1] || '';
}

function _ctHostApex(u) {
  return String(u || '').replace(/^https?:\/\/www\./i, 'https://');
}

// =============================================================================
// MANIFEST / MENU
// =============================================================================
function getManifest() {
  CT_LOG("getManifest()");
  try {
    return JSON.stringify({
      "id": "cartoon",
      "name": "Cartoon [ANIME]",
      "version": "3.1",
      "author": "Alokillgtv",
      "info": "TopCartoons.tv — Series + Cartoons, stream MP4 trực tiếp (native).",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugins.alokillgtv05.workers.dev/img/icon/cartoon.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "type": "ANIME",
      "layoutType": "HORIZONTAL",
      "subtitleCat": false,
      "playerType": "exoplayer",
      "headers": { "Referer": BASEURL + "/", "Origin": BASEURL }
    });
  } catch (e) {
    return JSON.stringify({ id: "loi", name: "Plugin lỗi: " + e, baseUrl: BASEURL });
  }
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "series", title: "Series", type: "Grid", path: "anime" },
    { slug: "cartoons", title: "Cartoons", type: "Grid", path: "anime" }
  ]);
}

function getLISTmenu() {
  return JSON.stringify([
    { link: "series", name: "Series" },
    { link: "cartoons", name: "Cartoons" }
  ]);
}

function getPrimaryCategories() {
  return getLISTmenu();
}

function getFilterConfig() {
  try { return JSON.stringify({ category: JSON.parse(getLISTmenu()) }); } catch (e) { return JSON.stringify({ category: [] }); }
}

// =============================================================================
// URL BUILDERS
// =============================================================================
function _ctPostFields() {
  /* Phải xin cả _links + _embedded, nếu chỉ xin field con lồng nhau WP trả
     _embedded rỗng → mất poster. 16KB/24 bài là chấp nhận được. */
  return "id,slug,link,title,excerpt,date,cmb2,_links,_embedded";
}

function _ctListUrl(page) {
  return BASEURL + "/wp-json/wp/v2/posts?per_page=" + CT_PER_PAGE +
         "&page=" + (page || 1) +
         "&_embed=wp:featuredmedia" +
         "&_fields=" + encodeURIComponent(_ctPostFields());
}

function _ctSearchUrl(kw, page) {
  return BASEURL + "/wp-json/wp/v2/posts?search=" + encodeURIComponent(kw || "") +
         "&per_page=" + CT_PER_PAGE +
         "&page=" + (page || 1) +
         "&_embed=wp:featuredmedia" +
         "&_fields=" + encodeURIComponent(_ctPostFields());
}

/* Tổng số trang do WP trả trong header X-WP-TotalPages. httpRequest native
   có res.headers nên đọc được; cache RAM 10 phút, chỉ tốn 1 request nhỏ. */
var _ctTotalPagesCache = {};
function _ctTotalPages(kw) {
  var key = kw ? ('s:' + kw) : 'all';
  var c = _ctTotalPagesCache[key];
  if (c && (Date.now() - c.ts) < 10 * 60 * 1000) return c.v;
  var url = BASEURL + "/wp-json/wp/v2/posts?per_page=1&_fields=id" +
            (kw ? ("&search=" + encodeURIComponent(kw)) : "");
  var v = 0;
  try {
    var res = httpRequest(url, { method: "GET", headers: { "User-Agent": CT_UA, "Accept": "application/json" } });
    var h = (res && res.headers) || {};
    var total = 0;
    try {
      if (typeof h.get === "function") {
        total = parseInt(h.get("x-wp-total"), 10) || 0;
        if (!total) total = (parseInt(h.get("x-wp-totalpages"), 10) || 0) * 1;
      }
    } catch (e) {}
    if (!total) total = parseInt(h["x-wp-total"] || h["X-WP-Total"] || 0, 10) || 0;
    /* URL dùng per_page=1 → X-WP-Total là tổng bài, tự chia theo CT_PER_PAGE */
    if (total > 0) v = Math.max(1, Math.ceil(total / CT_PER_PAGE));
  } catch (e) {}
  if (v > 0) _ctTotalPagesCache[key] = { v: v, ts: Date.now() };
  return v;
}

function _ctPostDetailUrl(slug) {
  return BASEURL + "/wp-json/wp/v2/posts?slug=" + encodeURIComponent(slug) +
         "&_embed=wp:featuredmedia" +
         "&_fields=" + encodeURIComponent(_ctPostFields());
}

function getUrlList(slug, filtersJson) {
  var page = 1;
  try { page = parseInt(JSON.parse(filtersJson || "{}").page, 10) || 1; } catch (e) {}
  var s = String(slug || "");
  CT_LOG("getUrlList() slug=" + s + " page=" + page);

  if (s.indexOf("series") === 0) return BASEURL + "/vid_series-sitemap.xml";
  if (s.indexOf("cartoons") === 0) return _ctListUrl(page);
  if (s.indexOf("http") === 0) return s;
  return _ctListUrl(page);
}

function getUrlSearch(keyword, filtersJson) {
  var page = 1;
  try { page = parseInt(JSON.parse(filtersJson || "{}").page, 10) || 1; } catch (e) {}
  return _ctSearchUrl(keyword, page);
}

function getUrlDetail(slug) {
  var s = String(slug || "");
  CT_LOG("getUrlDetail() slug=" + s.slice(0, 120));

  // Series: dựng MovieDetail JSON trực tiếp (native + WebView đều bỏ qua fetch)
  if (/\/serie\/[^/]+\/?$/i.test(s)) {
    var seriesUrl = _ctHostApex(s);
    var got = _ctEpisodesOfSeries(seriesUrl);
    var sname = got.name || _ctSlugOf(seriesUrl).replace(/-/g, ' ');
    var poster = _ctSeriesPoster(seriesUrl) || (got.episodes[0] && got.episodes[0].poster) || "";
    var servers = [{ name: sname || "Server", episodes: got.episodes.map(function (ep) {
      return { id: ep.id, name: ep.name, slug: ep.slug };
    }) }];
    if (!servers[0].episodes.length) servers = [];
    CT_LOG("getUrlDetail series JSON: " + sname + " eps=" + (servers[0] ? servers[0].episodes.length : 0));
    return JSON.stringify({
      id: seriesUrl,
      title: sname,
      originName: sname,
      posterUrl: poster,
      backdropUrl: poster,
      description: "",
      quality: "HD",
      year: "",
      rating: "",
      status: (servers[0] ? servers[0].episodes.length : 0) + " episodes",
      episode_current: (servers[0] ? servers[0].episodes.length : 0) + " episodes",
      servers: servers,
      duration: "", casts: "", director: "", country: "US", lang: "", category: "", extra: ""
    });
  }
  // Phim lẻ: id là URL REST detail (đã dựng sẵn ở parseList)
  if (s.indexOf("http") === 0) return s;

  // Fallback: slug thuần
  return _ctPostDetailUrl(s);
}

// =============================================================================
// LIST PARSER
// =============================================================================
function _ctItemFromPost(p) {
  var title = _ctStripTags(p && p.title && p.title.rendered);
  if (!title && p && p.slug) title = String(p.slug).replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  var featured = "";
  try {
    var emb = p && p._embedded && p._embedded["wp:featuredmedia"];
    if (emb && emb[0]) {
      featured = emb[0].source_url || "";
      if (!featured && emb[0].media_details && emb[0].media_details.sizes) {
        var sz = emb[0].media_details.sizes;
        featured = (sz.medium_large && sz.medium_large.source_url) ||
                   (sz.medium && sz.medium.source_url) ||
                   (sz.full && sz.full.source_url) || "";
      }
    }
  } catch (e) {}
  /* Ảnh nằm trên www (cert lỗi) → đổi sang apex */
  featured = _ctHostApex(featured);

  var excerpt = _ctStripTags(p && p.excerpt && p.excerpt.rendered);
  var video = "";
  try { video = (p.cmb2.video_player_settings.vm_video_url) || ""; } catch (e) {}

  var slug = p && p.slug ? p.slug : "";
  return {
    id: slug ? _ctPostDetailUrl(slug) : "",
    title: title,
    quality: video ? "MP4" : "HD",
    episode_current: "Full",
    posterUrl: featured,
    backdropUrl: featured,
    year: (p && p.date ? String(p.date).slice(0, 4) : ""),
    lang: "English",
    description: excerpt
  };
}

function _ctParseRestList(j, page, kw) {
  var items = [];
  if (Array.isArray(j)) {
    for (var i = 0; i < j.length; i++) {
      var it = _ctItemFromPost(j[i]);
      if (it && it.id && it.title) items.push(it);
    }
  }
  var total = _ctTotalPages(kw);
  var totalPages = total > 0 ? total : (items.length >= CT_PER_PAGE ? (page + 1) : page);
  var currentPage = page;
  if (total > 0 && currentPage > total) currentPage = total;
  CT_LOG("parseList REST page=" + currentPage + "/" + totalPages + " items=" + items.length);
  return JSON.stringify({ items: items, pagination: { currentPage: currentPage, totalPages: totalPages } });
}

function _ctParseSeriesSitemap(xml) {
  var items = [];
  if (!xml) return items;
  var blocks = String(xml).match(/<url>[\s\S]*?<\/url>/g) || [];
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    var loc = (b.match(/<loc>([\s\S]*?)<\/loc>/) || [])[1] || '';
    loc = _ctDecode(loc.trim());
    if (!/\/serie\/[^/]+\/?$/i.test(loc)) continue;   // bỏ trang /serie/ gốc
    var img = (b.match(/<image:loc>([\s\S]*?)<\/image:loc>/) || [])[1] || '';
    img = _ctHostApex(_ctDecode(img.trim()));
    var slug = _ctSlugOf(loc);
    var title = slug.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    items.push({
      id: _ctHostApex(loc),
      title: title,
      quality: "Series",
      episode_current: "",
      posterUrl: img,
      backdropUrl: img,
      year: "",
      lang: "English"
    });
  }
  CT_LOG("parseList series sitemap items=" + items.length);
  return items;
}

function parseListResponse(html, url) {
  var u = String(url || "").split('|')[0];
  CT_LOG("parseListResponse() url=" + u.slice(0, 100) + " htmlLen=" + (html ? String(html).length : 0));
  try {
    if (/vid_series-sitemap\.xml/i.test(u)) {
      var seriesItems = _ctParseSeriesSitemap(html || _ctGet(u));
      return JSON.stringify({ items: seriesItems, pagination: { currentPage: 1, totalPages: 1 } });
    }

    var page = 1;
    try { page = parseInt((u.match(/[?&]page=(\d+)/) || [])[1], 10) || 1; } catch (e) {}

    var kw = "";
    try { kw = decodeURIComponent((u.match(/[?&]search=([^&]*)/) || [])[1] || ""); } catch (e) { kw = ""; }

    var j = _ctJson(html);
    if (!j) {
      CT_LOG("parseListResponse: body rỗng/không phải JSON → tự fetch");
      j = _ctJson(_ctGet(u));
    }
    if (!j) return JSON.stringify({ items: [], pagination: { currentPage: page, totalPages: page } });
    /* WP trả object lỗi khi vượt trang cuối */
    if (!Array.isArray(j) && j && (j.code || j.data)) {
      var last = Math.max(1, page - 1);
      return JSON.stringify({ items: [], pagination: { currentPage: last, totalPages: last } });
    }
    return _ctParseRestList(j, page, kw);
  } catch (e) {
    CT_LOG("parseListResponse[err]:", e && e.message || e);
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(html, url) {
  return parseListResponse(html, url);
}

// =============================================================================
// SERIES INDEX (video sitemaps) — cache RAM
// =============================================================================
var _ctVideoEntries = null;
var _ctVideoIndex = null;      /* { normTag: [entry,...] } — tránh quét 3000 entry mỗi lần */
var _ctVideoEntriesTs = 0;
var _ctVideoEntriesLoading = false;

function _ctExtractVideoSitemaps(indexXml) {
  var urls = [];
  var locs = String(indexXml || "").match(/<loc>([\s\S]*?)<\/loc>/g) || [];
  for (var i = 0; i < locs.length; i++) {
    var loc = (locs[i].match(/<loc>([\s\S]*?)<\/loc>/) || [])[1] || '';
    loc = _ctDecode(loc.trim());
    if (/\/video-sitemap[^\/]*\.xml/i.test(loc)) urls.push(_ctHostApex(loc));
  }
  return urls;
}
/* Sitemap video của Yoast đặt <loc> dạng https://www.topcartoons.tv/...
   → mọi dữ liệu trong đó (poster, series URL) phải đổi sang apex. */

function _ctParseVideoSitemap(xml, out) {
  var blocks = String(xml || "").match(/<url>[\s\S]*?<\/url>/g) || [];
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    var loc = (b.match(/<loc>([\s\S]*?)<\/loc>/) || [])[1] || '';
    if (!loc) continue;
    var title = (b.match(/<video:title><!\[CDATA\[([\s\S]*?)\]\]><\/video:title>/) || [])[1] ||
                (b.match(/<video:title>([\s\S]*?)<\/video:title>/) || [])[1] || '';
    var vid = (b.match(/<video:content_loc>([\s\S]*?)<\/video:content_loc>/) || [])[1] || '';
    var thumb = (b.match(/<video:thumbnail_loc>([\s\S]*?)<\/video:thumbnail_loc>/) || [])[1] || '';
    var tag = (b.match(/<video:tag><!\[CDATA\[([\s\S]*?)\]\]><\/video:tag>/) || [])[1] ||
              (b.match(/<video:tag>([\s\S]*?)<\/video:tag>/) || [])[1] || '';
    var date = (b.match(/<video:publication_date>([\s\S]*?)<\/video:publication_date>/) || [])[1] || '';
    out.push({
      loc: _ctDecode(loc.trim()),
      title: _ctStripTags(title),
      video: _ctDecode(vid.trim()),
      thumb: _ctHostApex(_ctDecode(thumb.trim())),
      tag: _ctDecode(tag.trim()),
      date: date.trim()
    });
  }
}

function _ctLoadVideoEntries() {
  if (_ctVideoEntries && (Date.now() - _ctVideoEntriesTs) < CT_VIDEO_CACHE_TTL) return _ctVideoEntries;
  if (_ctVideoEntriesLoading) return _ctVideoEntries || [];
  _ctVideoEntriesLoading = true;
  var out = [];
  try {
    var indexXml = _ctGet(BASEURL + "/sitemap_index.xml");
    var parts = _ctExtractVideoSitemaps(indexXml);
    if (!parts.length) {
      parts = [
        BASEURL + "/video-sitemap.xml",
        BASEURL + "/video-sitemap2.xml",
        BASEURL + "/video-sitemap3.xml",
        BASEURL + "/video-sitemap4.xml"
      ];
    }
    CT_LOG("_ctLoadVideoEntries: " + parts.length + " sitemap files");
    for (var i = 0; i < parts.length; i++) {
      var xml = _ctGet(parts[i]);
      if (xml) _ctParseVideoSitemap(xml, out);
    }
    var idx = {};
    for (var n = 0; n < out.length; n++) {
      var key = _ctNorm(out[n].tag || "");
      if (!key) continue;
      (idx[key] || (idx[key] = [])).push(out[n]);
    }
    _ctVideoEntries = out;
    _ctVideoIndex = idx;
    _ctVideoEntriesTs = Date.now();
    CT_LOG("_ctLoadVideoEntries: " + out.length + " entries / " + Object.keys(idx).length + " series");
  } catch (e) {
    CT_LOG("_ctLoadVideoEntries err:", e && e.message || e);
    _ctVideoEntries = out;
  }
  _ctVideoEntriesLoading = false;
  return out;
}

/* Poster của series lấy từ vid_series-sitemap.xml (ảnh 16:9 gốc của series).
   Cache RAM theo slug; file chỉ ~9KB. */
var _ctSeriesPosterMap = null;
function _ctSeriesPoster(seriesUrl) {
  try {
    if (!_ctSeriesPosterMap) {
      _ctSeriesPosterMap = {};
      var xml = _ctGet(BASEURL + "/vid_series-sitemap.xml");
      var blocks = String(xml || "").match(/<url>[\s\S]*?<\/url>/g) || [];
      for (var i = 0; i < blocks.length; i++) {
        var loc = (blocks[i].match(/<loc>([\s\S]*?)<\/loc>/) || [])[1] || '';
        var img = (blocks[i].match(/<image:loc>([\s\S]*?)<\/image:loc>/) || [])[1] || '';
        if (!loc) continue;
        _ctSeriesPosterMap[_ctNorm(_ctSlugOf(_ctDecode(loc.trim())))] = _ctHostApex(_ctDecode(img.trim()));
      }
      CT_LOG("_ctSeriesPoster map=" + Object.keys(_ctSeriesPosterMap).length);
    }
    return _ctSeriesPosterMap[_ctNorm(_ctSlugOf(seriesUrl))] || "";
  } catch (e) { return ""; }
}

function _ctEpisodesOfSeries(seriesUrl) {
  var slugNorm = _ctNorm(_ctSlugOf(seriesUrl));
  _ctLoadVideoEntries();
  var list = (_ctVideoIndex && _ctVideoIndex[slugNorm]) || [];
  var eps = [];
  var tagName = "";
  for (var i = 0; i < list.length; i++) {
    var e = list[i];
    if (!e.video || !e.tag) continue;
    tagName = e.tag;
    var name = e.title;
    if (name && e.tag && name.length > e.tag.length + 3 &&
        name.slice(-(e.tag.length + 3)) === " - " + e.tag) {
      name = name.slice(0, name.length - (e.tag.length + 3));
    }
    eps.push({
      id: e.video,
      name: name || e.title,
      slug: "ep-" + (eps.length + 1),
      poster: e.thumb,
      date: e.date
    });
  }
  eps.sort(function (a, b) {
    if (a.date && b.date && a.date !== b.date) return a.date < b.date ? -1 : 1;
    return 0;
  });
  for (var k = 0; k < eps.length; k++) eps[k].slug = "ep-" + (k + 1);
  CT_LOG("_ctEpisodesOfSeries " + seriesUrl + " → " + eps.length + " tập (" + tagName + ")");
  return { name: tagName, episodes: eps };
}

// =============================================================================
// DETAIL PARSER
// =============================================================================
function parseMovieDetail(html, url) {
  /* getUrlDetail có thể trả JSON MovieDetail trực tiếp (series) → passthrough */
  var _htmlStr = String(html || "").trim();
  if (_htmlStr.indexOf('{"id"') === 0 && _htmlStr.indexOf('"servers"') > -1) {
    CT_LOG("parseMovieDetail: passthrough JSON detail");
    return _htmlStr;
  }

  var raw = String(url || "");
  var parts = raw.split('|');
  var cleanUrl = parts[0];
  var datasend = parts.slice(1).join('|').replace(/^data:/, '');
  try { if (datasend && datasend.indexOf('%') > -1) datasend = decodeURIComponent(datasend); } catch (e) {}
  CT_LOG("parseMovieDetail() url=" + cleanUrl.slice(0, 100) + " datasend=" + datasend.slice(0, 80) + " htmlLen=" + (html ? String(html).length : 0));

  try {
    // ===== SERIES (sitemap) =====
    var seriesUrl = datasend ? _ctDecode(datasend) : "";
    if (/\/serie\//i.test(seriesUrl)) {
      if (!seriesUrl) return JSON.stringify({ id: "", title: "Lỗi: thiếu series URL", servers: [] });
      var got = _ctEpisodesOfSeries(seriesUrl);
      var sname = got.name || _ctSlugOf(seriesUrl).replace(/-/g, ' ');
      var poster = _ctSeriesPoster(seriesUrl) || (got.episodes[0] && got.episodes[0].poster) || "";
      return JSON.stringify({
        id: seriesUrl,
        title: sname,
        originName: sname,
        posterUrl: poster,
        backdropUrl: poster,
        description: "",
        quality: "HD",
        year: "",
        rating: "",
        status: got.episodes.length + " episodes",
        episode_current: got.episodes.length + " episodes",
        servers: [{ name: sname || "Server", episodes: got.episodes.map(function (ep) {
          return { id: ep.id, name: ep.name, slug: ep.slug };
        }) }],
        duration: "", casts: "", director: "", country: "US", lang: "", category: "", extra: ""
      });
    }

    // ===== PHIM LẺ (WP REST) =====
    var j = _ctJson(html);
    if (!j) {
      CT_LOG("parseMovieDetail: body rỗng → tự fetch");
      j = _ctJson(_ctGet(cleanUrl));
    }
    var post = Array.isArray(j) ? j[0] : (j && j.id ? j : null);
    if (!post) {
      return JSON.stringify({ id: cleanUrl, title: "Không tải được chi tiết", servers: [] });
    }

    var item = _ctItemFromPost(post);
    var video = "";
    try { video = post.cmb2.video_player_settings.vm_video_url || ""; } catch (e) {}

    var eps = [];
    if (video) {
      eps.push({ id: video, name: item.title || "Full", slug: "full" });
    }

    return JSON.stringify({
      id: String(post.id || cleanUrl),
      title: item.title,
      originName: item.title,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      description: _ctStripTags(post.content && post.content.rendered) || item.description || "",
      quality: "MP4",
      year: item.year || "",
      rating: "",
      status: eps.length ? "1 episode" : "no stream",
      episode_current: eps.length ? "Full" : "",
      servers: [{ name: "TopCartoons", episodes: eps }],
      duration: "", casts: "", director: "", country: "US", lang: "English", category: "", extra: ""
    });
  } catch (e) {
    CT_LOG("parseMovieDetail[err]:", e && e.message || e);
    return JSON.stringify({ id: "error", title: "error", servers: [] });
  }
}

// =============================================================================
// STREAM PARSER
// =============================================================================
function parseDetailResponse(html, url) {
  var raw = String(url || "");
  var clean = raw.split('|')[0].split('#')[0];
  CT_LOG("parseDetailResponse() url=" + clean.slice(0, 120) + " htmlLen=" + (html ? String(html).length : 0));

  var headers = { "User-Agent": CT_UA };

  // URL đã là media (id tập = link mp4 từ sitemap / REST)
  if (/\.(mp4|m3u8)([?#]|$)/i.test(clean)) {
    return JSON.stringify({
      url: clean,
      mimeType: /\.m3u8([?#]|$)/i.test(clean) ? "application/x-mpegURL" : "video/mp4",
      isEmbed: false,
      headers: headers,
      subtitles: []
    });
  }

  // Body là JSON WP REST (phòng khi app gọi thẳng)
  var j = _ctJson(html);
  var post = Array.isArray(j) ? j[0] : (j && j.id ? j : null);
  if (post && post.cmb2 && post.cmb2.video_player_settings && post.cmb2.video_player_settings.vm_video_url) {
    var v = post.cmb2.video_player_settings.vm_video_url;
    return JSON.stringify({ url: v, mimeType: "video/mp4", isEmbed: false, headers: headers, subtitles: [] });
  }

  // Thử tìm mp4 trong HTML (trang detail nếu có)
  var m = String(html || '').match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/i);
  if (m) return JSON.stringify({ url: m[0], mimeType: "video/mp4", isEmbed: false, headers: headers, subtitles: [] });

  CT_LOG("parseDetailResponse: không tìm thấy stream");
  return JSON.stringify({ url: "", mimeType: "", isEmbed: false, headers: headers, subtitles: [] });
}

function parseEmbedResponse(html, url) {
  return parseDetailResponse(html, url);
}

// =============================================================================
// CATEGORIES (compat)
// =============================================================================
function getUrlCategories() { return BASEURL + "/vid_series-sitemap.xml"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function buildMenu(menuStr, type) {
  var arr = [];
  try { arr = JSON.parse(menuStr); } catch (e) { return []; }
  var out = [];
  if (!arr || !Array.isArray(arr)) return out;
  var t = type !== undefined ? String(type).trim() : undefined;
  for (var i = 0; i < arr.length; i++) {
    var it = arr[i];
    if (!it || !it.link || !it.name) continue;
    var link = String(it.link).trim(), name = String(it.name).trim();
    if (t === "false") out.push({ slug: link, title: name, type: "Horizontal" });
    else if (t === "true") out.push({ slug: link, title: name, type: "Grid" });
    else out.push({ slug: link, name: name });
  }
  return out;
}

function parseCategoriesResponse() {
  try { return JSON.stringify(buildMenu(getLISTmenu())); } catch (e) { return JSON.stringify([]); }
}
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }
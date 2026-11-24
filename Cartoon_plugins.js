// ===== TOPCARTOONS.TV VAX PLUGIN v2.0 =====
// Rewrite based on CloudStream 3 TopCartoons.cs3 approach.
// - List selectors: div.series-items a.series-item[href], .widget .post-listing-item a.blog-img[href], a.blog-img[data-post-id], h3.post-title a[href]
// - Detail: h1.entry-title + parseSeasonBlocks (regex season \d+)
// - Stream: og:video meta + "single_video_url" regex + Abyss/Hydrax embed (abysscdn.com, playhydrax.com, abyssplayer.com, zplayer.io)
// - Luôn dùng httpRequest() (đi qua vax.local native) khi HTML bị chặn/rỗng

var iddomain = "topcartoons";
BASEURL = "https://www.topcartoons.tv";
NEWDDOMAIN = false;
var popup_html = "";

var CT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function CT_LOG() {
  try { console.log.apply(console, ['[CartoonPlugin]'].concat([].slice.call(arguments))); } catch(e) {}
  try { if (typeof log === 'function') log('[CartoonPlugin] ' + [].slice.call(arguments).join(' ')); } catch(e) {}
}

CT_LOG("===== PLUGIN LOADED =====", BASEURL);

function _cartoonHeaders() {
  return "Referer=" + encodeURIComponent(BASEURL + "/") + "&Origin=" + encodeURIComponent(BASEURL) + "&User-Agent=" + encodeURIComponent(CT_UA);
}

// Fetch HTML qua httpRequest (vax.local native), có log. Trả string hoặc "".
function _ctFetch(url, opts) {
  CT_LOG("_ctFetch:", url);
  try {
    var clean = String(url || "").split('|')[0];
    if (!/^https?:/i.test(clean)) clean = BASEURL + clean;
    var res = httpRequest(clean, opts || { method: "GET", headers: { "Referer": BASEURL + "/", "Origin": BASEURL, "User-Agent": CT_UA } });
    CT_LOG("_ctFetch result: isSuccessful=" + (res && res.isSuccessful) + " status=" + (res && res.status) + " bodyLen=" + (res && res.body ? res.body.length : 0) + " deferred=" + (res && res.deferred));
    if (res && res.isSuccessful && res.body) return res.body;
    if (res && res.deferred) return ""; // sẽ fetch lại qua async prefetch
    return "";
  } catch (e) {
    CT_LOG("_ctFetch error:", e && e.message || e);
    return "";
  }
}

// ===== MANIFEST =====
function getManifest() {
  CT_LOG("getManifest() called");
  try {
    var manifest = {
      "id": "cartoon",
      "name": "Cartoon [ANIME]",
      "version": "2.0",
      "author": "VAX",
      "info": "Nguồn cartoon topcartoons.tv (Abyss/Hydrax stream).",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/cartoon.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": true,
      "type": "ANIME",
      "layoutType": "HORIZONTAL",
      "subtitleCat": true,
      "playerType": "exoplayer"
    };
    return JSON.stringify(manifest);
  } catch (e) {
    CT_LOG("getManifest error:", e);
    return JSON.stringify({ id: "loi", name: "Plugin lỗi: " + e, baseUrl: BASEURL });
  }
}

// ===== MENU =====
function getHomeSections() {
  CT_LOG("getHomeSections() called");
  var sections = [
    { slug: "/serie/", title: "Series", type: "Grid" },
    { slug: "/cartoons/category/cartoons/", title: "Cartoons", type: "Grid" }
  ];
  return JSON.stringify(sections);
}

function getLISTmenu() {
  return JSON.stringify([
    { link: "/serie/", name: "All Series" },
    { link: "/cartoons/category/cartoons/", name: "Cartoons" }
  ]);
}

// ===== URL BUILDERS =====
function getUrlList(slug, filtersJson) {
  CT_LOG("getUrlList() slug=" + slug + " filters=" + filtersJson);
  try {
    if (slug && slug.indexOf("http") === 0) return slug;
    var page = 1;
    var path = slug || "/serie/";
    if (filtersJson) {
      try {
        var f = JSON.parse(filtersJson);
        page = parseInt(f.page) || 1;
        if (f.category) path = Array.isArray(f.category) ? f.category[0].slug : f.category;
      } catch (e) { CT_LOG("getUrlList parse:", e); }
    }
    var url = BASEURL + (path.indexOf("/") === 0 ? "" : "/") + path;
    if (page > 1) url = url.replace(/\/?$/, "/") + "page/" + page + "/";
    var clean = url.replace(/([^:]\/)\/+/g, "$1");
    var result = clean + "|" + _cartoonHeaders();
    CT_LOG("getUrlList returning:", result);
    return result;
  } catch (e) {
    CT_LOG("getUrlList[err]:", e);
    return BASEURL + "/serie/|" + _cartoonHeaders();
  }
}

function getUrlSearch(keyword, filtersJson) {
  CT_LOG("getUrlSearch() keyword=" + keyword);
  try {
    var kw = encodeURIComponent(keyword || "");
    return BASEURL + "/?s=" + kw + "|" + _cartoonHeaders();
  } catch (e) {
    CT_LOG("getUrlSearch[err]:", e);
    return BASEURL + "/?s=" + encodeURIComponent(keyword || "") + "|" + _cartoonHeaders();
  }
}

function getUrlDetail(slug) {
  CT_LOG("getUrlDetail() slug=" + slug);
  if (!slug) return "";
  if (slug.indexOf("http") === 0) return slug;
  var url = BASEURL + "/" + slug.replace(/^\//, "");
  return url + "|" + _cartoonHeaders();
}

// ===== HELPERS SELECTOR =====
function _getAttr($el, sel, attr) {
  if (!$el || !$el.length) return "";
  var v = $el.attr(attr) || "";
  return v;
}

// Lấy poster: ưu tiên srcset (lấy URL lớn nhất), rồi data-src, rồi src
function _imgPoster($img) {
  if (!$img || !$img.length) return "";
  var srcset = _getAttr($img, null, "srcset") || "";
  if (srcset && srcset.indexOf(",") > -1) {
    var best = "";
    var parts = srcset.split(",");
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim().split(/\s+/)[0];
      if (p && /^https?:/i.test(p)) best = p;
    }
    if (best) return best;
  }
  var one = srcset ? srcset.split(",")[0].trim().split(/\s+/)[0] : "";
  return one || _getAttr($img, null, "data-src") || _getAttr($img, null, "src") || _getAttr($img, null, "data-lazy-src") || "";
}

// ===== LIST PARSER =====
function parseListResponse(html, url) {
  CT_LOG("parseListResponse() called url=" + url + " htmlLen=" + (html ? html.length : 0));
  try {
    if (!html || typeof html !== 'string' || html.length < 100) {
      CT_LOG("parseListResponse: HTML rỗng/bị chặn, tải lại bằng httpRequest");
      var cleanUrl = url ? url.split('|')[0] : (BASEURL + "/serie/");
      html = _ctFetch(cleanUrl);
      if (!html || typeof html !== 'string' || html.length < 100) {
        CT_LOG("parseListResponse: vẫn rỗng sau khi httpRequest");
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
      }
      CT_LOG("parseListResponse: httpRequest OK len=" + html.length);
    }
    CT_LOG("parseListResponse: HTML preview: " + String(html).slice(0, 400));

    var $doc = _$(html);
    var items = [];
    var seen = {};

    function pushItem(href, title, poster) {
      if (!href || !title || seen[href]) return;
      if (/^(#|javascript:|mailto:)/i.test(href)) return;
      seen[href] = 1;
      // Normalize href
      if (href.indexOf("http") !== 0) href = BASEURL + (href.indexOf("/") === 0 ? "" : "/") + href;
      if (poster && poster.indexOf("http") !== 0) poster = BASEURL + (poster.indexOf("/") === 0 ? "" : "/") + poster;
      items.push({
        id: href,
        title: title,
        quality: "HD",
        episode_current: "",
        posterUrl: poster,
        backdropUrl: poster,
        year: "",
        lang: "English ESub"
      });
    }

    // 1. Style "series items" : div.series-items a.series-item[href]
    var $seriesItems = $doc.find("a.series-item[href]");
    CT_LOG("parseListResponse: a.series-item count=" + $seriesItems.length);
    $seriesItems.each(function() {
      var href = this.attr("href") || "";
      var title = (this.attr("title") || this.text().trim() || "").trim();
      if (!title) {
        // tìm img src trong thẻ
        var $im = this.find("img").first();
        title = this.attr("title") || $im.attr("alt") || "";
      }
      var poster = _imgPoster(this.find("img").first());
      pushItem(href, title, poster);
    });

    // 2. Style "post listing": .widget .post-listing-item a.blog-img[href]
    var $blogImgs = $doc.find("a.blog-img[href]");
    CT_LOG("parseListResponse: a.blog-img count=" + $blogImgs.length);
    $blogImgs.each(function() {
      var href = this.attr("href") || "";
      var $im = this.find("img").first();
      var title = $im.attr("alt") || this.attr("title") || "";
      var poster = _imgPoster($im);
      if (!title && this.attr("data-post-id")) {
        // try h3.post-title bên trong parent
        var parent = this;
        // fallback: tìm sibling
        var $parentEl = new this.constructor([this.elements[0]], this.nodes);
        var $pt = $parentEl.parent().find("h3.post-title a[href]");
        if ($pt.length) title = $pt.text().trim();
      }
      pushItem(href, title, poster);
    });

    // 3. Style "post title": h3.post-title a[href]
    if (!items.length) {
      var $postTitle = $doc.find("h3.post-title a[href]");
      CT_LOG("parseListResponse: h3.post-title count=" + $postTitle.length);
      $postTitle.each(function() {
        var href = this.attr("href") || "";
        var title = this.text().trim();
        var poster = "";
        // tìm img trong các thẻ lân cận
        pushItem(href, title, poster);
      });
    }

    // 4. Fallback generic: article/post-item + entry-title a
    if (!items.length) {
      CT_LOG("parseListResponse: fallback generic post-item");
      $doc.find("article.post-item, .post-item").each(function() {
        var $art = this;
        var $link = $art.find("a[href]").first();
        var href = $link.attr("href") || "";
        var title = $art.find("h3.entry-title a").text().trim() || $link.attr("title") || "";
        var poster = $art.find("img").first() ? _imgPoster($art.find("img").first()) : "";
        pushItem(href, title, poster);
      });
    }

    // Pagination
    var currentPage = 1;
    var totalPages = 9999;
    var urlClean = String(url || "").split('|')[0];
    if (urlClean.indexOf("/serie/") > -1) totalPages = 1;
    var $nav = $doc.find(".blog-pagination .wp-pagenavi, .blog-pagination");
    if ($nav.length) {
      var $cur = $nav.find(".current").first();
      if ($cur.length) currentPage = parseInt($cur.text()) || 1;
      var $last = $nav.find("a.page-numbers").last();
      if ($last.length) {
        var m2 = ($last.attr("href") || "").match(/page[/=](\d+)/);
        if (m2) totalPages = parseInt(m2[1], 10);
      }
    }

    CT_LOG("parseListResponse: RETURN " + items.length + " items (page " + currentPage + "/" + totalPages + ")");
    if (items.length && items[0]) CT_LOG("parseListResponse: first=" + items[0].title + " | " + items[0].id.slice(0, 90));
    return JSON.stringify({
      items: items,
      pagination: { currentPage: currentPage, totalPages: totalPages }
    });
  } catch (e) {
    CT_LOG("parseListResponse[err]:", e && e.message || e);
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(html, url) {
  CT_LOG("parseSearchResponse() called");
  return parseListResponse(html, url);
}

// ===== DETAIL PARSER (trang series) =====
function parseMovieDetail(html, url) {
  CT_LOG("parseMovieDetail() called url=" + url + " htmlLen=" + (html ? html.length : 0));
  try {
    if (!html || typeof html !== 'string' || html.length < 100) {
      CT_LOG("parseMovieDetail: HTML rỗng/bị chặn, tải lại");
      var cleanUrl = url ? url.split('|')[0] : BASEURL;
      html = _ctFetch(cleanUrl);
      if (!html || typeof html !== 'string' || html.length < 100) {
        CT_LOG("parseMovieDetail: vẫn rỗng");
        return JSON.stringify({ id: url, title: "error", servers: [{ name: "Error", episodes: [] }] });
      }
    }
    CT_LOG("parseMovieDetail: HTML preview: " + String(html).slice(0, 400));
    var $doc = _$(html);

    var title = $doc.find("h1.entry-title").first().text().trim()
             || $doc.find('meta[property="og:title"]').attr("content") || "";

    // Poster: header-img img / single-feature-image img / og:image
    var poster = _imgPoster($doc.find("*.header-img img, .single-feature-image img").first());
    if (!poster) poster = $doc.find('meta[property="og:image"]').attr("content") || "";

    var description = $doc.find(".entry-content, .series-description, .movie-desc").first().text().trim();

    var episodes = [];
    var numbermv = 0;
    var titless = $doc.find('meta[property="og:title"]').attr("content") || title || "";

    // ---- parseSeasonBlocks: tìm heading chứa "Season N" / "Movie" / "Cartoons", rồi episodes bên dưới ----
    var $headings = $doc.find(".archive-heading, h2, h3, h4");
    CT_LOG("parseMovieDetail: scan " + $headings.length + " heading candidates");
    $headings.each(function(index) {
      var $h = this;
      var htext = $h.text().trim();
      if (!htext) return;
      var isSeason = /season\s*(\d+)/i.test(htext);
      var isMovie = /movie|film|bản movie|movies/i.test(htext);
      var isEpisodeHeading = /episode|all episodes|tập|episodes/i.test(htext);
      if (!isSeason && !isMovie && !isEpisodeHeading) return;
      CT_LOG("parseMovieDetail: heading text='" + htext.slice(0, 60) + "' season=" + isSeason + " movie=" + isMovie);

      // season number
      var seasonNum = 1;
      var sm = htext.match(/season\s*(\d+)/i);
      if (sm) seasonNum = parseInt(sm[1], 10) || 1;
      if (isMovie) { numbermv++; seasonNum = numbermv; }

      var namess = htext.replace(/season\s*(\d+)/i, "Phần $1").replace(/(?:movie|films?)/i, "Bản Movie").replace(/cartoons?/i, "").trim() || "Tập";

      // Episodes = các link blog-img / video-thumb sau heading
      var $box = $h.next();
      if (!$box || !$box.length) {
        // fallback sibling
        var el = $h.elements && $h.elements[0];
        if (el && $h.nodes && el.parentId) {
          var parent = $h.nodes[el.parentId];
          if (parent && parent.childrenIds) {
            var idx = parent.childrenIds.indexOf(el.id);
            if (idx !== -1 && idx + 1 < parent.childrenIds.length) {
              var nx = $h.nodes[parent.childrenIds[idx + 1]];
              if (nx && nx.tag !== "#text") $box = new $h.constructor([nx], $h.nodes);
            }
          }
        }
      }
      if (!$box || !$box.length) return;

      var $eps = $box.find("a.blog-img[href], a[href*='/watch/'], a[href*='episode'], a.series-item[href]");
      var _epCount = $eps.length;
      CT_LOG("parseMovieDetail: found " + _epCount + " episode links under heading");
      $eps.each(function(idx) {
        var link = this.attr("href") || "";
        if (!link || /^(#|javascript:)/i.test(link)) return;
        var epTitle = this.attr("title") || (this.find ? this.find("img").first().attr("alt") : "") || ("Tập " + (idx + 1));
        var epNum = idx + 1;
        var typeStr = isMovie ? "movie" : "tv";
        var id = link + "&season=" + seasonNum + "&episode=" + epNum + "&namemv=" + encodeURIComponent(titless) + "&type=" + typeStr;
        var name = (isMovie ? "Bản Movie: " : "Phần " + seasonNum + " Tập " + epNum + " - ") + epTitle;
        var slug = isMovie ? ("mv-" + numbermv) : ("ss-" + seasonNum + "-ep-" + epNum);
        episodes.push({ id: id, name: name, slug: slug });
      });
    });

    if (!episodes.length) {
      // Fallback: mọi link chứa /serie/ và có vẻ là episode (blog-img trên trang detail)
      CT_LOG("parseMovieDetail: no season blocks, fallback scan all blog-img");
      $doc.find("a.blog-img[href]").each(function(idx) {
        var link = this.attr("href") || "";
        if (!link || /^(#|javascript:)/i.test(link)) return;
        var epTitle = this.attr("title") || (this.find ? this.find("img").first().attr("alt") : "") || ("Tập " + (idx + 1));
        var id = link + "&season=1&episode=" + (idx + 1) + "&namemv=" + encodeURIComponent(titless) + "&type=tv";
        episodes.push({ id: id, name: "Tập " + (idx + 1) + " - " + epTitle, slug: "ep-" + (idx + 1) });
      });
    }

    CT_LOG("parseMovieDetail: TOTAL episodes=" + episodes.length + " title=" + title);
    var servers = [{ name: "Server", episodes: episodes }];
    return JSON.stringify({
      id: url, title: title, originName: title,
      posterUrl: poster, backdropUrl: poster,
      description: description, quality: "HD", year: "",
      rating: "", status: episodes.length + " episodes", category: "",
      episode_current: episodes.length + " episodes",
      servers: servers, duration: "", casts: "", director: "",
      country: "US", lang: "", extra: ""
    });
  } catch (e) {
    CT_LOG("parseMovieDetail[err]:", e && e.message || e);
    return JSON.stringify({ id: "error", title: "error", description: url + "\n" + e, servers: [{ name: "Error", episodes: [] }] });
  }
}

// ===== STREAM PARSER =====
function parseDetailResponse(html, url) {
  CT_LOG("parseDetailResponse() called url=" + url + " htmlLen=" + (html ? html.length : 0));
  // Trang embed có thể rất ngắn (chỉ 1 iframe) → ngưỡng thấp hơn
  if (!html || typeof html !== 'string' || html.length < 20) {
    CT_LOG("parseDetailResponse: HTML rỗng/bị chặn, tải lại");
    var cleanUrl = url ? url.split('|')[0] : "";
    if (cleanUrl && /^https?:/i.test(cleanUrl)) {
      html = _ctFetch(cleanUrl);
      if (html && html.length > 20) CT_LOG("parseDetailResponse: httpRequest OK len=" + html.length);
    }
  }
  if (!html || typeof html !== 'string' || html.length < 20) {
    CT_LOG("parseDetailResponse: vẫn rỗng, trả blank");
    return JSON.stringify({ url: "", mimeType: "", isEmbed: false, headers: {}, subtitles: [] });
  }
  CT_LOG("parseDetailResponse: HTML preview: " + String(html).slice(0, 500));
  try {
    var season = getparam(url, "season");
    var episode = getparam(url, "episode");
    var type = getparam(url, "type");
    var namemv = getparam(url, "namemv");

    var subtitleList = [];
    var stream = "";
    var mimeType = "video/mp4";
    var isEmbed = false;
    var embedReferer = BASEURL + "/";

    // 1. og:video meta (ưu tiên cao)
    var $doc = _$(html);
    var ogVideo = $doc.find('meta[property="og:video:url"]').attr("content")
               || $doc.find('meta[property="og:video"]').attr("content");
    if (ogVideo) {
      stream = ogVideo;
      if (/\.m3u8/i.test(stream)) {
        mimeType = "application/x-mpegURL";
      } else if (/abysscdn\.com|playhydrax\.com|abyssplayer\.com|zplayer\.io|player-cdn\.com|hydrax/i.test(stream)) {
        // Abyss/Hydrax embed → VAX View HydraxSupport sẽ unwrap
        mimeType = "";
        isEmbed = true;
      } else {
        mimeType = "video/mp4";
      }
      CT_LOG("parseDetailResponse: og:video = " + stream.slice(0, 120) + " isEmbed=" + isEmbed);
    }

    // 2. single_video_url regex ("single_video_url":"...")
    if (!stream) {
      var sv = String(html).match(/"single_video_url"\s*:\s*"([^"]+)"/i);
      if (sv) {
        stream = sv[1];
        if (/abysscdn\.com|playhydrax\.com|abyssplayer\.com|zplayer\.io|player-cdn\.com|hydrax/i.test(stream)) {
          mimeType = "";
          isEmbed = true;
        } else if (/\.m3u8/i.test(stream)) {
          mimeType = "application/x-mpegURL";
        } else {
          mimeType = "video/mp4";
        }
        CT_LOG("parseDetailResponse: single_video_url = " + stream.slice(0, 120) + " isEmbed=" + isEmbed);
      }
    }

    // 3. video/source
    if (!stream) {
      var $src = $doc.find("video source[src], video[src]").first();
      if ($src && $src.length) {
        stream = $src.attr("src") || $src.attr("data-src") || "";
        if (stream) CT_LOG("parseDetailResponse: video/source = " + stream.slice(0, 120));
      }
    }

    // 4. regex m3u8
    if (!stream) {
      var m3u8 = String(html).match(/https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/i);
      if (m3u8) { stream = m3u8[0]; mimeType = "application/x-mpegURL"; CT_LOG("parseDetailResponse: m3u8 regex = " + stream.slice(0, 120)); }
    }

    // 5. regex mp4
    if (!stream) {
      var mp4 = String(html).match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/i);
      if (mp4) { stream = mp4[0]; CT_LOG("parseDetailResponse: mp4 regex = " + stream.slice(0, 120)); }
    }

    // 6. iframe embed (Abyss/Hydrax chủ yếu)
    if (!stream) {
      var iframe = String(html).match(/<iframe[^>]+src\s*=\s*["']([^"']+)["']/i);
      if (iframe) {
        stream = iframe[1];
        isEmbed = true;
        mimeType = "";
        CT_LOG("parseDetailResponse: iframe embed = " + stream.slice(0, 150));
      }
    }

    // 7. a[href] trỏ tới player (video-watch link)
    if (!stream) {
      var links = $doc.find("a[href]");
      var foundPlayer = "";
      links.each(function() {
        var h = this.attr("href") || "";
        if (/abysscdn\.com|playhydrax\.com|abyssplayer\.com|zplayer\.io|player-cdn\.com|\.m3u8|\.mp4/i.test(h)) {
          foundPlayer = h;
        }
      });
      if (foundPlayer) {
        stream = foundPlayer;
        isEmbed = /abysscdn|hydrax|abyss|zplayer|player-cdn/i.test(stream);
        if (/\.m3u8/i.test(stream)) { mimeType = "application/x-mpegURL"; isEmbed = false; }
        else if (isEmbed) mimeType = "";
        else mimeType = "video/mp4";
        CT_LOG("parseDetailResponse: player link = " + stream.slice(0, 150));
      }
    }

    // Headers chuẩn
    var headers = {
      "User-Agent": CT_UA,
      "Referer": embedReferer,
      "Origin": BASEURL,
      "Block-Ads": false,
      "Block-Css": ""
    };

    var result = JSON.stringify({ url: stream, mimeType: mimeType, isEmbed: isEmbed, headers: headers, subtitles: subtitleList });
    CT_LOG("parseDetailResponse: RETURN stream='" + stream.slice(0, 100) + "' mime=" + mimeType + " isEmbed=" + isEmbed);
    return result;
  } catch (e) {
    CT_LOG("parseDetailResponse[err]:", e && e.message || e);
    return JSON.stringify({ url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", mimeType: "video/mp4", isEmbed: false, headers: {}, subtitles: [] });
  }
}

function parseEmbedResponse(html, url) {
  CT_LOG("parseEmbedResponse() called");
  return parseDetailResponse(html, url);
}

// ===== HELPERS =====
function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function buildMenu(menuStr, type) {
  var arr = JSON.parse(menuStr);
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
  try { return JSON.stringify(buildMenu(getLISTmenu())); }
  catch (e) { return JSON.stringify([]); }
}
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

function getPrimaryCategories() {
  try { return JSON.stringify(buildMenu(getLISTmenu())); }
  catch (e) { return JSON.stringify([]); }
}
function getFilterConfig() {
  try { return JSON.stringify({ category: buildMenu(getLISTmenu()) }); }
  catch (e) { return JSON.stringify({ category: [] }); }
}
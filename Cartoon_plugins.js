// ===== TOPCARTOONS.TV VAX PLUGIN =====
var iddomain = "topcartoons";
BASEURL = "https://www.topcartoons.tv";
NEWDOMAIN = false;
var popup_html = "";

// ===== MANIFEST =====
function getManifest() {
  try {
    return JSON.stringify({
      "id": "cartoon",
      "name": "Cartoon [ANIME]",
      "version": "1.2",
      "author": "you",
      "info": "Nguồn cartoon kinh điển từ.",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/cartoon.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": true,
      "type": "ANIME",
      "layoutType": "HORIZONTAL",
      "subtitleCat": true,
      "playerType": "exoplayer"
    });
  } catch (e) {
    return JSON.stringify({ id: "loi", name: "Plugin lỗi: " + e, baseUrl: BASEURL });
  }
}

// ===== MENU =====
function getHomeSections() {
  return JSON.stringify([
    { slug: "/serie/", title: "Series", type: "Grid" },
    { slug: "/cartoons/category/cartoons/", title: "Cartoons", type: "Grid" }
  ]);
}

function getLISTmenu() {
  return JSON.stringify([
    { link: "/serie/", name: "All Series" },
    { link: "/cartoons/category/cartoons/", name: "Cartoons" }
  ]);
}

// ===== URL BUILDERS =====
function getUrlList(slug, filtersJson) {
  try {
    if (slug && slug.indexOf("http") === 0) return slug;
    var page = 1;
    var path = slug || "/serie/";
    if (filtersJson) {
      var fixed = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
      try {
        var f = JSON.parse(fixed);
        page = parseInt(f.page) || 1;
        if (f.category) path = Array.isArray(f.category) ? f.category[0].slug : f.category;
      } catch (e) { log("getUrlList parse: " + e); }
    }
    var url = BASEURL + (path.indexOf("/") === 0 ? "" : "/") + path;
    if (page > 1) {
      // WordPress archive pagination: /serie/page/2/
      url = url.replace(/\/?$/, "/") + "page/" + page + "/";
    }
    return url.replace(/([^:]\/)\/+/g, "$1");
  } catch (e) {
    log("getUrlList[err]: " + e);
    return BASEURL + "/serie/";
  }
}

function getUrlSearch(keyword, filtersJson) {
  try {
    var kw = encodeURIComponent(keyword || "");
    // WordPress search: ?s=keyword
    return BASEURL + "/?s=" + kw;
  } catch (e) {
    log("getUrlSearch[err]: " + e);
    return BASEURL;
  }
}

function getUrlDetail(slug) {
  if (!slug) return "";
  if (slug.indexOf("http") === 0) return slug;
  return BASEURL + "/" + slug.replace(/^\//, "");
}

// ===== LIST PARSER (dùng cho archive + search) =====
function parseListResponse(html, url) {
  try {
    var $doc = _$(html);
    var items = [];

    // Selector từ HTML bạn cung cấp:
    // <article class="post-item ...">
    //   <a class="blog-img" href="..."> <img data-src="...">
    //   <h3 class="entry-title"><a href="...">Title</a></h3>
    //   <span class="playlist-count">N Videos</span>
    $doc.find("article.post-item").each(function () {
      var $art = this;
      var $link = $art.find("a.blog-img").first();
      var href = $link.attr("href") || "";
      if (!href) return;

      var title = $art.find("h3.entry-title a").text().trim() || $link.attr("title") || "";
      var poster = $art.find("img.blog-picture").attr("data-src")
                || $art.find("img.blog-picture").attr("src") || "";
      if (poster && poster.indexOf("http") !== 0) poster = BASEURL + poster;

      var videoCount = $art.find(".playlist-count span").last().text().trim() || "";
      var episodeCurrent = videoCount.replace(/\s*Videos?/i, "").trim();

      items.push({
        id: href,
        title: title,
        quality: "HD",
        episode_current: episodeCurrent ? episodeCurrent + " videos" : "",
        posterUrl: poster,
        backdropUrl: poster,
        year: "",
        lang: "English ESub"
      });
    });

    // Pagination
    var currentPage = 1;
    var totalPages = 9999;
    if(url.indexOf("/serie/") > -1){
      totalPages = 1;
    }
    
    var $nav = $doc.find(".blog-pagination .wp-pagenavi, .blog-pagination");
    if ($nav.length) {
      var $cur = $nav.find(".current").first();
      if ($cur.length) currentPage = parseInt($cur.text()) || 1;
      var $last = $nav.find("a.page-numbers").last();
      if ($last.length) {
        var m = ($last.attr("href") || "").match(/page[/=](\d+)/);
        if (m) totalPages = parseInt(m[1]);
      }
    }

    return JSON.stringify({
      items: items,
      pagination: { currentPage: currentPage, totalPages: totalPages }
    });
  } catch (e) {
    log("parseListResponse[err]: " + e);
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(html, url) {
  return parseListResponse(html, url);
}

// ===== DETAIL PARSER (trang series) =====
// Trang chi tiết series trên topcartoons.tv chứa danh sách các tập.
// Cấu trúc thường là: một playlist các video, mỗi video có link riêng.
function parseMovieDetail(html, url) {
  try {
    var $doc = _$(html);

    var title = $doc.find("h1.entry-title, h1.movie-title, .single-title h1").first().text().trim();
    var poster = $doc.find(".poster img, .single-poster img").first().attr("data-src")
              || $doc.find(".poster img, .single-poster img").first().attr("src") || "";
    if (poster && poster.indexOf("http") !== 0) poster = BASEURL + poster;

    var description = $doc.find(".entry-content, .movie-desc, .description").first().text().trim();
    var res = httpRequest("https://trans.alokillgtv02.workers.dev/?text="+encodeURI(description)+"&sl=auto&tl=vi", {method: "GET"});
    
    description = res.body;
    var servers = [];
    var episodes = [];
    var numbermv = 0;
    var titless = $doc.find("title").text().match(/([^\|]+)\|/i)[1];
    $doc.find(".archive-heading").each(function(index, item) {
        var $box = this.next();
        var namess = this.find("span").text();
        var typetv = true;
    
        namess = namess.replace(/season/i, "Phần").replace(/movie/i, "Bản Movie").replace(/cartoons/i, "");
        if (namess.match(/movie/i)) {
            typetv = false;
            numbermv++
        }
        var numberss = (index + 1);
        $box.find(".blog-img").each(function(index2, item2) {
            var link = this.attr("href");
            var name = this.attr("title");
            var number = (index2 + 1);
            if (typetv) {
                var id = link + "&season=" + numberss + "&episode=" + number + "&namemv=" + encodeURIComponent(titless) + "&type=tv";
                name = namess + " Tập " + number + " - " + name;
                var slug = "ss-" + numberss + "-ep-" + number;
            } else {
                var id = link + "&season=" + numberss + "&episode=" + number + "&namemv=" + encodeURIComponent(name) + "&type=movie";
                name = "Bản Movie: " + name;
                var slug = "mv-" + numbermv;
    
            }
            episodes.push({
                id: id,
                name: name,
                slug: slug
            })
        })
    })
    servers.push({
        name: "Server",
        episodes: episodes
    })

    return JSON.stringify({
      id: url,
      title: title,
      originName: title,
      posterUrl: poster,
      backdropUrl: poster,
      description: description,
      quality: "HD",
      year: "",
      rating: "",
      status: episodes.length + " episodes",
      category: "",
      episode_current: episodes.length + " episodes",
      servers: servers,
      duration: "",
      casts: "",
      director: "",
      country: "US",
      lang: "",
      extra: ""
    });
  } catch (e) {
    log("parseMovieDetail[err]: " + e);
    return JSON.stringify({
      id: "error", title: "error",
      description: url + "\n" + e,
      servers: [{ name: "Error", episodes: [] }]
    });
  }
}

// ===== STREAM PARSER =====
// Từ script gốc của ToonHub, ta biết topcartoons.tv nhúng link video
// trong thẻ <meta property="og:video:url" content="...">
function parseDetailResponse(html, url) {
  console.log("parseDetailResponse: " + url);
  try {
    var season = getparam(url,"season");
    var episode = getparam(url,"episode");
    var type = getparam(url,"type");
    var namemv = getparam(url,"namemv").replace(/\s+$/,"");
    // https://getsubtitle.alokillgtv.workers.dev/?title=iron+man+3&debug=exciter150
    if(type == "tv"){
       var getsub = "https://getsubtitle.alokillgtv.workers.dev/?title="+encodeURI(namemv)+"&season=" + season + "&episode=" + episode;
      console.log("getsub:\n" + getsub)
       var res = httpRequest(getsub, {
         method: "GET",
         "headers":{
          "X-VAX-YB": "deo_co_gi_de_coi"
        }
       });
    } else{
      var getsub = "https://getsubtitle.alokillgtv.workers.dev/?title="+encodeURI(namemv);
      console.log("getsub:\n" + getsub)
      var res = httpRequest(getsub, {
         method: "GET",
         "headers":{
          "X-VAX-YB": "deo_co_gi_de_coi"
        }
       });
      
    }
        var rawParsed = null;
        try {
            rawParsed = (typeof html === "object") ? html : JSON.parse(res.body);
        } catch (eJson) {
            console.log("Không thể parse JSON Subtitles:", eJson);
        }

        var subtitlesData = [];
        if (Array.isArray(rawParsed)) {
            subtitlesData = rawParsed;
        } else if (rawParsed && Array.isArray(rawParsed.subtitles)) {
            subtitlesData = rawParsed.subtitles;
        } else if (rawParsed && Array.isArray(rawParsed.subs)) {
            subtitlesData = rawParsed.subs;
        }

        // 3. Map danh sách phụ đề
        var subtitleList = [];
        subtitlesData.forEach(function(item) {
            var itemUrl = item.url || item.file || item.src || "";
            var sname = item.name || item.display || item.label || "Subtitle";
            if (!itemUrl) return;
            if (sname.match(/english|eng/i)){
              itemUrl = "https://trans.alokillgtv02.workers.dev/?sub_url="+BASE64.encode(itemUrl)+"&sl=auto&tl=vi&cache=false";
              item.mimetype = "text/vtt"
              console.log("dịch subeng:\n" + itemUrl);
              sname = "[4. AI] Vietsub"
            }
            subtitleList.push({
                lang: sname,
                url: itemUrl,
                mimeType: item.mimetype || item.mimeType || "text/vtt"
            });
        });

        // 4. Sắp xếp ưu tiên phụ đề
        function getSubtitlePriority(langName) {
            var str = String(langName || "").toUpperCase();

            if (str.indexOf("VAX") > -1 && str.indexOf("ENGLISH") === -1) return 1;
            if (str.indexOf("WYZIE") > -1 && str.indexOf("ENGLISH") === -1) return 2;
            if ((str.indexOf("OPENSUB") > -1 || str.indexOf("SHEGUST") > -1) && str.indexOf("AI") === -1 && str.indexOf("ENGLISH") === -1) return 3;
            if (str.indexOf("AI") > -1) return 4;
            if (str.indexOf("ENGLISH") > -1 || str.indexOf("ENG") > -1) return 5;

            return 6;
        }

        subtitleList.sort(function(a, b) {
            return getSubtitlePriority(a.lang) - getSubtitlePriority(b.lang);
        });
      console.log("subtile tìm được\n" + res.body)
    
    var stream = "";
    var mimeType = "video/mp4";
    var isEmbed = false;

    // 1. Meta og:video:url (cách chính của topcartoons.tv)
    var $doc = _$(html);
    var ogVideo = $doc.find('meta[property="og:video:url"]').attr("content")
               || $doc.find('meta[property="og:video"]').attr("content");
    if (ogVideo) {
      stream = ogVideo;
      mimeType = stream.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4";
      console.log("Found og:video:url = " + stream);
    }

    // 2. Nếu không có, tìm trong thẻ video / source
    if (!stream) {
      var $src = $doc.find("video source, video[src]").first();
      if ($src.length) {
        stream = $src.attr("src") || $src.attr("data-src") || "";
        mimeType = stream.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4";
      }
    }

    // 3. Regex tìm m3u8 / mp4 trong HTML
    if (!stream) {
      var m3u8 = html.match(/https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/i);
      if (m3u8) { stream = m3u8[0]; mimeType = "application/x-mpegURL"; }
    }
    if (!stream) {
      var mp4 = html.match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/i);
      if (mp4) { stream = mp4[0]; mimeType = "video/mp4"; }
    }

    // 4. Nếu là iframe → embed
    if (!stream) {
      var iframe = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      if (iframe) {
        return JSON.stringify({
          url: iframe[1],
          mimeType: "",
          isEmbed: true,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASEURL,
            "Origin": BASEURL
          },
          subtitles: subtitleList
        });
      }
    }

    // 5. Subtitles (nếu có track)
    var subs = [];
    $doc.find("track[kind='subtitles'], track[kind='captions']").each(function () {
      var src = this.attr("src");
      var lang = this.attr("srclang") || "en";
      if (src) {
        if (src.indexOf("http") !== 0) src = BASEURL + src;
        subs.push({ lang: lang, url: src });
      }
    });

    return JSON.stringify({
      url: stream,
      mimeType: mimeType,
      isEmbed: isEmbed,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": BASEURL,
        "Origin": BASEURL,
        "Block-Ads": false,
        "Block-Css": ""
      },
      subtitles: subtitleList
    });
  } catch (e) {
    log("parseDetailResponse[err]: " + e);
    return JSON.stringify({
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
      mimeType: "video/mp4",
      isEmbed: false,
      headers: {},
      subtitles: subtitleList
    });
  }
}

function parseEmbedResponse(html, url) {
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

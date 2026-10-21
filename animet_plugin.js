// =============================================================================
// PLUGIN: animesub.site — AnimeSub (DEBUG + HYBRID PLAYER)
// =============================================================================
var iddomain = "animet"
BASEURL = "https://animesub.site";
NEWDOMAIN = true;
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function log(msg) {
  try { console.log("[" + BASEURL + "] " + msg); } catch (e) {}
}

function preview(s, n) {
  if (!s) return "(EMPTY)";
  s = String(s).replace(/[\r\n\t]+/g, " ");
  return s.length > n ? s.substring(0, n) + "... [len=" + s.length + "]" : s + " [len=" + s.length + "]";
}

// =============================================================================
// MANIFEST — đổi sang embedtoexoplay để EmbedSniffer hoạt động cho SSPlay
// =============================================================================
function getManifest() {
  return JSON.stringify({
    "id": "animet",
    "name": "Animet [ANIME]",
    "description": "Trang anime vietsub khá nổi tiếng.",
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/animet.png",
    "version": "1.0.1",
    "info":"Animet tổng hợp nhiều phim anime khá hay. Chặn quảng cáo tuyệt đối từ cái trang này nhé.",
    "author": "alokillgtv",
    "baseUrl": BASEURL,
    "isEnabled": true,
    "adblock": false,
    "type": "ANIME",
    "layoutType": "VERTICAL",
    "playerType": "embedtoexoplay",   // ⭐ Đổi để EmbedSniffer bật cho SSPlay
    "debug": true
  });
}
// https://animesub.site/bang-xep-hang/day.html
function getHomeSections() {
  return JSON.stringify([
     {"slug": "/bang-xep-hang/day.html","title": "Top Trong Ngày","type": "Horizontal"},
     {"slug": "/quoc-gia/trung-quoc.html","title": "Hoạt Hình Trung Quốc","type": "Horizontal"},
    { "slug": "/danh-sach/phim-moi-cap-nhat.html", "title": "Mới Cập Nhật", "type": "Grid" }
  ]);
}

if (NEWDOMAIN) {
    if (typeof httpRequest === "function") {
        var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {
            method: "POST"
        });
        if (res && res.isSuccessful) {
            var resobj = JSON.parse(res.body);
            if (resobj[iddomain]) {
                BASEURL = resobj[iddomain].new;
            }
        } 
    } 
} 
BASELINK = BASEURL;
console.log("BASEURL " + BASEURL);

function getLISTmenu() {
    try{
      return `[{
    "link": "/the-loai/seinen.html",
    "name": "Seinen"
}, {
    "link": "/the-loai/ac-quy.html",
    "name": "Ác Quỷ"
}, {
    "link": "/the-loai/adult-cast.html",
    "name": "Adult Cast"
}, {
    "link": "/the-loai/am-nhac.html",
    "name": "Âm Nhạc"
}, {
    "link": "/the-loai/anime.html",
    "name": "Anime"
}, {
    "link": "/the-loai/anthropomorphic.html",
    "name": "Anthropomorphic"
}, {
    "link": "/the-loai/bao-luc.html",
    "name": "Bạo Lực"
}, {
    "link": "/the-loai/bi-an.html",
    "name": "Bí Ẩn"
}, {
    "link": "/the-loai/bi-an-sieu-nhien.html",
    "name": "Bí ẩn - Siêu nhiên"
}, {
    "link": "/the-loai/cars.html",
    "name": "Cars"
}, {
    "link": "/the-loai/cartoon.html",
    "name": "Cartoon"
}, {
    "link": "/the-loai/cgdct.html",
    "name": "CGDCT"
}, {
    "link": "/the-loai/chien-tranh.html",
    "name": "Chiến Tranh"
}, {
    "link": "/the-loai/cn-animation.html",
    "name": "CN Animation"
}, {
    "link": "/the-loai/co-trang.html",
    "name": "Cổ Trang"
}, {
    "link": "/the-loai/crossdressing.html",
    "name": "Crossdressing"
}, {
    "link": "/the-loai/dementia.html",
    "name": "Dementia"
}, {
    "link": "/the-loai/di-gioi.html",
    "name": "Dị Giới"
}, {
    "link": "/the-loai/drama.html",
    "name": "Drama"
}, {
    "link": "/the-loai/du-hanh-thoi-gian.html",
    "name": "Du Hành Thời Gian"
}, {
    "link": "/the-loai/ecchi.html",
    "name": "Ecchi"
}, {
    "link": "/the-loai/gag-humor.html",
    "name": "Gag Humor"
}, {
    "link": "/the-loai/game.html",
    "name": "Game"
}, {
    "link": "/the-loai/gay-can.html",
    "name": "Gây cấn"
}, {
    "link": "/the-loai/gia-tuong.html",
    "name": "Giả Tưởng"
}, {
    "link": "/the-loai/gia-dinh.html",
    "name": "Gia Đình"
}, {
    "link": "/the-loai/hai-huoc.html",
    "name": "Hài Hước"
}, {
    "link": "/the-loai/haiten.html",
    "name": "Haiten"
}, {
    "link": "/the-loai/hanh-dong.html",
    "name": "Hành Động"
}, {
    "link": "/the-loai/harem.html",
    "name": "Harem"
}, {
    "link": "/the-loai/he-thong.html",
    "name": "Hệ Thống"
}, {
    "link": "/the-loai/hinh-su.html",
    "name": "Hình Sự"
}, {
    "link": "/the-loai/hoan-doi-gioi-tinh.html",
    "name": "Hoán Đổi Giới Tính"
}, {
    "link": "/the-loai/hoat-hinh.html",
    "name": "Hoạt Hình"
}, {
    "link": "/the-loai/hoc-duong.html",
    "name": "Học Đường"
}, {
    "link": "/the-loai/hoi-hop.html",
    "name": "Hồi hộp"
}, {
    "link": "/the-loai/huyen-ao.html",
    "name": "Huyền Ảo"
}, {
    "link": "/the-loai/huyen-huyen.html",
    "name": "Huyền Huyễn"
}, {
    "link": "/the-loai/isekai.html",
    "name": "Isekai"
}, {
    "link": "/the-loai/josei.html",
    "name": "Josei"
}, {
    "link": "/the-loai/khoa-hoc.html",
    "name": "Khoa Học"
}, {
    "link": "/the-loai/kids.html",
    "name": "Kids"
}, {
    "link": "/the-loai/kiem-hiep.html",
    "name": "Kiếm Hiệp"
}, {
    "link": "/the-loai/kinh-di.html",
    "name": "Kinh Dị"
}, {
    "link": "/the-loai/lang-man.html",
    "name": "Lãng mạn"
}, {
    "link": "/the-loai/lich-su.html",
    "name": "Lịch Sử"
}, {
    "link": "/the-loai/live-action.html",
    "name": "Live Action"
}, {
    "link": "/the-loai/love-polygon.html",
    "name": "Love Polygon"
}, {
    "link": "/the-loai/love-status-quo.html",
    "name": "Love Status Quo"
}, {
    "link": "/the-loai/ma-ca-rong.html",
    "name": "Ma Cà Rồng"
}, {
    "link": "/the-loai/mecha.html",
    "name": "Mecha"
}, {
    "link": "/the-loai/movie-ova.html",
    "name": "Movie & OVA"
}, {
    "link": "/the-loai/mystery.html",
    "name": "Mystery"
}, {
    "link": "/the-loai/mythology.html",
    "name": "Mythology"
}, {
    "link": "/the-loai/ninja.html",
    "name": "Ninja"
}, {
    "link": "/the-loai/ona.html",
    "name": "ONA"
}, {
    "link": "/the-loai/otaku-culture.html",
    "name": "Otaku Culture"
}, {
    "link": "/the-loai/parody.html",
    "name": "Parody"
}, {
    "link": "/the-loai/performing-arts.html",
    "name": "Performing Arts"
}, {
    "link": "/the-loai/phep-thuat.html",
    "name": "Phép Thuật"
}, {
    "link": "/the-loai/phieu-luu.html",
    "name": "Phiêu Lưu"
}, {
    "link": "/the-loai/police.html",
    "name": "Police"
}, {
    "link": "/the-loai/quan-doi.html",
    "name": "Quân Đội"
}, {
    "link": "/the-loai/samurai.html",
    "name": "Samurai"
}, {
    "link": "/the-loai/shoujo.html",
    "name": "Shoujo"
}, {
    "link": "/the-loai/shoujo-ai.html",
    "name": "Shoujo Ai"
}, {
    "link": "/the-loai/shounen.html",
    "name": "Shounen"
}, {
    "link": "/the-loai/shounen-ai.html",
    "name": "Shounen Ai"
}, {
    "link": "/the-loai/sieu-nang-luc.html",
    "name": "Siêu Năng Lực"
}, {
    "link": "/the-loai/sieu-nhien.html",
    "name": "Siêu Nhiên"
}, {
    "link": "/the-loai/special.html",
    "name": "Special"
}, {
    "link": "/the-loai/tai-lieu.html",
    "name": "Tài liệu"
}, {
    "link": "/the-loai/tam-ly.html",
    "name": "Tâm Lý"
}, {
    "link": "/the-loai/than-thoai.html",
    "name": "Thần Thoại"
}, {
    "link": "/the-loai/the-gioi-song-song.html",
    "name": "Thế Giới Song Song"
}, {
    "link": "/the-loai/the-thao.html",
    "name": "Thể Thao"
}, {
    "link": "/the-loai/thriller.html",
    "name": "Thriller"
}, {
    "link": "/the-loai/tien-hiep.html",
    "name": "Tiên Hiệp"
}, {
    "link": "/the-loai/tieu-thuyet.html",
    "name": "Tiểu Thuyết"
}, {
    "link": "/the-loai/tinh-cam.html",
    "name": "Tình Cảm"
}, {
    "link": "/the-loai/tinh-tay-ba.html",
    "name": "Tình Tay Ba"
}, {
    "link": "/the-loai/tinh-yeu.html",
    "name": "Tình Yêu"
}, {
    "link": "/the-loai/tokusatsu.html",
    "name": "Tokusatsu"
}, {
    "link": "/the-loai/tragedy.html",
    "name": "Tragedy"
}, {
    "link": "/the-loai/trailer.html",
    "name": "Trailer"
}, {
    "link": "/the-loai/trinh-tham.html",
    "name": "Trinh Thám"
}, {
    "link": "/the-loai/trung-sinh.html",
    "name": "Trùng Sinh"
}, {
    "link": "/the-loai/truyen-hinh.html",
    "name": "Truyền Hình"
}, {
    "link": "/the-loai/tu-tien.html",
    "name": "Tu Tiên"
}, {
    "link": "/the-loai/tv-show.html",
    "name": "TV Show"
}, {
    "link": "/the-loai/video-game.html",
    "name": "Video Game"
}, {
    "link": "/the-loai/vien-tay.html",
    "name": "Viễn Tây"
}, {
    "link": "/the-loai/vien-tuong.html",
    "name": "Viễn Tưởng"
}, {
    "link": "/the-loai/villainess.html",
    "name": "Villainess"
}, {
    "link": "/the-loai/vo-thuat.html",
    "name": "Võ Thuật"
}, {
    "link": "/the-loai/vu-tru.html",
    "name": "Vũ Trụ"
}, {
    "link": "/the-loai/xuyen-khong.html",
    "name": "Xuyên Không"
}, {
    "link": "/the-loai/yaoi.html",
    "name": "Yaoi"
}, {
    "link": "/the-loai/yuri.html",
    "name": "Yuri"
}, {
    "link": "/the-loai/doi-thuong.html",
    "name": "Đời Thường"
}]`;
    } catch(e){
      log("getLISTmenu[err]:\n " + e);
      return `[
        {"link":"/","name":"Đang lỗi getLISTmenu()"},
      ]`;
    }
  }

function getPrimaryCategories() { return JSON.stringify([]); }
function getFilterConfig() { return JSON.stringify({ category: [] }); }

// =============================================================================
// URL BUILDERS
// =============================================================================
function getUrlList(slug, filtersJson) {
  try {
    if (slug && slug.indexOf("http") === 0) return slug;
    var page = 1;
    if (filtersJson) {
      try {
        var fj = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
        var filters = JSON.parse(fj);
        page = parseInt(filters.page) || 1;
      } catch (e) { log("getUrlList parse filters err: " + e); }
    }
    var path = slug || "/danh-sach/phim-moi-cap-nhat.html";
    if (page > 1) {
      if (path.indexOf(".html") > -1) path = path.replace(/\.html$/, "/trang-" + page + ".html");
      else path += "/trang-" + page + ".html";
    }
    var url = BASEURL + path;
    log("getUrlList → " + url);
    return url;
  } catch (e) { log("getUrlList ERR: " + e); return BASEURL + "/danh-sach/phim-moi-cap-nhat.html"; }
}

function getUrlSearch(keyword, filtersJson) {
  var kw = encodeURIComponent(keyword || "");
  return BASEURL + "/tim-kiem/" + kw + ".html";
}

function getUrlDetail(slug, datasend) {
  if (!slug) return "";
  if (slug.indexOf("http") === 0) return slug;
  return BASEURL + "/phim/" + slug + ".html";
}
function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// HELPERS
// =============================================================================
function fixImgUrl(url) {
  if (!url) return "";
  url = url.replace(/&#038;/g, "&").replace(/&amp;/g, "&").trim();
  if (url.indexOf("//") === 0) return "https:" + url;
  return url;
}

function extractPipeData(apiUrl) {
  if (!apiUrl) return "";
  var i = apiUrl.indexOf("|");
  if (i < 0) return "";
  var s = apiUrl.substring(i + 1).replace(/^\s+/, "");
  if (s.toLowerCase().indexOf("data:") === 0) s = s.substring(5);
  return s;
}

function decodeUrlSafe(s) {
  try { return decodeURIComponent(String(s || "")); } catch (e) { return String(s || ""); }
}

// =============================================================================
// LIST
// =============================================================================
function parseListResponse(html, apiUrl) {
  log("═══════ parseListResponse START ═══════");
  try {
    if(apiUrl.indexOf("/tim-kiem/") > -1){
      var totalpage = 1;
    }
    else{
      var totalpage = 999;
    }
    var $doc = _$(html);
    var items = [], seen = {};
    $doc.find("article.TPost, li.group").each(function () {
      var linkEl = this.find("a").first();
      var href = linkEl.attr("href");
      if (!href || seen[href]) return;
      seen[href] = true;
      var title = this.find("h2.Title").text().trim() || this.find(".Title").text().trim() || linkEl.attr("title") || "";
      if (!title) return;
      var poster = fixImgUrl(this.find("img").attr("src"));
      items.push({
        "id": href, "title": title, "posterUrl": poster, "backdropUrl": poster,
        "quality": this.find(".Qlty").text().trim() || "HD",
        "episode_current": this.find(".mli-eps").text().trim(),
        "year": this.find(".Date").text().trim()
      });
    });
    log("parseListResponse items = " + items.length);
    return JSON.stringify({ "items": items, "pagination": { "currentPage": 1, "totalPages": totalpage } });
  } catch (e) {
    log("parseListResponse ERR: " + e);
    return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
  }
}
function parseSearchResponse(html, apiUrl) { return parseListResponse(html, apiUrl); }

// =============================================================================
// MOVIE DETAIL (không đổi)
// =============================================================================
function parseMovieDetail(html, apiUrl, datasend) {
  log("═══════ parseMovieDetail START ═══════");
  try {
    var $doc = _$(html);
    var canonM = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    var canonicalUrl = canonM ? canonM[1] : apiUrl.split("|")[0];
    var title = "";
    var titleM = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (titleM) title = titleM[1].replace(/\s*VietSub.*$/i, "").replace(/\s*-\s*Xem.*$/i, "").trim();
    if (!title) title = $doc.find("h1.Title").text().trim();

    var poster = "";
    var posterM = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (posterM) poster = fixImgUrl(posterM[1]);

    var description = $doc.find(".Description p").text().trim();
    if (!description) {
      var descM = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
      if (descM) description = descM[1];
    }

    var watchUrl = "";
    var wA = $doc.find("a.watch_button_more").first();
    if (wA && wA.attr("href")) watchUrl = wA.attr("href");
    if (!watchUrl) {
      var pA = $doc.find(".Image a").first();
      if (pA && pA.attr("href")) watchUrl = pA.attr("href");
    }
    if (!watchUrl) {
      var wm = html.match(/href="(https?:\/\/[^"]*\/xem-phim\/[^"]+)"/i);
      if (wm) watchUrl = wm[1];
    }
    log("watchUrl = " + watchUrl);

    var servers = [];
    if (watchUrl) {
      var watchRes = httpRequest(watchUrl, {
        method: "GET",
        headers: { "User-Agent": UA, "Referer": apiUrl.split("|")[0] }
      });
      var watchHtml = (watchRes && watchRes.body) ? String(watchRes.body) : "";
      log("watch status=" + (watchRes && watchRes.status) + ", len=" + watchHtml.length);

      var $watch = _$(watchHtml);
      var movieIdM = watchHtml.match(/MovieId\s*=\s*['"](\d+)['"]/);
      var movieId = movieIdM ? movieIdM[1] : "";
      var watchBase = watchUrl.replace(/\/tap-[^\/]+\.html.*$/, "");

      var episodeList = [], seenEp = {};
      $watch.find(".list-episode .episode a").each(function () {
        var epName = this.attr("data-epname") || this.text().trim();
        var epHash = this.attr("data-hash") || this.attr("data-ep") || "";
        var epLink = this.attr("href") || "";
        if (!epHash) {
          var hm = epLink.match(/tap-\d+-(\d+)\.html/);
          if (hm) epHash = hm[1];
        }
        if (!epLink && epHash) {
          var nm = epName.match(/(\d+)/);
          var num = nm ? nm[1] : "1";
          epLink = watchBase + "/tap-" + num + "-" + epHash + ".html";
        }
        if (!epLink || !epHash || seenEp[epHash]) return;
        seenEp[epHash] = true;
        episodeList.push({ name: epName, hash: epHash, link: epLink });
      });

      log("movieId=" + movieId + ", episodes=" + episodeList.length);

      var serverDefs = [{ name: "Servers", sv: 0 }, { name: "SS #2", sv: 1 }];
      for (var si = 0; si < 1; si++) {
        var srv = serverDefs[si], eps = [];
        for (var ei = 0; ei < episodeList.length; ei++) {
          var ep = episodeList[ei];
          if(ep.name && !ep.name.match(/tập|phần|ep/)){
            ep.name = "Tập " + ep.name
          }
          eps.push({
            "id": ep.link + "|data:movieId=" + movieId + "&sv=" + srv.sv + "&epHash=" + ep.hash,
            "name": ep.name,
            "slug": "s" + srv.sv + "-tap-" + ep.hash,
            "ids": [{
              name: "Server 1",
              url: ep.link + "|data:movieId=" + movieId + "&sv=0" + "&epHash=" + ep.hash
            },{
              name: "Server 2",
              url: ep.link + "|data:movieId=" + movieId + "&sv=1" + "&epHash=" + ep.hash
            }]
          });
        }
        servers.push({ "name": srv.name, "episodes": eps });
      }
    }

    return JSON.stringify({
      "id": canonicalUrl, "title": title, "posterUrl": poster, "backdropUrl": poster,
      "description": description, "quality": "HD", "episode_current": "", "servers": servers
    });
  } catch (e) {
    log("❌ parseMovieDetail ERR: " + e);
    return JSON.stringify({ id: apiUrl || "error", title: "Lỗi", description: String(e), servers: [] });
  }
}

// =============================================================================
// DETAIL RESPONSE — HYBRID: Abyss direct / SSPlay sniffer
// =============================================================================
function parseDetailResponse(html, apiUrl, datasend) {
  log("═══════ parseDetailResponse START ═══════");
  try {
    var dataStr = datasend || extractPipeData(apiUrl);
    var movieId = "", sv = "0", epHash = "";
    if (dataStr) {
      var mm = dataStr.match(/movieId=(\d+)/); if (mm) movieId = mm[1];
      var sm = dataStr.match(/sv=(\d+)/);      if (sm) sv = sm[1];
      var hm = dataStr.match(/epHash=(\d+)/);  if (hm) epHash = hm[1];
    }
    if (!movieId) { var m = html.match(/MovieId\s*=\s*['"](\d+)['"]/); if (m) movieId = m[1]; }
    if (!epHash)  { var m = html.match(/EpisodeId\s*=\s*['"](\d+)['"]/); if (m) epHash = m[1]; }

    log("movieId=" + movieId + " epHash=" + epHash + " sv=" + sv);
    if (!movieId || !epHash) throw new Error("Thiếu movieId hoặc epHash");

    var refererUrl = apiUrl.split("|")[0];
    var ajaxRes = httpRequest("https://animesub.site/ajax/player", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "*/*",
        "Referer": refererUrl,
        "User-Agent": UA
      },
      body: "id=" + movieId + "&ep=" + epHash + "&sv=" + sv
    });

    var respText = (ajaxRes && ajaxRes.body) ? String(ajaxRes.body) : "";
    log("ajax status=" + (ajaxRes && ajaxRes.status) + " len=" + respText.length);

    // Bóc iframe URL
    var iframeUrl = "";
    var iframeM = respText.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeM) {
      iframeUrl = iframeM[1].replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/&quot;/g, '"');
    } else {
      var urlM = respText.match(/(https?:\/\/[^\s"'<>]+)/);
      if (urlM) iframeUrl = urlM[1].replace(/&amp;/g, "&");
    }
    if (!iframeUrl) throw new Error("Không bóc được iframe URL");
    log("iframeUrl = " + iframeUrl);

    // ─── NHÁNH 1: ApiOk.php (Hydrax/Abyss) → App sẽ fetch → gọi parseEmbedResponse
    if (iframeUrl.indexOf("ApiOk.php") > -1) {
      log("→ NHÁNH ApiOk.php (Hydrax) — trả isEmbed:true để App fetch");
      return JSON.stringify({
        url: iframeUrl,
        isEmbed: true,
        headers: {
          "Referer": "https://animesub.site/",
          "User-Agent": UA
        },
        subtitles: []
      });
    }

    // ─── NHÁNH 2: hrx_qc.php?v=<ENCODED> (SSPlay) → decode, cho Sniffer bắt m3u8
    var mHrx = iframeUrl.match(/hrx_qc\.php[^#]*[?&]v=([^&"']+)/i);
    if (mHrx) {
      var decoded = decodeURIComponent(mHrx[1]);
      log("→ NHÁNH SSPlay: " + decoded);
      return JSON.stringify({
        url: decoded,
        isEmbed: true,
        headers: {
          "Referer": BASEURL,
          "User-Agent": UA
        },
        subtitles: []
      });
    }

    // ─── Fallback: để App tự fetch + sniffer
    log("→ NHÁNH fallback");
    return JSON.stringify({
      url: iframeUrl,
      isEmbed: true,
      headers: { "Referer": "https://animesub.site/", "User-Agent": UA },
      subtitles: []
    });
  } catch (e) {
    log("❌ parseDetailResponse ERR: " + e);
    return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
  }
}
function runJS(referer) {
  var r = JSON.stringify(String(referer || ""));
  // 用 String.fromCharCode 避免特殊字符在 QuickJS 里被错误转义
  var SB = "window.SnifferBridge";
  var LOG = "function log(m,t){try{if(window.SnifferBridge&&SnifferBridge.log)SnifferBridge.log('[SS] '+m);if(t&&window.SnifferBridge&&SnifferBridge.toast)SnifferBridge.toast(m,1200);}catch(e){}}";
  
  var code = [
    '(function(){',
    'if(window.__SS_INIT__)return;window.__SS_INIT__=1;',
    'var D=0,T=null;',
    LOG,
    'log("SS init "+location.href,false);',
    'T=setTimeout(function(){if(!D)log("Timeout 25s",true);},25000);',
    // check content
    'function isM(c){if(typeof c!=="string")return false;return c.length>10&&c.indexOf("#EXTM3U")===0;}',
    'function dis(c,b){if(D===1)return;D=1;if(T){clearTimeout(T);T=null;}log("GOT M3U8 len="+c.length,true);try{var h=JSON.stringify({Referer:' + r + '});if(window.SnifferBridge&&SnifferBridge.playM3u8Content){SnifferBridge.playM3u8Content(c,b||' + r + ',h);log("playM3u8Content sent",true);}else if(window.SnifferBridge&&SnifferBridge.play){SnifferBridge.play(b,h);log("play sent",true);}}catch(e){log("dispatch err "+e.message,true);}}',
    // hook XHR
    'try{var X=window.XMLHttpRequest;var O=X.prototype.open,S=X.prototype.send;var M=new WeakMap();X.prototype.open=function(m,u){M.set(this,u);return O.apply(this,arguments);};X.prototype.send=function(){var s=this;var u=M.get(s)||"";var o=s.onreadystatechange;s.onreadystatechange=function(){if(s.readyState===4){try{if(isM(s.responseText)){log("XHR body m3u8 url="+u);dis(s.responseText,u);}}catch(e){}}if(o)o.apply(this,arguments);};return S.apply(this,arguments);};log("Hook XHR OK",false);}catch(e){log("Hook XHR err "+e.message,false);}',
    // hook fetch
    'try{if(window.fetch){var F=window.fetch;window.fetch=function(i,n){var u=(typeof i==="string")?i:(i&&i.url?i.url:"");return F.apply(this,arguments).then(function(res){try{var c=res.clone();c.text().then(function(t){if(isM(t)){log("fetch body m3u8 url="+u);dis(t,u);}}).catch(function(){});}catch(e){}return res;});};log("Hook fetch OK",false);}}catch(e){log("Hook fetch err "+e.message,false);}',
    // hide only top
    'try{if(window.top===window){var st=document.createElement("style");st.textContent="body,html{background:#000!important;}";(document.head||document.documentElement).appendChild(st);log("Hide top OK",false);}}catch(e){}',
    // inject into child iframes via postMessage
    'setTimeout(function(){try{var fs=document.querySelectorAll("iframe");log("Found "+fs.length+" child iframes",false);for(var i=0;i<fs.length;i++){try{if(fs[i].contentWindow){fs[i].contentWindow.postMessage({__ss_inject:1, referer:' + r + '},"*");log("postMessage -> iframe["+i+"] "+fs[i].src,false);}}catch(e){log("iframe["+i+"] err "+e.message,false);}}}catch(e){log("scan iframes err "+e.message,false);}},2000);',
    'setTimeout(function(){try{var fs=document.querySelectorAll("iframe");for(var i=0;i<fs.length;i++){try{if(fs[i].contentWindow){fs[i].contentWindow.postMessage({__ss_inject:1, referer:' + r + '},"*");}}catch(e){}}}catch(e){}},4000);',
    'window.addEventListener("message",function(e){if(e.data&&e.data.__ss_inject){log("Got inject request from parent",false);}})',
    '})();'
  ].join("");
  
  // wrapper: chạy trong cả context cha và context được postMessage gọi
  var bootstrap = [
    '(function(){',
    'var REFERER=' + r + ';',
    'function runSniffer(){',
    code,
    '}',
    // listener nhận postMessage
    'window.addEventListener("message",function(e){',
    'if(e.data&&e.data.__ss_inject){try{window.__SS_INIT__=0;runSniffer();}catch(err){try{if(window.SnifferBridge&&SnifferBridge.log)SnifferBridge.log("[SS] child inject err "+err.message);}catch(e2){}}}',
    '});',
    // chạy ngay ở context hiện tại
    'runSniffer();',
    // tự quét iframe con sau khi DOM ready
    'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){try{var fs=document.querySelectorAll("iframe");try{if(window.SnifferBridge&&SnifferBridge.log)SnifferBridge.log("[SS] DOMReady children="+fs.length);}catch(e){}for(var i=0;i<fs.length;i++){try{if(fs[i].contentWindow){fs[i].contentWindow.postMessage({__ss_inject:1,referer:REFERER},"*");}}catch(e){}}}catch(e){}});}',
    '})();'
  ].join("");
  
  return bootstrap;
}


function parseEmbedResponse(html, url) {
  log("═══════ parseEmbedResponse START ═══════");
  log("url = " + url);
  log("html len = " + (html ? html.length : 0));

  try {
    var body = String(html || "");

    // ─── Hydrax/Abyss
    if (url.indexOf("ApiOk.php") > -1) {
      var m = body.match(/file\s*:\s*['"]([^'"]+)['"]/);
      if (!m || !m[1]) return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
      var rawFile = m[1].replace(/&amp;/g, "&").replace(/\\\//g, "/");
      var vM = rawFile.match(/[?&]v=([^&"']+)/);
      if (!vM || !vM[1]) return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
      var streamUrl = "https://abysscdn.com/?v=" + vM[1];
      log("★ ABYSS FINAL = " + streamUrl);
      return JSON.stringify({
        url: streamUrl,
        mimeType: "video/mp4",
        isEmbed: false,
        headers: { "User-Agent": UA }
      });
    }

    // ─── SSPlay: bọc qua worker iframe để tránh redirect
    if (url.indexOf("ssplay.net") > -1) {
      var wrappedUrl = "https://iframe.alokillgtv.workers.dev/?url=" + encodeURIComponent(url);
      log("→ SSPLAY wrapped = " + wrappedUrl);
      return JSON.stringify({
        url: wrappedUrl,
        isEmbed: true,
        headers: {
          "Referer": BASEURL,
          "User-Agent": UA,
          "Custom-Js": runJS(BASEURL)
        },
        subtitles: []
      });
    }

    log("→ Fallback");
    return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
  } catch (e) {
    log("❌ parseEmbedResponse ERR: " + e);
    return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
  }
}
function getPrimaryCategories() {
      try {
          var listurl = getLISTmenu();
          var menulist = buildMenu(listurl);
          return JSON.stringify(menulist);
      } catch (e) {
          log("getPrimaryCategories[err]:\n " + e);
          return JSON.stringify([]);
      }
  }
  // Tạo thẻ chủ đề filter..
  function getFilterConfig() {
      try {
          var listurl = getLISTmenu();
          var menulist = buildMenu(listurl);
          return JSON.stringify({
              category: menulist
          });
      } catch (e) {
          log("getFilterConfig[err]:\n " + e);
          return JSON.stringify({ category: [] });
      }
  }
  function parseCategoriesResponse(apiResponseJson) {
      try {
          var listurl = getLISTmenu();
          var menulist = buildMenu(listurl);
          return JSON.stringify(menulist);
      } catch (e) {
          log("parseCategoriesResponse[err]:\n " + e);
          return JSON.stringify([]);
      }
  }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }
function buildMenu(menuStr, type) { 
      var menuArray = JSON.parse(menuStr); 
      let menulist = []; 
      if (!menuArray || !Array.isArray(menuArray)) return menulist; 
      var typeStr = type !== undefined ? String(type).trim() : undefined; 
      for (var i = 0; i < menuArray.length; i++) { 
          var item = menuArray[i]; 
          if (!item) continue; 
          var link = item.link ? String(item.link).trim() : ""; 
          var name = item.name ? String(item.name).trim() : ""; 
          if (!link || !name) continue; 
          var menuItem = {}; 
          if (typeStr === "false") { 
              menuItem = { "slug": link, "title": name, "type": "Horizontal" }; 
          } else if (typeStr === "true") { 
              menuItem = { "slug": link, "title": name, "type": "Grid" }; 
          } else { 
              menuItem = { "slug": link, "name": name }; 
          } 
          menulist.push(menuItem); 
      } 
      return menulist; 
  }

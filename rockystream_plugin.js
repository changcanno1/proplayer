// =============================================================
//  XEM20 VAAPP Plugin v3.0
//  - Dùng cookie native qua getCookie(BASE)
//  - Không cần login native, không cần worker
//  - Lazy: chỉ check cookie khi user bấm tải
// =============================================================

var BASE = "https://xem20.net";
var UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/122.0.0.0 Mobile Safari/537.36";
var POPUP_HTML = `<div style="
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    min-height: 100%;
    padding: 8px 4px;
    box-sizing: border-box;
    text-align: left;
    line-height: 1.65;
    font-size: 14px;
    gap: 14px;
">
    <p style="margin: 0;">
        Đầu tiên để dùng được nguồn này, bạn phải vào trang cài đặt plugin và nhấn vào <b style="color:#f43f5e">đăng nhập</b>.
        Hoặc bạn có thể cuộn xuống dòng bên dưới để đăng nhập.
        Sau đó sẽ mở ra trang đăng nhập trên web. Đăng ký hoặc đăng nhập vào tài khoản của bạn mà dùng.
        Xem20 là nguồn phim được Upload lên FSHARE, họ dùng cơ chế getlink riêng của họ để lấy link download
        hoặc để xem trực tuyến.
    </p>
    <p style="margin: 0;">
        Vì thế họ rất nghiêm ngặt, và giới hạn mỗi IP chỉ cho phép dùng <b style="color:#38bdf8">50GB băng thông</b>.
        Vượt băng thông bạn phải chờ tới <b style="color:#38bdf8">0 giờ ngày mai</b> mới phục hồi.
    </p>
    <p style="margin: 0;">
        Tuy nhiên bạn có thể lách luật bằng cách dùng các app VPN xịn có thể đổi IP sang quốc gia khác
        như <b style="color:#22c55e">UltraSurf VPN</b>… Khi chuyển IP khác bạn sẽ xem được.
    </p>
    <p style="margin: 0;">
        Tuy dùng Fshare nhưng server của họ bóp băng thông khá nhiều nên xem chậm là bình thường nhé,
        được cái phim rất nhiều dạng <b style="color:#a78bfa">MKV 4K</b> độ nét cao hơn hẳn.
    </p>
</div>`;
// https://xem20.net/login
// ============ COOKIE NATIVE ============
var res = httpRequest(BASE, {
    method: "GET"
});
var checkHTML = res.body;
var isLogin = true;
if(checkHTML.indexOf("https://xem20.net/login") > -1){
   isLogin = false;
   popHTML = POPUP_HTML;
  console.log("Chưa Đăng Nhập")
}
else{
  POPUP_HTML = "";
  console.log("Đã đăng nhập")
}
// ============ MANIFEST ============ 
function getManifest() {
  return JSON.stringify({
    id: "xem20",
    name: "Xem20 [MOVIE]",
    version: "1.1",
    baseUrl: "https://xem20.net/login",
    type: "MOVIE",
    info: "Đầu tiên để dùng được nguồn này, bạn phải vào trang cài đặt plugin và nhấn vào đăng nhập..Sau đó sẽ mở ra trang đăng nhập trên web. Đăng ký hoặc đăng nhập vào tài khoản của bạn mà dùng.Xem20 là nguồn phim được Upload lên FSHARE, họ dùng cơ chế getlink riêng của họ để lấy link download hoặc để xem trực tuyến.",
    layoutType: "VERTICAL",
    "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/xem20.png",
    playerType: "exoplayer",
    referrer: BASE + "/",
    imageReferer: BASE + "/",
    debug: true,
    "popup_html": POPUP_HTML,
    isEnabled: true
  });
}
function _getNativeCookie() {
  try {
    var ck = getCookie(BASE);
    if (ck && String(ck).indexOf("phimhdchill-session") !== -1) {
      return String(ck);
    }
  } catch(e) {
    console.log("[xem20] getCookie err:", e.message);
  }
  return "";
}
function _checkCookieOrWarn() {
  var ck = _getNativeCookie();
  if (ck) {
    console.log("[xem20] ✓ cookie native OK, len=" + ck.length + "\n" + JSON.stringify(ck));
    return true;
  }
  else{
    popHTML = POPUP_HTML
  }
  console.log("[xem20] ✗ không có cookie — user cần login trong WebView");
  toast("Vui lòng đăng nhập xem20.net trong trình duyệt của app trước");
  return "";
}

// ============ HOME ============
function getHomeSections() {
  return JSON.stringify([
    { slug: "/danh-sach/phim-le",   title: "Phim Lẻ",     type: "Horizontal" },
    { slug: "/danh-sach/phim-bo",   title: "Phim Bộ",     type: "Horizontal" },
    { slug: "moi-cap-nhat",      title: "Mới Cập Nhật",   type: "Grid" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Hành Động",              slug: "the-loai/hanh-dong" },
    { name: "Chính Kịch",             slug: "the-loai/chinh-kich" },
    { name: "Chiến Tranh",            slug: "the-loai/chien-tranh" },
    { name: "Bí Ẩn",                  slug: "the-loai/bi-an" },
    { name: "Kinh Dị",                slug: "the-loai/kinh-di" },
    { name: "Hình Sự",                slug: "the-loai/hinh-su" },
    { name: "Phiêu Lưu",              slug: "the-loai/phieu-luu" },
    { name: "Hoạt Hình",              slug: "the-loai/hoat-hinh" },
    { name: "Gia Đình",               slug: "the-loai/gia-dinh" },
    { name: "Tài Liệu",               slug: "the-loai/tai-lieu" },
    { name: "Lịch Sử",                slug: "the-loai/lich-su" },
    { name: "Lãng Mạn",               slug: "the-loai/lang-man" },
    { name: "Giả Tưởng",              slug: "the-loai/gia-tuong" },
    { name: "Gây Cấn",                slug: "the-loai/gay-can" },
    { name: "Hài",                    slug: "the-loai/hai" },
    { name: "Hành Động & Phiêu Lưu",  slug: "the-loai/hanh-dong-phieu-luu" },
    { name: "Khoa Học & Giả Tưởng",   slug: "the-loai/khoa-hoc-gia-tuong" },
    { name: "Khoa Học Viễn Tưởng",    slug: "the-loai/khoa-hoc-vien-tuong" },
    { name: "Âm Nhạc",                slug: "the-loai/am-nhac" },
    { name: "Phim Truyền Hình",       slug: "the-loai/phim-truyen-hinh" }
  ]);
}

function getUrlList(slug, filtersJson) {
  var page = 1;
  try { page = JSON.parse(filtersJson || "{}").page || 1; } catch(e){}
  if (slug === "moi-cap-nhat")   return BASE + "/loc-phim?sort=download_updated&page=" + page;
  if (slug === "moi-co-ban-tai") return BASE + "/loc-phim?sort=download_created&page=" + page;
  if (slug === "tai-nhieu")      return BASE + "/loc-phim?sort=download_total&page=" + page;
  if (slug.indexOf("danh-sach/") === 0 || slug.indexOf("the-loai/") === 0)
    return BASE + "/" + slug + "?page=" + page;
  return BASE + "/loc-phim?sort=download_updated&page=" + page;
}

// ============ PARSE LIST ============
function parseListResponse(html, apiUrl) {
  if (!html || html.length < 100) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  var $doc = _$(html);
  var items = [];
  $doc.find(".cd-card").each(function() {
    var href = this.attr("href");
    if (!href) return;
    var slug = href.replace(BASE, "").replace(/^\//, "");
    if (!slug) return;
    var title = this.find(".cd-card__title").text().trim() || this.find("h3").first().text().trim();
    var poster = this.find("img").first().attr("src") || this.find("img").first().attr("data-src");
    var quality = this.find(".cd-poster-badge--top-left").text().trim();
    var lang = this.find(".cd-poster-badge--top-right").text().trim();
    var dlInfo = this.find(".cd-poster-badge--bottom-left").text().trim();
    items.push({
      id: slug, title: title, posterUrl: poster,
      quality: quality, lang: lang,
      episode_current: dlInfo.replace(/\s+/g, " ").trim()
    });
  });
  var currentPage = 1;
  var pm = apiUrl.match(/[?&]page=(\d+)/);
  if (pm) currentPage = parseInt(pm[1]);
  return JSON.stringify({ items: items, pagination: { currentPage: currentPage, totalPages: 10 } });
}

// ============ SEARCH ============
function getUrlSearch(keyword) {
  return BASE + "/tim-kiem?keyword=" + encodeURIComponent(keyword);
}
function parseSearchResponse(html, apiUrl) { return parseListResponse(html, apiUrl); }

// ============ MOVIE DETAIL ============
function getUrlDetail(slug) {
  if (!slug) return "";
  if (slug.indexOf("http") === 0) return slug;
  return BASE + "/" + slug.replace(/^\//, "");
}

function parseMovieDetail(html, apiUrl, datasend) {
  if (!html) return JSON.stringify({ id: apiUrl, title: "", servers: [] });
  var $doc = _$(html);
  var movieUrl = apiUrl.indexOf("http") === 0 ? apiUrl : (BASE + "/" + apiUrl.replace(/^\//, ""));

  var title = $doc.find(".cd-title").first().text().trim() || $doc.find("h1").first().text().trim();
  var origin = $doc.find(".cd-download-hero__origin").first().text().trim();
  var poster = $doc.find(".cd-download-hero__poster img").attr("src");
  var backdrop = $doc.find(".cd-download-hero__backdrop").attr("src");
  var description = $doc.find(".cd-download-hero__summary").first().text().trim();

  if (!poster) { var og = html.match(/<meta property="og:image" content="([^"]+)"/); if (og) poster = og[1]; }
  if (!description) { var dm = html.match(/<meta name="description" content="([^"]+)"/); if (dm) description = dm[1]; }

  var year = null, director = "", casts = "", genres = "", rating = "";
  var ldM = html.match(/<script type="application\/ld\+json">(\{[^<]*?"@type":"Movie"[^<]*?\})<\/script>/);
  if (ldM) {
    try {
      var ld = JSON.parse(ldM[1]);
      if (ld.datePublished) year = parseInt(ld.datePublished);
      if (ld.director && ld.director[0]) director = ld.director[0].name;
      if (ld.actor) casts = ld.actor.slice(0, 10).map(function(a){ return a.name; }).join(", ");
      if (ld.genre) genres = ld.genre.join(", ");
      if (ld.aggregateRating && ld.aggregateRating.ratingValue) rating = ld.aggregateRating.ratingValue;
    } catch(e){}
  }

  function buildId(actionUrl, fileName) {
    var idM = actionUrl.match(/\/download-links\/(\d+)\/access/);
    var extM = fileName.match(/\.([a-z0-9]{2,5})$/i);
    var payload = { a: actionUrl, n: fileName, e: extM ? extM[1].toLowerCase() : "", m: movieUrl, d: idM ? idM[1] : "" };
    var encoded = BASE64.encode(JSON.stringify(payload)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
    return movieUrl + "|data:" + encoded;
  }

  var servers = [];
  var seasonBlocks = $doc.find(".cd-season");
  var sCount = 0; seasonBlocks.each(function(){ sCount++; });

  if (sCount > 0) {
    seasonBlocks.each(function(sIdx) {
      var name = this.find("summary > span").first().text().trim() || ("Mùa " + (sIdx + 1));
      var eps = [], idx = 0;
      this.find(".cd-release").each(function() {
        var fn = this.find(".cd-release__name").text().trim();
        var fa = this.find("form").attr("action");
        if (!fa || !fn) return;
        eps.push({
          name: fn.length > 70 ? fn.slice(0, 67) + "..." : fn,
          slug: "s" + sIdx + "-e" + idx,
          id: buildId(fa, fn)
        });
        idx++;
      });
      if (eps.length > 0) servers.push({ name: name, episodes: eps });
    });
  } else {
    var eps = [], idx = 0;
    $doc.find(".cd-release").each(function() {
      var fn = this.find(".cd-release__name").text().trim();
      var fa = this.find("form").attr("action");
      if (!fa || !fn) return;
      eps.push({
        name: fn.length > 70 ? fn.slice(0, 67) + "..." : fn,
        slug: "file-" + idx,
        id: buildId(fa, fn)
      });
      idx++;
    });
    if (eps.length > 0) servers.push({ name: "Bản tải", episodes: eps });
  }
  if(isLogin == false || isLogin == "false"){
    servers = [];
    servers.push({
      name: "Bạn chưa đăng nhập để xem phim.",
      episodes: [{
        name: "Vào phần plugin để đăng nhập",
        slug: "loi1",
        id: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4"
      }]
    })
  }
  return JSON.stringify({
    id: movieUrl,
    title: title || origin || "Phim",
    posterUrl: poster,
    backdropUrl: backdrop,
    description: description,
    year: year, rating: rating,
    casts: casts, director: director, category: genres,
    servers: servers
  });
}

// ============ DOWNLOAD DETAIL ============
function parseDetailResponse(html, apiUrl, datasend) {
  console.log("═══ parseDetailResponse ═══");

  // 1. Decode payload
  var payload = null;
  var raw = String(datasend || "").trim();
  if (raw.indexOf("data:") === 0) raw = raw.slice(5);

  if (raw) {
    try {
      var dec = BASE64.decode(raw.replace(/-/g,"+").replace(/_/g,"/"));
      if (dec) payload = JSON.parse(dec);
    } catch(e1) { console.log("b64 fail:", e1.message); }
    if (!payload) { try { payload = JSON.parse(raw); } catch(e2){} }
    if (!payload) { try { payload = JSON.parse(decodeURIComponent(raw)); } catch(e3){} }
  }

  console.log("payload:", payload ? JSON.stringify(payload).slice(0, 200) : "NULL");
  if (!payload || !payload.a) { console.error("✗ payload rỗng"); return JSON.stringify({ url: "", isEmbed: false }); }

  // 2. Lấy cookie NATIVE (không login, không worker)
  var cookie = _checkCookieOrWarn();
  if (!cookie) return JSON.stringify({ url: "", isEmbed: false });

  // 3. Token từ HTML detail (app đã fetch sẵn)
  var token = null;
  if (html) { var tm = html.match(/name="_token"\s+value="([^"]+)"/); if (tm) token = tm[1]; }
  console.log("token (from html):", token ? token.slice(0, 15) + "…" : "null");

  if (!token) {
    // Fetch lại movie với cookie native
    var rM = httpRequest(payload.m, { method: "GET", headers: { "User-Agent": UA, "Cookie": cookie } });
    if (rM && rM.body) {
      var m2 = rM.body.match(/name="_token"\s+value="([^"]+)"/);
      if (m2) token = m2[1];
    }
  }
  if (!token) { console.error("✗ no token"); return JSON.stringify({ url: "", isEmbed: false }); }

  // 4. POST
  console.log("POST:", payload.a);
  var rPost = httpRequest(payload.a, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Cookie": cookie,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Referer": payload.m,
      "Origin": BASE
    },
    body: "_token=" + encodeURIComponent(token)
  });
  if (!rPost) { console.error("✗ POST null"); return JSON.stringify({ url: "", isEmbed: false }); }
  console.log("POST status:", rPost.status, "len:", rPost.body ? rPost.body.length : 0);

  var dfHtml = rPost.body || "";
  var dfUrl = "";
  if (rPost.headers) dfUrl = rPost.headers.location || rPost.headers.Location || "";
  if (!dfUrl && dfHtml) { var um = dfHtml.match(/(https:\/\/downfshare\.top\/x\/[a-f0-9]+)/); if (um) dfUrl = um[1]; }

  if (dfHtml.indexOf("downloadBtn") === -1 && dfUrl) {
    var rDf = httpRequest(dfUrl, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": BASE + "/"
      }
    });
    if (rDf && rDf.body) dfHtml = rDf.body;
  }

  // Check limit
  if (dfHtml.indexOf("giới hạn tải hôm nay") !== -1) {
    console.error("✗ downfshare 50GB/ngày");
    toast("Đã đạt giới hạn 50GB/ngày của downfshare.top. Thử lại sau 0h hoặc đổi IP.");
    return JSON.stringify({ url: "", isEmbed: false });
  }

  // 5. Trích link
  var direct = "";
  if (dfHtml) {
    var dlM = dfHtml.match(/<a[^>]*id="downloadBtn"[^>]*href="([^"]+)"/i)
           || dfHtml.match(/<a[^>]*href="([^"]+)"[^>]*id="downloadBtn"/i);
    if (dlM) direct = dlM[1];
    if (!direct) { var alt = dfHtml.match(/(https:\/\/dl\.downfshare\.top\/[^"'\s]+)/); if (alt) direct = alt[1]; }
  }

  var ext = (payload.e || "").toLowerCase();
  var mime = "video/mp4";
  if (ext === "mkv") mime = "video/x-matroska";
  else if (ext === "webm") mime = "video/webm";
  else if (ext === "avi") mime = "video/x-msvideo";
  else if (ext === "m3u8") mime = "application/x-mpegURL";
  else if (ext === "mpd") mime = "application/dash+xml";
  else if (ext === "ts") mime = "video/mp2t";

  if (direct) {
    console.log("✓ direct:", direct.slice(0, 80) + "…");
    console.log("✓ mime:", mime);
    return JSON.stringify({
      url: direct,
      isEmbed: false,
      mimeType: mime,
      headers: { "User-Agent": UA, "Referer": "https://dl.downfshare.top/" }
    });
  }

  if (dfUrl) {
    console.log("⚠ fallback isEmbed:", dfUrl);
    return JSON.stringify({
      url: dfUrl,
      isEmbed: true,
      headers: { "User-Agent": UA, "Referer": BASE + "/" }
    });
  }

  console.error("✗ không có link");
  return JSON.stringify({ url: "", isEmbed: false });
}

function parseEmbedResponse(html, url) {
  if (html) {
    var m = html.match(/(https:\/\/dl\.downfshare\.top\/[^"'\s]+)/);
    if (m) return JSON.stringify({ url: m[1], isEmbed: false, mimeType: "video/mp4" });
  }
  return JSON.stringify({ url: "", isEmbed: false });
}
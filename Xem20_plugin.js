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
// ============ HYBRID COOKIE / SHARED ACCOUNT ============
var SHARED_EMAIL = "alokillgtv@gmail.com";
var SHARED_PASS = "Vaxplayer";
var _sharedCookieCache = "";
var _sharedCookieExpire = 0;

function _extractCookiesFromRes(res, jar) {
  jar = jar || {};
  if (!res) return jar;
  var setC = [];
  if (res.setCookies && res.setCookies instanceof Array) {
    setC = res.setCookies;
  } else if (res.headers && res.headers["set-cookie"]) {
    var raw = res.headers["set-cookie"];
    if (raw instanceof Array) setC = raw;
    else setC = [raw];
  } else if (res.headers && res.headers["Set-Cookie"]) {
    var raw2 = res.headers["Set-Cookie"];
    if (raw2 instanceof Array) setC = raw2;
    else setC = [raw2];
  }
  for (var i = 0; i < setC.length; i++) {
    var item = String(setC[i] || "").split(";")[0];
    var eq = item.indexOf("=");
    if (eq > 0) {
      var k = item.substring(0, eq).trim();
      var v = item.substring(eq + 1).trim();
      if (k) jar[k] = v;
    }
  }
  return jar;
}

function _cookieJarToString(jar) {
  var parts = [];
  for (var k in jar) {
    if (jar.hasOwnProperty(k) && jar[k]) {
      parts.push(k + "=" + jar[k]);
    }
  }
  return parts.join("; ");
}

function _loginSharedAccount() {
  var now = Date.now();
  if (_sharedCookieCache && now < _sharedCookieExpire) {
    return _sharedCookieCache;
  }

  // Thử đọc từ localStorage nếu có
  try {
    if (typeof localStorage !== "undefined") {
      var cached = localStorage.getItem("xem20_shared_session");
      var exp = parseInt(localStorage.getItem("xem20_shared_expire") || "0", 10);
      if (cached && exp && now < exp) {
        _sharedCookieCache = cached;
        _sharedCookieExpire = exp;
        return cached;
      }
    }
  } catch (e) {}

  var loginUrl = BASE + "/login";
  var jar = {};

  var r1 = httpRequest(loginUrl, {
    method: "GET",
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });
  if (!r1 || !r1.body) return "";
  _extractCookiesFromRes(r1, jar);

  var tokenMatch = r1.body.match(/name="_token"\s+value="([^"]+)"/);
  var csrfToken = tokenMatch ? tokenMatch[1] : "";
  if (!csrfToken) return "";

  var postBody = "_token=" + encodeURIComponent(csrfToken)
      + "&login=" + encodeURIComponent(SHARED_EMAIL)
      + "&password=" + encodeURIComponent(SHARED_PASS)
      + "&remember=on";

  var r2 = httpRequest(loginUrl, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": loginUrl,
      "Origin": BASE,
      "Cookie": _cookieJarToString(jar)
    },
    body: postBody
  });
  if (!r2) return "";
  _extractCookiesFromRes(r2, jar);

  var finalCookie = _cookieJarToString(jar);
  if (finalCookie && finalCookie.indexOf("phimhdchill-session") !== -1) {
    _sharedCookieCache = finalCookie;
    _sharedCookieExpire = now + (12 * 3600 * 1000); // 12h
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("xem20_shared_session", finalCookie);
        localStorage.setItem("xem20_shared_expire", String(_sharedCookieExpire));
      }
    } catch (e) {}
    console.log("[xem20] ✓ Đăng nhập tài khoản dùng chung thành công");
    return finalCookie;
  }
  return "";
}

// Kiểm tra xem cookie có thực sự đã đăng nhập hay chỉ là cookie khách
var _cachedCookieValidity = {};

function _isCookieLoggedIn(cookieStr) {
  if (!cookieStr || String(cookieStr).indexOf("phimhdchill-session") === -1) return false;
  var now = Date.now();
  if (_cachedCookieValidity[cookieStr] && (now - _cachedCookieValidity[cookieStr].time) < 1800000) { // 30 phút
    return _cachedCookieValidity[cookieStr].valid;
  }

  var r = httpRequest(BASE + "/", {
    method: "GET",
    headers: {
      "User-Agent": UA,
      "Cookie": cookieStr
    }
  });
  var isValid = false;
  if (r && r.body) {
    // Nếu chưa đăng nhập, trang chủ sẽ hiện form login: id="cd-login-form"
    if (r.body.indexOf('id="cd-login-form"') === -1 && (r.body.indexOf('cd-card') !== -1 || r.body.indexOf('/profile') !== -1)) {
      isValid = true;
    }
  }
  _cachedCookieValidity[cookieStr] = { valid: isValid, time: now };
  return isValid;
}

function _getNativeCookie() {
  try {
    if (typeof getCookie === "function") {
      var ck = getCookie(BASE);
      if (ck && String(ck).indexOf("phimhdchill-session") !== -1) {
        var strCk = String(ck).trim();
        // Phải kiểm tra xem cookie native này đã đăng nhập tài khoản chưa!
        if (_isCookieLoggedIn(strCk)) {
          return strCk;
        } else {
          console.log("[xem20] Cookie native WebView chỉ là cookie khách (chưa đăng nhập), chuyển sang tài khoản dùng chung");
        }
      }
    }
  } catch(e) {
    console.log("[xem20] getCookie err:", e.message);
  }
  return "";
}

function _getEffectiveCookie() {
  // 1. Ưu tiên cookie cá nhân từ Native WebView (nếu đã đăng nhập)
  var nativeCk = _getNativeCookie();
  if (nativeCk) {
    console.log("[xem20] Sử dụng cookie tài khoản riêng của user");
    return nativeCk;
  }
  // 2. Không có cookie riêng hoặc user chưa login trong WebView -> dùng tài khoản dùng chung
  var sharedCk = _loginSharedAccount();
  if (sharedCk) {
    console.log("[xem20] Sử dụng cookie tài khoản dùng chung");
    return sharedCk;
  }
  return "";
}

var isLogin = true;
var popHTML = "";
var _initialCk = _getNativeCookie();
if (!_initialCk) {
  _initialCk = _loginSharedAccount();
}
if (_initialCk) {
  isLogin = true;
  POPUP_HTML = "";
  console.log("[xem20] Sẵn sàng phục vụ (Đã đăng nhập)");
} else {
  isLogin = false;
  popHTML = POPUP_HTML;
  console.log("[xem20] Chưa có phiên đăng nhập");
}

// ============ MANIFEST ============ 
function getManifest() {
  return JSON.stringify({
    id: "xem20",
    name: "Xem20 [MOVIE]",
    version: "1.2.1",
    baseUrl: "https://xem20.net/login",
    type: "MOVIE",
    info: "Nguồn phim Xem20 chất lượng cao FShare. Hỗ trợ cơ chế Hybrid: Tự động dùng tài khoản hệ thống dùng chung hoặc tài khoản cá nhân nếu bạn đã đăng nhập qua WebView.",
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

function _checkCookieOrWarn() {
  var ck = _getEffectiveCookie();
  if (ck) {
    console.log("[xem20] ✓ cookie OK, len=" + ck.length);
    return ck;
  }
  popHTML = POPUP_HTML;
  console.log("[xem20] ✗ không có cookie");
  toast("Không thể lấy phiên đăng nhập xem20. Vui lòng thử lại sau.");
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
  if (!html || html.length < 100 || html.indexOf('id="cd-login-form"') !== -1 || html.indexOf('cd-card') === -1) {
    // Nếu trang trả về trang login (do request ban đầu từ app chưa kèm cookie), tự fetch lại với cookie hiệu lực
    var effCookie = _getEffectiveCookie();
    if (effCookie) {
      var rList = httpRequest(apiUrl, {
        method: "GET",
        headers: {
          "User-Agent": UA,
          "Cookie": effCookie
        }
      });
      if (rList && rList.body && rList.body.indexOf('id="cd-login-form"') === -1 && rList.body.indexOf('cd-card') !== -1) {
        html = rList.body;
      }
    }
  }

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
  var movieUrl = apiUrl.indexOf("http") === 0 ? apiUrl : (BASE + "/" + apiUrl.replace(/^\//, ""));

  // Nếu html trả về trang đăng nhập hoặc không có nội dung phim, tự fetch lại bằng cookie hiệu lực
  if (!html || html.length < 100 || html.indexOf('id="cd-login-form"') !== -1 || html.indexOf('cd-release') === -1) {
    var effCookie = _getEffectiveCookie();
    if (effCookie) {
      var rDetail = httpRequest(movieUrl, {
        method: "GET",
        headers: { "User-Agent": UA, "Cookie": effCookie }
      });
      if (rDetail && rDetail.body && rDetail.body.indexOf('cd-release') !== -1) {
        html = rDetail.body;
      }
    }
  }

  if (!html) return JSON.stringify({ id: apiUrl, title: "", servers: [] });
  var $doc = _$(html);

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

  // Nếu chưa có tập nào do chưa đăng nhập, thử đăng nhập tài khoản dùng chung
  if (servers.length === 0) {
    var effCookie = _getEffectiveCookie();
    if (effCookie && html.indexOf("https://xem20.net/login") !== -1) {
      var refetch = httpRequest(movieUrl, {
        method: "GET",
        headers: { "User-Agent": UA, "Cookie": effCookie }
      });
      if (refetch && refetch.body && refetch.body.indexOf("https://xem20.net/login") === -1) {
        return parseMovieDetail(refetch.body, apiUrl, datasend);
      }
    }
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
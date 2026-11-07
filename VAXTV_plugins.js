var iddomain = "bilutv"
BASEURL = "https://vaxplugin.alokillgtv02.workers.dev/tv/index.html"
NEWDOMAIN = false;
var GAME_LIST_URL = "https://vaxplugins.alokillgtv05.workers.dev/tv/game/list.txt";
var GAME_IMG = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxgame_1.jpg?v=7";
var GAME_CACHE = [];
var GAME_MAP = {};
var GAME_CATEGORIES = ["Game Tiếng Việt", "Mô Phỏng", "Hành Động", "Giải Trí", "Bài Bạc", "Chơi Cờ", "Bắn Súng", "Chiến Thuật", "Giải Đố", "Trí Tuệ", "Lái Xe", "Phiêu Lưu", "Thể Thao", "Chơi Online"];
function gameLog() {
    try { var a = [].slice.call(arguments); a.unshift("[VAXGAME]"); console.log.apply(console, a); } catch (e) {}
}
function gameParam(url, name) {
    try {
        var m = String(url || "").match(new RegExp("[?&]" + name + "=([^&]*)", "i"));
        return m ? decodeURIComponent(m[1]) : "";
    } catch (e) { return ""; }
}
function isGameListUrl(url) {
    return String(url || "").indexOf(GAME_LIST_URL) === 0;
}
var popup_html = "";

// ============================================================
// HELPER: Đổi param ?url= → ?m3u= để native không tự sniff
// ------------------------------------------------------------
// Native plugin hard-code: thấy query param tên "url" → tự động
// decode base64 + fetch URL đích → gây noise "Proxy request failed".
// Đổi tên param thành "m3u" → native bỏ qua → hết noise.
//
// Áp dụng cho MỌI URL trả về từ plugin trước khi native nhận.
// An toàn với cả:
//   - URL có ?url=...    → đổi thành ?m3u=...
//   - URL có &url=...    → đổi thành &m3u=...
//   - URL không có url=  → giữ nguyên
// ============================================================
function renameUrlToM3u(u) {
    if (!u || typeof u !== 'string') return u;
    return u.replace(/([?&])url=/gi, '$1m3u=');
}

function getManifest() {
  try{
    return JSON.stringify({
      "id": "vaxtv",
      "name": "VAX TỔNG HỢP [MOVIE]",
      "version": "2.4",
      "author": "Alokillgtv",
      "info": "[UPDATE: 2.4] Hoàn thiện UI Control mới, fix nhiều lỗi. Update Vax Game xịn xò hơn. Fix các lỗi giao diện.",
      "BASEURL": BASEURL,
      "headers":{
          "X-VAX-YB": "vax_yb_token_2030_1990"
      },
      "iconUrl": "https://vaxplugin.alokillgtv02.workers.dev/img/vaxtv.png",
      "isEnabled": true,
      "backgroundWebView": true,
      "isAdult": false,
      "layoutType": "Horizontal",
      "adblock": false,
      "type": "VIDEO",
      "subtitleCat": false,
      popup_html: popup_html,
      "playerType": "embed"
    });
  }

//  "type": "VIDEO",
   
  catch(e){
    return JSON.stringify({
      "id": "loiapp",
      "name": "Plugin bị lỗi cài đặt",
      "version": "2.2",
      "info": "Plugin đang bị lỗi: \n" + e,
      "baseUrl": "http://vkey.vn/",
      "iconUrl": "https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/novahd.png",
      "isEnabled": true,
      "type": "MOVIE",
      "playerType": "exoplayer"
     });
  }
}
function getcate(){
  return `[{
    "id": "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=movie&plugin=kkphim&play=proxy",
    "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxmovie_1.jpg?v=7",
    "des": "VAXMOVIE là player mở rộng chuyên dụng để stream các nguồn phim khác nhau, một cách để bạn duyệt, tìm và xem phim một cách nhanh chóng.",
    "count": "MOVIE",
    "title": "VAX MOVIE"
  },
  {
    "id": "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=anime&plugin=yanhh3d",
    "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxanime_1.jpg?v=7",
    "des": "",
    "count": "ANIME",
    "title": "VAX ANIME"
  },
  {
    "id": "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=short&plugin=netshort",
    "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxshort_1.jpg?v=7",
    "des": "",
    "count": "SHORT",
    "title": "VAX SHORT"
  },
  {
    "id": "https://vaxplugin.alokillgtv02.workers.dev/tv/index.html?base=true",
    "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxtv_1.jpg?v=7",
    "des": "",
    "count": "TV",
    "title": "VAX TV"
  },
    {
    "id": "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=live&plugin=vaxlive",
    "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxsport_1.jpg?v=7",
    "des": "",
    "count": "LIVE",
    "title": "VAX LIVE SPORT"
  },
  {
    "id": "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=movie&plugin=youtube",
    "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxyoutube_1.jpg?v=7",
    "des": "",
    "count": "VIDEO",
    "title": "VAX YOUTUBE"
  },
  {
    "id": "https://vaxplugin.alokillgtv02.workers.dev/tv/manga/index.html?type=manga&plugin=nettruyen",
    "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxmanga_1.jpg?v=7",
    "des": "",
    "count": "MANGA",
    "title": "VAX MANGA"
  },
  {
    "id": "https://vaxplugin.alokillgtv02.workers.dev/tv/novel/index.html?type=novel&plugin=truyenlocal",
    "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxreader_1.jpg?v=7",
    "des": "",
    "count": "BOOK",
    "title": "VAX READER"
  },
  {
    "id": "https://vaxplugin.alokillgtv02.workers.dev/tv/news/index.html?type=news&plugin=dantri",
    "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxnew_1.jpg?v=7",
    "des": "",
    "count": "NEWS",
    "title": "VAX NEWS"
  },
    {
     "id": "https://vaxplugins.alokillgtv05.workers.dev/tv/game/list.txt?vaxgame=root",
     "img": "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxgame_1.jpg?v=7",
     "des": "Thư mục game theo thể loại",
     "count": "GAMES",
     "title": "VAX GAMES",
     "isFolder": true
   }
]`
}



// ===== HÀM MENU LIST BEGIN ======

function getHomeSections() {
      return JSON.stringify([
          {"slug": "https://example.com?type=tonghop","title": "VAX TỔNG HỢP","type": "Grid"}
      ]);
  }

function getLISTmenu() {
    try{
      return `[
        {"link":"https://example.com?type=tonghop&save=false","name":"Xoá dữ liệu nếu lỗi."}
      ]`;
    } catch(e){
      log("getLISTmenu[err]:\n " + e);
      return `[
        {"link":"/","name":"Đang lỗi getLISTmenu()"}
      ]`;
    }
  }
 // getHomeSections(), getLISTmenu()
// ===== HÀM MENU LIST END ======

// ===== HÀM TẠO URL BEGIN ======

function getUrlList(slug, filtersJson) {
    var paramPage = "/";
    var charparam = false;
    try {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var page = 1;
        var path = slug || "";
        if (filtersJson) {
            var fixedJson2 = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson2);
                page = parseInt(filters.page) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (e) { log("getUrlList():\n" + e) }
        }
        var resultUrl = BASELINK;
        if (path) {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }

        if (page > 0 && resultUrl.indexOf("page=") === -1) {
            if (charparam === true) {
                var prefix = resultUrl.indexOf("?") > -1 ? "&" : "?";
                resultUrl += prefix + paramPage + page;
            } else {
                resultUrl += paramPage + page;
            }
        }
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        return finalUrl;
    } catch (e) {
        log("getUrlList[err]:\n " + e);
        return BASEURL;
    }
}

function getUrlSearch(keyword, filtersJson) {
        var items = [];
        var match = keyword.match(/(reset|clear)/i);
        console.log(keyword);
        if (match && match[1]) {
            if(match){
              toast("Bạn hãy chọn vào kênh tương ứng để reset lại plugin.")
              return "https://vaxplugin.alokillgtv02.workers.dev/tv/index.html?type=tv&save=false"
            }
            else{
              toast("Plugin này không hỗ trợ tìm kiếm")
              return BASEURL
            }
        }
        var match2 = keyword.match(/(conheo|toi18)/i);
        if (match2) {
              toast("Bạn hãy chọn plugins bí mật để xem.");
              var name = keyword.split("#");
              if(name && name[1]){
                name = "&plugin=" + name[1]
              }
              else{
                name = ""
              }
             // console.log("xxxx:\n" + "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=xxx" + name)
              return "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=xxx" + name
        }
        var match2 = keyword.match(/type/i);
        if (match2) {
              var name = keyword.split("#");
              if(name && name[1] && name[2]){
                var embed = "";
                if(name[3]){
                  embed = "&embed=true";
                }
                name = "&typeplugin="+name[1]+"&plugin=" + name[2] + embed
              }
              else{
                name = ""
              }
            //  console.log("xxxx:\n" + "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=xxx" + name)
              return "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=xxx" + name
        }
        var match3 = keyword.match(/tester/i);
        if (match3) {
              return "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?typeplugin=movie&plugin=kkphim&reload=true"
        }
  }

// ===== HÀM TẠO KHỐI LIST PHIM BEGIN ======
function parseGameList(raw) {
    try {
        var data = JSON.parse(String(raw || ""));
        return Array.isArray(data) ? data : (data.games || data.items || data.list || []);
    } catch (e) { return []; }
}

function gameCategoryOf(game) {
    return String((game && (game.category || game.tag)) || "").trim();
}

function gameItem(game) {
    if (!game || !game.name || !game.url) return null;
    var url = String(game.url);
    var item = {
        id: url,
        title: String(game.name),
        quality: gameCategoryOf(game) || "GAME",
        episode_current: "WebView",
        posterUrl: String(game.image || ""),
        backdropUrl: String(game.image || ""),
        description: String(game.desc || ""),
        category: gameCategoryOf(game),
        url: url
    };
    GAME_MAP[url] = item;
    return item;
}

function gameFolder(id, title, poster) {
    return {
        id: id,
        slug: id,
        title: title,
        quality: "GAME",
        episode_current: "Thư mục",
        posterUrl: poster || GAME_IMG,
        backdropUrl: poster || GAME_IMG,
        isFolder: true
    };
}

function gameListResponse(raw, url) {
    var games = parseGameList(raw);
    var category = gameParam(url, "category");
    var items = [];
    GAME_CACHE = [];
    if (!category) {
        for (var c = 0; c < GAME_CATEGORIES.length; c++) {
            var first = null;
            for (var i = 0; i < games.length; i++) {
                if (gameCategoryOf(games[i]) === GAME_CATEGORIES[c]) { first = games[i]; break; }
            }
            var poster = (first && first.image) ? String(first.image) : GAME_IMG;
            items.push(gameFolder(GAME_LIST_URL + "?category=" + encodeURIComponent(GAME_CATEGORIES[c]), GAME_CATEGORIES[c], poster));
            gameLog("category=" + GAME_CATEGORIES[c] + " | img=" + poster);
        }
    } else {
        for (var j = 0; j < games.length; j++) {
            if (gameCategoryOf(games[j]) !== category) continue;
            var mapped = gameItem(games[j]);
            if (mapped) { items.push(mapped); GAME_CACHE.push(mapped); }
        }
    }
    gameLog("list url=" + String(url || "") + " | category=" + (category || "(root)") + " | games=" + games.length + " | items=" + items.length);
    return JSON.stringify({ items: items, pagination: { currentPage: 1, totalPages: 1 } });
}

function parseListResponse(html, url) {
    try {
        if (isGameListUrl(url)) {
            return gameListResponse(html, url);
        }
        var $data = JSON.parse(getcate());
        var save = getparam(url,"save");
        var xxx = getparam(url,"type");
        var typeplugin = getparam(url,"typeplugin");
        var plugin = getparam(url,"plugin");
        var embed = getparam(url,"embed");
        var reload = getparam(url,"reload");
        if(reload){
          reload = "&reload=true"
        }
        else{
          reload = ""
        }
        var items = [];
        if(typeplugin){
          if(embed){
            embed = "&embed=true"
          }
          else{
            embed = "";
          }
          if(typeplugin == "movie"){
            var link = "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=movie&plugin=" + plugin + embed
            var img = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxmovie_1.jpg?v=7";
            var title = "VAX MOVIE"
          }
          if(typeplugin == "anime"){
            var link = "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=anime&plugin=" + plugin + embed
            var img = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxanime_1.jpg?v=7";
            var title = "VAX ANIME"
          }
          if(typeplugin == "short"){
            var link = "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=short&plugin=" + plugin + embed
            var img = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxshort_1.jpg?v=7";
            var title = "VAX SHORT"
          }
          if(typeplugin == "xxx"){
            var link = "https://vaxplugin.alokillgtv02.workers.dev/tv/movie.html?type=xxx&plugin=" + plugin + embed
            var img = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxxxx_1.jpg?v=7";
            var title = "VAX XXX"
          }
          if(typeplugin == "news"){
            var link = "https://vaxplugin.alokillgtv02.workers.dev/tv/news/index.html?type=news&plugin=" + plugin
            var img = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxnew_1.jpg?v=7";
            var title = "VAX NEWS"
          }
          if(typeplugin == "manga"){
            var link = "https://vaxplugin.alokillgtv02.workers.dev/tv/manga/index.html?type=manga&plugin=" + plugin
            var img = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxmanga_1.jpg?v=7";
            var title = "VAX MANGA"
          }
          if(typeplugin == "novel"){
            var link = "https://vaxplugin.alokillgtv02.workers.dev/tv/novel/index.html?type=novel&plugin=" + plugin
            var img = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/vaxnovel_1.jpg?v=7";
            var title = "VAX NOVEL"
          }
              items.push({
                  "id": link + reload,
                  "title": title,
                  "quality": "",
                  "episode_current": "",
                  "posterUrl": img,
                  "backdropUrl": img,
                  "year": "",
                  "lang": "Tìm từ khoá `clear` để reset nếu lỗi."
              });
        }
        else{
          if(save){
            save = "&save=false&pluginsCache=false"
          }
          else{
            save = "";
          }
          var pass = "";
          if(xxx && xxx.indexOf("xxx") > -1){
            pass = "&pass=xxx"
          }
  
        
          $data.forEach(function(item,index) {
              // ⭐ ĐỔI ?url= → ?m3u= để native không sniff và fetch URL đích
              //    Tránh log noise "Proxy request failed..." từ native
              var safeId = renameUrlToM3u(item.id);
              var entry = {
                  "id": safeId + save + pass,
                  "title": item.title,
                  "quality": "",
                  "episode_current": item.count,
                  "posterUrl": item.img,
                  "backdropUrl": item.img,
                  "year": "",
                  "lang": "Tìm từ khoá `clear` để reset nếu lỗi."
              };
              /* Chỉ thư mục game mới cần cờ folder; các mục phim giữ nguyên */
              if (item.isFolder) {
                  entry.isFolder = true;
                  entry.slug = safeId + save + pass;
              }
              items.push(entry);
          })
        }     

        var result = JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });

        console.log("Return List:\n" + result);
        return result

    } catch (e) {
        log("parseListResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [{
                "id": url || "error_url",
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}
// ===== HÀM TẠO KHỐI LIST PHIM END ======

// ===== HÀM TẠO KHỐI CHI TIẾT PHIM BEGIN ======
function parseMovieDetail(html, url) {
    var gameDetailUrl = String(url || '');
    if (GAME_MAP[gameDetailUrl]) {
        var game = GAME_MAP[gameDetailUrl];
        gameLog("detail url=" + gameDetailUrl);
        return JSON.stringify({
            id: gameDetailUrl,
            slug: gameDetailUrl,
            title: game.title,
            posterUrl: game.posterUrl || GAME_IMG,
            backdropUrl: game.backdropUrl || GAME_IMG,
            description: game.description || '',
            category: game.category || 'GAME',
            episode_current: 'WebView',
            servers: [{ name: 'WebView', episodes: [{ id: gameDetailUrl, name: 'Chơi ngay', slug: gameDetailUrl }] }]
        });
    }
    //log("parseMovieDetail[url]: \n" + url);
    try {
        // ⭐ URL sạch — đổi ?url= → ?m3u= phòng trường hợp URL vẫn còn sót
        //    (VD: user copy link cũ từ history, hoặc item.id chưa được rename)
        var safeUrl = renameUrlToM3u(url);

        var title = "VAX TỔNG HỢP"
        var des = getparam(safeUrl,"des")
        var poster = getparam(safeUrl,"poster");
        var type = getparam(safeUrl,"tv");
        var server = getparam(safeUrl,"server");

        var id = safeUrl;
        var posterUrl = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/background.jpg?v=1";
        var backdropUrl = "https://vaxplugins.alokillgtv05.workers.dev/tv/img/background.jpg?v=1";
        var originName = "";
        var description = "Vax Tổng Hợp là một plugin chuyên dụng, khi bạn muốn mọi thứ đơn giản nhất, không cần cài quá nhiều plugin mà vẫn có đủ trải nghiệm đầy đủ nhất.";
        var director = "director";
        var casts = "casts";
        var category = "category";
        var duration = "duration";
        var status = "status";
        var episode_current = "episode_current";
        var year = "year";
        var quality = "quality";
        var rating = "rating";
        var country = "country";
        var lang = "VN";
        var extra = "";

        var servers = [];
        var episodes = [];
        episodes.push({
            id: "link-page",
            name: "Tập-test",
            slug: "tap-1"
        })
        servers.push({
            name: "Server",
            episodes: [{
                // ⭐ Dùng safeUrl — native nhận ?m3u= → không sniff
                id: safeUrl,
                name: "Xem Ngay",
                slug: "fullVideo"
            }]
       })
        var $return = JSON.stringify({
            // ⭐ Dùng safeUrl ở mọi chỗ
            id: safeUrl || "",
            title: title || "",
            originName: originName || "",
            posterUrl: posterUrl || "",
            backdropUrl: backdropUrl || "",
            description: description || "",
            quality: quality || "",
            year: year || "",
            rating: rating || "",
            status: status || "",
            category: category || "",
            episode_current: episode_current || "",
            servers: servers || "",
            duration: duration || "",
            casts: casts || "",
            director: director || "",
            country: country || "",
            lang: lang || "",
            extra: extra || ""
        });
      console.log("Return Movie:\n" + $return)
      return $return
    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: "error",
            title: "error",
            description: url + "\n" + e,
            servers: []
        });
    }
}
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM END ======
function getCustomJS() {
    var jsUrl = `https://vaxplugin.alokillgtv02.workers.dev/youtube/custom.js?time=${Date.now()}`;
    //  jsUrl = `http://localhost:8158/custom_test.js?time=${Date.now()}`;
    //   console.log("Script Get:\n" + jsUrl)
    try {
        // 2. Fetch nội dung file JS
        const jsResponse = httpRequest(jsUrl, {
            method: "GET"
        });
        let rawCode = "";

        if (jsResponse && jsResponse.isSuccessful) {
            rawCode = jsResponse.body;
        } else {
            console.error("Không thể lấy dữ liệu từ URL JS:", jsUrl);
            return function runJS() {
                return "";
            };
        }

        // 3. ESCAPE CODE: Xử lý triệt để dấu ` và ${} để không bị lỗi cú pháp khi đặt vào template literal
        const escapedCode = rawCode
            .replace(/\\n/g, '\\\\n') // Escape dấu gạch chéo ngược
            .replace(/\\b/g, '\\\\b') // Escape dấu gạch chéo ngược
            .replace(/\\r/g, '\\\\r') // Escape dấu gạch chéo ngược
            .replace(/\\s/g, '\\\\s') // Escape dấu gạch chéo ngược   // Escape dấu gạch chéo ngược
            .replace(/`/g, '\`') // Escape dấu backtick `
            .replace(/\${/g, '\\${'); // Escape cú pháp ${

        // 4. Khởi tạo hàm runJS() trả về mã script hoàn chỉnh

        return escapedCode

    } catch (err) {
        console.error("Lỗi trong quá trình xử lý JS:", err);
        return function runJS() {
            return "";
        };
    }
}
// ===== HÀM TẠO XỬ LÝ STREAM PHIM BEGIN ======


function youtube() {
    var url = "https://youtube.alokillgtv02.workers.dev/#id=knW7-x7Y7RE&original=https://youtube.alokillgtv02.workers.dev/?chart=trending&version=1&page=1"
    url = url.replace("#id", "?id");
    var idvd = getparam(url, "id");
    // Lấy URL gốc đầy đủ (đã đổi # thành ?), cắt bỏ phần &original=... vì native không cần
    // 👈 Lấy đúng URL gốc (không bị cắt ở & đầu tiên)
    var listUrl = "";
    var origIdx = url.indexOf("&original=");
    if (origIdx > -1) {
        listUrl = url.substring(origIdx + 10);
        try {
            listUrl = decodeURIComponent(listUrl);
        } catch (e) {}
    }
    var stream = "https://m.yout-ube.com/watch?v=" + idvd;
    var streamyb = "https://m.youtube.com/watch?v=" + idvd;
    //var stream = "https://www.youtube-nocookie.com/embed/" + idvd + "?autoplay=1&iv_load_policy=3&loop=1&playlist=" + idvd + "&rel=0";

    // 👈 Chỉ truyền 2 biến, KHÔNG fetch, KHÔNG base64
    var customJS = 'window.CONSOLE=false;' +
        'window.CURRENT_VD=' + JSON.stringify(idvd) + ';' +
        'window.LIST_URL=' + JSON.stringify(listUrl) + ';' +
        'window.LASTSAVE = true;' +
        getCustomJS();

    return JSON.stringify({
        url: stream + "&lastsave=true",
        mimeType: "",
        isEmbed: false,
        autoClick: false,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": streamyb,
            "Sniffer": false,
            "Origin": streamyb,
            "Block-AutoClick": "true",
            "Block-Ads": false,
            "Block-Css": "",
            "Custom-Js": customJS
        },
        subtitles: [{
            lang: "",
            url: ""
        }]
    });
}

// ============================================================
// ⭐ CUSTOM JS REGISTRY
// Mỗi entry: { name, match(regex hoặc function(url)=>bool), code: ()=>string }
// buildCustomJS(url) sẽ CHỈ nhúng handler khớp với URL.
// Thêm nguồn mới = push thêm 1 object vào mảng, không sửa gì khác.
// ============================================================


function dailymotionJS() {
  return ''
    + 'console.log("[DM-PLAYER] init");'
    + 'var h=location.hostname||"";'
    + 'if(h.indexOf("dailymotion.com")===-1){console.log("[DM] skip "+h);return;}'
    + 'var s=document.createElement("style");'
    + 's.textContent="header,vheader,[class*=Header],[class*=Overlay],[class*=Controls],[class*=Watermark],[class*=EndScreen],[class*=ad-]{display:none!important}html,body{overflow:hidden!important;background:#000!important}";'
    + '(document.head||document.documentElement).appendChild(s);'
    + 'function getVideo(){return document.getElementById("video")||document.querySelector("video");}'
    + 'function doSeek(d){var v=getVideo();if(!v||!isFinite(v.duration))return;v.currentTime=Math.max(0,Math.min(v.duration,v.currentTime+d));}'
    + 'function doVol(d){var v=getVideo();if(!v)return;v.volume=Math.max(0,Math.min(1,v.volume+d));v.muted=false;}'
    + 'function doToggle(){var v=getVideo();if(!v)return;if(v.paused)v.play().catch(function(){});else v.pause();}'
    + 'window.addEventListener("message",function(ev){var d=ev.data||{};if(!d.vaxCmd)return;var c=d.vaxCmd;'
    +   'if(c==="seek+5")doSeek(5);else if(c==="seek-5")doSeek(-5);else if(c==="toggle")doToggle();else if(c==="vol+")doVol(0.1);else if(c==="vol-")doVol(-0.1);'
    + '},false);'
    + 'var iv=setInterval(function(){'
    +   'var v=getVideo();if(!v||v.readyState<1)return;clearInterval(iv);'
    +   'try{v.style.cssText="position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;object-fit:contain!important;z-index:9999!important";}catch(e){}'
    +   'v.muted=false;v.play().catch(function(){});'
    + '},500);';
}

function streamcJS() {
  return `
if((location.hostname||"").indexOf("streamc.xyz")===-1){console.log("[NGUONC] skip "+location.hostname);return;}
function log(m){try{console.log("[NGUONC] "+m);}catch(e){}}
function _isVis(el){if(!el)return false;try{var s=getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden"&&s.opacity!=="0";}catch(e){return false;}}
function _findVideo(){var v=document.getElementById("video")||document.querySelector("video");return (v&&v.readyState>=1)?v:null;}
function _clickResume(){
  var rb=document.getElementById("resumeBtn");
  if(_isVis(rb)){log("auto-click resumeBtn");try{rb.click();return true;}catch(e){}}
  var rtb=document.getElementById("restartBtn");
  if(_isVis(rtb)){log("auto-click restartBtn");try{rtb.click();return true;}catch(e){}}
  return false;
}
function _lock(v){
  window.__vaxV=v;
  log("locked vw="+v.videoWidth+" vh="+v.videoHeight+" dur="+v.duration+" rs="+v.readyState);
  var _savedTime=v.currentTime||0;
  try{var _hi=window.setTimeout(function(){},0);for(var _i=0;_i<=_hi;_i++){window.clearTimeout(_i);window.clearInterval(_i);}}catch(e){}
  var box=document.createElement("div");
  box.id="vax-streamc-box";
  box.style.cssText="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:2147483647;overflow:hidden;margin:0;padding:0;display:flex;align-items:center;justify-content:center;";
  try{v.removeAttribute("style");v.removeAttribute("class");}catch(e){}
  v.setAttribute("playsinline","");v.setAttribute("webkit-playsinline","");
  v.style.cssText="width:100%;height:100%;object-fit:contain;background:#000;display:block;margin:0;padding:0;border:0;outline:none;flex-shrink:0;";
  box.appendChild(v);
  try{
    Array.from(document.head.children).forEach(function(c){if(c.id!=="vax-streamc-box"){try{c.remove();}catch(e){}}});
    var _m1=document.createElement("meta");_m1.setAttribute("charset","UTF-8");document.head.appendChild(_m1);
    var _m2=document.createElement("meta");_m2.name="viewport";_m2.content="width=device-width,initial-scale=1.0";document.head.appendChild(_m2);
  }catch(e){log("head clean fail "+e.message);}
  try{Array.from(document.body.children).forEach(function(c){if(c.id==="vax-streamc-box")return;try{c.remove();}catch(e){}});}catch(e){log("body clean fail "+e.message);}
  document.documentElement.style.cssText="margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000;";
  document.body.style.cssText="margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000;";
  document.body.appendChild(box);
  try{if(_savedTime>0.5&&isFinite(v.duration)&&v.duration>_savedTime){v.currentTime=_savedTime;}}catch(e){}
  v.muted=false;
  v.play().then(function(){log("play OK");}).catch(function(e){log("autoplay fail "+e.message);v.muted=true;v.play().then(function(){log("play muted OK");}).catch(function(e2){log("play muted fail "+e2.message);});});
  function post(t,d){try{window.parent.postMessage(Object.assign({type:t},d||{}),"*");}catch(e){}}
  function _postTime(){try{if(v&&isFinite(v.duration)&&v.duration>0)post("NGUONC_TIME",{time:v.currentTime||0,duration:v.duration});}catch(e){}}
  v.addEventListener("timeupdate",_postTime);
  v.addEventListener("loadedmetadata",_postTime);
  v.addEventListener("durationchange",_postTime);
  v.addEventListener("seeked",_postTime);
  v.addEventListener("play",function(){post("NGUONC_STATE",{paused:false});_postTime();});
  v.addEventListener("pause",function(){post("NGUONC_STATE",{paused:true});_postTime();});
  if(!window.__streamcTimeIv)window.__streamcTimeIv=setInterval(_postTime,500);
  setTimeout(function(){try{var q=v.getVideoPlaybackQuality?v.getVideoPlaybackQuality():null;var rect=v.getBoundingClientRect();log("after3s t="+v.currentTime.toFixed(1)+" rs="+v.readyState+" paused="+v.paused+" frames="+(q?q.totalVideoFrames:-1)+" box="+Math.round(rect.left)+","+Math.round(rect.top)+","+Math.round(rect.width)+"x"+Math.round(rect.height)+" bodyKids="+document.body.children.length);}catch(e){log("dbg fail "+e.message);}},3000);
}
window.addEventListener("message",function(e){
  var d=e.data||{};if(!d.vaxCmd)return;
  var v=window.__vaxV;
  if(!v){log("cmd "+d.vaxCmd+" no video");return;}
  log("cmd "+d.vaxCmd+(d.val!=null?" val="+d.val:""));
  function _syncT(){try{if(isFinite(v.duration)&&v.duration>0)window.parent.postMessage({type:"NGUONC_TIME",time:v.currentTime||0,duration:v.duration},"*");}catch(err){}}
  if(d.vaxCmd==="toggle"){if(v.paused)v.play().catch(function(e){log("play fail "+e.message);});else v.pause();}
  else if(d.vaxCmd==="seek"){var _st=Number(d.val!=null?d.val:d.value);if(isFinite(_st)&&_st>=0){v.currentTime=(isFinite(v.duration)&&v.duration>0)?Math.min(v.duration,_st):_st;_syncT();}}
  else if(d.vaxCmd==="seek+5"){if(isFinite(v.duration)&&v.duration>0){v.currentTime=Math.min(v.duration,v.currentTime+5);_syncT();log("→"+v.currentTime.toFixed(1));}else{log("seek fail dur="+v.duration);}}
  else if(d.vaxCmd==="seek-5"){if(isFinite(v.duration)&&v.duration>0){v.currentTime=Math.max(0,v.currentTime-5);_syncT();log("→"+v.currentTime.toFixed(1));}else{log("seek fail dur="+v.duration);}}
  else if(d.vaxCmd==="vol+"){v.volume=Math.min(1,v.volume+0.1);v.muted=false;}
  else if(d.vaxCmd==="vol-"){v.volume=Math.max(0,v.volume-0.1);v.muted=false;}
  else if(d.vaxCmd==="blur"){try{var _a=document.activeElement;if(_a&&_a.blur)_a.blur();if(document.body&&document.body.blur)document.body.blur();try{window.blur();}catch(e2){}log("blur cmd");}catch(e){log("blur fail "+e.message);}}
  else if(d.vaxCmd==="scale"){var _m=d.val||"contain";var _css="background:#000;display:block;margin:0;padding:0;border:0;outline:none;flex-shrink:0;";
    if(_m==="contain"){_css+="width:100%;height:100%;object-fit:contain;";}
    else if(_m==="cover"){_css+="width:100%;height:100%;object-fit:cover;";}
    else if(_m==="fill"){_css+="width:100%;height:100%;object-fit:fill;";}
    else if(_m==="fit-width"){_css+="width:100vw;height:auto;max-height:none;object-fit:contain;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto 0;";}
    else if(_m==="fit-height"){_css+="width:auto;height:100vh;max-width:none;object-fit:contain;position:absolute;top:0;bottom:0;left:0;right:0;margin:0 auto;";}
    else if(_m==="none"){_css+="width:auto;height:auto;max-width:none;max-height:none;object-fit:none;";}
    else{_css+="width:100%;height:100%;object-fit:contain;";}
    v.style.cssText=_css;log("scale="+_m);}
    else if(d.vaxCmd==="setPoster"){
      var _p=d.val; if(!_p) return;
      window.__vaxPoster=_p; log("setPoster len="+_p.length);
      var _apply=function(){
        var vs=document.querySelectorAll("video");
        for(var i=0;i<vs.length;i++){try{if(vs[i].poster!==_p)vs[i].poster=_p;}catch(e){}}
      };
      _apply();
      if(!window.__vaxPosterObs){
        window.__vaxPosterObs=new MutationObserver(_apply);
        window.__vaxPosterObs.observe(document.documentElement,{childList:true,subtree:true});
        log("poster observer armed");
      }
    }
},false);
var __v0=_findVideo();
if(__v0){_lock(__v0);}
else{
  setTimeout(function(){
    var v=_findVideo();
    if(v){_lock(v);return;}
    if(!_clickResume()){log("chưa có video và không có resume btn — chờ tiếp");}
  },1000);
  var __waited=0;
  var __iv=setInterval(function(){
    var v=_findVideo();
    if(v){clearInterval(__iv);_lock(v);return;}
    __waited+=400;
    if(__waited>1200 && __waited%2400<400){_clickResume();}
    if(__waited>20000){clearInterval(__iv);log("timeout no video after 20s");}
  },400);
}
`;
}

function vicdnJS() {
  return `
console.log("[VICDN] start | " + location.href);
if((location.hostname||"").indexOf("vicdn.cc")===-1){console.log("[VICDN] skip");return;}

function log(m){try{console.log("[VICDN] "+m);}catch(e){}}
function post(t,d){try{window.parent.postMessage(Object.assign({type:t},d||{}),"*");}catch(e){}}

/* ═══ Size ═══ */
(function(){
  var s=document.createElement('style');
  s.id='vax-vicdn-size';
  s.textContent='html,body{margin:0!important;padding:0!important;background:#000!important;overflow:hidden!important;width:100%!important;height:100%!important}'
    +'#ssPlay,.jw-wrapper,.jwplayer{width:100vw!important;height:100vh!important;background:#000!important}';
  (document.head||document.documentElement).appendChild(s);
})();

function _getVideo(){
  return document.querySelector('#ssPlay video')
      || document.querySelector('.jw-media video')
      || document.querySelector('.jw-wrapper video')
      || document.querySelector('video');
}

/* ═══ SCALE ═══ */
var __lastScale = 'contain';
function applyScale(mode){
  __lastScale = mode || 'contain';
  var v = _getVideo();
  if(!v){ return; }
  v.style.objectFit=''; v.style.objectPosition='';
  v.style.width=''; v.style.height='';
  v.style.maxWidth=''; v.style.maxHeight='';
  v.style.position=''; v.style.inset='';
  v.style.left=''; v.style.right=''; v.style.top=''; v.style.bottom='';
  v.style.transform='';
  switch(mode){
    case 'contain': v.style.objectFit='contain'; break;
    case 'cover': v.style.objectFit='cover'; break;
    case 'fill': v.style.objectFit='fill'; break;
    case 'fit-width':
      v.style.objectFit='contain'; v.style.width='100%'; v.style.height='auto';
      v.style.maxHeight='none'; v.style.position='absolute';
      v.style.top='0'; v.style.bottom='0'; v.style.left='0'; v.style.right='0';
      v.style.margin='auto 0';
      break;
    case 'fit-height':
      v.style.objectFit='contain'; v.style.height='100%'; v.style.width='auto';
      v.style.maxWidth='none'; v.style.position='absolute';
      v.style.top='0'; v.style.bottom='0'; v.style.left='0'; v.style.right='0';
      v.style.margin='0 auto';
      break;
    case 'none': v.style.objectFit='none'; break;
    default: v.style.objectFit='contain';
  }
}

/* ═══════════════════════════════════════════════════════════════
   ⭐ ĐỔI GIỌNG
   ĐIỂM MẤU CHỐT: doChangeSv là const/let global (KHÔNG ở window).
   Native inject Custom-Js cùng main world → thấy được nó qua tên trực tiếp.
   ═══════════════════════════════════════════════════════════════ */
function _setAudioByTm(tm){
  log("═══ setAudio tm="+tm+" ═══");
  post("VICDN_AUDIO_STATE", { tm: tm });

  /* ── L1: gọi trực tiếp doChangeSv (không window.) ── */
  try {
    if (typeof doChangeSv === 'function') {
      doChangeSv(tm);
      log("✅ L1 doChangeSv('"+tm+"') OK");
      return;
    }
    log("L1 typeof doChangeSv=" + typeof doChangeSv);
  } catch(e) { log("L1 err: " + e.message); }

  /* ── L2: window.doChangeSv (phòng trường hợp có ở window) ── */
  try {
    if (typeof window.doChangeSv === 'function') {
      window.doChangeSv(tm);
      log("✅ L2 window.doChangeSv('"+tm+"') OK");
      return;
    }
    log("L2 typeof window.doChangeSv=" + typeof window.doChangeSv);
  } catch(e) { log("L2 err: " + e.message); }

  /* ── L3: click element có onclick="doChangeSv('tm')" ── */
  try {
    var all = document.querySelectorAll('[onclick]');
    log("L3 có " + all.length + " element có onclick");
    for (var i = 0; i < all.length; i++) {
      var oc = all[i].getAttribute('onclick') || '';
      if (oc.indexOf('doChangeSv') > -1 && oc.indexOf("'" + tm + "'") > -1) {
        all[i].click();
        log("✅ L3 click onclick=doChangeSv('"+tm+"')");
        return;
      }
    }
    for (var j = 0; j < Math.min(all.length, 8); j++) {
      log("  L3["+j+"] onclick=" + (all[j].getAttribute('onclick')||'').slice(0,90));
    }
    log("L3 ❌ không match");
  } catch(e) { log("L3 err: " + e.message); }

  /* ── L4: fallback URL + localStorage + reload ── */
  log("→ L4 URL+localStorage+reload");
  var path = location.pathname.replace(/^\\//, '');
  var key = 'selected_sv_' + path;
  try{
    localStorage.setItem(key, tm);
    log("L4 localStorage["+key+"] = "+tm);
  }catch(e){ log("L4 ls fail: " + e.message); }

  var href = location.href;
  var _count = 0;
  href = href.replace(/tm=[^&\\s]*/g, function(){ _count++; return 'tm=' + tm; });
  if(_count === 0){
    href += (href.indexOf('?') > -1 ? '&' : '?') + 'tm=' + tm;
  }
  log("L4 reload → " + href.slice(0,240));
  setTimeout(function(){ location.href = href; }, 200);
}

/* ═══ JW BIND ═══ */
var __jw=null, __bound=false, __autoDone=false, __playDone=false;

function _tryGetJw(){
  if(!window.jwplayer) return null;
  try{ var p=window.jwplayer(); if(p&&typeof p.on==='function')return p; }catch(e){}
  try{ var p2=window.jwplayer("ssPlay"); if(p2&&typeof p2.on==='function')return p2; }catch(e){}
  try{
    var ids = window.jwplayer && window.jwplayer.utils && window.jwplayer.utils.instances;
    if(ids){
      var keys = Object.keys(ids);
      for(var i=0;i<keys.length;i++){
        var p3 = window.jwplayer(keys[i]);
        if(p3 && typeof p3.on==='function') return p3;
      }
    }
  }catch(e){}
  return null;
}

function _tryAutoPlay(){
  if(!__jw || __playDone) return;
  var st='';
  try{ st = __jw.getState ? __jw.getState() : ''; }catch(e){}
  if(st === 'playing'){ __playDone=true; return; }
  __playDone = true;
  try{
    try{ __jw.setMute(false); }catch(e){}
    var r = __jw.play();
    if(r && r.then) r.then(function(){ log("✅ auto OK"); }).catch(function(e){ log("⚠️ "+e.message); });
  }catch(e){ log("play err: "+e.message); }
}

/* ⭐ DOM QUALITY MENU (jw-settings) — đọc + click trực tiếp ⭐ */
function _domQBox(){
  try{
    return document.getElementById('jw-player-settings-submenu-quality')
        || document.querySelector('.jw-settings-submenu-quality');
  }catch(e){ return null; }
}
function _domQBtns(){
  var box=_domQBox();
  if(!box || !box.querySelectorAll) return [];
  var ns=box.querySelectorAll('button');
  if(!ns.length) ns=box.querySelectorAll('[role="menuitemradio"],.jw-settings-content-item');
  var out=[]; for(var i=0;i<ns.length;i++) out.push(ns[i]);
  return out;
}
function _domQLabel(b){
  if(!b) return "?";
  var t="";
  try{ t = b.getAttribute('aria-label') || ""; }catch(e){}
  if(!t){ try{ t = (b.textContent||""); }catch(e){} }
  t = String(t).replace(/\s+/g," ").trim();
  return t || "?";
}
function _domLevels(){
  var btns=_domQBtns(), out=[];
  for(var i=0;i<btns.length;i++){
    var label=_domQLabel(btns[i]);
    out.push({ label: label, height: parseInt(label,10)||0, bitrate: 0 });
  }
  return out;
}
function _domCurrent(){
  var btns=_domQBtns();
  for(var i=0;i<btns.length;i++){
    var b=btns[i];
    try{
      if(b.classList && b.classList.contains('jw-settings-item-active')) return i;
      if(b.getAttribute && b.getAttribute('aria-checked')==='true') return i;
    }catch(e){}
  }
  return -1;
}
function _domBest(){
  var btns=_domQBtns(), best=-1, bestH=-1;
  for(var i=0;i<btns.length;i++){
    var h=parseInt(_domQLabel(btns[i]),10)||0;
    if(h>bestH){ bestH=h; best=i; }
  }
  if(best<0 && btns.length) best=btns.length-1;
  return best;
}
function _domClick(i){
  var btns=_domQBtns();
  if(i<0 || i>=btns.length) return false;
  try{ btns[i].click(); log("🖱️ click quality DOM #"+i+" ("+_domQLabel(btns[i])+")"); return true; }
  catch(e){ log("dom click err: "+e.message); return false; }
}
function _openQualityMenu(){
  try{
    var box=_domQBox();
    var expanded = box && box.getAttribute('aria-expanded')==='true';
    if(!expanded){
      var icon=document.querySelector('.jw-icon-settings');
      if(icon){ icon.click(); log("mở settings menu"); }
    }
    setTimeout(function(){
      try{
        var toggle=document.querySelector('[aria-controls="jw-player-settings-submenu-quality"]');
        if(toggle) toggle.click();
      }catch(e){}
    }, 150);
  }catch(e){}
}
var __menuTried=false;
function _domClickEnsure(i){
  if(!_domClick(i)) return false;
  setTimeout(function(){
    if(_domCurrent()!==i){
      if(!__menuTried){
        __menuTried=true;
        log("dom click chưa ăn → mở menu thử lại");
        _openQualityMenu();
        setTimeout(function(){
          _domClick(i); _postLevels();
          try{ var icon=document.querySelector('.jw-icon-settings'); if(icon) icon.click(); }catch(e){}
        }, 300);
      }
    } else { _postLevels(); }
  }, 300);
  return true;
}

function _postLevels(){
  try{
    var dl=_domLevels();
    if(dl.length){ post("NGUONC_QUALITY", { levels: dl, current: _domCurrent() }); return; }
    if(!__jw) return;
    var lv = __jw.getQualityLevels ? __jw.getQualityLevels() : [];
    if(!lv || !lv.length) return;
    var levels=[];
    for(var i=0;i<lv.length;i++){
      var l=lv[i]||{};
      levels.push({
        label: l.label || (l.height ? (l.height+"p") : (l.name||"?")),
        height: Number(l.height)||0,
        bitrate: Number(l.bitrate)||0
      });
    }
    var cur=-1;
    try{ cur = __jw.getCurrentQuality(); }catch(e){}
    post("NGUONC_QUALITY", { levels: levels, current: cur });
  }catch(e){}
}

function _setHighestQuality(){
  try{
    var best=_domBest();
    if(best>=0){
      if(_domCurrent()===best){ _postLevels(); return true; }
      log("⬆️ (DOM) chọn cao nhất → #"+best);
      _domClickEnsure(best);
      return true;
    }
  }catch(e){}
  if(!__jw) return false;
  try{
    var levels = __jw.getQualityLevels ? __jw.getQualityLevels() : [];
    if(levels && levels.length > 1){ __jw.setCurrentQuality(levels.length - 1); }
    _postLevels();
  }catch(e){}
  return true;
}

function _onReady(){
  if(!__jw || __autoDone) return;
  var st='';
  try{ st = __jw.getState ? __jw.getState() : ''; }catch(e){}
  if(st === 'idle') return;
  __autoDone = true;
  log("═══ JW READY ═══");
  _setHighestQuality();
  _postLevels();
  setTimeout(_setHighestQuality, 1500);
  setTimeout(_setHighestQuality, 3500);
  setTimeout(_setHighestQuality, 6000);
  var qt=0;
  var qiv=setInterval(function(){
    qt++;
    try{ _setHighestQuality(); }catch(e){}
    if(qt>=20) clearInterval(qiv);
  }, 1000);
  setTimeout(_tryAutoPlay, 500);
  setTimeout(function(){ applyScale(__lastScale); }, 500);
  setTimeout(function(){ applyScale(__lastScale); }, 2000);
  post("NGUONC_STATE", { ready: true });
}

function _postVicdnTime(){
  try{
    var cur=0, dur=0;
    if(__jw){
      try{ cur=Number(__jw.getPosition())||0; dur=Number(__jw.getDuration())||0; }catch(e){}
    }
    var v=_getVideo();
    if((!dur || !isFinite(dur) || dur<=0) && v){
      dur=Number(v.duration)||0;
    }
    if((!cur || !isFinite(cur)) && v){
      cur=Number(v.currentTime)||0;
    }
    if(isFinite(dur) && dur>0){
      post("NGUONC_TIME",{time:cur,duration:dur});
    }
  }catch(e){}
}

function _bindVicdnVideo(){
  var v=_getVideo();
  if(!v || v.__vaxVicdnBound) return !!v;
  v.__vaxVicdnBound=true;
  try{
    v.addEventListener("timeupdate",_postVicdnTime);
    v.addEventListener("loadedmetadata",_postVicdnTime);
    v.addEventListener("durationchange",_postVicdnTime);
    v.addEventListener("seeked",_postVicdnTime);
    v.addEventListener("play",function(){ post("NGUONC_STATE",{paused:false}); _postVicdnTime(); });
    v.addEventListener("pause",function(){ post("NGUONC_STATE",{paused:true}); _postVicdnTime(); });
  }catch(e){}
  return true;
}

function bindJW(){
  _bindVicdnVideo();
  if(__bound) return true;
  var p = _tryGetJw();
  if(!p) return false;
  __jw=p; __bound=true;
  log("✅ BOUND");
  try{
    p.on("ready", function(){ setTimeout(_onReady,300); });
    p.on("play", function(){ post("NGUONC_STATE",{paused:false}); _postVicdnTime(); });
    p.on("pause", function(){ post("NGUONC_STATE",{paused:true}); _postVicdnTime(); });
    p.on("time", function(e){
      var pos = (e && typeof e.position === "number") ? e.position : 0;
      var dur = (e && typeof e.duration === "number" && e.duration > 0) ? e.duration : 0;
      if (!dur) { var v = _getVideo(); if (v && isFinite(v.duration) && v.duration > 0) dur = v.duration; }
      if (dur > 0) post("NGUONC_TIME",{time:pos,duration:dur});
    });
    p.on("seek", function(e){
      var off = (e && typeof e.offset === "number") ? e.offset : ((p.getPosition && p.getPosition()) || 0);
      var dur = (p.getDuration && p.getDuration()) || 0;
      if (!dur) { var v = _getVideo(); if (v && isFinite(v.duration) && v.duration > 0) dur = v.duration; }
      if (dur > 0) post("NGUONC_TIME",{time:off,duration:dur});
    });
  }catch(e){}
  var iv = setInterval(function(){
    if(!__bound || __autoDone){ clearInterval(iv); return; }
    try{
      var st = p.getState ? p.getState() : '';
      if(st && st !== 'idle' && st !== ''){ clearInterval(iv); _onReady(); }
    }catch(e){}
  }, 300);
  setTimeout(function(){
    if(!__autoDone){ __autoDone = true; setTimeout(_tryAutoPlay, 200); }
  }, 6000);
  return true;
}
if(!window.__vicdnTimeIv){
  window.__vicdnTimeIv=setInterval(function(){ _bindVicdnVideo(); _postVicdnTime(); },500);
}

function jwCmd(c, val){
  log("cmd "+c+(val!=null?" val="+val:""));
  if(!__bound) bindJW();
  var v = _getVideo();
  try{
    if(c==="toggle"){
      if(__jw){ var st=__jw.getState(); if(st==="playing") __jw.pause(); else __jw.play(); }
      else if(v){ if(v.paused) v.play().catch(function(){}); else v.pause(); }
    }
    else if(c==="seek"){
      var t = Number(val);
      if(isFinite(t) && t >= 0){
        var d0 = (__jw && __jw.getDuration) ? (__jw.getDuration()||0) : (v && isFinite(v.duration) ? v.duration : 0);
        var tgt = d0 > 0 ? Math.min(d0, t) : t;
        try{ if(__jw && __jw.seek) __jw.seek(tgt); }catch(e){}
        try{ if(v) v.currentTime = tgt; }catch(e){}
        _postVicdnTime();
      }
    }
    else if(c==="seek+5" || c==="seek-5"){
      var dlt = c==="seek+5" ? 5 : -5;
      var d = (__jw && __jw.getDuration) ? (__jw.getDuration()||0) : 0;
      var cur = (__jw && __jw.getPosition) ? (__jw.getPosition()||0) : 0;
      if(!d && v && isFinite(v.duration)) d = v.duration||0;
      if(!cur && v) cur = v.currentTime||0;
      var target = Math.max(0, cur + dlt);
      if(d > 0) target = Math.min(d, target);
      try{ if(__jw && __jw.seek) __jw.seek(target); }catch(e){}
      try{ if(v) v.currentTime = target; }catch(e){}
      _postVicdnTime();
    }
    else if(c==="vol+"){
      if(__jw && __jw.setVolume) __jw.setVolume(Math.min(100,(__jw.getVolume()||0)+10));
      else if(v){ v.volume = Math.min(1, v.volume + 0.1); v.muted = false; }
    }
    else if(c==="vol-"){
      if(__jw && __jw.setVolume) __jw.setVolume(Math.max(0,(__jw.getVolume()||0)-10));
      else if(v){ v.volume = Math.max(0, v.volume - 0.1); v.muted = false; }
    }
    else if(c==="quality"){
      var qi = parseInt(val,10);
      if(isNaN(qi) || qi < 0){ log("quality → auto (cao nhất)"); _setHighestQuality(); }
      else if(_domQBtns().length){ log("quality → DOM #"+qi); _domClickEnsure(qi); }
      else {
        log("quality → API #"+qi);
        try{ __jw.setCurrentQuality(qi); }catch(e){ log("setQ err: "+e.message); }
        _postLevels();
      }
    }
    else if(c==="blur"){ try{ var a=document.activeElement; if(a&&a.blur)a.blur(); }catch(e){} }
    else if(c==="scale"){ applyScale(val||"contain"); }
  }catch(e){ log("cmd err: "+e.message); }
}

window.addEventListener("message", function(ev){
  var d=ev.data||{};
  if(!d.vaxCmd) return;

  if(d.vaxCmd === 'setAudio'){
    _setAudioByTm(d.val);
    return;
  }

  /* ⭐ Nhận poster từ parent → gán cho mọi <video> */
  if(d.vaxCmd === 'setPoster'){
    var _p = d.val; if(!_p) return;
    window.__vaxPoster = _p;
    log("setPoster len=" + _p.length);
    var _apply = function(){
      var vs = document.querySelectorAll("video");
      for(var i = 0; i < vs.length; i++){ try{ if(vs[i].poster !== _p) vs[i].poster = _p; }catch(e){} }
    };
    _apply();
    if(!window.__vaxPosterObs){
      window.__vaxPosterObs = new MutationObserver(_apply);
      window.__vaxPosterObs.observe(document.documentElement, {childList:true, subtree:true});
      log("poster observer armed");
    }
    return;
  }

  jwCmd(d.vaxCmd, d.val != null ? d.val : d.value);
});

function _r(){ try{window.parent.postMessage({type:"vax_ready"},"*");}catch(e){} }
_r(); setTimeout(_r,300); setTimeout(_r,1000);

var tries=0;
var iv2=setInterval(function(){
  tries++;
  if(bindJW()){ clearInterval(iv2); return; }
  if(tries>150) clearInterval(iv2);
}, 200);
`;
}

function abyssJS() {
  return `
var __ah = (location.hostname||"");
if(__ah.indexOf("abysscdn")===-1 && __ah.indexOf("abyss.to")===-1 && __ah.indexOf("hydrax")===-1 && __ah.indexOf("streamc")===-1){ console.log("[ABYSS] skip "+__ah); return; }
console.log("[ABYSS] start | " + location.href);

function log(m){try{console.log("[ABYSS] "+m);}catch(e){}}
function post(t,d){try{window.parent.postMessage(Object.assign({type:t},d||{}),"*");}catch(e){}}

/* ═══ Size + chặn click quảng cáo + ẩn UI JW thừa ═══ */
(function(){
  var s=document.createElement('style');
  s.id='vax-abyss-size';
  s.textContent='html,body{margin:0!important;padding:0!important;background:#000!important;overflow:hidden!important;width:100%!important;height:100%!important}'
    +'[class*=popup],[class*=ads],iframe[id*=ad]{display:none!important}'
    /* ⭐ Ẩn nút play lớn giữa màn hình, overlay loading, notify custom */
    +'.jw-icon-display, #overlay, .jwpl-notify-custom { display:none!important; }'
    /* Overlay vẫn cho click xuyên để toggle play qua JW */
    +'#overlay{pointer-events:none!important}'
    +'#player,.jw-wrapper,.jwplayer{width:100vw!important;height:100vh!important;background:#000!important}';
  (document.head||document.documentElement).appendChild(s);
})();

/* ═══ WATCHER: click .jwpl-notify-custom-continue khi xuất hiện ═══ */
var __notifyObs=null, __lastNotifyClick=0;
function _tryClickNotify(){
  var now=Date.now();
  if(now-__lastNotifyClick<500) return;
  var btns=document.querySelectorAll('.jwpl-notify-custom-continue');
  for(var i=0;i<btns.length;i++){
    var b=btns[i];
    if(b && (b.offsetParent!==null || b.getClientRects().length>0)){
      log("👆 click notify-continue #"+i);
      try{ b.click(); __lastNotifyClick=now; }catch(e){}
      return;
    }
  }
}
function _watchNotify(){
  if(__notifyObs) return;
  try{
    __notifyObs=new MutationObserver(_tryClickNotify);
    __notifyObs.observe(document.documentElement,{
      childList:true, subtree:true,
      attributes:true, attributeFilter:['style','class','display']
    });
    log("watcher notify-continue OK");
  }catch(e){ log("obs err: "+e.message); }
  /* Fallback interval phòng khi observer bỏ sót */
  setInterval(_tryClickNotify, 1500);
}
_watchNotify();

function _getVideo(){
  return document.querySelector('#player video')
      || document.querySelector('#playback video')
      || document.querySelector('.jw-media video')
      || document.querySelector('.jw-wrapper video')
      || document.querySelector('video');
}

/* ═══ SCALE ═══ */
var __lastScale = 'contain';
function applyScale(mode){
  __lastScale = mode || 'contain';
  var v = _getVideo();
  if(!v){ return; }
  v.style.objectFit=''; v.style.objectPosition='';
  v.style.width=''; v.style.height='';
  v.style.maxWidth=''; v.style.maxHeight='';
  v.style.position=''; v.style.inset='';
  v.style.left=''; v.style.right=''; v.style.top=''; v.style.bottom='';
  v.style.transform='';
  switch(mode){
    case 'contain': v.style.objectFit='contain'; break;
    case 'cover': v.style.objectFit='cover'; break;
    case 'fill': v.style.objectFit='fill'; break;
    case 'fit-width':
      v.style.objectFit='contain'; v.style.width='100%'; v.style.height='auto';
      v.style.maxHeight='none'; v.style.position='absolute';
      v.style.top='0'; v.style.bottom='0'; v.style.left='0'; v.style.right='0';
      v.style.margin='auto 0';
      break;
    case 'fit-height':
      v.style.objectFit='contain'; v.style.height='100%'; v.style.width='auto';
      v.style.maxWidth='none'; v.style.position='absolute';
      v.style.top='0'; v.style.bottom='0'; v.style.left='0'; v.style.right='0';
      v.style.margin='0 auto';
      break;
    case 'none': v.style.objectFit='none'; break;
    default: v.style.objectFit='contain';
  }
}

/* ═══ JW BIND ═══ */
var __jw=null, __bound=false, __autoDone=false, __playDone=false;

function _jwCandidates(){
  var arr=[];
  try{
    var ids = (window.jwplayer && window.jwplayer.utils && window.jwplayer.utils.instances) || {};
    Object.keys(ids).forEach(function(k){ try{ var p=window.jwplayer(k); if(p) arr.push({id:k,p:p}); }catch(e){} });
  }catch(e){}
  /* ⭐ Thêm candidate theo DOM element: jwplayer(<containerEl>) trả đúng instance */
  try{
    var els=document.querySelectorAll('.jwplayer, .jw-wrapper, #player, #playback, [id^="player"]');
    for(var i=0;i<els.length;i++){
      var el=els[i];
      try{ var pe=window.jwplayer(el); if(pe) arr.push({id:'el:'+(el.id||i),p:pe}); }catch(e){}
    }
  }catch(e){}
  return arr;
}
function _jwScore(c){
  try{
    if(!c.p || typeof c.p.on!=='function') return -1;
    var s=0, ctr=null;
    try{ ctr = c.p.getContainer ? c.p.getContainer() : null; }catch(e){}
    /* ⭐ BẮT BUỘC có container thật — tránh bind instance rỗng (jwplayer() no-arg) */
    if(!ctr || ctr.nodeType!==1) return -1;
    s+=5;
    try{ if(ctr.querySelector && ctr.querySelector('video')) s+=6; }catch(e){}
    try{ var st = c.p.getState ? c.p.getState() : ''; if(st==='playing') s+=10; else if(st && st!=='idle') s+=4; }catch(e){ return -1; }
    if(c.id==='player') s+=4;
    return s;
  }catch(e){ return -1; }
}
function _tryGetJw(){
  if(!window.jwplayer) return null;
  var cs=_jwCandidates();
  cs.sort(function(a,b){ return _jwScore(b)-_jwScore(a); });
  try{ log("instances: " + (cs.length ? cs.map(function(c){ return c.id+"="+_jwScore(c); }).join(", ") : "(none)") + " | video=" + document.querySelectorAll('video').length); }catch(e){}
  for(var i=0;i<cs.length;i++){ if(_jwScore(cs[i])>=0) return cs[i].p; }
  return null;
}

var __playing=false;
function _state(){ try{ return __jw && __jw.getState ? __jw.getState() : ''; }catch(e){ return ''; } }

/* ⭐ DOM QUALITY MENU (jw-settings) — đọc + click trực tiếp, chắc ăn hơn API ⭐ */
function _domQBox(){
  try{
    var boxes = document.querySelectorAll('#jw-player-settings-submenu-quality, .jw-settings-submenu-quality');
    var fallback=null;
    for(var i=0;i<boxes.length;i++){
      var b=boxes[i];
      if(b && (b.offsetParent!==null || b.getClientRects().length>0)) return b;
      if(!fallback) fallback=b;
    }
    if(fallback) return fallback;
    return document.getElementById('jw-player-settings-submenu-quality');
  }catch(e){ return null; }
}
function _domQBtns(){
  var box=_domQBox();
  if(!box || !box.querySelectorAll) return [];
  var ns=box.querySelectorAll('button');
  if(!ns.length) ns=box.querySelectorAll('[role="menuitemradio"],.jw-settings-content-item');
  var out=[]; for(var i=0;i<ns.length;i++) out.push(ns[i]);
  return out;
}
function _domQLabel(b){
  if(!b) return "?";
  var t="";
  try{ t = b.getAttribute('aria-label') || ""; }catch(e){}
  if(!t){ try{ t = (b.textContent||""); }catch(e){} }
  t = String(t).replace(/\s+/g," ").trim();
  return t || "?";
}
function _domLevels(){
  var btns=_domQBtns(), out=[];
  for(var i=0;i<btns.length;i++){
    var label=_domQLabel(btns[i]);
    out.push({ label: label, height: parseInt(label,10)||0, bitrate: 0 });
  }
  return out;
}
function _domCurrent(){
  var btns=_domQBtns();
  for(var i=0;i<btns.length;i++){
    var b=btns[i];
    try{
      if(b.classList && b.classList.contains('jw-settings-item-active')) return i;
      if(b.getAttribute && b.getAttribute('aria-checked')==='true') return i;
    }catch(e){}
  }
  return -1;
}
function _domBest(){
  var btns=_domQBtns(), best=-1, bestH=-1;
  for(var i=0;i<btns.length;i++){
    var h=parseInt(_domQLabel(btns[i]),10)||0;
    if(h>bestH){ bestH=h; best=i; }
  }
  if(best<0 && btns.length) best=btns.length-1;
  return best;
}
/* Bắn chuỗi sự kiện chuột/pointer đầy đủ — JW nghe pointerup/mouseup ngoài click */
function _fireClick(el){
  var opts={bubbles:true,cancelable:true,view:window,composed:true};
  var types=['pointerdown','mousedown','pointerup','mouseup','click'];
  for(var i=0;i<types.length;i++){
    var t=types[i], E=null;
    try{
      if(t.indexOf('pointer')===0 && window.PointerEvent) E=new PointerEvent(t,opts);
      else if(window.MouseEvent) E=new MouseEvent(t,opts);
    }catch(e){}
    try{ el.dispatchEvent(E || new Event(t,opts)); }catch(e){}
  }
  try{ el.click(); }catch(e){}
}
function _domClick(i){
  var btns=_domQBtns();
  if(i<0 || i>=btns.length) return false;
  try{
    var b=btns[i];
    var vis = (b.offsetParent!==null || b.getClientRects().length>0);
    log("🖱️ click quality DOM #"+i+" ("+_domQLabel(b)+") visible="+vis);
    _fireClick(b);
    return true;
  }catch(e){ log("dom click err: "+e.message); return false; }
}
function _settingsOpen(){
  try{
    var m=document.querySelector('.jw-settings-menu');
    if(!m) return false;
    if(m.getAttribute('aria-expanded')==='true') return true;
    if(m.classList && (m.classList.contains('jw-settings-open')||m.classList.contains('jw-settings-menu-open'))) return true;
    if(m.offsetParent!==null && m.getBoundingClientRect().width>0) return true;
  }catch(e){}
  return false;
}
function _openQualityMenu(cb){
  try{
    log("mở settings menu | open="+_settingsOpen());
    if(!_settingsOpen()){
      var icon=document.querySelector('.jw-icon-settings, .jw-controlbar .jw-icon-settings');
      if(icon) _fireClick(icon); else log("⚠️ không thấy .jw-icon-settings");
    }
  }catch(e){}
  setTimeout(function(){
    try{
      var qi=document.querySelector('.jw-settings-menu [aria-controls="jw-player-settings-submenu-quality"]')
          || document.querySelector('[aria-controls="jw-player-settings-submenu-quality"]');
      if(qi){ log("mở submenu quality"); _fireClick(qi); }
      else log("⚠️ không thấy toggle submenu-quality");
    }catch(e){}
    setTimeout(function(){ if(cb) cb(); }, 350);
  }, 400);
}
/* Click + xác nhận; nếu chưa ăn thì mở menu rồi click lại */
var __menuTried=false;
function _domClickEnsure(i){
  function attempt(){
    _domClick(i);
    setTimeout(function(){
      var cur=_domCurrent();
      log("after click DOM #"+i+" → current="+cur+" | jw="+_jwCurSafe());
      if(cur===i){ _postLevels(); _closeMenu(); return; }
      if(!__menuTried){
        __menuTried=true;
        log("click DOM chưa ăn → mở menu rồi thử lại");
        _openQualityMenu(attempt);
      } else { _postLevels(); }
    }, 350);
  }
  attempt();
  return true;
}
function _jwCurSafe(){ try{ return (__jw && __jw.getCurrentQuality) ? __jw.getCurrentQuality() : 'n/a'; }catch(e){ return 'err'; } }
function _closeMenu(){
  try{ if(_settingsOpen()){ var icon=document.querySelector('.jw-icon-settings'); if(icon) _fireClick(icon); } }catch(e){}
}

/* ⭐ GỬI DANH SÁCH ĐỘ PHÂN GIẢI LÊN PARENT (UI control) ⭐ */
function _postLevels(){
  try{
    /* Ưu tiên DOM menu */
    var dl=_domLevels();
    if(dl.length){ post("NGUONC_QUALITY", { levels: dl, current: _domCurrent() }); return; }

    /* Fallback API */
    if(!__jw) return;
    var lv = __jw.getQualityLevels ? __jw.getQualityLevels() : [];
    if(!lv || !lv.length) return;
    var levels=[];
    for(var i=0;i<lv.length;i++){
      var l=lv[i]||{};
      levels.push({
        label: l.label || (l.height ? (l.height+"p") : (l.name||"?")),
        height: Number(l.height)||0,
        bitrate: Number(l.bitrate)||0
      });
    }
    var cur=-1;
    try{ cur = __jw.getCurrentQuality(); }catch(e){}
    post("NGUONC_QUALITY", { levels: levels, current: cur });
  }catch(e){}
}

/* ⭐ CHỌN ĐỘ PHÂN GIẢI CAO NHẤT ⭐ */
function _setHighestQuality(){
  /* Ưu tiên click DOM menu */
  try{
    var best=_domBest();
    if(best>=0){
      if(_domCurrent()===best){ _postLevels(); return true; }
      log("⬆️ (DOM) chọn cao nhất → #"+best+" ("+_domQLabel(_domQBtns()[best])+")");
      _domClickEnsure(best);
      /* Belt & suspenders: gọi API nếu có instance hợp lệ */
      try{ if(__jw && __jw.setCurrentQuality && _jwCurSafe()!=='n/a') __jw.setCurrentQuality(best); }catch(e){}
      return true;
    }
  }catch(e){}

  /* Fallback API */
  if(!__jw) return false;
  try{
    var levels = __jw.getQualityLevels ? __jw.getQualityLevels() : [];
    if(!levels || !levels.length){ log("no levels yet"); return false; }

    if(levels.length===1){
      log("quality: only 1 level ("+(levels[0].label||levels[0].height||"?")+")");
      _postLevels();
      return true;
    }

    /* Score = bitrate*1000 + height → ưu tiên bitrate, tie-break bằng height */
    var bestIdx=0, bestScore=-1;
    for(var i=0;i<levels.length;i++){
      var lv=levels[i]||{};
      var bw=Number(lv.bitrate)||0;
      var h=Number(lv.height)||0;
      var score=bw*1000+h;
      if(score>bestScore){ bestScore=score; bestIdx=i; }
    }

    var cur=-1;
    try{ cur=__jw.getCurrentQuality(); }catch(e){}
    if(cur===bestIdx){
      log("quality already @"+bestIdx+" ("+(levels[bestIdx].label||levels[bestIdx].height||"?")+")");
      _postLevels();
      return true;
    }

    log("⬆️ set quality (API) → "+bestIdx+"/"+(levels.length-1));
    try{ __jw.setCurrentQuality(bestIdx); }catch(e){ log("setQ err: "+e.message); }
    _postLevels();
    return true;
  }catch(e){ log("quality err: "+e.message); return false; }
}

var __playErrs=0;
function _forcePlay(){
  var st = _state();
  if(st === 'playing'){ __playing=true; return; }
  if(__jw && __playErrs < 3){
    try{ try{ __jw.setMute(false); }catch(e){} }catch(e){}
    var r=null;
    try{ r = __jw.play(); }
    catch(e){ __playErrs++; log("play err: "+e.message); }
    if(r && r.then){
      r.then(function(){ __playing=true; log("✅ jw play OK"); }).catch(function(e){
        __playErrs++;
        log("⚠️ jw play rejected: " + (e && e.message));
        try{ __jw.setMute(true); var r2=__jw.play(); if(r2&&r2.then)r2.then(function(){log("✅ muted OK");}).catch(function(){}); }catch(e2){}
      });
    } else if(r){ log("ℹ️ jw.play() called (state="+st+")"); }
  }
  var v = _getVideo();
  if(v){
    try{
      if(v.paused){
        v.muted=false;
        var pr=v.play();
        if(pr && pr.catch) pr.catch(function(){ try{ v.muted=true; var p2=v.play(); if(p2&&p2.catch)p2.catch(function(){}); }catch(e){} });
      }
    }catch(e){}
  }
  /* Nút play có thể đã bị ẩn qua CSS → thử click nếu vẫn tồn tại trong DOM */
  if(st==='idle' || st==='paused' || st===''){
    try{
      var bs=document.querySelectorAll('.jw-icon-playback,.jw-display-icon-container');
      for(var i=0;i<bs.length;i++){ var b=bs[i]; if(b && b.offsetParent!==null){ b.click(); break; } }
    }catch(e){}
  }
}

function _onReady(){
  if(__autoDone) return;
  var st=_state();
  if(st==='idle' || st==='') return;
  __autoDone = true;
  log("═══ JW READY ═══ state="+st);

  /* Gọi set quality nhiều lần để chắc chắn bắt được levels */
  _setHighestQuality();
  _postLevels();
  setTimeout(_setHighestQuality, 800);
  setTimeout(_setHighestQuality, 2000);
  setTimeout(_setHighestQuality, 4000);
  setTimeout(_setHighestQuality, 6000);

  /* Poll DOM quality menu ~20s: menu có thể render trễ sau khi player ready */
  var qt=0;
  var qiv=setInterval(function(){
    qt++;
    try{ _setHighestQuality(); }catch(e){}
    if(qt>=20) clearInterval(qiv);
  }, 1000);

  applyScale(__lastScale);
  setTimeout(function(){ applyScale(__lastScale); }, 1500);
  post("NGUONC_STATE", { ready: true });
}

function _postAbyssTime(){
  try{
    var cur=0, dur=0;
    if(__jw){
      try{ cur=Number(__jw.getPosition())||0; dur=Number(__jw.getDuration())||0; }catch(e){}
    }
    var v=_getVideo();
    if((!dur || !isFinite(dur) || dur<=0) && v){
      dur=Number(v.duration)||0;
    }
    if((!cur || !isFinite(cur)) && v){
      cur=Number(v.currentTime)||0;
    }
    if(isFinite(dur) && dur>0){
      post("NGUONC_TIME",{time:cur,duration:dur});
    }
  }catch(e){}
}

function _bindAbyssVideo(){
  var v = _getVideo();
  if(!v || v.__vaxAbyss) return !!v;
  v.__vaxAbyss = true;
  try{
    v.addEventListener('timeupdate', _postAbyssTime);
    v.addEventListener('loadedmetadata', _postAbyssTime);
    v.addEventListener('durationchange', _postAbyssTime);
    v.addEventListener('seeked', _postAbyssTime);
    v.addEventListener('play', function(){ __playing=true; post("NGUONC_STATE",{paused:false}); _postAbyssTime(); });
    v.addEventListener('pause', function(){ __playing=false; post("NGUONC_STATE",{paused:true}); _postAbyssTime(); });
  }catch(e){}
  return true;
}

function bindJW(){
  _bindAbyssVideo();
  if(__bound) return true;
  var p = _tryGetJw();
  if(!p) return false;
  __jw=p; __bound=true;
  log("✅ BOUND");
  try{
    p.on("ready", function(){ log("event ready"); _onReady(); });
    p.on("levels", function(e){ log("event levels n="+((e.levels||[]).length)); _setHighestQuality(); _postLevels(); });
    p.on("levelsChanged", function(e){ log("level changed → "+e.currentQuality); _postLevels(); });
    p.on("play", function(){ __playing=true; post("NGUONC_STATE",{paused:false}); _postAbyssTime(); });
    p.on("pause", function(){ __playing=false; post("NGUONC_STATE",{paused:true}); _postAbyssTime(); });
    p.on("time", function(e){
      var pos = (e && typeof e.position === "number") ? e.position : 0;
      var dur = (e && typeof e.duration === "number" && e.duration > 0) ? e.duration : 0;
      if (!dur) { var v = _getVideo(); if (v && isFinite(v.duration) && v.duration > 0) dur = v.duration; }
      if (dur > 0) post("NGUONC_TIME",{time:pos,duration:dur});
    });
    p.on("seek", function(e){
      var off = (e && typeof e.offset === "number") ? e.offset : ((p.getPosition && p.getPosition()) || 0);
      var dur = (p.getDuration && p.getDuration()) || 0;
      if (!dur) { var v = _getVideo(); if (v && isFinite(v.duration) && v.duration > 0) dur = v.duration; }
      if (dur > 0) post("NGUONC_TIME",{time:off,duration:dur});
    });
    p.on("error", function(e){ log("jw error: " + (e && (e.message||e.message)||e)); });
  }catch(e){}

  _bindAbyssVideo();

  var tries=0;
  var iv = setInterval(function(){
    tries++;
    _bindAbyssVideo();
    var st=_state();
    if(st && st!=='idle' && st!=='') _onReady();
    /* Mỗi 2s thử lại quality — phòng trường hợp levels load trễ */
    if(tries % 4 === 0) _setHighestQuality();
    if(st==='playing' || __playing){ applyScale(__lastScale); if(tries>10) clearInterval(iv); return; }
    _forcePlay();
    if(tries>40) clearInterval(iv);
  }, 500);

  setTimeout(function(){ if(!__autoDone){ __autoDone=true; } }, 6000);
  return true;
}
if(!window.__abyssTimeIv){
  window.__abyssTimeIv = setInterval(function(){ _bindAbyssVideo(); _postAbyssTime(); }, 500);
}

function jwCmd(c, val){
  log("cmd "+c+(val!=null?" val="+val:""));
  if(!__bound) bindJW();
  var v=_getVideo();
  try{
    if(c==="toggle"){
      if(_state()==="playing" || (v && !v.paused)){ if(__jw)__jw.pause(); if(v)v.pause(); }
      else _forcePlay();
    }
    else if(c==="seek"){
      var t = Number(val);
      if(isFinite(t) && t >= 0){
        var dur0=0;
        if(__jw){ try{ dur0=__jw.getDuration()||0; }catch(e){} }
        if(!dur0 && v){ dur0=v.duration||0; }
        var tgt = dur0 > 0 ? Math.min(dur0, t) : t;
        try{ if(__jw) __jw.seek(tgt); }catch(e){}
        try{ if(v) v.currentTime=tgt; }catch(e){}
        _postAbyssTime();
      }
    }
    else if(c==="seek+5" || c==="seek-5"){
      var dlt = c==="seek+5" ? 5 : -5;
      var dur=0, cur=0;
      if(__jw){ try{ dur=__jw.getDuration()||0; cur=__jw.getPosition()||0; }catch(e){} }
      if(!dur && v){ dur=v.duration||0; }
      if(!cur && v){ cur=v.currentTime||0; }
      var target=Math.max(0, cur+dlt); if(dur) target=Math.min(dur, target);
      try{ if(__jw) __jw.seek(target); }catch(e){}
      try{ if(v) v.currentTime=target; }catch(e){}
      _postAbyssTime();
    }
    else if(c==="vol+" || c==="vol-"){
      var dv = c==="vol+" ? 10 : -10;
      if(__jw) __jw.setVolume(Math.max(0, Math.min(100, (__jw.getVolume()||0)+dv)));
      else if(v){ v.volume = Math.max(0, Math.min(1, v.volume + dv/100)); v.muted=false; }
    }
    else if(c==="quality"){
      var qi = parseInt(val,10);
      if(isNaN(qi) || qi < 0){ log("quality → auto (cao nhất)"); _setHighestQuality(); }
      else if(_domQBtns().length){
        log("quality → DOM #"+qi);
        _domClickEnsure(qi);
        try{ if(__jw && __jw.setCurrentQuality && _jwCurSafe()!=='n/a') __jw.setCurrentQuality(qi); }catch(e){}
      }
      else{
        log("quality → API #"+qi);
        try{ __jw.setCurrentQuality(qi); }catch(e){ log("setQ err: "+e.message); }
        _postLevels();
      }
    }
    else if(c==="blur"){ try{ var a=document.activeElement; if(a&&a.blur)a.blur(); }catch(e){} }
    else if(c==="scale"){ applyScale(val||"contain"); }
  }catch(e){ log("cmd err: "+e.message); }
}

window.addEventListener("message", function(ev){
  var d=ev.data||{};
  if(!d.vaxCmd) return;
  if(d.vaxCmd === 'setMode') return;

  /* ⭐ Nhận poster từ parent → gán cho mọi <video> */
  if(d.vaxCmd === 'setPoster'){
    var _p = d.val; if(!_p) return;
    window.__vaxPoster = _p;
    log("setPoster len=" + _p.length);
    var _apply = function(){
      var vs = document.querySelectorAll("video");
      for(var i = 0; i < vs.length; i++){ try{ if(vs[i].poster !== _p) vs[i].poster = _p; }catch(e){} }
    };
    _apply();
    if(!window.__vaxPosterObs){
      window.__vaxPosterObs = new MutationObserver(_apply);
      window.__vaxPosterObs.observe(document.documentElement, {childList:true, subtree:true});
      log("poster observer armed");
    }
    return;
  }

  jwCmd(d.vaxCmd, d.val != null ? d.val : d.value);
});

function _r(){ try{window.parent.postMessage({type:"vax_ready"},"*");}catch(e){} }
_r(); setTimeout(_r,300); setTimeout(_r,1000);

var tries=0;
var iv2=setInterval(function(){
  tries++;
  if(bindJW()){ clearInterval(iv2); return; }
  if(tries>150) clearInterval(iv2);
}, 200);
`;
}

function xinkJS() {
  return `
(function () {
  'use strict';
  if ((location.hostname || '').indexOf('playembed.vip') === -1) return;
  if (window.__xinkCS) { try { console.log('[XINK-CS] already installed'); } catch (e) {} return; }
  window.__xinkCS = true;

  var REF = 'https://playembed.vip/';
  var ORIGIN = 'https://playembed.vip';
  var KEY = 'onflix_secure_stream_v2_2026';

  function log(m) { try { console.log('[XINK-CS] ' + m); } catch (e) {} }
  log('start | ' + location.href);

  function toParent(obj) {
    try {
      if (window.top && window.top !== window && window.top !== window.parent) window.top.postMessage(obj, '*');
    } catch (e) {}
    try { if (window.parent && window.parent !== window) window.parent.postMessage(obj, '*'); } catch (e) {}
  }
  function hashStr(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }
  function absUrl(u, base) {
    if (!u) return '';
    if (u.indexOf('http') === 0 || u.indexOf('data:') === 0) return u;
    try { return new URL(u, base || location.href).href; } catch (e) { return u; }
  }

  // Segment/key đi qua vax.local/p để WebView/hls.js tải được kèm Referer playembed.vip
  function wrap(u) {
    try {
      var p = { url: u, headers: { 'Referer': REF, 'Origin': ORIGIN, 'User-Agent': navigator.userAgent } };
      var b = btoa(unescape(encodeURIComponent(JSON.stringify(p))));
      b = b.split('+').join('-').split('/').join('_');
      while (b.charAt(b.length - 1) === '=') b = b.slice(0, -1);
      return 'https://vax.local/p?d=' + b;
    } catch (e) { return u; }
  }

  function rewrite(m3u8, base) {
    var lines = String(m3u8).split('\\n');
    var out = [], seg = 0, key = 0;
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var l = raw.trim();
      if (!l) { out.push(raw); continue; }
      if (l.charAt(0) === '#') {
        var m = l.match(/URI="([^"]+)"/);
        if (m && m[1] && m[1].indexOf('data:') !== 0) {
          out.push(raw.replace(/URI="[^"]+"/, 'URI="' + wrap(absUrl(m[1], base)) + '"'));
          key++;
        } else {
          out.push(raw);
        }
      } else {
        out.push(wrap(absUrl(l, base)));
        seg++;
      }
    }
    log('rewrite seg=' + seg + ' key=' + key);
    return out.join('\\n');
  }

  function isMedia(t) { return /#EXTINF:|#EXT-X-TARGETDURATION|#EXT-X-ENDLIST|#EXT-X-MAP/i.test(t); }
  function isMaster(t) { return /#EXT-X-STREAM-INF|#EXT-X-MEDIA:/i.test(t); }

  function extractSubs() {
    var subs = [];
    try {
      var html = document.documentElement.innerHTML;
      var re = /\\{[^{}]*"language"\\s*:\\s*"([^"]+)"[^{}]*"subtitle_file"\\s*:\\s*"([^"]+)"[^{}]*\\}/g;
      var x;
      while ((x = re.exec(html)) !== null) {
        if (x[1] && x[2]) subs.push({ lang: x[1], url: absUrl(x[2], REF) });
      }
    } catch (e) {}
    return subs;
  }

  var lastHash = '';
  function send(text, base) {
    try {
      var body = String(text || '').replace(/^\\uFEFF/, '').replace(/^\\s+/, '');
      if (body.indexOf('#EXTM3U') !== 0) return false;
      if (isMaster(body) && !isMedia(body)) { log('master playlist → chờ media'); return false; }
      if (!isMedia(body)) return false;

      var h = hashStr(body);
      if (h === lastHash) return false;
      try { if (localStorage.getItem('__xink_sent_' + h)) { log('dup skip ' + h); return false; } } catch (e) {}

      var b = String(base || '');
      if (!b || b.indexOf('blob:') === 0) b = window.__xink_media_url || REF;

      var _ls = body.split('\\n'), _max = 0;
      for (var _i = 0; _i < _ls.length; _i++) { if (_ls[_i].length > _max) _max = _ls[_i].length; }
      log('playlist lines=' + _ls.length + ' maxLine=' + _max);
      var content = rewrite(body, b);
      lastHash = h;
      try { localStorage.setItem('__xink_sent_' + h, String(Date.now())); } catch (e) {}

      log('send m3u8 len=' + content.length + ' base=' + b.slice(0, 90));
      toParent({
        __vaxCmd: 'm3u8',
        content: content,
        referer: b,
        headers: { 'Referer': REF, 'Origin': ORIGIN },
        subtitles: extractSubs()
      });
      return true;
    } catch (e) {
      log('send err: ' + (e.message || e));
      return false;
    }
  }

  // ── Hook fetch ──────────────────────────────────────────────
  try {
    var _fetch = window.fetch;
    window.fetch = function (input, init) {
      var url = '';
      try { url = (typeof input === 'string') ? input : ((input && input.url) || ''); } catch (e) {}
      var isTarget = /onflixcdn\\.com/i.test(url);
      if (isTarget) window.__xink_media_url = url;
      var pr = _fetch.apply(this, arguments);
      try {
        pr = pr.then(function (r) {
          try {
            if (r && r.ok && (isTarget || /\\.m3u8(\\?|$)/i.test(url) || url.indexOf('blob:') === 0)) {
              r.clone().text().then(function (t) {
                if (t && t.indexOf('#EXTM3U') > -1) send(t, url);
              }).catch(function () {});
            }
          } catch (e) {}
          return r;
        });
      } catch (e) {}
      return pr;
    };
  } catch (e) {}

  // ── Hook XHR ────────────────────────────────────────────────
  try {
    var _open = XMLHttpRequest.prototype.open;
    var _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) {
      try {
        this.__xink_url = u;
        if (/onflixcdn\\.com/i.test(u)) window.__xink_media_url = u;
      } catch (e) {}
      return _open.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function () {
      var self = this;
      try {
        self.addEventListener('readystatechange', function () {
          try {
            if (self.readyState !== 4 || self.status !== 200) return;
            var rt = self.responseType;
            if (rt && rt !== 'text' && rt !== 'json') return;
            var txt = (rt === 'json') ? JSON.stringify(self.response) : (self.responseText || '');
            if (txt && txt.indexOf('#EXTM3U') > -1) send(txt, self.__xink_url);
          } catch (e) {}
        });
      } catch (e) {}
      return _send.apply(this, arguments);
    };
  } catch (e) {}

  // ── Hook atob / TextDecoder / createObjectURL ───────────────
  try {
    var _atob = window.atob;
    window.atob = function () {
      var r = _atob.apply(window, arguments);
      try { if (r && r.length < 2000000 && r.indexOf('#EXTM3U') > -1) send(r, window.__xink_media_url); } catch (e) {}
      return r;
    };
  } catch (e) {}

  try {
    var TD = window.TextDecoder;
    if (TD && TD.prototype && TD.prototype.decode) {
      var _decode = TD.prototype.decode;
      TD.prototype.decode = function () {
        var r = _decode.apply(this, arguments);
        try {
          if (r && r.length < 2000000 && r.indexOf('#EXTM3U') > -1 && r.indexOf('#EXTINF') > -1) {
            log('TextDecoder hit len=' + r.length);
            send(r, window.__xink_media_url);
          }
        } catch (e) {}
        return r;
      };
    }
  } catch (e) {}

  try {
    var _cou = URL.createObjectURL;
    URL.createObjectURL = function (o) {
      var u = _cou.apply(URL, arguments);
      try {
        if (o && typeof Blob !== 'undefined' && o instanceof Blob && o.size < 4 * 1024 * 1024 &&
            (/mpegurl|m3u8/i.test(String(o.type || '')) || o.type === '' || /text\\/plain/i.test(String(o.type || '')))) {
          var fr = new FileReader();
          fr.onload = function () {
            try {
              var t = String(fr.result || '');
              if (t.indexOf('#EXTM3U') > -1) send(t, window.__xink_media_url || REF);
            } catch (e) {}
          };
          fr.readAsText(o);
        }
      } catch (e) {}
      return u;
    };
  } catch (e) {}

  // ── Dự phòng: đọc enc_ trong DOM → master/media (nếu play_vid là plaintext) ──
  function xDecode(enc) {
    if (!enc || enc.indexOf('enc_') !== 0) return '';
    var hex = enc.substring(4), out = '';
    try {
      for (var i = 0; i < hex.length; i += 2) {
        out += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ KEY.charCodeAt((i / 2) % KEY.length));
      }
      try { return decodeURIComponent(out); } catch (e) { return out; }
    } catch (e) { return ''; }
  }
  function xFindEnc() {
    try {
      var html = document.documentElement.innerHTML;
      var m = html.match(/initialM3u8[\\s\\S]{0,40}?(enc_[0-9a-fA-F]{20,})/);
      if (m) return m[1];
      m = html.match(/(enc_[0-9a-fA-F]{40,})/);
      return m ? m[1] : '';
    } catch (e) { return ''; }
  }
  var activeBusy = false;
  function xActive() {
    if (lastHash || activeBusy || window.__xinkActiveDone) return;
    var enc = xFindEnc();
    if (!enc) return;
    var master = xDecode(enc);
    if (!master || master.indexOf('http') !== 0) return;
    activeBusy = true;
    window.__xinkActiveDone = true;
    var H = { 'Referer': REF, 'Origin': ORIGIN, 'User-Agent': navigator.userAgent };
    window.fetch(master, { headers: H }).then(function (r) { return r.json(); }).then(function (j) {
      var mediaUrl = master;
      if (j && j.type === 'master' && j.qualities && j.qualities.length) {
        var qs = j.qualities.slice().sort(function (a, b) { return (b.qid || 0) - (a.qid || 0); });
        mediaUrl = master + '&q=' + qs[0].qid;
      }
      return window.fetch(mediaUrl, { headers: H }).then(function (r) { return r.json(); }).then(function (media) {
        if (media && media.play_vid) {
          if (media.play_vid.indexOf('#EXTM3U') === 0) send(media.play_vid, mediaUrl);
          else log('play_vid chưa phải m3u8 | head=' + JSON.stringify(String(media.play_vid).slice(0, 70)) + ' → chờ hook player giải mã');
        }
      });
    }).catch(function (e) { log('active err: ' + (e.message || e)); }).then(function () { activeBusy = false; });
  }

  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    xActive();
    if (tries > 25 || lastHash) clearInterval(iv);
  }, 1000);
})();
`;
}

var CUSTOM_JS_HANDLERS = [
  {
    name: "dailymotion",
    match: /dailymotion\.com/i,
    code: dailymotionJS
  },
  {
    name: "streamc",
    match: /streamc\.xyz/i,
    code: streamcJS
  },
  {
    name: "vicdn",
    match: /vicdn\.cc/i,
    code: vicdnJS
  },
  {
    name: "abyss",
    match: /abyss(cdn)?\.(com|to|net)|hydrax\.(net|to|com|is|cc)/i,
    code: abyssJS
  },
  {
    name: "xink",
    match: /playembed\.vip/i,
    code: xinkJS
  }
];

function wrapHandlers(handlers) {
  var parts = [];
  for (var i = 0; i < handlers.length; i++) {
    var h = handlers[i];
    parts.push(
      '/* ===== handler: ' + h.name + ' ===== */\n' +
      'try {\n' +
      '  (function(){\n' +
          h.code() +
      '\n  })();\n' +
      '} catch(e){ console.log("[CUSTOM-JS][' + h.name + '] err: " + e.message); }'
    );
  }
  return '(function(){'
    + 'var __h = location.hostname||"";'
    + 'console.log("[CUSTOM-JS] frame: " + __h);'
    + parts.join('\n')
    + '})();';
}

function buildCustomJS(url) {
  var u = String(url || "");
  // 1. Nếu URL plugin đã chứa domain đích → chỉ nhúng 1 handler (nhẹ)
  for (var i = 0; i < CUSTOM_JS_HANDLERS.length; i++) {
    var h = CUSTOM_JS_HANDLERS[i];
    if (!h.match) continue;
    var ok = (typeof h.match === "function") ? h.match(u) : h.match.test(u);
    if (ok) {
      console.log("[CUSTOM-JS] optimized → only: " + h.name);
      return wrapHandlers([h]);
    }
  }
  // 2. Không match (URL wrapper / worker domain) → nhúng ĐỦ, mỗi handler tự check hostname
  console.log("[CUSTOM-JS] no URL match → inject ALL handlers");
  return wrapHandlers(CUSTOM_JS_HANDLERS);
}
// ===== CUSTOM JS REGISTRY END ======
// ===== CUSTOM JS REGISTRY END ======

function tv360Detail(url) {
  var custom = "(function(){"
    + "if(window.__VAX_TV360_LOADED__)return;"
    + "var urls=["
    + "'https://vaxplugin.alokillgtv02.workers.dev/tv/tv360-custom.js',"
    + "'https://vaxplugin.alokillgtv.workers.dev/tv/tv360-custom.js'"
    + "],i=0;"
    + "function load(){if(i>=urls.length)return;var s=document.createElement('script');"
    + "s.src=urls[i++]+'?t='+Date.now();s.onerror=load;"
    + "(document.head||document.documentElement).appendChild(s);}load();"
    + "})();";
  return JSON.stringify({
    url: url,
    isEmbed: false,
    orientation: "auto",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://tv360.vn/",
      "Origin": "https://tv360.vn",
      "Sniffer": false,
      "Block-AutoClick": "false",
      "Block-Ads": false,
      "Custom-Js": custom
    },
    subtitles: [{ lang: "", url: "" }]
  });
}

function getGameJS(url) {
  if (/crazygames\.com/i.test(String(url || ''))) {
    return crazyGameJS();
  }
  return '';
}

function crazyGameJS() {
  return `
(function () {
  'use strict';
  if (window.__GLS_INIT) { return; }
  window.__GLS_INIT = true;

  var TAG        = '[GLS]';
  var STYLE_ID   = '__gls_loader_style';
  var ROOT_ID    = '__gls_iframe_root';
  var IFRAME_SEL = 'iframe#game-iframe, iframe.GameContainerMobile_gameIframe__kYvt0, iframe.bs-GameContainer--game';
  var AUTO_HIDE_MS = 3000;

  function log()   { try { var a=[].slice.call(arguments); a.unshift(TAG); console.log.apply(console,a); } catch(e){} }
  function warn()  { try { var a=[].slice.call(arguments); a.unshift(TAG); console.warn.apply(console,a); } catch(e){} }
  function error() { try { var a=[].slice.call(arguments); a.unshift(TAG); console.error.apply(console,a); } catch(e){} }

  log('boot v3, readyState=' + document.readyState);

  /* ---------- Loader qua CSS pseudo-element (KHÔNG chèn DOM) ---------- */
  var LOADER_CSS = ''
    + 'html::before{content:"ĐANG TẢI GAME\\n Xin vui lòng chờ chút nhé.";'
    + 'white-space:pre-wrap;position:fixed;top:0;left:0;right:0;bottom:0;'
    + 'text-align:center;padding-top:40vh;box-sizing:border-box;'
    + 'background:#0f0f14;color:#fff;'
    + 'font:700 22px/1.7 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;'
    + 'z-index:2147483647;pointer-events:auto;}'
    + 'html::after{content:"";position:fixed;top:62%;left:50%;'
    + 'width:46px;height:46px;margin:-23px 0 0 -23px;'
    + 'border:4px solid rgba(255,255,255,.15);border-top-color:#9b6dff;border-radius:50%;'
    + 'animation:__gls_spin .85s linear infinite;z-index:2147483647;pointer-events:auto;}'
    + '@keyframes __gls_spin{to{transform:rotate(360deg)}}';

  function injectLoaderStyle() {
    if (document.getElementById(STYLE_ID)) { log('loader: style already present'); return true; }
    var parent = document.head || document.documentElement;
    if (!parent) { warn('loader: no parent yet'); return false; }
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = LOADER_CSS;
    parent.appendChild(s);
    log('loader: style injected into ' + parent.tagName);
    return true;
  }

  if (!injectLoaderStyle()) {
    document.addEventListener('DOMContentLoaded', function () {
      log('loader: retry style inject on DOMContentLoaded');
      injectLoaderStyle();
    }, { once: true });
  }

  var hidden = false;
  function hideLoader(reason) {
    if (hidden) { log('loader: HIDE skipped (already), reason=' + reason); return; }
    hidden = true;
    log('loader: HIDE begin, reason=' + reason);
    try {
      var s = document.getElementById(STYLE_ID);
      if (s && s.parentNode) { s.parentNode.removeChild(s); log('loader: style removed from DOM'); }
      else { warn('loader: style element NOT FOUND'); }
    } catch (e) { error('loader: hide threw', e); }
    log('loader: HIDE end');
  }

  var autoHideTimer = setTimeout(function () { hideLoader('auto-30s'); }, AUTO_HIDE_MS);

  /* ---------- Watch & Swap ---------- */
  var swapped = false;
  var watching = false;
  var mo = null, pollId = 0, heartbeatId = 0;
  var startTime = Date.now();
  function elapsed() { return Date.now() - startTime; }
  function findIframe() { try { return document.querySelector(IFRAME_SEL); } catch (e) { return null; } }

  function stopWatching(reason) {
    log('watch: STOP, reason=' + reason);
    if (mo) { try { mo.disconnect(); } catch (e) {} mo = null; }
    if (pollId) { clearInterval(pollId); pollId = 0; }
    if (heartbeatId) { clearInterval(heartbeatId); heartbeatId = 0; }
    watching = false;
  }

  function doSwap(iframe) {
    if (swapped) { return; }
    if (!iframe) { return; }
    swapped = true;
    log('swap: BEGIN at +' + elapsed() + 'ms, iframe.src=' + String(iframe.src || '').slice(0, 100));
    stopWatching('swap-start');
    clearTimeout(autoHideTimer);

    /* A. Ẩn loading NGAY (bất chấp các bước sau có lỗi hay không) */
    try { hideLoader('swap-pre-hide'); } catch (e) { error('swap A threw', e); }

    /* B. Tạo root container fullscreen */
    var root = null;
    try {
      root = document.getElementById(ROOT_ID);
      if (!root) {
        root = document.createElement('div');
        root.id = ROOT_ID;
        root.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;'
          + 'width:100vw;height:100vh;margin:0;padding:0;border:0;'
          + 'background:#000;z-index:2147483646;overflow:hidden;';
        document.documentElement.appendChild(root);
        log('swap B: root CREATED');
      } else {
        log('swap B: root exists');
      }
    } catch (e) { error('swap B threw', e); }

    /* C. Move iframe sang root */
    if (root) {
      try {
        root.appendChild(iframe);
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;'
          + 'border:0;margin:0;padding:0;display:block;';
        log('swap C: iframe MOVED into root, src=' + String(iframe.src || '').slice(0, 100));
      } catch (e) { error('swap C threw', e); }
    } else {
      error('swap C: SKIPPED (no root)');
    }

    /* D. Xoá sạch body */
    try {
      if (document.body) {
        var n = document.body.childElementCount;
        document.body.innerHTML = '';
        log('swap D: body WIPED (removed ' + n + ' children)');
      } else { warn('swap D: no body'); }
    } catch (e) { error('swap D threw', e); }

    /* E. Xoá <script> trong <head> (giữ <style>) */
    try {
      var head = document.head;
      if (head) {
        var scripts = head.querySelectorAll('script');
        var removed = 0;
        for (var i = 0; i < scripts.length; i++) {
          try { var sc = scripts[i]; if (sc.parentNode) { sc.parentNode.removeChild(sc); removed++; } } catch (e2) {}
        }
        log('swap E: removed ' + removed + '/' + scripts.length + ' head scripts');
      }
    } catch (e) { error('swap E threw', e); }

    /* F. Reset html/body: không viền, không cuộn */
    try {
      var d = document.documentElement.style;
      d.margin='0'; d.padding='0'; d.overflow='hidden'; d.width='100%'; d.height='100%'; d.background='#000';
      if (document.body) {
        var b = document.body.style;
        b.margin='0'; b.padding='0'; b.overflow='hidden'; b.width='100%'; b.height='100%'; b.background='#000';
      }
      log('swap F: style reset OK');
    } catch (e) { error('swap F threw', e); }

    /* G. Thử fullscreen (bọc kỹ) */
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        var p = document.documentElement.requestFullscreen();
        if (p && typeof p.then === 'function') {
          p.then(function () { log('swap G: fullscreen OK'); })
           .catch(function (err) { warn('swap G: fullscreen REJECTED: ' + (err && err.message)); });
        }
      } else if (document.fullscreenElement) { log('swap G: already fullscreen'); }
      else { warn('swap G: fullscreen API missing'); }
    } catch (e) { warn('swap G threw', e); }

    /* H. Verify sau 1s và 5s */
    setTimeout(function () {
      var okIframe    = !!findIframe();
      var styleGone   = !document.getElementById(STYLE_ID);
      var bodyEmpty   = !!(document.body && document.body.childElementCount === 0);
      var rootOk      = !!document.getElementById(ROOT_ID);
      log('verify+1s: iframe=' + okIframe + ' styleGone=' + styleGone
          + ' bodyEmpty=' + bodyEmpty + ' rootOk=' + rootOk);
      if (!styleGone) {
        warn('verify+1s: style STILL PRESENT — force removing');
        try { var s2 = document.getElementById(STYLE_ID); if (s2 && s2.parentNode) s2.parentNode.removeChild(s2); } catch (e) {}
      }
    }, 1000);

    setTimeout(function () {
      log('verify+5s: iframe=' + !!findIframe()
          + ' styleGone=' + !document.getElementById(STYLE_ID)
          + ' loaderHidden=' + hidden);
    }, 5000);

    log('swap: DONE (sync portion)');
  }

  function startWatching(reason) {
    if (watching || swapped) { log('watch: skip, reason=' + reason); return; }
    watching = true;
    log('watch: START reason=' + reason + ', readyState=' + document.readyState);

    var f = findIframe();
    if (f) { log('watch: iframe already present'); doSwap(f); return; }

    try {
      mo = new MutationObserver(function () {
        var el = findIframe();
        if (el) { log('watch: iframe FOUND via MutationObserver'); doSwap(el); }
      });
      mo.observe(document.documentElement || document, { childList: true, subtree: true });
      log('watch: MutationObserver attached');
    } catch (e) { error('watch: MO setup threw', e); }

    pollId = setInterval(function () {
      var el = findIframe();
      if (el) { log('watch: iframe FOUND via polling'); doSwap(el); }
    }, 300);
    log('watch: poll every 300ms started');

    heartbeatId = setInterval(function () {
      if (swapped) { return; }
      log('watch: heartbeat +' + elapsed() + 'ms, iframe=' + (findIframe() ? 'FOUND' : 'waiting'));
    }, 2000);
    log('watch: heartbeat every 2s started');
  }

  if (document.documentElement) { startWatching('immediate'); }
  else {
    document.addEventListener('DOMContentLoaded', function () {
      startWatching('domcontentloaded');
    }, { once: true });
  }
})();
  `;
}

function parseDetailResponse(html, url) {
 //   console.log("parseDetailResponse dang xu ly: " + url);
    try {
    if (GAME_MAP[String(url || '')]) {
        var gamePlayUrl = String(url || '');
        gameLog("play url=" + gamePlayUrl + " | customJs=" + (getGameJS(gamePlayUrl) ? "yes" : "no"));
        return JSON.stringify({
          url: gamePlayUrl,
          isEmbed: false,
          orientation: 'auto',
          headers: {
            'Referer': 'https://vaxplugins.alokillgtv05.workers.dev/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Sniffer': false,
            'Block-AutoClick': 'true',
            'Block-Ads': false,
            'Custom-Js': getGameJS(gamePlayUrl)
          },
          subtitles: []
        });
      }
      if(/tv360\.vn/i.test(url)){
       return tv360Detail(url);
     }
     if(url.indexOf("youtube_embed") > -1){
       return youtube();
     }
      else{
        var CUSTOM_JS = buildCustomJS(url);
        var safeUrl = renameUrlToM3u(url);

        /* ⭐ Nhận diện URL vicdn.cc → force embed (mở iframe) */
        var isVicdn = /vicdn\.cc/i.test(url);

        /* ⭐ Nếu URL match whitelist embed (dailymotion/streamc/vicdn/playembed/...) → isEmbed=true */
        var isEmbedUrl = isVicdn
          || /dailymotion\.com/i.test(url)
          || /streamc\.xyz/i.test(url)
          || /playembed\.vip/i.test(url);

        console.log("parseDetailResponse fetch\n" + safeUrl
          + " | isEmbed=" + isEmbedUrl
          + " | CustomJs.len=" + (CUSTOM_JS ? CUSTOM_JS.length : 0));

        if(safeUrl.match(/manga|novel|news|game|plugin=vaxlive/i)){
          var xoay = "auto"
          CUSTOM_JS = "";
          // "orientation": "auto", // hoặc "portrait" / "landscape"
        }
        else{
         // var xoay = "landscape"
          var xoay = "auto"
        }
        var $return = JSON.stringify({
          url: safeUrl,
          isEmbed: isEmbedUrl,
          orientation: xoay,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "X-VAX-YB": "vax_yb_token_2030_1990",
            "Sniffer": false,
            "Referer": BASEURL,
            "Origin": BASEURL,
            "Block-AutoClick": "true",
            "Block-Ads": false,
            "Block-Css": "",
            "Custom-Js": CUSTOM_JS
          },
          subtitles: [{
            lang: "",
            url: ""
          }]
        });
        //console.log("Return Parse:\n" + $return);
        return $return;
      }
      // ⭐ URL sạch — đổi ?url= → ?m3u= phòng trường hợp native gửi lại URL gốc
      
    } catch (e) {
    //  console.log("parseDetailResponse[err]:\n " + e);
      return JSON.stringify({
        url: "https://vaxplugin.alokillgtv02.workers.dev/blankvd.mp4",
        mimeType: "video/mp4",
        isEmbed: false, headers: {}, subtitles: []
      });
    }
  }

  function parseEmbedResponse(html, url) {
  //  log("parseEmbedResponse [url]: " + url);
    try {
      if (GAME_MAP[String(url || '')]) {
        var gameEmbedUrl = String(url || '');
        gameLog("embed url=" + gameEmbedUrl);
        return JSON.stringify({
          url: gameEmbedUrl,
          mimeType: "",
          isEmbed: false,
          orientation: "auto",
          headers: {
            "Referer": "https://vaxplugins.alokillgtv05.workers.dev/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Sniffer": false,
            "Block-AutoClick": "true",
            "Block-Ads": false,
            "Block-Css": "",
            "Custom-Js": getGameJS(gameEmbedUrl)
          },
          subtitles: []
        });
      }
      if(/tv360\.vn/i.test(url)) return tv360Detail(url);
      // ⭐ URL sạch
      var safeUrl = renameUrlToM3u(url);
      var $return = JSON.stringify({
        url: safeUrl + "&reload=true",
        mimeType: "",
        isEmbed: false,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": BASEURL,
          "Origin": BASEURL,
          "Block-AutoClick": "true"
        },
        subtitles: [{
          lang: "",
          url: ""
        }],
      });
      console.log("Return Embed:\n" + $return)
      return $return
    } catch (e) {
      console.log("[Lỗi parseEmbedResponse]", e);
      return JSON.stringify({
        url: "https://vaxplugin.alokillgtv02.workers.dev/blankvd.mp4",
        mimeType: "video/mp4",
        isEmbed: false, headers: {}, subtitles: []
      });
    }
  }
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HIDEMENU ====
{
function iframe64(url){
  var html = `
  <html><style>body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }iframe { width: 100%; height: 100%; object-fit: contain; }</style><body style='margin:0;padding:0;background:#000;'><iframe id='player' src='${url}' scrolling='no' frameborder='0' class='openloadvideo lab-pinned-child' allowfullscreen='true' webkitallowfullscreen='true' mozallowfullscreen='true' name='watch'></iframe></body></html>
  `;
  return "data:text/html;base64," + BASE64.encode(html);
}

  function getUrlDetail(slug) {
      try {
          if (!slug) return "";
          if (slug.indexOf('http') === 0) return slug;
          var detailUrl = BASEURL + "/" + slug;
       //   log("getUrlDetail[url]: \n" + detailUrl);
          return detailUrl;
      } catch (e) {
          log("getUrlDetail[err]:\n " + e);
          return "";
      }
  }
  function getUrlCategories() {
      try {
          log("getUrlCategories[url]: \n" + BASEURL);
          return BASEURL;
      } catch (e) {
          log("getUrlCategories[err]:\n " + e);
          return "";
      }
  }
  function getUrlCountries() {
      try {
          return "";
      } catch (e) {
          log("getUrlCountries[err]:\n " + e);
          return "";
      }
  }
  function getUrlYears() {
      try {
          return "";
      } catch (e) {
          log("getUrlYears[err]:\n " + e);
          return "";
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
  function parseCountriesResponse(html) {
      try {
          return "[]";
      } catch (e) {
          log("parseCountriesResponse[err]:\n " + e);
          return "[]";
      }
  }
  function parseYearsResponse(html) {
      try {
          return "[]";
      } catch (e) {
          log("parseYearsResponse[err]:\n " + e);
          return "[]";
      }
  }
  function parseSearchResponse(html, url) {
      try {
          log("parseSearchResponse[url]: \n" + url);
          return parseListResponse(html, url);
      } catch (e) {
          log("parseSearchResponse[err]:\n " + e);
          return JSON.stringify({
              "items": [],
              "pagination": {
                  "currentPage": 1,
                  "totalPages": 1
              }
          });
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

}
// ==== HIDEMENU ===
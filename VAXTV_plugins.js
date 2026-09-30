var iddomain = "bilutv"
BASEURL = "https://vaxplugin.alokillgtv.workers.dev/tv/index.html"
NEWDOMAIN = false;
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
      "name": "[MOVIE] VAX TỔNG HỢP",
      "version": "1.7.9",
      "author": "Alokillgtv",
      "info": "[UPDATE: 1.7.4] đổi tên plugin, từ giờ đây là plugin tổng hợp.",
      "baseUrl": BASEURL,
      "headers":{
          "X-VAX-YB": "vax_yb_token_2030_1990"
      },
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/vaxtv.png",
      "isEnabled": true,
      "isAdult": false,
      "layoutType": "Horizontal",
      "adblock": false,
      "type": "VIDEO",
      "subtitleCat": false,
      popup_html: popup_html,
      "playerType": "embed"
    });
  }
  catch(e){
    return JSON.stringify({
      "id": "loiapp",
      "name": "Plugin bị lỗi cài đặt",
      "version": "2.0",
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
    "id": "https://vaxplugin.alokillgtv.workers.dev/tv/movie.html?type=movie&plugin=kkphim&play=proxy",
    "img": "https://vaxplugin.alokillgtv.workers.dev/tv/img/vaxmovie.jpg?v=6",
    "des": "VAXMOVIE là player mở rộng chuyên dụng để stream các nguồn phim khác nhau, một cách để bạn duyệt, tìm và xem phim một cách nhanh chóng.",
    "count": "MOVIE",
    "title": "VAX MOVIE"
  },
  {
    "id": "https://vaxplugin.alokillgtv.workers.dev/tv/movie.html?type=anime&plugin=yanhh3d",
    "img": "https://vaxplugin.alokillgtv.workers.dev/tv/img/vaxanime.jpg?v=6",
    "des": "",
    "count": "ANIME",
    "title": "VAX ANIME"
  },
  {
    "id": "https://vaxplugin.alokillgtv.workers.dev/tv/index.html?m3u=aHR0cHM6Ly92YXhwbHVnaW4uYWxva2lsbGd0di53b3JrZXJzLmRldi90di9tM3Uvc3YyLm0zdQ%3D%3D&type=tv",
    "img": "https://vaxplugin.alokillgtv.workers.dev/tv/img/vaxtv.jpg?v=3",
    "des": "",
    "count": "TV",
    "title": "VAX TV"
  },
  {
    "id": "https://example.com?type=youtube",
    "img": "https://vaxplugin.alokillgtv.workers.dev/tv/img/vaxyoutube.jpg?v=6",
    "des": "",
    "count": "VIDEO",
    "title": "VAX YOUTUBE"
  },
  {
    "id": "https://vaxplugin.alokillgtv.workers.dev/tv/manga/index.html?type=manga&plugin=nettruyen",
    "img": "https://vaxplugin.alokillgtv.workers.dev/tv/img/vaxmanga.jpg?v=6",
    "des": "",
    "count": "MANGA",
    "title": "VAX MANGA"
  },
  {
    "id": "https://vaxplugin.alokillgtv.workers.dev/tv/none.html?base=true",
    "img": "https://vaxplugin.alokillgtv.workers.dev/tv/img/vaxreader.jpg?v=6",
    "des": "",
    "count": "BOOK",
    "title": "VAX READER"
  },
  {
    "id": "https://vaxplugin.alokillgtv.workers.dev/tv/test.html?base=true&cache=false",
    "img": "https://vaxplugin.alokillgtv.workers.dev/tv/img/vaxnew.jpg?v=6",
    "des": "",
    "count": "NEWS",
    "title": "VAX NEWS"
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
              return "https://vaxplugin.alokillgtv.workers.dev/tv/index.html?type=tv&save=false"
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
              console.log("xxxx:\n" + "https://vaxplugin.alokillgtv.workers.dev/tv/movie.html?type=xxx" + name)
              return "https://vaxplugin.alokillgtv.workers.dev/tv/movie.html?type=xxx" + name
        }
  }

// ===== HÀM TẠO KHỐI LIST PHIM BEGIN ======
function parseListResponse(html, url) {
    try {
        var $data = JSON.parse(getcate());
        var save = getparam(url,"save");
        var xxx = getparam(url,"type");
        var items = [];
        if(save){
          save = "&save=false&pluginsCache=false"
        }
        else{
          save = "";
        }
        if(xxx.indexOf("xxx") > -1){
            var img = "https://vaxplugin.alokillgtv.workers.dev/tv/img/vaxxxx.jpg";
            var title = "VAX XXX";
            var des = "";
            var id = url;
            
            items.push({
                "id": id + "&poster=" + encodeURI(img) + "&titlle=" + encodeURI(title) + save,
                "title": title,
                "quality": "",
                "episode_current": "XXX",
                "posterUrl": img,
                "backdropUrl": img,
                "year": "",
                "lang": "Tìm từ khoá `clear` để reset nếu lỗi."
            });
               var result = JSON.stringify({
                "items": items,
                "pagination": {
                    "currentPage": 1,
                    "totalPages": 1
                }
            });
    
            console.log("Return List:\n" + result);
            return result
        }

      
        $data.forEach(function(item,index) {
            // ⭐ ĐỔI ?url= → ?m3u= để native không sniff và fetch URL đích
            //    Tránh log noise "Proxy request failed..." từ native
            var safeId = renameUrlToM3u(item.id);

            items.push({
                "id": safeId + "&poster=" + encodeURI(item.img) + "&titlle=" + encodeURI(item.title) + "&des=" + encodeURI(item.des) + "&type=tv&server=" + index + save,
                "title": item.title,
                "quality": "",
                "episode_current": item.count,
                "posterUrl": item.img,
                "backdropUrl": item.img,
                "year": "",
                "lang": "Tìm từ khoá `clear` để reset nếu lỗi."
            });
        })

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
    log("parseMovieDetail[url]: \n" + url);
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
        var posterUrl = "https://vaxplugin.alokillgtv.workers.dev/tv/img/background.jpg?v=1";
        var backdropUrl = "https://vaxplugin.alokillgtv.workers.dev/tv/img/background.jpg?v=1";
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
    var jsUrl = `https://vaxplugin.alokillgtv.workers.dev/youtube/custom.js?time=${Date.now()}`;
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
  v.addEventListener("timeupdate",function(){post("NGUONC_TIME",{time:v.currentTime,duration:v.duration});});
  v.addEventListener("play",function(){post("NGUONC_STATE",{paused:false});});
  v.addEventListener("pause",function(){post("NGUONC_STATE",{paused:true});});
  setTimeout(function(){try{var q=v.getVideoPlaybackQuality?v.getVideoPlaybackQuality():null;var rect=v.getBoundingClientRect();log("after3s t="+v.currentTime.toFixed(1)+" rs="+v.readyState+" paused="+v.paused+" frames="+(q?q.totalVideoFrames:-1)+" box="+Math.round(rect.left)+","+Math.round(rect.top)+","+Math.round(rect.width)+"x"+Math.round(rect.height)+" bodyKids="+document.body.children.length);}catch(e){log("dbg fail "+e.message);}},3000);
}
window.addEventListener("message",function(e){
  var d=e.data||{};if(!d.vaxCmd)return;
  var v=window.__vaxV;
  if(!v){log("cmd "+d.vaxCmd+" no video");return;}
  log("cmd "+d.vaxCmd+(d.val?" val="+d.val:""));
  if(d.vaxCmd==="toggle"){if(v.paused)v.play().catch(function(e){log("play fail "+e.message);});else v.pause();}
  else if(d.vaxCmd==="seek+5"){if(isFinite(v.duration)&&v.duration>0){v.currentTime=Math.min(v.duration,v.currentTime+5);log("→"+v.currentTime.toFixed(1));}else{log("seek fail dur="+v.duration);}}
  else if(d.vaxCmd==="seek-5"){if(isFinite(v.duration)&&v.duration>0){v.currentTime=Math.max(0,v.currentTime-5);log("→"+v.currentTime.toFixed(1));}else{log("seek fail dur="+v.duration);}}
  else if(d.vaxCmd==="vol+"){v.volume=Math.min(1,v.volume+0.1);v.muted=false;}
  else if(d.vaxCmd==="vol-"){v.volume=Math.max(0,v.volume-0.1);v.muted=false;}
  else if(d.vaxCmd==="blur"){try{var _a=document.activeElement;if(_a&&_a.blur)_a.blur();if(document.body&&document.body.blur)document.body.blur();try{window.blur();}catch(e2){}log("blur cmd");}catch(e){log("blur fail "+e.message);}}
  else if(d.vaxCmd==="scale"){var _m=d.val||"contain";var _css="background:#000;display:block;margin:0;padding:0;border:0;outline:none;flex-shrink:0;";
    if(_m==="contain"){_css+="width:100%;height:100%;object-fit:contain;";}
    else if(_m==="cover"){_css+="width:100%;height:100%;object-fit:cover;";}
    else if(_m==="fill"){_css+="width:100%;height:100%;object-fit:fill;";}
    else if(_m==="fit-width"){_css+="width:100%;height:auto;max-height:none;object-fit:contain;";}
    else if(_m==="fit-height"){_css+="width:auto;height:100%;max-width:none;object-fit:contain;";}
    else if(_m==="none"){_css+="width:auto;height:auto;max-width:none;max-height:none;object-fit:none;";}
    else{_css+="width:100%;height:100%;object-fit:contain;";}
    v.style.cssText=_css;log("scale="+_m);}
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
      v.style.top='50%'; v.style.left='0'; v.style.right='0';
      v.style.transform='translateY(-50%)';
      break;
    case 'fit-height':
      v.style.objectFit='contain'; v.style.height='100%'; v.style.width='auto';
      v.style.maxWidth='none'; v.style.position='absolute';
      v.style.left='50%'; v.style.top='0'; v.style.bottom='0';
      v.style.transform='translateX(-50%)';
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

function _onReady(){
  if(!__jw || __autoDone) return;
  var st='';
  try{ st = __jw.getState ? __jw.getState() : ''; }catch(e){}
  if(st === 'idle') return;
  __autoDone = true;
  log("═══ JW READY ═══");
  try{
    var levels = __jw.getQualityLevels ? __jw.getQualityLevels() : [];
    if(levels && levels.length > 1) __jw.setCurrentQuality(levels.length - 1);
  }catch(e){}
  setTimeout(_tryAutoPlay, 500);
  setTimeout(function(){ applyScale(__lastScale); }, 500);
  setTimeout(function(){ applyScale(__lastScale); }, 2000);
  post("NGUONC_STATE", { ready: true });
}

function bindJW(){
  if(__bound) return true;
  var p = _tryGetJw();
  if(!p) return false;
  __jw=p; __bound=true;
  log("✅ BOUND");
  try{
    p.on("ready", function(){ setTimeout(_onReady,300); });
    p.on("play", function(){ post("NGUONC_STATE",{paused:false}); });
    p.on("pause", function(){ post("NGUONC_STATE",{paused:true}); });
    p.on("time", function(e){ post("NGUONC_TIME",{time:e.position||0,duration:e.duration||0}); });
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

function jwCmd(c, val){
  log("cmd "+c+(val!=null?" val="+val:""));
  if(!__bound && !bindJW()) return;
  try{
    if(c==="toggle"){ var st=__jw.getState(); if(st==="playing") __jw.pause(); else __jw.play(); }
    else if(c==="seek+5"){ var d=__jw.getDuration()||0; __jw.seek(Math.min(d,(__jw.getPosition()||0)+5)); }
    else if(c==="seek-5"){ __jw.seek(Math.max(0,(__jw.getPosition()||0)-5)); }
    else if(c==="vol+"){ __jw.setVolume(Math.min(100,(__jw.getVolume()||0)+10)); }
    else if(c==="vol-"){ __jw.setVolume(Math.max(0,(__jw.getVolume()||0)-10)); }
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

  jwCmd(d.vaxCmd, d.val);
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

function parseDetailResponse(html, url) {
    console.log("parseDetailResponse dang xu ly: " + url);
    try {
     if(url.indexOf("youtube") > -1){
       return youtube();
     }
      else{
        var CUSTOM_JS = buildCustomJS(url);
        var safeUrl = renameUrlToM3u(url);

        /* ⭐ Nhận diện URL vicdn.cc → force embed (mở iframe) */
        var isVicdn = /vicdn\.cc/i.test(url);

        /* ⭐ Nếu URL match whitelist embed (dailymotion/streamc/vicdn/...) → isEmbed=true */
        var isEmbedUrl = isVicdn
          || /dailymotion\.com/i.test(url)
          || /streamc\.xyz/i.test(url);

        console.log("parseDetailResponse fetch\n" + safeUrl
          + " | isEmbed=" + isEmbedUrl
          + " | CustomJs.len=" + (CUSTOM_JS ? CUSTOM_JS.length : 0));

        if(safeUrl.indexOf("manga") > -1){
          var xoay = "portrait"
          CUSTOM_JS = "";
          // "orientation": "auto", // hoặc "portrait" / "landscape"
        }
        else{
          var xoay = "landscape"
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
        console.log("Return Parse:\n" + $return);
        return $return;
      }
      // ⭐ URL sạch — đổi ?url= → ?m3u= phòng trường hợp native gửi lại URL gốc
      
    } catch (e) {
      console.log("parseDetailResponse[err]:\n " + e);
      return JSON.stringify({
        url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
        mimeType: "video/mp4",
        isEmbed: false, headers: {}, subtitles: []
      });
    }
  }

  function parseEmbedResponse(html, url) {
    log("parseEmbedResponse [url]: " + url);
    try {
      // ⭐ URL sạch
      var safeUrl = renameUrlToM3u(url);
      var $return = JSON.stringify({
        url: safeUrl,
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
        url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
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
          log("getUrlDetail[url]: \n" + detailUrl);
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
// ==== HIDEMENU ====

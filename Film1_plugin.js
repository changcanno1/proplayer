/*
 * XIAOFILM PLUGIN
 *
 * Xiaofilm dùng JWT Bearer token.
 * Native QuickJS phải giữ parser đồng bộ: tuyệt đối không dùng async/await ở đây.
 *
 * Luồng chính:
 *   1. getUrlList() đăng nhập nếu chưa có token.
 *   2. URL trả về có pipe header Authorization để Native gắn token khi fetch.
 *   3. parseListResponse() đọc JSON response từ /v1/movie/filterV2.
 *   4. parseMovieDetail() gọi API seasons bằng httpRequest đồng bộ.
 */

var XIAO_CONFIG = {
    BASE_URL: "https://xiaofilm.online",
    EMAIL: "drivepcthuan@gmail.com",
    PASSWORD: "Vaxplayer",
    LOGIN_TOKEN: "bypass",
    USER_AGENT: "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/127 Safari/537.36"
};

var BASEURL = XIAO_CONFIG.BASE_URL;
var XIAO_ACCESS_TOKEN = "";
var XIAO_NATIVE_CACHE = {};
var XIAO_NATIVE_CACHE_ID = 0;

function xiaoLog(message) {
    try { console.log("[XiaoFilm] " + message); } catch (e) {}
}

function xiaoPreview(value, max) {
    var text = String(value || "");
    return text.length > (max || 300) ? text.substring(0, max || 300) + "..." : text;
}

function xiaoParseJson(raw, fallback) {
    try {
        return JSON.parse(String(raw || ""));
    } catch (e) {
        xiaoLog("JSON parse lỗi: " + e.message + " | raw=" + xiaoPreview(raw));
        return fallback || {};
    }
}

function xiaoHeaders(includeAuth) {
    var headers = {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Origin": BASEURL,
        "Referer": BASEURL + "/xiaophim",
        "User-Agent": XIAO_CONFIG.USER_AGENT,
        "X-XiaoFilm-Web": "query"
    };
    if (includeAuth && XIAO_ACCESS_TOKEN) {
        headers.Authorization = "Bearer " + XIAO_ACCESS_TOKEN;
    }
    return headers;
}

function xiaoHttp(url, method, body, includeAuth) {
    if (typeof httpRequest !== "function") {
        xiaoLog("httpRequest không tồn tại trong môi trường Native");
        return null;
    }

    var options = {
        method: method || "GET",
        headers: xiaoHeaders(includeAuth),
        body: body ? JSON.stringify(body) : undefined
    };

    try {
        var response = httpRequest(url, options);
        xiaoLog((method || "GET") + " " + url +
            " -> status=" + (response ? response.status : "null") +
            " ok=" + (response ? response.isSuccessful : false) +
            " bodyLen=" + (response && response.body ? response.body.length : 0));
        return response;
    } catch (e) {
        xiaoLog("HTTP exception: " + e.message + " | url=" + url);
        return null;
    }
}

function xiaoHttpPlayback(url, context) {
    var headers = xiaoHeaders(true);
    headers["X-Playback-Context"] = String(context || "");
    try {
        var response = httpRequest(url, { method: "GET", headers: headers });
        xiaoLog("GET playback grant -> status=" + (response && response.status) +
            " bodyLen=" + (response && response.body ? response.body.length : 0));
        return response;
    } catch (e) {
        xiaoLog("Playback GET exception: " + e.message);
        return null;
    }
}

function xiaoLogin() {
    if (XIAO_ACCESS_TOKEN) {
        xiaoLog("Đã có access token, bỏ qua login");
        return true;
    }

    xiaoLog("Bắt đầu login: " + XIAO_CONFIG.EMAIL);
    var response = xiaoHttp(BASEURL + "/v1/auth/login", "POST", {
        email: XIAO_CONFIG.EMAIL,
        password: XIAO_CONFIG.PASSWORD,
        token: XIAO_CONFIG.LOGIN_TOKEN
    }, false);

    if (!response || !response.isSuccessful) {
        xiaoLog("Login thất bại: status=" + (response ? response.status : "null") +
            " body=" + xiaoPreview(response && response.body));
        return false;
    }

    var json = xiaoParseJson(response.body, {});
    var tokens = json.result && json.result.tokens;
    XIAO_ACCESS_TOKEN = (tokens && tokens.access && tokens.access.token) ||
        (tokens && tokens.token) || "";

    if (!XIAO_ACCESS_TOKEN) {
        xiaoLog("Login response không có access token: " + xiaoPreview(response.body, 500));
        return false;
    }

    xiaoLog("Login thành công, token length=" + XIAO_ACCESS_TOKEN.length);
    return true;
}

function xiaoWithAuth(url) {
    /* App cắt phần sau pipe rồi dùng nó làm HTTP header. */
    if (!xiaoLogin()) return url;
    return url + "|Authorization=Bearer " + XIAO_ACCESS_TOKEN;
}

function xiaoImage(path) {
    if (!path) return "";
    return /^https?:\/\//i.test(path) ? path : BASEURL + path;
}

function getManifest() {
    return JSON.stringify({
        id: "film1",
        name: "Film 1",
        version: "1.0.2",
        author: "VAX",
        description: "Film 1, nguồn phim chất lượng có 4K.",
        BASEURL: BASEURL,
        iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/icon/film1.png",
        isEnabled: true,
        isAdult: false,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "auto",
        subtitleCat: false,
        debug: true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "sort=imdb_rating", title: "Đánh giá cao", type: "Horizontal" },
         { slug: "home", title: "Mới cập nhật", type: "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới cập nhật", slug: "home" },
        { name: "Phim lẻ", slug: "type=1" },
        { name: "Phim bộ", slug: "type=2" },
        { name: "Hành động", slug: "genre=hanh-dong" },
        { name: "Tình cảm", slug: "genre=tinh-cam" },
        { name: "Kinh dị", slug: "genre=kinh-di" },
        { name: "Hài hước", slug: "genre=hai-huoc" },
        { name: "Hoạt hình", slug: "genre=hoat-hinh" },
        { name: "Viễn tưởng", slug: "genre=vien-tuong" }
    ]);
}

function getUrlList(slug, filtersJson) {
    var filters = xiaoParseJson(filtersJson, {});
    var page = parseInt(filters.page, 10) || 1;
    var category = String(slug || "home");

    if (category === "home") category = "sort=release_date";

    var url = BASEURL + "/v1/movie/filterV2?" + category +
        "&page=" + page + "&limit=20";
    var finalUrl = xiaoWithAuth(url);

    xiaoLog("getUrlList slug=" + slug + " page=" + page);
    xiaoLog("List URL=" + url);
    xiaoLog("List auth=" + (XIAO_ACCESS_TOKEN ? "ready" : "missing"));
    return finalUrl;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = xiaoParseJson(filtersJson, {});
    var page = parseInt(filters.page, 10) || 1;
    var url = BASEURL + "/v1/movie/filterV2?q=" + encodeURIComponent(keyword || "") +
        "&page=" + page + "&limit=20";
    xiaoLog("getUrlSearch keyword=" + keyword + " page=" + page);
    return xiaoWithAuth(url);
}

function getUrlDetail(slug) {
    /* Episode đã chứa signed HLS/4K URL, phải trả thẳng cho Native. */
    var rawSlug = String(slug || "");
    var decodedSlug = rawSlug;
    try { decodedSlug = decodeURIComponent(rawSlug); } catch (e) {}

    /* Nếu Native chuyển nhầm episode URL hoặc JSON encoded sang getUrlDetail */
    var episodeMarker = rawSlug.match(/\/xiaofilm_episode\/([^/?#|]+)/i) ||
        decodedSlug.match(/\/xiaofilm_episode\/([^/?#|]+)/i);
    if (episodeMarker) {
        xiaoLog("getUrlDetail nhận nhầm episode marker, chuyển hướng sang stream");
        return rawSlug;
    }

    if (decodedSlug.indexOf("{\"slug\":") >= 0 || rawSlug.indexOf("%22slug%22") >= 0) {
        xiaoLog("getUrlDetail nhận slug là JSON episode, giữ nguyên để parser xử lý");
        return BASEURL + "/xiaofilm_episode/" + encodeURIComponent(decodedSlug);
    }

    /* Native có thể URL-encode id trước khi gọi getUrlDetail(). */
    if (decodedSlug.indexOf("xiaofilmweb:") === 0) {
        var webPayload = decodedSlug.substring("xiaofilmweb:".length);
        var webInfo = {};
        try { webInfo = JSON.parse(decodeURIComponent(webPayload)); } catch (e) {
            xiaoLog("getUrlDetail WebView ID parse lỗi: " + e.message);
        }
        var cacheKey = webInfo.ticket || "";
        var nativePlaylist = XIAO_NATIVE_CACHE[cacheKey] || xiaoResolveNative(cacheKey);
        if (nativePlaylist) {
            XIAO_NATIVE_CACHE[cacheKey] = nativePlaylist;
            var resultId = "r" + (++XIAO_NATIVE_CACHE_ID);
            XIAO_NATIVE_CACHE[resultId] = nativePlaylist;
            xiaoLog("getUrlDetail episode Native stream ready");
            return BASEURL + "/xiaofilm_result/" + resultId;
        }
        xiaoLog("getUrlDetail Native resolve thất bại, giữ episode marker");
        return decodedSlug;
    }

    if (decodedSlug.indexOf("xiaofilm:") === 0) {
        var directEpisodeUrl = decodedSlug.substring("xiaofilm:".length);
        xiaoLog("getUrlDetail episode direct=" + xiaoPreview(directEpisodeUrl, 180));
        return directEpisodeUrl;
    }

    var cleanSlug = String(slug || "").replace(/^.*\//, "");
    var url = BASEURL + "/v1/movie/detail/" + encodeURIComponent(cleanSlug);
    xiaoLog("getUrlDetail=" + url);
    return xiaoWithAuth(url);
}

function xiaoMapItem(item) {
    item = item || {};
    return {
        id: item.slug || item._id || item.id || "",
        title: item.title || item.name || "",
        posterUrl: xiaoImage(item.thumb_url || item.poster_url),
        backdropUrl: xiaoImage(item.poster_url || item.thumb_url),
        description: item.description || item.overview || "",
        year: item.year || "",
        quality: item.quality || "",
        episode_current: item.episode_current || "",
        lang: item.lang || "",
        category: (item.genre_slugs || []).join(",")
    };
}

function parseListResponse(raw, apiUrl) {
    xiaoLog("parseListResponse rawLen=" + String(raw || "").length + " url=" + apiUrl);
    var json = xiaoParseJson(raw, {});
    if (json.status === false) {
        xiaoLog("List API trả status=false: " + xiaoPreview(raw, 500));
    }

    /*
     * filterV2 trả dữ liệu theo 2 lớp:
     * {
     *   result: { items: [...], page_count: 278, ... },
     *   items: [...], page_count: 278, ...
     * }
     */
    var payload = (json.result && typeof json.result === "object") ? json.result : json;
    var items = payload.items || json.items || [];
    if (!Array.isArray(items)) items = [];

    var currentPage = parseInt(payload.page || json.page, 10) || 1;
    var totalPages = parseInt(payload.page_count || payload.totalPages ||
        json.page_count || json.totalPages, 10) || 999;
    var totalItems = parseInt(payload.total_items || json.total_items, 10) || 0;

    xiaoLog("parseListResponse items=" + items.length +
        " page=" + currentPage + "/" + totalPages +
        " total=" + totalItems +
        " keys=" + Object.keys(json).join(",") +
        " payloadKeys=" + Object.keys(payload).join(","));

    return JSON.stringify({
        items: items.map(xiaoMapItem),
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(raw, apiUrl) {
    xiaoLog("parseSearchResponse");
    return parseListResponse(raw, apiUrl);
}

function xiaoSubtitle(url) {
    if (!url) return [];
    return [{ url: url, language: "vi", label: "Phụ đề" }];
}

/* Inject vào WebView: chặn redirect, chống click tạo phòng, bỏ qua quảng cáo, dọn sạch DOM, OSD điều khiển chuẩn VAX */
function xiaoWebPlayerScript() {
    return "(function(){" +
        "if(window.__XIAO_CLEAN_PLAYER__)return;window.__XIAO_CLEAN_PLAYER__=1;" +
        "var curVideo=null,mutedAd=false,skippedAd=false,cleaned=false,ctrlTimer=null,toastTimer=null,hudTimer=null;" +
        "function log(s){try{console.log('[XiaoClean] '+s)}catch(e){}}" +

        "/* 0. SCALE CHẾ ĐỘ */" +
        "var SCALE_MODES=[" +
            "{label:'Vừa màn hình (Mặc định)',fit:'contain',w:'100vw',h:'100vh',tf:'none'}," +
            "{label:'Phủ đầy (Cắt viền)',fit:'cover',w:'100vw',h:'100vh',tf:'none'}," +
            "{label:'Kéo giãn 16:9',fit:'fill',w:'100vw',h:'100vh',tf:'none'}," +
            "{label:'Vừa chiều rộng',fit:'contain',w:'100vw',h:'auto',tf:'none'}," +
            "{label:'Vừa chiều cao',fit:'contain',w:'auto',h:'100vh',tf:'none'}," +
            "{label:'Thu phóng 115%',fit:'contain',w:'100vw',h:'100vh',tf:'scale(1.15)'}," +
            "{label:'Thu phóng 130%',fit:'contain',w:'100vw',h:'100vh',tf:'scale(1.3)'}" +
        "];" +
        "var currentScaleIndex=0;" +

        "/* 1. CHẶN TRIỆT ĐỂ CHUYỂN HƯỚNG QUẢNG CÁO */" +
        "try{" +
            "window.open=function(u){log('Đã chặn window.open: '+u);return null;};" +
            "window.location.assign=function(u){log('Đã chặn location.assign: '+u);};" +
            "window.location.replace=function(u){log('Đã chặn location.replace: '+u);};" +
            "var origLoc=window.location;" +
            "Object.defineProperty(window,'location',{" +
                "configurable:true,enumerable:true," +
                "get:function(){return origLoc;}," +
                "set:function(val){log('Đã chặn location.href='+val);return origLoc.href;}" +
            "});" +
            "window.addEventListener('beforeunload',function(e){e.stopPropagation();},true);" +
            "document.addEventListener('click',function(e){" +
                "var t=e.target;while(t&&t.tagName!=='A')t=t.parentNode;" +
                "if(t&&t.tagName==='A'){" +
                    "var h=t.getAttribute('href')||'',tg=t.getAttribute('target')||'';" +
                    "if(tg==='_blank'||/^https?:\\/\\/(?!xiaofilm\\.online)/i.test(h)||/javascript:/i.test(h)){" +
                        "e.preventDefault();e.stopPropagation();log('Đã chặn click thẻ A: '+h);return false;" +
                    "}" +
                "}" +
            "},true);" +
        "}catch(e){log('Lỗi anti-redirect: '+e.message);}" +

        "/* 2. CHẶN NÚT TẠO PHÒNG (.item-w2g) */" +
        "function blockRoom(){" +
            "try{" +
                "var w2g=document.querySelectorAll('.item-w2g, [class*=\"w2g\"], [data-action*=\"w2g\"]');" +
                "for(var i=0;i<w2g.length;i++){" +
                    "w2g[i].onclick=function(e){e.preventDefault();e.stopPropagation();return false;};" +
                    "w2g[i].style.pointerEvents='none';" +
                    "w2g[i].style.display='none';" +
                "}" +
            "}catch(e){}" +
        "}" +

        "/* 3. MÀN CHE ĐEN (Gắn class jw-controls để không bị AdBlock Native ẩn) */" +
        "var mask=document.createElement('div');mask.id='xf-loading-layer';" +
        "mask.className='jw-controls';" +
        "mask.style.cssText='position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:#000!important;z-index:80000!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#fff!important;font-family:sans-serif!important;font-size:18px!important;pointer-events:all!important;';" +
        "mask.innerHTML='<div style=\"text-align:center;\"><div style=\"font-size:32px;margin-bottom:10px;\">⏳</div>Đang kết nối Stream 4K...</div>';" +
        "(document.documentElement||document.body).appendChild(mask);" +

        "/* 4. TÌM TARGET VIDEO THẬT */" +
        "function getVideoTarget(v){" +
            "if(v&&document.body.contains(v))return v;" +
            "if(curVideo&&document.body.contains(curVideo))return curVideo;" +
            "var all=document.querySelectorAll('video');" +
            "for(var i=0;i<all.length;i++){" +
                "if(!all[i].classList.contains('direct-preroll-video'))return all[i];" +
            "}" +
            "return curVideo||v||all[0];" +
        "}" +

        "/* 5. GESTURE HUD (Âm lượng / Độ sáng / Scale) CHUẨN VAX */" +
        "var hud=document.createElement('div');hud.id='xf-hud';" +
        "hud.className='jw-controls';" +
        "hud.style.cssText='position:fixed!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%) scale(0.95)!important;background:rgba(0,0,0,0.85)!important;color:#fff!important;padding:14px 22px!important;border-radius:14px!important;z-index:90000!important;pointer-events:none!important;opacity:0!important;transition:opacity 0.2s,transform 0.2s!important;font-family:sans-serif!important;font-size:15px!important;font-weight:bold!important;min-width:160px!important;text-align:center!important;border:1px solid rgba(255,255,255,0.2)!important;box-shadow:0 6px 20px rgba(0,0,0,0.7)!important;';" +
        "hud.innerHTML='<div id=\"xf-hud-icon\" style=\"font-size:24px;line-height:1.2;margin-bottom:4px;\"></div><div id=\"xf-hud-text\" style=\"white-space:nowrap;\"></div><div id=\"xf-hud-bar-wrap\" style=\"height:6px;background:rgba(255,255,255,0.25);border-radius:3px;margin-top:8px;overflow:hidden;\"><i id=\"xf-hud-bar\" style=\"display:block;height:100%;width:0;background:linear-gradient(90deg,#4dabf7,#a855f7);\"></i></div>';" +
        "(document.documentElement||document.body).appendChild(hud);" +

        "function showHud(icon,text,pct){" +
            "var hi=document.getElementById('xf-hud-icon'),ht=document.getElementById('xf-hud-text'),hb=document.getElementById('xf-hud-bar'),hw=document.getElementById('xf-hud-bar-wrap');" +
            "if(hi)hi.textContent=icon;" +
            "if(ht)ht.textContent=text;" +
            "if(pct!=null){if(hw)hw.style.display='block';if(hb)hb.style.width=Math.max(0,Math.min(100,pct))+'%';}" +
            "else{if(hw)hw.style.display='none';}" +
            "hud.style.opacity='1';hud.style.transform='translate(-50%,-50%) scale(1)';" +
            "if(hudTimer)clearTimeout(hudTimer);" +
            "hudTimer=setTimeout(function(){hud.style.opacity='0';hud.style.transform='translate(-50%,-50%) scale(0.95)';},900);" +
        "}" +

        "/* 6. SCALE KHUNG HÌNH */" +
        "function applyScale(v,idx){" +
            "var target=getVideoTarget(v);" +
            "if(!target)return;" +
            "curVideo=target;" +
            "var m=SCALE_MODES[idx];" +
            "target.style.setProperty('object-fit',m.fit,'important');" +
            "target.style.setProperty('width',m.w,'important');" +
            "target.style.setProperty('height',m.h,'important');" +
            "target.style.setProperty('transform',m.tf,'important');" +
            "target.style.setProperty('transform-origin','center center','important');" +
            "target.style.setProperty('position','fixed','important');" +
            "target.style.setProperty('top','0','important');" +
            "target.style.setProperty('left','0','important');" +
            "target.style.setProperty('right','0','important');" +
            "target.style.setProperty('bottom','0','important');" +
            "target.style.setProperty('margin','auto','important');" +
            "target.style.setProperty('max-width','none','important');" +
            "target.style.setProperty('max-height','none','important');" +
            "showHud('⛶',m.label,null);" +
            "var scaleBtn=document.getElementById('xf-scale-btn');" +
            "if(scaleBtn)scaleBtn.innerText='⛶ '+(idx+1)+'/'+SCALE_MODES.length;" +
        "}" +
        "function toggleScale(v){" +
            "currentScaleIndex=(currentScaleIndex+1)%SCALE_MODES.length;" +
            "applyScale(v||curVideo,currentScaleIndex);" +
        "}" +

        "/* 7. ĐỘ SÁNG VÀ ÂM LƯỢNG */" +
        "var curBright=1;" +
        "function setBrightness(val,v){" +
            "curBright=Math.max(0.2,Math.min(2.0,val));" +
            "var target=getVideoTarget(v);" +
            "if(target){" +
                "target.style.setProperty('filter','brightness('+curBright.toFixed(2)+')','important');" +
                "target.style.setProperty('-webkit-filter','brightness('+curBright.toFixed(2)+')','important');" +
            "}" +
            "showHud('☀️','Độ sáng '+Math.round(curBright*100)+'%',((curBright-0.2)/1.8)*100);" +
        "}" +
        "function setVolume(val,v){" +
            "var target=getVideoTarget(v);" +
            "if(!target)return;" +
            "target.muted=false;" +
            "var nv=Math.max(0,Math.min(1,val));" +
            "target.volume=nv;" +
            "showHud(nv<=0?'🔇':'🔊','Âm lượng '+Math.round(nv*100)+'%',nv*100);" +
        "}" +

        "/* 8. BỎ QUA QUẢNG CÁO */" +
        "/* XiaoFilm dùng /ad-policy để quyết định có render preroll hay không. */" +
        "try{" +
            "var nativeFetch=window.fetch;" +
            "if(nativeFetch&&!window.__XIAO_AD_FETCH_HOOK__){" +
                "window.__XIAO_AD_FETCH_HOOK__=1;" +
                "window.fetch=function(input,init){" +
                    "var url=typeof input==='string'?input:(input&&input.url)||'';" +
                    "if(/(?:^|\\/)ad-policy(?:[/?#]|$)/i.test(url)){" +
                        "log('Đã bỏ qua chính sách quảng cáo');" +
                        "return Promise.resolve(new Response(JSON.stringify({status:true,skip_ads:true}),{" +
                            "status:200,headers:{'Content-Type':'application/json'}" +
                        "}));" +
                    "}" +
                    "return nativeFetch.apply(this,arguments);" +
                ";};" +
            "}" +
        "}catch(e){log('Lỗi hook ad-policy: '+e.message);}" +
        "function skipPrerollNow(){" +
            "try{" +
                "var v=document.querySelector('.direct-preroll-video');" +
                "var sk=document.querySelector('.direct-preroll-skip');" +
                "if(!v&&!sk)return false;" +
                "if(v){try{v.pause();v.muted=true;if(isFinite(v.duration)&&v.duration>0)v.currentTime=v.duration;}catch(e){}" +
                    "try{v.dispatchEvent(new Event('ended'));}catch(e){}" +
                    "try{v.dispatchEvent(new Event('error'));}catch(e){}}" +
                "if(sk&&!skippedAd){sk.disabled=false;sk.removeAttribute('disabled');sk.click();skippedAd=true;log('Đã bỏ qua quảng cáo ngay lập tức');}" +
                "return true;" +
            "}catch(e){return false;}" +
        "}" +
        "function handlePreroll(){" +
            "blockRoom();" +
            "try{" +
                "var v=document.querySelector('.direct-preroll-video'),sb=document.querySelector('.direct-preroll-sound');" +
                "if(v&&sb&&!mutedAd){sb.click();v.muted=true;mutedAd=true;log('Đã tắt tiếng quảng cáo');}" +
                "skipPrerollNow();" +
            "}catch(e){}" +
        "}" +
        "var adInterval=setInterval(handlePreroll,250);" +

        "/* 9. ĐỊNH DẠNG THỜI GIAN */" +
        "function fmt(t){if(!isFinite(t)||t<0)return'00:00';var m=Math.floor(t/60),s=Math.floor(t%60);return(m<10?'0':'')+m+':'+(s<10?'0':'')+s;}" +

        "/* 10. DỰNG UI CONTROL CHUẨN VAX (Overlay 3 vùng trong suốt + Thanh tiến độ kéo tua) */" +
        "function createOSD(v){" +
            "if(document.getElementById('xf-control-panel'))return;" +
            "var root=document.createElement('div');root.id='xf-control-panel';root.className='jw-controls';" +
            "root.style.cssText='position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;z-index:92000!important;pointer-events:none!important;font-family:sans-serif!important;';" +

            "/* Nút Scale góc trên bên phải: z-index cao nhất, pointer-events:all để luôn nhận click/touch */" +
            "var scaleBtn=document.createElement('button');scaleBtn.id='xf-scale-btn';scaleBtn.className='jw-controls';" +
            "scaleBtn.style.cssText='position:absolute!important;top:20px!important;right:24px!important;background:rgba(0,0,0,0.85)!important;color:#fff!important;border:2px solid rgba(255,255,255,0.7)!important;padding:10px 20px!important;border-radius:24px!important;font-size:15px!important;font-weight:bold!important;cursor:pointer!important;pointer-events:all!important;z-index:95000!important;opacity:1;transition:opacity 0.3s;box-shadow:0 4px 14px rgba(0,0,0,0.6)!important;outline:none!important;-webkit-tap-highlight-color:transparent!important;';" +
            "scaleBtn.innerText='⛶ 1/'+SCALE_MODES.length;" +
            "function onScaleClick(e){" +
                "if(e){e.preventDefault();e.stopPropagation();}" +
                "toggleScale(v);" +
                "showControls(4000);" +
            "}" +
            "scaleBtn.addEventListener('click',onScaleClick,true);" +
            "scaleBtn.addEventListener('touchend',onScaleClick,true);" +
            "root.appendChild(scaleBtn);" +

            "/* Toast tua lớn giữa màn hình */" +
            "var progToast=document.createElement('div');progToast.id='xf-prog-toast';progToast.className='jw-controls';" +
            "progToast.style.cssText='position:absolute!important;bottom:15vh!important;left:50%!important;transform:translateX(-50%) translateY(20px)!important;background:rgba(0,0,0,0.88)!important;color:#fff!important;padding:10px 22px!important;border-radius:12px!important;font-size:16px!important;font-weight:bold!important;opacity:0;pointer-events:none!important;transition:opacity 0.2s,transform 0.2s!important;border:1px solid rgba(255,255,255,0.2)!important;text-align:center!important;white-space:nowrap!important;';" +
            "root.appendChild(progToast);" +
            "function showProgToast(txt){" +
                "progToast.innerText=txt;" +
                "progToast.style.opacity='1';progToast.style.transform='translateX(-50%) translateY(0)';" +
                "clearTimeout(progToast._t);" +
                "progToast._t=setTimeout(function(){progToast.style.opacity='0';progToast.style.transform='translateX(-50%) translateY(20px)';},1200);" +
            "}" +

            "/* THANH TIẾN ĐỘ DƯỚI ĐÁY */" +
            "var pb=document.createElement('div');pb.id='xf-progress-wrap';pb.className='jw-controls';" +
            "pb.style.cssText='position:absolute!important;left:0!important;right:0!important;bottom:0!important;height:24px!important;cursor:pointer!important;pointer-events:auto!important;display:flex!important;align-items:flex-end!important;opacity:0.4;transition:opacity 0.3s!important;';" +

            "var pbTrack=document.createElement('div');pbTrack.className='jw-controls';" +
            "pbTrack.style.cssText='position:relative!important;width:100%!important;height:5px!important;background:rgba(255,255,255,0.25)!important;transition:height 0.15s!important;';" +

            "var pbFill=document.createElement('div');pbFill.id='xf-pb-fill';pbFill.className='jw-controls';" +
            "pbFill.style.cssText='height:100%!important;width:0%;background:linear-gradient(90deg,#f03,#ff2791)!important;pointer-events:none!important;';" +
            "pbTrack.appendChild(pbFill);" +

            "var timeLabel=document.createElement('div');timeLabel.id='xf-time-tag';timeLabel.className='jw-controls';" +
            "timeLabel.style.cssText='position:absolute!important;left:14px!important;bottom:28px!important;background:rgba(0,0,0,0.85)!important;color:#fff!important;font-size:12px!important;font-family:monospace!important;padding:4px 10px!important;border-radius:6px!important;border:1px solid rgba(255,255,255,0.25)!important;pointer-events:none!important;opacity:0;transition:opacity 0.3s!important;';" +
            "timeLabel.innerText='00:00 / 00:00';" +

            "pb.appendChild(pbTrack);" +
            "root.appendChild(pb);" +
            "root.appendChild(timeLabel);" +

            "/* HOVER / SHOW CONTROLS */" +
            "function showControls(ms){" +
                "scaleBtn.style.opacity='1';" +
                "scaleBtn.style.pointerEvents='all';" +
                "timeLabel.style.opacity='1';" +
                "pb.style.opacity='1';" +
                "pbTrack.style.height='10px';" +
                "if(ctrlTimer)clearTimeout(ctrlTimer);" +
                "ctrlTimer=setTimeout(function(){" +
                    "scaleBtn.style.opacity='0.25';" +
                    "timeLabel.style.opacity='0';" +
                    "pb.style.opacity='0.4';" +
                    "pbTrack.style.height='5px';" +
                "},ms||4000);" +
            "}" +

            "/* KÉO VÀ CHỌN ĐOẠN TRÊN THANH TIẾN ĐỘ */" +
            "var isDragging=false;" +
            "function seekFromEvent(e,commit){" +
                "var target=getVideoTarget(v);" +
                "if(!target||!isFinite(target.duration)||target.duration<=0)return;" +
                "var rect=pbTrack.getBoundingClientRect();" +
                "var cx=e.clientX!=null?e.clientX:(e.touches&&e.touches[0]?e.touches[0].clientX:0);" +
                "var pct=Math.max(0,Math.min(1,(cx-rect.left)/rect.width));" +
                "var seekTime=pct*target.duration;" +
                "pbFill.style.width=(pct*100)+'%';" +
                "timeLabel.innerText=fmt(seekTime)+' / '+fmt(target.duration);" +
                "if(commit){" +
                    "target.currentTime=seekTime;" +
                    "showProgToast(fmt(seekTime));" +
                    "showControls(2000);" +
                "}" +
            "}" +
            "pb.addEventListener('pointerdown',function(e){e.stopPropagation();e.preventDefault();isDragging=true;showControls(6000);seekFromEvent(e,false);try{pb.setPointerCapture(e.pointerId);}catch(err){}});"+
            "window.addEventListener('pointermove',function(e){if(isDragging){e.stopPropagation();seekFromEvent(e,false);}});"+
            "window.addEventListener('pointerup',function(e){if(isDragging){isDragging=false;seekFromEvent(e,true);}});"+

            "/* CẬP NHẬT THỜI GIAN THEO VIDEO */" +
            "function onTimeUpdate(){" +
                "if(isDragging)return;" +
                "var target=getVideoTarget(v);" +
                "if(!target)return;" +
                "var cur=target.currentTime||0,dur=target.duration||0;" +
                "if(dur>0){pbFill.style.width=Math.max(0,Math.min(100,(cur/dur)*100))+'%';}" +
                "timeLabel.innerText=fmt(cur)+' / '+fmt(dur);" +
            "}" +
            "v.addEventListener('timeupdate',onTimeUpdate);" +

            "/* 11. OVERLAY 3 VÙNG CẢM ỨNG TRONG SUỐT HOÀN TOÀN + VUỐT ÂM LƯỢNG / ĐỘ SÁNG */" +
            "var ov=document.createElement('div');ov.id='xf-touch-overlay';ov.className='jw-controls';" +
            "ov.style.cssText='position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:calc(100vh - 28px)!important;z-index:84000!important;display:flex!important;outline:none!important;pointer-events:auto!important;touch-action:none!important;user-select:none!important;-webkit-user-select:none!important;';" +

            "var zLeft=document.createElement('div');zLeft.className='jw-controls';zLeft.style.cssText='flex:1;height:100%;outline:none;background:transparent;';" +
            "var zMid=document.createElement('div');zMid.className='jw-controls';zMid.style.cssText='flex:1.5;height:100%;outline:none;background:transparent;';" +
            "var zRight=document.createElement('div');zRight.className='jw-controls';zRight.style.cssText='flex:1;height:100%;outline:none;background:transparent;';" +
            "ov.appendChild(zLeft);ov.appendChild(zMid);ov.appendChild(zRight);" +

            "/* Gesture Touch: vuốt dọc Trái -> Độ sáng, vuốt dọc Phải -> Âm lượng, vuốt ngang -> Tua */" +
            "var touchStartX=0,touchStartY=0,startBrightVal=1,startVolVal=1,startTimeVal=0,gAxis=null,gZone=null,isSwiping=false;" +

            "ov.addEventListener('touchstart',function(e){" +
                "if(e.target===scaleBtn||scaleBtn.contains(e.target))return;" +
                "if(e.touches.length!==1)return;" +
                "var t=e.touches[0];" +
                "touchStartX=t.clientX;touchStartY=t.clientY;" +
                "gAxis=null;isSwiping=false;" +
                "var w=window.innerWidth||1;" +
                "gZone=t.clientX<w*0.35?'left':(t.clientX>w*0.65?'right':'mid');" +
                "startBrightVal=curBright;" +
                "var target=getVideoTarget(v);" +
                "startVolVal=target?(target.muted?0:target.volume):1;" +
                "startTimeVal=target?target.currentTime:0;" +
            "},{passive:true});" +

            "ov.addEventListener('touchmove',function(e){" +
                "if(e.touches.length!==1)return;" +
                "var t=e.touches[0];" +
                "var dx=t.clientX-touchStartX,dy=t.clientY-touchStartY;" +
                "var adx=Math.abs(dx),ady=Math.abs(dy);" +
                "if(!gAxis){" +
                    "if(Math.max(adx,ady)<12)return;" +
                    "gAxis=adx>ady?'horizontal':'vertical';" +
                "}" +
                "isSwiping=true;" +
                "var target=getVideoTarget(v);" +
                "if(!target)return;" +
                "var dur=target.duration||0;" +
                "if(gAxis==='horizontal'){" +
                    "if(dur>0){" +
                        "var delta=(dx/(window.innerWidth||1))*(Math.min(dur*0.2,120));" +
                        "var nTime=Math.max(0,Math.min(dur,startTimeVal+delta));" +
                        "showProgToast((delta>=0?'⏩ +':'⏪ -')+Math.round(Math.abs(delta))+'s · '+fmt(nTime));" +
                    "}" +
                "}else if(gAxis==='vertical'){" +
                    "var ratio=-dy/(window.innerHeight||1);" +
                    "if(gZone==='left'){setBrightness(startBrightVal+ratio*1.5,v);}" +
                    "else if(gZone==='right'){setVolume(startVolVal+ratio*1.5,v);}" +
                "}" +
            "},{passive:true});" +

            "ov.addEventListener('touchend',function(e){" +
                "if(isSwiping&&gAxis==='horizontal'){" +
                    "var target=getVideoTarget(v);" +
                    "if(target&&isFinite(target.duration)){" +
                        "var last=e.changedTouches[0];" +
                        "var dx=last.clientX-touchStartX;" +
                        "var dur=target.duration;" +
                        "var delta=(dx/(window.innerWidth||1))*(Math.min(dur*0.2,120));" +
                        "target.currentTime=Math.max(0,Math.min(dur,startTimeVal+delta));" +
                        "showControls(2000);" +
                    "}" +
                "}" +
                "isSwiping=false;gAxis=null;" +
            "},{passive:true});" +

            "/* Nhấp chuột / Click 3 vùng */" +
            "function seekRel(sec){" +
                "var target=getVideoTarget(v);" +
                "if(!target||!isFinite(target.duration))return;" +
                "target.currentTime=Math.max(0,Math.min(target.duration,target.currentTime+sec));" +
                "showProgToast((sec>0?'⏩ +':'⏪ ')+sec+'s · '+fmt(target.currentTime));" +
                "showControls(2000);" +
            "}" +
            "function togglePlayRel(){" +
                "var target=getVideoTarget(v);" +
                "if(!target)return;" +
                "if(target.paused){target.play().catch(function(){});showHud('▶','Phát',null);}" +
                "else{target.pause();showHud('❚❚','Tạm dừng',null);}" +
                "showControls(2000);" +
            "}" +

            "zLeft.onclick=function(e){if(isSwiping)return;e.stopPropagation();seekRel(-10);};" +
            "zRight.onclick=function(e){" +
                "if(isSwiping)return;" +
                "var rect=scaleBtn.getBoundingClientRect();" +
                "if(e.clientX>=rect.left-10&&e.clientX<=rect.right+10&&e.clientY>=rect.top-10&&e.clientY<=rect.bottom+10){" +
                    "onScaleClick(e);return;" +
                "}" +
                "e.stopPropagation();seekRel(10);" +
            "};" +
            "zMid.onclick=function(e){if(isSwiping)return;e.stopPropagation();togglePlayRel();};" +
            "ov.addEventListener('mousemove',function(){showControls();});" +

            "/* PHÍM REMOTE ANDROID TV VÀ KEYBOARD */" +
            "window.addEventListener('keydown',function(e){" +
                "var k=e.keyCode||e.which;" +
                "if(k===37||k===21){seekRel(-10);e.preventDefault();}" + // Trái / DPAD_LEFT
                "else if(k===39||k===22){seekRel(10);e.preventDefault();}" + // Phải / DPAD_RIGHT
                "else if(k===13||k===32||k===23||k===179||k===85){togglePlayRel();e.preventDefault();}" + // DPAD_CENTER / PlayPause
                "else if(k===38||k===19){toggleScale(v);showControls(3000);e.preventDefault();}" + // Lên: chuyển tỉ lệ Scale
                "else if(k===40||k===20){var target=getVideoTarget(v);if(target)setVolume(target.volume-0.1,v);showControls(2000);e.preventDefault();}" + // Xuống: giảm volume
                "else if(k===83||k===115){toggleScale(v);showControls(3000);e.preventDefault();}" + // S: Scale
            "},true);" +

            "root.appendChild(ov);" +
            "document.body.appendChild(root);" +
            "showControls(4000);" +
        "}" +

        "/* 12. DỌN SẠCH DOM VÀ GẮN VIDEO FULL MÀN HÌNH */" +
        "function cleanAndAttach(v){" +
            "if(cleaned)return;cleaned=true;" +
            "clearInterval(adInterval);" +
            "log('Bắt đầu dọn sạch DOM khi video chính đã sẵn sàng');" +
            "document.body.style.cssText='margin:0!important;padding:0!important;overflow:hidden!important;background:#000!important;width:100vw!important;height:100vh!important;';" +
            "v.style.cssText='position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;object-fit:contain!important;background:#000!important;z-index:70000!important;transition:transform 0.2s ease,filter 0.2s ease!important;';" +
            "if(v.parentElement!==document.body)document.body.appendChild(v);" +

            "var children=Array.prototype.slice.call(document.body.children);" +
            "for(var i=0;i<children.length;i++){" +
                "var c=children[i];" +
                "if(c!==v&&c.id!=='xf-loading-layer'&&c.id!=='xf-control-panel'&&c.id!=='xf-hud'){" +
                    "try{c.style.display='none';}catch(e){}" +
                "}" +
            "}" +

            "createOSD(v);" +
            "var curtain=document.getElementById('xf-loading-layer');" +
            "if(curtain){curtain.style.transition='opacity 0.5s';curtain.style.opacity='0';setTimeout(function(){try{curtain.remove();}catch(e){}},600);}" +
            "v.play().catch(function(){});" +
        "}" +

        "/* 13. VÒNG LẶP THEO DÕI VIDEO CHÍNH */" +
        "var checkVideoInterval=setInterval(function(){" +
            "blockRoom();" +
            "var videos=document.querySelectorAll('video');" +
            "for(var i=0;i<videos.length;i++){" +
                "var v=videos[i];" +
                "if(v.classList.contains('direct-preroll-video'))continue;" +
                "if(v.readyState>=2||v.currentTime>0||(!v.paused&&v.duration>30)){" +
                    "clearInterval(checkVideoInterval);" +
                    "curVideo=v;" +
                    "cleanAndAttach(v);" +
                    "break;" +
                "}" +
            "}" +
        "},250);" +
    "})();";
}

function xiaoBuildEpisodes(seasons, movieSlug) {
    var episodes = [];
    seasons = Array.isArray(seasons) ? seasons : [];

    for (var i = 0; i < seasons.length; i++) {
        var season = seasons[i] || {};
        var list = season.episodes || [];

        for (var j = 0; j < list.length; j++) {
            var episode = list[j] || {};
            var versions = episode.versions || [episode];

            for (var k = 0; k < versions.length; k++) {
                var version = versions[k] || {};
                if (!version.link_m3u8) continue;

                var number = episode.episode_number || episode.sort_order || j + 1;
                var serverName = version.server_name || version.name || "Server";
                var uniqueSlug = "ep-" + number + "-" + k + "-" + (version.id || "stream");

                var secure = /\/secure-play\//i.test(version.link_m3u8);
                var serverKey = version.server_key || "";
                var playerName = serverKey.replace(/^manual-/, "").replace(/-\d+$/, "").replace(/-/g, "_");
                playerName = playerName.replace(/4k/gi, "4K");
                var episodeId = episode.id || episode._id || episode.episode_id ||
                    version.episode_id || version.id || version._id || "";
                if (secure && !episodeId) {
                    xiaoLog("Bỏ episode WebView vì thiếu eid: episode=" + j + " version=" + k);
                    continue;
                }
                episodes.push({
                    /* Encode payload để Native không cắt ID tại ký tự pipe. */
                    id: secure ? BASEURL + "/xiaofilm_episode/" + encodeURIComponent(JSON.stringify({
                        slug: movieSlug,
                        eid: String(episodeId),
                        sid: serverKey,
                        name: playerName || serverName,
                        ticket: version.link_m3u8
                    })) :
                        "xiaofilm:" + version.link_m3u8,
                    name: "Tập " + number + " - " + serverName,
                    slug: uniqueSlug,
                    datasend: version.subtitle_url || episode.subtitle_url || ""
                });
            }
        }
    }

    xiaoLog("Build episodes=" + episodes.length);
    return episodes;
}

/* Decode payload playlist mà player web nhận từ grant endpoint. */
function xiaoDecodePack(raw) {
    var text = String(raw || "").trim();
    if (text.indexOf("XIAO_PACK_V2:") !== 0) return text;
    var encoded = text.substring(13).split("").reverse().join("");
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (encoded.length % 4) encoded += "=";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var bytes = [], buffer = 0, bits = 0;
    for (var i = 0; i < encoded.length; i++) {
        var n = chars.indexOf(encoded.charAt(i));
        if (n < 0) continue;
        buffer = (buffer << 6) | n;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            bytes.push((buffer >> bits) & 255);
        }
    }
    var out = "";
    for (var j = 0; j < bytes.length; j++) {
        var c = bytes[j];
        if (c < 128) out += String.fromCharCode(c);
        else if (c < 224) out += String.fromCharCode(((c & 31) << 6) | (bytes[++j] & 63));
        else if (c < 240) out += String.fromCharCode(((c & 15) << 12) | ((bytes[++j] & 63) << 6) | (bytes[++j] & 63));
        else {
            var u = (((c & 7) << 18) | ((bytes[++j] & 63) << 12) |
                ((bytes[++j] & 63) << 6) | (bytes[++j] & 63)) - 65536;
            out += String.fromCharCode(55296 + (u >> 10), 56320 + (u & 1023));
        }
    }
    return out;
}

/* Native flow: ticket -> playback grant -> XIAO_PACK_V2 -> xf4k m3u8. */
function xiaoResolveNative(ticket) {
    var ticketUrl = String(ticket || "");
    if (!/\/secure-play\//i.test(ticketUrl) || !xiaoLogin()) return "";
    if (XIAO_NATIVE_CACHE[ticketUrl]) {
        xiaoLog("Native cache hit ticket");
        return XIAO_NATIVE_CACHE[ticketUrl];
    }
    if (ticketUrl.indexOf("native_subtitles=") < 0) {
        ticketUrl += (ticketUrl.indexOf("?") >= 0 ? "&" : "?") + "native_subtitles=0";
    }
    xiaoLog("Native xin playback grant ticket=" + xiaoPreview(ticketUrl, 160));
    var grantResponse = xiaoHttp(BASEURL + "/api/playback_grant.php", "POST", {
        ticket: ticketUrl,
        transport: "hlsjs"
    }, true);
    var grant = xiaoParseJson(grantResponse && grantResponse.body, {});
    if (!grantResponse || !grantResponse.isSuccessful || !grant.success || !grant.url) {
        xiaoLog("Native grant thất bại status=" + (grantResponse && grantResponse.status));
        return "";
    }

    var mediaResponse = xiaoHttpPlayback(grant.url, grant.c || "");
    var decoded = xiaoDecodePack(mediaResponse && mediaResponse.body);
    if (decoded.indexOf("#EXTM3U") === 0) {
        xiaoLog("Native giải mã thành công playlist length=" + decoded.length);
        XIAO_NATIVE_CACHE[ticketUrl] = {
            content: decoded,
            baseUrl: grant.url,
            context: grant.c || "",
            headers: {
                "Referer": BASEURL + "/xem-phim/" + (ticketUrl.match(/session\/([^/?#]+)/)?.[1] || ""),
                "Origin": BASEURL,
                "User-Agent": XIAO_CONFIG.USER_AGENT,
                "X-Playback-Context": String(grant.c || "").trim()
            }
        };
        return XIAO_NATIVE_CACHE[ticketUrl];
    }
    var match = decoded.match(/https?:\/\/[^\s"']+\.m3u8(?:\?[^\s"']*)?/i);
    if (!match) {
        xiaoLog("Native giải mã không thấy m3u8 bodyLen=" + decoded.length +
            " head=" + xiaoPreview(decoded, 80));
        return "";
    }
    xiaoLog("Native giải mã thành công m3u8=" + match[0]);
    XIAO_NATIVE_CACHE[ticketUrl] = {
        content: "",
        url: match[0],
        baseUrl: match[0],
        context: grant.c || "",
        headers: {
            "Referer": BASEURL + "/",
            "Origin": BASEURL,
            "User-Agent": XIAO_CONFIG.USER_AGENT,
            "X-Playback-Context": String(grant.c || "").trim()
        }
    };
    return XIAO_NATIVE_CACHE[ticketUrl];
}

function parseMovieDetail(raw, apiUrl, datasend) {
    xiaoLog("parseMovieDetail rawLen=" + String(raw || "").length + " url=" + apiUrl);
    var detailJson = xiaoParseJson(raw, {});
    var movie = detailJson.result || detailJson;
    var slug = movie.slug || movie._id || "";

    if (!slug) {
        xiaoLog("Detail không có slug: " + xiaoPreview(raw, 500));
        return JSON.stringify({ id: "", title: "", servers: [] });
    }

    if (!xiaoLogin()) {
        xiaoLog("Không thể login trước khi gọi seasons");
        return JSON.stringify({ id: slug, title: movie.name || movie.title || slug, servers: [] });
    }

    var seasonsUrl = BASEURL + "/v1/movie/seasons?mId=" + encodeURIComponent(slug);
    var seasonsResponse = xiaoHttp(seasonsUrl, "GET", null, true);
    var seasonsJson = xiaoParseJson(seasonsResponse && seasonsResponse.body, {});
    var episodes = xiaoBuildEpisodes(seasonsJson.result || [], slug);

    return JSON.stringify({
        id: slug,
        title: movie.name || movie.title || slug,
        originName: movie.origin_name || "",
        posterUrl: xiaoImage(movie.poster_url || movie.thumb_url),
        backdropUrl: xiaoImage(movie.poster_url || movie.thumb_url),
        description: movie.description || movie.overview || "",
        year: movie.year || "",
        quality: movie.quality || "",
        servers: [{ name: "Film 1", episodes: episodes }]
    });
}

function getStreamLink(episodeId, datasend) {
    var rawId = String(episodeId || "");
    var decodedId = rawId;
    try { decodedId = decodeURIComponent(rawId); } catch (e) {}

    /* Native truyền URL marker trực tiếp vào getStreamLink() */
    var markerMatch = rawId.match(/\/xiaofilm_episode\/([^/?#|]+)/i) ||
        decodedId.match(/\/xiaofilm_episode\/([^/?#|]+)/i);
    var webId = "";
    if (markerMatch) {
        webId = markerMatch[1];
    } else if (decodedId.indexOf("xiaofilmweb:") === 0) {
        webId = decodedId.substring("xiaofilmweb:".length);
    } else if (rawId.indexOf("xiaofilmweb:") === 0) {
        webId = rawId.substring("xiaofilmweb:".length);
    }

    if (webId) {
        var info = {};
        try { info = JSON.parse(decodeURIComponent(webId)); } catch (e) {
            try { info = JSON.parse(webId); } catch (e2) {
                xiaoLog("4K ID parse lỗi: " + e.message + " raw=" + xiaoPreview(webId, 180));
            }
        }
        var playerUrl = BASEURL + "/xem-phim/" + encodeURIComponent(info.slug || "") +
            "?ver=7&sv=2&eid=" + encodeURIComponent(info.eid || "") +
            "&sid=" + encodeURIComponent(info.sid || "") + "&sn=" + encodeURIComponent(info.name || "");
        xiaoLog("4K WebView player=" + playerUrl + " | eid=" + (info.eid || "missing") +
            " sid=" + (info.sid || "missing"));
        return JSON.stringify({
            url: playerUrl,
            isEmbed: false,
            mimeType: "text/html",
            sniffer: false,
            headers: {
                Referer: BASEURL + "/",
                "Block-AutoClick": "true",
                "Custom-Js": xiaoWebPlayerScript()
            },
            subtitles: []
        });
    }

    var streamUrl = String(episodeId || "").replace(/^xiaofilm:/, "");
    xiaoLog("getStreamLink url=" + xiaoPreview(streamUrl, 180));
    return JSON.stringify({
        url: streamUrl,
        isEmbed: false,
        mimeType: "application/x-mpegURL",
        headers: {
            Referer: BASEURL + "/",
            Origin: BASEURL
        },
        subtitles: xiaoSubtitle(datasend)
    });
}

function parseDetailResponse(raw, apiUrl, datasend) {
    xiaoLog("parseDetailResponse rawLen=" + String(raw || "").length + " url=" + apiUrl);

    var episodeMarker = String(apiUrl || "").match(/\/xiaofilm_episode\/([^/?#|]+)/i);
    if (episodeMarker) {
        try {
            var episodeInfo = JSON.parse(decodeURIComponent(episodeMarker[1]));
            var playerUrl = BASEURL + "/xem-phim/" + encodeURIComponent(episodeInfo.slug || "") +
                "?ver=7&sv=2&eid=" + encodeURIComponent(episodeInfo.eid || "") +
                "&sid=" + encodeURIComponent(episodeInfo.sid || "") + "&sn=" + encodeURIComponent(episodeInfo.name || "");
            xiaoLog("parseDetailResponse episode chuyển WebView player=" + playerUrl);
            return JSON.stringify({
                url: playerUrl,
                isEmbed: false,
                mimeType: "text/html",
                sniffer: false,
                headers: {
                    Referer: BASEURL + "/",
                    "Custom-Js": xiaoWebPlayerScript()
                },
                subtitles: []
            });
        } catch (e) {
            xiaoLog("Native episode marker lỗi: " + e.message);
        }
    }

    var resultMarker = String(apiUrl || "").match(/\/xiaofilm_result\/([^/?#|]+)/i);
    if (resultMarker) {
        try {
            var cached = XIAO_NATIVE_CACHE[resultMarker[1]];
            if (!cached) throw new Error("Native result cache miss: " + resultMarker[1]);
            var isPlaylist = !!cached.content;
            var result = {
                url: isPlaylist ? (cached.baseUrl || BASEURL + "/") : (cached.url || ""),
                m3u8Content: isPlaylist ? cached.content : "",
                baseUrl: cached.baseUrl || BASEURL + "/",
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: { Referer: BASEURL + "/", Origin: BASEURL },
                subtitles: xiaoSubtitle(datasend)
            };
            xiaoLog("parseDetailResponse trả Native m3u8Content=" +
                (result.m3u8Content ? result.m3u8Content.length : 0));
            return JSON.stringify(result);
        } catch (e) {
            xiaoLog("Native result parse lỗi: " + e.message);
        }
    }

    /* Native gọi parser sau khi getUrlDetail() đã trả signed URL. */
    var directUrl = String(apiUrl || "").split("|")[0];
    if (/^https?:\/\//i.test(directUrl) &&
        (/\.m3u8(?:[?#]|$)/i.test(directUrl) || /\/secure-play\//i.test(directUrl))) {
        xiaoLog("parseDetailResponse direct HLS/4K=" + xiaoPreview(directUrl, 180));
        return getStreamLink("xiaofilm:" + directUrl, datasend);
    }

    if (String(apiUrl || "").indexOf("xiaofilm:") === 0) {
        return getStreamLink(apiUrl, datasend);
    }

    var json = xiaoParseJson(raw, {});
    var data = json.result || json;
    return getStreamLink(data.url || data.link_m3u8 || "", data.subtitle_url || datasend);
}

/* Không login khi load file. Login được gọi tại getUrlList/getUrlDetail,
   vì lúc đó token mới được truyền vào request fetch của Native qua pipe. */
xiaoLog("Plugin loaded | base=" + BASEURL);
// =============================================================================
// VAAPP Plugin: HHPanda (Advanced Direct API & Server Split)
// Author: Gemini
// =============================================================================

var BASE_URL = "https://hhpanda.st";

function getManifest() {
    return JSON.stringify({
        "id": "hhpanda",
        "name": "HHPanda 4K",
        "version": "1.3.0",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/wp-content/uploads/2024/10/apple-touch-icon.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embedtoexoplay",
        "adblock": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'moi-cap-nhat', title: 'Mới Cập Nhật', type: 'Grid' },
        { slug: 'hoan-thanh', title: 'Hoàn Thành', type: 'Horizontal' },
        { slug: 'most-viewed', title: 'Top Xem Nhiều', type: 'Horizontal' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Tu Tiên', slug: 'the-loai/tu-tien' },
        { name: 'Kiếm Hiệp', slug: 'the-loai/kiem-hiep' },
        { name: 'Cổ Trang', slug: 'the-loai/co-trang' },
        { name: 'Huyền Huyễn', slug: 'the-loai/huyen-huyen' },
        { name: 'Khoa Huyễn', slug: 'the-loai/khoa-huyen' },
        { name: 'Kỳ Ảo', slug: 'the-loai/ky-ao' },
        { name: 'Huyền Nghi', slug: 'the-loai/huyen-nghi' },
        { name: 'Cạnh Kỹ', slug: 'the-loai/canh-ky' },
        { name: 'Dã Sử', slug: 'the-loai/da-su' },
        { name: 'Đô Thị', slug: 'the-loai/do-thi' },
        { name: 'Đồng Nhân', slug: 'the-loai/dong-nhan' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

function fixHref(href) {
    if (!href) return "";
    let cleanHref = href.trim();
    if (/^(#|https?:\/\/|\/\/|mailto:|tel:|javascript:|data:|blob:)/i.test(cleanHref)) {
        if(cleanHref.indexOf("//") === 0) return "https:" + cleanHref;
        return cleanHref;
    }
    if (cleanHref.indexOf('/') === 0) return BASE_URL + cleanHref;
    return BASE_URL + "/" + cleanHref;
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var path = slug;
    if (filters.category) path = filters.category;
    
    var url = BASE_URL + "/" + path;
    if (page > 1) url += "/page/" + page;
    return url.replace(/([^:]\/)\/+/g, "$1");
}

function getUrlSearch(keyword, filtersJson) {
    var page = JSON.parse(filtersJson || "{}").page || 1;
    return BASE_URL + (page > 1 ? "/page/" + page : "") + "?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return BASE_URL + "/" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSER
// =============================================================================

function parseListResponse(html, url) {
    try {
        var $doc = _$(html);
        var items = [];
        
        $doc.find(".halim-item").each(function() {
            var a = this.find("a.halim-thumb");
            var href = a.attr("href");
            if (href) {
                var imgTag = this.find("img");
                var posterUrl = imgTag.attr("data-src") || imgTag.attr("src") || "";
                
                items.push({
                    id: fixHref(href),
                    title: this.find(".entry-title").text().trim(),
                    posterUrl: fixHref(posterUrl),
                    quality: this.find(".status").text().trim(),
                    episode_current: this.find(".episode").text().trim()
                });
            }
        });
        
        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: items.length > 0 ? 99 : 1 }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseMovieDetail(html, url) {
    try {
        var $doc = _$(html);
        var title = $doc.find(".movie_name").text().trim() || $doc.find("h1").text().trim();
        var originName = $doc.find(".org_title").text().trim();
        var imgTag = $doc.find(".first img");
        var posterUrl = imgTag.attr("src") || imgTag.attr("data-src");
        if (!posterUrl) posterUrl = $doc.find('meta[property="og:image"]').attr("content");
        
        var description = $doc.find(".entry-content article p").text().trim() || $doc.find(".entry-content p").text().trim();
        var episode_current = $doc.find(".hh3d-new-ep .new-ep").text().trim();
        var category = $doc.find(".list_cate a").textAll(", ");
        var rating = $doc.find(".kksr-legend").text().trim();
        
        // 1. Tìm Post ID bí mật của phim để gọi Player
        var postId = $doc.find("#main-contents").attr("data-id");
        if (!postId) {
            var matchId = html.match(/data-id="(\d+)"/);
            postId = matchId ? matchId[1] : "";
        }

        // 2. Trích xuất mảng Chất lượng (VD: 4K, 1080P...)
        var qualities = [];
        $doc.find("#halim-ajax-list-server span.get-eps").each(function() {
            var qName = this.text().trim();
            var qType = this.attr("data-type");
            if (qName && qType) {
                qualities.push({ name: qName, type: qType });
            }
        });
        if (qualities.length === 0) {
            qualities.push({ name: "Mặc định", type: "pro" });
        }

        // 3. Trích xuất Audio (Vietsub, Thuyết Minh...) và danh sách Tập
        var audioServers = [];
        $doc.find(".halim-server").each(function() {
            var audioName = this.find(".halim-server-name").text().replace(/#|:|\n/g, "").trim();
            if(!audioName) audioName = "Vietsub";
            var episodes = [];
            
            this.find(".halim-list-eps li a").each(function() {
                var name = this.attr("title") || this.text().trim();
                var ep = this.attr("data-ep") || name.replace(/\s+/g, "-");
                var sv = this.attr("data-sv") || "1";
                episodes.push({ name: name, ep: ep, sv: sv });
            });
            
            if(episodes.length > 0) audioServers.push({ name: audioName, eps: episodes });
        });

        // 4. Kết hợp Chất Lượng x Âm Thanh ra Menu Server hoàn chỉnh
        var finalServers = [];
        for (var i = 0; i < audioServers.length; i++) {
            var audio = audioServers[i];
            
            for (var j = 0; j < qualities.length; j++) {
                var quality = qualities[j];
                var combinedName = audio.name + " - " + quality.name; // -> "Vietsub - 4K V1"
                
                var combinedEpisodes = [];
                for (var k = 0; k < audio.eps.length; k++) {
                    var epData = audio.eps[k];
                    
                    // Gắn payload vào ID tập phim để parseDetailResponse gọi API lấy phim
                    var payload = "post_id=" + postId + "&type=" + quality.type + "&sv=" + epData.sv + "&ep=" + epData.ep;
                    var fakeId = url + (url.indexOf("?") > -1 ? "&" : "?") + payload;
                    
                    combinedEpisodes.push({
                        id: fakeId,
                        name: epData.name,
                        slug: epData.ep + "-" + epData.sv + "-" + quality.type
                    });
                }
                
                // Sort lại số thứ tự từ Nhỏ đến Lớn
                combinedEpisodes.sort(function(a, b) {
                    var numA = parseInt((a.name.match(/\d+/) || [0])[0]);
                    var numB = parseInt((b.name.match(/\d+/) || [0])[0]);
                    return numA - numB;
                });

                finalServers.push({
                    name: combinedName,
                    episodes: combinedEpisodes
                });
            }
        }

        return JSON.stringify({
            id: url,
            title: title,
            originName: originName,
            posterUrl: fixHref(posterUrl),
            backdropUrl: fixHref(posterUrl),
            description: description,
            category: category,
            quality: "HD",
            rating: rating || "4.5/5",
            episode_current: episode_current,
            servers: finalServers
        });
    } catch(e) {
        return JSON.stringify({ id: url, title: "Lỗi phim", servers: [] });
    }
}

function parseDetailResponse(html, url) {
    try {
        // Tách tham số payload bị mã hóa ngược từ URL giả
        var postIdMatch = url.match(/post_id=([^&]+)/);
        var typeMatch = url.match(/type=([^&]+)/);
        var svMatch = url.match(/sv=([^&]+)/);
        var epMatch = url.match(/ep=([^&]+)/);
        
        var postId = postIdMatch ? postIdMatch[1] : "";
        var type = typeMatch ? typeMatch[1] : "pro";
        var sv = svMatch ? svMatch[1] : "1";
        var ep = epMatch ? epMatch[1] : "tap-1";
        
        // Gọi thẳng vào API backend ẩn của web hhpanda
        var ajaxUrl = BASE_URL + "/player/player.php?action=dox_ajax_player&post_id=" + postId + "&chapter_st=" + ep + "&type=" + type + "&sv=" + sv;
        var finalEmbedUrl = ajaxUrl;

        // Nếu có hàm httpRequest từ App -> Request chặn luôn src Iframe lồng bên trong
        if (typeof httpRequest === "function") {
            var res = httpRequest(ajaxUrl, { 
                method: "GET", 
                headers: { "Referer": url, "X-Requested-With": "XMLHttpRequest" } 
            });
            if (res && res.body) {
                var iframeMatch = res.body.match(/src=["']([^"']+)["']/i);
                if (iframeMatch && iframeMatch[1]) {
                    finalEmbedUrl = iframeMatch[1];
                    if (finalEmbedUrl.indexOf("http") !== 0) {
                        if (finalEmbedUrl.indexOf("//") === 0) finalEmbedUrl = "https:" + finalEmbedUrl;
                        else finalEmbedUrl = BASE_URL + finalEmbedUrl;
                    }
                }
            }
        }

        // Custom JS để Sniffer bắt sống m3u8 từ Iframe video (Đã bóc sạch khỏi web mẹ)
        var customJsCode = `
            (function() {
                if (window._vaapp_sniffer) return;
                window._vaapp_sniffer = true;
                var hasSent = false;
                
                function sendUrl(playUrl) {
                    if (hasSent || !playUrl || typeof playUrl !== 'string') return;
                    var lowerUrl = playUrl.toLowerCase();
                    if (lowerUrl.indexOf('.m3u8') > -1 || (lowerUrl.indexOf('.mp4') > -1 && lowerUrl.indexOf('blob:') === -1)) {
                        hasSent = true;
                        var headers = JSON.stringify({
                            "Referer": window.location.href,
                            "User-Agent": navigator.userAgent
                        });
                        if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
                            window.SnifferBridge.play(playUrl, headers);
                        }
                    }
                }

                var rawFetch = window.fetch;
                window.fetch = async function (...args) {
                    var reqUrl = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                    sendUrl(reqUrl);
                    return rawFetch.apply(this, args);
                };

                var rawXHROpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function (method, reqUrl) {
                    sendUrl(reqUrl);
                    return rawXHROpen.apply(this, arguments);
                };
                
                var observer = new MutationObserver(function() {
                    if(hasSent) return;
                    var v = document.querySelector('video');
                    if (v && v.src && v.src.indexOf('blob:') === -1) {
                        sendUrl(v.src);
                    }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });

                // Tự động Play Player để nó Request Mạng lấy M3U8
                var tryPlay = setInterval(function() {
                    if(hasSent) { clearInterval(tryPlay); return; }
                    var playBtn = document.querySelector('.jw-display-icon-display, .play-button, .vjs-big-play-button');
                    if (playBtn) playBtn.click();
                    
                    if (typeof jwplayer === 'function') {
                        try {
                            var p = jwplayer();
                            if (p && typeof p.play === 'function') p.play();
                        } catch(e){}
                    }
                }, 1000);
                setTimeout(function(){ clearInterval(tryPlay); }, 8000);
            })();
        `;
        
        return JSON.stringify({
            "url": finalEmbedUrl,
            "isEmbed": true,
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": BASE_URL + "/",
                "Block-Ads": "true",
                "Custom-Js": customJsCode.replace(/\n/g, " ").trim()
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": url, "isEmbed": true });
    }
}

function parseEmbedResponse() { return "{}"; }
function parseCategoriesResponse() { return "[]"; }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

// =============================================================================
// HELPER: MiniJQ
// =============================================================================
function _$(htmlOrBlock){if(htmlOrBlock&&typeof htmlOrBlock==='object'&&htmlOrBlock.elements){return htmlOrBlock}var instance={sourceHtml:typeof htmlOrBlock==='string'?htmlOrBlock:'',elements:Array.isArray(htmlOrBlock)?htmlOrBlock:(htmlOrBlock?[htmlOrBlock]:[]),find:function(selector){if(selector.indexOf(',')!==-1){var results=[];var selectors=selector.split(',').map(function(s){return s.trim()});for(var s=0;s<selectors.length;s++){if(selectors[s]==="")continue;var subInstance=this.find(selectors[s]);for(var r=0;r<subInstance.elements.length;r++){var element=subInstance.elements[r];if(results.indexOf(element)===-1){results.push(element)}}}var multiInstance=_$(results);multiInstance.sourceHtml=this.sourceHtml;return multiInstance}var results=[];var contentFilter="";if(selector.indexOf(":content(")!==-1){var contentMatch=selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if(contentMatch){contentFilter=contentMatch[1]||contentMatch[2]||contentMatch[3]||"";selector=selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"")}}var attrNameFilter="";var attrValueFilter="";var attrOperator="=";var hasAttrFilter=false;var attrMatch=selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if(attrMatch){hasAttrFilter=true;attrNameFilter=attrMatch[1];attrOperator=attrMatch[2];attrValueFilter=attrMatch[3]||attrMatch[4]||attrMatch[5]||"";selector=selector.replace(/\[.*?\]/,"")}var notSelector="";if(selector.indexOf(":not(")!==-1){var notMatch=selector.match(/:not\(([^)]+)\)/);if(notMatch){notSelector=notMatch[1];selector=selector.replace(/:not\([^)]+\)/,"")}}var isFirstFilter=selector.indexOf(":first")!==-1;var isLastFilter=selector.indexOf(":last")!==-1;selector=selector.replace(/:first|:last/g,"");var targetTagName="";var targetId="";var targetClasses=[];var selectorToParse=selector.trim();if(selectorToParse!==""){var idIndex=selectorToParse.indexOf('#');if(idIndex!==-1){var afterId=selectorToParse.substring(idIndex+1);var nextDot=afterId.indexOf('.');targetId=nextDot===-1?afterId:afterId.substring(0,nextDot);selectorToParse=selectorToParse.substring(0,idIndex)+(nextDot===-1?"":"."+afterId.substring(nextDot+1))}var classParts=selectorToParse.split('.');var possibleTag=classParts.shift();if(possibleTag){targetTagName=possibleTag.toLowerCase()}targetClasses=classParts.filter(function(c){return c.length>0})}for(var i=0;i<this.elements.length;i++){var currentHtml=this.elements[i];var pos=0;var subResults=[];while((pos=currentHtml.indexOf('<',pos))!==-1){if(currentHtml.charAt(pos+1)==='/'||currentHtml.charAt(pos+1)==='!'){pos++;continue}var endOpenTag=-1;var insideQuote=false;var quoteChar='';for(var j=pos+1;j<currentHtml.length;j++){var char=currentHtml.charAt(j);if((char==='"'||char==="'")&&currentHtml.charAt(j-1)!=='\\'){if(!insideQuote){insideQuote=true;quoteChar=char}else if(char===quoteChar){insideQuote=false}}if(char==='>'&&!insideQuote){endOpenTag=j;break}}if(endOpenTag===-1)break;var fullOpenTag=currentHtml.substring(pos,endOpenTag+1);var tagMatch=fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/);var currentTagName=tagMatch?tagMatch[1].toLowerCase():"";var isMatched=true;if(targetTagName&&targetTagName!==currentTagName){isMatched=false}var getClassAttr=fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var classMatchStr=getClassAttr?(getClassAttr[1]||getClassAttr[2]||getClassAttr[3]||""):"";var getIdAttr=fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var idMatchStr=getIdAttr?(getIdAttr[1]||getIdAttr[2]||getIdAttr[3]||""):"";if(isMatched&&targetId&&idMatchStr!==targetId){isMatched=false}if(isMatched&&targetClasses.length>0){if(classMatchStr){var currentClasses=classMatchStr.trim().split(/\s+/);for(var c=0;c<targetClasses.length;c++){if(currentClasses.indexOf(targetClasses[c])===-1){isMatched=false;break}}}else{isMatched=false}}if(isMatched&&hasAttrFilter){var actualValue="";if(attrNameFilter==="class"){actualValue=classMatchStr}else if(attrNameFilter==="id"){actualValue=idMatchStr}else{var getAnyAttr=fullOpenTag.match(new RegExp(attrNameFilter+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));actualValue=getAnyAttr?(getAnyAttr[1]||getAnyAttr[2]||getAnyAttr[3]||""):""}var attrExists=fullOpenTag.search(new RegExp(attrNameFilter+'\\s*=','i'))!==-1;if(!attrExists){isMatched=false}else{if(attrOperator==="="){if(attrNameFilter==="class"){var classes=actualValue.trim().split(/\s+/);if(classes.indexOf(attrValueFilter)===-1)isMatched=false}else if(actualValue!==attrValueFilter){isMatched=false}}else if(attrOperator==="*="){if(actualValue.indexOf(attrValueFilter)===-1)isMatched=false}else if(attrOperator==="^="){if(actualValue.indexOf(attrValueFilter)!==0)isMatched=false}else if(attrOperator==="$="){if(actualValue.slice(-attrValueFilter.length)!==attrValueFilter)isMatched=false}}}if(isMatched){var startTagPos=pos;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if(selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var scanPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while(depth>0&&scanPos<currentHtml.length){var nextOpen=currentHtml.indexOf(openStr,scanPos);var nextClose=currentHtml.indexOf(closeStr,scanPos);if(nextClose===-1){scanPos=currentHtml.length;break}if(nextOpen!==-1&&nextOpen<nextClose){depth++;scanPos=nextOpen+openStr.length}else{depth--;scanPos=nextClose+closeStr.length;if(depth===0)endTagPos=nextClose+closeStr.length}}}var foundBlock=currentHtml.substring(startTagPos,endTagPos);if(contentFilter){var pureText=foundBlock.replace(/<[^>]+>/g,"").trim();if(pureText.indexOf(contentFilter)===-1){pos=endTagPos;continue}}if(notSelector){var isNotClass=notSelector.indexOf('.')===0;var isNotId=notSelector.indexOf('#')===0;var notValue=notSelector.substring(1);var hasNot=false;if(isNotClass&&classMatchStr.indexOf(notValue)!==-1)hasNot=true;if(isNotId&&idMatchStr.indexOf(notValue)!==-1)hasNot=true;if(!hasNot)subResults.push(foundBlock)}else{subResults.push(foundBlock)}pos=endTagPos}else{pos++}}if(isFirstFilter&&subResults.length>0)subResults=[subResults[0]];if(isLastFilter&&subResults.length>0)subResults=[subResults[subResults.length-1]];results=results.concat(subResults)}var newInstance=_$(results);newInstance.sourceHtml=this.sourceHtml||currentHtml;return newInstance},each:function(callback){for(var i=0;i<this.elements.length;i++){var childInstance=_$(this.elements[i]);childInstance.sourceHtml=this.sourceHtml;callback.call(childInstance,i,this.elements[i])}return this},eq:function(index){if(index<0)index=this.elements.length+index;var matchedElement=this.elements[index];this.elements=matchedElement?[matchedElement]:[];return this},attr:function(attrName){if(this.elements.length===0)return"";var elem=this.elements[0];var getAttr=elem.match(new RegExp(attrName+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));return getAttr?(getAttr[1]||getAttr[2]||getAttr[3]||""):""},html:function(){if(this.elements.length===0)return"";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if(start>0&&end>start)return elem.substring(start,end);return""},textAll:function(separator){if(this.elements.length===0)return"";var sep=typeof separator==='string'?separator:" ";var allTexts=[];for(var i=0;i<this.elements.length;i++){var elem=this.elements[i];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if(start>0&&end>start){var content=elem.substring(start,end);var pureText=content.replace(/<\/?[^>]+(>|$)/g,"");var cleanText=pureText.split('\n').map(function(item){return item.trim()}).filter(function(item){return item!==''}).join(' ');if(cleanText!==''){allTexts.push(cleanText)}}}return allTexts.join(sep)},text:function(){if(this.elements.length===0)return"";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if(start>0&&end>start){var content=elem.substring(start,end);var pureText=content.replace(/<\/?[^>]+(>|$)/g,"");return pureText.trim()}return""}};return instance}

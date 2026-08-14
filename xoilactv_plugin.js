// =============================================================================
// PLUGIN VAX: XOILAC TV (NATIVE HLS SIÊU TỐC)
// =============================================================================

var DOMAIN = "xoilaczzssz.tv";
var BASEURL = "https://" + DOMAIN;
var DEFAULT_POSTER = BASEURL + "/wp-content/themes/bongda/dist/images/logo-xlz.png";

function getManifest() {
    return JSON.stringify({
        "id": "XoilacTV",
        "name": "Xoilac TV - Trực Tiếp",
        "description": "Hệ thống trực tiếp Bóng Đá Xoilac TV. Tốc độ cao, không quảng cáo.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": DEFAULT_POSTER,
        "isEnabled": true,
        "layoutType": "LIST",
        "type": "MOVIE",
        // Bắt trực tiếp link M3U8 từ script nên phát thẳng bằng ExoPlayer, bỏ qua Webview!
        "playerType": "exoplayer" 
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') nativeLog("[XoilacTV] " + msg);
    else if (typeof console !== 'undefined' && console.log) console.log("[XoilacTV] " + msg);
}

function decodeEntities(str) {
    if (!str) return "";
    return str.replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'")
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
}

// Hàm dọn dẹp các ký hiệu thừa trong tên trận
function cleanMatchTitle(rawTitle) {
    if (!rawTitle) return "Trực tiếp Bóng Đá";
    return rawTitle.replace(/🏆/g, '')
                   .replace(/\[[^\]]*\]/g, '')
                   .replace(/LIVE/gi, '')
                   .replace(/\s+/g, ' ')
                   .trim();
}

// Phân loại mục trang chủ
function getHomeSections() {
    return JSON.stringify([
        { slug: 'live', title: '🔥 Tâm Điểm Đang Live', type: 'List' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: '🔥 Trận Đấu Mới Nhất', slug: 'live' }
    ]);
}

function getFilterConfig() { return JSON.stringify({}); }

// Tắt tìm kiếm vì trang thể thao trực tiếp thường không dùng
function getUrlList(slug, filtersJson) { return BASEURL + "/"; }
function getUrlSearch(keyword, filtersJson) { return ""; }
function getUrlDetail(slug) { return slug; }
function getUrlCategories() { return BASEURL + "/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSE DANH SÁCH (Tách trận LIVE và SẮP ĐÁ)
// =============================================================================

function parseListResponse(html, url) {
    try {
        var items = [];
        var doc = _$(html);
        
        // Theo như mã HTML bạn cung cấp, cấu trúc mỗi nút trận đấu nằm trong thẻ button hoặc article
        var itemRegex = /<(button|article)([^>]*team-live-football[^>]*)>([\s\S]*?)<\/\1>/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var attrBlock = match[2];
            var innerContent = match[3];

            // 1. Trích xuất Tên Trận
            var titleRegex = /class="[^"]*teambox__team-home-name[^"]*"[^>]*>([^<]+)<\/div>[\s\S]*?class="[^"]*teambox__team-away-name[^"]*"[^>]*>([^<]+)<\/div>/i;
            var teamMatch = titleRegex.exec(innerContent);
            var cleanTitle = "Trận Đấu Đang Cập Nhật";
            
            if(teamMatch && teamMatch.length >= 3) {
                cleanTitle = teamMatch[1].trim() + " vs " + teamMatch[2].trim();
            }

            // Loại bỏ các mục rác quảng cáo của Xoilac
            if (cleanTitle.indexOf("Cập Nhật") !== -1 || 
                cleanTitle.indexOf("Địa Chỉ IP") !== -1 || 
                cleanTitle.indexOf("Chào Khách Lạ") !== -1) {
                continue;
            }

            // 2. Trích xuất URL
            var urlMatch = innerContent.match(/href="([^"]+)"[^>]*title="[^"]*Xem phim[^"]*"/i);
            // Backup nếu thẻ A không dùng chữ "Xem phim"
            if (!urlMatch) {
                 var aTagRegex = /<a[^>]*href="([^"]+)"[^>]*class="[^"]*btn-stream-link[^"]*"/i;
                 urlMatch = innerContent.match(aTagRegex);
            }
            
            // Xoilac sử dụng một khối a bọc nguyên trận khi vào link
            var blockUrlRegex = /<a[^>]*href="([^"]+)"[^>]*>/i;
            var hrefMatch = blockUrlRegex.exec(innerContent);
            
            // Lấy ID trận (data-fid) để làm tham số dự phòng
            var fIdMatch = attrBlock.match(/data-fid="([^"]*)"/i);
            var fid = fIdMatch ? fIdMatch[1] : "";

            var streamUrl = "";
            if (hrefMatch && hrefMatch[1] && hrefMatch[1].indexOf('http') !== -1) {
                streamUrl = hrefMatch[1];
            } else {
                 continue; // Không có link thì bỏ qua
            }

            // 3. Trạng Thái Trận Đấu
            var statusMatch = attrBlock.match(/data-status="([^"]*)"/i);
            var statusCode = statusMatch ? statusMatch[1] : "0";
            var isLive = (statusCode !== "1" && statusCode !== "0"); // 1 là Chưa Bắt Đầu
            
            var timeTagMatch = innerContent.match(/<text[^>]*class="t_time[^>]*>([^<]+)<\/text>/i);
            var timeText = timeTagMatch ? timeTagMatch[1].trim() : (isLive ? "🔴 Đang Live" : "Sắp Đá");

            // 4. Logo đội bóng (dùng làm Poster)
            var imgMatches = innerContent.match(/<img[^>]*src='([^']+)'/gi);
            var posterUrl = DEFAULT_POSTER;
            if(imgMatches && imgMatches.length > 0) {
                 var firstImg = imgMatches[0].match(/src='([^']+)'/i);
                 if(firstImg && firstImg[1]) posterUrl = firstImg[1];
            }

            items.push({
                "id": streamUrl,
                "title": cleanTitle,
                "posterUrl": posterUrl,
                "backdropUrl": posterUrl,
                "quality": isLive ? "LIVE" : "SẮP CHIẾU",
                "episode_current": timeText
            });
        }

        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });

    } catch (e) {
        log("Lỗi parseListResponse: " + e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html) { 
    return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } }); 
}

// =============================================================================
// CHI TIẾT & BÓC MẢNG STREAM JSON TỪ SCRIPT
// =============================================================================

function parseMovieDetail(html, url) {
    try {
        var doc = _$(html);
        
        var titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        var title = titleMatch ? decodeEntities(titleMatch[1].replace(/Phát trực tiếp/gi, '').trim()) : "Trực Tiếp Bóng Đá";

        // Móc toàn bộ cục script chứa biến list_stream của web
        var scriptBlockMatch = html.match(/var\s+list_stream\s*=\s*(\[.*?\]);/is);
        var servers = [];

        if (scriptBlockMatch && scriptBlockMatch[1]) {
            try {
                var streamArray = JSON.parse(scriptBlockMatch[1]);
                var episodes = [];
                
                // Mảng này thường chứa nhiều mảng con đại diện cho các kênh (Channel9, TONI...)
                for (var i = 0; i < streamArray.length; i++) {
                    var channelLinks = streamArray[i];
                    if (channelLinks && channelLinks.length > 0) {
                        var m3u8Url = channelLinks[0];
                        
                        // Xử lý tự động ép tắt quảng cáo TVC đầu trận (giống code web gốc)
                        if (m3u8Url.indexOf('off-tvc') === -1) {
                             m3u8Url += "/off-tvc";
                        }
                        m3u8Url += (m3u8Url.indexOf("?") === -1 ? "?" : "&") + "is_off_add=false";

                        episodes.push({
                            id: m3u8Url + "|User-Agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36|Referer=" + BASEURL + "/",
                            name: "🔗 Kênh " + (i + 1) + " (Nhanh Nhất)",
                            slug: "channel-" + i
                        });
                    }
                }

                if (episodes.length > 0) {
                    servers.push({ name: "Danh Sách Link Tốc Độ Cao", episodes: episodes });
                }

            } catch(e) { log("Lỗi parse list_stream JSON: " + e); }
        }

        // Kế hoạch dự phòng: Nếu không bắt được script, đọc link từ thẻ a có id tv_link_
        if (servers.length === 0) {
            var eps = [];
            var count = 1;
            doc.find(".player-link").each(function() {
                var href = this.attr("href");
                var name = this.text().trim() || ("Kênh " + count);
                if (href) {
                     eps.push({ id: href, name: name, slug: "chan-" + count });
                     count++;
                }
            });
            if(eps.length > 0) {
                 servers.push({ name: "Kênh Dự Phòng (Cần qua Sniffer)", episodes: eps });
            }
        }

        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: DEFAULT_POSTER,
            backdropUrl: DEFAULT_POSTER,
            description: "Xoilac TV - Kênh phát trực tiếp bóng đá siêu tốc độ, không quảng cáo.",
            servers: servers
        });
    } catch (e) {
        return JSON.stringify({ id: url, title: "Lỗi tải luồng", servers: [] });
    }
}

// Bắt thẳng link m3u8 truyền vào nếu có
function parseDetailResponse(html, url) {
    var cleanUrl = url.split('|')[0];
    
    // Nếu URL đã là m3u8 từ script JSON ở bước parseMovieDetail, thì đập thẳng ra Native luôn
    if (cleanUrl.indexOf('.m3u8') !== -1 || cleanUrl.indexOf('textliveupdaterz.com') !== -1) {
         return JSON.stringify({
             url: cleanUrl,
             isEmbed: false,
             mimeType: "application/x-mpegURL",
             headers: {
                 "Referer": BASEURL + "/",
                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
             },
             subtitles: []
         });
    }

    // Nếu lọt vào luồng dự phòng (trang HTML), dùng Embed để bật Webview tự dò m3u8
    var customJs = `
        (function() {
            if(window._vx_hook) return;
            window._vx_hook = true;
            setInterval(function(){
               var f = document.querySelector('iframe#iframe-stream');
               if(f && f.src && f.src.indexOf('http')===0) {
                   if(window.SnifferBridge) window.SnifferBridge.play(f.src, JSON.stringify({"Referer": window.location.href}));
               }
            }, 1000);
        })();
    `;

    return JSON.stringify({
        url: cleanUrl,
        isEmbed: true,
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36",
            "Referer": BASEURL + "/",
            "Block-Ads": "true",
            "Block-Redirects": "true",
            "Custom-Js": customJs.replace(/\n/g, "").trim()
        },
        subtitles: []
    });
}

function parseEmbedResponse(html, url) { return parseDetailResponse(html, url); }
function parseCategoriesResponse() { return "[]"; }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

// =============================================================================
// THƯ VIỆN DOM ẢO _$
// =============================================================================
function _$(htmlOrBlock){if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) {return htmlOrBlock;} var instance = {sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),length: 0,find: function (selector) {if (selector.indexOf(',') !== -1) {var results = [];var selectors = selector.split(',').map(function (s) {return s.trim();});for (var s = 0;s < selectors.length;s++) {if (selectors[s] === "") continue;var subInstance = this.find(selectors[s]);for (var r = 0;r < subInstance.elements.length;r++) {var element = subInstance.elements[r];if (results.indexOf(element) === -1) {results.push(element);}}} var multiInstance = _$(results);multiInstance.sourceHtml = this.sourceHtml;return multiInstance;} var results = [];var contentFilter = "";if (selector.indexOf(":content(") !== -1) {var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch) {contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || "";selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}} var attrNameFilter = "";var attrValueFilter = "";var attrOperator = "=";var hasAttrFilter = false;var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if (attrMatch) {hasAttrFilter = true;attrNameFilter = attrMatch[1];attrOperator = attrMatch[2];attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || "";selector = selector.replace(/\[.*?\]/,"");} var notSelector = "";if (selector.indexOf(":not(") !== -1) {var notMatch = selector.match(/:not\(([^)]+)\)/);if (notMatch) {notSelector = notMatch[1];selector = selector.replace(/:not\([^)]+\)/,"");}} var isFirstFilter = selector.indexOf(":first") !== -1;var isLastFilter = selector.indexOf(":last") !== -1;selector = selector.replace(/:first|:last/g,"");var targetTagName = "";var targetId = "";var targetClasses = [];var selectorToParse = selector.trim();if (selectorToParse !== "") {var idIndex = selectorToParse.indexOf('#');if (idIndex !== -1) {var afterId = selectorToParse.substring(idIndex + 1);var nextDot = afterId.indexOf('.');targetId = nextDot === -1 ? afterId : afterId.substring(0, nextDot);selectorToParse = selectorToParse.substring(0, idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1));} var classParts = selectorToParse.split('.');var possibleTag = classParts.shift();if (possibleTag) {targetTagName = possibleTag.toLowerCase();} targetClasses = classParts.filter(function (c) {return c.length > 0;});} for (var i = 0;i < this.elements.length;i++) {var currentHtml = this.elements[i];var pos = 0;var subResults = [];while ((pos = currentHtml.indexOf('<',pos)) !== -1) {if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') {pos++;continue;} var endOpenTag = currentHtml.indexOf('>',pos);if (endOpenTag === -1) break;var fullOpenTag = currentHtml.substring(pos,endOpenTag + 1);var spacePos = fullOpenTag.indexOf(' ');var currentTagName = "";if (spacePos === -1) {currentTagName = fullOpenTag.substring(1,fullOpenTag.length - 1).toLowerCase();} else {currentTagName = fullOpenTag.substring(1,spacePos).toLowerCase();} var isMatched = true;if (targetTagName && targetTagName !== currentTagName) {isMatched = false;} if (isMatched && targetId) {var idMatchStr = "";var idPos = fullOpenTag.indexOf('id="');if (idPos !== -1) {var startQuote = idPos + 4;idMatchStr = fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));} else {idPos = fullOpenTag.indexOf("id='");if (idPos !== -1) {var startQuote = idPos + 4;idMatchStr = fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}} if (idMatchStr !== targetId) {isMatched = false;}} if (isMatched && targetClasses.length > 0) {var classMatchStr = "";var classPos = fullOpenTag.indexOf('class="');if (classPos !== -1) {var startQuote = classPos + 7;classMatchStr = fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));} else {classPos = fullOpenTag.indexOf("class='");if (classPos !== -1) {var startQuote = classPos + 7;classMatchStr = fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}} if (classMatchStr) {var currentClasses = classMatchStr.trim().split(/\s+/);for (var c = 0;c < targetClasses.length;c++) {if (currentClasses.indexOf(targetClasses[c]) === -1) {isMatched = false;break;}}} else {isMatched = false;}} if (isMatched && hasAttrFilter) {var actualValue = "";var attrPos = fullOpenTag.indexOf(attrNameFilter + '="');if (attrPos !== -1) {var startQuote = attrPos + attrNameFilter.length + 2;actualValue = fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));} else {attrPos = fullOpenTag.indexOf(attrNameFilter + "='");if (attrPos !== -1) {var startQuote = attrPos + attrNameFilter.length + 2;actualValue = fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}} if (attrPos === -1) {isMatched = false;} else {if (attrOperator === "=") {if (attrNameFilter === "class") {var classes = actualValue.trim().split(/\s+/);if (classes.indexOf(attrValueFilter) === -1) isMatched = false;} else if (actualValue !== attrValueFilter) {isMatched = false;}} else if (attrOperator === "*=") {if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false;} else if (attrOperator === "^=") {if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false;} else if (attrOperator === "$=") {if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false;}}} if (isMatched) {var startTagPos = pos;var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {var depth = 1;var scanPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && scanPos < currentHtml.length) {var nextOpen = currentHtml.indexOf(openStr,scanPos);var nextClose = currentHtml.indexOf(closeStr,scanPos);if (nextClose === -1) {scanPos = currentHtml.length;break;} if (nextOpen !== -1 && nextOpen < nextClose) {depth++;scanPos = nextOpen + openStr.length;} else {depth--;scanPos = nextClose + closeStr.length;if (depth === 0) endTagPos = nextClose + closeStr.length;}}} var foundBlock = currentHtml.substring(startTagPos,endTagPos);if (contentFilter) {var pureText = foundBlock.replace(/<[^>]+>/g,"").trim();if (pureText.indexOf(contentFilter) === -1) {pos = endTagPos;continue;}} if (notSelector) {var isNotClass = notSelector.indexOf('.') === 0;var isNotId = notSelector.indexOf('#') === 0;var notValue = notSelector.substring(1);var hasNot = false;if (isNotClass && fullOpenTag.indexOf('class="') !== -1 && fullOpenTag.indexOf(notValue) !== -1) hasNot = true;if (isNotId && fullOpenTag.indexOf('id="') !== -1 && fullOpenTag.indexOf(notValue) !== -1) hasNot = true;if (!hasNot) subResults.push(foundBlock);} else {subResults.push(foundBlock);} pos = endTagPos;} else {pos++;}} if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]];if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]];results = results.concat(subResults);} var newInstance = _$(results);newInstance.sourceHtml = this.sourceHtml || currentHtml;return newInstance;},each: function (callback) {for (var i = 0;i < this.elements.length;i++) {var childInstance = _$(this.elements[i]);childInstance.sourceHtml = this.sourceHtml;callback.call(childInstance,i,this.elements[i]);} return this;},eq: function (index) {if (index < 0) index = this.elements.length + index;var matchedElement = this.elements[index];this.elements = matchedElement ? [matchedElement] : [];return this;},attr: function (attrName) {if (this.elements.length === 0) return "";var elem = this.elements[0];var searchStr = attrName + '="';var pos = elem.indexOf(searchStr);if (pos === -1) {searchStr = attrName + "='";pos = elem.indexOf(searchStr);} if (pos === -1) return "";var start = pos + searchStr.length;var quoteType = elem.charAt(start - 1);var end = elem.indexOf(quoteType,start);return end === -1 ? "" : elem.substring(start,end);},html: function () {if (this.elements.length === 0) return "";var elem = this.elements[0];var start = elem.indexOf('>') + 1;var end = elem.lastIndexOf('</');if (start > 0 && end > start) return elem.substring(start,end);return "";},text: function () {if (this.elements.length === 0) return "";var elem = this.elements[0];var start = elem.indexOf('>') + 1;var end = elem.lastIndexOf('</');if (start > 0 && end > start) {var content = elem.substring(start,end);return content.replace(/<\/?[^>]+(>|$)/g,"").trim();} return "";}};return instance;}

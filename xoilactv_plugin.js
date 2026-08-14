// =============================================================================
// PLUGIN VAX: XOILAC TV (NATIVE HLS + TỰ ĐỘNG CHIA NHÓM THỂ THAO)
// =============================================================================

var DOMAIN = "xoilaczzssz.tv";
var BASEURL = "https://" + DOMAIN;
var DEFAULT_POSTER = BASEURL + "/wp-content/themes/bongda/dist/images/logo-xlz.png";

function getManifest() {
    return JSON.stringify({
        "id": "XoilacTV",
        "name": "XoilacZ TV",
        "description": "Lọc chính xác từng môn thể thao. Phát M3U8 Native tốc độ cao.",
        "version": "2.1.0",
        "baseUrl": BASEURL,
        "iconUrl": DEFAULT_POSTER,
        "isEnabled": true,
        "layoutType": "LIST",
        "type": "MOVIE",
        "playerType": "exoplayer" // Ưu tiên phát trực tiếp bằng Native Player
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

// =============================================================================
// MENU & TRANG CHỦ (Tạo danh mục chính xác)
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: 'live-now', title: '🔥 LIVE NOW (Tất Cả)', type: 'Grid' },
        { slug: 'football', title: '⚽ Bóng Đá', type: 'Horizontal' },
        { slug: 'basketball', title: '🏀 Bóng Rổ', type: 'Horizontal' },
        { slug: 'tennis', title: '🎾 Tennis', type: 'Horizontal' },
        { slug: 'badminton', title: '🏸 Cầu Lông', type: 'Horizontal' },
        { slug: 'volleyball', title: '🏐 Bóng Chuyền', type: 'Horizontal' },
        { slug: 'esports', title: '🎮 E-Sports', type: 'Horizontal' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { slug: 'live-now', name: '🔥 Live Now' },
        { slug: 'football', name: '⚽ Bóng Đá' },
        { slug: 'basketball', name: '🏀 Bóng Rổ' },
        { slug: 'tennis', name: '🎾 Tennis' },
        { slug: 'badminton', name: '🏸 Cầu Lông' },
        { slug: 'volleyball', name: '🏐 Bóng Chuyền' },
        { slug: 'esports', name: '🎮 E-Sports' }
    ]);
}

function getFilterConfig() { return JSON.stringify({}); }

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) { 
    // Gắn thêm "filter=" vào URL để hàm parseListResponse biết đang ở mục nào
    return BASEURL + "/?filter=" + (slug || "live-now"); 
}

function getUrlSearch(keyword, filtersJson) { return ""; } // Tắt tìm kiếm
function getUrlDetail(slug) { return slug; }
function getUrlCategories() { return BASEURL + "/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSE DANH SÁCH (LỌC THEO MÔN THỂ THAO VÀ TÁCH RÁC)
// =============================================================================

function parseListResponse(html, url) {
    try {
        var items = [];
        var added = {};
        
        // Xác định đang ở mục (folder) nào dựa vào url
        var currentFilter = "live-now";
        var filterMatch = url.match(/filter=([^&]+)/i);
        if (filterMatch && filterMatch[1]) {
            currentFilter = filterMatch[1];
        }
        
        // Quét cấu trúc thẻ chứa trận đấu mới nhất của Xoilac: <div class="grid-matches__item ... data-sport="football">
        var itemRegex = /<div([^>]*grid-matches__item-match[^>]*)>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
        var match;
        
        while ((match = itemRegex.exec(html)) !== null) {
            var attrBlock = match[1];
            var innerHtml = match[2];
            
            // 1. Lọc theo Môn Thể Thao
            var sportMatch = attrBlock.match(/data-sport=["']([^"']+)["']/i);
            var sportType = sportMatch ? sportMatch[1].toLowerCase() : "football";
            
            // Nếu không phải Live Now, bỏ qua các trận không thuộc môn đang chọn
            if (currentFilter !== 'live-now' && sportType !== currentFilter) {
                continue;
            }

            // Nếu đang xem mục "esports" nhưng thuộc "lol", "csgo", "dota2" thì vẫn cho qua
            if (currentFilter === 'esports') {
                if (sportType !== 'esports' && sportType !== 'lol' && sportType !== 'csgo' && sportType !== 'dota2') {
                    continue;
                }
            }

            // 2. Lấy Tên Trận Đấu
            var cleanTitle = "Trận Đấu Đang Cập Nhật";
            var linkMatch = innerHtml.match(/<a[^>]*href=["']((?:https?:\/\/[^"']*)?\/truc-tiep\/[^"']+)["'][^>]*title=["']([^"']+)["']/i);
            var href = "";
            
            if (linkMatch) {
                href = linkMatch[1];
                cleanTitle = decodeEntities(linkMatch[2]);
            } else {
                continue;
            }

            if (href.indexOf('http') === -1) href = BASEURL + href;
            if (added[href]) continue;

            // Dọn rác
            var cleanTitleLower = cleanTitle.toLowerCase();
            if (cleanTitleLower.indexOf('xoilac') !== -1 || 
                cleanTitleLower.indexOf('địa chỉ ip') !== -1 || 
                cleanTitleLower.indexOf('chào khách lạ') !== -1) {
                continue;
            }

            // 3. Trích xuất thời gian và Trạng Thái
            var timeText = "LIVE";
            var timeTagMatch = innerHtml.match(/class=["']t_time time["'][^>]*>([^<]+)<\/text>/i);
            if (timeTagMatch && timeTagMatch[1]) {
                timeText = timeTagMatch[1].trim();
            }

            var isLive = innerHtml.toUpperCase().indexOf('ĐANG LIVE') !== -1 || innerHtml.toUpperCase().indexOf('HT') !== -1 || timeText.indexOf('LIVE') !== -1;
            
            // Nếu là mục Live Now, chỉ lấy các trận ĐANG ĐÁ
            if (currentFilter === 'live-now' && !isLive) {
                continue; 
            }

            // 4. Lấy Poster
            var poster = DEFAULT_POSTER;
            var imgMatches = innerHtml.match(/<img[^>]*src=["']([^"']+)["']/gi);
            if (imgMatches && imgMatches.length > 0) {
                 var firstImg = imgMatches[0].match(/src=["']([^"']+)["']/i);
                 if(firstImg && firstImg[1] && firstImg[1].indexOf('http') !== -1) {
                     poster = firstImg[1];
                 }
            }
            
            added[href] = true;
            items.push({
                id: href,
                title: cleanTitle.replace(/lúc.*/i, '').trim(),
                posterUrl: poster,
                backdropUrl: poster,
                quality: isLive ? "🔴 ĐANG LIVE" : "SẮP CHIẾU",
                episode_current: timeText
            });
        }

        return JSON.stringify({ items: items, pagination: { currentPage: 1, totalPages: 1 } });
    } catch (e) {
        log("Lỗi parseListResponse: " + e);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html) { 
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } }); 
}

// =============================================================================
// CHI TIẾT & BÓC MẢNG STREAM JSON TỪ SCRIPT NATIVE
// =============================================================================

function parseMovieDetail(html, url) {
    try {
        var doc = _$(html);
        
        var titleMatch = html.match(/<h1[^>]*>Phát trực tiếp ([^<]+)<\/h1>/i) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        var title = titleMatch ? decodeEntities(titleMatch[1].replace(/hôm nay vào lúc.*/i, '').trim()) : "Trực Tiếp Thể Thao";

        var servers = [];
        var episodes = [];

        var streamArray = [];
        var scriptBlockMatch = html.match(/var\s+list_stream\s*=\s*(\[.*?\]);/is);
        if (scriptBlockMatch && scriptBlockMatch[1]) {
            try { streamArray = JSON.parse(scriptBlockMatch[1]); } catch(e) {}
        }

        var channelNames = {};
        doc.find(".player-link").each(function() {
            var linkId = this.attr("data-link");
            var name = this.text().replace(/[\r\n\t]+/g, '').trim();
            if (linkId !== undefined && linkId !== null) {
                channelNames[linkId] = name;
            }
        });

        for (var i = 0; i < streamArray.length; i++) {
            var channelLinks = streamArray[i];
            if (channelLinks && channelLinks.length > 0) {
                var m3u8Url = channelLinks[0];
                
                if (m3u8Url.indexOf('off-tvc') === -1) m3u8Url += "/off-tvc";
                m3u8Url += (m3u8Url.indexOf("?") === -1 ? "?" : "&") + "is_off_add=true";

                var epName = channelNames[i] ? "🎙️ " + channelNames[i] : "📺 Kênh " + (i + 1);
                var finalUrl = m3u8Url + "|User-Agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36|Referer=" + BASEURL + "/";

                episodes.push({
                    id: finalUrl,
                    name: epName,
                    slug: "channel-" + i
                });
            }
        }

        if (episodes.length > 0) {
            servers.push({ name: "Danh Sách Kênh Trực Tiếp", episodes: episodes });
        }

        if (servers.length === 0) {
            var eps = [];
            var count = 1;
            doc.find(".player-link").each(function() {
                var href = this.attr("href");
                var name = this.text().replace(/[\r\n\t]+/g, '').trim();
                if (href) {
                     eps.push({ id: href, name: name || ("Kênh " + count), slug: "link-" + count });
                     count++;
                }
            });
            if (eps.length > 0) {
                 servers.push({ name: "Kênh Dự Phòng (Webview)", episodes: eps });
            }
        }

        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: DEFAULT_POSTER,
            backdropUrl: DEFAULT_POSTER,
            description: "Xoilac TV - Trực tiếp các môn thể thao tốc độ cao nhất.",
            servers: servers
        });
    } catch (e) {
        return JSON.stringify({ id: url, title: "Lỗi tải luồng", servers: [] });
    }
}

// Bắt thẳng link m3u8 ném cho ExoPlayer, nếu lọt lưới thì dùng Sniffer
function parseDetailResponse(html, url) {
    var cleanUrl = url.split('|')[0];
    
    var isEmbed = (cleanUrl.indexOf('.m3u8') === -1 && cleanUrl.indexOf('updaterz') === -1);
    
    var customJs = "";
    if (isEmbed) {
        customJs = `
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
    }

    return JSON.stringify({
        url: cleanUrl,
        isEmbed: isEmbed,
        mimeType: isEmbed ? "" : "application/x-mpegURL",
        headers: {
            "Referer": BASEURL + "/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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

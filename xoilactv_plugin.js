// =============================================================================
// PLUGIN VAX: XOILAC TV (NATIVE HLS SIÊU TỐC + CATEGORIES MÔN THỂ THAO)
// =============================================================================

var DOMAIN = "xoilaczzssz.tv";
var BASEURL = "https://" + DOMAIN;
var DEFAULT_POSTER = BASEURL + "/wp-content/themes/bongda/dist/images/logo-xlz.png";

function getManifest() {
    return JSON.stringify({
        "id": "XoilacTV",
        "name": "XoilacZ TV",
        "description": "Hệ thống trực tiếp Đa Thể Thao Xoilac. Tốc độ cao, không quảng cáo.",
        "version": "2.0.0",
        "baseUrl": BASEURL,
        "iconUrl": DEFAULT_POSTER,
        "isEnabled": true,
        "layoutType": "LIST",
        "type": "MOVIE",
        "playerType": "auto" // Hỗ trợ linh hoạt cả ExoPlayer và Webview nếu cần
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
// MENU & TRANG CHỦ (Đã chia danh mục theo đúng ảnh yêu cầu)
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: 'live-now', title: '🔥 LIVE NOW (Tất Cả)', type: 'Grid' },
        { slug: 'bong-da', title: '⚽ Bóng Đá', type: 'Horizontal' },
        { slug: 'bong-ro', title: '🏀 Bóng Rổ', type: 'Horizontal' },
        { slug: 'tennis', title: '🎾 Tennis', type: 'Horizontal' },
        { slug: 'cau-long', title: '🏸 Cầu Lông', type: 'Horizontal' },
        { slug: 'bong-chuyen', title: '🏐 Bóng Chuyền', type: 'Horizontal' },
        { slug: 'esports', title: '🎮 E-Sports', type: 'Horizontal' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { slug: 'live-now', name: '🔥 Live Now' },
        { slug: 'bong-da', name: '⚽ Bóng Đá' },
        { slug: 'bong-ro', name: '🏀 Bóng Rổ' },
        { slug: 'tennis', name: '🎾 Tennis' },
        { slug: 'cau-long', name: '🏸 Cầu Lông' },
        { slug: 'bong-chuyen', name: '🏐 Bóng Chuyền' },
        { slug: 'esports', name: '🎮 E-Sports' }
    ]);
}

function getFilterConfig() { return JSON.stringify({}); }

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) { 
    // Trỏ đúng về các thư mục của Xoilac để quét HTML
    if (slug === 'live-now' || !slug) return BASEURL + "/";
    return BASEURL + "/" + slug + "/"; 
}

// ĐÃ TẮT TÍNH NĂNG TÌM KIẾM
function getUrlSearch(keyword, filtersJson) { return ""; }
function getUrlDetail(slug) { return slug; }
function getUrlCategories() { return BASEURL + "/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSE DANH SÁCH TỪ HTML GỐC
// =============================================================================

function parseListResponse(html, url) {
    try {
        var items = [];
        var added = {};
        
        // Cào dữ liệu cực kỳ mạnh mẽ: Tìm toàn bộ thẻ <a> có chứa đường dẫn "/truc-tiep/"
        var linkRegex = /<a[^>]*href=["']((?:https?:\/\/[^"']*)?\/truc-tiep\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;
        
        while ((match = linkRegex.exec(html)) !== null) {
            var href = match[1];
            if (href.indexOf('http') === -1) href = BASEURL + href; // Bọc domain nếu là path tương đối
            if (added[href]) continue;
            
            var innerHtml = match[2];
            var cleanTitle = "Trận Đấu Đang Cập Nhật";
            
            // Lấy tên trận bằng cách bóc tách từ phần đuôi của URL (Ví dụ: chelsea-vs-arsenal-luc-20h)
            var slugMatch = href.match(/\/truc-tiep\/([^-]+(?:-[^-]+)*)-luc-/i) || href.match(/\/truc-tiep\/([^\/]+)/i);
            if (slugMatch) {
                cleanTitle = slugMatch[1].replace(/-vs-/gi, ' vs ').replace(/-/g, ' ').toUpperCase();
                cleanTitle = decodeURIComponent(cleanTitle);
            }

            // Loại bỏ các mục rác quảng cáo
            if (cleanTitle.toLowerCase().indexOf('xoilac') !== -1 || cleanTitle.indexOf('IP') !== -1) continue;

            // Tìm thông tin thời gian hoặc chữ LIVE
            var timeText = "LIVE";
            var timeMatch = innerHtml.match(/(?:>)([\d]{2}:[\d]{2}[^<]*)(?:<)/i) || innerHtml.match(/LIVE/i);
            if (timeMatch && timeMatch[1]) {
                timeText = timeMatch[1].trim();
            }
            
            // Tìm ảnh logo/poster
            var poster = DEFAULT_POSTER;
            var imgMatch = innerHtml.match(/<img[^>]*src=["']([^"']+)["']/i) || innerHtml.match(/data-src=["']([^"']+)["']/i);
            if (imgMatch) poster = imgMatch[1];
            
            added[href] = true;
            items.push({
                id: href,
                title: cleanTitle,
                posterUrl: poster,
                backdropUrl: poster,
                quality: innerHtml.toUpperCase().indexOf('LIVE') !== -1 ? "🔴 ĐANG LIVE" : "SẮP CHIẾU",
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
        
        // Lấy tên trận đấu
        var titleMatch = html.match(/<h1[^>]*>Phát trực tiếp ([^<]+)<\/h1>/i) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        var title = titleMatch ? decodeEntities(titleMatch[1].replace(/hôm nay vào lúc.*/i, '').trim()) : "Trực Tiếp Thể Thao";

        var servers = [];
        var episodes = [];

        // 1. Móc toàn bộ mảng JSON chứa biến list_stream của web Xoilac
        var streamArray = [];
        var scriptBlockMatch = html.match(/var\s+list_stream\s*=\s*(\[.*?\]);/is);
        if (scriptBlockMatch && scriptBlockMatch[1]) {
            try { streamArray = JSON.parse(scriptBlockMatch[1]); } catch(e) {}
        }

        // 2. Lấy tên Kênh bình luận viên từ DOM
        var channelNames = {};
        doc.find(".player-link").each(function() {
            var linkId = this.attr("data-link");
            var name = this.text().replace(/[\r\n\t]+/g, '').trim();
            if (linkId !== undefined && linkId !== null) {
                channelNames[linkId] = name;
            }
        });

        // 3. Kết hợp link JSON và tên Kênh để đẩy vào ExoPlayer
        for (var i = 0; i < streamArray.length; i++) {
            var channelLinks = streamArray[i];
            if (channelLinks && channelLinks.length > 0) {
                var m3u8Url = channelLinks[0];
                
                // Tiêm tham số chặn quảng cáo TVC đầu trận của Xoilac
                if (m3u8Url.indexOf('off-tvc') === -1) m3u8Url += "/off-tvc";
                m3u8Url += (m3u8Url.indexOf("?") === -1 ? "?" : "&") + "is_off_add=true";

                var epName = channelNames[i] ? "🎙️ " + channelNames[i] : "📺 Kênh " + (i + 1);
                
                // Nhúng Header Referer và User-Agent để chống 403 Forbidden
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

        // 4. Kế hoạch dự phòng: Nếu không bắt được script, đọc link từ thẻ HTML bật qua Sniffer Webview
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
    
    // Nếu URL đã là m3u8 (trích từ Json ở bước trước) thì bỏ qua iframe, phát bằng Native ExoPlayer
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

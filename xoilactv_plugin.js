// =============================================================================
// PLUGIN VAX: XOILAC TV (GIAO DIỆN CHUẨN + TỐI ƯU WEBVIEW PLAYER)
// =============================================================================

var DOMAIN = "xoilaczzssz.tv";
var BASEURL = "https://" + DOMAIN;
var DEFAULT_POSTER = BASEURL + "/wp-content/themes/bongda/dist/images/logo-xlz.png";

function getManifest() {
    return JSON.stringify({
        "id": "XoilacTV_Webview",
        "name": "XoilacZ TV",
        "description": "Giao diện Live Now. Trình phát Webview đã ép Video ra giữa màn hình.",
        "version": "3.1.0",
        "baseUrl": BASEURL,
        "iconUrl": DEFAULT_POSTER,
        "isEnabled": true,
        "layoutType": "LIST",
        "type": "MOVIE",
        "playerType": "embed" // Ép sử dụng Webview
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
// MENU & TRANG CHỦ
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: 'live-now', title: '🔥 LIVE NOW (Tất Cả)', type: 'Grid' },
        { slug: 'football', title: '⚽ BÓNG ĐÁ', type: 'Horizontal' },
        { slug: 'basketball', title: '🏀 BÓNG RỔ', type: 'Horizontal' },
        { slug: 'tennis', title: '🎾 TENNIS', type: 'Horizontal' },
        { slug: 'badminton', title: '🏸 CẦU LÔNG', type: 'Horizontal' },
        { slug: 'volleyball', title: '🏐 BÓNG CHUYỀN', type: 'Horizontal' },
        { slug: 'esports', title: '🎮 ESPORTS', type: 'Horizontal' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: '🔥 Live Now', slug: 'live-now' },
        { name: '⚽ Bóng Đá', slug: 'football' },
        { name: '🏀 Bóng Rổ', slug: 'basketball' },
        { name: '🎾 Tennis', slug: 'tennis' },
        { name: '🏸 Cầu Lông', slug: 'badminton' },
        { name: '🏐 Bóng Chuyền', slug: 'volleyball' },
        { name: '🎮 E-Sports', slug: 'esports' }
    ]);
}

function getFilterConfig() { return JSON.stringify({}); }

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) { 
    var sportSlug = slug || "live-now";
    return BASEURL + "/|data:" + sportSlug; 
}

function getUrlSearch(keyword, filtersJson) { return ""; } // Tắt tìm kiếm
function getUrlDetail(slug) { return slug; }
function getUrlCategories() { return BASEURL + "/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSE DANH SÁCH (Fix lỗi lọc môn E-sports)
// =============================================================================

function parseListResponse(html, url) {
    try {
        var items = [];
        
        var currentFilter = "live-now";
        if (url && url.indexOf("|data:") !== -1) {
            currentFilter = url.split("|data:")[1].trim();
        }

        // Quét toàn bộ khối chứa trận đấu
        var blockRegex = /<div([^>]*grid-matches__item-match[^>]*)>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
        var match;

        while ((match = blockRegex.exec(html)) !== null) {
            var attrBlock = match[1];
            var innerHtml = match[2];

            // 1. Phân Loại Thể Thao
            var sportMatch = attrBlock.match(/data-sport=["']([^"']+)["']/i);
            var sportType = sportMatch ? sportMatch[1].toLowerCase() : "football";
            
            var keep = false;
            if (currentFilter === 'live-now') {
                keep = true;
            } else if (currentFilter === 'esports') {
                // Đã sửa: Thêm dota2, csgo, lol vào nhóm esports
                if (['esports', 'lol', 'csgo', 'dota2'].indexOf(sportType) !== -1) keep = true;
            } else {
                if (sportType === currentFilter) keep = true;
            }

            if (!keep) continue;

            // 2. Trích Xuất URL và Title
            var aTagMatch = innerHtml.match(/<a[^>]*href=["']([^"']+)["'][^>]*title=["']([^"']+)["'][^>]*class=["'][^"']*redirectPopup[^"']*["']/i);
            if (!aTagMatch) continue;

            var href = aTagMatch[1];
            if (href.indexOf('http') === -1) href = BASEURL + href;
            
            var fullTitle = decodeEntities(aTagMatch[2]);
            var cleanTitle = fullTitle.replace(/lúc.*/i, '').trim(); 

            if (cleanTitle.toLowerCase().indexOf('xoilac') !== -1 || cleanTitle.indexOf('IP') !== -1) continue;

            // 3. Poster Logo
            var poster = DEFAULT_POSTER;
            var posterMatch = innerHtml.match(/<img[^>]*src=["']([^"']+)["']/i);
            if (posterMatch && posterMatch[1].indexOf('http') !== -1) {
                poster = posterMatch[1];
            }

            // 4. Trạng Thái Trận (Lọc chuẩn cho LIVE NOW)
            // Lấy từ data-status của thẻ cha: 1 là chưa đá, các số khác là đang đá hoặc kết thúc
            var statusMatch = attrBlock.match(/data-status=["'](\d+)["']/i);
            var statusCode = statusMatch ? statusMatch[1] : "0";
            var isLive = (statusCode !== "1" && statusCode !== "0"); 
            
            if (currentFilter === 'live-now' && !isLive) {
                continue; 
            }

            var timeStatus = "";
            var timeMatch = innerHtml.match(/<text[^>]*class=["'][^"']*t_time[^"']*["'][^>]*>([^<]+)/i);
            if (timeMatch && timeMatch[1]) timeStatus = timeMatch[1].trim(); 

            items.push({
                id: href,
                title: cleanTitle,
                posterUrl: poster,
                backdropUrl: poster,
                episode_current: timeStatus || (isLive ? "ĐANG LIVE" : "SẮP CHIẾU"),
                quality: isLive ? "🔴 LIVE" : "HD"
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
// CHI TIẾT
// =============================================================================

function parseMovieDetail(html, url) {
    try {
        var doc = _$(html);
        var titleMatch = html.match(/<h1[^>]*>Phát trực tiếp ([^<]+)<\/h1>/i) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        var title = titleMatch ? decodeEntities(titleMatch[1].replace(/hôm nay vào lúc.*/i, '').trim()) : "Trực Tiếp Thể Thao";

        var servers = [{
            name: "Xoilac TV",
            episodes: [{
                id: url,
                name: "🔴 PHÁT TRỰC TIẾP",
                slug: "live-webview"
            }]
        }];

        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: DEFAULT_POSTER,
            backdropUrl: DEFAULT_POSTER,
            description: "Xem trực tiếp thể thao với chế độ Webview. Tự động loại bỏ quảng cáo và tối ưu hóa màn hình.",
            servers: servers
        });
    } catch (e) {
        return JSON.stringify({ id: url, title: "Lỗi tải luồng", servers: [] });
    }
}

// =============================================================================
// WEBVIEW: DỌN RÁC & CĂN CHỈNH VIDEO RA GIỮA MÀN HÌNH
// =============================================================================

function parseDetailResponse(html, url) {
    // 1. Mã CSS cực mạnh để ẨN tất cả rác, và KÉO Player lên kịch trần
    var customCss = `
        header, #header, nav, .nav-mobile, .sub-menu, 
        .match-single-top, .teambox, .team-vote, .teambox__odds, 
        .marquee-container, .xlz-ads-item, #footer, .bottom-content, 
        .home-sidebar, .page-breadcrumb, .title_box, #div_footer1, 
        .socialvn-share, .block-k, #catfish, .mp-adz { 
            display: none !important; opacity: 0 !important; height: 0 !important; pointer-events: none !important;
        }
        body, html { background: #111 !important; margin: 0 !important; padding: 0 !important; }
        .section-player { margin-top: 0 !important; padding: 0 !important; }
        .play_main_left { width: 100% !important; max-width: 100% !important; flex: 0 0 100% !important; padding: 0 !important; }
        .embed-responsive { margin-top: 0 !important; border-radius: 0 !important; }
    `;

    // 2. Chèn CSS, tự động Click Play và cuộn (scroll) trang đến đúng khung Video
    var customJs = `
        (function() {
            var css = "${customCss.replace(/\n/g, '')}";
            var style = document.createElement('style');
            style.innerHTML = css;
            document.head.appendChild(style);
            
            setInterval(function() {
                var playBtn = document.querySelector('.jw-icon-display, .vjs-big-play-button, .play-btn, #resumeBtn');
                if(playBtn) playBtn.click();
            }, 2000);
            
            setTimeout(function() {
                var player = document.getElementById('play_main') || document.querySelector('.embed-responsive');
                if(player) player.scrollIntoView({behavior: "smooth", block: "start"});
            }, 1000);
        })();
    `;

    return JSON.stringify({
        url: url,
        isEmbed: true, 
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASEURL + "/",
            "Block-Ads": "true", // Chặn quảng cáo tích hợp
            "Block-Redirects": "true", // Ngăn nhảy trang rác
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

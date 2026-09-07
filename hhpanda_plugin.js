// =============================================================================
// VAAPP Plugin: HHPanda (Fix Ad-Loop & Network Sniffer)
// Author: Gemini
// =============================================================================

var BASEURL = "https://hhpanda.st";

function getManifest() {
    return JSON.stringify({
        "id": "hhpanda",
        "name": "HH Panda 4K",
        "version": "1.1.0",
        "baseUrl": BASEURL,
        "iconUrl": BASEURL + "/wp-content/uploads/2024/10/apple-touch-icon.png",
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
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl);
        return JSON.stringify(menulist);
    } catch (e) {
        return JSON.stringify([]);
    }
}

function getFilterConfig() {
    try {
        var listurl = getLISTmenu();
        var menulist = buildMenu(listurl, "filter");
        return JSON.stringify({ category: menulist });
    } catch (e) {
        return JSON.stringify({ category: [] });
    }
}

function getLISTmenu() {
    return `[
        {"link":"/the-loai/tu-tien","name":"Tu Tiên"},
        {"link":"/the-loai/kiem-hiep","name":"Kiếm Hiệp"},
        {"link":"/the-loai/co-trang","name":"Cổ Trang"},
        {"link":"/the-loai/huyen-huyen","name":"Huyền Huyễn"},
        {"link":"/the-loai/khoa-huyen","name":"Khoa Huyễn"},
        {"link":"/the-loai/ky-ao","name":"Kỳ Ảo"},
        {"link":"/the-loai/huyen-nghi","name":"Huyền Nghi"},
        {"link":"/the-loai/canh-ky","name":"Cạnh Kỹ"},
        {"link":"/the-loai/da-su","name":"Dã Sử"},
        {"link":"/the-loai/do-thi","name":"Đô Thị"},
        {"link":"/the-loai/dong-nhan","name":"Đồng Nhân"}
    ]`;
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
        } else if (typeStr === "filter") {
            menuItem = { "value": link, "name": name }; 
        } else { 
            menuItem = { "slug": link, "name": name }; 
        } 
        menulist.push(menuItem); 
    } 
    return menulist; 
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }

        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (e) {}
        }

        var resultUrl = BASEURL + (path.indexOf("/") === 0 ? "" : "/") + path;
        if (page > 1) {
            resultUrl += "/page/" + page;
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        return BASEURL;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            try {
                var filters = JSON.parse(filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':'));
                page = parseInt(filters.page) || 1;
            } catch (e) {}
        }
        var url = BASEURL + (page > 1 ? "/page/" + page : "") + "?s=" + encodeURIComponent(keyword);
        return url;
    } catch (e) {
        return BASEURL + "?s=" + encodeURIComponent(keyword);
    }
}

function getUrlDetail(slug) {
    try {
        if (!slug) return "";
        if (slug.indexOf('http') === 0) return slug;
        return BASEURL + "/" + slug;
    } catch (e) {
        return "";
    }
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function fixHref(href) {
    if (!href) return "";
    let cleanHref = href.trim();
    if (/^(#|https?:\/\/|\/\/|mailto:|tel:|javascript:|data:|blob:)/i.test(cleanHref)) {
        return cleanHref;
    }
    if (cleanHref.indexOf('/') === 0) {
        return BASEURL + cleanHref;
    }
    return BASEURL + "/" + cleanHref;
}

function parseListResponse(html, url) {
    try {
        var $doc = _$(html);
        var items = [];
        
        $doc.find(".halim-item").each(function() {
            var a = this.find("a.halim-thumb");
            var href = a.attr("href");
            
            if (href) {
                var title = this.find(".entry-title").text().trim();
                var imgTag = this.find("img");
                var posterUrl = imgTag.attr("data-src") || imgTag.attr("src") || "";
                
                var quality = this.find(".status").text().trim();
                var episode_current = this.find(".episode").text().trim();
                
                items.push({
                    "id": fixHref(href),
                    "title": title || "Đang cập nhật",
                    "posterUrl": fixHref(posterUrl),
                    "backdropUrl": fixHref(posterUrl),
                    "quality": quality,
                    "episode_current": episode_current
                });
            }
        });
        
        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": 1, "totalPages": 99 }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseMovieDetail(html, url) {
    try {
        var $doc = _$(html);
        var id = url;
        var title = $doc.find(".movie_name").text().trim() || $doc.find("h1").text().trim();
        var originName = $doc.find(".org_title").text().trim();
        
        var imgTag = $doc.find(".first img");
        var posterUrl = imgTag.attr("src") || imgTag.attr("data-src") || "";
        if (!posterUrl) posterUrl = $doc.find('meta[property="og:image"]').attr("content") || "";
        posterUrl = fixHref(posterUrl);
        
        var description = $doc.find(".entry-content article p").text().trim() || $doc.find(".entry-content p").text().trim();
        var episode_current = $doc.find(".hh3d-new-ep .new-ep").text().trim();
        var category = $doc.find(".list_cate a").textAll(", ");
        var rating = $doc.find(".kksr-legend").text().trim() || "4.5/5";
        
        var servers = [];
        
        $doc.find(".halim-server").each(function() {
            var serverName = this.find(".halim-server-name").text().replace(/#|:|\n/g, "").trim();
            if(!serverName) serverName = "Server";
            var episodes = [];
            
            this.find(".halim-list-eps li a").each(function() {
                var name = this.attr("title") || this.text().trim();
                var href = this.attr("href");
                var ep = this.attr("data-ep") || name.replace(/\s+/g, "-");
                var sv = this.attr("data-sv") || "1";
                
                if (href) {
                    episodes.push({
                        id: fixHref(href),
                        name: name,
                        slug: ep + "-sv" + sv
                    });
                }
            });
            
            if(episodes.length > 0) {
                // Sắp xếp tập theo thứ tự từ nhỏ đến lớn
                episodes.sort(function(a, b) {
                    var numA = parseInt((a.name.match(/\d+/) || [0])[0]);
                    var numB = parseInt((b.name.match(/\d+/) || [0])[0]);
                    return numA - numB;
                });

                servers.push({
                    name: serverName,
                    episodes: episodes
                });
            }
        });

        return JSON.stringify({
            id: id,
            title: title,
            originName: originName,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            quality: "HD",
            rating: rating,
            category: category,
            episode_current: episode_current,
            servers: servers
        });
    } catch(e) {
        return JSON.stringify({ id: url, title: "Lỗi dữ liệu", servers: [] });
    }
}

function parseDetailResponse(html, url) {
    try {
        // =========================================================================
        // SCRIPT SNIFFER BẮT MẠNG TỰ ĐỘNG - KHÔNG CLICK GÂY RA AD-LOOP
        // =========================================================================
        var customJsCode = `
            (function() {
                if (window._vaapp_sniffer_hhpanda) return;
                window._vaapp_sniffer_hhpanda = true;
                
                var hasSent = false;

                // Hàm gửi link an toàn (Chỉ lọc chuẩn m3u8 / mp4)
                function sendToNativeBridge(playUrl) {
                    if (hasSent || !playUrl || typeof playUrl !== 'string') return;
                    var lowerUrl = playUrl.toLowerCase();
                    
                    if (lowerUrl.indexOf('.m3u8') > -1 || (lowerUrl.indexOf('.mp4') > -1 && lowerUrl.indexOf('blob:') === -1)) {
                        hasSent = true;
                        var headers = JSON.stringify({
                            "Referer": window.location.href,
                            "User-Agent": navigator.userAgent
                        });
                        if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
                            window.SnifferBridge.log("✅ Sniffed Network URL: " + playUrl);
                            window.SnifferBridge.play(playUrl, headers);
                        }
                    }
                }

                // 1. Hook Fetch
                var rawFetch = window.fetch;
                window.fetch = async function (...args) {
                    var reqUrl = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                    sendToNativeBridge(reqUrl);
                    return rawFetch.apply(this, args);
                };

                // 2. Hook XHR
                var rawXHROpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function (method, reqUrl) {
                    sendToNativeBridge(reqUrl);
                    return rawXHROpen.apply(this, arguments);
                };

                // 3. Hook DOM (Trong trường hợp server trả m3u8 thẳng vào thẻ video/iframe player ẩn)
                var observer = new MutationObserver(function() {
                    if(hasSent) return;
                    var v = document.querySelector('video');
                    if (v && v.src && v.src.indexOf('blob:') === -1) {
                        sendToNativeBridge(v.src);
                    }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });

                // LƯU Ý QUAN TRỌNG: 
                // Bản thân trang HHPanda có đoạn script 'setTimeout(..., 300)' tự động gọi hàm loadPlayer() để tải luồng mặc định
                // Chúng ta KHÔNG CẦN và KHÔNG NÊN dùng lệnh btn.click() nữa, tránh việc web trigger lại các popunder rác gây vòng lặp tải trang.
            })();
        `;

        return JSON.stringify({
            "url": url,
            "isEmbed": true,
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": BASEURL + "/",
                "Block-Ads": "true",  // Bật chặn popup của hệ thống
                "Block-Css": "iframe[src*='ad'], div[class*='ad'], div[style*='z-index']", // Ẩn overlay
                "Custom-Js": customJsCode.replace(/\n/g, " ").trim()
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
}

function parseEmbedResponse() { return "{}"; }
function parseCategoriesResponse() { return "[]"; }
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }

// =============================================================================
// Helper MiniJQ
// =============================================================================
function _$(htmlOrBlock){if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) {return htmlOrBlock;} var instance = {sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),find: function (selector) {if (selector.indexOf(',') !== -1) {var results = [];var selectors = selector.split(',').map(function (s) {return s.trim();});for (var s = 0;s < selectors.length;s++) {if (selectors[s] === "") continue;var subInstance = this.find(selectors[s]);for (var r = 0;r < subInstance.elements.length;r++) {var element = subInstance.elements[r];if (results.indexOf(element) === -1) {results.push(element);}}} var multiInstance = _$(results);multiInstance.sourceHtml = this.sourceHtml;return multiInstance;} var results = [];var contentFilter = "";if (selector.indexOf(":content(") !== -1) {var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch) {contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || "";selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}} var attrNameFilter = "";var attrValueFilter = "";var attrOperator = "=";var hasAttrFilter = false;var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if (attrMatch) {hasAttrFilter = true;attrNameFilter = attrMatch[1];attrOperator = attrMatch[2];attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || "";selector = selector.replace(/\[.*?\]/,"");} var notSelector = "";if (selector.indexOf(":not(") !== -1) {var notMatch = selector.match(/:not\(([^)]+)\)/);if (notMatch) {notSelector = notMatch[1];selector = selector.replace(/:not\([^)]+\)/,"");}} var isFirstFilter = selector.indexOf(":first") !== -1;var isLastFilter = selector.indexOf(":last") !== -1;selector = selector.replace(/:first|:last/g,"");var targetTagName = "";var targetId = "";var targetClasses = [];var selectorToParse = selector.trim();if (selectorToParse !== "") {var idIndex = selectorToParse.indexOf('#');if (idIndex !== -1) {var afterId = selectorToParse.substring(idIndex + 1);var nextDot = afterId.indexOf('.');targetId = nextDot === -1 ? afterId : afterId.substring(0,nextDot);selectorToParse = selectorToParse.substring(0,idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1));} var classParts = selectorToParse.split('.');var possibleTag = classParts.shift();if (possibleTag) {targetTagName = possibleTag.toLowerCase();} targetClasses = classParts.filter(function (c) {return c.length > 0;});} for (var i = 0;i < this.elements.length;i++) {var currentHtml = this.elements[i];var pos = 0;var subResults = [];while ((pos = currentHtml.indexOf('<',pos)) !== -1) {if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') {pos++;continue;} var endOpenTag = -1;var insideQuote = false;var quoteChar = '';for (var j = pos + 1;j < currentHtml.length;j++) {var char = currentHtml.charAt(j);if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') {if (!insideQuote) {insideQuote = true;quoteChar = char;} else if (char === quoteChar) {insideQuote = false;}} if (char === '>' && !insideQuote) {endOpenTag = j;break;}} if (endOpenTag === -1) break;var fullOpenTag = currentHtml.substring(pos,endOpenTag + 1);var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/);var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : "";var isMatched = true;if (targetTagName && targetTagName !== currentTagName) {isMatched = false;} var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : "";var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : "";if (isMatched && targetId && idMatchStr !== targetId) {isMatched = false;} if (isMatched && targetClasses.length > 0) {if (classMatchStr) {var currentClasses = classMatchStr.trim().split(/\s+/);for (var c = 0;c < targetClasses.length;c++) {if (currentClasses.indexOf(targetClasses[c]) === -1) {isMatched = false;break;}}} else {isMatched = false;}} if (isMatched && hasAttrFilter) {var actualValue = "";if (attrNameFilter === "class") {actualValue = classMatchStr;} else if (attrNameFilter === "id") {actualValue = idMatchStr;} else {var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : "";} var attrExists = fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=','i')) !== -1;if (!attrExists) {isMatched = false;} else {if (attrOperator === "=") {if (attrNameFilter === "class") {var classes = actualValue.trim().split(/\s+/);if (classes.indexOf(attrValueFilter) === -1) isMatched = false;} else if (actualValue !== attrValueFilter) {isMatched = false;}} else if (attrOperator === "*=") {if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false;} else if (attrOperator === "^=") {if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false;} else if (attrOperator === "$=") {if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false;}}} if (isMatched) {var startTagPos = pos;var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {var depth = 1;var scanPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && scanPos < currentHtml.length) {var nextOpen = currentHtml.indexOf(openStr,scanPos);var nextClose = currentHtml.indexOf(closeStr,scanPos);if (nextClose === -1) {scanPos = currentHtml.length;break;} if (nextOpen !== -1 && nextOpen < nextClose) {depth++;scanPos = nextOpen + openStr.length;} else {depth--;scanPos = nextClose + closeStr.length;if (depth === 0) endTagPos = nextClose + closeStr.length;}}} var foundBlock = currentHtml.substring(startTagPos,endTagPos);if (contentFilter) {var pureText = foundBlock.replace(/<[^>]+>/g,"").trim();if (pureText.indexOf(contentFilter) === -1) {pos = endTagPos;continue;}} if (notSelector) {var isNotClass = notSelector.indexOf('.') === 0;var isNotId = notSelector.indexOf('#') === 0;var notValue = notSelector.substring(1);var hasNot = false;if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true;if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true;if (!hasNot) subResults.push(foundBlock);} else {subResults.push(foundBlock);} pos = endTagPos;} else {pos++;}} if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]];if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]];results = results.concat(subResults);} var newInstance = _$(results);newInstance.sourceHtml = this.sourceHtml || currentHtml;return newInstance;},each: function (callback) {for (var i = 0;i < this.elements.length;i++) {var childInstance = _$(this.elements[i]);childInstance.sourceHtml = this.sourceHtml;callback.call(childInstance,i,this.elements[i]);} return this;},eq: function (index) {if (index < 0) index = this.elements.length + index;var matchedElement = this.elements[index];this.elements = matchedElement ? [matchedElement] : [];return this;},attr: function (attrName) {if (this.elements.length === 0) return "";var elem = this.elements[0];var getAttr = elem.match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : "";},html: function () {if (this.elements.length === 0) return "";var elem = this.elements[0];var start = elem.indexOf('>') + 1;var end = elem.lastIndexOf('</');if (start > 0 && end > start) return elem.substring(start,end);return "";},text: function (separator) {if (this.elements.length === 0) return "";var elem = this.elements[0];var start = elem.indexOf('>') + 1;var end = elem.lastIndexOf('</');if (start > 0 && end > start) {var content = elem.substring(start,end);var pureText = content.replace(/<\/?[^>]+(>|$)/g,"");if (typeof separator === 'string') {return pureText .split('\n') .map(function (item) {return item.trim();}) .filter(function (item) {return item !== '';}) .join(separator);} return pureText.trim();} return "";},textAll: function (separator) {if (this.elements.length === 0) return "";var sep = typeof separator === 'string' ? separator : " ";var allTexts = [];for (var i = 0;i < this.elements.length;i++) {var elem = this.elements[i];var start = elem.indexOf('>') + 1;var end = elem.lastIndexOf('</');if (start > 0 && end > start) {var content = elem.substring(start,end);var pureText = content.replace(/<\/?[^>]+(>|$)/g,"");var cleanText = pureText .split('\n') .map(function (item) {return item.trim();}) .filter(function (item) {return item !== '';}) .join(' ');if (cleanText !== '') {allTexts.push(cleanText);}}} return allTexts.join(sep);},next: function () {var results = [];if (!this.sourceHtml) return this;for (var i = 0;i < this.elements.length;i++) {var elem = this.elements[i];var idx = this.sourceHtml.indexOf(elem);if (idx === -1) continue;var scanPos = idx + elem.length;var nextOpen = this.sourceHtml.indexOf('<',scanPos);if (nextOpen !== -1) {if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue;var endOpenTag = this.sourceHtml.indexOf('>',nextOpen);if (endOpenTag === -1) continue;var fullOpenTag = this.sourceHtml.substring(nextOpen,endOpenTag + 1);var spacePos = fullOpenTag.indexOf(' ');var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1,fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1,spacePos).toLowerCase();var startTagPos = nextOpen;var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {var depth = 1;var sPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && sPos < this.sourceHtml.length) {var nOpen = this.sourceHtml.indexOf(openStr,sPos);var nClose = this.sourceHtml.indexOf(closeStr,sPos);if (nClose === -1) {scanPos = currentHtml.length;break;} if (nOpen !== -1 && nOpen < nClose) {depth++;sPos = nOpen + openStr.length;} else {depth--;sPos = nClose + closeStr.length;if (depth === 0) endTagPos = nextClose + closeStr.length;}}} results.push(this.sourceHtml.substring(startTagPos,endTagPos));}} var nextInstance = _$(results);nextInstance.sourceHtml = this.sourceHtml;this.elements = results;return this;},parent: function () {var results = [];if (!this.sourceHtml) return this;for (var i = 0;i < this.elements.length;i++) {var elem = this.elements[i];var idx = this.sourceHtml.indexOf(elem);if (idx <= 0) continue;var scanPos = idx - 1;while (scanPos >= 0) {var openTagPos = this.sourceHtml.lastIndexOf('<',scanPos);if (openTagPos === -1) break;if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this.sourceHtml.charAt(openTagPos + 1) !== '!') {var endOpenTag = this.sourceHtml.indexOf('>',openTagPos);if (endOpenTag !== -1 && endOpenTag > openTagPos) {var fullOpenTag = this.sourceHtml.substring(openTagPos,endOpenTag + 1);var spacePos = fullOpenTag.indexOf(' ');var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1,fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1,spacePos).toLowerCase();var endTagPos = endOpenTag + 1;var selfClosingTags = ['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {var depth = 1;var sPos = endOpenTag + 1;var openStr = '<' + currentTagName;var closeStr = '</' + currentTagName + '>';while (depth > 0 && sPos < this.sourceHtml.length) {var nOpen = this.sourceHtml.indexOf(openStr,sPos);var nClose = this.sourceHtml.indexOf(closeStr,sPos);if (nClose === -1) break;if (nOpen !== -1 && nOpen < nClose) {depth++;sPos = nOpen + openStr.length;} else {depth--;sPos = nClose + closeStr.length;if (depth === 0) endTagPos = nClose + closeStr.length;}}} if (endTagPos >= idx + elem.length) {var parentBlock = this.sourceHtml.substring(openTagPos,endTagPos);if (results.indexOf(parentBlock) === -1) results.push(parentBlock);break;}}} scanPos = openTagPos - 1;}} var parentInstance = _$(results);parentInstance.sourceHtml = this.sourceHtml;this.elements = results;return this;},closest: function (selector) {var results = [];if (!this.sourceHtml || this.elements.length === 0) return _$([]);for (var i = 0;i < this.elements.length;i++) {var currentElem = this.elements[i];var currentObj = _$(currentElem);currentObj.sourceHtml = this.sourceHtml;var selfCheck = _$(this.sourceHtml).find(selector);var isSelfMatched = false;for (var s = 0;s < selfCheck.elements.length;s++) {if (selfCheck.elements[s] === currentElem) {isSelfMatched = true;break;}} if (isSelfMatched) {if (results.indexOf(currentElem) === -1) results.push(currentElem);continue;} var parentObj = currentObj.parent();while (parentObj.elements.length > 0) {var parentElem = parentObj.elements[0];var checkMatch = _$(this.sourceHtml).find(selector);var isMatched = false;for (var j = 0;j < checkMatch.elements.length;j++) {if (checkMatch.elements[j] === parentElem) {isMatched = true;break;}} if (isMatched) {if (results.indexOf(parentElem) === -1) results.push(parentElem);break;} parentObj = parentObj.parent();}} var closestInstance = _$(results);closestInstance.sourceHtml = this.sourceHtml;return closestInstance;}};return instance;}

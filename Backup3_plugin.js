// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN (Phiên bản Webview / Sniffer)
// ========================================================

var iddomain = "sieutamphim";
var NEWDOMAIN = true;
var BASE_URL = "https://www.sieutamphim.top";

function getManifest() {
    return JSON.stringify({
        "id": "sieutamphim",
        "name": "Sưu Tầm Phim",
        "version": "4.0",
        "baseUrl": BASE_URL,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/sieutamphim.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "embedtoexoplay" // Sử dụng trình bắt link tự động qua WebView
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[STPhim] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[STPhim] " + msg);
    }
}

if (NEWDOMAIN) {
    if (typeof httpRequest === "function") {
        try {
            var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {
                method: "POST"
            });
            if (res && res.isSuccessful) {
                var resobj = JSON.parse(res.body);
                if (resobj[iddomain] && resobj[iddomain].new) {
                    BASE_URL = String(resobj[iddomain].new).replace(/\/+$/, "");
                }
            }
        } catch (e) { log("domain err: " + e.message); }
    }
}

function stpAbs(u) {
    if (!u) return "";
    u = String(u).trim();
    if (/^https?:/i.test(u)) return u;
    if (u.indexOf("//") === 0) return "https:" + u;
    return BASE_URL + (u.charAt(0) === "/" ? "" : "/") + u;
}

function decodeHtmlEntities(str) {
    if (!str) return "";
    return String(str)
        .replace(/&#8211;/g, "-").replace(/&#8212;/g, "-")
        .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
        .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
        .replace(/&#038;/g, "&").replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ").trim();
}

// ========================================================
// HOME / CATEGORY
// ========================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: "tat-ca-phim", title: "Tất Cả Phim", type: "Grid" },
        { slug: "tu-khoa/phim-bo", title: "Phim Bộ Mới", type: "Horizontal" },
        { slug: "tu-khoa/phim-le", title: "Phim Lẻ Mới", type: "Horizontal" },
        { slug: "tu-khoa/series", title: "Series", type: "Horizontal" },
        { slug: "tu-khoa/movie", title: "Movie", type: "Horizontal" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Tất Cả Phim", slug: "tat-ca-phim" },
        { name: "Phim Bộ", slug: "tu-khoa/phim-bo" },
        { name: "Phim Lẻ", slug: "tu-khoa/phim-le" },
        { name: "Series", slug: "tu-khoa/series" },
        { name: "Movie", slug: "tu-khoa/movie" },
        { name: "Vietsub", slug: "tu-khoa/vietsub" },
        { name: "Lồng Tiếng", slug: "tu-khoa/dubbing" },
        { name: "Thuyết Minh", slug: "tu-khoa/voice-over" },
        { name: "Phim Việt Nam", slug: "tu-khoa/phim-viet-nam" },
        { name: "Phim Hàn Quốc", slug: "tu-khoa/phim-han-quoc" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

function getUrlList(slug, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = parseInt(filters.page, 10) || 1;
    var s = String(slug || "").replace(/^\/+|\/+$/g, "");
    if (!s) s = "tat-ca-phim";
    var url = BASE_URL + "/" + s + "/";
    if (page > 1) url += "page/" + page + "/";
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    return BASE_URL + "/?s=" + encodeURIComponent(keyword || "");
}

function getUrlDetail(id) {
    if (!id) return "";
    var s = String(id);
    if (/^https?:/i.test(s)) return s;
    if (/\/tap-[^\/]+-[a-z0-9]+-server/i.test(s)) return stpAbs(s);
    var slug = s.replace(/^play-/, "").split("?")[0].replace(/^\/+|\/+$/g, "");
    if (!slug) return "";
    return BASE_URL + "/xem-phim/" + slug + "/";
}

// ========================================================
// PARSE LIST
// ========================================================

function parseListResponse(html, url) {
    try {
        var items = [];
        var $doc = _$(html);
        
        $doc.find(".item").each(function () {
            var aTag = this.find("a").first();
            var href = aTag.attr("href");
            if (!href || href.indexOf("/xem-phim/") === -1) return;
            
            var title = decodeHtmlEntities(this.find(".title span").text() || this.find("img").attr("alt") || "Unknown");
            var poster = this.find("img").attr("data-src") || this.find("img").attr("src");
            var quality = this.find(".quality").text() || "HD";
            
            items.push({
                id: stpAbs(href),
                title: title.trim(),
                posterUrl: stpAbs(poster),
                backdropUrl: stpAbs(poster),
                quality: quality
            });
        });

        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 999 }
        });
    } catch (e) {
        log("parseList error: " + e.message);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

// ========================================================
// PARSE DETAIL
// ========================================================

function parseMovieDetail(html, url, datasend) {
    try {
        var page = String(html || "");
        var $doc = _$(html);
        
        var title = decodeHtmlEntities(($doc.find('meta[property="og:title"]').attr("content") || "").replace(/^Xem Phim\s+/i, "").replace(/\s*-\s*Siêu Tầm Phim\s*$/i, "").trim());
        var poster = stpAbs($doc.find('meta[property="og:image"]').attr("content") || datasend || "");
        var description = decodeHtmlEntities($doc.find('meta[property="og:description"]').attr("content") || "");
        
        var servers = [];
        var index = {};
        var order = [];
        
        $doc.find("a").each(function() {
            var href = this.attr("href") || "";
            var match = href.match(/\/xem-phim\/[^"\/]+\/tap-([^"\/]+)-([a-z0-9]+)-server\/?/i);
            
            if (match) {
                var fullUrl = stpAbs(href);
                var name = match[1];
                var srv = match[2];
                
                if (!index[srv]) {
                    index[srv] = { name: srv.toUpperCase(), episodes: [] };
                    order.push(srv);
                }
                
                // Tránh trùng lặp tập trong cùng 1 server
                var exists = index[srv].episodes.find(e => e.id === fullUrl);
                if (!exists) {
                    index[srv].episodes.push({
                        id: fullUrl,
                        name: /^full$/i.test(name) ? "Full" : ("Tập " + name),
                        slug: "tap-" + name
                    });
                }
            }
        });

        for (var i = 0; i < order.length; i++) {
            var eps = index[order[i]].episodes;
            eps.sort(function (a, b) {
                var x = parseFloat(String(a.slug).replace(/^tap-/, ""));
                var y = parseFloat(String(b.slug).replace(/^tap-/, ""));
                if (isNaN(x)) x = -1;
                if (isNaN(y)) y = -1;
                return x - y;
            });
            servers.push(index[order[i]]);
        }
        
        // Nếu không có server nào, thử nạp luồng phát trực tiếp
        if (servers.length === 0) {
            servers.push({
                name: "Server Mặc Định",
                episodes: [{ id: url, name: "Xem Ngay", slug: "tap-full" }]
            });
        }

        return JSON.stringify({
            id: url,
            title: title || "Unknown",
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: servers,
            quality: "HD",
            status: "Hoàn tất"
        });
    } catch (e) {
        log("parseMovieDetail error: " + e.message);
        return JSON.stringify({ servers: [] });
    }
}

// ========================================================
// PARSE STREAM (Sử dụng WebView Sniffer để tự động bắt link)
// ========================================================

function customJS() {
    return `
    (function () {
        'use strict';
        const IS_TOP = (window.top === window.self);
        const CONTEXT_TAG = IS_TOP ? "[TOP-WINDOW]" : "[IFRAME-WINDOW]";
        let hasSentToBridge = false;

        const rawFetch = window.fetch;
        const rawXHROpen = XMLHttpRequest.prototype.open;

        function isDirectStreamUrl(url) {
            if (!url || typeof url !== 'string') return false;
            if (url.startsWith('blob:') || url.startsWith('data:')) return false;
            const cleanUrl = url.split('?')[0].toLowerCase();
            return cleanUrl.endsWith('.m3u8') || cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mpd') || url.includes('.m3u8?') || url.includes('.mp4?');
        }

        function sendToNativeBridge(playUrl) {
            if (hasSentToBridge) return;
            if (!IS_TOP) {
                try { window.top.postMessage({ type: 'TS_STREAM_FOUND', playUrl: playUrl }, '*'); } catch(e) {}
                hasSentToBridge = true;
                return;
            }
            hasSentToBridge = true;
            if (window.SnifferBridge && typeof window.SnifferBridge.play === 'function') {
                try {
                    window.SnifferBridge.play(playUrl, JSON.stringify({"Referer": window.location.href}));
                    window.SnifferBridge.toast("Đã bắt được link phim!");
                } catch (err) {}
            }
        }

        function processDetectedUrl(url) {
            if (!url || hasSentToBridge) return;
            try { url = new URL(url, window.location.href).href; } catch(e) {}
            if (isDirectStreamUrl(url)) {
                sendToNativeBridge(url);
            }
        }

        if (IS_TOP) {
            window.addEventListener('message', function (event) {
                if (event.data && event.data.type === 'TS_STREAM_FOUND') {
                    sendToNativeBridge(event.data.playUrl);
                }
            });
        }

        window.fetch = async function (...args) {
            const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
            processDetectedUrl(url);
            return rawFetch.apply(this, args);
        };

        XMLHttpRequest.prototype.open = function (method, url) {
            processDetectedUrl(url);
            return rawXHROpen.apply(this, arguments);
        };

        function scanDOM() {
            if (hasSentToBridge) return;
            document.querySelectorAll('video, source').forEach(el => {
                const src = el.src || el.getAttribute('src');
                if (src) processDetectedUrl(src);
            });
        }

        const domObserver = new MutationObserver(() => scanDOM());
        domObserver.observe(document.documentElement, { childList: true, subtree: true });
        setInterval(scanDOM, 1000);
    })();
    `;
}

function parseDetailResponse(html, url) {
    log("parseDetailResponse: " + url);
    try {
        // App sẽ mở URL này trong WebView ẩn, chèn Custom-Js và chờ SnifferBridge.play() được gọi
        return JSON.stringify({
            url: url,
            isEmbed: true, 
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": BASE_URL + "/",
                "Origin": BASE_URL,
                "Block-Ads": "true", // Chặn quảng cáo nền mặc định
                "Custom-Js": customJS() // Inject mã bắt link video
            }
        });
    } catch (e) {
        log("parseDetailResponse error: " + e.message);
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

function parseEmbedResponse(html, url, datasend) {
    // Với embedtoexoplay và cơ chế bắt link tự động bằng JS, hàm này có thể được đơn giản hóa
    // hoặc giữ như fallback
    return parseDetailResponse(html, url);
}

function parseCategoriesResponse(raw) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// THƯ VIỆN DOM _$(html) MINI-JQ TÍCH HỢP SẴN
// =============================================================================
function _$(param) {
    function parseHTML(htmlString) {
        let nodes = [];
        let root = { id: 0, tag: "ROOT", attrs: {}, childrenIds: [], parentId: null };
        nodes.push(root);
        try {
            let html = (htmlString || "").trim();
            if (!html) return { root, nodes };
            const VOID_TAGS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
            let stack = [0];
            let tagRegex = /<(?:\/([a-zA-Z0-9_-]+)|([a-zA-Z0-9_-]+)([^>]*?)(\/)?)\s*>/g;
            let lastIndex = 0, match, maxIter = 50000, iter = 0;
            while ((match = tagRegex.exec(html)) !== null && iter++ < maxIter) {
                let textBefore = html.slice(lastIndex, match.index).trim();
                let parentId = stack[stack.length - 1];
                if (textBefore) {
                    let textId = nodes.length;
                    nodes.push({ id: textId, tag: "#text", text: textBefore, attrs: {}, childrenIds: [], parentId: parentId });
                    nodes[parentId].childrenIds.push(textId);
                }
                lastIndex = tagRegex.lastIndex;
                let isCloseTag = !!match[1], tagName = (match[1] || match[2] || "").toLowerCase(), attrStr = match[3] || "", isSelfClosing = !!match[4] || VOID_TAGS.has(tagName);
                if (isCloseTag) {
                    for (let i = stack.length - 1; i > 0; i--) {
                        if (nodes[stack[i]].tag === tagName) { stack.splice(i); break; }
                    }
                } else {
                    let attrs = {}, attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g, attrMatch;
                    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
                        attrs[attrMatch[1].toLowerCase()] = attrMatch[2] || attrMatch[3] || attrMatch[4] || "";
                    }
                    let nodeId = nodes.length, node = { id: nodeId, tag: tagName, attrs: attrs, childrenIds: [], parentId: parentId };
                    nodes.push(node);
                    nodes[parentId].childrenIds.push(nodeId);
                    if (!isSelfClosing) stack.push(nodeId);
                }
            }
        } catch (err) {}
        return { root, nodes };
    }

    function getNodeText(node, nodes, depth) {
        if (!node || (depth || 0) > 20) return "";
        if (node.tag === "#text") return node.text || "";
        let text = "";
        if (node.childrenIds) {
            for (let cid of node.childrenIds) text += getNodeText(nodes[cid], nodes, (depth || 0) + 1) + " ";
        }
        return text.trim();
    }

    function matchSingleSelector(node, sel, nodes) {
        if (!node || node.tag === "#text" || node.tag === "ROOT") return false;
        let cleanSel = sel.replace(/:first|:last|:eq\([0-9]+\)/gi, "").trim();
        let pseudoContentArg = null, contentMatch = cleanSel.match(/:content\((['"]?)(.*?)\1\)/i);
        if (contentMatch) { pseudoContentArg = contentMatch[2]; cleanSel = cleanSel.replace(contentMatch[0], "").trim(); }
        if (cleanSel && cleanSel !== "*") {
            let tagMatch = cleanSel.match(/^[a-zA-Z0-9_-]+/);
            if (tagMatch && node.tag !== tagMatch[0].toLowerCase()) return false;
            let idMatch = cleanSel.match(/#([a-zA-Z0-9_-]+)/);
            if (idMatch && (!node.attrs || node.attrs.id !== idMatch[1])) return false;
            let classMatches = cleanSel.match(/\.([a-zA-Z0-9_\-\/\\:]+)/g);
            if (classMatches) {
                if (!node.attrs || !node.attrs.class) return false;
                let elClasses = node.attrs.class.split(/\s+/);
                for (let c of classMatches) if (!elClasses.includes(c.substring(1))) return false;
            }
            let attrMatch = cleanSel.match(/\[([a-zA-Z0-9_-]+)(?:=['"]?(.*?)['"]?)?\]/);
            if (attrMatch) {
                let attrName = attrMatch[1].toLowerCase(), attrVal = attrMatch[2];
                if (!node.attrs || !(attrName in node.attrs)) return false;
                if (attrVal !== undefined && node.attrs[attrName] !== attrVal) return false;
            }
        }
        if (pseudoContentArg !== null) {
            let fullText = getNodeText(node, nodes, 0), keywords = pseudoContentArg.split("|").map(k => k.trim().toLowerCase());
            if (!keywords.some(kw => fullText.toLowerCase().includes(kw))) return false;
        }
        return true;
    }

    function querySelectorAllSingleLevel(startNode, selector, nodes) {
        let results = [];
        function search(currentId, depth) {
            if (depth > 50) return;
            let current = nodes[currentId];
            if (!current) return;
            if (current.tag !== "ROOT" && current.tag !== "#text" && current.id !== startNode.id) {
                if (matchSingleSelector(current, selector, nodes)) results.push(current);
            }
            if (current.childrenIds) for (let cid of current.childrenIds) search(cid, depth + 1);
        }
        search(startNode.id, 0);
        if (selector.indexOf(":first") !== -1) return results.slice(0, 1);
        if (selector.indexOf(":last") !== -1) return results.slice(-1);
        let eqMatch = selector.match(/:eq\(([0-9]+)\)/i);
        if (eqMatch) return results[parseInt(eqMatch[1], 10)] ? [results[parseInt(eqMatch[1], 10)]] : [];
        return results;
    }

    function querySelectorAll(startNode, selector, nodes) {
        try {
            if (!startNode || !selector) return [];
            let spaceParts = selector.trim().split(/\s+/);
            if (spaceParts.length > 1) {
                let currentNodes = [startNode];
                for (let part of spaceParts) {
                    let nextLevelNodes = [], addedIds = new Set();
                    for (let cNode of currentNodes) {
                        let subResults = querySelectorAllSingleLevel(cNode, part, nodes);
                        for (let r of subResults) {
                            if (!addedIds.has(r.id)) { addedIds.add(r.id); nextLevelNodes.push(r); }
                        }
                    }
                    currentNodes = nextLevelNodes;
                    if (currentNodes.length === 0) break;
                }
                return currentNodes;
            }
            return querySelectorAllSingleLevel(startNode, selector, nodes);
        } catch (err) { return []; }
    }

    function MiniJQ(elements, nodesStore) {
        this.elements = Array.isArray(elements) ? elements : (elements ? [elements] : []);
        this.nodes = nodesStore || [];
        this.length = this.elements.length;
    }

    MiniJQ.prototype = {
        find: function(selector) {
            let matched = [], addedIds = new Set();
            for (let el of this.elements) {
                for (let r of querySelectorAll(el, selector, this.nodes)) {
                    if (!addedIds.has(r.id)) { addedIds.add(r.id); matched.push(r); }
                }
            }
            return new MiniJQ(matched, this.nodes);
        },
        text: function() { return this.elements.length === 0 ? "" : getNodeText(this.elements[0], this.nodes, 0); },
        attr: function(name) { return (this.elements.length === 0 || !this.elements[0].attrs) ? "" : (this.elements[0].attrs[name] || ""); },
        first: function() { return new MiniJQ(this.elements.length > 0 ? [this.elements[0]] : [], this.nodes); },
        each: function(callback) {
            this.elements.forEach((el, index) => { let jqEl = new MiniJQ([el], this.nodes); callback.call(jqEl, index, jqEl); });
            return this;
        }
    };

    try {
        if (!param) return new MiniJQ([], []);
        if (param instanceof MiniJQ) return param;
        if (typeof param === "string") {
            let parsed = parseHTML(param);
            return new MiniJQ(parsed.root, parsed.nodes);
        }
        return new MiniJQ(param, []);
    } catch (err) { return new MiniJQ([], []); }
}

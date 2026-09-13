var BASEURL = "https://vsmov.com";
var BASEAPI = "https://vsmov.com/api";
var DEV = true;

function getManifest() {
  return JSON.stringify({
    id: "Vsmov",
    name: "Nguồn Vsmov",
    description: "Nguồn phim Vsmov...",
    "version": "1.2.4",
    info: "",
    baseUrl: "https://vsmov.com",
    iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/vsmov.png",
    isEnabled: true,
    "adblock": false,
    type: "MOVIE",
    "author": "Alokillgtv",
    playerType: "exoplayer"
  });
}

function log(msg) {
    if (DEV && typeof console !== 'undefined') console.log(msg);
}

function getHomeSections() {
    return JSON.stringify([
        {"slug": "/danh-sach/long-tieng","title": "Phim Lồng Tiếng","type": "Horizontal"},
        {"slug": "/danh-sach/phim-le","title": "Phim Lẻ","type": "Horizontal"},
        {"slug": "/danh-sach/phim-bo","title": "Phim Bộ","type": "Horizontal"},
        {"slug": "/danh-sach/thuyet-minh","title": "Thuyết Minh","type": "Horizontal"},
        {"slug": "/danh-sach/phim-moi-cap-nhat/","title": "Phim Mới","type": "Grid"}
    ]);
}

function getPrimaryCategories() {
    try {
        var listurl = getLISTmenu();
        return JSON.stringify(buildMenu(listurl));
    } catch (e) {
        return JSON.stringify([]);
    }
}

function getFilterConfig() {
    try {
        var listurl = getLISTmenu();
        return JSON.stringify({ category: buildMenu(listurl) });
    } catch (e) {
        return JSON.stringify({ category: [] });
    }
}

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) return slug;

        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson2 = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
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
            } catch (jsonErr) {}
        }

        var resultUrl = (path.indexOf("/danh-sach/") > -1) ? BASEURL : BASEAPI;
        if (path) resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        if (page > 0 && resultUrl.indexOf("page=") === -1) resultUrl += "?page=" + page;

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        var fallback = BASEAPI + (slug ? (slug.indexOf("/") === 0 ? slug : "/" + slug) : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        var resultUrl = BASEAPI + "/tim-kiem?keyword=" + encodeURIComponent(keyword || "");
        if (page > 1) resultUrl += "&page=" + page;

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        var fallback = BASEAPI + "/tim-kiem?keyword=" + encodeURIComponent(keyword || "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
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

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, $url) {
    try {
        if ($url.indexOf("/api") > -1) {
            return parseAPI(html, $url);
        } else {
            return parseRAW(html, $url);
        }
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseAPI(html, $url) {
    var $data = JSON.parse(html);
    var items = [];
    for (var $j = 0; $j < $data.items.length; $j++) {
        var item = $data.items[$j];
        items.push({
            "id": BASEAPI + "/phim/" + item.slug,
            "title": item.name,
            "posterUrl": item.poster_url || "",
            "backdropUrl": item.thumb_url || "",
            "year": item.year || 2026
        });
    }
    return JSON.stringify({ "items": items, "pagination": { "currentPage": 1, "totalPages": 9999 } });
}

function parseRAW(html, $url) {
    var $html = _$(html);
    var items = [];
    $html.find("tbody tr[class*='group/tr']").each(function(){
        var slug = this.find("a").attr("href").replace(BASEURL, BASEAPI);
        var name = this.find("h4").text();
        var poster = this.find("img").attr("data-original");
        var yearText = this.find("img.object-cover").closest("td").next().text();
        var year = Number(yearText.trim()) || 2026;
        
        items.push({
            "id": slug,
            "title": name,
            "posterUrl": poster || "",
            "backdropUrl": poster || "",
            "year": year
        });
    });
    return JSON.stringify({ "items": items, "pagination": { "currentPage": 1, "totalPages": 9999 } });
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseMovieDetail(html, url) {
    try {
        var $movie = JSON.parse(html);
        var $data = $movie.movie;
        
        var categoryArray = [];
        $data.category.forEach(function (item) {
          if (item.name && item.slug) categoryArray.push("[" + item.name + "](/the-loai/" + item.slug + "/)");
        });
        
        var countryArray = [];
        $data.country.forEach(function (item) {
          if (item.name && item.slug) countryArray.push("[" + item.name + "](/quoc-gia/" + item.slug + ")");
        });

        var servers = [];
        $movie.episodes.forEach(function(serverItem) {
          var episodes = [];
          serverItem.server_data.forEach(function(episode) {
            episodes.push({
              id: episode.link_embed, 
              name: "Tập " + episode.name,
              slug: episode.slug
            });
          });
        
          var cleanServerName = serverItem.server_name.replace(/\r?\n|\r/g, "").trim().replace(/\s+/g," ");
          servers.push({ name: cleanServerName, episodes: episodes });
        });
        
        servers.sort(function(a, b) {
            var aTm = a.name.toLowerCase().includes("thuyết minh");
            var bTm = b.name.toLowerCase().includes("thuyết minh");
            if (aTm && !bTm) return -1;
            if (!aTm && bTm) return 1;
            return 0;
        });
        
        return JSON.stringify({
            id: url,
            title: $data.name,
            posterUrl: $data.thumb_url,
            backdropUrl: $data.thumb_url,
            description: $data.content,
            quality: $data.quality,
            year: $data.year,
            rating: 8.5,
            status: $data.status.replace("completed","Hoàn Thành"),
            category: categoryArray.join(", "),
            episode_current: $data.episode_current,
            servers: servers,
            duration: $data.time || "",
            casts: ($data.actor || []).join(" - "),
            director: ($data.director || []).join(" - "),
            lang: $data.lang,
            country: countryArray.join(", ")
        });
    } catch (e) {
        return JSON.stringify({ id: url || "error", title: "error", servers: [] });
    }
}

function parseDetailResponse(html, url) {
    try {
        var m3u8 = url.replace("/video/", "/stream/") + "/master.m3u8";
        var domain = url.replace(/^(https?:\/\/[^\/]+).*/, "$1");
        var $doc = _$(html);
        var script = $doc.find("script:content('subtitles')").html() || "";
        
        var subitem = [];
        var subStr = "";

        // 1. Tìm chuỗi JSON phụ đề nguyên bản
        var matchObj = script.match(/subtitles:\s*(\[\s*\{.*?\}\s*\])/s);
        // 2. Tìm chuỗi phụ đề mã hóa (thường dùng Base64 hoặc ngoặc kép)
        var matchEnc = script.match(/subtitles:\s*['"]([^'"]+)['"]/s);

        if (matchObj && matchObj[1]) {
            subStr = matchObj[1];
        } else if (matchEnc && matchEnc[1]) {
            try { subStr = BASE64.decode(matchEnc[1]); } catch(err) {}
        }

        if (subStr) {
            try {
                var sublist = JSON.parse(subStr);
                sublist.forEach(function(item, index) {
                    var name = (item.code || "vi").replace("vie", "Vietsub").replace("eng", "Engsub");
                    var link = item.url.indexOf("http") === 0 ? item.url : domain + item.url;
                    subitem.push({
                        lang: name + " " + (index + 1),
                        url: link
                    });
                });
            } catch(err) { log("Lỗi parse JSON phụ đề: " + err); }
        }

        return JSON.stringify({
            url: m3u8,
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Referer": BASEURL
            },
            subtitles: subitem
        });
    } catch (e) {
        log("parseDetailResponse[err]:\n " + e);
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try { return JSON.stringify(buildMenu(getLISTmenu())); } catch (e) { return "[]"; }
}
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// THƯ VIỆN BỔ SUNG & CÔNG CỤ
// =============================================================================

var BASE64 = {
    decode: function (base64String) {
        try {
            if (!base64String) return "";
            var str = decodeURIComponent(base64String.trim());
            str = str.replace(/-/g, "+").replace(/_/g, "/");
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var output = [];
            var buffer = 0, bits = 0;
            for (var i = 0; i < str.length; i++) {
                var char = str.charAt(i);
                if (char === "=") break;
                var index = chars.indexOf(char);
                if (index === -1) continue;
                buffer = (buffer << 6) | index;
                bits += 6;
                if (bits >= 8) {
                    bits -= 8;
                    output.push((buffer >> bits) & 0xff);
                }
            }
            var result = "";
            var j = 0;
            while (j < output.length) {
                var c = output[j++];
                if (c < 128) {
                    result += String.fromCharCode(c);
                } else if (c > 191 && c < 224) {
                    var c2 = output[j++];
                    result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                } else if (c > 223 && c < 240) {
                    var c2 = output[j++];
                    var c3 = output[j++];
                    result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                } else if (c >= 240) {
                    var c2 = output[j++];
                    var c3 = output[j++];
                    var c4 = output[j++];
                    var u = (((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;
                    result += String.fromCharCode(0xd800 + (u >> 10), 0xdc00 + (u & 0x3ff));
                }
            }
            return result;
        } catch (e) { return ""; }
    }
};

function getLISTmenu() {
    return `[{"link":"/the-loai/action-adventure/","name":"Action & Adventure"},{"link":"/the-loai/bi-an/","name":"Bí Ẩn"},{"link":"/the-loai/chien-tranh/","name":"Chiến Tranh"},{"link":"/the-loai/chinh-kich/","name":"Chính Kịch"},{"link":"/the-loai/chinh-tri-chien-tranh/","name":"Chính Trị - Chiến Tranh"},{"link":"/the-loai/chu-de-thuc-te/","name":"Chủ Đề Thực Tế"},{"link":"/the-loai/co-trang/","name":"Cổ Trang"},{"link":"/the-loai/drama/","name":"Drama"},{"link":"/the-loai/gia-dinh/","name":"Gia Đình"},{"link":"/the-loai/gia-tuong/","name":"Giả Tưởng"},{"link":"/the-loai/giat-gan/","name":"Giật Gân"},{"link":"/the-loai/hai/","name":"Hài"},{"link":"/the-loai/hanh-dong/","name":"Hành Động"},{"link":"/the-loai/hanh-dong-phieu-luu/","name":"Hành Động & Phiêu Lưu"},{"link":"/the-loai/hinh-su/","name":"Hình Sự"},{"link":"/the-loai/hoat-hinh/","name":"Hoạt Hình"},{"link":"/the-loai/hoc-duong/","name":"Học Đường"},{"link":"/the-loai/hon-nhan/","name":"Hôn Nhân"},{"link":"/the-loai/hu-cau/","name":"Hư Cấu"},{"link":"/the-loai/khoa-hoc-vien-tuong/","name":"Khoa Học Viễn Tưởng"},{"link":"/the-loai/khoa-hoc-vien-tuong-gia-tuong/","name":"Khoa Học Viễn Tưởng & Giả Tưởng"},{"link":"/the-loai/kiem-hiep/","name":"Kiếm hiệp"},{"link":"/the-loai/kinh-di/","name":"Kinh Dị"},{"link":"/the-loai/lang-man/","name":"Lãng Mạng"},{"link":"/the-loai/lgbt/","name":"LGBT"},{"link":"/the-loai/phieu-luu/","name":"Phiêu Lưu"},{"link":"/the-loai/phim-nhac/","name":"Phim Nhạc"},{"link":"/the-loai/phuctrangcodai/","name":"Phụctrangcổđại"},{"link":"/the-loai/sci-fi-fantasy/","name":"Sci-Fi & Fantasy"},{"link":"/the-loai/thanh-xuan/","name":"Thanh Xuân"},{"link":"/the-loai/thieu-nhi/","name":"Thiếu Nhi"},{"link":"/the-loai/thuong-truong/","name":"Thương Trường"},{"link":"/the-loai/tien-hiep/","name":"Tiên Hiệp"},{"link":"/the-loai/tieu-thuyet-chuyen-the/","name":"Tiểu Thuyết Chuyển Thể"},{"link":"/the-loai/tinh-ban/","name":"Tình Bạn"},{"link":"/the-loai/tinh-tiet/","name":"Tình Tiết"},{"link":"/the-loai/tinh-yeu-ngot-ngao/","name":"Tình Yêu Ngọt Ngào"},{"link":"/the-loai/toi-pham/","name":"Tội Phạm"},{"link":"/the-loai/tra-thu/","name":"Trả Thù"},{"link":"/the-loai/truyen-hinh-thuc-te/","name":"Truyền Hình Thực Tế"},{"link":"/the-loai/vien-tuong/","name":"Viễn Tưởng"},{"link":"/the-loai/vo-hiep/","name":"Võ hiệp"},{"link":"/the-loai/vo-thuat/","name":"Võ Thuật"},{"link":"/the-loai/xa-hoi-den/","name":"Xã Hội Đen"}]`;
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
            let lastIndex = 0;
            let match;
            let maxIter = 50000;
            let iter = 0;
            while ((match = tagRegex.exec(html)) !== null && iter++ < maxIter) {
                let textBefore = html.slice(lastIndex, match.index).trim();
                let parentId = stack[stack.length - 1];
                if (textBefore) {
                    let textId = nodes.length;
                    nodes.push({ id: textId, tag: "#text", text: textBefore, attrs: {}, childrenIds: [], parentId: parentId });
                    nodes[parentId].childrenIds.push(textId);
                }
                lastIndex = tagRegex.lastIndex;
                let isCloseTag = !!match[1];
                let tagName = (match[1] || match[2] || "").toLowerCase();
                let attrStr = match[3] || "";
                let isSelfClosing = !!match[4] || VOID_TAGS.has(tagName);
                if (isCloseTag) {
                    for (let i = stack.length - 1; i > 0; i--) {
                        if (nodes[stack[i]].tag === tagName) { stack.splice(i); break; }
                    }
                } else {
                    let attrs = {};
                    let attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
                    let attrMatch;
                    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
                        attrs[attrMatch[1].toLowerCase()] = attrMatch[2] || attrMatch[3] || attrMatch[4] || "";
                    }
                    let nodeId = nodes.length;
                    let node = { id: nodeId, tag: tagName, attrs: attrs, childrenIds: [], parentId: parentId };
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
            for (let cid of node.childrenIds) {
                text += getNodeText(nodes[cid], nodes, (depth || 0) + 1) + " ";
            }
        }
        return text.trim();
    }

    function matchSingleSelector(node, sel, nodes) {
        if (!node || node.tag === "#text" || node.tag === "ROOT") return false;
        let cleanSel = sel.replace(/:first|:last|:eq\([0-9]+\)/gi, "").trim();
        let pseudoContentArg = null;
        let contentMatch = cleanSel.match(/:content\((['"]?)(.*?)\1\)/i);
        if (contentMatch) {
            pseudoContentArg = contentMatch[2];
            cleanSel = cleanSel.replace(contentMatch[0], "").trim();
        }
        if (cleanSel && cleanSel !== "*") {
            let tagMatch = cleanSel.match(/^[a-zA-Z0-9_-]+/);
            if (tagMatch && node.tag !== tagMatch[0].toLowerCase()) return false;
            let idMatch = cleanSel.match(/#([a-zA-Z0-9_-]+)/);
            if (idMatch && (!node.attrs || node.attrs.id !== idMatch[1])) return false;
            let classMatches = cleanSel.match(/\.([a-zA-Z0-9_\-\/\\:]+)/g);
            if (classMatches) {
                if (!node.attrs || !node.attrs.class) return false;
                let elClasses = node.attrs.class.split(/\s+/);
                for (let c of classMatches) {
                    if (!elClasses.includes(c.substring(1))) return false;
                }
            }
            let attrMatch = cleanSel.match(/\[([a-zA-Z0-9_-]+)(?:=['"]?(.*?)['"]?)?\]/);
            if (attrMatch) {
                let attrName = attrMatch[1].toLowerCase();
                let attrVal = attrMatch[2];
                if (!node.attrs || !(attrName in node.attrs)) return false;
                if (attrVal !== undefined && node.attrs[attrName] !== attrVal) return false;
            }
        }
        if (pseudoContentArg !== null) {
            let fullText = getNodeText(node, nodes, 0).toLowerCase();
            if (!pseudoContentArg.split("|").map(k => k.trim().toLowerCase()).some(kw => fullText.includes(kw))) return false;
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
            if (current.childrenIds) {
                for (let cid of current.childrenIds) search(cid, depth + 1);
            }
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
                        for (let r of querySelectorAllSingleLevel(cNode, part, nodes)) {
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
        attr: function(name) { return this.elements.length === 0 || !this.elements[0].attrs ? "" : this.elements[0].attrs[name] || ""; },
        each: function(callback) {
            this.elements.forEach((el, index) => {
                let jqEl = new MiniJQ([el], this.nodes);
                callback.call(jqEl, index, jqEl);
            });
            return this;
        },
        closest: function(selector) {
            let matched = [], addedIds = new Set();
            for (let el of this.elements) {
                let currParentId = el.parentId, depth = 0;
                while (currParentId !== null && currParentId !== 0 && depth++ < 30) {
                    let curr = this.nodes[currParentId];
                    if (!curr) break;
                    if (matchSingleSelector(curr, selector, this.nodes)) {
                        if (!addedIds.has(curr.id)) { addedIds.add(curr.id); matched.push(curr); }
                        break;
                    }
                    currParentId = curr.parentId;
                }
            }
            return new MiniJQ(matched, this.nodes);
        },
        next: function() {
            let nexts = [];
            for (let el of this.elements) {
                if (!el || el.parentId === null) continue;
                let pNode = this.nodes[el.parentId];
                if (!pNode) continue;
                let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
                let idx = siblings.findIndex(s => s.id === el.id);
                if (idx !== -1 && idx + 1 < siblings.length) nexts.push(siblings[idx + 1]);
            }
            return new MiniJQ(nexts, this.nodes);
        }
    };

    try {
        if (!param) return new MiniJQ([], []);
        if (param instanceof MiniJQ) return param;
        let parsed = typeof param === "string" ? parseHTML(param) : { root: param, nodes: [] };
        return new MiniJQ(parsed.root, parsed.nodes);
    } catch (err) { return new MiniJQ([], []); }
}

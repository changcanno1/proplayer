var BASEURL = "https://vicdn.cc"; 
var BASEAPI = BASEURL + "/api";
var DEV = true;
var popup_html = "";

function getManifest() {
  return JSON.stringify({
    id: "vicdn",
    name: "Nguồn Vicdn",
    description: "Nguồn phim Vicdn.",
    "version": "2.4",
    info: "Nguồn phim vietsub và thuyết minh mới.\n\n Hỗ trợ lồng tiếng và có tốc độ phát rất nhanh.",
    baseUrl: "https://vicdn.cc",
    iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/icon/vicdn.png",
    isEnabled: true,
    "adblock": false,
    type: "MOVIE",
    "author": "Alokillgtv",
    // Chuyển sang webview hoặc giữ embedtoexoplay nhưng kích hoạt inject WebView Player
    playerType: "webview", 
  });
}

function log(msg) {
  	console.log(msg);
}

function getHomeSections() {
    return JSON.stringify([
        {"slug": "/update/","title": "Phim Mới","type": "Grid"}
    ]);
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

function getUrlList(slug, filtersJson) {
    try {
        log("getUrlList[url]: \n" + slug);
        if (slug && slug.indexOf("http") > -1) {
            if (slug.indexOf("search") > -1 && filtersJson) {
                var fixedJson1 = filtersJson
                    .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    .replace(/:,/g, ':');
                try {
                    var filtersSearch = JSON.parse(fixedJson1);
                    var pageSearch = parseInt(filtersSearch.page) || 1;

                    if (pageSearch > 1 && slug.indexOf("page=") === -1) {
                        var sepSearch = slug.indexOf("?") > -1 ? "&" : "?";
                        var resSearch = slug + sepSearch + "page=" + pageSearch;
                        return resSearch;
                    }
                } catch (jsonErr) {}
            }
            return slug;
        }

        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson2 = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

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

        var resultUrl = BASEAPI;
        if (path) {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }

        if (page > 0 && resultUrl.indexOf("page=") === -1) {
            resultUrl += page;
        }

        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        return finalUrl;
    } catch (e) {
        log("getUrlList[err]:\n " + e);
        if (slug && slug.indexOf("http") > -1) return slug;
        var fallback = BASEAPI + (slug ? (slug.indexOf("/") === 0 ? slug : "/" + slug) : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        var encodedKeyword = encodeURIComponent(keyword || "");
        var resultUrl = BASEURL + "/?q=" + encodedKeyword;

        if (page > 1) {
            resultUrl += "&page=" + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        var fallback = BASEURL + "/?q=" + encodeURIComponent(keyword || "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlDetail(slug) {
    try {
        log("getUrlDetail[url]: \n" + slug);
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

function parseListResponse(html, $url) {
    try {
        log("parseListResponse[url]: \n" + $url);
        if ($url.indexOf("/?q=") > -1) {
            var script = _$ (html).find("script:content('const|allData')").html();
            var $obj = script.match(/\[\s*\{[\s\S]*?\}\s*\]/i);
            if ($obj) {
                var $data = JSON.parse($obj[0]);
                return domfetch($data, $url);
            }
        } else {
            var $allData = JSON.parse(html);
            return domfetch($allData.data, $url);
        }
    } catch (e) {
        log("parseListResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [{
                "id": $url || "error_url",
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function domfetch($data, $url) {
    var items = [];
    for (var $j = 0; $j < $data.length; $j++) {
        var item = $data[$j];
        items.push({
            "id": BASEAPI + "/info/" + item.slug,
            "title": item.vname,
            "posterUrl": "https://image.tmdb.org/t/p/w130_and_h195_face/" + item.poster + ".jpg",
            "backdropUrl": "https://image.tmdb.org/t/p/w533_and_h300_face/" + item.banner + ".jpg",
            "quality": item.type.toUpperCase(),
            "episode_current": "Tập " + item.stt + "/" + item.total
        });
    }
    return JSON.stringify({
        "items": items,
        "pagination": { "currentPage": 1, "totalPages": 999 }
    });
}

function parseSearchResponse(html, url) {
    try {
        return parseListResponse(html, url);
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseMovieDetail(html, url) {
    try {
        log("parseMovieDetail[url]: \n" + url);
        var $jsdata = JSON.parse(html);
        var $data = $jsdata.data;
        var limg = $data.banner;
        var lname = $data.vname;
        var ldes = $data.content;
        var lactor = $data.cast ? $data.cast.join(" - ") : "";
        var lduran = $data.duration + " phút";
        var status = "Tập " + $data.stt + "/" + $data.total;
        var category = $data.genre ? $data.genre.join(" - ") : "";
        var episode_current = "Tập " + $data.stt;
        var year = $data.year;
        var servers = [];
        var episodes = [];
        
        for (var $j = 0; $j < $data.list_episodes.length; $j++) {
            var item = $data.list_episodes[$j];
            var split = item.split("|");
            episodes.push({
                id: url + "?current=" + split[0] + "&tm=raw",
                name: "Tập " + split[0],
                slug: "tap-" + split[0],
                ids: [{
                  url: url + "?current=" + split[0] + "&tm=raw",
                  name: "Vietsub (Âm Thanh Gốc)"
                },{
                  url: url + "?current=" + split[0] + "&tm=tm1",
                  name: "Vietsub (Thuyết Minh Nữ)"
                },{
                  url: url + "?current=" + split[0] + "&tm=tm2",
                  name: "Vietsub (Thuyết Minh Nam)"
                }]
            });
        }
        servers.push({
            name: "Server Chính",
            episodes: episodes
        });
        return JSON.stringify({
            id: url,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "HD",
            year: year,
            rating: 8.5,
            status: status,
            category: category,
            episode_current: episode_current,
            servers: servers,
            duration: lduran || "",
            casts: lactor || "",
            director: "",
            extra: ""
        });
    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({ id: url || "error", title: "error", servers: [] });
    }
}

function checkRaw(scriptStr, returnFixed) {
  try {
    if (!scriptStr || typeof scriptStr !== 'string') return scriptStr || "";
    var lines = scriptStr.split('\n');
    var fixedLines = [];
    for (var i = 0; i < lines.length; i++) {
      var fixedLine = lines[i].replace(/\r/g, "").replace(/\t/g, "  ");
      fixedLines.push(fixedLine);
    }
    return returnFixed ? fixedLines.join('\n') : scriptStr;
  } catch (e) {
    return scriptStr;
  }
}

function parseDetailResponse(html, url) {
  try {
    var $jsdata = JSON.parse(html);
    var $data = $jsdata.data;
    var stream = url;
    var currentMatch = url.match(/current=(\d+)/i);
    var current = currentMatch ? Number(currentMatch[1]) : 1;

    for (var $j = 0; $j < $data.list_episodes.length; $j++) {
        var item = $data.list_episodes[$j];
        var split = item.split("|");
        if (Number(split[0]) === current) {
              stream = split[1] + "?episodes=" + encodeURIComponent(url);
        }
    }
    
    var epiMatch = url.match(/current=(\d+)&tm=(\w+)/i);
    var tmVal = epiMatch ? epiMatch[2] : "raw";
    var idvdMatch = url.match(/^https:\/\/vicdn\.cc\/api\/info\/([^\?]+)/i);
    var idvd = idvdMatch ? idvdMatch[1] : "tv-unknown";
    var epiNum = epiMatch ? epiMatch[1] : current;

    var sub = "https://vicdn.cc/vtt/" + idvd + "-" + epiNum + "-vi.vtt";
    var subeng = "https://vicdn.cc/vtt/" + idvd + "-" + epiNum + "-en.vtt";
    
    log("Embed Stream URL: " + stream);
    
    return JSON.stringify({
      url: stream,
      isEmbed: true, // Bật chế độ nhúng WebView để load đầy đủ player và script giải mã
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: BASEURL,
        "Block-Ads": false,
        "Custom-Js": rawJS(BASEURL, tmVal)
      },
      subtitles: [{
        url: sub,
        lang: "Vietsub",
        mimeType: "text/vtt"
      },{
        url: subeng,
        lang: "English",
        mimeType: "text/vtt"
      }],
    });
  } catch (e) {
    log("parseDetailResponse[err]:\n " + e);
    return JSON.stringify({ 
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
      mimeType: "video/mp4", 
      isEmbed: false, headers: {}, subtitles: [] 
    });
  }
}

function rawJS(referer, tm) {
return `
(function ensureHls(){
  if (typeof window.hls !== 'undefined' || typeof window.Hls !== 'undefined') return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
  s.onload = function(){ try { if (window.Hls && !window.hls) window.hls = window.Hls; } catch(e){} };
  (document.head || document.documentElement).appendChild(s);
})();
function bridgeLog(msg, check) {
    try {
      if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
        window.SnifferBridge.log(msg);
      } else if (typeof console !== 'undefined' && console.log) {
        console.log(msg);
      }
    } catch(e) {}
}

(function initProxyFetch() {
  if (window.__VAX_PROXY_FETCH__) return;
  window.__VAX_PROXY_FETCH__ = 1;
  var PROXY = 'https://streamfile.alokillgtv04.workers.dev/proxy';
  var REF = 'https://vicdn.cc';

  function shouldProxy(u) {
    if (!u || typeof u !== 'string') return false;
    if (!/vicdn\\.cc\\//i.test(u)) return false;
    if (/\\.(js|mjs|css|json|png|jpg|jpeg|gif|webp|svg|woff2?|ttf)(\\?|#|$)/i.test(u)) return false;
    if (/vicdn\\.cc\\/hls\\/[^?#]+\\.html/i.test(u)) return true;
    if (/vicdn\\.cc\\/subtitle\\/[^?#]+\\.html/i.test(u)) return true;
    if (/vicdn\\.cc\\/vtt\\/[^?#]+\\.vtt/i.test(u)) return true;
    return false;
  }
  function toProxy(u) {
    return PROXY + '?url=' + encodeURIComponent(u) + '&referer=' + REF;
  }

  try {
    var rawFetch = window.fetch;
    window.fetch = function(input, init) {
      var u = typeof input === 'string' ? input : (input && input.url);
      if (shouldProxy(u)) {
        var newU = toProxy(u);
        if (typeof input === 'string') return rawFetch.call(this, newU, init);
        try { return rawFetch.call(this, new Request(newU, input)); }
        catch(e) { return rawFetch.call(this, newU, init); }
      }
      return rawFetch.apply(this, arguments);
    };
  } catch(e) {}
})();
`;
}

function sortEpisodesByName(data) {
    try {
        if (data && Array.isArray(data)) {
            data.forEach(function(server) {
                if (server.episodes && Array.isArray(server.episodes)) {
                    server.episodes.sort(function(a, b) {
                        var matchA = a.name.match(/Tập\s*(\d+)/i);
                        var matchB = b.name.match(/Tập\s*(\d+)/i);
                        var numA = matchA ? parseInt(matchA[1], 10) : 0;
                        var numB = matchB ? parseInt(matchB[1], 10) : 0;
                        return numA - numB;
                    });
                }
            });
        }
        return data;
    } catch (e) {
        return data;
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var listurl = getLISTmenu();
        return JSON.stringify(buildMenu(listurl));
    } catch (e) {
        return JSON.stringify([]);
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return `[{\"link\":\"/type/hoat-hinh/\",\"name\":\"Hoạt Hình\"},{\"link\":\"/type/vien-tuong/\",\"name\":\"Viễn Tưởng\"},{\"link\":\"/type/hinh-su/\",\"name\":\"Hình Sự\"},{\"link\":\"/type/bi-an/\",\"name\":\"Bí Ẩn\"},{\"link\":\"/type/hanh-dong/\",\"name\":\"Hành Động\"}]`;
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
            while ((match = tagRegex.exec(html)) !== null) {
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
                    nodes.push({ id: nodeId, tag: tagName, attrs: attrs, childrenIds: [], parentId: parentId });
                    nodes[parentId].childrenIds.push(nodeId);
                    if (!isSelfClosing) stack.push(nodeId);
                }
            }
            let remainingText = html.slice(lastIndex).trim();
            if (remainingText && stack.length > 0) {
                let parentId = stack[stack.length - 1];
                let textId = nodes.length;
                nodes.push({ id: textId, tag: "#text", text: remainingText, attrs: {}, childrenIds: [], parentId: parentId });
                nodes[parentId].childrenIds.push(textId);
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
        }
        if (pseudoContentArg !== null) {
            let fullText = getNodeText(node, nodes, 0);
            let keywords = pseudoContentArg.split("|").map(k => k.trim().toLowerCase());
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
            if (current.childrenIds) {
                for (let cid of current.childrenIds) search(cid, depth + 1);
            }
        }
        search(startNode.id, 0);
        return results;
    }

    function querySelectorAll(startNode, selector, nodes) {
        try {
            if (!startNode || !selector) return [];
            return querySelectorAllSingleLevel(startNode, selector, nodes);
        } catch (err) {
            return [];
        }
    }

    function MiniJQ(elements, nodesStore) {
        this.elements = Array.isArray(elements) ? elements : (elements ? [elements] : []);
        this.nodes = nodesStore || [];
        this.length = this.elements.length;
    }

    MiniJQ.prototype = {
        find: function(selector) {
            if (this.elements.length === 0) return new MiniJQ([], this.nodes);
            let matched = [], addedIds = new Set();
            for (let el of this.elements) {
                let res = querySelectorAll(el, selector, this.nodes);
                for (let r of res) {
                    if (!addedIds.has(r.id)) { addedIds.add(r.id); matched.push(r); }
                }
            }
            return new MiniJQ(matched, this.nodes);
        },
        text: function() {
            if (this.elements.length === 0) return "";
            return getNodeText(this.elements[0], this.nodes, 0);
        },
        html: function() {
            if (this.elements.length === 0) return "";
            let self = this;
            let serialize = function(nodeId, depth) {
                if (depth > 20) return "";
                let node = self.nodes[nodeId];
                if (!node) return "";
                if (node.tag === "#text") return node.text || "";
                let attrs = Object.entries(node.attrs || {}).map(([k, v]) => ` ${k}="${v}"`).join("");
                let childrenHTML = (node.childrenIds || []).map(cid => serialize(cid, depth + 1)).join("");
                return `<${node.tag}${attrs}>${childrenHTML}</${node.tag}>`;
            };
            return (this.elements[0].childrenIds || []).map(cid => serialize(cid, 0)).join("");
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
    } catch (err) {
        return new MiniJQ([], []);
    }
}

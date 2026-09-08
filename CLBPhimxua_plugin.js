var BASEURL = "https://clbphimxua.com";

// Chuyển logic lấy Cookie thành Lazy Load để tránh crash iOS khi nạp file JS toàn cục
function getLazyCookie() {
    var domain = "https://clbphimxua.com";
    var userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    var c = "";
    
    if (typeof localStorage !== 'undefined') {
        c = localStorage.getItem("clbpx_cookie") || "";
    }
    if (c && c.indexOf("wordpress_logged_in_") !== -1) {
        return c;
    }
    
    var loginUrl = domain + "/wp-login.php";
    var initCookiesArr = getSetCookies(loginUrl, { "User-Agent": userAgent });
    var initialCookies = "";

    if (initCookiesArr && initCookiesArr.length > 0) {
        initialCookies = initCookiesArr.map(function(cook) { 
            return cook.split(";")[0].trim(); 
        }).join("; ");
    }
    
    if (initialCookies.indexOf("wordpress_test_cookie") === -1) {
        initialCookies += (initialCookies ? "; " : "") + "wordpress_test_cookie=WP%20Cookie%20check";
    }

    var bodyData = "log=" + encodeURIComponent("gun95941@gmail.com") +
                   "&pwd=" + encodeURIComponent("123456") +
                   "&rememberme=forever" +
                   "&wp-submit=" + encodeURIComponent("Đăng nhập") +
                   "&redirect_to=" + encodeURIComponent(domain + "/wp-admin/") +
                   "&testcookie=1";

    var loginRes = httpRequest(loginUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": initialCookies,
            "Origin": domain,
            "Referer": loginUrl,
            "User-Agent": userAgent
        },
        body: bodyData
    });

    var authCookiesArr = [];
    if (loginRes && loginRes.setCookies) {
        authCookiesArr = loginRes.setCookies.map(function(cook) { 
            return cook.split(";")[0].trim(); 
        });
    }

    var fullCookieStr = authCookiesArr.join("; ");
    if (fullCookieStr && fullCookieStr.indexOf("wordpress_") !== -1) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem("clbpx_cookie", fullCookieStr);
        }
        return fullCookieStr;
    }
    return "";
}

function getManifest() {
    return JSON.stringify({
        "id": "clbpxVIP",
        "name": "CLB Phim Xưa VIP",
        "version": "1.5",
        "info": "Fix lỗi iOS bằng Lazy Cookie Loading & Tối ưu Mini-JQ",
        "BASEURL": "https://clbphimxua.com",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/clbpxVIP.png",
        "headers": {
            "Host": "clbphimxua.com",
            "Referer": "https://clbphimxua.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        "isEnabled": true,
        "isAdult": false,
        "adblock": false,
        "type": "MOVIE",
        "author": "alokillgtv",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([{ slug: 'home', title: 'Mới Cập Nhật', type: 'Grid', path: '' }]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Kiếm Hiệp', slug: 'phim-bo-kiem-hiep-co-trang' },
        { name: 'Tiên Hiệp', slug: 'tien-hiep-ngon-tinh' },
        { name: 'Tâm Lý', slug: 'tlhd' },
        { name: 'Ma Kinh Dị', slug: 'ma-kinh-di' },
        { name: 'Điện Ảnh Châu Á', slug: 'phim-hk-tk' },
        { name: 'Điện Ảnh Âu Mỹ', slug: 'dien-anh-tay' },
        { name: 'Hàn Quốc', slug: 'drama-hq-nb' },
        { name: 'Anime', slug: 'phim-hoat-hinh' },
        { name: 'TV Series', slug: 'phim-tv' },
        { name: 'Thập Niên 60', slug: 'thap-nien-60' },
        { name: 'Thập Niên 70', slug: 'thap-nien-70' },
        { name: 'Thập Niên 80', slug: 'thap-nien-80' },
        { name: 'Thập Niên 90', slug: 'thap-nien-90' },
        { name: 'Thập Niên 2000', slug: 'thap-nien-2000' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Cũ nhất', value: 'oldest' },
            { name: 'Mới nhất', value: 'newest' }
        ]
    });
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var url = "";

    if (slug === '' || slug === 'home') {
        url = page > 1 ? BASEURL + "/page/" + page + "/" : BASEURL + "/";
    } else {
        url = page > 1 ? BASEURL + "/category/" + slug + "/page/" + page + "/" : BASEURL + "/category/" + slug + "/";
    }
    
    var cookie = getLazyCookie();
    return url + (cookie ? "|Cookie=" + cookie : "");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var url = page > 1 ? BASEURL + "/page/" + page + "/?s=" + encodeURIComponent(keyword) : BASEURL + "/?s=" + encodeURIComponent(keyword);
    var cookie = getLazyCookie();
    return url + (cookie ? "|Cookie=" + cookie : "");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var url = (slug.indexOf("http") === 0) ? slug : BASEURL + "/" + slug + "/";
    var cookie = getLazyCookie();
    return url + (cookie ? "|Cookie=" + cookie : "");
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function parseListResponse(htmlResponse, url) {
    var items = [];
    var $doc = _$(htmlResponse);
    
    $doc.find("article").each(function() {
        var aTag = this.find("a").first();
        var link = aTag.attr("href");
        var imgTag = this.find("img").first();
        var thumb = imgTag.attr("src");
        var title = imgTag.attr("alt") || aTag.text() || "";

        if (link && thumb) {
            title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").trim();
            var slugMatch = link.match(/clbphimxua\.com\/([^\/]+)\/?/);
            var slug = slugMatch ? slugMatch[1] : link;
            
            var year = 0;
            var yearMatch = title.match(/19\d{2}|20\d{2}/);
            if (yearMatch) year = parseInt(yearMatch[0], 10);

            items.push({
                id: slug,
                title: title,
                posterUrl: thumb,
                backdropUrl: thumb,
                year: year
            });
        }
    });

    var totalPages = 1;
    var currentPage = 1;
    var curPageMatch = htmlResponse.match(/<span aria-current="page" class="page-numbers current">(\d+)<\/span>/i);
    
    if (curPageMatch) {
        currentPage = parseInt(curPageMatch[1], 10);
    }
    
    var pageRegex = /<a class="page-numbers".*?>(\d+)<\/a>/gi;
    var pm;
    while ((pm = pageRegex.exec(htmlResponse)) !== null) {
        var pNum = parseInt(pm[1], 10);
        if (pNum > totalPages) totalPages = pNum;
    }
    if (currentPage > totalPages) totalPages = currentPage;

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages
        }
    });
}

function parseSearchResponse(htmlResponse) {
    return parseListResponse(htmlResponse, "");
}

function parseMovieDetail(htmlResponse, url) {
    try {
        var $doc = _$(htmlResponse);
        var id = "";
        
        var slugMatch = htmlResponse.match(/<link rel="canonical" href="([^"]+)"/i);
        if (slugMatch) {
            var parts = slugMatch[1].split('/');
            id = parts[parts.length - 2] || parts[parts.length - 1] || "unknown_movie";
        } else {
            id = "movie_" + new Date().getTime();
        }

        var title = $doc.find("h1.single-title").text() || "";
        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").trim();
        
        var posterUrl = $doc.find("img.wp-post-image").attr("src") || "";
        if (!posterUrl) {
            var ogImg = htmlResponse.match(/<meta property="og:image" content="([^"]+)"/i);
            if (ogImg) posterUrl = ogImg[1];
        }

        var description = $doc.find(".sigle-post-content-area").text().trim() || "";

        var year = 0;
        var yearMatch = title.match(/(19\d{2}|20\d{2})/);
        if (yearMatch) year = parseInt(yearMatch[1], 10);

        var servers = [];
        var episodes = [];
        
        $doc.find(".sigle-post-content-area").find("a").each(function() {
            var href = this.attr("href");
            var epLabel = this.text().trim();
            
            if (href && (href.indexOf("clbpx") !== -1 || href.indexOf("v=") !== -1)) {
                if (!epLabel || /^\s*$/.test(epLabel)) {
                    epLabel = "Tập " + (episodes.length + 1);
                }
                
                var vMatch = href.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                var videoId = vMatch ? vMatch[1] : "";
                
                if (videoId) {
                    episodes.push({
                        id: videoId + "|data:" + videoId, // Tuân thủ truyền dữ liệu qua |data:
                        name: epLabel,
                        slug: "tap-" + videoId
                    });
                }
            }
        });

        if (episodes.length > 0) {
            servers.push({
                name: "Thuyết Minh / Phụ Đề",
                episodes: episodes
            });
        }

        return JSON.stringify({
            id: id,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            quality: "HD",
            servers: servers
        });

    } catch (error) {
        return JSON.stringify({ id: "error", title: "Lỗi", servers: [] });
    }
}

function parseDetailResponse(htmlResponse, url, datasend) {
    try {
        var videoId = datasend || url.replace(/\|data:.*/, '');
        var stream = "https://abysscdn.com/?v=" + videoId;
        
        return JSON.stringify({
            url: stream,
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (error) {
        return JSON.stringify({ url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", isEmbed: false, headers: {} });
    }
}

function _$(htmlOrBlock) {
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
                        if (nodes[stack[i]].tag === tagName) {
                            stack.splice(i);
                            break;
                        }
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

                    if (!isSelfClosing) {
                        stack.push(nodeId);
                    }
                }
            }
        } catch (err) { }
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
        }
        if (pseudoContentArg !== null) {
            let fullText = getNodeText(node, nodes, 0);
            let keywords = pseudoContentArg.split("|").map(k => k.trim().toLowerCase());
            let found = keywords.some(kw => fullText.toLowerCase().includes(kw));
            if (!found) return false;
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
        return results;
    }

    function querySelectorAll(startNode, selector, nodes) {
        try {
            if (!startNode || !selector) return [];
            let spaceParts = selector.trim().split(/\s+/);
            if (spaceParts.length > 1) {
                let currentNodes = [startNode];
                for (let part of spaceParts) {
                    let nextLevelNodes = [];
                    let addedIds = new Set();
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
            if (this.elements.length === 0) return new MiniJQ([], this.nodes);
            let matched = [];
            let addedIds = new Set();
            for (let el of this.elements) {
                let res = querySelectorAll(el, selector, this.nodes);
                for (let r of res) {
                    if (!addedIds.has(r.id)) { addedIds.add(r.id); matched.push(r); }
                }
            }
            return new MiniJQ(matched, this.nodes);
        },
        text: function() { return this.elements.length === 0 ? "" : getNodeText(this.elements[0], this.nodes, 0); },
        attr: function(name) { return (this.elements.length > 0 && this.elements[0].attrs) ? (this.elements[0].attrs[name] || "") : ""; },
        each: function(callback) {
            this.elements.forEach((el, index) => {
                let jqEl = new MiniJQ([el], this.nodes);
                callback.call(jqEl, index, jqEl);
            });
            return this;
        },
        first: function() { return new MiniJQ(this.elements.length > 0 ? [this.elements[0]] : [], this.nodes); }
    };

    try {
        if (!htmlOrBlock) return new MiniJQ([], []);
        if (htmlOrBlock instanceof MiniJQ) return htmlOrBlock;
        if (typeof htmlOrBlock === "string") {
            let parsed = parseHTML(htmlOrBlock);
            return new MiniJQ(parsed.root, parsed.nodes);
        }
        return new MiniJQ(htmlOrBlock, []);
    } catch (err) {
        return new MiniJQ([], []);
    }
}

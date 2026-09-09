// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN (Phiên bản tối ưu iOS & dùng mini-JQ)
// ========================================================

var BASE_URL = "https://www.sieutamphim.pro";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>";

function getManifest() {
    return JSON.stringify({
        "id": "sieutamphim",
        "name": "Sưu Tầm Phim",
        "version": "1.2.0",
        "baseUrl": BASE_URL,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/sieutamphim.png",
        "popup_html": popup_html,
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[STPhim] " + msg);
    }
}

function getSlugFromUrl(url) {
    if (!url) return "";
    var cleanUrl = url.split("?")[0];
    var match = cleanUrl.match(/\/([^\/]+)\.html$/i);
    if (match) return match[1];
    var parts = cleanUrl.split("/");
    var last = parts[parts.length - 1] || parts[parts.length - 2] || "";
    return last.replace(".html", "");
}

// ========================================================
// HOME & CATEGORY
// ========================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-bo", title: "Phim Bộ Mới", type: "Horizontal" },
        { slug: "phim-le", title: "Phim Lẻ Mới", type: "Horizontal" },
        { slug: "long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal" },
        { slug: "thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal" },
        { slug: "phim-moi", title: "Mới cập nhật", type: "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim Lẻ', slug: 'phim-le' },
        { name: 'Phim Bộ', slug: 'phim-bo' },
        { name: 'Hoạt Hình', slug: 'hoat-hinh' },
        { name: 'Phim Việt Nam', slug: 'phim-viet-nam' },
        { name: 'Phim Hàn Quốc', slug: 'phim-han-quoc' },
        { name: 'Phim Trung Quốc', slug: 'phim-trung-quoc' },
        { name: 'Phim Nhật Bản', slug: 'phim-nhat-ban' },
        { name: 'Hành Động', slug: 'hanh-dong' },
        { name: 'Viễn Tưởng', slug: 'vien-tuong' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

// ========================================================
// URL GENERATION
// ========================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    if (page === 1) return BASE_URL + "/search/label/" + slug;
    return BASE_URL + "/search/label/" + slug + "/page/" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/page/" + page + "?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(id) {
    if (!id) return "";
    if (id.startsWith("http")) return id;
    return BASE_URL + "/wp-json/wp/v2/posts?slug=" + encodeURIComponent(id);
}

// ========================================================
// PARSE LIST
// ========================================================

function parseListResponse(html, url) {
    try {
        var $doc = _$(html);
        var items = [];
        
        $doc.find(".post-item").each(function() {
            var aTag = this.find("a").first();
            var href = aTag.attr("href");
            
            if (href) {
                if (!href.startsWith("http")) href = BASE_URL + href;
                var title = this.find(".post-title").text() || aTag.attr("alt") || this.find("img").attr("alt");
                var poster = this.find("img").attr("data-src") || this.find("img").attr("src");
                
                if (poster && poster.startsWith("//")) poster = "https:" + poster;

                items.push({
                    id: getSlugFromUrl(href) || href,
                    title: decodeHtmlEntities(title).trim(),
                    posterUrl: poster,
                    backdropUrl: poster
                });
            }
        });

        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 999 }
        });
    } catch (e) {
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
        var $doc = _$(html);
        var isWpApi = url && url.includes("/wp-json/wp/v2/posts");
        var title = "", poster = "", description = "";

        if (isWpApi) {
            var posts = JSON.parse(html);
            if (!posts || posts.length === 0) return JSON.stringify({ servers: [] });
            var post = posts[0];
            title = post.title ? post.title.rendered : "";
            description = post.excerpt ? post.excerpt.rendered.replace(/<[^>]*>/g, "").trim() : "";
            
            if (post.jetpack_featured_media_url) poster = post.jetpack_featured_media_url;
            else if (post.featured_media_src_url) poster = post.featured_media_src_url;
            else if (post.yoast_head_json && post.yoast_head_json.og_image && post.yoast_head_json.og_image.length > 0) {
                poster = post.yoast_head_json.og_image[0].url;
            }
            html = post.content ? post.content.rendered : ""; // Override html cho bước quét tập
        } else {
            title = $doc.find('meta[property="og:title"]').attr("content") || $doc.find("h1").text() || "";
            poster = $doc.find('meta[property="og:image"]').attr("content") || $doc.find(".post-content img").attr("src") || "";
            description = $doc.find('meta[property="og:description"]').attr("content") || "";
        }

        title = decodeHtmlEntities(title.replace(" - Siêu Tầm Phim", "").trim());
        
        var servers = [];
        var groupRegex = /data-server=['"]([^'"]+)['"]/gi;
        var usedServer = {};
        var m;

        // Quét tìm server và GIẢI MÃ trực tiếp link ở Detail (Giải quyết vấn đề iOS)
        while ((m = groupRegex.exec(html)) !== null) {
            var serverId = m[1];
            if (usedServer[serverId]) continue;
            usedServer[serverId] = true;

            var epBlockRegex = new RegExp('data-server=["\']' + serverId + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i");
            var epBlockMatch = html.match(epBlockRegex);
            
            if (epBlockMatch) {
                var rawEpisodes = decodeHtmlEntities(epBlockMatch[2]);
                var epRegex = /{"([^"]+)","([^"]+)"}/g;
                var epMatch;
                var episodes = [];
                var j = 1;
                
                while ((epMatch = epRegex.exec(rawEpisodes)) !== null) {
                    var rawSrc = epMatch[1];
                    var epName = epMatch[2] || "Tập " + j;

                    // Giải mã XOR 42 link
                    var decrypted = "";
                    for (var i = 0; i < rawSrc.length; i++) {
                        decrypted += String.fromCharCode(rawSrc.charCodeAt(i) ^ 42);
                    }
                    decrypted = decrypted.replace(/https?:\/\/(short\.ink|short\.icu)\//g, "https://abyssplayer.com/");

                    // Phân luồng data cụ thể tránh iOS lỗi isEmbed
                    var finalId = "";
                    if (decrypted.indexOf("abyssplayer.com") > -1 || decrypted.indexOf("abyss.to") > -1) {
                        var vMatch = decrypted.match(/(?:[?&]v=|\/)([a-zA-Z0-9_-]+)(?:[?&]|$)/);
                        var videoId = vMatch ? vMatch[1] : "";
                        finalId = "https://sc.k-20.xyz/stream/series/clbpx:lo2b09rr074-2q1390mfi:" + videoId + ".json|data:abyss";
                    } else if (decrypted.indexOf(".m3u8") > -1) {
                        finalId = decrypted + "|data:m3u8";
                    } else if (decrypted.indexOf(".mp4") > -1 || decrypted.indexOf("blogspot.com") > -1 || decrypted.indexOf("blogger.com") > -1) {
                        finalId = decrypted + "|data:mp4";
                    } else {
                        finalId = decrypted + "|data:embed";
                    }

                    episodes.push({
                        id: finalId,
                        name: epName,
                        slug: "tap-" + j
                    });
                    j++;
                }
                if (episodes.length > 0) {
                    servers.push({
                        name: serverId.toUpperCase(),
                        episodes: episodes
                    });
                }
            }
        }

        // Fallback
        if (servers.length === 0) {
            var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8)/i);
            var iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/i);
            var fallbackId = "";
            
            if (m3u8Match) {
                fallbackId = m3u8Match[1] + "|data:m3u8";
            } else if (iframeMatch) {
                fallbackId = iframeMatch[1] + "|data:embed";
            }

            if (fallbackId) {
                servers.push({
                    name: "Mặc định",
                    episodes: [{ id: fallbackId, name: "Full", slug: "full" }]
                });
            }
        }

        return JSON.stringify({
            id: url,
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: decodeHtmlEntities(description),
            servers: servers,
            quality: "HD",
            status: "Hoàn thành"
        });
    } catch (e) {
        log("Error Detail: " + e.message);
        return JSON.stringify({ servers: [] });
    }
}

// ========================================================
// PARSE VIDEO (STREAM)
// ========================================================

function parseDetailResponse(html, url, datasend) {
    var realUrl = url.split("|")[0];
    var type = datasend || "";
    
    if (!type) {
        var pipeIdx = url.indexOf("|data:");
        if (pipeIdx > -1) {
            type = url.substring(pipeIdx + 6);
        }
    }

    if (type === "abyss") {
        return JSON.stringify({
            url: realUrl,
            isEmbed: true,
            datasend: "abyss_json",
            headers: { "Referer": BASE_URL + "/" }
        });
    } else if (type === "m3u8") {
        return JSON.stringify({
            url: realUrl,
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: { "Referer": BASE_URL + "/" }
        });
    } else if (type === "mp4") {
        // Trả trực tiếp isEmbed: false cho luồng MP4 / Blogger để iOS Play được ngay lập tức
        return JSON.stringify({
            url: realUrl,
            isEmbed: false,
            mimeType: "video/mp4",
            headers: { "Referer": BASE_URL + "/" }
        });
    } else {
        return JSON.stringify({
            url: realUrl,
            isEmbed: true,
            headers: { "Referer": BASE_URL + "/" }
        });
    }
}

function parseEmbedResponse(html, url, datasend) {
    if (datasend === "abyss_json") {
        try {
            var data = JSON.parse(html);
            var stream = data.streams[0].url;
            return JSON.stringify({
                url: stream + "#.m3u8",
                mimeType: "application/x-mpegURL",
                isEmbed: false,
                headers: {
                    "Referer": "https://sc.k-20.xyz/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });
        } catch (e) {
            return JSON.stringify({ url: "", isEmbed: false });
        }
    }
    return JSON.stringify({ url: "", isEmbed: false });
}

// ========================================================
// HELPERS & ENGINE 
// ========================================================

function decodeHtmlEntities(str) {
    if (!str) return "";
    return str
        .replace(/&#8211;/g, "-").replace(/&#8212;/g, "-")
        .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
        .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
        .replace(/&#038;/g, "&").replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ").trim();
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

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

            let remainingText = html.slice(lastIndex).trim();
            if (remainingText && stack.length > 0) {
                let parentId = stack[stack.length - 1];
                let textId = nodes.length;
                nodes.push({ id: textId, tag: "#text", text: remainingText, attrs: {}, childrenIds: [], parentId: parentId });
                nodes[parentId].childrenIds.push(textId);
            }
        } catch (err) {
            // Ignore
        }
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
                    let targetClass = c.substring(1);
                    if (!elClasses.includes(targetClass)) return false;
                }
            }
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
                if (matchSingleSelector(current, selector, nodes)) {
                    results.push(current);
                }
            }
            if (current.childrenIds) {
                for (let cid of current.childrenIds) {
                    search(cid, depth + 1);
                }
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
                            if (!addedIds.has(r.id)) {
                                addedIds.add(r.id);
                                nextLevelNodes.push(r);
                            }
                        }
                    }
                    currentNodes = nextLevelNodes;
                    if (currentNodes.length === 0) break;
                }
                return currentNodes;
            }
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
            let matched = [];
            let addedIds = new Set();
            for (let el of this.elements) {
                let res = querySelectorAll(el, selector, this.nodes);
                for (let r of res) {
                    if (!addedIds.has(r.id)) {
                        addedIds.add(r.id);
                        matched.push(r);
                    }
                }
            }
            return new MiniJQ(matched, this.nodes);
        },
        text: function() {
            if (this.elements.length === 0) return "";
            return getNodeText(this.elements[0], this.nodes, 0);
        },
        attr: function(name) {
            if (this.elements.length === 0 || !this.elements[0].attrs) return "";
            return this.elements[0].attrs[name] || "";
        },
        each: function(callback) {
            this.elements.forEach((el, index) => {
                let jqEl = new MiniJQ([el], this.nodes);
                callback.call(jqEl, index, jqEl);
            });
            return this;
        },
        first: function() {
            return new MiniJQ(this.elements.length > 0 ? [this.elements[0]] : [], this.nodes);
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

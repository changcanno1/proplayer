// =============================================================================
// VAAPP Plugin: HHPanda (Original Logic)
// =============================================================================

var BASEURL = "https://hhpanda.st";
var LOGGER = false;

function getManifest() {
    return JSON.stringify({
        "id": "hhpanda",
        "name": "[ANIME] HHPanda",
        "description": "Anime siêu hay.",
        "version": "1.6.5",
        "info": "",
        "baseUrl": BASEURL,
        "iconUrl": BASEURL + "/wp-content/uploads/2024/10/apple-touch-icon.png",
        "isEnabled": true,
        "adblock": false,
        "type": "ANIME",
        "playerType": "embed"
    });
}

function log(msg) {
    if (LOGGER == "true") {
        if (typeof console !== 'undefined' && console.log) {
            console.log("[" + BASEURL.replace(/^(https?:\/\/)?(www\.)?/, "") + "]: " + msg);
        }
    }
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/hoan-thanh", "title": "Phim Hoàn Thành", "type": "Horizontal" },
        { "slug": "/most-viewed", "title": "Phim Xem Nhiều", "type": "Horizontal" },
        { "slug": "/the-loai/tu-tien", "title": "Tu Tiên", "type": "Horizontal" },
        { "slug": "/the-loai/do-thi", "title": "Đô thị", "type": "Horizontal" },
        { "slug": "/moi-cap-nhat/", "title": "Phim Mới", "type": "Grid" }
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
        var menulist = buildMenu(listurl, "filter");
        return JSON.stringify({ category: menulist });
    } catch (e) {
        log("getFilterConfig[err]:\n " + e);
        return JSON.stringify({ category: [] });
    }
}

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }

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

        var resultUrl = BASEURL;
        if (path) {
            resultUrl += path;
        }
        if (page > 1) {
            resultUrl += "/page/" + page;
        }
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        return finalUrl;
    } catch (e) {
        var fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var resUrl = "";
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                var page = parseInt(filters.page) || 1;
                if (page > 1) {
                    resUrl = BASEURL + "/page/" + page + "?s=" + encodeURIComponent(keyword);
                } else {
                    resUrl = BASEURL + "?s=" + encodeURIComponent(keyword);
                }
            } catch (jsonErr) {
                resUrl = BASEURL + "?s=" + encodeURIComponent(keyword);
            }
        } else {
            resUrl = BASEURL + "?s=" + encodeURIComponent(keyword);
        }
        return resUrl;
    } catch (e) {
        return BASEURL + "?s=" + encodeURIComponent(keyword || "");
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

function fixHref(href) {
    try {
        if (!href) return '';
        let cleanHref = href.trim();
        const ignorePattern = /^(#|https?:\/\/|\/\/|mailto:|tel:|javascript:|data:|blob:)/i;
        if (ignorePattern.test(cleanHref)) return cleanHref;
        if (cleanHref.startsWith('/')) {
            try {
                const urlObj = new URL(BASEURL);
                return urlObj.origin + cleanHref;
            } catch (e) {
                return BASEURL + cleanHref;
            }
        }
        return BASEURL + cleanHref;
    } catch (e) {
        return href || '';
    }
}

function isValidMediaUrl(url) {
    try {
        if (!url || typeof url !== 'string') return false;
        var cleanUrl = url.trim();
        if (cleanUrl.indexOf('_spEsc') > -1 ||
            cleanUrl.indexOf("'+") > -1 ||
            cleanUrl.indexOf("+'") > -1 ||
            cleanUrl.indexOf("${") > -1 ||
            cleanUrl.indexOf("javascript:") > -1) {
            return false;
        }
        var httpPattern = /^https?:\/\/[^\s"'<>+]+$/i;
        return httpPattern.test(cleanUrl);
    } catch (e) {
        return false;
    }
}

function parseListResponse(html, $url) {
    try {
        var items = [];
        var $doc = _$(html);
        $doc.find("article").each(function() {
            var href = this.find("a").attr("href");
            href = fixHref(href);
            var title = this.find("a").attr("title") || this.find(".entry-title").text();
            var src = this.find("img").attr("src") || this.find("img").attr("data-src");
            src = fixHref(src);

            var episode_current = this.find(".episode").text().trim() || this.find(".status").text().trim();
            var quality = this.find(".status").text().trim() || this.find(".mc__score").text().trim();

            if (isValidMediaUrl(href)) {
                var cleanThumb = (src || "").replace(/&amp;/g, '&').trim();
                if (cleanThumb && cleanThumb.indexOf('http') !== 0) {
                    cleanThumb = 'https:' + cleanThumb;
                }

                items.push({
                    "id": href.trim(),
                    "title": (title || "").trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality || "",
                    "lang": "",
                    "episode_current": episode_current || ""
                });
            }
        });

        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": 1, "totalPages": 999 }
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
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        var id = idMatch ? idMatch[1] : (url || "");
        var $doc = _$(html);
        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/_.]+)/.exec(html);
            slug = slugMatch2 ? slugMatch2[1] : "";
        }

        var lurl = "";
        var limg = "";
        var lname = "Đang cập nhật...";
        var ldes = "Không có mô tả.";
        var ldirec = "";
        var lactor = "";
        var lduran = "";
        var status = "";
        var category = "";
        var episode_current = "";
        var rating = 5;
        
        var rmatch = html.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lurl = rmatch[1];

        rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];

        if (limg.indexOf("//") === 0) {
            limg = "https:" + limg;
        } else if (limg.indexOf("http") === -1) {
            limg = BASEURL + limg;
        }
        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];

        var ldes = $doc.find(".video-item").find("article").text() || $doc.find(".entry-content p").text();
        var year = 2026;
        var extra = "";

        status = $doc.find(".hh3d-info").find("span").parent().text(" - ");

        var categoryResult = [];
        $doc.find(".list_cate").find("a").each(function() {
            var link = this.attr("href") || this.find("a").attr("href");
            var name = this.text().replace(/\s+/g, ' ').trim();
            if (name && link) {
                categoryResult.push("[" + name + "](" + link + ")");
            }
        });
        category = categoryResult.join(", ");
        episode_current = $doc.find("span.new-ep").text();

        var servers = [];
        $doc.find("#halim-list-server").find(".halim-server").each(function() {
            var $namesv = this.find(".halim-server-name").text();
            var items = [];
            this.find(".halim-list-eps").each(function() {
                this.find("a").each(function() {
                    var id = this.attr("href");
                    var name = this.attr("title") || this.text().trim();
                    var slug = this.attr("data-ep");
                    items.push({ id: fixHref(id), name: name, slug: slug });
                });
            });
            servers.push({ name: $namesv, episodes: items });
        });
        servers = sortEpisodesByName(servers);

        return JSON.stringify({
            id: id,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "HD",
            year: year,
            rating: rating,
            status: status,
            category: category,
            episode_current: episode_current,
            servers: servers,
            duration: lduran || "",
            casts: lactor || "",
            director: ldirec || "",
            datasend: lname,
            extra: extra
        });

    } catch (e) {
        return JSON.stringify({ id: url || "error", title: "error", servers: [] });
    }
}

function sortEpisodesByName(data) {
    try {
        if (!Array.isArray(data)) return data;
        data.forEach(function(server) {
            if (server.episodes && Array.isArray(server.episodes)) {
                server.episodes.sort(function(a, b) {
                    var nameA = a.name || '';
                    var nameB = b.name || '';
                    var matchA = nameA.match(/\d+(\.\d+)?/);
                    var matchB = nameB.match(/\d+(\.\d+)?/);
                    var numA = matchA ? parseFloat(matchA[0]) : null;
                    var numB = matchB ? parseFloat(matchB[0]) : null;
                    if (numA !== null && numB !== null) {
                        if (numA !== numB) return numA - numB;
                    }
                    if (numA !== null) return -1;
                    if (numB !== null) return 1;
                    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
                });
            }
        });
        return data;
    } catch (e) {
        return data;
    }
}

function checkRaw(scriptStr, returnFixed) {
    try {
        if (!scriptStr || typeof scriptStr !== 'string') return scriptStr || "";
        var lines = scriptStr.split('\n');
        var fixedLines = [];
        for (var i = 0; i < lines.length; i++) {
            var currentLine = lines[i];
            var fixedLine = currentLine;
            if (returnFixed) {
                fixedLine = fixedLine.replace(/\r/g, "").replace(/\t/g, "  "); 
            }
            fixedLines.push(fixedLine);
        }
        return returnFixed ? fixedLines.join('\n') : scriptStr;
    } catch (e) {
        return scriptStr;
    }
}

function parseDetailResponse(html, pageUrl, datasend) {
    try {
        var $doc = _$(html);
        var currentlink = $doc.find("meta[property='og:url']").attr("content") || pageUrl;
        var matchC = currentlink.match(/sv(\d+)/i);
        var currentserver = 1;
        var currenttap = 1;
        var matchA = currentlink.match(/(tap-\d+)/i);
        
        if (matchC && matchC[1]) currentserver = matchC[1];
        if (matchA && matchA[1]) currenttap = matchA[1];
        if (currentlink.indexOf("-full") > -1) currenttap = "tap-full";
        
        var currentid = $doc.find("#main-contents").attr("data-id");
        if (!currentid) {
            var matchId = html.match(/data-id="(\d+)"/);
            currentid = matchId ? matchId[1] : "";
        }
        
        // Mặc định lấy server đầu tiên (bỏ qua cố gắng mix/bắt 4K)
        var typecurrent = $doc.find("#halim-ajax-list-server").find("span:first").attr("data-type") || "pro";
        
        var framelink = `https://hhpanda.st/player/player.php?action=dox_ajax_player&post_id=${currentid}&chapter_st=${currenttap}&type=${typecurrent}&sv=${currentserver}`;
        
        var $dataSv = {};
        $dataSv.movieid = currentid;
        $dataSv.serverhientai = currentserver;
        $dataSv.hqhientai = typecurrent;
        $dataSv.taphientai = currenttap;

        var servers = [];
        $doc.find(".halim-server").each(function() {
            var $namesv = this.find(".halim-server-name").text();
            var type = 1;
            var maxEpi = this.find(".halim-episode").find("a").length;

            this.find(".halim-episode").each(function() {
                type = this.find("a:first").attr("data-sv");
            });

            servers.push({
                name: $namesv,
                type: type,
                maxEpi: maxEpi
            });
        });
        $dataSv.servers = servers;
        $dataSv.name = datasend || "";

        var serverHQ = [];
        $doc.find("#halim-ajax-list-server").find("span").each(function() {
            var name = this.text();
            var type = this.attr("data-type");
            serverHQ.push({ nname: name, type: type });
        });
        $dataSv.HQ = serverHQ;

        var bypassJs = checkRaw(customJS($dataSv), true);
        
        return JSON.stringify({
            url: framelink,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": pageUrl,
                "Block-Ads": false,
                "Custom-Js": bypassJs
            },
            subtitles: []
        });
    } catch (e) {
        return JSON.stringify({ url: pageUrl, isEmbed: false });
    }
}

function customJS(config) {
    const configStr = JSON.stringify(config);

    return `
(function() {
    const IS_IN_IFRAME = (window.self !== window.top);
    const CONFIG = ${configStr};

    const LoggerModule = {
        log: function(msg, showToast = true) {
            console.log(msg);
            if (IS_IN_IFRAME) {
                try {
                    window.top.postMessage({ type: 'PHIMHDCS_CROSS_LOG', msg: msg, showToast: showToast }, '*');
                } catch(e) {}
            } else {
                try {
                    if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
                        window.SnifferBridge.log(msg);
                    }
                } catch (e) {}
                if (showToast) this.showToast(msg);
            }
        },
        showToast: function(msg) {
            if (IS_IN_IFRAME || !document.body) return;
            let container = document.getElementById('v-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'v-toast-container';
                container.style.cssText = 'position: fixed; bottom: 20px; left: 20px; z-index: 9999999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
                document.body.appendChild(container);
            }

            const toastItem = document.createElement('div');
            toastItem.style.cssText = 'background: rgba(15, 15, 15, 0.9); color: #fff; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; border-left: 4px solid #e50914; opacity: 1; transition: all 0.25s ease;';
            toastItem.textContent = msg;
            container.appendChild(toastItem);

            setTimeout(() => {
                toastItem.style.opacity = '0';
                setTimeout(() => { if (toastItem.parentNode) toastItem.parentNode.removeChild(toastItem); }, 300);
            }, 4000);
        }
    };

    if (IS_IN_IFRAME) {
        const style = document.createElement('style');
        style.textContent = 'html, body { width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: #000 !important; } .jwplayer, #player, video, iframe { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; object-fit: contain !important; }';
        (document.head || document.documentElement).appendChild(style);

        function triggerFullScreen() {
            const el = document.documentElement || document.body;
            if (el.requestFullscreen) { el.requestFullscreen().catch(() => {}); }
            else if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen().catch(() => {}); }
        }

        let isFullScreenTriggered = false;
        let playerCheckInterval = setInterval(() => {
            try {
                if (typeof window.jwplayer === 'function') {
                    const playerInstance = window.jwplayer();
                    if (playerInstance && typeof playerInstance.getState === 'function') {
                        const state = playerInstance.getState();
                        if (state === 'paused' || state === 'idle') playerInstance.play(true);

                        if (state === 'playing' && !isFullScreenTriggered) {
                            isFullScreenTriggered = true;
                            triggerFullScreen();
                        }

                        playerInstance.on('play', function() {
                            if (!isFullScreenTriggered) {
                                isFullScreenTriggered = true;
                                triggerFullScreen();
                            }
                        });

                        playerInstance.on('pause', function() { playerInstance.play(true); });
                        clearInterval(playerCheckInterval);
                    }
                }
            } catch(e) {}
        }, 1000);

        setTimeout(() => { clearInterval(playerCheckInterval); }, 10000);

        window.addEventListener('keydown', function(e) {
            if (e.keyCode === 33) { e.preventDefault(); window.top.postMessage({ type: 'PHIMHDCS_CHANGE_EP', dir: -1 }, '*'); }
            if (e.keyCode === 34) { e.preventDefault(); window.top.postMessage({ type: 'PHIMHDCS_CHANGE_EP', dir: 1 }, '*'); }
            if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 8) { e.preventDefault(); window.top.postMessage({ type: 'PHIMHDCS_FOCUS_HOST', dir: (e.keyCode === 38 ? 'UP' : 'DOWN') }, '*'); }
        }, true);

        return;
    }

    function initPhimHDCS(oldIframe) {
        if (window.__PHIMHDCS_INITED__) return;
        window.__PHIMHDCS_INITED__ = true;

        const style = document.createElement('style');
        style.textContent = \`
            html, body { overflow: hidden !important; margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; background: #000 !important; }
            #v-player-wrapper { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; background-color: #000; z-index: 999; }
            .v-styled-iframe { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; border: none !important; }
            #v-ui-layer { transition: opacity 0.3s ease; opacity: 1; pointer-events: auto; }
            #v-ui-layer.v-hidden { opacity: 0 !important; pointer-events: none !important; }
            #v-title-badge { position: absolute; top: 12px; left: 12px; z-index: 9999; background: rgba(0,0,0,0.8); color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 14px; font-weight: bold; }
            #v-control-bar { position: absolute; top: 12px; right: 12px; z-index: 9999; display: flex; gap: 8px; background: rgba(0,0,0,0.8); padding: 6px 12px; border-radius: 6px; }
            .v-nav-btn { position: absolute; top: 50%; z-index: 9999; transform: translateY(-50%); background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.2); width: 46px; height: 46px; border-radius: 50%; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .v-nav-btn:hover, .v-btn:hover, .v-grid-item:hover, .v-btn:focus, .v-grid-item:focus { background: #e50914 !important; border-color: #fff !important; }
            #v-prev-ep { left: 2%; } #v-next-ep { right: 2%; }
            .v-btn { background: #2a2a2a; color: #fff; border: 1px solid #444; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: bold; }
            #v-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100000; display: none; align-items: center; justify-content: center; }
            .v-dialog { background: #181818; border: 1px solid #333; border-radius: 8px; width: 90%; max-width: 520px; max-height: 80vh; padding: 16px; display: none; flex-direction: column; color: #fff; }
            .v-dialog-header { font-size: 16px; font-weight: bold; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 8px; }
            .v-grid { display: flex; flex-wrap: wrap; gap: 10px; overflow-y: auto; max-height: 60vh; padding: 4px; }
            .v-grid-item { padding: 8px 16px; border-radius: 6px; text-align: center; font-weight: bold; cursor: pointer; background: #2a2a2a; color: #fff; font-size: 13px; border: 1px solid #444; }
            .v-grid-item.active { background: #e50914 !important; }
        \`;
        document.head.appendChild(style);

        let currentTapNum = parseInt(String(CONFIG.taphientai || 1).replace(/[^0-9]/g, ''), 10) || 1;
        let currentServerIndex = CONFIG.servers ? (parseInt(CONFIG.serverhientai || 1, 10) - 1) : 0;
        if (currentServerIndex < 0) currentServerIndex = 0;

        const movieName = CONFIG.name || "Đang xem phim";
        let currentIframe = oldIframe;

        const wrapper = document.createElement("div");
        wrapper.id = "v-player-wrapper";
        oldIframe.parentNode.insertBefore(wrapper, oldIframe);
        wrapper.appendChild(oldIframe);

        currentIframe.id = "v-main-frame";
        currentIframe.classList.add("v-styled-iframe");
        currentIframe.setAttribute("scrolling", "no");

        const getCleanSvName = (idx) => {
            if (!CONFIG.servers || !CONFIG.servers[idx]) return "Server " + (idx + 1);
            let name = CONFIG.servers[idx].name || CONFIG.servers[idx].title || ("Server " + (idx + 1));
            return name.replace(/^#/, '').replace(/:$/, '').trim();
        };

        const uiControls = document.createElement("div");
        uiControls.id = "v-ui-layer";
        uiControls.innerHTML = \`
            <div id="v-title-badge">\${movieName} - Tập \${currentTapNum} (\${getCleanSvName(currentServerIndex)})</div>
            <div id="v-control-bar">
                <button class="v-btn" id="v-remote-detail" title="Tự động đổi Server">Chi tiết 🔄</button>
                <button class="v-btn" id="v-server-trigger">\${getCleanSvName(currentServerIndex)} ▼</button>
                <button class="v-btn" id="v-ep-trigger">Tập \${currentTapNum} ▼</button>
            </div>
            <button class="v-nav-btn" id="v-prev-ep">❮</button>
            <button class="v-nav-btn" id="v-next-ep">❯</button>

            <div id="v-modal-overlay">
                <div class="v-dialog" id="v-dialog-ep">
                    <div class="v-dialog-header"><span>Danh Sách Tập</span><button class="v-btn" id="v-close-ep">✕</button></div>
                    <div class="v-grid" id="v-grid-ep"></div>
                </div>

                <div class="v-dialog" id="v-dialog-sv">
                    <div class="v-dialog-header"><span>Chọn Server</span><button class="v-btn" id="v-close-sv">✕</button></div>
                    <div class="v-grid" id="v-grid-sv"></div>
                </div>
            </div>
        \`;
        wrapper.appendChild(uiControls);

        let uiHideTimeout = null;
        const uiLayer = document.getElementById("v-ui-layer");
        const overlay = document.getElementById("v-modal-overlay");

        function resetUiTimeout() {
            uiLayer.classList.remove("v-hidden");
            clearTimeout(uiHideTimeout);
            uiHideTimeout = setTimeout(() => {
                if (overlay.style.display !== "flex") {
                    uiLayer.classList.add("v-hidden");
                }
            }, 10000);
        }

        ['mousemove', 'touchstart', 'click', 'keydown'].forEach(evtType => {
            window.addEventListener(evtType, resetUiTimeout, { passive: true });
        });
        resetUiTimeout();

        function updateTitleBadge() {
            const svName = getCleanSvName(currentServerIndex);
            document.getElementById("v-title-badge").textContent = \`\${movieName} - Tập \${currentTapNum} (\${svName})\`;
            document.getElementById("v-ep-trigger").textContent = \`Tập \${currentTapNum} ▼\`;
            document.getElementById("v-server-trigger").textContent = \`\${svName} ▼\`;
        }

        const dialogEp = document.getElementById("v-dialog-ep");
        const dialogSv = document.getElementById("v-dialog-sv");

        function openModal(type) {
            overlay.style.display = "flex";
            if (type === "ep") {
                renderEpList();
                dialogEp.style.display = "flex";
                dialogSv.style.display = "none";
            } else {
                renderSvList();
                dialogSv.style.display = "flex";
                dialogEp.style.display = "none";
            }
        }

        function closeModal() {
            overlay.style.display = "none";
            dialogEp.style.display = "none";
            dialogSv.style.display = "none";
            resetUiTimeout();
        }

        function renderEpList() {
            const grid = document.getElementById("v-grid-ep");
            grid.innerHTML = "";
            let maxEpi = (CONFIG.servers && CONFIG.servers[currentServerIndex] && CONFIG.servers[currentServerIndex].maxEpi) ? parseInt(CONFIG.servers[currentServerIndex].maxEpi, 10) : 40;

            for (let i = 1; i <= maxEpi; i++) {
                const item = document.createElement("div");
                item.className = "v-grid-item" + (i === currentTapNum ? " active" : "");
                item.textContent = "Tập " + i;
                item.onclick = () => { closeModal(); changeEpisode(i); };
                grid.appendChild(item);
            }
        }

        function renderSvList() {
            const grid = document.getElementById("v-grid-sv");
            grid.innerHTML = "";
            if (!CONFIG.servers) return;

            CONFIG.servers.forEach((sv, idx) => {
                const item = document.createElement("div");
                item.className = "v-grid-item" + (idx === currentServerIndex ? " active" : "");
                item.textContent = getCleanSvName(idx);
                item.onclick = () => { closeModal(); changeServer(idx); };
                grid.appendChild(item);
            });
        }

        document.getElementById("v-ep-trigger").onclick = () => openModal("ep");
        document.getElementById("v-server-trigger").onclick = () => openModal("sv");
        document.getElementById("v-close-ep").onclick = closeModal;
        document.getElementById("v-close-sv").onclick = closeModal;

        document.getElementById("v-remote-detail").onclick = () => {
            if (!CONFIG.servers || CONFIG.servers.length <= 1) {
                LoggerModule.log('⚠️ Không có server khác để chuyển đổi!');
                return;
            }
            let nextServerIndex = (currentServerIndex + 1) % CONFIG.servers.length;
            changeServer(nextServerIndex);
        };

        function buildPlayerUrl(targetEp, svIndex) {
            let postId = CONFIG.movieid || CONFIG.post_id || CONFIG.id || "";
            let typeQuality = CONFIG.hqhientai || "pro";
            
            let svVal = (svIndex + 1);
            if (CONFIG.servers && CONFIG.servers[svIndex]) {
                svVal = CONFIG.servers[svIndex].sv || CONFIG.servers[svIndex].type || (svIndex + 1);
            }
            return \`https://hhpanda.st/player/player.php?action=dox_ajax_player&post_id=\${postId}&chapter_st=tap-\${targetEp}&type=\${typeQuality}&sv=\${svVal}\`;
        }

        function changeEpisode(targetEp) {
            currentTapNum = targetEp;
            updateTitleBadge();
            let newUrl = buildPlayerUrl(currentTapNum, currentServerIndex);
            LoggerModule.log('⏭️ Đổi Tập ' + targetEp);
            currentIframe.src = newUrl;
        }

        function changeServer(svIndex) {
            if (!CONFIG.servers || !CONFIG.servers[svIndex]) return;
            currentServerIndex = svIndex;
            updateTitleBadge();
            let newUrl = buildPlayerUrl(currentTapNum, currentServerIndex);
            LoggerModule.log('🔄 Đang đổi sang Server: ' + getCleanSvName(svIndex));
            currentIframe.src = newUrl;
        }

        document.getElementById("v-prev-ep").onclick = () => changeEpisode(currentTapNum - 1);
        document.getElementById("v-next-ep").onclick = () => changeEpisode(currentTapNum + 1);

        window.addEventListener('message', function(event) {
            if (!event.data) return;
            if (event.data.type === 'PHIMHDCS_CROSS_LOG') {
                LoggerModule.log(event.data.msg, event.data.showToast);
            } else if (event.data.type === 'PHIMHDCS_CHANGE_EP') {
                changeEpisode(currentTapNum + event.data.dir);
            }
        });
    }

    function findAndWrapIframe() {
        const existingIframe = document.querySelector('iframe');
        if (existingIframe) {
            initPhimHDCS(existingIframe);
            return;
        }
        const observer = new MutationObserver((mutations, obs) => {
            const iframeFound = document.querySelector('iframe');
            if (iframeFound) {
                obs.disconnect();
                initPhimHDCS(iframeFound);
            }
        });
        observer.observe(document.documentElement || document, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', findAndWrapIframe, { once: true });
    } else {
        findAndWrapIframe();
    }
})();
    `;
}

function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    return JSON.stringify(buildMenu(listurl));
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
function parseEmbedResponse() { return "{}"; }

function getLISTmenu() {
    return `[{"link":"/moi-cap-nhat/","name":"Phim Mới"},{"link":"/the-loai/tu-tien","name":"Tu Tiên"},{"link":"/the-loai/kiem-hiep","name":"Kiếm Hiệp"},{"link":"/the-loai/co-trang","name":"Cổ Trang"},{"link":"/the-loai/huyen-huyen","name":"Huyền Huyễn"},{"link":"/the-loai/khoa-huyen","name":"Khoa Huyễn"},{"link":"/the-loai/ky-ao","name":"Kỳ Ảo"},{"link":"/the-loai/huyen-nghi","name":"Huyền Nghi"},{"link":"/the-loai/canh-ky","name":"Cạnh Kỹ"},{"link":"/the-loai/da-su","name":"Dã Sử"},{"link":"/the-loai/do-thi","name":"Đô Thị"},{"link":"/the-loai/dong-nhan","name":"Đồng Nhân"}]`;
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
        } else if(typeStr === "filter"){
            menuItem = { "value": link, "name": name}; 
        } else { 
            menuItem = { "slug": link, "name": name }; 
        } 
        menulist.push(menuItem); 
    } 
    return menulist; 
}

// =============================================================================
// HELPER: MiniJQ
// =============================================================================
function _$(htmlOrBlock){if(htmlOrBlock&&typeof htmlOrBlock==='object'&&htmlOrBlock.elements){return htmlOrBlock}var instance={sourceHtml:typeof htmlOrBlock==='string'?htmlOrBlock:'',elements:Array.isArray(htmlOrBlock)?htmlOrBlock:(htmlOrBlock?[htmlOrBlock]:[]),find:function(selector){if(selector.indexOf(',')!==-1){var results=[];var selectors=selector.split(',').map(function(s){return s.trim()});for(var s=0;s<selectors.length;s++){if(selectors[s]==="")continue;var subInstance=this.find(selectors[s]);for(var r=0;r<subInstance.elements.length;r++){var element=subInstance.elements[r];if(results.indexOf(element)===-1){results.push(element)}}}var multiInstance=_$(results);multiInstance.sourceHtml=this.sourceHtml;return multiInstance}var results=[];var contentFilter="";if(selector.indexOf(":content(")!==-1){var contentMatch=selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if(contentMatch){contentFilter=contentMatch[1]||contentMatch[2]||contentMatch[3]||"";selector=selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"")}}var attrNameFilter="";var attrValueFilter="";var attrOperator="=";var hasAttrFilter=false;var attrMatch=selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if(attrMatch){hasAttrFilter=true;attrNameFilter=attrMatch[1];attrOperator=attrMatch[2];attrValueFilter=attrMatch[3]||attrMatch[4]||attrMatch[5]||"";selector=selector.replace(/\[.*?\]/,"")}var notSelector="";if(selector.indexOf(":not(")!==-1){var notMatch=selector.match(/:not\(([^)]+)\)/);if(notMatch){notSelector=notMatch[1];selector=selector.replace(/:not\([^)]+\)/,"")}}var isFirstFilter=selector.indexOf(":first")!==-1;var isLastFilter=selector.indexOf(":last")!==-1;selector=selector.replace(/:first|:last/g,"");var targetTagName="";var targetId="";var targetClasses=[];var selectorToParse=selector.trim();if(selectorToParse!==""){var idIndex=selectorToParse.indexOf('#');if(idIndex!==-1){var afterId=selectorToParse.substring(idIndex+1);var nextDot=afterId.indexOf('.');targetId=nextDot===-1?afterId:afterId.substring(0,nextDot);selectorToParse=selectorToParse.substring(0,idIndex)+(nextDot===-1?"":"."+afterId.substring(nextDot+1))}var classParts=selectorToParse.split('.');var possibleTag=classParts.shift();if(possibleTag){targetTagName=possibleTag.toLowerCase()}targetClasses=classParts.filter(function(c){return c.length>0})}for(var i=0;i<this.elements.length;i++){var currentHtml=this.elements[i];var pos=0;var subResults=[];while((pos=currentHtml.indexOf('<',pos))!==-1){if(currentHtml.charAt(pos+1)==='/'||currentHtml.charAt(pos+1)==='!'){pos++;continue}var endOpenTag=-1;var insideQuote=false;var quoteChar='';for(var j=pos+1;j<currentHtml.length;j++){var char=currentHtml.charAt(j);if((char==='"'||char==="'")&&currentHtml.charAt(j-1)!=='\\'){if(!insideQuote){insideQuote=true;quoteChar=char}else if(char===quoteChar){insideQuote=false}}if(char==='>'&&!insideQuote){endOpenTag=j;break}}if(endOpenTag===-1)break;var fullOpenTag=currentHtml.substring(pos,endOpenTag+1);var tagMatch=fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/);var currentTagName=tagMatch?tagMatch[1].toLowerCase():"";var isMatched=true;if(targetTagName&&targetTagName!==currentTagName){isMatched=false}var getClassAttr=fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var classMatchStr=getClassAttr?(getClassAttr[1]||getClassAttr[2]||getClassAttr[3]||""):"";var getIdAttr=fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var idMatchStr=getIdAttr?(getIdAttr[1]||getIdAttr[2]||getIdAttr[3]||""):"";if(isMatched&&targetId&&idMatchStr!==targetId){isMatched=false}if(isMatched&&targetClasses.length>0){if(classMatchStr){var currentClasses=classMatchStr.trim().split(/\s+/);for(var c=0;c<targetClasses.length;c++){if(currentClasses.indexOf(targetClasses[c])===-1){isMatched=false;break}}}else{isMatched=false}}if(isMatched&&hasAttrFilter){var actualValue="";if(attrNameFilter==="class"){actualValue=classMatchStr}else if(attrNameFilter==="id"){actualValue=idMatchStr}else{var getAnyAttr=fullOpenTag.match(new RegExp(attrNameFilter+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));actualValue=getAnyAttr?(getAnyAttr[1]||getAnyAttr[2]||getAnyAttr[3]||""):""}var attrExists=fullOpenTag.search(new RegExp(attrNameFilter+'\\s*=','i'))!==-1;if(!attrExists){isMatched=false}else{if(attrOperator==="="){if(attrNameFilter==="class"){var classes=actualValue.trim().split(/\s+/);if(classes.indexOf(attrValueFilter)===-1)isMatched=false}else if(actualValue!==attrValueFilter){isMatched=false}}else if(attrOperator==="*="){if(actualValue.indexOf(attrValueFilter)===-1)isMatched=false}else if(attrOperator==="^="){if(actualValue.indexOf(attrValueFilter)!==0)isMatched=false}else if(attrOperator==="$="){if(actualValue.slice(-attrValueFilter.length)!==attrValueFilter)isMatched=false}}}if(isMatched){var startTagPos=pos;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if(selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var scanPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while(depth>0&&scanPos<currentHtml.length){var nextOpen=currentHtml.indexOf(openStr,scanPos);var nextClose=currentHtml.indexOf(closeStr,scanPos);if(nextClose===-1){scanPos=currentHtml.length;break}if(nextOpen!==-1&&nextOpen<nextClose){depth++;scanPos=nextOpen+openStr.length}else{depth--;scanPos=nextClose+closeStr.length;if(depth===0)endTagPos=nextClose+closeStr.length}}}var foundBlock=currentHtml.substring(startTagPos,endTagPos);if(contentFilter){var pureText=foundBlock.replace(/<[^>]+>/g,"").trim();if(pureText.indexOf(contentFilter)===-1){pos=endTagPos;continue}}if(notSelector){var isNotClass=notSelector.indexOf('.')===0;var isNotId=notSelector.indexOf('#')===0;var notValue=notSelector.substring(1);var hasNot=false;if(isNotClass&&classMatchStr.indexOf(notValue)!==-1)hasNot=true;if(isNotId&&idMatchStr.indexOf(notValue)!==-1)hasNot=true;if(!hasNot)subResults.push(foundBlock)}else{subResults.push(foundBlock)}pos=endTagPos}else{pos++}}if(isFirstFilter&&subResults.length>0)subResults=[subResults[0]];if(isLastFilter&&subResults.length>0)subResults=[subResults[subResults.length-1]];results=results.concat(subResults)}var newInstance=_$(results);newInstance.sourceHtml=this.sourceHtml||currentHtml;return newInstance},each:function(callback){for(var i=0;i<this.elements.length;i++){var childInstance=_$(this.elements[i]);childInstance.sourceHtml=this.sourceHtml;callback.call(childInstance,i,this.elements[i])}return this},eq:function(index){if(index<0)index=this.elements.length+index;var matchedElement=this.elements[index];this.elements=matchedElement?[matchedElement]:[];return this},attr:function(attrName){if(this.elements.length===0)return"";var elem=this.elements[0];var getAttr=elem.match(new RegExp(attrName+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));return getAttr?(getAttr[1]||getAttr[2]||getAttr[3]||""):""},html:function(){if(this.elements.length===0)return"";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if(start>0&&end>start)return elem.substring(start,end);return""},textAll:function(separator){if(this.elements.length===0)return"";var sep=typeof separator==='string'?separator:" ";var allTexts=[];for(var i=0;i<this.elements.length;i++){var elem=this.elements[i];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if(start>0&&end>start){var content=elem.substring(start,end);var pureText=content.replace(/<\/?[^>]+(>|$)/g,"");var cleanText=pureText.split('\n').map(function(item){return item.trim()}).filter(function(item){return item!==''}).join(' ');if(cleanText!==''){allTexts.push(cleanText)}}}return allTexts.join(sep)},text:function(){if(this.elements.length===0)return"";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if(start>0&&end>start){var content=elem.substring(start,end);var pureText=content.replace(/<\/?[^>]+(>|$)/g,"");return pureText.trim()}return""}};return instance}

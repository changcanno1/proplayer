/**
 * VAAPP native plugin: Phim Nhua
 * WordPress REST API + HLS player config embedded in movie pages.
 */
var BASEURL = "https://phimnhua.online";
var API = BASEURL + "/wp-json/wp/v2";
var UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36";

function getManifest() {
    return JSON.stringify({
        id: "film2",
        name: "Film 2 [MOVIE]",
        version: "1.0.0",
        BASEURL: BASEURL,
        referrer: BASEURL + "/",
        info: "Nguồn phim siêu mượt có phụ đề rời.",
        iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/icon/film2.png",
        headers: { "User-Agent": UA },
        isEnabled: true,
        isAdult: false,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "exoplayer",
        adblock: true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "home", title: "Mới cập nhật", type: "Grid", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới cập nhật", slug: "home" },
        { name: "Hành động", slug: "action" },
        { name: "Hài", slug: "comedy" },
        { name: "Kinh dị", slug: "horror" },
        { name: "Tình cảm", slug: "romance" },
        { name: "Hoạt hình", slug: "animation" }
    ]);
}

function getUrlList(slug, filtersJson) {
    var filters = parseJson(filtersJson, {});
    var page = parseInt(filters.page, 10) || 1;
    if (slug && slug !== "home") {
        return BASEURL + "/the-loai/" + encodeURIComponent(slug) + "/" + (page > 1 ? "page/" + page + "/" : "");
    }
    return BASEURL + "/" + (page > 1 ? "page/" + page + "/" : "");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = parseJson(filtersJson, {});
    var page = parseInt(filters.page, 10) || 1;
    return BASEURL + "/?s=" + encodeURIComponent(keyword || "") + (page > 1 ? "&paged=" + page : "");
}

function getUrlDetail(slug, datasend) {
    if (!slug) return "";
    if (/^https?:\/\//i.test(slug)) return slug;
    return BASEURL + "/xem-phim/" + encodeURIComponent(slug.replace(/^\/+|\/+$/g, "")) + "/";
}

function getUrlCategories() { return API + "/genre?per_page=100"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function parseListResponse(raw, url) {
    try {
        if (/\s*</.test(String(raw || ""))) return parseHtmlList(raw, url);
        var data = JSON.parse(raw || "[]");
        if (!Array.isArray(data)) data = [];
        return JSON.stringify({
            items: data.map(toMovie).filter(Boolean),
            pagination: {
                currentPage: pageFromUrl(url),
                totalPages: totalPagesFromHeaders(url),
                totalItems: data.length
            }
        });
    } catch (e) {
        return emptyList();
    }
}

function parseSearchResponse(raw, url) { return parseListResponse(raw, url); }

function parseHtmlList(html, url) {
    var items = [];
    var cardRegex = /<div[^>]+class=["'][^"']*\bcard\b[^"']*["'][^>]*>([\s\S]*?)(?=<div[^>]+class=["'][^"']*\bcard\b[^"']*["']|<\/section>)/gi;
    var match;
    while ((match = cardRegex.exec(html))) {
        var card = match[0];
        var link = matchValue(card, /href=["']([^"']*\/xem-phim\/[^"']+)["']/i);
        var image = matchValue(card, /<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
        var title = matchValue(card, /<h3[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
        if (!link || !title) continue;
        var slug = link.replace(/\/$/, "").split("/").pop();
        image = normalizeImage(image);
        items.push({ id: slug, title: stripHtml(title), posterUrl: image, backdropUrl: image, year: yearFromSlug(slug) });
    }
    var current = pageFromUrl(url);
    var hasNext = /(?:page\/\d+|paged=\d+)/i.test(html) && !/(?:class=["'][^"']*next[^"']*["'][^>]*disabled)/i.test(html);
    return JSON.stringify({ items: items, pagination: { currentPage: current, totalPages: hasNext ? 9999 : current, totalItems: items.length, itemsPerPage: items.length } });
}

function parseMovieDetail(raw, url, datasend) {
    try {
        if (String(raw || "").indexOf("<html") >= 0 || String(raw || "").indexOf("PLAYER_CONFIG") >= 0) {
            return JSON.stringify(buildHtmlDetail(raw, url));
        }
        var data = JSON.parse(raw || "[]");
        var movie = Array.isArray(data) ? data[0] : data;
        if (!movie) return "null";
        return JSON.stringify(buildDetail(movie));
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(raw, url, datasend) {
    var text = raw || "";
    var video = matchValue(text, /videoUrl\s*:\s*["']([^"']+)["']/i);
    var subtitle = matchValue(text, /subtitleUrl\s*:\s*["']([^"']+)["']/i);
    if (!video) video = matchValue(text, /https?:\\?\/\\?\/[^"'\s]+\.m3u8[^"'\s]*/i);
    video = unescapeUrl(video);
    subtitle = unescapeUrl(subtitle);
    var result = {
        url: video || url || "",
        mimeType: "application/x-mpegURL",
        isEmbed: false,
        headers: { "User-Agent": UA, "Referer": BASEURL + "/" }
    };
    if (subtitle) result.subtitles = [{
        url: subtitle,
        lang: "vi",
        language: "vi",
        label: "Tiếng Việt",
        mimeType: "text/vtt"
    }];
    return JSON.stringify(result);
}

function parseCategoriesResponse(raw) {
    try {
        var data = JSON.parse(raw || "[]");
        return JSON.stringify((Array.isArray(data) ? data : []).map(function (x) {
            return { name: x.name || "", slug: x.slug || "" };
        }));
    } catch (e) { return "[]"; }
}

function toMovie(movie) {
    if (!movie || !movie.slug) return null;
    var image = embeddedImage(movie);
    return {
        id: movie.slug,
        title: decodeHtml(movie.title && movie.title.rendered || movie.slug),
        posterUrl: image,
        backdropUrl: image,
        description: stripHtml(movie.content && movie.content.rendered || ""),
        year: yearFromSlug(movie.slug)
    };
}

function buildDetail(movie) {
    var item = toMovie(movie) || {};
    item.originName = item.title;
    item.servers = [{ name: "Film 2", episodes: [{ name: "Tập 1", slug: movie.slug, id: movie.link || "" }] }];
    return item;
}

function buildHtmlDetail(html, url) {
    var pageUrl = normalizeImage(canonicalUrl(html) || url || "");
    var slugMatch = pageUrl.match(/\/xem-phim\/([^/]+)\/?$/i);
    var slug = slugMatch ? slugMatch[1] : pageUrl;
    var image = matchValue(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    var title = matchValue(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    var description = matchValue(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    return {
        id: slug,
        title: decodeHtml(title || slug),
        originName: decodeHtml(title || slug),
        posterUrl: unescapeUrl(image).replace("admincp.phimnhua.com", "phimnhua.online"),
        backdropUrl: unescapeUrl(image).replace("admincp.phimnhua.com", "phimnhua.online"),
        description: decodeHtml(description),
        year: yearFromSlug(slug),
        servers: [{ name: "Film 2", episodes: [{ name: "Tập 1", slug: slug, id: pageUrl }] }]
    };
}

function embeddedImage(movie) {
    var media = movie._embedded && movie._embedded["wp:featuredmedia"];
    var image = media && media[0] && (media[0].source_url || media[0].media_details && media[0].media_details.sizes && media[0].media_details.sizes.full && media[0].media_details.sizes.full.source_url);
    if (image) return normalizeImage(image);
    image = matchValue(movie.yoast_head || "", /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    return image ? normalizeImage(image) : "";
}

function normalizeImage(image) {
    return unescapeUrl(image).replace("admincp.phimnhua.com", "phimnhua.online");
}

function matchValue(text, regex) {
    var match = text.match(regex);
    return match && match[1] || "";
}

function canonicalUrl(html) {
    return matchValue(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
        matchValue(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
}

function unescapeUrl(value) {
    return String(value || "").replace(/\\\//g, "/").replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
}

function decodeHtml(value) {
    return String(value || "").replace(/&#8211;|&#x2013;/gi, "-").replace(/&#8217;|&#x2019;/gi, "'").replace(/&amp;/g, "&").replace(/&#([0-9]+);/g, function (_, n) { return String.fromCharCode(parseInt(n, 10)); });
}

function stripHtml(value) { return decodeHtml(String(value || "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim(); }
function yearFromSlug(slug) { var match = String(slug).match(/(?:^|-)((?:19|20)\d{2})(?:-|$)/); return match ? parseInt(match[1], 10) : 0; }
function pageFromUrl(url) {
    var value = String(url || "");
    var match = value.match(/\/page\/(\d+)/i) || value.match(/[?&](?:page|paged)=(\d+)/i);
    return match ? parseInt(match[1], 10) : 1;
}
function totalPagesFromHeaders(url) { return 9999; }
function parseJson(value, fallback) { try { return JSON.parse(value || "{}"); } catch (e) { return fallback; } }
function emptyList() { return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } }); }
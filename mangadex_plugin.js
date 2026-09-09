var iddomain = "mangadex";
var BASEURL = "https://api.mangadex.org";
var BASELINK = BASEURL;

var DEFAULT_LIMIT = 24;
var CONTENT_RATINGS = ["safe", "suggestive", "erotica"];

// Proxy ảnh (luôn bật)
var PROXY_URL = "https://proxyimg.alokillgtv.workers.dev/?referer=" + encodeURIComponent("https://mangadex.org") + "&url=";

function proxyImage(rawUrl) {
    if (!rawUrl) return "";
    if (rawUrl.indexOf("proxyimg.alokillgtv.workers.dev") !== -1) return rawUrl;
    return PROXY_URL + encodeURIComponent(rawUrl);
}

// Hàm lấy cover (không gọi API, dùng URL trực tiếp + proxy)
function getCoverUrl(mangaId, coverId) {
    if (!coverId) return proxyImage("https://mangadex.org/img/logo.png");
    var raw = "https://uploads.mangadex.org/covers/" + mangaId + "/" + coverId + ".jpg";
    return proxyImage(raw);
}

// ================== MANIFEST ==================
function getManifest() {
    return JSON.stringify({
        "id": "mangadex",
        "name": "[MANGA] MangaDex",
        "version": "1.1",
        "author": "Alokillgtv",
        "info": "",
        "headers": {
            "Referer": "https://mangadex.org",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        "baseUrl": "https://mangadex.org",
        "iconUrl": "https://mangadex.org/favicon.ico",
        "isEnabled": true,
        "isAdult": false,
        "adblock": false,
        "orientation": "auto",
        "type": "MANGA",
        "subtitleCat": false
    });
}

// ================== MENU TRANG CHỦ ==================
function getHomeSections() {
    return JSON.stringify([
        { "slug": "/manga?order[latestUploadedChapter]=desc", "title": "🆕 Mới cập nhật (Việt)", "type": "Horizontal" },
        { "slug": "/manga?order[followedCount]=desc", "title": "🔥 Truyện hot (Việt)", "type": "Horizontal" },
        { "slug": "/manga?order[rating]=desc", "title": "⭐ Đánh giá cao (Việt)", "type": "Grid" }
    ]);
}

// ================== DANH SÁCH THỂ LOẠI ==================
function getLISTmenu() {
    try {
        var res = httpRequest(BASEURL + "/manga/tag", { method: "GET" });
        if (!res || !res.isSuccessful) {
            log("Không lấy được thể loại, dùng mẫu dự phòng");
            return `[{"link":"/manga?includedTags[]=action&availableTranslatedLanguage[]=vi","name":"Hành động"},{"link":"/manga?includedTags[]=adventure&availableTranslatedLanguage[]=vi","name":"Phiêu lưu"},{"link":"/manga?includedTags[]=comedy&availableTranslatedLanguage[]=vi","name":"Hài hước"},{"link":"/manga?includedTags[]=drama&availableTranslatedLanguage[]=vi","name":"Tâm lý"},{"link":"/manga?includedTags[]=fantasy&availableTranslatedLanguage[]=vi","name":"Kỳ ảo"},{"link":"/manga?includedTags[]=romance&availableTranslatedLanguage[]=vi","name":"Lãng mạn"},{"link":"/manga?includedTags[]=sci-fi&availableTranslatedLanguage[]=vi","name":"Khoa học viễn tưởng"},{"link":"/manga?includedTags[]=slice-of-life&availableTranslatedLanguage[]=vi","name":"Đời thường"}]`;
        }
        var data = JSON.parse(res.body);
        if (data.result !== "ok") return "[]";
        var tags = data.data;
        var menu = [];
        var allowedGroups = ["genre", "theme", "format"];
        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            var group = tag.attributes.group || "";
            if (allowedGroups.indexOf(group) === -1) continue;
            var nameObj = tag.attributes.name;
            var name = nameObj.vi || nameObj.en || Object.values(nameObj)[0] || "Không tên";
            menu.push({
                link: "/manga?includedTags[]=" + tag.id + "&availableTranslatedLanguage[]=vi",
                name: name
            });
        }
        menu.sort(function(a, b) { return a.name.localeCompare(b.name); });
        return JSON.stringify(menu);
    } catch (e) {
        log("getLISTmenu[err]: " + e);
        return "[]";
    }
}

// ================== TẠO URL DANH SÁCH ==================
function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "";
        if (filtersJson) {
            var fixed = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixed);
                page = parseInt(filters.page) || 1;
                if (filters.category && Array.isArray(filters.category) && filters.category.length > 0) {
                    path = filters.category[0].slug;
                }
            } catch (e) { log("parse filter lỗi: " + e); }
        }

        var url = BASEURL + (path.indexOf("/") === 0 ? "" : "/") + path;
        var offset = (page - 1) * DEFAULT_LIMIT;
        var separator = url.indexOf("?") > -1 ? "&" : "?";
        url += separator + "limit=" + DEFAULT_LIMIT + "&offset=" + offset;

        if (url.indexOf("contentRating") === -1) {
            for (var i = 0; i < CONTENT_RATINGS.length; i++) {
                url += "&contentRating[]=" + CONTENT_RATINGS[i];
            }
        }
        if (url.indexOf("availableTranslatedLanguage[]") === -1) {
            url += "&availableTranslatedLanguage[]=vi";
        }
        if (url.indexOf("includes[]") === -1) {
            url += "&includes[]=cover_art";
        }
        log("getUrlList -> " + url);
        return url;
    } catch (e) {
        log("getUrlList[err]: " + e);
        return BASEURL + "/manga?limit=" + DEFAULT_LIMIT + "&offset=0&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&availableTranslatedLanguage[]=vi&includes[]=cover_art";
    }
}

// ================== TẠO URL TÌM KIẾM ==================
function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixed = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixed);
                page = parseInt(filters.page) || 1;
            } catch (e) {}
        }
        var offset = (page - 1) * DEFAULT_LIMIT;
        var encodedKeyword = encodeURIComponent(keyword || "");
        var url = BASEURL + "/manga?title=" + encodedKeyword + "&limit=" + DEFAULT_LIMIT + "&offset=" + offset;
        for (var i = 0; i < CONTENT_RATINGS.length; i++) {
            url += "&contentRating[]=" + CONTENT_RATINGS[i];
        }
        url += "&availableTranslatedLanguage[]=vi&includes[]=cover_art";
        log("getUrlSearch -> " + url);
        return url;
    } catch (e) {
        log("getUrlSearch[err]: " + e);
        return BASEURL + "/manga?title=" + encodeURIComponent(keyword) + "&limit=" + DEFAULT_LIMIT + "&offset=0&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&availableTranslatedLanguage[]=vi&includes[]=cover_art";
    }
}

// ================== PARSE DANH SÁCH ==================
function parseListResponse(html, url) {
    try {
        console.log("LIST" + url)
        var data = JSON.parse(html);
        if (data.result !== "ok") {
            log("API trả về lỗi: " + JSON.stringify(data.errors));
            return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
        }
        var mangas = data.data;
        var items = [];
        for (var i = 0; i < mangas.length; i++) {
            var m = mangas[i];
            var attr = m.attributes;
            var title = attr.title.vi || attr.title.en || Object.values(attr.title)[0] || "Không có tiêu đề";
            var id = m.id;

            // Lấy fileName trực tiếp từ relationship cover_art
            var fileName = null;
            if (m.relationships) {
                for (var j = 0; j < m.relationships.length; j++) {
                    var rel = m.relationships[j];
                    if (rel.type === "cover_art" && rel.attributes && rel.attributes.fileName) {
                        fileName = rel.attributes.fileName;
                        break;
                    }
                }
            }

            // Tạo URL ảnh cover (nếu có fileName) hoặc ảnh mặc định
            var posterUrl = "";
            if (fileName) {
                var rawUrl = "https://uploads.mangadex.org/covers/" + id + "/" + fileName;
                // Thêm proxy để tránh hotlink
                var proxyBase = "https://proxyimg.alokillgtv.workers.dev/?referer=https://mangadex.org&url=";
                posterUrl = proxyBase + encodeURIComponent(rawUrl);
            } else {
                posterUrl = "https://mangadex.org/img/logo.png";
            }
            //log("coverUrl list: " + posterUrl);

            var latestChap = attr.latestUploadedChapter || "?";
            var status =  "Chap " + attr.lastChapter || "";
            var quality = "";
            if(attr.lastChapter){
              quality = status;
            }
            
            var year = attr.year ? String(attr.year) : "";
            
            items.push({
                id: id,
                title: title,
                quality: quality,
                episode_current: attr.status,
                posterUrl: posterUrl,
                backdropUrl: posterUrl,
                year: year,
                lang: attr.originalLanguage || ""
            });
        }

        var total = data.total || items.length;
        var totalPages = Math.ceil(total / DEFAULT_LIMIT);
        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: 1,
                totalPages: totalPages || 1
            }
        });
    } catch (e) {
        log("parseListResponse[err]: " + e);
        return JSON.stringify({
            items: [{ id: "error", title: "Lỗi tải danh sách", posterUrl: "" }],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

function parseValue(item) {
    // Lấy chuỗi name từ item (xử lý được cả khi truyền Object {name: ...} hoặc chuỗi)
    const str = typeof item === 'object' && item !== null ? String(item.name || '') : String(item);

    // Tìm tất cả các chuỗi số
    const matches = str.match(/\d+/g);

    // Nếu không chứa số
    if (!matches) {
        return {
            hasNum: false,
            mainNum: 0,
            subNum: 0,
            rawName: str
        };
    }

    return {
        hasNum: true,
        mainNum: Number(matches[0]) || 0,
        subNum: Number(matches[1]) || 0,
        rawName: str
    };
}
function getAllChapters(mangaId) {
    var allChapters = [];
    var limit = 500;
    var offset = 0;
    var total = null;
    var maxRetries = 3;

    while (true) {
        var feedUrl = BASEURL + "/manga/" + mangaId + 
            "/feed?limit=" + limit + 
            "&offset=" + offset + 
            "&translatedLanguage[]=vi" + 
            "&order[chapter]=desc" + 
            "&order[volume]=desc" + 
            "&includes[]=scanlation_group";
        
        console.log("Đang lấy chương, offset=" + offset);

        var feedRes = null;
        var retry = 0;
        while (retry < maxRetries) {
            feedRes = httpRequest(feedUrl, { 
                method: "GET", 
                headers: { "User-Agent": "Mozilla/5.0" } 
            });
            if (feedRes && feedRes.isSuccessful) break;
            retry++;
            console.log("Lỗi, thử lại lần " + retry);
        }

        if (!feedRes || !feedRes.isSuccessful) {
            console.log("Không thể lấy danh sách chương");
            break;
        }

        var feedData = JSON.parse(feedRes.body);
        if (feedData.result !== "ok") {
            console.log("API trả về lỗi: " + JSON.stringify(feedData.errors));
            break;
        }

        if (total === null) {
            total = feedData.total;
            console.log("Tổng số chương: " + total);
        }

        var chapters = feedData.data || [];
        allChapters = allChapters.concat(chapters);
        console.log("Đã lấy " + allChapters.length + "/" + total + " chương");

        if (allChapters.length >= total) break;
        offset += limit;
        if (offset >= total) break;
    }

    // Sắp xếp tăng dần theo số chương
    allChapters.sort(function(a, b) {
        var chapA = parseFloat(a.attributes.chapter) || 0;
        var chapB = parseFloat(b.attributes.chapter) || 0;
        return chapA - chapB;
    });

    return allChapters;
}

// ================== PARSE CHI TIẾT TRUYỆN ==================
function parseMovieDetail(html, url) {
    console.log("MovieURL:\n" + url)
    try {
        var data = JSON.parse(html);
        if (data.result !== "ok") throw new Error("API trả về lỗi: " + JSON.stringify(data.errors));

        if (data.data && data.data.type === "chapter") {
            var mangaRel = null;
            for (var i = 0; i < data.data.relationships.length; i++) {
                if (data.data.relationships[i].type === "manga") {
                    mangaRel = data.data.relationships[i];
                    break;
                }
            }
            if (mangaRel && mangaRel.id) {
                var mangaUrl = BASEURL + "/manga/" + mangaRel.id + "?includes[]=cover_art&includes[]=artist&includes[]=author";
                var mangaRes = httpRequest(mangaUrl, { method: "GET", headers: { "User-Agent": "Mozilla/5.0" } });
                if (mangaRes && mangaRes.isSuccessful) {
                    return parseMovieDetail(mangaRes.body, mangaUrl);
                }
            }
            throw new Error("Không tìm thấy manga từ chương này");
        }

        var manga = data.data;
        var attr = manga.attributes;
        var id = manga.id;
        var title = attr.title.vi || attr.title.en || Object.values(attr.title)[0] || "Không có tiêu đề";
        var description = attr.description ? (attr.description.vi || attr.description.en || Object.values(attr.description)[0] || "") : "";
        var status = attr.status || "";
        var year = attr.year ? String(attr.year) : "";
        var tags = attr.tags.map(function(t) {
            var name = t.attributes.name.vi || t.attributes.name.en || Object.values(t.attributes.name)[0] || "";
            return name;
        }).join(", ");

        // Lấy fileName từ relationship cover_art
        var fileName = null;
        if (manga.relationships) {
            for (var j = 0; j < manga.relationships.length; j++) {
                var rel = manga.relationships[j];
                if (rel.type === "cover_art" && rel.attributes && rel.attributes.fileName) {
                    fileName = rel.attributes.fileName;
                    break;
                }
            }
        }

        // Tạo URL ảnh cover với proxy
        var posterUrl = "";
        if (fileName) {
            var rawUrl = "https://uploads.mangadex.org/covers/" + id + "/" + fileName;
            var proxyBase = "https://proxyimg.alokillgtv.workers.dev/?referer=https://mangadex.org&url=";
            posterUrl = proxyBase + encodeURIComponent(rawUrl);
        } else {
            posterUrl = "https://mangadex.org/img/logo.png";
        }
        log("coverUrl detail: " + posterUrl);

        // Thay vì gọi một lần, gọi hàm lấy toàn bộ chương
        var chapters = getAllChapters(id);
          console.log("Tổng số chương lấy được: " + chapters.length);

        chapters.sort(function(a, b) {
            var chapA = parseFloat(a.attributes.chapter) || 0;
            var chapB = parseFloat(b.attributes.chapter) || 0;
            return chapA - chapB;
        });

        var episodes = [];
        var list_array = [];
      
        for (var i = 0; i < chapters.length; i++) {
            var ch = chapters[i];
            var chapNum = ch.attributes.chapter || (i + 1);
            var chapTitle = ch.attributes.title || "Chương " + chapNum;
            var chapId = ch.id;
            // Tạo URL at-home server đầy đủ
            var atHomeUrl = BASEURL + "/at-home/server/" + chapId;  
            list_array.push({
                url: atHomeUrl,
                name: "Chương " + chapNum + (chapTitle ? " – " + chapTitle : "")
            });
        }
        list_array.sort((a, b) => {
            const valA = parseValue(a);
            const valB = parseValue(b);

            if (!valA.hasNum && !valB.hasNum) {
                return valA.rawName.localeCompare(valB.rawName);
            }
            if (!valA.hasNum) return -1;
            if (!valB.hasNum) return 1;

            if (valA.mainNum !== valB.mainNum) {
                return valA.mainNum - valB.mainNum;
            }
            return valA.subNum - valB.subNum;
        });


        // Mã hóa base64 và gửi POST lên worker
        var list_encode = BASE64.encode(JSON.stringify(list_array));

        var slug = encodeURIComponent(url);
        var testcode = false;
        var tester = "&status=false"
        if (testcode == true) {
            var res = httpRequest(
                "https://manga.alokillgtv.workers.dev/?postslug=true&slug=" + slug, c = {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain"
                    },
                    body: list_encode
                }
            );
            if (res.isSuccessful) {
                console.log("Đã lưu thành công, response:", res.body);
                tester = "&getslug=true"
            } else {
                console.error("Lỗi khi lưu:", res.status, res.body);
            }
        }


        // Tạo episodes và servers
        var servers = [];
        var episodes = [];
        var target = "mangadex"; // giữ nguyên target
        var element = encodeURIComponent("#images_container img");
        var maxchapter = list_array.length;
        var namechapter = encodeURIComponent(title);
        var domain = encodeURIComponent(BASELINK);
        var logger = "";
        if (logger) {
            logger = "&console=true"
        }
        for (var $j = 0; $j < maxchapter; $j++) {
            var startchapter = $j;
            var linkStream = `https://manga.alokillgtv.workers.dev/?target=${target}&namechapter=${namechapter}&maxchapter=${maxchapter}&slug=${slug}&startchapter=${startchapter}&domain=${domain}&element=${element}${logger}${tester}`;

            // Lấy tên chương từ object và trích số để đặt slug
            var chapName = list_array[$j].name;
            var chapNumber = $j + 1; // mặc định
            var matchNum = chapName.match(/\d+/);
            if (matchNum) {
                chapNumber = matchNum[0];
            } else {
                // thử tìm trong url (dạng chapter-xxx)
                var urlMatch = list_array[$j].url.match(/chapter[-_]?(\d+)/i);
                if (urlMatch) chapNumber = urlMatch[1];
            }
            var namepg = "Chương " + chapNumber;

            episodes.push({
                id: list_array[$j].url,
                name: namepg,
                slug: "chuong-" + chapNumber
            });
        }

        servers.push({
            name: "Đọc Truyện",
            episodes: episodes
        });




        console.log("Server:\n" + JSON.stringify(servers))
        
        var result = {
            id: id,
            title: title,
            originName: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            quality: "",
            year: year,
            rating: "",
            status: "Tình trạng: " + (status === "completed" ? "Hoàn thành" : status === "ongoing" ? "Đang tiến hành" : status === "cancelled" ? "Đã hủy" : status || "Chưa rõ"),
            category: tags,
            episode_current: "Số chương (Việt): " + chapters.length,
            servers: servers,
            duration: "",
            casts: "",
            director: "",
            country: "",
            lang: "",
            extra: "",
            datasend: list_encode
        };

        return JSON.stringify(result);
    } catch (e) {
        log("parseMovieDetail[err]: " + e);
        return JSON.stringify({
            id: "error",
            title: "Lỗi tải chi tiết",
            description: "Không thể lấy thông tin truyện.\n" + e.message,
            servers: []
        });
    }
}
// ================== PARSE STREAM (proxy ảnh chương) ==================
  function parseDetailResponse(html, url, list_encode) {
    
     //console.log("parseDetailResponse dang xu ly: " + url);
     console.log("Datasend: \n" + html);
    try {
      var images = [];
      let errorLink = "https://vaxplugin.alokillgtv.workers.dev/Plugins/manga/error.png"
      var data = JSON.parse(html);
      const baseUrl = data.baseUrl;
      const chapter = data.chapter;
      const hash = chapter.hash;
      const files = chapter.dataSaver || chapter.data || [];

      if (files.length === 0) {
        throw new Error("Không có trang ảnh nào");
      }

      // Tạo URL ảnh với proxy
      images = files.map(file => {
        const raw = baseUrl + "/data-saver/" + hash + "/" + file;
        return raw;
      });
      console.log(`MangaDex: Tìm thấy ${images.length} ảnh.`);

      var $return = JSON.stringify({
        url: url,
        isEmbed: false,
        images: images,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
           "Block-Ads": "false",
          "Referer": BASEURL
        }     
      });
      //console.log("Return Parse:\n" + $return)
      return $return
    } catch (e) {
      console.log("parseDetailResponse[err]:\n " + e);
      return JSON.stringify({ 
        url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
        mimeType: "video/mp4", 
        isEmbed: false, headers: {}, subtitles: [] 
      });
    }
  }

// ================== PARSE EMBED ==================
function parseEmbedResponse(html, url) {
    return JSON.stringify({
        url: url,
        isEmbed: false,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://mangadex.org"
        }
    });
}

// ================== CÁC HÀM HỖ TRỢ ==================
function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;

    if (slug.indexOf("mangadex://chapter/") === 0) {
        var chapId = slug.replace("mangadex://chapter/", "");
        return BASEURL + "/chapter/" + chapId + "?includes[]=scanlation_group&includes[]=manga";
    }

    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(slug)) {
        return BASEURL + "/manga/" + slug + "?includes[]=cover_art&includes[]=artist&includes[]=author";
    }

    return BASEURL + "/manga/f98660a1-d2e2-461c-960d-7bd13df8b76d?includes[]=cover_art&includes[]=artist&includes[]=author";
}

function getUrlCategories() {
    return BASEURL + "/manga/tag";
}
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function parseCategoriesResponse(apiResponseJson) {
    try {
        var data = JSON.parse(apiResponseJson);
        if (data.result !== "ok") return "[]";
        var tags = data.data;
        var menu = [];
        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            var name = tag.attributes.name.vi || tag.attributes.name.en || Object.values(tag.attributes.name)[0] || "Không tên";
            if (tag.attributes.group !== "genre") continue;
            menu.push({ slug: "/manga?includedTags[]=" + tag.id + "&availableTranslatedLanguage[]=vi", title: name, type: "Horizontal" });
        }
        return JSON.stringify(menu.slice(0, 30));
    } catch (e) {
        log("parseCategoriesResponse[err]: " + e);
        return "[]";
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function getPrimaryCategories() {
    return getLISTmenu();
}

function getFilterConfig() {
    var menu = JSON.parse(getLISTmenu());
    return JSON.stringify({ category: menu });
}

function buildMenu(menuStr, type) {
    var menuArray = JSON.parse(menuStr);
    var menulist = [];
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

function log(msg) {
    console.log("[MangaDex] " + msg);
}

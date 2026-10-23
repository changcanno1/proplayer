var iddomain = "rophim";
var BASEURL = "https://www.rophim.soy";
var BASEAPI = "https://rophim.alokillgtv.workers.dev";
var BASELINK = BASEAPI;
var NEWDOMAIN = true;
var popup_html = "";

// ===== CẤU HÌNH & METADATA =====
function getManifest() {
    try {
        return JSON.stringify({
            "id": "rophim",
            "name": "RP Mới [MOVIE]",
            "version": "3.7",
            "author": "Alokillgtv",
            "baseUrl": BASEURL,
            "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/rophim.png",
            "isEnabled": true,
            "isAdult": false,
            "adblock": true,
            "type": "MOVIE",
            "layoutType": "VERTICAL",
            "subtitleCat": false,
            "popup_html": popup_html,
            "playerType": "auto" // Giữ "auto" để vào màn hình Chọn tập, tránh tự động chạy
        });
    } catch (e) {
        return JSON.stringify({
            "id": "loiapp",
            "name": "Plugin bị lỗi cài đặt",
            "version": "2.0",
            "info": "Plugin đang bị lỗi: \n" + e,
            "baseUrl": "http://vkey.vn/",
            "iconUrl": "https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/novahd.png",
            "isEnabled": true,
            "type": "MOVIE",
            "playerType": "auto"
        });
    }
}

if (NEWDOMAIN) {
    if (typeof httpRequest === "function") {
        var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {
            method: "POST"
        });
        if (res && res.isSuccessful) {
            var resobj = JSON.parse(res.body);
            if (resobj[iddomain] && resobj[iddomain].new) {
                BASEURL = resobj[iddomain].new;
            }
        }
    }
}
console.log("BASEURL " + BASEURL);

function log(msg) {
    console.log(msg);
}

// Helper bóc tách dữ liệu từ quy ước dấu |data:
function getPipeData(rawUrl) {
    if (!rawUrl) return "";
    var idx = rawUrl.indexOf("|");
    if (idx < 0) return "";
    var s = rawUrl.substring(idx + 1).replace(/^\s+/, "");
    if (s.toLowerCase().indexOf("data:") === 0) {
        s = s.substring(5);
    }
    return s;
}

// ===== HÀM MENU LIST =====
function getHomeSections() {
    localStorage.clear();
    return JSON.stringify([
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=1&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Chiếu Rạp", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=completed&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Trọn Bộ", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=1&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Phim Lẻ", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=2&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Phim Bộ", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=4&rating=&networks=&productions=&sort=release_date", "title": "Thuyết Minh", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=2&rating=&networks=&productions=&sort=release_date", "title": "Lồng Tiếng", "type": "Horizontal"},
        {"slug": "/api/v1/movie/filterV2?q=&countries=&genres=&years=&custom_year=&quality=&type=&status=&is_shown_in_theater=&exclude_status=Upcoming&versions=&rating=&networks=&productions=&sort=release_date", "title": "Phim Mới", "type": "Grid"}
    ]);
}

function getLISTmenu() {
    try {
        return `[
            {"link": "/api/v1/movie/filterV2?genres=jwVGrXo2&sort=release_date", "name": "Âm Nhạc"},
            {"link": "/api/v1/movie/filterV2?genres=8EVM6e0Y&sort=release_date", "name": "Anime"},
            {"link": "/api/v1/movie/filterV2?genres=PLeAbJ90&sort=release_date", "name": "Báo Thù"},
            {"link": "/api/v1/movie/filterV2?genres=aQe4Q9jJ&sort=release_date", "name": "Bí Ẩn"},
            {"link": "/api/v1/movie/filterV2?genres=Yo9mpemM&sort=release_date", "name": "Boy's Love"},
            {"link": "/api/v1/movie/filterV2?genres=8PVjqjXN&sort=release_date", "name": "Boys Love"},
            {"link": "/api/v1/movie/filterV2?genres=8EVMmGV0&sort=release_date", "name": "Cảm Động"},
            {"link": "/api/v1/movie/filterV2?genres=bPVJnlVp&sort=release_date", "name": "Thích Kịch"},
            {"link": "/api/v1/movie/filterV2?genres=xD96gXZK&sort=release_date", "name": "Chiến Tranh"},
            {"link": "/api/v1/movie/filterV2?genres=OzXk8VW1&sort=release_date", "name": "Chiếu Rạp"},
            {"link": "/api/v1/movie/filterV2?genres=bPVJl9p5&sort=release_date", "name": "Chính kịch"},
            {"link": "/api/v1/movie/filterV2?genres=q6eEE4eQ&sort=release_date", "name": "Chính Sự"},
            {"link": "/api/v1/movie/filterV2?genres=8PVjvVNA&sort=release_date", "name": "Chính Trị"},
            {"link": "/api/v1/movie/filterV2?genres=WoVal4XP&sort=release_date", "name": "Chữa Lành"},
            {"link": "/api/v1/movie/filterV2?genres=dQeple4Z&sort=release_date", "name": "Chuyển Thể"},
            {"link": "/api/v1/movie/filterV2?genres=x7VOkVj8&sort=release_date", "name": "Cổ Điển"},
            {"link": "/api/v1/movie/filterV2?genres=GxVo3VAn&sort=release_date", "name": "Cổ Trang"},
            {"link": "/api/v1/movie/filterV2?genres=o2el76VG&sort=release_date", "name": "Công Sở"},
            {"link": "/api/v1/movie/filterV2?genres=xOX0Re0B&sort=release_date", "name": "Cung Đấu"},
            {"link": "/api/v1/movie/filterV2?genres=lxewn4VK&sort=release_date", "name": "Cuối Tuần"},
            {"link": "/api/v1/movie/filterV2?genres=WoVa4XPj&sort=release_date", "name": "Dã Sử"},
            {"link": "/api/v1/movie/filterV2?genres=mjeRvdeq&sort=release_date", "name": "Dịp Lễ"},
            {"link": "/api/v1/movie/filterV2?genres=RweWMqXr&sort=release_date", "name": "Đô Thị"},
            {"link": "/api/v1/movie/filterV2?genres=K8V1MMVJ&sort=release_date", "name": "Đời Sống"},
            {"link": "/api/v1/movie/filterV2?genres=RweWkEer&sort=release_date", "name": "Đời Thường"},
            {"link": "/api/v1/movie/filterV2?genres=0398EXk2&sort=release_date", "name": "Gay Cấn"},
            {"link": "/api/v1/movie/filterV2?genres=jaendDXo&sort=release_date", "name": "Gia Đấu"},
            {"link": "/api/v1/movie/filterV2?genres=RweWEXrM&sort=release_date", "name": "Gia đình"},
            {"link": "/api/v1/movie/filterV2?genres=z8VPz9mG&sort=release_date", "name": "Giả Tưởng"},
            {"link": "/api/v1/movie/filterV2?genres=mjeRaDVq&sort=release_date", "name": "Giật gân"},
            {"link": "/api/v1/movie/filterV2?genres=Wy9D2Vn4&sort=release_date", "name": "Hài Hước"},
            {"link": "/api/v1/movie/filterV2?genres=w0ezvedE&sort=release_date", "name": "Hành Động"},
            {"link": "/api/v1/movie/filterV2?genres=P6XKaved&sort=release_date", "name": "Hành Sự"},
            {"link": "/api/v1/movie/filterV2?genres=P6XKv9d8&sort=release_date", "name": "Hình Sự"},
            {"link": "/api/v1/movie/filterV2?genres=QyXNlerW&sort=release_date", "name": "Hoạt Hình"},
            {"link": "/api/v1/movie/filterV2?genres=NrXgAeva&sort=release_date", "name": "Học Đường"},
            {"link": "/api/v1/movie/filterV2?genres=gNebg89E&sort=release_date", "name": "Hồi Hội"},
            {"link": "/api/v1/movie/filterV2?genres=WoVaKZ9P&sort=release_date", "name": "Hồi Hộp"},
            {"link": "/api/v1/movie/filterV2?genres=aQe4nQXj&sort=release_date", "name": "Hôn Nhân"},
            {"link": "/api/v1/movie/filterV2?genres=bPVJnPVp&sort=release_date", "name": "Huyền Huyền"},
            {"link": "/api/v1/movie/filterV2?genres=mZVvnV8R&sort=release_date", "name": "Khoa Học"},
            {"link": "/api/v1/movie/filterV2?genres=OAed519D&sort=release_date", "name": "Kịch Tính"},
            {"link": "/api/v1/movie/filterV2?genres=Wy9Dz2Vn&sort=release_date", "name": "Kiếm Hiệp"},
            {"link": "/api/v1/movie/filterV2?genres=o2elOVGK&sort=release_date", "name": "Kinh Dị"},
            {"link": "/api/v1/movie/filterV2?genres=NrXgZ59v&sort=release_date", "name": "Kinh Điển"},
            {"link": "/api/v1/movie/filterV2?genres=1WeLjXAK&sort=release_date", "name": "Kỳ Ảo"},
            {"link": "/api/v1/movie/filterV2?genres=K8V1M4VJ&sort=release_date", "name": "Lãng Mạn"},
            {"link": "/api/v1/movie/filterV2?genres=PMeQb91K&sort=release_date", "name": "Lãng mạn"},
            {"link": "/api/v1/movie/filterV2?genres=RrXYnV8l&sort=release_date", "name": "LGBTQ+"},
            {"link": "/api/v1/movie/filterV2?genres=PLeAJ907&sort=release_date", "name": "Lịch Sử"},
            {"link": "/api/v1/movie/filterV2?genres=28e3RLVZ&sort=release_date", "name": "Nghịch Tập"},
            {"link": "/api/v1/movie/filterV2?genres=w0ezDrXd&sort=release_date", "name": "Ngôn Tình"},
            {"link": "/api/v1/movie/filterV2?genres=KYVZW6eZ&sort=release_date", "name": "Ngược Luyện"},
            {"link": "/api/v1/movie/filterV2?genres=GxVo5Y9A&sort=release_date", "name": "Nữ Chủ"},
            {"link": "/api/v1/movie/filterV2?genres=QyXNvJXr&sort=release_date", "name": "Nữ Cường"},
            {"link": "/api/v1/movie/filterV2?genres=aQe4odVj&sort=release_date", "name": "Phá Án"},
            {"link": "/api/v1/movie/filterV2?genres=OAed5W9D&sort=release_date", "name": "Pháp Lý"},
            {"link": "/api/v1/movie/filterV2?genres=DOX75eKx&sort=release_date", "name": "Phiêu Lưu"},
            {"link": "/api/v1/movie/filterV2?genres=8EVMB6e0&sort=release_date", "name": "Phim Chính Kịch"},
            {"link": "/api/v1/movie/filterV2?genres=Yo9mEp9m&sort=release_date", "name": "Phim Ngắn"},
            {"link": "/api/v1/movie/filterV2?genres=P6XKaoed&sort=release_date", "name": "Quyền Mưu"},
            {"link": "/api/v1/movie/filterV2?genres=RweWMEXr&sort=release_date", "name": "Sắp Chiếu"},
            {"link": "/api/v1/movie/filterV2?genres=K8V1YMVJ&sort=release_date", "name": "Siêu Anh Hùng"},
            {"link": "/api/v1/movie/filterV2?genres=mZVv2nV8&sort=release_date", "name": "Siêu Nhiên"},
            {"link": "/api/v1/movie/filterV2?genres=PMeQ6b91&sort=release_date", "name": "Sitcom"},
            {"link": "/api/v1/movie/filterV2?genres=q6eEDVQa&sort=release_date", "name": "Tài liệu"},
            {"link": "/api/v1/movie/filterV2?genres=m4eyZr9O&sort=release_date", "name": "Tâm Linh"},
            {"link": "/api/v1/movie/filterV2?genres=OAedWVDl&sort=release_date", "name": "Tâm Lý"},
            {"link": "/api/v1/movie/filterV2?genres=mjeRDXqx&sort=release_date", "name": "Thần Thoại"},
            {"link": "/api/v1/movie/filterV2?genres=nw9qmr92&sort=release_date", "name": "Thần Tượng"},
            {"link": "/api/v1/movie/filterV2?genres=jwVGNrXo&sort=release_date", "name": "Thành Thị"},
            {"link": "/api/v1/movie/filterV2?genres=YNX5QLXL&sort=release_date", "name": "Thanh Xuân"},
            {"link": "/api/v1/movie/filterV2?genres=YNX5L9LM&sort=release_date", "name": "Thể Thao"},
            {"link": "/api/v1/movie/filterV2?genres=xOX0ZEe0&sort=release_date", "name": "Thôn Quê"},
            {"link": "/api/v1/movie/filterV2?genres=QyXN6lXr&sort=release_date", "name": "Thương Trường"},
            {"link": "/api/v1/movie/filterV2?genres=28e30p9Z&sort=release_date", "name": "Tiên Hiệp"},
            {"link": "/api/v1/movie/filterV2?genres=DOX7Y5eK&sort=release_date", "name": "Tình bạn"},
            {"link": "/api/v1/movie/filterV2?genres=Wy9D4Y9n&sort=release_date", "name": "Tình Báo"},
            {"link": "/api/v1/movie/filterV2?genres=m4eyb9Og&sort=release_date", "name": "Tình Cảm"},
            {"link": "/api/v1/movie/filterV2?genres=NrXgPAVv&sort=release_date", "name": "Tình Tiết"},
            {"link": "/api/v1/movie/filterV2?genres=KEXxoJ9d&sort=release_date", "name": "Tội Phạm"},
            {"link": "/api/v1/movie/filterV2?genres=PMeQ3bX1&sort=release_date", "name": "Trinh Thám"},
            {"link": "/api/v1/movie/filterV2?genres=nGe2zgeK&sort=release_date", "name": "Trường Học"},
            {"link": "/api/v1/movie/filterV2?genres=K8V1MVJq&sort=release_date", "name": "Truyền hình"},
            {"link": "/api/v1/movie/filterV2?genres=m4eyQbeO&sort=release_date", "name": "Truyền Hình Thực Tế"},
            {"link": "/api/v1/movie/filterV2?genres=z8VP2z9m&sort=release_date", "name": "TVB"},
            {"link": "/api/v1/movie/filterV2?genres=m4eyZb9O&sort=release_date", "name": "Văn Phòng"},
            {"link": "/api/v1/movie/filterV2?genres=jaen4XoK&sort=release_date", "name": "Viễn Tưởng"},
            {"link": "/api/v1/movie/filterV2?genres=nw9qm692&sort=release_date", "name": "Võ Hiệp"},
            {"link": "/api/v1/movie/filterV2?genres=KYVZP9Zb&sort=release_date", "name": "Võ Thuật"},
            {"link": "/api/v1/movie/filterV2?genres=PMeQ6Y91&sort=release_date", "name": "Webtoon"},
            {"link": "/api/v1/movie/filterV2?genres=OAednWXD&sort=release_date", "name": "Xuyên Không"},
            {"link": "/api/v1/movie/filterV2?genres=jaenE4Vo&sort=release_date", "name": "Y khoa"}
        ]`;
    } catch (e) {
        log("getLISTmenu[err]:\n " + e);
        return `[{"link":"/","name":"Đang lỗi getLISTmenu()"}]`;
    }
}

// ===== HÀM TẠO URL =====
function getUrlList(slug, filtersJson) {
    var paramPage = "&page=";
    try {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var page = 1;
        var path = slug || "";
        if (filtersJson) {
            var fixedJson2 = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
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
            } catch (e) { log("getUrlList():\n" + e); }
        }
        var resultUrl = BASELINK;
        if (path) {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }
        if (page > 0 && resultUrl.indexOf("page=") === -1) {
            resultUrl += paramPage + page;
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        log("getUrlList[err]:\n " + e);
        return BASEURL;
    }
}

function getUrlSearch(keyword, filtersJson) {
    var paramSearch = "/api/v1/movie/filterV2?q=";
    var paramPage = "&page=";
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (e) { log("getUrlSearch():\n" + e); }
        }
        var encodedKeyword = encodeURIComponent(keyword || "");
        var resultUrl = BASELINK + paramSearch + encodedKeyword;
        if (page > 1) {
            resultUrl += paramPage + page;
        }
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        log("getUrlSearch[url]: \n" + finalUrl);
        return finalUrl;
    } catch (e) {
        log("getUrlSearch[err]:\n " + e);
        return BASEURL;
    }
}

// ===== HÀM TẠO KHỐI LIST PHIM =====
function parseListResponse(html, $url) {
    console.log("listURL\n" + $url);
    try {
        var $data = JSON.parse(html);
        var items = [];

        $data.result.items.forEach(function(item) {
            var type = item.type;
            var rawId = "";
            if (type == 2) {
                rawId = BASEAPI + "/api/v1/movie/seasons?mId=" + item._id;
            } else {
                rawId = BASEAPI + "/api/v1/movie/gallery/" + item._id;
            }

            var encodedItem = encodeURIComponent(JSON.stringify(item));
            var idWithPipe = rawId + "|data:" + encodedItem;

            var title = item.title || "";
            var posterurl = item.images ? item.images.posters : null;
            var poster = "";
            if (posterurl && posterurl[0]) {
                poster = "https://1testcode.alokillgtv.workers.dev/https://static.rophim.stream/vimg/400-0/" + posterurl[0].path;
            }

            var backurl = item.images ? item.images.backdrops : null;
            var background = poster;
            if (backurl && backurl[0]) {
                background = "https://1testcode.alokillgtv.workers.dev/https://static.rophim.stream/vimg/400-0/" + backurl[0].path;
            }

            var typeEpi = item.latest_episode;
            var namelang = "Vietsub";
            for (var key in typeEpi) {
                if (key == 2) namelang += "/Lồng Tiếng";
                if (key == 3) namelang += "/Thuyết Minh [MB]";
                if (key == 4) namelang += "/Thuyết Minh [MN]";
            }

            var quality = item.quality ? item.quality.toUpperCase() : "HD";
            var textstas = item.status || "";
            if (textstas) {
                textstas = textstas.replace(/on going/i, "Đang Ra")
                    .replace(/released/i, "Hoàn Thành")
                    .replace(/upcoming/i, "Sắp Ra");
            }

            if (title.length > 1) {
                items.push({
                    "id": idWithPipe,
                    "title": title,
                    "quality": quality,
                    "episode_current": textstas,
                    "posterUrl": poster,
                    "backdropUrl": background,
                    "year": item.year || "",
                    "lang": namelang,
                    "isCategory": false,
                    "isFolder": false,
                    "datasend": JSON.stringify(item)
                });
            }
        });

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 9999
            }
        });
    } catch (e) {
        log("parseListResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [{
                "id": $url || "error_url",
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

// ===== HÀM TẠO KHỐI CHI TIẾT PHIM =====
function parseMovieDetail(html, url, datasend) {
    log("parseMovieDetail[url]: \n" + url);
    try {
        var cleanUrl = (url || "").split("|")[0];
        var rawData = datasend || getPipeData(url);
        if (rawData && rawData.indexOf("%7B") === 0) {
            rawData = decodeURIComponent(rawData);
        }
        var item = JSON.parse(rawData || "{}");

        var posterurl = item.images ? item.images.posters : null;
        var posterUrl = "";
        if (posterurl && posterurl[0]) {
            posterUrl = "https://static.rp-cdn.net/vimg/300-0/" + posterurl[0].path;
        }

        var backurl = item.images ? item.images.backdrops : null;
        var backdropUrl = posterUrl;
        if (backurl && backurl[0]) {
            backdropUrl = "https://static.rp-cdn.net/vimg/1920-0/" + backurl[0].path;
        }

        var title = item.title || "";
        var description = item.overview || "";
        var merge = [];
        if (item.genres && Array.isArray(item.genres)) {
            item.genres.forEach(function(box) {
                merge.push("[" + box.name + "](/api/v1/movie/filterV2?genres=" + box._id + "&sort=release_date)");
            });
        }
        var category = merge.join(", ");
        var year = item.year || "";
        var quality = item.quality ? item.quality.toUpperCase() : "HD";
        var rating = item.rating || "";
        var country = (item.countries && Array.isArray(item.countries)) ? item.countries.map(function(c) { return c.name; }).join(", ") : "";
        var servers = [];

        if (item.type == 1) {
            var typeEpi = item.latest_episode || { "1": 1 };
            for (var key in typeEpi) {
                var namesv = "Vietsub";
                if (key == 2) namesv = "Lồng Tiếng";
                if (key == 3) namesv = "Thuyết Minh [MB]";
                if (key == 4) namesv = "Thuyết Minh [MN]";

                var embedLink = "https://api.rophim.stream/player/embed?id=" + item._id + "&ver=" + key + "&version=" + key + "|data:ver=" + key;
                servers.push({
                    name: namesv,
                    episodes: [{
                        id: embedLink,
                        name: "Full (" + namesv + ")",
                        slug: "phim-le-sv-" + key
                    }]
                });
            }
        } else {
            var seasonMV = JSON.parse(html);
            if (seasonMV && seasonMV.result && Array.isArray(seasonMV.result)) {
                var serverMap = {};
                var movieId = item._id || cleanUrl.replace(BASEAPI + "/api/v1/movie/seasons?mId=", "");

                seasonMV.result.forEach(function(season) {
                    if (season.episodes && Array.isArray(season.episodes)) {
                        season.episodes.forEach(function(ep) {
                            var epi = ep.episode_number;
                            var sesa = ep.season_number;
                            var versions = ep.versions || [];

                            versions.forEach(function(verObj) {
                                var type = verObj.type;
                                if (!serverMap[type]) {
                                    serverMap[type] = [];
                                }
                                var link = "https://api.rophim.stream/player/embed?id=" + movieId + "&episode=" + epi + "&season=" + sesa + "&version=" + type + "&ver=" + type + "|data:ver=" + type;
                                serverMap[type].push({
                                    id: link,
                                    name: "[Mùa " + sesa + "] Tập " + epi,
                                    slug: "mua-" + sesa + "-tap-" + epi + "-sv-" + type
                                });
                            });
                        });
                    }
                });

                for (var verKey in serverMap) {
                    var namesv = "Vietsub";
                    if (verKey == 2) namesv = "Lồng Tiếng";
                    else if (verKey == 3) namesv = "Thuyết Minh [MB]";
                    else if (verKey == 4) namesv = "Thuyết Minh [MN]";

                    servers.push({
                        name: namesv,
                        episodes: serverMap[verKey]
                    });
                }
            }
        }

        return JSON.stringify({
            id: cleanUrl,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: backdropUrl,
            description: description,
            quality: quality,
            year: year,
            rating: rating,
            status: "",
            category: category,
            episode_current: "",
            servers: servers,
            duration: "",
            casts: "",
            director: "",
            country: country,
            extra: "" // Giữ rỗng để không bị auto-play khi mở chi tiết phim
        });
    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: "error",
            title: "error",
            description: url + "\n" + e,
            servers: []
        });
    }
}

// ===== HÀM TẠO XỬ LÝ STREAM PHIM =====
function parseDetailResponse(html, url, datasend) {
    console.log("parseDetailResponse dang xu ly: " + url);
    try {
        var cleanUrl = (url || "").split("|")[0];
        return JSON.stringify({
            url: cleanUrl,
            isEmbed: true, 
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                "Referer": BASEURL + "/",
                "Origin": BASEURL,
                "Block-Ads": "true",
                "Block-Redirects": "true",
                "Block-Sniffer": "true", // Chặn Sniffer để ép WebView chạy
                "Custom-Js": webviewPerfectUIHelperJS()
            },
            subtitles: []
        });
    } catch (e) {
        console.log("parseDetailResponse[err]:\n " + e);
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}

// KHÔNG DÙNG CSS TRANSFORM ROTATE ĐỂ CHỐNG LỖI NGƯỢC/MÉO HÌNH - CHỈ NÂNG SUB LÊN VÙNG AN TOÀN
function webviewPerfectUIHelperJS() {
    return `(function() {
        'use strict';
        if (window.__ROPHIM_WEBVIEW_PERFECT_INIT__) return;
        window.__ROPHIM_WEBVIEW_PERFECT_INIT__ = true;

        var meta = document.createElement('meta');
        meta.charset = 'UTF-8';
        (document.head || document.documentElement).appendChild(meta);

        // CSS chuẩn, KHÔNG dùng transform xoay DOM để tránh lỗi lật ngược, méo hình trong khung dọc
        // Chỉ cần nâng phụ đề lên 12% để bảo vệ chữ khỏi phần tai thỏ / home indicator của iOS
        var style = document.createElement('style');
        style.textContent = 'html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; background: #000 !important; overflow: hidden !important; } ' +
                            '.jwplayer, #player { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; } ' +
                            'video { width: 100% !important; height: 100% !important; object-fit: contain !important; transform: none !important; } ' +
                            '.jw-captions, .jw-text-track-display { bottom: 12% !important; z-index: 9999 !important; }';
        (document.head || document.documentElement).appendChild(style);

        // Dùng API của App để giao tiếp việc tự động xoay màn hình (xoay phần cứng thay vì xoay DOM)
        function forceLandscapeOrientation() {
            try {
                if (window.SnifferBridge && typeof window.SnifferBridge.setOrientation === 'function') {
                    window.SnifferBridge.setOrientation('landscape');
                }
            } catch (e) {}
            try {
                if (screen && screen.orientation && typeof screen.orientation.lock === 'function') {
                    screen.orientation.lock('landscape').catch(function() {});
                }
            } catch (e) {}
        }
        
        forceLandscapeOrientation();

        var checkCount = 0;
        var timer = setInterval(function() {
            checkCount++;
            if (checkCount > 60) {
                clearInterval(timer);
                return;
            }
            if (typeof window.jwplayer === 'function') {
                try {
                    var player = window.jwplayer();
                    if (player && typeof player.on === 'function') {
                        clearInterval(timer);

                        var autoSetupPlayer = function() {
                            try {
                                forceLandscapeOrientation();
                                var v = document.querySelector('video');
                                if (v) {
                                    v.setAttribute('playsinline', 'true');
                                    v.setAttribute('webkit-playsinline', 'true');
                                }

                                var tracks = player.getCaptionsList ? player.getCaptionsList() : [];
                                if (tracks && tracks.length > 1) {
                                    var viIndex = -1;
                                    for (var i = 0; i < tracks.length; i++) {
                                        var label = (tracks[i].label || '').toLowerCase();
                                        if (label.indexOf('việt') !== -1 || label.indexOf('viet') !== -1 || label.indexOf('vi') !== -1) {
                                            viIndex = i;
                                            break;
                                        }
                                    }
                                    if (viIndex === -1) viIndex = 1;
                                    if (player.getCurrentCaptions && player.getCurrentCaptions() !== viIndex) {
                                        player.setCurrentCaptions(viIndex);
                                    }
                                }

                                var levels = player.getQualityLevels ? player.getQualityLevels() : [];
                                if (levels && levels.length > 0) {
                                    var maxIdx = 0, maxH = -1;
                                    for (var j = 0; j < levels.length; j++) {
                                        if (levels[j].height && levels[j].height > maxH) {
                                            maxH = levels[j].height;
                                            maxIdx = j;
                                        }
                                    }
                                    if (maxH > 0) player.setCurrentQuality(maxIdx);
                                }
                            } catch (err) {}
                        };

                        player.on('ready', autoSetupPlayer);
                        player.on('firstFrame', autoSetupPlayer);
                        player.on('captionsList', autoSetupPlayer);
                        player.on('play', autoSetupPlayer);
                    }
                } catch (e) {}
            }
        }, 300);
    })();`;
}

// ==== HIDEMENU ====
{
    function getUrlDetail(slug) {
        try {
            if (!slug) return "";
            if (slug.indexOf('http') === 0) return slug;
            var detailUrl = BASEURL + "/" + slug;
            log("getUrlDetail[url]: \n" + detailUrl);
            return detailUrl;
        } catch (e) {
            log("getUrlDetail[err]:\n " + e);
            return "";
        }
    }
    function getUrlCategories() {
        try {
            return BASEURL;
        } catch (e) {
            return "";
        }
    }
    function getUrlCountries() { return ""; }
    function getUrlYears() { return ""; }
    function parseCategoriesResponse(apiResponseJson) {
        try {
            var listurl = getLISTmenu();
            var menulist = buildMenu(listurl);
            return JSON.stringify(menulist);
        } catch (e) {
            log("parseCategoriesResponse[err]:\n " + e);
            return JSON.stringify([]);
        }
    }
    function parseCountriesResponse(html) { return "[]"; }
    function parseYearsResponse(html) { return "[]"; }
    function parseSearchResponse(html, url) {
        try {
            log("parseSearchResponse[url]: \n" + url);
            return parseListResponse(html, url);
        } catch (e) {
            log("parseSearchResponse[err]:\n " + e);
            return JSON.stringify({
                "items": [],
                "pagination": { "currentPage": 1, "totalPages": 1 }
            });
        }
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
            return JSON.stringify({ category: menulist });
        } catch (e) {
            log("getFilterConfig[err]:\n " + e);
            return JSON.stringify({ category: [] });
        }
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
}
// ==== HIDEMENU ====

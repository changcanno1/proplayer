//BASEURL = "http://vkey.vn/phimchill";
var iddomain = "phimchill"
BASEURL = "https://vkey.vn/" + iddomain;
//BASEURL = "https://phimchillhdi.im";
var popup_html = "";
function getManifest() {
    return JSON.stringify({
        "id": "phimchill",          
        "name": "Phim Chill",
        "description": "Phim online",
        "version": "3.9.8",             
        "baseUrl": BASEURL,
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/phimchill.png", 
        "isEnabled": true,
      "author": "Alokillgtv",
        "type": "MOVIE",
        "playerType": "auto"
    });
}

if (typeof httpRequest === "function") {
  var res = httpRequest("https://vaxplugin.alokillgtv.workers.dev/jsonStore/domain.json?debug=9780752&time=2323", {method: "POST"});
  if (res && res.isSuccessful) {
    var resobj = JSON.parse(res.body);
    BASEURL = resobj[iddomain + "hd"].new;   
  } else {
    BASEURL = "https://vkey.vn/" + iddomain;
  }
} else {
  BASEURL = "https://vkey.vn/" + iddomain;
}

BASELINK = BASEURL;
console.log("BASEURL " + BASEURL);


function getHomeSections() {
    return JSON.stringify([
    {
        "slug": "danh-sach/phim-chieu-rap.html",
        "title": "Phim Chiếu Rạp",
        "type": "HORIZONTAL"
    },
    {
        "slug": "danh-sach/phim-bo.html",
        "title": "Phim Bộ",
        "type": "HORIZONTAL"
    },
    {
        "slug": "danh-sach/phim-le.html",
        "title": "Phim Lẻ",
        "type": "HORIZONTAL"
    },
      {
        "slug": "danh-sach/phim-moi.html",
        "title": "Phim Mới",
        "type": "Grid"
    }]);
}

function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function getFilterConfig() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        category: menulist
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    // 1. Nếu slug đã là URL tuyệt đối thì trả về ngay
    if (slug && slug.indexOf("http") > -1) {
        return slug;
    }

    try {
        var filters = typeof filtersJson === "string" ? JSON.parse(filtersJson || "{}") : (filtersJson || {});
        var page = parseInt(filters.page) || 1;
        var path = slug || "";

        // 2. Xử lý category (hỗ trợ cả dạng Mảng lẫn Chuỗi)
        if (filters.category) {
            if (Array.isArray(filters.category) && filters.category.length > 0) {
                path = filters.category[0].slug || path;
            } else if (typeof filters.category === "string") {
                path = filters.category;
            }
        }

        // 3. Ghép URL và Query Parameter
        var url = BASEURL + (path ? "/" + path : "");
        if (page > 1) {
            url += "?page=" + page;
        }

        return url.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        var fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    var encodedKeyword = encodeURIComponent(keyword || "");
    var page = 1;

    try {
        var filters = typeof filtersJson === "string" ? JSON.parse(filtersJson || "{}") : (filtersJson || {});
        page = parseInt(filters.page) || 1;
    } catch (e) {}

    // Ghép tham số tìm kiếm dạng Query String
    var url = BASEURL + "/?search=" + encodedKeyword;
    if (page > 1) {
        url += "&page=" + page;
    }

    return url;
}

function getUrlDetail(id) {
    if (!id) return "";

    // Nếu là click vào tập phim giả (ID dạng play-...)
    if (id.indexOf("play-") === 0) {
        var playUrl = id.replace("play-", "");
        if (playUrl.indexOf('http') !== 0) playUrl = BASEURL + playUrl;
        return playUrl; // Trả về trang chiếu phim kèm ?tap=X để nạp vào parseDetailResponse
    }

    if (id.indexOf('http') === 0) return id;
    return BASEURL + id;
}

function getUrlCategories() {
    return BASEURL;
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    try {
        var items = [];
        var pattern = /(?=<article[^>]*class="[^"]*max-w-xs[^"]*")/g;
        var splitItems = html.split(pattern).filter(Boolean);

        for (var j = 1; j < splitItems.length; j++) {
            var block = splitItems[j];
            var hrefMatch = block.match(/href="([^"]+)"/i);
            if (!hrefMatch) continue;
            var id = hrefMatch[1].trim();

            var title = "";
            var altMatch = block.match(/title="([^"]+)"/i);
            if (altMatch) {
                title = altMatch[1].trim();
            } else {
                var labelMatch = block.match(/title="([^"]+)"/i);
                title = labelMatch ? labelMatch[1].trim() : "";
            }
            if (!title || title === "Video không tiêu đề") {
                continue;
            }

            var srcMatch = block.match(/img[\s\S]*?src="([^"]+)"/i);
            var posterUrl = srcMatch ? srcMatch[1].trim() : "";
            if (posterUrl.indexOf('/') === 0 && posterUrl.indexOf('//') !== 0) {
                posterUrl = BASEURL + posterUrl;
            } else if (posterUrl.indexOf('http') !== 0 && posterUrl.indexOf('//') !== 0) {
                posterUrl = BASEURL + "/" + posterUrl;
            }
            items.push({
                "id": id,
                "title": title,
                "posterUrl": posterUrl,
                "backdropUrl": posterUrl
            });
        }

        var activeRegex = /active".*?<a[^>]*>\s*(\d+)\s*<\/a>/s;
        var activeMatch = html.match(activeRegex);
        var activePage = activeMatch ? parseInt(activeMatch[1]) : 1;

        var lastPageRegex = /(\d+)\s*<\/a>\s*<\/li>\s*<li[^>]*next/s;
        var lastPageMatch = html.match(lastPageRegex);
        var lastPage = lastPageMatch ? parseInt(lastPageMatch[1]) : 1;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": activePage,
                "totalPages": lastPage,
                "totalItems": 48 * lastPage,
                "itemsPerPage": 48
            }
        });
    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(htmlContent, url) {
	try {
		// === BƯỚC 1: ĐỒNG NHẤT ID PHIM BẰNG REGEX META (Y hệt tác giả) ===
		var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) ||
			/<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
		var id = idMatch ? idMatch[1] : (url || "");
		
		var slug = "";
		if (id) {
			var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
			slug = slugMatch ? slugMatch[1] : id;
		}
		if (!slug) {
			var slugMatch2 = /\/phim\/([^/_.]+)/.exec(htmlContent);
			slug = slugMatch2 ? slugMatch2[1] : "";
		}
		
		// === BƯỚC 2: TRÍCH XUẤT THÔNG TIN PHIM ===
		var lurl = "";
		var limg = "";
		var lname = "Đang cập nhật...";
		var ldes = "Không có mô tả.";
		var ldirec = "";
		var lactor = "";
		var lduran = "";
		
		var rmatch = htmlContent.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) lurl = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) limg = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) lname = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) ldes = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="video:director"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) ldirec = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="video:actor"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) lactor = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="video:duration"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) lduran = rmatch[1];
		
		// === BƯỚC 3: QUÉT TẬP PHIM (Nếu đang ở trang Xem phim thì sẽ tìm thấy) ===
		var servers = [];
    var $doc = _$(htmlContent);
		  $doc.find('span:content("Danh|Sách")').each(function(index, el) {
			var $box = this.next();
			var $nameserver = this.text();
			var $items = [];
			
			$box.find("a").each(function(idx, bl) {
				var $link = this.attr("href");
				var $number = this.text();
				
				if ($link) {
					if ($link.indexOf('http') !== 0) {
						$link = "https://phimchillhdz.im" + ($link.startsWith('/') ?
							'' : '/') + $link;
					}
					$items.push({
						id: $link,
						name: "Tập " + $number.trim(),
						slug: "tap-" + $number.trim()
					});
				}
			});
			
			if ($items.length > 0) {
				servers.push({
					name: $nameserver.trim() || "Danh Sách OP",
					episodes: $items
				});
			}
		});
		servers.sort((a, b) => {
      const getPriority = (name) => {
        		if (name.includes("OP")) return 1; // KK Phim (PA cũ) lên đầu
        		if (name.includes("Danh Sách Vietsub")) return 2; // Ổ Phim (OP cũ) xếp thứ hai
        		if (name.includes("NC")) return 4; // Nguồn C (NC cũ) xuống cuối cùng
        		return 3; // Các nguồn còn lại (SN, v.v.) nằm giữa
    	};
        	
    return getPriority(a.name) - getPriority(b.name);
   });
		// === BƯỚC 4: NHẬN DIỆN TRANG VÀ THIẾT LẬP EXTRA ===
		var extra = "";
		
		// Nhận diện trang xem phim: URL có đuôi ".html" kèm theo "tap-" HOẶC HTML chứa danh sách tập thực tế
		var isPlayPage = /\/tap-[^/]+?\.html$/.test(url || id)
		
		if (!isPlayPage) {
			// Đang ở trang chi tiết -> Lấy link nút "Xem phim" để gán vào extra
			var playBtnMatch = _$(htmlContent).find(".text-center").find(".mx-auto").attr("href");
			if (playBtnMatch) {
				extra = playBtnMatch;
			}
		}
		// Tạo chuỗi mô tả ẩn JSON servers giống hệt tác giả
		ldes += "\r\n\r\n\r\n" + extra + "\r\n\r\n\r\n" + JSON.stringify(servers);
		
		// === BƯỚC 5: TRẢ VỀ KẾT QUẢ ĐỒNG NHẤT ID ===
		return JSON.stringify({
			id: id, // BẮT BUỘC: ID phải là slug rút gọn của bộ phim để cả 2 lần fetch khớp nhau
			title: lname,
			posterUrl: limg,
			backdropUrl: limg,
			description: ldes,
			quality: "HD",
			year: 2026,
			rating: 8.5,
			servers: servers, // Lần 1 (trang chi tiết) sẽ là []. Lần 2 (khi chạy qua extra) sẽ có đầy đủ tập
			duration: lduran || "",
			casts: lactor || "",
			director: ldirec || "",
			extra: extra // Lần 2 (trang xem phim) extra sẽ rỗng để dừng chu kỳ tải ngầm
		});
		
	} catch (e) {
		return JSON.stringify({
			id: slug || url || "error",
			title: "error",
			servers: []
		});
	}
}


// Hàm bổ trợ chuẩn hóa tập phim an toàn, không lo lỗi "00"
function formatEpisode(numStr) {
    var num = parseInt(numStr, 10);
    if (isNaN(num)) return "01"; 
    return num < 10 ? "0" + num : "" + num;
}


function parseDetailResponse(html, url) {
	try {
		var streamUrl = "";
		var VDtype = "";
    var $doc = _$(html);
		$doc.find('a[data-type="m3u8"]').each(function() {
			var link = this.attr("data-link");
			streamUrl = link;
			VDtype = "m3u8"
		});
		var embed = $doc.find('a[data-type="embed"]').attr("data-link");
		var checkepi = "false";
		var typevideo = "true";
		
		if (!streamUrl) {
			typevideo = "false";
			if (embed) {
				streamUrl = embed;
				VDtype = "embed";
			}
			else {
				typevideo = "false";
				streamUrl = url;
			}
		}
		
		
		if (url.indexOf("true") > -1) {
			checkepi = "true";
		} else {
			var matchCurent = url.match(/tapplay=(\d+)/);
			var curentRaw = matchCurent ? matchCurent[1] : "1";
			var curent = formatEpisode(curentRaw); // Chuẩn hóa thành "01", "02", "22"...
			checkepi = $doc.find("h2").find("a").text() + "- Tập " + curent;
		}
		var customJs = textJS(typevideo, checkepi);
		
		if (VDtype == "m3u8") {
			return JSON.stringify({
				"url": streamUrl,
				"isEmbed": false,
				"mimeType": "application/x-mpegURL",
				"headers": {
					"Referer": BASEURL,
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
				},
				"subtitles": []
			});
		}
		else {
			return JSON.stringify({
				"url": streamUrl,
        "isEmbed": true,
				"headers": {
					"Referer": BASEURL,
					"Origin": BASEURL
        
				},
				"subtitles": []
			});
		}
	} catch (e) {
    return JSON.stringify({ 
      url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4", 
      mimeType: "video/mp4", 
      isEmbed: false, headers: {}, subtitles: [] 
    });
	}
}


function parseEmbedResponse(html, url, datare) {
    try {
        log("parseEmbedResponse[url]: \n" + url);

        /* 1. Trích xuất videoHash từ HTML player streamvsmov */
        var hashMatch = html.match(/<div[^>]+id="rp-player"[^>]+data-hash="([^"]+)"/i);
        if (!hashMatch || !hashMatch[1]) {
            throw new Error("Không tìm thấy videoHash trong HTML player");
        }
        var videoHash = hashMatch[1];
        log("VideoHash: " + videoHash);

        /* 2. Lấy domain player từ URL để build m3u8 */
        var baseUrl = "https://v8.streamvsmov.com";
        var dm = url.match(/^(https:\/\/v\d+\.streamvsmov\.com)/i);
        if (dm) baseUrl = dm[1];

        var streamUrl = baseUrl + "/stream/" + videoHash + "/master.m3u8";
        log("Stream URL: " + streamUrl);

        /* 3. Trích xuất subtitles (vie, eng, ...) */
        var subtitles = [];
        var subtitlesMatch = html.match(/subtitles\s*:\s*(\[[\s\S]*?\])(?=\s*,\s*audios)/i);
        if (subtitlesMatch && subtitlesMatch[1]) {
            var subsArrayStr = subtitlesMatch[1];
            try {
                var fixedJson = subsArrayStr
                    .replace(/'/g, '"')
                    .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                var subsArray = JSON.parse(fixedJson);
                subsArray.forEach(function(sub) {
                    if (sub.url) {
                        var fullSubUrl = sub.url;
                        if (fullSubUrl.indexOf('http') !== 0) {
                            fullSubUrl = baseUrl + (fullSubUrl.indexOf('/') === 0 ? '' : '/') + fullSubUrl;
                        }
                        subtitles.push({
                            url: fullSubUrl,
                            lang: sub.code || sub.name || 'unknown',
                            mimeType: 'text/vtt'
                        });
                    }
                });
            } catch (e) {
                log("Lỗi parse subtitles: " + e.message);
            }
        }
        log("Subtitles found: " + subtitles.length);

        /* 4. Return m3u8 + subtitles */
        return JSON.stringify({
            url: streamUrl,
            mimeType: "application/x-mpegURL",
            isEmbed: false,
            headers: {
                "Referer": baseUrl + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            subtitles: subtitles
        });

    } catch (e) {
        log("parseEmbedResponse[err]:\n " + e);
        return JSON.stringify({
            url: "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            mimeType: "video/mp4",
            isEmbed: false, headers: {}, subtitles: []
        });
    }
}


function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) {
    return "[]";
}

function parseYearsResponse(html) {
    return "[]";
}

function getLISTmenu() {
    return `
danh-sach/phim-le.html@@Phim Lẻ
danh-sach/phim-bo.html@@Phim Bộ
the-loai/short-drama.html@@Phim Ngắn
the-loai/tinh-cam.html@@Tình Cảm
the-loai/am-nhac.html@@Âm Nhạc
the-loai/tam-ly.html@@Tâm Lý
the-loai/kinh-di.html@@Kinh Dị
the-loai/tai-lieu.html@@Tài Liệu
the-loai/tv-shows.html@@TV Shows
the-loai/hanh-dong.html@@Hành Động
the-loai/vien-tuong.html@@Viễn Tưởng
the-loai/than-thoai.html@@Thần Thoại
the-loai/vo-thuat.html@@Võ Thuật
the-loai/chien-tranh.html@@Chiến Tranh
the-loai/chinh-kich.html@@Chính Kịch
the-loai/phieu-luu.html@@Phiêu Lưu
the-loai/hai-huoc.html@@Hài Hước
the-loai/co-trang.html@@Cổ Trang
the-loai/gia-dinh.html@@Gia Đình
the-loai/hoc-duong.html@@Học Đường
the-loai/hinh-su.html@@Hình Sự
the-loai/bi-an.html@@Bí Ẩn
the-loai/phim-18.html@@Phim 18+
`
}

function textJS($links,checkepi) {
    // Sử dụng biến $url từ tham số truyền vào thay vì ghi cứng link
    return `
LINKVIDEO = ${JSON.stringify($links)};
CHECKEPI = ${JSON.stringify(checkepi)};
SCRIPTURL = "https://rawcdn.githack.com/alokillgtv-gif/VAXAPPSCRIPT/main/buildVideo.js"; 
if(LINKVIDEO == "false"){
	SCRIPTURL = "https://rawcdn.githack.com/alokillgtv-gif/VAXAPPSCRIPT/main/removeADSVIDEO.js";
}
const style = document.createElement('style');
var customcss = 'body { background: black; overflow: hidden; }body * {background: black}';
style.innerHTML = customcss;
document.head.appendChild(style);

/* Build Video Begin*/

    var DEVELOPE = false;
// ─── HÀM TOAST ĐƯỢC ĐƯA RA NGOÀI (Có thể gọi ở mọi nơi) ───
function showToast(message, duration, check) {
        if (typeof duration === 'undefined') duration = 7000;
        if (typeof check === 'undefined') check = true;
        if (check === false) return;
        var container = document.getElementById('global-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'global-toast-container';
            container.style.cssText =
                'position:fixed;bottom:20px;right:20px;z-index:9999999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(container);
        }
        var toastEl = document.createElement('div');
        toastEl.innerHTML = message;
        toastEl.style.cssText =
            'background:rgba(50,50,50,0.95);color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:sans-serif;font-size:14px;min-width:200px;transition:all 0.3s ease;transform:translateX(120%);opacity:0;';
        container.appendChild(toastEl);
        setTimeout(function() {
            toastEl.style.transform = 'translateX(0)';
            toastEl.style.opacity = '1';
        }, 10);
        setTimeout(function() {
            toastEl.style.transform = 'translateX(120%)';
            toastEl.style.opacity = '0';
            setTimeout(function() {
                toastEl.remove();
                if (container.childElementCount === 0) container.remove();
            }, 300);
        }, duration);
    }

/* Build Video End */

function injectScriptAfterLoad(scriptUrl) {
    function doFetchAndInject() {
        console.log('⏳ Đang tiến hành fetch code từ:', scriptUrl);
        
        fetch(SCRIPTURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Mã phản hồi từ Server không tốt: ' + response.status);
                }
                return response.text(); // Lấy toàn bộ mã nguồn dưới dạng chuỗi chữ
            })
            .then(codeText => {
                // 1. Tạo một thẻ script trống mới hoàn toàn bằng JS
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                
                // 2. Đổ thẳng nội dung code dạng chữ vào trong thẻ script vừa tạo
                scriptElement.textContent = codeText;
                
                // 3. Nhúng (Inject) thẻ script này vào vị trí cuối cùng của thẻ body
                document.body.appendChild(scriptElement);
               // showToast('🎯 Đã fetch và nhúng thành công script vào sau body,!',5000);
								if (CHECKEPI == "true") {
									showToast('Tập phim bạn chọn chưa có hoặc đã lỗi. Đã tự động đưa bạn về tập 1!', 60000, true);
								}
								else{
									showToast(CHECKEPI, 30000, true,true);
								}
            })
            .catch(error => {
                console.error('❌ Lỗi không thể fetch hoặc nhúng script:', error);
            });
    }
    
    // Kiểm tra trạng thái tải của trang web
    if (document.readyState !== 'loading') {
        // Nếu trang web đã tải xong cấu trúc DOM cơ bản, thực hiện ngay lập tức
        doFetchAndInject();
    } else {
        // Nếu trang web vẫn đang load thô, đợi sự kiện DOMContentLoaded kích hoạt rồi chạy
        document.addEventListener('DOMContentLoaded', doFetchAndInject);
    }
}

function initCustomVideoFix() {
    // SỬA: Lấy động giá trị từ tham số $url truyền vào hàm textJS bên ngoài
    if (SCRIPTURL && SCRIPTURL !== "undefined") {
        injectScriptAfterLoad(SCRIPTURL);
    }
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initCustomVideoFix);
} else {
	initCustomVideoFix();
}

`;
}


function buildMenu(listurl){let menulist=[];if (!listurl)return menulist;let lines=listurl.split('\n');for (let i=0;i < lines.length;i++){let line=lines[i].trim();if (!line||line.indexOf('@@')===-1)continue;let parts=line.split('@@');let link=parts[0]?parts[0].trim():"";let name=parts[1]?parts[1].trim():"";let check=parts[2]?parts[2].trim():undefined;if (!link||!name)continue;let item={};if (check==="false"){item={"slug":link,"title":name,"type":"Horizontal"};}else if (check==="true"){item={"slug":link,"title":name,"type":"Grid"};}else{item={"slug":link,"name":name};}menulist.push(item);}return menulist;}

function _$(param) {
    // -------------------------------------------------------------
    // 1. HELPER PARSER & UTILS
    // -------------------------------------------------------------
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
            if (typeof window !== "undefined" && window.log) window.log("parseHTML error: " + err.message);
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

    // -------------------------------------------------------------
    // 2. QUERY ENGINE & SELECTOR MATCHING
    // -------------------------------------------------------------
    function matchSingleSelector(node, sel, nodes) {
        if (!node || node.tag === "#text" || node.tag === "ROOT") return false;

        let cleanSel = sel;
        
        // 1. Tách pseudo positional (:first, :last, :eq)
        cleanSel = cleanSel.replace(/:first|:last|:eq\([0-9]+\)/gi, "").trim();

        // 2. Tách pseudo :content(...)
        let pseudoContentArg = null;
        let contentMatch = cleanSel.match(/:content\((['"]?)(.*?)\1\)/i);
        if (contentMatch) {
            pseudoContentArg = contentMatch[2];
            cleanSel = cleanSel.replace(contentMatch[0], "").trim();
        }

        // 3. Khớp Selector gốc
        if (cleanSel && cleanSel !== "*") {
            let tagMatch = cleanSel.match(/^[a-zA-Z0-9_-]+/);
            if (tagMatch && node.tag !== tagMatch[0].toLowerCase()) return false;

            let idMatch = cleanSel.match(/#([a-zA-Z0-9_-]+)/);
            if (idMatch && (!node.attrs || node.attrs.id !== idMatch[1])) return false;

            // Class matching (hỗ trợ Tailwind)
            let classMatches = cleanSel.match(/\.([a-zA-Z0-9_\-\/\\:]+)/g);
            if (classMatches) {
                if (!node.attrs || !node.attrs.class) return false;
                let elClasses = node.attrs.class.split(/\s+/);
                for (let c of classMatches) {
                    let targetClass = c.substring(1);
                    if (!elClasses.includes(targetClass)) return false;
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
        
        let eqMatch = selector.match(/:eq\(([0-9]+)\)/i);
        if (eqMatch) {
            let idx = parseInt(eqMatch[1], 10);
            return results[idx] ? [results[idx]] : [];
        }

        return results;
    }

    function querySelectorAll(startNode, selector, nodes) {
        try {
            if (!startNode || !selector) return [];

            if (selector.indexOf(',') !== -1) {
                let groupSelectors = selector.split(',').map(s => s.trim());
                let resMap = new Map();
                for (let gSel of groupSelectors) {
                    let subRes = querySelectorAll(startNode, gSel, nodes);
                    for (let r of subRes) resMap.set(r.id, r);
                }
                return Array.from(resMap.values());
            }

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

    // -------------------------------------------------------------
    // 3. MINIJQ CLASS CONSTRUCTOR & PROTOTYPE
    // -------------------------------------------------------------
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
        },

        attr: function(name, value) {
            if (value !== undefined) {
                for (let el of this.elements) {
                    if (el && el.tag !== "#text") {
                        if (!el.attrs) el.attrs = {};
                        el.attrs[name] = value;
                    }
                }
                return this;
            }
            if (this.elements.length === 0 || !this.elements[0].attrs) return "";
            return this.elements[0].attrs[name] || "";
        },

        each: function(callback) {
            if (typeof callback !== 'function') return this;
            this.elements.forEach((el, index) => {
                let jqEl = new MiniJQ([el], this.nodes);
                callback.call(jqEl, index, jqEl);
            });
            return this;
        },

        textAll: function(delimiter) {
            if (delimiter === undefined) delimiter = " ";
            let texts = [];
            for (let el of this.elements) {
                texts.push(getNodeText(el, this.nodes, 0));
            }
            return texts.join(delimiter);
        },

        first: function() {
            return new MiniJQ(this.elements.length > 0 ? [this.elements[0]] : [], this.nodes);
        },

        last: function() {
            return new MiniJQ(this.elements.length > 0 ? [this.elements[this.elements.length - 1]] : [], this.nodes);
        },

        eq: function(index) {
            return new MiniJQ(this.elements[index] ? [this.elements[index]] : [], this.nodes);
        },

        parent: function() {
            let parents = [];
            let addedIds = new Set();
            for (let el of this.elements) {
                if (el && el.parentId !== null && el.parentId !== 0) {
                    let pNode = this.nodes[el.parentId];
                    if (pNode && !addedIds.has(pNode.id)) {
                        addedIds.add(pNode.id);
                        parents.push(pNode);
                    }
                }
            }
            return new MiniJQ(parents, this.nodes);
        },

        next: function() {
            let nexts = [];
            for (let el of this.elements) {
                if (!el || el.parentId === null) continue;
                let pNode = this.nodes[el.parentId];
                if (!pNode) continue;

                let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
                let idx = siblings.findIndex(s => s.id === el.id);
                if (idx !== -1 && idx + 1 < siblings.length) {
                    nexts.push(siblings[idx + 1]);
                }
            }
            return new MiniJQ(nexts, this.nodes);
        },

        before: function() {
            let befores = [];
            for (let el of this.elements) {
                if (!el || el.parentId === null) continue;
                let pNode = this.nodes[el.parentId];
                if (!pNode) continue;

                let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
                let idx = siblings.findIndex(s => s.id === el.id);
                if (idx > 0) {
                    befores.push(siblings[idx - 1]);
                }
            }
            return new MiniJQ(befores, this.nodes);
        },

        after: function() {
            return this.next();
        },

        closest: function(selector) {
            let matched = [];
            let addedIds = new Set();
            for (let el of this.elements) {
                let currParentId = el.parentId;
                let depth = 0;
                while (currParentId !== null && currParentId !== 0 && depth++ < 30) {
                    let curr = this.nodes[currParentId];
                    if (!curr) break;
                    if (matchSingleSelector(curr, selector, this.nodes)) {
                        if (!addedIds.has(curr.id)) {
                            addedIds.add(curr.id);
                            matched.push(curr);
                        }
                        break;
                    }
                    currParentId = curr.parentId;
                }
            }
            return new MiniJQ(matched, this.nodes);
        }
    };

    // -------------------------------------------------------------
    // 4. MAIN ENTRY POINT LOGIC FOR _$
    // -------------------------------------------------------------
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
function parseMovieDetail(html, url) {
    try {
      if (url) log("parseMovieDetail[url]: \n" + url);
  
      var idMatch =
        /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
        /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
      var id = idMatch ? idMatch[1] : url || "";
  
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
  
      var rmatch = html.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
      if (rmatch && rmatch[1]) lurl = rmatch[1];
  
      rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
      if (rmatch && rmatch[1]) limg = rmatch[1];
  
      if (limg.indexOf("//") === 0) {
        limg = "https:" + limg;
      } else if (limg.indexOf("http") === -1) {
        limg = BASEURL + limg;
      }
      lname = _$(html).find("h1").text();
      lname = decodeHTMLEntities(lname);
      var ldes = _$(html).find("h2:content('Thông tin về phim')").next().text();
      ldes = decodeHTMLEntities(ldes);
      var year = 2026;
      var extra = "";
  
      var rawText = _$(html).find(".Date").text();
      var match = rawText.match(/\b(19|20)\d{2}\b/);
  
      if (match) {
        year = parseInt(match[0], 10);
      }
  
      if (isNaN(year)) {
        year = 2026;
      }
      status = _$(html)
        .find(".aim-hero__meta")
        .find(".aim-status--airing")
        .text();
  
      var categoryResult = [];
      _$(html)
        .find(".Description")
        .find(".Genre")
        .find("a")
        .each(function () {
          var link = this.attr("href") || this.find("a").attr("href");
          var name = this.text().replace(/\s+/g, " ").trim();
          name = decodeHTMLEntities(name);
  
          if (name && link) {
            var slug = typeof getSlug === "function" ? getSlug(link) : link;
            categoryResult.push("[" + name + "](" + slug + ")");
          }
        });
  
      category = categoryResult.join(", ");
      var actorResult = [];
      _$(html)
        .find(".Description")
        .find(".Cast")
        .find("a")
        .each(function () {
          var link = this.attr("href") || this.find("a").attr("href");
          var name = this.text().replace(/\s+/g, " ").trim();
          name = decodeHTMLEntities(name);
  
          if (name && link) {
            var slug = typeof getSlug === "function" ? getSlug(link) : link;
            actorResult.push("[" + name + "](" + slug + ")");
          }
        });
  
      lactor = actorResult.join(", ");
      quality = _$(html).find("span.Time").text();
      episode_current = _$(html).find(".aim-hero__meta").find("span:last").text();
      rating = _$(html).find(".post-ratings").text();
      rating = parseInt(rating, 10);
      
      // XỬ LÝ SERVER VÀ TẬP PHIM CHÍNH XÁC
      var serversMap = [];
      
      // Lấy danh sách máy chủ trên web
      _$(html)
        .find(".SeasonBx:content('Danh sách máy chủ')")
        .find("a")
        .each(function () {
          var sName = this.text().trim();
          var sHref = this.attr("href") || "";
          
          // Bắt tham số '?sv2=true' ...
          var svMatch = sHref.match(/sv\d+=[^&]+/);
          var svParam = svMatch ? svMatch[0] : "";
          
          if (sName) {
            serversMap.push({ name: sName, param: svParam });
          }
        });

      // Nếu trang không có tab máy chủ nào, gán mặc định Server 1
      if (serversMap.length === 0) {
        serversMap.push({ name: "Server 1", param: "" });
      }

      // Lấy danh sách link gốc của các tập
      var baseEpisodes = [];
      _$(html)
        .find(".SeasonBx:content('Danh sách tập')")
        .find("#halim-list-server")
        .find("a")
        .each(function () {
          var link = this.attr("href");
          link = fixHref(link);
          var name = this.attr("title") || this.text().trim();
          baseEpisodes.push({ href: link, name: name });
        });

      var servers = [];
      // Nhúng danh sách tập vào đúng số lượng thư mục Server
      for (var i = 0; i < serversMap.length; i++) {
        var sName = serversMap[i].name;
        var sParam = serversMap[i].param;
        var items = [];
        
        for (var j = 0; j < baseEpisodes.length; j++) {
          var ep = baseEpisodes[j];
          var newId = ep.href.split('?')[0]; // Bỏ query cũ
          if (sParam) {
            newId += "?" + sParam;
          }
          items.push({
            id: newId,
            name: ep.name,
            slug: ep.name.replace(/[\s\S]*?(\d+)/, "tap-$1")
          });
        }
        
        if (items.length > 0) {
          servers.push({
            name: sName,
            episodes: items
          });
        }
      }

      servers = sortEpisodesByName(servers);
      episode_current = "Đang có: " + status;
  
      return JSON.stringify({
        id: id,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes,
        quality: quality,
        year: year,
        rating: rating,
        status: status,
        category: category,
        episode_current: episode_current,
        servers: servers,
        duration: lduran || "",
        casts: lactor || "",
        director: ldirec || "",
        extra: extra,
      });
    } catch (e) {
      log("parseMovieDetail[err]:\n " + e);
      return JSON.stringify({
        id: slug || url || "error",
        title: "error",
        servers: [],
      });
    }
  }


function parseDetailResponse(html, url) {
  console.log("parseDetailResponse [Tầng 1]: " + url);
  try {
    const regex = /<iframe\b[^>]*\bid=["']iframeStream["'][^>]*\bsrc=["']([^"']+)["']/i;
    const match = html.match(regex);
    let src = match ? match[1] : null;

    if (!src) {
        return JSON.stringify({ url: "", isEmbed: false });
    }

    // Fix html entities URL
    src = src.replace(/&amp;/g, "&");
    console.log("Iframe Src: " + src);

    // Kích hoạt giải mã Token qua 'datasend: 1' NẾU VÀ CHỈ NẾU nó là link /embed nội bộ của hệ thống Bitluna (không phải embed3rd)
    if (src.indexOf("moviking.neuronix.sbs") > -1 && src.indexOf("embed3rd") === -1) {
         return JSON.stringify({
          url: src,
          isEmbed: true, 
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://moviking.neuronix.sbs/",
            "Origin": "https://moviking.neuronix.sbs"
          },
          datasend: 1
        });
    } else {
        // Nếu là server thứ 3 (chứa embed3rd) hoặc các link iframe khác, App sẽ không gửi qua Token Flow mà load trực tiếp WebView
        var originMatch = src.match(/^(https?:\/\/[^\/]+)/i);
        var origin = originMatch ? originMatch[1] : "";
        return JSON.stringify({
          url: src,
          isEmbed: true, 
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": origin + "/",
            "Origin": origin
          }
        });
    }

  } catch (e) {
    console.log("[Lỗi parseDetailResponse]", e);
      return JSON.stringify({ 
        url: "", 
        isEmbed: false 
      });
  }
}

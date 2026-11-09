var BASEURL = "https://www.tiktok.com";
var API = "https://api-normal.tiktokv.com";
var NATIVE_URL = "https://example.com/";
var UA = "com.ss.android.ttmd.video/47.6.3 (Linux; U; Android 13)";
var COMMON = "aid=1233&app_name=trill&version_code=2024706030&version_name=47.6.3&device_platform=android&os=android&language=vi&app_language=vi&region=VN&sys_region=VN&carrier_region=VN&tz_name=Asia/Ho_Chi_Minh&channel=googleplay&device_brand=google&os_version=13&manifest_version_code=2024706030&update_version_code=2024706030&build_number=47.6.3&resolution=1080*2400&dpi=420&ac=wifi&mcc_mnc=45201&tz_offset=25200";
var STREAM_HEADERS = {
  "User-Agent": UA,
  "Referer": "https://www.tiktok.com/",
  "Origin": "https://www.tiktok.com"
};
var CACHE = {};

function logPine(msg) {
  try { console.log("[PineDrama] " + msg); } catch (e) {}
}

function getManifest() {
  return JSON.stringify({
    id: "pinedrama",
    name: "PineDrama",
    version: "1.0.2",
    author: "alokillgtv",
    description: "Phim ngắn PineDrama (TikTok) - tiếng Việt, tự động lấy phụ đề vie-VN",
    BASEURL: BASEURL,
    iconUrl: "https://vaxplugin.alokillgtv.workers.dev/img/shortflix/pinedrama.jpg",
    imageReferer: "https://www.tiktok.com/",
    isEnabled: true,
    isAdult: false,
    adblock: true,
    type: "shortfilm",
    layoutType: "VERTICAL",
    playerType: "exoplayer",
    subtitleCat: false,
    debug: true
  });
}

function jsonParse(value, fallback) {
  try { return JSON.parse(String(value || "")); } catch (e) { return fallback || {}; }
}

function toStr(value) {
  return value === null || value === undefined ? "" : String(value);
}

function isHttp(value) {
  return /^https?:\/\//i.test(toStr(value));
}

function utf8(bytes) {
  if (typeof bytes === "string") return bytes;
  if (!bytes || !bytes.length) return "";
  try {
    if (typeof TextDecoder !== "undefined") return new TextDecoder("utf-8").decode(bytes);
  } catch (e) {}
  var binary = "";
  for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  try { return decodeURIComponent(escape(binary)); } catch (e2) { return binary; }
}

function readTag(bytes, pos) {
  var value = 0;
  var shift = 0;
  var b;
  do {
    b = bytes[pos++];
    value += (b & 127) * Math.pow(2, shift);
    shift += 7;
  } while (b & 128);
  return [value, pos];
}

function readVarint(bytes, pos) {
  if (typeof BigInt !== "undefined") {
    var big = BigInt(0);
    var shift = BigInt(0);
    var b;
    do {
      b = bytes[pos++];
      big |= BigInt(b & 127) << shift;
      shift += BigInt(7);
    } while (b & 128);
    return [big <= BigInt(9007199254740991) ? Number(big) : big.toString(), pos];
  }
  var value = 0;
  var s = 0;
  var x;
  do {
    x = bytes[pos++];
    value += (x & 127) * Math.pow(2, s);
    s += 7;
  } while (x & 128);
  return [value, pos];
}

function pbFields(bytes) {
  var out = [];
  if (!bytes || !bytes.length) return out;
  var pos = 0;
  while (pos < bytes.length) {
    var tag = readTag(bytes, pos);
    pos = tag[1];
    var field = Math.floor(tag[0] / 8);
    var wire = tag[0] & 7;
    if (!field) break;
    if (wire === 0) {
      var v0 = readVarint(bytes, pos);
      pos = v0[1];
      out.push({ f: field, w: wire, v: v0[0] });
    } else if (wire === 1) {
      out.push({ f: field, w: wire, v: bytes.subarray(pos, pos + 8) });
      pos += 8;
    } else if (wire === 2) {
      var len = readTag(bytes, pos);
      pos = len[1];
      out.push({ f: field, w: wire, v: bytes.subarray(pos, pos + len[0]) });
      pos += len[0];
    } else if (wire === 5) {
      out.push({ f: field, w: wire, v: bytes.subarray(pos, pos + 4) });
      pos += 4;
    } else {
      break;
    }
  }
  return out;
}

function pick(fields, num) {
  for (var i = 0; i < fields.length; i++) if (fields[i].f === num) return fields[i].v;
  return null;
}

function pickAll(fields, num) {
  var out = [];
  for (var i = 0; i < fields.length; i++) if (fields[i].f === num) out.push(fields[i].v);
  return out;
}

function firstHttp(fields, num) {
  var list = pickAll(fields, num);
  for (var i = 0; i < list.length; i++) {
    var value = utf8(list[i]);
    if (isHttp(value)) return value;
  }
  return "";
}

function pickImage(fields, num) {
  var list = pickAll(fields, num);
  var fallback = "";
  for (var i = 0; i < list.length; i++) {
    var value = utf8(list[i]);
    if (!isHttp(value)) continue;
    if (/\.(jpe?g|webp|png)(\?|$)/i.test(value)) return value;
    if (!fallback && !/\.heic(\?|$)/i.test(value)) fallback = value;
  }
  return fallback || firstHttp(fields, num);
}

function playUrlFromAddr(fields) {
  var urls = pickAll(fields, 2);
  var fallback = "";
  for (var i = 0; i < urls.length; i++) {
    var value = utf8(urls[i]);
    if (!isHttp(value)) continue;
    if (value.indexOf("/aweme/v1/play/") >= 0) {
      if (!fallback) fallback = value;
      continue;
    }
    if (/tiktokcdn|tiktokv\.com\/video|byteoversea/i.test(value)) return value;
    if (!fallback) fallback = value;
  }
  if (fallback) return fallback;
  var legacy = pickAll(fields, 1);
  for (var j = 0; j < legacy.length; j++) {
    var legacyValue = utf8(legacy[j]);
    if (isHttp(legacyValue)) return legacyValue;
  }
  return "";
}

function cleanTitle(value) {
  var title = toStr(value).trim();
  title = title.replace(/\s*[-–—]\s*(?:Tập\s*)?\d{1,4}\s*$/i, "");
  title = title.replace(/\s*[-–—]\s*EP\s*\d+\s*$/i, "");
  title = title.replace(/\s*#\d+\s*$/, "");
  if (/^Tập\s*\d+$/i.test(title)) return "";
  return title.trim();
}

function extractId(value) {
  var match = toStr(value).match(/\d{10,}/);
  return match ? match[0] : "";
}

function getPipeData(apiUrl) {
  var raw = toStr(apiUrl);
  var index = raw.indexOf("|");
  if (index < 0) return "";
  var data = raw.substring(index + 1).replace(/^\s+/, "");
  if (data.toLowerCase().indexOf("data:") === 0) data = data.substring(5);
  return data;
}

function extractParam(url, name) {
  var match = toStr(url).match(new RegExp("[?&]" + name + "=([^&|]+)"));
  if (!match) return "";
  try { return decodeURIComponent(match[1]); } catch (e) { return match[1]; }
}

function cached(key) {
  var item = CACHE[key];
  if (item && Date.now() - item.t < 120000) return item.v;
  return null;
}

function cacheSet(key, value) {
  CACHE[key] = { t: Date.now(), v: value };
  return value;
}

function xhrBinary(url) {
  var item = cached("bin:" + url);
  if (item) return item;
  try {
    if (typeof httpRequest !== "function") {
      logPine("httpRequest is not defined");
      return null;
    }
    var res = httpRequest(url, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "*/*"
      }
    });
    if (!res || !res.isSuccessful) {
      logPine("binary GET fail status=" + (res ? res.status : "null"));
      return null;
    }
    var text = toStr(res.body || "");
    logPine("binary GET ok len=" + text.length + " firstCharCode=" + (text.length ? text.charCodeAt(0) : "empty"));
    cacheSet("rawtext:" + url, text);
    var bytes = new Uint8Array(text.length);
    for (var i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i) & 255;
    }
    return cacheSet("bin:" + url, bytes);
  } catch (e) {
    logPine("binary GET error " + (e.message || e));
    return null;
  }
}

function xhrText(method, url, body, contentType) {
  var key = "txt:" + method + ":" + url + ":" + toStr(body).slice(0, 160);
  var item = cached(key);
  if (item !== null) return item;
  try {
    if (typeof httpRequest !== "function") {
      logPine("httpRequest is not defined");
      return "";
    }
    var headers = {
      "User-Agent": UA,
      "Accept": "application/json, text/plain, */*"
    };
    if (contentType) headers["Content-Type"] = contentType;
    var res = httpRequest(url, {
      method: method,
      headers: headers,
      body: body || null
    });
    if (!res || !res.isSuccessful) return "";
    return cacheSet(key, toStr(res.body || ""));
  } catch (e) {
    logPine("text " + method + " error " + (e.message || e));
    return "";
  }
}

function feedUrl() {
  return API + "/tiktok/md/mini_drama/feed/v1/?" + COMMON +
    "&count=12&is_need_load_skylight=true&is_mixed_column_page=true&is_non_personalized=false" +
    "&channel_id=0&drama_ai_tab_type=0&tt_did=&req_scene=&cache_count=0&insert_resume_item=0" +
    "&force_insert_last_watch=0&drama_recommend_params=&drama_request_type=&item_count_in_session=0" +
    "&last_feed_ad_items=&drama_current_items=&last_feed_items=";
}

function detailUrl(collectionId, count, queryType, seqId, videoId) {
  return API + "/tiktok/md/collection/video/v1/?" + COMMON +
    "&collection_id=" + encodeURIComponent(collectionId) +
    "&current_seq_id=" + encodeURIComponent(seqId || 0) +
    "&video_id=" + encodeURIComponent(videoId || 0) +
    "&query_type=" + encodeURIComponent(queryType || "continue") +
    "&direction=1&count=" + encodeURIComponent(count || 100) +
    "&is_trailer_paginated=false&query_scene=mini_drama_container&need_collection_detail=false" +
    "&root_scene=0&enter_from=&request_source=&last_feed_items=&last_feed_ad_items=" +
    "&is_force_insert=false&enter_gid=0&recommend_multi_lang=";
}

function searchUrl() {
  return API + "/aweme/v1/search/drama/?" + COMMON;
}

function searchBody(keyword, page) {
  var offset = Math.max(0, (Number(page) || 1) - 1) * 20;
  return "keyword=" + encodeURIComponent(keyword || "") +
    "&offset=" + offset + "&count=20&search_source=drama&enter_from=drama_search" +
    "&hot_search=0&source=drama&query_correct_type=1&is_non_personalized_search=0";
}

function labelFor(code) {
  var tag = toStr(code).toLowerCase();
  if (tag.indexOf("vie") === 0 || tag === "vi") return "Tiếng Việt";
  if (tag.indexOf("eng") === 0 || tag === "en") return "English";
  if (tag.indexOf("spa") === 0 || tag === "es") return "Español";
  if (tag.indexOf("cmn") === 0 || tag.indexOf("zho") === 0 || tag === "zh") return "中文";
  if (tag.indexOf("tha") === 0 || tag === "th") return "ไทย";
  if (tag.indexOf("ind") === 0 || tag === "id") return "Indonesia";
  return toStr(code) || "Phụ đề";
}

function parseSeries(seriesBytes) {
  var out = { id: "", title: "", total: 0, cover: "", genres: [] };
  if (!seriesBytes) return out;
  var f = pbFields(seriesBytes);
  out.id = toStr(pick(f, 1));
  out.title = utf8(pick(f, 13));
  var info = jsonParse(utf8(pick(f, 31)), {});
  out.total = Number(info.video_total_nums || info.video_total_num || 0) || 0;
  var cover = pick(f, 27);
  if (cover) out.cover = pickImage(pbFields(cover), 2);
  var genres = pickAll(f, 26);
  for (var i = 0; i < genres.length; i++) {
    var g = utf8(genres[i]);
    if (g) out.genres.push(g);
  }
  return out;
}

function parseSubtitles(videoFields) {
  var subs = [];
  var seen = {};
  var containers = pickAll(videoFields, 31);
  for (var i = 0; i < containers.length; i++) {
    var container = pbFields(containers[i]);
    var entries = pickAll(container, 4);
    if (!entries.length && (pick(container, 1) || pick(container, 3))) entries = [containers[i]];
    for (var j = 0; j < entries.length; j++) {
      var ef = pbFields(entries[j]);
      var code = toStr(utf8(pick(ef, 1)));
      var url = utf8(pick(ef, 3));
      if (!isHttp(url)) {
        var fallbacks = pickAll(ef, 14);
        for (var k = 0; k < fallbacks.length; k++) {
          var candidate = utf8(fallbacks[k]);
          if (isHttp(candidate) && candidate.indexOf("api.tiktokv.com") < 0) {
            url = candidate;
            break;
          }
        }
      }
      if (!isHttp(url)) continue;
      var key = code + "|" + url;
      if (seen[key]) continue;
      seen[key] = 1;
      subs.push({ lang: labelFor(code), url: url });
    }
  }
  subs.sort(function (a, b) {
    var av = a.lang.indexOf("Việt") >= 0 ? 0 : 1;
    var bv = b.lang.indexOf("Việt") >= 0 ? 0 : 1;
    return av - bv;
  });
  return subs;
}

function parseVideo(videoBytes, withSubs) {
  var out = { play: "", cover: "", subs: [] };
  if (!videoBytes) return out;
  var f = pbFields(videoBytes);
  var playFields = pbFields(pick(f, 1) || pick(f, 41) || pick(f, 18) || pick(f, 27));
  out.play = playUrlFromAddr(playFields);
  var cover = pick(f, 2);
  if (cover) out.cover = pickImage(pbFields(cover), 2);
  if (withSubs) out.subs = parseSubtitles(f);
  return out;
}

function parseAweme(awemeBytes, withMedia) {
  var out = {
    awemeId: "",
    desc: "",
    episode: 0,
    collectionId: "",
    seriesTitle: "",
    total: 0,
    cover: "",
    genres: [],
    play: "",
    subs: []
  };
  if (!awemeBytes) return out;
  var f = pbFields(awemeBytes);
  out.awemeId = toStr(utf8(pick(f, 1)));
  out.desc = utf8(pick(f, 2));
  var seriesBytes = pick(f, 317);
  var series = parseSeries(seriesBytes);
  out.collectionId = series.id;
  out.seriesTitle = series.title;
  out.total = series.total;
  out.cover = series.cover;
  out.genres = series.genres;
  if (withMedia) {
    var video = parseVideo(pick(f, 7), true);
    out.play = video.play;
    out.subs = video.subs;
    if (!out.cover) out.cover = video.cover;
  }
  return out;
}

function parseFeed(raw) {
  var top = pbFields(raw);
  var items = pickAll(top, 4);
  var out = [];
  var seen = {};
  for (var i = 0; i < items.length; i++) {
    var item = parseAweme(items[i], false);
    if (!item.collectionId) item.collectionId = extractId(item.awemeId);
    if (!item.collectionId || seen[item.collectionId]) continue;
    seen[item.collectionId] = 1;
    var title = cleanTitle(item.desc);
    if (!title) title = cleanTitle(item.seriesTitle) || item.seriesTitle || "PineDrama";
    out.push({
      id: item.collectionId,
      title: title,
      posterUrl: item.cover,
      backdropUrl: item.cover,
      description: item.seriesTitle || "",
      quality: "PineDrama",
      episode_current: item.total ? item.total + " tập" : "Full",
      year: "",
      lang: "Vietsub",
      datasend: JSON.stringify({
        collection_id: item.collectionId,
        title: title,
        posterUrl: item.cover,
        total: item.total
      })
    });
  }
  return out;
}

function cleanUrl(raw) {
  if (!raw) return "";
  var end = raw.length;
  for (var i = 0; i < raw.length; i++) {
    var code = raw.charCodeAt(i);
    if (code <= 32 || code >= 127 || raw[i] === '"' || raw[i] === "'" || raw[i] === '<' || raw[i] === '>' || raw[i] === '\\') {
      end = i;
      break;
    }
  }
  return raw.slice(0, end);
}

function parseDetailFromText(rawText, cid) {
  if (!rawText) return { episodes: [], total: 0, meta: null };
  var itemRegex = /item_id=([0-9]{18,20})/g;
  var m;
  var items = [];
  var seen = {};
  while ((m = itemRegex.exec(rawText)) !== null) {
    var aid = m[1];
    if (!seen[aid]) {
      seen[aid] = 1;
      items.push({ id: aid, pos: m.index });
    }
  }

  var total = items.length;
  var totalMatch = rawText.match(/"video_total_nums?":\s*([0-9]+)/i);
  if (totalMatch) {
    total = Number(totalMatch[1]) || total;
  }

  var episodes = [];
  var subLangs = [
    { tag: "vie-VN", label: "Tiếng Việt" },
    { tag: "spa-ES", label: "Español" },
    { tag: "eng-US", label: "English" },
    { tag: "cmn-Hans", label: "中文" },
    { tag: "tha-TH", label: "ไทย" },
    { tag: "ind-ID", label: "Indonesia" }
  ];

  for (var i = 0; i < items.length; i++) {
    var cur = items[i];
    var start = i === 0 ? 0 : items[i - 1].pos;
    var end = (i + 1 < items.length) ? items[i + 1].pos : rawText.length;
    var slice = rawText.slice(start, end);

    var playUrl = "";
    var directRegex = /https:\/\/(?:v31\-vn[^\/\s"'<>\\]*|v16m[^\/\s"'<>\\]*|v3[^\/\s"'<>\\]*|v[0-9]+[a-z0-9\-]*\.tiktokcdn\.com)\/[a-f0-9]{32}\/[a-f0-9]{8}\/video\/tos\/alisg\/[^\/\s"'<>\\]+\/[^\/\s"'<>\\]+\/\?a=1233[^\s"'<>\\]*/gi;
    var vMatches = slice.match(directRegex);
    if (vMatches && vMatches.length) {
      for (var vi = 0; vi < vMatches.length; vi++) {
        if (vMatches[vi].indexOf("v31-vn") !== -1) { playUrl = cleanUrl(vMatches[vi]); break; }
      }
      if (!playUrl) {
        for (var vi = 0; vi < vMatches.length; vi++) {
          if (vMatches[vi].indexOf("v16m") !== -1) { playUrl = cleanUrl(vMatches[vi]); break; }
        }
      }
      if (!playUrl) playUrl = cleanUrl(vMatches[0]);
    } else {
      var fbMatch = slice.match(/https:\/\/[a-z0-9\.\-]+\.tiktokcdn\.com\/[^\s"'<>\\]*video\/tos\/[^\s"'<>\\]*/i);
      if (fbMatch) playUrl = cleanUrl(fbMatch[0]);
    }

    if (!playUrl) continue;

    var subs = [];
    var seenSubs = {};
    for (var si = 0; si < subLangs.length; si++) {
      var sl = subLangs[si];
      var idx = slice.indexOf(sl.tag);
      if (idx !== -1) {
        var subChunk = slice.slice(idx, idx + 600);
        var subMatch = subChunk.match(/https:\/\/[a-z0-9\.\-]+\.tiktokcdn\.com\/[^\s"'<>\\]+/i);
        if (subMatch) {
          var sUrl = cleanUrl(subMatch[0]);
          if (!seenSubs[sUrl]) {
            seenSubs[sUrl] = 1;
            subs.push({ lang: sl.label, url: sUrl });
          }
        }
      }
    }

    var epNumMatch = slice.match(/Tập\s+(\d+)/i);
    var epNum = epNumMatch ? Number(epNumMatch[1]) : (i + 1);

    var data = {
      url: playUrl,
      mimeType: "video/mp4",
      headers: STREAM_HEADERS,
      subtitles: subs,
      cid: cid || "",
      aid: cur.id,
      seq: epNum
    };

    episodes.push({
      id: NATIVE_URL + "?pinedrama_ep=" + cur.id + "&cid=" + encodeURIComponent(cid || ""),
      name: "Tập " + epNum,
      slug: "ep-" + epNum,
      datasend: JSON.stringify(data)
    });
  }

  logPine("parseDetailFromText cid=" + cid + " items=" + items.length + " episodes=" + episodes.length + " total=" + total);
  return { episodes: episodes, total: total, meta: null };
}

function parseDetail(raw, cid) {
  var episodes = [];
  var seen = {};
  var meta = null;
  var total = 0;

  if (raw) {
    var top = pbFields(raw);
    var wrappers = pickAll(top, 2);
    total = Number(pick(top, 6) || 0) || 0;
    logPine("parseDetail topFields=" + top.length + " wrappers=" + wrappers.length + " total=" + total);
    for (var i = 0; i < wrappers.length; i++) {
      var wf = pbFields(wrappers[i]);
      var seq = Number(pick(wf, 12) || 0) || 0;
      var awemeBytes = pick(wf, 4) || pick(wf, 15) || wrappers[i];
      var item = parseAweme(awemeBytes, true);
      if (!item.play) continue;
      if (seen[item.awemeId]) continue;
      seen[item.awemeId] = 1;
      if (!meta) meta = item;
      var episodeNo = seq || item.episode || (i + 1);
      var data = {
        url: item.play,
        mimeType: "video/mp4",
        headers: STREAM_HEADERS,
        subtitles: item.subs,
        cid: item.collectionId || (meta ? meta.collectionId : ""),
        aid: item.awemeId,
        seq: episodeNo
      };
      episodes.push({
        id: NATIVE_URL + "?pinedrama_ep=" + item.awemeId + "&cid=" + encodeURIComponent(data.cid),
        name: "Tập " + episodeNo,
        slug: "ep-" + episodeNo,
        datasend: JSON.stringify(data)
      });
    }
    if (!total) total = meta ? meta.total : 0;
  }

  logPine("parseDetail validEpisodes=" + episodes.length);
  return { episodes: episodes, total: total, meta: meta };
}

function buildDetail(collectionId, fallback) {
  fallback = fallback || {};
  var cid = toStr(collectionId || fallback.collection_id || fallback.cid || extractId(fallback.id));
  if (!cid) return { id: "", title: "", servers: [] };
  var total = Number(fallback.total || 0) || 0;
  var firstCount = total > 0 ? Math.min(total, 100) : 100;
  var targetUrl = detailUrl(cid, firstCount, "continue", 0, 0);
  var raw = xhrBinary(targetUrl);
  var parsed = raw ? parseDetail(raw, cid) : { episodes: [], total: 0, meta: null };

  // Fallback: nếu giải mã binary protobuf bị hỏng ký tự do UTF-8 bridge dẫn đến 0 tập,
  // sử dụng bộ phân tích trực tiếp từ chuỗi HTTP phản hồi
  if (!parsed.episodes || !parsed.episodes.length) {
    var rawText = cached("rawtext:" + targetUrl) || "";
    if (rawText) {
      logPine("trying text-based fallback extractor for cid=" + cid);
      var textParsed = parseDetailFromText(rawText, cid);
      if (textParsed.episodes && textParsed.episodes.length) {
        parsed.episodes = textParsed.episodes;
        if (!parsed.total) parsed.total = textParsed.total;
      }
    }
  }

  var episodes = parsed.episodes.slice(0);
  var guard = 0;
  while (parsed.total > episodes.length && episodes.length > 0 && guard < 5) {
    guard++;
    var lastSeq = 0;
    try { lastSeq = jsonParse(episodes[episodes.length - 1].datasend, {}).seq || 0; } catch (e) {}
    if (!lastSeq) break;
    var nextUrl = detailUrl(cid, 100, "seq_id", lastSeq, 0);
    var nextRaw = xhrBinary(nextUrl);
    if (!nextRaw) break;
    var nextParsed = parseDetail(nextRaw, cid);
    if (!nextParsed.episodes || !nextParsed.episodes.length) {
      var nextText = cached("rawtext:" + nextUrl) || "";
      if (nextText) nextParsed = parseDetailFromText(nextText, cid);
    }
    var added = 0;
    for (var i = 0; i < nextParsed.episodes.length; i++) {
      var ep = nextParsed.episodes[i];
      var exists = false;
      for (var j = 0; j < episodes.length; j++) {
        if (episodes[j].slug === ep.slug) { exists = true; break; }
      }
      if (!exists) {
        episodes.push(ep);
        added++;
      }
    }
    if (!added) break;
  }
  var meta = parsed.meta || {};
  var title = cleanTitle(meta.desc) || cleanTitle(meta.seriesTitle) || fallback.title || meta.seriesTitle || "PineDrama";
  var poster = fallback.posterUrl || meta.cover || "";
  var description = fallback.description || (meta.genres && meta.genres.length ? meta.genres.join(", ") : "");
  var episodeTotal = parsed.total || total || episodes.length;
  logPine("detail cid=" + cid + " episodes=" + episodes.length + " total=" + episodeTotal);
  return {
    id: cid,
    title: title,
    posterUrl: poster,
    backdropUrl: poster,
    description: description,
    quality: "PineDrama",
    type: "shortfilm",
    episode_current: episodeTotal ? episodeTotal + " tập" : "Full",
    servers: [{ name: "PineDrama", episodes: episodes }]
  };
}

function mapSearchItem(item) {
  if (!item) return null;
  var cid = toStr(item.collection_id_str || item.collection_id || "");
  if (!cid) return null;
  var poster = "";
  if (item.cover && item.cover.url_list && item.cover.url_list.length) poster = toStr(item.cover.url_list[0]);
  var title = toStr(item.title || "PineDrama");
  return {
    id: cid,
    title: title,
    posterUrl: poster,
    backdropUrl: poster,
    description: toStr(item.description || item.categories || ""),
    quality: "PineDrama",
    episode_current: item.num_videos ? item.num_videos + " tập" : "Full",
    year: "",
    lang: "Vietsub",
    datasend: JSON.stringify({
      collection_id: cid,
      title: title,
      posterUrl: poster,
      total: Number(item.num_videos || 0) || 0,
      description: toStr(item.description || item.categories || "")
    })
  };
}

function searchPine(keyword, page) {
  var p = Number(page) || 1;
  var body = searchBody(keyword, p);
  var key = "search:" + keyword + ":" + p;
  var cachedResult = cached(key);
  if (cachedResult) return cachedResult;
  var raw = xhrText("POST", searchUrl(), body, "application/x-www-form-urlencoded");
  if (!raw) return { items: [], page: p, hasMore: false };
  var data = jsonParse(raw, {});
  var list = data.drama_list || [];
  var items = [];
  for (var i = 0; i < list.length; i++) {
    var item = mapSearchItem(list[i]);
    if (item) items.push(item);
  }
  // Nếu có từ 10 phim trở lên hoặc has_more=true, cho phép tải trang tiếp theo
  var hasNext = (data.has_more !== undefined) ? (!!data.has_more || items.length >= 10) : (items.length >= 10);
  var result = {
    items: items,
    page: p,
    hasMore: hasNext,
    total: Number(data.total || 0) || 0
  };
  return cacheSet(key, result);
}

function categoryLink(keyword) {
  return NATIVE_URL + "?pinedrama_cat=" + encodeURIComponent(keyword);
}

function getHomeSections() {
  return JSON.stringify([
    { slug: NATIVE_URL + "?pinedrama_feed=1", title: "Phim Mới", type: "Grid" }
  ]);
}

function getCategories() {
  var data = [
    { keyword: "tình cảm", name: "Tình cảm" },
    { keyword: "trả thù", name: "Trả thù" },
    { keyword: "tổng tài", name: "Tổng tài" },
    { keyword: "ngôn tình", name: "Ngôn tình" },
    { keyword: "cổ trang", name: "Cổ trang" },
    { keyword: "huyền huyễn", name: "Huyền huyễn" },
    { keyword: "gia đình", name: "Gia đình" },
    { keyword: "học đường", name: "Học đường" }
  ];
  var out = [];
  for (var i = 0; i < data.length; i++) {
    out.push({ slug: categoryLink(data[i].keyword), name: data[i].name });
  }
  return out;
}

function getLISTmenu() {
  var list = getCategories();
  var out = [];
  for (var i = 0; i < list.length; i++) out.push({ link: list[i].slug, name: list[i].name });
  return JSON.stringify(out);
}

function getPrimaryCategories() {
  return JSON.stringify(getCategories());
}

function getFilterConfig() {
  return JSON.stringify({ category: getCategories() });
}

function getUrlList(slug, filtersJson) {
  var value = toStr(slug);
  var page = 1;
  try {
    var filters = jsonParse(filtersJson, {});
    if (filters && filters.page) {
      page = Number(filters.page) || 1;
    }
  } catch (e) {}

  // Đính kèm page vào URL để parseListResponse nhận biết được số trang yêu cầu
  function withPage(u, p) {
    if (u.indexOf("page=") >= 0) return u.replace(/page=[0-9]+/, "page=" + p);
    return u + (u.indexOf("?") >= 0 ? "&" : "?") + "page=" + p;
  }

  if (value.indexOf("pinedrama_cat=") >= 0 || value.indexOf("pinedrama_search=") >= 0) {
    return withPage(value, page);
  }
  if (value.indexOf("pinedrama_feed=") >= 0) {
    return withPage(value, page);
  }
  try {
    var filtersObj = jsonParse(filtersJson, {});
    if (filtersObj && filtersObj.category) {
      var cat = filtersObj.category;
      if (Array.isArray(cat) && cat.length) {
        var first = cat[0];
        var catSlug = (first && first.slug) ? toStr(first.slug) : toStr(first);
        if (catSlug) return withPage(catSlug, page);
      } else if (typeof cat === "string") {
        return withPage(categoryLink(cat), page);
      }
    }
  } catch (e) {}
  return withPage(NATIVE_URL + "?pinedrama_feed=1", page);
}

function getUrlSearch(keyword, filtersJson) {
  var page = 1;
  try {
    var filters = jsonParse(filtersJson, {});
    if (filters && filters.page) page = Number(filters.page) || 1;
  } catch (e) {}
  return NATIVE_URL + "?pinedrama_search=" + encodeURIComponent(toStr(keyword)) + "&page=" + page;
}

function getUrlDetail(slug, datasend) {
  var data = jsonParse(datasend || "{}", {});
  var cid = extractId(slug) || toStr(data.collection_id || data.cid || data.id);
  if (!cid) return "";
  try {
    return JSON.stringify(buildDetail(cid, data));
  } catch (e) {
    logPine("getUrlDetail error " + (e.message || e));
    return "";
  }
}

function getHomeFeed(page) {
  page = Number(page) || 1;
  var key = "home:feed:page:" + page;
  var cachedResult = cached(key);
  if (cachedResult) return cachedResult;

  // Sử dụng từ khóa tổng quát "phim" để phân trang vô hạn mượt mà
  var search = searchPine("phim", page);
  var items = (search && search.items) ? search.items : [];

  // Nếu trang 1 tìm kiếm rỗng, fallback kết hợp từ các thể loại hot
  if ((!items || !items.length) && page === 1) {
    var defaultKeywords = ["tổng tài", "trả thù", "tình cảm", "ngôn tình"];
    var seen = {};
    items = [];
    for (var k = 0; k < defaultKeywords.length; k++) {
      var s = searchPine(defaultKeywords[k], 1);
      if (s && s.items) {
        for (var i = 0; i < s.items.length; i++) {
          var it = s.items[i];
          if (!seen[it.id]) {
            seen[it.id] = 1;
            items.push(it);
          }
        }
      }
      if (items.length >= 30) break;
    }
  }

  var result = {
    items: items,
    currentPage: page,
    totalPages: items.length >= 10 ? page + 1 : page
  };
  return cacheSet(key, result);
}

function parseListResponse(raw, url) {
  try {
    var target = toStr(url);
    var page = Number(extractParam(target, "page") || 1) || 1;
    var keyword = extractParam(target, "pinedrama_cat") || extractParam(target, "pinedrama_search");
    if (keyword) {
      var search = searchPine(keyword, page);
      return JSON.stringify({
        items: search.items,
        pagination: { currentPage: page, totalPages: search.hasMore ? page + 1 : page }
      });
    }
    if (target.indexOf("pinedrama_feed=") >= 0) {
      var feedData = getHomeFeed(page);
      return JSON.stringify({
        items: feedData.items,
        pagination: { currentPage: feedData.currentPage, totalPages: feedData.totalPages }
      });
    }
    var fallbackFeed = getHomeFeed(page);
    return JSON.stringify({
      items: fallbackFeed.items,
      pagination: { currentPage: fallbackFeed.currentPage, totalPages: fallbackFeed.totalPages }
    });
  } catch (e) {
    logPine("parseListResponse error " + (e.message || e));
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseSearchResponse(raw, url) {
  try {
    var target = toStr(url);
    var keyword = extractParam(target, "pinedrama_search") || extractParam(target, "pinedrama_cat");
    var page = Number(extractParam(target, "page") || 1) || 1;
    var result = searchPine(keyword, page);
    return JSON.stringify({
      items: result.items,
      pagination: { currentPage: page, totalPages: result.hasMore ? page + 1 : page }
    });
  } catch (e) {
    logPine("parseSearchResponse error " + (e.message || e));
    return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
  }
}

function parseMovieDetail(html, apiUrl, datasend) {
  try {
    var data = jsonParse(datasend || getPipeData(apiUrl), {});
    var cid = toStr(data.collection_id || data.cid || data.id || extractId(apiUrl));
    if (!cid) return JSON.stringify({ id: "", title: "", servers: [] });
    return JSON.stringify(buildDetail(cid, data));
  } catch (e) {
    logPine("parseMovieDetail error " + (e.message || e));
    return JSON.stringify({ id: "", title: "", servers: [] });
  }
}

function streamJson(data) {
  return JSON.stringify({
    url: toStr(data.url || ""),
    mimeType: toStr(data.mimeType || "video/mp4"),
    isEmbed: false,
    headers: data.headers || STREAM_HEADERS,
    subtitles: data.subtitles || []
  });
}

function findEpisodeStream(episodeId) {
  var aid = extractParam(episodeId, "pinedrama_ep");
  var cid = extractParam(episodeId, "cid") || extractId(episodeId);
  if (!cid) return "";
  var movie = buildDetail(cid, { total: 0 });
  var servers = movie.servers || [];
  for (var i = 0; i < servers.length; i++) {
    var episodes = servers[i].episodes || [];
    for (var j = 0; j < episodes.length; j++) {
      if (!aid || episodes[j].id.indexOf(aid) >= 0) {
        var data = jsonParse(episodes[j].datasend, {});
        if (data.url) return streamJson(data);
      }
    }
  }
  return "";
}

function getStreamLink(episodeId, datasend) {
  var data = jsonParse(datasend || getPipeData(episodeId), {});
  if (data.url) return streamJson(data);
  return findEpisodeStream(episodeId);
}

function parseDetailResponse(raw, url, datasend) {
  var data = jsonParse(datasend || getPipeData(url), {});
  if (data.url) return streamJson(data);
  return findEpisodeStream(url);
}

function parseCategoriesResponse() {
  return getPrimaryCategories();
}

function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }
function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }
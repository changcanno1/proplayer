var iddomain = "bilutv";
BASEURL = "https://www.bilibili.tv";
NEWDOMAIN = false;
var popup_html = "";
BASEAPI = "https://api.bilibili.tv";
BASELINK = BASEAPI;
// ============================================================
// FETCH THROTTLE — delay tối thiểu giữa các request
// ============================================================
// https://api.bilibili.tv/intl/gateway/web/v2/ogv/season/detail?season_id=1005144&s_locale=vi_VN&platform=web
function getManifest() {
  try {
    return JSON.stringify({
      "id": "bilibili",
      "name": "Bilibili [ANIME]",
      "version": "1.6",
      "author": "Alokillgtv",
      "info": "Update 1.4 Nâng cấp acc Vip xem được Anime có bản quyền.",
      "baseUrl": "https://bilibili.alokillgtv02.workers.dev/login",
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/icon/bilibili.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "type": "ANIME",
      "subtitleCat": false,
      "debug": true,
      "playerType": "exoplayer"
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
      "playerType": "exoplayer"
    });
  }
}
//
{
  var __lastFetchTs = 0;
  var FETCH_MIN_INTERVAL_MS = 250;   // 250ms — chỉnh 150-400 tuỳ nhu cầu
  
  function _sleep(ms) {
    try {
      var start = Date.now();
      while (Date.now() - start < ms) { /* busy wait */ }
    } catch (e) {}
  }
  
  function _waitFetchSlot() {
    var now = Date.now();
    var elapsed = now - __lastFetchTs;
    if (elapsed < FETCH_MIN_INTERVAL_MS) {
      _sleep(FETCH_MIN_INTERVAL_MS - elapsed);
    }
    __lastFetchTs = Date.now();
  }

  
  var WORKER_URL = 'https://bilibili.alokillgtv02.workers.dev';
  var HLS_LOCAL_URL = 'https://vax.local';
  var AUTH_TOKEN = '';
  var BILI_USER = 'alokillgtv@gmail.com';
  var BILI_PASS = 'Exciter150';
  var BASE = {
    passport: 'https://passport.bilibili.tv',
    api:      'https://api.bilibili.tv',
    spi:      'https://api.bilibili.com/x/frontend/finger/spi',
    locale:   'vi_VN',
    platform: 'web',
    ua: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    origin:   'https://www.bilibili.tv',
    referer:  'https://www.bilibili.tv/',
  };
  // ============================================================
  // Bilibili native — dùng JSBN thay BigInt
  // ============================================================
  // ============================================================
  // LOAD JSBN — cache lại sau lần đầu
  // ============================================================
var _jsbnLoaded = false;

function loadJsbn() {
  if (_jsbnLoaded && typeof BigInteger !== 'undefined' && BigInteger) return;

  // URL đúng: jsbn.js chứ không phải index.js
  var cdns = [
    'https://cdn.jsdelivr.net/npm/jsbn@1.1.0/jsbn.js',
    'https://unpkg.com/jsbn@1.1.0/jsbn.js',
    'https://cdn.jsdelivr.net/npm/jsbn@1.1.0/index.js',
  ];

  var lastErr = null;

  for (var i = 0; i < cdns.length; i++) {
    var url = cdns[i];
    try {
      console.log('[jsbn] Thử: ' + url);
      var res = httpRequest(url, { method: 'GET' });
      var code = (res && res.body) ? res.body : String(res);

      // 1. Validate: phải là JS, không phải HTML
      if (!code || code.length < 100) {
        lastErr = new Error('Rỗng hoặc quá ngắn');
        continue;
      }
      if (code.indexOf('<html') !== -1 || code.indexOf('<!DOCTYPE') !== -1 ||
          code.indexOf('<head') !== -1 || code.indexOf('404') === 0) {
        lastErr = new Error('CDN trả về HTML (404)');
        console.log('[jsbn] ' + lastErr.message + ' tại ' + url);
        continue;
      }

      // 2. Eval trong scope có self để capture
      var self = {};
      var captured = null;

      try {
        // new Function với self scope
        var fn = new Function('self', 'globalThis',
          '"use strict";\n' +
          'var global = self;\n' +
          'var window = self;\n' +
          'var module = { exports: {} };\n' +
          'var exports = module.exports;\n' +
          code + '\n' +
          'return (typeof BigInteger !== "undefined" ? BigInteger : null)\n' +
          '    || self.BigInteger\n' +
          '    || module.exports.BigInteger\n' +
          '    || (typeof module.exports === "function" ? module.exports : null);'
        );
        captured = fn(self, self);
      } catch (e1) {
        // Fallback: eval trực tiếp
        try {
          eval(code);
        } catch (e2) {
          lastErr = e2;
          continue;
        }
      }

      // 3. Gán vào global
      if (typeof BigInteger === 'undefined' || !BigInteger) {
        if (captured) {
          BigInteger = captured;
        } else if (self.BigInteger) {
          BigInteger = self.BigInteger;
        }
      }

      // 4. Kiểm tra
      if (typeof BigInteger !== 'undefined' && BigInteger &&
          typeof BigInteger.prototype.modPow === 'function') {
        _jsbnLoaded = true;
        console.log('[jsbn] Loaded OK từ ' + url);
        return;
      }

      lastErr = new Error('Eval xong nhưng BigInteger invalid');
    } catch (e) {
      lastErr = e;
      console.log('[jsbn] Lỗi tại ' + url + ': ' + (e.message || e));
    }
  }

  throw new Error('Không load được jsbn. Lỗi cuối: ' +
    (lastErr ? lastErr.message : 'unknown'));
}
  
  // ============================================================
  // COOKIE HELPERS
  // ============================================================
function cookiesToStr(c) {
  // ⭐ Whitelist cookie cần cho Bilibili, bỏ hết cookie rác (g_state, ...)
  var ALLOWED = {
    SESSDATA: 1, bili_jct: 1, joy_jct: 1,
    DedeUserID: 1, DedeUserID__ckMd5: 1,
    buvid3: 1, buvid4: 1, mid: 1,
    'bstar-web-lang': 1
  };

  var p = [];
  for (var k in c) {
    if (!c.hasOwnProperty(k)) continue;

    // ⭐ Bỏ mọi cookie không có trong whitelist (g_state, bsource, ...)
    if (!ALLOWED[k]) continue;

    var v = String(c[k]);

    // ⭐ Encode mọi ký tự nguy hiểm nếu chưa encoded
    //    (đặc biệt `"`, `,`, `{`, `}`, space — có trong g_state)
    if (v.indexOf('%') === -1) {
      v = v.replace(/"/g, '%22')
           .replace(/\{/g, '%7B')
           .replace(/\}/g, '%7D')
           .replace(/:/g, '%3A')
           .replace(/,/g, '%2C')
           .replace(/;/g, '%3B')
           .replace(/ /g, '%20')
           .replace(/\*/g, '%2A')
           .replace(/\+/g, '%2B')
           .replace(/\//g, '%2F')
           .replace(/=/g, '%3D');
    }

    p.push(k + '=' + v);
  }
  return p.join('; ');
}
  
  function readSetCookies(res) {
    var out = {};
    if (!res || !res.headers) return out;
    var raw = res.headers['set-cookie'] || res.headers['Set-Cookie'];
    if (!raw) return out;
    var arr = (raw instanceof Array) ? raw : String(raw).split(/,(?=[^;]+=[^;]+)/);
    for (var i = 0; i < arr.length; i++) {
      var pair = String(arr[i]).split(';')[0].trim();
      var eq = pair.indexOf('=');
      if (eq > 0) out[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
    }
    return out;
  }
  
  function mergeCookies(dst, src) {
    for (var k in src) if (src.hasOwnProperty(k)) dst[k] = src[k];
    return dst;
  }



  
  // ============================================================
  // BASE64 / UTF-8 / RANDOM
  // ============================================================
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  function bytesToBase64(b) {
    var o = '';
    for (var i = 0; i < b.length; i += 3) {
      var b1 = b[i], b2 = i + 1 < b.length ? b[i + 1] : 0, b3 = i + 2 < b.length ? b[i + 2] : 0;
      o += B64[b1 >> 2];
      o += B64[((b1 & 3) << 4) | (b2 >> 4)];
      o += i + 1 < b.length ? B64[((b2 & 15) << 2) | (b3 >> 6)] : '=';
      o += i + 2 < b.length ? B64[b3 & 63] : '=';
    }
    return o;
  }
  
  function base64ToBytes(s) {
    var c = String(s).replace(/[^A-Za-z0-9+/]/g, '');
    var o = new Uint8Array((c.length * 3) >> 2);
    var p = 0;
    for (var i = 0; i < c.length; i += 4) {
      var n = (B64.indexOf(c[i]) << 18) |
              (B64.indexOf(c[i + 1]) << 12) |
              (B64.indexOf(c[i + 2] || 'A') << 6) |
               B64.indexOf(c[i + 3] || 'A');
      if (p < o.length) o[p++] = (n >> 16) & 255;
      if (p < o.length) o[p++] = (n >> 8) & 255;
      if (p < o.length) o[p++] = n & 255;
    }
    return o;
  }
  
  function utf8(s) {
    var o = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) o.push(c);
      else if (c < 0x800) o.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else o.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    return new Uint8Array(o);
  }
  
  function randBytes(n) {
    var a = new Uint8Array(n);
    for (var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return a;
  }
  
  function bytesToHex(b) {
    var s = '';
    for (var i = 0; i < b.length; i++) {
      var h = b[i].toString(16);
      if (h.length < 2) h = '0' + h;
      s += h;
    }
    return s;
  }
  
  // ============================================================
  // RSA PKCS#1 v1.5 — dùng BigInteger của jsbn
  // ============================================================
  function parsePubKey(pem) {
    var body = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
    var der = base64ToBytes(body);
    var pos = 0;
  
    function len() {
      var l = der[pos++];
      if (l & 0x80) {
        var n = l & 0x7f;
        l = 0;
        for (var i = 0; i < n; i++) l = (l << 8) | der[pos++];
      }
      return l;
    }
    function tag(t) {
      var g = der[pos++];
      if (g !== t) throw new Error('ASN.1: expected ' + t + ', got ' + g);
      return len();
    }
    function skip() { var l = tag(0x30); pos += l; }
    function integer() {
      var l = tag(0x02);
      // Bỏ leading zero nếu có
      var start = pos;
      if (l > 0 && der[pos] === 0) { start = pos + 1; l--; }
      var slice = der.subarray ? der.subarray(start, start + l) : der.slice(start, start + l);
      pos = start + l;
      return new BigInteger(bytesToHex(slice), 16);
    }
  
    tag(0x30); skip(); tag(0x03); pos++; tag(0x30);
    return { n: integer(), e: integer() };
  }
  
  function rsaEncrypt(plain, pem) {
    var k = parsePubKey(pem);
  
    // keyLen = số byte của modulus
    var keyLen = Math.ceil(k.n.bitLength() / 8);
  
    var msg = utf8(plain);
    var psLen = keyLen - msg.length - 3;
    if (psLen < 8) throw new Error('Message too long: ' + msg.length + ' bytes');
  
    // EM = 0x00 || 0x02 || PS || 0x00 || M
    var em = new Uint8Array(keyLen);
    em[0] = 0x00;
    em[1] = 0x02;
  
    var filled = 0;
    while (filled < psLen) {
      var r = randBytes(psLen - filled + 8);
      for (var i = 0; i < r.length; i++) {
        if (r[i] !== 0) {
          em[2 + filled] = r[i];
          filled++;
          if (filled >= psLen) break;
        }
      }
    }
    em[2 + psLen] = 0x00;
    em.set ? em.set(msg, 3 + psLen) : (function () {
      for (var j = 0; j < msg.length; j++) em[3 + psLen + j] = msg[j];
    })();
  
    // m = BigInteger(EM)
    var m = new BigInteger(bytesToHex(em), 16);
  
    // c = m^e mod n
    var c = m.modPow(k.e, k.n);
  
    // c → bytes (đúng keyLen byte)
    var cHex = c.toString(16);
    if (cHex.length < keyLen * 2) {
      while (cHex.length < keyLen * 2) cHex = '0' + cHex;
    }
    if (cHex.length > keyLen * 2) {
      cHex = cHex.slice(cHex.length - keyLen * 2);
    }
  
    var cBytes = new Uint8Array(keyLen);
    for (var p = 0; p < keyLen; p++) {
      cBytes[p] = parseInt(cHex.substr(p * 2, 2), 16);
    }
  
    return bytesToBase64(cBytes);
  }
  
  // ============================================================
  // FINGERPRINT
  // ============================================================
  function getFingerprint() {
    var res = httpRequest(BASE.spi, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': BASE.ua,
        'Origin': BASE.origin,
        'Referer': BASE.referer,
      },
    });
    var data = JSON.parse(res.body || res);
    if (data.code !== 0) throw new Error('SPI: ' + data.message);
    var b3 = data.data.b_3;
    if (b3 && b3.indexOf('infoc') === -1) b3 += 'infoc';
    return { buvid3: b3, buvid4: data.data.b_4, b_nut: String(Math.floor(Date.now() / 1000)) };
  }
  
  // ============================================================
  // LOGIN
  // ============================================================
  function loginBili(username, password) {
    loadJsbn(); // đảm bảo BigInteger có sẵn
  
    var fp = getFingerprint();
    var ck = {
      buvid3: fp.buvid3,
      buvid4: fp.buvid4,
      b_nut: fp.b_nut,
      'bstar-web-lang': 'vi',
    };
  
    // B1: RSA public key
    var keyRes = httpRequest(
      BASE.passport + '/x/intl/passport-login/web/key?s_locale=' + BASE.locale + '&platform=' + BASE.platform,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': BASE.ua,
          'Origin': BASE.origin,
          'Referer': BASE.referer,
          'Cookie': cookiesToStr(ck),
        },
      }
    );
    var keyData = JSON.parse(keyRes.body || keyRes);
    if (keyData.code !== 0) throw new Error('Key: ' + keyData.message);
  
    // B2: encrypt password
    var encPwd = rsaEncrypt(keyData.data.hash + password, keyData.data.key);
  
    // B3: POST login
    var loginRes = httpRequest(
      BASE.passport + '/x/intl/passport-login/web/login/password?s_locale=' + BASE.locale + '&platform=' + BASE.platform,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': BASE.ua,
          'Origin': BASE.origin,
          'Referer': BASE.referer,
          'Cookie': cookiesToStr(ck),
        },
        body: 'username=' + encodeURIComponent(username) +
              '&password=' + encodeURIComponent(encPwd) +
              '&keep_me=false' +
              '&go_url=' + encodeURIComponent('https://www.bilibili.tv/vi'),
      }
    );
  
    mergeCookies(ck, readSetCookies(loginRes));
    var loginData = JSON.parse(loginRes.body || loginRes);
    if (loginData.code !== 0) {
      var err = new Error('Login: ' + loginData.message);
      err.code = loginData.code;
      throw err;
    }
  
    // B4: follow cross_domain để lấy SESSDATA
    var nextUrl = loginData.data.go_url;
    var hops = 0;
    while (nextUrl && hops < 5) {
      var r = httpRequest(nextUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,*/*;q=0.8',
          'User-Agent': BASE.ua,
          'Cookie': cookiesToStr(ck),
        },
      });
      mergeCookies(ck, readSetCookies(r));
  
      if (ck.SESSDATA) break;
  
      var loc = r.headers && (r.headers['location'] || r.headers['Location']);
      if (!loc) break;
      nextUrl = loc.indexOf('http') === 0 ? loc : (BASE.referer + loc);
      hops++;
    }
  
    if (!ck.SESSDATA) {
      throw new Error('Không lấy được SESSDATA. Cookies: ' + JSON.stringify(ck));
    }
    return ck;
  }
  
  // ============================================================
  // WORKER API
  // ============================================================
  function workerGet(path) {
    var h = { 'Accept': 'application/json' };
    if (AUTH_TOKEN) h['X-Auth-Token'] = AUTH_TOKEN;
    return httpRequest(WORKER_URL + path, { method: 'GET', headers: h });
  }
  
  function workerPost(path, obj) {
    var h = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (AUTH_TOKEN) h['X-Auth-Token'] = AUTH_TOKEN;
    return httpRequest(WORKER_URL + path, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(obj),
    });
  }
  // ============================================================
  // ACQUIRE SESSION
  // ============================================================
  
  function buildQuery(obj) {
    var parts = [];
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && obj[k] != null) {
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(obj[k])));
      }
    }
    return parts.join('&');
  }
  
  function getPlayurl(params, username, password, qn) {
    // ===== 1. NORMALIZE INPUT =====
    var p;
    if (params == null) {
      throw new Error('getPlayurl: params rỗng');
    }
    if (typeof params === 'number' || typeof params === 'string') {
      // Truyền thẳng id → mặc định coi là aid (UGC)
      p = { aid: String(params) };
    } else if (typeof params === 'object') {
      p = params;
    } else {
      throw new Error('getPlayurl: params phải là số/chuỗi/object');
    }
  
    qn = qn || p.qn || 80;
  
    // ===== 2. AUTO-DETECT LOẠI CONTENT =====
    var isUGC = !!(p.aid || p.bvid);
    var isPGC = !!(p.ep_id || p.season_id);
  
    if (!isUGC && !isPGC) {
      throw new Error('getPlayurl: cần 1 trong ep_id/season_id/aid/bvid');
    }
  
    // ===== 3. DEFAULT spm_id THEO LOẠI =====
     if (isUGC) {
      if (!p.spm_id) p.spm_id = 'bstar-web.ugc-video-detail.0.0';
      if (!p.from_spm_id) p.from_spm_id = 'bstar-web.homepage.recommend.all';
    } else {
      if (!p.spm_id) p.spm_id = 'bstar-web.pgc-video-detail.0.0';
      if (!p.from_spm_id) p.from_spm_id = 'bstar-web.pgc-video-detail.episode.all';  // ⭐
    }
  
    // ===== 4. BUILD REFERER =====
    // ===== 4. BUILD REFERER =====
    var referer = p.referer;
    if (!referer) {
      if (isUGC) {
        referer = 'https://www.bilibili.tv/vi/video/' + (p.aid || p.bvid);
      } else {
        // ⭐ PGC: cấu trúc /vi/play/{season_id}/{ep_id}?bstar_from=...
        if (p.season_id && p.ep_id) {
          referer = 'https://www.bilibili.tv/vi/play/' + p.season_id + '/' + p.ep_id +
                    '?bstar_from=bstar-web.pgc-video-detail.episode.all';
        } else if (p.ep_id) {
          referer = 'https://www.bilibili.tv/vi/play/' + p.ep_id +
                    '?bstar_from=bstar-web.pgc-video-detail.episode.all';
        } else {
          referer = 'https://www.bilibili.tv/vi/play/' + p.season_id;
        }
      }
    }
  
    // ===== 5. BUILD QUERY PARAMS =====
    // ===== 5. BUILD QUERY PARAMS =====
    var queryParams = {
      s_locale:    BASE.locale,
      platform:    'web',
      qn:          String(qn),
      type:        '0',
      device:      'wap',            // ⭐ browser dùng wap
      tf:          '0',
      tk:          '',                // ⭐ browser có tk= rỗng
      spm_id:      p.spm_id,
      from_spm_id: p.from_spm_id
    };
  
    if (p.ep_id)     queryParams.ep_id     = String(p.ep_id);
    if (p.aid)       queryParams.aid       = String(p.aid);
    if (p.bvid)      queryParams.bvid      = String(p.bvid);
    if (p.cid)       queryParams.cid       = String(p.cid);

    // ⭐ season_id — chặn mọi giá trị rác
    if (p.season_id != null) {
      var sid = String(p.season_id).trim();
      if (sid && sid !== 'undefined' && sid !== 'null' && sid !== 'NaN') {
        queryParams.season_id = sid;
      }
    }
  
    // Extra — cho phép override bất kỳ field nào
    if (p.extra && typeof p.extra === 'object') {
      for (var k in p.extra) {
        if (p.extra.hasOwnProperty(k)) {
          queryParams[k] = String(p.extra[k]);
        }
      }
    }
  
    // ===== 6. BUILD URL =====
    var url = BASE.api + '/intl/gateway/web/playurl?' + buildQuery(queryParams);
  
    console.log('[Playurl] ' + (isUGC ? 'UGC' : 'PGC') + ' → ' + url);
  
    // ===== 7. LẤY SESSION =====
    var sess = acquireSession(username, password);
    var ck = sess.cookies;
    var ckStr = cookiesToStr(ck);
    console.log('[Playurl] Full cookie: ' + ckStr.replace(/SESSDATA=[^;]+/, 'SESSDATA=***'));
    console.log('[Playurl] Cookie len: ' + ckStr.length);
    console.log('[Playurl] mid: ' + (ck.mid || ck.DedeUserID || 'MISSING'));
  
    // ===== 8. GỌI API =====
        var res = httpRequest(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'vi-VN',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Origin': BASE.origin,
        'Referer': referer,
        'Cookie': ckStr
      }
    });
  
    var data = JSON.parse(res.body || res);
    console.log('[Playurl] Response raw: ' + res.body);
    console.log('[Playurl] Response code: ' + data.code);
  
    // ===== 9. RETRY NẾU SESSION HẾT HẠN =====
    if (data.code === -101 || data.code === 10004001) {
      console.log('[Playurl] Session hết hạn, login lại...');
      workerPost('/session/expired', { reason: 'code ' + data.code });
  
      sess = acquireSession(username, password);
      ck = sess.cookies;
  
    var res = httpRequest(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'vi-VN',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Origin': BASE.origin,
        'Referer': referer,
        'Cookie': ckStr,
        'sec-ch-ua': '"Chromium";v="127", "Not)A;Brand";v="99", "Microsoft Edge Simulate";v="127", "Lemur";v="127"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'priority': 'u=1, i'
      }
    });
      data = JSON.parse(res.body || res);
    }
  
    return data;
  }
  
  // ============================================================
  // HELPERS — cho tiện dùng
  // ============================================================
  function getPlayurlByEp(epId, username, password, qn) {
    return getPlayurl({ ep_id: epId }, username, password, qn);
  }
  
  function getPlayurlByAid(aid, username, password, qn) {
    return getPlayurl({ aid: aid }, username, password, qn);
  }
  
  function getPlayurlByBvid(bvid, username, password, qn) {
    return getPlayurl({ bvid: bvid }, username, password, qn);
  }
  
  // Test — bỏ comment khi cần
  // var r = getPlayurl(4797548016572416, 'alokillgtv@gmail.com', 'Exciter150', 64);
  // console.log(JSON.stringify(r).slice(0, 300));
  
  // ============================================================
  // HELPERS CHO TIỆN DÙNG
  // ============================================================
  function getPlayurlByEp(epId, username, password, qn) {
    return getPlayurl({ ep_id: epId }, username, password, qn);
  }
  
  function getPlayurlByAid(aid, username, password, qn) {
    return getPlayurl({ aid: aid }, username, password, qn);
  }
  
  function getPlayurlByBvid(bvid, username, password, qn) {
    return getPlayurl({ bvid: bvid }, username, password, qn);
  }
function _cleanJson(str) {
    var s = String(str || '');
    // Strip BOM
    if (s.charCodeAt(0) === 0xFEFF) s = s.substring(1);
    // Bỏ ký tự non-printable đầu/cuối (trừ \n \r \t)
    s = s.replace(/^[\x00-\x1F\x7F]+/, '').replace(/[\x00-\x1F\x7F]+$/, '');
    // Tìm JSON object đầu tiên
    var start = s.indexOf('{');
    var end = s.lastIndexOf('}');
    if (start > 0 || (end !== -1 && end < s.length - 1)) {
        if (start !== -1 && end > start) s = s.substring(start, end + 1);
    }
    return s.trim();
}
function getDeviceIdFromCookie() {
  try {
    var raw = getCookie(WORKER_URL + '/login') || '';
    console.log('[Cookie] raw: ' + raw.substring(0, 100));
    var match = raw.match(/device_id=([^;]+)/);
    return match ? match[1].trim() : '';
  } catch (e) {
    console.log('[Cookie] Không đọc được: ' + (e.message || e));
    return '';
  }
}

function getDeviceIdFromCookie() {
  try {
    var raw = getCookie(WORKER_URL + '/login') || '';
    var match = raw.match(/device_id=([^;]+)/);
    return match ? match[1].trim() : '';
  } catch (e) {
    return '';
  }
}

// ⭐ Cache session trong RAM để không login lại trong cùng phiên
var _sessionCache = null;

function acquireSession(username, password) {
  // Cache trong phiên (mở app 1 lần chỉ login 1 lần)
  if (_sessionCache) {
    console.log('[Session] Dùng cache RAM');
    return _sessionCache;
  }

  var deviceId = getDeviceIdFromCookie();
  console.log('[Session] device_id=' + (deviceId || 'CHƯA SETUP'));

  if (!deviceId) {
    throw new Error('Chưa setup. Vào Cài đặt → Đăng nhập.');
  }

  // ⭐ 1. Thử lấy session đã lưu từ worker trước
  try {
    var sessRes = httpRequest(WORKER_URL + '/session?device=' + encodeURIComponent(deviceId), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    var sessInfo = JSON.parse(sessRes.body || sessRes);

    if (sessInfo && sessInfo.ok && sessInfo.hasSession && sessInfo.cookies && !sessInfo.expiredMarked) {
      console.log('[Session] ✓ Dùng session đã lưu (mid=' + sessInfo.mid + ', còn ' + sessInfo.remainingDays + ' ngày)');
      console.log('[Session] Cookie keys: ' + Object.keys(sessInfo.cookies).join(','));
      console.log('[Session] Cookie len: ' + cookiesToStr(sessInfo.cookies).length);

      // ⭐ Cảnh báo nếu thiếu cookie VIP
      var need = ['DedeUserID__ckMd5', 'buvid3', 'buvid4'];
      var miss = need.filter(function(k){ return !sessInfo.cookies[k]; });
      if (miss.length) {
        console.log('[Session] ⚠️ THIẾU cookie VIP: ' + miss.join(', ') +
                    ' → sẽ bị lỗi 10004004 khi xem phim khoá!');
      }

      _sessionCache = {
        cookies: sessInfo.cookies,
        source: 'worker-cached',
        expiresAt: sessInfo.expiresAt
      };
      return _sessionCache;
    }
    console.log('[Session] Worker session không dùng được, login lại');
  } catch (e) {
    console.log('[Session] Lỗi lấy session: ' + (e.message || e));
  }

  // ⭐ 2. Login mới
  try {
    var accRes = httpRequest(WORKER_URL + '/login?action=get', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': 'device_id=' + deviceId
      }
    });
    var acc = JSON.parse(accRes.body || accRes);

    if (!acc || !acc.ok || !acc.username || !acc.password) {
      throw new Error('Không lấy được acc từ worker');
    }

    console.log('[Session] ✓ Login acc: ' + acc.username);
    var fresh = loginBili(acc.username, acc.password);

    // Lưu session mới lên worker
    try {
      httpRequest(WORKER_URL + '/session?device=' + encodeURIComponent(deviceId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          cookies: fresh,
          mid: fresh.DedeUserID,
          note: 'user-' + deviceId
        })
      });
      console.log('[Session] Đã lưu session lên worker');
    } catch (e) {}

    _sessionCache = {
      cookies: fresh,
      source: 'fresh-login',
      username: acc.username
    };
    return _sessionCache;

  } catch (e) {
    var emsg = String(e.message || e);
    if (emsg.indexOf('xác nhận') !== -1 || emsg.indexOf('captcha') !== -1) {
      throw new Error('Bilibili yêu cầu CAPTCHA. Đổi acc khác hoặc đợi 24h.');
    }
    throw new Error('Login fail: ' + emsg);
  }
}
function getPlayerHeaders() {
    var ckStr = '';
    try {
        var sess = acquireSession(BILI_USER, BILI_PASS);
        if (sess && sess.cookies) ckStr = cookiesToStr(sess.cookies);
    } catch (e) {
        console.log('[Hdr] Lỗi lấy cookie: ' + (e.message || e));
    }
    return {
        'User-Agent': BASE.ua,
        'Referer': 'https://www.bilibili.tv/',
        'Origin': 'https://www.bilibili.tv',
        'Cookie': ckStr,
    };
}

function _cleanJsonString(str) {
  var s = String(str || '');
  if (s.charCodeAt(0) === 0xFEFF) s = s.substring(1);
  s = s.replace(/^[\x00-\x1F\x7F]+/, '').replace(/[\x00-\x1F\x7F]+$/, '');
  var start = s.indexOf('{');
  var end = s.lastIndexOf('}');
  if (start !== -1 && end > start) s = s.substring(start, end + 1);
  return s.trim();
}

// ⭐ Check VIP bằng cách gọi playurl tập đầu tiên
// Nếu code=0 → acc có VIP
// Nếu code=10004004 → acc không VIP
// ⭐ Check VIP bằng cách fetch trang chủ bilibili.tv
// Nếu HTML chứa "Premium có giá trị đến" → VIP
// Nếu không → member thường
var _vipCache = null;

function checkVipByHomepage() {
  if (_vipCache !== null) {
    console.log('[VIP-Home] Dùng cache=' + _vipCache);
    return _vipCache;
  }

  try {
    var sess = acquireSession(BILI_USER, BILI_PASS);
    var ckStr = cookiesToStr(sess.cookies);

    var r = httpRequest('https://www.bilibili.tv/vi', {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9',
        'User-Agent': BASE.ua,
        'Referer': 'https://www.bilibili.tv/',
        'Cookie': ckStr
      }
    });

    var html = String(r.body || r);
    console.log('[VIP-Home] HTML len=' + html.length);

    // ⭐ Tìm chuỗi đặc trưng VIP
    var hasVip = html.indexOf('Premium có giá trị đến') !== -1;

    _vipCache = hasVip;
    console.log('[VIP-Home] isVip=' + hasVip);
    return hasVip;

  } catch (e) {
    console.log('[VIP-Home] err: ' + (e.message || e));
    return false;
  }
}
  
  
  // Gọi khi plugin setup player:
  // var headers = getPlayerHeaders();
  // player.setHeaders(headers);  // tuỳ API plugin framework
  
  // ============================================================
  // TEST (bỏ comment khi cần)
  // ============================================================
  // try {
  //   var r = getPlayurl(27387373, BILI_USER, BILI_PASS, 64);
  //   console.log('Result:', JSON.stringify(r).slice(0, 500));
  // } catch (e) {
  //   console.log('Error:', e.message || e);
  // }
  // ===== HÀM MENU LIST BEGIN ======
  function testSession() {
    var sess = acquireSession(BILI_USER, BILI_PASS);
    var ck = sess.cookies;
    var ckStr = cookiesToStr(ck);
  
    console.log('=== TEST SESSION ===');
    console.log('Cookie keys: ' + Object.keys(ck).join(','));
    console.log('SESSDATA: ' + ck.SESSDATA);
    console.log('DedeUserID: ' + ck.DedeUserID);
    console.log('mid: ' + ck.mid);
    console.log('Full cookie string: ' + ckStr);
  
    var res = httpRequest('https://api.bilibili.tv/x/intl/member/info', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': BASE.ua,
        'Origin': BASE.origin,
        'Referer': 'https://www.bilibili.tv/',
        'Cookie': ckStr
      }
    });
    console.log('Member info: ' + (res.body || res));
  
    return ck;
  }

// ============================================================
// KIỂM TRA TÀI KHOẢN CÓ VIP HAY KHÔNG
// ============================================================


  
  function fetchHtml(url, username, password, opts) {
// Sau khi lấy body, trước khi return
    
    opts = opts || {};
    var method = (opts.method || 'GET').toUpperCase();
    var wantsRaw = !!opts.raw;
    _waitFetchSlot();   // ⭐ THÊM DÒNG NÀY — delay trước mỗi request
    // ===== 1. Lấy session =====
    var sess = acquireSession(username, password);
    var ck = sess.cookies;
    var ckStr = cookiesToStr(ck);
  
    // ===== 2. Referer mặc định =====
    var referer = opts.referer;
    if (!referer) {
      try {
        var u = new URL(url);
        referer = u.origin + '/';
      } catch (e) {
        referer = 'https://www.bilibili.tv/';
      }
    }
  
    // ===== 3. Build headers =====
    var headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      'Origin': BASE.origin,
      'Referer': referer,
      'Cookie': ckStr,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="127", "Not)A;Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',      // ⭐ đổi Android → Windows
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'priority': 'u=1, i',
      'DNT': '1'
    };
  
    // Ghi đè bằng header tuỳ chỉnh
    if (opts.headers && typeof opts.headers === 'object') {
      for (var hk in opts.headers) {
        if (opts.headers.hasOwnProperty(hk)) {
          headers[hk] = opts.headers[hk];
        }
      }
    }
  
    console.log('[FetchHtml] ' + method + ' ' + url);
    console.log('[FetchHtml] Cookie len: ' + ckStr.length + ', mid: ' + (ck.mid || 'MISSING'));
  
    // ===== 4. Gọi =====
    var reqOpts = {
      method: method,
      headers: headers
    };
    if (method === 'POST' && opts.body != null) {
      reqOpts.body = opts.body;
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }
  
    var res = httpRequest(url, reqOpts);
    var body = res.body || res;
  
    console.log('[FetchHtml] Status: ' + (res.status || 'N/A') + ', len: ' + body.length);
  
    // ===== 5. Check session expired nếu response là JSON =====
    var parsed = null;
    var trimmed = String(body).trim();
    if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
      try { parsed = JSON.parse(trimmed); } catch (e) { parsed = null; }
    }
  
    var needRetry = false;
    if (parsed && (parsed.code === -101 || parsed.code === 10004001)) {
      needRetry = true;
    }
    // Cũng retry nếu HTML chứa dấu hiệu redirect login
    if (!parsed && (trimmed.indexOf('passport.bilibili') !== -1 || trimmed.indexOf('login') !== -1) && trimmed.length < 5000) {
      // không chắc chắn — bỏ qua trường hợp này để tránh retry sai
    }
  
    if (needRetry && opts.retry !== false) {
      console.log('[FetchHtml] Session hết hạn (code ' + parsed.code + '), login lại...');
      workerPost('/session/expired', { reason: 'code ' + parsed.code });
  
      sess = acquireSession(username, password);
      ck = sess.cookies;
      headers['Cookie'] = cookiesToStr(ck);
  
      res = httpRequest(url, reqOpts);
      body = res.body || res;
      console.log('[FetchHtml] Retry status: ' + (res.status || 'N/A') + ', len: ' + body.length);
    }

        // ===== 6. Phát hiện 412 / anti-bot =====
    var bodyStr = String(body || '');
    if (res && (res.status === 412 ||
        bodyStr.indexOf('错误号: 412') !== -1 ||
        bodyStr.indexOf('security control policy') !== -1)) {
      console.log('[FetchHtml] ⚠️ 412 — bị Bilibili chặn cho URL: ' + url);
      return JSON.stringify({
        code: -412,
        message: 'Bilibili chặn (412)',
        data: { cards: [], has_next: false, total: 0 }
      });
    }

    return wantsRaw ? body : body;
  }
//console.log("header: \n" + JSON.stringify(testSession()))

// ============================================================
// SERIES GROUPING — Helpers
// ============================================================

// Bỏ dấu tiếng Việt (fallback nếu engine không có String.normalize)
function removeAccents(str) {
  var map = {
    'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ằ':'a','ắ':'a','ẳ':'a','ẵ':'a','ặ':'a',
    'â':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a','đ':'d',
    'è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e',
    'ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i',
    'ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ồ':'o','ố':'o','ổ':'o','ỗ':'o','ộ':'o',
    'ơ':'o','ờ':'o','ớ':'o','ở':'o','ỡ':'o','ợ':'o',
    'ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u',
    'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y'
  };
  return String(str).toLowerCase().replace(/[^\u0000-\u007E]/g, function(ch){
    return map[ch] || ch;
  });
}

function normalizeKey(s) {
  var out = removeAccents(s);
  out = out.replace(/[^a-z0-9]+/g, '_');
  out = out.replace(/^_+|_+$/g, '');
  return out;
}

// Regex extract season/ep và strip base title
var SERIES_SEASON_REGEXES = [
  /\bphần\s*(\d+)/i,
  /\bmùa\s*(\d+)/i,
  /\bseason\s*(\d+)/i,
  /\bss\s*(\d+)/i,
  /\bs(\d+)\b/i
];

var SERIES_EP_REGEXES = [
  /\btập\s*(\d+(?:\.\d+)?)/i,
  /\bepisode\s*(\d+(?:\.\d+)?)/i,
  /\bep\s*\.?\s*(\d+(?:\.\d+)?)/i,
  /\bpart\s*(\d+(?:\.\d+)?)/i
];

var SERIES_CLEANUP_RULES = [
  // Season
  /\s*[\(\[]?\s*(phần|mùa|season)\s*\d+\s*[\)\]]?\s*/gi,
  /\s*[\(\[]?\s*(ss|s)\s*\d+\s*[\)\]]?\s*/gi,
  // Episode
  /\s*[\(\[]?\s*(tập|episode|ep\.?|part)\s*\d+(?:\.\d+)?\s*[\)\]]?\s*/gi,
  /\s*[\(\[]?\s*(tập|episode)\s*(cuối|cuoi|final)\s*[\)\]]?\s*/gi,
  // Language tags
  /\s*[\(\[]?\s*(vietsub|lồng tiếng|thuyết minh|engsub|phụ đề|multi sub|pđ|pd)\s*[\)\]]?\s*/gi
];

function extractPrefix(title) {
  // Chỉ cắt tại dấu ":" hoặc "|" đầu tiên (không cắt tại "-")
  var m = title.match(/^(.{8,100}?)\s*[:|]\s+.+$/);
  if (m) {
    var prefix = m[1].trim();
    // Loại các prefix vô nghĩa
    if (/^(review phim|review|tóm tắt|trailer|clip|short|video)$/i.test(prefix)) return null;
    return prefix;
  }
  return null;
}

// Trả về { baseTitle, key, season, ep } hoặc null nếu không phải series
function extractBaseTitle(title) {
  var work = String(title).trim();

  // ⭐ Bước 1: Bỏ prefix dạng [Phần 1], [S6], [SS3], [Mùa 2], [Season 1], [Tập 5]
  // để tránh regex nhầm cut ở index 1 → base = "["
  work = work.replace(
    /^\s*\[\s*(phần|mùa|season|ss|s|tập|episode|ep)\s*\d+[^\]]*\]\s*/i,
    ''
  );

  // ⭐ Bước 2: CHỈ cắt tại marker TẬP (không cắt tại "phần/mùa/season" nữa)
  // → giữ "Phần 2" trong base để phân biệt mùa
  var epMarkers = [
    /\btập\s*\d/i,
    /\bepisode\s*\d/i,
    /\bep\s*\.?\s*\d/i,
    /\bpart\s*\d/i
  ];

  var cutPos = work.length;
  for (var i = 0; i < epMarkers.length; i++) {
    var m = work.match(epMarkers[i]);
    if (m && m.index > 2 && m.index < cutPos) cutPos = m.index;
  }

  var base = work.substring(0, cutPos);
  base = base.replace(/[\s\-:.,|\(\[\{]+$/, '').trim();
  base = base.replace(/\s{2,}/g, ' ');

  if (base.length < 3) {
    var parts = work.split(/\s*-\s*/);
    base = (parts[0] || work).trim();
    base = base.replace(/[\s\-:.,|\(\[\{]+$/, '').trim();
  }

  return base;
}

function parseEpisodeInfo(title) {
  if (!title) return null;
  var work = String(title).trim();
  if (work.length < 3) return null;

  var season = null, ep = null;
  var i;

  for (i = 0; i < SERIES_SEASON_REGEXES.length; i++) {
    var sm = work.match(SERIES_SEASON_REGEXES[i]);
    if (sm) { season = parseInt(sm[1], 10); break; }
  }

  for (i = 0; i < SERIES_EP_REGEXES.length; i++) {
    var em = work.match(SERIES_EP_REGEXES[i]);
    if (em) { ep = parseFloat(em[1]); break; }
  }

  // ⭐ Ưu tiên 1: có số tập → dùng logic cũ
  if (ep !== null) {
    var base = extractBaseTitle(work);
    if (base.length < 2) return null;
    return {
      baseTitle: base,
      key: normalizeKey(base),
      season: season,
      ep: ep,
      type: 'episode'
    };
  }

  // ⭐ Ưu tiên 2: có prefix dạng "X: Y" → gom theo prefix
  var prefix = extractPrefix(work);
  if (prefix && prefix.length >= 8) {
    return {
      baseTitle: prefix,
      key: 'prefix_' + normalizeKey(prefix),
      season: null,
      ep: 0,
      type: 'prefix'
    };
  }

  return null;
}

// Parse chuỗi data dạng "type=series&mid=xxx&key=yyy"
function parseDataString(s) {
  var out = {};
  var parts = String(s || '').split('&');
  for (var i = 0; i < parts.length; i++) {
    var eq = parts[i].indexOf('=');
    if (eq > 0) {
      var k = parts[i].slice(0, eq);
      var v = parts[i].slice(eq + 1);
      try { v = decodeURIComponent(v); } catch (e) {}
      out[k] = v;
    }
  }
  return out;
}
}
// ============================================================
// HELPERS — các hàm tiện ích dựa trên fetchHtml
// ============================================================
// ============================================================
// BIẾN VIP TOÀN CỤC
//   vip = true  → acc là VIP      → HIDE_PREMIUM_EPISODES = false (hiện đủ tập)
//   vip = false → acc KHÔNG VIP   → HIDE_PREMIUM_EPISODES = true  (ẩn tập VIP)
// ============================================================


// ⚠️ Không log password ở bất kỳ đâu


// Đồng bộ: check 1 lần / session → cập nhật `vip` và `HIDE_PREMIUM_EPISODES`

function catelist(){
  return `[
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1351254091",
    "img": "https://pic.bstarstatic.com/face/0f2141ec8576ab50d99f0f96e2b52b8746e54538.jpg@240w_320h_1e_1c_90q",
    "title": "PhimBud"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1868894545",
    "img": "https://pic.bstarstatic.com/face/3141ce95e03d6893cb8958773948620725c13532.png@240w_320h_1e_1c_90q",
    "title": "Phim Ngắn 1"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1697846801",
    "img": "https://pic.bstarstatic.com/face/1958ed071ccfa732d8fc5772063eec364f460998.png@240w_320h_1e_1c_90q",
    "title": "Phim Ngắn 2"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1228052336",
    "img": "https://pic.bstarstatic.com/face/8950d6e4d4f08d7bc8654302906457329dbca3ff.jpg@240w_320h_1e_1c_90q",
    "title": "Phim Điện Ảnh VN"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=2085172715",
    "img": "https://pic.bstarstatic.com/face/bb79a5d44a54cf7f82694f7750923161f1c8a196.jpg@240w_320h_1e_1c_90q",
    "title": "phim việt cuối tuần"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1049972648",
    "img": "https://pic.bstarstatic.com/face/74fd44b300a78ee0ca017f8d0c92e4fe9a3fd9c3.jpg@240w_320h_1e_1c_90q",
    "title": "NTK Films"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1673976818",
    "img": "https://pic.bstarstatic.com/face/ddbddbfc5ebbf48d21389b8f3e7cae6ccbebd270.png@240w_320h_1e_1c_90q",
    "title": "JackJack1985_Movie"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1849613692",
    "img": "https://pic.bstarstatic.com/face/cae1b674f8200b85db18c7960a219ac74fe027c6.jpg@240w_320h_1e_1c_90q",
    "title": "Doraemonsub"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1378425611",
    "img": "https://pic.bstarstatic.com/face/a2fed7df4a71f2d47c031b46fe32f25940493c9a.png@240w_320h_1e_1c_90q",
    "title": "DORAEMON FULL HD"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1373826284",
    "img": "https://pic.bstarstatic.com/face/74d42848e14bc24508159eeabbca379d122596a9.png@240w_320h_1e_1c_90q",
    "title": "Tom and Jerry TV.Id"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1863176540",
    "img": "https://pic.bstarstatic.com/face/52e3bad9ba47f232763be3a86cb4fea4229c7df6.jpg@240w_320h_1e_1c_90q",
    "title": "SaáukiKensaiChuoi"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1453904414",
    "img": "https://pic.bstarstatic.com/face/c10d6a4bb926ec90908b53de0951f8f8371d3a93.png@240w_320h_1e_1c_90q",
    "title": "Trúc Anh Animation"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1851797198",
    "img": "https://pic.bstarstatic.com/face/3a764ca911d3de00eb7fcfcc2c2abb281fce63b2.png@240w_320h_1e_1c_90q",
    "title": "tâm thiên long"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1395010662",
    "img": "https://pic.bstarstatic.com/face/68e7c028b6f8ced410e594927650e5f90b13cc91.jpg@240w_320h_1e_1c_90q",
    "title": "Hoạt Hình Ký Ức"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1433482701",
    "img": "https://pic.bstarstatic.com/face/899e8993682cfb0706755971be8b8ea06441ba7c.jpg@240w_320h_1e_1c_90q",
    "title": "Phê Phim"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1863855137",
    "img": "https://pic.bstarstatic.com/face/accfe38f808145519797a62a14bae608cf663488.jpg@240w_320h_1e_1c_90q",
    "title": "Amimephim"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1793452215",
    "img": "https://pic.bstarstatic.com/face/e747ba4634fb5920631a36b2a2d80ba3cf178a12.jpg@240w_320h_1e_1c_90q",
    "title": "phim bộ việt nam 1"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=2041159313",
    "img": "https://pic.bstarstatic.com/face/2788cada5c3386314c5f202ba657e24891a7165f.jpg@240w_320h_1e_1c_90q",
    "title": "KLM 289 Việt Nam"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1571930289",
    "img": "https://pic.bstarstatic.com/face/f1f1a0bc556c67ec04f343a200b94b43c3a9fd0e.jpg@240w_320h_1e_1c_90q",
    "title": "phim bộ việt nam 2"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1233228361",
    "img": "https://pic.bstarstatic.com/face/noface_v1.png@240w_320h_1e_1c_90q",
    "title": "Thế giới phim ngắn"
  },
  {
    "id": "/intl/gateway/web/v2/user/archives?s_locale=vi_VN&platform=web&ps=20&mid=1324486581",
    "img": "https://pic.bstarstatic.com/face/5267ebade9f9af7ef95d6f7bd14c0f3f74ea82eb.png@240w_320h_1e_1c_90q",
    "title": "Hài Tết Mới"
  }  
]`
}

function getHomeSections() {
// https://api.bilibili.tv
// https://api.bilibili.tv/intl/gateway/web/v2/ogv/shorts?s_locale=vi_VN&platform=web&ps=20
      return JSON.stringify([
          {"slug": "/intl/gateway/web/v2/search_v2?s_locale=vi_VN&platform=web&keyword=phim+việt+name&highlight=1&ps=20&qid=&sort=0&duration_type=0","title": "Phim Tiếng Việt","type": "Horizontal"},
          {"slug": "/catelist=true","title": "Kênh Nổi Tiếng","type": "Grid"},
          {"slug": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&ps=20&season_type=1,4","title": "Anime Mới","type": "Grid"},
      ]);
  }
  
  // Hàm khởi tạo thẻ chủ đề
function getLISTmenu() {
    try{
      return `[{
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=-1&ps=20",
    "name": "Tất cả"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20001&ps=20",
    "name": "Tác phẩm gốc"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20002&ps=20",
    "name": "Truyện tranh chuyển thể"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20003&ps=20",
    "name": "Tiểu thuyết chuyển thể"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20004&ps=20",
    "name": "Game chuyển thể"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20006&ps=20",
    "name": "Nhiệt huyết"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20007&ps=20",
    "name": "Dị giới"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20008&ps=20",
    "name": "Siêu năng lực"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20009&ps=20",
    "name": "Xuyên không"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20010&ps=20",
    "name": "Giả tưởng"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20011&ps=20",
    "name": "Hành động"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20012&ps=20",
    "name": "Hài"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20013&ps=20",
    "name": "Đời thường"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20014&ps=20",
    "name": "Khoa học viễn tưởng"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20015&ps=20",
    "name": "Moe"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20016&ps=20",
    "name": "Chữa lành"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20017&ps=20",
    "name": "Vườn trường"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20018&ps=20",
    "name": "Thiếu nhi"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20019&ps=20",
    "name": "Tình yêu"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20020&ps=20",
    "name": "Thiếu nữ"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20021&ps=20",
    "name": "Phiêu lưu"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20022&ps=20",
    "name": "Lịch sử"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20023&ps=20",
    "name": "Mecha"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20024&ps=20",
    "name": "Thể thao"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20025&ps=20",
    "name": "Truyền cảm hứng"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20026&ps=20",
    "name": "Âm nhạc"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20027&ps=20",
    "name": "Thần bí"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20028&ps=20",
    "name": "Thần tượng"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20029&ps=20",
    "name": "Công sở"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20030&ps=20",
    "name": "Ẩm thực"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20031&ps=20",
    "name": "Cổ trang"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20032&ps=20",
    "name": "Huyền huyễn"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20033&ps=20",
    "name": "Thăng cấp"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20034&ps=20",
    "name": "Phục thù"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20035&ps=20",
    "name": "Suy luận"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20036&ps=20",
    "name": "Cảm động"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20037&ps=20",
    "name": "Kiếm hiệp"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20038&ps=20",
    "name": "Hậu cung"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20039&ps=20",
    "name": "Furry"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20041&ps=20",
    "name": "Đam mỹ"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20042&ps=20",
    "name": "Bách hợp"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20043&ps=20",
    "name": "Thành thị"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20044&ps=20",
    "name": "Thi đấu"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20045&ps=20",
    "name": "Hiện đại"
}, {
    "link": "/intl/gateway/web/v2/ogv/index/items_v2?s_locale=vi_VN&platform=web&season_type=1,4&style_id=20046&ps=20",
    "name": "Truyện"
}]`;
    } catch(e){
      log("getLISTmenu[err]:\n " + e);
      return `[
        {"link":"/","name":"Đang lỗi getLISTmenu()"},
      ]`;
    }
  }
 // getHomeSections(), getLISTmenu()
// ===== HÀM MENU LIST END ======

// ===== HÀM TẠO URL BEGIN ======

function getUrlList(slug, filtersJson) {
    var paramPage = "&pn=";
    var charparam = false; // Flag bật/tắt ghép dấu (? hoặc &)
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
            } catch (e) { log("getUrlList():\n" + e) }
        }
        var resultUrl = BASELINK;
        if (path) {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }

        if (page > 0 && resultUrl.indexOf("page=") === -1) {
            // Chỉ khi charparam = true MỚI tiến hành ghép ? hoặc &
            if (charparam === true) {
                var prefix = resultUrl.indexOf("?") > -1 ? "&" : "?";
                resultUrl += prefix + paramPage + page;
            } else {
                // Khi charparam = false: Ghép trực tiếp không có ? hay &
                resultUrl += paramPage + page;
            }
        }
        var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
        
        return "https://example.com?linkfetch=" + encodeURI(finalUrl);
    } catch (e) {
        log("getUrlList[err]:\n " + e);
        return BASEURL;
    }
}
 
function getUrlSearch(keyword, filtersJson) {
  // https://api.bilibili.tv/intl/gateway/web/v2/search_v2/anime?s_locale=vi_VN&platform=web&keyword=hunter&highlight=1&pn=1&ps=20&qid=85996598869361664&sort=0&duration_type=0
      var paramSearch = "/intl/gateway/web/v2/search_v2?s_locale=vi_VN&platform=web&highlight=1&ps=20&qid=&sort=0&duration_type=0&keyword=";
      var charsearch = ""
      var paramPage = "";
      try {
          var page = 1;
          if (filtersJson) {
              var fixedJson = filtersJson
                  .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
              try {
                  var filters = JSON.parse(fixedJson);
                  page = parseInt(filters.page) || 1;
              } catch (e) {log("getUrlList():\n" + e)}
          }
          var encodedKeyword = keyword.replace(/\s+/g,"+");
          
          var resultUrl = BASELINK + paramSearch + encodedKeyword + "&pn=" + page;
  
          var finalUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");
          
          log("getUrlSearch[url]: \n" + finalUrl);
          return "https://example.com?linkfetch=" + encodeURI(finalUrl);
  
      } catch (e) {
          log("getUrlSearch[err]:\n " + e);
          return BASEURL;
      }
  }
function listbase($data, url) {
    var items = [];
    $data.data.cards.forEach(function(item, index) {
        var id = "https://www.bilibili.tv/vi/play/" + item.season_id + "?bstar_from=bstar-web.category-anime.0.0";
        var type = item.type;
        if(type == "ogv"){
          type = "Anime"
        }
        else{
          type = "Video"
        }
        var title = item.title;
        var poster = item.cover;
        var background = poster;
        var view = item.view.replace(" Lượt xem","")
        var quality = "👁️ " + view;
        var episode_current = type;
        var year = "";
        var lang = item.index_show;
        if (title.length > 1 && poster.length > 5) {
            items.push({
                "id": id || "",
                "title": title || "",
                "quality": quality || "",
                "episode_current": episode_current || "",
                "posterUrl": poster || "",
                "backdropUrl": background || "",
                "year": year || "",
                "lang": lang || ""
            });
        }
    });
    //console.log("List item ["+$url+"]: \n" + JSON.stringify(items))
    return items;
}

function moduleAnime(listjs) {
    console.log("Chạy module Anime");
    var items = [];
    if (!listjs || !listjs.length) return items;

    listjs.forEach(function (item) {
        if (!item) return;
        var title = item.title || '';
        var poster = item.cover || '';
        if (title.length <= 1 || poster.length <= 5) return;

        var id = "https://www.bilibili.tv/vi/play/" + item.season_id + "?bstar_from=bstar-web.category-anime.0.0";
        var view = String(item.view || '').replace(" Lượt xem", "");
        items.push({
            "id": id,
            "title": title,
            "quality": view ? ("👁️ " + view) : "",
            "episode_current": "Anime",
            "posterUrl": poster,
            "backdropUrl": poster,
            "year": "",
            "lang": item.index_show || ""
        });
    });
    return items;
}
    // https://www.bilibili.tv/vi/video/4797774500730880
function moduleVideo(listjs) {
    console.log("Chạy module Video");
    var items = [];
    if (!listjs || !listjs.length) return items;

    listjs.forEach(function (item) {
        if (!item || !item.aid) return;                   // bỏ user object (không có aid)
        var title = item.title || '';
        var poster = item.cover || '';
        if (title.length <= 1 || poster.length <= 5) return;

        var id = "https://www.bilibili.tv/vi/video/" + item.aid;
        var view = String(item.view || '').replace(" Lượt xem", "");
        items.push({
            "id": id,
            "title": title,
            "quality": view ? ("👁️ " + view) : "",
            "episode_current": "Video",
            "posterUrl": poster,
            "backdropUrl": poster,
            "year": "",
            "lang": item.duration || ""
        });
    });
    return items;
}
// Xử lý kết quả từ endpoint /search_v2/anime
// Data trả về: { data: { items: [ {title, season_id, cover, view, index_show, ...} ] } }
function moduleAnimeSearch(data) {
    console.log("Chạy module AnimeSearch");
    var items = [];
    var list = (data && data.data && data.data.items) || [];

    list.forEach(function (item) {
        if (!item || !item.season_id) return;
        var title = item.title || '';
        var poster = item.cover || '';
        if (title.length <= 1 || poster.length <= 5) return;

        var id = "https://www.bilibili.tv/vi/play/" + item.season_id +
                 "?bstar_from=bstar-web.search-result.0.0";

        var view = String(item.view || '').replace(" Lượt xem", "");

        items.push({
            "id": id,
            "title": title,
            "quality": view ? ("👁️ " + view) : "",
            "episode_current": item.season_type || "Anime",
            "posterUrl": poster,
            "backdropUrl": poster,
            "year": "",
            "lang": item.index_show || ""
        });
    });

    console.log("AnimeSearch: " + items.length + " kết quả");
    return items;
}

function listsearch($data, url, animeData) {
    var items = [];

    // ⭐ Anime search lên đầu
    if (animeData) {
        var animeItems = moduleAnimeSearch(animeData);
        if (animeItems.length) items.push(animeItems);
    }

    // Video search như cũ
    var modules = ($data && $data.data && $data.data.modules) || [];

    modules.forEach(function (item) {
        if (!item) return;
        if (!item.items || !item.items.length) return;

        if (item.type === "ogv") {
            items.push(moduleAnime(item.items));
        } else if (item.type === "ugc") {
            items.push(moduleVideo(item.items));
        }
        // uploader, mvp, ... → skip
    });

    function flatten(arr) {
        return arr.reduce(function (acc, val) {
            return acc.concat(Array.isArray(val) ? flatten(val) : val);
        }, []);
    }

    return flatten(items);
}
// Build URL search anime từ URL search video gốc — tách bạch pn, keyword
function buildAnimeSearchUrl(linkfetch) {
    var pnMatch  = linkfetch.match(/[?&]pn=(\d+)/);
    var kwMatch  = linkfetch.match(/[?&]keyword=([^&]*)/);

    var pn = pnMatch ? pnMatch[1] : '1';
    var kw = kwMatch ? kwMatch[1] : '';

    var url = 'https://api.bilibili.tv/intl/gateway/web/v2/search_v2/anime?' +
        's_locale=vi_VN' +
        '&platform=web' +
        '&keyword=' + kw +
        '&highlight=1' +
        '&pn=' + pn +
        '&ps=20' +
        '&qid=' +
        '&sort=0' +
        '&duration_type=0';

    console.log('[AnimeSearch] page=' + pn + ', keyword=' + decodeURIComponent(kw));
    return url;
}
// Xử lý endpoint /user/archives — UGC videos của 1 kênh
// Gom video series trong /user/archives
function listUserArchivesGrouped($data, url, linkfetch) {
  var midMatch = linkfetch.match(/[?&]mid=(\d+)/);
  var mid = midMatch ? midMatch[1] : 'unknown';

  var pnMatch = linkfetch.match(/[?&]pn=(\d+)/);
  var appPn = pnMatch ? parseInt(pnMatch[1], 10) : 1;

  var items = [];
  var cards = ($data && $data.data && $data.data.cards) || [];

  console.log('[Series] Page ' + appPn + ' — ' + cards.length + ' cards (raw)');

  cards.forEach(function (item) {
    if (!item || !item.aid) return;
    var title = item.title || '';
    var poster = item.cover || '';
    if (title.length <= 1 || poster.length <= 5) return;

    var view = String(item.view || '').replace(" Lượt xem", "");
    var quality = view ? ("👁️ " + view) : "";

    // ⭐ Đánh dấu nếu là series → bấm vào sẽ gom trong detail
    var seriesInfo = parseEpisodeInfo(title);

        if (!seriesInfo || !seriesInfo.key) {
      // ⭐ Video lẻ — vẫn đánh dấu type=raw + mid + pn + aid
      items.push({
        id: "https://www.bilibili.tv/vi/video/" + item.aid +
            "|data:type=raw" +
            "&mid=" + mid +
            "&pn=" + appPn +
            "&aid=" + item.aid,
        title: title,
        quality: quality,
        episode_current: "Video",
        posterUrl: poster,
        backdropUrl: poster,
        year: "",
        lang: item.duration || ""
      });
      return;
    }

    // Series → id riêng (kèm aid để không dedupe) + data:type=series
    items.push({
      id: "https://www.bilibili.tv/vi/video/" + item.aid +
          "|data:type=series" +
          "&mid=" + mid +
          "&key=" + encodeURIComponent(seriesInfo.key) +
          "&pn=" + appPn +
          "&title=" + encodeURIComponent(title),
      title: title,
      quality: quality,
      episode_current: "Series",
      posterUrl: poster,
      backdropUrl: poster,
      year: "",
      lang: ""
    });
  });

  console.log('[Series] Page ' + appPn + ' → ' + items.length + ' items');
  return items;
}


function parseListResponse(html, url) {
    try {
          var linkfetch = url.match(/linkfetch=([\s\S]+)/i)[1];
          console.log("linkfetch:\n" + linkfetch);
          var items = [];
          if (linkfetch.indexOf("catelist=true") > -1) {
            // https://vaxplugin.alokillgtv.workers.dev/youtube/cate.json?debug=9780752
            var rawjs = catelist();
            var $data = JSON.parse(rawjs);
            $data.forEach(function(item) {
                items.push({
                    "id": item.id,
                    "title": item.title,
                    "quality": "",
                    "episode_current": "Kênh",
                    "posterUrl": item.img,
                    "backdropUrl": item.img,
                    isFolder: true,
                    "year": "",
                    "lang": ""
                });
            })
            // console.log(JSON.stringify(items))
            var result = JSON.stringify({
                "items": items,
                "pagination": {
                    "currentPage": 1,
                    "totalPages": 1
                }
            });

            //console.log("Return List:\n" + result);
            return result
        }
        
        var html = fetchHtml(linkfetch, BILI_USER, BILI_PASS);
        console.log("Raw\n" + html);
        var $data = JSON.parse(html);

          if (linkfetch.indexOf("/search") > -1) {
              // ⭐ Search: gộp anime + video
              var animeData = null;
              try {
                  var animeUrl = buildAnimeSearchUrl(linkfetch);
                  var animeRaw = fetchHtml(animeUrl, BILI_USER, BILI_PASS);
                  animeData = JSON.parse(animeRaw);
                  if (animeData.code !== 0) animeData = null;
              } catch (ae) {
                  animeData = null;
              }
              var items = listsearch($data, url, animeData);
          }
           else if (linkfetch.indexOf("/user/archives") > -1) {
              // ⭐ Kênh user — gom series tự động
              var items = listUserArchivesGrouped($data, url, linkfetch);
          }
          else {
              // OGV index — dùng season_id
              var items = listbase($data, url);
          }

        var $return = JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 9999
            }
        });
        return $return;
    } catch (e) {
        log("parseListResponse[err]:\n " + e);
        return JSON.stringify({
            "items": [{
                "id": url || "error_url",
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
// Build MovieDetail cho video lẻ — fetch 3 trang liền kề, gom thành list tập
function buildRawSeriesDetail(slug, data) {
  var mid = data.mid;
  var pn = parseInt(data.pn || 1, 10);
  var firstAid = String(data.aid || '');

  if (!mid) throw new Error('Thiếu mid');

  console.log('[Raw] Build — mid=' + mid +
    ', startPn=' + pn + ', firstAid=' + firstAid);

  function _sleep(ms) {
    var s = Date.now();
    while (Date.now() - s < ms) { /* busy-wait */ }
  }

  function fetchPage(p) {
    var u = 'https://api.bilibili.tv/intl/gateway/web/v2/user/archives?' +
      's_locale=' + BASE.locale + '&platform=web&ps=20&mid=' + mid + '&pn=' + p;
    try {
      var raw = fetchHtml(u, BILI_USER, BILI_PASS);
      var parsed = JSON.parse(raw);
      if (parsed && parsed.code === -412) {
        console.log('[Raw] Page ' + p + ' bị 412 — dừng');
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  // ⭐ Fetch 3 page: pn, pn+1, pn+2
  var pages = [pn, pn + 1, pn + 2];
  var allVideos = [];      // các video KHÁC video gốc
  var seen = {};
  var firstItem = null;    // video gốc

  for (var i = 0; i < pages.length; i++) {
    var p = pages[i];
    var pageData = fetchPage(p);
    _sleep(200);   // ⭐ delay 200ms giữa các page

    if (!pageData || pageData.code !== 0 || !pageData.data ||
        !pageData.data.cards) {
      console.log('[Raw] Page ' + p + ' fail/empty');
      continue;
    }

    var cards = pageData.data.cards;
    console.log('[Raw] Page ' + p + ' — ' + cards.length + ' cards');

    cards.forEach(function (item) {
      if (!item || !item.aid) return;
      if (seen[item.aid]) return;
      seen[item.aid] = true;

      var obj = {
        aid: item.aid,
        title: item.title || '',
        cover: item.cover || '',
        duration: item.duration || ''
      };

      if (String(item.aid) === firstAid) {
        firstItem = obj;        // giữ riêng, đưa lên đầu sau
      } else {
        allVideos.push(obj);
      }
    });
  }

  // ⭐ Ghép: video gốc lên đầu, còn lại theo thứ tự đã fetch
  var finalList = [];
  if (firstItem) finalList.push(firstItem);
  finalList = finalList.concat(allVideos);

  if (!finalList.length) {
    throw new Error('Không tìm được video nào cho mid=' + mid);
  }

  console.log('[Raw] Tổng: ' + finalList.length +
    ' video — video gốc ' + (firstItem ? 'ở đầu ✓' : 'KHÔNG tìm thấy'));

  // Build danh sách tập
  var episodes = [];
  finalList.forEach(function (v, idx) {
    var link = "https://example.com?aid=" + v.aid + "&type=mv";
    var name = v.title || ('Video ' + (idx + 1));

    episodes.push({
      id: link + "&server=1",
      name: name,
      slug: "tap-" + (idx + 1),
      ids: [
        { name: "Server 1", url: link + "&server=1" },
        { name: "Server 2", url: link + "&server=2" },
        { name: "Server 3", url: link + "&server=3" }
      ]
    });
  });

  var firstCover = finalList[0].cover || '';
  var displayTitle = firstItem ? firstItem.title :
    (finalList[0].title || 'Danh sách video');

  return JSON.stringify({
    id: slug,
    title: displayTitle,
    originName: "",
    posterUrl: firstCover,
    backdropUrl: firstCover,
    description: 'Danh sách ' + finalList.length +
      ' video liền kề (video gốc ở đầu)',
    quality: "",
    year: "",
    rating: "",
    status: "Trọn bộ (" + finalList.length + " video)",
    category: "",
    episode_current: "",
    servers: [{
      name: "Server",
      episodes: episodes
    }],
    duration: "",
    casts: "",
    director: "",
    country: "",
    lang: "",
    extra: ""
  });
}
// Build MovieDetail JSON cho series
function buildSeriesDetail(slug, data) {
  var mid = data.mid;
  var key = data.key;
  var startPn = parseInt(data.pn || 1, 10);

  if (!mid || !key) throw new Error('Thiếu mid hoặc key');

  var cacheKey = 'series_' + mid + '_' + key;
  var entry = null;
  try {
    var cStr = localStorage.getItem(cacheKey);
    if (cStr) entry = JSON.parse(cStr);
  } catch (e) {}

  // ⭐ Không đọc localStorage nữa — lấy baseTitle từ data.title truyền vào
  var baseTitle = data.title ? decodeURIComponent(data.title) : key;

  console.log('[Series] Build "' + baseTitle + '" — mid=' + mid +
    ', key=' + key + ', startPn=' + startPn);

  var MAX_BACKWARD = 5;
  var MAX_FORWARD = 5;
  var STOP_AFTER_EMPTY = 2;

  var allEpisodes = [];
  var seenAids = {};

  function _sleep(ms) {
    var s = Date.now();
    while (Date.now() - s < ms) { /* busy-wait */ }
  }

  function fetchPage(pn) {
    var url = 'https://api.bilibili.tv/intl/gateway/web/v2/user/archives?' +
      's_locale=' + BASE.locale + '&platform=web&ps=20&mid=' + mid + '&pn=' + pn;
    try {
      var raw = fetchHtml(url, BILI_USER, BILI_PASS);
      var parsed = JSON.parse(raw);
      if (parsed && parsed.code === -412) {
        console.log('[Series] Page ' + pn + ' bị 412 — dừng');
        return null;
      }
      _sleep(200);   // ⭐ delay 200ms giữa các page trong detail
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function collect(pageData) {
    if (!pageData || pageData.code !== 0 || !pageData.data || !pageData.data.cards) {
      return { matched: 0, hasNext: false };
    }
    var matched = 0;
    pageData.data.cards.forEach(function (item) {
      if (!item || !item.aid) return;
      if (seenAids[item.aid]) return;
      var info = parseEpisodeInfo(item.title);
      if (!info || info.key !== key) return;
      seenAids[item.aid] = true;
      matched++;
      allEpisodes.push({
        aid: item.aid,
        season: info.season,
        ep: info.ep,
        order: allEpisodes.length, 
        title: item.title,
        cover: item.cover
      });
    });
    return { matched: matched, hasNext: !!pageData.data.hasNext || !!pageData.data.has_next };
  }

  // ⭐ 1. Fetch page hiện tại (nơi user bấm)
  var startData = fetchPage(startPn);
  var startRes = collect(startData);
  console.log('[Series] Start page ' + startPn + ' — match ' + startRes.matched);

  // ⭐ 2. Fetch lùi (startPn - 1, - 2, ...) đến khi 3 empty hoặc page 1
  var emptyBack = 0;
  for (var offset = 1; offset <= MAX_BACKWARD; offset++) {
    var pb = startPn - offset;
    if (pb < 1) break;
    var dataB = fetchPage(pb);
    var resB = collect(dataB);
    console.log('[Series] Backward page ' + pb + ' — match ' + resB.matched);
    if (resB.matched === 0) {
      emptyBack++;
      if (emptyBack >= STOP_AFTER_EMPTY) {
        console.log('[Series] Dừng lùi sau ' + emptyBack + ' trang không match');
        break;
      }
    } else {
      emptyBack = 0;
    }
  }

  // ⭐ 3. Fetch tới (startPn + 1, + 2, ...) đến khi 3 empty hoặc hết
  var emptyFwd = 0;
  for (var offset = 1; offset <= MAX_FORWARD; offset++) {
    var pf = startPn + offset;
    var dataF = fetchPage(pf);
    if (!dataF) break;
    var resF = collect(dataF);
    console.log('[Series] Forward page ' + pf + ' — match ' + resF.matched);
    if (resF.matched === 0) {
      emptyFwd++;
      if (emptyFwd >= STOP_AFTER_EMPTY) {
        console.log('[Series] Dừng tới sau ' + emptyFwd + ' trang không match');
        break;
      }
    } else {
      emptyFwd = 0;
    }
    if (!resF.hasNext) break;
  }

  console.log('[Series] Tổng cộng: ' + allEpisodes.length + ' tập');

  if (!allEpisodes.length) {
    throw new Error('Không tìm được episode nào cho series "' + baseTitle + '"');
  }

  allEpisodes.sort(function (a, b) {
  // Nhánh prefix: không có ep → giữ nguyên thứ tự xuất hiện
  if (a.ep === 0 && b.ep === 0) {
    return a.order - b.order;
  }
  // Nhánh episode: sort theo (season, ep)
  var sa = a.season === null ? 0 : a.season;
  var sb = b.season === null ? 0 : b.season;
  if (sa !== sb) return sa - sb;
  if (a.ep !== b.ep) return a.ep - b.ep;
  return a.order - b.order;
});


  var episodes = [];
  allEpisodes.forEach(function (ep, idx) {
  var name;

  if (ep.ep > 0 && ep.season !== null) {
    name = 'Phần ' + ep.season + ' - Tập ' + ep.ep;
  } else if (ep.ep > 0) {
    name = 'Tập ' + ep.ep;
  } else {
    // Prefix type — cắt phần prefix khỏi title nếu có
    var pfx = extractPrefix(ep.title);
    if (pfx) {
      name = ep.title.replace(pfx, '').replace(/^[\s:|]+/, '').trim() || ep.title;
    } else {
      name = ep.title;
    }
  }

  var link = "https://example.com?aid=" + ep.aid + "&type=mv";

  episodes.push({
    id: link + "&server=1",
    name: name,
    slug: "tap-" + (idx + 1),
    ids: [
      { name: "Server 1", url: link + "&server=1" },
      { name: "Server 2", url: link + "&server=2" },
      { name: "Server 3", url: link + "&server=3" }
    ]
  });
});

  var firstCover = allEpisodes[0].cover;

  return JSON.stringify({
    id: slug,
    title: baseTitle,
    originName: "",
    posterUrl: firstCover,
    backdropUrl: firstCover,
    description: 'Series tổng hợp ' + allEpisodes.length + ' tập từ kênh',
    quality: "",
    year: "",
    rating: "",
    status: "Trọn bộ (" + allEpisodes.length + " tập)",
    category: "",
    episode_current: "",
    servers: [{
      name: "Server",
      episodes: episodes
    }],
    duration: "",
    casts: "",
    director: "",
    country: "",
    lang: "",
    extra: ""
  });
}
// ============================================================
// ⭐ TOGGLE: Ẩn tập VIP khỏi danh sách
// true  = ẩn tập VIP (chỉ hiện tập free)
// false = hiện tất cả tập (kể cả VIP)
// ============================================================
var HIDE_PREMIUM_EPISODES = false;

function isPremiumEpisode(ep) {
    if (!ep) return false;
    if (ep.limit === 1) return true;
    var lt = String(ep.limit_text || '').toLowerCase();
    if (lt.indexOf('premium') !== -1 || lt.indexOf('vip') !== -1) return true;
    if (ep.corner_mark && ep.corner_mark.image) return true;
    return false;
}

// Gom các tập bị ẩn liên tiếp thành range "Tập 3 → Tập 22"
function buildHiddenRanges(hiddenList) {
    if (!hiddenList.length) return '';
    var ranges = [];
    var start = hiddenList[0], end = hiddenList[0];
    for (var i = 1; i < hiddenList.length; i++) {
        if (hiddenList[i].idx === end.idx + 1) {
            end = hiddenList[i];
        } else {
            ranges.push(start === end ? start.name : (start.name + ' → ' + end.name));
            start = hiddenList[i];
            end = hiddenList[i];
        }
    }
    ranges.push(start === end ? start.name : (start.name + ' → ' + end.name));
    return ranges.join(', ');
}

function tvparse($data2, url, rawScript) {
    // ⭐ Không ẩn tập nữa — hiện hết để user tự thử
    var hideVIP = !globalThis.vip;   // ⭐ Ẩn nếu không VIP
    console.log('[TVParse] hide=' + hideVIP + ' (vip=' + globalThis.vip + ')');

    var id = url;
    var posterUrl = $data2.ogv.season.vertical_cover;
    var backdropUrl = posterUrl;
    var title = $data2.ogv.season.title;
    var originName = $data2.ogv.season.origin_name;
    var description = $data2.ogv.season.description;
    var director = "";
    var casts = "";
    var category = "";
    var duration = "";
    var status = $data2.ogv.season.index_show;
    var episode_current = "";
    var year = "";
    var quality = "";
    var rating = "";
    var country = $data2.ogv.season.area_names;
    var lang = "";
    var extra = "";
    var servers = [];
    var episodes = [];
    var epinum = 0;
    var globalIdx = 0;
    var hiddenList = [];

    $data2.ogv.sectionsList.forEach(function (item) {
        item.episodes.forEach(function (item2) {
            globalIdx++;

            if (hideVIP && isPremiumEpisode(item2)) {
                hiddenList.push({
                    idx: globalIdx,
                    name: item2.short_title_display || ('Tập ' + globalIdx)
                });
                return;
            }

            epinum++;
            var name = item2.short_title_display;
            var slug = "tap-" + epinum;
            var link = "https://example.com?episode_id=" + item2.episode_id +
                       "&season_id=" + $data2.ogv.season.id;   // ⭐ thêm season_id
            var id = link + "&server=1&type=tv";
            episodes.push({
                id: id,
                name: name,
                slug: slug,
                ids: [
                    { name: "Server 1", url: link + "&server=1" },
                    { name: "Server 2", url: link + "&server=2" },
                    { name: "Server 3", url: link + "&server=3" }
                ]
            });
        });
    });

    if (hideVIP && hiddenList.length > 0) {
        var rangeStr = buildHiddenRanges(hiddenList);
        toast(
            'Đã ẩn ' + hiddenList.length + ' tập VIP: ' + rangeStr +
            ' — cần VIP Premium để xem.',
            20000
        );
    }

    servers.push({ name: "Server", episodes: episodes });

    return JSON.stringify({
        id: url || "",
        title: title || "",
        originName: originName || "",
        posterUrl: posterUrl || "",
        backdropUrl: backdropUrl || "",
        description: description || "",
        quality: quality || "",
        year: year || "",
        rating: rating || "",
        status: status || "",
        category: category || "",
        episode_current: episode_current || "",
        servers: servers || "",
        duration: duration || "",
        casts: casts || "",
        director: director || "",
        country: country || "",
        lang: lang || "",
        extra: extra || ""
    });
}

function mvparse($data2, url) {
    var id = url;
    var posterUrl = $data2.ugc.archive.cover;
    var backdropUrl = posterUrl;
    var title = $data2.ugc.archive.title;
    var originName = "";
    var description = $data2.ugc.archive.desc;
    var director = "";
    var casts = "";
    var category = "";
    // menu category
    var duration = "";
    var status = "";
    var episode_current = "";
    var year = "";
    var quality = "";
    var rating = "";
    var country = "";
    var lang = "";
    var extra = ""; //BASEAPI + "/sources?type="+tags+"&tmdbId=" + $data.tmdbId;
    var servers = [];
    var episodes = [];
    var epinum = 0;
    episodes.push({
        id: "https://example.com?aid=" + $data2.ugc.aid + "&server=1&type=mv",
        name: "Server 1",
        slug: "full-1"
    },{
        id: "https://example.com?aid=" + $data2.ugc.aid + "&server=2&type=mv",
        name: "Server 2",
        slug: "full-2"
    },{
        id: "https://example.com?aid=" + $data2.ugc.aid + "&server=3&type=mv",
        name: "Server 3",
        slug: "full-3"
    })
    servers.push({
        name: "Server",
        episodes: episodes
    })

    var $return = JSON.stringify({
        id: url || "",
        title: title || "",
        originName: originName || "",
        posterUrl: posterUrl || "",
        backdropUrl: backdropUrl || "",
        description: description || "",
        quality: quality || "",
        year: year || "",
        rating: rating || "",
        status: status || "",
        category: category || "",
        episode_current: episode_current || "",
        servers: servers || "",
        duration: duration || "",
        casts: casts || "",
        director: director || "",
        country: country || "",
        lang: lang || "",
        extra: extra || ""
    });
    return $return
}
// ============================================================
// VIP HELPERS — đọc trực tiếp từ script, không cần eval/API
// ============================================================
function _splitTopLevel(s) {
    var result = [], depth = 0, cur = '', inStr = false, strCh = '', esc = false;
    for (var i = 0; i < s.length; i++) {
        var ch = s[i];
        if (esc) { cur += ch; esc = false; continue; }
        if (inStr) {
            cur += ch;
            if (ch === '\\') { esc = true; continue; }
            if (ch === strCh) inStr = false;
            continue;
        }
        if (ch === '"' || ch === "'") { inStr = true; strCh = ch; cur += ch; continue; }
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') depth--;
        if (ch === ',' && depth === 0) { result.push(cur.trim()); cur = ''; }
        else cur += ch;
    }
    if (cur.trim()) result.push(cur.trim());
    return result;
}

function _unescapeJs(s) {
    if (!s) return s;
    return String(s).replace(/\\u002F/g, '/').replace(/\\u0026/g, '&')
        .replace(/\\u003D/g, '=').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}



function parseMovieDetail(html, url) {
    try {
        var $doc = _$(html);
        var scriptEl = $doc.find("script:content('window.__initialState')").html();
        if (!scriptEl) throw new Error('Không tìm thấy window.__initialState trong HTML');
        var script = scriptEl.replace(/window\./i, "");

        // ⭐ Bọc eval kỹ — tránh crash khi script lạ
        var $data2;
        try {
            $data2 = eval(script);
        } catch (ee) {
            throw new Error('eval __initialState fail: ' + (ee.message || ee));
        }
        if (!$data2 || typeof $data2 !== 'object') {
            throw new Error('__initialState eval trả về không phải object');
        }
        if (!$data2.ogv && !$data2.ugc) {
            throw new Error('__initialState thiếu ogv và ugc');
        }

        // ⭐ VIP: KHÔNG check qua API nữa (endpoint 404 + login captcha)
        // Mặc định cho phép hiện hết tập — để user tự thử. Nếu xem không được sẽ toast.
        // ⭐ Check VIP thật từ session
               // ⭐ Check VIP bằng playurl tập đầu tiên
                // ⭐ Check VIP bằng cách fetch trang chủ
        var isVip = false;
        try {
          isVip = checkVipByHomepage();
        } catch (e) {
          console.log('[VIP] Không check được: ' + (e.message || e));
        }

        // ⭐ Bỏ check VIP — luôn hiện hết tập, để playurl tự báo lỗi nếu không có quyền
        globalThis.vip = true;
        globalThis.HIDE_PREMIUM_EPISODES = false;
        HIDE_PREMIUM_EPISODES = false;
        console.log('[VIP] Bỏ check — hiện hết tập');

        console.log('[VIP] isVip=' + isVip + ' → HIDE_PREMIUM_EPISODES=' + (!isVip));

        var $return;
        if ($data2.ugc && $data2.ugc.aid) {
            $return = mvparse($data2, url);
        } else {
            $return = tvparse($data2, url, script);
        }
        return $return;
    } catch (e) {
        log("parseMovieDetail[err]:\n " + e);
        return JSON.stringify({
            id: "error",
            title: "Lỗi xử lý chi tiết",
            description: url + "\n" + (e.message || e),
            servers: []
        });
    }
}
//var url = "https://novahd.cc/api/show/1413"
//var url = "http://vkey.vn/novahd/api/show/1413"
// https://novahd.cc/api/shows/1413
//var html = sourceHTML;
//JSON.parse(parseMovieDetail(sourceHTML, url))
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM END ======

// ===== HÀM TẠO XỬ LÝ STREAM PHIM BEGIN ======
function getTop3Videos(raw) {
  var jsonStr = String(raw).trim()
    .replace(/^html\s*=\s*`/, '')
    .replace(/`\s*$/, '');
  var data = JSON.parse(jsonStr);
  var playurl = data && data.data && data.data.playurl;
  if (!playurl) return [];

  // ===== DẠNG 1: durl (progressive MP4 — có tiếng) =====
  if (playurl.durl && playurl.durl.length) {
    return playurl.durl
      .filter(function (d) { return d && d.url; })
      .map(function (d, i) {
        return {
          rank: i + 1,
          resolution: 'progressive',
          mime_type: 'video/mp4',
          url: d.url,
          codecs: '',
          bandwidth: 0,
          size: d.size || 0
        };
      });
  }

  // ===== DẠNG 2: video + audio_resource (DASH — không tiếng) =====
  var videoList = playurl.video || [];
  var valid = videoList.filter(function (v) {
    return v && v.video_resource && v.video_resource.url;
  });

  var codecRank = function (c) {
    if (!c) return 3;
    if (c.indexOf('avc') === 0) return 0;
    if (c.indexOf('hev') === 0 || c.indexOf('hvc') === 0) return 1;
    return 2;
  };

  valid.sort(function (a, b) {
    var ra = (a.video_resource.width || 0) * (a.video_resource.height || 0);
    var rb = (b.video_resource.width || 0) * (b.video_resource.height || 0);
    if (rb !== ra) return rb - ra;
    return codecRank(a.video_resource.codecs) - codecRank(b.video_resource.codecs);
  });

  var seen = {};
  var result = [];
  for (var i = 0; i < valid.length; i++) {
    var r = valid[i].video_resource;
    var key = r.width + 'x' + r.height;
    if (seen[key]) continue;
    seen[key] = true;
    result.push({
      rank: result.length + 1,
      resolution: key,
      mime_type: r.mime_type,
      url: r.url,
      codecs: r.codecs,
      bandwidth: r.bandwidth,
      size: r.size
    });
    if (result.length === 3) break;
  }
  return result;
}

// Helper: encode chuỗi thành data URI m3u8
function m3uDataUri(content) {
  return 'data:application/vnd.apple.mpegurl;charset=utf-8,' + encodeURIComponent(content);
}

// Helper: build media playlist cho 1 stream (video hoặc audio)
function buildMediaPlaylist(streamUrl, duration) {
  var dur = Math.ceil(duration || 0);
  return [
    '#EXTM3U',
    '#EXT-X-VERSION:7',
    '#EXT-X-TARGETDURATION:' + dur,
    '#EXT-X-PLAYLIST-TYPE:VOD',
    '#EXTINF:' + dur + '.0,',
    streamUrl,
    '#EXT-X-ENDLIST'
  ].join('\n');
}

// Helper: build master playlist ghép video + audio
function buildMasterPlaylist(videoUrl, audioUrl, duration, width, height) {
  var videoPl = buildMediaPlaylist(videoUrl, duration);
  var audioPl = buildMediaPlaylist(audioUrl, duration);
  
  var resolution = width && height ? (width + 'x' + height) : '1280x720';
  
  var master = [
    '#EXTM3U',
    '#EXT-X-VERSION:7',
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="Default",DEFAULT=YES,AUTOSELECT=YES,URI="' + m3uDataUri(audioPl) + '"',
    '#EXT-X-STREAM-INF:BANDWIDTH=2000000,CODECS="avc1.640020,mp4a.40.2",AUDIO="aud",RESOLUTION=' + resolution,
    m3uDataUri(videoPl)
  ].join('\n');
  
  return master;
}

// ============================================================
// SUBTITLE — lấy vietsub + engsub từ Bilibili
// ============================================================
function getSubtitles(params, username, password) {
  try {
    var ckStr = '';
    try {
      var sess = acquireSession(username, password);
      if (sess && sess.cookies) ckStr = cookiesToStr(sess.cookies);
    } catch (e) {}

    var qp = { s_locale: BASE.locale, platform: 'web' };

    if (params.ep_id) {
      qp.episode_id = String(params.ep_id);
      qp.spm_id = 'bstar-web.pgc-video-detail.0.0';
      qp.from_spm_id = 'bstar-web.category-anime.0.0';
    } else if (params.aid) {
      qp.aid = String(params.aid);
      qp.spm_id = 'bstar-web.ugc-video-detail.0.0';
      qp.from_spm_id = 'bstar-web.homepage.recommend.all';
    } else {
      return [];
    }

    var url = BASE.api + '/intl/gateway/web/v2/subtitle?' + buildQuery(qp);
    console.log('[Subtitle] GET ' + url);

    var r = httpRequest(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': BASE.ua,
        'Origin': BASE.origin,
        'Referer': BASE.referer,
        'Cookie': ckStr
      }
    });
    var d = JSON.parse(r.body || r);
    console.log('[Subtitle] code=' + d.code);

    if (d.code !== 0 || !d.data) return [];

    var list = (d.data.subtitles || d.data.subtitle) || [];
    console.log('[Subtitle] ' + list.length + ' items');

    var out = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (!s || !s.url) continue;
      var u = s.url;
      if (u.indexOf('//') === 0) u = 'https:' + u;
// ⭐ Tự nhận diện mimeType theo đuôi file
          var mime = 'text/vtt';  // default an toàn nhất
          var uLower = u.toLowerCase();
          if (uLower.indexOf('.ass') > -1 || uLower.indexOf('.ssa') > -1) {
            mime = 'text/x-ssa';
          } else if (uLower.indexOf('.srt') > -1) {
            mime = 'application/x-subrip';
          } else if (uLower.indexOf('.vtt') > -1) {
            mime = 'text/vtt';
          } else if (uLower.indexOf('.smi') > -1) {
            mime = 'application/smil';
          }
          
          out.push({
            lang: s.lang_key || s.lang || 'vi',
            url: u,
            mimeType: mime
          });
    }
    console.log('[Subtitle] → ' + out.length + ' subs');
    return out;
  } catch (e) {
    console.log('[Subtitle] err: ' + (e.message || e));
    return [];
  }
}

function parseDetailResponse(html, url) {
  try {
    var type = getparam(url, "type");
    var epId = getparam(url, "episode_id");
    var aid = getparam(url, "aid");
    var seasonId = getparam(url, "season_id");   // ⭐ thêm

    var ckStr = '';
    try {
      var sess = acquireSession(BILI_USER, BILI_PASS);
      if (sess && sess.cookies) ckStr = cookiesToStr(sess.cookies);
    } catch(e) {}

    var UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';
    var REF = 'https://www.bilibili.tv/';
    var ORG = 'https://www.bilibili.tv';

    // Hàm lấy URL playurl với platform/device/qn tùy chỉnh
    function getPlayurlUrl(platform, device, qn) {
      try {
        var qp = {
          s_locale: BASE.locale,
          platform: platform,
          qn: String(qn),
          type: '0',
          device: device,
          tf: '0',
          fnval: '0',
          spm_id: 'bstar-web.pgc-video-detail.0.0',
          from_spm_id: 'bstar-web.anime-tab.timeline.all'
        };
        if (epId) qp.ep_id = String(epId);
        if (aid)  qp.aid = String(aid);

        var u = BASE.api + '/intl/gateway/web/playurl?' + buildQuery(qp);
        var r = httpRequest(u, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': BASE.ua,
            'Origin': BASE.origin,
            'Referer': BASE.referer,
            'Cookie': ckStr
          }
        });
        var d = JSON.parse(r.body || r);
        if (!d || d.code !== 0) {
          console.log('[getPlayurlUrl ' + platform + '/' + qn + '] code=' + (d && d.code));
          return null;
        }
        var vids = (d.data.playurl.video || []).filter(function(v){return v.video_resource && v.video_resource.url;});
        vids.sort(function(a,b){return (b.video_resource.quality||0)-(a.video_resource.quality||0);});
        return vids.length ? vids[0].video_resource.url : null;
      } catch(e) {
        console.log('[getPlayurlUrl] EXC ' + (e.message || e));
        return null;
      }
    }

    function testFetch(label, u, headers) {
      if (!u) { console.log('[' + label + '] NO URL'); return label + '[NO-URL]'; }
      try {
        var r = httpRequest(u, { method: 'GET', headers: headers || {} });
        var bodyStr = String((r && r.body) || '');
        var preview = bodyStr.substring(0, 100).replace(/[\r\n\t]+/g, ' ');
        console.log('[' + label + '] ' + (r && r.status) + ' len=' + bodyStr.length);
        console.log('[' + label + '] ' + preview);
        return label + '[' + ((r && r.status) || 0) + ']';
      } catch(e) {
        console.log('[' + label + '] EXC ' + (e.message || e));
        return label + '[EXC]';
      }
    }

    //toast('TEST: ' + report, 30000);

    // Trả URL worker như cũ để play
    // Trả URL worker như cũ để play
    var playParams = (type == 'mv') ? { aid: aid } : { ep_id: epId };
    // ⭐ Chỉ gán season_id nếu THẬT SỰ có, không phải undefined/null/empty
    if (type != 'mv' && seasonId && seasonId !== 'undefined' && seasonId !== 'null' && seasonId !== '') {
      playParams.season_id = seasonId;
    }
    var data = getPlayurl(playParams, BILI_USER, BILI_PASS, 80);

    // ⭐ Retry qn thấp hơn nếu 10004004
    if (data && data.code === 10004004) {
      console.log('[Playurl] code=10004004 → retry qn=64');
      data = getPlayurl(playParams, BILI_USER, BILI_PASS, 64);
    }
    if (data && data.code === 10004004) {
      console.log('[Playurl] code=10004004 → retry qn=32');
      data = getPlayurl(playParams, BILI_USER, BILI_PASS, 32);
    }

    if (!data || data.code !== 0) {
      var code = data && data.code;
      console.log('[Playurl-Detail] Lỗi code=' + code);

      if (code === 10004004) {
        toast('Acc không có VIP hoặc thiếu cookie VIP (DedeUserID__ckMd5, buvid3/4). ' +
              'Vào /login paste đủ cookie.', 8000);
        throw new Error('VIP_REQUIRED (10004004)');
      }
      if (code === 10004001 || code === -101) {
        toast('Session hết hạn, mở lại app.', 5000);
        throw new Error('SESSION_EXPIRED (' + code + ')');
      }
      throw new Error('Playurl err ' + code);
    }

    if (!data.data || !data.data.playurl) {
      throw new Error('Không có playurl trong response');
    }

    var playurl = data.data.playurl;
    var playurl = data.data.playurl;
    var videos = (playurl.video || []).filter(function(v){return v.video_resource && v.video_resource.url;});
    videos.sort(function(a,b){return (b.video_resource.quality||0)-(a.video_resource.quality||0);});
    var video = videos[0].video_resource;
    var audios = (playurl.audio_resource || []).filter(function(a){return a && a.url;});
    audios.sort(function(a,b){return (b.quality||0)-(a.quality||0);});
    var audio = audios[0];

    var masterUrl = HLS_LOCAL_URL + '/hls/master?' + buildQuery({
      v: video.url, a: audio.url,
      d: String(playurl.duration || 0),
      w: String(video.width || 1920),
      h: String(video.height || 1080),
      vsz: String(video.size || 0),
      vinit: (video.segment_base && video.segment_base.range) || '',
      asz: String(audio.size || 0),
      ainit: (audio.segment_base && audio.segment_base.range) || ''
    });
    console.log('[Master] video.url len=' + (video.url || '').length +
                ' audio.url len=' + (audio.url || '').length);
    console.log('[Master] vinit=' + ((video.segment_base && video.segment_base.range) || '') +
                ' vinit_sz=' + (video.size || 0));
    console.log('[Master] ainit=' + ((audio.segment_base && audio.segment_base.range) || '') +
                ' ainit_sz=' + (audio.size || 0));

    
    // ⭐ Lấy subtitle
    var subs = [];
    try {
      var subParams = (type == 'mv') ? { aid: aid } : { ep_id: epId };
      subs = getSubtitles(subParams, BILI_USER, BILI_PASS);
      console.log('[parseDetailResponse] subs=' + subs.length);
    } catch (subErr) {
      console.log('[parseDetailResponse] sub err: ' + (subErr.message || subErr));
    }
    return JSON.stringify({
      url: masterUrl,
      mimeType: 'application/x-mpegURL',
      isEmbed: false,
      headers: { 'User-Agent': UA, 'Referer': REF, 'Origin': ORG, 'Cookie': ckStr },
      subtitles: subs.length ? subs : [{ lang: '', url: '' }]
    });

  } catch(e) {
    console.log('[parseDetailResponse] ERR: ' + (e.message || e));
    return JSON.stringify({
      url: 'https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4',
      mimeType: 'video/mp4',
      isEmbed: false, headers: {}, subtitles: []
    });
  }
}
function parseEmbedResponse(html, url) {
    log("parseEmbedResponse [url]: " + url); //console.log("parseEmbedResponse [Raw]: " + html);
    try {
      var stream = "";
      var customJS = clearJS(rawJS);
      // Mimetype application/x-mpegURL video/mp4
      console.log("parseEmbedResponse fetch\n" + stream);
  
      var $return = JSON.stringify({
        url: stream,
        mimeType: "",
        isEmbed: false,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": BASEURL,
          "Origin": BASEURL,
          "Block-Ads": false,
          "Block-Css": "",
          "Custom-Js": customJS
        },
        subtitles: [{
          lang: "",
          url: ""
        }],      
      });
      console.log("Return Embed:\n" + $return)
      return $return
  } catch(e) {
    var emsg = String(e.message || e);
    console.log('[parseDetailResponse] ERR: ' + emsg);

    var msg = 'Không lấy được link phim';
    if (emsg.indexOf('REGION_LOCKED') !== -1) {
      msg = 'Acc không có VIP hoặc bị khoá vùng. Đổi acc VIP.';
    } else if (emsg.indexOf('SESSION_EXPIRED') !== -1) {
      msg = 'Session hết hạn. Đóng app mở lại.';
    } else if (emsg.indexOf('APP_ONLY') !== -1) {
      msg = 'Phim chỉ xem được trên app chính chủ.';
    }

    return JSON.stringify({
      url: 'https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4',
      mimeType: 'video/mp4',
      isEmbed: false,
      headers: {},
      subtitles: [],
      message: msg
    });
  }
  }
 // parseDetailResnse, parseEmbedResponse
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HÀM TẠO CUSTOMpo SCRIPT BEGIN ====

// ==== HÀM TẠO CUSTOM SCRIPT END ====


// ==== HIDEMENU ====
{
// ## Hàm Hỗ Trợ. Hide function
function iframe64(url){
  var html = `
  <html><style>body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }iframe { width: 100%; height: 100%; object-fit: contain; }</style><body style='margin:0;padding:0;background:#000;'><iframe id='player' src='${url}' scrolling='no' frameborder='0' class='openloadvideo lab-pinned-child' allowfullscreen='true' webkitallowfullscreen='true' mozallowfullscreen='true' name='watch'></iframe></body></html>
  `;
  return "data:text/html;base64," + BASE64.encode(html);
  
}
 
function getUrlDetail(slug, datasend) {
  try {
    if (datasend && datasend.indexOf('type=series') === 0) {
      var dataS = parseDataString(datasend);
      console.log('[getUrlDetail] Series: mid=' + dataS.mid + ', key=' + dataS.key);
      return buildSeriesDetail(slug, dataS);
    }

    // ⭐ Nhánh mới cho video lẻ
    if (datasend && datasend.indexOf('type=raw') === 0) {
      var dataR = parseDataString(datasend);
      console.log('[getUrlDetail] Raw: mid=' + dataR.mid +
        ', pn=' + dataR.pn + ', aid=' + dataR.aid);
      return buildRawSeriesDetail(slug, dataR);
    }

    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    var detailUrl = BASEURL + "/" + slug;
    log("getUrlDetail[url]: \n" + detailUrl);
    return detailUrl;
  } catch (e) {
    log("getUrlDetail[err]:\n " + e);
    if (slug && slug.indexOf('http') === 0) return slug;
    return "";
  }
}
  function getUrlCategories() { 
      try {
          log("getUrlCategories[url]: \n" + BASEURL);
          return BASEURL; 
      } catch (e) {
          log("getUrlCategories[err]:\n " + e);
          return "";
      }
  }
  function getUrlCountries() { 
      try {
          return ""; 
      } catch (e) {
          log("getUrlCountries[err]:\n " + e);
          return "";
      }
  }
  function getUrlYears() { 
      try {
          return ""; 
      } catch (e) {
          log("getUrlYears[err]:\n " + e);
          return "";
      }
  }
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
  function parseCountriesResponse(html) {
      try {
          return "[]";
      } catch (e) {
          log("parseCountriesResponse[err]:\n " + e);
          return "[]";
      }
  }
  function parseYearsResponse(html) {
      try {
          return "[]";
      } catch (e) {
          log("parseYearsResponse[err]:\n " + e);
          return "[]";
      }
  }
  function parseSearchResponse(html, url) {
      try {
          log("parseSearchResponse[url]: \n" + url);
          return parseListResponse(html, url);
      } catch (e) {
          log("parseSearchResponse[err]:\n " + e);
          return JSON.stringify({
              "items": [],
              "pagination": {
                  "currentPage": 1,
                  "totalPages": 1
              }
          });
      }
  }
  // Tạo thẻ chủ đè ở menu home lấy dữ liệu ben dưới
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
  // Tạo thẻ chủ đề filter..
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
  // Hàm chuyển đổi text html %20 sang text thuần
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
  
}
// ==== HIDEMENU ====

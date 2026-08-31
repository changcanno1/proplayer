// -----------------------------------------------------------------------------
// INJECT CUSTOM-JS XỬ LÝ JWPLAYER MÃ HÓA & FIX BẮT PHỤ ĐỀ (VIETSUB)
// -----------------------------------------------------------------------------
function parseDetailResponse(html, url) {
     try {
         var streamLink = url;
         var subs = [];

         // THUẬT TOÁN 1: TÁCH LINK PHỤ ĐỀ ĐỂ TRUYỀN RA NATIVE PLAYER
         try {
             // Ưu tiên bắt trực tiếp link API phụ đề đặc thù của hệ thống server (phimgod)
             var regexPhimgod = /https?:\/\/[a-zA-Z0-9.-]+\/api\/subtitle\/[^"']+/gi;
             var matchAPI = html.match(regexPhimgod);
             if (matchAPI) {
                 for (var k = 0; k < matchAPI.length; k++) {
                     var sUrl = matchAPI[k];
                     if (!subs.some(s => s.url === sUrl)) {
                         // Đuôi /e thường là English, /v là Vietsub
                         var langLabel = sUrl.includes("/e") ? "English" : "Vietsub";
                         subs.push({ url: sUrl, lang: langLabel, label: langLabel });
                     }
                 }
             }

             // Dự phòng: Quét toàn bộ mảng tracks nội tại của JWPlayer tìm file .vtt / .srt
             if (subs.length === 0) {
                 var trackRegex = /file["']?\s*:\s*["']([^"']*\.(vtt|srt|css)[^"']*)["']/gi;
                 var match;
                 while ((match = trackRegex.exec(html)) !== null) {
                     var trackUrl = match[1];
                     if (!subs.some(s => s.url === trackUrl)) {
                         var tLang = trackUrl.toLowerCase().includes("eng") ? "English" : "Vietsub";
                         subs.push({ url: trackUrl, lang: tLang, label: tLang });
                     }
                 }
             }
         } catch (ex) {
             log("Lỗi Regex bắt Subtitle: " + ex);
         }

         // THUẬT TOÁN 2: ÉP WEBVIEW TỰ BẬT VIETSUB THÔNG QUA CUSTOM-JS
         var customJS = `
             try {
                 // Tắt Anti-Devtools
                 if (window.devtoolsDetector) {
                     window.devtoolsDetector.launch = function(){};
                     window.devtoolsDetector.addListener = function(){};
                     window.devtoolsDetector.isOpen = false;
                 }

                 // CSS ẩn rác, full màn hình player
                 var s = document.createElement('style');
                 s.innerHTML = 'html, body { margin:0!important; padding:0!important; width:100vw!important; height:100vh!important; overflow:hidden!important; background:#000!important; } ' +
                               '#ssPlay { position:fixed!important; top:0!important; left:0!important; width:100vw!important; height:100vh!important; z-index:999999!important; display:flex!important; } ' +
                               '#sub-cfg-modal, header, footer, iframe:not(#ssPlay iframe) { display:none!important; pointer-events:none!important; }';
                 document.head.appendChild(s);

                 // Vòng lặp: Auto Play & Tự động quét và bật Phụ đề
                 var checkJWP = setInterval(function() {
                     if (typeof jwplayer === 'function') {
                         var player = jwplayer();
                         if (player.getState) {
                             var state = player.getState();
                             if (state !== 'playing' && state !== 'buffering') {
                                 player.play();
                             }
                             
                             // FIX SUBTITLE: Tự động kích hoạt Caption nếu đang bị Off (0)
                             try {
                                 var tracks = player.getCaptionsList();
                                 // tracks[0] mặc định là 'Off'
                                 if (tracks && tracks.length > 1 && player.getCurrentCaptions() === 0) {
                                     var viIndex = 1; // Mặc định bật track số 1
                                     for (var i = 0; i < tracks.length; i++) {
                                         if (tracks[i].label && tracks[i].label.toLowerCase().includes('vi')) {
                                             viIndex = i;
                                             break;
                                         }
                                     }
                                     player.setCurrentCaptions(viIndex);
                                 }
                             } catch(err) {}
                         }
                     }
                     // Auto Click nút Skip
                     var skip = document.querySelector('.jw-skip');
                     if (skip) skip.click();
                 }, 1000);
             } catch(e) {}
         `;

         return JSON.stringify({
             url: streamLink,
             isEmbed: true,
             headers: {
                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                 "Referer": "https://vicdn.cc/",
                 "Custom-Js": customJS.replace(/\s+/g, ' ').trim()
             },
             subtitles: subs // <--- Mảng phụ đề đã bắt được bơm ra cho App
         });
     } catch (e) {
         log("Lỗi parseDetailResponse: " + e);
         return JSON.stringify({ url: "", isEmbed: true, headers: {}, subtitles: [] });
     }
}

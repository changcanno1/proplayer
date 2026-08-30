function parseDetailResponse(html, url) {
    try {
        // Áp dụng chuẩn logic CustomJS: Chặn triệt để Native Player iOS
        var pureWebviewJs = `
            (function() {
                // 1. CHẶN TUYỆT ĐỐI CÁC HÀM GỌI FULLSCREEN CỦA IOS NATIVE
                var blockFs = function(e) {
                    if (e && e.preventDefault) e.preventDefault();
                    if (e && e.stopPropagation) e.stopPropagation();
                    return Promise.resolve();
                };

                try {
                    Object.defineProperty(document, 'fullscreenEnabled', {get: function() { return false; }});
                    Object.defineProperty(document, 'webkitFullscreenEnabled', {get: function() { return false; }});
                    if(Element.prototype.requestFullscreen) Element.prototype.requestFullscreen = blockFs;
                    if(Element.prototype.webkitRequestFullscreen) Element.prototype.webkitRequestFullscreen = blockFs;
                    if(Element.prototype.mozRequestFullScreen) Element.prototype.mozRequestFullScreen = blockFs;
                    if(Element.prototype.msRequestFullscreen) Element.prototype.msRequestFullscreen = blockFs;
                    
                    if(window.HTMLVideoElement) {
                        HTMLVideoElement.prototype.webkitEnterFullscreen = blockFs;
                        HTMLVideoElement.prototype.enterFullscreen = blockFs;
                        Object.defineProperty(HTMLVideoElement.prototype, 'webkitDisplayingFullscreen', { get: function() { return false; } });
                        Object.defineProperty(HTMLVideoElement.prototype, 'webkitSupportsFullscreen', { get: function() { return false; } });
                    }
                } catch(e) {}

                // Chặn event tự động nhảy fullscreen của iOS Safari/Webview
                document.addEventListener('webkitbeginfullscreen', blockFs, true);

                // 2. CSS ẨN RÁC & ÉP TRÀN MÀN HÌNH
                var style = document.createElement('style');
                style.innerHTML = 'aside, header, nav, footer, .sidebar, .menu, .comments, [class*="download"], [class*="ad-"] { display: none !important; opacity: 0 !important; pointer-events: none !important; z-index: -9999 !important; } ' +
                                  'main, .w-full, .flex-1, body, html { width: 100vw !important; height: 100vh !important; padding: 0 !important; margin: 0 !important; max-width: 100% !important; overflow: hidden !important; background: #000 !important; overscroll-behavior-y: none; } ' +
                                  'video { object-fit: cover !important; }'; // Ép video ko bị viền đen
                document.head.appendChild(style);

                // 3. HÀM ÉP PLAYSINLINE (PHÁT NGAY TRONG WEBVIEW)
                function forceInline(v) {
                    if (!v) return;
                    v.setAttribute('playsinline', '');
                    v.setAttribute('webkit-playsinline', '');
                    v.playsInline = true;        // Bắt buộc phải set DOM property này
                    v.webkitPlaysInline = true;  // Dành cho iOS cũ
                }

                // Chạy cho các video đã có sẵn
                document.querySelectorAll('video').forEach(forceInline);

                // Dùng MutationObserver để bắt video ngay khi trang web vừa tạo ra (nhanh hơn setInterval)
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.tagName === 'VIDEO') {
                                forceInline(node);
                            } else if (node.querySelectorAll) {
                                var vids = node.querySelectorAll('video');
                                for(var i = 0; i < vids.length; i++) forceInline(vids[i]);
                            }
                        });
                    });
                });
                if (document.body || document.documentElement) {
                    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
                }

                // Giữ setInterval dự phòng
                setInterval(function() {
                    var vids = document.querySelectorAll('video');
                    for (var k = 0; k < vids.length; k++) forceInline(vids[k]);
                }, 500);

                // 4. AUTO LOGIN LOGIC (CỦA BẠN GIỮ NGUYÊN)
                var EMAIL = "iamwilliamm6@gmail.com";
                var PASS = "trung@123";
                if (sessionStorage.getItem('vax_autologin_done')) return;
                function doLogin() {
                    var btns = document.querySelectorAll('button');
                    var loginBtn = null;
                    for (var i = 0; i < btns.length; i++) {
                        if (btns[i].textContent.includes('Đăng Nhập')) {
                            loginBtn = btns[i];
                            break;
                        }
                    }
                    if (loginBtn) {
                        sessionStorage.setItem('vax_redirect_back', window.location.href);
                        loginBtn.click();
                        var checkForm = setInterval(function() {
                            var emailInput = document.querySelector('input[type="email"], input[name="email"], input[placeholder*="mail"]');
                            var passInput = document.querySelector('input[type="password"], input[name="password"]');
                            var submitBtn = document.querySelector('button[type="submit"]');

                            if (emailInput && passInput && submitBtn) {
                                clearInterval(checkForm);
                                var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                                nativeInputValueSetter.call(emailInput, EMAIL);
                                emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                                nativeInputValueSetter.call(passInput, PASS);
                                passInput.dispatchEvent(new Event('input', { bubbles: true }));
                                setTimeout(function() {
                                    submitBtn.click();
                                    sessionStorage.setItem('vax_autologin_done', 'true');
                                }, 500);
                            }
                        }, 500);
                    }
                }
                setTimeout(doLogin, 1500);
            })();
        `;

        return JSON.stringify({
            "url": url,
            "isEmbed": true, 
            "headers": {
                "Referer": BASEURL,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
                "Block-Ads": "true",
                "Block-Redirects": "false", 
                "Custom-Js": pureWebviewJs.replace(/\n/g, " ").trim()
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": url, "isEmbed": true, "headers": {} });
    }
}

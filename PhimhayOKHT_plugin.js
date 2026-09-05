var iddomain = "phimhayok"
BASEURL = "https://vkey.vn/" + iddomain;
//BASEURL = "https://phimhayok5.site";
BASEAPI = "https://api-client.phimhayok.net"

// Đã xóa toàn bộ giao diện HTML và CSS của popup donate
var popup_html = "";

function getManifest() {
  try{
    return JSON.stringify({
      "id": "phimhayok",
      "name": "[MOVIE] Phimhayok",
      "version": "1.2",
      "author": "Alokillgtv",
      "info": "",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/phimhayok.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": false,
      "type": "MOVIE",
      "subtitleCat": false,
      popup_html: popup_html,
      "debug": true,
      "playerType": "exoplayer"
    });
  }
  catch(e){
    return JSON.stringify({
      "id": "loiapp",
      "name": "Plugin bị lỗi cài đặt",
      "version": "1.1",
      "info": "Plugin đang bị lỗi: \n" + e,
      "baseUrl": "http://vkey.vn/",
      "iconUrl": "https://raw.githubusercontent.com/alokillgtv03/vaxplugins/main/img/novahd.png",
      "isEnabled": true,
      "type": "MOVIE",
      "playerType": "exoplayer"
     });
  }
}

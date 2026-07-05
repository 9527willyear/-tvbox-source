const CryptoJS = require('crypto-js');
const https = require('https');
const querystring = require('querystring');

// mimic TVBox lazy environment
const rule = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://wbbb1.com/'
  }
};

function request(url, opts) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    let postData = '';
    if (opts.data && typeof opts.data === 'object') {
      postData = querystring.stringify(opts.data);
    } else {
      postData = opts.data || opts.body || '';
    }
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: Object.assign({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }, opts.headers)
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function wbbbBtoa(s) { try { return btoa(s); } catch (e) { return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(s)); } }
function wbbbAtob(s) { try { return atob(s); } catch (e) { return CryptoJS.enc.Base64.parse(s).toString(CryptoJS.enc.Latin1); } }
function wbbbCalculate(s) { return (CryptoJS.MD5(s).toString() + ' P').slice(-22); }
function wbbbCalculatee(s) { return CryptoJS.MD5(s).toString(); }
function wbbbAesplay(keyStr, dataStr) {
  var S = [], i, j, tmp;
  for (i = 0; i < 256; i++) S[i] = i;
  j = 0;
  for (i = 0; i < 256; i++) {
    j = (j + S[i] + keyStr.charCodeAt(i % keyStr.length)) % 256;
    tmp = S[i]; S[i] = S[j]; S[j] = tmp;
  }
  i = 0; j = 0; var out = '';
  for (var k = 0; k < dataStr.length; k++) {
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    tmp = S[i]; S[i] = S[j]; S[j] = tmp;
    var t = (S[i] + S[j]) % 256;
    out += String.fromCharCode(dataStr.charCodeAt(k) ^ S[t]);
  }
  return out;
}
function wbbbEnplay(u, plain) { return wbbbBtoa(wbbbAesplay(wbbbCalculate(u), plain)); }
function wbbbDeplay(u, b64) { return wbbbAesplay(wbbbCalculate(u), wbbbAtob(b64)); }

(async () => {
  // example multi-episode
  let input = 'https://wbbb1.com/vplay/113026-7-1.html';
  let playHtml = await request(input, { headers: rule.headers });
  let playerJson = '';
  let idx = playHtml.indexOf('var player_aaaa=');
  if (idx >= 0) {
    let start = idx + 'var player_aaaa='.length;
    let depth = 0, end = -1;
    for (let i = start; i < playHtml.length; i++) {
      if (playHtml[i] === '{') depth++;
      else if (playHtml[i] === '}') {
        depth--;
        if (depth === 0) { end = i + 1; break; }
      }
    }
    if (end > start) playerJson = playHtml.substring(start, end);
  }
  if (!playerJson) { console.error('no player'); return; }
  let player = JSON.parse(playerJson);
  let encUrl = player.url || '';
  let linkNext = player.link_next || '';
  let vodName = player.vod_data && player.vod_data.vod_name ? player.vod_data.vod_name : '';

  let playerHost = 'xn--qvr2v.850088.xyz';
  let u = encUrl.replace(/^http:\/\//, 'https://');
  u += '&next=//' + (linkNext ? 'wbbb1.com' + linkNext : '');
  let time = Math.floor(Date.now() / 1000);
  let key = wbbbEnplay(u, wbbbCalculatee(u + 'stray'));
  let vkey = wbbbEnplay(u, time + wbbbCalculatee(wbbbCalculate(u) + 'stray'));
  let ckey = wbbbEnplay(u, wbbbCalculatee(playerHost + 'stray'));
  let apiUrl = 'https://' + playerHost + '/player/api.php';
  let reqHeaders = {
    'User-Agent': rule.headers['User-Agent'],
    'Referer': 'https://' + playerHost + '/player/?url=' + encodeURIComponent(encUrl) + '&next=//' + (linkNext ? 'wbbb1.com' + linkNext : '') + '&title=' + encodeURIComponent(vodName)
  };
  let apiResp = await request(apiUrl, { method: 'POST', data: { url: u, key: key, vkey: vkey, ckey: ckey }, headers: reqHeaders });
  console.log('apiResp first 200 chars:', apiResp.slice(0,200));
  let json = JSON.parse(apiResp);
  let aesKey = CryptoJS.enc.Utf8.parse(wbbbDeplay(u, json.aes_key));
  let aesIv = CryptoJS.enc.Utf8.parse(wbbbDeplay(u, json.aes_iv));
  let realUrl = CryptoJS.AES.decrypt(json.url, aesKey, { iv: aesIv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
  console.log('REAL URL:', realUrl);
})();

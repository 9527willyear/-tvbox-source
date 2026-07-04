const CryptoJS = require('crypto-js');
const https = require('https');
const querystring = require('querystring');

const encUrl = 'pcDSYca9_9thblkRqi-ygMR4Z47WkUzmcX7k3fNJ_r8xpr2IVU_Y2nKVZl2hLYF0cbd6FIPCTwc1g8YtmF7oFgXjnXDs3D_IUglNsMtPeec';
const title = '天才游戏';
const next = '';
const host = 'wbbb1.com';
const playerHost = 'xn--qvr2v.850088.xyz';

let urlValueurl = encUrl.replace(/^http:\/\//, 'https://');
// append next/title exactly like the iframe query string
urlValueurl += '&next=//' + host + next;
urlValueurl += '&title=' + title;

function calculate(s) {
  return (CryptoJS.MD5(s).toString() + ' P').slice(-22);
}
function calculatee(s) {
  return CryptoJS.MD5(s).toString();
}
function aesplay(keyStr, dataStr) {
  const S = new Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + keyStr.charCodeAt(i % keyStr.length)) % 256;
    [S[i], S[j]] = [S[j], S[i]];
  }
  let i = 0; j = 0;
  let out = '';
  for (let k = 0; k < dataStr.length; k++) {
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
    const t = (S[i] + S[j]) % 256;
    out += String.fromCharCode(dataStr.charCodeAt(k) ^ S[t]);
  }
  return out;
}
function enplay(plain) {
  return btoa(aesplay(calculate(urlValueurl), plain));
}
function deplay(b64) {
  return aesplay(calculate(urlValueurl), atob(b64));
}

const time = Math.floor(Date.now() / 1000);
const keyValue = enplay(calculatee(urlValueurl + 'stray'));
const vkeyValue = enplay(time + calculatee(calculate(urlValueurl) + 'stray'));
const ckeyValue = enplay(calculatee(playerHost + 'stray'));

console.log('urlValueurl:', urlValueurl);
console.log('key:', keyValue);
console.log('vkey:', vkeyValue);
console.log('ckey:', ckeyValue);

const postData = querystring.stringify({
  url: urlValueurl,
  key: keyValue,
  vkey: vkeyValue,
  ckey: ckeyValue,
});

const req = https.request({
  hostname: playerHost,
  path: '/player/api.php',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': `https://${playerHost}/player/?url=${encodeURIComponent(encUrl)}&next=//${host}${next}&title=${encodeURIComponent(title)}`,
  },
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('status', res.statusCode);
    console.log('body', body.slice(0, 500));
    try {
      const json = JSON.parse(body);
      if (json.url && json.aes_key && json.aes_iv) {
        const key = CryptoJS.enc.Base64.parse(deplay(json.aes_key));
        const iv = CryptoJS.enc.Base64.parse(deplay(json.aes_iv));
        const decrypted = CryptoJS.AES.decrypt(json.url, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString(CryptoJS.enc.Utf8);
        console.log('DECRYPTED URL:', decrypted);
      }
    } catch (e) {
      console.error('parse/decrypt error', e.message);
    }
  });
});
req.on('error', e => console.error('req error', e));
req.write(postData);
req.end();

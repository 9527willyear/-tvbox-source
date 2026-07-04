const CryptoJS = require('crypto-js');
const https = require('https');
const querystring = require('querystring');

const encUrl = 'HMbtdc0FxeXe1bJe82orlkgt3Q9uvp8Jg0w8E6LHiY9RV6ML5YMEFvc3ddLBtAqYbtfZlW7BU7O0PoJcw7CG_A';
const title = '迷墙';
const linkNext = '/vplay/112311-6-2.html';
const host = 'wbbb1.com';
const playerHost = 'xn--qvr2v.850088.xyz';

function calculate(s) { return (CryptoJS.MD5(s).toString() + ' P').slice(-22); }
function calculatee(s) { return CryptoJS.MD5(s).toString(); }
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
function enplay(u, plain) { return Buffer.from(aesplay(calculate(u), plain), 'binary').toString('base64'); }
function deplay(u, b64) { return aesplay(calculate(u), Buffer.from(b64, 'base64').toString('binary')); }

let u = encUrl.replace(/^http:\/\//, 'https://');
u += '&next=//' + host + linkNext;
const time = Math.floor(Date.now() / 1000);
const keyValue = enplay(u, calculatee(u + 'stray'));
const vkeyValue = enplay(u, time + calculatee(calculate(u) + 'stray'));
const ckeyValue = enplay(u, calculatee(playerHost + 'stray'));

const postData = querystring.stringify({ url: u, key: keyValue, vkey: vkeyValue, ckey: ckeyValue });
const req = https.request({
  hostname: playerHost,
  path: '/player/api.php',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': `https://${playerHost}/player/?url=${encodeURIComponent(encUrl)}&next=//${host}${encodeURIComponent(linkNext)}&title=${encodeURIComponent(title)}`,
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('status', res.statusCode);
    try {
      const json = JSON.parse(body);
      console.log('json keys', Object.keys(json));
      if (json.aes_key) {
        const dk = deplay(u, json.aes_key);
        const di = deplay(u, json.aes_iv);
        console.log('decrypted key raw bytes:', Buffer.from(dk,'binary').toString('hex'), 'length', dk.length);
        console.log('decrypted iv raw bytes:', Buffer.from(di,'binary').toString('hex'), 'length', di.length);
        console.log('key as latin1:', dk);
        console.log('iv as latin1:', di);
        const keyW = CryptoJS.enc.Utf8.parse(dk);
        const ivW = CryptoJS.enc.Utf8.parse(di);
        const decrypted = CryptoJS.AES.decrypt(json.url, keyW, { iv: ivW, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
        console.log('DECRYPTED URL (Utf8):', decrypted);
        // try Base64 parse for key/iv
        try {
          const keyB = CryptoJS.enc.Base64.parse(dk);
          const ivB = CryptoJS.enc.Base64.parse(di);
          const dec2 = CryptoJS.AES.decrypt(json.url, keyB, { iv: ivB, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
          console.log('DECRYPTED URL (Base64 key/iv):', dec2);
        } catch(e) { console.error('base64 key parse err', e.message); }
      }
    } catch (e) { console.error('parse/decrypt err', e.message); }
  });
});
req.on('error', e => console.error('req error', e));
req.write(postData);
req.end();

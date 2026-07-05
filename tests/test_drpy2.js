const fs = require('fs');
const vm = require('vm');
const CryptoJS = require('crypto-js');
const https = require('https');
const querystring = require('querystring');
const { URL } = require('url');

function httpReq(url, obj) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    let method = obj.method || 'GET';
    let postData = '';
    let headers = Object.assign({}, obj.headers || {});
    if (method === 'POST') {
      if (obj.body && typeof obj.body === 'string') {
        postData = obj.body;
      } else if (obj.data && typeof obj.data === 'object') {
        postData = querystring.stringify(obj.data);
      } else if (obj.data && typeof obj.data === 'string') {
        postData = obj.data;
      }
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: method,
      headers: headers,
      timeout: 15000
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ content: body, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (postData) req.write(postData);
    req.end();
  });
}

const sandbox = {
  console: console,
  log: function(...args){ console.log('[LOG]', ...args); },
  CryptoJS: CryptoJS,
  fetch_params: {},
  MOBILE_UA: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
  PC_UA: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  getHome: function(url){ try { return new URL(url).origin; } catch(e){ return ''; } },
  keysToLowerCase: function(obj){ let r={}; for(let k in obj){ r[k.toLowerCase()]=obj[k]; } return r; },
  req: async function(url, obj){ return await httpReq(url, obj); },
  global: undefined,
  window: undefined,
  document: undefined,
  cheerio: undefined,
  模板: undefined,
  pdfh: function(){ return ''; },
  pd: function(html, rule, url){ return ''; },
  pdfa: function(){ return []; }
};
sandbox.global = sandbox;

const context = vm.createContext(sandbox);

// load drpy2 (strip ES import)
let drpyCode = fs.readFileSync('.analysis/wbbb/drpy2.min.js', 'utf8');
drpyCode = drpyCode.replace(/import\s+\{[^}]+\}\s+from\s+["'][^"']+["'];?/, '');
drpyCode = drpyCode.replace(/export\s+default\s+\{[\s\S]*$/, '');
vm.runInContext(drpyCode, context, { timeout: 30000 });

// load wbbb.js
let wbbbCode = fs.readFileSync('wbbb.js', 'utf8');
wbbbCode = wbbbCode.replace(/var\s+rule\s*=/, 'rule =');
vm.runInContext(wbbbCode, context, { timeout: 30000 });

const rule = context.rule;
console.log('rule title:', rule.title);

(async () => {
  const input = 'https://wbbb1.com/vplay/112311-6-1.html';
  context.input = input;
  let lazyCode = rule.lazy;
  if (lazyCode.startsWith('js:')) lazyCode = lazyCode.slice(3);
  try {
    vm.runInContext(lazyCode, context, { timeout: 30000 });
  } catch (e) {
    console.error('lazy error:', e.message);
    console.error(e.stack);
  }
  console.log('FINAL INPUT:', JSON.stringify(context.input, null, 2));
})();

const CryptoJS = require('crypto-js');
const fs = require('fs');
const s = fs.readFileSync('./player/danmaya.js', 'utf8');
const iframeUrl = 'https://xn--qvr2v.850088.xyz/player/?url=test&title=t';
const loc = new URL(iframeUrl);
const captured = [];
const docHandler = {
  get(t, p) { if (typeof p !== 'symbol') captured.push(p); return function() { return {}; }; },
  set(t, p, v) { t[p] = v; return true; }
};
const windowStub = {
  location: { href: iframeUrl, protocol: loc.protocol, host: loc.host, hostname: loc.hostname, port: loc.port, pathname: loc.pathname, search: loc.search, hash: loc.hash, origin: loc.origin, assign() {}, replace() {}, reload() {}, toString() { return iframeUrl; } },
  document: new Proxy({}, docHandler),
  navigator: { userAgent: 'Mozilla/5.0', platform: 'Win32' },
  localStorage: { getItem() { return null; }, setItem() {} },
  addEventListener() {},
  parent: null, top: null, self: null, alert() {},
};
windowStub.self = windowStub; windowStub.parent = windowStub; windowStub.top = windowStub; windowStub.window = windowStub;
function jq(sel) {
  const chain = { html() { return chain; }, text() { return ''; }, attr() { return chain; }, css() { return chain; }, get() { return { innerHTML: '', style: {} }; }, append() { return chain; }, prepend() { return chain; }, on() { return chain; }, off() { return chain; }, val() { return ''; }, click() { return chain; }, show() { return chain; }, hide() { return chain; }, length: 0 };
  return chain;
}
jq.ajaxSetup = {};
jq.ajax = (u, o) => { console.log('AJAX', u, o); };
global.CryptoJS = CryptoJS;
global.window = windowStub;
global.document = windowStub.document;
global.localStorage = windowStub.localStorage;
global.navigator = windowStub.navigator;
global.$ = jq;
global.btoa = btoa;
global.atob = atob;
global.URL = URL;
global.URLSearchParams = URLSearchParams;
try { require('./player/danmaya.js'); } catch (e) { console.error('ERR', e.message); }
console.log('doc accesses:', captured.slice(0, 40));

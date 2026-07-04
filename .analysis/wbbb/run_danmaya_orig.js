const CryptoJS = require('crypto-js');

// Encoded URL sample from wbbb1.com /vplay/112168-9-1.html
const encUrl = 'pcDSYca9_9thblkRqi-ygMR4Z47WkUzmcX7k3fNJ_r8xpr2IVU_Y2nKVZl2hLYF0cbd6FIPCTwc1g8YtmF7oFgXjnXDs3D_IUglNsMtPeec';
const nextPath = '';
const title = '天才游戏';

const iframeUrl = `https://xn--qvr2v.850088.xyz/player/?url=${encodeURIComponent(encUrl)}${nextPath ? '&next=' + encodeURIComponent(nextPath) : ''}&title=${encodeURIComponent(title)}`;

const captured = {};

function jq(sel) {
  const chain = {
    html() { return chain; },
    text() { return ''; },
    attr() { return chain; },
    css() { return chain; },
    get(i) { return { innerHTML: '', style: {}, appendChild(){} }; },
    append() { return chain; },
    prepend() { return chain; },
    on() { return chain; },
    off() { return chain; },
    val() { return ''; },
    click() { return chain; },
    show() { return chain; },
    hide() { return chain; },
    remove() { return chain; },
    empty() { return chain; },
    removeClass() { return chain; },
    addClass() { return chain; },
    hasClass() { return false; },
    find() { return chain; },
    parent() { return chain; },
    children() { return chain; },
    eq() { return chain; },
    first() { return chain; },
    last() { return chain; },
    length: 0,
  };
  return chain;
}
jq.ajaxSetup = { timeout: undefined, cache: undefined };
jq.ajax = function(url, options) {
  if (typeof options === 'object' && options) {
    captured.ajax = { url, options };
  } else {
    captured.ajax = { url: options && options.url, options: url };
  }
  console.log('CAPTURED AJAX URL:', url);
  console.log('CAPTURED AJAX DATA:', JSON.stringify(options, null, 2));
};
jq.support = {};

const loc = new URL(iframeUrl);
const windowStub = {
  location: {
    href: iframeUrl,
    protocol: loc.protocol,
    host: loc.host,
    hostname: loc.hostname,
    port: loc.port,
    pathname: loc.pathname,
    search: loc.search,
    hash: loc.hash,
    origin: loc.origin,
    assign() {},
    replace() {},
    reload() {},
    toString() { return iframeUrl; },
  },
  document: {
    title: title + ' - 歪比巴卜',
    domain: 'xn--qvr2v.850088.xyz',
    URL: iframeUrl,
    referrer: 'https://wbbb1.com/',
    createElement() { return {}; },
    getElementsByTagName() { return []; },
    querySelector() { return null; },
    getElementById() { return null; },
    body: { appendChild() {}, style: {} },
    head: { appendChild() {} },
  },
  navigator: { userAgent: 'Mozilla/5.0', platform: 'Win32' },
  screen: { width: 1920, height: 1080 },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  sessionStorage: { getItem() { return null; }, setItem() {} },
  addEventListener() {},
  removeEventListener() {},
  parent: null,
  top: null,
  self: null,
  alert() {},
  confirm() { return true; },
  console,
};
windowStub.self = windowStub;
windowStub.parent = windowStub;
windowStub.top = windowStub;
windowStub.window = windowStub;

global.CryptoJS = CryptoJS;
global.window = windowStub;
global.document = windowStub.document;
global.localStorage = windowStub.localStorage;
global.sessionStorage = windowStub.sessionStorage;
global.navigator = windowStub.navigator;
global.screen = windowStub.screen;
global.$ = jq;
global.btoa = btoa;
global.atob = atob;
global.URL = URL;
global.URLSearchParams = URLSearchParams;
global.setTimeout = setTimeout;
global.clearTimeout = clearTimeout;
global.setInterval = setInterval;
global.clearInterval = clearInterval;
global.encodeURIComponent = encodeURIComponent;
global.decodeURIComponent = decodeURIComponent;

try {
  require('./player/danmaya.js');
  console.log('\n--- top-level finished ---');
  console.log('urlValueurl type:', typeof global.urlValueurl, 'value sample:', String(global.urlValueurl).slice(0, 200));
  console.log('keyValue:', String(global.keyValue).slice(0, 200));
  console.log('vkeyValue:', String(global.vkeyValue).slice(0, 200));
  console.log('ckeyValue:', String(global.ckeyValue).slice(0, 200));
  console.log('shouldShowButton:', global.shouldShowButton);
  console.log('stray defined:', !!global.stray, 'keys:', global.stray ? Object.keys(global.stray).slice(0,20) : '');

  if (global.stray && global.stray.start) {
    global.stray.start();
    console.log('\n--- after stray.start ---');
    console.log('captured:', JSON.stringify(captured, null, 2));
  }
} catch (e) {
  console.error('ERROR:', e && e.stack || e);
  console.log('captured so far:', JSON.stringify(captured, null, 2));
}

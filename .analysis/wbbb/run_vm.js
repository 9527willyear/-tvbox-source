const CryptoJS = require('crypto-js');
const fs = require('fs');
const vm = require('vm');

const encUrl = 'pcDSYca9_9thblkRqi-ygMR4Z47WkUzmcX7k3fNJ_r8xpr2IVU_Y2nKVZl2hLYF0cbd6FIPCTwc1g8YtmF7oFgXjnXDs3D_IUglNsMtPeec';
const title = '天才游戏';
const iframeUrl = `https://xn--qvr2v.850088.xyz/player/?url=${encodeURIComponent(encUrl)}&next=//wbbb1.com&title=${encodeURIComponent(title)}`;
// Alternative clean extraction (no next/title) for testing:
// const iframeUrl = `https://xn--qvr2v.850088.xyz/player/?url=${encodeURIComponent(encUrl)}`;

const captured = {};
const docLog = [];

function makeNoop(name) {
  return function() { console.log('noop called:', name); return {}; };
}

const docTarget = {
  title: title + ' - 歪比巴卜',
  domain: 'xn--qvr2v.850088.xyz',
  URL: iframeUrl,
  referrer: 'https://wbbb1.com/',
  createElement(tag) { return { setAttribute(){}, appendChild(){}, style:{}, id:'', className:'' }; },
  getElementsByTagName() { return []; },
  querySelector() { return null; },
  getElementById() { return null; },
  body: { appendChild() {}, style: {} },
  head: { appendChild() {} },
};
const documentProxy = new Proxy(docTarget, {
  get(t, p) {
    if (typeof p === 'symbol' || p === 'inspect') return undefined;
    if (p in t) return t[p];
    docLog.push(p);
    return makeNoop('document.' + p);
  },
  set(t, p, v) { t[p] = v; return true; }
});

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
jq.ajaxSetup = { timeout: undefined, async: undefined };
jq.ajaxSettings = jq.ajaxSetup;
jq.post = function(url, data, success, error) {
  captured.ajax = { url, data, success: !!success, error: !!error };
  console.log('CAPTURED POST URL:', url);
  console.log('CAPTURED POST DATA:', JSON.stringify(data, null, 2));
};
jq.ajax = function(url, options) {
  if (typeof options === 'object' && options) {
    captured.ajax = { url, options };
    console.log('CAPTURED AJAX URL:', url);
    console.log('CAPTURED AJAX OPTIONS:', JSON.stringify(options, null, 2));
  } else {
    captured.ajax = { url: options && options.url, options: url };
  }
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
  document: documentProxy,
  navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32' },
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

const context = {
  CryptoJS,
  window: windowStub,
  document: documentProxy,
  localStorage: windowStub.localStorage,
  sessionStorage: windowStub.sessionStorage,
  navigator: windowStub.navigator,
  screen: windowStub.screen,
  $: jq,
  btoa,
  atob,
  URL,
  URLSearchParams,
  setTimeout: () => 0,
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
  encodeURIComponent,
  decodeURIComponent,
  JSON,
  Math,
  Date,
  parseInt,
  console,
};

const code = fs.readFileSync('./player/danmaya.js', 'utf8') +
  `; ({ urlValue, urlValueurl, keyValue, vkeyValue, ckeyValue, shouldShowButton, stray })`;

try {
  const result = vm.runInNewContext(code, context, { timeout: 30000 });
  console.log('\n--- VM finished ---');
  console.log('urlValue:', result.urlValue);
  console.log('urlValueurl:', result.urlValueurl);
  console.log('keyValue:', result.keyValue);
  console.log('vkeyValue:', result.vkeyValue);
  console.log('ckeyValue:', result.ckeyValue);
  console.log('shouldShowButton:', result.shouldShowButton);
  console.log('stray keys:', result.stray ? Object.keys(result.stray).slice(0, 20) : 'none');
  console.log('decoded strings:', result.dec);
  if (result.stray && result.stray.start) {
    result.stray.start();
    console.log('\n--- after stray.start ---');
  }
} catch (e) {
  console.error('ERROR:', e && e.stack || e);
}
console.log('\nCAPTURED:', JSON.stringify(captured, null, 2));
console.log('docLog:', docLog.slice(0, 50));

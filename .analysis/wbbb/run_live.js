const fs = require('fs');
const vm = require('vm');
const CryptoJS = require('crypto-js');

const code = fs.readFileSync('danmaya_live.js', 'utf8');

let capturedUrl = null;
let capturedData = null;
let capturedMethod = null;

const elProto = {
  setAttribute: function(){},
  getAttribute: function(){ return ''; },
  appendChild: function(){},
  remove: function(){},
  addEventListener: function(){},
  classList: { add: function(){}, remove: function(){} },
  style: {},
  innerHTML: '',
  innerText: '',
  src: '',
  href: '',
  id: '',
  className: '',
  parentNode: null,
  children: [],
  append: function(){},
  insertBefore: function(){}
};
function makeEl(tag){ return Object.assign({ tagName: tag }, elProto); }

function captureAjax(url, options) {
  capturedUrl = url;
  capturedMethod = options && (options.type || options.method) || 'GET';
  capturedData = options && options.data;
  console.log('AJAX URL:', url);
  console.log('AJAX METHOD:', capturedMethod);
  console.log('AJAX DATA:', JSON.stringify(options && options.data, null, 2));
}

const ajaxReturn = {
  timeout: 0,
  abort: function(){},
  fail: function(fn){ return this; },
  done: function(fn){ return this; },
  always: function(fn){ return this; },
  then: function(){ return this; },
  setRequestHeader: function(){},
  getResponseHeader: function(){ return ''; },
  readyState: 4,
  status: 200,
  responseText: ''
};
ajaxReturn.setTimeout = function(v){ this.timeout = v; return this; };

function ajaxImpl(url, options) {
  if (typeof url === 'object') { options = url; url = options.url; }
  options = options || {};
  captureAjax(url, options);
  return ajaxReturn;
}

function postImpl(url, data, success) {
  captureAjax(url, { type: 'POST', data: data });
  return ajaxReturn;
}

const sandbox = {
  console: console,
  window: {
    location: {
      href: 'https://xn--qvr2v.850088.xyz/player/?url=HMbtdc0FxeXe1bJe82orlkgt3Q9uvp8Jg0w8E6LHiY9RV6ML5YMEFvc3ddLBtAqYbtfZlW7BU7O0PoJcw7CG_A&next=//wbbb1.com/vplay/112311-6-2.html&title=%E8%BF%B7%E5%A2%99',
      protocol: 'https:',
      hostname: 'xn--qvr2v.850088.xyz',
      host: 'xn--qvr2v.850088.xyz',
      origin: 'https://xn--qvr2v.850088.xyz',
      pathname: '/player/',
      search: '?url=HMbtdc0FxeXe1bJe82orlkgt3Q9uvp8Jg0w8E6LHiY9RV6ML5YMEFvc3ddLBtAqYbtfZlW7BU7O0PoJcw7CG_A&next=//wbbb1.com/vplay/112311-6-2.html&title=%E8%BF%B7%E5%A2%99',
      hash: ''
    },
    addEventListener: function(){},
    setInterval: function(){ return 1; },
    setTimeout: function(fn){ if(typeof fn==='function'){ try{fn();}catch(e){} } return 1; },
    clearTimeout: function(){},
    clearInterval: function(){},
    navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    localStorage: { getItem: function(){ return null; }, setItem: function(){} },
    document: { title: '迷墙' },
    top: null
  },
  document: {
    title: '迷墙',
    domain: 'wbbb1.com',
    addEventListener: function(){},
    getElementById: function(){ return makeEl('div'); },
    querySelector: function(){ return makeEl('div'); },
    querySelectorAll: function(){ return []; },
    createElement: function(tag){ return makeEl(tag); },
    body: makeEl('body'),
    documentElement: makeEl('html')
  },
  localStorage: {
    getItem: function(){ return null; },
    setItem: function(){}
  },
  $: {
    ajax: ajaxImpl,
    post: postImpl,
    getJSON: function(){},
    cookie: function(){ return ''; },
    fn: {},
    extend: function(){},
    ajaxSetup: {},
    ajaxSettings: {},
    support: { cors: true }
  },
  Artplayer: function(){ return { on: function(){ return this; }, destroy: function(){}, seek: function(){}, play: function(){}, pause: function(){}, muted: false, volume: 1 }; },
  CryptoJS: CryptoJS,
  btoa: function(s){ return Buffer.from(s,'binary').toString('base64'); },
  atob: function(s){ return Buffer.from(s,'base64').toString('binary'); },
  URL: function(input, base){
    try {
      return new (require('url').URL)(input, base);
    } catch(e) {
      const href = base ? base.replace(/\/?$/, '/') + input.replace(/^\//,'') : String(input);
      return { href: href, search: '', searchParams: new (require('url').URLSearchParams)(''), pathname: '', protocol: 'https:', host: '', hostname: '' };
    }
  },
  URLSearchParams: URLSearchParams,
  decodeURIComponent: decodeURIComponent,
  encodeURIComponent: encodeURIComponent,
  parseInt: parseInt,
  Math: Math,
  Date: Date,
  String: String,
  Array: Array,
  Object: Object,
  Number: Number,
  JSON: JSON,
  isNaN: isNaN,
  NaN: NaN,
  undefined: undefined,
  Infinity: Infinity,
  setInterval: function(){ return 1; },
  setTimeout: function(fn){ if(typeof fn==='function'){ try{fn();}catch(e){} } return 1; },
  clearInterval: function(){},
  clearTimeout: function(){}
};
sandbox.window.top = sandbox.window;
sandbox.window.window = sandbox.window;

const context = vm.createContext(sandbox);
try {
  vm.runInContext(code, context, { timeout: 10000 });
} catch (e) {
  console.error('Execution error:', e.message);
  console.error(e.stack);
}

console.log('CAPTURED URL:', capturedUrl);
console.log('CAPTURED METHOD:', capturedMethod);
console.log('CAPTURED DATA:', JSON.stringify(capturedData, null, 2));
try {
  if (context.stray && typeof context.stray.start === 'function') {
    console.log('Calling stray.start manually');
    context.stray.start();
  }
} catch(e) { console.error('start error', e.message); console.error(e.stack); }
console.log('POST CALL CAPTURED URL:', capturedUrl);
console.log('POST CALL DATA:', JSON.stringify(capturedData, null, 2));

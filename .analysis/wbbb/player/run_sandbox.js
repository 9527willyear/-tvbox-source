const fs = require('fs');
const vm = require('vm');
const CryptoJS = require('crypto-js');

const code = fs.readFileSync('danmaya_deobf2.js', 'utf8');

let capturedUrl = null;
let capturedData = null;

const sandbox = {
  console: console,
  window: {
    location: {
      href: 'https://xn--qvr2v.850088.xyz/player/?url=js4vGyD11TvJ09uSsCpFYdrRmr0C33_MWIoK_J55bytFmXCBIpD2GluZx2DuqpO-srVX3NgTvrBNqVoKza-pIw&next=//wbbb1.com/vplay/112311-6-2.html&title=迷墙',
      protocol: 'https:',
      hostname: 'xn--qvr2v.850088.xyz',
      host: 'xn--qvr2v.850088.xyz',
      pathname: '/player/',
      search: '?url=js4vGyD11TvJ09uSsCpFYdrRmr0C33_MWIoK_J55bytFmXCBIpD2GluZx2DuqpO-srVX3NgTvrBNqVoKza-pIw&next=//wbbb1.com/vplay/112311-6-2.html&title=迷墙',
      hash: ''
    },
    addEventListener: function(){},
    setInterval: function(){},
    setTimeout: function(fn){ if(typeof fn==='function') fn(); },
    document: { title: '迷墙' }
  },
  document: {
    title: '迷墙',
    addEventListener: function(){},
    getElementById: function(){ return {}; },
    querySelector: function(){ return null; },
    querySelectorAll: function(){ return []; },
    createElement: function(){ return {}; }
  },
  localStorage: {
    getItem: function(){ return null; },
    setItem: function(){}
  },
  $: {
    ajax: function(url, options) {
      capturedUrl = url;
      capturedData = options && options.data;
      console.log('AJAX URL:', url);
      console.log('AJAX DATA:', JSON.stringify(options && options.data, null, 2));
      if (options && typeof options.success === 'function') {
        // don't call success because we don't have response
      }
      return { fail: function(){} };
    },
    getJSON: function(){},
    cookie: function(){},
    fn: {}
  },
  CryptoJS: CryptoJS,
  btoa: function(s){ return Buffer.from(s,'binary').toString('base64'); },
  atob: function(s){ return Buffer.from(s,'base64').toString('binary'); },
  URL: URL,
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
  setInterval: function(){},
  setTimeout: function(fn){ if(typeof fn==='function') fn(); },
  clearInterval: function(){},
  clearTimeout: function(){}
};
sandbox.window.window = sandbox.window;

const context = vm.createContext(sandbox);
try {
  vm.runInContext(code, context, { timeout: 5000 });
} catch (e) {
  console.error('Execution error:', e.message);
}

console.log('CAPTURED URL:', capturedUrl);
console.log('CAPTURED DATA:', JSON.stringify(capturedData, null, 2));

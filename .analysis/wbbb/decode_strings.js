const CryptoJS = require('crypto-js');
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('C:/Users/qwl/tvbox-source/.analysis/wbbb/player/danmaya.js', 'utf8') +
  `; [_0x3963(0x8cb,"w2LU"),_0x3963(0xc7d,"bAVV"),_0x3963(0x4ad,"0Iy^"),_0x3963(0x22e,"Hnk4"),_0x3963(0xeb8,"yEhv"),_0x3963(0xbc4,"yxt("),_0x3963(0x560,"LcUP"),_0x3963(0x7b3,"4p@R"),_0x3963(0x953,"Hnk4"),_0x3963(0xb13,"w6vC"),_0x3963(0x5a5,"tVMK"),_0x3963(0x5d0,"0Iy^"),_0x3963(0xc17,"jLW!")]`;
const ctx = {
  window: {
    location: { href: 'https://x/player/?url=a&next=b&title=c', search: '?url=a&next=b&title=c', protocol: 'https:', host: 'x', hostname: 'x', port: '', pathname: '/player/', origin: 'https://x' },
    document: { title: 't', domain: 'x', addEventListener() {} },
    navigator: { userAgent: 'm', platform: 'Win32' },
    addEventListener() {},
    localStorage: { getItem() {}, setItem() {} },
    parent: null, top: null,
  },
  document: { title: 't', domain: 'x', addEventListener() {} },
  localStorage: { getItem() {}, setItem() {} },
  navigator: { userAgent: 'm' },
  CryptoJS,
  $: (sel) => ({ html() {}, text() {}, attr() {}, get() { return {}; } }),
  btoa, atob, URL, URLSearchParams, Math, Date, JSON, console, encodeURIComponent, decodeURIComponent,
};
ctx.window.self = ctx.window; ctx.window.parent = ctx.window; ctx.window.top = ctx.window;
vm.createContext(ctx);
console.log(vm.runInContext(code, ctx, { timeout: 30000 }));

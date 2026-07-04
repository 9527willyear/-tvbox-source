const fs = require('fs');
const js = fs.readFileSync('danmaya.js', 'utf8');

function extractFunction(name) {
  const start = js.indexOf('function ' + name);
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let strChar = '';
  let escaped = false;
  let i = start;
  while (i < js.length && js[i] !== '{') i++;
  for (; i < js.length; i++) {
    const c = js[i];
    if (escaped) { escaped = false; continue; }
    if (c === '\\') { escaped = true; continue; }
    if (inString) {
      if (c === strChar) inString = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inString = true; strChar = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  return js.substring(start, i);
}

const f4878 = extractFunction('_0x4878');
const f3963 = extractFunction('_0x3963');
console.log('4878 len', f4878 ? f4878.length : 0);
console.log('3963 len', f3963 ? f3963.length : 0);
fs.writeFileSync('decoder_func.js', f3963 || '');
fs.writeFileSync('string_table_func.js', f4878 || '');

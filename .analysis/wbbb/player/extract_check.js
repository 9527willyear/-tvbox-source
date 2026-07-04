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

const fcheck = extractFunction('checkVideoDomain');
console.log('check len', fcheck ? fcheck.length : 0);
fs.writeFileSync('check_func.js', fcheck || '');

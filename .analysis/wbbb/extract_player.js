const fs = require('fs');
const html = fs.readFileSync('play_live.html', 'utf8');
const m = html.match(/var player_aaaa=(\{[\s\S]*?\});/);
if (m) {
  console.log(m[1]);
} else {
  console.log('no match');
}

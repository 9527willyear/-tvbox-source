const https = require('https');
const { URL } = require('url');
const cheerio = require('cheerio');

function request(u) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(u);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://dmyh01.cc/'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return request(new URL(res.headers.location, u).href).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('timeout')));
    req.end();
  });
}

function load(html) { return cheerio.load(html); }

(async () => {
  try {
    // Test category
    console.log('=== Category ===');
    const catHtml = await request('https://dmyh01.cc/fenlei/riben.html');
    const catDoc = load(catHtml);
    const items = catDoc('.a-con-inner');
    console.log('Items:', items.length);
    if (items.length > 0) {
      const first = items.first();
      console.log('Title:', first.find('.s1 a').text().trim());
      console.log('Pic:', first.find('.pic img').attr('data-src'));
      console.log('URL:', new URL(first.find('.s1 a').attr('href'), 'https://dmyh01.cc/fenlei/riben.html').href);
      console.log('Desc:', first.find('.s4').text().trim());
    }

    // Test detail
    console.log('\n=== Detail ===');
    const detailHtml = await request('https://dmyh01.cc/yh/8735.html');
    const detailDoc = load(detailHtml);
    console.log('Title:', detailDoc('h1.tit').text().trim());
    console.log('Pic:', detailDoc('.info .pic img').attr('data-src'));
    console.log('Play URL:', new URL(detailDoc('.play a').attr('href'), 'https://dmyh01.cc/yh/8735.html').href);

    // Test play
    console.log('\n=== Play ===');
    const playUrl = new URL(detailDoc('.play a').attr('href'), 'https://dmyh01.cc/yh/8735.html').href;
    const playHtml = await request(playUrl);
    const playDoc = load(playHtml);
    const eps = playDoc('.jisu a');
    console.log('Episodes:', eps.length);
    eps.each((i, el) => {
      const elObj = playDoc(el);
      console.log(elObj.text().trim(), '=>', new URL(elObj.attr('href'), playUrl).href);
    });

    // Extract player_aaaa
    const idx = playHtml.indexOf('var player_aaaa=');
    const start = idx + 'var player_aaaa='.length;
    let depth = 0, end = -1;
    for (let i = start; i < playHtml.length; i++) {
      if (playHtml[i] === '{') depth++;
      else if (playHtml[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    const player = JSON.parse(playHtml.substring(start, end));
    console.log('\nM3U8:', player.url);
  } catch (e) {
    console.error('Error:', e);
  }
})();

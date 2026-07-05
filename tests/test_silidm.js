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
        'Referer': 'https://silidm.com/'
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

(async () => {
  try {
    // Test category
    console.log('=== Category ===');
    const catHtml = await request('https://silidm.com/type/dy.html');
    const catDoc = cheerio.load(catHtml);
    const items = catDoc('.module-item');
    console.log('Items:', items.length);
    if (items.length > 0) {
      const first = items.first();
      console.log('Title:', first.find('.module-item-title').text().trim());
      console.log('Pic:', first.find('.module-item-pic img').attr('data-src'));
      console.log('URL:', new URL(first.find('.module-item-title').attr('href'), 'https://silidm.com/type/dy.html').href);
      console.log('Desc:', first.find('.module-item-text').text().trim());
    }

    // Test detail
    console.log('\n=== Detail ===');
    const detailHtml = await request('https://silidm.com/video/40673.html');
    const detailDoc = cheerio.load(detailHtml);
    console.log('Title:', detailDoc('h1').text().trim());
    console.log('Pic:', detailDoc('.module-item-pic img').attr('data-src'));
    const tabs = detailDoc('.play-source-tab').map((i, el) => detailDoc(el).text().trim()).get();
    console.log('Tabs:', tabs);
    const contents = detailDoc('.play-source-content');
    contents.each((i, el) => {
      const content = detailDoc(el);
      const links = content.find('a');
      console.log(`Content ${i}: ${links.length} episodes`);
      if (links.length > 0) {
        const first = links.first();
        console.log('  First:', first.text().trim(), '=>', new URL(first.attr('href'), 'https://silidm.com/video/40673.html').href);
      }
    });

    // Test play
    console.log('\n=== Play ===');
    const playUrl = 'https://silidm.com/play/40673-1-1.html';
    const playHtml = await request(playUrl);
    const idx = playHtml.indexOf('var player_aaaa=');
    const start = idx + 'var player_aaaa='.length;
    let depth = 0, end = -1;
    for (let i = start; i < playHtml.length; i++) {
      if (playHtml[i] === '{') depth++;
      else if (playHtml[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    const player = JSON.parse(playHtml.substring(start, end));
    console.log('M3U8:', player.url);

    // Test search API
    console.log('\n=== Search API ===');
    const searchHtml = await request('https://silidm.com/index.php/ajax/suggest?mid=1&wd=%E7%81%AB%E5%BD%B1&limit=20');
    const searchJson = JSON.parse(searchHtml);
    console.log('Search items:', searchJson.list ? searchJson.list.length : 0);
    if (searchJson.list && searchJson.list.length > 0) {
      const first = searchJson.list[0];
      console.log('Title:', first.name);
      console.log('URL:', 'https://silidm.com/video/' + first.id + '.html');
      console.log('Pic:', first.pic);
    }
  } catch (e) {
    console.error('Error:', e);
  }
})();

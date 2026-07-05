const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const HOST = 'http://www.laodedy.com';
const CATEGORIES = [
    { name: '电影', id: 'dianying' },
    { name: '电视剧', id: 'dianshiju' },
    { name: '动漫', id: 'dongman' },
    { name: '综艺', id: 'zongyi' },
    { name: '短剧', id: 'duanju' },
    { name: '日韩动漫', id: 'rihandongman' }
];
const PAGE_LIMIT = 1; // 每个分类爬几页
const ITEMS_PER_PAGE = 24; // 每页只取前 N 部
const CONCURRENCY = 5;

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': HOST + '/'
};

async function fetchHtml(url) {
    try {
        const res = await axios.get(url, { headers, timeout: 20000, responseType: 'text' });
        return res.data;
    } catch (e) {
        console.error('fetch error:', url, e.message);
        return '';
    }
}

function parseList(html) {
    const $ = cheerio.load(html);
    const items = [];
    $('li.p1').each((i, el) => {
        const a = $(el).find('a').first();
        const title = a.attr('title') || $(el).find('.name').text().trim();
        let pic = a.find('img').attr('data-original') || a.find('img').attr('src') || '';
        if (pic && !pic.startsWith('http')) pic = HOST + pic;
        const href = a.attr('href') || '';
        const desc = $(el).find('.other').text().trim();
        if (title && href) {
            items.push({ title, pic, href, desc });
        }
    });
    return items;
}

async function parseDetail(detailUrl) {
    const html = await fetchHtml(detailUrl);
    if (!html) return null;
    const $ = cheerio.load(html);
    const vod_name = $('h1').text().split('»').pop().trim() || $('.ct-c .name').text().split(/\s|更新/)[0].trim();
    let vod_pic = $('.ct-l img').attr('data-original') || $('.ct-l img').attr('src') || '';
    if (vod_pic && !vod_pic.startsWith('http')) vod_pic = HOST + vod_pic;
    const vod_remarks = $('.ct-c .name .bz').text() || $('.other').first().text() || '';
    const vod_actor = $('.ct-c dt:contains(主演)').text() || '';
    const vod_director = $('.ct-c dt:contains(导演)').text() || '';
    const vod_content = $('.ee p').text() || '';

    const fromTabs = $('.playfrom li').map((i, el) => $(el).text().trim()).get().filter(t => t);
    if (fromTabs.length === 0) fromTabs.push('播放');

    const panes = $('.playlist');
    const playFrom = [];
    const playUrl = [];

    panes.each((idx, pane) => {
        const from = fromTabs[idx] || fromTabs[0] || '播放';
        const episodes = [];
        $(pane).find('.videourl a').each((i, a) => {
            const name = $(a).text().trim() || $(a).attr('title');
            const u = $(a).attr('href') || '';
            if (name && u) episodes.push(name + '$' + u);
        });
        if (episodes.length) {
            playFrom.push(from);
            playUrl.push(episodes.join('#'));
        }
    });

    return {
        vod_name,
        vod_pic,
        vod_remarks,
        vod_actor,
        vod_director,
        vod_content,
        vod_play_from: playFrom.join('$$$'),
        vod_play_url: playUrl.join('$$$')
    };
}

async function resolveEpisode(episodeUrl) {
    let url = episodeUrl;
    if (!url.startsWith('http')) url = HOST + url;
    const html = await fetchHtml(url);
    if (!html) return null;
    const m = html.match(/var now="([^"]+)"/);
    return m && m[1] && m[1].startsWith('http') ? m[1] : null;
}

async function scrapeCategory(cat, page) {
    let url = `${HOST}/category/${cat.id}.html`;
    if (page > 1) url = `${HOST}/category/${cat.id}_${page}.html`;
    console.log(`scraping ${cat.name} page ${page}: ${url}`);
    const html = await fetchHtml(url);
    let list = parseList(html);
    list = list.slice(0, ITEMS_PER_PAGE);
    console.log(`  found ${list.length} items (limited to ${ITEMS_PER_PAGE})`);

    const results = [];
    for (const item of list) {
        const detailUrl = item.href.startsWith('http') ? item.href : HOST + item.href;
        const detail = await parseDetail(detailUrl);
        if (!detail) continue;

        // resolve first episode for playback
        const firstEpUrl = detail.vod_play_url.split('$$$')[0]?.split('#')[0]?.split('$')[1];
        if (firstEpUrl) {
            const m3u8 = await resolveEpisode(firstEpUrl);
            if (m3u8) {
                detail.vod_play_url = detail.vod_play_url.replace(firstEpUrl, m3u8);
            }
        }

        results.push({
            vod_id: detailUrl,
            vod_name: detail.vod_name || item.title,
            vod_pic: detail.vod_pic || item.pic,
            vod_remarks: detail.vod_remarks || item.desc,
            vod_actor: detail.vod_actor,
            vod_director: detail.vod_director,
            vod_content: detail.vod_content,
            vod_play_from: detail.vod_play_from,
            vod_play_url: detail.vod_play_url,
            type_name: cat.name
        });
    }
    return results;
}

async function main() {
    const data = { list: [], categories: CATEGORIES.map(c => c.name) };
    for (const cat of CATEGORIES) {
        for (let page = 1; page <= PAGE_LIMIT; page++) {
            const items = await scrapeCategory(cat, page);
            data.list.push(...items);
        }
    }

    fs.writeFileSync('./laodedy_static.json', JSON.stringify(data, null, 2));
    console.log(`\nDone. Total items: ${data.list.length}`);
}

main().catch(console.error);

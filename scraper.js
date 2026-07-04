const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const pLimit = require('p-limit').default || require('p-limit');

const BASE_URL = 'https://anime.xifanacg.com';
const CATEGORIES = [
  { id: 1, name: '连载新番' },
  { id: 2, name: '完结旧番' },
  { id: 3, name: '剧场版' },
  { id: 21, name: '美漫' },
];

const MAX_PAGES_PER_CATEGORY = parseInt(process.env.MAX_PAGES || '2', 10);
const DETAIL_CONCURRENCY = parseInt(process.env.DETAIL_CONCURRENCY || '8', 10);
const WATCH_CONCURRENCY = parseInt(process.env.WATCH_CONCURRENCY || '12', 10);
const REQUEST_DELAY_MS = parseInt(process.env.DELAY || '150', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const detailLimit = pLimit(DETAIL_CONCURRENCY);
const watchLimit = pLimit(WATCH_CONCURRENCY);

async function fetchHtml(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9',
        },
      });
      return res.data;
    } catch (err) {
      if (i === retries) {
        console.error(`[ERROR] fetch ${url}: ${err.message}`);
        return null;
      }
      await sleep(1000 * (i + 1));
    }
  }
  return null;
}

function parseBangumiList(html) {
  const $ = cheerio.load(html);
  const items = [];
  $('a[href^="/bangumi/"]').each((_, el) => {
    const href = $(el).attr('href');
    const title = $(el).attr('title')?.trim();
    if (!href || !title) return;
    const m = href.match(/\/bangumi\/(\d+)\.html/);
    if (!m) return;
    const id = parseInt(m[1], 10);
    if (items.some((i) => i.id === id)) return;
    items.push({ id, title, href: BASE_URL + href });
  });
  return items;
}

function parseDetail(html, bangumiId) {
  const $ = cheerio.load(html);
  const vod = {
    vod_id: bangumiId,
    vod_name: '',
    vod_pic: '',
    vod_remarks: '',
    vod_blurb: '',
    vod_content: '',
    vod_play_from: '',
    vod_play_url: '',
  };

  // 标题：h1 可能由 JS 渲染，回退到 h3.slide-info-title 或 title
  const titleFromTitle = $('title').text().split('_')[0]?.trim();
  vod.vod_name = $('h1').first().text().trim()
    || $('h3.slide-info-title').first().text().trim()
    || titleFromTitle
    || '';

  // 简介
  vod.vod_content = $('.desc').text().trim() || $('meta[name="description"]').attr('content') || '';
  vod.vod_blurb = vod.vod_content.slice(0, 120);

  // 封面：站点用的是 data-src 懒加载
  let pic = $('img.lazy[data-src]').first().attr('data-src')
    || $('img[data-src]').first().attr('data-src')
    || $('img[data-original]').first().attr('data-original')
    || $('img[alt]').first().attr('src');
  if (pic && pic.startsWith('//')) pic = 'https:' + pic;
  vod.vod_pic = pic || '';

  // 资源列表：来源名里包含 badge 数字，取第一个文本节点去掉尾部数字
  const cleanSourceName = (text) => {
    const m = text.match(/^(.+?)-?\d*$/);
    return m ? m[1].trim() : text.trim();
  };
  const sources = [];
  $('.anthology-tab .swiper-slide').each((idx, el) => {
    const raw = $(el).text().trim();
    const firstText = $(el).contents().filter(function () {
      return this.nodeType === 3;
    }).first().text().trim();
    const name = firstText || cleanSourceName(raw);
    sources[idx] = { name, episodes: [] };
  });

  $('.anthology-list .anthology-list-box').each((idx, box) => {
    const source = sources[idx];
    if (!source) return;
    $(box).find('a[href^="/watch/"]').each((_, a) => {
      const href = $(a).attr('href');
      const epName = $(a).text().trim();
      source.episodes.push({ name: epName, href: BASE_URL + href });
    });
  });

  return { vod, sources };
}

function decodeJsString(str) {
  // 把 JS 字符串里的 \uXXXX 解码成真实字符，并把 \/ 还原成 /
  return str
    .replace(/\\\//g, '/')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function parseWatch(html) {
  // 站点把 URL 写成 https:\/\/host\/path 这种转义形式，直接用宽松正则提取视频直链
  const re = /https?:[\\/]+[a-zA-Z0-9.%-_\\/]+\.(?:m3u8|mp4|mkv|flv)/gi;
  const found = [...html.matchAll(re)].map((m) => decodeJsString(m[0]));
  // 优先 m3u8，其次 mp4
  return found.find((u) => u.includes('.m3u8'))
    || found.find((u) => u.includes('.mp4'))
    || found[0]
    || null;
}

async function fetchEpisodeUrl(ep) {
  await sleep(Math.random() * REQUEST_DELAY_MS);
  const watchHtml = await fetchHtml(ep.href);
  const url = watchHtml ? parseWatch(watchHtml) : null;
  return { name: ep.name, url: url || ep.href };
}

function mapTvboxTypeId(catId) {
  // TVbox 标准分类：1电影 2电视剧 3综艺 4动漫 5纪录片
  // 我们的分类：1连载新番 2完结旧番 3剧场版 21美漫
  if (catId === 3) return 1; // 剧场版 -> 电影
  return 4; // 其他全部 -> 动漫
}

async function scrapeBangumi(item, category) {
  await sleep(Math.random() * REQUEST_DELAY_MS);
  const detailHtml = await fetchHtml(item.href);
  if (!detailHtml) return null;

  const { vod, sources } = parseDetail(detailHtml, item.id);
  if (!vod.vod_name) vod.vod_name = item.title;

  const playFromParts = [];
  const playUrlParts = [];
  let maxEpisodes = 0;

  for (const src of sources) {
    if (src.episodes.length === 0) continue;
    const epResults = await Promise.all(
      src.episodes.map((ep) => watchLimit(() => fetchEpisodeUrl(ep)))
    );
    playFromParts.push(src.name);
    playUrlParts.push(epResults.map((e) => `${e.name}$${e.url}`).join('#'));
    maxEpisodes = Math.max(maxEpisodes, src.episodes.length);
  }

  vod.vod_play_from = playFromParts.join('$$$');
  vod.vod_play_url = playUrlParts.join('$$$');

  // 没有解析出任何播放地址的，直接丢弃
  if (!vod.vod_play_url) return null;

  vod.vod_remarks = maxEpisodes > 0 ? `更新至${maxEpisodes}集` : '';
  vod.type_id = category.id; // 保留站点原始分类ID
  vod.type_name = category.name;
  vod.tvbox_type = mapTvboxTypeId(category.id); // TVbox标准分类
  vod.vod_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
  vod.vod_year = new Date().getFullYear().toString();
  vod.vod_area = '日本';

  return vod;
}

async function scrapeCategory(category) {
  console.log(`\n[分类] ${category.name} (type/${category.id})`);
  const allBangumi = [];

  for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
    const pageUrl = page === 1
      ? `${BASE_URL}/type/${category.id}.html`
      : `${BASE_URL}/type/${category.id}/page/${page}.html`;
    console.log(`  抓取列表页: ${pageUrl}`);
    const html = await fetchHtml(pageUrl);
    if (!html) continue;

    const items = parseBangumiList(html);
    if (items.length === 0) {
      console.log('  本页无数据，结束该分类');
      break;
    }
    console.log(`  本页找到 ${items.length} 部`);
    allBangumi.push(...items);
    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`  开始并发抓取 ${allBangumi.length} 部详情与播放地址...`);
  const results = await Promise.all(
    allBangumi.map((item) =>
      detailLimit(() => scrapeBangumi(item, category))
    )
  );

  return results.filter(Boolean);
}

async function main() {
  const outputFile = process.env.OUTPUT || path.join(__dirname, 'tvbox.json');
  const allVods = [];

  for (const cat of CATEGORIES) {
    const vods = await scrapeCategory(cat);
    allVods.push(...vods);
  }

  const apiResponse = {
    code: 1,
    msg: '数据列表',
    page: 1,
    pagecount: 1,
    limit: String(allVods.length),
    total: allVods.length,
    list: allVods,
  };

  fs.writeFileSync(outputFile, JSON.stringify(apiResponse, null, 2), 'utf-8');
  console.log(`\n[完成] 共抓取 ${allVods.length} 部番剧，输出: ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

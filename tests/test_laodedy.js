const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');

// 模拟 drpy2 的 pdfa / pdfh / pd / request
function parseSelector(sel) {
    // 简单处理 drpy2 选择器: a&&title, img&&data-original, .name&&Text
    const m = sel.match(/^(.+?)&&(.+)$/);
    if (!m) return { css: sel, attr: null, text: false };
    const css = m[1].trim();
    const tail = m[2].trim();
    if (tail === 'Text') return { css, attr: null, text: true };
    return { css, attr: tail, text: false };
}

function pdfa(html, sel) {
    const $ = typeof html === 'string' ? cheerio.load(html) : cheerio(html);
    const arr = [];
    $(sel).each((i, el) => arr.push($.html(el)));
    return arr;
}

function pdfh(html, sel) {
    const $ = typeof html === 'string' ? cheerio.load(html) : cheerio(html);
    const p = parseSelector(sel);
    const el = $(p.css).first();
    if (p.text) return el.text().trim();
    if (p.attr) return el.attr(p.attr) || '';
    return el.text().trim();
}

function pd(html, sel, baseUrl) {
    const $ = typeof html === 'string' ? cheerio.load(html) : cheerio(html);
    const p = parseSelector(sel);
    const el = $(p.css).first();
    let val = '';
    if (p.text) val = el.text().trim();
    else val = el.attr(p.attr) || '';
    if (val && val.indexOf('http') !== 0 && baseUrl) {
        const base = new URL(baseUrl);
        if (val.startsWith('/')) val = base.origin + val;
        else val = base.origin + '/' + val;
    }
    return val;
}

async function request(url, opts) {
    try {
        const res = await axios.get(url, {
            headers: opts && opts.headers || {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000,
            responseType: 'text'
        });
        return res.data;
    } catch (e) {
        console.error('request error', url, e.message);
        return '';
    }
}

// 加载规则
const ruleSrc = fs.readFileSync('./laodedy.js', 'utf-8');
eval(ruleSrc);

async function test() {
    // 模拟 TVBox 输入
    const homeUrl = rule.host + rule.homeUrl;
    const cateUrl = rule.host + '/category/dianying_1.html';
    const searchUrl = rule.host + '/search.php?searchword=爱情&page=1';
    const detailUrl = rule.host + '/show/116753.html';
    const playUrl = rule.host + '/play/116753-0-0.html';

    console.log('--- 推荐/一级 test ---');
    let input = homeUrl;
    let d = [];
    let html = await request(input);
    console.log('html len', html.length);
    pdfa(html, 'li.p1').forEach((it) => {
        let title = pdfh(it, 'a&&title') || pdfh(it, '.name&&Text');
        if (!title) return;
        d.push({
            title: title,
            pic_url: pd(it, 'img&&data-original', input) || pd(it, 'img&&src', input),
            desc: pdfh(it, '.other&&Text') || '',
            url: pd(it, 'a&&href', input)
        });
    });
    console.log('推荐/一级 结果数:', d.length);
    console.log('第一条:', d[0]);

    console.log('\n--- 搜索 test ---');
    input = searchUrl;
    d = [];
    html = await request(input);
    pdfa(html, 'li.p1').forEach((it) => {
        let title = pdfh(it, 'a&&title') || pdfh(it, '.name&&Text');
        if (!title) return;
        d.push({
            title: title,
            pic_url: pd(it, 'img&&data-original', input) || pd(it, 'img&&src', input),
            desc: pdfh(it, '.other&&Text') || '',
            url: pd(it, 'a&&href', input)
        });
    });
    console.log('搜索 结果数:', d.length);
    console.log('第一条:', d[0]);

    console.log('\n--- 二级 test ---');
    input = detailUrl;
    html = await request(input);
    let VOD = {};
    VOD.vod_id = input;
    VOD.vod_name = pdfh(html, 'h1&&Text').split('»').pop().trim() || pdfh(html, '.ct-c .name&&Text').split(/\s|更新/)[0];
    VOD.vod_pic = pd(html, '.ct-l img&&data-original', input) || pd(html, '.ct-l img&&src', input);
    VOD.vod_remarks = pdfh(html, '.ct-c .name .bz&&Text') || pdfh(html, '.other&&Text') || '';
    VOD.vod_actor = pdfh(html, '.ct-c dt:contains(主演)&&Text') || '';
    VOD.vod_director = pdfh(html, '.ct-c dt:contains(导演)&&Text') || '';
    VOD.vod_content = pdfh(html, '.ee p&&Text') || '';

    let fromTabs = pdfa(html, '.playfrom li').map(it => pdfh(it, 'li&&Text').trim()).filter(t => t);
    let panes = pdfa(html, '.playlist');
    if (fromTabs.length === 0) fromTabs = ['播放'];
    VOD.vod_play_from = fromTabs.join('$$$');

    let lists = [];
    panes.forEach((pane, idx) => {
        let episodes = pdfa(pane, '.videourl a').map(a => {
            let name = pdfh(a, 'a&&Text') || pdfh(a, 'a&&title');
            let u = pd(a, 'a&&href', input);
            return name + '$' + u;
        });
        lists.push(episodes.join('#'));
    });
    VOD.vod_play_url = lists.join('$$$');
    console.log('VOD:', JSON.stringify(VOD, null, 2));

    console.log('\n--- lazy test ---');
    input = playUrl;
    let url = input;
    if (url.indexOf('http') !== 0) url = rule.host + url;
    html = await request(url);
    let m = html.match(/var now="([^"]+)"/);
    console.log('lazy match:', m ? m[1] : 'no match');
}

test().catch(console.error);

var rule = {
    title: '爱卡电影',
    host: 'https://www.aikady.com',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.aikady.com/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/',
    url: '/search.php?searchtype=5&order=time&tid=fyclass&page=fypage',
    searchUrl: '/search.php',
    searchable: 1,
    quickSearch: 0,
    filterable: 0,
    limit: 24,
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    class_name: '电影&电视剧&动漫&综艺&短剧',
    class_url: '1&2&3&4&25',
    推荐: `js:
        let html = request(input, { headers: rule.headers });
        let d = [];
        pdfa(html, '.stui-vodlist__item').forEach((it) => {
            let title = pdfh(it, 'h4 a&&title') || pdfh(it, 'h4 a&&Text');
            if (!title) return;
            let pic = pd(it, 'a&&data-original', input);
            let url = pd(it, 'a&&href', input);
            let desc = pdfh(it, '.pic-text&&Text') || '';
            d.push({ title: title, pic_url: pic, desc: desc, url: url });
        });
        setResult(d);
    `,
    一级: `js:
        let html = request(input, { headers: rule.headers });
        let d = [];
        pdfa(html, '.stui-vodlist__item').forEach((it) => {
            let title = pdfh(it, 'h4 a&&title') || pdfh(it, 'h4 a&&Text');
            if (!title) return;
            let pic = pd(it, 'a&&data-original', input);
            let url = pd(it, 'a&&href', input);
            let desc = pdfh(it, '.pic-text&&Text') || '';
            d.push({ title: title, pic_url: pic, desc: desc, url: url });
        });
        setResult(d);
    `,
    二级: `js:
        let html = request(input, { headers: rule.headers });
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h1.title&&Text').replace(/\s*\d+\.\d+\s*$/, '').trim();
        VOD.vod_pic = pd(html, '.stui-content__thumb img&&data-original', input);
        VOD.vod_remarks = pdfh(html, '.stui-content__detail .score&&Text') || '';
        VOD.vod_year = pdfh(html, '.stui-content__detail a[href*="year="]&&Text') || '';
        VOD.vod_area = pdfh(html, '.stui-content__detail a[href*="area="]&&Text') || '';
        VOD.vod_content = pdfh(html, '.stui-content__desc&&Text') || '';

        let tabs = ['播放'];
        let lists = [];
        let episodes = pdfa(html, '.stui-content__playlist a[href*="/play/"]').map(a => {
            let name = pdfh(a, 'a&&Text') || pdfh(a, 'a&&title');
            let u = pd(a, 'a&&href', input);
            return name + '$' + u;
        });
        lists.push(episodes.join('#'));
        VOD.vod_play_from = tabs.join('$$$');
        VOD.vod_play_url = lists.join('$$$');
    `,
    搜索: `js:
        let html = request(input, {
            headers: rule.headers,
            method: 'POST',
            body: 'searchword=' + encodeURIComponent(KEY)
        });
        let d = [];
        pdfa(html, '.stui-vodlist__item').forEach((it) => {
            let title = pdfh(it, 'h4 a&&title') || pdfh(it, 'h4 a&&Text');
            if (!title) return;
            let pic = pd(it, 'a&&data-original', input);
            let url = pd(it, 'a&&href', input);
            let desc = pdfh(it, '.pic-text&&Text') || '';
            d.push({ title: title, pic_url: pic, desc: desc, url: url });
        });
        setResult(d);
    `,
    lazy: `js:
        let url = input;
        if (url.indexOf('http') !== 0) url = rule.host + url;
        let html = request(url, { headers: rule.headers });
        let m = html.match(/var now="(https?:\/\/[^"]+)"/);
        if (m && m[1]) {
            input = { parse: 0, url: m[1], header: rule.headers };
        } else {
            input = { parse: 1, url: url };
        }
    `
}

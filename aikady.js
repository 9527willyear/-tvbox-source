var rule = {
    author: 'kimi',
    title: '爱卡电影',
    类型: '影视',
    host: 'https://www.aikady.com',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.aikady.com/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/',
    url: '/search.php?searchtype=5&order=time&tid=fyclass&page=fypage',
    searchUrl: '/search.php?searchword=***',
    searchable: 1,
    quickSearch: 0,
    filterable: 0,
    limit: 24,
    double: false,
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    class_name: '电影&电视剧&动漫&综艺&短剧',
    class_url: '1&2&3&4&25',
    推荐: `js:
        let d = [];
        try {
            let html = request(input);
            let items = pdfa(html, '.stui-vodlist__item');
            items.forEach(it => {
                let title = pdfh(it, 'h4 a&&title') || pdfh(it, 'h4 a&&Text');
                if (!title) return;
                let pic = pd(it, 'a&&data-original', input);
                let url = pd(it, 'a&&href', input);
                let desc = pdfh(it, '.pic-text&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
    一级: `js:
        let d = [];
        try {
            if (input.indexOf('tid=3') >= 0) {
                input = input.replace('order=time', 'order=hit');
            }
            let html = request(input);
            let items = pdfa(html, '.stui-vodlist__item');
            items.forEach(it => {
                let title = pdfh(it, 'h4 a&&title') || pdfh(it, 'h4 a&&Text');
                if (!title) return;
                let pic = pd(it, 'a&&data-original', input);
                let url = pd(it, 'a&&href', input);
                let desc = pdfh(it, '.pic-text&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
    二级: `js:
        try {
            let html = request(input);
            VOD = {};
            VOD.vod_id = input;
            VOD.vod_name = pdfh(html, 'h1.title&&Text').replace(/\\s*\\d+\\.\\d+\\s*$/, '').trim();
            VOD.vod_pic = pd(html, '.stui-content__thumb img&&data-original', input);
            VOD.vod_remarks = pdfh(html, '.score&&Text') || '';
            VOD.vod_year = pdfh(html, 'a[href*="year="]&&Text') || '';
            VOD.vod_area = pdfh(html, 'a[href*="area="]&&Text') || '';
            VOD.vod_content = pdfh(html, '.stui-content__desc&&Text') || '';
            let episodes = pdfa(html, '.stui-content__playlist a[href*="/play/"]').map(a => {
                let name = pdfh(a, 'a&&Text') || pdfh(a, 'a&&title');
                let url = pd(a, 'a&&href', input);
                return name + '$' + url;
            });
            VOD.vod_play_from = '播放';
            VOD.vod_play_url = episodes.join('#');
        } catch (e) {
            VOD = { vod_id: input, vod_name: '解析出错', vod_content: String(e.message || e) };
        }
    `,
    搜索: `js:
        let d = [];
        try {
            let html = request(input);
            let items = pdfa(html, '.stui-vodlist__item');
            items.forEach(it => {
                let title = pdfh(it, 'h4 a&&title') || pdfh(it, 'h4 a&&Text');
                if (!title) return;
                let pic = pd(it, 'a&&data-original', input);
                let url = pd(it, 'a&&href', input);
                let desc = pdfh(it, '.pic-text&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
    lazy: `js:
        let realUrl = '';
        try {
            let playHtml = request(input);
            if (playHtml) {
                let m = playHtml.match(/var now="(https?:\\/\\/[^"]+)"/);
                if (m && m[1]) {
                    realUrl = m[1];
                }
                if (!realUrl) {
                    let m2 = playHtml.match(/https?:\\/\\/[^"'\\s]+\\.(m3u8|mp4)/i);
                    if (m2) realUrl = m2[0];
                }
            }
        } catch (e) {}
        if (realUrl && /^https?:\\/\\//i.test(realUrl)) {
            input = { parse: 0, url: realUrl, header: { 'User-Agent': rule.headers['User-Agent'], 'Referer': rule.host + '/' } };
        } else {
            input = { parse: 1, url: input };
        }
    `
}

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
    url: '/search.php?searchtype=5&order=hit&tid=fyclass&page=fypage',
    filter_url: '/search.php?searchtype=5&order=hit&tid=fyclass&page=fypage&***',
    searchUrl: '/search.php?searchword=***',
    searchable: 1,
    quickSearch: 0,
    filterable: 1,
    filter: {
        "地区": [
            { "name": "全部", "value": "" },
            { "name": "大陆", "value": "area=%E5%A4%A7%E9%99%86" },
            { "name": "香港", "value": "area=%E9%A6%99%E6%B8%AF" },
            { "name": "台湾", "value": "area=%E5%8F%B0%E6%B9%BE" },
            { "name": "日本", "value": "area=%E6%97%A5%E6%9C%AC" },
            { "name": "韩国", "value": "area=%E9%9F%A9%E5%9B%BD" },
            { "name": "美国", "value": "area=%E7%BE%8E%E5%9B%BD" },
            { "name": "英国", "value": "area=%E8%8B%B1%E5%9B%BD" },
            { "name": "法国", "value": "area=%E6%B3%95%E5%9B%BD" },
            { "name": "德国", "value": "area=%E5%BE%B7%E5%9B%BD" },
            { "name": "泰国", "value": "area=%E6%B3%B0%E5%9B%BD" },
            { "name": "印度", "value": "area=%E5%8D%B0%E5%BA%A6" },
            { "name": "俄罗斯", "value": "area=%E4%BF%84%E7%BD%97%E6%96%AF" },
            { "name": "意大利", "value": "area=%E6%84%8F%E5%A4%A7%E5%88%A9" },
            { "name": "澳大利亚", "value": "area=%E6%BE%B3%E5%A4%A7%E5%88%A9%E4%BA%9A" },
            { "name": "加拿大", "value": "area=%E5%8A%A0%E6%8B%BF%E5%A4%A7" },
            { "name": "西班牙", "value": "area=%E8%A5%BF%E7%8F%AD%E7%89%99" },
            { "name": "土耳其", "value": "area=%E5%9C%9F%E8%80%B3%E5%85%B6" },
            { "name": "其他", "value": "area=%E5%85%B6%E4%BB%96" }
        ],
        "年份": [
            { "name": "全部", "value": "" },
            { "name": "2026", "value": "year=2026" },
            { "name": "2025", "value": "year=2025" },
            { "name": "2024", "value": "year=2024" },
            { "name": "2023", "value": "year=2023" },
            { "name": "2022", "value": "year=2022" },
            { "name": "2021", "value": "year=2021" },
            { "name": "2020", "value": "year=2020" },
            { "name": "2019", "value": "year=2019" },
            { "name": "2018", "value": "year=2018" },
            { "name": "2017", "value": "year=2017" },
            { "name": "2016", "value": "year=2016" },
            { "name": "2015", "value": "year=2015" }
        ]
    },
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

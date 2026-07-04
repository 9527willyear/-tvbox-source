var rule = {
    author: 'kimi',
    title: '歪比测试',
    类型: '影视',
    host: 'https://wbbb1.com',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://wbbb1.com/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/type/1.html',
    url: '/type/fyclass.html',
    searchUrl: '/search/**-------------.html',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    limit: 24,
    double: false,
    class_name: '电影&剧集&动漫&综艺',
    class_url: '1&2&3&4',
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    lazy: `js:
        input = { parse: 1, url: input };
    `,
    推荐: `js:
        let d = [];
        try {
            let url = input;
            let html = request(url);
            let items = pdfa(html, '.module-items .module-poster-item');
            items.forEach(it => {
                let title = pdfh(it, '.module-poster-item-title&&Text') || pdfh(it, 'a&&title');
                if (!title) return;
                let pic = pd(it, '.module-item-pic img&&data-original', url);
                let detailUrl = pd(it, 'a&&href', url);
                let desc = pdfh(it, '.module-item-note&&Text');
                d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
            });
        } catch (e) {}
        setResult(d);
    `,
    一级: `js:
        let d = [];
        try {
            let url = input;
            let html = request(url);
            let items = pdfa(html, '.module-items .module-poster-item');
            items.forEach(it => {
                let title = pdfh(it, '.module-poster-item-title&&Text') || pdfh(it, 'a&&title');
                if (!title) return;
                let pic = pd(it, '.module-item-pic img&&data-original', url);
                let detailUrl = pd(it, 'a&&href', url);
                let desc = pdfh(it, '.module-item-note&&Text');
                d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
            });
        } catch (e) {}
        setResult(d);
    `,
    二级: `js:
        VOD = {
            vod_id: input,
            vod_name: '测试影片',
            vod_pic: '',
            vod_remarks: '测试',
            vod_year: '2026',
            vod_area: '大陆',
            vod_actor: '测试演员',
            vod_director: '测试导演',
            vod_content: '【调试：二级已执行，input=' + input + '】这是测试数据，如果能看到这段文字，说明 wbbb.js 文件已被 TVBox 加载。',
            vod_play_from: '测试线路',
            vod_play_url: '第1集$https://wbbb1.com/vplay/112311-6-1.html#第2集$https://wbbb1.com/vplay/112311-6-2.html#第3集$https://wbbb1.com/vplay/112311-6-3.html'
        };
    `,
    搜索: `js:
        let d = [];
        try {
            let url = input;
            let html = request(url);
            let items = pdfa(html, '.module-items .module-poster-item');
            items.forEach(it => {
                let title = pdfh(it, '.module-poster-item-title&&Text') || pdfh(it, 'a&&title');
                if (!title) return;
                let pic = pd(it, '.module-item-pic img&&data-original', url);
                let detailUrl = pd(it, 'a&&href', url);
                let desc = pdfh(it, '.module-item-note&&Text');
                d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
            });
        } catch (e) {}
        setResult(d);
    `,
}

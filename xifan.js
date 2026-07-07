var rule = {
    author: 'kimi',
    title: '稀饭动漫',
    类型: '动漫',
    host: 'https://anime.xifanacg.com',
    hostJs: ``,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/index.php/ajax/data?mid=1&tid=1&page=1&limit=20',
    url: '/index.php/ajax/data?mid=1&tid=fyfilter&page=fypage&limit=20',
    searchUrl: '/index.php/ajax/suggest?mid=1&wd=**&page=fypage&limit=20',
    searchable: 2,
    quickSearch: 1,
    filterable: 1,
    limit: 20,
    double: false,
    class_name: '连载新番&完结旧番&剧场版&美漫',
    class_url: '1&2&3&4',
    filter_url: '{{fl.cateId}}',
    filter_def: {
        1: { cateId: '1' },
        2: { cateId: '2' },
        3: { cateId: '3' },
        4: { cateId: '21' }
    },
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    lazy: `js:
        let html = request(input);
        let m = html.match(/https?:[\\\\/]+[a-zA-Z0-9.%-_\\\\/]+\\.(?:m3u8|mp4|flv|mkv|mov|ts)/gi);
        if (m && m.length > 0) {
            let url = m[0].replace(/\\\\/g, '').replace(/\\\\u([0-9a-fA-F]{4})/g, function(_, hex) { return String.fromCharCode(parseInt(hex, 16)); });
            if (/\\.(m3u8|mp4)/.test(url)) {
                input = { jx: 0, parse: 0, url: url, header: {'User-Agent': 'Mozilla/5.0'} };
            } else {
                input = { jx: 0, parse: 1, url: input };
            }
        } else {
            input = { jx: 0, parse: 1, url: input };
        }
    `,
    推荐: `js:
        let html = request(input);
        let json = JSON.parse(html);
        let d = [];
        if (json.list) {
            json.list.forEach(item => {
                d.push({
                    title: item.vod_name,
                    pic_url: item.vod_pic,
                    desc: item.vod_remarks || item.vod_class,
                    url: '/bangumi/' + item.vod_id + '.html'
                });
            });
        }
        setResult(d);
    `,
    一级: `js:
        let html = request(input);
        let json = JSON.parse(html);
        let d = [];
        if (json.list) {
            json.list.forEach(item => {
                d.push({
                    title: item.vod_name,
                    pic_url: item.vod_pic,
                    desc: item.vod_remarks || item.vod_class,
                    url: '/bangumi/' + item.vod_id + '.html'
                });
            });
        }
        setResult(d);
    `,
    二级: `js:
        let html = request(input);
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h3.slide-info-title&&Text') || pdfh(html, 'title&&Text').split('_')[0];
        VOD.type_name = '动漫';
        VOD.vod_pic = pd(html, 'img.lazy[data-src]&&data-src', input);
        VOD.vod_remarks = pdfh(html, '.public-list-prb&&Text');
        VOD.vod_content = pdfh(html, '.desc&&Text') || pdfh(html, 'meta[name="description"]&&content');
        
        let tabs = pdfa(html, '.anthology-tab .swiper-slide').map(it => pdfh(it, 'Text').replace(/\\d+$/, '').trim());
        VOD.vod_play_from = tabs.join('$$$');
        
        let lists = [];
        let plist = pdfa(html, '.anthology-list-box');
        plist.forEach((box) => {
            let items = pdfa(box, 'body&&a').map((it) => {
                return pdfh(it, 'a&&Text') + '$' + pd(it, 'a&&href', input);
            });
            lists.push(items.join('#'));
        });
        VOD.vod_play_url = lists.join('$$$');
    `,
    搜索: `js:
        let html = request(input);
        let json = JSON.parse(html);
        let d = [];
        if (json.list) {
            json.list.forEach(item => {
                d.push({
                    title: item.name,
                    pic_url: item.pic,
                    desc: '',
                    url: '/bangumi/' + item.id + '.html'
                });
            });
        }
        setResult(d);
    `,
}

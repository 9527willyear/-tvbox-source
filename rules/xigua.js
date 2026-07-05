var rule = {
    author: 'kimi',
    title: '西瓜影院',
    类型: '影视',
    host: 'https://www.xiguazx.cc',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.xiguazx.cc/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/index.php/vod/type/id/20.html',
    url: '/index.php/vod/type/id/fyclass.html',
    searchUrl: '/index.php/vod/search/wd/**.html',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    limit: 24,
    double: false,
    class_name: '电影&连续剧&动漫&综艺&B站&人人专区',
    class_url: '20&37&43&45&47&60',
    play_parse: true,
    sniffer: 0,
    lazy: `js:
        let playHtml = request(input);
        let m = playHtml.match(/var player_aaaa=(\{[\s\S]*?\});/);
        if (!m || !m[1]) {
            input = { jx: 0, parse: 1, url: input };
        } else {
            let player = JSON.parse(m[1]);
            let platUrl = player.url || '';
            if (!platUrl) {
                input = { jx: 0, parse: 1, url: input };
            } else {
                let parseUrl = 'https://hls.xiguadh.com/?url=' + encodeURIComponent(platUrl);
                let parseHeaders = {
                    'User-Agent': rule.headers['User-Agent'],
                    'Referer': rule.host + '/'
                };
                let parseHtml = request(parseUrl, { headers: parseHeaders });
                let tm = parseHtml.match(/apiToken:\s*"([^"]+)"/);
                if (!tm || !tm[1]) {
                    input = { jx: 0, parse: 1, url: platUrl };
                } else {
                    let apiToken = tm[1];
                    let resolveUrl = 'https://hls.xiguadh.com/api/resolve.php?token=' + encodeURIComponent(apiToken);
                    let resolveHtml = request(resolveUrl, { headers: parseHeaders });
                    try {
                        let json = JSON.parse(resolveHtml);
                        if (json.code === 200 && json.url) {
                            input = { jx: 0, parse: 0, url: json.url, header: {'User-Agent': rule.headers['User-Agent'], 'Referer': 'https://hls.xiguadh.com/'} };
                        } else {
                            input = { jx: 0, parse: 1, url: platUrl };
                        }
                    } catch(e) {
                        input = { jx: 0, parse: 1, url: platUrl };
                    }
                }
            }
        }
    `,
    推荐: `js:
        let html = request(input);
        let d = [];
        let items = pdfa(html, '.stui-vodlist__box');
        items.forEach(it => {
            let title = pdfh(it, '.stui-vodlist__thumb&&title');
            if (!title) return;
            let pic = pd(it, '.stui-vodlist__thumb&&data-original', input);
            let url = pd(it, '.stui-vodlist__thumb&&href', input);
            let desc = pdfh(it, '.pic-text&&Text');
            d.push({ title: title, pic_url: pic, desc: desc, url: url });
        });
        setResult(d);
    `,
    一级: `js:
        let url = input;
        if (MY_PAGE && MY_PAGE > 1) {
            url = rule.host + '/index.php/vod/type/id/' + MY_CATE + '/page/' + MY_PAGE + '.html';
        }
        let html = request(url);
        let d = [];
        let items = pdfa(html, '.stui-vodlist__box');
        items.forEach(it => {
            let title = pdfh(it, '.stui-vodlist__thumb&&title');
            if (!title) return;
            let pic = pd(it, '.stui-vodlist__thumb&&data-original', url);
            let detailUrl = pd(it, '.stui-vodlist__thumb&&href', url);
            let desc = pdfh(it, '.pic-text&&Text');
            d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
        });
        setResult(d);
    `,
    二级: `js:
        let html = request(input);
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h1.title&&Text');
        VOD.vod_pic = pd(html, '.stui-content__thumb img&&data-original', input);
        VOD.vod_remarks = pdfh(html, '.stui-content__detail p.data:eq(1)&&Text');
        VOD.vod_year = pdfh(html, '.stui-content__detail p.data:eq(0)&&Text');
        VOD.vod_content = pdfh(html, '.detail-content&&Text') || pdfh(html, '.desc.detail&&Text');
        
        let tabs = pdfa(html, '.nav-tabs li a').map(it => pdfh(it, 'a&&Text'));
        if (tabs.length === 0) tabs = ['播放'];
        VOD.vod_play_from = tabs.join('$$$');
        
        let panes = pdfa(html, '.tab-content .tab-pane');
        let lists = [];
        panes.forEach(pane => {
            let episodes = pdfa(pane, '.stui-content__playlist li a').map(a => {
                let name = pdfh(a, 'a&&Text');
                let url = pd(a, 'a&&href', input);
                return name + '$' + url;
            });
            lists.push(episodes.join('#'));
        });
        VOD.vod_play_url = lists.join('$$$');
    `,
    搜索: `js:
        let url = input;
        let html = request(url);
        let d = [];
        let items = pdfa(html, '.stui-vodlist__box');
        items.forEach(it => {
            let title = pdfh(it, '.stui-vodlist__thumb&&title');
            if (!title) return;
            let pic = pd(it, '.stui-vodlist__thumb&&data-original', url);
            let detailUrl = pd(it, '.stui-vodlist__thumb&&href', url);
            let desc = pdfh(it, '.pic-text&&Text');
            d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
        });
        setResult(d);
    `,
}

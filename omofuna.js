var rule = {
    title: 'Omofun动漫',
    host: 'https://www.omofuna.com',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.omofuna.com/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/',
    url: '/type/fyclass-fypage.html',
    searchUrl: '',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    limit: 24,
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    class_name: '日漫&国漫&动画&剧场&特摄&美漫',
    class_url: '1&2&5&24&4&3',
    推荐: `js:
        let html = request(input, { headers: rule.headers });
        let d = [];
        pdfa(html, '.daFJ_dJJfFHa__gEI').forEach((it) => {
            let title = pdfh(it, 'a&&title') || pdfh(it, '.title&&Text');
            if (!title) return;
            let pic = pd(it, 'a&&data-original', input) || pd(it, 'img&&data-original', input);
            let url = pd(it, 'a&&href', input);
            let desc = pdfh(it, '.aaE_EaDE b&&Text') || pdfh(it, '.aaE_EaDEa b&&Text') || '';
            d.push({ title: title, pic_url: pic, desc: desc, url: url });
        });
        setResult(d);
    `,
    一级: `js:
        let html = request(input, { headers: rule.headers });
        let d = [];
        pdfa(html, '.daFJ_dJJfFHa__gEI').forEach((it) => {
            let title = pdfh(it, 'a&&title') || pdfh(it, '.title&&Text');
            if (!title) return;
            let pic = pd(it, 'a&&data-original', input) || pd(it, 'img&&data-original', input);
            let url = pd(it, 'a&&href', input);
            let desc = pdfh(it, '.aaE_EaDE b&&Text') || pdfh(it, '.aaE_EaDEa b&&Text') || '';
            d.push({ title: title, pic_url: pic, desc: desc, url: url });
        });
        setResult(d);
    `,
    二级: `js:
        let html = request(input, { headers: rule.headers });
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h1&&Text').split('免费观看')[0].trim() || pdfh(html, 'h1&&Text');
        VOD.vod_pic = pd(html, '.lazyload&&data-original', input) || pd(html, 'img.lazyload&&src', input);
        VOD.vod_remarks = pdfh(html, '.vod-min-title&&Text') || '';
        VOD.vod_content = pdfh(html, '.desc&&Text') || '';

        let tabs = pdfa(html, '.play-source-tab a').map(it => pdfh(it, 'a&&Text').trim()).filter(t => t);
        let lists = [];
        let panes = pdfa(html, '.play-list-content');
        if (tabs.length === 0) tabs = ['播放'];
        VOD.vod_play_from = tabs.join('$$$');

        panes.forEach((pane, idx) => {
            let episodes = pdfa(pane, 'a[href*="/play/"]').map(a => {
                let name = pdfh(a, 'a&&Text') || pdfh(a, 'a&&title');
                let u = pd(a, 'a&&href', input);
                return name + '$' + u;
            });
            lists.push(episodes.join('#'));
        });
        VOD.vod_play_url = lists.join('$$$');
    `,
    搜索: `js:
        setResult([]);
    `,
    lazy: `js:
        let url = input;
        if (url.indexOf('http') !== 0) url = rule.host + url;
        let html = request(url, { headers: rule.headers });
        let m = html.match(/var player_aaaa=\{[^}]+"url":"([^"]+)"/);
        if (m && m[1]) {
            let decoded = decodeURIComponent(m[1]);
            if (decoded.indexOf('http') === 0) {
                input = { parse: 0, url: decoded, header: rule.headers };
            } else {
                input = { parse: 1, url: url };
            }
        } else {
            input = { parse: 1, url: url };
        }
    `
}

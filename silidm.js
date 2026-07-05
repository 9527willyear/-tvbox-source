var rule = {
    author: 'kimi',
    title: '电影先生',
    类型: '影视',
    host: 'https://silidm.com',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://silidm.com/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/',
    url: '/type/fyclass/page/fypage.html',
    searchUrl: '/search/***-------------.html',
    searchable: 1,
    quickSearch: 0,
    filterable: 0,
    limit: 10,
    double: false,
    class_name: '电影&剧集&动漫&综艺',
    class_url: 'dy&juji&dongman&zongyi',
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    lazy: `js:
        let realUrl = '';
        try {
            let playHtml = request(input);
            if (playHtml) {
                let idx = playHtml.indexOf('var player_aaaa=');
                if (idx >= 0) {
                    let start = idx + 'var player_aaaa='.length;
                    let depth = 0, end = -1;
                    for (let i = start; i < playHtml.length; i++) {
                        if (playHtml[i] === '{') depth++;
                        else if (playHtml[i] === '}') {
                            depth--;
                            if (depth === 0) { end = i + 1; break; }
                        }
                    }
                    if (end > start) {
                        let player = JSON.parse(playHtml.substring(start, end));
                        if (player && player.url) realUrl = player.url;
                    }
                }
                if (!realUrl) {
                    let m = playHtml.match(/https?:\/\/[^\"'\s]+\.(m3u8|mp4)/i);
                    if (m) realUrl = m[0];
                }
            }
        } catch (e) {}
        if (realUrl && /^https?:\/\//i.test(realUrl)) {
            input = { parse: 0, url: realUrl, header: { 'User-Agent': rule.headers['User-Agent'], 'Referer': rule.host + '/' } };
        } else {
            input = { parse: 1, url: input };
        }
    `,
    推荐: `js:
        let d = [];
        try {
            let html = request(input);
            let items = pdfa(html, '.module-item');
            items.forEach(it => {
                let title = pdfh(it, '.module-item-title&&Text') || pdfh(it, '.video-name a&&Text');
                if (!title) return;
                let pic = pd(it, '.module-item-pic img&&data-src', input);
                let url = pd(it, '.module-item-title&&href', input) || pd(it, '.module-item-pic a&&href', input);
                let desc = pdfh(it, '.module-item-text&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
    一级: `js:
        let d = [];
        try {
            let html = request(input);
            let items = pdfa(html, '.module-item');
            items.forEach(it => {
                let title = pdfh(it, '.module-item-title&&Text') || pdfh(it, '.video-name a&&Text');
                if (!title) return;
                let pic = pd(it, '.module-item-pic img&&data-src', input);
                let url = pd(it, '.module-item-title&&href', input) || pd(it, '.module-item-pic a&&href', input);
                let desc = pdfh(it, '.module-item-text&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
    二级: `js:
        let html = request(input);
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h1.page-title&&Text') || pdfh(html, 'h1&&Text') || '';
        VOD.vod_pic = pd(html, '.module-item-pic img&&data-src', input) || '';

        let tabs = pdfa(html, '.play-source-tab').map(it => pdfh(it, '&&Text'));
        let contents = pdfa(html, '.play-source-content');
        let froms = [];
        let lists = [];
        contents.forEach((content, index) => {
            let tabName = tabs[index] || ('线路' + (index + 1));
            if (tabName.indexOf('网盘') >= 0) return;
            let episodes = pdfa(content, 'a').map(a => {
                let name = pdfh(a, 'a&&Text');
                let url = pd(a, 'a&&href', input);
                return name + '$' + url;
            }).filter(x => x && x.indexOf('$') > 0 && x.split('$')[0]);
            if (episodes.length > 0) {
                froms.push(tabName);
                lists.push(episodes.join('#'));
            }
        });
        VOD.vod_play_from = froms.join('$$$');
        VOD.vod_play_url = lists.join('$$$');
    `,
    搜索: `js:
        let d = [];
        try {
            let html = request(input);
            let items = pdfa(html, '.module-search-item');
            items.forEach(it => {
                let title = pdfh(it, '.video-info-header a&&Text') || pdfh(it, 'h3&&Text');
                if (!title) return;
                let pic = pd(it, '.module-item-pic img&&data-src', input);
                let url = pd(it, '.video-info-header a&&href', input);
                let desc = pdfh(it, '.video-info-item&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
}

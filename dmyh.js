var rule = {
    author: 'kimi',
    title: '樱花动漫',
    类型: '影视',
    host: 'https://dmyh01.cc',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dmyh01.cc/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/fenlei/riben.html',
    url: '/fenlei/fyclass/page/fypage.html',
    searchUrl: '/sou.html?wd=***',
    searchable: 1,
    quickSearch: 0,
    filterable: 0,
    limit: 10,
    double: false,
    class_name: '国产&欧美&日本&里番&电影',
    class_url: 'guochan&oumei&riben&lifan&dianying',
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
        if (realUrl && /^https?:\\/\\//i.test(realUrl)) {
            input = { parse: 0, url: realUrl, header: { 'User-Agent': rule.headers['User-Agent'], 'Referer': rule.host + '/' } };
        } else {
            input = { parse: 1, url: input };
        }
    `,
    推荐: `js:
        let d = [];
        try {
            let html = request(input);
            let items = pdfa(html, '.a-con-inner');
            items.forEach(it => {
                let title = pdfh(it, '.s1 a&&Text') || pdfh(it, '.pic a&&title');
                if (!title) return;
                let pic = pd(it, '.pic img&&data-src', input);
                let url = pd(it, '.s1 a&&href', input);
                let desc = pdfh(it, '.s4&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
    一级: `js:
        let d = [];
        try {
            let html = request(input);
            let items = pdfa(html, '.a-con-inner');
            items.forEach(it => {
                let title = pdfh(it, '.s1 a&&Text') || pdfh(it, '.pic a&&title');
                if (!title) return;
                let pic = pd(it, '.pic img&&data-src', input);
                let url = pd(it, '.s1 a&&href', input);
                let desc = pdfh(it, '.s4&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
    二级: `js:
        let html = request(input);
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h1.tit&&Text') || '';
        VOD.vod_pic = pd(html, '.info .pic img&&data-src', input) || '';
        VOD.vod_remarks = pdfh(html, '.zhuangtai&&Text') || '';
        VOD.vod_year = pdfh(html, '.type a:eq(2)&&Text') || '';
        VOD.vod_area = pdfh(html, '.type a:eq(3)&&Text') || '';
        VOD.vod_actor = pdfh(html, '.zhuyan&&Text') || '';
        VOD.vod_director = pdfh(html, '.daoyan&&Text') || '';
        VOD.vod_content = pdfh(html, '.juqing span&&Text') || '';

        let playUrl = pd(html, '.play a&&href', input);
        if (!playUrl) {
            let m = input.match(/\\/yh\\/(\\d+)\\.html/);
            if (m) playUrl = rule.host + '/id/' + m[1] + '-1-1.html';
        }

        if (playUrl) {
            let playHtml = request(playUrl);
            let episodes = pdfa(playHtml, '.jisu a').map(a => {
                let name = pdfh(a, 'a&&Text');
                let url = pd(a, 'a&&href', playUrl);
                return name + '$' + url;
            });
            VOD.vod_play_from = '在线观看';
            VOD.vod_play_url = episodes.join('#');
        } else {
            VOD.vod_play_from = '在线观看';
            VOD.vod_play_url = '';
        }
    `,
    搜索: `js:
        let d = [];
        try {
            let html = request(input);
            let items = pdfa(html, '.search-con li');
            items.forEach(it => {
                let title = pdfh(it, '.info p:eq(0) a&&Text');
                if (!title) return;
                let pic = pd(it, '.pic img&&data-src', input);
                let url = pd(it, '.info p:eq(0) a&&href', input);
                let desc = pdfh(it, '.state span&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
}

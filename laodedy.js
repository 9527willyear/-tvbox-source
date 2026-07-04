var rule = {
    title: '老的电影网',
    host: 'https://www.laodedy.com',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.laodedy.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: 'https://www.laodedy.com/category/dianying.html',
    url: 'https://www.laodedy.com/category/fyclass.html',
    searchUrl: 'https://www.laodedy.com/search.php?searchword=**',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    limit: 24,
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    class_name: '电影&电视剧&动漫&综艺&短剧&日韩动漫',
    class_url: 'dianying&dianshiju&dongman&zongyi&duanju&rihandongman',
    推荐: `js:
        let d = [];
        try {
            let url = input;
            if (typeof url !== 'string' || url.indexOf('http') !== 0) url = rule.host + url;
            let page = typeof MY_PAGE !== 'undefined' ? parseInt(MY_PAGE) : 1;
            let cate = typeof MY_CATE !== 'undefined' ? MY_CATE : 'dianying';
            if (page > 1) {
                url = rule.host + '/category/' + cate + '_' + page + '.html';
            }
            try { log('laodedy 推荐 url:' + url); } catch (e) {}
            let html = request(url, { headers: rule.headers });
            try { log('laodedy 推荐 html len:' + (html ? html.length : 0)); } catch (e) {}
            if (!html || html.length < 100) {
                html = request(url);
                try { log('laodedy 推荐 retry html len:' + (html ? html.length : 0)); } catch (e) {}
            }
            if (!html || html.length < 100) {
                d.push({ title: '请求失败', desc: '返回为空:' + url, url: 'http://localhost' });
            } else {
                let items = pdfa(html, 'li.p1');
                items.forEach(it => {
                    let title = pdfh(it, 'a&&title') || pdfh(it, '.name&&Text');
                    if (!title) return;
                    let pic = pd(it, 'img&&data-original', url) || pd(it, 'img&&src', url);
                    let detailUrl = pd(it, 'a&&href', url);
                    let desc = pdfh(it, '.other&&Text') || '';
                    d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
                });
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    一级: `js:
        let d = [];
        try {
            let url = input;
            if (typeof url !== 'string' || url.indexOf('http') !== 0) url = rule.host + url;
            let page = typeof MY_PAGE !== 'undefined' ? parseInt(MY_PAGE) : 1;
            let cate = typeof MY_CATE !== 'undefined' ? MY_CATE : 'dianying';
            if (page > 1) {
                url = rule.host + '/category/' + cate + '_' + page + '.html';
            }
            try { log('laodedy 一级 url:' + url); } catch (e) {}
            let html = request(url, { headers: rule.headers });
            try { log('laodedy 一级 html len:' + (html ? html.length : 0)); } catch (e) {}
            if (!html || html.length < 100) {
                html = request(url);
                try { log('laodedy 一级 retry html len:' + (html ? html.length : 0)); } catch (e) {}
            }
            if (!html || html.length < 100) {
                d.push({ title: '请求失败', desc: '返回为空:' + url, url: 'http://localhost' });
            } else {
                let items = pdfa(html, 'li.p1');
                items.forEach(it => {
                    let title = pdfh(it, 'a&&title') || pdfh(it, '.name&&Text');
                    if (!title) return;
                    let pic = pd(it, 'img&&data-original', url) || pd(it, 'img&&src', url);
                    let detailUrl = pd(it, 'a&&href', url);
                    let desc = pdfh(it, '.other&&Text') || '';
                    d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
                });
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    二级: `js:
        let url = input;
        if (typeof url !== 'string' || url.indexOf('http') !== 0) url = rule.host + url;
        let html = request(url, { headers: rule.headers });
        if (!html || html.length < 100) html = request(url);
        VOD = {};
        VOD.vod_id = url;
        VOD.vod_name = pdfh(html, 'h1&&Text').split('»').pop().trim() || pdfh(html, '.ct-c .name&&Text').split(/\s|更新/)[0];
        VOD.vod_pic = pd(html, '.ct-l img&&data-original', url) || pd(html, '.ct-l img&&src', url);
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
                let u = pd(a, 'a&&href', url);
                return name + '$' + u;
            });
            lists.push(episodes.join('#'));
        });
        VOD.vod_play_url = lists.join('$$$');
    `,
    搜索: `js:
        let d = [];
        try {
            let url = input;
            if (typeof url !== 'string' || url.indexOf('http') !== 0) url = rule.host + url;
            let page = typeof MY_PAGE !== 'undefined' ? parseInt(MY_PAGE) : 1;
            if (page > 1) {
                url = url + '&page=' + page;
            }
            try { log('laodedy 搜索 url:' + url); } catch (e) {}
            let html = request(url, { headers: rule.headers });
            try { log('laodedy 搜索 html len:' + (html ? html.length : 0)); } catch (e) {}
            if (!html || html.length < 100) {
                html = request(url);
                try { log('laodedy 搜索 retry html len:' + (html ? html.length : 0)); } catch (e) {}
            }
            if (!html || html.length < 100) {
                d.push({ title: '请求失败', desc: '返回为空:' + url, url: 'http://localhost' });
            } else {
                let items = pdfa(html, 'li.p1');
                if (!items || items.length === 0) {
                    items = pdfa(html, '.index-area li');
                }
                items.forEach(it => {
                    let title = pdfh(it, 'a&&title') || pdfh(it, '.name&&Text');
                    if (!title) return;
                    let pic = pd(it, 'img&&data-original', url) || pd(it, 'img&&src', url);
                    let detailUrl = pd(it, 'a&&href', url);
                    let desc = pdfh(it, '.other&&Text') || '';
                    d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
                });
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    lazy: `js:
        let url = input;
        if (typeof url !== 'string' || url.indexOf('http') !== 0) url = rule.host + url;
        let html = request(url, { headers: rule.headers });
        if (!html || html.length < 100) html = request(url);
        let m = html.match(/var now="([^"]+)"/);
        try { log('laodedy lazy now:' + (m ? m[1] : 'no match')); } catch (e) {}
        if (m && m[1] && m[1].indexOf('http') === 0) {
            input = { parse: 0, url: m[1], header: rule.headers };
        } else {
            input = { parse: 1, url: url };
        }
    `
}

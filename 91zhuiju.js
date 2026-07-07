var rule = {
    author: 'kimi',
    title: '91追剧',
    类型: '影视',
    host: 'https://www.91zhuiju.net',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.91zhuiju.net/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/vod/type/id/1/page/1.html',
    url: '/vod/type/id/fyclass/page/fypage.html',
    searchUrl: '/vod/search/wd/***.html',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    limit: 10,
    double: false,
    class_name: '电影&动作片&喜剧片&爱情片&科幻片&恐怖片&剧情片&战争片&动画片&记录片&电视剧&国产剧&港剧&台剧&韩剧&泰剧&美剧&海外剧&日剧&动漫&国产动漫&日韩动漫&欧美动漫&港台动漫&海外动漫&综艺&国产综艺&港台综艺&日韩综艺&欧美综艺&短剧',
    class_url: '1&6&7&8&9&10&11&12&22&23&2&13&14&15&16&24&25&26&27&3&28&29&30&31&36&4&32&33&34&35&5',
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    lazy: `js:
        function zjDecodeUrl(s) {
            try {
                if (!s) return '';
                s = s.trim();
                if (/^https?:\/\//i.test(s)) return s;
                let percent = atob(s);
                return decodeURIComponent(percent);
            } catch (e) {
                return s;
            }
        }

        let playHtml = request(input);
        let playerJson = '';
        try {
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
                if (end > start) playerJson = playHtml.substring(start, end);
            }
        } catch (e) {}
        let player = null;
        try { if (playerJson) player = JSON.parse(playerJson); } catch (e) {}
        if (!player || !player.url) {
            input = { parse: 1, url: input };
        } else {
            let realUrl = zjDecodeUrl(player.url);
            if (realUrl && /^https?:\/\/[^\\s]+\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)(\?.*)?$/i.test(realUrl)) {
                input = { parse: 0, url: realUrl, header: { 'User-Agent': rule.headers['User-Agent'], 'Referer': rule.host + '/' } };
            } else {
                input = { parse: 1, url: input };
            }
        }
    `,
    推荐: `js:
        let d = [];
        function fixPic(pic) {
            if (!pic || pic.indexOf('http') !== 0) {
                return rule.host + '/upload/mxprocms/20250103-1/f5a3f9621789e26ddbae4ee9c4f67613.png';
            }
            return pic;
        }
        try {
            let page = typeof MY_PAGE !== 'undefined' ? parseInt(MY_PAGE) : 1;
            let cate = typeof MY_CATE !== 'undefined' ? MY_CATE : '1';
            let apiUrl = rule.host + '/index.php/ajax/data?mid=1&tid=' + cate + '&page=' + page + '&limit=10';
            let html = request(apiUrl);
            let json = JSON.parse(html);
            if (json.code == 1 && json.list && json.list.length > 0) {
                json.list.forEach(item => {
                    d.push({
                        title: item.vod_name,
                        pic_url: fixPic(item.vod_pic),
                        desc: '[P' + page + '] ' + (item.vod_remarks || item.vod_class || ''),
                        url: rule.host + '/vod/detail/id/' + item.vod_id + '.html'
                    });
                });
            } else {
                d.push({ title: '暂无数据', desc: 'API返回为空 P=' + page + ' C=' + cate, url: 'http://localhost' });
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    一级: `js:
        let d = [];
        function fixPic(pic) {
            if (!pic || pic.indexOf('http') !== 0) {
                return rule.host + '/upload/mxprocms/20250103-1/f5a3f9621789e26ddbae4ee9c4f67613.png';
            }
            return pic;
        }
        try {
            let page = typeof MY_PAGE !== 'undefined' ? parseInt(MY_PAGE) : 1;
            let cate = typeof MY_CATE !== 'undefined' ? MY_CATE : '1';
            let apiUrl = rule.host + '/index.php/ajax/data?mid=1&tid=' + cate + '&page=' + page + '&limit=10';
            let html = request(apiUrl);
            let json = JSON.parse(html);
            if (json.code == 1 && json.list && json.list.length > 0) {
                json.list.forEach(item => {
                    d.push({
                        title: item.vod_name,
                        pic_url: fixPic(item.vod_pic),
                        desc: '[P' + page + '] ' + (item.vod_remarks || item.vod_class || ''),
                        url: rule.host + '/vod/detail/id/' + item.vod_id + '.html'
                    });
                });
            } else {
                d.push({ title: '暂无数据', desc: 'API返回为空 P=' + page + ' C=' + cate, url: 'http://localhost' });
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    二级: `js:
        let html = request(input);
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h1&&Text') || pdfh(html, '.module-info-heading h1&&Text');
        VOD.vod_pic = pd(html, '.module-info-poster img&&data-original', input) || pd(html, '.module-item-pic img&&data-original', input);
        VOD.vod_remarks = pdfh(html, '.module-info-item:eq(0)&&Text') || '';
        VOD.vod_year = pdfh(html, '.module-info-tag a:eq(0)&&Text') || '';
        VOD.vod_area = pdfh(html, '.module-info-tag a:eq(1)&&Text') || '';
        VOD.vod_actor = pdfh(html, '.module-info-item:contains(主演)&&Text') || '';
        VOD.vod_director = pdfh(html, '.module-info-item:contains(导演)&&Text') || '';
        VOD.vod_content = pdfh(html, '.module-info-item:contains(简介)&&Text') || pdfh(html, '.module-info-content&&Text') || '';

        let tabs = pdfa(html, '.module-tab-items-box .module-tab-item span').map(it => pdfh(it, 'span&&Text'));
        if (tabs.length === 0) tabs = ['播放'];
        VOD.vod_play_from = tabs.join('$$$');

        let panes = pdfa(html, '.module-play-list');
        let lists = [];
        panes.forEach(pane => {
            let episodes = pdfa(pane, '.module-play-list-link').map(a => {
                let name = pdfh(a, 'span&&Text') || pdfh(a, 'a&&Text');
                let url = pd(a, 'a&&href', input);
                return name + '$' + url;
            });
            lists.push(episodes.join('#'));
        });
        VOD.vod_play_url = lists.join('$$$');
    `,
    搜索: `js:
        let d = [];
        try {
            let url = input;
            let html = request(url);
            if (!html || html.length < 100) {
                d.push({ title: '请求失败', desc: '返回内容为空', url: 'http://localhost' });
            } else {
                let items = pdfa(html, '.module-items .module-poster-item');
                if (!items || items.length === 0) {
                    d.push({ title: '解析失败', desc: '未找到影片条目', url: 'http://localhost' });
                } else {
                    items.forEach(it => {
                        let title = pdfh(it, '.module-poster-item-title&&Text') || pdfh(it, 'a&&title');
                        if (!title) return;
                        let pic = pd(it, '.module-item-pic img&&data-original', url);
                        let detailUrl = pd(it, 'a&&href', url);
                        let desc = pdfh(it, '.module-item-note&&Text');
                        d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
                    });
                }
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
}

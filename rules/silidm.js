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
    url: '/show/fyclass--------fypage---.html',
    searchUrl: '/index.php/ajax/suggest?mid=1&wd=**&page=fypage&limit=20',
    searchable: 2,
    quickSearch: 1,
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
                // 优先解析 player_aaaa
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
                // 备用正则提取 m3u8/mp4
                if (!realUrl) {
                    let m = playHtml.match(/https?:\/\/[^\"'\s]+\.(m3u8|mp4|flv)/i);
                    if (m) realUrl = m[0];
                }
                // 如果拿到的是相对路径，补全
                if (realUrl && realUrl.startsWith('/')) {
                    realUrl = rule.host + realUrl;
                }
            }
        } catch (e) {}
        if (realUrl && /^https?:\/\//i.test(realUrl)) {
            input = { parse: 0, url: realUrl, header: { 'User-Agent': rule.headers['User-Agent'], 'Referer': rule.host + '/', 'Origin': rule.host } };
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
            let url = input || '';
            let page = typeof MY_PAGE !== 'undefined' ? parseInt(MY_PAGE) : 1;
            let pm = url.match(/--------(\d+)---\.html/);
            if (pm) page = parseInt(pm[1]);
            let html = request(input);
            if (!html || html.length < 500) {
                d.push({ title: '请求失败', desc: '返回为空: ' + input, url: 'http://localhost' });
            } else {
                let items = pdfa(html, '.module-item');
                if (!items || items.length === 0) {
                    d.push({ title: '解析失败', desc: '未找到影片: ' + input, url: 'http://localhost' });
                } else {
                    items.forEach(it => {
                        let title = pdfh(it, '.module-item-title&&Text') || pdfh(it, '.video-name a&&Text');
                        if (!title) return;
                        let pic = pd(it, '.module-item-pic img&&data-src', input);
                        let detailUrl = pd(it, '.module-item-title&&href', input) || pd(it, '.module-item-pic a&&href', input);
                        let desc = '[P' + page + '] ' + (pdfh(it, '.module-item-text&&Text') || '');
                        d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
                    });
                }
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e) + ': ' + input, url: 'http://localhost' });
        }
        setResult(d);
    `,
    二级: `js:
        try {
            let html = request(input);
            VOD = {};
            VOD.vod_id = input;
            VOD.vod_name = pdfh(html, 'h1.page-title&&Text') || pdfh(html, 'h1&&Text') || '';
            VOD.vod_pic = pd(html, '.module-item-pic img&&data-src', input) || '';
            VOD.type_name = pdfh(html, '.video-info-aux .video-tag-icon&&Text') || '';
            VOD.vod_area = pdfh(html, '.video-info-aux a&&Text') || '';

            // 遍历 info-items 取导演/主演/年份/备注/剧情，不依赖 :contains()
            pdfa(html, '.video-info-items').forEach(it => {
                let label = (pdfh(it, '.video-info-itemtitle&&Text') || '').replace(/[:：\s]/g, '');
                if (label.indexOf('导演') >= 0) VOD.vod_director = pdfh(it, '.video-info-actor&&Text') || pdfh(it, '.video-info-item&&Text') || '';
                else if (label.indexOf('主演') >= 0) VOD.vod_actor = pdfh(it, '.video-info-actor&&Text') || pdfh(it, '.video-info-item&&Text') || '';
                else if (label.indexOf('上映') >= 0 || label.indexOf('年份') >= 0) VOD.vod_year = pdfh(it, '.video-info-item&&Text') || '';
                else if (label.indexOf('备注') >= 0) VOD.vod_remarks = pdfh(it, '.video-info-item&&Text') || '';
                else if (label.indexOf('剧情') >= 0) VOD.vod_content = pdfh(it, '.video-info-content&&Text') || pdfh(it, '.video-info-item&&Text') || '';
            });

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
        } catch (e) {
            VOD = { vod_id: input, vod_name: '解析出错', vod_content: String(e.message || e) };
        }
    `,
    搜索: `js:
        let d = [];
        try {
            let html = request(input);
            let json = JSON.parse(html);
            if (json && json.list) {
                json.list.forEach(item => {
                    d.push({
                        title: item.name,
                        pic_url: item.pic,
                        desc: '',
                        url: '/video/' + item.id + '.html'
                    });
                });
            }
        } catch (e) {}
        setResult(d);
    `,
}

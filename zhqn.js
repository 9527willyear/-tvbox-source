var rule = {
    author: 'kimi',
    title: '青年影视',
    类型: '影视',
    host: 'https://www.zhqn.com.cn',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://www.zhqn.com.cn/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/cates-1.html',
    url: '/cates-fyclass-fypage.html',
    searchUrl: '/search.html?keyword=**&page=fypage',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    limit: 24,
    double: false,
    class_name: '电影&伦理片&动漫&综艺&短剧&连续剧&体育赛事',
    class_url: '1&15&24&30&36&43&47',
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    lazy: `js:
        let realUrl = '';
        try {
            let playHtml = request(input);
            if (playHtml) {
                let m = playHtml.match(/var player_urls\\s*=\\s*(\\[.*?\\]);/s);
                if (m) {
                    let arr = JSON.parse(m[1]);
                    if (arr && arr.length > 0 && arr[0].play_url) {
                        realUrl = arr[0].play_url;
                    }
                }
                if (!realUrl) {
                    let m2 = playHtml.match(/https?:\\/\\/[^"'\\s]+\\.(m3u8|mp4|flv)/i);
                    if (m2) realUrl = m2[0];
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
            let items = pdfa(html, '.grid .desktop-hover-effect');
            items.forEach(it => {
                let title = pdfh(it, 'img&&alt') || pdfh(it, 'span&&Text');
                if (!title) return;
                let pic = pd(it, 'img&&data-original', input);
                let url = pd(it, 'a&&href', input);
                let desc = pdfh(it, '.absolute.bottom-1 p&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
    一级: `js:
        let d = [];
        try {
            let html = request(input);
            if (!html || html.length < 500) {
                d.push({ title: '请求失败', desc: '返回为空: ' + input, url: 'http://localhost' });
            } else {
                let items = pdfa(html, '.grid .desktop-hover-effect');
                if (!items || items.length === 0) {
                    d.push({ title: '解析失败', desc: '未找到影片: ' + input, url: 'http://localhost' });
                } else {
                    items.forEach(it => {
                        let title = pdfh(it, 'img&&alt') || pdfh(it, 'span&&Text');
                        if (!title) return;
                        let pic = pd(it, 'img&&data-original', input);
                        let url = pd(it, 'a&&href', input);
                        let desc = pdfh(it, '.absolute.bottom-1 p&&Text') || '';
                        d.push({ title: title, pic_url: pic, desc: desc, url: url });
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
            let titleMatch = pdfh(html, 'title&&Text').match(/《([^》]+)》/);
            VOD.vod_name = titleMatch ? titleMatch[1] : (pdfh(html, 'title&&Text').split('-')[0] || '');
            VOD.vod_pic = pd(html, 'img.lazy&&data-original', input) || '';
            VOD.vod_content = pdfh(html, 'meta[name="description"]&&content') || '';

            let sourceTracks = pdfa(html, '#videoSourceTrack');
            let episodeLists = pdfa(html, '#mobileModalVideoWrap');
            let froms = [];
            let lists = [];

            sourceTracks.forEach((track, index) => {
                let sourceName = pdfh(track, 'span&&Text') || ('线路' + (index + 1));
                sourceName = sourceName.replace(/[\\s\\-]*$/, '').trim();
                let episodes = [];
                if (episodeLists[index]) {
                    pdfa(episodeLists[index], 'a').forEach(a => {
                        let name = pdfh(a, 'a&&Text');
                        let url = pd(a, 'a&&href', input);
                        if (name === '4K' || name === 'HD' || name === 'TC') {
                            name = '正片';
                        }
                        if (name && url) {
                            episodes.push(name + '$' + url);
                        }
                    });
                }
                if (episodes.length > 0) {
                    froms.push(sourceName);
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
            let items = pdfa(html, '.col-lg-6.col-md-12.mt-2.mb-2.cursor-pointer');
            items.forEach(it => {
                let title = pdfh(it, '.topic-details-title&&Text') || pdfh(it, '.topic-details-title-mobile&&Text');
                if (!title) return;
                let pic = pd(it, 'img&&data-original', input);
                let url = pd(it, 'a&&href', input);
                let desc = pdfh(it, '.topic-details-title-sub&&Text') || '';
                d.push({ title: title, pic_url: pic, desc: desc, url: url });
            });
        } catch (e) {}
        setResult(d);
    `,
}

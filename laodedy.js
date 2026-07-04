var rule = {
    title: '老的电影网',
    host: 'https://www.laodedy.com',
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/category/dianying.html',
    url: '/category/fyclass_fypage.html',
    searchUrl: '/search.php?searchword=**&page=fypage',
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
            if (typeof url !== 'string') url = String(url);
            if (url.indexOf('http') !== 0) url = rule.host + url;
            d.push({ title: 'DEBUG input', desc: url, url: 'http://localhost' });
            let html = request(url);
            d.push({ title: 'DEBUG html len', desc: String(html ? html.length : 0), url: 'http://localhost' });
            if (html && html.length > 100) {
                pdfa(html, 'li.p1').forEach((it) => {
                    let title = pdfh(it, 'a&&title') || pdfh(it, '.name&&Text');
                    if (!title) return;
                    d.push({
                        title: title,
                        pic_url: pd(it, 'img&&data-original', url) || pd(it, 'img&&src', url),
                        desc: pdfh(it, '.other&&Text') || '',
                        url: pd(it, 'a&&href', url)
                    });
                });
            }
        } catch (e) {
            d.push({ title: 'DEBUG error', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    一级: `js:
        let d = [];
        try {
            let url = input;
            if (typeof url !== 'string') url = String(url);
            if (url.indexOf('http') !== 0) url = rule.host + url;
            d.push({ title: 'DEBUG input', desc: url, url: 'http://localhost' });
            let html = request(url);
            d.push({ title: 'DEBUG html len', desc: String(html ? html.length : 0), url: 'http://localhost' });
            if (html && html.length > 100) {
                pdfa(html, 'li.p1').forEach((it) => {
                    let title = pdfh(it, 'a&&title') || pdfh(it, '.name&&Text');
                    if (!title) return;
                    d.push({
                        title: title,
                        pic_url: pd(it, 'img&&data-original', url) || pd(it, 'img&&src', url),
                        desc: pdfh(it, '.other&&Text') || '',
                        url: pd(it, 'a&&href', url)
                    });
                });
            }
        } catch (e) {
            d.push({ title: 'DEBUG error', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    二级: `js:
        let url = input;
        if (typeof url !== 'string') url = String(url);
        if (url.indexOf('http') !== 0) url = rule.host + url;
        let html = request(url);
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
            if (typeof url !== 'string') url = String(url);
            if (url.indexOf('http') !== 0) url = rule.host + url;
            d.push({ title: 'DEBUG input', desc: url, url: 'http://localhost' });
            let html = request(url);
            d.push({ title: 'DEBUG html len', desc: String(html ? html.length : 0), url: 'http://localhost' });
            if (html && html.length > 100) {
                pdfa(html, 'li.p1').forEach((it) => {
                    let title = pdfh(it, 'a&&title') || pdfh(it, '.name&&Text');
                    if (!title) return;
                    d.push({
                        title: title,
                        pic_url: pd(it, 'img&&data-original', url) || pd(it, 'img&&src', url),
                        desc: pdfh(it, '.other&&Text') || '',
                        url: pd(it, 'a&&href', url)
                    });
                });
            }
        } catch (e) {
            d.push({ title: 'DEBUG error', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    lazy: `js:
        let url = input;
        if (typeof url !== 'string') url = String(url);
        if (url.indexOf('http') !== 0) url = rule.host + url;
        let html = request(url);
        let m = html.match(/var now="([^"]+)"/);
        if (m && m[1] && m[1].indexOf('http') === 0) {
            input = { parse: 0, url: m[1] };
        } else {
            input = { parse: 1, url: url };
        }
    `
}

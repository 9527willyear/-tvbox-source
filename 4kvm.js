var rule = {
    title: '4K影视',
    host: 'https://www.4kvm.top',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'https://www.4kvm.top/'
    },
    编码: 'utf-8',
    timeout: 15000,
    homeUrl: '/movie?page=1',
    url: '/fyclass?page=fypage',
    searchUrl: '/search?q=**&page=fypage',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    limit: 24,
    play_parse: true,
    sniffer: 1,
    isVideo: '4kvm\\.top/video/play|\\.m3u8|\\.mp4|\\.flv',
    class_name: '电影&电视剧&动漫',
    class_url: 'movie&tv&anime',
    lazy: `js:
        input = {parse: 1, url: input, header: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', 'Referer': 'https://www.4kvm.top/'}};
    `,
    推荐: `js:
        try {
            let html = request(input);
            let d = [];
            let cards = pdfa(html, '.movie-card');
            for (let i = 0; i < cards.length; i++) {
                let it = cards[i];
                let a = pdfa(it, 'a[href^="/play/"]');
                if (!a.length) continue;
                let href = pd(a[0], 'a&&href', input);
                let title = pdfh(a[0], 'h3&&Text') || pdfh(it, 'img&&alt') || '';
                let pic = pd(it, 'img&&data-src', input);
                if (pic && pic.indexOf('gimg0.baidu.com') > -1) {
                    let m = pic.match(/src=([^&]+)/);
                    if (m) pic = decodeURIComponent(m[1]);
                    if (pic && pic.indexOf('http') !== 0) pic = 'https://' + pic;
                }
                let desc = pdfh(it, '.text-gray-400&&Text') || '';
                if (href && title) {
                    d.push({title: title, pic_url: pic, desc: desc, url: href});
                }
            }
            if (!d.length) d.push({title: '未解析到数据', desc: String(html.length), url: input});
            setResult(d);
        } catch (e) {
            setResult([{title: '请求异常', desc: String(e.message || e), url: input}]);
        }
    `,
    一级: `js:
        try {
            let html = request(input);
            let d = [];
            let cards = pdfa(html, '.movie-card');
            for (let i = 0; i < cards.length; i++) {
                let it = cards[i];
                let a = pdfa(it, 'a[href^="/play/"]');
                if (!a.length) continue;
                let href = pd(a[0], 'a&&href', input);
                let title = pdfh(a[0], 'h3&&Text') || pdfh(it, 'img&&alt') || '';
                let pic = pd(it, 'img&&data-src', input);
                if (pic && pic.indexOf('gimg0.baidu.com') > -1) {
                    let m = pic.match(/src=([^&]+)/);
                    if (m) pic = decodeURIComponent(m[1]);
                    if (pic && pic.indexOf('http') !== 0) pic = 'https://' + pic;
                }
                let desc = pdfh(it, '.text-gray-400&&Text') || '';
                if (href && title) {
                    d.push({title: title, pic_url: pic, desc: desc, url: href});
                }
            }
            if (!d.length) d.push({title: '未解析到数据', desc: String(html.length), url: input});
            setResult(d);
        } catch (e) {
            setResult([{title: '请求异常', desc: String(e.message || e), url: input}]);
        }
    `,
    二级: `js:
        try {
            let html = request(input);
            VOD = {};
            VOD.vod_id = input;
            VOD.vod_name = pdfh(html, 'h1&&Text') || pdfh(html, 'title&&Text').split('-')[0].trim();
            VOD.vod_pic = pd(html, 'meta[property="og:image"]&&content', input);
            VOD.type_name = '4K影视';
            VOD.vod_remarks = pdfh(html, '.bg-primary-500\\/20&&Text') || pdfh(html, '.bg-dark-700&&Text') || '';
            VOD.vod_content = pdfh(html, 'meta[name="description"]&&content') || '';
            VOD.vod_play_from = '4K影视';
            let urls = [];
            let eps = pdfa(html, '.episode-link');
            for (let i = 0; i < eps.length; i++) {
                let it = eps[i];
                let ep = pdfh(it, 'a&&data-episode') || pdfh(it, 'a&&Text');
                let href = pd(it, 'a&&href', input);
                if (ep && href) urls.push(ep + '$' + href);
            }
            VOD.vod_play_url = urls.length ? urls.join('#') : (VOD.vod_name + '$' + input);
        } catch (e) {
            VOD = {vod_id: input, vod_name: '解析失败', vod_content: String(e.message || e), vod_play_url: '播放$' + input};
        }
    `,
    搜索: `js:
        try {
            let html = request(input);
            let d = [];
            let cards = pdfa(html, '.movie-card');
            for (let i = 0; i < cards.length; i++) {
                let it = cards[i];
                let a = pdfa(it, 'a[href^="/play/"]');
                if (!a.length) continue;
                let href = pd(a[0], 'a&&href', input);
                let title = pdfh(a[0], 'h3&&Text') || pdfh(it, 'img&&alt') || '';
                let pic = pd(it, 'img&&data-src', input);
                if (pic && pic.indexOf('gimg0.baidu.com') > -1) {
                    let m = pic.match(/src=([^&]+)/);
                    if (m) pic = decodeURIComponent(m[1]);
                    if (pic && pic.indexOf('http') !== 0) pic = 'https://' + pic;
                }
                if (href && title) d.push({title: title, pic_url: pic, desc: '', url: href});
            }
            if (!d.length) d.push({title: '未解析到数据', desc: String(html.length), url: input});
            setResult(d);
        } catch (e) {
            setResult([{title: '请求异常', desc: String(e.message || e), url: input}]);
        }
    `
};

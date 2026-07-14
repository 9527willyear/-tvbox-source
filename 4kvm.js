var rule = {
    title: '4K影视',
    host: 'https://www.4kvm.top',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.4kvm.top/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
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
    isVideo: 'https://www\\.4kvm\\.top/video/play|\\.m3u8|\\.mp4|\\.flv|\\.ts',
    class_name: '电影&电视剧&动漫',
    class_url: 'movie&tv&anime',
    lazy: `js:
        input = {parse: 1, url: input, header: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', 'Referer': 'https://www.4kvm.top/'}};
    `,
    推荐: `js:
        let html = request(input);
        let d = [];
        pdfa(html, '.movie-card').forEach((it) => {
            let a = pdfa(it, 'a[href^="/play/"]');
            if (!a.length) return;
            let href = pd(a[0], 'a&&href', input);
            let title = pdfh(a[0], 'h3&&Text') || pdfh(it, 'img&&alt') || '';
            let pic = pd(it, 'img&&data-src', input);
            if (pic && pic.includes('gimg0.baidu.com')) {
                let m = pic.match(/src=([^&]+)/);
                if (m) pic = decodeURIComponent(m[1]);
                if (pic && !pic.startsWith('http')) pic = 'https://' + pic;
            }
            let desc = pdfh(it, '.text-gray-400&&Text') || '';
            if (href && title) {
                d.push({title: title, pic_url: pic, desc: desc, url: href});
            }
        });
        setResult(d);
    `,
    一级: `js:
        let html = request(input);
        let d = [];
        pdfa(html, '.movie-card').forEach((it) => {
            let a = pdfa(it, 'a[href^="/play/"]');
            if (!a.length) return;
            let href = pd(a[0], 'a&&href', input);
            let title = pdfh(a[0], 'h3&&Text') || pdfh(it, 'img&&alt') || '';
            let pic = pd(it, 'img&&data-src', input);
            if (pic && pic.includes('gimg0.baidu.com')) {
                let m = pic.match(/src=([^&]+)/);
                if (m) pic = decodeURIComponent(m[1]);
                if (pic && !pic.startsWith('http')) pic = 'https://' + pic;
            }
            let desc = pdfh(it, '.text-gray-400&&Text') || '';
            if (href && title) {
                d.push({title: title, pic_url: pic, desc: desc, url: href});
            }
        });
        setResult(d);
    `,
    二级: `js:
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
        pdfa(html, 'a[href^="/play/"]').forEach((it) => {
            let ep = pdfh(it, 'a&&Text') || pdfh(it, 'img&&alt');
            let href = pd(it, 'a&&href', input);
            if (ep && href) urls.push(ep + '$' + href);
        });
        VOD.vod_play_url = urls.length ? urls.join('#') : (VOD.vod_name + '$' + input);
    `,
    搜索: `js:
        let html = request(input);
        let d = [];
        pdfa(html, '.movie-card').forEach((it) => {
            let a = pdfa(it, 'a[href^="/play/"]');
            if (!a.length) return;
            let href = pd(a[0], 'a&&href', input);
            let title = pdfh(a[0], 'h3&&Text') || pdfh(it, 'img&&alt') || '';
            let pic = pd(it, 'img&&data-src', input);
            if (pic && pic.includes('gimg0.baidu.com')) {
                let m = pic.match(/src=([^&]+)/);
                if (m) pic = decodeURIComponent(m[1]);
                if (pic && !pic.startsWith('http')) pic = 'https://' + pic;
            }
            if (href && title) {
                d.push({title: title, pic_url: pic, desc: '', url: href});
            }
        });
        setResult(d);
    `
};

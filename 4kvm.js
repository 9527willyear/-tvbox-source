var rule = {
    title: '4K影视',
    host: 'https://www.4kvm.top',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://www.4kvm.top/'
    },
    编码: 'utf-8',
    timeout: 10000,
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
        input = {parse: 1, url: input, header: rule.headers};
    `,
    推荐: `js:
        let html = request(input);
        let d = [];
        pdfa(html, '.movie-card').forEach((it) => {
            let href = pd(it, 'a&&href', input);
            if (!href) return;
            d.push({
                title: pdfh(it, 'h3&&Text') || pdfh(it, 'img&&alt'),
                pic_url: pd(it, 'img&&data-src', input),
                desc: pdfh(it, '.text-gray-400&&Text') || '',
                url: href
            });
        });
        setResult(d);
    `,
    一级: `js:
        let html = request(input);
        let d = [];
        pdfa(html, '.movie-card').forEach((it) => {
            let href = pd(it, 'a&&href', input);
            if (!href) return;
            d.push({
                title: pdfh(it, 'h3&&Text') || pdfh(it, 'img&&alt'),
                pic_url: pd(it, 'img&&data-src', input),
                desc: pdfh(it, '.text-gray-400&&Text') || '',
                url: href
            });
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
        pdfa(html, '.episode-link').forEach((it) => {
            let ep = pdfh(it, 'a&&data-episode');
            let href = pd(it, 'a&&href', input);
            if (ep && href) urls.push(ep + '$' + href);
        });
        VOD.vod_play_url = urls.length ? urls.join('#') : (VOD.vod_name + '$' + input);
    `,
    搜索: `js:
        let html = request(input);
        let d = [];
        pdfa(html, 'a[href^="/play/"]').forEach((it) => {
            let href = pd(it, 'a&&href', input);
            if (!href) return;
            d.push({
                title: pdfh(it, 'h3&&Text') || pdfh(it, 'img&&alt'),
                pic_url: pd(it, 'img&&data-src', input),
                desc: '',
                url: href
            });
        });
        setResult(d);
    `
};

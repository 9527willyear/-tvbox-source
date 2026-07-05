var rule = {
    author: 'kimi',
    title: '剧场版',
    类型: '动漫',
    host: 'https://anime.xifanacg.com',
    headers: {'User-Agent': 'Mozilla/5.0'},
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/index.php/ajax/data?mid=1&tid=3&page=1&limit=20',
    url: '/index.php/ajax/data?mid=1&tid=3&page=fypage&limit=20',
    searchUrl: '/index.php/ajax/suggest?mid=1&wd=**&page=fypage&limit=20',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    limit: 20,
    double: false,
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    lazy: `js:
        let html = request(input);
        let m = html.match(/https?:[\\\\/]+[a-zA-Z0-9.%-_\\\\/]+\\.(?:m3u8|mp4|flv|mkv|mov|ts)/gi);
        if (m && m.length > 0) {
            let url = m[0].replace(/\\\\/g, '').replace(/\\\\u([0-9a-fA-F]{4})/g, function(_, hex) { return String.fromCharCode(parseInt(hex, 16)); });
            input = /\\.(m3u8|mp4)/.test(url) ? {jx:0, parse:0, url:url, header:{'User-Agent':'Mozilla/5.0'}} : {jx:0, parse:1, url:input};
        } else {
            input = {jx:0, parse:1, url:input};
        }
    `,
    推荐: `js:
        let json = JSON.parse(request(input));
        let d = [];
        (json.list||[]).forEach(item => d.push({title:item.vod_name, pic_url:item.vod_pic, desc:item.vod_remarks||item.vod_class, url:'/bangumi/'+item.vod_id+'.html'}));
        setResult(d);
    `,
    一级: `js:
        let json = JSON.parse(request(input));
        let d = [];
        (json.list||[]).forEach(item => d.push({title:item.vod_name, pic_url:item.vod_pic, desc:item.vod_remarks||item.vod_class, url:'/bangumi/'+item.vod_id+'.html'}));
        setResult(d);
    `,
    二级: `js:
        let html = request(input);
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h3.slide-info-title&&Text') || pdfh(html, 'title&&Text').split('_')[0];
        VOD.type_name = '动漫';
        VOD.vod_pic = pd(html, 'img.lazy[data-src]&&data-src', input);
        VOD.vod_remarks = pdfh(html, '.public-list-prb&&Text');
        VOD.vod_content = pdfh(html, '.desc&&Text') || pdfh(html, 'meta[name="description"]&&content');
        let tabs = pdfa(html, '.anthology-tab .swiper-slide').map(it => pdfh(it, 'Text').replace(/\\d+$/, '').trim());
        VOD.vod_play_from = tabs.join('$$$');
        let lists = [];
        pdfa(html, '.anthology-list-box').forEach(box => {
            lists.push(pdfa(box, 'body&&a').map(it => pdfh(it, 'a&&Text') + '$' + pd(it, 'a&&href', input)).join('#'));
        });
        VOD.vod_play_url = lists.join('$$$');
    `,
    搜索: `js:
        let json = JSON.parse(request(input));
        let d = [];
        (json.list||[]).forEach(item => d.push({title:item.name, pic_url:item.pic, desc:'', url:'/bangumi/'+item.id+'.html'}));
        setResult(d);
    `,
}

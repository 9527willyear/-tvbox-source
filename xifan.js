var rule = {
    title: '稀饭动漫',
    host: 'https://anime.xifanacg.com',
    url: '/type/fyclass.html###/type/fyclass/page/fypage.html',
    searchUrl: '/search/wd/**.html',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36'
    },
    class_name: '连载新番&完结旧番&剧场版&美漫',
    class_url: '1&2&3&21',
    play_parse: true,
    lazy: `js:
        let html = request(input);
        let m = html.match(/https?:[\\\\/]+[a-zA-Z0-9.%-_\\\\/]+\\.(?:m3u8|mp4|mkv|flv)/gi);
        if (m && m.length > 0) {
            let url = m[0].replace(/\\\\/g, '');
            url = url.replace(/\\\\u([0-9a-fA-F]{4})/g, function(_, hex) { return String.fromCharCode(parseInt(hex, 16)); });
            input = url;
        }
    `,
    limit: 6,
    推荐: '.public-list-box;a&&title;img&&data-src;.time-title&&Text;a&&href',
    一级: '.public-list-box;a&&title;img&&data-src;.time-title&&Text;a&&href',
    二级: {
        title: 'h1&&Text',
        img: 'img.lazy[data-src]&&data-src',
        desc: '.desc&&Text',
        content: '.desc&&Text',
        tabs: '.anthology-tab .swiper-slide',
        lists: '.anthology-list-box:eq(#id) a',
        tab_text: 'body&&Text',
        list_text: 'body&&Text',
        list_url: 'a&&href'
    },
    搜索: '.public-list-box;a&&title;img&&data-src;.time-title&&Text;a&&href',
}

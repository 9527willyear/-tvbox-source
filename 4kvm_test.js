var rule = {
    title: '4K影视测试',
    host: 'https://www.4kvm.top',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
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
    isVideo: '4kvm\\.top/video/play|\\.m3u8|\\.mp4|\\.flv',
    class_name: '电影&电视剧&动漫',
    class_url: 'movie&tv&anime',
    lazy: `js:
        input = {parse: 1, url: input, header: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://www.4kvm.top/'}};
    `,
    推荐: `js:
        setResult([
            {title: '测试影片A', pic_url: '', desc: '固定数据测试', url: '/play/ch4alqj33'},
            {title: '测试影片B', pic_url: '', desc: '固定数据测试', url: '/play/ch47wchlp'}
        ]);
    `,
    一级: `js:
        setResult([
            {title: '分类测试A', pic_url: '', desc: '固定数据测试', url: '/play/ch4alqj33'},
            {title: '分类测试B', pic_url: '', desc: '固定数据测试', url: '/play/ch47wchlp'}
        ]);
    `,
    二级: `js:
        VOD = {
            vod_id: input,
            vod_name: '测试影片',
            vod_pic: '',
            type_name: '测试',
            vod_remarks: '固定数据',
            vod_content: '这是一个测试，用于确认 TVBox 能正常显示规则数据',
            vod_play_from: '测试线路',
            vod_play_url: '第1集$' + input
        };
    `,
    搜索: `js:
        setResult([
            {title: '搜索结果A', pic_url: '', desc: '固定数据测试', url: '/play/ch4alqj33'}
        ]);
    `
};

var rule = {
    title: '老的电影网静态',
    host: 'https://gitee.com',
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/willyear/tvbox-source/raw/master/laodedy_data.txt',
    url: '',
    searchUrl: '',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    limit: 24,
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    class_name: '电影&电视剧&动漫&综艺&短剧&日韩动漫',
    class_url: '电影&电视剧&动漫&综艺&短剧&日韩动漫',
    推荐: `js:
        let json = JSON.parse(request(rule.host + rule.homeUrl));
        let d = (json.list || []).slice(0, 24).map(v => ({
            title: v.vod_name,
            pic_url: v.vod_pic,
            desc: v.vod_remarks,
            url: v.vod_id
        }));
        setResult(d);
    `,
    一级: `js:
        let json = JSON.parse(request(rule.host + rule.homeUrl));
        let cate = typeof MY_CATE !== 'undefined' ? MY_CATE : '电影';
        let d = (json.list || []).filter(v => v.type_name === cate).map(v => ({
            title: v.vod_name,
            pic_url: v.vod_pic,
            desc: v.vod_remarks,
            url: v.vod_id
        }));
        setResult(d);
    `,
    二级: `js:
        let json = JSON.parse(request(rule.host + rule.homeUrl));
        let id = input;
        let v = (json.list || []).find(x => x.vod_id === id);
        VOD = v ? v : {};
        if (!VOD.vod_id) VOD.vod_id = id;
    `,
    搜索: `js:
        let json = JSON.parse(request(rule.host + rule.homeUrl));
        let kw = typeof KEY !== 'undefined' ? KEY : '';
        let d = (json.list || []).filter(v => v.vod_name && v.vod_name.toLowerCase().includes(kw.toLowerCase())).map(v => ({
            title: v.vod_name,
            pic_url: v.vod_pic,
            desc: v.vod_remarks,
            url: v.vod_id
        }));
        setResult(d);
    `,
    lazy: `js:
        let json = JSON.parse(request(rule.host + rule.homeUrl));
        let id = input;
        if (id.indexOf('http') !== 0) id = 'http://www.laodedy.com' + id;
        let v = (json.list || []).find(x => x.vod_id === id);
        if (v && v.vod_play_url) {
            let first = v.vod_play_url.split('$$$')[0].split('#')[0].split('$')[1];
            if (first && first.indexOf('http') === 0) {
                input = { parse: 0, url: first };
            } else {
                input = { parse: 1, url: id };
            }
        } else {
            input = { parse: 1, url: id };
        }
    `
}

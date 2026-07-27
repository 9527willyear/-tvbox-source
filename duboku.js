var rule = {
    title: '独播库',
    host: 'https://www.duboku.lv',
    url: '/t/fyclass.html?page=fypage',
    searchUrl: '/s/**-------------.html',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://www.duboku.lv/'
    },
    编码: 'utf-8',
    play_parse: true,
    lazy: '',
    limit: 6,
    double: false,
    class_name: '电影&剧集&综艺&动漫',
    class_url: '1&2&3&4',
    推荐: `js:
        var d = [];
        try {
            var html = request(input);
            var list = pdfa(html, '.module-poster-item');
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var title = pdfh(item, 'a&&title');
                var pic = pdfh(item, 'img&&data-original');
                if (!pic) pic = pdfh(item, 'img&&src');
                if (pic && !pic.startsWith('http')) pic = rule.host + pic;
                var url = pdfh(item, 'a&&href');
                var desc = pdfh(item, '.module-item-note&&Text');
                if (title && url) {
                    d.push({title: title, pic_url: pic, desc: desc, url: url});
                }
            }
        } catch (e) {}
        setResult(d);
    `,
    一级: `js:
        var d = [];
        try {
            var html = request(input);
            var list = pdfa(html, '.module-poster-item');
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var title = pdfh(item, 'a&&title');
                var pic = pdfh(item, 'img&&data-original');
                if (!pic) pic = pdfh(item, 'img&&src');
                if (pic && !pic.startsWith('http')) pic = rule.host + pic;
                var url = pdfh(item, 'a&&href');
                var desc = pdfh(item, '.module-item-note&&Text');
                if (title && url) {
                    d.push({title: title, pic_url: pic, desc: desc, url: url});
                }
            }
        } catch (e) {}
        setResult(d);
    `,
    二级: `js:
        VOD = {};
        try {
            var fullUrl = input;
            if (!fullUrl.startsWith('http')) {
                fullUrl = rule.host + fullUrl;
            }
            var html = request(fullUrl);
            VOD.vod_id = input;
            VOD.vod_name = pdfh(html, 'h1&&Text') || '未知';
            VOD.vod_pic = pdfh(html, '.module-item-pic&&img&&data-original') || '';
            if (VOD.vod_pic && !VOD.vod_pic.startsWith('http')) VOD.vod_pic = rule.host + VOD.vod_pic;
            VOD.vod_content = pdfh(html, '.module-info-introduction&&Text') || '';
            
            // 获取视频ID
            var vid = '';
            var vMatch = fullUrl.match(/\/v\/(\d+)\.html/);
            if (vMatch) {
                vid = vMatch[1];
            }
            
            // 用正则解析集数，避免 pdfa 兼容问题
            var episodes = [];
            if (vid) {
                var epMatches = html.matchAll(/<span>第(\d+)集<\/span>/g);
                var seen = new Set();
                for (var m of epMatches) {
                    var num = m[1];
                    if (!seen.has(num)) {
                        seen.add(num);
                        episodes.push('第' + num + '集$/p/' + vid + '-1-' + num + '.html');
                    }
                }
            }
            
            VOD.vod_play_from = '默认线路';
            VOD.vod_play_url = episodes.length > 0 ? episodes.join('#') : '暂无集数$http://localhost';
        } catch (e) {
            VOD.vod_name = '详情错误:' + e.message;
            VOD.vod_play_from = '调试';
            VOD.vod_play_url = '错误$http://localhost';
        }
        setResult(VOD);
    `,
    搜索: `js:
        var d = [];
        try {
            var html = request(input);
            var list = pdfa(html, '.module-poster-item');
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var title = pdfh(item, 'a&&title');
                var pic = pdfh(item, 'img&&data-original');
                if (!pic) pic = pdfh(item, 'img&&src');
                if (pic && !pic.startsWith('http')) pic = rule.host + pic;
                var url = pdfh(item, 'a&&href');
                var desc = pdfh(item, '.module-item-note&&Text');
                if (title && url) {
                    d.push({title: title, pic_url: pic, desc: desc, url: url});
                }
            }
        } catch (e) {}
        setResult(d);
    `,
    lazy: `js:
        try {
            var html = request(input);
            var playerMatch = html.match(/var player_aaaa=([^;]+);/);
            if (playerMatch) {
                var player = JSON.parse(playerMatch[1]);
                if (player.url) {
                    input = {parse: 1, url: player.url, header: rule.headers};
                }
            }
        } catch (e) {}
        setResult(input);
    `
};

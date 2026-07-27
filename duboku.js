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
                var url = pdfh(item, 'a&&href');
                var desc = pdfh(item, '.module-item-note&&Text');
                if (title && url) {
                    d.push({
                        title: title,
                        pic_url: pic,
                        desc: desc,
                        url: url
                    });
                }
            }
        } catch (e) {
            d.push({title: '推荐错误:' + e.message, url: 'http://localhost', pic_url: '', desc: ''});
        }
        if (d.length === 0) {
            d.push({title: '推荐无数据', url: 'http://localhost', pic_url: '', desc: '检查网络或规则'});
        }
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
                var url = pdfh(item, 'a&&href');
                var desc = pdfh(item, '.module-item-note&&Text');
                if (title && url) {
                    d.push({
                        title: title,
                        pic_url: pic,
                        desc: desc,
                        url: url
                    });
                }
            }
        } catch (e) {
            d.push({title: '分类错误:' + e.message, url: 'http://localhost', pic_url: '', desc: ''});
        }
        if (d.length === 0) {
            d.push({title: '分类无数据:' + input, url: 'http://localhost', pic_url: '', desc: '检查翻页格式'});
        }
        setResult(d);
    `,
    二级: `js:
        try {
            var html = request(input);
            VOD = {};
            VOD.vod_id = input;
            VOD.vod_name = pdfh(html, 'h1&&Text') || pdfh(html, '.module-info-heading&&h1&&Text') || '未知';
            VOD.vod_pic = pdfh(html, '.module-item-pic&&img&&data-original') || pdfh(html, '.module-item-pic&&img&&src');
            VOD.vod_remarks = pdfh(html, '.module-info-item-content&&Text') || '';
            VOD.vod_year = pdfh(html, '.module-info-tag-link&&Text') || '';
            VOD.vod_area = pdfh(html, '.module-info-tag-link:eq(1)&&Text') || '';
            VOD.vod_actor = pdfh(html, '.module-info-item:contains(主演)&&Text') || '';
            VOD.vod_director = pdfh(html, '.module-info-item:contains(导演)&&Text') || '';
            VOD.vod_content = pdfh(html, '.module-info-introduction&&Text') || '';

            var playFrom = [];
            var playUrl = [];
            var episodes = [];
            
            var links = pdfa(html, '.module-play-list-link');
            if (links.length > 0) {
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    var epUrl = pdfh(link, 'a&&href');
                    var epName = pdfh(link, 'span&&Text') || pdfh(link, 'a&&title');
                    if (epUrl) {
                        episodes.push(epName + '$' + epUrl);
                    }
                }
            }
            
            if (episodes.length === 0) {
                var idMatch = input.match(/\/v\/(\d+)\.html/);
                if (idMatch) {
                    var vid = idMatch[1];
                    var count = links.length || 1;
                    for (var j = 1; j <= count; j++) {
                        episodes.push('第' + j + '集$/p/' + vid + '-1-' + j + '.html');
                    }
                }
            }
            
            if (episodes.length > 0) {
                playFrom.push('独播库');
                playUrl.push(episodes.join('#'));
            } else {
                playFrom.push('独播库');
                playUrl.push('暂无集数$http://localhost');
            }
            
            VOD.vod_play_from = playFrom.join('$$$');
            VOD.vod_play_url = playUrl.join('$$$');
        } catch (e) {
            VOD = {vod_name: '详情错误:' + e.message, vod_play_from: '独播库', vod_play_url: '错误$http://localhost'};
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
                var url = pdfh(item, 'a&&href');
                var desc = pdfh(item, '.module-item-note&&Text');
                if (title && url) {
                    d.push({
                        title: title,
                        pic_url: pic,
                        desc: desc,
                        url: url
                    });
                }
            }
        } catch (e) {
            d.push({title: '搜索错误:' + e.message, url: 'http://localhost', pic_url: '', desc: ''});
        }
        if (d.length === 0) {
            d.push({title: '搜索无数据', url: 'http://localhost', pic_url: '', desc: ''});
        }
        setResult(d);
    `,
    lazy: `js:
        try {
            var html = request(input);
            var playerMatch = html.match(/var player_aaaa=([^;]+);/);
            if (playerMatch) {
                var player = JSON.parse(playerMatch[1]);
                if (player.url) {
                    input = {parse: 0, url: player.url, header: rule.headers};
                }
            }
        } catch (e) {
            input = {parse: 0, url: 'http://localhost', header: rule.headers};
        }
        setResult(input);
    `
};

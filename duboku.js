var rule = {
    title: '独播库',
    host: 'https://xn--dxts9ku0n.com',
    url: '/t/fyclass.html',
    filter_url: '/t/fyclass-fypage.html',
    searchUrl: '/s/**-------------.html',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://xn--dxts9ku0n.com/'
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
        setResult(d);
    `,
    一级: `js:
        var d = [];
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
        setResult(d);
    `,
    二级: `js:
        var html = request(input);
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h1&&Text') || pdfh(html, '.module-info-heading&&h1&&Text');
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
        
        // 尝试从播放列表获取集数
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
        
        // 如果链接为空，根据标题生成集数URL
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
        }
        
        VOD.vod_play_from = playFrom.join('$$$');
        VOD.vod_play_url = playUrl.join('$$$');
        setResult(VOD);
    `,
    搜索: `js:
        var d = [];
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
        setResult(d);
    `,
    lazy: `js:
        var html = request(input);
        var playerMatch = html.match(/var player_aaaa=([^;]+);/);
        if (playerMatch) {
            var player = JSON.parse(playerMatch[1]);
            if (player.url) {
                input = {parse: 0, url: player.url, header: rule.headers};
            }
        }
        setResult(input);
    `
};

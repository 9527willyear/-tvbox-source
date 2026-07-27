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
                if (pic && !pic.startsWith('http')) pic = rule.host + pic;
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
        var VOD = {};
        try {
            var html = request(input);
            VOD.vod_id = input;
            VOD.vod_name = pdfh(html, 'h1&&Text') || pdfh(html, '.module-info-heading&&h1&&Text') || pdfh(html, '.module-poster-item-title&&Text') || '未知';
            VOD.vod_pic = pdfh(html, '.module-item-pic&&img&&data-original') || pdfh(html, '.module-item-pic&&img&&src') || pdfh(html, '.module-poster-item&&img&&data-original');
            if (VOD.vod_pic && !VOD.vod_pic.startsWith('http')) VOD.vod_pic = rule.host + VOD.vod_pic;
            VOD.vod_year = pdfh(html, '.module-info-tag-link&&Text') || '';
            VOD.vod_area = pdfh(html, '.module-info-tag-link:eq(1)&&Text') || '';
            VOD.vod_actor = pdfh(html, '.module-info-item:contains(主演)&&Text') || '';
            VOD.vod_director = pdfh(html, '.module-info-item:contains(导演)&&Text') || '';
            VOD.vod_content = pdfh(html, '.module-info-introduction&&Text') || '';

            // 获取视频ID
            var vid = '';
            var vMatch = input.match(/\/v\/(\d+)\.html/);
            var pMatch = input.match(/\/p\/(\d+)-/);
            var playerMatch = html.match(/var player_aaaa=([^;]+);/);
            if (vMatch) {
                vid = vMatch[1];
            } else if (pMatch) {
                vid = pMatch[1];
            } else if (playerMatch) {
                try {
                    var player = JSON.parse(playerMatch[1]);
                    vid = player.id || '';
                } catch (e) {}
            }

            // 获取线路名称
            var sourceNames = [];
            var tabItems = pdfa(html, '.module-tab-item');
            for (var t = 0; t < tabItems.length; t++) {
                var name = pdfh(tabItems[t], 'span&&Text') || pdfh(tabItems[t], 'a&&Text') || '';
                name = name.replace(/\d+$/, '').trim();
                if (name) sourceNames.push(name);
            }

            // 获取播放面板
            var panels = pdfa(html, '.module-list.sort-list.tab-list');
            if (panels.length === 0) {
                panels = pdfa(html, '.module-play-list');
            }

            var playFrom = [];
            var playUrl = [];
            for (var p = 0; p < panels.length; p++) {
                var links = pdfa(panels[p], '.module-play-list-link');
                if (links.length === 0) continue;
                var episodes = [];
                for (var i = 0; i < links.length; i++) {
                    var epUrl = pdfh(links[i], 'a&&href');
                    var epName = pdfh(links[i], 'span&&Text') || pdfh(links[i], 'a&&title');
                    epName = epName.replace(/播放.*第/, '第').replace(/播放.*第/, '第');
                    if (epUrl && epUrl.indexOf('/p/') === 0) {
                        episodes.push(epName + '$' + epUrl);
                    } else {
                        episodes.push(epName + '$/p/' + vid + '-' + (p + 1) + '-' + (i + 1) + '.html');
                    }
                }
                if (episodes.length > 0) {
                    var sourceName = sourceNames[p] || ('线路' + (p + 1));
                    playFrom.push(sourceName);
                    playUrl.push(episodes.join('#'));
                }
            }

            if (playFrom.length === 0) {
                playFrom.push('调试');
                playUrl.push('input:' + input + '$http://localhost' + '#vid:' + vid + '$http://localhost' + '#html_len:' + html.length + '$http://localhost' + '#tabs:' + tabItems.length + '$http://localhost' + '#panels:' + panels.length + '$http://localhost');
            }
            VOD.vod_play_from = playFrom.join('$$$');
            VOD.vod_play_url = playUrl.join('$$$');
        } catch (e) {
            VOD = {vod_name: '详情错误:' + e.message, vod_play_from: '调试', vod_play_url: '错误$http://localhost'};
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
                    var playHeaders = {
                        'User-Agent': rule.headers['User-Agent'],
                        'Referer': input,
                        'Origin': rule.host
                    };
                    // 先尝试让 TVBox 自己解析播放
                    input = {parse: 1, url: player.url, header: playHeaders};
                }
            }
        } catch (e) {
            input = {parse: 0, url: 'http://localhost', header: rule.headers};
        }
        setResult(input);
    `
};

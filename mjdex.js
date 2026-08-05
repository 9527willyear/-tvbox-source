var rule = {
    title: '美剧天堂',
    host: 'https://mjdex.cc',
    url: '/vod/show/id/fyclass/page/fypage.html',
    searchUrl: '/vod/search.html?wd=**',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://mjdex.cc/'
    },
    编码: 'utf-8',
    play_parse: true,
    lazy: '',
    limit: 6,
    double: false,
    class_name: '剧集&电影',
    class_url: '20&21',
    推荐: `js:
        var d = [];
        try {
            var html = request(input);
            var list = pdfa(html, '.a-con-inner');
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var title = pdfh(item, '.pic&&a&&title') || pdfh(item, '.s1&&a&&title');
                var pic = pdfh(item, '.pic&&img&&data-src') || pdfh(item, '.pic&&img&&data-original') || pdfh(item, '.pic&&img&&src');
                if (pic && !pic.startsWith('http')) pic = rule.host + pic;
                var url = pdfh(item, '.pic&&a&&href') || pdfh(item, '.s1&&a&&href');
                var desc = pdfh(item, '.s4&&Text') || pdfh(item, '.s2&&Text') || '';
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
            var list = pdfa(html, '.a-con-inner');
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var title = pdfh(item, '.pic&&a&&title') || pdfh(item, '.s1&&a&&title');
                var pic = pdfh(item, '.pic&&img&&data-src') || pdfh(item, '.pic&&img&&data-original') || pdfh(item, '.pic&&img&&src');
                if (pic && !pic.startsWith('http')) pic = rule.host + pic;
                var url = pdfh(item, '.pic&&a&&href') || pdfh(item, '.s1&&a&&href');
                var desc = pdfh(item, '.s4&&Text') || pdfh(item, '.s2&&Text') || '';
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
            VOD.vod_name = pdfh(html, 'h1.tit&&Text') || pdfh(html, 'h1&&Text') || '未知';
            VOD.vod_pic = pdfh(html, '.pic&&img&&data-src') || pdfh(html, '.pic&&img&&data-original') || pdfh(html, '.pic&&img&&src');
            if (VOD.vod_pic && !VOD.vod_pic.startsWith('http')) VOD.vod_pic = rule.host + VOD.vod_pic;
            VOD.vod_remarks = pdfh(html, '.vod_score&&Text') || '';
            VOD.vod_year = pdfh(html, '.p1&&a:eq(3)&&Text') || '';
            VOD.vod_area = pdfh(html, '.p1&&a:eq(4)&&Text') || '';
            VOD.vod_actor = pdfh(html, '.actor&&Text') || '';
            VOD.vod_director = pdfh(html, '.director&&Text') || '';
            VOD.vod_content = pdfh(html, '.ysinfo&&Text') || '';

            // 从详情页拿第一个播放地址
            var playLink = pdfh(html, '.pic&&a&&href') || pdfh(html, 'a[href*="/vod/play/"]&&href');
            if (!playLink) {
                VOD.vod_play_from = '美剧天堂';
                VOD.vod_play_url = '暂无集数$http://localhost';
            } else {
                if (!playLink.startsWith('http')) playLink = rule.host + playLink;
                var playHtml = request(playLink);
                
                // 解析线路和集数
                var sourceNames = [];
                var sourceLinks = playHtml.matchAll(/<a[^>]*href=\"(\/vod\/play\/id\/(\d+)\/sid\/(\d+)\/nid\/1\.html)\"[^>]*>([^<]+)<\/a>/gi);
                var seenSid = new Set();
                for (var m of sourceLinks) {
                    var sid = m[3];
                    var name = m[4].trim();
                    if (name && name !== '第1集' && !seenSid.has(sid)) {
                        seenSid.add(sid);
                        sourceNames.push({sid: sid, name: name});
                    }
                }
                
                if (sourceNames.length === 0) {
                    sourceNames = [{sid: '1', name: '默认线路'}];
                }
                
                for (var s = 0; s < sourceNames.length; s++) {
                    var sid = sourceNames[s].sid;
                    var name = sourceNames[s].name;
                    var epUrl = rule.host + '/vod/play/id/' + fullUrl.match(/id\/(\d+)/)[1] + '/sid/' + sid + '/nid/1.html';
                    var epHtml = request(epUrl);
                    
                    var episodes = [];
                    var epMatches = epHtml.matchAll(/<a[^>]*href=\"(\/vod\/play\/id\/\d+\/sid\/\d+\/nid\/\d+\.html)\"[^>]*>(第\d+集|第\d+话|HD[^<]*|DVD[^<]*|TC[^<]*|TS[^<]*|TC720P|HD720P|HD1080P|正片|预告|花絮|特辑)<\/a>/gi);
                    var seenEp = new Set();
                    for (var m of epMatches) {
                        var url = m[1];
                        var epName = m[2].trim();
                        if (!seenEp.has(url)) {
                            seenEp.add(url);
                            episodes.push(epName + '$' + url);
                        }
                    }
                    
                    if (episodes.length > 0) {
                        playFrom.push(name);
                        playUrl.push(episodes.join('#'));
                    }
                }
                
                if (playFrom.length === 0) {
                    playFrom.push('美剧天堂');
                    playUrl.push('暂无集数$http://localhost');
                }
            }
            
            VOD.vod_play_from = playFrom.join('$$$');
            VOD.vod_play_url = playUrl.join('$$$');
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
            var list = pdfa(html, '.a-con-inner');
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var title = pdfh(item, '.pic&&a&&title') || pdfh(item, '.s1&&a&&title');
                var pic = pdfh(item, '.pic&&img&&data-src') || pdfh(item, '.pic&&img&&data-original') || pdfh(item, '.pic&&img&&src');
                if (pic && !pic.startsWith('http')) pic = rule.host + pic;
                var url = pdfh(item, '.pic&&a&&href') || pdfh(item, '.s1&&a&&href');
                var desc = pdfh(item, '.s4&&Text') || pdfh(item, '.s2&&Text') || '';
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
            var playerMatch = html.match(/var player_aaaa=\{([^;]+)\}/);
            if (playerMatch) {
                var player = JSON.parse('{' + playerMatch[1] + '}');
                if (player.url) {
                    var playHeaders = {
                        'User-Agent': rule.headers['User-Agent'],
                        'Referer': input,
                        'Origin': rule.host
                    };
                    input = {parse: 0, url: player.url, header: playHeaders};
                }
            }
        } catch (e) {}
        setResult(input);
    `
};

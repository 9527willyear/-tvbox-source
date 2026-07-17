rule = {
    title: '歪比巴卜',
    host: 'https://wbbb1.com',
    url: '/type/{cateId}-{page}.html',
    searchUrl: '/search/{key}----------{page}---.html',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    class_name: '电影&剧集&动漫&综艺',
    class_url: '1&2&3&4',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://wbbb1.com'
    },
    play_parse: true,
    lazy: function(page, sign, sn) {
        let html = request(input);
        let url = '';
        let match = html.match(/player_aaaa\s*=\s*({[^;]+})/);
        if (match) {
            try {
                let data = JSON.parse(match[1].replace(/\\/g, '\\\\').replace(/\\\//g, '/'));
                url = data.url || '';
            } catch(e) {}
        }
        if (!url) {
            let m = html.match(/https?:\/\/[^"'\s]+\.(m3u8|mp4)[^"'\s]*/i);
            if (m) url = m[0];
        }
        if (url) {
            input = { parse: 0, url: url, js: '' };
        } else {
            input = { parse: 1, url: input, js: '' };
        }
    },
    一级: function(page) {
        let html = request(input);
        let list = [];
        let items = pdfa(html, '.module-poster-item');
        items.forEach(function(item) {
            let title = pdfh(item, '.module-poster-item-title@text');
            let link = pdfh(item, 'a@href');
            let img = pdfh(item, 'img.lazy@data-original');
            let note = pdfh(item, '.module-item-note@text');
            if (!img || img === '/mxtheme/images/load.gif') {
                img = pdfh(item, 'img.lazy@src');
            }
            if (title && link) {
                list.push({
                    title: title,
                    link: link,
                    img: img || '',
                    desc: note || ''
                });
            }
        });
        return list;
    },
    二级: function() {
        let html = request(input);
        let doc = pd(html);
        let title = pdfh(doc, 'title@text').replace('详情介绍 - ', '').replace(/-.*$/, '').trim();
        let img = pdfh(doc, '.module-player-pic img@src') || pdfh(doc, '.module-item-pic img@data-original');
        let type = pdfh(doc, '.module-info-tag@text') || '';
        let area = pdfh(doc, '.module-info-item:contains(地区)@text') || '';
        let year = pdfh(doc, '.module-info-item:contains(年份)@text') || '';
        let desc = pdfh(doc, '.module-info-content@text') || pdfh(doc, '.show-desc@text') || '';
        let actor = pdfh(doc, '.module-info-item:contains(主演)@text') || '';
        let director = pdfh(doc, '.module-info-item:contains(导演)@text') || '';
        let category = pdfh(doc, '.module-info-tag@text') || '';
        let vod = {
            title: title,
            img: img || '',
            desc: desc.replace(/\s+/g, ' ').trim(),
            type_name: category,
            year: year.replace(/\D/g, ''),
            actor: actor,
            director: director
        };
        let playFrom = [];
        let episodes = [];
        let sourceTabs = pdfa(doc, '.module-tab-item');
        if (sourceTabs.length > 0) {
            sourceTabs.forEach(function(tab) {
                let sourceName = pdfh(tab, '@data-dropdown-value') || pdfh(tab, '@text');
                playFrom.push(sourceName);
            });
        } else {
            playFrom.push('BF有广1');
        }
        let epItems = pdfa(doc, '.module-play-list a');
        if (epItems.length > 0) {
            epItems.forEach(function(ep) {
                let epLink = pdfh(ep, '@href');
                let epName = pdfh(ep, '@text') || pdfh(ep, 'span@text');
                if (epLink && epName) {
                    episodes.push(epLink + '$' + epName);
                }
            });
        }
        if (episodes.length === 0) {
            episodes.push(input + '$HD');
        }
        vod.vod_play_from = playFrom.join('$$$');
        vod.vod_play_url = episodes.join('#');
        return vod;
    },
    搜索: function(page) {
        let html = request(input);
        let list = [];
        let items = pdfa(html, '.module-poster-item');
        items.forEach(function(item) {
            let title = pdfh(item, '.module-poster-item-title@text');
            let link = pdfh(item, 'a@href');
            let img = pdfh(item, 'img.lazy@data-original');
            let note = pdfh(item, '.module-item-note@text');
            if (title && link) {
                list.push({
                    title: title,
                    link: link,
                    img: img || '',
                    desc: note || ''
                });
            }
        });
        return list;
    }
};

var rule = {
    author: 'kimi',
    title: '剧OK',
    类型: '影视',
    host: 'https://juok1.top',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://juok1.top/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/api/filter?catId=1&page=fypage&size=24',
    url: '/api/filter?catId=fyclass&page=fypage&size=24',
    searchUrl: '/api/search?q=**&page=fypage',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    limit: 24,
    double: false,
    class_name: '电影&电视剧&综艺&动漫',
    class_url: '1&2&3&4',
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    lazy: `js:
        let inputUrl = input;
        if (inputUrl.startsWith('juok://')) {
            let parts = inputUrl.replace('juok://', '').split('|');
            let vodId = parts[0] || '';
            let source = parts[1] || 'youku';
            let playUrl = parts[2] || '';
            if (!playUrl) {
                input = { jx: 0, parse: 1, url: inputUrl };
            } else {
                let apiUrl = rule.host + '/api/player/resolve';
                let body = JSON.stringify({
                    playUrl: playUrl,
                    statVodId: vodId,
                    statSource: source,
                    statVodName: ''
                });
                let html = request(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Player-Request': '1',
                        'User-Agent': rule.headers['User-Agent'],
                        'Referer': rule.headers['Referer']
                    },
                    body: body
                });
                let json = JSON.parse(html);
                if (json.success && json.url) {
                    input = { jx: 0, parse: 0, url: json.url, header: {'User-Agent': rule.headers['User-Agent'], 'Referer': rule.headers['Referer']} };
                } else {
                    input = { jx: 0, parse: 1, url: playUrl };
                }
            }
        } else {
            input = { jx: 0, parse: 1, url: inputUrl };
        }
    `,
    推荐: `js:
        let html = request(input);
        let json = JSON.parse(html);
        let d = [];
        if (json.movies) {
            let cat = '1';
            try { cat = input.match(/catId=(\d+)/)[1]; } catch(e) {}
            json.movies.forEach(item => {
                let pic = item.cover || item.cdncover || '';
                if (pic.startsWith('//')) pic = 'https:' + pic;
                let desc = item.upinfo ? '更新至' + item.upinfo + '集' : (item.total ? '全' + item.total + '集' : '');
                d.push({
                    title: item.title,
                    pic_url: pic,
                    desc: desc,
                    url: rule.host + '/api/detail?cat=' + cat + '&id=' + item.id
                });
            });
        }
        setResult(d);
    `,
    一级: `js:
        let html = request(input);
        let json = JSON.parse(html);
        let d = [];
        if (json.movies) {
            let cat = MY_CATE || '1';
            json.movies.forEach(item => {
                let pic = item.cover || item.cdncover || '';
                if (pic.startsWith('//')) pic = 'https:' + pic;
                let desc = item.upinfo ? '更新至' + item.upinfo + '集' : (item.total ? '全' + item.total + '集' : '');
                d.push({
                    title: item.title,
                    pic_url: pic,
                    desc: desc,
                    url: rule.host + '/api/detail?cat=' + cat + '&id=' + item.id
                });
            });
        }
        setResult(d);
    `,
    二级: `js:
        let html = request(input);
        let json = JSON.parse(html);
        VOD = {};
        if (!json.data) {
            VOD.vod_name = '未找到';
        } else {
            let data = json.data;
            VOD.vod_id = data.ent_id || data.id;
            VOD.vod_name = data.title;
            VOD.type_name = (data.moviecategory || []).join(',') || '影视';
            VOD.vod_pic = data.cdncover || '';
            if (VOD.vod_pic.startsWith('//')) VOD.vod_pic = 'https:' + VOD.vod_pic;
            VOD.vod_remarks = data.upinfo ? '更新至' + data.upinfo + '集' : (data.total ? '全' + data.total + '集' : '');
            VOD.vod_year = data.pubdate || '';
            VOD.vod_area = (data.area || []).join(',') || '';
            VOD.vod_actor = (data.actor || []).join(',') || '';
            VOD.vod_director = (data.director || []).join(',') || '';
            VOD.vod_content = data.description || '';
            
            let sites = data.playlink_sites || [];
            let tabs = [];
            let lists = [];
            sites.forEach(site => {
                tabs.push(site);
                let episodes = [];
                let epList = data.allepidetail && data.allepidetail[site] ? data.allepidetail[site] : (data.defaultepisode || []);
                if (epList && epList.length > 0) {
                    epList.forEach(ep => {
                        let playUrl = ep.url || '';
                        let epName = '';
                        if (ep.period) {
                            epName = ep.period;
                        } else if (ep.name && ep.playlink_num) {
                            epName = '第' + ep.playlink_num + '集 ' + ep.name;
                        } else if (ep.playlink_num) {
                            epName = '第' + ep.playlink_num + '集';
                        } else {
                            epName = ep.name || '播放';
                        }
                        let epId = data.ent_id || data.id;
                        let realUrl = 'juok://' + epId + '|' + site + '|' + playUrl;
                        episodes.push(epName + '$' + realUrl);
                    });
                } else if (data.playlinksdetail && data.playlinksdetail[site]) {
                    let pd = data.playlinksdetail[site];
                    let playUrl = pd.default_url || (data.playlinks ? data.playlinks[site] : '');
                    let epId = data.ent_id || data.id;
                    let realUrl = 'juok://' + epId + '|' + site + '|' + playUrl;
                    episodes.push('播放$' + realUrl);
                } else if (data.playlinks && data.playlinks[site]) {
                    let epId = data.ent_id || data.id;
                    let realUrl = 'juok://' + epId + '|' + site + '|' + data.playlinks[site];
                    episodes.push('播放$' + realUrl);
                }
                lists.push(episodes.join('#'));
            });
            VOD.vod_play_from = tabs.join('$$$');
            VOD.vod_play_url = lists.join('$$$');
        }
    `,
    搜索: `js:
        let html = request(input);
        let json = JSON.parse(html);
        let d = [];
        if (json.results) {
            json.results.forEach(item => {
                if (!item.en_id) return;
                let pic = item.cover || '';
                if (pic.startsWith('//')) pic = 'https:' + pic;
                let desc = item.coverInfo && item.coverInfo.txt ? item.coverInfo.txt : (item.year || '');
                d.push({
                    title: item.titleTxt || item.title,
                    pic_url: pic,
                    desc: desc,
                    url: rule.host + '/api/detail?cat=' + item.cat_id + '&id=' + item.en_id
                });
            });
        }
        setResult(d);
    `,
}

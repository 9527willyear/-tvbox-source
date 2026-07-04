var rule = {
    author: 'kimi',
    title: '歪比巴卜',
    类型: '影视',
    host: 'https://wbbb1.com',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://wbbb1.com/'
    },
    编码: 'utf-8',
    timeout: 10000,
    homeUrl: '/type/1.html',
    url: '/type/fyclass.html',
    searchUrl: '/search/**-------------.html',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    limit: 24,
    double: false,
    class_name: '电影&剧集&动漫&综艺',
    class_url: '1&2&3&4',
    play_parse: true,
    sniffer: 0,
    isVideo: 'http((?!http).){26,}\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)',
    lazy: `js:
        function wbbbBtoa(s) { try { return btoa(s); } catch (e) { return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(s)); } }
        function wbbbAtob(s) { try { return atob(s); } catch (e) { return CryptoJS.enc.Base64.parse(s).toString(CryptoJS.enc.Latin1); } }
        function wbbbCalculate(s) { return (CryptoJS.MD5(s).toString() + ' P').slice(-22); }
        function wbbbCalculatee(s) { return CryptoJS.MD5(s).toString(); }
        function wbbbAesplay(keyStr, dataStr) {
            var S = [], i, j, tmp;
            for (i = 0; i < 256; i++) S[i] = i;
            j = 0;
            for (i = 0; i < 256; i++) {
                j = (j + S[i] + keyStr.charCodeAt(i % keyStr.length)) % 256;
                tmp = S[i]; S[i] = S[j]; S[j] = tmp;
            }
            i = 0; j = 0; var out = '';
            for (var k = 0; k < dataStr.length; k++) {
                i = (i + 1) % 256;
                j = (j + S[i]) % 256;
                tmp = S[i]; S[i] = S[j]; S[j] = tmp;
                var t = (S[i] + S[j]) % 256;
                out += String.fromCharCode(dataStr.charCodeAt(k) ^ S[t]);
            }
            return out;
        }
        function wbbbEnplay(u, plain) { return wbbbBtoa(wbbbAesplay(wbbbCalculate(u), plain)); }
        function wbbbDeplay(u, b64) { return wbbbAesplay(wbbbCalculate(u), wbbbAtob(b64)); }

        let playHtml = request(input, { headers: rule.headers });
        let m = playHtml.match(/var player_aaaa=(\{[\\s\\S]*?\});/);
        if (!m || !m[1]) {
            input = { jx: 0, parse: 1, url: input, header: rule.headers };
        } else {
            let player = JSON.parse(m[1]);
            let encUrl = player.url || '';
            let linkNext = player.link_next || '';
            let vodName = player.vod_data && player.vod_data.vod_name ? player.vod_data.vod_name : '';
            if (!encUrl) {
                input = { jx: 0, parse: 1, url: input, header: rule.headers };
            } else if (/^https?:\/\/[^\\s]+\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp)(\?.*)?$/i.test(encUrl)) {
                input = { parse: 0, url: encUrl, header: rule.headers };
            } else {
                let playerHost = 'xn--qvr2v.850088.xyz';
                let u = encUrl.replace(/^http:\/\//, 'https://');
                u += '&next=//wbbb1.com' + linkNext;
                if (vodName) u += '&title=' + vodName;
                let time = Math.floor(Date.now() / 1000);
                let key = wbbbEnplay(u, wbbbCalculatee(u + 'stray'));
                let vkey = wbbbEnplay(u, time + wbbbCalculatee(wbbbCalculate(u) + 'stray'));
                let ckey = wbbbEnplay(u, wbbbCalculatee(playerHost + 'stray'));
                let body = 'url=' + encodeURIComponent(u) + '&key=' + encodeURIComponent(key) + '&vkey=' + encodeURIComponent(vkey) + '&ckey=' + encodeURIComponent(ckey);
                let apiResp = request('https://' + playerHost + '/player/api.php', {
                    method: 'POST',
                    body: body,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': rule.headers['User-Agent'],
                        'Referer': 'https://' + playerHost + '/player/?url=' + encodeURIComponent(encUrl) + '&next=//wbbb1.com' + linkNext + '&title=' + encodeURIComponent(vodName)
                    }
                });
                try {
                    let json = JSON.parse(apiResp);
                    if (json.code == 200 && json.url && json.aes_key && json.aes_iv) {
                        let aesKey = CryptoJS.enc.Base64.parse(wbbbDeplay(u, json.aes_key));
                        let aesIv = CryptoJS.enc.Base64.parse(wbbbDeplay(u, json.aes_iv));
                        let realUrl = CryptoJS.AES.decrypt(json.url, aesKey, {
                            iv: aesIv,
                            mode: CryptoJS.mode.CBC,
                            padding: CryptoJS.pad.Pkcs7
                        }).toString(CryptoJS.enc.Utf8);
                        if (realUrl && realUrl.indexOf('http') === 0) {
                            input = { parse: 0, url: realUrl, header: { 'User-Agent': json['user-agent'] || rule.headers['User-Agent'], 'Referer': 'https://' + playerHost + '/player/' } };
                        } else {
                            input = { jx: 0, parse: 1, url: 'https://' + playerHost + '/player/?url=' + encodeURIComponent(encUrl) + '&next=//wbbb1.com' + linkNext + '&title=' + encodeURIComponent(vodName), header: rule.headers };
                        }
                    } else {
                        input = { jx: 0, parse: 1, url: 'https://' + playerHost + '/player/?url=' + encodeURIComponent(encUrl) + '&next=//wbbb1.com' + linkNext + '&title=' + encodeURIComponent(vodName), header: rule.headers };
                    }
                } catch (e) {
                    input = { jx: 0, parse: 1, url: 'https://' + playerHost + '/player/?url=' + encodeURIComponent(encUrl) + '&next=//wbbb1.com' + linkNext + '&title=' + encodeURIComponent(vodName), header: rule.headers };
                }
            }
        }
    `,
    推荐: `js:
        let d = [];
        try {
            let url = input;
            let page = typeof MY_PAGE !== 'undefined' ? parseInt(MY_PAGE) : 1;
            let cate = typeof MY_CATE !== 'undefined' ? MY_CATE : '1';
            if (page > 1) {
                url = rule.host + '/type/' + cate + '/page/' + page + '.html';
            }
            let html = request(url);
            if (!html || html.length < 100) {
                d.push({ title: '请求失败', desc: '返回内容为空', url: 'http://localhost' });
            } else {
                let items = pdfa(html, '.module-items .module-poster-item');
                if (!items || items.length === 0) {
                    d.push({ title: '解析失败', desc: '未找到影片条目', url: 'http://localhost' });
                } else {
                    items.forEach(it => {
                        let title = pdfh(it, '.module-poster-item-title&&Text') || pdfh(it, 'a&&title');
                        if (!title) return;
                        let pic = pd(it, '.module-item-pic img&&data-original', url);
                        let detailUrl = pd(it, 'a&&href', url);
                        let desc = pdfh(it, '.module-item-note&&Text');
                        d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
                    });
                }
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    一级: `js:
        let d = [];
        try {
            let url = input;
            let page = typeof MY_PAGE !== 'undefined' ? parseInt(MY_PAGE) : 1;
            let cate = typeof MY_CATE !== 'undefined' ? MY_CATE : '1';
            if (page > 1) {
                url = rule.host + '/type/' + cate + '/page/' + page + '.html';
            }
            let html = request(url);
            if (!html || html.length < 100) {
                d.push({ title: '请求失败', desc: '返回内容为空', url: 'http://localhost' });
            } else {
                let items = pdfa(html, '.module-items .module-poster-item');
                if (!items || items.length === 0) {
                    d.push({ title: '解析失败', desc: '未找到影片条目', url: 'http://localhost' });
                } else {
                    items.forEach(it => {
                        let title = pdfh(it, '.module-poster-item-title&&Text') || pdfh(it, 'a&&title');
                        if (!title) return;
                        let pic = pd(it, '.module-item-pic img&&data-original', url);
                        let detailUrl = pd(it, 'a&&href', url);
                        let desc = pdfh(it, '.module-item-note&&Text');
                        d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
                    });
                }
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
    二级: `js:
        let html = request(input);
        VOD = {};
        VOD.vod_id = input;
        VOD.vod_name = pdfh(html, 'h1&&Text') || pdfh(html, '.module-info-heading h1&&Text');
        VOD.vod_pic = pd(html, '.module-info-poster img&&data-original', input) || pd(html, '.module-item-pic img&&data-original', input);
        VOD.vod_remarks = pdfh(html, '.module-info-item:eq(0)&&Text') || '';
        VOD.vod_year = pdfh(html, '.module-info-tag a:eq(0)&&Text') || '';
        VOD.vod_area = pdfh(html, '.module-info-tag a:eq(1)&&Text') || '';
        VOD.vod_actor = pdfh(html, '.module-info-item:contains(主演)&&Text') || '';
        VOD.vod_director = pdfh(html, '.module-info-item:contains(导演)&&Text') || '';
        VOD.vod_content = pdfh(html, '.module-info-item:contains(简介)&&Text') || pdfh(html, '.module-info-content&&Text') || '';

        let tabs = pdfa(html, '.module-tab-items-box .module-tab-item span').map(it => pdfh(it, 'span&&Text'));
        if (tabs.length === 0) tabs = ['播放'];
        VOD.vod_play_from = tabs.join('$$$');

        let panes = pdfa(html, '.module-play-list');
        let lists = [];
        panes.forEach(pane => {
            let episodes = pdfa(pane, '.module-play-list-link').map(a => {
                let name = pdfh(a, 'span&&Text') || pdfh(a, 'a&&Text');
                let url = pd(a, 'a&&href', input);
                return name + '$' + url;
            });
            lists.push(episodes.join('#'));
        });
        VOD.vod_play_url = lists.join('$$$');
    `,
    搜索: `js:
        let d = [];
        try {
            let url = input;
            let html = request(url);
            if (!html || html.length < 100) {
                d.push({ title: '请求失败', desc: '返回内容为空', url: 'http://localhost' });
            } else {
                let items = pdfa(html, '.module-items .module-poster-item');
                if (!items || items.length === 0) {
                    d.push({ title: '解析失败', desc: '未找到影片条目', url: 'http://localhost' });
                } else {
                    items.forEach(it => {
                        let title = pdfh(it, '.module-poster-item-title&&Text') || pdfh(it, 'a&&title');
                        if (!title) return;
                        let pic = pd(it, '.module-item-pic img&&data-original', url);
                        let detailUrl = pd(it, 'a&&href', url);
                        let desc = pdfh(it, '.module-item-note&&Text');
                        d.push({ title: title, pic_url: pic, desc: desc, url: detailUrl });
                    });
                }
            }
        } catch (e) {
            d.push({ title: '发生错误', desc: String(e.message || e), url: 'http://localhost' });
        }
        setResult(d);
    `,
}

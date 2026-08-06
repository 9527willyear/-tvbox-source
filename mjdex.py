# coding=utf-8
import json
import re
import requests
from urllib.parse import urljoin


class Spider:
    def getName(self):
        return "美剧天堂"

    def init(self, extend=""):
        self.host = "https://mjdex.cc"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            "Referer": self.host + "/"
        }

    def homeContent(self, filter):
        result = {}
        classes = [
            {"type_id": "20", "type_name": "剧集"},
            {"type_id": "21", "type_name": "电影"}
        ]
        result["class"] = classes
        result["list"] = []
        return result

    def homeVideoContent(self):
        result = {}
        url = self.host + "/vod/show/id/20/page/1.html"
        videos = self._parseList(url)
        result["list"] = videos
        return result

    def categoryContent(self, tid, pg, filter, extend):
        result = {}
        url = "{}/vod/show/id/{}/page/{}.html".format(self.host, tid, pg)
        videos = self._parseList(url)
        result["list"] = videos
        result["page"] = int(pg)
        result["pagecount"] = 9999
        result["limit"] = 24
        result["total"] = 9999
        return result

    def detailContent(self, ids):
        result = {}
        vod_id = ids[0]
        url = vod_id if vod_id.startswith("http") else urljoin(self.host, vod_id)
        r = requests.get(url, headers=self.headers, timeout=10)
        html = r.text

        title = self._regex(r"<h1[^>]*class=\"tit\"[^>]*>(.*?)</h1>", html)
        pic = self._regex(r'data-src=\"([^\"]+)\"', html)
        desc = self._regex(r'class=\"ysinfo\"[^>]*>(.*?)</div>', html, re.S)

        # 找播放地址
        play_link = self._regex(r'href=\"(/vod/play/id/\d+/sid/\d+/nid/1\.html)\"', html)
        episodes = []
        play_from = "美剧天堂"

        if play_link:
            play_url = urljoin(self.host, play_link)
            r2 = requests.get(play_url, headers=self.headers, timeout=10)
            play_html = r2.text

            # 找集数
            ep_matches = re.findall(
                r'href=\"(/vod/play/id/\d+/sid/\d+/nid/\d+\.html)\"[^>]*>(第\d+集|第\d+话|HD[^<]*|DVD[^<]*|正片|预告|花絮|特辑)</a>',
                play_html, re.I
            )
            seen = set()
            for href, name in ep_matches:
                if href not in seen:
                    seen.add(href)
                    episodes.append(name + "$" + href)

        if not episodes:
            episodes = ["暂无集数$http://localhost"]

        result["list"] = [{
            "vod_id": vod_id,
            "vod_name": title or "未知",
            "vod_pic": urljoin(self.host, pic) if pic else "",
            "vod_content": desc or "",
            "vod_play_from": play_from,
            "vod_play_url": "#".join(episodes)
        }]
        return result

    def searchContent(self, key, quick):
        result = {}
        url = "{}/vod/search.html?wd={}".format(self.host, key)
        videos = self._parseList(url)
        result["list"] = videos
        return result

    def playerContent(self, flag, id, vipFlags):
        result = {}
        url = id if id.startswith("http") else urljoin(self.host, id)
        r = requests.get(url, headers=self.headers, timeout=10)
        html = r.text

        play_url = ""
        match = re.search(r'var player_aaaa=\{([^;]+)\}', html)
        if match:
            try:
                player_json = "{" + match.group(1) + "}"
                player = json.loads(player_json)
                play_url = player.get("url", "")
            except Exception:
                pass

        if play_url:
            result["parse"] = 0
            result["playUrl"] = ""
            result["url"] = play_url
            result["header"] = self.headers
        else:
            result["parse"] = 1
            result["playUrl"] = ""
            result["url"] = url
            result["header"] = self.headers
        return result

    def _parseList(self, url):
        r = requests.get(url, headers=self.headers, timeout=10)
        html = r.text
        items = re.findall(r'<div class="a-con-inner">(.*?)</div>', html, re.S)
        videos = []
        for item in items:
            title = self._regex(r'title=\"([^\"]+)\"', item)
            href = self._regex(r'href=\"([^\"]+)\"', item)
            pic = self._regex(r'data-src=\"([^\"]+)\"', item)
            desc = self._regex(r'class=\"s4\"[^>]*>([^<]+)<', item)
            if title and href:
                videos.append({
                    "vod_id": href,
                    "vod_name": title,
                    "vod_pic": urljoin(self.host, pic) if pic else "",
                    "vod_remarks": desc or ""
                })
        return videos

    def _regex(self, pattern, text, flags=0):
        m = re.search(pattern, text, flags)
        if m:
            return m.group(1).strip()
        return ""

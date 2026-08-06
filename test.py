# coding=utf-8
import requests


class Spider:
    def getName(self):
        return "测试"

    def init(self, extend=""):
        self.host = "https://www.4kvm.top"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": self.host + "/"
        }

    def homeContent(self, filter):
        result = {}
        classes = [
            {"type_id": "movie", "type_name": "电影"},
            {"type_id": "tv", "type_name": "电视剧"},
            {"type_id": "anime", "type_name": "动漫"}
        ]
        result["class"] = classes
        result["list"] = []
        return result

    def homeVideoContent(self):
        result = {}
        videos = [{
            "vod_id": "/play/ch4alqj33",
            "vod_name": "测试影片",
            "vod_pic": "",
            "vod_remarks": "测试"
        }]
        result["list"] = videos
        return result

    def categoryContent(self, tid, pg, filter, extend):
        result = {}
        url = "{}/{}?page={}".format(self.host, tid, pg)
        try:
            r = requests.get(url, headers=self.headers, timeout=10)
            html = r.text
            videos = []
            import re
            cards = re.findall(r'<a[^>]*class="movie-card"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', html, re.S)
            for href, block in cards:
                title = re.search(r'<h3[^>]*>(.*?)</h3>', block, re.S)
                title = title.group(1).strip() if title else ""
                if not title:
                    title = re.search(r'alt="([^"]+)"', block)
                    title = title.group(1) if title else "未知"
                pic = re.search(r'data-src="([^"]+)"', block)
                pic = pic.group(1) if pic else ""
                videos.append({
                    "vod_id": href,
                    "vod_name": title,
                    "vod_pic": pic,
                    "vod_remarks": ""
                })
            result["list"] = videos
            result["page"] = int(pg)
            result["pagecount"] = 9999
            result["limit"] = 24
            result["total"] = 9999
        except Exception as e:
            result["list"] = []
        return result

    def detailContent(self, ids):
        result = {}
        vod_id = ids[0]
        result["list"] = [{
            "vod_id": vod_id,
            "vod_name": "测试详情",
            "vod_pic": "",
            "vod_content": "Python CSP 测试",
            "vod_play_from": "测试线路",
            "vod_play_url": "第1集$http://localhost"
        }]
        return result

    def searchContent(self, key, quick):
        result = {}
        url = "{}/search?q={}".format(self.host, key)
        try:
            r = requests.get(url, headers=self.headers, timeout=10)
            html = r.text
            videos = []
            import re
            cards = re.findall(r'<a[^>]*class="movie-card"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', html, re.S)
            for href, block in cards:
                title = re.search(r'<h3[^>]*>(.*?)</h3>', block, re.S)
                title = title.group(1).strip() if title else "未知"
                videos.append({
                    "vod_id": href,
                    "vod_name": title,
                    "vod_pic": "",
                    "vod_remarks": ""
                })
            result["list"] = videos
        except Exception as e:
            result["list"] = []
        return result

    def playerContent(self, flag, id, vipFlags):
        result = {}
        result["parse"] = 1
        result["playUrl"] = ""
        result["url"] = id
        return result

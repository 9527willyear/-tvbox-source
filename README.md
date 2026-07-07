# 稀饭动漫 TVbox 点播源

从 `https://anime.xifanacg.com/` 抓取影片数据，生成 TVbox 可读取的苹果 CMS（maccms）格式点播源。

## 文件说明

| 文件 | 说明 |
|------|------|
| `scraper.js` | Node.js 爬虫脚本 |
| `tvbox.json` | 影片数据（maccms JSON 格式） |
| `source.json` | TVbox 源配置文件，导入 TVbox 时使用 |

## 本地生成/更新数据

```bash
npm install
node scraper.js
```

默认每个分类只抓前 2 页，用于测试。生成全量数据：

```bash
# 抓取全部分类的前 50 页
MAX_PAGES=50 node scraper.js
```

可调节参数：

```bash
MAX_PAGES=10            # 每个分类抓多少页
DETAIL_CONCURRENCY=6    # 详情页并发数
WATCH_CONCURRENCY=8     # 播放页并发数
DELAY=200               # 请求间隔（毫秒）
OUTPUT=./tvbox.json     # 输出路径
```



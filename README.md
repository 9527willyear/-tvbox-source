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

## 部署到网站

1. 把生成的 `tvbox.json` 上传到你的网站，例如：
   ```
   https://next.xifanacg.com/tvbox.json
   ```
2. 修改 `source.json` 里的 `api` 地址为上一步的实际地址。
3. 把 `source.json` 的内容导入 TVbox，或直接把 `source.json` 部署为可访问链接供 TVbox 订阅。

## TVbox 中使用

在 TVbox 配置里填入：

```text
https://next.xifanacg.com/source.json
```

或直接把 `source.json` 里的 `sites` 数组内容添加到你现有的 TVbox 配置中。

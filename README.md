# TVbox 点播源合集

本项目包含多个网站的 TVbox 点播源规则，源文件部署在 Gitee，通过 drpy2 或 maccms 格式供 TVbox 读取。

## 目录结构

```text
.
├── rules/                  # TVbox drpy2 规则脚本（*.js）
│   ├── xifan.js            # 稀饭动漫
│   ├── 4kvm.js             # 4K 影视
│   ├── juok.js             # 剧 OK
│   ├── xigua.js            # 西瓜影院
│   ├── dmyh.js             # 樱花动漫
│   ├── silidm.js           # 电影先生
│   ├── 91zhuiju.js         # 91 追剧
│   ├── omofuna.js          # Omofun
│   └── xifan_1.js ~ 21.js  # 稀饭分分类旧版
│
├── sources/                # TVbox 源入口文件（*.json）
│   ├── source_merged.json  # 多站合并源（推荐）
│   ├── source_xifan.json   # 稀饭动漫单源
│   ├── source_4kvm.json    # 4K 影视单源
│   ├── source_dmyh.json    # 樱花动漫单源
│   ├── source_silidm.json  # 电影先生单源
│   └── ...
│
├── archive/                # 已放弃/失效的源
│   ├── wbbb.*              # 歪比（加密太重，无法解析）
│   └── laodedy.*           # 老的电影网（不稳定）
│
├── scripts/                # 本地爬虫/生成脚本
│   └── scraper.js
│
├── tests/                  # 测试脚本
│   └── test_*.js
│
├── data/                   # 静态数据文件
│   └── tvbox.json
│
└── docs/                   # 文档
    ├── DEPLOY.md
    └── tvbox.md
```

## 推荐导入地址

多站合并源（一个地址包含多个网站）：

```text
https://gitee.com/willyear/tvbox-source/raw/master/source_merged.json
```

## 单站源

| 网站 | 导入地址 |
|------|----------|
| 稀饭动漫 | `https://gitee.com/willyear/tvbox-source/raw/master/source_xifan.json` |
| 4K 影视 | `https://gitee.com/willyear/tvbox-source/raw/master/source_4kvm.json` |
| 剧 OK | `https://gitee.com/willyear/tvbox-source/raw/master/source_juok.json` |
| 西瓜影院 | `https://gitee.com/willyear/tvbox-source/raw/master/source_xigua.json` |
| 樱花动漫 | `https://gitee.com/willyear/tvbox-source/raw/master/source_dmyh.json` |
| 电影先生 | `https://gitee.com/willyear/tvbox-source/raw/master/source_silidm.json` |
| 91 追剧 | `https://gitee.com/willyear/tvbox-source/raw/master/source_91zhuiju.json` |
| Omofun | `https://gitee.com/willyear/tvbox-source/raw/master/source_omofuna.json` |

## 上传说明

1. 本地修改 `rules/` 里的 JS 规则文件。
2. 把修改后的 JS 文件和对应的 `sources/` 里的 JSON 文件一起上传到 **Gitee 仓库根目录**（和之前一样，不要传文件夹）。
3. 在 TVbox 里用上面的地址导入或重新加载源。

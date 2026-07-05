# TVbox 点播源合集

本项目包含多个网站的 TVbox 点播源规则。规则脚本放在 `rules/`，源入口文件放在 `sources/`。

**Gitee 仓库：** `https://gitee.com/willyear/tvbox-source`

> **注意：** 由于 TVbox 会缓存 JS 规则，修改后请在 `sources/*.json` 里的 `ext` 地址后面改一下 `?t=数字`（例如 `?t=7`），或者在 TVbox 里清除缓存后重新加载源。

---

## 目录结构

```text
.
├── rules/                  # TVbox drpy2 规则脚本（*.js）
│   ├── xifan.js            # 稀饭动漫
│   ├── xifan_1.js          # 稀饭动漫-连载新番
│   ├── xifan_2.js          # 稀饭动漫-完结旧番
│   ├── xifan_3.js          # 稀饭动漫-剧场版
│   ├── xifan_21.js         # 稀饭动漫-美漫
│   ├── 4kvm.js             # 4K 影视
│   ├── juok.js             # 剧 OK
│   ├── xigua.js            # 西瓜影院
│   ├── dmyh.js             # 樱花动漫
│   ├── silidm.js           # 电影先生
│   ├── 91zhuiju.js         # 91 追剧
│   └── omofuna.js          # Omofun
│
├── sources/                # TVbox 源入口文件（*.json）
│   ├── source_merged.json  # 多站合并源（稀饭+4kvm+剧OK+西瓜）
│   ├── source.json         # 稀饭动漫单源
│   ├── source_4kvm.json    # 4K 影视单源
│   ├── source_juok.json    # 剧 OK 单源
│   ├── source_xigua.json   # 西瓜影院单源
│   ├── source_dmyh.json    # 樱花动漫单源
│   ├── source_silidm.json  # 电影先生单源
│   ├── source_91zhuiju.json# 91 追剧单源
│   ├── source_omofuna.json # Omofun 单源
│   └── source_4k_resources.json # 4K 资源站
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

---

## 推荐导入地址

### 多站合并源（一个地址包含多个网站）

```text
https://gitee.com/willyear/tvbox-source/raw/master/source_merged.json
```

### 单站源

| 网站 | 导入地址 |
|------|----------|
| 稀饭动漫 | `https://gitee.com/willyear/tvbox-source/raw/master/source.json` |
| 4K 影视 | `https://gitee.com/willyear/tvbox-source/raw/master/source_4kvm.json` |
| 剧 OK | `https://gitee.com/willyear/tvbox-source/raw/master/source_juok.json` |
| 西瓜影院 | `https://gitee.com/willyear/tvbox-source/raw/master/source_xigua.json` |
| 樱花动漫 | `https://gitee.com/willyear/tvbox-source/raw/master/source_dmyh.json` |
| 电影先生 | `https://gitee.com/willyear/tvbox-source/raw/master/source_silidm.json` |
| 91 追剧 | `https://gitee.com/willyear/tvbox-source/raw/master/source_91zhuiju.json` |
| Omofun | `https://gitee.com/willyear/tvbox-source/raw/master/source_omofuna.json` |
| 4K 资源 | `https://gitee.com/willyear/tvbox-source/raw/master/source_4k_resources.json` |

---

## 上传说明

1. 本地修改 `rules/` 里的 JS 规则文件。
2. 如果修改了 JS 规则，记得把对应 `sources/` 里的 JSON 文件中的 `ext` 地址后面的 `?t=数字` 改大一个数，避免 TVbox 用旧缓存。
3. 把修改后的 JS 文件和对应的 JSON 源文件一起上传到 **Gitee 仓库根目录**（和之前一样，不要传文件夹）。
4. 在 TVbox 里用上面的地址导入或重新加载源。

---

## 已知问题

- **歪比（wbbb）**：站点加密太重，暂时无法做成可用源，已放入 `archive/`。
- **部分站点**：播放链接可能需要特定 Header（Referer/Origin），若遇到解析失败可尝试切换 TVbox 内置解析或换线路。

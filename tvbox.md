# 稀饭动漫 TVbox 源 - 项目总结

## 项目位置

```text
C:\Users\qwl\tvbox-source\
```

## 核心文件

| 文件 | 说明 |
|------|------|
| `xifan.js` | TVbox drpy2 源脚本（当前使用版本） |
| `source.json` | TVbox 源配置文件 |
| `scraper.js` | 本地爬虫脚本（备用） |
| `tvbox.json` | 静态影片数据（备用，187部） |

## 当前 TVbox 订阅地址

```text
https://gitee.com/willyear/tvbox-source/raw/master/source.json
```

## 数据源

- 网站：`https://anime.xifanacg.com/`
- 数据接口：`/index.php/ajax/data`（分类列表）
- 搜索接口：`/index.php/ajax/suggest`

## 分类

- 连载新番（约 3400+ 部）
- 完结旧番
- 剧场版
- 美漫

## 更新方法

如果 `xifan.js` 规则失效，需要修改后重新上传到 Gitee：

1. 修改本地 `xifan.js`
2. 上传到 Gitee 仓库覆盖原文件
3. TVbox 重新加载源

## 备用静态数据

如需重新生成 `tvbox.json`：

```bash
cd C:\Users\qwl\tvbox-source
MAX_PAGES=10 node scraper.js
```

## 历史记录

- 初始方案：type 1 maccms 静态 JSON（因静态文件无法响应动态请求而弃用）
- 第二方案：drpy2 实时爬网页（内容少）
- 最终方案：drpy2 + 网站 AJAX 接口（内容多、支持搜索）

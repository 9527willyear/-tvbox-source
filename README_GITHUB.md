# TVbox 源 - GitHub 版本

这份是**专门用于 GitHub Pages 部署**的源文件，Gitee 版本保持原样不动。

## 上传方式

1. 登录 GitHub，进入仓库：`https://github.com/9527willyear/-tvbox-source`
2. 把 `rules/` 里的所有 `.js` 文件上传到仓库**根目录**
3. 把 `github-sources/` 里的所有 `.json` 文件上传到仓库**根目录**
4. 等待 GitHub Pages 重新部署（一般 1-2 分钟）

> 注意：`github-sources/` 这个文件夹本身**不需要上传**，只要里面的 `.json` 文件。

## 导入地址

### 多站合并源

```text
https://9527willyear.github.io/-tvbox-source/source_merged.json
```

### 单站源

| 网站 | 导入地址 |
|------|----------|
| 稀饭动漫 | `https://9527willyear.github.io/-tvbox-source/source.json` |
| 4K 影视 | `https://9527willyear.github.io/-tvbox-source/source_4kvm.json` |
| 剧 OK | `https://9527willyear.github.io/-tvbox-source/source_juok.json` |
| 西瓜影院 | `https://9527willyear.github.io/-tvbox-source/source_xigua.json` |
| 樱花动漫 | `https://9527willyear.github.io/-tvbox-source/source_dmyh.json` |
| 电影先生 | `https://9527willyear.github.io/-tvbox-source/source_silidm.json` |
| 91 追剧 | `https://9527willyear.github.io/-tvbox-source/source_91zhuiju.json` |
| Omofun | `https://9527willyear.github.io/-tvbox-source/source_omofuna.json` |
| 4K 资源 | `https://9527willyear.github.io/-tvbox-source/source_4k_resources.json` |

## 缓存说明

TVbox 会缓存 JS 规则文件。修改 `rules/` 里的 JS 后，需要：

1. 同时修改 `github-sources/` 里对应 JSON 的 `ext` 地址后面的 `?t=数字`，把数字改大
2. 重新上传 JSON 到 GitHub
3. 在 TVbox 里清除缓存或重新加载源

# GitHub Pages 部署步骤

## 1. 注册/登录 GitHub

打开 https://github.com ，登录你的账号。

## 2. 创建新仓库

点击右上角 `+` → `New repository`。

填写：
- Repository name：`tvbox-source`
- 选择 `Public`（Public 才能免费使用 GitHub Pages）
- 勾选 `Add a README file`（可选）
- 点击 `Create repository`

## 3. 上传文件

进入仓库后，点击 `Add file` → `Upload files`。

把本目录下的这几个文件上传上去：

```text
tvbox.json
source.json
README.md
```

> 注意：不要上传 `node_modules`、`package.json`、`scraper.js` 等，那些是本地生成脚本用的。如果直接拖拽上传，GitHub 会自动跳过 `node_modules`（因为 `.gitignore` 已配置）。

点击 `Commit changes`。

## 4. 开启 GitHub Pages

进入仓库 → 点击 `Settings` → 左侧 `Pages`。

在 `Build and deployment` 里：
- Source：选择 `Deploy from a branch`
- Branch：选择 `main`，文件夹选 `/ (root)`
- 点击 `Save`

等待 1-3 分钟，Pages 会生成。

## 5. 获取访问地址

部署成功后，在 `Pages` 页面会看到一个绿色提示：

```text
Your site is live at https://你的用户名.github.io/tvbox-source/
```

你的两个文件地址就是：

```text
https://你的用户名.github.io/tvbox-source/tvbox.json
https://你的用户名.github.io/tvbox-source/source.json
```

## 6. 修改 source.json

打开仓库里的 `source.json`，把：

```json
"api": "https://你的用户名.github.io/tvbox-source/tvbox.json"
```

改成你真实的用户名，然后提交修改。

## 7. TVbox 中使用

在 TVbox 配置地址里填入：

```text
https://你的用户名.github.io/tvbox-source/source.json
```

## 8. 以后更新数据

本地重新生成 `tvbox.json` 后，到 GitHub 仓库里重新上传覆盖即可。

或者如果你会用 git 命令行，也可以：

```bash
cd "D:\kimi work\tvbox-source"
git init
git remote add origin https://github.com/你的用户名/tvbox-source.git
git add tvbox.json source.json README.md .gitignore
git commit -m "update"
git push -u origin main
```

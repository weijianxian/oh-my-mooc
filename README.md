# oh-my-mooc

网易 MOOC (icourse163.org) 界面美化油猴脚本，去除页面中的广告、推广和多余元素，还你一个干净的学习界面。

## 功能一览

### 首页美化
- 隐藏顶部活动黄条 banner
- 删除底部推荐、排行榜、会员推广等多余内容

### 我的课程页美化
- 移除右侧 VIP 广告（期末考试会员、认证会员）

### 全局美化
- 移除导航栏推广项目（考研全科规划、小 mooc 图标、期末考试、搜索栏考研推荐等）
- 隐藏右侧浮动活动栏

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 点击 [脚本安装链接](https://github.com/weijianxian/oh-my-mooc/raw/main/script.js)（或在 Tampermonkey 中新建脚本，将 `script.js` 内容粘贴进去）
3. 访问 [icourse163.org](https://www.icourse163.org/) 即可生效

## 使用

脚本安装后默认开启所有美化功能。如需调整：

1. 点击浏览器工具栏中的 Tampermonkey 图标
2. 选择 **美化设置**
3. 在弹出的设置面板中按分类开关功能
4. 更改设置后需刷新页面生效

## 更新日志

### v1.0.0
- 初始版本，支持首页、我的课程页、全局三类美化功能

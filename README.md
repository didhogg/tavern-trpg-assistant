# TRPG 跑团助手（tavern-trpg-assistant）

SillyTavern / TauriTavern 前端扩展：手动管理 TRPG 战役，快速掷骰与结算，并把战役事实交给酒馆 AI。首个规则：D&D 5e（2014）。

当前处于 M0（脚手架与真机探针）阶段，扩展只包含探针面板。

## 安装

酒馆中打开「扩展 → 安装扩展」，粘贴本仓库的 Git 地址安装。安装后点击页面上的悬浮球 ⚄ 打开面板。

## 开发

```bash
npm install
npm run check   # 类型 + 代码检查 + 单元测试
npm run build   # 生成 dist/（需提交，供 Git 地址安装）
npm run e2e     # 模拟宿主冒烟测试（需本机 Chrome）
```

开发文档见 `docs/任务总纲.md`、`docs/基本蓝图.md`、`docs/开发规范.md`。

许可证：AGPL-3.0。

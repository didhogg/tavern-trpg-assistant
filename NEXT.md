# NEXT

## 当前里程碑
M0 脚手架与真机探针（已完成；未验证项见 `docs/probes/M0.md`）
下一步里程碑：M1 核心数据层（开工前须定稿 `docs/units/U2_存档与内容包.md`）

## 当前任务
- 目标：搭好 Vite + Vue 3 + TypeScript 的 SillyTavern 扩展骨架，推送到 GitHub，在 TauriTavern 中以 Git 地址安装；扩展内置一个探针面板，测出 `docs/probes/M0.md` 所需的真机结论。
- 红线：不写入 TauriTavern 的数据目录；不修改宿主文件；推送仅限驾驶员授权的 GitHub 仓库；探针不自动发送聊天消息、不改动用户已有聊天与设置（只写本扩展自己的命名空间）；不做 M1 及之后的功能。
- 验收：① `npm run check` 与 `npm run build` 通过；② 模拟宿主页中扩展能挂载、探针可运行；③ 驾驶员在 TauriTavern 安装后能打开探针面板并跑完全部探针；④ `docs/probes/M0.md` 记录每项结论，未验证项标明。

## 已完成
- M0 代码：Vite + Vue 3 + TS 骨架、探针面板、模拟宿主冒烟测试（`npm run check` 与 `npm run e2e` 通过）；真机结论待测
- 项目权威文档：`docs/任务总纲.md`、`docs/基本蓝图.md`、`docs/开发规范.md`
- 参考资料已置于 `reference/`

## 下一步
1. 驾驶员审批 `docs/units/U2_存档与内容包.md` 草案（以及基本蓝图 §2 的新排版）；批准后把状态改为定稿。
2. U2 定稿后开始 M1。

## 阻塞
- 无

## 待议
- 各 Unit 单元蓝图逐个讨论定稿后写入 `docs/units/`（M1 前需定稿 U2）。

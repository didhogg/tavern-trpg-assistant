# NEXT

## 当前里程碑
M0 脚手架与真机探针（进行中）

## 当前任务
- 目标：搭好 Vite + Vue 3 + TypeScript 的 SillyTavern 扩展骨架，推送到 GitHub，在 TauriTavern 中以 Git 地址安装；扩展内置一个探针面板，测出 `docs/probes/M0.md` 所需的真机结论。
- 红线：不写入 TauriTavern 的数据目录；不修改宿主文件；推送仅限驾驶员授权的 GitHub 仓库；探针不自动发送聊天消息、不改动用户已有聊天与设置（只写本扩展自己的命名空间）；不做 M1 及之后的功能。
- 验收：① `npm run check` 与 `npm run build` 通过；② 模拟宿主页中扩展能挂载、探针可运行；③ 驾驶员在 TauriTavern 安装后能打开探针面板并跑完全部探针；④ `docs/probes/M0.md` 记录每项结论，未验证项标明。

## 已完成
- M0 代码：Vite + Vue 3 + TS 骨架、探针面板、模拟宿主冒烟测试（`npm run check` 与 `npm run e2e` 通过）；真机结论待测
- 项目权威文档：`docs/任务总纲.md`、`docs/基本蓝图.md`、`docs/开发规范.md`
- 参考资料已置于 `reference/`

## 下一步
1. 驾驶员在 TauriTavern 更新扩展后继续测：注释/注入（需发送消息）、聊天事件、完全退出后的持久性、群组与无聊天标识、TauriTavern 接口（重测）、请求日志核对。
2. 结论写入 `docs/probes/M0.md`。
3. M0 完成后，用 Grill Me 对齐并产出 M1 前必须定稿的单元蓝图（U2）草案。

## 阻塞
- 无

## 待议
- 各 Unit 单元蓝图逐个讨论定稿后写入 `docs/units/`（M1 前需定稿 U2）。

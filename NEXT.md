# NEXT

## 当前里程碑
M2 5e2014 扩展包（D1 基础数据管线 + L1 里程碑表 M2 行）。D1、L1、U2 已定稿。

## 当前任务
- 交接文档：`docs/handoff/M2_交接.md`（按其第 1 节读完后，用三句话改写本节）。
- 目标：SRD 与十本官方书转为格式 2 扩展包，每种数据导入、读取、使用、导出、再导入一致；安装器与数据库升级到第 2 版。
- 红线：不做界面（探针按钮除外）、不做 D2 冒险、不推送不发布、不提交 reference 原始数据。
- 验收：交接文档第 6 节 13 条；先由上一位 agent 复核，再由驾驶员按 D1 §12 真机验收。

## 已完成
- M0；U2 定稿
- M1：规则注册表、zod schema、Dexie 存储、统一安装器（识别、覆盖、同名、内置包、导出）、启停与依赖、当前数据与存档服务（新存档、保存、分支、读取、自动存档、最近删除、跨卡复制、规则切换）、模板副本机制、迁移框架、`.trpgsave` 导出导入与备份恢复、备份提醒与持久存储申请、多窗口只读、横幅取图、目录与下载函数、Pinia store、数据层自检
- 证据：`npm run check`（105 个单元测试）、`npm run build`、`npm run e2e`（Chrome 与 WebKit 共 92 项，含数据层自检）；关键逻辑做过故意改坏的变异检查

## 下一步
1. 实现 M2（见交接文档）。

## 阻塞
- 无

## 待议
- 代码中的旧命名待 M2/M3 改：`corePackIds: ['dnd5e2014-core']` → `dnd5e2014-srd`；`PackManifest.kind/dependsOn` → `category/relationships`（含格式 1 兼容读取）；自检用例；`autoReason` 增加「改动模组前」；安装器不再改写各当前数据的 `enabledPacks.version`。
- 各 Unit 单元蓝图逐个讨论定稿后写入 `docs/units/`（U2 已定稿）。
- 搜索索引（MiniSearch）与下载队列/状态属于 M9 与 U11；M1 只提供安装器的 `onChange` 钩子与下载函数。
- 其他单元登记摘要（`summaryContributors`）与横幅地点链（`LocationChainProvider`）的接口已留好，U5–U8 接入。
- 启动时是否在聊天载入前读取归属键尚未验证（`ownerFromHost` 需在 CHAT_CHANGED 后调用），M3 接入界面时验证。

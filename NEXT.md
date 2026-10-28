# NEXT

## 当前里程碑
M1 核心数据层已完成（驾驶员真机自检 10/10 通过）。L1 库与模组已定稿；基本蓝图、任务总纲、U2（改名 `docs/units/U2_存档.md`）已同步。下一步：驾驶员审批 `docs/units/D1_数据管线.md` → M2。

## 当前任务
- 目标：驾驶员在 TauriTavern 更新扩展到 v0.1.0，点探针面板顶部的"M1 数据层自检"，结果为"全部通过（10/10 步）"。
- 红线：不做 U2 §4 界面；不改动用户真实数据（自检只用临时库）。
- 验收：`docs/probes/M1.md` 表格中 TauriTavern 一行填写结论。

## 已完成
- M0；U2 定稿
- M1：规则注册表、zod schema、Dexie 存储、统一安装器（识别、覆盖、同名、内置包、导出）、启停与依赖、当前数据与存档服务（新存档、保存、分支、读取、自动存档、最近删除、跨卡复制、规则切换）、模板副本机制、迁移框架、`.trpgsave` 导出导入与备份恢复、备份提醒与持久存储申请、多窗口只读、横幅取图、目录与下载函数、Pinia store、数据层自检
- 证据：`npm run check`（105 个单元测试）、`npm run build`、`npm run e2e`（Chrome 与 WebKit 共 92 项，含数据层自检）；关键逻辑做过故意改坏的变异检查

## 下一步
1. 驾驶员审批 `docs/units/D1_数据管线.md`：D1 只做基础数据管线（十本书 + SRD 的条目、来源标注、每种数据的导入导出往返验证）；冒险内容项只定义通用外壳。
2. 《凡戴尔的失落矿坑》冒险包与示意图移到 D2（M10），其单元蓝图在 U6/U8/U9 定稿后再讨论。
3. 批准后 M2 开工，先写 NEXT「当前任务」三句话。

## 阻塞
- 无

## 待议
- 代码中的旧命名待 M2/M3 改：`corePackIds: ['dnd5e2014-core']` → `dnd5e2014-srd`；`PackManifest.kind/dependsOn` → `category/relationships`（含格式 1 兼容读取）；自检用例；`autoReason` 增加「改动模组前」；安装器不再改写各当前数据的 `enabledPacks.version`。
- 各 Unit 单元蓝图逐个讨论定稿后写入 `docs/units/`（U2 已定稿）。
- 搜索索引（MiniSearch）与下载队列/状态属于 M9 与 U11；M1 只提供安装器的 `onChange` 钩子与下载函数。
- 其他单元登记摘要（`summaryContributors`）与横幅地点链（`LocationChainProvider`）的接口已留好，U5–U8 接入。
- 启动时是否在聊天载入前读取归属键尚未验证（`ownerFromHost` 需在 CHAT_CHANGED 后调用），M3 接入界面时验证。

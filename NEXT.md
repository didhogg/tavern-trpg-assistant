# NEXT

## 当前里程碑
M2 5e2014 扩展包（D1 基础数据管线 + L1 里程碑表 M2 行）。D1、L1、U2 已定稿。

## 当前任务
- 目标：把 SRD 与十本官方书转成 formatVersion 2 的扩展包，证明每种数据都能导入、读取、使用、导出、再导入且结果一致，并把安装器与数据库升级到第 2 版。
- 红线：不做界面（探针按钮除外）、不做 D2 冒险与 L1 的 M3 部分、不推送不发布、不提交 reference 原始数据、不改定稿文档、不动真实数据。
- 验收：交接文档第 6 节 13 条；先由上一位 agent 复核，再由驾驶员按 D1 §12 真机验收。

## 已完成
- M0；U2 定稿；M1 核心数据层。
- M2（实现完成，待复核与驾驶员真机验收）：
  - D1 数据定义：`src/rules/dnd5e2014/data/`（通用字段、15 种条目、7 种 advancement、7 种行动、正文块与行内标记、requires、ruleOptions/aiNotes）；`src/schemas/adventure/` 冒险内容项外壳。
  - 安装器与存储：formatVersion 2 识别与 L1 §2.2 全部限制；formatVersion 1 兼容；PackManifest 新字段；lineage/requires/recommends/conflicts/不支持功能的安装预案；Dexie 第 2 版（blobs、blobHashes、packTrash、迁移失败保持旧数据）；安装不再改写当前数据；内置包与推荐包数据层；自动存档原因「改动模组前」；`.trpgsave` 带图片。
  - 构建管线：`tools/data/` 从本地 5etools-cn 批量抽取、展开 `_copy`/`_mod`、展开魔法变体、转换、标记、来源与摘要、分包、校验、确定性打包、版本检查、报告；生成 11 个包。
  - 往返验证：`tests/data/` 的 fixture-data、fixture-adventure；D1 §8 每一行；官方 11 包全量安装、逐包导出再装、每种类型抽 20 条生成副本并做存档往返。
  - 产品：`packs/dnd5e2014-srd.trpgpack`、`packs/DATA-NOTICE.md`、`packs/LICENSES/`；本地数据仓库 `/Users/xxx/tavern-trpg-data`（10 个书籍包、catalog、NOTICE、LICENSES、README，已本地提交 `0ccec9d`，未推送）。
  - 探针：「M2 数据自检」5 步；e2e 用本地模拟目录与包跑通下载步骤。

## 证据
- `npm run check`：114 个单元测试通过（12 个测试文件）。
- `npm run build`：通过；`dist/index.js` 已更新。
- `npm run e2e`：Chrome 与 WebKit 共 96 项通过，0 失败；含「M1 数据层自检 10/10」与「M2 数据自检 5/5」（4 个视口组合）。
- `npm run test:data`：21 项通过（4 个测试文件）；含官方 11 包全量往返、200 个引用解析、D1 §7 校验与金样。职业只有 16 条、疾病 9 条，抽 20 条时按实际条数。
- 连续两次 `npm run build:data`：11 个包 sha256 完全相同；包体积合计 1.53MB，最大单包 SRD 466.2KB（上限 3MB/包、12MB 合计）。
- 报告：`docs/probes/D1_构建报告.md`；抽检：`docs/probes/D1_抽检.md`（50 条，类型分布 10/10/10/6/5/3/3/2/1）。
- `packs/` 只有 SRD 包、`DATA-NOTICE.md` 与 `LICENSES/`；`reference/` 仍被 `.gitignore` 忽略。

## 下一步
1. 上一位 agent 按 `docs/handoff/M2_交接.md` 第 6 节复核。
2. 驾驶员按 D1 §12 真机验收，并填写 `docs/probes/D1_抽检.md` 的 50 条结果。

## 阻塞
- 无（等待复核与真机验收）。

## 未验证
- TauriTavern 真机上的 M2 自检（内置 SRD 包读取、jsDelivr 访问、真实 IndexedDB 迁移）；e2e 只覆盖模拟宿主。
- 50 条抽检的人工对照结果。
- 上一位 agent 的复核结论。
- 运行时的 `resolveRef`（L1 M3）未实现；本次用构建期校验与测试期引用检查覆盖 D1 §7 的引用可解析性。

## 待议
- 新增开发依赖 `tsx`（MIT）：本机 Node 22 可直接运行 `.ts`，但 `src/` 的导入不带扩展名，直接用 Node 跑构建脚本会失败；`tsx` 只用于 `tools/data/` 与 `npm run e2e`，不进入扩展产物。已记入 `THIRD_PARTY_NOTICES.md`。
- 构建期 `tools/data/published.json` 保持空对象；真正发布时运行 `npm run publish:data` 记录版本与哈希。当前没有推送、打标签或刷新 CDN。
- 子职业按「名称 + 来源」去重（109 条），因此与 D1 §2 表中的 218 条原始行数不同；2024 重印（classSource XPHB）与跨书重印特性未重复计入。
- 5 个无名称的抽象亚种族跳过并写入构建报告；1 个职业特性（Ki）缺中文名，用英文名兜底并标记 `credit.by: dnd-data`，报告中有记录。
- 官方书籍包没有冒险内容项与图片，M2 探针第 4 步对这两类显示跳过；由 `fixture-adventure` 与测试图片覆盖。

## 需要驾驶员授权
- 创建 GitHub 数据仓库 `didhogg/tavern-trpg-data`。
- 推送扩展仓库与数据仓库、打版本标签、刷新 jsDelivr CDN。
- 在 TauriTavern 真机安装并运行 M2 自检、填写抽检结果。

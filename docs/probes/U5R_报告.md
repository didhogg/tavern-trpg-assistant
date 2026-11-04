# U5R 报告（进行中）

- **目标**：把 `u5a` 的人物详情界面按 U5R 两份规格返工：居中弹窗、身份五标签、读数三标签、档案三卡、效果结构化、敌人同构、骰盘检定/豁免。
- **红线**：只改执行文档 §4 允许的文件；不推 main、不打标签、不刷新 CDN、不安装；数据错只改转换器与 overlay；已有测试断言不改。
- **验收**：执行文档 §6。

## 基线（`u5a` c270df6）
`npm run check`：55 个测试文件 / 402 条单测全绿。

## 补充规格：随机 DC
驾驶员 2026-11-04 补充：随机 DC 取整数 **1–25**（已写进 U5R 修订规格 §11）。

## 进度
- 批 0：效果数据审计完成（见 `U5R_效果数据审计.md`）。其余核对项随批 1 追加。

## 已改动的旧测试（逐条）
1. `tests/unit/u6-migration.test.ts`：两处 `schemaVersion` 断言从写死的 `2` 改为 `SCHEMA_VERSIONS.*`（workspace/save 结构版本因效果结构化升到 3，断言意图不变：迁移后版本 = 当前版本）。
2. `tests/unit/u5-write.test.ts`、`u6-pure.test.ts`：人物效果夹具补齐新必填字段（`id / category / concentration / addedAt`），断言不变。

## 批 1：数据
- 新增 `tools/data/overlay/U5R-法术-加值效果.json`：祝福术、神导术、抗御术（`rollBonus`）、信仰护盾、树肤术（`ac`），依据 PHB 页码写在每条 `basis`。
- `effects.ts` 增补可选种类 `rollBonus`；法术条目 schema 增补可选 `effects`。
- **两次 `build:data` SRD 包哈希相同**（febd2465…）；`test:data` 123 文件 400 条全过（含 `g2-oldext`）。
- 放行规则：`tests/data/g2-allow/u5r.ts`（expect=5）；`docs/probes/D1.2-G2_发现登记/g2b-effects.json` 的登记数 676→682（5 个法术共 6 条效果；必须改，已登记）。
- 数据仓库 `tavern-trpg-data` 本批**无变化**（SRD 包随扩展仓库；其他书包没有这 5 个法术）。
- **未做**：特性 / 物品 / 疾病 / 环境的 `data.duration`：来源（5etools）里这几类没有可结构化读出的时长，逐条补需要读书；`duration` schema 未加（没有数据可放）。写进「规格疑问」，等驾驶员定要不要逐条补。
- 构建会顺带重写 `docs/probes/D1*` 旧报告与 `catalog.json` 时间戳，已还原，不入提交。

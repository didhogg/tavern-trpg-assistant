# NEXT

## 当前阶段：D2 数据管线重建（`docs/任务总纲.md` §2）
- P0 整理归档与执行守则：✔ 2026-11-05。
- **当前：D2-P1 5etools 直读数据源（T1–T4）**
  - T1/T2 ✔：现有库直接装 5etools 原样数据；后端读取器覆盖法术/怪物/物品/职业/种族/背景/专长/升级/表；报告 `docs/handoff/D2-P1_T1-T2_验证报告.md`。
  - T3 ✔ 2026-11-06（T4 期间追加 5etools-2014-src，S1 期间追加试玩稿 unearthed-arcana 并合并作者官方来源清单）：全量源清单 + 校验，现为 7 个源、3,756 个 JSON、290,645 条记录、1,861 个来源 ID（英文上游已改指向 2.40.0）；报告 `docs/handoff/D2-P1_T3_源清单与校验报告.md`（数字以 T4 报告为准），输出 `/Users/xxx/tavern-trpg-data-next/source-manifest/`，T3 原清单备份在 `/Users/xxx/tavern-trpg-backup/source-manifest-T3-before-2014src/`、`.../source-manifest-T3-before-UA/`。作者 wiki/文档原文：`/Users/xxx/tavern-trpg-data-next/_upstream/author-docs/`。
  - T4 ✔ 2026-11-06（只换源）：设置里新增「当前数据源」指针（默认旧库，读不到清单自动退回）、源清单读取与自检、新旧比对工具 `npm run db:diff`、清单对账 `npm run db:source:check`；报告 `docs/handoff/D2-P1_T4_换源报告.md`。已本地提交（T1+T2 `cb6a6fe`、T3 `a46d609`、T4 `1dff1d2`，未推送）；S1 期间追加的试玩稿源与作者来源清单合并在其后，**未提交**，等驾驶员说提交。
  - 范围边界：T3/T4 不生成自定义包、不覆盖旧库、不推送。旧 `docs/handoff/D2-P1_数据库全量重建_执行文档.md` 和 `tools/db/build.ts` 是另一条全量转换线，不是本轮 T3/T4 的入口。
- 之后：P2【库】后端（一次整体设计并做完：B0 调查 → B1 设计稿 → B2 实现 → B3 对账）→ P2 前端逐个小 UNIT → P2 完成后推送 → P3a 人物详情 S1–S12 → P3b UNIT4–8 → P3c 骰盘标签页。

## 红线
- 见 `docs/开发规范.md` §0：草案先行；汇报用 ASCII＋大白话，有界面附截图路径；界面只由驾驶员验收。
- 数据正确性归上游：禁止逐条对照原书、逐条抽检、逐条手工修复。
- 不读各 `归档/` 与 `docs/probes/` 的旧报告，除非驾驶员点名。

## 等驾驶员定
- 清单怎么托管（我们自己发布 manifest.json，还是插件直接读上游 books.json/index.json）：放进 P2 后端 B1 设计稿一起定。

## 等驾驶员定（P3 人物界面时再定）
- "选法术"类选择（玄奥秘法等）在界面里的做法。
- 兼职前置不满足：警告还是禁止；兼职职业数上限。
- 升级时"替换一个已知法术"是否进法术步骤。

## 未推送（推送须单独授权；计划在 P2 之后一起推）
- 助手仓库：领先 origin/main 多个本地提交（D8、T1、T2、T2r-1、P0 及 D2-P1 文档）。
- 数据仓库：领先 1 个提交（`c7585c9`，数据 1.7.1）。

## 未验证
- T3/T4：浏览器 CORS/代理/缓存、清单拉取后的真实读取与展开、库界面显示都未验证；T4 只验证了 Node 读清单与指针行为。
- UNIT1–3、U5R 及 T1/T2/T2r-1 界面：真机未看；整套 e2e 最近未跑；M3 真机验收待进行。
- `npm run check` 有 2 个旧 lint 错误（`tests/e2e/shots-t2.mjs`、`shots-t2r1.mjs` 未使用变量）。

## 历史
- 旧进度全文：`docs/归档/NEXT_历史_2026-11-05.md`。

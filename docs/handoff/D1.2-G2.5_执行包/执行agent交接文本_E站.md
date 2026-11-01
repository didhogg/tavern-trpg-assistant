# G2.5 执行 agent 交接文本（E 逐条站：只补"原始数据里确实没有"的项）

> **驾驶员：把本文件整份原样粘贴给执行 agent。** 它是自包含的：执行 agent 先读完这一份，再按里面的顺序去读执行包。
> 本文件管"怎么开工、中途怎么不跑偏、什么时候停、怎么交回"；每个工作项的具体做法在 `03_第3站_结构化.md`、`04_第4站_新结构落地.md`、`01_字段规格.md`，通用规矩在 `00_总则与防走偏.md`，本站的名单在 `E_逐条站.md`。**本文件与它们冲突时，以 00／01／E_逐条站 的最新版为准，并立即停手报告冲突**（不要自己挑一个）。
> 第 2、3 站你（上一位执行 agent）已做完并由规划者核验通过；规划者随后做完了 **P 管线站**（改转换器、重建一次），把大部分原本要逐条补的东西直接从原始数据读出来了。**现在剩下的才是需要你读书补的。** 上一份交接文本 `执行agent交接文本_第3站.md` 只作参考，**里面的起点数字／哈希／站号／"改修正表"的做法不要照抄**——这一站的产出是**补充层数据文件**，不是 TS 修正行。

---

## 0. 你是谁、这次做什么

- 你是 **G2.5 数据修正的执行 agent**。项目是 SillyTavern 扩展（"TRPG 跑团助手"，Vue 3 + TypeScript），里面有 D&D 5e（2014）资料库（11 个 `.trpgpack`）。
- **E 站要做的事**：对"原始数据（5etools、Foundry 开源数据）里确实没有或确实错了"的项，**对照原书**，把结构化结果写成**补充层 JSON 数据文件**（`tools/data/overlay/*.json`，每行带 `basis` 出处）。一个工作项一个文件。
- **补充层是什么**（大白话）：以前"改某条数据"要写 TS 代码；现在写成一份人能读、能改、能导出的 JSON 清单：哪个条目、哪个位置、现状是什么、改成什么、依据哪本书哪一页。构建时由 `tools/data/fix/overlay.ts` 读它、套到转换器产出的数据上。清单本身就是数据库的一部分，**不是**一次性的脚本。
- 分五个子站：**E1 角色特性 → E2 状态 → E3 物品 → E4 怪物与召唤 → E5 表格**。**驾驶员 2026-11-01 定：E1–E5 一口气做完，子站之间不停、不等"继续"**；每个子站结束照样写报告小节、提交数据仓库。E 站做完即结束 G2.5（`docs/任务总纲.md` §2"当前执行次序"）。
- **停手范围（驾驶员 2026-11-01 定，优先于 `00` 第 11 节）**：
  - **只有两种情况停整站**：两次构建哈希不同；要改 `src/`、字段形状或 schema 才能继续。
  - **其余停止条件只停当前这一项**（含文档矛盾、条目数对不上、出现新发现、来源矛盾、拿不准要不要结构化、书上读不到、修 3 次不过）：该项在登记表里定为 `decision` 或"不做"，写理由与证据，然后**接着做下一项**。
  - 不留"以后再做"：E 站结束时，登记表里剩下的每一项要么已修好，要么是写了理由的决定项或"不做"。
  - 清单外的发现只记进 `NEXT.md` 的"待议"，不在 E 站做。
- **这一站不是找数据的站**。规划者已经查过：每一项的原始数据来源和结论在 `docs/probes/D1.2-G2.5_根因与数据源台账.md`。你做某一项时如果发现**同一类问题成批出现，或原始 5etools／Foundry 数据其实有**：能在转换器里修好的，直接修转换器、重建，写进报告"病根在转换器"一栏；修不了的，该项定为决定项并写理由，接着做下一项。**不要用补充层批量手补，也不要写"来源单一"了事**（`00` 第 14 节）。
- 你的权限（**只许改这些**）：
  - `tools/data/overlay/*.json`（新建你的补充层文件；`_说明.md` 不改）
  - `tests/data/g2-allow/e1.ts`～`e5.ts`（你这个子站对应的那一个）
  - `docs/probes/D1.2-G2.5_报告.md`（追加你的小节）、`docs/probes/D1.2-G2.5_第3站进度账.md`（E 行）、`NEXT.md`、`docs/probes/D1.2-G2.5_纯文字A类处置.json`（只限 E1-5）
  - 登记基线文件由 `G2_WRITE=1` 命令重写（不手改）
- **绝对不碰**：`src/`、`tests/data/consumer/**`（读取器）、`tools/data/convert/**`、`tools/data/config/**`、`tools/data/validate/**`、`tools/data/fix/**`（含 `overlay.ts`、`index.ts`、旧的 `rows/`、`rules/`）、`vitest*.config.ts`、`tests/data/g2-allow/` 里除 `e1`～`e5` 外的所有文件（`s1/s2/s3a-d/sp/index/match/types`）、`docs/probes/D1.2-G2.5_登记排除.json`（规划者专用）、字段形状（`01` 冻结）、包版本号。不推送、不发布、不安装、不跑整套 e2e、不启动别的 agent。
- 产出：每个工作项一个提交（补充层文件＋放行规则＋进度账行；SRD 包变了就带上 `packs/dnd5e2014-srd.trpgpack`）＋ 报告里每个子站一小节 ＋ `NEXT.md` ＋ 每个子站的最终回复。

**为什么这么严**：前面出过的事故，几乎都是"AI 看到数字对不上，就顺手改测试／改读取器／改期望值让它变绿"。你的任务不是让测试变绿，而是**让数据真的变对，并且能证明只改了该改的**。闸门拦住你时，**停手报告比绕过去好一万倍**。

---

## 1. 现状快照（2026-11-01，P 站完成后）

| 项 | 状态 |
|---|---|
| 包版本 | 11 个包都是 **1.4.0**（不许改）；清单 `dataVersion` 3 |
| 冻结 | 新字段形状（`01_字段规格.md`）冻结。P 站新增的**可选**字段（`ac[].items`、`summon`、`*Conditional`、`rechargeRoll`、`cost`、table 的 `at`／`parent.appliesTo`、物品 `itemKind`／`consumable`／`focusType`、speed 效果的 `bonusFormula` 等）已定，**同样不许改** |
| 测试基线 | `npm run check`：**305** 项；`npm run test:data`：**121 个文件／394 项**；全绿 |
| 登记总数 | **64 项**（`data-defect` 29、`decision` 23、`source-defect` 12）；基线文件在 `docs/probes/D1.2-G2_发现登记/*.json` |
| 仓库 | 扩展仓库 `/Users/xxx/tavern-trpg-assistant`（分支 `main`），数据仓库 `/Users/xxx/tavern-trpg-data`。**只做本地提交** |
| 起点提交 | 扩展仓库 `8aa3856`（"G2.5 补充层接进构建…"）；数据仓库 `74ddddd` |
| 补充层 | `tools/data/overlay/`：目前只有 `_说明.md`（构建里没有任何补充层行）。读取与应用：`tools/data/fix/overlay.ts`；测试 `tests/data/overlay.test.ts` |
| 放行骨架 | `tests/data/g2-allow/e1.ts`～`e5.ts` 是空的，已接进 `index.ts`；**你每做一项，在对应文件里加放行规则** |
| 进度账 | `docs/probes/D1.2-G2.5_第3站进度账.md` 里的 E1～E5 行（可按工作项拆成更细的行，换人接手靠它） |

**起点哈希**（11 个包，两次构建相同，完整 64 位；也记在 `冻结记录.md` §9）：

```
dnd5e2014-srd  f2d66e1804128ac279caf8ba48a2b963e40548fce9bcfc55eb3bf494d6dead18
dnd5e2014-phb  d6d847ac9ad27f9d6d3aed4ba6d6330f742c22af5f3eba0b2c9430723282a529
dnd5e2014-scag b30d33c731799b544b4090786f750ac1f07e91a46216ce16f381e4e2fc914175
dnd5e2014-dmg  58d0bdb67646441abf8949003c433d0acdeebba9f1e1b7fa5bfe43e337399e89
dnd5e2014-mm   0cdf97aa7c75d569678c358ef52e24ac3fa254c41590fd4fac96af04c2b2c876
dnd5e2014-xge  5a9d208432534c8abe8efe2b608ec866ed8bcb08d4c0172e842b55197681a4e0
dnd5e2014-tce  726b1afd079e2e0c9d596f07952285c50dbbf03828ec6f30b5ecd50f2753bd17
dnd5e2014-vgm  246d3d7b53ce918d956fff5388fa67171815c00e8e5029f81f4e6bf94197a385
dnd5e2014-mtf  d38b99a00cd4576330fcc0aeb16253c5f6e9759dcd73da9221bff1b334edf431
dnd5e2014-mpmm f7d7c574a4524d5d0c4166df28f53b82d7d990ff7715b27d43531bb9040a1c4a
dnd5e2014-bmt  134598700f36ca9341ad806ac95d55567cfd049047a895badab3a592d85ec311
```

**事实来源，按听谁的排序**：驾驶员当次消息 ＞ `00`（含第 14 节）＞ `01` ＞ `E_逐条站.md`（名单与实测数字）＞ `03`／`04`（具体改法；其中已搬走或已被 P 站做掉的段落以 `E_逐条站.md` 为准）。原书与文档矛盾 → 停手报告，**不要自己挑**。

### 1.1 P 站带来的变化（你读 03／04 时会遇到的差别）

| 地方 | 旧文档写的 | 现在的事实 |
|---|---|---|
| 做法 | 写 `tools/data/fix/rows/*.ts`、`rules/*.ts` | **写补充层 JSON**（见第 4 节）；放行规则仍写 `tests/data/g2-allow/e?.ts`，每条用 `ids` 精确列条目 |
| 登记数字 | 03／04 里的"起点 N" | 以 `E_逐条站.md` 的**实测剩余**为准；登记表里现在没有的项就是已被管线做掉 |
| 武僧无甲移动 | 留作决定项 | 已由规划者改管线（speed 效果可选字段 `bonusFormula`），**你不用做** |
| 有 `consumes` 的特性 | 从正文猜自己的 `uses` | 现在有 `consumes` 的特性**不再**猜 `uses`（`a18-consumes-other-pool` 14→9） |
| 物品 | `category` 要逐件修 | 管线已按 5etools 类型代码生成 `itemKind`／`category`／`consumable`，不要逐件修 |

---

## 2. 开工动作（按顺序，每一步都不许跳）

### 2.1 读文档（只读这几份）

1. `docs/handoff/D1.2-G2.5_执行包/00_总则与防走偏.md` —— **全部读完**（红线、13 步循环、工具、停止条件、报告格式；**第 14 节是这一站的核心**）。
2. `docs/handoff/D1.2-G2.5_执行包/E_逐条站.md` —— 本站名单（短）。
3. `tools/data/overlay/_说明.md` ＋ `tools/data/fix/overlay.ts` 顶部注释 —— 补充层文件格式（第 4 节有摘要）。
4. `docs/handoff/D1.2-G2.5_执行包/冻结记录.md` —— 第 3 节（冻结的取值）、第 8、9 节。
5. `docs/handoff/D1.2-G2.5_执行包/01_字段规格.md` —— 按你当前子站用到的字段读（E1：A `uses`、B 效果、第 4 站的 `consumes`／`restores`／`tracker`；E2：`against`／`autoCrit`；E3：物品活动与 `charges`；E4：`summon` 与怪物条目；E5：表格 `at`／`parent`）。其它节扫一眼。
6. **当前子站对应的 `03`／`04` 段落**（E_逐条站.md 每行的"规格在"列）。其余子站的段落等轮到再读。
7. `docs/probes/D1.2-G2.5_根因与数据源台账.md` —— 看你当前子站涉及的条目，知道"规划者已查过哪些来源、结论是什么"。
8. `docs/probes/D1.2-G2.5_第3站进度账.md` 的 E 部分、`AGENTS.md`。

**不要读**：`05`、`06`、`P_管线站.md` 的实现细节（只需知道 P 站已完成）。

### 2.2 环境核对（逐条执行，把输出贴进回执；**任何一条对不上 → 停**）

```bash
cd /Users/xxx/tavern-trpg-assistant
git status --short                                  # 预期：没有任何输出
git log --oneline | head -3                         # 预期：第一行 8aa3856 "G2.5 补充层接进构建…"（之后规划者可能追加文档提交，可以更靠前）
git rev-parse HEAD                                  # 记下来，叫 START（巡检要用；也填进进度账）
cd /Users/xxx/tavern-trpg-data
git status --short                                  # 预期：没有任何输出
git log --oneline | head -2                         # 预期：第一行 74ddddd "G2.5 补充层接进构建：数据包与目录…"
cd /Users/xxx/tavern-trpg-assistant
```

构建一次（约 30 秒；日志放进被 git 忽略的 `tools/data/out/`，不要放 `/tmp`）：

```bash
TRPG_DATA_TAG=main npm run build:data > tools/data/out/build-start.log 2>&1
grep -E '^dnd5e2014-' tools/data/out/build-start.log
```

**预期**：11 行，每行末尾的 sha256 与第 1 节的表**逐个相同**。构建会顺带改写几个报告文件，**立刻还原**（只还原这几个）：

```bash
git checkout -- docs/probes/D1.1_人物数据_报告.md docs/probes/D1_抽检.md docs/probes/D1_构建报告.md \
  docs/probes/D1.2a_R13_对照报告.md docs/probes/D1.2a_R14_清洁报告.md
git status --short; git -C /Users/xxx/tavern-trpg-data status --short   # 预期：两个都没有输出（哈希相同＝数据仓库没变）
```

> ⚠️ **永远不要** `git checkout -- catalog.json`（数据仓库）也不要 `git checkout -- docs/probes/D1.2a_R8b_去向审计.md`。`catalog.json` 记着各包的哈希和大小，升级场景的 e2e 靠它；还原它会让 e2e 卡死。数据变了以后，数据仓库里的包和 `catalog.json` **要一起提交**（见第 8 节）。

```bash
npm run check          # 预期：305 项通过
npm run test:data      # 预期：121 个文件、394 项通过（约 2～3 分钟）
npx tsx tools/g2/registry-diff.ts --show     # 预期：登记表与 HEAD 完全一致
```

### 2.3 写"开工回执"（写进报告，不停下）

```
【E 站开工回执】
1. 环境核对：<贴 2.2 的输出摘要：哈希 11/11 一致？check／test:data 数字？registry-diff 是否一致？>
2. START 提交：<git rev-parse HEAD>（已填进进度账）
3. 我的理解（每条一句话，自己组织语言，不要抄原文）：
   a. E 站和以前的第 3 站有什么不同？我的产出是什么形式（文件、位置、格式）？
   b. 我可以改的位置有哪些：
   c. 我绝对不能碰的：
   d. 补充层一行里，"现状"（before）怎么写？新增一个原来没有的字段怎么写？写错了会怎样？
   e. 做某一项时我看到"同一类问题成批出现"或"原始数据里其实有"，我怎么办？
   f. 一个工作项的完成标准（13 步里最关键的三步）：
   g. 登记项没降到文档写的数，我能做什么、不能做什么？
   h. 书上读不到、或书上与文档矛盾，我怎么办？
   i. 哪两种情况我要停整站？其余情况我怎么处理这一项？
4. 我发现的疑问／文档矛盾（没有就写"无"）：
```

**回执写进报告后直接开始 E1**，不等驾驶员回复（驾驶员 2026-11-01 定）。环境核对任何一条对不上，按上面的"停手范围"处理。

---

## 3. 工作项总览（名单与实测数字以 `E_逐条站.md` 为准；细节读对应规格）

> 每项的放行 `expect` ＝ **条目数**，来自本表／规格，不是跑出来再抄的数。

### E1 角色特性（规格 03 的 3d-3／3d-7／3d-8／3d-9／3d-2，04 的 4-1～4-3）

| 项 | 改什么 | 实测 | 最容易出的错 |
|---|---|---|---|
| E1-1 | 狂暴等 3 个 `when`＋奥术守御公式 1 个 | 4 | `when` 的值只用冻结记录里列出的；原始数据没有，Foundry 也没有 |
| E1-2 | 资源池最大次数（卓越骰、预兆骰、神圣感知、引导神力），数值型 `scaleValue` | 4 个特性（`b5-max-feature.*`） | 卓越骰、预兆要在子职业上**新增**数值型 `scaleValue`；引导神力改的是**职业**里的成长数值；对 PHB，不凭记忆 |
| E1-3 | 多余 `uses`、书之魔契、逝者遗物特殊资源、`Font of Magic` 补 `uses`（Foundry 开源数据有，直接取）、法力恢复戒指 | 约 14 | 条目文字＋Foundry SRD 数据；不确定的停 |
| E1-4 | 资源关系：消耗他池 9、恢复他池 4、特殊休息规则 4＋`rest-tracker` 2＋`rest-trigger-choice` 7（吟游诗人学院 3 个"消耗吟游灵感"Foundry 开源数据有，直接取） | 约 31 | `type` 保持 `resource`；目标写池特性 id；字段位置只能用 01 规定的 |
| E1-5 | 纯文字特性 A 类（影响派生数值）逐条判：结构化／误报／`undecided` | **79**（8 批左右，每批 ≤20） | 误报写进处置文件**不改数据**；拿不准写 `undecided` 并报告，**不要自行判"不做"** |
| E1-6 | 效果说明里残留的派生数值：寒霜符文检定加值 2 行；奇械师"领导力"2 行（表达不了就删说明） | 4 | 表达不了所以只删说明的，报告里**单列** |

### E2 状态（03 的 3d-4，04 的 4-4）

| 项 | 改什么 | 实测 | 最容易出的错 |
|---|---|---|---|
| E2-1 | 5 个状态补要点与说明 | 7 登记项 | 说明写在 `effects` 的 `note` 里，不是 `/data/text` |
| E2-2 | 状态里"针对它的攻击"（`against`／`autoCrit`，8 个状态） | 8 | 只用 01 规定的位置与枚举 |

### E3 物品（03 的 3d-5a／3g-1～3g-3）

| 项 | 改什么 | 实测 | 最容易出的错 |
|---|---|---|---|
| E3-1 | 抽查类型与分类：每个 `itemKind` ≥2 件；`other` 8 件与无类型魔法护甲 4 件逐个确认 | 约 60 件 | **抽查为主**；发现成批错误就是转换器问题 → 停 |
| E3-2 | 65 件只有兜底"使用"动作的消耗品：按条目文字改成具体动作（可只做有明确数值的） | ≤65 | 每个至少有一个 `activities`；治疗→`heal`，豁免伤害→`save`，其余→`utility`；数值逐字取自条目文字；Foundry 开源数据已取过（这 65 件它没有） |
| E3-3 | 固有每日／长休／短休次数：文字写了次数却没有结构的非消耗品 | 42（严格口径约 14） | 严格口径先做；拿不准的列清单报告 |
| E3-4 | 充能花费 | **默认不做** | 决定项；除非驾驶员说做 |

### E4 怪物与召唤（03 的 3e-1～3e-3，04 的 4-9）

| 项 | 改什么 | 实测 | 最容易出的错 |
|---|---|---|---|
| E4-1 | 怪物装备抽查：对不上的护甲文字；书上 AC 与物品推算不符（约 6，书上如此就不改）；攻击连武器抽查 30＋15 | 抽查 | 成批错＝转换器问题 → 停 |
| E4-2 | 召唤物里 P3 没解析的：5 个多形态父条目与 7 个"第二种伤害丢了"的攻击，手写 | 12 | 公式变量只用 01 规定的；写完用求值检查（见 `tests/data/p-pipeline.test.ts` 的召唤段） |
| E4-3 | 3c 遗留：`c1-resist-text` 3、`c10-object-no-stats` 3（魔能炮台）、`c13-hp-special-other` 1（牌组守卫） | 7 | 读 MM／DMG／相应书原文 |

### E5 表格（03 的 3f-1～3f-3）

| 项 | 改什么 | 实测 | 最容易出的错 |
|---|---|---|---|
| E5-1 | 抽查字典命中的绑定（每章节 ≥3 张；歧义章节逐张） | 抽查 | 成批错＝字典问题 → 停，规划者改 |
| E5-2 | 仍无主人又有书里位置的表：逐张看是否该绑（先看 MTF 9、VGM 2、SCAG 3） | 约 20 先看 | 剩余约 450 张多数本来独立（DMG 宝藏／NPC／填充），**不要硬绑** |
| E5-3 | 参考表按行主人（身高与体重等） | 3–4 张 | — |

---

## 4. 补充层怎么写（本站的核心技术点）

### 4.1 文件

- 位置：`tools/data/overlay/`。命名 `E<子站号>-<领域>-<内容>.json`，例：`E1-角色特性-狂暴条件.json`。**一个工作项一个文件**（E1-5 每批一个）。`_` 开头的文件不读。
- 内容（严格 JSON，zod 严格校验，多写未知键会报错）：

```json
{
  "领域": "E1 角色特性",
  "说明": "可选：这个文件做什么",
  "rows": [
    { "id": "feature.barbarian-rage.phb", "path": "/data/effects/0/when", "op": "set",
      "after": "wearingNoHeavyArmor", "basis": "PHB p.48 狂暴；冻结记录 §3 的 when 取值", "source": "book" }
  ],
  "add": [ { "pack": "dnd5e2014-phb", "entry": { "id": "…", "type": "…" }, "basis": "…" } ]
}
```

- `op: "set"`／`"delete"`：**必须**写 `before`＝你用 T1 看到的**真实现状**；对不上构建直接失败。
- **新增一个原来没有的字段**：`op: "set"` 且**完全不写 `before` 这个键**（含义＝"现状：这个字段不存在"）。写了 `"before": null` 是"现状就是 null"，不是"不存在"。
- `op: "insert"`：不写 `before`；`path` 的最后一段是数组下标，`after` 插在那个位置。**同一个数组多处 insert 要从后往前写**，否则下标错位。
- `basis` 必填：书名＋页码，或参考文件＋字段；"同上""显然""常识""5etools"都不算。`source` 可选：`book`｜`foundry-open`｜`5etools`｜`decision`。
- 新增条目用 `add`（极少用）。
- 条目有书和章节归属，`id` 就是包里条目的 id；找不到条目构建会失败。

### 4.2 放行规则（`tests/data/g2-allow/e?.ts`）

- 每个补充层文件对应一条或几条放行规则：`ids` 精确列出该文件改到的条目，`expect` ＝ 条目数（来自规格，**不是跑出来再抄**）。写法照 `tests/data/g2-allow/s3b.ts` 里的 `ids` 规则（已退役的旧写法不照抄；用 `ids` 不用 `type`）。
- 一个文件 ≤400 行；放行规则多时按工作项分段，注释写清对应的工作项编号。

### 4.3 常见报错与含义

| 报错 | 含义 |
|---|---|
| 补充层校验失败（zod） | 键名或类型错了，对照 4.1 |
| `before` 对不上 | 现状不是你以为的值——**先用 T1 看现状**，不要把 `before` 改成"让它通过的值"（红线） |
| 找不到条目 | id 写错，或该条目不在包里；不要用别的条目代替 |
| 构建报 schema 校验失败 | 你把字段放错位置了——**停手，不要改 schema** |

---

## 5. 一个工作项怎么做（节拍；细则在 `00` 第 5 节）

### 5.1 标准 13 步（压缩版，一步都不许省）

1. 读工作项，**用一句话**复述"改哪些条目的哪个字段、从什么到什么、依据什么"。
2. 用 T1（`tools/g2/show.ts`）看 3 个典型条目现状；用 T3 完整清单（`G2_WRITE=1` 跑相关测试会写出 `tools/data/out/g2-full/<组>.json`）确认条目数**等于文档数**，不等 → **停**。
3. **先确认原始数据真的没有**：看台账里这一项的结论；再用 T1 看这几条的 `extra`／`facets`，看 5etools 原字段里有没有相应内容。发现有 → 按 `00` 第 14 节第 3 条**停手**。
4. **去查原书／参考资料**：每个要写进去的数，都要在书里找到那一句话（读法见 `00` 第 4 节 T7）。找不到 → 停手协议。
5. **同时**写补充层文件（4.1）和放行规则（4.2）。
6. 构建（命令见 5.2），日志里应有补充层行数且与预期一致。
7. 跑**本项相关**的 `g2*` 数据测试——**预期失败**，且失败原因必须是"登记的发现变了／没复现"。
8. **读失败信息**。失败项必须 ⊆ 本项目标项；出现任何别的失败 → **停**。
9. `G2_WRITE=1 npx vitest run --config vitest.data.config.ts <相关测试文件>` 重写登记。
10. `npx tsx tools/g2/registry-diff.ts --groups … --allow "…"`（`--allow` 只写本项目标登记项，照 `00` 第 7 节），必须退出码 0，变化清单与预期一致。
11. `npx vitest run --config vitest.data.config.ts tests/data/g2-additive.test.ts tests/data/g2-oldext.test.ts tests/data/overlay.test.ts tests/data/p-pipeline.test.ts` 全过。
12. `npm run check`，再 `npm run test:data`，全过。
13. **抽查 3 条**：T1 看修完的条目，对照来源原文，在报告里写"条目／字段／值／来源页码或字段／是否一致"。写不出来源＝没做完。然后更新进度账该行，提交（补充层文件＋放行规则＋进度账改动放进同一个提交）。

### 5.2 固定命令（直接复制）

```bash
# 构建（日志放 tools/data/out/，已被 git 忽略）
TRPG_DATA_TAG=main npm run build:data > tools/data/out/build-N.log 2>&1; tail -3 tools/data/out/build-N.log
grep -E '^dnd5e2014-' tools/data/out/build-N.log                     # 看 11 个哈希

# 构建副产物：每次构建后、提交前，这五个报告文件只有日期变化就还原
git diff --stat
git checkout -- docs/probes/D1.1_人物数据_报告.md docs/probes/D1_抽检.md docs/probes/D1_构建报告.md \
  docs/probes/D1.2a_R13_对照报告.md docs/probes/D1.2a_R14_清洁报告.md
# 数据仓库：构建会改包和 catalog.json——工作期间保持"已修改"状态，不要还原其中任何一个，子站交回时一起提交（第 8 节）

# 单个数据测试 / 重写登记
npx vitest run --config vitest.data.config.ts tests/data/<文件>
G2_WRITE=1 npx vitest run --config vitest.data.config.ts tests/data/<文件>

# 登记对比（累计巡检：和本站起点比）
npx tsx tools/g2/registry-diff.ts --base <START> --show
```

### 5.3 提交

- 作者：`git -c user.name=didhogg -c user.email=143271304+didhogg@users.noreply.github.com commit …`（**不要把 `-c` 选项存进变量**，zsh 会出错）。提交说明末尾加：`Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`。
- 说明格式：`G2.5 E<子站>-<编号>：<一句话中文大白话>`，空一行，再三行：`改了什么 / 依据（书名＋页码）/ 登记变化`。
- **一个工作项一个提交**；提交前 `git status`，不许有散落的新文件。
- 数据仓库：每个子站结束时提交一次（见第 8 节），**不推送**。

### 5.4 读原书的纪律

- **原书优先**：官方书文本 ＞ D&D 5e API／Foundry 开源数据（只限 SRD 内容）＞ 5etools（只当"导入有没有丢字段"的对照，**不当裁判**）。
- **原书不许进仓库**：报告和 `basis` 里只写页码和结论，**不要把原书整段文字贴进去**。数据里需要的"忠实翻译的文字块"是翻译不是转抄。
- **OCR 数字**必须算式自洽才算读对；不自洽或读不清 → 停。
- **拿不准 → `undecided`／停手**，不要凭"通常是这样"写。

---

## 6. 进度账与换人接手

- 文件：`docs/probes/D1.2-G2.5_第3站进度账.md` 的 E 部分。每个工作项一行：⬜ 未做／🔶 做了一半或被卡住（写原因）／✅ 完成。
- 每完成一个工作项，**在同一个提交里**把该行改成 ✅，填登记变化；上一行的提交哈希在下一个提交里补即可。
- **如果你是中途接手的新执行 agent**：照样走第 2 节（读文档＋环境核对＋回执），但环境核对里"START"用进度账里已填的那个；"registry-diff 与 HEAD 一致"那条会因已做的工作项而不同——正常，用 `registry-diff --base <START> --show` 对照进度账逐项解释；回执里加一条"接手时进度账状态"。从第一个 ⬜／🔶 开始，**不要重做 ✅ 的**。

---

## 7. 中途不跑偏：巡检与漂移信号

### 7.1 每完成约 5 个提交、以及每个子站结束前，做一次巡检

```bash
git status --short                                          # 只许有你有意要提交的东西
git log --oneline <START>..HEAD                             # 提交数 = 进度账里 ✅ 的数；每个提交只含该项的改动
npx tsx tools/g2/registry-diff.ts --base <START> --show     # 累计变化只能是"已完成项"的那些登记项（对照进度账逐项解释）
git diff <START>..HEAD --stat -- src tests/data/consumer tools/data/convert tools/data/config tools/data/validate tools/data/fix vitest.data.config.ts vitest.config.ts   # 预期：没有任何输出
git diff <START>..HEAD --stat -- tests/data/g2-allow | grep -v 'g2-allow/e[1-5].ts'                                                                              # 预期：没有任何输出
git diff <START>..HEAD --stat -- tools/data/overlay | grep -v 'overlay/E'                                                                                         # 预期：没有任何输出
```

任何一条不符合预期 → **停**，把输出贴给驾驶员。

### 7.2 漂移信号对照（出现 = 你可能走偏了）

| 你正在做／想做 | 这说明 | 应该怎么办 |
|---|---|---|
| "这个测试断言太严了，放宽一点"／删测试／`.skip` | 想让数字变绿 | **停**。数字对不上说明数据没改对或读取器问题，报告 |
| 直接 `G2_WRITE=1` 重写登记而没先看失败原因 | 跳过第 7、8 步 | 先读失败信息，确认失败项 ⊆ 本项目标项 |
| `registry-diff` 报"不在 --allow 里却变了"，你想把它加进 `--allow` | 你改串了 | **停**；`--allow` 只放本项目标登记项 |
| 登记没降到文档写的数，你想去改读取器／转换器／字典 | 怀疑管线 | **停**，报告（那些归规划者；规划者当场修） |
| 补充层行的 `before` 写成"让构建通过的值" | 自指 | `before` 必须是 T1 看到的**真实现状** |
| `basis` 写"同上""显然""常识""5etools" | 没有来源 | 写书名＋页，或参考文件＋字段；写不出就**停** |
| 往 `fixed` 里硬塞类别项、往没有定义的位置塞字段 | 绕过检查／被静默丢字段 | **停**。新字段只能放在 01 规定的位置 |
| 想新增效果 kind、字段、记号、枚举值 | 冻结被你碰了 | **停** |
| 同一类修正你已经写了十几个，而且很像 | 那是管线问题，不是逐条问题 | **停**，按 `00` 第 14 节第 3 条报告 |
| 想"顺手"修旁边发现的问题（含文档没提的登记项） | 头号走偏原因 | 写进报告"待议"，不改 |
| 放行规则 `expect` 是你跑出来后才抄的数 | 自指 | `expect` 必须来自文档里的条目数 |
| 对 `b3-A-derived-in-text` 的条目，拿不准就判"误报" | 偷懒 | 拿不准的一律 `undecided`，报告里列给驾驶员 |
| 想手改 `.trpgpack`、`tools/data/out/`、数据仓库里的文件 | 越权 | 只能写补充层文件，让构建产出 |
| 想提交构建副产物（报告里只有日期变化） | 污染提交 | 还原（见 5.2） |
| 想 `git reset --hard`／`git checkout .`／`git clean`／`rm -rf` | 危险操作 | 只许 `git revert` 或 `git checkout -- <具体文件>` 且只回退你自己改的 |
| 想推送／跑整套 e2e／改包版本号／手改 `catalog.json` | 越权 | **不做** |
| 一个子站没做完就想先去做下一个 | 串站 | **停**，先收完交回 |

---

## 8. 停手协议

### 8.1 什么时候必须停（`00` 第 11 节全文有效；这里是本站最可能遇到的）

1. 文档之间、文档与现状**对不上**（条目数、id、现状值、预期登记数）。
2. 某工作项做完，登记项**没降到文档写的数**，或出现**新发现**，或别的登记项变了（文档写明的联动除外）。
3. `g2-additive` 显示有**不在放行名单里的变化**，而你解释不了它是怎么来的。
4. 要核对的来源（书页、参考文件）**读不到**，或读到的数与文档**不一致**。
5. **同一类问题成批出现，或原始 5etools／Foundry 数据里其实有**（`00` 第 14 节第 3 条）。
6. 构建报错你没见过、且不是"`before` 对不上"这种一眼能看懂的（尤其是 schema 校验失败）。
7. 你发现自己需要改 `src/`、读取器、转换器、字段形状、版本号才能继续。

### 8.2 停手时怎么报（直接发给驾驶员，格式固定）

```
【E 站停手报告】
卡在：E?-N <标题>（第 X 步）
现象：<命令 + 关键输出，原样贴，不要转述>
我做了什么：<已提交哪些、当前工作区状态（git status）、进度账状态>
我的判断：<可能原因；"不确定"就写不确定，不要装作知道>
我没有做的：<列出你本可以"绕过去"但选择没做的事>
需要谁决定：规划者（管线／读取器／文档问题）／ 驾驶员（范围／原书）
```

**停手后不要继续往下做别的工作项**（可能依赖这个项）。工作区保持干净；把该行进度账标 🔶 并写原因。

---

## 9. 子站交回（每个子站做完都要做）

1. 巡检（7.1）全部符合预期。
2. 连跑两次构建（日志 `build-a.log`、`build-b.log`），`diff <(grep '^dnd5e2014-' tools/data/out/build-a.log) <(grep '^dnd5e2014-' tools/data/out/build-b.log)` **无输出**。
3. `npm run check`、`npm run test:data`（含 `g2-additive`、`g2-oldext`、`overlay`、`p-pipeline`）全过。
4. 快速 e2e 子集与升级场景（**数据变了才跑**；先 `npm run build`）：
   ```bash
   E2E_SUITE=library E2E_ENGINE=chrome E2E_VIEW=desktop E2E_SCHEME=light node tests/e2e/smoke.mjs   # 约 100 秒，预期 95 项 PASS
   E2E_SUITE=upgrade E2E_ENGINE=chrome E2E_VIEW=desktop E2E_SCHEME=light node tests/e2e/smoke.mjs   # 约 25 秒，预期 13 项 PASS
   git checkout -- docs/reviews        # 跑 e2e 会改写截图，还原
   ```
   本站**不改 `src/`**，所以 `npm run build` 不应让 `dist/` 有变化；若有变化 → `git checkout -- dist` 还原并在报告写明。注意：扩展仓库里的 SRD 包 `packs/dnd5e2014-srd.trpgpack` 会随数据变化，**它属于预期变化，要和你的补充层文件一起提交**（每个工作项的提交里若 SRD 的哈希变了就带上它）。**不要跑整套 `npm run e2e`**。
5. 写报告：在 `docs/probes/D1.2-G2.5_报告.md` 末尾追加"E 站 · E?"一节，格式照 `00` 第 10 节：一句话结果／做了什么（每项：编号、条目数、补充层文件名、提交哈希）／**登记表变化**（`registry-diff --base <START> --show` 的**完整输出**）／抽查记录（每项 3 条，写来源）／钉死数字测试的更新（没有写"无"）／验证（命令＋结果）／**遇到的所有不顺**／**来源单一清单**（只有 5etools 一个来源、书上读不到的）／**表达不了所以只删说明的清单**／**我发现的病根在转换器的情形**（没有写"无"）。
   - E1 另附：E1-5 处置汇总（结构化 N 条／误报 N 条／待驾驶员定 N 条，逐条列 id 与理由）。
   - E3 另附：E3-2 每件物品"条目文字关键句→你写的动作"对照表。
   - E4 另附：E4-2 召唤公式的求值验收表（每个公式在基础环阶与高两环下的值）。
6. 更新进度账（所有 ✅ 的行＋"子站交回记录"一行）、`NEXT.md`（当前任务写"E 站 E? 子站完成，等规划者核验"）；提交扩展仓库。
7. **数据仓库提交一次**：`cd /Users/xxx/tavern-trpg-data && git add -A && git -c user.name=didhogg -c user.email=143271304+didhogg@users.noreply.github.com commit -m "G2.5 E? 子站：数据包与目录"`——**包和 `catalog.json` 一起提交，不要拆开，也不要还原其中一个**。不推送。
8. **停下**。最终回复用下面的格式。

### 最终回复模板（把 E? 换成 E1／E2／…）

```
【E 站 · E? 子站完成，等规划者核验】
一句话结果：<先说结果，大白话>
提交：<扩展仓库本子站每个工作项的提交哈希 + 报告提交 + 数据仓库提交>
registry-diff（对照 START）：<完整输出>
两次构建哈希：<11 个哈希；两次相同的证据>
验证：<check / test:data / g2-additive / g2-oldext / overlay / p-pipeline / 快速 e2e / 升级场景 各自的数字>
抽查：<每项 3 条，条目/字段/值/来源页码/是否一致>
钉死数字测试更新：<无 / 列表>
遇到的所有不顺（哪怕你绕过去了）：<逐条；没有就写"无"，但要确认真的没有>
来源单一／表达不了的清单：<列表，没有写"无">
我发现的病根在转换器的情形：<列表，没有写"无">
待议（我看到但没改的）：<列表>
未做／未验证：整套 e2e 未跑；真机未看；未推送
```

---

## 10. 规划者核验会看什么（让你心里有数，也别抱侥幸）

- `git diff START..HEAD` 里 `src/`、读取器、转换器、配置、校验、`fix/` 有没有被碰；`g2-allow` 里除 `e1`～`e5` 外有没有被碰；`overlay/` 里有没有非 `E` 开头的新文件。
- 每个放行规则的 `expect` 是否来自文档、是否精确。
- **每个补充层行的 `before`／`basis` 是否真实；随机抽 10 条以上对着原书核**。
- 有没有"成批相似的修正"（那是管线问题）。
- 登记对比是否**只有**目标项变化；联动项你是否都解释了。
- 是否有"让数字变绿"的痕迹（改断言、跳测试、字段放进会被丢掉的位置、重写登记前没有失败记录）。
- 构建是否确定（两次哈希相同）；有无散落文件、构建副产物混进提交；数据仓库包与 `catalog.json` 是否同步。
- 报告里"遇到的所有不顺"是否诚实：**绕过去但没报告，比停手报告严重得多。**

核验通过后，**规划者通知驾驶员，驾驶员再对你说"规划者核验通过，继续 E2"（或 E3、E4、E5、或"E 站全部通过，等收尾指令"）**；在那句话之前，你不要开始下一个子站。收到后的开工动作很短：`git status` 干净 → `git log --oneline <上次交回的最后一个提交>..HEAD`（看规划者核验时改了什么）→ 读 `E_逐条站.md` 与对应规格 → 继续，**不用重发完整回执**（除非环境核对出现不符）。

---

## 11. 环境小抄（这台机器上踩过的坑）

- Shell 是 **zsh**：不要把 `-c user.name=…` 之类选项存进变量再展开；`echo ====` 这种以 `=` 开头的参数会被当命令展开，用 `printf`；**没有 `timeout` 命令**。
- macOS 的 `sed -i` 要写成 `sed -i.b …` 再删 `.b` 文件；`grep --include` 在 zsh 里可能报错，改用 `grep -rl pattern dir`。
- `cd` 到别的目录会改变后续命令的工作目录：**用绝对路径**，或每条命令前 `cd /Users/xxx/tavern-trpg-assistant`。
- 临时文件放**你的环境指定的临时目录**或 `tools/data/out/`（被忽略），**不要用 `/tmp`**；一次性调试脚本放 `tools/g2/` 且文件名以 `_` 开头，提交前删掉。
- Python 一律 `python3 -I`（隔离模式）。
- 读原书：VGM 有文字层、MTF 是扫描件 OCR，见 `00` 第 4 节 T7；英文 PDF 在 `/Users/xxx/Downloads/龙与地下城官方资料/`，用 `pypdf`／`pdfplumber`；中文 txt 在 `reference/龙与地下城官方资料/txt/`（只读）；Foundry 开源数据副本在 `reference/foundry-dnd5e-open/`（只读，不入库）。
- 单文件 ≤ 400 行（`tests/fileSize.test.ts` 会查，JSON 补充层文件也尽量别过长，必要时按批拆文件）；不写空 `catch`；不用 `any` 蒙混。
- **永远不要**：`--update-snapshot`；`git checkout -- catalog.json`；`git checkout -- docs/probes/D1.2a_R8b_去向审计.md`；`git reset --hard`；`git clean`；`rm -rf`；推送。

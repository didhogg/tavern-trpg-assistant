# G2.5 执行 agent 交接文本（第 3 站：对照原书逐条结构化）

> **驾驶员：把本文件整份原样粘贴给执行 agent。** 它是自包含的：执行 agent 先读完这一份，再按里面的顺序去读执行包。
> 本文件管"怎么开工、中途怎么不跑偏、什么时候停、怎么交回、怎么换人接手"；每个工作项的具体改法在 `03_第3站_结构化.md`，通用规矩在 `00_总则与防走偏.md`。**本文件与它们冲突时，以 00／01／03 的最新版为准，并立即停手报告冲突**（不要自己挑一个）。
> 第 2 站（统一写法）已做完并由规划者核验通过；这是**第 3 站**。上一份交接文本 `执行agent交接文本_第2站（已完成）.md` 只作参考，**里面的"起点数字／哈希／命令里的站号"不要照抄**。

---

## 0. 你是谁、这次做什么（先看完这一节再往下）

- 你是 **G2.5 数据修正的执行 agent**。项目是一个 SillyTavern 扩展（"TRPG 跑团助手"，Vue 3 + TypeScript），里面有一套 D&D 5e（2014）资料库（11 个内容包 `.trpgpack`，8,841 个条目）。资料库已经体检过，登记了发现项（`docs/probes/D1.2-G2_发现登记/*.json`）；规划者（另一个 agent）做完了第 0、1 站，你（上一位执行 agent）做完了第 2 站，规划者核验通过。
- 第 3 站要做的事：**对照原书，把"书上有明确数字/规则、数据里却缺了或写错了"的地方改对**。这一站的特点是：**每个数值你都要自己去查原书/参考资料**，不能凭记忆、不能凭"通常是这样"。
- 第 3 站很大，分四个子站：**3a 装备与职业 → 3b 种族背景法术专长 → 3c 怪物与世界 → 3d 效果状态资源池**，约 48 个提交。**每个子站做完就停**，交回规划者核验；驾驶员说"规划者核验通过，继续 3b（或 3c、3d）"才进下一个子站。**不要一口气做完四个子站。**
- 你这次**只做第 3 站**。第 4 站（把新字段 `consumes`/`restores`/`tracker`/`against`/`summon`… 填进数据）和收尾**不要碰**，哪怕文档就在旁边、哪怕你觉得顺手。
- 你的权限：改修正表／规则（`tools/data/fix/`）、放行名单（`tests/data/g2-allow/s3*.ts`）、站报告、进度账、`NEXT.md`、`docs/probes/D1.2-G2.5_纯文字A类处置.json`；**不改 `src/`、不改读取器（`tests/data/consumer/**`）、不改转换代码（`tools/data/convert/**`）、不改字段形状、不改包版本号、不改 `vitest` 配置；不推送、不发布、不安装、不跑整套 e2e、不启动别的 agent**。
- 你的产出：每个工作项一个提交 ＋ 站报告里每个子站一小节 ＋ 进度账 ＋ `NEXT.md` ＋ 每个子站的最终回复。

**为什么要这么严**：这个项目前面出过的事故，几乎都是"AI 看到数字对不上，就顺手改测试／改读取器／改期望值让它变绿"。你的任务不是让测试变绿，而是**让数据真的变对，并且能证明只改了该改的**。每一步都有硬闸门；闸门拦住你时，**停手报告比绕过去好一万倍**。

---

## 1. 现状快照

| 项 | 状态 |
|---|---|
| 包版本 | 11 个包都是 **1.4.0**（**你不许改版本号**） |
| 冻结 | 新字段形状（`01_字段规格.md`）已冻结，**一个字都不许改** |
| 工具 | T1 `show`、T2 `registry-diff`、T3 完整清单、T4 修正引擎、T5 `g2-additive`、T6 `g2-oldext`、T7 读原书 PDF——**全部已造好**，别另造 |
| 登记总数 | **109 项**：`data-defect` 72、`decision` 24、`source-defect` 13（第 2 站结束 110，规划者核验时排除 8 个 DMG 示例陷阱的 `c9-hazard-no-rating` → 109；`冻结记录.md` 第 8 节有全部调整） |
| 测试基线 | `npm run check`：36 个文件／305 项；`npm run test:data`：119 个文件／370 项；全绿。`vitest.data.config.ts` 的单个测试超时已放宽到 60 秒（别再改） |
| 起点哈希（11 个包，第 2 站结束＝第 3 站起点，**数据没动**） | 见 2.2 的核对命令里的表 |
| 仓库 | 扩展仓库 `/Users/xxx/tavern-trpg-assistant`（分支 `main`）；数据仓库 `/Users/xxx/tavern-trpg-data`。两个都**只做本地提交** |
| 放行名单 | 已建好空骨架：`tests/data/g2-allow/s3a.ts`、`s3b.ts`、`s3c.ts`、`s3d.ts`（`index.ts` 已接好，每个文件 ≤400 行）。第 1、2 站的 `s1.ts`、`s2.ts` **不要改** |
| 进度账 | `docs/probes/D1.2-G2.5_第3站进度账.md`：每个工作项一行。**换人接手靠它** |

**事实来源，按听谁的排序**：驾驶员当次消息 ＞ `00` ＞ `01` ＞ `03`（本站文档，**规划者已按当前数据逐处改过**）＞ 旧清单 `docs/handoff/D1.2-G2.5_数据修正_执行文档.md`（只当"问题清单"，**做法听本包**）。原书与文档矛盾 → 停手报告，**不要自己挑**。

### 1.1 规划者已替你查出并改正的坑（读 03 时遇到这些地方，以 03 最新版为准；你不用重新发现）

| 地方 | 旧想法 | 事实（现在 03 里写的） |
|---|---|---|
| 3a-1 起始装备"固定给一个圣徽／法器／任意简易武器" | 往 `fixed` 里放类别项 | `fixed` 只收具体物品，放类别项会被构建校验拒绝（旧扩展也拒绝）→ 写成"**只有一个选项、且全是类别项**的 `choice` 块"。读取器已按"固定项"数它 |
| 3a-1 游侠第 2 个选一 | 任意两把简易武器 | 英文原文是"两把简易**近战**武器" → `weapon:simple-melee` ×2 |
| 3a-4 两个子职业的 `spellcasting` | 只删 `progression` | `progression` 是必填字段，删了构建会失败 → **整块删 `spellcasting`** |
| 3b-7 | 11 个条目要改 | 实际只改 **6 个**（5 个背景换载具记号＋原初语条目加方言代码）；6 个种族一个字不改 |
| 3c-3 | 6 个怪物 | **7 个**怪物（8 处） |
| 3c-5 陷阱危险等级 | 读 DMG 补 8 个 | 书上**没有**这项（只有 DC 与伤害），规划者已排除出登记，**不做** |
| 3c-5 器械攻击 `activities` | 写在 action 上 | `object` 的 `actions` 是正文块，放不下 → 写在**条目层** `/data/activities`（读取器已同步） |
| 3d-2 | 14 个条目 | **7 个**条目（起点 15 → 6）；3 个注法特性已排除；暴击 4 行＋怪物领导力 2 行归第 4 站；"做完"＝对应的 Foundry 说明被**删掉** |
| 3d-4 | 缺的说明写在 `/data/text` | 读取器看的是 `effects` 里的 `note`；5 个状态；`b6-against-text-only` 会 **8 → 11**（预期联动） |
| 3d-5 消耗品 | 需要掷表的只留文字 | 读取器要求每个都至少有一个 `activities`；没有"只留文字"这一档 |
| 3d-5 充能恢复时机 | `recharge:'special'` 并写 `per` | `charges` 没有 `per` 字段；`recharge` 只能取枚举值 |
| 3d-6 消耗指向 | 按名字找特性 | 41 个只有 3 种名字，用**三行字典**；`type` 保持 `resource` |
| 3d-7 | 4 个特性改 `uses` | 要改 **6 个条目**，办法是在拥有者上放数值型 `scaleValue` |
| 3d-8 `rest-spell-once-no-uses` | 6 个 | 起点 **2**（另 4 个早有结构，是误报，读取器已改，**别动它们**） |

---

## 2. 开工动作（按顺序，每一步都不许跳）

### 2.1 读文档（只读这几份；不要读完别的再回来）

1. `docs/handoff/D1.2-G2.5_执行包/00_总则与防走偏.md` —— **全部读完**（红线、13 步循环、工具、停止条件 11 条、报告格式）。
2. `docs/handoff/D1.2-G2.5_执行包/冻结记录.md` —— 重点第 3 节（冻结的取值）、第 4 节（第 1 站结束的哈希）、第 7 节（已知偏差）、**第 8 节（第 2 站核验后规划者做的调整）**。
3. `docs/handoff/D1.2-G2.5_执行包/01_字段规格.md` —— 第 3 站用到：A（`uses`）、B（效果：`when`、`replace`）、C（升环 `upcast`、`cantripScaling`）、D（价格、起始装备 `id`／类别项、`toolChoose`）、E（`characteristicsFrom`、`dialectCodes`、`requires`）、F（`rating`以外的 F1～F7 里本站用到的：F6 器械 `activities`、F7 固定生命值）。**其它节扫一眼知道有就行**（`consumes`／`restores`／`tracker`／`summon`／`against` 是第 4 站的）。
4. `docs/handoff/D1.2-G2.5_执行包/03_第3站_结构化.md` —— **整份读一遍**，知道四个子站的样子；但**动手只做当前子站**。
5. `docs/handoff/D1.2-G2.5_执行包/03_附表_天生法术等级.md` —— 3b-3a 要用（31 个种族的逐行表）。
6. `docs/probes/D1.2-G2.5_第3站进度账.md` —— 看一眼；你要天天更新它。
7. `AGENTS.md`（项目常驻规则，很短）。

**不要读**：`04`（第 4 站）、`05`（收尾）、`06`（规划者自己的清单）。读了容易串站。

### 2.2 环境核对（逐条执行，把输出贴进回执；**任何一条对不上 → 停，不要继续**）

```bash
cd /Users/xxx/tavern-trpg-assistant
git status --short                                  # 预期：没有任何输出
git log --oneline | head -6                         # 预期：最上面几行是规划者的 "G2.5 第3站备课…"（含 "交接文本"）提交，往下依次能看到 "…放行名单拆成 s3a～s3d…"、"…3a-4 两个子职业整块删…"、"G2.5 站2 核验 + 第3站备课…"、"G2.5 站2 核验：数据测试超时…"
git rev-parse HEAD                                  # 记下来，叫 START（站内巡检要用；也填进进度账）
cd /Users/xxx/tavern-trpg-data
git status --short                                  # 预期：没有任何输出
git log --oneline | head -2                         # 预期：最上面是 "G2.5 站2：统一写法数据包"
cd /Users/xxx/tavern-trpg-assistant
```

构建一次（约 30 秒；日志放进已被 git 忽略的 `tools/data/out/`，不要放 `/tmp`）：

```bash
TRPG_DATA_TAG=main npm run build:data > tools/data/out/build-start.log 2>&1
grep -E '^dnd5e2014-' tools/data/out/build-start.log
```

**预期**：11 行，每行末尾的 sha256 与下表**逐个相同**：

```
dnd5e2014-srd  fddafad27f416714ecd029a93059898e2b4a159a66814276927c749e4a759764
dnd5e2014-phb  fda5ccb5d81f3b65be843df8dd80035958c46dfd84670ecfd854b3824ba1f405
dnd5e2014-scag f91b94fa089611caa65d09a77ba7a9d04c794eb60915880ee7af70a49dda92e9
dnd5e2014-dmg  78dfd0caa45bdb11d0d593de297fc38e2e1403fcf876eac230622c1c33166474
dnd5e2014-mm   f16af90d4567376b6fec9ab800cafb23f011711e9d6b57feb467f24727af86ee
dnd5e2014-xge  7926148023d7ccd0b635d11586b52f76dd286dd8166fe075fe018b25258b1312
dnd5e2014-tce  20708a3287b6249ddb3fd48139e7c4672c0c8c60e9831dc1848db00cbe1f1a05
dnd5e2014-vgm  893314c499927a5e2fb733642c97149da29583cd541c7f72c3f6705461b21f44
dnd5e2014-mtf  c319c0717ed62f853d4e4604c8bbcff9ed9f3466377a2f3762fd5daf9829b3c2
dnd5e2014-mpmm f55a1766d897c48edf141c198c78f276beeb3c628f03c4a8a225b5dd3da7a453
dnd5e2014-bmt  f1de1425d2c2796d3dd03a403b9de87f7ed15d104a676e81a5f14a60fd014566
```

构建会顺带改写文件，**立刻还原**（只还原这几个）：

```bash
git checkout -- docs/probes/D1.1_人物数据_报告.md docs/probes/D1_抽检.md docs/probes/D1_构建报告.md \
  docs/probes/D1.2a_R13_对照报告.md docs/probes/D1.2a_R14_清洁报告.md
git -C /Users/xxx/tavern-trpg-data checkout -- catalog.json
git status --short; git -C /Users/xxx/tavern-trpg-data status --short   # 预期：两个都没有输出
```

> ⚠️ **永远不要** `git checkout -- docs/probes/D1.2a_R8b_去向审计.md`（手写的审计记录）。

```bash
npm run check          # 预期：36 个文件、305 项通过（约 20 秒）
npm run test:data      # 预期：119 个文件、370 项通过（约 90～160 秒）
npx tsx tools/g2/registry-diff.ts --show     # 预期：登记表与 HEAD 完全一致
```

最后用下面这段脚本核对**起点登记数字**（它自己比对并打印 `不符`；预期**一行 `不符` 都没有**，且总数 109）：

```bash
python3 -I - <<'E'
import json,glob
reg={}
for g in glob.glob("docs/probes/D1.2-G2_发现登记/*.json"):
    for f in json.load(open(g))["findings"]: reg[f["id"]]=f["count"]
exp="""a1-equipChoices 11|a1-equipFixed 5|a1-weaponCats 1|a2-tool-choice-prose 3|a4-progression-without-slots 2|a15-unmatched 10|a15-contents-differ 3|a15-value 1|a12-size 4|a12-abilities 1|a12-innate-unlock-level 31|a12-innate-not-structured 1|rest-racial-spell-uses-duplicate 27|rest-racial-spell-uses-no-grant 2|a14-requires-text 2|a13-no-characteristics 11|a17-no-entry 11|a16-damage-type 5|a16-damage-dice 1|b9-cantrip-scaling-missing 1|b8-upcast-no-tag-targets 32|b8-upcast-no-tag-summon 20|b8-upcast-no-tag-duration 12|b8-upcast-no-tag-other 10|b8-upcast-no-tag-area 3|b8-upcast-no-tag-heal 3|b8-upcast-no-structure 80|c1-mm-hp-formula 2|c1-hp-formula-mismatch 8|c1-hp-no-formula 54|c1-passive-missing 2|c5-spell-plain-unknown 8|c10-object-actions-text-only 9|c10-object-no-stats 3|c10-object-immune-text 1|c13-hp-special-other 9|d4-keywords-miss-name-en 1|b2-zero-placeholder 13|b2-derived-in-note 15|b2-when-text 3|b2-formula-unsupported-variable 1|b6-structured-missing 3|b6-text-missing 4|b6-against-text-only 8|b7-consumable-no-activity 21|b7-charges-no-recharge 7|b4-consumption-target-missing 41|a18-no-support-in-text 6|a18-special-resource 1|a18-foundry-extra-uses 9|rest-daily-no-uses 1|rest-spell-once-no-uses 2|b3-A-derived-in-text 144|b1-ac 2|b1-hp 2|b1-speed 2|b5-max-feature.fighter-battle-master-combat-superiority.phb 3|b5-max-feature.paladin-channel-divinity.phb 2|b5-max-feature.paladin-divine-sense.phb 1|b5-max-feature.wizard-school-of-divination-portent.phb 2|c9-hazard-no-rating None|c5-spell-list-text-only None"""
bad=0
for pair in exp.split("|"):
    k,v=pair.rsplit(" ",1); want=None if v=="None" else int(v)
    if reg.get(k)!=want: print("不符",k,"实际",reg.get(k),"预期",want); bad+=1
print("总数",len(reg),"（预期 109）；不符",bad,"项（预期 0）")
E
```

### 2.3 发"开工回执"，然后**停下等驾驶员**

```
【第 3 站开工回执】
1. 环境核对：<贴 2.2 的输出摘要：哈希 11/11 一致？check/test:data 数字？起点登记脚本"不符 0 项、总数 109"？>
2. START 提交：<git rev-parse HEAD 的结果>（已填进进度账）
3. 我的理解（每条一句话，必须自己组织语言，不要抄原文）：
   a. 本站目标是什么？这一次我先做哪个子站？做完怎么办？
   b. 我可以改的位置有哪些（列文件/目录）：
   c. 我绝对不能碰的：
   d. 一个工作项的完成标准（13 步里最关键的三步）：
   e. 出现哪三种情况我必须立刻停手：
   f. 登记项没降到文档写的数，我该怎么办？（一句话说清"能做什么、不能做什么"）
   g. "固定给一个圣徽"这种类别项，在起始装备里怎么写？为什么不能写进 fixed？
   h. 书上读不到、或书上与文档矛盾，我怎么办？
   i. 子站做完交回谁？驾驶员说哪句话我才能进下一个子站？
4. 我发现的疑问/文档矛盾（没有就写"无"）：
```

**发完回执就停。** 只有驾驶员回复"回执没问题，开始"之后，才动手做 3a-1。（驾驶员会把回执转给规划者看；理解有偏差会被纠正。）

---

## 3. 工作项总览（细节以 `03` 为准；每项的"放行 `expect`"都是**条目数**）

### 3a 装备与职业（6 项）

| 项 | 改什么 | 条目 | 最容易出的错 |
|---|---|---|---|
| 3a-1 | 12 个职业起始装备补类别选项；固定类别项写成"单选项块" | 12 | ① 类别固定项写进 `fixed`（构建会拒）；② 圣武士／战士已有选项里缺元素要往选项数组里 `insert`；③ 同一职业多处 `insert` 会让块号错位，**从后往前**写；④ 游侠是 `weapon:simple-melee`×2；⑤ 记号只能用 01 D3 表里的 |
| 3a-2 | 3 个职业加 `proficiencies.toolChoose`（吟游诗人另加多职业一份） | 3 | 原来的 `tools` 文字不动 |
| 3a-3 | 奇械师火器熟练：在 `text` 末尾**追加**一个文字块 | 1 | 只追加，忠实翻译 TCE 英文原文；`a1-weaponCats` **仍为 1**（它是"来源本身"的决定项） |
| 3a-4 | 四象武僧、先祖守护者整块删 `spellcasting` | 2 | 只删 `progression` 会让构建失败 |
| 3a-5 | 新增 10 件装备 ＋ 补 3 个套组内容 | 10 新＋3 改 | 新增用 `op:'add'`（00 第 6.2 节）；**价格重量只取 PHB 装备表单独列出的，没有就不写**；`id` 与英文名约定见 03；`ADDED` 登记 10 个 id；`r11-counts` 一类钉死数字测试只改总数（红线 16） |
| 3a-6 | 牧笛 `/data/value` = 200 | 1 | — |

### 3b 种族、背景、法术、专长（17 个提交）

| 项 | 改什么 | 条目 | 最容易出的错 |
|---|---|---|---|
| 3b-1 | 4 个亚种体型 `/data/size/0`：M → S | 4 | — |
| 3b-2 | 变体人类 `abilityBonus.replace: true` | 1 | **加在种族的 `abilityBonus` 字段上，不是 `effects`** |
| 3b-3a | **逐行照附表**：31 个种族／亚种加 `level`（57 处）＋3 处次数修正 | 31 | 附表与数据对不上 → **停**，不要自己调表；不碰特质上的 `uses` |
| 3b-3b | 深侏儒补 3 个天生法术 | 1 | 用 `dawn`（每日），不是 `long` |
| 3b-3c | 费尔伯格 VGM／MPMM 两版 | 4 | MPMM 的易容术**不写 `ability`** |
| 3b-4 | 规则：删 27 个特质上多余的 `uses` | 27 | 规则条件不满足要**抛错**，不许跳过；`expectCount: 27` |
| 3b-5 | 2 个专长前置改结构 | 2 | 种族名单以 XGE 原文为准，不凭记忆 |
| 3b-6 | 12 个背景加 `characteristicsFrom`＋补 2 段文字 | 12 | 借用谁以 03 表为准（规划者已对过 SCAG 原文） |
| 3b-7 | 原初语条目加 `dialectCodes`；5 个背景换 `code:vehicles-…` | 6 | 6 个种族**一个字不改** |
| 3b-8 | 5 个法术的 `damage` | 5 | 守护之信是固定 20 点光耀 |
| 3b-9 | 魔能爆 `cantripScaling` | 1 | — |
| 3b-10-1…6 | 80 个法术的 `upcast`，**按 6 类各一个提交** | 32/20/12/10/3/3 | ① 只用已有 kind，**不许新增**；② 套不进的一律 `note`＋`auto:false`；③ `auto:true` 的数值必须**逐字**出现在 `higherLevel` 原文里；④ 每批 `b8-upcast-no-structure` 的剩余数是固定的（48/28/16/6/3/0），写进 `--allow`；⑤ 每批在报告里附"法术 id／原文／你写的 JSON"表 |

### 3c 怪物与世界（8 个提交）

| 项 | 改什么 | 条目 | 最容易出的错 |
|---|---|---|---|
| 3c-1 | 7 个怪物生命骰式 | 7 | VGM／MTF 是扫描件，OCR 数字必须**算式自洽**（骰数×均值＋加值＝生命值）才算读对；诅咒石化人**不改** |
| 3c-2 | 2 个怪物补被动察觉 | 2 | 读 TCE 英文 PDF 的 Senses 行；读不到就停，不许按技能加值推算 |
| 3c-3 | 8 处怪物施法法术名补链接 | 7 | 星号 `*`、`（暗蚀）`留在链接之后；找不到法术就停 |
| 3c-4 | 布耶格施法者：**什么都不做** | — | 起点 `c5-spell-list-text-only` 本来就是 0 |
| 3c-5a | 9 个器械的 `activities`（条目层 `/data/activities`） | 9 | 数值逐字取自条目自己的文字；魔能炮台用法术攻击／法术 DC，不写数字；防御者（临时生命值）用 `utility`，不用 `heal` |
| 3c-5b | 通用物件免疫文字 → 伤害代码数组 | 1 | 以条目文字为准 |
| 3c-5c | 位面掠夺者弩炮数 2 → 3 | 1 | **没有登记项**，不要为它新增登记；陷阱等级**不做** |
| 3c-6 | 8 个怪物固定生命值 | 8 | `hp.average` 写数，`special` 文字**保留**；牌组守卫不碰 |
| 3c-7 | 「气」关键词补英文名 `Ki` | 1 | — |

### 3d 效果、状态、资源池、纯文字特性（约 17 个提交）

| 项 | 改什么 | 条目 | 最容易出的错 |
|---|---|---|---|
| 3d-1 | 13 个效果数值 0 的占位 | 13 | 数值读原书；保持效果 `kind` 不变 |
| 3d-2 | 7 个条目：写结构化效果并**删掉** Foundry 说明 | 7 | 凶蛮重击×3、精通重击、两个怪物上的"领导力"、3 个注法特性**不碰**；表达不了的（魔鬼视界、寒霜符文激活部分）只删说明、报告单列 |
| 3d-3 | 3 个 `when` ＋ 奥术守御公式 | 4 | `when` 的值只用冻结记录里列出的 |
| 3d-4 | 5 个状态补结构化效果／说明 note | 5 | 说明写在 `effects` 的 `note` 里，不是 `/data/text`；`against`／`autoCrit` 是第 4 站的 |
| 3d-5a | 21 个消耗品补 `activities` | 21 | 每个都要有；治疗→`heal`，豁免伤害→`save`，其余→`utility` |
| 3d-5b | 7 个充能物品补 `recharge` | 7 | 只能取枚举；没有 `per` |
| 3d-6 | 规则：41 个行动的 `target` 换成池特性 id | 41 | 用三行字典；`type` 保持 `resource` |
| 3d-7 | 资源池最大次数（`scaleValue`） | 6 | 卓越骰、预兆要在子职业上**新增**数值型 `scaleValue`；引导神力改的是**职业**里的成长数值 |
| 3d-8 | 多余 `uses`、特殊资源、免费施法、每日次数 | 7＋1＋2＋1 | `rest-spell-once-no-uses` 只改 2 个，另 4 个别动 |
| 3d-9-1…8 | 144 个纯文字特性逐条判 A 类（8 个提交，每个 ≤20 条） | 逐条 | 误报写进处置文件**不改数据**；拿不准写 `undecided` 并报告，**不要自行判"不做"** |

**数据文件太长时**：一个 `.ts` 文件 ≤400 行。逐条表按"一个工作项一个文件"拆（`rows/s3a-equip.ts`、`rows/s3b-innate-level.ts`……），并在 `tools/data/fix/index.ts` 里各加**一行**注册。`3b-3a`（57 行）、`3b-10`（80 个法术）、`3d-9`（144 条）一定要拆成多个文件。

---

## 4. 一个工作项怎么做（节拍；细则在 `00` 第 5 节）

### 4.1 标准 13 步（压缩版，一步都不许省）

1. 读工作项，**用一句话**复述"改哪些条目的哪个字段、从什么到什么、依据什么"。
2. 用 T1 看 3 个典型条目现状；用 T3 完整清单（`G2_WRITE=1` 跑相关测试会写出 `tools/data/out/g2-full/<组>.json`）确认条目数**等于文档数**，不等 → **停**。
3. **去查原书／参考资料**（这一站的核心）：每个要写进去的数，都要在书里找到那一句话。读法见 `00` 第 4 节 T7（VGM 文字层、MTF 扫描 OCR、中文 txt、英文 PDF 用 `python3 -I` ＋ `pypdf`）。找不到 → 按停手协议报告。
4. 选落点：规则还是逐条表（`00` 第 6.1 节判据）。
5. **同时**写修正（`tools/data/fix/rows/s3*.ts` 或 `rules/s3*.ts`，并在 `tools/data/fix/index.ts` 里**加一行注册**）和放行规则（`tests/data/g2-allow/s3?.ts`，`expect` ＝ 条目数，**来自文档**，不是跑出来再抄）。每行修正的 `before` 是 T1 看到的**真实现状**，`basis` 写"书名＋页码／参考文件＋字段"。
6. 构建（命令见 4.2），日志里要有"修正：规则 N 个、逐条表 N 行"且与预期一致。
7. 跑**本项相关**的 `g2*` 数据测试——**预期失败**，且失败原因必须是"登记的发现变了／没复现"。
8. **读失败信息**。失败项必须 ⊆ 本项目标项；出现任何别的失败 → **停**。
9. `G2_WRITE=1 npx vitest run --config vitest.data.config.ts <相关测试文件>` 重写登记。
10. `npx tsx tools/g2/registry-diff.ts --groups … --allow "…"`（**照抄**工作项里那一行），必须退出码 0，且变化清单与预期一致。
11. `npx vitest run --config vitest.data.config.ts tests/data/g2-additive.test.ts tests/data/g2-oldext.test.ts` 全过。
12. `npm run check`，再 `npm run test:data`，全过。
13. **抽查 3 条**：T1 看修完的条目，对照来源原文，在报告里写"条目／字段／值／来源页码或字段／是否一致"。写不出来源＝没做完。然后**更新进度账该行**，提交（进度账改动放进同一个提交）。

### 4.2 固定命令（直接复制，别自己改写）

```bash
# 构建（日志放 tools/data/out/，已被 git 忽略）
TRPG_DATA_TAG=main npm run build:data > tools/data/out/build-N.log 2>&1; tail -3 tools/data/out/build-N.log
grep -E '^dnd5e2014-' tools/data/out/build-N.log                     # 看 11 个哈希

# 构建副产物：每次构建后、提交前，只有"日期/时间"变化就还原；有数字变化才保留并在提交说明写"报告随数据更新"
git diff --stat
git checkout -- docs/probes/D1.1_人物数据_报告.md docs/probes/D1_抽检.md docs/probes/D1_构建报告.md \
  docs/probes/D1.2a_R13_对照报告.md docs/probes/D1.2a_R14_清洁报告.md
git -C /Users/xxx/tavern-trpg-data checkout -- catalog.json           # 数据仓库只还原这一个文件

# 单个数据测试 / 重写登记
npx vitest run --config vitest.data.config.ts tests/data/<文件>
G2_WRITE=1 npx vitest run --config vitest.data.config.ts tests/data/<文件>

# 登记对比（累计巡检：和本站起点比）
npx tsx tools/g2/registry-diff.ts --base <START> --show
```

### 4.3 提交

- 作者：`git -c user.name=didhogg -c user.email=143271304+didhogg@users.noreply.github.com commit …`（**不要把 `-c` 选项存进变量**，zsh 会出错）。提交说明末尾按你当前环境要求加署名行。
- 说明格式：`G2.5 站3 <工作项编号>：<一句话中文大白话>`，空一行，再三行：`改了什么 / 依据（书名＋页码）/ 登记变化`。
- **一个工作项一个提交**；提交前 `git status`，不许有散落的新文件。
- **数据仓库**：每个子站结束时（不是每项）提交一次：`G2.5 站3-<子站>：<一句话>`（生成的包与 `catalog.json` 的变化），**不推送**。

### 4.4 读原书的纪律（本站新增）

- **原书优先**：官方书文本 ＞ D&D 5e API／Foundry（只限 SRD 内容）＞ 5etools（只当"导入有没有丢字段"的对照，**不当裁判**）。
- **原书不许进仓库**：报告里只写页码和结论，**不要把原书整段文字贴进报告或数据**。数据里需要的"忠实翻译的文字块"是翻译不是转抄（见 3a-3、3b-6）。
- **OCR 数字**必须算式自洽才算读对；不自洽或读不清 → 停。
- **来源单一**（只有 5etools 一个来源、书上读不到）：不许当成已核对，报告里单列"来源单一"清单，并停手问（`00` 第 11 节）。
- **拿不准 → `undecided`／停手**，不要凭"通常是这样"写。

---

## 5. 进度账与换人接手

- 文件：`docs/probes/D1.2-G2.5_第3站进度账.md`。每个工作项一行：⬜ 未做／🔶 做了一半或被卡住（写原因）／✅ 完成。
- 每完成一个工作项，**在同一个提交里**把该行改成 ✅，填登记变化；上一行的提交哈希在下一个提交里补即可。
- **如果你是中途接手的新执行 agent**（上一位上下文用完了）：照样走第 2 节（读文档＋环境核对＋回执），但环境核对里"START"用进度账里已经填的那个；"起点登记数字"脚本会因为已做的工作项而出现"不符"——**正常**，用 `registry-diff --base <START> --show` 对照进度账逐项解释；回执里加一条"接手时进度账状态"。然后从第一个 ⬜／🔶 开始，**不要重做 ✅ 的**。

---

## 6. 中途不跑偏：巡检点与漂移信号

### 6.1 每完成约 5 个提交、以及每个子站结束前，做一次巡检

```bash
git status --short                                          # 只许有你有意要提交的东西
git log --oneline <START>..HEAD                             # 提交数 = 进度账里 ✅ 的数；每个提交只含该项的改动
npx tsx tools/g2/registry-diff.ts --base <START> --show     # 累计变化只能是"已完成项"的那些登记项（对照进度账逐项解释）
git diff <START>..HEAD --stat -- src                        # 预期：没有任何输出（src 一个字都没动）
git diff <START>..HEAD --stat -- tests/data/consumer        # 预期：没有任何输出（读取器没动）
git diff <START>..HEAD --stat -- tools/data/convert tools/data/validate vitest.data.config.ts tests/data/g2-allow/s1.ts tests/data/g2-allow/s2.ts tests/data/g2-allow/index.ts   # 预期：没有任何输出
```

任何一条不符合预期 → **停**，把输出贴给驾驶员。

### 6.2 漂移信号对照（出现 = 你可能走偏了）

| 你正在做／想做 | 这说明 | 应该怎么办 |
|---|---|---|
| "这个测试断言太严了，放宽一点"／删测试／`.skip` | 想让数字变绿 | **停**。数字对不上说明数据没改对或读取器问题，报告 |
| 直接 `G2_WRITE=1` 重写登记而没先看失败原因 | 跳过第 7、8 步 | 先读失败信息，确认失败项 ⊆ 本项目标项 |
| `registry-diff` 报"不在 --allow 里却变了"，你想把它加进 `--allow` | 你改串了 | **停**；`--allow` 只照抄工作项里那一行 |
| 登记没降到文档写的数，你想去改 `tests/data/consumer/**` | 怀疑读取器 | **停**，报告（读取器归规划者；规划者已知有几处，会当场修） |
| 修正行的 `before` 写成"让构建通过的值" | 自指 | `before` 必须是 T1 看到的**真实现状** |
| `basis` 写"同上""显然""常识""5etools" | 没有来源 | 写书名＋页，或参考文件＋字段；写不出就**停** |
| 把 `type: resource` 改成 `uses`、把 `fixed` 里硬塞类别项、往没有定义的位置塞字段 | 绕过检查／被 schema 静默丢字段 | **停**。新字段只能放在 01 规定的位置 |
| 想新增 `upcast` 的 kind、新增效果 kind、新增记号 | 冻结被你碰了 | **停** |
| 想"顺手"修旁边发现的问题（含 03 里没提的登记项） | 头号走偏原因 | 写进报告"待议"，不改 |
| 一个规则的 `expectCount` 想调到"实际命中数"让它通过 | 范围不符 | 先弄清为什么实际数≠文档数；弄不清就**停** |
| 放行规则 `expect` 是你跑出来后才抄的数 | 自指 | `expect` 必须来自文档里的条目数 |
| 对 `b3-A-derived-in-text` 的条目，拿不准就判"误报" | 偷懒 | 拿不准的一律 `undecided`，报告里列给驾驶员 |
| 想手改 `.trpgpack`、`tools/data/out/`、数据仓库里的文件 | 越权 | 只能改修正表／规则，让构建产出 |
| 想提交构建副产物（报告里只有日期变化） | 污染提交 | 还原（见 4.2） |
| 想 `git reset --hard`／`git checkout .`／`git clean`／`rm -rf` | 危险操作 | 只许 `git revert` 或 `git checkout -- <具体文件>` 且只回退你自己改的 |
| 想推送／跑整套 e2e／改包版本号／手改 `catalog.json` | 越权 | **不做** |
| 一个子站没做完就想先去做下一个子站 | 串站 | **停**，先把当前子站收完交回 |

---

## 7. 停手协议

### 7.1 什么时候必须停（`00` 第 11 节全文有效；这里是本站最可能遇到的）

1. 文档之间、文档与现状**对不上**（条目数、id、现状值、预期登记数）。
2. 某工作项做完，登记项**没降到文档写的数**，或出现**新发现**，或别的登记项变了（文档写明的联动除外）。
3. `g2-additive` 显示有**不在放行名单里的变化**，而你解释不了它是怎么来的。
4. 要核对的来源（书页、参考文件）**读不到**，或读到的数与文档**不一致**，或只有 5etools 一个来源。
5. 构建报错你没见过、且不是"修正表 before 对不上"这种一眼能看懂的（尤其是 schema 校验失败——说明你把字段放错位置了，**不要**改 schema）。
6. 你发现自己需要改 `src/`、读取器、字段形状、版本号才能继续。

### 7.2 停手时怎么报（直接发给驾驶员，格式固定）

```
【第 3 站停手报告】
卡在：3x-N <标题>（第 X 步）
现象：<命令 + 关键输出，原样贴，不要转述>
我做了什么：<已提交哪些、当前工作区状态（git status）、进度账状态>
我的判断：<可能原因；"不确定"就写不确定，不要装作知道>
我没有做的：<列出你本可以"绕过去"但选择没做的事>
需要谁决定：规划者（读取器／文档问题）／ 驾驶员（范围／原书）
```

**停手后不要继续往下做别的工作项**（可能依赖这个项）。工作区保持干净；把该行进度账标 🔶 并写原因。

---

## 8. 子站交回（每个子站做完都要做；3d 做完是整站收尾）

1. 巡检（6.1）全部符合预期。
2. 连跑两次构建（日志 `build-a.log`、`build-b.log`），`diff <(grep '^dnd5e2014-' tools/data/out/build-a.log) <(grep '^dnd5e2014-' tools/data/out/build-b.log)` **无输出**。
3. `npm run check`、`npm run test:data`、`g2-additive`、`g2-oldext` 全过。
4. 快速 e2e 子集与升级场景（**数据变了才跑**；先 `npm run build`）：
   ```bash
   E2E_SUITE=library E2E_ENGINE=chrome E2E_VIEW=desktop E2E_SCHEME=light node tests/e2e/smoke.mjs   # 约 100 秒，预期 95 项 PASS
   E2E_SUITE=upgrade E2E_ENGINE=chrome E2E_VIEW=desktop E2E_SCHEME=light node tests/e2e/smoke.mjs   # 约 25 秒，预期 13 项 PASS
   git checkout -- docs/reviews        # 跑 e2e 会改写截图，还原
   ```
   本站**不改 `src/`**，`npm run build` 若让 `dist/` 有变化 → 还原（`git checkout -- dist`）并写明。**不要跑整套 `npm run e2e`**。
5. 写报告：在 `docs/probes/D1.2-G2.5_报告.md` 末尾追加"第 3 站 · 3x 子站"一节，格式照 `00` 第 10 节：一句话结果／做了什么（每项：编号、条目数、落点、提交哈希）／**登记表变化**（粘贴 `registry-diff --base <START> --show` 的**完整输出**）／抽查记录（每项 3 条，写来源）／钉死数字测试的更新（没有就写"无"）／验证（命令＋结果）／**遇到的所有不顺**／**来源单一清单**／**表达不了所以只删说明的清单**（3d-2）。
   - 3b 子站另附：3b-10 六批的"法术 id／higherLevel 原文／你写的 upcast JSON"附表。
   - 3d 子站另附：3d-9 处置汇总（结构化 N 条／误报 N 条／待驾驶员定 N 条，逐条列 id 与理由）。
6. 更新进度账（所有 ✅ 的行＋"子站交回记录"一行）、`NEXT.md`（当前任务写"第 3 站 3x 子站完成，等规划者核验"）；提交；数据仓库提交一次。
7. **停下**。最终回复用下面的格式。

### 最终回复模板（把 3x 换成 3a／3b／3c／3d）

```
【第 3 站 · 3x 子站完成，等规划者核验】
一句话结果：<先说结果，大白话>
提交：<扩展仓库本子站每个工作项的提交哈希 + 站报告提交 + 数据仓库提交>
registry-diff（对照 START）：<完整输出>
两次构建哈希：<11 个哈希；两次相同的证据>
验证：<check / test:data / g2-additive / g2-oldext / 快速 e2e / 升级场景 各自的数字>
抽查：<每项 3 条，条目/字段/值/来源页码/是否一致>
钉死数字测试更新：<无 / 列表>
遇到的所有不顺（哪怕你绕过去了）：<逐条；没有就写"无"，但要确认真的没有>
来源单一／表达不了的清单：<列表，没有写"无">
待议（我看到但没改的）：<列表>
未做/未验证：整套 e2e 未跑；真机未看；未推送
```

---

## 9. 规划者核验会看什么（让你心里有数，也别抱侥幸）

- `git diff START..HEAD` 里 `src/`、`tests/data/consumer/`、`tools/data/convert/`、`tools/data/validate/` 有没有被碰。
- 每个放行规则的 `expect` 是否来自文档、是否精确；有没有被你悄悄放宽。
- **每个修正行的 `before`／`basis` 是否真实；随机抽 10 条以上对着原书核**（3b-10 的升环附表、3d-9 的处置每个子站都会抽）。
- 登记对比是否**只有**目标项变化；联动项你是否都解释了。
- 是否有"让数字变绿"的痕迹（改断言、跳测试、`type` 被改、字段放进会被丢掉的位置、重写登记前没有失败记录）。
- 构建是否确定（两次哈希相同）；有无散落文件、有无构建副产物混进提交。
- 报告里"遇到的所有不顺"是否诚实：**绕过去但没报告，比停手报告严重得多。**

核验通过后，**规划者会通知驾驶员，驾驶员再对你说"规划者核验通过，继续 3b"（或 3c、3d、或"第 3 站全部通过，等第 4 站指令"）**；在那句话之前，你不要开始下一个子站。收到后的开工动作很短：`git status` 干净 → `git log --oneline <上次交回的最后一个提交>..HEAD`（看规划者在核验时改了什么，可能改了文档和读取器）→ 读 `03` 里下一个子站（以最新版为准）→ 继续，**不用重发完整回执**（除非环境核对出现不符）。

---

## 10. 环境小抄（这台机器上踩过的坑）

- Shell 是 **zsh**：不要把 `-c user.name=…` 之类选项存进变量再展开；`echo ====` 这种以 `=` 开头的参数会被当命令展开，用 `printf` 代替；**没有 `timeout` 命令**。
- macOS 的 `sed -i` 要写成 `sed -i.b …` 再删 `.b` 文件；`grep --include` 在 zsh 里可能因通配符报错，改用 `grep -rl pattern dir`。
- `cd` 到别的目录会改变后续命令的工作目录：**用绝对路径**，或每条命令前 `cd /Users/xxx/tavern-trpg-assistant`。
- 临时文件放**你的环境指定的临时目录**或 `tools/data/out/`（被忽略），**不要用 `/tmp`**；仓库外的脚本不能 `import` 仓库里的依赖，要跑脚本就放进 `tools/g2/`（提交前删掉你的一次性调试脚本，文件名以 `_` 开头便于识别）。
- Python 一律 `python3 -I`（隔离模式）。
- 读原书：VGM 有文字层、MTF 是扫描件 OCR，见 `00` 第 4 节 T7；TCE／MM 等英文 PDF 在 `/Users/xxx/Downloads/龙与地下城官方资料/`，用 `pypdf`／`pdfplumber`；中文 txt 在 `reference/龙与地下城官方资料/txt/`（只读）。
- 单文件 ≤ 400 行（`tests/fileSize.test.ts` 会查）；不写空 `catch`；不用 `any` 蒙混。
- 项目里 `reference/` 只读、`tools/data/out/` 与 `.trpgpack` 文件不许手改。
- **永远不要**：`--update-snapshot`；`git checkout -- docs/probes/D1.2a_R8b_去向审计.md`；`git reset --hard`；`git clean`；`rm -rf`；推送。

---

## 11. 现在开始

**先做第 2 节：读文档 → 环境核对 → 发"开工回执" → 停下等驾驶员。** 其它什么都不要做。

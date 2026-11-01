# G2.5 执行 agent 交接文本（第 2 站）

> **驾驶员：把本文件整份原样粘贴给执行 agent。** 它是自包含的：执行 agent 先读完这一份，再按里面的顺序去读执行包。
> 本文件管"怎么开工、中途怎么不跑偏、什么时候停、怎么交回"；每个工作项的具体改法在 `02_第2站_统一写法.md`，通用规矩在 `00_总则与防走偏.md`。**本文件与它们冲突时，以 00／01／站文档为准，并立即停手报告冲突**（不要自己挑一个）。

---

## 0. 你是谁、这次做什么（先看完这一节再往下）

- 你是 **G2.5 数据修正的执行 agent**。项目是一个 SillyTavern 扩展（"TRPG 跑团助手"，Vue 3 + TypeScript），里面有一套 D&D 5e（2014）的资料库（11 个内容包 `.trpgpack`，共 8,841 个条目）。
- 前面几个阶段已经把资料库**体检**过了（G2），登记了 119 项发现（`docs/probes/D1.2-G2_发现登记/*.json`），其中 **81 项是"数据缺陷"**，要修到 0。规划者（另一个 agent）已经做完了**第 0 站（打地基）和第 1 站（从 5etools 导入）**，驾驶员已签字冻结。
- **你这一次只做第 2 站"统一写法"：9 个工作项（2-1 … 2-9），共改约 140 个条目的几处小写法。** 做完就**停**，交回规划者核验。**不要开始第 3 站**，哪怕你觉得自己还有时间、哪怕第 3 站文档就在旁边。
- 你的权限：改转换代码、修正表、测试、文档；**不改 `src/`，不推送，不发布，不安装，不跑整套 e2e，不启动别的 agent**。
- 你的产出：9 个提交（一项一个）＋ 一份站报告 ＋ `NEXT.md` 更新 ＋ 一条最终回复。

**为什么要这么严**：这个项目前面出过的事故，几乎都是"AI 看到数字对不上，就顺手改测试/改读取器/改期望值让它变绿"。你的任务不是让测试变绿，而是**让数据真的变对，并且能证明只改了该改的**。所以每一步都有硬闸门；闸门拦住你时，**停手报告比绕过去好一万倍**。

---

## 1. 现状快照（规划者交给你的东西）

| 项 | 状态 |
|---|---|
| 包版本 | 11 个包都是 **1.4.0**（第 1 站已升；**你不许改版本号**） |
| 冻结 | 新字段形状（`01_字段规格.md`）已冻结，**一个字都不许改** |
| 工具 | T1 `show`、T2 `registry-diff`、T3 完整清单、T4 修正引擎、T5 `g2-additive`、T6 `g2-oldext`、T7 读原书 PDF——**全部已造好**，别另造 |
| 登记总数 | **119 项**：`data-defect` 81、`decision` 25、`source-defect` 13 |
| 你这站的目标 | 10 个登记项（见第 4 节表）变到文档写的数；**其它登记项一个都不许变** |
| 测试基线 | `npm run check`：36 个文件／305 项；`npm run test:data`：119 个文件／370 项；全绿 |
| 起点哈希 | 11 个包的 sha256 在 `冻结记录.md` 第 4 节；你开工前要自己构建一次核对 |
| 仓库 | 扩展仓库 `/Users/xxx/tavern-trpg-assistant`（分支 `main`）；数据仓库 `/Users/xxx/tavern-trpg-data`（放生成的包）。两个都**只做本地提交** |

**你要用的"事实来源"，按听谁的排序**：驾驶员当次消息 ＞ `00` ＞ `01` ＞ `02`（本站文档）＞ 旧清单 `docs/handoff/D1.2-G2.5_数据修正_执行文档.md`（只当"问题清单"，**做法听本包**）。

---

## 2. 开工动作（按顺序，每一步都不许跳）

### 2.1 读文档（只读这几份；不要读完别的再回来）

1. `docs/handoff/D1.2-G2.5_执行包/00_总则与防走偏.md` —— **全部读完**（红线、13 步循环、工具、停止条件 11 条、报告格式）。
2. `docs/handoff/D1.2-G2.5_执行包/冻结记录.md` —— 重点第 3 节（冻结的取值）、第 4 节（你的起点）、第 7 节（已知偏差：执行包里个别写法已被改过，以冻结记录为准）。
3. `docs/handoff/D1.2-G2.5_执行包/01_字段规格.md` —— 第 2 站只用到 D1（价格一位小数）、D2（起始装备 `id`）、E4（语言记号）；**其它节扫一眼知道有就行，本站不会用**。
4. `docs/handoff/D1.2-G2.5_执行包/02_第2站_统一写法.md` —— **全部读完**，每个工作项的"问题／怎么改／来源／放行／登记／命令／陷阱"。
5. `AGENTS.md`（项目常驻规则，很短）。

**不要读**：`03`、`04`（后面的站）、`05`（收尾）、`06`（规划者自己的清单）。读了容易串站。

### 2.2 环境核对（逐条执行，把输出贴进回执；**任何一条对不上 → 停，不要继续**）

```bash
cd /Users/xxx/tavern-trpg-assistant
git status --short                                  # 预期：没有任何输出
git log --oneline | head -5                         # 预期：最上面是规划者的 G2.5 提交（含"给执行 agent 的启动提示/交接文本"之类）
git rev-parse HEAD                                  # 记下来，叫 START（站内巡检要用）
cd /Users/xxx/tavern-trpg-data
git status --short                                  # 预期：没有任何输出
git log --oneline | head -2                         # 预期：最上面是 "G2.5 第1站：11 个包升到 1.4.0 …"
cd /Users/xxx/tavern-trpg-assistant
```

然后：

```bash
# 构建一次（约 30 秒）。日志放进已被 git 忽略的 tools/data/out/ 下，不要放 /tmp
TRPG_DATA_TAG=main npm run build:data > tools/data/out/build-start.log 2>&1
grep -E '^dnd5e2014-' tools/data/out/build-start.log
```

**预期**：11 行，每行末尾的 sha256 与 `冻结记录.md` 第 4 节表**逐个相同**（srd、phb、scag、dmg、mm、xge、tce、vgm、mtf、mpmm、bmt）。不同 → 停（说明环境或数据不一样）。

构建会顺带改写文件，**立刻还原**（只还原这几个，别的不要动）：

```bash
git checkout -- docs/probes/D1.1_人物数据_报告.md docs/probes/D1_抽检.md docs/probes/D1_构建报告.md \
  docs/probes/D1.2a_R13_对照报告.md docs/probes/D1.2a_R14_清洁报告.md
git -C /Users/xxx/tavern-trpg-data checkout -- catalog.json
git status --short; git -C /Users/xxx/tavern-trpg-data status --short   # 预期：两个都没有输出
```

> ⚠️ **永远不要** `git checkout -- docs/probes/D1.2a_R8b_去向审计.md`（它是手写的审计记录，不是构建产物）。

```bash
npm run check          # 预期：36 个文件、305 项通过（约 20 秒）
npm run test:data      # 预期：119 个文件、370 项通过（约 90 秒）
npx tsx tools/g2/registry-diff.ts --show     # 预期：登记表与 HEAD 完全一致
```

最后核对**本站起点登记数字**（逐个与 `02` 开头那张表比；这条命令一次列出）：

```bash
python3 -I - <<'E'
import json,glob
reg={}
for g in glob.glob("docs/probes/D1.2-G2_发现登记/*.json"):
    for f in json.load(open(g))["findings"]: reg[f["id"]]=f["count"]
for k in ["a15-value","a3-missed-match","a3-described","a17-spelling","a6-warlock-slot-level-format","b14-scroll-labels","c12-level-label","c5-spell-plain-name","d8-cult-spells-plain","a17-ambiguous"]: print(k,reg.get(k))
print("总数",len(reg))
E
```

**预期**：`a15-value 2`、`a3-missed-match 5`、`a3-described 3`、`a17-spelling 11`、`a6-warlock-slot-level-format 1`、`b14-scroll-labels 5`、`c12-level-label 40`、`c5-spell-plain-name 125`、`d8-cult-spells-plain 7`、`a17-ambiguous 3`，总数 119。

### 2.3 发"开工回执"，然后**停下等驾驶员**

回执格式（原样填，不要省）：

```
【第 2 站开工回执】
1. 环境核对：<逐条贴 2.2 的输出摘要；哈希 11/11 一致？check/test:data 数字？起点登记数字？>
2. START 提交：<git rev-parse HEAD 的结果>
3. 我的理解（每条一句话，必须自己组织语言，不要抄原文）：
   a. 本站目标是：
   b. 我可以改的位置：
   c. 我绝对不能碰的：
   d. 一个工作项的完成标准（13 步里最关键的三步）：
   e. 出现哪三种情况我必须立刻停手：
   f. 本站做完我要交回什么、交给谁：
4. 我发现的疑问/文档矛盾（没有就写"无"）：
```

**发完回执就停。** 只有驾驶员回复"回执没问题，开始"之后，才动手做 2-1。（驾驶员会把你的回执转给规划者看；理解有偏差会被纠正。）

---

## 3. 第 2 站工作项总览（细节以 `02` 为准）

建议顺序就是 2-1 → 2-9，**一项一个提交**。每项的"放行 `expect`"都是**条目数**（不是单元格数、不是出现次数）。

| 项 | 改什么 | 落点 | 条目 | 登记变化 | 本项最容易出的错 |
|---|---|---|---|---|---|
| 2-1 | 价格不取整，保留一位小数 | `tools/data/convert/item.ts` **第 172 行单行原地改**（`Math.round(x)` → `Math.round(x * 10) / 10`，同一行里的两处） | **恰好 11 件**物品（投石索子弹各种 0→0.2；滚珠 0→0.1） | `a15-value` 2→**1**（剩牧笛，第 3 站补） | 动了别的行/加了 import；`g2-additive` 里冒出这 11 件以外的价格变化 → **停**；20 颗装的价格 4 不得变 |
| 2-2 | 8 处起始装备补 `id` | 逐条表（8 行，`set`，对象换成"原对象＋`id`"） | **4 个背景**（cloistered-scholar、rewarded、sage、charlatan），放行 `expect: 4` | `a3-missed-match` 5→0；`a3-described` 3→0；`a3-free-text` 41 **不变** | 改了 `item` 显示名（必须保持书上原文）；每个目标物品必须**恰好 1 个**候选；登记不降先查 `id` 对不对，**不许改读取器** |
| 2-3 | 7 个旧记号写法换规范写法 | 一条**规则**（字典，只改 `data.advancement` 里整串相等的记号，不碰正文） | **11 个条目**，`expectCount: 11` | `a17-spelling` 11→0 | 把别的字符串也替换了；`a17-ambiguous` 此时必须**不变** |
| 2-4 | 魔契师职业表"法术位环阶"列统一成 `N环` | 规则，**限定 `class.warlock.phb`** | 1 | `a6-warlock-slot-level-format` 1→0 | 必须先对原书核对序列 `1,1,2,2,3,3,4,4,5,5,5,…`（20 行），对不上 → 停 |
| 2-5 | 法术卷轴表 5 个单元格 | **逐条表 5 行**（`set`，每行带 `before`） | **1 张表** `table.dmg-p139-r1`，放行 `expect: 1` | `b14-scroll-labels` 5→0 | "通用语"只在**稀有度列**换成"普通"（通用语是一种语言，别处不动）；别的格子一个字符都不许动 |
| 2-6 | 两张经验表的等级列统一成纯数字字符串 | 规则，限定 `table.dmg-p82-r1`、`table.dmg-p84-r1` | **2 张表**（40 个单元格），`expect: 2` | `c12-level-label` 40→0 | 规则里要断言命中的单元格数恰为 40；新值必须等于原单元格里的数字（"10th"→"10"） |
| 2-7 | 怪物施法列表里 125 处纯文字法术名补链接 | 规则 `s2-spell-links`（链接化函数放 `tools/data/fix/lib/`） | **83 个怪物**，`expect: 83` | `c5-spell-plain-name` 125→0 | ① 登记数 125 是"出现次数"，不是怪物数；② **`monster.lich.mm` 的"马友夫强酸箭"必须跳过**（巫妖在 SRD 包，法术在 PHB 包，依赖不能向上；规划者已把它排除出登记）；③ 带星号、英文名的（`c5-spell-plain-unknown` 8）本站不碰 |
| 2-8 | 7 个魔王教派的招牌法术补链接 | 规则 `s2-cult-links`，限定 7 个 id；**与 2-7 共用同一个链接化函数** | 7（类型 `cult`，MTF 包），字段 `data.signatureSpells`（字符串） | `d8-cult-spells-plain` 7→0 | 括号说明"（戏法）""(1级)"必须原样留在 `}}` 之后；别复制粘贴一份函数 |
| 2-9 | 3 个种族的 `lang:other` 换成各自语言 | 逐条表 3 行 | 3 个种族；**还要从 `tools/data/fix/pending/langOther.ts` 删掉这 3 行** | `a17-ambiguous` 3→0 | 忘了删 pending 清单（构建会报"已不再带 lang:other"，这是提醒，不是 bug） |

**本站结束时的累计变化**（站末对照 START 看）：上表 10 个登记项按右列变化，其它登记项与起点**完全一致**。

> 第 2 站文档里有 4 处事实错误是规划者在写本文件时发现并**已经修正**的（2-2 的 `expect`、2-5 的范围、2-7 的数量与例外、2-8 的包与字段）。如果你读到的 `02` 和本节表不一致，**以本节表＋`02` 的最新版为准，并在回执第 4 项里指出来**。

---

## 4. 一个工作项怎么做（节拍；细则在 `00` 第 5 节）

### 4.1 标准 13 步（压缩版，一步都不许省）

1. 读工作项，**用一句话**复述"改哪些条目的哪个字段、从什么到什么、依据什么"。
2. 用 T1 看 3 个典型条目现状；用 T3 完整清单（`G2_WRITE=1` 跑相关测试会写出 `tools/data/out/g2-full/<组>.json`）确认条目数**等于文档数**，不等 → **停**。
3. 选落点：规则还是逐条表（`00` 第 6.1 节判据）。
4. **同时**写修正（`tools/data/fix/rows/s2-*.ts` 或 `rules/s2-*.ts`，并在 `tools/data/fix/index.ts` 里**加一行注册**）和放行规则（`tests/data/g2-allow/s2.ts`，`expect` ＝ 条目数）。
5. 构建（命令见 4.2），日志里要有"修正：规则 N 个、逐条表 N 行"且与预期一致。
6. 跑**本项相关**的 `g2*` 数据测试——**预期失败**，且失败原因必须是"登记的发现变了/没复现"。
7. **读失败信息**。失败项必须 ⊆ 本项目标项；出现任何别的失败 → **停**。
8. `G2_WRITE=1 npx vitest run --config vitest.data.config.ts <相关测试文件>` 重写登记。
9. `npx tsx tools/g2/registry-diff.ts --groups … --allow "…"`（**照抄**工作项里那一行），必须退出码 0，且变化清单与预期一致。
10. `npx vitest run --config vitest.data.config.ts tests/data/g2-additive.test.ts tests/data/g2-oldext.test.ts` 全过。
11. `npm run check`，再 `npm run test:data`，全过。
12. **抽查 3 条**：T1 看修完的条目，对照来源原文，报告里写"条目／字段／值／来源页码或字段／是否一致"。写不出来源＝没做完。
13. 提交，并往站报告里加一小节。

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

# 登记对比（站内累计巡检：和本站起点比）
npx tsx tools/g2/registry-diff.ts --base <START> --show
```

### 4.3 提交

- 作者：`git -c user.name=didhogg -c user.email=143271304+didhogg@users.noreply.github.com commit …`（**不要把 `-c` 选项存进变量**，zsh 会出错）。提交说明末尾按你当前环境要求加署名行。
- 说明格式：`G2.5 站2 <工作项编号>：<一句话中文大白话>`，空一行，再三行：`改了什么 / 依据 / 登记变化`。
- **一个工作项一个提交**；提交前 `git status`，不许有散落的新文件（`tools/data/out/` 被忽略，不用管）。
- **数据仓库**：本站结束时（不是每项）提交一次：`G2.5 站2：<一句话>`（生成的包与 `catalog.json` 的变化），**不推送**。

---

## 5. 中途不跑偏：巡检点与漂移信号

### 5.1 每完成 3 项（2-3、2-6、2-9 之后各一次）做巡检

```bash
git status --short                                          # 只许有你有意要提交的东西
git log --oneline <START>..HEAD                             # 提交数 = 已完成的项数，且每个只含该项的改动
npx tsx tools/g2/registry-diff.ts --base <START> --show     # 累计变化只能是"已完成项"的那些登记项
git diff <START>..HEAD --stat -- src                        # 预期：没有任何输出（src 一个字都没动）
git diff <START>..HEAD --stat -- tests/data/consumer        # 预期：没有任何输出（读取器没动）
git diff <START>..HEAD --stat -- tools/data/convert         # 预期：只有 item.ts 一个文件、1 行（2-1），以及你新增的文件
```

任何一条不符合预期 → **停**，把输出贴给驾驶员。

### 5.2 漂移信号对照（出现 = 你可能走偏了）

| 你正在做/想做 | 这说明 | 应该怎么办 |
|---|---|---|
| "这个测试断言太严了，放宽一点" / 删测试 / `.skip` | 想让数字变绿 | **停**。数字对不上说明数据没改对或读取器问题，报告 |
| 直接 `G2_WRITE=1` 重写登记而没先看失败原因 | 跳过第 6、7 步 | 先读失败信息，确认失败项 ⊆ 本项目标项 |
| `registry-diff` 报"不在 --allow 里却变了"，你想把它加进 `--allow` | 你改串了 | **停**；`--allow` 只照抄工作项里那一行 |
| 登记没降到文档写的数，你想去改 `tests/data/consumer/**` | 怀疑读取器 | **停**，报告（读取器归规划者） |
| 修正行的 `before` 写成"让构建通过的值" | 自指 | `before` 必须是 T1 看到的**真实现状**；对不上就是你看错了条目 |
| `basis` 写"同上""显然""常识" | 没有来源 | 写书名+页，或参考文件+字段；写不出就**停** |
| 想"顺手"修旁边发现的问题 | 头号走偏原因 | 写进报告"待议"，不改 |
| 想改字段形状/加新字段/加新记号 | 冻结被你碰了 | **停** |
| 一个规则的 `expectCount` 你想调到"实际命中数"让它通过 | 范围不符 | 先弄清为什么实际数≠文档数；弄不清就**停** |
| 放行规则 `expect` 是你跑出来后才抄的数 | 自指 | `expect` 必须来自文档里的条目数 |
| 构建报依赖/引用错误，你想把依赖加到包清单里 | 方向错了 | 依赖只能向下；**停** |
| 想手改 `.trpgpack`、`tools/data/out/`、数据仓库里的文件 | 越权 | 只能改转换代码/修正表，让构建产出 |
| 想提交构建副产物（报告里只有日期变化） | 污染提交 | 还原（见 4.2） |
| 想 `git reset --hard` / `git checkout .` / `git clean` / `rm -rf` | 危险操作 | 只许 `git revert` 或 `git checkout -- <具体文件>` 且只回退你自己改的 |
| 想推送 / 跑整套 e2e / 改包版本号 / 手改 `catalog.json` | 越权 | **不做** |

---

## 6. 停手协议

### 6.1 什么时候必须停（`00` 第 11 节全文有效；这里是本站最可能遇到的）

1. 文档之间、文档与现状**对不上**（条目数、id、现状值、预期登记数）。
2. 某工作项做完，登记项**没降到文档写的数**，或出现**新发现**，或别的登记项变了。
3. `g2-additive` 显示有**不在放行名单里的变化**，而你解释不了它是怎么来的。
4. 要核对的来源（书页、参考文件）**读不到**，或读到的数与文档不一致。
5. 构建报错你没见过、且不是"修正表 before 对不上"这种一眼能看懂的。
6. 你发现自己需要改 `src/`、读取器、字段形状、版本号才能继续。

### 6.2 停手时怎么报（直接发给驾驶员，格式固定）

```
【第 2 站停手报告】
卡在：2-N <标题>（第 X 步）
现象：<命令 + 关键输出，原样贴，不要转述>
我做了什么：<已提交哪些、当前工作区状态（git status）>
我的判断：<可能原因；"不确定"就写不确定，不要装作知道>
我没有做的：<列出你本可以"绕过去"但选择没做的事>
需要谁决定：规划者（读取器/文档问题）/ 驾驶员（范围/原书）
```

**停手后不要继续往下做别的工作项**（可能依赖这个项）。工作区保持干净（未提交的改动 `git stash` 不行就留着并在报告里说明）。

---

## 7. 站末交付（9 项全过之后）

1. 连跑两次构建（日志 `build-a.log`、`build-b.log`），`diff <(grep '^dnd5e2014-' tools/data/out/build-a.log) <(grep '^dnd5e2014-' tools/data/out/build-b.log)` **无输出**。
2. `npm run check`、`npm run test:data`、`g2-additive`、`g2-oldext` 全过。
3. 快速 e2e 子集与升级场景（**数据变了才跑**；先 `npm run build`）：
   ```bash
   E2E_SUITE=library E2E_ENGINE=chrome E2E_VIEW=desktop E2E_SCHEME=light node tests/e2e/smoke.mjs   # 约 100 秒，预期 95 项 PASS
   E2E_SUITE=upgrade E2E_ENGINE=chrome E2E_VIEW=desktop E2E_SCHEME=light node tests/e2e/smoke.mjs   # 约 25 秒，预期 13 项 PASS
   git checkout -- docs/reviews        # 跑 e2e 会改写截图，还原
   ```
   `npm run build` 会改写 `dist/index.js`：本站**不改 `src/`**，若 `dist/` 有变化 → 还原（`git checkout -- dist`）并在报告里写明。**不要跑整套 `npm run e2e`**。
4. 写报告：在 `docs/probes/D1.2-G2.5_报告.md` 末尾追加"第 2 站"一节，格式照 `00` 第 10 节：一句话结果／做了什么（每项：编号、条目数、落点、提交哈希）／**登记表变化**（粘贴 `registry-diff --base <START> --show` 的**完整输出**）／抽查记录（每项 3 条）／钉死数字测试的更新（没有就写"无"）／验证（命令＋结果）／**遇到的所有不顺**。
5. 更新 `NEXT.md`（当前任务写"第 2 站完成，等规划者核验"）；提交；数据仓库提交一次。
6. **停下**。最终回复用下面的格式。

### 最终回复模板

```
【第 2 站完成，等规划者核验】
一句话结果：<先说结果，大白话>
提交：<扩展仓库 9 个工作项提交的哈希 + 站报告提交 + 数据仓库提交>
registry-diff（对照 START）：<完整输出>
两次构建哈希：<11 个哈希；两次相同的证据>
验证：<check / test:data / g2-additive / g2-oldext / 快速 e2e / 升级场景 各自的数字>
抽查：<每项 3 条，条目/字段/值/来源/是否一致>
钉死数字测试更新：<无 / 列表>
遇到的所有不顺（哪怕你绕过去了）：<逐条；没有就写"无"，但要确认真的没有>
待议（我看到但没改的）：<列表>
未做/未验证：整套 e2e 未跑；真机未看；未推送
```

---

## 8. 规划者核验会看什么（让你心里有数，也别抱侥幸）

- `git diff START..HEAD` 里 `src/`、`tests/data/consumer/`、`tools/data/convert/`（除 `item.ts` 第 172 行）有没有被碰。
- 每个放行规则的 `expect` 是否来自文档、是否精确；有没有被你悄悄放宽。
- 每个修正行的 `before`/`basis` 是否真实；随机抽 10 条与原书对照。
- 登记对比是否**只有**目标项变化；统计（stats）变化你是否都解释了。
- 是否有"让数字变绿"的痕迹（改断言、跳测试、重写登记前没有失败记录）。
- 构建是否确定（两次哈希相同）；有无散落文件、有无构建副产物混进提交。
- 报告里"遇到的所有不顺"是否诚实：**绕过去但没报告，比停手报告严重得多。**

核验通过后，**规划者会通知驾驶员，驾驶员再对你说"规划者核验通过，继续第 3 站"**；在那句话之前，你不要开始第 3 站。

---

## 9. 环境小抄（这台机器上踩过的坑）

- Shell 是 **zsh**：不要把 `-c user.name=…` 之类选项存进变量再展开；`echo ====` 这种以 `=` 开头的参数会被当命令展开，用 `printf` 代替；**没有 `timeout` 命令**。
- macOS 的 `sed -i` 要写成 `sed -i.b …` 再删 `.b` 文件；`grep --include` 在 zsh 里可能因通配符报错，改用 `grep -rl pattern dir`。
- `cd` 到别的目录会改变后续命令的工作目录：**用绝对路径**，或每条命令前 `cd /Users/xxx/tavern-trpg-assistant`。
- 临时文件放**你的环境指定的临时目录**或 `tools/data/out/`（被忽略），**不要用 `/tmp`**；仓库外的脚本不能 `import` 仓库里的依赖，要跑脚本就放进 `tools/g2/`（并在提交前删掉你的一次性调试脚本）。
- Python 一律 `python3 -I`（隔离模式，避免读到别的目录里的同名模块）。
- 读原书：VGM 有文字层、MTF 是扫描件 OCR，见 `00` 第 4 节 T7；TCE/MM 等英文 PDF 在 `/Users/xxx/Downloads/龙与地下城官方资料/`，用 `pypdf`/`pdfplumber`。**OCR 数字一律用算式自洽再确认**。
- 单文件 ≤ 400 行（`tests/fileSize.test.ts` 会查）；不写空 `catch`；不用 `any` 蒙混。
- 项目里 `reference/` 只读、`tools/data/out/` 与 `pack` 文件不许手改。
- **永远不要**：`--update-snapshot`；`git checkout -- docs/probes/D1.2a_R8b_去向审计.md`；`git reset --hard`；`git clean`；`rm -rf`；推送。

---

## 10. 现在开始

**先做第 2 节：读文档 → 环境核对 → 发"开工回执" → 停下等驾驶员。** 其它什么都不要做。

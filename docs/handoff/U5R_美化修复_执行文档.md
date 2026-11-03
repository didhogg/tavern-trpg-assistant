# 人物 UNIT2–3 返工「U5R 美化修复」· 执行文档

状态：**规划者定稿（2026-11-04），待驾驶员批准后交执行 agent。**
规格：[`docs/units/U5R_人物详情_修订规格.md`](../units/U5R_人物详情_修订规格.md)（UI / UX）+ [`docs/units/U5R_人物详情_视觉修订.md`](../units/U5R_人物详情_视觉修订.md)（视觉）。**本任务以这两份为准；它们没写到的，照 U5 原三份**（`U5_人物详情.md`、`U5_人物详情_抽屉与弹窗.md`、`U5_人物详情_视觉规格.md`）。冲突以 U5R 为准，并在报告里写明。本文件只写做法、顺序、红线、验收。
上位：`docs/规划/人物模块框架.md`；界面硬性规范 `docs/开发规范.md` §5（尤其 §5.3 弹层）；数据约定 `docs/模块数据约定.md`；`docs/规划者守则.md`。
前置：分支 `u5a`（`c270df6`，U5 UNIT2 的执行结果，**未推送、真机未验证**）。驾驶员验收结论：**界面粗制滥造、样式不统一、弹窗 / 侧拉 / 浮窗混用、反人类**，要求按 U5R 返工。
取代：`u5a` 上的人物详情界面实现（逻辑层——派生、草稿、写入、模式迁移、骰盘预填入口、测试——尽量保留并按本文扩展；**界面层重写**）。

---

## 0. 一句话

**保留逻辑，重做界面，改规格里一半来自旧规格的做法**：把 `u5a` 的人物详情改成 U5R 规定的样子——居中弹窗（没有侧拉）、身份弹窗浏览器式标签（含种族 / 职业 / 背景流程与等级管理）、读数弹窗三标签、档案拆三张卡、效果结构化、敌人与人物同构、骰盘的「检定」「豁免」——并修掉驾驶员列的 76 条问题。

**不做**：见 U5R §17（多职业、专长、子职业选择、背包与 AC 装备算法、法术页、攻击 / 伤害 / 先攻追踪 / 随机表 / 记录标签、团体检定、休息结算、自定义条目面板、外壳层问题）。

## 1. 起止

| 项 | 值 |
|---|---|
| 扩展仓库起点 | `u5a`（`c270df6`），新分支 `u5r` |
| 数据仓库 | 批 0–1 的效果数据修复在数据仓库分支 `u5r` 上做（只改转换器与 overlay，不手写生成文件） |
| 规格文件 | U5R 两份规格在规划者工作区；若还没提交到 `main`，**第一个提交「U5R 规格」把它们复制进 `u5r`**（执行 agent 不改内容；有疑问写进报告「规格疑问」） |
| 结束版本 | 扩展 minor +1；`workspace` / `save` 结构版本按迁移需要（§3 批 1）；数据包版本按发布规则 |
| 结束时 | 推扩展 `u5r` 与数据 `u5r` 供规划者核验；**不推 main、不打标签、不刷新 CDN、不安装、不删除用户数据** |

## 2. 已有的东西（先读，再改；不要重做逻辑）

| 已有（`u5a`） | 位置 | 这次 |
|---|---|---|
| 派生函数 | `src/rules/dnd5e2014/derive/{abilities,combat,spells,types,index}.ts` + 单测 | **返回值加 `parts`（来源明细）**；`value` 与旧断言不变；补 `hpMax` 的修正与覆盖、`hpRolls` |
| 人物卡界面 | `src/ui/people/card/*.vue`（`PersonCard`、`IdentityBlock`、`VitalsBlock`、`ReadoutBlock`、`AbilityCards`、`StatusRows`、`ArchiveStrip`、`PageTabs`、`CardTopbar`、`IdentityDrawer`、`RecropPage`、`AddEffectPopover`、`HelpPopover`、`EffectPill`…）、`card.css` | **界面层按 U5R 重写**；能复用的小部件复用，复用不了的删 |
| 草稿与撤销 | `card/draft.ts`、`card/cardData.ts`、`ui/people/writeSet.ts` | 保留；补「弹窗内暂存」（U5R §1.5）与「一次确认写入 = 一步撤销」 |
| 头像自动截取 | `card/autoCrop.ts`、`ui/kit/crop.ts` | 保留 |
| 资料卡 | `EntryDetailPage`（库） | 职业 / 种族 / 背景 / 效果资料页直接用（弹窗内换页） |
| 骰盘 | `src/stores/dice.ts`、`src/ui/shell/DiceTray.vue`、`src/rules/dice/*` | **只加** `openRoll` 与「检定 / 豁免」标签；「自由」= 现有基础版原样；`prefill` 保留并转调 |
| 弹窗宿主 | `src/stores/modal.ts`、`src/ui/kit/ModalHost.vue`（`drawer` 变体、页面栈） | 详情页**不再使用 `drawer` 变体**；`dialog` 变体支持标签栏 + 固定底栏 + 手机底部整页（可新增可选字段，旧存档抽屉等不动） |
| kit 组件 | `Segmented`、`SelectField`、`Combobox`、`Checkbox`、`Switch`、`MoreMenu`、`TagPill`、`EmptyState`、`ToastHost`、`Icon`、`AvatarFrame`、`HpBar`、`StatCell`、`InfoPage`、`ConfirmPage` | 复用；缺的少量新组件：`BrowserTabs`、`HoverTip`、`ItemCard`（项目卡）、`SourceList`；**不做通用选择器** |
| 数据 | `effects.ts`（22 种）、`enums.ts`、`packs/dnd5e2014-srd.trpgpack`（race 9 / class 12 / background / condition 15 / status 2 / language 18 / spell…）、数据仓库各包、`docs/模块数据约定.md` | **审计 → 修转换器 / overlay → 增补 `rollBonus`**（U5R §12） |
| 测试 | `tests/unit/u5-*.test.ts`、`tests/e2e/suite-card.mjs`、`shots-u5.mjs`、`docs/probes/U5_截图/`（126 张）、`U5_报告.md` | 已有断言**不改**（除因结构变化必须改，且在报告里逐条写明）；新增用例见 §6 |

**数据名一律以数据库条目与 `enums.ts` 为准**（智者、魔契师、擒抱、奥术回想…）；不凭印象写任何列表。

## 3. 分批（每批结束本地提交，信息以「U5R 批 N：」开头；批与批之间不停）

### 批 0：核验、审计、计划（不写界面）
1. 读完：U5R 两份规格全文；U5 三份原文（**读全，不读片段**）；`docs/开发规范.md` §5、§12.5；`docs/模块数据约定.md` §1–2、§6、§10、§16；`docs/规划者守则.md`；`u5a` 的全部 126 张截图与 `U5_报告.md`。
2. 写 `docs/probes/U5R_报告.md` 开头**三句话（目标、红线、验收）**，再写**「已有 / 这次只改什么」对照表**（每个 U5R 节对应 `u5a` 里哪个文件）。
3. **效果数据审计**（U5R §12.2 第 1 步）：写 `docs/probes/U5R_效果数据审计.md`——按类型（状态、专注 / 突袭、疾病、计时型法术、特性、魔法物品、环境规则）统计结构化程度，列代表名单，列「只有文字」的条目数。
4. **数据核对**（逐项在报告里写「查了什么 / 结果」）：`class` 12 条的 `advancement` 与 `asiLevels`；`race` 与 `subrace` 的 `abilityBonus / speed / senses / languages / proficiencies / traits`；`background` 的 `proficiencies`；`language` 的 `type`；工具与武器 `item` 的 `tags` / `weapon.category`；**怪物属性块的 `spellcasting[].spells[环阶].slots`**（法术位）、`ac[]` 多值、`hp.formula`、`activities`。凡规格里写的列表与数据对不上的，**以数据为准并写进报告**。
5. 复跑基线：`npm run check`、`E2E_SUITE=card`（`u5a` 上）；记下数字。

### 批 1：数据与规则层（无界面；**先修管线，再逐条**）
- **效果数据**（U5R §12.2 第 2–3 步）：能从来源结构化读出的**修转换器重建**；来源没有结构的才进 `tools/data/overlay/*.json`（带 `reason`）；增补可选效果种类 `rollBonus` 与 `data.duration`（特性 / 物品 / 疾病 / 环境）；`dataVersion` 与版本号 +1；`tests/data/g2-allow/` 放行规则同步；**两次 `build:data` 哈希相同**；`g2-oldext` 通过；审计复跑，把**「没有正文也没有摘要的条目数」**写进报告。
- **人物结构**（U5R §12.4）：`personEffectSchema` 改结构化 + 迁移（旧 `{name, ref, note, duration:文字}` → 新）；`hpAdj`、`hitDiceOverride`、`hpRolls`；迁移带单测与迁移测试，结构版本按开发规范 §3 第 6 条判断；高版本拒绝。
- **派生函数**加 `parts`（U5R §13）；新单测见 §6。
- **纯函数**（带单测）：点数池放入 / 退回（`poolAssign`）、更换来源的「应移除集合」（`staleSources(person, kind, oldEntry, newEntry)`；多来源、同项不同来源要覆盖）、「应分配集合」（`grantsOf(kind, entry, subentry, picks)`）、「可恢复集合」（`restorable(person, category)` = 应分配 − 已有）、等级升降集合（`levelDiff(person, targetLevel)`：生命、特性、法术位、属性提升级）、骰盘加值与掷法来源（`rollSources(person, kind, ability, skill)` → `{rows, advSources, notes}`）。这些函数 **UI 与 e2e 都只调它们**。
- `useDiceStore().openRoll(payload)`（U5R §11.5）；`prefill` 转调。

### 批 2：页面外壳（U5R §2–§9、视觉修订 §1–§8）
- 顶栏三组 + 迷你条 + 分页下划线标签；身份卡（头像、名字、职业框、等级管理、种族 / 背景药丸、灵感、套用模板）；生命（平时 + 原地编辑态，含明细、修正、覆盖、恢复）；战斗卡（四读数格 + 被动徽章）；属性卡；法术位；状态与效果；档案三卡（含「+N」悬停气泡）；行动与技能页（宽屏铺开 / 窄屏收起）；其余四分页占位。
- **敌人同构**（U5R §2.3）：魔法师、地精各一个夹具人物，截图对比。
- `HoverTip`：悬停来源气泡，**只读、不遮触发元素、触屏用 ⓘ**；所有派生数字、药丸、「+N」都接它。
- 删除详情页对 `drawer` 变体与旧小弹层的使用（`IdentityDrawer`、`AddEffectPopover`、来源弹层、`HelpPopover` 的旧样子）。

### 批 3：弹窗体系（U5R §10；视觉修订 §9）
`ModalHost` 的 `dialog` 变体加：浏览器式标签栏、固定底栏、手机底部整页（可选字段，不破坏旧用法）。逐个做：
1. **身份弹窗**：五个标签；核心身份（头像三个按钮常驻、字段、阵营下拉 ✕ 框内、两列表单）；**重新截取页**（真实预览、缩放 % + 还原、不溢出、手机底栏固定）；种族 / 职业 / 背景**流程组件**（选择 → 补选 → 分配；「选用{名称}」；「只选用，先不分配」；旧来源移除区默认勾选；全不勾可应用；写入带 `auto` 来源）；等级管理。
2. **属性弹窗**（点数池放入 / 退回、红框高亮、「保存并写入属性点」、「清除手动修正」）。
3. **读数弹窗**三标签（项目卡，无矩阵）。
4. **技能弹窗**（⚙ 气泡、可恢复）。
5. **档案三弹窗**（防御｜感官｜熟练；标签；各类别的专属交互；可恢复；按来源重新分配；入口决定标签）。
6. **添加效果**（可搜索资料弹窗）、**资料弹窗**（所有药丸）、**帮助**（图标 + 短句；新人物另有「怎么开始」）。
7. 弹窗里的下拉全部浮层化（开发规范 §5.3）；所有输入框内清除 ✕ 封装在框内。

### 批 4：骰盘「检定」「豁免」（U5R §11；视觉修订 §10）
- 左侧附着标签：检定｜豁免｜自由；手机顶部标签；固定高度、固定分区。
- ① 行动者下拉 ② 属性 + 技能下拉（可改属性；先攻；死亡豁免）③ 加值与骰式（自动只读行 + 自定义常数 / 骰式 + 「查资料」）④ 难度 / 对手（固定 DC 纯数字 + 随机；对抗；不设）⑤ 掷法（来源列表、抵消）+ 底栏结果与「掷骰」。
- 快捷进入：所有数据预填，用户只设掷法与 DC；被动模式 + 随机 DC；「全部技能」进入展开技能下拉。
- **不预制任何法术名的加值**；自动行只来自结构化 `effects`（批 1 的数据）。
- 「自由」标签：现有基础版；攻击 / 伤害 / 法术攻击 / 生命骰点击把骰式与说明填进来，不自动掷。
- 骰盘 z-index 高于弹窗遮罩。

### 批 5：测试、截图、评审、回写、报告、推送
- e2e、单测、截图矩阵（U5R §16）；**独立评审**（没看过过程的评审者只看截图，打分，< 8 分改到 ≥ 8，评分与改动写进报告）。
- **回写原文**：`grep -rn` 全文，把 U5 三份原文里被取代的段落改成「见 U5R §x」并保持其余内容不动；`U5R` 两份规格里的「待回写」标记清零；`docs/decisions.md` 已由规划者写好，**不改**。
- 更新 `NEXT.md`；报告写完；推分支。

## 4. 允许改的文件

| 范围 | 文件 |
|---|---|
| 批 1 数据 | `tools/data/convert/**`（效果相关转换）、`tools/data/overlay/*.json`、`tools/data/validate/**`、`tests/data/g2-allow/**`、`tests/data/**`（新增用例）、`docs/probes/U5R_效果数据审计.md`、数据仓库生成文件 |
| 批 1 逻辑 | `src/rules/dnd5e2014/data/effects.ts`（增补可选种类）、`src/rules/dnd5e2014/derive/**`、`src/schemas/people.ts`、`src/core/migrate.ts`、`src/schemas/campaign.ts` / `common.ts`（结构版本，如需要）、`src/ui/people/**` 下纯函数文件、`src/stores/people.ts`、`src/stores/dice.ts` |
| 批 2–4 界面 | `src/ui/people/card/**`（重写）、`src/ui/people/card/card.css`（或拆分 css）、`src/ui/kit/**`（新增小组件、`ModalHost.vue` 与 `stores/modal.ts` 的可选字段、`icons.ts` 补图标、`kit.css`）、`src/ui/shell/DiceTray.vue` 与相关 css |
| 测试 | `tests/unit/u5r-*.test.ts`、`tests/e2e/suite-card.mjs`（扩展）、`tests/e2e/shots-u5r.mjs`（新）、夹具 |
| 文档 | `docs/probes/U5R_*`、`NEXT.md`、U5 三份原文（仅批 5 的「见 U5R §x」回写） |
| 不碰 | `src/core/library/**`、`src/ui/library/**`（只读调用）、`VirtualList.vue`、`AGENTS.md`、`docs/任务总纲.md`、`docs/decisions.md`、驾驶员主工作区、已有测试的断言（必须改的逐条写进报告） |

## 5. 停止条件（只有这四种才停整站）

1. 数据：两次 `build:data` 哈希不同，或数据比对出现**放行规则以外**的变化，或 `g2-oldext` 失败；
2. 迁移会改变旧存档里已有的数据（效果结构化迁移之外）；
3. 已有 e2e（`library`、`upgrade`、存档、`people`、`card`）因本任务失败且两次修不好；
4. 合并 `u5a` / 规划者分支时 `NEXT.md` 以外的文件冲突。

**其余问题当场解决，不停、不另开任务**：规格没写清的小细节按 U5 基本 §1 总规则处理，写进报告「与规格不同之处」；单文件超 400 行就拆；规格与数据对不上以数据为准并写进报告。

## 6. 验收

| 类别 | 标准 |
|---|---|
| 数据 | 审计报告齐；`rollBonus` 与 `duration` 校验通过；**两次构建哈希相同**；`g2-oldext` 通过；资料弹窗「没有正文也没有摘要」的条目数写明且已登记 |
| 自动 | `check` 全绿（含新单测）；e2e `card`、`people`、`library`、`upgrade`、存档全绿（Chrome 与 WebKit） |
| 新单测 | 派生 `parts`（求和 = `value`、覆盖时标 `overridden`）；效果迁移；`poolAssign`；`staleSources`（多来源）；`grantsOf`；`restorable`；`levelDiff`；`rollSources`（优势劣势抵消、结构化加值、自动失败提示）；`openRoll` 载荷；DC / 随机 / 对抗 / 被动的结果判定（含天然 20 / 1 不自动成败、平局局面不变） |
| 新 e2e | U5R §16 列的全部（含：点数池放入红框 / 退回；「保存并写入属性点」写入；更换种族移除旧来源并出现新来源；「只选用，先不分配」不写熟练；移除自动项 → 可恢复 → 恢复 / 按来源重新分配；「+N」进对应标签；药丸资料弹窗有正文；骰盘下拉选择不改变其他分区位置；敌人同构元素齐全；弹层按开发规范 §5.3） |
| 截图 | U5R §16 矩阵，深浅色 × 1440 / 900 / 390，**逐张看过，灰度再看一遍**；写进 `docs/probes/U5R_截图/` |
| 对照清单 | 报告逐条回填 U5R §0.1 的 15 条与 §18 的全部问题：改了什么 + 截图文件名；没做的写原因 |
| 独立评审 | ≥ 8 分（10 分制） |
| 规划者核验 | 在分支上复跑；按 U5R §15 场景抽查 |
| 驾驶员真机 | 发布后：生命编辑、点数字去骰盘（检定 / 豁免 / 对抗 / 被动）、身份五标签（换种族 / 职业 / 背景、升降级）、属性分配并保存、读数三标签、档案三弹窗与「+N」、添加效果与资料、手机宽度 |

## 7. 执行纪律（来自驾驶员的批评，写在这里是因为上一轮就是栽在这儿）

1. **不凭印象做规格、界面、交互、数据名**。每做一个栏目，先把规格对应节、数据字段、玩家手册页码找出来，**报告里写「查了什么」**；找不到依据的不做、不猜，写进「规格疑问」。
2. **一次改完同一问题的所有出处**：改一个决定，`grep` 全文（规格、代码、测试、截图脚本）对一遍，不「拆东墙补西墙」。
3. **自己看截图**：每批界面改动后、交付前、写评审前，逐张用读图工具看自己的截图；看不清就重截大图 / 局部图。**不能只看 DOM 尺寸**。
4. **弹窗里的下拉点真选项**：e2e 打开 → 点选项 → 值变化 → 关闭且 `body.style.pointerEvents` 恢复（沿用记忆里的「弹层控件必须真点选项」）。
5. **不新增颜色、动效、通用件**；用现有 kit 组件；缺的少量小部件（`BrowserTabs`、`HoverTip`、`ItemCard`、`SourceList`）各有两个以上使用方。
6. **状态只经 store；规则是纯函数；数据只在内容包；结构变更必带迁移；不写空 catch；单文件 ≤ 400 行。**
7. **数据错了只改转换器 / `tools/data/overlay/*.json`，不在代码里写修正**；测试不写死条目数量。
8. 面向驾驶员的说明（报告、提交信息）用中文大白话，先说结果再说依据。

## 8. 报告格式（`docs/probes/U5R_报告.md` 末尾 + 聊天回复）

```
【U5R 完成 / 停在批 N】
一句话结果：…
提交：扩展 u5r <哈希>；数据 u5r <哈希>（已推，未推 main）
批 0：审计结果（结构化程度）、数据核对与规格不一致处 N 条（已按数据为准）
验证：check X/Y；e2e card X/0、people X/0、library X/0、upgrade X/0、存档 X/0（Chrome、WebKit）；test:data X/Y；build:data 两次哈希相同
截图：docs/probes/U5R_截图（N 张，已逐张看过，灰度也看过）
独立评审：N / 10（改动：…）
对照清单：U5R §0.1 共 15 条、§18 共 N 条——已做 X、部分 Y、未做 Z（原因…）
与规格不同之处：…
规格疑问：…
未做 / 未验证：真机未看；…
```

# UNIT3 数据需求与缺陷清单（整个 UNIT3 返工要用的结构化数据、缺陷、界面未用项）

> **用途说明（2026-11-05）**：本文件里逐条列出的条目 id、条数，是**验收用例和缺陷范围**，不是手工修复清单。修法见 `docs/规划/数据转换器_形状驱动方案.md`（形状驱动、规则即数据，禁止逐条手工核对修复）。


> 核查日期 2026-11-05；范围：UNIT3 界面线 S1 到 S12 要用到的全部数据；只查未修。
> 配套：排程见 `docs/handoff/UNIT3_整体返工排程.md`；选择类与容器的细表见 `docs/probes/U5R2_T2r2_数据形状清单.md`、`U5R2_T2r2_数据修复清单.md`（本文不重复其中的明细，只引用编号）。

## 一、方法与来源（谁查了什么，局限在哪）

| 来源 | 怎么用 | 局限 |
|---|---|---|
| 已发布的包（87 个包去重：SRD＋数据仓库 86 个） | 逐字段统计条数、形状；用一次 `build.ts --out <临时目录>` 试跑重建，结果与已发布包条目数完全一致（背景 35、种族 83、亚种 65、职业 16、子职业 109、专长 74、特性 1866） | — |
| 5etools 中文版（`5etools-cn-main`，转换器的输入） | 对照字段；读转换器登记表 `tools/data/config/fieldCoverage/*.ts`（每个源字段登记为 mapped／text／dropped） | 登记表**不等于**实现：`subclass.optionalfeatureProgression` 登记为 mapped，实际子职业转换函数根本没调用（见 D-1） |
| Foundry dnd5e 6.1（`dnd5e-6.1.x/packs/_source`，yml） | 看升级项、选择项、特性效果的参考形状；数量对比 | **只覆盖 SRD**：特性 235 条、种族 35 条、背景 3 条，无法补非 SRD 内容 |
| 5e-database（SRD API 数据） | 看"选择挂在容器特性上""等级表带 class_specific"的形状 | 只覆盖 SRD |
| 网上（前几轮搜索） | Roll20 升级流程（两篇玩家教程，官方页面打不开）、5etools 字段代码说明（第三方 schema 文档）、Roll20 战士页、超魔法指南 | 搜到的零散，**没有**官方截图；版面细节不能说是照 Roll20 做的 |
| 界面字段使用初筛 | 对每种条目的每个字段，在 `src/ui/people`、`src/rules/dnd5e2014/derive`、`src/ui/shell`、`src/stores` 里按字段名搜词（"人物页"），在 `src/ui/library`、`src/core/library` 里搜词（"库页"） | **按词搜，可能漏判或误判**（如 `level`、`text` 这类通用词会误判为"用了"）。凡我手工核实过的在表里标"已核实"，其余标"初筛" |

## 二、各小 UNIT 要用的结构化数据

> "状态"一列：✔ 库里有且人物页在用；◐ 库里有但人物页没用或只部分用；✘ 库里缺；？待核实。编号见第四、五节。

| 小 UNIT | 要用的结构化数据（条目类型.字段） | 状态 | 缺陷编号 |
|---|---|---|---|
| S1 人物页布局 | 无新数据（版式） | — | — |
| S2 身份弹窗首屏 | race／class／background 列表：`src.book`、`src.page`、`text`；版本相关 `playable`、`supersededBy`、`versionGroup`、`lineage` | ✔ 列表；◐ 版本字段界面没用 | U-5 |
| S3 种族 | race：`size`、`speed`、`abilityBonus.fixed`、`flexibleAbility`、`languages`、`proficiencies`、`darkvision/senses`、`resist/immune/conditionImmune`、`effects.spellGrant`、`traits`、`advancement`（trait／itemGrant／itemChoice）、`creatureTypes`；subrace：`parentRace`、`overwrite`、同上字段 | ✔ 固定加值、语言熟练、抗性感官；◐ `flexibleAbility`（44）、`spellGrant`（42）、体型多值未用；✘ 魔幻科波尔特天生法术 | U-1、U-2、U-5、D-6 |
| S4 背景 | background：`proficiencies`、`advancement`（trait 固定与选择）、`equipment`、`feature`、`characteristics`（个性表）、`characteristicsFrom`、`lore`；附带专长选择 | ✔ 熟练与特性；？装备与个性表人物页是否真用（S4 开工前核实）；✘ BMT 两个背景缺专长选择 | U-9、D-5 |
| S5 职业与升级向导 | class：`hitDie`、`saves`、`proficiencies`、`multiclass`、`subclassLevel/Title`、`spellcasting`（`cantripsKnown`、`spellsKnown`、`preparation`、`spellbook`、`slotsByLevel`）、`table`、`advancement`（itemGrant、abilityScoreImprovement、itemChoice、subclass、expertise、scaleValue、trait）；subclass：`advancement`、`expandedSpells`、`spellcasting`；feature：`owner`、`level`、`role`、`featureType/optionKind`；feat：`requires`、`abilityIncrease`、`advancement`；spell：`classes`、`level` | ✔ 基本字段；◐ `multiclass`（13 前置、11 熟练）未用、`abilityIncrease`（34）人物页未读；✘ 选择槽缺口与容器、选法术类选择 | D-1 到 D-4、D-7 到 D-9、U-3、U-4、U-6 |
| S6 属性弹窗 | 购点花费表 `table.phb-p13-r1`（SRD 包里有）；标准数组与总点数是界面自带（授权例外） | ✔ | — |
| S7 读数与骰盘 | rule：技能（关联属性）、感官规则正文；condition 正文；`rule.template` | ✔（T1 已改读库） | ？ |
| S8 档案区 | glossary 12 张（伤害类型、阵营、体型、生物类型、属性、武器类别、稀有度、移动、工具、学派、武器特性、护甲类别）；language：`code`、`type`、`typicalSpeakers`；condition 15 个；sense 规则 4 个；item：`weapon`、`armor`（熟练判断） | ✔ glossary、条件、感官；✘ 语言分类缺 46／64 | D-10 |
| S9 状态与效果 | condition：`effects`、`levels`（力竭 6 级）；status：2 个；disease：`effects`；spell：`duration`、`activities`、`effects`；feature：`duration`、`uses`；item：`duration`、`effects` | ✔ 条件、状态；✘ 疾病 9／9 效果为空；◐ 法术效果结构 5／480 | D-11、D-12 |
| S10 模板入口与铅笔 | monster 模板：`cr`、`creatureType`、`size`、`tags` | ✔ | — |
| S11 行动与技能页 | feature：`activities`（234）、`uses`（262）、`tracker`、`consumes`、`restores`；rule 技能 18 个 | ✔ 前者；◐ `tracker`／`consumes`／`restores` 初筛未用；✘ 1313 个特性没有任何结构化字段 | D-13、U-6 |
| S12 敌人卡 | monster：`abilities`、`ac`、`hp`、`speed`、`senses`、`resist/immune/vulnerable`、`resistConditional`（557）、`immuneConditional`（194）、`vulnerableConditional`（8）、`legendary`（409）、`mythic`（17）、`summon`（50）、`variants`（337）、`lore`、`attachedItems`、`skills`、`saves`、`inventory`；经验表（DMG 包）、怪物熟练加值表 | ✔ 基础数值；◐ 条件抗性、传奇、神话、召唤、变体、背景描述等人物页（敌人卡）初筛未用 | U-7 |

## 三、各类条目的字段清单（初筛：条数／人物页用／库页用）

> 符号：P＝人物页用到，L＝库页用到，无符号＝两处都没搜到。再强调：这是按词搜的初筛。

- **class（16）**：`advancement`PL、`hitDie`PL、`saves`PL、`proficiencies`PL、`subclassLevel`PL、`table`PL、`spellcasting`PL、`credit`PL、`src`PL、`text`PL；**`primaryAbility`L、`startingEquipment`L、`subclassTitle`L、`lore`L**；`multiclass`（13）**两处都没搜到（已核实：全库 0 处读取）**。
- **subclass（109）**：`advancement`PL、`text`PL、`spellcasting`PL（2 个）、`credit`、`src`；`classId`L、`lore`L；**`expandedSpells`（51）两处都没搜到**。
- **race（83）**：`advancement`、`languages`、`proficiencies`、`size`、`speed`、`traits`、`senses`（55）、`abilityBonus`（40）、`effects`（21）、`resist`（18）、`immune`、`conditionImmune`、`creatureTypes`（14，P）；**`darkvision`L、`lineage`L、`lore`L**；**`flexibleAbility`（40，已核实人物页 0 处）、`age`（35）、`heightWeight`（20）、`playable`（16）、`versionGroup`（16）、`supersededBy`（14）、`creatureTypeTags`（8）两处都没搜到**。
- **subrace（65）**：与 race 同类；`flexibleAbility`（4）、`age`、`heightWeight`、`versionGroup`、`supersededBy` 两处都没搜到；`overwrite`L。
- **background（35）**：`advancement`、`proficiencies`、`feature`、`equipment`、`text`；`lore`L；**`characteristics`（35）、`characteristicsFrom`（12）两处都没搜到（个性表人物页是否真用，待 S4 核实）**。
- **feat（74）**：`advancement`、`requires`（32）、`effects`（20）、`uses`、`duration`、`extra`、`tags`；**`abilityIncrease`（34）库页用 L，人物页未搜到（初筛）**。
- **feature（1866）**：`activities`PL（234 条非空）、`uses`（262，L）、`effects`PL（129）、`duration`PL（81）、`owner`PL（1706）、`level`（1141）、`requires`PL（60）、`role`PL、`optional`L、`joins`L、`extra`PL、`choices`PL（32）；**`featureType`（151）、`optionKind`（151）、`tracker`（13）、`spellLists`（9）、`consumes`（8）、`restores`（7）两处都没搜到**。
- **spell（480）**（UNIT6 的主场，这里只列与人物页相关的）：`classes`PL、`level`PL、`duration`PL、`activities`PL（269 非空）、`save/damage/attack`PL、`effects`PL（仅 5 条）、`conditionImmune`PL；**`higherLevel`（154）、`upcast`（154）、`cantripScaling`（23）、`subclasses`（480）初筛两处都没搜到**（升环信息库里已结构化，界面有没有用，到 UNIT6 再核）。
- **condition（15）／status（2）／disease（9）**：`effects`、`kind`、`levels`（力竭 1 个）PL；**disease 的 `effects` 9／9 为空数组（已核实）**。
- **rule（269）**：`category`、`text`、`ability`（技能 18 个）、`template`（13）、`terms`（词表 12）PL；`glossary`L、`abbreviation`L、`activation`L；`seeAlso`（9）、`fromVariantRule`（8）初筛未用。
- **language（64）**：`code`P、`type`（仅 18 个有）PL、`typicalSpeakers`L、`script`L；**`scriptRule`（29）、`dialectCodes` 未用**。
- **monster（3873）**：基础数值全部 PL；**`resistConditional`（557）、`immuneConditional`（194）、`vulnerableConditional`（8）、`mythic`（17）两处都没搜到**；`legendary`（409）、`summon`（50）、`variants`（337）、`facets`、`lore`、`attachedItems` 只库页用。

## 四、数据缺陷（要修转换器或数据；编号接数据线）

| 编号 | 缺陷 | 影响 | 对应数据线 | 把握 |
|---|---|---|---|---|
| D-1 | 子职业的选择进度（5etools 的 `optionalfeatureProgression`）转换器没读：`convertSubclass` 不调用 `advancementExtras`，登记表却写 mapped。战斗大师战技、魔射手奥术射击、符文骑士符文、四象宗法门、勇士 10 级战斗风格、剑舞学院战斗风格缺选择槽（共 16 槽）；这些选项条目本身（战技 23、法门 17、奥术射击 8、符文 6）包里都已有 | 6 个子职业 | DF-1 | 高 |
| D-2 | 选择槽与专精没有 `explain`（指向容器特性）。职业层 70 槽里 52 条能按同名可靠关联；18 条子职业"几选一"（`pool`）槽要补容器，待查 | 70＋18 槽 | DF-1 | 52 条高，18 条待查 |
| D-3 | 选择容器 `role` 标记不全：选子职业容器 15 个、选择类容器 16 个是 `mechanic`；属性提升 85 个已是 `procedure` | 31 个特性 | DF-1 | 高 |
| D-4 | `class.spellcaster-sidekick.tce` 3 级选子职业没有容器 | 1 | DF-1 | 待查 |
| D-5 | BMT 两个背景（Rewarded、Ruined）源数据带专长选择，包里没有 | 2 | DF-2 | 高 |
| D-6 | `race.kobold.mpmm` 源数据有天生法术，包里没有 `spellGrant` | 1 | DF-2 | 待查形状 |
| D-7 | `class.spellcaster-sidekick.tce` 源数据有施法进度，包里没有 `spellcasting` | 1 | DF-2 | 待查 |
| D-8 | 10 个子职业源数据有附带法术、包里没有：图腾武者、逸闻学院、奥法骑士、魔射手、灵能武士、幻术学派、暗影宗、散打宗、日魂宗、诡术师（可能是特性自带法术或子职业施法，不一定该进扩展法术表） | 10 | DF-2 | 待查 |
| D-9 | "选法术"类选择（玄奥秘法 6 到 9 环、魔法奥秘等）：Foundry 里是结构化的（`ItemChoice type:spell`＋职业法术表限制），我们没有 | 魔契师、吟游诗人等 | DF-3 | 待评估 |
| D-10 | 语言分类：64 个语言只有 18 个有 `type`，46 个没有（已核实，如地刺虫语、灵吸文、蝎人语、孢子人…） | 46 | DF-4 | 待查源（5etools 语言文件里有没有） |
| D-11 | 疾病：9 个的 `effects` 全是空（只有文字） | 9 | DF-4 | **需你先定做不做** |
| D-12 | 法术效果：480 个法术里只有 5 个有 `effects`、269 个有 `activities`，其余只有时长 | ～200 | DF-4 | 评估（Foundry 的法术有 167／320 带 effects，只覆盖 SRD） |
| D-13 | 特性没有任何结构化字段（无 `activities`／`uses`／`effects`／`duration`／`tracker`／`consumes`）：1866 个里 1313 个（子职业 477、种族 462、职业 283、无归属 56、背景 35）。5etools 里它们本来就是文字；Foundry 开放数据只覆盖 SRD 且带 effects 的特性只有 20／235；按开发规范 §13 显示文字、玩家手动处理 | 1313 | DF-4 | 评估，不指望补全 |
| D-14 | `fieldCoverage` 登记表疑点（登记为 mapped，但目标字段在包里一条都没有，可能是登记写错，也可能是转换器漏做，逐项核对）：`class.additionalSpells`→`effects`（9 项）；`subrace.additionalSpells[].expanded`→`expandedSpells`（6）；`background.additionalSpells`→`effects`／`expandedSpells`、`background.prerequisite`→`requires`；`feat.activities`（7）、`feat.bonusSenses`→`senses`、`feat._versions`；`spell.meta.ritual`、`spell.system`、`spell.time`（可能是登记路径写法问题）；`subclass.classSource`／`isReprinted`／`shortName`／`subclassTableGroups`→`table`（6）；`race.traitTags`→`facets` | 约 20 项登记 | DF-2 | 待核对 |
| D-15 | 范围：非核心书（书目政策 order ≥ 11）按 D1.2b 只收怪物与 NPC；`EEPC` 没登记进书目政策，其玩家种族（风、地、火、水精类、Aarakocra、Goliath）一个都没有。**暂不做**，等人物模块之后作为独立数据任务（驾驶员 2026-11-05 定） | 51 个种族、68 个背景等 | 后续 | — |

## 五、数据有、界面没用（界面线要用上的结构化数据）

| 编号 | 数据 | 条数 | 现状 | 用在哪个小 UNIT |
|---|---|---|---|---|
| U-1 | race／subrace `flexibleAbility`（自选属性加值，含自定义血统、半精灵） | 44（已核实） | 人物页和派生层 0 处读取；`racialBonus` 只读 `abilityBonus.fixed`；选了这些种族属性加值完全没有 | S3 |
| U-2 | race／subrace `effects.spellGrant`（天生法术，带等级门槛与每日次数） | 42（已核实：种族 21＋亚种 22） | 人物页和派生层 0 处读取 | S3 |
| U-3 | class `multiclass.requires` 与 `multiclass.proficiencies` | 13 个有前置、11 个有熟练（已核实） | 人物页和派生层 0 处读取 | S5 |
| U-4 | feat `abilityIncrease`（专长的属性加成，含二选一） | 34 | 库页用，人物页未搜到（初筛） | S5 |
| U-5 | race `playable`／`supersededBy`／`versionGroup`／`lineage`；`creatureTypeTags`；`age`／`heightWeight` | 16／14／16／43；8；35／20 | 初筛两处或人物页未用；列表是否去重隐藏待核实；`age`／`heightWeight` 更像 UNIT7 背景故事要用的 | S2、S3 |
| U-6 | feature `featureType`／`optionKind`（151）、`tracker`（13）、`consumes`（8）、`restores`（7）、`spellLists`（9） | 见括号 | 初筛两处都没搜到；`optionKind` 是向导选项归类的依据，S5 要用 | S5、S11 |
| U-7 | monster `resistConditional`（557）、`immuneConditional`（194）、`vulnerableConditional`（8）、`mythic`（17）；`legendary`（409）、`summon`（50）、`variants`（337）、`lore`、`attachedItems` | 见括号 | 条件抗性（如"来自非魔法攻击"的伤害）两处都没搜到；其余只库页用 | S12 |
| U-8 | class `startingEquipment`、`primaryAbility`；background `equipment` | 16；16；35 | 库页用；人物页是否把起始装备分配进背包，待 S4／S5 核实 | S4、S5 |
| U-9 | background `characteristics`（个性表）、`characteristicsFrom` | 35；12 | 两处都没搜到（库页可能以别的方式显示，未核实）；人物页能否掷骰选择，待 S4 核实 | S4 |
| U-10 | spell `higherLevel`／`upcast`／`cantripScaling`／`subclasses` | 154／154／23／480 | 初筛两处都没搜到；归 UNIT6，这里只记一笔 | UNIT6 |

## 六、"界面需要用到的结构化数据"汇总

按条目类型，UNIT3 界面线最终要从库里读的结构化字段：

```
 class       hitDie · saves · proficiencies · multiclass · subclassLevel/Title · spellcasting
             · table · advancement(itemGrant/ASI/itemChoice[+explain]/subclass/expertise/scaleValue/trait)
 subclass    advancement(含新补的选择槽) · expandedSpells · spellcasting
 race        size · speed · abilityBonus.fixed · flexibleAbility · languages · proficiencies
 /subrace    darkvision/senses · resist/immune/conditionImmune · effects.spellGrant · traits
             · advancement · creatureTypes · parentRace/overwrite · playable/supersededBy/versionGroup
 background  proficiencies · advancement(trait) · equipment · feature · characteristics
             · 附带专长选择(待补)
 feat        requires · abilityIncrease · advancement(trait) · effects · uses
 feature     owner · level · role · optionKind/featureType · activities · uses · effects · duration
             · tracker/consumes/restores
 spell       classes · level · school · duration · activities · effects
 condition   effects · levels         status  effects         disease  effects(目前为空)
 rule        技能(ability) · 感官 · glossary 12 张(terms)
 language    code · type(缺 46) · typicalSpeakers
 monster     基础数值 · resist/immune/vulnerable(+Conditional) · legendary · mythic · summon
 table       购点花费表 · 经验表 · 熟练加值表(角色/怪物)
 界面自带    标准数组 15/14/13/12/10/8 · 购点总点数 27（驾驶员授权例外）
```

## 七、对照参考库的结论

1. **5etools（转换器的输入）**：登记表把 UNIT3 相关类型的几乎所有源字段登记为 mapped 或 text；dropped 的都是内部标记、2024 专用、图片、版式。"text"字段基本只是 `entries` 正文。结论：**除了个别漏实现（D-1、D-14 的疑点），源数据里的结构化信息转换器基本都收了；"没结构化"主要是因为 5etools 本身就只有文字**（D-13）。
2. **Foundry dnd5e 6.1**：只覆盖 SRD。能给我们的是"形状参考"：ItemChoice 的 `choices`／`restriction`、法术选择类型、每级新增数量的写法；它没有非 SRD 的结构化数据可补。
3. **5e-database**：只覆盖 SRD。形状参考：选择挂在容器特性上（`feature_specific.subfeature_options`）、等级表里 `class_specific` 记累计数。
4. **没有任何一个参考库能替我们补 D-10 到 D-13**；它们要么靠 5etools 其他文件（语言分类要查源），要么保持文字。

## 八、没有核实的地方（诚实列出）
- 第三、五节"人物页用没用"的初筛是按词搜的，凡标"初筛"的都可能错；"已核实"的只有：`multiclass`、`flexibleAbility`、`spellGrant` 在人物页和派生层 0 处读取，疾病效果 9／9 为空，语言 `type` 缺 46 个，条目数在重建后不变。
- 背景个性表、起始装备、种族列表去重这几项，要等对应小 UNIT 开工前打开真实界面逐个点过才知道。
- D-14 的 20 项登记疑点，有的可能是我解析登记路径的写法造成的假阳性。
- D-8、D-9、D-12 的形状与可行性都没细查。


---

# 第三部分：参考数据库数据形状详细对照（驾驶员 2026-11-05 要求"详细参考参考数据库的数据形状"）

> 这一部分把仓库外参考资料里每个有结构化人物数据的库，逐个摸了一遍形状，再回头对我们的包。参考资料目录只读，没写、没移动。
> 结果：补了 6 条新缺陷（D-16 到 D-21），并更正前面两处说法（见 §3.5）。

## 3.1 参考库一览：谁有什么

| 参考库 | 内容 | 对 UNIT3 的价值 |
|---|---|---|
| `5etools-cn-main/data`（中文版，转换器输入） | 职业、子职业、种族、背景、专长、可选特性、条件、语言的完整数据（不限 SRD） | **主数据源**；字段是"最细"的形状 |
| `5etools-src-main`（英文原版 5etools 网站源码） | 同上（英文）；`data/class` 等；无单独的 schema 文件 | 对照英文名；形状同上 |
| `dnd5e-6.1.x`（Foundry dnd5e 系统 6.1，源码＋开放数据） | `module/data/advancement/*.mjs` 是升级项的**权威数据模型**；`packs/_source` 是 SRD 数据（yml） | **形状最完整**（升级项、选择、替换、选定内容存放）；数据只有 SRD |
| `5e-database-main`（SRD API 数据，`src/2014/schemas/*.ts` 是严格 schema） | 职业、等级、特性、种族、特质、子职业、背景、专长、熟练项 | 形状参考（成长数值、特性内选择）；数据只有 SRD |
| `5e-srd-api-main`、`5e-database-main 2` | 同一项目的 API 与另一份拷贝 | 无新增形状 |
| `dnd5-srd-master` | 早期 SRD JSON（`classes.json`、`levels.json`、`features.json`…） | 与 5e-database 同源，无新增 |
| `dnd-data-main/data` | 背景、职业、物品、怪物、种族、法术：只有 `name/description/properties/publisher/book`，正文型 | **没用**：基本是文字，没有结构化的升级或选择 |
| `open5e-staging`、`Open-VTT-main`、`atlas-vtt-main`、`Beyond20-master`、`DND_Calculator-main`、`DND5e_chm-main`、`wiki-dnd-parser-master`、`huijiwiki-tools-main`、`5eDataParser-master`、`foundryvtt-master`、`5etools-img-main` | 应用代码、解析器、地图、图片、发行说明 | 不是人物数据源；没有可对照的结构化数据 |

## 3.2 Foundry dnd5e 的升级数据模型（权威形状）

```
 升级项（advancement）按类型，每条自带 level（HitPoints、Trait、ItemGrant、ItemChoice、ScaleValue、
 AbilityScoreImprovement、Subclass、Size、ModifyItem）：

 ItemChoice.configuration          choices:{ "<级>":{count:本级新增数, replacement:本级可替换} }
                                   pool:[{uuid}]            候选清单（或用 restriction 按类型筛）
                                   restriction:{type,subtype,level,list[],school[]}
                                   type:"feat"｜"spell"｜…    spell:{ability[],method,prepared,uses{max,per}}
 ItemChoice.value（选定内容）       added:{级:{id:uuid}}  replaced:{级:{level,original,replacement}}
 AbilityScoreImprovement.config    points（本级点数）· cap（单项上限，默认 2）· fixed{} · locked[]
                                   max · recommendation
 AbilityScoreImprovement.value     type:"asi"｜"feat"  assignments:{属性:增量}  feat:{级:专长}
 Trait.config                      grants[] · choices:[{count,pool[]}] · mode · allowReplacements
 Trait.value                       chosen[]
 Subclass.value                    document · uuid（选定的子职业）
 职业条目 class：hd{denomination,spent,additional} · levels · primaryAbility{value[],all}
                 · spellcasting(progression,ability,preparation) ；子职业：classIdentifier · spellcasting
 专长 feat：prerequisites{items[],level,repeatable} · requirements(文字) · type{value,subtype}
 种族 race：movement · senses · type（生物类型）；背景：advancement＋startingEquipment
```

**对我们的启发（数据与人物存放两方面）**
1. **"选定内容"挂在升级项自己的 value 里**：每级"选了哪个选项、替换了哪个"、属性提升是"加属性"还是"选专长"、选了哪个子职业，都有固定位置。我们的人物只存了熟练项、`abilityGrowth`、`asiLog`（只有两个属性），**没有选专长、选选项、替换**的位置（D-20）。
2. **每级数量是"新增"**（Foundry）而我们是"累计"（沿用 5etools）；两种都行，向导算差值即可，不必改数据。
3. **"可替换"是数据里的一个布尔**（`replacement`），我们没有；"升级时替换已知法术或祈唤"规则靠它。
4. **属性提升有 `cap`（单项上限 2）、可锁定属性、可推荐专长**；我们 `abilityScoreImprovement` 有 `points/fixed/max`，缺 `locked`、`recommendation`（不重要）。

## 3.3 5e-database 的形状（SRD）

```
 等级 Level.class_specific（每级成长数值，按职业）：
   野蛮人 rage_count · rage_damage_bonus · brutal_critical_dice
   吟游诗人 bardic_inspiration_die · song_of_rest_die · magical_secrets_max_5/7/9
   牧师 channel_divinity_charges · destroy_undead_cr
   德鲁伊 wild_shape_max_cr · wild_shape_fly · wild_shape_swim
   战士 action_surges · extra_attacks · indomitable_uses
   武僧 ki_points · martial_arts{dice} · unarmored_movement
   圣武士 aura_range（子职业 aura_range）      游侠 favored_enemies · favored_terrain
   游荡者 sneak_attack{dice}                   术士 sorcery_points · metamagic_known · creating_spell_slots[]
   魔契师 invocations_known · mystic_arcanum_level_6..9     法师 arcane_recovery_levels
 等级 Level 其余：ability_score_bonuses(本级是否有属性提升) · prof_bonus · features[] · spellcasting{cantrips_known,spells_known,spell_slots_level_1..9}
 特性 Feature.feature_specific：invocations[] · expertise_options{choose,from} · subfeature_options{choose,from}
                                · terrain_type_options · enemy_type_options        ← 特性内部的选择
 特性 prerequisites：[{type:"level"｜"feature"｜"spell",level,feature,spell}]
 种族 ability_bonuses[] · ability_bonus_options{choose,from} · starting_proficiencies · starting_proficiency_options
      · language_options · size/size_description · traits[] · subraces[]
 特质 Trait.trait_specific：breath_weapon{area_of_effect,usage,dc,damage[{damage_type,damage_at_character_level{级:骰}}]}
                            · damage_type · spell_options{choose} · subtrait_options{choose}
 子职业 spells[{prerequisites[{type,level/feature}],spell}]（带等级门槛的扩展法术）
 背景 starting_proficiencies · language_options · starting_equipment[_options] · feature{name,desc}
      · personality_traits/ideals/bonds/flaws（ChoiceSchema：从表里选）
 专长 prerequisites[{ability_score,minimum_score}]
 职业 multi_classing{prerequisites[{ability_score,minimum_score}],prerequisite_options,proficiencies,proficiency_choices}
```

## 3.4 5etools（我们的源）里我们要注意的形状

```
 种族 ability:[{str:2}｜{choose:{from[],count}}]（可多组方案）  speed:数字｜{walk,fly,swim,climb:true}
      languageProficiencies:[{common:true,choose:{from[],count}｜anyStandard:N}]
      skillProficiencies:[{choose:{from[],count}}] · toolProficiencies:[{any:N｜anyMusicalInstrument:N}]
      weaponProficiencies:[{choose:{fromFilter,count}}｜{武器:true}] · feats:[{any:1}｜{anyFromCategory}]
      resist:["fire"｜{choose:{from[]}}] · creatureTypes · darkvision
      additionalSpells:[{ability:"cha"｜{choose:[int,wis,cha]}, known:{"1":[法术#c | {_:[{choose:"level=0|class=法师"}]}]},
                          innate:{"3":{daily:{"1":[法术]}}}, expanded:{…}}]
 职业 classFeatures:["名|职业||等级",{classFeature:…,gainSubclassFeature:true}] · optionalfeatureProgression
      · classTableGroups（逐级表） · multiclassing{requirements,proficienciesGained} · startingProficiencies
 子职业 subclassFeatures[] · optionalfeatureProgression · additionalSpells · subclassTableGroups
```

## 3.5 对照后更正前面的两处说法

1. 我之前说"宿敌、天生探索者、玄奥秘法这类特性内选择没有结构化来源"——**不对**：5e-database 的 `enemy_type_options`、`terrain_type_options`、`expertise_options` 有（SRD 范围）；Foundry 有玄奥秘法的"选法术"类 ItemChoice。5etools（我们的源）确实没有，所以对我们的包而言"来源（5etools）里没有，但参考库里有，可以评估补"。
2. 我之前说"种族天生法术已结构化、只缺 1 个（魔幻科波尔特）"——**不完整**：见 D-16、D-6 扩充。

## 3.6 对照出的新增数据缺陷

| 编号 | 缺陷 | 影响 | 对应数据线 | 把握 |
|---|---|---|---|---|
| D-6（扩充） | 种族天生法术里"选一个法术"（`{choose:"level=0|class=法师"}`）整条丢失：**高等精灵**（`subrace.elf-high.phb`，包里只有一条文字特性，没有 `spellGrant`）、**半精灵变体（月/日精灵血统）**（SCAG）、**魔幻科波尔特**（MPMM，选术士戏法）。核心书内共 3 个 | 3 | DF-2 | 高（源里是明确的筛选字符串；形状可参考 Foundry 的 `ItemChoice type:spell`） |
| D-16 | 种族天生法术的"施法属性由玩家自选（智力／感知／魅力）"丢失：源是 `ability:{choose:[int,wis,cha]}`，包里 `spellGrant.ability` 为空。包里至少 17 个种族/亚种（MPMM 的 Aarakocra、Aasimar 及其变体、Deep Gnome、Duergar、Fairy、Firbolg、Githyanki、Githzerai、Triton、Yuan-ti、Genasi…），源数据里共 25 个含此写法（其中部分在非核心书） | 17 | DF-2 | 高（目标：加一个"可选属性列表"字段，如 `abilityChoose:["int","wis","cha"]`，向导选种族时让玩家选） |
| D-17 | 龙裔吐息：伤害随等级（2d6/3d6/4d6/5d6）、类型/范围/豁免随龙种，现在只有一条文字 `note`；5e-database 有结构化 `breath_weapon{area_of_effect,dc,damage_at_character_level}` | 龙裔种族（PHB）1 个＋各色亚种 10 个 | DF-4 | 评估（可用已有的 `scaleValue` 表达等级骰，类型与范围放亚种） |
| D-18 | **职业逐级成长数值缺失**：5e-database 的 `class_specific` 里这些包里没有结构化——额外攻击次数（战士 2/3/4、野蛮人、武僧、圣武士、游侠 2 次；现在 `额外攻击` 特性只有文字）、野蛮暴击骰（9／13／17 级）、摧毁亡灵 CR（牧师）、荒野变身最大 CR 与飞行/游泳（德鲁伊）、宿敌数与天生探索者数（游侠）、奥术回复等级（法师）、魔法奥秘上限（吟游诗人）、术士"创造法术位"成本。我们的职业 `scaleValue` 全库只有 19 条（狂暴次数/伤害、吟游诗人激励、休憩之歌、引导神力、动作如潮、不屈、回气、武艺、气点、无甲移动、偷袭、术法点、已知祈唤） | 12 个职业，约 15 个成长列 | DF-4 | 高（5etools 职业逐级表 `classTableGroups` 有数值列的，转换器 `CLASS_SCALE_COLUMNS` 只配了一部分；其余在正文里，需评估） |
| D-19 | 特性内部的选择：宿敌类型（`enemy_type_options`）、天生探索者地形（`terrain_type_options`）、专精可选技能（`expertise_options`）、种族特质内的子选项（龙族先祖 `subtrait_options`）。5etools 没有结构化，5e-database 有 | 游侠、吟游诗人、游荡者、龙裔等 | DF-3 | 待评估（来源在参考库，只覆盖 SRD） |
| D-20 | 人物里没有"选定内容"的存放位置：选的专长、选的选项（战斗风格、祈唤、战技…）、每级的替换、选的子职业以外的选择、选的法术。Foundry 的做法是挂在升级项的 `value` 上（`added`、`replaced`、`assignments`、`feat`、`chosen`） | 全部升级选择 | 界面线 S5 的前置设计（不是包数据） | 高（已核实代码：只有熟练项、`abilityGrowth`、`asiLog`） |
| D-21 | `choose` 的候选池丢失：`race.hobgoblin.vgm`（源是按筛选条件选 2 个武器：`type=军用武器|miscellaneous=平凡的`）和 `race.githyanki.mpmm`（工具选择，源 `{any:…}`）的 `choose.from` 为空；另有 23 个背景的 `languages.choose` 没有 `from`（语义是"任选标准语言"，不算缺陷，但没显式标 any） | 2＋23 | DF-2 | 中 |

## 3.7 一页对照：参考库形状 vs 我们的包

```
                         Foundry                5e-database            5etools(源)            我们的包
 升级选择槽              ItemChoice choices     feature_specific       optionalfeatureProgr.  itemChoice(累计count)
                         {级:{count新增}}        .subfeature_options                           子职业层缺 6 个 (D-1)
 选择→容器特性           advancement 的 title    选择挂在容器特性上      名字相同               explain 缺 (D-2)
 选定内容存放            advancement.value      —                       —                      人物没有 (D-20)
 本级可替换              replacement:bool       —                       —                      无（规则动作）
 属性提升                points/cap/fixed       ability_score_bonuses   classFeature 名         abilityScoreImprovement ✔
 子职业                  Subclass               subclasses/levels      gainSubclassFeature     subclass + explain ✔
 职业逐级成长数值        ScaleValue             class_specific(~35 项)  classTableGroups       scaleValue 仅 19 条 (D-18)
 种族属性加成            ASI fixed+points       ability_bonuses+options ability[…choose]       abilityBonus+flexibleAbility ✔
 种族天生法术            ItemGrant 法术          —                       additionalSpells       spellGrant ✔ 但丢选法术、丢自选属性 (D-6、D-16)
 龙裔吐息                Activity                trait_specific.         文字                   note 文字 (D-17)
                                                 breath_weapon
 特性内选择(宿敌等)      —                       enemy_type_options 等   文字                   文字 (D-19)
 专长前置                prerequisites          prerequisites           prerequisite           requires{all/any} ✔(最细)
 兼职                    —                       multi_classing          multiclassing          multiclass ✔（界面没用 U-3）
 背景个性表              —                       personality_traits…     正文表                  characteristics ✔
 选法术类选择            ItemChoice type:spell   —                       —                      无 (D-9)
```

## 3.8 本部分的诚实声明
- `5etools-src-main` 没有单独的 JSON schema 文件，所以"5etools 形状"是我读数据（`races.json` 等）归纳的，不是官方 schema。
- Foundry 和 5e-database 的结论只对 SRD 内容成立。
- D-18 里"约 15 个成长列"是对照 5e-database 的 `class_specific` 键数得出，5etools 逐级表里有没有对应列、能否机器读，尚未逐个核对（DF-4 评估时核）。
- D-6、D-16 的计数，核心书内是我逐个比对 5etools 与包得出（高等精灵、半精灵变体、魔幻科波尔特共 3 条；17 条自选属性）；亚种的名字对不上的部分没有逐个核对，可能有遗漏。

# UNIT3 数据需求与缺陷清单（整个 UNIT3 返工要用的结构化数据、缺陷、界面未用项）

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

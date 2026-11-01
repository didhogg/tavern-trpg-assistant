# G2.5 执行包 · P 管线站（规划者做，不交给执行 agent）

> **【完成情况，2026-11-01 规划者实测】** P1–P7 已做完，提交 `fb24d5b`（第一批）与随后的批次，**重建一次、两次哈希相同**；`check` 305、`test:data` 389、`g2-oldext`、快速 e2e（库子集、升级场景）全过。登记表 `data-defect` 从 42 项降到 30 项（其中 `b3-A` 144→79、`c13` 召唤物 45→5、`b7` 消耗品缺动作 21→0、`b4-consumption-target-missing` 41→0、`c1-resist-conditional` 300→0、`c4-recharge/legendary` 342+55→0、`a16b` 65→0、`b2-zero-placeholder` 13→0）。
> 与方案的差异（都是实测后的调整）：①P2 **没有**做"充能花费生成器"（`attachedSpells.charges` 本来就有，覆盖 109 件）；②P7 的数据源是 Foundry dnd5e 开源数据（固定提交 `0a247dd7`），只补缺；消耗品没有具体动作的给"使用"兜底动作（65 件）；③P3 的召唤物公式 44/45 解析成功（5 个多形态父条目与 1 个固定值的凶兆猎犬不猜）；④P6 迁移了**天生法术解锁等级**（还多修出 2 个手改漏掉的变体条目）与**起始装备类别项**（还多读出 12 个背景的"乐器／工匠工具／游戏用品自选"），**第 2 站的 6 条规则没有迁**——它们本来就是对全库生效的构建期规则（不是逐条行），只是带"条数必须是 N"的保险，D1.2b 导入新书时由规划者同步条数；⑤武僧无甲移动随等级增加：我之前说"改形状旧扩展装不上"是**错的**——旧扩展的效果对象是宽松的，多出一个可选字段只会被忽略。已新增可选并列字段 `bonusFormula`（`scale.unarmored-movement`，不改 `bonus` 的类型），转换器读 Foundry 的 `@scale.monk.unarmored-movement`，读取器读距离型 `scaleValue`；样卡"武僧 5 级速度"手算 40 与读出一致（`b1-speed` 登记归零）。
> 新增通用验收：`tests/data/p-pipeline.test.ts`（扫全库，不按书写死条数）。放行：`tests/data/g2-allow/sp.ts`（整类变化按类型＋路径，条数实测）。审计文档 `D1.2a_R8b_去向审计.md` 的代码行号随转换器改动映射（每次改 `tools/data/convert/` 后：`git checkout -- 该文档` 再跑规划者的映射脚本，只能跑一次）。

> 驾驶员 2026-11-01 重排：**数据问题先修转换器管线、重建，再逐条补原始数据里真没有的**。依据与逐项结论见 `docs/probes/D1.2-G2.5_根因与数据源台账.md`。P 站做完，D1.2b 导入的 40 本书直接受益。
> 执行 agent 在 P 站期间**暂停**（工作区保持干净）。P 站完成后规划者写 E 站交接文本，驾驶员说"继续"才开 E 站。

## 总则

1. **一轮改完、只重建一次**：P1–P6 都改完转换器与配置后统一重建；中途可以局部构建自测，但对外的哈希、登记基线只在最后重定一次。
2. **验收用通用数据测试，不按书写死条数**：每条管线规则配一个扫全库的数据测试（"所有 X 都满足 Y"），这样 D1.2b 的新书自动被同一条测试检查。
3. **逐字对比**：P6 迁移的验收是"迁移前后数据**逐条 diff 为空**"（用脚本对比重建前后的 11 个包），不是看测试绿。
4. **旧扩展兼容**：新字段全可选，`dataVersion` 不变；`g2-oldext` 全过。
5. **放行（`g2-additive`）**：整类变化用按类型的规则（通则：整类条目都改才用 `type:`），点名的小批量仍用 `ids`；`tests/data/g2-allow/match.ts` 的归属规则已支持。
6. **每个 P 项独立提交**，提交说明写：根因、改了哪个文件的哪一段、受影响条目数、通用测试名。

## P1 Foundry 映射（`tools/data/convert/foundry.ts` 等）

- **根因（已查实）**：①`number()` 的正则 `^[-+]?\d+` 不认 `"+ 10"`（符号后带空格），失败后被 `?? 0` 兜底成 0；②`+(sign(@attributes.movement.walk) * @scale.monk.unarmored-movement)` 这类含 `@scale.<职业>.<id>` 的公式没解析；③护甲计算 `ac.calc`、感官、先攻、`bonuses.save/check`、暴击标记（`meleeCriticalDamageDice`、`weaponCriticalThreshold`）、`magicalBonus` 没有映射，只留一条"Foundry 效果：…"的说明（36 个条目）；④活动 `consumption.targets[].target` 的 uid（如"吟游诗人激励|吟游诗人|XPHB|1"）没换成我们的特性编号。
- **做法**：①`number()` 容忍符号后的空格；②`@scale.<职业>.<id>` → `scale.<id>`，`sign(@…)` 当作 1（原本有该移动方式才加，数据里取并入本模式的写法；若不能无损表达，**不写 0，写成说明并进登记**）；③补齐上述键的映射到既有效果种类（不新增 kind；对不上的保留说明）；④uid 解析：按"名称|职业|书|等级"到我们的特性编号。⑤**把 `consumes` 读全**：5etools 的 `consumes`（池名＋数量）出现在职业特性 24、子职业特性 115、可选特性 79 个条目上，转换器只处理了可选特性；改为三类都读，并把池名（引导神力、卓越骰、术法点、Ki、功力、奥术射击、灵能骰、荒野形态）解析成池特性编号（一个池名在多个职业／书里时，按同一职业与同一版本匹配）。**取消所有 `?? 0` 兜底**：解析失败一律保留为说明文字并进登记，绝不写 0。
- **通用测试**：全库没有数值为 0 的 `speed`／`ac`／`hpMax` 效果（除"速度变 0"的状态）；没有以"Foundry"开头的说明里含已映射的键；所有活动消耗目标都能解析到存在的条目。
- **预期消掉**：`b2-zero-placeholder`、`b1-ac/hp/speed`、`b4-consumption-target-missing`、`b2-derived-in-note`（含暴击 4 个，原 4-5）。

## P2 物品（原 3g-0）

- **根因（已查实）**：①`categoryOf` 三个 bug（类型代码带 `|来源` 后缀、`VE` 笔误、`$` 系列缺规则）→ 139 件掉进"奇物"；②5etools 的原始标记（`CNS`、`staff`、`poison`、`tattoo`、`scfType`…）都在 `extra`／`facets` 里，没翻译成标准字段；③读取器误报：4 件"耗尽毁灭"的物品没有 `recharge` 是正确的；种族特质（拥有者种族已有结构化的 `resist`／`proficiencies`／`speed`…）被分诊成"纯文字 A 类"（60 个）。
- **做法**：见 `03_第3站_结构化.md` 的 3g-0 第 1–4 条（修 `category` 139 件、声明式类型表 `itemKind`、`consumable` 以 `CNS` 为准且弹药不标、`focusType`／`poisonDelivery`）。**充能花费不再要生成器**：5etools 的 `attachedSpells.charges`（花费 → 法术）、`daily`、`limited`、`will` 已原样带进数据（`charges` 映射 121 件），消费方直接读；写进 `01_字段规格.md` F10 的"消费方读法"。
- **Foundry 重印活动（候选，不入 `activities`）**：对 2014 条目通过 `reprintedAs` 找 XDMG 的 Foundry 活动，**只**放进 `extra.foundryActivities`（现有机制）供 E3 核对，不直接成为数据。
- **读取器修正**：`b7-charges-no-recharge` 不再把"文字写明耗尽毁灭"的物品当缺陷；`b3` 分诊里拥有者是种族／亚种、且该种族条目已有对应结构化字段（`resist`／`proficiencies`／`speed`／`darkvision`／`senses`／`abilityBonus`）的特质不算 A 类。
- **通用测试**：每件真实物品都有 `itemKind`；`consumable` 物品恰为 `CNS` 标记集合；`category` 与类型代码一致。
- **预期消掉**：`b7-charges-no-recharge` 误报 4 件、`b3-A-derived-in-text` 种族 60 个；新增登记 `i1-item-no-kind`（→0）、`i3-daily-use-text-only`（交 E3）、`i2-charge-cost-non-spell`（78 件非法术充能，决定项）。

## P3 怪物（原 3e-0、4-7、4-8、4-9）

- **根因（已查实）**：①AC 的 `from` 原始是 `{@item 板甲|phb}` 标签，被压成文字（3e）；②原始 `resist`／`immune`／`vulnerable` 是对象 `{resist:[代码], note:"来自非魔法攻击", cond:true}`，被拼成文字（300 个）；③`{@recharge N}` 标签（170 个动作）和传奇动作名"（花费 N 个动作）"（26 个）可机械读；④召唤物的 AC／生命值在原始数据里是**规则化的文字**：AC 写法 36/37 是"N + 法术环阶"，生命值只有约 17 种写法（法术环阶 11 种、职业等级倍数 6 种）；Foundry 的 `summon` 活动只有 `profiles`，没有公式；攻击里的"+ 法术环阶"在文字里（51 个快照）。
- **做法**：①`ac[].items`、攻击 `item`（`01` F8）；②`resistConditional`／`immuneConditional`／`vulnerableConditional`（`01` F1，`except` 映射表只用 04 的 4-7 那张）；③`rechargeRoll`（`01` F2）、传奇 `cost`（`01` F3）；④`summon` 公式（`01` F4）：约 6 条解析规则，写不进规则的混合写法（"N 或 N …"）**不猜**，登记交 E4。
- **通用测试**：所有 `ac[].items` 指向存在的物品；`resist` 对象数 = `resistConditional` 项数；名字含"充能 N"的动作都有 `rechargeRoll` 且一致，反之亦然；传奇动作同理；所有 `summon` 公式能解析、`baseLevel` 求值与条目原占位值一致；攻击公式和文字一致。
- **预期消掉**：`c1-resist-conditional` 300、`c4-recharge-text-only`、`c4-legendary-cost-text-only`、`c13-summon-placeholder` 45 中能解析的、`c13-summon-attack-snapshot` 51、`c4-damage-struct-not-in-text` 51。

## P4 表格（原 3f-0）

- 见 `03_第3站_结构化.md` 的 3f-0：转换器记 `at`（书里原位置）、字典 `tools/data/config/tableOwners.ts`、`parent.appliesTo`、软引用校验。**根因**：表放在书籍章节下，5etools／Foundry 都没有表与条目的绑定，只能用章节标题当线索（查证见台账）。
- **通用测试**：字典命中的章节里的表都有 `parent`；`at.anchor` 存在于书的 `outline`。

## P5 法术与专长

- **根因（已查实）**：①`spell.ts` 用 `classVariant` 时把可选列表（塔莎）混进核心职业列表（65 处）；原始 `gendata-spell-source-lookup.json` 里 `class` 与 `classVariant` 是分开的键；②原始专长 `additionalSpells[].…choose:"level=1|class=…|school=…"` 就是结构化的法术池查询（5 个专长）。
- **做法**：①核心列表只用 `class`；`classVariant` 按（书、职业）生成锚点特性 `feature.<职业>-additional-spells.<书>` 的 `spellLists`（锚点写法照 `tools/data/fix/rows/s1-artificer-list.ts`）；②`choose` 串 → 专长的法术池记号（`01` E3）。
- **通用测试**：PHB 法术的 `classes` 里不含任何 `classVariant` 来源；每个锚点指向存在的职业与法术；专长池记号都能被 `expandToken` 展开。

## P6 迁移（把"已逐条修过"的转换器病根迁回管线）

- **清单**：①天生法术解锁等级（读 `additionalSpells[].innate` 的等级键）；②起始装备类别项（读 `startingEquipment.defaultData` 的 `equipmentType`／`focus*`）；③第 2 站的 6 条规则（怪物法术名补链接、教派链接、池拼写、表等级标签、邪术师法术位、卷轴标签）。
- **做法**：转换器照原始数据直接生成与现在**逐字相同**的结果；然后从 `tools/data/fix/index.ts` 退役对应的修正表与规则（它们的"现状值"断言会在转换器修好后自动报冲突，用来清点不漏）；`g2-additive` 的放行从逐条 `ids` 改成整类规则。
- **验收**：重建前后数据**逐条 diff 为空**（脚本对比 11 个包）；`check`、`test:data`、`g2-oldext` 全过。
- **补充层（驾驶员 2026-11-01 提出：这是真正的数据库，不能是只有 agent 才能嵌入维护的数据）**：原始数据和公开来源都没有的内容（E 站做的），一律写成**声明式补充层数据文件**，不是 TS 代码里的修正行：`tools/data/overlay/<领域>.json`，每行 `{ id, path, op, after, basis（书名＋页码）, source }`，随数据仓库版本化；构建时在管线之后应用（沿用现有 `before` 断言作保险）；任何人（不只是 agent）可以读、改、导出。P6 顺便把现有 `rows/*.ts` 的逐条行转成同一格式。`E` 站交付的就是这些文件。

## P7 新数据源接入：Foundry dnd5e 开源数据（驾驶员 2026-11-01 要求"先查好有没有数据可以直接导入"）

- **数据源**：`foundryvtt/dnd5e` 仓库 `packs/_source`（YAML，SRD 5.1 的 2014 内容与 SRD 5.2 的 2024 内容）。规划者已整库拉取核对，覆盖率见台账第三节。
- **做法**：写 `tools/data/fetch/foundry-dnd5e.ts`（固定提交哈希，拉到 `reference/foundry-dnd5e-open/`，不入库，哈希写进配置，和 5etools 副本同样处理）；新增读取层按**英文名归一**连接我们的条目，**只用 2014 的包（`items`、`classfeatures`、`races`、`spells`、`monsters`）作为数据来源，2024 的包只做交叉核对**（两版规则可能不同）。
- **接入内容**：①物品：`uses.max`、`uses.recovery`（period／type／formula）补全或核对 `charges`；`cast` 活动的 `itemUses` 花费与 `attachedSpells.charges` 交叉核对；消耗品（74／119）的活动；固有每日次数（速度之靴、魔术袋等，33 件）→ `charges`＋活动；②SRD 职业特性：`consumption.targets`（如 Cutting Words → `feat:bardic-inspiration`）解析成我们的特性编号写 `consumes`／`restores`，`uses.recovery` 对应休息类型。
- **原则**：5etools 已有的值优先；Foundry 只补缺；**两者数值不一致不静默覆盖，进登记交规划者**。每个来自 Foundry 的字段在 `credit.structured` 里标来源与许可。
- **许可核对（动手前先做）**：确认 `foundryvtt/dnd5e` 数据部分的许可（SRD 内容为 CC-BY-4.0 且需署名）并把署名写进包的 `credit`；不确定就停，问驾驶员。
- **通用测试**：每个来自 Foundry 的 `charges.max` 与 5etools 的 `charges` 一致；每个解析出的消耗目标指向存在的特性。
- **覆盖率实测写进报告**：接入后"消耗品活动"、"每日次数"、"资源关系"各剩多少，E 站名单据此重算（`E_逐条站.md` 的数字是接入前的）。

## P 站完成后

1. 两次构建哈希相同；11 个新哈希写进 `冻结记录.md` §9（E 站起点）。
2. 登记表重定基线，列出每个登记项的变化（对照台账的"预期消掉"）。
3. `check`、`test:data`、`g2-additive`、`g2-oldext`、快速 e2e（库子集、升级场景）全过。
4. 写 `执行agent交接文本_E站.md`，驾驶员说"继续"，执行 agent 开 E 站。

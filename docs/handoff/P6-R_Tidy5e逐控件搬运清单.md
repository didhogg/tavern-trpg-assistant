# P6-R · Tidy5e 角色表逐控件搬运清单（2026-11-24，驾驶员令：每一项照 Tidy5e 搬，变成我们的风格，全部做完、做到位再交付）

- 全量控件来源：脚本从 Tidy5e 角色表入口 + 它登记分页 / 侧栏 / 表格列 / 行按钮 / 右键菜单的文件沿组件引用全量抽取（`work/p6-ui/tidy5e-controls.md`，脚本 `$CLAUDE_JOB_DIR/tmp/tidy-controls.mjs`）。参考源码根：`foundry-vtt-tidy-5e-sheets-main/src/`（只读）。
- 排除：堡垒以外的队伍 / 载具 / 遭遇表专用控件（不属于角色表）。掷骰类点击 = P7（驾驶员 11-23：除点了掷骰外全部要有），本清单记为「掷 → P7」。
- 写入一律走现有人物 store 动作 / 小窗现有命令（`edit` 的 set·item·itemDelete·effect·effectCreate·effectDelete·status；`act` 调 equip·attune·recover·useItem·levelUpApply·addToActor(带数据)·removeItem·rest·concentration·condition）。界面只读官方显示数据、不算数。缺现成后端的记入 §11，不擅自改。
- 搬法 = 搬 Tidy5e 的“登记机器”：表格列登记（`registry/features/columns.ts` + `registry/partitions/columns.ts`）、行按钮登记（`registry/features/row-actions.ts` + `partitions/row-actions.ts`）、右键菜单（`context-menu/tidy5e-item-context-menu.ts`）、设置窗口（`data-config=` → dnd5e 官方配置窗）原样搬成我们的登记表，表格组件按登记画。
- Tidy5e 的「解锁 / 锁定」模式：驾驶员 11-15 定“不做模式开关，编辑入口一直可见”，搬法 = 解锁时才出现的控件一律常显（✎ / ⋯）。
- 状态：[ ] 未做 · [~] 部分 · [x] 已做并真点验证

## 1 表格机器（行动 / 背包 / 法术 / 特性 / 效果共用；`shared/*Tables.svelte`、`components/table-quadrone/*`）
- [ ] 1.1 列登记照 Tidy5e partitions：行动 = 次数(charges) · 命中(roll) · 公式(formula) · 射程(range) · 目标(target) · 时间(time)；特性 = 次数 · 时间 · 恢复 · 来源(requirements)；背包 默认 = 次数 · 时间 · 价格 · 数量 · 重量，武器 = 次数 · 时间 · 命中 · 公式 · 价格 · 数量 · 重量，消耗品 / 杂物 / 容器各自（容器 = 容量条）；法术 = 次数 · 成分 · 学派 · 时间 · 目标 · 射程 · 命中；效果 = 来源 · 持续。窄时按 priority 依次收列（`determineHiddenColumns`）
- [ ] 1.2 次数格：value / max 行内输入 + 充能骰（recharge：有充能 → 点了 recover）（ItemUsesColumn）
- [ ] 1.3 数量格：− 输入 ＋（InlineQuantityTracker）
- [ ] 1.4 重量（总重 rowContext.totalWeight）· 价格（未鉴定显示占位）· 公式（前两个伤害 + “+N”）· 学派图标 · 成分（V S M 标记，特殊成分强调）
- [ ] 1.5 行按钮照 row-actions 登记：背包 = 编辑 · 删除 · 同调 · 装备 · 显示到行动页 · ⋯；法术 = 准备开关 · 编辑 · 删除 · 打开活动 · 显示到行动页 · ⋯；特性 = 编辑 · 删除 · 显示到行动页 · ⋯；效果 = 开关(专注效果 = 打断专注) · 编辑 · 删除 · ⋯
- [ ] 1.6 右键菜单（⋯）照 item-context-menu：查看 · 编辑 · 同调/取消 · 装备/卸下 · 准备/取消 · 充能 · 收藏/取消 · 标为随身装备(gear) · 拆分堆叠 · 做成卷轴 · 活动设置 · 鉴定 · 复制 · 显示到行动页/移出 · 设为灵感来源/移除 · 选分组 · 删除（「发到聊天」「置顶」见 §11）
- [ ] 1.7 工具条（ItemsActionBar）：搜索（清除 ×）· 官方筛选开关（listControls.filters，左键开 / 右键排除）· 筛选菜单 · 排序菜单（listControls.sorting：手动 / 字母）· 分组切换（listControls.grouping）· 全部展开 / 收起（顶层 / 全部）
- [ ] 1.8 组头：名字 · 条数 · 列名；点组头折叠；组头右边「＋」新建这一类（Create Item / Spell / Feature / Effect）
- [ ] 1.9 行：图标首字 · 名字 · 小字说明（官方 subtitle）· 点名字展开说明（含活动列表、效果列表 TidyInlineActivitiesList / TidyInlineEffectsList）· 拖动排序（手动排序时）
- [ ] 1.10 页底「新建 ▾」（按类型新建空白条目 = addToActor 带数据）+「从库里加」（CompendiumBrowseButton → 我们的库选择页）

## 2 页头（`actor/CharacterSheet.svelte` 等）
- [ ] 2.1 名字原地改（TextInputQuadrone）· 复制名字（copyInnerText）· 置顶★（我们的需求）
- [ ] 2.2 副标题（CharacterSubtitle）：职业等级 · 种族 · 背景 · 阵营 · 速度 · 感官 · 法术 DC · 经验条 + 经验原地改
- [ ] 2.3 头像：点开看大图（action）· 换头像 · 形状（主题项，归我们的主题，不做）
- [ ] 2.4 短休 / 长休（rest；官方休息窗的“花生命骰”= 掷 → P7，先按现有不掷结算）
- [ ] 2.5 等级块：等级 · 熟练加值 · 灵感（开关 + 多枚时 −/＋：InspirationBadge）· 升级下拉（LevelUpDropdown → levelUpApply）
- [ ] 2.6 AC（点 = 护甲设置窗 armorClass）· 先攻（掷 → P7；⚙ = initiative 设置）· 专注（掷 → P7）
- [ ] 2.7 六属性（AbilityScore）：调整值（掷检定 → P7）· 属性值原地输入（EditScore）· 豁免（掷 → P7）· ⚙ 属性设置（ability）
- [ ] 2.8 生命：当前值原地输入（可输 +5 / −3）· 上限 · 临时生命浮层（临时 / 临时上限两格 + ⚙ hitPoints）· 生命条
- [ ] 2.9 生命骰条 + ⚙（hitDice 设置：各面数剩余）
- [ ] 2.10 力竭条（ActorExhaustionBar：0–6 级逐级按钮 + 关闭）
- [ ] 2.11 死亡豁免（0 血出现）：成功 / 失败格逐格点 · 掷 → P7 · ⚙ death 设置 · 隐藏
- [ ] 2.12 分页条（Tabs）· 侧栏开关 · 我们的应用条（返回 · 上一位 / 下一位 · 撤销 · 改动记录 · ⋯）

## 3 侧栏（`character-parts/CharacterSidebar.svelte`、`SidebarTab*`）
- [ ] 3.1 侧栏分页 [技能 | 收藏]（+ 分页设置 openSidebarTabConfiguration → 我们不做配置，固定两页）
- [ ] 3.2 技能卡（SkillsCard）：熟练圈点一下循环 无 / 半 / 熟 / 专（ProficiencyCycle，右键反向）· 属性缩写 · 名字（掷 → P7）· 加值 · 被动 · ⚙ 技能设置（skill：属性、加值、被动加值）· ⋯ 技能菜单（skill-roll-context-menu：收藏）
- [ ] 3.3 工具卡（ToolsCard）：同上 + 卡头 ⚙ 工具熟练设置（加 / 删工具）
- [ ] 3.4 收藏（favorites/*）：物品（次数输入 · 数量 · 装备态）· 法术位（剩余输入）· 技能 / 工具（加值）· 效果（开关）· 活动（次数输入）；拖动排序；取消收藏

## 4 属性页（`tabs/CharacterAttributesTab.svelte`）
- [ ] 4.1 豁免卡（SavingThrowsCard）：每项 熟练开关（ProficiencyCycle 0/1）· 加值（掷 → P7）· ⚙ 属性设置；专注豁免行 + 专注中标记（Concentrating → 打断专注）
- [ ] 4.2 特质卡（CharacterTraits）上半 = 职业 / 子职业 / 种族 / 背景（ActorTraitClasses / CharacterTraitSpecies / ActorTraitBackground）：
  - 职业行：名字（看资料）· 等级 · 升一级 · 等级下拉（官方 availableLevels）· 原始职业♛ · 编辑 · ⋯；子职业行 / 「加子职业」；无职业 =「从库里加职业」「新建自定义职业」；多职业逐行；「加职业」
  - 种族行：名字 · 编辑 · ⋯ ·（无 =「从库里加」「新建自定义」）· 生物类型 ⚙（creatureType）
  - 背景行：同种族
- [ ] 4.3 特质卡下半 = 特质药丸（CharacterTraitPills / ActorTraitPills / ActorTraitConfigurableListEntry）：体型 · 速度 · 感官 · 语言 · 伤害抗性 · 免疫 · 易伤 · 伤害修正 · 状态免疫 · 护甲训练 · 武器熟练 · 自定义特质；每组一行 + 各自 ⚙（对应官方设置窗）
- [ ] 4.4 卡头「特殊特质」按钮（configureTab → 官方 flags 特殊特质窗）

## 5 背包页（`tabs/ActorInventoryTab.svelte`）
- [ ] 5.1 工具条（§1.7）+ 负重条（ActorEncumbranceBar / CharacterEncumbranceRow：当前 / 上限、超重档位）
- [ ] 5.2 分组表（§1）按物品类型；容器行可展开里面的东西（InlineContainerView）+ 容量条 / 容量数（CapacityBar / CapacityTracker）
- [ ] 5.3 页底（ActorInventoryFooter）：五种钱币原地输入（pp gp ep sp cp）· 钱币设置 ⚙（currency 窗）· 同调数 当前 / 上限 · 新建物品 · 从库里加

## 6 法术页（`tabs/ActorSpellbookTab.svelte`）
- [ ] 6.1 施法职业卡（SpellcastingClassSummaryCard）：职业名 · 施法属性 · 设为主施法属性（SpellAbilitySet）· 法术 DC · 攻击 · 已准备 当前 / 上限
- [ ] 6.2 法术位（SpellSlotTracker + SpellSlotManagementQuadrone）：每环圆点点按 + / − · 剩余 / 上限 · 上限覆盖（⚙）· 契约法术位
- [ ] 6.3 分组表（§1）按环 / 施法方式；准备开关（SpellButton）
- [ ] 6.4 页底（ActorSpellbookFooter）：专注中（点 = 打断专注）· 新建法术 · 从库里加

## 7 特性页（`tabs/CharacterFeaturesTab.svelte`）
- [ ] 7.1 分组表（§1）按来源（官方 sections：主动 / 被动 / 各职业 / 种族 / 背景 / 其他）
- [ ] 7.2 新建特性 · 从库里加

## 8 效果页（`tabs/ActorEffectsTab.svelte`）
- [ ] 8.1 状态开关（ActorConditionsQuadrone / ConditionToggleQuadrone）+ 力竭档位（ExhaustionToggle：− 数 ＋）
- [ ] 8.2 效果分组表（EffectsTables）：开关 · 来源（点看来源）· 持续 · 编辑（效果字段：名字 · 改动列表 · 持续 · 停用）· 删除 · 组头「新建效果」

## 9 背景页 / 日志页（`tabs/CharacterBiographyTab.svelte`、`tabs/ActorJournalTab.svelte`）
- [ ] 9.1 特征字段（阵营 · 性别 · 眼睛 · 身高 · 信仰 · 头发 · 肤色 · 年龄 · 体重）原地改
- [ ] 9.2 性格 · 理想 · 牵绊 · 缺点 · 外貌 · 传记：每段 展开 / 收起 · 编辑 · 复制（DescriptionControls）
- [ ] 9.3 日志：页列表（VerticalTabs）· 上一页 / 下一页 · 新页 · 改标题 · 正文编辑 · 删除页

## 10 设置窗口（`data-action="showConfiguration"` 的 data-config → 我们的模块抽屉 FieldEditor，字段取官方定义）
- [ ] armorClass · initiative · ability · hitPoints · hitDice · death · skill · tool · movement · senses · languages · traits（抗性 / 免疫 / 易伤 / 修正 / 状态免疫）· armor / weapon 熟练 · size · creatureType · currency · spell slots · concentration

## 11 没有现成后端、要驾驶员定的（做完其余后一起报）
- 「做成卷轴」（dnd5e Item5e.createScrollFromSpell，小窗没有命令）
- 「发到聊天」（DisplayCard：我们没有 Foundry 聊天；可改成发到酒馆聊天 = 新需求）
- 「置顶 / 置顶显示次数、数量」（Tidy5e 自己的页头快捷栏 SheetPins，我们没有这块界面）
- 「拆分堆叠」一次写两件（改数量 + 新建一件）= 两条撤销，需要合成一条的命令

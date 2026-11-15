# P6-6 角色表 · Tidy5e 逐栏对照表（2026-11-15，驾驶员要求严格对照源码）

参考源码：`/Users/xxx/DND- reference（DO NOT DELETE！）/foundry-vtt-tidy-5e-sheets-main/src/sheets/quadrone/actor/`（只读）。下表每一行 = 一个界面元素：Tidy5e 怎么放（文件）/ 我们的线框怎么放 / 差异原因。线框在 `docs/design/p6-wireframe/`（p6-6 ～ p6-13）。

## 1 页头与整体

| 元素 | Tidy5e（出处） | 线框 | 差异 |
|---|---|---|---|
| 名字行 | 名字 + 短 / 长休图标按钮（CharacterSheet.svelte `actor-details-name-row`、`sheet-header-actions`） | 名字 ★ 英文名 + [短休][长休] 文字按钮 | 中文界面用文字更清楚；点开先预览（需求 R24） |
| 副标题行 | 速度 · 感官 · 体型 · 类型 · 种族 · 阵营 · 职业 + 法术 DC（CharacterSubtitle.svelte） | 同 | 无 |
| 经验 | xp 条（CharacterSubtitle `xp-container`） | 经验 900 / 2,700 + 条 | 无 |
| 等级块 | 灵感徽章 + 等级大数字 + 熟练加值（CharacterSheet `level-block`、InspirationBadge.svelte）；升级下拉 LevelUpDropdown.svelte | 灵感 · 等级 · 熟练 · [等级管理 ▾] | 无 |
| 战斗块 | AC 盾 + 先攻 + 专注豁免（`ac-container`、`initiative`、`concentration`） | AC · 先攻 · 专注 三个横向方块 | **盾形去掉**（驾驶员）；与属性块两种样式（驾驶员） |
| 属性块 | 6 个 AbilityScore（AbilityScore.svelte）：调整值、属性值、豁免 | 6 个竖卡 | 无 |
| 生命区 | HP 条，**点数字就地输入（可输差值）**，点临时生命开 Max / Temp 浮层；生命骰条；力竭按钮；死亡豁免按钮，0 血展开（CharacterSheet `hp-row`、`hd-row-container`、`exhaustion`、`death-saves`、DeathSavesOverlay.svelte） | 同；当前生命永不进抽屉 | 驾驶员：随时可改 |
| 标签行 | 侧栏开关 + 标签（CharacterSheet `tabs-row`） | 同 | 无 |
| 侧栏 | [技能 \| 收藏] 标签 + 技能卡 + 工具熟练卡（CharacterSidebar.svelte、SidebarTabSkills、SkillsCard、ToolsCard），每个分页都有，可折叠 | 同；窄屏默认折叠 | 无 |
| 编辑入口 | **整页"解锁"开关**，解锁后每个单元角上出现 ⚙（`context.unlocked`、`button-config`） | **每个模块右上角固定 ✎，一直可见** | 驾驶员 11-15 定；不做模式开关 |

## 2 分页

| 分页 | Tidy5e | 线框 |
|---|---|---|
| 行动 | CharacterSheetTab.svelte：ItemsActionBar（搜索、过滤开关、筛选、排序、展开、配置）+ 按行动类型分组的表；脚注切换"按行动类型 / 按物品类型" | 同；列 次数 · 命中/DC · 伤害/效果（取自截图，列可配置） |
| 属性 | CharacterAttributesTab.svelte：左列 SkillsCard + ToolsCard，右列 SavingThrowsCard + CharacterTraits | 同两列；**工具熟练卡紧接技能卡下**（你指出的"工具"问题；工具物品在背包） |
| 背包 | ActorInventoryTab.svelte：InventoryActionBar + 负重行 + InventoryTables + ActorInventoryFooter（调谐）；分组 = 物品类型（features/sections/Inventory.ts） | 同；分组 武器 · 装备 · 消耗品 · **工具** · 容器 · 杂物；钱币是物品（需求 R18） |
| 法术 | ActorSpellbookTab.svelte：ItemsActionBar + SpellTables（组头 SpellSlotManagement）+ ActorSpellbookFooter（SpellcastingClassSummaryCard：属性 / DC / 攻击 / 已准备，专注） | 同 |
| 特性 | CharacterFeaturesTab.svelte：ItemsActionBar + FeatureTables（按来源分组） | 同；**分组类别名未逐项核对** |
| 效果 | ActorEffectsTab.svelte：ActorConditionsQuadrone（状态开关 + 力竭）+ EffectsTables | 同；**效果分组名未逐项核对** |
| 背景 | CharacterBiographyTab.svelte：9 个特征字段（alignment gender age height weight eyes skin hair faith）+ 性格 trait ideal bond flaw + appearance + biography；平时只显示有内容的 | 同 + 给 AI 的说明（需求） |
| 日志 | ActorJournalTab.svelte：页列表 + 正文 + 上一页 / 下一页 / 新页 | 同 |

## 3 不在 Tidy5e、来自你的需求（线框里单独标注）

应用条（返回 / 上一位下一位 / 撤销 / 队伍 / 随行：R08 R09 R25）· 来源有更新提示（R32）· 头像可填链接也可上传（11-15）· 每个模块一个小抽屉 + 金线 + 来源标签 + 已删除可恢复（11-15）· 给 AI 的说明 · [保存修改]（设定草稿）。

## 4 已删除的非 Tidy5e 元素

底部固定条 · 页头下"状态 + 法术位"条 · 页头里单独的速度 / 熟练 / 被动 / DC 格 · AC 盾形（驾驶员）。

## 5 没核对到

- 行动 / 法术 / 背包表的**列名与顺序**：读到的是组件名和截图，没逐列核对源码（Tidy5e 的列是可配置的）；
- 特性按来源分组的确切类别、效果表的分组名；
- "收藏"标签里放什么，只读到组件名。

## 6 2026-11-15 更新

- 头像：页头左列方形头像约 180–196px，生命块缩小放在头像下（Tidy5e vitals-container 180px 头像）。
- 属性页：网格 左 17.5rem | 右 1fr，列间距与卡间距 24px，容器窄时按 CSS 规则重排（<40rem、<30rem）。
- 背景页：按 CharacterBiographyTab：外貌 + 传记；性格 / 理想 / 羁绊 / 缺点；特征只留 性别、信仰（驾驶员）；「给 AI 的说明」改名「备注」（驾驶员需求，源码无）。

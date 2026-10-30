# NEXT

## 当前里程碑
M4 人物（一）的数据前置 D1.2 全量结构化导入（规格 `docs/handoff/D1.2_全量结构化导入_交接.md`；当前执行 D1.2a，`docs/handoff/D1.2a_执行交接.md`）；D1.1 已由规划 agent 复核并并入 D1.2；M3 代码等待驾驶员真机验收；M2 已验收。

## 当前任务
- 目标：D1.2a R8b 已通过（A-1、A-2 订正二）；R7b（怪物特性 `traits`、传奇动作 `legendary` 修补）已完成，等待驾驶员验收；下一步 R10（重印/版本/NPC 种族/同书同名）。
- 红线：不推送/打标签/刷新 CDN/安装；不读凭证；官方书籍原文只手工核对规则，不进数据；单文件 ≤400 行；任何推送需驾驶员单独授权。
- 验收：`npm run check`、`npm run test:data`、`npm run build:data`、`npm run build`、`npm run e2e` 通过；R7b 守卫测试 `tests/data/r7b-monster.test.ts`。

## 已完成
- D1.2a R0 第二轮修订（检查点 1 有条件通过；R1 待开工）：
  - RW9：`outputTypes.ts`、`plannedFields.ts` 与目标字段校验接入；1,846 条 `to` 修正，`data.system.*` 0，未登记 0；同路径 529 条，抽样 20 条见报告。
  - RW10：`wp` 自动一致性校验接入，1,108 条修正；`i18n.en.*` R13、版本字段 R10、`lore` R8、表 R9、书 R12、新类型 R11、法术标签 R7/其余 R14。
  - RW11：B2=35，新增 B2b=2（`nameOverrides.ts`，PHB 136 / SCAG 145）；D2=120，D1=484。
  - RW12：无来源页码补中文版 PDF 页；RW13：monster 矩阵文件按 stats/actions/spellcasting/misc 命名，矩阵变更表在 `docs/probes/D1.2a_矩阵变更.md`。
  - 测试 241 / 60；`build:data` 与 `build` 通过。

## 检查点 1
- 状态：**R1 通过；R0 第三次矩阵修订完成，等待「矩阵通过」。**
- 未开始 R2。


- D1.2a R1 特性授予（完成，待复审）：
  - 修复 `mergeAdvancement` 同一等级只保留第一个 `itemGrant` 的问题，职业/子职业同层多个特性全部授予。
  - 子职业 `options{count}` 转成 `itemChoice`，猎人 3/7 级各 3 选 1；同一等级按名称+等级解析 `refSubclassFeature`，避免同名选项串到别的职业。
  - 金样测试 `tests/data/r1-grants.test.ts` 5 项；孤儿特性 0；`DELIVERED_WP` 已加入 R1。
  - 数据包重新生成；R1 矩阵登记复核无 `to/wp/how` 改动。

- D1.2a R0 第三次修订（RW14–RW16，完成待复审）：
  - `textContainers.ts`：mapped 指向文本容器 0；text 1,670；`to` 前 30 名见检查点报告。
  - `fieldCoverage/derived.ts`：`_copy/_mod/_preserve/_abstract/_trait` 命中 685；静态路径移除；残留测试通过。
  - `book.data.entries.ts` 补回 book 嵌套 162 条；`plannedFields` 新增 277（source-mirror 208）；`docs/probes/D1.2a_规格缺口.md` 32 条。
  - 矩阵最终对账 2,411；R1 兑现检查重新通过；新增 `rw14.test.ts`。

- D1.2a R2 可选特性（完成）：151 条全有 optionKind，owner optional 0；魔契师/战士选择与前置金样；矩阵变更 135 条；DELIVERED_WP 含 R2。
- D1.2a R3 可选职业特性（完成）：TCE 29 条，optional/replaces，游侠金样；A3=29、A1=0。
- D1.2a R4 流程型特性（完成）：role=procedure/mechanic/intro、ASI 与子职业 explain；子职业 text 回退；D1 升至 541，待 R14。
- D1.2a R5 熟练 trait（完成）：19 条附赠熟练全部有 trait；自然领域/勇气学院金样；A4=19。
- D1.2a R6–R7 修订（完成待复审）：§20.8 12/12 通过；模板 82、家族 37、intro 109、trait 54/15/14、spellGrants 0；引用悬空 0；等待 R7 通过，未开始 R8。
- D1.2a R7 第二轮补丁（完成待复审）：依赖表无环且 layer 严格向下；SRD 2,293→2,236（−57，56 件展开物品另加 1 个跨包家族）；家族 37 全部带后缀、成员无 `family` 字段；软引用 29；安装/卸载与 M2 7/7、e2e 通过。
- D1.2a R7 补丁二（完成）：0a/0b 后 SRD 2,227；9 个 `_copy` 怪物迁回来源包；非 SRD `credit.srd=true` 0。
- D1.2a R8（完成待复审）：`_copy._mod` 全量生效；19 条非 lore 变化已接受；4 条 id 重定向；lore 1,069 条（补丁 246、内嵌 823）；SRD 无 `data.lore`；隐藏类型与 e2e 通过。
- M0；U2 定稿；M1 核心数据层。
- M2（实现、复核与真机自检完成；50 条抽检已完成；数据 1.0.1 已发布）：
  - D1 数据定义：`src/rules/dnd5e2014/data/`（通用字段、15 种条目、7 种 advancement、7 种行动、正文块与行内标记、requires、ruleOptions/aiNotes）；`src/schemas/adventure/` 冒险内容项外壳。
  - 安装器与存储：formatVersion 2 识别与 L1 §2.2 全部限制；formatVersion 1 兼容；PackManifest 新字段；lineage/requires/recommends/conflicts/不支持功能的安装预案；Dexie 第 2 版（blobs、blobHashes、packTrash、迁移失败保持旧数据）；安装不再改写当前数据；内置包与推荐包数据层；自动存档原因「改动模组前」；`.trpgsave` 带图片。
  - 构建管线：`tools/data/` 从本地 5etools-cn 批量抽取、展开 `_copy`/`_mod`、展开魔法变体、转换、标记、来源与摘要、分包、校验、确定性打包、版本检查、报告；生成 11 个包。
  - 往返验证：`tests/data/` 的 fixture-data、fixture-adventure；D1 §8 每一行；官方 11 包全量安装、逐包导出再装、每种类型抽 20 条生成副本并做存档往返。
  - 产品：`packs/dnd5e2014-srd.trpgpack`、`packs/DATA-NOTICE.md`、`packs/LICENSES/`；本地数据仓库 `/Users/xxx/tavern-trpg-data`（10 个书籍包、catalog、NOTICE、LICENSES、README，已本地提交 `beab468`，未推送）。
  - 探针：「M2 数据自检」5 步；e2e 用本地模拟目录与包跑通下载步骤。

- M3（实现完成，待驾驶员真机验收；交接文档 `docs/handoff/M3_交接.md`）：
  - P1 外壳与控件库：悬浮球、可拖动可缩放主窗口、三档布局、深浅主题；开关（`━●` 为开）、勾选框、下划线术语、「⋯ 更多」菜单、下拉、可搜索下拉、药丸标签、提示条（全部自动消失）；全局弹窗宿主（页面栈，不叠加）。
  - P2 骰盘悬浮窗基础版：`src/rules/dice/`、独立浮窗、填入输入框、复制、最近 20 次。
  - P3 U2 界面：没有战役时的横幅首页、开局向导弹窗、页头存档芯片与保存、存档抽屉、导出与导入（存档文件与扩展包）、只读徽章。
  - P4 L1 数据层：`src/core/library/`（功能与规则选项、修改版、固定引用、卸载与图片清理、我的库、体检、图片上传）、库操作队列。
  - P5 L1 界面：库·本存档/扩展/我的、包详情弹窗（虚拟滚动条目列表）、条目详情与关联术语、版本条、修改版子页、体检子页。

- D1.1（实现完成，待规划 agent 复核与驾驶员真机验收）：
  - P0：数据源核对（5etools 主来源、Foundry 6.1.0 部分采用、5e-bits/Open5e 仅对照、dnd-data/dnddata 不用），`docs/probes/D1.1_数据源核对.md`。
  - P1：`enums/formula/effects/starting`、`dataVersion 2`、v1 兼容/v3 拒绝、规则选项 `engine/group`。
  - P2–P10：职业技能表/法术位/资源、种族背景、专长可选特性、uses/effects/activities、状态/力竭/九个动作、规则选项、物品、法术、起装全部结构化；11 包升到 1.1.0。
  - P11：校验、报告、626 行抽检表、`D1.1_确定性.md`；M2 自检新增人物规则抽样（6 步）；数据仓库本地提交 `6290d8b`。

## 证据
- D1.2a R0 复审修订：5,896 路径、未登记 0；79 类型/84 文件；`to` 修正 1,846、`wp` 修正 1,108、同路径 529；`npm run check` 241 项、`npm run test:data` 60 项；`build:data`/`build` 通过；矩阵变更表 `docs/probes/D1.2a_矩阵变更.md`。
- D1.1：`npm run check` 241 项单元测试（24 个文件）；`npm run test:data` 51 项（14 个文件）；`npm run e2e` Chrome+WebKit 共 1610 项通过、0 失败，M1 10/10、M2 6/6。
- D1.1：连续两次 `npm run build:data` 的 11 个当前包 sha256 相同，见 `docs/probes/D1.1_确定性.md`；合计 1.60MB，最大单包 SRD 约 487KB。
- D1.1：`docs/probes/D1.1_人物数据_报告.md`（覆盖率、来源构成、未映射）；`docs/probes/D1.1_抽检.md`（626 行，页码与字段，结果栏待驾驶员填写）。
- D1.1：`npm run build` 通过，`dist/index.js` gzip 约 291KB。
- M3：`npm run check` 235 项（23 个文件）；`npm run test:data` 29 项；`npm run e2e` 1602 项、0 失败；变异检查、键盘走查、截图见 `docs/probes/M3_*`。
- M2/M3 旧证据保留在上面的历史段落；数据仓库 `6290d8b` 仅本地提交。

## 下一步
1. 等待规划 agent 复审 `docs/probes/D1.2a_检查点1.md` 的 R0 部分；通过后才开始 R1。
2. 规划 agent 已复核 D1.1 并完成全库体检（`docs/probes/D1.1_数据体检.md`）。待驾驶员审批的草案：D1.2 全量结构化导入（`docs/handoff/D1.2_全量结构化导入_交接.md`）、L1B 全库搜索与资料阅读（`docs/units/L1B_全库搜索与资料阅读.md`）、功能全景与版本分层（`docs/规划/功能全景与版本分层.md`）。
3. 驾驶员已批准 D1.2（分两次交付）。次序：执行 agent 做 D1.2a（`docs/handoff/D1.2a_执行交接.md`）→ 规划 agent 审批与修补 → 执行 agent 做 D1.2b → 规划 agent 审批与修补 → 驾驶员授权后统一推送 → 驾驶员在酒馆真机查看与验收 → 审批 U6.1 蓝图。
4. M4 次序：D1.2a → D1.2b → 推送与真机验收 → U6.1 → R1.1 → L1B → U6.2（加入人物对话框复用 L1B 选择器）。
5. M3 的驾驶员真机验收仍待进行。

## 阻塞
- 无代码阻塞；等待 R7 通过。R7 第二轮补丁的 SRD 总条目差包含 1 个家族迁移，已在进度报告拆分说明。

## 未验证
- D1.1 只在模拟宿主核对；真机 TauriTavern 的 M2 七步（含内置 SRD 读取、IndexedDB、下载校验）未实测。
- `docs/probes/D1.1_抽检.md` 的 626 行人工结果尚未填写；不一致项为 0 条（因为尚未人工核对），不能当作已通过。
- Foundry 6.1.x 的 2014 覆盖稀疏；未映射/用 note 表示的效果见 D1.1 报告。
- 规划 agent 尚未复核。
- 新骰盘（骰式构建器、SVG 骰面与转动动画）与资料库中文显示只在模拟宿主页验证过；真机上的触屏点按、骰面动画流畅度、窄屏骰盘高度（占满可用高度、内部滚动）未实测。
- 资料库英文代码改中文：huijiwiki 在本机无法访问（HTTP 403），译名按数据集自己的中文用法；「弹药（火器）」「重新装填」「任选（见背景说明）」是我按武器规则的判断，需驾驶员核对。
- M3 全部界面只在模拟宿主页（Chrome 与 WebKit 内核）验证过，没有真机：尤其是**文件下载**（导出存档 / 扩展包用的是网页的 `a[download]`，TauriTavern 里是否会保存文件未知）、剪贴板、`inert`、`color-mix`、`:has()` 在真机内核上的表现。
- macOS 的 WebKit 默认不让 Tab 停在按钮上（系统设置决定）；弹窗内的 Tab 已由我们接管，主窗口按系统行为（见键盘走查）。
- 手机触屏上的拖动、缩放与软键盘遮挡没有实测。
- 十个书籍包全部装入后的搜索与存储表现：条目列表用虚拟滚动，e2e 里 11 个包的列表可正常使用，真机性能未测。
- 更早的未验证项（M2）：真机上内置包升级路径、1.0.1 包的真机下载。

## 待议
- D1.1 的 `src/ui/library/facts.ts` 为结构化技能/语言/起装做了只读展示适配（不改布局），因为新的 `languages/proficiencies/startingEquipment` 不再是纯字符串数组；若严格执行“只改 zh.ts”，请驾驶员决定是否回退。
- D1.1 的 `credit.structured` 目前主标注为 5etools；使用 Foundry 覆盖的条目标为 5etools-foundry。5e-bits/Open5e 仅作校验，不导入。
- D1.1 抽检表是 626 行（按 §8 最小覆盖生成），不是 50 行；结果栏留空，等待驾驶员填写。
- `tools/data/published.json` 仍是旧的 1.0.x 发布记录；本次只生成 1.1.0 候选，未运行 `publish:data`、未打标签。
- 新增开发依赖 `tsx`（MIT）：本机 Node 22 可直接运行 `.ts`，但 `src/` 的导入不带扩展名，直接用 Node 跑构建脚本会失败；`tsx` 只用于 `tools/data/` 与 `npm run e2e`，不进入扩展产物。已记入 `THIRD_PARTY_NOTICES.md`。
- 构建期 `tools/data/published.json` 保持空对象；真正发布时运行 `npm run publish:data` 记录版本与哈希。当前没有推送、打标签或刷新 CDN。
- 子职业按「名称 + 来源」去重（109 条），因此与 D1 §2 表中的 218 条原始行数不同；2024 重印（classSource XPHB）与跨书重印特性未重复计入。
- 5 个无名称的抽象亚种族跳过并写入构建报告；1 个职业特性（Ki）缺中文名，用英文名兜底并标记 `credit.by: dnd-data`，报告中有记录。
- 官方书籍包没有冒险内容项与图片，M2 探针第 4 步对这两类显示跳过；由 `fixture-adventure` 与测试图片覆盖。

- 第二轮核对（2026-10-28，由复核 agent 按官方书逐条与批量比对）发现并修复：物品正文模板 `{#itemEntry}`（163 条抗性护甲、药水、戒指等没有正文）、种族「飞行速度同步行走」、变体价格（具装 ×4、镀银武器 +100 gp）、`#c` 残留、颜色标记；受影响的 7 个包升到 1.0.1（SRD、PHB、DMG、XGE、TCE、MPMM、BMT）。比对记录见 `docs/probes/D1_书籍比对.md`，抽检 50 条结果见 `docs/probes/D1_抽检.md`。
- 仍未处理：镀银弹药价格（书中 100 gp/10 发，未加）；MPMM 种族属性自选只记「三项各 +1」，缺「+2/+1」；`hp.special` 类怪物（活化物件）的 `average` 为 0；6 个怪物的 HP 骰式在原始数据中与均值不一致；魔法圈学派在本地中译 PDF 中印作咒法，包内为防护（与官方一致）。
- 数据范围外的缺口（原始数据没有或 D1 未定义，未手写补齐）：PHB 的 d100 饰品表不在 5etools-cn 数据中；人类（PHB）原始数据没有属性加值字段；巢穴行动与区域效果（`legendaryGroup`）、物品的 `packContents`/`attachedSpells`、怪物的 `environment` 未导入，内容仍在正文中。
- SRD 包内法术指向的子职业只含 SRD 子职业；其他子职业对该法术的关联在各自书籍包里，不跨包引用。
- 重名 id 加 `-2`（特性、随机表共约 200 条，见构建报告）：顺序随 5etools-cn 数据排列，数据更新后可能变动；发布前需决定是否改用稳定后缀。
- 人物线的数据前置 D1.1（交接 `docs/handoff/D1.1_人物规则数据_交接.md`）：把人物相关规则数据全部结构化（法术位表、资源值、种族背景专长特性的效果、状态效果、规则选项 `engine` 与 `group` 等），优先导入现成数据并交叉校验，包升到 1.1.0（`dataVersion` 2）。流程：执行 agent 完成 → 规划 agent 审批修补 → 驾驶员验收 → 再审批 U6.1 蓝图。
- M3 待议：
  - SRD 与 DMG 等包的「规则选项」说明文字在数据里是占位的 `[]`（M2 数据缺口）：界面把它当作没有说明，只显示一句摘要。需要决定是否补数据。
  - 条目编辑器（U11）不在 M3：「我的」里的「编辑」「＋ 新建条目」按钮灰显并说明；数据层 `MyLibrary.saveEntry` 已就绪。
  - 冒险导入、更新、移除、导出为模组包、存到我的库（M9）：开局向导的冒险一步由 `src/core/features.ts` 的 `adventureImport` 开关控制，现为 false（自动跳过）；扩展列表里冒险包的「用它开新存档」「加入当前存档」灰显。
  - 迷你模式已按决定移到 M5（人物线）；首页概览格目前只有「库」（其余页面未做，按规格不显示）。
  - 骰盘已改为「骰式构建器」（驾驶员真机反馈后按第二次预览通过的方案重做，见 `docs/decisions.md`、基本蓝图 §2.1.1）：待真机再验收。
  - 浅 / 深色目前跟随系统，没有手动切换（规格未要求）。
  - 弹窗内的「选择卡」（版本切换、分支存档）用弹层实现，在弹窗之上；开发规范 §5.3「不得叠加弹窗」只针对模态弹窗，这里按弹层理解，请驾驶员确认。

## 需要驾驶员授权
- 创建/推送 GitHub 数据仓库、推送扩展仓库、打 1.1.0 标签与刷新 jsDelivr CDN；本次均未执行。
- 在 TauriTavern 安装并运行 M2 七步、填写 626 行抽检表。
- 是否保留 `facts.ts` 的只读兼容改动（见「待议」）。

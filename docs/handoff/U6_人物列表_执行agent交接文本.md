# 人物 UNIT1「人物管理页面」· 执行 agent 交接文本

> 驾驶员：聊天里给的那段粘贴文字与本文件一致；以本文件为准。
> 做法在 `docs/handoff/U6_人物列表_执行文档.md`（下称「执行文档」），界面与数据以 `docs/units/U6_人物管理.md` v3.1（下称「规格」）为准。

## 0. 你是谁、这次做什么

- 你是人物 UNIT1 的执行 agent。项目是 SillyTavern 扩展「TRPG 跑团助手」（Vue 3 + TypeScript）。
- 先做任务一的两处收尾（批 0），再**只做人物管理页面和它的子页面**：数据层、列表、模板弹窗（加入模式）、存入我的库、回收站 / 标签管理 / 分类管理、一个临时人物卡页（名字 + 保存）。
- 不做：正式人物卡、套用模板、库里用人物卡打开、五个分页、给 AI、6 步建卡、收藏。
- 一次做完，批与批之间不停、不等人。

## 1. 开工

```bash
cd /Users/xxx/tta-t1 && git fetch origin && git status          # 任务一的副本，先做批 0 收尾
cd /Users/xxx/tavern-trpg-data && git fetch origin && git checkout t1
cd /Users/xxx/tta-t1 && git merge origin/claude/peaceful-volta-af2qp2   # 只有 NEXT.md 冲突就用规划者版本
```

批 0 收尾做完并推两个仓库的 `t1` 后：

```bash
cd /Users/xxx/tavern-trpg-assistant && git worktree add ../tta-u6 origin/t1
ln -s "$PWD/reference" ../tta-u6/reference
cd ../tta-u6 && git checkout -b u6 && git merge origin/claude/peaceful-volta-af2qp2
npm ci && npm run check
```

## 2. 红线

- 只改执行文档第 4 节允许的文件；`src/rules/**`、`src/core/library/**`、`src/ui/library/**`、`VirtualList.vue` 一律只读。
- 状态只经 store；纯函数带单测；结构变更必带迁移（只补三个键）；不写空 catch；单文件 ≤ 400 行。
- 规格 §9 的尺寸、颜色、字号、动效照抄，不自己补；用现有 kit 组件，不加新颜色、新动效、新组件。
- 已有测试的断言不改。
- 只有执行文档第 5 节四种情况才停整站；其余当场修完写进报告，不另开任务。
- 不推 main、不打标签、不刷新 CDN、不安装、不删除用户数据。允许：推两个仓库的 `t1`（批 0）与扩展 `u6`（驾驶员粘贴即授权）。

## 3. 最容易做错的地方

1. 批 0：来源里对不上物品编号的装备**按原文名写进背包，不能丢**；纯文字护甲按「、」拆开逐段匹配。
2. 人物的数据就是 `block`（怪物结构）；从库加怪物 / 具名 NPC 原样复制，不写转换；具名 NPC 复制它引用的怪物属性块。
3. 「＋ 新建」「编辑后加入」「点行」都进**临时人物卡页**（名字 + 保存）；不保存就返回 = 不存在，不弹框；只通过 `openPersonCard(...)` 打开，UNIT2 会整页替换。
4. 模板弹窗只管怪物与具名 NPC，筛选：范围、来源书（官方书和我的包一起）、挑战等级、生物类型、体型；「加入列表」后弹窗不关。
5. 存入我的库：默认「未分组」；调 `mine.store`，同名先返回冲突，再按「更新它 / 另存一份」重调；`libraryRef` 指向那条时默认更新。
6. 起名：第一个不带号，之后「地精 2」「地精 3」；回收站里的也算；号不回收。生命取卡上固定值，没有就空着。
7. 只有删除带撤销（= 从回收站恢复）；不可撤销的在弹窗内原地确认，不叠弹窗。
8. 没有收藏；行上只有「...」；置顶在「...」里；「全部」平铺；行内标签全显示、换行；行内不加术语下划线。
9. 多选栏替换工具行（在上面）；四个操作：移到分类、加标签、去标签、删除。
10. 弹层 e2e 照开发规范 §5.3 写（打开 → 点选项 → 值变化 → 关闭且 `body.style.pointerEvents` 恢复）。

## 4. 回复格式

```
【UNIT1 完成 / 停在批 N】
一句话结果：…
提交：扩展 t1 <哈希>、u6 <哈希>；数据 t1 <哈希>（已推，未推 main）
批 0：对不上的装备写进背包 N 项；新补纯文字护甲 N 处；build:data 两次哈希相同；g2-oldext 通过
验证：check X/Y；e2e people X/0（Chrome、WebKit）、library X/0、upgrade X/0、存档 X/0
截图：<目录>（N 张，已逐张看过）
与规格不同之处：…
未做 / 未验证：真机未看；…
```

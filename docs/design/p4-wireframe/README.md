# P4 灰度线框（Gate 3）

31 屏 × 三种宽度（1440 / 900 / 390；外壳和抽屉另加 600 宽的"中"布局）。只表达结构、层级、密度、控件位置；颜色、字体、图标留给 Gate 4。

```
index.html        总览（缩略图 → 点进大图和标注）
out/<屏>.html     每屏的三宽度并排 + 标注表（元素 / 行为 / 后端状态）
shots/<屏>.png    同上的截图（2900 宽，可放大看）
wireframe.css     灰度样式；类名沿用插件现有界面
lib/ screens/     生成脚本与每屏的定义
build.mjs         node docs/design/p4-wireframe/build.mjs [--shots]   重新生成（--shots 同时截图，需要本机 Chrome）
```

## 真实尺寸规则（照插件现有代码画的）
- 悬浮窗默认 960×640（视口 − 32）；视口 ≤480 铺满。窗口内宽 ≥720 = 宽、481–719 = 中、≤480 = 窄（`MainWindow.vue` 的 `layout`）。
- 宽：侧栏带文字；中：侧栏只有图标；窄：侧栏变底部标签栏，页头芯片收进 ⋯ 菜单，抽屉变底部抽屉，向导铺满。

## 怎么复制进插件
线框的 DOM 就是插件现有结构：`section.trpg-window[data-layout] > .trpg-shell > nav.trpg-side + .trpg-main(header.trpg-head + .trpg-body > main.trpg-content + .trpg-dice-btn)`，弹层是 `.trpg-modal[data-variant=dialog|drawer|confirm] > .trpg-modal__card`，向导 `.trpg-wizard / .trpg-steps / .trpg-wizard__foot`，抽屉 `.trpg-drawer / .trpg-saves`。
复制时：把 `out/<屏>.html` 里 `.trpg-window` 里面的片段拆成 Vue 组件模板，数据换成 store / 服务返回值；Gate 4 之后用设计系统的语义色变量替换 `wireframe.css` 里的 `--g0…--g7` 灰。

**线框里新增的类（现有界面没有）**：`trpg-ring`（进度环，含 `data-state`）、`trpg-ring__badge`、`trpg-libmark` / `trpg-count`（库标签上的小环 + 数字，`data-hover` 为悬停态）、`trpg-pop`（库标签悬停小窗，紧凑、带小尖角）、`trpg-toasts`（宿主层提示条容器，在酒馆顶部栏下方）/ `trpg-toast`、`trpg-linkcard`（首页"读取已有存档"次要卡片行）、`trpg-hint`（浅灰说明文字）、`trpg-loading` / `trpg-spinner`（读取中圆圈 + 文字）、`trpg-summary`（向导④摘要块）、`trpg-shelf`（书架分组 / 行）、`trpg-camp`（存档抽屉里的战役卡片，行 `trpg-saves li`，当前行 `data-current` 圆角高亮外框）、`trpg-checks`（读取确认里的块，`data-kind="block"` 为不可读取）、`trpg-fold`（折叠区）、`trpg-menu`（设置栏目行）/ `trpg-back`、`trpg-settings`、`trpg-stepper`、`trpg-sheet-grip`。以 `wf-` 开头的类（`wf-host`、`wf-host__bar` 酒馆顶栏占位、`wf-pin` 标注圆点等）只在线框里，不要带进插件。

## 画线框时发现、已改进的问题
1. 窄屏首页空态页头必须有 ⋯ 菜单（现有代码一直有），否则没有关闭入口。
2. 向导②宽屏下"资料状态 + 环"会被书架挤出弹窗：改成"范围 → 资料状态 → 书架"，书架自己滚动。
3. 存档抽屉六个区在 640 高窗口里放不下：压紧行高，列表区可滚动。
4. 读取确认窄屏按钮纵向排列、[读取]在上。
5. 没有"空抽屉"状态：没有存档时首页没有"读取已有存档"入口，也没有页头芯片，进不到抽屉。

## 第二轮意见（2026-11-09）改动
首页读取存档改次要卡片行；去掉骰子箭头；提示条移到酒馆顶部栏下方（宿主层）；向导不再有大圆圈和下载进度，改成"资料"标题下的浅灰说明；书目 / 冒险取不到统一一句话；只剩两个阻断点（核心 SRD 缺失、战役名为空）；取消"③冒险被跳过"；摘要块统一格式；读取中改圆圈 + 文字；[新建分支存档]；存档抽屉改战役卡片；库标签小环旁加数字，悬停出紧凑小窗（只列下载中 / 失败）；设置改三个栏目、备份三项收进"备份与撤销"。删除的屏：`wizard-2-incomplete`、`wizard-4-skipped`、`library-pop-idle`。

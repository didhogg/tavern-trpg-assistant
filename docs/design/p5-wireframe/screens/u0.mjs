// U0 图标与基础控件（Icons & Components）：库页（含 U9 各类型）用到的图标和通用控件，整理成一张清单。DOM / 类名全部沿用插件真实样式（src/ui/styles、src/ui/kit）。
import { ICONS, icon } from '../lib/icons.mjs'
import { badge, btn, check, empty, errorLine, gray, iconBtn, infoLine, input, link, pills, seg, sw, term, toast, embed, field } from '../lib/ui.mjs'

const G = 'U0 图标与基础控件'

// 图标 → 分组与用途（只写库页真正用到的；没写的归"沿用 P4，库页没用到"）
const USE = {
  导航与结构: { house: '首页（侧栏）', books: '库（侧栏 / 书架）', gear: '设置（侧栏）', 'caret-left': '‹ 返回上一页', 'caret-right': '进入 / 折叠的分组', 'caret-down': '展开 / 下拉', x: '✕ 整个退出', 'dots-three': '⋯ 更多（行尾 / 弹窗头）', 'list-bullets': '目录（书籍阅读器）' },
  操作: { plus: '新建 / 增加', 'pencil-simple': '编辑（P5.5 才开放，现在灰）', trash: '删除', copy: '复制（结果 / 日志）', 'download-simple': '下载 / 导出', 'upload-simple': '导入', 'arrow-clockwise': '刷新 / 重试 / 重新读取', 'arrow-counter-clockwise': '复原 / 覆盖', 'floppy-disk': '保存', 'magnifying-glass': '搜索', check: '勾选 / 完成', lock: '锁定（核心规则、必须一起卸载）' },
  '状态与提示': { info: '一般提示', warning: '警告 / 错误', 'check-circle': '成功横幅', 'circle-notch': '加载中（旋转）' },
  排序: { 'sort-ascending': '升序 / 可排序的淡箭头', 'sort-descending': '降序' },
  内容: { 'dice-five': '骰子标签 / 骰盘', 'book-open': '阅读（书 / 冒险）', image: '图片（点开才取）', table: '嵌入的表格（点开显示）' },
}
const NEW = new Set(['image', 'list-bullets', 'table'])
const used = new Set(Object.values(USE).flatMap((g) => Object.keys(g)))
const rest = Object.keys(ICONS).filter((k) => !used.has(k))
const cell = (name, note) => `<div>${icon(name, 22)}<span><b>${name}</b>${NEW.has(name) ? ' <em>新增</em>' : ''}<small>${note}</small></span></div>`

const iconsBoard = () => `<div class="ds-root lib-cmpgrid">
<section><h3>图标库（Phosphor Regular，MIT；24 px 栅格，描边 1.5 / 填充规则统一，用 currentColor 适配主题）</h3>
<p class="lib-muted" style="margin:0 0 var(--sp-3)">规则：只用这一套；图标不单独承担含义，重要动作旁边必须有文字或悬停说明；点击区 ≥44×44（触屏）/ ≥32（桌面），图标本身可以小；装饰性图标 aria-hidden，图标按钮必须有 aria-label。<b>新增 3 个</b>（image、list-bullets、table，取自官方包 @phosphor-icons/core@2.1.1，进插件时补进 <code>src/ui/kit/icons.ts</code>）。</p>
${Object.entries(USE).map(([g, items]) => `<div class="lib-sec">${g}</div><div class="lib-ic">${Object.entries(items).map(([n, t]) => cell(n, t)).join('')}</div>`).join('')}
<div class="lib-sec">沿用 P4，库页没用到</div><div class="lib-ic">${rest.map((n) => cell(n, '—')).join('')}</div>
<p class="cap">来源：src/ui/kit/icons.ts（${Object.keys(ICONS).length - NEW.size} 个）+ P4 的 git-branch + 本版新增 ${NEW.size} 个。</p></section></div>`

const compBoard = () => `<div class="ds-root lib-cmpgrid">
<section><h3>按钮 Buttons</h3><div class="row">${btn('主按钮', { primary: true })}${btn('次按钮')}${btn('危险（双线框）', { danger: true })}${btn('安静', { quiet: true })}${btn('带图标', { ic: 'download-simple' })}${btn('小按钮', { small: true })}${btn('主按钮 · 禁用', { primary: true, disabled: true })}${btn('新建条目（P5.5，灰）', { primary: true, ic: 'plus', disabled: true })}${iconBtn('dots-three', '更多')}${iconBtn('x', '关闭')}${iconBtn('pencil-simple', '编辑（P5.5）', 0, { disabled: true })}</div>
<p class="cap">一个页面只有一个主按钮（主色）；危险动作用双线框并放次要侧；触屏上整按钮 ≥44 高，小按钮只在桌面行内使用；禁用就是灰，悬停说明原因。</p></section>
<section><h3>输入框与选择 Inputs</h3><div class="row" style="align-items:flex-start">
<div style="width:240px">${input('', { placeholder: '文字输入', ic: undefined })}</div><div style="width:240px">${input('火球', { ic: 'magnifying-glass' })}</div><div style="width:240px">${input('', { placeholder: '出错的输入', invalid: true })}</div><div style="width:200px"><div class="trpg-input" style="justify-content:space-between">作者分组${icon('caret-down', 14)}</div></div><span class="lib-numbox"><span>x =</span><b>3</b></span></div>
<div class="row" style="margin-top:var(--sp-3)">${check('勾选', true)}${check('未勾选', false)}${check('必须一起（锁定）', true)}${sw(true, '开')}${sw(false, '关')}${seg(['En', { label: '中文', on: true }])}${seg([{ label: '全部', on: true }, '官方', '自制'])}</div>
<div class="row" style="margin-top:var(--sp-3)">${pills([['全部', 2057, true], ['法术', 361], ['职业', 12], ['书', 1]])}${badge('2014')}${badge('SRD')}${badge('已修改', 'warn')}${badge('已装', 'success')}${badge('变体 3', 'primary')}${badge('同名', 'primary')}${gray('玩家手册（2014）')}</div>
<p class="cap">开关 ━● 为开；类别药丸带条数；来源一律浅灰小字；错误在输入框下方写原因，不只靠颜色（⚠ + 文字）。</p></section>
<section><h3>卡片与行 Cards</h3><div class="lib-sw">
<div><b>书架行</b><div class="trpg-shelf__row" style="width:100%"><span class="lib-name" style="font-family:var(--font-serif);font-weight:600">玩家手册</span>${badge('2014')}${sw(true)}</div></div>
<div><b>列表行</b><ul class="trpg-list" style="width:100%"><li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title lib-title--serif">火球术</div><div class="trpg-row__meta">3 环 · 塑能</div></div></li></ul></div>
<div><b>变体块</b><div class="lib-var" style="width:100%"><div class="lib-var__row">${badge('变体', 'primary')}板甲 +1 ${gray('DMG')}</div></div></div>
<div><b>清单块（读档 / 卸载）</b><div class="lib-chk" style="width:100%">${check('某自制包', true)}${gray('自制')}</div></div>
<div><b>文件块（导入预览）</b><div class="lib-file" style="width:100%"><div class="lib-file__top"><b>文件一.json</b>${badge('可以导入', 'success')}</div></div></div>
<div><b>对比卡（覆盖预览）</b><div class="lib-cmp" style="width:100%"><div><b>现在</b>范围 150 尺</div><div data-new="true"><b>覆盖后</b>范围 100 尺</div></div></div>
<div><b>折叠块</b><details class="lib-fold" style="width:100%"><summary>书目范围<small>6 / 6</small></summary></details></div>
<div><b>数值块行（U9b）</b><div class="lib-stat" style="width:100%"><div><span>防御</span>AC 15</div><div><span>生命</span>7（2d6）</div></div></div>
<div><b>空态</b>${empty('这里放你自己的内容。')}</div></div></section>
<section><h3>横幅与弹层 Banners · Overlays</h3><div style="display:grid;gap:var(--sp-2)">${infoLine('一般提示（可带一个出口按钮）', btn('按钮', { small: true }), 'lib-banner--info')}${errorLine('警告样式：装了一半 / 下载失败 / 空间不足 / 某一边目录取不到，统一这一种', btn('重试', { small: true }))}<div style="position:static;display:flex;gap:var(--sp-3);flex-wrap:wrap">${toast('完成：刚刚下载完成了 3 个包，同时下载了 2 个额外依赖包', { kind: 'success' })}${toast('出错：读取失败，点击关闭', { kind: 'error' })}</div></div>
<pre style="font:12px/1.5 ui-monospace,Menlo,monospace;margin:var(--sp-3) 0 0;white-space:pre-wrap">弹层三种（同一时间最多一个，不叠加；里面换页）
  dialog  宽屏：居中；窄屏：整屏               例：导入预览
  sheet   宽屏：居中、较大；窄屏：底部抽屉       例：包 / 书 / 全库搜索弹窗、条目详情
  drawer  宽屏：右侧滑出；窄屏：底部抽屉         例：存档抽屉、读档检查
  confirm 宽屏：居中小框；窄屏：底部弹出         例：卸载 / 删除 / 存入我的库</pre></section>
<section><h3>术语、链接与骰子标签</h3><div class="row"><span style="font-size:var(--fs-md)">衬线 + 虚下划线：${term('法师')}</span>${link('普通链接')}${embed('「点开显示表格」')}<span class="lib-dice">${icon('dice-five', 12)}8d6</span><span class="lib-dice lib-dice--plain">读不懂的骰式</span></div>
<p class="cap">术语只点击不悬停；骰子标签点了进骰盘（P4 骰盘只接入口）；骰式读不懂就当普通文字显示（虚线框，不能点）。</p></section></div>`

export const screens = [
  {
    id: 'u0-1-icons', group: G, title: 'U0 图标库（Icons）', flow: 'Design System · 图标',
    goal: '整理库页全部图标，统一风格与用途，避免每个界面各用各的', primary: '—', patterns: 'Icon set（一套，24 px 栅格）', laws: 'Jakob（常见图标含义不变）· Von Restorff（只在主操作上用强调色）· Postel（图标永远配文字或说明）',
    diff: '参考页，不分宽窄。',
    notes: [
      [1, '一套图标', `只用 Phosphor Regular；库页用到 ${used.size} 个，其中 3 个是本版新增`, 'src/ui/kit/icons.ts'],
      [2, '新增 3 个', 'image（图片点开才取）、list-bullets（书籍目录）、table（嵌入表格）；取自官方包 @phosphor-icons/core@2.1.1（MIT），放在 p5-wireframe/sources/，进插件时补进 icons.ts', '线框里已能显示；插件里还没加'],
      [3, '使用规则', '图标不单独承担含义；图标按钮要有 aria-label；装饰图标 aria-hidden；触屏点击区 ≥44；颜色只用 currentColor', '一致性 / 可访问性'],
    ],
    board: iconsBoard,
  },
  {
    id: 'u0-2-components', group: G, title: 'U0 基础控件（按钮 · 输入框 · 卡片 · 横幅 · 弹层）', flow: 'Design System · 组件',
    goal: '把库页反复用到的控件定一次，U1–U9 全部复用', primary: '—', patterns: 'Design System（沿用 P4 令牌与组件，只补库页新增的几种）', laws: 'Consistency（同一控件同一外观）· Hick · Fitts（触屏 ≥44）· Feedback（<400 ms 变化）',
    diff: '参考页，不分宽窄；触屏上按钮自动 ≥44 高。',
    notes: [
      [1, '沿用的（P4 已有）', '按钮（主 / 次 / 危险 / 安静 / 小）、输入框、勾选、开关、分段控件、药丸、标签、提示条、弹层三种，样式全部是插件真实样式（配色 A）', 'src/ui/styles/kit.css'],
      [2, '库页新增的', '表格列表（首列固定、淡箭头可排序）、清单块、变体块、对比卡、折叠块、数值块行、骰子标签、嵌入链接（`lib-` 开头，见 p5.css）', '进插件放 pages.css 或新建 library.css'],
      [3, '灰掉的控件', 'P5.5 才做的（✎ 编辑、【新建条目】）：画成灰色，悬停说明"条目编辑稍后开放"，点不了', '范围边界'],
      [4, '错误与完成', '统一顶部横幅（P4 提示条）；下载类的"装了一半 / 失败 / 空间不足"统一一种警告样式', 'R73、R75、R84'],
    ],
    board: compBoard,
  },
]

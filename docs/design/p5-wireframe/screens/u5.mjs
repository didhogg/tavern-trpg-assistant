// U5 设置 → 库：偏好 · 全局编辑 / 覆盖管理 · 日志（范围页、版本选择页、房规页已删）。流程见 P5-0 §13.6.5、§13.6.6。2026-11-10 按 R23–R91 重画。
import { badge, btn, check, empty, icon, infoLine, loading, pin, seg, stateCard, sw } from '../lib/ui.mjs'
import { toast } from '../lib/ui.mjs'

const G = 'U5 设置 → 库（偏好 · 全局编辑 / 覆盖 · 日志）'
const P = (n) => (n ? pin(n) : '')
const TABS = ['偏好', '全局编辑 / 覆盖', '日志']
const ph = (t) => `<span class="lib-faint">${t}</span>`

const settingsLib = (tab, body, { n } = {}) =>
  `<div style="display:grid;align-content:start"><button class="trpg-back" type="button">${icon('caret-left', 16)}设置</button><h2 class="trpg-pagehead">库</h2>
<div class="lib-tabs" role="tablist">${P(n)}${TABS.map((t) => `<button type="button" role="tab" aria-current="${t === tab}">${t}</button>`).join('')}</div>${body}</div>`
const settingsPage = (inner, extra = {}) => ({ page: 'settings', flush: true, content: `<div class="lib-scroll" style="padding:0">${inner}</div>`, ...extra })
const sel = (text, w = 180) => `<div class="trpg-input" style="width:${w}px;justify-content:space-between">${text}${icon('caret-down', 14)}</div>`
const srow = (title, hint, control, n) => `<div class="trpg-settings__row"><b>${P(n)}${title}</b>${control}<span class="trpg-field__hint">${hint}</span></div>`
const crow = (title, meta, on, n) => `<div class="lib-chk">${P(n)}<span class="trpg-check" data-on="${on}"><span class="trpg-check__box">${on ? icon('check', 12) : ''}</span><span class="lib-grow"><b class="lib-title--serif">${title}</b><small class="lib-muted">${meta}</small></span></span>${btn('复原', { small: true, ic: 'arrow-counter-clockwise' })}</div>`
const item = (l, src, title, n, open, extra = '', pn) => `<details class="lib-health"${open ? ' open' : ''}><summary><span class="lib-lvl" data-l="${l}">${l}</span><span class="lib-grow"><b>${P(pn)}${title}</b><br><small class="lib-muted">${src}${extra}</small></span><span class="lib-muted">${n} 条</span>${icon('caret-down', 14)}</summary>${open ? '<pre>（这一条的独立报错日志：原样明细，最多 N 条；全量请点上面的 [复制全部日志]）</pre>' : ''}</details>`

export const screens = [
  {
    id: 'u5-1-menu', group: G, title: '设置主页：多一个【库】栏目', flow: '13.6.5',
    goal: '把库的管理放在设置里，不占库页的位置', primary: '点【库】进入', patterns: 'Settings Editor（栏目平铺列表）', laws: 'Jakob（和原来的设置栏目一样）· Hick（四个栏目）',
    diff: '宽窄一样：平铺行，右侧 ▸。',
    notes: [
      [1, '【库】栏目', '一行说明：「偏好、全局编辑 / 覆盖、日志」；点后进入下一页。范围页已删；"版本选择"标签没有了；体检改名【日志】〔R43、R78、R80〕', '【定】驾驶员'],
      [2, '原有三项', '备份与撤销 / 诊断 / 关于 不动', 'P4 已有'],
    ],
    render: () => ({ page: 'settings', flush: true, content: `<div class="trpg-menu"><button class="trpg-menu__row" type="button"><b>备份与撤销</b><small>多久提醒导出一次备份、撤销记录最多保留多少条</small><span>${icon('caret-right', 16)}</span></button><button class="trpg-menu__row" type="button"><b>${P(1)}库</b><small>偏好、全局编辑 / 覆盖、日志</small><span>${icon('caret-right', 16)}</span></button><button class="trpg-menu__row" type="button"><b>诊断</b><small>自检与兼容性测试，遇到问题时用来收集信息</small><span>${icon('caret-right', 16)}</span></button><button class="trpg-menu__row" type="button"><b>关于</b><small>版本 · 开源许可与致谢</small><span>${icon('caret-right', 16)}</span></button></div>` }),
  },
  {
    id: 'u5-2-prefs', group: G, title: 'U5 偏好（含编辑 / 覆盖默认作用层级）', flow: '13.6.5 偏好',
    goal: '调整库的几个习惯', primary: '改一项就立即生效', patterns: 'Settings Editor · Switch', laws: 'Postel（改了立即存，存失败横幅并保持原值）· Hick（5 项）',
    diff: '窄：每行控件移到下一行左对齐。',
    notes: [
      [1, '分类方式', '作者分组 / 书或冒险（"按范围分类"随范围页一起去掉）；决定书架怎么分组〔R78〕', '【有】settings.library'],
      [2, '编辑 / 覆盖默认作用于', '本战役（默认；作用于本战役的所有存档和分支）/ 当前规则 / 全局；每条也可以逐条手动改〔R53、R54〕', '【有】settings.library.overrideLevel（B-22）'],
      [3, '语言', 'En / 中文：全局生效；条目另一语言没有时显示有的那种', '【有】D-5'],
      [4, '导入总是不预览', '开着：导入时跳过预览直接导入（见 u6-2）', '【有】settings.library'],
      [5, '删除总是不提示', '开着：删除 / 卸载时跳过影响页；默认关；风险写在说明里', '【有】settings.library'],
      [6, '读档不改任何设置', '全局设置、战役设置都不跟存档走：读取 / 回档不会把这里改回去〔R53、R91〕', '【有】kernelSave（B-20）'],
      [7, '存失败', '顶部横幅「没有保存成功」，控件回到原值', '全局规则'],
    ],
    render: () => settingsPage(settingsLib('偏好', `<div class="trpg-settings">${srow('分类方式', '书架里的书怎么分组', sel('作者分组'), 1)}${srow('编辑 / 覆盖默认作用于', '新做的编辑和覆盖默认生效在哪一层；每条也可以单独改', sel('本战役（所有存档和分支）', 240), 2)}${srow('语言', '全库显示中文还是英文；某一条没有另一种语言时显示有的那种', seg(['En', { label: '中文', on: true }]), 3)}${srow('导入时总是不预览', '开着：选好文件直接导入，不再显示检查结果', sw(false), 4)}${srow('删除时总是不提示', '开着：删除或卸载前不再显示"会影响谁"。建议保持关闭', sw(false), 5)}<p class="trpg-hint">${P(6)}读取存档不会改变这里的任何设置。</p></div>`)),
  },
  {
    id: 'u5-5-edits', group: G, title: 'U5 全局编辑 / 覆盖管理（所有规则、所有层级）', flow: '13.6.5',
    goal: '在设置里管理自己全局所有不同规则下的所有编辑 / 覆盖', primary: '勾选 → [复原]', patterns: 'List with bulk actions · Grouped list', laws: 'Hick（按生效处分组）· Postel（复原前看得到是哪些）',
    diff: '窄：行内次要信息换到第二行。',
    notes: [
      [1, '范围', '列出自己在**所有规则、所有层级**（本战役 / 规则 / 全局）下的编辑与覆盖，按生效处分组；每行：条目 · 来源（浅灰）· 生效处〔R57〕', '【有】manage.allChoices() · manage.houseRules() · scoped.activeOverrides()'],
      [2, '[复原] / 多选', '行尾 [复原]；可全选 / 部分勾选批量复原；点行 → 弹窗里的条目详情；官方源下载的覆盖后都可复原，纯自建的没有〔R48〕', '【有】scoped.choose(…, null) · custom.deleteHouseRule'],
      [3, '按包编号持久', '这些编辑 / 覆盖按数据包的编号保存；包被卸载后重装回来自动套用〔R55〕', '【有】versions.packStableId（B-21）'],
      [4, '无战役', '"本战役"一组置灰 + 一句说明；规则、全局两组照常', '〔待核 #6〕'],
      [5, '空态', '「还没有编辑或覆盖」', '全局规则'],
      [6, '房规不再单列', '以前的"房规 / 覆盖 / 版本选择"三个标签合并到这一页；我的库里也不放房规（R82）', 'R78 / R82'],
    ],
    render: () => settingsPage(settingsLib('全局编辑 / 覆盖', `<div class="lib-pad"><div style="display:flex;gap:8px;flex-wrap:wrap">${P(2)}${btn('全选', { small: true })}${btn('复原所选（2）', { primary: true, small: true })}</div>
<div><div class="lib-sec" style="padding-top:0">${P(1)}本战役「失落矿坑」（所有存档和分支）</div>${crow('火球术', '被「我的房规」覆盖 · 玩家手册', true)}${crow('板甲', '被编辑 · 玩家手册', true)}</div>
<div><div class="lib-sec">规则：5e 2014</div>${crow('魔法飞弹', '备选版本 · 玩家手册', false)}</div>
<div><div class="lib-sec">全局</div>${crow('战斗魔宠', '备选版本 · 怪物手册', false)}</div>
<p class="trpg-hint">${P(3)}这些记录跟着数据包的编号走，包被卸载后重新下载回来会自动套用。</p></div>`)),
  },
  {
    id: 'u5-6-log', group: G, title: 'U5 日志（原"体检"）：可展开每条 · 可复制全量日志', flow: '13.6.6',
    goal: '知道库有没有问题、问题在哪，大白话；需要时拿到全量日志', primary: '展开看明细 / 复制全部日志', patterns: 'Summary + Expandable List', laws: 'Hick（按级别排序，error 在最上）· Miller（同级别按来源分组）· Postel（只汇总不重算）',
    diff: '窄：行内 级别 / 说明 / 条数 竖排；按钮换行。',
    notes: [
      [1, '改名', '设置 → 库 里"体检"标签改名【日志】〔R80〕', '前端'],
      [2, '汇总条', 'ok n · info n · warn n · error n；生成时间；[重新读取] 再汇总一次（不重新下载或解析）', '【有】service.health()'],
      [3, '每条可展开', '点一行下拉看这一条**独立的报错日志**（原样明细，最多 N 条）；太多写「全量在日志里」；旧数据的报告标「仅供参考」〔R81〕', '【有】HealthItem.details / stale'],
      [4, '[复制全部日志] / [导出]', '全量后端日志：按时间滚动保留 500 条（任务失败、读档检查失败、小窗报错、自制解析 / 作者报错）；可复制 / 导出文本〔R81〕', '【有】library.logs.list / exportText / clear（B-26）'],
      [5, '日志筛选', '按级别 / 来源 / 类型筛', '【有】logs.list({level, source, kind})'],
      [6, '没有 warn 和 error', '「一切正常」', ''],
    ],
    render: () => settingsPage(settingsLib('日志', `<div class="lib-pad"><div class="lib-sum">${P(2)}${badge('ok 1', 'success')}${badge('info 1')}${badge('warn 2', 'warn')}${badge('error 1')}<span class="lib-end lib-muted" style="font-size:var(--fs-xs)">生成于 ${ph('hh:mm')}</span></div><div style="display:flex;gap:8px;flex-wrap:wrap">${P(4)}${btn('复制全部日志', { small: true, ic: 'copy' })}${btn('导出', { small: true, ic: 'download-simple' })}${btn('重新读取', { small: true, ic: 'arrow-clockwise' })}</div>
${item('error', '官方资料', '下载：有文件没下载下来', 3, true, '', 3)}${item('warn', '中英配对', '中英配对：有条目没配上', 14, false)}${item('warn', '某自制包', '自制：作者校验报了错', 2, false)}${item('info', '官方资料', '备选：有条目挂了备选', 5, false, ' · 旧数据的报告，仅供参考')}${item('ok', '官方资料', '解析：全部通过', 0, false)}</div>`)),
  },
  {
    id: 'u5-7-log-states', group: G, title: '日志的异常：读取中 / 失败 / 一切正常', flow: '13.6.6',
    goal: '日志本身出问题或没问题时，一句话', primary: '[重试]', patterns: 'Loading · 横幅 · Empty State', laws: 'Doherty · Postel',
    diff: '状态板。',
    notes: [
      [1, '读取中', '只汇总已存的报告，通常很快；> 300 ms 才显示圆圈', '全局规则'],
      [2, '读取失败', '顶部横幅 + [重试]；出口 ← 回设置主页〔R84〕', '【有】'],
      [3, '一切正常', '没有 warn 和 error →「一切正常」+ 汇总条', ''],
    ],
    board: () => `<div class="ds-root wf-states wf-states--3">${stateCard('读取中', loading('正在读取日志…'), 1)}${stateCard('读取失败（横幅）', `<div style="position:static">${toast('读取日志失败：数据库暂时打不开。', { kind: 'error' })}</div>${btn('重试', { small: true })}`, 2)}${stateCard('一切正常', `<div class="lib-sum">${badge('ok 4', 'success')}${badge('info 1')}</div>${infoLine('一切正常。', '', 'lib-banner--info')}`, 3)}</div>`,
  },
]

// U5 范围 · 版本 · 房规管理 + 体检：都在【设置】→【库】。流程见 P5-0 §13.6.5、§13.6.6。
import { badge, btn, check, empty, errorLine, icon, infoLine, loading, pin, seg, stateCard, sw } from '../lib/ui.mjs'

const G = 'U5 设置 → 库（范围 · 版本 · 房规 · 体检）'
const P = (n) => (n ? pin(n) : '')
const TABS = ['偏好', '范围', '版本选择', '房规', '覆盖', '体检']
const ph = (t) => `<span class="lib-faint">${t}</span>`

/** 设置 → 库 外框：‹ 设置 / 标题 / 子栏目 / 内容。设置页内容区无内边距（data-flush）。 */
const settingsLib = (tab, body, { n } = {}) =>
  `<div style="display:grid;align-content:start"><button class="trpg-back" type="button">${icon('caret-left', 16)}设置</button><h2 class="trpg-pagehead">库</h2>
<div class="lib-tabs" role="tablist">${P(n)}${TABS.map((t) => `<button type="button" role="tab" aria-current="${t === tab}">${t}</button>`).join('')}</div>${body}</div>`
const settingsPage = (inner, extra = {}) => ({ page: 'settings', flush: true, content: `<div class="lib-scroll" style="padding:0">${inner}</div>`, ...extra })
const sel = (text, w = 180) => `<div class="trpg-input" style="width:${w}px;justify-content:space-between">${text}${icon('caret-down', 14)}</div>`
const srow = (title, hint, control, n) => `<div class="trpg-settings__row"><b>${P(n)}${title}</b>${control}<span class="trpg-field__hint">${hint}</span></div>`
const noCamp = (n) => infoLine(`${P(n)}先创建战役，"本战役"相关项才能用；归类、房规、全局版本选择照常。`, btn('去首页', { small: true }), 'lib-banner--info')

const impactTable = `<div class="lib-compare"><div><small>改之前</small><b>5e 2014</b></div><span>${icon('caret-right', 18)}</span><div><small>改之后</small><b>5e 2014 + 5e 2024</b></div></div>`

export const screens = [
  {
    id: 'u5-1-menu', group: G, title: '设置主页：多一个【库】栏目', flow: '13.6.5 · 13.6.6',
    goal: '把库的管理放在设置里，不占库页的位置', primary: '点【库】进入', patterns: 'Settings Editor（栏目平铺列表）', laws: 'Jakob（和原来的设置栏目一样）· Hick（四个栏目）',
    diff: '宽窄一样：平铺行，右侧 ▸。',
    notes: [
      [1, '【库】栏目', '一行说明：「分类方式、范围、版本选择、房规、覆盖、体检」；点后进入下一页（见 u5-2…）', '【定】驾驶员：体检放设置 → 库'],
      [2, '原有三项', '备份与撤销 / 诊断 / 关于 不动；顺序：备份与撤销、库、诊断、关于', 'P4 已有'],
    ],
    render: () => ({ page: 'settings', flush: true, content: `<div class="trpg-menu"><button class="trpg-menu__row" type="button"><b>备份与撤销</b><small>多久提醒导出一次备份、撤销记录最多保留多少条</small><span>${icon('caret-right', 16)}</span></button><button class="trpg-menu__row" type="button"><b>${P(1)}库</b><small>分类方式、范围、版本选择、房规、覆盖、体检</small><span>${icon('caret-right', 16)}</span></button><button class="trpg-menu__row" type="button"><b>诊断</b><small>自检与兼容性测试，遇到问题时用来收集信息</small><span>${icon('caret-right', 16)}</span></button><button class="trpg-menu__row" type="button"><b>关于</b><small>版本 · 开源许可与致谢</small><span>${icon('caret-right', 16)}</span></button></div>` }),
  },
  {
    id: 'u5-2-prefs', group: G, title: 'U5 偏好', flow: '13.6.5 偏好',
    goal: '调整库的几个习惯', primary: '改一项就立即生效', patterns: 'Settings Editor · Switch', laws: 'Postel（改了立即存，存失败提示并保持原值）· Hick（只有 4 项）',
    diff: '窄：每行控件移到下一行左对齐。',
    notes: [
      [1, '分类方式', '作者分组 / 规则版本 / 范围 / 书或冒险——决定书架怎么分组', '【有】settings.library'],
      [2, '语言', 'En / 中文：全局生效；条目另一语言没有时显示有的那种', '【有】D-5'],
      [3, '导入总是不预览', '开着：导入文件时跳过预览直接导入（见 u6-2）', '【有】settings.library'],
      [4, '删除总是不提示', '开着：删除 / 卸载时跳过影响页。默认关；风险提示写在说明里', '【有】settings.library'],
      [5, '存失败', '提示条「没有保存成功」，控件回到原值', '全局规则'],
    ],
    render: () => settingsPage(settingsLib('偏好', `<div class="trpg-settings">${srow('分类方式', '书架里的书怎么分组', sel('作者分组'), 1)}${srow('语言', '全库显示中文还是英文；某一条没有另一种语言时显示有的那种', seg(['En', { label: '中文', on: true }]), 2)}${srow('导入时总是不预览', '开着：选好文件直接导入，不再显示检查结果', sw(false), 3)}${srow('删除时总是不提示', '开着：删除或卸载前不再显示"会影响谁"。建议保持关闭', sw(false), 4)}</div>`)),
  },
  {
    id: 'u5-3-scopes', group: G, title: 'U5 范围（本战役选范围 + 归类 + 预览）', flow: '13.6.5 范围',
    goal: '决定本战役用哪些规则版本的书，并给没归类的书归类', primary: '[应用]', patterns: 'Settings Editor · Preview before commit', laws: 'Postel（先预览再应用）· Hick（归类只有三种）· Zeigarnik（"未归类"有提示）',
    diff: '窄：预览两块上下排。',
    notes: [
      [1, '本战役选哪些范围', '勾选 5e 2014 / 5e 2024（内置范围，来自登记表；用户自建的也在这里）；写战役库设置，需要战役，无战役时置灰', '【有】scoped.scopes() · kernelSave.setLibrary'],
      [2, '归类：选一个来源', '书 / 自制包 → 显示当前归属：作者判断 / 你改过 / 未归类', '【有】manage.assignments · scoped.catalog'],
      [3, '改成', '某些范围 / 全局通用 / 清除（回到作者判断）', '【有】scoped.setAssignment'],
      [4, '预览', '改之前 → 改之后 的归属。"会影响哪些战役、哪些存档"〔待核 #1〕：现在只有归属前后，没有影响哪些战役 / 存档，所以这里不画战役列表', '【有】scoped.previewAssignment；影响预览待核'],
      [5, '[应用] / [取消]', '应用 → 提示条「已归类」，书架里相应的书出现 / 消失；取消 → 回到上一状态', '【有】'],
      [6, '自建范围入口', '〔待核 #2〕：manage.userScopes() 能读，创建入口没核；第一版先只显示已有的，不画"新建范围"按钮', '待核'],
    ],
    render: () => settingsPage(settingsLib('范围', `<div class="lib-pad">
<div><div class="trpg-group trpg-group--first">${P(1)}本战役用哪些范围</div><div style="display:flex;gap:var(--sp-4);flex-wrap:wrap">${check('5e 2014', true)}${check('5e 2024', false)}${ph('（自建范围显示在这里；创建入口待核）')}</div></div>
<div><div class="trpg-group">${P(2)}给一本书归类</div>${sel('玩家手册（2014）', 260)}<p class="trpg-hint" style="margin-top:var(--sp-2)">当前归属：作者判断 → 5e 2014</p></div>
<div><div class="trpg-group">${P(3)}改成</div><div style="display:flex;gap:var(--sp-4);flex-wrap:wrap">${check('5e 2014', true)}${check('5e 2024', true)}${check('全局通用', false)}${btn('清除，回到作者判断', { small: true })}</div></div>
<div><div class="trpg-group">${P(4)}预览</div>${impactTable}</div>
<div style="display:flex;gap:var(--sp-3);justify-content:flex-end">${btn('取消')}${btn(`${P(5)}应用`, { primary: true })}</div></div>`)),
  },
  {
    id: 'u5-4-choices', group: G, title: 'U5 版本选择（同编号备选）', flow: '13.6.5 版本选择',
    goal: '看自己改过哪些条目的版本，随时撤回', primary: '点一行看条目 / [解除]', patterns: 'List with row actions', laws: 'Hick（每行两个动作）· Postel（空态说明下一步）',
    diff: '窄：生效处并到第二行。',
    notes: [
      [1, '列表行', '目标条目 · 选中的版本 · 生效处（本战役 / 规则 / 全局）；点一行 → 条目页（u1-7）', '【有】manage.choices(level) / allChoices'],
      [2, '[解除]', '清掉这一层，回到更低一层或默认；[固定用原件]＝明确选回原件（两个说法分开）', '【有】scoped.choose / 清除'],
      [3, '空态', '「还没有改过任何条目的版本」', '全局规则'],
    ],
    render: () => settingsPage(settingsLib('版本选择', `<div class="lib-pad"><ul class="trpg-list">
<li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title lib-title--serif">${P(1)}火球术</div><div class="trpg-row__meta">我的房规 · 生效处：本战役</div></div><div class="trpg-row__end">${btn('解除', { small: true, n: 2 })}${btn('固定用原件', { small: true })}</div></li>
<li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title lib-title--serif">魔法飞弹</div><div class="trpg-row__meta">备选版本 · 生效处：全局</div></div><div class="trpg-row__end">${btn('解除', { small: true })}${btn('固定用原件', { small: true })}</div></li></ul></div>`)),
  },
  {
    id: 'u5-5-more', group: G, title: 'U5 房规 / 覆盖 / 空态 / 无战役 / 存失败', flow: '13.6.5 房规 · 覆盖',
    goal: '管理自己写的房规和当前生效的覆盖', primary: '点行看条目 / [删除]', patterns: 'List with row actions · Confirm Dialog', laws: 'Postel · Hick',
    diff: '状态板。',
    notes: [
      [1, '房规', '列表：房规名 · 它改的条目 · 生效处；点一行 → 房规条目页（可编辑，U7）；[删除] → 影响页（同 u2-3）', '【有】manage.houseRules() · custom.deleteHouseRule'],
      [2, '房规空态', '「还没有房规」+ [去我的库新建]（官方条目页 ✎ 也能建）', '全局规则'],
      [3, '覆盖', '当前生效的覆盖清单；点一行 → 条目页 → [解除覆盖]；空 →「没有覆盖」', '【有】scoped.activeOverrides()'],
      [4, '无战役', '"本战役"相关项置灰 + 一句说明；全局的照常', '〔待核 #6〕'],
      [5, '保存失败', '提示条「没有保存成功」+ 控件回到原值；不丢已有设置', '全局规则'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('房规', `<ul class="trpg-list"><li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title lib-title--serif">火球术（范围 100 尺）</div><div class="trpg-row__meta">改的条目：火球术 · 生效处：本战役</div></div><div class="trpg-row__end">${btn('删除', { small: true, danger: true })}</div></li></ul>`, 1)}
${stateCard('房规为空', empty('还没有房规。', btn('去我的库新建', { small: true })), 2)}
${stateCard('覆盖', `<ul class="trpg-list"><li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title lib-title--serif">火球术</div><div class="trpg-row__meta">被「我的房规」覆盖 · 本战役</div></div><div class="trpg-row__end">${btn('解除覆盖', { small: true })}</div></li></ul>`, 3)}
${stateCard('覆盖为空', empty('没有覆盖。'), 3)}
${stateCard('无战役', noCamp(4), 4)}
${stateCard('保存失败', errorLine('没有保存成功，已恢复原来的设置。', btn('重试', { small: true })), 5)}</div>`,
  },
  {
    id: 'u5-6-health', group: G, title: '体检（设置 → 库 → 体检）', flow: '13.6.6',
    goal: '知道库有没有问题、问题在哪，大白话', primary: '展开看明细', patterns: 'Summary + Expandable List', laws: 'Hick（按级别排序，error 在最上）· Miller（同级别按来源分组）· Postel（只汇总不重算，不吓人）',
    diff: '窄：行内 级别 / 说明 / 条数 竖排。',
    notes: [
      [1, '汇总条', 'ok n · info n · warn n · error n；生成时间；点 [重新读取] 再汇总一次（不会重新下载或解析）', '【有】service.health()'],
      [2, '列表', '按级别排（error → warn → info → ok），同级别按来源分组；行：级别 · 来源 · 大白话说明 · 条数 · [展开]', '【有】HealthItem {source, check, level, title, count, details, stale}'],
      [3, '展开明细', '原样明细（最多 N 条）；太多时写「全量在报告里」', '【有】details'],
      [4, '旧数据的报告', 'stale：标「旧数据的报告，仅供参考」', '【有】stale'],
      [5, '没有 warn 和 error', '「一切正常」', ''],
      [6, '常见检查项', '下载 / 解析 / 中英配对覆盖率 / 自制解析与作者报的错 / 备选 / 作者滤掉不显示的包 / 没装（check 字段值，界面显示大白话 title）', '【有】HealthItem.check'],
    ],
    render: () => {
      const item = (l, src, title, n, open, extra = '') => `<details class="lib-health"${open ? ' open' : ''}><summary><span class="lib-lvl" data-l="${l}">${l}</span><span class="lib-grow"><b>${title}</b><br><small class="lib-muted">${src}${extra}</small></span><span class="lib-muted">${n} 条</span>${icon('caret-down', 14)}</summary>${open ? '<pre>（原样明细，最多 N 条；全量在报告里）</pre>' : ''}</details>`
      return settingsPage(settingsLib('体检', `<div class="lib-pad"><div class="lib-sum">${P(1)}${badge('ok 1', 'success')}${badge('info 1')}${badge('warn 2', 'warn')}${badge('error 1')}<span class="lib-end lib-muted" style="font-size:var(--fs-xs)">生成于 ${ph('hh:mm')} ${btn('重新读取', { small: true, ic: 'arrow-clockwise' })}</span></div>
${item('error', '官方资料', `${P(2)}下载：有文件没下载下来`, 3, true)}${item('warn', '中英配对', '中英配对：有条目没配上', 14, false, '')}${item('warn', '某自制包', '自制：作者校验报了错', 2, false)}${item('info', '官方资料', '备选：有条目挂了备选', 5, false, ' · 旧数据的报告，仅供参考')}${item('ok', '官方资料', '解析：全部通过', 0, false)}</div>`))
    },
  },
  {
    id: 'u5-7-health-states', group: G, title: '体检的异常：读取中 / 失败 / 一切正常', flow: '13.6.6',
    goal: '体检本身出问题或没问题时，一句话', primary: '[重试]', patterns: 'Loading · Error Messages · Empty State', laws: 'Doherty · Postel',
    diff: '状态板。',
    notes: [
      [1, '读取中', '只汇总已存的报告，通常很快；> 300 ms 才显示圆圈', '全局规则'],
      [2, '读取失败', '一句原因 + [重试]；出口 ← 回设置主页', '【有】'],
      [3, '一切正常', '没有 warn 和 error →「一切正常」+ 汇总条', ''],
    ],
    board: () => `<div class="ds-root wf-states wf-states--3">${stateCard('读取中', loading('正在读取体检报告…'), 1)}${stateCard('读取失败', errorLine('读取体检报告失败：数据库暂时打不开。', btn('重试', { small: true })), 2)}${stateCard('一切正常', `<div class="lib-sum">${badge('ok 4', 'success')}${badge('info 1')}</div>${infoLine('一切正常。', '', 'lib-banner--info')}`, 3)}</div>`,
  },
]

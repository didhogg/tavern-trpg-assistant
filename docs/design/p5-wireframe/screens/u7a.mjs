// P5.5 阶段 C（一）：【我的库】= 一个个包。流程见 docs/handoff/P5.5_条目编辑与自制库_执行方案.md §15（问卷 §7）。
// 取代 u6-1 的三组（导入的包 / 存入的副本 / 自己写的条目）：B8 之后全都是「包」，都能改。
import { badge, btn, dropdown, empty, gray, icon, iconBtn, infoLine, input, libPage, libTop, mbody, packHead, pills, pin, sheet, shelfPage, sw, table, count } from '../lib/parts.mjs'
import { field, modal, modalHead, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'P5.5 我的库（包 · 新建包 · 管理 · 导入 · 复制成我的）'
const P = (n) => (n ? pin(n) : '')
const ph = (t) => `<span class="lib-faint">${t}</span>`
const page = (content, extra = {}) => ({ page: 'library', flush: true, content: libPage(content), ...extra })
const pending = (n) => `<span class="lib-pending">${P(n)}${icon('arrow-clockwise', 12)}整理中</span>`

const PACKS = [
  { name: '海盗战役', ver: '5e', cats: '法术 3 · 怪物 12 · 物品 4', on: true },
  { name: '玩家手册（副本 1）', ver: '5e', cats: '复制自 玩家手册 · 1890 条', on: true, pend: true },
  { name: '我的资料', ver: '未归类', cats: '法术 1', on: false },
]
const packRow = (p, L, { n = {}, menu = false } = {}) => `<li class="trpg-row"><div class="trpg-row__main lib-pack"><div class="trpg-row__title">${P(n.title)}${p.name} ${badge(p.ver)} ${p.pend ? pending(n.pend) : ''}</div><div class="lib-pack__cats">${p.cats}</div></div><div class="trpg-row__end">${P(n.sw)}${sw(p.on)}${L === 'narrow' ? '' : btn('导出', { small: true, ic: 'download-simple', n: n.exp })}<span style="position:relative">${iconBtn('dots-three', '更多', n.more)}${menu ? dropdown(L === 'narrow' ? [['导出'], ['管理'], ['再复制一份'], ['删除…', true]] : [['管理'], ['再复制一份'], ['删除…', true]], 168) : ''}</span></div></li>`
const drafts = (L, n) => `<div class="lib-drafts">${P(n)}${icon('pencil-simple', 16)}<span>${L === 'narrow' ? '2 份没保存的草稿' : '有 2 份没保存的草稿：火焰鹦鹉（法术）· 船长莫尔（怪物）'}</span><span class="lib-end">${btn('继续', { small: true })}</span></div>`
const bar = (L, n = {}) => `<div class="lib-filter" style="padding-top:0">${P(n.search)}${input('', { placeholder: L === 'narrow' ? '搜索' : '在我的库里搜索', ic: 'magnifying-glass' })}${btn(L === 'narrow' ? '导入' : '导入文件', { ic: 'upload-simple', n: n.imp })}${btn('新建包', { primary: true, ic: 'plus', n: n.add })}</div>`
const myLib = (L, n = {}, { menu = false, packs = PACKS } = {}) => `${libTop('mine')}<div class="lib-scroll"><div class="lib-stack">${bar(L, n)}${drafts(L, n.drafts)}
<ul class="trpg-list">${packs.map((p, i) => packRow(p, L, { n: i === 0 ? { title: n.row, sw: n.sw, exp: n.exp, more: n.more } : i === 1 ? { pend: n.pend } : {}, menu: menu && i === 0 })).join('')}</ul></div></div>`

const packList = (L, { pend = true, only = null } = {}) => mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${input('', { placeholder: '搜索这个包里的条目', ic: 'magnifying-glass' })}${btn('新建条目', { primary: true, ic: 'plus' })}</div>${pills([['全部', 19, true], ['法术', 3], ['怪物', 12], ['物品', 4]])}${table([{ label: '名称', sort: 'asc', can: 1 }, { label: '类别', can: 1 }, { label: '来源', can: 1 }, ''], [
  { cells: [`火焰鹦鹉${pend ? ' ' + pending() : ''}`, badge('法术'), gray('海盗战役'), iconBtn('pencil-simple', '编辑')] },
  { cells: ['船长莫尔', badge('怪物'), gray('海盗战役'), iconBtn('pencil-simple', '编辑')] },
  { cells: ['朗姆酒桶', badge('物品'), gray('海盗战役'), iconBtn('pencil-simple', '编辑')] },
].filter((r) => !only || r.cells[1].includes(only)))}${count(L === 'narrow' ? '共 19 条' : '共 19 条（3 类）')}`)

const manageTabs = (on) => `<div class="lib-filter" style="padding-top:var(--sp-3)"><span class="trpg-seg" role="group">${['名字', '规则与版本', '房规（覆盖）', '依赖包'].map((t) => `<button type="button" aria-pressed="${t === on}">${t}</button>`).join('')}</span></div>`
const manageFoot = `<div class="lib-ebar">${btn('再复制一份', { small: true, ic: 'copy' })}${btn('导出', { small: true, ic: 'download-simple' })}<span class="lib-end">${btn('删除这个包…', { small: true, danger: true })}</span></div>`
const sel = (t, w) => `<button type="button" class="trpg-select-trigger"${w ? ` style="width:${w}px"` : ''}><span>${t}</span>${icon('caret-down', 14)}</button>`
const ruleTab = (n = {}) => mbody(`${manageTabs('规则与版本')}<div class="lib-pad"><div class="lib-form">${field(`${P(n.rule)}属于规则`, sel('D&D 5e（2014）'), { hint: '这个包跟哪套规则一起用；换了以后在那套规则的战役里才看得到' })}${field(`${P(n.ver)}版本标签`, pills([['5e', null, true], ['5.5e', null], ['未归类', null]]), { hint: '导出时写进包头（作者的 edition）' })}</div></div>${manageFoot}`)
const ruleRow = (name, to, lv, on) => `<li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title"><span class="trpg-check" data-on="${on}"><span class="trpg-check__box">${on ? icon('check', 12) : ''}</span></span>${name}</div><div class="trpg-row__meta">改成 ${to} · ${lv}</div></div><div class="trpg-row__end">${btn('复原', { small: true, ic: 'arrow-counter-clockwise' })}</div></li>`
const houseTab = (L, n = {}) => mbody(`${manageTabs('房规（覆盖）')}<div class="lib-pad"><div class="lib-stack"><div class="lib-filter" style="padding:0">${P(n.all)}<span class="trpg-check" data-on="false"><span class="trpg-check__box"></span>全选</span><span class="lib-end">${L === 'narrow' ? '' : '<span class="lib-muted" style="white-space:nowrap">作用于</span>'}${sel('全局', 120)}${btn('应用到选中的', { small: true, n: n.apply })}</span></div>
<ul class="trpg-list">${ruleRow('火焰鹦鹉', '「我的火焰鹦鹉」（房规）', '本战役', true)}${ruleRow('船长莫尔', '玩家手册（副本 1）里的那一份', '全局', false)}${ruleRow('朗姆酒桶', '原件', '规则：5e', false)}</ul></div></div>${manageFoot}`)
const nameTab = () => mbody(`${manageTabs('名字')}<div class="lib-pad"><div class="lib-form">${field('名字', input('海盗战役'))}${field('缩写', input('PIRATE'))}${field('编号', `<div class="trpg-input" aria-disabled="true" style="background:var(--bg-sunk);color:var(--text3)">PIRATE ${icon('lock', 14)}</div>`, { hint: '编号建好就不能改：别人的包、房规都是靠它找到这个包的' })}<div>${btn('保存名字', { primary: true, small: true })}</div></div></div>${manageFoot}`)

const imp = (L) => modal('dialog', modalHead('导入预览'), `<div class="lib-stack" style="overflow:auto">
<div class="lib-file"><div class="lib-file__top"><b>${P(1)}海盗战役.json</b>${badge('可以导入', 'success')}</div><div class="lib-kv"><span>新增 <b>18</b> 条</span><span>依赖 <b>齐全</b></span></div>
${infoLine(`${P(2)}会顶掉你已有的包「海盗战役」：两个包的来源编号一样（PIRATE），作者只认一个。旧包里的改动会没有。`, btn('先导出旧包', { small: true }))}</div>
<div class="lib-file"><div class="lib-file__top"><b>（另一个文件.json）</b>${badge('可以导入', 'success')}</div><div class="lib-kv"><span>新增 <b>n</b> 条</span><span>依赖 <b>缺少 1 个</b></span></div></div></div>
<div class="trpg-confirm__actions" style="margin-top:auto;padding-top:var(--sp-3)">${btn('取消')}${btn(L === 'narrow' ? '导入（顶掉 1 个）' : '确认导入（顶掉 1 个包）', { primary: true, n: 3 })}</div>`)

const newPack = (L, { taken = false } = {}) => modal('dialog', modalHead('新建包'), `<div class="lib-form" style="overflow:auto">
${field(`${P(1)}名字`, input('海盗战役'))}
${field(`${P(2)}编号`, input(taken ? 'PHB' : 'PIRATE', { invalid: taken }), taken ? { err: '「PHB」已经是玩家手册在用的编号了，换一个' } : { hint: '只能用英文字母、数字、_ 和 -；按名字给了一个建议，建好不能改' })}
${field('缩写', input('', { placeholder: '不填就用编号' }))}
${field(`${P(3)}规则`, sel('当前战役：D&D 5e（2014）'), { hint: '版本标签按规则自动打上，之后可在包的 ⋯ → 管理 里改' })}</div>
<div class="trpg-confirm__actions" style="margin-top:auto;padding-top:var(--sp-3)">${btn('取消')}${btn('建好并打开', { primary: true, n: 4, disabled: taken })}</div>`)

const copyBook = () => modal('confirm', modalHead('复制成我的'), `<div class="trpg-confirm"><p>${P(1)}把<b>玩家手册（2014）</b>整本复制一份，放进【我的库】成为一个新包：</p><ul class="trpg-confirm__details"><li>新包叫「玩家手册（副本 1）」，可以随便改</li><li>原书以后更新、卸载都不影响副本</li><li>同一本书可以复制多份，每份是一个包</li></ul><div class="trpg-confirm__actions">${btn('取消')}${btn('复制', { primary: true, n: 2 })}</div></div>`)
const copyEntry = (L) => modal('confirm', modalHead('复制成我的：火球术'), `<div class="trpg-confirm"><p>${P(3)}把这一条复制进【我的库】的一个包，之后在那里改：</p>${field('存进', sel('海盗战役（上次用的）'))}<div>${btn('新建一个包', { small: true, ic: 'plus' })}</div><div class="trpg-confirm__actions">${btn('取消')}${btn('复制', { primary: true })}</div></div>`)

export const screens = [
  {
    id: 'u7-1-mylib', group: G, title: 'P5.5 我的库：只有一种东西——包', flow: 'P5.5 §15 ①',
    goal: '看到自己所有的包，进包改条目，或者新建 / 导入一个包', primary: '[新建包]', patterns: 'Row list · Row actions · Switch · Notification（草稿条）', laws: 'Jakob（同书架行）· Hick（顶部只有两个按钮，一个主色）· Zeigarnik（没保存的草稿提醒）',
    captions: { '1440': '宽窗 · 三个包：自己建的、整本复制的（后台整理中）、迁移来的「我的资料」', '900': '宽窗 · 行尾 ⋯ 展开：管理 / 再复制一份 / 删除', '390': '窄屏 · 底部标签栏；导出收进 ⋯；空态见状态板 u7-11' },
    diff: '窄：按钮缩成「导入」「新建包」，行尾的 [导出] 收进 ⋯。',
    notes: [
      [1, '搜索 + [导入文件] + [新建包]', '[新建包] 是主按钮（问卷 Q9、驾驶员 11-13：先建包，进包才新建条目）；搜索在所有包的条目里找', '【有】custom.packs · custom.createPack'],
      [2, '草稿提醒条', '有没保存的草稿才出现：几份、是哪几条；[继续] 下拉选一份回到编辑器。草稿只是草稿，不影响任何条目（Q15）', '【有】custom.drafts(codeSet)'],
      [3, '包的行', '名字 · 版本标签 · 每类几条（复制件写「复制自 xx」）· 本战役开关 · [导出] · ⋯。不再分「导入的 / 存入的副本 / 自己写的」三组，全都是能改的包', '【有】custom.packs → MyPack（own、scopes、props）'],
      [4, '整理中', '刚改过、后台还在整理的包，带一个小转圈「整理中」；整理完自动消失；条目照样能看能改（U2）', '【有】custom.pending(codeSet)'],
      [5, '⋯ 菜单', '管理（u7-4）· 再复制一份 · 删除（影响页沿用 u6-4）', '【有】custom.saveToMine({kind:"pack"}) · deletePack'],
      [6, '从下载页装的包', '不在这里，在书架；想改就在书架 ⋯ → 复制成我的（u7-6）', '【有】origin 区分'],
    ],
    board: tri({
      '1440': () => page(myLib('wide', { search: 1, imp: 1, add: 1, drafts: 2, row: 3, pend: 4 })),
      '900': () => page(myLib('wide', { more: 5 }, { menu: true })),
      '390': () => page(myLib('narrow')),
    }),
  },
  {
    id: 'u7-2-newpack', group: G, title: 'P5.5 新建包', flow: 'P5.5 §15 ②',
    goal: '起个名字就能建好包，然后直接进去加条目', primary: '[建好并打开]', patterns: 'Dialog · Good Defaults · Inline validation', laws: 'Postel（编号按名字给建议）· Tesler（规则默认当前战役）· Fitts（主按钮在右下）',
    captions: { '1440': '宽窗 · 正常填写', '900': '宽窗 · 编号撞了：当场标红，主按钮点不了', '390': '窄屏 · 底部抽屉' },
    diff: '宽：居中小弹窗；窄：底部抽屉，按钮纵排。',
    notes: [
      [1, '名字', '必填；显示在我的库、书架、来源灰字里', '【有】createPack(src.full)'],
      [2, '编号', '作者用它认包、拼条目编号；只能英文字母、数字、_、-；按名字给建议；撞了已有的书或包当场标红（后端判断）', '【有】createPack 报错文字 · frame sourceTaken'],
      [3, '规则', '默认当前战役的规则；决定版本标签和包头的版本风格', '【有】createPack(…, { rule })'],
      [4, '[建好并打开]', '建好后直接打开这个包的弹窗（u7-3），可以马上新建条目', '前端'],
    ],
    board: tri({
      '1440': () => page(myLib('wide'), { overlay: newPack('wide') }),
      '900': () => page(myLib('wide'), { overlay: newPack('wide', { taken: true }) }),
      '390': () => page(myLib('narrow'), { overlay: newPack('narrow').replace('class="trpg-modal"', 'class="trpg-modal" data-variant="sheet"') }),
    }),
  },
  {
    id: 'u7-3-pack', group: G, title: 'P5.5 包弹窗：条目列表 + [新建条目]', flow: 'P5.5 §15 ③',
    goal: '在包里找到要改的条目，或者往包里加新条目', primary: '[新建条目]', patterns: 'Modal Panel（沿用 u3-2）· Sortable Table · Row action ✎', laws: 'Jakob（和书架的包弹窗同一个样子）· Fitts（✎ 在行尾）',
    captions: { '1440': '宽窗 · 刚存的条目带「整理中」', '900': '宽窗 · 选了「怪物」药丸', '390': '窄屏 · 底部抽屉' },
    diff: '和 u3-2 自制包弹窗同一个壳，只多 [新建条目] 和行尾 ✎。',
    notes: [
      [1, '弹窗头', '‹ 我的库 · 包名 · 版本标签 · 本战役开关 · ⋯（管理 / 再复制一份 / 导出 / 删除）· ✕', '沿用 u3'],
      [2, '[新建条目]', '包里加一条：选类型 → 选起点 → 编辑器（u7-7 起）；存进的就是这个包，不再问', '【有】custom.entryTypes'],
      [3, '行尾 ✎', '打开编辑器；复制件里的条目同样能改（编号不变）', '【有】custom.packEntry'],
      [4, '整理中', '刚存、后台还没整理完的条目：列表里先显示，详情和预览用刚存的原文', '【有】custom.pending'],
    ],
    board: tri({
      '1440': () => page(myLib('wide'), { overlay: sheet(packHead({ back: '我的库', title: '海盗战役', ver: '5e', n: { title: 1 } }), packList('wide')) }),
      '900': () => page(myLib('wide'), { overlay: sheet(packHead({ back: '我的库', title: '海盗战役', ver: '5e' }), packList('wide', { pend: false, only: '怪物' }).replace('data-on="true">全部', 'data-on="false">全部').replace('data-on="false">怪物', 'data-on="true">怪物')) }),
      '390': () => page(myLib('narrow'), { overlay: sheet(packHead({ back: '我的库', title: '海盗战役', ver: '5e' }), packList('narrow')) }),
    }),
  },
  {
    id: 'u7-4-manage', group: G, title: 'P5.5 包 ⋯ → 管理（名字 · 规则与版本 · 房规 · 依赖）', flow: 'P5.5 §15 ④',
    goal: '改包的名字、规则和版本；看这个包相关的所有房规并整批改作用范围', primary: '[应用到选中的]', patterns: 'Module Tabs · Bulk select · Settings Editor', laws: 'Hick（四个分区，一次看一个）· Tesler（作用范围一个下拉整批改）· Postel',
    captions: { '1440': '宽窗 · 规则与版本（Q12：自制包的规则、版本在这里换，不放保存确认里）', '900': '宽窗 · 房规（覆盖）：勾几条，选「全局」，应用（Q14）', '390': '窄屏 · 名字' },
    diff: '弹窗内换页（不叠层），‹ 回包的列表。书架整块、单条详情的 ⋯ → 管理 → 房规 用同一个列表，只是范围不同。',
    notes: [
      [1, '规则与版本', '属于规则（下拉）· 版本标签（5e / 5.5e / 未归类）', '【有】manage.setAssignment（版本标签）· createPack 的 rule'],
      [2, '房规（覆盖）', '这个包相关的：包里条目被改成了别的（房规、别的包里的同一条），或者别处选了这个包的那一份。每行：条目 · 改成了谁 · 作用于哪层 · [复原]', '【新 G3】custom.packEdits(codeSet, id, 战役)'],
      [3, '整批改作用范围', '全选 / 勾几条 → 作用于（本战役 / 规则 / 全局）→ [应用到选中的]', '【新 G3】custom.moveEdits(c, rows, 层)'],
      [4, '名字', '名字、缩写可改；编号灰着不能改（写明原因）', '【有】custom.renamePack'],
      [5, '依赖包', '沿用 P5 管理页的「依赖包」分区', '【有】packHealth'],
      [6, '底部', '再复制一份 · 导出 · 删除这个包…（影响页）', '【有】'],
    ],
    board: tri({
      '1440': () => page(myLib('wide'), { overlay: sheet(packHead({ back: '海盗战役', title: '管理', on: null, more: false }), ruleTab({ rule: 1, ver: 1 })) }),
      '900': () => page(myLib('wide'), { overlay: sheet(packHead({ back: '海盗战役', title: '管理', on: null, more: false }), houseTab('wide', { all: 3, apply: 3 })) }),
      '390': () => page(myLib('narrow'), { overlay: sheet(packHead({ back: '海盗战役', title: '管理', on: null, more: false }), nameTab()) }),
    }),
  },
  {
    id: 'u7-5-import', group: G, title: 'P5.5 导入预览：会顶掉哪个包', flow: 'P5.5 §15 ⑤',
    goal: '导入前知道会不会把自己已有的包换掉', primary: '[确认导入]', patterns: 'Preview before commit（在 u6-2 上加一块）', laws: 'Peak–End（别在最后一步丢东西）· Postel（仍可导入，只提示）',
    captions: { '1440': '宽窗 · 第一个文件会顶掉已有的包', '900': '宽窗 · 同上', '390': '窄屏 · 抽屉' },
    diff: '其余同 u6-2（结构错、缺依赖照旧）。',
    notes: [
      [1, '每个文件一块', '新增几条 · 依赖 · 作者报的错（同 u6-2）', '【有】custom.previewImport'],
      [2, '会顶掉已有的包', '作者认包靠「来源编号组合」：一样就换掉旧的。提示 + [先导出旧包]', '【有】previewImport().replaces（B8-7）'],
      [3, '主按钮写明后果', '「确认导入（顶掉 1 个包）」', '前端'],
    ],
    board: tri({
      '1440': () => page(myLib('wide'), { overlay: imp('wide') }),
      '900': () => page(myLib('wide'), { overlay: imp('wide') }),
      '390': () => page(myLib('narrow'), { overlay: imp('narrow').replace('class="trpg-modal"', 'class="trpg-modal" data-variant="sheet"') }),
    }),
  },
  {
    id: 'u7-6-copy', group: G, title: 'P5.5 复制成我的（整本 / 单条）', flow: 'P5.5 §15 ⑥',
    goal: '拿官方的、下载的当底子，复制一份到自己的包里改', primary: '[复制]', patterns: 'Confirm Dialog · Good Defaults（上次用的包）', laws: 'Jakob（D&D Beyond「复制再改」）· Tesler（默认上次的包）',
    captions: { '1440': '宽窗 · 书架里书的 ⋯ → 复制成我的（整本）', '900': '宽窗 · 条目详情 ⋯ → 复制成我的（单条，选包）', '390': '窄屏 · 完成后的提示' },
    diff: '取代 u6-5「存入我的库」。整本 / 整包 = 新包；单条 = 进选的包。',
    notes: [
      [1, '整本', '新包「xx（副本 n）」；原书更新、卸载不影响；可以复制多份', '【有】custom.saveToMine({kind:"source"|"pack"})'],
      [2, '[复制]', '整本要几秒到十几秒（大书 1890 条），按钮转圈，完成横幅「已复制成我的：玩家手册（副本 1）[打开]」', '实测见 §13'],
      [3, '单条', '选存进哪个包，默认上次用的；没有合适的可以当场新建包', '【有】saveToMine({kind:"entry"}) ·【新 G2】custom.suggestedPack'],
    ],
    board: tri({
      '1440': () => ({ page: 'library', flush: true, content: shelfPage({}), overlay: copyBook() }),
      '900': () => ({ page: 'library', flush: true, content: shelfPage({}), overlay: copyEntry('wide') }),
      '390': () => ({ ...page(myLib('narrow')), toast: toast('已复制成我的：玩家手册（副本 1）', { kind: 'success', hint: '打开' }) }),
    }),
  },
]
export { empty, ph }

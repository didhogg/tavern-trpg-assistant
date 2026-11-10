// U6 自制导入与管理：我的库（导入的包 / 自己写的条目 / 房规）、导入预览、导出、删除。流程见 P5-0 §13.6.7。
import { libPage, libTop } from '../lib/parts.mjs'
import { badge, btn, empty, errorLine, icon, iconBtn, impact, infoLine, loading, modal, modalHead, pin, stateCard, sw, toast } from '../lib/ui.mjs'

const G = 'U6 我的库（导入 · 导出 · 删除）'
const P = (n) => (n ? pin(n) : '')
const ph = (t) => `<span class="lib-faint">${t}</span>`

const prow = ({ title, meta, end, n }) => `<li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title">${P(n)}${title}</div><div class="trpg-row__meta">${meta}</div></div><div class="trpg-row__end">${end}</div></li>`
const bar = (n) => `<div class="lib-filter" style="padding-top:0">${P(n.search)}<div class="trpg-input">${icon('magnifying-glass', 16)}&nbsp;<span class="lib-faint">在我的库里搜索</span></div>${btn('导入文件', { ic: 'upload-simple', n: n.imp })}${btn('新建条目', { primary: true, ic: 'plus', n: n.add })}</div>`

const myLib = (pins = {}, menu = false) => `${libTop('mine')}<div class="lib-scroll"><div class="lib-stack">${bar(pins)}
<div><div class="trpg-group trpg-group--first">${P(pins.packs)}导入的包</div><ul class="trpg-list">
${prow({ title: ph('（你导入的文件名）'), meta: '来源 3 个 · 条目 n 条', end: `${sw(true)}${btn('导出', { small: true, ic: 'download-simple', n: pins.exp })}<span style="position:relative">${iconBtn('dots-three', '更多', pins.menu)}${menu ? `<div class="trpg-dropdown" style="position:absolute;z-index:40;right:0;top:100%;width:168px"><div class="trpg-dropdown__item">管理</div><div class="trpg-dropdown__item trpg-dropdown__item--danger">删除…</div></div>` : ''}</span>` })}</ul></div>
<div><div class="trpg-group">${P(pins.own)}自己写的条目 ${badge('我的资料')}</div><ul class="trpg-list">${prow({ title: ph('（你写的条目名）'), meta: '法术 · 我的资料', end: `${iconBtn('pencil-simple', '编辑')}${iconBtn('dots-three', '更多')}` })}</ul></div>
<div><div class="trpg-group">${P(pins.house)}房规 ${badge('我的房规', 'warn')}</div><ul class="trpg-list">${prow({ title: '火球术（范围 100 尺）', meta: '改的条目：火球术 · 生效处：本战役', end: `${iconBtn('pencil-simple', '编辑')}${iconBtn('dots-three', '更多')}` })}</ul></div></div></div>`

const fileBlock = ({ name, rows, bad, errs = '', n }) => `<div class="lib-file"${bad ? ' data-bad="true"' : ''}><div class="lib-file__top"><b>${P(n)}${name}</b>${bad ? badge('结构有错', 'warn') : badge('可以导入', 'success')}</div><div class="lib-kv">${rows}</div>${errs}</div>`

export const screens = [
  {
    id: 'u6-1-mylib', group: G, title: 'U6 我的库', flow: '13.6.7',
    goal: '管理自己导入的文件、写的条目和房规', primary: '[导入文件] / [新建条目]', patterns: 'Titled Sections · Row actions · Switch', laws: 'Hick（顶部只有两个按钮，一个主色）· Jakob（开关 = 本战役）· Postel',
    diff: '窄：按钮换行，行尾操作收进 ⋯。',
    notes: [
      [1, '搜索 + [导入文件] + [新建条目]', '[新建条目] 是主按钮（主色）；[导入文件] 次要；内容跟随全局语言，另一语言没有的灰', '【有】全局语言（D-5）'],
      [2, '导入的包（来历 = import）', '每行：名称 · 来源数 · 条目数 · 开关（本战役，多来源的归一组）· [导出] · ⋯ [删除]', '【有】brewPacks.list(…).origin · custom.exportBrew'],
      [3, '自己写的条目（来源「我的资料」）', '行：名称 · 类别；点行 → 条目页；✎ → 编辑（U7）；⋯ [删除] → 影响页', '【有】service.query(brewSet, prop, {source})'],
      [4, '房规（来源「我的房规」）', '行：房规名 · 改的条目 · 生效处；同"设置 → 库 → 房规"', '【有】manage.houseRules()'],
      [5, '注意', '从下载页装的包不在这里，在书架（来历 = download）', '【有】origin 区分'],
    ],
    render: () => ({ page: 'library', flush: true, content: libPage(myLib({ search: 0, imp: 1, add: 1, packs: 2, exp: 2, own: 3, house: 4 })) }),
  },
  {
    id: 'u6-2-import', group: G, title: 'U6 导入预览', flow: '13.6.7',
    goal: '导入前看清会发生什么：新增几条、哪些和已有的同编号、依赖齐不齐、有没有结构错误', primary: '[确认导入]', patterns: 'Preview before commit · Dialog', laws: 'Postel（缺依赖仍可导入，只提示）· Hick（两个按钮）· 不替用户改数据',
    diff: '窄：整屏；按钮纵向，[确认导入] 在上。',
    notes: [
      [1, '每个文件一块', '新增 n 条 · 与已有条目同编号 m 条（已挂成备选，原件照常生效）· 依赖是否齐全 · 作者报的错', '【有】custom.previewImport(codeSet, files)'],
      [2, '结构有错', '作者的结构检查：错误 = 路径 + 中文说明 + 原文行列（见 u6-3）；这个文件不能导入，[返回换文件]；不替用户改数据', '【有】custom.validate；中文自制文件里的 ENG_name、译者名单放行（G-4）'],
      [3, '缺依赖', '「缺少依赖：xxx」[去下载]；仍可导入，导入后再提示一次', '【有】'],
      [4, '[确认导入]', '→ service.brewImport → 完成提示条 → 出现在列表；设置里"导入总是不预览"开着时跳过本页', '【有】service.brewImport'],
    ],
    render: () => ({ page: 'library', flush: true, content: libPage(myLib()),
      overlay: modal('dialog', modalHead('导入预览'), `<div class="lib-stack" style="overflow:auto">
${fileBlock({ name: '（文件一.json）', rows: '<span>新增 <b>n</b> 条</span><span>与已有同编号 <b>m</b> 条，已挂成备选</span><span>依赖 <b>齐全</b></span>', n: 1 })}
${fileBlock({ name: '（文件二.json）', rows: '<span>新增 <b>n</b> 条</span><span>依赖 <b>缺少 1 个</b></span>', n: 3, errs: `${infoLine('缺少依赖：（某资料包）', btn('去下载', { small: true }), '')}` })}</div>
<div class="trpg-confirm__actions" style="margin-top:auto;padding-top:var(--sp-3)">${btn('取消')}${btn('确认导入', { primary: true, n: 4 })}</div>`) }),
  },
  {
    id: 'u6-3-import-states', group: G, title: 'U6 导入 / 导出的异常', flow: '13.6.7',
    goal: '导入、导出、删除出任何问题，原有内容保持不变', primary: '[重试] / [返回换文件]', patterns: 'Error Messages · Recoverable error · Toast', laws: 'Postel（路径 + 中文说明 + 行列）· Doherty · 失败不改动原内容',
    diff: '状态板。',
    notes: [
      [1, '结构有错', '一条错误 = 路径（/spell/0/level）+ 中文说明 + 原文第几行第几列；按作者的结构定义，不是我们的规则', '【有】custom.validate → issues'],
      [2, '读取中', '选了文件后的读取（> 300 ms 显示圆圈）', '全局规则'],
      [3, '导入 / 导出 / 删除失败', '原因 + [重试]；原有内容保持不变（失败不改动已有的包）', '【有】'],
      [4, '导入完成', '提示条「已导入 n 个包」，列表里出现', 'P4 提示条'],
      [5, '导出完成', '提示条「已导出 xxx.json」（浏览器下载）', '【有】custom.exportBrew'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('结构有错（不能导入）', `${fileBlock({ name: '（文件三.json）', bad: true, rows: '<span><b>2</b> 处错误</span>', errs: `<div class="lib-err"><b>/spell/0/level</b><span>应该是 0 到 9 的整数。</span><code>第 14 行 第 12 列</code></div><div class="lib-err"><b>/spell/3/school</b><span>不是作者认识的学派代号。</span><code>第 52 行 第 15 列</code></div>`, n: 1 })}<div style="display:flex;justify-content:flex-end">${btn('返回换文件')}</div>`, 1)}
${stateCard('读取中', loading('正在读取文件…'), 2)}
${stateCard('导入失败', `${errorLine('导入没有成功：文件读取出错。你已有的内容没有改动。', btn('重试', { small: true }))}`, 3)}
${stateCard('导入完成', `<div style="position:static">${toast('已导入 1 个包', { kind: 'success' })}</div>`, 4)}
${stateCard('导出完成 / 失败', `<div>${toast('已导出 xxx.json', { kind: 'success' })}</div><div style="height:6px"></div><div>${toast('导出没有成功：浏览器拒绝了下载。', { kind: 'error', hint: '点击关闭' })}</div>`, 5)}
${stateCard('空态', empty('这里放你自己的内容。', `${btn('导入文件', { small: true })}${btn('新建条目', { small: true, primary: true })}`), 0)}</div>`,
  },
  {
    id: 'u6-4-delete', group: G, title: 'U6 删除包 → 影响页', flow: '13.6.7 · 13.6.0 影响页',
    goal: '删之前看清谁依赖它', primary: '[确认删除] / [取消]', patterns: 'Confirm Dialog · More Menu', laws: 'Postel · Hick · Zeigarnik（勾选"以后不再提示"可在设置里改回）',
    diff: '窄：底部弹出，按钮纵向。',
    notes: [
      [1, '⋯ 菜单', '[管理] / [删除]；导出在行尾按钮上（常用，不藏进菜单）', '【有】'],
      [2, '影响页', '同 u2-3：依赖它的自制包 · 房规与选版本 · 战役与存档（含已删存档）；[确认删除] / [取消]', '【有】backend.removalImpact'],
      [3, '[确认删除]', '→ service.brewDelete → 提示条「已删除」；原有的其他内容不动；删除失败保持原样 + [重试]', '【有】service.brewDelete'],
    ],
    render: () => ({ page: 'library', flush: true, content: libPage(myLib({ menu: 1 }, true)),
      overlay: impact('删除这个包？', ['1 个自制包依赖它', '2 条房规和 1 处版本选择', '战役「失落矿坑」（1 个存档，另有 1 个已删存档里也用到）'], { confirm: '确认删除', n: 2 }) }),
  },
]

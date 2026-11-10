// U6 我的库：用户存入 / 导入的自制包、自己写的条目；导入预览；存入我的库；删除。流程见 P5-0 §13.6.7。2026-11-10 按 R23–R91 重画（房规 / 编辑 / 覆盖不放这里）。
import { badge, btn, dropdown, empty, gray, icon, iconBtn, infoLine, libPage, libTop, pin, sw } from '../lib/parts.mjs'
import { errorLine, loading, modal, modalHead, stateCard, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'U6 我的库（导入 · 存入 · 导出 · 删除）'
const P = (n) => (n ? pin(n) : '')
const ph = (t) => `<span class="lib-faint">${t}</span>`
const prow = ({ title, meta, end, n }) => `<li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title">${P(n)}${title}</div><div class="trpg-row__meta">${meta}</div></div><div class="trpg-row__end">${end}</div></li>`
const bar = (n) => `<div class="lib-filter" style="padding-top:0">${P(n.search)}<div class="trpg-input">${icon('magnifying-glass', 16)}&nbsp;<span class="lib-faint">在我的库里搜索</span></div>${btn('导入文件', { ic: 'upload-simple', n: n.imp })}${btn('新建条目', { primary: true, ic: 'plus', n: n.add, disabled: true })}</div>`

const myLib = (pins = {}, menu = false) => `${libTop('mine')}<div class="lib-scroll"><div class="lib-stack">${bar(pins)}
<div><div class="trpg-group trpg-group--first">${P(pins.packs)}导入的包</div><ul class="trpg-list">
${prow({ title: ph('（你导入的文件名）'), meta: '来源 3 个 · 条目 n 条', end: `${sw(true)}${btn('导出', { small: true, ic: 'download-simple', n: pins.exp })}<span style="position:relative">${iconBtn('dots-three', '更多', pins.menu)}${menu ? dropdown([['管理'], ['删除…', true]], 168) : ''}</span>` })}</ul></div>
<div><div class="trpg-group">${P(pins.saved)}存入的副本 ${badge('我的库')}</div><ul class="trpg-list">${prow({ title: '凡戴尔的失落矿坑（副本）', meta: '本地原样副本 · 存于 ' + ph('yyyy-mm-dd') + ' · 不跟源更新', end: `${sw(true)}${btn('导出', { small: true, ic: 'download-simple' })}${iconBtn('dots-three', '更多')}` })}</ul></div>
<div><div class="trpg-group">${P(pins.own)}自己写的条目 ${badge('我的资料')}</div><ul class="trpg-list">${prow({ title: ph('（你写的条目名）'), meta: '法术 · 我的资料', end: `${iconBtn('pencil-simple', '编辑', 0, { disabled: true })}${iconBtn('dots-three', '更多')}` })}</ul></div>
</div></div>`

const fileBlock = ({ name, rows, bad, errs = '', n }) => `<div class="lib-file"${bad ? ' data-bad="true"' : ''}><div class="lib-file__top"><b>${P(n)}${name}</b>${bad ? badge('结构有错', 'warn') : badge('可以导入', 'success')}</div><div class="lib-kv">${rows}</div>${errs}</div>`
const page = (content, extra = {}) => ({ page: 'library', flush: true, content: libPage(content), ...extra })

export const screens = [
  {
    id: 'u6-1-mylib', group: G, title: 'U6 我的库（导入的包 · 存入的副本 · 自己写的条目）', flow: '13.6.7',
    goal: '管理自己导入的文件、存入的副本和写的条目', primary: '[导入文件] / [新建条目]', patterns: 'Titled Sections · Row actions · Switch', laws: 'Hick（顶部两个按钮，一个主色）· Jakob（开关 = 本战役）· Postel',
    diff: '窄：按钮换行，行尾操作收进 ⋯。',
    notes: [
      [1, '搜索 + [导入文件] + [新建条目]', '[新建条目] 是主按钮但**现在是灰的、点不了**：条目编辑与新建（模板新建、JSON 编辑、文字转条目、编辑自制条目、房规）是独立单元，P5.5 才做；条目上的 ✎ 同理；内容跟随全局语言，另一语言没有的灰', '【有】全局语言（D-5）'],
      [2, '导入的包（来历 = import）', '行：名称 · 来源数 · 条目数 · 开关（本战役，多来源的归一组）· [导出] · ⋯ [管理 / 删除]；任何 5etools 格式的内容（书、物品、人物）都应能读取〔R82、R85〕', '【有】brewPacks.list(…).origin · custom.exportBrew'],
      [3, '存入的副本', '从官方源 / 自制源"存入我的库"得到的**本地原样副本**：不受源仓库更新、卸载影响；与原件同编号时在列表里分行显示〔R83、Q-C 甲〕', '【有】custom.saveToMine（B-27）'],
      [4, '自己写的条目（来源「我的资料」）', '行：名称 · 类别；点行 → 条目详情；✎ → 编辑（U7）；⋯ [删除]', '【有】service.query(brewSet, prop, {source})'],
      [5, '不放房规 / 编辑 / 覆盖', '以前这里的"房规"一段**删掉了**；它们在条目详情、包的【管理】、设置 → 全局编辑 / 覆盖里管理〔R82〕', 'R82'],
      [6, '从下载页装的包', '不在这里，在书架（来历 = download）', '【有】origin 区分'],
    ],
    render: () => page(myLib({ search: 0, imp: 1, add: 1, packs: 2, exp: 2, saved: 3, own: 4, nohouse: 5 })),
  },
  {
    id: 'u6-2-import', group: G, title: 'U6 导入预览', flow: '13.6.7',
    goal: '导入前看清会发生什么：新增几条、哪些同编号、依赖齐不齐、有没有结构错误', primary: '[确认导入]', patterns: 'Preview before commit · Dialog', laws: 'Postel（缺依赖仍可导入，只提示）· Hick（两个按钮）· 不替用户改数据',
    diff: '窄：整屏；按钮纵向，[确认导入] 在上。',
    notes: [
      [1, '每个文件一块', '新增 n 条 · 与已有条目同编号 m 条（在列表里分行显示，原件照常生效）· 依赖是否齐全 · 作者报的错', '【有】custom.previewImport(codeSet, files)'],
      [2, '结构有错', '作者的结构检查：路径 + 中文说明 + 原文行列（见 u6-3）；这个文件不能导入，[返回换文件]；不替用户改数据', '【有】custom.validate；ENG_name、译者名单放行（G-4）'],
      [3, '缺依赖', '「缺少依赖：xxx」[下载依赖包]（仍可导入；也可默认勾选"一起下载"）〔R74〕', '【有】service.brewInstallSources'],
      [4, '[确认导入]', '→ service.brewImport → 完成横幅 → 出现在列表；设置里"导入总是不预览"开着时跳过本页', '【有】service.brewImport'],
    ],
    render: () => page(myLib(), { overlay: modal('dialog', modalHead('导入预览'), `<div class="lib-stack" style="overflow:auto">
${fileBlock({ name: '（文件一.json）', rows: '<span>新增 <b>n</b> 条</span><span>与已有同编号 <b>m</b> 条</span><span>依赖 <b>齐全</b></span>', n: 1 })}
${fileBlock({ name: '（文件二.json）', rows: '<span>新增 <b>n</b> 条</span><span>依赖 <b>缺少 1 个</b></span>', n: 3, errs: infoLine('缺少依赖：（某资料包）', `${btn('下载依赖包', { small: true, primary: true })}`, '') })}</div>
<div class="trpg-confirm__actions" style="margin-top:auto;padding-top:var(--sp-3)">${btn('取消')}${btn('确认导入', { primary: true, n: 4 })}</div>`) }),
  },
  {
    id: 'u6-3-import-states', group: G, title: 'U6 导入 / 导出的异常', flow: '13.6.7',
    goal: '导入、导出、删除出任何问题，原有内容保持不变', primary: '[重试] / [返回换文件]', patterns: '横幅 · Recoverable error', laws: 'Postel（路径 + 中文说明 + 行列）· Doherty · 失败不改动原内容',
    diff: '状态板。出错统一用顶部横幅（不占页面、不粘在页面上）〔R84〕。',
    notes: [
      [1, '结构有错', '一条错误 = 路径 + 中文说明 + 原文第几行第几列；按作者的结构定义，不是我们的规则', '【有】custom.validate → issues'],
      [2, '读取中', '选了文件后的读取（> 300 ms 显示圆圈）', '全局规则'],
      [3, '导入 / 导出 / 删除失败', '顶部横幅（原因）+ 原来的位置一个 [重试]；原有内容保持不变', '【有】'],
      [4, '导入完成', '横幅「已导入 n 个包」，列表里出现', 'P4 提示条'],
      [5, '导出完成', '横幅「已导出 xxx.json」（浏览器下载）', '【有】custom.exportBrew'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('结构有错（不能导入）', `${fileBlock({ name: '（文件三.json）', bad: true, rows: '<span><b>2</b> 处错误</span>', errs: `<div class="lib-err"><b>/spell/0/level</b><span>应该是 0 到 9 的整数。</span><code>第 14 行 第 12 列</code></div><div class="lib-err"><b>/spell/3/school</b><span>不是作者认识的学派代号。</span><code>第 52 行 第 15 列</code></div>`, n: 1 })}<div style="display:flex;justify-content:flex-end">${btn('返回换文件')}</div>`, 1)}
${stateCard('读取中', loading('正在读取文件…'), 2)}
${stateCard('导入失败（横幅）', `<div style="position:static">${toast('导入没有成功：文件读取出错，你已有的内容没有改动。', { kind: 'error' })}</div>${btn('重试', { small: true })}`, 3)}
${stateCard('导入完成', `<div style="position:static">${toast('已导入 1 个包', { kind: 'success' })}</div>`, 4)}
${stateCard('导出完成 / 失败', `<div>${toast('已导出 xxx.json', { kind: 'success' })}</div><div style="height:6px"></div><div>${toast('导出没有成功：浏览器拒绝了下载。', { kind: 'error' })}</div>`, 5)}
${stateCard('空态', empty('这里放你自己的内容。', `${btn('导入文件', { small: true })}${btn('新建条目', { small: true, primary: true })}`), 0)}</div>`,
  },
  {
    id: 'u6-4-delete', group: G, title: 'U6 删除包 → 影响页', flow: '13.6.7 · 13.6.0 影响页',
    goal: '删之前看清谁依赖它', primary: '[确认删除] / [取消]', patterns: 'Confirm Dialog · More Menu', laws: 'Postel · Hick · Zeigarnik',
    diff: '窄：底部弹出，按钮纵向。',
    notes: [
      [1, '⋯ 菜单', '[管理] / [删除]；导出在行尾按钮上（常用，不藏进菜单）', '【有】'],
      [2, '影响页', '依赖它的自制包（必须一起删的不可取消）· 覆盖与房规 · 战役与存档（含已删存档）〔R76〕', '【有】backend.removalImpact'],
      [3, '[确认删除]', '→ service.brewDelete → 横幅「已删除」；失败保持原样 + 横幅 + [重试]', '【有】service.brewDelete'],
    ],
    render: () => page(myLib({ menu: 1 }, true), { overlay: modal('confirm', modalHead('删除这个包？', { n: 2 }), `<div class="trpg-confirm"><p>下面这些东西会受到影响：</p><ul class="trpg-confirm__details"><li>1 个自制包依赖它（必须一起删除）</li><li>2 条覆盖和 1 处编辑</li><li>战役「失落矿坑」（1 个存档，另有 1 个已删存档里也用到）</li></ul><label class="trpg-check" data-on="false" style="color:var(--text2)"><span class="trpg-check__box"></span>以后不再提示（可在 设置 → 库 里改回来）</label><div class="trpg-confirm__actions">${btn('取消')}${btn('确认删除', { danger: true, n: 3 })}</div></div>`) }),
  },
  {
    id: 'u6-5-save', group: G, title: 'U6 存入我的库（确认 + 结果）', flow: '13.6.7',
    goal: '把条目 / 书 / 包存一份本地原样副本到我的库', primary: '[存入]', patterns: 'Confirm Dialog · 横幅', laws: 'Postel（说清是"原样副本"）· Peak–End（完成给横幅）',
    captions: { '1440': '宽窗 · 从条目详情 ⋯ → 存入我的库', '900': '宽窗 · 存好后的横幅，同编号的与原件分行显示', '390': '窄屏 · 从书架行 ⋯ → 存入我的库（整个包原样存）' },
    diff: '宽：居中确认框；窄：底部弹出。',
    notes: [
      [1, '入口', '所有数据条目 / 书 / 包，在详情外壳或列表 ⋯ 里都有【存入我的库】；包存的时候**原样存进去**〔R83〕', '前端'],
      [2, '说明', '「存一份本地原样副本；之后不跟着源仓库更新，卸载源也不会影响它」——不是"变成可编辑态"：所有条目本来就能编辑 / 覆盖，官方源下载的覆盖后可复原〔Q-C 甲〕', '【有】custom.saveToMine（B-27）：官方的书 / 条目取原始文件按 source 挑记录；自制包原文原样再导入'],
      [3, '[存入]', '→ 作者本地导入（来历 = 导入，进我的库）；大书可能较慢（> 300 ms 显示进度）', '【有】'],
      [4, '完成', '横幅「已存入我的库」；重复存并进去；与原件同编号时在列表里分行显示、来源标「我的库」', '【有】B-31'],
    ],
    board: tri({
      '1440': () => page(myLib({}), { overlay: modal('confirm', modalHead('把「火球术」存入我的库？', { n: 1 }), `<div class="trpg-confirm"><p>${P(2)}会存一份<b>本地原样副本</b>到「我的库」。之后源仓库更新、或者卸载这本书，都不会影响这份副本。</p><div class="trpg-confirm__actions">${btn('取消')}${btn('存入', { primary: true, n: 3 })}</div></div>`) }),
      '900': () => page(myLib({ saved: 4 }), { toast: toast('已存入我的库：火球术（与原件同编号，分行显示）', { kind: 'success' }) }),
      '390': () => page(myLib({}), { overlay: modal('confirm', modalHead('把「玩家手册（2014）」存入我的库？'), `<div class="trpg-confirm"><p>整个包会原样存一份本地副本到「我的库」，不跟着源更新。</p><div class="trpg-confirm__actions">${btn('存入', { primary: true })}${btn('取消')}</div></div>`) }),
    }),
  },
]

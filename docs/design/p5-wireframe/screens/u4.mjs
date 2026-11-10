// U4 下载与更新：官方 + 自制同一页、状态与警告样式、配对行、完成横幅、拉取更新。流程见 P5-0 §13.6.4。2026-11-10 按 R23–R91 重画。
import { ADVENTURES, badge, btn, dropdown, empty, icon, infoLine, input, libPage, libTop, pin, seg, shelfPage } from '../lib/parts.mjs'
import { errorLine, progress, stateCard, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'U4 下载与更新'
const P = (n) => (n ? pin(n) : '')
const ph = (t) => `<span class="lib-faint">${t}</span>`
const lrow = (title, meta, end, n) => `<li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title lib-title--serif">${P(n)}${title}</div><div class="trpg-row__meta">${meta}</div></div><div class="trpg-row__end">${end}</div></li>`
const langs = (a, b) => `<span class="lib-langs">${badge('中', '', a ? '' : ' data-off="true"')}${badge('En', '', b ? '' : ' data-off="true"')}</span>`
const brewRow = ({ title, author, l = [true, true], end, n, note }) => lrow(title, `${author} · ${ph('yyyy-mm-dd')}${note ? ` · ${note}` : ''}`, `${langs(...l)}${end}`, n)

/** 下载页：官方 + 自制同一页（R22）。顶部一行：官方|自制 过滤 + 书目搜索 + 灰掉的【增加数据源仓库】（之后再做，R71 / R89）。 */
const dl = ({ pins = {}, official = 'none', filter = '全部', warn = '', brewErr = '', rows = null } = {}) => {
  const action = { none: btn('下载', { primary: true, n: pins.dl }), installed: `${badge('已安装', 'success')}${btn('重新下载', { small: true })}`, incomplete: `${badge('装了一半', 'warn')}${btn('继续', { primary: true })}` }[official]
  return libPage(`${libTop('download')}<div class="lib-dlbar">${P(pins.filter)}${seg(['全部', '官方', '自制'].map((l) => ({ label: l, on: l === filter })))}${input('', { placeholder: '搜索书名 / 包名 / 作者', ic: 'magnifying-glass' })}<span style="display:inline-flex;gap:6px;align-items:center" class="lib-soft">${P(pins.repo)}${btn('增加数据源仓库', { small: true, ic: 'plus', disabled: true })}<small class="lib-muted">之后再做</small></span></div>
<div class="lib-scroll"><div class="lib-stack">${warn}
${filter === '自制' ? '' : `<div class="lib-dl-main"><div class="lib-dl-main__top"><span class="lib-title">${P(pins.main)}官方资料</span><span class="lib-end">${action}</span></div><div class="lib-muted" style="font-size:var(--fs-sm)">全部规则书和数据，中英自动一起装。大小约 ${ph('xxx MB')} · 本机剩余 ${ph('yyy MB')}。</div></div>
<div><div class="lib-sec" style="padding-top:0">书与冒险（官方）<span class="lib-end">${btn('刷新书目', { small: true, ic: 'arrow-clockwise' })}</span></div>
<ul class="trpg-list">${(rows ?? ADVENTURES.map(([n, , lv, , , done], i) => lrow(`${n}（冒险）`, lv, done ? badge('已装', 'success') : btn('下载', { small: true, n: i === 1 ? pins.adv : 0 })))).join('')}</ul></div>`}
${filter === '官方' ? '' : `<div><div class="lib-sec" style="padding-top:0">自制${P(pins.brewsec)}</div>${brewErr}
<ul class="trpg-list">${brewRow({ title: 'Tigtone 与永不停歇的预言', author: 'Adult Swim', end: btn('下载', { small: true, n: pins.pair }) })}${brewRow({ title: 'DDEX1-01 菲兰的抗命', author: 'Adventurers League', end: badge('已装', 'success') })}${brewRow({ title: 'NPC Collection Blog', author: 'DMDave', l: [false, true], end: btn('下载', { small: true }), n: pins.single })}</ul></div>`}
<div class="lib-pager"><span>共 ${ph('n')} 项</span><span class="lib-end" style="display:flex;gap:8px">${btn('上一页', { small: true })}${btn('下一页', { small: true })}</span></div></div></div>`)
}
const page = (content, extra = {}) => ({ page: 'library', flush: true, content, ...extra })

export const screens = [
  {
    id: 'u4-1-download', group: G, title: 'U4a 下载页（官方 + 自制同一页）', flow: '13.6.4 U4a',
    goal: '一键装好官方资料；想要某本冒险 / 某个自制包时单独装', primary: '[下载]', patterns: 'Progress Indicator · Pagination · Filter', laws: 'Hick（一个大按钮）· Postel（不分语言）· Von Restorff（只有 [下载] 是主色）',
    captions: { '1440': '宽窗 · 官方和自制在同一页；顶部一行：过滤 · 搜索 · 灰掉的【增加数据源仓库】', '900': '宽窗 · 筛到"官方"', '390': '窄屏 · 同一页，操作按钮保持 ≥44 高' },
    diff: '宽窄结构相同；窄屏顶部一行折成两行。',
    notes: [
      [1, '一页两种来源', '官方和自制统一在一个下载页，同时拉取并下载 5etools 官方数据包与 homebrew 仓库的自制数据包；下载下来的都进书架标签页（官方 / 自制分开）〔R22〕', '【有】scoped.catalog(c, {remote:true}) · brewPairs.catalog()'],
      [2, '[增加数据源仓库]', '位置留在这一行最右边，灰掉并写"之后再做"；之前"粘贴网址并安装"的按钮挪到这里，这一版不做〔R71、R89〕', '推迟（B-23）'],
      [3, '官方资料（整套）', '中英自动解析，不分语言；状态 none / running / incomplete / installed；大小与剩余空间来自估算，不手写', '【有】starter.dataStatus / estimateDownload · storageEstimate'],
      [4, '[下载] / [继续]', '点后 < 400 ms 行内显示"下载中…"（见 u4-2）；完成**不在页面内提示**，只出顶部横幅（u4-4）〔R72、R75〕', '【有】tasks.startOfficial / startAdventure'],
      [5, '官方冒险 / 书', '搜索 + 分页 + 已装 ✓ / 未装；冒险可单本下载', '【有】'],
      [6, '自制目录', '行 = 名称 · 作者 · 日期 · [中|En] · [下载] / [已装 ✓]；中英配对合并成一行（D-4，见 u4-3）', '【有】brewPairs.catalog()'],
    ],
    board: tri({
      '1440': () => page(dl({ pins: { filter: 1, repo: 2, main: 3, dl: 4, adv: 5, brewsec: 6, pair: 6 } })),
      '900': () => page(dl({ filter: '官方', official: 'installed' })),
      '390': () => page(dl({})),
    }),
  },
  {
    id: 'u4-2-states', group: G, title: 'U4a 下载的各种状态（统一一种警告样式）', flow: '13.6.4 U4a',
    goal: '下载过程中每一步用户都知道在做什么，出错能恢复', primary: '[取消] / [重试] / [继续]', patterns: 'Progress Indicator · Recoverable error', laws: 'Doherty · Zeigarnik（关窗口后台继续）· Postel',
    diff: '状态板。**装了一半 / 下载失败 / 空间不足 / 某一边目录取不到，全部用同一种警告样式**（下面几块的边框与图标一样），不各做各的样式。',
    notes: [
      [1, '下载中', '行内显示"下载中…" + 进度环 + 分阶段文字（下载文件 → 整理资料 → 准备结算）+ [取消]；不显示字节百分比（D-6，P6 遗留）〔R72〕', '【有】tasks.list().progress.stage'],
      [2, '统一警告样式', '装了一半、下载失败、空间不足、某一边目录取不到用**同一种**警告样式（描边框 + 警告图标 + 原因 + 出口按钮）〔R73〕', '【有】starter.dataStatus · tasks · storageEstimate · brewPairs.catalog().errors'],
      [3, '空间不够', '警告样式 + 数字（需要 / 剩余）；不开始下载', '【有】storageEstimate'],
      [4, '失败', '警告样式 + 原因 + [重试] / [取消]', '【有】tasks error'],
      [5, '装了一半', '警告样式 +「装了一半」+ [继续]（已有文件按指纹复用）', '【有】dataStatus: incomplete'],
      [6, '一边目录取不到', '那一边的错误写在列表顶（同警告样式），另一边照常列', '【有】brewPairs.catalog().errors'],
      [7, '冒险行内进度 / 失败', '行里直接变进度或 [重试]，不弹窗', '【有】tasks.startAdventure'],
      [8, '需要升级插件', '官方"拉取更新"发现上游作者程序版本和插件里带的不一致 → 提示"要升级插件"，不给 [更新]（Q-A 甲）', '【有】library.updates.check → needs-plugin-upgrade'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('下载中', `<div class="lib-progress">${progress('下载中…', 0.35)}</div><div class="lib-steps"><span data-done="true">${icon('check', 12)} 下载文件</span><span data-on="true">整理资料</span><span>准备结算</span></div><div style="display:flex;gap:8px;justify-content:flex-end">${btn('取消', { small: true })}</div>`, 1)}
${stateCard('空间不够', errorLine('本机剩余空间不够：需要约 xxx MB，只剩 yyy MB。', btn('知道了', { small: true })), 3)}
${stateCard('下载失败', errorLine('有 3 个文件没下载下来：网络中断。', `${btn('取消', { small: true })}${btn('重试', { small: true, primary: true })}`), 4)}
${stateCard('装了一半', errorLine('官方资料装了一半，已经下好的文件会直接复用。', btn('继续', { small: true, primary: true })), 5)}
${stateCard('某一边目录取不到', errorLine('中文自制目录读取失败：网络不通（英文目录正常，下面只列了英文）。', btn('重试', { small: true })), 6)}
${stateCard('冒险行内进度 / 失败', `<ul class="trpg-list">${lrow('龙后的宝山（冒险）', '1–7 级', `<span style="display:flex;gap:8px;align-items:center">${progress('下载中…', 0.5)}</span>`)}${lrow('提亚马特崛起（冒险）', '8–15 级', `<span style="display:flex;gap:8px;align-items:center;color:var(--danger-text)">${icon('warning', 14)}失败${btn('重试', { small: true })}</span>`)}</ul>`, 7)}
${stateCard('需要升级插件', errorLine('上游资料更新了，但需要先升级插件才能用。', btn('知道了', { small: true })), 8)}</div>`,
  },
  {
    id: 'u4-3-pair', group: G, title: 'U4b 自制目录：中英配对行', flow: '13.6.4 U4b',
    goal: '找到想要的自制包，一键装；中英对照的包合成一行', primary: '[下载]', patterns: 'List · Pagination · Inline Action', laws: 'Hick（配对行一个按钮）· Postel（只有一种语言的包照样列出）· Jakob（已装 ✓）',
    diff: '宽：名称 · 作者 · 日期 · 语言 · 操作；窄：作者与日期并在第二行。',
    notes: [
      [1, '配对行（D-4）', '相同包且语言对照 → 合成一行，[中 | En] 都亮；只有一种语言 → 独立一行，另一边变灰；有歧义的各自一行并标出', '【有】brewPairs.catalog()'],
      [2, '[下载]（配对行）', '一次装中英两个文件；一边失败 → 横幅「中文装好了，英文失败」[重试英文]；有依赖时作者自动追装，完成横幅里写"同时下载了 m 个依赖包"〔R75〕', '【有】service.brewAddUrl；〔待核 #3〕'],
      [3, '只有一边语言', '[中] 或 [En] 灰；不在行上写语言标签', 'D-5'],
      [4, '没有"粘贴网址"框', '之前列表底部的"按网址安装"取消；改成 [增加数据源仓库]（灰、之后再做）', 'R71 / R89'],
    ],
    board: tri({
      '1440': () => page(dl({ filter: '自制', pins: { pair: 1, single: 3 } })),
      '900': () => page(dl({ filter: '自制', rows: [] })),
      '390': () => page(dl({ filter: '自制', rows: [] })),
    }),
  },
  {
    id: 'u4-4-banner', group: G, title: 'U4c 下载完成只用横幅（不堆叠）', flow: '13.6.4',
    goal: '下载完成后不在页面里到处提示，只在顶部给一条横幅，批量时合并', primary: '点击横幅关闭', patterns: 'Toast / 横幅', laws: 'Doherty · Hick（一次一条）· Postel（失败可重试）',
    captions: { '1440': '宽窗 · 下载完成：「刚刚下载完成了 3 个包，同时下载了 2 个额外依赖包」', '900': '宽窗 · 批量下载中：多个完成合并成一条，不堆叠刷屏', '390': '窄屏 · 一边失败：横幅 + 重试' },
    diff: '横幅位置同 P4：窗口顶部，点击消失。',
    notes: [
      [1, '完成横幅', '所有下载完成统一**不在页面内做额外提示**，只用横幅：「刚刚下载完成了 xx 个包，同时下载了 xx 个额外依赖包」〔R75〕', '【有】tasks.list；brewInstallSources 的 added'],
      [2, '不堆叠', '批量下载时多条完成合并成一条横幅（更新数字），不一条条往下叠〔R75〕', '前端'],
      [3, '失败', '统一用横幅通知（错误不占用页面、不粘在页面上）；需要重试的放在对应行上〔R84〕', '前端'],
      [4, '缺依赖的 [下载依赖包]', '点后后台静默开始，页面不弹窗；库里相应的行显示下载状况〔R74〕', '【有】service.brewInstallSources'],
    ],
    board: tri({
      '1440': () => page(dl({}), { toast: toast('刚刚下载完成了 3 个包，同时下载了 2 个额外依赖包', { kind: 'success' }) }),
      '900': () => page(dl({}), { toast: toast('刚刚下载完成了 12 个包，同时下载了 5 个额外依赖包（还有 4 个在下载）', { kind: 'success' }) }),
      '390': () => page(dl({}), { toast: toast('中文装好了，英文失败：网络中断。', { kind: 'error' }) }),
    }),
  },
  {
    id: 'u4-5-update', group: G, title: 'U4d 拉取更新（书架 → 更多 → 拉取更新）', flow: '13.6.4 U4c',
    goal: '想看看有没有新版时才去取，有更新的包才出现 [更新]', primary: '[更新]', patterns: 'More Menu · Inline Action', laws: 'Hick · Postel · Peak–End',
    captions: { '1440': '宽窗 · 书架 → 更多 → [拉取更新]（只有点它才去取更新信息）', '900': '宽窗 · 取完：有更新的包才显示 [更新]', '390': '窄屏 · 官方上游要升级插件：给提示，不给 [更新]' },
    diff: '宽窄同一结构。',
    notes: [
      [1, '入口', '书架顶部【更多】→【拉取更新】；用户点它之前不联网查更新〔R86〕', '前端'],
      [2, '自制包', '作者比较包里 `_meta.dateLastModified`；有新版的行出现 [更新]；点才下载', '【有】service.brewCheckUpdates → brewPull（B-28）'],
      [3, '官方数据', '官方数据跟上游新提交；**上游作者程序版本号与插件带的一致才可更新**，不一致提示"上游资料需要升级插件"（不给 [更新]）〔Q-A 甲〕', '【有】library.updates.check / apply（B-28）'],
      [4, '没有更新', '顶部横幅「都是最新的」', '前端'],
      [5, '完成', '横幅「更新了 n 个包」', '前端'],
    ],
    board: tri({
      '1440': () => page(shelfPage({ pins: { more: 1, moreOpen: true } }), {}),
      '900': () => page(shelfPage({ upd: true, fold: true, pins: { upd: 2, brewupd: 2 } }), { toast: toast('有 2 个包有新版', { kind: 'info' }) }),
      '390': () => page(shelfPage({}), { toast: toast('官方资料有新版，但需要先升级插件才能用。', { kind: 'error' }) }),
    }),
  },
]

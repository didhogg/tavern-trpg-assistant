// U4 下载与更新：官方（整套 + 冒险按本）、自制（目录 + 中英配对 + 更新 + 按网址安装）。流程见 P5-0 §13.6.4。
import { ADVENTURES, libPage, libTop } from '../lib/parts.mjs'
import { badge, btn, empty, errorLine, icon, infoLine, input, progress, pin, seg, stateCard } from '../lib/ui.mjs'

const G = 'U4 下载与更新'
const P = (n) => (n ? pin(n) : '')
const sub = (tab) => `<div style="padding:0 var(--sp-4) var(--sp-3)">${seg([{ label: '官方', on: tab === 'official' }, { label: '自制', on: tab === 'brew' }])}</div>`
const ph = (t) => `<span class="lib-faint">${t}</span>`
const rowEnd = (x) => `<div class="trpg-row__end">${x}</div>`
const lrow = (title, meta, end, n) => `<li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title lib-title--serif">${P(n)}${title}</div><div class="trpg-row__meta">${meta}</div></div>${rowEnd(end)}</li>`

const official = ({ state = 'none', adv = ADVENTURES, pins = {} } = {}) => {
  const action = { none: btn('下载', { primary: true, n: pins.dl }), installed: `${badge('已安装', 'success')}${btn('重新下载', { small: true })}`, incomplete: `${badge('装了一半', 'warn')}${btn('继续', { primary: true, n: pins.dl })}` }[state]
  return `<div class="lib-scroll"><div class="lib-stack">
<div class="lib-dl-main"><div class="lib-dl-main__top"><span class="lib-title">${P(pins.main)}官方资料</span><span class="lib-end">${action}</span></div>
<div class="lib-muted" style="font-size:var(--fs-sm)">全部规则书和数据，中文和英文自动一起装，不用分语言。大小约 ${ph('xxx MB')} · 本机剩余 ${ph('yyy MB')}。版本跟随插件，没有单独的"检查更新"。</div></div>
<div><div class="trpg-group trpg-group--first" style="margin-bottom:var(--sp-2);display:flex;align-items:center">书与冒险<span class="lib-end">${P(pins.refresh)}${btn('刷新书目', { small: true, ic: 'arrow-clockwise' })}</span></div>${input('', { placeholder: '搜索书名或冒险名', ic: 'magnifying-glass' })}
<ul class="trpg-list">${adv.map(([n, , lv, , , done], i) => lrow(`${n}（冒险）`, `${lv}`, done ? badge('已装', 'success') : btn('下载', { small: true, n: i === 1 ? pins.adv : 0 }))).join('')}</ul>
<div class="lib-pager"><span>共 ${ph('n')} 项</span><span class="lib-end" style="display:flex;gap:8px">${btn('上一页', { small: true })}${btn('下一页', { small: true })}</span></div></div>
</div></div>`
}

const brewRow = ({ title, author, langs, end, n, note }) => `<li class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title">${P(n)}${title}</div><div class="trpg-row__meta">${author} · ${ph('yyyy-mm-dd')}${note ? ` · ${note}` : ''}</div></div>${rowEnd(`<span class="lib-langs">${badge('中', '', langs[0] ? '' : ' data-off="true"')}${badge('En', '', langs[1] ? '' : ' data-off="true"')}</span>${end}`)}</li>`

const brew = ({ pins = {}, err = '' } = {}) => `<div class="lib-scroll"><div class="lib-stack">${err}
${input('', { placeholder: '搜索包名或作者', ic: 'magnifying-glass' })}
<div class="lib-install" style="padding:0">${P(pins.url)}${input('', { placeholder: '粘贴网址，按网址安装', ic: 'download-simple' })}${btn('安装', { primary: true })}</div>
<div style="display:flex;gap:var(--sp-3);align-items:center">${P(pins.updall)}${btn('全部更新', { small: true, ic: 'arrow-clockwise' })}${btn('刷新目录', { small: true })}</div>
<ul class="trpg-list">
${brewRow({ title: 'Tigtone 与永不停歇的预言', author: 'Adult Swim', langs: [true, true], end: btn('下载', { small: true, n: pins.dl }), n: pins.pair })}
${brewRow({ title: 'DDEX1-01 菲兰的抗命', author: 'Adventurers League', langs: [true, true], end: `${badge('已装', 'success')}` })}
${brewRow({ title: '突袭夸巴斯', author: 'DMDave', langs: [true, true], end: btn('更新', { small: true, n: pins.upd }) })}
${brewRow({ title: 'NPC Collection Blog', author: 'DMDave', langs: [false, true], end: btn('下载', { small: true }), n: pins.single })}
${brewRow({ title: '（某只有中文的包）', author: '某作者', langs: [true, false], end: btn('下载', { small: true }) })}</ul>
<div class="lib-pager"><span>共 ${ph('n')} 项</span><span class="lib-end" style="display:flex;gap:8px">${btn('上一页', { small: true })}${btn('下一页', { small: true })}</span></div>
</div></div>`

const dlTab = (tab, body) => libPage(`${libTop('download')}${sub(tab)}${body}`)

export const screens = [
  {
    id: 'u4-1-official', group: G, title: 'U4a 下载 · 官方标签', flow: '13.6.4 U4a',
    goal: '一键装好官方资料；想要某本冒险时单独装', primary: '[下载]', patterns: 'Tabs（官方 / 自制）· Progress Indicator · Pagination', laws: 'Hick（一个大按钮）· Postel（不分语言，不需要用户理解 cn / en）· Von Restorff（只有 [下载] 是主色）',
    diff: '宽、窄结构相同：上面整套大卡片，下面冒险列表（窄屏行内 [下载] 保持 ≥44 高）。',
    notes: [
      [1, '官方资料（整套）', '中英自动解析，不分语言（D-1）；状态 none / running / incomplete / installed；大小与剩余空间来自估算，不手写', '【有】starter.dataStatus / estimateDownload · storageEstimate'],
      [2, '[下载] / [重新下载] / [继续]', '点后见 u4-2：下载中、失败、空间不够；装了一半显示 [继续]（已有文件按指纹复用）', '【有】tasks.startOfficial · tasks.cancel'],
      [3, '冒险列表', '搜索 + 分页 + 已装 ✓ / 未装；书随整套，冒险可单本下载；行内进度', '【有】scoped.catalog(c, {remote:true}) · tasks.startAdventure'],
      [4, '[刷新书目]', '取最新书目；失败保留旧缓存并提示；没有单独的"检查新版"——官方版本跟插件走', '【有】directory.refresh · files.refreshFileList'],
    ],
    render: () => ({ page: 'library', flush: true, content: dlTab('official', official({ state: 'none', pins: { main: 1, dl: 2, adv: 3, refresh: 4 } })) }),
  },
  {
    id: 'u4-2-official-states', group: G, title: 'U4a 官方下载的各种状态', flow: '13.6.4 U4a',
    goal: '下载过程中每一步用户都知道在做什么，出错能恢复', primary: '[取消] / [重试] / [继续]', patterns: 'Progress Indicator · Recoverable error · Toast', laws: 'Doherty（点下载 < 400 ms 就有变化）· Zeigarnik（关窗口后后台继续，侧栏小环）· Postel',
    diff: '状态板。窄屏同样的卡片竖排。',
    notes: [
      [1, '下载中', '进度环 + 分阶段文字（下载文件 → 整理资料 → 准备结算）+ [取消]；整理阶段没有总数，环转圈；不显示字节百分比（D-6，P6 遗留）', '【有】tasks.list().progress.stage'],
      [2, '关闭窗口', '后台继续；侧栏"库"上小环 + 数字；悬停小窗只列下载中 / 失败（P4 已有）', 'P4 已有'],
      [3, '空间不够', '提示数字（需要 / 剩余）→ [知道了]，不开始下载', '【有】storageEstimate'],
      [4, '失败', '原因 + [重试] / [取消]', '【有】tasks error'],
      [5, '装了一半', '「装了一半」+ [继续]', '【有】dataStatus: incomplete'],
      [6, '完成', '提示条「资料已就绪」→ 书架出现全部书', 'P4 已有'],
      [7, '冒险行内进度 / 失败', '行里直接变进度或 [重试]，不弹窗', '【有】tasks.startAdventure'],
      [8, '书目取不到', '只在"书与冒险"那一块写原因 + [重试]，官方资料卡片照常', '【有】directory.refresh'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('下载中', `<div class="lib-progress">${progress('正在下载文件…', 0.35)}</div><div class="lib-steps"><span data-done="true">${icon('check', 12)} 下载文件</span><span data-on="true">整理资料</span><span>准备结算</span></div><div style="display:flex;gap:8px;justify-content:flex-end">${btn('取消', { small: true })}</div>`, 1)}
${stateCard('空间不够', `${errorLine('本机剩余空间不够：需要约 xxx MB，只剩 yyy MB。', btn('知道了', { small: true }))}`, 3)}
${stateCard('下载失败', `${errorLine('有 3 个文件没下载下来：网络中断。', `${btn('取消', { small: true })}${btn('重试', { small: true, primary: true })}`)}`, 4)}
${stateCard('装了一半', `<div class="lib-dl-main__top"><span class="lib-title">官方资料</span>${badge('装了一半', 'warn')}<span class="lib-end">${btn('继续', { primary: true })}</span></div><p class="lib-muted" style="margin:0;font-size:var(--fs-sm)">已经下好的文件会直接复用，不会重新下。</p>`, 5)}
${stateCard('冒险行内进度 / 失败', `<ul class="trpg-list">${lrow('龙后的宝山（冒险）', '1–7 级', `<span style="display:flex;gap:8px;align-items:center">${progress('下载中…', 0.5)}</span>`)}${lrow('提亚马特崛起（冒险）', '8–15 级', `<span style="display:flex;gap:8px;align-items:center;color:var(--danger-text)">${icon('warning', 14)}失败${btn('重试', { small: true })}</span>`)}</ul>`, 7)}
${stateCard('书目取不到', `<div class="lib-dl-main"><div class="lib-dl-main__top"><span class="lib-title">官方资料</span><span class="lib-end">${badge('已安装', 'success')}</span></div></div>${errorLine('书与冒险列表读取失败：网络不通。', btn('重试', { small: true }))}`, 8)}</div>`,
  },
  {
    id: 'u4-3-brew', group: G, title: 'U4b 下载 · 自制标签（中英配对行）', flow: '13.6.4 U4b',
    goal: '找到想要的自制包，一键装；中英对照的包合成一行', primary: '[下载]', patterns: 'Tabs · Pagination · Inline Action', laws: 'Hick（配对行一个按钮）· Postel（只有一种语言的包照样列出）· Jakob（已装 ✓、更新）',
    diff: '宽：一行 名称 · 作者 · 日期 · 语言 · 操作；窄：作者与日期并在第二行。',
    notes: [
      [1, '配对行（D-4）', '相同包且语言对照 → 合成一行，[中 | En] 都亮；只有一种语言 → 独立一行，另一边变灰；有歧义的各自一行并标出（配对用作者的规则：同目录 + 来源编号有交集，唯一匹配才配）', '【有】brewPairs.catalog()：found / ambiguous / none'],
      [2, '[下载]（配对行）', '一次装中英两个文件〔我定，待核 #3：一次装两边是否顺手〕；一边失败 → 提示「中文装好了，英文失败」[重试英文]；有依赖时作者自动追装，完成后列出「同时安装：…」', '【有】service.brewAddUrl（两个自制源各装各的，失败分别处理）'],
      [3, '已装 ✓ / [更新]', '已装的包标 ✓；[更新]（单包）/ [全部更新]；完成后「更新了 n 个包：…」；没有新版 →「都是最新的」。"有新版"标记怎么判断〔待核 #4〕：作者没有"只检查不更新"，第一版只做 [更新]，不画"有新版"角标', '【有】service.brewPull(sourceId, docIds | null)'],
      [4, '[按网址安装]', '底部输入框：粘贴网址 → 安装；网址不对 / 不是自制文件 → 原因一句话', '【有】service.brewAddUrl'],
      [5, '日期', '取自目录信息；目录里没有的显示空', '界面不算'],
      [6, '只有一边语言', '只有英文的包 [中] 灰；只有中文的包 [En] 灰；不在行上写语言标签', 'D-5'],
    ],
    render: () => ({ page: 'library', flush: true, content: dlTab('brew', brew({ pins: { pair: 1, dl: 2, upd: 3, url: 4, single: 6, updall: 3 } })) }),
  },
  {
    id: 'u4-4-brew-states', group: G, title: 'U4b 自制下载的各种状态', flow: '13.6.4 U4b',
    goal: '装包过程中出任何问题，用户知道是哪一边、怎么办', primary: '[重试] / [去书架]', patterns: 'Progress · Partial failure · Toast', laws: 'Postel · Doherty · Peak–End（完成时给出口"去书架"）',
    diff: '状态板。',
    notes: [
      [1, '下载中', '行内进度；其他行照常可点', '【有】'],
      [2, '完成', '「已装，在书架」+ [去书架]；自制包出现在书架的 Homebrew 组', '【有】'],
      [3, '一边失败（配对行）', '「中文装好了，英文失败」+ [重试英文]；已装的那一边不回滚', '【有】两个源各自的 brewAddUrl'],
      [4, '依赖追装', '作者自动追装依赖，完成后列出「同时安装：…」', '【有】'],
      [5, '一边目录取不到', '那一边的错误原样写在列表顶，另一边照常列', '【有】brewPairs.catalog().errors'],
      [6, '断网', '空态「联网后重试」+ [重试]', '【有】directory.refresh'],
      [7, '更新结果', '「更新了 n 个包：…」/「都是最新的」', '【有】brewPull'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('下载中', `<ul class="trpg-list">${lrow('Tigtone 与永不停歇的预言', 'Adult Swim', `<span style="display:flex;gap:8px;align-items:center">${progress('下载中…', 0.5)}</span>`)}</ul>`, 1)}
${stateCard('完成', `${infoLine('Tigtone 与永不停歇的预言 已装好，在书架里。', btn('去书架', { small: true }), 'lib-banner--info')}${infoLine('同时安装：（它依赖的资料包）', '', '')}`, 2)}
${stateCard('一边失败', `${errorLine('中文装好了，英文失败：网络中断。', btn('重试英文', { small: true }))}`, 3)}
${stateCard('某一边目录取不到', `${errorLine('中文自制目录读取失败：网络不通（英文目录正常，下面只列了英文）。', btn('重试', { small: true }))}`, 5)}
${stateCard('断网', empty('目录取不到，联网后重试。', btn('重试', { small: true, primary: true })), 6)}
${stateCard('更新结果', `${infoLine('更新了 2 个包：突袭夸巴斯、DDEX1-01 菲兰的抗命。', '', 'lib-banner--info')}<div style="height:6px"></div>${infoLine('都是最新的。', '', 'lib-banner--info')}`, 7)}</div>`,
  },
]

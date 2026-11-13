// P5.5 阶段 C（二）：新建条目（选类型 → 选起点 → 文字转条目）、编辑器（表单 + 预览，JSON 抽屉）、保存确认、各种状态。
// 流程见 docs/handoff/P5.5_条目编辑与自制库_执行方案.md §15。类型、分组、起点、字段都由后端从作者读（custom.entryTypes / fields），这里的是实测时读到的样子。
import { badge, btn, gray, icon, iconBtn, infoLine, input, libPage, libTop, mbody, packHead, pills, pin, sheet } from '../lib/parts.mjs'
import { empty, errorLine, field, modal, modalHead, stateCard, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'P5.5 新建条目 · 编辑器 · 保存'
const P = (n) => (n ? pin(n) : '')
const bg = (L) => ({ page: 'library', flush: true, content: libPage(`${libTop('mine')}<div class="lib-scroll"></div>`), layout: L })
const head = (back, title, extra = '') => `<header class="trpg-modal__head"><button class="trpg-modal__back" type="button">${icon('caret-left', 16)}<span>${back}</span></button><h2 class="trpg-modal__title">${title}</h2>${extra}${iconBtn('x', '关闭')}</header>`
const sel = (t, w) => `<button type="button" class="trpg-select-trigger"${w ? ` style="width:${w}px"` : ''}><span>${t}</span>${icon('caret-down', 14)}</button>`
const radio = (on) => `<span class="lib-radio" data-on="${on}"></span>`
const choice = (items) => `<div class="lib-choice">${items.map(([t, d, on, extra = '']) => `<label data-on="${!!on}">${radio(!!on)}<b>${t}</b><span>${d}${extra}</span></label>`).join('')}</div>`

// ── ① 选类型 ──
const COMMON = ['法术', '怪物', '物品', '专长', '种族', '背景']
const GROUPS = [['法术', '法术 · …'], ['怪物图鉴', '怪物 · …'], ['物品', '物品 · …'], ['职业', '职业 · 子职业 · …'], ['背景', '背景 · …'], ['专长', '专长'], ['状态 & 疾病', '…'], ['其他', '神祇 · …']]
const types = (L, n = {}) => mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${P(n.q)}${input('', { placeholder: '搜类型（71 类）', ic: 'magnifying-glass' })}</div>
<div class="lib-pad"><div class="lib-stack"><div><div class="lib-form__sec">${P(n.common)}常用（作者有构建器或转换器的）</div>${pills(COMMON.map((t) => [t, null, false]))}</div>
<div class="lib-types">${P(n.groups)}${(L === 'narrow' ? GROUPS.slice(0, 5) : GROUPS).map(([g, t]) => `<div class="lib-tgroup"><b>${g}</b><span>${t}</span></div>`).join('')}</div></div></div>`)

// ── ② 选起点 ──
const startsSpell = (n = {}, on = 0) => choice([
  [`${P(n.blank)}空白`, '只预先填好必填的 7 项：name、level、school、time、range、duration、entries', on === 0],
  [`${P(n.tpl)}作者模板`, '作者编辑器里「新法术」那一份'],
  [`${P(n.exist)}从已有的法术开始`, '在全库 969 条法术里挑一条复制', on === 2, `<div style="margin-top:6px">${input('', { placeholder: '搜法术…', ic: 'magnifying-glass' })}</div>`],
  [`${P(n.conv)}文字转条目`, '把书上、网页上的法术文字粘进来，作者的转换器转成条目'],
  ['粘贴 JSON', '已经有作者格式的 JSON'],
])
const startsDeity = () => choice([
  ['空白', '只预先填好必填项', true],
  ['从已有的神祇开始', '在全库 563 条神祇里挑一条复制'],
  ['粘贴 JSON', '已经有作者格式的 JSON'],
])
const startPage = (body, note = '') => mbody(`<div class="lib-pad"><div class="lib-stack">${note}${body}</div></div><div class="lib-ebar"><span class="lib-end">${btn('下一步', { primary: true })}</span></div>`)

// ── 文字转条目 ──
const SAMPLE = '繁彩球｜Chromatic Orb<br>一环 塑能（术士、法师）<br>施法时间：1 动作<br>射程：90 尺<br>…'
const convert = (L, n = {}) => mbody(`<div class="lib-etop">${P(n.mode)}格式 ${sel('文字', 140)}<span class="lib-end">${btn('填入作者示例', { small: true, n: n.sample })}</span></div>
${L === 'narrow' ? `<div class="lib-filter" style="padding-top:var(--sp-2)"><span class="trpg-seg" role="group"><button type="button" aria-pressed="false">粘贴文字</button><button type="button" aria-pressed="true">转换结果</button></span></div>` : ''}
<div class="lib-two">${L === 'narrow' ? '' : `<div><span class="lib-form__sec">粘贴文字</span><div class="lib-lines">${SAMPLE}</div></div>`}
<div><span class="lib-form__sec">${P(n.out)}转换结果（作者渲染）</span><div class="lib-lines"><b>繁彩球</b><span class="lib-muted">一环 塑能</span><span>施法时间 1 动作 · 射程 90 尺</span>${errorLine('作者的提醒（原样）：有 1 处没认出来的文字，留在了正文里')}</div></div></div>
<div class="lib-ebar"><span class="lib-end">${btn('重新转换')}${btn('进编辑器', { primary: true, n: n.go })}</span></div>`)

// ── 编辑器 ──
const frow = (name, control, { err, n } = {}) => `<div class="lib-frow"${err ? ' data-err="true"' : ''}><label>${P(n)}${name}${icon('info', 14)}</label>${control}${err ? `<span class="trpg-field__err">${icon('warning', 14)}${err}</span>` : ''}</div>`
const mini = (t) => `<div class="lib-json" style="padding:6px 10px">${t}</div>`
const form = ({ errs = false, house = false, n = {} } = {}) => `<div class="lib-form">
<div class="lib-form__sec">${P(n.req)}必填</div>
${frow('name', input(house ? '我的火球术' : '火焰鹦鹉'), { n: n.info })}
${frow('level', sel(errs ? '12' : '1'), errs ? { err: '应该是 0 到 9 的整数（作者结构定义）' } : {})}
${frow('school', sel('V（塑能）'))}
${frow('time', mini('[{ "number": 1, "unit": "action" }]'), { n: n.mini })}
${frow('range', mini('{ "type": "point", "distance": … }'))}
${frow('duration', mini('[{ "type": "instant" }]'))}
${frow('entries', `<div class="lib-lines">${P(n.lines)}<span>一团燃烧的羽毛从你指尖飞出……</span><span>被命中的生物进行一次敏捷豁免……</span><i>（一段一行；回车 = 新的一段）</i></div>`)}
<div class="lib-optional">${P(n.opt)}${icon('caret-right', 14)}可选字段（42）<span class="lib-end">${input('', { placeholder: '搜字段', ic: 'magnifying-glass' })}</span></div></div>`
const preview = () => `<div class="lib-edit__title">预览（作者渲染）</div><div class="lib-dbody" style="padding:0"><h3 style="margin:0">火焰鹦鹉</h3><p class="lib-muted" style="margin:2px 0 8px">1 环 塑能</p><p style="margin:0"><b>施法时间</b> 1 动作<br><b>射程</b> …<br><b>持续时间</b> 立即</p><p>一团燃烧的羽毛从你指尖飞出……</p></div>`
const json = (errs) => `<div class="lib-edit__title">JSON <span class="lib-src">平时收着，防手滑</span></div><div class="lib-json"><small>1</small>{
<small>2</small>  <b>"name"</b>: "火焰鹦鹉",
<small>3</small>  <b>"level"</b>: ${errs ? '<u>12</u>' : '1'},
<small>4</small>  <b>"school"</b>: "V",
<small>5</small>  <b>"time"</b>: [{ "number": 1, "unit": "action" }],
<small>6</small>  …
<small>9</small>}</div>`
const etop = (L, { house = false, n = {} } = {}) => `<div class="lib-etop">${P(n.where)}${badge('法术')}${badge('5e')}${house ? `<span>${icon('info', 14)} 改的是<b>房规</b>：原件不动，另存一份盖在上面</span>` : `<span>在 ${L === 'narrow' ? '' : '包 '}<b>海盗战役</b></span>`}<span class="lib-end">${btn(L === 'narrow' ? '撤销 3' : '撤销（还剩 3 步）', { small: true, ic: 'arrow-counter-clockwise', n: n.undo })}</span></div>`
const ebar = (L, { errs = false, n = {} } = {}) => `<div class="lib-ebar">${L === 'narrow' ? '' : btn('{ } JSON', { small: true, n: n.json })}${errs ? `<span class="trpg-field__err">${P(n.errs)}${icon('warning', 14)}1 处格式问题 ${btn('定位', { small: true, quiet: true })}</span>` : ''}<span class="lib-src">${P(n.draft)}草稿已自动存 · 12:03</span>${btn('取消')}${btn('保存', { primary: true, n: n.save })}</div>`
const editor = (L, o = {}) => mbody(`${etop(L, o)}${L === 'narrow'
  ? `<div class="lib-filter" style="padding-top:var(--sp-2)">${P(o.n?.tabs)}<span class="trpg-seg" role="group"><button type="button" aria-pressed="true">表单</button><button type="button" aria-pressed="false">预览</button><button type="button" aria-pressed="false">JSON</button></span></div><div class="lib-pad">${form(o)}</div>`
  : `<div class="lib-edit"><section>${form(o)}</section><section>${o.json ? json(o.errs) : preview()}</section></div>`}${ebar(L, o)}`)

// ── 保存确认（弹窗内换页）──
const diff = (rows) => `<ul class="lib-diff">${rows.map(([f, a, b]) => `<li><code>${f}</code><span>${a === null ? '' : `<s>${a}</s> → `}${b}</span></li>`).join('')}</ul>`
const confirmPage = (L, kind, n = {}) => mbody(`<div class="lib-pad"><div class="lib-stack">
${kind === 'new' ? `<p style="margin:0">${P(n.what)}新建一条法术「火焰鹦鹉」</p>${field(`${P(n.pack)}存进`, sel('海盗战役（上次用的）'), { hint: '只有新建时问；在包里点 [新建条目] 进来的不问' })}`
  : `<p style="margin:0">${P(n.what)}这次改了 ${kind === 'house' ? 2 : 3} 项：</p>${diff(kind === 'house' ? [['entries', null, '第 1 段改了 ' + btn('展开看', { small: true, quiet: true })], ['name', '火球术', '我的火球术']] : [['entries', null, '第 2 段改了 ' + btn('展开看', { small: true, quiet: true })], ['level', '1', '2'], ['range', '60 尺', '（删掉了）']])}`}
${kind === 'house' ? field(`${P(n.scope)}作用于`, sel('本战役'), { hint: '默认本战役（设置 → 库里可改默认）；之后在 ⋯ → 管理 → 房规 里整批改' }) : ''}
${kind === 'edit' ? infoLine(`${P(n.impact)}改了名字：有 3 处用到它 ${btn('展开', { small: true, quiet: true })}`) : ''}
${kind === 'new' ? errorLine('有 1 处格式问题：/level 应该是 0 到 9 的整数。仍然可以保存，作者网站也是这样') : ''}</div></div>
<div class="lib-ebar"><span class="lib-end">${btn('再改改')}${btn(kind === 'house' ? '保存房规' : '保存', { primary: true, n: n.save })}</span></div>`)

export const screens = [
  {
    id: 'u7-7-type', group: G, title: 'P5.5 新建条目 ① 选类型', flow: 'P5.5 §15 ⑦',
    goal: '在 71 类里很快找到要建的那一类', primary: '点一个类型', patterns: 'Search + Feature list（常用）+ Grouped list', laws: 'Hick（常用 6 个放最前）· Miller（按作者的页分组）· Jakob（分组名 = 作者网站的页名）',
    captions: { '1440': '宽窗 · 包弹窗里换页', '900': '宽窗 · 同上', '390': '窄屏 · 底部抽屉' },
    diff: '弹窗内换页，‹ 回包的列表。',
    notes: [
      [1, '搜类型', '按中文名搜；类型、中文名、分组全部从作者读（B5），不手写清单', '【有】custom.entryTypes(codeSet)'],
      [2, '常用', '作者有构建器或转换器的类型（实测：法术、怪物、物品、专长、种族、背景）', '【有】entryTypes → starts.convert / template'],
      [3, '按分组', '分组 = 作者网站的页（实测 18 组：怪物图鉴、法术、背景、物品……其他）；「…」表示同组还有别的类型', '【有】entryTypes → group'],
    ],
    board: tri({
      '1440': () => ({ ...bg('wide'), overlay: sheet(head('海盗战役', '新建条目：选类型'), types('wide', { q: 1, common: 2, groups: 3 })) }),
      '900': () => ({ ...bg('wide'), overlay: sheet(head('海盗战役', '新建条目：选类型'), types('wide')) }),
      '390': () => ({ ...bg('narrow'), overlay: sheet(head('海盗战役', '选类型'), types('narrow')) }),
    }),
  },
  {
    id: 'u7-8-start', group: G, title: 'P5.5 新建条目 ② 选起点', flow: 'P5.5 §15 ⑧',
    goal: '选最省事的开头：照已有的抄、文字转、或者空白', primary: '[下一步]', patterns: 'Wizard step · Radio cards', laws: 'Hick（这一类没有的起点直接不显示）· Jakob（D&D Beyond：照已有的复制最常用）',
    captions: { '1440': '宽窗 · 法术：五种起点都有', '900': '宽窗 · 神祇：作者没有模板和转换器，只剩三种', '390': '窄屏 · 法术，选了「从已有的开始」' },
    diff: '哪一类有哪几种起点由后端判断（B5），界面只按结果显示。',
    notes: [
      [1, '空白', '按作者结构定义只填必填项（B6）', '【有】custom.blankEntry'],
      [2, '作者模板', '作者编辑器自带的新条目（法术、怪物、传奇组有）', '【有】custom.template'],
      [3, '从已有的开始', '只在这一类里搜全库；复制后进编辑器，存进的是这个包', '【有】entryTypes → starts.existing（条数）'],
      [4, '文字转条目', '作者转换器（u7-9）', '【有】custom.converters'],
    ],
    board: tri({
      '1440': () => ({ ...bg('wide'), overlay: sheet(head('选类型', '新建法术：从哪开始'), startPage(startsSpell({ blank: 1, tpl: 2, exist: 3, conv: 4 }))) }),
      '900': () => ({ ...bg('wide'), overlay: sheet(head('选类型', '新建神祇：从哪开始'), startPage(startsDeity())) }),
      '390': () => ({ ...bg('narrow'), overlay: sheet(head('选类型', '新建法术'), startPage(startsSpell({}, 2))) }),
    }),
  },
  {
    id: 'u7-9-convert', group: G, title: 'P5.5 文字转条目', flow: 'P5.5 §15 ⑨',
    goal: '把现成的文字粘进来，变成条目，再进编辑器补细节', primary: '[进编辑器]', patterns: 'Two-panel（宽）/ Tabs（窄）· Preview', laws: 'Doherty（转换结果马上出来）· Postel（认不出的文字留在正文里，作者的提醒原样给）',
    captions: { '1440': '宽窗 · 左边粘贴，右边结果', '900': '宽窗 · 同上', '390': '窄屏 · 「粘贴文字 | 转换结果」两个标签' },
    diff: '宽并排，窄标签切换。',
    notes: [
      [1, '格式', '这一类作者转换器支持的格式（法术只有文字；怪物有文字和 markdown）', '【有】custom.converters → modes'],
      [2, '填入作者示例', '作者自带的示例文字（data/converter.json），看看该怎么写', '【有】custom.converterSample'],
      [3, '转换结果', '作者渲染；作者的提醒原样列出，不替用户改', '【有】custom.convert'],
      [4, '[进编辑器]', '带着结果进 u7-10，还没存', '前端'],
    ],
    board: tri({
      '1440': () => ({ ...bg('wide'), overlay: sheet(head('起点', '文字转法术'), convert('wide', { mode: 1, sample: 2, out: 3, go: 4 })) }),
      '900': () => ({ ...bg('wide'), overlay: sheet(head('起点', '文字转法术'), convert('wide')) }),
      '390': () => ({ ...bg('narrow'), overlay: sheet(head('起点', '文字转法术'), convert('narrow')) }),
    }),
  },
  {
    id: 'u7-10-editor', group: G, title: 'P5.5 编辑器（表单 + 预览；JSON 抽屉）', flow: 'P5.5 §15 ⑩',
    goal: '改一两个数，或者从头填完一条，边改边看效果', primary: '[保存]', patterns: 'Form + Live Preview · Progressive disclosure（可选字段折叠）· Drawer（JSON）', laws: 'Miller（必填 7 项在前，42 个可选折叠）· Doherty（预览即时）· Postel（格式问题标出但不硬拦）· Zeigarnik（草稿自动存）',
    captions: { '1440': '宽窗 · 表单 + 预览；JSON 收着（Q5、Q7）', '900': '宽窗 · 点了 [{ } JSON]：右边换成 JSON，和表单并排；有 1 处格式问题', '390': '窄屏 · 「表单 | 预览 | JSON」三个标签；改的是官方条目 = 房规' },
    diff: '宽：表单左、右边是预览或 JSON（二选一，避免三栏挤）；窄：三个标签。',
    notes: [
      [1, '顶行', '类别 · 版本标签 · 在哪个包（官方条目写「改的是房规，原件不动」）· 撤销（还剩 n 步，每条最多 20 步）', '【有】custom.undoSteps · undo'],
      [2, '必填字段', '字段从作者结构定义读（B4）；字段名先显示英文原名，ⓘ 里是作者的英文说明（暂不翻译）', '【有】custom.fields(codeSet, prop)'],
      [3, '结构复杂的字段', 'time、range、duration 这类对象 / 列表给小 JSON 框', '【有】fields → 类型'],
      [4, '正文 entries', '一段一行的文字框（作者的 getTextAsEntries / getEntriesAsText 互转）', '作者函数，前端接线时确认入口'],
      [5, '可选字段（42）', '折叠；可搜字段名', '【有】fields'],
      [6, '[{ } JSON]', '平时收着；打开后右边换成 JSON，语法错、结构错都标在行上', '【有】custom.validateEntry'],
      [7, '格式问题', '字段旁标红 + 底部一行 [定位]；保存时只提示，不硬拦（作者做法）', '【有】validateEntry'],
      [8, '草稿已自动存', '停手几秒自动存草稿；草稿不影响任何条目（Q15）', '【有】custom.saveDraft'],
      [9, '[保存]', '进保存确认页（u7-11）', '—'],
    ],
    board: tri({
      '1440': () => ({ ...bg('wide'), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { n: { where: 1, undo: 1, req: 2, info: 2, mini: 3, lines: 4, opt: 5, json: 6, draft: 8, save: 9 } })) }),
      '900': () => ({ ...bg('wide'), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { json: true, errs: true, n: { errs: 7 } })) }),
      '390': () => ({ ...bg('narrow'), overlay: sheet(head('火球术', '改火球术'), editor('narrow', { house: true })) }),
    }),
  },
  {
    id: 'u7-11-save', group: G, title: 'P5.5 保存确认（这次改了哪几项）', flow: 'P5.5 §15 ⑪',
    goal: '存之前看清改了什么、存到哪、管多大范围', primary: '[保存]', patterns: 'Review step（弹窗内换页，不叠层）· Diff list', laws: 'Peak–End（最后一步给确定感）· Postel（格式问题仍可存）· Tesler（存进哪个包默认上次的）',
    captions: { '1440': '宽窗 · 新建：只问存进哪个包', '900': '宽窗 · 官方条目（房规）：改了 2 项 + 作用于', '390': '窄屏 · 改自己的条目：改了 3 项；改了名字有 3 处用到它' },
    diff: '是编辑器弹窗里的下一页，‹ 回编辑器（输入都还在）。',
    notes: [
      [1, '这次改了哪几项', '字段 · 改前 → 改后；删掉的写「删掉了」；正文这类长字段只写「改了」，可展开', '【新 G1】custom.changes(codeSet, 改前, 改后)'],
      [2, '存进', '只有新建、而且不是从包里点进来的才问；默认上次用的包', '【新 G2】custom.suggestedPack'],
      [3, '作用于', '只有房规才有；默认本战役', '【有】settings.library.overrideLevel · createHouseRule'],
      [4, '有 n 处用到它', '改名 / 换包（编号会变）才出现；可展开看每一处（Q11）', '【有】backend.entryChangeImpact'],
      [5, '格式问题', '仍可保存（作者做法）', '【有】validateEntry'],
      [6, '[保存]', '约 1 秒；然后回到包的列表，顶部「已保存 · [撤销]」（u7-12）', '【有】custom.saveEntry / createHouseRule'],
    ],
    board: tri({
      '1440': () => ({ ...bg('wide'), overlay: sheet(head('火焰鹦鹉', '保存'), confirmPage('wide', 'new', { what: 1, pack: 2, save: 6 })) }),
      '900': () => ({ ...bg('wide'), overlay: sheet(head('我的火球术', '保存房规'), confirmPage('wide', 'house', { what: 1, scope: 3 })) }),
      '390': () => ({ ...bg('narrow'), overlay: sheet(head('火焰鹦鹉', '保存'), confirmPage('narrow', 'edit', { what: 1, impact: 4 })) }),
    }),
  },
  {
    id: 'u7-12-states', group: G, title: 'P5.5 状态：已保存 / 撤销 / 更新中 / 失败 / 放弃修改 / 空态', flow: 'P5.5 §15 ⑫',
    goal: '每一步都知道发生了什么，出错了东西不丢', primary: '[撤销] / [重试]', patterns: 'Toast with Undo · Recoverable error · Confirm', laws: 'Doherty（<400 ms 有反馈）· Peak–End · Postel',
    diff: '状态板。提示统一用顶部横幅（自动消失），错误横幅点了才消失。',
    notes: [
      [1, '已保存', '「已保存 · [撤销]」几秒后自动消失；编辑器里的撤销按钮一直在（Q13）', '【有】saveEntry · undo'],
      [2, '更新中', '包和条目旁的小转圈；后台停手 5 秒后统一解析，一般十几秒内消失（复制的大书二十多秒）', '【有】custom.pending'],
      [3, '后台更新没成功', '例如缺依赖：横幅写原因 + [重试]；条目原文已经存好，不会丢', '【有】library.brewQueue.last / trigger'],
      [4, '保存失败', '横幅原因；编辑器里的内容原样留着，草稿也在', '【有】'],
      [5, '放弃修改？', '有没保存的改动时按 ✕ 或 ‹：「放弃修改？草稿会留着」[继续改] [放弃]', '【有】草稿'],
      [6, '另一语言对上了谁', '后台解析完后一次性提示（只提示，不改另一边）', '【有】custom.counterpartHintFor'],
      [7, '我的库空态', '「先建一个包，再往里加条目」[新建包] [导入文件]；小字：也可以在书架里 ⋯ → 复制成我的', '前端'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('已保存（自动消失）', `<div>${toast('已保存「火焰鹦鹉」', { kind: 'success', hint: '撤销' })}</div>`, 1)}
${stateCard('更新中', `<span>火焰鹦鹉 <span class="lib-pending">${icon('arrow-clockwise', 12)}更新中</span></span>`, 2)}
${stateCard('后台更新没成功', errorLine('海盗战役后台更新没成功：缺少依赖「玩家手册」。你存的内容都在。', btn('重试', { small: true })), 3)}
${stateCard('保存失败', `<div>${toast('保存没有成功：作者存储写不进去。编辑器里的内容还在。', { kind: 'error' })}</div>`, 4)}
${stateCard('放弃修改？', modal('confirm', modalHead('放弃修改？'), `<div class="trpg-confirm"><p>还有没保存的改动。草稿会留着，之后可以在我的库顶上 [继续]。</p><div class="trpg-confirm__actions">${btn('继续改')}${btn('放弃', { danger: true })}</div></div>`).replace('class="trpg-modal-root"', 'class="trpg-modal-root" style="position:static"').replace('class="trpg-modal"', 'class="trpg-modal" style="position:static;background:none"'), 5)}
${stateCard('另一语言', infoLine('已对上英文那套里的《Fire Parrot》'), 6)}
${stateCard('我的库空态', empty('先建一个包，再往里加条目。', `${btn('新建包', { small: true, primary: true })}${btn('导入文件', { small: true })}`) + '<p class="lib-faint" style="margin:6px 0 0;font-size:12px">也可以在书架里 ⋯ → 复制成我的</p>', 7)}</div>`,
  },
]
export { gray }

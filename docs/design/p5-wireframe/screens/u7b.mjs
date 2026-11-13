// P5.5 阶段 C（二）：新建条目（选类型 → 选起点 → 文字转条目）、各种状态。编辑器、预览与保存在 u7c.mjs。
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
    id: 'u7-12-states', group: G, title: 'P5.5 状态：已保存 / 撤销 / 整理中 / 失败 / 放弃修改 / 空态', flow: 'P5.5 §15 ⑫',
    goal: '每一步都知道发生了什么，出错了东西不丢', primary: '[撤销] / [重试]', patterns: 'Toast with Undo · Recoverable error · Confirm', laws: 'Doherty（<400 ms 有反馈）· Peak–End · Postel',
    diff: '状态板。提示统一用顶部横幅（自动消失），错误横幅点了才消失。',
    notes: [
      [1, '已保存', '「已保存 · [撤销]」几秒后自动消失；编辑器里的撤销按钮一直在（Q13）', '【有】saveEntry · undo'],
      [2, '整理中', '包和条目旁的小转圈；后台停手 5 秒后统一整理，一般十几秒内消失（复制的大书二十多秒）', '【有】custom.pending'],
      [3, '后台更新没成功', '例如缺依赖：横幅写原因 + [重试]；条目原文已经存好，不会丢', '【有】library.brewQueue.last / trigger'],
      [4, '保存失败', '横幅原因；编辑器里的内容原样留着，草稿也在', '【有】'],
      [5, '放弃修改？', '有没保存的改动时按 ✕ 或 ‹：「放弃修改？草稿会留着」[继续改] [放弃]', '【有】草稿'],
      [6, '另一语言对上了谁', '后台解析完后一次性提示（只提示，不改另一边）', '【有】custom.counterpartHintFor'],
      [7, '我的库空态', '「先建一个包，再往里加条目」[新建包] [导入文件]；小字：也可以在书架里 ⋯ → 复制成我的', '前端'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('已保存（自动消失）', `<div>${toast('已保存「火焰鹦鹉」', { kind: 'success', hint: '撤销' })}</div>`, 1)}
${stateCard('整理中', `<span>火焰鹦鹉 <span class="lib-pending">${icon('arrow-clockwise', 12)}整理中</span></span>`, 2)}
${stateCard('后台更新没成功', errorLine('海盗战役后台更新没成功：缺少依赖「玩家手册」。你存的内容都在。', btn('重试', { small: true })), 3)}
${stateCard('保存失败', `<div>${toast('保存没有成功：作者存储写不进去。编辑器里的内容还在。', { kind: 'error' })}</div>`, 4)}
${stateCard('放弃修改？', modal('confirm', modalHead('放弃修改？'), `<div class="trpg-confirm"><p>还有没保存的改动。草稿会留着，之后可以在我的库顶上 [继续]。</p><div class="trpg-confirm__actions">${btn('继续改')}${btn('放弃', { danger: true })}</div></div>`).replace('class="trpg-modal-root"', 'class="trpg-modal-root" style="position:static"').replace('class="trpg-modal"', 'class="trpg-modal" style="position:static;background:none"'), 5)}
${stateCard('另一语言', infoLine('已对上英文那套里的《Fire Parrot》'), 6)}
${stateCard('我的库空态', empty('先建一个包，再往里加条目。', `${btn('新建包', { small: true, primary: true })}${btn('导入文件', { small: true })}`) + '<p class="lib-faint" style="margin:6px 0 0;font-size:12px">也可以在书架里 ⋯ → 复制成我的</p>', 7)}</div>`,
  },
]
export { gray }

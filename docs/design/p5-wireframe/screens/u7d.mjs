// P5.5 阶段 C（四）：双语编辑器（驾驶员 2026-11-13 定第二版）。
// 宽屏：左栏 = 主编辑语言的表单；右侧栏 = ［English | JSON | 预览］，一次看一种，除了预览都能编辑；两栏逐行对齐、一起滚；［⇄ 左右对调］。
// 窄屏：上半栏 = 另一语言 / JSON / 预览（可收起、可拖高度），下半栏 = 主语言表单。
// 每栏只写自己的语言：中文栏没有「英文名」，作者格式要的 ENG_name 存的时候按英文那一条的名字自动写。
// 删掉了：每个字段旁的 (En) 小标与浮窗、每行「← 填」、顶部「中文 / English」切换。
// 后端：library.bilingual（C2–C9）、custom.fields（shape + label + labels，C10）；待接：ENG_name 自动写、两边一起存（驾驶员 2026-11-13 批准）。
import { stateCard, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'
import { P, badge, bar, bg, btn, cm, head, icon, mbody, spellForm, spellRender, split, vsplit } from '../lib/editor.mjs'
import { sheet } from '../lib/parts.mjs'

const G = 'P5.5 编辑器 · 双语 · 对比'
const RIGHT = ['English', 'JSON', '预览']
const etop = (L, n = {}) => `<div class="lib-etop">${L === 'narrow' ? '' : `${badge('法术')}${badge('5e')}<span>在 <b>海盗战役</b></span>`}<span class="lib-end">${btn(L === 'narrow' ? '撤销 3' : '撤销（还剩 3 步）', { small: true, ic: 'arrow-counter-clockwise', n: n.undo })}${L === 'narrow' ? '' : btn('⇄ 左右对调', { small: true, n: n.swap })}</span></div>`
const ebar = (L, n = {}) => bar(`<span class="lib-src">${P(n.draft)}草稿已自动存${L === 'narrow' ? '' : ' · 12:03'}</span><span class="lib-end">${L === 'narrow' ? '' : btn('从中文版填入空着的…', { small: true, quiet: true, n: n.fill })}${btn('取消')}${btn('完成', { primary: true, n: n.done })}</span>`)
const json = () => `<div style="flex:1;min-height:280px;display:flex;flex-direction:column">${cm({ err: false }).replace('class="lib-cm"', 'class="lib-cm" style="margin:0"')}</div>`
const sideBody = (L, on, o = {}) => (on === 'English' ? spellForm(L, { lang: 'en', diff: !o.empty, empty: o.empty, n: o.n ?? {} }) : on === 'JSON' ? json() : spellRender())
const sideNote = (on) => (on === 'English' ? '《海盗战役》En' : on === 'JSON' ? '中文这一条 · 和表单同步' : '只能看')

/** 编辑器。o.on = 右栏 / 上半栏现在的标签；o.top = 窄屏上半栏开着。 */
const editor = (L, { on = 'English', top = true, emptyEn = false, n = {} } = {}) => mbody(`${etop(L, n)}${L === 'narrow'
  ? vsplit({ open: top, tabs: RIGHT, on, body: sideBody(L, on, { empty: emptyEn }) }, '中文', spellForm(L, { lang: 'zh', diff: !emptyEn, n }), n)
  : split('中文', spellForm(L, { lang: 'zh', diff: !emptyEn, n }), { tabs: RIGHT, on, note: sideNote(on), body: sideBody(L, on, { empty: emptyEn, n: { select: n.diff } }) }, n)}${ebar(L, n)}`)

// 从中文版填入空着的：在编辑器弹窗里换一页（不叠第二层）
const opt = (on, title, sub, items) => `<div class="lib-fillopt" data-on="${on}"><div style="display:flex;gap:8px;align-items:center"><span class="lib-radio" data-on="${on}" style="margin:0"></span><b>${title}</b></div><span class="lib-muted" style="font-size:12px">${sub}</span><ul class="lib-diff">${items.map(([k, a, b]) => `<li><code>${k}</code><span>${a ? `<s>${a}</s> → ` : ''}${b}</span></li>`).join('')}</ul></div>`
const fillPage = (L, n = {}) => mbody(`<div class="lib-pad" style="overflow:auto"><div style="display:grid;gap:12px;max-width:640px">
${opt(true, `${P(n.empty)}只填英文里空着的（推荐）`, '英文这一条还空着的 6 项，用中文版的填上；已经写好的不动', [['Level', '', 'Level 1'], ['School', '', 'Evocation'], ['Casting Time', '', '1 Action'], ['Range', '', 'Point · 150 feet'], ['Components', '', 'v s'], ['Text', '', '一团燃烧的羽毛……（中文原文，等你翻译）']])}
${opt(false, `${P(n.all)}全部换成中文版的`, '另外已经写了的 1 项也换掉', [['Text', 'A burning feather……', '一团燃烧的羽毛……']])}
<p class="lib-faint" style="margin:0;font-size:12px">${P(n.own)}名字两边各写各的，不填；来源、页码、编号由包和这一条自己定。</p></div></div>
${bar(`${btn('回去', { ic: 'caret-left' })}<span class="lib-end">${btn(L === 'narrow' ? '填入 6 项' : '填入 6 项（能撤销）', { primary: true, n: n.go })}</span>`)}`)

export const screens = [
  {
    id: 'u7-10-editor', group: G, title: 'P5.5 编辑器：左栏中文表单 · 右侧栏 English / JSON / 预览（窄屏上下分）', flow: 'P5.5 §15 ⑩ · §16.1',
    goal: '中文、英文各在自己那一栏写，一眼对得上；改完点［完成］', primary: '[完成]', patterns: 'Split view（两栏等宽、逐行对齐）· Module tabs（右栏一次一种）· Titled sections · Forms（上方标签）', laws: 'Jakob（翻译工具惯例：一栏一种语言、左右对齐）· Hick（另一语言只在一个地方）· Miller（基本 / 施法 / 效果 分块）· Tesler（英文名系统自动写，不写两遍）',
    captions: { '1440': '宽窗 · 左中文、右 English，两边都能改；环节两边不一样标 ≠', '900': '宽窗 · 右栏切到 JSON：直接改代码，和左边表单同步', '390': '窄屏 · 上半栏 English（能改、可收起、可拖高度），下半栏中文' },
    diff: '宽：左右两栏一起滚；窄：上下两栏，上半栏收起后只剩一行标签。没有跳页。',
    notes: [
      [1, '左栏 = 主编辑语言', '默认跟界面语言（中文界面左边中文）；只写中文自己的内容，没有「英文名」', '【有】custom.fields（label、labels）'],
      [2, '右侧栏标签', 'English / JSON / 预览，一次一种；English、JSON 能直接改，预览只能看', '【有】bilingual.otherEntry；CodeMirror 6'],
      [3, '⇄ 左右对调', '把英文放到左边当主编辑语言（见 u7-10d）', '—'],
      [4, '名字', '每栏写自己的名字；中文条目要记的英文名（作者 ENG_name）存的时候按英文那一条的 Name 自动写', '**待接**：ENG_name 自动写（已批准）'],
      [5, '≠', '不用翻译的项（数字、下拉、勾选）两边不一样才标黄；两栏同一行都标', '【有】bilingual.mismatches（C9）'],
      [6, '分块', '基本 / 施法 / 效果 / 更多选项，两栏同样的顺序，逐行对齐、一起滚', '【有】字段表顺序'],
      [7, '从中文版填入空着的…', '把左栏有、右栏空着的项填过去；先列出改哪几项（u7-10c）', '【有】bilingual.fillPlan / fill（C8）'],
      [8, '[完成]', '两边一起存；英文那边还没有包就自动建同编号的包；跳到预览兼保存（u7-11）', '**待接**：两边一起存（已批准）；【有】saveInLanguage'],
      [9, '窄屏上下两栏', '上半栏 English / JSON / 预览，能收起成一行、拖分隔条调高度；下半栏中文', '—'],
    ],
    board: tri({
      '1440': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { n: { left: 1, tabs: 2, swap: 3, name: 4, diff: 5, select: 5, more: 6, fill: 7, done: 8 } })) }),
      '900': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { on: 'JSON' })) }),
      '390': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('narrow', { n: { tabs: 9, grip: 9 } })) }),
    }),
  },
  {
    id: 'u7-10c-compare', group: G, title: 'P5.5 右栏预览 · 从中文版填入空着的 · 窄屏上半栏收起', flow: 'P5.5 §16.1',
    goal: '看成品样子不离开表单；一次把中文版能用的填到英文里', primary: '[填入 6 项]', patterns: 'Module tabs · Preview before commit · Undo', laws: 'Postel（先说改什么再改）· Tesler（默认只填空着的）· Fitts（收起后表单占满）',
    captions: { '1440': '宽窗 · 右栏切到预览：作者渲染的样子，只能看', '900': '宽窗 · ［从中文版填入空着的…］：弹窗里换一页，先列出会改哪几项', '390': '窄屏 · 上半栏收起：只剩一行标签，中文表单占满' },
    diff: '填入页是弹窗里换页，不叠第二层。',
    notes: [
      [1, '预览', '作者渲染器画的样子；跟着正在改的内容变；只能看', '【有】作者渲染器'],
      [2, '只填英文里空着的（推荐）', '只动英文这一条还空着的项；说明会先放中文原文，等你翻译', '【有】fillPlan.onlyEmpty'],
      [3, '全部换成中文版的', '已经写了的也换掉；写清楚会改哪几项', '【有】fillPlan.all'],
      [4, '不跟着填', '名字两边各写各的；来源、页码、编号由包和这一条自己定', '【有】lang-fill OWN'],
      [5, '[填入 n 项]', '回到编辑器，顶部「已填入 6 项 · [撤销]」；还没存', '【有】bilingual.fill'],
      [6, '窄屏收起', '上半栏收成一行标签；点任意标签或「展开」再打开', '—'],
    ],
    board: tri({
      '1440': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { on: '预览', n: { tabs: 1 } })) }),
      '900': () => ({ ...bg(), overlay: sheet(head('火焰鹦鹉', '从中文版填入空着的'), fillPage('wide', { empty: 2, all: 3, own: 4, go: 5 })) }),
      '390': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('narrow', { top: false, n: { tabs: 6 } })) }),
    }),
  },
  {
    id: 'u7-10d-states', group: G, title: 'P5.5 双语编辑的几种情况', flow: 'P5.5 §16.1',
    goal: '英文还没有、对不上、刚填完、对调、JSON 写错时，界面怎么样', primary: '—', patterns: 'Empty state · Toast + Undo · Inline error', laws: 'Postel · Peak–End（撤销给安全感）',
    diff: '状态板。',
    notes: [
      [1, '英文还没有这一条', '右栏就是一张空的英文表单，不弹「要不要建」；写了、［完成］时英文那边没有包就自动建', '【有】otherEntry → none；saveInLanguage（C7）'],
      [2, '刚填完', '「已填入 6 项 · [撤销]」，几秒后消失；编辑器的撤销也能退', '【有】编辑器撤销（B2）'],
      [3, '对上了好几条', '配对规则认不出英文是哪一条（例如同名两条）：右栏先让你挑，不猜', '【有】otherEntry → ambiguous'],
      [4, '左右对调后', '英文在左当主编辑语言，右栏标签变成［中文 | JSON | 预览］', '—'],
      [5, 'JSON 写错', '错误标在行上；改好之前表单那边这一项先不跟着变，不丢你写的', '【有】validateEntry + json-source-map'],
    ],
    board: () => `<div class="ds-root wf-states wf-states--3">${stateCard('英文还没有这一条', `<div class="lib-pane__head lib-pane--side" style="padding:0 0 6px">${btn('English', { small: true, primary: true })}<span class="lib-faint">《海盗战役》En</span></div><p class="lib-faint" style="margin:6px 0 0">Name * [　　　　]　Level * [ — ▾ ]　School * [ — ▾ ] ……（空的英文表单）</p>`, 1)}
${stateCard('刚填完', `<div style="position:static">${toast('已填入 6 项', { kind: 'success', hint: '［撤销］' })}</div>`, 2)}
${stateCard('对上了好几条', `<p style="margin:0 0 6px">英文版里有 2 条可能是它，选一条：</p><div class="lib-crow"><b>Fire Parrot</b><span class="lib-faint">海盗战役 En · 第 3 条</span>${btn('用这条', { small: true })}</div><div class="lib-crow"><b>Fire Parrot</b><span class="lib-faint">海盗战役 En · 第 9 条</span>${btn('用这条', { small: true })}</div>`, 3)}
${stateCard('左右对调后', `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px"><div><b>English</b><p class="lib-faint" style="margin:4px 0 0">Name * [Fire Parrot]</p></div><div class="lib-pane--side" style="padding:4px 6px">${btn('中文', { small: true, primary: true })} JSON 预览<p class="lib-faint" style="margin:4px 0 0">名字 * [火焰鹦鹉]</p></div></div>`, 4)}
${stateCard('JSON 写错', `<div style="display:flex;flex-direction:column;min-height:120px">${cm({ short: true }).replace('class="lib-cm"', 'class="lib-cm" style="margin:0"')}</div><p style="margin:6px 0 0;font-size:12px;color:var(--danger-text)">${icon('warning', 12)} 第 3 行：环节应该是 0 到 9 的整数。改好之前表单那边先不跟着变。</p>`, 5)}</div>`,
  },
]

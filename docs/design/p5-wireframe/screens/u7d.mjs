// P5.5 阶段 C（四）：双语编辑器（方案 §16.1，驾驶员 2026-11-13 定）。
// ［中文 | English］切换 + (?)；［对比］抽屉（宽屏右侧，标签：另一语言 / JSON / 预览；窄屏跳页）；字段旁 (En) 小标点开看另一语言的值；
// ［从英文版填入…］先说改哪几项再填，能撤销。原来单独的 JSON 竖条合进对比抽屉。
// 后端：library.bilingual（C2–C9，94429a7）、custom.fields（shape + label + labels，C10）。
import { stateCard, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'
import { P, badge, bar, bg, btn, cm, head, icon, iconBtn, mbody, spellForm, spellRender } from '../lib/editor.mjs'
import { sheet } from '../lib/parts.mjs'

const G = 'P5.5 编辑器 · 双语 · 对比'
const langSeg = (lang, n) => `<span class="trpg-seg" role="group">${P(n)}<button type="button" aria-pressed="${lang === 'zh'}">中文</button><button type="button" aria-pressed="${lang === 'en'}">English</button></span>`
const helpPop = (n) => `<div class="lib-help">${P(n)}<b>选哪边就改哪边的语言。</b><br>中文、英文是同一个包的两个文件，同一条一一对应。切到 English 就是改英文那一份；英文那边还没有这个包，存的时候自动建一个同编号的。</div>`

/** 编辑器顶栏。o.cmp = 对比抽屉开着；o.help = (?) 说明打开。 */
const etop = (L, { lang = 'zh', cmp = false, help = false, n = {} } = {}) => `<div class="lib-etop">${L === 'narrow' ? '' : `${badge('法术')}${badge('5e')}`}${langSeg(lang, n.lang)}${iconBtn('question', '中文 / English 是什么意思', n.help)}${help ? helpPop() : ''}<span class="lib-end">${L === 'narrow' ? '' : btn(lang === 'zh' ? '从英文版填入…' : '从中文版填入…', { small: true, quiet: true, n: n.fill })}${btn(L === 'narrow' ? '撤销 3' : '撤销（还剩 3 步）', { small: true, ic: 'arrow-counter-clockwise' })}${btn(cmp ? '收起对比' : '对比', { small: true, n: n.cmp, primary: cmp })}</span></div>`
const ebar = (n = {}) => bar(`<span class="lib-src">${P(n.draft)}草稿已自动存 · 12:03</span><span class="lib-end">${btn('取消')}${btn('完成', { primary: true, n: n.done })}</span>`)

// 对比抽屉：另一语言的同一条，按表单字段逐行对齐
const crow = (k, v, { diff, fill = true, note } = {}) => `<div class="lib-crow"${diff ? ' data-diff="true"' : ''}><b>${k}</b><span>${v}${note ? `<small>${note}</small>` : ''}</span>${fill ? btn('← 填', { small: true, quiet: true }) : '<span></span>'}</div>`
const otherRows = (n = {}) => `${crow('Name', 'Fire Parrot', { note: '会填进中文的「英文名」，中文名不动' })}${crow(`${P(n.diff)}Level`, 'Level 2', { diff: true, note: '中文是 1 环：两边不一样（表单里该项旁标 ≠）' })}${crow('School', 'Evocation', { fill: false })}${crow('Casting Time', '1 Action', { fill: false })}${crow('Range', 'Point · 150 feet', { fill: false })}${crow('Components', '<span class="lib-mono">v s</span>', { fill: false })}${crow('Text', 'A burning feather darts from your fingertip toward a creature you can see within range…')}${crow('At Higher Levels', 'When you cast this spell using a spell slot of 2nd level or higher…', { note: '中文这一项还空着' })}`
const ctabs = (on, tabs = ['英文版', 'JSON', '预览'], n) => `<span class="trpg-seg" role="group">${P(n)}${tabs.map((t) => `<button type="button" aria-pressed="${t === on}">${t}</button>`).join('')}</span>`
const drawer = (on, n = {}) => `<aside class="lib-cdrawer"><div class="lib-cdrawer__head">${ctabs(on, undefined, n.tabs)}<span class="lib-end">${iconBtn('x', '收起对比')}</span></div><div class="lib-cdrawer__body">${
  on === '英文版' ? `<p class="lib-faint" style="margin:0 0 6px;font-size:12px">《海盗战役》En · 同一条：Fire Parrot</p>${otherRows(n)}`
  : on === 'JSON' ? `<p class="lib-faint" style="margin:0 0 6px;font-size:12px">${P(n.json)}和表单同步：改哪边，另一边跟着变</p><div style="flex:1;min-height:260px;display:flex;flex-direction:column">${cm({ err: false, short: true }).replace('class="lib-cm"', 'class="lib-cm" style="margin:0"')}</div>`
  : `<p class="lib-faint" style="margin:0 0 6px;font-size:12px">${P(n.prev)}作者渲染的样子（还没存）</p>${spellRender()}`}</div></aside>`
const editor = (L, { lang = 'zh', cmp = null, help = false, pop = null, empty = false, n = {} } = {}) => mbody(`${etop(L, { lang, cmp: !!cmp, help, n })}<div class="lib-eshell"><div class="lib-pad">${spellForm(L, { lang, other: !empty, pop, empty, n })}</div>${cmp && L !== 'narrow' ? drawer(cmp, n) : ''}</div>${ebar(n)}`)

// 窄屏：对比是一页（‹ 返回表单）
const narrowCmp = (on, n = {}) => mbody(`<div class="lib-ctabs">${ctabs(on, undefined, n.tabs)}</div><div class="lib-cdrawer__body" style="background:var(--bg-sunk);padding-top:var(--sp-2)">${on === '英文版' ? otherRows(n) : spellRender()}</div>${bar(`<span class="lib-end">${btn('返回表单', { primary: true, ic: 'caret-left' })}</span>`)}`)

// 从英文版填入：在编辑器弹窗里换一页（不叠第二层）
const opt = (on, title, sub, items) => `<div class="lib-fillopt" data-on="${on}"><div style="display:flex;gap:8px;align-items:center"><span class="lib-radio" data-on="${on}" style="margin:0"></span><b>${title}</b></div><span class="lib-muted" style="font-size:12px">${sub}</span><ul class="lib-diff">${items.map(([k, a, b]) => `<li><code>${k}</code><span>${a ? `<s>${a}</s> → ` : ''}${b}</span></li>`).join('')}</ul></div>`
const fillPage = (L, n = {}) => mbody(`<div class="lib-pad" style="overflow:auto"><div style="display:grid;gap:12px;max-width:640px">
${opt(true, `${P(n.empty)}只填空着的（推荐）`, '中文里还空着的 3 项，用英文版的填上；已经写好的不动', [['英文名', '', 'Fire Parrot'], ['升环施法', '', 'When you cast this spell using…（英文原文）'], ['伤害类型', '', '火焰']])}
${opt(false, `${P(n.all)}全部换掉`, '另外 2 项已经写了的也换成英文版的：说明会变成英文原文，等你再译', [['环节', '1 环', '2 环'], ['说明', '一团燃烧的羽毛……', 'A burning feather darts……']])}
<p class="lib-faint" style="margin:0;font-size:12px">${P(n.own)}中文名、来源、页码不跟着填（由这个包和这一条自己定）。</p></div></div>
${bar(`${btn('回去', { ic: 'caret-left' })}<span class="lib-end">${btn(L === 'narrow' ? '填入 3 项' : '填入 3 项（能撤销）', { primary: true, n: n.go })}</span>`)}`)

export const screens = [
  {
    id: 'u7-10-editor', group: G, title: 'P5.5 编辑器：表单 + ［中文 | English］+ 对比抽屉', flow: 'P5.5 §15 ⑩ · §16.1',
    goal: '改中文时随手看英文原文、一项项填过来；改完点［完成］', primary: '[完成]', patterns: 'Form · Module tabs（抽屉里一次看一种）· Side drawer · Progressive disclosure', laws: 'Hick（抽屉一次只显示一种）· Jakob（字段和作者中文版编辑器一样）· Fitts（主按钮右下）',
    captions: { '1440': '宽窗 · 中文编辑 + 对比抽屉开在「英文版」：逐行对齐，← 填；环节两边不一样标黄', '900': '宽窗 · 抽屉收着；点了中文名旁的 (En)：浮窗显示英文版现在的值', '390': '窄屏 · 点了 (?)：说明「选哪边就改哪边」' },
    diff: '宽：对比抽屉在表单右边，再点［收起对比］收回；窄：［对比］跳到对比页（u7-10c）。没有右边常驻预览——预览在［完成］之后（u7-11）。',
    notes: [
      [1, '中文 | English', '选哪边就改哪边的语言；切过去就是那一边的表单。另一边还没有这一条时不额外提示（见 u7-10d）', '【有】bilingual.otherEntry · saveInLanguage（C6、C7）'],
      [2, '(?)', '点开小说明：选哪边改哪边；英文那边没有包，存的时候自动建同编号的包', '—'],
      [3, '从英文版填入…', '先说会改哪几项，再选「只填空着的 / 全部换掉」（u7-10c）', '【有】bilingual.fillPlan / fill（C8）'],
      [4, '对比', '打开 / 收起右侧抽屉；标签：英文版 / JSON / 预览，一次看一种', '—'],
      [5, '英文版标签', '按表单字段逐行对齐；能填的行尾［← 填］；不用翻译的字段（数字、下拉、勾选）两边不一样标黄', '【有】otherEntry · mismatches（C9）'],
      [6, '(En) 小标', '字段名旁；另一语言有值才出现。悬停或点按出浮窗（见 900）', '【有】otherEntry'],
      [7, '字段与控件', '中文名、控件种类、下拉中文选项（1 环、塑能、动作、尺）来自字段表；成分的 v / s / m 作者没有中文名，照实显示，之后由翻译补', '【有】custom.fields（label、labels，C10）'],
      [8, '草稿已自动存', '停手几秒自动存；草稿不影响任何条目', '【有】custom.saveDraft'],
      [9, '[完成]', '跳到预览兼保存页（u7-11）', '—'],
    ],
    board: tri({
      '1440': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { cmp: '英文版', n: { lang: 1, fill: 3, cmp: 4, diff: 5, label: 6, select: 7, draft: 8, done: 9 } })) }),
      '900': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { pop: 'name' })) }),
      '390': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('narrow', { help: true, n: { help: 2 } })) }),
    }),
  },
  {
    id: 'u7-10c-compare', group: G, title: 'P5.5 对比抽屉的 JSON / 预览 · 从英文版填入 · 窄屏对比页', flow: 'P5.5 §16.1',
    goal: '要看代码或成品样子时不离开表单；一次把英文版能用的都填进来', primary: '[填入 3 项]', patterns: 'Module tabs · Preview before commit · Undo', laws: 'Postel（先说改什么再改）· Tesler（默认只填空着的）',
    captions: { '1440': '宽窗 · 抽屉切到 JSON：代码编辑框和表单同步（原来的 JSON 竖条合进来了）', '900': '宽窗 · ［从英文版填入…］：弹窗里换一页，先列出会改哪几项', '390': '窄屏 · ［对比］跳到对比页，‹ 返回表单' },
    diff: '填入页、窄屏对比页都是弹窗里换页，不叠第二层。',
    notes: [
      [1, 'JSON 标签', 'CodeMirror 6 代码编辑框，和表单双向同步；错误标在行上', 'CodeMirror 6 ·【有】validateEntry'],
      [2, '只填空着的（推荐）', '只动还空着的项；名字规则：英文 name 进中文的「英文名」，不覆盖中文名', '【有】fillPlan.onlyEmpty'],
      [3, '全部换掉', '已经写了的也换成英文版的（说明会变成英文原文）；写清楚会改哪几项', '【有】fillPlan.all'],
      [4, '不跟着填', '中文名、来源、页码、编号由这个包和这一条自己定', '【有】lang-fill OWN'],
      [5, '[填入 n 项]', '回到表单，顶部「已填入 3 项 · [撤销]」；还没存', '【有】bilingual.fill'],
      [6, '窄屏对比页', '标签同宽屏；英文版每行［← 填］；‹ 返回表单，位置不丢', '—'],
    ],
    board: tri({
      '1440': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { cmp: 'JSON', n: { json: 1 } })) }),
      '900': () => ({ ...bg(), overlay: sheet(head('火焰鹦鹉', '从英文版填入'), fillPage('wide', { empty: 2, all: 3, own: 4, go: 5 })) }),
      '390': () => ({ ...bg(), overlay: sheet(head('表单', '对比'), narrowCmp('英文版', { tabs: 6 })) }),
    }),
  },
  {
    id: 'u7-10d-states', group: G, title: 'P5.5 双语编辑的几种情况', flow: 'P5.5 §16.1',
    goal: '另一边没有、对不上、刚填完时，界面怎么说', primary: '—', patterns: 'Empty state · Toast + Undo', laws: 'Postel · Peak–End（撤销给安全感）',
    diff: '状态板。',
    notes: [
      [1, '切到 English，英文还没有这一条', '就是一张空的英文表单，不弹「要不要建」；［从中文版填入…］能用；存的时候英文那边没有包就自动建', '【有】otherEntry → none；saveInLanguage（C7）'],
      [2, '刚填完', '「已填入 3 项 · [撤销]」，几秒后消失；编辑器里的撤销也能退', '【有】编辑器撤销（B2 草稿）'],
      [3, '对比抽屉：英文版还没有这一条', '一句话 + ［切到 English 写］', '【有】otherEntry → none'],
      [4, '对比抽屉：对上了好几条', '配对规则认不出是哪一条（例如同名两条）：列出来，不猜', '【有】otherEntry → ambiguous'],
      [5, '窄屏 (En) 小标', '点按出底部小抽屉：英文版现在的值 + ［复制］［填进这一项］', '—'],
    ],
    board: () => `<div class="ds-root wf-states wf-states--3">${stateCard('切到 English：英文还没有这一条', `<div class="lib-etop" style="border:0;padding:0">${langSeg('en')}${iconBtn('question', '说明')}<span class="lib-end">${btn('从中文版填入…', { small: true, quiet: true })}</span></div><p class="lib-faint" style="margin:6px 0 0">（下面是空的英文表单：Name、Level、School……）</p>`, 1)}
${stateCard('刚填完', `<div style="position:static">${toast('已填入 3 项', { kind: 'success', hint: '［撤销］' })}</div>`, 2)}
${stateCard('抽屉：英文版还没有这一条', `<p style="margin:0 0 8px">英文版里还没有这一条。</p>${btn('切到 English 写', { small: true })}`, 3)}
${stateCard('抽屉：对上了好几条', `<p style="margin:0 0 6px">英文版里有 2 条可能是它，认不出是哪一条：</p><div class="lib-crow"><b>Fire Parrot</b><span class="lib-faint">海盗战役 En · 第 3 条</span><span></span></div><div class="lib-crow"><b>Fire Parrot</b><span class="lib-faint">海盗战役 En · 第 9 条</span><span></span></div>`, 4)}
${stateCard('窄屏：点了 (En)', `<div class="lib-pop" style="position:static;width:auto"><div class="lib-pop__head">英文版现在是</div><div class="lib-pop__val">Fire Parrot</div><div class="lib-pop__acts">${btn('复制', { small: true, ic: 'copy' })}${btn('填进这一项', { small: true, primary: true })}</div></div>`, 5)}</div>`,
  },
]

// P5.5 阶段 C（三）：起点的三个页面（作者模板 / 从已有的挑 / 粘贴 JSON）、编辑器（只有表单；JSON 在侧边，点开才出来）、预览兼保存。
// 驾驶员 2026-11-13：表单不塞代码、字段用中文名、每个字段画成能一眼看懂的控件；点［完成］才跳到预览；JSON 用代码编辑框（CodeMirror 6，§8.1）。
// 字段、控件种类来自后端字段表（custom.fields：shape + label，作者结构定义 + 作者中文版）。
import { badge, btn, gray, icon, iconBtn, input, mbody, pills, pin, sheet, table, count, libPage, libTop } from '../lib/parts.mjs'
import { errorLine, infoLine } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'P5.5 新建条目 · 编辑器 · 保存'
const P = (n) => (n ? pin(n) : '')
const bg = () => ({ page: 'library', flush: true, content: libPage(`${libTop('mine')}<div class="lib-scroll"></div>`) })
const head = (back, title) => `<header class="trpg-modal__head"><button class="trpg-modal__back" type="button">${icon('caret-left', 16)}<span>${back}</span></button><h2 class="trpg-modal__title">${title}</h2>${iconBtn('x', '关闭')}</header>`
const sel = (t, w) => `<button type="button" class="trpg-select-trigger"${w ? ` style="width:${w}px;flex:none"` : ''}><span>${t}</span>${icon('caret-down', 14)}</button>`
const ck = (t, on) => `<span class="trpg-check" data-on="${on}"><span class="trpg-check__box">${on ? icon('check', 12) : ''}</span>${t}</span>`
const lab = (t, { req, en, n } = {}) => `<label${en ? ' data-en="true"' : ''}>${P(n)}${t}${req ? '<small>*</small>' : ''}${icon('info', 13)}</label>`
const bar = (inner) => `<div class="lib-ebar">${inner}</div>`

// 作者渲染的法术块（示意；真实由作者渲染器画）
const spellRender = (name = '火焰鹦鹉', sub = '1 环 塑能') => `<div class="lib-dbody" style="padding:0"><h3 style="margin:0">${name}</h3><p class="lib-muted" style="margin:2px 0 8px">${sub}</p><p style="margin:0"><b>施法时间</b> 1 动作<br><b>射程</b> 150 尺<br><b>成分</b> 言语、姿势<br><b>持续时间</b> 立即</p><p>一团燃烧的羽毛从你指尖飞出，命中射程内一个你能看见的生物……</p><p>被命中的生物进行一次敏捷豁免，失败受到 <span class="lib-tag">3d6</span> 火焰伤害。</p></div>`

// ── 起点：作者模板 ──
const tplPage = () => mbody(`<div class="lib-pad">${infoLine('这是作者编辑器里「新法术」的样子。用它开始，表单里会预先填好这些内容。')}<div style="height:12px"></div>${spellRender('新法术', '1 环 塑能')}</div>${bar(`<span class="lib-end">${btn('换一种起点')}${btn('用这个开始', { primary: true, n: 1 })}</span>`)}`)

// ── 起点：从已有的挑 ──
const SP = [['火球术', '3 环', '塑能', 'PHB'], ['燃烧之手', '1 环', '塑能', 'PHB'], ['魔法飞弹', '1 环', '塑能', 'PHB'], ['冰锥术', '5 环', '塑能', 'PHB'], ['火焰箭', '戏法', '塑能', 'PHB']]
const pickList = (sel = '燃烧之手') => mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${P(1)}${input('火', { ic: 'magnifying-glass' })}</div>${pills([['全部法术', 969, true], ['戏法', 44], ['1 环', 79], ['2 环', 103], ['…', null]])}${table([{ label: '名称', sort: 'asc', can: 1 }, { label: '环阶', can: 1 }, { label: '学派', can: 1 }, { label: '来源', can: 1 }], SP.map(([a, b, c, d]) => ({ cells: [a, b, c, gray(d)], sel: a === sel })))}${count('找到 5 条（只显示法术）')}`)
const pickPreview = () => mbody(`<div class="lib-pad"><div class="lib-dbody" style="padding:0"><h3 style="margin:0">燃烧之手</h3><p class="lib-muted" style="margin:2px 0 8px">1 环 塑能</p><p class="lib-faint">（作者渲染的这条法术全文）</p></div></div>${bar(`${gray('玩家手册 · 第 220 页')}<span class="lib-end">${btn('换一条')}${btn('复制它开始改', { primary: true, n: 2 })}</span>`)}`)

// ── 起点：粘贴 JSON ──
const cmLine = (no, code, err = false) => `<div class="lib-cm__line"${err ? ' data-err="true"' : ''}><i>${err ? '●' : ''}</i><small>${no}</small><span>${code}</span></div>`
const cm = ({ pop = false, err = true, short = false } = {}) => `<div class="lib-cm">${[
  cmLine(1, '{'),
  cmLine(2, '  <b>"name"</b>: "火焰鹦鹉",'),
  cmLine(3, `  <b>"level"</b>: ${err ? '<u>12</u>' : '1'},`, err),
  cmLine(4, '  <b>"school"</b>: "V",'),
  cmLine(5, '  <b>"time"</b>: [{ <b>"number"</b>: 1, <b>"unit"</b>: "action" }],'),
  cmLine(6, '  <b>"ra</b>'),
  ...(short ? [] : [cmLine(7, '  <b>"entries"</b>: ['), cmLine(8, '    "一团燃烧的羽毛从你指尖飞出……"'), cmLine(9, '  ]')]),
  cmLine(short ? 7 : 10, '}'),
].join('')}${pop ? '<div class="lib-cm__pop"><div data-on="true"><span>range</span><span class="lib-faint">范围</span></div><div><span>races</span><span class="lib-faint">种族</span></div><div><span>reprintedAs</span><span class="lib-faint"></span></div></div>' : ''}</div>`
const jsonPage = (L) => mbody(`<div class="lib-etop">${P(1)}代码编辑框：行号、高亮、错误标在行上、字段名补全${L === 'narrow' ? '' : '<span class="lib-end lib-faint">粘贴一整条法术（作者格式）</span>'}</div><div style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:var(--sp-3)">${cm({ pop: true })}</div>
<div class="lib-cm__err">${errorLine(`${P(2)}第 3 行：环节应该是 0 到 9 的整数（作者结构定义）`, btn('跳到这一行', { small: true, quiet: true }))}</div>${bar(`<span class="lib-end">${btn('检查')}${btn('进表单', { primary: true, n: 3 })}</span>`)}`)

// ── 编辑器：只有表单 ──
const spellForm = (L, n = {}) => `<div class="lib-form">
<div class="lib-fgrid">
${lab('中文名', { req: true, n: n.label })}${input('火焰鹦鹉')}
${lab('英文名')}${input('Fire Parrot')}
${lab('环节', { req: true, n: n.select })}<div class="lib-inline">${sel('1 环', 120)}<span class="lib-muted">学派<small style="color:var(--danger-text)">*</small></span>${sel('塑能', 120)}</div>
${lab('施法时间', { req: true, n: n.rep })}<div class="lib-rep"><div class="lib-rep__row">${input('1').replace('class="trpg-input"', 'class="trpg-input lib-num"')}${sel('动作')}${input('', { placeholder: '条件（可不填）' })}${iconBtn('x', '删掉这一种')}</div><div>${btn('添加施法时间', { small: true, quiet: true, ic: 'plus' })}</div></div>
${lab('范围', { req: true })}<div class="lib-inline">${sel('点', 110)}${input('150').replace('class="trpg-input"', 'class="trpg-input lib-num"')}${sel('尺', 90)}</div>
${lab('成分', { n: n.check })}<div class="lib-checks">${ck('言语', true)}${ck('姿势', true)}${ck('材料', false)}</div>
${lab('持续时间', { req: true })}<div class="lib-rep"><div class="lib-rep__row">${sel('立即')}${ck('专注', false)}${iconBtn('x', '删掉')}</div><div>${btn('添加持续时间', { small: true, quiet: true, ic: 'plus' })}</div></div>
${lab('说明', { req: true, n: n.rte })}<div class="lib-rte"><div class="lib-rte__bar"><button>段落</button><button>列表</button><button>表格</button><button>${icon('dice-five', 12)} 骰子</button><button>引用条目</button></div><div class="lib-rte__body"><p>一团燃烧的羽毛从你指尖飞出，命中射程内一个你能看见的生物……</p><p>失败受到 <span class="lib-tag">3d6</span> 火焰伤害。</p></div></div>
${L === 'narrow' ? '' : `${lab('"升环施法" 说明')}<div class="lib-rte"><div class="lib-rte__body" style="min-height:44px"><p class="lib-faint">用高于 1 环的法术位施放时……</p></div></div>`}
</div>
<div class="lib-more">${P(n.more)}${icon('caret-right', 14)}更多选项（子学派、伤害类型、豁免检定、职业……共 31 项）<span class="lib-end">${input('', { placeholder: '搜选项', ic: 'magnifying-glass' })}</span></div></div>`
const etop = (L, { house = false, n = {} } = {}) => `<div class="lib-etop">${badge('法术')}${badge('5e')}${house ? `<span>${icon('info', 14)} 改的是<b>房规</b>：原件不动</span>` : `<span>在 <b>海盗战役</b></span>`}<span class="lib-end">${btn(L === 'narrow' ? '撤销 3' : '撤销（还剩 3 步）', { small: true, ic: 'arrow-counter-clockwise' })}${L === 'narrow' ? btn('{ } JSON', { small: true, n: n.jsonLink }) : ''}</span></div>`
const ebar = (n = {}) => bar(`<span class="lib-src">${P(n.draft)}草稿已自动存 · 12:03</span><span class="lib-end">${btn('取消')}${btn('完成', { primary: true, n: n.done })}</span>`)
const jtab = (n) => `<div class="lib-jtab"><b>{ }</b>JSON${n ? `<span style="position:absolute;top:8px;writing-mode:horizontal-tb">${P(n)}</span>` : ''}</div>`
const jpane = () => `<div class="lib-jpane"><div class="lib-jpane__head"><b>JSON</b><span class="lib-faint">和表单同步：改哪边，另一边跟着变</span><span class="lib-end">${iconBtn('x', '收起 JSON')}</span></div>${cm({ err: false, short: true })}</div>`
const editor = (L, { json = false, house = false, n = {} } = {}) => mbody(`${etop(L, { house, n })}<div class="lib-eshell"><div class="lib-pad">${spellForm(L, n)}</div>${L === 'narrow' ? '' : json ? jpane() : jtab(n.jtab)}</div>${ebar(n)}`)

// ── 没有作者编辑器的类型（神祇）：作者没有中文名的字段照实显示英文；画不成控件的一项提示到 JSON 里改 ──
const deityForm = () => mbody(`<div class="lib-etop">${badge('神祇')}${badge('5e')}<span>在 <b>海盗战役</b></span></div><div class="lib-eshell"><div class="lib-pad"><div class="lib-form"><div class="lib-fgrid">
${lab('中文名', { req: true })}${input('浪涛之母')}
${lab('pantheon', { req: true, en: true, n: 1 })}${input('海盗诸神')}
${lab('alignment', { en: true })}<div class="lib-checks">${ck('L', false)}${ck('N', true)}${ck('C', true)}${ck('G', false)}${ck('E', false)}</div>
${lab('domains', { en: true })}<div class="lib-rep"><div class="lib-rep__row">${input('Tempest')}${iconBtn('x', '删掉')}</div><div>${btn('再加一个', { small: true, quiet: true, ic: 'plus' })}</div></div>
${lab('symbol', { en: true })}${input('一只缠着海草的锚')}
${lab('说明', { req: true })}<div class="lib-rte"><div class="lib-rte__body"><p>她的信徒相信每一场风暴都是她的呼吸……</p></div></div>
${lab('customProperties', { en: true, n: 2 })}<span class="lib-tojson">${icon('info', 14)}这一项比较复杂，在 JSON 里改 ›</span>
</div></div></div>${jtabX()}</div>${ebar()}`)
const jtabX = () => `<div class="lib-jtab"><b>{ }</b>JSON</div>`

// ── 预览兼保存 ──
const notes = (open) => open
  ? `<div class="lib-stack" style="gap:6px"><span class="lib-notes">${icon('info', 12)}作者提醒 2 条 ▾</span><div class="lib-err"><span>没有写「来源页码」，作者网站会显示为空。</span></div><div class="lib-err"><span>正文里的 3d6 已认成骰子，可以点着掷。</span></div></div>`
  : `<span class="lib-notes">${P(1)}${icon('info', 12)}作者提醒 2 条 ▸</span>`
const diffList = `<ul class="lib-diff"><li><code>环节</code><span><s>1 环</s> → 2 环</span></li><li><code>说明</code><span>第 2 段改了 ${btn('展开看', { small: true, quiet: true })}</span></li><li><code>范围</code><span><s>60 尺</s> → 150 尺</span></li></ul>`
const previewPage = (L, kind, n = {}) => mbody(`<div class="lib-pad"><div class="lib-stack">${notes(kind === 'edit' && L === 'narrow')}${spellRender(kind === 'house' ? '我的火球术' : '火焰鹦鹉', kind === 'house' ? '3 环 塑能' : '1 环 塑能')}</div></div>
<div class="lib-sum">${kind === 'new' ? `<div class="lib-sum__row">${P(2)}<span>存进</span>${sel('海盗战役（上次用的）')}</div>` : `<div class="lib-sum__row">${P(3)}<span>这次改了 3 项</span>${btn(kind === 'house' ? '展开看' : '收起', { small: true, quiet: true })}</div>${kind === 'house' ? '' : diffList}`}
${kind === 'house' ? `<div class="lib-sum__row">${P(4)}<span>作用于</span>${sel('本战役')}</div>` : ''}</div>
${bar(`${btn('回去改', { ic: 'caret-left', n: n.back })}<span class="lib-end">${btn(kind === 'house' ? '保存房规' : '保存', { primary: true, n: n.save })}</span>`)}`)

export const screens = [
  {
    id: 'u7-8a-template', group: G, title: 'P5.5 起点：作者模板（先看样子再用）', flow: 'P5.5 §15 ⑧',
    goal: '知道模板里有什么，再决定用不用', primary: '[用这个开始]', patterns: 'Preview before commit', laws: 'Jakob（作者网站同一份模板）· Hick（两个按钮）',
    captions: { '1440': '宽窗', '900': '宽窗', '390': '窄屏 · 底部抽屉' },
    diff: '弹窗内换页，‹ 回选起点。',
    notes: [[1, '[用这个开始]', '进编辑器（u7-10），表单按模板填好；还没存', '【有】custom.template']],
    board: tri({ '1440': () => ({ ...bg(), overlay: sheet(head('起点', '作者模板：新法术'), tplPage()) }), '900': () => ({ ...bg(), overlay: sheet(head('起点', '作者模板：新法术'), tplPage()) }), '390': () => ({ ...bg(), overlay: sheet(head('起点', '作者模板'), tplPage()) }) }),
  },
  {
    id: 'u7-8b-existing', group: G, title: 'P5.5 起点：从已有的法术开始（挑一条 → 先预览）', flow: 'P5.5 §15 ⑧',
    goal: '照着现成的一条改，最省事', primary: '[复制它开始改]', patterns: 'Search + List + Preview', laws: 'Jakob（D&D Beyond「复制再改」）· Hick（只列这一类）',
    captions: { '1440': '宽窗 · 只在法术里搜', '900': '宽窗 · 点了一条：先看它的样子', '390': '窄屏 · 列表' },
    diff: '列表 ⇄ 预览是弹窗内换页。',
    notes: [
      [1, '搜索 + 环阶药丸', '只在这一类（法术）里搜全库；列 = 这一类的列（后端给）', '【有】service.query / library.sorting'],
      [2, '[复制它开始改]', '复制一份进编辑器（来源换成这个包），原件不动；还没存', '【有】entryTypes → starts.existing'],
    ],
    board: tri({ '1440': () => ({ ...bg(), overlay: sheet(head('起点', '从已有的法术开始'), pickList()) }), '900': () => ({ ...bg(), overlay: sheet(head('列表', '燃烧之手'), pickPreview()) }), '390': () => ({ ...bg(), overlay: sheet(head('起点', '挑一条法术'), pickList()) }) }),
  },
  {
    id: 'u7-8c-json', group: G, title: 'P5.5 起点：粘贴 JSON（代码编辑框）', flow: 'P5.5 §15 ⑧',
    goal: '手上已经有作者格式的 JSON，粘进来检查后进表单', primary: '[进表单]', patterns: 'Code editor · Inline validation', laws: 'Postel（错了标在行上，不硬拦）· Doherty（边打边检查）',
    captions: { '1440': '宽窗 · 第 3 行有错；正在打字，弹出字段补全', '900': '宽窗', '390': '窄屏' },
    diff: '代码编辑框 = CodeMirror 6 基础件（§8.1 驾驶员已批准的新依赖）。',
    notes: [
      [1, '代码编辑框', '行号、JSON 高亮、错误标在行号旁、字段名补全（补全旁边显示中文名，有的话）', 'CodeMirror 6 ·【有】custom.fields'],
      [2, '错误', '作者结构定义的检查；中文说明 + [跳到这一行]', '【有】custom.validateEntry + json-source-map'],
      [3, '[进表单]', '有错也能进（作者做法），表单里对应字段标红', '—'],
    ],
    board: tri({ '1440': () => ({ ...bg(), overlay: sheet(head('起点', '粘贴 JSON'), jsonPage('wide')) }), '900': () => ({ ...bg(), overlay: sheet(head('起点', '粘贴 JSON'), jsonPage('wide')) }), '390': () => ({ ...bg(), overlay: sheet(head('起点', '粘贴 JSON'), jsonPage('narrow')) }) }),
  },
  {
    id: 'u7-10-editor', group: G, title: 'P5.5 编辑器：只有表单（中文字段名、每个字段一个控件）；JSON 在侧边', flow: 'P5.5 §15 ⑩',
    goal: '一眼看懂每一项怎么填，改完点［完成］', primary: '[完成]', patterns: 'Form · Repeatable rows · Progressive disclosure · Side drawer（JSON）', laws: 'Miller（必填在前、其余折叠）· Jakob（和作者中文版编辑器同样的字段与写法）· Fitts（主按钮右下）',
    captions: { '1440': '宽窗 · 默认只有表单；右边一条竖条「{ } JSON」', '900': '宽窗 · 点了竖条：JSON 在右边展开，和表单同步', '390': '窄屏 · 右上「{ } JSON」跳到 JSON 页（‹ 返回表单）' },
    diff: '宽：JSON 侧边展开；窄：跳页。没有右边常驻预览——预览在点［完成］之后（u7-11）。',
    notes: [
      [1, '中文字段名', '法术、怪物、传奇组用作者中文版编辑器的叫法（环节、施法时间……）；其余类型用作者共用的叫法，没有的显示英文原名（见 u7-10b），之后由翻译补', '【有】custom.fields → label（f6752fa）'],
      [2, '下拉', '有可选值的字段；选项显示中文（「1 环」「塑能」「动作」「尺」）', '形状【有】；**中文选项待接**：作者法术编辑器里有（Parser 显示函数），还没接进字段表'],
      [3, '可加几个的一组', '施法时间、持续时间这类：每一种一行，［添加…］再加一行，✕ 删掉', '【有】shape = list(group)'],
      [4, '勾选', '是非题（言语 / 姿势 / 材料）；勾了「材料」才出现材料说明一行', '【有】shape = group(switch)；小字段中文名同上待接'],
      [5, '说明（正文）', '段落编辑器：一段一行；工具条插入列表、表格、骰子、引用条目（作者的标签写法，不让用户手打代码）', '【有】shape = entries；作者 getTextAsEntries'],
      [6, '更多选项', '其余非必填字段折叠，可搜', '【有】fields（required）'],
      [7, '{ } JSON 竖条', '宽屏点开在右边展开代码编辑框，和表单双向同步；窄屏跳页', 'CodeMirror 6'],
      [8, '草稿已自动存', '停手几秒自动存；草稿不影响任何条目', '【有】custom.saveDraft'],
      [9, '[完成]', '跳到预览兼保存页（u7-11），这时才算「改完了」', '—'],
    ],
    board: tri({
      '1440': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { n: { label: 1, select: 2, rep: 3, check: 4, rte: 5, more: 6, jtab: 7, draft: 8, done: 9 } })) }),
      '900': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('wide', { json: true })) }),
      '390': () => ({ ...bg(), overlay: sheet(head('海盗战役', '火焰鹦鹉'), editor('narrow', { n: { jsonLink: 7 } })) }),
    }),
  },
  {
    id: 'u7-10b-fallback', group: G, title: 'P5.5 编辑器：没有作者编辑器的类型 · 窄屏 JSON 页', flow: 'P5.5 §15 ⑩',
    goal: '看清现在中文覆盖不到的地方长什么样', primary: '—', patterns: 'Graceful fallback', laws: 'Postel（没有中文名也能填）',
    captions: { '1440': '宽窗 · 神祇：作者没有中文名的字段照实显示英文原名；画不成控件的一项提示到 JSON 里改', '900': '宽窗 · 同上', '390': '窄屏 · JSON 页（从表单右上跳来）' },
    diff: '英文名用等宽字，和中文名一眼区分开。',
    notes: [
      [1, '英文原名', '作者中文版没有这个字段的叫法 → 显示英文原名；之后翻译补在 field-labels.json，自动换成中文', '【有】label 没有时不给'],
      [2, '到 JSON 里改', '少数结构太复杂的字段（用户字段里约 2%）：点一下跳到 JSON 里那一行', '【有】shape = json'],
      [3, '窄屏 JSON 页', '整页代码编辑框；‹ 返回表单，两边同步', 'CodeMirror 6'],
    ],
    board: tri({
      '1440': () => ({ ...bg(), overlay: sheet(head('海盗战役', '浪涛之母'), deityForm()) }),
      '900': () => ({ ...bg(), overlay: sheet(head('海盗战役', '浪涛之母'), deityForm()) }),
      '390': () => ({ ...bg(), overlay: sheet(head('表单', 'JSON'), mbody(`<div style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:var(--sp-3)">${P(3)}${cm({ err: false })}</div>${bar(`<span class="lib-end">${btn('返回表单', { primary: true })}</span>`)}`)) }),
    }),
  },
  {
    id: 'u7-11-preview', group: G, title: 'P5.5 点［完成］→ 预览兼保存', flow: 'P5.5 §15 ⑪',
    goal: '看到最终样子；不满意回去改，满意就存', primary: '[保存]', patterns: 'Review step · Collapsed notes', laws: 'Peak–End（最后一步给确定感）· von Restorff（提醒收成小条，不抢内容）',
    captions: { '1440': '宽窗 · 新建：作者渲染占满；作者提醒收成小条；只问存进哪个包', '900': '宽窗 · 官方条目（房规）：改了几项 + 作用于', '390': '窄屏 · 改自己的条目：点开了作者提醒；改了 3 项' },
    diff: '取代旧的「保存确认」页：预览和确认合成一页，少一步。',
    notes: [
      [1, '作者提醒', '作者渲染 / 检查时的提醒收成一个小条，点开才看；不盖在预览上', '【有】validateEntry · 作者渲染器'],
      [2, '存进', '只有新建时问；默认上次用的包', '【有】custom.suggestedPack'],
      [3, '改了几项', '字段中文名 · 改前 → 改后', '【有】custom.changes'],
      [4, '作用于', '只有房规有', '【有】createHouseRule'],
      [5, '[回去改]', '回到表单，输入和草稿都在', '—'],
      [6, '[保存]', '约 1 秒；回到包的列表，顶部「已保存 · [撤销]」', '【有】saveEntry / createHouseRule'],
    ],
    board: tri({
      '1440': () => ({ ...bg(), overlay: sheet(head('火焰鹦鹉', '预览'), previewPage('wide', 'new', { back: 5, save: 6 })) }),
      '900': () => ({ ...bg(), overlay: sheet(head('我的火球术', '预览'), previewPage('wide', 'house')) }),
      '390': () => ({ ...bg(), overlay: sheet(head('火焰鹦鹉', '预览'), previewPage('narrow', 'edit')) }),
    }),
  },
]

// P5.5 阶段 C（三）：起点的三个页面（详细表单 / 从已有的挑 / 粘贴 JSON）、编辑器（只有表单；JSON 在侧边，点开才出来）、预览兼保存。
// 驾驶员 2026-11-13：表单不塞代码、字段用中文名、每个字段画成能一眼看懂的控件；点［完成］才跳到预览；JSON 用代码编辑框（CodeMirror 6，§8.1）。
// 字段、控件种类来自后端字段表（custom.fields：shape + label，作者结构定义 + 作者中文版）。
import { badge, btn, gray, icon, iconBtn, input, mbody, pills, sheet, table, count } from '../lib/parts.mjs'
import { errorLine, infoLine } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'
import { P, bar, bg, ck, cm, fld, head, sel, spellRender, split } from '../lib/editor.mjs'

const G = 'P5.5 新建条目 · 编辑器 · 保存'

// ── 起点：作者模板 ──
const tplPage = () => mbody(`<div class="lib-pad">${infoLine('详细表单用的是作者编辑器里「新法术」这一份：全部字段展开，预先填好下面这些内容。')}<div style="height:12px"></div>${spellRender('新法术', '1 环 塑能')}</div>${bar(`<span class="lib-end">${btn('换一种起点')}${btn('用详细表单开始', { primary: true, n: 1 })}</span>`)}`)

// ── 起点：从已有的挑 ──
const SP = [['火球术', '3 环', '塑能', 'PHB'], ['燃烧之手', '1 环', '塑能', 'PHB'], ['魔法飞弹', '1 环', '塑能', 'PHB'], ['冰锥术', '5 环', '塑能', 'PHB'], ['火焰箭', '戏法', '塑能', 'PHB']]
const pickList = (sel = '燃烧之手') => mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${P(1)}${input('火', { ic: 'magnifying-glass' })}</div>${pills([['全部法术', 969, true], ['戏法', 44], ['1 环', 79], ['2 环', 103], ['…', null]])}${table([{ label: '名称', sort: 'asc', can: 1 }, { label: '环阶', can: 1 }, { label: '学派', can: 1 }, { label: '来源', can: 1 }], SP.map(([a, b, c, d]) => ({ cells: [a, b, c, gray(d)], sel: a === sel })))}${count('找到 5 条（只显示法术）')}`)
const pickPreview = () => mbody(`<div class="lib-pad"><div class="lib-dbody" style="padding:0"><h3 style="margin:0">燃烧之手</h3><p class="lib-muted" style="margin:2px 0 8px">1 环 塑能</p><p class="lib-faint">（作者渲染的这条法术全文）</p></div></div>${bar(`${gray('玩家手册 · 第 220 页')}<span class="lib-end">${btn('换一条')}${btn('复制它开始改', { primary: true, n: 2 })}</span>`)}`)

// ── 起点：粘贴 JSON ──
const jsonPage = (L) => mbody(`<div class="lib-etop">${P(1)}代码编辑框：行号、高亮、错误标在行上、字段名补全${L === 'narrow' ? '' : '<span class="lib-end lib-faint">粘贴一整条法术（作者格式）</span>'}</div><div style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:var(--sp-3)">${cm({ pop: true })}</div>
<div class="lib-cm__err">${errorLine(`${P(2)}第 3 行：环节应该是 0 到 9 的整数（作者结构定义）`, btn('跳到这一行', { small: true, quiet: true }))}</div>${bar(`<span class="lib-end">${btn('检查')}${btn('进表单', { primary: true, n: 3 })}</span>`)}`)

// ── 没有作者编辑器的类型（神祇）：作者没有中文名的字段照实显示英文；画不成控件的一项提示到 JSON 里改 ──
const deityBody = (zh, n = {}) => `<div class="lib-tform">
${fld(zh ? '名字' : 'Name', input(zh ? '浪涛之母' : 'Mother of Waves'), { req: true })}
${fld('pantheon', input(zh ? '海盗诸神' : 'Pirate Gods'), { req: true, en: true, n: n.en })}
${fld('alignment', `<div class="lib-checks lib-mono">${ck('L', false)}${ck('N', true)}${ck('C', true)}${ck('G', false)}${ck('E', false)}</div>`, { en: true })}
${fld('domains', `<div class="lib-rep"><div class="lib-rep__row">${input('Tempest')}${iconBtn('x', '删掉')}</div><div>${btn(zh ? '再加一个' : 'Add', { small: true, quiet: true, ic: 'plus' })}</div></div>`, { en: true })}
${fld('symbol', input(zh ? '一只缠着海草的锚' : 'An anchor wrapped in kelp'), { en: true })}
${fld(zh ? '说明' : 'Text', `<div class="lib-rte"><div class="lib-rte__body"><p>${zh ? '她的信徒相信每一场风暴都是她的呼吸……' : 'Her faithful believe every storm is her breath…'}</p></div></div>`, { req: true })}
${fld('customProperties', `<span class="lib-tojson">${icon('info', 14)}${zh ? '这一项比较复杂，在右栏 JSON 里改 ›' : 'Complex — edit in JSON ›'}</span>`, { en: true, n: n.json })}</div>`
const deityForm = () => mbody(`<div class="lib-etop">${badge('神祇')}${badge('5e')}<span>在 <b>海盗战役</b></span><span class="lib-end">${btn('⇄ 左右对调', { small: true })}</span></div>${split('中文', deityBody(true, { en: 1, json: 2 }), { tabs: ['English', 'JSON', '预览'], on: 'English', note: '《海盗战役》En', body: deityBody(false) })}${bar(`<span class="lib-src">草稿已自动存 · 12:03</span><span class="lib-end">${btn('取消')}${btn('完成', { primary: true })}</span>`)}`)

// ── 预览兼保存 ──
const notes = (open) => open
  ? `<div class="lib-stack" style="gap:6px"><span class="lib-notes">${icon('info', 12)}作者提醒 2 条 ▾</span><div class="lib-err"><span>没有写「来源页码」，作者网站会显示为空。</span></div><div class="lib-err"><span>正文里的 3d6 已认成骰子，可以点着掷。</span></div></div>`
  : `<span class="lib-notes">${P(1)}${icon('info', 12)}作者提醒 2 条 ▸</span>`
const diffList = `<ul class="lib-diff"><li><code>环节</code><span><s>1 环</s> → 2 环</span></li><li><code>说明</code><span>第 2 段改了 ${btn('展开看', { small: true, quiet: true })}</span></li><li><code>范围</code><span><s>60 尺</s> → 150 尺</span></li></ul>`
const previewPage = (L, kind, n = {}) => mbody(`<div class="lib-pad"><div class="lib-stack">${notes(kind === 'edit' && L === 'narrow')}${spellRender(kind === 'house' ? '我的火球术' : '火焰鹦鹉', kind === 'house' ? '3 环 塑能' : '1 环 塑能')}</div></div>
<div class="lib-sum">${kind === 'new' ? `<div class="lib-sum__row">${P(2)}<span>存进</span>${sel('海盗战役（上次用的）')}<span class="lib-faint">中文、英文两边一起存；英文那边还没有包就自动建同编号的</span></div>` : `<div class="lib-sum__row">${P(3)}<span>${kind === 'house' ? '这次改了 3 项' : '中文改了 3 项 · English 改了 1 项'}</span>${btn(kind === 'house' ? '展开看' : '收起', { small: true, quiet: true })}</div>${kind === 'house' ? '' : diffList}`}
${kind === 'house' ? `<div class="lib-sum__row">${P(4)}<span>作用于</span>${sel('本战役')}</div>` : ''}</div>
${bar(`${btn('回去改', { ic: 'caret-left', n: n.back })}<span class="lib-end">${btn(kind === 'house' ? '保存房规' : '保存', { primary: true, n: n.save })}</span>`)}`)

export const screens = [
  {
    id: 'u7-8a-template', group: G, title: 'P5.5 起点：详细表单（作者模板，先看样子再用）', flow: 'P5.5 §15 ⑧',
    goal: '知道模板里有什么，再决定用不用', primary: '[用详细表单开始]', patterns: 'Preview before commit', laws: 'Jakob（作者网站同一份模板）· Hick（两个按钮）',
    captions: { '1440': '宽窗', '900': '宽窗', '390': '窄屏 · 底部抽屉' },
    diff: '弹窗内换页，‹ 回选起点。',
    notes: [[1, '[用详细表单开始]', '进编辑器（u7-10），全部字段展开、按模板填好；还没存', '【有】custom.template']],
    board: tri({ '1440': () => ({ ...bg(), overlay: sheet(head('起点', '详细表单：新法术'), tplPage()) }), '900': () => ({ ...bg(), overlay: sheet(head('起点', '详细表单：新法术'), tplPage()) }), '390': () => ({ ...bg(), overlay: sheet(head('起点', '详细表单'), tplPage()) }) }),
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
    id: 'u7-10b-fallback', group: G, title: 'P5.5 编辑器：没有作者中文名的类型 · 窄屏 JSON 页', flow: 'P5.5 §15 ⑩',
    goal: '看清现在中文覆盖不到的地方长什么样', primary: '—', patterns: 'Graceful fallback', laws: 'Postel（没有中文名也能填）',
    captions: { '1440': '宽窗 · 神祇（左右两栏同 u7-10）：作者没有中文名的字段照实显示英文原名；画不成控件的一项提示到右栏 JSON 里改', '900': '宽窗 · 同上', '390': '窄屏 · 对比页的 JSON 标签（从表单右上［对比］跳来）' },
    diff: '英文名用等宽字，和中文名一眼区分开。',
    notes: [
      [1, '英文原名', '作者中文版没有这个字段的叫法 → 显示英文原名；之后翻译补在 field-labels.json，自动换成中文', '【有】label 没有时不给'],
      [2, '到 JSON 里改', '少数结构太复杂的字段（用户字段里约 2%）：点一下右栏切到 JSON、跳到那一行', '【有】shape = json'],
      [3, '窄屏 JSON', '对比页（u7-10c）里的 JSON 标签：整页代码编辑框；‹ 返回表单，两边同步', 'CodeMirror 6'],
    ],
    board: tri({
      '1440': () => ({ ...bg(), overlay: sheet(head('海盗战役', '浪涛之母'), deityForm()) }),
      '900': () => ({ ...bg(), overlay: sheet(head('海盗战役', '浪涛之母'), deityForm()) }),
      '390': () => ({ ...bg(), overlay: sheet(head('表单', '对比'), mbody(`<div class="lib-ctabs"><span class="trpg-seg" role="group"><button type="button" aria-pressed="false">英文版</button><button type="button" aria-pressed="true">JSON</button><button type="button" aria-pressed="false">预览</button></span></div><div style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:var(--sp-3)">${P(3)}${cm({ err: false })}</div>${bar(`<span class="lib-end">${btn('返回表单', { primary: true })}</span>`)}`)) }),
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

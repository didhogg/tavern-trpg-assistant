// P5.5 阶段 C（五）：书架上的官方条目改成房规 · 覆盖（房规）管理。
// 问卷 Q14：房规默认作用于本战役；在「包 / 整个书架 / 单条详情」的 ⋯ → 管理 → 房规（覆盖）里看到全部、能整批或逐条改作用范围。
// 三个入口用同一个列表，只是范围不同（单条 / 一个包或一本书 / 整个书架）；设置 → 库 → 全局编辑 / 覆盖（u5-5）是全部规则。
// 每一条可展开看「改了什么」（和原件比）。层级：本战役 > 规则 > 全局，上面的盖住下面的（versions.chooseVersion）。
import { tri } from '../lib/boards.mjs'
import { P, badge, bar, bg, btn, ck, head, icon, iconBtn, mbody, sel, spellForm, split, vsplit } from '../lib/editor.mjs'
import { dropdown, entryHead, mdetail, sheet, shelfPage, spellBody } from '../lib/parts.mjs'
import { infoLine } from '../lib/ui.mjs'

const G = 'P5.5 房规（覆盖）：改官方条目 · 管理'
const under = (extra = {}) => ({ page: 'library', flush: true, content: shelfPage({ pins: {} }), ...extra })
const diff = (items) => `<ul class="lib-diff">${items.map(([k, a, b]) => `<li><code>${k}</code><span>${a ? `<s>${a}</s> → ` : ''}${b}</span></li>`).join('')}</ul>`
const FIRE = [['环节', '3 环', '4 环'], ['范围', '150 尺', '100 尺'], ['说明', '', `第 2 段改了 ${btn('展开看', { small: true, quiet: true })}`]]

// ── 改官方条目 = 房规：同一个编辑器，顶上说清楚；对比抽屉多一个「原件」标签 ──
const crow = (k, v, now, diffOn) => `<div class="lib-crow"${diffOn ? ' data-diff="true"' : ''}><b>${k}</b><span>${v}${diffOn ? `<small>现在是 ${now}</small>` : ''}</span>${diffOn ? btn('← 用回原件的', { small: true, quiet: true }) : '<span></span>'}</div>`
const originRows = () => `<p class="lib-faint" style="margin:0 0 6px;font-size:12px">玩家手册（2014）· 第 241 页 · 只能看 · 改了的标黄</p>
${crow('名字', '火球术')}${crow('环节', '3 环', '4 环', true)}${crow('学派', '塑能')}${crow('施法时间', '1 动作')}${crow('范围', '点 · 150 尺', '100 尺', true)}${crow('说明', '明亮的闪光从你的指间飞驰向……')}`
const houseTop = (L, n = {}) => `<div class="lib-etop">${L === 'narrow' ? '' : `${badge('法术')}${badge('5e')}`}<span>${P(n.house)}${icon('info', 14)} 改的是<b>房规</b>：《玩家手册》原件不动</span><span class="lib-end">${btn(L === 'narrow' ? '撤销 2' : '撤销（还剩 2 步）', { small: true, ic: 'arrow-counter-clockwise' })}</span></div>`
const fireForm = (L) => spellForm(L, { lang: 'zh', house: true, v: { name: '火球术', text: '<p>明亮的闪光从你的指间飞驰向施法距离内你指定的一点……</p><p>豁免失败者受到 <span class="lib-tag">8d6</span> 火焰伤害。</p>' } })
const fireEn = (L) => spellForm(L, { lang: 'en', house: true, v: { name: 'Fireball', level: 'Level 4', text: '<p>A bright streak flashes from your pointing finger to a point you choose within range…</p><p>On a failed save, a creature takes <span class="lib-tag">8d6</span> fire damage.</p>' } })
const houseEditorEn = (L, n = {}) => mbody(`${houseTop(L, n)}${L === 'narrow'
  ? vsplit({ open: true, tabs: ['原件', 'English', 'JSON', '预览'], on: 'English', body: fireEn(L) }, '中文（房规）', fireForm(L), n)
  : split('中文（房规）', fireForm(L), { tabs: ['原件', 'English', 'JSON', '预览'], on: 'English', body: fireEn(L) }, n)}${bar(`<span class="lib-src">草稿已自动存 · 12:03</span><span class="lib-end">${btn('取消')}${btn('完成', { primary: true, n: n.done })}</span>`)}`)
const houseEditor = (L, n = {}) => mbody(`${houseTop(L, n)}${L === 'narrow'
  ? vsplit({ open: true, tabs: ['原件', 'English', 'JSON', '预览'], on: '原件', body: originRows() }, '中文（房规）', fireForm(L), n)
  : split('中文（房规）', fireForm(L), { tabs: ['原件', 'English', 'JSON', '预览'], on: '原件', note: '只能看', body: originRows() }, n)}${bar(`<span class="lib-src">草稿已自动存 · 12:03</span><span class="lib-end">${btn('取消')}${btn('完成', { primary: true, n: n.done })}</span>`)}`)

// 保存页：作用于（下拉打开）
const scopeOpen = (n) => `<span style="position:relative">${P(n)}${sel('本战役「失落矿坑」', 220)}${dropdown([['本战役「失落矿坑」（所有存档和分支）'], ['当前规则：D&D 5e（2014）'], ['全局（所有战役）']], 280).replace('right:0', 'left:0;right:auto')}</span>`
const housePreview = (n = {}) => mbody(`<div class="lib-pad"><div class="lib-stack"><span class="lib-notes">${icon('info', 12)}作者提醒 0 条</span><p class="lib-faint" style="margin:0">（作者渲染的「火球术」房规版全文）</p></div></div>
<div class="lib-sum"><div class="lib-sum__row">${P(n.changes)}<span>中文和原件比，改了 3 项</span></div>${diff(FIRE)}<div class="lib-sum__row">${P(n.en)}<span>English 和原文比，改了 2 项</span></div>${diff([['Level', 'Level 3', 'Level 4'], ['Range', '150 feet', '100 feet']])}<div class="lib-sum__row" style="padding-bottom:120px"><span>中英两条都作用于</span>${scopeOpen(n.scope)}</div></div>
${bar(`${btn('回去改', { ic: 'caret-left' })}<span class="lib-end">${btn('保存房规', { primary: true, n: n.save })}</span>`)}`)

// 存好以后：条目详情显示覆盖后的内容；⋯ 菜单里进管理
const savedDetail = (n = {}) => mdetail(`<div class="lib-dtools" style="position:relative">${badge('已修改 / 覆盖', 'warn')}${btn('复原', { small: true, ic: 'arrow-counter-clockwise' })}<span class="lib-end">${iconBtn('pencil-simple', '编辑')}<span style="position:relative">${P(n.more)}${iconBtn('dots-three', '更多')}${dropdown([['复制成我的…'], ['管理：覆盖与作用范围'], ['停用这一条']], 200)}</span></span></div>`, `${infoLine('用的是你的房规（作用于本战役）。下面是覆盖后的内容。', '', 'lib-banner--info')}${spellBody()}`)

// ── 覆盖管理列表（单条 / 包或书 / 整个书架 共用）──
const erow = ({ name, kind, to, scope, on = false, open = false, body = '', L, n = {} }) => `<li class="lib-erow"><div class="lib-erow__top">${ck('', on)}<span class="lib-erow__name">${P(n.row)}${name}</span>${badge(kind, kind === '房规' ? 'warn' : '')}<span class="lib-erow__meta">改成 ${to}</span><span class="lib-end">${L === 'narrow' ? '' : `${P(n.scope)}${sel(scope, 170)}`}${btn(open ? '收起' : '看改了什么', { small: true, quiet: true, n: n.open })}${btn('复原', { small: true, ic: 'arrow-counter-clockwise', n: n.restore })}</span></div>${L === 'narrow' ? `<span class="lib-erow__meta">作用于 ${scope}</span>` : ''}${open ? `<div class="lib-erow__body">${body}</div>` : ''}</li>`
const fireBody = (n = {}) => `<span class="lib-muted" style="font-size:12px">${P(n.body)}和《玩家手册》原件比：</span>${diff(FIRE)}<div style="display:flex;gap:8px;flex-wrap:wrap">${btn('编辑这条房规', { small: true, ic: 'pencil-simple' })}${btn('看原件', { small: true })}</div>`
const bulkBar = (L, n = {}) => `<div class="lib-filter" style="padding:0 0 var(--sp-2)">${P(n.all)}${ck('全选', false)}<span class="trpg-seg" role="group">${P(n.kind)}<button type="button" aria-pressed="true">全部</button><button type="button" aria-pressed="false">房规</button><button type="button" aria-pressed="false">别的版本</button></span><span class="lib-end">${L === 'narrow' ? '' : '<span class="lib-muted" style="white-space:nowrap">选中的作用于</span>'}${sel('全局', 110)}${btn('应用', { small: true, n: n.apply })}</span></div>`
const sec = (t) => `<div class="lib-sec" style="padding:var(--sp-3) 0 0">${t}</div>`
const tabs = (items, on) => `<div class="lib-filter" style="padding-top:var(--sp-3)"><span class="trpg-seg" role="group">${items.map((t) => `<button type="button" aria-pressed="${t === on}">${t}</button>`).join('')}</span></div>`

const shelfEdits = (L, n = {}) => mbody(`${tabs(['停用项目', '房规（覆盖）'], '房规（覆盖）')}<div class="lib-pad" style="overflow:auto"><p class="lib-faint" style="margin:0 0 8px;font-size:12px">${P(n.range)}范围：整个书架（当前规则 D&D 5e 2014 下的书和包）· 本战役「失落矿坑」</p>${bulkBar(L, n)}
${sec('玩家手册（2014）')}<ul class="lib-edits">${erow({ L, name: '火球术', kind: '房规', to: '「我的火球术」', scope: '本战役', on: true, open: true, body: fireBody(n), n: { row: n.row, scope: n.scope, open: n.open, restore: n.restore } })}${erow({ L, name: '板甲', kind: '别的版本', to: '玩家手册（副本 1）里的那一份', scope: '全局' })}</ul>
${sec('怪物图鉴')}<ul class="lib-edits">${erow({ L, name: '年轻绿龙', kind: '房规', to: '「绿龙（弱化版）」', scope: '规则：5e 2014' })}</ul></div>`)
const packEdits = (L, n = {}) => mbody(`${tabs(['名字', '规则与版本', '房规（覆盖）', '依赖包'], '房规（覆盖）')}<div class="lib-pad" style="overflow:auto"><p class="lib-faint" style="margin:0 0 8px;font-size:12px">${P(n.range)}范围：这个包（包头的全部来源 + 这个包自己的那一份）</p>${bulkBar(L)}<ul class="lib-edits">${erow({ L, name: '强盗首领', kind: '别的版本', to: '「海盗战役」里的那一份', scope: '全局', open: true, body: `<span class="lib-muted" style="font-size:12px">和《怪物图鉴》原件比：</span>${diff([['生命值', '65', '82'], ['动作', '', '多了 1 个：朗姆酒瓶砸']])}` })}${erow({ L, name: '火焰鹦鹉', kind: '房规', to: '「我的火焰鹦鹉」', scope: '本战役' })}</ul></div>`)

// 单条 ⋯ → 管理：这一条在每一层用的是哪一份
const layer = (title, body, { win, off, n } = {}) => `<div class="lib-layer"${win ? ' data-win="true"' : ''}${off ? ' data-off="true"' : ''}><div class="lib-layer__head">${P(n)}<b>${title}</b>${win ? badge('生效中', 'success') : ''}</div>${body}</div>`
const entryManage = (n = {}) => mbody(`<div class="lib-pad" style="overflow:auto"><div class="lib-stack"><p class="lib-faint" style="margin:0;font-size:12px">${P(n.order)}「火球术」在每一层用的是哪一份。上面的盖住下面的：本战役 → 规则 → 全局。</p>
${layer('本战役「失落矿坑」', `<span>「我的火球术」（房规）</span>${diff(FIRE)}<div style="display:flex;gap:8px;flex-wrap:wrap">${sel('改作用于…', 130)}${btn('编辑', { small: true, ic: 'pencil-simple' })}${btn('复原', { small: true, ic: 'arrow-counter-clockwise' })}</div>`, { win: true, n: n.win })}
${layer('规则：D&D 5e（2014）', '<span class="lib-faint">没有改</span>')}
${layer('全局', `<span>玩家手册（副本 1）里的那一份</span><span class="lib-muted" style="font-size:12px">被本战役的盖住，现在不生效</span><div>${btn('复原', { small: true, ic: 'arrow-counter-clockwise' })}</div>`, { off: true, n: n.off })}</div></div>`)

export const screens = [
  {
    id: 'u7-13-house', group: G, title: 'P5.5 书架上的官方条目 ✎ → 房规（同一个编辑器）', flow: 'P5.5 §15 ⑩⑪ · Q14',
    goal: '改官方的一两个数，原件不动；存的时候定作用于哪一层', primary: '[保存房规]', patterns: 'Same editor, labelled mode · Compare with original · Preview before commit', laws: 'Jakob（和改自己的条目同一个编辑器）· Postel（存前列出改了什么）· Hick（作用于三选一，默认本战役）',
    captions: { '1440': '宽窗 · 改「火球术」：顶上写明是房规；左栏中文表单，右栏多一个「原件」标签（只能看），改了的标黄、可一键用回原件的', '900': '宽窗 · 点［完成］：和原件比改了 3 项；作用于（下拉打开）', '390': '窄屏 · 存好回到详情：显示覆盖后的内容；⋯ 菜单里进「管理」' },
    diff: '和改自己的条目同一套左右两栏（窄屏上下两栏）。英文也能改（驾驶员 2026-11-13 定：房规可以改两种语言），见 u7-13b。',
    notes: [
      [1, '改的是房规', '书架上的官方 / 下载的条目点 ✎ 进同一个编辑器；顶上一句话说明原件不动', '【有】custom.createHouseRule（只记改动，B1）'],
      [2, '原件标签', '对比抽屉：原件 / 英文（英文版原文）/ JSON / 预览；原件逐行对齐，改了的标黄 +［← 用回原件的］', '【有】scoped.detail 的 base（原件）'],
      [3, '[完成]', '跳到预览兼保存页', '—'],
      [4, '改了几项', '中文、English 各列和原件比改了哪几项（字段名 · 改前 → 改后）', '【有】custom.changes'],
      [5, '作用于', '中英两条一起：本战役（默认，所有存档和分支）/ 当前规则 / 全局；默认值在 设置 → 库 → 偏好 改', '【有】bilingual.houseRuleBoth（de0a23f）'],
      [6, '⋯ → 管理', '进这一条的覆盖管理（u7-14 窄屏）', '—'],
    ],
    board: tri({
      '1440': () => under({ overlay: sheet(head('玩家手册', '火球术'), houseEditor('wide', { house: 1, tabs: 2, done: 3 })) }),
      '900': () => under({ overlay: sheet(head('火球术', '预览'), housePreview({ changes: 4, en: 4, scope: 5 })) }),
      '390': () => under({ overlay: sheet(entryHead({ back: '玩家手册', title: '火球术' }), savedDetail({ more: 6 })) }),
    }),
  },
  {
    id: 'u7-13b-house-en', group: G, title: 'P5.5 房规两种语言一起改：右栏 English 也能改', flow: 'Q14 · §16.5',
    goal: '中文、英文的同一条官方条目一起改成房规，作用范围一样', primary: '[完成]', patterns: 'Split view · Module tabs', laws: 'Jakob（和自己的条目同一套两栏）· Tesler（两条房规一个［完成］、一个作用于）',
    captions: { '1440': '宽窗 · 右栏切到 English：英文官方原文，改了的标「改过」', '900': '宽窗 · 同上（窗口更窄）', '390': '窄屏 · 上半栏 English、下半栏中文' },
    diff: '宽：左右两栏；窄：上下两栏。',
    notes: [
      [1, 'English 能改', '右栏 English 是这一条的英文官方原文（这个战役里已经有英文房规就给房规那一份）；改了就在英文那一套也建一条房规', '【有】bilingual.englishInCampaign（de0a23f）'],
      [2, '改过', '和英文原文不一样的项标「改过」', '【有】custom.changes'],
      [3, '[完成]', '预览兼保存页（u7-13 900）：中文、English 各列改了几项；作用于一起选；两条一起存', '【有】bilingual.houseRuleBoth'],
      [4, '只改一边', '只改了中文就只建中文那一条（英文照常用原文），反过来也一样', '【有】houseRuleBoth 只给一边'],
    ],
    board: tri({
      '1440': () => under({ overlay: sheet(head('玩家手册', '火球术'), houseEditorEn('wide', { tabs: 1, done: 3 })) }),
      '900': () => under({ overlay: sheet(head('玩家手册', '火球术'), houseEditorEn('wide')) }),
      '390': () => under({ overlay: sheet(head('玩家手册', '火球术'), houseEditorEn('narrow', { tabs: 1 })) }),
    }),
  },
  {
    id: 'u7-14-overrides', group: G, title: 'P5.5 管理 → 房规（覆盖）：整个书架 · 一个包 · 单条，同一个列表', flow: 'Q14 · P5.5 §15 ④',
    goal: '看到哪些条被改了、改了什么、作用在哪一层；整批或逐条改作用范围、复原', primary: '[应用] / [复原]', patterns: 'List with bulk actions · Inline expand（看改了什么）· Grouped list', laws: 'Hick（按书分组、按种类筛）· Postel（复原前看得到改了什么）· Tesler（作用范围一个下拉整批改）',
    captions: { '1440': '宽窗 · 书架「官方」⋯ → 管理：整个书架的房规 / 别的版本，按书分组；展开一条看改了什么', '900': '宽窗 · 包 ⋯ → 管理 → 房规（覆盖）：只列和这个包有关的', '390': '窄屏 · 单条 ⋯ → 管理：这一条在每一层用的是哪一份' },
    diff: '宽窄同一结构；窄屏每行的作用于折到第二行，改作用于用批量栏或进单条管理。',
    notes: [
      [1, '范围', '入口：书架「官方」那一行 ⋯ →「管理：停用和覆盖」（同一个 ⋯ 里还有拉取更新、刷新书目）；包 / 书 ⋯ → 管理；单条 ⋯ → 管理。书架：当前规则下全部书和包；包 / 书：包头的全部来源 + 这个包自己那一份；单条：只这一条。设置 → 库 → 全局编辑 / 覆盖（u5-5）是全部规则', '【有】custom.edits / packEdits（G3）；单条 custom.edits({ refs })（7197c8d）'],
      [2, '全选 + 批量', '勾几条 → 选中的作用于（本战役 / 规则 / 全局）→［应用］', '【有】custom.moveEdits（G3）'],
      [3, '种类', '全部 / 房规 / 别的版本（别的包里的同一条）', '【有】EditRow.kind'],
      [4, '每一行', '条目 · 种类 · 改成谁 · 作用于（下拉，逐条改）·［看改了什么］·［复原］', '【有】EditRow；moveEdits 单条'],
      [5, '看改了什么', '展开：和原件比改了哪几项（字段中文名 · 改前 → 改后）+［编辑这条房规］［看原件］', '【有】library.editChanges（7197c8d；房规只列它自己写了的字段）'],
      [6, '复原', '回到原件；房规条目本身留着，之后还能再选回来', '【有】scoped.choose(…, null)'],
      [7, '单条：每一层', '本战役 → 规则 → 全局，上面的盖住下面的；生效的那层标「生效中」，被盖住的变浅', '【有】versions.chooseVersion（顺序）'],
      [8, '被盖住', '下层的覆盖照样能复原、能改', '—'],
    ],
    board: tri({
      '1440': () => under({ overlay: sheet(head('书架', '管理'), shelfEdits('wide', { range: 1, all: 2, apply: 2, kind: 3, row: 4, scope: 4, open: 5, body: 5, restore: 6 })) }),
      '900': () => ({ ...bg(), overlay: sheet(head('海盗战役', '管理'), packEdits('wide', { range: 1 })) }),
      '390': () => under({ overlay: sheet(entryHead({ back: '火球术', title: '管理' }), entryManage({ order: 7, win: 7, off: 8 })) }),
    }),
  },
]

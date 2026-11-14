// P6 线框零件：人物卡片、列表骨架、详情页（身份卡 / 战斗卡 / 属性卡 / 法术位 / 五个分页）。
// 例子里的名字取自 U6_视觉规格 的示例，**数值都是占位示例**：真实显示来自内核（只显示、不在前端算）。
import { btn, iconBtn, icon, pin, searchBox, seg, esc, badge } from '../../p5-wireframe/lib/ui.mjs'
import { dropdown } from '../../p5-wireframe/lib/parts.mjs'
import { ICONS } from '../../p5-wireframe/lib/icons.mjs'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// P6 新增图标（Phosphor Regular，@phosphor-icons/core@2.1.1，MIT）：拖动手柄、来源链接。进插件时要补进 src/ui/kit/icons.ts
const here = dirname(fileURLToPath(import.meta.url))
for (const n of ['dots-six-vertical', 'link-simple']) ICONS[n] = readFileSync(join(here, `../sources/phosphor-${n}.svg`), 'utf8').match(/<svg[^>]*>(.*)<\/svg>/s)[1]

export { icon, esc, btn, iconBtn, badge, seg, searchBox, dropdown, pin }
export const P = (n) => (n ? pin(n) : '')
export const ph = (t) => `<span class="pc-faint">${t}</span>`

/* ---------- 小件 ---------- */
export const av = (kind = 'user', n) => `<div class="pc-av">${P(n)}<div class="pc-av__img">${icon(kind === 'enemy' ? 'skull' : 'user', 28)}</div><span class="pc-av__type">${icon(kind === 'enemy' ? 'skull' : 'user', 14)}</span></div>`
export const meter = (cur, max, temp = 0) => {
  if (!max) return '<div class="pc-meter" aria-label="生命未知"></div>'
  const f = Math.min(100, (cur / max) * 100)
  return `<div class="pc-meter" role="meter" aria-valuenow="${cur}" aria-valuemin="0" aria-valuemax="${max}"><i style="width:${f}%" ${cur / max < 0.25 ? 'data-low="true"' : ''}></i>${temp ? `<b style="width:${Math.min(100 - f, (temp / max) * 100)}%"></b>` : ''}</div>`
}
export const pips = (n, on, { kind, small, temp = 0 } = {}) => `<span class="pc-pips" role="group">${Array.from({ length: n }, (_, i) => `<i class="pc-pip${small ? ' pc-pip--sm' : ''}" role="checkbox" aria-checked="${i < on}" data-on="${i < on}"${kind ? ` data-kind="${kind}"` : ''}></i>`).join('')}${Array.from({ length: temp }, () => '<i class="pc-pip" data-temp="true"></i>').join('')}</span>`
export const pill = (label, { x, add, fresh } = {}) => `<span class="pc-pill${add ? ' pc-pill--add' : ''}"${fresh ? ' data-new="true"' : ''}>${add ? icon('plus', 16) : ''}${label}${x ? `<button type="button" aria-label="移除">${icon('x', 16)}</button>` : ''}</span>`
export const tag = (t) => `<span class="pc-tag">${t}</span>`
export const box = (t) => `<span class="pd-box">${t}</span>`
export const tabs = (items, sel, n) => `<div class="pc-tabs" role="tablist">${P(n)}${items.map(([id, t]) => `<button class="pc-tab" role="tab" type="button" aria-selected="${id === sel}">${t}</button>`).join('')}</div>`
export const undo = (text, n) => `<span class="pc-undo"${text ? '' : ' data-empty="true"'}>${P(n)}<button type="button">${icon('arrow-counter-clockwise', 16)}<span class="pc-undo__txt">${text ? `撤销：${text}` : '没有可撤销的'}</span></button><button type="button" aria-label="打开改动记录">${icon('caret-down', 16)}</button></span>`
export const diff = (name, from, to) => `<div class="pc-diff"><span>${name}</span><span>${from}</span><span>${icon('arrow-right', 16)}</span><span>${to}</span></div>`

/* ---------- 人物卡片 ---------- */
export function card(o) {
  const { name, en, cls, rest, tags = [], hp, temp, ac, extra, pinned, sel, check, drag, building, warn, kind = 'user', n } = o
  const ident = building ? `<b>建卡中</b> · 第 ${building[0]} / ${building[1]} 步` : cls ? `<b>${cls}</b>${rest ? ` · ${rest}` : ''}` : rest
  const stats = building
    ? `<div class="pc-building">${btn('继续', { small: true })}</div>`
    : `<div class="pc-stats">${hp ? `<div class="pc-stat pc-stat--hp"><small>生命</small><b>${hp[0]} <i>/ ${hp[1]}${temp ? ` +${temp}` : ''}</i></b>${meter(hp[0], hp[1], temp)}</div>` : '<div class="pc-stat pc-stat--hp"></div>'}${ac != null ? `<div class="pc-stat"><small>AC</small><b>${ac}</b></div>` : ''}${extra ? extra.map(([k, v]) => `<div class="pc-stat pc-extra"><small>${k}</small><b>${v}</b></div>`).join('') : ''}</div>`
  return `<article class="pc-card" ${sel ? 'data-sel="true"' : ''} ${check != null ? `data-checkbox="true"${check ? ' data-check="true"' : ''}` : ''} ${drag ? 'data-drag="true"' : ''} ${building ? 'data-building="true"' : ''}>
${check != null ? `<span class="pc-chk"><span class="trpg-check" data-on="${!!check}"><span class="trpg-check__box">${check ? icon('check', 12) : ''}</span></span></span>` : ''}${drag ? `<span class="pc-handle">${icon('dots-six-vertical', 20)}</span>` : ''}
${av(kind)}<div class="pc-main"><div class="pc-name">${P(n)}${name}${en ? `<span>${en}</span>` : ''}${warn ? `<i class="trpg-icon" title="${warn}">${icon('warning', 16)}</i>` : ''}</div><div class="pc-id">${ident}</div>${tags.length ? `<div class="pc-tags">${tags.map(tag).join('')}</div>` : ''}</div>
${stats}${pinned ? `<span class="pc-pin">${icon('push-pin-fill', 16)}</span>` : ''}<span class="pc-more">${iconBtn('dots-three', '更多')}</span></article>`
}

/* ---------- 列表骨架 ---------- */
const CATS = [['users-three', '队伍', 4], ['user', 'NPC', 9], ['skull', '敌人', 2], ['list', '全部', 15]]
export const cats = (sel = 0, n) => `<div class="pc-cats" role="group">${P(n)}${CATS.map(([ic, t, c], i) => `<button class="pc-cat" type="button" aria-pressed="${i === sel}">${icon(ic, 20)}${t}<small>${c}</small></button>`).join('')}</div>`

/** 列表页（含并排的详情）。 */
export function listPage({ L, tab = 0, cards, detail, selectBar, actbar, tools = {}, pins = {}, newMenu, listOnly, extraBody = '' }) {
  const narrow = L === 'narrow'
  const top = `<div class="pc-top">${cats(tab, pins.cats)}<span class="pc-top__end">${narrow ? '' : btn('模板', { ic: 'copy', n: pins.tpl })}<span style="position:relative">${btn(narrow ? '新建' : '新建', { primary: true, ic: 'plus', n: pins.add })}${newMenu ?? ''}</span>${iconBtn('dots-three', '更多')}</span></div>`
  const bar = `<div class="pc-tools">${searchBox(tools.search ?? '搜 名字、种族、职业、标签（跨标签）', pins.search)}${btn('标签', { small: true, ic: 'caret-down' })}${btn(`排序：${tools.sort ?? '手动'}`, { small: true, ic: 'caret-down', n: pins.sort })}${btn('选择', { small: true, n: pins.sel })}${tools.count === false ? '' : `<span class="pc-tools__count">${tools.count ?? '显示 4 / 共 4'}</span>`}</div>`
  return `<div class="pc-root">${top}${selectBar ?? ''}${selectBar ? '' : bar}<div class="pc-body"><div class="pc-list">${cards}</div>${listOnly ? '' : `<div class="pc-detail">${detail ?? ''}</div>`}${extraBody}${actbar ?? ''}</div></div>`
}

/* ---------- 详情页 ---------- */
const AB = [['力量', 8, '−1', '−1', 0], ['敏捷', 14, '+2', '+2', 0], ['体质', 12, '+1', '+1', 0], ['智力', 16, '+3', '+5', 1], ['感知', 10, '+0', '+2', 1], ['魅力', 10, '+0', '+0', 0]]
export const abilities = (o = {}) => `<section class="pd-card">${P(o.n)}<h3 class="pd-card__h">属性${o.noLegend ? '' : `<span class="pd-legend" style="margin-left:auto">${icon('dice-five', 16)} 点检定 / 豁免数字 = 送去骰盘</span>`}<span class="pd-end" ${o.noLegend ? 'style="margin-left:auto"' : ''}>${iconBtn('pencil-simple', '编辑属性')}</span></h3><div class="pd-abs">${AB.map(([k, v, c, s, prof], i) => `<div class="pd-ab" ${o.hover === i ? 'data-hover="true"' : ''}><small>${k}</small><b>${v}</b><span>检定 ${c}</span><span>豁免 ${s}${prof ? ' <em>●</em>' : ''}</span></div>`).join('')}</div></section>`

export const combat = (o = {}) => `<section class="pd-card">${P(o.n)}<h3 class="pd-card__h">战斗<span class="pd-end">${iconBtn('pencil-simple', '读数')}</span></h3><div class="pd-combat"><div class="pd-cell"><small>AC</small><b>12</b></div><div class="pd-cell"><small>先攻 ${icon('dice-five', 16)}</small><b>+2</b></div><div class="pd-cell"><small>速度</small><b>30</b></div><div class="pd-cell"><small>熟练加值</small><b>+2</b></div></div><div class="pd-row"><span class="pd-passive">被动察觉 <b>10</b></span><span class="pd-passive">被动洞察 <b>12</b></span></div></section>`

export const slots = (o = {}) => `<section class="pd-card">${P(o.n)}<h3 class="pd-card__h">法术位<span class="pd-end">${btn('短休', { small: true, quiet: true, n: o.rest })}${btn('长休', { small: true, quiet: true })}</span></h3><div class="pd-slots"><div class="pd-slot"><span>1 环</span>${pips(3, 2)}</div><div class="pd-slot"><span>2 环</span>${pips(2, 1)}</div></div></section>`

export const effects = (o = {}) => `<section class="pd-card">${P(o.n)}<h3 class="pd-card__h">状态与效果<span class="pd-end">${iconBtn('plus', '添加状态或效果', o.addPin)}</span></h3><div class="pd-row">${pill('祝福', { x: true, fresh: o.fresh })}${pill('倒地', { x: true })}<span class="pc-faint">状态与效果都是同一款药丸；点文字 = 资料弹窗</span></div></section>`

export function identity(o = {}) {
  const hp = o.hpEdit
    ? `<div class="pd-edit">${P(o.hpPin)}<label>当前<span class="trpg-input" data-focus="true">−7</span></label><label>上限<span class="trpg-input">18</span></label><label>临时<span class="trpg-input">3</span></label>${btn('完成', { small: true })}<span class="pd-preview">输入 −7 → <b>12 → 5 / 18</b>（按 Enter 才生效；Esc 还原）</span></div>`
    : `<div class="pd-hp__row"><span class="pd-hp__num">12 <i>/ 18</i></span><span class="pd-hp__temp">+3</span><span style="margin-left:auto">${iconBtn('pencil-simple', '编辑生命', o.hpPin)}</span></div>`
  return `<section class="pd-card"><div class="pd-id">${av('user', o.avPin)}<div class="pd-id__main"><div class="pd-name">${P(o.namePin)}盖尔<span>Gale</span></div>
<div class="pd-field">${P(o.clsPin)}法师（塑能）3 级<small>人类 · 学者</small></div><div class="pd-row">${btn('等级管理', { small: true, n: o.lvlPin })}<span class="pc-2" style="font-size:var(--fs-sm)">经验 900 / 2700</span></div>
<div class="pd-row">${pill('冒险者', { x: true })}${pill('深水', { x: true })}${pill('标签', { add: true })}</div></div></div>
<div class="pd-hp"><div class="pd-label">生命</div>${hp}${meter(o.hpEdit ? 12 : 12, 18, 3)}
<div class="pd-saves">${P(o.deathPin)}<div><span>死亡豁免</span>成功 ${pips(3, 0, { small: true })}&nbsp;&nbsp;失败 ${pips(3, 0, { small: true, kind: 'fail' })}</div><div><span>生命骰</span>d6 ${pips(3, 3, { small: true })}</div></div></div>${o.sync ? `<div class="pd-hint">${P(o.sync)}${icon('link-simple', 16)}<button class="trpg-link" type="button">3 项来源有更新 ›</button></div>` : ''}</section>`
}

const skill = (k, a, v, prof) => `<li><span class="pd-grow">${k} <small>${a}</small></span>${prof ? `<span class="pc-pips">${pips(1, 1, { small: true })}</span>` : ''}${box(v)}</li>`
export const pages = {
  action: (o = {}) => `<section class="pd-card"><h3 class="pd-card__h">行动</h3><ul class="pd-list"><li><span class="pd-grow">短剑 <small>近战 · 1 次</small></span>${box('命中 +4')}${box('伤害 1d6+2')}</li><li><span class="pd-grow">法杖 <small>近战</small></span>${box('命中 −1')}${box('伤害 1d6−1')}</li></ul>
<h3 class="pd-card__h">技能${seg([{ label: '全部', on: true }, { label: '熟练' }])}</h3><ul class="pd-list pd-two">${[['运动', '力量', '−1'], ['杂技', '敏捷', '+2'], ['奥秘', '智力', '+5', 1], ['历史', '智力', '+5', 1], ['洞察', '感知', '+2', 1], ['察觉', '感知', '+0']].map((r) => skill(...r)).join('')}</ul>
<div class="pd-hint">● 熟练　点方框 = 送去骰盘（P7 接线）</div></section>`,
  spell: () => `<section class="pd-card"><div class="pd-row"><span class="pc-pill">施法属性 智力</span><span class="pc-pill">法术豁免 DC 13</span><span class="pc-pill">法术攻击 +5</span></div>
<h3 class="pd-card__h">戏法</h3><ul class="pd-list"><li><span class="pd-grow"><button class="trpg-term trpg-link" style="text-decoration-style:dotted;color:inherit" type="button">火焰箭</button></span>${btn('施放', { small: true })}</li></ul>
<h3 class="pd-card__h">1 环 ${pips(3, 2, { small: true })}</h3><ul class="pd-list"><li><span class="pd-grow"><button class="trpg-term trpg-link" style="text-decoration-style:dotted;color:inherit" type="button">魔法飞弹</button> <small>已准备</small></span>${btn('施放', { small: true })}</li><li><span class="pd-grow"><button class="trpg-term trpg-link" style="text-decoration-style:dotted;color:inherit" type="button">侦测魔法</button> <small>已准备</small></span>${badge('专注 C')}${badge('仪式 R')}${btn('施放', { small: true })}</li></ul></section>`,
  cls: () => `<section class="pd-card"><h3 class="pd-card__h">职业</h3><ul class="pd-list"><li><span class="pd-grow"><button class="trpg-term trpg-link" style="text-decoration-style:dotted;color:inherit" type="button">法师</button> 3 级 <small>塑能学派</small></span></li></ul><h3 class="pd-card__h">特性</h3><ul class="pd-list"><li><span class="pd-grow"><button class="trpg-term trpg-link" style="text-decoration-style:dotted;color:inherit" type="button">奥术恢复</button></span>${pips(1, 1, { small: true })}<small>次数 1 / 1</small></li><li><span class="pd-grow"><button class="trpg-term trpg-link" style="text-decoration-style:dotted;color:inherit" type="button">施法</button></span></li><li><span class="pd-grow">某条特性 <small>资料不可用</small></span>${icon('warning', 16)}</li></ul></section>`,
  bag: () => `<section class="pd-card"><div class="pd-row">${btn('加物品', { small: true, ic: 'plus' })}<span class="pc-2" style="font-size:var(--fs-sm);margin-left:auto">负重 90.8 / 120</span></div>
<ul class="pd-list"><li><span class="pd-grow">短剑 <small>武器</small></span><span class="trpg-stepper"><button class="trpg-stepper__btn" type="button" aria-label="减少">${icon('minus', 14)}</button><b class="trpg-stepper__val" style="min-width:40px">1</b><button class="trpg-stepper__btn" type="button" aria-label="增加">${icon('plus', 14)}</button></span><small>2 磅</small><span class="trpg-switch-wrap"><span class="trpg-switch" data-on="true"></span></span></li>
<li><span class="pd-grow">▾ 背包 <small>容器 · 内含 3 件</small></span><small>5 磅</small></li><li data-indent="true"><span class="pd-grow">口粮 <small>消耗品</small></span><span class="trpg-stepper"><button class="trpg-stepper__btn" type="button">${icon('minus', 14)}</button><b class="trpg-stepper__val" style="min-width:40px">5</b><button class="trpg-stepper__btn" type="button">${icon('plus', 14)}</button></span></li><li data-indent="true"><span class="pd-grow">金币 (gp) <small>钱币也是物品</small></span><span class="trpg-stepper"><button class="trpg-stepper__btn" type="button">${icon('minus', 14)}</button><b class="trpg-stepper__val" style="min-width:40px">48</b><button class="trpg-stepper__btn" type="button">${icon('plus', 14)}</button></span></li></ul></section>`,
  story: () => `<section class="pd-card"><dl class="pc-kv"><dt>背景</dt><dd>学者</dd><dt>性格</dt><dd>${ph('可编辑文本')}</dd><dt>理想</dt><dd>${ph('可编辑文本')}</dd><dt>羁绊</dt><dd>${ph('可编辑文本')}</dd><dt>缺点</dt><dd>${ph('可编辑文本')}</dd><dt>传记</dt><dd>${ph('可编辑文本（在「编辑」里改）')}</dd></dl></section>`,
}
const TABS = [['action', '行动与技能'], ['spell', '法术'], ['cls', '职业与特性'], ['bag', '背包'], ['story', '背景故事']]

/** 详情页。split = 并排时在右半边（没有「‹ 人物」与上一位 / 下一位）。 */
export function detail(o = {}) {
  const L = o.L ?? 'wide'
  const narrow = L === 'narrow'
  const top = `<div class="pd-top">${o.split ? '' : `<button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button">${icon('caret-left', 16)}人物</button>`}<span class="pd-top__name pd-hide-760">盖尔<span>Gale</span></span>
<span class="pd-top__end">${o.draft ? `<span class="pd-top__draft">有未保存的编辑</span>` : ''}${o.split ? '' : `<span class="pd-hide-760">${iconBtn('caret-left', '上一位')}${iconBtn('caret-right', '下一位')}</span><span class="pd-top__sep"></span>`}${undo(o.undo === undefined ? 'HP 18→12' : o.undo, o.undoPin)}${o.draft ? btn('保存修改', { primary: true, small: true, n: o.savePin }) : ''}${iconBtn('dots-three', '更多')}</span></div>`
  const left = identity(o)
  const right = `<div class="pd-right">${combat({ n: o.combatPin })}${abilities({ hover: o.hover, n: o.abPin })}</div>`
  const rest = `${effects({ addPin: o.fxPin, fresh: o.fresh })}${slots({ rest: o.restPin })}`
  const sel = o.tab ?? 'action'
  const upper = o.pagesOnly ? '' : `<div class="pd-grid">${left}${right}</div><div class="pd-grid" style="grid-template-columns:1fr">${rest}</div>`
  const body = `<div class="pd-body">${upper}${tabs(TABS, sel, o.tabPin)}${pages[sel]()}<div class="pd-hint">${icon('dice-five', 16)} 点检定 / 豁免数字 = 送去骰盘 · 带 ✎ 的卡片可编辑</div></div>`
  const mini = narrow ? `<div class="pd-mini"><b class="pc-serif">12 / 18</b>${meter(12, 18, 3)}<span class="pc-2">AC</span><b class="pc-serif">12</b></div>` : ''
  return o.split ? `<div class="pd-pane">${top}${body}</div>` : `<div class="pc-root"><div class="pd-page">${top}${body}</div>${mini}</div>`
}

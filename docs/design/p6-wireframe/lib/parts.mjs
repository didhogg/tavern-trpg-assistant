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
export const av = (kind = 'user', n) => `<div class="pc-av">${P(n)}${icon(kind === 'enemy' ? 'skull' : 'user', 24)}</div>`
export const meter = (cur, max, temp = 0) => {
  if (!max) return '<div class="pc-meter" aria-label="生命未知"></div>'
  const f = Math.min(100, (cur / max) * 100)
  return `<div class="pc-meter" role="meter" aria-valuenow="${cur}" aria-valuemin="0" aria-valuemax="${max}"><i style="width:${f}%" ${cur / max < 0.25 ? 'data-low="true"' : ''}></i>${temp ? `<b style="width:${Math.min(100 - f, (temp / max) * 100)}%"></b>` : ''}</div>`
}
export const pips = (n, on, { kind, small, temp = 0 } = {}) => `<span class="pc-pips" role="group">${Array.from({ length: n }, (_, i) => `<i class="pc-pip${small ? ' pc-pip--sm' : ''}" role="checkbox" aria-checked="${i < on}" data-on="${i < on}"${kind ? ` data-kind="${kind}"` : ''}></i>`).join('')}${Array.from({ length: temp }, () => '<i class="pc-pip" data-temp="true"></i>').join('')}</span>`
export const pill = (label, { x, add, fresh } = {}) => `<span class="pc-pill${add ? ' pc-pill--add' : ''}"${fresh ? ' data-new="true"' : ''}>${add ? icon('plus', 16) : ''}${label}${x ? `<button type="button" aria-label="移除">${icon('x', 16)}</button>` : ''}</span>`
export const box = (t) => `<span class="pd-box">${t}</span>`
export const tabs = (items, sel, n) => `<div class="pc-tabs" role="tablist">${P(n)}${items.map(([id, t]) => `<button class="pc-tab" role="tab" type="button" aria-selected="${id === sel}">${t}</button>`).join('')}</div>`
export const undo = (text, n) => `<span class="pc-undo"${text ? '' : ' data-empty="true"'}>${P(n)}<button type="button">${icon('arrow-counter-clockwise', 16)}<span class="pc-undo__txt">${text ? `撤销：${text}` : '没有可撤销的'}</span></button><button type="button" aria-label="打开改动记录">${icon('caret-down', 16)}</button></span>`
export const diff = (name, from, to) => `<div class="pc-diff"><span>${name}</span><span>${from}</span><span>${icon('arrow-right', 16)}</span><span>${to}</span></div>`
const term = (t) => `<button class="trpg-term trpg-link" style="text-decoration-style:dotted;color:inherit" type="button">${t}</button>`

/* ---------- 列表：一块白板里的行 ---------- */
export function card(o) {
  const { name, en, cls, rest, tags = [], hp, temp, ac, pinned, sel, check, drag, building, warn, kind = 'user', n } = o
  const ident = building ? `<b>建卡中</b> · 第 ${building[0]} / ${building[1]} 步` : `${cls ? `<b>${cls}</b>` : ''}${rest ? ` · ${rest}` : ''}`
  const stats = building ? `<span class="pc-building">${btn('继续', { small: true })}</span>`
    : `<div class="pc-stats"><div class="pc-hp">${hp ? `<b>${hp[0]} <i>/ ${hp[1]}${temp ? ` +${temp}` : ''}</i></b>${meter(hp[0], hp[1], temp)}` : ''}</div>${ac != null ? `<div class="pc-ac"><small>AC</small><b>${ac}</b></div>` : '<div class="pc-ac"></div>'}</div>`
  return `<div class="pc-row" ${sel ? 'data-sel="true"' : ''} ${check != null ? `data-checkbox="true"${check ? ' data-check="true"' : ''}` : ''} ${drag ? 'data-drag="true"' : ''}>
${check != null ? `<span class="pc-chk"><span class="trpg-check" data-on="${!!check}"><span class="trpg-check__box">${check ? icon('check', 12) : ''}</span></span></span>` : ''}${drag ? `<span class="pc-handle">${icon('dots-six-vertical', 20)}</span>` : ''}
${av(kind)}<div class="pc-main"><div class="pc-name">${P(n)}${name}${en ? `<span>${en}</span>` : ''}${warn ? `<i class="trpg-icon" title="${warn}">${icon('warning', 16)}</i>` : ''}</div><div class="pc-id">${ident}</div>${tags.length ? `<div class="pc-tags">${tags.map((t) => `<span class="pc-tag">${t}</span>`).join('')}</div>` : ''}</div>${stats}<span class="pc-pinbtn">${iconBtn('push-pin-fill', pinned ? '取消置顶' : '置顶')}</span><span class="pc-more">${iconBtn('dots-three', '更多')}</span></div>`
}

const CATS = [['队伍', 4], ['NPC', 9], ['敌人', 2], ['全部', 15]]
export const cats = (sel = 0, n) => `${P(n)}<span class="trpg-seg" role="group">${CATS.map(([t, c], i) => `<button type="button" aria-pressed="${i === sel}">${t}<small>${c}</small></button>`).join('')}</span>`

/** 列表页：分段标签 + [＋新建] / 搜索 + 标签 + 排序 + 选择 / 一块白板里的行。点一行 = 进整页详情（不分栏）。 */
export function listPage({ L, tab = 0, cards, selectBar, actbar, tools = {}, pins = {}, newMenu }) {
  const top = `<div class="pc-top">${cats(tab, pins.cats)}<span class="pc-top__end"><span style="position:relative">${btn('新建', { primary: true, ic: 'plus', n: pins.add })}${newMenu ?? ''}</span>${iconBtn('dots-three', '更多')}</span></div>`
  const bar = `<div class="pc-tools">${searchBox(tools.search ?? '搜 名字、种族、职业、标签（跨标签）', pins.search)}${btn('标签', { small: true, ic: 'caret-down' })}${btn(`排序：${tools.sort ?? '手动'}`, { small: true, ic: 'caret-down', n: pins.sort })}${btn('选择', { small: true, n: pins.sel })}</div>`
  return `<div class="pc-root">${top}${selectBar ?? ''}${selectBar ? '' : bar}<div class="pc-scroll"><div class="pc-panel">${cards}</div></div>${actbar ?? ''}</div>`
}

/* ---------- 详情页：参考图的结构——第一屏全是战斗要素，下方分页；「行动」页宽屏并排多栏 ---------- */
// 数值都是占位示例（真实显示来自内核）；技能名 / 武器 / 法术只是示例，真实列表由库给。
const AB = [['力量', 8, '−1', '−1', 0], ['敏捷', 14, '+2', '+2', 0], ['体质', 12, '+1', '+1', 0], ['智力', 18, '+4', '+6', 1], ['感知', 12, '+1', '+3', 1], ['魅力', 10, '+0', '+0', 0]]
const MODS = [-1, 2, 1, 4, 1, 0]
const fmt = (n) => (n < 0 ? `−${-n}` : `+${n}`)
const SKILLS = [['运动', 0], ['杂技', 1], ['隐匿', 1], ['妙手', 1], ['奥秘', 3, 1], ['历史', 3, 1], ['调查', 3], ['自然', 3], ['宗教', 3], ['驯兽', 4], ['洞察', 4, 1], ['医药', 4], ['察觉', 4], ['生存', 4], ['欺瞒', 5], ['威吓', 5], ['表演', 5], ['游说', 5]]
const AK = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
const stepper = (n) => `<span class="trpg-stepper pd-step"><button class="trpg-stepper__btn" type="button" aria-label="减少">${icon('minus', 14)}</button><b class="trpg-stepper__val">${n}</b><button class="trpg-stepper__btn" type="button" aria-label="增加">${icon('plus', 14)}</button></span>`
const ico = (t) => `<span class="pd-ico">${t}</span>`
const row = (t, sub, end) => `<li>${ico(t[0])}<span class="pd-grow"><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span>${end ?? ''}</li>`
const colCard = (title, end, body) => `<section class="pd-col"><h3 class="pd-col__h">${title}${end ? `<span>${end}</span>` : ''}</h3>${body}</section>`

export const pages = {}
const TABS = [['action', '行动'], ['spell', '法术'], ['bag', '背包'], ['feat', '特性'], ['stats', '数值'], ['bg', '背景'], ['note', '笔记']]
const tabBody = {
  action: () => `<div class="pd-dash">
${colCard('行动', '', `<h4>攻击动作</h4><ul class="pd-list">${row('寒冰箭', '远程法术攻击 · 120 尺', '<b class="pd-r">+6 命中<small>1d10+4 冰冻</small></b>')}${row('法杖打击', '近战攻击 · 5 尺', '<b class="pd-r">+4 命中<small>1d6+2 钝击</small></b>')}</ul><h4>通用动作</h4><ul class="pd-list">${row('法术施放', '施放一个法术', '›')}${row('移动', '移动你的速度', '›')}${row('躲藏', '尝试隐藏自己', '›')}</ul>`)}
${colCard('已准备法术', '', `<ul class="pd-list">${row('魔法飞弹', '1 环 · 咒法', iconBtn('dots-three', '更多'))}${row('护盾术', '1 环 · 防护', iconBtn('dots-three', '更多'))}${row('侦测魔法', '1 环 · 预言 · 专注 · 仪式', iconBtn('dots-three', '更多'))}</ul><h4>其他法术</h4><ul class="pd-list">${row('寒冰箭', '戏法', iconBtn('dots-three', '更多'))}${row('火球术', '3 环 · 塑能', iconBtn('dots-three', '更多'))}</ul><button class="trpg-link" type="button">查看全部法术 ›</button>`)}
${colCard('装备与物品', btn('添加', { small: true, quiet: true, ic: 'plus' }), `<h4>武器</h4><ul class="pd-list">${row('法杖', '+4 攻击 · 1d6+2 钝击', iconBtn('dots-three', '更多'))}</ul><h4>护甲</h4><ul class="pd-list">${row('布甲', 'AC +3 · 轻甲', iconBtn('dots-three', '更多'))}</ul><h4>其他装备</h4><ul class="pd-list">${row('背包', '', iconBtn('dots-three', '更多'))}${row('旅行者服装', '', iconBtn('dots-three', '更多'))}${row('法术组件包', '', iconBtn('dots-three', '更多'))}</ul>`)}
${colCard('角色简介', iconBtn('pencil-simple', '编辑'), `<dl class="pc-kv pd-kv2"><dt>阵营</dt><dd>中立善良</dd><dt>种族</dt><dd>人类</dd><dt>背景</dt><dd>学者</dd></dl><h4>个性</h4><p class="pd-p">${ph('可编辑文本')}</p><h4>给 AI 的说明</h4><p class="pd-p">${ph('可编辑文本')}</p><h4>笔记</h4><p class="pd-p">${ph('暂无笔记')}</p>`)}</div>`,
  spell: () => `<div class="pd-dash pd-dash--2">${colCard('法术位 · 智力 · 豁免 DC 13 · 攻击 +5', '', `<div class="pd-slots"><span class="pd-chip">1 环 ${pips(4, 2, { small: true })} 2/4</span><span class="pd-chip">2 环 ${pips(3, 1, { small: true })} 1/2</span></div><h4>戏法</h4><ul class="pd-list">${row('火焰箭', '', btn('施放', { small: true }))}${row('法师之手', '', btn('施放', { small: true }))}</ul>`)}${colCard('已准备', '', `<ul class="pd-list">${row('魔法飞弹', '1 环', btn('施放', { small: true }))}${row('护盾术', '1 环', btn('施放', { small: true }))}${row('侦测魔法', '1 环 · 专注 · 仪式', btn('施放', { small: true }))}${row('火球术', '3 环', btn('施放', { small: true }))}</ul>`)}</div>`,
  bag: () => `<div class="pd-dash pd-dash--2">${colCard('物品', btn('加物品', { small: true, ic: 'plus' }), `<div class="pd-tbl pd-tbl--bag"><div><span>法杖 <small>武器</small></span>${stepper(1)}<small>4 磅</small><span class="trpg-switch-wrap"><span class="trpg-switch" data-on="true"></span></span></div><div><span>▾ 背包 <small>容器 · 3 件</small></span><span></span><small>5 磅</small><span></span></div><div data-indent="true"><span>口粮</span>${stepper(5)}<small>5 磅</small><span></span></div><div data-indent="true"><span>金币 (gp) <small>钱币</small></span>${stepper(48)}<small>—</small><span></span></div></div>`)}${colCard('负重', '', `<p class="pd-p">90.8 / 120 磅</p>${meter(91, 120)}`)}</div>`,
  feat: () => `<div class="pd-dash pd-dash--2">${colCard('职业', '', `<ul class="pd-list">${row('法师', '3 级 · 塑能学派', '')}</ul><h4>特性</h4><ul class="pd-list">${row('施法', '法师 1', '')}${row('奥术恢复', '次数 1 / 1', pips(1, 1, { small: true }))}${row('奥术传统：塑能', '法师 2', '')}</ul>`)}${colCard('种族与背景', '', `<ul class="pd-list">${row('人类', '种族', '')}${row('学者', '背景', '')}${row('某条特性', '资料不可用', icon('warning', 16))}</ul>`)}</div>`,
  stats: () => `<div class="pd-dash pd-dash--2">${colCard('技能', `<span class="pd-legend">● 熟练</span>${seg([{ label: '全部', on: true }, { label: '熟练' }])}`, `<div class="pd-skills">${SKILLS.map(([k, a, p]) => `<div><i class="pc-pip pc-pip--sm" data-on="${!!p}"></i><span>${k}</span><small>${AK[a]}</small><b>${fmt(MODS[a] + (p ? 3 : 0))}</b></div>`).join('')}</div>`)}${colCard('熟练项与感官', '', `<dl class="pc-kv pd-kv2"><dt>被动察觉</dt><dd>11</dd><dt>被动洞察</dt><dd>14</dd><dt>语言</dt><dd>通用语、精灵语</dd><dt>工具</dt><dd>${ph('无')}</dd></dl>`)}</div>`,
  bg: () => `<div class="pd-dash pd-dash--2">${colCard('背景故事', iconBtn('pencil-simple', '编辑'), `<dl class="pc-kv pd-kv2"><dt>性格</dt><dd>${ph('可编辑文本')}</dd><dt>理想</dt><dd>${ph('可编辑文本')}</dd><dt>羁绊</dt><dd>${ph('可编辑文本')}</dd><dt>缺点</dt><dd>${ph('可编辑文本')}</dd><dt>传记</dt><dd>${ph('可编辑文本')}</dd></dl>`)}</div>`,
  note: () => `<div class="pd-dash pd-dash--2">${colCard('笔记', iconBtn('pencil-simple', '编辑'), `<p class="pd-p">${ph('暂无笔记')}</p>`)}</div>`,
}

/** 详情页（整页）：第一屏 = 身份 + 生命 + AC/先攻/速度/熟练 + 六属性 + 状态与法术位；下方分页；底部固定条。 */
export function detail(o = {}) {
  const top = `<div class="pd-top"><button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button">${icon('caret-left', 16)}人物</button><span class="pd-top__name">盖尔</span>
<span class="pd-top__end">${iconBtn('caret-left', '上一位')}${iconBtn('caret-right', '下一位')}<span class="pd-top__sep"></span>${undo(o.undo === undefined ? 'HP 18→12' : o.undo, o.undoPin)}${iconBtn('dots-three', '更多')}</span></div>`
  const hpBody = o.hpEdit
    ? `<div class="pd-edit">${P(o.hpPin)}<span class="pd-edit__mode">伤害</span><span class="trpg-input" data-focus="true">7</span>${btn('应用', { small: true, primary: true })}${btn('取消', { small: true })}<span class="pd-preview">12 → <b>5 / 18</b>（Enter 应用 · Esc 取消）</span></div>`
    : `<div class="pd-hpbtn">${P(o.hpPin)}${btn('伤害', { small: true, ic: 'minus' })}${btn('治疗', { small: true, ic: 'plus' })}${btn('临时', { small: true })}</div>`
  const ov = `<div class="pd-ov">
<div class="pd-id"><div class="pd-pic">${av('user', o.avPin)}<small>更换头像</small></div><div class="pd-id__main"><div class="pd-name">${P(o.namePin)}盖尔 ${icon('star-fill', 18)}<span>Gale</span></div><div class="pd-sub">${P(o.clsPin)}法师 3 · 人类 · 学者 · 中立善良　${btn('等级管理', { small: true, n: o.lvlPin })}</div><div class="pd-row"><span class="pd-sel">${icon('users', 16)} 队伍成员 · 博德小队 ${icon('caret-down', 14)}</span><span class="pd-sel">随行 ${icon('caret-down', 14)}</span></div>${o.sync ? `<div class="pd-hint">${P(o.sync)}${icon('link-simple', 16)}<button class="trpg-link" type="button">3 项来源有更新 ›</button></div>` : ''}</div></div>
<div class="pd-hpcard"><div class="pd-hpcard__t"><small>生命值</small><span>临时 +3</span></div><b>12<i> / 18</i></b>${meter(12, 18, 3)}${hpBody}</div>
<div class="pd-stats4"><div><small>AC</small><b>12</b></div><div><small>先攻 ${icon('dice-five', 14)}</small><b>+2</b></div><div><small>速度</small><b>30 尺</b></div><div><small>熟练</small><b>+2</b></div><p>被动：察觉 11 · 洞悉 11 · 调查 14</p></div></div>
<div class="pd-abs">${AB.map(([k, v, c, sv, prof], i) => `<div class="pd-ab" ${o.hover === i ? 'data-hover="true"' : ''}><small>${k}</small><b>${c}</b><span class="pd-ab__v">${v}</span><span class="pd-ab__s">${prof ? '<em>●</em> ' : ''}豁免 ${sv}</span></div>`).join('')}</div>
<div class="pd-two"><div class="pd-fx">${P(o.fxPin)}<span class="pd-label">状态</span>${pill('专注 · 护盾术', { x: true, fresh: o.fresh })}${pill('中毒', { x: true })}${pill('状态', { add: true })}</div>
<div class="pd-slots">${P(o.slotPin)}<span class="pd-label">法术位</span><span class="pd-chip">1 环 ${pips(4, 2, { small: true })} 2/4</span><span class="pd-chip">2 环 ${pips(3, 1, { small: true })} 1/2</span></div></div>
<div class="pd-line">${P(o.deathPin)}<span>死亡豁免 成功 ${pips(3, 0, { small: true })} 失败 ${pips(3, 0, { small: true, kind: 'fail' })}</span><span>生命骰 d6 ${pips(3, 3, { small: true })}</span><span>灵感 ${pips(1, 0, { small: true })}</span><span>力竭 0</span></div>`
  const sel = o.tab ?? 'action'
  const tabsHtml = `<div class="pc-tabs" role="tablist">${P(o.tabPin)}${TABS.map(([id, t]) => `<button class="pc-tab" role="tab" type="button" aria-selected="${id === sel}">${t}</button>`).join('')}</div>`
  const upper = o.tabsOnly ? '' : ov
  const bar = `<div class="pd-bar"><span class="pd-bar__hp"><b>12 / 18</b>${meter(12, 18, 3)}<span class="pc-2">AC</span><b>12</b></span><span class="pd-bar__st">${o.draft ? '<span class="pd-top__draft">有未保存的编辑</span>' : `${icon('check', 16)} 已保存`}</span><span class="pd-bar__act">${btn('短休', { n: o.restPin })}${btn('长休')}${o.draft ? btn('保存修改', { primary: true, n: o.savePin }) : ''}</span></div>`
  return `<div class="pc-root"><div class="pd-page">${top}<div class="pd-wrap">${upper}${tabsHtml}${tabBody[sel]()}</div></div>${bar}</div>`
}

export const grp = (title, n) => `<div class="pc-grp">${icon('users-three', 16)}${title} <small>${n}</small></div>`

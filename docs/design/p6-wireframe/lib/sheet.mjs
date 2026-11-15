// 角色表 v5：逐栏对照 Tidy5e（foundry-vtt-tidy-5e-sheets-main/src/sheets/quadrone/actor/）。每个块的出处写在注释里：T:文件。
// 页身 = 左侧栏（可折叠）+ 分页内容〔T:CharacterSheet.svelte sheet-body〕；页头 = 名字行 / 副标题行 / 等级块 / 战斗块 + 属性块 / 生命区〔T: <header>〕。
// 每个模块右上角一个 ✎（一直可见，位置固定；驾驶员 2026-11-15）；自动值一律普通文字，手改去抽屉（lib/override.mjs）。示例数值是占位，真实值由内核给。
import { icon, btn, iconBtn, P, dots, bar, filt, roll, searchBox } from './parts.mjs'
import { bodies } from './tabs.mjs'

export const pen = (label, n) => `<button class="sh-pen" type="button" aria-label="${label}" title="${label}">${P(n)}${icon('pencil-simple', 14)}</button>`
export const man = (o, k) => (o.man ?? []).includes(k)
/** 下拉菜单（行内渲染，挨着触发它的按钮）：items = [文字, 'danger' | 'sep' | 空] */
export const menu = (items, o = {}) => `<div class="sh-menu"${o.right ? ' data-right="true"' : ''}>${items.map(([t, k]) => (k === 'sep' ? '<hr>' : `<div class="sh-menu__i${k === 'danger' ? ' danger' : ''}">${t}</div>`)).join('')}</div>`
export const mrel = (inner) => `<span class="sh-mrel">${inner}</span>`
/** 标签行（T:tabs-row；标签名对照：Sheet=行动 · Character=属性 · Inventory=背包 · Spellbook=法术 · Features=特性 · Effects=效果 · Biography=背景 · Journal=日志） */
export const TABS = [['action', '行动'], ['attr', '属性'], ['bag', '背包'], ['spell', '法术'], ['feat', '特性'], ['effect', '效果'], ['bio', '背景'], ['note', '日志']]
export const AB = [['力量', '−1', 8, '−1'], ['敏捷', '+2', 14, '+2'], ['体质', '+1', 12, '+1'], ['智力', '+4', 18, '+6', 1], ['感知', '+1', 12, '+3', 1], ['魅力', '+0', 10, '+0']]
export const AK = ['力', '敏', '体', '智', '感', '魅']
export const MOD = [-1, 2, 1, 4, 1, 0]
export const f = (n) => (n < 0 ? `−${-n}` : `+${n}`)
// [名字, 属性序号, 熟练级别 0 无 / 1 熟练 / 2 专精 / 'h' 半熟练]：技能名单由数据给，这里是示例
export const SK = [['杂技', 1], ['驯兽', 4], ['奥秘', 3, 1], ['运动', 0], ['欺瞒', 5], ['历史', 3, 1], ['洞悉', 4, 1], ['威吓', 5], ['调查', 3, 1], ['医药', 4], ['自然', 3], ['察觉', 4, 2], ['表演', 5], ['游说', 5], ['宗教', 3], ['巧手', 1], ['隐匿', 1], ['求生', 4]]

/* ---------- 应用条（不是 Tidy5e 的：返回 / 上一位下一位 / 撤销 / 队伍 / 随行；需求 R08 R09 R25） ---------- */
export const top = (o = {}) => `<div class="sh-top"><button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button">${icon('caret-left', 16)}人物</button><span class="sh-top__name">盖尔</span><button class="sh-dk" type="button">${icon('users', 14)} 队伍 ${icon('caret-down', 12)}</button><button class="sh-dk" type="button">随行 ${icon('caret-down', 12)}</button>${o.sync ? `<button class="sh-dk" type="button">${icon('link-simple', 14)} 3 项来源有更新</button>` : ''}
<span class="sh-top__end">${P(o.nNav)}${iconBtn('caret-left', '上一位')}${iconBtn('caret-right', '下一位')}
<span class="sh-undo">${P(o.nUndo)}<button type="button">${icon('arrow-counter-clockwise', 16)}<span class="sh-undo__txt">撤销：${o.undo ?? '盖尔 生命 18→12'}</span></button><button type="button" aria-label="改动记录">${icon('caret-down', 16)}</button></span>${mrel(iconBtn('dots-three', '更多') + (o.topMenu ? menu([['存入我的库…'], ['复制一份'], ['移到 ▸ NPC / 敌人'], ['', 'sep'], ['删除', 'danger']], { right: true }) : ''))}</span></div>`

/* ---------- 页头 ---------- */
const dot = '<i class="sh-dotsep"></i>'
// ⑤ 生命区 T: actor-vitals-container。当前 / 临时生命可以原地改；生命骰、力竭、死亡豁免是三个文字按钮，各开一个抽屉（改数量 / 掷骰；Tidy5e 是骷髅小图标，驾驶员 11-15 否决）。
function vitals(o) {
  const edit = o.hpEdit
  const cur = edit ? `<span class="sh-hpin">−7</span>` : `<button class="sh-hpnow" type="button" title="点一下直接改当前生命">${o.dying ? 0 : 12}</button>`
  const maxT = man(o, 'hpmax') ? '19' : '18'
  const tempPop = o.tempPop ? `<div class="sh-pop2">${P(o.nTemp)}<label>临时<span class="sh-in" data-focus="true">3</span></label><label>Max 调整<span class="sh-in">0</span></label><button class="sh-dk" type="button">完成</button></div>` : ''
  const death = o.dying ? `<button class="sh-vbtn sh-vbtn--wide" type="button" data-hot="true">${P(o.nDeath)}死亡豁免<b>成功 1 · 失败 0</b></button>` : `<button class="sh-vbtn sh-vbtn--wide" type="button">${P(o.nDeath)}死亡豁免<b>—</b></button>`
  return `<section class="sh-mod sh-vit">${pen('最大生命的来源条目', o.nPenHp)}${P(o.nHp)}<div class="sh-hp__t">生命值</div>
<div class="sh-hp__v">${cur}<span class="sh-hpmax${man(o, 'hpmax') ? ' sh-man' : ''}">/ ${maxT}</span><span class="sh-mrel"><button class="sh-tmp" type="button" title="点一下改临时生命（Max / Temp）">+3 临时</button>${tempPop}</span></div>
${bar(o.dying ? 0 : 12, 18, 3)}${edit ? `<div class="sh-hp__pre">生命 12 → <b>5</b> / 18　Enter 生效 · Esc 还原</div>` : ''}
<div class="sh-vgrid"><button class="sh-vbtn" type="button" title="生命骰：改数量 / 掷一颗">${P(o.nHd)}生命骰<b>3/3</b></button><button class="sh-vbtn" type="button" title="力竭等级">${P(o.nExh)}力竭<b>2 级</b></button>${death}</div></section>`
}
const FACTS = [['种族', '人类'], ['背景', '学者'], ['体型', '中型'], ['类型', '类人'], ['速度', '步行 30 尺'], ['感官', '黑暗视觉 60 尺'], ['法术', '智力 DC 14']]
export function hero(o = {}) {
  const portrait = `<div class="sh-portrait">${P(o.nAv)}<button class="sh-pic" type="button" title="更换头像：链接或上传">${icon('user', 56)}<i class="sh-pic__edit">${icon('image', 14)}</i></button></div>`
  const idtext = `<div class="sh-idtext"><div class="sh-namerow"><h1 class="sh-name">${P(o.nName)}盖尔<span class="sh-star">${icon('star-fill', 16)}</span><small>Gale</small>${pen('身份：名字、阵营，以及种族 / 背景 / 体型 / 速度 / 感官各自的来源', o.nPenId)}</h1></div>
<div class="sh-quick"><b>法师 3</b><span>人类</span><span>中立善良</span></div><span class="sh-rest">${P(o.nRest)}${btn('短休', { small: true })}${btn('长休', { small: true })}</span></div>`
  const facts = `<dl class="sh-facts">${FACTS.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`
  const lvl = `<section class="sh-mod sh-lvl">${pen('等级与熟练：经验、职业等级、熟练加值的来源', o.nPenLv)}<div class="sh-lvl__c"><small>等级</small><b${man(o, 'lv') ? ' class="sh-man"' : ''}>3</b></div><div class="sh-lvl__c"><small>熟练加值</small><b>+2</b></div><button class="sh-lvl__i" type="button" title="灵感">${icon('star', 16)}<span>灵感</span></button>
<div class="sh-lvl__x"><span>经验 <b>900</b> / 2,700</span>${bar(900, 2700, 0, { plain: true })}</div><button class="sh-dk sh-lvl__m" type="button">等级管理 ${icon('caret-down', 12)}</button></section>`
  const cmb = `<section class="sh-mod sh-cmb">${pen('AC、先攻、专注的来源条目', o.nPenCb)}<div class="sh-tile"><small>AC</small><b${man(o, 'ac') ? ' class="sh-man"' : ''}>12</b></div><div class="sh-tile"><small>先攻 ${icon('dice-five', 12)}</small><b>+2</b></div><div class="sh-tile"><small>专注</small><b>+1</b></div></section>`
  const attrs = `<section class="sh-mod sh-attrs">${pen('属性值的来源条目', o.nPenAb)}${P(o.nAb)}${AB.map(([k, m, v, s, p], i) => `<div class="sh-attr"><small>${k}</small><b${i === 3 && man(o, 'int') ? ' class="sh-man"' : ''}>${i === 3 && man(o, 'int') ? '+5' : m}</b><span>${i === 3 && man(o, 'int') ? 20 : v}</span><em${p ? ' data-prof="true"' : ''}>${p ? '● ' : ''}豁免 ${s}</em></div>`).join('')}</section>`
  return `<div class="sh-head"><aside class="sh-vcol">${portrait}${vitals(o)}</aside><div class="sh-head__main"><div class="sh-idrow">${idtext}${lvl}</div>${facts}<div class="sh-statrow">${cmb}${attrs}</div></div></div>`
}
export const tabsRow = (sel, o = {}) => `<div class="sh-tabs" role="tablist"><button class="sh-sidetoggle" type="button" aria-label="折叠 / 展开侧栏" title="折叠 / 展开侧栏">${icon('caret-left', 16)}</button>${P(o.nTabs)}${TABS.map(([id, t]) => `<button class="sh-tab" role="tab" type="button" aria-selected="${id === sel}">${t}</button>`).join('')}${o.draft ? `<span class="sh-tabs__end"><span class="sh-dock__st" data-draft="true">● 有未保存的编辑</span>${btn('保存修改', { primary: true, small: true, n: o.nSave })}</span>` : ''}</div>`

/* ---------- 卡片：标题行 + 右上角 ✎（所有卡一个样式、一个位置） ---------- */
export const card = (title, body, { ic, cols = [], penLabel, n, np } = {}) => `<section class="sh-card"><header class="sh-card__h">${ic ? icon(ic, 14) : ''}<h3>${P(n)}${title}</h3>${cols.map((t) => `<span class="sh-card__c">${t}</span>`).join('')}${penLabel ? pen(penLabel, np) : ''}</header>${body}</section>`
const prof = (v) => `<i class="sh-pt" data-on="${v ?? 0}"></i>`
const skrow = (name, ab, p, val, pass) => `<div class="sh-skr"><span>${prof(p)}</span><small>${ab}</small><b>${name}</b><span class="sh-skv">${roll(val)}</span>${pass == null ? '<span></span>' : `<span class="sh-skp">${pass}</span>`}</div>`
/** 技能卡（T:SkillsCard：熟练点 · 属性缩写 · 名称 · 加值（点 = 掷）· 被动） */
export const skillsCard = (o = {}) => card('技能', SK.map(([k, a, p]) => skrow(k, AK[a], p, f(MOD[a] + (p === 2 ? 4 : p ? 2 : 0)), 10 + MOD[a] + (p === 2 ? 4 : p ? 2 : 0))).join(''), { cols: ['加值', '被动'], penLabel: '来源条目：熟练级别、加值', n: o.nSk, np: o.nPenSk })
/** 工具熟练卡（T:ToolsCard：锤子卡头；注意这是「工具熟练」，工具物品在背包的「工具」分组） */
export const toolsCard = (o = {}) => card('工具熟练', skrow('书法家工具', '智', 1, '+4'), { ic: 'flask', cols: ['加值', ''], penLabel: '来源条目：工具熟练', np: o.nPenTool })
/** 左侧栏（T:CharacterSidebar：[技能 | 收藏] 标签 + 技能卡 + 工具熟练卡） */
const favs = () => card('收藏', [['匕', '匕首', '武器 · 近战', '+4'], ['火', '火焰箭', '戏法 · 120 尺', '+6'], ['奥', '奥术恢复', '职业特性', '1/1']].map(([ch, n, sub, v]) => `<div class="sh-fav"><i>${ch}</i><div><b>${n}</b><small>${sub}</small></div><span>${roll(v)}</span></div>`).join('') + '<p class="sh-note">在行里点 ⋯ ▸ 置顶到收藏，就会出现在这里</p>', { penLabel: '整理收藏' })
export const sidebar = (o = {}) => `<aside class="sh-side"><div class="sh-side__tabs">${P(o.nSide)}<button type="button" aria-pressed="${!o.fav}">技能</button><button type="button" aria-pressed="${!!o.fav}">收藏</button></div>${o.fav ? favs() : `${skillsCard(o)}${toolsCard(o)}`}</aside>`

export function detail(o = {}) {
  const sel = o.tab ?? 'action'
  const upper = o.tabsOnly ? '' : hero(o)
  const body = `<div class="sh-body${o.noSide ? '' : ' has-side'}">${o.noSide ? '' : sidebar(o)}<div class="sh-main">${bodies[sel](o)}</div></div>`
  return `<div class="sh-root">${top(o)}<div class="sh-scroll">${upper}${tabsRow(sel, o)}${body}</div></div>`
}

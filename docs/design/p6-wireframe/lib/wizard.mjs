// 分步建卡 v4：版式照 morii-vtt QuickCreateSheet（左侧步骤清单，做完打勾、可随时点回任意一步；右侧当前步；底部 取消 / 创建）。
// 步骤照内核：规则数据 kernel.build = 种族 · 背景 · 职业 · 子职业 · 专长 · 可选特性（src/library/scopes.json）；
// 每选一件条目，内核 buildSteps 列出它带来的成长步骤（生命值 / 豁免与技能等熟练 / 属性提升 / 给物品 / 选物品 / 子职业 / 体型），界面只渲染。
// 示例：新人物「伊娃」= 半精灵 · 侍僧 · 牧师 1 级 · 生命领域（PHB 2014）。
import { icon, btn, searchBox, P, filt, sec, it, tr, c, tbl, wzModal, step } from './parts.mjs'

export const STEPS = [
  ['name', '名字', '伊娃'], ['race', '种族', '半精灵'], ['bg', '背景', '侍僧'], ['class', '职业', '牧师 1 级'], ['sub', '子职业', '生命领域'],
  ['feat', '专长', '这个人物不需要'], ['opt', '可选特性', '这个人物不需要'], ['ab', '属性值', '标准数组'], ['eq', '装备', '硬头锤 皮甲 轻弩'], ['done', '完成', '检查后创建'],
]
/** 左栏：每步一行 = 圆点（序号 / ✓）+ 名字 + 选了什么。state：done 已选 / skip 跳过（进待填）/ none 本人物不需要（内核没列这一步）/ todo */
export function rail(cur, states = {}, n) {
  const ci = STEPS.findIndex(([id]) => id === cur)
  return `<nav class="wz-rail" aria-label="建卡步骤">${P(n)}${STEPS.map(([id, name, sub], i) => {
    const s = states[id] ?? (id === 'feat' || id === 'opt' ? 'none' : i < ci ? 'done' : 'todo')
    const label = s === 'skip' ? '跳过了 · 进待填清单' : s === 'todo' ? (i === ci ? '正在填' : '') : sub
    return `<div class="wz-st" data-s="${s}"${i === ci ? ' aria-current="step"' : ''}><i>${s === 'done' ? icon('check', 12) : i + 1}</i><b>${name}</b><small>${label}</small></div>`
  }).join('')}</nav>`
}
const foot = (o = {}) => `<div class="wz-foot">${P(o.n)}${o.first || o.last ? '' : btn('跳过此步', { quiet: true })}<small>关掉窗口 = 存成「建卡中」人物，不丢</small><span class="wz-foot__sp"></span>${o.first ? '' : btn('上一步', { ic: 'caret-left' })}${o.last ? btn('创建伊娃', { primary: true, n: o.nGo }) : btn('下一步', { primary: true })}</div>`
const head = (h, p, n) => `<div class="wz-head">${P(n)}<h2>${h}</h2><p>${p}</p></div>`
const opts = (a) => `<div class="wz-opts">${a.map(([t, on, off]) => `<span class="wz-opt"${on ? ' data-on="true"' : ''}${off ? ' data-off="true"' : ''}>${on ? icon('check', 12) : ''}${t}</span>`).join('')}</div>`
/** 资料片里的一条「选了它之后要做的选择」：内核 buildSteps 的一步。auto = 内核自动定，用户不用选 */
const ch = (title, state, body, { auto, n } = {}) => `<div class="wz-ch"${auto ? ' data-auto="true"' : ''}>${P(n)}<b>${title}<small${state === '已选好' || auto ? ' data-done="true"' : ''}>${auto ? '自动' : state}</small></b>${body ?? ''}</div>`
const card = (name, sub, dl, chs, { n, desc } = {}) => `<aside class="wz-card">${P(n)}<header><b>${name}</b><small>${sub}</small></header><dl>${dl.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>${desc ? `<p>${desc}</p>` : ''}${chs}</aside>`
const pick = (cols, labels, rows, sel, { tools, n, keep = [0] } = {}) => {
  const w = cols.split(' ').slice(1)
  const nc = ['minmax(0,1fr)', ...keep.map((k) => w[k])].join(' ')
  const o = (i) => (keep.includes(i) ? '' : ' class="sh-opt"')
  const head = `<div class="sh-sec"><b>${labels[0]} <small>${rows.length}</small></b>${labels.slice(1).map((l, i) => `<span${o(i)}>${l}</span>`).join('')}</div>`
  return `<div class="wz-pick">${P(n)}<div class="sh-tools">${tools ?? searchBox('搜 名字')}${filt(['全部来源', 'PHB', '我的库'], 0)}</div><div class="sh-tbl" style="--cols:${cols};--cols-n:${nc}">${head}${rows.map((r, i) => tr([it(r[0][0], r[0], r[1]), ...r.slice(2).map((v, j) => `<span${o(j)}>${v}</span>`)], i === sel ? ' aria-selected="true"' : '')).join('')}</div></div>`
}
const page = (cur, inner, o = {}) => `<div class="wz">${rail(cur, o.states, o.nRail)}<div class="wz-main">${inner}${foot({ first: cur === 'name', last: cur === 'done', n: o.nFoot, nGo: o.nGo })}</div></div>`

export const steps = {
  name: (o = {}) => page('name', `${head('名字', '只有名字必填；后面每一步都能跳过，跳过的放进「待填」清单，之后在人物页补。', o.nHead)}<div class="wz-body" data-one="true"><div class="wz-form">
<div class="trpg-field"><label class="trpg-field__label">名字 <span class="sh-warn">*</span></label><div class="trpg-input" style="border-color:var(--primary)">伊娃</div></div>
<div class="trpg-field"><label class="trpg-field__label">头像（图片链接，可不填）</label><div class="trpg-input"><span class="sh-3">https://…</span></div></div>
<div class="trpg-field"><label class="trpg-field__label">放进</label><div style="display:flex;gap:6px">${filt(['队伍', 'NPC', '敌人'], 0)}</div><p class="trpg-hint">默认是你打开建卡时所在的分类，以后可以换。</p></div></div></div>`, o),

  race: (o = {}) => page('race', `${head('种族', '左边选一个，右边是它的资料和它要你做的选择。', o.nHead)}<div class="wz-body">
${pick('minmax(0,1fr) 54px 54px 120px 54px', ['种族', '体型', '速度', '属性', '来源'], [['人类', '', '中型', '30', '全部 +1', 'PHB'], ['半精灵', '黑暗视觉 60 尺', '中型', '30', '魅 +2，任二 +1', 'PHB'], ['矮人（山地）', '', '中型', '25', '体 +2 力 +2', 'PHB'], ['精灵（高等）', '', '中型', '30', '敏 +2 智 +1', 'PHB'], ['提夫林', '', '中型', '30', '魅 +2 智 +1', 'PHB']], 1, { n: o.nPick, keep: [2] })}
${card('半精灵', 'Half-Elf · 玩家手册', [['体型', '中型'], ['速度', '30 尺'], ['感官', '黑暗视觉 60 尺']], `${ch('体型', '', '', { auto: true })}${ch('属性提升', '已选好', `<span class="sh-2" style="font-size:var(--fs-sm)">魅力 +2（固定）；再选两项各 +1：</span>${opts([['力量'], ['敏捷'], ['体质', 1], ['智力'], ['感知', 1]])}`, { n: o.nCh })}${ch('技能（选 2）', '还差 1', opts([['洞悉', 1], ['察觉'], ['游说'], ['欺瞒'], ['…其余技能']]))}${ch('语言（选 1）', '还差 1', opts([['通用语', 0, 1], ['精灵语', 0, 1], ['矮人语'], ['龙语'], ['…']]))}${ch('精灵血统 · 黑暗视觉', '', '', { auto: true })}`, { n: o.nCard })}</div>`, o),

  bg: (o = {}) => page('bg', `${head('背景', '背景给技能、工具、语言和起始物品；物品在「装备」那步一起看。', o.nHead)}<div class="wz-body">
${pick('minmax(0,1fr) 110px 70px 54px', ['背景', '技能', '语言', '来源'], [['侍僧', '', '洞悉 宗教', '任选 2', 'PHB'], ['学者', '', '奥秘 历史', '任选 2', 'PHB'], ['士兵', '', '运动 威吓', '—', 'PHB'], ['罪犯', '', '欺瞒 隐匿', '—', 'PHB']], 0, { keep: [0] })}
${card('侍僧', 'Acolyte · 玩家手册', [['技能', '洞悉、宗教'], ['语言', '任选 2 种'], ['特性', '信仰庇护']], `${ch('技能熟练', '', opts([['洞悉', 1], ['宗教', 1]]), { auto: true })}${ch('语言（选 2）', '已选好', opts([['矮人语', 1], ['天界语', 1], ['龙语'], ['巨人语'], ['…']]))}${ch('起始物品', '', '<span class="sh-2" style="font-size:var(--fs-sm)">圣徽、祈祷书、5 根香、法衣、普通衣服、金币 ×15 → 在「装备」步显示</span>', { auto: true })}`)}</div>`, o),

  class: (o = {}) => page('class', `${head('职业', '建卡做 1 级；更高等级建好后在人物页「等级管理」里一级一级升（升降级都先预览）。', o.nHead)}<div class="wz-body">
${pick('minmax(0,1fr) 54px 64px 80px 54px', ['职业', '生命骰', '主属性', '豁免', '来源'], [['战士', '', 'd10', '力 或 敏', '力 体', 'PHB'], ['牧师', '', 'd8', '感知', '感 魅', 'PHB'], ['法师', '', 'd6', '智力', '智 感', 'PHB'], ['游荡者', '', 'd8', '敏捷', '敏 智', 'PHB'], ['野蛮人', '', 'd12', '力量', '力 体', 'PHB']], 1, { n: o.nPick, keep: [0, 1] })}
${card('牧师 1 级', 'Cleric · 玩家手册', [['生命骰', 'd8'], ['护甲', '轻甲 中甲 盾牌'], ['武器', '简易武器']], `${ch('生命值', '', '<span class="sh-2" style="font-size:var(--fs-sm)">1 级取满：8 + 体质调整值</span>', { auto: true })}${ch('豁免熟练', '', opts([['感知', 1], ['魅力', 1]]), { auto: true })}${ch('技能（选 2）', '已选好', opts([['历史'], ['洞悉', 0, 1], ['医药', 1], ['游说'], ['宗教', 0, 1], ['… 背景已给的灰掉']]), { n: o.nCh })}${ch('戏法（选 3）', '还差 3', `${opts([['神导术'], ['圣火术'], ['奇术'], ['光亮术'], ['抗性术'], ['维生术']])}`)}${ch('子职业', '', '<span class="sh-2" style="font-size:var(--fs-sm)">牧师 1 级就要选神圣领域 → 下一步</span>', { auto: true })}`)}</div>`, o),

  sub: (o = {}) => page('sub', `${head('子职业', '只有职业在 1 级就有子职业时才要选（例：牧师的领域）；别的职业这一步显示「这个人物不需要」。', o.nHead)}<div class="wz-body">
${pick('minmax(0,1fr) 54px', ['神圣领域', '来源'], [['生命领域', '', 'PHB'], ['光明领域', '', 'PHB'], ['知识领域', '', 'PHB'], ['战争领域', '', 'PHB'], ['诡术领域', '', 'PHB']], 0)}
${card('生命领域', 'Life Domain · 牧师子职业', [['领域法术', '祝福术、疗伤术（始终准备）'], ['额外熟练', '重甲']], `${ch('领域法术', '', opts([['祝福术', 1], ['疗伤术', 1]]), { auto: true })}${ch('额外熟练：重甲', '', '', { auto: true })}${ch('门徒之生', '', '<span class="sh-2" style="font-size:var(--fs-sm)">治疗法术多恢复 2 + 环级</span>', { auto: true })}`, { desc: '1 级特性全由内核自动加上，这一步只要选领域。' })}</div>`, o),

  feat: (o = {}) => page('feat', o.need
    ? `${head('专长', '你选的「人类（变体）」在 1 级给 1 个专长。', o.nHead)}<div class="wz-body">${pick('minmax(0,1fr) 120px 54px', ['专长', '前置条件', '来源'], [['警觉', '', '—', 'PHB'], ['战地施法者', '', '能施展至少 1 个法术', 'PHB'], ['坚韧', '', '—', 'PHB'], ['重甲大师', '', '重甲熟练', 'PHB']], 1, { keep: [0] })}
${card('战地施法者', 'War Caster · 玩家手册', [['前置', '能施展至少 1 个法术']], `${ch('效果', '', '<span class="sh-2" style="font-size:var(--fs-sm)">专注检定优势；持武器也能做姿势成分；借机攻击可改施法术</span>', { auto: true })}`)}</div>`
    : `${head('专长', '这个人物不需要选专长。', o.nHead)}<div class="wz-body" data-one="true"><div class="sh-empty">${P(o.nNone)}<b>这一步不用做</b><span class="sh-2">半精灵、侍僧、牧师 1 级都没有给专长。内核没列出专长步骤时，左边这一步是灰的虚线圆。</span>${btn('去下一步', { primary: true })}</div></div>`, { states: o.need ? { feat: 'todo' } : {}, ...o }),

  ab: (o = {}) => page('ab', `${head('属性值', '先定 6 个基础值，再加上种族给的提升；最终值和调整值由内核给。', o.nHead)}<div class="wz-body" data-one="true"><div>
<div class="sh-tools">${P(o.nWay)}${filt(['标准数组', '购点（27 点）', '掷骰', '手填'], 0)}</div>
<div class="wz-pool">${P(o.nPool)}还没放的数：<span>15</span><span data-used="true">14</span><span>13</span><span>12</span><span data-used="true">10</span><span>8</span></div>
<div class="wz-ab">${[['力量', '', '', ''], ['敏捷', '', '', ''], ['体质', '14', '+1', '15 · +2'], ['智力', '', '', ''], ['感知', '10', '+1', '11 · +0'], ['魅力', '', '+2', '']].map(([k, v, add, tot]) => `<div><small>${k}</small><span class="wz-in"${v ? '' : ' data-empty="true"'}>${v || '空'}</span><em${add ? ' data-plus="true"' : ''}>种族 ${add || '—'}</em><strong>${tot || '—'}</strong></div>`).join('')}</div>
<div class="wz-gap">${P(o.nGap)}待查后端：内核建卡计划（buildCharacter）现在只收「名字 + 条目 + 装备 + 选择」，<b>没看到基础属性值这一项</b>；这一步能不能存进人物、走哪条接口，查后端时确认（候选缺口）。</div></div></div>`, o),

  eq: (o = {}) => page('eq', `${head('装备', '职业的起始装备二选一；背景的物品直接给；钱币也是物品。', o.nHead)}<div class="wz-body" data-one="true"><div>
${tbl('minmax(0,1fr)', sec('牧师起始装备（每组选一项）', 3, [], { n: o.nRad }))}
<div class="wz-rad"><div data-on="true"><i></i><span><b>甲</b>硬头锤</span></div><div><i></i><span><b>乙</b>战锤（需要熟练）</span></div></div>
<div class="wz-rad"><div><i></i><span><b>甲</b>鳞甲</span></div><div data-on="true"><i></i><span><b>乙</b>皮甲</span></div><div><i></i><span><b>丙</b>链甲（需要熟练）</span></div></div>
<div class="wz-rad"><div data-on="true"><i></i><span><b>甲</b>轻弩和 20 支弩矢</span></div><div><i></i><span><b>乙</b>任意一件简易武器 ${btn('从库里选', { small: true })}</span></div></div>
${tbl('minmax(0,1fr) 60px 60px', `${sec('背景给的', 6, ['数量', '重量'])}${[['圣徽', 1, '1 磅'], ['祈祷书', 1, '5 磅'], ['香', 5, '—'], ['法衣', 1, '4 磅'], ['普通衣服', 1, '3 磅'], ['金币 (gp)', 15, '0.3 磅']].map(([n, q, w]) => tr([it(n[0], n, n.startsWith('金币') ? '钱币 · 来自库' : '冒险装备'), c(q), c(w)])).join('')}`)}
<div class="sh-tools">${btn('从库里再加物品', { small: true, ic: 'plus' })}</div>
<div class="wz-gap">${P(o.nGap)}待查后端：「甲 / 乙」起始装备选项是不是由职业条目数据直接给出、内核建卡的 equipment 能不能接这些选择，查后端时确认。</div></div></div>`, o),

  done: (o = {}) => page('done', `${head('检查后创建', '还空着的会列在「待填」，创建后在人物页随时补。', o.nHead)}<div class="wz-body" data-one="true"><div>
${tbl('120px minmax(0,1fr) 80px', `${sec('伊娃', null, ['', ''])}${[['种族', '半精灵 · 黑暗视觉 60 尺'], ['背景', '侍僧 · 洞悉 宗教 · 矮人语 天界语'], ['职业', '牧师 1 级 · 生命领域'], ['生命值', '10（8 + 体质 2）'], ['AC', '11（皮甲 + 敏捷）'], ['技能', '洞悉 医药 宗教 察觉']].map(([k, v]) => tr([`<span class="sh-2" style="text-align:left">${k}</span>`, `<span style="text-align:left">${v}</span>`, `<span><button class="trpg-link" type="button">改</button></span>`])).join('')}`)}
${tbl('minmax(0,1fr) 120px', `${sec('待填', 3, ['', ''], { n: o.nTodo })}${tr([it('!', '属性值：力量、敏捷、智力、魅力还没放', ''), `<span>${btn('去填', { small: true })}</span>`])}${tr([it('!', '戏法还差 3 个', '职业'), `<span>${btn('去填', { small: true })}</span>`])}${tr([it('!', '半精灵：语言还差 1、技能还差 1', '种族'), `<span>${btn('去填', { small: true })}</span>`])}`)}
<p class="trpg-hint" style="margin:0 var(--sp-3)">创建后直接打开伊娃的人物页；创建算一条改动记录，可撤销。</p></div></div>`, { ...o, states: { ab: 'skip' } }),
}
export const wizard = (cur, o = {}) => wzModal('分步建卡', steps[cur](o), { n: o.nTitle })

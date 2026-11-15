// 分步建卡 v5：和「从模板加入」同一套两栏页（驾驶员 2026-11-15）：上面一排步骤标签（做完打 ✓、可点回任意一步），
// 下面左 = 列表、右 = 资料卡（带「它要你做的选择」），底栏 [跳过此步] [上一步] [下一步]。窄屏：列表页 → 点一项 → 资料卡页（页面跳转）。
// 步骤照内核：规则数据 kernel.build（种族 · 背景 · 职业 · 子职业 · 专长 · 可选特性）；每件条目带来的选择由内核 buildSteps 列出，界面只渲染。
// 示例人物「伊娃」= 半精灵 · 侍僧 · 牧师 1 级 · 生命领域（PHB 2014）；数值与选项都是占位示例。
import { icon, btn, filt, P, sec, it, tr, c, tbl, step } from './parts.mjs'
import { avatarField } from './avatar.mjs'
import { row, card, tools, pickPage, pickModal, foot, pill } from './picker.mjs'

export const STEPS = [['name', '名字'], ['race', '种族'], ['bg', '背景'], ['class', '职业'], ['sub', '子职业'], ['feat', '专长'], ['opt', '可选特性'], ['ab', '属性值'], ['eq', '装备'], ['done', '完成']]
/** 步骤标签：state = done 已选 / skip 跳过（进待填）/ none 本人物不需要（内核没列这一步）/ todo */
export function stepTabs(cur, states = {}, n) {
  const ci = STEPS.findIndex(([id]) => id === cur)
  return `<div class="pk-tabs pk-tabs--narrow" role="tablist">${P(n)}${STEPS.map(([id, name], i) => {
    const s = states[id] ?? (id === 'feat' || id === 'opt' ? 'none' : i < ci ? 'done' : 'todo')
    return `<span class="pk-step" data-s="${s}"${i === ci ? ' aria-current="step"' : ''}><i>${s === 'done' ? icon('check', 12) : i + 1}</i>${name}</span>`
  }).join('')}</div>`
}
const wfoot = (o = {}) => foot(`${P(o.n)}${o.first || o.last ? '' : btn('跳过此步', { quiet: true })}<small>关掉窗口 = 存成「建卡中」人物，不丢</small><span class="pk-foot__sp"></span>${o.first ? '' : btn('上一步', { ic: 'caret-left' })}${o.last ? btn('创建伊娃', { primary: true, n: o.nGo }) : btn('下一步', { primary: true })}`)
const cfoot = (name) => foot(`${btn('选「' + name + '」并下一步', { primary: true })}`)
const opts = (a) => `<div class="wz-opts">${a.map(([t, on, off]) => `<span class="wz-opt"${on ? ' data-on="true"' : ''}${off ? ' data-off="true"' : ''}>${on ? icon('check', 12) : ''}${t}</span>`).join('')}</div>`
/** 它要你做的选择（内核 buildSteps 的一步）；auto = 内核自动定 */
const ch = (title, state, body, { auto, n } = {}) => `<div class="wz-ch"${auto ? ' data-auto="true"' : ''}>${P(n)}<b>${title}<small${state === '已选好' || auto ? ' data-done="true"' : ''}>${auto ? '自动' : state}</small></b>${body ?? ''}</div>`
const quiet = (t) => `<span class="sh-2" style="font-size:var(--fs-sm)">${t}</span>`
const top = (cur, o, withTools, q = '名字') => `${stepTabs(cur, o.states, o.nTabs)}${withTools ? tools(q, withTools, { n: o.nTools }) : ''}`

/** 一步 = 列表 + 资料卡；view：both 宽 / list 窄·列表页 / card 窄·资料卡页 */
function pick(cur, o, { list, c: cardData, count, q }) {
  const view = o.view ?? 'both'
  return pickPage({ view, top: top(cur, o, count, q), list, card: card(cardData), footHtml: view === 'list' ? undefined : view === 'card' ? cfoot(cardData.name) : wfoot({ n: o.nFoot }) })
}
const L = (items, sel) => items.map((r, i) => row({ ...r, sel: i === sel })).join('')

const one = (cur, o, bodyHtml, extra = {}) => pickPage({ body: bodyHtml, top: top(cur, { ...o, states: { ...(o.states ?? {}), ...(extra.states ?? {}) } }, 0), footHtml: wfoot({ first: cur === 'name', last: cur === 'done', n: o.nFoot, nGo: o.nGo }) })

export const steps = {
  name: (o = {}) => one('name', o, `<div class="wz-form"><div class="pk-p">${P(o.nHead)}只有名字必填；后面每一步都能跳过，跳过的放进「待填」清单，之后在人物页补。</div>
<div class="trpg-field"><label class="trpg-field__label">名字 <span class="sh-warn">*</span></label><div class="trpg-input" style="border-color:var(--primary)">伊娃</div></div>
${avatarField(o.nAvatar)}
<div class="trpg-field"><label class="trpg-field__label">放进</label><div style="display:flex;gap:6px">${filt(['队伍', 'NPC', '敌人'], 0)}</div><p class="trpg-hint">默认是你打开建卡时所在的分类，以后可以换。</p></div></div>`),

  race: (o = {}) => pick('race', o, { count: 5, q: '搜 种族', list: L([
    { ch: '人', name: '人类', en: 'Human', tags: ['中型'], sub: '速度 30　全部 +1', src: 'PHB' },
    { ch: '半', name: '半精灵', en: 'Half-Elf', tags: ['中型'], sub: '速度 30　魅 +2 任二 +1', src: 'PHB' },
    { ch: '矮', name: '矮人（山地）', en: 'Mountain Dwarf', tags: ['中型'], sub: '速度 25　体 +2 力 +2', src: 'PHB' },
    { ch: '精', name: '精灵（高等）', en: 'High Elf', tags: ['中型'], sub: '速度 30　敏 +2 智 +1', src: 'PHB' },
    { ch: '提', name: '提夫林', en: 'Tiefling', tags: ['中型'], sub: '速度 30　魅 +2 智 +1', src: 'PHB' }], 1),
    c: { ch: '半', name: '半精灵', en: 'Half-Elf', sub: '玩家手册 · 种族', tags: ['中型'], src: 'PHB', n: o.nCard, stats: [['体型', '中型'], ['速度', '30 尺'], ['黑暗视觉', '60 尺']],
      kv: [['语言', '通用语、精灵语，再任选 1'], ['属性', '魅力 +2，另两项各 +1']],
      secs: [['精灵血统', '魔法效应：对魅惑豁免有优势，魔法不能使你入睡。']],
      extra: `${ch('属性提升', '已选好', `${quiet('魅力 +2（固定）；再选两项各 +1：')}${opts([['力量'], ['敏捷'], ['体质', 1], ['智力'], ['感知', 1]])}`, { n: o.nCh })}${ch('技能（选 2）', '还差 1', opts([['洞悉', 1], ['察觉'], ['游说'], ['欺瞒'], ['…其余技能']]))}${ch('语言（选 1）', '还差 1', opts([['通用语', 0, 1], ['精灵语', 0, 1], ['矮人语'], ['龙语'], ['…']]))}${ch('体型', '', '', { auto: true })}` } }),

  bg: (o = {}) => pick('bg', o, { count: 4, q: '搜 背景', list: L([
    { ch: '侍', name: '侍僧', en: 'Acolyte', sub: '洞悉 宗教　语言 2', src: 'PHB' }, { ch: '学', name: '学者', en: 'Sage', sub: '奥秘 历史　语言 2', src: 'PHB' },
    { ch: '士', name: '士兵', en: 'Soldier', sub: '运动 威吓', src: 'PHB' }, { ch: '罪', name: '罪犯', en: 'Criminal', sub: '欺瞒 隐匿', src: 'PHB' }], 0),
    c: { ch: '侍', name: '侍僧', en: 'Acolyte', sub: '玩家手册 · 背景', tags: ['特性：信仰庇护'], src: 'PHB', kv: [['技能', '洞悉、宗教'], ['语言', '任选 2 种'], ['起始物品', '圣徽、祈祷书、5 根香、法衣、普通衣服、金币 ×15（在「装备」步显示）']],
      extra: `${ch('技能熟练', '', opts([['洞悉', 1], ['宗教', 1]]), { auto: true })}${ch('语言（选 2）', '已选好', opts([['矮人语', 1], ['天界语', 1], ['龙语'], ['巨人语'], ['…']]))}` } }),

  class: (o = {}) => pick('class', o, { count: 5, q: '搜 职业', list: L([
    { ch: '战', name: '战士', en: 'Fighter', tags: ['d10'], sub: '力 或 敏', src: 'PHB' }, { ch: '牧', name: '牧师', en: 'Cleric', tags: ['d8'], sub: '感知', src: 'PHB' },
    { ch: '法', name: '法师', en: 'Wizard', tags: ['d6'], sub: '智力', src: 'PHB' }, { ch: '游', name: '游荡者', en: 'Rogue', tags: ['d8'], sub: '敏捷', src: 'PHB' }, { ch: '野', name: '野蛮人', en: 'Barbarian', tags: ['d12'], sub: '力量', src: 'PHB' }], 1),
    c: { ch: '牧', name: '牧师 1 级', en: 'Cleric', sub: '玩家手册 · 职业（建卡只建 1 级，升级在人物页「等级管理」里一级一级升）', tags: ['d8'], src: 'PHB', n: o.nPick, stats: [['生命骰', 'd8'], ['主属性', '感知'], ['豁免', '感 魅']], kv: [['护甲', '轻甲 中甲 盾牌'], ['武器', '简易武器']],
      extra: `${ch('生命值', '', quiet('1 级取满：8 + 体质调整值'), { auto: true })}${ch('豁免熟练', '', opts([['感知', 1], ['魅力', 1]]), { auto: true })}${ch('技能（选 2）', '已选好', opts([['历史'], ['洞悉', 0, 1], ['医药', 1], ['游说'], ['宗教', 0, 1], ['背景已给的灰掉']]), { n: o.nCh })}${ch('戏法（选 3）', '还差 3', opts([['神导术'], ['圣火术'], ['奇术'], ['光亮术'], ['抗性术'], ['维生术']]))}${ch('子职业', '', quiet('牧师 1 级就要选神圣领域 → 下一步'), { auto: true })}` } }),

  sub: (o = {}) => pick('sub', o, { count: 5, q: '搜 领域', list: L([
    { ch: '生', name: '生命领域', en: 'Life', sub: '治疗法术更强　重甲', src: 'PHB' }, { ch: '光', name: '光明领域', en: 'Light', sub: '火焰与光', src: 'PHB' }, { ch: '知', name: '知识领域', en: 'Knowledge', src: 'PHB' },
    { ch: '战', name: '战争领域', en: 'War', src: 'PHB' }, { ch: '诡', name: '诡术领域', en: 'Trickery', src: 'PHB' }], 0),
    c: { ch: '生', name: '生命领域', en: 'Life Domain', sub: '牧师子职业 · 1 级就要选', tags: ['PHB'], kv: [['领域法术', '祝福术、疗伤术（始终准备）'], ['额外熟练', '重甲']],
      extra: `${ch('领域法术', '', opts([['祝福术', 1], ['疗伤术', 1]]), { auto: true })}${ch('门徒之生', '', quiet('治疗法术多恢复 2 + 环级'), { auto: true })}` } }),

  feat: (o = {}) => o.need
    ? pick('feat', { ...o, states: { feat: 'todo' } }, { count: 4, q: '搜 专长', list: L([{ ch: '警', name: '警觉', en: 'Alert', src: 'PHB' }, { ch: '战', name: '战地施法者', en: 'War Caster', tags: ['前置'], sub: '能施展至少 1 个法术', src: 'PHB' }, { ch: '坚', name: '坚韧', en: 'Tough', src: 'PHB' }, { ch: '重', name: '重甲大师', en: 'Heavy Armor Master', sub: '重甲熟练', src: 'PHB' }], 1),
      c: { ch: '战', name: '战地施法者', en: 'War Caster', sub: '玩家手册 · 专长（你选的「人类（变体）」在 1 级给 1 个专长）', kv: [['前置', '能施展至少 1 个法术']], secs: [['效果', '专注检定优势；持武器也能做姿势成分；借机攻击可改施法术。']] } })
    : one('feat', o, `<div class="sh-empty">${P(o.nNone)}<b>这一步不用做</b><span class="sh-2">半精灵、侍僧、牧师 1 级都没有给专长，直接去下一步就行。</span>${btn('去下一步', { primary: true })}</div>`),

  ab: (o = {}) => one('ab', o, `<div>
<div class="sh-tools">${P(o.nWay)}${filt(['标准数组', '购点（27 点）', '掷骰', '手填'], 0)}</div>
<div class="wz-pool">${P(o.nPool)}还没放的数：<span>15</span><span data-used="true">14</span><span>13</span><span>12</span><span data-used="true">10</span><span>8</span></div>
<div class="wz-ab">${[['力量', '', '', ''], ['敏捷', '', '', ''], ['体质', '14', '+1', '15 · +2'], ['智力', '', '', ''], ['感知', '10', '+1', '11 · +0'], ['魅力', '', '+2', '']].map(([k, v, add, tot]) => `<div><small>${k}</small><span class="wz-in"${v ? '' : ' data-empty="true"'}>${v || '空'}</span><em${add ? ' data-plus="true"' : ''}>种族 ${add || '—'}</em><strong>${tot || '—'}</strong></div>`).join('')}</div>
</div>`, { states: { ab: 'todo' } }),

  eq: (o = {}) => one('eq', o, `<div>
${tbl('minmax(0,1fr)', sec('牧师起始装备（每组选一项）', 3, [], { n: o.nRad }))}
<div class="wz-rad"><div data-on="true"><i></i><span><b>甲</b>硬头锤</span></div><div><i></i><span><b>乙</b>战锤（需要熟练）</span></div></div>
<div class="wz-rad"><div><i></i><span><b>甲</b>鳞甲</span></div><div data-on="true"><i></i><span><b>乙</b>皮甲</span></div><div><i></i><span><b>丙</b>链甲（需要熟练）</span></div></div>
<div class="wz-rad"><div data-on="true"><i></i><span><b>甲</b>轻弩和 20 支弩矢</span></div><div><i></i><span><b>乙</b>任意一件简易武器 ${btn('从库里选', { small: true })}</span></div></div>
${tbl('minmax(0,1fr) 60px 60px', `${sec('背景给的', 6, ['数量', '重量'])}${[['圣徽', 1, '1 磅'], ['祈祷书', 1, '5 磅'], ['香', 5, '—'], ['法衣', 1, '4 磅'], ['普通衣服', 1, '3 磅'], ['金币 (gp)', 15, '0.3 磅']].map(([n, q, w]) => tr([it(n[0], n, n.startsWith('金币') ? '钱币 · 来自库' : '冒险装备'), c(q), c(w)])).join('')}`)}
</div>`),

  done: (o = {}) => one('done', o, `<div>
${tbl('120px minmax(0,1fr) 80px', `${sec('伊娃', null, ['', ''])}${[['种族', '半精灵 · 黑暗视觉 60 尺'], ['背景', '侍僧 · 洞悉 宗教 · 矮人语 天界语'], ['职业', '牧师 1 级 · 生命领域'], ['生命值', '10（8 + 体质 2）'], ['AC', '11（皮甲 + 敏捷）'], ['技能', '洞悉 医药 宗教 察觉']].map(([k, v]) => tr([`<span class="sh-2" style="text-align:left">${k}</span>`, `<span style="text-align:left">${v}</span>`, `<span><button class="trpg-link" type="button">改</button></span>`])).join('')}`)}
${tbl('minmax(0,1fr) 120px', `${sec('待填', 3, ['', ''], { n: o.nTodo })}${tr([it('!', '属性值：力量、敏捷、智力、魅力还没放', ''), `<span>${btn('去填', { small: true })}</span>`])}${tr([it('!', '戏法还差 3 个', '职业'), `<span>${btn('去填', { small: true })}</span>`])}${tr([it('!', '半精灵：语言还差 1、技能还差 1', '种族'), `<span>${btn('去填', { small: true })}</span>`])}`)}
<p class="trpg-hint" style="margin:0 var(--sp-3)">创建后直接打开伊娃的人物页；创建算一条改动记录，可撤销。</p></div>`, { states: { ab: 'skip' } }),
}
export const wizard = (cur, o = {}) => pickModal('分步建卡', '', steps[cur](o), { view: o.view, n: o.nTitle })

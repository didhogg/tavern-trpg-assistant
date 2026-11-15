// 详情页 v4：结构照 Tidy5e 角色表（深色横幅页头 + 下划线分页 + 每页的「工具行 + 彩色分组表」）；字段照 dnd5e 人物数据。
// 示例人物：盖尔（法师 3 级，智力 18）。所有数值是占位，真实值由内核给；点带框的数字 = 送去骰盘（R15）。
import { icon, btn, iconBtn, searchBox, P, more, dots, bar, step, filt, roll, sec, it, tr, c, tbl } from './parts.mjs'

export const TABS = [['action', '行动'], ['stats', '数值'], ['bag', '背包'], ['spell', '法术'], ['feat', '特性'], ['effect', '效果'], ['bio', '背景'], ['note', '笔记']]
const AB = [['力量', '−1', 8, '−1'], ['敏捷', '+2', 14, '+2'], ['体质', '+1', 12, '+1'], ['智力', '+4', 18, '+6', 1], ['感知', '+1', 12, '+3', 1], ['魅力', '+0', 10, '+0']]
const AK = ['力', '敏', '体', '智', '感', '魅']
const MOD = [-1, 2, 1, 4, 1, 0]
const f = (n) => (n < 0 ? `−${-n}` : `+${n}`)
// [名字, 属性序号, 熟练(0/1/2 专精/'h' 半熟练)] —— 技能名单由数据给，这里只是示例
const SK = [['杂技', 1], ['驯兽', 4], ['奥秘', 3, 1], ['运动', 0], ['欺瞒', 5], ['历史', 3, 1], ['洞悉', 4, 1], ['威吓', 5], ['调查', 3, 1], ['医药', 4], ['自然', 3], ['察觉', 4], ['表演', 5], ['游说', 5], ['宗教', 3], ['巧手', 1], ['隐匿', 1], ['求生', 4]]

/* ---------- 顶栏 ---------- */
export const top = (o = {}) => `<div class="sh-top"><button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button">${icon('caret-left', 16)}人物</button><span class="sh-top__name">盖尔</span>
<span class="sh-top__end">${P(o.nNav)}${iconBtn('caret-left', '上一位')}${iconBtn('caret-right', '下一位')}
<span class="sh-undo">${P(o.nUndo)}<button type="button">${icon('arrow-counter-clockwise', 16)}<span class="sh-undo__txt">撤销：${o.undo ?? '盖尔 生命 18→12'}</span></button><button type="button" aria-label="改动记录">${icon('caret-down', 16)}</button></span>${P(o.nMenu)}${iconBtn('dots-three', '更多')}</span></div>`

/* ---------- 深色页头 ---------- */
function hpBlock(o) {
  const edit = o.hpEdit
  const pre = edit ? `<div class="sh-hp__pre">生命 12 → <b>5</b> / 18　Enter 生效 · Esc 还原</div>` : ''
  return `<div class="sh-hp">${P(o.nHp)}<div class="sh-hp__t"><span>生命值</span><span>${iconBtn('pencil-simple', '上限明细与手改')}</span></div>
<div class="sh-hp3"><label>当前<span class="sh-in"${edit ? ' data-focus="true"' : ''}>${edit ? '−7' : '12'}</span></label><label>上限<span class="sh-in">18</span></label><label>临时<span class="sh-in" data-temp="true">3</span></label></div>
${bar(12, 18, 3, { dk: true })}${pre}
<div class="sh-hp__rows">${P(o.nDeath)}<div>死亡豁免<button class="sh-dk" type="button">掷</button></div><div>成功 ${dots(3, 0)}　失败 ${dots(3, 0, 'fail')}</div>
<div>生命骰 <b>d6</b> ${dots(3, 3)} <b>3/3</b><button class="sh-dk" type="button">掷一颗</button></div>
<div>力竭 <b>0</b>　灵感 ${dots(1, 0)}</div></div></div>`
}
export function hero(o = {}) {
  const xp = `<div class="sh-xp"${o.ready ? ' data-ready="true"' : ''}>${P(o.nXp)}<div><span>经验</span><b>${o.ready ? '2,700' : '900'} / 2,700</b></div>${bar(o.ready ? 2700 : 900, 2700, 0, { dk: true, plain: true })}<button class="sh-dk" type="button">${o.ready ? '可以升级 · 等级管理' : '等级管理'}</button></div>`
  const id = `<div class="sh-hero__id"><span class="sh-pic">${icon('user', 26)}</span><div class="sh-hero__who"><div class="sh-name">${P(o.nName)}盖尔<span class="sh-star">${icon('star-fill', 18)}</span><small>Gale</small></div>
<div class="sh-meta"><span><b>法师 3 级</b> 塑能学派</span><span>种族 <b>人类</b></span><span>背景 <b>学者</b></span><span>中立善良</span><span>中型</span></div>
<div class="sh-hero__btns">${P(o.nCat)}<button class="sh-dk" type="button">${icon('users', 14)} 队伍 ${icon('caret-down', 12)}</button><button class="sh-dk" type="button">随行 ${icon('caret-down', 12)}</button>${o.sync ? `<button class="sh-dk" type="button">${P(o.sync)}${icon('link-simple', 14)} 3 项来源有更新</button>` : ''}</div></div>${xp}</div>`
  const abs = `<div class="sh-abs">${P(o.nAb)}${AB.map(([k, m, v, s, p]) => `<div class="sh-ab"><small>${k}</small><b>${m}</b><span>${v}</span><em${p ? ' data-prof="true"' : ''}>${p ? '● ' : ''}豁免 ${s}</em></div>`).join('')}</div>`
  const row = `<div class="sh-row">${abs}<div class="sh-mini"><div${o.acOvr ? ' class="sh-ovr"' : ''}><small>${P(o.nAc)}AC</small><b>${o.acOvr ? '14' : '12'}</b></div><div><small>先攻 ${icon('dice-five', 12)}</small><b>+2</b></div><div><small>速度</small><b>30 尺</b></div><div><small>熟练</small><b>+2</b></div></div>
<div class="sh-pass">${P(o.nPass)}<span>被动察觉 <b>11</b></span><span>被动洞悉 <b>13</b></span><span>被动调查 <b>16</b></span><span>法术豁免 DC <b>14</b></span><span>法术攻击 <b>+6</b></span></div></div>`
  return `<div class="sh-hero">${hpBlock(o)}${id}${row}</div>`
}
export const strip = (o = {}) => `<div class="sh-strip"><span>${P(o.nFx)}<span class="sh-lab">状态</span><span class="sh-chip">专注：隐形术<button type="button" aria-label="结束">${icon('x', 14)}</button></span><span class="sh-chip">中毒<button type="button" aria-label="移除">${icon('x', 14)}</button></span><button class="sh-chip sh-chip--add" type="button">${icon('plus', 14)} 状态</button></span>
<span>${P(o.nSlot)}<span class="sh-lab">法术位</span><span class="sh-slot">1 环 ${dots(4, 2)} <b>2/4</b></span><span class="sh-slot">2 环 ${dots(2, 1)} <b>1/2</b></span></span></div>`
export const tabs = (sel, n) => `<div class="sh-tabs" role="tablist">${P(n)}${TABS.map(([id, t]) => `<button class="sh-tab" role="tab" type="button" aria-selected="${id === sel}">${t}</button>`).join('')}</div>`
export const dock = (o = {}) => `<div class="sh-dock"><span class="sh-dock__hp"><b>12 / 18</b>${bar(12, 18, 3)}<span class="sh-2">AC</span><b>12</b></span><span class="sh-dock__st"${o.draft ? ' data-draft="true"' : ''}>${o.draft ? '● 有未保存的编辑' : `${icon('check', 14)} 已存进当前战役`}</span><span class="sh-dock__act">${P(o.nRest)}${btn('短休')}${btn('长休')}${o.draft ? btn('保存修改', { primary: true, n: o.nSave }) : ''}</span></div>`

/* ---------- 各分页 ---------- */
const skills = (n) => tbl('', `${sec('技能', null, ['加值', '被动'], { n }).replace('<b>', '<b style="grid-column:span 3">')}${SK.map(([k, a, p]) => tr([`<i class="sh-pt" data-on="${p ?? 0}"></i>`, `<span class="sh-ab3">${AK[a]}</span>`, `<span class="sh-n">${k}</span>`, `<span class="sh-v">${roll(f(MOD[a] + (p ? 2 : 0)))}</span>`, c(10 + MOD[a] + (p ? 2 : 0))])).join('')}`, 'sh-sk')
const saves = () => tbl('', `${sec('豁免', null, ['加值', '']).replace('<b>', '<b style="grid-column:span 3">')}${AB.map(([k, , , s, p]) => tr([`<i class="sh-pt" data-on="${p ? 1 : 0}"></i>`, `<span class="sh-ab3"></span>`, `<span class="sh-n">${k}</span>`, `<span class="sh-v">${roll(s)}</span>`, c('')])).join('')}`, 'sh-sk')
const trait = (t, v, empty) => `<div class="sh-trait"><b>${t}</b><div${empty ? ' class="sh-3"' : ''}>${v}</div><button type="button" aria-label="编辑">${icon('pencil-simple', 16)}</button></div>`
const pills = (a) => `<span class="sh-pills">${a.map((x) => `<span>${x}</span>`).join('')}</span>`

const ACOLS = 'minmax(0,1fr) 60px 64px 110px 32px'
const actRow = (ch, name, sub, uses, hit, dmg, attrs = '') => tr([it(ch, name, sub), c(uses), `<span>${hit ? roll(hit) : '—'}</span>`, `<span>${dmg ? roll(dmg) : '—'}</span>`, more()], attrs)
const AN = { narrow: 'minmax(0,1fr) 56px 104px 32px', hide: '2' }
const actions = (o) => `<div class="sh-tools">${searchBox('搜 行动、法术、物品')}${filt(['全部', '动作', '附赠', '反应', '其他'], 0, o.nFilt)}${iconBtn('sort-ascending', '排序')}</div>
${tbl(ACOLS, `${sec('动作', 6, ['次数', '命中/DC', '伤害/效果'], { n: o.nSec })}
${actRow('匕', '匕首', '武器 · 近战或投掷 20/60 尺', '—', '+4', '1d4+2 穿刺')}
${actRow('法', '法杖', '武器 · 近战 · 双手 1d8', '—', '+1', '1d6−1 钝击')}
${actRow('火', '火焰箭', '戏法 · 120 尺', '—', '+6', '1d10 火焰', ' data-open="true"')}<div class="sh-desc">${P(o.nOpen)}向射程内一个生物或物体投出一团火焰，命中造成 1d10 火焰伤害；易燃物被点燃。${pills(['戏法', '塑能', '动作', '120 尺', '言语 姿势'])}</div>
${actRow('魔', '魔法飞弹', '1 环 · 120 尺 · 必中', '法术位', '', '3×(1d4+1) 力场')}
${actRow('燃', '燃烧之手', '1 环 · 15 尺锥形', '法术位', 'DC 14 敏捷', '3d6 火焰')}
${actRow('隐', '隐形术', '2 环 · 触碰 · 专注', '法术位', '', '隐形')}`, '', AN)}
${tbl(ACOLS, `${sec('反应', 1, ['次数', '命中/DC', '伤害/效果'])}${actRow('护', '护盾术', '1 环 · 自身 · 直到你下回合', '法术位', '', 'AC +5')}`, '', AN)}
${tbl(ACOLS, `${sec('其他', 1, ['次数', '恢复', ''])}${tr([it('奥', '奥术恢复', '短休时恢复法术位'), c('1 / 1'), c('长休'), c(''), more()])}`, '', AN)}`

const BCOLS = "minmax(0,1fr) 56px 96px 64px 40px 32px"
const bagRow = (ch, name, sub, uses, qty, wt, eq, attrs = '') => tr([it(ch, name, sub), c(uses), `<span>${qty == null ? '—' : step(qty)}</span>`, c(wt), `<span>${eq == null ? '' : `<i class="sh-eq" data-on="${eq}"></i>`}</span>`, more()], attrs)
const BN = { narrow: 'minmax(0,1fr) 96px 40px 32px', hide: '2 4' }
const bag = (o) => `<div class="sh-info">${P(o.nEnc)}<span class="sh-enc">负重 ${bar(34, 120, 0, { plain: true })}<b>34 / 120 磅</b></span><span>力量 <b>8</b></span><span>体型 <b>中型</b></span></div>
<div class="sh-tools">${searchBox('搜 物品')}${filt(['全部', '已装备', '可使用'], 0)}${iconBtn('sort-ascending', '排序')}${btn('加物品', { small: true, ic: 'plus', n: o.nAdd })}</div>
${tbl(BCOLS, `${sec('武器', 2, ['次数', '数量', '重量', '装备'], { add: '加武器' })}${bagRow('匕', '匕首', '简易近战 · 灵巧 投掷', '—', 1, '1 磅', true)}${bagRow('法', '法杖', '简易近战 · 双用', '—', 1, '4 磅', true)}`, '', BN)}
${tbl(BCOLS, `${sec('装备', 2, ['次数', '数量', '重量', '装备'], { add: '加装备' })}${bagRow('书', '法术书', '奥术法器 · 9 个法术', '—', null, '3 磅', true)}${bagRow('水', '水晶球（奥术法器）', '施法法器', '—', null, '1 磅', true)}`, '', BN)}
${tbl(BCOLS, `${sec('消耗品', 1, ['次数', '数量', '重量', '装备'], { add: '加消耗品' })}${bagRow('药', '治疗药水', '恢复 2d4+2 生命', '1 / 1', 2, '1 磅', null)}`, '', BN)}
${tbl(BCOLS, `${sec('容器', 1, ['次数', '数量', '重量', '装备'], { add: '加容器', n: o.nBox })}${bagRow('▾', '背包', '容器 · 装了 4 种 · 容量 30 磅', '—', null, '5 磅', null, ' data-open="true"')}
${bagRow('口', '口粮', '冒险装备', '—', 5, '10 磅', null, ' data-sub="true"')}${bagRow('火', '火把', '冒险装备', '—', 10, '10 磅', null, ' data-sub="true"')}${bagRow('金', '金币 (gp)', '钱币 · 来自库', '—', 48, '0.96 磅', null, ' data-sub="true"')}${bagRow('银', '银币 (sp)', '钱币 · 来自库', '—', 12, '0.24 磅', null, ' data-sub="true"')}`, '', BN)}`

const SCOLS = 'minmax(0,1fr) 52px 64px 96px 96px 32px'
const SN = { narrow: 'minmax(0,1fr) 76px 88px 28px', hide: '2 3' }
const spRow = (prep, ch, name, sub, time, range, hit, eff) => tr([`<span class="sh-it">${prep == null ? '<em class="sh-prep" style="visibility:hidden"></em>' : `<em class="sh-prep" data-on="${prep}"></em>`}${it(ch, name, sub)}</span>`, c(time), c(range), `<span>${hit ? roll(hit) : '—'}</span>`, `<span>${eff ? roll(eff) : '—'}</span>`, more()])
const spell = (o) => `<div class="sh-info">${P(o.nCast)}<span>施法属性 <b>智力</b></span><span>法术攻击 <b>+6</b></span><span>豁免 DC <b>14</b></span><span>已准备 <b>6 / 7</b></span></div>
<div class="sh-tools">${searchBox('搜 法术')}${filt(['全部', '已准备', '专注', '仪式'], 0)}${btn('加法术', { small: true, ic: 'plus' })}</div>
${tbl(SCOLS, `${sec('戏法', 3, ['施放', '距离', '命中/DC', '效果'])}${spRow(null, '火', '火焰箭', '塑能 · 言语 姿势', '动作', '120 尺', '+6', '1d10 火焰')}${spRow(null, '手', '法师之手', '咒法', '动作', '30 尺', '', '')}${spRow(null, '光', '光亮术', '塑能', '动作', '触碰', '', '')}`, '', SN)}
${tbl(SCOLS, `${sec('1 环', null, ['施放', '距离', '命中/DC', '效果'], { extra: ` ${dots(4, 2)} <small>2/4</small>`, n: o.nLv })}${spRow(true, '魔', '魔法飞弹', '塑能', '动作', '120 尺', '', '3×(1d4+1)')}${spRow(true, '护', '护盾术', '防护', '反应', '自身', '', 'AC +5')}${spRow(true, '燃', '燃烧之手', '塑能', '动作', '15 尺', 'DC 14 敏', '3d6 火焰')}${spRow(true, '侦', '侦测魔法', '预言 · 专注 · 仪式', '动作', '自身', '', '')}${spRow(false, '甲', '法师护甲', '防护', '动作', '触碰', '', 'AC 13+敏')}`, '', SN)}
${tbl(SCOLS, `${sec('2 环', null, ['施放', '距离', '命中/DC', '效果'], { extra: ` ${dots(2, 1)} <small>1/2</small>` })}${spRow(true, '隐', '隐形术', '幻术 · 专注', '动作', '触碰', '', '')}${spRow(true, '朦', '朦胧步', '咒法', '附赠', '自身', '', '传送 30 尺')}`, '', SN)}`

const FCOLS = 'minmax(0,1fr) 60px 72px 32px'
const feat = (o) => `<div class="sh-tools">${searchBox('搜 特性')}${filt(['全部', '主动', '被动'], 0)}${btn('加特性', { small: true, ic: 'plus' })}</div>
${tbl('minmax(0,1fr) 70px 90px 32px', `${sec('职业', 1, ['等级', '生命骰', ''], { n: o.nCls })}${tr([it('法', '法师', '子职业：塑能学派'), c('3 级'), c('d6 · 3/3'), more()])}`)}
${tbl(FCOLS, `${sec('主动能力', 1, ['次数', '恢复', ''])}${tr([it('奥', '奥术恢复', '法师 1 级'), `<span>${dots(1, 1)} 1/1</span>`, c('长休'), more()])}`)}
${tbl(FCOLS, `${sec('职业特性', 4, ['来源', '', ''])}${tr([it('施', '施法', '法师 1 级'), c('法师'), c(''), more()])}${tr([it('奥', '奥术传统', '法师 2 级'), c('法师'), c(''), more()])}${tr([it('塑', '塑能学者', '塑能学派 2 级'), c('子职业'), c(''), more()])}${tr([it('雕', '法术塑形', '塑能学派 2 级'), c('子职业'), c(''), more()])}`)}
${tbl(FCOLS, `${sec('种族与背景', 2, ['来源', '', ''])}${tr([it('研', '研究者', '背景特性'), c('学者'), c(''), more()])}${tr([it('!', '旧房规：书呆子', '资料不可用（这本书没开启）', { warn: true }), c('房规'), c(''), more(o.nGone)])}`)}`

const ECOLS = 'minmax(0,1fr) 92px 90px 40px 32px'
const CONDS = [['目盲'], ['魅惑'], ['耳聋'], ['恐慌'], ['擒抱'], ['失能'], ['隐形', 1], ['麻痹'], ['石化'], ['中毒', 1], ['倒地'], ['束缚'], ['震慑'], ['昏迷']]
const EN = { narrow: 'minmax(0,1fr) 40px 32px', hide: '2 3' }
const effect = (o) => `<div class="sh-info">${P(o.nCond)}<span style="flex:1 1 100%;border:0;padding:0;background:none" class="sh-lab">状态（点一下开 / 关；名单由库给，内核认识的会自动影响数值和掷骰）</span></div>
<div class="sh-tools" style="gap:4px">${CONDS.map(([t, on]) => `<button class="sh-chip${on ? '' : ' sh-chip--add'}" style="${on ? 'background:var(--text);color:var(--surface);border-color:var(--text);padding:0 10px' : 'border-style:solid'}" type="button">${t}</button>`).join('')}<span class="sh-chip" style="padding:0 6px 0 10px">力竭 ${step(0)}</span></div>
${tbl(ECOLS, `${sec('生效中', 2, ['来源', '持续', '开关'], { add: '新建效果', n: o.nNew })}${tr([it('隐', '隐形', '状态 · 专注维持'), c('隐形术'), c('1 小时'), '<span><i class="sh-eq" data-on="true"></i></span>', more()])}${tr([it('毒', '中毒', '状态 · 攻击与检定劣势'), c('手动'), c('—'), '<span><i class="sh-eq" data-on="true"></i></span>', more()])}`, '', EN)}
${tbl(ECOLS, `${sec('物品与特性带来的', 1, ['来源', '持续', '开关'])}${tr([it('水', '奥术法器', '被动'), c('水晶球'), c('常驻'), '<span><i class="sh-eq" data-on="true"></i></span>', more()])}`, '', EN)}
${tbl(ECOLS, `${sec('停用', 1, ['来源', '持续', '开关'])}${tr([it('甲', '法师护甲：AC 13+敏', '临时效果 · 已结束'), c('法师护甲'), c('8 小时'), '<span><i class="sh-eq" data-on="false"></i></span>', more()])}`, '', EN)}`

const stats = (o) => `<div class="sh-cols3"><div>${skills(o.nSk)}</div><div>${saves()}${tbl('minmax(0,1fr) 40px 32px', `${sec('工具', 1, ['加值', ''])}${tr([it('书', '书法家工具', '智力 · 熟练'), `<span>${roll('+6')}</span>`, more()])}`)}</div>
<div>${tbl('', `${sec('特质', null, [], { n: o.nTrait })}${trait('感官', '—', true)}${trait('语言', pills(['通用语', '精灵语', '矮人语', '龙语']))}${trait('伤害抗性', '—', true)}${trait('伤害免疫', '—', true)}${trait('状态免疫', '—', true)}${trait('武器熟练', pills(['匕首', '飞镖', '投石索', '短棍', '轻弩']))}${trait('护甲熟练', '—', true)}`)}</div></div>`

const FIELDS = [['阵营', '中立善良'], ['种族', '人类'], ['背景', '学者'], ['性别', '男'], ['年龄', '35'], ['身高', '5 尺 11 寸'], ['体重', '170 磅'], ['眼睛', '棕色'], ['头发', '深棕'], ['皮肤', '浅色'], ['信仰', '密斯特拉']]
const text = (h, t) => `<div class="sh-text"><h4>${h}<button type="button" aria-label="编辑">${icon('pencil-simple', 16)}</button></h4><p${t ? '' : ' class="sh-3"'}>${t || '还没写，点 ✎ 填写'}</p></div>`
const bio = (o) => `<div class="sh-fields">${FIELDS.map(([k, v], i) => `<div><small>${i ? '' : P(o.nFields)}${k}</small><b>${v}</b></div>`).join('')}</div>
<div class="sh-cols2"><div>${text('性格特点', '一谈到魔法就停不下来，觉得自己是房间里最聪明的人。')}${text('理想', '知识。通往力量与自我提升的道路就是知识。')}${text('羁绊', '')}${text('缺点', '')}</div><div>${text('外貌', '')}${text('传记', '深水城的法师，曾是魔法女神的……')}${text('给 AI 的说明', '')}</div></div>`
const note = (o) => `<div class="sh-cols"><div class="sh-side">${tbl('minmax(0,1fr) 32px', `${sec('笔记', 3, [], { add: '新笔记', n: o.nNotes })}${tr([it('1', '第 3 次跑团', '11 月 12 日')], ' data-open="true"')}${tr([it('2', '和影心的约定', '11 月 5 日')])}${tr([it('3', '欠酒馆老板 5 金币', '10 月 30 日')])}`)}</div>
<div>${text('第 3 次跑团', '在失落矿坑入口遇到地精伏击，用掉了 2 个 1 环法术位……')}</div></div>`

export const bodies = { action: (o) => `<div class="sh-cols"><div class="sh-side" data-narrow="hide">${skills(o.nSk)}</div><div>${actions(o)}</div></div>`, stats, bag, spell, feat, effect, bio, note }

/** 整页详情：顶栏 · 深色页头 · 状态/法术位条 · 分页 · 分页内容 · 底部固定条。tabsOnly = 已滚到分页（页头滚出去，分页条吸顶）。 */
export function detail(o = {}) {
  const sel = o.tab ?? 'action'
  const upper = o.tabsOnly ? '' : `${hero(o)}${strip(o)}`
  return `<div class="sh-root">${top(o)}<div class="sh-scroll">${upper}${tabs(sel, o.nTabs)}${bodies[sel](o)}</div>${dock(o)}</div>`
}

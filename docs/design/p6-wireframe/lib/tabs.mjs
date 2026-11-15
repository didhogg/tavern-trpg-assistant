// 角色表各分页的内容（逐栏对照 Tidy5e actor/tabs/*；每页注释写出处）。数值与名字是占位示例，真实显示由内核给。
import { icon, btn, iconBtn, searchBox, P, more, dots, bar, step, filt, roll, sec, it, tr, c, tbl } from './parts.mjs'
import { card, skillsCard, toolsCard, pen, AB, f } from './sheet.mjs'

/** 工具行（T:ItemsActionBar：搜索 · 过滤开关 · 筛选菜单 · 排序菜单 · 全部展开 / 折叠 · 配置标签页 ⚙） */
const abar = (o, ph, toggles, extra = '') => `<div class="sh-tools">${searchBox(ph, o.nSearch)}${toggles ? filt(toggles, -1, o.nFilt) : ''}${btn('筛选', { small: true, ic: 'caret-down' })}${btn('排序', { small: true, ic: 'caret-down' })}${iconBtn('caret-down', '全部展开 / 折叠')}${iconBtn('gear', '配置本页的列')}${extra}</div>`
const pills = (a) => `<span class="sh-pills">${a.map((x) => `<span>${x}</span>`).join('')}</span>`

/* ---- 1 行动（T:CharacterSheetTab：ItemsActionBar + 按行动类型分组的表；脚注 [⇄ 切换按行动类型 / 按物品类型]） ---- */
const ACOLS = 'minmax(0,1fr) 60px 64px 110px 32px'
const AN = { narrow: 'minmax(0,1fr) 56px 104px 32px', hide: '2' }
const actRow = (ch, name, sub, uses, hit, dmg, attrs = '') => tr([it(ch, name, sub), c(uses), `<span>${hit ? roll(hit) : '—'}</span>`, `<span>${dmg ? roll(dmg) : '—'}</span>`, more()], attrs)
const action = (o) => `${abar(o, '搜 行动、法术、物品', ['A 动作', 'BA 附赠', 'R 反应'])}
${tbl(ACOLS, `${sec('动作', 6, ['次数', '命中/DC', '伤害/效果'], { n: o.nSec })}${actRow('匕', '匕首', '武器 · 近战或投掷 20/60 尺', '—', '+4', '1d4+2 穿刺')}${actRow('法', '法杖', '武器 · 近战 · 双手 1d8', '—', '+1', '1d6−1 钝击')}${actRow('火', '火焰箭', '戏法 · 120 尺', '—', '+6', '1d10 火焰', ' data-open="true"')}<div class="sh-desc">向射程内一个生物或物体投出一团火焰，命中造成 1d10 火焰伤害；易燃物被点燃。${pills(['戏法', '塑能', '动作', '120 尺', '言语 姿势'])}</div>${actRow('魔', '魔法飞弹', '1 环 · 120 尺 · 必中', '法术位', '', '3×(1d4+1) 力场')}${actRow('燃', '燃烧之手', '1 环 · 15 尺锥形', '法术位', 'DC 14 敏捷', '3d6 火焰')}${actRow('隐', '隐形术', '2 环 · 触碰 · 专注', '法术位', '', '隐形')}`, '', AN)}
${tbl(ACOLS, `${sec('附赠动作', 1, ['次数', '命中/DC', '伤害/效果'])}${actRow('朦', '朦胧步', '2 环 · 自身', '法术位', '', '传送 30 尺')}`, '', AN)}
${tbl(ACOLS, `${sec('反应', 1, ['次数', '命中/DC', '伤害/效果'])}${actRow('护', '护盾术', '1 环 · 自身 · 直到你下回合', '法术位', '', 'AC +5')}`, '', AN)}
${tbl(ACOLS, `${sec('其他', 1, ['次数', '恢复', ''])}${tr([it('奥', '奥术恢复', '短休时恢复法术位'), c('1 / 1'), c('长休'), c(''), more()])}`, '', AN)}
<div class="sh-tabfoot">${btn('按行动类型', { small: true, ic: 'caret-down' })}</div>`

/* ---- 2 属性（T:CharacterAttributesTab：左列 = 技能卡 + 工具熟练卡；右列 = 豁免卡 + 特质卡） ---- */
const saves = (o) => card('豁免', `${AB.map(([k, , , s, p]) => `<div class="sh-skr"><span>${`<i class="sh-pt" data-on="${p ? 1 : 0}"></i>`}</span><small></small><b>${k}</b><span class="sh-skv">${roll(s)}</span><span></span></div>`).join('')}<div class="sh-skr"><span></span><small></small><b>专注</b><span class="sh-skv">${roll('+4')}</span><span></span></div><p class="sh-note">职业豁免：智力、感知</p>`, { cols: ['加值', ''], penLabel: '手改：各项豁免', np: o.nPenSv })
const trow = (k, v) => `<div class="sh-trait"><b>${k}</b><div>${v}</div></div>`
const traits = (o) => card('特质', `${trow('职业', pills(['法师 3']))}${trow('种族', pills(['人类']))}${trow('背景', pills(['学者']))}${trow('速度', '步行 30 尺')}${trow('感官', pills(['黑暗视觉 60 尺']))}${trow('语言', pills(['通用语', '精灵语', '矮人语', '龙语']))}${trow('伤害抗性', '<span class="sh-3">—</span>')}${trow('伤害免疫', '<span class="sh-3">—</span>')}${trow('状态免疫', '<span class="sh-3">—</span>')}${trow('护甲熟练', '<span class="sh-3">—</span>')}${trow('武器熟练', pills(['匕首', '飞镖', '投石索', '短棍', '轻弩']))}${trow('特殊特质', '<span class="sh-3">—</span>')}`, { penLabel: '手改：语言、感官、抗性、熟练', np: o.nPenTr, n: o.nTrait })
const attr = (o) => `<div class="sh-cols2"><div>${skillsCard(o)}${toolsCard(o)}</div><div>${saves(o)}${traits(o)}</div></div>`

/* ---- 3 背包（T:ActorInventoryTab：InventoryActionBar + 负重行 + 按物品类型分组的表 + 脚注（调谐）；分组 T:features/sections/Inventory.ts = 武器 / 装备 / 消耗品 / 工具 / 容器 / 杂物 + 自定义分组） ---- */
const BCOLS = 'minmax(0,1fr) 56px 96px 64px 40px 32px'
const BN = { narrow: 'minmax(0,1fr) 96px 40px 32px', hide: '2 4' }
const bagRow = (ch, name, sub, uses, qty, wt, eq, attrs = '') => tr([it(ch, name, sub), c(uses), `<span>${qty == null ? '—' : step(qty)}</span>`, c(wt), `<span>${eq == null ? '' : `<i class="sh-eq" data-on="${eq}"></i>`}</span>`, more()], attrs)
const H = ['次数', '数量', '重量', '装备']
const bag = (o) => `${abar(o, '搜 物品', ['已装备', '可使用'], btn('加物品', { small: true, ic: 'plus', n: o.nAdd }))}
${card('负重', `<div class="sh-enc">${bar(34, 120, 0, { plain: true })}<b>34 / 120 磅</b><span class="sh-2">力量 8 · 中型</span></div>`, { penLabel: '手改：负重上限', np: o.nPenEnc, n: o.nEnc })}
${tbl(BCOLS, `${sec('武器', 2, H, { add: '加武器' })}${bagRow('匕', '匕首', '简易近战 · 灵巧 投掷', '—', 1, '1 磅', true)}${bagRow('法', '法杖', '简易近战 · 双用', '—', 1, '4 磅', true)}`, '', BN)}
${tbl(BCOLS, `${sec('装备', 2, H, { add: '加装备' })}${bagRow('书', '法术书', '奥术法器 · 9 个法术', '—', null, '3 磅', true)}${bagRow('水', '水晶球', '奥术法器', '—', null, '1 磅', true)}`, '', BN)}
${tbl(BCOLS, `${sec('消耗品', 1, H, { add: '加消耗品' })}${bagRow('药', '治疗药水', '恢复 2d4+2 生命', '1 / 1', 2, '1 磅', null)}`, '', BN)}
${tbl(BCOLS, `${sec('工具', 1, H, { add: '加工具', n: o.nTool })}${bagRow('书', '书法家工具', '工具 · 智力', '—', 1, '5 磅', null)}`, '', BN)}
${tbl(BCOLS, `${sec('容器', 1, H, { add: '加容器', n: o.nBox })}${bagRow('▾', '背包', '容器 · 装了 4 种 · 容量 30 磅', '—', null, '5 磅', null, ' data-open="true"')}${bagRow('口', '口粮', '杂物', '—', 5, '10 磅', null, ' data-sub="true"')}${bagRow('火', '火把', '杂物', '—', 10, '10 磅', null, ' data-sub="true"')}${bagRow('金', '金币 (gp)', '钱币 · 来自库（钱币就是物品，没有钱币栏）', '—', 48, '0.96 磅', null, ' data-sub="true"')}`, '', BN)}
<div class="sh-tabfoot"><span class="sh-2">调谐 0 / 3</span></div>`

/* ---- 4 法术（T:ActorSpellbookTab：ItemsActionBar + 按环分组的表，组头带法术位（SpellSlotManagement）+ 脚注：施法摘要卡（属性 / DC / 攻击 / 已准备）、专注、[加法术]） ---- */
const SCOLS = 'minmax(0,1fr) 52px 64px 96px 96px 32px'
const SN = { narrow: 'minmax(0,1fr) 76px 88px 28px', hide: '2 3' }
const spRow = (prep, ch, name, sub, time, range, hit, eff) => tr([`<span class="sh-it">${prep == null ? '<em class="sh-prep" style="visibility:hidden"></em>' : `<em class="sh-prep" data-on="${prep}"></em>`}${it(ch, name, sub)}</span>`, c(time), c(range), `<span>${hit ? roll(hit) : '—'}</span>`, `<span>${eff ? roll(eff) : '—'}</span>`, more()])
const SH = ['施放', '距离', '命中/DC', '效果']
const spell = (o) => `${abar(o, '搜 法术', ['已准备', '专注', '仪式'])}
${tbl(SCOLS, `${sec('戏法', 3, SH)}${spRow(null, '火', '火焰箭', '塑能 · 言语 姿势', '动作', '120 尺', '+6', '1d10 火焰')}${spRow(null, '手', '法师之手', '咒法', '动作', '30 尺', '', '')}${spRow(null, '光', '光亮术', '塑能', '动作', '触碰', '', '')}`, '', SN)}
${tbl(SCOLS, `${sec('1 环', null, SH, { extra: ` ${dots(4, 2)} <small>2/4</small> ${pen('手改：法术位', o.nSlotPen)}`, n: o.nLv })}${spRow(true, '魔', '魔法飞弹', '塑能', '动作', '120 尺', '', '3×(1d4+1)')}${spRow(true, '护', '护盾术', '防护', '反应', '自身', '', 'AC +5')}${spRow(true, '燃', '燃烧之手', '塑能', '动作', '15 尺', 'DC 14 敏', '3d6 火焰')}${spRow(true, '侦', '侦测魔法', '预言 · 专注 · 仪式', '动作', '自身', '', '')}${spRow(false, '甲', '法师护甲', '防护', '动作', '触碰', '', 'AC 13+敏')}`, '', SN)}
${tbl(SCOLS, `${sec('2 环', null, SH, { extra: ` ${dots(2, 1)} <small>1/2</small>` })}${spRow(true, '隐', '隐形术', '幻术 · 专注', '动作', '触碰', '', '')}${spRow(true, '朦', '朦胧步', '咒法', '附赠', '自身', '', '传送 30 尺')}`, '', SN)}
${card('施法摘要', `<div class="sh-sum"><div><small>属性</small><b>智力</b></div><div><small>豁免 DC</small><b>14</b></div><div><small>攻击</small><b>+6</b></div><div><small>已准备</small><b>6 / 7</b></div><div><small>专注</small><b>隐形术</b></div></div>`, { penLabel: '手改：法术豁免 DC、法术攻击加值', np: o.nPenSp, n: o.nCast })}
<div class="sh-tabfoot">${btn('加法术', { small: true, ic: 'plus' })}</div>`

/* ---- 5 特性（T:CharacterFeaturesTab：ItemsActionBar + 按来源分组的特性表 + [加特性]） ---- */
const FCOLS = 'minmax(0,1fr) 72px 72px 32px'
const feat = (o) => `${abar(o, '搜 特性', ['主动', '被动'], btn('加特性', { small: true, ic: 'plus' }))}
${tbl(FCOLS, `${sec('职业 · 法师', 4, ['次数', '恢复', ''], { n: o.nCls })}${tr([it('奥', '奥术恢复', '法师 1 级'), `<span>${dots(1, 1)} 1/1</span>`, c('长休'), more()])}${tr([it('施', '施法', '法师 1 级'), c('—'), c(''), more()])}${tr([it('奥', '奥术传统', '法师 2 级'), c('—'), c(''), more()])}${tr([it('塑', '塑能学者', '塑能学派 2 级'), c('—'), c(''), more()])}`)}
${tbl(FCOLS, `${sec('种族 · 人类', 1, ['次数', '恢复', ''])}${tr([it('人', '多才多艺', '人类'), c('—'), c(''), more()])}`)}
${tbl(FCOLS, `${sec('背景 · 学者', 2, ['次数', '恢复', ''])}${tr([it('研', '研究者', '背景特性'), c('—'), c(''), more()])}${tr([it('!', '旧房规：书呆子', '资料不可用（这本书没开启）', { warn: true }), c('—'), c(''), more(o.nGone)])}`)}`

/* ---- 6 效果（T:ActorEffectsTab：状态开关表（含力竭）+ 效果表；效果分组名按 dnd5e 类别，未逐项核对） ---- */
const ECOLS = 'minmax(0,1fr) 92px 90px 40px 32px'
const EN = { narrow: 'minmax(0,1fr) 40px 32px', hide: '2 3' }
const CONDS = [['目盲'], ['魅惑'], ['耳聋'], ['恐慌'], ['擒抱'], ['失能'], ['隐形', 1], ['麻痹'], ['石化'], ['中毒', 1], ['倒地'], ['束缚'], ['震慑'], ['昏迷']]
const effect = (o) => `${card('状态', `<div class="sh-conds">${P(o.nCond)}${CONDS.map(([t, on]) => `<button class="sh-chip${on ? '' : ' sh-chip--add'}" data-on="${!!on}" type="button">${t}</button>`).join('')}<span class="sh-chip" style="padding:0 6px 0 10px">力竭 ${step(0)}</span></div>`, { cols: [] })}
${tbl(ECOLS, `${sec('生效中', 2, ['来源', '持续', '开关'], { add: '新建效果', n: o.nNew })}${tr([it('隐', '隐形', '状态 · 专注维持'), c('隐形术'), c('1 小时'), '<span><i class="sh-eq" data-on="true"></i></span>', more()])}${tr([it('毒', '中毒', '状态 · 攻击与检定劣势'), c('手动'), c('—'), '<span><i class="sh-eq" data-on="true"></i></span>', more()])}`, '', EN)}
${tbl(ECOLS, `${sec('被动', 1, ['来源', '持续', '开关'])}${tr([it('水', '奥术法器', '被动'), c('水晶球'), c('常驻'), '<span><i class="sh-eq" data-on="true"></i></span>', more()])}`, '', EN)}
${tbl(ECOLS, `${sec('停用', 1, ['来源', '持续', '开关'])}${tr([it('甲', '法师护甲：AC 13+敏', '临时效果 · 已结束'), c('法师护甲'), c('8 小时'), '<span><i class="sh-eq" data-on="false"></i></span>', more()])}`, '', EN)}`

/* ---- 7 背景（T:CharacterBiographyTab：特征 9 项 alignment gender age height weight eyes skin hair faith + 性格 trait ideal bond flaw + appearance + biography；平时只显示有内容的，✎ 才显示全部） ---- */
const FIELDS = [['阵营', '中立善良'], ['性别', '男'], ['年龄', '35'], ['身高', '5 尺 11 寸'], ['体重', '170 磅'], ['眼睛', '棕色'], ['皮肤', '浅色'], ['头发', '深棕'], ['信仰', '密斯特拉']]
const text = (h, t, n) => card(h, `<p class="sh-bio${t ? '' : ' sh-3'}">${t || '还没写，点 ✎ 填写'}</p>`, { penLabel: `编辑：${h}`, np: n })
const bio = (o) => `<div class="sh-fields">${P(o.nFields)}${FIELDS.map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
<div class="sh-cols2"><div>${text('性格特点', '一谈到魔法就停不下来，觉得自己是房间里最聪明的人。')}${text('理想', '知识。通往力量与自我提升的道路就是知识。')}${text('羁绊', '')}${text('缺点', '')}</div><div>${text('外貌', '')}${text('传记', '深水城的法师，曾是魔法女神的……')}${text('给 AI 的说明', '')}</div></div>`

/* ---- 8 日志（T:ActorJournalTab：左边页列表 + 右边正文 + 上一页 / 下一页 / 新页） ---- */
const note = (o) => `<div class="sh-cols2 sh-cols2--j"><div>${tbl('minmax(0,1fr) 32px', `${sec('日志页', 3, [], { add: '新页', n: o.nNotes })}${tr([it('1', '第 3 次跑团', '11 月 12 日')], ' data-open="true"')}${tr([it('2', '和影心的约定', '11 月 5 日')])}${tr([it('3', '欠酒馆老板 5 金币', '10 月 30 日')])}`)}</div>
<div>${text('第 3 次跑团', '在失落矿坑入口遇到地精伏击，用掉了 2 个 1 环法术位……')}</div></div>`

export const bodies = { action, attr, bag, spell, feat, effect, bio, note }

// 角色表各分页的主界面（逐栏对照 Tidy5e actor/tabs/*；每页注释写出处）。数值与名字是占位示例，真实显示由内核给。
// 子界面状态用 o 里的开关画出来：o.menu（filter / sort）、o.rowMenu、o.expand、o.bioEdit、o.jNew 等。
import { icon, btn, iconBtn, searchBox, P, more, dots, bar, step, filt, roll, sec, it, tr, c, tbl } from './parts.mjs'
import { card, skillsCard, toolsCard, pen, menu, mrel, AB, f } from './sheet.mjs'
import { ROWS } from './items.mjs'

const rowMore = (o, items) => (o.rowMenu ? mrel(more() + menu(items, { right: true })) : more())
const MENU_ACT = [['编辑条目…'], ['置顶到收藏'], ['复制一份'], ['', 'sep'], ['删除', 'danger']]
const MENU_BAG = [['卸下'], ['编辑武器属性…'], ['选为弹药…'], ['移进容器…'], ['置顶到收藏'], ['复制一份'], ['', 'sep'], ['删除', 'danger']]
const MENU_SPL = [['取消准备'], ['编辑条目…'], ['置顶到收藏'], ['', 'sep'], ['删除', 'danger']]
const MENU_FEA = [['编辑条目…'], ['置顶到收藏'], ['', 'sep'], ['删除', 'danger']]
const MENU_EFF = [['编辑效果…'], ['停用'], ['', 'sep'], ['删除', 'danger']]
const FILTER_MENU = `<div class="sh-menu" style="min-width:250px"><div class="sh-menu__h">筛选　<small>点图钉把常用的放到操作栏</small></div><div class="sh-menu__i"><i class="sh-ckb" data-on="true"></i>动作类型：动作<i>${icon('push-pin-fill', 13)}</i></div><div class="sh-menu__i"><i class="sh-ckb"></i>动作类型：附赠<i>${icon('push-pin-fill', 13)}</i></div><div class="sh-menu__i"><i class="sh-ckb"></i>有次数的<i>${icon('push-pin-fill', 13)}</i></div><div class="sh-menu__i"><i class="sh-ckb"></i>已装备的<i>${icon('push-pin-fill', 13)}</i></div><hr><div class="sh-menu__i" style="color:var(--text2)">（筛选项由数据给，不手写）</div><div class="sh-menu__f">${btn('清除', { small: true })}${btn('完成', { small: true, primary: true })}</div></div>`
const SORT_MENU = `<div class="sh-menu"><div class="sh-menu__i">${icon('check', 14)}名称</div><div class="sh-menu__i"><span style="width:14px"></span>手动顺序</div><div class="sh-menu__i"><span style="width:14px"></span>类别</div></div>`
/** 操作栏（T:ItemsActionBar：搜索 · 置顶的过滤开关 · 筛选菜单 · 排序菜单 · 全部展开 / 折叠 · 配置本页的列） */
const abar = (o, ph, toggles, extra = '') => `<div class="sh-tools">${searchBox(ph, o.nSearch)}${toggles ? filt(toggles, -1, o.nFilt) : ''}${mrel(btn('筛选', { small: true, ic: 'caret-down' }) + (o.menu === 'filter' ? FILTER_MENU : ''))}${mrel(btn('排序', { small: true, ic: 'caret-down' }) + (o.menu === 'sort' ? SORT_MENU : ''))}${iconBtn('caret-down', '全部展开 / 折叠')}${iconBtn('gear', '配置本页的列')}${extra}</div>`
const pills = (a) => `<span class="sh-pills">${a.map((x) => `<span>${x}</span>`).join('')}</span>`
const desc = (t, pl) => `<div class="sh-desc">${t}${pills(pl)}</div>`

/* ---- 1 行动（T:CharacterSheetTab） ---- */
const ACOLS = 'minmax(0,1fr) 60px 64px 110px 32px'
const AN = { narrow: 'minmax(0,1fr) 56px 104px 32px', hide: '2' }
const actRow = (ch, name, sub, uses, hit, dmg, mp, attrs = '') => tr([it(ch, name, sub), c(uses), `<span>${hit ? roll(hit) : '—'}</span>`, `<span>${dmg ? roll(dmg) : '—'}</span>`, mp ?? more()], attrs)
const action = (o) => `${abar(o, '搜 行动、法术、物品', ['A 动作', 'BA 附赠', 'R 反应'])}
${tbl(ACOLS, `${sec('动作', 6, ['次数', '命中/DC', '伤害/效果'], { n: o.nSec })}${actRow('匕', '匕首', '武器 · 近战或投掷 20/60 尺', '—', '+4', '1d4+2 穿刺', rowMore(o, MENU_ACT))}${actRow('法', '法杖', '武器 · 近战 · 双手 1d8', '—', '+1', '1d6−1 钝击')}${actRow('火', '火焰箭', '戏法 · 120 尺', '—', '+6', '1d10 火焰', null, ' data-open="true"')}${desc('向射程内一个生物或物体投出一团火焰，命中造成 1d10 火焰伤害；易燃物被点燃。', ['戏法', '塑能', '动作', '120 尺', '言语 姿势'])}${actRow('魔', '魔法飞弹', '1 环 · 120 尺 · 必中', '法术位', '', '3×(1d4+1) 力场')}${actRow('燃', '燃烧之手', '1 环 · 15 尺锥形', '法术位', 'DC 14 敏捷', '3d6 火焰')}${actRow('隐', '隐形术', '2 环 · 触碰 · 专注', '法术位', '', '隐形')}`, '', AN)}
${tbl(ACOLS, `${sec('附赠动作', 1, ['次数', '命中/DC', '伤害/效果'])}${actRow('朦', '朦胧步', '2 环 · 自身', '法术位', '', '传送 30 尺')}`, '', AN)}
${tbl(ACOLS, `${sec('反应', 1, ['次数', '命中/DC', '伤害/效果'])}${actRow('护', '护盾术', '1 环 · 自身 · 直到你下回合', '法术位', '', 'AC +5')}`, '', AN)}
${tbl(ACOLS, `${sec('其他', 1, ['次数', '恢复', ''])}${tr([it('奥', '奥术恢复', '短休时恢复法术位'), c('1 / 1'), c('长休'), c(''), more()])}`, '', AN)}
<div class="sh-tabfoot">${btn('按行动类型', { small: true, ic: 'caret-down' })}</div>`

/* ---- 2 属性（T:CharacterAttributesTab + character-attributes-tab.css：网格 左 17.5rem 窄 | 右 1fr，列间距 / 卡间距 24px；
        容器 <40rem：「技能｜豁免」「技能｜工具」「特质通栏」；<30rem：单列 技能→豁免→工具→特质） ---- */
const saves = (o) => card('豁免', `<div class="sh-saves">${AB.map(([k, , , s, p]) => `<div class="sh-sv"><i class="sh-pt" data-on="${p ? 1 : 0}"></i><b>${k}</b><span>${roll(s)}</span></div>`).join('')}</div><div class="sh-saves sh-saves--sp"><div class="sh-sv"><span></span><b>专注</b><span>${roll('+4')}</span></div><div class="sh-sv sh-sv--n"><span></span><b>职业豁免</b><span class="sh-2">智力 · 感知</span></div></div>`, { penLabel: '来源条目：各项豁免', np: o.nPenSv, n: o.nSv })
const trow = (k, v) => `<div class="sh-trait"><b>${k}</b><div>${v}</div></div>`
const dash = '<span class="sh-3">—</span>'
const traits = (o) => card('特质', `${trow('职业', pills(['法师 3']))}${trow('种族', pills(['人类']))}${trow('背景', pills(['学者']))}${trow('速度', '步行 30 尺')}${trow('感官', pills(['黑暗视觉 60 尺']))}${trow('语言', pills(['通用语', '精灵语', '矮人语', '龙语']))}${trow('伤害抗性', dash)}${trow('伤害免疫', dash)}${trow('易伤', dash)}${trow('状态免疫', dash)}${trow('护甲熟练', dash)}${trow('武器熟练', pills(['匕首', '飞镖', '投石索', '短棍', '轻弩']))}${trow('特殊特质', dash)}`, { penLabel: '来源条目：语言、感官、抗性、熟练', np: o.nPenTr, n: o.nTrait })
const attr = (o) => `<div class="sh-attrcols"><div class="sh-acol"><div style="grid-area:skills">${skillsCard(o)}</div><div style="grid-area:tools">${toolsCard(o)}</div></div><div class="sh-acol"><div style="grid-area:saves">${saves(o)}</div><div style="grid-area:traits">${traits(o)}</div></div></div>`

/* ---- 3 背包（T:ActorInventoryTab；分组 = 物品类型，T:features/sections/Inventory.ts）。每种物品有自己的状态标签和专用按钮（lib/items.mjs） ---- */
const BCOLS = 'minmax(0,1fr) 74px 96px 62px 96px 32px'
const BN = { narrow: 'minmax(0,1fr) 84px 84px 32px', hide: '2 4' }
const H = ['次数 / 加值', '数量', '重量', '操作']
const bag = (o) => `${abar(o, '搜 物品', ['已装备', '可使用'], btn('加物品', { small: true, ic: 'plus', n: o.nAdd }))}
${card('负重', `<div class="sh-enc">${bar(34, 120, 0, { plain: true })}<b>34 / 120 磅</b><span class="sh-2">力量 8 · 中型</span></div>`, { penLabel: '负重与调谐上限的来源条目', np: o.nPenEnc, n: o.nEnc })}
${tbl(BCOLS, `${sec('武器', 3, H, { add: '加武器' })}${ROWS.weapon(rowMore(o, MENU_BAG)).join('')}${o.expand ? desc('一把短小的刃，可近战也可投掷。', ['简易', '灵巧', '投掷 20/60']) : ''}`, '', BN)}
${tbl(BCOLS, `${sec('装备', 5, H, { add: '加装备' })}${ROWS.armor().join('')}${ROWS.charge().join('')}`, '', BN)}
${tbl(BCOLS, `${sec('消耗品', 3, H, { add: '加消耗品' })}${ROWS.consumable().join('')}`, '', BN)}
${tbl(BCOLS, `${sec('工具', 2, H, { add: '加工具', n: o.nTool })}${ROWS.tool().join('')}`, '', BN)}
${tbl(BCOLS, `${sec('容器', 4, H, { add: '加容器', n: o.nBox })}${ROWS.box().join('')}`, '', BN)}
<div class="sh-tabfoot"><span class="sh-2">调谐 2 / 3</span>${btn('分组设置', { small: true, ic: 'gear' })}</div>`

/* ---- 4 法术（T:ActorSpellbookTab） ---- */
const SCOLS = 'minmax(0,1fr) 52px 64px 96px 96px 32px'
const SN = { narrow: 'minmax(0,1fr) 76px 88px 28px', hide: '2 3' }
const spRow = (prep, ch, name, sub, time, range, hit, eff, mp) => tr([`<span class="sh-it">${prep == null ? '<em class="sh-prep" style="visibility:hidden"></em>' : `<em class="sh-prep" data-on="${prep}"></em>`}${it(ch, name, sub)}</span>`, c(time), c(range), `<span>${hit ? roll(hit) : '—'}</span>`, `<span>${eff ? roll(eff) : '—'}</span>`, mp ?? more()])
const SH = ['施放', '距离', '命中/DC', '效果']
const spell = (o) => `${abar(o, '搜 法术', ['已准备', '专注', '仪式'])}
${tbl(SCOLS, `${sec('戏法', 3, SH)}${spRow(null, '火', '火焰箭', '塑能 · 言语 姿势', '动作', '120 尺', '+6', '1d10 火焰')}${spRow(null, '手', '法师之手', '咒法', '动作', '30 尺', '', '')}${spRow(null, '光', '光亮术', '塑能', '动作', '触碰', '', '')}`, '', SN)}
${tbl(SCOLS, `${sec('1 环', null, SH, { extra: ` ${dots(4, 2)} <small>2/4</small> ${pen('来源条目：法术位', o.nSlotPen)}`, n: o.nLv })}${spRow(true, '魔', '魔法飞弹', '塑能', '动作', '120 尺', '', '3×(1d4+1)', rowMore(o, MENU_SPL))}${o.expand ? desc('三道魔法飞镖，各造成 1d4+1 力场伤害，必中。', ['1 环', '塑能', '动作', '120 尺', '言语 姿势']) : ''}${spRow(true, '护', '护盾术', '防护', '反应', '自身', '', 'AC +5')}${spRow(true, '燃', '燃烧之手', '塑能', '动作', '15 尺', 'DC 14 敏', '3d6 火焰')}${spRow(true, '侦', '侦测魔法', '预言 · 专注 · 仪式', '动作', '自身', '', '')}${spRow(false, '甲', '法师护甲', '防护', '动作', '触碰', '', 'AC 13+敏')}`, '', SN)}
${tbl(SCOLS, `${sec('2 环', null, SH, { extra: ` ${dots(2, 1)} <small>1/2</small>` })}${spRow(true, '隐', '隐形术', '幻术 · 专注', '动作', '触碰', '', '')}${spRow(true, '朦', '朦胧步', '咒法', '附赠', '自身', '', '传送 30 尺')}`, '', SN)}
${card('施法摘要', `<div class="sh-sum"><div><small>属性</small><b>智力</b></div><div><small>豁免 DC</small><b>14</b></div><div><small>攻击</small><b>+6</b></div><div><small>已准备</small><b>6 / 7</b></div><div><small>专注</small><b>隐形术</b></div></div>`, { penLabel: '来源条目：施法属性、法术豁免 DC、法术攻击加值', np: o.nPenSp, n: o.nCast })}
<div class="sh-tabfoot">${btn('加法术', { small: true, ic: 'plus', n: o.nAddSp })}</div>`

/* ---- 5 特性（T:CharacterFeaturesTab） ---- */
const FCOLS = 'minmax(0,1fr) 72px 72px 32px'
const feat = (o) => `${abar(o, '搜 特性', ['主动', '被动'], btn('加特性', { small: true, ic: 'plus', n: o.nAddFe }))}
${tbl(FCOLS, `${sec('职业 · 法师', 4, ['次数', '恢复', ''], { n: o.nCls })}${tr([it('奥', '奥术恢复', '法师 1 级'), `<span>${dots(1, 1)} 1/1 ${pen('来源条目：次数、恢复', o.nPenUse)}</span>`, c('长休'), rowMore(o, MENU_FEA)])}${o.expand ? desc('短休时恢复已消耗的法术位，总环级不超过法师等级的一半。', ['职业特性', '长休恢复']) : ''}${tr([it('施', '施法', '法师 1 级'), c('—'), c(''), more()])}${tr([it('奥', '奥术传统', '法师 2 级'), c('—'), c(''), more()])}${tr([it('塑', '塑能学者', '塑能学派 2 级'), c('—'), c(''), more()])}`)}
${tbl(FCOLS, `${sec('种族 · 人类', 1, ['次数', '恢复', ''])}${tr([it('人', '多才多艺', '人类'), c('—'), c(''), more()])}`)}
${tbl(FCOLS, `${sec('背景 · 学者', 2, ['次数', '恢复', ''])}${tr([it('研', '研究者', '背景特性'), c('—'), c(''), more()])}${tr([it('!', '旧房规：书呆子', '资料不可用（这本书没开启）', { warn: true }), c('—'), c(''), more(o.nGone)])}`)}`

/* ---- 6 效果（T:ActorEffectsTab） ---- */
const ECOLS = 'minmax(0,1fr) 92px 90px 40px 32px'
const EN = { narrow: 'minmax(0,1fr) 40px 32px', hide: '2 3' }
const CONDS = [['目盲'], ['魅惑'], ['耳聋'], ['恐慌'], ['擒抱'], ['失能'], ['隐形', 1], ['麻痹'], ['石化'], ['中毒', 1], ['倒地'], ['束缚'], ['震慑'], ['昏迷']]
const effect = (o) => `${card('状态', `<div class="sh-conds">${P(o.nCond)}${CONDS.map(([t, on]) => `<button class="sh-chip${on ? '' : ' sh-chip--add'}" data-on="${!!on}" type="button">${t}</button>`).join('')}<span class="sh-chip" style="padding:0 6px 0 10px">力竭 ${step(0)}</span></div>`, { cols: [] })}
${tbl(ECOLS, `${sec('生效中', 2, ['来源', '持续', '开关'], { add: '新建效果', n: o.nNew })}${tr([it('隐', '隐形', '状态 · 专注维持'), c('隐形术'), c('1 小时'), '<span><i class="sh-eq" data-on="true"></i></span>', rowMore(o, MENU_EFF)])}${o.expand ? desc('隐形：不可被看见；攻击有优势，被攻击有劣势。攻击或施法时结束。', ['状态', '专注']) : ''}${tr([it('毒', '中毒', '状态 · 攻击与检定劣势'), c('手动'), c('—'), '<span><i class="sh-eq" data-on="true"></i></span>', more()])}`, '', EN)}
${tbl(ECOLS, `${sec('被动', 1, ['来源', '持续', '开关'])}${tr([it('水', '奥术法器', '被动'), c('水晶球'), c('常驻'), '<span><i class="sh-eq" data-on="true"></i></span>', more()])}`, '', EN)}
${tbl(ECOLS, `${sec('停用', 1, ['来源', '持续', '开关'])}${tr([it('甲', '法师护甲：AC 13+敏', '临时效果 · 已结束'), c('法师护甲'), c('8 小时'), '<span><i class="sh-eq" data-on="false"></i></span>', more()])}`, '', EN)}`

/* ---- 7 背景（T:CharacterBiographyTab：上 = 外貌 + 传记两个文本卡；下一行 左 = 性格（特点 / 理想 / 羁绊 / 缺点），右 = 特征字段；平时只显示有内容的，空的收成「＋ 添加」；
        编辑 = 卡内原地变成输入框。特征字段按驾驶员 11-15 只留 性别、信仰；备注是驾驶员的需求，源码里没有） ---- */
const textCard = (h, t, o2 = {}) => card(h, o2.edit
  ? `<div class="sh-edit"><div class="sh-edit__tb"><b>B</b><i>I</i><u>U</u><span>•</span></div><div class="sh-edit__area">${t}<i class="sh-caret"></i></div><div class="sh-edit__act">${btn('取消', { small: true })}${btn('保存', { small: true, primary: true })}</div></div>`
  : `<p class="sh-bio">${t}</p>`, { penLabel: `编辑：${h}`, np: o2.n })
const bio = (o) => `<div class="sh-bio-wrap">${textCard('外貌', '高个子，深色头发，右手有墨渍。', { n: o.nApp, edit: o.bioEdit })}${textCard('传记', '深水城的法师，曾是魔法女神密斯特拉的信徒……')}
<div class="sh-cols2"><div class="sh-colstack">${textCard('性格特点', '一谈到魔法就停不下来，觉得自己是房间里最聪明的人。')}${textCard('理想', '知识。通往力量与自我提升的道路就是知识。')}<div class="sh-addrow">${P(o.nAddBio)}<span class="sh-2">还没写的：</span><button class="sh-chip sh-chip--add" type="button">${icon('plus', 14)} 羁绊</button><button class="sh-chip sh-chip--add" type="button">${icon('plus', 14)} 缺点</button></div></div>
<div class="sh-colstack">${card('特征', `<div class="sh-kvs"><div><small>性别</small><b>男</b></div><div><small>信仰</small><b>密斯特拉</b></div></div>`, { penLabel: '编辑：特征', np: o.nFea })}${textCard('备注', '自己的备忘，比如下次要问的事、人物关系。')}</div></div></div>`

/* ---- 8 日志（T:ActorJournalTab：页列表 + 正文 + 上一页 / 下一页 / 新页） ---- */
const note = (o) => `<div class="sh-cols2 sh-cols2--j"><div>${tbl('minmax(0,1fr) 32px', `${sec('日志页', 3, [], { add: '新页', n: o.nNotes })}${o.jNew ? tr([`<span class="sh-it"><i>4</i><div><span class="sh-in" data-focus="true" style="height:30px;font-size:var(--fs-md)">新页的名字</span></div></span>`, c('')]) : ''}${tr([it('1', '第 3 次跑团', '11 月 12 日'), o.jMenu ? mrel(more() + menu([['重命名'], ['', 'sep'], ['删除', 'danger']], { right: true })) : more()], ' data-open="true"')}${tr([it('2', '和影心的约定', '11 月 5 日'), more()])}${tr([it('3', '欠酒馆老板 5 金币', '10 月 30 日'), more()])}`)}</div>
<div>${textCard('第 3 次跑团', '在失落矿坑入口遇到地精伏击，用掉了 2 个 1 环法术位……', { edit: o.jEdit })}<div class="sh-tabfoot">${btn('‹ 上一页', { small: true })}${btn('下一页 ›', { small: true })}</div></div></div>`

export const bodies = { action, attr, bag, spell, feat, effect, bio, note }

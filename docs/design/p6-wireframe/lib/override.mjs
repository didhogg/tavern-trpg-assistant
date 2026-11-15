// 角色表的小抽屉（驾驶员 2026-11-15 第二次修正：取消「自动|手动」二选一，那个没有意义）。三种抽屉，按"这个数是谁说了算"分开：
//   ① 直接填写（formDrawer）：本来就该玩家自己写的——名字、英文名、阵营、性别、信仰、经验。普通表单：填 → [保存]。
//   ② 来源条目（ruleDrawer）：内核结算出来的——种族、背景、体型、速度、感官、AC、最大生命、属性值、豁免、技能熟练、语言抗性……
//      每一项 = 一串小条目，每条写明来源（种族 / 背景 / 职业 / 专长 / 装备 / 手动）；顶上是结算结果；
//      用户可以 × 删掉任何一条（自动来的删掉后收进「已移除」，随时 [重新分配] 放回）、[＋ 添加条目] 手动加一条（来源写「手动」）。没有「覆盖成固定数」这回事。
//   ③ 状态 / 掷骰（生命骰 · 力竭 · 死亡豁免）：改数量或掷骰，不原地改、不放小图标。
// 外面所有结算值都是只读文字；含有「手动」条目的数字下面有一条金线。示例数值是占位，真实值由内核给。
import { btn, icon, P, mdl, mh } from './parts.mjs'

const inp = (t, o = {}) => `<span class="sh-in ovf-in"${o.focus ? ' data-focus="true"' : ''}>${t}${o.suffix ? `<i>${o.suffix}</i>` : ''}</span>`
/** 普通填写项：标签在上、输入框在下 */
export const ff = (label, val, o = {}) => `<label class="ovf"><small>${o.n ? P(o.n) : ''}${label}</small>${inp(val, o)}${o.hint ? `<em>${o.hint}</em>` : ''}</label>`
const sel = (label, val, o = {}) => `<label class="ovf"><small>${label}</small><span class="sh-in ovf-in ovf-sel">${val}${icon('caret-down', 14)}</span>${o.hint ? `<em>${o.hint}</em>` : ''}</label>`
export const grp = (t, body, o = {}) => `<div class="ovd-grp"><h4>${t}${o.right ? `<span>${o.right}</span>` : ''}</h4>${body}</div>`
const pad = (inner) => `<div class="ovf-pad">${inner}</div>`

/** 抽屉外壳：foot = { ok, reset } */
export const drawer = (title, sub, body, o = {}) => mdl('confirm', mh(title, { n: o.nTitle }), `<div class="ovd">${sub ? `<p class="ovd-sub">${sub}</p>` : ''}${body}<div class="ovd-foot">${o.reset ? btn(o.reset) : ''}<span style="flex:1"></span>${btn('取消')}${btn(o.ok ?? '保存', { primary: true, n: o.nApply })}</div></div>`)

/* ---------- ② 来源条目 ---------- */
/** 结算结果条：顶上一行大字 + 算式 */
export const result = (label, val, formula) => `<div class="ovr"><small>${label}</small><b>${val}</b>${formula ? `<span>${formula}</span>` : ''}</div>`
/** 一条：名字 · 数值 · 来源标签 · × 删除。kind：'auto' 自动来的 · 'manual' 手动加的；gone = 已移除（点 重新分配） */
export const ent = ({ name, val, src, kind = 'auto', gone, n }) => `<div class="ove"${kind === 'manual' ? ' data-man="true"' : ''}${gone ? ' data-gone="true"' : ''}><div class="ov-itm"><b>${P(n)}${name}</b></div>${val != null ? `<span class="ove-v">${val}</span>` : '<span></span>'}<span class="ove-src" data-k="${kind}">${src}</span>${gone ? `<button class="ove-re" type="button">${icon('arrow-counter-clockwise', 13)}重新分配</button>` : kind === 'manual' ? `<span class="ove-act"><button class="sh-pen" type="button" aria-label="改这一条">${icon('pencil-simple', 14)}</button><button class="sh-pen" type="button" aria-label="删除这一条">${icon('x', 14)}</button></span>` : `<button class="sh-pen" type="button" aria-label="删除这一条">${icon('x', 14)}</button>`}</div>`
export const add = (label) => `<div class="ove-add">${btn(label, { small: true, ic: 'plus' })}</div>`
/** 一个条目分组：标题 + 若干条 + 加条目 */
export const ents = (title, rows, addLabel, o = {}) => grp(title, rows.join('') + (addLabel ? add(addLabel) : ''), o)
/** 已移除的自动条目 */
export const gone = (rows) => grp('已移除的自动条目', rows.map((r) => ent({ ...r, gone: true })).join(''), { right: '点「重新分配」放回去' })
/** 规则抽屉：顶上结果 + 条目；底部 [全部重新分配] 把本抽屉里移除过的自动条目放回 */
export const ruleDrawer = (title, sub, body, o = {}) => drawer(title, sub, body, { reset: '全部重新分配', ...o })
const SRC = { c: '职业·法师', r: '种族·人类', b: '背景·学者', a: '属性', l: '等级', w: '手动' }

/* ---------- 生命 / 等级 / 属性 / 战斗 ---------- */
export const hpDrawer = (o = {}) => ruleDrawer('最大生命', '当前生命、临时生命不在这里——在角色表上点数字直接改。这里只管「最大生命」是怎么算出来的。', [
  result('最大生命', '19', '= 6 + 4 + 5 + 3 + 1'),
  ents('组成', [ent({ name: '1 级 · 满生命骰（d6）', val: '+6', src: SRC.c, n: o.nRow }), ent({ name: '2 级 · 平均（d6）', val: '+4', src: SRC.l }), ent({ name: '3 级 · 掷骰（d6）', val: '+5', src: SRC.l }), ent({ name: '体质调整 ×3 级', val: '+3', src: SRC.a }), ent({ name: '额外生命（主持人加的）', val: '+1', src: SRC.w, kind: 'manual' })], '添加条目'),
  gone([{ name: '强韧专长 每级 +2', val: '+6', src: '专长·强韧' }])].join(''), o)
export const lvDrawer = (o = {}) => ruleDrawer('等级与熟练', '等级由职业等级加起来，升降级请用页头 [等级管理]（先预览）。这里看来源、写经验。', [
  grp('经验（直接填写）', pad(ff('当前经验', '900', { n: o.nRow, suffix: '/ 2,700 下一级' }))),
  result('等级', '3', '= 法师 3'),
  ents('职业等级', [ent({ name: '法师', val: '3 级', src: SRC.c })], '加兼职职业', { right: '升降级走 [等级管理]' }),
  result('熟练加值', '+2', '等级 3 → +2'),
  ents('熟练加值的条目', [ent({ name: '等级表', val: '+2', src: SRC.l })], '添加条目')].join(''), o)
export const abDrawer = (o = {}) => ruleDrawer('属性值', '每个属性的最终值 = 下面各条加起来；点一个属性展开看它的条目。基础值是建卡时填的，不是自动算的。', [
  grp('六个属性', [['力量', '8', '基础 8'], ['敏捷', '14', '基础 13 + 种族 1'], ['体质', '12', '基础 12']].map(([k, v, s]) => `<div class="ove ove--sum"><div class="ov-itm"><b>${k}</b><small>${s}</small></div><span class="ove-v">${v}</span><span></span><span class="ove-open">${icon('caret-down', 14)}</span></div>`).join('')),
  ents('智力（已展开）', [ent({ name: '基础值（建卡填的）', val: '16', src: '建卡', n: o.nRow }), ent({ name: '种族加成', val: '+1', src: SRC.r }), ent({ name: '专长「博学」', val: '+1', src: '专长' }), ent({ name: '魔法书（物品）', val: '+2', src: '手动', kind: 'manual' })], '添加条目', { right: '最终 20 · 调整值 +5' }),
  grp('其余', ['感知', '魅力'].map((k, i) => `<div class="ove ove--sum"><div class="ov-itm"><b>${k}</b><small>基础 ${i ? 10 : 12}</small></div><span class="ove-v">${i ? 10 : 12}</span><span></span><span class="ove-open">${icon('caret-down', 14)}</span></div>`).join(''))].join(''), o)
export const cbDrawer = (o = {}) => ruleDrawer('AC · 先攻 · 专注', '三个数各自的来源条目；速度、感官在身份抽屉，法术 DC 在施法摘要抽屉。', [
  result('AC', '12', '= 10 + 敏捷 2'),
  ents('AC 的条目', [ent({ name: '基础（无护甲）', val: '10', src: '规则', n: o.nRow }), ent({ name: '敏捷调整', val: '+2', src: SRC.a })], '添加条目'),
  gone([{ name: '法师护甲（13 + 敏捷）', val: '13', src: '法术' }]),
  ents('先攻的条目', [ent({ name: '敏捷调整', val: '+2', src: SRC.a })], '添加条目'),
  ents('专注豁免的条目', [ent({ name: '体质豁免', val: '+1', src: SRC.a })], '添加条目')].join(''), o)

/* ---------- 技能 · 特质 ---------- */
const LV = ['无', '半熟练', '熟练', '专精']
const prow = ({ name, ab, lv, src, kind, gone: g, n }) => ent({ name: `${name}　<small class="sh-2">${ab}</small>`, val: LV[lv], src, kind, gone: g, n })
export const skDrawer = (o = {}) => ruleDrawer('技能熟练', '没写在下面的技能就是「无」。每条写明熟练来自哪里；删掉 = 这条熟练不算了；手动加一条可以设成半熟练 / 熟练 / 专精。', [
  result('熟练的技能', '5 项', '专精 1 · 熟练 4'),
  ents('熟练条目', [prow({ name: '奥秘', ab: '智力', lv: 2, src: SRC.c, n: o.nRow }), prow({ name: '历史', ab: '智力', lv: 2, src: SRC.c }), prow({ name: '洞悉', ab: '感知', lv: 2, src: SRC.b }), prow({ name: '调查', ab: '智力', lv: 2, src: SRC.b }), prow({ name: '察觉', ab: '感知', lv: 3, src: SRC.w, kind: 'manual' })], '添加熟练条目'),
  gone([{ name: '运动　<small class="sh-2">力量</small>', val: '熟练', src: SRC.b }])].join(''), o)
const chip = (t, src, o2 = {}) => `<span class="ovd-chip"${o2.man ? ' data-man="true"' : ''}${o2.del ? ' data-del="true"' : ''}>${t}<i>${src}</i>${o2.del ? `<button type="button" aria-label="重新分配">${icon('arrow-counter-clockwise', 13)}</button>` : `<button type="button" aria-label="删除">${icon('x', 13)}</button>`}</span>`
const chips = (a, addL) => `<div class="ovd-chips">${a.join('')}${btn(addL, { small: true, ic: 'plus' })}</div>`
export const trDrawer = (o = {}) => ruleDrawer('特质', '语言、感官、抗性、熟练：每个小条目写明来源。× 删掉；自动来的删掉后收进「已移除」，[重新分配] 放回；[＋] 手动添加一条（来源写「手动」）。', [
  grp('语言', chips([chip('通用语', '种族'), chip('精灵语', '种族'), chip('矮人语', '背景'), chip('龙语', '手动', { man: true })], '加语言')),
  grp('感官', chips([chip('黑暗视觉 60 尺', '种族')], '加感官')),
  grp('伤害抗性', chips([chip('火焰', '手动', { man: true })], '加抗性')),
  grp('武器熟练', chips([chip('匕首', '职业'), chip('飞镖', '职业'), chip('投石索', '职业'), chip('短棍', '职业')], '加熟练')),
  grp('已移除的自动条目', `<div class="ovd-chips">${chip('轻弩', '职业', { del: true })}</div>`)].join(''), o)

/* ---------- ① 身份：只放玩家自己写的；复杂的进下面各自的抽屉 ---------- */
const link = (k, v, s, n) => `<button class="ovl" type="button"><span class="ov-itm"><b>${P(n)}${k}</b><small>${s}</small></span><span class="ovl-v">${v}</span>${icon('caret-right', 16)}</button>`
export const idDrawer = (o = {}) => drawer('身份', '', [
  grp('直接填写', pad(`${ff('名字', '盖尔', { n: o.nRow, focus: true })}${ff('英文名', 'Gale')}${sel('阵营', '中立善良')}`)),
  grp('由规则结算（点进去看来源、增删条目）', [link('种族', '人类', '给：体型、速度、语言、感官、属性加成', o.nLink), link('背景', '学者', '给：技能、工具、语言、起始专长'), link('体型与生物类型', '中型 · 类人', '种族给的，也可手动加'), link('速度', '步行 30 尺', '种族 · 效果 · 装备'), link('感官', '黑暗视觉 60 尺', '种族 · 专长 · 效果')].join(''))].join(''), { ok: '保存', ...o })

/* 种族 / 背景 / 体型与类型 / 速度 / 感官：各一个来源条目抽屉 */
export const speciesDrawer = (o = {}) => ruleDrawer('种族', '种族给的东西一条一条列在这里，各自写明会落到哪里。可以删、可以手动补一条，删掉的随时重新分配。', [
  result('种族', '人类', '来源：建卡第 ② 步'), `<div class="ove-add" style="justify-content:flex-start">${btn('更换种族…', { small: true })}<small class="sh-2" style="margin-left:8px">打开选资料页；换了以后重新分配所有自动条目</small></div>`,
  ents('种族给的内容', [ent({ name: '体型', val: '中型', src: SRC.r, n: o.nRow }), ent({ name: '速度', val: '步行 30 尺', src: SRC.r }), ent({ name: '属性加成', val: '全属性 +1', src: SRC.r }), ent({ name: '语言', val: '通用语 · 精灵语', src: SRC.r }), ent({ name: '感官', val: '黑暗视觉 60 尺', src: SRC.r }), ent({ name: '额外熟练：1 项技能', val: '察觉', src: SRC.w, kind: 'manual' })], '添加条目'),
  gone([{ name: '种族特性「多才多艺」', val: '', src: SRC.r }])].join(''), o)
export const bgDrawer = (o = {}) => ruleDrawer('背景', '背景给的东西一条一条列在这里；和种族一样可删、可补、可重新分配。', [
  result('背景', '学者', '来源：建卡第 ③ 步'), `<div class="ove-add" style="justify-content:flex-start">${btn('更换背景…', { small: true })}</div>`,
  ents('背景给的内容', [ent({ name: '技能熟练', val: '洞悉 · 调查', src: SRC.b, n: o.nRow }), ent({ name: '工具熟练', val: '书法家工具', src: SRC.b }), ent({ name: '语言', val: '矮人语', src: SRC.b }), ent({ name: '起始专长', val: '博学', src: SRC.b })], '添加条目'),
  gone([{ name: '起始装备包', val: '', src: SRC.b }])].join(''), o)
export const bodyDrawer = (o = {}) => ruleDrawer('体型与生物类型', '体型、类型一般由种族给；变形、法术或主持人裁定时手动加一条，原来的随时重新分配。', [
  ents('体型', [ent({ name: '中型', src: SRC.r, n: o.nRow }), ent({ name: '大型（变巨术）', src: '效果·变巨术', kind: 'manual' })], '添加体型'),
  ents('生物类型', [ent({ name: '类人生物', src: SRC.r })], '添加类型')].join(''), o)
export const speedDrawer = (o = {}) => ruleDrawer('速度', '步行、攀爬、游泳、飞行、掘穴各一行；每个速度 = 下面各条里最大的基础 + 加值。', [
  result('步行', '40 尺', '= 种族 30 + 疾行术 10'),
  ents('步行', [ent({ name: '种族基础', val: '30 尺', src: SRC.r, n: o.nRow }), ent({ name: '疾行术', val: '+10 尺', src: '效果·疾行术' })], '添加条目'),
  ents('其他速度', [ent({ name: '飞行', val: '30 尺', src: SRC.w, kind: 'manual' })], '添加速度')].join(''), o)
export const sensesDrawer = (o = {}) => ruleDrawer('感官', '黑暗视觉、盲视、真实视觉等；每条写明距离与来源。', [
  ents('感官', [ent({ name: '黑暗视觉', val: '60 尺', src: SRC.r, n: o.nRow })], '添加感官'), gone([{ name: '微光视觉', val: '60 尺', src: SRC.r }])].join(''), o)

/* ---------- 属性页：豁免 · 工具 ---------- */
export const toolDrawer = (o = {}) => ruleDrawer('工具熟练', '这里是「会不会用这个工具」；工具物品本身在背包的「工具」分组。', [
  ents('熟练条目', [prow({ name: '书法家工具', ab: '智力', lv: 2, src: SRC.b, n: o.nRow }), prow({ name: '盗贼工具', ab: '敏捷', lv: 3, src: SRC.w, kind: 'manual' })], '添加工具熟练')].join(''), o)
export const saveDrawer = (o = {}) => ruleDrawer('豁免熟练', '职业给的两项豁免熟练；其余手动补。专注豁免的来源在页头 AC 抽屉。', [
  ents('熟练条目', [prow({ name: '智力豁免', ab: '', lv: 2, src: SRC.c, n: o.nRow }), prow({ name: '感知豁免', ab: '', lv: 2, src: SRC.c }), prow({ name: '体质豁免', ab: '', lv: 2, src: '专长·强韧', kind: 'manual' })], '添加豁免熟练'),
  ents('各项豁免的额外加值', [ent({ name: '全部豁免', val: '+1', src: '装备·保护戒指', kind: 'manual' })], '添加条目')].join(''), o)

/* ---------- 背包 · 法术 · 特性 ---------- */
export const encDrawer = (o = {}) => ruleDrawer('负重与调谐', '负重上限 = 力量 × 15（规则）；调谐上限默认 3。', [
  result('负重上限', '120 磅', '= 力量 8 × 15'),
  ents('负重上限的条目', [ent({ name: '力量 8 × 15', val: '120', src: SRC.a, n: o.nRow }), ent({ name: '携物背包', val: '+0', src: '规则' })], '添加条目'),
  ents('调谐上限的条目', [ent({ name: '基础', val: '3', src: '规则' })], '添加条目')].join(''), o)
export const slotDrawer = (o = {}) => ruleDrawer('法术位上限', '每一环的上限来自职业等级表；已用的格子在法术页点圆点。', [
  ents('1 环', [ent({ name: '法师 3 级', val: '4', src: SRC.c, n: o.nRow })], '添加条目'), ents('2 环', [ent({ name: '法师 3 级', val: '2', src: SRC.c }), ent({ name: '法杖「奥术回响」', val: '+1', src: '手动', kind: 'manual' })], '添加条目'), ents('3 环', [], '添加条目')].join(''), o)
export const spDrawer = (o = {}) => ruleDrawer('施法摘要', '施法属性、DC、攻击、可准备数各自的来源。', [
  ents('施法属性', [ent({ name: '智力', src: SRC.c, n: o.nRow })], ''),
  ents('法术豁免 DC（14）', [ent({ name: '基础', val: '8', src: '规则' }), ent({ name: '熟练加值', val: '+2', src: SRC.l }), ent({ name: '智力调整', val: '+4', src: SRC.a })], '添加条目'),
  ents('法术攻击加值（+6）', [ent({ name: '熟练加值', val: '+2', src: SRC.l }), ent({ name: '智力调整', val: '+4', src: SRC.a })], '添加条目'),
  ents('可准备数（7）', [ent({ name: '智力调整', val: '+4', src: SRC.a }), ent({ name: '法师等级', val: '+3', src: SRC.c })], '添加条目')].join(''), o)
export const usesDrawer = (o = {}) => ruleDrawer('次数与恢复：奥术恢复', '已用几次是状态，直接改；最大次数是结算出来的，看来源。', [
  grp('已用（直接改）', pad(`<div class="ovf"><small>已用 / 最大</small><span class="ovf-stepper">${btn('−', { small: true })}<b>0</b>${btn('＋', { small: true })}<i>/ 1</i></span></div>`)),
  ents('最大次数的条目', [ent({ name: '职业特性', val: '1', src: SRC.c, n: o.nRow })], '添加条目'), grp('恢复', pad(sel('什么时候恢复', '长休', { hint: '短休 / 长休 / 黎明 / 黄昏 / 每回合 由数据给' })))].join(''), o)
export const feaDrawer = (o = {}) => drawer('特征', '只有这两项，直接填写；其余写进「外貌」等文本。', grp('直接填写', pad(`${ff('性别', '男', { n: o.nRow })}${ff('信仰', '密斯特拉')}`))
  , o)

/* ---------- ③ 生命骰 · 力竭 · 死亡豁免：改数量 / 掷骰，不原地改 ---------- */
const stepper = (v, o = {}) => `<span class="ovf-stepper">${btn('−', { small: true })}<b>${v}</b>${btn('＋', { small: true })}${o.max != null ? `<i>/ ${o.max}</i>` : ''}</span>`
export const hdDrawer = (o = {}) => drawer('生命骰', '', [
  result('剩余生命骰', '3 / 3', '短休时可以花生命骰恢复生命；长休恢复一半（向下取整，至少 1）'),
  grp('生命骰（一种面数一行）', `<div class="ovr-row"><div class="ov-itm"><b>${P(o.nRow)}d6　法师</b><small>总数 3 = 职业等级（在 [等级管理] 里变）</small></div>${stepper(3, { max: 3 })}</div>`),
  grp('掷一颗', `<div class="ovr-roll"><div class="ov-itm"><b>d6 + 体质 +1</b><small>掷完扣 1 颗，把结果加到当前生命（不会超过最大生命）</small></div>${btn('掷 d6', { primary: true, ic: 'dice-five', n: o.nRoll })}</div><div class="ovr-res"><b>掷出 4 + 1 = 5</b><span>生命 12 → 17 / 18　·　剩 2 / 3</span><span class="ovr-res__a">${btn('撤销这次', { small: true })}${btn('确认恢复', { small: true, primary: true })}</span></div>`),
  grp('不掷，直接记录', pad(`<div class="ovf-two">${ff('花掉几颗', '1')}${ff('恢复多少生命', '5')}</div>`))].join(''), { ok: '完成', ...o })
const LEVELS = [['0', '没有力竭'], ['1', 'd20 检定 −2；速度 −5 尺'], ['2', 'd20 检定 −4；速度 −10 尺'], ['3', 'd20 检定 −6；速度 −15 尺'], ['4', 'd20 检定 −8；速度 −20 尺'], ['5', 'd20 检定 −10；速度 −25 尺'], ['6', '死亡']]
export const exhDrawer = (o = {}) => drawer('力竭', '力竭等级 0–6；等级越高，惩罚越重，6 级死亡。长休减 1 级（需要食水）。', [
  result('当前力竭', '2 级', 'd20 检定 −4；速度 −10 尺'),
  grp('改等级', `<div class="ovr-row"><div class="ov-itm"><b>${P(o.nRow)}力竭等级</b><small>点下面一行直接设成那一级，或用 − ＋</small></div>${stepper(2, { max: 6 })}</div>` + LEVELS.map(([n, t]) => `<div class="ove ove--lv" data-cur="${n === '2'}"><span class="ove-lv">${n}</span><div class="ov-itm"><b>${t}</b></div><span>${n === '2' ? '当前' : ''}</span></div>`).join('')),
  `<p class="ovd-sub">各级惩罚用的是 2024 规则；2014 规则的力竭表不同，用哪套取决于库，待核对。</p>`].join(''), { ok: '完成', ...o })
const pips = (name, k, on, kind) => `<div class="ovr-pips"><b>${name}</b><span>${[1, 2, 3].map((i) => `<button type="button" class="ovr-pip" data-kind="${kind}" aria-pressed="${i <= on}" aria-label="${name} ${i}">${i}</button>`).join('')}</span><small>${k}</small></div>`
export const deathDrawer = (o = {}) => drawer('死亡豁免', '', [
  result('状态', '濒死', '生命 0 / 18　·　倒地、失能；每回合开始掷一次'),
  grp('次数', pips('成功', '3 次稳定', 1, 'ok') + pips('失败', '3 次死亡', 0, 'bad')),
  grp('掷一次', `<div class="ovr-roll"><div class="ov-itm"><b>d20（豁免加值 +0）</b><small>10 以上成功；天然 1 算 2 次失败；天然 20 恢复 1 点生命、立刻醒来</small></div>${btn('掷死亡豁免', { primary: true, ic: 'dice-five', n: o.nRoll })}</div><div class="ovr-res"><b>d20 = 14 · 成功</b><span>成功 0 → 1</span><span class="ovr-res__a">${btn('撤销这次', { small: true })}</span></div>`),
  grp('其他', `<div class="ovr-quick">${btn('受到伤害：失败 +1', { small: true })}${btn('被重击：失败 +2', { small: true })}${btn('稳定伤势（不再掷）', { small: true })}${btn('重置次数', { small: true })}</div>`)].join(''), { ok: '完成', ...o })

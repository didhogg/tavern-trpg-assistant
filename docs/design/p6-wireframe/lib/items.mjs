// 背包里的物品：按物品类型给不同的「状态标签 + 专用按钮」，以及各类型点开后的弹窗 / 抽屉（驾驶员 2026-11-15）。
// 类型与字段取自 dnd5e 6.1 的物品数据（module/data/item/*.mjs：weapon / equipment / consumable / tool / loot / container + 通用的
// 数量·重量·价格·稀有度·鉴定·调谐·次数）与 Tidy5e 的行按钮（EquipButton / AttuneButton / 次数列 / 菜单）。具体选项清单由库的数据给，下面是示意，待核对。
import { btn, icon, P, mdl, mh, more, step, roll, bar, tr, c } from './parts.mjs'
import { drawer, grp, ff, ent, ents, result, ruleDrawer } from './override.mjs'

/** 状态标签（小字药丸）：tone = on 已装备 · warn 要留意 · gold 魔法 / 稀有度 */
export const tg = (t, tone) => `<span class="sh-tg"${tone ? ` data-tone="${tone}"` : ''}>${t}</span>`
const itx = (ch, name, tags) => `<span class="sh-it"><i>${ch}</i><div><b>${name}</b><span class="sh-tgs">${tags.join('')}</span></div></span>`
/** 行上的专用按钮 */
export const act = (t, o = {}) => `<button class="sh-act${o.on ? ' on' : ''}" type="button">${o.ic ? icon(o.ic, 13) : ''}${t}</button>`
const usesB = (t) => `<button class="sh-usesb" type="button" title="点一下改次数">${t}${icon('pencil-simple', 12)}</button>`
/** 一行：物品 · 次数 / 加值 · 数量 · 重量 · 专用按钮 · ⋯ */
export const brow = ({ ch, name, tags = [], stat = '', qty, wt, action = '', mp, attrs = '' }) => tr([itx(ch, name, tags), `<span>${stat}</span>`, `<span>${qty == null ? '—' : step(qty)}</span>`, c(wt), `<span>${action}</span>`, mp ?? more()], attrs)

/* ---------- 各类型的行（主界面用；全部是占位示例，真实内容来自库） ---------- */
export const ROWS = {
  weapon: (mp) => [
    brow({ ch: '匕', name: '匕首', tags: [tg('已装备', 'on'), tg('简易近战'), tg('灵巧'), tg('投掷 20/60'), tg('熟练')], stat: roll('+4'), qty: 1, wt: '1 磅', action: act('卸下', { on: true }), mp }),
    brow({ ch: '弓', name: '短弓', tags: [tg('简易远程'), tg('弹药'), tg('双手'), tg('射程 80/320')], stat: roll('+4'), qty: 1, wt: '2 磅', action: act('装备') }),
    brow({ ch: '箭', name: '箭', tags: [tg('弹药'), tg('已选为短弓弹药', 'on')], stat: '', qty: 18, wt: '0.9 磅', action: act('选为弹药') }),
  ],
  armor: () => [
    brow({ ch: '袍', name: '学徒长袍', tags: [tg('衣物'), tg('AC 11 + 敏捷'), tg('已穿', 'on')], stat: 'AC 11', qty: 1, wt: '4 磅', action: act('脱下', { on: true }) }),
    brow({ ch: '甲', name: '链甲衫', tags: [tg('中甲'), tg('AC 13 + 敏捷（最多 2）'), tg('隐匿劣势', 'warn'), tg('需要力量 13', 'warn')], stat: 'AC 13', qty: 1, wt: '20 磅', action: act('穿上') }),
    brow({ ch: '戒', name: '守护戒指', tags: [tg('魔法 · 罕见', 'gold'), tg('需调谐', 'warn'), tg('已调谐', 'on')], stat: '', qty: 1, wt: '—', action: act('已调谐', { on: true, ic: 'check' }) }),
  ],
  charge: () => [
    brow({ ch: '杖', name: '奥术法杖', tags: [tg('魔法 · 稀有', 'gold'), tg('需调谐', 'warn'), tg('黎明恢复 1d6+1')], stat: usesB('5/7'), qty: 1, wt: '4 磅', action: act('使用…') }),
    brow({ ch: '？', name: '未鉴定的戒指', tags: [tg('未鉴定', 'warn')], stat: '', qty: 1, wt: '—', action: act('鉴定') }),
  ],
  consumable: () => [
    brow({ ch: '药', name: '治疗药水', tags: [tg('药水'), tg('普通')], stat: '', qty: 2, wt: '1 磅', action: act('使用…') }),
    brow({ ch: '卷', name: '火球术卷轴', tags: [tg('卷轴'), tg('3 环 · 法师'), tg('DC 14')], stat: '', qty: 1, wt: '—', action: act('施放…') }),
    brow({ ch: '毒', name: '毒药瓶', tags: [tg('毒药'), tg('用于涂在武器上')], stat: usesB('1/1'), qty: 1, wt: '—', action: act('使用…') }),
  ],
  tool: () => [
    brow({ ch: '书', name: '书法家工具', tags: [tg('工具'), tg('智力'), tg('熟练')], stat: roll('+4'), qty: 1, wt: '5 磅', action: act('检定', { ic: 'dice-five' }) }),
    brow({ ch: '盗', name: '盗贼工具', tags: [tg('工具'), tg('敏捷'), tg('不熟练', 'warn')], stat: roll('+2'), qty: 1, wt: '1 磅', action: act('检定', { ic: 'dice-five' }) }),
  ],
  box: () => [
    brow({ ch: '▾', name: '背包', tags: [tg('容器'), tg('已装 11 / 30 磅')], stat: '', qty: null, wt: '5 磅', action: act('折叠'), attrs: ' data-open="true"' }),
    brow({ ch: '口', name: '口粮', tags: [tg('杂物')], stat: '', qty: 5, wt: '10 磅', action: '', attrs: ' data-sub="true"' }),
    brow({ ch: '火', name: '火把', tags: [tg('杂物')], stat: '', qty: 10, wt: '10 磅', action: '', attrs: ' data-sub="true"' }),
    brow({ ch: '金', name: '金币 (gp)', tags: [tg('钱币'), tg('钱币就是物品，没有钱币栏')], stat: '', qty: 48, wt: '0.96 磅', action: '', attrs: ' data-sub="true"' }),
  ],
}

/* ---------- 类型对照表：每种物品 行上的标签 · 专用按钮 · 点开后 · 数据字段 ---------- */
const KINDS = [
  ['武器', '已装备 · 武器类型 · 灵巧 / 轻型 / 双手 / 投掷 · 射程 · 熟练 / 不熟练 · 魔法加值', '[装备 / 卸下]　命中加值（点 = 掷）', '编辑武器：伤害骰 · 双手伤害 · 魔法加值 · 射程 · 武器属性 · 精通 · 弹药类型', 'weapon.type · damage.base / versatile · magicalBonus · range · properties · mastery · ammunition · proficient'],
  ['护甲 / 盾 / 衣物', '护甲类型 · AC 公式 · 隐匿劣势 · 力量需求（不够标红）· 已穿', '[穿上 / 脱下]　AC 值', '编辑装备：AC · 魔法加值 · 敏捷加值上限 · 力量需求 · 属性', 'equipment.type · armor.value / dex / magicalBonus · strength · properties'],
  ['魔法物品（需调谐）', '魔法 · 稀有度 · 需调谐 · 已调谐', '[调谐 / 已调谐 ✓]（满了先提示「调谐已满 3/3」）', '调谐上限在背包脚注 / 负重抽屉', 'attunement · attuned · rarity'],
  ['充能物品（法杖 / 魔杖）', '魔法 · 稀有度 · 恢复方式（黎明 / 长休…）· 恢复量', '次数「5/7 ✎」点一下改；[使用…]', '编辑次数抽屉：已用 · 最大次数（条目）· 恢复方式 · 恢复量 · [重置为满]', 'uses.spent / max / recovery'],
  ['消耗品：药水 / 毒药 / 食物', '子类型 · 稀有度 · 次数（有就显示）', '[使用…] → 使用弹窗：目标 · 效果 · 掷骰 · 数量 −1', '使用弹窗（见本组第二屏）；用完自动销毁可勾选', 'consumable.type · uses · damage · autoDestroy'],
  ['消耗品：卷轴', '卷轴 · 法术环数 · 法术职业 · DC', '[施放…] → 施放弹窗（同法术页，选环 · 用掉卷轴）', '施放弹窗；法术不在职业列表时提示检定', 'consumable.type=scroll · 内嵌法术'],
  ['消耗品：弹药', '弹药 · 已选为 X 弹药', '数量 [− n ＋]；[选为弹药]', '数量够不够射击由内核判断', 'consumable.type=ammo'],
  ['工具', '工具类型 · 属性 · 熟练 / 不熟练', '[检定]（点 = 掷，熟练加值内核算）', '编辑工具：默认属性 · 额外加值 · 聊天备注', 'tool.ability · bonus · proficient'],
  ['容器', '容器 · 已装 x / 容量', '[展开 / 折叠]；里面的物品缩进', '容器抽屉：容量（数量 / 体积 / 重量）· 内容器是否算重量', 'container.capacity · contents'],
  ['杂物 / 钱币 / 宝物', '杂物类型（艺术品 · 宝石 · 材料…）', '只有数量 [− n ＋]', '金币等钱币就是库里的物品，叠数量；没有钱币栏', 'loot.type · quantity'],
  ['所有物品都有', '未鉴定（红字）· 已装备 · 稀有度', '行 ⋯：编辑 · 移进容器 · 置顶 · 复制 · 删除', '数量 · 重量 · 价格 · 稀有度 · 是否鉴定 · 描述', 'quantity · weight · price · rarity · identified'],
]
export const kindsTable = () => `<div class="wf-notes"><table class="wf-cols5"><thead><tr><th>物品类型</th><th>行上的状态标签（小字药丸）</th><th>行上的专用按钮</th><th>点开之后</th><th>数据字段（dnd5e 6.1，待核对）</th></tr></thead><tbody>${KINDS.map(([a, b, c2, d, e]) => `<tr><td><b>${a}</b></td><td>${b}</td><td>${c2}</td><td>${d}</td><td>${e}</td></tr>`).join('')}</tbody></table></div>`

/* ---------- 各类型点开后 ---------- */
const sel = (label, val) => `<label class="ovf"><small>${label}</small><span class="sh-in ovf-in ovf-sel">${val}${icon('caret-down', 14)}</span></label>`
const pad = (inner) => `<div class="ovf-pad">${inner}</div>`
const two = (a, b) => `<div class="ovf-two">${a}${b}</div>`
const props = (a, on) => `<div class="ovd-chips">${a.map((t) => `<span class="ovd-chip" ${on.includes(t) ? 'data-man="true"' : ''}>${t}</span>`).join('')}</div>`

/** 使用消耗品弹窗（治疗药水） */
export const useDialog = (o = {}) => mdl('confirm', mh('使用：治疗药水', { n: o.nTitle }), `<div class="ovd"><p class="ovd-sub">喝下后恢复 2d4+2 点生命。使用后数量 2 → 1。</p>
${grp('', pad(`${sel('对谁使用', '自己（盖尔）')}<div class="ovr-roll" style="padding:0"><div class="ov-itm"><b>2d4 + 2</b><small>恢复生命；不会超过最大生命</small></div>${btn('掷骰', { primary: true, ic: 'dice-five', n: o.nRoll })}</div>`))}
<div class="ovr-res" style="margin:0 0 10px"><b>2d4 + 2 = 7</b><span>生命 12 → 18 / 18（只恢复 6）　·　药水 2 → 1</span></div>
<div class="ovd-foot"><label class="ovf-ck"><i class="sh-ckb"></i>用完自动删除这个物品</label><span style="flex:1"></span>${btn('取消')}${btn('确认使用', { primary: true, n: o.nOk })}</div></div>`)
/** 充能物品：编辑次数抽屉 */
export const chargeDrawer = (o = {}) => ruleDrawer('次数与恢复：奥术法杖', '已用几次是状态，直接改；最大次数是物品给的，看来源条目。', [
  grp('已用（直接改）', pad(`<div class="ovr-row" style="padding:0"><div class="ov-itm"><b>${P(o.nRow)}已用 / 最大</b><small>用一次点 ＋；[重置为满] = 全部恢复</small></div><span class="ovf-stepper">${btn('−', { small: true })}<b>2</b>${btn('＋', { small: true })}<i>/ 7</i></span></div><div>${btn('重置为满', { small: true })}</div>`)),
  ents('最大次数的条目', [ent({ name: '奥术法杖', val: '7', src: '物品' })], '添加条目'),
  grp('恢复', pad(`${sel('什么时候恢复', '黎明')}${ff('恢复多少', '1d6 + 1', { hint: '留空 = 全部恢复' })}`))].join(''), { ok: '保存', ...o })
/** 武器：编辑字段（改的是这个人物手上的这一件，不改库里的原条目） */
export const weaponForm = (o = {}) => drawer('编辑武器：匕首', '改的是你手上的这一件；库里的原条目不变，想恢复点底部 [恢复为库里的样子]。', [
  grp('基本', pad(`${ff('名字', '匕首', { n: o.nRow })}${two(sel('武器类型', '简易近战'), sel('基础武器', '匕首'))}`)),
  grp('伤害', pad(`${two(ff('伤害骰', '1d4'), sel('伤害类型', '穿刺'))}${two(ff('双手伤害（可选）', '—'), ff('魔法加值', '+0'))}`)),
  grp('射程', pad(`${two(ff('普通射程', '20'), ff('远射程', '60'))}${two(ff('触及', '5'), sel('单位', '尺'))}`)),
  grp('武器属性', props(['灵巧', '轻型', '投掷', '双手', '重型', '触及', '装填', '弹药', '多用'], ['灵巧', '轻型', '投掷'])),
  grp('其他', pad(`${two(sel('精通', '割伤'), sel('弹药类型', '—'))}${two(sel('熟练', '按职业自动判断'), sel('稀有度', '普通'))}`))].join('') + `<div class="ove-add" style="padding-left:0">${btn('恢复为库里的样子', { small: true })}</div>`, { ok: '保存', ...o })
/** 护甲 / 装备：编辑字段 */
export const armorForm = (o = {}) => drawer('编辑装备：链甲衫', '', [
  grp('基本', pad(`${ff('名字', '链甲衫', { n: o.nRow })}${two(sel('装备类型', '中甲'), sel('稀有度', '普通'))}`)),
  grp('防御', pad(`${two(ff('AC 基础值', '13'), ff('魔法加值', '+0'))}${two(sel('敏捷加值', '最多 +2'), ff('力量需求', '13'))}`)),
  grp('属性', props(['隐匿劣势'], ['隐匿劣势'])),
  grp('调谐', pad(sel('是否需要调谐', '不需要')))].join(''), { ok: '保存', ...o })
/** 工具 / 容器简表 */
export const containerForm = (o = {}) => drawer('编辑容器：背包', '', [
  grp('基本', pad(ff('名字', '背包', { n: o.nRow }))),
  grp('容量', pad(`${two(ff('最多几件', '—'), ff('最大重量（磅）', '30'))}${ff('体积（立方尺）', '—')}`)),
  grp('其他', pad(sel('里面的东西算负重吗', '算（普通背包）')))].join(''), { ok: '保存', ...o })
export const toolForm = (o = {}) => drawer('编辑工具：书法家工具', '', [
  grp('基本', pad(`${ff('名字', '书法家工具', { n: o.nRow })}${sel('工具类型', '工匠工具')}`)),
  grp('检定', pad(`${sel('默认属性', '智力')}${ff('额外加值', '+0')}${ff('聊天备注', '')}`))].join(''), { ok: '保存', ...o })

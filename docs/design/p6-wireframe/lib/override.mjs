// 手改小抽屉：一个自动小模块一个手动编辑小抽屉（驾驶员 2026-11-15）。流程见 docs/handoff/P6-5_自动值与手动覆盖_流程图.md。
// 外面一律是普通文字、只读；点模块角上的 ✎ 才进抽屉。每一项：自动值 + 来源写在项目名下面，右边 [自动 | 手动] 二选一（选「自动」= 回到自动值），选「手动」才能填。
// 抽屉宽 480、高度跟内容走（窄屏底部铺满）；[应用] 立刻生效，一条改动记录，可撤销。示例数值是占位，真实值由内核给。
import { btn, icon, P, mdl, mh } from './parts.mjs'

const seg2 = (manual) => `<span class="ovd-seg"><button type="button" aria-pressed="${!manual}">自动</button><button type="button" aria-pressed="${!!manual}">手动</button></span>`
const field = ({ name, src, hint, manual, val, n }) => `<div class="ovd-row"${manual ? ' data-man="true"' : ''}><div class="ov-itm"><b>${P(n)}${name}</b><small>自动 ${src}${hint ? `　<button class="trpg-link" type="button">${hint} ${icon('caret-down', 12)}</button>` : ''}</small></div>${seg2(manual)}<span class="ov-in" data-on="${!!manual}">${manual ? val : '—'}</span></div>`
const drawer = (title, sub, body, o = {}) => mdl('confirm', mh(title, { n: o.nTitle }), `<div class="ovd">${sub ? `<p class="ovd-sub">${sub}</p>` : ''}${body}<div class="ovd-foot">${btn('全部用自动')}<span style="flex:1"></span>${btn('取消')}${btn('应用', { primary: true, n: o.nApply })}</div></div>`)
const group = (t, body) => `<div class="ovd-grp"><h4>${t}</h4>${body}</div>`

export const hpDrawer = (o = {}) => drawer('手改：生命', '当前生命、临时生命不在这里改——在角色表上点数字就地改。', group('', [
  field({ name: '最大生命', src: '18', hint: '来源', manual: true, val: 20, n: o.nRow }), field({ name: '生命骰数量', src: '3' }), field({ name: '生命骰面数', src: 'd6' })].join('')), o)
export const lvDrawer = (o = {}) => drawer('手改：等级', '升级 / 降级请用 [等级管理]（会先预览）；这里是直接把显示的等级盖成别的数。', group('', [
  field({ name: '等级', src: '3（法师 3）', n: o.nRow }), field({ name: '熟练加值', src: '+2' }), field({ name: '升级所需经验', src: '2,700' })].join('')), o)
export const abDrawer = (o = {}) => drawer('手改：属性', '每个属性的最终值、调整值、豁免都可以覆盖；点「展开」看初始值与加成。', [
  field({ name: '力量', src: '8', hint: '展开', n: o.nRow }), field({ name: '敏捷', src: '14', hint: '展开' }), field({ name: '体质', src: '12', hint: '展开' }),
  group('智力（已展开）', [field({ name: '初始值（设定）', src: '16' }), field({ name: '加成', src: '+2（人类 +1、专长 +1）' }), field({ name: '最终值', src: '18', manual: true, val: 20 }), field({ name: '调整值', src: '+4', hint: '随最终值' }), field({ name: '豁免加值', src: '+6（调整 +4、熟练 +2）' })].join('')),
  field({ name: '感知', src: '12', hint: '展开' }), field({ name: '魅力', src: '10', hint: '展开' })].join(''), o)
export const cbDrawer = (o = {}) => drawer('手改：战斗块', 'AC、先攻、专注豁免；速度、感官在特质卡，法术 DC 在施法摘要卡，各自的 ✎ 里改。', [
  field({ name: 'AC', src: '12', hint: '来源', manual: true, val: 14, n: o.nRow }), field({ name: '先攻', src: '+2' }), field({ name: '专注豁免', src: '+4' })].join(''), o)

/* 技能：外面只显示熟练点与加值，不改；进抽屉才改。每行 = 技能 · 来源 · 熟练级别 [无 | 半 | 熟 | 专] */
const LV = ['无', '半', '熟', '专']
const srow = ({ name, ab, auto, now, src, man, n }) => `<div class="ovd-row ovd-row--sk"${man ? ' data-man="true"' : ''}><div class="ov-itm"><b>${P(n)}${name}</b><small>${ab} · ${man ? `手动改为 ${LV[now]}（自动 ${LV[auto]}）` : `自动 ${LV[auto]} · ${src}`}</small></div><span class="ovd-seg ovd-seg--4">${LV.map((t, i) => `<button type="button" aria-pressed="${i === now}">${t}</button>`).join('')}</span><button class="sh-pen" type="button" aria-label="回到自动" ${man ? '' : 'disabled'} title="回到自动">${icon('arrow-counter-clockwise', 14)}</button></div>`
export const skDrawer = (o = {}) => drawer('手改：技能', '熟练级别：无 / 半熟练 / 熟练 / 专精。每行来源写在名字下面；改过的行带金线，点 ↺ 回到自动。', [
  srow({ name: '奥秘', ab: '智力', auto: 2, now: 2, src: '职业·法师', n: o.nRow }), srow({ name: '历史', ab: '智力', auto: 2, now: 2, src: '职业·法师' }), srow({ name: '洞悉', ab: '感知', auto: 2, now: 2, src: '背景·学者' }),
  srow({ name: '察觉', ab: '感知', auto: 0, now: 3, src: '', man: true }), srow({ name: '运动', ab: '力量', auto: 2, now: 0, src: '', man: true }),
  srow({ name: '杂技', ab: '敏捷', auto: 0, now: 0, src: '—' }), srow({ name: '驯兽', ab: '感知', auto: 0, now: 0, src: '—' }), srow({ name: '欺瞒', ab: '魅力', auto: 0, now: 0, src: '—' }), srow({ name: '医药', ab: '感知', auto: 0, now: 0, src: '—' }),
  `<p class="ovd-sub" style="margin:8px 0 0">其余 9 项同样的行，窗口里滚动看。</p>`].join(''), o)

/* 特质：语言 / 感官 / 抗性 / 免疫 / 熟练——药丸，可删、可加，带来源，自动来的删掉后收进「已删除」可恢复 */
const chip = (t, src, o2 = {}) => `<span class="ovd-chip"${o2.man ? ' data-man="true"' : ''}${o2.del ? ' data-del="true"' : ''}>${t}<i>${src}</i>${o2.del ? `<button type="button" aria-label="恢复">${icon('arrow-counter-clockwise', 13)}</button>` : `<button type="button" aria-label="删除">${icon('x', 13)}</button>`}</span>`
const chips = (a, add) => `<div class="ovd-chips">${a.join('')}${btn(add, { small: true, ic: 'plus' })}</div>`
export const trDrawer = (o = {}) => drawer('手改：特质', '来自建卡与成长的项会自动出现并写明来源；可以删掉、再加，删掉的自动项收在「已删除」里随时恢复。', [
  group('语言', chips([chip('通用语', '种族'), chip('精灵语', '种族'), chip('矮人语', '背景'), chip('龙语', '手动添加', { man: true })], '加语言')),
  group('感官', chips([chip('黑暗视觉 60 尺', '种族')], '加感官')),
  group('伤害抗性', chips([chip('火焰', '手动添加', { man: true })], '加抗性')),
  group('武器熟练', chips([chip('匕首', '职业'), chip('飞镖', '职业'), chip('投石索', '职业'), chip('短棍', '职业')], '加熟练')),
  group('已删除（自动来的，可恢复）', `<div class="ovd-chips">${chip('轻弩', '职业', { del: true })}</div>`)].join(''), o)

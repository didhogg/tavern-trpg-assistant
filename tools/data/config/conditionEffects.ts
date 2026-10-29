import type { Effect } from '../../../src/rules/dnd5e2014/data/effects'
import type { Activity } from '../../../src/rules/dnd5e2014/data/activities'

const note = (text: string): Effect => ({ kind: 'note', text })
const disadvantage = (on: 'attack' | 'check' | 'save' | 'initiative', scope?: string): Effect => ({ kind: 'disadvantage', on, ...(scope ? { scope } : {}) })
const advantage = (on: 'attack' | 'check' | 'save' | 'initiative', scope?: string): Effect => ({ kind: 'advantage', on, ...(scope ? { scope } : {}) })
const speedZero: Effect = { kind: 'speed', mode: 'walk', amount: 0 }

export const CONDITION_EFFECTS: Record<string, Effect[]> = {
  'condition.blinded.phb': [disadvantage('attack'), note('攻击目盲者的攻击检定具有优势；依赖视觉的属性检定自动失败')],
  'condition.charmed.phb': [note('不能攻击魅惑者，也不能以有害能力或魔法效果 targeting 魅惑者；魅惑者对社交检定具有优势')],
  'condition.deafened.phb': [note('不能听见声音，依赖听觉的属性检定自动失败')],
  'condition.exhaustion.phb': [note('力竭效果按等级见 levels')],
  'condition.frightened.phb': [disadvantage('check'), disadvantage('attack'), note('只要恐惧源在视线内，就不能自愿靠近')],
  'condition.grappled.phb': [speedZero, note('速度变为 0，不能从擒抱者身边移动')],
  'condition.incapacitated.phb': [note('不能执行动作或反应')],
  'condition.invisible.phb': [advantage('initiative'), advantage('attack'), note('看不见隐形者的攻击具有劣势；隐形者的攻击具有优势')],
  'condition.paralyzed.phb': [speedZero, note('不能行动或说话；力量与敏捷豁免自动失败；近战攻击自动重击')],
  'condition.petrified.phb': [speedZero, { kind: 'resistance', damage: ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'] }, note('与石化形态融为一体，不能行动或说话')],
  'condition.poisoned.phb': [disadvantage('attack'), disadvantage('check')],
  'condition.prone.phb': [note('只能爬行移动；近战攻击对倒地者具有优势，远程攻击具有劣势')],
  'condition.restrained.phb': [speedZero, disadvantage('save', 'dex'), note('攻击束缚者的攻击具有优势，束缚者的攻击具有劣势')],
  'condition.stunned.phb': [speedZero, note('不能行动；力量与敏捷豁免自动失败；攻击者具有优势')],
  'condition.unconscious.phb': [speedZero, note('倒地、不能行动；力量与敏捷豁免自动失败；近战攻击自动重击')],
  'status.concentration.phb': [note('专注被中断时，正在维持的法术结束')],
  'status.surprised.phb': [note('突袭回合不能移动或执行动作，反应也要到回合结束后才可用')],
}

export const EXHAUSTION_LEVELS: Array<{ level: number; effects: Effect[] }> = [
  { level: 1, effects: [disadvantage('check')] },
  { level: 2, effects: [{ kind: 'speed', mode: 'walk', multiplier: 0.5 }] },
  { level: 3, effects: [disadvantage('attack'), disadvantage('save')] },
  { level: 4, effects: [note('生命值上限减半')] },
  { level: 5, effects: [speedZero] },
  { level: 6, effects: [note('死亡')] },
]

function base(id: string, name: string, activation: Activity['activation'], text: string): Activity {
  return { id, name, kind: 'utility', activation, text }
}

export const ACTION_RULES: Record<string, { activation: Activity['activation']; activities: Activity[]; effects: Effect[] }> = {
  'rule.dash.phb': { activation: { type: 'action' }, activities: [base('rule.dash.phb.action', '疾走', { type: 'action' }, '获得等同于自己速度的额外移动力')], effects: [note('本回合额外移动力等于速度')] },
  'rule.disengage.phb': { activation: { type: 'action' }, activities: [base('rule.disengage.phb.action', '撤离', { type: 'action' }, '本回合移动不会引发借机攻击')], effects: [note('本回合移动不引发借机攻击')] },
  'rule.dodge.phb': { activation: { type: 'action' }, activities: [base('rule.dodge.phb.action', '回避', { type: 'action' }, '直到下回合开始，攻击你的检定具有劣势')], effects: [note('攻击你的检定具有劣势；敏捷豁免具有优势')] },
  'rule.help.phb': { activation: { type: 'action' }, activities: [base('rule.help.phb.action', '协助', { type: 'action' }, '协助一个生物进行属性检定或攻击')], effects: [note('被协助者下一次属性检定或攻击具有优势')] },
  'rule.hide.phb': { activation: { type: 'action' }, activities: [base('rule.hide.phb.action', '躲藏', { type: 'action' }, '进行一次敏捷（隐匿）检定')], effects: [note('躲藏检定成功后，攻击者看不见你')] },
  'rule.ready.phb': { activation: { type: 'action' }, activities: [base('rule.ready.phb.action', '预备', { type: 'action' }, '准备一个动作并用反应触发')], effects: [note('准备一个动作，触发时用反应执行')] },
  'rule.search.phb': { activation: { type: 'action' }, activities: [base('rule.search.phb.action', '搜索', { type: 'action' }, '进行一次感知检定寻找隐藏事物')], effects: [note('进行一次感知检定')] },
  'rule.grapple.phb': { activation: { type: 'action' }, activities: [base('rule.grapple.phb.action', '擒抱', { type: 'action' }, '进行一次力量（运动）检定对抗目标的力量（运动）或敏捷（体操）')], effects: [note('目标获得受擒状态')] },
  'rule.shove.phb': { activation: { type: 'action' }, activities: [base('rule.shove.phb.action', '推撞', { type: 'action' }, '进行一次力量（运动）检定对抗目标的力量（运动）或敏捷（体操）')], effects: [note('目标被推离 5 尺或倒地')] },
}

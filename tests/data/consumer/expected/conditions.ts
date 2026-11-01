/** PHB 附录 A 的状态（逐条读过原文）：每个状态的机制要点。
 * s = 应该是结构化效果（kind:on/mode）；n = 至少要在说明文字里出现（正则）；against = 这一条是“针对该生物的攻击”之类，现有效果类型表达不了，只能先靠说明文字。 */
export interface CondItem { k: string; s?: string; n?: RegExp; against?: boolean }
export const COND_EXPECT: Record<string, CondItem[]> = {
  blinded: [{ k: '自己攻击劣势', s: 'disadvantage:attack' }, { k: '针对它的攻击优势', n: /攻击目盲者.*优势/, against: true }, { k: '视觉检定自动失败', n: /视觉.*自动失败/ }],
  charmed: [{ k: '不能攻击魅惑者', n: /不能攻击魅惑者/ }, { k: '魅惑者的社交检定优势', n: /社交/ }],
  deafened: [{ k: '听觉检定自动失败', n: /听觉.*自动失败/ }],
  frightened: [{ k: '属性检定劣势', s: 'disadvantage:check' }, { k: '攻击劣势', s: 'disadvantage:attack' }, { k: '不能自愿靠近恐惧源', n: /不能自愿靠近/ }],
  grappled: [{ k: '速度为 0', s: 'speed:walk' }],
  incapacitated: [{ k: '不能执行动作和反应', n: /不能执行动作或反应/ }],
  invisible: [{ k: '自己攻击优势', s: 'advantage:attack' }, { k: '针对它的攻击劣势', n: /攻击.*劣势/, against: true }],
  paralyzed: [{ k: '速度为 0', s: 'speed:walk' }, { k: '不能行动', n: /不能行动/ }, { k: '力量敏捷豁免自动失败', n: /力量与敏捷豁免自动失败/ }, { k: '针对它的攻击优势', n: /攻击(者|检定).*优势/, against: true }, { k: '5 尺内近战攻击自动重击', n: /自动重击/, against: true }],
  petrified: [{ k: '速度为 0', s: 'speed:walk' }, { k: '全部伤害抗性', s: 'resistance:' }, { k: '毒素与疾病免疫', s: 'immunity:' }, { k: '力量敏捷豁免自动失败', n: /力量与敏捷豁免自动失败/ }, { k: '针对它的攻击优势', n: /攻击.*优势/, against: true }, { k: '不能行动', n: /不能行动/ }],
  poisoned: [{ k: '攻击劣势', s: 'disadvantage:attack' }, { k: '属性检定劣势', s: 'disadvantage:check' }],
  prone: [{ k: '只能爬行', n: /爬行/ }, { k: '自己攻击劣势', s: 'disadvantage:attack' }, { k: '近战攻击对它优势', n: /近战.*优势/, against: true }, { k: '远程攻击对它劣势', n: /远程.*劣势/, against: true }],
  restrained: [{ k: '速度为 0', s: 'speed:walk' }, { k: '自己攻击劣势', s: 'disadvantage:attack' }, { k: '针对它的攻击优势', n: /攻击束缚者.*优势/, against: true }, { k: '敏捷豁免劣势', s: 'disadvantage:save' }],
  stunned: [{ k: '速度为 0', s: 'speed:walk' }, { k: '不能行动', n: /不能行动/ }, { k: '力量敏捷豁免自动失败', n: /力量与敏捷豁免自动失败/ }, { k: '针对它的攻击优势', n: /攻击者具有优势/, against: true }],
  unconscious: [{ k: '速度为 0', s: 'speed:walk' }, { k: '倒地', n: /倒地/ }, { k: '不能行动', n: /不能行动/ }, { k: '力量敏捷豁免自动失败', n: /自动失败/ }, { k: '针对它的攻击优势', n: /优势/, against: true }, { k: '5 尺内近战攻击自动重击', n: /自动重击/, against: true }],
}
/** 力竭 6 级（PHB 附录 A）：1 属性检定劣势；2 速度减半；3 攻击与豁免劣势；4 生命值上限减半；5 速度为 0；6 死亡 */
export const EXHAUSTION = [{ level: 1, s: ['disadvantage:check'] }, { level: 2, s: ['speed:walk'] }, { level: 3, s: ['disadvantage:attack', 'disadvantage:save'] }, { level: 4, n: /生命值上限减半/ }, { level: 5, s: ['speed:walk'] }, { level: 6, n: /死亡/ }]

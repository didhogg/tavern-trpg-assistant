// 写法登记表（上位设计 §3.4、蓝图 §3.6）：效果改动的“目标路径写法 → 处理方式”。加一种写法 = 加一行。
// dnd5e / Foundry 原代码能执行的写法不需要登记，判断方式与官方 ActiveEffect.applyChange 相同。
// 这里只登记“原代码不执行”的写法，以及没有字段时的统一结论；结果里标“未支持”，附原文、原因与影响。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */

export interface WritingRule { id: string; test: (key: string) => boolean; reason: string }

export const UNSUPPORTED_WRITINGS: WritingRule[] = [
  { id: 'midi-qol', test: k => k.startsWith('flags.midi-qol.'), reason: '只有 midi-qol 认识的写法（驾驶员定不用 midi-qol）' },
  { id: 'dae', test: k => k.startsWith('flags.dae.'), reason: '只有 DAE 认识的写法（不用 DAE）' },
  { id: 'macro', test: k => k.startsWith('macro.'), reason: '宏写法：不执行任何 JS（蓝图决定 6）' },
]

export interface UnsupportedItem { actor: string; effect: string; key: string; value: unknown; rule: string; reason: string; affects: string }

/** 判断一条效果改动：原代码能执行返回 null，否则给出未支持说明。 */
export function classifyChange(actor: any, change: any): Omit<UnsupportedItem, 'actor' | 'effect'> | null {
  const key = String(change.key ?? '')
  const rule = UNSUPPORTED_WRITINGS.find(r => r.test(key))
  if (rule) return { key, value: change.value, rule: rule.id, reason: rule.reason, affects: key }
  // 与官方 ActiveEffect.applyChange 同一判断：有登记的改动类型处理函数、有字段，或目标属性已存在（官方走无字段应用），都由原代码执行。
  const g = globalThis as any
  // 官方 Actor 准备时把 token. 开头的改动另存，之后应用到该角色的令牌上（不是角色数据）。
  if (key.startsWith('token.')) return null
  if (typeof g.CONFIG?.ActiveEffect?.documentClass?.CHANGE_TYPES?.[change.type]?.handler === 'function') return null
  const field = key.startsWith('system.') ? actor.system?.getFieldForProperty?.(key.slice(7)) : actor.getFieldForProperty(key)
  if (field || g.foundry.utils.getProperty(actor, key) !== undefined) return null
  return { key, value: change.value, rule: 'no-target', reason: '目标路径既没有数据字段，人物身上也没有这个属性；原代码写进去也没有规则读取', affects: key }
}

export function unsupportedFor(actor: any): UnsupportedItem[] {
  const rows: UnsupportedItem[] = []
  for (const effect of actor.allApplicableEffects()) for (const change of effect.system?.changes ?? effect.changes ?? []) {
    const item = classifyChange(actor, change)
    if (item) rows.push({ actor: actor.id, effect: effect.uuid, ...item })
  }
  return rows
}

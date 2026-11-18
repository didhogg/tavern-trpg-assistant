// 写法登记表（上位设计 §3.4、蓝图 §3.6）：效果改动的“目标路径写法 → 处理方式”。加一种写法 = 加一行。
// 未支持检测按蓝图 §3.6 的原定做法：不另猜官方会怎么处理，而是在官方真正应用效果时旁观记录——
//   · 只有生效中的效果会被官方应用（停用 / 被压住的效果走不到这里，自然不算）；
//   · dnd5e 自己接管的写法（items.hidden、flags.dnd5e.*、公式字段、动作字段）不走 Foundry 的无字段路径，自然不算；
//   · 走到 Foundry 无字段路径（_applyChangeUnguided）且人物身上没有这个属性的，记一笔“没有规则读取”；
//   · 只有 midi-qol / DAE / 宏才认识的写法（下表）在官方应用时记一笔。
// 旁观者只记录，不改变任何计算结果；记录随人物每次准备数据（initial 阶段）重来。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */

export interface WritingRule { id: string; test: (key: string) => boolean; reason: string }

export const UNSUPPORTED_WRITINGS: WritingRule[] = [
  { id: 'midi-qol', test: k => k.startsWith('flags.midi-qol.'), reason: '只有 midi-qol 认识的写法（驾驶员定不用 midi-qol）' },
  { id: 'dae', test: k => k.startsWith('flags.dae.'), reason: '只有 DAE 认识的写法（不用 DAE）' },
  { id: 'macro', test: k => k.startsWith('macro.'), reason: '宏写法：不执行任何 JS（蓝图决定 6）' },
]

const NO_TARGET = { rule: 'no-target', reason: '目标路径既没有数据字段，人物身上也没有这个属性；原代码写进去也没有规则读取' }

export interface UnsupportedItem { actor: string; effect: string; key: string; value: unknown; rule: string; reason: string; affects: string }

const g = globalThis as any
/** 每个人物最近一次准备数据时官方实际应用到的未支持改动（键 = 效果 + 路径，跨阶段去重）。 */
const seen = new WeakMap<object, Map<string, UnsupportedItem>>()
let installed = false

const isActor = (doc: any): boolean => doc?.documentName === 'Actor'
function note(actor: any, change: any, rule: { rule: string; reason: string }): void {
  const effect = String(change.effect?.uuid ?? '')
  const key = String(change.key ?? '')
  let rows = seen.get(actor)
  if (!rows) seen.set(actor, rows = new Map())
  if (!rows.has(`${effect}|${key}`)) rows.set(`${effect}|${key}`, { actor: actor.id, effect, key, value: change.value, rule: rule.rule, reason: rule.reason, affects: key })
}

/** 装上旁观者（幂等）：dnd5e 加载后、人物准备数据前调用；官方对答案页面在命令首次读取时补装。 */
export function installUnsupportedRecorder(): void {
  if (installed) return
  const Effect = g.CONFIG?.ActiveEffect?.documentClass
  const Actor = g.CONFIG?.Actor?.documentClass
  if (!Effect || !Actor) return
  installed = true
  const prepare = Actor.prototype.applyActiveEffects
  Actor.prototype.applyActiveEffects = function (this: any, phase: string, ...rest: unknown[]) {
    if (phase === 'initial' || phase === undefined) seen.set(this, new Map())
    return prepare.call(this, phase, ...rest)
  }
  const apply = Effect.applyChange
  Effect.applyChange = function (this: any, model: any, change: any, ...rest: unknown[]) {
    const rule = isActor(model) && change?.effect ? UNSUPPORTED_WRITINGS.find(r => r.test(String(change.key ?? ''))) : undefined
    if (rule) note(model, change, { rule: rule.id, reason: rule.reason })
    return apply.call(this, model, change, ...rest)
  }
  const unguided = Effect._applyChangeUnguided
  Effect._applyChangeUnguided = function (this: any, target: any, change: any, ...rest: unknown[]) {
    if (isActor(target) && change?.effect && g.foundry.utils.getProperty(target, change.key) === undefined
      && !UNSUPPORTED_WRITINGS.some(r => r.test(String(change.key ?? '')))) note(target, change, NO_TARGET)
    return unguided.call(this, target, change, ...rest)
  }
}

/** 这个人物最近一次准备数据时，官方实际应用到的未支持改动。装上旁观者之前准备过的人物，重新准备一次再读。 */
export function unsupportedFor(actor: any): UnsupportedItem[] {
  installUnsupportedRecorder()
  if (!seen.has(actor)) actor.reset()
  return [...(seen.get(actor)?.values() ?? [])]
}

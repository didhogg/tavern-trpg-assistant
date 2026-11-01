import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PlannedEntry } from './plan'

/**
 * Foundry dnd5e 系统本体的开源数据（SRD 内容，2014 规则）作为第二个结构化来源（G2.5 P7）。
 * 取数：tools/data/fetch/foundry_dnd5e_open.py（固定提交，转成 JSON 放 reference/foundry-dnd5e-open/）。
 * 原则：5etools 已有的值优先；这里只补缺（物品的使用次数／恢复、消耗品与带次数物品的使用动作）。
 * 数据条目的许可：CC-BY-4.0（SRD 5.1 署名），写进 credit.structured。
 */
type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && /^-?\d+(?:\.\d+)?$/.test(v.trim()) ? Number(v) : undefined)
const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '')

let index: Map<string, Rec> | undefined
function items(): Map<string, Rec> {
  if (index) return index
  index = new Map()
  const file = join(process.cwd(), 'reference', 'foundry-dnd5e-open', 'items.json')
  if (!existsSync(file)) { console.warn('未找到 reference/foundry-dnd5e-open/items.json：跳过 Foundry 开源数据（先运行 tools/data/fetch/foundry_dnd5e_open.py）'); return index }
  for (const e of (JSON.parse(readFileSync(file, 'utf8')) as { entries: Rec[] }).entries) if (!index.has(norm(str(e.name)))) index.set(norm(str(e.name)), e)
  return index
}

const PERIOD: Record<string, string> = { lr: 'long', sr: 'short', day: 'dawn', dawn: 'dawn', dusk: 'dusk' }
const ABILITY = new Set(['str', 'dex', 'con', 'int', 'wis', 'cha'])
const ACTIVATION: Record<string, string> = { action: 'action', bonus: 'bonus', reaction: 'reaction', minute: 'minute', hour: 'hour' }
const DAMAGE = new Set(['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'])

function dice(part: Rec): { dice: string; type: string } | undefined {
  const custom = isObj(part.custom) && part.custom.enabled === true ? str(part.custom.formula) : ''
  const n = num(part.number), d = num(part.denomination), bonus = str(part.bonus).replace(/\s+/g, '')
  const formula = custom || (n && d ? `${n}d${d}${bonus && /^[+-]?\d+$/.test(bonus) ? (bonus.startsWith('-') || bonus.startsWith('+') ? bonus : `+${bonus}`) : ''}` : '')
  const type = (Array.isArray(part.types) ? part.types : []).map(String).find((t) => DAMAGE.has(t))
  return /^\d{0,2}d\d{1,3}(?:[+-]\d+)?$/i.test(formula) && type ? { dice: formula, type } : undefined
}
const parts = (damage: unknown): Array<{ dice: string; type: string }> => (isObj(damage) && Array.isArray(damage.parts) ? damage.parts.filter(isObj).map(dice).filter((x): x is { dice: string; type: string } => !!x) : [])

/** dnd5e 的活动 → 我们的活动（只收 heal／save／damage／attack／utility，能确定的才写；cast、summon 等不收）。 */
function activity(a: Rec, id: string, itemName: string): Rec | undefined {
  const act = isObj(a.activation) ? a.activation : {}
  const base: Rec = {
    id, name: str(a.name) || itemName,
    activation: { type: ACTIVATION[str(act.type)] ?? 'special', ...(num(act.value) && num(act.value)! > 0 ? { cost: num(act.value) } : {}) },
  }
  const targets = (isObj(a.consumption) && Array.isArray(a.consumption.targets) ? a.consumption.targets : []).filter(isObj).filter((t) => t.type === 'itemUses')
  if (targets.length) base.consumption = { targets: targets.map((t) => ({ type: 'itemUses', value: num(t.value) ?? (str(t.value) || '1') })) }
  const type = str(a.type)
  if (type === 'heal') {
    const hh = isObj(a.healing) ? a.healing : {}
    const custom = isObj(hh.custom) && hh.custom.enabled === true ? str(hh.custom.formula) : ''
    const formula = custom || (num(hh.number) && num(hh.denomination) ? `${num(hh.number)}d${num(hh.denomination)}${str(hh.bonus).trim() && /^[+-]?\d+$/.test(str(hh.bonus).trim()) ? (/^[+-]/.test(str(hh.bonus).trim()) ? str(hh.bonus).trim() : `+${str(hh.bonus).trim()}`) : ''}` : '')
    return formula ? { ...base, kind: 'heal', formula } : undefined
  }
  if (type === 'save') {
    const save = isObj(a.save) ? a.save : {}
    const ability = (Array.isArray(save.ability) ? save.ability : []).map(String).find((x) => ABILITY.has(x))
    const dcn = isObj(save.dc) ? num(save.dc.formula) : undefined
    if (!ability || !dcn) return undefined
    const onSave = isObj(a.damage) && a.damage.onSave === 'half' ? 'half' : 'none'
    return { ...base, kind: 'save', ability, dc: dcn, onSave, damage: parts(a.damage) }
  }
  if (type === 'damage') { const p = parts(a.damage); return p.length ? { ...base, kind: 'damage', parts: p } : undefined }
  if (type === 'utility') return { ...base, kind: 'utility', text: str(a.name) || itemName }
  return undefined
}

/** 给物品补缺：使用次数（charges）与使用动作（consumable／带次数物品且还没有动作时）。返回是否用到了 Foundry 数据。 */
export function addOpenItemData(plan: PlannedEntry, data: Rec): boolean {
  const category = str(data.category)
  if (category === 'family' || category === 'template') return false
  const f = items().get(norm(str(plan.nameEn)))
  if (!f || !isObj(f.system)) return false
  let used = false
  const uses = isObj(f.system.uses) ? f.system.uses : {}
  const max = num(uses.max)
  const recovery = Array.isArray(uses.recovery) ? uses.recovery.filter(isObj) : []
  if (data.charges === undefined && max && max > 0 && recovery.length) {
    const r = recovery[0]
    const formula = str(r.type) === 'formula' ? str(r.formula).replace(/\s+/g, ' ').trim() : ''
    if (PERIOD[str(r.period)]) { data.charges = { max, recharge: PERIOD[str(r.period)], ...(formula && /^\d*d\d+(?: ?\+ ?\d+)?$/.test(formula) ? { rechargeAmount: formula } : {}) }; used = true }
  }
  // 有充能但 5etools 没写恢复时机（星辰法袍）：Foundry 开源数据有就补
  if (isObj(data.charges) && data.charges.recharge === undefined && recovery.length && PERIOD[str(recovery[0].period)]) { data.charges = { ...data.charges, recharge: PERIOD[str(recovery[0].period)] }; used = true }
  const hasActs = Array.isArray(data.activities) && data.activities.length > 0
  if (!hasActs && (data.consumable === true || data.charges !== undefined)) {
    const acts = Object.values(isObj(f.system.activities) ? f.system.activities : {}).filter(isObj)
    const out = acts.map((a, i) => activity(a, `${plan.id}.${i}`, str(plan.name))).filter((x): x is Rec => !!x)
    if (out.length) { data.activities = out; used = true }
  }
  if (used) data.extra = { ...(isObj(data.extra) ? data.extra : {}), foundryOpen: true } // 记下用过 Foundry 开源数据（署名随包的 attribution）
  return used
}

/**
 * 消耗品最后一道兜底：没有任何具体动作（来源里没有结构化的治疗／伤害／豁免）的，给一个"使用"动作，消耗物品 1 份；
 * 具体效果仍在物品说明里。这样物品栏的"使用"按钮一定有东西可结算，而不是空的。法术卷轴写明法术环阶。
 */
export function addGenericUse(plan: PlannedEntry, data: Rec): void {
  if (data.consumable !== true) return
  if ((Array.isArray(data.activities) && data.activities.length) || (Array.isArray(data.effects) && data.effects.length)) return
  const level = num(plan.raw.spellScrollLevel)
  const text = level !== undefined ? (level === 0 ? '施展卷轴上的戏法；用后卷轴消失' : `施展卷轴上的${level}环法术；用后卷轴消失`) : `使用${str(plan.name)}（效果见物品说明）`
  data.activities = [{ id: `${plan.id}.use`, name: `使用：${str(plan.name)}`, kind: 'utility', text, activation: { type: 'action' }, consumption: { targets: [{ type: 'itemUses', value: 1 }] } }]
}

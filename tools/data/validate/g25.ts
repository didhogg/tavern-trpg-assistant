import type { ConvertedPack } from '../convert'
import { LANG_OTHER_PENDING } from '../fix/pending/langOther'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

function mentions(value: unknown, needle: string): boolean {
  if (typeof value === 'string') return value === needle
  if (Array.isArray(value)) return value.some((x) => mentions(x, needle))
  if (isObj(value)) return Object.values(value).some((x) => mentions(x, needle))
  return false
}

/**
 * G2.5 新字段的构建期不变量（规格 01 第 G 节）：
 * 引用必须存在且类型对；consumes 不与自己的 uses 并存、不与行动级 consumption 重复；
 * `lang:other` 一律报错（pending 清单例外）。依赖方向由 checkReferences 对 structuralRefs 统一检查。返回问题列表。
 */
export function validateG25(packs: ConvertedPack[], pending: readonly string[] = LANG_OTHER_PENDING): string[] {
  const all = new Map(packs.flatMap((p) => p.entries).map((e) => [e.id, e]))
  const problems: string[] = []
  const need = (at: string, id: string, type: string, withUses = false): void => {
    const target = all.get(id)
    if (!target) problems.push(`${at}：「${id}」不存在`)
    else if (target.type !== type) problems.push(`${at}：「${id}」是 ${target.type}，必须是 ${type}`)
    else if (withUses && !isObj((target.data as Rec).uses)) problems.push(`${at}：「${id}」没有 uses，不能当次数池`)
  }
  const langOther = new Set<string>()
  for (const e of all.values()) {
    const d = e.data as Rec
    if (mentions(d, 'lang:other')) langOther.add(e.id)
    if ((d.consumes !== undefined || d.restores !== undefined || d.tracker !== undefined) && e.type !== 'feature') problems.push(`${e.id}：consumes/restores/tracker 只能写在特性上`)
    if (isObj(d.consumes)) {
      const pool = String(d.consumes.pool)
      need(`${e.id} 的 consumes.pool`, pool, 'feature', true)
      if (d.uses !== undefined) problems.push(`${e.id}：有 consumes 就不能再有自己的 uses`)
      for (const a of arr(d.activities)) for (const t of arr(isObj(a) && isObj(a.consumption) ? a.consumption.targets : [])) if (isObj(t) && t.type === 'uses' && t.target === pool) problems.push(`${e.id}：同一个池「${pool}」被 consumes 与行动级 consumption 重复表达`)
    }
    arr(d.restores).forEach((r, i) => {
      if (!isObj(r)) return
      if (r.pool === undefined) { if (!isObj(d.uses)) problems.push(`${e.id} 的 restores[${i}]：没写 pool 时本特性必须有 uses`) }
      else if (r.pool !== 'spellSlots') need(`${e.id} 的 restores[${i}].pool`, String(r.pool), 'feature', true)
    })
    if (typeof d.characteristicsFrom === 'string') need(`${e.id} 的 characteristicsFrom`, d.characteristicsFrom, 'background')
    if (isObj(d.summon) && typeof d.summon.classId === 'string') need(`${e.id} 的 summon.classId`, d.summon.classId, 'class')
    if (isObj(d.abilityBonus) && d.abilityBonus.replace !== undefined && e.type !== 'subrace') problems.push(`${e.id}：abilityBonus.replace 只能出现在亚种上`)
    for (const key of ['startingEquipment', 'equipment']) for (const block of arr(d[key])) if (isObj(block)) for (const item of [...arr(block.fixed), ...arr(block.choice).flatMap(arr)]) if (isObj(item) && typeof item.id === 'string') need(`${e.id} 的 ${key} 物品「${String(item.item)}」`, item.id, 'item')
  }
  for (const id of langOther) if (!pending.includes(id)) problems.push(`${id}：带 lang:other（禁止；改成该种族自己的语言记号）`)
  for (const id of pending) if (!langOther.has(id)) problems.push(`${id}：已不再带 lang:other，请从 tools/data/fix/pending/langOther.ts 删掉这一行`)
  return problems
}

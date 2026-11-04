import type { MonsterData } from '../../../rules/dnd5e2014/data/entries/spell-monster'

/** 读数弹窗的写入（U5R §10.5）：手动调整进 `adjust`，覆盖进 `overrides`，其他移动方式进 `speed`。纯函数，返回新 block。 */
export type ReadoutKey = { kind: 'ac' | 'initiative' | 'proficiency' } | { kind: 'passive'; skill: 'perception' | 'insight' | 'investigation' } | { kind: 'speed'; mode: 'walk' | 'fly' | 'swim' | 'climb' | 'burrow' }
const clone = (b: MonsterData): MonsterData => JSON.parse(JSON.stringify(b)) as MonsterData
const prune = (b: MonsterData): MonsterData => {
  for (const k of ['adjust', 'overrides'] as const) {
    const o = b[k] as Record<string, unknown> | undefined
    if (!o) continue
    for (const [key, v] of Object.entries(o)) if (v && typeof v === 'object' && Object.keys(v).length === 0) delete o[key]
    if (Object.keys(o).length === 0) delete b[k]
  }
  return b
}
type Bag = Record<string, unknown> & { passive?: Record<string, number>; speed?: Record<string, number> }

function bagOf(b: MonsterData, which: 'adjust' | 'overrides'): Bag { return ((b[which] ??= {}) as unknown) as Bag }
function write(b: MonsterData, which: 'adjust' | 'overrides', key: ReadoutKey, value: number | null): MonsterData {
  const next = clone(b)
  const bag = bagOf(next, which)
  if (key.kind === 'passive') { bag.passive = { ...(bag.passive ?? {}) }; if (value === null || (which === 'adjust' && value === 0)) delete bag.passive[key.skill]; else bag.passive[key.skill] = value }
  else if (key.kind === 'speed') { bag.speed = { ...(bag.speed ?? {}) }; if (value === null || (which === 'adjust' && value === 0)) delete bag.speed[key.mode]; else bag.speed[key.mode] = value }
  else if (value === null || (which === 'adjust' && value === 0)) delete bag[key.kind]
  else bag[key.kind] = value
  return prune(next)
}
export const setAdjust = (b: MonsterData, key: ReadoutKey, value: number): MonsterData => write(b, 'adjust', key, Number.isFinite(value) ? Math.trunc(value) : 0)
export const setOverride = (b: MonsterData, key: ReadoutKey, value: number | null): MonsterData => write(b, 'overrides', key, value === null || !Number.isFinite(value) ? null : Math.trunc(value))
export function adjustOf(b: MonsterData, key: ReadoutKey): number {
  const bag = (b.adjust ?? {}) as Bag
  return (key.kind === 'passive' ? bag.passive?.[key.skill] : key.kind === 'speed' ? bag.speed?.[key.mode] : (bag[key.kind] as number | undefined)) ?? 0
}
export function overrideOf(b: MonsterData, key: ReadoutKey): number | null {
  const bag = (b.overrides ?? {}) as Bag
  return (key.kind === 'passive' ? bag.passive?.[key.skill] : key.kind === 'speed' ? bag.speed?.[key.mode] : (bag[key.kind] as number | undefined)) ?? null
}
/** [自动计算]：清掉这一项的手动调整与覆盖（其他项不动）。 */
export const resetKey = (b: MonsterData, key: ReadoutKey): MonsterData => setOverride(setAdjust(b, key, 0), key, null)
export const canReset = (b: MonsterData, key: ReadoutKey): boolean => adjustOf(b, key) !== 0 || overrideOf(b, key) !== null

export const EXTRA_SPEEDS = [{ mode: 'fly', label: '飞行' }, { mode: 'climb', label: '攀爬' }, { mode: 'swim', label: '游泳' }, { mode: 'burrow', label: '掘地' }] as const
export function addSpeedMode(b: MonsterData, mode: 'fly' | 'swim' | 'climb' | 'burrow', base = 30): MonsterData {
  if (typeof b.speed?.[mode] === 'number') return b
  const next = clone(b); next.speed = { ...next.speed, [mode]: base }; return next
}
export function setSpeedBase(b: MonsterData, mode: string, base: number): MonsterData {
  if (!Number.isFinite(base) || base < 0) return b
  const next = clone(b); next.speed = { ...next.speed, [mode]: Math.trunc(base) }; return next
}
export function removeSpeedMode(b: MonsterData, mode: string): MonsterData {
  const next = clone(b); const speed = { ...next.speed }; delete speed[mode]; delete speed.canHover; next.speed = speed
  if (next.overrides?.speed) delete (next.overrides.speed as Record<string, number>)[mode]
  if (next.adjust?.speed) delete (next.adjust.speed as Record<string, number>)[mode]
  return prune(next)
}
export function setHover(b: MonsterData, on: boolean): MonsterData {
  const next = clone(b); next.speed = { ...next.speed }; if (on) next.speed.canHover = true; else delete next.speed.canHover; return next
}

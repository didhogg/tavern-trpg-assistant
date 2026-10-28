import type { Credit } from '../../../src/rules/dnd5e2014/data/common'
import type { PlannedEntry } from './plan'

export function creditFor(entry: PlannedEntry, bookMachine: boolean): Credit {
  const missing: string[] = []
  if (entry.missingPage) missing.push('page')
  if (entry.missingName) {
    missing.push('name')
    return { by: 'dnd-data', license: 'MIT', machine: false, missing, srd: entry.srd }
  }
  const translator = typeof entry.raw.translator === 'string' ? entry.raw.translator : ''
  if (translator === '不全书') return { by: '不全书', license: 'GPL-3.0', machine: false, missing, srd: entry.srd }
  if (bookMachine) return { by: '共库机翻', license: 'CC-BY-NC-SA-4.0', machine: true, missing, srd: entry.srd }
  return { by: '共库', license: 'CC-BY-NC-SA-4.0', machine: false, missing, srd: entry.srd }
}

export function keywordsOf(entry: PlannedEntry): string[] {
  const raw = entry.raw
  const list = new Set<string>([entry.name, entry.nameEn])
  if (Array.isArray(raw.alias)) for (const alias of raw.alias) if (typeof alias === 'string') list.add(alias)
  if (typeof raw.shortName === 'string') list.add(raw.shortName)
  return [...list].filter(Boolean)
}

export function pageOf(entry: PlannedEntry): { book: string; page: number } {
  return { book: entry.source, page: entry.page }
}

export function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function obj(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined
}

export function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value === undefined ? [] : [value]
}

const ABILITY_CN: Record<string, string> = {
  力量: 'str',
  敏捷: 'dex',
  体质: 'con',
  智力: 'int',
  感知: 'wis',
  魅力: 'cha',
}

export function abilityFromText(text: string): 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | undefined {
  for (const [cn, code] of Object.entries(ABILITY_CN)) if (text.includes(cn)) return code as never
  return undefined
}

export function parseFraction(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return 0
  const fraction = /^(\d+)\/(\d+)$/.exec(value)
  if (fraction) return Number(fraction[1]) / Number(fraction[2])
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export const DAMAGE_TYPE: Record<string, string> = { A: '强酸', B: '钝击', C: '冷冻', F: '火焰', L: '闪电', N: '死灵', O: '力场', P: '穿刺', R: '光耀', S: '挥砍', T: '雷鸣', Y: '心灵' }

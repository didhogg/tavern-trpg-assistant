import type { ConvertedPack } from '../convert'
import type { PlannedEntry } from '../convert/plan'
import { collectArt } from './focus'

type Raw = Record<string, unknown>
export interface FocusEntry { x: number; y: number; size: number; method: 'token-match' | 'smartcrop'; score?: number; error?: string }

export function artById(data: { monsters: Raw[]; fluff?: Array<{ kind: string; raw: Raw }> }, planned: PlannedEntry[], focus: Record<string, FocusEntry>): Map<string, Raw> {
  const byKey = new Map<string, ReturnType<typeof collectArt>[number]>()
  for (const a of collectArt(data)) byKey.set(`${a.source}|${a.nameEn}`, a)
  const out = new Map<string, Raw>()
  for (const e of planned) {
    if (e.type !== 'monster') continue
    const a = byKey.get(`${e.source}|${e.nameEn}`)
    if (!a) continue
    const art: Raw = {}
    const f = a.portrait ? focus[a.portrait] : undefined
    if (a.portrait && f && !f.error) art.portrait = { url: a.portrait, focus: { x: f.x, y: f.y, size: Math.min(1, f.size) }, method: f.method, ...(f.score !== undefined ? { score: f.score } : {}) }
    if (a.token) art.token = { url: a.token }
    if (art.portrait || art.token) out.set(e.id, art)
  }
  return out
}

export function applyArt(packs: ConvertedPack[], art: Map<string, Raw>): number {
  let n = 0
  for (const pack of packs) for (const entry of pack.entries) {
    const value = art.get(entry.id)
    if (value) { entry.data = { ...entry.data, art: value }; n++ }
  }
  return n
}

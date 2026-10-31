import { join } from 'node:path'
import { BOOK_SOURCES } from '../config/books'
import { listFiles, readJson } from '../lib/io'
import { DATA_5ETOOLS, resolveCopies, type Raw, type UnsupportedMod } from './load'

export type FluffKind = 'race' | 'background' | 'class' | 'subclass' | 'monster' | 'spell' | 'feat' | 'item' | 'condition' | 'feature' | 'vehicle'

export interface FluffRecord {
  kind: FluffKind
  raw: Raw
}

async function loadFile(rel: string, key: string, kind: FluffKind, sink: UnsupportedMod[]): Promise<FluffRecord[]> {
  const raw = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, rel))
  const list = raw[key]
  if (!Array.isArray(list)) throw new Error(`${rel} 缺少数组 ${key}`)
  return resolveCopies(list.filter((x): x is Raw => !!x && typeof x === 'object' && !Array.isArray(x)), sink)
    .filter((x) => BOOK_SOURCES.has(String(x.source)))
    .map((x) => ({ kind, raw: x }))
}

async function loadGlob(relDir: string, prefix: string, key: string, kind: FluffKind, sink: UnsupportedMod[]): Promise<FluffRecord[]> {
  const out: FluffRecord[] = []
  for (const path of await listFiles(join(DATA_5ETOOLS, relDir), (n) => n.startsWith(prefix) && n.endsWith('.json'))) {
    const raw = await readJson<Record<string, unknown>>(path)
    const list = raw[key]
    if (!Array.isArray(list)) continue
    for (const item of resolveCopies(list.filter((x): x is Raw => !!x && typeof x === 'object' && !Array.isArray(x)), sink)) {
      if (BOOK_SOURCES.has(String(item.source))) out.push({ kind, raw: item })
    }
  }
  return out
}

/** 读取核心十本书的 fluff；只保留 entries 交给 R8，图片不进入输出。 */
export async function loadFluff(sink: UnsupportedMod[]): Promise<FluffRecord[]> {
  const out: FluffRecord[] = []
  out.push(...await loadFile('fluff-races.json', 'raceFluff', 'race', sink))
  out.push(...await loadFile('fluff-backgrounds.json', 'backgroundFluff', 'background', sink))
  out.push(...await loadGlob('class', 'fluff-class-', 'classFluff', 'class', sink))
  out.push(...await loadGlob('class', 'fluff-class-', 'subclassFluff', 'subclass', sink))
  out.push(...await loadGlob('bestiary', 'fluff-bestiary-', 'monsterFluff', 'monster', sink))
  out.push(...await loadGlob('spells', 'fluff-spells-', 'spellFluff', 'spell', sink))
  out.push(...await loadFile('fluff-feats.json', 'featFluff', 'feat', sink))
  out.push(...await loadFile('fluff-items.json', 'itemFluff', 'item', sink))
  out.push(...await loadFile('fluff-conditionsdiseases.json', 'conditionFluff', 'condition', sink))
  out.push(...await loadFile('fluff-optionalfeatures.json', 'optionalfeatureFluff', 'feature', sink))
  out.push(...await loadFile('fluff-vehicles.json', 'vehicleFluff', 'vehicle', sink))
  return out
}

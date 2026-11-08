// P3 收尾真机验证用的小工具：从【库】挑真实条目（带英文对照，喂 Plutonium 用）、逐项比两份数据。
// 只服务诊断按钮，不是人物功能（人物在 P6）。挑条目只按作者数据的字段判断，不写死条目名或条数。
import type { ScopedLibrary } from '../library/scoped'
import type { CampaignLibrary } from '../library/scopes'
import type { LibraryService } from '../library/service'

export interface ChainRow {
  ref: { set: string; prop: string; hash: string }
  label: string
  entry: unknown
}

async function take(service: LibraryService, scoped: ScopedLibrary, library: CampaignLibrary, prop: string, book: string,
  filter: (item: Record<string, unknown>) => boolean): Promise<ChainRow> {
  const set = `${library.codeSet}-official`
  const p = await service.parsed(set, prop)
  for (let i = 0; i < p.items.length; i++) {
    const item = p.items[i] as Record<string, unknown>
    const hash = p.hashes[i]
    if (!hash || p.sources[i] !== book || !filter(item)) continue
    const ref = { set, prop, hash }
    const d = await scoped.detail(library, ref)
    if (!d || 'hidden' in d || !d.english || d.english.status !== 'found') continue
    return { ref, label: String(item.name), entry: d.english.item }
  }
  throw new Error(`【库】里找不到带英文对照的 ${book} ${prop}（先装中英官方）`)
}

/** 英雄的种族 / 背景 / 职业 / 武器 / 戏法，加一只怪物。 */
export async function pickChain(service: LibraryService, scoped: ScopedLibrary, library: CampaignLibrary): Promise<{ build: ChainRow[]; equipment: ChainRow[]; monster: ChainRow }> {
  const t = (prop: string, book: string, f: (it: Record<string, unknown>) => boolean) => take(service, scoped, library, prop, book, f)
  const build = [
    await t('race', 'PHB', (it) => !!it.size && !String(it.name).includes('(')),
    await t('background', 'PHB', (it) => !!it.skillProficiencies || !!it.entries),
    await t('class', 'PHB', (it) => !!it.hd),
  ]
  const equipment = [
    await t('item', 'PHB', (it) => it.weaponCategory === 'martial'),
    await t('spell', 'PHB', (it) => it.level === 0),
  ]
  const monster = await t('monster', 'MM', (it) => !!it.name)
  return { build, equipment, monster }
}

/** 逐项比两份数据，交回不同的位置（最多 limit 条）。 */
export function differences(a: unknown, b: unknown, path = '', out: Array<{ path: string; before: unknown; after: unknown }> = [], limit = 20) {
  if (out.length >= limit || a === b) return out
  const kind = (v: unknown) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v)
  if (kind(a) !== kind(b)) { out.push({ path, before: a, after: b }); return out }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) { out.push({ path: `${path}.length`, before: a.length, after: b.length }); return out }
    a.forEach((v, i) => differences(v, b[i], `${path}[${i}]`, out, limit))
    return out
  }
  if (a && b && typeof a === 'object') {
    const x = a as Record<string, unknown>
    const y = b as Record<string, unknown>
    for (const key of new Set([...Object.keys(x), ...Object.keys(y)])) differences(x[key], y[key], path ? `${path}.${key}` : key, out, limit)
    return out
  }
  out.push({ path, before: a, after: b })
  return out
}

import { altsKey, packFluff, packOwnedItems, type AltIndex } from './alternatives'
import type { BrewPack } from './brew-packs'
import type { QueryRow } from './service-types'

const RECENT_PACKS = 4

/** 同一个库版本的分类查询共用一次作者解析。缓存仅在内存，发布或重置时清理。 */
export class PackEntries {
  private readonly entries = new Map<string, Promise<Record<string, QueryRow[]>>>()

  get(options: Parameters<typeof packOwnedItems>[0], pack: BrewPack): Promise<Record<string, QueryRow[]>> {
    const key = `${options.view.id}|${options.source.id}|${pack.docIdLocal}`
    const found = this.entries.get(key)
    if (found) {
      this.entries.delete(key)
      this.entries.set(key, found)
      return found
    }
    const pending = this.read(options, pack)
    this.entries.set(key, pending)
    pending.then(() => {
      if (this.entries.size <= RECENT_PACKS) return
      const oldest = this.entries.keys().next().value
      if (oldest) this.entries.delete(oldest)
    }, () => {
      if (this.entries.get(key) === pending) this.entries.delete(key)
    })
    return pending
  }

  private async read(options: Parameters<typeof packOwnedItems>[0], pack: BrewPack): Promise<Record<string, QueryRow[]>> {
    const [rows, record] = await Promise.all([
      packOwnedItems(options, pack.docIdLocal, pack.hashes),
      options.view.derivedGet(altsKey(options.source.id)),
    ])
    const alternatives = record?.value as AltIndex | undefined
    // 作者按来源把官方同编号的自制条目放进站点缓存。现有备选记录保存了包内的那个作者对象。
    for (const { target, source, alts } of Object.values(alternatives?.targets ?? {})) {
      const own = alts.find((alt) => alt.docIdLocal === pack.docIdLocal)
      if (!own) continue
      const items = (rows[target.prop] ??= [])
      const row = items.find((item) => item.hash === target.hash)
      if (!row) items.push({ hash: target.hash, source, item: own.item, excluded: false })
    }
    return rows
  }

  async detail(options: Parameters<typeof packOwnedItems>[0], pack: BrewPack, prop: string, hash: string) {
    const row = (await this.get(options, pack))[prop]?.find((r) => r.hash === hash)
    if (!row) return null
    const fluff = await packFluff(options, pack.docIdLocal, prop, row.item)
    return fluff ? { ...row, ...fluff, hash, engSiteHash: null, english: null } : null
  }

  retire(viewId: string): void {
    for (const key of this.entries.keys()) if (key.startsWith(`${viewId}|`)) this.entries.delete(key)
  }

  clear(): void {
    this.entries.clear()
  }
}

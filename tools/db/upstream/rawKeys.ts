import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { OUT_ROOT, RAW_DB } from '../lib/paths'
import { loadUpstream } from './loadUpstream'

/**
 * 给原样库里每条 JSON 原始记录算上游哈希（URL_TO_HASH_BUILDER[顶层键]）和来源、版本依据（SourceUtil）。
 * 用途：中英并排配对（5e-translator 的对齐规则：同文件、同数组、同下标）配上的两条原始记录，
 * 各自的哈希就是"中文取数层条目 ↔ 英文取数层条目"的对应关系。
 * 只算哈希，不改任何记录。没有哈希构造器的类别（如 _meta、itemType）输出 null。
 */
async function main(): Promise<void> {
  const g = await loadUpstream('cn')
  const db = new DatabaseSync(RAW_DB, { readOnly: true })
  const dir = join(OUT_ROOT, '_upstream')
  for (const lib of ['cn', 'bak'] as const) {
    const out: Array<[number, string | null, string | null, boolean | null, boolean, string | null]> = []
    let builders = 0
    let errors = 0
    for (const r of db.prepare("SELECT id, category, body FROM raw WHERE lib=? AND kind='json' ORDER BY id").iterate(lib) as Iterable<{ id: number; category: string; body: string }>) {
      const hb = g.UrlUtil.URL_TO_HASH_BUILDER[r.category]
      const rec = JSON.parse(r.body)
      // 来源 / 是否旧版来源 / 来源有无日期 / 自带 edition：全部用上游函数
      let s: string | null = null, c: boolean | null = null, d = false
      try {
        const src = rec && typeof rec === 'object' ? g.SourceUtil.getEntitySource(rec) : null
        if (typeof src === 'string' && src) { s = src; d = g.Parser.sourceJsonToDate(src) != null; c = g.SourceUtil.isClassicSource(src) }
      } catch { errors += 1 }
      const f = rec && typeof rec === 'object' && typeof rec.edition === 'string' ? rec.edition : null
      let h: string | null = null
      if (hb) { builders += 1; try { h = hb(rec) } catch { errors += 1 } }
      out.push([r.id, h, s, c, d, f])
    }
    writeFileSync(join(dir, `rawkeys_${lib}.json`), JSON.stringify(out))
    console.log(`${lib}: JSON 原始记录 ${out.length}，有上游哈希构造器 ${builders}，构造出错 ${errors}`)
  }
  db.close()
}
await main()

import { allEntries } from '../../tests/data/r9-pack-helpers'

/**
 * T1 看条目：打印已构建的包里某个条目的完整 JSON。
 *   npx tsx tools/g2/show.ts <条目id>                 整个条目
 *   npx tsx tools/g2/show.ts <条目id> --path /effects/2   只看 data 里的一段（路径从 /data 之下写）
 *   npx tsx tools/g2/show.ts --find <名字或id片段>     按名字/英文名/id 找条目（最多 40 个）
 * 读的是 build:data 产出的包（SRD 在扩展仓库 packs/，书籍包在数据仓库）；没构建过先 npm run build:data。
 */
function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const entries = allEntries() as Array<{ id: string; type: string; name: string; nameEn?: string; data: Record<string, unknown> }>
const find = arg('--find')
if (find !== undefined) {
  const needle = find.toLowerCase()
  const hits = entries.filter((e) => [e.id, e.name, e.nameEn ?? ''].some((x) => x.toLowerCase().includes(needle)))
  for (const e of hits.slice(0, 40)) console.log(`${e.id}\t${e.type}\t${e.name}${e.nameEn ? ` / ${e.nameEn}` : ''}`)
  console.log(`命中 ${hits.length} 个${hits.length > 40 ? '（只列前 40 个）' : ''}`)
  process.exit(0)
}
const id = process.argv[2]
if (!id || id.startsWith('--')) { console.error('用法：show.ts <条目id> [--path /effects/2]  |  show.ts --find <片段>'); process.exit(2) }
const entry = entries.find((e) => e.id === id)
if (!entry) { console.error(`没有条目 ${id}（用 --find 按名字找）`); process.exit(1) }
const path = arg('--path')
let value: unknown = path === undefined ? entry : entry.data
if (path !== undefined) {
  for (const key of path.split('/').filter(Boolean)) {
    if (value === null || typeof value !== 'object' || !(key in (value as Record<string, unknown>))) { console.error(`${id} 的 data 里没有路径 ${path}（卡在「${key}」）`); process.exit(1) }
    value = (value as Record<string, unknown>)[key]
  }
}
console.log(JSON.stringify(value, null, 1))

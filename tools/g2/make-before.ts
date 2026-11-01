import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { brotliCompressSync, constants } from 'node:zlib'
import { strFromU8, unzipSync } from 'fflate'
import { loadAllPacks, packPath } from '../../tests/data/r9-pack-helpers'

/**
 * 生成 tests/data/fixtures/g2-before.json.br：G2 开工时（1.3.0）每个条目的全文与每个包的名称/依赖（T5 `g2-additive` 的对照基线）。
 * 只在「当前 11 个包的哈希 = docs/probes/D1.2-G2_快照.json」时才允许生成（保证基线就是 G2 开工时的数据）。
 * 夹具已提交，**不要重新生成**；这个工具只是留档：说明夹具怎么来的、需要时可复核。
 */
const snapshot = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2-G2_快照.json'), 'utf8')) as { packs: Record<string, { sha256: string }> }
const entries: Record<string, { pack: string; entry: unknown }> = {}
const packs: Record<string, unknown> = {}
for (const p of loadAllPacks()) {
  const sha = createHash('sha256').update(readFileSync(packPath(p.id))).digest('hex')
  if (sha !== snapshot.packs[p.id]?.sha256) throw new Error(`${p.id} 的哈希与 G2 开工快照不同：现在的数据已经不是 G2 开工时的数据，不能生成基线`)
  for (const e of p.entries) entries[e.id] = { pack: p.id, entry: e }
  const m = JSON.parse(strFromU8(unzipSync(new Uint8Array(readFileSync(packPath(p.id))))['trpg-manifest.json'])).pack
  packs[p.id] = { version: m.version, dataVersion: m.dataVersion, name: m.name, nameEn: m.nameEn, lineage: m.lineage, requires: m.relationships.requires.map((r: { id: string }) => r.id).sort() }
}
const text = Buffer.from(JSON.stringify({ entries, packs }))
const br = brotliCompressSync(text, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_LGWIN]: 24, [constants.BROTLI_PARAM_SIZE_HINT]: text.length } })
writeFileSync(join(process.cwd(), 'tests/data/fixtures/g2-before.json.br'), br)
console.log(`条目 ${Object.keys(entries).length}，夹具 ${(br.length / 1e6).toFixed(2)} MB`)

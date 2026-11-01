import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { brotliDecompressSync } from 'node:zlib'

export interface G2Pack { version: string; dataVersion: number; name: string; nameEn?: string; lineage: string; requires: string[] }
export interface G2Before { entries: Record<string, { pack: string; entry: Record<string, unknown> }>; packs: Record<string, G2Pack> }

/** G2 开工时（1.3.0 包）每个条目的全文与所在的包、每个包的名称/依赖。G2.5 只允许 tests/data/g2-allow/ 里写明的变化。 */
export function loadG2Before(): G2Before {
  return JSON.parse(brotliDecompressSync(readFileSync(join(process.cwd(), 'tests/data/fixtures/g2-before.json.br'))).toString('utf8'))
}

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

export interface S1Before { type: string; name: string; nameEn?: string; summary: string; keywords: string[]; data: Record<string, unknown>; enName?: string }

/** S1 开工时（R15 已推送的 1.2.0 包）每个条目的全文；S1 只允许 s1-additive.test.ts 里写明的变化。 */
export function loadS1Before(): Record<string, S1Before> {
  return JSON.parse(gunzipSync(readFileSync(join(process.cwd(), 'tests/data/fixtures/s1-before.json.gz'))).toString('utf8')) as Record<string, S1Before>
}

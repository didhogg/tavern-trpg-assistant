import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

export interface BeforeEntry { type: string; name: string; nameEn?: string; summary: string; data: Record<string, unknown> }

/** R14 之前（R13 已推送的包）每个条目的中文部分全文。 */
export function loadBefore(): Record<string, BeforeEntry> {
  return JSON.parse(gunzipSync(readFileSync(join(process.cwd(), 'tests/data/fixtures/r14-before.json.gz'))).toString('utf8')) as Record<string, BeforeEntry>
}

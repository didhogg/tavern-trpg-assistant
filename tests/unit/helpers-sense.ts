import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { strFromU8, unzipSync } from 'fflate'
import { senseDefsFrom, setSenseDefs } from '../../src/ui/people/card/senseDefs'

/** 测试夹具：感官定义直接取自真实的 SRD 包（packs/dnd5e2014-srd.trpgpack）里的「感官」规则条目，不手写。 */
export function loadSenseDefsFromSrd(): void {
  const zip = unzipSync(new Uint8Array(readFileSync(join(process.cwd(), 'packs', 'dnd5e2014-srd.trpgpack'))))
  const rules = JSON.parse(strFromU8(zip['entries/rule.json']!)) as Array<{ id: string; name: string; nameEn?: string; summary?: string; data: Record<string, unknown> }>
  setSenseDefs(senseDefsFrom(rules))
}

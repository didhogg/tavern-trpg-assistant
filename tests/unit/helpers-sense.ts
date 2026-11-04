import { emptyTables, hasColumns, parseProfByCr, parseProfByLevel, parseXpTable, type RuleTables, type TableLike } from '../../src/rules/dnd5e2014/derive/tables'
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

/** 测试夹具：规则数值表取自真实 SRD 包里的表条目（按列键认），不手写。 */
export function loadTablesFromSrd(): RuleTables {
  const zip = unzipSync(new Uint8Array(readFileSync(join(process.cwd(), 'packs', 'dnd5e2014-srd.trpgpack'))))
  const rows = JSON.parse(strFromU8(zip['entries/table.json']!)) as Array<{ data: TableLike }>
  const out = emptyTables()
  for (const row of rows) {
    if (hasColumns(row.data, 'level', 'proficiencyBonus') && !out.profByLevel.length) out.profByLevel = parseProfByLevel(row.data)
    else if (hasColumns(row.data, 'cr', 'xp') && !Object.keys(out.xpByCr).length) out.xpByCr = parseXpTable(row.data)
    else if (hasColumns(row.data, 'cr', 'proficiencyBonus') && !Object.keys(out.profByCr).length) out.profByCr = parseProfByCr(row.data)
  }
  return out
}

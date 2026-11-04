/**
 * 把 5e-database（D&D 5e API 的 SRD 数据）整理成数据测试用的"核对材料"：classes / spells / equipment / monsters 四个汇总 JSON。
 * 全部由程序从放回的参考资料生成（只读），输出到缓存目录 `<缓存>/dnd5eapi/`（仓库外，也不写进参考资料文件夹）。
 *   用法：npx tsx tools/data/fetch/api_summary.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CACHE_ROOT, REFERENCE_ROOT } from '../lib/io'

const SRC = join(REFERENCE_ROOT, '5e-database-main', 'src', '2014', 'en')
const OUT = join(CACHE_ROOT, 'dnd5eapi')
type Row = Record<string, unknown> & { index: string }
const read = (name: string): Row[] => JSON.parse(readFileSync(join(SRC, `5e-SRD-${name}.json`), 'utf8')) as Row[]
const byIndex = (rows: Row[]): Record<string, Row> => Object.fromEntries(rows.map((r) => [r.index, r]))

const classes = byIndex(read('Classes'))
const levels: Record<string, Row[]> = {}
for (const row of read('Levels')) {
  if ('subclass' in row) continue // 子职业的逐级表另算；这里只要职业本体
  const cls = (row.class as { index: string }).index
  ;(levels[cls] ??= []).push(row)
}
for (const list of Object.values(levels)) list.sort((a, b) => Number(a.level) - Number(b.level))

mkdirSync(OUT, { recursive: true })
const write = (name: string, value: unknown): void => writeFileSync(join(OUT, name), `${JSON.stringify(value)}\n`)
write('classes.json', { classes, levels })
write('spells.json', byIndex(read('Spells')))
write('equipment.json', byIndex(read('Equipment')))
write('monsters.json', byIndex(read('Monsters')))
console.log(`已生成：${OUT}（职业 ${Object.keys(classes).length}、逐级表 ${Object.values(levels).reduce((n, l) => n + l.length, 0)} 行、法术 ${read('Spells').length}、装备 ${read('Equipment').length}、怪物 ${read('Monsters').length}）`)

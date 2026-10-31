// R13：对着英文原版数据（data-bak）把「规划 + 转换」再跑一遍，把全部英文条目写成 JSON，供主构建按 id 对齐。
// 必须在子进程里运行：TRPG_DATA_DIR=data-bak TRPG_DATA_LANG=en tsx tools/data/english.ts <输出文件>
import { writeFileSync } from 'node:fs'
import { loadRawData, expandItemEntries } from './extract/load'
import { expandMagicVariants, mergeItemLists } from './convert/items'
import { planAll } from './convert/plan'
import { attachVehicleFluff, planR11 } from './convert/planR11'
import { planR9 } from './convert/planR9'
import { loadBookData } from './extract/books'
import { planR12 } from './convert/planR12'
import { loadR11Data } from './extract/r11'
import { convertAll } from './convert'

async function main(): Promise<void> {
  const out = process.argv[2]
  if (!out) throw new Error('缺少输出文件路径参数')
  if (process.env.TRPG_DATA_DIR !== 'data-bak' || process.env.TRPG_DATA_LANG !== 'en') throw new Error('英文那一遍必须在 TRPG_DATA_DIR=data-bak、TRPG_DATA_LANG=en 下运行')
  const data = await loadRawData()
  const expanded = expandMagicVariants({ items: data.items, baseItems: data.baseItems, magicVariants: data.magicVariants, foundryVariants: data.foundryVariants })
  const items = expandItemEntries(mergeItemLists(data.items, data.baseItems, expanded.items), data.itemEntryTemplates)
  const plan = planAll(data, items)
  const r11 = planR11(await loadR11Data(), plan.entries)
  plan.entries.push(...r11.entries)
  const r9 = planR9(plan, { includeRef: true, replace: true }, data.legendaryGroups, new Set(r11.entries.map((e) => e.id)))
  plan.tables = r9.tables
  const r12 = planR12({ books: await loadBookData(), fluff: data.fluff ?? [], r9, existing: plan.entries, options: { embeds: true, tables: true } })
  plan.entries.push(...r12.entries)
  attachVehicleFluff(data.fluff ?? [], r11.entries, plan.unmatchedFluff)
  const result = convertAll(data, plan.entries, plan.tables, plan.skippedFeatures, plan.skippedSubraces)
  const entries = result.packs.flatMap((pack) => pack.entries).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  // 表的配对靠顺序（见 i18n/tables.ts）：同时写出表在「规划」里的先后
  writeFileSync(out, JSON.stringify({ entries, tableOrder: plan.tables.map((table) => table.id) }))
  console.log(`英文条目 ${entries.length}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error)
  process.exitCode = 1
})

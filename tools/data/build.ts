import { join } from 'node:path'
import { readJson, REPO_ROOT, writeBytes, writeText, sha256 } from './lib/io'
import { createSnapshot, changedFiles, loadSnapshot, saveSnapshot } from './snapshot'
import { loadRawData } from './extract/load'
import { expandMagicVariants, mergeItemLists } from './convert/items'
import { planAll } from './convert/plan'
import { convertAll, type ConversionResult } from './convert'
import { validatePacks, assertVolume } from './validate'
import { buildPackFile } from '../../src/core/packs/file'
import { BOOKS, SRD_PACK_ID } from './config/books'
import { writeReport } from './report/report'
import { writeChecklist } from './report/checklist'
import { writeDataRepo } from './publish/write'
import { checkPublished, type Published } from './version'

const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2))
  const updateSnapshot = args.has('--update-snapshot')
  const packArg = process.argv.indexOf('--pack')
  const only = process.argv.find((a) => a.startsWith('--pack='))?.slice(7) ?? (packArg >= 0 ? process.argv[packArg + 1] : undefined)
  const current = await createSnapshot()
  const saved = await loadSnapshot()
  if (updateSnapshot || !saved) {
    await saveSnapshot(current)
    console.log(`已记录输入快照（${Object.keys(current.files).length} 个文件）`)
  } else {
    const changed = changedFiles(saved, current)
    if (changed.length) {
      console.error(`输入文件已变化，请确认后加 --update-snapshot 重新记录：\n${changed.join('\n')}`)
      process.exitCode = 1
      return
    }
  }

  console.log('读取参考数据…')
  const data = await loadRawData()
  console.log(`法术 ${data.spells.length}，怪物 ${data.monsters.length}，物品 ${data.items.length}，基础物品 ${data.baseItems.length}`)
  const expanded = expandMagicVariants({ items: data.items, baseItems: data.baseItems, magicVariants: data.magicVariants })
  console.log(`魔法变体展开：生成 ${expanded.created} 条，跳过 ${expanded.skipped} 个通用变体`)
  const items = mergeItemLists(data.items, data.baseItems, expanded.items)
  const plan = planAll(data, items)
  console.log(`计划条目：${plan.entries.length}，随机表：${plan.tables.length}，跳过特性：${plan.skippedFeatures}`)
  const result: ConversionResult = convertAll(data, plan.entries, plan.tables, plan.skippedFeatures, plan.skippedSubraces)
  validatePacks(result.packs)
  console.log(`转换完成：${result.packs.length} 个包`)

  const published = await readJson<Published>(join(REPO_ROOT, 'tools', 'data', 'published.json')).catch(() => ({ formatVersion: 1, packs: {} }) as Published)
  const outputs = new Map<string, { bytes: Uint8Array; sha256: string }>()
  for (const pack of result.packs) {
    if (only && pack.manifest.id !== only && pack.manifest.id !== SRD_PACK_ID) continue
    const bytes = buildPackFile({ manifest: pack.manifest, entries: pack.entries, features: pack.features })
    outputs.set(pack.manifest.id, { bytes, sha256: sha256(bytes) })
  }
  const volumes = [...outputs].map(([id, out]) => ({ id, bytes: out.bytes.length }))
  assertVolume(volumes)
  const version = checkPublished(
    result.packs.filter((p) => outputs.has(p.manifest.id)).map((p) => ({ id: p.manifest.id, version: p.manifest.version, sha256: outputs.get(p.manifest.id)!.sha256 })),
    published,
  )
  if (version.errors.length) {
    console.error(version.errors.join('\n'))
    process.exitCode = 1
    return
  }
  for (const warning of version.warnings) console.warn(`警告：${warning}`)

  for (const [id, out] of outputs) {
    const pack = result.packs.find((p) => p.manifest.id === id)!
    if (id === SRD_PACK_ID) await writeBytes(join(REPO_ROOT, 'packs', `${id}.trpgpack`), out.bytes)
    else await writeBytes(join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${pack.manifest.version}.trpgpack`), out.bytes)
  }
  if (!only) {
    await writeDataRepo(DATA_REPO, result.packs, outputs)
    await writeText(join(REPO_ROOT, 'tools', 'data', 'out', 'report.json'), `${JSON.stringify(reportOf(result, outputs, data), null, 2)}\n`)
    await writeReport(REPO_ROOT, result, outputs, data)
    await writeChecklist(REPO_ROOT, result)
  }
  for (const [id, out] of outputs) console.log(`${id.padEnd(24)} ${(out.bytes.length / 1024).toFixed(1)} KB  ${out.sha256}`)
  console.log(`合计 ${(volumes.reduce((n, v) => n + v.bytes, 0) / 1024 / 1024).toFixed(2)} MB`)
}

function reportOf(result: ConversionResult, outputs: Map<string, { bytes: Uint8Array; sha256: string }>, data: Awaited<ReturnType<typeof loadRawData>>) {
  const packs = result.packs.map((pack) => {
    const out = outputs.get(pack.manifest.id)
    const byType: Record<string, number> = {}
    const byCredit: Record<string, number> = {}
    for (const entry of pack.entries) {
      byType[entry.type] = (byType[entry.type] ?? 0) + 1
      const by = (entry.data.credit as { by?: string } | undefined)?.by ?? '未知'
      byCredit[by] = (byCredit[by] ?? 0) + 1
    }
    return { id: pack.manifest.id, name: pack.manifest.name, version: pack.manifest.version, entries: pack.entries.length, byType, byCredit, bytes: out?.bytes.length ?? 0, sha256: out?.sha256 ?? '', license: pack.manifest.license, requires: pack.manifest.relationships.requires }
  })
  return {
    generatedAt: new Date().toISOString(),
    dataVersion: 1,
    inputs: { books: BOOKS.map((b) => b.source), counts: { spells: data.spells.length, monsters: data.monsters.length, items: data.items.length, baseItems: data.baseItems.length, magicVariants: data.magicVariants.length } },
    packs,
    stats: result.stats,
    totalBytes: packs.reduce((n, p) => n + p.bytes, 0),
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error)
  process.exitCode = 1
})

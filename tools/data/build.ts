import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { readJson, REFERENCE_ROOT, REPO_ROOT, writeBytes, writeText, sha256 } from './lib/io'
import { outArg, resolveOutDir } from './lib/outDir'
import { createSnapshot, changedFiles, loadSnapshot, saveSnapshot } from './snapshot'
import { loadRawData } from './extract/load'
import { normalizeNewMonsters } from './normalizeNewMonsters'
import { expandMagicVariants, mergeItemLists } from './convert/items'
import { expandItemEntries } from './extract/load'
import { planAll } from './convert/plan'
import { attachVehicleFluff, planR11 } from './convert/planR11'
import { planR9 } from './convert/planR9'
import { loadBookData } from './extract/books'
import { planR12 } from './convert/planR12'
import { loadR11Data } from './extract/r11'
import { convertAll, type ConversionResult } from './convert'
import { validatePacks, assertVolume } from './validate'
import { assertFieldCoverage } from './validate/coverage'
import { BASELINE_ALIASES } from './config/baselineAliases'
import { checkReferences } from './validate/refs'
import { checkLayers } from './validate/layers'
import { assertHealth, healthMetrics } from './validate/health'
import { assertDelivered } from './validate/delivered'
import { FIELD_COVERAGE } from './config/fieldCoverage'
import { buildPackFile } from '../../src/core/packs/file'
import { BOOKS, SRD_PACK_ID } from './config/books'
import { writeReport } from './report/report'
import { writeChecklist } from './report/checklist'
import { writeCharacterReport } from './report/characterReport'
import { writeChecklist11 } from './report/checklist11'
import { writeDataRepo } from './publish/write'
import { runEnglishPass } from './i18n/run'
import { alignAll } from './i18n/align'
import { unifyNameEn } from './i18n/nameEn'
import { validateJoins } from './validate/joins'
import { validateG25 } from './validate/g25'
import { runFixes } from './fix'
import { upcastStats } from './convert/spellUpcast'
import { validateI18n } from './i18n/validate'
import { writeI18nReport } from './i18n/report'
import { cleanEntries, lastCleanReport } from './clean'
import { carryStats } from './convert/carry'
import { latinLog } from './clean/rules/latin'
import { writeCleanReport } from './clean/report'
import { checkPublished, type Published } from './version'
import { dedupeMonsters, rewriteAliases } from './dedupe'
import { extractNpcs } from './npc/extract'
import { artById, applyArt } from './art/apply'

const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2))
  const updateSnapshot = args.has('--update-snapshot')
  const packArg = process.argv.indexOf('--pack')
  const only = process.argv.find((a) => a.startsWith('--pack='))?.slice(7) ?? (packArg >= 0 ? process.argv[packArg + 1] : undefined)
  // 试跑模式：--out <目录>。所有输出（包、目录页、报告、中间文件）只写到该目录；不碰 packs/、数据仓库、published.json、snapshot.json；
  // 输入文件变了也照常构建（只列出来），版本号检查降为警告。用于"先看差异再决定要不要换"。
  const rawOut = outArg(process.argv.slice(2))
  const OUT = rawOut === undefined ? undefined : resolveOutDir(rawOut, { 助手仓库: REPO_ROOT, 数据仓库: DATA_REPO, 参考资料夹: REFERENCE_ROOT })
  const WORK = OUT ? join(OUT, 'work') : join(REPO_ROOT, 'tools', 'data', 'out')
  const REPORT_ROOT = OUT ? join(OUT, 'reports') : REPO_ROOT
  const current = await createSnapshot()
  const saved = await loadSnapshot()
  if (OUT) {
    const changed = saved ? changedFiles(saved, current) : []
    await writeText(join(OUT, 'input-diff.txt'), `${changed.join('\n')}\n`)
    console.log(`试跑模式：输出目录 ${OUT}；输入文件与快照不同的有 ${changed.length} 个（清单见 input-diff.txt）`)
  } else if (updateSnapshot || !saved) {
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

  await assertFieldCoverage()
  console.log('读取参考数据…')
  const data = await loadRawData()
  const coreSources = new Set(BOOKS.filter((b) => b.layer <= 10).map((b) => b.source))
  normalizeNewMonsters(data, coreSources)
  const coreUnsupported = data.unsupportedMods.filter((x) => coreSources.has(x.source))
  const newUnsupported = data.unsupportedMods.filter((x) => !coreSources.has(x.source))
  console.log(`未知 _mod 模式：核心 ${coreUnsupported.length}，新来源 ${newUnsupported.length}${newUnsupported.length ? `（${newUnsupported.map((x) => `${x.source}/${x.name}/${x.mode}`).join('；')}）` : ''}`)
  if (coreUnsupported.length) throw new Error(`核心书出现未知 _mod 模式：${coreUnsupported.map((x) => `${x.name}/${x.mode}`).join('；')}`)
  console.log(`法术 ${data.spells.length}，怪物 ${data.monsters.length}，物品 ${data.items.length}，基础物品 ${data.baseItems.length}`)
  const expanded = expandMagicVariants({ items: data.items, baseItems: data.baseItems, magicVariants: data.magicVariants, foundryVariants: data.foundryVariants })
  console.log(`魔法变体展开：生成 ${expanded.created} 条，跳过 ${expanded.skipped} 个通用变体`)
  const items = expandItemEntries(mergeItemLists(data.items, data.baseItems, expanded.items), data.itemEntryTemplates)
  const corePackIds = new Set([SRD_PACK_ID, ...BOOKS.filter((b) => b.layer <= 10).map((b) => b.packId)])
  const plan = planAll(data, items)
  // D1.2b：新来源只导入 monster/npc。先把新怪物暂存起来，R9/R11/R12 只看核心 11 包，避免新来源的图片表格进入核心表流程。
  const coreIds = new Set(plan.entries.filter((e) => corePackIds.has(e.packId)).map((e) => e.id))
  plan.entries = plan.entries.filter((e) => !(e.type === 'feature' && e.context.ownerId?.startsWith('subclass.') && !coreIds.has(e.context.ownerId)))
  const newMonsters = plan.entries.filter((e) => !corePackIds.has(e.packId) && (e.type === 'monster' || e.type === 'npc'))
  plan.entries = plan.entries.filter((e) => corePackIds.has(e.packId))
  plan.tables = plan.tables.filter((t) => corePackIds.has(t.packId))
  const r11Data = await loadR11Data()
  const r11 = planR11(r11Data, plan.entries)
  plan.entries.push(...r11.entries)
  plan.entries = plan.entries.filter((e) => corePackIds.has(e.packId))
  const r9 = planR9(plan, { includeRef: true, replace: true }, data.legendaryGroups.filter((g) => coreSources.has(String(g.source))), new Set(r11.entries.map((e) => e.id)))
  plan.tables = r9.tables
  const books = await loadBookData()
  const r12 = planR12({ books, fluff: data.fluff ?? [], r9, existing: plan.entries, options: { embeds: true, tables: true } })
  plan.entries.push(...r12.entries)
  plan.entries = plan.entries.filter((e) => corePackIds.has(e.packId))
  const englishNameIds = new Set<string>()
  for (const e of newMonsters) if (e.type === 'monster' && e.missingName) { e.missingName = false; englishNameIds.add(e.id) }
  plan.entries.push(...newMonsters)
  const npcs = extractNpcs(plan.entries, BOOKS.filter((b) => b.kind === 'adventure').map((b) => b.source))
  plan.entries.push(...npcs)
  console.log(`具名 NPC：${npcs.length}`)
  // D1.2b：新来源只导入 monster/npc；核心 11 包保持原有全部类型。
  plan.entries = plan.entries.filter((e) => corePackIds.has(e.packId) || e.type === 'monster' || e.type === 'npc')
  plan.tables = plan.tables.filter((t) => corePackIds.has(t.packId))
  console.log(`书籍章节：${r12.stats.chapters}（R12）`)
  console.log(`载具 fluff 挂上：${attachVehicleFluff(data.fluff ?? [], r11.entries, plan.unmatchedFluff)}`)
  console.log(`计划条目：${plan.entries.length}（R11 ${r11.entries.length}），随机表：${plan.tables.length}，跳过特性：${plan.skippedFeatures}，未挂 fluff：${plan.unmatchedFluff.length}`)
  for (const item of plan.unmatchedFluff.slice(0, 30)) console.log(`UNMATCHED ${item.kind} ${item.name} ${item.source} ${item.reason}`)
  let focus: Record<string, any> = {}
  try { focus = JSON.parse(readFileSync(join(REPO_ROOT, 'tools', 'data', 'art', 'focus.json'), 'utf8')) as Record<string, any> } catch { focus = {} }
  const art = artById(data, plan.entries, focus)
  const result: ConversionResult = convertAll(data, plan.entries, plan.tables, plan.skippedFeatures, plan.skippedSubraces)
  for (const pack of result.packs) if (pack.entries.some((e) => e.type === 'npc')) pack.manifest.minAppVersion = '0.3.0'
  for (const pack of result.packs) for (const e of pack.entries) if (englishNameIds.has(e.id)) { const credit = e.data.credit as { missing?: string[] } | undefined; if (credit) { credit.missing = [...new Set([...(credit.missing ?? []), 'zh'])] } }
  console.log(`R15 补字段：${JSON.stringify(carryStats)}`)
  console.log(`升环导入：带标签的法术 ${upcastStats.spellsWithTag}，自动结构化 ${upcastStats.imported}，只留文字 note ${upcastStats.noted}，认不出的标签 ${upcastStats.unresolved.length}${upcastStats.unresolved.length ? `：${upcastStats.unresolved.join('；')}` : ''}`)
  cleanEntries(result.packs.flatMap((p) => p.entries)) // R14：文字清理，在校验与分包之前
  const dedupe = dedupeMonsters(result.packs, corePackIds)
  result.packs = result.packs.filter((p) => corePackIds.has(p.manifest.id) || p.entries.length > 0)
  const artCount = applyArt(result.packs, art)
  console.log(`art：${artCount} 个怪物`)
  await writeText(join(WORK, 'dedupe.json'), `${JSON.stringify(dedupe, null, 1)}\n`)
  console.log(`去重：A ${dedupe.A}，B ${dedupe.B}，C ${dedupe.C}，D ${dedupe.D}，同名异物 ${dedupe.sameNameDifferent}`)
  const fixReport = runFixes(result.packs.filter((p) => corePackIds.has(p.manifest.id))) // G2.5 修正只作用于核心 11 包；新来源走自己的转换
  console.log(`修正：规则 ${fixReport.rules.length} 个（命中 ${fixReport.rules.reduce((n, r) => n + r.changed, 0)} 条），逐条表 ${fixReport.rows.length} 行，新增条目 ${fixReport.added.length}`)
  await writeText(join(WORK, 'fix-report.json'), `${JSON.stringify(fixReport, null, 1)}\n`)
  await writeText(join(WORK, 'clean.json'), `${JSON.stringify({ ...lastCleanReport(), latin: latinLog }, null, 1)}\n`)
  const srd = result.packs.find((p) => p.manifest.id === SRD_PACK_ID)
  if (srd) for (const alias of BASELINE_ALIASES) if (!srd.entries.some((e) => e.id === alias.id)) srd.entries.push(alias)
  const allConverted = result.packs.flatMap((p) => p.entries)
  const itemIdByName = new Map(allConverted.filter((e) => e.type === 'item').map((e) => [e.name, e.id]))
  for (const alias of BASELINE_ALIASES) {
    const baseItem = alias.data.baseItem
    if (typeof baseItem === 'string' && !baseItem.includes('.')) {
      const resolved = itemIdByName.get(baseItem)
      if (resolved) alias.data.baseItem = resolved
      else console.warn(`基线别名 ${alias.id} 的 baseItem 无法解析：${baseItem}`)
    }
  }
  const english = runEnglishPass()
  const aligned = alignAll(allConverted, english, plan.tables.map((table) => table.id))
  rewriteAliases(result.packs, dedupe.aliases)
  await writeText(join(WORK, 'i18n.json'), `${JSON.stringify({ stats: aligned.stats, misses: aligned.misses, unmatchedEnglish: aligned.unmatchedEnglish }, null, 1)}\n`)
  console.log(`英文条目 ${english.entries.length}，已加 i18n：${Object.values(aligned.stats).reduce((n, s) => n + s.withEnglish, 0)}/${allConverted.length}`)
  const i18nErrors = validateI18n(allConverted)
  if (i18nErrors.length) throw new Error(`英文对照校验失败 ${i18nErrors.length} 条：${i18nErrors.slice(0, 10).join('；')}`)
  console.log(`S1 英文名统一取英文那一遍：${unifyNameEn(allConverted)} 条`)
  validatePacks(result.packs)
  assertDelivered(result.packs.flatMap((p) => p.entries), FIELD_COVERAGE)
  const layers = checkLayers(result.packs)
  console.log(`层级/依赖问题：${layers.length}`)
  for (const issue of layers) console.log(`LAYER ${issue.kind} ${issue.pack} ${issue.detail}`)
  if (layers.length) throw new Error(`层级/依赖校验失败：${layers.map((x) => `${x.pack} ${x.detail}`).join('；')}`)
  const refs = await checkReferences(result.packs)
  console.log(`引用悬空：${refs.dangling.length}，需新增依赖：${refs.dependency.length}`)
  if (refs.dangling.length) throw new Error(`引用悬空 ${refs.dangling.length} 条：${refs.dangling.slice(0, 10).map((x) => `${x.entry} ${x.field} ${x.value}`).join('；')}`)
  if (refs.dependency.length) throw new Error(`缺少包依赖 ${refs.dependency.length} 条：${refs.dependency.slice(0, 10).map((x) => `${x.pack} ${x.field} ${x.value}`).join('；')}`)
  const joinProblems = validateJoins(result.packs)
  console.log(`joins 问题：${joinProblems.length}`)
  if (joinProblems.length) throw new Error(`joins 校验失败 ${joinProblems.length} 条：${joinProblems.slice(0, 10).join('；')}`)
  const g25Problems = validateG25(result.packs)
  console.log(`G2.5 新字段问题：${g25Problems.length}`)
  if (g25Problems.length) throw new Error(`G2.5 新字段校验失败 ${g25Problems.length} 条：${g25Problems.slice(0, 10).join('；')}`)
  const health = healthMetrics(result, data)
  assertHealth(health)
  await writeText(join(WORK, 'health.json'), `${JSON.stringify(health, null, 2)}\n`)
  console.log('体检报数：' + health.map((h) => `${h.id}=${h.count ?? 'pending'}`).join(' '))
  console.log(`转换完成：${result.packs.length} 个包`)

  const published = await readJson<Published>(join(REPO_ROOT, 'tools', 'data', 'published.json')).catch(() => ({ formatVersion: 1, packs: {} }) as Published)
  const outputs = new Map<string, { bytes: Uint8Array; sha256: string }>()
  for (const pack of result.packs) {
    if (only && pack.manifest.id !== only && pack.manifest.id !== SRD_PACK_ID) continue
    const bytes = buildPackFile({ manifest: pack.manifest, entries: pack.entries, features: pack.features })
    outputs.set(pack.manifest.id, { bytes, sha256: sha256(bytes) })
  }
  const volumes = [...outputs].map(([id, out]) => ({ id, bytes: out.bytes.length }))
  assertVolume(volumes.filter((v) => corePackIds.has(v.id)))
  for (const v of volumes) {
    if (corePackIds.has(v.id)) continue
    const book = BOOKS.find((b) => b.packId === v.id)
    const limit = book?.kind === 'adventure' ? 6 : 3
    if (v.bytes > limit * 1024 * 1024) throw new Error(`${v.id} 压缩后 ${(v.bytes / 1024 / 1024).toFixed(2)}MB，超过 ${limit}MB`)
  }
  const version = checkPublished(
    result.packs.filter((p) => outputs.has(p.manifest.id)).map((p) => ({ id: p.manifest.id, version: p.manifest.version, sha256: outputs.get(p.manifest.id)!.sha256 })),
    published,
  )
  if (version.errors.length && !OUT) {
    console.error(version.errors.join('\n'))
    process.exitCode = 1
    return
  }
  if (OUT) for (const error of version.errors) console.warn(`（试跑，降为警告）${error}`)
  for (const warning of version.warnings) console.warn(`警告：${warning}`)

  for (const [id, out] of outputs) {
    const pack = result.packs.find((p) => p.manifest.id === id)!
    if (OUT) await writeBytes(join(OUT, 'packs', `${id}-${pack.manifest.version}.trpgpack`), out.bytes)
    else if (id === SRD_PACK_ID) await writeBytes(join(REPO_ROOT, 'packs', `${id}.trpgpack`), out.bytes)
    else await writeBytes(join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${pack.manifest.version}.trpgpack`), out.bytes)
  }
  if (!only) {
    await writeDataRepo(OUT ? join(OUT, 'data-repo') : DATA_REPO, result.packs, outputs)
    await writeText(join(WORK, 'report.json'), `${JSON.stringify(reportOf(result, outputs, data), null, 2)}\n`)
    await writeReport(REPORT_ROOT, result, outputs, data)
    await writeChecklist(REPORT_ROOT, result)
    await writeCharacterReport(REPORT_ROOT, result)
    await writeChecklist11(REPORT_ROOT, result)
    await writeI18nReport(REPORT_ROOT, aligned, english.entries.length, outputs)
    await writeCleanReport(REPORT_ROOT, lastCleanReport()!, health, outputs)
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
    dataVersion: 3,
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

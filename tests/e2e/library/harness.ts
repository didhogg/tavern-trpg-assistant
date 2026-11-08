// 测试用入口：在模拟宿主页里直接调用插件的【库】后端（不经界面）。
import { LibraryDatabase } from '../../../src/library/db'
import { FileProvider } from '../../../src/library/files'
import { libraryHandlers } from '../../../src/library/runtime/handlers'
import { startAuthorFrame, type AuthorFrame } from '../../../src/library/runtime/host'
import { commitOf, getSource } from '../../../src/library/sources'

const db = new LibraryDatabase()
const files = new FileProvider({ db })
const frames: AuthorFrame[] = []

export async function startFrames(codeSets: string[], { allowNetwork }: { allowNetwork: boolean }) {
  const pluginRoot = new URL('/', location.href)
  const out = []
  for (const codeSet of codeSets) {
    const t = performance.now()
    const f = await startAuthorFrame({ codeSet, pluginRoot, container: document.body, handlers: libraryHandlers({ codeSet, db, files, allowNetwork: () => allowNetwork }) })
    frames.push(f)
    out.push({ ...f.ready, ms: Math.round(performance.now() - t) })
  }
  return out
}

export function failures() {
  return frames.map((f) => ({ codeSet: f.codeSet, failures: [...f.failures] }))
}

/** 第 1 层（镜像）的局部检查：本地每个文件的指纹 = 锁定版本云端清单里的指纹。 */
export async function mirrorCheck() {
  const out: Record<string, { files: number; bytes: number; mismatched: string[]; notInList: string[] }> = {}
  for (const rec of await db.files.toArray()) {
    const list = await files.fileList(getSource(rec.source))
    const s = (out[rec.source] ??= { files: 0, bytes: 0, mismatched: [], notInList: [] })
    s.files++
    s.bytes += rec.size
    const expected = list[rec.path]
    if (!expected) s.notInList.push(rec.path)
    else if (expected.sha !== rec.gitSha || expected.size !== rec.size) s.mismatched.push(rec.path)
  }
  return out
}

export async function kvDump() {
  return (await db.kv.toArray()).map((r) => ({ scope: r.scope, key: r.key }))
}

// ---- B2-3 ----
import { installOfficial, parsedKey } from '../../../src/library/install'
import { precachePlan } from '../../../src/library/plan'

function openLocalFrame(codeSet: string, kvScope?: string) {
  return startAuthorFrame({ codeSet, pluginRoot: new URL('/', location.href), container: document.body, handlers: libraryHandlers({ codeSet, db, files, allowNetwork: () => false, kvScope }) })
}

export { openLocalFrame as openAuthorFrame }

export async function install(sourceId: string) {
  const source = getSource(sourceId)
  return installOfficial({ source, db, files, openFrame: () => openLocalFrame(source.codeSet), onProgress: (p) => console.log(`[progress] ${sourceId} ${p.stage} ${p.done}/${p.total} ${p.item ?? ''}`) })
}

/** 按书开关：关掉一本书后，作者的 isExcluded 对这本书的条目返回 true；别的书不受影响。 */
export async function toggleBook(codeSet: string, sourceId: string, bookSource: string, excluded: boolean) {
  const rec = await db.derived.get(parsedKey(sourceId, 'spell'))
  const { items, hashes } = rec!.value as { items: Array<{ source: string }>; hashes: string[] }
  const i = items.findIndex((it) => it.source === bookSource)
  const j = items.findIndex((it) => it.source !== bookSource)
  const f = await openLocalFrame(codeSet)
  try {
    if (excluded !== undefined) await f.call('setSourceExcluded', bookSource, excluded)
    return {
      inBook: await f.call('isExcluded', hashes[i], 'spell', bookSource),
      otherBook: await f.call('isExcluded', hashes[j], 'spell', items[j].source),
    }
  } finally {
    f.close()
  }
}

export async function bookState(codeSet: string, sourceId: string, bookSource: string) {
  const rec = await db.derived.get(parsedKey(sourceId, 'spell'))
  const { items, hashes } = rec!.value as { items: Array<{ source: string }>; hashes: string[] }
  const i = items.findIndex((it) => it.source === bookSource)
  const f = await openLocalFrame(codeSet)
  try {
    return await f.call('isExcluded', hashes[i], 'spell', bookSource)
  } finally {
    f.close()
  }
}

/** 断网后复查：第 1 层镜像仍然完整，解析结果都在库里。 */
export async function offlineAudit(sourceId: string) {
  const source = getSource(sourceId)
  const list = await files.fileList(source)
  const plan = precachePlan(list)
  let ok = 0
  const bad: string[] = []
  for (const path of plan.files) {
    const rec = await db.files.get([sourceId, path])
    if (rec && rec.gitSha === list[path].sha) ok++
    else bad.push(path)
  }
  const parsedKeys = (await db.derived.where('key').startsWith(`parsed:${sourceId}:`).primaryKeys()).length
  return { planFiles: plan.files.length, ok, bad: bad.slice(0, 10), parsedKeys, set: await db.sets.get(sourceId) }
}

/** 某个源文件是否在【库】镜像里（用来查作者导航生成文件的来源）。 */
export async function hasSourceFile(sourceId: string, path: string): Promise<boolean> {
  return !!(await db.files.get([sourceId, path]))
}

/** 诊断用：经传话通道叫最近打开的某个小窗做一件事。 */
export async function callFrame(codeSet: string, fn: string, ...args: unknown[]) {
  const f = [...frames].reverse().find((x) => x.codeSet === codeSet)
  if (!f) throw new Error(`没有打开的小窗：${codeSet}`)
  return (f.call as (fn: string, ...a: unknown[]) => Promise<unknown>)(fn, ...args)
}

// ---- B2-4 / B2-5 ----
import { LibraryService } from '../../../src/library/service'

/** 库服务（界面将来的唯一入口）。安装会另开小窗，所以安装后要 service.reset()。 */
export const service = new LibraryService({ db, openFrame: openLocalFrame })
export const libraryDb = db

// ---- B2-8a 审计第 3、4 层 ----
import { compareLayers, isFoundryFile, recordSchemaOf, type AuditLayers34Report, type ParsedRecord, type RawRecord, type SchemaInfo } from './audit-layers34'
import { AUTHOR_RULES } from './audit-author-rules'

/** 读本地原始文件 + 全量解析结果，交给 compareLayers；报告存进库（体检会读到）。 */
export async function auditLayers34(sourceId: string, schema: SchemaInfo): Promise<AuditLayers34Report> {
  const source = getSource(sourceId)
  const f = await openLocalFrame(source.codeSet)
  try {
    const loaders = await f.call('loaders')
    const corpusProps = new Set(loaders.filter((l) => l.kind === 'corpus').flatMap((l) => l.props))
    const loaderProps = new Set(loaders.flatMap((l) => l.props))
    const notCategory: Record<string, string[]> = {}
    const noSchemaFile: Record<string, string[]> = {}
    const foundry: Record<string, number> = {}
    const corpusRaw: Record<string, number> = {}
    const raws: RawRecord[] = []
    const files = await db.files.where('source').equals(sourceId).toArray()
    for (const file of files) {
      if (!file.path.startsWith('data/') || !file.path.endsWith('.json')) continue
      const json = JSON.parse(file.text) as Record<string, unknown>
      for (const [key, value] of Object.entries(json)) {
        if (!Array.isArray(value)) continue
        if (isFoundryFile(file.path)) { foundry[file.path] = (foundry[file.path] ?? 0) + value.length; continue }
        const { schema: recSchema, fallback } = recordSchemaOf(schema, file.path, key)
        // 结构定义里没有、但作者加载器登记了这一类（例 data/generated/gendata-tables.json 的 tableGroup）：照样比，字段判断不了
        if (!recSchema && !loaderProps.has(key)) { (notCategory[key] ??= []).push(file.path); continue }
        if (fallback) (noSchemaFile[file.path] ??= []).push(key)
        if (corpusProps.has(key)) { corpusRaw[key] = (corpusRaw[key] ?? 0) + value.length; continue }
        const hashes = await f.call('rawHashes', key, value)
        value.forEach((rec, i) => raws.push({ prop: key, file: file.path, hash: hashes[i], rec: rec as Record<string, unknown>, schema: recSchema }))
      }
    }
    const parseds: ParsedRecord[] = []
    const parsedProps = new Set<string>()
    for (const rec of await db.derived.where('key').startsWith(`parsed:${sourceId}:`).toArray()) {
      if (rec.key.includes(':corpus:')) continue
      const prop = rec.key.slice(`parsed:${sourceId}:`.length)
      parsedProps.add(prop)
      const { items, hashes } = rec.value as { items: Array<Record<string, unknown>>; hashes: Array<string | null> }
      items.forEach((item, i) => parseds.push({ prop, hash: hashes[i], item }))
    }
    const report: AuditLayers34Report = {
      source: sourceId,
      schemaVersion: schema.version,
      notCategory,
      noSchemaFile,
      foundry,
      notChecked: Object.entries(corpusRaw).map(([prop, raw]) => ({ prop, raw, reason: '书、冒险：作者按本取正文，第 2 层已逐本解析' })),
      ...compareLayers(raws, parseds, schema, loaders.map((l) => l.props), parsedProps, AUTHOR_RULES, source.codeSet),
    }
    await db.derived.put({ key: `audit:layers34:${sourceId}`, fingerprint: `${commitOf(source)}+schema@${schema.version}`, value: report, savedAt: Date.now() })
    return report
  } finally {
    f.close()
  }
}

/** 诊断用：某个编号在原始文件和解析结果里各是什么（查可疑清单的根因）。 */
export async function auditProbe(sourceId: string, prop: string, hash: string) {
  const source = getSource(sourceId)
  const f = await openLocalFrame(source.codeSet)
  try {
    const raws: Array<{ file: string; key: string; rec: unknown }> = []
    for (const file of await db.files.where('source').equals(sourceId).toArray()) {
      if (!file.path.startsWith('data/') || !file.path.endsWith('.json')) continue
      for (const [key, value] of Object.entries(JSON.parse(file.text) as Record<string, unknown>)) {
        if (!Array.isArray(value)) continue
        const hashes = await f.call('rawHashes', prop, value)
        hashes.forEach((h, i) => { if (h === hash) raws.push({ file: file.path, key, rec: value[i] }) })
      }
    }
    const rec = await db.derived.get(parsedKey(sourceId, prop))
    const { items, hashes } = (rec?.value ?? { items: [], hashes: [] }) as { items: unknown[]; hashes: Array<string | null> }
    return { raws, parsed: items.filter((_, i) => hashes[i] === hash) }
  } finally {
    f.close()
  }
}

// ---- P3-1 按战役看【库】、自定义库、下载任务 ----
import { ScopedLibrary } from '../../../src/library/scoped'
import { CustomLibrary } from '../../../src/library/custom'
import { DownloadTasks } from '../../../src/library/tasks'
import { defaultCampaignLibrary } from '../../../src/library/scopes'

export const scoped = new ScopedLibrary(service, db)
export const custom = new CustomLibrary(service, scoped, db)
export const tasks = new DownloadTasks({ db, files, openFrame: (codeSet) => openLocalFrame(codeSet) })
export { defaultCampaignLibrary }

// ---- P3-3 / P3-4：用户存档 + 结算内核段，引用检查直接问上面的【库】 ----
import { TrpgDatabase } from '../../../src/core/db'
import { CampaignService } from '../../../src/core/saves/campaign'
import { KernelSaveService } from '../../../src/core/saves/kernel'
import { libraryDataVersion, scopedRefChecker, scopedCurrentOverrides } from '../../../src/library/kernel-check'
import { RuleRegistry } from '../../../src/rules/registry'
import { dnd5e2014 } from '../../../src/rules/dnd5e2014'
import { entryUnit } from '../../../src/library/scopes'
import { exportSaves, estimateExport } from '../../../src/core/transfer/exporter'
import { importSaves } from '../../../src/core/transfer/importer'
import { readSaveFile } from '../../../src/core/transfer/saveFile'

export const userDb = new TrpgDatabase('p3-3-4-e2e')
export const rules = new RuleRegistry()
rules.register(dnd5e2014)
export const campaign = new CampaignService(userDb, { rules, now: () => Date.now() })
/** 当前装的数据版本记号：用正式代码（src/library/kernel-check.ts），测试不另写一份。 */
export const dataVersion = libraryDataVersion(db, service)
export const kernelSave = new KernelSaveService({ db: userDb, campaign, rules, now: () => Date.now(),
  checkRefs: scopedRefChecker(scoped), currentVersion: dataVersion, currentOverrides: scopedCurrentOverrides(scoped) })
export const backupLibrary = { exportFiles: () => custom.exportBackup(), importFiles: (files: Record<string, string>) => custom.importBackup(files) }
export { entryUnit, exportSaves, importSaves, estimateExport, readSaveFile }

// ---- P3-3b：在【库】测试页里开真实结算小窗，并按引用/选择/状态重建人物 ----
import { libraryData, startKernel, type KernelSession } from '../../../src/rules/kernel/host'
import { actorData, actorPrepared, compactActor, refMapperFor, rebuildActor } from '../../../src/rules/kernel/rebuild'

export { actorData, actorPrepared, compactActor, refMapperFor, rebuildActor }
export { kernelInput } from '../../../src/rules/kernel/input'

export async function startKernelSession(input: unknown): Promise<{ session: KernelSession; status: unknown }> {
  const session = await startKernel({ pluginRoot: new URL('/', location.href), container: document.body, data: libraryData(files), timeoutMs: 180_000 })
  const status = await session.boot(input as never)
  return { session, status }
}

// ---- P3-3b / P3-4 完整链路共用：从【库】挑真实条目（带英文对照，喂 Plutonium 用） ----
type ChainRow = { ref: { set: string; prop: string; hash: string }; label: string; entry: unknown }

async function takeEntry(library: ReturnType<typeof defaultCampaignLibrary>, prop: string, book: string, filter: (item: Record<string, unknown>) => boolean): Promise<ChainRow> {
  const p = await service.parsed('cn-official', prop)
  for (let i = 0; i < p.items.length; i++) {
    const item = p.items[i] as Record<string, unknown>
    const hash = p.hashes[i]
    if (!hash || p.sources[i] !== book || !filter(item)) continue
    const ref = { set: 'cn-official', prop, hash }
    const d = await scoped.detail(library, ref)
    if (!d || 'hidden' in d || !d.english || d.english.status !== 'found') continue
    return { ref, label: String(item.name), entry: d.english.item }
  }
  throw new Error(`no ${book} entry with English pair for ${prop}`)
}

/** 英雄的种族/背景/职业/武器/戏法 + 一只怪物；heroClass='cleric' 换牧师（含 ItemGrant/Subclass）。 */
export async function pickChainEntries(library: ReturnType<typeof defaultCampaignLibrary>, heroClass = ''): Promise<{ plan: Record<string, ChainRow>; monster: ChainRow }> {
  const plan = {
    race: await takeEntry(library, 'race', 'PHB', it => !!it.size && !String(it.name).includes('(')),
    background: await takeEntry(library, 'background', 'PHB', it => !!it.skillProficiencies || !!it.entries),
    class: await takeEntry(library, 'class', 'PHB', heroClass === 'cleric' ? it => it.name === '牧师' : it => !!it.hd),
    weapon: await takeEntry(library, 'item', 'PHB', it => it.weaponCategory === 'martial' || it.type === 'M'),
    spell: await takeEntry(library, 'spell', 'PHB', it => it.level === 0),
  }
  const monster = await takeEntry(library, 'monster', 'MM', it => !!it.name)
  return { plan, monster }
}

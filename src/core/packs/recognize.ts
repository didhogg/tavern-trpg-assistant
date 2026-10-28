import { strFromU8 } from 'fflate'
import { TrpgError } from '../errors'
import { sha256Hex } from '../hash'
import { migrateRecord } from '../migrate'
import { compareVersions } from '../semver'
import { FORMAT_VERSION, SUPPORTED_DATA_VERSION } from '../../schemas/common'
import { saveSlotSchema, settingsSchema, workspaceSchema, type SaveSlot, type Settings, type Workspace } from '../../schemas/campaign'
import { adventureFallbackSchema, adventureFileSchema, adventureItemSchema, type AdventureItem } from '../../schemas/adventure'
import {
  entrySchema,
  packFileManifestSchema,
  packListItemSchema,
  saveFileManifestSchema,
  type BlobInfo,
  type Entry,
  type PackFeature,
  type PackListItem,
  type PackManifest,
  type SaveFileManifest,
} from '../../schemas/pack'
import { assertImage } from './images'
import { normalizeManifest, field } from './manifest'
import { assertPackPaths } from './paths'
import { assertPackRefs } from './refs'
import { readJson, readZip, type ZipFiles } from './zip'

export interface RecognizeContext {
  appVersion: string
  hasRule: (ruleId: string) => boolean
}

export interface RecognizedBlob extends BlobInfo {
  bytes: Uint8Array
}

export interface RecognizedPack {
  type: 'pack'
  manifest: PackManifest
  entries: Entry[]
  blobs: Map<string, RecognizedBlob>
  features: PackFeature[]
  adventure: Record<string, unknown>
  fallback: AdventureItem[]
  byteSize: number
  sha256: string
}

export interface RecognizedSaveFile {
  type: 'save' | 'backup'
  manifest: SaveFileManifest
  saves: SaveSlot[]
  workspaces: Workspace[]
  settings?: Settings
  packList: PackListItem[]
  attachedPacks: Map<string, Uint8Array>
  blobs: Map<string, Uint8Array>
}

export type Recognized = RecognizedPack | RecognizedSaveFile

function badContent(detail: string): TrpgError {
  return new TrpgError('E_BAD_CONTENT', `文件内容损坏：${detail}`)
}

function leafFiles(files: ZipFiles): string[] {
  return Object.keys(files).filter((n) => !n.endsWith('/'))
}

function readEntries(files: ZipFiles): Entry[] {
  const entries: Entry[] = []
  const names = leafFiles(files).filter((n) => n.startsWith('entries/') && n.endsWith('.json')).sort()
  for (const name of names) {
    const raw = readJson(files, name)
    if (!Array.isArray(raw)) throw badContent(`${name} 不是条目列表`)
    for (const item of raw) {
      const parsed = entrySchema.safeParse(item)
      if (!parsed.success) {
        const label = (item as { name?: unknown } | null)?.name
        throw badContent(`第 ${entries.length + 1} 项「${typeof label === 'string' ? label : '未命名'}」的 ${field(parsed.error.issues[0])} 不合法`)
      }
      entries.push(parsed.data)
    }
  }
  return entries
}

function readFeatures(files: ZipFiles): PackFeature[] {
  const out: PackFeature[] = []
  for (const name of leafFiles(files).filter((n) => n.startsWith('features/') && n.endsWith('.json')).sort()) {
    const raw = readJson(files, name)
    if (!Array.isArray(raw)) throw badContent(`${name} 不是功能列表`)
    for (const item of raw) {
      const rec = item as Partial<PackFeature> | null
      if (!rec || typeof rec.id !== 'string' || typeof rec.kind !== 'string' || typeof rec.name !== 'string' || typeof rec.data !== 'object' || rec.data === null) {
        throw badContent(`${name} 的功能定义不合法`)
      }
      out.push({ defaultEnabled: false, description: '', ...rec } as PackFeature)
    }
  }
  return out
}

function readAdventure(files: ZipFiles): { adventure: Record<string, unknown>; fallback: AdventureItem[] } {
  const adventure: Record<string, unknown> = {}
  for (const name of leafFiles(files).filter((n) => n.startsWith('adventure/') && n.endsWith('.json')).sort()) {
    if (name === 'adventure/fallback.json') continue
    const raw = readJson(files, name)
    if (name === 'adventure/adventure.json') {
      const parsed = adventureFileSchema.safeParse(raw)
      if (!parsed.success) throw badContent(`adventure/adventure.json 的 ${field(parsed.error.issues[0])} 不合法`)
      adventure[name] = parsed.data
    } else {
      const parsed = adventureItemSchema.array().safeParse(raw)
      if (!parsed.success) throw badContent(`${name} 的 ${field(parsed.error.issues[0])} 不合法`)
      adventure[name] = parsed.data
    }
  }
  const fallbackRaw = readJson(files, 'adventure/fallback.json')
  let fallback: AdventureItem[] = []
  if (fallbackRaw !== undefined) {
    const parsed = adventureFallbackSchema.safeParse(fallbackRaw)
    if (!parsed.success) throw badContent(`adventure/fallback.json 的 ${field(parsed.error.issues[0])} 不合法`)
    fallback = parsed.data.items
  }
  return { adventure, fallback }
}

function readBlobs(files: ZipFiles, formatVersion: number, manifest: PackManifest): Map<string, RecognizedBlob> {
  const blobs = new Map<string, RecognizedBlob>()
  if (formatVersion >= 2) {
    for (const name of leafFiles(files).filter((n) => n.startsWith('blobs/'))) {
      const hash = name.slice('blobs/'.length)
      if (!/^[a-f0-9]{64}$/.test(hash)) throw badContent(`图片「${hash}」的文件名不是哈希`)
      const bytes = files[name]
      if (sha256Hex(bytes) !== hash) throw badContent(`图片「${hash.slice(0, 12)}」的哈希不一致`)
      const mime = assertImage(hash, bytes)
      blobs.set(hash, { hash, mime, size: bytes.length, bytes })
    }
    if (manifest.blobs.length !== blobs.size) throw badContent('缺少图片或图片清单不一致')
    for (const info of manifest.blobs) {
      const blob = blobs.get(info.hash)
      if (!blob) throw badContent(`缺少图片「${info.hash.slice(0, 12)}」`)
      if (blob.size !== info.size || blob.mime !== info.mime) throw badContent(`图片「${info.hash.slice(0, 12)}」与清单不一致`)
    }
  }
  return blobs
}

/** formatVersion 1 的 assets/ 按内容哈希转入图片仓库，并改写引用。 */
function migrateAssets(files: ZipFiles, entries: Entry[], blobs: Map<string, RecognizedBlob>): void {
  const byPath = new Map<string, string>()
  for (const name of leafFiles(files).filter((n) => n.startsWith('assets/'))) {
    const path = name.slice(7)
    const bytes = files[name]
    const hash = sha256Hex(bytes)
    byPath.set(path, hash)
    if (!blobs.has(hash)) {
      const mime = assertImage(path, bytes)
      blobs.set(hash, { hash, mime, size: bytes.length, bytes })
    }
  }
  for (const entry of entries) {
    if (typeof entry.image === 'string' && byPath.has(entry.image)) entry.image = { $asset: byPath.get(entry.image)! }
  }
}

function recognizePack(files: ZipFiles, raw: unknown, bytes: Uint8Array, ctx: RecognizeContext, formatVersion: number): RecognizedPack {
  const ruleId = (raw as { pack?: { ruleId?: unknown } }).pack?.ruleId
  if (typeof ruleId === 'string' && !ctx.hasRule(ruleId)) {
    throw new TrpgError('E_RULE_MISSING', `需要先安装规则『${ruleId}』`, { ruleId })
  }
  const parsed = packFileManifestSchema.safeParse(raw)
  if (!parsed.success) throw badContent(`说明文件的 ${field(parsed.error.issues[0])} 不合法`)
  const manifest = normalizeManifest(parsed.data.pack, formatVersion)
  if (manifest.minAppVersion && compareVersions(manifest.minAppVersion, ctx.appVersion) > 0) {
    throw new TrpgError('E_NEWER_APP', `需要先把扩展更新到 v${manifest.minAppVersion} 才能安装这个内容包`)
  }
  if (manifest.dataVersion > SUPPORTED_DATA_VERSION) {
    throw new TrpgError('E_NEWER_DATA', '这个内容包由更新版本的扩展制作，请先更新扩展')
  }
  assertPackPaths(leafFiles(files), files, formatVersion)
  const entries = readEntries(files)
  if (entries.length !== manifest.entryCount) {
    throw badContent(`条目数量不符（说明为 ${manifest.entryCount}，实际 ${entries.length}）`)
  }
  const typeCounts: Record<string, number> = {}
  for (const e of entries) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1
  const features = formatVersion >= 2 ? readFeatures(files) : []
  const { adventure, fallback } = formatVersion >= 2 ? readAdventure(files) : { adventure: {}, fallback: [] }
  const blobs = readBlobs(files, formatVersion, manifest)
  if (formatVersion <= 1) migrateAssets(files, entries, blobs)
  manifest.blobs = [...blobs.values()].map(({ hash, mime, size }) => ({ hash, mime, size })).sort((a, b) => a.hash.localeCompare(b.hash))
  const contributes = {
    entries: entries.length,
    tables: entries.filter((e) => e.type === 'table').length,
    variants: entries.filter((e) => (e as { override?: unknown }).override !== undefined).length,
    adventures: ((adventure['adventure/adventure.json'] as { adventures?: unknown[] } | undefined)?.adventures ?? []).length,
    ruleOptions: features.filter((f) => f.kind === 'ruleOptions').length,
  }
  assertPackRefs({ manifest, entries, adventure, fallback, blobHashes: new Set(blobs.keys()) })
  return {
    type: 'pack',
    manifest: { ...manifest, typeCounts, contributes },
    entries,
    blobs,
    features,
    adventure,
    fallback,
    byteSize: bytes.length,
    sha256: sha256Hex(bytes),
  }
}

function parseRecords<T>(files: ZipFiles, prefix: string, kind: 'save' | 'workspace', parse: (raw: Record<string, unknown>) => { ok: true; value: T } | { ok: false; detail: string }): T[] {
  const out: T[] = []
  for (const name of Object.keys(files).filter((n) => n.startsWith(prefix) && n.endsWith('.json')).sort()) {
    const raw = readJson(files, name)
    if (!raw || typeof raw !== 'object') throw badContent(`${name} 不是有效的记录`)
    const migrated = migrateRecord(kind, raw as Record<string, unknown>)
    const result = parse(migrated)
    if (!result.ok) throw badContent(`${name} 的 ${result.detail} 不合法`)
    out.push(result.value)
  }
  return out
}

function recognizeSaveFile(files: ZipFiles, manifestRaw: unknown): RecognizedSaveFile {
  const parsed = saveFileManifestSchema.safeParse(manifestRaw)
  if (!parsed.success) throw badContent(`说明文件的 ${field(parsed.error.issues[0])} 不合法`)
  const saves = parseRecords<SaveSlot>(files, 'saves/', 'save', (raw) => {
    const r = saveSlotSchema.safeParse(raw)
    return r.success ? { ok: true, value: r.data } : { ok: false, detail: field(r.error.issues[0]) }
  })
  const workspaces = parseRecords<Workspace>(files, 'workspaces/', 'workspace', (raw) => {
    const r = workspaceSchema.safeParse(raw)
    return r.success ? { ok: true, value: r.data } : { ok: false, detail: field(r.error.issues[0]) }
  })
  let settings: Settings | undefined
  const settingsRaw = readJson(files, 'settings.json')
  if (settingsRaw !== undefined) {
    const r = settingsSchema.safeParse(settingsRaw)
    if (!r.success) throw badContent(`settings.json 的 ${field(r.error.issues[0])} 不合法`)
    settings = r.data
  }
  const listRaw = readJson(files, 'packs.json')
  const packList: PackListItem[] = []
  if (Array.isArray(listRaw)) {
    for (const item of listRaw) {
      const r = packListItemSchema.safeParse(item)
      if (r.success) packList.push(r.data)
    }
  }
  const attachedPacks = new Map<string, Uint8Array>()
  for (const name of leafFiles(files)) if (name.startsWith('packs/') && name.endsWith('.trpgpack')) attachedPacks.set(name, files[name])
  const blobs = new Map<string, Uint8Array>()
  for (const name of leafFiles(files).filter((n) => n.startsWith('blobs/'))) {
    const hash = name.slice('blobs/'.length)
    if (!/^[a-f0-9]{64}$/.test(hash)) throw badContent(`图片「${hash}」的文件名不是哈希`)
    const content = files[name]
    if (sha256Hex(content) !== hash) throw badContent(`图片「${hash.slice(0, 12)}」的哈希不一致`)
    assertImage(hash, content)
    blobs.set(hash, content)
  }
  return { type: parsed.data.format === 'trpg-backup' ? 'backup' : 'save', manifest: parsed.data, saves, workspaces, settings, packList, attachedPacks, blobs }
}

/** 按 U2 §2.3 与 L1 §2.2 的顺序识别与校验文件；第一处失败即抛出带提示文字的错误。 */
export function recognizeFile(bytes: Uint8Array, ctx: RecognizeContext): Recognized {
  const files = readZip(bytes)
  const manifestFile = files['trpg-manifest.json']
  if (!manifestFile) throw new TrpgError('E_NO_MANIFEST', '无法识别：缺少说明文件，可能不是本扩展导出的文件')
  let raw: unknown
  try {
    raw = JSON.parse(strFromU8(manifestFile))
  } catch {
    throw badContent('说明文件无法解析')
  }
  const head = raw as { format?: unknown; formatVersion?: unknown }
  if (head.format !== 'trpg-pack' && head.format !== 'trpg-save' && head.format !== 'trpg-backup') {
    throw new TrpgError('E_UNKNOWN_FORMAT', '无法识别：未知的文件类型')
  }
  if (typeof head.formatVersion !== 'number' || head.formatVersion < 1 || head.formatVersion > FORMAT_VERSION) {
    throw new TrpgError('E_NEWER_FORMAT', '这个文件由更新版本的扩展创建，请先更新扩展')
  }
  const version = Math.max(1, Math.floor(head.formatVersion))
  return head.format === 'trpg-pack' ? recognizePack(files, raw, bytes, ctx, version) : recognizeSaveFile(files, raw)
}

/** 校验下载文件的大小与校验值（U2 §2.3 最后一项）。 */
export function verifyDownload(bytes: Uint8Array, expected: { byteSize: number; sha256: string }): void {
  if (bytes.length !== expected.byteSize || sha256Hex(bytes) !== expected.sha256) {
    throw new TrpgError('E_CHECKSUM', '下载的文件不完整，请重试')
  }
}

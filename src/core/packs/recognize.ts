import { strFromU8 } from 'fflate'
import type { ZodIssue } from 'zod'
import { TrpgError } from '../errors'
import { sha256Hex } from '../hash'
import { migrateRecord } from '../migrate'
import { compareVersions } from '../semver'
import { FORMAT_VERSION } from '../../schemas/common'
import { saveSlotSchema, settingsSchema, workspaceSchema, type SaveSlot, type Settings, type Workspace } from '../../schemas/campaign'
import {
  entrySchema,
  packFileManifestSchema,
  packListItemSchema,
  saveFileManifestSchema,
  type Entry,
  type PackListItem,
  type PackManifest,
  type SaveFileManifest,
} from '../../schemas/pack'
import { readJson, readZip, type ZipFiles } from './zip'

export interface RecognizeContext {
  appVersion: string
  hasRule: (ruleId: string) => boolean
}

export interface RecognizedPack {
  type: 'pack'
  manifest: PackManifest
  entries: Entry[]
  assets: Map<string, Uint8Array>
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
  /** 附带的内容包文件，键为包内路径。 */
  attachedPacks: Map<string, Uint8Array>
}

export type Recognized = RecognizedPack | RecognizedSaveFile

function field(issue: ZodIssue | undefined): string {
  const path = issue?.path.map(String).join('.')
  return path ? path : '整体'
}

function badContent(detail: string): TrpgError {
  return new TrpgError('E_BAD_CONTENT', `文件内容损坏：${detail}`)
}

function readEntries(files: ZipFiles): Entry[] {
  const entries: Entry[] = []
  const names = Object.keys(files).filter((n) => n.startsWith('entries/') && n.endsWith('.json')).sort()
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

function recognizePack(files: ZipFiles, raw: unknown, bytes: Uint8Array, ctx: RecognizeContext): RecognizedPack {
  const ruleId = (raw as { pack?: { ruleId?: unknown } }).pack?.ruleId
  if (typeof ruleId === 'string' && !ctx.hasRule(ruleId)) {
    throw new TrpgError('E_RULE_MISSING', `需要先安装规则『${ruleId}』`, { ruleId })
  }
  const parsed = packFileManifestSchema.safeParse(raw)
  if (!parsed.success) throw badContent(`说明文件的 ${field(parsed.error.issues[0])} 不合法`)
  const manifest = parsed.data.pack
  if (manifest.minAppVersion && compareVersions(manifest.minAppVersion, ctx.appVersion) > 0) {
    throw new TrpgError('E_NEWER_APP', `需要先把扩展更新到 v${manifest.minAppVersion} 才能安装这个内容包`)
  }
  const entries = readEntries(files)
  if (entries.length !== manifest.entryCount) {
    throw badContent(`条目数量不符（说明为 ${manifest.entryCount}，实际 ${entries.length}）`)
  }
  const typeCounts: Record<string, number> = {}
  for (const e of entries) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1
  const assets = new Map<string, Uint8Array>()
  for (const [name, content] of Object.entries(files)) if (name.startsWith('assets/') && !name.endsWith('/')) assets.set(name.slice(7), content)
  return {
    type: 'pack',
    manifest: { ...manifest, typeCounts },
    entries,
    assets,
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
  for (const [name, content] of Object.entries(files)) if (name.startsWith('packs/') && name.endsWith('.trpgpack')) attachedPacks.set(name, content)
  return { type: parsed.data.format === 'trpg-backup' ? 'backup' : 'save', manifest: parsed.data, saves, workspaces, settings, packList, attachedPacks }
}

/** 按 U2 §2.3 的顺序识别与校验文件；第一处失败即抛出带提示文字的错误。 */
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
  if (typeof head.formatVersion !== 'number' || head.formatVersion > FORMAT_VERSION) {
    throw new TrpgError('E_NEWER_FORMAT', '这个文件由更新版本的扩展创建，请先更新扩展')
  }
  return head.format === 'trpg-pack' ? recognizePack(files, raw, bytes, ctx) : recognizeSaveFile(files, raw)
}

/** 校验下载文件的大小与校验值（U2 §2.3 最后一项）。 */
export function verifyDownload(bytes: Uint8Array, expected: { byteSize: number; sha256: string }): void {
  if (bytes.length !== expected.byteSize || sha256Hex(bytes) !== expected.sha256) {
    throw new TrpgError('E_CHECKSUM', '下载的文件不完整，请重试')
  }
}

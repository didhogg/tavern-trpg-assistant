// 读 .trpgsave 存档文件（单个存档或完整备份）：解压、认说明文件、逐条校验存档与当前数据、校验图片。
// 原来和旧扩展包 .trpgpack 共用一个识别器，B2-9 旧格式退役时只留下存档这一半。
import { strFromU8 } from 'fflate'
import { z, type ZodIssue } from 'zod'
import { TrpgError } from '../errors'
import { assertImage } from '../files/images'
import { readJson, readZip, type ZipFiles } from '../files/zip'
import { sha256Hex } from '../hash'
import { migrateRecord } from '../migrate'
import { FORMAT_VERSION } from '../../schemas/common'
import { saveSlotSchema, settingsSchema, workspaceSchema, type SaveSlot, type Settings, type Workspace } from '../../schemas/campaign'

export const saveFileManifestSchema = z.object({
  format: z.enum(['trpg-save', 'trpg-backup']),
  formatVersion: z.number().int().positive(),
  appVersion: z.string(),
  exportedAt: z.string(),
  ruleIds: z.array(z.string()),
  /** 存档引用的作者条目（给"导入时缺的资料"用）；旧文件没有这一项。 */
  dependencies: z.array(z.object({ set: z.string(), prop: z.string(), hash: z.string(), rule: z.string().optional() })).default([]),
  /** 每个存档的规则与数据版本指纹；旧文件没有这一项。 */
  kernelVersions: z.array(z.object({ saveId: z.string(), rule: z.string(), official: z.string(), brews: z.record(z.string(), z.string()) })).default([]),
})
export type SaveFileManifest = z.infer<typeof saveFileManifestSchema>

export interface RecognizedSaveFile {
  type: 'save' | 'backup'
  manifest: SaveFileManifest
  saves: SaveSlot[]
  workspaces: Workspace[]
  settings?: Settings
  blobs: Map<string, Uint8Array>
  /** 完整备份里的【库】文件：brew/…、scopes.json、house-rules.json。 */
  libraryFiles: Record<string, string>
}

function badContent(detail: string): TrpgError {
  return new TrpgError('E_BAD_CONTENT', `文件内容损坏：${detail}`)
}

function field(issue: ZodIssue | undefined): string {
  const path = issue?.path.map(String).join('.')
  return path ? path : '整体'
}

function parseRecords<T>(files: ZipFiles, prefix: string, kind: 'save' | 'workspace', schema: z.ZodType<T>): T[] {
  const out: T[] = []
  for (const name of Object.keys(files).filter((n) => n.startsWith(prefix) && n.endsWith('.json')).sort()) {
    const raw = readJson(files, name)
    if (!raw || typeof raw !== 'object') throw badContent(`${name} 不是有效的记录`)
    const result = schema.safeParse(migrateRecord(kind, raw as Record<string, unknown>))
    if (!result.success) throw badContent(`${name} 的 ${field(result.error.issues[0])} 不合法`)
    out.push(result.data)
  }
  return out
}

/** 识别并校验存档文件；第一处失败即抛出带提示文字的错误。 */
export function readSaveFile(bytes: Uint8Array): RecognizedSaveFile {
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
  if (head.format === 'trpg-pack') throw new TrpgError('E_UNKNOWN_FORMAT', '这是旧版的扩展包文件（.trpgpack），新版已不再使用；自制内容请用【库】导入作者格式的文件')
  if (head.format !== 'trpg-save' && head.format !== 'trpg-backup') throw new TrpgError('E_UNKNOWN_FORMAT', '无法识别：未知的文件类型')
  if (typeof head.formatVersion !== 'number' || head.formatVersion > FORMAT_VERSION) throw new TrpgError('E_NEWER_FORMAT', '这个文件由更新版本的扩展创建，请先更新扩展')
  if (head.formatVersion < 3) throw new TrpgError('E_OLD_DATA', '这是旧版扩展导出的存档（旧扩展包格式），新版不再读取')
  const parsed = saveFileManifestSchema.safeParse(raw)
  if (!parsed.success) throw badContent(`说明文件的 ${field(parsed.error.issues[0])} 不合法`)
  const saves = parseRecords(files, 'saves/', 'save', saveSlotSchema)
  const workspaces = parseRecords(files, 'workspaces/', 'workspace', workspaceSchema)
  let settings: Settings | undefined
  const settingsRaw = readJson(files, 'settings.json')
  if (settingsRaw !== undefined) {
    const r = settingsSchema.safeParse(settingsRaw)
    if (!r.success) throw badContent(`settings.json 的 ${field(r.error.issues[0])} 不合法`)
    settings = r.data
  }
  const blobs = new Map<string, Uint8Array>()
  for (const name of Object.keys(files).filter((n) => n.startsWith('blobs/') && !n.endsWith('/'))) {
    const hash = name.slice('blobs/'.length)
    if (!/^[a-f0-9]{64}$/.test(hash)) throw badContent(`图片「${hash}」的文件名不是哈希`)
    const content = files[name]
    if (sha256Hex(content) !== hash) throw badContent(`图片「${hash.slice(0, 12)}」的哈希不一致`)
    assertImage(hash, content)
    blobs.set(hash, content)
  }
  const libraryFiles: Record<string, string> = {}
  for (const name of Object.keys(files).filter((n) => n.startsWith('library/') && !n.endsWith('/'))) {
    libraryFiles[name.slice('library/'.length)] = strFromU8(files[name])
  }
  return { type: parsed.data.format === 'trpg-backup' ? 'backup' : 'save', manifest: parsed.data, saves, workspaces, settings, blobs, libraryFiles }
}

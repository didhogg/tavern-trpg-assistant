import type { ZodIssue } from 'zod'
import { TrpgError } from '../errors'
import { sha256Hex } from '../hash'
import { packManifestSchema, type PackManifest } from '../../schemas/pack'

export function field(issue: ZodIssue | undefined): string {
  const path = issue?.path.map(String).join('.')
  return path ? path : '整体'
}

/** 没有 lineage 的旧包按 id 生成稳定编号，保证同一文件重复安装不会误判来源。 */
export function stableLineage(id: string): string {
  return sha256Hex(new TextEncoder().encode(`trpg-pack-lineage:${id}`)).slice(0, 32)
}

export function normalizeManifest(raw: Record<string, unknown>, formatVersion: number): PackManifest {
  const value: Record<string, unknown> = { ...raw }
  if (formatVersion <= 1) {
    const kind = value.kind
    value.category = kind === 'module' ? 'adventure' : 'rules'
    const dependsOn = Array.isArray(value.dependsOn) ? value.dependsOn : []
    value.relationships = { requires: dependsOn, recommends: [], conflicts: [] }
    delete value.kind
    delete value.dependsOn
  }
  if (typeof value.lineage !== 'string' || !value.lineage) value.lineage = stableLineage(String(value.id))
  value.blobs = Array.isArray(value.blobs) ? value.blobs : []
  value.contributes = value.contributes ?? {}
  value.relationships = value.relationships ?? { requires: [], recommends: [], conflicts: [] }
  value.dataVersion = value.dataVersion ?? 1
  const parsed = packManifestSchema.safeParse(value)
  if (!parsed.success) throw new TrpgError('E_BAD_CONTENT', `文件内容损坏：说明文件的 ${field(parsed.error.issues[0])} 不合法`)
  return parsed.data
}

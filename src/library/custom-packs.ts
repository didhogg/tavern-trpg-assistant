// P5.5 B3 自己的包：一个包 = 作者可编辑自制里的一个来源（_meta.sources 一行），不另造格式。
// 建包、列包、条目换包、按包导出。换包 = 改来源 → 作者编号变 → 走 custom 的保存（改指 _copy、搬插件记录、记一步撤销）。
// 换包前的影响清单（战役记录、存档里的引用）由 backend.entryChangeImpact 给（core/removal-impact.ts impactOfEntries）。
import type { AuthorFrame } from './runtime/host'
import type { ManageStore } from './manage'
import { BUILTIN_SCOPES, ruleScopes, sourceUnit } from './scopes'

export interface PackSource {
  json: string
  full: string
  abbreviation: string
}

export interface PackDeps {
  /** 当前版本的作者小窗（只读用）。 */
  frame: (codeSet: string) => Promise<AuthorFrame>
  /** 在一次"准备 → 发布"里改作者内容（同 LibraryService.mutateAuthor）。 */
  mutate: <T>(codeSet: string, kind: string, run: (f: AuthorFrame) => Promise<T>) => Promise<{ value: T }>
  manage: ManageStore
  /** custom 的保存（记撤销、处理改名）。 */
  save: (codeSet: string, prop: string, ent: Record<string, unknown>) => Promise<{ uniqueId: string; hash: string | null; renamed: unknown }>
}

/** 来源编号：作者编号 = 名字 + 来源，用 | 拼；只允许不会和这个分隔冲突的字符。 */
const SOURCE_JSON = /^[A-Za-z0-9_-]+$/

/** 建一个自己的包。rule：按这套规则的默认范围给包打版本标签（之后可改）。 */
export async function createPack(d: PackDeps, codeSet: string, src: PackSource, { rule }: { rule?: string } = {}): Promise<PackSource> {
  const json = src.json.trim()
  if (!SOURCE_JSON.test(json)) throw new Error('包的编号只能用英文字母、数字、下划线和短横线')
  if (!src.full.trim()) throw new Error('包要有名字')
  if (await (await d.frame(codeSet)).call('sourceTaken', json)) throw new Error(`编号 ${json} 已经有书或包在用了，换一个`)
  const made = { json, full: src.full.trim(), abbreviation: (src.abbreviation || json).trim() }
  await d.mutate(codeSet, 'custom-pack', (f) => f.call('editableEnsureSource', made))
  if (rule) await d.manage.setAssignment(sourceUnit(json), { scopes: [...ruleScopes(rule).defaultScopes], global: false })
  return made
}

/** 列出可编辑自制里的包：来源 + 每类几条。 */
export async function listPacks(d: PackDeps, codeSet: string): Promise<Array<PackSource & { counts: Record<string, number>; total: number }>> {
  const doc = await (await d.frame(codeSet)).call('editableDoc')
  const sources = (doc.body?._meta?.sources ?? []) as PackSource[]
  return sources.map((s) => {
    const counts: Record<string, number> = {}
    for (const [prop, list] of Object.entries(doc.body ?? {})) {
      if (prop.startsWith('_') || !Array.isArray(list)) continue
      const n = (list as Array<{ source?: string }>).filter((e) => String(e?.source ?? '').toLowerCase() === s.json.toLowerCase()).length
      if (n) counts[prop] = n
    }
    return { json: s.json, full: s.full, abbreviation: s.abbreviation, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) }
  })
}

/** 条目换包：按 uniqueId 取原文，改来源后保存（编号跟着变，custom 的保存负责改指和搬记录，并记一步撤销）。 */
export async function moveEntries(d: PackDeps, codeSet: string, prop: string, uniqueIds: string[], toSource: string) {
  const doc = await (await d.frame(codeSet)).call('editableDoc')
  if (!(doc.body?._meta?.sources ?? []).some((s: PackSource) => s.json.toLowerCase() === toSource.toLowerCase())) throw new Error(`没有这个包：${toSource}`)
  const list = (doc.body?.[prop] ?? []) as Array<Record<string, unknown>>
  const out = []
  for (const id of uniqueIds) {
    const ent = list.find((e) => e.uniqueId === id)
    if (!ent) throw new Error(`找不到这一条：${id}`)
    if (String(ent.source).toLowerCase() === toSource.toLowerCase()) continue
    out.push(await d.save(codeSet, prop, { ...ent, source: toSource }))
  }
  return out
}

/** 包的版本标签 → 导出时包头的 edition：归在只带一种版本的范围里就用它；没归类或混着的用作者默认（classic，作者结构定义要求必填）。 */
async function editionOfPack(d: PackDeps, json: string): Promise<'classic' | 'one'> {
  const a = (await d.manage.assignments()).get(sourceUnit(json))
  const eds = new Set((a?.scopes ?? []).map((id) => BUILTIN_SCOPES.find((s) => s.id === id)?.edition).filter(Boolean))
  return eds.size === 1 ? [...eds][0] as 'classic' | 'one' : 'classic'
}

/** 按包导出（作者格式文件：文件名 + 内容）。 */
export async function exportPack(d: PackDeps, codeSet: string, json: string): Promise<{ filename: string; body: unknown }> {
  return (await d.frame(codeSet)).call('editableExport', json, await editionOfPack(d, json))
}

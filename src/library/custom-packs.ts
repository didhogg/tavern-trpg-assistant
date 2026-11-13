// P5.5 B8 【我的库】的包 = 作者的一个独立自制包（不再是可编辑自制里的一个来源；可编辑自制只放房规）。
// 包的身份 = 作者认包的「来源编号组合」（utils-brew-base.js _getBrewId；插件 versions.ts packStableId），改显示名不变。
// 包里的「自己的来源」= 包头最后一行来源：自己建的包只有这一行；复制件是「原来源 + 复制件自己的一行」（B8-3）。
// 建包 = 作者导入一个只有包头的文件；改 / 删条目在 custom-entries.ts（小窗 pack-commands.ts，作者 pUpdateBrew）。
import type { BrewPack, SourceInfo } from './brew-packs'
import type { ManageStore } from './manage'
import type { AuthorFrame } from './runtime/host'
import { BUILTIN_SCOPES, ruleScopes, sourceUnit } from './scopes'
import type { LibraryService } from './service'
import type { LibraryView } from './revision'
import { SOURCES } from './sources'
import { packStableId } from './versions'

export interface PackSource {
  json: string
  full: string
  abbreviation: string
}

export interface PackDeps {
  lib: Pick<LibraryService, 'frameOf' | 'brewImport' | 'brewDelete' | 'mutateAuthor'>
  manage: ManageStore
  /** 这套自制里已装的包（BrewPacks.list）。 */
  packsOf: (brewSetId: string, view?: LibraryView) => Promise<BrewPack[]>
}

/** 【我的库】里的一个包。 */
export interface MyPack extends BrewPack {
  /** 包的身份（来源编号组合，小写排序后连起来）。 */
  id: string
  /** 包自己的来源（包头最后一行）：显示名、版本标签都挂在它上面。 */
  own: SourceInfo
  /** 版本标签（自己的来源归在哪些范围；没归类为空）。 */
  scopes: string[]
}

/** 来源编号：作者编号 = 名字 + 来源，用 | 拼；只允许不会和这个分隔冲突的字符。 */
const SOURCE_JSON = /^[A-Za-z0-9_-]+$/

const brewSetOf = (codeSet: string) => {
  const s = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)
  if (!s) throw new Error(`作者程序 ${codeSet} 没有登记自制数据集`)
  return s
}

/** 【我的库】里的包：作者自制里本地导入的那些（不是下载的、不是可编辑自制）。 */
export async function listPacks(d: PackDeps, codeSet: string, view?: LibraryView): Promise<MyPack[]> {
  const assigns = await d.manage.assignments()
  return (await d.packsOf(brewSetOf(codeSet).id, view))
    .filter((p) => p.origin === 'import' && p.sourceInfo.length)
    .map((p) => {
      const own = p.sourceInfo[p.sourceInfo.length - 1]
      return { ...p, id: packStableId({ sources: p.sources }) ?? p.docIdLocal, own, scopes: [...(assigns.get(sourceUnit(own.json))?.scopes ?? [])] }
    })
}

/** 按包的身份找它在作者存储里的本地编号（小窗给哪个版本就在哪个版本里找）。 */
export async function docIdOf(frame: AuthorFrame, id: string): Promise<string> {
  const doc = (await frame.call('brewDocIndex')).find((x) => !x.isEditable && !x.url && (packStableId({ sources: x.sources }) ?? x.docIdLocal) === id)
  if (!doc) throw new Error(`【我的库】里没有这个包：${id}`)
  return doc.docIdLocal
}

/** 建一个空包（作者导入一个只有包头的文件）。rule：按这套规则打版本标签、包头写作者版本风格（之后可在包的管理里改）。 */
export async function createPack(d: PackDeps, codeSet: string, src: PackSource, { rule }: { rule?: string } = {}): Promise<PackSource & { id: string }> {
  const json = src.json.trim()
  if (!SOURCE_JSON.test(json)) throw new Error('包的编号只能用英文字母、数字、下划线和短横线')
  if (!src.full.trim()) throw new Error('包要有名字')
  if (await (await d.lib.frameOf(codeSet)).call('sourceTaken', json)) throw new Error(`编号 ${json} 已经有书或包在用了，换一个`)
  const made = { json, full: src.full.trim(), abbreviation: (src.abbreviation || json).trim() }
  const ts = Math.round(Date.now() / 1000)
  const body = { _meta: { sources: [{ ...made, authors: [], version: '1' }], dateAdded: ts, dateLastModified: ts, ...(rule ? { edition: ruleScopes(rule).style } : {}) } }
  const r = await d.lib.brewImport(brewSetOf(codeSet).id, [{ name: `${json}.json`, text: JSON.stringify(body) }])
  if (!r.ok) throw new Error(`作者没有收下这个包：${r.errors.join('；')}`)
  if (rule) await d.manage.setAssignment(sourceUnit(json), { scopes: [...ruleScopes(rule).defaultScopes], global: false })
  return { ...made, id: packStableId({ sources: [json] })! }
}

/** 改包的显示名 / 缩写（来源编号不变，包的身份不变）。 */
export async function renamePack(d: PackDeps, codeSet: string, id: string, patch: { full?: string; abbreviation?: string }): Promise<void> {
  const pack = (await listPacks(d, codeSet)).find((p) => p.id === id)
  if (!pack) throw new Error(`【我的库】里没有这个包：${id}`)
  await d.lib.mutateAuthor(codeSet, 'custom-pack-rename', async (view) => {
    const f = await d.lib.frameOf(codeSet, view)
    await f.call('packRenameSource', await docIdOf(f, id), pack.own.json, patch)
  })
}

/** 包的版本标签 → 导出时包头的 edition：归在只带一种版本的范围里就用它；否则用包头原来写的（没有就不写）。 */
function editionOfPack(pack: MyPack): 'classic' | 'one' | undefined {
  const eds = new Set(pack.scopes.map((id) => BUILTIN_SCOPES.find((s) => s.id === id)?.edition).filter(Boolean))
  return eds.size === 1 ? [...eds][0] as 'classic' | 'one' : undefined
}

/** 按包导出（作者格式文件：文件名 + 内容；去掉 uniqueId 等运行时字段）。 */
export async function exportPack(d: PackDeps, codeSet: string, id: string): Promise<{ filename: string; body: unknown }> {
  const pack = (await listPacks(d, codeSet)).find((p) => p.id === id)
  if (!pack) throw new Error(`【我的库】里没有这个包：${id}`)
  return (await d.lib.frameOf(codeSet)).call('packExport', pack.docIdLocal, editionOfPack(pack))
}

/** 删包（作者删包；先用卸载影响页看谁用了它）。 */
export async function deletePack(d: PackDeps, codeSet: string, id: string) {
  const pack = (await listPacks(d, codeSet)).find((p) => p.id === id)
  if (!pack) throw new Error(`【我的库】里没有这个包：${id}`)
  return d.lib.brewDelete(brewSetOf(codeSet).id, [pack.docIdLocal])
}

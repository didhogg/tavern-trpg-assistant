// T1：结算内核只有这一条换算入口。作者的 ChooseImporter 按 prop 返回导入器并自己 pInit，
// 再交回第一条导入文档；种族/职业/子职业/专长/物品/法术/怪物/载具/物件等都走这里。
// 种子按“条目自己的标识”设：类别 + 来源 + 名字 + 内容摘要。作者导入器第一次初始化会消耗随机数，
// 所以在 importer 初始化之后、真正导入之前设种子；同一条目无论在哪个小窗、排第几个换算，结果都一样。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者条目和 dnd5e 文档没有类型声明。 */
import { reseedKernel, entrySeed } from './seed'

const g = globalThis as any

/** Plutonium 生成通用成长时只有拿到这些“已选”项才会生成完整成长；一律给空数组 = 玩家还没选。 */
const UNCHOSEN_PROFICIENCIES: Record<string, string[]> = {
  skillsChosenFvtt: [],
  languagesChosenFvtt: [],
  armorProficienciesChosenFvtt: [],
  weaponProficienciesChosenFvtt: [],
  toolProficienciesChosenFvtt: [],
}

export async function importEntry(prop: string, entry: any): Promise<any> {
  const api = g.game.modules.get('plutonium')?.api
  if (!api?.importer) throw Error('Plutonium importer is not available')
  const importer = await api.importer.pGetImporter({ prop })
  if (!importer) throw Error(`No Plutonium importer for ${prop}`)
  reseedKernel(entrySeed(prop, entry))
  const opts = new api.importer.ImportOpts({ isTemp: true })
  const summary = prop === 'class' && importer.pImportEntryClass
    ? await importer.pImportEntryClass(entry, opts)
    : await importer.pImportEntry(entry, opts, structuredClone(UNCHOSEN_PROFICIENCIES))
  const doc = summary?.imported?.[0]?.document ?? null
  if (!doc) throw Error(`Plutonium import failed for ${entry?.name ?? prop}`)
  return doc.toObject ? doc.toObject() : doc
}

/** 同一入口的交回数据版本：T2 预计算、T4 加条目、T5 批量建都用它。 */
export async function importEntryData(prop: string, entry: any): Promise<any> {
  return importEntry(prop, entry)
}

/** 给 T2 发现作者登记表里真的有导入器的类别；不写类别清单。文件夹类型也由作者导入器自己说明。 */
export async function importerProps(props: string[]): Promise<string[]> {
  return (await importerMeta(props)).map((row) => row.prop)
}

export async function importerMeta(props: string[]): Promise<Array<{ prop: string; folderType: string | null }>> {
  const api = g.game.modules.get('plutonium')?.api
  if (!api?.importer) throw Error('Plutonium importer is not available')
  const out: Array<{ prop: string; folderType: string | null }> = []
  for (const prop of props) {
    try {
      const importer = await api.importer.pGetImporter({ prop })
      if (importer) out.push({ prop, folderType: importer.constructor?.FOLDER_TYPE ?? importer.FOLDER_TYPE ?? null })
    } catch {
      // 作者登记表里没有这一类，交给调用方跳过。
    }
  }
  return out
}

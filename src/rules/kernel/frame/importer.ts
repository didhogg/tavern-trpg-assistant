// T1：结算内核只有这一条换算入口。作者的 ChooseImporter 按 prop 返回导入器并自己 pInit，
// 再交回第一条导入文档；种族/职业/子职业/专长/物品/法术/怪物/载具/物件等都走这里。
// 编号只由条目本身决定（设计 §3.1 同输入同结果；P3-3b 编号要稳定）。换算开始时小窗状态各不相同（哪些资料包已加载、
// 导入器有没有初始化），加载时会取随机数、把编号整体挪位。所以两条规则：
//   1. 资料包加载进小窗时，补出的编号只由“哪个资料包、怎么取”决定（isolatePackLoads）；
//   2. 每条先预跑一次让它要用的缓存就绪，再按条目种子（类别 + 来源 + 名字 + 内容摘要）正式换（importEntry）。
// 验证：tests/e2e/library/kernel-determinism.mjs（每类自动抽样，正序 / 倒序 / 缓存结果逐条相同）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者条目和 dnd5e 文档没有类型声明。 */
import { reseedKernel, entrySeed } from './seed'
import { withSeed } from './random'

const g = globalThis as any

/** Plutonium 生成通用成长时只有拿到这些“已选”项才会生成完整成长；一律给空数组 = 玩家还没选。 */
const UNCHOSEN_PROFICIENCIES: Record<string, string[]> = {
  skillsChosenFvtt: [],
  languagesChosenFvtt: [],
  armorProficienciesChosenFvtt: [],
  weaponProficienciesChosenFvtt: [],
  toolProficienciesChosenFvtt: [],
}

/**
 * 资料包第一次实例化文档时，dnd5e 会给缺编号的子项（效果里的改动等）补编号，Plutonium 换算时会抄进结果；
 * 补出来的编号原本取决于“哪条条目第一个触发加载”。只包一层 Foundry 官方 CompendiumCollection 的取文档方法，不改作者 / 官方文件。
 */
function isolatePackLoads(): void {
  const C = g.foundry?.documents?.collections?.CompendiumCollection
  if (!C?.prototype || C.prototype.getDocuments.__seeded) return
  for (const name of ['getDocuments', 'getDocument']) {
    const original = C.prototype[name]
    const wrapped = function (this: any, ...args: unknown[]) {
      return withSeed(`pack:${this.collection}:${name}:${JSON.stringify(args)}`, () => original.apply(this, args))
    }
    wrapped.__seeded = true
    C.prototype[name] = wrapped
  }
}

export async function importEntry(prop: string, entry: any): Promise<any> {
  isolatePackLoads()
  const api = g.game.modules.get('plutonium')?.api
  if (!api?.importer) throw Error('Plutonium importer is not available')
  const importer = await api.importer.pGetImporter({ prop })
  if (!importer) throw Error(`No Plutonium importer for ${prop}`)
  const once = async (): Promise<any> => {
    const ent = structuredClone(entry)
    const opts = new api.importer.ImportOpts({ isTemp: true })
    const summary = prop === 'class' && importer.pImportEntryClass
      ? await importer.pImportEntryClass(ent, opts)
      : await importer.pImportEntry(ent, opts, structuredClone(UNCHOSEN_PROFICIENCIES))
    const doc = summary?.imported?.[0]?.document ?? null
    if (!doc) throw Error(`Plutonium import failed for ${entry?.name ?? prop}`)
    return doc.toObject ? doc.toObject() : doc
  }
  // 预跑：只为让这条要用的缓存（导入器初始化、懒加载数据）就绪，结果丢掉
  reseedKernel(entrySeed(prop, entry))
  await once()
  reseedKernel(entrySeed(prop, entry))
  return once()
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

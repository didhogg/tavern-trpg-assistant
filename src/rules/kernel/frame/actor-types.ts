// P5.6 卡型：结算内核能建出哪几种人物（不写类型清单）。
// - 声明：规则系统自己在 system.json documentTypes.Actor 里登记的人物类型，名字用规则系统自己的语言文件（TYPES.Actor.*）；
// - 路线 a：人物存放类别（规则数据 people，11-02 定为怪物属性块）的条目交作者导入器（Plutonium pGetImporter）换出来的类型；
// - 路线 b：分步建卡命令（commands-level.ts buildActor / buildSteps）建出的类型，就登记在那条命令旁边（BUILD_ACTOR_TYPE）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { importEntry, importerMeta } from './importer'

const g = globalThis as any

/** 分步建卡（种族 / 职业 / 背景 → 空白人物）建出的人物类型；buildActor、buildSteps 都用它。 */
export const BUILD_ACTOR_TYPE = 'character'

export interface ActorTypesResult {
  /** 规则系统声明的人物类型（顺序照 system.json）与规则系统语言文件里的名字。 */
  declared: Array<{ type: string; label: string }>
  /** 人物存放类别的条目换出来的类型（作者导入器决定）；没有导入器 / 不是人物 = []。 */
  fromStore: string[]
  /** 分步建卡建出的类型。 */
  build: string
}

export async function actorTypes(storeProp: string, samples: any[]): Promise<ActorTypesResult> {
  const types = Object.keys(g.game.system?.documentTypes?.Actor ?? {})
  const label = (t: string): string => {
    const key = g.CONFIG?.Actor?.typeLabels?.[t] ?? `TYPES.Actor.${t}`
    return g.game.i18n?.localize?.(key) ?? t
  }
  const meta = await importerMeta([storeProp])
  const fromStore = new Set<string>()
  if (meta.some((m) => m.folderType === 'Actor')) {
    for (const entry of samples) {
      const doc = await importEntry(storeProp, entry)
      if (typeof doc?.type === 'string') fromStore.add(doc.type)
    }
  }
  return { declared: types.map((type) => ({ type, label: label(type) })), fromStore: [...fromStore], build: BUILD_ACTOR_TYPE }
}

// 特征单元的选项（驾驶员 11-25：全部条目数据从用户库里开着的全局数据包取，没有例外）。
//   体型 / 生物类型 / 速度种类 / 阵营：本战役资料集的作者格式表（库编辑器下拉用的同一份，backend.library.custom.fields），
//     中文名是格式表经公共取字出口给的（作者中文版的对照）；
//   感官：本战役【库】里开着的包的感官条目（和资料库页同一个查询 scoped.query），条目名就是显示名，点了看资料。
// 只取数，不改人物；写进人物的换算由后端读数给（sheet.traits）。
import { shallowRef } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { addProp, peopleProp, sensesProp } from '../../rules/kernel/card-types'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'

export interface Choice { value: string; label: string }
/** 一条库里的感官：key = 人物上对应的感官种类（作者：5etools 感官名和 dnd5e 感官键一致），对不上 = null（写进特殊感官）。 */
export interface SenseChoice { name: string; english: string; ref: EntryRef }
export interface TraitOptions { sizes: Choice[]; types: Choice[]; speeds: Choice[]; align: Record<string, string>; senses: SenseChoice[] }

type Shape = { c?: string; enum?: unknown[]; suggest?: unknown[]; labels?: Record<string, string>; of?: Shape; branches?: Array<{ shape: Shape }>; props?: Array<{ name: string; shape: Shape }>; ref?: string }
const choices = (s: Shape | undefined): Choice[] => {
  const values = (s?.enum ?? s?.suggest ?? []).filter((v): v is string => typeof v === 'string')
  return values.map((v) => ({ value: v, label: s?.labels?.[v] ?? v }))
}
/** 选项清单在作者格式里的位置（格式表的写法，不是名单）：一层层往下找第一处有选项的。 */
function firstList(s: Shape | undefined, depth = 0): Shape | undefined {
  if (!s || depth > 6) return undefined
  if ((s.enum?.length || s.suggest?.length) && s.labels) return s
  for (const b of s.branches ?? []) { const hit = firstList(b.shape, depth + 1); if (hit) return hit }
  if (s.of) return firstList(s.of, depth + 1)
  return undefined
}

export function useTraitOptions() {
  const app = useAppStore()
  const campaign = useCampaignStore()
  const options = shallowRef<TraitOptions | null>(null)
  const error = shallowRef<string | null>(null)
  async function load(): Promise<void> {
    try {
      const key = campaign.owner?.ownerKey
      if (!key) throw new Error('还没有当前战役')
      const svc = app.svc().backend
      const library = await svc.kernelSave.libraryOf(key)
      const raceProp = addProp(library.rule, 'races'), monsterProp = peopleProp(library.rule), senseProp = sensesProp(library.rule)
      const [race, monster, senseRows] = await Promise.all([
        raceProp ? svc.library.custom.fields(library.codeSet, raceProp) : null,
        monsterProp ? svc.library.custom.fields(library.codeSet, monsterProp) : null,
        senseProp ? svc.library.scoped.query(library, senseProp) : [],
      ])
      const field = (name: string) => race?.fields.find((f) => f.name === name)?.shape as Shape | undefined
      // 速度：种族格式里「速度」那一组的「从哪几种里选」= 作者列的速度种类
      const speedDef = (field('speed')?.ref ? race?.defs[field('speed')!.ref!] : field('speed')) as Shape | undefined
      const speedGroup = speedDef?.branches?.map((b) => b.shape).find((x) => x.props?.some((p) => p.name === 'choose'))
      const speedFrom = speedGroup?.props?.find((p) => p.name === 'choose')?.shape.props?.find((p) => p.name === 'from')?.shape
      // 阵营：怪物格式里阵营一项的代号（守序 / 中立 / 混乱 / 善良 / 邪恶 / 无阵营 …）
      const alignField = monster?.fields.find((f) => f.name === 'alignment')?.shape as Shape | undefined
      const alignShape = firstList(alignField?.of?.ref ? monster?.defs[alignField.of.ref] as Shape : alignField)
      options.value = {
        sizes: choices(field('size')),
        types: choices(firstList(field('creatureTypes'))),
        speeds: choices(speedFrom),
        align: Object.fromEntries(choices(alignShape).map((c) => [c.value, c.label])),
        senses: (senseRows as Array<{ item: unknown; ref: EntryRef }>).map((row) => {
          const item = row.item as { name?: unknown; ENG_name?: unknown }
          const name = String(item.name ?? '')
          return { name, english: String(item.ENG_name ?? item.name ?? ''), ref: row.ref }
        }).sort((a, b) => a.name.localeCompare(b.name, 'zh')),
      }
    } catch (e) { console.error('[trpg-assistant] 特征选项没读出来', e); error.value = e instanceof Error ? e.message : String(e) }
  }
  void load()
  return { options, error }
}

// Keep the author's plans separate. For each candidate, use the author's form and apply path,
// then read the native dnd5e key off the temporary actor.
/* eslint-disable @typescript-eslint/no-explicit-any -- upstream runtime objects */
import type { KernelRefFlags } from '../../../core/saves/split'
import { named, valueText, type FrameText } from '../shown'
import { proficiencyNames } from './proficiency-text'
import { systemText } from './system-text'
type Api = Record<string, any>
type Cleanup = Array<() => void>
/** text 保留作者编号或规则代码，数值仍由作者的选择和写入接口决定。 */
type Option = { label: string; text?: FrameText; select: () => void; clear: () => void }
/** 存不进原生进阶的候选：名字 + 作者编号（是物品时）。 */
export type Withheld = { label: string; text?: FrameText }
type Slot = { count: number; hints?: string[]; options: Option[] }
export type NativeSlot = { count: number; pool: string[] }
interface Plan {
  index: number
  extended: boolean
  mode: 'default' | 'expertise' | 'forcedExpertise'
  grants: string[]
  choices: NativeSlot[]
  hints: string[]
  withheld: Withheld[]
  names: Map<string, FrameText>
}
const g = globalThis as any

function setOption(component: any, key: string, value: any, label: string, text?: FrameText): Option {
  const previous = component._state[key]
  return { label, ...(text ? { text } : {}), select: () => { component._state[key] = value }, clear: () => { component._state[key] = previous } }
}
/** 作者物品 → 作者编号（与 Plutonium 写进物品 flags 同形）。 */
const itemId = (entity: { name: string; source: string }): KernelRefFlags => ({ propDroppable: 'item', source: entity.source, hash: g.UrlUtil.URL_TO_HASH_BUILDER[g.UrlUtil.PG_ITEMS](entity) })

function proficiencySlots(api: Api, component: any, set: any, cleanup: Cleanup, scope?: Set<string>): Slot[] {
  return (set.choose ?? []).map((slot: any, ixChoose: number) => {
    if (slot.fromFilter) {
      const { propState } = component._getPropsChooseFromFilter({ ixChoose, ixCount: 0 })
      const from = component._modalFilterItemsFvtt.getEntitiesMatchingFilterExpression({ filterExpression: slot.fromFilter })
      return { count: slot.count, options: from.filter((entry: any) => !scope || scope.has(`${entry.name}|${entry.source}`.toLowerCase())).map((entry: any) => setOption(component, propState, { prop: slot.prop, name: g.DataUtil.generic.getUid(entry) }, entry.name, named(entry.name, itemId(entry), true))) }
    }
    const { propState } = component._getPropsChooseFrom({ ixChoose })
    const grouped = component._getChooseFromGroupMeta(slot)
    const meta = api.ComponentUiUtil.getMetaWrpMultipleChoice(component, propState, {
      count: slot.count, ...(grouped?.valueGroups ? { valueGroups: grouped.valueGroups } : { values: slot.from }),
      fnDisplay: () => '',
    })
    cleanup.push(meta.cleanup)
    const list = grouped?.valueGroupsFlat ?? slot.from
    const names = proficiencyNames(api, component._availableProficiencyManager, list)
    return {
      count: slot.count, hints: grouped?.valueGroups?.map((row: any) => row.text).filter(Boolean),
      options: meta.rowMetas.map((row: any, i: number) => setOption(component, row.propIsActive, true, list[i]?.name ?? String(i + 1), names[i])),
    }
  })
}

function expertiseSlots(api: Api, component: any, set: any, cleanup: Cleanup): Slot[] {
  component._stgGroup = api.veE(document.createElement('div'))
  const slots: Slot[] = []
  component._render_renderPtChooseAnyProficient = ({ profSet, propProfSet, propIxProps, fnGetValues }: any) => {
    const key = component._getProps(propProfSet, 0)[propIxProps]
    const options = fnGetValues().map((name: string) => setOption(component, key, name, name))
    slots.push({ count: Number(profSet[propProfSet] || 1), options })
  }
  component._hk_ixSet_renderPts(set)
  cleanup.push(() => component._lastMeta.cleanup())
  return slots
}

function resistanceSlots(api: Api, component: any): Slot[] | null {
  component.render(api.veE(document.createElement('div')))
  const nodes = component._lastChoiceMeta.children.filter((node: any) => node.children)
  if (nodes.some((node: any) => !node.children.every((option: any) => option.isChoosable))) return null
  const update = () => { component._state.readonly_selectedValues = component._getOutputObject() }
  update()
  return nodes.map((node: any) => ({
    count: node.count,
    options: node.children.map((option: any) => ({
      label: String(option.name ?? ''), select: () => { option.setActive(true); update() },
      clear: () => { option.setActive(false); update() },
    })),
  }))
}

async function authorKeys(api: Api, actor: any, group: any, rank: number) {
  const update = {}
  const form = await group._subComps[0].pGetFormData()
  await api.Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(actor, update, { data: { [group._propFormDatas]: [form] } })
  const trait = g.dnd5e.documents.Trait
  const paths = Object.keys(g.CONFIG.DND5E.traits).filter((type) => g.foundry.utils.hasProperty(update, trait.actorKeyPath(type)))
  const changed = actor.clone(update)
  const keys = new Set<string>()
  const notes: Withheld[] = []
  for (const type of paths) {
    const path = trait.actorKeyPath(type)
    const custom = g.foundry.utils.getProperty(update, path)?.custom
    if (custom) notes.push({ label: String(custom), text: systemText(String(custom)) })
    const before = await trait.actorValues(actor, type)
    const after = await trait.actorValues(changed, type)
    for (const [key, value] of Object.entries(after)) if (value === rank && before[key] !== rank) keys.add(key)
  }
  return { keys, notes }
}

async function nativePlan(api: Api, actor: any, group: any, slots: Slot[], index: number, extended: boolean, expertise: boolean): Promise<Plan> {
  const rank = expertise ? 2 : 1
  const fixed = await authorKeys(api, actor, group, rank)
  const choices: NativeSlot[] = []
  const withheld = [...fixed.notes]
  const names = new Map<string, FrameText>()
  for (const slot of slots) {
    const pool = new Set<string>()
    for (const option of slot.options) {
      const text = option.text ?? valueText(option.label, slot.options.map(row => row.label), systemText(option.label))
      option.select()
      try {
        const result = await authorKeys(api, actor, group, rank)
        const gained = [...result.keys].filter(key => !fixed.keys.has(key))
        if (gained.length === 1) {
          const key = gained[0]
          pool.add(key)
          const prev = names.get(key)
          names.set(key, prev?.$t === 'name' && text.$t === 'name' ? named(option.label, [...prev.ids, ...text.ids], true) : text)
        }
        else if (option.label) withheld.push({ label: option.label, text })
      } finally { option.clear() }
    }
    if (pool.size >= slot.count || (expertise && !slot.options.length)) choices.push({ count: slot.count, pool: [...pool].sort() })
    else if (slot.options.length) withheld.push(...slot.options.filter(option => option.label).map(option => ({ label: option.label, text: option.text ?? valueText(option.label, slot.options.map(row => row.label), systemText(option.label)) })))
  }
  return { index, extended, mode: expertise ? (fixed.keys.size ? 'forcedExpertise' : 'expertise') : 'default',
    grants: [...fixed.keys].sort(), choices, names, hints: [...new Set(slots.flatMap(slot => slot.hints ?? []))], withheld }
}

export async function readTraitPlans(api: Api, blank: any, group: any, current: any, visible?: Set<string>): Promise<Plan[]> {
  const component = group._subComps[0]
  if (component instanceof api.Charactermancer_ImmResVulnSelect) {
    const slots = resistanceSlots(api, component)
    return slots ? [await nativePlan(api, blank, group, slots, 0, false, false)] : []
  }
  const expertise = component instanceof api.Charactermancer_ExpertiseSelect
  if (!expertise && !(component instanceof api.Charactermancer_OtherProficiencySelect)) return []
  const actor = expertise && current ? current : blank
  if (expertise) component._existingFvtt = component.constructor.getExistingFvttFromActor(actor)
  const result: Plan[] = []
  const sets = component._available
  const extended = expertise || sets.length > 1 || sets.some((set: any) => set.all?.length || set.choose?.some?.((slot: any) => slot.fromFilter))
  for (const [index, set] of sets.entries()) {
    component._state.ixSet = index
    if (!expertise && (set.all?.length || set.choose?.some((slot: any) => slot.fromFilter))) await component.pNotRender()
    const scope: Cleanup = []
    try {
      const slots = expertise ? expertiseSlots(api, component, set, scope) : proficiencySlots(api, component, set, scope, visible)
      result.push(await nativePlan(api, actor, group, slots, index, extended, expertise))
    } finally { for (const remove of scope) remove() }
  }
  return result
}

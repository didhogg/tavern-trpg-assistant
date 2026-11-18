// P6：作者组件计算固定给予和选择；dnd5e 回读自己的编号，再按原生 Trait 进阶存取。
// 这里的计算是旁路（渲染作者组件、建临时人物会抽随机数），一律在旁路随机序列上跑（random.ts withSeed，与读资料包同一规则）：
// 建卡一定跑、冷读档不一定跑，若占用主序列，同一人物重建后物品编号会错开。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者组件和官方文档没有类型声明 */
import { systemText } from './system-text'
import { hashValue } from '../../../core/hash'
import { plutoniumBuild } from './plutonium-build'
import { BUILD_ACTOR_TYPE } from './actor-types'
import { withSeed } from './random'
import { groupTitle, titleOfKeys } from './trait-title'
import { readTraitPlans, type NativeSlot } from './trait-plans'
import { traitOrigins } from './trait-origins'
import { authorTextPath } from './author-text'
import { fromAuthor, joined, plugin, type FrameText } from '../shown'

const g = globalThis as any
const PREFIX = 'P6Tr'
export const isBuildTrait = (id: unknown): boolean => typeof id === 'string' && /^P6Tr[0-9a-f]{12}$/.test(id)
const idOf = (...parts: unknown[]): string => PREFIX + hashValue(parts).slice(0, 12)

type KeySet = Set<string>
export type TraitPlanChoice = { id: string; label: FrameText }
export type TraitPlans = Map<string, { choices: TraitPlanChoice[]; names: Map<string, FrameText> }>
export type ExpertiseViews = Map<string, any>
type ActorTraits = {
  actor?: any; plans?: TraitPlans; picks?: Array<{ id: string; value: any }>
  previous?: Array<{ id: string; data: any }>; replay?: string[]; scope?: Set<string>; expertise?: ExpertiseViews
}

/** 把固定给予与可选位置分开校验。一个已选条目只能占一个位置。 */
export function checkedBuildTrait(adv: any, value: any): Promise<{ chosen: string[] } | null> {
  return withSeed(`build-traits:check:${adv?._id}`, () => checkTrait(adv, value))
}

async function checkTrait(adv: any, value: any): Promise<{ chosen: string[] } | null> {
  const { available } = await adv.unfulfilledChoices()
  const grants = new Set<string>(available.filter((slot: any) => slot.type === 'grant').flatMap((slot: any) => [...slot.choices.asSet()]))
  const fixed = new Set<string>([...grants, ...(adv.configuration.grants ?? [])])
  const slots: KeySet[] = available.filter((slot: any) => slot.type === 'choice').map((slot: any) => slot.choices.asSet())
  const chosen: string[] = value?.chosen ?? []
  if (!Array.isArray(chosen)) return null
  const assigned = new Map<number, string>()
  const place = (key: string, seen: Set<number>): boolean => slots.some((slot, i) => {
    if (!slot.has(key) || seen.has(i)) return false
    seen.add(i)
    const prev = assigned.get(i)
    if (prev && !place(prev, seen)) return false
    assigned.set(i, key)
    return true
  })
  const elective = chosen.filter((key) => !fixed.has(key))
  if (elective.length !== new Set(elective).size) return null
  if (!elective.every((key) => place(key, new Set()))) return null
  return { chosen: [...grants, ...elective.sort()] }
}

const emptyTrait = (adv: any): boolean => adv.type === 'Trait' && !adv.configuration?.grants?.length && !adv.configuration?.grants?.size
  && !adv.configuration?.choices?.length

/** 只补未出现的项。官方候选可能是通配符，用官方搜索接口展开后再比。 */
async function existingTraits(data: any, level: number, multiclass: boolean) {
  const trait = g.dnd5e.documents.Trait
  const records = (Object.values(data.system?.advancement ?? {}) as any[]).filter((adv) => adv.type === 'Trait' && !emptyTrait(adv)
    && (adv.level ?? 0) === level
    && (!adv.classRestriction || adv.classRestriction === (multiclass ? 'secondary' : 'primary')))
  return Promise.all(records.map(async (adv) => ({
    id: adv._id as string, mode: adv.configuration?.mode ?? 'default',
    grants: [...(adv.configuration?.grants ?? [])] as string[],
    slots: await Promise.all((adv.configuration?.choices ?? []).map(async (slot: any) => {
      const pool = [...(slot.pool ?? [])]
      const hasWildcard = pool.some((key: string) => key.includes('*'))
      const expanded = hasWildcard ? await trait.mixedChoices(new Set(pool)) : null
      return { count: slot.count ?? 1, pool: new Set<string>(expanded?.asSet?.() ?? pool) }
    })) as Array<{ count: number; pool: KeySet }>,
  })))
}

function missingSlots(generated: NativeSlot[], existing: Array<{ count: number; pool: KeySet }>): NativeSlot[] | null {
  const remaining = [...existing]
  const out: NativeSlot[] = []
  for (const slot of generated) {
    const match = remaining.findIndex((row) => row.count === slot.count && row.pool.size === slot.pool.length && slot.pool.every((key) => row.pool.has(key)))
    if (match >= 0) { remaining.splice(match, 1); continue }
    if (existing.some((row) => slot.pool.some((key) => row.pool.has(key)))) return null
    out.push(slot)
  }
  return out
}

// Earlier training on the same Item is pending until the advancement manager runs.
async function withPriorTraining(actor: any, data: any, records: Record<string, unknown>, context: ActorTraits, level: number) {
  const clone = actor.clone()
  const item = new g.CONFIG.Item.documentClass({ ...data, system: { ...data.system, advancement: records } }, { parent: clone })
  for (const adv of item.advancement.byType.Trait ?? []) {
    if (adv.configuration.mode !== 'default' || adv.level !== level) continue
    const recorded = context.previous?.find(pick => pick.id === adv.id)?.data
    const pick = context.picks?.find(pick => pick.id === adv.id)?.value
    const value = await checkTrait(adv, recorded ?? pick)
    if (value?.chosen.length) await adv.apply(level, value)
  }
  return clone
}

/** Plutonium 自己写的文字（分组标题、候选名）：交主线按作者代码同位置取本战役语言（找不到位置 = 显示原文并记作没翻到）。 */
const authorText = (text: string): FrameText => fromAuthor(text, authorTextPath(text))
/** 提示用的标题：按编号认（dnd5e 语言包，与步骤标题同一处 trait-title.ts groupTitle）；都认不出才用作者分组的原标题。siblings = 同一批分组（混合分组按它们认类别）。 */
const labelOf = (group: any, siblings: any[], keys: string[] = []): FrameText => {
  const title = groupTitle(group, siblings, keys)
  return title ? systemText(title) : authorText(String(group._title || group._subComps[0]?.modalTitle || group._prop))
}
/** 提示去重（同一句只说一次）。 */
const uniqueTexts = (list: FrameText[]): FrameText[] => [...new Map(list.map((t) => [JSON.stringify(t), t])).values()]

export function fillBuildTraits(data: any, row: { prop?: string; entry?: any; data?: any }, ref: string, multiclass: boolean, context: ActorTraits = {}): Promise<FrameText[]> {
  return withSeed(`build-traits:fill:${ref}:${multiclass}`, () => fill(data, row, ref, multiclass, context))
}

async function fill(data: any, row: { prop?: string; entry?: any; data?: any }, ref: string, multiclass: boolean, context: ActorTraits): Promise<FrameText[]> {
  const { replay, picks, plans, actor, scope, expertise } = context
  if (!row.entry) return []
  const api = plutoniumBuild
  if (!api) return [plugin('当前 Plutonium 版本缺少已验证的建卡接线')]
  const level = row.prop === 'class' ? 1 : 0
  const entry = row.prop === 'class'
    ? api.Charactermancer_Class_Util.getStandardProficiencies(multiclass
      ? row.entry.multiclassing?.proficienciesGained ?? {}
      : { proficiency: row.entry.proficiency, ...row.entry.startingProficiencies })
    : structuredClone(row.entry)
  const blank = new g.CONFIG.Actor.documentClass({ name: 'Trait preview', type: BUILD_ACTOR_TYPE })
  const features = [{ entity: entry }]
  const availableProficiencyManager = await api.Charactermancer_AvailableProficiencyManager.pGetInstance()
  const component = new api.Charactermancer_FeatureOptionsSelect({
    actor: blank, optionsSet: features, level,
    // 这里只运行作者的熟练子组件。构建器要求一个筛选器对象，法术子组件不参与。
    modalFilterSpells: {}, availableProficiencyManager,
  })
  const groups = component._subCompManagers.filter((group: any) => group instanceof api.CharactermancerFeatureSubCompManagerProficiencyOtherBase)
  const existing = await existingTraits(data, level, multiclass)
  const origins = traitOrigins(row.data ?? data)
  const replaced = new Set<string>()
  const diagnostics: FrameText[] = []
  const fresh: Record<string, unknown> = {}
  try {
    for (const group of groups) {
      try {
        await group._pInitSubComp({ ix: 0, selectedLinkedEntityInfos: features })
        if (!group._subComps[0]) continue
        const isExpertise = actor && group._subComps[0] instanceof api.Charactermancer_ExpertiseSelect
        const trained = isExpertise ? await withPriorTraining(actor, data, {
          ...Object.fromEntries(Object.entries(data.system?.advancement ?? {}).filter(([id]) => !replaced.has(id))), ...fresh,
        }, context, level) : actor
        const versions = await readTraitPlans(api, blank, group, trained, scope)
        if (!versions.length) { diagnostics.push(labelOf(group, groups)); continue }
        const newIds = versions.map(({ index }) => idOf(ref, group._prop, level, multiclass, 'author-plan', index))
        const known = replay ?? picks?.map(pick => pick.id)
        const selected = newIds.findIndex(id => known?.includes(id))
        const at = selected < 0 ? 0 : selected
        const traits = versions[at]
        if (traits.extended && replay && selected < 0) continue
        const options = versions.map((plan, i) => ({
          id: newIds[i],
          label: plan.choices.length
            ? joined(plan.choices.map(slot => plugin(`{0} ×${slot.count}`, titleOfKeys(slot.pool) ? systemText(titleOfKeys(slot.pool)!) : labelOf(group, groups))), ' + ')
            : titleOfKeys(plan.grants) ? systemText(titleOfKeys(plan.grants)!) : labelOf(group, groups),
        }))
        // 存不进的候选：是作者物品的按编号取本战役库名（取不到算没翻到），其余是 Plutonium 自己写的字
        const withheld = [...new Map(traits.withheld.map((w) => [w.label, w])).values()].sort((a, b) => a.label.localeCompare(b.label))
        if (withheld.length) diagnostics.push(plugin('{0}（暂时无法加到人物卡：{1}）', labelOf(group, groups), joined(withheld.map(w => w.text ?? authorText(w.label)), '、')))
        // Plutonium 的分组从 entity 或 entryData 取输入。主职/兼职即使字段同名也须核对内容。
        const input = hashValue(entry[group._prop] || entry.entryData?.[group._prop])
        const comparable = existing.filter(record => record.mode === traits.mode)
        const own = comparable.filter(({ id }) => origins[id]?.field === group._prop && origins[id]?.input === input)
        const ownGrants = new Set(own.flatMap((record) => record.grants))
        const ownSlots = own.flatMap((record) => record.slots)
        const unchanged = ownGrants.size === traits.grants.length && traits.grants.every((key) => ownGrants.has(key))
          && ownSlots.length === traits.choices.length && missingSlots(traits.choices, ownSlots)?.length === 0
        const fixId = idOf(ref, group._prop, level, multiclass, 'origin')
        // 只处理已经存在、但导入时损失信息的选择位。固定授予或作者只能部分表达的组，仍按原路径补齐。
        const replace = ownSlots.length > 0 && !unchanged && !traits.withheld.length && (!replay || replay.includes(traits.extended ? newIds[at] : fixId))
        const other = replace ? comparable.filter((record) => !own.includes(record)) : comparable
        const otherGrants = new Set(other.flatMap((record) => record.grants))
        const otherSlots = other.flatMap((record) => record.slots)
        const grants = traits.grants.filter((key) => !otherGrants.has(key))
        const choices = replace ? traits.choices : missingSlots(traits.choices, otherSlots)
        const authoredOverlap = replace && traits.choices.some((slot) => otherSlots.some((other) => slot.pool.some((key) => other.pool.has(key))))
        if (authoredOverlap) { diagnostics.push(plugin('{0}（与资料附带的进阶重叠，已保留原进阶）', labelOf(group, groups))); continue }
        if (!choices) { diagnostics.push(labelOf(group, groups)); continue }
        if (!grants.length && !choices.length) {
          for (const record of own) plans?.set(record.id, { choices: [], names: traits.names })
          continue
        }
        if (replace) for (const record of own) replaced.add(record.id)
        // A replacement has its own stable ID so cold replays of earlier saves keep their original steps.
        const id = traits.extended ? newIds[at] : replace ? fixId : idOf(ref, group._prop, level, multiclass)
        plans?.set(id, { choices: options.length > 1 ? options : [], names: traits.names })
        fresh[id] = {
          _id: id, type: 'Trait', level,
          ...(row.prop === 'class' ? { classRestriction: multiclass ? 'secondary' : 'primary' } : {}),
          ...(replace && traits.hints.length ? { hint: traits.hints.join('\n') } : {}),
          configuration: { mode: traits.mode, grants, choices, allowReplacements: false }, value: {},
        }
        if (isExpertise && expertise) {
          const item = new g.CONFIG.Item.documentClass({ ...data, system: { ...data.system, advancement: { [id]: fresh[id] } } }, { parent: trained })
          expertise.set(id, item.advancement.byId[id])
        }
      } catch (e) {
        console.warn('[trpg-assistant] 建卡进阶暂无法处理', ref, group._prop, e)
        diagnostics.push(labelOf(group, groups))
      }
    }
  } finally { component.unregisterSourceTracking() }
  if (data.system) {
    const native = Object.fromEntries(Object.entries(data.system.advancement ?? {}).filter(([id, adv]) => !replaced.has(id) && !emptyTrait(adv)))
    data.system.advancement = { ...native, ...fresh }
  }
  return uniqueTexts(diagnostics)
}

// P6：作者组件计算固定给予和选择；dnd5e 回读自己的编号，再按原生 Trait 进阶存取。
// 这里的计算是旁路（渲染作者组件、建临时人物会抽随机数），一律在旁路随机序列上跑（random.ts withSeed，与读资料包同一规则）：
// 建卡一定跑、冷读档不一定跑，若占用主序列，同一人物重建后物品编号会错开。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者组件和官方文档没有类型声明 */
import { hashValue } from '../../../core/hash'
import { plutoniumBuild } from './plutonium-build'
import { BUILD_ACTOR_TYPE } from './actor-types'
import { withSeed } from './random'
import { titleOfKeys, traitTypeOfActorPath, traitTypeTitle } from './trait-title'
import { traitOrigins } from './trait-origins'

const g = globalThis as any
const PREFIX = 'P6Tr'
export const isBuildTrait = (id: unknown): boolean => typeof id === 'string' && /^P6Tr[0-9a-f]{12}$/.test(id)
const idOf = (...parts: unknown[]): string => PREFIX + hashValue(parts).slice(0, 12)

type KeySet = Set<string>
type AuthorSlot = { count: number; hints?: string[]; options: Array<{ select: () => void; clear: () => void }> }
type NativeSlot = { count: number; pool: string[] }
type NativeTraits = { grants: string[]; choices: NativeSlot[]; hints: string[]; withheld: number }
const unique = (keys: Iterable<string>): string[] => [...new Set(keys)].sort()

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

/** 官方多选控件给自定义界面提供的 rowMetas：候选和写入键都由它自己生成。 */
function proficiencySlots(api: Record<string, any>, component: any, cleanup: Array<() => void>): AuthorSlot[] | null {
  const [set, ...alternatives] = component._available
  if (!set || alternatives.length || set.all?.length || set.choose?.some((slot: any) => slot.fromFilter)) return null
  return (set.choose ?? []).map((slot: any, ixChoose: number) => {
    const { propState } = component._getPropsChooseFrom({ ixChoose })
    const grouped = component._getChooseFromGroupMeta(slot)
    const meta = api.ComponentUiUtil.getMetaWrpMultipleChoice(component, propState, {
      count: slot.count, ...(grouped?.valueGroups ? { valueGroups: grouped.valueGroups } : { values: slot.from }),
      fnDisplay: () => '',
    })
    cleanup.push(meta.cleanup)
    return {
      count: slot.count,
      hints: grouped?.valueGroups?.map((row: any) => row.text).filter(Boolean),
      options: meta.rowMetas.map((row: any) => ({
        select: () => { component._state[row.propIsActive] = true },
        clear: () => { component._state[row.propIsActive] = false },
      })),
    }
  })
}

/** 作者的抗性选择使用一棵勾选树，初始化后显式读取空树，避免取到作者构造时的默认全选。 */
function resistanceSlots(api: Record<string, any>, component: any): AuthorSlot[] | null {
  component.render(api.veE(document.createElement('div')))
  const nodes = component._lastChoiceMeta.children.filter((node: any) => node.children)
  if (nodes.some((node: any) => !node.children.every((option: any) => option.isChoosable))) return null
  const update = () => { component._state.readonly_selectedValues = component._getOutputObject() }
  update()
  return nodes.map((node: any) => ({
    count: node.count,
    options: node.children.map((option: any) => ({
      select: () => { option.setActive(true); update() },
      clear: () => { option.setActive(false); update() },
    })),
  }))
}

async function authorKeys(api: Record<string, any>, blank: any, group: any): Promise<KeySet | null> {
  const update = {}
  const form = await group._subComps[0].pGetFormData()
  await api.Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(blank, update, { data: { [group._propFormDatas]: [form] } })
  const trait = g.dnd5e.documents.Trait
  const paths = Object.keys(g.CONFIG.DND5E.traits).filter((type) => g.foundry.utils.hasProperty(update, trait.actorKeyPath(type)))
  if (paths.some((type) => g.foundry.utils.getProperty(update, trait.actorKeyPath(type))?.custom)) return null
  if (!paths.length) return new Set()
  const actor = blank.clone(update)
  const values = (await Promise.all(paths.map((type) => trait.actorValues(actor, type)))).flatMap((record) => Object.entries(record))
  return values.some(([, v]) => v && v !== 1) ? null : new Set(values.filter(([, v]) => v === 1).map(([key]) => key))
}

async function nativeTraits(api: Record<string, any>, blank: any, group: any, cleanup: Array<() => void>): Promise<NativeTraits | null> {
  const comp = group._subComps[0]
  const slots = comp instanceof api.Charactermancer_OtherProficiencySelect
    ? proficiencySlots(api, comp, cleanup)
    : comp instanceof api.Charactermancer_ImmResVulnSelect ? resistanceSlots(api, comp) : null
  if (!slots) return null
  const fixed = await authorKeys(api, blank, group)
  if (!fixed) return null
  const choices: NativeSlot[] = []
  let withheld = 0
  for (const slot of slots) {
    const pool: string[] = []
    for (const option of slot.options) {
      option.select()
      let keys: KeySet | null
      try { keys = await authorKeys(api, blank, group) } finally { option.clear() }
      const gained = [...(keys ?? [])].filter((key) => !fixed.has(key))
      if (gained.length === 1) pool.push(gained[0])
      else withheld++
    }
    const distinct = unique(pool)
    if (distinct.length >= slot.count) choices.push({ count: slot.count, pool: distinct })
    else withheld += distinct.length
  }
  return { grants: unique(fixed), choices, hints: [...new Set(slots.flatMap(slot => slot.hints ?? []))], withheld }
}

const emptyTrait = (adv: any): boolean => adv.type === 'Trait' && !adv.configuration?.grants?.length && !adv.configuration?.grants?.size
  && !adv.configuration?.choices?.length

/** 只补未出现的项。官方候选可能是通配符，用官方搜索接口展开后再比。 */
async function existingTraits(data: any, level: number, multiclass: boolean) {
  const trait = g.dnd5e.documents.Trait
  const records = (Object.values(data.system?.advancement ?? {}) as any[]).filter((adv) => adv.type === 'Trait' && !emptyTrait(adv)
    && (adv.level ?? 0) === level && (adv.configuration?.mode ?? 'default') === 'default'
    && (!adv.classRestriction || adv.classRestriction === (multiclass ? 'secondary' : 'primary')))
  return Promise.all(records.map(async (adv) => ({
    id: adv._id as string,
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

/** 提示用的标题：按类别编号取（与步骤标题同一处，trait-title.ts）——分组自己登记的类别，或这组候选实际涉及的类别；都认不出才用作者分组的原标题。 */
const labelOf = (group: any, keys: string[] = []): string => traitTypeTitle(traitTypeOfActorPath(group._propPathActorExistingProficiencies))
  || titleOfKeys(keys) || group._title || group._subComps[0]?.modalTitle || group._prop

export function fillBuildTraits(data: any, row: { prop?: string; entry?: any; data?: any }, ref: string, multiclass: boolean, replay?: string[]): Promise<string[]> {
  return withSeed(`build-traits:fill:${ref}:${multiclass}`, () => fill(data, row, ref, multiclass, replay))
}

async function fill(data: any, row: { prop?: string; entry?: any; data?: any }, ref: string, multiclass: boolean, replay?: string[]): Promise<string[]> {
  if (!row.entry) return []
  const api = plutoniumBuild
  if (!api) return ['当前 Plutonium 版本缺少已验证的建卡接线']
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
  const diagnostics: string[] = []
  const fresh: Record<string, unknown> = {}
  try {
    for (const group of groups) {
      const cleanup: Array<() => void> = []
      try {
        await group._pInitSubComp({ ix: 0, selectedLinkedEntityInfos: features })
        if (!group._subComps[0]) continue
        const traits = await nativeTraits(api, blank, group, cleanup)
        if (!traits) { diagnostics.push(labelOf(group)); continue }
        if (traits.withheld) diagnostics.push(`${labelOf(group, [...traits.grants, ...traits.choices.flatMap((c) => c.pool)])}（${traits.withheld} 项候选暂无法按原生进阶保存）`)
        // Plutonium 的分组从 entity 或 entryData 取输入。主职/兼职即使字段同名也须核对内容。
        const input = hashValue(entry[group._prop] || entry.entryData?.[group._prop])
        const own = existing.filter(({ id }) => origins[id]?.field === group._prop && origins[id]?.input === input)
        const ownGrants = new Set(own.flatMap((record) => record.grants))
        const ownSlots = own.flatMap((record) => record.slots)
        const unchanged = ownGrants.size === traits.grants.length && traits.grants.every((key) => ownGrants.has(key))
          && ownSlots.length === traits.choices.length && missingSlots(traits.choices, ownSlots)?.length === 0
        const fixId = idOf(ref, group._prop, level, multiclass, 'origin')
        // 只处理已经存在、但导入时损失信息的选择位。固定授予或作者只能部分表达的组，仍按原路径补齐。
        const replace = ownSlots.length > 0 && !unchanged && !traits.withheld && (!replay || replay.includes(fixId))
        const other = replace ? existing.filter((record) => !own.includes(record)) : existing
        const otherGrants = new Set(other.flatMap((record) => record.grants))
        const otherSlots = other.flatMap((record) => record.slots)
        const grants = traits.grants.filter((key) => !otherGrants.has(key))
        const choices = replace ? traits.choices : missingSlots(traits.choices, otherSlots)
        const authoredOverlap = replace && traits.choices.some((slot) => otherSlots.some((other) => slot.pool.some((key) => other.pool.has(key))))
        if (authoredOverlap) { diagnostics.push(`${labelOf(group)}（与资料附带的进阶重叠，已保留原进阶）`); continue }
        if (!choices) { diagnostics.push(labelOf(group)); continue }
        if (!grants.length && !choices.length) continue
        if (replace) for (const record of own) replaced.add(record.id)
        // A replacement has its own stable ID so cold replays of earlier saves keep their original steps.
        const id = replace ? fixId : idOf(ref, group._prop, level, multiclass)
        fresh[id] = {
          _id: id, type: 'Trait', level,
          ...(row.prop === 'class' ? { classRestriction: multiclass ? 'secondary' : 'primary' } : {}),
          ...(replace && traits.hints.length ? { hint: traits.hints.join('\n') } : {}),
          configuration: { mode: 'default', grants, choices, allowReplacements: false }, value: {},
        }
      } catch (e) {
        console.warn('[trpg-assistant] 建卡进阶暂无法处理', ref, group._prop, e)
        diagnostics.push(labelOf(group))
      } finally {
        for (const remove of cleanup) remove()
      }
    }
  } finally { component.unregisterSourceTracking() }
  if (data.system) {
    const native = Object.fromEntries(Object.entries(data.system.advancement ?? {}).filter(([id, adv]) => !replaced.has(id) && !emptyTrait(adv)))
    data.system.advancement = { ...native, ...fresh }
  }
  return unique(diagnostics)
}

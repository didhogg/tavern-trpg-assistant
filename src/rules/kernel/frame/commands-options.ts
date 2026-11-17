// P6 建卡选项：选中种族 / 背景 / 职业后，每件条目带来哪些「要玩家选的事」、每件事有哪些候选（官方进阶自己算，已排除人物身上已有的）。
// 不写新规则：候选都来自 dnd5e 官方进阶的接口（Trait.unfulfilledChoices、进阶 configuration）；写法登记表——加一种进阶 = 加一行；
// 要玩家选、又没登记的进阶标 unsupported，绝不漏掉还说「选完了」（整体设计 §3.4 / §3.5）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { ExtraPools } from '../build-options'
import { describeBuildExtras } from './build-extras'
import type { Operate } from './commands-items'
import { abilityValues, buildActor, type BuildPlan } from './commands-level'
import { importEntry } from './importer'
import { authorIdsOf } from './author-ids'
import { traitTitle } from './trait-title'
import { asiView, type AsiChoice } from './asi'
import { registryLabels } from './trait-title'
import { authorTextPath } from './author-text'
import type { BuildPick } from './commands-level'
import type { ExpertiseViews, TraitPlans } from './build-traits'
import type { KernelRefFlags } from '../../../core/saves/split'
import { fromAuthor, fromEntry, joined, named, sys, type FrameText } from '../shown'

/** 一个候选：显示名是 dnd5e 语言包的字；带作者编号的，主线按编号取本战役库里的名字（author 留着给主线补 ref）。 */
export type Option = { value: string; label: FrameText; path: FrameText[]; author?: KernelRefFlags }
/** 小窗交回的一步（显示文字全是 FrameText，主线经显示出口换成品）。 */
export interface FrameStep { id: string; level: number | null; type: string; title: FrameText | null; hint?: FrameText; automatic: boolean; options: Record<string, unknown> | null; unsupported?: true }
/** dnd5e 的候选树（SelectChoices：类别 → 子类别 → 候选）→ 平铺候选，每项带所在分组路径（从外到里，分组名是 dnd5e 自己的类别名）。 */
const flatChoices = (choices: any, path: FrameText[] = []): Option[] => Object.entries(choices ?? {}).flatMap(([value, data]: [string, any]) => data?.children
  ? flatChoices(data.children, [...path, sys(String(data.label ?? value))])
  : [{ value, label: sys(String(data?.label ?? value)), path }])

/** 进阶类型 → 「这一步要玩家选什么」。返回 null = 这一步不用玩家选。pick = 玩家这一步已做的选择（界面交来的原样）。 */
const DESCRIBERS: Record<string, (advancement: any, pick: unknown, plans: TraitPlans) => Promise<Record<string, unknown> | null>> = {
  Trait: async (advancement, _pick, plans) => {
    const { available } = await advancement.unfulfilledChoices()
    const grants = available.filter((slot: any) => slot.type === 'grant').flatMap((slot: any) => flatChoices(slot.choices))
    const slots = new Map<number, { count: number; options: Option[] }>()
    for (const slot of available.filter((s: any) => s.type === 'choice')) {
      const cur = slots.get(slot.choiceIdx) ?? { count: 0, options: flatChoices(slot.choices) }
      cur.count++
      slots.set(slot.choiceIdx, cur)
    }
    // 熟练类型：进阶配置里没写 type 时，取候选键的前缀（官方键形如 skills:acr、languages:standard:common）
    const sample = grants[0]?.value ?? [...slots.values()][0]?.options[0]?.value
    const variants = plans.get(advancement.id)
    if (!slots.size && !variants) return null
    // 每项带上作者编号（主线按它起名，naming.ts）；不起名
    const shown = [...slots.values()]
    const ids = await authorIdsOf([...grants, ...shown.flatMap((s) => s.options)].map((o) => o.value))
    const withId = (o: Option): Option => (ids[o.value] ? { ...o, label: named((o.label as { text: string }).text, ids[o.value]), author: ids[o.value] } : o)
    return { kind: 'trait', trait: advancement.configuration?.type ?? sample?.split(':')[0] ?? null, grants: grants.map(withId), slots: shown.map((s) => ({ ...s, options: s.options.map(withId) })), ...(variants ? { plans: variants } : {}) }
  },
  AbilityScoreImprovement: async (advancement, pick) => asiView(advancement, pick as AsiChoice | undefined),
}
/** 本来就不用玩家选的进阶类型（没登记、也不算「未支持」）。 */
const NO_CHOICE = new Set(['HitPoints', 'ScaleValue', 'Size', 'ItemGrant', 'Subclass'])

async function describeSteps(manager: any, picks: BuildPick[] = [], plans: TraitPlans, expertise: ExpertiseViews): Promise<FrameStep[]> {
  const out: FrameStep[] = []
  for (const step of manager.steps) {
    const advancement = step.flow?.advancement
    if (!advancement) continue
    const type = advancement.constructor?.typeName ?? advancement.type
    const automatic = (await step.flow.getAutomaticApplicationValue?.()) !== false
    let options: Record<string, unknown> | null = null
    let unsupported = false
    const pick = picks.find((p) => p.id === advancement.id && (p.level ?? null) === (step.flow.level ?? null))?.value
    if (DESCRIBERS[type]) options = await DESCRIBERS[type](expertise.get(advancement.id) ?? advancement, pick, plans)
    else if (!automatic && !NO_CHOICE.has(type)) unsupported = true
    // 标题：Trait 按类别编号取 dnd5e 语言包的名字；数据里写了名字的是条目原文（主线按同编号条目同位置换）；
    // 没写的由 dnd5e 用语言包里的默认标题补上（Advancement.prepareData：name ||= _defaultTitle），已是本战役语言
    const own = type === 'Trait' ? traitTitle(advancement) : null
    const written = advancement._source?.name || advancement._source?.title
    const shownName = advancement.name ?? advancement.title
    const title = own ? sys(own) : written ? fromEntry(String(written)) : shownName ? sys(String(shownName)) : null
    // 说明：Plutonium 用作者代码里写死的句子拼的，每句按作者代码同位置取
    const hint = type === 'Trait' && advancement.hint ? joined(String(advancement.hint).split('\n').map((text) => fromAuthor(text, authorTextPath(text))), '\n') : undefined
    out.push({ id: advancement.id, level: step.flow.level ?? null, type, title, ...(hint ? { hint } : {}), automatic, options, ...(unsupported ? { unsupported: true as const } : {}) })
  }
  return out
}

export function createOptionsCommands(operate: Operate) {
  return {
    /** 按已选的条目（和已做的选择 picks）一件件放进空白人物，列出每件条目现在要玩家选的事；预览用的人物用完删掉。 */
    buildOptions: (plan: Pick<BuildPlan, 'items' | 'picks' | 'choices' | 'blank' | 'traitScope'> & { extraPools?: ExtraPools; local?: Record<string, unknown> }) => operate([], async () => {
      const items = []
      for (const row of plan.items) items.push({ ...row, data: row.data ?? await importEntry(row.prop, row.entry) })
      const described: Array<{ refKey: string | null; steps: FrameStep[]; unsupported: FrameText[] }> = []
      const built = await buildActor('选项预览', items, [], plan.choices ?? {}, {
        strict: false, picks: plan.picks, blank: plan.blank, traitScope: plan.traitScope,
        onManager: async ({ manager, key, unsupported, picks, traitPlans, expertise }) => { described.push({ refKey: key, steps: await describeSteps(manager, picks, traitPlans, expertise), unsupported }) },
      })
      const actor = built.actor ?? built.created
      // 属性：初值、种族等加成后的自动值、官方上限；界面的「基础 + 加成 = 合计」由主线按这三样算
      try {
        const extras = plan.extraPools && Object.keys(plan.extraPools).length ? await describeBuildExtras(plan.items, plan.extraPools, actor, plan.local ?? {}) : []
        const byKey = new Map(described.map(row => [row.refKey, row]))
        const views = extras.length ? extras.map(row => ({ steps: [], unsupported: [], ...byKey.get(row.refKey), ...row })) : described
        return { items: views, complete: !built.pending && !built.missingTraits.length, abilities: { initial: built.initial, auto: abilityValues(actor), cap: (globalThis as any).CONFIG?.DND5E?.maxAbilityScore ?? null, labels: Object.fromEntries(Object.entries(registryLabels('abilities')).map(([k, v]) => [k, sys(v)])) } }
      } finally { await (built.actor ?? built.created)?.delete?.() }
    }),
  }
}

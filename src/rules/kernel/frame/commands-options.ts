// P6 建卡选项：选中种族 / 背景 / 职业后，每件条目带来哪些「要玩家选的事」、每件事有哪些候选（官方进阶自己算，已排除人物身上已有的）。
// 不写新规则：候选都来自 dnd5e 官方进阶的接口（Trait.unfulfilledChoices、进阶 configuration）；写法登记表——加一种进阶 = 加一行；
// 要玩家选、又没登记的进阶标 unsupported，绝不漏掉还说「选完了」（整体设计 §3.4 / §3.5）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { Operate } from './commands-items'
import { abilityValues, buildActor, type BuildPlan } from './commands-level'
import { importEntry } from './importer'

const plainOption = (o: any) => ({ value: String(o.value), label: String(o.label ?? o.value), ...(o.group ? { group: String(o.group) } : {}) })

/** 进阶类型 → 「这一步要玩家选什么」。返回 null = 这一步不用玩家选。 */
const DESCRIBERS: Record<string, (advancement: any) => Promise<Record<string, unknown> | null>> = {
  Trait: async (advancement) => {
    const { available } = await advancement.unfulfilledChoices()
    const grants = available.filter((slot: any) => slot.type === 'grant').flatMap((slot: any) => [...slot.choices.asOptions()].map(plainOption))
    const slots = new Map<number, { count: number; options: ReturnType<typeof plainOption>[] }>()
    for (const slot of available.filter((s: any) => s.type === 'choice')) {
      const cur = slots.get(slot.choiceIdx) ?? { count: 0, options: [...slot.choices.asOptions()].map(plainOption) }
      cur.count++
      slots.set(slot.choiceIdx, cur)
    }
    // 熟练类型：进阶配置里没写 type 时，取候选键的前缀（官方键形如 skills:acr、languages:standard:common）
    const sample = grants[0]?.value ?? [...slots.values()][0]?.options[0]?.value
    return slots.size ? { kind: 'trait', trait: advancement.configuration?.type ?? sample?.split(':')[0] ?? null, grants, slots: [...slots.values()] } : null
  },
  AbilityScoreImprovement: async (advancement) => {
    const c = advancement.configuration ?? {}
    const fixed = Object.fromEntries(Object.entries(c.fixed ?? {}).filter(([, v]) => v))
    return c.points ? { kind: 'asi', points: c.points, cap: c.cap ?? null, fixed, locked: [...(c.locked ?? [])] } : null
  },
}
/**
 * Trait 进阶的标题：Plutonium 写死英文（Skills / Saving Throws …），不用它；
 * 按它授予内容的编号前缀（skills: / saves: / languages: …）取官方类别名（官方多语言，中文战役即中文）。
 */
function traitTitle(advancement: any): string | null {
  const c = advancement.configuration ?? {}
  const keys = [...(c.grants ?? []), ...[...(c.choices ?? [])].flatMap((x: any) => [...(x?.pool ?? [])])]
  const type = c.type || keys.map((k: unknown) => String(k).split(':')[0]).find(Boolean)
  const key = type ? (globalThis as any).CONFIG?.DND5E?.traits?.[type]?.labels?.title : null
  return key ? (globalThis as any).game.i18n.localize(key) : null
}

/** 本来就不用玩家选的进阶类型（没登记、也不算「未支持」）。 */
const NO_CHOICE = new Set(['HitPoints', 'ScaleValue', 'Size', 'ItemGrant', 'Subclass'])

async function describeSteps(manager: any): Promise<any[]> {
  const out = []
  for (const step of manager.steps) {
    const advancement = step.flow?.advancement
    if (!advancement) continue
    const type = advancement.constructor?.typeName ?? advancement.type
    const automatic = (await step.flow.getAutomaticApplicationValue?.()) !== false
    let options: Record<string, unknown> | null = null
    let unsupported = false
    if (DESCRIBERS[type]) options = await DESCRIBERS[type](advancement)
    else if (!automatic && !NO_CHOICE.has(type)) unsupported = true
    out.push({ id: advancement.id, level: step.flow.level ?? null, type, title: (type === 'Trait' ? traitTitle(advancement) : null) ?? advancement.title ?? null, automatic, options, ...(unsupported ? { unsupported: true } : {}) })
  }
  return out
}

export function createOptionsCommands(operate: Operate) {
  return {
    /** 按已选的条目（和已做的选择 picks）一件件放进空白人物，列出每件条目现在要玩家选的事；预览用的人物用完删掉。 */
    buildOptions: (plan: Pick<BuildPlan, 'items' | 'picks' | 'choices' | 'blank'>) => operate([], async () => {
      const items = []
      for (const row of plan.items) items.push({ ...row, data: row.data ?? await importEntry(row.prop, row.entry) })
      const described: Array<{ refKey: string | null; steps: any[]; unsupported: string[] }> = []
      const built = await buildActor('选项预览', items, [], plan.choices ?? {}, {
        strict: false, picks: plan.picks, blank: plan.blank,
        onManager: async ({ manager, key, unsupported }) => { described.push({ refKey: key, steps: await describeSteps(manager), unsupported }) },
      })
      const actor = built.actor ?? built.created
      // 属性：初值、种族等加成后的自动值、官方上限；界面的「基础 + 加成 = 合计」由主线按这三样算
      try { return { items: described, complete: !built.pending && !built.missingTraits.length, abilities: { initial: built.initial, auto: abilityValues(actor), cap: (globalThis as any).CONFIG?.DND5E?.maxAbilityScore ?? null } } } finally { await (built.actor ?? built.created)?.delete?.() }
    }),
  }
}

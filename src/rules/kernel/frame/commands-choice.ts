// 建卡时「没有现成自动值」的进阶选择：取第一个可选项（模板加入），或留空（建卡界面，玩家没选的不替他选）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
const g = globalThis as any

/** 没有现成自动值时的固定规则：取第一个可选项。 */
/**
 * 「留空」：要玩家选的进阶只给官方固定授予的，选择位不替玩家填；不是玩家选择的类型（生命值、尺寸、物品授予、子职业…）返回 undefined，仍走 firstChoice。
 * 值的样子和玩家选择一样（Trait = {chosen}、能力值 = {type:'asi', assignments}、物品选择 = {selected}），官方管理器照常接受。
 */
export async function blankChoice(flow: any): Promise<any> {
  const advancement = flow.advancement
  const type = advancement.constructor?.typeName ?? advancement.type
  if (type === 'Trait') {
    const automatic = await advancement.automaticApplicationValue?.(flow.level)
    if (automatic !== false) return automatic
    const { available } = await advancement.unfulfilledChoices()
    return { chosen: available.filter((slot: any) => slot.type === 'grant').flatMap((slot: any) => [...slot.choices.asSet()]) }
  }
  if (type === 'AbilityScoreImprovement') {
    const fixed = Object.entries(advancement.configuration?.fixed ?? {}).filter(([, value]) => value)
    return { type: 'asi', assignments: Object.fromEntries(fixed) }
  }
  if (type === 'ItemChoice') return { selected: [] }
  return undefined
}

export async function firstChoice(flow: any): Promise<any> {
  const advancement = flow.advancement
  const type = advancement.constructor?.typeName ?? advancement.type
  if (type === 'HitPoints') return { [flow.level]: 'avg' }

  if (type === 'ItemGrant') {
    const automatic = await advancement.automaticApplicationValue?.(flow.level)
    if (automatic !== false) return automatic
    const items = (advancement.configuration?.items ?? []).filter((item: any) => !item.optional)
    return { ability: advancement.configuration?.spell?.ability?.[0] ?? null,
      selected: (items.length ? items : advancement.configuration?.items ?? []).map((item: any) => item.uuid) }
  }

  if (type === 'ItemChoice') {
    const count = advancement.configuration?.choices?.[flow.level]?.count ?? 1
    const pool = (advancement.configuration?.pool ?? []).map((item: any) => item.uuid)
    return { selected: pool.slice(0, count) }
  }

  if (type === 'Subclass') {
    const pack = g.game.packs.get('dnd5e.subclasses')
    if (!pack) return undefined
    const index = await pack.getIndex({ fields: ['system.classIdentifier', 'type'] })
    const entry = index.contents?.find((item: any) => item.type === 'subclass'
      && item.system?.classIdentifier === advancement.item?.system?.identifier)
    return entry ? `Compendium.${pack.metadata.id}.Item.${entry._id}` : undefined
  }

  if (type === 'Trait') {
    const automatic = await advancement.automaticApplicationValue?.(flow.level)
    if (automatic !== false) return automatic
    // 官方 unfulfilledChoices：每个待选位还能选哪些（已排除人物身上已有的熟练/语言）；每位取第一个。
    const { available } = await advancement.unfulfilledChoices()
    const chosen = new Set<string>()
    for (const slot of available) {
      const key = [...slot.choices.asSet()].find((k: string) => !chosen.has(k))
      if (key) chosen.add(key)
    }
    return { chosen: [...chosen] }
  }

  if (type === 'AbilityScoreImprovement') {
    const fixed = Object.entries(advancement.configuration?.fixed ?? {}).filter(([, value]) => value)
    if (fixed.length) return { type: 'asi', assignments: Object.fromEntries(fixed) }
    // 没有固定加值：把 points 按每项上限 cap 依次分给能加的属性（变体人类 points 2、cap 1 → 两项各 +1）
    const points = advancement.configuration?.points ?? 0
    const cap = advancement.configuration?.cap || points
    const assignments: Record<string, number> = {}
    let left = points
    for (const key of Object.keys(flow.actor?.system?.abilities ?? advancement.actor?.system?.abilities ?? g.CONFIG?.DND5E?.abilities ?? {})) {
      if (left <= 0) break
      if (advancement.canImprove?.(key) === false) continue
      const n = Math.min(cap, left)
      assignments[key] = n
      left -= n
    }
    return Object.keys(assignments).length ? { type: 'asi', assignments } : undefined
  }

  if (type === 'Size') return { size: advancement.configuration?.sizes?.first?.() ?? 'med' }
  if (type === 'ScaleValue') return {}
  return undefined
}


// 行动页放什么、怎么分组：照搬 Tidy5e（src/features/actions/actions.svelte.ts isItemInActionList + buildActionSectionsQuadrone，
// src/utils/SpellUtils.ts / ItemUtils.ts 的法术与次数判断），开关取 Tidy5e 默认值（含消耗品、不只限戏法、1 分钟 / 1 轮法术算、带效果的法术算）。
// 物品上标了「显示到行动页 / 从行动页拿掉」（我们的 flags.tavern-trpg.actionList，Tidy5e 的 actionFilterOverride）以标记为准。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { systemText } from './system-text'

const g = globalThis as any
/** Tidy5e activationTypeSortValues：默认几组和顺序；其余动作类型归「其他」。 */
const ORDER = ['action', 'bonus', 'reaction', 'legendary', 'mythic', 'lair', 'crew', 'special'] as const

const firstActivation = (item: any): string | undefined => item.system.activities?.contents?.[0]?.activation?.type
/** Tidy5e isActiveItem：分钟 / 小时 / 天 / 无 不算主动。 */
const isActive = (type: string | undefined): boolean => !!type && !['minute', 'hour', 'day', 'none'].includes(type)
const hasConfiguredUses = (item: any): boolean => !!(item.system.hasLimitedUses && item.system.uses?.recovery?.length)
const method = (item: any): string => String(item.system.method ?? item.system.preparation?.mode ?? '')
const states = (): any => g.CONFIG.DND5E.spellPreparationStates ?? {}

/** Tidy5e SpellUtils.isCastableSpell。 */
function castable(item: any): boolean {
  if (!(item.system.level > 0)) return false
  const prepared = item.system.prepared
  return (item.system.canPrepare && prepared === states().prepared?.value)
    || (item.system.canPrepare && prepared === states().always?.value)
    || (method(item) === 'atwill' && !hasConfiguredUses(item))
    || (method(item) === 'innate' && !hasConfiguredUses(item))
    || (hasConfiguredUses(item) && item.system.uses?.value > 0)
    || !!item.system.linkedActivity?.item
}

/** Tidy5e getActivityFirstDamage：第一个攻击 / 伤害 / 豁免活动有没有伤害。 */
function deals(item: any): boolean {
  const acts = item.system.activities
  const a = acts?.getByType?.('attack')?.[0] ?? acts?.getByType?.('damage')?.[0] ?? acts?.getByType?.('save')?.[0]
  return !!a?.damage?.parts?.length
}

/** Tidy5e isItemInActionList（mode = usable-and-flag，开关取默认）。 */
export function inActionList(item: any): boolean {
  const override = item.flags?.['tavern-trpg']?.actionList
  if (override === true || override === false) return override
  switch (item.type) {
    case 'weapon': return !!item.system.equipped
    case 'equipment': return !!item.system.equipped && isActive(firstActivation(item))
    case 'consumable': return isActive(firstActivation(item))
    case 'spell': {
      const linked = item.system.linkedActivity?.item
      const linkedOk = !!linked && (linked.system.attunement !== 'required' || linked.system.attuned)
      const cantrip = item.system.level === 0
      if (!cantrip && !(castable(item) || linkedOk)) return false
      if (linked && cantrip && !linkedOk) return false
      const type = firstActivation(item)
      const d = item.system.duration ?? {}
      return type === 'reaction' || type === 'bonus' || deals(item)
        || (d.units === 'minute' && Number(d.value) === 1) || (d.units === 'round' && Number(d.value) === 1)
        || !!item.effects?.size
    }
    case 'feat': return !!firstActivation(item)
    default: return false
  }
}

/** Tidy5e buildActionSectionsQuadrone：按第一个活动的动作类型分组（固定顺序，没有的组不显示），组名用 dnd5e 动作类型的语言键。 */
export function actionSections(a: any): Array<{ id: string; label: unknown; items: any[] }> {
  const groups = new Map<string, any[]>(ORDER.map((t) => [t, []]))
  for (const item of a.items) {
    if (!inActionList(item)) continue
    const type = firstActivation(item)
    const key = type && (ORDER as readonly string[]).includes(type) ? type : 'other'
    groups.set(key, [...(groups.get(key) ?? []), item])
  }
  const label = (type: string) => {
    const raw = g.CONFIG.DND5E.activityActivationTypes?.[type]?.label
    return systemText(raw ? g.game.i18n.localize(raw) : type === 'other' ? 'Other' : type)
  }
  return [...groups.entries()].filter(([, items]) => items.length).map(([type, items]) => ({ id: type, label: label(type), items }))
}

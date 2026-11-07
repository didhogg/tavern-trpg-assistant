// c 段：战斗流程、施法、状态与专注。只按顺序调 dnd5e / Foundry 官方入口。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { itemState, type ActorGetter, type Operate } from './commands-items'

const g = globalThis as any

function slotsState(actor: any): any {
  const spells = actor.system.spells
  if (!spells) return null
  return Object.fromEntries(Object.entries(spells).map(([key, slot]: [string, any]) => [key,
    { value: slot.value ?? null, max: slot.max ?? null, level: slot.level ?? null, type: slot.type ?? null }]))
}

function concentrationState(actor: any): any {
  const effects = actor.concentration?.effects
  return {
    effects: effects ? [...effects].map((e: any) => ({ id: e.id, name: e.name, statuses: e.statuses ?? [] })) : [],
    limit: actor.system.attributes?.concentration?.limit ?? null,
  }
}

function statusesState(actor: any): any {
  return {
    statuses: actor.statuses ? [...actor.statuses] : [],
    effects: actor.effects.contents.map((e: any) => ({ id: e.id, name: e.name, statuses: e.statuses ?? [], disabled: e.disabled })),
  }
}

function combatState(combat: any): any {
  return {
    id: combat.id,
    name: combat.name,
    round: combat.round,
    turn: combat.turn,
    started: combat.started,
    ended: combat.ended,
    current: combat.combatant?.actor?.id ?? null,
    combatants: combat.combatants.contents.map((c: any) => ({
      id: c.id, actorId: c.actorId, name: c.actor?.name ?? c.name, initiative: c.initiative ?? null,
      defeated: c.isDefeated ?? false,
    })),
  }
}

function rollState(roll: any): any {
  return {
    formula: roll.formula ?? null,
    total: roll.total ?? null,
    isCritical: roll.isCritical ?? null,
    isFumble: roll.isFumble ?? null,
    dice: roll.dice?.map((die: any) => ({ faces: die.faces, results: die.results?.map((r: any) => r.result) })) ?? [],
  }
}

export function createCombatCommands(operate: Operate, actor: ActorGetter) {
  let activeCombat: any = null
  const combat = (): any => activeCombat ?? g.game.combat
  const requireCombat = (): any => {
    const current = combat()
    if (!current) throw Error('No active combat')
    return current
  }

  return {
    /** 开战：官方 Combat5e 文档创建，再按官方入口滚先攻；骰点来自传入队列。 */
    combatStart: (actorIds: string[], points: number[] = []) => operate(points, async () => {
      const CombatClass = g.CONFIG.Combat.documentClass
      const created = await CombatClass.create({ name: 'Kernel encounter', combatants: actorIds.map(id => ({ actorId: id })) })
      await created.rollInitiative(created.combatants.map((c: any) => c.id), { dialog: false })
      await created.startCombat()
      activeCombat = created
      return combatState(created)
    }, actorIds),

    /** 下一回合：官方 combat.nextTurn（回合/轮次、dnd5e 的回合到期钩子原样）。 */
    combatNext: (points: number[] = []) => operate(points, async () => {
      const current = requireCombat()
      await current.nextTurn()
      return combatState(current)
    }),

    /** 结束战斗：官方 combat.endCombat。 */
    combatEnd: () => operate([], async () => {
      const current = requireCombat()
      await current.endCombat()
      const state = combatState(current)
      activeCombat = null
      return state
    }),

    /** 施法/用活动：官方 spell activity.use；法术位、专注、消耗全由 dnd5e 处理。 */
    cast: (actorId: string, itemId: string, activityId: string, points: number[] = [], usage: any = {}) => operate(points, async () => {
      const a = actor(actorId)
      const item = a.items.get(itemId, { strict: true })
      const activity = item.system.activities?.get(activityId)
      if (!activity) throw Error(`Item has no activity: ${activityId}`)
      const result = await activity.use(usage, { configure: false }, { create: false })
      return {
        item: itemState(item),
        activity: { id: activity.id, name: activity.name, type: activity.type },
        slots: slotsState(a),
        concentration: concentrationState(a),
        effects: (result?.effects ?? []).map((e: any) => ({ id: e.id, name: e.name, statuses: e.statuses ?? [] })),
        message: result?.message ? { title: result.message.title ?? null, type: result.message.type ?? null } : null,
        deltas: result?.updates?.actor ?? null,
      }
    }, [actorId]),

    /** 状态：官方 actor.toggleStatusEffect（中毒、倒地等）。 */
    condition: (actorId: string, statusId: string, active = true) => operate([], async () => {
      const a = actor(actorId)
      await a.toggleStatusEffect(statusId, { active })
      return statusesState(a)
    }, [actorId]),

    /** 专注检定：官方 getConcentrationDC + rollConcentration；失败时官方 endConcentration。 */
    concentrationCheck: (actorId: string, damage: number, points: number[] = []) => operate(points, async () => {
      const a = actor(actorId)
      if (!a.concentration?.effects?.size) return { dc: null, skipped: 'not concentrating', concentration: concentrationState(a) }
      const dc = a.getConcentrationDC(damage)
      const rolls = await a.rollConcentration({ target: dc }, { configure: false }, { create: false })
      const roll = rolls?.[0] ?? null
      const success = roll ? roll.total >= dc : null
      if (success === false) await a.endConcentration()
      return { dc, success, rolls: (rolls ?? []).map(rollState), concentration: concentrationState(a) }
    }, [actorId]),

    /** 只读：当前专注效果与上限，用来验证受伤后的专注检定。 */
    concentration: (actorId: string) => operate([], async () => concentrationState(actor(actorId)), [actorId]),
  }
}

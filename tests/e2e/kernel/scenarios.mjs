// 结算场景：由脚本从现成角色/怪物批量生成（蓝图 §4“不手写期望值”），标准答案与结算小窗跑同一串。
// 骰点是固定循环序列，只取 1～4（任何面数 ≥4 的骰子都合法）；够不够由内核自己报告“缺骰点”。
const POINTS = [3, 1, 4, 1, 2, 4, 2, 3, 4, 4, 1, 2, 3, 3, 2, 1]
const points = n => Array.from({ length: n }, (_, i) => POINTS[i % POINTS.length])

const itemList = actor => (actor.items ?? []).slice().sort((a, b) => String(a._id).localeCompare(String(b._id)))
const activityList = item => Object.values(item.system?.activities ?? {}).filter(a => a && a._id)
const maxUses = value => {
  const max = Number(value)
  return Number.isFinite(max) && max > 0 ? max : 0
}

/** b 段：每件物品先保证装上/同调，再用到尽；之后恢复与休息。全部由数据里的字段决定，不写物品名单。 */
function itemScenarios(actor) {
  const out = []
  if (actor.type !== 'character') return out
  const id = actor._id
  for (const item of itemList(actor)) {
    const system = item.system ?? {}
    // b 段只测角色身上的可装备物品（武器/护甲/消耗品/工具/容器）；职业特性、怪物天生武器不算物品装备。
    if (!('equipped' in system)) continue
    const startEquipped = Boolean(system.equipped)
    const attunable = Boolean(system.attunement)
    const startAttuned = Boolean(system.attuned)
    if (startEquipped === false) out.push(['equip', id, item._id, true])
    if (attunable && startAttuned === false) out.push(['attune', id, item._id, true])
    const activities = activityList(item)
    if (activities.length) {
      const activity = activities.find(a => (a.consumption?.targets ?? []).some(t => t.type === 'itemUses' && maxUses(t.value)))
        ?? activities.find(a => a.type === 'utility') ?? activities[0]
      const uses = maxUses(system.uses?.max) || maxUses(activity.uses?.max)
      // 作者数据里的 autoDestroy：用尽后物品会被官方删除，之后不能再对它穿/脱或再用。
      const autoDestroy = Boolean(system.uses?.autoDestroy)
      const count = uses ? (autoDestroy ? uses : uses + 1) : 1
      for (let i = 0; i < count; i++) out.push(['useItem', id, item._id, points(8), activity._id])
      if (!autoDestroy) {
        if (attunable) {
          out.push(['attune', id, item._id, !startAttuned])
          out.push(['attune', id, item._id, startAttuned])
        }
        out.push(['equip', id, item._id, !startEquipped])
        out.push(['equip', id, item._id, startEquipped])
      }
      continue
    }
    if (attunable) {
      out.push(['attune', id, item._id, !startAttuned])
      out.push(['attune', id, item._id, startAttuned])
    }
    out.push(['equip', id, item._id, !startEquipped])
    out.push(['equip', id, item._id, startEquipped])
  }
  out.push(['recover', id, 'sr', points(4)])
  out.push(['recover', id, 'lr', points(4)])
  out.push(['recover', id, 'dawn', points(4)])
  out.push(['rest', id, 'short', points(8)])
  out.push(['rest', id, 'long', points(8)])
  return out
}

export function scenarioList(actors) {
  const list = []
  for (const a of actors) {
    const id = a._id
    list.push(['damage', id, [{ value: 5, type: 'slashing' }], [], {}])
    list.push(['save', id, 'dex', points(4)])
    list.push(['skill', id, 'prc', points(4)])
    const weapon = (a.items ?? []).find(i => Object.values(i.system?.activities ?? {}).some(x => x.type === 'attack'))
    if (weapon) list.push(['attack', id, weapon._id, points(12)])
    list.push(['rest', id, 'short', points(8)])
    list.push(['rest', id, 'long', points(8)])
    const cls = (a.items ?? []).find(i => i.type === 'class')
    if (cls) list.push(['levelUpSteps', id, cls._id, 1])
    list.push(['save', id, 'wis', []]) // 故意不给骰点：应得“缺骰点”
    list.push(...itemScenarios(a))
  }
  list.push(['unsupported'])
  return list
}

/** 在页面里按顺序跑：call(fn, ...args) 由调用方提供（原件页注入的命令，或结算小窗的 call）。 */
export const runScenarios = async (call, list) => {
  const out = []
  for (const [fn, ...args] of list) out.push(await call(fn, ...args))
  return out
}

// 完成页只读作者当前选择与校验结果。具体数值、可用数、表单有效性都由作者给出。
/* eslint-disable @typescript-eslint/no-explicit-any -- 私人完整版未提供类型声明。 */
export interface NativeStepStatus { text: string; pending?: boolean }

export function nativeStepStatus(model: any): ReadonlyMap<string, NativeStepStatus> {
  const out = new Map<string, NativeStepStatus>()
  const levels = model.compClass.compsClassLevelSelect.flatMap((row: any) => row?.getTargetLevel() ?? [])
  out.set('职业', levels.length
    ? { text: levels.map((level: number) => `${level} 级`).join(' / ') }
    : { text: '待选职业和等级', pending: true })

  const statgen = model.compAbility.compStatgen
  const { mode, totals } = statgen.getTotals()
  const values = Object.values(totals[mode] ?? {})
  const state = statgen._state
  const parser = (globalThis as any).Parser
  const unassigned = parser.ABIL_ABVS.filter((key: string) => {
    switch (mode) {
      case 'array': return state[statgen.constructor._array_getProps(key).propAbilSelectedScoreIx] == null
      case 'rolled': return state[statgen.constructor._rolled_getProps(key).propAbilSelectedRollIx] == null
      case 'manual': return !state[statgen.constructor._manual_getProps(key).propAbilValue]
      default: return false
    }
  }).length
  out.set('属性值', !values.length
    ? { text: '待选属性分配方式', pending: true }
    : unassigned ? { text: `还有 ${unassigned} 项属性未分配`, pending: true }
      : { text: values.join(' / ') })

  const equipment = model.compEquipment
  const standard = equipment.compEquipmentStartingDefault
  if (standard?.isAvailable && equipment.isStandardStartingEquipmentActive_()) {
    out.set('起始装备', standard._isValid_standard() ? { text: '已选好' } : { text: '还有装备未选择', pending: true })
  }
  const shop = equipment.compEquipmentShopGold
  if (shop?.isAvailable && !shop._isValid_gold()) out.set('装备商店', { text: '超出可用金币', pending: true })

  const spellProgress: string[] = []
  let spellPending = false
  for (const form of model.compSpell.compsSpellSpells) {
    const counts = form?._state
    if (!counts) continue
    for (const [title, selected, total] of [
      ['戏法', counts.cntLearnedCantrips, counts.maxLearnedCantrips],
      ['准备法术', counts.cntPrepared, counts.maxPrepared],
    ]) {
      if (!total) continue
      spellProgress.push(`${title} ${selected}/${total}`)
      if (selected < total) spellPending = true
    }
  }
  // 准备较少法术仍允许作者处理。显示实际数量，由玩家明确处理这一项。
  if (spellProgress.length) out.set('法术', { text: spellProgress.join(' · ') + (spellPending ? ' · 可继续选择' : '') })
  return out
}

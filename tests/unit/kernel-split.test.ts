import { describe, expect, it } from 'vitest'
import {
  applyActorState, applyCombatChange, applyKernelChanges, emptyCombat, jsonDiff, refKey, splitActor,
  type KernelRefMapper,
} from '../../src/core/saves/split'
import { kernelCampaignSchema, type KernelActor, type KernelChange } from '../../src/schemas/kernel'

const mapRef: KernelRefMapper = (flags) => {
  if (!flags.propDroppable || !flags.source || !flags.hash) return null
  return { kind: flags.propDroppable, set: 'cn-official', prop: flags.propDroppable, hash: flags.hash }
}

function item(id: string, type: string, name: string, flags: Record<string, unknown>, advancement: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    _id: id, name, type, flags: { plutonium: flags },
    system: { advancement, equipped: true },
  }
}

function rebuiltData(): Record<string, unknown> {
  return {
    _id: 'actor1', name: '测试角色',
    system: { attributes: { hp: { value: 7, max: 7 }, spells: { spell1: { value: 2 } } } },
    items: [
      item('race1', 'race', 'Dragonborn', { page: 'races.html', source: 'PHB', hash: 'dragonborn_phb', propDroppable: 'race' }, {
        asi: { _id: 'adv1', type: 'AbilityScoreImprovement', level: 0, value: { type: 'asi', assignments: { str: 2 } } },
      }),
      item('class1', 'class', 'Barbarian', { page: 'classes.html', source: 'PHB', hash: 'barbarian_phb', propDroppable: 'class' }, {
        hp: { _id: 'adv2', type: 'HitPoints', value: { 1: 'avg' } },
      }),
      item('weapon1', 'weapon', 'Battleaxe', { page: 'items.html', source: 'PHB', hash: 'battleaxe_phb', propDroppable: 'item' }),
    ],
    effects: [],
  }
}

describe('P3-3b 拆分：引用 / 选择 / 状态差别', () => {
  it('完整人物 + 重建基准 → 三样东西；再叠回去与原人物一致', () => {
    const rebuilt = rebuiltData()
    const current = structuredClone(rebuilt)
    const system = current.system as { attributes: { hp: { value: number } } }
    system.attributes.hp.value = 2
    const items = current.items as Array<Record<string, unknown> & { system: Record<string, unknown> }>
    items.find((i) => i._id === 'weapon1')!.system.equipped = false
    items.push({ _id: 'loot1', name: '玩家捡到的备注物品', type: 'loot', flags: {}, system: {} })
    ;(current.effects as Array<Record<string, unknown>>).push({ _id: 'bloodied', name: 'Bloodied', flags: {}, system: {} })

    const choices = {
      'cn-official|race|dragonborn_phb': [{ id: 'adv1', type: 'AbilityScoreImprovement', level: 0, data: { type: 'asi', assignments: { str: 2 } } }],
    }
    const split = splitActor({ id: 'actor1', name: '测试角色', data: current }, { id: 'actor1', name: '测试角色', data: rebuilt }, mapRef, choices)
    expect(split.refs.map((r) => r.hash)).toEqual(['dragonborn_phb', 'barbarian_phb', 'battleaxe_phb'])
    expect(split.refs.every((r) => r.set === 'cn-official' && r.itemId)).toBe(true)
    expect(split.choices[refKey(split.refs[0])]).toEqual([
      { id: 'adv1', type: 'AbilityScoreImprovement', level: 0, data: { type: 'asi', assignments: { str: 2 } } },
    ])
    expect(split.state.actor).toEqual({ system: { attributes: { hp: { value: 2 } } } })
    expect(split.state.items['ref:item|battleaxe_phb']).toMatchObject({ system: { equipped: false } })
    expect(split.state.itemAdded).toHaveLength(1)
    expect(split.state.effectAdded).toHaveLength(1)
    expect(applyActorState(rebuilt, split.state)).toEqual(current)
  })

  it('没有基准的物品/效果进 added；基准有而现在的没有进 removed', () => {
    const rebuilt = rebuiltData()
    const current = structuredClone(rebuilt)
    const items = current.items as Array<Record<string, unknown>>
    items.splice(1, 1)
    items.push({ _id: 'new1', name: '新物品', type: 'loot', flags: {}, system: {} })
    const split = splitActor({ id: 'actor1', name: 'x', data: current }, { id: 'actor1', name: 'x', data: rebuilt }, mapRef, {})
    expect(split.state.itemRemoved).toEqual(['ref:class|barbarian_phb'])
    expect(split.state.itemAdded.map((i) => i._id)).toEqual(['new1'])
    expect(applyActorState(rebuilt, split.state)).toEqual(current)
  })

  it('删除字段用 -= 键；叠回去会删掉', () => {
    const base = { a: { b: 1, c: 2 } }
    const current = { a: { b: 1 } }
    const diff = jsonDiff(base, current)
    expect(diff).toEqual({ a: { '-=c': null } })
    expect(applyActorState(base, { actor: diff, items: {}, effects: {}, itemAdded: [], itemRemoved: [], effectAdded: [], effectRemoved: [] })).toEqual({ ...current, items: [], effects: [] })
  })
})

describe('P3-3b 战斗：战役层只存一份', () => {
  it('开战/先攻/回合叠进同一份战斗，不挂到人物身上', () => {
    const changes: KernelChange[] = [
      { action: 'create', type: 'Combat', pack: null, parentUuid: null, data: { _id: null, name: '遭遇', round: 0, turn: null, active: false,
        combatants: [{ _id: 'c1', actorId: 'hero', initiative: null }, { _id: 'c2', actorId: 'monster', initiative: null }] } },
      { action: 'update', type: 'Combatant', pack: null, parentUuid: 'Combat.combat1', data: { _id: 'c1', initiative: 20 } },
      { action: 'update', type: 'Combatant', pack: null, parentUuid: 'Combat.combat1', data: { _id: 'c2', initiative: 3 } },
      { action: 'update', type: 'Combat', pack: null, parentUuid: null, data: { _id: 'combat1', round: 1, turn: 0, active: true } },
    ]
    let combat = emptyCombat()
    for (const change of changes) combat = applyCombatChange(combat, change)
    expect(combat).toMatchObject({ id: 'combat1', name: '遭遇', round: 1, turn: 0, active: true })
    expect(combat.combatants.map((c) => [c.actorId, c.initiative])).toEqual([['hero', 20], ['monster', 3]])

    const actor: KernelActor = { id: 'hero', name: '英雄', seed: '英雄', refs: [], choices: {}, state: { actor: {}, items: {}, effects: {}, itemAdded: [], itemRemoved: [], effectAdded: [], effectRemoved: [] }, adjustments: {}, dice: [], legacy: false }
    const kernel = kernelCampaignSchema.parse({
      rule: 'dnd5e2014', kernelVersion: 1,
      library: { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} },
      actors: [actor], revision: 0, undo: [],
    })
    const next = applyKernelChanges(kernel, changes, mapRef)
    expect(next.combat).toMatchObject({ id: 'combat1', round: 1 })
    expect(next.actors[0].state.actor).toEqual({})
  })
})

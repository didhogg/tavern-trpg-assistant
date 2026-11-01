import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  { id: 'spell.delayed-blast-fireball.phb', path: '/data/damage', op: 'set', before: [{ dice: '12d6', type: 'force' }], after: [{ dice: '12d6', type: 'fire' }], basis: 'PHB 第 11 章延迟爆裂火球：12d6 火焰' },
  { id: 'spell.flame-strike.phb', path: '/data/damage', op: 'set', before: [{ dice: '4d6', type: 'fire' }], after: [{ dice: '4d6', type: 'fire' }, { dice: '4d6', type: 'radiant' }], basis: 'PHB 第 11 章焰击术：4d6 火焰＋4d6 光耀' },
  { id: 'spell.guardian-of-faith.phb', path: '/data/damage', op: 'set', before: undefined, after: [{ dice: '20', type: 'radiant' }], basis: 'PHB 第 11 章守护之faith：固定 20 点光耀' },
  { id: 'spell.ice-storm.phb', path: '/data/damage', op: 'set', before: [{ dice: '2d8', type: 'cold' }], after: [{ dice: '2d8', type: 'bludgeoning' }, { dice: '4d6', type: 'cold' }], basis: 'PHB 第 11 章冰风暴：2d8 钝击＋4d6 寒冷' },
  { id: 'spell.meteor-swarm.phb', path: '/data/damage', op: 'set', before: [{ dice: '20d6', type: 'fire' }], after: [{ dice: '20d6', type: 'fire' }, { dice: '20d6', type: 'bludgeoning' }], basis: 'PHB 第 11 章流星爆：20d6 火焰＋20d6 钝击' },
]

import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  {
    id: 'spell.eldritch-blast.phb',
    path: '/data/cantripScaling',
    op: 'set',
    before: undefined,
    after: { label: '射线数', scaling: { '1': '1', '5': '2', '11': '3', '17': '4' } },
    basis: 'PHB 第 11 章魔能爆：5、11、17 级各增加一道射线',
  },
]

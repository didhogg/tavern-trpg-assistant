import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  {
    id: 'class.bard.phb',
    path: '/data/proficiencies/toolChoose',
    op: 'set',
    before: undefined,
    after: { count: 3, from: ['tool:anyMusicalInstrument'] },
    basis: 'PHB 吟游诗人“熟练项”p51：自选三种乐器',
  },
  {
    id: 'class.bard.phb',
    path: '/data/multiclass/proficiencies/toolChoose',
    op: 'set',
    before: undefined,
    after: { count: 1, from: ['tool:anyMusicalInstrument'] },
    basis: 'PHB 吟游诗人多职业熟练项 p164：一种自选乐器',
  },
  {
    id: 'class.monk.phb',
    path: '/data/proficiencies/toolChoose',
    op: 'set',
    before: undefined,
    after: { count: 1, from: ['tool:anyArtisansTool', 'tool:anyMusicalInstrument'] },
    basis: 'PHB 武僧“熟练项”p76：选择一种工匠工具或一种乐器',
  },
  {
    id: 'class.artificer.tce',
    path: '/data/proficiencies/toolChoose',
    op: 'set',
    before: undefined,
    after: { count: 1, from: ['tool:anyArtisansTool'] },
    basis: 'TCE 奇械师“熟练项”p9：一种自选工匠工具',
  },
]

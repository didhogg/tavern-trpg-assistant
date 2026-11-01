import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  {
    id: 'subclass.monk-way-of-the-four-elements.phb',
    path: '/data/spellcasting',
    op: 'delete',
    before: { ability: 'wis', preparation: { mode: 'known' }, progression: 'full' },
    basis: 'PHB 四象武僧 p81：用气点施放元素术式，不按法术位施法',
  },
  {
    id: 'subclass.barbarian-path-of-the-ancestral-guardian.xge',
    path: '/data/spellcasting',
    op: 'delete',
    before: { ability: 'wis', preparation: { mode: 'known' }, progression: 'full' },
    basis: 'XGE 先祖守护者 p10：该子职业没有施法',
  },
]

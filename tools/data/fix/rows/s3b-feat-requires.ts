import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  {
    id: 'feat.elven-accuracy.xge',
    path: '/data/requires',
    op: 'set',
    before: { all: [{ text: 'race.elf.phb 或 race.half-elf.phb' }] },
    after: { any: [{ race: ['race.elf.phb', 'race.half-elf.phb'] }] },
    basis: 'XGE 种族专长表：精灵之准限精灵、半精灵',
  },
  {
    id: 'feat.prodigy.xge',
    path: '/data/requires',
    op: 'set',
    before: { all: [{ text: 'race.half-elf.phb 或 race.half-orc.phb 或 race.human.phb' }] },
    after: { any: [{ race: ['race.half-elf.phb', 'race.half-orc.phb', 'race.human.phb'] }] },
    basis: 'XGE 种族专长表：天赋异禀限半精灵、半兽人、人类',
  },
]

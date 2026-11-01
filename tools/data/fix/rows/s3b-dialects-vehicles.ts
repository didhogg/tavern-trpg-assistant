import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  {
    id: 'language.primordial.phb',
    path: '/data/dialectCodes',
    op: 'set',
    before: undefined,
    after: [
      { code: 'aquan', name: '水族语' },
      { code: 'auran', name: '气族语' },
      { code: 'ignan', name: '火族语' },
      { code: 'terran', name: '土族语' },
    ],
    basis: 'PHB 语言表 p123：原初语含气、水、火、土四种方言；保留原 dialects 数组',
  },
  { id: 'background.folk-hero.phb', path: '/data/advancement/0/grants/2', op: 'set', before: 'tool:vehicles (land)', after: 'code:vehicles-land', basis: 'PHB 民间英雄 p?：工具熟练项 载具（陆运）' },
  { id: 'background.mercenary-veteran.scag', path: '/data/advancement/0/grants/2', op: 'set', before: 'tool:vehicles (land)', after: 'code:vehicles-land', basis: 'SCAG 佣兵老兵：载具（陆运）' },
  { id: 'background.soldier.phb', path: '/data/advancement/0/grants/2', op: 'set', before: 'tool:vehicles (land)', after: 'code:vehicles-land', basis: 'PHB 士兵 p?：载具（陆运）' },
  { id: 'background.sailor.phb', path: '/data/advancement/0/grants/3', op: 'set', before: 'tool:vehicles (water)', after: 'code:vehicles-water', basis: 'PHB 水手 p?：载具（水运）' },
  { id: 'background.variant-sailor-pirate.phb', path: '/data/advancement/0/grants/3', op: 'set', before: 'tool:vehicles (water)', after: 'code:vehicles-water', basis: 'PHB 水手（海盗变体）：载具（水运）' },
]

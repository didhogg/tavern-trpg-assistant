import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  { id: 'monster.duergar.mm', path: '/data/hp/formula', op: 'set', before: '4d8 + 4', after: '4d8 + 8', basis: 'MM 灰矮人 p122：26 (4d8+8)' },
  { id: 'monster.vine-blight.mm', path: '/data/hp/formula', op: 'set', before: '4d8 + 4', after: '4d8 + 8', basis: 'MM 枯藤怪 p32：26 (4d8+8)' },
  { id: 'monster.ulitharid.mpmm', path: '/data/hp/formula', op: 'set', before: '17d10 + 14', after: '17d10 + 34', basis: 'MPMM 噬魂怪 p249：127 (17d10+34)' },
  { id: 'monster.ulitharid.vgm', path: '/data/hp/formula', op: 'set', before: '17d10 + 14', after: '17d10 + 34', basis: 'VGM 噬魂怪 p175：127 (17d10+34)' },
  { id: 'monster.cloud-giant-smiling-one.vgm', path: '/data/hp/formula', op: 'set', before: '21d12 + 128', after: '21d12 + 126', basis: 'VGM 云巨人欢笑者 p146：262 (21d12+126)' },
  { id: 'monster.master-thief.vgm', path: '/data/hp/average', op: 'set', before: 83, after: 84, basis: 'VGM 盗贼大师 p216：84 (13d8+26)' },
  { id: 'monster.shadow-mastiff-alpha.vgm', path: '/data/hp/formula', op: 'delete', before: '6d8 + 6', basis: 'VGM 阴影獒犬首领 p190：只写生命值 42–54，没有骰式' },
  { id: 'monster.shadow-mastiff-alpha.vgm', path: '/data/hp/special', op: 'set', before: undefined, after: '原书：生命值 42–54（高于普通阴影獒犬）；此处取中值 48', basis: 'VGM 阴影獒犬首领 p190' },
]

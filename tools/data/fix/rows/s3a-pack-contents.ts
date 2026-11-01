import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  { id: 'item.priests-pack.phb', path: '/data/contents/4', op: 'insert', after: { item: 'item.alms-box.phb', qty: 1 }, basis: 'PHB 装备章 p151：祭司套组含施舍箱×1' },
  { id: 'item.priests-pack.phb', path: '/data/contents/5', op: 'insert', after: { item: 'item.block-of-incense.phb', qty: 2 }, basis: 'PHB 装备章 p151：祭司套组含香块×2' },
  { id: 'item.priests-pack.phb', path: '/data/contents/6', op: 'insert', after: { item: 'item.censer.phb', qty: 1 }, basis: 'PHB 装备章 p151：祭司套组含香炉×1' },
  { id: 'item.priests-pack.phb', path: '/data/contents/7', op: 'insert', after: { item: 'item.vestments.phb', qty: 1 }, basis: 'PHB 装备章 p151：祭司套组含祭袍×1' },
  { id: 'item.scholars-pack.phb', path: '/data/contents/4/qty', op: 'set', before: 1, after: 10, basis: 'PHB 装备章 p151：学者套组含羊皮纸×10' },
  { id: 'item.scholars-pack.phb', path: '/data/contents/5', op: 'insert', after: { item: 'item.little-bag-of-sand.phb', qty: 1 }, basis: 'PHB 装备章 p151：学者套组含小袋沙×1' },
  { id: 'item.scholars-pack.phb', path: '/data/contents/6', op: 'insert', after: { item: 'item.small-knife.phb', qty: 1 }, basis: 'PHB 装备章 p151：学者套组含小刀×1' },
  { id: 'item.burglars-pack.phb', path: '/data/contents/13', op: 'insert', after: { item: 'item.string-10-feet.phb', qty: 1 }, basis: 'PHB 装备章 p151：窃贼套组含细绳(10尺)×1' },
]

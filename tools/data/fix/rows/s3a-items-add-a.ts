import type { Fix } from '../engine'
import { newSrdItem } from '../lib/newSrdItem'

export const ROWS: Fix[] = [
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.alms-box.phb', '施舍箱', 'Alms box', 151), basis: 'PHB 第 5 章装备套组 p151：祭司套组内容；无单独价格重量' },
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.block-of-incense.phb', '香块', 'Block of incense', 151), basis: 'PHB 第 5 章装备套组 p151：祭司套组内容；无单独价格重量' },
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.censer.phb', '香炉', 'Censer', 151), basis: 'PHB 第 5 章装备套组 p151：祭司套组内容；无单独价格重量' },
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.vestments.phb', '祭袍', 'Vestments', 151), basis: 'PHB 第 5 章装备套组 p151：祭司套组内容；无单独价格重量' },
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.little-bag-of-sand.phb', '小袋沙', 'Little bag of sand', 151), basis: 'PHB 第 5 章装备套组 p151：学者套组内容；无单独价格重量' },
]

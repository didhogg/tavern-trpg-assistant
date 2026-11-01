import type { Fix } from '../engine'
import { newSrdItem } from '../lib/newSrdItem'

export const ROWS: Fix[] = [
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.small-knife.phb', '小刀', 'Small knife', 151), basis: 'PHB 第 5 章装备套组 p151：学者套组内容；无单独价格重量' },
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.string-10-feet.phb', '细绳(10尺)', 'String (10 feet)', 151), basis: 'PHB 第 5 章装备套组 p151：窃贼套组内容；无单独价格重量' },
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.animal-feed-1-day.phb', '动物饲料(1日份)', 'Animal Feed (1 day)', 150, 5, 10), basis: 'PHB 冒险用品表 p150：饲料 feed（每日份）5 cp、10 磅' },
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.flask-or-tankard.phb', '酒壶或大杯', 'Flask or tankard', 150, 2, 1), basis: 'PHB 冒险用品表 p150：扁瓶 flask 或大杯 tankard 2 cp、1 磅' },
  { op: 'add', pack: 'dnd5e2014-srd', entry: newSrdItem('item.jug-or-pitcher.phb', '壶或罐', 'Jug or pitcher', 150, 2, 4), basis: 'PHB 冒险用品表 p150：壶 jug 或罐 pitcher 2 cp、4 磅' },
]

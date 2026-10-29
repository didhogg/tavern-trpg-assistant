import type { Activity } from '../../../src/rules/dnd5e2014/data/activities'

export const ITEM_ACTIVITIES: Record<string, Activity[]> = {
  'item.potion-of-healing.dmg': [{ id: 'item.potion-of-healing.dmg.drink', name: '饮用治疗药水', kind: 'heal', formula: '2d4+2', activation: { type: 'action' }, consumption: { targets: [{ type: 'itemUses', value: 1 }] } }],
  'item.potion-of-greater-healing.dmg': [{ id: 'item.potion-of-greater-healing.dmg.drink', name: '饮用高等治疗药水', kind: 'heal', formula: '4d4+4', activation: { type: 'action' }, consumption: { targets: [{ type: 'itemUses', value: 1 }] } }],
  'item.potion-of-superior-healing.dmg': [{ id: 'item.potion-of-superior-healing.dmg.drink', name: '饮用强效治疗药水', kind: 'heal', formula: '8d4+8', activation: { type: 'action' }, consumption: { targets: [{ type: 'itemUses', value: 1 }] } }],
  'item.potion-of-supreme-healing.dmg': [{ id: 'item.potion-of-supreme-healing.dmg.drink', name: '饮用极效治疗药水', kind: 'heal', formula: '10d4+20', activation: { type: 'action' }, consumption: { targets: [{ type: 'itemUses', value: 1 }] } }],
}

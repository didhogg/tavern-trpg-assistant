import type { Fix } from '../engine'

const attack = (id: string, name: string, kind: 'mw' | 'rw' | 'rs', damage: string, type: string, bonus?: number, range?: { type: string; amount: number; unit: string }) => ({
  id, name, kind: 'attack', attackKind: kind, activation: { type: 'action' },
  ...(bonus === undefined ? {} : { bonus }), damage: [{ dice: damage, type }], ...(range ? { range } : {}),
})

export const ROWS: Fix[] = [
  { id: 'object.ballista.dmg', path: '/data/activities', op: 'set', before: undefined, after: [attack('object.ballista.dmg.bolt', '弩矢（攻击）', 'rw', '3d10', 'piercing', 6, { type: 'distance', amount: 120, unit: 'ft' })], basis: 'DMG 弩炮动作：远程武器攻击 +6，3d10 穿刺，120/480 尺' },
  { id: 'object.cannon.dmg', path: '/data/activities', op: 'set', before: undefined, after: [attack('object.cannon.dmg.shot', '炮弹（攻击）', 'rw', '8d10', 'bludgeoning', 6, { type: 'distance', amount: 600, unit: 'ft' })], basis: 'DMG 火炮动作：远程武器攻击 +6，8d10 钝击，600/2,400 尺' },
  { id: 'object.mangonel.dmg', path: '/data/activities', op: 'set', before: undefined, after: [attack('object.mangonel.dmg.shot', '弹射投石（攻击）', 'rw', '5d10', 'bludgeoning', 5, { type: 'distance', amount: 200, unit: 'ft' })], basis: 'DMG 投石机动作：远程武器攻击 +5，5d10 钝击，200/800 尺' },
  { id: 'object.ram.dmg', path: '/data/activities', op: 'set', before: undefined, after: [attack('object.ram.dmg.attack', '攻城槌（攻击）', 'mw', '3d10', 'bludgeoning', 8, { type: 'reach', amount: 5, unit: 'ft' })], basis: 'DMG 攻城槌动作：近战武器攻击 +8，3d10 钝击，触及 5 尺' },
  { id: 'object.trebuchet.dmg', path: '/data/activities', op: 'set', before: undefined, after: [attack('object.trebuchet.dmg.shot', '配重投石（攻击）', 'rw', '8d10', 'bludgeoning', 5, { type: 'distance', amount: 300, unit: 'ft' })], basis: 'DMG 配重投石机动作：远程武器攻击 +5，8d10 钝击，300/1,200 尺' },
  { id: 'object.eldritch-cannon-force-ballista.tce', path: '/data/activities', op: 'set', before: undefined, after: [attack('object.eldritch-cannon-force-ballista.tce.attack', '力场弩炮（攻击）', 'rs', '2d8', 'force', undefined, { type: 'distance', amount: 120, unit: 'ft' })], basis: 'TCE 力量弩炮：120 尺远程法术攻击，2d8 力场' },
  { id: 'object.eldritch-cannon-flamethrower.tce', path: '/data/activities', op: 'set', before: undefined, after: [{ id: 'object.eldritch-cannon-flamethrower.tce.flame', name: '烈焰喷射', kind: 'save', activation: { type: 'action' }, ability: 'dex', dc: 'spell', onSave: 'half', damage: [{ dice: '2d8', type: 'fire' }], target: { area: { shape: 'cone', size: 15 } } }], basis: 'TCE 投火机：15 尺锥形，敏捷豁免对抗法术 DC，2d8 火焰，成功半伤' },
  { id: 'object.suspended-cauldron.dmg', path: '/data/activities', op: 'set', before: undefined, after: [{ id: 'object.suspended-cauldron.dmg.oil', name: '滚油', kind: 'save', activation: { type: 'action' }, ability: 'dex', dc: 15, onSave: 'half', damage: [{ dice: '3d6', type: 'fire' }], target: { area: { shape: 'square', size: 10 } } }], basis: 'DMG 吊挂大锅：10 尺方形，DC15 敏捷豁免，3d6 火焰，成功半伤' },
  { id: 'object.eldritch-cannon-protector.tce', path: '/data/activities', op: 'set', before: undefined, after: [{ id: 'object.eldritch-cannon-protector.tce.protect', name: '保护者', kind: 'utility', activation: { type: 'action' }, text: '给予它自己和10尺内每个你选择的生物 1d8+智力调整值（最低+1）的临时生命值。' }], basis: 'TCE 防御者：临时生命值，不用 heal' },
]

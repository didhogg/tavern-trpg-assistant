import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  { id: 'object.generic-object.dmg', path: '/data/immune', op: 'set', before: ['多种（见下文）'], after: ['poison', 'psychic'], basis: 'DMG 物件与伤害类型：毒素和心灵伤害无法作用于物件' },
]

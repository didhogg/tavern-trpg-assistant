import type { Added, Allow, AllowRequires } from './types'

/** E4 子站（补充层数据文件产生的变化）的放行规则：每条用 `ids` 精确列条目，`expect` ＝ 条目数（来自 E_逐条站.md／规格，不是跑出来再抄）。 */
export const ALLOW: Allow[] = [
  {
    name: 'e4-3-3c-leftovers',
    station: 4,
    ids: ['monster.archmage.mm', 'monster.archmage-familiar.mm', 'object.eldritch-cannon-flamethrower.tce', 'object.eldritch-cannon-force-ballista.tce', 'object.eldritch-cannon-protector.tce', 'monster.deck-defender.bmt'],
    path: /^(?:\/data\/(?:resist|resistConditional|hp)(?:\/|$)|\/i18n\/en\/fields\/hp\.special$)/,
    expect: 6,
    reason: 'c1-resist-text 3→1（狗头人保留）、c10-object-no-stats 3→0、c13-hp-special-other 1→0',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []

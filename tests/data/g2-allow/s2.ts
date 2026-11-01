import type { Added, Allow, AllowRequires } from './types'

/** 第 2 站的放行规则（规则见 docs/handoff/D1.2-G2.5_执行包/00 第 7 节）。 */
export const ALLOW: Allow[] = [
  {
    name: 's2-price-decimal',
    station: 2,
    ids: [
      'item.sling-bullet.phb',
      'item.sling-bullet-plus-1.dmg',
      'item.sling-bullet-plus-2.dmg',
      'item.sling-bullet-plus-3.dmg',
      'item.sling-bullet-silvered.phb',
      'item.sling-bullet-adamantine.xge',
      'item.sling-bullet-walloping.xge',
      'item.sling-bullet-bloodseeker.bmt',
      'item.sling-bullet-dried-leech.bmt',
      'item.sling-bullet-winged.bmt',
      'item.ball-bearing.phb',
    ],
    path: /^\/data\/value$/,
    expect: 11,
    reason: 'a15-value：价格保留一位小数，11 件单颗弹药/滚珠由 0 改为 0.2/0.1',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []

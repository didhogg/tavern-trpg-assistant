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
  {
    name: 's2-starting-equipment-ids',
    station: 2,
    ids: ['background.cloistered-scholar.scag', 'background.rewarded.bmt', 'background.sage.phb', 'background.charlatan.phb'],
    path: /^\/data\/equipment\/\d+\/(fixed\/\d+|choice\/\d+\/\d+)\/id$/,
    expect: 4,
    reason: 'a3-missed-match / a3-described：8 项起始装备补 id，4 个背景条目',
  },
  {
    name: 's2-pool-spelling',
    station: 2,
    ids: [
      'background.far-traveler.scag',
      'background.inheritor.scag',
      'background.knight-of-the-order.scag',
      'background.urban-bounty-hunter.scag',
      'background.uthgardt-tribe-member.scag',
      'background.waterdhavian-noble.scag',
      'subclass.cleric-forge-domain.xge',
      'subclass.fighter-cavalier.xge',
      'subclass.fighter-rune-knight.tce',
      'subclass.monk-way-of-the-drunken-master.xge',
      'subclass.rogue-assassin.phb',
    ],
    path: /^\/data\/advancement\//,
    expect: 11,
    reason: 'a17-spelling：任选记号 7 种旧写法统一成规范写法',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []

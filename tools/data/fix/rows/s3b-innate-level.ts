import type { Fix } from '../engine'

// 解锁等级（level）已由转换器直接读 5etools additionalSpells.innate 的等级键生成（G2.5 P6），这里只留来源本身与原书不一致的三处次数修正。
export const ROWS: Fix[] = [
  {
    id: 'race.yuan-ti-pureblood.vgm',
    path: '/data/effects/1/uses',
    op: 'delete',
    before: { max: 1, recharge: 'long' },
    basis: 'VGM 蛇人纯血：化兽为友可无限制施放（仅能以蛇为目标）',
  },
  {
    id: 'race.yuan-ti.mpmm',
    path: '/data/effects/1/uses',
    op: 'delete',
    before: { max: 1, recharge: 'long' },
    basis: 'MPMM 蛇人：化兽为友可无限制施放（仅能以蛇为目标）',
  },
  {
    id: 'subrace.tiefling-mammon.mtf',
    path: '/data/effects/1/uses/recharge',
    op: 'set',
    before: 'long',
    after: 'shortOrLong',
    basis: 'MTF 魔蒙提夫林：谭森浮碟术完成短休或长休后恢复',
  },
]

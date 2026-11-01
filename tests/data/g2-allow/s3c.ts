import type { Added, Allow, AllowRequires } from './types'

/** 第 3 站 3c 怪物与世界 的放行规则。 */
export const ALLOW: Allow[] = [
  {
    name: 's3c-hp',
    station: 3,
    ids: ['monster.duergar.mm', 'monster.vine-blight.mm', 'monster.ulitharid.mpmm', 'monster.ulitharid.vgm', 'monster.cloud-giant-smiling-one.vgm', 'monster.master-thief.vgm', 'monster.shadow-mastiff-alpha.vgm'],
    path: /^\/data\/hp(?:\/|$)/,
    expect: 7,
    reason: 'c1-mm-hp-formula / c1-hp-formula-mismatch：7 个怪物生命骰式/固定值',
  },
  {
    name: 's3c-passive',
    station: 3,
    ids: ['monster.homunculus-servant.tce', 'monster.steel-defender.tce'],
    path: /^\/data\/(?:passive|skills\/)/,
    expect: 2,
    reason: 'c1-passive-missing：两个人造伙伴补被动察觉与 TCE 的 +PB 技能基线',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []

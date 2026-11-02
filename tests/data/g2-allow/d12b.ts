import type { Added, Allow, AllowRequires } from './types'

/** D1.2b：核心 11 包只新增怪物 art（§5.1）；expect 是批 5 实测有 art 的核心怪物数。 */
export const ALLOW: Allow[] = [
  {
    name: 'd12b-art',
    station: 6,
    type: 'monster',
    path: /^\/data\/art(?:\/|$)/,
    expect: 996,
    reason: 'D1.2b §5.1：核心 11 包怪物新增头像/token 地址与焦点',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []

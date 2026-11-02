import type { Added, Allow, AllowRequires } from './types'

/** 任务一 §3.2：核心 11 包怪物新增 inventory（护甲、盾牌与携带物）；其余条目类型不动。 */
export const ALLOW: Allow[] = [
  {
    name: 't1-monster-inventory',
    station: 8,
    type: 'monster',
    path: /^\/data\/inventory(?:\/|$)/,
    expect: 421,
    reason: '任务一 §3.2：怪物把 ac[].items 与 attachedItems 汇总进与人物共用的 inventory',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []

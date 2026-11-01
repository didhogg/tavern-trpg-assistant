import type { Added, Allow, AllowRequires } from './types'

/** 第 3 站 3b 种族、背景、法术、专长 的放行规则。 */
export const ALLOW: Allow[] = [
  {
    name: 's3b-size',
    station: 3,
    ids: ['subrace.gnome-forest.phb', 'subrace.gnome-rock.phb', 'subrace.halfling-lightfoot.phb', 'subrace.halfling-stout.phb'],
    path: /^\/data\/size\/0$/,
    expect: 4,
    reason: 'a12-size：4 个亚种体型 M→S',
  },
  {
    name: 's3b-human-variant',
    station: 3,
    ids: ['subrace.human-variant.phb'],
    path: /^\/data\/abilityBonus\/replace$/,
    expect: 1,
    reason: 'a12-abilities：变体人类属性加值 replace=true',
  },
]
export const ADDED: Added[] = []
export const ALLOW_REQUIRES: AllowRequires[] = []

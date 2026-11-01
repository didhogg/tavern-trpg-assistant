import type { Added, Allow, AllowRequires } from './types'

/** 第 1 站（5etools 导入，规划者）的放行规则：每条的 expect 都是实际命中的条目数。 */
export const ALLOW: Allow[] = [
  { name: 's1-charges-recharge-amount', station: 1, type: 'item', path: /^\/data\/charges\/rechargeAmount$/, expect: 174, reason: 'b7-charges-*：5etools rechargeAmount（每次恢复多少）' },
  { name: 's1-spell-upcast', station: 1, type: 'spell', path: /^\/data\/upcast$/, expect: 74, reason: 'b8：5etools {@scaledamage}/{@scaledice} 升环（63 个自动结构化，11 个认不准的只留 note 原文）' },
  { name: 's1-spell-upcast-i18n', station: 1, type: 'spell', path: /^\/i18n\/en\/fields\/upcast\.\d+\.text$/, expect: 11, reason: 'upcast note 的英文对照（跟 higherLevel 同源）' },
  { name: 's1-spell-material-cost', station: 1, type: 'spell', path: /^\/data\/components\/m\/cost$/, expect: 76, reason: 'b11-cost-missing：材料价格（铜币）' },
  { name: 's1-spell-material-consumed', station: 1, type: 'spell', path: /^\/data\/components\/m\/consumed$/, expect: 39, reason: 'b11-consumed-missing：材料是否消耗（36 个 true，3 个 "optional"）' },
  { name: 's1-spell-attack', station: 1, type: 'spell', path: /^\/data\/attack$/, expect: 35, reason: '法术攻击类型 attack（5etools spellAttack：M→ms、R→rs）' },
  { name: 's1-subclass-expanded-spells', station: 1, type: 'subclass', path: /^\/data\/expandedSpells\/\d+\/spells\/\d+$/, expect: 19, reason: 'a10-expanded-short：领域/誓言/扩展法术补挂（按包的依赖裁剪，不再按条目自己的硬引用裁；"法术名|来源"写法）' },
  { name: 's1-monster-superseded', station: 1, type: 'monster', path: /^\/data\/supersededBy$/, expect: 19, reason: 'd6-same-name-no-marker：VGM 的颜色版本按目标书里同名版本对应重印（格龙蛙人 18、阴影獒犬首领 1）' },
]

export const ADDED: Added[] = [
  { id: 'feature.artificer-spell-list.tce', pack: 'dnd5e2014-tce', station: 1, basis: '奇械师（TCE）完整法术表 95 个：5etools gendata-spell-source-lookup（class 与 classVariant）；已与 TCE 英文原书第 12–13 页逐项核对' },
]
export const ALLOW_REQUIRES: AllowRequires[] = []

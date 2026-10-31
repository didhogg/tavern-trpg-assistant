import { writeFileSync } from 'node:fs'
import { FIELD_COVERAGE } from '../config/fieldCoverage'

export type Action = 'supply' | 'mapped-i18n' | 'drop'
export interface Triage { path: string; bucket: string; action: Action; to?: string; kind?: string; why?: string }

const FACETS: Record<string, string> = {
  'monster.senseTags': 'sense', 'monster.languageTags': 'language', 'monster.traitTags': 'trait', 'monster.actionTags': 'action', 'monster.spellcastingTags': 'spellcasting',
  'monster.savingThrowForced': 'saveForced', 'monster.savingThrowForcedSpell': 'saveForcedSpell', 'monster.savingThrowForcedLegendary': 'saveForcedLegendary',
  'monster.conditionInflict': 'conditionInflict', 'monster.conditionInflictSpell': 'conditionInflictSpell', 'monster.conditionInflictLegendary': 'conditionInflictLegendary',
  'monster.damageTagsSpell': 'damageSpell', 'monster.damageTagsLegendary': 'damageLegendary',
  'race.traitTags': 'trait', 'subrace.traitTags': 'trait',
  'item.miscTags': 'misc', 'item-group.miscTags': 'misc', 'base-item.miscTags': 'misc', 'item-group.reqAttuneTags': 'reqAttune', 'item-group.reqAttuneTags[].class': 'reqAttune', 'item-group.reqAttuneTags[].spellcasting': 'reqAttune',
  'item.poison': 'poison', 'item.poisonTypes': 'poisonTypes', 'item.scfType': 'scf', 'item-group.scfType': 'scf', 'base-item.scfType': 'scf',
}
const SCALAR_ITEM = new Set(['tier', 'wondrous'])
const SAME_NAME_MONSTER = new Set(['alignmentPrefix', 'group', 'dragonAge', 'dragonCastingColor', 'familiar', 'summonedBySpell', 'summonedBySpellLevel', 'summonedByClass', 'pbNote', 'shortName', 'sizeNote', 'actionNote', 'legendaryHeader', 'attachedItems'])

const why = (path: string, text: string): string => `「${path}」${text}`

/** 按 R15 执行文档第 2 节的规则给每条 lost 一个处理初稿；拿不准的 action 为 drop 且 bucket 带 REVIEW，由人逐条改。 */
export function triageOf(path: string, affected: number): Triage {
  const type = path.split('.')[0]
  const rest = path.slice(type.length + 1)
  if (affected === 0) return { path, bucket: 'N0 核心无样本', action: 'drop', kind: 'out-of-scope', why: why(path, '在核心十本书里没有记录；D1.2b 扫描非核心来源时重新评估；出现时由未登记字段检查拦截') }
  if (/ENG_name$|\.caption$/.test(path)) {
    const protectedWord = /(?:^|\.)(uses|activities|effects|entries|name|level|damage|save|range|duration|components|prerequisite|requires|recovery|charges)(?:\.|\[|$)/i.test(path)
    return protectedWord ? { path, bucket: 'EN 英文名', action: 'mapped-i18n', to: 'i18n.en.name' } : { path, bucket: 'EN 英文名', action: 'drop', kind: 'derived', why: why(path, '是来源里的英文名；英文名已由 i18n.en 承载（R13）') }
  }
  if (type.includes('template')) return { path, bucket: 'TP 模板', action: 'drop', kind: 'out-of-scope', why: why(path, '是怪物或传奇组模板的定义；模板的结果已体现在展开后的条目里，核心输出没有对应条目') }
  const facet = FACETS[path] ?? FACETS[path.replace(/\[\]\./, '[].')]
  if (facet) return { path, bucket: 'TG 分类标签', action: 'supply', to: `data.facets.${facet}` }
  const versionOf = /^monster\._versions\[\]\.(\w+)$/.exec(path)
  if (versionOf && FACETS[`monster.${versionOf[1]}`]) return { path, bucket: 'TG 分类标签', action: 'supply', to: `data.facets.${FACETS[`monster.${versionOf[1]}`]}` }
  if (type === 'item' && SCALAR_ITEM.has(rest)) return { path, bucket: 'TG 分类标签', action: 'supply', to: `data.${rest}` }
  if (type === 'item-group' && SCALAR_ITEM.has(rest)) return { path, bucket: 'TG 分类标签', action: 'supply', to: `data.${rest}` }
  if (type === 'magic-variant' && rest === 'inherits.tier') return { path, bucket: 'TG 分类标签', action: 'supply', to: 'data.tier' }
  const head = rest.split('.')[0].replace(/\[\]$/, '')
  const drop = (kind: string, text: string, bucket = 'FM 版式/元数据'): Triage => ({ path, bucket, action: 'drop', kind, why: why(path, text) })
  const sup = (to: string, bucket = 'ST 结算与展示字段'): Triage => ({ path, bucket, action: 'supply', to })
  // 版式、出处、展开用元数据（所有类型通用）
  if (/\.style$|colStyles|\.items\[\]\.type$|\.entries\[\]\.type$|^[\w-]+\.type$/.test(path) && !/^(item|base-item|magic-variant|item-group)\.type$/.test(path) && type !== 'magic-variant') return drop('layout', '只管正文排版（样式或块类型），内容已由正文块表达')
  if (/referenceSources/.test(path)) return drop('internal-meta', '是同一物品在其他书中的参考出处列表；主出处已在 src，不影响内容')
  if (/additionalSources/.test(path)) return drop('internal-meta', '是附加正文的出处页码，附加正文本身并入 text；主出处已在 src')
  if (type === 'item-entry') return drop('derived', '物品正文模板已由转换器展开进物品正文（R3 起），模板本身不单独输出')
  if (type === 'legendary-group') return drop('internal-meta', '传奇组的出处与排版信息；区域/巢穴效果文字已并入怪物条目，不单独输出')
  if (type === 'magic-variant') return drop('internal-meta', '是魔法变体的展开元数据（继承、类型、效果合并）；展开后的物品已带上对应字段（见 item.* 的补充字段）')
  if (type === 'monster') {
    if (/\.cond$/.test(path)) return drop('derived', '布尔标记，表示该抗性/免疫/易伤带条件；条件说明已写进抗性文字')
    if (SAME_NAME_MONSTER.has(rest)) return sup(rest === 'attachedItems' ? 'data.attachedItems' : `data.extra.${rest}`)
    const sc = /^spellcasting\[\]\.(type|displayAs|hidden|chargesItem|footerEntries)$/.exec(rest)
    if (sc) return sup(`data.spellcasting[].${sc[1] === 'footerEntries' ? 'footer' : sc[1]}`)
    if (/^spellcasting\[\]\.spells\.\d\.lower$/.test(rest)) return sup('data.spellcasting[].spells')
    if (/^(_versions\[\]\.)?speed\./.test(rest) || /^speed\./.test(rest)) return sup('data.extra.speed')
    if (/^effects/.test(rest)) return sup('data.effects')
    if (/^skill\.other/.test(rest)) return sup('data.extra.skillOther')
    if (/^alignment\[\]\.chance$/.test(rest)) return sup('data.extra.alignmentChance')
    if (rest === 'cr.xp') return sup('data.extra.crXp')
    if (rest === 'type.swarmSize') return sup('data.creatureType.swarmSize')
    if (/^initiative/.test(rest)) return sup('data.extra.initiative')
    if (/^variant\[\]\.entries\[\]\.(headerEntries|footerEntries|ability)$/.test(rest)) return sup('data.variants[].text')
    if (/^_versions\[\]\.conditionInflict$/.test(rest)) return sup('data.facets.conditionInflict')
  }
  if (type === 'item' || type === 'item-group' || type === 'base-item') {
    if (/^additionalEntries/.test(rest)) return sup('data.text')
    if (/^attachedSpells/.test(rest)) return sup('data.attachedSpells')
    if (/^ability/.test(rest)) return sup('data.abilityGrant')
    if (rest === 'optionalfeatures') return sup('data.optionalFeatures')
    if (rest === 'hasRefs') return drop('derived', '布尔标记，表示正文里含引用；引用已转换成行内标记')
    if (/^activities\[\]/.test(rest)) return sup('data.extra.foundryActivities')
    if (/^_merge/.test(rest)) return sup('data.effects')
    if (/^system\./.test(rest) || rest === 'system') return sup('data.extra.system')
    if (rest === 'items') return sup('data.members')
    if (type === 'base-item' && /^(sword|axe|hammer|bow|crossbow|club|mace|polearm|spear|dagger|lance|net|rapier|staff|arrow|bolt|bulletFirearm|bulletSling|needleBlowgun|cellEnergy|firearm|armor|group)$/.test(rest)) return drop('internal-meta', '武器/护甲大类标记，只用于魔法变体展开时匹配基础物品；展开结果已写入各物品')
    if (rest === 'baseItem' || rest === 'recharge' || rest === 'group' || rest === 'type') return sup(`data.extra.${rest}`)
    return sup(`data.extra.${head}`)
  }
  if (type === 'spell' && rest === 'abilityCheck') return sup('data.abilityCheck')
  if (type === 'action' && rest === 'seeAlsoAction') return sup('data.seeAlso')
  return { path, bucket: 'ST REVIEW', action: 'drop', kind: 'internal-meta', why: '' }
}

export function buildTriage(): Triage[] {
  return Object.entries(FIELD_COVERAGE)
    .filter(([, entry]) => entry.how === 'lost')
    .map(([path, entry]) => triageOf(path, Number((entry as { affected?: number }).affected ?? 0)))
    .sort((a, b) => (a.path < b.path ? -1 : 1))
}

if (process.argv[1]?.endsWith('lostTriage.ts') && process.argv[2]) {
  const rows = buildTriage()
  writeFileSync(process.argv[2], `${JSON.stringify(rows, null, 1)}\n`)
  const counts: Record<string, number> = {}
  for (const row of rows) counts[row.bucket] = (counts[row.bucket] ?? 0) + 1
  console.log(rows.length, counts)
}

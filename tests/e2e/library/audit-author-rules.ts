// 审计第 3、4 层的作者规则登记（驾驶员 2026-11-06 批准，D2-P2 B1 设计 §11.1）。
// 每行只写"哪类、哪种差异、作者代码在哪"，不写数据。命中的差异归入"作者规则"，报告里按规则计数；
// 没命中的照样进 D 桶和可疑清单。条件尽量用作者自己打在条目上的来历字段（例 _versionBase_isVersion），不按条目名。

export interface AuthorRule {
  id: string
  /** 第 3 层 rawOnly / parsedOnly；第 4 层"差异种类:字段"（字段可写 *）。 */
  layer: 3 | 4
  /** 类别；第 4 层换类别的写"原类别→解析类别"。 */
  prop: string
  match: string
  /** 只在这套作者程序里成立（中文站作者自己的改动）。 */
  codeSet?: 'cn' | 'en'
  /** 解析后的条目带这个字段（作者打的来历标记）。 */
  parsedHas?: string
  /** 原始记录带这个字段。 */
  rawHas?: string
  author: string
}

const VERSIONS = 'utils.js DataUtil.proxy.getVersions（en 6439–6609）：_versions 展开成独立条目，带 _versionBase_*'
const SUBRACE = 'render.js Renderer.race.mergeSubraces（en 9103）；加载器 DataTypeLoaderRace isAddBaseRaces'
const LINEAGE = 'render.js mergeSubraces 里的血统规则 race.lineage（en 9112–9140）'
const DEREF_CLASS = 'utils-dataloader/dereferencer/utils-dataloader-dereferencer-classsubclassfeatures.js：特性引用换成内容'
const ITEM = 'render.js Renderer.item.enhanceItem（en 13528，打 _isEnhanced）+ 加载器物品条目解引用（en 836–845 行）'
const GENERIC = 'render.js Renderer.item._genericVariants_addInheritedPropertiesToSelf（en 13066）：通用变体继承 inherits 的字段'

export const AUTHOR_RULES: AuthorRule[] = [
  // 第 3 层：解析有原始无
  ...['monster', 'legendaryGroup', 'feat', 'race'].map((prop): AuthorRule => ({ id: `versions:${prop}`, layer: 3, prop, match: 'parsedOnly', parsedHas: '_versionBase_isVersion', author: VERSIONS })),
  { id: 'specific-variants', layer: 3, prop: 'item', match: 'parsedOnly', parsedHas: '_variantName', author: 'render.js Renderer.item._createSpecificVariants（en 13086）：基础物品 × 通用变体，带 _baseName、_variantName' },
  { id: 'subrace-merged', layer: 3, prop: 'race', match: 'parsedOnly', parsedHas: '_isSubRace', author: SUBRACE },
  { id: 'base-race', layer: 3, prop: 'race', match: 'parsedOnly', parsedHas: '_isBaseRace', author: 'render.js Renderer.race._mutMakeBaseRace（en 9213）：isAddBaseRaces 时给有亚种的种族加一条"(基础)"' },
  { id: 'race-feature', layer: 3, prop: 'raceFeature', match: 'parsedOnly', parsedHas: '_raceBaseName', author: 'utils.js DataUtil.raceFeature（en 约 7248，getFauxRaceFeature）：从种族正文生成' },
  // 第 3 层：原始有解析无
  { id: 'subrace-merged', layer: 3, prop: 'subrace', match: 'rawOnly', author: SUBRACE },
  ...['itemType', 'itemTypeAdditionalEntries'].map((prop): AuthorRule => ({ id: `item-lookup:${prop}`, layer: 3, prop, match: 'rawOnly', author: 'render.js Renderer.item._addBasePropertiesAndTypes（en 13060）：当查表数据用，物品加载器不输出成条目' })),
  // 第 4 层
  { id: 'deref-class', layer: 4, prop: 'class', match: 'changed:classFeatures', author: DEREF_CLASS },
  { id: 'deref-class', layer: 4, prop: 'subclass', match: 'changed:subclassFeatures', author: DEREF_CLASS },
  { id: 'deref-class', layer: 4, prop: 'classFeature', match: 'changed:entries', author: DEREF_CLASS },
  { id: 'deref-class', layer: 4, prop: 'subclassFeature', match: 'changed:entries', author: DEREF_CLASS },
  { id: 'deref-deck', layer: 4, prop: 'deck', match: 'changed:cards', author: 'utils-dataloader-dataloader.js DataTypeLoaderCustomDeck._pGetDereferencedCardData（en 873 行起）' },
  ...['item', 'baseitem→item', 'itemGroup→item'].flatMap((prop) => ['added-in-schema:entries', 'added-in-schema:additionalSources', 'changed:entries']
    .map((match): AuthorRule => ({ id: 'item-enhance', layer: 4, prop, match, parsedHas: '_isEnhanced', author: ITEM }))),
  ...['added-in-schema:*', 'changed:type', 'removed:requires', 'removed:inherits'].map((match): AuthorRule => ({ id: 'generic-variant', layer: 4, prop: 'magicvariant→item', match, author: GENERIC })),
  ...['added-in-schema:ability', 'added-in-schema:languageProficiencies', 'changed:entries'].map((match): AuthorRule => ({ id: 'lineage', layer: 4, prop: 'race', match, rawHas: 'lineage', author: LINEAGE })),
  ...['added-in-schema:_versions', 'added-in-schema:ability'].map((match): AuthorRule => ({ id: 'subrace-merged', layer: 4, prop: 'race', match, parsedHas: '_isSubRace', author: SUBRACE })),
  { id: 'cn-translator', layer: 4, prop: '*', match: 'removed:translator', codeSet: 'cn', author: '中文站 utils.js 5669：_copy 时 delete entParent.translator（被复制的条目去掉译者）' },
]

/** 找第一条命中的规则。 */
export function findRule(rules: AuthorRule[], q: { layer: 3 | 4; prop: string; match: string; codeSet: string; raw?: Record<string, unknown>; parsed?: Record<string, unknown> }): AuthorRule | undefined {
  const [kind] = q.match.split(':')
  return rules.find((r) => r.layer === q.layer
    && (r.prop === '*' || r.prop === q.prop)
    && (r.match === q.match || r.match === `${kind}:*`)
    && (!r.codeSet || r.codeSet === q.codeSet)
    && (!r.parsedHas || (q.parsed !== undefined && r.parsedHas in q.parsed))
    && (!r.rawHas || (q.raw !== undefined && r.rawHas in q.raw)))
}

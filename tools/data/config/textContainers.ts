/** 自由正文容器：只能使用 how: 'text'，不能作为结构化字段的 mapped 目标。 */
export const TEXT_CONTAINERS = new Set([
  'data.text',
  'data.lore',
  'data.instructions',
  'data.goals',
  'data.noteCook',
  'data.caption',
  'data.footnotes',
  'data.higherLevel',
  'i18n.en.fields.text',
])

export function isTextContainer(to: string): boolean {
  return TEXT_CONTAINERS.has(to)
}

/** 来源路径是否为散文/正文块，而不是结构化字段。 */
export function isProsePath(path: string): boolean {
  return /(?:^|\.)(?:(?:additional|header|footer)?entries?|entryData|entriesHigherLevel|readaloud|fluff|description|lore|instructions|goals|noteCook|caption|footnotes|text|header|reasons|higherLevel|face|back|countermeasures|data)(?:\.|\[|$)/i.test(path)
}

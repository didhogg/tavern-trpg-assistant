export type TagKind = 'roll' | 'hit' | 'dc' | 'ref' | 'atk' | 'em' | 'text'

export interface TagSpec {
  kind: TagKind
  /** 引用类标签对应的条目类型。 */
  refType?: string
}

/** 5etools 行内标签对照表；出现表外的标签时构建失败（D1 §4.4）。 */
export const TAGS: Record<string, TagSpec> = {
  dice: { kind: 'roll' },
  damage: { kind: 'roll' },
  d20: { kind: 'roll' },
  scaledice: { kind: 'roll' },
  scaledamage: { kind: 'roll' },
  hit: { kind: 'hit' },
  hitYourSpellAttack: { kind: 'text' },
  dc: { kind: 'dc' },
  atk: { kind: 'atk' },
  spell: { kind: 'ref', refType: 'spell' },
  creature: { kind: 'ref', refType: 'monster' },
  item: { kind: 'ref', refType: 'item' },
  class: { kind: 'ref', refType: 'class' },
  subclass: { kind: 'ref', refType: 'subclass' },
  race: { kind: 'ref', refType: 'race' },
  subrace: { kind: 'ref', refType: 'subrace' },
  background: { kind: 'ref', refType: 'background' },
  feat: { kind: 'ref', refType: 'feat' },
  condition: { kind: 'ref', refType: 'condition' },
  disease: { kind: 'ref', refType: 'disease' },
  status: { kind: 'ref', refType: 'status' },
  action: { kind: 'ref', refType: 'rule' },
  sense: { kind: 'ref', refType: 'rule' },
  skill: { kind: 'ref', refType: 'rule' },
  variantrule: { kind: 'ref', refType: 'rule' },
  optfeature: { kind: 'ref', refType: 'feature' },
  classFeature: { kind: 'ref', refType: 'feature' },
  subclassFeature: { kind: 'ref', refType: 'feature' },
  table: { kind: 'ref', refType: 'table' },
  i: { kind: 'em' },
  b: { kind: 'em' },
  bold: { kind: 'em' },
  italic: { kind: 'em' },
  note: { kind: 'em' },
  color: { kind: 'em' },
  h: { kind: 'text' },
  '5etools': { kind: 'text' },
  card: { kind: 'text' },
  deck: { kind: 'text' },
  deity: { kind: 'text' },
  filter: { kind: 'text' },
  hazard: { kind: 'text' },
  hom: { kind: 'text' },
  language: { kind: 'text' },
  link: { kind: 'text' },
  object: { kind: 'text' },
  quickref: { kind: 'text' },
  recharge: { kind: 'text' },
  itemProperty: { kind: 'text' },
  chance: { kind: 'text' },
  book: { kind: 'text' },
}

export function tagSpec(name: string, context: string): TagSpec {
  const spec = TAGS[name]
  if (!spec) throw new Error(`未知的 5etools 标签 @${name}（在 ${context}）`)
  return spec
}

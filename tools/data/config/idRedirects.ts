/** 已发布 id 在来源 `_mod` 纠正特性名后发生变化时的唯一登记表。 */
export interface IdRedirect {
  to: string
  reason: string
}

export const ID_REDIRECTS: Record<string, IdRedirect> = {
  'feature.variant-criminal-spy-feature-criminal-contact.phb': {
    to: 'feature.variant-criminal-spy-feature-spy-contact.phb',
    reason: '来源 _mod 将错误的「罪犯接头人」特性名替换为「间谍接头人」',
  },
  'feature.variant-noble-knight-feature-position-of-privilege.phb': {
    to: 'feature.variant-noble-knight-feature-retainers.phb',
    reason: '来源 _mod 将错误的「特权地位」特性替换为「家仆」',
  },
  'feature.variant-noble-retainers-feature-position-of-privilege.phb': {
    to: 'feature.variant-noble-retainers-feature-retainers.phb',
    reason: '来源 _mod 将错误的「特权地位」特性替换为「家仆」',
  },
  'feature.variant-sailor-pirate-feature-ships-passage.phb': {
    to: 'feature.variant-sailor-pirate-feature-bad-reputation.phb',
    reason: '来源 _mod 将错误的「船票」特性替换为「恶名」',
  },
}

export function redirectedId(id: string): string | undefined {
  return ID_REDIRECTS[id]?.to
}

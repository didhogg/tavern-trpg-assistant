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
  "table.variant-criminal-spy.phb": { to: "table.criminal.phb", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-criminal-spy.phb-2": { to: "table.criminal.phb-2", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-criminal-spy.phb-3": { to: "table.criminal.phb-3", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-criminal-spy.phb-4": { to: "table.criminal.phb-4", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-criminal-spy.phb-5": { to: "table.criminal.phb-5", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-entertainer-gladiator.phb": { to: "table.entertainer.phb", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-entertainer-gladiator.phb-2": { to: "table.entertainer.phb-2", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-entertainer-gladiator.phb-3": { to: "table.entertainer.phb-3", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-entertainer-gladiator.phb-4": { to: "table.entertainer.phb-4", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-entertainer-gladiator.phb-5": { to: "table.entertainer.phb-5", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-guild-artisan-guild-merchant.phb": { to: "table.guild-artisan.phb", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-guild-artisan-guild-merchant.phb-2": { to: "table.guild-artisan.phb-2", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-guild-artisan-guild-merchant.phb-3": { to: "table.guild-artisan.phb-3", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-guild-artisan-guild-merchant.phb-4": { to: "table.guild-artisan.phb-4", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-guild-artisan-guild-merchant.phb-5": { to: "table.guild-artisan.phb-5", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.feature-inheritance.scag": { to: "table.inheritor.scag", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-noble-knight.phb": { to: "table.noble.phb", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-noble-retainers.phb": { to: "table.noble.phb", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-noble-knight.phb-2": { to: "table.noble.phb-2", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-noble-retainers.phb-2": { to: "table.noble.phb-2", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-noble-knight.phb-3": { to: "table.noble.phb-3", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-noble-retainers.phb-3": { to: "table.noble.phb-3", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-noble-knight.phb-4": { to: "table.noble.phb-4", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-noble-retainers.phb-4": { to: "table.noble.phb-4", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-sailor-pirate.phb": { to: "table.sailor.phb", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-sailor-pirate.phb-2": { to: "table.sailor.phb-2", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-sailor-pirate.phb-3": { to: "table.sailor.phb-3", reason: "与同内容的表合并（变体背景/重复表）" },
  "table.variant-sailor-pirate.phb-4": { to: "table.sailor.phb-4", reason: "与同内容的表合并（变体背景/重复表）" },
}

export function redirectedId(id: string): string | undefined {
  return ID_REDIRECTS[id]?.to
}

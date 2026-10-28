import type { Raw } from '../extract/load'
import { BOOK_SOURCES } from '../config/books'
import { slug } from '../lib/slug'

function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function matches(req: Raw, base: Raw): boolean {
  if (req.weapon === true) return !!base.weapon
  if (req.armor === true) return !!base.armor
  if (req.net === true) return base.net === true
  if (req.sword === true) return base.sword === true
  if (req.axe === true) return base.axe === true
  if (req.bow === true) return base.bow === true
  if (req.ammo === true) return base.type === 'A'
  if (req.arrow === true) return base.arrow === true
  if (req.bolt === true) return base.bolt === true
  if (req.polearm === true) return base.polearm === true
  if (typeof req.weaponCategory === 'string') return base.weaponCategory === req.weaponCategory
  if (typeof req.type === 'string') {
    const code = req.type.split('|')[0]
    if (code === 'A') return base.type === 'A'
    if (code === 'M') return !!base.weapon
    if (code === 'S') return base.type === 'S'
    return base.type === code
  }
  if (typeof req.ENG_name === 'string') return str(base.ENG_name) === req.ENG_name || str(base.name) === req.ENG_name
  return false
}

function variantApplies(variant: Raw, base: Raw): boolean {
  const requires = Array.isArray(variant.requires) ? variant.requires : []
  return requires.some((req) => isObj(req) && matches(req, base))
}

function itemCategory(base: Raw, variant: Raw): string {
  if (base.weapon || variant.weapon) return 'weapon'
  if (base.type === 'S') return 'shield'
  if (base.type === 'A') return 'ammunition'
  if (base.armor) return 'armor'
  if (base.type === 'T') return 'tool'
  if (base.type === 'P' || base.type === 'SC') return 'consumable'
  if (base.type === 'MNT') return 'mount'
  if (base.type === 'VE') return 'vehicle'
  if (base.type === 'AT' || base.type === 'GS') return 'treasure'
  return 'wondrous'
}

function displayName(variant: Raw, base: Raw): { name: string; nameEn: string } {
  const inherits = isObj(variant.inherits) ? variant.inherits : {}
  const prefix = str(inherits.namePrefix).trim()
  const suffix = str(inherits.nameSuffix).trim()
  const baseName = str(base.name)
  const baseEn = str(base.ENG_name)
  if (prefix.startsWith('+')) return { name: `${baseName} ${prefix}`, nameEn: `${baseEn} ${prefix}`.trim() }
  if (prefix) return { name: `${prefix}${baseName}${suffix}`, nameEn: `${prefix}${baseEn}${suffix}`.trim() }
  return { name: `${baseName}${suffix}`, nameEn: `${baseEn}${suffix}`.trim() }
}

/** 把 magicvariants 展开成具体物品；通用变体与基础物品交叉，具名变体直接生成一条。 */
export function expandMagicVariants(data: { items: Raw[]; baseItems: Raw[]; magicVariants: Raw[] }): { items: Raw[]; created: number; skipped: number } {
  const out: Raw[] = []
  let created = 0
  let skipped = 0
  const bases = data.baseItems.filter((b) => BOOK_SOURCES.has(String(b.source)))
  for (const variant of data.magicVariants) {
    const inherits = isObj(variant.inherits) ? variant.inherits : {}
    const source = str(inherits.source)
    if (!BOOK_SOURCES.has(source)) continue
    const generic = str(variant.type).startsWith('GV')
    const nameEn = str(variant.ENG_name)
    if (!generic) {
      const base = bases.find((b) => variantApplies(variant, b))
      out.push({ ...variant, ...inherits, ...(base ? { _baseItem: base } : {}), name: str(variant.name), ENG_name: nameEn, source, _variant: variant })
      created++
      continue
    }
    const matchesBase = bases.filter((base) => variantApplies(variant, base))
    if (!matchesBase.length) {
      skipped++
      continue
    }
    const genericSlug = slug(nameEn.replace(/\b(weapon|armor|shield|ammunition)\b/gi, '').trim())
    for (const base of matchesBase) {
      const label = displayName(variant, base)
      out.push({
        ...inherits,
        ...variant,
        ...inherits,
        name: label.name,
        ENG_name: label.nameEn,
        source,
        page: Number(inherits.page ?? variant.page ?? 0),
        srd: inherits.srd ?? variant.srd,
        _baseItem: base,
        _variant: variant,
        _variantSlug: `${slug(str(base.ENG_name))}-${genericSlug || 'variant'}`,
        _category: itemCategory(base, inherits),
      })
      created++
    }
  }
  return { items: out, created, skipped }
}

/** 普通物品（items.json）与基础物品（items-base.json）合并；同名同书的基础物品让位给魔法物品。 */
export function mergeItemLists(items: Raw[], baseItems: Raw[], expanded: Raw[]): Raw[] {
  const magicNames = new Set(items.map((i) => `${i.source}|${i.name}`))
  const bases = baseItems.filter((b) => !magicNames.has(`${b.source}|${b.name}`)).map((b) => ({ ...b, _baseOnly: true }))
  return [...bases, ...items, ...expanded]
}

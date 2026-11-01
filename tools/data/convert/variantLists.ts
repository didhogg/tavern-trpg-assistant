import type { Entry } from '../../../src/schemas/pack'
import { PACK_BY_SOURCE } from '../config/books'

/**
 * 5etools `gendata-spell-source-lookup` 的 `classVariant`：某本书（如 TCE）把别的书（如 PHB）的法术加进某职业的**可选**法术表。
 * 以前转换器把它们和核心职业表混在一起（a16b-optional-baked-in，65 处）。现在：同一本书定义的仍进 `classes`；别的书定义的收集到这里，
 * 由定义它的那本书出一个锚点特性 `feature.<职业>-additional-spells.<书>`，用 `spellLists` 登记（01 C4），装了那本书才生效。
 */
const lists = new Map<string, Map<string, Set<string>>>()

export function recordVariant(book: string, classId: string, spellId: string): void {
  const byClass = lists.get(book) ?? new Map<string, Set<string>>()
  const spells = byClass.get(classId) ?? new Set<string>()
  spells.add(spellId)
  byClass.set(classId, spells)
  lists.set(book, byClass)
}

export interface PackLike { manifest: { id: string; entryCount: number }; entries: Entry[] }

export function addVariantAnchors(packs: PackLike[]): number {
  const byId = new Map(packs.flatMap((p) => p.entries.map((e) => [e.id, e] as const)))
  // 锚点的页码：该书里这个职业最早的职业特性所在页（读条目自己的出处，不手填）
  const pageOf = (book: string, classId: string): number => {
    const ps = [...byId.values()].filter((e) => e.type === 'feature').map((e) => e.data as { owner?: { type?: string; id?: string }; src?: { book?: string; page?: number } }).filter((d) => d.owner?.type === 'class' && d.owner.id === classId && d.src?.book === book && (d.src.page ?? 0) > 0).map((d) => d.src!.page!)
    return ps.length ? Math.min(...ps) : 0
  }
  let added = 0
  for (const [book, byClass] of lists) {
    const pack = packs.find((p) => p.manifest.id === PACK_BY_SOURCE.get(book))
    if (!pack) continue
    for (const [classId, spellSet] of [...byClass].sort(([a], [b]) => a.localeCompare(b))) {
      const cls = byId.get(classId)
      if (!cls) continue
      const short = classId.split('.')[1]
      const id = `feature.${short}-additional-spells.${book.toLowerCase()}`
      if (byId.has(id)) continue
      const spells = [...spellSet].filter((s) => byId.has(s)).sort()
      if (!spells.length) continue
      const name = `可选扩展法术列表（${cls.name}）`
      const nameEn = `${cls.nameEn ?? cls.name} Expanded Spell List (Optional)`
      const entry = {
        id, type: 'feature', name, nameEn, keywords: [name, nameEn], unique: false,
        summary: `${name}｜把下列法术加进${cls.name}的法术表（可选规则）。`,
        data: {
          activities: [],
          credit: { by: '本项目', license: 'CC-BY-NC-SA-4.0', machine: false, missing: [], srd: false, structured: { by: '5etools', license: 'MIT' } },
          role: 'procedure',
          src: { book, page: pageOf(book, classId) },
          text: [{ p: `本条目把下列法术加进${cls.name}的法术表（本书的可选规则：扩展法术列表；只有装了本书、并在战役里采用这条可选规则时才算）。` }],
          spellLists: [{ to: classId, spells }],
        },
        i18n: { en: { name: nameEn, summary: `${nameEn} | Adds the spells below to the ${cls.nameEn ?? cls.name} spell list (optional rule).`, fields: { text: [{ p: `This entry adds the spells below to the ${cls.nameEn ?? cls.name} spell list (this book's optional Expanded Spell List rule; it applies only when this book is installed and the campaign uses the optional rule).` }] } } },
      } as unknown as Entry
      pack.entries.push(entry)
      byId.set(id, entry)
      added++
    }
    pack.manifest.entryCount = pack.entries.length
  }
  lists.clear()
  return added
}

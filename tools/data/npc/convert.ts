import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from '../convert/plan'
import type { ConvertContext } from '../convert/context'
import type { InlineContext } from '../markup/inline'

/** 具名 NPC 模板：只写引用与出处，不复制属性块。 */
export function convertNpc(entry: PlannedEntry, _ctx: ConvertContext, _inline: InlineContext): Entry {
  const raw = entry.raw as Record<string, unknown>
  const data: Record<string, unknown> = {
    src: { book: entry.source, page: entry.page },
    credit: raw.credit,
    text: [],
    statblock: raw.statblock,
    adventure: raw.adventure,
    at: raw.at,
    ...(Array.isArray(raw.intro) && raw.intro.length ? { intro: raw.intro } : {}),
    confidence: raw.confidence,
  }
  return {
    id: entry.id,
    type: 'npc',
    name: entry.name,
    ...(entry.nameEn ? { nameEn: entry.nameEn } : {}),
    keywords: [entry.name, entry.nameEn].filter(Boolean),
    unique: true,
    summary: String(raw.summary ?? ''),
    data,
    ...(raw.i18n ? { i18n: raw.i18n as Entry['i18n'] } : {}),
  }
}

import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import type { InlineContext } from '../markup/inline'
import { convertBlocks } from './blocks'
import { r11BlockOptions } from './blocksR11'
import { creditFor, keywordsOf, pageOf } from './common'
import { plainText, summaryOf } from '../summary/summary'

const CATEGORY: Record<string, string> = {
  script: 'script',
  skill: 'skill',
  sense: 'sense',
  itemProperty: 'itemProperty',
  itemType: 'itemType',
  itemTypeExtra: 'itemTypeExtra',
  quickref: 'quickref',
}

export function convertRuleR11(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const category = CATEGORY[entry.context.ruleCategory ?? ''] ?? 'variant'
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline, r11BlockOptions),
    category,
  }
  if (typeof raw.abbreviation === 'string') data.abbreviation = raw.abbreviation
  if (typeof raw.ability === 'string') data.ability = raw.ability
  if (typeof raw._appliesToId === 'string') data.appliesTo = raw._appliesToId
  else if (typeof raw.appliesTo === 'string') data.appliesTo = raw.appliesTo
  if (typeof raw.template === 'string') data.template = raw.template
  return {
    id: entry.id,
    type: 'rule',
    name: entry.name,
    nameEn: entry.nameEn,
    keywords: keywordsOf(entry),
    unique: false,
    summary: summaryOf('rule', entry.name, data, plainText(data.text as never)),
    data,
  }
}

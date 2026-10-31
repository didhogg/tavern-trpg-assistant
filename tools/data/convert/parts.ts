import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import type { InlineContext } from '../markup/inline'
import { convertBlocks } from './blocks'
import { r11BlockOptions } from './blocksR11'
import { creditFor, keywordsOf, pageOf, str, obj } from './common'
import { plainText, summaryOf } from '../summary/summary'
import { renderInline } from '../markup/inline'
import { recipeVars } from './recipeVars'
import { assertMonsterPartTokens } from '../config/monsterPartTokens'

function tokensIn(value: unknown, out: Set<string>): void {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/<\$([^$]+)\$>/g)) out.add(match[1])
  } else if (Array.isArray(value)) {
    for (const item of value) tokensIn(item, out)
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) tokensIn(item, out)
  }
}

function base(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext, text: unknown): Record<string, unknown> {
  return {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(text, inline, r11BlockOptions),
  }
}

function build(entry: PlannedEntry, data: Record<string, unknown>): Entry {
  return {
    id: entry.id,
    type: entry.type,
    name: entry.name,
    nameEn: entry.nameEn,
    keywords: keywordsOf(entry),
    unique: false,
    summary: summaryOf(entry.type, entry.name, data, plainText(data.text as never)),
    data,
  }
}

export function convertMonsterPart(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const tokens = new Set<string>()
  tokensIn(raw, tokens)
  assertMonsterPartTokens(tokens)
  const data = base(entry, ctx, inline, raw.entries)
  data.partKind = str(raw._partKind) || entry.context.partKind
  for (const key of ['example', 'effect'] as const) if (typeof raw[key] === 'string') data[key] = renderInline(raw[key], inline)
  for (const key of ['hasNumberParam', 'dpr', 'ac', 'hp', 'attackBonus'] as const) if (raw[key] !== undefined) data[key] = raw[key]
  return build(entry, data)
}

interface RecipeLine {
  text: string
  template?: string
  amounts?: number[]
}

function amountsOf(raw: Record<string, unknown>): number[] {
  const out: number[] = []
  for (let n = 1; n <= 5; n++) {
    const value = raw[`amount${n}`]
    if (typeof value === 'number') out.push(value)
  }
  return out
}

function recipeLine(raw: Record<string, unknown>, inline: InlineContext): RecipeLine {
  const source = str(raw.entry)
  if (!source) throw new Error('配方食材缺少 entry')
  const vars = recipeVars(raw)
  const text = renderInline(source, { ...inline, vars })
  const amounts = amountsOf(raw)
  return {
    text,
    ...(source.includes('{=') ? { template: source } : {}),
    ...(amounts.length ? { amounts } : {}),
  }
}

function ingredientLine(value: unknown, inline: InlineContext): RecipeLine {
  if (typeof value === 'string') return { text: renderInline(value, inline) }
  const raw = obj(value)
  if (!raw) throw new Error('配方食材不是字符串或对象')
  return recipeLine(raw, inline)
}

function ingredientsOf(value: unknown, inline: InlineContext): Array<RecipeLine | { group: string; items: RecipeLine[] }> {
  if (!Array.isArray(value)) return []
  return value.map((item) => {
    const raw = obj(item)
    if (!raw) return ingredientLine(item, inline)
    if (raw.type === 'entries') {
      const entries = Array.isArray(raw.entries) ? raw.entries : []
      return { group: renderInline(str(raw.name), inline), items: entries.map((entry) => ingredientLine(entry, inline)) }
    }
    return recipeLine(raw, inline)
  })
}

export function convertRecipe(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const data = base(entry, ctx, inline, raw.entries)
  if (typeof raw.type === 'string') data.recipeType = raw.type
  const diet = str(raw.diet)
  if (!['C', 'V', 'X'].includes(diet)) throw new Error(`配方 diet 不合法：${diet}（${entry.name}）`)
  data.diet = diet
  data.dishTypes = Array.isArray(raw.dishTypes) ? raw.dishTypes.map(String) : []
  data.allergenGroups = Array.isArray(raw.allergenGroups) ? raw.allergenGroups.map(String) : []
  data.tags = Array.isArray(raw.miscTags) ? raw.miscTags.map(String) : []
  if (Array.isArray(raw.alias)) data.alias = raw.alias.map(String)
  if (raw.makes !== undefined) data.makes = typeof raw.makes === 'number' ? raw.makes : renderInline(str(raw.makes), inline)
  if (raw.serves && typeof raw.serves === 'object') data.serves = raw.serves
  data.ingredients = ingredientsOf(raw.ingredients, inline)
  data.equipment = Array.isArray(raw.equipment) ? raw.equipment.map((item) => ingredientLine(item, inline)) : []
  data.instructions = convertBlocks(raw.instructions, inline, r11BlockOptions)
  if (raw.noteCook !== undefined) {
    data.text = [...(data.text as unknown[]), ...convertBlocks(raw.noteCook, inline, r11BlockOptions)]
  }
  return build(entry, data)
}

export function convertCharOption(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const data = base(entry, ctx, inline, raw.entries)
  const optionType = Array.isArray(raw.optionType) ? raw.optionType.map(String) : []
  if (!optionType.length) throw new Error(`角色创建选项没有 optionType：${entry.name}`)
  data.optionType = optionType
  return build(entry, data)
}

import { z } from 'zod'
import { spellDataSchema, monsterDataSchema } from './spell-monster'
import { entryCommonFields } from './base'
import { itemDataSchema, tableDataSchema } from './item-table'
import {
  backgroundDataSchema,
  classDataSchema,
  conditionDataSchema,
  featDataSchema,
  featureDataSchema,
  raceDataSchema,
  ruleDataSchema,
  subclassDataSchema,
  subraceDataSchema,
} from './character'

export const DND5E2014_ENTRY_TYPES = [
  'spell',
  'monster',
  'item',
  'class',
  'subclass',
  'feature',
  'race',
  'subrace',
  'background',
  'feat',
  'condition',
  'disease',
  'status',
  'table',
  'rule',
  'lore',
] as const

export type Dnd5e2014EntryType = (typeof DND5E2014_ENTRY_TYPES)[number]

export const entryDataByType = {
  spell: spellDataSchema,
  monster: monsterDataSchema,
  item: itemDataSchema,
  class: classDataSchema,
  subclass: subclassDataSchema,
  feature: featureDataSchema,
  race: raceDataSchema,
  subrace: subraceDataSchema,
  background: backgroundDataSchema,
  feat: featDataSchema,
  condition: conditionDataSchema,
  disease: conditionDataSchema,
  status: conditionDataSchema,
  table: tableDataSchema,
  rule: ruleDataSchema,
  lore: z.object({ ...entryCommonFields, target: z.string().min(1), variants: z.array(z.unknown()).optional() }),
} satisfies Record<Dnd5e2014EntryType, z.ZodType>

export const dnd5e2014EntryDataSchema = z.union(Object.values(entryDataByType))

export function entryDataSchemaFor(type: string) {
  return (entryDataByType as Record<string, z.ZodType | undefined>)[type]
}

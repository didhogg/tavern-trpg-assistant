import { z } from 'zod'

export const tableColumnTypeSchema = z.enum(['int', 'number', 'level', 'cr', 'range', 'multiplier', 'bonus', 'bonusRange', 'dice', 'diceWithAverage', 'size', 'enum', 'bool', 'intOrOptions'])

export const tableColumnSchema = z.object({
  key: z.string().regex(/^[a-z][A-Za-z0-9]*$/),
  type: tableColumnTypeSchema,
  unit: z.string().max(12).optional(),
})

export const tableValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.number().int()),
  z.object({ min: z.number(), max: z.number().nullable() }),
  z.object({ average: z.number(), dice: z.string() }),
])

export type TableColumnType = z.infer<typeof tableColumnTypeSchema>
export type TableColumn = z.infer<typeof tableColumnSchema>
export type TableValue = z.infer<typeof tableValueSchema>

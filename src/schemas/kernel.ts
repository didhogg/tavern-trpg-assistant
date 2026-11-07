// P3-3 存档里的结算内核段：只存引用、选择、状态与版本；不存条目内容，不存能重算的规则数值。
import { z } from 'zod'

export const kernelRefSchema = z.object({
  kind: z.string().min(1),
  set: z.string().min(1),
  prop: z.string().min(1),
  hash: z.string().min(1),
  label: z.string().optional(),
  author: z.string().optional(),
})
export type KernelRef = z.infer<typeof kernelRefSchema>

export const kernelLibrarySchema = z.object({
  rule: z.string().min(1),
  codeSet: z.string().min(1),
  scopes: z.array(z.string()).default([]),
  include: z.array(z.string()).default([]),
  exclude: z.array(z.string()).default([]),
  choices: z.record(z.string(), z.string()).default({}),
})
export type KernelLibrary = z.infer<typeof kernelLibrarySchema>

export const kernelActorSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  refs: z.array(kernelRefSchema).default([]),
  choices: z.record(z.string(), z.unknown()).default({}),
  state: z.record(z.string(), z.unknown()).default({}),
  adjustments: z.record(z.string(), z.unknown()).default({}),
  dice: z.array(z.number().int()).default([]),
})
export type KernelActor = z.infer<typeof kernelActorSchema>

export const kernelVersionSchema = z.object({
  official: z.string().default(''),
  brews: z.record(z.string(), z.string()).default({}),
})
export type KernelDataVersion = z.infer<typeof kernelVersionSchema>

export const kernelChangeSchema = z.object({
  action: z.enum(['create', 'update', 'delete']),
  type: z.string().min(1),
  pack: z.string().nullable().default(null),
  parentUuid: z.string().nullable().default(null),
  data: z.unknown(),
})
export type KernelChange = z.infer<typeof kernelChangeSchema>

export const kernelUndoSchema = z.object({
  at: z.number().int().nonnegative(),
  revision: z.number().int().nonnegative(),
  actorIds: z.array(z.string()),
  before: z.record(z.string(), z.unknown()),
})
export type KernelUndo = z.infer<typeof kernelUndoSchema>

export const kernelOverrideSchema = z.object({
  target: kernelRefSchema,
  house: kernelRefSchema,
  digest: z.string(),
})
export type KernelOverride = z.infer<typeof kernelOverrideSchema>

export const kernelCampaignSchema = z.object({
  rule: z.string().min(1),
  kernelVersion: z.number().int().nonnegative(),
  library: kernelLibrarySchema,
  dataVersion: kernelVersionSchema.default({ official: '', brews: {} }),
  overrides: z.array(kernelOverrideSchema).default([]),
  actors: z.array(kernelActorSchema).default([]),
  revision: z.number().int().nonnegative().default(0),
  undo: z.array(kernelUndoSchema).default([]),
})
export type KernelCampaign = z.infer<typeof kernelCampaignSchema>

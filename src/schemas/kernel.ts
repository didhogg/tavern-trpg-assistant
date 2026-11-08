// P3-3 存档里的结算内核段：只存引用、选择、状态与版本；不存条目内容，不存能重算的规则数值。
import { z } from 'zod'

export const kernelRefSchema = z.object({
  kind: z.string().min(1),
  set: z.string().min(1),
  prop: z.string().min(1),
  hash: z.string().min(1),
  label: z.string().optional(),
  author: z.string().optional(),
  /** 这件东西在当前人物里的物品编号；只用于把改动对应回引用，不是作者编号。 */
  itemId: z.string().optional(),
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

export const kernelActorStateSchema = z.object({
  /** 人物本身的差别（对比重建出来的基准人物）。 */
  actor: z.record(z.string(), z.unknown()).default({}),
  /** 每件物品的差别：物品编号 → 差别。 */
  items: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
  /** 每个效果的差别：效果编号 → 差别。 */
  effects: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
  /** 重建时不存在的物品/效果（玩着玩着新加的东西），原样保留。 */
  itemAdded: z.array(z.record(z.string(), z.unknown())).default([]),
  itemRemoved: z.array(z.string()).default([]),
  effectAdded: z.array(z.record(z.string(), z.unknown())).default([]),
  effectRemoved: z.array(z.string()).default([]),
})
export type KernelActorState = z.infer<typeof kernelActorStateSchema>

export const kernelActorSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  refs: z.array(kernelRefSchema).default([]),
  choices: z.record(z.string(), z.unknown()).default({}),
  state: kernelActorStateSchema.default({ actor: {}, items: {}, effects: {}, itemAdded: [], itemRemoved: [], effectAdded: [], effectRemoved: [] }),
  adjustments: z.record(z.string(), z.unknown()).default({}),
  dice: z.array(z.number().int()).default([]),
  /** 旧格式（整份条目全文）原样保留；不丢、不猜。 */
  legacy: z.boolean().default(false),
  legacyState: z.record(z.string(), z.unknown()).optional(),
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
  /** 这次改动前的战役战斗（没有战斗改动时为空）。 */
  combatBefore: z.record(z.string(), z.unknown()).optional(),
})
export type KernelUndo = z.infer<typeof kernelUndoSchema>

export const kernelOverrideSchema = z.object({
  target: kernelRefSchema,
  house: kernelRefSchema,
  digest: z.string(),
})
export type KernelOverride = z.infer<typeof kernelOverrideSchema>

export const kernelCombatantSchema = z.object({
  id: z.string().min(1),
  actorId: z.string().min(1),
  name: z.string().optional(),
  initiative: z.number().nullable().default(null),
  defeated: z.boolean().default(false),
  hidden: z.boolean().default(false),
})
export type KernelCombatant = z.infer<typeof kernelCombatantSchema>

/** 战役层只存一份战斗：没有归属人物的战斗改动放这里，最少必要，不扩展战斗功能。 */
export const kernelCombatSchema = z.object({
  id: z.string().nullable().default(null),
  name: z.string().default(''),
  round: z.number().int().nonnegative().default(0),
  turn: z.number().int().nullable().default(null),
  active: z.boolean().default(false),
  combatants: z.array(kernelCombatantSchema).default([]),
})
export type KernelCombat = z.infer<typeof kernelCombatSchema>

export const kernelCampaignSchema = z.object({
  rule: z.string().min(1),
  kernelVersion: z.number().int().nonnegative(),
  library: kernelLibrarySchema,
  dataVersion: kernelVersionSchema.default({ official: '', brews: {} }),
  overrides: z.array(kernelOverrideSchema).default([]),
  actors: z.array(kernelActorSchema).default([]),
  combat: kernelCombatSchema.default({ id: null, name: '', round: 0, turn: null, active: false, combatants: [] }),
  revision: z.number().int().nonnegative().default(0),
  undo: z.array(kernelUndoSchema).default([]),
  /** 整个存档的内核段是旧格式（只有整份内容，没有引用/选择/状态差别）。 */
  legacy: z.boolean().default(false),
})
export type KernelCampaign = z.infer<typeof kernelCampaignSchema>

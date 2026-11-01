import { z } from 'zod'
import { entryIdSchema, idSchema } from '../../../schemas/common'
import { damageTypeSchema } from './enums'
import { strictFormulaSchema } from './formula'

/**
 * G2.5 新字段的格式（全部可选；规格见 docs/handoff/D1.2-G2.5_执行包/01_字段规格.md，冻结后一个字都不改）。
 * 形状只在这里定义一次；条目模式（entries/*.ts）与效果（effects.ts）引用它们。
 */

/** 法术位的保留池名：`restores[].pool` 写它表示恢复法术位。 */
export const SPELL_SLOTS_POOL = 'spellSlots'

const positiveInt = z.number().int().positive()
const shortText = z.string().min(1).max(300)
const resetSchema = z.enum(['short', 'long', 'shortOrLong'])

/** A2 消耗：用这个特性时扣另一个特性（带 `uses`）的次数池。 */
export const consumesSchema = z.strictObject({ pool: entryIdSchema, amount: positiveInt.optional() })

/** A3 恢复：休息、先攻或事件时恢复哪个池、恢复多少。 */
export const restoreSchema = z
  .strictObject({
    pool: z.union([z.literal(SPELL_SLOTS_POOL), entryIdSchema]).optional(),
    on: z.enum(['short', 'long', 'shortOrLong', 'dawn', 'initiative', 'event']),
    event: z.string().min(1).max(200).optional(),
    amount: z.union([z.literal('all'), positiveInt, strictFormulaSchema]),
    condition: shortText.optional(),
    limit: shortText.optional(),
  })
  .superRefine((v, ctx) => {
    if (v.on === 'event' && v.event === undefined) ctx.addIssue({ code: 'custom', message: 'on 为 event 时必须写 event' })
    if (v.on !== 'event' && v.event !== undefined) ctx.addIssue({ code: 'custom', message: 'event 只能与 on: "event" 同用' })
  })

/** A4 状态：不是次数、但要在休息时重置的状态。 */
export const trackerSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('escalate'), start: z.number().int(), step: z.number().int(), reset: resetSchema }),
  z.strictObject({ kind: z.literal('perTarget'), reset: resetSchema }),
  z.strictObject({ kind: z.literal('choice'), reset: resetSchema }),
  z.strictObject({
    kind: z.literal('cooldown'),
    cooldown: z.strictObject({ unit: z.enum(['day', 'longRest']), amount: z.union([positiveInt, z.string().regex(/^\d*d\d+(?:\s*[+-]\s*\d+)?$/i, '冷却数量必须是正整数或骰式')]) }),
  }),
])

/** C1 升环：用更高环阶的法术位施展时的追加量。不许新增 kind。 */
export const upcastSchema = z
  .array(
    z.discriminatedUnion('kind', [
      z.strictObject({ kind: z.literal('damage'), dice: z.string().min(1).max(20), type: damageTypeSchema, step: positiveInt.optional() }),
      z.strictObject({ kind: z.literal('heal'), dice: z.string().min(1).max(20), step: positiveInt.optional() }),
      z.strictObject({ kind: z.literal('targets'), add: positiveInt, step: positiveInt.optional() }),
      z.strictObject({ kind: z.literal('area'), add: positiveInt, unit: z.enum(['ft', 'mi']), step: positiveInt.optional() }),
      z.strictObject({ kind: z.literal('duration'), table: z.array(z.strictObject({ slot: z.number().int().min(1).max(9), value: z.string().min(1).max(60) })).min(1) }),
      z.strictObject({ kind: z.literal('note'), text: z.string().min(1).max(2000), auto: z.literal(false) }),
    ]),
  )
  .min(1)

/** C2 材料成分是否消耗：放宽为 true｜false｜"optional"。 */
export const consumedSchema = z.union([z.boolean(), z.literal('optional')])

/** D1 价格：铜币，最多一位小数。 */
export const priceSchema = z.number().nonnegative().refine((v) => Math.abs(v * 10 - Math.round(v * 10)) < 1e-9, '价格最多一位小数')

/** D4 职业的工具熟练选择（`proficiencies.toolChoose`）。 */
export const TOOL_CHOICE_TOKENS = ['tool:anyMusicalInstrument', 'tool:anyArtisansTool', 'tool:anyGamingSet'] as const
export const toolChooseSchema = z.strictObject({ count: positiveInt, from: z.array(z.enum(TOOL_CHOICE_TOKENS)).min(1) })

/** F1 带条件的抗性/免疫/易伤。 */
export const conditionalDamageSchema = z.array(
  z.strictObject({
    damage: z.array(damageTypeSchema).min(1),
    except: z.enum(['magical', 'silvered', 'adamantine', 'magicalOrSilvered', 'other']).optional(),
    when: shortText,
  }),
)

/** F2 充能动作。 */
export const rechargeRollSchema = z.strictObject({ min: z.number().int().min(1).max(6), max: z.number().int().min(1).max(6) }).refine((v) => v.min <= v.max, 'min 不能大于 max')

/** F3 传奇动作花费。 */
export const legendaryCostSchema = positiveInt

/** F4 召唤物与同伴：随法术环阶或随主人职业等级变化的公式。 */
export const summonSchema = z
  .strictObject({
    by: z.enum(['spell', 'class']),
    classId: entryIdSchema.optional(),
    baseLevel: z.number().int().min(1).max(9).optional(),
    ac: strictFormulaSchema.optional(),
    hp: strictFormulaSchema.optional(),
    attackBonus: strictFormulaSchema.optional(),
    damageBonus: strictFormulaSchema.optional(),
  })
  .superRefine((v, ctx) => {
    if (v.by === 'class' && v.classId === undefined) ctx.addIssue({ code: 'custom', message: 'by 为 class 时必须写 classId' })
    if (v.by === 'spell' && v.baseLevel === undefined) ctx.addIssue({ code: 'custom', message: 'by 为 spell 时必须写 baseLevel' })
    if (v.by === 'spell' && v.classId !== undefined) ctx.addIssue({ code: 'custom', message: 'classId 只与 by: "class" 同用' })
    if (v.ac === undefined && v.hp === undefined && v.attackBonus === undefined && v.damageBonus === undefined) ctx.addIssue({ code: 'custom', message: 'summon 至少要有一个公式' })
  })

/** 语言条目的方言代码（原初语的水/风/火/土）；与原有的 `dialects`（名字数组）并列，原字段不动。 */
export const dialectCodesSchema = z.array(z.strictObject({ code: idSchema, name: z.string().min(1).max(40) })).min(1)

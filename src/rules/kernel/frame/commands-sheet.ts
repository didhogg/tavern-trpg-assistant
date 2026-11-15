// P6 B1：人物页用的读 / 改 / 掷 / 删人命令。只接 dnd5e / Foundry 官方入口，不写规则。
// 能改哪些字段由文档自己的数据结构判断（schema.getField），不写字段名单；
// 只挡住几处结构性的路径：文档编号、内嵌集合（物品 / 效果有自己的改法）、作者编号（引用靠它）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */

import { itemState, type ActorGetter, type Operate } from './commands-items'

const g = globalThis as any
const NO_DIALOG = { configure: false }
const NO_MESSAGE = { create: false }

/** 改动一条：set = 设成 value；remove = 删掉这个键（基准里没有的字段回到"没有"）。 */
export type SheetEdit =
  | { kind: 'set'; path: string; value?: unknown; remove?: boolean }
  | { kind: 'item'; itemId: string; path: string; value?: unknown; remove?: boolean }
  | { kind: 'itemDelete'; itemId: string }
  | { kind: 'effect'; effectId: string; path: string; value?: unknown; remove?: boolean }
  | { kind: 'effectCreate'; data: Record<string, unknown> }
  | { kind: 'effectDelete'; effectId: string }
  | { kind: 'status'; statusId: string; active?: boolean; levels?: number }

const LOCKED = [/^_id$/, /^_stats(\.|$)/, /^type$/, /^items(\.|$)/, /^effects(\.|$)/, /^flags\.plutonium(\.|$)/, /^system\.advancement(\.|$)/]

/** 路径是不是这个文档能存的字段：system.* 问模型字段，flags.* 是模块附加数据，其余问文档字段。 */
function writable(doc: any, path: string): boolean {
  if (!path || LOCKED.some((re) => re.test(path))) return false
  if (path.startsWith('flags.')) return path.split('.').length >= 3
  if (path.startsWith('system.')) return !!doc.system?.schema?.getField?.(path.slice(7))
  return !!doc.schema?.getField?.(path)
}

/** 一条 set / remove 换成官方 update 的写法；remove 用 Foundry 的 `-=键` 删除。 */
function patchOf(doc: any, path: string, value: unknown, remove?: boolean): Record<string, unknown> {
  if (!writable(doc, path)) throw Error(`不能改这个字段：${path}`)
  if (!remove) return { [path]: value }
  const cut = path.lastIndexOf('.')
  return { [`${path.slice(0, cut)}.-=${path.slice(cut + 1)}`]: null }
}

/** 数据结构里的 JSON 化（去掉文档对象、HTML 锚点这类界面专用的东西）。 */
const plain = (v: any): any => JSON.parse(JSON.stringify(v ?? null, (k, val) => (k === 'document' || k === 'anchor' || k === 'fields' || k === 'field' || k === 'parent') ? undefined : val))

/** 引擎配置窗算好的上下文（不打开窗口）：生命按职业的合计、效果加成；AC 的公式与计算。 */
async function configContext(Cls: any, a: any, keys: string[]): Promise<Record<string, unknown> | null> {
  if (!Cls) return null
  const app = new Cls({ document: a })
  const base = await app._prepareContext({ parts: [] })
  const ctx = await app._preparePartContext(Object.keys(Cls.PARTS ?? {})[0] ?? 'config', base, {})
  return Object.fromEntries(keys.filter((k) => k in ctx).map((k) => [k, plain(ctx[k])]))
}

/** 掷骰登记表：一种检定一行，都是官方 roll* 入口；加一种 = 加一行。 */
const CHECKS: Record<string, (a: any, key?: string) => Promise<any[] | null>> = {
  ability: (a, key) => a.rollAbilityCheck({ ability: key }, NO_DIALOG, NO_MESSAGE),
  tool: (a, key) => a.rollToolCheck({ tool: key }, NO_DIALOG, NO_MESSAGE),
  death: (a) => a.rollDeathSave({}, NO_DIALOG, NO_MESSAGE),
  hitDie: (a, key) => a.rollHitDie(key ? { denomination: key } : {}, NO_DIALOG, NO_MESSAGE),
  // 战斗外先攻：官方 rollInitiative 会建战斗，这里只取官方先攻骰再掷。
  initiative: async (a) => {
    const roll = a.getInitiativeRoll()
    if (!roll) return null
    await roll.evaluate({ allowInteractive: false })
    return [roll]
  },
}

export function createSheetCommands(operate: Operate, actor: ActorGetter, rollSummary: (roll: any) => any) {
  return {
    /** 人物页读数：官方准备后的数值 + 物品 / 效果 + 生命与 AC 的官方分解；界面只显示，不算。 */
    sheet: (actorId: string) => operate([], async () => {
      const a = actor(actorId)
      const apps = g.dnd5e?.applications?.actor ?? {}
      return {
        id: a.id, name: a.name, img: a.img, type: a.type,
        flags: plain(a.flags ?? {}),
        system: plain(a.system.toObject(false)),
        statuses: [...(a.statuses ?? [])],
        items: [...a.items].map((i: any) => ({ ...itemState(i), img: i.img, sort: i.sort, system: plain(i.system.toObject(false)), labels: plain(i.labels ?? {}) })),
        effects: [...a.allApplicableEffects()].map((e: any) => ({
          id: e.id, name: e.name, img: e.img, disabled: e.disabled, suppressed: e.isSuppressed ?? false,
          origin: e.origin ?? null, from: e.parent?.documentName === 'Item' ? { itemId: e.parent.id, name: e.parent.name } : null,
          statuses: [...(e.statuses ?? [])], duration: plain(e.duration), changes: plain(e.system?.changes ?? e.changes ?? []),
        })),
        breakdown: {
          hp: await configContext(apps.HitPointsConfig, a, ['classes', 'ability', 'effects', 'levels']),
          ac: await configContext(apps.ArmorClassConfig, a, ['calculations', 'formulaLabel']),
        },
      }
    }),

    /** 统一改人物：一组改动按顺序走官方 update / 建删内嵌文档 / 状态开关。 */
    edit: (actorId: string, edits: SheetEdit[]) => operate([], async () => {
      const a = actor(actorId)
      for (const e of edits) {
        if (e.kind === 'set') await a.update(patchOf(a, e.path, e.value, e.remove))
        else if (e.kind === 'item') { const item = a.items.get(e.itemId, { strict: true }); await item.update(patchOf(item, e.path, e.value, e.remove)) }
        else if (e.kind === 'itemDelete') await a.deleteEmbeddedDocuments('Item', [e.itemId])
        else if (e.kind === 'effect') { const fx = a.effects.get(e.effectId, { strict: true }); await fx.update(patchOf(fx, e.path, e.value, e.remove)) }
        else if (e.kind === 'effectCreate') await a.createEmbeddedDocuments('ActiveEffect', [e.data])
        else if (e.kind === 'effectDelete') await a.deleteEmbeddedDocuments('ActiveEffect', [e.effectId])
        else if (e.kind === 'status') await a.toggleStatusEffect(e.statusId, e.levels !== undefined ? { levels: e.levels } : { active: e.active ?? true })
        else throw Error(`不认识的改动：${(e as any).kind}`)
      }
      return { edits: edits.length }
    }, [actorId]),

    /** 检定登记表里的掷骰（属性 / 工具 / 死亡豁免 / 生命骰 / 战斗外先攻）；点数由调用方给。 */
    check: (actorId: string, kind: string, key?: string, points: number[] = []) => operate(points, async () => {
      const run = CHECKS[kind]
      if (!run) throw Error(`没有这种检定：${kind}`)
      return (await run(actor(actorId), key))?.map(rollSummary) ?? null
    }, [actorId]),

    /** 从小窗里删掉人物（删人、撤销加人、按存档退回前用）。 */
    deleteActors: (ids: string[]) => operate([], async () => {
      const exist = ids.filter((id) => g.game.actors.get(id))
      if (exist.length) await g.CONFIG.Actor.documentClass.deleteDocuments(exist)
      return { deleted: exist }
    }),
  }
}

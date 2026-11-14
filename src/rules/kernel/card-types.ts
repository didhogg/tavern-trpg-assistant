// P5.6 卡型：一个规则有哪几种人物卡、各自怎么建、存成【库】哪一类。不写类型清单：
//   卡型 = 规则系统声明的人物类型 ∩ 能建出来的类型（结算小窗 actorTypes，frame/actor-types.ts）。
//   能建出来 = 人物存放类别（规则数据 people，11-02：所有人存成怪物属性块）的条目经作者导入器换出来的类型，
//             或分步建卡命令建出的类型。
// 中文名和存放类别不存进这份结果，每次从字段中文名表 / 规则数据现取（重跑翻译生成工具、改规则数据不用清这份）。
// 问一次要开结算内核（约 10 秒），结果按结算内核指纹存进【库】derived 表（kc-cardtypes:规则），内核没变不再开。
import type { FileProvider } from '../../library/files'
import type { LibraryDatabase } from '../../library/db'
import type { LibraryRevisionStore } from '../../library/revision'
import type { ScopedLibrary } from '../../library/scoped'
import { loadFieldLabels } from '../../library/brew-validate'
import registry from '../../library/scopes.json'
import { defaultCampaignLibrary } from '../../library/scopes'
import { ruleKernel } from './adapters'
import { kernelEntryOf } from './entry'
import { libraryData, startKernel } from './host'
import { kernelInput } from './input'
import type { ActorTypesResult } from './frame/actor-types'

export interface CardType {
  /** 规则系统里的人物类型编号（dnd5e：character / npc）。 */
  type: string
  /** 规则系统语言文件里的名字（dnd5e 只带英文）。 */
  label: string
  /** 中文名：规则系统的英文名经作者大译名表对换（tools/build-field-labels.mjs 生成）；对换不出来 = null，界面显示英文名。 */
  labelZh: string | null
  /** 怎么建：steps = 分步建卡（种族 / 职业 / 背景）；store = 从存放类别的条目（怪物属性块）。两种都行时两个都有。 */
  build: Array<'steps' | 'store'>
  /**
   * 从【库】哪一类的条目建（规则数据 people，怪物属性块）；只有 build 含 store 时有。
   * 分步建卡的人物不存成条目：存档里只存「用了哪些条目 + 选了什么 + 状态」（D2，后端整体分块 §4.3）。
   */
  store: string | null
}

export type CardTypesResult =
  | { status: 'ready'; types: CardType[] }
  /** no-kernel：规则还没接结算（2024）；no-data：这一类在库里还没有条目（官方资料没装），装好再问。 */
  | { status: 'no-kernel' | 'no-data'; types: [] }

export interface CardTypeDeps {
  pluginRoot: URL
  files: FileProvider
  scoped: ScopedLibrary
  db: LibraryDatabase
  revisions: LibraryRevisionStore
  fetchImpl?: typeof fetch
  container?: () => HTMLElement
  timeoutMs?: number
}

/** 存进 derived 表的部分（中文名、存放类别现取）。 */
type Memo = Pick<CardType, 'type' | 'label' | 'build'>

const RULES = registry.rules as Record<string, { people?: string }>

/** 这个规则的人物存成【库】哪一类；规则没写 = null。 */
export const peopleProp = (rule: string): string | null => RULES[rule]?.people ?? null

export async function cardTypes(deps: CardTypeDeps, rule: string, codeSet = 'cn'): Promise<CardTypesResult> {
  const store = peopleProp(rule)
  if (!ruleKernel(rule) || !store) return { status: 'no-kernel', types: [] }
  const input = await kernelInput({ pluginRoot: deps.pluginRoot, rule, world: { id: `card-types-${rule}`, title: `card types ${rule}` }, fetchImpl: deps.fetchImpl })
  const fingerprint = input.cacheKey ?? ''
  const memoKey = `kc-cardtypes:${rule}`
  const rec = await deps.db.derived.get(memoKey)
  const systemId = String((input.system as { id?: unknown }).id ?? '')
  const named = async (types: Memo[]): Promise<CardTypesResult> => {
    const zh = (await loadFieldLabels()).actorTypes?.[systemId] ?? {}
    return { status: 'ready', types: types.map((t) => ({ type: t.type, label: t.label, build: t.build, labelZh: zh[t.type] ?? null, store: t.build.includes('store') ? store : null })) }
  }
  if (rec && rec.fingerprint === fingerprint) return named(rec.value as Memo[])

  // 交给导入器的样本：照预换算取法（英文对照条目），取库里这一类的第一条有名字的
  const view = await deps.revisions.published()
  const library = defaultCampaignLibrary(rule, codeSet)
  const rows = await deps.scoped.query(library, store, { view }).catch(() => [])
  const row = rows.find((r) => typeof (r.item as { name?: unknown } | null)?.name === 'string')
  if (!row) return { status: 'no-data', types: [] }
  const sample = (await kernelEntryOf(deps.scoped, library.codeSet, row.ref, row.item, row.version.altId, view)).entry

  const session = await startKernel({ pluginRoot: deps.pluginRoot, container: deps.container?.() ?? document.body, data: libraryData(deps.files, view), fetchImpl: deps.fetchImpl, timeoutMs: deps.timeoutMs ?? 180_000 })
  try {
    await session.boot(input)
    const out = await session.call('actorTypes', store, [sample])
    if (out.status !== 'complete' || !out.result) throw new Error(`结算内核没答出人物类型：${out.status}`)
    const { declared, fromStore, build } = out.result as ActorTypesResult
    const types: Memo[] = declared
      .map((d) => ({ type: d.type, label: d.label, build: [...(d.type === build ? ['steps' as const] : []), ...(fromStore.includes(d.type) ? ['store' as const] : [])] }))
      .filter((t) => t.build.length > 0)
    await deps.db.derived.put({ key: memoKey, fingerprint, value: types, savedAt: Date.now() })
    return named(types)
  } finally {
    session.close()
  }
}

export interface CardFields<Table, Plan> {
  type: CardType
  /**
   * 从条目建（build 含 store，例：非玩家角色 ← 怪物属性块）：那一类在条目编辑器里的
   * 字段说明表（custom.fields）和表单安排（custom.formPlan），不另写字段逻辑。
   */
  store?: { prop: string; fields: Table; plan: Plan }
  /**
   * 分步建卡（build 含 steps，例：玩家角色）：要从【库】选哪几类条目（规则数据 kernel.build，和存档重建同一份）。
   * 选好一件条目后它展开哪些成长步骤，由结算内核 buildSteps 按那件条目列（P6 接）；类别中文名用 custom.entryTypes。
   */
  steps?: { parts: string[] }
}

/**
 * 一种卡型怎么填（给 P6 人物页）：按卡型「怎么建」分开给，不按卡型名字写死。
 * 规则没有这种卡型时报错（不猜）。
 */
export async function cardFields<Table, Plan>(
  form: { types: (rule: string, codeSet?: string) => Promise<CardTypesResult>; fields: (codeSet: string, prop: string) => Promise<Table>; plan: (codeSet: string, prop: string) => Promise<Plan> },
  rule: string, type: string, codeSet = 'cn',
): Promise<CardFields<Table, Plan>> {
  const result = await form.types(rule, codeSet)
  const card = result.types.find((t) => t.type === type)
  if (!card) throw new Error(result.status === 'ready' ? `规则 ${rule} 没有这种卡型：${type}` : `规则 ${rule} 的卡型还读不出来（${result.status}）`)
  const out: CardFields<Table, Plan> = { type: card }
  if (card.build.includes('store') && card.store) {
    const [fields, plan] = await Promise.all([form.fields(codeSet, card.store), form.plan(codeSet, card.store)])
    out.store = { prop: card.store, fields, plan }
  }
  if (card.build.includes('steps')) out.steps = { parts: [...(ruleKernel(rule)?.build ?? [])] }
  return out
}

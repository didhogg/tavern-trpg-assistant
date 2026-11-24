// P6-R 人物单元重做（照 DiceCloud：每个数点开能看来源、能改底值）：编辑窗口的字段全按 dnd5e 官方字段定义生成，不手写表单。
//   fieldInfo(人物, { itemId?, path }) → 这一块的字段树：名字（官方字段名，过显示出口）、种类（数 / 开关 / 单选 / 多选 / 文字 / 公式 / 正文）、
//   选项（官方选项表，官方设置窗口另给的按登记表）、范围、当前底值（存的值）；官方算出来不存的字段只读、给算好的值（明细）；另给：改到这一块的效果（谁改的、怎么改、改多少）。
/* eslint-disable @typescript-eslint/no-explicit-any -- Foundry / dnd5e 字段定义与文档没有类型声明。 */
import type { ActorGetter, Operate } from './commands-items'
import { asData, fromAuthor, named } from '../shown'
import { baseItemIds } from './author-classes'
import { nameText } from './registry-keys'
import { itemText } from './sheet-texts'
import type { FrameText } from '../shown'

const g = globalThis as any

export type FieldKind = 'number' | 'boolean' | 'select' | 'multi' | 'tags' | 'text' | 'formula' | 'html'
export interface FieldNode {
  path: string
  label: FrameText | null
  hint: FrameText | null
  kind?: FieldKind
  value?: unknown
  choices?: Array<{ value: string; label: FrameText }>
  min?: number
  max?: number
  step?: number
  integer?: boolean
  nullable?: boolean
  /** 官方算出来的值（不存，只读）：明细用。 */
  derived?: boolean
  /** 单选但存的是数（豁免熟练、优势模式……）：选完按数写回。 */
  numeric?: boolean
  children?: FieldNode[]
}

/** 官方字段名 / 说明：语言键或已翻好的字；都过显示出口。 */
function text(v: unknown): FrameText | null {
  if (typeof v !== 'string' || !v.trim()) return null
  if (g.game.i18n.has(v)) return { $t: 'system', key: v, text: g.game.i18n.localize(v) } as FrameText
  return nameText(v, null) ?? fromAuthor(v, null)
}

/**
 * 官方字段定义里没带选项、由 dnd5e 官方设置窗口另给选项的字段（登记，照 module/applications/actor/config/*.mjs 与 api/base-config-sheet.mjs）。
 * 选项都取官方配置表 / 语言键，不手写名字。
 */
const FIELD_OPTIONS: Array<{ path: RegExp; options: () => Array<[string | number, unknown]> }> = [
  // base-config-sheet：advantageModeOptions
  { path: /\.roll\.mode$/, options: () => [[-1, 'DND5E.Disadvantage'], [0, 'DND5E.Normal'], [1, 'DND5E.Advantage']] },
  // ability-config：豁免只有不熟练 / 熟练两档
  { path: /^system\.abilities\.[^.]+\.proficient$/, options: () => [0, 1].map((n) => [n, g.CONFIG.DND5E.proficiencyLevels[n]]) },
  // skill-tool-config：proficiencyOptions / abilityOptions
  { path: /^system\.(skills|tools)\.[^.]+\.value$/, options: () => Object.entries(g.CONFIG.DND5E.proficiencyLevels).map(([v, l]) => [Number(v), l]) },
  { path: /^system\.(skills|tools)\.[^.]+\.ability$|^system\.attributes\.spellcasting$/, options: () => Object.entries(g.CONFIG.DND5E.abilities).map(([v, a]: [string, any]) => [v, a.label]) },
  // initiative-config / concentration-config：可选“默认”
  { path: /^system\.attributes\.(init|concentration)\.ability$/, options: () => [['', 'DND5E.Default'], ...Object.entries(g.CONFIG.DND5E.abilities).map(([v, a]: [string, any]) => [v, a.label] as [string, unknown])] },
  // armor-class-config：formulaOptions
  { path: /^system\.attributes\.ac\.calcs?$/, options: () => Object.entries(g.CONFIG.DND5E.armorClasses).map(([v, a]: [string, any]) => [v, a.label]) },
  // movement-senses / languages-config：单位
  { path: /^system\.attributes\.(movement|senses)\.units$/, options: () => Object.entries(g.CONFIG.DND5E.movementUnits).map(([v, a]: [string, any]) => [v, a.label]) },
]
const registered = (path: string): Array<{ value: string; label: FrameText }> | undefined => {
  const hit = FIELD_OPTIONS.find((r) => r.path.test(path))
  return hit?.options().map(([value, label]) => ({ value: String(value), label: (typeof label === 'string' ? text(label) : null) ?? asData(String(value)) }))
}

/** 官方选项表 → [值, 名字]；函数、数组、对象（名字串或 { label }）都认。 */
function choicesOf(field: any): Array<{ value: string; label: FrameText }> | undefined {
  let raw = field?.choices
  if (typeof raw === 'function') raw = raw()
  if (!raw) return undefined
  const rows: Array<[string, unknown]> = Array.isArray(raw) ? raw.map((x) => [String(x), x]) : Object.entries(raw)
  return rows.map(([value, v]) => {
    const name = typeof v === 'string' ? v : (v as any)?.label ?? (v as any)?.name ?? value
    return { value, label: text(name) ?? asData(value) }
  })
}

function kindOf(field: any): FieldKind | null {
  const F = g.foundry.data.fields
  const D = g.dnd5e?.dataModels?.fields ?? {}
  if (field instanceof F.BooleanField) return 'boolean'
  if (field instanceof F.NumberField) return 'number'
  if (field instanceof F.HTMLField) return 'html'
  if (field instanceof F.SetField || field instanceof F.ArrayField) {
    const el = field.element
    if (!(el instanceof F.StringField)) return null
    return choicesOf(el) ? 'multi' : 'tags'
  }
  if (D.FormulaField && field instanceof D.FormulaField) return 'formula'
  if (field instanceof F.StringField) return choicesOf(field) ? 'select' : 'text'
  return null
}

/** 一个字段（含子字段）摆成节点；值取存的底值。depth 防无穷。 */
function node(field: any, path: string, source: any, depth: number, doc: any): FieldNode | null {
  const F = g.foundry.data.fields
  const base = { path, label: text(field.label), hint: text(field.hint) }
  if (field instanceof F.SchemaField && !(field instanceof F.EmbeddedDataField && !field.fields)) {
    if (depth > 4) return null
    const children = Object.entries(field.fields ?? {}).map(([k, f]) => node(f, `${path}.${k}`, source?.[k], depth + 1, doc)).filter((x): x is FieldNode => !!x)
    return children.length ? { ...base, children } : null
  }
  // 映射字段（dnd5e MappingField：六属性、技能、工具……一个键一组，子字段定义相同）：按这个人实际有的键展开
  if (field.model instanceof F.DataField && field instanceof F.ObjectField && source && typeof source === 'object') {
    if (depth > 4) return null
    const children = Object.keys(source).map((k) => node(field.model, `${path}.${k}`, source[k], depth + 1, doc)).filter((x): x is FieldNode => !!x)
    return children.length ? { ...base, children } : null
  }
  const extra = registered(path)
  const kind = extra && field instanceof F.SetField ? 'multi' : extra && (field instanceof F.StringField || field instanceof F.NumberField) ? 'select' : kindOf(field)
  if (!kind) return null
  // 官方不存的字段（persisted: false）是算出来的：只读，值取算好的
  const derived = field.options?.persisted === false
  const value = derived ? getProp(doc, path) : source
  const out: FieldNode = { ...base, kind, value: value instanceof Set ? [...value] : value ?? null, ...(derived ? { derived: true } : {}) }
  if (extra) { out.choices = extra; if (field instanceof F.NumberField) out.numeric = true }
  else if (kind === 'select') out.choices = choicesOf(field)
  if (kind === 'multi') out.choices = choicesOf(field.element)
  if (kind === 'number') Object.assign(out, { min: field.min, max: field.max, step: field.step, integer: !!field.integer, nullable: !!field.nullable })
  return out
}

const getProp = (o: any, path: string): any => path.split('.').reduce((v, k) => (v == null ? undefined : v[k]), o)
/** 一个路径往上找到第一个有官方名字的字段（效果改的是哪一项）。 */
function fieldLabel(doc: any, path: string): string | null {
  const parts = path.split('.')
  for (let n = parts.length; n > 0; n--) {
    const p = parts.slice(0, n).join('.')
    const label = (p.startsWith('system.') ? doc.system?.schema?.getField(p.slice(7)) : doc.schema?.getField(p))?.label
    if (typeof label === 'string' && label) return label
  }
  return null
}

export function createFieldCommands(operate: Operate, actor: ActorGetter) {
  return {
    /** 一块字段的编辑信息（见文件头）。path 以 system. / name / img 开头；itemId 给了就是这件物品上的字段。 */
    fieldInfo: (actorId: string, target: { itemId?: string; path: string }) => operate([], async () => {
      const a = actor(actorId)
      const doc = target.itemId ? a.items.get(target.itemId) : a
      if (!doc) throw Error(`没有这件物品：${target.itemId}`)
      const { path } = target
      const field = path === 'system' ? doc.system?.schema : path.startsWith('system.') ? doc.system?.schema?.getField(path.slice(7)) : doc.schema?.getField(path)
      if (!field) throw Error(`官方没有这个字段：${path}`)
      const source = getProp(doc._source, path)
      const tree = node(field, path, source, 0, doc)
      // 改到这一块的效果（人物身上生效的全部效果；物品上的字段不看效果）
      // Foundry 14：改动在 system.changes，写 type 字符串；改法清单与名字取官方 ActiveEffect.CHANGE_TYPES（核心 + 登记的，带语言键）
      const TYPES: Record<string, { label: string }> = g.CONFIG.ActiveEffect.documentClass.CHANGE_TYPES ?? {}
      const typeOf = (c: any): string => typeof c.type === 'string' ? c.type : (Object.entries(g.CONST.ACTIVE_EFFECT_MODES ?? {}).find(([, v]) => v === c.mode)?.[0] ?? '').toLowerCase()
      const typeLabel = (t: string): FrameText | null => text(String(TYPES[t]?.label ?? t))
      const effects = target.itemId ? [] : [...(a.allApplicableEffects?.() ?? [])].flatMap((e: any) => [...(e.system?.changes ?? e.changes ?? [])]
        .filter((c: any) => c.key === path || c.key.startsWith(`${path}.`) || path.startsWith(`${c.key}.`))
        .map((c: any) => {
          const origin = e.parent && e.parent !== a ? itemText(e.parent, []).name : null
          const type = typeOf(c)
          return {
            effect: e.id, itemId: e.parent && e.parent !== a ? e.parent.id : null, name: text(e.name), origin,
            active: !e.disabled && !e.isSuppressed, disabled: !!e.disabled, manual: !!e.flags?.['tavern-trpg']?.manual,
            key: c.key, keyLabel: text(fieldLabel(a, c.key)), mode: type ? typeLabel(type) : null, modeCode: type, value: c.value,
          }
        }))
      // 明细 = 官方不存、算出来的字段（AC 的护甲 / 盾牌 / 加值 / 掩护……，见 derived 节点）+ 上面的效果；
      // dnd5e 的 getAttributionData 会开官方窗口，小窗里当成等输入，不用
      // 效果的改法（官方常量 + 官方语言键），给“添加效果”选
      // 效果改法（给“添加条目 / 效果页”选）：官方 ActiveEffect.CHANGE_TYPES
      const modes = Object.entries(TYPES).map(([value, t]) => ({ value, label: text(String(t.label ?? value)) ?? asData(value) }))
      // 效果持续的单位（照 Foundry 14 自己的效果表 ActiveEffectConfig：CONST.ACTIVE_EFFECT_DURATION_UNITS，名字 = EFFECT.DURATION.UNITS.<单位>）
      const durationUnits = [...(g.CONST.ACTIVE_EFFECT_DURATION_UNITS ?? [])].map((value: string) => ({ value, label: text(`EFFECT.DURATION.UNITS.${value}`) ?? asData(value) }))
      return { tree, effects, attribution: null, derived: null, modes, durationUnits }
    }),

    /**
     * 特质的可选项（照官方 TraitsConfig：dnd5e.documents.Trait.choices，带层级——类别 → 具体项、能不能选）：
     * 基础物品（具体武器 / 护甲 / 工具）按作者编号取名，其余按语言键；抗性 / 免疫 / 易伤另给“无视条件”（官方物品属性里 isPhysical 的），
     * 语言另给交流方式（官方 communicationTypes）。已选的界面从人物字段读（path = 官方 actorKeyPath）。
     */
    traitChoices: (trait: string) => operate([], async () => {
      const T = g.dnd5e.documents.Trait
      const ids = ['weapon', 'armor', 'tool'].includes(trait) ? await baseItemIds() : new Map()
      const leaf = (key: string): string => key.split(':').pop() ?? key
      const rows: Array<{ key: string; label: FrameText | null; depth: number; selectable: boolean }> = []
      const walk = (obj: any, depth: number): void => {
        for (const [key, c] of Object.entries<any>(obj ?? {})) {
          if (c?.wildcard) continue
          const label = String(c.label ?? key)
          const id = ids.get(leaf(key))
          rows.push({ key, label: id && /[A-Za-z]/.test(label) ? named(label, id, true) : text(label), depth, selectable: c.selectable !== false })
          if (c.children) walk(c.children, depth + 1)
        }
      }
      walk(await T.choices(trait), 0)
      const damage = ['dr', 'di', 'dv', 'dm'].includes(trait)
      const bypasses = damage ? Object.entries<any>(g.CONFIG.DND5E.itemProperties ?? {}).filter(([, p]) => p.isPhysical).map(([key, p]) => ({ key, label: text(String(p.label ?? key)) })) : []
      const communication = trait === 'languages' ? Object.entries<any>(g.CONFIG.DND5E.communicationTypes ?? {}).map(([key, p]) => ({ key, label: text(String(p.label ?? key)) })) : []
      return { trait, path: T.actorKeyPath(trait), label: text(T.traitLabel(trait)), rows, bypasses, communication }
    }),
  }
}

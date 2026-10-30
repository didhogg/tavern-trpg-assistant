import type { Raw, UnsupportedMod } from './load'
import { applyMods } from './load'

function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/** 版本记录里不继承基础记录的来源关系字段。 */
const NOT_INHERITED = ['_versions', 'reprintedAs', 'otherSources', 'additionalSources', 'referenceSources', 'srd', 'basicRules', '_copy', '_mod']

function ownerOf(value: Raw): { name: string; source: string } {
  return { name: String(value.ENG_name ?? value.name ?? '未知'), source: String(value.source ?? '未知') }
}

/** 5etools 的 replaceTxt 是正则替换（replace 为正则源码，flags 缺省为 g）；递归替换所有字符串。 */
function replaceRegex(value: unknown, pattern: RegExp, replacement: string): unknown {
  if (typeof value === 'string') return value.replace(pattern, replacement)
  if (Array.isArray(value)) return value.map((item) => replaceRegex(item, pattern, replacement))
  if (isObj(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceRegex(item, pattern, replacement)]))
  return value
}

function renameIn(record: Raw, key: string, op: Raw): Raw {
  const list = Array.isArray(record[key]) ? (record[key] as unknown[]) : []
  const renames = (Array.isArray(op.renames) ? op.renames : [op.renames]).filter(isObj)
  return {
    ...record,
    [key]: list.map((item) => {
      if (!isObj(item)) return item
      const hit = renames.find((r) => r.rename === item.name)
      return hit ? { ...item, name: String(hit.with) } : item
    }),
  }
}

/** addSpells：把法术并进怪物第一个 spellcasting 块（spells 按环阶追加，will 追加，daily/rest 等按次数合并）。 */
function addSpells(record: Raw, op: Raw): Raw | undefined {
  const blocks = Array.isArray(record.spellcasting) ? (record.spellcasting as unknown[]) : []
  const first = blocks.find(isObj)
  if (!first) return undefined
  const block: Raw = { ...first }
  const levels = isObj(op.spells) ? op.spells : {}
  const spells: Raw = isObj(block.spells) ? { ...block.spells } : {}
  for (const [level, add] of Object.entries(levels)) {
    if (!isObj(add)) continue
    const current = isObj(spells[level]) ? (spells[level] as Raw) : {}
    spells[level] = { ...current, ...(typeof add.slots === 'number' ? { slots: add.slots } : {}), spells: [...(Array.isArray(current.spells) ? current.spells : []), ...(Array.isArray(add.spells) ? add.spells : [])] }
  }
  if (Object.keys(levels).length) block.spells = spells
  if (Array.isArray(op.will)) block.will = [...(Array.isArray(block.will) ? block.will : []), ...op.will]
  for (const key of ['daily', 'rest', 'weekly', 'yearly', 'monthly']) {
    const add = op[key]
    if (!isObj(add)) continue
    const current = isObj(block[key]) ? { ...(block[key] as Raw) } : {}
    for (const [count, list] of Object.entries(add)) current[count] = [...(Array.isArray(current[count]) ? (current[count] as unknown[]) : []), ...(Array.isArray(list) ? list : [])]
    block[key] = current
  }
  return { ...record, spellcasting: blocks.map((b) => (b === first ? block : b)) }
}

/** 版本的 _mod：在已有操作之外补 renameArr 与 addSpells（键 _），逐个操作按顺序应用。 */
export function applyVersionMods(base: Raw, mod: Raw, sink?: UnsupportedMod[]): Raw {
  let out: Raw = { ...base }
  for (const [key, value] of Object.entries(mod)) {
    const ops = Array.isArray(value) ? value : [value]
    for (const op of ops) {
      if (key === '*' && isObj(op) && op.mode === 'replaceTxt' && typeof op.replace === 'string' && typeof op.with === 'string') {
        out = replaceRegex(out, new RegExp(op.replace, typeof op.flags === 'string' ? op.flags : 'g'), op.with) as Raw
      } else if (isObj(op) && op.mode === 'renameArr') out = renameIn(out, key, op)
      else if (isObj(op) && op.mode === 'addSpells') {
        const next = addSpells(out, op)
        if (next) out = next
        else sink?.push({ ...ownerOf(base), mode: 'addSpells', key })
      } else out = applyMods(out, { [key]: op }, sink)
    }
  }
  return out
}

/** 龙裔颜色变量只有中文，英文名字段（ENG_name）用英文颜色，保证条目 id 可读且稳定。 */
const COLOR_EN: Record<string, string> = { 黑: 'Black', 蓝: 'Blue', 黄铜: 'Brass', 青铜: 'Bronze', 赤铜: 'Copper', 金: 'Gold', 绿: 'Green', 红: 'Red', 银: 'Silver', 白: 'White' }

function substitute(value: unknown, variables: Record<string, unknown>): unknown {
  const fill = (text: string, vars: Record<string, unknown>): string => {
    let out = text
    for (const [name, replacement] of Object.entries(vars)) out = out.split(`{{${name}}}`).join(String(replacement))
    return out
  }
  const english = { ...variables, ...(typeof variables.color === 'string' && COLOR_EN[variables.color] ? { color: COLOR_EN[variables.color] } : {}) }
  const walk = (node: unknown, key = ''): unknown => {
    if (typeof node === 'string') return fill(node, key === 'ENG_name' ? english : variables)
    if (Array.isArray(node)) return node.map((item) => walk(item))
    if (isObj(node)) return Object.fromEntries(Object.entries(node).map(([k, item]) => [k, walk(item, k)]))
    return node
  }
  return walk(value)
}

/** 一个版本的完整形态：_abstract + _implementations 先展开成若干普通版本。 */
function versionsOf(base: Raw): Raw[] {
  const out: Raw[] = []
  for (const version of Array.isArray(base._versions) ? base._versions : []) {
    if (!isObj(version)) continue
    if (isObj(version._abstract) && Array.isArray(version._implementations)) {
      for (const impl of version._implementations) {
        if (!isObj(impl)) continue
        const { _variables, ...overrides } = impl
        const abstract = substitute(version._abstract, isObj(_variables) ? _variables : {}) as Raw
        out.push({ ...abstract, ...overrides })
      }
    } else out.push(version)
  }
  return out
}

/** 把 _versions 备选版本生成为独立记录（以基础记录为底，版本字段覆盖，null 表示删除，再应用 _mod）；返回原记录加上新记录。 */
export function expandVersions(list: Raw[], sink?: UnsupportedMod[]): Raw[] {
  const generated: Raw[] = []
  for (const base of list) {
    if (!Array.isArray(base._versions)) continue
    for (const version of versionsOf(base)) {
      const merged: Raw = { ...base }
      for (const key of NOT_INHERITED) delete merged[key]
      for (const [key, value] of Object.entries(version)) {
        if (key === '_mod' || key === '_abstract' || key === '_implementations') continue
        if (value === null) delete merged[key]
        else merged[key] = value
      }
      const record = isObj(version._mod) ? applyVersionMods(merged, version._mod, sink) : merged
      generated.push({ ...record, _versionOf: { name: base.name, ENG_name: base.ENG_name, source: base.source } })
    }
  }
  return [...list, ...generated]
}

// 5etools 的 _copy / _mod 继承处理：纯函数，不读文件、不依赖书目配置（单元测试可在没有 reference/ 的环境运行）。
// 从 load.ts 原样移出；load.ts 重新导出，原有导入点不变。
export type Raw = Record<string, unknown>

export function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export interface UnsupportedMod {
  name: string
  source: string
  mode: string
  key: string
}

function ownerOf(value: Raw): { name: string; source: string } {
  return { name: String(value.ENG_name ?? value.name ?? '未知'), source: String(value.source ?? '未知') }
}

function unsupported(entry: Raw, mode: string, key: string, sink?: UnsupportedMod[]): void {
  if (!sink) return
  const owner = ownerOf(entry)
  sink.push({ ...owner, mode, key })
}

function applyMod(value: unknown, mod: unknown, entry: Raw, key: string, sink?: UnsupportedMod[]): unknown {
  if (!isObj(mod)) return mod
  const mode = mod.mode
  if (mode === 'appendArr') {
    const base = Array.isArray(value) ? value : []
    const items = mod.items
    return [...base, ...(Array.isArray(items) ? items : [items])]
  }
  if (mode === 'prependArr') {
    const base = Array.isArray(value) ? value : []
    const items = mod.items
    return [...(Array.isArray(items) ? items : [items]), ...base]
  }
  if (mode === 'removeArr') {
    const base = Array.isArray(value) ? value : []
    const names = new Set((Array.isArray(mod.names) ? mod.names : [mod.names]).filter((x): x is string => typeof x === 'string'))
    return base.filter((item) => !(isObj(item) && typeof item.name === 'string' && names.has(item.name)))
  }
  if (mode === 'setProp') return mod.value
  if (mode === 'replaceArr' || mode === 'insertArr') {
    const base = Array.isArray(value) ? [...value] : []
    const items = mod.items
    const insert = Array.isArray(items) ? items : [items]
    let index = typeof mod.index === 'number' ? mod.index : -1
    const replace = mod.replace
    if (index < 0 && typeof replace === 'string') index = base.findIndex((item) => isObj(item) && item.name === replace)
    if (index < 0 && isObj(replace) && typeof replace.index === 'number') index = replace.index
    if (mode === 'insertArr') base.splice(Math.max(0, index), 0, ...insert)
    else if (index >= 0) base.splice(index, 1, ...insert)
    else base.push(...insert)
    return base
  }
  if (mode === 'replaceTxt' && typeof mod.replace === 'string' && typeof mod.with === 'string') return replaceText(value, mod.replace, mod.with)
  unsupported(entry, String(mode), key, sink)
  return value
}

function replaceText(value: unknown, from: string, to: string): unknown {
  if (typeof value === 'string') return value.split(from).join(to)
  if (Array.isArray(value)) return value.map((item) => replaceText(item, from, to))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) out[key] = replaceText(item, from, to)
    return out
  }
  return value
}

function applyOperations(value: unknown, operations: unknown[], entry: Raw, key: string, sink?: UnsupportedMod[]): unknown {
  return operations.reduce((current, operation) => applyMod(current, operation, entry, key, sink), value)
}

/** 处理 5etools 的 _mod：支持操作数组、prependArr/setProp/removeArr；未知模式登记并保留原值。 */
export function applyMods(base: Raw, mod: Raw, sink?: UnsupportedMod[]): Raw {
  let out: Raw = { ...base }
  const star = mod['*']
  const starOps = Array.isArray(star) ? star : isObj(star) ? [star] : []
  for (const operation of starOps) {
    if (!isObj(operation) || typeof operation.mode !== 'string') continue
    if (operation.mode === 'replaceTxt' && typeof operation.replace === 'string' && typeof operation.with === 'string') {
      out = replaceText(out, operation.replace, operation.with) as Raw
    } else {
      unsupported(base, operation.mode, '*', sink)
    }
  }
  for (const [key, value] of Object.entries(mod)) {
    if (key === '*') continue
    if (key === 'images') continue
    const current = out[key]
    if (Array.isArray(value) && value.every((item) => isObj(item) && typeof item.mode === 'string')) {
      out[key] = applyOperations(current, value, base, key, sink)
    } else if (isObj(value) && typeof value.mode === 'string') {
      out[key] = applyMod(current, value, base, key, sink)
    } else if (isObj(value) && isObj(current)) {
      out[key] = applyMods(current as Raw, value, sink)
    } else {
      out[key] = value
    }
  }
  return out
}

/** 处理 5etools 的 _copy / _mod 继承；srd/basicRules 不继承基础记录。 */
export function resolveCopies(list: Raw[], sink?: UnsupportedMod[]): Raw[] {
  const byKey = new Map<string, Raw>()
  for (const item of list) byKey.set(`${String(item.source)}|${String(item.name)}`, item)
  return list.map((item) => {
    const copy = item._copy
    if (!isObj(copy)) return item
    const base = byKey.get(`${String(copy.source)}|${String(copy.name)}`)
    if (!base) return item
    const { _copy, _mod, ...own } = item
    const inherited = Object.fromEntries(Object.entries(base).filter(([key]) => key !== '_versions'))
    const merged = { ...inherited, ...own }
    delete merged.srd
    delete merged.basicRules
    if (own.srd !== undefined) merged.srd = own.srd
    if (own.basicRules !== undefined) merged.basicRules = own.basicRules
    const mod = isObj(_mod) ? _mod : isObj(copy._mod) ? copy._mod : undefined
    if (mod) return applyMods(merged, mod, sink)
    return merged
  })
}

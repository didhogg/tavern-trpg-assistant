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

const SKILL_ABILITY: Record<string, string> = {
  acrobatics: 'dex', 'animal-handling': 'wis', arcana: 'int', athletics: 'str', deception: 'cha', history: 'int', insight: 'wis', intimidation: 'cha', investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis', performance: 'cha', persuasion: 'cha', religion: 'int', 'sleight-of-hand': 'dex', stealth: 'dex', survival: 'wis',
}
const abilityMod = (score: unknown): number => Math.floor((Number(score ?? 10) - 10) / 2)
const crPb = (cr: unknown): number => {
  const n = typeof cr === 'number' ? cr : Number(String(cr ?? 0).split('/')[0]) / (String(cr ?? '').includes('/') ? Number(String(cr).split('/')[1]) : 1)
  if (!Number.isFinite(n)) return 2
  if (n <= 4) return 2
  if (n <= 8) return 3
  if (n <= 12) return 4
  if (n <= 16) return 5
  if (n <= 20) return 6
  if (n <= 24) return 7
  if (n <= 28) return 8
  return 9
}
const deepEqual = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b)
const asItems = (v: unknown): unknown[] => Array.isArray(v) ? v : v === undefined ? [] : [v]

function addSkills(copyTo: Raw, mod: Raw): void {
  const skills = isObj(mod.skills) ? mod.skills : {}
  const target = isObj(copyTo.skill) ? copyTo.skill : {}
  for (const [skill, mode] of Object.entries(skills)) {
    const ability = SKILL_ABILITY[skill] ?? 'int'
    const total = Number(mode) * crPb(copyTo.cr) + abilityMod(copyTo[ability])
    const text = total >= 0 ? `+${total}` : String(total)
    const old = Number(target[skill])
    if (!(skill in target) || old < total) target[skill] = text
  }
  copyTo.skill = target
}

function addSpells(copyTo: Raw, mod: Raw): void {
  const list = Array.isArray(copyTo.spellcasting) ? copyTo.spellcasting : []
  const sc = (mod.name ? list.find((x) => isObj(x) && x.name === mod.name) : list[0]) as Raw | undefined
  if (!sc) throw new Error('addSpells: 没有 spellcasting')
  if (isObj(mod.spells)) {
    const spells = isObj(sc.spells) ? sc.spells as Raw : {}
    for (const [level, value] of Object.entries(mod.spells)) {
      if (!isObj(spells[level])) spells[level] = value
      else {
        const old = spells[level] as Raw
        for (const [k, v] of Object.entries(value as Raw)) {
          if (!(k in old)) old[k] = v
          else if (Array.isArray(old[k])) old[k] = [...(old[k] as unknown[]), ...asItems(v)].sort((a, b) => String(a).localeCompare(String(b)))
          else old[k] = v
        }
      }
    }
    sc.spells = spells
  }
  for (const prop of ['constant', 'will', 'ritual']) if (Array.isArray(mod[prop])) sc[prop] = [...(Array.isArray(sc[prop]) ? sc[prop] as unknown[] : []), ...(mod[prop] as unknown[])]
  for (const prop of ['recharge', 'legendary', 'charges', 'rest', 'restLong', 'daily', 'weekly', 'monthly', 'yearly']) {
    if (!isObj(mod[prop])) continue
    const target = isObj(sc[prop]) ? sc[prop] as Raw : {}
    for (const [k, v] of Object.entries(mod[prop] as Raw)) target[k] = [...(Array.isArray(target[k]) ? target[k] as unknown[] : []), ...asItems(v)]
    sc[prop] = target
  }
}

function replaceSpells(copyTo: Raw, mod: Raw): void {
  const list = Array.isArray(copyTo.spellcasting) ? copyTo.spellcasting : []
  const sc = list[0] as Raw | undefined
  if (!sc) throw new Error('replaceSpells: 没有 spellcasting')
  const replace = (cur: unknown, meta: Raw): void => {
    if (!Array.isArray(cur)) return
    const ix = cur.indexOf(meta.replace)
    if (ix >= 0) cur.splice(ix, 1, ...asItems(meta.with))
    else throw new Error(`replaceSpells: 找不到 ${String(meta.replace)}`)
  }
  if (isObj(mod.spells) && isObj(sc.spells)) {
    for (const [k, metas] of Object.entries(mod.spells as Raw)) {
      const cat = (sc.spells as Raw)[k]
      if (!isObj(cat) || !Array.isArray(cat.spells)) continue
      for (const meta of asItems(metas)) if (isObj(meta)) replace(cat.spells, meta)
      cat.spells.sort((a, b) => String(a).localeCompare(String(b)))
    }
  }
  if (isObj(mod.daily) && isObj(sc.daily)) {
    for (const [k, metas] of Object.entries(mod.daily as Raw)) for (const meta of asItems(metas)) if (isObj(meta)) replace((sc.daily as Raw)[k], meta)
  }
}

function removeSpells(copyTo: Raw, mod: Raw): void {
  const list = Array.isArray(copyTo.spellcasting) ? copyTo.spellcasting : []
  const sc = list[0] as Raw | undefined
  if (!sc) throw new Error('removeSpells: 没有 spellcasting')
  if (isObj(mod.spells) && isObj(sc.spells)) {
    for (const [k, names] of Object.entries(mod.spells as Raw)) {
      const cat = (sc.spells as Raw)[k]
      if (isObj(cat) && Array.isArray(cat.spells)) cat.spells = cat.spells.filter((x) => !asItems(names).includes(x))
    }
  }
  for (const prop of ['constant', 'will', 'ritual']) if (Array.isArray(sc[prop]) && Array.isArray(mod[prop])) sc[prop] = (sc[prop] as unknown[]).filter((x) => !(mod[prop] as unknown[]).includes(x))
  for (const prop of ['recharge', 'legendary', 'charges', 'rest', 'restLong', 'daily', 'weekly', 'monthly', 'yearly']) {
    if (!isObj(mod[prop]) || !isObj(sc[prop])) continue
    for (const [k, names] of Object.entries(mod[prop] as Raw)) {
      const cur = (sc[prop] as Raw)[k]
      if (Array.isArray(cur)) (sc[prop] as Raw)[k] = cur.filter((x) => !asItems(names).includes(x))
    }
  }
}

function setPath(obj: Raw, path: string, value: unknown): void {
  const parts = path.split('.')
  let cur: Raw = obj
  for (const part of parts.slice(0, -1)) { if (!isObj(cur[part])) cur[part] = {}; cur = cur[part] as Raw }
  cur[parts.at(-1)!] = value
}

function wholeMod(copyTo: Raw, mod: Raw): void {
  switch (mod.mode) {
    case 'addSkills': return addSkills(copyTo, mod)
    case 'addSpells': return addSpells(copyTo, mod)
    case 'replaceSpells': return replaceSpells(copyTo, mod)
    case 'removeSpells': return removeSpells(copyTo, mod)
    default: throw new Error(`未知整条模式 ${String(mod.mode)}`)
  }
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
  if (mode === 'appendIfNotExistsArr') {
    const base = Array.isArray(value) ? [...value] : []
    for (const item of asItems(mod.items)) if (!base.some((x) => deepEqual(x, item))) base.push(item)
    return base
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
    } else if (['addSkills', 'addSpells', 'replaceSpells', 'removeSpells'].includes(operation.mode)) {
      wholeMod(out, operation)
    } else {
      unsupported(base, operation.mode, '*', sink)
    }
  }
  for (const [key, value] of Object.entries(mod)) {
    if (key === '*') continue
    if (key === 'images') continue
    if (key === '_' && Array.isArray(value)) { for (const op of value) if (isObj(op) && typeof op.mode === 'string') { if (op.mode === 'setProp' && typeof op.prop === 'string') setPath(out, op.prop, op.value); else wholeMod(out, op) } continue }
    if (key === '_' && isObj(value) && typeof value.mode === 'string') { wholeMod(out, value); continue }
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

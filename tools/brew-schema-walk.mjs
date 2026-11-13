// 读作者的自制结构定义（vendor/brew-schema/schema）并往下拆：给字段表（build-brew-fields.mjs）用。
// - resolve：$ref 按作者文件的 $id + 标准 JSON 指针取（不用 ajv.getSchema 取片段：它会顺着片段里的 $ref 跳到别的文件，基准对不上）。
// - shapeOf（P5.5 阶段 C）：一个字段该画成什么控件。规则只看结构定义的写法，不按类别、不按字段名：
//     有可选值 → select；是非 → switch；数字 → number；文字 → text；指向作者正文结构（entry.json）→ entries；
//     数组 → list（每项再拆；每项是可选值 → multiselect）；有 properties 的对象 → group；键随意、值同一种的对象 → map；
//     几种写法任选（anyOf / oneOf，去掉只为「删掉这个字段」的 null）→ pick（有共同的可选值字段就按它分，没有就按写法分）；
//     递归、太深、键值都随意的对象 → json（表单里提示「在 JSON 里改」）。作者给了建议值（examples）的文字带 suggest。
//   同一个 $ref 只拆一次，放在 defs 里，字段里用 { ref } 指过去。
// - internalOf：指向作者 Foundry / Roll20 / Plutonium 专用结构文件的字段，用户用不上（表单不显示）。
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const pointer = (doc, ptr) => ptr.split('/').slice(1).reduce((n, seg) => n?.[seg.replace(/~1/g, '/').replace(/~0/g, '~')], doc)

async function listJson(base) {
  const out = []
  for (const name of await readdir(base)) {
    const p = join(base, name)
    if ((await stat(p)).isDirectory()) out.push(...(await listJson(p)))
    else if (name.endsWith('.json')) out.push(p)
  }
  return out.sort()
}

/** 只给 Foundry / Roll20 / Plutonium 用的结构文件（作者分文件放的，按文件名认）。 */
const INTERNAL_FILE = /(^|\/)(util-foundry|foundry[^/]*|roll20[^/]*)\.json$|^https?:/

export async function loadSchemas(dir) {
  const schemaDir = join(dir, 'schema')
  const source = JSON.parse(await readFile(join(dir, 'SOURCE.json'), 'utf8'))
  const files = new Map()
  const idOf = new Map()
  const keyOfId = new Map()
  for (const file of await listJson(schemaDir)) {
    const schema = JSON.parse(await readFile(file, 'utf8'))
    const key = relative(schemaDir, file).replace(/\\/g, '/')
    files.set(key, schema)
    idOf.set(key, schema.$id ?? key)
    if (schema.$id && !keyOfId.has(schema.$id)) keyOfId.set(schema.$id, key)
  }
  files.set(source.remote, JSON.parse(await readFile(join(dir, 'remote/plutonium-scenes-shared.json'), 'utf8')))

  /** 节点 + 它所在结构文件。返回最终节点、所在文件、一路经过的 $ref（文件#指针）。 */
  function resolve(node, base) {
    let cur = node
    let at = base
    const refs = []
    for (let hop = 0; cur?.$ref && hop < 30; hop++) {
      const ref = cur.$ref
      let file
      let ptr
      if (/^https?:/.test(ref)) { const [u, h = ''] = ref.split('#'); file = u; ptr = h }
      else {
        const abs = new URL(ref, `x:/${idOf.get(at) ?? at}`)
        const named = decodeURIComponent(abs.pathname.slice(1))
        file = files.has(named) ? named : keyOfId.get(named) ?? named
        ptr = decodeURIComponent(abs.hash.slice(1))
      }
      const doc = files.get(file)
      const got = doc && (ptr ? pointer(doc, ptr) : doc)
      if (!got) throw new Error(`取不到 ${file}#${ptr}（从 ${at} 的 ${ref}）`)
      refs.push(`${file}#${ptr}`)
      cur = got
      at = file
    }
    return { node: cur ?? {}, base: at, refs }
  }

  /** 节点的几个分支（anyOf / oneOf / allOf）展开成一组带 properties 的对象节点。 */
  function branches(node, base, seen = new Set()) {
    const r = resolve(node, base)
    if (!r.node || typeof r.node !== 'object' || seen.has(r.node)) return []
    seen.add(r.node)
    const kids = [...(r.node.anyOf ?? []), ...(r.node.oneOf ?? []), ...(r.node.allOf ?? [])]
    const own = r.node.properties ? [r] : []
    return [...own, ...kids.flatMap((k) => branches(k, r.base, seen))]
  }

  const internalOf = (node, base) => resolve(node, base).refs.some((x) => INTERNAL_FILE.test(x.split('#')[0]))

  const isNull = (n) => n.type === 'null' || (Array.isArray(n.type) && n.type.length === 1 && n.type[0] === 'null')
  const SIMPLE = new Set(['text', 'number', 'switch', 'select', 'const'])
  const MAX_DEPTH = 8

  /** 控件种类（见文件头）。defs：同一个 $ref 只拆一次。 */
  function shapeOf(node, base, defs, stack = [], depth = 0) {
    const r = resolve(node, base)
    const n = r.node
    if (r.refs.some((x) => /^entry\.json#/.test(x))) return { c: 'entries' }
    const key = r.refs.at(-1)
    if (key && stack.includes(key)) return { c: 'json', why: 'recursive' }
    if (depth > MAX_DEPTH) return { c: 'json', why: 'deep' }
    if (key && defs.has(key)) return { ref: key }
    const st = key ? [...stack, key] : stack
    const made = make(n, r.base, defs, st, depth)
    if (n.description && !made.description) made.description = n.description
    if (!key || made.c === 'json' || SIMPLE.has(made.c)) return made
    defs.set(key, made)
    return { ref: key }
  }

  function make(n, base, defs, st, depth) {
    if (n.const !== undefined) return { c: 'const', value: n.const }
    if (Array.isArray(n.enum)) return { c: 'select', enum: n.enum }
    const alts = [...(n.anyOf ?? []), ...(n.oneOf ?? [])].filter((a) => !isNull(resolve(a, base).node))
    if (alts.length === 1 && !n.properties) return shapeOf(alts[0], base, defs, st, depth + 1)
    if (alts.length && !n.properties) return pick(alts, base, defs, st, depth)
    if (n.allOf && !n.properties) return group(branches(n, base), defs, st, depth)
    const t = (Array.isArray(n.type) ? n.type : [n.type]).filter((x) => x && x !== 'null')
    if (!t.length && n.properties) t.push('object')
    if (t.length > 1) return t.every((x) => ['string', 'integer', 'number', 'boolean'].includes(x)) ? { c: 'text' } : { c: 'json', why: 'many-types' }
    switch (t[0]) {
      // 没有固定可选值、但作者给了建议值（examples）的文字：表单里可从建议值选，也能自己填
      case 'string': return Array.isArray(n.examples) && n.examples.length ? { c: 'text', suggest: n.examples } : { c: 'text' }
      case 'integer': case 'number': return { c: 'number', integer: t[0] === 'integer' }
      case 'boolean': return { c: 'switch' }
      case 'array': {
        if (!n.items) return { c: 'list', of: { c: 'text' } }
        const of = shapeOf(n.items, base, defs, st, depth + 1)
        if (of.c === 'json') return of
        return of.c === 'select' ? { c: 'multiselect', enum: of.enum } : { c: 'list', of }
      }
      case 'object': {
        if (n.properties) return group([{ node: n, base }], defs, st, depth)
        const ap = typeof n.additionalProperties === 'object' ? n.additionalProperties : Object.values(n.patternProperties ?? {})[0]
        if (ap && typeof ap === 'object') { const of = shapeOf(ap, base, defs, st, depth + 1); return of.c === 'json' ? of : { c: 'map', of } }
        return { c: 'json', why: 'free-object' }
      }
      default: return { c: 'json', why: 'untyped' }
    }
  }

  function group(parts, defs, st, depth) {
    const required = new Set(parts.flatMap((p) => p.node.required ?? []))
    const props = []
    const seen = new Set()
    for (const p of parts) {
      for (const [name, child] of Object.entries(p.node.properties ?? {})) {
        if (seen.has(name)) continue
        seen.add(name)
        if (name.startsWith('_') || internalOf(child, p.base)) continue
        const shape = shapeOf(child, p.base, defs, st, depth + 1)
        if (shape.c === 'json' && shape.why !== 'free-object' && !required.has(name)) props.push({ name, required: false, shape })
        else props.push({ name, required: required.has(name), shape })
      }
    }
    const bad = props.find((p) => p.required && p.shape.c === 'json')
    return bad ? { c: 'json', why: `part:${bad.name}` } : { c: 'group', props }
  }

  function pick(alts, base, defs, st, depth) {
    const shapes = alts.map((a) => shapeOf(a, base, defs, st, depth + 1))
    if (shapes.every((s) => SIMPLE.has(s.c))) {
      const enums = shapes.flatMap((s) => (s.c === 'select' ? s.enum : s.c === 'const' ? [s.value] : []))
      if (shapes.every((s) => s.c === 'select' || s.c === 'const')) return { c: 'select', enum: enums }
      return shapes.some((s) => s.c === 'text') ? { c: 'text' } : shapes.find((s) => s.c === 'number') ?? { c: 'text' }
    }
    const bad = shapes.find((s) => s.c === 'json')
    if (bad) return bad
    // 几个对象写法：找一个各写法都用 const / enum 写死的共同字段，按它分（例：type）
    const objs = alts.map((a) => resolve(a, base).node)
    const by = objs.every((o) => o.properties)
      ? Object.keys(objs[0].properties).find((k) => objs.every((o) => { const p = o.properties[k] && resolve(o.properties[k], base).node; return p && (p.const !== undefined || Array.isArray(p.enum)) }))
      : undefined
    return { c: 'pick', ...(by ? { by } : {}), branches: shapes.map((shape, i) => ({ shape, keys: objs[i].required ?? Object.keys(objs[i].properties ?? {}) })) }
  }

  return { files, source, resolve, branches, internalOf, shapeOf }
}

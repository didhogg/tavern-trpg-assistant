// P5.5 B4 字段说明表：从作者的自制结构定义（vendor/brew-schema/schema）生成每一类条目的顶层字段说明，
// 输出 vendor/brew-schema/fields.js（提交进仓库；插件第一次要用时按网址加载，和 validator.js 同一个办法）。
// 不定义数据形状、不写死类别：类别 = 结构定义根部 homebrew.json 的 properties（去掉 _ 开头的外壳），
// 字段 = 那一类条目"完整写法"那一支（不是 _copy 那一支）的 properties；$ref 按作者文件的 $id 和标准 JSON 指针取。
// 说明只取作者原文（description），不翻译。只在作者结构定义换版本后重跑：npm run gen:brew-validator。
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dir = join(root, 'vendor/brew-schema')
const schemaDir = join(dir, 'schema')
const source = JSON.parse(await readFile(join(dir, 'SOURCE.json'), 'utf8'))

async function listJson(base) {
  const out = []
  for (const name of await readdir(base)) {
    const p = join(base, name)
    if ((await stat(p)).isDirectory()) out.push(...(await listJson(p)))
    else if (name.endsWith('.json')) out.push(p)
  }
  return out.sort()
}

// 读作者结构文件（按路径）；文件自带 $id（例：class/fluff-class.json 的 $id 是 fluff-class.json），文件内相对 $ref 按 $id 解析，
// 取结构时把 $id 换回路径。$ref 的井号后面是标准 JSON 指针（RFC 6901），按段取即可。
// 不用 ajv.getSchema 取片段：它会顺着片段里的 $ref 继续跳到别的文件，基准就对不上了。
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

const pointer = (doc, ptr) => ptr.split('/').slice(1).reduce((n, seg) => n?.[seg.replace(/~1/g, '/').replace(/~0/g, '~')], doc)

/** 节点 + 它所在结构文件（路径）。$ref 按那个文件的 $id 解析，再取对应文件里的片段。 */
function resolve(node, base) {
  let cur = node
  let at = base
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
    cur = got
    at = file
  }
  return { node: cur, base: at }
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

const typesOf = (node, base) => {
  const out = new Set()
  for (const b of [resolve(node, base), ...branches(node, base).filter((x) => !x.node.properties)]) {
    const t = b.node?.type
    if (Array.isArray(t)) t.forEach((x) => out.add(x))
    else if (t) out.add(t)
    for (const k of [...(b.node?.anyOf ?? []), ...(b.node?.oneOf ?? [])]) {
      const kt = resolve(k, b.base).node?.type
      if (Array.isArray(kt)) kt.forEach((x) => out.add(x))
      else if (kt) out.add(kt)
    }
  }
  return [...out].sort()
}

function fieldOf(name, node, base, required) {
  const r = resolve(node, base)
  const n = r.node ?? {}
  const f = { name, types: typesOf(node, base), required }
  if (Array.isArray(n.enum)) f.enum = n.enum
  else if (n.type === 'array' && n.items) {
    const it = resolve(n.items, r.base).node
    if (Array.isArray(it?.enum)) f.itemEnum = it.enum
    f.itemTypes = typesOf(n.items, r.base)
  }
  const desc = node.description ?? n.description
  if (desc) f.description = desc
  return f
}

const rootId = 'homebrew.json'
const rootSchema = files.get(rootId)
const props = {}
for (const prop of Object.keys(rootSchema.properties).filter((k) => !k.startsWith('_') && !k.startsWith('$')).sort()) {
  const list = resolve(rootSchema.properties[prop], rootId)
  const item = list.node?.type === 'array' && list.node.items ? { node: list.node.items, base: list.base } : list
  const all = branches(item.node, item.base)
  // "完整写法"那一支：properties 里没有 _copy 的；都有 _copy（只能复制）就全用
  const full = all.filter((b) => !b.node.properties._copy)
  const use = full.length ? full : all
  const required = new Set(use.flatMap((b) => b.node.required ?? []))
  const fields = new Map()
  for (const b of use) for (const [name, node] of Object.entries(b.node.properties)) if (!fields.has(name)) fields.set(name, fieldOf(name, node, b.base, required.has(name)))
  props[prop] = { fields: [...fields.values()], edition: fields.has('edition') }
}

const out = { generatedFrom: `${source.package}@${source.version}`, props }
const header = `// 自动生成，不要手改。由 tools/build-brew-fields.mjs 从 vendor/brew-schema/schema（${source.package}@${source.version}，${source.license}）生成。\n`
await writeFile(join(dir, 'fields.js'), `${header}export default ${JSON.stringify(out)}\n`)
const n = Object.keys(props).length
console.log(`已生成 ${n} 类条目的字段说明（带条目级 edition 的：${Object.entries(props).filter(([, v]) => v.edition).map(([k]) => k).join('、')}）→ vendor/brew-schema/fields.js`)

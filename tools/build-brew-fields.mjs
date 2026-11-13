// P5.5 B4 字段说明表：从作者的自制结构定义（vendor/brew-schema/schema）生成每一类条目的顶层字段说明，
// 输出 vendor/brew-schema/fields.js（提交进仓库；插件第一次要用时按网址加载，和 validator.js 同一个办法）。
// 不定义数据形状、不写死类别：类别 = 结构定义根部 homebrew.json 的 properties（去掉 _ 开头的外壳），
// 字段 = 那一类条目"完整写法"那一支（不是 _copy 那一支）的 properties；$ref 按作者文件的 $id 和标准 JSON 指针取。
// 说明只取作者原文（description），不翻译。P5.5 阶段 C：每个字段带 shape（该画成什么控件，brew-schema-walk.mjs）和 internal（Foundry / Roll20 专用，不给用户看）。只在作者结构定义换版本后重跑：npm run gen:brew-validator。
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSchemas } from './brew-schema-walk.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const dir = join(root, 'vendor/brew-schema')
const { files, source, resolve, branches, internalOf, shapeOf } = await loadSchemas(dir)
/** 同一个 $ref 只拆一次（brew-schema-walk.mjs shapeOf）。 */
const defs = new Map()

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
  // 内部字段：指向作者 Foundry / Roll20 专用结构文件的；或按作者命名惯例以 _ / foundry 开头的（例 foundryAdvice 指向的是通用正文结构）
  if (/^(_|foundry)/.test(name) || internalOf(node, base)) f.internal = true
  else f.shape = shapeOf(node, base, defs)
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

const out = { generatedFrom: `${source.package}@${source.version}`, props, defs: Object.fromEntries(defs) }
const header = `// 自动生成，不要手改。由 tools/build-brew-fields.mjs 从 vendor/brew-schema/schema（${source.package}@${source.version}，${source.license}）生成。\n`
await writeFile(join(dir, 'fields.js'), `${header}export default ${JSON.stringify(out)}\n`)
const n = Object.keys(props).length
console.log(`已生成 ${n} 类条目的字段说明（带条目级 edition 的：${Object.entries(props).filter(([, v]) => v.edition).map(([k]) => k).join('、')}）→ vendor/brew-schema/fields.js`)

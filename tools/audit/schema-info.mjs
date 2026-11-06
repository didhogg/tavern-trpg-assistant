// 审计第 3、4 层要用的"作者结构定义"信息（D2-P2 B1 设计 §11）：只从作者 5etools-utils 的 schema 读，不写任何字段名单。
//   类别：每个结构定义文件的顶层属性里定义为数组的（数据文件对哪个结构定义文件，照作者 test/test-json.js 的规则，见 audit-layers34.ts）
//   字段：每一类单条记录的定义里出现的全部顶层字段（顺着 $ref、allOf、anyOf、oneOf、then、else 走）
//   解析标记：字段定义指向作者复制/版本定义 util-copy.json 的那些字段（例 _copy、_versions）
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const SKIP_TOP = new Set(['_meta', '_test', '$schema'])

export async function schemaInfo(siteDir) {
  const cache = new Map()
  const load = async (file) => {
    if (!cache.has(file)) cache.set(file, JSON.parse(await readFile(file, 'utf8')))
    return cache.get(file)
  }
  const resolve = async (file, ref) => {
    const [path, pointer = ''] = ref.split('#')
    const target = path ? join(dirname(file), path) : file
    let node = await load(target)
    for (const part of pointer.split('/').filter(Boolean)) node = node?.[part.replaceAll('~1', '/').replaceAll('~0', '~')]
    if (node === undefined) throw new Error(`schema 引用找不到：${ref}（在 ${file}）`)
    return { file: target, node }
  }

  /** 字段定义（顺着引用、数组元素、分支往下几层）是否落到作者复制/版本定义 util-copy.json。 */
  const touchesCopy = async (file, node, depth) => {
    if (!node || typeof node !== 'object' || depth > 4) return false
    if (typeof node.$ref === 'string') {
      const r = await resolve(file, node.$ref)
      if (r.file.endsWith('util-copy.json')) return true
      if (await touchesCopy(r.file, r.node, depth + 1)) return true
    }
    for (const sub of [node.items, ...(node.anyOf ?? []), ...(node.oneOf ?? []), ...(node.allOf ?? [])]) {
      if (await touchesCopy(file, sub, depth + 1)) return true
    }
    return false
  }

  /** 单条记录定义的全部顶层字段，以及指向 util-copy.json 的字段。 */
  const walkRecord = async (file, node, out, seen) => {
    if (!node || typeof node !== 'object') return
    if (node.$ref) {
      const key = `${file}#${node.$ref}`
      if (seen.has(key)) return
      seen.add(key)
      const r = await resolve(file, node.$ref)
      await walkRecord(r.file, r.node, out, seen)
    }
    for (const [name, def] of Object.entries(node.properties ?? {})) {
      out.fields.add(name)
      if (await touchesCopy(file, def, 0)) out.markers.add(name)
    }
    if (node.patternProperties) out.patterns.push(...Object.keys(node.patternProperties))
    if (node.additionalProperties !== undefined && node.additionalProperties !== false) out.open = true
    for (const k of ['allOf', 'anyOf', 'oneOf']) for (const sub of node[k] ?? []) await walkRecord(file, sub, out, seen)
    for (const k of ['then', 'else']) if (node[k]) await walkRecord(file, node[k], out, seen)
  }

  // 作者 test-json.js 校验的每个结构定义文件：顶层属性 = 这个文件里的类别
  const files = {}
  const byProp = {}
  for (const rel of await listJson(siteDir)) {
    const file = join(siteDir, rel)
    const json = await load(file)
    for (const [prop, def] of Object.entries(json.properties ?? {})) {
      if (SKIP_TOP.has(prop)) continue
      // 类别 → 数组定义 → 单条记录定义
      let arr = { file, node: def }
      while (arr.node.$ref) arr = await resolve(arr.file, arr.node.$ref)
      if (arr.node.type !== 'array') continue
      const out = { fields: new Set(), markers: new Set(), patterns: [], open: false }
      if (arr.node.items) await walkRecord(arr.file, arr.node.items, out, new Set())
      else out.open = true
      const info = { fields: [...out.fields].sort(), markers: [...out.markers].sort(), open: out.open || out.patterns.length > 0 }
      ;(files[rel] ??= {})[prop] = info
      const u = (byProp[prop] ??= { fields: [], markers: [], open: false })
      u.fields = [...new Set([...u.fields, ...info.fields])].sort()
      u.markers = [...new Set([...u.markers, ...info.markers])].sort()
      u.open ||= info.open
    }
  }
  const pkg = JSON.parse(await readFile(join(siteDir, '../../package.json'), 'utf8'))
  return { version: pkg.version, files, byProp }
}

async function listJson(dir, prefix = '') {
  const out = []
  for (const e of await readdir(join(dir, prefix), { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name
    if (e.isDirectory()) out.push(...await listJson(dir, rel))
    else if (e.name.endsWith('.json')) out.push(rel)
  }
  return out.sort()
}

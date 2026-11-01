/** JSON 指针（RFC 6901）读写：路径从「条目」根算起，如 /data/value、/data/effects/2、/name。 */
export type Json = unknown
type Container = Record<string, Json> | Json[]

export function parsePointer(path: string): string[] {
  if (!path.startsWith('/')) throw new Error(`路径必须以 / 开头：「${path}」`)
  return path.slice(1).split('/').map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'))
}

export function deepEqual(a: Json, b: Json): boolean {
  if (a === b) return true
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]))
  const ka = Object.keys(a as object)
  const kb = Object.keys(b as object)
  return ka.length === kb.length && ka.every((k) => k in (b as object) && deepEqual((a as Record<string, Json>)[k], (b as Record<string, Json>)[k]))
}

/** 走到指针的「父容器」，返回父容器与最后一段键。路径中途不存在 → 抛错（带卡住的位置）。 */
export function parentOf(root: Json, path: string): { parent: Container; key: string } {
  const keys = parsePointer(path)
  if (keys.length === 0) throw new Error('路径不能是根')
  let cur: Json = root
  for (const k of keys.slice(0, -1)) {
    if (cur === null || typeof cur !== 'object' || !(k in (cur as object))) throw new Error(`路径 ${path} 在「${k}」处断了`)
    cur = (cur as Record<string, Json>)[k]
  }
  if (cur === null || typeof cur !== 'object') throw new Error(`路径 ${path} 的父级不是对象或数组`)
  return { parent: cur as Container, key: keys[keys.length - 1] }
}

export function arrayIndex(parent: Container, key: string, path: string, allowEnd: boolean): number {
  if (!Array.isArray(parent)) throw new Error(`${path} 的父级不是数组`)
  if (!/^(0|[1-9]\d*)$/.test(key)) throw new Error(`${path} 的最后一段必须是数组下标`)
  const i = Number(key)
  if (i > parent.length || (!allowEnd && i === parent.length)) throw new Error(`${path} 越界（数组长度 ${parent.length}）`)
  return i
}

export function getAt(root: Json, path: string): Json {
  const { parent, key } = parentOf(root, path)
  if (Array.isArray(parent)) return parent[arrayIndex(parent, key, path, false)]
  if (!(key in parent)) throw new Error(`${path} 不存在`)
  return parent[key]
}

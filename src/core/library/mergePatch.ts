function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** JSON Merge Patch（RFC 7386）：null 删除键，对象递归合并，其余整体替换。不修改入参。 */
export function mergePatch(target: unknown, patch: unknown): unknown {
  if (!isObject(patch)) return structuredClone(patch)
  const base: Record<string, unknown> = isObject(target) ? { ...target } : {}
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete base[key]
    else base[key] = mergePatch(base[key], value)
  }
  return base
}

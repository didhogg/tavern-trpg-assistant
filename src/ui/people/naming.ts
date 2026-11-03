const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** 第一个不带号；之后「地精 2」「地精 3」；回收站里的名字也算，号不回收。 */
export function nextNames(baseName: string, existing: Iterable<string>, count: number): string[] {
  const base = baseName.trim()
  const names = new Set(existing)
  const pattern = new RegExp(`^${escape(base)} (\\d+)$`)
  let max = names.has(base) ? 1 : 0
  for (const name of names) {
    const hit = pattern.exec(name)
    if (hit) max = Math.max(max, Number(hit[1]))
  }
  const out: string[] = []
  for (let i = 0; i < Math.max(0, count); i++) {
    let n = max + 1
    let candidate = n === 1 ? base : `${base} ${n}`
    while (names.has(candidate)) {
      n += 1
      candidate = `${base} ${n}`
    }
    out.push(candidate)
    names.add(candidate)
    max = n
  }
  return out
}

/** 从名字反推续号；第一个不带号返回 undefined。 */
export function serialOfName(baseName: string, name: string): number | undefined {
  const hit = new RegExp(`^${escape(baseName.trim())} (\\d+)$`).exec(name)
  return hit ? Number(hit[1]) : undefined
}

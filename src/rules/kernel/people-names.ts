// 人物取名规则（从 people.ts 拆出，保持单文件行数上限）。
/**
 * 加人时的取名规则（复制、从模板加入共用）：base 是名字，count 是要几个，taken 是存档里现有人物的名字。
 *   没有同名、加 1 个 → 「地精」；没有同名、加 3 个 → 地精 1 / 2 / 3；
 *   已有「盖尔」再来 1 个 → 盖尔 2；已有「地精 1~3」再加 2 个 → 地精 4 / 5。
 */
export function nextNames(base: string, count: number, taken: string[]): string[] {
  const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: (\\d+))?$`)
  let max = 0
  let plain = false
  for (const name of taken) {
    const m = re.exec(name)
    if (!m) continue
    if (m[1]) max = Math.max(max, Number(m[1])); else plain = true
  }
  if (!plain && !max && count === 1) return [base]
  let n = Math.max(max, plain ? 1 : 0)
  return Array.from({ length: count }, () => `${base} ${++n}`)
}
/** 复制时的名字底：「地精 1」复制出来是「地精 4」不是「地精 1 2」。 */
export const baseName = (name: string): string => name.replace(/ \d+$/, '')


export const MAX_DICE_COUNT = 100
export const MAX_DICE_SIDES = 1000
export const MAX_TERMS = 20

export type DiceTerm =
  | { kind: 'dice'; count: number; sides: number; sign: 1 | -1 }
  | { kind: 'const'; value: number; sign: 1 | -1 }

export type ParseResult = { ok: true; terms: DiceTerm[] } | { ok: false; error: string }

const HINT = '例如 2d6+3、1d20+5、4d6'

/** 解析骰式：若干「XdY」或整数，用 + 或 - 连接；空格与大小写不敏感。 */
export function parseDice(input: string): ParseResult {
  const text = input.replace(/\s+/g, '').toLowerCase().replace(/＋/g, '+').replace(/－|−/g, '-')
  if (!text) return { ok: false, error: `请输入骰式，${HINT}` }
  const terms: DiceTerm[] = []
  const pattern = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/y
  let index = 0
  while (index < text.length) {
    pattern.lastIndex = index
    const m = pattern.exec(text)
    if (!m || (index > 0 && !(m[1] || m[4]))) return { ok: false, error: `骰式看不懂：「${input.trim()}」。${HINT}` }
    index = pattern.lastIndex
    if (m[3] !== undefined) {
      const sign = m[1] === '-' ? -1 : 1
      const count = m[2] === '' ? 1 : Number(m[2])
      const sides = Number(m[3])
      if (count < 1 || count > MAX_DICE_COUNT) return { ok: false, error: `一次最多掷 ${MAX_DICE_COUNT} 颗骰子` }
      if (sides < 2 || sides > MAX_DICE_SIDES) return { ok: false, error: `骰子面数要在 2 到 ${MAX_DICE_SIDES} 之间` }
      terms.push({ kind: 'dice', count, sides, sign })
    } else {
      const value = Number(m[5])
      if (!Number.isSafeInteger(value) || value > 100000) return { ok: false, error: '数字太大了' }
      terms.push({ kind: 'const', value, sign: m[4] === '-' ? -1 : 1 })
    }
    if (terms.length > MAX_TERMS) return { ok: false, error: `骰式最多 ${MAX_TERMS} 项` }
  }
  if (!terms.some((t) => t.kind === 'dice')) return { ok: false, error: `骰式里至少要有一组骰子，${HINT}` }
  return { ok: true, terms }
}

/** 规范写法：1d20+5、2d6-1。 */
export function termsToText(terms: DiceTerm[]): string {
  return terms
    .map((t, i) => {
      const sign = t.sign === -1 ? '-' : i === 0 ? '' : '+'
      return t.kind === 'dice' ? `${sign}${t.count}d${t.sides}` : `${sign}${t.value}`
    })
    .join('')
}

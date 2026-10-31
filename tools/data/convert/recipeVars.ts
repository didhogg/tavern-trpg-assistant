const VULGAR: Array<[number, string]> = [
  [0, ''],
  [0.125, '⅛'],
  [0.25, '¼'],
  [0.3333333333, '⅓'],
  [0.375, '⅜'],
  [0.5, '½'],
  [0.625, '⅝'],
  [0.6666666667, '⅔'],
  [0.75, '¾'],
  [0.875, '⅞'],
]

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function vulgar(value: number): string {
  const whole = Math.floor(value)
  const fraction = value - whole
  const match = VULGAR.find(([n]) => Math.abs(n - fraction) < 0.01)
  if (!match) return String(value)
  const mixed = whole ? `${whole}${match[1]}` : match[1]
  return mixed || '0'
}

function words(value: number): string {
  if (!Number.isInteger(value)) return String(value)
  if (value < 20) return WORDS[value]
  if (value < 100) {
    const ten = Math.floor(value / 10)
    const rest = value % 10
    return `${TENS[ten]}${rest ? `-${WORDS[rest]}` : ''}`
  }
  return String(value)
}

function title(value: string): string {
  return value.replace(/(^|[\s-])([a-z])/g, (_all, prefix: string, char: string) => `${prefix}${char.toUpperCase()}`)
}

function format(value: number, modifiers: string): string {
  let n = value
  for (const code of modifiers) {
    if (code === 'r') n = Math.round(n)
    else if (code === 'f') n = Math.floor(n)
    else if (code === 'c') n = Math.ceil(n)
  }
  let out = String(n)
  for (const code of modifiers) {
    if (code === 'v') out = vulgar(n)
    else if (code === 'x') out = words(n)
  }
  for (const code of modifiers) {
    if (code === 'l') out = out.toLowerCase()
    else if (code === 't') out = title(out)
    else if (code === 'u') out = out.toUpperCase()
  }
  return out
}

export function recipeVars(raw: Record<string, unknown>): Record<string, string> {
  const source = JSON.stringify(raw)
  const vars: Record<string, string> = {}
  for (const match of source.matchAll(/\{=([^}]+)\}/g)) {
    const key = match[1]
    const slash = key.indexOf('/')
    const amountKey = slash < 0 ? key : key.slice(0, slash)
    const modifiers = slash < 0 ? '' : key.slice(slash + 1)
    const value = raw[amountKey]
    if (typeof value !== 'number') continue
    if (!/^amount[1-5]$/.test(amountKey)) throw new Error(`未登记的配方占位：${key}`)
    if (/[^rfcvxltu]/.test(modifiers)) throw new Error(`未登记的配方修饰符：${key}`)
    vars[key] = format(value, modifiers)
  }
  return vars
}

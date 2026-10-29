import { z } from 'zod'

export type FormulaAst =
  | { kind: 'number'; value: number }
  | { kind: 'variable'; name: string }
  | { kind: 'unary'; op: '+' | '-'; value: FormulaAst }
  | { kind: 'binary'; op: '+' | '-' | '*' | '/'; left: FormulaAst; right: FormulaAst }
  | { kind: 'call'; name: 'floor' | 'ceil' | 'min' | 'max'; args: FormulaAst[] }

export interface FormulaError {
  message: string
  position: number
}

export type FormulaResult = { ok: true; ast: FormulaAst } | { ok: false; error: FormulaError }

export interface FormulaContext {
  level?: number
  prof?: number
  cr?: number
  classLevels?: Record<string, number>
  abilityMods?: Partial<Record<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', number>>
  scales?: Record<string, number>
}

class FormulaFailure extends Error {
  constructor(message: string, readonly position: number) {
    super(message)
  }
}

const IDENT = /[A-Za-z_][A-Za-z0-9_.-]*/y

function tokenize(input: string): Array<{ type: string; text: string; position: number }> {
  const out: Array<{ type: string; text: string; position: number }> = []
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (/\s/.test(ch)) { i++; continue }
    if (/[0-9.]/.test(ch)) {
      const match = /^(?:\d+(?:\.\d+)?|\.\d+)/.exec(input.slice(i))
      if (!match) throw new FormulaFailure('数字写法不正确', i)
      out.push({ type: 'number', text: match[0], position: i })
      i += match[0].length
      continue
    }
    if (/[A-Za-z_]/.test(ch)) {
      IDENT.lastIndex = i
      const match = IDENT.exec(input)
      if (!match) throw new FormulaFailure('变量名不完整', i)
      out.push({ type: 'ident', text: match[0], position: i })
      i += match[0].length
      continue
    }
    if ('+-*/(),'.includes(ch)) { out.push({ type: ch, text: ch, position: i }); i++; continue }
    throw new FormulaFailure(`不认识的字符「${ch}」`, i)
  }
  out.push({ type: 'eof', text: '', position: input.length })
  return out
}

function parseTokens(tokens: Array<{ type: string; text: string; position: number }>): FormulaAst {
  let at = 0
  const peek = () => tokens[at]
  const next = () => tokens[at++]
  const expect = (type: string) => {
    const token = next()
    if (token.type !== type) throw new FormulaFailure(`这里需要「${type}」`, token.position)
    return token
  }

  const primary = (): FormulaAst => {
    const token = next()
    if (token.type === 'number') return { kind: 'number', value: Number(token.text) }
    if (token.type === 'ident') {
      if (peek().type !== '(') return { kind: 'variable', name: token.text }
      const fn = token.text
      if (!['floor', 'ceil', 'min', 'max'].includes(fn)) throw new FormulaFailure(`不支持的函数「${fn}」`, token.position)
      next()
      const args: FormulaAst[] = []
      if (peek().type !== ')') {
        args.push(expression())
        while (peek().type === ',') { next(); args.push(expression()) }
      }
      expect(')')
      if ((fn === 'floor' || fn === 'ceil') && args.length !== 1) throw new FormulaFailure(`${fn} 只接受一个参数`, token.position)
      if ((fn === 'min' || fn === 'max') && args.length < 1) throw new FormulaFailure(`${fn} 至少接受一个参数`, token.position)
      return { kind: 'call', name: fn as 'floor' | 'ceil' | 'min' | 'max', args }
    }
    if (token.type === '(') {
      const value = expression()
      expect(')')
      return value
    }
    throw new FormulaFailure('这里需要一个数字、变量或括号', token.position)
  }

  const unary = (): FormulaAst => {
    if (peek().type === '+' || peek().type === '-') {
      const op = next().type as '+' | '-'
      return { kind: 'unary', op, value: unary() }
    }
    return primary()
  }

  const term = (): FormulaAst => {
    let left = unary()
    while (peek().type === '*' || peek().type === '/') {
      const op = next().type as '*' | '/'
      left = { kind: 'binary', op, left, right: unary() }
    }
    return left
  }

  const expression = (): FormulaAst => {
    let left = term()
    while (peek().type === '+' || peek().type === '-') {
      const op = next().type as '+' | '-'
      left = { kind: 'binary', op, left, right: term() }
    }
    return left
  }

  const ast = expression()
  if (peek().type !== 'eof') throw new FormulaFailure(`多余的内容「${peek().text}」`, peek().position)
  return ast
}

/** 解析失败时返回错误位置；成功时返回 AST。 */
export function parseFormula(input: string): FormulaResult {
  if (!input.trim()) return { ok: false, error: { message: '公式不能为空', position: 0 } }
  try {
    return { ok: true, ast: parseTokens(tokenize(input)) }
  } catch (error) {
    if (error instanceof FormulaFailure) return { ok: false, error: { message: error.message, position: error.position } }
    return { ok: false, error: { message: error instanceof Error ? error.message : String(error), position: 0 } }
  }
}

function variableValue(name: string, ctx: FormulaContext): number {
  if (name === 'level') return numberValue(name, ctx.level)
  if (name === 'prof') return numberValue(name, ctx.prof)
  if (name === 'cr') return numberValue(name, ctx.cr)
  if (/^(str|dex|con|int|wis|cha)\.mod$/.test(name)) {
    const key = name.slice(0, 3) as 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
    return numberValue(name, ctx.abilityMods?.[key])
  }
  if (name.startsWith('scale.')) return numberValue(name, ctx.scales?.[name.slice(6)])
  if (name.startsWith('class.') && name.endsWith('.level')) {
    const id = name.slice(6, -6)
    return numberValue(name, ctx.classLevels?.[id] ?? ctx.classLevels?.[id.replace(/^class\./, '')])
  }
  throw new Error(`未知变量「${name}」`)
}

function numberValue(name: string, value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) throw new Error(`变量「${name}」没有值`)
  return value
}

export function evalFormula(ast: FormulaAst, ctx: FormulaContext = {}): number {
  switch (ast.kind) {
    case 'number': return ast.value
    case 'variable': return variableValue(ast.name, ctx)
    case 'unary': return ast.op === '-' ? -evalFormula(ast.value, ctx) : evalFormula(ast.value, ctx)
    case 'binary': {
      const left = evalFormula(ast.left, ctx)
      const right = evalFormula(ast.right, ctx)
      if (ast.op === '+') return left + right
      if (ast.op === '-') return left - right
      if (ast.op === '*') return left * right
      if (right === 0) throw new Error('公式除以零')
      return left / right
    }
    case 'call': {
      const values = ast.args.map((arg) => evalFormula(arg, ctx))
      if (ast.name === 'floor') return Math.floor(values[0])
      if (ast.name === 'ceil') return Math.ceil(values[0])
      if (ast.name === 'min') return Math.min(...values)
      return Math.max(...values)
    }
  }
}

/** 先解析再求值；公式不合法时抛出带位置的错误。 */
export function evaluateFormula(input: string, ctx: FormulaContext = {}): number {
  const parsed = parseFormula(input)
  if (!parsed.ok) throw new Error(`${parsed.error.message}（位置 ${parsed.error.position}）`)
  return evalFormula(parsed.ast, ctx)
}

export const formulaSchema = z.string().min(1).superRefine((value, ctx) => {
  const parsed = parseFormula(value)
  if (!parsed.ok) ctx.addIssue({ code: 'custom', message: `${parsed.error.message}（位置 ${parsed.error.position}）` })
})

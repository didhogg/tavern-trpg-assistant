import { LATIN_ALLOW } from '../../config/latinAllow'
import { LATIN_EXCEPTIONS } from '../../config/latinExceptions'
import { mapStrings } from '../walk'
import { loadTerms } from '../terms'
import type { Rule } from '../types'

export type LatinCase = 'replace' | 'annotate' | 'paren'
export interface LatinChange { id: string; path: string; kind: LatinCase; run: string; zh?: string; before: string; after: string }

const HAN = '\\u3400-\\u9fff'
const L = 'A-Za-zÀ-ÖØ-öø-ÿ'
const CONNECT = '(?:of|the|and|in|to|de|la|von|van)'
// 首字母大写的串：后接「若干连接词 + 首字母大写的词」；末尾的连接词不收
const CAP_RUN = `[A-ZÀ-ÖØ-Þ][${L}'’-]*(?:(?: ${CONNECT})* [A-ZÀ-ÖØ-Þ][${L}'’-]*)*`
// 首字母小写的串：英文原文的注释常是小写短语（polymorph、lich-queen of the githyanki），取到汉字或标点为止
const LOW_RUN = `[a-zß-öø-ÿ][${L}'’-]*(?: [${L}][${L}'’-]*)*`
const AFTER_HAN = new RegExp(`([${HAN}])(${CAP_RUN}|${LOW_RUN})`, 'g')
// 拉丁词紧挨在汉字前面（前面不是汉字/字母）：只处理机制类术语，如「Ki豁免DC」
const BEFORE_HAN = new RegExp(`(^|[^${L}${HAN}'’-])([${L}][${L}'’-]*)(?=[${HAN}])`, 'g')
// 标记（{{em:…}}、{{ref:…|…}}）后面紧跟的英文原文：取到汉字或标点为止
const GLOSS = new RegExp(`^([${L}][${L}'’-]*(?: [${L}][${L}'’-]*)*)(?=\\s*(?:[${HAN}]|[^${L}'’\\s-]|$))`)
const MARKUP = /\{\{[a-z]+:(?:[^|}]*\|)?([^}]*)\}\}/
const PROTECTED_RE = /(\{\{[^{}]*\}\}|<\$[^$]*\$>|https?:\/\/[^\s)）]+)/
const HAN_END = new RegExp(`[${HAN}]$`)

/** 本次构建里每一处改动的完整记录（写进 tools/data/out/clean.json，供报告抽样）。 */
export const latinLog: LatinChange[] = []

const skip = (run: string, id: string): boolean => {
  const first = run.split(' ')[0]
  return first.length < 3 || LATIN_ALLOW.has(first) || LATIN_ALLOW.has(run) || LATIN_EXCEPTIONS.has(`${id}|${run}`)
}

/** 决定怎么处理：机制类术语且前文没有同义中文 → 直接换成中文；其余 → 加全角括号。 */
function decide(run: string, precedingText: string): { kind: LatinCase; zh?: string; text: string } {
  const terms = loadTerms()
  const key = run.toLowerCase()
  const zh = terms.map.get(key)
  if (zh && terms.mechanical.has(key) && !precedingText.endsWith(zh)) return { kind: 'replace', zh, text: zh }
  return { kind: zh ? 'annotate' : 'paren', zh, text: `（${run}）` }
}

function fixPlain(plain: string, id: string, path: string): string {
  let out = plain.replace(AFTER_HAN, (whole, han: string, run: string, offset: number) => {
    if (skip(run, id)) return whole
    const d = decide(run, plain.slice(0, offset + 1))
    latinLog.push({ id, path, kind: d.kind, run, zh: d.zh, before: plain.slice(Math.max(0, offset - 10), offset + whole.length + 10), after: `${han}${d.text}` })
    return `${han}${d.text}`
  })
  const terms = loadTerms()
  out = out.replace(BEFORE_HAN, (whole, lead: string, word: string, offset: number) => {
    const key = word.toLowerCase()
    const zh = terms.map.get(key)
    if (!zh || !terms.mechanical.has(key) || word.length < 2 || LATIN_ALLOW.has(word) || out.slice(offset + whole.length).startsWith(zh) || out.slice(0, offset + lead.length).trimEnd().endsWith(zh)) return whole
    latinLog.push({ id, path, kind: 'replace', run: word, zh, before: out.slice(Math.max(0, offset - 10), offset + whole.length + 10), after: `${lead}${zh}` })
    return `${lead}${zh}`
  })
  return out
}

function glossAfterMarkup(plain: string, display: string, id: string, path: string): string {
  const match = GLOSS.exec(plain)
  if (!match) return plain
  const run = match[1].trimEnd()
  if (skip(run, id)) return plain
  const d = decide(run, display)
  latinLog.push({ id, path, kind: d.kind, run, zh: d.zh, before: `${display}${plain.slice(0, run.length + 6)}`, after: d.text })
  return `${d.text}${plain.slice(run.length)}`
}

/** 把文本切成标记与普通片段，逐段处理；标记后面紧跟英文时，把标记的显示文字当作「前面的汉字」。 */
function fixText(text: string, id: string, path: string): string {
  const parts = text.split(PROTECTED_RE)
  return parts.map((part, i) => {
    if (i % 2 === 1) return part
    let out = fixPlain(part, id, path)
    const prev = i > 0 ? MARKUP.exec(parts[i - 1])?.[1] ?? '' : ''
    if (prev && HAN_END.test(prev) && /^[A-Za-zÀ-ÿ]/.test(out)) out = glossAfterMarkup(out, prev, id, path)
    return out
  }).join('')
}

const QUICK = new RegExp(`[${HAN}][${L}]|[${L}][${HAN}]|\\}\\}[${L}]`)

/** 规则 4：汉字后紧跟的英文——机制类术语换成中文，其余加括号（词典里有同义词时也是加括号）。 */
export const latinRule: Rule = {
  id: 'R4-latin',
  title: '汉字后紧跟的英文（D1）',
  zhOnly: true,
  apply(entry, { record }) {
    const fix = (value: string, path: string): string | undefined => {
      if (!QUICK.test(value)) return undefined
      const next = fixText(value, entry.id, path)
      if (next === value) return undefined
      record(path, value, next)
      return next
    }
    return mapStrings(entry.data.text, (value, path) => fix(value, `text.${path}`))
  },
}

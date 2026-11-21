import ts from 'typescript'
import { checkPlaceholders, PLUGIN_UI, pluginUiRows } from './plugin-ui.mjs'

/** Same final/approved precedence as the language pack, using the exact author text at the display site. */
export function nativeTranslations(draft, approved) {
  const overrides = new Map(approved
    .filter((row) => row.lang === PLUGIN_UI.lang && row.package === PLUGIN_UI.package)
    .map((row) => [row.text, row.translation]))
  return new Map(pluginUiRows(draft)
    .filter((row) => row.status === 'final' || overrides.has(row.text))
    .map(({ text, translation }) => {
      const value = overrides.get(text) ?? translation
      checkPlaceholders(text, value)
      if (!value.trim()) throw new Error('Approved display text has an empty translation')
      return [text, value]
    }))
}

const hole = (index) => `\uE000${index}\uE001`
const holes = () => /\uE000(\d+)\uE001/g
const htmlEscape = (text) => text.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])
const isLiteral = (node) => ts.isStringLiteralLike(node) || ts.isTemplateExpression(node)

function memberName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) return node.text
  if (ts.isPropertyAccessExpression(node)) return node.name.text
  if (ts.isElementAccessExpression(node) && ts.isStringLiteralLike(node.argumentExpression)) return node.argumentExpression.text
}

function receiver(node) {
  return ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node) ? node.expression : undefined
}

// Contracts verified against the author bundle. An equally named property in another object is not evidence.
const elementFields = new Set(['html', 'txt', 'title', 'placeholder', 'tooltip'])
const dialogFields = new Set(['title', 'htmlDescription', 'textYes', 'textNo', 'buttonText'])
const dialogMethods = new Set(['pGetUserBoolean', 'pGetUserEnum', 'pGetUserString', 'pGetUserNumber'])
const notifications = new Set(['info', 'warn', 'error'])
const htmlFields = new Set(['html', 'htmlDescription'])

function isHtmlTag(tag) {
  const callee = ts.isCallExpression(tag) ? tag.expression : tag
  return ts.isIdentifier(callee) && callee.text === 'veT'
}

function displayMode(node) {
  const p = node.parent
  if (ts.isParenthesizedExpression(p)) return displayMode(p)
  if (ts.isConditionalExpression(p) && node !== p.condition) return displayMode(p)
  if (ts.isBinaryExpression(p) && node === p.right) {
    const op = p.operatorToken.kind
    if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) return displayMode(p)
    if (op === ts.SyntaxKind.EqualsToken) {
      const member = memberName(p.left)
      if (member === 'innerHTML' && receiver(p.left)) return 'html'
      if ((member === 'innerText' || member === 'textContent') && receiver(p.left)) return 'text'
    }
  }
  if (ts.isTaggedTemplateExpression(p) && p.template === node && isHtmlTag(p.tag)) return 'html'
  if (ts.isCallExpression(p) && p.arguments[0] === node) {
    const method = memberName(p.expression)
    const owner = receiver(p.expression)
    if (owner && memberName(owner) === 'vee') {
      if (method === 'txt' || method === 'tooltip') return 'text'
      if (method === 'html' || method === 'appends' || method === 'prepends') return 'html'
    }
    if (owner && memberName(owner) === 'notifications' && notifications.has(method)) return 'text'
  }
  if (!ts.isPropertyAssignment(p) || p.initializer !== node) return
  const key = memberName(p.name)
  const call = p.parent.parent
  if (!ts.isCallExpression(call) && !ts.isNewExpression(call)) return
  if (call.arguments?.[0] !== p.parent) return
  const method = memberName(call.expression)
  const owner = receiver(call.expression)
  if (ts.isIdentifier(call.expression) && method === 'veE' && elementFields.has(key)) return htmlFields.has(key) ? 'html' : 'text'
  if (owner && memberName(owner) === 'InputUiUtil' && dialogMethods.has(method) && dialogFields.has(key)) return htmlFields.has(key) ? 'html' : 'text'
  if (owner && memberName(owner) === 'UtilApplications' && method === 'pGetShowApplicationModal' && key === 'title') return 'text'
  if (owner && memberName(owner) === 'JqueryUtil' && method === 'doToast' && key === 'content') return 'text'
  if (ts.isNewExpression(call) && method === 'GenericButtonInfo' && key === 'text') return 'text'
}

// Read text and approved display attributes from HTML. Quoted data/class/value/href attributes and markup
// stay intact. Skip raw-text elements entirely (they may contain JavaScript, CSS, selectors, or templates).
function htmlSites(text) {
  if (!/^\s*<(?:[A-Za-z][\w:-]*(?=[\s/>])|!--)/.test(text)) return [{ start: 0, value: text }]
  if (/<\/?(?:script|style|template|textarea)(?=[\s/>])/i.test(text)) return []
  const sites = []
  const tag = /<!--[\s\S]*?-->|<\/?[A-Za-z][\w:-]*(?=[\s/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>/g
  let end = 0
  for (const match of text.matchAll(tag)) {
    sites.push({ start: end, value: text.slice(end, match.index) })
    end = match.index + match[0].length
    const name = /^<[A-Za-z][\w:-]*/.exec(match[0])
    if (!name) continue
    const attrs = match[0].slice(name[0].length)
    const attr = /\s+([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|[^\s>]+))?/gd
    for (const part of attrs.matchAll(attr)) {
      const quote = part[2] === undefined ? 3 : 2
      if (!/^(?:title|placeholder|aria-label|data-tooltip|data-title)$/i.test(part[1]) || part[quote] === undefined) continue
      sites.push({ start: match.index + name[0].length + part.indices[quote][0], value: part[quote] })
    }
  }
  sites.push({ start: end, value: text.slice(end) })
  return sites.filter(({ value }) => !value.includes('<'))
}

function literalParts(node) {
  return ts.isTemplateExpression(node) ? [node.head, ...node.templateSpans.map((span) => span.literal)] : [node]
}

function joinParts(parts) {
  return parts.reduce((text, part, index) => index === 0 ? part.text : text + hole(index - 1) + part.text, '')
}

function escapeJs(text, template, quote) {
  const encoded = JSON.stringify(text).slice(1, -1)
  if (template) return encoded.replaceAll('\\"', '"').replaceAll('`', '\\`').replaceAll('${', '\\${')
  return quote === "'" ? encoded.replaceAll('\\"', '"').replaceAll("'", "\\'") : encoded
}

/** Apply edits to fixed text only. Expressions inside ${…} are never moved, reprinted, or evaluated. */
export function localizePlutonium(sourceText, translations) {
  const source = ts.createSourceFile('Bundle.js', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  if (source.parseDiagnostics.length) throw new Error('Unable to parse the original Plutonium bundle')
  if (/\uE000\d+\uE001/.test(sourceText)) throw new Error('Bundle contains a reserved interpolation marker')
  const report = new Map([...translations.keys()].map((text) => [text, { text, translated: 0, retained: 0 }]))
  const edits = []
  const inlineDisplay = new Map()

  function visit(node) {
    if (isLiteral(node)) {
      const parts = literalParts(node)
      const text = joinParts(parts)
      const mode = displayMode(node) ?? inlineDisplay.get(node)
      const sites = mode === 'text' ? [{ start: 0, value: text }] : htmlSites(text)
      let localized = text
      for (const { start, value } of sites.toReversed()) {
        const shape = value.trim().replace(holes(), '{}')
        const row = report.get(shape)
        if (mode === 'html' && ts.isTemplateExpression(node) && /^\s*</.test(text)) {
          for (const [, index] of value.matchAll(holes())) markDisplayExpression(node.templateSpans[Number(index)].expression)
        }
        if (!row) continue
        if (!mode) { row.retained++; continue }
        const markers = [...value.matchAll(holes())]
        const translation = translations.get(shape)
        const replacement = (mode === 'html' ? htmlEscape(translation) : translation)
          .replace(/\{\}/g, () => markers.shift()[0])
        localized = localized.slice(0, start) + value.replace(value.trim(), () => replacement) + localized.slice(start + value.length)
        row.translated++
      }
      if (text !== localized) {
        const replacements = localized.split(holes()).filter((_, index) => index % 2 === 0)
        for (const [index, part] of parts.entries()) {
          if (part.text === replacements[index]) continue
          const start = part.getStart(source) + 1
          const end = part.end - (part.kind === ts.SyntaxKind.TemplateHead || part.kind === ts.SyntaxKind.TemplateMiddle ? 2 : 1)
          edits.push({ start, end, value: escapeJs(replacements[index], !ts.isStringLiteral(part), sourceText[start - 1]) })
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  // A literal selected inside a rendered HTML text slot is display content too. Never follow a condition
  // or a variable into shared data, and never follow interpolations inside non-display HTML attributes.
  function markDisplayExpression(node) {
    if (isLiteral(node)) inlineDisplay.set(node, 'html')
    else if (ts.isParenthesizedExpression(node)) markDisplayExpression(node.expression)
    else if (ts.isConditionalExpression(node)) {
      markDisplayExpression(node.whenTrue)
      markDisplayExpression(node.whenFalse)
    } else if (ts.isBinaryExpression(node) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(node.operatorToken.kind)) {
      markDisplayExpression(node.right)
    }
  }

  visit(source)
  // One pass over the original bytes, with disjoint edits even in nested templates.
  const chunks = []
  let end = 0
  for (const edit of edits.sort((a, b) => a.start - b.start)) {
    if (edit.start < end) throw new Error('Overlapping author display edits')
    chunks.push(sourceText.slice(end, edit.start), edit.value)
    end = edit.end
  }
  chunks.push(sourceText.slice(end))
  const bundle = chunks.join('')
  if (ts.createSourceFile('Bundle.zh.js', bundle, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS).parseDiagnostics.length) {
    throw new Error('Unable to parse the localized Plutonium bundle')
  }
  return { bundle, rows: [...report.values()], edits: edits.length }
}

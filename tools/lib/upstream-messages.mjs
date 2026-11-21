// 从锁定的作者程序与资料包提取显示字段。译文由现有社区文件、作者译名表和界面字底稿生成；
// 编号函数 upstreamKey 只在这里定义，底稿、生成器、单元测试共用。
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import ts from 'typescript'

/** 作者界面字的稳定编号：去首尾空白、转小写后的 sha256 前 24 位。底稿、生成器、单元测试共用。 */
export function upstreamKey(text) {
  return `TRPGAssistant.UpstreamText.${createHash('sha256').update(String(text).trim().toLowerCase()).digest('hex').slice(0, 24)}`
}

export async function upstreamMessages(foundry) {
  const messages = new Map()
  const add = (text, source) => {
    if (typeof text !== 'string' || !text.trim()) return
    const normalized = text.trim().toLowerCase()
    const row = messages.get(normalized) ?? {
      key: upstreamKey(normalized),
      text, origins: [],
    }
    row.origins.push(source)
    messages.set(normalized, row)
  }
  const packDir = join(foundry, 'packs')
  for (const file of (await readdir(packDir)).filter(file => file.endsWith('.json')).sort()) {
    const documents = JSON.parse(await readFile(join(packDir, file), 'utf8'))
    const walk = (node, path) => {
      if (!node || typeof node !== 'object') return
      for (const [key, value] of Object.entries(node)) {
        if (key === 'name' || key === 'title') add(value, `${file}:${path}.${key}`)
        else if (value && typeof value === 'object') walk(value, `${path}.${key}`)
      }
    }
    for (const document of documents) walk(document.system?.advancement, document._id + '.system.advancement')
  }
  const file = 'modules/plutonium/js/Bundle.js'
  const source = ts.createSourceFile(file, await readFile(join(foundry, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  const walk = node => {
    if (ts.isPropertyAssignment(node) && ['name', 'title', 'label', 'hint'].includes(node.name.getText(source).replace(/^['"]|['"]$/g, ''))
      && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))) {
      add(node.initializer.text, `${file}:${source.getLineAndCharacterOfPosition(node.pos).line + 1}`)
    }
    ts.forEachChild(node, walk)
  }
  walk(source)
  return [...messages.values()].sort((a, b) => a.key.localeCompare(b.key))
}

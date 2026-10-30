import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

function files(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...files(path))
    else if (entry.isFile() && /\.(ts|vue)$/.test(entry.name)) out.push(path)
  }
  return out
}

describe('文件行数上限', () => {
  it('src、tools、tests 中的 .ts/.vue 文件不超过 400 行', () => {
    const root = process.cwd()
    const over = [...files(join(root, 'src')), ...files(join(root, 'tools')), ...files(join(root, 'tests'))]
      .map((path) => ({ path: relative(root, path), lines: (readFileSync(path, 'utf8').match(/\n/g) ?? []).length }))
      .filter((x) => x.lines > 400)
    expect(over, over.map((x) => `${x.path} ${x.lines} 行`).join('\n')).toEqual([])
  })
})

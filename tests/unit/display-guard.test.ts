// 守卫：给界面的文字（Shown）只能由显示出口 src/rules/kernel/display.ts 做出来。
// 别处写 `as Shown` 就是绕过出口直接把字交给界面（英文漏到中文战役就是这么来的）；结算小窗只标来路，不能用显示出口。
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(__dirname, '../../src')
const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name)
  return statSync(path).isDirectory() ? files(path) : /\.(ts|vue)$/.test(name) ? [path] : []
})
const all = files(root).map((path) => ({ path: relative(root, path), text: readFileSync(path, 'utf8') }))

describe('显示出口守卫', () => {
  it('只有 display.ts 能把文字变成 Shown', () => {
    const bad = all.filter((f) => f.path !== 'rules/kernel/display.ts' && /as\s+Shown\b|<Shown>/.test(f.text)).map((f) => f.path)
    expect(bad).toEqual([])
  })
  it('结算小窗的代码不引用显示出口（小窗只标来路）', () => {
    const bad = all.filter((f) => f.path.startsWith('rules/kernel/frame/') && /from ['"]\.\.\/display['"]/.test(f.text)).map((f) => f.path)
    expect(bad).toEqual([])
  })
})

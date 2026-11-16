// npm run test:fast 的文件挑选：lint 只查项目 lint 范围（src/ tests/）内、还存在的改动文件。
import { describe, expect, it } from 'vitest'
import { lintTargets, parseArgs } from '../../tools/test-fast.mjs'

const present = (): boolean => true

describe('lintTargets', () => {
  it('只留 src/ 和 tests/ 下的代码文件；docs / vendor / tools / 配置 / 文档都不查（和 npm run lint 同范围）', () => {
    const files = ['src/a.ts', 'src/ui/B.vue', 'tests/unit/c.test.ts', 'tests/e2e/library/d.mjs', 'docs/design/x.mjs', 'vendor/foundry/y.js', 'tools/z.mjs', 'package.json', 'NEXT.md', 'src/readme.md', 'dist/index.js']
    expect(lintTargets(files, present)).toEqual(['src/a.ts', 'src/ui/B.vue', 'tests/e2e/library/d.mjs', 'tests/unit/c.test.ts'])
  })
  it('已经删掉的文件不查；重复的只留一个', () => {
    expect(lintTargets(['src/a.ts', 'src/a.ts', 'src/gone.ts'], (f) => f !== 'src/gone.ts')).toEqual(['src/a.ts'])
  })
  it('没有可查的文件 = 空', () => expect(lintTargets(['docs/a.md'], present)).toEqual([]))
})

describe('parseArgs', () => {
  it('默认比较未提交的改动；--since 取后面的提交号；缺提交号报错', () => {
    expect(parseArgs([])).toEqual({ since: null })
    expect(parseArgs(['--since', 'HEAD~2'])).toEqual({ since: 'HEAD~2' })
    expect(() => parseArgs(['--since'])).toThrow('提交号')
    expect(() => parseArgs(['--since', '--x'])).toThrow('提交号')
  })
})

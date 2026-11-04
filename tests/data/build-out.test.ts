import { describe, expect, it } from 'vitest'
import { outArg, resolveOutDir } from '../../tools/data/lib/outDir'

const forbidden = { 助手仓库: '/w/assistant', 数据仓库: '/w/data', 参考资料夹: '/w/ref' }

describe('构建试跑的 --out 开关', () => {
  it('两种写法都认；没写就是正常构建', () => {
    expect(outArg(['--out', '/tmp/a'])).toBe('/tmp/a')
    expect(outArg(['--out=/tmp/b', '--pack=x'])).toBe('/tmp/b')
    expect(outArg(['--pack=x'])).toBeUndefined()
  })
  it('输出目录不能在助手仓库、数据仓库、参考资料夹里面，也不能包含它们', () => {
    expect(() => resolveOutDir('/w/assistant/out', forbidden)).toThrow('助手仓库')
    expect(() => resolveOutDir('/w/data', forbidden)).toThrow('数据仓库')
    expect(() => resolveOutDir('/w/ref/x/y', forbidden)).toThrow('参考资料夹')
    expect(() => resolveOutDir('/w', forbidden)).toThrow()
    expect(() => resolveOutDir('', forbidden)).toThrow('--out')
  })
  it('仓库之外的目录通过（前缀相同的兄弟目录不算里面）', () => {
    expect(resolveOutDir('/tmp/trial', forbidden)).toBe('/tmp/trial')
    expect(resolveOutDir('/w/assistant-trial', forbidden)).toBe('/w/assistant-trial')
  })
})

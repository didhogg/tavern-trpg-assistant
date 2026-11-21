// 建卡专用小窗的插件主题（frame/display.ts）：插件设计变量从影子层 :host 换到整页 :root，亮色 / 深色都在。
// 单元测试环境不处理 ?inline 样式：按小窗实际用的同三份文件原文交给同一个函数。
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { frameTheme } from '../../src/rules/kernel/frame/display'

const read = (name: string) => readFileSync(new URL(`../../src/ui/styles/${name}`, import.meta.url), 'utf8')

describe('建卡小窗插件主题', () => {
  const css = frameTheme(['tokens.css', 'palette.css', 'build-frame.css', 'build-frame-controls.css'].map(read))
  it('设计变量挂在 :root，没有只对影子层有意义的写法', () => {
    expect(css).not.toMatch(/:host\b/)
    expect(css).not.toMatch(/all:\s*initial/)
    expect(css).toMatch(/:root\s*\{[^}]*--font-sans:/)
    expect(css).toMatch(/:root\s*\{[^}]*--primary:/)
  })
  it('深色跟随系统设置', () => {
    expect(css).toMatch(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{[^}]*--surface:/)
  })
  it('Foundry 自己的主题变量换成插件变量', () => {
    expect(css).toMatch(/--background:\s*var\(--surface\)/)
    expect(css).toMatch(/--color-text-primary:\s*var\(--text\)/)
  })
})

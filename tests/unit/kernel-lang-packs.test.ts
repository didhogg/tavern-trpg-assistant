// 结算小窗语言包：按战役资料集的语言登记进清单；没有这个语言的包 = 和以前一样的英文，换算钥匙也不变。
import { describe, expect, it } from 'vitest'
import { applyLangPack, readLangPacks, type LangPacks } from '../../src/rules/kernel/lang-packs'
import { kernelInput } from '../../src/rules/kernel/input'
import { kernelLangOf } from '../../src/rules/kernel/cache'

const packs: LangPacks = { packs: { zh: { name: '中文', hash: 'h1', files: [
  { package: 'system', id: 'dnd5e', path: 'lang/zh.json', sha256: 'a' },
  { package: 'module', id: 'plutonium', path: 'lang/zh.json', sha256: 'b' },
  { package: 'module', id: 'not-installed', path: 'lang/zh.json', sha256: 'c' },
] } } }

describe('applyLangPack', () => {
  it('有这个语言的包：登记进系统和已装模块的清单，回 zh.core 和摘要；没装的模块跳过', () => {
    const system = { id: 'dnd5e', languages: [{ lang: 'en', name: 'English', path: 'lang/en.json' }] }
    const modules = [{ id: 'plutonium' }, { id: 'lib-wrapper' }]
    const got = applyLangPack('zh', packs, system, modules)
    expect(got).toEqual({ language: 'zh.core', packHash: 'h1' })
    expect(system.languages.map((l) => l.lang)).toEqual(['en', 'zh'])
    expect((modules[0] as { languages?: unknown[] }).languages).toEqual([{ lang: 'zh', name: '中文', path: 'lang/zh.json', flags: {} }])
    expect((modules[1] as { languages?: unknown[] }).languages).toBeUndefined()
  })
  it('登记过的语言不重复登记；没有这个语言的包：清单不动、回 en.core、没有摘要', () => {
    const system = { id: 'dnd5e', languages: [{ lang: 'zh', name: 'x', path: 'p' }] }
    applyLangPack('zh', packs, system, [])
    expect(system.languages).toHaveLength(1)
    const other = { id: 'dnd5e', languages: [] as unknown[] }
    expect(applyLangPack('en', packs, other, [])).toEqual({ language: 'en.core' })
    expect(other.languages).toEqual([])
  })
  it('语言码取自小窗语言设置', () => expect(kernelLangOf('zh.core')).toBe('zh'))
})

const json = (body: unknown): Response => new Response(JSON.stringify(body), { status: 200 })
function fakeFetch(declaration: unknown | null): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const path = new URL(String(input)).pathname.replace(/^.*\/(vendor\/foundry\/|dist\/)/, '$1')
    if (path === 'vendor/foundry/manifest.json') return json({ release: { generation: 14, build: 365, channel: 'stable', node_version: 22 }, system: 'dnd5e 6.1.0', modules: { plutonium: '1' } })
    if (path === 'vendor/foundry/systems/dnd5e/system.json') return json({ id: 'dnd5e', languages: [{ lang: 'en', name: 'English', path: 'lang/en.json' }] })
    if (path === 'vendor/foundry/modules/plutonium/module.json') return json({ id: 'plutonium' })
    if (path === 'vendor/foundry/lang-packs.json') return declaration === null ? new Response('', { status: 404 }) : json(declaration)
    if (path === 'dist/kernel-frame.js') return new Response('frame', { status: 200 })
    return new Response('', { status: 404 })
  }) as typeof fetch
}
const root = new URL('http://localhost/')
const base = { pluginRoot: root, rule: 'dnd5e2014', world: { id: 'w', title: 't' } }

describe('kernelInput 的语言', () => {
  it('中文战役：登记中文包、小窗语言 zh；英文战役和不给资料集：en.core，钥匙和以前完全一样', async () => {
    const f = fakeFetch(packs)
    const cn = await kernelInput({ ...base, codeSet: 'cn', fetchImpl: f })
    const en = await kernelInput({ ...base, codeSet: 'en', fetchImpl: f })
    const none = await kernelInput({ ...base, fetchImpl: f })
    const without = await kernelInput({ ...base, codeSet: 'cn', fetchImpl: fakeFetch(null) })
    expect(cn.language).toBe('zh.core')
    expect((cn.system as { languages: Array<{ lang: string }> }).languages.map((l) => l.lang)).toContain('zh')
    expect(en.language).toBe('en.core')
    expect(en.cacheKey).toBe(none.cacheKey)
    expect(cn.cacheKey).not.toBe(en.cacheKey)
    // 没有语言包声明：中文战役退回英文，钥匙就是英文那一套（不是错误）
    expect(without.language).toBe('en.core')
    expect(without.cacheKey).toBe(en.cacheKey)
  })
  it('语言包内容变了（摘要变）→ 钥匙变', async () => {
    const a = await kernelInput({ ...base, codeSet: 'cn', fetchImpl: fakeFetch(packs) })
    const b = await kernelInput({ ...base, codeSet: 'cn', fetchImpl: fakeFetch({ packs: { zh: { ...packs.packs.zh, hash: 'h2' } } }) })
    expect(a.cacheKey).not.toBe(b.cacheKey)
  })
  it('声明文件读取失败（不是 404）照实报错，不静默当没有', async () => {
    const f = (async () => new Response('', { status: 500 })) as unknown as typeof fetch
    await expect(readLangPacks(root, f)).rejects.toThrow('500')
  })
})

import { describe, expect, it } from 'vitest'
import { brewNameOf, libraryBrews } from '../../../src/rules/kernel/brews'
import { kernelHandlers } from '../../../src/rules/kernel/host'
import { withLocalHomebrew } from '../../../src/rules/kernel/input'
import type { LibraryView } from '../../../src/library/revision'

const doc = (id: string, body: unknown) => ({ head: { docIdLocal: id, filename: `${id}.orig.json` }, body })
const viewOf = (store: Record<string, unknown>) => ({ kvGet: async (codeSet: string, key: string) => store[`${codeSet}|${key}`] ?? null }) as unknown as LibraryView

describe('结算小窗的自制（附加自制文件）', () => {
  it('清单按库里已装的包动态读：名字 = 包编号.json，只读指定那套（cn / en），没有包编号 / 没有正文的跳过', async () => {
    const view = viewOf({
      'cn|HOMEBREW_2_STORAGE': [doc('a1', { _meta: { sources: [{ json: 'A' }] } }), doc('b2', { x: 1 }), { head: {}, body: {} }, { head: { docIdLocal: 'c3' } }],
      'en|HOMEBREW_2_STORAGE': [doc('e9', { y: 2 })],
    })
    const cn = await libraryBrews(view, 'cn')
    expect(cn.names).toEqual(['a1.json', 'b2.json'])
    expect(JSON.parse(cn.text('a1.json') as string)).toEqual({ _meta: { sources: [{ json: 'A' }] } })
    expect(cn.text('e9.json')).toBeNull()
    expect((await libraryBrews(view, 'en')).names).toEqual(['e9.json'])
  })

  it('库里什么自制都没装 / 存储不是数组：清单为空，不报错', async () => {
    expect((await libraryBrews(viewOf({}), 'cn')).names).toEqual([])
    expect((await libraryBrews(viewOf({ 'cn|HOMEBREW_2_STORAGE': { not: 'array' } }), 'cn')).names).toEqual([])
  })

  it('认名字只看路径最后一段（实测 Plutonium 按名字取文件，路径就是光秃秃的名字），带目录、带编码也行', () => {
    expect(brewNameOf('a1.json')).toBe('a1.json')
    expect(brewNameOf('homebrew/a1.json')).toBe('a1.json')
    expect(brewNameOf('modules/plutonium/data/homebrew/%E8%87%AA%E5%88%B6.json')).toBe('自制.json')
  })

  it('文件通道：名字在清单里回自制原文；不在清单里的照旧（官方数据走库，插件自带文件 404 = 没有）', async () => {
    const view = viewOf({ 'cn|HOMEBREW_2_STORAGE': [doc('a1', { hello: '自制' })] })
    const brews = await libraryBrews(view, 'cn')
    const asked: string[] = []
    const handlers = kernelHandlers({
      pluginRoot: new URL('http://x.test/'), brews,
      data: async (p) => { asked.push(p); return p === 'data/races.json' ? '{"race":[]}' : null },
      fetchImpl: (async () => new Response('', { status: 404 })) as typeof fetch,
    })
    expect(JSON.parse((await handlers.file('a1.json')) as string)).toEqual({ hello: '自制' })
    expect(await handlers.file('data/races.json')).toBe('{"race":[]}')
    expect(await handlers.file('zzz.json')).toBeNull()
    expect(asked).toEqual(['data/races.json'])
  })

  it('没传自制清单时文件通道和以前一样', async () => {
    const handlers = kernelHandlers({ pluginRoot: new URL('http://x.test/'), data: async () => 'D', fetchImpl: (async () => new Response('', { status: 404 })) as typeof fetch })
    expect(await handlers.file('data/x.json')).toBe('D')
    expect(await handlers.file('a1.json')).toBeNull()
  })

  it('设置：清单放进 import 组（让作者的配置迁移搬到 dataSources），原有项保留，不改传进来的对象；清单空就原样返回', () => {
    const base = { 'plutonium.config': { import: { isNoPrereleaseBrewIndexes: true }, importCreature: { a: 1 } }, other: 1 }
    const snapshot = JSON.stringify(base)
    const out = withLocalHomebrew(base, ['a1.json', 'b2.json']) as typeof base & { 'plutonium.config': { import: Record<string, unknown> } }
    expect(out['plutonium.config'].import).toEqual({ isNoPrereleaseBrewIndexes: true, localHomebrew: ['a1.json', 'b2.json'] })
    expect(out['plutonium.config']).toMatchObject({ importCreature: { a: 1 } })
    expect(out.other).toBe(1)
    expect(JSON.stringify(base)).toBe(snapshot)
    expect(withLocalHomebrew(base, [])).toBe(base)
    expect(withLocalHomebrew(base, undefined)).toBe(base)
  })
})

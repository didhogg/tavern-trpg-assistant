// 核心 SRD 资料包检查：清单来自结算内核自己读的 manifest 与系统声明的 packs，不写死包名。
import { describe, expect, it } from 'vitest'
import { checkCorePacks } from '../../src/rules/kernel/core-pack'

const ROOT = new URL('http://plugin.test/')
const PACKS = ['classes', 'spells', 'items']

function server(opts: { missing?: string[]; noHead?: boolean; rangeOnly?: boolean; manifest?: boolean; throwOn?: string } = {}) {
  const gone = new Set(opts.missing ?? [])
  const calls: string[] = []
  const fetchImpl = (async (input: URL, init?: RequestInit) => {
    const path = new URL(String(input)).pathname.replace('/vendor/foundry/', '')
    calls.push(`${init?.method ?? 'GET'} ${path}${init?.headers ? ' (range)' : ''}`)
    if (opts.throwOn && path === opts.throwOn) throw new Error('读不到')
    if (path === 'manifest.json') return opts.manifest === false ? new Response('', { status: 404 }) : Response.json({ system: 'dnd5e 6.1.0' })
    if (path === 'systems/dnd5e/system.json') return Response.json({ packs: PACKS.map((name) => ({ name })) })
    if (gone.has(path)) return new Response('', { status: 404 })
    if (init?.method === 'HEAD' && opts.noHead) return new Response('', { status: 405 })
    if (init?.headers && opts.rangeOnly === false) return new Response('', { status: 500 })
    return new Response('x', { status: 200 })
  }) as unknown as typeof fetch
  return { fetchImpl, calls }
}

describe('checkCorePacks', () => {
  it('系统声明的每个包都在：ok；用 HEAD，不下载整个包', async () => {
    const s = server()
    expect(await checkCorePacks({ pluginRoot: ROOT, fetchImpl: s.fetchImpl })).toEqual({ ok: true, system: 'dnd5e', total: 3, missing: [] })
    expect(s.calls.filter((c) => c.startsWith('GET packs/'))).toEqual([])
  })
  it('缺的包列出来（用户删了）', async () => {
    const r = await checkCorePacks({ pluginRoot: ROOT, fetchImpl: server({ missing: ['packs/dnd5e.spells.json'] }).fetchImpl })
    expect(r).toEqual({ ok: false, system: 'dnd5e', total: 3, missing: ['packs/dnd5e.spells.json'] })
  })
  it('酒馆不支持 HEAD：改用只取 1 字节的范围请求；读不到的也算没有', async () => {
    const s = server({ noHead: true, throwOn: 'packs/dnd5e.items.json' })
    const r = await checkCorePacks({ pluginRoot: ROOT, fetchImpl: s.fetchImpl })
    expect(r.missing).toEqual(['packs/dnd5e.items.json'])
    expect(s.calls.some((c) => c.includes('(range)'))).toBe(true)
  })
  it('连清单都读不到：不抛错，写明缺的是哪个', async () => {
    expect((await checkCorePacks({ pluginRoot: ROOT, fetchImpl: server({ manifest: false }).fetchImpl })).missing).toEqual(['manifest.json'])
  })
})

import { describe, expect, it } from 'vitest'
import { getCampaignBanner, PATTERN_BANNER } from '../../src/core/banner'
import { WindowLock } from '../../src/core/windowLock'
import { fetchCatalog, downloadPack, findDownloadable, findUpdates, installDownloaded } from '../../src/core/packs/catalog'
import { sha256Hex } from '../../src/core/hash'
import { PackService } from '../../src/core/packs/installer'
import { TrpgError } from '../../src/core/errors'
import { dnd5e2014 } from '../../src/rules/dnd5e2014'
import { buildRuleCards, RuleRegistry } from '../../src/rules/registry'
import { createRuleRegistry } from '../../src/rules'
import { makeClock, makeEntries, makePack, makeRegistry, withDb } from '../helpers/fixtures'
import type { Catalog, CatalogPack } from '../../src/schemas/pack'

describe('横幅取图', () => {
  const data = { instances: [] }
  const chain = [{ name: '龙骨洞', imageUrl: 'cave.png' }, { name: '风暴岛', imageUrl: 'isle.png' }]
  it('当前地点有图 → 用它', () => {
    expect(getCampaignBanner({ rule: dnd5e2014, data, providers: [() => chain] })).toEqual({ src: 'cave.png', alt: '龙骨洞', source: 'location' })
  })
  it('当前地点没图、上级有图 → 用上级的图', () => {
    expect(getCampaignBanner({ rule: dnd5e2014, data, providers: [() => [{ name: '龙骨洞' }, chain[1]]] })).toEqual({ src: 'isle.png', alt: '风暴岛', source: 'parentLocation' })
  })
  it('都没有图 → 本规则默认横幅（宽/窄屏各自的图）', () => {
    expect(getCampaignBanner({ rule: dnd5e2014, data })).toEqual({ src: 'https://a1.ax1x.com/2026/10/28/wwHs9.png', alt: 'D&D 5e 默认战役横幅', source: 'default' })
    expect(getCampaignBanner({ rule: dnd5e2014, data, narrow: true }).src).toBe('https://a1.ax1x.com/2026/10/28/wwHs9.md.png')
  })
  it('不同规则取各自的默认图；没有默认图的规则用纹样', () => {
    const coc = { id: 'coc7', name: 'CoC', nameShort: 'CoC', description: '', corePackIds: [], defaultBanner: { wide: 'coc.png', narrow: 'coc-s.png', alt: 'CoC 横幅' } }
    expect(getCampaignBanner({ rule: coc, data }).src).toBe('coc.png')
    expect(getCampaignBanner({ rule: { ...coc, defaultBanner: undefined }, data })).toEqual(PATTERN_BANNER)
    expect(getCampaignBanner({ rule: undefined, data })).toEqual(PATTERN_BANNER)
  })
})

describe('规则卡', () => {
  it('已安装来自注册表，其余来自目录；目录中已安装的规则不重复', () => {
    const cards = buildRuleCards(createRuleRegistry(), [
      { id: 'coc7', name: '克苏鲁的呼唤 7 版', nameShort: 'CoC 7', description: '', status: 'coming' },
      { id: 'dnd5e2014', name: 'x', nameShort: 'x', description: '', status: 'installable' },
      { id: 'pf2e', name: 'PF2e', nameShort: 'PF2e', description: '', status: 'installable' },
    ])
    expect(cards.map((c) => [c.id, c.status])).toEqual([['dnd5e2014', 'installed'], ['coc7', 'coming'], ['pf2e', 'installable']])
  })
  it('重复注册同一规则报错', () => {
    const r = new RuleRegistry()
    r.register(dnd5e2014)
    expect(() => r.register(dnd5e2014)).toThrow('规则已注册')
  })
})

describe('多窗口只读', () => {
  it('后打开的窗口进入只读，先打开的保持可写；关闭先开的窗口不影响已进入只读的状态', async () => {
    const name = `lock-${Math.random()}`
    const first = new WindowLock(name, () => 1, 'a')
    const second = new WindowLock(name, () => 2, 'b')
    const changes: boolean[] = []
    second.onChange((v) => changes.push(v))
    first.start()
    second.start()
    await new Promise((r) => setTimeout(r, 30))
    expect(first.readOnly).toBe(false)
    expect(second.readOnly).toBe(true)
    expect(changes).toEqual([true])
    first.stop()
    expect(second.readOnly).toBe(true)
    second.stop()
  })
  it('启动时间相同按 id 决定；单个窗口始终可写', async () => {
    const name = `lock-${Math.random()}`
    const a = new WindowLock(name, () => 5, 'a')
    const b = new WindowLock(name, () => 5, 'b')
    const alone = new WindowLock(`solo-${Math.random()}`, () => 1, 'z')
    a.start(); b.start(); alone.start()
    await new Promise((r) => setTimeout(r, 30))
    expect([a.readOnly, b.readOnly, alone.readOnly]).toEqual([false, true, false])
    a.stop(); b.stop(); alone.stop()
  })
})

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { status: 200, ...init })
}

function sampleCatalog(packs: CatalogPack[] = []): Catalog {
  return { formatVersion: 1, rules: [{ id: 'coc7', name: 'CoC', nameShort: 'CoC', status: 'coming', description: '' }], packs }
}

describe('目录与下载', () => {
  it('读取目录；成功结果缓存 1 小时，强制刷新忽略缓存', async () => {
    await withDb(async (db) => {
      let calls = 0
      let t = 1000
      const fetchFn = (async () => (calls++, json(sampleCatalog()))) as unknown as typeof fetch
      const opts = { url: 'https://x/catalog.json', db, fetchFn, now: () => t }
      const first = await fetchCatalog(opts)
      expect(first.rules[0].id).toBe('coc7')
      await fetchCatalog(opts)
      expect(calls).toBe(1)
      t += 3_600_001
      await fetchCatalog(opts)
      expect(calls).toBe(2)
      await fetchCatalog({ ...opts, force: true })
      expect(calls).toBe(3)
      await fetchCatalog({ ...opts, url: 'https://y/catalog.json' })
      expect(calls).toBe(4)
    })
  })

  it('目录读取失败：404、服务器错误、网络不可用、超时、格式不对、版本过新', async () => {
    const attempt = async (fetchFn: typeof fetch, timeoutMs?: number) => {
      try {
        await fetchCatalog({ url: 'https://x/c.json', fetchFn, timeoutMs })
      } catch (e) {
        return e as TrpgError
      }
      throw new Error('应当失败')
    }
    expect((await attempt((async () => new Response('', { status: 404 })) as unknown as typeof fetch)).message).toBe('连不上数据仓库：文件不存在（404）')
    expect((await attempt((async () => new Response('', { status: 503 })) as unknown as typeof fetch)).message).toBe('连不上数据仓库：服务器返回 503')
    expect((await attempt((async () => { throw new TypeError('Failed to fetch') }) as unknown as typeof fetch)).message).toBe('连不上数据仓库：网络不可用')
    const hang = ((_u: string, init?: RequestInit) => new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))))) as unknown as typeof fetch
    expect((await attempt(hang, 20)).message).toBe('连不上数据仓库：等待超时')
    expect((await attempt((async () => new Response('not json', { status: 200 })) as unknown as typeof fetch)).message).toBe('数据仓库目录格式不正确')
    expect((await attempt((async () => json({ packs: 'x' })) as unknown as typeof fetch)).code).toBe('E_BAD_CONTENT')
    expect((await attempt((async () => json({ formatVersion: 9, rules: [], packs: [] })) as unknown as typeof fetch)).code).toBe('E_NEWER_FORMAT')
  })

  async function oneEntry(): Promise<{ bytes: Uint8Array; entry: CatalogPack }> {
    const bytes = makePack({ id: 'scag', name: '剑湾冒险指南', version: '1.0.0' }, makeEntries(2))
    return { bytes, entry: { id: 'scag', ruleId: 'dnd5e2014', category: 'rules', name: '剑湾冒险指南', version: '1.0.0', license: '', description: '', typeCounts: {}, contributes: {}, recommended: false, relationships: { requires: [], recommends: [], conflicts: [] }, byteSize: bytes.length, sha256: sha256Hex(bytes), url: 'packs/scag.trpgpack' } }
  }

  it('下载：分块读取并报告进度，校验通过后可安装；相对地址按目录地址解析', async () => {
    await withDb(async (db) => {
      const { bytes, entry } = await oneEntry()
      let requested = ''
      const fetchFn = (async (url: string) => {
        requested = url
        const half = Math.floor(bytes.length / 2)
        const stream = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(bytes.slice(0, half)); c.enqueue(bytes.slice(half)); c.close() } })
        return new Response(stream, { status: 200 })
      }) as unknown as typeof fetch
      const progress: number[] = []
      const got = await downloadPack(entry, { catalogUrl: 'https://cdn.example/data/catalog.json', fetchFn, onProgress: (r) => progress.push(r) })
      expect(requested).toBe('https://cdn.example/data/packs/scag.trpgpack')
      expect(got).toEqual(bytes)
      expect(progress.length).toBe(2)
      expect(progress.at(-1)).toBe(bytes.length)
      const svc = new PackService(db, { rules: makeRegistry(), now: makeClock(), appVersion: '1.0.0' })
      const installed = await installDownloaded(svc, got, entry)
      expect(installed).toMatchObject({ id: 'scag', source: 'download' })
      await expect(installDownloaded(svc, got, { ...entry, version: '9.9.9' })).rejects.toThrow('下载的文件与目录说明不一致')
    })
  })

  it('下载失败：404、网络中断、取消、校验不符', async () => {
    const { bytes, entry } = await oneEntry()
    const run = async (fetchFn: typeof fetch, signal?: AbortSignal, e: CatalogPack = entry) => {
      try {
        await downloadPack(e, { catalogUrl: 'https://x/c.json', fetchFn, signal })
      } catch (err) {
        return err as TrpgError
      }
      throw new Error('应当失败')
    }
    expect((await run((async () => new Response('', { status: 404 })) as unknown as typeof fetch)).message).toBe('下载失败：文件不存在（404）')
    expect((await run((async () => { throw new TypeError('x') }) as unknown as typeof fetch)).message).toBe('下载失败：网络不可用')
    const broken = (async () => new Response(new ReadableStream({ start(c) { c.enqueue(bytes.slice(0, 5)); c.error(new Error('reset')) } }))) as unknown as typeof fetch
    expect((await run(broken)).message).toBe('下载失败：网络中断')
    const aborted = new AbortController()
    aborted.abort()
    const abortFetch = (async (_u: string, init?: RequestInit) => { if (init?.signal?.aborted) throw Object.assign(new Error('a'), { name: 'AbortError' }); return new Response(bytes as unknown as BodyInit) }) as unknown as typeof fetch
    expect((await run(abortFetch, aborted.signal)).code).toBe('E_CANCELLED')
    expect((await run((async () => new Response(bytes as unknown as BodyInit)) as unknown as typeof fetch, undefined, { ...entry, sha256: 'bad' })).code).toBe('E_CHECKSUM')
    expect((await run((async () => new Response(bytes.slice(0, 10) as unknown as BodyInit)) as unknown as typeof fetch)).code).toBe('E_CHECKSUM')
  })

  it('找出可更新与可下载的内容包（内置包不在更新之列）', async () => {
    await withDb(async (db) => {
      const svc = new PackService(db, { rules: makeRegistry(), now: makeClock(), appVersion: '1.0.0' })
      await svc.installBuiltin(makePack({ id: 'dnd5e2014-srd', version: '1.0.0' }))
      const x = svc.recognize(makePack({ id: 'xge', name: 'XGE', version: '1.0.0' }))
      if (x.type !== 'pack') throw new Error()
      await svc.install(x, { source: 'download' })
      const mk = (id: string, version: string): CatalogPack => ({ id, ruleId: 'dnd5e2014', category: 'rules', name: id, version, license: '', description: '', typeCounts: {}, contributes: {}, recommended: false, relationships: { requires: [], recommends: [], conflicts: [] }, byteSize: 1, sha256: 'h', url: 'u' })
      const catalog = sampleCatalog([mk('dnd5e2014-srd', '2.0.0'), mk('xge', '1.1.0'), mk('tce', '1.0.0')])
      const installed = await svc.list()
      expect(findUpdates(installed, catalog).map((p) => p.id)).toEqual(['xge'])
      expect(findDownloadable(installed, catalog, 'dnd5e2014').map((p) => p.id)).toEqual(['tce'])
      expect(findDownloadable(installed, catalog, 'coc7')).toEqual([])
    })
  })
})

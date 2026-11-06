import { describe, expect, it } from 'vitest'
import { healthItemsOf, healthReport, type HealthInput } from '../../../src/library/health'
import type { InstallReport } from '../../../src/library/install'
import { getSource } from '../../../src/library/sources'

const install = (over: Partial<InstallReport['parse']> = {}): InstallReport => ({
  source: 'cn-official', commit: 'c', storage: { persisted: null, quota: null, usage: null }, plan: { files: 2, bytes: 1 },
  download: { fetched: 2, reused: 0, failed: [] }, mirror: { checked: 2, missing: [], mismatched: ['data/x.json'] },
  parse: { props: { spell: { count: 3, noHash: 1 } }, corpora: { book: { count: 1, failed: [{ id: 'PHB', error: '坏了' }] } }, notRun: [{ props: ['adventure'], reason: '按需' }], errors: [], ...over },
  index: { spell: { parsed: 3, index: 2, onlyParsed: 1, onlyIndex: 0, samplesOnlyParsed: ['a'], samplesOnlyIndex: [] } }, ms: 1,
})

const find = (items: ReturnType<typeof healthItemsOf>, check: string) => items.find((i) => i.check === check)!

describe('体检：各份报告汇成统一格式', () => {
  it('官方：没装只报一条"还没安装"', () => {
    const items = healthItemsOf({ source: getSource('cn-official'), installed: false })
    expect(items.map((i) => [i.check, i.level])).toEqual([['not-installed', 'info']])
  })

  it('官方：第 1、2、5 层按级别分好；第 3、4 层没跑时说明在哪跑；旧报告带 stale', () => {
    const items = healthItemsOf({ source: getSource('cn-official'), installed: true, install: { value: install(), stale: true } })
    expect(find(items, 'download')).toMatchObject({ level: 'ok', count: 0, layer: 1, stale: true })
    expect(find(items, 'mirror')).toMatchObject({ level: 'error', count: 1, details: [{ path: 'data/x.json', problem: 'mismatched' }] })
    expect(find(items, 'parse')).toMatchObject({ level: 'error', count: 1, layer: 2 })
    expect(find(items, 'no-hash')).toMatchObject({ level: 'warn', count: 1 })
    expect(find(items, 'not-run')).toMatchObject({ level: 'info', count: 1 })
    expect(find(items, 'index')).toMatchObject({ level: 'info', count: 1, layer: 5 })
    expect(find(items, 'english')).toMatchObject({ level: 'info', count: 0, title: '还没算中英配对覆盖率' })
    expect(find(items, 'layer3')).toMatchObject({ level: 'info', count: 0 })
  })

  it('中英覆盖率与第 3、4 层报告存在时收进来', () => {
    const input: HealthInput = {
      source: getSource('cn-official'), installed: true,
      english: { stale: false, value: { source: 'cn-official', pair: 'en-official', via: {}, props: { spell: { total: 3, paired: 2, nameMismatch: 1 } }, unpaired: [{ prop: 'spell', hash: 'x', reason: 'not-in-index' }], nameMismatch: [{ prop: 'spell', hash: 'y', enHash: 'z', via: 'position', engName: 'A', enName: 'B' }] } },
      layers34: { stale: false, value: { schemaVersion: '0.17.34', layer3: { item: { d: { rawOnly: 0, parsedOnly: 2, rawNoHash: 0, samples: ['s'] } }, spell: { d: { rawOnly: 0, parsedOnly: 0, rawNoHash: 0, samples: [] } } }, layer4: { class: { pairs: 1, suspicious: { 'changed:classFeatures': { count: 1, samples: ['c'] } } } } } },
    }
    const items = healthItemsOf(input)
    expect(find(items, 'english')).toMatchObject({ level: 'info', count: 1 })
    expect(find(items, 'english').title).toContain('2/3 配上')
    expect(find(items, 'english-name')).toMatchObject({ level: 'warn', count: 1 })
    expect(find(items, 'layer3')).toMatchObject({ level: 'warn', count: 1, details: [{ prop: 'item', parsedOnly: 2 }] })
    expect(find(items, 'layer4')).toMatchObject({ level: 'warn', count: 1, details: [{ prop: 'class', diff: 'changed:classFeatures', count: 1 }] })
  })

  it('自制：解析出错、作者报错、不显示的包、没解析出内容的包', () => {
    const items = healthItemsOf({
      source: getSource('cn-brew'), installed: false,
      brew: { stale: false, value: { source: 'cn-brew', installed: [{}], parse: { props: {}, notRun: [], errors: [{ prop: 'class', error: 'x' }], authorErrors: ['无法加载'] }, ms: 1 } },
      brewStorage: [
        { kind: 'brew', head: { docIdLocal: 'a', filename: 'a.json' }, sources: ['SrcA'], shown: true },
        { kind: 'brew', head: { docIdLocal: 'b', filename: 'b.json' }, sources: ['SrcB'], shown: true },
        { kind: 'prerelease', head: { docIdLocal: 'c', filename: 'c.json' }, sources: [], shown: false },
      ],
      brewSourceCounts: { srca: 3 },
    })
    expect(find(items, 'brew-parse')).toMatchObject({ level: 'error', count: 1 })
    expect(find(items, 'brew-author-errors')).toMatchObject({ level: 'warn', details: ['无法加载'] })
    expect(find(items, 'brew-hidden')).toMatchObject({ level: 'warn', count: 1 })
    expect(find(items, 'brew-empty')).toMatchObject({ level: 'warn', details: [{ docIdLocal: 'b', filename: 'b.json', sources: ['SrcB'] }] })
    expect(items.some((i) => i.check === 'not-installed' || i.check === 'layer3')).toBe(false)
  })

  it('自制：没装任何包时各项都是 ok', () => {
    const items = healthItemsOf({ source: getSource('en-brew'), installed: false, brewStorage: [], brewSourceCounts: {} })
    expect(items.map((i) => [i.check, i.level])).toEqual([['brew-hidden', 'ok'], ['brew-empty', 'ok']])
  })

  it('自制：对应的官方数据没装时跳过并注明', () => {
    const items = healthItemsOf({ source: getSource('en-brew'), installed: false, officialMissing: 'en-official' })
    expect(items.map((i) => [i.check, i.level])).toEqual([['brew-skipped', 'info']])
  })

  it('汇总按级别计数', () => {
    const r = healthReport(healthItemsOf({ source: getSource('cn-official'), installed: true, install: { value: install(), stale: false } }), 5)
    expect(r.at).toBe(5)
    expect(r.summary).toEqual({ ok: 1, info: 4, warn: 1, error: 2 })
  })
})

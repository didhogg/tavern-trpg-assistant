// 显示文字对照：条目本身 + 同编号的 Foundry 补充记录（src/rules/kernel/sidecar.ts），交给显示出口 display.ts。
import { describe, expect, it } from 'vitest'
import { belongs, isSidecar, pairsSource, sidecarPairsOf } from '../../src/rules/kernel/sidecar'
import { display } from '../../src/rules/kernel/display'
import { fromEntry } from '../../src/rules/kernel/shown'
import { kernelDataSource, officialSourceOf } from '../../src/library/sources'
import type { FileProvider } from '../../src/library/files'

// 作者文件形状原样节选：英文 data/class/foundry.json 与中文版同一文件（中文版所属字段是中文，英文名另存 ENG_name）
const monkEn = { name: 'Monk', source: 'XPHB' }
const monkZh = { name: '武僧', ENG_name: 'Monk', source: 'XPHB' }
const sideEn = {
  class: [{ name: 'Monk', source: 'XPHB', advancement: [{ type: 'ScaleValue', title: 'Martial Arts Die', configuration: { identifier: 'die' } }] }],
  classFeature: [
    { name: 'Unarmored Defense', source: 'XPHB', className: 'Monk', classSource: 'XPHB', level: 1, advancement: [{ title: 'Unarmored Defense' }] },
    { name: 'Unarmored Defense', source: 'XPHB', className: 'Barbarian', classSource: 'XPHB', level: 1, advancement: [{ title: 'Unarmored Defense' }] },
  ],
}
const sideZh = {
  class: [{ ENG_name: 'Monk', name: '武僧', source: 'XPHB', advancement: [{ type: 'ScaleValue', title: '武艺骰', configuration: { identifier: 'die' } }] }],
  classFeature: [
    { ENG_name: 'Unarmored Defense', name: '无甲防御', source: 'XPHB', className: '武僧', classSource: 'XPHB', level: 1, advancement: [{ title: '无甲防御' }] },
    { ENG_name: 'Unarmored Defense', name: '无甲防御', source: 'XPHB', className: '野蛮人', classSource: 'XPHB', level: 1, advancement: [{ title: '无甲防御' }] },
  ],
}

describe('补充文件：照作者 test-foundry.js', () => {
  it('data/<目录>/foundry.json 与 data/foundry-*.json 是；条目文件不是', () => {
    expect(isSidecar('data/class/foundry.json')).toBe(true)
    expect(isSidecar('data/foundry-races.json')).toBe(true)
    expect(isSidecar('data/class/class-monk.json')).toBe(false)
    expect(isSidecar('data/races.json')).toBe(false)
  })
})

describe('同编号配对', () => {
  it('记录属于条目：同名同来源，或所属字段指向它（各用自己语言的条目名）', () => {
    expect(belongs(sideEn.class[0], monkEn)).toBe(true)
    expect(belongs(sideEn.classFeature[0], monkEn)).toBe(true)
    expect(belongs(sideEn.classFeature[1], monkEn)).toBe(false)
    expect(belongs(sideZh.classFeature[0], monkZh)).toBe(true)
    expect(belongs(sideZh.classFeature[1], monkZh)).toBe(false)
  })
  it('只配属于这对条目的记录，按 类别 + 英文名 + 来源 + 等级', () => {
    const pairs = sidecarPairsOf(sideEn, sideZh, { en: monkEn, zh: monkZh })
    expect(pairs).toHaveLength(2)
    expect(pairs.every((p) => (p.zh as { className?: string }).className !== '野蛮人')).toBe(true)
  })
  it('交给显示出口：补充文件里的数值行标题换成中文', async () => {
    const pairs = sidecarPairsOf(sideEn, sideZh, { en: monkEn, zh: monkZh })
    const author = { resolve: async (requests: unknown[]) => requests.map(() => null) }
    const out = await display({ steps: [{ type: 'ScaleValue', title: fromEntry('Martial Arts Die') }] }, { translate: true, pairs, namer: async () => null, author })
    expect(out.value.steps[0].title).toBe('武艺骰')
  })
})

describe('pairsSource：补充文件取英文【库】已装清单里符合作者规则的', () => {
  const zh = officialSourceOf('cn')
  const en = kernelDataSource()
  const store: Record<string, Record<string, string>> = {
    [en.id]: { 'data/class/foundry.json': JSON.stringify(sideEn), 'data/foundry-feats.json': JSON.stringify({ feat: [] }) },
    [zh.id]: { 'data/class/foundry.json': JSON.stringify(sideZh) },
  }
  const asked: string[] = []
  const installed = { 'data/class/foundry.json': {}, 'data/foundry-feats.json': {}, 'data/class/class-monk.json': {}, 'data/races.json': {} }
  const files = {
    get: async (s: { id: string }, path: string) => { asked.push(`${s.id}:${path}`); return store[s.id]?.[path] ?? null },
    cachedFileList: async () => installed,
  } as unknown as FileProvider
  const rows = [{ entry: monkEn, zh: monkZh }]

  it('已装的补充文件配上；条目文件不当补充文件；中文版没有的不配', async () => {
    const pairs = await pairsSource({ files, view: {} as never, codeSet: 'cn' })(rows)
    expect(pairs).toHaveLength(1 + 2)
    expect(asked.some((x) => x.endsWith('class-monk.json'))).toBe(false)
    expect(asked.some((x) => x.endsWith('races.json') && !x.includes('foundry'))).toBe(false)
  })
  it('交给小窗的本来就是中文条目（没有英文对照）→ 只有条目本身', async () => {
    const pairs = await pairsSource({ files, view: {} as never, codeSet: 'cn' })([{ entry: monkZh, zh: null }])
    expect(pairs).toEqual([{ en: monkZh, zh: null }])
  })
})

// P5.5 C8 / C9：双语编辑的填入和「不用翻译的字段」对不上。名字规则照作者中文版（中文条目用 ENG_name 记英文名）。
import { describe, expect, it } from 'vitest'
import { fillFrom, fillPlan, isLanguageNeutral, neutralMismatches } from '../../../src/library/lang-fill'
import { languageOfBrew } from '../../../src/library/custom-lang'

const en = { name: 'Fire Parrot', source: 'PIRATE', level: 1, school: 'V', entries: ['A burst of feathers.'], range: { type: 'point' } }
const zhHalf = { name: '火焰鹦鹉', source: 'PIRATE', level: 2, entries: [] as string[] }

describe('从另一语言填入（C8）', () => {
  it('只填空着的：空的补上，已经填了的不动；英文 name 进中文的 ENG_name，中文名不动；来源不填', () => {
    const r = fillFrom(zhHalf, en, 'zh', 'onlyEmpty')
    expect(r).toEqual({ name: '火焰鹦鹉', source: 'PIRATE', level: 2, school: 'V', entries: ['A burst of feathers.'], range: { type: 'point' }, ENG_name: 'Fire Parrot' })
  })
  it('全部换掉：已经填了的也换成另一语言的（名字规则不变）', () => {
    expect(fillFrom(zhHalf, en, 'zh', 'all')).toMatchObject({ name: '火焰鹦鹉', level: 1, ENG_name: 'Fire Parrot' })
  })
  it('中文 → 英文：用中文条目的 ENG_name 当英文 name；ENG_name 本身不带过去', () => {
    const r = fillFrom({ source: 'PIRATE' }, { name: '火焰鹦鹉', ENG_name: 'Fire Parrot', level: 1 }, 'en', 'onlyEmpty')
    expect(r).toEqual({ source: 'PIRATE', name: 'Fire Parrot', level: 1 })
  })
  it('填入确认：两种填法各会改哪几项', () => {
    const p = fillPlan(zhHalf, en, 'zh')
    expect(p.onlyEmpty.map((c) => c.field)).toEqual(['ENG_name', 'entries', 'range', 'school'])
    expect(p.all.map((c) => c.field)).toEqual(['ENG_name', 'entries', 'level', 'range', 'school'])
  })
})

describe('不用翻译的字段对不上（C9）', () => {
  const defs = { 'r#': { c: 'group' as const, props: [{ name: 'amount', required: false, shape: { c: 'number' as const } }] } }
  const fields = [
    { name: 'level', shape: { c: 'number' as const } },
    { name: 'school', shape: { c: 'select' as const, enum: ['V', 'A'] } },
    { name: 'entries', shape: { c: 'list' as const, of: { c: 'entries' as const } } },
    { name: 'dist', shape: { ref: 'r#' } },
  ]
  it('数字、下拉、只由它们组成的一组算「不用翻译」；正文不算', () => {
    expect(isLanguageNeutral(fields[3].shape, defs)).toBe(true)
    expect(isLanguageNeutral(fields[2].shape, defs)).toBe(false)
  })
  it('两边都填了、但不一样的才列出（一边空着不算）', () => {
    expect(neutralMismatches({ level: 1, school: 'V', entries: ['a'], dist: { amount: 60 } }, { level: 2, entries: ['b'], dist: { amount: 120 } }, fields, defs)).toEqual(['level', 'dist'])
  })
})

describe('认文件语言（C4，作者中文版规矩）', () => {
  it('条目带 ENG_name 或包头有译者名单的是中文；否则英文', () => {
    expect(languageOfBrew({ _meta: {}, spell: [{ name: '火球术', ENG_name: 'Fireball' }] })).toBe('zh')
    expect(languageOfBrew({ _meta: { translators: ['某人'] }, spell: [] })).toBe('zh')
    expect(languageOfBrew({ _meta: {}, spell: [{ name: 'Fireball' }] })).toBe('en')
  })
})

// C2–C7：双语包（BilingualLibrary）。假的 CustomLibrary / 作者存储：包按资料集（cn / en）分开存，身份 = 来源编号组合。
import { BilingualLibrary } from '../../../src/library/custom-lang'

function setup() {
  const packs: Record<string, Array<{ id: string; docIdLocal: string; sources: string[] }>> = { cn: [{ id: 'pirate', docIdLocal: 'z1', sources: ['PIRATE'] }, { id: 'solo', docIdLocal: 'z2', sources: ['SOLO'] }], en: [{ id: 'pirate', docIdLocal: 'e1', sources: ['PIRATE'] }] }
  const saved: unknown[] = []
  const imported: Array<{ set: string; names: string[] }> = []
  const custom = {
    packs: async (cs: string) => packs[cs],
    exportPack: async (_cs: string, id: string) => ({ filename: `${id}.json`, body: { _meta: { sources: [{ json: id.toUpperCase(), full: id }], edition: 'classic', internalCopies: ['x'] }, spell: [{ name: 'x' }] } }),
    saveEntry: async (cs: string, prop: string, ent: unknown, o: unknown) => { saved.push({ cs, prop, ent, o }); return { uniqueId: 'u' } },
    packEntry: async (_cs: string, _p: string, _prop: string, key: { hash?: string }) => ({ entity: { name: '火焰鹦鹉' }, hash: key.hash ?? '火焰鹦鹉_pirate', hadId: true }),
    previewImport: async (cs: string, files: unknown[]) => ({ cs, n: files.length }),
    fields: async () => null,
  }
  const frame = { call: async (fn: string, ...a: unknown[]) => {
    if (fn === 'brewDocIndex') return [{ docIdLocal: 'e1', isEditable: false, props: { spell: ['fire parrot_pirate'] } }]
    if (fn === 'packEntity') return { entity: { name: 'Fire Parrot', level: 1 }, hash: a[2] && (a[2] as { hash: string }).hash, hadId: false }
    throw new Error(fn)
  } }
  const lib = {
    frameOf: async () => frame,
    brewImport: async (set: string, files: Array<{ name: string; text: string }>) => { imported.push({ set, names: files.map((f) => f.name) }); if (set === 'en-brew') for (const f of files) packs.en.push({ id: 'solo', docIdLocal: 'e2', sources: JSON.parse(f.text)._meta.sources.map((s: { json: string }) => s.json) }); return { ok: true, errors: [] } },
  }
  const pairs = { installed: async () => [{ zh: { docIdLocal: 'z1' }, en: { docIdLocal: 'e1' }, status: 'paired' }, { zh: { docIdLocal: 'z2' }, en: null, status: 'zh-only' }] }
  let counter: { refs: Array<{ hash: string; docIdLocal?: string }>; reason: string | null } = { refs: [{ hash: 'fire parrot_pirate' }], reason: null }
  const counterparts = { counterpart: async () => counter }
  const b = new BilingualLibrary(custom as never, lib as never, pairs as never, counterparts as never)
  return { b, saved, imported, packs, setCounter: (c: typeof counter) => { counter = c } }
}

describe('双语包（C2–C7）', () => {
  it('C2 列包：配上的一对一行，只有一边的另一边为空', async () => {
    const { b } = setup()
    expect((await b.packs()).map((p) => [p.id, p.zh?.docIdLocal ?? null, p.en?.docIdLocal ?? null])).toEqual([['pirate', 'z1', 'e1'], ['solo', 'z2', null]])
  })
  it('C3 加英文版：在英文那套导入只有包头的文件（来源、版本风格照原包）；已经有了不重复建', async () => {
    const { b, imported } = setup()
    expect(await b.addLanguage('cn', 'solo')).toEqual({ codeSet: 'en', id: 'solo' })
    expect(imported).toEqual([{ set: 'en-brew', names: ['solo.json'] }])
    await b.addLanguage('cn', 'pirate')
    expect(imported).toHaveLength(1)
  })
  it('C7 存英文：英文那套还没有这个包就先建，再按平常的保存走', async () => {
    const { b, saved, imported } = setup()
    await b.saveInLanguage('en', 'solo', 'spell', { name: 'Solo' })
    expect(imported).toEqual([{ set: 'en-brew', names: ['solo.json'] }])
    expect(saved).toEqual([{ cs: 'en', prop: 'spell', ent: { name: 'Solo' }, o: { pack: 'solo' } }])
  })
  it('C6 取另一语言的同一条：对上了给原文；对不上是 none（编辑另一边 = 新建）；对上几条是 ambiguous', async () => {
    const { b, setCounter } = setup()
    expect(await b.otherEntry('cn', 'pirate', 'spell', { uniqueId: 'u1' })).toMatchObject({ state: 'found', entity: { name: 'Fire Parrot' }, hash: 'fire parrot_pirate' })
    setCounter({ refs: [], reason: 'no-english-name' })
    expect(await b.otherEntry('cn', 'pirate', 'spell', { uniqueId: 'u1' })).toMatchObject({ state: 'none', reason: 'no-english-name' })
    setCounter({ refs: [{ hash: 'a' }, { hash: 'b' }], reason: null })
    expect((await b.otherEntry('cn', 'pirate', 'spell', { uniqueId: 'u1' })).state).toBe('ambiguous')
  })
  it('C4 导入按语言分开：中文文件进中文那套、英文进英文那套', async () => {
    const { b } = setup()
    const r = await b.previewImport([{ name: 'a.json', text: JSON.stringify({ _meta: {}, spell: [{ name: '甲', ENG_name: 'A' }] }) }, { name: 'b.json', text: JSON.stringify({ _meta: {}, spell: [{ name: 'B' }] }) }])
    expect(r.map((x) => [x.lang, x.codeSet])).toEqual([['zh', 'cn'], ['en', 'en']])
  })
  it('C5 导出双语包：两边各一个文件；只有一边的就一个', async () => {
    const { b } = setup()
    expect((await b.exportBoth('pirate')).map((x) => x.lang)).toEqual(['zh', 'en'])
    expect((await b.exportBoth('solo')).map((x) => x.lang)).toEqual(['zh'])
  })
})

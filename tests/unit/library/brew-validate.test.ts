import { describe, expect, it } from 'vitest'
import { configureBrewValidator, describeError, validateBrewJson } from '../../../src/library/brew-validate'
import { CustomLibrary } from '../../../src/library/custom'

const spell: Record<string, unknown> = { name: '测试术', source: 'P5Test', level: 1, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['x'] }
type Brew = { _meta: { edition?: string; translators?: string[]; dateAdded: number; dateLastModified: number; sources: Array<Record<string, unknown>> }; spell: Array<Record<string, unknown>> }
const good = (): Brew => ({
  _meta: { sources: [{ json: 'P5Test', abbreviation: 'P5', full: 'P5 测试包', authors: ['测试者'], convertedBy: ['测试者'], version: '1.0.0', dateReleased: '2024-05-06' }], dateAdded: 1, dateLastModified: 1, edition: 'classic' },
  spell: [structuredClone(spell)],
})
configureBrewValidator(new URL('../../../', import.meta.url))
const pretty = (o: unknown) => JSON.stringify(o, null, 1)

describe('自制 JSON 结构校验（作者结构定义，预编译）', () => {
  it('合格的包通过，对象和原文都行', async () => {
    expect(await validateBrewJson(pretty(good()))).toEqual({ ok: true, issues: [], total: 0 })
    expect((await validateBrewJson(good())).ok).toBe(true)
  })

  it('缺必填项：给路径、中文说明、原文行列', async () => {
    const b = good()
    delete b._meta.edition
    const r = await validateBrewJson(pretty(b))
    expect(r.ok).toBe(false)
    expect(r.issues[0]).toMatchObject({ path: '/_meta', keyword: 'required', text: '缺少必填项「edition」', line: 2 })
  })

  it('条目里的问题定位到那一条的那个字段；"完整条目或 _copy"二选一的杂音不盖住真问题', async () => {
    const b = good()
    b.spell[0].level = 'x'
    const text = pretty(b)
    const r = await validateBrewJson(text)
    const hit = r.issues.find((i) => i.path === '/spell/0/level')
    expect(hit).toMatchObject({ keyword: 'type', text: '类型应为 integer' })
    expect(text.split('\n')[(hit?.line ?? 0) - 1]).toContain('"level"')
    expect(r.issues.some((i) => i.keyword === 'anyOf' || i.text.includes('_copy'))).toBe(false)
    expect(r.total).toBeGreaterThan(r.issues.length)
  })

  it('多出的属性、重复项、日期格式', async () => {
    const extra = good()
    extra.spell[0].bogus = 1
    expect((await validateBrewJson(extra)).issues.map((i) => i.text)).toContain('多出不认识的属性「bogus」')
    const dup = good()
    dup.spell.push(structuredClone(dup.spell[0]))
    expect((await validateBrewJson(dup)).issues[0]).toMatchObject({ path: '/spell', keyword: 'uniqueItems' })
    const date = good()
    date._meta.sources[0].dateReleased = '2024/05/06'
    expect((await validateBrewJson(date)).issues[0]).toMatchObject({ keyword: 'format', path: '/_meta/sources/0/dateReleased' })
  })

  it('中文自制仓库自己加的字段（ENG_name、_meta.translators）照中文 fork 的做法放行，别的多余字段照样报错', async () => {
    const zh = good()
    zh.spell[0].ENG_name = 'Test Spell'
    zh._meta.translators = ['译者']
    expect(await validateBrewJson(pretty(zh))).toMatchObject({ ok: true })
    const bad = structuredClone(zh)
    bad.spell[0].ENG_nam = 'typo'
    expect((await validateBrewJson(bad)).issues.map((i) => i.text)).toContain('多出不认识的属性「ENG_nam」')
  })

  it('不是 JSON：说出位置，不抛错', async () => {
    const r = await validateBrewJson('{\n "a": ,\n}')
    expect(r.ok).toBe(false)
    expect(r.issues[0]).toMatchObject({ keyword: 'parse', path: '' })
    expect(r.issues[0].text).toContain('不是合法的 JSON')
  })

  it('没见过的错误类型保留 ajv 原话', () => {
    expect(describeError({ keyword: 'dependentRequired', params: {}, message: 'must have property x' })).toBe('must have property x')
  })

  it('custom.validate / validateEntry：单条套外壳，只留这一条自己的错', async () => {
    const custom = new CustomLibrary({} as never, {} as never, {} as never)
    expect((await custom.validate(pretty(good()), { kind: 'brew' })).ok).toBe(true)
    expect(await custom.validateEntry('spell', spell)).toEqual([])
    const bad = await custom.validateEntry('spell', { ...spell, level: 'x' })
    expect(bad.map((i) => i.path)).toContain('/spell/0/level')
    expect(bad.every((i) => i.path.startsWith('/spell/0'))).toBe(true)
  })
  it('saveEntry：保存后顺带返回另一种语言里对上了谁（只提示，另一边的条目一个字不改）', async () => {
    const calls: string[] = []
    const frame = { call: async (name: string, ..._args: unknown[]) => { calls.push(name); return name === 'editablePut' ? { uniqueId: 'u1', hash: 'h1' } : undefined } }
    const lib = { frameOf: async () => frame, mutateAuthor: async (_codeSet: string, _kind: string, run: (view: unknown) => Promise<unknown>) => ({ value: await run({}), parse: { parsed: true }, view: {} }) }
    const hint = async (ref: { set: string; prop: string; hash: string }) => ({ status: 'found' as const, refs: [{ set: 'en-brew', prop: ref.prop, hash: 'e1' }], reason: null, sharedBy: 0 })
    const custom = new CustomLibrary(lib as never, { reset: () => undefined } as never, {} as never, hint)
    const r = await custom.saveEntry('cn', 'spell', spell)
    expect(r).toMatchObject({ uniqueId: 'u1', hash: 'h1', counterpart: { status: 'found', refs: [{ set: 'en-brew', prop: 'spell', hash: 'e1' }] } })
    expect(calls).toEqual(['editableEnsureSource', 'editablePut'])
    expect((await new CustomLibrary(lib as never, { reset: () => undefined } as never, {} as never).saveEntry('cn', 'spell', spell)).counterpart).toBeNull()
  })
})

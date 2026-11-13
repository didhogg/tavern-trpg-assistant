// P5.5 收尾 C2（根因 B）：要改要写之前读「现在的原文」——房规生效的样子按插件的选择 + 房规原文当场拼（作者单条合并），不等后台解析。
import { describe, expect, it } from 'vitest'
import { houseChanges, houseNow, rawEntry } from '../../../src/library/custom-raw'

const target = { set: 'cn-official', prop: 'spell', hash: 'fireball_phb' }
const base = { name: '火球术', source: 'PHB', level: 3, page: 241, basicRules: true, _isCopy: true }
const c = { rule: 'dnd5e2014', codeSet: 'cn', scopes: [], include: [], exclude: [], choices: {} as Record<string, string> }
type Row = { level: string; ref: typeof target; altId: string; kind: string }

function deps(rows: Row[], houses: Record<string, Record<string, unknown>>) {
  const frame = { call: async (cmd: string, ...a: unknown[]) => {
    if (cmd === 'cleanEntity') return Object.fromEntries(Object.entries(a[0] as object).filter(([k]) => !k.startsWith('_')))
    if (cmd === 'brewDocIndex') return [{ docIdLocal: 'pack', isEditable: false }, { docIdLocal: 'editable', isEditable: true }]
    if (cmd === 'packEntity') { const h = houses[(a[2] as { hash: string }).hash]; return a[0] === 'editable' && h ? { entity: { ...h, uniqueId: 'u1' }, hadId: true } : null }
    // 作者单条合并：原件 + 房规写了的字段（null 删掉）
    if (cmd === 'mergeOne') { const raw = a[1] as Record<string, unknown>; const out: Record<string, unknown> = { name: '火球术', source: 'PHB', level: 3 }; for (const [k, v] of Object.entries(raw)) if (k !== '_copy') { if (v === null) delete out[k]; else out[k] = v } return out }
    throw new Error(cmd)
  } }
  return {
    lib: { frameOf: async () => frame, storedItem: async () => ({ item: base, source: 'PHB' }) },
    edits: async () => rows,
    detail: async () => ({ item: { name: '别的版本', level: 9 } }),
    houseSet: () => 'cn-brew',
  } as never
}

describe('houseNow：现在生效的那一份', () => {
  it('没有选别的：原件（去掉运行时字段）', async () => {
    const r = await houseNow(deps([], {}), c, target)
    expect(r).toMatchObject({ altId: 'base', house: null, item: { level: 3 }, base: { name: '火球术', level: 3 } })
    expect('_isCopy' in r.item).toBe(false)
  })
  it('房规：按房规原文当场拼（还没解析也是新的），给出那条房规和所在的层', async () => {
    const r = await houseNow(deps([{ level: 'global', ref: target, altId: 'house:h1', kind: 'house' }], { h1: { name: '火球术', source: 'TRPGHOUSE', level: 6, _copy: { name: '火球术', source: 'PHB' } } }), c, target)
    expect(r).toMatchObject({ altId: 'house:h1', house: { set: 'cn-brew', hash: 'h1' }, level: 'global', item: { level: 6 }, raw: { level: 6 } })
  })
  it('层的先后：本战役 → 当前规则 → 全局；别的规则的层不算', async () => {
    const rows = [
      { level: 'global', ref: target, altId: 'house:g', kind: 'house' },
      { level: 'rule:dnd5e2024', ref: target, altId: 'house:other', kind: 'house' },
      { level: 'rule:dnd5e2014', ref: target, altId: 'house:r', kind: 'house' },
    ]
    const houses = { g: { level: 1 }, other: { level: 2 }, r: { level: 7 } }
    expect((await houseNow(deps(rows, houses), c, target)).altId).toBe('house:r')
    expect((await houseNow(deps([...rows, { level: 'campaign', ref: target, altId: 'base', kind: 'base' }], houses), c, target)).altId).toBe('base')
  })
  it('选的房规被删了：回到原件', async () => {
    expect(await houseNow(deps([{ level: 'global', ref: target, altId: 'house:gone', kind: 'house' }], {}), c, target)).toMatchObject({ altId: 'base', item: { level: 3 } })
  })
  it('自制条目的原文：读作者存储（可编辑自制先找），带 uniqueId', async () => {
    const r = await rawEntry(deps([], { h1: { name: '火球术', level: 6 } }), { set: 'cn-brew', prop: 'spell', hash: 'h1' })
    expect(r).toMatchObject({ docIdLocal: 'editable', uniqueId: 'u1', entity: { level: 6 } })
  })

  it('编辑器起始内容：作者合并没抄的字段（页码、basicRules）从原件补回；改了什么只看房规原文写了的字段（C3）', async () => {
    // 作者合并不抄页码、basicRules（这里的假合并同样不抄：只给 name / source / level + 房规写的）
    const r = await houseNow(deps([{ level: 'global', ref: target, altId: 'house:h1', kind: 'house' }], { h1: { name: '火球术', source: 'TRPGHOUSE', level: 6, _copy: { name: '火球术', source: 'PHB' } } }), c, target)
    expect(r.item).not.toHaveProperty('page')
    expect(r.start).toMatchObject({ level: 6, page: 241, basicRules: true })
    expect(r.changes).toEqual([{ field: 'level', before: 3, after: 6 }])
  })
  it('房规删掉的字段（写 null）：起始内容里不补回，改了什么写成删掉', async () => {
    const r = await houseNow(deps([{ level: 'global', ref: target, altId: 'house:h1', kind: 'house' }], { h1: { name: '火球术', source: 'TRPGHOUSE', page: null, _copy: { name: '火球术', source: 'PHB' } } }), c, target)
    expect(r.start).not.toHaveProperty('page')
    expect(r.changes).toEqual([{ field: 'page', before: 241, after: null }])
  })
})

describe('houseChanges：唯一的房规改动算法', () => {
  it('只列原文写了、且和原件不一样的；_mod 改的也算；名字没变不算', () => {
    const was = { name: 'A', level: 3, range: 1, entries: ['x'] }
    const raw = { name: 'A', source: 'H', level: 4, range: 1, _copy: { name: 'A', source: 'P', _mod: { entries: { mode: 'appendArr', items: 'y' } } } }
    const now = { name: 'A', level: 4, range: 1, entries: ['x', 'y'] }
    expect(houseChanges(was, raw, now)).toEqual([{ field: 'entries', before: ['x'], after: ['x', 'y'] }, { field: 'level', before: 3, after: 4 }])
  })
})

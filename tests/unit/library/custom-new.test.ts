import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { configureBrewValidator } from '../../../src/library/brew-validate'
import { blankEntry, entryTypes } from '../../../src/library/custom-new'
import { listDrafts, saveDraft } from '../../../src/library/custom-drafts'
import { LibraryDatabase } from '../../../src/library/db'
import { ManageStore } from '../../../src/library/manage'

// P5.5 B5 / B6 / B7。小窗给的类型（作者读出来的）在这里按结构定义再筛；空白条目按字段表；草稿只进管理记录。
configureBrewValidator(new URL('../../../', import.meta.url))

describe('entryTypes（B5）', () => {
  // 假小窗：照作者形状交回类型；其中一个不是结构定义收的类别
  const frame = { call: async () => [
    { prop: 'spell', name: '法术', group: { page: 'spells.html', name: '法术' }, builder: true, converters: ['spell'] },
    { prop: 'deity', name: '神祇', group: null, builder: false, converters: [] },
    { prop: 'notInSchema', name: 'x', group: null, builder: false, converters: [] },
  ] }
  const deps = {
    frame: async () => frame as never,
    categories: async (setId: string) => { if (setId === 'cn-official') return { spell: 3 }; if (setId === 'cn-brew') return { spell: 2 }; throw new Error('没装') },
  }
  it('只留结构定义收的；起点由作者有没有构建器 / 转换器、库里有没有这类条目决定', async () => {
    const t = await entryTypes(deps, 'cn')
    expect(t.map((x) => x.prop)).toEqual(['spell', 'deity'])
    expect(t[0].starts).toEqual({ blank: true, template: true, existing: 5, convert: ['spell'], json: true })
    expect(t[1].starts).toEqual({ blank: true, template: false, existing: 0, convert: [], json: true })
  })
})

describe('blankEntry（B6）', () => {
  it('只放必填字段（不放来源），按类型给空值；几种写法 / 套组的先不放（§16.10 2b：表单按官方最常用的写法显示）', async () => {
    const b = await blankEntry('cn', 'spell')
    expect(Object.keys(b!).sort()).toEqual(['duration', 'entries', 'level', 'name', 'school', 'time'])
    expect(b).toMatchObject({ name: '', level: 0, time: [], entries: [] })
  })
  it('结构定义不收的类别：null', async () => {
    expect(await blankEntry('cn', 'notInSchema')).toBeNull()
  })
})

describe('草稿（B7）', () => {
  let db: LibraryDatabase
  let manage: ManageStore
  beforeEach(() => { db = new LibraryDatabase(`test-draft-${Math.random()}`); manage = new ManageStore(db) })
  afterEach(async () => { db.close(); await db.delete() })

  it('存 → 同键再存只留最新；改自己的条目键固定；新条目每次新开', async () => {
    const k = await saveDraft(manage, { codeSet: 'cn', prop: 'spell', s: { name: 'a' }, target: { kind: 'mine', uniqueId: 'u1' } })
    expect(k).toBe('cn|spell|mine:u1')
    await saveDraft(manage, { codeSet: 'cn', prop: 'spell', s: { name: 'b' }, target: { kind: 'mine', uniqueId: 'u1' } })
    const n1 = await saveDraft(manage, { codeSet: 'cn', prop: 'spell', s: { name: 'c' }, target: { kind: 'new', pack: 'P' } })
    const n2 = await saveDraft(manage, { codeSet: 'cn', prop: 'spell', s: { name: 'd' }, target: { kind: 'new', pack: 'P' } })
    expect(n1).not.toBe(n2)
    const list = await listDrafts(manage, 'cn')
    expect(list.length).toBe(3)
    expect((await manage.draft(k))?.s).toEqual({ name: 'b' })
    expect((await manage.draft(k))?.m).toMatchObject({ isModified: true, isPersisted: false })
    await manage.putDraft(k, null)
    expect(await manage.draft(k)).toBeNull()
  })
  it('结构定义不收的类别、不是对象：拒绝', async () => {
    await expect(saveDraft(manage, { codeSet: 'cn', prop: 'notInSchema', s: {}, target: { kind: 'new', pack: null } })).rejects.toThrow('不收这一类')
    await expect(saveDraft(manage, { codeSet: 'cn', prop: 'spell', s: [] as never, target: { kind: 'new', pack: null } })).rejects.toThrow('JSON 对象')
  })
})

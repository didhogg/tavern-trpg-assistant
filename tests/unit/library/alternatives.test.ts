import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { altsKey, buildAlternatives, type AltIndex } from '../../../src/library/alternatives'
import { LibraryDatabase } from '../../../src/library/db'
import { parsedKey } from '../../../src/library/install'
import type { AuthorFrame } from '../../../src/library/runtime/host'
import type { ParsedProp } from '../../../src/library/runtime/frame/commands'
import { getSource } from '../../../src/library/sources'

// 假小窗：作者函数本身在 e2e（tests/e2e/library/p3-1.mjs）里用真程序测
function fakeFrame(answers: Record<string, (...args: unknown[]) => unknown>, onClose?: () => void): AuthorFrame {
  return {
    codeSet: 'cn', frame: null as unknown as HTMLIFrameElement, ready: null as unknown as AuthorFrame['ready'], failures: [],
    call: (async (fn: string, ...args: unknown[]) => {
      const a = answers[fn]
      if (!a) throw new Error(`假小窗没有 ${fn}`)
      return a(...args)
    }) as AuthorFrame['call'],
    close: () => onClose?.(),
  }
}

const doc = (id: string, t: number, body: unknown) => ({ head: { docIdLocal: id, filename: `${id}.json`, timeAdded: t }, body })

let db: LibraryDatabase
beforeEach(async () => {
  db = new LibraryDatabase(`test-alts-${Math.random()}`)
  // 官方有火球术；自制解析结果（作者合并后）里有两个包撞编号的探路飞弹（后装的乙赢了）
  await db.derived.put({ key: parsedKey('cn-official', 'spell'), fingerprint: 'x', value: { items: [{ name: '火球术' }], hashes: ['fireball_phb'], sources: ['PHB'] }, savedAt: 0 })
  await db.derived.put({ key: parsedKey('cn-brew', 'spell'), fingerprint: 'brew', value: { items: [{ v: '乙' }, { v: '新' }], hashes: ['probe_a', 'new_c'], sources: ['A', 'C'] }, savedAt: 0 })
  await db.kv.put({ scope: 'cn', key: 'HOMEBREW_2_STORAGE', value: [doc('甲', 1, { _meta: { sources: [{ json: 'A' }] } }), doc('乙', 2, { _meta: { sources: [{ json: 'B' }] } }), doc('丙', 3, { _meta: { sources: [{ json: 'C' }], dependencies: { spell: ['A'] } } })] })
  await db.kv.put({ scope: 'cn', key: 'OTHER', value: 1 })
})
afterEach(async () => { await db.delete() })

describe('buildAlternatives', () => {
  it('和官方撞：官方是原件，自制版挂备选；自制之间撞：先装的是原件；隔离范围用完删掉', async () => {
    const isolated: Array<{ scope: string; docs: string[]; wants: unknown }> = []
    const index = await buildAlternatives({
      source: getSource('cn-brew'),
      db,
      frame: fakeFrame({
        brewDocIndex: () => [
          { docIdLocal: '甲', filename: '甲.json', timeAdded: 1, order: 1, isEditable: false, props: { spell: ['probe_a'] } },
          { docIdLocal: '乙', filename: '乙.json', timeAdded: 2, order: 2, isEditable: false, props: { spell: ['probe_a', 'fireball_phb'] } },
          { docIdLocal: '丙', filename: '丙.json', timeAdded: 3, order: 3, isEditable: false, props: { spell: ['new_c'] } },
        ],
      }),
      openFrameIn: async (scope) => {
        const docs = ((await db.kv.get([scope, 'HOMEBREW_2_STORAGE']))?.value as Array<{ head: { docIdLocal: string } }>).map((d) => d.head.docIdLocal)
        expect((await db.kv.get([scope, 'OTHER']))?.value).toBe(1)
        return fakeFrame({
          brewItemsByHash: (wants) => {
            isolated.push({ scope, docs, wants })
            const who = docs.at(-1)
            return Object.fromEntries((wants as Array<{ prop: string; hash: string }>).map((w) => [`${w.prop}|${w.hash}`, { v: who, hash: w.hash }]))
          },
        })
      },
    })
    expect(Object.keys(index.targets).sort()).toEqual(['cn-brew|spell|probe_a', 'cn-official|spell|fireball_phb'])
    const fb = index.targets['cn-official|spell|fireball_phb']
    expect(fb).toMatchObject({ base: 'official', source: 'PHB', alts: [{ altId: 'doc:乙', kind: 'collision', filename: '乙.json', item: { v: '乙', hash: 'fireball_phb' } }] })
    const pa = index.targets['cn-brew|spell|probe_a']
    expect(pa).toMatchObject({ base: '甲', source: 'A', alts: [{ altId: 'doc:乙', item: { v: '乙' } }] })
    // 自制解析结果里撞编号的那条换回先装的甲
    const p = (await db.derived.get(parsedKey('cn-brew', 'spell')))!.value as ParsedProp
    expect(p.items[p.hashes.indexOf('probe_a')]).toEqual({ v: '甲', hash: 'probe_a' })
    // 每个包单独隔离（被测的包放最后）；用完删掉
    expect(new Set(isolated.map((i) => i.docs.at(-1)))).toEqual(new Set(['甲', '乙']))
    expect(await db.kv.where('scope').notEqual('cn').count()).toBe(0)
    expect(((await db.derived.get(altsKey('cn-brew')))!.value as AltIndex).errors).toEqual([])
  })

  it('没有同编号：不开隔离小窗，备选表为空', async () => {
    const index = await buildAlternatives({
      source: getSource('cn-brew'), db,
      frame: fakeFrame({ brewDocIndex: () => [{ docIdLocal: '丙', filename: '丙.json', timeAdded: 3, order: 3, isEditable: false, props: { spell: ['new_c'] } }] }),
      openFrameIn: async () => { throw new Error('不该开') },
    })
    expect(index.targets).toEqual({})
  })
})

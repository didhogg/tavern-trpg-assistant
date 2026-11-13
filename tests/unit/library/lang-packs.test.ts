// P5.5 收尾 C1（根因 A）：某种语言的官方资料没装 → 开作者小窗那道门统一报 OfficialMissingError；
// 列清单的地方（custom.packs）当作空的；我的库只列另一种语言的包（不再整个读不出来）。
import { describe, expect, it } from 'vitest'
import { BilingualLibrary } from '../../../src/library/custom-lang'
import { emptyIfMissing, isOfficialMissing, OfficialMissingError } from '../../../src/library/official-missing'

const zhPack = { id: 'p55', docIdLocal: 'zh-doc', sources: ['P55'] }
const enPack = { id: 'p55', docIdLocal: 'en-doc', sources: ['P55'] }

describe('没装官方资料的那道门', () => {
  it('报错写明哪种语言（名字来自资料集登记表），认得出这一种错', () => {
    const e = new OfficialMissingError('en')
    expect(e.message).toMatch(/^English官方资料没装/)
    expect(isOfficialMissing(e)).toBe(true)
    expect(isOfficialMissing(new Error('别的错'))).toBe(false)
  })
  it('列清单：没装当作空的，别的错照常抛', async () => {
    expect(await emptyIfMissing(async () => { throw new OfficialMissingError('cn') })).toEqual([])
    await expect(emptyIfMissing(async () => { throw new Error('坏了') })).rejects.toThrow('坏了')
  })
})

function make(installed: Record<string, boolean>) {
  let paired = 0
  // custom.packs 自己走 emptyIfMissing：没装给空
  const custom = { packs: async (cs: string) => (installed[cs] ? [cs === 'en' ? enPack : zhPack] : []) }
  const pairs = { installed: async () => { paired++; return [{ status: 'paired', zh: { docIdLocal: 'zh-doc' }, en: { docIdLocal: 'en-doc' } }] } }
  return { b: new BilingualLibrary(custom as never, {} as never, pairs as never, {} as never), paired: () => paired }
}

describe('我的库配对：某种语言没装', () => {
  it('两种都装了：配成一行', async () => {
    const { b } = make({ cn: true, en: true })
    expect(await b.packs()).toEqual([{ id: 'p55', zh: zhPack, en: enPack }])
  })
  it('只装了中文：只列中文那一边，不去配对', async () => {
    const { b, paired } = make({ cn: true, en: false })
    expect(await b.packs()).toEqual([{ id: 'p55', zh: zhPack, en: null }])
    expect(paired()).toBe(0)
  })
  it('只装了英文：只列英文那一边', async () => {
    const { b } = make({ cn: false, en: true })
    expect(await b.packs()).toEqual([{ id: 'p55', zh: null, en: enPack }])
  })
})

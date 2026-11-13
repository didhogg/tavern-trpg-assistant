// P5.5 §16.7 第 1 条：某种语言的官方资料没装时，我的库只列另一种语言的包（不再整个读不出来）。
import { describe, expect, it } from 'vitest'
import { BilingualLibrary } from '../../../src/library/custom-lang'

const zhPack = { id: 'p55', docIdLocal: 'zh-doc', sources: ['P55'] }
const enPack = { id: 'p55', docIdLocal: 'en-doc', sources: ['P55'] }

function make(installed: Record<string, boolean>) {
  const read: string[] = []
  const custom = {
    packs: async (cs: string) => {
      read.push(cs)
      if (!installed[cs]) throw new Error('文件不存在 gendata-tag-redirects.json')
      return [cs === 'en' ? enPack : zhPack]
    },
  }
  const lib = { officialInstalled: async (cs: string) => !!installed[cs] }
  const pairs = { installed: async () => [{ status: 'paired', zh: { docIdLocal: 'zh-doc' }, en: { docIdLocal: 'en-doc' } }] }
  return { b: new BilingualLibrary(custom as never, lib as never, pairs as never, {} as never), read }
}

describe('我的库配对：某种语言没装', () => {
  it('两种都装了：配成一行', async () => {
    const { b } = make({ cn: true, en: true })
    expect(await b.packs()).toEqual([{ id: 'p55', zh: zhPack, en: enPack }])
  })

  it('只装了中文：只列中文那一边，不去读英文', async () => {
    const { b, read } = make({ cn: true, en: false })
    expect(await b.packs()).toEqual([{ id: 'p55', zh: zhPack, en: null }])
    expect(read).toEqual(['cn'])
  })

  it('只装了英文：只列英文那一边', async () => {
    const { b } = make({ cn: false, en: true })
    expect(await b.packs()).toEqual([{ id: 'p55', zh: null, en: enPack }])
  })
})

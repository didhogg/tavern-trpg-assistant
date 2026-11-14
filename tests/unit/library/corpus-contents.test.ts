import { describe, expect, it } from 'vitest'
import { chaptersWithoutName, corpusContents } from '../../../src/library/corpus-contents'

const chapter = (name: string, ...subs: unknown[]) => ({ type: 'section', name, entries: subs })
const sub = (name: string, ...entries: unknown[]) => ({ type: 'entries', name, entries })

describe('corpusContents', () => {
  it('新建：每章一项，小节 = 直接下一层有名字的块', () => {
    const data = [chapter('前言', '一段话'), chapter('第一章', sub('城镇', sub('酒馆')), '文字', sub('野外'))]
    expect(corpusContents(data)).toEqual([{ name: '前言' }, { name: '第一章', headers: ['城镇', '野外'] }])
  })

  it('已有的章按章名对上：保留原来的小节和序号，去掉正文里找不到的', () => {
    const before = [{ name: '第一章', ordinal: { type: 'chapter', identifier: 1 }, headers: ['酒馆', { header: '野外', depth: 1 }, '已删掉'] }]
    const data = [chapter('第一章', sub('城镇', sub('酒馆')), sub('野外')), chapter('新的一章', sub('小节'))]
    expect(corpusContents(data, before)).toEqual([
      { name: '第一章', ordinal: { type: 'chapter', identifier: 1 }, headers: ['酒馆', { header: '野外', depth: 1 }] },
      { name: '新的一章', headers: ['小节'] },
    ])
  })

  it('原来的小节全都找不到时不留空的小节表', () => {
    expect(corpusContents([chapter('第一章')], [{ name: '第一章', headers: ['旧的'] }])).toEqual([{ name: '第一章' }])
  })

  it('找出没有章名的章', () => {
    expect(chaptersWithoutName([chapter('有'), { type: 'section', entries: [] }, '纯文字', chapter('  ')])).toEqual([2, 3, 4])
  })
})

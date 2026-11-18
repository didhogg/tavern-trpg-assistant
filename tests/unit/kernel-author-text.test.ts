// 对外只批量取字：不同来源共用一次作者命令；不随种族、职业、物品增加接线口。
import { describe, expect, it, vi } from 'vitest'
import { TextService, type TextQuery } from '../../src/library/texts'

const requests: TextQuery[] = [
  { source: 'author', path: ['Renderer', 'generic', 'label'] },
  { source: 'value', key: 'gp', group: ['gp', 'sp'] },
  { source: 'proficiency', key: 'anyArtisansTool', count: 1 },
  { source: 'requirement', raw: [{ level: 1 }] },
  { source: 'system', key: 'DND5E.Feat' },
]

describe('统一批量取字', () => {
  it('全部作者来源只发一次命令，语言包批量读取，结果按原顺序回填', async () => {
    const call = vi.fn().mockResolvedValue(['分组', '金币', '任意工匠工具', '等级1'])
    const system = vi.fn().mockResolvedValue(['专长'])
    const service = new TextService(async () => ({ call }), system)
    const reader = service.reader('batch-test')
    expect(await reader.resolve(requests)).toEqual(['分组', '金币', '任意工匠工具', '等级1', '专长'])
    expect(call).toHaveBeenCalledExactlyOnceWith('authorTexts', requests.slice(0, 4))
    expect(system).toHaveBeenCalledExactlyOnceWith('batch-test', ['DND5E.Feat'])
    await reader.resolve(requests)
    // 静态配置命中缓存；原始前置条件仍交作者渲染，不缓存旧房规。
    expect(call).toHaveBeenLastCalledWith('authorTexts', [requests[3]])
  })
  it('已有类别名调用仍走同一批量入口，保留作者类别解释', async () => {
    const call = vi.fn().mockResolvedValue(['法术', '物品'])
    const service = new TextService(async () => ({ call }), async () => [])
    expect(await service.values('category-test', [['spell', 'item']], 'category')).toEqual([{ spell: '法术', item: '物品' }])
    expect(call).toHaveBeenCalledExactlyOnceWith('authorTexts', [
      { source: 'value', key: 'spell', group: ['spell', 'item'], kind: 'category' },
      { source: 'value', key: 'item', group: ['spell', 'item'], kind: 'category' },
    ])
  })
})

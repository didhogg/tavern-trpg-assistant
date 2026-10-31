import { describe, expect, it } from 'vitest'
import { addRef, renderInline, type InlineContext } from '../../tools/data/markup/inline'

function context(): InlineContext {
  const index = { byTypeName: new Map(), byTypeNameSource: new Map() }
  addRef(index, { id: 'reward.test-reward.test', type: 'reward', name: '测试奖励', packId: 'dnd5e2014-phb' }, 'PHB')
  addRef(index, { id: 'hazard.trap-bear-trap.xge', type: 'hazard', name: '捕熊陷阱', packId: 'dnd5e2014-xge' }, 'XGE')
  return { index, book: 'PHB', ownPack: 'dnd5e2014-phb', allowed: new Set(['dnd5e2014-phb', 'dnd5e2014-srd', 'dnd5e2014-xge']), softRefs: { count: 0 }, missingTags: new Map() }
}

describe('R12 行内标签', () => {
  it('boon/trap/s 能解析，s 只留文字', () => {
    expect(renderInline('{@boon 测试奖励|PHB|奖励}', context())).toBe('{{ref:reward.test-reward.test|奖励}}')
    expect(renderInline('{@trap 捕熊陷阱|XGE|捕熊陷阱}', context())).toBe('{{ref:hazard.trap-bear-trap.xge|捕熊陷阱}}')
    expect(renderInline('{@s 删除线文字}', context())).toBe('删除线文字')
  })
})

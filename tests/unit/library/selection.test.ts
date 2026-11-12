// 勾选检查（P5-5 §13.1）：冒险正文要先有同一套官方资料；规则只在后端一份。
import { describe, expect, it } from 'vitest'
import { ADVENTURE_NEEDS_OFFICIAL, checkSelection } from '../../../src/library/selection'

const view = (installed: string[]) => ({ officialState: async (id: string) => (installed.includes(id) ? { status: 'installed' } : null) }) as never

describe('勾选检查', () => {
  it('官方资料装过：这套能下冒险；没装：不能，带原因', async () => {
    const c = await checkSelection(view(['cn-official']))
    expect(c.sets['cn-official']).toEqual({ adventures: true, reason: null })
    expect(c.sets['en-official']).toEqual({ adventures: false, reason: ADVENTURE_NEEDS_OFFICIAL })
  })
  it('没装但这次勾了这套的书：能勾冒险（向导会先等书下完）', async () => {
    const c = await checkSelection(view([]), { picks: [{ set: 'cn-official' }], adventures: [{ set: 'cn-official', id: 'LMoP' }] })
    expect(c.sets['cn-official'].adventures).toBe(true)
    expect(c.drop).toEqual([])
  })
  it('没装也没勾书：勾了的冒险列进 drop（界面取消勾选、开局拒绝）', async () => {
    const c = await checkSelection(view([]), { adventures: [{ set: 'cn-official', id: 'LMoP' }] })
    expect(c.drop).toEqual([{ set: 'cn-official', id: 'LMoP' }])
  })
  it('旧入口整套装：要装的数据集当成已勾', async () => {
    const c = await checkSelection(view([]), { wholeSets: ['cn-official'], adventures: [{ set: 'cn-official', id: 'LMoP' }] })
    expect(c.drop).toEqual([])
  })
})

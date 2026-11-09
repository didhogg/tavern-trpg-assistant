// 战役视图：战役 = 一棵存档树；父存档被删则孤儿当根，恢复后接回；数量由后端数好。
import { describe, expect, it } from 'vitest'
import { OWNER, OTHER_OWNER, setup } from '../helpers/harness'
import { withDb } from '../helpers/fixtures'

describe('getCampaignView', () => {
  it('根 + 分支：战役名取根存档名，当前存档带父指针，数量分得清', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const first = await campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', name: '龙金劫' })
      const b1 = await campaign.branch(OWNER.ownerKey, '分支一')
      const b2 = await campaign.branch(OWNER.ownerKey, '分支二')
      const view = await campaign.getCampaignView(OWNER.ownerKey, 'dnd5e2014')
      expect(view.name).toBe('龙金劫')
      expect(view.root?.id).toBe(first.save.id)
      expect(view.current).toMatchObject({ id: b2.save.id, parentId: b1.save.id })
      expect(view.branches.map((n) => n.id).sort()).toEqual([b1.save.id, b2.save.id].sort())
      expect(view.counts).toMatchObject({ tree: 3, thisCard: 3, allCards: 3, otherRules: 0 })
      // 改根存档名，战役名跟着变
      await campaign.renameSave(first.save.id, '龙金劫·新名')
      expect((await campaign.getCampaignView(OWNER.ownerKey, 'dnd5e2014')).name).toBe('龙金劫·新名')
    })
  })

  it('删掉父存档：子分支当根；恢复后接回；其他战役单独列出', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const first = await campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', name: '甲战役' })
      const b1 = await campaign.branch(OWNER.ownerKey, '甲的分支')
      const b2 = await campaign.branch(OWNER.ownerKey, '甲的分支的分支')
      await campaign.deleteSave(b1.save.id)
      let view = await campaign.getCampaignView(OWNER.ownerKey, 'dnd5e2014')
      expect(view.root?.id).toBe(b2.save.id) // 父（分支一）不在了 → 当根
      expect(view.name).toBe('甲的分支的分支')
      expect(view.counts.deleted).toBe(1)
      // 甲战役的根现在是孤零零的另一棵树
      expect(view.otherCampaigns.map((c) => c.root.id)).toEqual([first.save.id])
      await campaign.restoreSave(b1.save.id)
      view = await campaign.getCampaignView(OWNER.ownerKey, 'dnd5e2014')
      expect(view.root?.id).toBe(first.save.id)
      expect(view.otherCampaigns).toEqual([])
      expect(view.counts.deleted).toBe(0)
    })
  })

  it('同一张卡另开战役、别的卡的战役都列在“其他战役”；没有当前战役时只有列表', async () => {
    await withDb(async (db) => {
      const { campaign } = await setup(db)
      const a = await campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', name: '甲' })
      const b = await campaign.startNewCampaign({ ...OTHER_OWNER, ruleId: 'dnd5e2014', name: '乙' })
      const c = await campaign.startNewCampaign({ ...OWNER, ruleId: 'dnd5e2014', name: '丙' })
      const view = await campaign.getCampaignView(OWNER.ownerKey, 'dnd5e2014')
      expect(view.name).toBe('丙')
      expect(view.otherCampaigns.map((o) => [o.root.id, o.sameCard]).sort()).toEqual([[a.save.id, true], [b.save.id, false]].sort())
      expect(view.counts).toMatchObject({ thisCard: 2, allCards: 3, auto: 1 })
      const none = await campaign.getCampaignView('char:不存在.png', 'dnd5e2014')
      expect(none).toMatchObject({ name: null, root: null, current: null, branches: [] })
      expect(none.otherCampaigns).toHaveLength(3)
      expect(c.save.name).toBe('丙')
    })
  })
})

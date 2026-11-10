// P5-1 B-49：下载 / 装包后重读书架，必须按「现在的战役」读；以前传了 null，书架被读成「没有战役」，所有书显示为关。
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Services } from '../../src/core/services'
import { useCampaignStore } from '../../src/stores/campaign'
import { useLibViewStore } from '../../src/stores/libview'

const lib = { rule: 'dnd5e2014', codeSet: 'cn', include: [], exclude: [] }
function services(reads: string[]): Services {
  return {
    rules: { list: () => [{ id: 'dnd5e2014' }] },
    backend: {
      kernelSave: { read: async (k: string) => { reads.push(k); return { rule: 'dnd5e2014' } }, libraryOf: async () => lib },
      library: {
        service: { officialInstalled: async () => true },
        scoped: { shelf: async () => ({ groups: [], booksError: null, adventuresError: null }) },
        brewPacks: { list: async () => [] },
      },
    },
  } as unknown as Services
}

describe('libview.refresh（B-49）', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('有战役：按当前战役重读，书架保持「已绑定」', async () => {
    const campaign = useCampaignStore()
    campaign.owner = { ownerKey: 'k1' } as never
    campaign.workspace = {} as never
    const reads: string[] = []
    const store = useLibViewStore()
    await store.refresh(services(reads))
    expect(reads).toEqual(['k1'])
    expect(store.bound).toBe(true)
  })

  it('没有战役才是「没有战役」', async () => {
    const reads: string[] = []
    const store = useLibViewStore()
    await store.refresh(services(reads))
    expect(reads).toEqual([])
    expect(store.bound).toBe(false)
  })
})

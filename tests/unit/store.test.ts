import { readFileSync } from 'node:fs'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServices, type Services } from '../../src/core/services'
import { useCampaignStore } from '../../src/stores/campaign'
import { OWNER } from '../helpers/harness'
import { makeClock, makeEntries, makePack } from '../helpers/fixtures'
import { uuid } from '../../src/core/ids'

let services: Services

beforeEach(async () => {
  setActivePinia(createPinia())
  services = createServices({ dbName: `store-${uuid()}`, now: makeClock(), appVersion: '1.0.0' })
  await services.packs.installBuiltin(makePack({ id: 'dnd5e2014-core', name: '核心规则' }, makeEntries(2)))
})

afterEach(async () => {
  services.lock.stop()
  services.db.close()
  await services.db.delete()
  vi.useRealTimers()
})

describe('campaign store', () => {
  it('没有打开聊天时没有当前战役，写操作被拒绝', async () => {
    const store = useCampaignStore()
    await store.init(services, null)
    expect(store.ready).toBe(true)
    expect(store.hasCampaign).toBe(false)
    await expect(store.startNew({ ruleId: 'dnd5e2014', packIds: [], name: 'x' })).rejects.toThrow('请先在酒馆中打开一个聊天')
    expect(() => store.updateData((d) => d)).toThrow('还没有当前战役')
  })

  it('新存档 → 修改（内存立即变、存储延迟写）→ 保存；未保存状态随之变化', async () => {
    const store = useCampaignStore()
    await store.init(services, OWNER)
    await store.startNew({ ruleId: 'dnd5e2014', packIds: [], name: '龙金劫-2' })
    expect(store.hasCampaign && store.dirty).toBe(false)
    vi.useFakeTimers()
    store.updateData((d) => ({ ...d, gold: 3 }))
    expect(store.dirty).toBe(true)
    expect(store.workspace?.data.gold).toBe(3)
    expect((await services.campaign.getWorkspace(OWNER.ownerKey))?.data.gold).toBeUndefined() // 还没写入
    await vi.advanceTimersByTimeAsync(600)
    vi.useRealTimers()
    expect((await services.campaign.getWorkspace(OWNER.ownerKey))?.data.gold).toBe(3)
    expect(await store.save()).toBe(true)
    expect(store.dirty).toBe(false)
    expect(await store.save()).toBe(false)
  })

  it('保存、分支、读取前会先把内存中的改动写入存储（不丢改动）', async () => {
    const store = useCampaignStore()
    await store.init(services, OWNER)
    const first = await store.startNew({ ruleId: 'dnd5e2014', packIds: [], name: 'A' })
    store.updateData((d) => ({ ...d, n: 1 }))
    await store.branch('B')
    expect((await services.campaign.getSave(first.id))?.snapshot.n).toBeUndefined()
    store.updateData((d) => ({ ...d, n: 2 }))
    await store.load(first.id)
    expect(store.workspace?.data.n).toBeUndefined()
    const autos = await services.campaign.listAuto(OWNER.ownerKey, 'dnd5e2014')
    expect(autos[0].snapshot.n).toBe(2)
  })

  it('重新初始化时恢复已有的当前数据', async () => {
    const first = useCampaignStore()
    await first.init(services, OWNER)
    await first.startNew({ ruleId: 'dnd5e2014', packIds: [], name: 'A' })
    first.updateData((d) => ({ ...d, k: 'v' }))
    await first.flush()
    setActivePinia(createPinia())
    const second = useCampaignStore()
    await second.init(services, OWNER)
    expect(second.workspace?.data.k).toBe('v')
    expect(second.dirty).toBe(true)
  })

  it('只读窗口：所有写操作被拒绝，且不会写入存储', async () => {
    const store = useCampaignStore()
    await store.init(services, OWNER)
    await store.startNew({ ruleId: 'dnd5e2014', packIds: [], name: 'A' })
    store.readOnly = true
    expect(() => store.updateData((d) => ({ ...d, x: 1 }))).toThrow('此窗口为只读')
    await expect(store.save()).rejects.toThrow('此窗口为只读')
    await expect(store.branch()).rejects.toThrow('此窗口为只读')
    await store.flush()
    expect((await services.campaign.getWorkspace(OWNER.ownerKey))?.data.x).toBeUndefined()
  })
})

describe('版本号', () => {
  it('manifest、package.json 与打包注入的版本一致', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8')) as { version: string }
    const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8')) as { version: string }
    expect(manifest.version).toBe(pkg.version)
    expect(__APP_VERSION__).toBe(pkg.version)
  })
})

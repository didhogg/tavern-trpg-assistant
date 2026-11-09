// 开局入口：一次建好战役（存档里带绑好的内核与选书）；缺的资料 / 冒险后台下载，不等；下载完补版本记号。
import { describe, expect, it } from 'vitest'
import { KernelSaveService } from '../../src/core/saves/kernel'
import { CampaignStarter } from '../../src/core/start-campaign'
import { TrpgError } from '../../src/core/errors'
import type { TaskState } from '../../src/library/tasks'
import { OWNER, setup } from '../helpers/harness'
import { makeRegistry, withDb } from '../helpers/fixtures'

/** 假的【库】：下载任务由测试放行；装好后数据版本记号才有值。 */
function fakeLibrary() {
  const installed = new Set<string>()
  const pending = new Map<string, (s: TaskState['status']) => void>()
  const started: string[] = []
  const states = new Map<string, TaskState>()
  let seq = 0
  const begin = (kind: TaskState['kind'], set: string, item: string | null): string => {
    const id = `t${++seq}`
    started.push(`${kind}:${set}${item ? `/${item}` : ''}`)
    states.set(id, { id, kind, set, item, status: 'running', progress: { stage: 'x', done: 0, total: 0 }, error: null, result: null })
    return id
  }
  const waiters = new Map<string, Promise<TaskState>>()
  const tasks = {
    list: () => [...states.values()],
    startOfficial: (set: string) => { const id = begin('official', set, null); waiters.set(id, new Promise((ok) => pending.set(id, (st) => { const s = states.get(id) as TaskState; s.status = st; if (st === 'done') installed.add(set); ok({ ...s }) }))); return id },
    startAdventure: (set: string, item: string) => { const id = begin('adventure', set, item); waiters.set(id, Promise.resolve({ ...(states.get(id) as TaskState), status: 'done' })); return id },
    wait: (id: string) => waiters.get(id) as Promise<TaskState>,
  }
  return {
    installed, pending, started,
    library: {
      db: { sets: { get: async (id: string) => (installed.has(id) ? { id, status: 'installed' } : undefined) } },
      scoped: { activeOverrides: async () => [], scopes: async () => [], shelf: async () => [] },
      tasks,
      dataVersion: async () => ({ official: installed.size ? 'v1' : '', brews: {} }),
    },
  }
}

const INPUT = { ...OWNER, ruleId: 'dnd5e2014', name: '失落矿坑', codeSet: 'cn' }

async function build(db: Parameters<typeof setup>[0]) {
  const { campaign, clock } = await setup(db)
  const fake = fakeLibrary()
  const lib = fake.library as never as ConstructorParameters<typeof CampaignStarter>[0]['library']
  const kernelSave = new KernelSaveService({ db, campaign, rules: makeRegistry(), now: clock, checkRefs: async (refs) => refs.map((ref) => ({ ok: true, ref })), currentVersion: fake.library.dataVersion, currentOverrides: async () => [] })
  return { campaign, kernelSave, fake, starter: new CampaignStarter({ campaign, kernelSave, rules: makeRegistry(), library: lib }) }
}

describe('startCampaign', () => {
  it('资料没装：立刻返回，第一个存档里已有内核与选书；下载完补上版本记号，仍无未保存改动', async () => {
    await withDb(async (db) => {
      const { campaign, kernelSave, fake, starter } = await build(db)
      const r = await starter.startCampaign({ ...INPUT, library: { exclude: ['src:mm'] }, adventures: [{ set: 'cn-official', id: 'LMoP' }] })
      // 没等下载就回来了；中、英两套官方资料都已开始下，冒险排在中文资料之后
      expect(fake.started.sort()).toEqual(['official:cn-official', 'official:en-official'])
      expect(campaign.isDirty(r.workspace)).toBe(false)
      const saved = await campaign.getSave(r.save.id)
      expect(saved?.snapshot.kernel).toMatchObject({ rule: 'dnd5e2014', revision: 0, dataVersion: { official: '' }, library: { codeSet: 'cn', exclude: ['src:mm'] } })
      expect(saved?.snapshot.library).toMatchObject({ exclude: ['src:mm'] })
      // 放行下载
      for (const [id, done] of [...fake.pending]) { void id; done('done') }
      const { errors } = await r.finished
      expect(errors).toEqual([])
      expect(fake.started).toContain('adventure:cn-official/LMoP')
      expect((await kernelSave.read(OWNER.ownerKey))?.dataVersion.official).toBe('v1')
      const ws = await campaign.getWorkspace(OWNER.ownerKey)
      expect(ws && campaign.isDirty(ws)).toBe(false)
    })
  })

  it('下载失败：开局不受影响，错误在 finished 里；用户已动过的战役不补版本记号', async () => {
    await withDb(async (db) => {
      const { campaign, kernelSave, fake, starter } = await build(db)
      const r = await starter.startCampaign({ ...INPUT, adventures: [{ set: 'cn-official', id: 'LMoP' }] })
      await campaign.updateData(OWNER.ownerKey, (d) => ({ ...d, notes: '玩家先动手了' }))
      for (const done of fake.pending.values()) done('failed')
      const { errors } = await r.finished
      expect(errors.length).toBeGreaterThanOrEqual(3)
      expect(fake.started.some((s) => s.startsWith('adventure'))).toBe(false)
      expect((await kernelSave.read(OWNER.ownerKey))?.dataVersion.official).toBe('')
    })
  })

  it('资料已装好：不再下载官方；名字不合法或资料语言没登记：什么都不建', async () => {
    await withDb(async (db) => {
      const { campaign, fake, starter } = await build(db)
      fake.installed.add('cn-official'); fake.installed.add('en-official')
      const r = await starter.startCampaign(INPUT)
      expect(r.downloads).toEqual([])
      expect((await r.finished).errors).toEqual([])
      await expect(starter.startCampaign({ ...INPUT, ownerKey: 'char:乙.png', name: '' })).rejects.toBeInstanceOf(TrpgError)
      await expect(starter.startCampaign({ ...INPUT, ownerKey: 'char:乙.png', codeSet: 'xx' })).rejects.toThrow()
      expect(await campaign.getWorkspace('char:乙.png')).toBeNull()
    })
  })
})

describe('wizardOptions', () => {
  it('规则范围默认值、各语言资料状态；资料没装时书架来自书目入口', async () => {
    await withDb(async (db) => {
      const { fake, starter } = await build(db)
      const o = await starter.wizardOptions('dnd5e2014', 'cn')
      expect(o.rule.id).toBe('dnd5e2014')
      expect(o.defaultScopes.length).toBeGreaterThan(0)
      expect(o.library.scopes).toEqual(o.defaultScopes)
      expect(o.data.every((d) => !d.installed)).toBe(true)
      expect(o.shelf).toEqual([])
      expect(o.shelfError).toBeNull()
      fake.installed.add('cn-official')
      expect((await starter.wizardOptions('dnd5e2014', 'cn')).data.find((d) => d.codeSet === 'cn')?.installed).toBe(true)
    })
  })
})

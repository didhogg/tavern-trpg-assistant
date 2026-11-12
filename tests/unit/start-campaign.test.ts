// 开局入口：一次建好战役（存档里带绑好的内核与选书）；缺的资料 / 冒险后台下载，不等；下载完补版本记号。
import { PairedDownloads } from '../../src/core/paired-download'
import { describe, expect, it } from 'vitest'
import { KernelSaveService } from '../../src/core/saves/kernel'
import { CampaignStarter } from '../../src/core/start-campaign'
import { TrpgError } from '../../src/core/errors'
import type { TaskState } from '../../src/library/tasks'
import { OWNER, setup } from '../helpers/harness'
import { makeRegistry, withDb } from '../helpers/fixtures'
import { createRuleRegistry } from '../../src/rules'

/** 假的【库】：下载任务由测试放行；装好后数据版本记号才有值。 */
function fakeLibrary() {
  const installed = new Set<string>()
  const recorded = new Map<string, string>() // 库里记的非 installed 状态（downloading / cancelled / failed …）
  const lists = new Map<string, Record<string, { sha: string; size: number }>>()
  const running = new Set<string>() // 有任务在跑的数据集
  const pending = new Map<string, (s: TaskState['status']) => void>()
  const started: string[] = []
  const officialOpts: Array<{ set: string; opts: unknown }> = []
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
    list: () => [...states.values(), ...[...running].map((set) => ({ id: `r-${set}`, kind: 'official', set, item: null, status: 'running', progress: { stage: 'download', done: 1, total: 2 }, error: null, result: null }))],
    startOfficial: (set: string, opts: unknown = {}) => { officialOpts.push({ set, opts }); const id = begin('official', set, null); waiters.set(id, new Promise((ok) => pending.set(id, (st) => { const s = states.get(id) as TaskState; s.status = st; if (st === 'done') installed.add(set); ok({ ...s }) }))); return id },
    startAdventure: (set: string, item: string) => { const id = begin('adventure', set, item); waiters.set(id, Promise.resolve({ ...(states.get(id) as TaskState), status: 'done' })); return id },
    wait: (id: string) => waiters.get(id) as Promise<TaskState>,
  }
  return {
    installed, pending, started, recorded, lists, running, officialOpts,
    library: {
      db: { sets: { get: async (id: string) => (installed.has(id) ? { id, status: 'installed' } : recorded.has(id) ? { id, status: recorded.get(id) } : undefined) } },
      files: { cachedFileList: async (s: { id: string }) => lists.get(s.id) ?? null },
      directory: {},
      scoped: { activeOverrides: async () => [], scopes: async () => [], shelf: async () => ({ groups: [], booksError: null, adventuresError: null }) },
      tasks,
      // 下载入口用真的（中英一起的规则），任务 / 安装状态用上面的假的；书目取不到 → 按同编号配
      downloads: new PairedDownloads({
        startOfficial: tasks.startOfficial, startAdventure: tasks.startAdventure,
        officialState: async (id: string) => (installed.has(id) ? { id, status: 'installed', commit: 'c', sources: null, books: null, adventures: [] } : null) as never,
        directoryOf: async () => null, brewCatalog: async () => ({ rows: [] }), brewAddUrl: async () => ({ value: [] }), brewInstallSources: async () => ({}) as never, brewInstalledUrls: async () => new Set<string>(),
      }),
      revisions: { published: async () => ({ officialState: async (id: string) => installed.has(id) ? { id, status: 'installed', commit: 'c', sources: null, books: null, adventures: null } : recorded.has(id) ? { id, status: 'missing', commit: 'c', sources: [], books: [], adventures: [] } : null }) },
      dataVersion: async () => ({ official: installed.size ? 'v1' : '', brews: {} }),
    },
  }
}

const INPUT = { ...OWNER, ruleId: 'dnd5e2014', name: '失落矿坑', codeSet: 'cn' }

async function build(db: Parameters<typeof setup>[0]) {
  const core = { status: { ok: true, system: 'dnd5e', total: 23, missing: [] as string[] } }
  const { campaign, clock } = await setup(db)
  const fake = fakeLibrary()
  const lib = fake.library as never as ConstructorParameters<typeof CampaignStarter>[0]['library']
  const kernelSave = new KernelSaveService({ db, campaign, rules: makeRegistry(), now: clock, checkRefs: async (refs) => refs.map((ref) => ({ ok: true, ref })), currentVersion: fake.library.dataVersion, currentOverrides: async () => [] })
  const make = (rules = makeRegistry()) => new CampaignStarter({ campaign, kernelSave, rules, corePacks: async () => core.status, library: lib })
  return { campaign, kernelSave, fake, core, make, starter: make() }
}

describe('startCampaign：按勾选的书下载（P5-5 §13 B3）', () => {
  it('勾选的书号 / 来源配到这场战役要的每个数据集（中文 + 结算内核要的英文），前端只给一份', async () => {
    await withDb(async (db) => {
      const { fake, starter } = await build(db)
      await starter.startCampaign({ ...INPUT, picks: [{ set: 'cn-official', book: 'PHB', source: 'PHB' }, { set: 'cn-official', book: 'XGE', source: 'XGE' }] })
      expect(fake.officialOpts).toEqual([
        { set: 'cn-official', opts: { books: ['PHB', 'XGE'], sources: ['PHB', 'XGE'] } },
        { set: 'en-official', opts: { books: ['PHB', 'XGE'], sources: ['PHB', 'XGE'] } },
      ])
    })
  })
  it('没有书号的来源行（如 Generic）：只按来源装，绝不变成整套', async () => {
    await withDb(async (db) => {
      const { fake, starter } = await build(db)
      await starter.startCampaign({ ...INPUT, picks: [{ set: 'cn-official', book: null, source: 'Generic' }] })
      expect(fake.officialOpts.map((x) => x.opts)).toEqual([{ books: [], sources: ['Generic'] }, { books: [], sources: ['Generic'] }])
    })
  })
  it('勾了空：这次不下载官方资料；不传：旧入口照旧整套装', async () => {
    await withDb(async (db) => {
      const { fake, starter } = await build(db)
      const r = await starter.startCampaign({ ...INPUT, picks: [] })
      expect(r.downloads).toEqual([])
      expect(fake.officialOpts).toEqual([])
      await starter.startCampaign({ ...INPUT, ownerKey: 'char:乙.png' })
      expect(fake.officialOpts.map((x) => x.opts)).toEqual([{}, {}])
    })
  })
  it('冒险要先有官方资料：没装也没勾书却勾了冒险 → 开局前就拒绝（E_NEEDS_OFFICIAL），什么都不建', async () => {
    await withDb(async (db) => {
      const { campaign, fake, starter } = await build(db)
      await expect(starter.startCampaign({ ...INPUT, picks: [], adventures: [{ set: 'cn-official', id: 'LMoP' }] })).rejects.toMatchObject({ code: 'E_NEEDS_OFFICIAL' })
      expect(await campaign.getWorkspace(OWNER.ownerKey)).toBeFalsy()
      expect(fake.started).toEqual([])
      // 勾了同一套的书：可以，冒险排在书后面
      const r = await starter.startCampaign({ ...INPUT, picks: [{ set: 'cn-official', book: 'LMoP', source: 'LMoP' }], adventures: [{ set: 'cn-official', id: 'LMoP' }] })
      expect(r.downloads.map((d) => d.kind)).toEqual(['official', 'official'])
    })
  })
  it('只能勾官方资料：混进自制包的勾选直接拒绝，不建战役', async () => {
    await withDb(async (db) => {
      const { campaign, starter } = await build(db)
      await expect(starter.startCampaign({ ...INPUT, picks: [{ set: 'cn-brew', book: null, source: 'X' }] })).rejects.toBeInstanceOf(TrpgError)
      expect(await campaign.getWorkspace(OWNER.ownerKey)).toBeFalsy()
    })
  })
})

describe('startCampaign：结算还没接入的规则版本（P5-5 §13 B2）', () => {
  it('5.5e：书架照样能读（资料可以下载），开局被拒绝，什么都不建', async () => {
    await withDb(async (db) => {
      const { campaign, make } = await build(db)
      const starter = make(createRuleRegistry())
      const opts = await starter.wizardOptions('dnd5e2024', 'cn')
      expect(opts.rule).toMatchObject({ id: 'dnd5e2024', versionLabel: '5.5e', ready: false })
      expect(opts.defaultScopes).toEqual(['5e2024'])
      await expect(starter.startCampaign({ ...INPUT, ruleId: 'dnd5e2024' })).rejects.toMatchObject({ code: 'E_RULE_UNSUPPORTED' })
      expect(await campaign.getWorkspace(OWNER.ownerKey)).toBeFalsy()
      expect((await starter.wizardOptions('dnd5e2014', 'cn')).rule).toMatchObject({ versionLabel: '5e', ready: true })
    })
  })
})

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
      expect(fake.started).toContain('adventure:en-official/LMoP') // 冒险正文中英一起（两套官方资料都装好以后）
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
      expect(o.adventureError).toBeNull()
      expect(o.blockingError).toBeNull()
      expect(o.catalogUnavailable).toBe(false)
      fake.installed.add('cn-official')
      expect((await starter.wizardOptions('dnd5e2014', 'cn')).data.find((d) => d.codeSet === 'cn')?.installed).toBe(true)
    })
  })
})

describe('dataStatus（BE-8）', () => {
  it('没装 / 正在装 / 装了一半（刷新后任务没了）/ 已装好，各自认得出', async () => {
    await withDb(async (db) => {
      const { fake, starter } = await build(db)
      const by = async () => Object.fromEntries((await starter.dataStatus()).map((d) => [d.setId, d]))
      let d = await by()
      expect(d['cn-official']).toMatchObject({ status: 'none', installed: false, recordStatus: null, downloadBytes: null, task: null })

      fake.running.add('cn-official')                       // 有任务在跑
      expect((await by())['cn-official']).toMatchObject({ status: 'running', task: { set: 'cn-official' } })
      fake.running.clear()

      for (const raw of ['downloading', 'parsing', 'cancelled', 'failed']) { // 没有任务在跑，库里却记着没装完
        fake.recorded.set('cn-official', raw)
        d = await by()
        expect(d['cn-official']).toMatchObject({ status: 'incomplete', installed: false, recordStatus: raw, task: null })
      }
      fake.installed.add('en-official')
      expect((await by())['en-official']).toMatchObject({ status: 'installed', installed: true, recordStatus: 'installed' })
    })
  })

  it('下载大小来自已缓存的文件清单，按作者预载规则算（冒险正文不计）；没缓存是 null，不联网', async () => {
    await withDb(async (db) => {
      const { fake, starter } = await build(db)
      fake.lists.set('cn-official', { 'data/books.json': { sha: 'a', size: 100 }, 'data/spells/spells-phb.json': { sha: 'b', size: 250 }, 'data/adventure/adventure-lmop.json': { sha: 'c', size: 9999 }, 'js/utils.js': { sha: 'd', size: 7 } })
      const d = Object.fromEntries((await starter.dataStatus()).map((x) => [x.setId, x]))
      expect(d['cn-official'].downloadBytes).toBe(350)
      expect(d['en-official'].downloadBytes).toBeNull()
    })
  })

  it('wizardOptions 带上这些状态', async () => {
    await withDb(async (db) => {
      const { fake, starter } = await build(db)
      fake.recorded.set('cn-official', 'cancelled')
      const o = await starter.wizardOptions('dnd5e2014', 'cn')
      expect(o.data.find((x) => x.setId === 'cn-official')).toMatchObject({ status: 'incomplete', recordStatus: 'cancelled' })
    })
  })
})

describe('唯一的资料阻断点：随插件自带的核心 SRD 资料包', () => {
  it('缺了：向导给出原因、开局被拒绝且什么都不建；补回后恢复', async () => {
    await withDb(async (db) => {
      const { campaign, core, starter } = await build(db)
      core.status = { ok: false, system: 'dnd5e', total: 23, missing: ['packs/dnd5e.classes.json', 'packs/dnd5e.spells.json', 'packs/dnd5e.items.json', 'packs/dnd5e.races.json'] }
      const o = await starter.wizardOptions('dnd5e2014', 'cn')
      expect(o.blockingError).toMatch(/核心 SRD.*packs\/dnd5e\.classes\.json.*等 4 个/)
      await expect(starter.startCampaign(INPUT)).rejects.toMatchObject({ code: 'E_CORE_MISSING' })
      expect(await campaign.getWorkspace(OWNER.ownerKey)).toBeNull()
      core.status = { ok: true, system: 'dnd5e', total: 23, missing: [] }
      expect((await starter.wizardOptions('dnd5e2014', 'cn')).blockingError).toBeNull()
    })
  })

  it('书目 / 冒险目录取不到只是提示，不挡：blockingError 仍为空', async () => {
    await withDb(async (db) => {
      const { fake, starter } = await build(db)
      fake.library.scoped.shelf = (async () => ({ groups: [], booksError: '官方书目（cn）取不到：断网', adventuresError: '官方冒险目录（cn）取不到：断网' })) as never
      const o = await starter.wizardOptions('dnd5e2014', 'cn')
      expect(o).toMatchObject({ blockingError: null, catalogUnavailable: true })
      expect(o.shelfError).toMatch(/官方书目/)
      expect(o.adventureError).toMatch(/官方冒险目录/)
    })
  })
})

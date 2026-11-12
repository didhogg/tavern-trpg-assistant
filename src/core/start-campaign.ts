// P4 补后端：开局向导的后端入口（规则 → 资料 → 冒险 → 命名）。
//   wizardOptions   向导每一步要显示的东西（规则的范围、各语言资料装好没、书目与冒险）
//   startCampaign   一次建好战役：第一个存档里就带绑好的结算内核与选书设置；缺的官方资料、选的冒险在【库】里后台下载，
//                   不等它们——向导点完“开始冒险”马上返回，下载进度用 tasks 查
// 资料没装好时建的战役，数据版本记号是空的；下载完后若战役还没被动过（未改动、没人物），自动补上现在的版本记号并重存一次，
// 免得第一次读档就提示“资料换过版本”。
import type { LibraryDatabase } from '../library/db'
import type { BookDirectory } from '../library/directory'
import { DownloadEstimator, type DownloadEstimate, type EstimateOptions } from '../library/download-estimate'
import type { FileProvider } from '../library/files'
import { precachePlan } from '../library/plan'
import type { DownloadTasks, TaskState } from '../library/tasks'
import type { LibraryRevisionStore } from '../library/revision'
import type { ScopedLibrary } from '../library/scoped'
import type { ShelfGroup } from '../library/shelf'
import { defaultCampaignLibrary, ruleScopes, type CampaignLibrary, type ScopeDef } from '../library/scopes'
import { SOURCES, getSource, officialSourceOf } from '../library/sources'
import type { PairedDownloads } from './paired-download'
import { checkSelection, type SelectionCheck, type SelectionInput } from '../library/selection'
import { kernelCampaignSchema, kernelLibrarySchema, type KernelDataVersion } from '../schemas/kernel'
import type { Workspace, SaveSlot } from '../schemas/campaign'
import type { RuleRegistry } from '../rules/registry'
import type { CorePackStatus } from '../rules/kernel/core-pack'
import { TrpgError } from './errors'
import type { CampaignService, Owner } from './saves/campaign'
import { cleanName } from './saves/helpers'
import type { KernelSaveService } from './saves/kernel'

/** 存档里结算内核段的结构版本（探测与测试一直用 1）。 */
const KERNEL_SECTION_VERSION = 1

export interface StartCampaignDeps {
  campaign: CampaignService
  kernelSave: KernelSaveService
  rules: RuleRegistry
  /** 随插件自带的核心 SRD 资料包还在不在（rules/kernel/core-pack.ts）。 */
  corePacks: () => Promise<CorePackStatus>
  library: {
    db: LibraryDatabase
    files: FileProvider
    directory: BookDirectory
    scoped: ScopedLibrary
    tasks: DownloadTasks
    /** 冒险正文中英一起下（core/paired-download.ts）。 */
    downloads: Pick<PairedDownloads, 'adventure'>
    revisions: LibraryRevisionStore
    dataVersion: () => Promise<KernelDataVersion>
  }
}

/**
 * 向导勾选的一本官方书 / 一个来源（书架 CatalogRow 的 set / id / source）。
 * 书号和来源不分语言：后端按同一份勾选去配这场战役要的每个数据集（所选语言 + 结算内核要的英文），前端不用知道要下英文（P5-5 §13 B3）。
 * 没有书号的来源行（如 Generic）只按来源装，绝不当成整套。
 */
export interface OfficialPick { set: string; book: string | null; source: string }

/** 向导里用户能改的选书设置（其余由规则默认）。 */
export type LibraryChoice = Partial<Pick<CampaignLibrary, 'scopes' | 'include' | 'exclude' | 'choices'>>

/** none 没装过；running 正在装（有任务在跑）；incomplete 装了一半（下载 / 解析中断、被取消或失败，没有任务在跑，要"继续"）；installed 已装好。 */
export type DataStatus = 'none' | 'running' | 'incomplete' | 'installed'

export interface DataSetState {
  codeSet: string
  lang: string
  setId: string
  installed: boolean
  status: DataStatus
  /** 库里记的原始状态（downloading / parsing / cancelled / failed / installed），没记过为 null。 */
  recordStatus: string | null
  /** 整套要下载的字节数（作者预载规则算出的文件清单）；清单还没取过（没联过网）时为 null。 */
  downloadBytes: number | null
  /** 正在下载这套资料的任务（没有就是 null）。 */
  task: TaskState | null
}

export interface WizardOptions {
  rule: { id: string; name: string; familyName: string; versionLabel: string; ready: boolean }
  scopes: ScopeDef[]
  defaultScopes: string[]
  /** 各语言官方资料装好没；中文战役也需要英文资料（结算内核只认英文原件）。 */
  data: DataSetState[]
  /** 书目与冒险，按作者的分组表排好（核心 / 官方出版物 / 设定集…）；没装官方数据也能列，每行 downloaded 标有没有下。 */
  shelf: ShelfGroup[]
  /** 唯一的资料阻断点：随插件自带的核心 SRD 资料包缺了（用户删了 / 装坏了），[下一步]不可点，显示原因和[重试]；开局也会被拒绝。 */
  blockingError: string | null
  /** 书目文件取不到的原因（联网问题等）：不挡，和 adventureError 一起统一提示"当前拉取不到书目，请之后再去库里添加"。 */
  shelfError: string | null
  /** 冒险目录取不到的原因：同上，不挡。 */
  adventureError: string | null
  /** 自制包清单取不到的原因：只影响自制行，不遮住官方书架。 */
  brewError: string | null
  /** 书目或冒险目录任何一个没取到：界面据此显示统一提示（文案归界面）。 */
  catalogUnavailable: boolean
  library: CampaignLibrary
}

export interface StartCampaignInput extends Owner {
  ruleId: string
  name: string
  note?: string
  /** 资料语言（作者程序 cn / en）；向导按 wizardOptions.data 让用户选。 */
  codeSet: string
  library?: LibraryChoice
  /** 选了的冒险（catalog 里 kind = adventure 的行的 set + id）。 */
  adventures?: Array<{ set: string; id: string }>
  /** 勾选的官方书 / 来源（每个数据集各自配）；不传 = 旧入口，整套安装；传空数组 = 这次不下载官方资料。 */
  picks?: OfficialPick[]
}

export interface StartCampaignResult {
  workspace: Workspace
  save: SaveSlot
  /** 已经开始的下载任务（用 library.tasks.get / list 查进度）。 */
  downloads: Array<{ kind: 'official' | 'adventure'; set: string; item: string | null; taskId: string }>
  /** 后台收尾（等下载、补版本记号、开冒险下载）全部结束；不会 reject，出错放 errors。给测试和需要等的调用方。 */
  finished: Promise<{ errors: string[] }>
}

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

export class CampaignStarter {
  constructor(private readonly deps: StartCampaignDeps) {}

  private libraryOf(ruleId: string, codeSet: string, choice: LibraryChoice = {}): CampaignLibrary {
    const base = defaultCampaignLibrary(ruleId, codeSet)
    return kernelLibrarySchema.parse({
      ...base,
      scopes: choice.scopes ?? base.scopes,
      include: choice.include ?? base.include,
      exclude: choice.exclude ?? base.exclude,
      choices: choice.choices ?? base.choices,
    }) as CampaignLibrary
  }

  /** 结算内核需要英文官方原件，所以任何语言的战役都要英文资料。 */
  private neededSets(codeSet: string): string[] {
    const sets = new Set([officialSourceOf(codeSet).id, officialSourceOf('en').id])
    return [...sets]
  }

  /** 勾选 → 一个数据集要装的书号 / 来源（和下载页按书下载同一种写法）。 */
  private static selectionOf(picks: OfficialPick[]): { books: string[]; sources: string[] } {
    for (const p of picks) if (getSource(p.set).kind !== 'official') throw new TrpgError('E_BAD_CONTENT', `只能勾选官方资料：${p.set}`)
    const books = [...new Set(picks.flatMap((p) => (p.book ? [p.book] : [])))]
    return { books, sources: [...new Set(picks.map((p) => p.source))] }
  }

  /** 这个数据集已经装好了这些书 / 来源（来源不分大小写，和估算同一口径）。 */
  private async installed(setId: string, sel: { books: string[]; sources: string[] } | null): Promise<boolean> {
    const view = await this.deps.library.revisions.published()
    const state = await view.officialState(setId)
    if (state?.status !== 'installed') return false
    if (!sel) return true
    return (state.books === null || sel.books.every((b) => state.books!.includes(b)))
      && (state.sources === null || sel.sources.every((x) => state.sources!.some((y) => y.toLowerCase() === x.toLowerCase())))
  }

  private runningTask(setId: string): TaskState | null {
    return this.deps.library.tasks.list().find((t) => t.kind === 'official' && t.set === setId && t.status === 'running') ?? null
  }

  /**
   * 向导要写的"总下载约 xx MB"：资料（所选语言 + 结算内核要的英文，已装好的不算）+ 所选冒险。
   * 规则用作者离线设计的现成两条（plan.ts），与真正下载同一份计划。network = false 只看缓存，没算出来的是 null（界面写"正在计算下载文件大小"）。
   */
  estimateDownload(input: { codeSet: string; adventures?: Array<{ set: string; id: string }>; picks?: OfficialPick[] }, opts?: EstimateOptions): Promise<DownloadEstimate> {
    const { db, files, directory, revisions } = this.deps.library
    // 勾了空 = 不下载官方资料，只算冒险
    const sets = input.picks && !input.picks.length ? [] : this.neededSets(input.codeSet)
    const sel = input.picks?.length ? CampaignStarter.selectionOf(input.picks) : null
    const each = <T>(v: T): Record<string, T> => Object.fromEntries(sets.map((id) => [id, v]))
    return new DownloadEstimator({ db, files, directory, revisions }).estimate({
      sets, ...(sel ? { sources: each(sel.sources), books: each(sel.books) } : {}), adventures: input.adventures,
    }, opts)
  }

  /** 勾选检查（library/selection.ts）：哪套官方资料能下冒险、勾了但下不了的冒险。向导、下载页都问它，界面不自己判断。 */
  async checkSelection(input: SelectionInput = {}): Promise<SelectionCheck> {
    return checkSelection(await this.deps.library.revisions.published(), input)
  }

  /**
   * 各套官方资料的状态与大小（只读，不联网；首页 / 侧栏 / 向导都用它）。
   * 刷新页面后任务列表会清空，"装了一半"靠库里记的状态认出来（status = incomplete），界面据此提示并给"继续"。
   */
  async dataStatus(): Promise<DataSetState[]> {
    const { db, files, revisions } = this.deps.library
    const view = await revisions.published()
    const out: DataSetState[] = []
    for (const s of SOURCES.filter((it) => it.kind === 'official')) {
      const record = await db.sets.get(s.id)
      const state = await view.officialState(s.id)
      const recordStatus = record ? String(record.status) : null
      const task = this.runningTask(s.id)
      const status: DataStatus = task ? 'running' : state?.status === 'installed' ? 'installed' : recordStatus ? 'incomplete' : 'none'
      const list = await files.cachedFileList(s, view)
      out.push({ codeSet: s.codeSet, lang: s.lang, setId: s.id, installed: state?.status === 'installed', status, recordStatus, downloadBytes: list ? precachePlan(list).bytes : null, task })
    }
    return out
  }

  private coreMessage(core: CorePackStatus): string {
    const shown = core.missing.slice(0, 3).join('、') + (core.missing.length > 3 ? ` 等 ${core.missing.length} 个` : '')
    return `随插件自带的核心 SRD 规则资料不完整（缺 ${shown}），不能创建战役。请重新安装插件后重试。`
  }

  async wizardOptions(ruleId: string, codeSet: string, choice: LibraryChoice = {}): Promise<WizardOptions> {
    const rule = this.deps.rules.get(ruleId)
    if (!rule) throw new TrpgError('E_RULE_MISSING', `没有这套规则：${ruleId}`)
    // 还不能建战役的版本也照样给书架（资料可以看、可以下），界面据 rule.ready 灰掉开局
    const library = this.libraryOf(ruleId, codeSet, choice)
    const { scoped } = this.deps.library
    const r = await scoped.shelf(library).catch((e: unknown) => ({ groups: [] as ShelfGroup[], booksError: msg(e), adventuresError: null as string | null, brewError: null as string | null }))
    const shelf = r.groups
    const shelfError = r.booksError
    const adventureError = r.adventuresError
    const brewError = r.brewError
    const core = await this.deps.corePacks()
    const data = await this.dataStatus() // 书目步骤会顺带缓存文件清单，所以放在它后面才有下载大小
    return {
      rule: { id: rule.id, name: rule.name, familyName: rule.familyName, versionLabel: rule.versionLabel, ready: this.deps.rules.ready(rule.id) },
      scopes: await scoped.scopes(),
      defaultScopes: [...ruleScopes(ruleId).defaultScopes],
      data,
      shelf,
      blockingError: core.ok ? null : this.coreMessage(core),
      shelfError,
      adventureError,
      brewError,
      catalogUnavailable: !!(shelfError || adventureError),
      library,
    }
  }

  async startCampaign(input: StartCampaignInput): Promise<StartCampaignResult> {
    const { campaign, rules } = this.deps
    const { scoped, tasks, dataVersion } = this.deps.library
    const rule = rules.get(input.ruleId)
    if (!rule) throw new TrpgError('E_RULE_MISSING', `没有这套规则：${input.ruleId}`)
    if (!rules.ready(input.ruleId)) throw new TrpgError('E_RULE_UNSUPPORTED', `「${rule.name}」的结算规则还没接入，暂时不能建战役；这一版的资料可以先在【库】里下载。`)
    const name = cleanName(input.name)
    // 不传 = 旧入口整套装；勾了空 = 这次不下官方资料
    const sel = input.picks?.length ? CampaignStarter.selectionOf(input.picks) : null
    const skipOfficial = !!input.picks && !input.picks.length
    const core = await this.deps.corePacks()
    if (!core.ok) throw new TrpgError('E_CORE_MISSING', this.coreMessage(core))
    const needed = this.neededSets(input.codeSet) // 先验：资料语言没登记会在这里抛，不会留下半个战役
    // 冒险要先有同一套官方资料：开局前就查，下不了的直接拒绝，不先建战役再在后台失败
    const check = await this.checkSelection({ picks: input.picks, adventures: input.adventures, wholeSets: input.picks ? [] : needed })
    if (check.drop.length) throw new TrpgError('E_NEEDS_OFFICIAL', `${check.drop.map((a) => a.id).join('、')}：${check.sets[check.drop[0].set]?.reason ?? ''}`)
    const library = this.libraryOf(input.ruleId, input.codeSet, input.library)

    // 事务外先取版本记号与覆盖（用户数据库短事务里不能等【库】）
    const kernel = kernelCampaignSchema.parse({
      rule: input.ruleId, kernelVersion: KERNEL_SECTION_VERSION, library,
      dataVersion: await dataVersion(), overrides: await scoped.activeOverrides(), actors: [], revision: 0, undo: [],
    })
    const { workspace, save } = await campaign.startNewCampaign({
      ownerKey: input.ownerKey, ownerLabel: input.ownerLabel, ruleId: input.ruleId, name, note: input.note,
      initialData: { kernel, library: kernel.library },
    })

    // ---- 后台下载：开了就返回，不等 ----
    const downloads: StartCampaignResult['downloads'] = []
    const errors: string[] = []
    const waiting: Array<Promise<TaskState>> = []
    const officialTasks = new Map<string, string>()
    for (const setId of skipOfficial ? [] : needed) {
      if (await this.installed(setId, sel)) continue
      const taskId = tasks.startOfficial(setId, sel ? { books: sel.books, sources: sel.sources } : {})
      officialTasks.set(setId, taskId)
      downloads.push({ kind: 'official', set: setId, item: null, taskId })
      waiting.push(tasks.wait(taskId))
    }
    const adventureJobs: Array<Promise<void>> = []
    // 冒险正文中英一起下（library.downloads 按登记配另一种语言）：这本冒险两种语言的官方资料要是正在下，先等装完
    const startAdventure = async (pick: { set: string; id: string }): Promise<void> => {
      const r = await this.deps.library.downloads.adventure(pick.set, pick.id)
      for (const t of r.tasks) {
        downloads.push({ kind: 'adventure', set: t.setId, item: pick.id, taskId: t.taskId })
        const s = await tasks.wait(t.taskId)
        if (s.status !== 'done') errors.push(`冒险 ${pick.id}（${t.setId}）下载失败：${s.error ?? s.status}`)
      }
    }
    for (const pick of input.adventures ?? []) {
      const pair = getSource(pick.set).pair
      const before = [officialTasks.get(pick.set), pair ? officialTasks.get(pair) : undefined].filter((x): x is string => !!x)
      if (!before.length) { adventureJobs.push(startAdventure(pick)); continue }
      adventureJobs.push(Promise.all(before.map((id) => tasks.wait(id))).then((states) => {
        const self = states[0]
        if (officialTasks.get(pick.set) && self.status !== 'done') { errors.push(`冒险 ${pick.id} 没下载：${pick.set} 没装好（${self.error ?? self.status}）`); return }
        return startAdventure(pick)
      }))
    }

    const finished = (async (): Promise<{ errors: string[] }> => {
      try {
        for (const state of await Promise.all(waiting)) if (state.status !== 'done') errors.push(`${state.kind} ${state.set}${state.item ? `/${state.item}` : ''}：${state.error ?? state.status}`)
        await Promise.all(adventureJobs)
        if (officialTasks.size) await this.refreshFreshVersion(input.ownerKey, save.id)
      } catch (e) {
        errors.push(msg(e))
      }
      return { errors }
    })()
    return { workspace, save, downloads, finished }
  }

  /** 战役还是刚建好的样子（没改动、没人物、没改过结算）才补版本记号；用户已经动过就不碰，留给读档时的“资料换过版本”提示。 */
  private async refreshFreshVersion(ownerKey: string, saveId: string): Promise<void> {
    const { campaign, kernelSave } = this.deps
    const ws = await campaign.getWorkspace(ownerKey)
    if (!ws || ws.currentSaveId !== saveId || campaign.isDirty(ws)) return
    const kernel = await kernelSave.read(ownerKey)
    if (!kernel || kernel.revision !== 0 || kernel.actors.length || kernel.undo.length) return
    await kernelSave.save(ownerKey)
  }
}

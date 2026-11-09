// P4 补后端：开局向导的后端入口（规则 → 资料 → 冒险 → 命名）。
//   wizardOptions   向导每一步要显示的东西（规则的范围、各语言资料装好没、书目与冒险）
//   startCampaign   一次建好战役：第一个存档里就带绑好的结算内核与选书设置；缺的官方资料、选的冒险在【库】里后台下载，
//                   不等它们——向导点完“开始冒险”马上返回，下载进度用 tasks 查
// 资料没装好时建的战役，数据版本记号是空的；下载完后若战役还没被动过（未改动、没人物），自动补上现在的版本记号并重存一次，
// 免得第一次读档就提示“资料换过版本”。
import type { LibraryDatabase } from '../library/db'
import type { FileProvider } from '../library/files'
import { precachePlan } from '../library/plan'
import type { DownloadTasks, TaskState } from '../library/tasks'
import type { ScopedLibrary } from '../library/scoped'
import type { ShelfGroup } from '../library/shelf'
import { defaultCampaignLibrary, ruleScopes, type CampaignLibrary, type ScopeDef } from '../library/scopes'
import { SOURCES, officialSourceOf } from '../library/sources'
import { kernelCampaignSchema, kernelLibrarySchema, type KernelDataVersion } from '../schemas/kernel'
import type { Workspace, SaveSlot } from '../schemas/campaign'
import type { RuleRegistry } from '../rules/registry'
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
  library: {
    db: LibraryDatabase
    files: FileProvider
    scoped: ScopedLibrary
    tasks: DownloadTasks
    dataVersion: () => Promise<KernelDataVersion>
  }
}

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
  rule: { id: string; name: string }
  scopes: ScopeDef[]
  defaultScopes: string[]
  /** 各语言官方资料装好没；中文战役也需要英文资料（结算内核只认英文原件）。 */
  data: DataSetState[]
  /** 书目与冒险，按作者的分组表排好（核心 / 官方出版物 / 设定集…）；没装官方数据也能列，每行 downloaded 标有没有下。 */
  shelf: ShelfGroup[]
  /** 书目取不到（联网失败等）的原因；有值时 shelf 为空，向导显示原因和重试，不卡住。 */
  shelfError: string | null
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

  private async installed(setId: string): Promise<boolean> {
    return (await this.deps.library.db.sets.get(setId))?.status === 'installed'
  }

  private runningTask(setId: string): TaskState | null {
    return this.deps.library.tasks.list().find((t) => t.kind === 'official' && t.set === setId && t.status === 'running') ?? null
  }

  /**
   * 各套官方资料的状态与大小（只读，不联网；首页 / 侧栏 / 向导都用它）。
   * 刷新页面后任务列表会清空，"装了一半"靠库里记的状态认出来（status = incomplete），界面据此提示并给"继续"。
   */
  async dataStatus(): Promise<DataSetState[]> {
    const { db, files } = this.deps.library
    const out: DataSetState[] = []
    for (const s of SOURCES.filter((it) => it.kind === 'official')) {
      const record = await db.sets.get(s.id)
      const recordStatus = record ? String(record.status) : null
      const task = this.runningTask(s.id)
      const status: DataStatus = recordStatus === 'installed' ? 'installed' : task ? 'running' : recordStatus ? 'incomplete' : 'none'
      const list = await files.cachedFileList(s)
      out.push({ codeSet: s.codeSet, lang: s.lang, setId: s.id, installed: recordStatus === 'installed', status, recordStatus, downloadBytes: list ? precachePlan(list).bytes : null, task })
    }
    return out
  }

  async wizardOptions(ruleId: string, codeSet: string, choice: LibraryChoice = {}): Promise<WizardOptions> {
    const rule = this.deps.rules.get(ruleId)
    if (!rule) throw new TrpgError('E_RULE_MISSING', `没有这套规则：${ruleId}`)
    const library = this.libraryOf(ruleId, codeSet, choice)
    const { scoped } = this.deps.library
    let shelf: ShelfGroup[] = []
    let shelfError: string | null = null
    try { shelf = await scoped.shelf(library) } catch (e) { shelfError = msg(e) }
    const data = await this.dataStatus() // 书目步骤会顺带缓存文件清单，所以放在它后面才有下载大小
    return {
      rule: { id: rule.id, name: rule.name },
      scopes: await scoped.scopes(),
      defaultScopes: [...ruleScopes(ruleId).defaultScopes],
      data,
      shelf,
      shelfError,
      library,
    }
  }

  async startCampaign(input: StartCampaignInput): Promise<StartCampaignResult> {
    const { campaign, rules } = this.deps
    const { scoped, tasks, dataVersion } = this.deps.library
    if (!rules.has(input.ruleId)) throw new TrpgError('E_RULE_MISSING', `没有这套规则：${input.ruleId}`)
    const name = cleanName(input.name)
    const needed = this.neededSets(input.codeSet) // 先验：资料语言没登记会在这里抛，不会留下半个战役
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
    for (const setId of needed) {
      if (await this.installed(setId)) continue
      const taskId = tasks.startOfficial(setId)
      officialTasks.set(setId, taskId)
      downloads.push({ kind: 'official', set: setId, item: null, taskId })
      waiting.push(tasks.wait(taskId))
    }
    const adventureJobs: Array<Promise<void>> = []
    for (const pick of input.adventures ?? []) {
      const before = officialTasks.get(pick.set)
      if (!before) {
        const taskId = tasks.startAdventure(pick.set, pick.id)
        downloads.push({ kind: 'adventure', set: pick.set, item: pick.id, taskId })
        waiting.push(tasks.wait(taskId))
        continue
      }
      // 这本冒险所在的资料还在下载：等它装完再下冒险正文
      adventureJobs.push(tasks.wait(before).then((state) => {
        if (state.status !== 'done') { errors.push(`冒险 ${pick.id} 没下载：${pick.set} 没装好（${state.error ?? state.status}）`); return }
        const taskId = tasks.startAdventure(pick.set, pick.id)
        downloads.push({ kind: 'adventure', set: pick.set, item: pick.id, taskId })
        return tasks.wait(taskId).then((s) => { if (s.status !== 'done') errors.push(`冒险 ${pick.id} 下载失败：${s.error ?? s.status}`) })
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

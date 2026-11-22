// P6 第 2 段：建卡专用小窗（驾驶员 2026-11-18 批准）。每次建卡单独开一个结算小窗：
//   本机私人完整版作者程序（input.ts privateModules）＋ 本战役的资料与自制（和日常小窗同一套输入）
//   → 本战役范围写进作者屏蔽名单（native-scope.ts）、作者收下的自制包登记成作者「额外自制文件」（open.ts 供应）
//   → 作者完整建卡器原样跑（frame/commands-native.ts）
//   → 建好交回整份人物，关掉专用小窗。收进存档走现有的完整人物入口（people.ts buildNative）。
// 为什么单独开：建卡要开好几分钟，和日常结算共用一个小窗会互相打断；屏蔽名单也只能装在这里（日常小窗关着的条目照样要能结算）。
import type { FileProvider } from '../../library/files'
import type { ScopedLibrary } from '../../library/scoped'
import type { LibraryService } from '../../library/service'
import type { LibraryRevisionStore, LibraryView } from '../../library/revision'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import type { KernelSession } from './host'
import { kernelInput } from './input'
import { openKernel, prepareKernelBrews } from './open'
import { campaignExcludes, nativePresentation } from './native-scope'
import type { KernelBrewReport } from './frame/brew-input'
import { getSource } from '../../library/sources'
import type { NativeCardPreview, NativeLabel, NativePresentation } from './native-presentation'

export interface NativeBuildDeps {
  pluginRoot: URL
  files: FileProvider
  scoped: ScopedLibrary
  service: LibraryService
  revisions: LibraryRevisionStore
  container: () => HTMLElement
  campaignOf: (ownerKey: string) => Promise<{ rule: string; library: CampaignLibrary; title: string }>
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

/** built = 作者建好了（data 整份人物）；cancelled = 玩家在作者里关窗 / 来源窗口取消；error = 没跑成。 */
export type NativeBuildResult =
  | { status: 'built'; data: Record<string, unknown>; seed: string; excluded: number; unpaired: EntryRef[]; brews: KernelBrewReport }
  | { status: 'cancelled' | 'error'; error?: string }

/** 专用小窗的世界编号（和日常小窗的世界分开）。 */
const buildWorldOf = (ownerKey: string) => `trpg-build-${[...ownerKey].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7).toString(36)}`

export class KernelNativeBuild {
  private readonly running = new Map<string, KernelSession | null>()

  constructor(private readonly deps: NativeBuildDeps) {}

  private async preview(label: NativeLabel, library: CampaignLibrary, view: LibraryView): Promise<NativeCardPreview | null> {
    const { ref } = label
    const source = getSource(ref.set)
    const detail = await this.deps.scoped.detail(library, ref, { view, browse: true, selection: label.selection })
    if (!detail || !('item' in detail)) return null
    const frame = await this.deps.service.frameOf(source.codeSet, view)
    const markup = await frame.call('renderEntity', ref.prop, detail.item)
    if (!markup?.html) return null
    const content = new DOMParser().parseFromString(markup.html, 'text/html')
    const text = (content.body.textContent ?? '').replace(/\s+/g, ' ').trim()
    return { text: text.length > 540 ? `${text.slice(0, 540)}…` : text, chinese: source.lang === 'zh' }
  }

  /**
   * 跑一次作者完整建卡器（同一战役同一时刻只建一个）。
   * slot = 页面上给建卡用的位置：小窗铺满它、给玩家看，并挂上 Foundry 核心样式与插件主题（frame/display.ts）；不给 = 隐藏小窗。
   */
  async run(ownerKey: string, name: string, slot?: HTMLElement): Promise<NativeBuildResult> {
    if (this.running.has(ownerKey)) return { status: 'error', error: '这个战役已经在建卡' }
    this.running.set(ownerKey, null)
    try {
      const campaign = await this.deps.campaignOf(ownerKey)
      const view = await this.deps.revisions.published()
      const input = await kernelInput({ pluginRoot: this.deps.pluginRoot, rule: campaign.rule, uiLanguage: 'zh', world: { id: buildWorldOf(ownerKey), title: campaign.title }, fetchImpl: this.deps.fetchImpl, privateModules: true, display: !!slot })
      if (!input.moduleRoots) return { status: 'error', error: '本机没有私人完整版作者程序（vendor/private/modules/plutonium/），完整建卡器用不了' }
      const prepared = await prepareKernelBrews(this.deps.service, view, campaign.library.codeSet)
      let presentation: NativePresentation | undefined
      const { session, report, brewFiles } = await openKernel({
        ...this.deps, view, input, ...prepared, container: slot ?? this.deps.container(), visible: !!slot,
        buildCard: slot ? async (prop, hash, open) => {
          const group = presentation && Object.hasOwn(presentation.labels, prop) && presentation.labels[prop]
          const label = group && Object.hasOwn(group, hash) && group[hash]
          if (!label) return null
          if (!open) return this.preview(label, campaign.library, view)
          slot.dispatchEvent(new CustomEvent('trpg-build-card', { detail: label }))
          return true
        } : undefined,
      })
      if (!this.running.has(ownerKey)) { session.close(); return { status: 'cancelled' } }
      this.running.set(ownerKey, session)
      try {
        const [excludes, labels] = await Promise.all([
          campaignExcludes(this.deps, campaign.library, view),
          slot ? nativePresentation(this.deps, campaign.library, view) : undefined,
        ])
        presentation = labels
        const identity = crypto.randomUUID().replaceAll('-', '')
        const seed = `${name}~${identity}`
        // 每个建卡小窗的本地发号从头开始，人物要移进同一个日常小窗，所以在出生时给唯一编号。
        const start = await session.call('draftStart', { name, seed, id: identity.slice(0, 16) })
        const id = (start.result as { id?: string } | null)?.id
        if (start.status !== 'complete' || !id) return { status: 'error', error: `开不了草稿人：${start.error ?? start.status}` }
        const call = await session.call('nativeBuild', { id, excludes: excludes.rows, brewFiles, presentation })
        const out = call.result as { built?: boolean; data?: Record<string, unknown> } | null
        if (call.status !== 'complete') return { status: 'error', error: call.error ?? `作者建卡没完成（${call.status}）` }
        if (!out?.built || !out.data) return { status: 'cancelled' }
        return { status: 'built', data: out.data, seed, excluded: excludes.rows.length, unpaired: excludes.unpaired, brews: report }
      } catch (e) {
        // stop() 关掉了专用小窗：进行中的命令被小窗关闭打断，是玩家放弃，不是失败
        if (this.running.get(ownerKey) !== session) return { status: 'cancelled' }
        throw e
      } finally { session.close() }
    } finally { this.running.delete(ownerKey) }
  }

  /** 放弃正在进行的建卡（离开建卡页）：直接关掉专用小窗，草稿人随小窗消失。 */
  stop(ownerKey: string): void {
    const session = this.running.get(ownerKey)
    this.running.delete(ownerKey)
    session?.close()
  }
}

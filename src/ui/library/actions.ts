import { markRaw } from 'vue'
import { libraryOf, ORIGINAL } from '../../core/library/types'
import { impactLines, restoreBuiltin, uninstallImpact, uninstallPack } from '../../core/library/uninstall'
import { loadBuiltinPack } from '../../core/packs/builtinFile'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { useUiStore } from '../../stores/ui'
import { downloadBytes } from '../download'
import { errorText } from '../format'
import { askChoice } from '../kit/choice'
import { askConfirm } from '../kit/confirm'
import ApplyVariantsPage from './ApplyVariantsPage.vue'
import type { PackRow } from './rows'

const safeName = (s: string): string => s.replace(/[\\/:*?"<>|\s]+/g, '_')

function fail(message: string, error: unknown): void {
  console.error(`[trpg-assistant] ${message}`, error)
  useToastStore().error(`${message}：${errorText(error)}`)
}

/** 安装或更新一个目录里的包（缺少的必需包会先排队安装）。 */
export async function installFromCatalog(id: string): Promise<void> {
  const library = useLibraryStore()
  const toast = useToastStore()
  const pack = library.catalog?.packs.find((p) => p.id === id)
  if (!pack) {
    toast.error('数据仓库里没有找到这个包，可以稍后重试')
    return
  }
  const ok = await library.install(pack)
  if (ok) toast.success(`已安装「${pack.name}」`)
}

export function retryInstall(id: string): Promise<void> {
  useLibraryStore().clearTask(id)
  return installFromCatalog(id)
}

/** 卸载：先说明影响；确认页在当前弹窗里或小确认窗；我的包进库回收站。 */
export async function uninstallFlow(row: PackRow): Promise<boolean> {
  const app = useAppStore()
  const library = useLibraryStore()
  const toast = useToastStore()
  const modal = useModalStore()
  try {
    const s = app.svc()
    const impact = await uninstallImpact(s.db, s.rules, row.id)
    if (impact.core) {
      toast.error('这是规则必选的内容包，不能卸载')
      return false
    }
    const lines = impactLines(impact)
    const ok = await askConfirm({ title: '卸载扩展包', message: `卸载「${row.name}」？`, details: lines, confirmLabel: '卸载', danger: true })
    if (!ok) return false
    const result = await app.queue.enqueue({ id: `uninstall:${row.id}`, label: `卸载 ${row.name}`, run: () => uninstallPack({ db: s.db, packs: s.packs, rules: s.rules, now: s.now }, row.id) })
    await library.refreshInstalled()
    await library.runIntegrity()
    if (modal.isOpen) modal.close(true)
    toast.success(result.trashed ? `已删除「${row.name}」，可在库回收站恢复` : `已卸载「${row.name}」`)
    return true
  } catch (error) {
    fail('卸载失败', error)
    return false
  }
}

export async function restoreBuiltinFlow(row: PackRow): Promise<void> {
  const app = useAppStore()
  try {
    const s = app.svc()
    await app.queue.enqueue({ id: `restore:${row.id}`, label: `恢复 ${row.name}`, run: () => restoreBuiltin({ db: s.db, packs: s.packs }, row.id, loadBuiltinPack) })
    await useLibraryStore().refreshInstalled()
    useToastStore().success(`已恢复「${row.name}」`)
  } catch (error) {
    fail('恢复失败', error)
  }
}

export async function exportPackFile(row: PackRow): Promise<void> {
  try {
    const bytes = await useAppStore().svc().packs.exportPack(row.id)
    const name = `${safeName(row.name)}_v${row.version}.trpgpack`
    downloadBytes(bytes, name)
    useToastStore().success(`已导出「${name}」`)
  } catch (error) {
    fail('导出失败', error)
  }
}

/** 复制为我的包，完成后切到「我的」。 */
export async function duplicateFlow(row: PackRow): Promise<void> {
  const app = useAppStore()
  const library = useLibraryStore()
  const toast = useToastStore()
  try {
    const copy = await app.queue.enqueue({ id: `dup:${row.id}`, label: `复制 ${row.name}`, run: () => app.svc().mine.duplicate(row.id) })
    await library.refreshInstalled()
    const modal = useModalStore()
    if (modal.isOpen) modal.close(true)
    useUiStore().librarySegment = 'mine'
    toast.success(`已复制为「${copy.name}」`)
  } catch (error) {
    fail('复制失败', error)
  }
}

const nameOfEntry = (key: string): string => {
  const ws = useCampaignStore().workspace
  return (ws && libraryOf(ws.data).pins[key]?.entry.name) || key.slice(key.indexOf('/') + 1)
}

/** 启用：有修改版时先在窗口里让玩家确认（L1 §4.13）；依赖一并启用并提示。 */
export async function enableFlow(packId: string): Promise<boolean> {
  const campaign = useCampaignStore()
  const library = useLibraryStore()
  const toast = useToastStore()
  const name = library.installedMap.get(packId)?.name ?? packId
  try {
    const preview = await campaign.inspect((s, owner) => s.library.previewEnable(owner, packId))
    let use: Record<string, boolean> | undefined
    if (preview.variants.length) {
      const names = Object.fromEntries(preview.variants.map((v) => [v.entryKey, nameOfEntry(v.entryKey)]))
      const ws = campaign.workspace
      const sourceOf = (current: string): string => {
        if (current === ORIGINAL) return '原版'
        const slot = Object.values(ws ? libraryOf(ws.data).variants : {}).find((x) => x.candidates.some((c) => c.key === current))
        return slot?.candidates.find((c) => c.key === current)?.sourceName ?? current
      }
      const answer = await askChoice<Record<string, boolean> | null>(
        { key: 'confirm:variants', title: `启用「${name}」`, component: markRaw(ApplyVariantsPage), props: (done) => ({ packName: name, items: preview.variants, names, sourceOf, onAnswer: done }) },
        null,
      )
      if (!answer) return false
      use = answer
    }
    const result = await campaign.mutate((s, owner) => s.library.enable(owner, packId, { use }))
    await library.runIntegrity()
    const also = result.autoEnabled.map((id) => library.installedMap.get(id)?.name ?? id)
    toast.undoable(also.length ? `已启用「${name}」，并一起启用：${also.join('、')}` : `已启用「${name}」`, () => void disableFlow(packId, { confirm: false }))
    return true
  } catch (error) {
    fail('启用失败', error)
    return false
  }
}

/** 停用：有会改回的修改版或功能状态时先确认；被其他已启用的包需要时不能停用。 */
export async function disableFlow(packId: string, opts: { confirm?: boolean } = {}): Promise<boolean> {
  const campaign = useCampaignStore()
  const library = useLibraryStore()
  const toast = useToastStore()
  const name = library.installedMap.get(packId)?.name ?? packId
  try {
    const preview = await campaign.inspect((s, owner) => s.library.previewDisable(owner, packId))
    if (preview.dependents.length) {
      toast.error(`『${preview.dependents.map((id) => library.installedMap.get(id)?.name ?? id).join('、')}』需要它，不能停用`)
      return false
    }
    const needConfirm = opts.confirm !== false && (preview.reverted.length > 0 || preview.hasState)
    if (needConfirm) {
      const details = [
        ...(preview.hasState ? [`《${name}》的功能产生的数据（如声望、据点）会保留，重新启用后恢复。`] : []),
        ...preview.reverted.map((r) => `${nameOfEntry(r.entryKey)}：改回${r.to === ORIGINAL ? '原版' : '其他版本'}`),
      ]
      const ok = await askConfirm({ title: `停用「${name}」`, message: '停用后：', details, confirmLabel: '停用' })
      if (!ok) return false
    }
    await campaign.mutate((s, owner) => s.library.disable(owner, packId))
    await library.runIntegrity()
    toast.undoable(`已停用「${name}」`, () => void enableFlow(packId))
    return true
  } catch (error) {
    fail('停用失败', error)
    return false
  }
}

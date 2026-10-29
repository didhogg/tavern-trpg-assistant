import { markRaw } from 'vue'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { downloadBytes } from '../download'
import { errorText } from '../format'
import { askChoice } from '../kit/choice'
import { askConfirm } from '../kit/confirm'
import CreateMinePage from './CreateMinePage.vue'
import PickPackPage from './PickPackPage.vue'

function fail(message: string, error: unknown): void {
  console.error(`[trpg-assistant] ${message}`, error)
  useToastStore().error(`${message}：${errorText(error)}`)
}

export function openCreateMine(ruleId: string, pack?: { id: string; name: string; description: string }): void {
  useModalStore().open({ key: 'mine-form', title: pack ? '改名与简介' : '新建我的包', component: markRaw(CreateMinePage), props: { ruleId, pack }, variant: 'dialog' })
}

export async function deleteMineFlow(id: string, name: string): Promise<boolean> {
  const app = useAppStore()
  const library = useLibraryStore()
  const toast = useToastStore()
  const ok = await askConfirm({ title: '删除我的包', message: `「${name}」是你自己做的内容，删除后可在库回收站中保留 30 天。建议先导出为文件。`, confirmLabel: '删除', danger: true })
  if (!ok) return false
  try {
    await app.queue.enqueue({ id: `mine-remove:${id}`, label: `删除 ${name}`, run: () => app.svc().mine.remove(id) })
    await library.refreshInstalled()
    toast.undoable(`已删除「${name}」，可在库回收站恢复`, async () => {
      await app.svc().mine.restore(id)
      await library.refreshInstalled()
    })
    return true
  } catch (error) {
    fail('删除失败', error)
    return false
  }
}

export async function duplicateMine(id: string): Promise<void> {
  const app = useAppStore()
  try {
    const copy = await app.svc().mine.duplicate(id)
    await useLibraryStore().refreshInstalled()
    useToastStore().success(`已复制为「${copy.name}」`)
  } catch (error) {
    fail('复制失败', error)
  }
}

export async function exportMine(id: string, name: string, version: string): Promise<void> {
  try {
    downloadBytes(await useAppStore().svc().packs.exportPack(id), `${name.replace(/[\\/:*?"<>|\s]+/g, '_')}_v${version}.trpgpack`)
    useToastStore().success(`已导出「${name}」`)
  } catch (error) {
    fail('导出失败', error)
  }
}

export async function purgeTrashFlow(id: string, name: string): Promise<boolean> {
  const ok = await askConfirm({ title: '彻底删除', message: `「${name}」将被永久删除，无法恢复。`, confirmLabel: '彻底删除', danger: true })
  if (!ok) return false
  try {
    await useAppStore().svc().mine.purge(id)
    return true
  } catch (error) {
    fail('删除失败', error)
    return false
  }
}

export async function restoreTrash(id: string): Promise<void> {
  try {
    const pack = await useAppStore().svc().mine.restore(id)
    await useLibraryStore().refreshInstalled()
    useToastStore().success(`已恢复「${pack.name}」`)
  } catch (error) {
    fail('恢复失败', error)
  }
}

export async function pickTargetPack(packs: Array<{ id: string; name: string }>): Promise<string | null> {
  return askChoice<string | null>({ key: 'confirm:pick-pack', title: '移到…', component: markRaw(PickPackPage), props: (answer) => ({ packs, onAnswer: answer }) }, null)
}

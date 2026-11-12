<script setup lang="ts">
import { computed } from 'vue'
import type { DownloadItem } from '../../stores/downloads'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore } from '../../stores/downloads'
import { useLibNoticeStore } from '../../stores/libnotice'
import { useLibViewStore } from '../../stores/libview'
import ErrorBanner from './ErrorBanner.vue'

/**
 * 库页的错误横幅（P5-5 §12.3）：一条一句人话 + 动作，原始报错在【详情】。横幅显示在插件外酒馆顶部栏下方（ErrorBanner 登记，ToastHost 显示）。
 * 来源：库页动作的提示（删除 / 导入 / 更新失败、缺依赖被拦下）、下载失败（带【重试】）、书架 / 自制包 / 书目读取失败（带【重试】）。
 * 多于一条时只露最新一条和「还有 N 条」（收起逻辑在 ToastHost）。
 */
const app = useAppStore()
const props = defineProps<{ libraryOpen: boolean }>()
const dl = useDownloadsStore()
const notices = useLibNoticeStore()
const lib = useLibViewStore()

function retryOf(i: DownloadItem): (() => void) | undefined {
  const registered = dl.retryOf(i)
  if (registered) return registered
  const { set, item } = i
  if (i.kind !== 'adventure' || !set || !item) return undefined
  return () => dl.rememberTask(app.svc().backend.library.tasks.startAdventure(set, item), i.label)
}
const reload = (): void => { void lib.refresh(app.svc()) }

interface Row { key: string; text: string; what: string; actions: Array<{ label: string; run: () => void; testid?: string }>; dismiss?: () => void }
const rows = computed<Row[]>(() => [
  ...(props.libraryOpen && lib.error ? [{ key: 'shelf', text: `书架这次没读出来${lib.shelf ? '（下面是上次的内容）' : ''}：${lib.error}`, what: '读取书架', actions: [{ label: '重试', run: reload }] }] : []),
  ...(props.libraryOpen && lib.shelf?.brewError ? [{ key: 'brew', text: `自制包读取失败：${lib.shelf.brewError}`, what: '读取自制包', actions: [{ label: '重试', run: reload }] }] : []),
  ...(props.libraryOpen && lib.shelf?.booksError ? [{ key: 'books', text: `书目读取失败：${lib.shelf.booksError}`, what: '读取书目', actions: [{ label: '重试', run: reload }] }] : []),
  // 按发生先后排：后发生的后登记，宿主层把最后登记的放最上面，收起时露出的就是刚发生的那条
  ...notices.notices.filter((n) => props.libraryOpen || n.key.startsWith('download:')).map((n) => ({ key: `n:${n.key}`, text: n.text, what: n.text.split('：')[0], actions: n.actions, dismiss: () => notices.dismiss(n.key) })),
  ...dl.failedAll.map((i) => {
    const retry = retryOf(i)
    return { key: `d:${i.taskId}`, text: `${i.label}下载没有完成，本次失败的资料未安装：${i.error || '原因未知'}`, what: `下载${i.label}`, actions: retry ? [{ label: '重试', run: () => { dl.dismiss(i); retry() }, testid: 'download-retry' }] : [], dismiss: () => dl.dismiss(i) }
  }),
])
</script>

<template>
  <ErrorBanner v-for="r in rows" :key="r.key" :text="r.text" :what="r.what" :actions="r.actions" :dismissible="!!r.dismiss" :data-testid="r.key.startsWith('d:') ? 'download-banner' : 'lib-notice'" @dismiss="r.dismiss?.()" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DownloadItem } from '../../stores/downloads'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore } from '../../stores/downloads'
import { useLibNoticeStore } from '../../stores/libnotice'
import { useLibViewStore } from '../../stores/libview'
import Icon from '../kit/Icon.vue'
import ErrorBanner from './ErrorBanner.vue'

/**
 * 库页的错误横幅（P5-5 §12.3）：浮在库页内容上方，不挤页面。一条一句人话 + 动作，原始报错在【详情】。
 * 来源：库页动作的提示（删除 / 导入 / 更新失败、缺依赖被拦下）、下载失败（带【重试】）、书架 / 自制包 / 书目读取失败（带【重试】）。
 * 多于一条时只露第一条和「还有 N 条」，点开看全部。
 */
const app = useAppStore()
const dl = useDownloadsStore()
const notices = useLibNoticeStore()
const lib = useLibViewStore()
const open = ref(false)

function retry(i: DownloadItem): void {
  const tasks = app.svc().backend.library.tasks
  if (i.kind === 'official') { dl.markRetried(i.key); for (const set of i.sets ?? []) tasks.startOfficial(set) } else if (i.kind === 'adventure' && i.set && i.item) { dl.markRetried(i.key); tasks.startAdventure(i.set, i.item) } else dl.retryBrew(i.key)
  dl.refresh()
}
const reload = (): void => { void lib.refresh(app.svc()) }

interface Row { key: string; text: string; what: string; actions: Array<{ label: string; run: () => void; testid?: string }>; dismiss?: () => void }
const rows = computed<Row[]>(() => [
  ...(lib.error ? [{ key: 'shelf', text: `书架这次没读出来${lib.shelf ? '（下面是上次的内容）' : ''}：${lib.error}`, what: '读取书架', actions: [{ label: '重试', run: reload }] }] : []),
  ...(lib.shelf?.brewError ? [{ key: 'brew', text: `自制包读取失败：${lib.shelf.brewError}`, what: '读取自制包', actions: [{ label: '重试', run: reload }] }] : []),
  ...(lib.shelf?.booksError ? [{ key: 'books', text: `书目读取失败：${lib.shelf.booksError}`, what: '读取书目', actions: [{ label: '重试', run: reload }] }] : []),
  // 最新的在上面：收起时露出的就是刚发生的那条
  ...[...notices.notices].reverse().map((n) => ({ key: `n:${n.key}`, text: n.text, what: n.text.split('：')[0], actions: n.actions, dismiss: () => notices.dismiss(n.key) })),
  ...[...dl.failedAll].reverse().map((i) => ({ key: `d:${i.key}`, text: `${i.label}下载没有成功：${i.error || '原因未知'}`, what: `下载${i.label}`, actions: [{ label: '重试', run: () => retry(i), testid: 'download-retry' }], dismiss: () => dl.dismiss(i.key) })),
])
const shown = computed(() => (open.value ? rows.value : rows.value.slice(0, 1)))
</script>

<template>
  <div class="lib-bannerdock">
    <div v-if="rows.length" class="lib-bannerstack" data-testid="download-banners">
      <ErrorBanner v-for="r in shown" :key="r.key" :text="r.text" :what="r.what" :actions="r.actions" :dismissible="!!r.dismiss" data-testid="lib-notice" @dismiss="r.dismiss?.()" />
      <button v-if="rows.length > 1" class="lib-bannerstack__more" type="button" :aria-expanded="open" data-testid="banners-more" @click="open = !open">
        <Icon :name="open ? 'minus' : 'caret-down'" :size="14" />{{ open ? '收起' : `还有 ${rows.length - 1} 条提示` }}
      </button>
    </div>
  </div>
</template>

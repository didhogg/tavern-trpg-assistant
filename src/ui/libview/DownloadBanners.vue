<script setup lang="ts">
import type { DownloadItem } from '../../stores/downloads'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore } from '../../stores/downloads'
import Icon from '../kit/Icon.vue'
import { useLibNoticeStore } from '../../stores/libnotice'

/**
 * 下载失败横幅（库页顶部，书架 / 我的库 / 下载三个分区都看得到）：每个失败项一条，带【重试】；点了重试，再失败就只出这条横幅，不再亮警告环、不自动再拉。
 * 重试：官方 = 重新开失败的那几套的下载任务；冒险 = 重新下这一本；自制 = 重新跑登记时给的重试动作。
 */
const app = useAppStore()
const dl = useDownloadsStore()
const notices = useLibNoticeStore()
/** 作者报错常常很长（带一串地址）：横幅里只放前面一段，全文在鼠标悬停提示里。 */
const brief = (t: string | null): string => { const x = (t || '原因未知').trim(); return x.length > 140 ? `${x.slice(0, 140)}…` : x }

function retry(i: DownloadItem): void {
  const tasks = app.svc().backend.library.tasks
  if (i.kind === 'official') { dl.markRetried(i.key); for (const set of i.sets ?? []) tasks.startOfficial(set) } else if (i.kind === 'adventure' && i.set && i.item) { dl.markRetried(i.key); tasks.startAdventure(i.set, i.item) } else dl.retryBrew(i.key)
  dl.refresh()
}
</script>

<template>
  <div v-if="dl.failedAll.length || notices.notices.length" class="lib-bannerstack" data-testid="download-banners">
    <!-- 库页的错误提示（删除 / 导入 / 更新失败、缺依赖被拦下）：每条带动作按钮，关掉或动作成功后消失 -->
    <div v-for="n in notices.notices" :key="n.key" class="lib-banner lib-banner--warn" role="alert" data-testid="lib-notice">
      <Icon name="warning" :size="16" /><span :title="n.text">{{ brief(n.text) }}</span>
      <span class="lib-end">
        <button v-for="a in n.actions" :key="a.label" class="trpg-btn trpg-btn--small" type="button" @click="a.run()">{{ a.label }}</button>
        <button class="trpg-icon-btn" type="button" aria-label="关闭这条提示" @click="notices.dismiss(n.key)"><Icon name="x" :size="14" /></button>
      </span>
    </div>
    <div v-for="i in dl.failedAll" :key="i.key" class="lib-banner lib-banner--warn" role="alert">
      <Icon name="warning" :size="16" /><span :title="i.error ?? undefined">{{ i.label }}下载没有成功：{{ brief(i.error) }}</span>
      <span class="lib-end">
        <button class="trpg-btn trpg-btn--small" type="button" data-testid="download-retry" @click="retry(i)">重试</button>
        <button class="trpg-icon-btn" type="button" aria-label="关闭这条提示" @click="dl.dismiss(i.key)"><Icon name="x" :size="14" /></button>
      </span>
    </div>
  </div>
</template>

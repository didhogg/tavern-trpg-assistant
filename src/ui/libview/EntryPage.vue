<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { chooseEntry, type EntryRef } from '../../library/scopes'
import type { ScopedDetail } from '../../library/scoped'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Switch from '../kit/Switch.vue'
import EntryBody from './EntryBody.vue'

/** 条目详情壳（U1b）：弹窗里的一页。在 sheet 弹窗里前进；‹ 返回由宿主给。 */
const props = defineProps<{ entryRef: EntryRef }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const toast = useToastStore()

type State = { kind: 'loading' } | { kind: 'ok'; d: ScopedDetail | null; item: unknown; closed: boolean } | { kind: 'none' } | { kind: 'error'; message: string }
const state = ref<State>({ kind: 'loading' })
const enabled = ref(true)
const codeSet = computed(() => getSource(props.entryRef.set).codeSet)
const sourceLine = ref('')
/** 来源行：书的全名（作者的 sourceNames）+ 页码；名字取不到就退回来源缩写。 */
async function sourceText(item: unknown, source: string | null): Promise<string> {
  if (!source) return ''
  let name = source
  try { name = (await (await app.svc().backend.library.service.frameOf(codeSet.value)).call('sourceNames', [source]))[source]?.full ?? source } catch (e) { console.error('[trpg-assistant] 读取书名失败', e) }
  const page = (item as { page?: unknown } | null)?.page
  return `${name}${typeof page === 'number' ? ` · 第 ${page} 页` : ''} · ${source}`
}
const nameOf = (item: unknown): string => (typeof item === 'object' && item && typeof (item as { name?: unknown }).name === 'string' ? (item as { name: string }).name : '未知')

async function load(): Promise<void> {
  state.value = { kind: 'loading' }
  const s = app.svc()
  const c = lib.campaignLib
  if (!c) { state.value = { kind: 'error', message: '还没有读取库设置' }; return }
  try {
    const d = await s.backend.library.scoped.detail(c, props.entryRef)
    if (d && 'hidden' in d) {
      // 本战役关着这本书 / 不在范围：仍然能看（R33），只在顶部提示
      const raw = await s.backend.library.service.detail(props.entryRef.set, props.entryRef.prop, props.entryRef.hash)
      if (!raw) { state.value = { kind: 'none' }; return }
      state.value = { kind: 'ok', d: null, item: raw.item, closed: true }
      enabled.value = false
      sourceLine.value = await sourceText(raw.item, raw.source ?? null)
    } else if (!d) {
      state.value = { kind: 'none' }
      return
    } else {
      state.value = { kind: 'ok', d, item: d.item, closed: false }
      sourceLine.value = await sourceText(d.item, d.source ?? null)
      enabled.value = true
    }
    const key = `entry:${props.entryRef.set}:${props.entryRef.prop}:${props.entryRef.hash}`
    modal.setTitle(key, nameOf(state.value.item))
  } catch (e) {
    console.error('[trpg-assistant] 读取条目失败', e)
    state.value = { kind: 'error', message: e instanceof Error ? e.message : String(e) }
    toast.error('读取这一条时出错了')
  }
}
onMounted(() => void load())

const body = computed(() => (state.value.kind === 'ok' ? (state.value.item as { entries?: unknown } | null)?.entries ?? null : null))

async function setEnabled(next: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound) return
  const ks = app.svc().backend.kernelSave
  const cur = await ks.libraryOf(owner)
  await ks.setLibrary(owner, { ...cur, ...chooseEntry(cur, props.entryRef, next) })
  enabled.value = next
  toast.success(next ? '已在本战役启用这一条' : '已在本战役停用这一条')
}
</script>

<template>
  <div class="lib-mbody" data-testid="entry-page">
    <div v-if="state.kind === 'loading'" class="lib-skel" aria-busy="true"><i style="width:55%;height:22px" /><i /><i style="width:90%" /><i style="width:70%" /></div>
    <div v-else-if="state.kind === 'none'" class="lib-state"><h3>库里没有这一条</h3><p class="lib-muted">这一条所在的书还没下载。</p></div>
    <div v-else-if="state.kind === 'error'" class="lib-state"><h3>这一条读不出来</h3><p class="lib-muted">{{ state.message }}</p><button class="trpg-btn trpg-btn--primary" type="button" @click="load">重试</button></div>
    <template v-else>
      <div class="lib-dtools">
        <span class="trpg-switch-wrap"><Switch :model-value="enabled" label="本战役启用这一条" :disabled="!lib.bound" @update:model-value="setEnabled" /><span>本战役启用</span></span>
        <span class="lib-end">
          <button class="trpg-icon-btn" type="button" disabled aria-label="编辑（稍后开放）" title="条目编辑稍后开放"><Icon name="pencil-simple" :size="18" /></button>
          <MoreMenu label="这一条" :items="[{ key: 'save', label: '存入我的库', disabled: true, reason: '稍后开放' }]" />
        </span>
      </div>
      <div class="lib-mscroll">
        <div class="lib-dbody">
          <div v-if="state.kind === 'ok' && state.closed" class="lib-banner"><span>这本书在本战役里是关着的，内容照常可以看。</span></div>
          <div class="lib-srcline">{{ sourceLine || '未知来源' }}</div>
          <EntryBody v-if="body" :block="body" :code-set="codeSet" />
          <p v-else class="lib-muted">这一条没有正文。</p>
        </div>
      </div>
    </template>
  </div>
</template>

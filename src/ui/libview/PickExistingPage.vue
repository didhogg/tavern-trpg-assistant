<script setup lang="ts">
import { computed, markRaw, onMounted, ref, shallowRef } from 'vue'
import type { EntryType } from '../../library/custom-new'
import type { ScopedRow } from '../../library/scoped'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import type { EditSession } from './edit-flow'
import ErrorBanner from './ErrorBanner.vue'
import { nameOf } from './pack-data'
import PickPreviewPage from './PickPreviewPage.vue'
import { useVirtual } from './useVirtual'

/** P5.5 u7-8b 起点：从已有的开始——只在这一类里搜全库（官方 + 自制，看不见的也列），点一条先看样子。 */
const props = defineProps<{ session: Omit<EditSession, 'ent'>; type: EntryType }>()
const app = useAppStore()
const lib = useLibViewStore()
const modal = useModalStore()
const rows = shallowRef<Array<{ row: ScopedRow; name: string }> | null>(null)
const error = ref<string | null>(null)
const q = ref('')
const scrollEl = ref<HTMLElement | null>(null)
async function load(): Promise<void> {
  const c = lib.campaignLib
  if (!c) return
  error.value = null
  try {
    const list = await app.svc().backend.library.scoped.query({ ...c, codeSet: props.session.codeSet }, props.session.prop, { mode: 'browse' })
    rows.value = list.map((row) => ({ row, name: nameOf(row.item) })).sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  } catch (e) { console.error('[trpg-assistant] 读取已有条目失败', e); error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void load())
const shown = computed(() => { const n = q.value.trim().toLowerCase(); return (rows.value ?? []).filter((r) => !n || r.name.toLowerCase().includes(n)) })
const { range } = useVirtual(scrollEl, computed(() => shown.value.length))
const visible = computed(() => shown.value.slice(range.value.start, range.value.end))
const open = (r: { row: ScopedRow; name: string }) => modal.push({ key: `pickp:${r.row.ref.hash}`, title: r.name, component: markRaw(PickPreviewPage), variant: 'sheet', props: { session: props.session, row: r.row, name: r.name } })
</script>

<template>
  <div class="lib-mbody" data-testid="start-existing">
    <div class="lib-filter"><input v-model="q" class="trpg-input" type="search" :placeholder="`搜${type.name}…`" :aria-label="`搜${type.name}`" data-autofocus /></div>
    <ErrorBanner v-if="error" :text="`没读出来：${error}`" what="读取已有条目" :actions="[{ label: '重试', run: load }]" />
    <div v-else-if="!rows" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
    <div v-else ref="scrollEl" class="lib-mscroll">
      <div v-if="!shown.length" class="lib-state"><h3>没有符合的</h3></div>
      <div v-else class="lib-list" role="list" :style="{ paddingTop: `${range.padTop}px`, paddingBottom: `${range.padBottom}px` }">
        <button v-for="r in visible" :key="`${r.row.ref.set}:${r.row.ref.hash}:${r.row.pack?.docIdLocal ?? ''}`" class="lib-list__row" type="button" role="listitem" data-testid="pick-row" @click="open(r)">
          <span class="lib-name">{{ r.name }}</span><span class="lib-src lib-end">{{ r.row.source ?? '' }}</span>
        </button>
      </div>
    </div>
    <div class="lib-count">{{ rows ? `找到 ${shown.length} 条（只显示${type.name}）` : '正在读取…' }}</div>
  </div>
</template>

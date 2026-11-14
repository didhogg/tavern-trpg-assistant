<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import type { LegendaryCreatureLink } from '../../library/legendary-creatures'
import type { ScopedDetail } from '../../library/scoped'
import { refKey } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import Term from '../kit/Term.vue'
import ErrorBanner from './ErrorBanner.vue'
import { openEntry } from './open'

const props = defineProps<{ detail: ScopedDetail }>()
const app = useAppStore()
const lib = useLibViewStore()
type State = { kind: 'loading' | 'error' } | { kind: 'ready'; links: LegendaryCreatureLink[] }
const state = shallowRef<State>({ kind: 'loading' })
let request = 0

async function load(): Promise<void> {
  const current = ++request
  const c = lib.campaignLib
  if (!c) { state.value = { kind: 'error' }; return }
  state.value = { kind: 'loading' }
  try {
    const links = await app.svc().backend.library.scoped.legendaryCreatures(c, props.detail)
    if (current === request) state.value = { kind: 'ready', links }
  } catch (e) {
    console.error('[trpg-assistant] 读取传奇组关联怪物失败', e)
    if (current === request) state.value = { kind: 'error' }
  }
}
watch(() => props.detail, load, { immediate: true })
</script>

<template>
  <section class="lib-block" aria-label="引用此传奇组的怪物" data-testid="legendary-creatures">
    <h3>引用此传奇组的怪物</h3>
    <p v-if="state.kind === 'loading'" class="lib-muted" role="status">正在查找引用此传奇组的怪物…</p>
    <ErrorBanner v-else-if="state.kind === 'error'" text="没能查出引用此传奇组的怪物。" what="读取关联怪物" :actions="[{ label: '重试', run: load }]" />
    <template v-else-if="state.kind === 'ready'">
      <p v-if="!state.links.length" class="lib-muted">已安装资料中没有能明确关联到此组的怪物。</p>
      <div v-else class="lib-variants">
        <Term v-for="link in state.links" :key="refKey(link.ref) + ('docIdLocal' in link.selection ? ':' + link.selection.docIdLocal : '')" @open="openEntry(link.ref, link.name, link.selection)">
          {{ link.name }}<template v-if="link.source"> · {{ link.source }}</template><template v-if="link.pack"> · {{ link.pack }}</template>
        </Term>
      </div>
    </template>
  </section>
</template>

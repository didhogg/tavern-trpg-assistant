<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import Checkbox from '../kit/Checkbox.vue'
import GroupCheck from '../kit/GroupCheck.vue'
import Icon from '../kit/Icon.vue'

/** 批量勾选（U2c）：下载了很多书时一次选完；只写"和现在不一样"的，应用时一次性写进战役设置。 */
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const toast = useToastStore()
const q = ref('')
const picked = ref<Record<string, boolean>>({})
const groups = computed(() => (lib.shelf?.groups ?? []).map((g) => ({ name: g.name, rows: [...g.books, ...g.adventures].filter((r) => r.downloaded && !lib.minePacks.some((p) => p.sources.includes(r.source)) && (!q.value.trim() || `${r.name}${r.abv}`.toLowerCase().includes(q.value.trim().toLowerCase()))) })).filter((g) => g.rows.length))
const all = computed(() => groups.value.flatMap((g) => g.rows))
const isOn = (source: string, visible: boolean): boolean => picked.value[source] ?? visible
const changes = computed(() => all.value.filter((r) => isOn(r.source, r.view.visible) !== r.view.visible))
function setMany(sources: string[], on: boolean): void { for (const s of sources) picked.value = { ...picked.value, [s]: on } }

async function apply(): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound) return
  const n = changes.value.length
  try {
    await lib.applySources(app.svc(), owner, Object.fromEntries(changes.value.map((r) => [r.source, isOn(r.source, r.view.visible)])))
    toast.success(`已更新 ${n} 本`)
    modal.pop()
  } catch (e) { console.error('[trpg-assistant] 批量勾选失败', e); toast.error('没有保存成功') }
}
</script>

<template>
  <div class="lib-mbody" data-testid="bulk-page">
    <div v-if="!lib.bound" class="lib-banner" style="margin: var(--sp-3) var(--sp-4) 0"><Icon name="info" :size="16" /><span>先创建战役，开关才能用。</span></div>
    <div class="lib-filter"><input v-model="q" class="trpg-input" type="search" placeholder="搜索书名或包名" aria-label="搜索书名或包名" /></div>
    <div class="lib-mscroll">
<div class="lib-pad">
      <template v-for="g in groups" :key="g.name">
        <div class="lib-sec" style="padding: 0">{{ g.name }}<span class="lib-end"><GroupCheck :selected="g.rows.filter((r) => isOn(r.source, r.view.visible)).length" :total="g.rows.length" :label="g.name" :disabled="!lib.bound" @change="(all: boolean) => setMany(g.rows.map((r) => r.source), all)" /></span></div>
        <Checkbox v-for="r in g.rows" :key="r.source" :model-value="isOn(r.source, r.view.visible)" :disabled="!lib.bound" @update:model-value="(v: boolean) => setMany([r.source], v)">{{ r.name }}</Checkbox>
      </template>
      <p v-if="!groups.length" class="lib-muted">没有符合的书。</p>
    </div>
</div>
    <div class="lib-foot"><button class="trpg-btn" type="button" @click="modal.pop()">取消</button><button class="trpg-btn trpg-btn--primary" type="button" data-testid="bulk-apply" :disabled="!lib.bound || !changes.length" @click="apply">应用（改 {{ changes.length }} 本）</button></div>
  </div>
</template>

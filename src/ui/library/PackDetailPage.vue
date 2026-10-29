<script setup lang="ts">
import { computed } from 'vue'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { formatBytes } from '../format'
import Term from '../kit/Term.vue'
import { openPackDetail } from './openDetail'
import { contributesLabel, findRow, SOURCE_LABEL } from './rows'

const props = defineProps<{ packId: string }>()
const library = useLibraryStore()
const campaign = useCampaignStore()
const row = computed(() => findRow(props.packId, library.installed, library.catalog))
const nameOf = (id: string) => findRow(id, library.installed, library.catalog)?.name ?? id
const installedOf = (id: string) => library.installedMap.has(id)
const enabledText = computed(() => {
  const ws = campaign.workspace
  if (!ws || !row.value || ws.ruleId !== row.value.ruleId) return ''
  if (!row.value.installed) return '本存档：未安装'
  return ws.enabledPacks.some((p) => p.id === props.packId) ? '本存档：已启用' : '本存档：未启用'
})
const meta = computed(() => {
  const r = row.value
  if (!r) return ''
  return [SOURCE_LABEL[r.source], `v${r.version}`, formatBytes(r.byteSize), r.installed ? '已安装' : '未安装'].filter(Boolean).join(' · ')
})
</script>

<template>
  <div v-if="row" class="page-stack" data-testid="pack-detail">
    <div>
      <p class="trpg-row__meta">{{ meta }}</p>
      <p class="trpg-row__meta">{{ contributesLabel(row) }}</p>
    </div>
    <p v-if="row.description">{{ row.description }}</p>
    <ul class="trpg-detail-links">
      <li v-if="row.requires.length">
        需要：
        <template v-for="(id, i) in row.requires" :key="id"><template v-if="i">、</template><Term @open="openPackDetail(id)">{{ nameOf(id) }}</Term> {{ installedOf(id) ? '✓' : '（未安装）' }}</template>
      </li>
      <li v-if="row.recommends.length">
        推荐：
        <template v-for="(id, i) in row.recommends" :key="id"><template v-if="i">、</template><Term @open="openPackDetail(id)">{{ nameOf(id) }}</Term></template>
      </li>
      <li v-if="row.conflicts.length">冲突：<template v-for="(c, i) in row.conflicts" :key="c.id"><template v-if="i">、</template>{{ nameOf(c.id) }}</template></li>
      <li v-if="enabledText">{{ enabledText }}</li>
    </ul>
  </div>
  <p v-else class="trpg-empty">没有找到这个扩展包</p>
</template>

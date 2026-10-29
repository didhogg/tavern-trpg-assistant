<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { formatTime } from '../format'
import MoreMenu from '../kit/MoreMenu.vue'
import Term from '../kit/Term.vue'
import { deleteMineFlow, duplicateMine, exportMine, openCreateMine, purgeTrashFlow, restoreTrash } from './mineActions'
import { openPackDetail } from './openDetail'
import { contributesLabel, buildPackRows } from './rows'
import { TRASH_DAYS } from '../../core/library/uninstall'

const props = defineProps<{ ruleId: string }>()
defineEmits<{ edit: [packId: string] }>()
const app = useAppStore()
const library = useLibraryStore()
const campaign = useCampaignStore()
const trash = ref<Array<{ id: string; name: string; deletedAt: number }>>([])

const rows = computed(() => buildPackRows(library.installed, library.catalog, props.ruleId).filter((r) => r.source === 'user'))
async function loadTrash(): Promise<void> {
  trash.value = (await app.svc().mine.trash()).filter((t) => t.ruleId === props.ruleId)
}
onMounted(loadTrash)
const daysAgo = (at: number): number => Math.max(0, Math.floor((app.svc().now() - at) / 86_400_000))

async function onMenu(key: string, r: (typeof rows.value)[number]): Promise<void> {
  if (key === 'rename') openCreateMine(props.ruleId, { id: r.id, name: r.name, description: r.description })
  else if (key === 'dup') await duplicateMine(r.id)
  else if (key === 'export') await exportMine(r.id, r.name, r.version)
  else if (key === 'delete' && (await deleteMineFlow(r.id, r.name))) await loadTrash()
}
</script>

<template>
  <div class="page-stack" data-testid="mine-tab">
    <div class="trpg-toolbar"><button class="trpg-btn trpg-btn--primary" type="button" :disabled="campaign.readOnly" data-testid="mine-new" @click="openCreateMine(ruleId)">＋ 新建</button></div>
    <ul v-if="rows.length" class="trpg-list">
      <li v-for="r in rows" :key="r.id" class="trpg-row" :data-testid="`mine-row-${r.name}`">
        <div class="trpg-row__main"><Term @open="openPackDetail(r.id)">{{ r.name }}</Term><div class="trpg-row__meta">{{ contributesLabel(r) || '还没有内容' }} · v{{ r.version }}</div></div>
        <div class="trpg-row__end">
          <button class="trpg-btn trpg-btn--small" type="button" @click="$emit('edit', r.id)">编辑 ›</button>
          <MoreMenu :label="r.name" :items="[{ key: 'rename', label: '改名与简介', disabled: campaign.readOnly }, { key: 'dup', label: '复制为新包', disabled: campaign.readOnly }, { key: 'export', label: '导出为文件' }, { key: 'delete', label: '删除', danger: true, disabled: campaign.readOnly }]" @select="onMenu($event, r)" />
        </div>
      </li>
    </ul>
    <div v-else class="trpg-empty"><p>你在存档里做的人物、物品、地点、房规，可以通过『存到我的库』留在这里，所有存档都能用。</p></div>
    <section v-if="trash.length" aria-label="库回收站">
      <h3 class="trpg-group">库回收站（{{ trash.length }}）</h3>
      <ul class="trpg-list">
        <li v-for="t in trash" :key="t.id" class="trpg-row">
          <div class="trpg-row__main"><span class="trpg-row__title">{{ t.name }}</span><div class="trpg-row__meta">{{ daysAgo(t.deletedAt) }} 天前删除 · {{ Math.max(0, TRASH_DAYS - daysAgo(t.deletedAt)) }} 天后清除 · {{ formatTime(t.deletedAt) }}</div></div>
          <div class="trpg-row__end">
            <button class="trpg-btn trpg-btn--small" type="button" @click="restoreTrash(t.id).then(loadTrash)">恢复</button>
            <button class="trpg-btn trpg-btn--small" type="button" @click="purgeTrashFlow(t.id, t.name).then(loadTrash)">彻底删除</button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

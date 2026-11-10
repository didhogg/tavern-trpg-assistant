<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { chooseEntry, disabledEntries, type EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Checkbox from '../kit/Checkbox.vue'
import Segmented from '../kit/Segmented.vue'
import { levelText, loadEditRows, restoreRows, type EditRow } from './edit-rows'
import { nameOf } from './pack-data'

/** 包的【管理】（弹窗里的一页）：停用项目、被编辑 / 覆盖的条目；全部 / 部分勾选复原。只看这一本书 / 包里的。 */
const props = defineProps<{ set: string; source: string; name: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const tab = ref('disabled')

interface OffRow { ref: EntryRef; name: string; picked: boolean }
const off = ref<OffRow[]>([])
const edits = ref<EditRow[]>([])
const loading = ref(true)
const canWrite = computed(() => lib.bound && !!campaign.owner)

async function load(): Promise<void> {
  loading.value = true
  try {
    const s = app.svc()
    const c = lib.campaignLib
    const rows: OffRow[] = []
    for (const ref of c ? disabledEntries(c) : []) {
      const stored = await s.backend.library.scoped.storedItem(ref)
      if (stored?.source === props.source) rows.push({ ref, name: nameOf(stored.item), picked: false })
    }
    off.value = rows
    edits.value = await loadEditRows(s, props.source)
  } catch (e) { console.error('[trpg-assistant] 读取管理页失败', e); toast.error('读取管理页失败') } finally { loading.value = false }
}
onMounted(() => void load())

async function enableAgain(): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !canWrite.value) return
  const ks = app.svc().backend.kernelSave
  let cur = await ks.libraryOf(owner)
  for (const r of off.value.filter((x) => x.picked)) cur = { ...cur, ...chooseEntry(cur, r.ref, true) }
  await ks.setLibrary(owner, cur)
  toast.success('已复原')
  await lib.load(app.svc(), owner)
  await load()
}
async function restore(): Promise<void> {
  const c = lib.campaignLib
  if (!c) return
  try { await restoreRows(app.svc(), c, edits.value.filter((r) => r.picked), lib.bound ? campaign.owner?.ownerKey ?? null : null); toast.success('已复原'); await load() } catch (e) { console.error('[trpg-assistant] 复原失败', e); toast.error('复原没有成功') }
}
</script>

<template>
  <div class="lib-mbody" data-testid="manage-page">
    <div class="lib-filter"><Segmented v-model="tab" label="管理分区" :options="[{ value: 'disabled', label: '停用项目' }, { value: 'edits', label: '被编辑 / 覆盖' }]" /></div>
    <div class="lib-mscroll">
<div class="lib-pad">
      <div v-if="loading" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
      <template v-else-if="tab === 'disabled'">
        <p v-if="!off.length" class="lib-muted">没有停用的条目。</p>
        <template v-else>
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" style="justify-self: start" :disabled="!canWrite || !off.some((r) => r.picked)" @click="enableAgain">复原所选（{{ off.filter((r) => r.picked).length }}）</button>
          <Checkbox v-for="r in off" :key="`${r.ref.prop}:${r.ref.hash}`" v-model="r.picked"><b class="lib-name">{{ r.name }}</b></Checkbox>
        </template>
      </template>
      <template v-else>
        <p v-if="!edits.length" class="lib-muted">没有被编辑或覆盖的条目。</p>
        <template v-else>
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" style="justify-self: start" :disabled="!edits.some((r) => r.picked)" @click="restore">复原所选（{{ edits.filter((r) => r.picked).length }}）</button>
          <Checkbox v-for="r in edits" :key="`${r.level}|${r.target}`" v-model="r.picked"><b class="lib-name">{{ r.name }}</b><span class="lib-src">（{{ levelText(r.level) }}）</span></Checkbox>
        </template>
      </template>
    </div>
</div>
  </div>
</template>

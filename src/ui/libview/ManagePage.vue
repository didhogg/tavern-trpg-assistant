<script setup lang="ts">
import PackDeps from './PackDeps.vue'
import { computed, onMounted, ref } from 'vue'
import { chooseEntry, disabledEntries, type EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Checkbox from '../kit/Checkbox.vue'
import Segmented from '../kit/Segmented.vue'
import OverridesList from './OverridesList.vue'
import { nameOf } from './pack-data'
import Icon from '../kit/Icon.vue'

/** 包的【管理】（弹窗里的一页）：停用项目、房规（覆盖）（P5.5 u7-14 同一个列表）。只看这一本书 / 包里的；source 为空 = 整个书架。 */
const props = defineProps<{ set: string; source: string; name: string; docIdLocal?: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const tab = ref('disabled')
const missingCount = ref(0)

interface OffRow { ref: EntryRef; name: string; picked: boolean }
const off = ref<OffRow[]>([])
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
      if (stored && (!props.source || stored.source === props.source)) rows.push({ ref, name: nameOf(stored.item), picked: false })
    }
    off.value = rows
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
</script>

<template>
  <div class="lib-mbody" data-testid="manage-page">
    <div class="lib-filter"><Segmented v-model="tab" label="管理分区" :options="[{ value: 'disabled', label: '停用项目' }, { value: 'edits', label: '房规（覆盖）' }, ...(docIdLocal ? [{ value: 'deps', label: missingCount ? `依赖包 ⚠${missingCount}` : '依赖包' }] : [])]" /></div>
    <div v-if="missingCount && tab !== 'deps'" class="lib-banner lib-banner--warn" data-testid="manage-missing-deps"><Icon name="warning" :size="16" /><span>这个包缺 {{ missingCount }} 个依赖，缺了会读不出。</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="tab = 'deps'">查看并下载</button></div>
    <div class="lib-mscroll">
<div class="lib-pad">
      <PackDeps v-if="docIdLocal" v-show="tab === 'deps'" :set="set" :doc-id-local="docIdLocal" @missing="(n: number) => (missingCount = n)" />
      <div v-if="tab !== 'deps' && loading" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
      <template v-else-if="tab === 'disabled'">
        <p v-if="!off.length" class="lib-muted">没有停用的条目。</p>
        <template v-else>
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" style="justify-self: start" :disabled="!canWrite || !off.some((r) => r.picked)" @click="enableAgain">复原所选（{{ off.filter((r) => r.picked).length }}）</button>
          <Checkbox v-for="r in off" :key="`${r.ref.prop}:${r.ref.hash}`" v-model="r.picked"><b class="lib-name">{{ r.name }}</b></Checkbox>
        </template>
      </template>
      <OverridesList v-else-if="tab === 'edits'" :scope="source ? { kind: 'sources', sources: [source] } : { kind: 'all' }" />
    </div>
</div>
  </div>
</template>

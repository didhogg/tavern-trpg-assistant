<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useSavesStore } from '../../stores/saves'
import { useToastStore } from '../../stores/toast'
import { askConfirm } from '../kit/confirm'
import Segmented from '../kit/Segmented.vue'
import { errorText } from '../format'
import { openWizard, loadSaveFlow, saveNow } from './actions'
import { openExport, openImportPicker } from './fileActions'
import BranchPopover from './BranchPopover.vue'
import SaveFolds from './SaveFolds.vue'
import SaveRow from './SaveRow.vue'

const app = useAppStore()
const campaign = useCampaignStore()
const saves = useSavesStore()
const toast = useToastStore()
const search = ref('')
const picker = ref<HTMLInputElement | null>(null)

onMounted(() => void saves.refresh().catch((e) => console.error('[trpg-assistant] 读取存档列表失败', e)))

const current = computed(() => campaign.currentSave)
const rules = computed(() => app.services?.rules)
const ruleName = (id: string) => rules.value?.get(id)?.nameShort ?? id
const ruleInstalled = (id: string) => !!rules.value?.has(id)
const filtered = computed(() => {
  const q = search.value.trim()
  return q ? saves.manual.filter((s) => s.name.includes(q) || s.note.includes(q)) : saves.manual
})
const groups = computed(() => {
  const map = new Map<string, typeof saves.everything>()
  for (const s of saves.everything) map.set(s.ruleId, [...(map.get(s.ruleId) ?? []), s])
  return [...map]
})

async function guarded<T>(action: () => Promise<T>, failure: string): Promise<T | undefined> {
  try {
    return await action()
  } catch (error) {
    console.error(`[trpg-assistant] ${failure}`, error)
    toast.error(`${failure}：${errorText(error)}`)
    return undefined
  }
}

async function onBranch(name: string): Promise<void> {
  const save = await guarded(() => campaign.branch(name), '创建分支失败')
  if (!save) return
  await saves.refresh()
  toast.success(`已切换到「${save.name}」`)
}

async function onRemove(id: string, name: string): Promise<void> {
  const removed = await guarded(() => saves.remove(id), '删除失败')
  if (removed) toast.undoable(`已删除「${name}」`, async () => void (await guarded(() => saves.restore(id), '撤销失败')))
}

async function onPurge(id: string, name: string): Promise<void> {
  const ok = await askConfirm({ title: '彻底删除存档', message: `「${name}」将被永久删除，无法恢复。`, confirmLabel: '彻底删除', danger: true })
  if (ok) await guarded(() => saves.purge([id]), '删除失败')
}

async function onPurgeAll(): Promise<void> {
  const n = saves.deleted.length
  const ok = await askConfirm({ title: '清空最近删除', message: `最近删除中的 ${n} 个存档将被永久删除，无法恢复。`, confirmLabel: '彻底删除', danger: true })
  if (ok) await guarded(() => saves.purge(saves.deleted.map((s) => s.id)), '清空失败')
}

async function onFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await openImportPicker(file)
}
</script>

<template>
  <div class="trpg-drawer" data-testid="save-drawer">
    <section v-if="campaign.hasCampaign" class="trpg-drawer__current">
      <div class="trpg-drawer__name">
        <span class="trpg-drawer__title">{{ current?.name ?? '当前存档' }}</span>
        <span v-if="campaign.dirty" class="trpg-badge" data-tone="warn">● 有未保存改动</span>
      </div>
      <div class="trpg-drawer__buttons">
        <button class="trpg-btn trpg-btn--primary" type="button" :disabled="campaign.readOnly || !campaign.dirty" @click="saveNow()">{{ campaign.dirty ? '保存' : '已是最新' }}</button>
        <BranchPopover :default-name="`${current?.name ?? '存档'} 分支`" :disabled="campaign.readOnly" @create="onBranch" />
        <button v-if="current" class="trpg-btn" type="button" @click="openExport(current.id)">导出…</button>
      </div>
      <p v-if="app.reminder" class="trpg-field__hint" :class="{ 'trpg-warn': app.reminder.kind === 'due' }">{{ app.reminder.text }}</p>
    </section>
    <section v-else class="trpg-drawer__current"><p class="page-intro">还没有当前战役</p></section>

    <template v-if="campaign.hasCampaign">
      <div class="trpg-drawer__filter">
        <Segmented :model-value="saves.scope" label="存档范围" :options="[{ value: 'card', label: '本卡' }, { value: 'all', label: '全部' }]" @update:model-value="saves.setScope($event as 'card' | 'all')" />
        <input v-if="saves.manual.length > 8" v-model="search" class="trpg-input" type="search" placeholder="按存档名或备注搜索" aria-label="搜索存档" />
        <span v-if="saves.manual.length > 8" class="trpg-field__hint">共 {{ filtered.length }} 个</span>
      </div>
      <ul v-if="filtered.length" class="trpg-saves">
        <SaveRow
          v-for="s in filtered"
          :key="s.id"
          :save="s"
          :current="s.id === current?.id"
          :card-badge="saves.scope === 'all'"
          :read-only="campaign.readOnly"
          @load="loadSaveFlow(s)"
          @rename="(n) => guarded(() => saves.rename(s.id, n), '改名失败')"
          @note="(n) => guarded(() => saves.setNote(s.id, n), '保存备注失败')"
          @export="openExport(s.id)"
          @remove="onRemove(s.id, s.name)"
        />
      </ul>
      <div v-else-if="!saves.loading" class="trpg-empty">
        <p>{{ search ? '没有符合的存档' : '这张卡还没有存档' }}</p>
        <button v-if="search" class="trpg-btn" type="button" @click="search = ''">清除搜索</button>
        <button v-else class="trpg-btn trpg-btn--primary" type="button" @click="openWizard()">＋ 新存档</button>
      </div>
      <SaveFolds
        :autos="saves.autos"
        :deleted="saves.deleted"
        :others="saves.otherRules"
        :read-only="campaign.readOnly"
        :rule-name="ruleName"
        :rule-installed="ruleInstalled"
        @load="loadSaveFlow"
        @auto-as-manual="(s) => guarded(() => saves.autoAsManual(s.id), '另存失败')"
        @restore="(s) => guarded(() => saves.restore(s.id), '恢复失败')"
        @purge="(s) => onPurge(s.id, s.name)"
        @purge-all="onPurgeAll"
      />
    </template>
    <template v-else>
      <div v-for="[ruleId, list] in groups" :key="ruleId" class="trpg-group-block">
        <h3 class="trpg-group">{{ ruleName(ruleId) }}（{{ list.length }}）</h3>
        <ul class="trpg-saves">
          <SaveRow v-for="s in list" :key="s.id" :save="s" card-badge @load="loadSaveFlow(s)" @rename="(n) => guarded(() => saves.rename(s.id, n), '改名失败')" @note="(n) => guarded(() => saves.setNote(s.id, n), '保存备注失败')" @export="openExport(s.id)" @remove="onRemove(s.id, s.name)" />
        </ul>
      </div>
    </template>

    <footer class="trpg-drawer__bottom">
      <button v-if="campaign.hasCampaign && saves.manual.length" class="trpg-btn trpg-btn--primary" type="button" :disabled="campaign.readOnly" @click="openWizard()">＋ 新存档</button>
      <button class="trpg-btn" type="button" :disabled="campaign.readOnly" @click="picker?.click()">导入存档文件</button>
      <input ref="picker" class="trpg-sr-only" type="file" accept=".trpgsave,.trpgpack,.zip" tabindex="-1" aria-hidden="true" @change="onFile" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CampaignNode } from '../../core/saves/view'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useSavesStore } from '../../stores/saves'
import { useToastStore } from '../../stores/toast'
import { askConfirm } from '../kit/confirm'
import Icon from '../kit/Icon.vue'
import { errorText } from '../format'
import { openLoadConfirm, openWizard, saveNow } from './actions'
import BranchPopover from './BranchPopover.vue'
import CampaignCard from './CampaignCard.vue'
import { openExport, openImportPicker } from './fileActions'
import SaveFolds from './SaveFolds.vue'

const app = useAppStore()
const campaign = useCampaignStore()
const saves = useSavesStore()
const toast = useToastStore()
const picker = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

onMounted(() => void saves.refresh().catch((e) => console.error('[trpg-assistant] 读取存档列表失败', e)))

const current = computed(() => campaign.currentSave)
const view = computed(() => saves.view)
const rules = computed(() => app.services?.rules)
const ruleName = (id: string) => rules.value?.get(id)?.nameShort ?? id
const ruleInstalled = (id: string) => !!rules.value?.has(id)
const thisCampaign = computed(() => (view.value?.root ? [view.value.root, ...view.value.branches] : []))
const others = computed(() => view.value?.otherCampaigns ?? [])
/** 没有当前战役时：每条已安装规则的战役，拍平成一个列表。 */
const idle = computed(() => saves.byRule.flatMap((r) => r.view.otherCampaigns.map((c) => ({ ruleId: r.ruleId, c }))))

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

/** 删除：有子分支时先说清后果（分支会变成独立战役）；删完可在提示条里 6 秒内撤销。 */
async function onRemove(node: CampaignNode, members: CampaignNode[]): Promise<void> {
  const kids = members.filter((m) => m.parentId === node.id)
  if (kids.length) {
    const ok = await askConfirm({
      title: `删除「${node.name}」？`,
      message: `「${node.name}」会进入"最近删除"，可以随时恢复。`,
      details: [`它下面的分支${kids.map((k) => `「${k.name}」`).join('')}会变成独立战役，内容不会丢。`],
      confirmLabel: '删除',
      danger: true,
    })
    if (!ok) return
  }
  const removed = await guarded(() => saves.remove(node.id), '删除失败')
  if (removed) toast.undoable(`已删除「${node.name}」`, async () => void (await guarded(() => saves.restore(node.id), '撤销失败')))
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

async function onDrop(event: DragEvent): Promise<void> {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && !campaign.readOnly) await openImportPicker(file)
}
async function onFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await openImportPicker(file)
}
const rename = (node: CampaignNode, name: string) => guarded(() => saves.rename(node.id, name), '改名失败')
const note = (node: CampaignNode, text: string) => guarded(() => saves.setNote(node.id, text), '保存备注失败')
</script>

<template>
  <div class="trpg-drawer" data-testid="save-drawer" :data-dragging="dragging" @dragover.prevent="dragging = true" @dragleave.self="dragging = false" @drop.prevent="onDrop">
    <section v-if="campaign.hasCampaign" class="trpg-drawer__current" data-testid="drawer-current">
      <div>
        <span class="trpg-drawer__title">当前存档：{{ current?.name ?? '' }}</span>
        <span v-if="campaign.dirty" class="trpg-badge" data-tone="warn" style="margin-left: 8px">● 有未保存到存档的改动</span>
      </div>
      <div class="trpg-drawer__buttons">
        <button class="trpg-btn trpg-btn--primary" type="button" data-testid="drawer-save" :disabled="campaign.readOnly || !campaign.dirty" @click="saveNow()"><Icon name="floppy-disk" :size="16" />{{ campaign.dirty ? '保存存档' : '已是最新' }}</button>
        <BranchPopover :default-name="`${current?.name ?? '存档'} 分支`" :disabled="campaign.readOnly" @create="onBranch" />
        <button v-if="current" class="trpg-btn" type="button" @click="openExport(current.id)">导出…</button>
      </div>
      <span v-if="app.reminder" class="trpg-field__hint" :class="{ 'trpg-warn': app.reminder.kind === 'due' }" data-testid="backup-reminder">{{ app.reminder.text }}</span>
    </section>

    <div class="trpg-drawer__body">
      <template v-if="campaign.hasCampaign">
        <h3 class="trpg-group trpg-group--first">当前战役</h3>
        <CampaignCard
          v-if="view?.root"
          :name="view.name ?? ''"
          :updated-at="Math.max(...thisCampaign.map((m) => m.updatedAt))"
          :rule-name="ruleName(view.root.ruleId)"
          :members="thisCampaign"
          :current-id="current?.id"
          :read-only="campaign.readOnly"
          open
          @load="openLoadConfirm"
          @rename-campaign="(n) => view?.root && rename(view.root, n)"
          @rename="rename"
          @note="note"
          @export="(n) => openExport(n.id)"
          @remove="(n) => onRemove(n, thisCampaign)"
        />
        <template v-if="others.length">
          <h3 class="trpg-group">其他战役（{{ others.length }}）</h3>
          <CampaignCard
            v-for="o in others"
            :key="o.root.id"
            :name="o.root.name"
            :updated-at="o.updatedAt"
            :rule-name="ruleName(o.root.ruleId)"
            :owner-label="o.sameCard ? undefined : o.root.ownerLabel"
            :members="o.members"
            :read-only="campaign.readOnly"
            @load="openLoadConfirm"
            @rename-campaign="(n) => rename(o.root, n)"
            @rename="rename"
            @note="note"
            @export="(n) => openExport(n.id)"
            @remove="(n) => onRemove(n, o.members)"
          />
        </template>
      </template>
      <template v-else>
        <h3 v-if="idle.length" class="trpg-group trpg-group--first">战役（{{ idle.length }}）</h3>
        <CampaignCard
          v-for="(o, i) in idle"
          :key="o.c.root.id"
          :name="o.c.root.name"
          :updated-at="o.c.updatedAt"
          :rule-name="ruleName(o.ruleId)"
          :owner-label="o.c.sameCard ? undefined : o.c.root.ownerLabel"
          :members="o.c.members"
          :read-only="campaign.readOnly"
          :open="i === 0"
          @load="openLoadConfirm"
          @rename-campaign="(n) => rename(o.c.root, n)"
          @rename="rename"
          @note="note"
          @export="(n) => openExport(n.id)"
          @remove="(n) => onRemove(n, o.c.members)"
        />
      </template>
      <SaveFolds
        :autos="saves.autos"
        :deleted="saves.deleted"
        :others="saves.otherRules"
        :read-only="campaign.readOnly"
        :rule-name="ruleName"
        :rule-installed="ruleInstalled"
        @load="openLoadConfirm"
        @auto-as-manual="(s) => guarded(() => saves.autoAsManual(s.id), '另存失败')"
        @restore="(s) => guarded(() => saves.restore(s.id), '恢复失败')"
        @purge="(s) => onPurge(s.id, s.name)"
        @purge-all="onPurgeAll"
      />
    </div>

    <footer class="trpg-drawer__bottom">
      <button v-if="campaign.hasCampaign" class="trpg-btn" type="button" data-testid="drawer-new" :disabled="campaign.readOnly" @click="openWizard()"><Icon name="plus" :size="16" />新建战役</button>
      <button class="trpg-btn" type="button" data-testid="drawer-import" :disabled="campaign.readOnly" @click="picker?.click()"><Icon name="upload-simple" :size="16" />导入存档</button>
      <input ref="picker" class="trpg-sr-only" type="file" accept=".trpgsave,.zip" tabindex="-1" aria-hidden="true" @change="onFile" />
    </footer>
  </div>
</template>

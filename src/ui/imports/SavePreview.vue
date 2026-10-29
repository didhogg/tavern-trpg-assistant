<script setup lang="ts">
import { computed, ref } from 'vue'
import { attachedPackFiles, describeSaveFile, importSaves } from '../../core/transfer/importer'
import type { RecognizedPack, RecognizedSaveFile } from '../../core/packs/recognize'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { useSavesStore } from '../../stores/saves'
import { useToastStore } from '../../stores/toast'
import { errorText, formatTime } from '../format'
import Checkbox from '../kit/Checkbox.vue'
import Segmented from '../kit/Segmented.vue'
import { askConfirm } from '../kit/confirm'
import { decideResolution } from './decide'

const props = defineProps<{ rec: RecognizedSaveFile }>()
const app = useAppStore()
const campaign = useCampaignStore()
const library = useLibraryStore()
const modal = useModalStore()
const saves = useSavesStore()
const toast = useToastStore()

const items = computed(() => describeSaveFile(props.rec, (id) => app.svc().rules.has(id)))
const selected = ref<string[]>(items.value.filter((i) => i.selectable).map((i) => i.save.id))
const mode = ref<'merge' | 'overwrite'>('merge')
const working = ref(false)
const isBackup = computed(() => props.rec.type === 'backup')
const ruleName = (id: string) => app.svc().rules.get(id)?.nameShort ?? id
const count = computed(() => (isBackup.value && mode.value === 'overwrite' ? items.value.filter((i) => i.selectable).length : selected.value.length))
const attached = computed(() => attachedPackFiles(props.rec))
const kind = computed(() => (isBackup.value ? `完整备份 · ${props.rec.saves.length} 个存档` : `存档文件 · ${props.rec.saves.length} 个存档`))

function toggle(id: string, on: boolean): void {
  selected.value = on ? [...selected.value, id] : selected.value.filter((x) => x !== id)
}

async function installAttached(): Promise<number> {
  let installed = 0
  for (const file of attached.value) {
    const rec = app.svc().packs.recognize(file.bytes)
    if (rec.type !== 'pack') continue
    const plan = await app.svc().packs.plan(rec as RecognizedPack)
    if (plan.action === 'overwrite' && plan.relation !== 'newer') continue
    const decision = await decideResolution(rec as RecognizedPack, plan)
    if (!decision.ok) continue
    await library.installFile(rec as RecognizedPack, decision.resolution)
    installed++
  }
  return installed
}

async function doImport(): Promise<void> {
  const owner = campaign.owner
  if (!owner) {
    toast.error('请先在酒馆中打开一个聊天')
    return
  }
  if (isBackup.value && mode.value === 'overwrite') {
    const ok = await askConfirm({
      title: '覆盖并恢复',
      message: '先写入自动存档，再用备份替换全部存档、当前数据与设置。',
      confirmLabel: '覆盖并恢复',
      danger: true,
    })
    if (!ok) return
  }
  working.value = true
  try {
    const packs = await installAttached()
    const s = app.svc()
    const result = await importSaves({ db: s.db, campaign: s.campaign, now: s.now, hasRule: (id) => s.rules.has(id) }, props.rec, { owner, selectedIds: selected.value, mode: isBackup.value ? mode.value : undefined })
    await campaign.switchOwner(owner)
    await saves.refresh()
    toast.success(`已导入 ${result.imported} 个存档${packs ? `，安装了 ${packs} 个扩展包` : ''}`)
    modal.close(true)
  } catch (error) {
    console.error('[trpg-assistant] 导入存档失败', error)
    toast.error(`导入失败：${errorText(error)}`)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="page-stack" data-testid="import-save">
    <p class="trpg-import__ok">✓ 已识别：{{ kind }}</p>
    <div v-if="isBackup" class="trpg-field">
      <Segmented v-model="mode" label="恢复方式" :options="[{ value: 'merge', label: '合并' }, { value: 'overwrite', label: '覆盖' }]" />
      <span class="trpg-field__hint">{{ mode === 'merge' ? '只添加尚不存在的存档与当前数据。' : '先写自动存档，再用备份替换全部存档、当前数据与设置。' }}</span>
    </div>
    <ul class="trpg-list">
      <li v-for="item in items" :key="item.save.id" class="trpg-row">
        <Checkbox :model-value="selected.includes(item.save.id)" :disabled="!item.selectable || (isBackup && mode === 'overwrite')" @update:model-value="toggle(item.save.id, $event)">
          <span class="trpg-row__title">{{ item.save.name }}</span>
        </Checkbox>
        <span class="trpg-row__meta">{{ ruleName(item.save.ruleId) }} · {{ formatTime(item.save.updatedAt) }}<template v-if="item.reason"> · {{ item.reason }}（不可选）</template></span>
      </li>
    </ul>
    <p v-if="attached.length" class="trpg-field__hint">附带扩展包：{{ attached.length }} 个（将一并安装）</p>
    <p class="trpg-field__hint">导入为「{{ campaign.owner?.ownerLabel ?? '当前角色卡' }}」的存档；重名时名称后加"（导入）"。</p>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" @click="modal.close(true)">取消</button>
      <button class="trpg-btn" :class="isBackup && mode === 'overwrite' ? 'trpg-btn--danger' : 'trpg-btn--primary'" type="button" :disabled="working || count === 0" @click="doImport">
        {{ isBackup && mode === 'overwrite' ? '覆盖并恢复' : `导入 ${count} 个` }}
      </button>
    </div>
  </div>
</template>

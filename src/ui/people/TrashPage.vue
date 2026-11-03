<script setup lang="ts">
import { computed, ref } from 'vue'
import { PEOPLE_CATEGORY_LABELS, type Person } from '../../schemas/people'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { usePeopleStore } from '../../stores/people'
import { useToastStore } from '../../stores/toast'
import Checkbox from '../kit/Checkbox.vue'
import EntityAvatar from '../kit/EntityAvatar.vue'

const campaign = useCampaignStore()
const modal = useModalStore()
const people = usePeopleStore()
const toast = useToastStore()
const selected = ref(new Set<string>())
const confirming = ref(false)
const rows = computed(() => people.trashed)
const allSelected = computed(() => rows.value.length > 0 && rows.value.every((p) => selected.value.has(p.id)))
const someSelected = computed(() => selected.value.size > 0 && !allSelected.value)
const dayText = (time: number | undefined): string => {
  if (!time) return '今天删除'
  const days = Math.floor((Date.now() - time) / 86_400_000)
  return days <= 0 ? '今天删除' : `${days} 天前删除`
}
function toggle(id: string, value: boolean): void {
  const next = new Set(selected.value)
  if (value) next.add(id); else next.delete(id)
  selected.value = next
}
function toggleAll(value: boolean): void { selected.value = value ? new Set(rows.value.map((p) => p.id)) : new Set() }
function namesOf(list: Person[]): string {
  const names = list.map((p) => p.name)
  return names.length > 5 ? `${names.slice(0, 5).join('、')}等 ${names.length} 人` : names.join('、')
}
function restore(ids: string[]): void {
  people.restore(ids)
  toast.success(`已恢复 ${ids.length} 人`)
  selected.value = new Set()
  confirming.value = false
}
function purge(): void {
  const ids = [...selected.value]
  people.purge(ids)
  toast.success(`已彻底删除 ${ids.length} 人`)
  selected.value = new Set()
  confirming.value = false
}
</script>

<template>
  <div class="trpg-trash" data-testid="trash-page">
    <div class="trpg-trash__head">
      <Checkbox :model-value="allSelected" :indeterminate="someSelected" label="全选" @update:model-value="toggleAll">全选 {{ rows.length }} 人</Checkbox>
      <span class="trpg-field__hint">已选 {{ selected.size }} 人</span>
      <span class="trpg-trash__actions">
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="!selected.size || campaign.readOnly" @click="restore([...selected])">{{ selected.size ? `恢复 ${selected.size} 人` : '恢复所选' }}</button>
        <button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" :disabled="!selected.size || campaign.readOnly" @click="confirming = true">{{ selected.size ? `彻底删除 ${selected.size} 人` : '彻底删除所选' }}</button>
      </span>
    </div>
    <div v-if="confirming" class="trpg-inline-confirm" role="alert">
      <span>彻底删除 {{ namesOf(rows.filter((p) => selected.has(p.id))) }}？删了就找不回来。</span>
      <button class="trpg-btn trpg-btn--small" type="button" @click="confirming = false">取消</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" @click="purge">彻底删除</button>
    </div>
    <p v-if="!rows.length" class="trpg-empty">回收站是空的</p>
    <ul v-else class="trpg-trash__list">
      <li v-for="person in rows" :key="person.id" class="trpg-trash__row" :data-testid="`trash-row-${person.id}`">
        <Checkbox :model-value="selected.has(person.id)" :label="`选择 ${person.name}`" @update:model-value="(v) => toggle(person.id, v)" />
        <EntityAvatar :art="person.block.art" :creature-type="person.block.creatureType?.type" :size="36" :label="person.name" />
        <span class="trpg-trash__name">{{ person.name }}</span>
        <span class="trpg-row__meta">原来在：{{ person.trashedFrom ? PEOPLE_CATEGORY_LABELS[person.trashedFrom] : PEOPLE_CATEGORY_LABELS[person.categoryId] }} · {{ dayText(person.trashedAt) }}</span>
        <span class="trpg-trash__actions">
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="campaign.readOnly" @click="restore([person.id])">恢复</button>
          <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="campaign.readOnly" @click="selected = new Set([person.id]); confirming = true">彻底删除</button>
        </span>
      </li>
    </ul>
    <div class="trpg-trash__foot"><button class="trpg-btn" type="button" @click="modal.requestClose()">关闭</button></div>
  </div>
</template>

<style scoped>
.trpg-trash { display: grid; gap: 8px; }
.trpg-trash__head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.trpg-trash__head .trpg-field__hint { margin-right: auto; }
.trpg-trash__actions { display: flex; gap: 2px; }
.trpg-trash__list { list-style: none; margin: 0; padding: 0; }
.trpg-trash__row { display: flex; align-items: center; gap: 8px; min-height: 52px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.trpg-trash__name { flex: 1; min-width: 80px; font-weight: 600; }
.trpg-trash__foot { display: flex; justify-content: flex-end; }
.trpg-inline-confirm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 10px; border-left: 3px solid var(--danger); background: var(--panel); }
</style>

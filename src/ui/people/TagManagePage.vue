<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { usePeopleStore } from '../../stores/people'
import { useToastStore } from '../../stores/toast'
import { errorText } from '../format'
import EmptyState from '../kit/EmptyState.vue'

const campaign = useCampaignStore()
const modal = useModalStore()
const people = usePeopleStore()
const toast = useToastStore()
const newName = ref('')
const newError = ref('')
const renameId = ref<string | null>(null)
const renameValue = ref('')
const renameError = ref('')
const deleteId = ref<string | null>(null)
const counts = computed(() => {
  const map: Record<string, number> = {}
  for (const person of people.people) for (const id of person.tags) map[id] = (map[id] ?? 0) + 1
  return map
})
function create(): void {
  try {
    people.createTag(newName.value)
    newName.value = ''
    newError.value = ''
  } catch (error) { newError.value = errorText(error) }
}
function startRename(id: string, name: string): void { renameId.value = id; renameValue.value = name; renameError.value = '' }
function saveRename(): void {
  if (!renameId.value) return
  try {
    people.renameTag(renameId.value, renameValue.value)
    renameId.value = null
    renameError.value = ''
  } catch (error) { renameError.value = errorText(error) }
}
function remove(id: string): void {
  people.deleteTag(id)
  deleteId.value = null
  toast.success('已删除标签')
}
</script>

<template>
  <div class="trpg-tag-manage trpg-dialog" data-testid="tag-manage">
    <div class="trpg-tag-manage__new">
      <input v-model="newName" class="trpg-input" maxlength="24" placeholder="新标签" aria-label="新标签" :disabled="campaign.readOnly" @keydown.enter.prevent="create" />
      <button class="trpg-btn" type="button" :disabled="campaign.readOnly || !newName.trim()" @click="create">新建</button>
    </div>
    <p v-if="newError" class="trpg-field__error" role="alert">{{ newError }}</p>
    <EmptyState v-if="!people.tags.length" icon="tag" text="还没有标签" />
    <ul v-else class="trpg-tag-manage__list">
      <li v-for="tag in people.tags" :key="tag.id" class="trpg-tag-manage__row">
        <template v-if="renameId === tag.id">
          <input v-model="renameValue" class="trpg-input" maxlength="24" :aria-label="`改名 ${tag.name}`" data-autofocus @keydown.enter.prevent="saveRename" @keydown.esc.prevent="renameId = null" />
          <button class="trpg-btn trpg-btn--small" type="button" @click="saveRename">保存</button>
          <button class="trpg-btn trpg-btn--small" type="button" @click="renameId = null">取消</button>
          <span v-if="renameError" class="trpg-field__error" role="alert">{{ renameError }}</span>
        </template>
        <template v-else>
          <span class="trpg-tag-manage__name"><span class="trpg-pill trpg-tag-manage__pill">{{ tag.name }}</span></span>
          <span class="trpg-tag-manage__count">{{ counts[tag.id] ?? 0 }} 人</span>
          <span class="trpg-tag-manage__actions">
            <button class="trpg-btn trpg-btn--small" type="button" :disabled="campaign.readOnly" @click="startRename(tag.id, tag.name)">改名</button>
            <button class="trpg-btn trpg-btn--small trpg-btn--dangertext" type="button" :disabled="campaign.readOnly" @click="deleteId = tag.id">删除</button>
          </span>
        </template>
      </li>
    </ul>
    <div v-if="deleteId" class="trpg-inline-confirm" role="alert">
      <span>删除标签「{{ people.tags.find((t) => t.id === deleteId)?.name }}」？会从 {{ counts[deleteId] ?? 0 }} 个人身上拿掉，人不受影响。</span>
      <button class="trpg-btn trpg-btn--small" type="button" @click="deleteId = null">取消</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" @click="remove(deleteId!)">删除</button>
    </div>
    <div class="trpg-dialog__foot"><button class="trpg-btn" type="button" @click="modal.requestClose()">关闭</button></div>
  </div>
</template>

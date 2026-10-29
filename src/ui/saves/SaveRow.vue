<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { SaveSlot } from '../../schemas/campaign'
import { SAVE_NAME_MAX, SAVE_NOTE_MAX } from '../../schemas/campaign'
import { formatTime, summaryLine } from '../format'
import MoreMenu, { type MenuItem } from '../kit/MoreMenu.vue'

const props = defineProps<{ save: SaveSlot; current?: boolean; cardBadge?: boolean; readOnly?: boolean }>()
const emit = defineEmits<{
  load: []
  rename: [name: string]
  note: [note: string]
  export: []
  remove: []
}>()

const renaming = ref(false)
const draft = ref('')
const noting = ref(false)
const noteDraft = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

const items = (): MenuItem[] => [
  { key: 'rename', label: '改名', disabled: props.readOnly, reason: '只读窗口不能修改' },
  { key: 'note', label: '备注', disabled: props.readOnly, reason: '只读窗口不能修改' },
  { key: 'export', label: '导出' },
  ...(props.current ? [] : [{ key: 'remove', label: '删除', danger: true, disabled: props.readOnly, reason: '只读窗口不能修改' }]),
]

async function onMenu(key: string): Promise<void> {
  if (key === 'rename') {
    draft.value = props.save.name
    renaming.value = true
    await nextTick()
    nameInput.value?.focus()
    nameInput.value?.select()
  } else if (key === 'note') {
    noteDraft.value = props.save.note
    noting.value = true
  } else if (key === 'export') emit('export')
  else if (key === 'remove') emit('remove')
}

function commitRename(): void {
  if (!renaming.value) return
  renaming.value = false
  const name = draft.value.trim()
  if (name && name !== props.save.name) emit('rename', name)
}

function commitNote(): void {
  noting.value = false
  if (noteDraft.value !== props.save.note) emit('note', noteDraft.value)
}
</script>

<template>
  <li class="trpg-save" :data-current="current" :data-testid="`save-${save.name}`">
    <div class="trpg-save__main">
      <div class="trpg-save__top">
        <input
          v-if="renaming"
          ref="nameInput"
          v-model="draft"
          class="trpg-input trpg-save__rename"
          :maxlength="SAVE_NAME_MAX"
          aria-label="存档名"
          @keydown.enter.prevent="commitRename"
          @keydown.esc.stop.prevent="renaming = false"
          @blur="commitRename"
        />
        <span v-else class="trpg-save__name">{{ save.name }}</span>
        <span v-if="current" class="trpg-badge" data-tone="gold">当前</span>
        <span v-if="cardBadge" class="trpg-badge">{{ save.ownerLabel }}</span>
        <span class="trpg-save__time">{{ formatTime(save.updatedAt) }}</span>
      </div>
      <div v-if="summaryLine(save)" class="trpg-row__meta">{{ summaryLine(save) }}</div>
      <div v-if="save.note && !noting" class="trpg-row__meta trpg-save__note">{{ save.note.split('\n')[0] }}</div>
      <div v-if="noting" class="trpg-save__noteedit">
        <textarea v-model="noteDraft" class="trpg-input" :maxlength="SAVE_NOTE_MAX" aria-label="备注" rows="2" @keydown.esc.stop.prevent="noting = false" />
        <div class="trpg-save__noteactions">
          <button class="trpg-btn trpg-btn--small" type="button" @click="noting = false">取消</button>
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" @click="commitNote">保存</button>
        </div>
      </div>
    </div>
    <div class="trpg-row__end">
      <button v-if="!current" class="trpg-btn" type="button" :disabled="readOnly" @click="emit('load')">读取</button>
      <MoreMenu :label="save.name" :items="items()" @select="onMenu" />
    </div>
  </li>
</template>

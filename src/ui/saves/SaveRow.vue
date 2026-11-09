<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { SAVE_NAME_MAX, SAVE_NOTE_MAX, type SaveSummary } from '../../schemas/campaign'
import { formatTime, summaryLine } from '../format'
import MoreMenu, { type MenuItem } from '../kit/MoreMenu.vue'

/** 战役卡片里的一行存档：左对齐、不缩进；当前存档用圆角高亮外框；父子关系用文字"来自「…」"表达。 */
const props = defineProps<{
  id: string
  name: string
  note: string
  updatedAt: number
  summary: SaveSummary
  /** 来自哪个存档（父存档名）；根存档没有。 */
  parentName?: string
  /** 战役起点（根存档）：界面上叫"战役起点"，存的名字仍是战役名，改名走卡头的"改战役名"。 */
  root?: boolean
  current?: boolean
  readOnly?: boolean
}>()
const emit = defineEmits<{ load: []; rename: [name: string]; note: [note: string]; export: []; remove: [] }>()

const renaming = ref(false)
const draft = ref('')
const noting = ref(false)
const noteDraft = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

const title = computed(() => (props.root ? '战役起点' : props.name))
const meta = computed(() => [formatTime(props.updatedAt), '手动', props.parentName ? `来自「${props.parentName}」` : '', summaryLine({ summary: props.summary })].filter(Boolean).join(' · '))
const items = computed<MenuItem[]>(() => [
  ...(props.root ? [] : [{ key: 'rename', label: '改名', disabled: props.readOnly, reason: '只读窗口不能修改' }]),
  { key: 'note', label: '备注', disabled: props.readOnly, reason: '只读窗口不能修改' },
  { key: 'export', label: '导出' },
  props.current ? { key: 'remove', label: '删除', danger: true, disabled: true, reason: '请先读取别的存档' } : { key: 'remove', label: '删除', danger: true, disabled: props.readOnly, reason: '只读窗口不能修改' },
])

let openedAt = 0
async function onMenu(key: string): Promise<void> {
  if (key === 'rename') {
    draft.value = props.name
    renaming.value = true
    openedAt = Date.now()
    await nextTick()
    nameInput.value?.focus()
    nameInput.value?.select()
  } else if (key === 'note') {
    noteDraft.value = props.note
    noting.value = true
  } else if (key === 'export') emit('export')
  else if (key === 'remove') emit('remove')
}
function onBlur(): void {
  if (renaming.value && Date.now() - openedAt < 300) nameInput.value?.focus()
  else commitRename()
}
function commitRename(): void {
  if (!renaming.value) return
  renaming.value = false
  const name = draft.value.trim()
  if (name && name !== props.name) emit('rename', name)
}
function commitNote(): void {
  noting.value = false
  if (noteDraft.value !== props.note) emit('note', noteDraft.value)
}
</script>

<template>
  <li :data-current="current" :data-testid="`save-${name}`">
    <div class="trpg-saves__main">
      <div class="trpg-saves__top">
        <input v-if="renaming" ref="nameInput" v-model="draft" class="trpg-input trpg-saves__rename" :maxlength="SAVE_NAME_MAX" aria-label="存档名" @keydown.enter.prevent="commitRename" @keydown.esc.stop.prevent="renaming = false" @blur="onBlur" />
        <b v-else>{{ title }}</b>
        <span v-if="current" class="trpg-badge" data-tone="primary">当前</span>
      </div>
      <div class="trpg-saves__meta">{{ meta }}</div>
      <div v-if="note && !noting" class="trpg-saves__meta">{{ note.split('\n')[0] }}</div>
      <div v-if="noting" class="trpg-saves__noteedit">
        <textarea v-model="noteDraft" class="trpg-input" :maxlength="SAVE_NOTE_MAX" aria-label="备注" rows="2" @keydown.esc.stop.prevent="noting = false" />
        <div class="trpg-saves__noteactions">
          <button class="trpg-btn trpg-btn--small" type="button" @click="noting = false">取消</button>
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" @click="commitNote">保存</button>
        </div>
      </div>
    </div>
    <div class="trpg-saves__end">
      <button v-if="!current" class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" @click="emit('load')">读取</button>
      <MoreMenu :label="title" :items="items" @select="onMenu" />
    </div>
  </li>
</template>

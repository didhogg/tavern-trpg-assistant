<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { CampaignNode } from '../../core/saves/view'
import { SAVE_NAME_MAX } from '../../schemas/campaign'
import { formatTime } from '../format'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import SaveRow from './SaveRow.vue'

/** 一场战役 = 一张卡片：卡头是战役名（没有[读取]）+ 一行说明 + ⋯；卡内是这场战役的所有存档。其他战役默认折叠。 */
const props = defineProps<{ name: string; updatedAt: number; ruleName: string; members: CampaignNode[]; currentId?: string; open?: boolean; readOnly?: boolean; ownerLabel?: string }>()
const emit = defineEmits<{
  load: [save: CampaignNode]
  renameCampaign: [name: string]
  rename: [save: CampaignNode, name: string]
  note: [save: CampaignNode, note: string]
  export: [save: CampaignNode]
  remove: [save: CampaignNode]
}>()

const byId = computed(() => new Map(props.members.map((m) => [m.id, m])))
const rows = computed(() => {
  // 根在最上面，其余按后端给的顺序（最近更新在前）
  const root = props.members.find((m) => m.parentId === null)
  return root ? [root, ...props.members.filter((m) => m !== root)] : props.members
})
const sub = computed(() => [formatTime(props.updatedAt), props.ruleName, props.ownerLabel, `${props.members.length} 个存档`].filter(Boolean).join(' · '))
const renaming = ref(false)
const draft = ref('')
const input = ref<HTMLInputElement | null>(null)
let openedAt = 0

async function onMenu(): Promise<void> {
  draft.value = props.name
  renaming.value = true
  openedAt = Date.now()
  await nextTick()
  input.value?.focus()
  input.value?.select()
}
/** 失焦：菜单刚关上时，焦点会被还给 ⋯ 按钮、输入框瞬间失焦，这种不算"填完了"，把焦点拿回来。 */
function onBlur(): void {
  if (renaming.value && Date.now() - openedAt < 300) input.value?.focus()
  else commit()
}
function commit(): void {
  if (!renaming.value) return
  renaming.value = false
  const name = draft.value.trim()
  if (name && name !== props.name) emit('renameCampaign', name)
}
</script>

<template>
  <details class="trpg-camp" :open="open" :data-testid="`camp-${name}`">
    <summary>
      <span class="trpg-camp__chev" aria-hidden="true"><Icon class="trpg-camp__chev-open" name="caret-down" :size="16" /><Icon class="trpg-camp__chev-closed" name="caret-right" :size="16" /></span>
      <span class="trpg-camp__name">
        <span v-if="renaming" class="trpg-saves__renamerow"><input ref="input" v-model="draft" class="trpg-input trpg-saves__rename" :maxlength="SAVE_NAME_MAX" aria-label="战役名" @click.prevent.stop @keydown.enter.prevent="commit" @keydown.esc.stop.prevent="renaming = false" @blur="onBlur" /><span v-if="renaming" class="trpg-saves__renamebtns" @click.prevent.stop><button class="trpg-icon-btn" type="button" aria-label="确定改名" data-testid="rename-ok" @mousedown.prevent @click.prevent.stop="commit"><Icon name="check" :size="16" /></button><button class="trpg-icon-btn" type="button" aria-label="取消改名" data-testid="rename-cancel" @mousedown.prevent @click.prevent.stop="renaming = false"><Icon name="x" :size="16" /></button></span></span>
        <span v-else>{{ name }}</span>
        <small>{{ sub }}</small>
      </span>
      <span @click.prevent.stop><MoreMenu :label="name" :items="[{ key: 'rename', label: '改战役名', disabled: readOnly, reason: '只读窗口不能修改' }]" @select="onMenu" /></span>
    </summary>
    <ul class="trpg-saves">
      <SaveRow
        v-for="m in rows"
        :id="m.id"
        :key="m.id"
        :name="m.name"
        :note="m.note"
        :updated-at="m.updatedAt"
        :summary="m.summary"
        :parent-name="m.parentId ? byId.get(m.parentId)?.name : undefined"
        :root="m.parentId === null"
        :current="m.id === currentId"
        :read-only="readOnly"
        @load="emit('load', m)"
        @rename="(n) => emit('rename', m, n)"
        @note="(n) => emit('note', m, n)"
        @export="emit('export', m)"
        @remove="emit('remove', m)"
      />
    </ul>
  </details>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ResolvedTag } from '../../library/entry-links'
import { copyText } from '../../host/clipboard'
import { appendToInput } from '../../host/input'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import Term from '../kit/Term.vue'
import { openEntry, openReader } from './open'
import { isRollable, rollComment, rollTable, tableName } from './table-roll'

const props = defineProps<{ target: ResolvedTag; codeSet: string; label: string }>()
const app = useAppStore()
const toast = useToastStore()
const table = ref<unknown>(null)

function open(): void {
  const { located, part } = props.target
  if (!located) return
  if (located.kind === 'entry') openEntry({ set: located.set, prop: located.prop, hash: located.hash }, props.label)
  else if (located.id) openReader({ set: located.set, prop: located.prop, id: located.id, name: props.label, part })
}

if (props.target.located?.kind === 'entry' && ['table', 'embeddedTable'].includes(props.target.located.prop)) {
  void (async () => {
    const stored = await app.svc().backend.library.scoped.storedItem(props.target.located!)
    if (stored && await isRollable(app.svc(), props.codeSet, stored.item)) table.value = stored.item
  })().catch((e) => console.error('[trpg-assistant] 读取链接表格失败', e))
}

async function roll(): Promise<void> {
  try {
    const r = await rollTable(app.svc(), props.codeSet, table.value)
    if (r.status !== 'complete') { toast.info(r.status === 'choose' || r.status === 'needs-input' ? '这张表需要选骰法或填数，请点进表格再掷' : '这张表现在掷不了'); return }
    const name = tableName(table.value as Record<string, unknown>) || props.label
    const comment = rollComment(name, r)
    const copied = await copyText(comment)
    toast.push('success', copied ? '已复制到剪贴板，可直接粘贴到酒馆输入框' : '掷好了，但没能复制，请点【填入酒馆输入框】', {
      actions: [{ label: '填入酒馆输入框', run: () => { if (!appendToInput(comment)) toast.error('没能填进酒馆输入框') } }],
    })
  } catch (e) { console.error('[trpg-assistant] 掷表失败', e); toast.error('这张表没有掷成功') }
}
</script>

<template>
  <Term v-if="target.located" @open="open"><slot>{{ label }}</slot></Term>
  <span v-else class="lib-deadlink" data-testid="dead-link" :title="`库里找不到「${label}」：可能它所在的书还没装，或者资料里的名字和链接对不上（上游数据）`"><slot>{{ label }}</slot></span>
  <button v-if="table" class="lib-dice" type="button" data-testid="roll-outside" aria-label="直接掷这张表" @click="roll"><Icon name="dice-five" :size="12" />掷</button>
</template>

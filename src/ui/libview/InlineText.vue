<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { copyText } from '../../host/clipboard'
import { appendToInput } from '../../host/input'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import Term from '../kit/Term.vue'
import { FORMAT_TAGS, splitInline, tagLabel, type InlineSeg } from './inline-text'
import { openEntry, openPack } from './open'
import { isRollable, rollComment, rollTable } from './table-roll'
import { resolveTagOnce, type TagResolved } from './useTags'

/** 一段带 {@标签} 的文字：普通文字原样；样式标签包一层；链接 → 下划线术语（点了弹窗内换页）；骰子 → 骰子标签（接线之后做，点了只提示）；认不出的 → 文字。 */
const props = defineProps<{ text: string; codeSet: string }>()
const app = useAppStore()
const toast = useToastStore()
const segs = ref<InlineSeg[]>([])
const resolved = ref<Record<number, TagResolved>>({})
let seq = 0
// 表格链接旁的骰子标签（R96）：只有作者判定能掷的表才有；点了不进表格直接掷，出横幅（已复制 + 填入酒馆输入框）
const tableOf = ref<Record<number, { item: unknown; name: string }>>({})
async function loadTables(): Promise<void> {
  for (const [i, r] of Object.entries(resolved.value)) {
    const seg = segs.value[Number(i)]
    if (seg?.kind !== 'tag' || seg.tag !== 'table' || r.kind !== 'link' || !r.ref || tableOf.value[Number(i)]) continue
    const stored = await app.svc().backend.library.scoped.storedItem(r.ref)
    if (stored && (await isRollable(app.svc(), props.codeSet, stored.item))) tableOf.value = { ...tableOf.value, [Number(i)]: { item: stored.item, name: r.label } }
  }
}
async function rollOutside(i: number): Promise<void> {
  const t = tableOf.value[i]
  if (!t) return
  const r = await rollTable(app.svc(), props.codeSet, t.item)
  if (r.status !== 'complete') { toast.info(r.status === 'choose' || r.status === 'needs-input' ? '这张表需要选骰法或填数，请点进表格再掷' : '这张表现在掷不了'); return }
  const comment = rollComment(t.name, r)
  const copied = await copyText(comment)
  toast.push('success', copied ? '已复制到剪贴板，可直接粘贴到酒馆输入框' : '掷好了，但没能复制，请点【填入酒馆输入框】', { actions: [{ label: '填入酒馆输入框', run: () => { if (!appendToInput(comment)) toast.error('没能填进酒馆输入框，结果文字已在剪贴板里') } }] })
}
const linkOf = (i: number): EntryRef | null => { const r = resolved.value[i]; return r?.kind === 'link' ? r.ref : null }
const packOf = (i: number) => { const r = resolved.value[i]; return r?.kind === 'link' ? r.pack ?? null : null }
function openLinked(i: number): void {
  const p = packOf(i)
  if (p) openPack({ set: p.set, source: p.source, name: p.name, kind: p.kind })
  else if (linkOf(i)) openEntry(linkOf(i)!)
}

async function run(): Promise<void> {
  const mine = ++seq
  segs.value = splitInline(props.text)
  resolved.value = {}
  await Promise.all(segs.value.map(async (seg, i) => {
    if (seg.kind !== 'tag' || FORMAT_TAGS[seg.tag]) return
    const r = await resolveTagOnce(app.svc(), props.codeSet, `@${seg.tag}`, seg.content)
    if (mine === seq) resolved.value = { ...resolved.value, [i]: r }
  }))
  if (mine === seq) void loadTables()
}
onMounted(run)
watch(() => [props.text, props.codeSet], run)
</script>

<template>
  <template v-for="(seg, i) in segs" :key="i">
    <template v-if="seg.kind === 'text'">{{ seg.text }}</template>
    <component :is="FORMAT_TAGS[seg.tag]" v-else-if="FORMAT_TAGS[seg.tag]"><InlineText :text="seg.content" :code-set="codeSet" /></component>
    <template v-else-if="linkOf(i) || packOf(i)">
      <Term @open="openLinked(i)">{{ resolved[i]?.label }}</Term>
      <button v-if="tableOf[i]" class="lib-dice" type="button" data-testid="roll-outside" aria-label="直接掷这张表" @click="rollOutside(i)"><Icon name="dice-five" :size="12" />掷</button>
    </template>
    <button v-else-if="resolved[i]?.kind === 'dice'" class="lib-dice" type="button" @click="toast.info('骰盘接线稍后开放')"><Icon name="dice-five" :size="12" />{{ resolved[i].label }}</button>
    <template v-else>{{ resolved[i]?.label ?? tagLabel(seg.content, seg.tag) }}</template>
  </template>
</template>

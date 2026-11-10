<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import Term from '../kit/Term.vue'
import { FORMAT_TAGS, splitInline, tagLabel, type InlineSeg } from './inline-text'
import { openEntry } from './open'
import { resolveTagOnce, type TagResolved } from './useTags'

/** 一段带 {@标签} 的文字：普通文字原样；样式标签包一层；链接 → 下划线术语（点了弹窗内换页）；骰子 → 骰子标签（接线之后做，点了只提示）；认不出的 → 文字。 */
const props = defineProps<{ text: string; codeSet: string }>()
const app = useAppStore()
const toast = useToastStore()
const segs = ref<InlineSeg[]>([])
const resolved = ref<Record<number, TagResolved>>({})
let seq = 0
const linkOf = (i: number): EntryRef | null => { const r = resolved.value[i]; return r?.kind === 'link' ? r.ref : null }

async function run(): Promise<void> {
  const mine = ++seq
  segs.value = splitInline(props.text)
  resolved.value = {}
  await Promise.all(segs.value.map(async (seg, i) => {
    if (seg.kind !== 'tag' || FORMAT_TAGS[seg.tag]) return
    const r = await resolveTagOnce(app.svc(), props.codeSet, `@${seg.tag}`, seg.content)
    if (mine === seq) resolved.value = { ...resolved.value, [i]: r }
  }))
}
onMounted(run)
watch(() => [props.text, props.codeSet], run)
</script>

<template>
  <template v-for="(seg, i) in segs" :key="i">
    <template v-if="seg.kind === 'text'">{{ seg.text }}</template>
    <component :is="FORMAT_TAGS[seg.tag]" v-else-if="FORMAT_TAGS[seg.tag]"><InlineText :text="seg.content" :code-set="codeSet" /></component>
    <Term v-else-if="linkOf(i)" @open="openEntry(linkOf(i)!)">{{ resolved[i]?.label }}</Term>
    <button v-else-if="resolved[i]?.kind === 'dice'" class="lib-dice" type="button" @click="toast.info('骰盘接线稍后开放')"><Icon name="dice-five" :size="12" />{{ resolved[i].label }}</button>
    <template v-else>{{ resolved[i]?.label ?? tagLabel(seg.content) }}</template>
  </template>
</template>

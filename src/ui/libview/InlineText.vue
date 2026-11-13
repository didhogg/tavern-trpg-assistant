<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'
import { FORMAT_TAGS, splitInline, tagLabel, type InlineSeg } from './inline-text'
import { resolveTagOnce, type TagResolved } from './useTags'
import ContentLink from './ContentLink.vue'
import AuthorFragment from './author-fragment'

/** 一段带 {@标签} 的文字：普通文字原样；样式标签包一层；链接 → 下划线术语（点了弹窗内换页）；骰子 → 骰子标签（接线之后做，点了只提示）；认不出的 → 文字。 */
const props = defineProps<{ text: string; codeSet: string }>()
const app = useAppStore()
const toast = useToastStore()
const segs = ref<InlineSeg[]>([])
const resolved = ref<Record<number, TagResolved>>({})
let seq = 0

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
    <ContentLink v-else-if="resolved[i]?.kind === 'link'" :target="resolved[i].target" :label="resolved[i].label" :code-set="codeSet" />
    <AuthorFragment v-else-if="resolved[i]?.kind === 'markup'" :markup="resolved[i].markup" :code-set="codeSet" inline />
    <button v-else-if="resolved[i]?.kind === 'dice'" class="lib-dice" type="button" @click="toast.info('骰盘接线稍后开放')">{{ resolved[i].label }}</button>
    <template v-else>{{ resolved[i]?.label ?? tagLabel(seg.content, seg.tag) }}</template>
  </template>
</template>

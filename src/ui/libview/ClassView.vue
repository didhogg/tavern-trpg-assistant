<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import SelectField from '../kit/SelectField.vue'
import { byLevel, classLines, classTable, flattenFeatures } from './class-data'
import EntryBody from './EntryBody.vue'
import FeatureLevels from './FeatureLevels.vue'
import InlineText from './InlineText.vue'

/** 职业页（U9d）：职业表 → 按等级的特性（折叠，前几级默认展开）→ 子职业（下拉同页切换，不入栈）。 */
const props = defineProps<{ item: unknown; entryRef: EntryRef; codeSet: string; authorLines?: Array<{ label: string; value: string }>; pb?: string[] | null }>()
const app = useAppStore()
const lib = useLibViewStore()
const table = computed(() => classTable(props.item, props.pb ?? null))
const lines = computed(() => [...classLines(props.item), ...(props.authorLines ?? [])])
const feats = computed(() => byLevel(flattenFeatures((props.item as { classFeatures?: unknown }).classFeatures)))
const subs = ref<Array<{ name: string; item: unknown }>>([])
const pick = ref('')
const picked = computed(() => subs.value.find((s) => s.name === pick.value) ?? null)
const subTitle = computed(() => String((props.item as { subclassTitle?: unknown }).subclassTitle ?? '子职业'))

onMounted(async () => {
  const c = lib.campaignLib
  const me = props.item as { name?: string; source?: string }
  if (!c) return
  const rows = await app.svc().backend.library.scoped.query(c, 'subclass', { source: me.source })
  subs.value = rows.map((r) => r.item as { name: string; className?: string; classSource?: string }).filter((s) => s.className === me.name && s.classSource === me.source).map((s) => ({ name: s.name, item: s }))
  pick.value = subs.value[0]?.name ?? ''
})
</script>

<template>
  <div class="lib-dbody" style="padding: 0" data-testid="class-view">
    <div v-if="lines.length" class="lib-stat" data-testid="class-lines"><div v-for="l in lines" :key="l.label"><span>{{ l.label }}</span><span><InlineText :text="l.value" :code-set="codeSet" /></span></div></div>
    <div class="lib-tablewrap" data-testid="class-table">
      <table class="lib-rtable">
        <thead><tr><th v-for="(h, i) in table.head" :key="i"><InlineText :text="h" :code-set="codeSet" /></th></tr></thead>
        <tbody><tr v-for="(r, i) in table.rows" :key="i"><td v-for="(c, j) in r" :key="j"><EntryBody :block="String(c)" :code-set="codeSet" /></td></tr></tbody>
      </table>
    </div>
    <h3>按等级的特性</h3>
    <FeatureLevels :levels="feats" :code-set="codeSet" :open-upto="3" />
    <template v-if="subs.length">
      <h3>{{ subTitle }}</h3>
      <SelectField v-model="pick" :options="subs.map((s) => s.name)" label="选择子职业" />
      <FeatureLevels v-if="picked" :key="picked.name" :levels="byLevel(flattenFeatures((picked.item as { subclassFeatures?: unknown }).subclassFeatures))" :code-set="codeSet" :open-upto="3" />
    </template>
  </div>
</template>

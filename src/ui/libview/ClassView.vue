<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { EntryRef } from '../../library/scopes'
import type { AuthorLine } from '../../library/runtime/frame/field-commands'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import SelectField from '../kit/SelectField.vue'
import { byLevel, classLines, classTable, flattenFeatures } from './class-data'
import EntryBody from './EntryBody.vue'
import FeatureLevels from './FeatureLevels.vue'
import InlineText from './InlineText.vue'
import AuthorFragment from './author-fragment'

/** 职业页（U9d）：职业表 → 按等级的特性（折叠，前几级默认展开）→ 子职业（下拉同页切换，不入栈）。 */
const props = defineProps<{ item: unknown; entryRef: EntryRef; codeSet: string; docIdLocal?: string; authorLines?: AuthorLine[]; pb?: string[] | null }>()
const app = useAppStore()
const lib = useLibViewStore()
const table = computed(() => classTable(props.item, props.pb ?? null, picked.value?.item))
const lines = computed<AuthorLine[]>(() => [...classLines(props.item), ...(props.authorLines ?? [])])
const feats = computed(() => byLevel(flattenFeatures((props.item as { classFeatures?: unknown }).classFeatures)))
const subs = ref<Array<{ name: string; item: unknown }>>([])
const pick = ref('只看职业')
const picked = computed(() => subs.value.find((s) => s.name === pick.value) ?? null)
const subTitle = computed(() => String((props.item as { subclassTitle?: unknown }).subclassTitle ?? '子职业'))

onMounted(async () => {
  const c = lib.campaignLib
  const me = props.item as { name?: string; source?: string }
  if (!c) return
  try {
    const rows = await app.svc().backend.library.scoped.query({ ...c, codeSet: props.codeSet }, 'subclass', { packDocIdLocal: props.docIdLocal })
    subs.value = rows.map((r) => r.item as { name: string; className?: string; classSource?: string }).filter((s) => s.className === me.name && s.classSource === me.source).map((s) => ({ name: s.name, item: s }))
  } catch (e) { console.error('[trpg-assistant] 读取子职业失败', e) }
})
</script>

<template>
  <div class="lib-dbody" style="padding: 0" data-testid="class-view">
    <div v-if="lines.length" class="lib-stat" data-testid="class-lines">
      <div v-for="l in lines" :key="l.label">
        <span>{{ l.label }}</span><span><AuthorFragment v-if="l.markup" :markup="l.markup" :code-set="codeSet" inline /><InlineText v-else :text="l.value" :code-set="codeSet" /></span>
      </div>
    </div>
    <div v-if="subs.length" class="lib-class-picker">
      <SelectField v-model="pick" :options="['只看职业', ...subs.map((s) => s.name)]" :label="subTitle" />
    </div>
    <div class="lib-tablewrap lib-class-table" data-testid="class-table">
      <table class="lib-rtable">
        <thead><tr><th v-for="(h, i) in table.head" :key="i" scope="col"><InlineText v-if="typeof h === 'string'" :text="h" :code-set="codeSet" /><EntryBody v-else :block="h" :code-set="codeSet" /></th></tr></thead>
        <tbody><tr v-for="(r, i) in table.rows" :key="i"><th scope="row">{{ r[0] }}</th><td v-for="(c, j) in r.slice(1)" :key="j"><InlineText v-if="typeof c === 'string'" :text="c" :code-set="codeSet" /><EntryBody v-else :block="c" :code-set="codeSet" /></td></tr></tbody>
      </table>
    </div>
    <h3>按等级的特性</h3>
    <FeatureLevels :levels="feats" :code-set="codeSet" :open-upto="3" />
    <template v-if="picked">
      <h3>{{ picked.name }}</h3>
      <FeatureLevels :key="picked.name" :levels="byLevel(flattenFeatures((picked.item as { subclassFeatures?: unknown }).subclassFeatures))" :code-set="codeSet" :open-upto="3" />
    </template>
  </div>
</template>

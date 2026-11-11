<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import type { ScopedDetail } from '../../library/scoped'
import type { EntryRef } from '../../library/scopes'
import type { RelatedTables } from '../../library/service-tables'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import Term from '../kit/Term.vue'
import RollTable from './RollTable.vue'
import { openEntry } from './open'
import { nameOf } from './pack-data'
import { tableName } from './table-roll'

const props = defineProps<{ detail: ScopedDetail; codeSet: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const tables = shallowRef<RelatedTables | null>(null)
const variants = ref<Array<{ ref: EntryRef; name: string }>>([])
const parent = ref<{ ref: EntryRef; name: string } | null>(null)
const errors = ref<string[]>([])
const loading = ref(true)

async function load(): Promise<void> {
  loading.value = true
  errors.value = []
  const s = app.svc().backend.library
  const target = props.detail.ref
  const jobs = [
    s.service.relatedTables(target.set, target.prop, target.hash, undefined, props.detail.item)
      .then((result) => { tables.value = result }),
    (async () => {
      const c = lib.campaignLib
      if (!c) return
      const v = await s.scoped.variantsOf({ ...c, codeSet: props.codeSet }, target)
      variants.value = v.variants.map(({ ref, item }) => ({ ref, name: nameOf(item) }))
      if (v.parent) parent.value = { ref: v.parent, name: nameOf((await s.scoped.storedItem(v.parent))?.item) }
    })(),
  ]
  const results = await Promise.allSettled(jobs)
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') return
    console.error('[trpg-assistant] 读取关联失败', result.reason)
    errors.value.push(i === 0 ? '表格暂时读不出来' : '变体暂时读不出来')
  })
  loading.value = false
}
onMounted(load)
</script>

<template>
  <p v-if="loading" role="status" class="lib-muted">正在查找关联资料…</p>
  <div v-if="errors.length" class="lib-banner lib-banner--warn"><span>{{ errors.join('、') }}</span><button type="button" class="trpg-btn trpg-btn--small" @click="load">重试</button></div>
  <details v-if="variants.length || parent" class="lib-fold" data-testid="variant-list">
    <summary>变体</summary>
    <div class="lib-fold__body lib-variants">
      <span v-if="parent">基础条目 <Term @open="openEntry(parent!.ref, parent!.name)">{{ parent.name }}</Term></span>
      <Term v-for="v in variants" :key="v.ref.hash" @open="openEntry(v.ref, v.name)">{{ v.name }}</Term>
    </div>
  </details>
  <details v-if="tables && (tables.own.length || tables.links.length || tables.referencedBy.length)" class="lib-fold" data-testid="related-tables">
    <summary>表格</summary>
    <div class="lib-fold__body">
      <details v-for="(row, i) in tables.own" :key="i" class="lib-fold">
        <summary>{{ tableName(row.table) }}</summary>
        <div v-if="row.path.length" class="lib-srcline">{{ row.path.map((p) => p.name).filter(Boolean).join(' › ') }}</div>
        <RollTable :table="row.table" :code-set="codeSet" />
      </details>
      <div v-if="tables.links.length" class="lib-variants"><b>正文引用的表</b><Term v-for="row in tables.links" :key="`${row.set}:${row.hash}`" @open="openEntry(row, row.name)">{{ row.name }}</Term></div>
      <div v-if="tables.referencedBy.length" class="lib-variants"><b>引用本条的表</b><Term v-for="row in tables.referencedBy" :key="`${row.set}:${row.hash}`" @open="openEntry(row, row.name)">{{ row.name }}</Term></div>
    </div>
  </details>
  <p v-else-if="tables?.skipped.length" class="lib-muted">有些表格暂时读不出来。</p>
  <p v-else-if="!loading && !errors.length && !variants.length && !parent" class="lib-muted">这份资料没有可显示的变体或关联表格。</p>
</template>

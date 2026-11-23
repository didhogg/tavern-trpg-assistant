<script setup lang="ts">
// 背包页（线框 p6-8，B 批）：搜索 + 和资料库同一种标签筛选 · 负重 · 按物品类型分组的表 · 脚注同调数。
import { computed, ref } from 'vue'
import Icon from '../kit/Icon.vue'
import { openPick } from './edit-open'
import { usePersonStore } from '../../stores/person'
import BagRows from './BagRows.vue'
import FilterPills from './FilterPills.vue'
import { bag, named, type BagRow } from './view'

const person = usePersonStore()
const data = computed(() => {
  const b = person.sheet ? bag(person.sheet) : { groups: [], units: '' }
  // 重量单位名查名字表（官方的单位表）
  return { ...b, units: b.units ? named(person.glossary, 'weightUnits', b.units) : '' }
})
const query = ref('')
const cat = ref('all')
const count = (rows: BagRow[]): number => rows.reduce((n, r) => n + 1 + count(r.children), 0)
const pills = computed(() => data.value.groups.map((g) => ({ id: g.id, label: g.label, n: count(g.rows) })))
const total = computed(() => pills.value.reduce((n, p) => n + p.n, 0))
const match = (rows: BagRow[], q: string): BagRow[] => rows.flatMap((r) => {
  const kids = match(r.children, q)
  return r.name.toLowerCase().includes(q) ? [{ ...r, children: r.children }] : kids.length ? [{ ...r, children: kids }] : []
})
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return data.value.groups.filter((g) => cat.value === 'all' || g.id === cat.value).map((g) => ({ ...g, rows: q ? match(g.rows, q) : g.rows })).filter((g) => g.rows.length)
})
const enc = computed(() => person.sheet?.system.attributes?.encumbrance)
const att = computed(() => person.sheet?.system.attributes?.attunement)
</script>

<template>
  <div class="ps-bag" data-testid="ps-bag">
    <div class="ps-actions-bar">
      <input v-model="query" class="trpg-input ps-actions-search" type="search" placeholder="搜物品" aria-label="搜物品" data-testid="ps-bag-search">
      <span class="tp-gap" />
      <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="person.readOnly" data-testid="ps-bag-add" @click="openPick('items')"><Icon name="plus" :size="14" />加物品</button>
    </div>
    <FilterPills v-if="pills.length" v-model="cat" :options="pills" :total="total" label="物品类型" />
    <div v-if="enc && enc.max" class="ps-enc" data-testid="ps-enc">
      <span>负重</span>
      <span class="ps-enc-bar" :data-over="enc.encumbered || undefined"><i :style="{ width: `${Math.min(100, enc.pct ?? 0)}%` }" /></span>
      <b>{{ enc.value }} / {{ enc.max }} {{ data.units }}</b>
    </div>
    <p v-if="!data.groups.length" class="ps-drawer-note">背包是空的。</p>
    <p v-else-if="!shown.length" class="ps-drawer-note">没有符合的物品。</p>
    <table v-for="grp in shown" :key="grp.id" class="ps-act-table ps-bag-table" :data-testid="`ps-bag-${grp.id}`">
      <thead><tr><th scope="col">{{ grp.label }}</th><th scope="col">数量</th><th scope="col"><span class="trpg-sr-only">操作</span></th></tr></thead>
      <tbody><BagRows :rows="grp.rows" :units="data.units" /></tbody>
    </table>
    <p v-if="att && att.max" class="ps-bag-foot" data-testid="ps-attune">同调 {{ att.value }} / {{ att.max }}</p>
  </div>
</template>

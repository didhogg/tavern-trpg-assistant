<script setup lang="ts">
// 特性页（线框 p6-10，照 Tidy5e）：职业卡（名字 · 等级 · 生命骰，点名字看资料）· 搜索 + 标签筛选（同资料库）+ 加专长
// · 按来源分组（官方：某职业特性 / 主动 / 被动……）· 每行 次数加减 · 恢复。分组与说明都取官方显示数据。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import Stepper from '../kit/Stepper.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import FilterPills from './FilterPills.vue'
import ItemTable, { type Col } from './ItemTable.vue'
import { useItemWrites } from './bag-actions'
import { openPick } from './edit-open'
import { classCards, features } from './view-tabs'

const person = usePersonStore()
const w = useItemWrites()
const groups = computed(() => (person.sheet ? features(person.sheet) : []))
const classes = computed(() => (person.sheet ? classCards(person.sheet) : []))
const query = ref('')
const cat = ref('all')
const pills = computed(() => groups.value.map((x) => ({ id: x.key, label: x.label, n: x.rows.length })))
const total = computed(() => pills.value.reduce((n, p) => n + p.n, 0))
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return groups.value.filter((x) => cat.value === 'all' || x.key === cat.value).map((x) => ({ ...x, rows: q ? x.rows.filter((r) => r.name.toLowerCase().includes(q)) : x.rows })).filter((x) => x.rows.length)
})
const cols: Col[] = [{ key: 'uses', label: '次数', width: '124px' }, { key: 'recovery', label: '恢复', width: '88px', wide: true }]
</script>

<template>
  <div class="ps-features" data-testid="ps-features">
    <div v-if="classes.length" class="ps-classes">
      <div v-for="c in classes" :key="c.id" class="ps-card ps-class-card">
        <Term v-if="c.ref" :label="`查看${c.name}`" @open="openEntry(c.ref as never, c.name)"><b>{{ c.name }}</b></Term><b v-else>{{ c.name }}</b>
        <span><small>等级</small>{{ c.levels }}</span><span v-if="c.hd"><small>生命骰</small>{{ c.hd }}</span>
      </div>
    </div>
    <div class="ps-toolbar">
      <input v-model="query" class="trpg-input ps-actions-search" type="search" placeholder="搜特性" aria-label="搜特性" data-testid="ps-features-search">
      <span class="tp-gap" />
      <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="person.readOnly" data-testid="ps-features-add" @click="openPick('feats')"><Icon name="plus" :size="14" />加专长</button>
    </div>
    <FilterPills v-if="pills.length > 1" v-model="cat" :options="pills" :total="total" label="特性来源" />
    <p v-if="!groups.length" class="ps-drawer-note">还没有特性。建卡、升级或「加专长」后出现在这里。</p>
    <p v-else-if="!shown.length" class="ps-drawer-note">没有符合的特性。</p>
    <ItemTable :groups="shown" :cols="cols" testid="ps-feat">
      <template #cell-uses="{ row }">
        <Stepper v-if="row.count" :value="`${row.count.value} / ${row.count.max}`" :minus-label="`${row.name}用掉一次`" :plus-label="`${row.name}还回一次`" :minus-disabled="person.readOnly || row.count.value <= 0" :plus-disabled="person.readOnly || row.count.value >= row.count.max" @minus="w.uses(row.name, row.id, row.count.value - 1, row.count.max)" @plus="w.uses(row.name, row.id, row.count.value + 1, row.count.max)" />
        <template v-else-if="row.recharge">{{ row.recharge }}</template>
        <template v-else>—</template>
      </template>
      <template #cell-recovery="{ row }">{{ row.recovery || '—' }}</template>
    </ItemTable>
  </div>
</template>

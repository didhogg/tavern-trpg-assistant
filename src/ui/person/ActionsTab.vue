<script setup lang="ts">
// 行动页（线框 p6-6b，照 Tidy5e）：搜索 + 动作类型标签筛选（同资料库）· 按官方 NPC 表“特性”部分分组（动作 / 附赠 / 反应 / 传奇 / 巢穴…，被动放最后）
// · 每行 次数（可加减）· 命中 / DC · 伤害 / 效果 · ⋯（收藏 / 编辑条目 / 删除）· 点名字展开作者原文。分组与每格文字都取官方显示数据；点了不掷（P7）。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import Stepper from '../kit/Stepper.vue'
import FilterPills from './FilterPills.vue'
import ItemTable, { type Col } from './ItemTable.vue'
import { useItemWrites } from './bag-actions'
import { actionGroups } from './view'

const person = usePersonStore()
const w = useItemWrites()
const groups = computed(() => (person.sheet ? actionGroups(person.sheet, person.glossary) : []).map((g) => ({ key: g.id, label: g.label, rows: g.rows })))
const query = ref('')
const cat = ref('all')
const pills = computed(() => groups.value.map((x) => ({ id: x.key, label: x.label, n: x.rows.length })))
const total = computed(() => pills.value.reduce((n, p) => n + p.n, 0))
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return groups.value.filter((x) => cat.value === 'all' || x.key === cat.value).map((x) => ({ ...x, rows: q ? x.rows.filter((r) => r.name.toLowerCase().includes(q)) : x.rows })).filter((x) => x.rows.length)
})
const cols: Col[] = [{ key: 'uses', label: '次数', width: '124px' }, { key: 'roll', label: '命中 / DC', width: '96px' }, { key: 'effect', label: '伤害 / 效果', width: '150px', wide: true }]
</script>

<template>
  <div class="ps-actions" data-testid="ps-actions">
    <div class="ps-toolbar"><input v-model="query" class="trpg-input ps-actions-search" type="search" placeholder="搜行动" aria-label="搜行动" data-testid="ps-actions-search"></div>
    <FilterPills v-if="pills.length" v-model="cat" :options="pills" :total="total" label="动作类型" />
    <p v-if="!groups.length" class="ps-drawer-note">还没有行动。武器、法术、特性带来的动作会出现在这里。</p>
    <p v-else-if="!shown.length" class="ps-drawer-note">没有符合的行动。</p>
    <ItemTable :groups="shown" :cols="cols" testid="ps-act">
      <template #under="{ row }"><small v-if="row.effects.length" class="ps-narrow-only">{{ row.effects.join(' + ') }}</small></template>
      <template #cell-uses="{ row }">
        <Stepper v-if="row.count" :value="`${row.count.value} / ${row.count.max}`" :minus-label="`${row.name}用掉一次`" :plus-label="`${row.name}还回一次`" :minus-disabled="person.readOnly || row.count.value <= 0" :plus-disabled="person.readOnly || row.count.value >= row.count.max" @minus="w.uses(row.name, row.id, row.count.value - 1, row.count.max)" @plus="w.uses(row.name, row.id, row.count.value + 1, row.count.max)" />
        <template v-else>{{ row.uses || '—' }}</template>
      </template>
      <template #cell-roll="{ row }"><span v-if="row.roll" class="ps-box-sm">{{ row.roll }}</span><template v-else>—</template></template>
      <template #cell-effect="{ row }"><span v-for="(e, i) in row.effects" :key="i" class="ps-box-sm">{{ e }}</span><template v-if="!row.effects.length">—</template></template>
    </ItemTable>
  </div>
</template>

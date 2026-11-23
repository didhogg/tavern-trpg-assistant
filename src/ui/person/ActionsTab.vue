<script setup lang="ts">
// 行动页（线框 p6-6b，A 批）：搜索 + 动作类型标签筛选 · 分组表（次数 · 命中 / DC · 伤害 / 效果）· 点一行原地展开作者原文。
// 分组与每格文字都取官方显示数据（驾驶员 11-23 批 G1 / G2）；筛选和资料库同一种标签（驾驶员 11-23）；有次数的可加减；点了不掷（掷骰等 P7）。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import EntryPage from '../libview/EntryPage.vue'
import Stepper from '../kit/Stepper.vue'
import FilterPills from './FilterPills.vue'
import { useItemWrites } from './bag-actions'
import { actionGroups } from './view'

const person = usePersonStore()
const groups = computed(() => (person.sheet ? actionGroups(person.sheet, person.glossary) : []))
const query = ref('')
const cat = ref('all')
const open = ref<string | null>(null)
const w = useItemWrites()
const pills = computed(() => groups.value.map((x) => ({ id: x.id, label: x.label, n: x.rows.length })))
const total = computed(() => pills.value.reduce((n, p) => n + p.n, 0))
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return groups.value
    .filter((x) => cat.value === 'all' || x.id === cat.value)
    .map((x) => ({ ...x, rows: q ? x.rows.filter((r) => r.name.toLowerCase().includes(q)) : x.rows }))
    .filter((x) => x.rows.length)
})
</script>

<template>
  <div class="ps-actions" data-testid="ps-actions">
    <div class="ps-actions-bar">
      <input v-model="query" class="trpg-input ps-actions-search" type="search" placeholder="搜行动" aria-label="搜行动" data-testid="ps-actions-search">
    </div>
    <FilterPills v-if="pills.length" v-model="cat" :options="pills" :total="total" label="动作类型" />
    <p v-if="!groups.length" class="ps-drawer-note">还没有行动。</p>
    <p v-else-if="!shown.length" class="ps-drawer-note">没有符合的行动。</p>
    <table v-for="grp in shown" :key="grp.id" class="ps-act-table" :data-testid="`ps-act-${grp.id}`">
      <thead><tr><th scope="col">{{ grp.label }}</th><th scope="col">次数</th><th scope="col">命中 / DC</th><th scope="col">伤害 / 效果</th></tr></thead>
      <tbody>
        <template v-for="r in grp.rows" :key="r.id">
          <tr class="ps-act-row" :data-open="open === r.id || undefined" data-testid="ps-act-row">
            <th scope="row">
              <button type="button" class="ps-act-name" :aria-expanded="open === r.id" @click="open = open === r.id ? null : r.id">{{ r.name }}</button>
              <small v-if="r.effects.length" class="ps-act-sub">{{ r.effects.join(' + ') }}</small>
            </th>
            <td>
              <Stepper
                v-if="r.count" :value="`${r.count.value} / ${r.count.max}`" :minus-label="`${r.name}用掉一次`" :plus-label="`${r.name}还回一次`"
                :minus-disabled="person.readOnly || r.count.value <= 0" :plus-disabled="person.readOnly || r.count.value >= r.count.max"
                @minus="w.uses(r.name, r.id, r.count.value - 1, r.count.max)" @plus="w.uses(r.name, r.id, r.count.value + 1, r.count.max)" />
              <small v-if="r.count && r.uses" class="ps-act-rec">{{ r.uses }}</small>
              <template v-if="!r.count">{{ r.uses || '—' }}</template>
            </td>
            <td><span v-if="r.roll" class="ps-box">{{ r.roll }}</span><template v-else>—</template></td>
            <td class="ps-act-effect"><span v-for="(e, i) in r.effects" :key="i" class="ps-box">{{ e }}</span><template v-if="!r.effects.length">—</template></td>
          </tr>
          <tr v-if="open === r.id" class="ps-act-detail">
<td colspan="4">
            <EntryPage v-if="r.ref" :entry-ref="r.ref as never" body-only />
            <p v-else class="ps-drawer-note">这一项没有库里的原文。</p>
          </td>
</tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

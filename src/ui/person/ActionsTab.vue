<script setup lang="ts">
// 行动页（线框 p6-6b，A 批）：搜索 + 按动作类型快筛 · 分组表（次数 · 命中 / DC · 伤害 / 效果）· 点一行原地展开作者原文。
// 分组与每格文字都取官方显示数据（驾驶员 11-23 批 G1 / G2）；点了不掷（掷骰等 P7）。筛选菜单 / 配置列 / 行 ⋯ 菜单在 B 批。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import EntryPage from '../libview/EntryPage.vue'
import { actionGroups } from './view'

const person = usePersonStore()
const groups = computed(() => (person.sheet ? actionGroups(person.sheet, person.glossary) : []))
const query = ref('')
const only = ref<Set<string>>(new Set())
const open = ref<string | null>(null)
const quick = computed(() => groups.value.filter((x) => x.id !== 'passive'))
function toggle(id: string): void { const n = new Set(only.value); if (n.has(id)) n.delete(id); else n.add(id); only.value = n }
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return groups.value
    .filter((x) => !only.value.size || only.value.has(x.id))
    .map((x) => ({ ...x, rows: q ? x.rows.filter((r) => r.name.toLowerCase().includes(q)) : x.rows }))
    .filter((x) => x.rows.length)
})
</script>

<template>
  <div class="ps-actions" data-testid="ps-actions">
    <div class="ps-actions-bar">
      <input v-model="query" class="trpg-input ps-actions-search" type="search" placeholder="搜行动" aria-label="搜行动" data-testid="ps-actions-search">
      <span v-if="quick.length" class="trpg-seg" role="group" aria-label="只看">
        <button v-for="x in quick" :key="x.id" type="button" :aria-pressed="only.has(x.id)" :data-testid="`ps-actions-only-${x.id}`" @click="toggle(x.id)">{{ x.label }}</button>
      </span>
    </div>
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
            <td>{{ r.uses || '—' }}</td>
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

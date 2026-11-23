<script setup lang="ts">
// 背包页（线框 p6-8 / u4-kinds，照 Tidy5e）：搜索 + 标签筛选（同资料库）+ 加物品 · 负重条（✎ 改上限）· 按物品类型分组（官方）
// · 每行 名字 + 状态小字（已装备 / 同调 / 重量 / 容量）+ 次数 · 数量 [−][n][＋] · 一个专用按钮（装备 / 卸下，或同调）
// · ⋯（装备 / 同调 / 移进容器 / 拿出容器 / 收藏 / 编辑条目 / 删除）· 容器里的东西缩进在容器下面 · 脚注同调数。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import Stepper from '../kit/Stepper.vue'
import FilterPills from './FilterPills.vue'
import ItemTable, { type Col } from './ItemTable.vue'
import { useItemWrites } from './bag-actions'
import { openFields, openPick } from './edit-open'
import { bag, named, type BagRow } from './view'

type Flat = BagRow & { depth: number; inside: string | null }
const person = usePersonStore()
const w = useItemWrites()
const ro = computed(() => person.readOnly)
const data = computed(() => {
  const b = person.sheet ? bag(person.sheet) : { groups: [], units: '' }
  // 重量单位名查名字表（官方的单位表）
  return { ...b, units: b.units ? named(person.glossary, 'weightUnits', b.units) : '' }
})
const flat = (rows: BagRow[], depth = 0, inside: string | null = null): Flat[] => rows.flatMap((r) => [{ ...r, depth, inside }, ...flat(r.children, depth + 1, r.id)])
const query = ref('')
const cat = ref('all')
const groups = computed(() => data.value.groups.map((g) => ({ key: g.id, label: g.label, rows: flat(g.rows) })))
const pills = computed(() => groups.value.map((g) => ({ id: g.key, label: g.label, n: g.rows.length })))
const total = computed(() => pills.value.reduce((n, p) => n + p.n, 0))
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return groups.value.filter((g) => cat.value === 'all' || g.key === cat.value).map((g) => ({ ...g, rows: q ? g.rows.filter((r) => r.name.toLowerCase().includes(q)) : g.rows })).filter((g) => g.rows.length)
})
/** 这个人身上的容器（能把东西放进去的）。 */
const containers = computed(() => groups.value.flatMap((g) => g.rows).filter((r) => r.capacity))
const enc = computed(() => person.sheet?.system.attributes?.encumbrance)
const att = computed(() => person.sheet?.system.attributes?.attunement)
const cols: Col[] = [{ key: 'qty', label: '数量', width: '104px' }, { key: 'act', label: '', width: '84px' }]

const extraMenu = (r: Flat) => [
  ...(r.equip ? [{ key: 'equip', label: r.equip.on ? '卸下' : '装备', disabled: ro.value }] : []),
  ...(r.attune ? [{ key: 'attune', label: r.attune.on ? '取消同调' : '同调', disabled: ro.value }] : []),
  ...containers.value.filter((c) => c.id !== r.id && c.id !== r.inside).map((c) => ({ key: `into:${c.id}`, label: `放进「${c.name}」`, disabled: ro.value })),
  ...(r.inside ? [{ key: 'out', label: '从容器里拿出来', disabled: ro.value }] : []),
]
function onMenu(r: Flat, key: string): void {
  if (key === 'equip' && r.equip) void w.equip(r.name, r.id, !r.equip.on)
  else if (key === 'attune' && r.attune) void w.attune(r.name, r.id, !r.attune.on)
  else if (key.startsWith('into:')) { const c = containers.value.find((x) => x.id === key.slice(5)); void person.edit(`把${r.name}放进${c?.name ?? '容器'}`, [{ kind: 'item', itemId: r.id, path: 'system.container', value: key.slice(5) }]) }
  else if (key === 'out') void person.edit(`把${r.name}拿出容器`, [{ kind: 'item', itemId: r.id, path: 'system.container', value: null }])
}
const editEnc = () => openFields('负重', { path: 'system.attributes.encumbrance' }, { hint: '负重由物品重量和力量算出；这里改额外加值和上限的倍数。' })
</script>

<template>
  <div class="ps-bag" data-testid="ps-bag">
    <div class="ps-toolbar">
      <input v-model="query" class="trpg-input ps-actions-search" type="search" placeholder="搜物品" aria-label="搜物品" data-testid="ps-bag-search">
      <span class="tp-gap" />
      <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-bag-add" @click="openPick('items')"><Icon name="plus" :size="14" />加物品</button>
    </div>
    <FilterPills v-if="pills.length" v-model="cat" :options="pills" :total="total" label="物品类型" />
    <div v-if="enc && enc.max" class="ps-card ps-enc" data-testid="ps-enc">
      <button class="ps-pen" type="button" aria-label="改负重" :disabled="ro" @click="editEnc"><Icon name="pencil-simple" :size="14" /></button>
      <span>负重</span>
      <span class="ps-enc-bar" :data-over="enc.encumbered || undefined"><i :style="{ width: `${Math.min(100, enc.pct ?? 0)}%` }" /></span>
      <b>{{ enc.value }} / {{ enc.max }} {{ data.units }}</b>
    </div>
    <p v-if="!data.groups.length" class="ps-drawer-note">背包是空的。点「加物品」从库里选。</p>
    <p v-else-if="!shown.length" class="ps-drawer-note">没有符合的物品。</p>
    <ItemTable :groups="shown" :cols="cols" :extra-menu="extraMenu" testid="ps-bagt" @menu="onMenu">
      <template #lead="{ row }"><span v-if="row.depth" class="ps-indent" :style="{ width: `${row.depth * 20}px` }" aria-hidden="true">└</span></template>
      <template #under="{ row }">
        <small class="ps-bag-tags">
          <span v-if="row.equip?.on" class="ps-tag ps-tag--on">{{ row.equip.title }}</span>
          <span v-if="row.attune" class="ps-tag" :class="{ 'ps-tag--gold': row.attune.on }">{{ row.attune.title }}</span>
          <span v-if="row.capacity">{{ row.capacity.value }} / {{ Number.isFinite(row.capacity.max) ? row.capacity.max : '∞' }} {{ row.capacity.units }}</span>
          <span v-if="row.weight !== null">{{ row.weight }} {{ data.units }}</span>
        </small>
        <span v-if="row.uses" class="ps-bag-uses">次数
          <Stepper :value="`${row.uses.value} / ${row.uses.max}`" :minus-label="`${row.name}用掉一次`" :plus-label="`${row.name}还回一次`" :minus-disabled="ro || row.uses.value <= 0" :plus-disabled="ro || row.uses.value >= row.uses.max" @minus="w.uses(row.name, row.id, row.uses.value - 1, row.uses.max)" @plus="w.uses(row.name, row.id, row.uses.value + 1, row.uses.max)" />
        </span>
      </template>
      <template #cell-qty="{ row }">
        <Stepper v-if="!row.capacity" :value="row.quantity" :minus-label="`${row.name}少一个`" :plus-label="`${row.name}多一个`" :minus-disabled="ro || row.quantity <= 0" :plus-disabled="ro" @minus="w.quantity(row.name, row.id, row.quantity - 1)" @plus="w.quantity(row.name, row.id, row.quantity + 1)" />
        <template v-else>—</template>
      </template>
      <template #cell-act="{ row }">
        <button v-if="row.attune && !row.attune.on" class="trpg-btn trpg-btn--small" type="button" :disabled="ro" @click="w.attune(row.name, row.id, true)">同调</button>
        <button v-else-if="row.equip" class="trpg-btn trpg-btn--small" type="button" :disabled="ro" @click="w.equip(row.name, row.id, !row.equip.on)">{{ row.equip.on ? '卸下' : '装备' }}</button>
        <template v-else>—</template>
      </template>
    </ItemTable>
    <p v-if="att && att.max" class="ps-bag-foot" data-testid="ps-attune">同调 {{ att.value }} / {{ att.max }}</p>
  </div>
</template>

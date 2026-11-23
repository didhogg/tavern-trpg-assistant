<script setup lang="ts">
// 法术页（线框 p6-9 / u5-slots，照 Tidy5e 法术书）：施法摘要卡 · 搜索 + 标签筛选（同资料库）+ 加法术 · 按环分组（组头法术位圆点，点一个 = 剩这么多；✎ 改上限）
// · 每行 准备开关 · 施放 · 距离 · 命中/DC · 效果。分组、说明、圆点都取官方显示数据；写入只写字段（法术位剩余、准备）。点了不掷（P7）。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import Stepper from '../kit/Stepper.vue'
import FilterPills from './FilterPills.vue'
import ItemTable, { type Col } from './ItemTable.vue'
import { useItemWrites } from './bag-actions'
import { openFields, openPick } from './edit-open'
import { slotValue, spellbook, type SpellRow, type SpellSection } from './view-tabs'

const person = usePersonStore()
const w = useItemWrites()
const book = computed(() => (person.sheet ? spellbook(person.sheet, person.glossary) : { casting: [], sections: [] }))
const query = ref('')
const cat = ref('all')
const pills = computed(() => book.value.sections.map((x) => ({ id: x.key, label: x.label, n: x.rows.length })))
const total = computed(() => pills.value.reduce((n, p) => n + p.n, 0))
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return book.value.sections.filter((x) => cat.value === 'all' || x.key === cat.value)
    .map((x) => ({ ...x, rows: q ? x.rows.filter((r) => r.name.toLowerCase().includes(q)) : x.rows }))
    .filter((x) => x.rows.length || (!q && x.slot))
})
const cols: Col[] = [{ key: 'time', label: '施放', width: '72px' }, { key: 'range', label: '距离', width: '72px', wide: true }, { key: 'roll', label: '命中 / DC', width: '92px' }, { key: 'effect', label: '效果', width: '120px', wide: true }]
const sectionOf = (key: string): SpellSection | undefined => book.value.sections.find((x) => x.key === key)

/** 点第 n 个圆点：剩 n 个；点的正好是最后一个亮着的 = 用掉它（剩 n−1）。 */
function setSlot(sec: SpellSection, n: number): void {
  if (!sec.slot || !person.sheet) return
  const now = slotValue(person.sheet, sec.slot)
  const next = now === n ? n - 1 : n
  void person.edit(`${sec.label}法术位剩 ${next}`, [{ kind: 'set', path: `system.spells.${sec.slot}.value`, value: next }])
}
const editSlots = (sec: SpellSection): void => openFields(`${sec.label}法术位`, { path: `system.spells.${sec.slot}` }, { hint: '剩余格数在组头圆点上点；这里改上限（覆盖值，不填 = 按职业等级表）。' })
const editCasting = (): void => openFields('施法', { path: 'system.attributes.spellcasting' })
const togglePrepared = (r: SpellRow): void => { void person.edit(`${r.prepared?.on ? '不再准备' : '准备'}${r.name}`, [{ kind: 'item', itemId: r.id, path: 'system.prepared', value: r.prepared?.on ? 0 : 1 }]) }
</script>

<template>
  <div class="ps-spells" data-testid="ps-spells">
    <div v-if="book.casting.length" class="ps-casting">
      <div v-for="c in book.casting" :key="c.label" class="ps-card ps-casting-card" data-testid="ps-casting">
        <button class="ps-pen" type="button" aria-label="改施法" :disabled="person.readOnly" @click="editCasting"><Icon name="pencil-simple" :size="14" /></button>
        <b class="ps-casting-title">{{ c.label }}</b>
        <span><small>施法属性</small>{{ c.ability }}</span>
        <span><small>法术攻击</small>{{ c.attack }}</span>
        <span><small>豁免 DC</small>{{ c.save }}</span>
        <span v-if="c.prepared"><small>已准备</small>{{ c.prepared }}</span>
      </div>
    </div>
    <div class="ps-toolbar">
      <input v-model="query" class="trpg-input ps-actions-search" type="search" placeholder="搜法术" aria-label="搜法术" data-testid="ps-spells-search">
      <span class="tp-gap" />
      <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="person.readOnly" data-testid="ps-spells-add" @click="openPick('spells')"><Icon name="plus" :size="14" />加法术</button>
    </div>
    <FilterPills v-if="pills.length > 1" v-model="cat" :options="pills" :total="total" label="法术环阶" />
    <p v-if="!book.sections.length" class="ps-drawer-note">还没有法术。点「加法术」从库里选。</p>
    <p v-else-if="!shown.length" class="ps-drawer-note">没有符合的法术。</p>
    <ItemTable :groups="shown" :cols="cols" testid="ps-spell">
      <template #group="{ group }">
        <span v-if="sectionOf(group.key)?.pips.length" class="ps-pips" role="group" :aria-label="`${group.label}法术位`">
          <button v-for="p in sectionOf(group.key)!.pips" :key="p.n" type="button" class="ps-pipbtn" :data-on="p.filled || undefined" :aria-label="`剩 ${p.n} 个`" :disabled="person.readOnly" @click="setSlot(sectionOf(group.key)!, p.n)" />
          <small>{{ slotValue(person.sheet!, sectionOf(group.key)!.slot!) }} / {{ sectionOf(group.key)!.pips.length }}</small>
        </span>
        <button v-if="sectionOf(group.key)?.slot" class="trpg-icon-btn" type="button" :aria-label="`改${group.label}法术位`" :disabled="person.readOnly" @click="editSlots(sectionOf(group.key)!)"><Icon name="pencil-simple" :size="13" /></button>
      </template>
      <template #lead="{ row }">
        <button v-if="row.prepared" type="button" class="ps-mark" :data-on="row.prepared.on || undefined" :disabled="person.readOnly || row.prepared.locked" :aria-label="row.prepared.title" :title="row.prepared.title" data-testid="ps-prepared" @click="togglePrepared(row)"><Icon v-if="row.prepared.on" name="check" :size="12" /></button>
      </template>
      <template #under="{ row }">
        <span v-if="row.count" class="ps-bag-uses">次数
          <Stepper :value="`${row.count.value} / ${row.count.max}`" :minus-label="`${row.name}用掉一次`" :plus-label="`${row.name}还回一次`" :minus-disabled="person.readOnly || row.count.value <= 0" :plus-disabled="person.readOnly || row.count.value >= row.count.max" @minus="w.uses(row.name, row.id, row.count.value - 1, row.count.max)" @plus="w.uses(row.name, row.id, row.count.value + 1, row.count.max)" />
        </span>
      </template>
      <template #cell-time="{ row }">{{ row.time || '—' }}</template>
      <template #cell-range="{ row }">{{ row.range || '—' }}</template>
      <template #cell-roll="{ row }"><span v-if="row.roll" class="ps-box-sm">{{ row.roll }}</span><template v-else>—</template></template>
      <template #cell-effect="{ row }"><span v-for="(e, i) in row.effects" :key="i" class="ps-box-sm">{{ e }}</span><template v-if="!row.effects.length">—</template></template>
    </ItemTable>
  </div>
</template>

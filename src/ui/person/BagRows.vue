<script setup lang="ts">
// 背包的行（线框 p6-8 / u4-kinds）：名字 + 官方状态小字（含重量、次数）· 数量 [−][n][＋] · 一个专用按钮（装备 / 卸下，或同调）· ⋯；
// 点名字原地展开作者原文；容器下面缩进列出里面的东西。
import { ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import EntryPage from '../libview/EntryPage.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Stepper from '../kit/Stepper.vue'
import { useItemWrites } from './bag-actions'
import type { BagRow } from './view'

defineOptions({ name: 'BagRows' })
defineProps<{ rows: BagRow[]; units: string; depth?: number }>()
const person = usePersonStore()
const w = useItemWrites()
const open = ref<string | null>(null)
const menu = (r: BagRow) => [
  ...(r.equip ? [{ key: 'equip', label: r.equip.on ? '卸下' : '装备', disabled: person.readOnly }] : []),
  ...(r.attune ? [{ key: 'attune', label: r.attune.on ? '取消同调' : '同调', disabled: person.readOnly }] : []),
  { key: 'remove', label: '删除', danger: true, disabled: person.readOnly },
]
function onMenu(r: BagRow, key: string): void {
  if (key === 'equip' && r.equip) void w.equip(r.name, r.id, !r.equip.on)
  else if (key === 'attune' && r.attune) void w.attune(r.name, r.id, !r.attune.on)
  else if (key === 'remove') void w.remove(r.name, r.id)
}
</script>

<template>
  <template v-for="r in rows" :key="r.id">
    <tr class="ps-bag-row" :data-depth="depth || undefined" :data-open="open === r.id || undefined" data-testid="ps-bag-row">
      <th scope="row">
        <button type="button" class="ps-act-name" :aria-expanded="open === r.id" @click="open = open === r.id ? null : r.id">{{ r.name }}</button>
        <small class="ps-bag-tags">
          <span v-if="r.equip?.on" class="ps-tag ps-tag--on">{{ r.equip.title }}</span>
          <span v-if="r.attune" class="ps-tag" :class="{ 'ps-tag--gold': r.attune.on }">{{ r.attune.title }}</span>
          <span v-if="r.subtitle">{{ r.subtitle }}</span>
          <span v-if="r.capacity">{{ r.capacity.value }} / {{ Number.isFinite(r.capacity.max) ? r.capacity.max : '∞' }} {{ r.capacity.units }}</span>
          <span v-if="r.weight !== null">{{ r.weight }} {{ units }}</span>
        </small>
        <span v-if="r.uses" class="ps-bag-uses">次数
          <Stepper
            :value="`${r.uses.value} / ${r.uses.max}`" :minus-label="`${r.name}用掉一次`" :plus-label="`${r.name}还回一次`"
            :minus-disabled="person.readOnly || r.uses.value <= 0" :plus-disabled="person.readOnly || r.uses.value >= r.uses.max"
            @minus="w.uses(r.name, r.id, r.uses.value - 1, r.uses.max)" @plus="w.uses(r.name, r.id, r.uses.value + 1, r.uses.max)" />
        </span>
      </th>
      <td>
        <Stepper
          v-if="!r.capacity" :value="r.quantity" :minus-label="`${r.name}少一个`" :plus-label="`${r.name}多一个`"
          :minus-disabled="person.readOnly || r.quantity <= 0" :plus-disabled="person.readOnly" @minus="w.quantity(r.name, r.id, r.quantity - 1)" @plus="w.quantity(r.name, r.id, r.quantity + 1)" />
      </td>
      <td class="ps-bag-act">
        <button v-if="r.attune && !r.attune.on" class="trpg-btn trpg-btn--small" type="button" :disabled="person.readOnly" @click="w.attune(r.name, r.id, true)">同调</button>
        <button v-else-if="r.equip" class="trpg-btn trpg-btn--small" type="button" :disabled="person.readOnly" @click="w.equip(r.name, r.id, !r.equip.on)">{{ r.equip.on ? '卸下' : '装备' }}</button>
        <MoreMenu :label="`${r.name}的更多操作`" :items="menu(r)" @select="onMenu(r, $event)" />
      </td>
    </tr>
    <tr v-if="open === r.id" class="ps-act-detail">
<td colspan="3">
      <EntryPage v-if="r.ref" :entry-ref="r.ref as never" body-only />
      <p v-else class="ps-drawer-note">这一项没有库里的原文。</p>
    </td>
</tr>
    <BagRows v-if="r.children.length" :rows="r.children" :units="units" :depth="(depth ?? 0) + 1" />
  </template>
</template>

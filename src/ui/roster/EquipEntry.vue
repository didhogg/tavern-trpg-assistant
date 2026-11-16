<script setup lang="ts">
import { computed } from 'vue'
import type { LabeledEntry } from '../../rules/kernel/starting-options'
import { useWizardStore } from '../../stores/wizard'
import Combobox, { type ComboOption } from '../kit/Combobox.vue'
import { equipmentTypeLabel } from './wizard-labels'

/** 起始装备的一条：物品（库里的名字 + 数量 + 作者数据里的改名）/ 杂项（库里没有的，名字原样）/ 类别（任选一件：每个槽一个可搜索下拉）/ 钱。 */
const props = defineProps<{ section: string; group: number; choice: string; entry: LabeledEntry; disabled: boolean }>()
const eq = useWizardStore().equip
/** 在某一项的类别槽里选了东西 = 选了这一项（只有一项的组本来就算选中）。 */
function pick(key: string, uid: string | null): void {
  if (uid && !eq.isOption(props.section, props.group, props.choice)) eq.chooseOption(props.section, props.group, props.choice)
  eq.pickSlot(props.section, key, uid)
}
const options = computed<ComboOption[]>(() => (props.entry.candidates ?? []).map((c) => ({ value: c.uid, label: c.label, en: c.label === c.name ? undefined : c.name, badge: c.source })))
const slots = computed(() => Array.from({ length: props.entry.quantity }, (_, n) => ({ n, key: eq.slotKey(props.group, props.choice, props.entry.index, n) })))
const typeName = computed(() => (props.entry.types ?? []).map(equipmentTypeLabel).join(' 或 '))
</script>

<template>
  <span class="wz-eqe" :data-kind="entry.kind">
    <template v-if="entry.kind === 'category'">
      <span class="wz-eqe__t">任选{{ typeName }}<template v-if="entry.quantity > 1"> ×{{ entry.quantity }}</template></span>
      <span v-for="s in slots" :key="s.key" class="wz-eqe__slot" @click.stop>
        <Combobox :model-value="eq.pickedAt(section, s.key) ?? undefined" :options="options" :label="`${typeName}，第 ${s.n + 1} 个`" :placeholder="`选${typeName}`" :disabled="disabled" data-testid="wz-eq-slot" @update:model-value="(v) => pick(s.key, v ?? null)" />
        <button v-if="eq.pickedAt(section, s.key)" type="button" class="trpg-btn trpg-btn--small" :disabled="disabled" @click.stop="pick(s.key, null)">清除</button>
      </span>
    </template>
    <template v-else>
      <span class="wz-eqe__t">{{ entry.kind === 'special' ? entry.text : entry.kind === 'value' ? '钱' : entry.label ?? entry.name }}</span>
      <span v-if="entry.quantity > 1" class="wz-eqe__q">×{{ entry.quantity }}</span>
      <span v-if="entry.displayName" class="wz-eqe__m">→ {{ entry.displayName }}</span>
      <span v-if="entry.kind === 'special'" class="trpg-badge" title="库里没有这一件，名字照作者数据原样">杂项</span>
      <span v-if="entry.cp" class="trpg-badge" title="里面装着钱，合计见下面">含钱</span>
    </template>
  </span>
</template>

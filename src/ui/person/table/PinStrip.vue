<script setup lang="ts">
// 置顶条（照 Tidy5e shared/SheetPins.svelte / SheetPinItem.svelte）：这一页置顶的条目排在表格上方——名字 · 次数（原地改）或数量 · × 取消置顶。
// 置顶存在人物 flags.tavern-trpg.pins.<页>（物品编号的列表），写入经人物 store（可撤销）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明 */
import { computed } from 'vue'
import { usePersonStore } from '../../../stores/person'
import Icon from '../../kit/Icon.vue'
import { useItemWrites } from '../bag-actions'
import NumIn from './NumIn.vue'
import { pinsOf, shownName, PINS_PATH } from './rows'

const props = defineProps<{ tab: string }>()
const person = usePersonStore()
const w = useItemWrites()
const ro = computed(() => person.readOnly)
const rows = computed(() => {
  const s = person.sheet
  if (!s) return []
  const ic: Record<string, any> = s.view?.base?.itemContext ?? {}
  return pinsOf(s, props.tab).map((id) => {
    const item = (s.items ?? []).find((i: any) => i.id === id)
    if (!item) return null
    const u = ic[id]?.uses ?? {}
    const max = Number(u.max)
    return { id, name: shownName(s, id), uses: u.hasUses && max > 0 ? { value: Number(u.value ?? 0), max } : null, quantity: Number(item.system?.quantity ?? 0) }
  }).filter((x): x is NonNullable<typeof x> => !!x)
})
const unpin = (id: string, name: string): void => { void person.edit(`取消置顶${name}`, [{ kind: 'set', path: `${PINS_PATH}.${props.tab}`, value: pinsOf(person.sheet!, props.tab).filter((x) => x !== id) }]) }
</script>

<template>
  <div v-if="rows.length" class="ps-pins-strip" :data-testid="`ps-pins-${tab}`">
    <div v-for="r in rows" :key="r.id" class="ps-pin-card">
      <Icon name="push-pin" :size="13" class="ps-pin-icon" />
      <b class="ps-pin-name">{{ r.name }}</b>
      <span v-if="r.uses" class="ps-uses"><NumIn :value="r.uses.value" :max="r.uses.max" :label="`${r.name}剩余次数`" :disabled="ro" @set="(v) => w.uses(r.name, r.id, v, r.uses!.max)" /><small>/ {{ r.uses.max }}</small></span>
      <NumIn v-else-if="r.quantity > 0" :value="r.quantity" step :label="`${r.name}数量`" :disabled="ro" @set="(v) => w.quantity(r.name, r.id, v)" />
      <button class="trpg-icon-btn" type="button" :aria-label="`取消置顶${r.name}`" :disabled="ro" @click="unpin(r.id, r.name)"><Icon name="x" :size="12" /></button>
    </div>
  </div>
</template>

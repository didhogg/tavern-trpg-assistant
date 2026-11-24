<script setup lang="ts">
// 背包页（照 Tidy5e tabs/ActorInventoryTab.svelte）：工具条（搜索 · 排序 · 分组方式 按类型 / 不分组 · 全部展开）· 负重条（ActorEncumbranceBar，⚙ 改上限）
// · 分组表（列照 Tidy5e：武器 次数·时间·命中·公式·价格·数量·重量；消耗品 / 杂物 / 容器各自；容器行展开里面的东西 + 容量条）· 组头 ＋ 新建这一类
// · 页底（ActorInventoryFooter：五种钱币原地改 · 同调 当前 / 上限 · 新建物品 ▾ · 从库里加）。数据全取官方；写入经人物 store。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明 */
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import { openFields, openPick } from './edit-open'
import { named } from './view'
import DocTable from './table/DocTable.vue'
import NumIn from './table/NumIn.vue'
import TableBar from './table/TableBar.vue'
import { useTable } from './table/use-table'
import type { DocGroup } from './table/rows'

const person = usePersonStore()
const t = useTable('inventory')
const ro = computed(() => person.readOnly)
const enc = computed(() => person.sheet?.system.attributes?.encumbrance ?? null)
const encPct = computed(() => enc.value && Number(enc.value.max) ? Math.min(100, Math.round(Number(enc.value.value) / Number(enc.value.max) * 100)) : 0)
const units = computed(() => {
  const u = ((person.sheet?.items ?? []) as any[]).find((i) => i.system?.weight?.units)?.system.weight.units
  return u ? named(person.glossary, 'weightUnits', u) : ''
})
const att = computed(() => person.sheet?.system.attributes?.attunement ?? null)
/** 五种钱币（官方背包部分给的顺序与数；名字查官方货币表）。 */
const coins = computed(() => Object.entries((person.sheet?.view?.parts?.inventory?.currency ?? person.sheet?.system.currency ?? {}) as Record<string, number>)
  .map(([k, v]) => ({ key: k, value: Number(v ?? 0), label: named(person.glossary, 'currencies', k) })))
const setCoin = (k: string, label: string, v: number): void => { void person.edit(`${label}改为 ${v}`, [{ kind: 'set', path: `system.currency.${k}`, value: v }]) }
/** 新建物品的类型 = 官方背包分组的类型（武器 / 装备 / 消耗品 / 工具 / 容器 / 战利品）。 */
const kinds = computed(() => ((person.sheet?.view?.parts?.inventory?.sections ?? []) as any[]).filter((s) => s.groups?.type).map((s) => ({ key: String(s.groups.type), label: String(s.label ?? s.groups.type) })))
const createIn = (g: DocGroup): void => { if (g.type) t.create(g.type, g.label) }
const createKind = (type: string): void => t.create(type, kinds.value.find((k) => k.key === type)?.label ?? '物品')
</script>

<template>
  <div class="ps-bag" data-testid="ps-bag">
    <TableBar v-model:query="t.query.value" v-model:sort="t.sort.value" v-model:grouping="t.grouping.value" v-model:expand="t.expand.value" v-model:filters="t.filters.value" :controls="t.controls.value" placeholder="搜物品" testid="ps-bag">
      <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-bag-add" @click="openPick('items')"><Icon name="plus" :size="14" />从库里加物品</button>
    </TableBar>
    <div v-if="enc" class="ps-enc" data-testid="ps-enc" :data-level="enc.encumbered ? 'over' : undefined">
      <Icon name="scales" :size="16" />
      <span class="ps-enc-bar" role="meter" :aria-valuenow="Number(enc.value)" :aria-valuemax="Number(enc.max)" aria-label="负重"><i :style="{ width: `${encPct}%` }" /></span>
      <b>{{ Math.round(Number(enc.value) * 100) / 100 }} / {{ enc.max }} {{ units }}</b>
      <button class="trpg-icon-btn" type="button" aria-label="改负重" :disabled="ro" @click="openFields('负重', { path: 'system.attributes.encumbrance' }, { hint: '负重由物品重量和力量算出；这里改额外加值和上限的倍数。' })"><Icon name="gear" :size="14" /></button>
    </div>
    <p v-if="!t.groups.value.length" class="ps-drawer-note">{{ t.query.value ? '没有符合的物品。' : '背包是空的。从库里加，或页底「新建物品」。' }}</p>
    <DocTable domain="inventory" :groups="t.groups.value" :expand="t.expand.value" creatable testid="ps-bag-table" @create="createIn" @section="t.section" />
    <footer class="dt-foot ps-bag-foot" data-testid="ps-bag-foot">
      <span class="ps-coins" role="group" aria-label="钱币">
        <label v-for="c in coins" :key="c.key" class="ps-coin" :data-coin="c.key"><small>{{ c.label }}</small><NumIn :value="c.value" :label="c.label" :disabled="ro" @set="(v) => setCoin(c.key, c.label, v)" /></label>
        <button class="trpg-icon-btn" type="button" aria-label="钱币换算成最少枚数" title="换算成最少枚数（官方换算）" :disabled="ro" data-testid="ps-coin-convert" @click="person.convertCurrency()"><Icon name="coins" :size="15" /></button>
      </span>
      <span v-if="att && att.max" class="ps-attune-count" data-testid="ps-attune-count" :data-over="Number(att.value) > Number(att.max) || undefined">
        <Icon name="sun" :size="14" />同调 {{ att.value }} / {{ att.max }}
        <button class="trpg-icon-btn" type="button" aria-label="改同调上限" :disabled="ro" @click="openFields('同调', { path: 'system.attributes.attunement' })"><Icon name="gear" :size="13" /></button>
      </span>
      <span class="dt-bar-gap" />
      <MoreMenu label="新建物品" text="新建物品" :items="kinds.map((k) => ({ key: k.key, label: `新建${k.label}`, disabled: ro }))" @select="createKind" />
    </footer>
  </div>
</template>

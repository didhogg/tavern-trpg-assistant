<script setup lang="ts">
// 法术页（照 Tidy5e tabs/ActorSpellbookTab.svelte）：施法职业卡（SpellcastingClassSummaryCard：施法属性 · 设为主施法属性 · 攻击 · DC · 已准备）
// · 工具条（搜索 · 排序 · 全部展开）· 按环分组表（组头 法术位圆点 SpellSlotTracker + 上限设置 SpellSlotManagement · ＋ 新建这一环）
// · 页底（ActorSpellbookFooter：专注中 → 打断 · 新建法术 · 从库里加）。数据全取官方显示数据；写入经人物 store。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import { openFields, openPick } from './edit-open'
import { named } from './view'
import { slotValue } from './view-tabs'
import DocTable from './table/DocTable.vue'
import TableBar from './table/TableBar.vue'
import { useTable } from './table/use-table'
import type { DocGroup } from './table/rows'

const person = usePersonStore()
const t = useTable('spells')
const ro = computed(() => person.readOnly)
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明 */
const casting = computed(() => ((person.sheet?.view?.parts?.spells?.spellcasting ?? []) as any[]).map((c) => ({
  label: String(c.label ?? ''), ability: String(c.ability?.ability ?? ''), abilityName: named(person.glossary, 'abilities', c.ability?.ability ?? ''),
  attack: Number(c.attack ?? 0), save: c.save, primary: !!c.primary, prepared: c.preparation?.max ? `${c.preparation.value ?? 0} / ${c.preparation.max}` : '',
})))
const signed = (n: number): string => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`)
/** 专注中的效果（人物身上带“专注”状态的效果；Tidy5e 页底 Concentrating 按钮）。 */
const concEffects = computed(() => ((person.sheet?.effects ?? []) as any[]).filter((e) => (e.statuses ?? []).includes('concentrating') && !e.disabled))
const concentrating = computed(() => concEffects.value.length > 0)

/** 点第 n 个圆点：剩 n 个；点的正好是最后一个亮着的 = 用掉它（剩 n−1）——和 Tidy5e SpellSlotTracker 一样。 */
function setSlot(g: DocGroup, n: number): void {
  if (!g.slot || !person.sheet) return
  const now = slotValue(person.sheet, g.slot)
  const next = now === n ? n - 1 : n
  void person.edit(`${g.label}法术位剩 ${next}`, [{ kind: 'set', path: `system.spells.${g.slot}.value`, value: next }])
}
const editSlots = (g: DocGroup): void => openFields(`${g.label}法术位`, { path: `system.spells.${g.slot}` }, { hint: '剩余格数在组头圆点上点；这里改上限（覆盖值，不填 = 按职业等级表）。' })
const setPrimary = (ability: string, label: string): void => { void person.edit(`${label}设为主施法属性`, [{ kind: 'set', path: 'system.attributes.spellcasting', value: ability }]) }
const createIn = (g: DocGroup): void => t.create('spell', `${g.label}法术`, { level: Number(g.dataset?.level ?? 0), method: String(g.dataset?.method ?? 'spell') })
/** 打断专注 = 删掉专注效果（官方 endConcentration 也是这样）。 */
const breakConc = (): void => { void person.edit('打断专注', concEffects.value.map((e) => ({ kind: 'effectDelete' as const, effectId: String(e._id ?? e.id) }))) }
</script>

<template>
  <div class="ps-spells" data-testid="ps-spells">
    <div v-if="casting.length" class="ps-casting">
      <div v-for="c in casting" :key="c.label" class="ps-card ps-casting-card" data-testid="ps-casting">
        <button class="ps-pen" type="button" aria-label="改施法" :disabled="ro" @click="openFields('施法', { path: 'system.attributes.spellcasting' })"><Icon name="pencil-simple" :size="14" /></button>
        <b class="ps-casting-title">{{ c.label }}</b>
        <span><small>施法属性</small>{{ c.abilityName }}
          <button v-if="!c.primary" class="ps-link-btn" type="button" :disabled="ro" data-testid="ps-casting-primary" @click="setPrimary(c.ability, c.abilityName)">设为主施法属性</button>
          <em v-else class="ps-tag">主施法</em>
        </span>
        <span><small>法术攻击</small>{{ signed(c.attack) }}</span>
        <span><small>豁免 DC</small>{{ c.save }}</span>
        <span v-if="c.prepared"><small>已准备</small>{{ c.prepared }}</span>
      </div>
    </div>
    <TableBar v-model:query="t.query.value" v-model:sort="t.sort.value" v-model:grouping="t.grouping.value" v-model:expand="t.expand.value" v-model:filters="t.filters.value" :controls="t.controls.value" placeholder="搜法术" testid="ps-spells">
      <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-spells-add" @click="openPick('spells')"><Icon name="plus" :size="14" />从库里加法术</button>
    </TableBar>
    <p v-if="!t.groups.value.length" class="ps-drawer-note">{{ t.query.value ? '没有符合的法术。' : '还没有法术。点「从库里加法术」或页底「新建法术」。' }}</p>
    <DocTable domain="spell" tab="spell" :groups="t.groups.value" :expand="t.expand.value" creatable testid="ps-spell" @create="createIn" @section="t.section">
      <template #group="{ group }">
        <span v-if="group.pips.length" class="ps-pips" role="group" :aria-label="`${group.label}法术位`">
          <button v-for="p in group.pips" :key="p.n" type="button" class="ps-pipbtn" :data-on="p.filled || undefined" :aria-label="`剩 ${p.n} 个`" :disabled="ro" @click="setSlot(group, p.n)" />
          <small>{{ slotValue(person.sheet!, group.slot!) }} / {{ group.pips.length }}</small>
        </span>
        <button v-if="group.usesSlots" class="trpg-icon-btn" type="button" :aria-label="`改${group.label}法术位`" :disabled="ro" @click="editSlots(group)"><Icon name="gear" :size="13" /></button>
      </template>
    </DocTable>
    <footer class="dt-foot" data-testid="ps-spells-foot">
      <button v-if="concentrating" class="trpg-btn trpg-btn--small dt-conc" type="button" :disabled="ro" title="点了打断专注" data-testid="ps-conc-break" @click="breakConc"><Icon name="sparkle" :size="14" />专注中 · 打断</button>
      <span class="dt-bar-gap" />
      <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-spells-create" @click="t.create('spell', '法术', { level: 0, method: 'spell' })"><Icon name="plus" :size="14" />新建法术</button>
    </footer>
  </div>
</template>

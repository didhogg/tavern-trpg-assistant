<script setup lang="ts">
// 效果页（照 Tidy5e tabs/ActorEffectsTab.svelte）：状态（ActorConditionsQuadrone：官方状态表 点了开 / 关；力竭 ExhaustionToggle − 数 ＋，直接写等级）
// · 效果分组表（EffectsTables：官方分组 临时 / 被动 / 停用 / 不可用；列 来源 · 持续；行 开关（专注效果 = 打断专注）· ⋯ 看来源 / 启用停用 / 编辑 / 收藏 / 复制 / 删除；组头 ＋ 新建）。
// 写入经人物 store（可撤销），界面不算规则。
/* eslint-disable @typescript-eslint/no-explicit-any -- 人物效果数据没有类型声明 */
import { computed, markRaw } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Switch from '../kit/Switch.vue'
import EffectPage from './EffectPage.vue'
import NumIn from './table/NumIn.vue'
import { shownName, shownRef } from './table/rows'
import { openEntry } from '../libview/open'
import { openFields } from './edit-open'
import { conditions, effectGroups, type EffectRow } from './view-tabs'

const person = usePersonStore()
const modal = useModalStore()
const ro = computed(() => person.readOnly)
const conds = computed(() => (person.sheet ? conditions(person.sheet) : []))
const groups = computed(() => (person.sheet ? effectGroups(person.sheet) : []))
const raw = (e: EffectRow): any => ((person.sheet?.effects ?? []) as any[]).find((x) => x.id === e.id) ?? {}
const isConc = (e: EffectRow): boolean => (raw(e).statuses ?? []).includes('concentrating')
const at = (e: EffectRow) => (e.parentId ? { itemId: e.parentId } : {})

const toggleCond = (c: { id: string; name: string; on: boolean }): void => { void person.edit(`${c.on ? '去掉' : '加上'}状态「${c.name}」`, [{ kind: 'status', statusId: c.id, active: !c.on }]) }
const setExhaustion = (v: number): void => { void person.edit(`力竭设为 ${v} 级`, [{ kind: 'set', path: 'system.attributes.exhaustion', value: v }]) }
const toggleEffect = (e: EffectRow, on: boolean): void => { void person.edit(`${on ? '启用' : '停用'}效果「${e.name}」`, [{ kind: 'effect', effectId: e.id, ...at(e), path: 'disabled', value: !on }]) }
const breakConc = (e: EffectRow): void => { void person.edit('打断专注', [{ kind: 'effectDelete', effectId: e.id, ...at(e) }]) }
/** 官方收藏里效果的编号写法（.ActiveEffect.编号，挂在物品上 = .Item.物品.ActiveEffect.编号）。 */
const favId = (e: EffectRow): string => e.parentId ? `.Item.${e.parentId}.ActiveEffect.${e.id}` : `.ActiveEffect.${e.id}`
const favs = computed<Array<{ type: string; id: string; sort?: number }>>(() => (person.sheet?.system.favorites ?? []) as never)
const isFav = (e: EffectRow): boolean => favs.value.some((f) => f.id === favId(e))
const openEffect = (title: string, props: Record<string, unknown>): void => modal.open({ key: `person-effect:${String(props.effectId ?? 'new')}`, title, component: markRaw(EffectPage), props, variant: 'dialog', width: 640, height: 620 })

const menu = (e: EffectRow) => [
  ...(e.parentId ? [{ key: 'source', label: `看来源：${shownName(person.sheet!, e.parentId)}` }] : []),
  isConc(e) ? { key: 'conc', label: '打断专注', disabled: ro.value } : { key: 'toggle', label: e.disabled ? '启用' : '停用', disabled: ro.value || !e.toggleable },
  { key: 'edit', label: '编辑', disabled: ro.value },
  { key: 'fav', label: isFav(e) ? '取消收藏' : '收藏到侧栏', disabled: ro.value },
  { key: 'dup', label: '复制一份', disabled: ro.value },
  { key: 'remove', label: '删除', danger: true, disabled: ro.value },
]
function onMenu(e: EffectRow, key: string): void {
  const r = raw(e)
  if (key === 'source' && e.parentId) {
    const ref = shownRef(person.sheet!, e.parentId); const name = shownName(person.sheet!, e.parentId)
    if (ref) openEntry(ref as never, name)
    else openFields(name, { itemId: e.parentId, path: 'system' }, { width: 680, itemName: name })
  }
  else if (key === 'conc') breakConc(e)
  else if (key === 'toggle') toggleEffect(e, e.disabled)
  else if (key === 'edit') openEffect(`编辑效果「${e.name}」`, { effectId: e.id, itemId: e.parentId })
  else if (key === 'fav') {
    const next = isFav(e) ? favs.value.filter((f) => f.id !== favId(e)) : [...favs.value, { type: 'effect', id: favId(e), sort: (favs.value.length + 1) * 100000 }]
    void person.edit(isFav(e) ? `取消收藏${e.name}` : `收藏了${e.name}`, [{ kind: 'set', path: 'system.favorites', value: next }])
  }
  else if (key === 'dup') void person.edit(`复制了效果「${e.name}」`, [{ kind: 'effectCreate', ...at(e), data: { name: `${e.name}（副本）`, img: r.img, system: { changes: r.changes ?? [] }, disabled: !!r.disabled, duration: r.duration ?? {}, statuses: (r.statuses ?? []).filter((x: string) => x !== 'concentrating'), flags: { 'tavern-trpg': { manual: true } } } }])
  else if (key === 'remove') void person.edit(`删除了效果「${e.name}」`, [{ kind: 'effectDelete', effectId: e.id, ...at(e) }])
}
/** 组头「＋」（Tidy5e EffectActionsColumnHeader = 官方按组建效果：临时 = 持续 1 轮，停用 = 先停着）。 */
const createIn = (key: string, label: string): void => openEffect(`新建${label}`, { preset: key === 'temporary' ? { rounds: 1 } : key === 'inactive' ? { disabled: true } : {} })
</script>

<template>
  <div class="ps-effects" data-testid="ps-effects">
    <section class="dt-grp" data-testid="ps-conds-card">
      <header class="dt-head"><span class="dt-fold"><b>状态</b><small>点一下开 / 关</small></span></header>
      <div class="ps-conds" data-testid="ps-conds">
        <template v-for="c in conds" :key="c.id">
          <span v-if="c.level !== null" class="ps-cond ps-cond--level" :data-on="c.on || undefined">{{ c.name }}
            <NumIn :value="c.level" :min="0" :max="6" step :label="`${c.name}等级`" :disabled="ro" @set="setExhaustion" />
          </span>
          <button v-else type="button" class="ps-cond" :aria-pressed="c.on" :disabled="ro" :data-testid="`ps-cond-${c.id}`" @click="toggleCond(c)">{{ c.name }}</button>
        </template>
      </div>
    </section>

    <div class="dt" data-testid="ps-effect-tables">
      <section v-for="grp in groups" :key="grp.key" class="dt-grp" :data-testid="`ps-eff-${grp.key}`">
        <header class="dt-head">
          <span class="dt-fold"><b>{{ grp.label }}</b><small>{{ grp.rows.length }}</small></span>
          <span class="dt-cols" aria-hidden="true"><span class="dt-opt-1" style="width: 8rem">来源</span><span class="dt-opt-2" style="width: 6rem">持续</span><span class="dt-acts-col" style="width: 5rem">
            <button class="dt-add" type="button" :disabled="ro" :aria-label="`新建${grp.label}`" :data-testid="`ps-eff-add-${grp.key}`" @click="createIn(grp.key, grp.label)"><Icon name="plus" :size="14" /></button>
          </span></span>
        </header>
        <p v-if="grp.info && !grp.rows.length" class="ps-grp-info">{{ grp.info }}</p>
        <ul v-if="grp.rows.length" class="dt-rows">
          <li v-for="e in grp.rows" :key="e.id" class="dt-row" data-testid="ps-eff-row">
            <div class="dt-main">
              <span class="dt-initial" aria-hidden="true">{{ e.name.slice(0, 1) }}</span>
              <div class="dt-name"><button type="button" class="dt-title" @click="onMenu(e, 'edit')">{{ e.name }}</button></div>
              <span class="dt-cell dt-opt-1" style="width: 8rem">{{ e.source || '手动' }}</span>
              <span class="dt-cell dt-opt-2" style="width: 6rem" :class="{ 'ps-dim': !e.duration }">{{ e.duration || '—' }}</span>
              <span class="dt-acts" style="width: 5rem; justify-content: flex-end">
                <button v-if="isConc(e)" class="dt-act" type="button" data-on aria-label="打断专注" title="专注中（点了打断专注）" :disabled="ro" @click="breakConc(e)"><Icon name="sparkle" :size="15" /></button>
                <Switch v-else :model-value="!e.disabled" :label="`${e.name}生效`" :disabled="ro || !e.toggleable" @update:model-value="(v: boolean) => toggleEffect(e, v)" />
                <MoreMenu :label="e.name" :items="menu(e)" @select="onMenu(e, $event)" />
              </span>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

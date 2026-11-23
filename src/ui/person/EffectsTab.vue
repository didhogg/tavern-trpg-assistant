<script setup lang="ts">
// 效果页（线框 p6-11，照 Tidy5e）：状态一排（官方状态表，点一下开 / 关；力竭 − ＋ 级数）· 效果按官方分组（临时 / 被动 / 停用 / 不可用）
// · 每行 来源 · 持续 · 开关 · ⋯（删除）· ＋ 添加效果。状态和效果都走人物的统一改动（可撤销），界面不算规则。
import { computed, markRaw } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Stepper from '../kit/Stepper.vue'
import Switch from '../kit/Switch.vue'
import AddEffectPage from './AddEffectPage.vue'
import { conditions, effectGroups, type EffectRow } from './view-tabs'

const person = usePersonStore()
const modal = useModalStore()
const ro = computed(() => person.readOnly)
const conds = computed(() => (person.sheet ? conditions(person.sheet) : []))
const groups = computed(() => (person.sheet ? effectGroups(person.sheet) : []))
const anyEffect = computed(() => groups.value.some((g) => g.rows.length))

const toggleCond = (c: { id: string; name: string; on: boolean }): void => { void person.edit(`${c.on ? '去掉' : '加上'}状态「${c.name}」`, [{ kind: 'status', statusId: c.id, active: !c.on }]) }
const setLevel = (c: { id: string; name: string }, n: number): void => { void person.edit(`${c.name}设为 ${n} 级`, [{ kind: 'status', statusId: c.id, levels: Math.max(0, n) }]) }
const at = (e: EffectRow) => (e.parentId ? { itemId: e.parentId } : {})
const toggleEffect = (e: EffectRow, on: boolean): void => { void person.edit(`${on ? '启用' : '停用'}效果「${e.name}」`, [{ kind: 'effect', effectId: e.id, ...at(e), path: 'disabled', value: !on }]) }
function onMenu(e: EffectRow, key: string): void {
  if (key === 'remove') void person.edit(`删除了效果「${e.name}」`, [{ kind: 'effectDelete', effectId: e.id, ...at(e) }])
}
const openAdd = () => modal.open({ key: 'person-add-effect', title: '添加效果', component: markRaw(AddEffectPage), variant: 'dialog', width: 560, height: 560 })
</script>

<template>
  <div class="ps-effects" data-testid="ps-effects">
    <section class="ps-grp">
      <header class="ps-grp-head"><b>状态</b><small>点一下开 / 关</small></header>
      <div class="ps-conds" data-testid="ps-conds">
        <template v-for="c in conds" :key="c.id">
          <span v-if="c.level !== null" class="ps-cond ps-cond--level" :data-on="c.on || undefined">
            {{ c.name }}
            <Stepper :value="c.level" :minus-label="`${c.name}少一级`" :plus-label="`${c.name}多一级`" :minus-disabled="ro || c.level <= 0" :plus-disabled="ro" @minus="setLevel(c, c.level - 1)" @plus="setLevel(c, c.level + 1)" />
          </span>
          <button v-else type="button" class="ps-cond" :aria-pressed="c.on" :disabled="ro" :data-testid="`ps-cond-${c.id}`" @click="toggleCond(c)">{{ c.name }}</button>
        </template>
      </div>
    </section>

    <div class="ps-toolbar ps-toolbar--end">
      <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-effects-add" @click="openAdd"><Icon name="plus" :size="14" />添加效果</button>
    </div>
    <p v-if="!anyEffect" class="ps-drawer-note">现在没有效果。法术、物品、特性带来的效果和你加的效果会出现在这里。</p>
    <template v-for="grp in groups" :key="grp.key">
      <section v-if="grp.rows.length" class="ps-grp" :data-testid="`ps-eff-${grp.key}`">
        <header class="ps-grp-head">
          <b>{{ grp.label }}</b><small>{{ grp.rows.length }}</small>
          <span class="ps-grp-cols" aria-hidden="true"><span style="width: 120px" data-wide>来源</span><span style="width: 88px" data-wide>持续</span><span style="width: 56px">开关</span><span class="ps-grp-menu-col" /></span>
        </header>
        <p v-if="grp.info" class="ps-grp-info">{{ grp.info }}</p>
        <ul class="ps-rows">
          <li v-for="e in grp.rows" :key="e.id" class="ps-row">
            <div class="ps-row-main">
              <div class="ps-row-name"><b class="ps-row-title ps-row-title--static">{{ e.name }}</b></div>
              <span class="ps-cell" style="width: 120px" data-wide>{{ e.source || '手动' }}</span>
              <span class="ps-cell" style="width: 88px" data-wide>{{ e.duration || '—' }}</span>
              <span class="ps-cell" style="width: 56px"><Switch :model-value="!e.disabled" :label="`${e.name}生效`" :disabled="ro || !e.toggleable" @update:model-value="(v: boolean) => toggleEffect(e, v)" /></span>
              <span class="ps-grp-menu-col"><MoreMenu :label="`${e.name}的更多操作`" :items="[{ key: 'remove', label: '删除', danger: true, disabled: ro }]" @select="onMenu(e, $event)" /></span>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

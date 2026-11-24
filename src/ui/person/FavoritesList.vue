<script setup lang="ts">
// 侧栏「收藏」（照 Tidy5e character-parts/favorites/*：FavoriteItem / FavoriteSlot / FavoriteSkillTool / FavoriteEffect / FavoriteActivity）。
// 清单与每条的数都取官方 _prepareFavorites（侧栏部分 favorites）：标题 · 副标题 · 次数 / 剩余法术位 原地改 · 加值 / 被动 · 豁免 DC · 数量 · 开关（装备 / 效果启用）· × 取消收藏。
// 写入经人物 store（可撤销）；点名字掷骰 = P7。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明 */
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import Switch from '../kit/Switch.vue'
import NumIn from './table/NumIn.vue'
import { signed } from './view'

const person = usePersonStore()
const ro = computed(() => person.readOnly)
const rows = computed<any[]>(() => (person.sheet?.view?.parts?.sidebar?.favorites ?? []) as any[])
const plain = (t: unknown): string => String(t ?? '').replace(/&bull;/g, '·').replace(/<[^>]+>/g, '').trim()

function setUses(f: any, v: number): void {
  const max = Number(f.uses?.max ?? 0)
  if (f.type === 'activity' && f.itemId && f.activityId) void person.edit(`${plain(f.title)}剩余次数 ${v}`, [{ kind: 'item', itemId: f.itemId, path: `system.activities.${f.activityId}.uses.spent`, value: Math.max(0, max - v) }])
  else if (f.type === 'item' && f.itemId) void person.edit(`${plain(f.title)}剩余次数 ${v}`, [{ kind: 'item', itemId: f.itemId, path: 'system.uses.spent', value: Math.max(0, max - v) }])
  else if (f.type === 'slots') void person.edit(`${plain(f.title)}剩 ${v}`, [{ kind: 'set', path: `system.spells.${f.id}.value`, value: v }])
}
function toggle(f: any, on: boolean): void {
  if (f.type === 'effect' && f.effectId) void person.edit(`${on ? '启用' : '停用'}效果「${plain(f.title)}」`, [{ kind: 'effect', effectId: f.effectId, ...(f.parentId ? { itemId: f.parentId } : {}), path: 'disabled', value: !on }])
  else if (f.type === 'item' && f.itemId) void person.edit(`${on ? '装备' : '卸下'}${plain(f.title)}`, [{ kind: 'item', itemId: f.itemId, path: 'system.equipped', value: on }])
}
function unfav(f: any): void {
  const next = ((person.sheet?.system.favorites ?? []) as Array<{ id: string }>).filter((x) => x.id !== f.id)
  void person.edit(`取消收藏${plain(f.title)}`, [{ kind: 'set', path: 'system.favorites', value: next }])
}
</script>

<template>
  <p v-if="!rows.length" class="ps-drawer-note">还没有收藏。物品、法术、特性在各页 ⋯ 里「收藏到侧栏」；技能、工具在属性页悬停点 ★。</p>
  <ul v-else class="ps-favs" data-testid="ps-favs">
    <li v-for="f in rows" :key="f.id" class="ps-fav" :data-type="f.type" :data-off="f.toggle && !f.toggle.value || undefined">
      <span class="ps-fav-main">
        <b class="ps-fav-name">{{ plain(f.title) }}<small v-if="f.quantity" class="dt-qty">×{{ f.quantity }}</small></b>
        <small v-if="plain(f.subtitle)">{{ plain(f.subtitle) }}</small>
      </span>
      <span class="ps-fav-val">
        <span v-if="f.uses?.max" class="ps-uses"><NumIn :value="Number(f.uses.value ?? 0)" :max="Number(f.uses.max)" :label="`${plain(f.title)}剩余`" :disabled="ro" @set="(v) => setUses(f, v)" /><small>/ {{ f.uses.max }}</small></span>
        <b v-else-if="f.modifier !== undefined && f.modifier !== null && f.modifier !== ''" class="ps-mod">{{ typeof f.modifier === 'number' ? signed(f.modifier) : f.modifier }}<small v-if="f.passive" class="ps-fav-passive">({{ f.passive }})</small></b>
        <span v-else-if="f.save?.dc" class="ps-stack"><small>{{ f.save.ability }}</small><b>{{ f.save.dc }}</b></span>
        <b v-else-if="f.value !== undefined && f.value !== null && f.value !== ''">{{ f.value }}</b>
        <Switch v-if="f.toggle?.applicable" :model-value="!!f.toggle.value" :label="`${plain(f.title)}开关`" :disabled="ro" @update:model-value="(v: boolean) => toggle(f, v)" />
      </span>
      <button class="trpg-icon-btn ps-fav-x" type="button" :aria-label="`取消收藏${plain(f.title)}`" :disabled="ro" @click="unfav(f)"><Icon name="x" :size="12" /></button>
    </li>
  </ul>
</template>

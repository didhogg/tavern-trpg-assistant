<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MonsterArt } from '../../rules/dnd5e2014/data/entries/art'
import { CREATURE_ICONS } from './creatureIcons'
import Icon from './Icon.vue'

/**
 * 头像框（名册的头像）：外框 1px、内框 2px 金边，中间一圈纸色缝；右下角类型徽章。
 * 图片顺序：玩家上传的头像 → 怪物立绘（按焦点裁切）→ 生物类型图标。人物卡外壳沿用同一个组件。
 */
const props = withDefaults(defineProps<{
  w?: number
  h?: number
  label: string
  /** 玩家上传的头像（http/https/data 地址）。 */
  avatar?: string
  art?: MonsterArt
  creatureType?: string
  /** 玩家角色（有职业）：徽章用人形图标，没有职业图标时用 user。 */
  player?: boolean
  badge?: boolean
}>(), { w: 72, h: 90, badge: true, avatar: undefined, art: undefined, creatureType: undefined, player: false })

const failed = ref(false)
const url = computed(() => props.avatar || (typeof props.art?.portrait?.url === 'string' ? props.art.portrait.url : undefined))
watch(url, () => { failed.value = false })
const focus = computed(() => (props.avatar ? undefined : props.art?.portrait?.focus))
const position = computed(() => (focus.value ? `${Math.round(focus.value.x * 100)}% ${Math.round(focus.value.y * 100)}%` : '50% 20%'))
const icon = computed(() => CREATURE_ICONS[props.creatureType ?? ''] ?? CREATURE_ICONS.unknown)
const dims = computed(() => ({ '--fw': `${props.w}px`, '--fh': `${props.h}px`, '--ficon': `${Math.round(Math.min(props.w, props.h) * 0.5)}px` }))
</script>

<template>
  <span class="trpg-frame" role="img" :aria-label="label" :style="dims">
    <span class="trpg-frame__gold">
      <span class="trpg-frame__pic">
        <img v-if="url && !failed" class="trpg-frame__img" :src="url" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" :style="{ objectPosition: position }" @error="failed = true" />
        <!-- 内容来自 creatureIcons.ts 中的常量（game-icons 路径），不含用户输入 -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <svg v-else class="trpg-frame__ph" viewBox="0 0 512 512" aria-hidden="true" v-html="icon" />
      </span>
    </span>
    <span v-if="badge" class="trpg-frame__badge" aria-hidden="true">
      <Icon v-if="player" name="user" :size="14" />
      <!-- eslint-disable-next-line vue/no-v-html -->
      <svg v-else viewBox="0 0 512 512" width="14" height="14" fill="currentColor" v-html="icon" />
    </span>
  </span>
</template>

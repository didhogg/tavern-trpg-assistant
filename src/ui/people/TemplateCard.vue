<script setup lang="ts">
import AvatarFrame from '../kit/AvatarFrame.vue'
import type { TemplateRow } from './templates'
import { crText, isNpc, sizeCreature } from './templateView'

/** 模板列表里的小卡片：48×60 类型图块（不放怪物立绘）+ 名字 + 挑战等级徽章 + 书名。 */
defineProps<{ row: TemplateRow; selected: boolean }>()
defineEmits<{ pick: [] }>()
</script>

<template>
  <button class="trpg-tplcard" :class="{ 'is-selected': selected }" type="button" :aria-pressed="selected" :data-testid="`tpl-row-${row.entry.id}`" @click="$emit('pick')">
    <AvatarFrame :w="48" :h="60" :badge="false" :label="row.entry.name" :creature-type="row.block?.creatureType.type" />
    <span class="trpg-tplcard__main">
      <span class="trpg-tplcard__name">{{ row.entry.name }}<span v-if="row.entry.nameEn" class="trpg-tplcard__en">{{ row.entry.nameEn }}</span></span>
      <span class="trpg-tplcard__meta">
        <template v-if="row.block"><span v-if="crText(row)" class="trpg-tplcard__cr">{{ crText(row) }}</span><span>{{ isNpc(row) ? '具名 NPC ・ ' : '' }}{{ sizeCreature(row) }}</span></template>
        <span v-else>数值未安装</span>
      </span>
    </span>
    <span class="trpg-tplcard__book">{{ row.packName }}</span>
  </button>
</template>

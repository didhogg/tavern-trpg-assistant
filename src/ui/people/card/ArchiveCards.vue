<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '../../../schemas/people'
import Icon from '../../kit/Icon.vue'
import HoverTip from '../../kit/HoverTip.vue'
import { ARCHIVE_VISIBLE, archiveOf, type ArchiveGroupKey, type ArchiveItem } from './archive'

const props = defineProps<{ person: Person; nameOf: (id?: string) => string; readOnly: boolean }>()
const emit = defineEmits<{ edit: [card: 'defense' | 'senses' | 'proficiency', group?: ArchiveGroupKey]; item: [item: ArchiveItem] }>()
const cards = computed(() => archiveOf(props.person, props.nameOf))
const EMPTY = { defense: '还没有防御项。点 ✎ 添加。', senses: '还没有感官。点 ✎ 添加。', proficiency: '还没有熟练项。点 ✎ 添加。' } as const
const visibleGroups = (card: ReturnType<typeof archiveOf>[number]) => card.groups.filter((g) => g.items.length > 0)
</script>

<template>
  <section class="trpg-card-archive" data-testid="person-card-archive">
    <article v-for="card in cards" :key="card.key" class="trpg-archive-card" :data-testid="`person-card-archive-${card.key}`">
      <header class="trpg-card-head"><h2>{{ card.title }}</h2><button class="trpg-icon-btn" type="button" :disabled="readOnly" :aria-label="`编辑${card.title}`" :data-testid="`person-card-archive-edit-${card.key}`" @click="emit('edit', card.key)"><Icon name="pencil-simple" :size="20" /></button></header>
      <div v-for="group in visibleGroups(card)" :key="group.key" class="trpg-archive-row">
        <button v-if="group.label" class="trpg-archive-row__label" type="button" :aria-label="`${group.label}，打开管理`" @click="emit('edit', card.key, group.key)">{{ group.label }}</button>
        <div class="trpg-archive-row__items">
          <HoverTip v-for="item in group.items.slice(0, ARCHIVE_VISIBLE)" :key="item.id" :lines="[item.label, `获得方式：${item.source}`]"><button class="trpg-pill trpg-pill--sm" type="button" @click="emit('item', item)">{{ item.label }}</button></HoverTip>
          <HoverTip v-if="group.items.length > ARCHIVE_VISIBLE" :lines="group.items.slice(ARCHIVE_VISIBLE).map((i) => i.label)"><button class="trpg-pill trpg-pill--sm trpg-pill--more" type="button" :data-testid="`archive-more-${group.key}`" :aria-label="`还有 ${group.items.length - ARCHIVE_VISIBLE} 项，打开${group.label || card.title}管理`" @click="emit('edit', card.key, group.key)">+{{ group.items.length - ARCHIVE_VISIBLE }}</button></HoverTip>
        </div>
      </div>
      <p v-if="visibleGroups(card).length === 0" class="trpg-card-empty">{{ EMPTY[card.key] }}</p>
    </article>
  </section>
</template>

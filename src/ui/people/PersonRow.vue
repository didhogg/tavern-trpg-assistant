<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Person, Tag } from '../../schemas/people'
import type { IdentitySegment } from './identity'
import type { RowSummary } from './rows'
import AvatarFrame from '../kit/AvatarFrame.vue'
import Checkbox from '../kit/Checkbox.vue'
import HpBar from '../kit/HpBar.vue'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import StatCell from '../kit/StatCell.vue'

/** 人物卡片（名册的一张）：头像框 → 名字 → 身份行 → 标签 → 生命栏 → AC 栏（队伍页再加被动察觉、速度）。 */
const props = defineProps<{
  person: Person
  summary: RowSummary
  identity: IdentitySegment[]
  tags: Tag[]
  selecting: boolean
  selected: boolean
  partyMode?: boolean
  /** 堆叠布局：窄屏，或队伍页内容宽度放不下四个数值栏时。 */
  stacked?: boolean
  highlighted?: boolean
  menuItems: Array<{ key: string; label: string; danger?: boolean; disabled?: boolean; reason?: string }>
}>()
const emit = defineEmits<{ open: []; toggle: [value: boolean]; tag: [id: string]; menu: [key: string] }>()
const passive = computed(() => (typeof props.person.block.passive === 'number' ? props.person.block.passive : undefined))
const speed = computed(() => (typeof props.person.block.speed?.walk === 'number' ? props.person.block.speed.walk : undefined))
const tagsOpen = ref(false)
const tagName = (id: string): string => props.tags.find((t) => t.id === id)?.name ?? id
const avatar = computed(() => (typeof props.person.avatar === 'string' ? props.person.avatar : undefined))
const isPlayer = computed(() => (props.person.block.classes ?? []).length > 0)
function act(): void {
  if (props.selecting) emit('toggle', !props.selected)
  else emit('open')
}
</script>

<template>
  <li
    class="trpg-person"
    :class="{ 'is-selected': selected, 'is-highlight': highlighted, 'is-party': partyMode, 'is-selecting': selecting, 'is-stack': stacked }"
    :data-testid="`people-row-${person.id}`"
    role="listitem"
    tabindex="0"
    @click="act"
    @keydown.enter.prevent="act"
  >
    <Checkbox v-if="selecting" class="trpg-person__check" :model-value="selected" :label="`选择 ${person.name}`" @click.stop @update:model-value="(v) => emit('toggle', v)" />
    <AvatarFrame class="trpg-person__avatar" :label="person.name" :avatar="avatar" :art="person.block.art" :creature-type="person.block.creatureType?.type" :player="isPlayer" />
    <div class="trpg-person__main">
      <div class="trpg-person__name-line">
        <span class="trpg-person__name" :title="person.nameEn ? `${person.name} ${person.nameEn}` : person.name">{{ person.name }}</span>
        <span v-if="person.nameEn && person.nameEn !== person.name" class="trpg-person__en">{{ person.nameEn }}</span>
      </div>
      <p v-if="identity.length" class="trpg-person__identity"><template v-for="(seg, i) in identity" :key="i"><span v-if="i" class="trpg-person__dot" aria-hidden="true"> ・ </span><span :class="seg.strong ? 'is-strong' : 'is-soft'">{{ seg.text }}</span></template></p>
      <div v-if="person.tags.length" class="trpg-person__tags" :class="{ 'is-open': tagsOpen }">
        <button v-for="id in person.tags" :key="id" class="trpg-person__tag" type="button" :aria-label="`按标签「${tagName(id)}」筛选`" @click.stop="emit('tag', id)">{{ tagName(id) }}</button>
        <button v-if="person.tags.length > 2" class="trpg-person__tag-more" type="button" :aria-expanded="tagsOpen" :aria-label="tagsOpen ? '收起标签' : `展开其余 ${person.tags.length - 2} 个标签`" @click.stop="tagsOpen = !tagsOpen">{{ tagsOpen ? '收起' : `+${person.tags.length - 2}` }}</button>
      </div>
      <p v-if="summary.effects.length && !partyMode" class="trpg-person__effects" :title="summary.effects.join('、')">效果：{{ summary.effects.join('、') }}</p>
    </div>
    <div class="trpg-person__cols">
      <div class="trpg-col trpg-col--hp"><HpBar v-if="summary.hp.max !== null" :current="summary.hp.current" :max="summary.hp.max" :temp="summary.hp.temp" /></div>
      <div class="trpg-col trpg-col--ac"><StatCell label="AC" :value="summary.ac" /></div>
      <div v-if="partyMode" class="trpg-col trpg-col--sm"><StatCell label="被动察觉" :value="passive" size="md" /></div>
      <div v-if="partyMode" class="trpg-col trpg-col--sm"><StatCell label="速度" :value="speed" unit="尺" size="md" /></div>
    </div>
    <div v-if="!selecting" class="trpg-person__end">
      <span :data-testid="`people-row-more-${person.id}`" @click.stop>
        <MoreMenu :label="person.name" :items="menuItems" @select="emit('menu', $event)" />
      </span>
    </div>
    <Icon v-if="person.pinned" name="push-pin-fill" :size="16" class="trpg-person__pin" />
  </li>
</template>

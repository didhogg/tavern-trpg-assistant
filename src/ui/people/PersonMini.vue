<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '../../schemas/people'
import AvatarFrame from '../kit/AvatarFrame.vue'
import { personIdentity } from './identity'
import { sharedLabels } from './labels'

/** 迷你人物卡（存入我的库、回收站）：40×50 头像框 + 名字 + 身份行；默认插槽是名字下面多出来的一行小字。 */
const props = defineProps<{ person: Person }>()
const identity = computed(() => personIdentity(props.person, sharedLabels.value))
const avatar = computed(() => (typeof props.person.avatar === 'string' ? props.person.avatar : undefined))
</script>

<template>
  <div class="trpg-mini">
    <AvatarFrame :w="40" :h="50" :badge="false" :label="person.name" :avatar="avatar" :art="person.block.art" :creature-type="person.block.creatureType?.type" :player="(person.block.classes ?? []).length > 0" />
    <div class="trpg-mini__main">
      <span class="trpg-mini__name" :title="person.name">{{ person.name }}</span>
      <span v-if="identity.length" class="trpg-mini__sub"><template v-for="(seg, i) in identity" :key="i"><span v-if="i" aria-hidden="true"> ・ </span><span :class="seg.strong ? 'is-strong' : ''">{{ seg.text }}</span></template></span>
      <slot />
    </div>
  </div>
</template>

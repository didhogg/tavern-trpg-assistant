<script setup lang="ts">
import { computed } from 'vue'
import type { PersonEffect } from '../../../schemas/people'
import Icon from '../../kit/Icon.vue'
import HoverTip from '../../kit/HoverTip.vue'
import { durationText } from './effectText'

const props = defineProps<{ effect: PersonEffect; readOnly: boolean; showCategory?: boolean }>()
const emit = defineEmits<{ open: []; remove: [] }>()
const CATEGORY: Record<PersonEffect['category'], string> = { condition: '状态', status: '状态', disease: '疾病', spell: '法术', other: '其他' }
const duration = computed(() => durationText(props.effect.duration))
const tip = computed(() => [props.effect.name, `类别：${CATEGORY[props.effect.category]}`, duration.value ? `时长：${duration.value}` : '', props.effect.concentration ? '专注' : '', props.effect.addedAt ? `加入：${new Date(props.effect.addedAt).toLocaleString('zh-CN', { hour12: false })}` : ''].filter(Boolean))
</script>

<template>
  <span class="trpg-pill trpg-effect-pill">
    <HoverTip :lines="tip"><button class="trpg-effect-pill__name" type="button" :aria-label="`查看资料：${effect.name}`" @click="emit('open')">{{ effect.name }}<span v-if="showCategory && effect.category === 'other'" class="trpg-effect-pill__small">其他</span><span v-if="duration" class="trpg-effect-pill__small">{{ duration }}</span><span v-if="effect.concentration" class="trpg-effect-pill__small is-focus">专注</span></button></HoverTip>
    <button class="trpg-effect-pill__x" type="button" :disabled="readOnly" :aria-label="`移除 ${effect.name}`" @click="emit('remove')"><Icon name="x" :size="16" /></button>
  </span>
</template>

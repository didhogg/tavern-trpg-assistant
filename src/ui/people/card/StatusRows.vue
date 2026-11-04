<script setup lang="ts">
import { computed } from 'vue'
import type { Person, PersonEffect } from '../../../schemas/people'
import Icon from '../../kit/Icon.vue'
import EffectPill from './EffectPill.vue'

const props = defineProps<{ person: Person; readOnly: boolean }>()
const emit = defineEmits<{ add: []; open: [effect: PersonEffect]; remove: [id: string] }>()
const statuses = computed(() => props.person.effects.filter((e) => e.category === 'condition' || e.category === 'status'))
const effects = computed(() => props.person.effects.filter((e) => e.category !== 'condition' && e.category !== 'status'))
</script>

<template>
  <section class="trpg-card-status" data-testid="person-card-statuses">
    <header class="trpg-card-head"><h2>状态与效果</h2><button class="trpg-icon-btn" type="button" :disabled="readOnly" aria-label="添加效果" data-testid="person-card-effect-add" @click="emit('add')"><Icon name="plus" :size="20" /></button></header>
    <div v-if="statuses.length" class="trpg-status-row"><span class="trpg-status-row__label">状态</span><div class="trpg-status-row__body"><EffectPill v-for="e in statuses" :key="e.id" :effect="e" :read-only="readOnly" @open="emit('open', e)" @remove="emit('remove', e.id)" /></div></div>
    <div v-if="effects.length" class="trpg-status-row"><span class="trpg-status-row__label">效果</span><div class="trpg-status-row__body"><EffectPill v-for="e in effects" :key="e.id" :effect="e" show-category :read-only="readOnly" @open="emit('open', e)" @remove="emit('remove', e.id)" /></div></div>
    <p v-if="!person.effects.length" class="trpg-card-empty">当前没有状态和效果。</p>
  </section>
</template>

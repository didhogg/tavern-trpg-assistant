<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import Icon from '../../kit/Icon.vue'

export interface EffectChoice {
  name: string
  ref?: string
  duration?: string
}

const props = defineProps<{ conditions: EffectChoice[]; spells: EffectChoice[]; existing: string[]; readOnly: boolean }>()
const emit = defineEmits<{ add: [effect: EffectChoice]; custom: [] }>()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const open = ref(false)
const query = ref('')
const existing = computed(() => new Set(props.existing))
const filteredConditions = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.conditions.filter((item) => !q || item.name.toLowerCase().includes(q))
})
const filteredSpells = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return props.spells.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 12)
})
function add(item: EffectChoice): void {
  if (existing.value.has(item.name)) return
  emit('add', item)
  open.value = false
}
function custom(): void {
  emit('custom')
  open.value = false
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger class="trpg-effect-add" type="button" :disabled="readOnly"><Icon name="plus" :size="14" />添加其他效果</PopoverTrigger>
    <PopoverPortal :to="portalTarget">
      <PopoverContent class="trpg-add-effect" side="bottom" :side-offset="6" :collision-padding="{ top: 16, right: 16, bottom: 64, left: 16 }">
        <div class="trpg-add-effect__head"><strong>添加效果</strong><button class="trpg-icon-btn" type="button" aria-label="关闭添加效果" @click="open = false"><Icon name="x" :size="16" /></button></div>
        <input v-model="query" class="trpg-input" type="search" placeholder="搜状态、法术效果…" aria-label="搜索效果" />
        <p v-if="!query.trim()" class="trpg-field__hint">法术效果：从库里搜（输入法术名）</p>
        <div class="trpg-add-effect__scroll">
          <p class="trpg-add-effect__group">状态</p>
          <div class="trpg-add-effect__choices">
            <button v-for="item in filteredConditions" :key="item.name" class="trpg-effect-candidate" type="button" :disabled="existing.has(item.name)" @click="add(item)">{{ item.name }}</button>
          </div>
          <p v-if="query.trim()" class="trpg-add-effect__group">法术效果</p>
          <div v-if="query.trim()" class="trpg-add-effect__choices">
            <button v-for="item in filteredSpells" :key="item.ref ?? item.name" class="trpg-effect-candidate" type="button" :disabled="existing.has(item.name)" @click="add(item)">{{ item.name }}<span v-if="item.duration"> · {{ item.duration }}</span></button>
            <p v-if="!filteredSpells.length" class="trpg-field__hint">没有匹配的法术。</p>
          </div>
        </div>
        <button class="trpg-btn trpg-btn--small trpg-btn--quiet trpg-add-effect__custom" type="button" @click="custom"><Icon name="plus" :size="14" />自定义…</button>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

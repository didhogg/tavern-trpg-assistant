<script setup lang="ts">
import { computed, inject } from 'vue'
import {
  SelectContent, SelectItem, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport,
} from 'reka-ui'
import Icon from './Icon.vue'

type Option = string | { value: string; label: string }

const props = defineProps<{ options: Option[]; placeholder?: string; label: string }>()
const model = defineModel<string>()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const normalized = computed(() => props.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)))
</script>

<template>
  <SelectRoot v-model="model">
    <SelectTrigger class="trpg-select-trigger" :aria-label="label">
      <SelectValue :placeholder="placeholder ?? '请选择'" />
      <Icon name="caret-down" :size="14" />
    </SelectTrigger>
    <SelectPortal :to="portalTarget">
      <SelectContent class="trpg-select-content" position="popper" :side-offset="4" :collision-padding="8">
        <SelectViewport class="trpg-select-viewport">
          <SelectItem v-for="option in normalized" :key="option.value" :value="option.value" class="trpg-select-item">
            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

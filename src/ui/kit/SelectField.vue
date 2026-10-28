<script setup lang="ts">
import { inject } from 'vue'
import {
  SelectContent, SelectItem, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport,
} from 'reka-ui'

defineProps<{ options: string[]; placeholder?: string; label: string }>()
const model = defineModel<string>()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
</script>

<template>
  <SelectRoot v-model="model">
    <SelectTrigger class="trpg-select-trigger" :aria-label="label">
      <SelectValue :placeholder="placeholder ?? '请选择'" />
      <span aria-hidden="true">▾</span>
    </SelectTrigger>
    <SelectPortal :to="portalTarget">
      <SelectContent class="trpg-select-content" position="popper" :side-offset="4" :collision-padding="8">
        <SelectViewport class="trpg-select-viewport">
          <SelectItem v-for="option in options" :key="option" :value="option" class="trpg-select-item">
            <SelectItemText>{{ option }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

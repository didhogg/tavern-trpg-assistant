<script setup lang="ts">
const tabs = [
  { id: 'actions', label: '行动与技能' },
  { id: 'classes', label: '职业与特性' },
  { id: 'inventory', label: '背包' },
  { id: 'spells', label: '法术' },
  { id: 'story', label: '背景故事' },
] as const
const model = defineModel<string>({ default: 'actions' })
function pick(id: string, event: MouseEvent): void {
  model.value = id
  ;(event.currentTarget as HTMLElement | null)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
</script>

<template>
  <div class="trpg-card-tabs" role="tablist" aria-label="人物分页">
    <button v-for="tab in tabs" :key="tab.id" class="trpg-card-tab" type="button" role="tab" :aria-selected="model === tab.id" :data-testid="`person-card-tab-${tab.id}`" @click="pick(tab.id, $event)">{{ tab.label }}</button>
  </div>
</template>

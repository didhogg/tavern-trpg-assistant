<script setup lang="ts">
import Icon from './Icon.vue'

/** 分类按钮组：带图标的分段大按钮（人物分类、模板类型共用）；选中 = 主色底。 */
export interface TabOption {
  value: string
  label: string
  icon?: string
  count?: number
  testid?: string
}
defineProps<{ options: TabOption[]; label: string }>()
const model = defineModel<string>()
</script>

<template>
  <div class="trpg-tabs2" role="tablist" :aria-label="label">
    <button
      v-for="o in options"
      :key="o.value"
      class="trpg-tabs2__tab"
      type="button"
      role="tab"
      :aria-selected="model === o.value"
      :data-testid="o.testid"
      @click="model = o.value"
    >
      <Icon v-if="o.icon" :name="o.icon" :size="18" />
      <span class="trpg-tabs2__name">{{ o.label }}</span>
      <span v-if="o.count !== undefined" class="trpg-tabs2__count">{{ o.count }}</span>
    </button>
  </div>
</template>

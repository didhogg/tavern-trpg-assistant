<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

/** 弹窗内的浏览器式标签（U5R §10）：选中标签与内容区相连；窄屏横向可滑并自动滚入当前项。 */
export interface BrowserTab { key: string; label: string; count?: number; disabled?: boolean }
const props = defineProps<{ tabs: BrowserTab[]; label: string }>()
const model = defineModel<string>({ required: true })
const bar = ref<HTMLElement | null>(null)

function onKey(event: KeyboardEvent): void {
  const enabled = props.tabs.filter((t) => !t.disabled)
  const i = enabled.findIndex((t) => t.key === model.value)
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault()
    const next = enabled[(i + (event.key === 'ArrowRight' ? 1 : enabled.length - 1)) % enabled.length]
    if (next) model.value = next.key
  }
}
watch(model, async () => {
  await nextTick()
  bar.value?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
})
</script>

<template>
  <div ref="bar" class="trpg-btabs" role="tablist" :aria-label="label" @keydown="onKey">
    <button v-for="tab in tabs" :key="tab.key" class="trpg-btabs__tab" type="button" role="tab" :aria-selected="model === tab.key" :tabindex="model === tab.key ? 0 : -1" :disabled="tab.disabled" @click="model = tab.key">
      <span>{{ tab.label }}</span><span v-if="tab.count" class="trpg-btabs__count">{{ tab.count }}</span>
    </button>
  </div>
</template>

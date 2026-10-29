<script setup lang="ts" generic="T">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/** 定高行的虚拟滚动：只渲染可见的行，几千条也不卡。滚动容器就是组件本身。 */
const props = defineProps<{ items: T[]; rowHeight: number; keyOf: (item: T) => string; label: string }>()
const el = ref<HTMLElement | null>(null)
const top = ref(0)
const height = ref(400)
const OVERSCAN = 6

const start = computed(() => Math.max(0, Math.floor(top.value / props.rowHeight) - OVERSCAN))
const end = computed(() => Math.min(props.items.length, Math.ceil((top.value + height.value) / props.rowHeight) + OVERSCAN))
const visible = computed(() => props.items.slice(start.value, end.value).map((item, i) => ({ item, index: start.value + i })))

let observer: ResizeObserver | undefined
onMounted(() => {
  height.value = el.value?.clientHeight || 400
  observer = new ResizeObserver(() => (height.value = el.value?.clientHeight || 400))
  if (el.value) observer.observe(el.value)
})
onBeforeUnmount(() => observer?.disconnect())
defineExpose({ scrollToTop: () => el.value && (el.value.scrollTop = 0) })
</script>

<template>
  <div ref="el" class="trpg-vlist" role="list" :aria-label="label" tabindex="0" @scroll.passive="top = ($event.target as HTMLElement).scrollTop">
    <div class="trpg-vlist__space" :style="{ height: `${items.length * rowHeight}px` }">
      <div v-for="v in visible" :key="keyOf(v.item)" role="listitem" class="trpg-vlist__row" :style="{ top: `${v.index * rowHeight}px`, height: `${rowHeight}px` }">
        <slot :item="v.item" :index="v.index" />
      </div>
    </div>
  </div>
</template>

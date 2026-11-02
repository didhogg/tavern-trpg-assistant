<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MonsterArt } from '../../rules/dnd5e2014/data/entries/art'
import { CREATURE_ICONS } from './creatureIcons'
import { cropStyle } from './crop'

const props = defineProps<{ art?: MonsterArt; creatureType?: string; size: number; label: string }>()
const failed = ref(false)
const loaded = ref(false)
const natural = ref({ w: 0, h: 0 })
const url = computed(() => typeof props.art?.portrait?.url === 'string' ? props.art.portrait.url : undefined)
const icon = computed(() => CREATURE_ICONS[props.creatureType ?? ''] ?? CREATURE_ICONS.unknown)
const style = computed(() => {
  const p = props.art?.portrait
  if (!p || !loaded.value) return { width: 0, left: 0, top: 0 }
  return cropStyle(p.focus, natural.value.w, natural.value.h, props.size)
})
const dims = computed(() => ({ width: `${props.size}px`, height: `${props.size}px` }))
function onLoad(e: Event): void { const img = e.target as HTMLImageElement; if (img.naturalWidth && img.naturalHeight) { natural.value = { w: img.naturalWidth, h: img.naturalHeight }; loaded.value = true } }
</script>

<template>
  <span class="trpg-avatar" :style="dims" :aria-label="label">
    <svg v-if="!url || failed || !loaded" viewBox="0 0 512 512" aria-hidden="true"><g v-html="icon" /></svg>
    <img v-else :src="url" :alt="label" loading="lazy" decoding="async" referrerpolicy="no-referrer" :style="{ width: style.width + 'px', left: style.left + 'px', top: style.top + 'px', opacity: loaded ? 1 : 0 }" @load="onLoad" @error="failed = true" />
  </span>
</template>

<style scoped>
.trpg-avatar { display: inline-flex; align-items: center; justify-content: center; flex: none; overflow: hidden; position: relative; border-radius: 10px; background: var(--surface-2); color: var(--ink-2); }
.trpg-avatar svg { width: 68%; height: 68%; fill: currentColor; }
.trpg-avatar img { position: absolute; max-width: none; transition: opacity 180ms ease; }
@media (prefers-reduced-motion: reduce) { .trpg-avatar img { transition: none; } }
</style>

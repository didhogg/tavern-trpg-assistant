<script setup lang="ts">
import { inject, nextTick, onBeforeUnmount, ref } from 'vue'

/**
 * 悬停气泡（U5R §1.2）：只读、不接收鼠标、不遮住触发元素；优先在上方，放不下翻到下方。
 * 触屏没有悬停：触发元素点一下切换显示（再点或点别处关闭）；气泡里没有按钮。
 */
const props = defineProps<{ lines?: string[]; text?: string; disabled?: boolean; inline?: boolean }>()
const open = ref(false)
/** 气泡挂到插件顶层（和下拉菜单同一处）：不被列表行的裁切（content-visibility / overflow）切掉。 */
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const trigger = ref<HTMLElement | null>(null)
const bubble = ref<HTMLElement | null>(null)
const pos = ref({ left: 0, top: 0, below: false })
const id = `trpg-tip-${Math.random().toString(36).slice(2, 8)}`
let timer: ReturnType<typeof setTimeout> | undefined

const content = (): string[] => (props.lines && props.lines.length ? props.lines.slice(0, 8) : props.text ? [props.text] : [])

async function place(): Promise<void> {
  await nextTick()
  const t = trigger.value?.getBoundingClientRect()
  const b = bubble.value?.getBoundingClientRect()
  if (!t || !b) return
  const gap = 8
  const below = t.top - b.height - gap < 8
  const left = Math.min(Math.max(8, t.left + t.width / 2 - b.width / 2), window.innerWidth - b.width - 8)
  pos.value = { left, top: below ? t.bottom + gap : t.top - b.height - gap, below }
}
function show(): void {
  if (props.disabled || content().length === 0) return
  clearTimeout(timer)
  timer = setTimeout(() => { open.value = true; void place() }, 120)
}
function hide(): void { clearTimeout(timer); open.value = false }
function toggleTouch(event: PointerEvent): void {
  if (event.pointerType === 'mouse') return
  if (open.value) hide(); else { open.value = true; void place() }
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <span ref="trigger" class="trpg-tip" :class="{ 'is-inline': inline }" :aria-describedby="open ? id : undefined" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide" @pointerdown="toggleTouch">
    <slot />
    <Teleport :to="portalTarget" :disabled="!portalTarget">
      <span v-if="open" :id="id" ref="bubble" class="trpg-tip__bubble" :class="{ 'is-below': pos.below }" role="tooltip" :style="{ left: `${pos.left}px`, top: `${pos.top}px` }"><span v-for="(line, i) in content()" :key="i" class="trpg-tip__line">{{ line }}</span></span>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
// 截取头像（照 GitHub / Discord：选好图才出现，方框里拖动挪位置、滚轮或缩放条放大缩小，确认按钮只在这里）。
//   file = 刚选 / 拖进来的图；src = 读到的链接图；src + rect = 重新截取已有的。
import { computed, onMounted, ref } from 'vue'
import { usePersonStore } from '../../../stores/person'
import { useModalStore } from '../../../stores/modal'
import { PORTRAIT_FLAG, bakePortrait, centeredRect, loadImage, readImageFile, type CropRect, type LoadedImage } from './portrait'

const props = defineProps<{ file?: File; src?: string; rect?: CropRect }>()
const person = usePersonStore()
const modal = useModalStore()

const STAGE = 300
const FRAME = 220
const error = ref('')
const busy = ref(false)
const source = ref<string | null>(null)
const img = ref<LoadedImage | null>(null)
/** 方框中心（原图像素）与边长（原图像素）。 */
const cx = ref(0); const cy = ref(0); const side = ref(1)

const maxSide = computed(() => (img.value ? Math.min(img.value.width, img.value.height) : 1))
const zoom = computed({
  get: () => maxSide.value / side.value,
  set: (z: number) => { side.value = maxSide.value / Math.min(5, Math.max(1, z)); clamp() },
})
const scale = computed(() => FRAME / side.value)
const imgStyle = computed(() => {
  const i = img.value
  if (!i) return {}
  const s = scale.value
  return { width: `${i.width * s}px`, height: `${i.height * s}px`, left: `${STAGE / 2 - cx.value * s}px`, top: `${STAGE / 2 - cy.value * s}px` }
})

function clamp(): void {
  const i = img.value
  if (!i) return
  const h = side.value / 2
  cx.value = Math.min(i.width - h, Math.max(h, cx.value))
  cy.value = Math.min(i.height - h, Math.max(h, cy.value))
}
function place(rect: CropRect): void {
  const i = img.value!
  side.value = Math.min(maxSide.value, Math.max(8, rect.w * i.width))
  cx.value = (rect.x + rect.w / 2) * i.width
  cy.value = (rect.y + rect.h / 2) * i.height
  clamp()
}
const cropRect = (): CropRect => {
  const i = img.value!
  const h = side.value / 2
  return { x: (cx.value - h) / i.width, y: (cy.value - h) / i.height, w: side.value / i.width, h: side.value / i.height }
}

async function open(src: string, start?: CropRect): Promise<void> {
  busy.value = true; error.value = ''
  try {
    const loaded = await loadImage(src)
    source.value = src; img.value = loaded
    place(loaded.bakeable && start ? start : centeredRect(loaded.width, loaded.height))
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally { busy.value = false }
}
onMounted(async () => {
  if (props.file) {
    busy.value = true
    try { await open(await readImageFile(props.file)) } catch (e) { error.value = e instanceof Error ? e.message : String(e); busy.value = false }
  } else if (props.src) await open(props.src, props.rect)
})

// 拖动：按住图片任意处挪（方框不动，图在下面走，同 Discord / GitHub）
let drag: { x: number; y: number; cx: number; cy: number } | null = null
function down(e: PointerEvent): void {
  if (!img.value?.bakeable || e.button !== 0) return
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  drag = { x: e.clientX, y: e.clientY, cx: cx.value, cy: cy.value }
}
function move(e: PointerEvent): void {
  if (!drag) return
  cx.value = drag.cx - (e.clientX - drag.x) / scale.value
  cy.value = drag.cy - (e.clientY - drag.y) / scale.value
  clamp()
}
const up = (): void => { drag = null }
function wheel(e: WheelEvent): void {
  if (!img.value?.bakeable) return
  zoom.value = zoom.value * Math.exp(-e.deltaY * 0.0015)
}
function key(e: KeyboardEvent): void {
  if (!img.value?.bakeable) return
  const step = side.value * 0.04
  const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  if (moves[e.key]) { cx.value += moves[e.key][0]; cy.value += moves[e.key][1]; clamp() }
  else if (e.key === '+' || e.key === '=') zoom.value = zoom.value * 1.1
  else if (e.key === '-') zoom.value = zoom.value / 1.1
  else return
  e.preventDefault()
}

async function apply(): Promise<void> {
  if (!img.value || !source.value || busy.value) return
  busy.value = true; error.value = ''
  try {
    const r = cropRect()
    const baked = await bakePortrait(img.value, r)
    const ok = await person.edit('换了头像', [
      { kind: 'set', path: 'img', value: baked ?? source.value },
      { kind: 'set', path: PORTRAIT_FLAG, value: { src: source.value, ...r } },
    ])
    if (ok) modal.done()
    else error.value = '没换成，见上方提示'
  } finally { busy.value = false }
}
</script>

<template>
  <div class="av-crop" data-testid="avatar-crop">
    <div
      v-if="img"
      class="av-stage"
      :style="{ width: `${STAGE}px`, height: `${STAGE}px` }"
      tabindex="0"
      role="application"
      aria-label="截取方框：拖动挪位置，滚轮或 + − 缩放，方向键微调"
      :data-locked="!img.bakeable || undefined"
      @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"
      @wheel.prevent="wheel" @keydown="key"
    >
      <img :src="source!" alt="" draggable="false" :style="imgStyle">
      <span class="av-frame" :style="{ width: `${FRAME}px`, height: `${FRAME}px` }" />
    </div>
    <p v-else-if="busy" class="ps-drawer-note">正在读取图片…</p>
    <label v-if="img?.bakeable" class="av-zoom"><span>缩放</span>
      <button type="button" class="trpg-icon-btn" aria-label="缩小" @click="zoom = zoom / 1.2">−</button>
      <input v-model.number="zoom" type="range" min="1" max="5" step="0.01" aria-label="缩放">
      <button type="button" class="trpg-icon-btn" aria-label="放大" @click="zoom = zoom * 1.2">+</button>
    </label>
    <p v-if="img && !img.bakeable" class="ps-drawer-note">这个网站的图不让在本机截取，会直接用这个链接、居中显示。想截取可以把图存下来再上传。</p>
    <p v-if="error" class="ps-drawer-note ps-drawer-note--warn" role="alert">{{ error }}</p>
    <div class="ps-drawer-actions">
      <button class="trpg-btn" type="button" @click="modal.done()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" data-testid="avatar-apply" :disabled="!img || busy || person.readOnly" @click="apply">设为头像</button>
    </div>
  </div>
</template>

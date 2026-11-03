<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { AvatarCrop, AvatarSource } from '../../../schemas/people'
import type { AssetRef } from '../../../schemas/text'
import { putAsset } from '../../../core/library/assets'
import { useAppStore } from '../../../stores/app'
import { useModalStore } from '../../../stores/modal'
import Icon from '../../kit/Icon.vue'
import { cropImageToBytes } from './autoCrop'
import { useAssetUrl } from './useAssetUrl'

const props = defineProps<{
  avatarSource: AvatarSource
  readOnly: boolean
  onApply?: (avatar: AssetRef, source: AvatarSource) => void
}>()
const app = useAppStore()
const modal = useModalStore()
const sourceUrl = useAssetUrl(computed(() => props.avatarSource.asset))
const image = ref<HTMLImageElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const preview = ref<HTMLCanvasElement | null>(null)
const natural = ref<{ w: number; h: number } | null>(null)
const crop = ref<AvatarCrop>({ ...props.avatarSource.crop })
const error = ref('')
const drag = ref<{ kind: 'move' | 'nw' | 'ne' | 'sw' | 'se'; x: number; y: number; before: AvatarCrop } | null>(null)
const aspect = computed(() => (natural.value ? (natural.value.w / natural.value.h) * (5 / 4) : 1.25))
const minW = computed(() => {
  if (!natural.value) return 0.05
  return Math.min(1, Math.max(0.04, (0.2 * Math.min(natural.value.w, natural.value.h)) / natural.value.w))
})
const maxW = computed(() => {
  if (!natural.value) return 1
  return Math.max(minW.value, Math.min(1, (0.8 * natural.value.h) / natural.value.w))
})
const zoom = computed({
  get: () => Math.round(((crop.value.w - minW.value) / (maxW.value - minW.value || 1)) * 100),
  set: (value: number) => {
    const w = minW.value + ((maxW.value - minW.value) * value) / 100
    const centerX = crop.value.x + crop.value.w / 2
    const centerY = crop.value.y + crop.value.h / 2
    crop.value.w = w
    crop.value.h = w * aspect.value
    crop.value.x = Math.max(0, Math.min(1 - w, centerX - w / 2))
    crop.value.y = Math.max(0, Math.min(1 - crop.value.h, centerY - crop.value.h / 2))
  },
})
function stepZoom(delta: number): void {
  zoom.value = Math.max(0, Math.min(100, zoom.value + delta))
}
function loaded(): void {
  if (!image.value) return
  natural.value = { w: image.value.naturalWidth, h: image.value.naturalHeight }
  crop.value = { ...props.avatarSource.crop }
  void nextTick(draw)
}
function draw(): void {
  const canvas = preview.value
  const img = image.value
  if (!canvas || !img) return
  canvas.width = 96
  canvas.height = 120
  const context = canvas.getContext('2d')
  if (!context) return
  context.drawImage(img, crop.value.x * img.naturalWidth, crop.value.y * img.naturalHeight, crop.value.w * img.naturalWidth, crop.value.h * img.naturalHeight, 0, 0, 96, 120)
}
watch(crop, () => void nextTick(draw), { deep: true })
function point(event: PointerEvent): { x: number; y: number } {
  const rect = stage.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }
}
function clampBox(box: AvatarCrop): void {
  box.w = Math.max(minW.value, Math.min(maxW.value, box.w))
  box.h = box.w * aspect.value
  if (box.h > 1) { box.h = 1; box.w = box.h / aspect.value }
  box.x = Math.max(0, Math.min(1 - box.w, box.x))
  box.y = Math.max(0, Math.min(1 - box.h, box.y))
}
function down(event: PointerEvent, kind: 'move' | 'nw' | 'ne' | 'sw' | 'se'): void {
  if (props.readOnly || !natural.value) return
  event.preventDefault()
  event.stopPropagation()
  const p = point(event)
  drag.value = { kind, x: p.x, y: p.y, before: { ...crop.value } }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up, { once: true })
}
function move(event: PointerEvent): void {
  if (!drag.value) return
  const p = point(event)
  const before = drag.value.before
  const dx = p.x - drag.value.x
  const dy = p.y - drag.value.y
  if (drag.value.kind === 'move') {
    crop.value = { ...before, x: Math.max(0, Math.min(1 - before.w, before.x + dx)), y: Math.max(0, Math.min(1 - before.h, before.y + dy)) }
    return
  }
  const right = before.x + before.w
  const bottom = before.y + before.h
  const west = drag.value.kind.includes('w')
  const north = drag.value.kind.includes('n')
  let w = west ? right - p.x : p.x - before.x
  w = Math.max(minW.value, Math.min(maxW.value, w))
  const h = Math.min(1, w * aspect.value)
  if (h < w * aspect.value) w = h / aspect.value
  const next: AvatarCrop = { x: west ? right - w : before.x, y: north ? bottom - h : before.y, w, h }
  clampBox(next)
  crop.value = next
}
function up(): void {
  drag.value = null
  window.removeEventListener('pointermove', move)
}
function nudge(event: KeyboardEvent): void {
  if (props.readOnly) return
  const step = event.shiftKey ? 0.1 : 0.02
  const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  const move = moves[event.key]
  if (!move) return
  event.preventDefault()
  crop.value.x = Math.max(0, Math.min(1 - crop.value.w, crop.value.x + move[0]))
  crop.value.y = Math.max(0, Math.min(1 - crop.value.h, crop.value.y + move[1]))
}
async function apply(): Promise<void> {
  if (!image.value || props.readOnly) return
  try {
    const bytes = await cropImageToBytes(image.value, crop.value)
    const asset = await putAsset(app.svc().db, bytes, app.svc().now())
    props.onApply?.(asset, { ...props.avatarSource, crop: { ...crop.value } })
    modal.pop()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
}
onBeforeUnmount(() => window.removeEventListener('pointermove', move))
</script>

<template>
  <div class="trpg-recrop" data-testid="recrop-page">
    <p v-if="!sourceUrl" class="trpg-field__error">原图已不在，请重新上传。</p>
    <div v-else class="trpg-recrop__layout">
      <div ref="stage" class="trpg-recrop__stage" tabindex="0" aria-label="拖动截取框；方向键移动，Shift 加速" @keydown="nudge">
        <img ref="image" :src="sourceUrl" alt="" @load="loaded" />
        <div class="trpg-recrop__shade" />
        <div class="trpg-recrop__box" :style="{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }" @pointerdown="down($event, 'move')">
          <span v-for="corner in ['nw', 'ne', 'sw', 'se']" :key="corner" class="trpg-recrop__handle" :class="`is-${corner}`" @pointerdown="down($event, corner as 'nw' | 'ne' | 'sw' | 'se')" />
        </div>
      </div>
      <div class="trpg-recrop__side">
        <span class="trpg-field__label">预览</span>
        <canvas ref="preview" class="trpg-recrop__preview" aria-label="头像预览" />
        <label class="trpg-recrop__zoom"><span>缩放</span><div class="trpg-recrop__zoom-row"><button class="trpg-icon-btn" type="button" aria-label="缩小截取框" @click="stepZoom(-5)"><Icon name="minus" :size="16" /></button><input v-model.number="zoom" type="range" min="0" max="100" aria-label="缩放截取框" /><button class="trpg-icon-btn" type="button" aria-label="放大截取框" @click="stepZoom(5)"><Icon name="plus" :size="16" /></button></div></label>
      </div>
    </div>
    <p class="trpg-field__hint">拖动截取框移动，拖四角缩放；方向键移动 2%，Shift + 方向键 10%。</p>
    <p v-if="error" class="trpg-field__error" role="alert">{{ error }}</p>
    <div class="trpg-recrop__actions"><button class="trpg-btn" type="button" @click="modal.pop()">取消</button><button class="trpg-btn trpg-btn--primary" type="button" :disabled="readOnly || !sourceUrl" @click="apply">使用这个截取</button></div>
  </div>
</template>

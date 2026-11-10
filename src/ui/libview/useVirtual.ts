// 长列表的虚拟滚动（固定行高）：只画窗口里的行，上下用占位撑出总高度。滚动容器是弹窗里的 .lib-mscroll。
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

export function useVirtual(el: Ref<HTMLElement | null>, total: Ref<number>, rowH: Ref<number>, overscan = 8) {
  const top = ref(0)
  const view = ref(600)
  let raf = 0
  const update = (): void => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => { top.value = el.value?.scrollTop ?? 0; view.value = el.value?.clientHeight || 600 })
  }
  let ro: ResizeObserver | undefined
  onMounted(() => { el.value?.addEventListener('scroll', update, { passive: true }); update(); ro = new ResizeObserver(update); if (el.value) ro.observe(el.value) })
  onBeforeUnmount(() => { el.value?.removeEventListener('scroll', update); ro?.disconnect(); cancelAnimationFrame(raf) })
  // 元素晚出现（v-if）时补挂监听
  watch(el, (now, old) => { old?.removeEventListener('scroll', update); now?.addEventListener('scroll', update, { passive: true }); update() })
  const range = computed(() => {
    const start = Math.max(0, Math.floor(top.value / rowH.value) - overscan)
    const end = Math.min(total.value, Math.ceil((top.value + view.value) / rowH.value) + overscan)
    return { start, end, padTop: start * rowH.value, padBottom: Math.max(0, (total.value - end) * rowH.value) }
  })
  function toTop(): void { if (el.value) el.value.scrollTop = 0; top.value = 0 }
  return { range, toTop }
}

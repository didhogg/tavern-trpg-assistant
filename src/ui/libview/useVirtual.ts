// 长列表的虚拟滚动（固定行高）：只画窗口里的行，上下用占位撑出总高度。滚动容器是弹窗里的 .lib-mscroll。
// 行高只有一个来源：CSS 变量 --lib-row-h（样式里行的高度也用它）。JS 里不再另写一个数，否则两边差几像素，往下滚会越错越多。
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

export function useVirtual(el: Ref<HTMLElement | null>, total: Ref<number>, overscan = 8) {
  const rowH = ref(44)
  const top = ref(0)
  const view = ref(600)
  let raf = 0
  const measure = (): void => {
    if (!el.value) return
    const h = parseFloat(getComputedStyle(el.value).getPropertyValue('--lib-row-h'))
    if (h > 0) rowH.value = h
  }
  const update = (): void => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => { top.value = el.value?.scrollTop ?? 0; view.value = el.value?.clientHeight || 600 })
  }
  let ro: ResizeObserver | undefined
  onMounted(() => { el.value?.addEventListener('scroll', update, { passive: true }); update(); measure(); ro = new ResizeObserver(() => { measure(); update() }); if (el.value) ro.observe(el.value) })
  onBeforeUnmount(() => { el.value?.removeEventListener('scroll', update); ro?.disconnect(); cancelAnimationFrame(raf) })
  // 元素晚出现（v-if）时补挂监听
  watch(el, (now, old) => { old?.removeEventListener('scroll', update); now?.addEventListener('scroll', update, { passive: true }); measure(); update() })
  const range = computed(() => {
    const start = Math.max(0, Math.floor(top.value / rowH.value) - overscan)
    const end = Math.min(total.value, Math.ceil((top.value + view.value) / rowH.value) + overscan)
    return { start, end, padTop: start * rowH.value, padBottom: Math.max(0, (total.value - end) * rowH.value) }
  })
  function toTop(): void { if (el.value) el.value.scrollTop = 0; top.value = 0 }
  return { range, toTop }
}

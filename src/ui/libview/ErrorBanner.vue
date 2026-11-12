<script setup lang="ts">
import { onBeforeUnmount, useAttrs, watch } from 'vue'
import { useBannerStore, type BannerAction } from '../../stores/banners'

/**
 * 错误横幅（P5-5 §12.3，错误一律用横幅）：一句人话 + 动作按钮；原始报错收进【详情】。
 * 这个组件不在插件里画东西：只把横幅登记到宿主层（酒馆顶部栏下方，和提示条同一处、同一样式），
 * 它在页面上存在多久，横幅就显示多久（页面关掉 / 错误消失时自动撤掉）。显示见 kit/ToastHost.vue。
 */
defineOptions({ inheritAttrs: false })
const props = defineProps<{ text: string; what?: string; actions?: BannerAction[]; dismissible?: boolean }>()
const emit = defineEmits<{ dismiss: [] }>()
const attrs = useAttrs()
const store = useBannerStore()
const id = store.add()
// 只盯横幅自己的内容（不能用 watchEffect：写进 store 时会读到 store，自己触发自己）
watch(() => {
  const testid = attrs['data-testid']
  return {
    id,
    text: props.text,
    what: props.what,
    actions: props.actions ?? [],
    ...(props.dismissible ? { dismiss: () => emit('dismiss') } : {}),
    ...(typeof testid === 'string' ? { testid } : {}),
  }
}, (b) => store.set(b), { immediate: true })
onBeforeUnmount(() => store.remove(id))
</script>

<template>
  <span hidden />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'
import ErrorDetailPage from './ErrorDetailPage.vue'
import { hasDetail, plainError } from './error-text'

/**
 * 错误横幅（P5-5 §12.3，错误一律用横幅）：一句人话 + 动作按钮；原始报错收进【详情】——在弹窗里就弹窗内换页，不叠弹窗。
 * text 可以是「做什么没有成功：原始报错」，横幅自动只显示前面的人话部分。
 */
const props = defineProps<{ text: string; what?: string; actions?: Array<{ label: string; run: () => void; testid?: string }>; dismissible?: boolean }>()
const emit = defineEmits<{ dismiss: [] }>()
const modal = useModalStore()
const short = computed(() => plainError(props.text))
let seq = 0
function detail(): void {
  modal.push({ key: `error-detail:${++seq}:${modal.depth}`, title: '出错详情', component: ErrorDetailPage, props: { text: props.text, what: props.what }, variant: 'sheet' })
}
</script>

<template>
  <div class="lib-banner lib-banner--warn lib-errbanner" role="alert" data-testid="error-banner">
    <Icon name="warning" :size="16" /><span :title="text">{{ short }}</span>
    <span class="lib-end">
      <button v-if="hasDetail(text)" class="trpg-btn trpg-btn--small" type="button" data-testid="error-detail-open" @click="detail">详情</button>
      <button v-for="a in actions ?? []" :key="a.label" class="trpg-btn trpg-btn--small" type="button" :data-testid="a.testid" @click="a.run()">{{ a.label }}</button>
      <button v-if="dismissible" class="trpg-icon-btn" type="button" aria-label="关闭这条提示" @click="emit('dismiss')"><Icon name="x" :size="14" /></button>
    </span>
  </div>
</template>

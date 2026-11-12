<script setup lang="ts">
import { ref } from 'vue'
import { copyText } from '../../host/clipboard'
import Icon from '../kit/Icon.vue'

/** 横幅【详情】换到的一页（P5-5 §12.3）：原始报错全文，可以复制给开发者；同一份也在 设置 → 库 → 日志。 */
const props = defineProps<{ text: string; what?: string }>()
const copied = ref<'idle' | 'ok' | 'fail'>('idle')
async function copy(): Promise<void> { copied.value = (await copyText(props.text)) ? 'ok' : 'fail' }
</script>

<template>
  <div class="lib-mbody" data-testid="error-detail">
    <div class="lib-dbody">
      <p class="lib-muted" style="margin: 0">{{ what ? `${what}时的原始报错` : '原始报错' }}。可以复制下来发给开发者；同一份也记在 设置 → 库 → 日志。</p>
      <pre class="lib-errdetail">{{ text }}</pre>
      <div><button class="trpg-btn trpg-btn--small" type="button" @click="copy"><Icon name="copy" :size="14" />{{ copied === 'ok' ? '已复制' : copied === 'fail' ? '没能复制，请手动选中' : '复制' }}</button></div>
    </div>
  </div>
</template>

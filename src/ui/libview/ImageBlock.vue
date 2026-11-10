<script setup lang="ts">
import { computed, ref } from 'vue'
import { officialSourceOf } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import Icon from '../kit/Icon.vue'
import InlineText from './InlineText.vue'

/**
 * 条目里的图片（作者 entry.json 的 image 块：href 是 internal 相对路径或 external 网址）。
 * R6：显示成下划线条目，点开才去取；地址来自后端 library.images.urls（登记的图片根，按序试，第一个通就用）。图片文件不入库，浏览器自己缓存。
 */
const props = defineProps<{ block: Record<string, unknown>; codeSet: string }>()
const app = useAppStore()
const state = ref<'closed' | 'loading' | 'shown' | 'failed'>('closed')
const shown = ref('')
const title = computed(() => (typeof props.block.title === 'string' ? props.block.title : ''))
const credit = computed(() => (typeof props.block.credit === 'string' ? props.block.credit : ''))
const urls = computed(() => app.svc().backend.library.images.urls(officialSourceOf(props.codeSet).id, props.block.href as never))

function probe(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}
async function open(): Promise<void> {
  if (state.value === 'loading') return
  state.value = 'loading'
  for (const u of urls.value) {
    if (await probe(u)) { shown.value = u; state.value = 'shown'; return }
  }
  state.value = 'failed'
}
</script>

<template>
  <figure class="lib-img" data-testid="entry-image">
    <button v-if="state !== 'shown'" class="lib-img__open" type="button" :disabled="state === 'loading'" @click="open">
      <Icon name="image" :size="14" /><span class="lib-img__label">{{ title || '图片' }}</span><small class="lib-faint">{{ state === 'loading' ? '正在取图…' : '点开看图' }}</small>
    </button>
    <p v-if="state === 'failed'" class="lib-muted lib-img__err">图片暂时取不到。<button class="trpg-btn trpg-btn--small" type="button" @click="open">重试</button></p>
    <template v-if="state === 'shown'">
      <img :src="shown" :alt="title || '条目图片'" class="lib-img__pic" />
      <figcaption v-if="title || credit" class="lib-faint"><InlineText v-if="title" :text="title" :code-set="codeSet" /><template v-if="credit"> · {{ credit }}</template></figcaption>
    </template>
  </figure>
</template>

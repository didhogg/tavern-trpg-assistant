<script setup lang="ts">
import { computed } from 'vue'
import { textBlockSchema, type TextBlock } from '../../schemas/text'
import { z } from 'zod'
import TextBlocks from './TextBlocks.vue'

const props = defineProps<{ summary: string; text: string; source: string; implemented: boolean }>()
/** 规则选项的说明在数据里是文字；构建时把正文块序列化成了 JSON，这里读回来按正文块显示。 */
const blocks = computed<TextBlock[] | null>(() => {
  const t = props.text.trim()
  if (!t.startsWith('[')) return null
  try {
    const parsed = z.array(textBlockSchema).safeParse(JSON.parse(t))
    return parsed.success ? parsed.data : null
  } catch (error) {
    console.warn('[trpg-assistant] 规则选项说明不是正文块', error)
    return null
  }
})
</script>

<template>
  <div class="page-stack">
    <TextBlocks v-if="blocks?.length" :blocks="blocks" />
    <p v-else-if="text && !blocks" class="trpg-info__line">{{ text }}</p>
    <p v-else class="trpg-info__line">{{ summary || '这个选项在数据里没有更多说明。' }}</p>
    <p class="trpg-field__hint">来源：{{ source }}<template v-if="!implemented"> · 仅说明：结算不会自动应用。</template></p>
  </div>
</template>

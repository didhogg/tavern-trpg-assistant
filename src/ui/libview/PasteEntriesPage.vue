<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useAppStore } from '../../stores/app'
import EntryBody from './EntryBody.vue'

/** 粘贴后先看作者渲染。确认时交回原本的正文数组控件。 */
const props = defineProps<{ codeSet: string; onAnswer: (blocks: unknown[] | null) => void }>()
const app = useAppStore()
const text = ref('')
const result = shallowRef<{ text: string; blocks: unknown[] } | null>(null)
const busy = ref(false)
const error = ref('')
const preview = computed(() => result.value?.text === text.value ? result.value.blocks : null)

async function run(): Promise<void> {
  if (busy.value || !text.value.trim()) return
  busy.value = true
  error.value = ''
  result.value = null
  const pasted = text.value
  try {
    const blocks = await app.svc().backend.library.custom.markdownBlocks(props.codeSet, pasted)
    if (!blocks.length) throw new Error('没有转出正文。请检查粘贴的文字。')
    result.value = { text: pasted, blocks }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="lib-mbody" data-testid="paste-entries">
    <div class="lib-mscroll">
      <div class="lib-pad lib-stack">
        <label class="lib-stack">
          <span>粘贴文字或 Markdown</span>
          <textarea v-model="text" class="trpg-input lib-para" :readonly="busy" rows="7" data-testid="paste-entries-text" />
        </label>
        <p v-if="error" class="trpg-field__err" role="alert">{{ error }}</p>
        <div v-if="preview" class="lib-stack" data-testid="paste-entries-preview">
          <b>转换预览</b>
          <EntryBody :block="preview" :code-set="codeSet" />
        </div>
      </div>
    </div>
    <div class="lib-ebar">
      <button class="trpg-btn" type="button" @click="onAnswer(null)">取消</button>
      <span class="lib-end">
        <button class="trpg-btn" type="button" :disabled="busy || !text.trim()" @click="run">{{ busy ? '正在转换…' : '转换预览' }}</button>
        <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!preview" @click="onAnswer(preview)">加入正文</button>
      </span>
    </div>
  </div>
</template>

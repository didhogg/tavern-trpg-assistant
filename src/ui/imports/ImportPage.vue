<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { TrpgError } from '../../core/errors'
import { readSaveFile, type RecognizedSaveFile } from '../../core/transfer/saveFile'
import { useModalStore } from '../../stores/modal'
import { errorText } from '../format'
import { openImport } from './openImport'
import SavePreview from './SavePreview.vue'

const props = defineProps<{ file: File }>()
const modal = useModalStore()
const rec = shallowRef<RecognizedSaveFile | null>(null)
const error = ref('')
const picker = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  try {
    rec.value = readSaveFile(new Uint8Array(await props.file.arrayBuffer()))
  } catch (e) {
    if (!(e instanceof TrpgError)) console.error('[trpg-assistant] 识别文件失败', e)
    error.value = errorText(e)
  }
})

function other(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) openImport(file)
}
</script>

<template>
  <div class="page-stack">
    <p class="trpg-row__meta" data-testid="import-filename">{{ props.file.name }}</p>
    <div v-if="error" class="page-stack" role="alert">
      <p class="trpg-field__error">⚠ {{ error }}</p>
      <div class="trpg-confirm__actions">
        <button class="trpg-btn" type="button" @click="picker?.click()">选择其他文件</button>
        <button class="trpg-btn trpg-btn--primary" type="button" @click="modal.close(true)">关闭</button>
        <input ref="picker" class="trpg-sr-only" type="file" accept=".trpgsave,.zip" tabindex="-1" aria-hidden="true" @change="other" />
      </div>
    </div>
    <p v-else-if="!rec" class="page-intro" role="status">正在识别…</p>
    <SavePreview v-else :rec="rec" />
  </div>
</template>

<script setup lang="ts">
// 贴图片链接：先只有一行网址；读到图了才进截取框（和上传同一个截取框），读不到就在下面写原因、填的不丢。
import { ref } from 'vue'
import { useModalStore } from '../../../stores/modal'
import { loadImage } from './portrait'
const modal = useModalStore()

const props = defineProps<{ src?: string; next: (src: string) => void }>()
const url = ref(props.src ?? '')
const error = ref('')
const busy = ref(false)
async function read(): Promise<void> {
  const v = url.value.trim()
  if (!/^https?:\/\/\S+$/i.test(v)) { error.value = '要以 http:// 或 https:// 开头的图片网址'; return }
  busy.value = true; error.value = ''
  try { await loadImage(v); props.next(v) } catch (e) { error.value = e instanceof Error ? e.message : String(e) } finally { busy.value = false }
}
</script>

<template>
  <form class="ps-drawer av-link" data-testid="avatar-link-page" @submit.prevent="read">
    <label class="ps-field"><span>图片链接</span>
      <input v-model="url" class="trpg-input" inputmode="url" placeholder="https://…" data-testid="avatar-url" @input="error = ''">
    </label>
    <p v-if="error" class="ps-drawer-note ps-drawer-note--warn" role="alert">{{ error }}</p>
    <p v-else-if="busy" class="ps-drawer-note">正在读取…</p>
    <div class="ps-drawer-actions">
      <button class="trpg-btn" type="button" @click="modal.close()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" data-testid="avatar-read" :disabled="busy || !url.trim()">读取</button>
    </div>
  </form>
</template>

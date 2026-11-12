<script setup lang="ts">
import { ref } from 'vue'
import Checkbox from '../kit/Checkbox.vue'

/** 下载页【下载全部…】的确认（驾驶员 2026-11-11 定）：勾选要下载的范围，确认后在后台下载，进度在【库】标志。 */
export interface DownloadAllAnswer { books: boolean; adventures: boolean }
const props = defineProps<{ bookCount: number; adventureCount: number; adventuresReady: boolean; onAnswer: (a: DownloadAllAnswer | null) => void }>()
const books = ref(props.bookCount > 0)
const adventures = ref(props.adventureCount > 0 && props.adventuresReady)
</script>

<template>
  <div class="trpg-confirm" data-testid="download-all">
    <p class="trpg-confirm__message">选要下载的范围。下载时可以照常看书，在【库】标志上查看进度或取消。</p>
    <div class="trpg-confirm__scroll">
      <Checkbox v-model="books" :disabled="!bookCount">全部官方书<span class="lib-src">（还有 {{ bookCount }} 本没装）</span></Checkbox>
      <Checkbox v-model="adventures" :disabled="!adventureCount || !adventuresReady">全部冒险<span class="lib-src">（还有 {{ adventureCount }} 本没装{{ adventuresReady ? '' : '；先下载至少一本官方书才能下冒险' }}）</span></Checkbox>
    </div>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" @click="props.onAnswer(null)">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!books && !adventures" data-autofocus @click="props.onAnswer({ books, adventures })">开始下载</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 人物头像（线框 p6-13d；驾驶员 D1：只填图片链接，不做上传）：贴网址，右边方框预览（居中裁成方的）；加载不出来写原因，输入保留。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'

const person = usePersonStore()
const modal = useModalStore()
const url = ref(String(person.sheet?.img ?? ''))
const failed = ref(false)
const ok = computed(() => /^https?:\/\/\S+$/i.test(url.value.trim()))
async function use(): Promise<void> {
  if (!ok.value || failed.value) return
  if (await person.edit('换了头像', [{ kind: 'set', path: 'img', value: url.value.trim() }])) modal.close()
}
</script>

<template>
  <form class="ps-drawer ps-avatar-form" data-testid="ps-drawer-avatar" @submit.prevent="use">
    <div class="ps-avatar-fields">
      <label class="ps-field"><span>图片链接</span><input v-model="url" class="trpg-input" inputmode="url" placeholder="https://…" :disabled="person.readOnly" @input="failed = false"></label>
      <p v-if="url && !ok" class="ps-drawer-note">要以 http:// 或 https:// 开头的网址。</p>
      <p v-else-if="failed" class="ps-drawer-note ps-drawer-note--warn">这张图加载不出来：网址打不开，或者不是图片。</p>
    </div>
    <div class="ps-avatar-preview"><img v-if="ok && !failed" :src="url.trim()" alt="头像预览" @error="failed = true"></div>
    <div class="ps-drawer-actions">
      <button class="trpg-btn" type="button" @click="modal.close()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="person.readOnly || !ok || failed">使用这张</button>
    </div>
  </form>
</template>

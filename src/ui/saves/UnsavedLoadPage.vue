<script setup lang="ts">
const props = defineProps<{ current: string; target: string; onChoose: (v: 'save' | 'discard' | 'cancel') => void }>()
</script>

<template>
  <div class="trpg-confirm">
    <p class="trpg-confirm__message">「{{ props.current }}」有未保存到存档的改动。读取「{{ props.target }}」前：</p>
    <div class="trpg-confirm__actions trpg-confirm__actions--stack">
      <button class="trpg-btn" type="button" @click="props.onChoose('cancel')">取消</button>
      <button class="trpg-btn" type="button" @click="props.onChoose('discard')">不保存存档，直接读取</button>
      <button class="trpg-btn trpg-btn--primary" type="button" data-autofocus @click="props.onChoose('save')">保存存档后读取</button>
    </div>
    <p class="trpg-field__hint">无论选哪一项，当前状态都会先写入自动存档。</p>
  </div>
</template>

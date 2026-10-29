<script setup lang="ts">
const props = defineProps<{ name: string; canReplace: boolean; usedBy: number; onChoose: (v: 'keep-both' | 'replace' | 'cancel') => void }>()
</script>

<template>
  <div class="trpg-confirm">
    <p class="trpg-confirm__message">已安装一个名为「{{ props.name }}」的扩展包，但它和要导入的不是同一个扩展包。</p>
    <p class="trpg-field__hint">保留两个：导入的扩展包显示为「{{ props.name }}（2）」。</p>
    <p v-if="props.usedBy > 0" class="trpg-field__hint">替换：有 {{ props.usedBy }} 个存档用到了已安装的那个。</p>
    <p v-if="!props.canReplace" class="trpg-field__hint">内置扩展包不能被替换。</p>
    <div class="trpg-confirm__actions trpg-confirm__actions--stack">
      <button class="trpg-btn" type="button" data-autofocus @click="props.onChoose('cancel')">取消</button>
      <button class="trpg-btn" type="button" @click="props.onChoose('keep-both')">保留两个</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!props.canReplace" @click="props.onChoose('replace')">替换已安装的</button>
    </div>
  </div>
</template>

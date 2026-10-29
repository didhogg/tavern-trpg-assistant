<script setup lang="ts">
import { inject, nextTick, ref } from 'vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { SAVE_NAME_MAX } from '../../schemas/campaign'

const props = defineProps<{ defaultName: string; disabled?: boolean }>()
const emit = defineEmits<{ create: [name: string] }>()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const open = ref(false)
const name = ref('')
const input = ref<HTMLInputElement | null>(null)

async function onOpen(value: boolean): Promise<void> {
  open.value = value
  if (!value) return
  name.value = props.defaultName
  await nextTick()
  input.value?.focus()
  input.value?.select()
}

function submit(): void {
  const clean = name.value.trim()
  if (!clean) return
  open.value = false
  emit('create', clean)
}
</script>

<template>
  <PopoverRoot :open="open" @update:open="onOpen">
    <PopoverTrigger class="trpg-btn" :disabled="disabled">分支存档</PopoverTrigger>
    <PopoverPortal :to="portalTarget">
      <PopoverContent class="trpg-popover" align="start" :side-offset="6" :collision-padding="8" @open-auto-focus.prevent>
        <form class="trpg-field" @submit.prevent="submit">
          <label class="trpg-field__label" for="trpg-branch-name">新存档名</label>
          <input id="trpg-branch-name" ref="input" v-model="name" class="trpg-input" :maxlength="SAVE_NAME_MAX" autocomplete="off" @keydown.esc.stop.prevent="open = false" />
          <span class="trpg-field__hint">原存档保持上次保存的样子；当前未保存的改动会进入新分支。</span>
          <div class="trpg-confirm__actions">
            <button class="trpg-btn" type="button" @click="open = false">取消</button>
            <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="!name.trim()">创建并切换</button>
          </div>
        </form>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

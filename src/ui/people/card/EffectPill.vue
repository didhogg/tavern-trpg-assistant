<script setup lang="ts">
import { inject, ref } from 'vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import type { PersonEffect } from '../../../schemas/people'
import { useLibraryStore } from '../../../stores/library'
import Icon from '../../kit/Icon.vue'
import { openEntry } from '../../library/openDetail'

const props = defineProps<{ effect: PersonEffect; summary?: string; readOnly: boolean }>()
const emit = defineEmits<{ remove: [] }>()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const library = useLibraryStore()
const open = ref(false)
async function look(): Promise<void> {
  if (!props.effect.ref) return
  const packId = await library.packOfEntry(props.effect.ref)
  if (packId) { open.value = false; openEntry(packId, props.effect.ref, props.effect.name) }
}
</script>

<template>
  <span class="trpg-effect-pill">
    <PopoverRoot v-model:open="open">
      <PopoverTrigger class="trpg-effect-pill__name" :aria-label="`查看效果 ${effect.name}`">{{ effect.name }}</PopoverTrigger>
      <PopoverPortal :to="portalTarget">
        <PopoverContent class="trpg-effect-pop" side="top" :side-offset="6" :collision-padding="8">
          <div class="trpg-effect-pop__head"><strong>{{ effect.name }}</strong><button class="trpg-icon-btn" type="button" aria-label="关闭效果说明" @click="open = false"><Icon name="x" :size="16" /></button></div>
          <p v-if="effect.duration" class="trpg-effect-pop__meta">时长 {{ effect.duration }}</p>
          <p class="trpg-effect-pop__text">{{ effect.note || summary || '没有更多说明。' }}</p>
          <button v-if="effect.ref" class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="look">看资料</button>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
    <button class="trpg-effect-pill__x" type="button" :disabled="readOnly" :aria-label="`移除效果 ${effect.name}`" @click="emit('remove')"><Icon name="x" :size="12" /></button>
  </span>
</template>

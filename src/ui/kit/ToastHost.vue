<script setup lang="ts">
import { useToastStore } from '../../stores/toast'

const store = useToastStore()
</script>

<template>
  <TransitionGroup name="trpg-toast" tag="div" class="trpg-toasts" role="status" aria-live="polite">
    <div
      v-for="t in store.toasts"
      :key="t.id"
      class="trpg-toast"
      :data-kind="t.kind"
      @pointerenter="store.pause(t.id)"
      @pointerleave="store.resume(t.id)"
      @focusin="store.pause(t.id)"
      @focusout="store.resume(t.id)"
    >
      <span class="trpg-toast__text">{{ t.message }}</span>
      <button v-if="t.undo" type="button" @click="store.runUndo(t.id)">撤销</button>
    </div>
  </TransitionGroup>
</template>

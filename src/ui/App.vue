<script setup lang="ts">
import { provide } from 'vue'
import type { StContext } from '../host/types'
import { useUiStore } from '../stores/ui'
import ToastHost from './kit/ToastHost.vue'
import DiceTray from './shell/DiceTray.vue'
import FloatingBall from './shell/FloatingBall.vue'
import MainWindow from './shell/MainWindow.vue'

const props = defineProps<{ ctx: StContext; portalTarget: HTMLElement }>()
provide('portalTarget', props.portalTarget)
provide('stCtx', props.ctx)
const ui = useUiStore()
</script>

<template>
  <div class="trpg-root">
    <FloatingBall />
    <MainWindow v-if="ui.windowOpen" />
    <DiceTray />
    <ToastHost />
  </div>
</template>

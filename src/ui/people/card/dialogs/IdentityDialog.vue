<script setup lang="ts">
import { computed, ref } from 'vue'
import { useModalStore } from '../../../../stores/modal'
import BrowserTabs, { type BrowserTab } from '../../../kit/BrowserTabs.vue'
import type { CardCtx } from '../cardCtx'
import CoreTab from './CoreTab.vue'
import DialogFrame from './DialogFrame.vue'
import EntryFlow from './EntryFlow.vue'
import LevelsTab from './LevelsTab.vue'

const props = defineProps<{ ctx: CardCtx; tab?: string; avatarUrl?: () => string | undefined; onUpload: (file: File) => void; onRecrop: () => void; onClear: () => void }>()
const modal = useModalStore()
const isTemplate = computed(() => props.ctx.person.block.cr !== undefined)
const tabs = computed<BrowserTab[]>(() => (isTemplate.value ? [{ key: 'core', label: '核心身份' }] : [{ key: 'core', label: '核心身份' }, { key: 'race', label: '种族' }, { key: 'class', label: '职业' }, { key: 'background', label: '背景' }, { key: 'levels', label: '等级管理' }]))
const tab = ref(tabs.value.some((t) => t.key === props.tab) ? props.tab! : 'core')
</script>

<template>
  <div class="trpg-dlg trpg-dlg--outer">
    <BrowserTabs v-if="tabs.length > 1" v-model="tab" :tabs="tabs" label="身份分类" />
    <DialogFrame v-if="tab === 'core'" note="改动进入草稿，点右上「保存」后生效">
      <CoreTab :ctx="ctx" :avatar-url="avatarUrl?.()" :on-upload="onUpload" :on-recrop="onRecrop" :on-clear="onClear" />
      <template #actions><button class="trpg-btn trpg-btn--primary" type="button" @click="modal.requestClose()">完成</button></template>
    </DialogFrame>
    <EntryFlow v-else-if="tab === 'race' || tab === 'class' || tab === 'background'" :key="tab" :ctx="ctx" :kind="tab" />
    <LevelsTab v-else :ctx="ctx" :go-class="() => (tab = 'class')" />
  </div>
</template>

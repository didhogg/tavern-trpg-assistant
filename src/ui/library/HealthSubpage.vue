<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { FixKind, Issue } from '../../core/library/integrity'
import { putAsset } from '../../core/library/assets'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import { useToastStore } from '../../stores/toast'
import { useUiStore } from '../../stores/ui'
import { errorText } from '../format'
import Icon from '../kit/Icon.vue'
import Term from '../kit/Term.vue'
import { openEntry } from './openDetail'
import { repairFlow } from './saveActions'

defineEmits<{ back: [] }>()
const app = useAppStore()
const library = useLibraryStore()
const toast = useToastStore()
const ui = useUiStore()
const checking = ref(false)
const picker = ref<HTMLInputElement | null>(null)
let imageFor: Issue | null = null

async function recheck(): Promise<void> {
  checking.value = true
  try {
    await library.runIntegrity()
  } finally {
    checking.value = false
  }
}
onMounted(recheck)

const LABEL: Record<FixKind, string> = { install: '去安装', 'text-only': '改为纯文字', pin: '固定', 'pick-image': '重新选择', 'remove-image': '移除图片', trash: '移入回收站', 'new-id': '换新编号', 'use-original': '改用原版' }

function run(issue: Issue, fix: FixKind): void {
  if (fix === 'install') ui.openLibrary('ext', issue.packId)
  else if (fix === 'pick-image') {
    imageFor = issue
    picker.value?.click()
  } else void repairFlow(issue, fix)
}

async function onImage(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !imageFor) return
  try {
    const ref = await putAsset(app.svc().db, new Uint8Array(await file.arrayBuffer()), app.svc().now())
    await repairFlow(imageFor, 'pick-image', ref.$asset)
  } catch (error) {
    console.error('[trpg-assistant] 选择图片失败', error)
    toast.error(`选择图片失败：${errorText(error)}`)
  }
}
</script>

<template>
  <div class="page-stack" data-testid="health-page">
    <button class="subpage-back" type="button" @click="$emit('back')"><Icon name="caret-left" :size="16" />本存档</button>
    <div class="trpg-step-head">
      <h2 class="trpg-step-title">{{ library.issues.length ? `体检：发现 ${library.issues.length} 处问题` : '体检：没有问题' }}</h2>
      <button class="trpg-btn trpg-btn--small" type="button" :disabled="checking" @click="recheck">重新检查</button>
    </div>
    <ul class="trpg-list">
      <li v-for="i in library.issues" :key="i.id" class="trpg-row" data-testid="health-issue">
        <div class="trpg-row__main">
          <span class="trpg-row__title">⚠ <Term v-if="i.packId && i.entryId && i.kind !== 'pack-missing'" @open="openEntry(i.packId, i.entryId, i.subject)">{{ i.subject }}</Term><template v-else>{{ i.subject }}</template></span>
          <div class="trpg-row__meta">{{ i.detail }}</div>
        </div>
        <div class="trpg-row__end trpg-row__end--wrap"><button v-for="f in i.fixes" :key="f" class="trpg-btn trpg-btn--small" type="button" @click="run(i, f)">{{ LABEL[f] }}</button></div>
      </li>
    </ul>
    <p v-if="!library.issues.length" class="trpg-empty">存档里的引用、图片与内容都正常。</p>
    <input ref="picker" class="trpg-sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" tabindex="-1" aria-hidden="true" @change="onImage" />
  </div>
</template>

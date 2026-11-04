<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLibraryStore } from '../../../../stores/library'
import { useModalStore } from '../../../../stores/modal'
import EntryDetailPage from '../../../library/EntryDetailPage.vue'
import DialogFrame from './DialogFrame.vue'

/** 点职业框 / 种族 / 背景药丸看到的资料页（居中弹窗里，底栏带「更换 / 等级管理」）。 */
const props = defineProps<{ entryId: string; actions?: Array<{ label: string; run: () => void }> }>()
const library = useLibraryStore()
const modal = useModalStore()
const packId = ref<string>()
const missing = ref(false)
onMounted(async () => { packId.value = await library.packOfEntry(props.entryId); missing.value = !packId.value })
function run(fn: () => void): void { modal.close(true); fn() }
</script>

<template>
  <DialogFrame>
    <EntryDetailPage v-if="packId" :pack-id="packId" :entry-id="entryId" compact />
    <p v-else-if="missing" class="trpg-card-empty">这条资料所在的书没有安装，装上后才能看。</p>
    <template #actions>
      <button v-for="a in actions ?? []" :key="a.label" class="trpg-btn" type="button" :data-testid="`peek-${a.label}`" @click="run(a.run)">{{ a.label }}</button>
      <button class="trpg-btn trpg-btn--primary" type="button" @click="modal.requestClose()">关闭</button>
    </template>
  </DialogFrame>
</template>

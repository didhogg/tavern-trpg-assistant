<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLibraryStore } from '../../../../stores/library'
import { useModalStore } from '../../../../stores/modal'
import EntryDetailPage from '../../../library/EntryDetailPage.vue'
import { openEntry } from '../../../library/openDetail'
import type { InfoModel } from '../info'
import DialogFrame from './DialogFrame.vue'

const props = defineProps<{ model: InfoModel; onRemove?: () => void }>()
const modal = useModalStore()
const library = useLibraryStore()
const packId = ref<string>()
onMounted(async () => { if (props.model.ref) packId.value = await library.packOfEntry(props.model.ref) })
function remove(): void { props.onRemove?.(); modal.close(true) }
</script>

<template>
  <DialogFrame :note="model.removable ? '移除后可在管理弹窗的「可恢复」里找回自动来的项。' : ''">
    <dl class="trpg-info__rows">
      <div v-for="row in model.rows" :key="row.label" class="trpg-info__row"><dt>{{ row.label }}</dt><dd>{{ row.value }}<button v-if="row.ref" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" @click="library.packOfEntry(row.ref).then((p) => p && openEntry(p, row.ref!, row.value))">看资料</button></dd></div>
    </dl>
    <EntryDetailPage v-if="model.ref && packId" :pack-id="packId" :entry-id="model.ref" compact />
    <div v-else class="trpg-info__body"><p v-for="(line, i) in model.body" :key="i">{{ line }}</p></div>
    <template #actions>
      <button v-if="model.removable && onRemove" class="trpg-btn" type="button" data-testid="info-remove" @click="remove">移除</button>
      <button class="trpg-btn trpg-btn--primary" type="button" data-testid="info-close" @click="modal.requestClose()">关闭</button>
    </template>
  </DialogFrame>
</template>

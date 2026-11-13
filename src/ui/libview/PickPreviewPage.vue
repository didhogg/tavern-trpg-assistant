<script setup lang="ts">
import type { ScopedRow } from '../../library/scoped'
import { useModalStore } from '../../stores/modal'
import { openEditor, type EditSession } from './edit-flow'
import type { Ent } from './edit-json'
import EmbeddedEntity from './EmbeddedEntity.vue'

/** P5.5 u7-8b 从已有的挑：先看这一条的样子（作者渲染），[复制它开始改] 进编辑器（原件不动，存进的是这个包）。 */
defineProps<{ session: Omit<EditSession, 'ent'>; row: ScopedRow; name: string }>()
const modal = useModalStore()
/** 复制一份当起点：去掉作者运行时字段（以 _ 开头的、uniqueId）；来源保存时按包写。 */
function copyOf(item: unknown): Ent {
  const out: Ent = {}
  for (const [k, v] of Object.entries(structuredClone(item as Ent))) if (!k.startsWith('_') && k !== 'uniqueId') out[k] = v
  return out
}
</script>

<template>
  <div class="lib-mbody" data-testid="pick-preview">
    <div class="lib-mscroll"><div class="lib-pad"><EmbeddedEntity :prop="row.ref.prop" :item="row.item" :code-set="session.codeSet" /></div></div>
    <div class="lib-ebar"><span class="lib-src">{{ row.source ?? '' }}</span><span class="lib-end"><button class="trpg-btn" type="button" @click="modal.pop()">换一条</button><button class="trpg-btn trpg-btn--primary" type="button" data-testid="pick-go" @click="openEditor({ ...session, ent: copyOf(row.item), detailed: true })">复制它开始改</button></span></div>
  </div>
</template>

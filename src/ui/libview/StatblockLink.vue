<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import Term from '../kit/Term.vue'
import { openEntry } from './open'

/**
 * 内嵌的怪物 / 条目块（{type:"statblock", prop, source, name}）：显示成术语名，点了跳到那一条的详情。
 * 指向哪一条（类别、来源、编号、显示名）全由作者函数算（frame statblockMeta，P5-1 B-40）；库里找不到就只显示名字。
 */
const props = defineProps<{ block: Record<string, unknown>; codeSet: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const label = ref(String(props.block.displayName ?? props.block.name ?? ''))
const target = ref<EntryRef | null>(null)

onMounted(async () => {
  try {
    const m = await (await app.svc().backend.library.service.frameOf(props.codeSet)).call('statblockMeta', props.block)
    if (m.displayName) label.value = m.displayName
    const c = lib.campaignLib
    if (c && m.hash) {
      const at = await app.svc().backend.library.scoped.locate(c, m.target, m.hash)
      target.value = at ? at.ref : null
    }
  } catch (e) { console.warn('[trpg-assistant] 解析内嵌块指向失败', e) }
})
</script>

<template>
  <p class="lib-statblock"><Term v-if="target" @open="openEntry(target!, label)">{{ label }}</Term><template v-else>{{ label }}</template></p>
</template>

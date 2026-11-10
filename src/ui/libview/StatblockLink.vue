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

/** 同一个内嵌块（类别 + 来源 + 名字）只问一次：一章里有几百个，每个问两次作者函数 + 一次定位会很慢。 */
const memo = new Map<string, Promise<{ label: string | null; ref: EntryRef | null }>>()

onMounted(async () => {
  const c = lib.campaignLib
  // 块是响应式代理，传给小窗要先变成普通对象（postMessage 克隆不了代理）
  const block = JSON.parse(JSON.stringify(props.block)) as Record<string, unknown>
  const key = `${props.codeSet}|${c?.codeSet ?? ''}|${JSON.stringify(block)}`
  let p = memo.get(key)
  if (!p) {
    p = (async () => {
      const m = await (await app.svc().backend.library.service.frameOf(props.codeSet)).call('statblockMeta', block)
      const at = c && m.hash ? await app.svc().backend.library.scoped.locate(c, m.target, m.hash) : null
      return { label: m.displayName, ref: at ? at.ref : null }
    })()
    memo.set(key, p)
  }
  try {
    const r = await p
    if (r.label) label.value = r.label
    target.value = r.ref
  } catch (e) {
    memo.delete(key)
    console.warn('[trpg-assistant] 解析内嵌块指向失败', e)
  }
})
</script>

<template>
  <p class="lib-statblock"><Term v-if="target" @open="openEntry(target!, label)">{{ label }}</Term><template v-else>{{ label }}</template></p>
</template>

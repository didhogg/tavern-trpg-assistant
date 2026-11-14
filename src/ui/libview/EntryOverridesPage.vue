<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import VersionManage from './VersionManage.vue'

/** 单条【版本管理】：这一条的全部版本，每个版本作用于哪一层（本战役 → 规则 → 全局，上面的盖住下面的），房规可删除。 */
const props = defineProps<{ entryRef: EntryRef; name: string }>()
const app = useAppStore()
const lib = useLibViewStore()
// 中英两条一起列（房规两种语言一起改的，作用范围也一起看、一起挪）
const refs = ref<EntryRef[] | null>(null)
onMounted(async () => {
  let en: EntryRef | null = null
  try { en = lib.campaignLib ? (await app.svc().backend.library.bilingual.englishInCampaign(lib.campaignLib, props.entryRef))?.ref ?? null : null } catch (e) { console.warn('[trpg-assistant] 没找到英文对照，只列这一条', e) }
  refs.value = en ? [props.entryRef, en] : [props.entryRef]
})
</script>

<template>
  <div class="lib-mbody" data-testid="entry-overrides">
    <div class="lib-mscroll">
<div class="lib-pad lib-stack">
      <p class="lib-faint" style="margin: 0; font-size: 12px">「{{ name }}」（中文、英文两条）的全部版本，以及每个版本作用在哪一层。上面的盖住下面的：本战役 → 规则 → 全局。</p>
      <VersionManage v-if="refs" :refs="refs" />
      <div v-else class="lib-skel" aria-busy="true"><i /></div>
    </div>
</div>
  </div>
</template>

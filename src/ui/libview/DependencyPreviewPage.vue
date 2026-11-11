<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DownloadDependencyPreview } from '../../library/pack-health'
import Checkbox from '../kit/Checkbox.vue'

/**
 * 下载自制包前的依赖预览（P5 T6）：依赖按作者程序处理——作者会把依赖包一起装上；需要的官方书可勾选一起下载。
 * 只排版后端给的结果，不自己判断依赖。
 */
export interface DependencyAnswer { ok: boolean; dontAsk: boolean; books: Array<{ set: string; id: string; name: string }> }
const props = defineProps<{ name: string; previews: DownloadDependencyPreview[]; onAnswer: (a: DependencyAnswer) => void }>()

const uniq = <T,>(xs: T[], key: (x: T) => string): T[] => [...new Map(xs.map((x) => [key(x), x])).values()]
const toFetch = computed(() => uniq(props.previews.flatMap((p) => p.brew.filter((b) => !b.installed)), (b) => b.source))
const have = computed(() => uniq(props.previews.flatMap((p) => p.brew.filter((b) => b.installed)), (b) => b.source))
const officialMissing = computed(() => uniq(props.previews.flatMap((p) => p.official.filter((o) => !o.installed)), (o) => o.source))
const officialHave = computed(() => uniq(props.previews.flatMap((p) => p.official.filter((o) => o.installed)), (o) => o.source))
const unknown = computed(() => [...new Set(props.previews.flatMap((p) => p.unknown))])
const pick = ref<Record<string, boolean>>(Object.fromEntries(officialMissing.value.filter((o) => o.book).map((o) => [o.source, true])))
const dontAsk = ref(false)
const fileName = (f: string): string => f.replace(/\.json$/, '')

function answer(ok: boolean): void {
  props.onAnswer({ ok, dontAsk: dontAsk.value, books: officialMissing.value.filter((o) => o.book && pick.value[o.source]).map((o) => o.book!) })
}
</script>

<template>
  <div class="trpg-confirm" data-testid="dependency-preview">
    <p class="trpg-confirm__message">下载《{{ name }}》时，它依赖的包会按作者程序一起装上，缺了它们这个包读不出来。</p>
    <div class="trpg-confirm__scroll" tabindex="0">
      <section v-if="toFetch.length" class="trpg-confirm__section" data-tone="must">
        <h4 class="trpg-confirm__h">会一起下载的依赖包<small>{{ toFetch.length }}</small></h4>
        <ul class="trpg-confirm__details"><li v-for="b in toFetch" :key="b.source">{{ fileName(b.file) }}</li></ul>
        <p class="lib-muted lib-small">它们自己的依赖也会一起装上。</p>
      </section>
      <section v-if="officialMissing.length" class="trpg-confirm__section" data-tone="must">
        <h4 class="trpg-confirm__h">还需要这些官方书<small>{{ officialMissing.length }}</small></h4>
        <template v-for="o in officialMissing" :key="o.source">
          <Checkbox v-if="o.book" v-model="pick[o.source]">一起下载《{{ o.book.name }}》</Checkbox>
          <p v-else class="lib-muted">{{ o.source }}（书目里找不到，请到【下载】页的官方资料里找）</p>
        </template>
      </section>
      <section v-if="unknown.length" class="trpg-confirm__section" data-tone="info">
        <h4 class="trpg-confirm__h">找不到的依赖<small>{{ unknown.length }}</small></h4>
        <ul class="trpg-confirm__details"><li v-for="u in unknown" :key="u">{{ u }}</li></ul>
        <p class="lib-muted lib-small">自制仓库和官方书目里都没有，这个包可能读不全。</p>
      </section>
      <section v-if="have.length || officialHave.length" class="trpg-confirm__section" data-tone="keep">
        <h4 class="trpg-confirm__h">已经装好的依赖<small>{{ have.length + officialHave.length }}</small></h4>
        <ul class="trpg-confirm__details">
          <li v-for="b in have" :key="b.source">{{ fileName(b.file) }}</li>
          <li v-for="o in officialHave" :key="o.source">{{ o.book?.name ?? o.source }}</li>
        </ul>
      </section>
    </div>
    <Checkbox v-model="dontAsk" data-testid="dependency-dont-ask">以后下载不再提示（依赖仍会自动一起装）</Checkbox>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" @click="answer(false)">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" data-autofocus @click="answer(true)">下载</button>
    </div>
  </div>
</template>

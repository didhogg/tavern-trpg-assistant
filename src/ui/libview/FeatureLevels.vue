<script setup lang="ts">
import type { Feature } from './class-data'
import EntryBody from './EntryBody.vue'

/** 按等级折叠的特性列表；openUpto 以内的等级默认展开。 */
defineProps<{ levels: Array<{ level: number; features: Feature[] }>; codeSet: string; openUpto?: number }>()
</script>

<template>
  <div class="lib-block" style="padding: 0; border: 0; background: none">
    <details v-for="g in levels" :key="g.level" class="lib-fold" :open="g.level <= (openUpto ?? 0)" data-testid="feature-level">
      <summary>{{ g.level }} 级<span class="lib-end lib-muted">{{ g.features.map((f) => f.name).join('，') }}</span></summary>
      <div class="lib-fold__body">
        <div v-for="f in g.features" :key="f.name"><b>{{ f.name }}</b><EntryBody :block="f.entries" :code-set="codeSet" /></div>
      </div>
    </details>
    <p v-if="!levels.length" class="lib-muted">没有按等级的特性。</p>
  </div>
</template>

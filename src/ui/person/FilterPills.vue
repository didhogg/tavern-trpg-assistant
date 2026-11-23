<script setup lang="ts">
// 和资料库同一种标签筛选（驾驶员 11-23）：「全部」+ 每类一个标签带数量，单选。
defineProps<{ options: Array<{ id: string; label: string; n: number }>; total: number; label: string }>()
const model = defineModel<string>({ default: 'all' })
</script>

<template>
  <div class="lib-pills ps-pills" role="group" :aria-label="label">
    <button class="trpg-pill" type="button" :aria-pressed="model === 'all'" data-testid="ps-pill-all" @click="model = 'all'">全部<small>{{ total }}</small></button>
    <button v-for="o in options" :key="o.id" class="trpg-pill" type="button" :aria-pressed="model === o.id" :data-testid="`ps-pill-${o.id}`" @click="model = o.id">{{ o.label }}<small>{{ o.n }}</small></button>
  </div>
</template>

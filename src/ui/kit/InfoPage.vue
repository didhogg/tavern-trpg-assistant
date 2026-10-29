<script setup lang="ts">
defineProps<{ lines: string[] }>()
</script>

<template>
  <div class="page-stack">
    <p v-for="line in lines" :key="line" class="trpg-info__line">{{ line }}</p>
  </div>
</template>

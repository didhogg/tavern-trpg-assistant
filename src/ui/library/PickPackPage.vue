<script setup lang="ts">
defineProps<{ packs: Array<{ id: string; name: string }>; onAnswer: (id: string | null) => void }>()
</script>

<template>
  <div class="trpg-confirm">
    <p class="trpg-confirm__message">移到哪个包？</p>
    <ul class="trpg-list">
      <li v-for="p in packs" :key="p.id" class="trpg-row"><button class="trpg-btn trpg-btn--quiet" type="button" @click="onAnswer(p.id)">{{ p.name }}</button></li>
    </ul>
    <div class="trpg-confirm__actions"><button class="trpg-btn" type="button" data-autofocus @click="onAnswer(null)">取消</button></div>
  </div>
</template>

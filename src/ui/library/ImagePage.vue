<script setup lang="ts">
import type { MonsterArt } from '../../rules/dnd5e2014/data/entries/art'
defineProps<{ label: string; art: MonsterArt }>()
</script>

<template>
  <div class="page-stack" data-testid="image-page">
    <div v-if="art.portrait" class="trpg-imagepage__main"><img :src="String(art.portrait.url)" :alt="label" /></div>
    <div v-if="art.token" class="trpg-imagepage__token"><img :src="String(art.token.url)" alt="token" /></div>
    <p class="trpg-field__hint">图片来自 5etools-cn 网站（5e.kiwee.top）</p>
  </div>
</template>

<style scoped>
.trpg-imagepage__main img { width: 100%; height: auto; border-radius: 10px; }
.trpg-imagepage__token { display: flex; justify-content: center; padding: 12px; }
.trpg-imagepage__token img { max-width: 180px; border-radius: 50%; }
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useLibraryStore } from '../../stores/library'
import PackActions from './PackActions.vue'
import { findRow } from './rows'

const props = defineProps<{ packId: string }>()
const library = useLibraryStore()
const row = computed(() => findRow(props.packId, library.installed, library.catalog))
</script>

<template>
  <PackActions v-if="row" :row="row" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLibraryStore } from '../../stores/library'
import Term from '../kit/Term.vue'
import { openPackDetail } from '../library/openDetail'
import { buildPackRows } from '../library/rows'
import { wizard } from './state'

const library = useLibraryStore()
const adventures = computed(() => buildPackRows(library.installed, library.catalog, wizard.ruleId).filter((r) => r.category === 'adventure'))
function pick(id: string): void {
  wizard.adventureId = id
  wizard.touched = true
}
</script>

<template>
  <div class="page-stack">
    <h3 class="trpg-step-title">要不要带一个冒险模组</h3>
    <div class="trpg-list" role="radiogroup" aria-label="冒险">
      <label class="trpg-row trpg-radio"><input type="radio" name="adv" :checked="wizard.adventureId === ''" @change="pick('')" /> <span class="trpg-row__title">不带冒险，自由开始</span></label>
      <label v-for="a in adventures" :key="a.id" class="trpg-row trpg-radio">
        <input type="radio" name="adv" :checked="wizard.adventureId === a.id" @change="pick(a.id)" />
        <span class="trpg-row__main"><Term @open="openPackDetail(a.id)">{{ a.name }}</Term><span class="trpg-row__meta">{{ a.description }}</span></span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import type { CatalogRow } from '../../library/scoped'
import { refreshEstimate } from './data'
import { wizard, wizardOptions } from './state'

const app = useAppStore()
const opts = computed(() => wizardOptions.value)
const NO_BOOKS = '当前拉取不到书目，请之后再去库里添加'
const groups = computed(() => (opts.value?.shelf ?? []).filter((g) => g.adventures.length))
const unavailable = computed(() => !!opts.value && (opts.value.catalogUnavailable || !groups.value.length))
const picked = (r: CatalogRow): boolean => wizard.adventures.some((a) => a.set === r.set && a.id === r.id)
const level = (r: CatalogRow): string => (r.shelf?.level ? `等级 ${r.shelf.level.start}–${r.shelf.level.end}` : '')
const meta = (r: CatalogRow): string => [level(r), r.shelf?.storyline ?? ''].filter(Boolean).join(' · ')

function toggle(r: CatalogRow, on: boolean): void {
  if (r.id === null) return
  const rest = wizard.adventures.filter((a) => !(a.set === r.set && a.id === r.id))
  wizard.adventures = on ? [...rest, { set: r.set, id: r.id, name: r.name }] : rest
  void refreshEstimate(app.svc())
}
</script>

<template>
  <h3 class="trpg-wizard__title">带上一本冒险？（可选）</h3>
  <p class="trpg-hint" :data-testid="unavailable ? 'wizard-adv-none' : 'wizard-adv-hint'">{{ unavailable ? NO_BOOKS : '选中的冒险会在战役创建完成后，和资料一起在后台下载。' }}</p>
  <div v-if="wizard.loading && !opts" class="trpg-field trpg-field--grow"><div class="trpg-loading" role="status" data-testid="wizard-loading"><template v-if="wizard.showLoading"><span class="trpg-spinner" aria-hidden="true" />正在读取中…</template></div></div>
  <div v-else-if="!unavailable" class="trpg-shelf" data-testid="wizard-adventures">
    <details v-for="(g, i) in groups" :key="g.group" class="trpg-shelf__group" :open="i === 0">
      <summary class="trpg-shelf__sum"><Icon class="trpg-shelf__chev-open" name="caret-down" :size="14" /><Icon class="trpg-shelf__chev-closed" name="caret-right" :size="14" />{{ g.name }}<small>{{ g.adventures.length }}</small></summary>
      <div v-for="r in g.adventures" :key="`${r.set}/${r.id}`" class="trpg-shelf__row">
        <Checkbox :model-value="r.downloaded || picked(r)" :dl="r.downloaded" :disabled="r.downloaded" :label="r.name" @update:model-value="toggle(r, $event)"><span class="trpg-term">{{ r.name }}</span></Checkbox>
        <small>{{ meta(r) }}</small>
      </div>
    </details>
  </div>
</template>

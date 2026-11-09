<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import { isPicked, loadWizardOptions, setScopes, toggleBook } from './data'
import { sizeOf, wizard, wizardOptions } from './state'

const app = useAppStore()
const opts = computed(() => wizardOptions.value)
const scopes = computed(() => wizard.scopes ?? opts.value?.defaultScopes ?? [])
const size = computed(() => sizeOf('data'))
const NO_BOOKS = '当前拉取不到书目，请之后再去库里添加'
const noBooks = computed(() => !!opts.value && (opts.value.catalogUnavailable || !opts.value.shelf.some((g) => g.books.length)))

const hintText = computed(() => {
  if (size.value.kind === 'ready') return '官方资料已经在【库】里装好，不需要再下载。'
  const lead = size.value.kind === 'size' ? `总下载${size.value.text.replace('需下载', '').trim()}，` : `${size.value.text}  `
  return `${lead}将在你的战役创建完成后，在后台【库】里下载。为了自动化结算，会在下载的同时解析数据，可能需要一定时间。`
})

function toggleScope(id: string, on: boolean): void {
  const next = on ? [...scopes.value, id] : scopes.value.filter((x) => x !== id)
  if (next.length) setScopes(app.svc(), next)
}
</script>

<template>
  <h3 class="trpg-wizard__title">选择资料</h3>
  <div v-if="opts?.blockingError" class="trpg-empty" data-testid="wizard-blocked" style="border: 2px solid var(--danger-line); margin-bottom: 12px">
    <b style="color: var(--danger-text)"><Icon name="warning" :size="16" /> {{ opts.blockingError }}</b>
    <button class="trpg-btn trpg-btn--small" type="button" @click="loadWizardOptions(app.svc())">重试</button>
  </div>
  <p class="trpg-hint" data-testid="wizard-size-hint">{{ hintText }}</p>
  <div v-if="opts" class="trpg-field" style="margin-bottom: 12px">
    <span class="trpg-field__label">范围</span>
    <div style="display: flex; gap: 18px; flex-wrap: wrap">
      <Checkbox v-for="s in opts.scopes" :key="s.id" :model-value="scopes.includes(s.id)" :disabled="scopes.length === 1 && scopes.includes(s.id)" @update:model-value="toggleScope(s.id, $event)">{{ s.name }}</Checkbox>
    </div>
  </div>
  <div class="trpg-field trpg-field--grow">
    <span class="trpg-field__label">书架</span>
    <div v-if="wizard.loading && !opts" class="trpg-loading" role="status" data-testid="wizard-loading"><template v-if="wizard.showLoading"><span class="trpg-spinner" aria-hidden="true" />正在读取中…</template></div>
    <p v-else-if="noBooks" class="trpg-hint" data-testid="wizard-nobooks">{{ NO_BOOKS }}</p>
    <template v-else-if="opts">
      <span class="trpg-field__hint">勾选的是这场战役里看得到哪些书；官方资料是整套下载的。灰色勾 = 已经在【库】里下载好，不能取消。</span>
      <div class="trpg-shelf" data-testid="wizard-shelf">
        <details v-for="(g, i) in opts.shelf.filter((x) => x.books.length)" :key="g.group" class="trpg-shelf__group" :open="g.group === 'core' || (i === 0 && !opts.shelf.some((x) => x.group === 'core'))">
          <summary class="trpg-shelf__sum"><Icon class="trpg-shelf__chev-open" name="caret-down" :size="14" /><Icon class="trpg-shelf__chev-closed" name="caret-right" :size="14" />{{ g.name }}<small>{{ g.books.length }}</small></summary>
          <div v-for="b in g.books" :key="b.source" class="trpg-shelf__row">
            <Checkbox :model-value="isPicked(g, b)" :dl="b.downloaded" :disabled="b.downloaded" :label="b.name" @update:model-value="toggleBook(b.source, $event)"><span class="trpg-term">{{ b.name }}</span></Checkbox>
            <small>{{ b.shelf?.published ?? '' }}</small>
          </div>
        </details>
      </div>
    </template>
  </div>
</template>

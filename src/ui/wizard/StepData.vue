<script setup lang="ts">
import { computed } from 'vue'
import type { CatalogRow } from '../../library/scoped'
import { useAppStore } from '../../stores/app'
import Checkbox from '../kit/Checkbox.vue'
import GroupCheck from '../kit/GroupCheck.vue'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import { ruleBadge } from '../libview/registry'
import { ADVENTURE_NEEDS_BOOK, canPick, isPicked, loadWizardOptions, rowKey, rowsOf, toggleGroup, togglePick } from './data'
import { pickedOf, totalSize, wizard, wizardOptions } from './state'

/**
 * ③ 选择资料（P5-5 §13）：官方书和冒险放在一个列表里，按作者分组；标签 全部 / 5e / 5.5e / 未归类（默认筛到②选的版本）。
 * 没下载的默认不勾；已下载的是灰勾、不能取消。分组标题右侧的框：[ ] 全选这一组、[−] 取消这一组。
 * 勾选的在战役建好后由【库】在后台按书 / 按本下载，向导里不显示进度。
 */
const app = useAppStore()
const opts = computed(() => wizardOptions.value)
const NO_BOOKS = '当前拉取不到书目，请之后再去库里添加'
const noBooks = computed(() => !!opts.value && (opts.value.catalogUnavailable || !opts.value.shelf.some((g) => g.books.length || g.adventures.length)))
const FILTERS = [{ value: 'all', label: '全部' }, { value: '5e', label: '5e' }, { value: '5.5e', label: '5.5e' }, { value: 'none', label: '未归类' }]
const groups = computed(() => (opts.value?.shelf ?? []).map((g) => ({ g, rows: rowsOf(g) })).filter((x) => x.rows.length))
const size = computed(() => totalSize())
const count = computed(() => pickedOf('book').length + pickedOf('adventure').length)

function meta(r: CatalogRow): string {
  if (r.kind === 'adventure') return ['冒险', r.shelf?.level ? `等级 ${r.shelf.level.start}–${r.shelf.level.end}` : ''].filter(Boolean).join(' · ')
  return ['书', ruleBadge(r) ?? '', r.shelf?.published?.slice(0, 4) ?? ''].filter(Boolean).join(' · ')
}
const tip = (r: CatalogRow): string | undefined => (r.downloaded ? '已下载，这场战役里默认可用' : r.kind === 'adventure' && !canPick(r) ? ADVENTURE_NEEDS_BOOK : undefined)
const groupPicked = (rows: CatalogRow[]): number => rows.filter((r) => !r.downloaded && isPicked(r)).length
const groupTotal = (rows: CatalogRow[]): number => rows.filter((r) => !r.downloaded).length
</script>

<template>
  <h3 class="trpg-wizard__title">选择资料</h3>
  <div v-if="opts?.blockingError" class="trpg-empty" data-testid="wizard-blocked" style="border: 2px solid var(--danger-line); margin-bottom: 12px">
    <b style="color: var(--danger-text)"><Icon name="warning" :size="16" /> {{ opts.blockingError }}</b>
    <button class="trpg-btn trpg-btn--small" type="button" @click="loadWizardOptions(app.svc())">重试</button>
  </div>
  <p class="trpg-hint" data-testid="wizard-size-hint">勾选的书和冒险会在战役创建完成后，在后台【库】里下载。为了自动化结算，会在下载的同时解析数据，可能需要一定时间。</p>
  <div class="trpg-field trpg-field--grow">
    <div v-if="wizard.loading && !opts" class="trpg-loading" role="status" data-testid="wizard-loading"><template v-if="wizard.showLoading"><span class="trpg-spinner" aria-hidden="true" />正在读取中…</template></div>
    <p v-else-if="noBooks" class="trpg-hint" data-testid="wizard-nobooks">{{ NO_BOOKS }}</p>
    <template v-else-if="opts">
      <div class="trpg-wizard__filters">
        <Segmented v-model="wizard.filter" :options="FILTERS" label="规则" data-testid="wizard-filter" />
        <input v-model="wizard.q" class="trpg-input" type="search" placeholder="搜索书名 / 冒险名" aria-label="搜索书名 / 冒险名" />
      </div>
      <p v-if="!groups.length" class="trpg-hint" data-testid="wizard-filter-empty">{{ wizard.q ? '没有符合的。' : '这个标签下没有书。' }}</p>
      <div v-else class="trpg-shelf" data-testid="wizard-shelf">
        <details v-for="(x, i) in groups" :key="x.g.group" class="trpg-shelf__group" :open="!!wizard.q || x.g.group === 'core' || (i === 0 && !groups.some((y) => y.g.group === 'core'))">
          <summary class="trpg-shelf__sum">
            <Icon class="trpg-shelf__chev-open" name="caret-down" :size="14" /><Icon class="trpg-shelf__chev-closed" name="caret-right" :size="14" />{{ x.g.name }}<small>{{ x.rows.length }}</small>
            <GroupCheck :selected="groupPicked(x.rows)" :total="groupTotal(x.rows)" :label="x.g.name" @change="(all: boolean) => toggleGroup(app.svc(), x.rows, all)" />
          </summary>
          <div v-for="r in x.rows" :key="rowKey(r)" class="trpg-shelf__row" :title="tip(r)" :data-kind="r.kind" data-testid="wizard-row">
            <Checkbox :model-value="isPicked(r)" :dl="r.downloaded" :disabled="!canPick(r)" :label="r.name" @update:model-value="togglePick(app.svc(), r, $event)"><span class="trpg-term">{{ r.name }}</span></Checkbox>
            <small>{{ meta(r) }}</small>
          </div>
        </details>
      </div>
    </template>
  </div>
  <p class="trpg-wizard__picked" data-testid="wizard-picked">已选 {{ count }} 项 · {{ size.text }}</p>
</template>

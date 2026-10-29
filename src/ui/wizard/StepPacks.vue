<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CatalogPack } from '../../schemas/pack'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import { formatBytes } from '../format'
import Checkbox from '../kit/Checkbox.vue'
import Term from '../kit/Term.vue'
import { openPackDetail } from '../library/openDetail'
import { buildPackRows, contributesLabel, type PackRow } from '../library/rows'
import { wizard } from './state'

const app = useAppStore()
const library = useLibraryStore()
const ready = ref(false)
const rule = computed(() => app.svc().rules.get(wizard.ruleId))
const rows = computed(() => buildPackRows(library.installed, library.catalog, wizard.ruleId).filter((r) => r.category !== 'adventure'))
const core = computed(() => new Set(rule.value?.corePackIds ?? []))

const groups = computed(() => {
  const map = new Map<string, PackRow[]>()
  const label = (r: PackRow) => (r.source === 'builtin' ? '内置' : r.source === 'user' ? '我的' : (r.group ?? '其他'))
  for (const r of rows.value) map.set(label(r), [...(map.get(label(r)) ?? []), r])
  // 内置在最前，我的在最后，其余按数据仓库目录里的先后次序
  const catalogOrder = (g: string) => library.catalog?.packs.findIndex((p) => p.group === g) ?? -1
  const order = (g: string) => (g === '内置' ? -2 : g === '我的' ? 9999 : g === '其他' ? 9998 : catalogOrder(g))
  return [...map].sort((a, b) => order(a[0]) - order(b[0]))
})

function lockedBy(id: string): string | undefined {
  if (core.value.has(id)) return '必需'
  const needs = rows.value.find((r) => wizard.packIds.includes(r.id) && r.requires.includes(id))
  return needs ? `《${needs.name}》需要它` : undefined
}

function withRequires(id: string, out: Set<string> = new Set()): Set<string> {
  if (out.has(id)) return out
  out.add(id)
  for (const dep of rows.value.find((r) => r.id === id)?.requires ?? []) withRequires(dep, out)
  return out
}

function catalogPack(id: string): CatalogPack | undefined {
  return library.catalog?.packs.find((p) => p.id === id)
}

function toggle(row: PackRow, on: boolean): void {
  wizard.touched = true
  if (on) {
    const add = withRequires(row.id)
    wizard.packIds = [...new Set([...wizard.packIds, ...add])]
    for (const id of add) {
      const pack = catalogPack(id)
      if (pack && !library.installedMap.has(id) && !library.tasks[id]) void library.install(pack)
    }
  } else wizard.packIds = wizard.packIds.filter((id) => id !== row.id)
}

function selectAll(): void {
  wizard.touched = true
  for (const row of rows.value) if (!wizard.packIds.includes(row.id)) toggle(row, true)
}
function onlyRequired(): void {
  wizard.touched = true
  wizard.packIds = [...core.value]
}

function retry(id: string): void {
  const pack = catalogPack(id)
  if (pack) void library.install(pack)
}

function defaults(): string[] {
  const picked = rows.value.filter((r) => r.source === 'builtin' || r.source === 'user' || r.recommended || core.value.has(r.id)).map((r) => r.id)
  return [...new Set([...core.value, ...picked.flatMap((id) => [...withRequires(id)])])]
}

onMounted(async () => {
  if (!library.catalog) await library.loadCatalog()
  await library.refreshInstalled()
  if (!wizard.packsInit) {
    wizard.packIds = defaults()
    wizard.packsInit = true
  }
  ready.value = true
  await library.ensureRecommended(wizard.ruleId)
})

const progress = computed(() => {
  const active = Object.values(library.tasks)
  const total = active.length
  if (!total) return ''
  const running = active.filter((t) => t.state !== 'failed')
  const failed = active.filter((t) => t.state === 'failed').length
  return running.length ? `正在准备 ${total - running.length - failed + 1}/${total}` : `${failed} 本未能下载 · 可以先开始，之后在库里补装`
})
</script>

<template>
  <div class="page-stack">
    <div class="trpg-step-head">
      <h3 class="trpg-step-title">这场战役用哪些资料</h3>
      <span class="trpg-step-actions">
        <button class="trpg-btn trpg-btn--small" type="button" @click="selectAll">全选</button>
        <button class="trpg-btn trpg-btn--small" type="button" @click="onlyRequired">只留必需</button>
      </span>
    </div>
    <p v-if="library.catalogState === 'error'" class="trpg-field__hint" role="status">
      没能连上数据仓库：{{ library.catalogError }}。可以先开始，之后在库里补装。
      <button class="trpg-btn trpg-btn--small" type="button" @click="library.loadCatalog(true)">重试</button>
    </p>
    <p v-if="progress" class="trpg-field__hint" role="status" data-testid="wizard-progress">{{ progress }}</p>
    <div v-if="!ready" class="page-stack" aria-busy="true"><div class="trpg-skeleton" /><div class="trpg-skeleton" style="width: 70%" /><div class="trpg-skeleton" style="width: 55%" /></div>
    <section v-for="[group, list] in ready ? groups : []" :key="group" :aria-label="group">
      <h4 class="trpg-group">{{ group }}</h4>
      <ul class="trpg-list">
        <li v-for="r in list" :key="r.id" class="trpg-row" :data-testid="`wizard-pack-${r.id}`">
          <Checkbox :model-value="wizard.packIds.includes(r.id)" :disabled="!!lockedBy(r.id) && wizard.packIds.includes(r.id)" :label="r.name" @update:model-value="toggle(r, $event)" />
          <div class="trpg-row__main">
            <Term @open="openPackDetail(r.id)">{{ r.name }}</Term>
            <div class="trpg-row__meta">{{ contributesLabel(r) }}<template v-if="!r.installed && !library.tasks[r.id]"> · 未安装 · {{ formatBytes(r.byteSize) }}</template></div>
          </div>
          <div class="trpg-row__end">
            <span v-if="lockedBy(r.id) && wizard.packIds.includes(r.id)" class="trpg-badge">{{ lockedBy(r.id) }}</span>
            <template v-if="library.tasks[r.id]">
              <span v-if="library.tasks[r.id].state === 'failed'" class="trpg-badge" data-tone="danger" :title="library.tasks[r.id].error">⚠ 下载失败</span>
              <button v-if="library.tasks[r.id].state === 'failed'" class="trpg-btn trpg-btn--small" type="button" @click="retry(r.id)">重试</button>
              <span v-else class="trpg-progress" role="progressbar" :aria-valuenow="Math.round((library.tasks[r.id].received / Math.max(1, library.tasks[r.id].total)) * 100)" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${Math.round((library.tasks[r.id].received / Math.max(1, library.tasks[r.id].total)) * 100)}%` }" /></span>
            </template>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

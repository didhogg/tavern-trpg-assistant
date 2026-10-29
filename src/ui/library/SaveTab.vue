<script setup lang="ts">
import { computed, markRaw, onMounted } from 'vue'
import { ruleOptionRows } from '../../core/library/features'
import { libraryOf } from '../../core/library/types'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { useUiStore } from '../../stores/ui'
import Switch from '../kit/Switch.vue'
import Term from '../kit/Term.vue'
import { disableFlow, enableFlow } from './actions'
import OptionDetailPage from './OptionDetailPage.vue'
import { openPackDetail } from './openDetail'
import { ruleOptionFlow, updateFeaturesFlow } from './saveActions'
import { buildPackRows } from './rows'

defineEmits<{ sub: [name: 'variants' | 'health'] }>()
const app = useAppStore()
const campaign = useCampaignStore()
const library = useLibraryStore()
const modal = useModalStore()
const ui = useUiStore()

onMounted(() => void library.runIntegrity())

const ws = computed(() => campaign.workspace!)
const rule = computed(() => app.svc().rules.get(ws.value.ruleId))
const enabledIds = computed(() => new Set(ws.value.enabledPacks.map((p) => p.id)))
const RANK = { builtin: 0, download: 1, catalog: 1, import: 2, user: 3 } as const

interface Row { id: string; name: string; missing: boolean; rank: number }
const rows = computed<Row[]>(() => {
  const real = buildPackRows(library.installed, library.catalog, ws.value.ruleId).filter((r) => r.installed && r.category !== 'adventure')
  const list: Row[] = real.map((r) => ({ id: r.id, name: r.name, missing: false, rank: RANK[r.source] }))
  for (const e of ws.value.enabledPacks) if (!library.installedMap.has(e.id)) list.push({ id: e.id, name: e.id, missing: true, rank: 9 })
  return list.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'zh'))
})

function lockReason(id: string): string | undefined {
  if (rule.value?.corePackIds.includes(id)) return '内置 · 其他资料都需要它'
  const needs = ws.value.enabledPacks.find((e) => library.installedMap.get(e.id)?.relationships.requires.some((d) => d.id === id))
  if (needs && enabledIds.value.has(id)) return `《${library.installedMap.get(needs.id)?.name}》需要它`
  if (!enabledIds.value.has(id)) {
    const pack = library.installedMap.get(id)
    for (const e of ws.value.enabledPacks) {
      const other = library.installedMap.get(e.id)
      const hit = pack?.relationships.conflicts.find((c) => c.id === e.id) ?? other?.relationships.conflicts.find((c) => c.id === id)
      if (hit) return `与『${other?.name}』冲突${hit.reason ? `：${hit.reason}` : ''}`
    }
  }
  return undefined
}

const options = computed(() => ruleOptionRows(ws.value.data))
const nameOfPack = (id: string) => library.installedMap.get(id)?.name ?? id
const slots = computed(() => Object.values(libraryOf(ws.value.data).variants).filter((s) => s.candidates.length))
const conflicts = computed(() => slots.value.filter((s) => s.candidates.length >= 2).length)
const issueText = computed(() => {
  const list = library.issues
  return `发现 ${list.length} 处问题：${list.slice(0, 2).map((i) => `「${i.subject}」${i.kind === 'asset-missing' ? '图片缺失' : i.kind === 'pack-missing' ? '缺失' : '需要处理'}`).join(' · ')}`
})

function toggle(r: Row, on: boolean): void {
  void (on ? enableFlow(r.id) : disableFlow(r.id))
}

function optionDetail(o: (typeof options.value)[number]): void {
  const page = { key: `option:${o.key}`, title: o.name, component: markRaw(OptionDetailPage), props: { summary: o.summary, text: o.text, source: nameOfPack(o.packId), implemented: o.implemented } }
  if (modal.isOpen) modal.push(page)
  else modal.open({ ...page, variant: 'dialog' })
}
</script>

<template>
  <div class="page-stack" data-testid="save-tab">
    <div v-if="library.issues.length" class="trpg-issuerow" role="status">
      <span>⚠ {{ issueText }}</span>
      <button class="trpg-btn trpg-btn--small" type="button" data-testid="go-health" @click="$emit('sub', 'health')">去处理 ›</button>
    </div>
    <section aria-label="资料">
      <h3 class="trpg-group">资料</h3>
      <ul class="trpg-list">
        <li v-for="r in rows" :key="r.id" class="trpg-row" :data-testid="`save-pack-${r.id}`">
          <div class="trpg-row__main">
            <Term v-if="!r.missing" @open="openPackDetail(r.id)">{{ r.name }}</Term>
            <span v-else class="trpg-row__title">{{ r.name }}</span>
            <div v-if="r.missing" class="trpg-row__meta">未安装 · 已用到的条目照常可用</div>
            <div v-else-if="library.featureUpdateCounts.get(r.id)" class="trpg-row__meta">有新版功能定义 {{ library.featureUpdateCounts.get(r.id) }} 个</div>
            <div v-else-if="lockReason(r.id)" class="trpg-row__meta">{{ lockReason(r.id) }}</div>
          </div>
          <div class="trpg-row__end">
            <button v-if="r.missing" class="trpg-btn trpg-btn--small" type="button" @click="ui.openLibrary('ext', r.id)">去安装</button>
            <template v-else>
              <button v-if="library.featureUpdateCounts.get(r.id)" class="trpg-btn trpg-btn--small" type="button" :disabled="campaign.readOnly" @click="updateFeaturesFlow(r.id, r.name)">更新</button>
              <Switch :model-value="enabledIds.has(r.id)" :label="`启用 ${r.name}`" :disabled="campaign.readOnly || (!!lockReason(r.id) && (enabledIds.has(r.id) || lockReason(r.id)!.startsWith('与')))" :locked-reason="enabledIds.has(r.id) ? lockReason(r.id) : undefined" @update:model-value="toggle(r, $event)" />
            </template>
          </div>
        </li>
      </ul>
    </section>
    <section v-if="options.length" aria-label="规则选项">
      <h3 class="trpg-group">规则选项</h3>
      <ul class="trpg-list">
        <li v-for="o in options" :key="o.key" class="trpg-row" :data-testid="`option-${o.name}`">
          <div class="trpg-row__main"><Term @open="optionDetail(o)">{{ o.name }}</Term><div class="trpg-row__meta">{{ nameOfPack(o.packId) }}<template v-if="!o.implemented"> · 仅说明</template></div></div>
          <div class="trpg-row__end"><Switch :model-value="o.on" :label="o.name" :disabled="campaign.readOnly" @update:model-value="ruleOptionFlow(o.key, o.name, $event)" /></div>
        </li>
      </ul>
    </section>
    <section v-if="slots.length" class="trpg-row trpg-variantrow" aria-label="修改版">
      <div class="trpg-row__main"><span class="trpg-row__title">修改版</span><div class="trpg-row__meta">本存档有 {{ slots.length }} 个条目用了修改版<template v-if="conflicts"> · 冲突 {{ conflicts }}</template></div></div>
      <button class="trpg-btn trpg-btn--small" type="button" data-testid="go-variants" @click="$emit('sub', 'variants')">管理 ›</button>
    </section>
  </div>
</template>

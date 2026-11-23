<script setup lang="ts">
import { computed, markRaw, ref } from 'vue'
import type { ScopedRow } from '../../library/scoped'
import { peopleProp } from '../../rules/kernel/card-types'
import { useCampaignStore } from '../../stores/campaign'
import { CATEGORIES, useRosterStore, type CategoryId } from '../../stores/roster'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import Stepper from '../kit/Stepper.vue'
import ErrorBanner from '../libview/ErrorBanner.vue'
import EntryPage from '../libview/EntryPage.vue'
import { openEntry } from '../libview/open'
import { pickKey, usePickList } from '../libview/usePickList'
import { useUiStore } from '../../stores/ui'

/** 从模板加入：左边库里的怪物 / NPC 列表（和库同一份数据），右边是库里同一张资料卡，底栏 放进哪类 · 数量 · [加入列表]。 */
const campaign = useCampaignStore()
const roster = useRosterStore()
const ui = useUiStore()

const count = ref(1)
const dest = ref<CategoryId>(CATEGORIES.some((c) => c.id === roster.view) ? (roster.view as CategoryId) : 'enemy')
const scrollEl = ref<HTMLElement | null>(null)
const adding = ref(false)
const wide = computed(() => ui.layout === 'wide')
const { rows, error, q, picked, load, shown, current, range, visible, ref_, lib } = usePickList((library) => {
  const prop = peopleProp(library.rule)
  if (!prop) throw new Error('这个规则没有可当模板的条目')
  return prop
}, scrollEl, '模板')
const keyOf = (r: ScopedRow): string => pickKey(r)

async function add(): Promise<void> {
  const cur = current.value
  if (!cur || adding.value) return
  adding.value = true
  try { await roster.addFromTemplate(cur.row.ref, cur.name, count.value, dest.value) } finally { adding.value = false }
}
const CardPane = markRaw(EntryPage)
</script>

<template>
  <div class="tp" data-testid="template-page">
    <div class="tp-list">
      <div class="lib-filter"><input v-model="q" class="trpg-input" type="search" placeholder="搜名字（如 地精）" aria-label="搜模板" data-autofocus data-testid="tp-search" /></div>
      <ErrorBanner v-if="error" :text="`没读出来：${error}`" what="读取模板" :actions="[{ label: '重试', run: load }]" />
      <div v-else-if="!rows" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
      <div v-else ref="scrollEl" class="lib-mscroll">
        <div v-if="!shown.length" class="lib-state"><h3>{{ q.trim() ? `没找到「${q.trim()}」` : '库里还没有可当模板的条目' }}</h3></div>
        <div v-else class="lib-list" role="list" :style="{ paddingTop: `${range.padTop}px`, paddingBottom: `${range.padBottom}px` }">
          <button v-for="r in visible" :key="keyOf(r.row)" class="lib-list__row tp-row" type="button" role="listitem" :data-picked="keyOf(r.row) === picked || undefined" data-testid="tp-row" @click="picked = keyOf(r.row)">
            <span class="lib-name">{{ r.name }}</span><span class="lib-src lib-end">{{ r.row.source ?? '' }}</span>
          </button>
        </div>
      </div>
      <div class="lib-count">{{ rows ? `共 ${shown.length} 条` : '正在读取…' }}</div>
    </div>
    <div v-if="wide" class="tp-card" data-testid="tp-card"><component :is="CardPane" v-if="ref_ && lib.campaignLib" :key="picked ?? ''" :entry-ref="ref_" :page-key="`tpl:${picked}`" /></div>
    <div class="tp-bar">
      <span v-if="roster.lastAdded" class="tp-added" data-testid="tp-added">本次已加入：{{ roster.lastAdded.label }} ×{{ roster.lastAdded.count }}<button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="roster.undoAdded()">撤销</button></span>
      <span v-else-if="current" class="tp-added">{{ current.name }}</span>
      <span class="tp-gap" />
      <button v-if="!wide" class="trpg-btn trpg-btn--small" type="button" :disabled="!ref_" @click="ref_ && openEntry(ref_, current?.name)">看资料卡</button>
      <span class="tp-lbl">放进</span>
      <Segmented v-model="dest" label="放进哪一类" :options="CATEGORIES.map((c) => ({ value: c.id, label: c.label }))" />
      <Stepper :value="count" minus-label="少一个" plus-label="多一个" :minus-disabled="count <= 1" :plus-disabled="count >= 20" @minus="count--" @plus="count++" />
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!ref_ || adding || campaign.readOnly" data-testid="tp-add" @click="add"><Icon name="plus" :size="14" />{{ adding ? '正在加入…' : '加入列表' }}</button>
    </div>
  </div>
</template>

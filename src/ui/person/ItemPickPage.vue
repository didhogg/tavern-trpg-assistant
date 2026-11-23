<script setup lang="ts">
// 人物加物品（线框 u4-pick；驾驶员 11-23 批）：和「从模板加入」同一个两栏页——左边库里的物品（本战役能看到的，和库同一份），
// 右边库里同一张资料卡；底栏 [加进背包]（加一件；要几件在背包里用数量 [＋]，同一种物品不会拆成几行）。加入走结算内核的加条目（官方拖放顺序），一条可撤销的改动。
import { computed, markRaw, ref } from 'vue'
import { itemsProp } from '../../rules/kernel/card-types'
import { useModalStore } from '../../stores/modal'
import { usePersonStore } from '../../stores/person'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import ErrorBanner from '../libview/ErrorBanner.vue'
import EntryPage from '../libview/EntryPage.vue'
import { openEntry } from '../libview/open'
import { pickKey, usePickList } from '../libview/usePickList'

const person = usePersonStore()
const modal = useModalStore()
const ui = useUiStore()
const scrollEl = ref<HTMLElement | null>(null)
const adding = ref(false)
const wide = computed(() => ui.layout === 'wide')
const { rows, error, q, picked, load, shown, current, range, visible, ref_, lib } = usePickList((library) => {
  const prop = itemsProp(library.rule)
  if (!prop) throw new Error('这个规则没有物品类条目')
  return prop
}, scrollEl, '物品')

async function add(): Promise<void> {
  const cur = current.value
  if (!cur || adding.value) return
  adding.value = true
  try {
    if (await person.add(`加了${cur.name}`, [cur.row.ref])) modal.close()
  } finally { adding.value = false }
}
const CardPane = markRaw(EntryPage)
</script>

<template>
  <div class="tp" data-testid="item-pick">
    <div class="tp-list">
      <div class="lib-filter"><input v-model="q" class="trpg-input" type="search" placeholder="搜物品（如 治疗药水）" aria-label="搜物品" data-autofocus data-testid="ip-search" /></div>
      <ErrorBanner v-if="error" :text="`没读出来：${error}`" what="读取物品" :actions="[{ label: '重试', run: load }]" />
      <div v-else-if="!rows" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
      <div v-else ref="scrollEl" class="lib-mscroll">
        <div v-if="!shown.length" class="lib-state"><h3>{{ q.trim() ? `没找到「${q.trim()}」` : '库里还没有物品' }}</h3></div>
        <div v-else class="lib-list" role="list" :style="{ paddingTop: `${range.padTop}px`, paddingBottom: `${range.padBottom}px` }">
          <button v-for="r in visible" :key="pickKey(r.row)" class="lib-list__row tp-row" type="button" role="listitem" :data-picked="pickKey(r.row) === picked || undefined" data-testid="ip-row" @click="picked = pickKey(r.row)">
            <span class="lib-name">{{ r.name }}</span><span class="lib-src lib-end">{{ r.row.source ?? '' }}</span>
          </button>
        </div>
      </div>
      <div class="lib-count">{{ rows ? `共 ${shown.length} 条` : '正在读取…' }}</div>
    </div>
    <div v-if="wide" class="tp-card"><component :is="CardPane" v-if="ref_ && lib.campaignLib" :key="picked ?? ''" :entry-ref="ref_" :page-key="`item:${picked}`" body-only /></div>
    <div class="tp-bar">
      <span v-if="current" class="tp-added">{{ current.name }}</span>
      <span class="tp-gap" />
      <button v-if="!wide" class="trpg-btn trpg-btn--small" type="button" :disabled="!ref_" @click="ref_ && openEntry(ref_, current?.name)">看资料卡</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!ref_ || adding || person.readOnly" data-testid="ip-add" @click="add"><Icon name="plus" :size="14" />{{ adding ? '正在加入…' : '加进背包' }}</button>
    </div>
  </div>
</template>

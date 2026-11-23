<script setup lang="ts">
// 人物加物品（线框 u4-pick；驾驶员 11-23 批）：和「从模板加入」同一个两栏页——左边库里的物品（本战役能看到的，和库同一份），
// 右边库里同一张资料卡；底栏 [加进背包]（加一件；要几件在背包里用数量 [＋]，同一种物品不会拆成几行）。加入走结算内核的加条目（官方拖放顺序），一条可撤销的改动。
import { computed, markRaw, ref } from 'vue'
import { addProp, type AddKind } from '../../rules/kernel/card-types'
import { useModalStore } from '../../stores/modal'
import { usePersonStore } from '../../stores/person'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import ErrorBanner from '../libview/ErrorBanner.vue'
import EntryPage from '../libview/EntryPage.vue'
import { openEntry } from '../libview/open'
import { pickKey, usePickList } from '../libview/usePickList'

const props = withDefaults(defineProps<{ kind?: AddKind; replace?: { id: string; name: string } }>(), { kind: 'items', replace: undefined })
const WORDS: Record<AddKind, { what: string; verb: string; eg: string }> = {
  items: { what: '物品', verb: '加进背包', eg: '治疗药水' }, spells: { what: '法术', verb: '加进法术书', eg: '火焰箭' }, feats: { what: '专长', verb: '加给这个人', eg: '警觉' },
  races: { what: '种族', verb: '用这个种族', eg: '精灵' }, backgrounds: { what: '背景', verb: '用这个背景', eg: '侍僧' }, classes: { what: '职业', verb: '加这个职业', eg: '战士' },
}
const words = computed(() => WORDS[props.kind])
const person = usePersonStore()
const modal = useModalStore()
const ui = useUiStore()
const scrollEl = ref<HTMLElement | null>(null)
const adding = ref(false)
const wide = computed(() => ui.layout === 'wide')
const { rows, error, q, picked, load, shown, current, range, visible, ref_, lib } = usePickList((library) => {
  const prop = addProp(library.rule, props.kind)
  if (!prop) throw new Error(`这个规则没有${WORDS[props.kind].what}类条目`)
  return prop
}, scrollEl, WORDS[props.kind].what)

async function add(): Promise<void> {
  const cur = current.value
  if (!cur || adding.value) return
  adding.value = true
  try {
    const ok = props.replace ? await person.replace(`把${props.replace.name}换成${cur.name}`, props.replace.id, cur.row.ref) : await person.add(`加了${cur.name}`, [cur.row.ref])
    if (ok) modal.close()
  } finally { adding.value = false }
}
const CardPane = markRaw(EntryPage)
</script>

<template>
  <div class="tp" data-testid="item-pick">
    <div class="tp-list">
      <div class="lib-filter"><input v-model="q" class="trpg-input" type="search" :placeholder="`搜${words.what}（如 ${words.eg}）`" :aria-label="`搜${words.what}`" data-autofocus data-testid="ip-search" /></div>
      <ErrorBanner v-if="error" :text="`没读出来：${error}`" what="读取物品" :actions="[{ label: '重试', run: load }]" />
      <div v-else-if="!rows" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
      <div v-else ref="scrollEl" class="lib-mscroll">
        <div v-if="!shown.length" class="lib-state"><h3>{{ q.trim() ? `没找到「${q.trim()}」` : `库里还没有${words.what}` }}</h3></div>
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
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!ref_ || adding || person.readOnly" data-testid="ip-add" @click="add"><Icon name="plus" :size="14" />{{ adding ? '正在加入…' : words.verb }}</button>
    </div>
  </div>
</template>

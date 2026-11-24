<script setup lang="ts">
// 人物加物品（线框 u4-pick；驾驶员 11-23 批）：和「从模板加入」同一个两栏页——左边库里的物品（本战役能看到的，和库同一份），
// 右边库里同一张资料卡；底栏 [加进背包 / 加这个职业 …]。选好后同一个弹窗里换成问答页（ask/ImportAsk.vue：作者「导入到人物」整路，
// 特性 / 熟练 / 起始装备随条目一起来，作者要问的一题一题答），确认后一条可撤销的改动。
import { computed, markRaw, ref, shallowRef } from 'vue'
import { addProp, type AddKind } from '../../rules/kernel/card-types'
import { usePersonStore } from '../../stores/person'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import ErrorBanner from '../libview/ErrorBanner.vue'
import EntryPage from '../libview/EntryPage.vue'
import { openEntry } from '../libview/open'
import { pickKey, usePickList } from '../libview/usePickList'
import ImportAsk from './ask/ImportAsk.vue'
import type { EntryRef } from '../../library/scopes'

const props = withDefaults(defineProps<{ kind?: AddKind; replace?: { id: string; name: string }; keep?: (item: Record<string, unknown>) => boolean }>(), { kind: 'items', replace: undefined, keep: undefined })
const WORDS: Record<AddKind, { what: string; verb: string; eg: string }> = {
  items: { what: '物品', verb: '加进背包', eg: '治疗药水' }, spells: { what: '法术', verb: '加进法术书', eg: '火焰箭' }, feats: { what: '专长', verb: '加给这个人', eg: '警觉' },
  races: { what: '种族', verb: '用这个种族', eg: '精灵' }, backgrounds: { what: '背景', verb: '用这个背景', eg: '侍僧' }, classes: { what: '职业', verb: '加这个职业', eg: '战士' },
  subclasses: { what: '子职业', verb: '选这个子职业', eg: '冠军' },
}
const words = computed(() => WORDS[props.kind])
const person = usePersonStore()
const ui = useUiStore()
const scrollEl = ref<HTMLElement | null>(null)
const wide = computed(() => ui.layout === 'wide')
const { rows, error, q, source, sources, picked, load, shown, current, range, visible, ref_, lib } = usePickList((library) => {
  const prop = addProp(library.rule, props.kind)
  if (!prop) throw new Error(`这个规则没有${WORDS[props.kind].what}类条目`)
  return prop
}, scrollEl, WORDS[props.kind].what, props.keep)

/** 选好了：同一个弹窗里换成问答页（作者「导入到人物」整路：特性、熟练、装备随条目一起来，要选的一题一题问）。 */
const asking = shallowRef<{ ref: EntryRef; name: string } | null>(null)
function add(): void {
  const cur = current.value
  if (!cur || person.readOnly) return
  asking.value = { ref: cur.row.ref, name: String(cur.name) }
}
const CardPane = markRaw(EntryPage)
</script>

<template>
  <ImportAsk v-if="asking" :entry-ref="asking.ref" :name="asking.name" :replace="replace" @back="asking = null" />
  <div v-else class="tp" data-testid="item-pick">
    <div class="tp-list">
      <div class="lib-filter tp-search">
        <input v-model="q" class="trpg-input" type="search" :placeholder="`搜中英文名（如 ${words.eg}）`" :aria-label="`搜${words.what}的中英文名`" data-autofocus data-testid="ip-search" />
        <SelectField v-if="sources.length > 2" v-model="source" :options="sources" label="按来源筛选" data-testid="ip-source" />
      </div>
      <ErrorBanner v-if="error" :text="`没读出来：${error}`" what="读取物品" :actions="[{ label: '重试', run: load }]" />
      <div v-else-if="!rows" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
      <div v-else ref="scrollEl" class="lib-mscroll">
        <div v-if="!shown.length" class="lib-state">
          <h3>{{ q.trim() ? `没找到「${q.trim()}」` : `库里还没有${words.what}` }}</h3>
          <button v-if="q || source !== 'all'" type="button" class="trpg-btn trpg-btn--small" @click="q = ''; source = 'all'">清空筛选</button>
        </div>
        <div v-else class="lib-list" role="group" :aria-label="`${words.what}搜索结果`" :style="{ paddingTop: `${range.padTop}px`, paddingBottom: `${range.padBottom}px` }">
          <button v-for="r in visible" :key="pickKey(r.row)" class="lib-list__row tp-row" type="button" :aria-pressed="pickKey(r.row) === picked" :data-picked="pickKey(r.row) === picked || undefined" data-testid="ip-row" @click="picked = pickKey(r.row)">
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
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!ref_ || person.readOnly" data-testid="ip-add" @click="add"><Icon name="plus" :size="14" />{{ words.verb }}</button>
    </div>
  </div>
</template>

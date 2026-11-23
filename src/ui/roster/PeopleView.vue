<script setup lang="ts">
import { computed, markRaw, onMounted } from 'vue'
import { useCampaignStore } from '../../stores/campaign'
import { CATEGORIES, SORTS, useRosterStore, type CategoryId, type ListView } from '../../stores/roster'
import Icon from '../kit/Icon.vue'
import { useModalStore } from '../../stores/modal'
import MoreMenu from '../kit/MoreMenu.vue'
import PeopleRow from './PeopleRow.vue'
import PeopleSelectBar from './PeopleSelectBar.vue'
import TemplatePage from './TemplatePage.vue'
import BuildPage from './BuildPage.vue'
import PersonPage from '../person/PersonPage.vue'
import { usePersonStore } from '../../stores/person'

const store = useRosterStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const person = usePersonStore()
onMounted(() => void store.ensure())

const tabs = computed(() => [...CATEGORIES.map((c) => ({ id: c.id as ListView, label: c.label })), { id: 'all' as ListView, label: '全部' }])
const trash = computed(() => store.view === 'trash')
const readOnly = computed(() => campaign.readOnly)
const first = computed(() => store.loading && !store.rows.length)
const stripTitle = computed(() => trash.value ? '回收站' : tabs.value.find((t) => t.id === store.view)?.label ?? '')
const sortLabel = computed(() => `排序：${SORTS.find((s) => s.id === store.sort)?.label}`)
const empty = computed(() => !store.loading && !store.error && !store.rows.length)

async function onMenu(id: string, key: string): Promise<void> {
  if (key === 'pin' || key === 'unpin') await store.pin([id], key === 'pin')
  else if (key === 'copy') await store.copy([id])
  else if (key === 'trash') await store.trashed([id], true)
  else if (key === 'restore') await store.trashed([id], false)
  else if (key === 'purge') await store.purge([id])
  else if (key.startsWith('move:')) await store.move([id], key.slice(5) as CategoryId)
}
async function bulk(kind: 'move' | 'copy' | 'remove' | 'restore', category?: string): Promise<void> {
  const ids = [...store.selected]
  if (!ids.length) return
  const done = kind === 'move' ? await store.move(ids, category as CategoryId)
    : kind === 'copy' ? await store.copy(ids)
      : kind === 'restore' ? await store.trashed(ids, false)
        : trash.value ? await store.purge(ids) : await store.trashed(ids, true)
  if (done) store.selected = []
}
/** [＋新建] 菜单：新建人物（作者完整建卡器，整页接管）、从模板加入。 */
const off = computed(() => (readOnly.value ? { disabled: true, reason: '另一个窗口在改' } : {}))
const NEW_ITEMS = computed(() => [{ key: 'native', label: '新建人物…', ...off.value }, { key: 'template', label: '从模板加入…', ...off.value }])
async function onNew(key: string): Promise<void> {
  if (key === 'native') {
    const category = CATEGORIES.some((c) => c.id === store.view) ? (store.view as CategoryId) : 'party'
    modal.open({ key: 'roster-build', title: '分步建卡', component: markRaw(BuildPage), props: { category }, variant: 'dialog', width: 640, height: 600 })
  }
  if (key === 'template') modal.open({ key: 'roster-template', title: '从模板加入', component: markRaw(TemplatePage), variant: 'dialog', width: 920, height: 680, onLeave: () => void store.refresh() })
}
const headerMenu = computed(() => [trash.value ? { key: 'back', label: '回到人物列表' } : { key: 'trash', label: `回收站（${store.counts.trash}）` }])
</script>

<template>
  <PersonPage v-if="person.id" />
  <div v-else class="pp" data-testid="people-view">
    <div class="pp-top">
      <div v-if="trash" class="pp-title"><button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="store.setView('party')"><Icon name="caret-left" :size="14" />人物</button><b>回收站</b></div>
      <div v-else class="pp-tabs" role="group" aria-label="人物分类">
        <button v-for="t in tabs" :key="t.id" type="button" :aria-pressed="store.view === t.id" :data-testid="`pp-tab-${t.id}`" @click="store.setView(t.id)">{{ t.label }}<small>{{ store.counts[t.id] }}</small></button>
      </div>
      <div class="pp-tools">
        <MoreMenu label="排序" :text="sortLabel" :items="SORTS.map((s) => ({ key: s.id, label: s.label }))" @select="(k) => (store.sort = k as 'manual' | 'name')" />
        <button class="trpg-btn trpg-btn--small" type="button" data-testid="pp-select" :aria-pressed="store.selecting" @click="store.toggleSelecting()">{{ store.selecting ? '完成' : '选择' }}</button>
        <MoreMenu v-if="!trash" label="新建" text="＋ 新建" primary :items="NEW_ITEMS" @select="onNew" />
        <MoreMenu label="人物页" :items="headerMenu" @select="(k) => store.setView(k === 'back' ? 'party' : 'trash')" />
      </div>
    </div>
    <label class="pp-search"><Icon name="magnifying-glass" :size="16" /><input v-model="store.query" class="trpg-input" type="search" placeholder="搜名字、职业、种族、标签（只在这个分类里找）" aria-label="搜人物" data-testid="pp-search" /></label>

    <p v-if="store.error" class="pp-error" role="alert"><Icon name="warning" :size="16" />读取人物失败：{{ store.error }}<button class="trpg-btn trpg-btn--small" type="button" @click="store.load()">重试</button></p>
    <p v-if="readOnly" class="pp-note"><Icon name="lock" :size="14" />另一个窗口正在使用助手，这里只能查看，增删改都先停用。</p>

    <ul v-if="first" class="pp-list" aria-busy="true"><li v-for="n in 3" :key="n" class="pp-row"><span class="trpg-skeleton pp-skel" /></li></ul>
    <div v-else-if="empty" class="pp-empty"><b>这个战役里还没有人物</b></div>
    <template v-else>
      <div class="pp-strip"><span>{{ stripTitle }}<small>{{ store.visible.length }}</small></span><span>生命</span></div>
      <ul v-if="store.visible.length" class="pp-list" data-testid="pp-list">
        <PeopleRow
          v-for="r in store.visible" :key="r.id" :row="r" :info="store.loaded[r.id]" :selecting="store.selecting" :selected="store.selected.includes(r.id)" :trash="trash" :read-only="readOnly"
          @toggle="store.toggle(r.id)" @menu="(k) => onMenu(r.id, k)" @retry="store.load()" @open="person.open(r.id)" />
      </ul>
      <div v-else class="pp-empty">
        <b>{{ store.query ? '没有找到' : trash ? '回收站是空的' : `${stripTitle}里还没有人物` }}</b>
        <p v-if="store.elsewhere">在「{{ store.elsewhere.label }}」里有 {{ store.elsewhere.n }} 个。<button class="trpg-btn trpg-btn--small" type="button" @click="store.setView(store.elsewhere.id)">去看</button></p>
        <p v-else-if="store.query">换个关键词，或点「全部」一起找。</p>
      </div>
    </template>
    <PeopleSelectBar
      v-if="store.selecting" :count="store.selected.length" :total="store.visible.length" :trash="trash" :disabled="readOnly"
      @all="store.selectAllVisible()" @move="(c) => bulk('move', c)" @copy="bulk('copy')" @remove="bulk('remove')" @restore="bulk('restore')" />
  </div>
</template>

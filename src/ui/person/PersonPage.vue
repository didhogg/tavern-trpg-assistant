<script setup lang="ts">
// P6 单元 1 人物详情外壳（线框 p6-6，驾驶员 2026-11-23 批准）：应用条 · 页头 · 分页条 · 左侧栏（技能）；分页内容从 A 批起逐页接上。
// 从人物列表点一行进来（整页，列表和详情不并排）；‹ 人物 回到列表。
import { computed, markRaw, onMounted, ref, watch } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import { useUiStore } from '../../stores/ui'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { CATEGORIES, categoryOf, useRosterStore, type CategoryId } from '../../stores/roster'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import PersonHeader from './PersonHeader.vue'
import HistoryDrawer from './HistoryDrawer.vue'
import SkillList from './SkillList.vue'
import ActionsTab from './ActionsTab.vue'
import AttributesTab from './AttributesTab.vue'
import BagTab from './BagTab.vue'
import { skills } from './view'

const person = usePersonStore()
const roster = useRosterStore()
const modal = useModalStore()
const ui = useUiStore()
const app = useAppStore()
const campaign = useCampaignStore()
const lib = useLibViewStore()
// 页里会打开库里的原文（种族 / 背景资料卡、行动展开），和从模板加入一样先读好库设置
onMounted(() => { if (!lib.campaignLib || !lib.bound) void lib.load(app.svc(), campaign.owner?.ownerKey ?? null) })

const TABS = [
  { id: 'action', label: '行动' }, { id: 'attr', label: '属性' }, { id: 'bag', label: '背包' }, { id: 'spell', label: '法术' },
  { id: 'feat', label: '特性' }, { id: 'effect', label: '效果' }, { id: 'bio', label: '背景' }, { id: 'note', label: '日志' },
] as const
const tab = ref<(typeof TABS)[number]['id']>('action')
const sideOpen = ref(ui.layout !== 'narrow')
watch(() => ui.layout, (l) => { if (l === 'narrow') sideOpen.value = false })

const name = computed(() => person.sheet?.name ?? person.row?.name ?? '')
const category = computed(() => (person.row ? categoryOf(person.row) : null))
const categoryItems = computed(() => CATEGORIES.map((c) => ({ key: c.id, label: c.label, disabled: c.id === category.value })))
const moreItems = computed(() => [
  { key: 'copy', label: '复制一份', disabled: person.readOnly },
  ...CATEGORIES.filter((c) => c.id !== category.value).map((c) => ({ key: `move:${c.id}`, label: `移到${c.label}`, disabled: person.readOnly })),
  { key: 'trash', label: '删除（进回收站）', danger: true, disabled: person.readOnly },
])
async function onCategory(key: string): Promise<void> { if (person.id) await roster.move([person.id], key as CategoryId) }
async function onMore(key: string): Promise<void> {
  const who = person.id
  if (!who) return
  if (key === 'copy') await roster.copy([who])
  else if (key.startsWith('move:')) await roster.move([who], key.slice(5) as CategoryId)
  else if (key === 'trash' && await roster.trashed([who], true)) person.close()
}
const openHistory = () => modal.open({ key: 'person-history', title: '改动记录', component: markRaw(HistoryDrawer), variant: 'dialog', width: 560, height: 600 })
const skillRows = computed(() => (person.sheet ? skills(person.sheet) : []))
const missing = computed(() => person.row?.missing ?? [])
</script>

<template>
  <div class="ps" data-testid="person-page">
    <div class="ps-bar" data-testid="ps-bar">
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="ps-back" @click="person.close()"><Icon name="caret-left" :size="14" />人物</button>
      <b class="ps-bar-name">{{ name }}</b>
      <MoreMenu v-if="category" label="放在哪个分类" :items="categoryItems" :text="CATEGORIES.find((c) => c.id === category)?.label" @select="onCategory" />
      <span class="ps-bar-tools">
        <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="!person.prevId" aria-label="上一位" data-testid="ps-prev" @click="person.prevId && person.open(person.prevId)"><Icon name="caret-left" :size="16" /></button>
        <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="!person.nextId" aria-label="下一位" data-testid="ps-next" @click="person.nextId && person.open(person.nextId)"><Icon name="caret-right" :size="16" /></button>
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="person.readOnly" data-testid="ps-undo" @click="person.undo()"><Icon name="arrow-counter-clockwise" :size="14" />撤销</button>
        <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="ps-history" @click="openHistory">改动记录</button>
        <MoreMenu label="更多操作" :items="moreItems" @select="onMore" />
      </span>
    </div>

    <p v-if="person.error" class="pp-error" role="alert">
<Icon name="warning" :size="16" />读取人物失败：{{ person.error }}
      <button class="trpg-btn trpg-btn--small" type="button" @click="person.reload()">重试</button>
</p>
    <p v-else-if="missing.length" class="pp-note" data-testid="ps-missing"><Icon name="warning" :size="16" />缺 {{ missing.length }} 项资料：{{ missing.join('、') }}；其余照常。</p>

    <div v-if="!person.sheet" class="ps-skeleton" aria-busy="true" data-testid="ps-loading">{{ person.error ? '' : '正在读取人物…' }}</div>
    <template v-else>
      <PersonHeader />
      <div class="ps-tabs" role="tablist" aria-label="人物分页">
        <button class="ps-side-toggle" type="button" :aria-pressed="sideOpen" :aria-label="sideOpen ? '收起侧栏' : '打开侧栏'" @click="sideOpen = !sideOpen"><Icon :name="sideOpen ? 'caret-left' : 'caret-right'" :size="14" /></button>
        <button v-for="t in TABS" :key="t.id" type="button" role="tab" :aria-selected="tab === t.id" :data-testid="`ps-tab-${t.id}`" @click="tab = t.id">{{ t.label }}</button>
      </div>
      <div class="ps-body" :data-side="sideOpen || undefined">
        <aside v-if="sideOpen" class="ps-side" data-testid="ps-side">
          <h3>技能</h3>
          <p v-if="!skillRows.length" class="ps-drawer-note">没有列出的技能。</p>
          <SkillList v-else :rows="skillRows" testid="ps-side-skills" />
        </aside>
        <section class="ps-tab" role="tabpanel" :data-testid="`ps-panel-${tab}`">
          <ActionsTab v-if="tab === 'action'" />
          <AttributesTab v-else-if="tab === 'attr'" />
          <BagTab v-else-if="tab === 'bag'" />
          <p v-else class="ps-drawer-note">这一页还在做。</p>
        </section>
      </div>
    </template>
  </div>
</template>

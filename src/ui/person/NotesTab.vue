<script setup lang="ts">
// 日志页（线框 p6-12b，照 Tidy5e 日志）：左 日志页列表（序号 · 标题 · 日期 · ⋯）+ 新页；右 这一页的正文（✎ 原地改）+ 上一页 / 下一页。
// 日志存这个人的个人调整（journal），不改官方字段；每次改动可撤销。
import { computed, ref, watch } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import TextCard from './TextCard.vue'

interface Page { id: string; title: string; date: number; text: string }
const person = usePersonStore()
const pages = computed<Page[]>(() => (Array.isArray(person.row?.adjustments.journal) ? person.row!.adjustments.journal as Page[] : []))
const current = ref<string | null>(null)
watch(pages, (list) => { if (!list.some((p) => p.id === current.value)) current.value = list[0]?.id ?? null }, { immediate: true })
const index = computed(() => pages.value.findIndex((p) => p.id === current.value))
const page = computed(() => pages.value[index.value] ?? null)
const dateText = (t: number): string => new Date(t).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
const write = (label: string, list: Page[]) => person.adjust(label, { journal: list })
async function addPage(): Promise<void> {
  const p: Page = { id: crypto.randomUUID().slice(0, 8), title: `第 ${pages.value.length + 1} 页`, date: Date.now(), text: '' }
  if (await write('新建了一页日志', [p, ...pages.value])) current.value = p.id
}
const savePage = (patch: Partial<Page>): void => { if (page.value) void write(`改了日志「${page.value.title}」`, pages.value.map((p) => (p.id === page.value!.id ? { ...p, ...patch } : p))) }
function onMenu(p: Page, key: string): void { if (key === 'remove') void write(`删除了日志「${p.title}」`, pages.value.filter((x) => x.id !== p.id)) }
</script>

<template>
  <div class="ps-notes" data-testid="ps-notes">
    <section class="ps-grp ps-notes-list">
      <header class="ps-grp-head"><b>日志页</b><small>{{ pages.length }}</small><span class="tp-gap" /><button class="trpg-icon-btn" type="button" aria-label="新建一页" :disabled="person.readOnly" data-testid="ps-notes-add" @click="addPage"><Icon name="plus" :size="16" /></button></header>
      <p v-if="!pages.length" class="ps-drawer-note ps-notes-empty">还没有日志。点 ＋ 记下这次跑团发生了什么。</p>
      <ul class="ps-rows">
        <li v-for="(p, i) in pages" :key="p.id" class="ps-row" :data-open="p.id === current || undefined">
          <div class="ps-row-main">
            <span class="ps-note-n">{{ pages.length - i }}</span>
            <button class="ps-row-name ps-note-pick" type="button" @click="current = p.id"><b class="ps-row-title ps-row-title--static">{{ p.title }}</b><small>{{ dateText(p.date) }}</small></button>
            <span class="ps-grp-menu-col"><MoreMenu :label="`${p.title}的更多操作`" :items="[{ key: 'remove', label: '删除', danger: true, disabled: person.readOnly }]" @select="onMenu(p, $event)" /></span>
          </div>
        </li>
      </ul>
    </section>
    <div v-if="page" class="ps-notes-page">
      <TextCard :key="`t-${page.id}`" :title="'标题'" :text="page.title" single :read-only="person.readOnly" @save="(t) => savePage({ title: t.trim() || page!.title })">{{ page.title }}</TextCard>
      <TextCard :key="`b-${page.id}`" title="正文" :text="page.text" :read-only="person.readOnly" placeholder="这次发生了什么……" testid="ps-note-body" @save="(t) => savePage({ text: t })">
        <p v-for="(para, i) in page.text.split(/\n{2,}/)" :key="i">{{ para }}</p>
        <p v-if="!page.text" class="ps-drawer-note">还没写。点 ✎ 开始写。</p>
      </TextCard>
      <div class="ps-notes-nav">
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="index >= pages.length - 1" @click="current = pages[index + 1].id"><Icon name="caret-left" :size="12" />上一页</button>
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="index <= 0" @click="current = pages[index - 1].id">下一页<Icon name="caret-right" :size="12" /></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 背景页（线框 p6-12，照 Tidy5e 传记页）：外貌 · 传记（大卡）| 性格特点 · 理想 · 羁绊 · 缺点 | 特征（性别、信仰：驾驶员 11-15 只留这两项）。
// 每张卡 ✎ 原地改，保存 = 写人物的官方字段（可撤销）；没写的收起成「还没写的：＋ 羁绊 ＋ 缺点」。传记是官方的 HTML 字段，编辑框里是普通文字。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import TextCard from './TextCard.vue'

const person = usePersonStore()
const d = computed(() => person.sheet?.system.details ?? {})
const htmlToText = (html: string): string => html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim()
const textToHtml = (text: string): string => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`).join('')
interface Card { key: string; title: string; path: string; text: string; html?: boolean }
const cards = computed<Card[]>(() => [
  { key: 'appearance', title: '外貌', path: 'system.details.appearance', text: String(d.value.appearance ?? '') },
  { key: 'biography', title: '传记', path: 'system.details.biography.value', text: htmlToText(String(d.value.biography?.value ?? '')), html: true },
  { key: 'trait', title: '性格特点', path: 'system.details.trait', text: String(d.value.trait ?? '') },
  { key: 'ideal', title: '理想', path: 'system.details.ideal', text: String(d.value.ideal ?? '') },
  { key: 'bond', title: '羁绊', path: 'system.details.bond', text: String(d.value.bond ?? '') },
  { key: 'flaw', title: '缺点', path: 'system.details.flaw', text: String(d.value.flaw ?? '') },
])
const opened = ref<Set<string>>(new Set())
const filled = computed(() => cards.value.filter((c) => c.text || opened.value.has(c.key)))
const empty = computed(() => cards.value.filter((c) => !c.text && !opened.value.has(c.key)))
const refs = ref<Record<string, InstanceType<typeof TextCard> | null>>({})
async function add(c: Card): Promise<void> { opened.value = new Set([...opened.value, c.key]); await Promise.resolve(); setTimeout(() => refs.value[c.key]?.start(), 0) }
const save = (c: Card, text: string): void => { void person.edit(`改了${c.title}`, [{ kind: 'set', path: c.path, value: c.html ? textToHtml(text) : text }]) }
const traits = computed(() => [{ key: 'gender', title: '性别', path: 'system.details.gender', text: String(d.value.gender ?? '') }, { key: 'faith', title: '信仰', path: 'system.details.faith', text: String(d.value.faith ?? '') }])
</script>

<template>
  <div class="ps-bio" data-testid="ps-bio">
    <div class="ps-bio-main">
      <TextCard v-for="c in filled" :key="c.key" :ref="(el) => (refs[c.key] = el as InstanceType<typeof TextCard>)" :title="c.title" :text="c.text" :read-only="person.readOnly" :testid="`ps-bio-${c.key}`" @save="(t) => save(c, t)">
        <p v-for="(para, i) in c.text.split(/\n{2,}/)" :key="i">{{ para }}</p>
        <p v-if="!c.text" class="ps-drawer-note">还没写。</p>
      </TextCard>
      <p v-if="empty.length" class="ps-bio-empty">还没写的：<button v-for="c in empty" :key="c.key" type="button" class="ps-add-chip" :disabled="person.readOnly" :data-testid="`ps-bio-add-${c.key}`" @click="add(c)">＋ {{ c.title }}</button></p>
    </div>
    <section class="ps-text-card ps-bio-traits">
      <header class="ps-grp-head"><b>特征</b></header>
      <div class="ps-bio-trait-grid">
        <TextCard v-for="t in traits" :key="t.key" class="ps-bio-trait" :title="t.title" :text="t.text" single :read-only="person.readOnly" @save="(v) => person.edit(`改了${t.title}`, [{ kind: 'set', path: t.path, value: v }])">{{ t.text || '—' }}</TextCard>
      </div>
    </section>
  </div>
</template>

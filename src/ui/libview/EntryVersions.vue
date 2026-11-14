<script setup lang="ts">
import { computed } from 'vue'
import type { ScopedDetail } from '../../library/scoped'
import type { EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import Icon from '../kit/Icon.vue'
import { useVersionActions } from './use-version-actions'

/**
 * 条目的【版本】标签：原件、你保存过的房规、别的包里的同编号版本平铺成一个单选列表，点哪一行就改用哪一个（不弹确认，随时能点回去）。
 * 生效在设置里的「覆盖层级」（默认本战役）。每个版本在哪一层生效、删除房规，都在右上的【版本管理】里。
 */
const props = defineProps<{ detail: ScopedDetail | null; entryRef: EntryRef }>()
const emit = defineEmits<{ changed: []; manage: [] }>()
const app = useAppStore()
const { pickHere } = useVersionActions(async () => { emit('changed') })

const level = computed(() => app.settings?.library.overrideLevel ?? 'campaign')
const levelWord = computed(() => (level.value === 'campaign' ? '本战役' : level.value === 'rule' ? '当前规则' : '全局'))
const alts = computed(() => props.detail?.alternatives ?? [])
const effective = computed(() => props.detail?.version.altId ?? 'base')
const nameOf = (item: unknown): string => (typeof item === 'object' && item && typeof (item as { name?: unknown }).name === 'string' ? (item as { name: string }).name : '')
/** 版本叫什么：房规按保存的先后编号（房规 1、房规 2…），别的包的版本用包的文件名。 */
const rows = computed(() => {
  let house = 0
  const out = [{ altId: 'base', label: '原件', hint: '官方（或先装的包）里原来的内容', badge: null as string | null }]
  for (const a of alts.value) {
    const isHouse = a.kind === 'houserule'
    if (isHouse) house += 1
    out.push({ altId: a.altId, label: isHouse ? `房规 ${house}` : a.filename ?? '自制包', hint: nameOf(a.item), badge: isHouse ? null : '别的包' })
  }
  return out
})
const pick = (altId: string, label: string): void => { if (altId !== effective.value) void pickHere(props.entryRef, altId === 'base' ? null : altId, label) }
</script>

<template>
  <div class="lib-versions" data-testid="entry-versions">
    <div class="lib-versions__head">
      <b>{{ alts.length ? `此条有 ${alts.length + 1} 个版本` : '这一条只有原件' }}</b>
      <button class="trpg-btn trpg-btn--small lib-end" type="button" data-testid="versions-manage" @click="emit('manage')"><Icon name="gear" :size="14" />版本管理</button>
    </div>
    <p v-if="!alts.length" class="lib-muted" style="margin: 0">点条目右上角的 ✎ 改成房规，保存后的版本会出现在这里，点一下就能改用。</p>
    <div v-else class="lib-block" role="radiogroup" aria-label="这一条用哪个版本" data-testid="alt-list">
      <button v-for="r in rows" :key="r.altId" class="lib-alt-row lib-alt-pick" type="button" role="radio" :aria-checked="effective === r.altId" :title="r.hint || undefined" :data-on="effective === r.altId ? 'true' : undefined" data-testid="alt-row" @click="pick(r.altId, r.label)">
        <span class="lib-alt-pick__dot" aria-hidden="true" />
        <span class="lib-alt-pick__name">{{ r.label }}</span>
        <span v-if="r.badge" class="trpg-badge" data-tone="primary">{{ r.badge }}</span>
        <span v-if="effective === r.altId" class="trpg-badge lib-end" data-tone="success">生效中</span>
      </button>
      <span class="lib-faint" style="font-size: 12px">点一行就改用它，生效在：{{ levelWord }}。</span>
    </div>
  </div>
</template>

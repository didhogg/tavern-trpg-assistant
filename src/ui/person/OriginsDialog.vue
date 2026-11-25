<script setup lang="ts">
// 职业与出身单元（驾驶员 11-25：页头框 ✎ → 这个弹窗）。宽屏左右两栏：左边这个人的职业 / 子职业 / 种族 / 背景行，右边选中那一行的资料，
// 改等级时右边走升级问答 / 降级确认；窄屏左边列表，点一行在同一个弹窗里翻到那一页（左上返回）。
// 加职业 / 兼职 / 选子职业 / 换种族背景 = 统一资料库页（左库右资料），在本弹窗里翻页。
import { computed, markRaw, ref, watch } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import { useUiStore } from '../../stores/ui'
import BuildRows from './BuildRows.vue'
import OriginsDetail, { type OriginsView } from './OriginsDetail.vue'
import { background, species } from './view'
import { classBuilds, originId, type ClassBuild } from './view-tabs'

/** start：打开时选中哪一行（class:编号 / race / background），或直接进某个职业的改等级流程。 */
const props = defineProps<{ start?: string; level?: { classId: string; delta: number } }>()
const person = usePersonStore()
const modal = useModalStore()
const ui = useUiStore()
const wide = computed(() => ui.layout === 'wide')
const s = computed(() => person.sheet!)
const cls = computed(() => classBuilds(s.value))

/** 一行对应的资料（名字、库条目、人物身上的编号）。 */
function entryOf(key: string): OriginsView | null {
  if (key.startsWith('class:')) {
    const c = cls.value.find((x) => x.id === key.slice(6))
    return c ? { kind: 'entry', key, itemId: c.id, name: c.name, ref: (c.ref ?? null) as EntryRef | null } : null
  }
  if (key.startsWith('sub:')) {
    const c = cls.value.find((x) => x.subclass?.id === key.slice(4))
    return c?.subclass ? { kind: 'entry', key, itemId: c.subclass.id, name: c.subclass.name, ref: (c.subclass.ref ?? null) as EntryRef | null } : null
  }
  if (key === 'race' || key === 'background') {
    const row = key === 'race' ? species(s.value) : background(s.value)
    return row ? { kind: 'entry', key, itemId: originId(s.value, key), name: row.name, ref: (row.ref ?? null) as EntryRef | null } : null
  }
  return null
}
const firstKey = (): string | null => (cls.value[0] ? `class:${cls.value[0].id}` : species(s.value) ? 'race' : background(s.value) ? 'background' : null)
const levelView = (c: ClassBuild, delta: number): OriginsView => ({ kind: 'level', key: `level:${c.id}:${c.levels + delta}`, classId: c.id, name: c.name, ref: (c.ref ?? null) as EntryRef | null, from: c.levels, to: c.levels + delta })

const current = ref<OriginsView | null>(null)
function show(v: OriginsView | null): void {
  if (!v) return
  if (wide.value) { current.value = v; return }
  modal.push({ key: `origins-page:${v.key}`, title: v.kind === 'level' ? `${v.name}改到 ${v.to} 级` : v.name, component: markRaw(OriginsDetail), props: { view: v, page: true }, variant: 'dialog', width: 920, height: 720 })
}
function pick(key: string): void { show(entryOf(key)) }
function changeLevel(c: ClassBuild, delta: number): void { show(levelView(c, delta)) }
/** 回到这个职业 / 这一行的资料（升级做完、取消、降级做完）。 */
function back(): void {
  const v = current.value
  current.value = v?.kind === 'level' ? entryOf(`class:${v.classId}`) ?? entryOf(firstKey() ?? '') : v
}

// 打开时：指定的改等级流程 > 指定的行 > 第一行（宽屏右边不空着）
const startClass = props.level ? cls.value.find((c) => c.id === props.level!.classId) : undefined
if (startClass && props.level) show(levelView(startClass, props.level.delta))
else if (wide.value) current.value = entryOf(props.start ?? firstKey() ?? '')
// 人物变了（加了职业、换了种族、删了一行）：选中的行不在了就换到第一行，名字跟着更新
watch(() => person.sheet, () => {
  const v = current.value
  if (!wide.value || v?.kind === 'level') return
  current.value = (v && entryOf(v.key)) ?? entryOf(firstKey() ?? '')
})
const selected = computed(() => (current.value?.kind === 'entry' ? current.value.key : current.value?.kind === 'level' ? `class:${current.value.classId}` : null))
</script>

<template>
  <div class="od-wrap" :data-wide="wide || undefined" data-testid="origins-dialog">
    <div class="od-list"><BuildRows :selected="selected" @pick="pick" @level="changeLevel" /></div>
    <div v-if="wide" class="od-side">
      <OriginsDetail v-if="current" :key="current.key" :view="current" @back="back" />
      <p v-else class="od-hint">先在左边选职业、种族或背景。</p>
    </div>
  </div>
</template>

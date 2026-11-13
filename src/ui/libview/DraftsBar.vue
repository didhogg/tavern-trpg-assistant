<script setup lang="ts">
import { ref } from 'vue'
import type { EditDraft } from '../../library/manage'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'
import { askConfirm } from '../kit/confirm'
import Icon from '../kit/Icon.vue'
import { plain } from './use-editor'

/**
 * 我的库顶上的草稿条（u7-1；§16.10 2d 驾驶员 2026-11-13：草稿只会越堆越多、删不掉）：
 * ［继续最新的］+［管理（N）］展开每一份：名字、类型、时间、［继续］［×］，最下面［全部放弃］（再问一次）。
 * 丢掉的都能在提示里撤销（照原来的键存回去，custom.saveDraft）。草稿只存在插件管理记录里，丢掉不影响任何条目。
 */
type Draft = EditDraft & { key: string }
const props = defineProps<{ drafts: Draft[]; narrow: boolean; nameOf: (d: EditDraft) => string }>()
const emit = defineEmits<{ continue: [key: string]; changed: [] }>()
const app = useAppStore()
const toast = useToastStore()
const open = ref(false)
const time = (at: number) => { const d = new Date(at); return `${d.getMonth() + 1}-${d.getDate()} ${d.toTimeString().slice(0, 5)}` }

async function restore(list: Draft[]): Promise<void> {
  const c = app.svc().backend.library.custom
  // 草稿经过界面状态是响应式代理，后端 structuredClone 复制不了：先转成普通数据
  for (const d of list) await c.saveDraft(plain({ codeSet: d.codeSet, prop: d.prop, s: d.s, target: d.target, m: d.m }), d.key)
  emit('changed')
}
async function drop(list: Draft[]): Promise<void> {
  try {
    const c = app.svc().backend.library.custom
    for (const d of list) await c.discardDraft(d.key)
    emit('changed')
    toast.push('undo', list.length === 1 ? `已放弃草稿「${props.nameOf(list[0])}」` : `已放弃 ${list.length} 份草稿`, { undo: () => restore(list) })
  } catch (e) { console.error('[trpg-assistant] 放弃草稿没成功', e); toast.error(e instanceof Error ? e.message : '没有放弃成功') }
}
async function dropAll(): Promise<void> {
  if (!(await askConfirm({ title: `放弃全部 ${props.drafts.length} 份草稿？`, message: '草稿里没保存的改动都会丢掉，已经存好的条目不受影响。放弃后可以在提示里撤销。', confirmLabel: '全部放弃', cancelLabel: '先不了', danger: true }))) return
  await drop([...props.drafts])
  open.value = false
}
</script>

<template>
  <div class="lib-drafts" data-testid="mylib-drafts">
    <Icon name="pencil-simple" :size="16" />
    <span>{{ narrow ? `${drafts.length} 份没保存的草稿` : `有 ${drafts.length} 份没保存的草稿：${drafts.slice(0, 3).map(nameOf).join(' · ')}` }}</span>
    <span class="lib-end">
      <button class="trpg-btn trpg-btn--small" type="button" data-testid="draft-continue" @click="emit('continue', drafts[0].key)">继续{{ drafts.length > 1 ? '最新的' : '' }}</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :aria-expanded="open" data-testid="draft-manage" @click="open = !open">管理（{{ drafts.length }}）<Icon :name="open ? 'caret-down' : 'caret-right'" :size="14" /></button>
    </span>
  </div>
  <div v-if="open" class="lib-draftlist" data-testid="draft-list">
    <div v-for="d in drafts" :key="d.key" class="lib-draftlist__row">
      <span class="lib-draftlist__name">{{ nameOf(d) }}<small class="lib-faint"> · {{ d.codeSet === 'en' ? 'English' : '中文' }} · {{ time(d.at) }}</small></span>
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="emit('continue', d.key)">继续</button>
      <button class="trpg-icon-btn" type="button" :aria-label="`放弃草稿 ${nameOf(d)}`" data-testid="draft-drop" @click="drop([d])"><Icon name="x" :size="16" /></button>
    </div>
    <div class="lib-draftlist__foot"><button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" data-testid="draft-drop-all" @click="dropAll">全部放弃</button></div>
  </div>
</template>

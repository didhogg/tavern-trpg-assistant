<script setup lang="ts">
// 改动记录（线框 p6-14）：谁 · 改了什么 · 旧 → 新 · 时间；可只看这个人；「撤销到这里」先说会撤几条。
// dnd5e 字段名由后端按数据结构给（已过唯一中文出口）；插件自己的「个人调整」字段用插件自己的说法（下面登记表）。
import { computed, onMounted, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import { CATEGORIES } from '../../stores/roster'
import { askConfirm } from '../kit/confirm'
import Switch from '../kit/Switch.vue'

/** 插件自己的个人调整字段（界面登记表：加一个字段 = 加一行）。 */
const ADJUSTMENTS: Record<string, string> = { category: '分类', pinned: '置顶', trashed: '回收站', tags: '标签', englishName: '英文名', order: '排序' }
const KIND: Record<string, string> = { added: '加入', removed: '移除', changed: '修改' }

const person = usePersonStore()
const modal = useModalStore()
type Field = { path: string; from: unknown; to: unknown; label?: string; item?: string }
type Row = { revision: number; at: number; combat: boolean; actors: Array<{ id: string; name: string; kind: string; fields: Field[] }> }
const rows = ref<Row[] | null>(null)
const onlyThis = ref(true)
onMounted(async () => { rows.value = await person.history() as Row[] })

const shown = computed(() => (rows.value ?? []).map((r, i) => ({ ...r, steps: i + 1, actors: onlyThis.value ? r.actors.filter((a) => a.id === person.id) : r.actors })).filter((r) => r.actors.length))
function fieldName(f: Field): string {
  if (f.label) return f.item ? `${f.item} · ${f.label}` : f.label
  const adj = /^adjustments\.(\w+)/.exec(f.path)
  return adj ? ADJUSTMENTS[adj[1]] ?? '个人调整' : '其他改动'
}
function value(v: unknown, f: Field): string {
  if (v === undefined || v === null || v === '') return '（无）'
  if (f.path === 'adjustments.category') return CATEGORIES.find((c) => c.id === v)?.label ?? String(v)
  if (typeof v === 'boolean') return v ? '是' : '否'
  if (typeof v === 'object') return '…'
  return String(v)
}
const time = (at: number): string => new Date(at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
async function undoTo(r: { revision: number; steps: number }): Promise<void> {
  const ok = await askConfirm({ title: '撤销到这里', message: `会撤销最近的 ${r.steps} 条改动（包括其他人物的），连同这一条。`, confirmLabel: `撤销 ${r.steps} 条` })
  if (!ok) return
  await person.undoTo(r.revision)
  modal.close()
}
</script>

<template>
  <div class="ps-drawer ps-history" data-testid="ps-drawer-history">
    <div class="ps-drawer-row"><span class="ps-drawer-label">只看这个人物</span><Switch v-model="onlyThis" label="只看这个人物" /></div>
    <p v-if="rows === null" class="ps-drawer-note">正在读取…</p>
    <p v-else-if="!shown.length" class="ps-drawer-note">还没有改动记录。</p>
    <ol v-else class="ps-history-list">
      <li v-for="r in shown" :key="r.revision" class="ps-history-row">
        <div class="ps-history-head">
<time>{{ time(r.at) }}</time>
          <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="person.readOnly" @click="undoTo(r)">撤销到这里</button>
</div>
        <div v-for="a in r.actors" :key="a.id" class="ps-history-actor">
          <b>{{ a.name }}</b> <span>{{ KIND[a.kind] ?? a.kind }}</span>
          <ul v-if="a.fields.length">
<li v-for="(f, i) in a.fields.slice(0, 6)" :key="i">{{ fieldName(f) }}：{{ value(f.from, f) }} → {{ value(f.to, f) }}</li>
            <li v-if="a.fields.length > 6">还有 {{ a.fields.length - 6 }} 处</li>
</ul>
        </div>
      </li>
    </ol>
  </div>
</template>

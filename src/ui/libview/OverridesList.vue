<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { EditRow } from '../../library/custom-edits'
import type { FieldChange } from '../../library/house-diff'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import Checkbox from '../kit/Checkbox.vue'
import Segmented from '../kit/Segmented.vue'
import SelectField from '../kit/SelectField.vue'
import { levelText as rawLevel } from './edit-rows'
import { useEditDiff } from './use-edit-diff'
import { houseOfRow, useVersionActions } from './use-version-actions'
import { NO_LEVEL, type VersionRow } from './version-rows'
import { valueText } from './value-text'

/**
 * P5.5 u7-14 房规（覆盖）列表：整个书架 / 一本书或一个包 / 单条，同一个列表，只是范围不同（Q14）。
 * 每行：条目 · 种类 · 改成谁 · 作用于（逐条改，含「不使用」）· [看改了什么] · [删除]（房规）；勾几条整批改作用于 / 删除房规。
 * 数据：custom.edits / packEdits（列）、library.editChanges（改了什么）；动作（改层、不使用、删房规）见 use-version-actions.ts。
 * 单条的版本管理在 VersionManage.vue（列出这一条的全部版本）。
 */
export type OverrideScope = { kind: 'all' } | { kind: 'sources'; sources: string[] } | { kind: 'pack'; codeSet: string; id: string }
const props = defineProps<{ scope: OverrideScope }>()
const app = useAppStore()
const lib = useLibViewStore()
type Row = EditRow & { picked: boolean; house?: VersionRow['house'] }
const rows = shallowRef<Row[] | null>(null)
const error = ref<string | null>(null)
const kind = ref('all')
const { open, diffs, toggle: toggleDiff, labelOf } = useEditDiff()
// 战役选书设置总是给（没打开战役时是默认的、本战役层为空）：后端要用它的规则判断哪一层生效
const c = computed(() => lib.campaignLib)
/** 层的叫法：规则层写规则名（规则登记表），不写编号。 */
const levelText = (l: string) => (l.startsWith('rule:') ? `规则：${app.svc().rules.get(l.slice(5))?.name ?? l.slice(5)}` : rawLevel(l))
const key = (r: EditRow) => `${r.level}|${r.ref.set}|${r.ref.prop}|${r.ref.hash}`

async function load(): Promise<void> {
  error.value = null
  try {
    const custom = app.svc().backend.library.custom
    const s = props.scope
    const list = s.kind === 'pack' ? await custom.packEdits(s.codeSet, s.id, c.value) : await custom.edits(s.kind === 'sources' ? { sources: s.sources } : {}, c.value)
    // 按书分组排一下（同一本里保持后端给的层的先后）；哪一份生效由后端标（active）
    rows.value = list.filter((r) => r.kind !== 'base').sort((a, b) => (a.source ?? '').localeCompare(b.source ?? '')).map((r) => ({ ...r, picked: false }))
  } catch (e) { console.error('[trpg-assistant] 读取覆盖列表失败', e); error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void load())
const shown = computed(() => (rows.value ?? []).filter((r) => kind.value === 'all' || (kind.value === 'house' ? r.kind === 'house' : r.kind !== 'house')))
const groups = computed(() => {
  const out = new Map<string, Row[]>()
  for (const r of shown.value) { const g = r.source ?? '其他'; out.set(g, [...(out.get(g) ?? []), r]) }
  return [...out]
})
const levels = computed(() => [...(lib.bound ? [{ value: 'campaign', label: '本战役' }] : []), ...(lib.campaignLib ? [{ value: `rule:${lib.campaignLib.rule}`, label: '当前规则' }] : []), { value: 'global', label: '全局（所有战役）' }, { value: NO_LEVEL, label: '不使用' }])
const bulk = ref(levels.value[levels.value.length - 2].value)
const kindText = (r: Row) => (r.kind === 'house' ? '房规' : r.kind === 'pack' ? '别的版本' : '其他')
const toText = (r: Row) => (r.kind === 'house' ? '你的房规' : r.kind === 'pack' ? '别的包里的那一份' : r.altId)

const { setLevel, removeHouse } = useVersionActions(() => load())
/** 房规的删除要后端的房规编号：行上没有，向后端要这一条的全部版本再对上。 */
async function removeRows(list: Row[]): Promise<void> {
  const c = lib.campaignLib
  if (!c) return
  const houses = list.filter((r) => r.kind === 'house')
  for (const r of houses) r.house ??= await houseOfRow(r, c, (cc, ref, o) => app.svc().backend.library.scoped.detail(cc, ref, o))
  // 房规已经不在了（以前删的，选用记录还留着）：这一行只剩一条选用记录，点删除就把它清掉
  const ghosts = houses.filter((r) => !r.house)
  if (ghosts.length) await setLevel(ghosts, NO_LEVEL)
  await removeHouse(houses.filter((r) => r.house))
}
const toggle = (r: Row) => toggleDiff(key(r), r)
const picked = computed(() => shown.value.filter((r) => r.picked))
function pickAll(v: boolean): void { rows.value = (rows.value ?? []).map((r) => (shown.value.includes(r) ? { ...r, picked: v } : r)) }
function pick(r: Row, v: boolean): void { rows.value = (rows.value ?? []).map((x) => (x === r ? { ...x, picked: v } : x)) }
defineExpose({ load })
</script>

<template>
  <div class="lib-stack" data-testid="overrides">
    <div v-if="error" class="lib-banner lib-banner--err"><span>覆盖列表没读出来：{{ error }}</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="load">重试</button></div>
    <div v-else-if="!rows" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
    <p v-else-if="!rows.length" class="lib-muted">没有房规，也没有选别的版本。</p>
    <template v-else>
      <p v-if="!lib.bound" class="lib-faint" style="margin: 0; font-size: 12px">现在没有打开战役：只列规则层和全局层的。</p>
      <div class="lib-filter" style="padding: 0">
        <Checkbox :model-value="!!shown.length && picked.length === shown.length" :indeterminate="!!picked.length && picked.length < shown.length" label="全选" @update:model-value="pickAll">全选</Checkbox>
        <Segmented v-model="kind" label="种类" :options="[{ value: 'all', label: '全部' }, { value: 'house', label: '房规' }, { value: 'pack', label: '别的版本' }]" />
        <span class="lib-end lib-inline"><span class="lib-muted" style="white-space: nowrap">选中的作用于</span><SelectField v-model="bulk" label="选中的作用于" :options="levels" /><button class="trpg-btn trpg-btn--small" type="button" :disabled="!picked.length" data-testid="overrides-apply" @click="setLevel(picked, bulk)">应用</button><button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" :disabled="!picked.some((r) => r.kind === 'house')" data-testid="overrides-delete" @click="removeRows(picked)">删除选中的房规</button></span>
      </div>
      <template v-for="[g, list] in groups" :key="g">
        <div v-if="g" class="lib-sec" style="padding: var(--sp-2) 0 0">{{ g }}</div>
        <ul class="lib-edits">
          <li v-for="r in list" :key="key(r)" class="lib-erow" data-testid="override-row">
            <div class="lib-erow__top">
              <Checkbox :model-value="r.picked" :label="`选择 ${r.name ?? ''}`" @update:model-value="(v: boolean) => pick(r, v)" />
              <span class="lib-erow__name">{{ r.name ?? '未知' }}</span>
              <span class="trpg-badge" :data-tone="r.kind === 'house' ? 'warn' : undefined">{{ kindText(r) }}</span>
              <span class="lib-erow__meta">改成 {{ toText(r) }} · 作用于{{ levelText(r.level) }}</span>
              <span class="lib-end lib-inline">
                <SelectField :model-value="r.level" :label="`${r.name ?? ''} 作用于`" :options="levels.some((l) => l.value === r.level) ? levels : [{ value: r.level, label: levelText(r.level) }, ...levels]" @update:model-value="(v) => v && v !== r.level && setLevel([r], v)" />
                <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="override-open" @click="toggle(r)">{{ open === key(r) ? '收起' : '看改了什么' }}</button>
                <button v-if="r.kind === 'house'" class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" data-testid="override-delete" @click="removeRows([r])">删除</button>
              </span>
            </div>
            <div v-if="open === key(r)" class="lib-erow__body" data-testid="override-diff">
              <div v-if="diffs[key(r)] === 'loading'" class="lib-skel" aria-busy="true"><i /></div>
              <span v-else-if="typeof diffs[key(r)] === 'string'" class="lib-muted">没比出来：{{ diffs[key(r)] }}</span>
              <template v-else>
                <span class="lib-muted" style="font-size: 12px">和原件比：</span>
                <p v-if="!(diffs[key(r)] as FieldChange[]).length" class="lib-muted" style="margin: 0">和原件一样。</p>
                <ul v-else class="lib-diff"><li v-for="d in (diffs[key(r)] as FieldChange[])" :key="d.field"><code>{{ labelOf(r, d.field) }}</code><span><s v-if="d.before !== undefined">{{ valueText(d.before) }}</s>{{ d.before !== undefined ? ' → ' : '' }}{{ valueText(d.after) }}</span></li></ul>
              </template>
            </div>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

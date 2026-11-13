<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { EditLevel, EditRow } from '../../library/custom-edits'
import type { FieldChange } from '../../library/house-diff'
import { getSource } from '../../library/sources'
import type { EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import SelectField from '../kit/SelectField.vue'
import { levelText as rawLevel, restoreRows } from './edit-rows'
import { valueText } from './value-text'

/**
 * P5.5 u7-14 房规（覆盖）列表：整个书架 / 一本书或一个包 / 单条，同一个列表，只是范围不同（Q14）。
 * 每行：条目 · 种类 · 改成谁 · 作用于（逐条改）· [看改了什么] · [复原]；勾几条整批改作用于。单条时按层（本战役 → 规则 → 全局）标出生效的那一份。
 * 数据：custom.edits / packEdits（列）、moveEdits（改层）、library.editChanges（改了什么）、scoped.choose（复原）。
 */
export type OverrideScope = { kind: 'all' } | { kind: 'sources'; sources: string[] } | { kind: 'pack'; codeSet: string; id: string } | { kind: 'refs'; refs: EntryRef[] }
const props = defineProps<{ scope: OverrideScope }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
type Row = EditRow & { picked: boolean }
const rows = shallowRef<Row[] | null>(null)
const error = ref<string | null>(null)
const kind = ref('all')
const open = ref<string | null>(null)
const diffs = shallowRef<Record<string, FieldChange[] | 'loading' | string>>({})
const labels = shallowRef<Record<string, Record<string, string>>>({})
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
    const list = s.kind === 'pack' ? await custom.packEdits(s.codeSet, s.id, c.value) : await custom.edits(s.kind === 'sources' ? { sources: s.sources } : s.kind === 'refs' ? { refs: s.refs } : {}, c.value)
    // 按书分组排一下（同一本里保持后端给的层的先后）；哪一份生效由后端标（active）
    rows.value = list.filter((r) => r.kind !== 'base').sort((a, b) => (a.source ?? '').localeCompare(b.source ?? '')).map((r) => ({ ...r, picked: false }))
  } catch (e) { console.error('[trpg-assistant] 读取覆盖列表失败', e); error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void load())
const shown = computed(() => (rows.value ?? []).filter((r) => kind.value === 'all' || (kind.value === 'house' ? r.kind === 'house' : r.kind !== 'house')))
const groups = computed(() => {
  const out = new Map<string, Row[]>()
  for (const r of shown.value) { const g = props.scope.kind === 'refs' ? '' : r.source ?? '其他'; out.set(g, [...(out.get(g) ?? []), r]) }
  return [...out]
})
const offText = (r: Row) => (r.inactive === 'other-rule' ? '（属于别的规则，这个战役用不上）' : '（被上面那层盖住，现在不生效）')
const levels = computed(() => [...(lib.bound ? [{ value: 'campaign', label: '本战役' }] : []), ...(lib.campaignLib ? [{ value: `rule:${lib.campaignLib.rule}`, label: '当前规则' }] : []), { value: 'global', label: '全局（所有战役）' }])
const bulk = ref(levels.value[levels.value.length - 1].value)
const kindText = (r: Row) => (r.kind === 'house' ? '房规' : r.kind === 'pack' ? '别的版本' : '其他')
const toText = (r: Row) => (r.kind === 'house' ? '你的房规' : r.kind === 'pack' ? '别的包里的那一份' : r.altId)

async function writeBack(next: NonNullable<typeof lib.campaignLib>): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (lib.bound && owner) { const ks = app.svc().backend.kernelSave; await ks.setLibrary(owner, { ...(await ks.libraryOf(owner)), choices: next.choices }) }
  await lib.refresh(app.svc())
}
async function move(list: Row[], to: string): Promise<void> {
  const cur = lib.campaignLib
  if (!cur || !list.length) return
  try {
    await writeBack(await app.svc().backend.library.custom.moveEdits(cur, list, to as EditLevel))
    toast.success(`已改成作用于${levelText(to)}`)
    await load()
  } catch (e) { console.error('[trpg-assistant] 改作用范围失败', e); toast.error(e instanceof Error ? e.message : '没有改成') }
}
async function restore(list: Row[]): Promise<void> {
  const cur = lib.campaignLib
  if (!cur || !list.length) return
  try {
    await restoreRows(app.svc(), cur, list.map((r) => ({ level: r.level, target: key(r), ref: r.ref, name: r.name ?? '', source: r.source, altId: r.altId, picked: true })), lib.bound ? campaign.owner?.ownerKey ?? null : null)
    await lib.refresh(app.svc())
    toast.success('已复原')
    await load()
  } catch (e) { console.error('[trpg-assistant] 复原失败', e); toast.error('复原没有成功') }
}
async function toggle(r: Row): Promise<void> {
  const k = key(r)
  open.value = open.value === k ? null : k
  if (open.value !== k || diffs.value[k]) return
  diffs.value = { ...diffs.value, [k]: 'loading' }
  const cs = getSource(r.ref.set).codeSet
  try {
    if (!labels.value[`${cs}|${r.ref.prop}`]) {
      const t = await app.svc().backend.library.custom.fields(cs, r.ref.prop)
      labels.value = { ...labels.value, [`${cs}|${r.ref.prop}`]: Object.fromEntries((t?.fields ?? []).map((f) => [f.name, f.label ?? f.name])) }
    }
    const cur = lib.campaignLib
    diffs.value = { ...diffs.value, [k]: cur ? (await app.svc().backend.library.editChanges(cur, r))?.changes ?? [] : [] }
  } catch (e) { diffs.value = { ...diffs.value, [k]: e instanceof Error ? e.message : String(e) } }
}
const labelOf = (r: Row, f: string) => labels.value[`${getSource(r.ref.set).codeSet}|${r.ref.prop}`]?.[f] ?? f
const picked = computed(() => shown.value.filter((r) => r.picked))
function pickAll(v: boolean): void { rows.value = (rows.value ?? []).map((r) => (shown.value.includes(r) ? { ...r, picked: v } : r)) }
function pick(r: Row, v: boolean): void { rows.value = (rows.value ?? []).map((x) => (x === r ? { ...x, picked: v } : x)) }
defineExpose({ load })
</script>

<template>
  <div class="lib-stack" data-testid="overrides">
    <div v-if="error" class="lib-banner lib-banner--err"><span>覆盖列表没读出来：{{ error }}</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="load">重试</button></div>
    <div v-else-if="!rows" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
    <p v-else-if="!rows.length" class="lib-muted">{{ scope.kind === 'refs' ? '这一条在哪一层都没有改，用的是原件。' : '没有房规，也没有选别的版本。' }}</p>
    <template v-else>
      <p v-if="!lib.bound" class="lib-faint" style="margin: 0; font-size: 12px">现在没有打开战役：只列规则层和全局层的。</p>
      <div class="lib-filter" style="padding: 0">
        <Checkbox :model-value="!!shown.length && picked.length === shown.length" :indeterminate="!!picked.length && picked.length < shown.length" label="全选" @update:model-value="pickAll">全选</Checkbox>
        <Segmented v-model="kind" label="种类" :options="[{ value: 'all', label: '全部' }, { value: 'house', label: '房规' }, { value: 'pack', label: '别的版本' }]" />
        <span class="lib-end lib-inline"><span class="lib-muted" style="white-space: nowrap">选中的作用于</span><SelectField v-model="bulk" label="选中的作用于" :options="levels" /><button class="trpg-btn trpg-btn--small" type="button" :disabled="!picked.length" data-testid="overrides-apply" @click="move(picked, bulk)">应用</button><button class="trpg-btn trpg-btn--small" type="button" :disabled="!picked.length" @click="restore(picked)">复原选中的</button></span>
      </div>
      <template v-for="[g, list] in groups" :key="g">
        <div v-if="g" class="lib-sec" style="padding: var(--sp-2) 0 0">{{ g }}</div>
        <ul class="lib-edits">
          <li v-for="r in list" :key="key(r)" class="lib-erow" :data-off="scope.kind === 'refs' && !r.active ? 'true' : undefined" data-testid="override-row">
            <div class="lib-erow__top">
              <Checkbox :model-value="r.picked" :label="`选择 ${r.name ?? ''}`" @update:model-value="(v: boolean) => pick(r, v)" />
              <span class="lib-erow__name">{{ r.name ?? '未知' }}</span>
              <span class="trpg-badge" :data-tone="r.kind === 'house' ? 'warn' : undefined">{{ kindText(r) }}</span>
              <span v-if="scope.kind === 'refs' && r.active" class="trpg-badge" data-tone="success">生效中</span>
              <span class="lib-erow__meta">改成 {{ toText(r) }} · 作用于{{ levelText(r.level) }}{{ scope.kind === 'refs' && !r.active ? offText(r) : '' }}</span>
              <span class="lib-end lib-inline">
                <SelectField :model-value="r.level" :label="`${r.name ?? ''} 作用于`" :options="levels.some((l) => l.value === r.level) ? levels : [{ value: r.level, label: levelText(r.level) }, ...levels]" @update:model-value="(v) => v && v !== r.level && move([r], v)" />
                <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="override-open" @click="toggle(r)">{{ open === key(r) ? '收起' : '看改了什么' }}</button>
                <button class="trpg-btn trpg-btn--small" type="button" data-testid="override-restore" @click="restore([r])"><Icon name="arrow-counter-clockwise" :size="14" />复原</button>
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

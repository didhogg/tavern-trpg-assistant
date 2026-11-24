<script setup lang="ts">
// 人物的分组表（照搬 Tidy5e components/table-quadrone + shared/*Tables.svelte）：
//   组头（点了折叠 · 组名 · 条数 · 组头插槽（法术位）· 列名 · ＋ 新建这一类）→ 行（首字 · 名字 · 小字 · 列格 · 行按钮 · ⋯）→ 点名字展开说明与活动。
// 列 / 行按钮 / ⋯ 菜单都按登记（spec.ts、item-menu.ts）；窄时按 Tidy5e 的优先级先收次要列（看表格自己的宽度）。
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePersonStore } from '../../../stores/person'
import EntryPage from '../../libview/EntryPage.vue'
import Icon from '../../kit/Icon.vue'
import MoreMenu from '../../kit/MoreMenu.vue'
import Cell from './Cell.vue'
import { COLUMNS, ROW_ACTIONS, columnsFor, hiddenColumns, type ColKey, type Domain } from './spec'
import type { DocGroup, DocRow } from './rows'
import { useItemMenu } from './item-menu'

const props = withDefaults(defineProps<{
  domain: Domain
  groups: DocGroup[]
  /** 全部展开 / 收起（工具条给）：true = 组都展开且行说明也展开，false = 组都收起，null = 各自记。 */
  expand?: boolean | null
  /** 组头「＋」新建这一类（给了才显示）。 */
  creatable?: boolean
  testid?: string
}>(), { expand: null, creatable: false, testid: 'ps-table' })
const emit = defineEmits<{ create: [group: DocGroup]; section: [row: DocRow] }>()
const person = usePersonStore()
const menu = useItemMenu()
const ro = computed(() => person.readOnly)

const root = ref<HTMLElement | null>(null)
const width = ref(800)
let obs: ResizeObserver | null = null
onMounted(() => { if (!root.value) return; obs = new ResizeObserver((e) => { width.value = e[0].contentRect.width }); obs.observe(root.value); width.value = root.value.clientWidth })
onBeforeUnmount(() => obs?.disconnect())
const remPx = computed(() => root.value ? parseFloat(getComputedStyle(root.value).fontSize) || 16 : 16)

const collapsed = ref(new Set<string>())
const opened = ref(new Set<string>())
const openBoxes = ref(new Set<string>())
watch(() => props.expand, (v) => {
  if (v === true) { collapsed.value = new Set(); opened.value = new Set(props.groups.flatMap((g) => g.rows.map((r) => r.id))) }
  if (v === false) { collapsed.value = new Set(props.groups.map((g) => g.key)); opened.value = new Set() }
})
const toggle = (set: Set<string>, key: string): Set<string> => { const n = new Set(set); if (n.has(key)) n.delete(key); else n.add(key); return n }

/** 行按钮（每行 ⋯ 前面的小按钮）：照 row-actions 登记，只放这件物品适用的。 */
const acts = computed(() => ROW_ACTIONS[props.domain])
const shown = (r: DocRow, a: string): boolean => {
  const s = r.item?.system ?? {}
  if (a === 'equip') return 'equipped' in s
  if (a === 'attune') return !!s.attunement && s.identified !== false
  if (a === 'prepare') return !!r.ctx?.preparation?.applicable
  return false
}

const cols = (g: DocGroup) => {
  const spec = columnsFor(props.domain, g.type)
  // 行按钮占的宽度也要留出来
  const reserved = 2.5 + acts.value.filter((a) => a !== 'menu' && g.rows.some((r) => shown(r, a))).length * 1.9
  const hide = hiddenColumns(width.value, remPx.value, spec, reserved)
  return spec.sorted.filter((k) => !hide.has(k))
}
const rowsOf = (g: DocGroup): Array<DocRow & { depth: number }> => {
  const out: Array<DocRow & { depth: number }> = []
  const walk = (rs: DocRow[], depth: number): void => { for (const r of rs) { out.push({ ...r, depth }); if (r.children.length && openBoxes.value.has(r.id)) walk(r.children, depth + 1) } }
  walk(g.rows, 0)
  return out
}
function onMenu(r: DocRow, key: string): void {
  if (key === 'view') { opened.value = toggle(opened.value, r.id); return }
  if (key === 'section') { emit('section', r); return }
  menu.run(r, key)
}
const plain = (html: unknown): string => String(html ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim()
const colW = (k: ColKey): string => `${COLUMNS[k].rem}rem`
</script>

<template>
  <div ref="root" class="dt" :data-testid="testid">
    <section v-for="grp in groups" :key="grp.key" class="dt-grp" :data-collapsed="collapsed.has(grp.key) || undefined" :data-testid="`${testid}-${grp.key}`">
      <header class="dt-head">
        <button class="dt-fold" type="button" :aria-expanded="!collapsed.has(grp.key)" :aria-label="`${collapsed.has(grp.key) ? '展开' : '收起'}${grp.label}`" @click="collapsed = toggle(collapsed, grp.key)">
          <Icon name="caret-right" :size="12" /><b>{{ grp.label }}</b><small>{{ grp.rows.length }}</small>
        </button>
        <slot name="group" :group="grp" />
        <span class="dt-cols" aria-hidden="true">
          <span v-for="k in cols(grp)" :key="k" :style="{ width: colW(k) }">{{ COLUMNS[k].label }}</span>
          <span class="dt-acts-col" :style="{ width: `${(acts.length - 1) * 1.9 + 2.25}rem` }">
            <button v-if="creatable" class="dt-add" type="button" :disabled="ro" :aria-label="`新建${grp.label}`" @click="emit('create', grp)"><Icon name="plus" :size="14" /></button>
          </span>
        </span>
      </header>
      <ul v-if="!collapsed.has(grp.key)" class="dt-rows">
        <li v-for="r in rowsOf(grp)" :key="r.id" class="dt-row" :data-open="opened.has(r.id) || undefined" :data-depth="r.depth || undefined" data-testid="ps-row" :data-id="r.id">
          <div class="dt-main">
            <span v-if="r.depth" class="dt-indent" :style="{ width: `${r.depth * 1.25}rem` }" aria-hidden="true"><Icon name="arrow-elbow-down-right" :size="12" /></span>
            <button v-if="r.children.length" class="dt-box" type="button" :aria-expanded="openBoxes.has(r.id)" :aria-label="`${openBoxes.has(r.id) ? '收起' : '展开'}${r.name}里的东西`" @click="openBoxes = toggle(openBoxes, r.id)"><Icon name="caret-right" :size="12" /></button>
            <span v-else class="dt-initial" aria-hidden="true">{{ r.name.slice(0, 1) }}</span>
            <div class="dt-name">
              <button type="button" class="dt-title" :aria-expanded="opened.has(r.id)" @click="opened = toggle(opened, r.id)">{{ r.name }}<small v-if="Number(r.item?.system?.quantity) > 1" class="dt-qty">×{{ r.item.system.quantity }}</small></button>
              <small v-if="r.subtitle">{{ r.subtitle }}</small>
            </div>
            <span v-for="k in cols(grp)" :key="k" class="dt-cell" :style="{ width: colW(k) }" :data-col="k"><Cell :col="k" :row="r" /></span>
            <span class="dt-acts">
              <template v-for="a in acts" :key="a">
                <template v-if="a !== 'menu' && shown(r, a)">
                  <button v-if="a === 'equip'" class="dt-act" type="button" :data-on="r.item.system.equipped || undefined" :aria-pressed="!!r.item.system.equipped" :aria-label="r.item.system.equipped ? `卸下${r.name}` : `装备${r.name}`" :title="r.item.system.equipped ? '已装备（点了卸下）' : '未装备（点了装备）'" :disabled="ro" @click="menu.run(r, 'equip')"><Icon name="hand-fist" :size="15" /></button>
                  <button v-else-if="a === 'attune'" class="dt-act" type="button" :data-on="r.item.system.attuned || undefined" :aria-pressed="!!r.item.system.attuned" :aria-label="r.item.system.attuned ? `取消同调${r.name}` : `同调${r.name}`" :title="r.item.system.attuned ? '已同调（点了取消）' : '需要同调（点了同调）'" :disabled="ro" @click="menu.run(r, 'attune')"><Icon name="sun" :size="15" /></button>
                  <button v-else-if="a === 'prepare'" class="dt-act" type="button" :data-on="r.ctx.preparation.cls === 'active' || undefined" :aria-pressed="r.ctx.preparation.cls === 'active'" :aria-label="`${r.ctx.preparation.title}：${r.name}`" :title="r.ctx.preparation.title" :disabled="ro || r.ctx.preparation.disabled" @click="menu.run(r, 'prepare')"><Icon name="book-open-text" :size="15" /></button>
                </template>
                <span v-else-if="a !== 'menu'" class="dt-act-gap" aria-hidden="true" />
              </template>
              <MoreMenu :label="r.name" :items="menu.entries(r, { open: opened.has(r.id) })" @select="onMenu(r, $event)" />
            </span>
          </div>
          <div v-if="opened.has(r.id)" class="dt-detail">
            <EntryPage v-if="r.ref" :entry-ref="r.ref as never" body-only />
            <p v-else-if="plain(r.item?.system?.description?.value)" class="dt-desc">{{ plain(r.item.system.description.value) }}</p>
            <p v-else class="ps-drawer-note">这一项没有说明文字。</p>
            <ul v-if="Array.isArray(r.ctx?.activities) && r.ctx.activities.length" class="dt-activities" aria-label="活动">
              <li v-for="(a, i) in r.ctx.activities" :key="i"><b>{{ a.name }}</b><span v-if="a.labels?.activation">{{ a.labels.activation }}</span><span v-if="a.labels?.toHit">命中 {{ a.labels.toHit }}</span><span v-if="a.labels?.save">{{ a.labels.save }}</span><span v-if="a.labels?.range">{{ a.labels.range }}</span><span v-if="a.labels?.target">{{ a.labels.target }}</span></li>
            </ul>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

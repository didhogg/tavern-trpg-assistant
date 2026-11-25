<script setup lang="ts">
// 职业与出身的行（照 Tidy5e parts/ActorTraitClasses.svelte、traits/CharacterTraitSpecies.svelte、parts/ActorTraitBackground.svelte）。
//   职业行：名字（术语，点了看资料）· ♛ 原始职业 · 等级下拉（官方 availableLevels，驾驶员 11-25：等级直接用下拉选）· ⋯
//   子职业行 或「选子职业」（官方 needsSubclass）· 兼职 · 种族 / 背景行（术语 · ⋯ 换 / 编辑 / 删；没有 =「从库里选」「新建自定义」）。
// 点一行 = pick（职业与出身弹窗在右边显示这一行的资料 / 细节）；改等级 = level（弹窗右边走升级问答或降级确认）。
// 本组件只显示、只发事件；看资料、编辑、换、删照旧走统一入口（在当前弹窗里翻页）。界面只读官方显示数据。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import SelectField from '../kit/SelectField.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import { libraryRow, sameRef, subclassOf } from '../libview/usePickList'
import type { EntryRef } from '../../library/scopes'
import { openFields, openNewOwn, openPick } from './edit-open'
import { background, species } from './view'
import { classBuilds, originId, shownItemName, type ClassBuild } from './view-tabs'
import type { LevelRowShown } from './LevelParts.vue'

/** 选中的那一行（职业与出身弹窗里高亮）：class:编号 / sub:编号 / lvl:职业编号:等级 / race / background；levels = 每个职业下面列出各级（弹窗里用）。 */
const props = defineProps<{ selected?: string | null; levels?: boolean }>()
const emit = defineEmits<{ pick: [key: string]; level: [c: ClassBuild, delta: number] }>()
const person = usePersonStore()
const toast = useToastStore()
const s = computed(() => person.sheet!)
const ro = computed(() => person.readOnly)
const cls = computed(() => classBuilds(s.value))
const origins = computed(() => [
  { key: 'race' as const, kind: 'races' as const, label: '种族', row: species(s.value), id: originId(s.value, 'race') },
  { key: 'background' as const, kind: 'backgrounds' as const, label: '背景', row: background(s.value), id: originId(s.value, 'background') },
])
const view = (ref: unknown, name: string): void => { if (ref) openEntry(ref as never, name) }
const edit = (id: string, name: string): void => openFields(name, { itemId: id, path: 'system' }, { width: 680, itemName: name })
/** 每个职业（连子职业）各级得到了什么：一级一行，写授予的东西的名字（没有就写成长的标题）（后端读数 sheet.levels，已过显示出口）。 */
function levelLines(c: ClassBuild): Array<{ level: number; text: string }> {
  if (!props.levels) return []
  const ids = [c.id, c.subclass?.id].filter(Boolean)
  const rows = ((s.value.levels ?? []) as LevelRowShown[]).filter((r) => ids.includes(r.itemId) && r.level > 0)
  return [...new Set(rows.map((r) => r.level))].sort((a, b) => a - b).map((level) => ({
    level,
    text: rows.filter((r) => r.level === level).flatMap((r) => (r.items.length ? r.items.map((x) => shownItemName(s.value, x.id) ?? '') : [r.title ?? ''])).filter(Boolean).join('　'),
  }))
}
/** 原始职业（官方 system.details.originalClass，Tidy5e 标♛）。 */
const original = computed(() => String(s.value.system.details?.originalClass ?? ''))

/** 等级下拉：现在这一级 + 官方给的每一档（差几级）换成「几级」；超过总等级上限的官方标了不可选，这里不列。 */
// 值就用「第几级」（升完级当前值跟着变，下拉显示的字才会更新）
const levelOptions = (c: ClassBuild) => [0, ...c.levelsMenu.filter((o) => !o.disabled && o.delta).map((o) => o.delta)]
  .sort((a, b) => a - b).map((d) => ({ value: String(c.levels + d), label: `${c.levels + d} 级` }))
function pickLevel(c: ClassBuild, v: string | undefined): void { const d = Number(v) - c.levels; if (d) emit('level', c, d) }
/** 选 / 换子职业：只列这个职业的子职业（库里这个职业条目的名字 + 来源对上，同名的 PHB / XPHB 各归各的）；作者按这个职业现在的等级加，不再问等级。 */
async function pickSubclass(c: ClassBuild, replace?: { id: string; name: string }): Promise<void> {
  const row = c.ref ? await libraryRow(c.ref as EntryRef) : null
  if (!row) { toast.error(`${c.name}在本战役库里没有资料（自定义职业或包没开），列不出它的子职业`); return }
  openPick('subclasses', replace, (item) => subclassOf(item, row.item as Record<string, unknown>), `为${c.name}（${c.levels} 级）选子职业`)
}
/** 兼职：只列这个人还没有的职业（已有的职业升级用那一行的等级下拉）。作者从 1 级加、熟练按兼职给。 */
function multiclass(): void {
  openPick('classes', undefined, (_item, ref) => !cls.value.some((c) => sameRef(c.ref as EntryRef, ref)), '兼职：加一个新职业（从 1 级开始）')
}
const total = computed(() => cls.value.reduce((n, c) => n + c.levels, 0))
/** 编辑分两种（驾驶员 11-25 评测：分清改的是哪里）：改这张人物卡上的这一件 / 到库里打开原条目（条目页上的 ✎，自制直接改、官方改成房规）。 */
const editItems = (ref: unknown) => [
  { key: 'edit', label: '改这张人物卡上的', disabled: ro.value },
  { key: 'lib', label: '到库里编辑原条目', disabled: !ref },
]
const classMenu = (c: ClassBuild) => [
  { key: 'view', label: '看资料', disabled: !c.ref },
  ...editItems(c.ref),
  ...(original.value !== c.id && cls.value.length > 1 ? [{ key: 'original', label: '设为原始职业', disabled: ro.value }] : []),
  { key: 'remove', label: `删除这个职业（退回 ${c.levels} 级）`, danger: true, disabled: ro.value },
]
function onClass(c: ClassBuild, key: string): void {
  if (key === 'view' || key === 'lib') view(c.ref, c.name)
  else if (key === 'edit') edit(c.id, c.name)
  else if (key === 'original') void person.edit(`把${c.name}设为原始职业`, [{ kind: 'set', path: 'system.details.originalClass', value: c.id }])
  else if (key === 'remove') void person.remove(`删除了职业${c.name}`, c.id)
}
function onSub(c: ClassBuild, key: string): void {
  if (!c.subclass) return
  if (key === 'view' || key === 'lib') view(c.subclass.ref, c.subclass.name)
  else if (key === 'edit') edit(c.subclass.id, c.subclass.name)
  else if (key === 'change') void pickSubclass(c, { id: c.subclass.id, name: c.subclass.name })
  else if (key === 'remove') void person.remove(`删除了子职业${c.subclass.name}`, c.subclass.id)
}
type Origin = (typeof origins.value)[number]
const originMenu = (o: Origin) => [
  { key: 'view', label: '看资料', disabled: !o.row?.ref },
  ...editItems(o.row?.ref).map((x) => (x.key === 'edit' ? { ...x, disabled: x.disabled || !o.id } : x)),
  { key: 'change', label: `换${o.label}…`, disabled: ro.value },
  { key: 'remove', label: `删除${o.label}`, danger: true, disabled: ro.value || !o.id },
]
function onOrigin(o: Origin, key: string): void {
  if (key === 'view' || key === 'lib') view(o.row?.ref, o.row?.name ?? '')
  else if (key === 'edit' && o.id) edit(o.id, o.row?.name ?? o.label)
  else if (key === 'change') openPick(o.kind, o.id ? { id: o.id, name: o.row?.name ?? o.label } : undefined)
  else if (key === 'remove' && o.id) void person.remove(`删除了${o.label}${o.row?.name ?? ''}`, o.id)
}
</script>

<template>
  <div class="ps-build" data-testid="ps-build">
    <div v-if="!cls.length" class="ps-build-row" data-testid="ps-build-class-empty">
      <span class="ps-build-label">职业</span>
      <span class="ps-build-main">
        <span class="ps-build-adds">
          <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-build-add-class" @click="openPick('classes')"><Icon name="books" :size="14" />从库里选</button>
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-build-new-class" @click="openNewOwn('classes')"><Icon name="pencil-simple" :size="14" />新建自制</button>
        </span>
      </span>
      <span />
    </div>
    <template v-for="(c, i) in cls" :key="c.id">
      <div class="ps-build-row" data-testid="ps-build-class" :data-id="c.id" :data-picked="selected === `class:${c.id}` || undefined" @click="emit('pick', `class:${c.id}`)">
        <span class="ps-build-label">{{ i ? '' : '职业' }}</span>
        <span class="ps-build-main">
          <span class="ps-build-name"><Term v-if="c.ref" :label="`查看${c.name}`" @open="view(c.ref, c.name)">{{ c.name }}</Term><b v-else>{{ c.name }}</b><Icon v-if="original === c.id" name="crown" :size="13" class="ps-build-crown" title="原始职业" /></span>
          <span class="ps-build-level" @click.stop><SelectField :key="c.levels" :model-value="String(c.levels)" :options="levelOptions(c)" :label="`${c.name}改到几级`" :disabled="ro" data-testid="ps-build-level" @update:model-value="(v) => pickLevel(c, v)" /></span>
        </span>
        <span @click.stop><MoreMenu :label="c.name" :items="classMenu(c)" @select="onClass(c, $event)" /></span>
      </div>
      <div v-if="c.subclass" class="ps-build-row ps-build-sub" data-testid="ps-build-subclass" :data-picked="selected === `sub:${c.subclass.id}` || undefined" @click="emit('pick', `sub:${c.subclass.id}`)">
        <span class="ps-build-label" />
        <span class="ps-build-main"><Icon name="arrow-elbow-down-right" :size="13" class="ps-build-turn" />
          <Term v-if="c.subclass.ref" :label="`查看${c.subclass.name}`" @open="view(c.subclass.ref, c.subclass!.name)">{{ c.subclass.name }}</Term><span v-else>{{ c.subclass.name }}</span>
        </span>
        <span @click.stop><MoreMenu :label="c.subclass.name" :items="[{ key: 'view', label: '看资料', disabled: !c.subclass.ref }, ...editItems(c.subclass.ref), { key: 'change', label: '换子职业…', disabled: ro }, { key: 'remove', label: '删除子职业', danger: true, disabled: ro }]" @select="onSub(c, $event)" /></span>
      </div>
      <!-- 子职业 / 选子职业紧贴职业那一行（Tidy5e ActorTraitClasses 同样摆法），逐级行在后面 -->
      <div v-if="!c.subclass && c.needsSubclass" class="ps-build-row ps-build-sub" data-testid="ps-build-needs-sub">
        <span class="ps-build-label" />
        <span class="ps-build-main"><Icon name="arrow-elbow-down-right" :size="13" class="ps-build-turn" />
          <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-build-pick-sub" @click.stop="pickSubclass(c)">选子职业</button><small class="ps-build-note">{{ c.name }}到了可以选子职业的等级</small>
        </span>
        <span />
      </div>
      <div v-for="l in levelLines(c)" :key="l.level" class="ps-build-row ps-build-sub ps-build-lvl" data-testid="ps-build-lvl" :data-level="l.level" :data-picked="selected === `lvl:${c.id}:${l.level}` || undefined" @click="emit('pick', `lvl:${c.id}:${l.level}`)">
        <span class="ps-build-label" />
        <span class="ps-build-main"><b class="ps-build-lvl-n">{{ l.level }} 级</b><span class="ps-build-lvl-text">{{ l.text }}</span></span>
        <span />
      </div>
    </template>
    <div v-if="cls.length" class="ps-build-row ps-build-sub" data-testid="ps-build-class-add">
      <span class="ps-build-label" />
      <span class="ps-build-main">
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-build-multiclass" @click="multiclass()"><Icon name="plus" :size="13" />兼职：加一个新职业</button>
        <small class="ps-build-note" data-testid="ps-build-total">人物总等级 {{ total }} 级</small>
      </span>
      <span />
    </div>
    <div v-for="o in origins" :key="o.key" class="ps-build-row" :data-testid="`ps-build-${o.key}`" :data-picked="selected === o.key || undefined" @click="o.row && emit('pick', o.key)">
      <span class="ps-build-label">{{ o.label }}</span>
      <span class="ps-build-main">
        <template v-if="o.row"><Term v-if="o.row.ref" :label="`查看${o.row.name}`" @open="view(o.row!.ref, o.row!.name)">{{ o.row.name }}</Term><span v-else>{{ o.row.name }}</span></template>
        <template v-else>
          <span class="ps-build-adds">
            <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" :data-testid="`ps-build-pick-${o.key}`" @click="openPick(o.kind)"><Icon name="books" :size="14" />从库里选</button>
            <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" :data-testid="`ps-build-new-${o.key}`" @click="openNewOwn(o.kind)"><Icon name="pencil-simple" :size="14" />新建自制</button>
          </span>
        </template>
      </span>
      <span v-if="o.row" @click.stop><MoreMenu :label="o.label" :items="originMenu(o)" @select="onOrigin(o, $event)" /></span>
      <span v-else />
    </div>
  </div>
</template>

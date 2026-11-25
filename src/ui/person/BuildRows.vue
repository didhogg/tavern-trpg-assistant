<script setup lang="ts">
// 职业与出身的行（照 Tidy5e parts/ActorTraitClasses.svelte、traits/CharacterTraitSpecies.svelte、parts/ActorTraitBackground.svelte）。
//   职业行：名字（术语，点了看资料）· ♛ 原始职业 · 等级下拉（官方 availableLevels，驾驶员 11-25：等级直接用下拉选）· ⋯
//   子职业行 或「选子职业」（官方 needsSubclass）· 兼职 · 种族 / 背景行（术语 · ⋯ 换 / 编辑 / 删；没有 =「从库里选」「新建自定义」）。
// 点一行 = pick（职业与出身弹窗在右边显示这一行的资料 / 细节）；改等级 = level（弹窗右边走升级问答或降级确认）。
// 本组件只显示、只发事件；看资料、编辑、换、删照旧走统一入口（在当前弹窗里翻页）。界面只读官方显示数据。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import SelectField from '../kit/SelectField.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import { openFields, openPick } from './edit-open'
import { background, species } from './view'
import { classBuilds, originId, type ClassBuild } from './view-tabs'

/** 选中的那一行（职业与出身弹窗里高亮）：class:编号 / sub:编号 / race / background。 */
defineProps<{ selected?: string | null }>()
const emit = defineEmits<{ pick: [key: string]; level: [c: ClassBuild, delta: number] }>()
const person = usePersonStore()
const s = computed(() => person.sheet!)
const ro = computed(() => person.readOnly)
const cls = computed(() => classBuilds(s.value))
const origins = computed(() => [
  { key: 'race' as const, kind: 'races' as const, label: '种族', row: species(s.value), id: originId(s.value, 'race') },
  { key: 'background' as const, kind: 'backgrounds' as const, label: '背景', row: background(s.value), id: originId(s.value, 'background') },
])
const view = (ref: unknown, name: string): void => { if (ref) openEntry(ref as never, name) }
const edit = (id: string, name: string): void => openFields(name, { itemId: id, path: 'system' }, { width: 680, itemName: name })
/** 原始职业（官方 system.details.originalClass，Tidy5e 标♛）。 */
const original = computed(() => String(s.value.system.details?.originalClass ?? ''))
/** 新建自定义职业 / 种族 / 背景（Tidy5e AddCustomNamed = 官方 createItem({ type })）。 */
const createCustom = (type: string, label: string): void => { void person.create(`新建了自定义${label}`, [{ name: `新${label}`, type, flags: { 'tavern-trpg': { named: true } } }]) }

/** 等级下拉：现在这一级 + 官方给的每一档（差几级）换成「几级」；超过总等级上限的官方标了不可选，这里不列。 */
const levelOptions = (c: ClassBuild) => [0, ...c.levelsMenu.filter((o) => !o.disabled && o.delta).map((o) => o.delta)]
  .sort((a, b) => a - b).map((d) => ({ value: String(d), label: `${c.levels + d} 级` }))
function pickLevel(c: ClassBuild, v: string | undefined): void { const d = Number(v); if (d) emit('level', c, d) }
/** 选子职业：从库里只列这个职业的子职业（子职业条目记着所属职业的名字和来源，和库里职业条目同一套）。 */
function pickSubclass(c: ClassBuild): void {
  openPick('subclasses', undefined, (item) => String(item.className ?? '') === c.name && (!c.source || String(item.classSource ?? '').toLowerCase() === c.source.toLowerCase()))
}
const classMenu = (c: ClassBuild) => [
  { key: 'view', label: '看资料', disabled: !c.ref },
  { key: 'edit', label: '编辑', disabled: ro.value },
  ...(original.value !== c.id && cls.value.length > 1 ? [{ key: 'original', label: '设为原始职业', disabled: ro.value }] : []),
  { key: 'remove', label: `删除这个职业（退回 ${c.levels} 级）`, danger: true, disabled: ro.value },
]
function onClass(c: ClassBuild, key: string): void {
  if (key === 'view') view(c.ref, c.name)
  else if (key === 'edit') edit(c.id, c.name)
  else if (key === 'original') void person.edit(`把${c.name}设为原始职业`, [{ kind: 'set', path: 'system.details.originalClass', value: c.id }])
  else if (key === 'remove') void person.remove(`删除了职业${c.name}`, c.id)
}
function onSub(c: ClassBuild, key: string): void {
  if (!c.subclass) return
  if (key === 'view') view(c.subclass.ref, c.subclass.name)
  else if (key === 'edit') edit(c.subclass.id, c.subclass.name)
  else if (key === 'change') pickSubclass(c)
  else if (key === 'remove') void person.remove(`删除了子职业${c.subclass.name}`, c.subclass.id)
}
type Origin = (typeof origins.value)[number]
const originMenu = (o: Origin) => [
  { key: 'view', label: '看资料', disabled: !o.row?.ref },
  { key: 'edit', label: '编辑', disabled: ro.value || !o.id },
  { key: 'change', label: `换${o.label}…`, disabled: ro.value },
  { key: 'remove', label: `删除${o.label}`, danger: true, disabled: ro.value || !o.id },
]
function onOrigin(o: Origin, key: string): void {
  if (key === 'view') view(o.row?.ref, o.row?.name ?? '')
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
        <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-build-add-class" @click="openPick('classes')"><Icon name="plus" :size="14" />选职业</button>
        <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="ro" @click="createCustom('class', '职业')">新建自定义职业</button>
      </span>
      <span />
    </div>
    <template v-for="(c, i) in cls" :key="c.id">
      <div class="ps-build-row" data-testid="ps-build-class" :data-id="c.id" :data-picked="selected === `class:${c.id}` || undefined" @click="emit('pick', `class:${c.id}`)">
        <span class="ps-build-label">{{ i ? '' : '职业' }}</span>
        <span class="ps-build-main">
          <span class="ps-build-name"><Term v-if="c.ref" :label="`查看${c.name}`" @open="view(c.ref, c.name)">{{ c.name }}</Term><b v-else>{{ c.name }}</b><Icon v-if="original === c.id" name="crown" :size="13" class="ps-build-crown" title="原始职业" /></span>
          <span class="ps-build-level" @click.stop><SelectField :model-value="'0'" :options="levelOptions(c)" :label="`${c.name}改到几级`" :disabled="ro" data-testid="ps-build-level" @update:model-value="(v) => pickLevel(c, v)" /></span>
        </span>
        <span @click.stop><MoreMenu :label="c.name" :items="classMenu(c)" @select="onClass(c, $event)" /></span>
      </div>
      <div v-if="c.subclass" class="ps-build-row ps-build-sub" data-testid="ps-build-subclass" :data-picked="selected === `sub:${c.subclass.id}` || undefined" @click="emit('pick', `sub:${c.subclass.id}`)">
        <span class="ps-build-label" />
        <span class="ps-build-main"><Icon name="arrow-elbow-down-right" :size="13" class="ps-build-turn" />
          <Term v-if="c.subclass.ref" :label="`查看${c.subclass.name}`" @open="view(c.subclass.ref, c.subclass!.name)">{{ c.subclass.name }}</Term><span v-else>{{ c.subclass.name }}</span>
        </span>
        <span @click.stop><MoreMenu :label="c.subclass.name" :items="[{ key: 'view', label: '看资料', disabled: !c.subclass.ref }, { key: 'edit', label: '编辑', disabled: ro }, { key: 'change', label: '换子职业…', disabled: ro }, { key: 'remove', label: '删除子职业', danger: true, disabled: ro }]" @select="onSub(c, $event)" /></span>
      </div>
      <div v-else-if="c.needsSubclass" class="ps-build-row ps-build-sub" data-testid="ps-build-needs-sub">
        <span class="ps-build-label" />
        <span class="ps-build-main"><Icon name="arrow-elbow-down-right" :size="13" class="ps-build-turn" />
          <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-build-pick-sub" @click.stop="pickSubclass(c)">选子职业</button>
        </span>
        <span />
      </div>
    </template>
    <div v-if="cls.length" class="ps-build-row ps-build-sub" data-testid="ps-build-class-add">
      <span class="ps-build-label" />
      <span class="ps-build-main">
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-build-multiclass" @click="openPick('classes')"><Icon name="plus" :size="13" />兼职（再加一个职业）</button>
      </span>
      <span />
    </div>
    <div v-for="o in origins" :key="o.key" class="ps-build-row" :data-testid="`ps-build-${o.key}`" :data-picked="selected === o.key || undefined" @click="o.row && emit('pick', o.key)">
      <span class="ps-build-label">{{ o.label }}</span>
      <span class="ps-build-main">
        <template v-if="o.row"><Term v-if="o.row.ref" :label="`查看${o.row.name}`" @open="view(o.row!.ref, o.row!.name)">{{ o.row.name }}</Term><span v-else>{{ o.row.name }}</span></template>
        <template v-else>
          <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" :data-testid="`ps-build-pick-${o.key}`" @click="openPick(o.kind)"><Icon name="plus" :size="13" />选{{ o.label }}</button>
          <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="ro" @click="createCustom(o.key, o.label)">新建自定义{{ o.label }}</button>
        </template>
      </span>
      <span v-if="o.row" @click.stop><MoreMenu :label="o.label" :items="originMenu(o)" @select="onOrigin(o, $event)" /></span>
      <span v-else />
    </div>
  </div>
</template>

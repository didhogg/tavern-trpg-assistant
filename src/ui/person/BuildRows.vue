<script setup lang="ts">
// 特质卡上半：职业 · 子职业 · 种族 · 背景（照 Tidy5e parts/ActorTraitClasses.svelte、traits/CharacterTraitSpecies.svelte、parts/ActorTraitBackground.svelte）。
//   职业行：名字（看资料）· 等级菜单（官方 availableLevels：降级 = 官方 forLevelChange）· 升级（作者「导入到人物」：选到第几级，要做的选择一题一题问）· ⋯
//   子职业行 或「选子职业」（官方 needsSubclass；从库里只列这个职业的子职业）· 兼职（从库里加职业）· 种族 / 背景行（看资料 · ⋯ 换 / 删；没有 =「从库里选」）。
// 加 / 换 / 升级都走同一个问答页（ask/ImportAsk.vue，作者整路：特性、熟练、装备随条目一起来）；写入只调人物 store 现成动作，界面只读官方显示数据。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import { openFields, openImport, openPick } from './edit-open'
import { background, species } from './view'
import { classBuilds, originId, type ClassBuild } from './view-tabs'

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

/** 等级菜单：官方给的每一档（差几级），超过总等级上限的官方标了不可选。 */
const levelItems = (c: ClassBuild) => c.levelsMenu.filter((o) => o.delta).map((o) => ({ key: String(o.delta), label: `改到 ${c.levels + o.delta} 级（${o.delta > 0 ? '+' : ''}${o.delta}）`, disabled: ro.value || o.disabled }))
const canUp = (c: ClassBuild): boolean => !!c.ref && c.levelsMenu.some((o) => o.delta === 1 && !o.disabled)
/** 升级 = 作者「导入到人物」同一个职业（第一题选到第几级，要做的选择一题一题问）；降级 = 官方 forLevelChange（退回成长，不用选）。 */
function setLevel(c: ClassBuild, delta: number): void {
  if (delta > 0 && c.ref) openImport(c.ref, c.name, `${c.name}升级`)
  else if (delta < 0) void person.level(`${c.name}降到 ${c.levels + delta} 级`, c.id, delta)
}
/** 选子职业：从库里只列这个职业的子职业（子职业条目记着所属职业的名字和来源，和库里职业条目同一套）。 */
function pickSubclass(c: ClassBuild): void {
  openPick('subclasses', undefined, (item) => String(item.className ?? '') === c.name && (!c.source || String(item.classSource ?? '').toLowerCase() === c.source.toLowerCase()))
}
const classMenu = (c: ClassBuild) => [
  { key: 'view', label: '看资料', disabled: !c.ref },
  { key: 'edit', label: '编辑', disabled: ro.value },
  { key: 'remove', label: `删除这个职业（退回 ${c.levels} 级）`, danger: true, disabled: ro.value },
]
function onClass(c: ClassBuild, key: string): void {
  if (key === 'view') view(c.ref, c.name)
  else if (key === 'edit') edit(c.id, c.name)
  else if (key === 'remove') void person.remove(`删除了职业${c.name}`, c.id)
}
function onSub(c: ClassBuild, key: string): void {
  if (!c.subclass) return
  if (key === 'view') view(c.subclass.ref, c.subclass.name)
  else if (key === 'edit') edit(c.subclass.id, c.subclass.name)
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
      <div class="ps-build-row" data-testid="ps-build-class" :data-id="c.id">
        <span class="ps-build-label">{{ i ? '' : '职业' }}</span>
        <span class="ps-build-main">
          <span class="ps-build-name"><Term v-if="c.ref" :label="`查看${c.name}`" @open="view(c.ref, c.name)">{{ c.name }}</Term><b v-else>{{ c.name }}</b><Icon v-if="original === c.id" name="crown" :size="13" class="ps-build-crown" title="原始职业" /></span>
          <span class="ps-build-level"><MoreMenu :label="`${c.name}改到几级`" :text="`${c.levels} 级`" :items="levelItems(c)" @select="(k) => setLevel(c, Number(k))" /></span>
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro || !canUp(c)" :aria-label="`${c.name}升一级`" data-testid="ps-build-up" @click="setLevel(c, 1)"><Icon name="arrow-fat-up" :size="13" />升一级</button>
        </span>
        <MoreMenu :label="c.name" :items="classMenu(c)" @select="onClass(c, $event)" />
      </div>
      <div v-if="c.subclass" class="ps-build-row ps-build-sub" data-testid="ps-build-subclass">
        <span class="ps-build-label" />
        <span class="ps-build-main"><Icon name="arrow-elbow-down-right" :size="13" class="ps-build-turn" />
          <Term v-if="c.subclass.ref" :label="`查看${c.subclass.name}`" @open="view(c.subclass.ref, c.subclass!.name)">{{ c.subclass.name }}</Term><span v-else>{{ c.subclass.name }}</span>
        </span>
        <MoreMenu :label="c.subclass.name" :items="[{ key: 'view', label: '看资料', disabled: !c.subclass.ref }, { key: 'edit', label: '编辑', disabled: ro }, { key: 'remove', label: '删除子职业', danger: true, disabled: ro }]" @select="onSub(c, $event)" />
      </div>
      <div v-else-if="c.needsSubclass" class="ps-build-row ps-build-sub" data-testid="ps-build-needs-sub">
        <span class="ps-build-label" />
        <span class="ps-build-main"><Icon name="arrow-elbow-down-right" :size="13" class="ps-build-turn" />
          <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-build-pick-sub" @click="pickSubclass(c)">选子职业</button>
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
    <div v-for="o in origins" :key="o.key" class="ps-build-row" :data-testid="`ps-build-${o.key}`">
      <span class="ps-build-label">{{ o.label }}</span>
      <span class="ps-build-main">
        <template v-if="o.row"><Term v-if="o.row.ref" :label="`查看${o.row.name}`" @open="view(o.row!.ref, o.row!.name)">{{ o.row.name }}</Term><span v-else>{{ o.row.name }}</span></template>
        <template v-else>
          <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" :data-testid="`ps-build-pick-${o.key}`" @click="openPick(o.kind)"><Icon name="plus" :size="13" />选{{ o.label }}</button>
          <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="ro" @click="createCustom(o.key, o.label)">新建自定义{{ o.label }}</button>
        </template>
      </span>
      <MoreMenu v-if="o.row" :label="o.label" :items="originMenu(o)" @select="onOrigin(o, $event)" />
      <span v-else />
    </div>
  </div>
</template>

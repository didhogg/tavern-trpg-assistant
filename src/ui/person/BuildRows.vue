<script setup lang="ts">
// 特质卡上半：职业 · 子职业 · 种族 · 背景（照 Tidy5e parts/ActorTraitClasses.svelte、traits/CharacterTraitSpecies.svelte、parts/ActorTraitBackground.svelte）。
//   职业行：名字（看资料）· 等级菜单（官方 availableLevels：改到几级 = 官方 forLevelChange）· 升一级 · ⋯（看资料 / 用建卡器做选择 / 删除）
//   子职业行 或「选子职业」（官方 needsSubclass）· 加职业（建卡器兼职 / 从库里加）· 种族 / 背景行（看资料 · ⋯ 换 / 删；没有 =「从库里选」）。
// 写入只调人物 store 现成动作（level / remove / 选库条目页 / 作者建卡器），界面只读官方显示数据。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import { openLevel, openPick } from './edit-open'
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

/** 等级菜单：官方给的每一档（差几级），超过总等级上限的官方标了不可选。 */
const levelItems = (c: ClassBuild) => c.levelsMenu.filter((o) => o.delta).map((o) => ({ key: String(o.delta), label: `改到 ${c.levels + o.delta} 级（${o.delta > 0 ? '+' : ''}${o.delta}）`, disabled: ro.value || o.disabled }))
const canUp = (c: ClassBuild): boolean => c.levelsMenu.some((o) => o.delta === 1 && !o.disabled)
function setLevel(c: ClassBuild, delta: number): void {
  if (delta) void person.level(`${c.name}${delta > 0 ? '升' : '降'}到 ${c.levels + delta} 级`, c.id, delta)
}
const classMenu = (c: ClassBuild) => [
  { key: 'view', label: '看资料', disabled: !c.ref },
  { key: 'native', label: '用建卡器升级 / 做选择…', disabled: ro.value },
  { key: 'remove', label: `删除这个职业（退回 ${c.levels} 级）`, danger: true, disabled: ro.value },
]
function onClass(c: ClassBuild, key: string): void {
  if (key === 'view') view(c.ref, c.name)
  else if (key === 'native') openLevel('用建卡器升级 / 兼职')
  else if (key === 'remove') void person.remove(`删除了职业${c.name}`, c.id)
}
function onSub(c: ClassBuild, key: string): void {
  if (!c.subclass) return
  if (key === 'view') view(c.subclass.ref, c.subclass.name)
  else if (key === 'remove') void person.remove(`删除了子职业${c.subclass.name}`, c.subclass.id)
}
type Origin = (typeof origins.value)[number]
const originMenu = (o: Origin) => [
  { key: 'view', label: '看资料', disabled: !o.row?.ref },
  { key: 'change', label: `换${o.label}…`, disabled: ro.value },
  { key: 'remove', label: `删除${o.label}`, danger: true, disabled: ro.value || !o.id },
]
function onOrigin(o: Origin, key: string): void {
  if (key === 'view') view(o.row?.ref, o.row?.name ?? '')
  else if (key === 'change') openPick(o.kind, o.id ? { id: o.id, name: o.row?.name ?? o.label } : undefined)
  else if (key === 'remove' && o.id) void person.remove(`删除了${o.label}${o.row?.name ?? ''}`, o.id)
}
</script>

<template>
  <div class="ps-build" data-testid="ps-build">
    <div v-if="!cls.length" class="ps-build-row" data-testid="ps-build-class-empty">
      <span class="ps-build-label">职业</span>
      <span class="ps-build-main">
        <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" @click="openLevel('用建卡器建这个人')"><Icon name="plus" :size="14" />用建卡器选职业…</button>
        <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="ro" @click="openPick('classes')">从库里加职业</button>
      </span>
      <span />
    </div>
    <template v-for="(c, i) in cls" :key="c.id">
      <div class="ps-build-row" data-testid="ps-build-class" :data-id="c.id">
        <span class="ps-build-label">{{ i ? '' : '职业' }}</span>
        <span class="ps-build-main">
          <span class="ps-build-name"><Term v-if="c.ref" :label="`查看${c.name}`" @open="view(c.ref, c.name)">{{ c.name }}</Term><b v-else>{{ c.name }}</b></span>
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
        <MoreMenu :label="c.subclass.name" :items="[{ key: 'view', label: '看资料', disabled: !c.subclass.ref }, { key: 'remove', label: '删除子职业', danger: true, disabled: ro }]" @select="onSub(c, $event)" />
      </div>
      <div v-else-if="c.needsSubclass" class="ps-build-row ps-build-sub" data-testid="ps-build-needs-sub">
        <span class="ps-build-label" />
        <span class="ps-build-main"><Icon name="arrow-elbow-down-right" :size="13" class="ps-build-turn" />
          <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" @click="openLevel('用建卡器选子职业')">选子职业…</button>
        </span>
        <span />
      </div>
    </template>
    <div v-if="cls.length" class="ps-build-row ps-build-sub" data-testid="ps-build-class-add">
      <span class="ps-build-label" />
      <span class="ps-build-main">
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" @click="openLevel('用建卡器兼职')"><Icon name="plus" :size="13" />兼职…</button>
        <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="ro" @click="openPick('classes')">从库里加职业（不带特性）</button>
      </span>
      <span />
    </div>
    <div v-for="o in origins" :key="o.key" class="ps-build-row" :data-testid="`ps-build-${o.key}`">
      <span class="ps-build-label">{{ o.label }}</span>
      <span class="ps-build-main">
        <template v-if="o.row"><Term v-if="o.row.ref" :label="`查看${o.row.name}`" @open="view(o.row!.ref, o.row!.name)">{{ o.row.name }}</Term><span v-else>{{ o.row.name }}</span></template>
        <button v-else class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" @click="openPick(o.kind)"><Icon name="plus" :size="13" />从库里选{{ o.label }}</button>
      </span>
      <MoreMenu v-if="o.row" :label="o.label" :items="originMenu(o)" @select="onOrigin(o, $event)" />
      <span v-else />
    </div>
  </div>
</template>

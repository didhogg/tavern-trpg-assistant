<script setup lang="ts">
// 技能 / 工具熟练的一张表（侧栏和属性页共用；照 Tidy5e parts/skills/SkillsCard.svelte、ToolsCard.svelte）：
//   熟练圈（ProficiencyCycle：点 = 无 → 半 → 熟 → 专，右键倒退，写 system.skills|tools.键.value）· 关联属性（点了换，写 .ability）
//   · 名字 · 加值 · 被动 · 悬停出现 ★ 收藏 / ⚙ 设置（官方字段）。数全取官方显示数据；点名字掷骰 = P7。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import { openFields } from './edit-open'
import { named, signed, type skills } from './view'

const props = defineProps<{ rows: ReturnType<typeof skills>; passive?: boolean; testid?: string; kind?: 'skills' | 'tools' }>()
const person = usePersonStore()
const ro = computed(() => person.readOnly)
const kind = computed(() => props.kind ?? 'skills')
/** 技能 / 工具熟练的四档（Tidy5e skillToolValues）。 */
const STEPS = [0, 0.5, 1, 2]
const PROF = (p: number): string => (p >= 2 ? '◉' : p >= 1 ? '●' : p > 0 ? '◐' : '○')
/** 存的熟练档（官方 source.value；显示的 proficient 可能被效果改过）。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明
const stored = (k: any): number => Number(k.source?.value ?? k.value ?? k.proficient ?? 0)
function cycle(k: ReturnType<typeof skills>[number], up: boolean): void {
  const i = Math.max(0, STEPS.indexOf(stored(k)))
  const next = STEPS[(i + (up ? 1 : STEPS.length - 1)) % STEPS.length]
  void person.edit(`${k.label}熟练改为${next === 2 ? '专精' : next === 1 ? '熟练' : next ? '半熟练' : '无'}`, [{ kind: 'set', path: `system.${kind.value}.${k.key}.value`, value: next }])
}
const abilities = computed(() => Object.keys(person.glossary?.tables.abilities ?? {}).map((a) => ({ key: a, label: named(person.glossary, 'abilities', a) })))
const setAbility = (k: ReturnType<typeof skills>[number], a: string): void => { void person.edit(`${k.label}改用${named(person.glossary, 'abilities', a)}`, [{ kind: 'set', path: `system.${kind.value}.${k.key}.ability`, value: a }]) }
/** 官方收藏（system.favorites）：技能 = { type: 'skill', id: 键 }，工具 = { type: 'tool', id: 键 }。 */
const favType = computed(() => (kind.value === 'skills' ? 'skill' : 'tool'))
const favs = computed<Array<{ type: string; id: string; sort?: number }>>(() => (person.sheet?.system.favorites ?? []) as never)
const isFav = (key: string): boolean => favs.value.some((f) => f.type === favType.value && f.id === key)
function toggleFav(k: ReturnType<typeof skills>[number]): void {
  const next = isFav(k.key) ? favs.value.filter((f) => !(f.type === favType.value && f.id === k.key)) : [...favs.value, { type: favType.value, id: k.key, sort: (favs.value.length + 1) * 100000 }]
  void person.edit(isFav(k.key) ? `取消收藏${k.label}` : `收藏了${k.label}`, [{ kind: 'set', path: 'system.favorites', value: next }])
}
const configure = (k: ReturnType<typeof skills>[number]): void => openFields(`${k.label}设置`, { path: `system.${kind.value}.${k.key}` }, { hint: '关联属性、熟练档、检定 / 被动加值。' })
</script>

<template>
  <ul class="ps-skills" :data-testid="testid">
    <li v-for="k in rows" :key="k.key" :title="k.hover" :data-key="k.key">
      <button class="ps-prof ps-prof-btn" type="button" :data-level="k.proficient" :disabled="ro" :aria-label="`${k.label}：${k.hover}（点了换熟练档）`" :data-testid="`ps-prof-${k.key}`" @click="cycle(k, true)" @contextmenu.prevent="cycle(k, false)">{{ PROF(k.proficient) }}</button>
      <span class="ps-skill-ab"><MoreMenu :label="`${k.label}的关联属性`" :text="named(person.glossary, 'abilities', k.baseAbility)" :items="abilities.map((a) => ({ key: a.key, label: a.label, disabled: ro }))" @select="(a) => setAbility(k, a)" /></span>
      <span class="ps-skill-name">{{ k.label }}</span>
      <b>{{ signed(k.total) }}</b>
      <span class="ps-skill-aux">
        <button class="ps-skill-icon" type="button" :data-on="isFav(k.key) || undefined" :aria-label="isFav(k.key) ? `取消收藏${k.label}` : `收藏${k.label}`" :disabled="ro" @click="toggleFav(k)"><Icon :name="isFav(k.key) ? 'star-fill' : 'star'" :size="12" /></button>
        <button class="ps-skill-icon" type="button" :aria-label="`${k.label}设置`" :disabled="ro" @click="configure(k)"><Icon name="gear" :size="12" /></button>
      </span>
      <small>{{ passive === false ? '' : k.passive }}</small>
    </li>
  </ul>
</template>

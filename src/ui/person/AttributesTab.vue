<script setup lang="ts">
// 属性页（照 Tidy5e tabs/CharacterAttributesTab.svelte）：左 技能卡 + 工具卡（SkillList：熟练圈 · 属性 · ★ ⚙）；
// 右 豁免卡（SavingThrowsCard：每项熟练开关 · ⚙ 属性设置；专注豁免行 + 专注中）+ 特质卡（CharacterTraits：职业 / 子职业 / 种族 / 背景 · 特质各组 · 全局加值）。
// 数全取官方显示数据；写入经人物 store；点名字掷骰 = P7。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import SkillList from './SkillList.vue'
import BuildRows from './BuildRows.vue'
import { openFields } from './edit-open'
import { isNpc, named, signed, skills, tools, traits } from './view'

const person = usePersonStore()
const s = computed(() => person.sheet!)
const g = computed(() => person.glossary)
const ro = computed(() => person.readOnly)
const skillRows = computed(() => skills(s.value))
const toolRows = computed(() => tools(s.value))
const traitRows = computed(() => traits(s.value, g.value))
const saves = computed(() => Object.keys(g.value?.tables.abilities ?? {}).filter((k) => s.value.system.abilities?.[k]).map((k) => {
  const a = s.value.system.abilities[k]
  return { key: k, label: named(g.value, 'abilities', k), save: a.save?.value ?? a.save, proficient: Number(a.proficient ?? 0) }
}))
const concentration = computed(() => s.value.system.attributes?.concentration?.save)
/* eslint-disable @typescript-eslint/no-explicit-any -- 人物效果数据没有类型声明 */
const concEffects = computed(() => ((s.value.effects ?? []) as any[]).filter((e) => (e.statuses ?? []).includes('concentrating') && !e.disabled))
const toolNames = computed(() => Object.fromEntries(toolRows.value.map((k) => [k.key, k.label])))
/** 豁免熟练开关（Tidy5e ProficiencyCycle type=ability：0 ↔ 1，写 system.abilities.键.proficient）。 */
const toggleSave = (k: string, label: string, on: number): void => { void person.edit(`${label}豁免${on ? '取消熟练' : '熟练'}`, [{ kind: 'set', path: `system.abilities.${k}.proficient`, value: on ? 0 : 1 }]) }
const breakConc = (): void => { void person.edit('打断专注', concEffects.value.map((e) => ({ kind: 'effectDelete' as const, effectId: String(e._id ?? e.id) }))) }
/** 特质各组的设置（官方字段）：组键 → 人物字段路径。 */
const TRAIT_PATHS: Record<string, string> = { languages: 'system.traits.languages', armor: 'system.traits.armorProf', weapon: 'system.traits.weaponProf', dr: 'system.traits.dr', di: 'system.traits.di', dv: 'system.traits.dv', dm: 'system.traits.dm', ci: 'system.traits.ci', senses: 'system.attributes.senses', size: 'system.traits.size' }
const editTrait = (key: string, label: string): void => openFields(label, { path: TRAIT_PATHS[key] ?? 'system.traits' })
</script>

<template>
  <div class="ps-attr" data-testid="ps-attr">
    <div class="ps-attr-col">
      <section class="ps-card" data-testid="ps-attr-skills">
        <h3>技能</h3>
        <p v-if="!skillRows.length" class="ps-drawer-note">没有列出的技能。</p>
        <SkillList v-else :rows="skillRows" kind="skills" />
      </section>
      <section class="ps-card" data-testid="ps-attr-tools">
        <button class="ps-pen" type="button" aria-label="改工具熟练" :disabled="ro" @click="openFields('工具熟练', { path: 'system.tools' }, { names: toolNames, hint: '工具物品在背包「工具」；这里是会不会用、熟练到什么程度。' })"><Icon name="gear" :size="14" /></button>
        <h3>工具熟练</h3>
        <p v-if="!toolRows.length" class="ps-drawer-note">没有工具熟练。</p>
        <SkillList v-if="toolRows.length" :rows="toolRows" :passive="false" kind="tools" />
      </section>
    </div>
    <div class="ps-attr-col">
      <section class="ps-card" data-testid="ps-attr-saves">
        <h3>豁免</h3>
        <ul class="ps-saves">
          <li v-for="v in saves" :key="v.key">
            <button class="ps-prof ps-prof-btn" type="button" :data-level="v.proficient" :disabled="ro" :aria-label="`${v.label}豁免${v.proficient ? '熟练（点了取消）' : '不熟练（点了设为熟练）'}`" :data-testid="`ps-save-prof-${v.key}`" @click="toggleSave(v.key, v.label, v.proficient)">{{ v.proficient ? '●' : '○' }}</button>
            <span class="ps-save-name">{{ v.label }}</span><b>{{ signed(v.save) }}</b>
            <button class="ps-skill-icon" type="button" :aria-label="`${v.label}设置`" :disabled="ro" @click="openFields(v.label, { path: `system.abilities.${v.key}` })"><Icon name="gear" :size="12" /></button>
          </li>
          <li v-if="concentration !== undefined && concentration !== null" class="ps-saves-wide">
            <button v-if="concEffects.length" class="ps-conc-on" type="button" :disabled="ro" title="专注中（点了打断专注）" data-testid="ps-attr-conc-break" @click="breakConc"><Icon name="sparkle" :size="12" /></button>
            <span v-else class="ps-prof" />
            <span class="ps-save-name">专注</span><b>{{ signed(concentration) }}</b>
            <button class="ps-skill-icon" type="button" aria-label="专注设置" :disabled="ro" @click="openFields('专注', { path: 'system.attributes.concentration' })"><Icon name="gear" :size="12" /></button>
          </li>
        </ul>
      </section>
      <section class="ps-card" data-testid="ps-attr-traits">
        <div class="ps-card-head">
          <h3>特质</h3>
          <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="ro" data-testid="ps-special-traits" @click="openFields('全局加值', { path: 'system.bonuses' }, { hint: '对所有攻击、检定、豁免、技能、法术 DC 生效的加值（官方「特殊特质」里的全局加值）。' })"><Icon name="sparkle" :size="13" />全局加值</button>
        </div>
        <BuildRows v-if="!isNpc(s)" />
        <dl class="ps-traits">
          <template v-for="t in traitRows" :key="t.key">
            <dt>{{ t.label }}</dt>
            <dd><span>{{ t.items.join('、') }}</span><button class="ps-skill-icon" type="button" :aria-label="`改${t.label}`" :disabled="ro" @click="editTrait(t.key, t.label)"><Icon name="gear" :size="12" /></button></dd>
          </template>
        </dl>
        <div class="ps-trait-add">
          <button v-for="k in (['languages', 'dr', 'di', 'dv', 'ci', 'armor', 'weapon'] as const).filter((x) => !traitRows.some((t) => t.key === x))" :key="k" class="ps-add-chip" type="button" :disabled="ro" @click="editTrait(k, named(g, 'traits', k) || k)">+ {{ named(g, 'traits', k) || k }}</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// 属性页（线框 p6-7，A 批）：左 技能 + 工具熟练，右 豁免 + 特质；全部只读，取官方显示数据与读数，界面不算数。
// 改熟练、加语言等抽屉属于 E 批；点加值掷骰等 P7。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import SkillList from './SkillList.vue'
import { openFields } from './edit-open'
import { named, signed, skills, tools, traits } from './view'

const person = usePersonStore()
const s = computed(() => person.sheet!)
const g = computed(() => person.glossary)
const skillRows = computed(() => skills(s.value))
const toolRows = computed(() => tools(s.value))
const traitRows = computed(() => traits(s.value, g.value))
const saves = computed(() => Object.keys(g.value?.tables.abilities ?? {}).filter((k) => s.value.system.abilities?.[k]).map((k) => {
  const a = s.value.system.abilities[k]
  return { key: k, label: named(g.value, 'abilities', k), save: a.save?.value ?? a.save, proficient: !!a.proficient }
}))
const concentration = computed(() => s.value.system.attributes?.concentration?.save)
const abilityNames = computed(() => Object.fromEntries(Object.keys(g.value?.tables.abilities ?? {}).map((k) => [k, named(g.value, 'abilities', k)])))
const skillNames = computed(() => Object.fromEntries(skillRows.value.map((k) => [k.key, k.label])))
const toolNames = computed(() => Object.fromEntries(toolRows.value.map((k) => [k.key, k.label])))
const ro = computed(() => person.readOnly)
</script>

<template>
  <div class="ps-attr" data-testid="ps-attr">
    <div class="ps-attr-col">
      <section class="ps-card" data-testid="ps-attr-skills">
        <button class="ps-pen" type="button" aria-label="改技能" :disabled="ro" @click="openFields('技能', { path: 'system.skills' }, { names: skillNames, width: 620 })"><Icon name="pencil-simple" :size="14" /></button>
        <h3>技能</h3>
        <p v-if="!skillRows.length" class="ps-drawer-note">没有列出的技能。</p>
        <SkillList v-else :rows="skillRows" />
      </section>
      <section class="ps-card" data-testid="ps-attr-tools">
        <button class="ps-pen" type="button" aria-label="改工具熟练" :disabled="ro" @click="openFields('工具熟练', { path: 'system.tools' }, { names: toolNames, hint: '工具物品在背包「工具」；这里是会不会用、熟练到什么程度。' })"><Icon name="pencil-simple" :size="14" /></button>
        <h3>工具熟练</h3>
        <p v-if="!toolRows.length" class="ps-drawer-note">没有工具熟练。</p>
        <SkillList v-if="toolRows.length" :rows="toolRows" :passive="false" />
      </section>
    </div>
    <div class="ps-attr-col">
      <section class="ps-card" data-testid="ps-attr-saves">
        <button class="ps-pen" type="button" aria-label="改豁免" :disabled="ro" @click="openFields('豁免', { path: 'system.abilities' }, { names: abilityNames, width: 620 })"><Icon name="pencil-simple" :size="14" /></button>
        <h3>豁免</h3>
        <ul class="ps-saves">
          <li v-for="v in saves" :key="v.key"><span class="ps-prof" :data-level="v.proficient ? 1 : 0">{{ v.proficient ? '●' : '○' }}</span>{{ v.label }}<b>{{ signed(v.save) }}</b></li>
          <li v-if="concentration !== undefined && concentration !== null" class="ps-saves-wide"><span class="ps-prof" />专注<b>{{ signed(concentration) }}</b></li>
        </ul>
      </section>
      <section class="ps-card" data-testid="ps-attr-traits">
        <button class="ps-pen" type="button" aria-label="改特质" :disabled="ro" @click="openFields('特质', { path: 'system.traits' }, { width: 620 })"><Icon name="pencil-simple" :size="14" /></button>
        <h3>特质</h3>
        <p v-if="!traitRows.length" class="ps-drawer-note">没有特质。</p>
        <dl v-else class="ps-traits">
          <template v-for="t in traitRows" :key="t.key"><dt>{{ t.label }}</dt><dd>{{ t.items.join('、') }}</dd></template>
        </dl>
      </section>
    </div>
  </div>
</template>

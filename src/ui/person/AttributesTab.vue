<script setup lang="ts">
// 属性页（线框 p6-7，A 批）：左 技能 + 工具熟练，右 豁免 + 特质；全部只读，取官方显示数据与读数，界面不算数。
// 改熟练、加语言等抽屉属于 E 批；点加值掷骰等 P7。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import SkillList from './SkillList.vue'
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
</script>

<template>
  <div class="ps-attr" data-testid="ps-attr">
    <div class="ps-attr-col">
      <section class="ps-card" data-testid="ps-attr-skills">
        <h3>技能</h3>
        <p v-if="!skillRows.length" class="ps-drawer-note">没有列出的技能。</p>
        <SkillList v-else :rows="skillRows" />
      </section>
      <section v-if="toolRows.length" class="ps-card" data-testid="ps-attr-tools">
        <h3>工具熟练</h3>
        <SkillList :rows="toolRows" :passive="false" />
      </section>
    </div>
    <div class="ps-attr-col">
      <section class="ps-card" data-testid="ps-attr-saves">
        <h3>豁免</h3>
        <ul class="ps-saves">
          <li v-for="v in saves" :key="v.key"><span class="ps-prof" :data-level="v.proficient ? 1 : 0">{{ v.proficient ? '●' : '○' }}</span>{{ v.label }}<b>{{ signed(v.save) }}</b></li>
          <li v-if="concentration !== undefined && concentration !== null" class="ps-saves-wide"><span class="ps-prof" />专注<b>{{ signed(concentration) }}</b></li>
        </ul>
      </section>
      <section class="ps-card" data-testid="ps-attr-traits">
        <h3>特质</h3>
        <p v-if="!traitRows.length" class="ps-drawer-note">没有特质。</p>
        <dl v-else class="ps-traits">
          <template v-for="t in traitRows" :key="t.key"><dt>{{ t.label }}</dt><dd>{{ t.items.join('、') }}</dd></template>
        </dl>
      </section>
    </div>
  </div>
</template>

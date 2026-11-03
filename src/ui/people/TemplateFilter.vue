<script setup lang="ts">
import { computed, ref } from 'vue'
import { CREATURE, SIZE } from '../library/zh'
import Segmented from '../kit/Segmented.vue'
import SelectField from '../kit/SelectField.vue'

export interface TemplateSourceOption { id: string; name: string; count: number }
const props = defineProps<{
  scope: 'current' | 'all'
  sources: TemplateSourceOption[]
  sourcePacks: string[]
  crMin: number
  crMax: number
  creatureTypes: string[]
  sizes: string[]
  activeCount: number
  resultCount: number
}>()
const emit = defineEmits<{
  'update:scope': [value: 'current' | 'all']
  'update:sourcePacks': [value: string[]]
  'update:crMin': [value: number]
  'update:crMax': [value: number]
  'update:creatureTypes': [value: string[]]
  'update:sizes': [value: string[]]
  clear: []
  done: []
}>()
const sourceSearch = ref('')
const shownSources = computed(() => props.sources.filter((s) => !sourceSearch.value.trim() || s.name.includes(sourceSearch.value.trim())))
const crOptions = computed(() => [0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((n) => ({ value: String(n), label: String(n) })))
const types = computed(() => Object.entries(CREATURE).map(([id, label]) => ({ id, label })))
const sizeOptions = computed(() => Object.entries(SIZE).map(([id, label]) => ({ id, label })))
function toggle(value: string[], id: string): string[] { return value.includes(id) ? value.filter((x) => x !== id) : [...value, id] }
</script>

<template>
  <div class="trpg-template-filter" data-testid="template-filter">
    <div class="trpg-template-filter__row"><span class="trpg-template-filter__label">范围</span><Segmented :model-value="scope" :options="[{ value: 'current', label: '本存档已启用的包' }, { value: 'all', label: '全部已安装的包' }]" label="模板范围" @update:model-value="(v) => emit('update:scope', v as 'current' | 'all')" /></div>
    <div class="trpg-template-filter__row">
      <span class="trpg-template-filter__label">来源书</span>
      <div class="trpg-template-filter__sources">
        <input v-model="sourceSearch" class="trpg-input" placeholder="搜书名" aria-label="搜来源书" />
        <div class="trpg-template-filter__source-list">
          <label v-for="s in shownSources" :key="s.id" class="trpg-check"><input type="checkbox" :checked="sourcePacks.includes(s.id)" @change="emit('update:sourcePacks', toggle(sourcePacks, s.id))" /><span>{{ s.name }}</span><span class="trpg-row__meta">{{ s.count }}</span></label>
        </div>
        <span class="trpg-field__hint">官方书和我的包都在这里，可多选。</span>
      </div>
    </div>
    <div class="trpg-template-filter__row"><span class="trpg-template-filter__label">挑战等级</span><span class="trpg-template-filter__cr"><SelectField :model-value="String(crMin)" :options="crOptions" label="最低挑战等级" @update:model-value="(v) => emit('update:crMin', Number(v))" /></span><span>到</span><span class="trpg-template-filter__cr"><SelectField :model-value="String(crMax)" :options="crOptions" label="最高挑战等级" @update:model-value="(v) => emit('update:crMax', Number(v))" /></span></div>
    <div class="trpg-template-filter__row"><span class="trpg-template-filter__label">生物类型</span><div class="trpg-template-filter__checks"><button v-for="t in types" :key="t.id" class="trpg-pill trpg-template-filter__pill" type="button" :aria-pressed="creatureTypes.includes(t.id)" @click="emit('update:creatureTypes', toggle(creatureTypes, t.id))">{{ t.label }}</button></div></div>
    <div class="trpg-template-filter__row"><span class="trpg-template-filter__label">体型</span><div class="trpg-template-filter__checks"><button v-for="s in sizeOptions" :key="s.id" class="trpg-pill trpg-template-filter__pill" type="button" :aria-pressed="sizes.includes(s.id)" @click="emit('update:sizes', toggle(sizes, s.id))">{{ s.label }}</button></div></div>
    <div class="trpg-template-filter__foot"><button class="trpg-btn trpg-btn--quiet" type="button" @click="emit('clear')">清除</button><button class="trpg-btn trpg-btn--primary" type="button" @click="emit('done')">完成，显示 {{ resultCount }} 条</button></div>
  </div>
</template>

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
    <div class="trpg-template-filter__row"><span class="trpg-field__label">范围</span><Segmented :model-value="scope" :options="[{ value: 'current', label: '本存档已启用的包' }, { value: 'all', label: '全部已安装的包' }]" label="模板范围" @update:model-value="(v) => emit('update:scope', v as 'current' | 'all')" /></div>
    <div class="trpg-template-filter__row">
      <span class="trpg-field__label">来源书</span>
      <div class="trpg-template-filter__sources">
        <input v-model="sourceSearch" class="trpg-input" placeholder="搜书名" aria-label="搜来源书" />
        <div class="trpg-template-filter__source-list">
          <label v-for="s in shownSources" :key="s.id" class="trpg-check"><input type="checkbox" :checked="sourcePacks.includes(s.id)" @change="emit('update:sourcePacks', toggle(sourcePacks, s.id))" /><span>{{ s.name }}</span><span class="trpg-row__meta">{{ s.count }}</span></label>
        </div>
        <span class="trpg-field__hint">官方书和我的包都在这里，可多选。</span>
      </div>
    </div>
    <div class="trpg-template-filter__row"><span class="trpg-field__label">挑战等级</span><SelectField :model-value="String(crMin)" :options="crOptions" label="最低挑战等级" @update:model-value="(v) => emit('update:crMin', Number(v))" /><span>到</span><SelectField :model-value="String(crMax)" :options="crOptions" label="最高挑战等级" @update:model-value="(v) => emit('update:crMax', Number(v))" /></div>
    <div class="trpg-template-filter__row"><span class="trpg-field__label">生物类型</span><div class="trpg-template-filter__checks"><label v-for="t in types" :key="t.id" class="trpg-check"><input type="checkbox" :checked="creatureTypes.includes(t.id)" @change="emit('update:creatureTypes', toggle(creatureTypes, t.id))" />{{ t.label }}</label></div></div>
    <div class="trpg-template-filter__row"><span class="trpg-field__label">体型</span><div class="trpg-template-filter__checks"><label v-for="s in sizeOptions" :key="s.id" class="trpg-check"><input type="checkbox" :checked="sizes.includes(s.id)" @change="emit('update:sizes', toggle(sizes, s.id))" />{{ s.label }}</label></div></div>
    <div class="trpg-template-filter__foot"><button class="trpg-btn trpg-btn--quiet" type="button" @click="emit('clear')">清除</button><button class="trpg-btn trpg-btn--primary" type="button" @click="emit('done')">完成，显示 {{ resultCount }} 条</button></div>
  </div>
</template>

<style scoped>
.trpg-template-filter { display: grid; gap: 6px; position: absolute; top: 84px; left: 16px; right: 16px; bottom: 16px; z-index: 3; overflow: auto; padding: 8px; background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow-float); }
.trpg-template-filter__row { display: flex; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
.trpg-template-filter__row > .trpg-field__label { width: 64px; flex: none; padding-top: 8px; }
.trpg-template-filter__sources { flex: 1; min-width: 220px; display: grid; gap: 4px; }
.trpg-template-filter__source-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 2px 12px; max-height: 60px; overflow: auto; }
.trpg-template-filter__source-list .trpg-check { min-height: 30px; font-size: 13px; }
.trpg-template-filter__checks { display: flex; flex-wrap: wrap; gap: 2px 12px; flex: 1; }
.trpg-template-filter__checks .trpg-check { min-height: 26px; font-size: 12.5px; }
.trpg-template-filter__foot { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 0 2px; position: sticky; bottom: -12px; background: var(--card); }
</style>

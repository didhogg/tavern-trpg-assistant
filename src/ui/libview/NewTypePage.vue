<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { EntryType } from '../../library/custom-new'
import { useAppStore } from '../../stores/app'
import ErrorBanner from './ErrorBanner.vue'
import { openStart } from './edit-flow'

/**
 * P5.5 u7-7 新建条目 ① 选类型：搜索 + 常用（作者有构建器或转换器的）+ 按作者网站的页分组。
 * 类型、中文名、分组、起点全部来自后端 custom.entryTypes（从作者读），不手写清单。
 * 只列主条目（§16.10 2c）：从属（子职、职业特性、子种族……）在主条目编辑页里加，背景介绍与图片在每一条自己的编辑页里写。
 */
const props = defineProps<{ codeSet: string; pack: { id: string; name: string } }>()
const app = useAppStore()
const types = shallowRef<EntryType[] | null>(null)
const error = ref<string | null>(null)
const q = ref('')

async function load(): Promise<void> {
  error.value = null
  try { types.value = await app.svc().backend.library.custom.entryTypes(props.codeSet) } catch (e) { console.error('[trpg-assistant] 读取类型失败', e); error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void load())
const match = (t: EntryType): boolean => { const n = q.value.trim().toLowerCase(); return !n || t.name.toLowerCase().includes(n) || t.prop.toLowerCase().includes(n) }
const mains = computed(() => (types.value ?? []).filter((t) => t.kind === 'main'))
const nameOf = (prop: string | null) => (types.value ?? []).find((t) => t.prop === prop)?.name ?? prop ?? ''
/** 从属类别按主条目归在一起：「子职、职业特性 → 职业」。 */
const childHints = computed(() => {
  const by = new Map<string, string[]>()
  for (const t of types.value ?? []) if (t.kind === 'child' && match(t)) by.set(nameOf(t.parent), [...(by.get(nameOf(t.parent)) ?? []), t.name])
  return [...by].map(([parent, kids]) => `${kids.join('、')}：在「${parent}」的编辑页里加`)
})
const fluffHit = computed(() => !!q.value.trim() && (types.value ?? []).some((t) => t.kind === 'fluff' && match(t)))
const common = computed(() => mains.value.filter((t) => t.starts.template || t.starts.convert.length))
const groups = computed(() => {
  const out = new Map<string, EntryType[]>()
  for (const t of mains.value) if (match(t)) { const g = t.group?.name ?? '其他'; out.set(g, [...(out.get(g) ?? []), t]) }
  const other = out.get('其他')
  out.delete('其他')
  if (other) out.set('其他', other)
  return [...out]
})
const pickType = (t: EntryType) => openStart(props.codeSet, props.pack, t)
</script>

<template>
  <div class="lib-mbody" data-testid="new-type">
    <div class="lib-filter"><input v-model="q" class="trpg-input" type="search" :placeholder="types ? `搜类型（${mains.length} 类）` : '搜类型'" aria-label="搜类型" data-autofocus /></div>
    <div class="lib-mscroll">
      <div class="lib-pad">
        <ErrorBanner v-if="error" :text="`类型没读出来：${error}`" what="读取类型" :actions="[{ label: '重试', run: load }]" />
        <div v-else-if="!types" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div>
        <div v-else class="lib-stack">
          <div v-if="!q.trim() && common.length">
            <div class="lib-form__sec">常用（作者有模板或文字转换的）</div>
            <div class="lib-pills lib-pills--wrap"><button v-for="t in common" :key="t.prop" class="trpg-pill" type="button" data-testid="type-common" @click="pickType(t)">{{ t.name }}</button></div>
          </div>
          <p v-if="!groups.length && !childHints.length && !fluffHit" class="lib-muted">没有叫这个名字的类型。</p>
          <div class="lib-types">
            <div v-for="[g, list] in groups" :key="g" class="lib-tgroup">
              <b>{{ g }}</b>
              <span class="lib-tgroup__items"><button v-for="t in list" :key="t.prop" class="trpg-link" type="button" data-testid="type-item" @click="pickType(t)">{{ t.name }}</button></span>
            </div>
          </div>
          <div v-if="childHints.length || fluffHit || !q.trim()" class="lib-muted lib-typehint" data-testid="type-hint">
            <p v-for="h in childHints" :key="h">{{ h }}</p>
            <p>背景介绍与图片：在每一条自己的编辑页里写（「背景介绍与图片」那一节）</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

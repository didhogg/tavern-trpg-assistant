<script setup lang="ts">
// 表格工具条（照 Tidy5e shared/ItemsActionBar.svelte）：搜索（× 清除）· 排序（官方 listControls.sorting）· 分组方式（官方 listControls.grouping）
// · 全部展开 / 收起（ExpandCollapseButton）· 右边插槽放这一页的新建 / 从库里加 · 第二行 官方筛选开关（listControls.filters，判断在小窗官方 _filterChildren）。
import { computed, ref } from 'vue'
import Icon from '../../kit/Icon.vue'
import MoreMenu from '../../kit/MoreMenu.vue'
import type { ListControls } from './rows'

const props = defineProps<{ controls: ListControls | null; placeholder: string; testid: string }>()
const query = defineModel<string>('query', { default: '' })
const sort = defineModel<string>('sort', { default: '' })
const grouping = defineModel<string>('grouping', { default: '' })
const expand = defineModel<boolean | null>('expand', { default: null })
const filters = defineModel<string[]>('filters', { default: () => [] })
/** 筛选选项收在一个按钮里（Tidy5e FilterButtonMenuQuadrone），点开才展开。 */
const showFilters = ref(false)
/** 筛选开关三态（照 dnd5e FilterMenu / Tidy5e FilterToggle）：没选 → 只看这类 → 排除这类 → 没选。 */
const stateOf = (key: string): 'on' | 'off' | null => filters.value.includes(key) ? 'on' : filters.value.includes(`!${key}`) ? 'off' : null
function cycle(key: string): void {
  const rest = filters.value.filter((f) => f !== key && f !== `!${key}`)
  const st = stateOf(key)
  filters.value = st === null ? [...rest, key] : st === 'on' ? [...rest, `!${key}`] : rest
}
/** 官方排序名有的没过语言包（Foundry 自己的 SIDEBAR 键）：按键给中文。 */
const SORT_NAMES: Record<string, string> = { m: '手动排序', a: '按名字排序', p: '按准备优先' }
const sorts = computed(() => (props.controls?.sorting ?? []).map((o) => ({ key: o.key, label: SORT_NAMES[o.key] ?? o.label })))
const groupings = computed(() => (props.controls?.grouping ?? []).map((o, i) => ({ key: o.key, label: GROUP_NAMES[o.key] ?? (i ? `${o.label}（二）` : o.label) })))
const GROUP_NAMES: Record<string, string> = { type: '按类型分组', contents: '不分组', origin: '按来源分组', activation: '按主动 / 被动分组' }
const sortLabel = computed(() => sorts.value.find((o) => o.key === sort.value)?.label ?? sorts.value[0]?.label ?? '')
const groupLabel = computed(() => groupings.value.find((o) => o.key === grouping.value)?.label ?? groupings.value[0]?.label ?? '')
</script>

<template>
  <div class="dt-bar" :data-testid="`${testid}-bar`">
    <span class="dt-search">
      <Icon name="magnifying-glass" :size="14" />
      <input v-model="query" class="trpg-input" type="search" :placeholder="placeholder" :aria-label="placeholder" :data-testid="`${testid}-search`">
      <button v-if="query" class="trpg-icon-btn" type="button" aria-label="清除搜索" @click="query = ''"><Icon name="x" :size="12" /></button>
    </span>
    <MoreMenu v-if="sorts.length > 1" :label="'排序方式'" :text="sortLabel" :items="sorts" @select="sort = $event" />
    <MoreMenu v-if="groupings.length > 1" :label="'分组方式'" :text="groupLabel" :items="groupings" @select="grouping = $event" />
    <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :aria-label="expand ? '全部收起' : '全部展开'" :data-testid="`${testid}-expand`" @click="expand = !expand">
      <Icon :name="expand ? 'arrows-in-line-vertical' : 'arrows-out-line-vertical'" :size="14" />{{ expand ? '全部收起' : '全部展开' }}
    </button>
    <button v-if="controls?.filters.length" class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :aria-expanded="showFilters" :data-on="filters.length || undefined" :data-testid="`${testid}-filters`" @click="showFilters = !showFilters">
      <Icon name="funnel" :size="14" />筛选<b v-if="filters.length" class="dt-filter-count">{{ filters.length }}</b>
    </button>
    <span class="dt-bar-gap" />
    <slot />
    <div v-if="controls?.filters.length && (showFilters || filters.length)" class="dt-filters" role="group" aria-label="筛选（点一下只看这类，再点排除这类）">
      <button v-for="f in controls.filters" :key="f.key" class="dt-filter" type="button" :data-state="stateOf(f.key) ?? undefined" :aria-pressed="stateOf(f.key) === 'on'" :title="stateOf(f.key) === 'off' ? `已排除${f.label}（再点取消）` : stateOf(f.key) === 'on' ? `只看${f.label}（再点改为排除）` : `只看${f.label}`" :data-testid="`${testid}-filter-${f.key}`" @click="cycle(f.key)">
        <Icon v-if="stateOf(f.key) === 'off'" name="x" :size="11" />{{ f.label }}
      </button>
      <button v-if="filters.length" class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="filters = []">清除筛选</button>
    </div>
  </div>
</template>

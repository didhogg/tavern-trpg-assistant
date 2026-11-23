<script setup lang="ts" generic="R extends { id: string; name: string; ref?: unknown; subtitle?: string }">
// 人物详情的分组表（线框 p6-6b / p6-9 / p6-10，照 Tidy5e 的彩色分组表）：组头（名字 · 条数 · 组头右边的插槽）· 列头 ·
// 每行 名字 + 小字说明 · 各列（插槽 cell-列名）· ⋯ 菜单（编辑条目 = 这件东西的官方字段；删除 = 可撤销；另加调用方的菜单项）。
// 点名字原地展开作者原文（和库同一张资料卡的正文）。各页共用这一个，长得一样、用法一样。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import EntryPage from '../libview/EntryPage.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import { useItemWrites } from './bag-actions'
import { openFields } from './edit-open'

/** wide = 只在宽窗口显示（窄屏收起，信息挪到名字下面的小字里）。 */
export interface Col { key: string; label: string; width?: string; wide?: boolean }
export interface Group<T> { key: string; label: string; rows: T[] }
const props = withDefaults(defineProps<{
  groups: Group<R>[]
  cols: Col[]
  /** 行 ⋯ 菜单里额外的项（放在“编辑条目”前面）。 */
  extraMenu?: (row: R) => Array<{ key: string; label: string; disabled?: boolean; danger?: boolean }>
  /** 这些行是物品（能编辑字段、能删）；效果页等不是物品的传 false。 */
  items?: boolean
  testid?: string
}>(), { extraMenu: undefined, items: true, testid: 'ps-table' })
const emit = defineEmits<{ menu: [row: R, key: string] }>()
const person = usePersonStore()
const w = useItemWrites()
const open = ref<string | null>(null)
/** 官方收藏（system.favorites，侧栏「收藏」就是它）。 */
const favs = computed<Array<{ type: string; id: string; sort?: number }>>(() => (person.sheet?.system.favorites ?? []) as Array<{ type: string; id: string; sort?: number }>)
const favId = (r: R): string => `.Item.${r.id}`
const isFav = (r: R): boolean => favs.value.some((f) => f.id === favId(r))
const menuOf = (r: R) => [
  ...(props.extraMenu?.(r) ?? []),
  ...(props.items ? [
    { key: 'fav', label: isFav(r) ? '取消收藏' : '收藏到侧栏', disabled: person.readOnly },
    { key: 'edit', label: '编辑条目', disabled: person.readOnly },
    { key: 'remove', label: '删除', danger: true, disabled: person.readOnly },
  ] : []),
]
function onMenu(r: R, key: string): void {
  if (key === 'edit') openFields(r.name, { itemId: r.id, path: 'system' }, { width: 640 })
  else if (key === 'remove') void w.remove(r.name, r.id)
  else if (key === 'fav') {
    const next = isFav(r) ? favs.value.filter((f) => f.id !== favId(r)) : [...favs.value, { type: 'item', id: favId(r), sort: (favs.value.length + 1) * 100000 }]
    void person.edit(isFav(r) ? `取消收藏${r.name}` : `收藏了${r.name}`, [{ kind: 'set', path: 'system.favorites', value: next }])
  }
  else emit('menu', r, key)
}
</script>

<template>
  <div class="ps-tables" :data-testid="testid">
    <section v-for="grp in groups" :key="grp.key" class="ps-grp" :data-testid="`${testid}-${grp.key}`">
      <header class="ps-grp-head">
        <b>{{ grp.label }}</b><small>{{ grp.rows.length }}</small>
        <slot name="group" :group="grp" />
        <span class="ps-grp-cols" aria-hidden="true">
          <span v-for="c in cols" :key="c.key" :style="{ width: c.width }" :data-wide="c.wide || undefined">{{ c.label }}</span>
          <span class="ps-grp-menu-col" />
        </span>
      </header>
      <ul class="ps-rows">
        <li v-for="r in grp.rows" :key="r.id" class="ps-row" :data-open="open === r.id || undefined" data-testid="ps-row">
          <div class="ps-row-main">
            <slot name="lead" :row="r" />
            <span class="ps-initial" aria-hidden="true">{{ r.name.slice(0, 1) }}</span>
            <div class="ps-row-name">
              <button type="button" class="ps-row-title" :aria-expanded="open === r.id" @click="open = open === r.id ? null : r.id">{{ r.name }}</button>
              <small v-if="r.subtitle">{{ r.subtitle }}</small>
              <slot name="under" :row="r" />
            </div>
            <span v-for="c in cols" :key="c.key" class="ps-cell" :style="{ width: c.width }" :data-col="c.key" :data-wide="c.wide || undefined"><slot :name="`cell-${c.key}`" :row="r">—</slot></span>
            <span class="ps-grp-menu-col"><MoreMenu v-if="menuOf(r).length" :label="`${r.name}的更多操作`" :items="menuOf(r)" @select="onMenu(r, $event)" /></span>
          </div>
          <div v-if="open === r.id" class="ps-row-detail">
            <EntryPage v-if="r.ref" :entry-ref="r.ref as never" body-only />
            <p v-else class="ps-drawer-note">这一项没有库里的原文。</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

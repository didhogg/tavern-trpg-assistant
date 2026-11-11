<script setup lang="ts" generic="T">
import { computed, ref, watch } from 'vue'
import Checkbox from '../kit/Checkbox.vue'
import GroupCheck from '../kit/GroupCheck.vue'
import Icon from '../kit/Icon.vue'

/**
 * 下载页的一个栏目（官方资料 / 冒险 / 自制包，P5 T6 B2）：标题 + 搜索 + 【多选】，下面是按作者分类的可折叠分组（细线隔开）。
 * 多选模式下每行前面有勾选框；勾选和搜索互不影响（被搜索暂时挡住的已选项仍算在里面）；底部钉一条批量操作栏。
 * 只管排版和勾选；行里显示什么、按钮做什么由各栏目自己通过插槽给。
 */
export interface DlRow<R> { key: string; name: string; selectable: boolean; row: R }
export interface DlGroup<R> { key: string; name: string; rows: Array<DlRow<R>> }

const props = defineProps<{ title: string; placeholder: string; groups: Array<DlGroup<T>>; testid: string; flat?: boolean; emptyText?: string }>()
const q = defineModel<string>('q', { default: '' })
const selected = defineModel<Set<string>>('selected', { default: () => new Set() })
const multi = ref(false)
const opened = ref<Set<string>>(new Set())
const searching = computed(() => !!q.value.trim())
const isOpen = (key: string): boolean => props.flat || searching.value || opened.value.has(key)
function toggleGroup(key: string): void { const n = new Set(opened.value); if (n.has(key)) n.delete(key); else n.add(key); opened.value = n }
function toggle(key: string, on: boolean): void { const n = new Set(selected.value); if (on) n.add(key); else n.delete(key); selected.value = n }
function toggleWhole(g: DlGroup<T>, on: boolean): void { const n = new Set(selected.value); for (const r of g.rows) if (r.selectable) { if (on) n.add(r.key); else n.delete(r.key) } selected.value = n }
function setMulti(on: boolean): void { multi.value = on; if (!on) selected.value = new Set() }
watch(() => props.groups.length, () => { if (!props.flat && props.groups.length === 1) opened.value = new Set([props.groups[0].key]) }, { immediate: true })
const total = computed(() => props.groups.reduce((n, g) => n + g.rows.length, 0))
defineExpose({ setMulti })
</script>

<template>
  <section class="lib-dlsec" :data-testid="testid">
    <div class="lib-dlsec__head">
      <b class="lib-title">{{ title }}</b>
      <span class="lib-dlsec__tools">
        <input v-model="q" class="trpg-input" type="search" :placeholder="placeholder" :aria-label="placeholder" />
        <slot name="tools" />
        <button class="trpg-btn trpg-btn--small" type="button" :aria-pressed="multi" :data-testid="`${testid}-multi`" @click="setMulti(!multi)"><Icon :name="multi ? 'x' : 'check'" :size="14" />{{ multi ? '退出多选' : '多选' }}</button>
      </span>
    </div>
    <slot name="above" />
    <p v-if="!total" class="lib-muted lib-dlsec__empty">{{ searching ? '没有符合的。' : emptyText ?? '暂时没有内容。' }}</p>
    <div v-else class="lib-dlsec__list">
      <div v-for="g in groups" :key="g.key" class="lib-dlgrp" :data-open="isOpen(g.key)">
        <!-- 不分组的平铺列表：多选时顶上一行「本页全部」，右侧同样的分组全选框（驾驶员定：所有多选都照这个） -->
        <div v-if="flat && multi" class="lib-dlgrp__sum"><span class="lib-dlgrp__btn">本页全部<small>{{ g.rows.length }}</small></span><GroupCheck :selected="g.rows.filter((r) => r.selectable && selected.has(r.key)).length" :total="g.rows.filter((r) => r.selectable).length" label="本页" @change="(all: boolean) => toggleWhole(g, all)" /></div>
        <div v-if="!flat" class="lib-dlgrp__sum">
          <button class="lib-dlgrp__btn" type="button" :aria-expanded="isOpen(g.key)" @click="toggleGroup(g.key)"><Icon :name="isOpen(g.key) ? 'caret-down' : 'caret-right'" :size="16" />{{ g.name }}<small>{{ g.rows.length }}</small></button>
          <GroupCheck v-if="multi" :selected="g.rows.filter((r) => r.selectable && selected.has(r.key)).length" :total="g.rows.filter((r) => r.selectable).length" :label="g.name" @change="(all: boolean) => toggleWhole(g, all)" />
        </div>
        <ul v-if="isOpen(g.key)" class="trpg-list lib-dlgrp__rows">
          <li v-for="r in g.rows" :key="r.key" class="trpg-row" :data-selected="multi && selected.has(r.key) ? 'true' : undefined">
            <Checkbox v-if="multi" :model-value="selected.has(r.key)" :disabled="!r.selectable" :label="`选择《${r.name}》`" @update:model-value="(v: boolean) => toggle(r.key, v)" />
            <slot name="row" :item="r.row" :multi="multi" />
          </li>
        </ul>
      </div>
    </div>
    <slot name="below" />
    <div v-if="multi" class="lib-selbar" :data-testid="`${testid}-selbar`">
      <slot name="actions" :selected="selected" :clear="() => (selected = new Set())" />
    </div>
  </section>
</template>

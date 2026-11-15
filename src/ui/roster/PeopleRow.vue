<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LoadedActor, RosterRow } from '../../rules/kernel/people'
import { CATEGORIES, categoryOf, isPinned } from '../../stores/roster'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import MoreMenu, { type MenuItem } from '../kit/MoreMenu.vue'

const props = defineProps<{ row: RosterRow; info?: LoadedActor; selecting: boolean; selected: boolean; trash: boolean; readOnly: boolean }>()
const emit = defineEmits<{ toggle: []; menu: [key: string]; retry: [] }>()

/** 挑战等级的写法（官方数据里是小数）。 */
const CR_TEXT: Record<number, string> = { 0.125: '1/8', 0.25: '1/4', 0.5: '1/2' }
const classes = computed(() => props.row.classes.map((c) => (c.levels ? `${c.name} ${c.levels} 级` : c.name)).join('、'))
const facts = computed(() => [classes.value || (props.row.cr !== null ? `挑战 ${CR_TEXT[props.row.cr] ?? props.row.cr}` : ''), props.row.race ?? ''].filter(Boolean))
const hp = computed(() => props.row.hp && props.row.hp.value !== null && props.row.hp.max ? props.row.hp : null)
const pct = computed(() => hp.value ? Math.max(0, Math.min(100, Math.round(((hp.value.value ?? 0) / (hp.value.max ?? 1)) * 100))) : 0)
const tempPct = computed(() => hp.value?.temp && hp.value.max ? Math.min(100 - pct.value, Math.round((hp.value.temp / hp.value.max) * 100)) : 0)
const trouble = computed(() => props.info?.status === 'error' ? props.info.error ?? '读取失败' : props.info?.status === 'legacy' ? '旧格式人物，数值读不出来' : '')
const missing = computed(() => props.row.missing)
/** 只显示真能打开的头像地址（引擎默认头像是内部路径，打不开）；加载失败就退回图标。 */
const broken = ref(false)
const src = computed(() => !broken.value && /^(https?:|data:|blob:)/.test(props.row.img ?? '') ? props.row.img : null)

const items = computed<MenuItem[]>(() => {
  const off = props.readOnly ? { disabled: true, reason: '另一个窗口在改' } : {}
  return [
    { key: isPinned(props.row) ? 'unpin' : 'pin', label: isPinned(props.row) ? '取消置顶' : '置顶', ...off },
    ...CATEGORIES.filter((c) => c.id !== categoryOf(props.row)).map((c) => ({ key: `move:${c.id}`, label: `移到${c.label}`, ...off })),
    { key: 'copy', label: '复制一份', ...off },
    { key: 'trash', label: '删除', danger: true, ...off },
  ]
})
function onRowClick(): void { if (props.selecting) emit('toggle') }
</script>

<template>
  <li class="pp-row" :data-selected="selected || undefined" :data-selecting="selecting || undefined" @click="onRowClick">
    <span class="pp-avatar" aria-hidden="true">
      <img v-if="src" :src="src" alt="" @error="broken = true" />
      <Icon v-else :name="row.type === 'character' || row.type === null ? 'user' : 'skull'" :size="22" />
    </span>
    <div class="pp-main">
      <div class="pp-name"><b>{{ row.name }}</b><Icon v-if="isPinned(row)" name="push-pin-fill" :size="12" /></div>
      <div v-if="facts.length" class="pp-facts"><span v-for="f in facts" :key="f">{{ f }}</span></div>
      <div v-if="row.loaded && (row.ac !== null || row.passivePerception !== null)" class="pp-facts pp-facts--small">
        <span v-if="row.ac !== null">AC {{ row.ac }}</span><span v-if="row.passivePerception !== null">被动察觉 {{ row.passivePerception }}</span>
        <span v-if="row.conditions.length">{{ row.conditions.join('、') }}</span>
      </div>
      <div v-if="missing.length || trouble" class="pp-tags">
        <span v-if="missing.length" class="pp-tag" :title="missing.join('、')"><Icon name="warning" :size="12" />{{ missing.length }} 项资料不可用</span>
        <span v-if="trouble" class="pp-tag" :title="trouble"><Icon name="warning" :size="12" />{{ trouble }}</span>
        <button v-if="info?.status === 'error'" class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click.stop="emit('retry')">重试</button>
      </div>
    </div>
    <div class="pp-hp">
      <template v-if="hp">
        <span class="pp-hp__num"><b>{{ hp.value }}</b> / {{ hp.max }}<em v-if="hp.temp"> +{{ hp.temp }}</em></span>
        <span class="pp-bar" role="img" :aria-label="`生命 ${hp.value} / ${hp.max}`"><i :style="{ width: `${pct}%` }" :data-low="pct < 34 || undefined" /><u v-if="tempPct" :style="{ width: `${tempPct}%` }" /></span>
      </template>
      <span v-else class="pp-hp__none" aria-label="数值读不到">—</span>
    </div>
    <div class="pp-act" @click.stop>
      <Checkbox v-if="selecting" :model-value="selected" :label="`选择${row.name}`" @update:model-value="emit('toggle')" />
      <template v-else-if="trash">
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" @click="emit('menu', 'restore')">恢复</button>
        <button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" :disabled="readOnly" @click="emit('menu', 'purge')">彻底删除</button>
      </template>
      <MoreMenu v-else :label="row.name" :items="items" @select="(k) => emit('menu', k)" />
    </div>
  </li>
</template>

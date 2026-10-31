<script setup lang="ts">
import { computed } from 'vue'
import { stableStringify } from '../../core/hash'
import type { Entry } from '../../schemas/pack'

const props = defineProps<{ left: Entry; right: Entry; leftLabel: string; rightLabel: string }>()
/** 结构化值按人话显示：数组用顿号连接，对象写成「键：值」，不出现 JSON 符号。 */
const human = (v: unknown): string => (v === undefined || v === null ? '' : typeof v === 'string' ? v : typeof v === 'boolean' ? (v ? '是' : '否') : Array.isArray(v) ? v.map(human).filter(Boolean).join('、') : typeof v === 'object' ? Object.entries(v as Record<string, unknown>).map(([k, x]) => `${k}：${human(x)}`).join('；') : String(v))
const show = (v: unknown): string => (v === undefined ? '（没有）' : human(v))
const KEY_LABEL: Record<string, string> = { text: '正文', lore: '背景文字', rarity: '稀有度', weapon: '武器', armor: '护甲', bonuses: '加值', charges: '充能', attunement: '同调', properties: '属性', category: '类别', level: '环阶', school: '学派', castTime: '施法时间', range: '距离', components: '成分', duration: '持续时间', damage: '伤害', save: '豁免', activities: '行动', effects: '效果', advancement: '升级', uses: '使用次数', ac: '护甲等级', hp: '生命值', speed: '速度', abilities: '属性值', saves: '豁免加值', skills: '技能', senses: '感官', languages: '语言', cr: '挑战等级', traits: '特性', actions: '动作', reactions: '反应', legendary: '传奇动作', spellcasting: '施法', tier: '层级', wondrous: '奇物', attachedSpells: '附带法术', attachedItems: '携带物品', abilityGrant: '赋予属性值', abilityCheck: '相关属性检定', facets: '分类标签', extra: '其他字段', src: '出处', credit: '来源', value: '价格', weight: '重量', tags: '标签' }
const rows = computed(() => {
  const keys = new Set([...Object.keys(props.left.data), ...Object.keys(props.right.data)])
  const out = [...keys]
    .filter((k) => stableStringify(props.left.data[k]) !== stableStringify(props.right.data[k]))
    .map((k) => ({ key: KEY_LABEL[k] ?? k, left: show(props.left.data[k]), right: show(props.right.data[k]) }))
  if (props.left.summary !== props.right.summary) out.unshift({ key: '简介', left: props.left.summary || '（没有）', right: props.right.summary || '（没有）' })
  return out
})
</script>

<template>
  <div class="page-stack" data-testid="compare">
    <p v-if="!rows.length" class="trpg-empty">两个版本没有差异。</p>
    <table v-else class="trpg-compare">
      <thead><tr><th>字段</th><th>{{ leftLabel }}</th><th>{{ rightLabel }}</th></tr></thead>
      <tbody><tr v-for="r in rows" :key="r.key"><th>{{ r.key }}</th><td>{{ r.left }}</td><td>{{ r.right }}</td></tr></tbody>
    </table>
  </div>
</template>

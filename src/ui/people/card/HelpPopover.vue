<script setup lang="ts">
import { computed, inject } from 'vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import Icon from '../../kit/Icon.vue'

const props = defineProps<{ kind: 'page' | 'ability' | 'readout' }>()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const open = defineModel<boolean>('open', { default: false })
const title = computed(() => (props.kind === 'page' ? '这页怎么用' : props.kind === 'ability' ? '属性 · 怎么用' : '读数 · 怎么用'))
const rows = computed<Array<{ icon?: string; text: string }>>(() => {
  if (props.kind === 'ability') return [
    { icon: 'dice-five', text: '点大方框（检定）或「豁免」→ 交给骰盘去选难度、掷骰' },
    { icon: 'circle', text: '豁免前面的 ● 表示有熟练' },
  ]
  if (props.kind === 'readout') return [
    { icon: 'dice-five', text: '先攻点一下交给骰盘' },
    { text: '格子下面的小字是这个数怎么来的' },
  ]
  return [
    { icon: 'dice-five', text: '数字旁有骰子 → 点数字去骰盘' },
    { icon: 'plus', text: '加一项；圆点、星、圆圈直接点' },
    { text: '死亡豁免：d20 ≥ 10 成功，掷 1 算两次失败，掷 20 恢复 1 点生命。三次成功稳定，三次失败死亡。' },
    { text: '0 生命时受伤记一次失败（重击两次）；溢出伤害 ≥ 上限即死亡。这些规则不会自动联动。' },
  ]
})
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger class="trpg-icon-btn trpg-card-help" aria-label="怎么用"><Icon name="question" :size="20" /></PopoverTrigger>
    <PopoverPortal :to="portalTarget">
      <PopoverContent class="trpg-help-pop" align="end" :side-offset="6" :collision-padding="8">
        <div class="trpg-help-pop__head"><strong>{{ title }}</strong><button class="trpg-icon-btn" type="button" aria-label="关闭说明" @click="open = false"><Icon name="x" :size="16" /></button></div>
        <p v-for="row in rows" :key="row.text" class="trpg-help-pop__row"><Icon v-if="row.icon && row.icon !== 'circle'" :name="row.icon" :size="16" /><span v-else-if="row.icon === 'circle'" class="trpg-help-pop__dot" />{{ row.text }}</p>
        <div class="trpg-help-pop__foot"><button class="trpg-btn trpg-btn--small" type="button" @click="open = false">知道了</button></div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

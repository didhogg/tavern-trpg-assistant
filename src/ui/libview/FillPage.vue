<script setup lang="ts">
import { ref } from 'vue'
import type { FieldChange } from '../../library/house-diff'
import { useModalStore } from '../../stores/modal'
import { valueText } from './value-text'

/**
 * P5.5 u7-10c 从一种语言版填入另一种（编辑器里换一页）：先列出「只填空着的（推荐）」「全部换掉」各会改哪几项，选了再填。
 * 名字两边各写各的；来源、页码、编号由包和这一条自己定（后端 lang-fill 的规矩）。
 */
const props = defineProps<{ from: string; to: string; plan: { onlyEmpty: FieldChange[]; all: FieldChange[] }; labelOf: (field: string) => string; onPick: (mode: 'onlyEmpty' | 'all') => void }>()
const modal = useModalStore()
const mode = ref<'onlyEmpty' | 'all'>(props.plan.onlyEmpty.length ? 'onlyEmpty' : 'all')
const list = (m: 'onlyEmpty' | 'all') => props.plan[m]
function go(): void { props.onPick(mode.value); modal.pop() }
</script>

<template>
  <div class="lib-mbody" data-testid="fill-page">
    <div class="lib-mscroll">
      <div class="lib-pad lib-stack" style="max-width: 680px">
        <label v-for="m in (['onlyEmpty', 'all'] as const)" :key="m" class="lib-fillopt" :data-on="mode === m">
          <span class="lib-inline"><input v-model="mode" type="radio" name="fill" :value="m" class="lib-choice__radio" /><b>{{ m === 'onlyEmpty' ? `只填${to}里空着的（推荐）` : `全部换成${from}的` }}</b></span>
          <span class="lib-muted" style="font-size: 12px">{{ m === 'onlyEmpty' ? `${to}这一条还空着的 ${list(m).length} 项，用${from}的填上；已经写好的不动` : `已经写了的也换掉，一共 ${list(m).length} 项` }}</span>
          <ul v-if="list(m).length" class="lib-diff"><li v-for="c in list(m)" :key="c.field"><code>{{ labelOf(c.field) }}</code><span><s v-if="c.before !== undefined">{{ valueText(c.before) }}</s>{{ c.before !== undefined ? ' → ' : '' }}{{ valueText(c.after) }}</span></li></ul>
          <span v-else class="lib-muted" style="font-size: 12px">没有要填的。</span>
        </label>
        <p class="lib-faint" style="margin: 0; font-size: 12px">名字两边各写各的，不填；来源、页码、编号由包和这一条自己定。填完还没存，能撤销。</p>
      </div>
    </div>
    <div class="lib-ebar"><button class="trpg-btn" type="button" @click="modal.pop()">回去</button><span class="lib-end"><button class="trpg-btn trpg-btn--primary" type="button" :disabled="!list(mode).length" data-testid="fill-go" @click="go">填入 {{ list(mode).length }} 项（能撤销）</button></span></div>
  </div>
</template>

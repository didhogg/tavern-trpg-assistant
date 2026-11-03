<script setup lang="ts">
import SelectField from '../kit/SelectField.vue'

/** 模板弹窗底部操作栏：编辑后加入 · 放进 [分类] · 数量 · 加入列表（套用模式只有一个主按钮）。 */
defineProps<{ mode?: 'add' | 'apply'; canUse: boolean }>()
defineEmits<{ editAdd: []; add: []; apply: [] }>()
const category = defineModel<'party' | 'npc' | 'enemy'>('category', { required: true })
const count = defineModel<number>('count', { required: true })
const normalized = (): number => Math.max(1, Math.min(30, Math.floor(count.value) || 1))
const step = (delta: number): void => { count.value = Math.max(1, Math.min(30, count.value + delta)) }
</script>

<template>
  <div class="trpg-template__foot">
    <template v-if="mode !== 'apply'">
      <button class="trpg-btn trpg-template__edit" type="button" data-testid="tpl-edit-add" :disabled="!canUse" @click="$emit('editAdd')">编辑后加入</button>
      <label class="trpg-field trpg-template__cat"><span class="trpg-field__label">放进</span><SelectField v-model="category" :options="[{ value: 'party', label: '队伍' }, { value: 'npc', label: 'NPC' }, { value: 'enemy', label: '敌人' }]" label="放进分类" data-testid="tpl-category" /></label>
      <span class="trpg-template__count"><button type="button" aria-label="减少数量" :disabled="count <= 1" @click="step(-1)">−</button><input v-model.number="count" type="number" min="1" max="30" aria-label="数量" data-testid="tpl-count" @blur="count = normalized()" /><button type="button" aria-label="增加数量" :disabled="count >= 30" @click="step(1)">＋</button></span>
    </template>
    <button v-if="mode === 'apply'" class="trpg-btn trpg-btn--primary trpg-template__go" type="button" data-testid="tpl-apply" @click="$emit('apply')">套用到人物</button>
    <button v-else class="trpg-btn trpg-btn--primary trpg-template__go" type="button" data-testid="tpl-add" :disabled="!canUse" @click="$emit('add')">加入列表</button>
  </div>
</template>

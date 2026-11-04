<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Icon from '../kit/Icon.vue'
import { openEntry } from './openDetail'
import { findRule, type RuleRef } from './ruleLookup'

/**
 * 指向库里某条规则（速查）的入口：规则说明本身只在库里，界面不再手写。
 * 没安装对应的书就什么都不显示。icon = 只显示一个小「i」按钮（项目卡标题旁用）。
 */
const props = defineProps<{ nameEn: string; icon?: boolean }>()
const rule = ref<RuleRef>()
onMounted(async () => { rule.value = await findRule(props.nameEn) })
function open(): void { if (rule.value) openEntry(rule.value.packId, rule.value.id, rule.value.name) }
</script>

<template>
  <button v-if="rule && icon" class="trpg-item__hint trpg-rulelink" type="button" :aria-label="`查看规则：${rule.name}`" :title="`查看规则：${rule.name}`" data-testid="rule-link" @click="open"><Icon name="info" :size="16" /></button>
  <button v-else-if="rule" class="trpg-linkbtn trpg-rulelink" type="button" data-testid="rule-link" @click="open">查看规则：{{ rule.name }}</button>
</template>

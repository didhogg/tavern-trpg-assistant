<script setup lang="ts">
// 移到自定义分组（照 Tidy5e SectionSelectorApplication）：填一个分组名（可选这个人已用过的），或放回默认分组。存在物品的 Tidy5e 分组字段上，一条撤销。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../../stores/person'
import { useModalStore } from '../../../stores/modal'
import { SECTION_FLAG, sectionOf } from './rows'

const props = defineProps<{ itemId: string; name: string; current: string }>()
const person = usePersonStore()
const modal = useModalStore()
const text = ref(props.current)
/** 这个人身上已经用过的自定义分组名。 */
const used = computed<string[]>(() => [...new Set(((person.sheet?.items ?? []) as unknown[]).map(sectionOf).filter(Boolean))])
async function save(value: string | null): Promise<void> {
  const v = value?.trim() || null
  if (v === (props.current || null)) { modal.done(); return }
  if (await person.edit(v ? `把${props.name}移到「${v}」` : `把${props.name}放回默认分组`, [{ kind: 'item', itemId: props.itemId, path: SECTION_FLAG, value: v, ...(v ? {} : { remove: true }) }])) modal.done()
}
</script>

<template>
  <form class="pf" data-testid="section-page" @submit.prevent="save(text)">
    <div class="pf-body">
      <p class="pf-intro">分组只影响这一页怎么排，不改规则。</p>
      <label class="pf-name"><span>分组名</span><input v-model="text" class="trpg-input" list="ps-section-list" maxlength="60" placeholder="例如：常用、战斗前准备" data-testid="section-name"></label>
      <datalist id="ps-section-list"><option v-for="u in used" :key="u" :value="u" /></datalist>
      <div v-if="used.length" class="pf-chips"><button v-for="u in used" :key="u" class="trpg-btn trpg-btn--small pf-chip" type="button" :aria-pressed="text === u" @click="text = u">{{ u }}</button></div>
    </div>
    <div class="pf-foot">
      <button v-if="current" class="trpg-btn" type="button" @click="save(null)">放回默认分组</button>
      <span class="pf-gap" />
      <button class="trpg-btn" type="button" @click="modal.done()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="!text.trim()">移过去</button>
    </div>
  </form>
</template>

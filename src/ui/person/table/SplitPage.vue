<script setup lang="ts">
// 拆分堆叠（照 dnd5e SplitStackDialog）：选拆出几个（1 … 数量−1），原物留下其余；官方一次批量写，一条撤销。
import { ref } from 'vue'
import { usePersonStore } from '../../../stores/person'
import { useModalStore } from '../../../stores/modal'
import NumIn from './NumIn.vue'

const props = defineProps<{ itemId: string; name: string; quantity: number }>()
const person = usePersonStore()
const modal = useModalStore()
const n = ref(Math.max(1, Math.floor(props.quantity / 2)))
async function save(): Promise<void> {
  if (await person.splitStack(`把${props.name}拆出 ${n.value} 个`, props.itemId, n.value)) modal.close()
}
</script>

<template>
  <form class="pf" data-testid="split-page" @submit.prevent="save">
    <div class="pf-body">
      <p class="pf-intro">现在一共 {{ quantity }} 个。拆出来的放成新的一堆，原来这堆留下其余的。</p>
      <div class="pf-name"><span>拆出几个</span><span><NumIn :value="n" :min="1" :max="quantity - 1" step label="拆出几个" @set="(v) => (n = v)" /></span></div>
      <p class="pf-intro">拆完：原来这堆 {{ quantity - n }} 个 · 新的一堆 {{ n }} 个</p>
    </div>
    <div class="pf-foot">
      <span class="pf-gap" />
      <button class="trpg-btn" type="button" @click="modal.close()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" data-testid="split-save">拆分</button>
    </div>
  </form>
</template>

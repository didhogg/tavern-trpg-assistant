<script setup lang="ts">
import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
import { askConfirm } from '../kit/confirm'
import Term from '../kit/Term.vue'
import LabModalPage from './LabModalPage.vue'

const props = defineProps<{ level: number }>()
const modal = useModalStore()

function forward(): void {
  modal.push({ key: `lab:${props.level + 1}`, title: `第 ${props.level + 1} 页`, component: markRaw(LabModalPage), props: { level: props.level + 1 } })
}

async function ask(): Promise<void> {
  await askConfirm({ title: '测试确认', message: '这是弹窗内的确认页，「‹」或 Esc 即取消。', confirmLabel: '确认' })
}
</script>

<template>
  <div class="page-stack" :data-testid="`lab-page-${level}`">
    <p>这是演示弹窗的第 {{ level }} 页。点下面的术语在<Term @open="forward">同一个弹窗里</Term>前进一页。</p>
    <ul class="trpg-list">
      <li v-for="n in 30" :key="n" class="trpg-row"><span>演示行 {{ n }}</span></li>
    </ul>
    <button class="trpg-btn" type="button" @click="ask">弹窗内确认</button>
  </div>
</template>

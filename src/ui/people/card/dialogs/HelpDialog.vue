<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../../../kit/Icon.vue'
import { useModalStore } from '../../../../stores/modal'
import DialogFrame from './DialogFrame.vue'

const props = defineProps<{ blank: boolean }>()
const modal = useModalStore()
const rows = [
  { icon: 'dice-five', text: '带骰子的数字点一下，去骰盘（只填入，不掷）' },
  { icon: 'pencil-simple', text: '每张卡右上的铅笔：改这一栏的数字和内容' },
  { icon: 'plus', text: '右上的加号：往列表里加一项' },
  { icon: 'tag', text: '药丸：鼠标放上去看来源，点一下看资料' },
  { icon: 'check-circle', text: '圆点、星、圆圈：直接点，点一下就切换' },
  { icon: 'arrow-counter-clockwise', text: '改设定先进草稿，右上点「保存」才写入；撤销在顶栏' },
]
const steps = computed(() => (props.blank ? ['点身份的铅笔，在标签页里选种族、职业、背景，选完可以什么都不分配', '属性的铅笔配置属性', '防御、感官、熟练的铅笔补内容', '右上保存'] : []))
</script>

<template>
  <DialogFrame>
    <ul class="trpg-help__rows"><li v-for="row in rows" :key="row.text"><Icon :name="row.icon" :size="20" /><span>{{ row.text }}</span></li></ul>
    <section v-if="steps.length" class="trpg-help__start"><h3>怎么开始</h3><ol><li v-for="s in steps" :key="s">{{ s }}</li></ol></section>
    <template #actions><button class="trpg-btn trpg-btn--primary" type="button" @click="modal.requestClose()">知道了</button></template>
  </DialogFrame>
</template>

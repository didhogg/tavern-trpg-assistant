<script setup lang="ts">
import { ref } from 'vue'
import { results, setResult } from '../probes/store'
import SelectField from './kit/SelectField.vue'
import Segmented from './kit/Segmented.vue'

const items = [
  { id: 'ui.ball', title: '悬浮球可拖动（鼠标/手指）', how: '拖动悬浮球到屏幕各处，松手后停在松手位置；单击能开关窗口。' },
  { id: 'ui.window', title: '窗口可拖动且不会拖出屏幕', how: '拖动本窗口标题栏，尝试拖出屏幕边缘。' },
  { id: 'ui.dropdown', title: '下拉列表完整显示', how: '把本窗口拖到屏幕底部或右侧边缘，再打开下面的下拉：列表应自动翻转、完整可见、不被裁切。' },
  { id: 'ui.checkbox', title: '勾选框与按钮样式正常', how: '看下面的勾选框、输入框、按钮：应该是正常的方框，不是深色竖条或变形。' },
  { id: 'ui.input', title: '输入框可输入且不触发酒馆快捷键', how: '在下面输入框里输入中文和英文，按回车：文字正常显示，酒馆不会因此发送消息或弹出其他东西。' },
]

const choice = ref('')
const color = ref('')
const segment = ref('a')
const checked = ref(false)
const typed = ref('')

function mark(id: string, title: string, status: 'pass' | 'fail'): void {
  setResult(id, title, status, status === 'pass' ? '人工确认：通过' : '人工确认：不通过')
}
</script>

<template>
  <section class="probe">
    <h3 class="probe__title">界面实测（需要你目测后点结果）</h3>
    <div class="lab">
      <div class="lab__row">
        <SelectField v-model="choice" label="测试下拉（8 项）" :options="['戏法', '1 环', '2 环', '3 环', '4 环', '5 环', '6 环', '7 环', '8 环', '9 环']" placeholder="下拉测试：选择环阶" />
        <SelectField v-model="color" label="测试下拉（3 项）" :options="['红', '金', '墨']" placeholder="下拉测试：选择颜色" />
      </div>
      <div class="lab__row">
        <Segmented v-model="segment" label="分段按钮" :options="[{ value: 'a', label: '优势' }, { value: 'b', label: '普通' }, { value: 'c', label: '劣势' }]" />
        <label class="trpg-check"><input v-model="checked" type="checkbox" /> 勾选框测试</label>
        <input v-model="typed" class="trpg-input" type="text" placeholder="输入测试：中文 / English" />
      </div>
    </div>
    <div v-for="item in items" :key="item.id" class="probe">
      <div class="probe__head">
        <h4 class="probe__title">{{ item.title }}</h4>
        <span class="trpg-badge" :data-status="results[item.id]?.status ?? 'idle'">{{ results[item.id]?.status ?? '待测' }}</span>
      </div>
      <p class="probe__hint">{{ item.how }}</p>
      <div class="probe__actions">
        <button class="trpg-btn" type="button" @click="mark(item.id, item.title, 'pass')">通过</button>
        <button class="trpg-btn" type="button" @click="mark(item.id, item.title, 'fail')">不通过</button>
      </div>
    </div>
  </section>
</template>

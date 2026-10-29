<script setup lang="ts">
import { ref } from 'vue'
import { results, setResult } from '../../probes/store'
import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { askConfirm } from '../kit/confirm'
import MoreMenu from '../kit/MoreMenu.vue'
import SelectField from '../kit/SelectField.vue'
import Segmented from '../kit/Segmented.vue'
import Combobox from '../kit/Combobox.vue'
import Switch from '../kit/Switch.vue'
import TagPill from '../kit/TagPill.vue'
import Term from '../kit/Term.vue'
import LabModalPage from './LabModalPage.vue'

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
const on = ref(false)
const combo = ref('')
const comboOptions = Array.from({ length: 300 }, (_, i) => ({ value: `s${i}`, label: `法术-${String(i + 1).padStart(3, '0')}`, en: `Spell ${i + 1}`, badge: i % 2 ? 'PHB' : 'XGE' }))
const tags = ref(['队伍成员', '风暴岛'])
const menuPick = ref('')
const modal = useModalStore()
const toast = useToastStore()

function openModal(): void {
  modal.open({ key: 'lab:1', title: '演示弹窗', component: markRaw(LabModalPage), props: { level: 1 } })
}
async function dangerConfirm(): Promise<void> {
  const ok = await askConfirm({ title: '卸载演示', message: '确定要卸载吗？', confirmLabel: '卸载', danger: true })
  toast.info(ok ? '已确认' : '已取消')
}

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
        <p class="probe__hint" data-testid="select-model">下拉当前值：{{ choice || '未选' }} / {{ color || '未选' }}</p>
        <SelectField v-model="color" label="测试下拉（3 项）" :options="['红', '金', '墨']" placeholder="下拉测试：选择颜色" />
      </div>
      <div class="lab__row">
        <Segmented v-model="segment" label="分段按钮" :options="[{ value: 'a', label: '优势' }, { value: 'b', label: '普通' }, { value: 'c', label: '劣势' }]" />
        <label class="trpg-check"><input v-model="checked" type="checkbox" /> 勾选框测试</label>
        <input v-model="typed" class="trpg-input" type="text" placeholder="输入测试：中文 / English" />
      </div>
      <div class="lab__row">
        <Combobox v-model="combo" :options="comboOptions" label="可搜索下拉演示" placeholder="搜索 300 条法术" />
        <p class="probe__hint" data-testid="combo-model">可搜索下拉当前值：{{ combo || '未选' }}</p>
        <div class="probe__actions"><TagPill v-for="t in tags" :key="t" :label="t" owner="盖尔" @remove="tags = tags.filter((x) => x !== t)" /></div>
      </div>
      <div class="lab__row">
        <div class="trpg-row">
          <span class="trpg-row__main">开关演示：<span data-testid="switch-state">{{ on ? '开' : '关' }}</span></span>
          <Switch v-model="on" label="演示开关" />
          <MoreMenu label="演示条目" :items="[{ key: 'copy', label: '复制为我的包' }, { key: 'x', label: '不可用项', disabled: true, reason: '演示' }, { key: 'del', label: '卸载', danger: true }]" @select="menuPick = $event" />
        </div>
        <p class="probe__hint" data-testid="menu-pick">菜单选择：{{ menuPick || '无' }}</p>
        <p>下划线术语：<Term @open="openModal">点我打开演示弹窗</Term></p>
        <div class="probe__actions">
          <button class="trpg-btn" type="button" @click="dangerConfirm">危险确认</button>
          <button class="trpg-btn" type="button" @click="toast.success('已保存')">成功提示</button>
          <button class="trpg-btn" type="button" @click="toast.undoable('已删除一项', () => { toast.info('已撤销') })">可撤销提示</button>
          <button class="trpg-btn" type="button" @click="toast.error('下载失败：网络中断')">失败提示</button>
        </div>
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

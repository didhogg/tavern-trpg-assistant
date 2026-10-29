<script setup lang="ts">
import { computed } from 'vue'
import type { InstallPlan } from '../../core/packs/installer'
import type { RecognizedPack } from '../../core/packs/recognize'

const props = defineProps<{ plan: InstallPlan; rec: RecognizedPack; onAnswer: (ok: boolean) => void }>()
const SOURCE: Record<string, string> = { builtin: '内置', download: '数据仓库下载', import: '导入文件', user: '自制' }
const installed = computed(() => props.plan.installed!)
const label = computed(() => (props.plan.relation === 'same' ? '重新安装' : props.plan.relation === 'older' ? '覆盖（降级）' : '覆盖'))
const blocked = computed(() => props.plan.blocked === 'builtin-downgrade')
const relationText = computed(() => (props.plan.relation === 'newer' ? '（较新）' : props.plan.relation === 'older' ? '（较旧）' : ''))
</script>

<template>
  <div class="trpg-confirm">
    <p class="trpg-confirm__message">已安装同一个扩展包「{{ installed.name }}」。</p>
    <table class="trpg-compare">
      <thead><tr><th /><th>已安装</th><th>要导入的</th></tr></thead>
      <tbody>
        <tr><th>版本</th><td>v{{ installed.version }}</td><td>v{{ rec.manifest.version }}{{ relationText }}</td></tr>
        <tr><th>条目</th><td>{{ installed.entryCount }}</td><td>{{ rec.manifest.entryCount }}</td></tr>
        <tr><th>来源</th><td>{{ SOURCE[installed.source] }}</td><td>导入文件</td></tr>
      </tbody>
    </table>
    <p v-if="plan.contentChanged" class="trpg-field__hint">版本相同，但内容与已安装的不同。</p>
    <p v-if="blocked" class="trpg-field__error">内置扩展包不能降级。</p>
    <p class="trpg-field__hint">覆盖后，存档中已加入游戏的内容不受影响。</p>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" data-autofocus @click="onAnswer(false)">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="blocked" @click="onAnswer(true)">{{ label }}</button>
    </div>
  </div>
</template>

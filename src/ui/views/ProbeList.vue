<script setup lang="ts">
import { ref } from 'vue'
import { MODULE_NAME } from '../../host/context'
import type { StContext } from '../../host/types'
import { collectEnv } from '../../probes/envProbe'
import { createProbes } from '../../probes'
import { buildReport, results } from '../../probes/store'
import UiLab from './UiLab.vue'

const props = defineProps<{ ctx: StContext }>()
const stContext = props.ctx
const probes = createProbes(stContext)
const message = ref('')

async function report(): Promise<string> {
  return JSON.stringify(buildReport(await collectEnv(stContext)), null, 2)
}

async function copy(): Promise<void> {
  const text = await report()
  try {
    await navigator.clipboard.writeText(text)
    message.value = '已复制报告'
  } catch (error) {
    console.error('[trpg-assistant] 复制失败', error)
    message.value = '复制失败，已保存到扩展设置（见下一个按钮）'
  }
}

async function save(): Promise<void> {
  const settings = (stContext.extensionSettings[MODULE_NAME] ??= {}) as Record<string, unknown>
  settings.m0Report = JSON.parse(await report())
  stContext.saveSettingsDebounced()
  message.value = '已保存到扩展设置'
}

for (const probe of probes) void probe.start?.()
</script>

<template>
  <div>
    <section v-for="probe in probes" :key="probe.id" class="probe">
      <div class="probe__head">
        <h3 class="probe__title">{{ probe.title }}</h3>
        <span class="trpg-badge" :data-status="results[probe.id]?.status ?? 'idle'">{{ results[probe.id]?.status ?? '待测' }}</span>
      </div>
      <p class="probe__hint">{{ probe.hint }}</p>
      <p v-if="results[probe.id]" class="probe__summary">{{ results[probe.id].summary }}</p>
      <div class="probe__actions">
        <button v-for="action in probe.actions" :key="action.label" class="trpg-btn" type="button" @click="action.run()">
          {{ action.label }}
        </button>
      </div>
      <details v-if="results[probe.id]?.detail !== undefined">
        <summary>详情</summary>
        <pre>{{ JSON.stringify(results[probe.id].detail, null, 2) }}</pre>
      </details>
    </section>
    <UiLab />
    <div class="report-bar">
      <button class="trpg-btn trpg-btn--primary" type="button" @click="copy()">复制测试报告</button>
      <button class="trpg-btn" type="button" @click="save()">保存报告到扩展设置</button>
      <span role="status">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { settingsSchema, type Settings } from '../../schemas/campaign'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'
import { errorText } from '../format'
import Stepper from '../kit/Stepper.vue'
import Switch from '../kit/Switch.vue'

/** 备份与撤销：备份提醒的两个条件各自可关（存 0 = 不提醒）、撤销记录上限。 */
const app = useAppStore()
const toast = useToastStore()
const settings = computed(() => app.settings ?? settingsSchema.parse({}))
const DEFAULTS = settingsSchema.parse({})

interface Row { key: 'reminderDays' | 'reminderSaves' | 'undoLimit'; title: string; hint: string; unit: string; min: number; max: number; step: number; switchable: boolean }
const ROWS: Row[] = [
  { key: 'reminderDays', title: '多少天没导出备份就提醒', hint: '到了天数，存档抽屉里会写"建议导出备份"。', unit: '天', min: 1, max: 365, step: 1, switchable: true },
  { key: 'reminderSaves', title: '导出后保存多少次就提醒', hint: '两个条件只要有一个到了就提醒；都关掉就不提醒。', unit: '次', min: 1, max: 999, step: 1, switchable: true },
  { key: 'undoLimit', title: '撤销记录上限', hint: '这是结算的撤销（不是备份），最多保留这么多条，1–500。', unit: '条', min: 1, max: 500, step: 10, switchable: false },
]

async function set(key: Row['key'], value: number): Promise<void> {
  try {
    await app.updateSettings({ [key]: value } as Partial<Settings>)
    await app.refreshBackup()
  } catch (error) {
    console.error('[trpg-assistant] 保存设置失败', error)
    toast.error(`保存设置失败：${errorText(error)}`)
  }
}
const on = (r: Row): boolean => !r.switchable || settings.value[r.key] > 0
function bump(r: Row, dir: 1 | -1): void {
  void set(r.key, Math.min(r.max, Math.max(r.min, settings.value[r.key] + dir * r.step)))
}
function flip(r: Row, want: boolean): void {
  void set(r.key, want ? DEFAULTS[r.key] : 0)
}
</script>

<template>
  <div class="trpg-settings" data-testid="backup-settings">
    <div v-for="r in ROWS" :key="r.key" class="trpg-settings__row" :data-testid="`setting-${r.key}`">
      <div><b>{{ r.title }}</b></div>
      <span class="trpg-ctrl" :class="{ 'trpg-ctrl--off': !on(r) }">
        <Stepper :value="on(r) ? `${settings[r.key]} ${r.unit}` : '不提醒'" :minus-label="`${r.title}：减少`" :plus-label="`${r.title}：增加`" :minus-disabled="!on(r) || settings[r.key] <= r.min" :plus-disabled="!on(r) || settings[r.key] >= r.max" @minus="bump(r, -1)" @plus="bump(r, 1)" />
        <Switch v-if="r.switchable" :model-value="on(r)" :label="`${r.title}：开关`" @update:model-value="flip(r, $event)" />
      </span>
      <span class="trpg-field__hint">{{ r.hint }}</span>
    </div>
  </div>
</template>

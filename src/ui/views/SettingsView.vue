<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { APP_VERSION } from '../../core/services'
import type { StContext } from '../../host/types'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'
import Segmented from '../kit/Segmented.vue'
import Icon from '../kit/Icon.vue'
import ProbeList from './ProbeList.vue'

const ctx = inject<StContext>('stCtx')
const sub = ref<'diag' | 'about' | null>(null)
const app = useAppStore()
const toast = useToastStore()
onMounted(() => void (app.booted && app.refreshSettings().catch((e) => console.error('[trpg-assistant] 读取设置失败', e))))

async function setVariantDefault(value: string): Promise<void> {
  try {
    await app.updateSettings({ variantDefault: value as 'apply' | 'skip' })
  } catch (error) {
    console.error('[trpg-assistant] 保存设置失败', error)
    toast.error('保存设置失败')
  }
}
</script>

<template>
  <div v-if="sub === null" class="page-stack">
    <ul class="trpg-list">
      <li v-if="app.settings" class="trpg-row">
        <div class="trpg-row__main">
          <div class="trpg-row__title">启用扩展包时，对官方条目的修改</div>
          <div class="trpg-row__meta">启用扩展包（含导入冒险）时，它带来的修改默认应用还是不应用；之后随时可以逐条改</div>
        </div>
        <Segmented :model-value="app.settings.variantDefault" label="官方条目修改的默认" :options="[{ value: 'apply', label: '默认应用' }, { value: 'skip', label: '默认不应用' }]" @update:model-value="setVariantDefault($event ?? 'apply')" />
      </li>
      <li class="trpg-row">
        <div class="trpg-row__main">
          <div class="trpg-row__title">诊断</div>
          <div class="trpg-row__meta">自检与兼容性测试，遇到问题时用来收集信息</div>
        </div>
        <button class="trpg-btn" type="button" @click="sub = 'diag'">打开<Icon name="caret-right" :size="14" /></button>
      </li>
      <li class="trpg-row">
        <div class="trpg-row__main">
          <div class="trpg-row__title">关于</div>
          <div class="trpg-row__meta">版本 {{ APP_VERSION }} · 开源许可与致谢</div>
        </div>
        <button class="trpg-btn" type="button" @click="sub = 'about'">打开<Icon name="caret-right" :size="14" /></button>
      </li>
    </ul>
  </div>
  <div v-else>
    <button class="subpage-back" type="button" @click="sub = null"><Icon name="caret-left" :size="16" />设置</button>
    <div v-if="sub === 'diag'" class="trpg-diag" data-testid="diagnostics">
      <ProbeList v-if="ctx" :ctx="ctx" />
    </div>
    <div v-else class="page-stack">
      <h2 class="trpg-group">TRPG 跑团助手 {{ APP_VERSION }}</h2>
      <p class="page-intro">代码以 AGPL-3.0 许可发布，源码在 GitHub：didhogg/tavern-trpg-assistant。</p>
      <p class="page-intro">界面图标：Phosphor Icons（MIT）。规则数据的来源与许可见各条目的出处标注与随包附带的数据声明。</p>
    </div>
  </div>
</template>

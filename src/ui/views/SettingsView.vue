<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { APP_VERSION } from '../../core/services'
import type { StContext } from '../../host/types'
import { useAppStore } from '../../stores/app'
import Icon from '../kit/Icon.vue'
import BackupSettings from './BackupSettings.vue'
import LibSettings from '../libview/LibSettings.vue'
import ProbeList from './ProbeList.vue'

type Sub = 'backup' | 'library' | 'diag' | 'about'
const ctx = inject<StContext>('stCtx')
const sub = ref<Sub | null>(null)
const app = useAppStore()
onMounted(() => void (app.booted && app.refreshSettings().catch((e) => console.error('[trpg-assistant] 读取设置失败', e))))

const ROWS: Array<{ id: Sub; title: string; line: string }> = [
  { id: 'backup', title: '备份与撤销', line: '多久提醒导出一次备份、撤销记录最多保留多少条' },
  { id: 'library', title: '库', line: '偏好、全局编辑 / 覆盖、日志' },
  { id: 'diag', title: '诊断', line: '自检与兼容性测试，遇到问题时用来收集信息' },
  { id: 'about', title: '关于', line: `版本 ${APP_VERSION} · 开源许可与致谢` },
]
const TITLES: Record<Sub, string> = { backup: '备份与撤销', library: '库', diag: '诊断', about: '关于' }
</script>

<template>
  <div v-if="sub === null" class="trpg-menu" data-testid="settings-menu">
    <button v-for="r in ROWS" :key="r.id" class="trpg-menu__row" type="button" :data-testid="`settings-${r.id}`" @click="sub = r.id">
      <b>{{ r.title }}</b><small>{{ r.line }}</small><span><Icon name="caret-right" :size="16" /></span>
    </button>
  </div>
  <div v-else>
    <button class="trpg-back" type="button" data-testid="settings-back" @click="sub = null"><Icon name="caret-left" :size="16" />设置</button>
    <h2 class="trpg-pagehead">{{ TITLES[sub] }}</h2>
    <BackupSettings v-if="sub === 'backup'" />
    <LibSettings v-else-if="sub === 'library'" />
    <div v-else-if="sub === 'diag'" class="trpg-diag" data-testid="diagnostics">
      <ProbeList v-if="ctx" :ctx="ctx" />
    </div>
    <div v-else class="trpg-about page-stack">
      <h3 class="trpg-group trpg-group--first">TRPG 跑团助手 {{ APP_VERSION }}</h3>
      <p class="page-intro">代码以 AGPL-3.0 许可发布，源码在 GitHub：didhogg/tavern-trpg-assistant。</p>
      <p class="page-intro">界面图标：Phosphor Icons（MIT）。规则数据的来源与许可见各条目的出处标注与随包附带的数据声明。</p>
    </div>
  </div>
</template>

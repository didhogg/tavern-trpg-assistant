<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { InstallPlan } from '../../core/packs/installer'
import type { RecognizedPack } from '../../core/packs/recognize'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { errorText, formatBytes } from '../format'
import { decideResolution } from './decide'

const props = defineProps<{ rec: RecognizedPack }>()
const app = useAppStore()
const library = useLibraryStore()
const modal = useModalStore()
const toast = useToastStore()
const plan = shallowRef<InstallPlan | null>(null)
const working = ref(false)
const done = ref(false)

const ruleName = computed(() => app.svc().rules.get(props.rec.manifest.ruleId)?.name ?? props.rec.manifest.ruleId)
const nameOf = (id: string) => library.catalog?.packs.find((c) => c.id === id)?.name ?? id
const catalogHas = (id: string) => !!library.catalog?.packs.some((c) => c.id === id)
const KIND: Record<string, string> = { ruleOptions: '规则选项', aiNotes: 'AI 基调', characterCreation: '建卡方式', activity: '活动', tracker: '追踪器' }
const unsupported = computed(() => plan.value?.unsupportedFeatures.map((f) => `${KIND[f.kind] ?? f.kind} ${f.count} 个`).join('、') ?? '')
const blockedText = computed(() => {
  if (plan.value?.blocked === 'lineage-mismatch') return `已安装的「${plan.value.installed?.name}」与这个文件编号相同但来源不同。先卸载已安装的，或请作者更换编号。`
  if (plan.value?.blocked === 'builtin-downgrade') return '内置扩展包不能降级。'
  return ''
})
const canInstall = computed(() => !!plan.value && !plan.value.missingRequires.length && plan.value.blocked !== 'lineage-mismatch' && !working.value)

async function refreshPlan(): Promise<void> {
  plan.value = await app.svc().packs.plan(props.rec)
}
onMounted(async () => {
  await Promise.all([refreshPlan(), library.catalog ? Promise.resolve(true) : library.loadCatalog()])
})

async function installDep(id: string): Promise<void> {
  const pack = library.catalog?.packs.find((c) => c.id === id)
  if (!pack) return
  if (await library.install(pack)) await refreshPlan()
  else toast.error(`「${pack.name}」安装失败，可以稍后再试`)
}

async function install(): Promise<void> {
  if (!plan.value) return
  working.value = true
  try {
    const decision = await decideResolution(props.rec, plan.value)
    if (!decision.ok) return
    await library.installFile(props.rec, decision.resolution)
    done.value = true
    toast.success(`已安装「${props.rec.manifest.name}」`)
  } catch (error) {
    console.error('[trpg-assistant] 安装失败', error)
    toast.error(`安装失败：${errorText(error)}`)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="page-stack" data-testid="import-pack">
    <p class="trpg-import__ok">✓ 已识别：扩展包 · {{ ruleName }}</p>
    <div>
      <div class="trpg-row__title">{{ rec.manifest.name }}</div>
      <div class="trpg-row__meta">v{{ rec.manifest.version }} · {{ rec.manifest.entryCount }} 条 · {{ formatBytes(rec.byteSize) }} · {{ rec.manifest.author ? `作者 ${rec.manifest.author}` : '导入文件' }}</div>
    </div>
    <p v-if="blockedText" class="trpg-field__error" role="alert">⚠ {{ blockedText }}</p>
    <section v-if="plan?.missingRequires.length" aria-label="需要先安装">
      <h3 class="trpg-group">需要先安装：</h3>
      <ul class="trpg-list">
        <li v-for="d in plan.missingRequires" :key="d.id" class="trpg-row">
          <span class="trpg-row__main">{{ nameOf(d.id) }}</span>
          <button v-if="catalogHas(d.id)" class="trpg-btn" type="button" :disabled="!!library.tasks[d.id]" @click="installDep(d.id)">{{ library.tasks[d.id] ? '安装中…' : '安装' }}</button>
          <span v-else class="trpg-row__meta">库和数据仓库都没有</span>
        </li>
      </ul>
    </section>
    <section v-if="plan?.missingRecommends.length" aria-label="推荐一起安装">
      <h3 class="trpg-group">推荐一起安装（可以跳过）：</h3>
      <ul class="trpg-list">
        <li v-for="d in plan.missingRecommends" :key="d.id" class="trpg-row">
          <span class="trpg-row__main">{{ nameOf(d.id) }}</span>
          <button v-if="catalogHas(d.id)" class="trpg-btn" type="button" @click="installDep(d.id)">安装</button>
        </li>
      </ul>
    </section>
    <p v-for="c in plan?.conflicts ?? []" :key="c.id" class="trpg-field__hint">与「{{ nameOf(c.id) }}」冲突：{{ c.reason || '不能在同一个存档中同时启用' }}</p>
    <p v-if="unsupported" class="trpg-field__hint">本版本暂不支持：{{ unsupported }}</p>
    <p v-if="done" class="trpg-import__ok" role="status">已安装「{{ rec.manifest.name }}」</p>
    <div class="trpg-confirm__actions">
      <button v-if="!done" class="trpg-btn" type="button" @click="modal.close(true)">取消</button>
      <button v-if="!done" class="trpg-btn trpg-btn--primary" type="button" :disabled="!canInstall" @click="install">{{ working ? '安装中…' : plan?.relation === 'same' ? '重新安装' : '安装' }}</button>
      <button v-else class="trpg-btn trpg-btn--primary" type="button" data-autofocus @click="modal.close(true)">完成</button>
    </div>
  </div>
</template>

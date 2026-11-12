<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { KernelCheck } from '../../core/saves/kernel'
import { TrpgError } from '../../core/errors'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { useSavesStore } from '../../stores/saves'
import { useToastStore } from '../../stores/toast'
import { errorText } from '../format'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import { getSource } from '../../library/sources'
import { downloadOfficialBook, installBrewSources } from '../libview/deps-flow'

export interface LoadTarget { id: string; name: string; ruleId: string; ownerKey: string; ownerLabel: string }

/**
 * 读取确认（合并成一页）：系统先检查，只显示适用的块，用户只做一次决定。
 * 不能读取的少数情况（规则没装）只写原因，[读取]不可点；缺书不是阻断（能看能导出，用到它的结算暂停，数据不丢）。
 */
const props = defineProps<{ save: LoadTarget }>()
const app = useAppStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const saves = useSavesStore()
const toast = useToastStore()

const check = shallowRef<KernelCheck | null>(null)
const checkError = ref('')
const working = ref(false)
const saveFirst = ref(true)
const skipAuto = computed(() => app.settings?.skipAutoSaveOnLoad ?? false)

const rules = computed(() => app.svc().rules)
const ruleName = (id: string) => rules.value.get(id)?.name ?? id
const switching = computed(() => !!campaign.workspace && campaign.workspace.ruleId !== props.save.ruleId)
const showDirty = computed(() => campaign.hasCampaign && campaign.dirty)
const otherCard = computed(() => !!campaign.owner && props.save.ownerKey !== campaign.owner.ownerKey)
const ruleBlocked = computed(() => !rules.value.has(props.save.ruleId) || !!check.value?.ruleMissing)
// 资料版本变了：只一行提示（读档不改存档；详情默认显示新版资料）
const changed = computed(() => !!check.value?.plan.versionChanged)
// 读档三张清单（P5 B-34）：缺的包（默认勾，读取时一起下载）· 包在但本战役关着（默认不勾，勾了就开启）· 资料版本变了（一行提示）
const downloadPick = ref<Record<string, boolean>>({})
const closedPick = ref<Record<string, boolean>>({})
const plan = computed(() => check.value?.plan ?? null)
type DlItem = NonNullable<typeof plan.value>['download'][number]
// 按书、按包补装（P5 T6）：官方给出书就只下这本；自制按缺的来源补装（作者自动带依赖）
const dlKey = (d: DlItem): string => `${d.set}|${d.book?.id ?? ''}|${(d.sources ?? []).join(',')}|${d.via ?? ''}`
const isDl = (d: DlItem): boolean => downloadPick.value[dlKey(d)] ?? true
const dlLabel = (d: DlItem): string => {
  if (d.kind === 'official') return d.book ? `《${d.book.name}》` : `${getSource(d.set).codeSet === 'en' ? '英文' : '中文'}官方资料（查不出在哪本书，只能整套下载）`
  if (d.via) return `依赖包 ${(d.sources ?? []).join('、')}（「${d.via.replace(/\.json$/, '')}」缺了它读不出）`
  return d.sources?.length ? `自制包（来源 ${d.sources.join('、')}）` : '自制包（查不出来源）'
}
const MISSING_REASON: Record<string, string> = { 'not-installed': '资料没装', 'not-found': '资料里没有这一条' }

async function setSkipAuto(on: boolean): Promise<void> {
  try {
    await app.updateSettings({ skipAutoSaveOnLoad: on })
  } catch (error) {
    console.error('[trpg-assistant] 保存设置失败', error)
    toast.error(`保存设置失败：${errorText(error)}`)
  }
}

onMounted(async () => {
  if (!app.settings) await app.refreshSettings().catch((e) => console.error('[trpg-assistant] 读取设置失败', e))
  try {
    check.value = await app.svc().backend.kernelSave.checkSave(props.save.id)
    downloadPick.value = Object.fromEntries((check.value.plan?.download ?? []).map((d) => [dlKey(d), true]))
  } catch (error) {
    console.error('[trpg-assistant] 读取前检查失败', error)
    checkError.value = errorText(error)
  }
})

async function doLoad(): Promise<void> {
  if (working.value || ruleBlocked.value) return
  working.value = true
  try {
    if (showDirty.value && saveFirst.value) await campaign.save()
    await campaign.load(props.save.id, { allowRuleSwitch: switching.value || !campaign.hasCampaign, skipAutoSave: skipAuto.value })
    // 勾选的缺包一起下载（官方按书 / 自制按来源，都在后台，进度在【库】标志上）；勾了的关着的包在本战役开启
    const s = app.svc()
    for (const d of (plan.value?.download ?? []).filter(isDl)) {
      if (d.kind === 'official') { void (d.book ? downloadOfficialBook(s, { set: d.set, id: d.book.id, name: d.book.name }) : s.backend.library.downloads.official(d.set, { books: null })).catch((e: unknown) => console.error('[trpg-assistant] 开始下载失败', e)) }
      else if (d.sources?.length) void installBrewSources(s, d.set, d.sources, dlLabel(d), toast)
    }
    const open = (plan.value?.closed ?? []).filter((c) => closedPick.value[c.source]).map((c) => c.source)
    if (open.length) await app.svc().backend.kernelSave.openSources(props.save.ownerKey, open)
    await saves.refresh()
    const missing = check.value?.missing.length ?? 0
    toast.success(`已读取「${props.save.name}」${missing ? `（有 ${missing} 项资料缺失）` : ''}`)
    modal.close(true)
  } catch (error) {
    console.error('[trpg-assistant] 读取存档失败', error)
    toast.error(error instanceof TrpgError ? error.message : `读取失败：${errorText(error)}`)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="trpg-drawer" data-testid="load-confirm">
    <div class="trpg-drawer__body">
      <p v-if="!check && !checkError" class="trpg-loading" role="status"><span class="trpg-spinner" aria-hidden="true" />正在检查这个存档…</p>
      <div class="trpg-checks">
        <div data-testid="load-lead">
          <b>读取「{{ save.name }}」</b>
          <span>当前战役会换成这个存档的样子。{{ skipAuto ? '读取前不会自动备份当前内容。' : '读取前，当前内容会先自动存一份，随时能找回。' }}</span>
          <Checkbox :model-value="skipAuto" data-testid="load-skip-auto" @update:model-value="setSkipAuto">不自动备份当前存档</Checkbox>
          <span class="trpg-field__hint">勾上后会记住，以后读取都不再自动备份；当前未保存的内容读取后无法找回。</span>
        </div>
        <div v-if="checkError"><b><Icon name="warning" :size="16" />没能检查这个存档</b><span>{{ checkError }}</span><span class="trpg-field__hint">仍可尝试读取；读取失败时当前战役不会被改动。</span></div>
        <div v-if="ruleBlocked" data-kind="block" data-testid="load-blocked"><b><Icon name="warning" :size="16" />暂时不能读取</b><span>这个存档属于「{{ ruleName(save.ruleId) }}」，这台设备还没有这套规则。</span><span class="trpg-field__hint">存档原文件保持不动，装好这套规则后再来读取。你仍然可以导出它。</span></div>
        <div v-if="showDirty" data-testid="load-dirty">
          <b>当前有未保存的改动</b>
          <Checkbox :model-value="saveFirst" @update:model-value="saveFirst = true">先保存「{{ campaign.currentSave?.name ?? '当前存档' }}」再读取</Checkbox>
          <Checkbox :model-value="!saveFirst" @update:model-value="saveFirst = false">不保存，直接读取</Checkbox>
          <span class="trpg-field__hint">{{ skipAuto ? '没有自动备份：选「不保存」会丢掉当前未保存的改动。' : '无论选哪个，当前内容都会先自动存一份。' }}</span>
        </div>
        <div v-if="switching && !ruleBlocked"><b>这个存档属于其他规则</b><span>「{{ save.name }}」使用 {{ ruleName(save.ruleId) }}。读取后，整个助手会切换为该规则的界面与资料；当前的「{{ campaign.currentSave?.name ?? '存档' }}」会先写入自动存档。</span></div>
        <div v-if="otherCard"><b>这个存档属于其他角色卡「{{ save.ownerLabel }}」</b><span>读取时会复制成这张卡的新存档「{{ save.name }}（来自 {{ save.ownerLabel }}）」，成为一个独立战役。</span></div>
        <div v-if="plan?.download.length" data-testid="load-download">
          <b>缺少数据包 —— 为防止存档数据损坏，建议下载下面的包</b>
          <span class="trpg-field__hint">读取后在后台下载，进度见【库】标志；自制包的依赖会按作者程序一起装。</span>
          <Checkbox v-for="d in plan.download" :key="dlKey(d)" :model-value="isDl(d)" :disabled="d.kind === 'brew' && !d.sources?.length" @update:model-value="(v: boolean) => (downloadPick[dlKey(d)] = v)">{{ dlLabel(d) }}<span class="lib-src">（{{ d.refs }} 项用到{{ d.labels.length ? `：${d.labels.slice(0, 2).join('、')}` : '' }}）</span></Checkbox>
        </div>
        <div v-if="plan?.closed.length" data-testid="load-closed">
          <b>包在，但本战役关着</b>
          <span class="trpg-field__hint">勾选后在本战役里开启；不勾就保持关着，存档里的引用照常能看。</span>
          <Checkbox v-for="c in plan.closed" :key="c.source" :model-value="!!closedPick[c.source]" @update:model-value="(v: boolean) => (closedPick[c.source] = v)">{{ c.source }}<span class="lib-src">（{{ c.refs }} 项用到：{{ c.labels.slice(0, 2).join("、") }}）</span></Checkbox>
        </div>
        <div v-if="check?.missing.length" data-testid="load-missing">
          <b>缺少 {{ check.missing.length }} 项资料</b>
          <span v-for="(m, i) in check.missing.slice(0, 8)" :key="i">{{ m.actorName }} · {{ m.ref.label ?? m.ref.hash }}（{{ MISSING_REASON[m.reason] ?? m.reason }}）</span>
          <span v-if="check.missing.length > 8" class="trpg-field__hint">另有 {{ check.missing.length - 8 }} 项…</span>
          <span class="trpg-field__hint">仍可读取和导出；用到它们的结算会暂停，数据不会丢。</span>
        </div>
        <div v-if="changed" data-testid="load-changed"><span class="trpg-field__hint">有条目的资料版本变了，已使用新版；存档里的改动（数量、等级等）不受影响。</span></div>
      </div>
    </div>
    <footer class="trpg-drawer__bottom trpg-drawer__bottom--confirm">
      <button class="trpg-btn" type="button" @click="modal.pop()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" data-testid="load-go" data-autofocus :disabled="working || ruleBlocked || (!check && !checkError)" @click="doLoad">{{ working ? '正在读取…' : '读取' }}</button>
    </footer>
  </div>
</template>

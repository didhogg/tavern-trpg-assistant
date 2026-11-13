<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import type { ConvertMode, ConverterInfo, EntryType } from '../../library/custom-new'
import type { CampaignLibrary } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import { useUiStore } from '../../stores/ui'
import Segmented from '../kit/Segmented.vue'
import SelectField from '../kit/SelectField.vue'
import { openEditor, type EditSession } from './edit-flow'
import type { Ent } from './edit-json'
import EmbeddedEntity from './EmbeddedEntity.vue'
import ErrorBanner from './ErrorBanner.vue'

/**
 * P5.5 u7-9 文字转条目：作者转换器（custom.convert）把粘进来的文字转成条目；作者的提醒原样列出，不替用户改。
 * 宽屏左右并排，窄屏「粘贴文字 | 转换结果」两个标签。
 */
const props = defineProps<{ session: Omit<EditSession, 'ent'>; type?: EntryType; campaign?: CampaignLibrary; onUse?: (entry: Ent) => void }>()
const app = useAppStore()
const lib = useLibViewStore()
const modal = useModalStore()
const ui = useUiStore()
const MODE_LABEL: Record<string, string> = { txt: '文字', md: 'Markdown', html: 'HTML' }
const convs = shallowRef<ConverterInfo[]>([])
const conv = ref('')
const mode = ref<ConvertMode>('txt')
const text = ref('')
const out = shallowRef<{ outputs: unknown[]; warnings: string[] } | null>(null)
const error = ref<string | null>(null)
const busy = ref(false)
const side = ref('in')
const selection = ref('0')
const camp = computed(() => {
  const c = props.campaign ?? lib.campaignLib
  return c ? { ...c, codeSet: props.session.codeSet } : null
})
const cur = computed(() => convs.value.find((c) => c.id === conv.value) ?? null)
const results = computed(() => (out.value?.outputs ?? []).filter((x): x is Ent => !!x && typeof x === 'object' && !Array.isArray(x)))
const selected = computed(() => results.value[Number(selection.value)] ?? null)
watch(conv, () => { mode.value = cur.value?.modes[0] ?? 'txt' })
watch([conv, mode, text], () => { out.value = null })
function setMode(value: string | undefined): void {
  const supported = cur.value?.modes.find((m) => m === value)
  if (supported) mode.value = supported
}

onMounted(async () => {
  try {
    const all = await app.svc().backend.library.custom.converters(props.session.codeSet)
    convs.value = all.filter((c) => c.prop === props.session.prop && (!props.type || props.type.starts.convert.includes(c.id)))
    conv.value = convs.value[0]?.id ?? ''
    mode.value = convs.value[0]?.modes[0] ?? 'txt'
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
})
async function sample(): Promise<void> {
  if (!camp.value || !conv.value || busy.value) return
  busy.value = true
  error.value = null
  try {
    text.value = (await app.svc().backend.library.custom.converterSample(camp.value, conv.value, mode.value)) ?? ''
    out.value = null
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) } finally { busy.value = false }
}
async function run(): Promise<void> {
  if (!camp.value || !conv.value || !text.value.trim() || busy.value) return
  busy.value = true
  error.value = null
  out.value = null
  try {
    out.value = await app.svc().backend.library.custom.convert(camp.value, conv.value, mode.value, text.value)
    selection.value = '0'
    side.value = 'out'
  } catch (e) { console.error('[trpg-assistant] 文字转条目失败', e); error.value = e instanceof Error ? e.message : String(e) } finally { busy.value = false }
}
const narrow = computed(() => ui.layout === 'narrow')
function go(): void {
  if (!selected.value) return
  const entry = structuredClone(selected.value)
  if (!entry.name && typeof entry.caption === 'string') entry.name = entry.caption
  if (props.onUse) props.onUse(entry)
  else openEditor({ ...props.session, ent: entry })
}
</script>

<template>
  <div class="lib-mbody" data-testid="start-convert">
    <div class="lib-etop">
      <SelectField v-if="convs.length > 1" v-model="conv" label="转换器" :disabled="busy" :options="convs.map((c) => ({ value: c.id, label: c.id }))" />
      <span v-if="cur && cur.modes.length > 1">格式</span>
      <Segmented v-if="cur && cur.modes.length > 1" :model-value="mode" label="格式" :options="cur.modes.map((m) => ({ value: m, label: MODE_LABEL[m] ?? m, disabled: busy }))" @update:model-value="setMode" />
      <span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" :disabled="busy || !cur?.samples.includes(mode)" data-testid="convert-sample" @click="sample">填入作者示例</button></span>
    </div>
    <div v-if="narrow" class="lib-filter"><Segmented v-model="side" label="文字转条目" :options="[{ value: 'in', label: '粘贴文字' }, { value: 'out', label: '转换结果' }]" /></div>
    <p v-if="onUse" class="lib-filter lib-muted">确认后会替换这一栏的表单。另一种语言会保留。</p>
    <ErrorBanner v-if="error" :text="error" what="文字转条目" dismissible @dismiss="error = null" />
    <div class="lib-two">
      <div v-if="!narrow || side === 'in'"><span class="lib-form__sec">粘贴文字</span><textarea v-model="text" class="trpg-input lib-convert__in" :readonly="busy" :placeholder="`把${session.typeName}的文字粘进来`" aria-label="粘贴文字" data-testid="convert-text" /></div>
      <div v-if="!narrow || side === 'out'" class="lib-convert__out">
        <span class="lib-form__sec">转换结果（作者渲染）</span>
        <div class="lib-lines">
          <p v-if="!out" class="lib-muted">点下面的【转换】看结果。</p>
          <template v-else>
            <p v-if="!selected" class="lib-muted">作者的转换器没有转出条目。</p>
            <SelectField v-if="results.length > 1" v-model="selection" label="选一条转换结果" :options="results.map((entry, i) => ({ value: String(i), label: String(entry.name ?? entry.caption ?? `第 ${i + 1} 条`) }))" />
            <b v-else-if="selected?.name || selected?.caption">{{ selected.name || selected.caption }}</b>
            <EmbeddedEntity v-if="selected" :prop="session.prop" :item="selected" :code-set="session.codeSet" />
            <div v-for="(w, i) in out.warnings" :key="i" class="lib-banner lib-banner--warn" data-testid="convert-warning"><span>作者的提醒（原样）：{{ w }}</span></div>
          </template>
        </div>
      </div>
    </div>
    <div class="lib-ebar"><button v-if="onUse" class="trpg-btn" type="button" @click="modal.pop()">取消</button><span class="lib-end"><button class="trpg-btn" type="button" :disabled="busy || !cur || !text.trim()" data-testid="convert-run" @click="run">{{ busy ? '正在转换…' : out ? '重新转换' : '转换' }}</button><button class="trpg-btn trpg-btn--primary" type="button" :disabled="busy || !selected" data-testid="convert-go" @click="go">{{ onUse ? '替换这一栏' : '进编辑器' }}</button></span></div>
  </div>
</template>

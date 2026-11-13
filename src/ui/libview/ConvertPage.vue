<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { ConverterInfo, EntryType } from '../../library/custom-new'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
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
const props = defineProps<{ session: Omit<EditSession, 'ent'>; type: EntryType }>()
const app = useAppStore()
const lib = useLibViewStore()
const ui = useUiStore()
const MODE_LABEL: Record<string, string> = { txt: '文字', md: 'Markdown', html: 'HTML' }
const convs = shallowRef<ConverterInfo[]>([])
const conv = ref('')
const mode = ref<'txt' | 'md' | 'html'>('txt')
const text = ref('')
const out = shallowRef<{ outputs: unknown[]; warnings: string[] } | null>(null)
const error = ref<string | null>(null)
const busy = ref(false)
const side = ref('in')
const camp = computed(() => (lib.campaignLib ? { ...lib.campaignLib, codeSet: props.session.codeSet } : null))
const cur = computed(() => convs.value.find((c) => c.id === conv.value) ?? null)
const first = computed(() => (out.value?.outputs[0] as Ent | undefined) ?? null)

onMounted(async () => {
  try {
    const all = await app.svc().backend.library.custom.converters(props.session.codeSet)
    convs.value = all.filter((c) => props.type.starts.convert.includes(c.id))
    conv.value = convs.value[0]?.id ?? ''
    mode.value = convs.value[0]?.modes[0] ?? 'txt'
  } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
})
async function sample(): Promise<void> {
  if (!camp.value || !conv.value) return
  try { text.value = (await app.svc().backend.library.custom.converterSample(camp.value, conv.value, mode.value)) ?? '' } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
}
async function run(): Promise<void> {
  if (!camp.value || !conv.value || !text.value.trim()) return
  busy.value = true
  error.value = null
  try {
    out.value = await app.svc().backend.library.custom.convert(camp.value, conv.value, mode.value, text.value)
    side.value = 'out'
  } catch (e) { console.error('[trpg-assistant] 文字转条目失败', e); error.value = e instanceof Error ? e.message : String(e) } finally { busy.value = false }
}
const narrow = computed(() => ui.layout === 'narrow')
const go = () => { if (first.value) openEditor({ ...props.session, ent: structuredClone(first.value) }) }
</script>

<template>
  <div class="lib-mbody" data-testid="start-convert">
    <div class="lib-etop">
      <SelectField v-if="convs.length > 1" v-model="conv" label="转换器" :options="convs.map((c) => ({ value: c.id, label: c.id }))" />
      <span v-if="cur && cur.modes.length > 1">格式</span>
      <Segmented v-if="cur && cur.modes.length > 1" v-model="mode" label="格式" :options="cur.modes.map((m) => ({ value: m, label: MODE_LABEL[m] ?? m }))" />
      <span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" :disabled="!cur?.samples.includes(mode)" data-testid="convert-sample" @click="sample">填入作者示例</button></span>
    </div>
    <div v-if="narrow" class="lib-filter"><Segmented v-model="side" label="文字转条目" :options="[{ value: 'in', label: '粘贴文字' }, { value: 'out', label: '转换结果' }]" /></div>
    <ErrorBanner v-if="error" :text="error" what="文字转条目" dismissible @dismiss="error = null" />
    <div class="lib-two">
      <div v-if="!narrow || side === 'in'"><span class="lib-form__sec">粘贴文字</span><textarea v-model="text" class="trpg-input lib-convert__in" :placeholder="`把${type.name}的文字粘进来`" aria-label="粘贴文字" data-testid="convert-text" /></div>
      <div v-if="!narrow || side === 'out'" class="lib-convert__out">
        <span class="lib-form__sec">转换结果（作者渲染）</span>
        <div class="lib-lines">
          <p v-if="!out" class="lib-muted">点下面的【转换】看结果。</p>
          <template v-else>
            <p v-if="!first" class="lib-muted">作者的转换器没有转出条目。</p>
            <p v-else-if="out.outputs.length > 1" class="lib-muted">转出 {{ out.outputs.length }} 条，先用第 1 条。</p>
            <EmbeddedEntity v-if="first" :prop="session.prop" :item="first" :code-set="session.codeSet" />
            <div v-for="(w, i) in out.warnings" :key="i" class="lib-banner lib-banner--warn" data-testid="convert-warning"><span>作者的提醒（原样）：{{ w }}</span></div>
          </template>
        </div>
      </div>
    </div>
    <div class="lib-ebar"><span class="lib-end"><button class="trpg-btn" type="button" :disabled="busy || !text.trim()" data-testid="convert-run" @click="run">{{ busy ? '正在转换…' : out ? '重新转换' : '转换' }}</button><button class="trpg-btn trpg-btn--primary" type="button" :disabled="!first" data-testid="convert-go" @click="go">进编辑器</button></span></div>
  </div>
</template>

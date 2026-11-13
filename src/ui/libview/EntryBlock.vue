<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import Icon from '../kit/Icon.vue'
import { CODESET_KEY } from './entry-blocks'

/**
 * 正文的一段（P5.5 §16.7 第 2 条）：
 * - 纯文字：文字框 + 小工具栏（骰子、加粗、斜体：插入作者的行内标签，不动别的字）；
 * - 小标题段、列表、表格……：能无损来回转的（后端 custom.blockMarkdown 用作者 Markdown 程序实测）给一个 Markdown 框，
 *   离开框时用作者转换器转回（custom.markdownBlocks）；写成了几段就拆成几段；
 * - 转回来会变样的：不动它，在 JSON 里改。
 */
const props = defineProps<{ value: unknown; label: string }>()
const emit = defineEmits<{ update: [v: unknown]; split: [blocks: unknown[]]; json: [] }>()
const app = useAppStore()
const codeSet = inject(CODESET_KEY, ref('cn'))
const plain = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T

// ---- 纯文字 ----
const box = ref<HTMLTextAreaElement | null>(null)
/** 在光标处插入 / 把选中的字包起来（作者行内标签写法 {@tag 文字}）。 */
function wrap(tag: string, placeholder: string): void {
  const el = box.value
  const text = typeof props.value === 'string' ? props.value : ''
  const a = el?.selectionStart ?? text.length, b = el?.selectionEnd ?? text.length
  const inner = text.slice(a, b) || placeholder
  const ins = `{@${tag} ${inner}}`
  emit('update', text.slice(0, a) + ins + text.slice(b))
  requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(a + tag.length + 3, a + tag.length + 3 + inner.length) })
}

// ---- 其他段：Markdown ----
const state = ref<'loading' | 'md' | 'json'>('loading')
const md = ref('')
const err = ref<string | null>(null)
let lastSent = ''
async function load(): Promise<void> {
  if (typeof props.value === 'string' || props.value == null) return
  state.value = 'loading'
  try {
    const m = await app.svc().backend.library.custom.blockMarkdown(codeSet.value, plain(props.value))
    if (m == null) { state.value = 'json'; return }
    md.value = lastSent = m
    state.value = 'md'
  } catch (e) { console.warn('[trpg-assistant] 这一段转 Markdown 没成功，留给 JSON', e); state.value = 'json' }
}
onMounted(() => void load())
// 外面换了这一段（撤销、从 JSON 改了）才重读；自己刚转回去的不重读
watch(() => props.value, (v, old) => { if (typeof v !== 'string' && JSON.stringify(v) !== JSON.stringify(old) && !applying) void load() })
let applying = false
async function apply(): Promise<void> {
  if (md.value === lastSent) return
  err.value = null
  try {
    const blocks = await app.svc().backend.library.custom.markdownBlocks(codeSet.value, md.value, plain(props.value))
    if (!blocks.length) { err.value = '这一段空了：不要的话点右边 × 删掉'; return }
    lastSent = md.value
    applying = true
    if (blocks.length === 1) emit('update', blocks[0])
    else emit('split', blocks)
    requestAnimationFrame(() => { applying = false })
  } catch (e) { err.value = `没转成正文：${e instanceof Error ? e.message : String(e)}。文字还在，改一下再试` }
}
</script>

<template>
  <div v-if="typeof value === 'string' || value == null" class="lib-block">
    <div class="lib-block__bar" role="toolbar" :aria-label="`${label}的格式`">
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" title="插入骰子，例如 2d6；先选中文字就把它变成骰子" data-testid="block-dice" @click="wrap('dice', '1d6')"><Icon name="dice-five" :size="14" />骰子</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" title="加粗选中的字" @click="wrap('b', '加粗的字')"><b>B</b></button>
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" title="斜体选中的字" @click="wrap('i', '斜体的字')"><i>I</i></button>
    </div>
    <textarea ref="box" class="trpg-input lib-para" rows="3" :value="typeof value === 'string' ? value : ''" :aria-label="label" @input="emit('update', ($event.target as HTMLTextAreaElement).value)" />
  </div>
  <div v-else-if="state === 'loading'" class="lib-skel" aria-busy="true"><i /></div>
  <div v-else-if="state === 'md'" class="lib-block" data-testid="block-md">
    <span class="lib-faint" style="font-size: 12px">Markdown：#### 小标题 · - 列表 · | 表格 |</span>
    <textarea v-model="md" class="trpg-input lib-para lib-mono" :rows="Math.min(14, Math.max(3, md.split('\n').length + 1))" :aria-label="`${label}（Markdown）`" @blur="apply" />
    <span v-if="err" class="trpg-field__err"><Icon name="warning" :size="14" />{{ err }}</span>
  </div>
  <button v-else class="lib-tojson" type="button" @click="emit('json')"><Icon name="info" :size="14" />这一段格式比较复杂，转成文字会丢格式，在 JSON 里改 ›</button>
</template>

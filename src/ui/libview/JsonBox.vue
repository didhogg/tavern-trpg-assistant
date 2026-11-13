<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { basicSetup, EditorView } from 'codemirror'
import { json } from '@codemirror/lang-json'
import { autocompletion, type CompletionContext } from '@codemirror/autocomplete'
import { lintGutter, setDiagnostics, type Diagnostic } from '@codemirror/lint'
import { EditorState } from '@codemirror/state'

/**
 * JSON 代码编辑框（P5.5 §8.1，CodeMirror 6 基础件）：行号、高亮、错误标在行上、字段名补全。
 * 错误由调用方给（插件现有校验器的结果换成行号）；补全的字段名由调用方给（字段表）。只编辑文字，不解析数据。
 */
export interface JsonIssue { line: number; text: string }
const props = defineProps<{ issues?: JsonIssue[]; keys?: string[]; readonly?: boolean; label: string }>()
const model = defineModel<string>({ required: true })
const host = ref<HTMLElement | null>(null)
let view: EditorView | null = null

function complete(ctx: CompletionContext) {
  const word = ctx.matchBefore(/"[\w$-]*/)
  if (!word || !props.keys?.length) return null
  return { from: word.from + 1, options: props.keys.map((k) => ({ label: k, type: 'property' })) }
}
function pushIssues(): void {
  if (!view) return
  const doc = view.state.doc
  const list: Diagnostic[] = (props.issues ?? []).filter((i) => i.line >= 1 && i.line <= doc.lines).map((i) => { const l = doc.line(i.line); return { from: l.from, to: l.to, severity: 'error', message: i.text } })
  view.dispatch(setDiagnostics(view.state, list))
}
onMounted(() => {
  if (!host.value) return
  view = new EditorView({
    parent: host.value,
    root: host.value.getRootNode() as ShadowRoot | Document,
    state: EditorState.create({
      doc: model.value,
      extensions: [
        basicSetup, json(), lintGutter(), autocompletion({ override: [complete] }),
        EditorState.readOnly.of(!!props.readonly), EditorView.contentAttributes.of({ 'aria-label': props.label }),
        EditorView.updateListener.of((u) => { if (u.docChanged) model.value = u.state.doc.toString() }),
      ],
    }),
  })
  pushIssues()
})
watch(model, (v) => {
  if (view && v !== view.state.doc.toString()) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } })
})
watch(() => props.issues, pushIssues, { deep: true })
onBeforeUnmount(() => { view?.destroy(); view = null })
/** 跳到某一行（错误横幅里的 [跳到这一行]）。 */
function goLine(line: number): void {
  if (!view || line < 1 || line > view.state.doc.lines) return
  const l = view.state.doc.line(line)
  view.dispatch({ selection: { anchor: l.from }, scrollIntoView: true })
  view.focus()
}
defineExpose({ goLine })
</script>

<template>
  <div ref="host" class="lib-cmhost" data-testid="json-box" />
</template>

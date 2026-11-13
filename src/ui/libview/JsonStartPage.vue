<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { openEditor, type EditSession } from './edit-flow'
import { fromText, issueLines, toText } from './edit-json'
import JsonBox, { type JsonIssue } from './JsonBox.vue'

/**
 * P5.5 u7-8c 起点：粘贴 JSON（代码编辑框：行号、高亮、错误标在行上、字段名补全）。
 * [检查] 用插件现有的结构检查（custom.validateEntry），错误换成这段文字的行号；[进表单] 带着这一条进编辑器（还没存）。
 */
const props = defineProps<{ session: EditSession | Omit<EditSession, 'ent'> }>()
const app = useAppStore()
const text = ref('ent' in props.session ? toText(props.session.ent) : '{\n  "name": ""\n}')
const issues = ref<JsonIssue[]>([])
const checked = ref(false)
const keys = ref<string[]>([])
const box = ref<InstanceType<typeof JsonBox> | null>(null)
onMounted(async () => {
  try { keys.value = ((await app.svc().backend.library.custom.fields(props.session.codeSet, props.session.prop))?.fields ?? []).filter((f) => !f.internal).map((f) => f.name) } catch (e) { console.warn('[trpg-assistant] 字段表没读出来，补全先不给', e) }
})
async function check(): Promise<boolean> {
  const r = fromText(text.value)
  checked.value = true
  if (!r.ok) { issues.value = [r.issue]; return false }
  const found = await app.svc().backend.library.custom.validateEntry(props.session.codeSet, props.session.prop, r.ent)
  issues.value = issueLines(r.pointers, props.session.prop, found)
  return true
}
async function next(): Promise<void> {
  if (!(await check())) return
  const r = fromText(text.value)
  if (r.ok) openEditor({ ...props.session, ent: r.ent })
}
</script>

<template>
  <div class="lib-mbody" data-testid="start-json">
    <div class="lib-etop"><span>粘贴一整条（作者格式）；输入 " 会提示字段名</span></div>
    <div class="lib-jsonwrap"><JsonBox ref="box" v-model="text" :issues="issues" :keys="keys" label="条目 JSON" /></div>
    <div v-if="issues.length" class="lib-cm__err" data-testid="json-issues">
      <div v-for="(i, n) in issues.slice(0, 3)" :key="n" class="lib-banner lib-banner--err"><span>第 {{ i.line }} 行：{{ i.text }}</span><button class="trpg-btn trpg-btn--small trpg-btn--quiet lib-end" type="button" @click="box?.goLine(i.line)">跳到这一行</button></div>
    </div>
    <div v-else-if="checked" class="lib-cm__err"><div class="lib-banner"><span>结构检查通过。</span></div></div>
    <div class="lib-ebar"><span class="lib-end"><button class="trpg-btn" type="button" data-testid="json-check" @click="check">检查</button><button class="trpg-btn trpg-btn--primary" type="button" data-testid="json-go" @click="next">进表单</button></span></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import { downloadJson } from './mine'

/** P5.5 u7-5 导入预览：每个文件一块（新增几条 · 结构提示 · 作者报错）+ 会顶掉哪个已有的包。只排版后端 bilingual.previewImport 的结果。 */
interface Pre {
  lang: string
  codeSet: string
  preview: {
    files: Array<{ filename: string | null; entries: number }>
    newEntries: number
    alternatives: unknown[]
    notJson: string[]
    rejected: Array<{ name: string; reason: string }>
    replaces: Array<{ file: string; pack: string; docIdLocal: string; filename: string | null; downloaded: boolean }>
    authorErrors: unknown[]
    structure: Array<{ name: string; ok: boolean; issues: Array<{ text: string }> }>
  }
}
const props = defineProps<{ groups: Pre[]; onAnswer: (v: boolean) => void }>()
const app = useAppStore()
const toast = useToastStore()
const replaces = computed(() => props.groups.flatMap((g) => g.preview.replaces.map((r) => ({ ...r, codeSet: g.codeSet }))))
const blocks = computed(() => props.groups.flatMap((g) => g.preview.structure.map((st) => {
  const f = g.preview.files.find((x) => x.filename === st.name)
  return { name: st.name, lang: g.lang, entries: f?.entries ?? null, ok: st.ok, issues: st.issues, replace: g.preview.replaces.find((r) => r.file === st.name) ?? null, rejected: g.preview.rejected.find((r) => r.name === st.name) ?? null }
})))
const total = computed(() => props.groups.reduce((n, g) => n + g.preview.newEntries, 0))
const errors = computed(() => props.groups.flatMap((g) => [...g.preview.authorErrors.map(String), ...g.preview.notJson.map((n) => `不是 JSON，已跳过：${n}`)]))
const exported = ref(new Set<string>())
async function exportOld(r: (typeof replaces.value)[number]): Promise<void> {
  try {
    const out = await app.svc().backend.library.custom.exportPack(r.codeSet, r.pack)
    downloadJson(out.filename ?? r.filename ?? `${r.pack}.json`, out.body)
    exported.value = new Set([...exported.value, r.file])
    toast.success('已导出旧包')
  } catch (e) { console.error('[trpg-assistant] 导出旧包失败', e); toast.error(e instanceof Error ? e.message : '导出旧包没有成功') }
}
</script>

<template>
  <div class="trpg-confirm" data-testid="import-preview">
    <p class="trpg-confirm__message">{{ replaces.length ? `一共新增 ${total} 条。注意：有 ${replaces.length} 个文件会顶掉你已有的包。` : `一共新增 ${total} 条，检查通过就可以导入。` }}</p>
    <div class="trpg-confirm__scroll lib-stack" tabindex="0">
      <div v-for="b in blocks" :key="b.name" class="lib-file">
        <div class="lib-file__top"><b>{{ b.name }}</b><span class="trpg-badge">{{ b.lang === 'zh' ? '中文' : 'English' }}</span><span v-if="b.rejected" class="trpg-badge" data-tone="danger">不会导入</span><span v-else class="trpg-badge" :data-tone="b.ok ? 'success' : 'warn'">{{ b.ok ? '可以导入' : '有提示，仍可导入' }}</span></div>
        <div class="lib-kv"><span v-if="b.entries != null">条目 <b>{{ b.entries }}</b> 条</span><span v-if="b.rejected">{{ b.rejected.reason }}</span><span v-for="(it, i) in b.issues.slice(0, 2)" :key="i">{{ it.text }}</span></div>
        <div v-if="b.replace" class="lib-banner lib-banner--warn" data-testid="import-replace">
          <Icon name="warning" :size="16" />
          <span>会顶掉{{ b.replace.downloaded ? '下载来的' : '你已有的' }}包「{{ b.replace.filename?.replace(/\.json$/, '') ?? b.replace.pack }}」：来源编号一样，作者只认一个，旧包里的改动会没有。</span>
          <button v-if="!b.replace.downloaded" class="trpg-btn trpg-btn--small lib-end" type="button" @click="exportOld({ ...b.replace, codeSet: groups.find((g) => g.lang === b.lang)?.codeSet ?? 'cn' })">{{ exported.has(b.name) ? '已导出' : '先导出旧包' }}</button>
        </div>
      </div>
      <details v-if="errors.length" class="lib-muted"><summary>作者程序的提示（{{ errors.length }} 条，断网时常见，一般不影响导入）</summary><ul class="trpg-confirm__details"><li v-for="(e, i) in errors.slice(0, 5)" :key="i">{{ e }}</li></ul></details>
    </div>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" @click="onAnswer(false)">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" data-autofocus data-testid="import-confirm" :disabled="!blocks.some((b) => !b.rejected)" @click="onAnswer(true)">{{ replaces.length ? `确认导入（顶掉 ${replaces.length} 个包）` : '确认导入' }}</button>
    </div>
  </div>
</template>

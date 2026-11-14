<script setup lang="ts">
import { computed, markRaw, ref } from 'vue'
import type { EntryType } from '../../library/custom-new'
import { useAppStore } from '../../stores/app'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import ConvertPage from './ConvertPage.vue'
import { openEditor } from './edit-flow'
import JsonStartPage from './JsonStartPage.vue'
import PickExistingPage from './PickExistingPage.vue'
import TemplatePage from './TemplatePage.vue'

/**
 * P5.5 u7-8 新建条目 ② 选起点：简易表单 / 详细表单（作者模板）/ 从已有的开始 / 文字转条目 / 粘贴 JSON。
 * 这一类有哪几种起点由后端判断（entryTypes → starts），没有的不显示。
 */
const props = defineProps<{ codeSet: string; pack: { id: string; name: string } | null; type: EntryType }>()
const app = useAppStore()
const modal = useModalStore()
const toast = useToastStore()
type Start = 'blank' | 'template' | 'existing' | 'convert' | 'json'
const options = computed(() => {
  const s = props.type.starts
  const out: Array<{ key: Start; title: string; text: string }> = [{ key: 'blank', title: '简易表单', text: '只列必填的几项，空白；其余折在「更多选项」里' }]
  if (s.template) out.push({ key: 'template', title: '详细表单', text: `作者模板：全部字段展开，预先填好作者编辑器里「新${props.type.name}」那一份` })
  if (s.existing) out.push({ key: 'existing', title: `从已有的${props.type.name}开始`, text: `在全库 ${s.existing} 条${props.type.name}里挑一条复制` })
  if (s.convert.length) out.push({ key: 'convert', title: '文字转条目', text: `把书上、网页上的${props.type.name}文字粘进来，作者的转换器转成条目` })
  out.push({ key: 'json', title: '粘贴 JSON', text: '已经有作者格式的 JSON' })
  return out
})
const pick = ref<Start>('blank')
const busy = ref(false)
const base = () => ({ codeSet: props.codeSet, prop: props.type.prop, typeName: props.type.name, pack: props.pack, target: { kind: 'new' as const, pack: props.pack?.id ?? null } })

async function next(): Promise<void> {
  const k = pick.value
  const page = (key: string, title: string, component: object, extra: Record<string, unknown> = {}) => modal.push({ key, title, component: markRaw(component), variant: 'sheet', props: { session: base(), type: props.type, ...extra } })
  if (k === 'template') return page('tpl', `详细表单：新${props.type.name}`, TemplatePage)
  if (k === 'existing') return page('pick', `从已有的${props.type.name}开始`, PickExistingPage)
  if (k === 'convert') return page('convert', `文字转${props.type.name}`, ConvertPage)
  if (k === 'json') return page('json', '粘贴 JSON', JsonStartPage)
  busy.value = true
  try {
    const ent = await app.svc().backend.library.custom.blankEntry(props.codeSet, props.type.prop, props.pack ? { pack: props.pack.id } : {})
    if (!ent) throw new Error(`这套资料不收这一类条目：${props.type.name}`)
    openEditor({ ...base(), ent })
  } catch (e) { console.error('[trpg-assistant] 空白条目没生成', e); toast.error(e instanceof Error ? e.message : '没能开始') } finally { busy.value = false }
}
</script>

<template>
  <div class="lib-mbody" data-testid="new-start">
    <div class="lib-mscroll">
      <div class="lib-pad">
        <div class="lib-choice" role="radiogroup" :aria-label="`新建${type.name}从哪开始`">
          <label v-for="o in options" :key="o.key" :data-on="pick === o.key" data-testid="start-option">
            <input v-model="pick" class="lib-choice__radio" type="radio" name="start" :value="o.key" />
            <b>{{ o.title }}</b><span>{{ o.text }}</span>
          </label>
        </div>
      </div>
    </div>
    <div class="lib-ebar"><span class="lib-end"><button class="trpg-btn trpg-btn--primary" type="button" :disabled="busy" data-testid="start-next" @click="next">下一步</button></span></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import type { EntryType } from '../../library/custom-new'
import { useAppStore } from '../../stores/app'
import { useModalStore } from '../../stores/modal'
import { openEditor, type EditSession } from './edit-flow'
import type { Ent } from './edit-json'
import EmbeddedEntity from './EmbeddedEntity.vue'
import ErrorBanner from './ErrorBanner.vue'

/** P5.5 u7-8a 起点：详细表单（作者模板）——先用作者渲染看看模板里有什么，再决定用不用。 */
const props = defineProps<{ session: Omit<EditSession, 'ent'>; type: EntryType }>()
const app = useAppStore()
const modal = useModalStore()
const tpl = shallowRef<Ent | null>(null)
const error = ref<string | null>(null)
async function load(): Promise<void> {
  error.value = null
  try {
    tpl.value = await app.svc().backend.library.custom.template(props.session.codeSet, props.session.prop)
    if (!tpl.value) error.value = '作者没有这一类的模板'
  } catch (e) { console.error('[trpg-assistant] 读取作者模板失败', e); error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void load())
const go = () => { if (tpl.value) openEditor({ ...props.session, ent: structuredClone(tpl.value), detailed: true }) }
</script>

<template>
  <div class="lib-mbody" data-testid="start-template">
    <div class="lib-mscroll">
      <div class="lib-pad lib-stack">
        <div class="lib-banner"><span>详细表单用的是作者编辑器里「新{{ type.name }}」这一份：全部字段展开，预先填好下面这些内容。</span></div>
        <ErrorBanner v-if="error" :text="error" what="读取作者模板" :actions="[{ label: '重试', run: load }]" />
        <EmbeddedEntity v-else-if="tpl" :prop="session.prop" :item="tpl" :code-set="session.codeSet" />
        <div v-else class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
      </div>
    </div>
    <div class="lib-ebar"><span class="lib-end"><button class="trpg-btn" type="button" @click="modal.pop()">换一种起点</button><button class="trpg-btn trpg-btn--primary" type="button" :disabled="!tpl" data-testid="template-go" @click="go">用详细表单开始</button></span></div>
  </div>
</template>

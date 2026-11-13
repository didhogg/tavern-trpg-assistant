<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { MyPack } from '../../library/custom-packs'
import type { EntryRef } from '../../library/scopes'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import { packTitle } from './mine'
import NewPackPage from './NewPackPage.vue'

/** P5.5 u7-6 单条复制成我的：选存进哪个包（默认上次用的），没有合适的可以当场新建包。复制完给 [打开]。 */
const props = defineProps<{ entryRef: EntryRef; name: string; onDone?: (packId: string, codeSet: string) => void }>()
const app = useAppStore()
const lib = useLibViewStore()
const modal = useModalStore()
const toast = useToastStore()
const codeSet = computed(() => getSource(props.entryRef.set).codeSet)
const packs = ref<MyPack[] | null>(null)
const pick = ref('')
const busy = ref(false)
const err = ref<string | null>(null)

async function load(select?: string): Promise<void> {
  try {
    const custom = app.svc().backend.library.custom
    // 先取默认的包（一个包都没有时后端会建「我的资料」），再列包，免得列表里少了它
    const suggested = select ?? (await custom.suggestedPack(codeSet.value))
    packs.value = await custom.packs(codeSet.value)
    pick.value = suggested
  } catch (e) { console.error('[trpg-assistant] 读取我的库失败', e); err.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void load())
const options = computed(() => (packs.value ?? []).map((p) => ({ value: p.id, label: packTitle(p) })))

function newPack(): void {
  modal.push({ key: 'newpack-inline', title: '新建包', component: NewPackPage, variant: 'sheet', props: { codeSet: codeSet.value, inline: true, onCreated: (id: string) => void load(id) } })
}
async function copy(): Promise<void> {
  if (!pick.value) return
  busy.value = true
  err.value = null
  try {
    await app.svc().backend.library.custom.saveToMine(codeSet.value, { kind: 'entry', ref: props.entryRef }, { pack: pick.value, ...(lib.campaignLib?.rule ? { rule: lib.campaignLib.rule } : {}) })
    const where = options.value.find((o) => o.value === pick.value)?.label ?? pick.value
    const id = pick.value
    modal.pop()
    toast.push('success', `已把「${props.name}」复制进《${where}》`, props.onDone ? { actions: [{ label: '打开', run: () => props.onDone!(id, codeSet.value) }] } : undefined)
    await lib.loadPairs(app.svc())
  } catch (e) {
    console.error('[trpg-assistant] 复制这一条失败', e)
    err.value = e instanceof Error ? e.message : String(e)
  } finally { busy.value = false }
}
</script>

<template>
  <div class="trpg-confirm" data-testid="copy-entry">
    <p class="trpg-confirm__message">把「{{ name }}」复制进【我的库】的一个包，之后在那里改。原来这一条不受影响。</p>
    <div class="lib-form">
      <div v-if="packs === null && !err" class="lib-skel" aria-busy="true"><i /></div>
      <div v-else class="trpg-field">
        <span class="trpg-field__label">存进</span>
        <SelectField v-model="pick" label="存进哪个包" :options="options" placeholder="选一个包" />
      </div>
      <div><button class="trpg-btn trpg-btn--small" type="button" data-testid="copy-entry-newpack" @click="newPack"><Icon name="plus" :size="14" />新建一个包</button></div>
      <span v-if="err" class="trpg-field__err"><Icon name="warning" :size="14" />{{ err }}</span>
    </div>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" @click="modal.pop()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" data-testid="copy-entry-go" :disabled="!pick || busy" @click="copy">{{ busy ? '正在复制…' : '复制' }}</button>
    </div>
  </div>
</template>

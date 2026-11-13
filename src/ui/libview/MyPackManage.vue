<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import SelectField from '../kit/SelectField.vue'
import { ruleOptions } from './mine'
import { runPackMenu } from './mine-actions'
import PackDeps from './PackDeps.vue'
import OverridesList from './OverridesList.vue'

/** P5.5 u7-4 我的库的包 ⋯ → 管理：名字 · 规则与版本 · 房规（覆盖）（u7-14 同一个列表）· 依赖包。 */
const props = defineProps<{ set: string; source: string; name: string; docIdLocal?: string; mine: { id: string; codeSet: string } }>()
const app = useAppStore()
const lib = useLibViewStore()
const toast = useToastStore()
const tab = ref('name')
const missing = ref(0)
const pair = computed(() => lib.pairs?.find((p) => p.id === props.mine.id) ?? null)
const pack = computed(() => (props.mine.codeSet === 'en' ? pair.value?.en : pair.value?.zh) ?? null)

const full = ref('')
const abv = ref('')
watch(pack, (p) => { if (p) { full.value = p.own.full ?? ''; abv.value = p.own.abbreviation ?? '' } }, { immediate: true })
const busy = ref(false)
async function saveName(): Promise<void> {
  if (!full.value.trim()) return
  busy.value = true
  try {
    await app.svc().backend.library.custom.renamePack(props.mine.codeSet, props.mine.id, { full: full.value.trim(), abbreviation: abv.value.trim() || pack.value?.own.json })
    toast.success('名字已保存')
    await lib.loadPairs(app.svc())
  } catch (e) { console.error('[trpg-assistant] 改名失败', e); toast.error(e instanceof Error ? e.message : '没有保存成功') } finally { busy.value = false }
}

const rules = computed(() => ruleOptions(app.svc()))
const rule = ref('')
// 包属于哪套规则由后端判断（MyPack.rule）；改规则交给 custom.setPackRule
watch(pack, (p) => { if (p) rule.value = p.rule ?? '' }, { immediate: true })
async function saveRule(next: string | undefined): Promise<void> {
  const p = pack.value
  if (!p || next === undefined) return
  const opt = rules.value.find((o) => o.value === next)
  try {
    await app.svc().backend.library.custom.setPackRule(props.mine.codeSet, props.mine.id, next || null)
    rule.value = next
    toast.success(`已改成：${opt?.label ?? '未归类'}`)
    await lib.loadPairs(app.svc())
    await lib.refresh(app.svc())
  } catch (e) { console.error('[trpg-assistant] 改规则失败', e); toast.error(e instanceof Error ? e.message : '没有保存成功') }
}
const menu = (key: string) => { if (pair.value) void runPackMenu(app.svc(), key, pair.value, props.mine.codeSet, toast, app.settings?.library.skipRemovePrompt ?? false) }
</script>

<template>
  <div class="lib-mbody" data-testid="mypack-manage">
    <div class="lib-filter"><Segmented v-model="tab" label="管理分区" :options="[{ value: 'name', label: '名字' }, { value: 'rule', label: '规则与版本' }, { value: 'house', label: '房规（覆盖）' }, ...(docIdLocal ? [{ value: 'deps', label: missing ? `依赖包 ⚠${missing}` : '依赖包' }] : [])]" /></div>
    <div v-if="missing && tab !== 'deps'" class="lib-banner lib-banner--warn"><Icon name="warning" :size="16" /><span>这个包缺 {{ missing }} 个依赖，缺了会读不出。</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="tab = 'deps'">查看并下载</button></div>
    <div class="lib-mscroll">
      <div class="lib-pad">
        <PackDeps v-if="docIdLocal" v-show="tab === 'deps'" :set="set" :doc-id-local="docIdLocal" @missing="(n: number) => (missing = n)" />
        <form v-if="tab === 'name' && pack" class="lib-form" data-testid="mypack-name" @submit.prevent="saveName">
          <label class="trpg-field"><span class="trpg-field__label">名字</span><input v-model="full" class="trpg-input" type="text" /></label>
          <label class="trpg-field"><span class="trpg-field__label">缩写</span><input v-model="abv" class="trpg-input" type="text" :placeholder="pack.own.json" /></label>
          <div class="trpg-field">
            <span class="trpg-field__label">编号</span>
            <div class="trpg-input lib-locked">{{ pack.own.json }}<Icon name="lock" :size="14" /></div>
            <span class="trpg-field__hint">编号建好就不能改：别人的包、房规都是靠它找到这个包的</span>
          </div>
          <div><button class="trpg-btn trpg-btn--primary trpg-btn--small" type="submit" :disabled="busy || !full.trim()">保存名字</button></div>
        </form>
        <OverridesList v-else-if="tab === 'house'" :scope="{ kind: 'pack', codeSet: mine.codeSet, id: mine.id }" />
        <div v-else-if="tab === 'rule' && pack" class="lib-form" data-testid="mypack-rule">
          <div class="trpg-field">
            <span class="trpg-field__label">属于规则</span>
            <SelectField :model-value="rule || 'none'" label="属于规则" :options="rules.map((o) => ({ value: o.value || 'none', label: o.label }))" @update:model-value="(v) => saveRule(v === 'none' ? '' : v)" />
            <span class="trpg-field__hint">这个包跟哪套规则一起用：在那套规则的战役里才看得到；导出时包头的版本（作者的 edition）也按它写</span>
          </div>
        </div>
      </div>
    </div>
    <div class="lib-ebar">
      <button class="trpg-btn trpg-btn--small" type="button" @click="menu('copy')"><Icon name="copy" :size="14" />再复制一份</button>
      <button class="trpg-btn trpg-btn--small" type="button" @click="menu('export')"><Icon name="download-simple" :size="14" />导出</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--danger lib-end" type="button" @click="menu('rm')">删除这个包…</button>
    </div>
  </div>
</template>

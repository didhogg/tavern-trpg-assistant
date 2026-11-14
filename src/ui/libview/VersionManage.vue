<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { FieldChange } from '../../library/house-diff'
import type { EntryRef } from '../../library/scopes'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import SelectField from '../kit/SelectField.vue'
import { useEditDiff } from './use-edit-diff'
import { useVersionActions } from './use-version-actions'
import { NO_LEVEL, versionGroups, type VersionGroup, type VersionRow } from './version-rows'
import { valueText } from './value-text'

/**
 * 单条【版本管理】：这一条（中文、英文两条）的全部版本，每个版本作用于哪一层（本战役 / 当前规则 / 全局 / 不使用），房规版本可以删除。
 * 数据：scoped.detail（全部版本）+ custom.edits（哪些版本在哪一层被选用），见 version-rows.ts；动作见 use-version-actions.ts。
 */
const props = defineProps<{ refs: EntryRef[] }>()
const app = useAppStore()
const lib = useLibViewStore()
const groups = shallowRef<VersionGroup[] | null>(null)
const error = ref<string | null>(null)
const { open, diffs, toggle, labelOf } = useEditDiff()

async function load(): Promise<void> {
  error.value = null
  const c = lib.campaignLib
  if (!c) { groups.value = []; return }
  try {
    const chosen = await app.svc().backend.library.custom.edits({ refs: props.refs }, c)
    groups.value = await versionGroups(app.svc(), c, props.refs, chosen)
  } catch (e) { console.error('[trpg-assistant] 读取版本失败', e); error.value = e instanceof Error ? e.message : String(e) }
}
const { levelName, setLevel, removeHouse } = useVersionActions(load)
onMounted(() => void load())

const levels = computed(() => [
  ...(lib.bound ? [{ value: 'campaign', label: '本战役' }] : []),
  ...(lib.campaignLib ? [{ value: `rule:${lib.campaignLib.rule}`, label: '当前规则' }] : []),
  { value: 'global', label: '全局（所有战役）' },
  { value: NO_LEVEL, label: '不使用' },
])
const optionsOf = (r: VersionRow) => (levels.value.some((l) => l.value === r.level) ? levels.value : [{ value: r.level, label: levelName(r.level) }, ...levels.value])
const key = (r: VersionRow) => `${r.ref.hash}|${r.altId}|${r.level}`
const langOf = (r: EntryRef) => { const l = getSource(r.set).lang; return l === 'zh' ? '中文' : l === 'en' ? 'English' : '' }
const offText = (r: VersionRow) => (r.inactive === 'other-rule' ? '（属于别的规则，这个战役用不上）' : '（被上面那层盖住，现在不生效）')
const none = computed(() => !!groups.value && groups.value.every((g) => !g.rows.length))
defineExpose({ load })
</script>

<template>
  <div class="lib-stack" data-testid="version-manage">
    <div v-if="error" class="lib-banner lib-banner--err"><span>版本没读出来：{{ error }}</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="load">重试</button></div>
    <div v-else-if="!groups" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
    <template v-else>
      <p v-if="!lib.bound" class="lib-faint" style="margin: 0; font-size: 12px">现在没有打开战役：只能管规则层和全局层。</p>
      <p v-if="none" class="lib-muted" data-testid="version-none">这一条只有原件，没有别的版本。点条目右上角的 ✎ 改成房规，保存后就会出现在这里。</p>
      <section v-for="g in groups" :key="`${g.ref.set}|${g.ref.hash}`" class="lib-vgroup" data-testid="version-group">
        <div class="lib-sec" style="padding: var(--sp-2) 0 0">{{ g.name }}<span v-if="langOf(g.ref)" class="lib-muted">（{{ langOf(g.ref) }}）</span></div>
        <ul class="lib-edits">
          <li class="lib-erow" data-testid="version-base"><div class="lib-erow__top"><span class="lib-erow__name">原件</span><span class="lib-erow__meta">没有版本被选用时，用的就是它</span></div></li>
          <li v-for="r in g.rows" :key="key(r)" class="lib-erow" :data-off="r.level !== NO_LEVEL && !r.active ? 'true' : undefined" data-testid="version-row">
            <div class="lib-erow__top">
              <span class="lib-erow__name">{{ r.label }}</span>
              <span class="trpg-badge" :data-tone="r.kind === 'house' ? 'warn' : undefined">{{ r.kind === 'house' ? '房规' : '别的版本' }}</span>
              <span v-if="r.level !== NO_LEVEL && r.active" class="trpg-badge" data-tone="success">生效中</span>
              <span class="lib-erow__meta">{{ r.level === NO_LEVEL ? '没有被选用' : `作用于${levelName(r.level)}${r.active ? '' : offText(r)}` }}</span>
              <span class="lib-end lib-inline">
                <SelectField :model-value="r.level" :label="`${r.label} 作用于`" :options="optionsOf(r)" @update:model-value="(v) => v && v !== r.level && setLevel([r], v)" />
                <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="override-open" @click="toggle(key(r), r)">{{ open === key(r) ? '收起' : '看改了什么' }}</button>
                <button v-if="r.house" class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" data-testid="version-delete" @click="removeHouse([r])">删除</button>
              </span>
            </div>
            <div v-if="open === key(r)" class="lib-erow__body" data-testid="override-diff">
              <div v-if="diffs[key(r)] === 'loading'" class="lib-skel" aria-busy="true"><i /></div>
              <span v-else-if="typeof diffs[key(r)] === 'string'" class="lib-muted">没比出来：{{ diffs[key(r)] }}</span>
              <template v-else>
                <span class="lib-muted" style="font-size: 12px">和原件比：</span>
                <p v-if="!(diffs[key(r)] as FieldChange[]).length" class="lib-muted" style="margin: 0">和原件一样。</p>
                <ul v-else class="lib-diff"><li v-for="d in (diffs[key(r)] as FieldChange[])" :key="d.field"><code>{{ labelOf(r, d.field) }}</code><span><s v-if="d.before !== undefined">{{ valueText(d.before) }}</s>{{ d.before !== undefined ? ' → ' : '' }}{{ valueText(d.after) }}</span></li></ul>
              </template>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

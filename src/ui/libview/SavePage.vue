<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { FieldChange } from '../../library/house-diff'
import type { SchemaIssue } from '../../library/brew-validate'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import SelectField from '../kit/SelectField.vue'
import type { Ent } from './edit-json'
import EmbeddedEntity from './EmbeddedEntity.vue'
import { packTitle, sideOf } from './mine'
import { langName } from './use-editor'
import { valueText } from './value-text'

/**
 * P5.5 u7-11 点［完成］→ 预览兼保存：作者渲染占满；作者提醒收成小条；新建只问存进哪个包，改的话列「这次改了哪几项」（两边各列），
 * 改了名字的写「有 n 处用到它」可展开（Q11）。[回去改] 回表单（输入和草稿都在），[保存] 交给编辑器存。
 */
export interface SideInfo { cs: string; before: Ent | null; after: Ent | null; include: boolean }
export interface SaveCtx {
  prop: string
  isNew: boolean
  pack: { id: string; name: string } | null
  main: SideInfo
  other: SideInfo
  /** 改名时旧的作者编号（我的库的条目），用来查有几处用到它。 */
  oldHash?: string
  labelOf: (cs: string) => (field: string) => string
  /** 房规（u7-13）：作用于哪一层（本战役 / 当前规则 / 全局），默认取 设置 → 库 → 偏好。 */
  house?: { levels: Array<{ value: string; label: string }>; level: string; existing?: { where: string[] } }
  /** 新建 / 改：存进的包编号；房规：作用于哪一层；replace = 直接改已有的那条房规（§16.7 第 5 条）。 */
  save: (choice: string, opts?: { replace?: boolean }) => Promise<void>
}
const props = defineProps<{ ctx: SaveCtx }>()
const app = useAppStore()
const lib = useLibViewStore()
const modal = useModalStore()
const lib2 = () => app.svc().backend.library
const changes = shallowRef<Record<'main' | 'other', FieldChange[]>>({ main: [], other: [] })
const notes = shallowRef<Array<SchemaIssue & { side: string }>>([])
const showNotes = ref(false)
const showDiff = ref(true)
const impact = shallowRef<string[] | null>(null)
const showImpact = ref(false)
const pack = ref(props.ctx.pack?.id ?? '')
const packs = computed(() => (lib.pairs ?? []).map((p) => ({ value: p.id, label: packTitle(sideOf(p, props.ctx.main.cs)) })))
const busy = ref(false)
const err = ref<string | null>(null)
const sides = computed(() => (['main', 'other'] as const).filter((k) => props.ctx[k].include && props.ctx[k].after))

onMounted(async () => {
  const out: Record<'main' | 'other', FieldChange[]> = { main: [], other: [] }
  const ns: Array<SchemaIssue & { side: string }> = []
  for (const k of sides.value) {
    const s = props.ctx[k]
    try { out[k] = await lib2().custom.changes(s.cs, s.before, s.after!) } catch (e) { console.warn('[trpg-assistant] 比较改了什么没成功', e) }
    try { ns.push(...(await lib2().custom.validateEntry(s.cs, props.ctx.prop, s.after!)).map((i) => ({ ...i, side: langName(s.cs) }))) } catch (e) { console.warn('[trpg-assistant] 结构检查没跑成', e) }
  }
  changes.value = out
  notes.value = ns
  // 改了名字（我的库的条目）：作者编号会变，先看有几处用到它
  const was = props.ctx.main.before, now = props.ctx.main.after
  if (props.ctx.oldHash && was && now && was.name !== now.name) {
    try {
      const setId = lib.brewSetId(props.ctx.main.cs)
      const r = setId ? await app.svc().backend.entryChangeImpact(setId, [{ prop: props.ctx.prop, hash: props.ctx.oldHash }]) : null
      impact.value = r ? [...r.houseRules.map(() => '一条房规改的是它'), ...r.choices.map((c) => `「${c.level}」层选了它的版本`), ...r.saves.map((x) => `战役「${x.ownerLabel}」${x.saveId ? `的存档「${x.name}」` : '的当前数据'}：${x.why.join('、')}`)] : []
    } catch (e) { console.warn('[trpg-assistant] 查改名影响没成功', e) }
  }
})
const level = ref(props.ctx.house?.level ?? '')
/** 已有房规时：直接改那一条（默认），还是另存一条新的。 */
const mode = ref<'replace' | 'new'>(props.ctx.house?.existing ? 'replace' : 'new')
const replacing = computed(() => mode.value === 'replace' && !!props.ctx.house?.existing)
async function save(): Promise<void> {
  const choice = props.ctx.house ? level.value : pack.value
  if (!choice) { err.value = props.ctx.house ? '选作用于哪一层' : '选一个包'; return }
  busy.value = true
  err.value = null
  try { await props.ctx.save(choice, { replace: replacing.value }) } catch (e) { err.value = e instanceof Error ? e.message : String(e) } finally { busy.value = false }
}
const diffTitle = computed(() => sides.value.map((k) => `${langName(props.ctx[k].cs)}：${props.ctx[k].before ? `${props.ctx.house ? '和原件比' : ''}改了 ${changes.value[k].length} 项` : '新写一条'}`).join(' · '))
</script>

<template>
  <div class="lib-mbody" data-testid="save-page">
    <div class="lib-mscroll">
      <div class="lib-pad lib-stack">
        <button v-if="notes.length" class="lib-notes" type="button" :aria-expanded="showNotes" data-testid="save-notes" @click="showNotes = !showNotes"><Icon name="info" :size="12" />作者提醒 {{ notes.length }} 条 {{ showNotes ? '▾' : '▸' }}</button>
        <div v-if="showNotes" class="lib-stack" style="gap: 6px"><div v-for="(n, i) in notes" :key="i" class="lib-banner lib-banner--warn"><span>{{ n.side }}：{{ n.text }}（只提醒，仍可以存）</span></div></div>
        <EmbeddedEntity :prop="ctx.prop" :item="ctx.main.after" :code-set="ctx.main.cs" />
      </div>
    </div>
    <div class="lib-sum">
      <div v-if="ctx.isNew" class="lib-sum__row">
        <span>存进</span>
        <SelectField v-model="pack" label="存进哪个包" :options="packs" placeholder="选一个包" />
      </div>
      <div class="lib-sum__row">
        <span data-testid="save-diff-title">{{ diffTitle }}</span>
        <span v-if="ctx.other.include && !ctx.house" class="lib-faint">中文、英文两边一起存；另一边还没有包就自动建同编号的</span>
        <button v-if="!ctx.isNew && (changes.main.length || changes.other.length)" class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="showDiff = !showDiff">{{ showDiff ? '收起' : '展开看' }}</button>
      </div>
      <template v-if="!ctx.isNew && showDiff">
        <ul v-for="k in sides" v-show="changes[k].length" :key="k" class="lib-diff" data-testid="save-diff">
          <li v-for="c in changes[k]" :key="c.field"><code>{{ sides.length > 1 ? `${langName(ctx[k].cs)} · ` : '' }}{{ ctx.labelOf(ctx[k].cs)(c.field) }}</code><span><s v-if="c.before !== undefined">{{ valueText(c.before) }}</s>{{ c.before !== undefined ? ' → ' : '' }}{{ valueText(c.after) }}</span></li>
        </ul>
      </template>
      <div v-if="ctx.house?.existing" class="lib-sum__choice" data-testid="save-house-mode">
        <span class="lib-sum__row"><b>这一条已经有你的房规{{ ctx.house.existing.where.length ? `，用在 ${ctx.house.existing.where.length} 处` : '' }}</b><Segmented v-model="mode" label="已有房规时怎么存" :options="[{ value: 'replace', label: '直接改这条' }, { value: 'new', label: '另存一条新的' }]" /></span>
        <span class="lib-faint" data-testid="save-house-hint">{{ mode === 'replace' ? (ctx.house.existing.where.length ? `${ctx.house.existing.where.join('、')}都跟着变。` : '用到它的地方都跟着变。') : '原来那条不动；新的只用在下面选的这一层。' }}</span>
      </div>
      <div v-if="ctx.house && !replacing" class="lib-sum__row" data-testid="save-level">
        <span>{{ ctx.other.include ? '中英两条都作用于' : '作用于' }}</span>
        <SelectField v-model="level" label="作用于哪一层" :options="ctx.house.levels" />
      </div>
      <div v-if="impact?.length" class="lib-sum__row lib-banner lib-banner--warn" data-testid="save-impact">
        <span>改了名字，这一条的编号会跟着变：有 {{ impact.length }} 处用到它（插件里的会跟着搬，存档里的读档时会列出来）</span>
        <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="showImpact = !showImpact">{{ showImpact ? '收起' : '看每一处' }}</button>
      </div>
      <ul v-if="showImpact && impact" class="trpg-confirm__details"><li v-for="(x, i) in impact" :key="i">{{ x }}</li></ul>
      <span v-if="err" class="trpg-field__err"><Icon name="warning" :size="14" />{{ err }}。编辑器里的内容还在。</span>
    </div>
    <div class="lib-ebar">
      <button class="trpg-btn" type="button" @click="modal.pop()"><Icon name="caret-left" :size="14" />回去改</button>
      <span class="lib-end"><button class="trpg-btn trpg-btn--primary" type="button" :disabled="busy" data-testid="save-go" @click="save">{{ busy ? '正在存…' : ctx.house ? '保存房规' : '保存' }}</button></span>
    </div>
  </div>
</template>

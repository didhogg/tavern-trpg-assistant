<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { SKILL_KEYS, SKILLS, TOOL_LABELS } from '../../../../rules/dnd5e2014/data/enums'
import { grantChoices, type GrantChoice, type GrantPicks } from '../../../../rules/dnd5e2014/derive'
import { useCampaignStore } from '../../../../stores/campaign'
import { useModalStore } from '../../../../stores/modal'
import Icon from '../../../kit/Icon.vue'
import SelectField from '../../../kit/SelectField.vue'
import EntryDetailPage from '../../../library/EntryDetailPage.vue'
import { loadArchiveCandidates, type ArchiveCandidates, type CardEntry } from '../cardData'
import type { CardCtx } from '../cardCtx'
import { applyFlow, extrasOf, grantId, oldSources, planFlow, type FlowKind } from '../flowOps'
import { archiveOf } from '../archive'
import { signed } from '../format'
import DialogFrame from './DialogFrame.vue'

const props = defineProps<{ ctx: CardCtx; kind: FlowKind }>()
const emit = defineEmits<{ done: [] }>()
const modal = useModalStore()
const campaign = useCampaignStore()
const NAME = { race: '种族', class: '职业', background: '背景' } as const
const step = ref<0 | 1 | 2 | 3>(0)
const query = ref('')
const chosen = ref<string>('')
const subId = ref<string>('')
const picks = ref<GrantPicks>({})
const selected = ref<Set<string>>(new Set())
const removeOld = ref(true)
const cand = ref<ArchiveCandidates>({ languages: [], weapons: [], tools: [] })
const ro = computed(() => props.ctx.readOnly)
const data = computed(() => props.ctx.data)
const block = computed(() => props.ctx.person.block)
onMounted(async () => { cand.value = await loadArchiveCandidates(campaign.workspace?.ruleId ?? 'dnd5e2014', campaign.workspace?.enabledPacks.map((p) => p.id) ?? []) })

const currentId = computed(() => (props.kind === 'race' ? block.value.race : props.kind === 'background' ? block.value.background : block.value.classes?.[0]?.class))
const currentName = computed(() => (currentId.value ? data.value.nameOf(currentId.value) : ''))
const subName = computed(() => (props.kind === 'race' && block.value.subrace ? data.value.nameOf(block.value.subrace) : ''))
const options = computed<CardEntry[]>(() => (props.kind === 'race' ? data.value.races : props.kind === 'background' ? data.value.backgrounds : [...data.value.entries.values()].filter((e) => e.entry.type === 'class')))
const filtered = computed(() => { const q = query.value.trim().toLowerCase(); return options.value.filter((o) => !q || o.entry.name.toLowerCase().includes(q) || (o.entry.nameEn ?? '').toLowerCase().includes(q)) })
const chosenEntry = computed(() => options.value.find((o) => o.entry.id === chosen.value))
const subOptions = computed(() => (props.kind === 'race' ? data.value.subraceOptions(chosen.value) : []))
const entryOf = (kind: FlowKind, id?: string) => (kind === 'class' ? data.value.classOf(id) : kind === 'background' ? data.value.backgroundOf(id) : data.value.raceOf(id))
const choices = computed<GrantChoice[]>(() => {
  const list = grantChoices(props.kind === 'race' ? 'race' : props.kind, entryOf(props.kind, chosen.value) as never)
  const sub = subId.value ? grantChoices('subrace', data.value.raceOf(subId.value)) : []
  const merged = new Map<string, GrantChoice>()
  for (const c of [...list, ...sub]) { const f = merged.get(c.category); if (f) { f.count += c.count; f.from = [...new Set([...f.from, ...c.from])] } else merged.set(c.category, { ...c }) }
  return [...merged.values()]
})
function poolOf(c: GrantChoice): Array<{ key: string; label: string }> {
  if (c.category === 'skills') return (c.from.length ? c.from : [...SKILL_KEYS]).filter((k) => k in SKILLS).map((k) => ({ key: k, label: SKILLS[k as keyof typeof SKILLS].label }))
  if (c.category === 'languages') return (c.from.length ? c.from.map((k) => cand.value.languages.find((l) => l.key === k) ?? { key: k, label: k, group: '' }) : cand.value.languages.filter((l) => l.group === '标准语言' || l.group === '特种语言')).map((l) => ({ key: l.key, label: l.label }))
  if (c.category === 'tools') {
    const group = (token: string): string => (/artisan/i.test(token) ? '工匠工具' : /music/i.test(token) ? '乐器' : /gaming/i.test(token) ? '游戏套组' : '')
    const out = new Map<string, { key: string; label: string }>()
    for (const token of c.from.length ? c.from : ['anyArtisansTool']) {
      const g = group(token)
      if (g) for (const t of cand.value.tools.filter((x) => x.group === g)) out.set(t.key, { key: t.ref ? `{{ref:${t.ref}|${t.label}}}` : t.key, label: t.label })
      else out.set(token, { key: token, label: TOOL_LABELS[token] ?? token })
    }
    return [...out.values()]
  }
  return c.from.map((k) => ({ key: k, label: k }))
}
const picked = (c: GrantChoice): string[] => picks.value[c.category] ?? []
function toggle(c: GrantChoice, key: string): void {
  const cur = picked(c)
  picks.value = { ...picks.value, [c.category]: cur.includes(key) ? cur.filter((k) => k !== key) : cur.length < c.count ? [...cur, key] : cur }
}
const plan = computed(() => planFlow(block.value, data.value, { kind: props.kind, id: chosen.value, subId: subId.value || undefined, picks: picks.value, assign: true }))
const hasOld = computed(() => oldSources(block.value, props.kind).length > 0)
const rows = computed(() => [...plan.value.write.map((w) => ({ id: grantId(w.grant), label: w.grant.label, cat: ({ skills: '技能', saves: '豁免', languages: '语言', weapons: '武器', armor: '护甲', tools: '工具' } as Record<string, string>)[w.grant.category] ?? '', to: `熟练 · ${({ skills: '技能', saves: '豁免', languages: '语言', weapons: '武器', armor: '护甲', tools: '工具' } as Record<string, string>)[w.grant.category]}` })), ...plan.value.extras.map((x) => ({ id: x.extra.id, label: x.extra.label, cat: ({ resist: '抗性', immune: '免疫', condition: '状态免疫', senses: '感官' })[x.extra.group], to: `防御 / 感官 · ${({ resist: '抗性', immune: '免疫', condition: '状态免疫', senses: '感官' })[x.extra.group]}` }))])
const readonlyNotes = computed(() => {
  const r = props.kind === 'race' ? data.value.raceOf(chosen.value) : undefined
  const out: string[] = []
  const fixed = r?.abilityBonus?.fixed
  if (fixed) out.push(`属性加成：${Object.entries(fixed).map(([k, v]) => `${k.toUpperCase()} ${signed(v)}`).join(' · ')}（直接读取，显示在属性表「种族/背景」列）`)
  if (r?.speed?.walk) out.push(`速度：步行 ${r.speed.walk} 尺（由读数直接读取）`)
  if (props.kind === 'class') out.push('1 级特性在「职业与特性」页，不进分配')
  return out
})
const removeRows = computed(() => plan.value.remove.flatMap((r) => r.stale.map((s) => `${s.key}${s.action === 'source' ? '（仅去掉这个来源）' : ''}`)).concat(plan.value.removeExtras.map((x) => x.label)))
const need = computed(() => choices.value.reduce((n, c) => n + c.count, 0))

function start(): void { step.value = 1; chosen.value = chosen.value || currentId.value || filtered.value[0]?.entry.id || '' }
function reassign(): void { chosen.value = currentId.value ?? ''; subId.value = props.kind === 'race' ? block.value.subrace ?? '' : ''; goAssign() }
function toPicks(): void { step.value = 2 }
function goAssign(): void { selected.value = new Set([...rows.value.map((r) => r.id)]); removeOld.value = true; step.value = 3 }
function only(): void {
  if (ro.value || !chosen.value) return
  props.ctx.commitBlock(applyFlow(block.value, data.value, { kind: props.kind, id: chosen.value, subId: subId.value || undefined, assign: false }))
  finish(`已选用${data.value.nameOf(chosen.value)}`)
}
function apply(): void {
  if (ro.value) return
  props.ctx.commitBlock(applyFlow(block.value, data.value, { kind: props.kind, id: chosen.value, subId: subId.value || undefined, picks: picks.value, assign: true, selected: [...selected.value], removeOld: removeOld.value }))
  finish(`已应用${data.value.nameOf(chosen.value)}`)
}
function finish(text: string): void { props.ctx.toast.success(text); step.value = 0; picks.value = {}; subId.value = ''; emit('done') }
function back(): void { step.value = (step.value === 3 ? 2 : step.value === 2 ? 1 : 0) as 0 | 1 | 2 }
function flip(id: string): void { const next = new Set(selected.value); if (next.has(id)) next.delete(id); else next.add(id); selected.value = next }
const current = computed(() => (currentId.value ? archiveOf(props.ctx.person, data.value.nameOf).flatMap((c) => c.groups.flatMap((g) => g.items.filter((i) => i.source.includes(currentName.value) || i.source.includes(subName.value))).map((i) => i)) : []))
const entryExtras = computed(() => (props.kind === 'race' && currentId.value ? extrasOf(data.value.raceOf(currentId.value)).map((x) => x.label) : []))
const steps = ['选择', '补选', '分配']
</script>

<template>
  <DialogFrame v-if="step === 0" :note="`改动进入草稿，点右上「保存」后生效`">
    <section class="trpg-flow__cur" :data-testid="`flow-current-${kind}`">
      <h3>当前{{ NAME[kind] }}</h3>
      <p class="trpg-flow__name"><b>{{ currentName || `未选${NAME[kind]}` }}</b><span v-if="subName"> · {{ subName }}</span></p>
      <template v-if="currentId"><p class="trpg-dlg__small">它带来的内容（都带来源）</p><div class="trpg-arch__pills"><span v-for="i in current" :key="i.id" class="trpg-pill trpg-pill--sm is-static">{{ i.label }}<small class="trpg-arch__en">{{ i.source }}</small></span><span v-for="x in entryExtras" :key="x" class="trpg-pill trpg-pill--sm is-static">{{ x }}</span><span v-if="!current.length && !entryExtras.length" class="trpg-card-empty">没有写入任何内容（只记录了选择）。</span></div></template>
    </section>
    <template #actions><button v-if="currentId" class="trpg-btn" type="button" :disabled="ro" data-testid="flow-reassign" @click="reassign">重新分配</button><button class="trpg-btn trpg-btn--primary" type="button" :disabled="ro" :data-testid="`flow-start-${kind}`" @click="start">{{ currentId ? `更换${NAME[kind]}` : `选择${NAME[kind]}` }}</button></template>
  </DialogFrame>
  <DialogFrame v-else :note="step === 3 ? '这一步会把勾选的内容写进人物，一次应用算一步撤销' : '改动进入草稿，点右上「保存」后生效'">
    <ol class="trpg-flow__steps"><li v-for="(s, i) in steps" :key="s" :class="{ 'is-on': step === i + 1, 'is-done': step > i + 1 }"><span class="trpg-flow__dot"><Icon v-if="step > i + 1" name="check" :size="16" /><template v-else>{{ i + 1 }}</template></span>{{ s }}</li></ol>
    <div v-if="step === 1" class="trpg-flow__select">
      <div class="trpg-flow__list"><input v-model="query" class="trpg-input" type="search" :placeholder="`搜${NAME[kind]}（中文或英文）`" :aria-label="`搜${NAME[kind]}`" /><ul><li v-for="o in filtered" :key="o.entry.id"><button class="trpg-fx__item" :class="{ 'is-on': chosen === o.entry.id }" type="button" :data-testid="`flow-opt-${o.entry.id}`" @click="chosen = o.entry.id"><span class="trpg-fx__name">{{ o.entry.name }}<small v-if="o.entry.nameEn">{{ o.entry.nameEn }}</small></span><small class="trpg-fx__sub">{{ o.badge }}</small></button></li><li v-if="!filtered.length" class="trpg-card-empty">{{ options.length ? '没有匹配的。' : `没有可选的${NAME[kind]}，请先到「库」里安装资料` }}</li></ul></div>
      <section class="trpg-flow__sheet"><EntryDetailPage v-if="chosenEntry" :pack-id="chosenEntry.packId" :entry-id="chosenEntry.entry.id" compact /><p v-else class="trpg-card-empty">在左边选一个，这里显示资料。</p></section>
    </div>
    <div v-else-if="step === 2" class="trpg-flow__picks">
      <div v-if="kind === 'race' && subOptions.length" class="trpg-field"><span class="trpg-field__label">亚种族（可不选）</span><SelectField :model-value="subId || undefined" :options="subOptions.map((o) => ({ value: o.value, label: o.label }))" label="亚种族" placeholder="不选" @update:model-value="(v) => (subId = v ?? '')" /></div>
      <p v-if="!choices.length" class="trpg-card-empty">没有需要补选的项。</p>
      <section v-for="c in choices" :key="c.category" class="trpg-flow__choice"><h3>{{ c.label }}：选 {{ c.count }} 项 <small>已选 {{ picked(c).length }}/{{ c.count }}</small></h3><div class="trpg-arch__pills"><button v-for="o in poolOf(c)" :key="o.key" class="trpg-pill trpg-pill--sm" type="button" :aria-pressed="picked(c).includes(o.key)" :data-testid="`flow-pick-${c.category}-${o.key}`" @click="toggle(c, o.key)">{{ o.label }}</button></div></section>
      <p v-if="need" class="trpg-dlg__small">补选可以空着，下一步照样能应用，没选的就不写入。</p>
    </div>
    <div v-else class="trpg-flow__assign">
      <section v-if="hasOld && removeRows.length"><label class="trpg-flow__row is-head"><input v-model="removeOld" type="checkbox" class="trpg-ab__check" data-testid="flow-remove-old" /><b>移除旧{{ NAME[kind] }}「{{ currentName }}」带来的内容（默认勾选）</b></label><ul class="trpg-flow__rows"><li v-for="r in removeRows" :key="r" class="trpg-flow__row is-sub">{{ r }}</li></ul></section>
      <section>
<h3>写入新{{ NAME[kind] }}「{{ data.nameOf(chosen) }}{{ subId ? ` · ${data.nameOf(subId)}` : '' }}」的内容（默认勾选；全不勾也能应用）</h3>
        <ul class="trpg-flow__rows"><li v-for="r in rows" :key="r.id"><label class="trpg-flow__row"><input type="checkbox" class="trpg-ab__check" :checked="selected.has(r.id)" :data-testid="`flow-row-${r.id}`" @change="flip(r.id)" /><span class="trpg-flow__cat">{{ r.cat }}</span><span class="trpg-pill trpg-pill--sm is-static">{{ r.label }}</span><small>写入 {{ r.to }}</small></label></li><li v-if="!rows.length" class="trpg-card-empty">这个{{ NAME[kind] }}没有可写入的熟练或防御项。</li></ul>
</section>
      <section v-if="readonlyNotes.length"><h3>只读说明（不进分配）</h3><ul class="trpg-flow__rows"><li v-for="n in readonlyNotes" :key="n" class="trpg-dlg__small">{{ n }}</li></ul></section>
    </div>
    <template #actions>
      <button v-if="step > 1" class="trpg-btn" type="button" @click="back"><Icon name="caret-left" :size="16" />上一步</button>
      <button class="trpg-btn" type="button" @click="step === 1 ? (step = 0) : modal.requestClose()">取消</button>
      <button v-if="step < 3" class="trpg-btn" type="button" :disabled="ro || !chosen" data-testid="flow-only" @click="only">只选用，先不分配</button>
      <button v-if="step === 1" class="trpg-btn trpg-btn--primary" type="button" :disabled="ro || !chosen" data-testid="flow-choose" @click="toPicks">选用{{ chosenEntry?.entry.name ?? '' }}</button>
      <button v-else-if="step === 2" class="trpg-btn trpg-btn--primary" type="button" :disabled="ro" data-testid="flow-next" @click="goAssign">下一步：看分配</button>
      <button v-else class="trpg-btn trpg-btn--primary" type="button" :disabled="ro" data-testid="flow-apply" @click="apply">应用（{{ selected.size }} 项）</button>
    </template>
  </DialogFrame>
</template>

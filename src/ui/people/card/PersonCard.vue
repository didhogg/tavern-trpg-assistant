<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue'
import type { Person, PersonEffect } from '../../../schemas/people'
import type { MonsterData } from '../../../rules/dnd5e2014/data/entries/spell-monster'
import type { AbilityKey, SkillKey } from '../../../rules/dnd5e2014/data/enums'
import type { DeriveContext } from '../../../rules/dnd5e2014/derive'
import { derivePerson, xpOf } from '../../../rules/dnd5e2014/derive'
import { formatCr } from '../rows'
import { useAppStore } from '../../../stores/app'
import { useCampaignStore } from '../../../stores/campaign'
import { useDiceStore } from '../../../stores/dice'
import { useModalStore, type ModalPage } from '../../../stores/modal'
import { usePeopleStore, type LivePatch } from '../../../stores/people'
import { useToastStore } from '../../../stores/toast'
import { errorText } from '../../format'
import { putAsset } from '../../../core/library/assets'
import EmptyState from '../../kit/EmptyState.vue'
import type { MenuItem } from '../../kit/MoreMenu.vue'
import { cardMenuItems } from './cardMenu'
import { cropAvatarFile } from './autoCrop'
import { useAssetUrl } from './useAssetUrl'
import { deriveContextOf, loadCardData, type CardData } from './cardData'
import { clonePerson, dirtyFields, draftPatchOf, livePatchOf, pushUndo, type UndoAction } from './draft'
import type { CardCtx } from './cardCtx'
import { useCardDialogs } from './useCardDialogs'
import type { HpEditPayload } from './HpEditor.vue'
import CardTopbar from './CardTopbar.vue'
import IdentityBlock, { type ClassRowView } from './IdentityBlock.vue'
import VitalsBlock from './VitalsBlock.vue'
import { openEntry } from '../../library/openDetail'
import ReadoutBlock from './ReadoutBlock.vue'
import AbilityCards from './AbilityCards.vue'
import SlotsRow from './SlotsRow.vue'
import StatusRows from './StatusRows.vue'
import ArchiveCards from './ArchiveCards.vue'
import ActionsSkills from './ActionsSkills.vue'
import PageTabs from './PageTabs.vue'
import SaveToLibrary from '../SaveToLibrary.vue'
import TemplatePicker from '../TemplatePicker.vue'
import TemplateHeadHint from '../TemplateHeadHint.vue'
import cardCss from './card.css?inline'
import dialogCss from './card-dialogs.css?inline'

const props = defineProps<{ person?: Person; draft?: Person; from?: string; libraryMode?: boolean }>()
const emit = defineEmits<{ back: []; saved: [person: Person] }>()
const app = useAppStore()
const campaign = useCampaignStore()
const dice = useDiceStore()
const modal = useModalStore()
const people = usePeopleStore()
const toast = useToastStore()
const initial = props.person ?? props.draft
if (!initial) throw new Error('人物卡缺少人物数据')
const model = reactive<Person>(clonePerson(initial))
const baseline = ref<Person>(clonePerson(initial))
const personId = ref(props.person?.id)
const undo = ref<UndoAction[]>([])
const cardData = shallowRef<CardData | null>(null)
const loading = ref(true)
const page = ref('actions')
const view = ref<'pc' | 'enemy'>(initial.categoryId === 'enemy' ? 'enemy' : 'pc')
const showMini = ref(false)
const root = ref<HTMLElement | null>(null)
const identityEl = ref<HTMLElement | null>(null)
const avatarPicker = ref<HTMLInputElement | null>(null)
const avatarBusy = ref(false)
let scrollTarget: HTMLElement | Window | null = null
let scrollHandler: (() => void) | undefined
const avatarUrl = useAssetUrl(computed(() => model.avatar))
function openPage(next: ModalPage): void {
  if (props.libraryMode && modal.isOpen) modal.push(next)
  else modal.open(next)
}

const dirty = computed(() => dirtyFields(model, baseline.value))
const dirtyCount = computed(() => (!personId.value ? Math.max(1, dirty.value.length) : dirty.value.length))
const canSave = computed(() => !!model.name.trim() && !campaign.readOnly)
const canUndo = computed(() => undo.value.length > 0)
const readOnly = computed(() => campaign.readOnly)
function contextOf(person: Person): DeriveContext | null { return cardData.value ? deriveContextOf(person, cardData.value) : null }
const context = computed(() => contextOf(model))
const derived = computed(() => (context.value ? derivePerson(model, context.value) : null))
/** 去掉上限覆盖、手动修正、生命骰覆盖后的「自动」生命（编辑态的明细与「全部恢复自动」依据）。 */
const autoHp = computed(() => {
  if (!context.value) return null
  const block = JSON.parse(JSON.stringify(model.block)) as MonsterData
  if (block.overrides) delete block.overrides.hpMax
  return derivePerson({ ...model, block, hpAdj: undefined, hitDiceOverride: undefined }, context.value).hp
})
const classRows = computed<ClassRowView[]>(() => (model.block.classes ?? []).map((row) => ({ ref: row.class, name: cardData.value?.nameOf(row.class) ?? '', level: row.level, subclass: row.subclass })))
const ALIGN: Record<string, string> = { 'L G': '守序善良', 'N G': '中立善良', 'C G': '混乱善良', 'L N': '守序中立', N: '绝对中立', 'C N': '混乱中立', 'L E': '守序邪恶', 'N E': '中立邪恶', 'C E': '混乱邪恶', U: '无阵营' }
const alignmentLabel = computed(() => (model.block.alignment ? ALIGN[model.block.alignment] ?? '' : ''))
const raceName = computed(() => [model.block.subrace, model.block.race].map((id) => (id ? cardData.value?.nameOf(id) ?? '' : '')).find(Boolean) ?? '')
const backgroundName = computed(() => (model.block.background ? cardData.value?.nameOf(model.block.background) ?? '' : ''))
const cr = computed(() => { const v = model.block.cr; return typeof v === 'number' ? v : v && typeof v === 'object' ? v.value : undefined })
const crText = computed(() => (cr.value === undefined ? '' : `挑战 ${formatCr(cr.value)}`))
const xp = computed(() => xpOf(cr.value, model.block.xp, cardData.value?.tables.xpByCr))
const xpText = computed(() => (xp.value === undefined ? '' : `${xp.value} 经验`))
const showCrBadges = computed(() => view.value === 'enemy' && cr.value !== undefined)
const abilitiesUnconfigured = computed(() => {
  const b = model.block
  const base = Object.values(b.abilities ?? {}).filter((v) => v !== undefined && v !== null && v !== 10)
  return base.length === 0 && !b.abilityOther && !b.overrides?.abilities && !b.abilityGrowth
})
const blank = computed(() => !model.block.race && !(model.block.classes ?? []).length && abilitiesUnconfigured.value && model.block.cr === undefined)
const menuItems = computed<MenuItem[]>(() => cardMenuItems(model, personId.value, readOnly.value, !!props.libraryMode))

function applyLive(patch: LivePatch): void {
  if ('hp' in patch) model.hp = { ...model.hp, ...patch.hp, deathSaves: { ...model.hp.deathSaves, ...patch.hp?.deathSaves } }
  if ('inspiration' in patch) model.inspiration = patch.inspiration
  if ('exhaustion' in patch) model.exhaustion = patch.exhaustion
  if ('hitDiceUsed' in patch) model.hitDiceUsed = patch.hitDiceUsed
  if ('slotsUsed' in patch) model.slotsUsed = patch.slotsUsed
  if ('resourcesUsed' in patch) model.resourcesUsed = patch.resourcesUsed
  if ('effects' in patch) model.effects = patch.effects ?? []
}
function commitLive(patch: LivePatch): void {
  if (readOnly.value) return
  const before = clonePerson(model)
  try {
    if (personId.value && !props.libraryMode) people.setLive(personId.value, patch)
    applyLive(patch)
    if (JSON.stringify(before) !== JSON.stringify(model)) undo.value = pushUndo(undo.value, { kind: 'live', before, after: clonePerson(model) })
  } catch (error) {
    toast.error(`没能改动：${errorText(error)}`)
  }
}
/** 设定类写入：可同时带一份当场状态（例如生命当前值）；合成一步撤销。 */
function commitMany(patch: Partial<Person>, fields: string[], live?: LivePatch): void {
  if (readOnly.value) return
  const before = clonePerson(model)
  try {
    if (live && personId.value && !props.libraryMode) people.setLive(personId.value, live)
    if (live) applyLive(live)
    for (const field of fields) {
      if (field === 'block' && patch.block) model.block = patch.block
      else if (field in patch) (model as unknown as Record<string, unknown>)[field] = (patch as Record<string, unknown>)[field]
    }
    const after = clonePerson(model)
    if (JSON.stringify(before) !== JSON.stringify(after)) undo.value = pushUndo(undo.value, { kind: 'draft', before, after, liveBefore: live ? livePatchOf(before) : undefined })
  } catch (error) {
    toast.error(`没能改动：${errorText(error)}`)
  }
}
function commitDraft(patch: Partial<Person>, fields: string[]): void { commitMany(patch, fields) }
function commitBlock(block: MonsterData): void { commitMany({ block }, ['block']) }
function commitHpEdit(payload: HpEditPayload): void {
  const block = JSON.parse(JSON.stringify(model.block)) as MonsterData
  if (payload.cap === null) { if (block.overrides) { delete block.overrides.hpMax; if (Object.keys(block.overrides).length === 0) delete block.overrides } } else block.overrides = { ...(block.overrides ?? {}), hpMax: payload.cap }
  commitMany({ block, hpAdj: payload.hpAdj.length ? payload.hpAdj : undefined, hitDiceOverride: Object.keys(payload.hitDiceOverride).length ? payload.hitDiceOverride : undefined }, ['block', 'hpAdj', 'hitDiceOverride'], { hp: payload.hp })
}
const ctx = reactive({
  person: model,
  get data(): CardData { return cardData.value as CardData },
  get readOnly(): boolean { return readOnly.value },
  derived: () => derived.value!,
  derivedWith: (block: MonsterData, extra?: Partial<Person>) => derivePerson({ ...model, ...extra, block }, contextOf({ ...model, block }) ?? context.value!),
  commitDraft, commitBlock, commitLive, commitMany,
  toast: { success: (t: string) => toast.success(t), error: (t: string) => toast.error(t), info: (t: string) => toast.info(t) },
}) as unknown as CardCtx
const dialogs = useCardDialogs(ctx, openPage, { uploadAvatar: (file: File) => uploadAvatar(file), clearAvatar: () => clearAvatar(), url: () => avatarUrl.value })

/** 整体还原：连 before 里没有的键（如撤销前新增的 hpAdj）也要去掉。 */
function restoreModel(before: Person): void {
  const copy = clonePerson(before) as unknown as Record<string, unknown>
  const target = model as unknown as Record<string, unknown>
  for (const key of Object.keys(target)) if (!(key in copy)) delete target[key]
  Object.assign(target, copy)
}
function undoOnce(): void {
  const action = undo.value[undo.value.length - 1]
  if (!action) return
  undo.value = undo.value.slice(0, -1)
  if (action.kind === 'draft') {
    try { if (action.liveBefore && personId.value && !props.libraryMode) people.setLive(personId.value, action.liveBefore) } catch (error) { toast.error(`没能撤销：${errorText(error)}`) }
    restoreModel(action.before)
    return
  }
  try {
    if (personId.value) people.setLive(personId.value, livePatchOf(action.before))
    applyLive(livePatchOf(action.before))
  } catch (error) { toast.error(`没能撤销：${errorText(error)}`) }
}
function save(): void {
  if (!canSave.value) return
  try {
    if (props.libraryMode) { baseline.value = clonePerson(model); undo.value = []; emit('saved', clonePerson(model)); return }
    if (!personId.value) {
      const created = people.create(clonePerson(model))
      baseline.value = clonePerson(created); personId.value = created.id; undo.value = []
      toast.success(`已保存 ${created.name}`); emit('saved', created); return
    }
    if (dirty.value.length) {
      const saved = people.saveDraft(personId.value, draftPatchOf(model, dirty.value))
      baseline.value = clonePerson(saved); Object.assign(model, clonePerson(saved)); undo.value = []
      toast.success(`已保存 ${saved.name}`); emit('saved', saved); return
    }
    toast.success(`已保存 ${model.name}`); emit('saved', { ...clonePerson(model) })
  } catch (error) { toast.error(`没能保存：${errorText(error)}`) }
}
async function uploadAvatar(file: File): Promise<void> {
  if (readOnly.value || avatarBusy.value) return
  avatarBusy.value = true
  try {
    const cropped = await cropAvatarFile(file)
    const original = await putAsset(app.svc().db, new Uint8Array(await file.arrayBuffer()), app.svc().now())
    const avatar = await putAsset(app.svc().db, cropped.bytes, app.svc().now())
    commitDraft({ avatar, avatarSource: { asset: original, crop: cropped.crop } }, ['avatar', 'avatarSource'])
    toast.success('头像已更新')
  } catch (error) {
    console.error('[trpg-assistant] 头像处理失败', error)
    toast.error(`头像处理失败：${errorText(error)}`)
  } finally { avatarBusy.value = false }
}
function clearAvatar(): void { commitDraft({ avatar: undefined, avatarSource: undefined }, ['avatar', 'avatarSource']) }
function applyTemplate(block: MonsterData, name: string): void {
  const before = clonePerson(model)
  if (!model.name.trim()) model.name = name
  model.block = JSON.parse(JSON.stringify(block)) as MonsterData
  undo.value = pushUndo(undo.value, { kind: 'draft', before, after: clonePerson(model) })
  toast.success(`已套用 ${name}，不满意点撤销`)
}
function openTemplate(): void {
  openPage({ key: `person-template-${model.id}`, title: '模板', component: markRaw(TemplatePicker), header: markRaw(TemplateHeadHint), variant: 'dialog', props: { mode: 'apply', onApply: applyTemplate } })
}
function onMenu(key: string): void {
  if (key === 'save-lib') { modal.open({ key: `person-save-${model.id}`, title: '存入我的库', component: markRaw(SaveToLibrary), props: { person: clonePerson(model) }, variant: 'dialog' }); return }
  if (!personId.value || props.libraryMode) return
  if (key === 'copy') { const copy = people.duplicate(personId.value); toast.success(`已复制：${copy.name}`); emit('saved', copy); return }
  if (key === 'trash') { people.trash([personId.value]); toast.undoable(`已移到回收站：${model.name}`, () => people.restore([personId.value!])); emit('back'); return }
  if (key.startsWith('give:')) {
    const value = key.slice(5) as Person['giveAi']
    try { people.save(personId.value, { giveAi: value }); model.giveAi = value; toast.success('已更新给 AI 的方式') } catch (error) { toast.error(`没能更新：${errorText(error)}`) }
  }
}

// 交给骰盘：只填入，不掷（U5R §11）。加值与来源由骰盘现算。
const actor = (): string => model.id
function onCheck(ability: AbilityKey): void { dice.openRoll({ actorId: actor(), kind: 'check', ability }) }
function onSave(ability: AbilityKey): void { dice.openRoll({ actorId: actor(), kind: 'save', ability }) }
function onSkill(skill: SkillKey, ability: AbilityKey): void { dice.openRoll({ actorId: actor(), kind: 'check', ability, skill }) }
function onInitiative(): void { dice.openRoll({ actorId: actor(), kind: 'initiative', ability: 'dex' }) }
function onPassive(skill: 'perception' | 'insight' | 'investigation'): void { dice.openRoll({ actorId: actor(), kind: 'passive', skill, ability: skill === 'perception' || skill === 'insight' ? 'wis' : 'int' }) }
function onFree(expression: string, note: string): void { dice.openRoll({ actorId: actor(), kind: 'free', expression, note: `${model.name} ${note}` }) }
const exhaustionEntry = computed(() => (cardData.value ? [...cardData.value.entries.values()].find((e) => e.entry.type === 'condition' && (e.entry.nameEn ?? '').toLowerCase() === 'exhaustion') : undefined))
/** 点「力竭」：打开库里力竭条目的资料片。 */
function openExhaustion(): void { const e = exhaustionEntry.value; if (e) openEntry(e.packId, e.entry.id, e.entry.name) }
function onHitDie(sides: number): void {
  const con = derived.value?.abilities.con.modifier ?? 0
  onFree(`1d${sides}${con ? (con > 0 ? `+${con}` : `${con}`) : ''}`, '生命骰')
}
function onSlot(key: string, used: number): void { commitLive({ slotsUsed: { ...(model.slotsUsed ?? {}), [key]: used } }) }
function removeEffect(id: string): void { commitLive({ effects: model.effects.filter((e) => e.id !== id) }) }
function placeholder(): void { toast.info('短休、长休在之后的「活动」里做。现在请直接改生命、生命骰、法术位。') }
function scrollIdentity(): void { identityEl.value?.scrollIntoView({ block: 'start', behavior: 'smooth' }) }
function updateMini(): void { if (identityEl.value) showMini.value = identityEl.value.getBoundingClientRect().top < 54 }
function onKey(event: KeyboardEvent): void {
  if (!((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z')) return
  event.preventDefault()
  undoOnce()
}
function pickAvatar(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) void uploadAvatar(file)
}
function effectOpen(effect: PersonEffect): void { dialogs.openEffectInfo(effect) }
onMounted(async () => {
  const shadow = root.value?.getRootNode()
  if (shadow instanceof ShadowRoot && !shadow.querySelector('style[data-u5-card]')) {
    const style = document.createElement('style'); style.dataset.u5Card = ''; style.textContent = cardCss + dialogCss; shadow.append(style)
  }
  scrollTarget = (root.value?.closest('.trpg-content') as HTMLElement | null) ?? window
  scrollHandler = updateMini
  scrollTarget.addEventListener('scroll', scrollHandler, { passive: true })
  window.addEventListener('keydown', onKey)
  void app.svc().db.getMeta<boolean>('u5CardIntroSeen').then((seen) => {
    if (seen) return
    toast.status('点数字去骰盘；✎ 改数值；＋ 加一项；右上 ？ 看怎么用')
    void app.svc().db.setMeta('u5CardIntroSeen', true)
  }).catch((error) => console.warn('[trpg-assistant] 记录人物卡提示失败', error))
  await nextTick()
  updateMini()
  try {
    cardData.value = await loadCardData(model, props.libraryMode ? [] : campaign.workspace?.enabledPacks.map((pack) => pack.id) ?? [], campaign.workspace?.ruleId ?? 'dnd5e2014')
  } catch (error) {
    console.error('[trpg-assistant] 读取人物卡资料失败', error)
    toast.error(`读取人物资料失败：${errorText(error)}`)
  } finally { loading.value = false }
})
onBeforeUnmount(() => {
  if (scrollTarget && scrollHandler) scrollTarget.removeEventListener('scroll', scrollHandler)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="trpg-person-card" data-testid="person-card">
    <CardTopbar :name="model.name" :context="libraryMode ? `库里的「${model.name}」` : ''" :context-hint="libraryMode ? '改了不影响已经加进战役的人' : ''" :context-short="libraryMode ? `库·${model.name}` : ''" :back-label="libraryMode ? '我的资料' : '人物'" :dirty-count="dirtyCount" :can-undo="canUndo" :can-save="canSave" :read-only="readOnly" :library-mode="!!libraryMode" :show-name="showMini" :menu-items="menuItems" :blank="blank" :view="view" @help="dialogs.openHelp(blank)" @back="emit('back')" @undo="undoOnce" @save="save" @menu="onMenu" @view="view = $event" />
    <p v-if="libraryMode" class="trpg-card-library-note">库里的「{{ model.name }}」 · 改了不影响已经加进战役的人</p>
    <button v-if="showMini" class="trpg-mini-bar" type="button" @click="scrollIdentity">{{ model.name }} · {{ model.hp.current ?? derived?.hp.value ?? '' }}/{{ derived?.hp.value ?? '' }} · AC {{ derived?.ac.value ?? '' }}</button>
    <main class="trpg-card-page">
      <div v-if="loading || !derived || !autoHp" class="trpg-card-skeleton" aria-busy="true"><span class="trpg-skeleton" /><span class="trpg-skeleton" /><span class="trpg-skeleton" /></div>
      <div v-else class="trpg-card-grid">
        <div class="trpg-card-a" data-testid="person-card-a">
          <div ref="identityEl" class="trpg-card-identity-card">
            <IdentityBlock :person="model" :avatar-url="avatarUrl" :classes="classRows" :race-name="raceName" :background-name="backgroundName" :alignment-label="alignmentLabel" :cr-text="crText" :xp-text="xpText" :show-cr-badges="showCrBadges" :read-only="readOnly" @identity="dialogs.openIdentity($event)" @class-open="dialogs.openClass($event)" @entry-open="dialogs.openRaceOrBackground($event)" @avatar="avatarPicker?.click()" @template="openTemplate" @inspiration="commitLive({ inspiration: !model.inspiration })" />
            <VitalsBlock :person="model" :hp="derived.hp" :auto="autoHp" :read-only="readOnly" :exhaustion-text="cardData?.exhaustionText ?? []" :condition-ref="exhaustionEntry?.entry.id" @exhaustion-info="openExhaustion" @live="commitLive" @commit="commitHpEdit" @placeholder="placeholder" @hit-die="onHitDie" />
          </div>
        </div>
        <div class="trpg-card-right">
          <ReadoutBlock :derived="derived" :level="derived.level" :cr-text="crText" :read-only="readOnly" @initiative="onInitiative" @open="dialogs.openReadout($event)" @passive="onPassive" />
          <AbilityCards :derived="derived" :read-only="readOnly" :unconfigured="abilitiesUnconfigured" @check="onCheck" @save="onSave" @edit="dialogs.openAbilities()" />
        </div>
        <SlotsRow class="trpg-card-s" :derived="derived" :read-only="readOnly" @slot="onSlot" @attack="onFree(`1d20+${derived.spellcasting?.attack ?? 0}`, '法术攻击')" />
        <StatusRows class="trpg-card-t" :person="model" :read-only="readOnly" @add="dialogs.openAddEffect()" @open="effectOpen" @remove="removeEffect" />
        <ArchiveCards class="trpg-card-d" :person="model" :name-of="(id) => cardData?.nameOf(id) ?? id ?? ''" :read-only="readOnly" @edit="(card, group) => dialogs.openArchive(card, group)" @item="dialogs.openArchiveItem($event)" />
        <PageTabs v-model="page" class="trpg-card-e" />
        <section class="trpg-card-f">
          <ActionsSkills v-if="page === 'actions'" :person="model" :derived="derived" :read-only="readOnly" @skill="(s) => onSkill(s, derived!.skills[s].ability)" @all-skills="dice.openRoll({ actorId: actor(), kind: 'check' })" @edit-skills="dialogs.openSkills()" @free="onFree" />
          <EmptyState v-else icon="books" text="本分页尚未开放" data-testid="person-card-placeholder" />
        </section>
      </div>
    </main>
    <input ref="avatarPicker" class="trpg-sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" tabindex="-1" aria-hidden="true" @change="pickAvatar" />
  </div>
</template>

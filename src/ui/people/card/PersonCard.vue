<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue'
import type { Person } from '../../../schemas/people'
import type { MonsterData } from '../../../rules/dnd5e2014/data/entries/spell-monster'
import type { PersonHp } from '../../../schemas/people'
import type { AbilityKey } from '../../../rules/dnd5e2014/data/enums'
import type { DeriveContext } from '../../../rules/dnd5e2014/derive'
import { derivePerson } from '../../../rules/dnd5e2014/derive'
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
import { loadCardData, type CardData } from './cardData'
import { clonePerson, dirtyFields, draftPatchOf, livePatchOf, pushUndo, type UndoAction } from './draft'
import type { IdentityPart } from './IdentityBlock.vue'
import CardTopbar from './CardTopbar.vue'
import IdentityBlock from './IdentityBlock.vue'
import VitalsBlock from './VitalsBlock.vue'
import ReadoutBlock from './ReadoutBlock.vue'
import AbilityCards from './AbilityCards.vue'
import StatusRows from './StatusRows.vue'
import ArchiveStrip from './ArchiveStrip.vue'
import PageTabs from './PageTabs.vue'
import IdentityDrawer from './IdentityDrawer.vue'
import RecropPage from './RecropPage.vue'
import SaveToLibrary from '../SaveToLibrary.vue'
import TemplatePicker from '../TemplatePicker.vue'
import TemplateHeadHint from '../TemplateHeadHint.vue'
import cardCss from './card.css?inline'
import type { EffectChoice } from './AddEffectPopover.vue'
import { ABILITY_LABELS } from '../../../rules/dnd5e2014/data/enums'

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
const showMini = ref(false)
const root = ref<HTMLElement | null>(null)
const identityEl = ref<HTMLElement | null>(null)
const avatarPicker = ref<HTMLInputElement | null>(null)
const avatarBusy = ref(false)
let scrollTarget: HTMLElement | Window | null = null
let scrollHandler: (() => void) | undefined
const avatarUrl = useAssetUrl(computed(() => model.avatar))
function openPage(page: ModalPage): void {
  if (props.libraryMode && modal.isOpen) modal.push(page)
  else modal.open(page)
}

const dirty = computed(() => dirtyFields(model, baseline.value))
const dirtyCount = computed(() => (!personId.value ? Math.max(1, dirty.value.length) : dirty.value.length))
const canSave = computed(() => !!model.name.trim() && !campaign.readOnly)
const canUndo = computed(() => undo.value.length > 0)
const readOnly = computed(() => campaign.readOnly)
const context = computed<DeriveContext | null>(() => {
  if (!cardData.value) return null
  return {
    race: cardData.value.raceOf(model.block.race),
    subrace: cardData.value.raceOf(model.block.subrace),
    background: cardData.value.backgroundOf(model.block.background),
    classes: (model.block.classes ?? []).map((row) => ({ id: row.class, entry: cardData.value?.classOf(row.class), level: row.level })),
    equipmentEffects: [],
  }
})
const derived = computed(() => (context.value ? derivePerson(model, context.value) : null))
const identity = computed<IdentityPart[]>(() => {
  if (!cardData.value) return []
  const out: IdentityPart[] = []
  for (const row of model.block.classes ?? []) {
    out.push({ text: `${cardData.value.nameOf(row.class)} ${row.level} 级`, strong: true, kind: 'class' })
    if (row.subclass) out.push({ text: cardData.value.nameOf(row.subclass), strong: false, kind: 'class' })
  }
  if (model.block.race) out.push({ text: cardData.value.nameOf(model.block.race), strong: false, kind: 'race' })
  if (model.block.subrace) out.push({ text: cardData.value.nameOf(model.block.subrace), strong: false, kind: 'race' })
  return out
})
const cr = computed(() => {
  const value = model.block.cr
  return typeof value === 'number' ? value : value && typeof value === 'object' ? value.value : undefined
})
const crText = computed(() => (cr.value === undefined ? '' : `挑战 ${formatCr(cr.value)}`))
const templateName = computed(() => {
  if (!props.from) return model.name
  return props.from
})
const conditions = computed<EffectChoice[]>(() => cardData.value?.conditions.map((row) => ({ name: row.name, ref: row.ref })) ?? [])
const spells = computed<EffectChoice[]>(() => cardData.value?.spells.map((row) => ({ name: row.entry.name, ref: row.entry.id, duration: cardData.value?.spellDuration(row.entry) })) ?? [])
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
function capBlock(value: number | null): void {
  const block = JSON.parse(JSON.stringify(model.block)) as MonsterData
  if (value === null) {
    if (block.overrides) {
      delete block.overrides.hpMax
      if (Object.keys(block.overrides).length === 0) delete block.overrides
    }
  } else {
    block.overrides = { ...(block.overrides ?? {}), hpMax: value }
  }
  model.block = block
}
function commitHpEdit(payload: { hp: Partial<PersonHp>; cap: number | null }): void {
  if (readOnly.value) return
  const before = clonePerson(model)
  try {
    if (personId.value && !props.libraryMode) people.setLive(personId.value, { hp: payload.hp })
    applyLive({ hp: payload.hp })
    capBlock(payload.cap)
    const after = clonePerson(model)
    if (JSON.stringify(before) !== JSON.stringify(after)) undo.value = pushUndo(undo.value, { kind: 'draft', before, after, liveBefore: livePatchOf(before) })
  } catch (error) {
    toast.error(`没能改动生命：${errorText(error)}`)
  }
}
function commitDraft(patch: Partial<Person>, fields: string[]): void {
  if (readOnly.value) return
  const before = clonePerson(model)
  for (const field of fields) {
    if (field === 'block' && patch.block) model.block = patch.block
    else if (field in patch) (model as unknown as Record<string, unknown>)[field] = (patch as Record<string, unknown>)[field]
  }
  if (JSON.stringify(before) === JSON.stringify(model)) return
  undo.value = pushUndo(undo.value, { kind: 'draft', before, after: clonePerson(model) })
}
function commitBlock(block: MonsterData): void { commitDraft({ block }, ['block']) }
function commitName(value: string): void { commitDraft({ name: value }, ['name']) }
function commitNameEn(value: string): void { commitDraft({ nameEn: value }, ['nameEn']) }
function undoOnce(): void {
  const action = undo.value[undo.value.length - 1]
  if (!action) return
  undo.value = undo.value.slice(0, -1)
  if (action.kind === 'draft') {
    try {
      if (action.liveBefore && personId.value && !props.libraryMode) people.setLive(personId.value, action.liveBefore)
    } catch (error) {
      toast.error(`没能撤销：${errorText(error)}`)
    }
    Object.assign(model, clonePerson(action.before))
    return
  }
  try {
    if (personId.value) people.setLive(personId.value, livePatchOf(action.before))
    applyLive(livePatchOf(action.before))
  } catch (error) {
    toast.error(`没能撤销：${errorText(error)}`)
  }
}
function save(): void {
  if (!canSave.value) return
  try {
    if (props.libraryMode) {
      baseline.value = clonePerson(model)
      undo.value = []
      emit('saved', clonePerson(model))
      return
    }
    if (!personId.value) {
      const created = people.create(clonePerson(model))
      baseline.value = clonePerson(created)
      personId.value = created.id
      undo.value = []
      toast.success(`已保存 ${created.name}`)
      emit('saved', created)
      return
    }
    if (dirty.value.length) {
      const saved = people.saveDraft(personId.value, draftPatchOf(model, dirty.value))
      baseline.value = clonePerson(saved)
      Object.assign(model, clonePerson(saved))
      undo.value = []
      toast.success(`已保存 ${saved.name}`)
      emit('saved', saved)
      return
    }
    toast.success(`已保存 ${model.name}`)
    emit('saved', { ...clonePerson(model) })
  } catch (error) {
    toast.error(`没能保存：${errorText(error)}`)
  }
}
function openIdentity(): void {
  if (!cardData.value) return
  openPage({
    key: `person-identity-${model.id}`, title: '身份', component: markRaw(IdentityDrawer), variant: 'drawer', width: 480,
    props: {
      person: model, data: cardData.value, avatarUrl: avatarUrl.value, readOnly: readOnly.value, nameError: model.name.trim() ? '' : '名字不能为空',
      onName: commitName, onNameEn: commitNameEn, onBlock: commitBlock, onUpload: uploadAvatar, onRecrop: openRecrop, onClear: clearAvatar,
    },
  })
}
function openRecrop(): void {
  if (!model.avatarSource) return
  const source = model.avatarSource
  modal.push({
    key: `person-recrop-${model.id}`, title: '重新截取头像', component: markRaw(RecropPage), variant: 'drawer', width: 480,
    props: {
      avatarSource: source, readOnly: readOnly.value,
      onApply: (avatar: { $asset: string }, next: typeof source) => {
        commitDraft({ avatar, avatarSource: next }, ['avatar', 'avatarSource'])
        toast.success('头像已更新')
      },
    },
  })
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
  } finally {
    avatarBusy.value = false
  }
}
function clearAvatar(): void {
  commitDraft({ avatar: undefined, avatarSource: undefined }, ['avatar', 'avatarSource'])
}
function applyTemplate(block: MonsterData, name: string): void {
  const before = clonePerson(model)
  if (!model.name.trim()) model.name = name
  model.block = JSON.parse(JSON.stringify(block)) as MonsterData
  undo.value = pushUndo(undo.value, { kind: 'draft', before, after: clonePerson(model) })
  toast.success(`已套用 ${name}，不满意点撤销`)
}
function openTemplate(): void {
  openPage({
    key: `person-template-${model.id}`, title: '模板', component: markRaw(TemplatePicker), header: markRaw(TemplateHeadHint), variant: 'dialog',
    props: { mode: 'apply', onApply: applyTemplate },
  })
}
function openSaveLibrary(): void {
  modal.open({ key: `person-save-${model.id}`, title: '存入我的库', component: markRaw(SaveToLibrary), props: { person: clonePerson(model) }, variant: 'dialog' })
}
function onMenu(key: string): void {
  if (key === 'save-lib') { openSaveLibrary(); return }
  if (!personId.value || props.libraryMode) return
  if (key === 'copy') {
    const copy = people.duplicate(personId.value)
    toast.success(`已复制：${copy.name}`)
    emit('saved', copy)
    return
  }
  if (key === 'trash') {
    people.trash([personId.value])
    toast.undoable(`已移到回收站：${model.name}`, () => people.restore([personId.value!]))
    emit('back')
    return
  }
  if (key.startsWith('give:')) {
    const value = key.slice(5) as Person['giveAi']
    try {
      people.save(personId.value, { giveAi: value })
      model.giveAi = value
      toast.success('已更新给 AI 的方式')
    } catch (error) {
      toast.error(`没能更新：${errorText(error)}`)
    }
  }
}
function prefill(kind: 'check' | 'save' | 'skill' | 'initiative', bonus: number | null, label: string): void {
  if (bonus === null) return
  dice.prefill({ expression: `1d20${bonus >= 0 ? '+' : ''}${bonus}`, note: `${model.name} ${label}`, object: model.name, type: kind, item: label, bonus })
}
function onCheck(ability: AbilityKey): void {
  if (!derived.value) return
  const value = derived.value.abilities[ability].modifier
  prefill('check', value, `${ABILITY_LABELS[ability]}检定`)
}
function onSave(ability: AbilityKey): void {
  if (!derived.value) return
  prefill('save', derived.value.saves[ability].value, `${ABILITY_LABELS[ability]}豁免`)
}
function onInitiative(): void {
  if (!derived.value) return
  prefill('initiative', derived.value.initiative.value, '先攻')
}
function placeholder(kind: string): void {
  toast.info(kind === 'rest' ? '短休、长休在之后的「活动」里做。现在请直接改生命、生命骰、法术位。' : kind === 'custom' ? '这个面板之后再做。' : '升级、降级面板之后再做。现在请直接改生命、属性。')
}
function scrollIdentity(): void {
  identityEl.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}
function updateMini(): void {
  if (!identityEl.value) return
  showMini.value = identityEl.value.getBoundingClientRect().top < 54
}
function onKey(event: KeyboardEvent): void {
  if (!((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z')) return
  event.preventDefault()
  undoOnce()
}
onMounted(async () => {
  const shadow = root.value?.getRootNode()
  if (shadow instanceof ShadowRoot && !shadow.querySelector('style[data-u5-card]')) {
    const style = document.createElement('style'); style.dataset.u5Card = ''; style.textContent = cardCss; shadow.append(style)
  }
  scrollTarget = (root.value?.closest('.trpg-content') as HTMLElement | null) ?? window
  scrollHandler = updateMini
  scrollTarget.addEventListener('scroll', scrollHandler, { passive: true })
  window.addEventListener('keydown', onKey)
  void app.svc().db.getMeta<boolean>('u5CardIntroSeen').then((seen) => {
    if (seen) return
    toast.status('带小骰子的数字点一下去骰盘；✎ 改数值；＋ 加一项；？ 看怎么用')
    void app.svc().db.setMeta('u5CardIntroSeen', true)
  }).catch((error) => console.warn('[trpg-assistant] 记录人物卡提示失败', error))
  await nextTick()
  updateMini()
  try {
    cardData.value = await loadCardData(model, props.libraryMode ? [] : campaign.workspace?.enabledPacks.map((pack) => pack.id) ?? [], campaign.workspace?.ruleId ?? 'dnd5e2014')
  } catch (error) {
    console.error('[trpg-assistant] 读取人物卡资料失败', error)
    toast.error(`读取人物资料失败：${errorText(error)}`)
  } finally {
    loading.value = false
  }
})
onBeforeUnmount(() => {
  if (scrollTarget && scrollHandler) scrollTarget.removeEventListener('scroll', scrollHandler)
  window.removeEventListener('keydown', onKey)
})
function pickAvatar(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) void uploadAvatar(file)
}
</script>

<template>
  <div ref="root" class="trpg-person-card" data-testid="person-card">
    <CardTopbar :name="model.name" :context="libraryMode ? `库里的「${model.name}」` : ''" :context-hint="libraryMode ? '改了不影响已经加进战役的人' : ''" :context-short="libraryMode ? `库·${model.name}` : ''" :back-label="libraryMode ? '我的资料' : '人物'" :dirty-count="dirtyCount" :can-undo="canUndo" :can-save="canSave" :read-only="readOnly" :library-mode="!!libraryMode" :show-name="showMini" :menu-items="menuItems" @back="emit('back')" @undo="undoOnce" @save="save" @menu="onMenu" />
    <p v-if="libraryMode" class="trpg-card-library-note">库里的「{{ model.name }}」 · 改了不影响已经加进战役的人</p>
    <button v-if="showMini" class="trpg-mini-bar" type="button" @click="scrollIdentity">{{ model.name }} · {{ model.hp.current ?? derived?.hp.value ?? '' }}/{{ derived?.hp.value ?? '' }} · AC {{ derived?.ac.value ?? '' }}<span>▾</span></button>
    <main class="trpg-card-page">
      <div v-if="loading || !derived" class="trpg-card-skeleton" aria-busy="true"><span class="trpg-skeleton" /><span class="trpg-skeleton" /><span class="trpg-skeleton" /></div>
      <div v-else class="trpg-card-grid">
        <section ref="identityEl" class="trpg-card-a" data-testid="person-card-a">
          <IdentityBlock :person="model" :avatar-url="avatarUrl" :identity="identity" :template-name="templateName" :cr-text="crText" :read-only="readOnly" @identity="openIdentity" @avatar="avatarPicker?.click()" @template="openTemplate" @inspiration="commitLive({ inspiration: !model.inspiration })" @placeholder="placeholder" @tab="page = $event" />
          <VitalsBlock :person="model" :hp="derived.hp" :read-only="readOnly" @live="commitLive" @commit="commitHpEdit" @placeholder="placeholder" />
          <ReadoutBlock :derived="derived" :level="derived.level" :cr-text="crText" @initiative="onInitiative" />
        </section>
        <AbilityCards class="trpg-card-b" :derived="derived" :read-only="readOnly" @check="onCheck" @save="onSave" />
        <StatusRows class="trpg-card-c" :person="model" :derived="derived" :conditions="conditions" :spells="spells" :read-only="readOnly" :effect-summary="(ref) => cardData?.effectSummary(ref) ?? ''" @live="commitLive" @placeholder="placeholder" />
        <ArchiveStrip class="trpg-card-d" :person="model" :name-of="(id) => cardData?.nameOf(id) ?? id ?? ''" />
        <PageTabs v-model="page" class="trpg-card-e" />
        <section class="trpg-card-f" data-testid="person-card-placeholder"><EmptyState icon="books" text="本分页尚未开放" /></section>
      </div>
    </main>
    <input ref="avatarPicker" class="trpg-sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" tabindex="-1" aria-hidden="true" @change="pickAvatar" />
  </div>
</template>
